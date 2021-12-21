//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.sys.defineMethod('fetchScriptInto',
function(aURI, aDocument, aRequest, scriptElemAttrs, isECMAModule) {

    /**
     * @method fetchScriptInto
     * @summary Loads the uri provided (which should be a JavaScript uri) into
     *     the supplied document's context. Note that this call is done in a
     *     asynchronous fashion, returning a Promise, although a callback
     *     function may be provided in the optional request object. The callback
     *     will have a single argument, either the script element that was
     *     created for the fetched script or the ECMAScript Module object that
     *     was defined.
     * @param {TP.uri.URI|String} aURI A TP.uri.URI or String referencing the
     *     script location.
     * @param {Document} [aDocument=document] The document to add the script
     *     code to. This defaults to the code frame document.
     * @param {TP.sig.Request|TP.core.Hash} [aRequest] A optional set of request
     *     parameters. The only meaningful one here is 'callback' which should
     *     point to a function to call on complete.
     * @param {TP.core.Hash} [scriptElemAttrs] A optional hash of attributes to
     *     put on generated script elements.
     * @param {Boolean} [isECMAModule=false] Whether or not the script being
     *     fetched is written as an ECMAScript Module.
     * @returns {Promise} A promise which resolves based on success.
     */

    var url,

        doc,

        request,

        callback,

        docHead,

        targetLoc,

        newPromise;

    url = TP.uc(aURI);
    if (TP.notValid(url)) {
        this.raise('TP.sig.InvalidURI');

        return TP.extern.Promise.reject(new Error('InvalidURI'));
    }

    //  Adjust the path per any rewrite rules in place for the URI. Note that we
    //  only do this if the url is absolute.
    if (TP.uriIsAbsolute(url.getLocation())) {
        url = url.rewrite();
    }

    //  Default the document to the code frame document.
    doc = TP.ifInvalid(aDocument, document);

    request = TP.request(aRequest);
    TP.ifInfo() ? TP.info('Fetching script: ' +
                            TP.str(url) +
                            ' into: ' +
                            TP.gid(doc)) : 0;

    //  Grab any callback that was defined by the request
    callback = TP.ifKeyInvalid(request, 'callback', null);

    docHead = TP.documentEnsureHeadElement(doc);

    targetLoc = url.getLocation();

    //  If the script to be fetched is modeled as an ECMA6 module, then we use
    //  the TIBET 'importModule' call, which is smart around inlined vs.
    //  non-inlined and HTTP vs. non-HTTP loading.
    if (isECMAModule) {
        newPromise = TP.extern.Promise.construct(
            function(resolver, rejector) {
                return TP.sys.importModule(targetLoc).then(
                    function(moduleObj) {
                        //  If the request provided a callback, then use it.
                        if (TP.isCallable(callback)) {
                            callback(moduleObj);
                        }

                        request.complete(moduleObj);

                        return resolver(moduleObj);
                    });
            }).catch(
                function(e) {
                    TP.ifError() ?
                        TP.error('Error loading module: ' + targetLoc + ' ' +
                                    TP.str(e)) : 0;
                });
    } else {
        newPromise = TP.extern.Promise.construct(
            function(resolver, rejector) {
                var loadedCB,
                    scriptElem,

                    err;

                loadedCB = function() {

                    var req;

                    //  Start by removing the 'onload' handler from our script
                    //  element.
                    scriptElem.removeEventListener('load', loadedCB, false);

                    //  Activate any "awakening logic" specific to the script.
                    req = TP.request();
                    req.atPut('node', scriptElem);
                    TP.html.script.tagAttachDOM(req);

                    //  If the request provided a callback, then use it.
                    if (TP.isCallable(callback)) {
                        callback(scriptElem);
                    }

                    //  Complete the request and resolve the Promise with the
                    //  script element that the script is loaded into.

                    request.complete(scriptElem);

                    return resolver(scriptElem);
                };

                //  Construct an XHTML script element on the supplied document
                //  and will the target location.
                scriptElem = TP.documentConstructScriptElement(
                                        doc,
                                        targetLoc);

                //  Mark this element as one that was generated by TIBET and
                //  shouldn't be considered in CSS queries, etc.
                scriptElem[TP.GENERATED] = true;

                //  If additional script element attributes were supplied, then
                //  put them on the script element.
                if (TP.notEmpty(scriptElemAttrs)) {
                    TP.elementSetAttributes(scriptElem, scriptElemAttrs, true);
                }

                //  Set our loaded callback as the 'onload' handler for the
                //  script element.
                scriptElem.addEventListener('load', loadedCB, false);

                if (TP.notValid(scriptElem) || TP.isError(scriptElem)) {
                    err = new Error('Error fetching source URL: ' + targetLoc);
                    request.fail(err.message, err);

                    return rejector(err);
                }

                //  Append it into the document head - this will start the
                //  loading process.
                TP.nodeAppendChild(docHead, scriptElem, false);
            }).catch(
                function(e) {
                    TP.ifError() ?
                        TP.error('Error loading script: ' + targetLoc + ' ' +
                                    TP.str(e)) : 0;
                });
    }

    return newPromise;
}, {
    dependencies: [TP.extern.Promise]
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('fetchScriptsInto',
function(aURIList, aDocument, aRequest, scriptElemAttrs, isECMAModule) {

    /**
     * @method fetchScriptInto
     * @summary Loads the uris provided (which should be JavaScript uris) into
     *     the supplied document's context. Note that this call is done in a
     *     asynchronous fashion, returning a Promise, although a callback
     *     function may be provided in the optional request object. The callback
     *     will have a single argument, an Array of either the script elements
     *     that were created for the fetched scripts or the ECMAScript Module
     *     objects that were defined.
     * @param {TP.uri.URI[]|String[]} aURIList A list of TP.uri.URIs or Strings
     *     referencing the module locations.
     * @param {Document} [aDocument=document] The document to add the script
     *     code to. This defaults to the code frame document.
     * @param {TP.sig.Request|TP.core.Hash} [aRequest] A optional set of request
     *     parameters. The only meaningful one here is 'callback' which should
     *     point to a function to call on complete.
     * @param {TP.core.Hash} [scriptElemAttrs] A optional hash of attributes to
     *     put on generated script elements.
     * @param {Boolean} [isECMAModule=false] Whether or not the script being
     *     fetched is written as an ECMAScript Module.
     * @returns {Promise} A promise which resolves based on success.
     */

    var req,
        promises;

    req = TP.request(aRequest);

    //  Iterate over the list of supplied specifiers and gather Promises that
    //  represent the loading of those specifiers.
    promises = aURIList.map(
                function(aURI) {
                    var childReq;

                    childReq = TP.request(aRequest.getPayload());
                    req.andJoinChild(childReq);

                    return TP.sys.fetchScriptInto(
                            aURI,
                            aDocument,
                            childReq,
                            scriptElemAttrs,
                            isECMAModule);
                });

    //  Return the Promise generated by Promise.all that returns a Hash of
    //  script elements or modules that have their specifier as the key and
    //  the module
    return TP.extern.Promise.all(promises).then(
        function(response) {
            var elemsOrModules;

            elemsOrModules = TP.hc();

            //  Iterate over the response and put each script element or module
            //  in the result hash, keyed by specifier.
            response.forEach(
                function(aScriptElementOrModule, index) {
                    elemsOrModules.atPut(aURIList.at(index),
                                            aScriptElementOrModule);
                });

            return elemsOrModules;
        });
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getAllScriptPaths',
async function(packageConfig, phase, useCache) {

    /**
     * @method getAllScriptPaths
     * @summary Returns all script paths found in the supplied package and
     *     config.
     * @param {String} packageConfig The package name to locate and import along
     *     with an optional [@config] section. For example 'hello@base'.
     * @param {String} [phase] Optional phase specifier. Use TP.PHASE_ONE or
     *     TP.PHASE_TWO to set a specific phase. Default is both.
     * @param {Boolean} [useCache=true] Should packages containing the scripts
     *     use the boot system package cache. If false, the supplied package
     *     will be flushed from the cache and reloaded.
     * @returns {String[]} An Array of script paths in the supplied package and
     *     config.
     */

    var packageProfile,
        packageProfileParts,

        pkgName,
        cfgName,

        uri,

        packageParts,
        packageName,
        configName,

        packageAssets,
        packageScriptPaths,

        phaseOne,
        phaseTwo;

    //  Process the incoming package@config value.
    packageParts = packageConfig.split('@');
    packageName = packageParts.first();
    configName = packageParts.last();

    //  Default the packageName and configName to what can be extracted from the
    //  build profile.
    packageProfile = TP.sys.cfg('build.profile', 'main@base');
    packageProfileParts = packageProfile.split('@');

    pkgName = TP.ifEmpty(packageName, packageProfileParts.first());
    cfgName = TP.ifEmpty(configName, packageProfileParts.last());

    //  Normalize the incoming package name to produce a viable config file.
    uri = TP.uriExpandPath(pkgName);
    if (!TP.isURIString(uri)) {
        uri = TP.uriJoinPaths('~app_cfg', uri);
    }

    if (TP.isEmpty(TP.uriExtension(uri))) {
        uri += '.xml';
    }

    //  Get the full list of package script files. This defines the list of
    //  scripts the system will accept for importing.
    try {
        phaseOne = TP.sys.cfg('boot.phase_one');
        phaseTwo = TP.sys.cfg('boot.phase_two');

        TP.sys.setcfg('boot.phase_one',
            TP.isValid(phase) ? phase === TP.PHASE_ONE : true);
        TP.sys.setcfg('boot.phase_two',
            TP.isValid(phase) ? phase === TP.PHASE_TWO : true);
        packageAssets = await TP.boot.$listPackageAssets(
                                        uri, cfgName, null, useCache);
    } catch (e) {
        //  Could be an unloaded/unexpanded manifest...meaning we can't really
        //  tell what the script list is.
        return null;
    } finally {
        TP.sys.setcfg('boot.phase_one', phaseOne);
        TP.sys.setcfg('boot.phase_two', phaseTwo);
    }

    //  Normalize the list of scripts (and filter out any asset that doesn't
    //  have a 'src' - which means it's not a script).
    packageScriptPaths = packageAssets.map(
                            function(node) {
                                var tn,
                                    src;

                                tn = node.tagName.toLowerCase();
                                if (tn !== 'script') {
                                    return '';
                                }

                                src = node.getAttribute('src');
                                if (src) {
                                    return TP.boot.$getFullPath(node, src);
                                }

                                return '';
                            });

    //  Remove any empty paths
    TP.compact(packageScriptPaths, TP.isEmpty);

    return packageScriptPaths;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getAllPackagePaths',
async function(packageConfig, phase, useCache) {

    /**
     * @method getAllPackagePaths
     * @summary Returns all package paths found in the supplied package and
     *     config.
     * @param {String} packageConfig The package name to locate and import along
     *     with an optional [@config] section. For example 'hello@base'.
     * @param {String} [phase] Optional phase specifier. Use TP.PHASE_ONE or
     *     TP.PHASE_TWO to set a specific phase. Default is both.
     * @param {Boolean} [useCache=true] Should packages containing the scripts
     *     use the boot system package cache. If false, the supplied package
     *     will be flushed from the cache and reloaded.
     * @returns {String[]} An Array of package paths in the supplied package and
     *     config.
     */

    var packageProfile,
        packageProfileParts,

        packageParts,
        packageName,
        configName,

        pkgName,
        cfgName,

        uri,

        packageAssets,
        packagePackagePaths,

        phaseOne,
        phaseTwo;

    //  Process the incoming package@config value.
    packageParts = packageConfig.split('@');
    packageName = packageParts.first();
    configName = packageParts.last();

    //  Default the packageName and configName to what can be extracted from the
    //  build profile.
    packageProfile = TP.sys.cfg('build.profile', 'main@base');
    packageProfileParts = packageProfile.split('@');

    pkgName = TP.ifEmpty(packageName, packageProfileParts.first());
    cfgName = TP.ifEmpty(configName, packageProfileParts.last());

    //  Normalize the incoming package name to produce a viable config file.
    uri = TP.uriExpandPath(pkgName);
    if (!TP.isURIString(uri)) {
        uri = TP.uriJoinPaths('~app_cfg', uri);
    }

    if (TP.isEmpty(TP.uriExtension(uri))) {
        uri += '.xml';
    }

    //  Get the full list of package package files. This defines the list of
    //  packages the system will use for importing.
    try {
        phaseOne = TP.sys.cfg('boot.phase_one');
        phaseTwo = TP.sys.cfg('boot.phase_two');

        TP.sys.setcfg('boot.phase_one',
            TP.isValid(phase) ? phase === TP.PHASE_ONE : true);
        TP.sys.setcfg('boot.phase_two',
            TP.isValid(phase) ? phase === TP.PHASE_TWO : true);
        packageAssets = await TP.boot.$listPackageAssets(
                                        uri, cfgName, null, useCache, true);
    } catch (e) {
        //  Could be an unloaded/unexpanded manifest...meaning we can't really
        //  tell what the script list is.
        return null;
    } finally {
        TP.sys.setcfg('boot.phase_one', phaseOne);
        TP.sys.setcfg('boot.phase_two', phaseTwo);
    }

    //  Normalize the list of packages (and filter out any asset that doesn't
    //  have a 'src' - which means it's not a package).
    packagePackagePaths = packageAssets.map(
                            function(node) {
                                var tn,
                                    src;

                                tn = node.tagName.toLowerCase();
                                if (tn !== 'package') {
                                    return '';
                                }

                                src = node.getAttribute('src');
                                if (src) {
                                    return TP.boot.$getFullPath(node, src);
                                }

                                return '';
                            });

    //  Remove any empty paths
    TP.compact(packagePackagePaths, TP.isEmpty);

    return packagePackagePaths;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getUsedScriptPaths',
function() {

    /**
     * @method getUsedScriptPaths
     * @summary Returns a list of source file paths that are currently being
     *     used by the system. This is determined by looking at all of the
     *     methods that were invoked and their source paths.
     * @description This method requires the 'oo.$$track_invocations' flag to be
     *     true, otherwise there will be no data for this method to use for its
     *     computation and it return an empty hash.
     * @returns {String[]} An Array of script paths that are used in the
     *     currently running system.
     */

    var usedMethods,
        usedMethodPaths,

        expandedPaths;

    if (TP.isFalse(TP.sys.cfg('oo.$$track_invocations'))) {
        TP.ifError() ?
            TP.error('Attempt to retrieve used types when invocation' +
                        ' data isn\'t available.') : 0;
        return null;
    }

    //  Collect all of the paths of the used methods.
    usedMethods = TP.sys.getUsedMethods();

    //  Collect up all of their source paths.
    usedMethodPaths = usedMethods.collect(
                        function(kvPair) {

                            var methodPath;

                            methodPath = kvPair.last()[TP.SOURCE_PATH];
                            return methodPath;
                        });

    usedMethodPaths.unique();
    TP.compact(usedMethodPaths, TP.isEmpty);

    //  Expand all of the paths for consistency.
    expandedPaths = usedMethodPaths.collect(
                                function(aPath) {
                                    return TP.uriExpandPath(aPath);
                                });

    return expandedPaths;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getUsedPackagingInfo',
function() {

    /**
     * @method getUsedPackagingInfo
     * @summary Returns a hash that has two Arrays: one of packages of code that
     *     are used and can be represented by 'package' definitions and one of
     *     'extra' source file paths for code that is used but is outside of
     *     those packages.
     * @description This method requires the 'oo.$$track_invocations' flag to be
     *     true, otherwise there will be no data for this method to use for its
     *     computation and it returns an empty hash.
     * @returns {TP.core.Hash} A hash of two Arrays of paths to code used by the
     *     system - one for packages and one for 'extra' source files outside of
     *     those packages.
     */

    var usedMethods,
        entries,

        packageEntries,
        len,

        extraSourceEntries;

    if (TP.isFalse(TP.sys.cfg('oo.$$track_invocations'))) {
        TP.ifError() ?
            TP.error('Attempt to retrieve used types when invocation' +
                        ' data isn\'t available.') : 0;
        return null;
    }

    //  Get all of the used methods.
    usedMethods = TP.sys.getUsedMethods();

    entries = TP.ac();

    //  Iterate over all of the used method records and grab any dependencies
    //  that that method might be dependent on.
    usedMethods.perform(
        function(kvPair) {

            var methodObj;

            methodObj = kvPair.last();

            entries.push(methodObj.getDependencies());
        });

    entries = entries.flatten();

    //  Concatenate all of the dependency entries that were manually registered
    //  by the system. These are needed, for instance, for types that are used
    //  for custom tags, but no methods on them are ever invoked.
    entries = entries.concat(TP.sys.getManualDependencies());

    //  Unique the entries by their OID (which could either be an '$$oid' slot
    //  or their SOURCE_PATH).
    entries.unique();

    //  Sort the remaining entries by their load order.
    entries.sort(function(entryA, entryB) {
        return entryA[TP.LOAD_INDEX] - entryB[TP.LOAD_INDEX];
    });

    //  Collect up all of the entries that are 'whole package' entries.
    packageEntries = entries.select(
                            function(anEntry) {
                                return TP.isValid(anEntry.wholePackageInfo);
                            });

    len = packageEntries.getSize();

    //  Now, iterate over all of the entries and collect up all of the source
    //  paths for the objects that are *not* represented in one of the 'whole
    //  package entries'
    extraSourceEntries = TP.ac();
    entries.perform(
        function(anEntry) {
            var i,
                entry;

            if (TP.isString(anEntry)) {
                entry = TP.bySystemId(anEntry);
                if (TP.notValid(entry)) {
                    /* eslint-disable no-console */
                    console.error('Undefined object dependency ' + anEntry);
                    /* eslint-enable no-console */
                }
            } else {
                entry = anEntry;
            }

            //  If the entry is a 'whole package' entry, then just move to the
            //  next one.
            if (TP.isValid(entry.wholePackageInfo)) {
                return;
            }

            //  If there are no 'whole package' entries, then just add the
            //  source path of the entry and move on.
            if (len === 0) {
                extraSourceEntries.push(entry);
                return;
            }

            //  Otherwise, iterate over all of the 'whole package' entries. If
            //  both the TP.SOURCE_PACKAGE and the TP.SOURCE_CONFIG from the
            //  entry are also represented by one of the 'whole package'
            //  entries, then we do *not* add that source path to the list of
            //  source paths. It will be represented by the package.
            for (i = 0; i < len; i++) {
                /* eslint-disable brace-style */
                if (entry[TP.SOURCE_PACKAGE] ===
                        packageEntries.at(i)[TP.SOURCE_PACKAGE] &&
                    entry[TP.SOURCE_CONFIG] ===
                        packageEntries.at(i)[TP.SOURCE_CONFIG])
                {
                    return;
                }
                /* eslint-enable brace-style */
            }

            extraSourceEntries.push(entry);
        });

    //  Since all entries were sorted above, this should only remove duplicate
    //  entries with higher load order numbers than the first entry.
    extraSourceEntries.unique(
                    function(anEntry) {
                        return anEntry[TP.SOURCE_PATH];
                    });

    TP.compact(extraSourceEntries,
                function(anEntry) {
                    return TP.isEmpty(anEntry[TP.SOURCE_PATH]);
                });

    //  Expand the source path for consistency and assign that to the 'packaging
    //  representation'.
    extraSourceEntries.forEach(
                function(anEntry) {
                    anEntry[TP.PACKAGING_REP] =
                        TP.uriExpandPath(anEntry[TP.SOURCE_PATH]);
                });

    //  'Stringify' the package entries into the canonical TIBET format for
    //  them and assign that to the 'packaging representation'.
    packageEntries.forEach(
                function(aPackageEntry) {
                    aPackageEntry[TP.PACKAGING_REP] =
                        TP.uriExpandPath(aPackageEntry[TP.SOURCE_PACKAGE]) +
                            '@' +
                            aPackageEntry[TP.SOURCE_CONFIG];
                });

    return TP.hc('wholePackageEntries', packageEntries,
                    'extraSourceEntries', extraSourceEntries);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMissingPackagingInfo',
async function(packageConfig) {

    /**
     * @method getMissingPackagingInfo
     * @summary Returns a hash that has two Arrays: one of packages of code that
     *     are used and can be represented by 'package' definitions, but are
     *     missing from the supplied package/config combo and one of 'extra'
     *     source file paths for code that is used but is outside of those
     *     packages and are also missing from the supplied package/config combo.
     * @description This method requires the 'oo.$$track_invocations' flag to be
     *     true, otherwise there will be no data for this method to use for its
     *     computation and it returns an empty hash.
     * @param {String} packageConfig The package name to locate and import along
     *     with an optional [@config] section. For example 'hello@base'.
     * @returns {TP.core.Hash} A hash of two Arrays of paths to code used by the
     *     system - one for packages and one for 'extra' source files outside of
     *     those packages - but are missing from the supplied package/config
     *     combo.
     */

    var usedMethodInfo,
        usedMethodEntries,

        configScriptPaths,
        missingScriptEntries,

        filters,
        filteredScriptEntries,

        allPackagePaths,

        usedPackageEntries,
        missingPackageEntries,
        filteredPackageEntries;

    if (TP.isFalse(TP.sys.cfg('oo.$$track_invocations'))) {
        TP.ifError() ?
            TP.error('Attempt to retrieve used types when invocation' +
                        ' data isn\'t available.') : 0;
        return null;
    }

    //  Grab all of the scripts paths that are currently used by the system.
    //  This uses invocation data to determine which methods got invoked and
    //  then messages them for their source paths.
    usedMethodInfo = TP.sys.getUsedPackagingInfo();

    usedMethodEntries = usedMethodInfo.at('extraSourceEntries');

    //  Grab all of the script paths in the named packages and configs. This
    //  will be all of the paths that are contained in that package and config.
    configScriptPaths = await TP.sys.getAllScriptPaths(packageConfig);

    //  Compute the config script paths against our master list of expanded
    //  paths. This will produce a list of paths that the system knows about
    //  given the runtime information of used types and methods but isn't
    //  represented in the supplied package and config.
    missingScriptEntries = TP.ac();
    usedMethodEntries.forEach(
        function(anEntry) {
            var rep;

            rep = anEntry[TP.PACKAGING_REP];

            if (!configScriptPaths.contains(rep)) {
                missingScriptEntries.push(anEntry);
            }
        });

    //  Filter out script paths for developer tools, boot system, etc. using a
    //  predetermined list of RegExps.
    filters = TP.EXCLUDE_INVOCATION_TRACKED_PATHS;
    filteredScriptEntries = missingScriptEntries.filter(
                                function(anEntry) {

                                    var rep,

                                        filterPath,

                                        len,
                                        i;

                                    rep = anEntry[TP.PACKAGING_REP];

                                    filterPath = false;

                                    len = filters.getSize();
                                    for (i = 0; i < len; i++) {
                                        if (filters.at(i).test(rep)) {
                                            filterPath = true;
                                            break;
                                        }
                                    }

                                    return !filterPath;
                                });

    //  We obtain all reachable package paths from the named packages and
    //  configs.
    usedPackageEntries = usedMethodInfo.at('wholePackageEntries');

    //  We obtain all reachable package paths from the named packages and
    //  configs.
    allPackagePaths = await TP.sys.getAllPackagePaths(packageConfig);

    //  Compute all package paths against our list of used package paths. This
    //  will produce a list of paths that the system knows about given the
    //  runtime information of used types and methods but isn't represented in
    //  the supplied package and config.
    missingPackageEntries = TP.ac();
    usedPackageEntries.forEach(
        function(anEntry) {
            var rep;

            rep = TP.uriExpandPath(anEntry[TP.SOURCE_PATH]);

            if (!allPackagePaths.contains(rep)) {
                missingPackageEntries.push(anEntry);
            }
        });

    //  Filter out package paths for developer tools, boot system, etc. using a
    //  predetermined list of RegExps.
    filters = TP.EXCLUDE_INVOCATION_TRACKED_PACKAGES;

    filteredPackageEntries = missingPackageEntries.filter(
                        function(anEntry) {

                            var rep,

                                filterPath,

                                len,
                                i;

                            rep = anEntry[TP.PACKAGING_REP];

                            filterPath = false;

                            len = filters.getSize();
                            for (i = 0; i < len; i++) {
                                if (filters.at(i).test(rep)) {
                                    filterPath = true;
                                    break;
                                }
                            }

                            return !filterPath;
                        });

    //  Return a hash containing the two arrays that we computed.
    return TP.hc('packageEntries', filteredPackageEntries,
                    'scriptEntries', filteredScriptEntries);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMethodUsage',
function() {

    var results;

    results = [];

    TP.sys.$$meta_methods.perform(
            function(kvPair) {

                var methodKey,
                    methodBody,

                    methodEntry;

                methodKey = kvPair.first();
                methodBody = kvPair.last();

                methodEntry = {
                    name: methodKey,
                    invocationCount: methodBody.invocationCount,
                    loadPath: methodBody[TP.LOAD_PATH],
                    loadPackage: methodBody[TP.LOAD_PACKAGE],
                    loadConfig: methodBody[TP.LOAD_CONFIG],
                    loadStage: methodBody[TP.LOAD_STAGE],
                    loadIndex: methodBody[TP.LOAD_INDEX],
                    sourcePath: methodBody[TP.SOURCE_PATH],
                    sourcePackage: methodBody[TP.SOURCE_PACKAGE],
                    sourceConfig: methodBody[TP.SOURCE_CONFIG]
                };

                results.push(methodEntry);
            });

    return results;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importModule',
function(aSpecifier) {

    /**
     * @method importModule
     * @summary Imports the uri provided (which should be an ECMAScript module
     *     uri) and returns the Module object in the Promise resolution
     *     callback.
     * @param {TP.uri.URI|String} aSpecifier A TP.uri.URI or String referencing
     *     the module location.
     * @returns {Promise} A promise which resolves based on success.
     */

    var specifier,

        url,

        targetLoc,
        blobUrl;

    specifier = TP.str(aSpecifier);

    //  If we didn't get a URL here, try to find an entry in the 'bare spec
    //  module map' that matches bare specifiers to URLs (our own version of the
    //  poorly defined HTML5 module loader import maps).
    if (!TP.isURIString(specifier, true)) {
        url = TP.boot.$moduleBareSpecMap[specifier];
        if (TP.boot.$isEmpty(url)) {
            this.raise(
                'TP.sig.URINotFound',
                'No entry for bare specifier: ' + specifier);
            return TP.extern.Promise.reject(new Error('InvalidURI'));
        }
        url = TP.uc(url);
    } else {
        url = TP.uc(specifier);

        //  Adjust the path per any rewrite rules in place for the URI. Note
        //  that we only do this if the url is absolute.
        if (TP.uriIsAbsolute(url.getLocation())) {
            url = url.rewrite();
        }
    }

    if (TP.notValid(url)) {
        this.raise('TP.sig.InvalidURI');

        return TP.extern.Promise.reject(new Error('InvalidURI'));
    }

    targetLoc = url.getLocation();

    //  If the URI is inlined, then we use the 'SystemJS' loader. This means
    //  that we're running in a packaged environment and our 'packaging' step
    //  will have inlined any ECMA modules and SystemJS will handle any pathing
    //  issues itself.
    if (TP.uriIsInlined(targetLoc)) {
        //  When the packages were built and the module content was inlined, the
        //  bare spec module map was populated with virtual URIs. Since SystemJS
        //  won't actually do expansion of those URIs and is just using them as
        //  a name to do module lookup, we have to use the virtual location
        //  here.
        targetLoc = url.getVirtualLocation();
        return TP.extern.System.import(targetLoc);
    }

    //  If we're not running in an inlined (i.e. 'packaged') environment, then
    //  we need to use the module definitions that the TIBET loader will have
    //  repackaged into 'blob' URLs.
    blobUrl = TP.boot.$moduleBlobURLMap[targetLoc];
    if (TP.isEmpty(blobUrl)) {
        this.raise('TP.sig.URINotFound', targetLoc);

        return TP.extern.Promise.reject(
                new Error('URINotFound: ' + targetLoc));
    }

    return import(blobUrl);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importModules',
function(aSpecifierList) {

    /**
     * @method importModules
     * @summary Imports the uris provided (which should all be URIs pointing
     *     to ECMAScript modules) and returns TP.core.Hash of keys with the
     *     specifier and values with the Module objects in the Promise
     *     resolution callback.
     * @param {TP.uri.URI[]|String[]} aSpecifierList A list of TP.uri.URIs or
     *     Strings referencing the module locations.
     * @returns {Promise} A promise which resolves based on success.
     */

    var promises;

    //  Iterate over the list of supplied specifiers and gather Promises that
    //  represent the loading of those specifiers.
    promises = aSpecifierList.map(
                function(specifier) {
                    return TP.sys.importModule(specifier);
                });

    //  Return the Promise generated by Promise.all that returns a Hash of
    //  modules that have their specifier as the key and the module
    return TP.extern.Promise.all(promises).then(
        function(response) {
            var modules;

            modules = TP.hc();

            //  Iterate over the response and put each module in the result
            //  hash, keyed by specifier.
            response.forEach(
                function(aModule, index) {
                    modules.atPut(aSpecifierList.at(index), aModule);
                });

            return modules;
        });
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importPackage',
async function(packageConfig, useCache, shouldSignal) {

    /**
     * @method importPackage
     * @summary Imports a specific package/config file's script resources. Note
     *     that when dealing with rollups this also includes the package's
     *     rolled up resources in the form of TP.uc() content.
     * @param {String} packageConfig The package name to locate and import along
     *     with an optional [@config] section. For example 'hello@base'.
     * @param {Boolean} [useCache=true] Should packages containing the scripts
     *     use the boot system package cache. If false, the supplied package
     *     will be flushed from the cache and reloaded.
     * @param {Boolean} [shouldSignal=false] Should scripts signal Change once
     *     they've completed their import process?
     * @returns {Promise} A promise which resolves based on success.
     */

    var packageScriptPaths,
        loadedScripts,
        missingScripts,

        promise;

    packageScriptPaths = await TP.sys.getAllScriptPaths(
                                        packageConfig, null, useCache);
    if (TP.isNull(packageScriptPaths)) {
        //  Could be an unloaded/unexpanded manifest...meaning we can't really
        //  tell what the script list is. Trigger a failure.
        return TP.extern.Promise.reject();
    }

    //  Determine which scripts haven't already been loaded.
    loadedScripts = TP.boot.$getLoadedScripts();
    missingScripts = packageScriptPaths.difference(loadedScripts);

    //  We need to import all of the scripts, but do so in a synchronous
    //  fashion. Otherwise, all of the load paths, etc. will be messed up
    //  because they'll just be the values for the last file loaded.
    promise = TP.extern.Promise.each(
                missingScripts,
                function(path) {

                    //  NB: TP.sys.importScript returns a Promise.
                    return TP.sys.importScript(
                            path,
                            TP.request('callback', function() {
                                var url;

                                loadedScripts.push(path);

                                if (shouldSignal) {
                                    url = TP.uc(path);
                                    url.$changed();
                                }
                            }));
                });

    //  Return a promise that resolves if all imports worked, or rejects if any
    //  of them failed.
    return promise;
}, {
    dependencies: [TP.extern.Promise]
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importScript',
function(aURI, aRequest) {

    /**
     * @method importScript
     * @summary Loads the uri provided (which should be a JavaScript uri),
     *     adding its code to the currently running application. Note that this
     *     call is done in a synchronous fashion, even though a callback
     *     function may be provided.
     * @param {TP.uri.URI|String} aURI A TP.uri.URI or String referencing the
     *     script location.
     * @param {TP.sig.Request|TP.core.Hash} [aRequest] A optional set of request
     *     parameters. The only meaningful one here is 'callback' which should
     *     point to a function to call on complete.
     * @returns {Promise} A promise which resolves based on success.
     */

    var url,
        request,

        callback,

        newPromise;

    url = TP.uc(aURI);
    if (TP.notValid(url)) {
        this.raise('TP.sig.InvalidURI');

        return TP.extern.Promise.reject(new Error('InvalidURI'));
    }

    //  Adjust the path per any rewrite rules in place for the URI. Note that we
    //  only do this if the url is absolute.
    if (TP.uriIsAbsolute(url.getLocation())) {
        url = url.rewrite();
    }

    request = TP.request(aRequest);
    TP.ifInfo() ? TP.info('Importing script URL: ' + TP.str(url)) : 0;

    //  Grab any callback that was defined by the request
    callback = TP.ifKeyInvalid(request, 'callback', null);

    newPromise = TP.extern.Promise.construct(
        function(resolver, rejector) {
            var targetLoc,

                loadedCB,
                scriptElem,

                err;

            targetLoc = url.getLocation();

            loadedCB = function() {

                var req;

                //  Activate any "awakening logic" specific to the script.
                req = TP.request();
                req.atPut('node', scriptElem);
                TP.html.script.tagAttachDOM(req);

                TP.signal(TP.sys,
                            'TP.sig.ScriptImported',
                            TP.hc('node', scriptElem));

                //  If the request provided a callback, then use it.
                if (TP.isCallable(callback)) {
                    callback(scriptElem);
                }

                //  Complete the request and resolve the Promise with the script
                //  element that the script is loaded into.

                request.complete(scriptElem);

                return resolver(scriptElem);
            };

            scriptElem = TP.boot.$sourceUrlImport(targetLoc, null, loadedCB);

            if (TP.notValid(scriptElem) || TP.isError(scriptElem)) {
                err = new Error('Error importing source URL: ' + targetLoc);
                request.fail(err);

                return rejector(err);
            }
        }).catch(
        function(err) {
            //  Make sure to fail our request in case it didn't get properly
            //  failed. If it's already completed this will be a no-op.
            if (TP.isValid(request)) {
                request.fail(err, err);
            }

            //  Be sure to throw here or invoking items like importPackage won't
            //  see the error, it's being caught here.
            if (TP.isValid(err)) {
                throw err;
            } else {
                throw new Error('ImportScriptError');
            }
        });

    return newPromise;
}, {
    dependencies: [TP.extern.Promise]
});

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('importSourceText',
function(targetUrl) {

    /**
     * @method importSourceText
     * @summary Imports a target script's text *asynchronously* and then adds
     *     that script source as inlined script source text that integrates the
     *     *text* of that with the JS with the currently running "image".
     * @param {String} targetUrl URL of the target resource.
     * @exception TP.sig.InvalidURI Raised when a valid URI has not been
     *     supplied to the method.
     * @returns {Element} The script element that was created to contain the
     *     source.
     */

    var url,
        request;

    url = TP.uc(targetUrl);
    if (!TP.isURI(url)) {
        this.raise('TP.sig.InvalidURI');

        return TP.extern.Promise.reject(new Error('InvalidURI'));
    }

    //  Adjust the path per any rewrite rules in place for the URI. Note
    //  that we only do this if the url is absolute
    if (TP.uriIsAbsolute(url.getLocation())) {
        url = url.rewrite();
    }

    request = TP.request('async', true,
                            'refresh', true,
                            'resultType', TP.TEXT,
                            'signalChange', false);
    TP.ifInfo() ? TP.info('Importing script text from URL: ' + TP.str(url)) : 0;

    return url.getResource(request).then(
        function(result) {
            var targetLoc,

                scriptElem,
                req;

            targetLoc = url.getLocation();

            scriptElem = TP.boot.$sourceImport(result, null, targetLoc);
            if (TP.notValid(scriptElem) || TP.isError(scriptElem)) {
                throw new Error('Error importing source text: ' + targetLoc);
            }

            //  Activate any "awakening logic" specific to the script.
            req = TP.request();
            req.atPut('node', scriptElem);
            TP.html.script.tagAttachDOM(req);

            TP.signal(TP.sys,
                        'TP.sig.ScriptImported',
                        TP.hc('node', scriptElem));

            return scriptElem;

        }).catch(
        function(err) {
            //  Make sure to fail our request in case it didn't get properly
            //  failed. If it's already completed this will be a no-op.
            if (TP.isValid(request)) {
                request.fail(err, err);
            }

            //  Be sure to throw here or invoking items like importPackage won't
            //  see the error, it's being caught here.
            if (TP.isValid(err)) {
                throw err;
            } else {
                throw new Error('ImportSourceTextError');
            }
        });
}, {
    dependencies: [TP.extern.Promise]
});

//  ------------------------------------------------------------------------
//  Package Information
//  ------------------------------------------------------------------------

TP.sys.defineMethod('getPackageChainPaths',
function(aTypeName) {

    /**
     * @method getPackageChainPaths
     * @summary Returns a 'hierarchical' chain of paths (location urls and
     *     configs) that loaded the supplied type name, from the 'root' package
     *     that the app is currently loading all the way down to the package
     *     that had the script entry that contained the supplied type.
     * @param {String} aTypeName The type name to resolve to a type and list the
     *     package chain paths for.
     * @exception TP.sig.InvalidType Raised when a valid type cannot be resolved
     *     from the type name provided to the method.
     * @returns {String[]|null} A list of the chain of package paths that loaded
     *     the type of the supplied type name.
     */

    var type,

        leafPackage,

        packageChainPaths;

    type = TP.sys.getTypeByName(aTypeName);

    if (!TP.isType(type)) {
        this.raise('TP.sig.InvalidType');
        return null;
    }

    //  Grab the package that the actual script entry that loaded the type was a
    //  part of.
    leafPackage = type[TP.LOAD_PACKAGE];
    if (TP.notEmpty(leafPackage)) {
        //  Grab the set of 'package paths' all the way from the 'root' down
        //  that loaded the type.
        packageChainPaths = TP.boot.$$packages[leafPackage].PACKAGE_CHAIN_PATHS;
    }

    if (TP.notValid(packageChainPaths)) {
        return TP.ac();
    }

    return packageChainPaths;
});

//  ------------------------------------------------------------------------
//  Synchronous Loading
//  ------------------------------------------------------------------------

TP.sys.defineMethod('require',
function(aTypeName) {

    /**
     * @method require
     * @summary Imports a type by name. If the type is already loaded the
     *     current type is returned unless shouldReload is set to true.
     * @param {String} aTypeName The type name to locate and import as needed.
     * @returns {TP.lang.RootObject} A Type object.
     */

    //  TODO:   formerly we'd check metadata for information on where to find a
    //  particular type and then we'd load that script. Until we add support for
    //  defer and type lists on manifest nodes we'll just stub as a replacement
    //  for getTypeByName.

    return TP.sys.getTypeByName(aTypeName);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
