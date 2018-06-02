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
Kernel finalization. Any last configuration and processing is done here.
*/

//  ------------------------------------------------------------------------
//  GLOBAL INIT's
//  ------------------------------------------------------------------------

/* eslint-disable no-unused-vars */
TP.sys.$extraglobals = TP.sys.$nativeglobals.difference(
                            TP.sys.$ecmaglobals).difference(
                                TP.sys.$systemglobals).difference(
                                    TP.sys.$windowglobals).difference(
                                        TP.sys.$globals);
/* eslint-enable no-unused-vars */

TP.sys.$keywords = TP.hc().addAllKeys(TP.sys.$keywords);
TP.sys.$reservedwords = TP.hc().addAllKeys(TP.sys.$reservedwords);
TP.sys.$globals = TP.hc().addAllKeys(TP.sys.$globals);
TP.sys.$globalexcludes = TP.hc().addAllKeys(TP.sys.$globalexcludes);
TP.sys.$ecmaglobals = TP.hc().addAllKeys(TP.sys.$ecmaglobals);
TP.sys.$systemglobals = TP.hc().addAllKeys(TP.sys.$systemglobals);
TP.sys.$nativeglobals = TP.hc().addAllKeys(TP.sys.$nativeglobals);
TP.sys.$windowglobals = TP.hc().addAllKeys(TP.sys.$windowglobals);
TP.sys.$extraglobals = TP.hc().addAllKeys(TP.sys.$extraglobals);

TP.sys.defineMethod('defineGlobal',
function(aName, aValue, force) {

    /**
     * @method defineGlobal
     * @summary Defines a global variable and adds it to TIBET's list of
     *     globals. This list is used to support symbol exports. Note that while
     *     this does have the effect of setting a global value there is no
     *     change notification associated with this operation. Use set() to
     *     achieve that effect.
     * @param {String} aName The global name to define.
     * @param {Object} aValue The value to set for the global.
     * @param {Boolean} force True means an existing value will be forcefully
     *     replaced with the new value. The default is false.
     * @returns {Object|undefined} The value after setting.
     */

    //  we prefer explicit tests
    if (TP.isEmpty(aName)) {
        return;
    }

    //  NOTE NOTE NOTE, not an array push any more...
    TP.sys.$globals.atPut(aName, null);

    //  simple check for having already defined it, if not we add to the
    //  list. as a coding standard we use self when we're referring to
    //  the "global" instead of implying "window" behavior
    if (TP.notValid(TP.global[aName]) || force) {
        TP.global[aName] = aValue;
    }

    return TP.global[aName];
});


//  ------------------------------------------------------------------------
//  CLEANUP
//  ------------------------------------------------------------------------

//  process any pending signals
TP.sys.fireNextSignal();

//  ------------------------------------------------------------------------
//  APPLICATION STARTUP
//  ------------------------------------------------------------------------

