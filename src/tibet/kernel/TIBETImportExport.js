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
function(aURI, aDocument, aRequest, scriptElemAttrs) {

    /**
     * @method fetchScriptInfo
     * @summary Loads the uri provided (which should be a JavaScript uri) into
     *     the supplied document's context. Note that this call is done in a
     *     synchronous fashion, even though a callback function may be provided.
     * @param {TP.uri.URI|String} aURI A TP.uri.URI or String referencing the
     *     script location.
     * @param {Document} aDocument The document to add the script code to.
     * @param {TP.sig.Request|TP.core.Hash} [aRequest] A optional set of request
     *     parameters. The only meaningful one here is 'callback' which should
     *     point to a function to call on complete.
     * @param {TP.core.Hash} [scriptElemAttrs] A optional hash of attributes to
     *     put on generated script elements.
     * @returns {Promise} A promise which resolved based on success.
     */

    var url,
        request,

        callback,

        docHead,

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
    TP.ifInfo() ? TP.info('Fetching script: ' +
                            TP.str(url) +
                            ' into: ' +
                            TP.gid(aDocument)) : 0;

    //  Grab any callback that was defined by the request
    callback = TP.ifKeyInvalid(request, 'callback', null);

    docHead = TP.documentEnsureHeadElement(aDocument);

    newPromise = TP.extern.Promise.construct(
        function(resolver, rejector) {
            var targetLoc,

                loadedCB,
                scriptElem,

                err;

            targetLoc = url.getLocation();

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

                //  Complete the request and resolve the Promise with the script
                //  element that the script is loaded into.

                request.complete(scriptElem);

                return resolver(scriptElem);
            };

            //  Construct an XHTML script element on the supplied document
            //  and will the target location.
            scriptElem = TP.documentConstructScriptElement(
                                    aDocument,
                                    targetLoc);

            //  If additional script element attributes were supplied, then put
            //  them on the script element.
            if (TP.notEmpty(scriptElemAttrs)) {
                TP.elementSetAttributes(scriptElem, scriptElemAttrs, true);
            }

            //  Set our loaded callback as the 'onload' handler for the
            //  script element.
            scriptElem.addEventListener('load', loadedCB, false);

            if (TP.notValid(scriptElem) || TP.isError(scriptElem)) {
                err = new Error('Error fetching source URL: ' + targetLoc);
                request.fail(err);

                return rejector(err);
            }

            //  Append it into the document head - this will start the
            //  loading process.
            TP.nodeAppendChild(docHead, scriptElem, false);
        });

    return newPromise;
}, {
    dependencies: [TP.extern.Promise]
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getAllScriptPaths',
function(packageConfig, phase) {

    /**
     * @method getAllScriptPaths
     * @summary Returns all script paths found in the supplied package and
     *     config.
     * @param {String} packageConfig The package name to locate and import along
     *     with an optional [@config] section. For example 'hello@base'.
     * @param {String} [phase] Optional phase specifier. Use TP.PHASE_ONE or
     *     TP.PHASE_TWO to set a specific phase. Default is both.
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
    //  packaging profile.
    packageProfile = TP.sys.cfg('project.packaging.profile', 'main@base');
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
        packageAssets = TP.boot.$listPackageAssets(uri, cfgName);
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
function(packageConfig, phase) {

    /**
     * @method getAllPackagePaths
     * @summary Returns all package paths found in the supplied package and
     *     config.
     * @param {String} packageConfig The package name to locate and import along
     *     with an optional [@config] section. For example 'hello@base'.
     * @param {String} [phase] Optional phase specifier. Use TP.PHASE_ONE or
     *     TP.PHASE_TWO to set a specific phase. Default is both.
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
    //  packaging profile.
    packageProfile = TP.sys.cfg('project.packaging.profile', 'main@base');
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
        packageAssets = TP.boot.$listPackageAssets(uri, cfgName, null, true);
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

    //  Unique the entries by their OID (which could either be an '$$oid' slot
    //  or their SOURCE_PATH.
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
function(packageConfig) {

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
    configScriptPaths = TP.sys.getAllScriptPaths(packageConfig);

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
    allPackagePaths = TP.sys.getAllPackagePaths(packageConfig);

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
                    sourcePath: methodBody[TP.SOURCE_PATH],
                    sourcePackage: methodBody[TP.SOURCE_PACKAGE],
                    sourceConfig: methodBody[TP.SOURCE_CONFIG]
                };

                results.push(methodEntry);
            });

    return results;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importPackage',
function(packageConfig, shouldSignal) {

    /**
     * @method importPackage
     * @summary Imports a specific package/config file's script resources. Note
     *     that when dealing with rollups this also includes the package's
     *     rolled up resources in the form of TP.uc() content.
     * @param {String} packageConfig The package name to locate and import along
     *     with an optional [@config] section. For example 'hello@base'.
     * @param {Boolean} [shouldSignal=false] Should scripts signal Change once
     *     they've completed their import process?
     * @returns {Promise} A promise which resolved based on success.
     */

    var packageScriptPaths,
        loadedScripts,
        missingScripts,

        promises;

    packageScriptPaths = TP.sys.getAllScriptPaths(packageConfig);
    if (TP.isNull(packageScriptPaths)) {
        //  Could be an unloaded/unexpanded manifest...meaning we can't really
        //  tell what the script list is. Trigger a failure.
        return TP.extern.Promise.reject();
    }

    //  Determine which scripts haven't already been loaded.
    loadedScripts = TP.boot.$$loadpaths;
    missingScripts = packageScriptPaths.difference(loadedScripts);

    //  Since importScript returns a promise we want to create a collection
    //  which we'll then resolve once all promises have completed in some form.
    promises = missingScripts.map(
                function(path) {
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
    //  of them failed. NOTE THAT FETCHING IS STILL HAPPENING ASYNCHRONOUSLY!
    return TP.extern.Promise.all(promises);
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
     * @returns {Promise} A promise which resolved based on success.
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
                request.fail(err);
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
                request.fail(err);
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
