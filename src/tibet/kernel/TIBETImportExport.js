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

    var uri,

        packageAssets,
        packageScriptPaths,

        phaseOne,
        phaseTwo;

    //  Normalize the incoming package name to produce a viable config file.
    uri = TP.uriExpandPath(packageName);
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
        packageAssets = TP.boot.$listPackageAssets(uri, configName);
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

TP.sys.defineMethod('getMissingScriptPaths',
function(packageName, configName) {

    /**
     * @method getMissingScriptPaths
     * @summary Returns a list of source file paths that are missing from the
     *     supplied package and config, given what the system has been able to
     *     determine using invocation data.
     * @description This method requires the 'oo.$$track_invocation' flag to be
     *     true, otherwise there will be no data for this method to use for its
     *     computation and it return an empty hash.
     * @param {String} packageName The package name to locate and use script
     *     paths from for comparison against what the runtime knows it needs.
     * @param {String} configName The config to load. Default is whatever is
     *     listed as the default for that package (usually base).
     * @returns {String[]} An Array of script paths that are missing in the
     *     supplied package and config, given what the runtime system knows it
     *     needs.
     */

    var usedTypes,
        usedTypePaths,

        usedMethods,
        usedMethodPaths,

        allPaths,
        expandedPaths,

        configScriptPaths,

        missingScriptPaths,

        filters,
        filteredPaths;

    if (TP.isFalse(TP.sys.cfg('oo.$$track_invocation'))) {
        TP.ifError() ?
            TP.error('Attempt to retrieve used types when invocation' +
                        ' data isn\'t available.') : 0;
        return null;
    }

    //  First, we collect the paths of the currently used types.

    //  All of the types that were actually used by the running application will
    //  be the values in the returned hash here.
    usedTypes = TP.sys.getUsedTypes().getValues();

    //  Sort them by supertypes.
    usedTypes.sort(TP.sort.SUBTYPE);

    //  Collect up all of their source paths.
    usedTypePaths = usedTypes.collect(
                        function(aType) {
                            return aType[TP.SOURCE_PATH];
                        });

    //  Now collect all of the paths of the used methods.
    usedMethods = TP.sys.getUsedMethods();

    //  Collect up all of their source paths.
    usedMethodPaths = usedMethods.collect(
                        function(kvPair) {

                            var methodPath;

                            methodPath = kvPair.last()[TP.SOURCE_PATH];
                            return methodPath;
                        });

    //  Concatenate the used type paths with the used method paths into one big
    //  list. This will be used as the master list for all of the paths.
    allPaths = usedTypePaths.concat(usedMethodPaths);

    allPaths.unique();
    TP.compact(allPaths, TP.isEmpty);

    //  Expand all of the paths in the master list.
    expandedPaths = allPaths.collect(
                                function(aPath) {
                                    return TP.uriExpandPath(aPath);
                                });

    //  Grab all of the script paths in the named packages and configs. This
    //  will be all of the paths that are contained in that package and config.
    configScriptPaths = TP.sys.getAllScriptPaths(packageName, configName);

    //  Difference that config script paths against our master list of expanded
    //  paths. This will produce a list of paths that the system knows about
    //  given the runtime information of used types and methods but isn't
    //  represented in the supplied package and config.
    missingScriptPaths = expandedPaths.difference(configScriptPaths);

    //  Filter out paths for developer tools, boot system, etc. using a
    //  predetermined list of RegExps.
    filters = TP.EXCLUDE_INVOCATION_TRACKED_PATHS;

    filteredPaths = missingScriptPaths.filter(
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

    return filteredPaths;
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
