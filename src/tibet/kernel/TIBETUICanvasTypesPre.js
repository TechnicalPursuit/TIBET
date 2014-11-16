//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.core.UICanvas
//  ========================================================================

/**
 * @type {TP.core.UICanvas}
 * @synopsis A type intended to be used as a trait type for objects which
 *     provide UI canvas support such as windows, frames, iframes, and the
 *     Mozilla "canvas" object.
 * @description UI canvases are the surfaces you use to display content to the
 *     user. In TIBET these can be a variety of things including windows,
 *     iframes, and canvas objects. When dealing with IFRAME elements in
 *     particular there are a few complexities since an IFRAME exists within a
 *     window and document, but also "contains" a window and document, what
 *     TIBET refers to as the "content window" and "content document". For many
 *     other types these are synonyms for the window and document, but it's
 *     important to use the "content" versions of the API when you want to work
 *     with a canvas's content rather than its container.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:UICanvas');

//  This type is intended to be used as a trait type only, so don't allow
//  instance creation
TP.core.UICanvas.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getCanvasID',
function() {

    /**
     * @name getCanvasID
     * @synopsis Returns the canvas ID for the receiver. For non-canvas elements
     *     this is the ID of their containing canvas (window, iframe, or canvas
     *     object). For canvases themselves it is the global ID of the canvas.
     * @returns {String} The canvas's global ID.
     */

    return this.getGlobalID();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getContentDocument',
function() {

    /**
     * @name getContentDocument
     * @synopsis Returns a TP.core.Document instance wrapping the receiver's
     *     document object. To get the native document object use
     *     getNativeDocument.
     * @returns {TP.core.Document}
     */

    //  rely on the content window so we can leverage caching behavior
    return this.getContentWindow().getContentDocument();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getContentNode',
function() {

    /**
     * @name getContentNode
     * @synopsis Returns the native node of the TP.core.DocumentNode wrapping
     *     the receiver's document object.
     * @returns {Node}
     */

    //  rely on the content window so we can leverage caching behavior
    return this.getContentWindow().getContentDocument().getNativeNode();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getContentWindow',
function() {

    /**
     * @name getContentWindow
     * @synopsis Returns the content window (that is the 'contained window') of
     *     the receiver as a TP.core.Window wrapper.
     * @returns {TP.core.Window} The Window contained by the receiver.
     */

    //  NOTE that TP.core.Window's are uniqued so this instance is usually
    //  being reused at the TP.core.Window level
    return TP.core.Window.construct(this.getNativeContentWindow());
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getGlobalID',
function(assignIfAbsent) {

    /**
     * @name getGlobalID
     * @synopsis Returns the global ID for the receiver.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The canvas's global ID.
     * @todo
     */

    return TP.gid(this.getNativeContentWindow(), assignIfAbsent);
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getLocalID',
function(assignIfAbsent) {

    /**
     * @name getLocalID
     * @synopsis Returns the local ID for the receiver.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The canvas's local ID.
     * @todo
     */

    return TP.lid(this.getNativeContentWindow(), assignIfAbsent);
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getNativeContentDocument',
function() {

    /**
     * @name getNativeContentDocument
     * @synopsis Returns the content document (that is the contained 'document')
     *     of the receiver in a TP.core.Document wrapper.
     * @returns {TP.core.Document} The Document object contained by the
     *     receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getNativeContentWindow',
function() {

    /**
     * @name getNativeContentWindow
     * @synopsis Returns the content window (that is the 'contained window') of
     *     the receiver.
     * @returns {Window} The Window object contained by the receiver.
     */

    return TP.nodeGetWindow(this.getNativeContentDocument());
});

//  ------------------------------------------------------------------------
//  DNU/Backstop
//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name canResolveDNU
     * @synopsis Provides an instance that has triggered DNU machinery with an
     *     opportunity to handle the problem itself. For TP.core.Window and
     *     other UI canvas types we typically check the native window and the
     *     content document to see if either one can respond reasonably to the
     *     method.
     * @param {Object} anOrigin The object asking for help. The receiver in this
     *     case.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     TRUE for TP.core.Node subtypes.
     * @todo
     */

    var win,
        doc;

    //  TODO:   is this something to raise() about?
    if (TP.isEmpty(aMethodName)) {
        return false;
    }

    win = this.getContentWindow();

    //  watch out for recursion by drilling down another level when the
    //  canvas's content window wrapper is the canvas object itself
    if (win === this) {
        win = this.getNativeContentWindow();
    }

    //  if it's a callable (non-dnu) function we can resolve it
    if (TP.canInvoke(win, aMethodName)) {
        return true;
    }

    //  if the window object wrapper can answer then we'll defer to it
    if (TP.canInvoke(win, 'canResolveDNU')) {
        return win.canResolveDNU(anOrigin,
                                    aMethodName,
                                    anArgArray,
                                    callingContext);
    }

    //  "phase two", check the document
    doc = this.getContentDocument();

    if (TP.canInvoke(doc, aMethodName)) {
        return true;
    }

    if (TP.canInvoke(doc, 'canResolveDNU')) {
        return doc.canResolveDNU(anOrigin,
                                    aMethodName,
                                    anArgArray,
                                    callingContext);
    }

    //  out of options
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name resolveDNU
     * @synopsis Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given.
     * @description Handles resolution of methods which have triggered the
     *     inferencer. For TP.core.Window the resolution process is used in
     *     conjunction with method aspects to allow the receiver to translate
     *     method calls.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Object} The result of invoking the method using the native
     *     window object.
     * @todo
     */

    var win,
        func;

    //  some canvases can leverage the content window object wrappers
    if (TP.notValid(win = this.getContentWindow())) {
        return this.raise('TP.sig.InvalidCanvas');
    }

    //  watch out for recursion by drilling down another level when the
    //  canvas's content window wrapper is the canvas object itself
    if (win === this) {
        if (TP.notValid(win = this.getNativeContentWindow())) {
            return this.raise('TP.sig.InvalidCanvas');
        }
    }

    try {
        if (!TP.isCallable(func = win[aMethodName])) {
            return win.resolveDNU(anOrigin,
                                    aMethodName,
                                    anArgArray,
                                    callingContext);
        }
    } catch (e) {
    }

    //  If there weren't any arguments in the arg array, then we have
    //  only to call the func.
    if (TP.notValid(anArgArray) || (anArgArray.length === 0)) {
        //  Return the execution of the func
        return win.func();
    }

    //  Return the application of the func using the array of
    //  arguments as the argument array for invocation.
    return func.apply(win, anArgArray);
});

//  ------------------------------------------------------------------------
//  Content
//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getContentMIMEType',
function() {

    /**
     * @name getContentMIMEType
     * @synopsis Returns the receiver's "content MIME type", that is the MIME
     *     type that the receiver can render most effectively.
     * @returns {String} The receiver's MIME type.
     */

    return this.getContentDocument().getContentMIMEType();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @name setContent
     * @synopsis Sets the content of the receiver's native DOM counterpart to
     *     the node supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @todo
     */

    this.getContentDocument().setContent(aContentObject, aRequest);

    return;
});

