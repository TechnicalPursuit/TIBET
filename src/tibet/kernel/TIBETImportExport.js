//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.sys.defineMethod('getAllScriptPaths',
function(packageName, configName) {

    /**
     * @method getAllScriptPaths
     * @summary Returns all script paths found in the supplied package and
     *     config.
     * @param {String} packageName The package name to locate and list script
     *     paths from.
     * @param {String} configName The config to load. Default is whatever is
     *     listed as the default for that package (usually base).
     * @returns {String[]} An Array of script paths in the supplied package and
     *     config.
     */

    var packageProfile,
        packageProfileParts,

        pkgName,
        cfgName,

        uri,

        packageAssets,
        packageScriptPaths,

        phaseOne,
        phaseTwo;

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
        TP.sys.setcfg('boot.phase_one', true);
        TP.sys.setcfg('boot.phase_two', true);
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
function(packageName, configName) {

    /**
     * @method getAllPackagePaths
     * @summary Returns all package paths found in the supplied package and
     *     config.
     * @param {String} packageName The package name to locate and list package
     *     paths from.
     * @param {String} configName The config to load. Default is whatever is
     *     listed as the default for that package (usually base).
     * @returns {String[]} An Array of package paths in the supplied package and
     *     config.
     */

    var packageProfile,
        packageProfileParts,

        pkgName,
        cfgName,

        uri,

        packageAssets,
        packagePackagePaths,

        phaseOne,
        phaseTwo;

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
        TP.sys.setcfg('boot.phase_one', true);
        TP.sys.setcfg('boot.phase_two', true);
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
     * @description This method requires the 'oo.$$track_invocation' flag to be
     *     true, otherwise there will be no data for this method to use for its
     *     computation and it return an empty hash.
     * @returns {String[]} An Array of script paths that are used in the
     *     currently running system.
     */

    var usedMethods,
        usedMethodPaths,

        expandedPaths;

    if (TP.isFalse(TP.sys.cfg('oo.$$track_invocation'))) {
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
     * @description This method requires the 'oo.$$track_invocation' flag to be
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

        extraSourcePaths,

        expandedSourcePaths,
        expandedPackagePaths;

    if (TP.isFalse(TP.sys.cfg('oo.$$track_invocation'))) {
        TP.ifError() ?
            TP.error('Attempt to retrieve used types when invocation' +
                        ' data isn\'t available.') : 0;
        return null;
    }

    //  Get all of the used methods.
    usedMethods = TP.sys.getUsedMethods();

    entries = TP.ac();

    usedMethods.perform(
        function(kvPair) {

            var methodObj;

            methodObj = kvPair.last();

            entries.push(methodObj.getPackagingDependencies());
        });

    entries = entries.flatten();

    entries.unique();

    //  Collect up all of the entries that are 'whole package' entries.
    packageEntries = entries.select(
                            function(anEntry) {
                                return TP.isValid(anEntry.wholePackageInfo);
                            });

    len = packageEntries.getSize();

    extraSourcePaths = TP.ac();

    //  Now, iterate over all of the entries and collect up all of the source
    //  paths for the objects that are *not* represented in one of the 'whole
    //  package entries'
    entries.perform(
        function(anEntry) {
            var i;

            //  If the entry is a 'whole package' entry, then just move to the
            //  next one.
            if (TP.isValid(anEntry.wholePackageInfo)) {
                return;
            }

            //  If there are no 'whole package' entries, then just add the
            //  source path of the entry and move on.
            if (len === 0) {
                extraSourcePaths.push(anEntry[TP.SOURCE_PATH]);
                return;
            }

            //  Otherwise, iterate over all of the 'whole package' entries. If
            //  both the TP.LOAD_PACKAGE and the TP.LOAD_CONFIG from the entry
            //  are also represented by one of the 'whole package' entries, then
            //  we do *not* add that source path to the list of source paths. It
            //  will be represented by the package.
            for (i = 0; i < len; i++) {
                /* eslint-disable brace-style */
                if (anEntry[TP.LOAD_PACKAGE] ===
                        packageEntries.at(i)[TP.LOAD_PACKAGE] &&
                    anEntry[TP.LOAD_CONFIG] ===
                        packageEntries.at(i)[TP.LOAD_CONFIG])
                /* eslint-enable brace-style */
                {
                    return;
                }
            }

            extraSourcePaths.push(anEntry[TP.SOURCE_PATH]);
        });

    extraSourcePaths.unique();
    TP.compact(extraSourcePaths, TP.isEmpty);

    //  Expand all of the paths for consistency.
    expandedSourcePaths = extraSourcePaths.collect(
                                function(aPath) {
                                    return TP.uriExpandPath(aPath);
                                });

    //  'Stringify' the package entries into the canonical TIBET format for
    //  them.
    expandedPackagePaths = packageEntries.collect(
                function(aPackageEntry) {
                    return TP.uriExpandPath(aPackageEntry[TP.LOAD_PACKAGE]) +
                            '@' +
                            aPackageEntry[TP.LOAD_CONFIG];
                });

    return TP.hc('wholePackagePaths', expandedPackagePaths,
                    'extraSourcePaths', expandedSourcePaths);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMissingPackagingInfo',
function(packageName, configName) {

    /**
     * @method getMissingPackagingInfo
     * @summary Returns a hash that has two Arrays: one of packages of code that
     *     are used and can be represented by 'package' definitions, but are
     *     missing from the supplied package/config combo and one of 'extra'
     *     source file paths for code that is used but is outside of those
     *     packages and are also missing from the supplied package/config combo.
     * @description This method requires the 'oo.$$track_invocation' flag to be
     *     true, otherwise there will be no data for this method to use for its
     *     computation and it returns an empty hash.
     * @param {String} packageName The package name to locate and use package
     *     and script paths from for comparison against what the runtime knows
     *     it needs.
     * @param {String} configName The config to load. Default is whatever is
     *     listed as the default for that package (usually base).
     * @returns {TP.core.Hash} A hash of two Arrays of paths to code used by the
     *     system - one for packages and one for 'extra' source files outside of
     *     those packages - but are missing from the supplied package/config
     *     combo.
     */

    var usedMethodInfo,
        usedMethodPaths,

        configScriptPaths,

        missingScriptPaths,

        filters,
        filteredScriptPaths,

        allPackagePaths,
        usedPackagePaths,
        missingPackagePaths;

    if (TP.isFalse(TP.sys.cfg('oo.$$track_invocation'))) {
        TP.ifError() ?
            TP.error('Attempt to retrieve used types when invocation' +
                        ' data isn\'t available.') : 0;
        return null;
    }

    //  Grab all of the scripts paths that are currently used by the system.
    //  This uses invocation data to determine which methods got invoked and
    //  then messages them for their source paths.
    usedMethodInfo = TP.sys.getUsedPackagingInfo();

    usedMethodPaths = usedMethodInfo.at('extraSourcePaths');

    //  Grab all of the script paths in the named packages and configs. This
    //  will be all of the paths that are contained in that package and config.
    configScriptPaths = TP.sys.getAllScriptPaths(packageName, configName);

    //  Difference the config script paths against our master list of expanded
    //  paths. This will produce a list of paths that the system knows about
    //  given the runtime information of used types and methods but isn't
    //  represented in the supplied package and config.
    missingScriptPaths = usedMethodPaths.difference(configScriptPaths);

    //  Filter out paths for developer tools, boot system, etc. using a
    //  predetermined list of RegExps.
    filters = TP.EXCLUDE_INVOCATION_TRACKED_PATHS;

    filteredScriptPaths = missingScriptPaths.filter(
                        function(aPath) {

                            var filterPath,

                                len,
                                i;

                            filterPath = false;

                            len = filters.getSize();
                            for (i = 0; i < len; i++) {
                                if (filters.at(i).test(aPath)) {
                                    filterPath = true;
                                    break;
                                }
                            }

                            return !filterPath;
                        });

    //  We obtain all reachable package paths from the named packages and
    //  configs.
    usedPackagePaths = usedMethodInfo.at('wholePackagePaths');

    //  We obtain all reachable package paths from the named packages and
    //  configs.
    allPackagePaths = TP.sys.getAllPackagePaths(packageName, configName);

    //  Difference all package paths against our list of used package paths.
    //  This will produce a list of paths that the system knows about
    //  given the runtime information of used types and methods but isn't
    //  represented in the supplied package and config.
    missingPackagePaths = usedPackagePaths.difference(allPackagePaths);

    return TP.hc('packagePaths', missingPackagePaths,
                    'scriptPaths', filteredScriptPaths);
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
                    sourcePath: methodBody[TP.SOURCE_PATH],
                    loadPackage: methodBody[TP.LOAD_PACKAGE],
                    loadConfig: methodBody[TP.LOAD_CONFIG]
                };

                results.push(methodEntry);
            });

    return results;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importPackage',
function(packageName, configName, shouldSignal) {

    /**
     * @method importPackage
     * @summary Imports a specific package/config file's script resources. Note
     *     that when dealing with rollups this also includes the package's
     *     rolled up resources in the form of TP.uc() content.
     * @param {String} packageName The package name to locate and import.
     * @param {String} configName The config to load. Default is whatever is
     *     listed as the default for that package (usually base).
     * @param {Boolean} [shouldSignal=false] Should scripts signal Change once
     *     they've completed their import process?
     * @returns {Promise} A promise which resolved based on success.
     */

    var packageScriptPaths,
        loadedScripts,
        missingScripts,

        promises;

    packageScriptPaths = TP.sys.getAllScriptPaths(packageName, configName);
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
    //  of them failed.
    return TP.extern.Promise.all(promises);
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
     * @param {TP.core.URI|String} aURI A TP.core.URI or String referencing the
     *     script location.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A set of request
     *     parameters. The only meaningful one here is 'callback' which should
     *     point to a function to call on complete.
     * @returns {Promise} A promise which resolved based on success.
     */

    var url,
        request,
        callback;

    url = TP.uc(aURI);
    if (TP.notValid(url)) {
        this.raise('TP.sig.InvalidURI');

        return TP.extern.Promise.reject(new Error('InvalidURI'));
    }

    //  Adjust the path per any rewrite rules in place for the URI. Note
    //  that we only do this if the url is absolute
    if (TP.uriIsAbsolute(url.getLocation())) {
        url = url.rewrite();
    }

    request = TP.request(aRequest);
    TP.info('Importing script: ' + TP.str(url));

    //  Grab any callback that was defined by the request
    callback = TP.ifKeyInvalid(request, 'callback', null);

    return TP.sys.importSource(url.getLocation(), true, false).then(
        function(scriptNode) {
            var req;

            if (TP.isCallable(callback)) {
                callback(scriptNode);
            }

            //  Activate any "awakening logic" specific to the script.
            req = TP.request();
            req.atPut('node', scriptNode);
            TP.html.script.tagAttachDOM(req);

            TP.signal(TP.sys, 'TP.sig.ScriptImported', TP.hc('node', scriptNode));

            return scriptNode;
        }
    ).then(function(result) {
        request.complete(result);
    }).catch(function(err) {
        request.fail(err);

        //  Be sure to throw here or invoking items like importPackage won't
        //  see the error, it's being caught here.
        if (TP.isValid(err)) {
            throw err;
        } else {
            throw new Error('ImportScriptError');
        }
    });
});

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('importSource',
function(targetUrl) {

    /**
     * @method importSource
     * @summary Imports a target script which loads and integrates JS with the
     *     currently running "image".
     * @param {String} targetUrl URL of the target resource.
     * @returns {Promise} A promise which resolved based on success.
     */

    var request;

    if (TP.notValid(targetUrl)) {
        return TP.extern.Promise.reject(new Error('InvalidURI'));
    }

    request = TP.request('async', true,
                            'refresh', true,
                            'resultType', TP.TEXT,
                            'signalChange', false);

    return TP.uc(targetUrl).getResource(request).then(
        function(result) {
            var node;

            node = TP.boot.$sourceImport(result, null, targetUrl);
            if (TP.notValid(node) || TP.isError(node)) {
                throw new Error('Error importing source: ' + targetUrl);
            }

            return node;

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
                throw new Error('ImportSourceError');
            }
        });
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