TP.sys.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary Activates the entire TIBET 'system'.
     * @description TP.sys's 'activate()' method is called from $activate in the
     *     boot system once the blank page has been loaded and the UI canvas is
     *     read to display initialization messages. The handler here is
     *     responsible for performing all code initialization, initialize the
     *     TP.core.Application object and then signaling the next signal in the
     *     startup sequence. Activation of the TIBET system includes:
     *     - Initializing all of the TIBET types loaded.
     *     - Initializing type and method proxies.
     *     - Initializing native and non-native XML namespaces.
     *     - Initializing the browser locale.
     *     - Initializing the signaling system.
     *     - Checking the TIBET system version.
     *     - Loading the root window with content.
     * @returns {TP.sys} The receiver.
     */

    var locale,
        type,
        msg,
        name,

        /* eslint-disable no-unused-vars */
        promise,
        /* eslint-enable no-unused-vars */

        typeInits;

    // We only do this once.
    if (TP.sys.hasInitialized()) {
        return this;
    }

    //  Final signal before UI begins processing.
    TP.signal('TP.sys', 'AppWillInitialize');

    TP.boot.$setStage('initializing');

    //  "up-convert" configuration and environment data
    TP.sys.configuration = TP.hc(TP.sys.configuration);
    TP.sys.environment = TP.hc(TP.sys.environment);

    //  Load the environment with any information we have about plugins.
    if (TP.sys.cfg('tibet.plugins')) {
        TP.boot.$configurePluginEnvironment();
    }

    //  Install the patches for various native prototypes, etc. in the current
    //  code frame (where we are executing).
    TP.boot.installPatches(top);

    //  Capture the list of type initializers. We'll invoke these first to
    //  ensure the types are properly set up, then let completion on that
    //  task trigger activation of the rest of our workload.
    typeInits = TP.sys.getTypeInitializers();

    //  Execute the following steps in a series of Promises to allow for GUI
    //  updating.
    promise = TP.extern.Promise.resolve();

    promise.then(
        function() {
            var uri,
                req;

            msg = 'Initializing user...';

            if (TP.sys.cfg('boot.use_login')) {
                //  User should be logged in. We want to load/generate a vcard
                //  for them if possible.
                uri = TP.sys.cfg('tds.vcard.uri');
                if (TP.isEmpty(uri)) {
                    TP.core.User.getRealUser();
                } else {
                    uri = TP.uriExpandPath(uri);
                    req = TP.request('uri', uri, 'async', false);
                    req.defineHandler('IOCompleted',
                        function(aSignal) {
                            var result;

                            result = aSignal.getResult();
                            if (TP.isDocument(result)) {
                                TP.ietf.vcard.initVCards(result);
                                TP.core.User.construct(
                                    TP.nodeEvaluateXPath(result,
                                        'string(//$def:fn/$def:text/text())'));
                            } else {
                                TP.ifWarn() ?
                                    TP.warn('Invalid or missing user vcard.') : 0;
                                TP.core.User.getRealUser();
                            }
                        });
                    TP.httpGet(uri, req);
                }
            } else {
                //  Not a login-restricted application. Force construction of
                //  default user.
                TP.core.User.getRealUser();
            }

            //  Set up common URIs for the user object and the raw user vCard
            //  data.
            TP.uc('urn:tibet:user').setResource(
                                        TP.sys.getEffectiveUser());
            TP.uc('urn:tibet:userinfo').setResource(
                                        TP.sys.getEffectiveUser().get('vcard'));
        }).then(
        function() {
            var i;

            //  One tricky part is that we can sometimes trigger application
            //  instance creation during phase one of parallel booting. Because
            //  of that, it will be an instance of the common
            //  TP.core.Application type and not the specific subtype of
            //  TP.core.Application that we'll want for the rest of the life of
            //  running the app.

            //  So, when that happens we want to clear the singleton instance
            //  now that phase two has loaded and before we try anything that
            //  would depend on routes etc. This singleton instance will be
            //  re-created as an instance of our application-specific subtype.
            TP.core.Application.set('singleton', null);

            //  Initialize all the types which own initialize methods so we're
            //  sure they're ready for operation. this may cause them to load
            //  other types so we do this before proxy setup.
            try {
                //  Final signal before initializers are run.
                TP.signal('TP.sys', 'AppInitialize');

                msg = 'Initializing TIBET types...';

                TP.ifDebug() ? TP.debug(msg) : 0;
                TP.boot.$stdout(msg, TP.DEBUG);

                //  Run through the type initializers and run them.
                for (i = 0; i < typeInits.getSize(); i++) {
                    typeInits.at(i)();
                }
            } catch (e) {
                msg = 'TIBET Type Initialization Error';
                TP.ifError() ? TP.error(TP.ec(e, msg)) : 0;
                TP.boot.$stderr(msg, e, TP.FATAL);

                TP.boot.shouldStop('Type Initialization Failure(s).');
                TP.boot.$stderr('Initialization failure.', TP.FATAL);

                throw e;
            }
        }).then(
        function() {

            msg = 'Initializing root canvas...';

            //  Force initialization of the root canvas id before any changes
            //  are made to the canvas setting by other operations.
            try {
                TP.ifDebug() ? TP.debug(msg) : 0;
                TP.boot.$stdout(msg, TP.DEBUG);
                name = TP.sys.getUIRootName();
                if (TP.notValid(name)) {
                    throw new Error('InvalidUIRoot');
                }
            } catch (e) {
                msg = 'Canvas Initialization Error';
                TP.ifError() ? TP.error(TP.ec(e, msg)) : 0;
                TP.boot.$stderr(msg, e);
                throw e;
            }
        }).then(
        function() {

            msg = 'Initializing type proxies...';

            //  Initialize type proxies for types we didn't load as a result
            //  of the boot manifest or through type initialization.
            try {
                TP.ifDebug() ? TP.debug(msg) : 0;
                TP.boot.$stdout(msg, TP.DEBUG);

                TP.sys.initializeTypeProxies();
            } catch (e) {
                msg = 'Proxy Initialization Error';
                TP.ifError() ? TP.error(TP.ec(e, msg)) : 0;
                TP.boot.$stderr(msg, e);
                throw e;
            }
        }).then(
        function() {

            msg = 'Initializing namespace support...';

            //  Install native/non-native namespace support. this may also
            //  involve loading types
            try {
                TP.ifDebug() ? TP.debug(msg) : 0;
                TP.boot.$stdout(msg, TP.DEBUG);

                //  Two classes of namespace, internally supported and those
                //  TIBET has to provide support for
                TP.core.Browser.installNativeNamespaces();
                TP.core.Browser.installNonNativeNamespaces();
            } catch (e) {
                msg = 'Namespace Initialization Error';
                TP.ifError() ? TP.error(TP.ec(e, msg)) : 0;
                TP.boot.$stderr(msg, e);
                throw e;
            }
        }).then(
        function() {

            msg = 'Initializing default locale...';

            //  Bring in any locale that might be specified
            try {
                TP.ifDebug() ? TP.debug(msg) : 0;
                TP.boot.$stdout(msg, TP.DEBUG);

                if (TP.notEmpty(locale = TP.sys.cfg('tibet.locale'))) {
                    type = TP.sys.getTypeByName(locale);

                    if (TP.notValid(type)) {
                        msg = 'Locale Initialization Error: ' +
                            locale + ' not found.';
                        TP.boot.$stderr(msg);
                        TP.ifError() ? TP.error(msg) : 0;

                        //  set the default based on the current language
                        TP.sys.setLocale();
                    } else {
                        TP.sys.setLocale(type);
                    }
                } else {
                    //  set the default based on the current language
                    TP.sys.setLocale();
                }
            } catch (e) {
                msg = 'Locale Initialization Error';
                TP.ifError() ? TP.error(TP.ec(e, msg)) : 0;
                TP.boot.$stderr(msg, e);
                throw e;
            }
        }).then(
        function() {

            msg = 'TIBET Initialization complete.';

            TP.ifDebug() ? TP.debug(msg) : 0;
            TP.boot.$stdout(msg, TP.DEBUG);

            //  Ensure dependent code knows we're now fully initialized.
            TP.sys.hasInitialized(true);

            //  Refresh controllers now that all initialization is done.
            //  Note that this will build the proper Application subtype instance
            //  and configure it.
            TP.sys.getApplication().refreshControllers();

            try {
                //  Compute common sizes, such as font metrics and scrollbar
                //  sizes.
                TP.computeCommonSizes();
            } catch (e) {
                msg = 'UI metrics/size computations failed.';
                TP.ifError() ? TP.error(TP.ec(e, msg)) : 0;
                TP.boot.$stderr(msg, e);
                // Fall through and take our chances the UI will display
                // properly.
            }

            //  Final signal before UI begins processing.
            TP.signal('TP.sys', 'AppDidInitialize');

            if (TP.sys.hasFeature('sherpa')) {

                //  Set up handler for tibet.json changes... NOTE that because
                //  we're referencing via TIBETURL we want to get the concrete
                //  URI to actually apply the handler to. The TIBETURL will
                //  delegate to that during processing.
                TP.uc('~app/tibet.json').getConcreteURI().defineMethod(
                    'processRefreshedContent',
                    function() {
                        var obj,
                            str;

                        TP.info('Refreshing tibet.json configuration values.');

                        str = TP.str(this.getContent());
                        try {
                            obj = JSON.parse(str);
                        } catch (e) {
                            TP.error(
                                'Failed to parse: ' + this.getLocation(), e);
                            return;
                        }

                        TP.boot.$configureOptions(obj);

                        //  Configure routing data from cfg() parameters
                        TP.uri.URIRouter.$configureRoutes();
                    });

                TP.boot.$getStageInfo('starting').head =
                    'Launching TIBET Sherpa&#8482; IDE...';
            }

            //  If we initialized without error move on to starting.
            TP.boot.$setStage('starting');

            //  Recapture starting time in case we broke for debugging.
            TP.boot.$uitime = new Date();

            //  Load the UI. This will ultimately trigger UIReady.
            TP.sys.loadUIRoot();
        }).catch(function(err) {

            //  Re-throw any Error that got thrown above.
            throw err;
        });

    return this;
}, {
    dependencies: [TP.extern.Promise]
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('buildAndConfigAppInstance',
function() {

    /**
     * @method buildAndConfigAppInstance
     * @summary Gets the application type and instance set up after all
     *     loading and type initialization has been done.
     * @returns {TP.core.Application} The application instance.
     */

    var typeName,
        appType,
        newAppInst;

    //  Configure the application type setting, defaulting the value as needed.
    typeName = TP.sys.cfg('project.app_type');
    if (TP.isEmpty(typeName)) {
        typeName = 'APP.' + TP.sys.cfg('project.name') + '.Application';
    }

    //  If we're supposed to grab a different type that'll happen here.
    appType = TP.sys.getTypeByName(typeName);

    //  May be paused or booting in two phases, so only warn if we're fully
    //  loaded.
    if (TP.notValid(appType)) {
        if (TP.sys.hasLoaded()) {
            TP.ifWarn() ?
                TP.warn('Unable to locate application controller type: ' +
                    typeName + '. ' +
                    'Defaulting to TP.core.Application.') : 0;
        }
        appType = TP.sys.getTypeByName('TP.core.Application');
    }

    //  Create the new instance and define it as our singleton for any future
    //  application instance requests.
    newAppInst = appType.construct('Application', null);
    newAppInst.setID('Application');
    TP.core.Application.set('singleton', newAppInst);

    return newAppInst;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('loadUIRoot',
function() {

    /**
     * @method loadUIRoot
     * @summary Loads the 'ui root' window with the initial content.
     * @returns {TP.sys} The receiver.
     */

    var inPhantom,

        rootLoc,
        rootURI,
        rootName,
        rootWindow,

        hasBootToggle,

        request,
        toggleKey,

        bootTPFrameElem,
        bootdoc;

    inPhantom = TP.sys.cfg('boot.context') === 'phantomjs';

    rootLoc = TP.uriJoinPaths('~boot_xhtml', TP.sys.cfg('project.root_page'));

    //  Construct a TP.uri.URI wrapper around the location and perform a
    //  rewrite on it, in case its actually a URI that's been mapped using
    //  the URI mapping system.
    rootURI = TP.uc(rootLoc);
    rootURI = rootURI.rewrite();

    if (TP.notValid(rootURI)) {
        TP.sys.raise('TP.sig.InvalidURI', rootLoc);
        TP.boot.$flushLog(true);
    }

    //  the 'path' to the 'root' (the window we will draw the initial
    //  content into)
    rootName = TP.sys.getUIRootName();

    //  make sure we have a root window
    if (TP.notValid(rootWindow = TP.sys.getWindowById(rootName))) {
        TP.boot.$stderr('Canvas specification error. Cannot find window: ' +
                            rootName);
        TP.boot.$flushLog(true);

        return this;
    }

    //  As long as we're not sharing a UI for booting with the final target UI
    //  we can go ahead and hide the root UI while keeping the boot UI visible
    //  in case errors occur.
    if (TP.boot.getUIRoot() !== TP.boot.getUIBoot()) {
        TP.boot.hideUIRoot();
    }

    //  To avoid flickering, we set 'display' of the rootWindow's frameElement
    //  (i.e. '#UIROOT') to 'none' in our index file. We *must* turn back on
    //  display here, as the CSS layout engine needs to lay out on screen
    //  components it can compute sizes, etc. Note that the 'visibility' of this
    //  element is still 'hidden' as per the hideUIRoot() call above.
    TP.elementDefaultDisplay(rootWindow.frameElement);

    //  Build a request we can pass to the setContent routine to handle any
    //  callbacks, error conditions, etc.
    request = TP.request();

    //  TODO: these should be methods, not functions in the payload. fixing this
    //  requires changing everywhere that expects TP.ONLOAD as a key (many DOM
    //  and DHTML primitives (ack TP.ONLOAD for the list).

    request.atPut(
        TP.ONLOAD,
        function(aDocument) {

            //  If the boot didn't trigger ONFAIL but is stopping then we're
            //  still essentially in failure mode. Make sure we do the right
            //  thing.
            if (TP.boot.shouldStop()) {
                request.at(TP.ONFAIL)(request);
                return;
            }

            //  NOTE that we don't have logic here. Formerly we'd trigger app
            //  start signaling here but we have to let that happen via either
            //  the tibet:root or tibet:sherpa tag processing for proper
            //  sequencing.
            if (inPhantom) {
                //  Signal we are starting. This provides a hook for extensions
                //  etc. to tap into the startup sequence before routing or
                //  other behaviors but after we're sure the UI is finalized.
                TP.signal('TP.sys', 'AppWillStart');

                //  Signal actual start. The default handler on Application will
                //  invoke the start() method in response to this signal.
                TP.signal('TP.sys', 'AppStart');
            } else if (!TP.sys.hasFeature('sherpa') && hasBootToggle) {

                //  No hook file in the boot screen so we initialize manually.
                bootTPFrameElem = TP.byId(TP.sys.cfg('boot.uiboot'), top);
                if (TP.isValid(bootTPFrameElem)) {
                    TP.boot.initializeCanvas(
                        bootTPFrameElem.getContentWindow().getNativeWindow());
                }

                //  Prep the UI for full console mode.
                if (TP.isValid(bootTPFrameElem)) {
                    bootTPFrameElem.getContentDocument().getBody().addClass(
                        'full_console');
                }
            }
        });

    request.atPut(
        TP.ONFAIL,
        function(req) {
            var msg,
                txt;

            //  Be certain our boot UI is displayed.
            TP.boot.showUIBoot();

            txt = req.getFaultText();
            msg = TP.sc('UIRoot Initialization Error') +
                    (txt ? ': ' + txt + '.' : '.');

            //  TODO: Dig around and figure out what went wrong. getFaultText is
            //  pretty limited in terms of details.
            TP.boot.$stderr(msg, TP.FATAL);
        });

    //  If we're not running with a UI (not phantom), and we have a properly
    //  configured 'boot toggle' key, then set up an observation that will cause
    //  that key to toggle between the boot log and the application's user
    //  interface.
    hasBootToggle = TP.notEmpty(TP.sys.cfg('boot.toggle_key'));

    if (!inPhantom && hasBootToggle) {

        //  Configure a toggle so we can always get back to the boot UI as
        //  needed.
        toggleKey = TP.sys.cfg('boot.toggle_key');

        if (!toggleKey.startsWith('TP.sig.')) {
            toggleKey = 'TP.sig.' + toggleKey;
        }

        if (!TP.sys.hasFeature('sherpa')) {

            /* eslint-disable no-wrap-func,no-extra-parens */
            //  set up keyboard toggle to show/hide the boot UI
            (function() {
                TP.boot.toggleUI();
                TP.boot.$scrollLog();
            }).observe(TP.core.Keyboard, toggleKey);
            /* eslint-enable no-wrap-func,no-extra-parens */

        } else {

            //  With sherpa in place the normal TP.core.Keyboard hook won't be
            //  installed in UIBOOT, we need to do a lower level listener so
            //  when/if that UI becomes primary we have event hooks in place.
            bootTPFrameElem = TP.byId(TP.sys.cfg('boot.uiboot'), top);
            if (TP.isValid(bootTPFrameElem)) {
                try {
                    bootdoc = bootTPFrameElem.getContentDocument().
                                                    getNativeDocument();
                    bootdoc.addEventListener('keyup',
                    function(ev) {

                        var keySigName;

                        keySigName = 'TP.sig.' + TP.eventGetDOMSignalName(ev);

                        if (keySigName === toggleKey) {
                            TP.boot.showUIRoot();
                        }
                    }, false);
                } catch (e) {
                    TP.boot.$stderr('Unable to attach boot UI toggle: ' +
                        e.message);
                }
            }
        }
    }

    //  Set the location of the window (wrapping it to be a TP.core.Window).
    TP.wrap(rootWindow).setContent(rootURI, request);

    return this;
});

//  ------------------------------------------------------------------------
//  APPLICATION SHUTDOWN
//  ------------------------------------------------------------------------

TP.sys.defineMethod('finalizeShutdown',
function() {

    /**
     * @method finalizeShutdown
     * @summary Finalizes the shut down of the application by sending the
     *     'TP.sig.AppShutdown' signal.
     * @returns {TP.sys} The receiver.
     */

    TP.signal(TP.sys, 'TP.sig.AppShutdown');

    return this;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('terminate',
function(aURI) {

    /**
     * @method terminate
     * @summary Terminates the application by removing the protective
     *     onbeforeunload hooks that TIBET installs and navigating to the
     *     supplied URI. If a URI is not supplied the value from
     *     TP.sys.cfg('path.blank_page') is used.
     * @summary This function should be called by applications *only after
     *     all 'quit' logic (e.g. saving data to the server, etc.) has been
     *     executed by the application*.
     * @param {String} aURI The URI to navigate to in order to terminate the
     *     application.
     * @returns {TP.sys} The receiver.
     */

    var sig,

        url,
        str;

    //  Send a TP.sig.AppWillShutdown signal. This can be canceled (i.e.
    //  'prevent default'ed), in which case we just return.
    sig = TP.signal(TP.sys, 'TP.sig.AppWillShutdown');

    //  If the signal has been 'prevent default'ed, then return.
    if (sig.shouldPrevent()) {
        return this;
    }

    if (TP.isValid(aURI)) {
        url = TP.uc(aURI);
    } else {
        url = TP.uc(TP.sys.cfg('path.blank_page'));
    }

    str = url.getLocation();

    //  Can't use a 'tibet://' URL here.
    if (str.match(/tibet:/)) {
        TP.ifWarn() ?
            TP.warn('Invalid termination URI provided: ' + aURI) : 0;

        //  didn't resolve properly, not a valid resource URI
        url = TP.uc(TP.sys.cfg('path.blank_page'));
    }

    //  close open/registered windows. won't always work, but we can try :)
    TP.core.Window.closeRegisteredWindows();

    //  By setting this on the code (i.e. top-level) window's document's body
    //  element, we tell the onbeforeunload handler to just return and don't
    //  supply text to the browser. This allows a 'clean' unload.

    //  Note that the 'finalizeShutdown' method will be called from the 'unload'
    //  handler as the code unloads.
    if (TP.isElement(TP.documentGetBody(window.document))) {
        TP.elementSetAttribute(TP.documentGetBody(window.document),
                                'allowUnload',
                                'true');
    }

    //  put up the blank page at top, which blows away the app

    //  NB: This will eventually cause the 'finalizeShutdown' machinery above
    //  through the 'unload' event handler.
    window.location = url.getLocation();

    return this;
});

//  ------------------------------------------------------------------------

//  We now have a complete kernel in place which means other files can test
//  whether then can invoke kernel versions of primitives etc.
TP.sys.hasKernel(true);

//  ----------------------------------------------------------------------------

/**
 * The namespace used for temporary data
 */
/* eslint-disable no-unused-vars */
TP.defineNamespace('TP.tmp');
/* eslint-enable no-unused-vars */

TP.w3.Xmlns.registerNSInfo(
    'urn:tibet:tmp',
    TP.hc('prefix', 'tmp'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