//  ========================================================================
//  TP.core.Window
//  ========================================================================

/**
 * @type {TP.core.Window}
 * @synopsis TP.core.Window is a top-level type for wrapping windows and frames.
 * @description In TIBET you typically operate with documents and elements via
 *     the TP.core.Node hierarchy. The TP.core.Window hierarchy is intended to
 *     provide functional support for window-level operations. When creating a
 *     TP.core.Window the specific subtype vended back on construct().
 *
 *     The registerWindow function constructs a hash of information for each
 *     window managed by this object and which are used by various methods in
 *     the system to handle onload events, etc. There are several keys which get
 *     registered with this hash:
 *
 *     'nativeWindow' -> A reference to the native Window. 'tpWindow' -> A
 *     TP.core.Window object that acts the 'wrapper' for the window.
 *     'loadFunctions' -> An Array of Functions to run when the Window's
 *     document is (re)loaded. This Array is cleared after every onload is
 *     fired. 'shouldAwake' -> A Boolean that determines whether or not to
 *     awaken content that has just been written into the window's document,
 *     completely replacing the document's current content. This flag is cleared
 *     after every onload is fired.
 *
 *     Keep in mind that TP.core.Window instances are fundamentally wrappers
 *     around native windows and frames, they are not some form of OS-level
 *     window themselves.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:Window');

//  Trait in UI canvas behavior, then any methods we define will override the
//  defaults (this would be true in any case unless we force overrides)
TP.core.Window.addTraitsFrom(TP.core.UICanvas);

TP.core.Window.Inst.resolveTraits(TP.ac('canResolveDNU', 'resolveDNU'),
                                    TP.core.UICanvas);

//  ------------------------------------------------------------------------

TP.definePrimitive('tpwin',
function(anObject) {

    /**
     * @name tpwin
     * @synopsis A general purpose routine that can return a TP.core.Window
     *     based on a variety of input object types.
     * @param {Object} anObject A window, node, or other object which can
     *     provide a TP.core.Window or be used to acquire one.
     * @returns {TP.core.Window} A TIBET window wrapper.
     */

    var win;

    if (TP.notValid(anObject)) {
        return TP.core.Window.construct();
    } else if (TP.isWindow(anObject)) {
        return TP.core.Window.construct(anObject);
    } else if (TP.isElement(anObject) &&
                (anObject.tagName.toLowerCase() === 'iframe' ||
                    anObject.tagName.toLowerCase() === 'object')) {
        return TP.core.Window.construct(
                                TP.elementGetIFrameWindow(anObject));
    } else if (TP.isKindOf(anObject, TP.core.Window)) {
        return anObject;
    } else if (TP.isNode(anObject)) {
        if (TP.notValid(win = TP.nodeGetWindow(anObject))) {
            return;
        }

        return TP.core.Window.construct(win);
    } else if (TP.isKindOf(anObject, TP.core.Node)) {
        return anObject.getWindow();
    }

    return;
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the default window spec for instances of this type
TP.core.Window.Type.defineAttribute('$defaultWindowSpec');

//  hash containing window information by global ID
TP.core.Window.Type.defineAttribute('windowRegistry', TP.hc());

//  a slot used by various system files to tell if the window's document is
//  currently being written into.
TP.core.Window.Type.defineAttribute('$isDocumentWriting');

//  a TP.lang.Hash containing either media queries or a geo query used for
//  signaling either media query or geo signals, keyed by the 'origin' used to
//  observe
TP.core.Window.Type.defineAttribute('$queries', TP.hc());

//  a TP.lang.Hash containing media query handler Functions, used to signal
//  media query changes, keyed by the 'origin' used to observe
TP.core.Window.Type.defineAttribute('$mqEntries', TP.hc());

