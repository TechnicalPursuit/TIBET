//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.sys.defineMethod('importPackage',
function(packageName, configName) {

    /**
     * @method importPackage
     * @summary Imports a specific package/config file's script resources. Note
     *     that when dealing with rollups this also includes the package's
     *     rolled up resources in the form of TP.uc() content.
     * @param {String} packageName The package name to locate and import.
     * @param {String} configName The config to load. Default is whatever is
     *     listed as the default for that package (usually base).
     * @return {TP.extern.Promise} A promise which resolved based on success.
     */

    var uri,
        newScripts,
        loadedScripts,
        missingScripts,
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
        newScripts = TP.boot.$listPackageAssets(uri, configName);
    } catch (e) {
        void 0;
    } finally {
        TP.sys.setcfg('boot.phase_one', phaseOne);
        TP.sys.setcfg('boot.phase_two', phaseTwo);
    }

    //  Normalize the list of scripts.
    newScripts = newScripts.map(
                    function(node) {
                        return TP.uriExpandPath(node.getAttribute('src'));
                    });
    TP.compact(newScripts, TP.isEmpty);

    //  Determine which scripts haven't already been loaded.
    loadedScripts = TP.boot.$$loadpaths;
    missingScripts = newScripts.difference(loadedScripts);

    //  Since importScript returns a promise we want to create a collection
    //  which we'll then resolve once all promises have completed in some form.
    promises = missingScripts.map(function(path) {
        return TP.sys.importScript(path);
    });

    return Promise.all(promises.map(function(promise) {
        return promise.reflect();
    })).each(function(inspection) {
        if (inspection.isFulfilled()) {
            console.log("A promise in the array was fulfilled with", inspection.value());
        } else {
            console.error("A promise in the array was rejected with", inspection.reason());
        }
    });

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
     * @return {TP.extern.Promise} A promise which resolved based on success.
     */

    var url,
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

    TP.info('Importing script: ' + TP.str(url));

    //  Grab any callback that was defined by the request
    callback = TP.ifKeyInvalid(aRequest, 'callback', null);

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

            return scriptNode;
        }
    ).then(function(result) {
        if (TP.isValid(aRequest)) {
            aRequest.complete(result);
        }
    }).catch(function(err) {
        if (TP.isValid(aRequest)) {
            aRequest.fail(err);
        }

        if (TP.isValid(err)) {
            TP.error(err);

            //  Be sure to throw here or invoking items like importPackage won't
            //  see the error, it's being caught here.
            throw err;
        }
    });
});

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('importSource', function(targetUrl) {

    /**
     * @method importSource
     * @summary Imports a target script which loads and integrates JS with the
     *     currently running "image".
     * @param {String} targetUrl URL of the target resource.
     * @return {TP.extern.Promise} A promise which resolved based on success.
     */

    var src,
        msg,
        err,
        result;

    if (TP.notValid(targetUrl)) {
        return TP.extern.Promise.reject(new Error('InvalidURI'));
    }

    //  we pass actual responsibility for locating the source text to the
    //  uriLoad call, but we need to tell it that we're looking for source
    src = TP.boot.$uriLoad(targetUrl, TP.TEXT, 'source');
    if (TP.notValid(src)) {
        msg = 'Requested source URL not found: ';
        err = new Error(msg + targetUrl + '.');
        return TP.extern.Promise.reject(err);
    }

    result = TP.boot.$sourceImport(src, null, targetUrl);
    if (TP.notValid(result) || TP.isError(result)) {
        return TP.extern.Promise.reject(result);
    }

    return TP.extern.Promise.resolve(result);
});

//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importType',
function(aTypeName, shouldReload, isProxy) {

    /**
     * @method importType
     * @summary Imports a type by name. If the type is already loaded the
     *     current type is returned unless shouldReload is set to true.
     * @param {String} aTypeName The type name to locate and import as needed.
     * @param {Boolean} shouldReload True if the type should be reloaded if
     *     already found in the system.
     * @param {Boolean} isProxy Is this call being done in support of a type
     *     proxy? Default is false.
     * @returns {TP.lang.RootObject} A Type object.
     */

    var reload,
        proxy,
        type;

    reload = TP.ifInvalid(shouldReload, false);
    proxy = TP.ifInvalid(isProxy, false);

    //  only work on string type references
    if (!TP.isString(aTypeName)) {
        if (TP.isType(aTypeName)) {
            return aTypeName;
        }

        return this.raise('TP.sig.InvalidParameter');
    }

    //  we get called with a variety of inputs...don't bother if the string
    //  isn't a valid JS identifier or simple "qualified name" TIBET can
    //  handle for types
    if (!TP.isTypeName(aTypeName)) {
        return;
    }

    //  if the type's already loaded then we get off easy...but we have to
    //  qualify here for whether we'll accept a proxy back. when false this
    //  tells getTypeByName not to fault in types (which is good since it
    //  calls this method and we'd recurse)
    if (TP.isType(type = TP.sys.getTypeByName(aTypeName, !proxy))) {
        if (!reload) {
            return type;
        } else {
            //  if the type is already loaded then we don't need to do
            //  anything to get new metadata, we can use what's in place
            void 0;
        }
    }

    return null;
});

//  simple alias that doesn't change the actual method name/owner info.
TP.sys.require = TP.sys.importType;

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
