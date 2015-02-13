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

/* JSHint checking */

/* global $signal_stack:true,
          $focus_stack:true
*/

//  ------------------------------------------------------------------------
//  GLOBAL INIT's
//  ------------------------------------------------------------------------

TP.sys.$extraglobals = TP.sys.$nativeglobals.difference(
                            TP.sys.$ecmaglobals).difference(
                                TP.sys.$systemglobals).difference(
                                    TP.sys.$windowglobals).difference(
                                        TP.sys.$globals);

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
     * @returns {Object} The value after setting.
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


//  TODO: these are still globals. relocate onto TP.

//  set up a proper array to manage any queued signals now that we're sure
//  the kernel has loaded fully
$signal_stack = TP.ac();

//  set up a similar array to manage the focus stack. this structure lets us
//  keep track of focus as it moves between various documents, which can
//  happen often when using drawers or other constructs that open/close.
$focus_stack = TP.ac();

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
     * @summary TP.sys's 'activate()' method is called from $initialize
     *     in the boot system once the blank page has been loaded and the UI
     *     canvas is read to display initialization messages. The handler here
     *     is responsible for performing all code initialization, activating the
     *     TP.core.Application object and then signaling the next signal in the
     *     startup sequence. Activation of the TIBET system includes:
     *     - Initializing all of the TIBET types loaded.
     *     - Initializing type and method proxies.
     *     - Initializing native and non-native XML namespaces.
     *     - Initializing the browser locale.
     *     - Initializing the signaling system.
     *     - Checking the TIBET system version.
     *     - Loading the root window with content.
     */

    var locale,
        type,
        msg,
        name,
        coreInits,
        typeInits,
        postTypes,
        postCore;

    // We only do this once.
    if (TP.sys.hasInitialized()) {
        return;
    }

    TP.stop('break.main');

    TP.boot.$setStage('initializing');

    //  "up-convert" configuration and environment data
    TP.sys.configuration = TP.hc(TP.sys.configuration);
    TP.sys.environment = TP.hc(TP.sys.environment);

    //  Load the environment with any information we have about plugins.
    if (TP.sys.cfg('tibet.plugins')) {
        TP.boot.$configurePluginEnvironment();
    }

    //  Create a worklist of functions we'll activate asynchronously so we
    //  get continual feedback/output during the boot process.
    coreInits = TP.ac();

    coreInits.push(
        function() {
            msg = 'Initializing root canvas...';

            //  Force initialization of the root canvas id before any changes
            //  are made to the canvas setting by other operations.
            try {
                TP.ifTrace() ? TP.trace(msg, TP.LOG) : 0;
                TP.boot.$displayStatus(msg);
                name = TP.sys.getUIRootName();
                if (TP.notValid(name)) {
                    throw new Error('InvalidUIRoot');
                }
            } catch (e) {
                msg = 'Canvas Initialization Error';
                TP.ifError() ? TP.error(TP.ec(e, msg), TP.LOG) : 0;
                TP.boot.$stderr(msg, e);
                throw e;
            }
        });

    coreInits.push(
        function() {
            var msg = 'Initializing type proxies...';

            //  Initialize type proxies for types we didn't load as a result
            //  of the boot manifest or through type initialization.
            try {
                TP.ifTrace() ? TP.trace(msg, TP.LOG) : 0;
                TP.boot.$displayStatus(msg);

                TP.sys.initializeTypeProxies();
            } catch (e) {
                msg = 'Proxy Initialization Error';
                TP.ifError() ? TP.error(TP.ec(e, msg), TP.LOG) : 0;
                TP.boot.$stderr(msg, e);
                throw e;
            }
        });

    coreInits.push(
        function() {
            var msg = 'Initializing namespace support...';

            //  Install native/non-native namespace support. this may also
            //  involve loading types
            try {
                TP.ifTrace() ? TP.trace(msg, TP.LOG) : 0;
                TP.boot.$displayStatus(msg);

                //  Two classes of namespace, internally supported and those
                //  TIBET has to provide support for
                TP.core.Browser.installNativeNamespaces();
                TP.core.Browser.installNonNativeNamespaces();
            } catch (e) {
                msg = 'Namespace Initialization Error';
                TP.ifError() ? TP.error(TP.ec(e, msg), TP.LOG) : 0;
                TP.boot.$stderr(msg, e);
                throw e;
            }
        });

    coreInits.push(
        function() {
            var msg = 'Initializing default locale...';

            //  Bring in any locale that might be specified
            try {
                TP.ifTrace() ? TP.trace(msg, TP.LOG) : 0;
                TP.boot.$displayStatus(msg);

                if (TP.notEmpty(locale = TP.sys.cfg('tibet.locale'))) {
                    type = TP.sys.require(locale);

                    if (TP.notValid(type)) {
                        msg = 'Locale Initialization Error: ' +
                            locale + ' not found.';
                        TP.boot.$stderr(msg);
                        TP.ifError() ? TP.error(msg, TP.LOG) : 0;

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
                TP.ifError() ? TP.error(TP.ec(e, msg), TP.LOG) : 0;
                TP.boot.$stderr(msg, e);
                throw e;
            }
        });

    postCore = function(aSignal) {
        var results,
            errors,

            msg;

        if (TP.isValid(aSignal)) {
            results = aSignal.at('results');
            errors = aSignal.at('errors');
        }

        if (TP.isValid(errors) && errors.getSize() > 0) {
            // Problems in the initializer sequence.
            TP.boot.shouldStop('Infrastructure Initialization Failure.');
            TP.boot.$stderr('Initialization failure.', TP.FATAL);
            return;
        }

        msg = 'TIBET Initialization complete.';

        TP.ifTrace() ? TP.trace(msg, TP.LOG) : 0;
        TP.boot.$displayStatus(msg);

        // Ensure dependent code knows we're now fully initialized.
        TP.sys.hasInitialized(true);

        // If we initialized without error move on to rendering the UI.
        TP.boot.$setStage('rendering');

        TP.stop('break.rendering');

        //  Recapture starting time in case we broke for debugging.
        TP.boot.$uitime = new Date();

        try {
            //  Compute common sizes, such as font metrics and scrollbar sizes.
            TP.computeCommonSizes();
        } catch (e) {
            msg = 'UI metrics/size computations failed.';
            TP.ifError() ? TP.error(TP.ec(e, msg), TP.LOG) : 0;
            TP.boot.$stderr(msg, e);
            // Fall through and take our chances the UI will display properly.
        }

        TP.sys.loadUIRoot();
    };

    //  Capture the list of type initializers. We'll invoke these first to
    //  ensure the types are properly set up, then let completion on that
    //  task trigger activation of the rest of our workload.
    typeInits = TP.sys.getTypeInitializers();

    //  Create a simple function we'll trigger when the type initializers
    //  have finished running.
    postTypes = function(aSignal) {
        var results,
            errors;

        if (TP.isValid(aSignal)) {
            results = aSignal.at('results');
            errors = aSignal.at('errors');
        }

        if (TP.isValid(errors) && errors.getSize() > 0) {
            TP.boot.shouldStop('Type Initialization Failure(s).');
            TP.boot.$stderr('Initialization failure.', TP.FATAL);
            return;
        }

        // If we initialized types without error move on to infrastructure.
        coreInits.invokeAsync(null, null, true);
    };

    //  Get our handlers ready for responding to our async init/load operations.
    postTypes.observe(typeInits, 'TP.sig.InvokeComplete');
    postCore.observe(coreInits, 'TP.sig.InvokeComplete');

    //  Initialize all the types which own initialize methods so we're sure
    //  they're ready for operation. this may cause them to load other types
    //  so we do this before proxy setup.
    try {
        msg = 'Initializing TIBET types...';

        TP.ifTrace() ? TP.trace(msg, TP.LOG) : 0;
        TP.boot.$displayStatus(msg);

        // Trigger the first async sequence. The handlers take it from there.
        typeInits.invokeAsync();

    } catch (e) {
        msg = 'TIBET Type Initialization Error';
        TP.ifError() ? TP.error(TP.ec(e, msg), TP.LOG) : 0;
        TP.boot.$stderr(msg, e, TP.FATAL);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('loadUIRoot',
function() {

    /**
     * @method loadUIRoot
     * @summary Loads the 'ui root' window with the initial content.
     */

    var rootLoc,
        rootURI,
        rootName,
        rootWindow,

        hasBootToggle,
        request,
        toggleKey,
        bootframe;

    rootLoc = TP.uriJoinPaths('~app_html', TP.sys.cfg('project.rootpage'));

    //  Construct a TP.core.URI wrapper around the location and perform a
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

        return;
    }

    // As long as we're not sharing a UI for booting with the final target UI we
    // can go ahead and hide the root UI while keeping the boot UI visible in
    // case errors occur.
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
    request.atPut(TP.ONLOAD, function(aDocument) {
        var appType,
            bodyElem,
            elem,
            tpElem;

        //  Don't do this if the boot is stopping.
        if (TP.boot.shouldStop()) {
            request.at(TP.ONFAIL)(request);
            return;
        }

        //  Initially set type to TP.core.Application
        appType = TP.sys.require('TP.core.Application');

        //  Go to the body and see what element is the first
        //  child under it.
        if (TP.isElement(bodyElem = TP.documentGetBody(aDocument))) {
            //  If the first child element is real and we can
            //  get a matching TIBET type for it, try to message
            //  it to find out the application type.
            if (TP.isElement(elem = TP.nodeGetFirstChildElement(bodyElem))) {
                tpElem = TP.wrap(elem);

                if (TP.canInvoke(tpElem, 'getApplicationType')) {
                    appType = tpElem.getApplicationType();
                }
            }
        }

        //  Signal TP.sig.AppWillStart and then, if not cancelled,
        //  TP.sig.AppStart for the system once the app tag awakens. Note how we
        //  fork the call so that all child awaken processing has occurred
        //  first.
        /* eslint-disable no-wrap-func,no-extra-parens */
        (function() {

            var didStartHandler;

            if (TP.signal(TP.sys, 'TP.sig.AppWillStart').shouldPrevent()) {
                return;
            }

            //  Set up a handler for 'TP.sig.AppDidStart' that will turn on
            //  the system-wide 'hasStarted' flag when everything, including
            //  any application-specific startup, has finished.
            didStartHandler = function () {

                //  Rip out the observation to avoid polluting the signal
                //  map.
                didStartHandler.ignore(null, 'TP.sig.AppDidStart');

                //  Queue to allow any pending processing to clear.
                (function() {
                    try {
                        TP.boot.$setStage('liftoff');
                    } finally {
                        //  Set our final stage/state flags so dependent
                        //  pieces of logic can switch to their "started"
                        //  states (ie. no more boot log usage etc.)
                        TP.sys.hasStarted(true);
                    }
                }).afterUnwind();
            };

            didStartHandler.observe(null, 'TP.sig.AppDidStart');

            TP.signal(
                TP.sys,
                'TP.sig.AppStart',
                TP.hc('ApplicationType', appType,
                        'ApplicationTag', elem));

            //  Make sure to null out 'elem' to avoid a leak.
            elem = null;
        }).afterUnwind();
        /* eslint-enable no-wrap-func,no-extra-parens */
    });

    request.atPut(TP.ONFAIL, function(req) {

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
    hasBootToggle = TP.notEmpty(TP.sys.cfg('boot.toggle_on'));
    if (TP.sys.cfg('boot.context') !== 'phantomjs' && hasBootToggle) {

        TP.boot.initializeCanvas(TP.win('UIBOOT'));

        //  Configure a toggle so we can always get back to the boot UI as
        //  needed.
        toggleKey = TP.sys.cfg('boot.toggle_on');

        if (!toggleKey.startsWith('TP.sig.')) {
            toggleKey = 'TP.sig.' + toggleKey;
        }

        //  Prep the UI for full console mode.
        bootframe = TP.wrap(TP.byId('UIBOOT', top));
        bootframe.getContentDocument().getBody().addClass('full_console');

        /* eslint-disable no-wrap-func,no-extra-parens */
        //  set up keyboard toggle to show/hide the boot UI
        (function () {
            TP.boot.toggleUI();
            TP.boot.$scrollLog();
        }).observe(TP.core.Keyboard, toggleKey);
        /* eslint-enable no-wrap-func,no-extra-parens */
    }

    //  Set the location of the window (wrapping it to be a TP.core.Window).
    TP.wrap(rootWindow).setContent(rootURI, request);

    return;
});

//  ------------------------------------------------------------------------
//  APPLICATION SHUTDOWN
//  ------------------------------------------------------------------------

TP.sys.defineMethod('terminate',
function(aURI) {

    /**
     * @method terminate
     * @summary Terminates the application by removing the protective
     *     onbeforeunload hooks that TIBET installs and navigating to the
     *     supplied URI. If a URI is not supplied the value from
     *     TP.sys.cfg('tibet.blankpage') is used.
     * @summary This function should be called by applications *only after
     *     all 'quit' logic (e.g. saving data to the server, etc.) has been
     *     executed by the application*.
     * @param {String} aURI The URI to navigate to in order to terminate the
     *     application.
     */

    var canvasName,
        canvasWindow,

        url,
        str;

    //  now we attempt to get a handle to the target canvas -- the window
    //  or frame that will be our top level UI display surface
    canvasName = TP.sys.getUICanvasName();

    //  make sure we have a canvas window
    if (TP.notValid(canvasWindow = TP.sys.getWindowById(canvasName))) {
        TP.boot.$stderr('Canvas specification error. Cannot find window: ' +
                        canvasName);

        return;
    }

    //  Tell the various windows to allow unload, so that the onbeforeunload
    //  hooks that we put into place will be inactive and the user can exit
    //  without prompts.
    if (TP.isElement(TP.documentGetBody(canvasWindow.document))) {
        TP.elementSetAttribute(TP.documentGetBody(canvasWindow.document),
                                'allowUnload',
                                'true');
    }

    if (TP.isElement(TP.documentGetBody(window.document))) {
        TP.elementSetAttribute(TP.documentGetBody(window.document),
                                'allowUnload',
                                'true');
    }

    url = TP.uc(TP.ifInvalid(aURI, TP.sys.cfg('tibet.blankpage')));

    str = url.getLocation();
    if (str.match(/tibet:/)) {
        TP.ifWarn() ?
            TP.warn('Invalid termination URI provided: ' + aURI,
                    TP.LOG) : 0;

        //  didn't resolve properly, not a valid resource URI
        url = TP.uc(TP.sys.cfg('tibet.blankpage'));
    }

    //  close open/registered windows. won't always work, but we can try :)
    TP.core.Window.closeRegisteredWindows();

    TP.signal(TP.sys, 'TP.sig.AppShutdown');

    //  put up the blank page at top, which blows away the app
    window.location = url.getLocation();

    return;
});

//  ------------------------------------------------------------------------

//  We now have a complete kernel in place which means other files can test
//  whether then can invoke kernel versions of primitives etc.
TP.sys.hasKernel(true);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