//  a Number containing the unique identifier for the currently active
//  'geolocation watcher'
TP.core.Window.Type.defineAttribute('$geoWatch');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name addObserver
     * @synopsis Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     * @todo
     */

    var map,

        originStr,

        queryCount,

        originParts,
        winID,
        queryStr,
        win,

        geoWatch,
        mediaQuery,

        mqHandler;

    map = this.get('$queries');

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure that the origin matches one of the kinds of queries we can
    //  process.
    originStr = TP.str(anOrigin);
    if (!/@media |@geo/.test(originStr)) {
        return this.raise('TP.sig.InvalidOrigin');
    }

    //  If our 'queries' map does not already have an entry
    if (TP.notValid(queryCount = map.at(originStr))) {

        //  The origin should be something like 'window_0@geo' or
        //  'window@media screen and (max-width:800px)'
        originParts = originStr.split(/@media |@geo/);
        if (originParts.getSize() !== 2) {
            return this.raise('TP.sig.InvalidQuery');
        }

        winID = originParts.first();
        queryStr = originParts.last();

        //  Can't find a Window? Bail out.
        if (!TP.isWindow(win = TP.sys.getWindowById(winID))) {
            return this.raise('TP.sig.InvalidWindow');
        }

        //  If the caller is interested in Geolocation stuff, make sure we're on
        //  a platform that supports it.
        if (/@geo/.test(originStr)) {

            if (TP.isValid(win.navigator.geolocation)) {

                //  Set up the 'watch' with a success callback that signals a
                //  GeoPositionChanged and an error callback that signals a
                //  GeoPositionError
                geoWatch = win.navigator.geolocation.watchPosition(
                    function(position) {
                        var coords,
                            data;

                        coords = position.coords;

                        //  Break up the returned data into a well structured
                        //  hash data structure.
                        data = TP.hc(
                                'latitude', coords.latitude,
                                'longitude', coords.longitude,
                                'altitude', coords.altitude,
                                'accuracy', coords.accuracy,
                                'altitudeAccuracy', coords.altitudeAccuracy,
                                'heading', coords.heading,
                                'speed', coords.speed,
                                'timestamp', position.timestamp
                                );

                        TP.signal(originStr,
                                    'TP.sig.GeoPositionChanged',
                                    data);
                    },
                    function(error) {
                        var errorMsg;

                        errorMsg = '';

                        //  Check for known errors
                        switch (error.code) {

                            case error.PERMISSION_DENIED:
                                errorMsg = TP.sc('This website does not have ',
                                                    'permission to use ',
                                                    'the Geolocation API');
                                break;

                            case error.POSITION_UNAVAILABLE:
                                errorMsg = TP.sc('The current position could ',
                                                    'not be determined.');
                                break;

                            case error.PERMISSION_DENIED_TIMEOUT:
                                errorMsg = TP.sc('The current position could ',
                                                    'not be determined ',
                                                    'within the specified ',
                                                    'timeout period.');
                                break;
                        }

                        //  If it's an unknown error, build a errorMsg that
                        //  includes information that helps identify the
                        //  situation so that the error handler can be updated.
                        if (errorMsg === '') {
                            errorMsg = TP.sc('The position could not be ',
                                                'determined due to an unknown ',
                                                'error (Code: ') +
                                                error.code.toString() +
                                                ').';
                        }

                        TP.signal(originStr,
                                    'TP.sig.GeoPositionError',
                                    errorMsg);
                    });

                this.set('$geoWatch', geoWatch);
            }
        } else if (/@media /.test(originStr)) {

            //  Otherwise, it was a media query, so define a handler that will
            //  signal CSSMediaActive or CSSMediaInactive depending on whether
            //  the query matches or not.
            mqHandler = function(aQuery) {
                            if (aQuery.matches) {
                              TP.signal(originStr,
                                        'TP.sig.CSSMediaActive',
                                        aQuery.media);
                            } else {
                              TP.signal(originStr,
                                        'TP.sig.CSSMediaInactive',
                                        aQuery.media);
                            }
                        };

            //  Perform the query and get the MediaQueryList back. Note that
            //  this will also register the handler so that the callback fires
            //  when the environment changes such that the query succeeds or
            //  fails.
            mediaQuery = TP.windowQueryCSSMedia(win, queryStr, mqHandler);

            //  Store off a pair of the MediaQueryList and the handler with the
            //  query string as a key. This will allow us to unregister the
            //  query and handler in the removeObserver() call below
            this.get('$mqEntries').atPut(
                queryStr, TP.ac(mediaQuery, mqHandler));
        }

        //  Kick off the map count with a 1. Subsequent queries using the same
        //  query string will just kick the counter.
        map.atPut(originStr, 1);
    } else {

        //  Otherwise, just kick the query count in the map
        map.atPut(originStr, queryCount + 1);
    }

    //  Always tell the notification to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name removeObserver
     * @synopsis Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to ignore.
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     * @todo
     */

    var map,

        originStr,

        queryCount,

        originParts,
        winID,
        win,

        handlers,
        mqEntry;

    map = this.get('$queries');

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure that the origin matches one of the kinds of queries we can
    //  process.
    originStr = TP.str(anOrigin);
    if (!/@media |@geo/.test(originStr)) {
        return this.raise('TP.sig.InvalidOrigin');
    }

    //  If our 'queries' map has an entry for the query, then it's a
    //  registration that we care about.
    if (TP.isValid(queryCount = map.at(originStr))) {

        //  The origin should be something like 'window_0@geo' or
        //  'window@media screen and (max-width:800px)'
        originParts = originStr.split(/@media |@geo/);
        if (originParts.getSize() !== 2) {
            return this.raise('TP.sig.InvalidQuery');
        }

        winID = originParts.first();

        //  If we're the last handler interested in this query, then go to
        //  the trouble of unregistering it, etc.
        if (queryCount === 1) {

            if (/@geo/.test(originStr)) {

                if (TP.isValid(win.navigator.geolocation)) {

                    //  Make sure to both clear the watch and set our internal
                    //  variable to null
                    win.navigator.geolocation.clearWatch(this.get('$geoWatch'));
                    this.set('$geoWatch', null);
                }
            } else if (/@media /.test(originStr)) {

                if (TP.notEmpty(handlers = this.get('$mqEntries')) &&
                        TP.isValid(mqEntry = handlers.at(originStr))) {

                    if (TP.isMediaQueryList(mqEntry.first())) {
                        mqEntry.first().removeListener(mqEntry.last());
                    }

                    handlers.removeKey(originStr);
                }
            }

            map.removeKey(originStr);

        } else {
            //  Otherwise, there are multiple handlers interested in this query,
            //  so just reduce the counter by one.
            map.atPut(originStr, queryCount - 1);
        }
    }

    //  Always tell the notification to remove our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('construct',
