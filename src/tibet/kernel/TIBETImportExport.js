//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
The elements of this file are focused on code and content import. Of
particular interest are the elements that support TIBET's type and method
"autoloader" capability which allows code to be dynamically loaded without
programmer intervention. This is a powerful feature since it means you can
tune your load packages to create a smaller startup footprint, migrating
features among various packages without having to alter source code that
consumes those resources. Mention a type or method and TIBET will autoload
it if it's not yet available. All that's required is current metadata so
TIBET knows where to find the various types/methods you will want to load.
This metadata is constructed automatically during application execution, you
simply save it from the development environment and you're ready to go.
*/

//  ------------------------------------------------------------------------
//  AUTOLOADING METHODS
//  ------------------------------------------------------------------------

TP.sys.defineMethod('importPackage',
function(aPackageName, aTarget, aBaseDir, shouldReload, loadSync) {

    /**
     * @method importPackage
     * @summary Optionally imports a package and target by name. No attempt to
     *     manage inter-package dependencies is made. Using the shouldReload
     *     flag allows you to force reloading of package content when a
     *     particular package has already been loaded. NOTE that you can not
     *     reload the Kernel package.
     * @summary This method is a useful way to load code from a package
     *     target. To assist with determining whether a particular target has
     *     already been loaded the target will default to 'base' during the test
     *     phase. This is the typical core target and using base also avoids
     *     issues with nested target references which are common with the full
     *     target. If the full target is found in the load record it is assumed
     *     that all other targets have been loaded. If no target was specified
     *     and neither the base or full target appear to have been loaded the
     *     package will be imported using whatever target was specified, or the
     *     package's default target.
     * @param {String} aPackageName The package name to locate and import as
     *     needed. The package's XML configuration file is presumed to live in
     *     the TIBET configuration directory or in the boot dir of the
     *     application itself. Prefix this name with an appropriate ~ path as
     *     needed to ensure app vs. lib resolution. Default is
     *     ~lib_cfg/[aPackageName].xml.
     * @param {String} aTarget The target name to load. Default is whatever is
     *     listed as the default for that package (usually base).
     * @param {String|TP.core.URI} aBaseDir The base directory to use for
     *     resolving file paths. Normally you should leave this null.
     * @param {Boolean} shouldReload True if the package should be reloaded if
     *     already loaded. The default is false. Note that when you force reload
     *     of a package that package's script elements are reloaded as well.
     * @param {Boolean} loadSync Should the load be done synchronously? Default
     *     is true.
     * @returns {Number} The number of unique nodes loaded from the package
     *     during the import process.
     */

    TP.todo('Implement TP.sys.importPackage');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importNamespace',
function(aNamespaceURI, aPackageName) {

    /**
     * @method importNamespace
     * @summary Loads the canonically prefixed target for the specified
     *     namespace provided that the namespace's canonical prefix is mentioned
     *     as a target in either the TNS.xml configuration file or in the XMLNS
     *     'info' hash.
     * @param {String} aNamespaceURI The registered URI for the desired
     *     namespace.
     * @param {String} aPackageName The package name to locate the namespace
     *     prefix in.
     * @returns {Number} The number of unique nodes loaded from the package
     *     during the import process.
     */

    TP.todo('Implement TP.sys.importNamespace');
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
     * @returns {TP.html.script} The HTML Script node holding the script.
     */

    var url,

        reqCallbackFunc,
        callbackFunc;

    url = TP.uc(aURI);
    if (TP.notValid(url)) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  Adjust the path per any rewrite rules in place for the URI. Note
    //  that we only do this if the url is absolute
    if (TP.uriIsAbsolute(url.getLocation())) {
        url = url.rewrite();
    }

    //  Grab any callback that was defined by the request
    reqCallbackFunc = TP.ifKeyInvalid(aRequest, 'callback', null);

    //  Define a callback function that will call TP.html.script's
    //  'tagAttachDOM' method to register the script for any changes to its
    //  remote resource (if watching remote resources is turned on).
    callbackFunc =
        function(scriptNode) {

            var req;

            if (TP.isCallable(reqCallbackFunc)) {
                reqCallbackFunc(scriptNode);
            }

            req = TP.request();

            //  Manually call 'tagAttachDOM' with a manually constructed
            //  request.
            req.atPut('node', scriptNode);
            TP.html.script.tagAttachDOM(req);
        };

    return TP.boot.$uriImport(url.getLocation(),
                                callbackFunc,
                                true,
                                false);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importType',
function(aTypeName, shouldReload, isProxy) {

    /**
     * @method importType
     * @summary Optionally imports a type by name. Note that this method makes
     *     no attempt to load supertypes, use TP.sys.require for that behavior.
     *     This method is leveraged by the require() function to load single
     *     types, reloading them if forced via the shouldReload flag.
     * @param {String} aTypeName The type name to locate and import as needed.
     * @param {Boolean} shouldReload True if the type should be reloaded if
     *     already found in the system.
     * @param {Boolean} isProxy Is this call being done in support of a type
     *     proxy? If true then certain registration-related tasks are performed
     *     to properly fault in the type. Default is false.
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

//  ------------------------------------------------------------------------

//  simple alias that doesn't change the actual method name/owner info.
TP.sys.require = TP.sys.importType;

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