function(aWindow, aName, aSpec) {

    /**
     * @name construct
     * @synopsis Constructs a new instance of the receiver, or returns the
     *     previously constructed instance for the window provided. When
     *     creating a new window you can provide a URI, name, and specification
     *     (feature) string/hash as with open().
     * @param {Window|String} aWindow A window handle. If the handle is an
     *     actual window reference a proper subtype is returned. If the handle
     *     is a string the assumption is a new OS window object if no '.' is in
     *     the name.
     * @param {String} aName The name to give this window. This must be unique.
     * @param {TP.lang.Hash|String} aSpec A 'spec string' of key=value pairs or
     *     a hash that can be used to produce a feature string. You should use
     *     'top' and 'left' on all browsers and TIBET will convert as needed.
     * @returns {TP.core.Window} The new instance.
     * @todo
     */

    var theWindow,
        inst;

    //  If no valid native window was supplied, then execute the type's
    //  open method. It will turn around and execute this method with
    //  a native window handle
    if (TP.notValid(aWindow)) {
        //  This will call us back -- we definitely need to return here
        return TP.core.Window.open('', aName, aSpec);
    }

    if (TP.isString(aWindow) && TP.regex.VALID_WINDOWNAME.test(aWindow)) {
        theWindow = TP.sys.getWindowById(aWindow);
    } else if (!TP.isWindow(aWindow)) {
        //  NOTE that we want to ensure that the object provided is at least
        //  a kind of the receiving type, otherwise we can't return it
        if (!TP.isKindOf(aWindow, this)) {
            return this.raise('TP.sig.InvalidParameter');
        } else {
            return aWindow;
        }
    } else {
        theWindow = aWindow;
    }

    //  if we've got an instance registered for this window we can return it
    inst = TP.core.Window.getWindowInfo(theWindow, 'tpWindow');
    if (TP.isValid(inst)) {
        return inst;
    }

    //  allocate and build the instance
    inst = this.callNextMethod();

    //  ensure the window can integrate with TIBET
    TP.core.Window.instrument(theWindow);

    //  register the window for easy reference/uniquing
    TP.core.Window.registerWindow(theWindow);
    TP.core.Window.setWindowInfo(theWindow, 'tpWindow', inst);

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('closeRegisteredWindows',
function() {

    /**
     * @name closeRegisteredWindows
     * @synopsis Closes any "auxillary" windows opened by TIBET. Typically
     *     called when you exit the TIBET window.
     */

    var dict,
        keys;

    dict = this.get('windowRegistry');
    keys = TP.keys(dict);

    keys.perform(
        function(key) {

            var win,
                info;

            info = dict.at(key);
            win = info.at('nativeWindow');

            if (TP.isWindow(win)) {
                //  don't operate on the codebase window or its children
                if ((win !== top) && (win.parent !== top)) {
                    win.close();
                }
            }
    });

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('getOpenWindows',
function() {

    /**
     * @name getOpenWindows
     * @synopsis Returns an array of all windows TIBET is aware of (registered
     *     windows) that are open.
     * @returns {Array} An array of native window instances.
     * @todo
     */

    var dict,
        keys,
        arr;

    arr = TP.ac();

    dict = this.get('windowRegistry');
    keys = TP.keys(dict);

    keys.perform(
        function(key) {

            var win,
                info;

            info = dict.at(key);
            win = info.at('nativeWindow');

            if (TP.isWindow(win) && !win.closed) {
                arr.push(win);
            }
    });

    return arr;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('getWindowInfo',
function(aWindowOrID, aKey) {

    /**
     * @name getWindowInfo
     * @synopsis Return the hash of information (load signals, onload signals,
     *     etc.) for the window, or window ID and key provided. If no key is
     *     provided the entire hash of window information is returned.
     * @param {Window|String} aWindowOrID The window, or window ID to use as the
     *     first key.
     * @param {String} aKey The key into the specific window's info hash.
     * @returns {Object} The value registered for the key provided.
     * @todo
     */

    var winID,
        dict;

    //  get the ID
    winID = TP.gid(aWindowOrID);

    dict = TP.core.Window.get('windowRegistry').at(winID);

    //  when we have a hash and key we return the value we find
    if (TP.isValid(dict) && TP.notEmpty(aKey)) {
        return dict.at(aKey);
    }

    //  may or may not be a hash, but there's also no key so we return
    //  the hash if there is one
    return dict;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('getWindowSpec',
function() {

    /**
     * @name getWindowSpec
     * @synopsis Returns the window specification hash used by default when
     *     creating instances of this type.
     * @returns {TP.lang.Hash}
     * @todo
     */

    return this.$get('$defaultWindowSpec');
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('getWindowType',
function() {

    /**
     * @name getWindowType
     * @synopsis Returns the type object which should be used to construct new
     *     instances of OS window wrappers.
     * @returns {TP.lang.RootObject.<TP.core.Window>} The TP.core.Window type
     *     object.
     */

    return this.$get('defaultWindowType').asType();
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('installWindowBase',
function(aWindow) {

    /**
     * @name installWindowBase
     * @synopsis Installs a set of common functions onto aWindow to enhance that
     *     window's capability within the TIBET framework.
     * @param {The} aWindow window to install the TIBET functionality on.
     * @returns {TP.core.Window} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('installDocumentBase',
function(aWindow) {

    /**
     * @name installDocumentBase
     * @synopsis Instruments the document belonging to aWindow with TIBET
     *     specific functions.
     * @param {Window} aWindow The window of the document to install the
     *     functions on.
     * @returns {TP.core.Window} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('instrument',
function(aWindow) {

    /**
     * @name instrument
     * @synopsis Instruments a native window to set it up for use with TIBET.
     * @description This method instruments a native window to provide common
     *     facilities to consumers of the window, such as component acquisition,
     *     DHTML or event facilties. This also includes setting the opener, the
     *     onerror handler, etc.
     * @param {Window|TP.core.Window} aWindow The window to instrument.
     */

    var nativeWindow;

    if (TP.isWindow(aWindow)) {
        nativeWindow = aWindow;
    } else if (TP.isKindOf(aWindow, TP.core.Window)) {
        nativeWindow = aWindow.getNativeWindow();
    } else {
        return this.raise('TP.sig.InvalidWindow');
    }

    //  NB: Do this again in case the 'native window' call from above is not
    //  valid
    if (TP.notValid(nativeWindow)) {
        return this.raise('TP.sig.InvalidWindow');
    }

    //  If the native window is already instrumented, return here.
    if (TP.windowIsInstrumented(nativeWindow)) {
        return;
    }

    //  Set the native window's opener to our own window to help it find
    //  TIBET when asked
    //  TODO:   is this WRONG to do?
    if (TP.notValid(nativeWindow.opener)) {
        nativeWindow.opener = window;
    }

    //  Set the native window's tibet references to the proper ones.
    nativeWindow.$$tibet = window;

    //  Set the other common TIBET root objects, used for constants etc.
    nativeWindow.TP = window.TP;

    //  Set the native window's onerror handler to the standard TIBET
    //  onerror handler, so that errors that occur in the window are
    //  processed by the TIBET error handling system.
    nativeWindow.onerror = TP.sys.onerror;

    //  install common (base) functions on window/document
    TP.core.Window.installWindowBase(nativeWindow);
    TP.core.Window.installDocumentBase(nativeWindow);

    //  install custom (extension) functions on window/document
    TP.core.Window.installWindowExtensions(nativeWindow);
    TP.core.Window.installDocumentExtensions(nativeWindow);

    //  Go ahead and set the flag that we have been instrumented. Putting
    //  this window in the window registry really has nothing to do with
    //  whether we were instrumented or not.
    nativeWindow.$$instrumented = true;

    //  If the window is an iframe window, make sure that its name is set to
    //  the id of the iframe element holding it.
    if (TP.isIFrameWindow(nativeWindow)) {
        nativeWindow.name = nativeWindow.frameElement.id;
    }

    //  Assign ids to common elements, such as the root element, the head
    //  element and the body element.
    TP.windowAssignCommonIds(nativeWindow);

    //  Register the native window
    TP.core.Window.registerWindow(nativeWindow);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('open',
function(url, aName, aSpec, shouldReplace) {

    /**
     * @name open
     * @synopsis Constructs a new TP.core.Window instance (having retrieved a
     *     real native window to go underneath it and having set it up for use
     *     with TIBET).
     * @param {TP.core.URI|String} url The URL to load into the window.
     * @param {String} aName The name to give this window. This must be unique.
     * @param {TP.lang.Hash|String} aSpec A 'spec string' of key=value pairs or
     *     a hash that can be used to produce a feature string. You should use
     *     'top' and 'left' on all browsers and TIBET will convert as needed.
     * @param {Boolean} shouldReplace Whether the content should be replaced if
     *     the window is already open.
     * @returns {Window} The newly constructed window.
     * @todo
     */

    var theURL,
        theName,
        win,
        newWindow;

    //  if the URI is blank ('') this will return null
    theURL = TP.uc(url);
    if (TP.notValid(theURL)) {
        //  use the application-specific "blank" so we stay consistent with
        //  the application's look and feel requirements while avoiding
        //  Mozilla's about:blank noise
        theURL = TP.uc(TP.sys.cfg('tibet.blankpage'));
    }

    theURL = theURL.getLocation();

    //  Don't let any windows get constructed without a unique name
    if (TP.isEmpty(aName)) {
        theName = TP.getNextWindowName();
    } else {
        theName = aName;
    }

    //  NOTE that our TP.open() call will convert the spec for us, and that
    //  we ignore the URI for now so the open will be synchronous
    if ((win = TP.open('', theName, aSpec, shouldReplace))) {
        //  we have to have a valid win reference here or the construct call
        //  will call back to TP.open() and we'll recurse
        newWindow = this.construct(win);
        newWindow.setLocation(theURL);

        return newWindow;
    }

    //  Couldn't get a real native window so there's no sense in creating a
    //  wrapper. Return null here.
    return null;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('registerOnloadFunction',
function(aWindowOrID, aFunction, runFirst) {

    /**
     * @name registerOnloadFunction
     * @synopsis Registers a function to be executed when the onload is fired in
     *     the window provided. Since this registration is separate from the
     *     actual existence of the window (you can register by ID) this can be
     *     done without requiring the window to exist.
     * @param {Window|String} aWindowOrID The window, or window ID to use as the
     *     first key.
     * @param {Function} aFunction The function to register which will be run
     *     when the 'onload' event is triggered for aWindow.
     * @param {Boolean} runFirst Whether or not the function should run before
     *     the other functions in the list.
     * @todo
     */

    var shouldRunFirst,

        winID,
        arr;

    shouldRunFirst = TP.ifInvalid(runFirst, false);

    //  get the ID value
    winID = TP.gid(aWindowOrID);

    //  note that we build this array lazily
    arr = TP.core.Window.getWindowInfo(winID, 'loadFunctions');
    if (TP.notValid(arr)) {
        arr = TP.ac();
        TP.core.Window.setWindowInfo(winID, 'loadFunctions', arr);
    }

    if (shouldRunFirst) {
        arr.unshift(aFunction);
    } else {
        arr.add(aFunction);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('registerWindow',
function(aWindow) {

    /**
     * @name registerWindow
     * @synopsis Registers aWindow with the window information registry.
     * @description If aWindow is already registered with the window registry,
     *     this method will just return. Otherwise, it will check to make sure
     *     that this window isn't registered under another name (it might have
     *     been, if it was registered before the real global ID could have been
     *     computed). If it isn't found it will be registered and a new
     *     information hash will be constructed for it.
     * @param {Window} aWindow The window to register.
     * @returns {TP.core.Window} The receiver.
     */

    var winID,
        info,
        registry,
        foundOne;

    if (!TP.isWindow(aWindow)) {
        return this.raise('TP.sig.InvalidWindow');
    }

    //  get the ID
    winID = TP.gid(aWindow);

    //  If aWindow is already registered under its globalID
    info = TP.core.Window.getWindowInfo(winID);
    if (TP.notEmpty(info) && info.at('nativeWindow') === aWindow) {
        return this;
    }

    //  Otherwise, make sure its not registered under another name. This
    //  window might have registered under another name if its globalID
    //  couldn't have been computed at the time of registration. If one is
    //  found, reregister it under the new globalID
    foundOne = false;

    registry = TP.core.Window.get('windowRegistry');

    registry.perform(
        function(itemPair) {

            if (TP.notValid(itemPair) || TP.notValid(itemPair.last())) {
                foundOne = false;
            } else {
                if (itemPair.last().at('nativeWindow') === aWindow) {
                    registry.replaceKey(itemPair.first(), winID);
                    foundOne = true;
                }
            }
    });

    if (foundOne) {
        return this;
    }

    //  if we found a hash for that key, but the window reference has
    //  shifted for some reason, we'll update our map
    if (TP.notEmpty(info)) {
        info.atPut('nativeWindow', aWindow);
    } else {
        //  Otherwise, it's completely new so put a new information
        //  hash into the registry (note here that we also capture the
        //  window's because on Mozilla 1.8+, this reference will be reset
        //  if we don't capture it here).
        registry.atPut(winID, TP.hc('nativeWindow', aWindow));
    }

    //  make sure the window's ID is a unique global value
    if (TP.notValid(TP.global[winID])) {
        //  make the window's ID a global handle to it
        TP.global[winID] = aWindow;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('removeWindowInfo',
function(aWindowOrID, aKey) {

    /**
     * @name removeWindowInfo
     * @synopsis Removes a value in the window's information hash, or the entire
     *     hash when no key is provided.
     * @param {Window|String} aWindowOrID The window, or window ID to use as the
     *     first key.
     * @param {String} aKey The key into the specific window's info hash.
     * @todo
     */

    var winID,
        dict,
        registry;

    //  get the ID
    winID = TP.gid(aWindowOrID);

    registry = TP.core.Window.get('windowRegistry');

    if (TP.notValid(dict = registry.at(winID))) {
        return;
    }

    //  no key? remove hash entirely
    if (TP.isEmpty(aKey)) {
        registry.removeKey(winID);
    } else {
        dict.removeKey(aKey);
    }

    //  TODO: Should we also remove window info for iframes that may be
    //  embedded in this window?

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('$setWindowContent',
function(aWindowOrID, theContent, aLoadedFunction) {

    /**
     * @name $setWindowContent
     * @synopsis Sets the content of aWindowOrID's window to the content
     *     provided. The content is typically specified as a URI string whose
     *     content is acquired and processed.
     * @param {Window|String} aWindowOrID The window or window name.
     * @param {String|URI|Node} theContent The content.
     * @param {Function} aLoadedFunction An optional 'loaded' function that will
     *     execute when the content is finished loading.
     * @todo
     */

    var win,
        url,
        content;

    win = TP.sys.getWindowById(aWindowOrID);
    if (TP.notValid(win)) {
        this.raise('TP.sig.InvalidWindow',
                    'Unable to find window: ' + aWindowOrID);

        return;
    }

    if (TP.isString(theContent)) {
        url = TP.uc(theContent);
        if (TP.isURI(url)) {
            content = url.getResource(TP.hc('async', false));
        } else {
            content = theContent;
        }
    } else if (TP.isNode(theContent)) {
        content = theContent;
    } else if (TP.isKindOf(theContent, TP.core.URI)) {
        content = theContent.getResource(TP.hc('async', false));
    } else {
        this.raise('TP.sig.InvalidParameter');

        return;
    }

    //  TODO: feed the content to the shell for processing...
    TP.htmlDocumentSetContent(win.document, content, aLoadedFunction);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('setWindowInfo',
function(aWindowOrID, aKey, aValue) {

    /**
     * @name setWindowInfo
     * @synopsis Sets a value in the window's information hash. When the hash
     *     doesn't exist yet it is constructed as a result of this call.
     * @param {Window|String} aWindowOrID The window, or window ID to use as the
     *     first key.
     * @param {String} aKey The key into the specific window's info hash.
     * @param {Object} aValue The value to set for the key.
     * @returns {Object} The value registered for the key provided.
     * @todo
     */

    var winID,
        registry,
        dict;

    //  get the ID
    winID = TP.gid(aWindowOrID);

    registry = TP.core.Window.get('windowRegistry');

    if (TP.notValid(dict = registry.at(winID))) {
        dict = TP.hc();
        registry.atPut(winID, dict);
    }

    dict.atPut(aKey, aValue);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the id (global ID) of our native window
TP.core.Window.Inst.defineAttribute('$windowID');

//  the TP.core.Document wrapper for the window's document. This is managed
//  by the setContent method on TP.core.Window to keep the native document
//  current
TP.core.Window.Inst.defineAttribute('contentDoc');

//  a holder for common instance data associated with the various locations
//  which are displayed by this window
TP.core.Window.Inst.defineAttribute('instanceData');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('init',
function(aWindow) {

    /**
     * @name init
     * @synopsis Initializes a new instance.
     * @param {Window|String} aWindow A window handle. If the handle is an
     *     actual window reference a proper subtype is returned. If the handle
     *     is a string the assumption is a new OS window object if no '.' is in
     *     the name.
     * @returns {TP.core.Window} The new instance.
     */

    var winID;

    //  allocate and build the instance
    this.callNextMethod();

    //  Make sure that any native window passed in has a unique name.
    //  Note that simply by asking we'll force window naming to occur
    //  for any windows not currently named
    winID = TP.gid(aWindow);

    //  save our window ID for later use in window acquisition
    this.$set('$windowID', winID);

    //  set our actual TIBET ID to the window ID so they're equivalent.
    this.setID(winID);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('setLocation',
function(aURL, wantsHistoryEntry, onloadFunction) {

    /**
     * @name setLocation
     * @synopsis Sets the window's location to the URL provided. This method is
     *     similar to the native '<windowRef>.location =' call, except that it
     *     attempts to ensure that the onloadFunction is executed onload.
     * @param {String|TP.core.URI} aURL The URL of the content to load into this
     *     window.
     * @param {Boolean} wantsHistoryEntry Whether or not a TIBET 'history' entry
     *     should be created (and the main window URL hash adjusted).
     * @param {Function} onloadFunction The setup function to execute as part of
     *     the document's 'onload' processing.
     * @returns {TP.core.Window} The receiver.
     * @todo
     */

    var url,
        win,
        doc,
        blankURI;

    TP.stop('break.window_location');

    if (TP.notValid(aURL)) {
        return this.raise('TP.sig.InvalidURI');
    }

    win = this.getNativeWindow();
    doc = this.getNativeDocument();

    //  !!!NOTE!!!
    //  We do *not* set the 'tibet_settinglocation' flag here on purpose,
    //  since there may be unprocessed markup in the target location and we
    //  *want* the hook file to redirect back through the
    //  TP.windowResetLocation() call to 'grab the body content and process
    //  it.

    //  Clear any onbeforeunload handler so we can do the requested work.

    //  Note that we have to set this 'allowUnload' attribute on the
    //  window's document's body which can then be checked by the
    //  onbeforeunload() handler because, on IE, once the onbeforeunload()
    //  handler is installed it can't be uninstalled. This attribute is
    //  then checked in the actual onbeforeunload handler itself.
    if (TP.isElement(TP.documentGetBody(doc))) {
        TP.elementSetAttribute(TP.documentGetBody(doc),
                                'allowUnload',
                                'true');
    }

    //  If empty then we clear the window
    if (TP.isEmpty(aURL)) {
        //  Load the app's version of the blank file
        blankURI = TP.uc(TP.sys.cfg('tibet.blankpage'));
        this.getNativeWindow().location = blankURI.getLocation();

        return this;
    }

    //  need a valid URI and creating one ensures we have one regardless of
    //  what we were originally provided. NOTE that we do this operation
    //  after checking for '' as a location which is how we clear content
    if (TP.notValid(url = TP.uc(aURL))) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  register any onloadFunction so if the location triggers the proper
    //  events we'll run it. NOTE that this means the location has to be
    //  TIBET-enabled either via the hook file or via an onload handler etc.
    if (TP.isCallable(onloadFunction)) {
        TP.core.Window.registerOnloadFunction(win, onloadFunction);
    }

    //  register our own onload function to manage keyboard and focus issues
    TP.core.Window.registerOnloadFunction(
        win,
        function(aDocument) {

            var theWindow;

            theWindow = TP.nodeGetWindow(aDocument);

            //  Set up any 'backspace' key handlers on the window so that
            //  backspace key presses won't cause the standard "Back" button
            //  behavior that would cause the TIBET frame to be flushed.
            TP.windowSetupBackKeyHandlers(theWindow);

            //  Focus the window so that key events that occur just after
            //  application go the window and are then dispatched properly.
            theWindow.focus();

            //  Set up any focus handlers for the various windows/frames
            //  that we use in TIBET so that the user experiences 'proper'
            //  behavior when using the keyboard during application
            //  execution.
            TP.windowSetupFocusHandlers(theWindow);

            if (TP.notFalse(wantsHistoryEntry)) {
                TP.core.History.setLocation(aURL);
            }
        });

    //  We still wrap this in a try...catch just to make sure.
    try {
        win.location = TP.uriExpandPath(url.getLocation());
    } catch (e) {
        this.raise('TP.sig.InvalidWindow',
                    'Unable to set window location.', TP.ec(e));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.UICanvas Interface
//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asDumpString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asDumpString = true;

    try {
        str = TP.tname(this) +
                    ' :: ' +
                    '(' + TP.dump(this.getNativeWindow()) + ')';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asDumpString;

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asJSONSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asJSONSource = true;

    try {
        str = '{"type":' + TP.tname(this).quoted('"') + ',' +
                '"data":{' + TP.json(this.getNativeWindow()) + '}}';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asJSONSource;

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asHTMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asHTMLString = true;

    try {
        str = '<span class="TP_core_Window ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                TP.htmlstr(this.getNativeWindow()) +
                '<\/span>';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asHTMLString;

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asPrettyString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asPrettyString = true;

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '<\/dd>' +
                    TP.pretty(this.getNativeWindow()) +
                    '<\/dl>';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asPrettyString;

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return TP.join('TP.core.Window.construct(' +
                     TP.src(this.getNativeWindow()) +
                     ')');
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the receiver as a string.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.Window's String representation. The default is true.
     * @returns {String} The receiver as a String.
     */

    var wantsVerbose,
        str;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return TP.objectToString(this);
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asString = true;

    try {
        str = TP.tname(this) +
                    ' :: ' +
                    '(' + TP.str(this.getNativeWindow()) + ')';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asString;

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asXMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asXMLString = true;

    try {
        str = '<instance type="' + TP.tname(this) + '">' +
                    TP.xmlstr(this.getNativeWindow()) +
                    '<\/instance>';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asXMLString;

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('close',
function() {

    /**
     * @name close
     * @synopsis Closes the receiver.
     */

    //  this will close the window, and the unload hook should do the rest
    this.getNativeWindow().close();

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getCanvasID',
function() {

    /**
     * @name getCanvasID
     * @synopsis Returns the receiver's "canvas ID" or global ID.
     * @returns {String} The window's global ID.
     */

    //  cached on creation
    return this.$get('$windowID');
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getContentDocument',
function() {

    /**
     * @name getContentDocument
     * @synopsis Returns a TP.core.Document instance wrapping the receiver's
     *     document object. To get the native document object use
     *     getNativeDocument().
     * @returns {TP.core.Document} The TP.core.Document object wrapping the
     *     receiver's native document object.
     */

    var win,
        doc;

    if (TP.notValid(win = this.getNativeWindow())) {
        return this.raise('TP.sig.InvalidWindow');
    }

    //  try to reuse one TP.core.Document if at all possible
    if (TP.isDocument(doc = this.$get('contentDoc'))) {
        //  need to check Document objects - they can become detached or
        //  otherwise messed with
        if (doc.getNativeNode() === win.document) {
            return doc;
        }
    }

    //  build/save a new wrapper for the current document object
    doc = TP.core.Document.construct(win.document);
    this.$set('contentDoc', doc, false);

    return doc;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getContentWindow',
function() {

    /**
     * @name getContentWindow
     * @synopsis Returns the content window (that is the 'contained window') of
     *     the receiver as a TP.core.Window wrapper. For TP.core.Window
     *     instances this returns the instance itself.
     * @returns {TP.core.Window} The Window contained by the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getGlobalID',
function(assignIfAbsent) {

    /**
     * @name getGlobalID
     * @synopsis Returns the receiver's global ID.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The window's global ID (it's fully-qualified name).
     * @todo
     */

    //  cached on creation
    return this.$get('$windowID');
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getLocalID',
function(assignIfAbsent) {

    /**
     * @name getLocalID
     * @synopsis Returns the receiver's "local ID", also known as it's 'name',
     *     but without any prefixes for parent windows.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The window's local ID (it's non-qualified name).
     * @todo
     */

    var win;

    if (TP.notValid(win = this.getNativeWindow())) {
        return this.raise('TP.sig.InvalidWindow');
    }

    return TP.lid(win, assignIfAbsent);
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeContentDocument',
function() {

    /**
     * @name getNativeContentDocument
     * @synopsis Returns the content document (that is the contained 'document')
     *     of the receiver in a TP.core.Document wrapper.
     * @returns {TP.core.Document} The TP.core.Document object contained by the
     *     receiver.
     */

    return this.getNativeDocument();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeContentWindow',
function() {

    /**
     * @name getNativeContentWindow
     * @synopsis Returns the content window (that is the 'contained window') of
     *     the receiver.
     * @returns {Window} The Window object contained by the receiver.
     */

    return this.getNativeWindow();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('handleDOMClose',
function(aSignal) {

    /**
     * @name handleDOMClose
     * @synopsis Closes the receiver.
     * @param {TP.sig.DOMClose} aSignal The signal that caused this handler to
     *     trip.
     */

    return this.close();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @name setContent
     * @synopsis Sets the content of the receiver's native DOM counterpart to
     *     the node supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @todo
     */

    var req,
        reqLoadFunction,
        natWin,
        retval;

    req = TP.request(aRequest);
    reqLoadFunction = req.at('loadFunc');

    natWin = this.getNativeWindow();

    //  Construct a load function that will install the proper handlers for
    //  'back key' handling and 'focus' handling
    req.atPut('loadFunc',
                function (aNode) {

                    //  Set up any 'backspace' key handlers on the window so
                    //  that backspace key presses won't cause the standard
                    //  "Back" button behavior that would cause the TIBET
                    //  frame to be flushed.
                    TP.windowSetupBackKeyHandlers(natWin);

                    //  Go ahead and focus the window
                    natWin.focus();

                    //  Set up any focus handlers for the various
                    //  windows/frames that we use in TIBET so that the user
                    //  experiences 'proper' behavior when using the keyboard
                    //  during application execution.
                    TP.windowSetupFocusHandlers(natWin);

                    if (TP.isCallable(reqLoadFunction)) {
                        reqLoadFunction(aNode);
                    }

                });

    retval = this.getContentDocument().setContent(aContentObject, req);

    // A couple of things can go wrong in the setContent chain. One is that the
    // content may not be found if aContentObject is a URI for example, and that
    // URI ends up failing to load. In that case we need to check req.
    if (req.didFail()) {
        if (req.at('failFunc')) {
            req.at('failFunc')(req);
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------
//  GENERAL
//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('attachSTDIO',
function(aProvider) {

    /**
     * @name attachSTDIO
     * @synopsis Attaches the receiver's stdio hooks to a STDIO provider, an
     *     object which implements those hooks for reuse.
     * @param {Object} aProvider An object implementing stdin, stdout, and
     *     stderr hook functions.
     * @returns {TP.core.Window} The receiver.
     */

    var natWin;

    if (!TP.canInvoke(aProvider,
                        TP.ac('notify', 'stdin', 'stdout', 'stderr'))) {
        return this.raise(
            'TP.sig.InvalidProvider',
            'STDIO provider must implement stdin, stdout, and stderr');
    }

    natWin = this.getNativeWindow();

    natWin.TP.boot.$notify = function(anObject, aRequest) {

                        return aProvider.notify(anObject, aRequest);
                    };

    natWin.TP.stdin = function(aQuery, aDefault, aRequest) {

                        return aProvider.stdin(aQuery, aDefault, aRequest);
                    };

    natWin.TP.stdout = function(anObject, aRequest) {

                        return aProvider.stdout(anObject, aRequest);
                    };

    natWin.TP.stderr = function(anError, aRequest) {

                        return aProvider.stderr(anError, aRequest);
                    };

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('back',
function() {

    /**
     * @name back
     * @synopsis Causes the receiver to go back a page in session history
     */

    this.getNativeWindow().history.back();

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('blur',
function() {

    /**
     * @name blur
     * @synopsis Blurs the receiver.
     */

    this.getNativeWindow().blur();

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('constructObject',
function(constructorName, varargs) {

    /**
     * @name constructObject
     * @synopsis Constructs an object in the receiver's native window.
     * @description Note that all parameters to this method are passed along in
     *     the object creation process. Therefore, arguments to the 'new', if
     *     you will, should be passed after the constructorName.
     * @param {String} constructorName The name of the constructor to use to
     *     construct the object.
     * @returns {Object} The object constructed in the receiver's native window.
     */

    var args,
        win;

    //  constructorName was only pointed out above for documentation
    //  purposes. We pass along *all* arguments after inserting our native
    //  window to the front of the Array.
    win = this.getNativeWindow();
    args = TP.args(arguments);
    args.unshift(win);

    return TP.windowConstructObject.apply(win, args);
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getDocument',
function() {

    /**
     * @name getDocument
     * @synopsis Returns a TP.core.Document instance wrapping the receiver's
     *     document object. To get the native document object use
     *     getNativeDocument.
     * @description Windows are unique in that their content document and their
     *     document are the same object. For other UICanvas objects the content
     *     document is contained within the canvas, but the document contains
     *     the canvas. Windows sit at the boundary.
     * @returns {TP.core.Document}
     */

    return this.getContentDocument();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeDocument',
function() {

    /**
     * @name getNativeDocument
     * @synopsis Returns the receiver's native document object without creating
     *     a TP.core.Document wrapper.
     * @returns {Document} A native document instance.
     */

    var win;

    if (TP.notValid(win = this.getNativeWindow())) {
        return this.raise('TP.sig.InvalidWindow');
    }

    return win.document;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeNode',
function() {

    /**
     * @name getNativeNode
     * @synopsis Returns the native node representing the receiver's content,
     *     which for a window is actually the native document node.
     * @returns {Document} The receiver's document object.
     */

    return this.getNativeDocument();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @name getNativeObject
     * @synopsis Returns the native object that the receiver is wrapping. In the
     *     case of TP.core.Window, this is the receiver's native window object.
     * @returns {Window} The receiver's native object.
     */

    return this.getNativeWindow();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeWindow',
function() {

    /**
     * @name getNativeWindow
     * @synopsis Returns the window object itself.
     * @returns {Window} The receiver's window instance.
     */

    var winID,
        win;

    winID = this.getGlobalID();

    //  If the native window is still registered with the TP.core.Window
    //  type we can just return it
    if (TP.isWindow(win =
                    TP.core.Window.getWindowInfo(winID, 'nativeWindow'))) {
        return win;
    }

    //  note the use of the window acquisition primitive from the boot
    //  system here -- which should get us our native window reference
    if (TP.notValid(win = TP.sys.getWindowById(winID))) {
        return this.raise('TP.sig.InvalidWindow');
    }

    return win;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getProperty',
function(attributeName) {

    /**
     * @name getProperty
     * @synopsis Returns the value of the named attribute.
     * @param {String} attributeName The attribute to get.
     * @returns {Object}
     */

    var win,
        val;

    //  no model? return local value
    if (TP.isPrototype(this) || TP.notValid(win = this.getNativeWindow())) {
        return this.$get(attributeName);
    }

    //  note the primitive slot access here which we mask from IE via the
    //  try/catch
    try {
        val = win[attributeName];
    } catch (e) {
    }

    //  non-existent on model? try locally
    if (TP.notDefined(val)) {
        val = this.$get(attributeName);
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getWindow',
function() {

    /**
     * @name getWindow
     * @synopsis Returns the receiver.
     * @description This method exists for polymorphism purposes.
     * @returns {TP.core.Window} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('focus',
function() {

    /**
     * @name focus
     * @synopsis Focuses the receiver, possibly bringing it to the front.
     */

    this.getNativeWindow().focus();

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('isInstrumented',
function() {

    /**
     * @name isInstrumented
     * @synopsis Returns true if the window's native window has been
     *     instrumented with TIBET features.
     * @returns {Boolean} True if the window has been instrumented.
     */

    return TP.windowIsInstrumented(this.getNativeWindow());
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('refresh',
function(aSignalOrHash) {

    /**
     * @name refresh
     * @synopsis Updates the receiver's content by refreshing all bound elements
     *     in the window's document.
    * @param {TP.sig.DOMRefresh|TP.lang.Hash} aSignalOrHash An optional signal
     *     which triggered this action or a hash. If this is a signal, this
     *     method will try first to use 'getValue()' to get the value from the
     *     binding. If there is no value there, or this is a hash, this method
     *     will look under a key of TP.NEWVAL.
     *     This signal or hash should include a key of 'deep' and a value
     *     of true to cause a deep refresh that updates all nodes.
     * @returns {TP.core.Window} The receiver.
     * @todo
     */

    TP.stop('break.bind_refresh');

    this.getContentDocument().refresh(aSignalOrHash);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('reload',
function(forceReload) {

    /**
     * @name reload
     * @synopsis Reloads the resource currently displayed in the receiver.
     * @param {Boolean} forceReload An optional parameter that determines
     *     whether the browser should reload the page from the server or from
     *     its cache. The default value is false.
     */

    //  this will reload the window, and the unload/load hook should do the rest
    this.getNativeWindow().location.reload(forceReload);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
