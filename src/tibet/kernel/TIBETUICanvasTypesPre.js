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
 * @summary A type intended to be used as a trait type for objects which
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

TP.lang.Object.defineSubtype('core.UICanvas');

//  This type is intended to be used as a trait type only, so don't allow
//  instance creation
TP.core.UICanvas.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getCanvasID',
function() {

    /**
     * @method getCanvasID
     * @summary Returns the canvas ID for the receiver. For non-canvas elements
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
     * @method getContentDocument
     * @summary Returns a TP.dom.Document instance wrapping the receiver's
     *     document object. To get the native document object use
     *     getNativeDocument.
     * @returns {TP.dom.Document}
     */

    //  rely on the content window so we can leverage caching behavior
    return this.getContentWindow().getContentDocument();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getContentNode',
function() {

    /**
     * @method getContentNode
     * @summary Returns the native node of the TP.dom.DocumentNode wrapping
     *     the receiver's document object.
     * @returns {TP.dom.Document}
     */

    //  rely on the content window so we can leverage caching behavior
    return this.getContentWindow().getContentDocument();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getContentWindow',
function() {

    /**
     * @method getContentWindow
     * @summary Returns the content window (that is the 'contained window') of
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
     * @method getGlobalID
     * @summary Returns the global ID for the receiver.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The canvas's global ID.
     */

    return TP.gid(this.getNativeContentWindow(), assignIfAbsent);
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getLocalID',
function(assignIfAbsent) {

    /**
     * @method getLocalID
     * @summary Returns the local ID for the receiver.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The canvas's local ID.
     */

    return TP.lid(this.getNativeContentWindow(), assignIfAbsent);
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getNativeContentDocument',
function() {

    /**
     * @method getNativeContentDocument
     * @summary Returns the content document (that is the contained 'document')
     *     of the receiver in a TP.dom.Document wrapper.
     * @returns {TP.dom.Document} The Document object contained by the
     *     receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('getNativeContentWindow',
function() {

    /**
     * @method getNativeContentWindow
     * @summary Returns the content window (that is the 'contained window') of
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
     * @method canResolveDNU
     * @summary Provides an instance that has triggered DNU machinery with an
     *     opportunity to handle the problem itself. For TP.core.Window and
     *     other UI canvas types we typically check the native window and the
     *     content document to see if either one can respond reasonably to the
     *     method.
     * @param {Object} anOrigin The object asking for help. The receiver in this
     *     case.
     * @param {String} aMethodName The method name that failed.
     * @param {Object[]} anArgArray Optional arguments to function.
     * @param {Function|arguments} callingContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     TRUE for TP.dom.Node subtypes.
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
     * @method resolveDNU
     * @summary Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given.
     * @description Handles resolution of methods which have triggered the
     *     inferencer. For TP.core.Window the resolution process is used in
     *     conjunction with method aspects to allow the receiver to translate
     *     method calls.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Object[]} anArgArray Optional arguments to function.
     * @param {Function|arguments} callingContext The calling context.
     * @returns {Object} The result of invoking the method using the native
     *     window object.
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
        TP.ifError() ?
                TP.error(
                    TP.ec(e, 'Unable to resolve DNU: ' + aMethodName)) : 0;
    }

    //  If there weren't any arguments in the arg array, then we have
    //  only to call the func.
    if (TP.notValid(anArgArray) || anArgArray.length === 0) {
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
     * @method getContentMIMEType
     * @summary Returns the receiver's "content MIME type", that is the MIME
     *     type that the receiver can render most effectively.
     * @returns {String} The receiver's MIME type.
     */

    return this.getContentDocument().getContentMIMEType();
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the node supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.dom.Node} The result of setting the content of the
     *     receiver.
     */

    return this.getContentDocument().setContent(aContentObject, aRequest);
});

//  ========================================================================
//  TP.core.Window
//  ========================================================================

/**
 * @type {TP.core.Window}
 * @summary TP.core.Window is a top-level type for wrapping windows and frames.
 * @description In TIBET you typically operate with documents and elements via
 *     the TP.dom.Node hierarchy. The TP.core.Window hierarchy is intended to
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

TP.lang.Object.defineSubtype('core.Window');

//  Trait in UI canvas behavior, then any methods we define will override the
//  defaults (this would be true in any case unless we force overrides)
TP.core.Window.addTraits(TP.core.UICanvas);

TP.core.Window.Inst.resolveTraits(TP.ac('canResolveDNU', 'resolveDNU'),
                                    TP.core.UICanvas);

//  ------------------------------------------------------------------------

TP.definePrimitive('tpwin',
function(anObject) {

    /**
     * @method tpwin
     * @summary A general purpose routine that can return a TP.core.Window
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
    } else if (TP.isKindOf(anObject, TP.dom.Node)) {
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

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('construct',
function(aWindow, aName, aSpec) {

    /**
     * @method construct
     * @summary Constructs a new instance of the receiver, or returns the
     *     previously constructed instance for the window provided. When
     *     creating a new window you can provide a URI, name, and specification
     *     (feature) string/hash as with open().
     * @param {Window|String} aWindow A window handle. If the handle is an
     *     actual window reference a proper subtype is returned. If the handle
     *     is a string the assumption is a new OS window object if no '.' is in
     *     the name.
     * @param {String} aName The name to give this window. This must be unique.
     * @param {TP.core.Hash|String} aSpec A 'spec string' of key=value pairs or
     *     a hash that can be used to produce a feature string. You should use
     *     'top' and 'left' on all browsers and TIBET will convert as needed.
     * @returns {TP.core.Window} The new instance.
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
        if (!TP.isWindow(theWindow)) {
            return this.raise('WindowNotFound', aWindow);
        }
    } else if (!TP.isWindow(aWindow)) {
        //  NOTE that we want to ensure that the object provided is at least
        //  a kind of the receiving type, otherwise we can't return it
        if (!TP.isKindOf(aWindow, this)) {
            return this.raise('TP.sig.InvalidParameter');
        } else {
            //  It's already a TP.core.Window, return it.
            return aWindow;
        }
    } else {
        //  It's a native window...wrap it below.
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
     * @method closeRegisteredWindows
     * @summary Closes any "auxillary" windows opened by TIBET. Typically
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
                if (win !== top && win.parent !== top) {
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
     * @method getOpenWindows
     * @summary Returns an array of all windows TIBET is aware of (registered
     *     windows) that are open.
     * @returns {Window[]} An array of native window instances.
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
     * @method getWindowInfo
     * @summary Return the hash of information (load signals, onload signals,
     *     etc.) for the window, or window ID and key provided. If no key is
     *     provided the entire hash of window information is returned.
     * @param {Window|String} aWindowOrID The window, or window ID to use as the
     *     first key.
     * @param {String} aKey The key into the specific window's info hash.
     * @returns {Object} The value registered for the key provided.
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
     * @method getWindowSpec
     * @summary Returns the window specification hash used by default when
     *     creating instances of this type.
     * @returns {TP.core.Hash}
     */

    return this.$get('$defaultWindowSpec');
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('getWindowType',
function() {

    /**
     * @method getWindowType
     * @summary Returns the type object which should be used to construct new
     *     instances of OS window wrappers.
     * @returns {TP.meta.core.Window} The TP.core.Window type object.
     */

    return this.$get('defaultWindowType').asType();
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('installWindowBase',
function(aWindow) {

    /**
     * @method installWindowBase
     * @summary Installs a set of common functions onto aWindow to enhance that
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
     * @method installDocumentBase
     * @summary Instruments the document belonging to aWindow with TIBET
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
     * @method instrument
     * @summary Instruments a native window to set it up for use with TIBET.
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
     * @method open
     * @summary Constructs a new TP.core.Window instance (having retrieved a
     *     real native window to go underneath it and having set it up for use
     *     with TIBET).
     * @param {TP.uri.URI|String} url The URL to load into the window.
     * @param {String} aName The name to give this window. This must be unique.
     * @param {TP.core.Hash|String} aSpec A 'spec string' of key=value pairs or
     *     a hash that can be used to produce a feature string. You should use
     *     'top' and 'left' on all browsers and TIBET will convert as needed.
     * @param {Boolean} shouldReplace Whether the content should be replaced if
     *     the window is already open.
     * @returns {Window} The newly constructed window.
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
        theURL = TP.uc(TP.sys.cfg('path.blank_page'));
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

    /* eslint-disable no-extra-parens */
    if ((win = TP.open('', theName, aSpec, shouldReplace))) {
        //  we have to have a valid win reference here or the construct call
        //  will call back to TP.open() and we'll recurse
        newWindow = this.construct(win);
        newWindow.setLocation(theURL);

        return newWindow;
    }
    /* eslint-enable no-extra-parens */

    //  Couldn't get a real native window so there's no sense in creating a
    //  wrapper. Return null here.
    return null;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('registerOnloadFunction',
function(aWindowOrID, aFunction, runFirst) {

    /**
     * @method registerOnloadFunction
     * @summary Registers a function to be executed when the onload is fired in
     *     the window provided. Since this registration is separate from the
     *     actual existence of the window (you can register by ID) this can be
     *     done without requiring the window to exist.
     * @param {Window|String} aWindowOrID The window, or window ID to use as the
     *     first key.
     * @param {Function} aFunction The function to register which will be run
     *     when the 'onload' event is triggered for aWindow.
     * @param {Boolean} runFirst Whether or not the function should run before
     *     the other functions in the list.
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
     * @method registerWindow
     * @summary Registers aWindow with the window information registry.
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
     * @method removeWindowInfo
     * @summary Removes a value in the window's information hash, or the entire
     *     hash when no key is provided.
     * @param {Window|String} aWindowOrID The window, or window ID to use as the
     *     first key.
     * @param {String} aKey The key into the specific window's info hash.
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
     * @method $setWindowContent
     * @summary Sets the content of aWindowOrID's window to the content
     *     provided. The content is typically specified as a URI string whose
     *     content is acquired and processed.
     * @param {Window|String} aWindowOrID The window or window name.
     * @param {String|URI|Node} theContent The content.
     * @param {Function} aLoadedFunction An optional 'loaded' function that will
     *     execute when the content is finished loading.
     */

    var win,
        url,
        resp,
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
            //  NB: We assume 'async' false here.
            resp = url.getResource(TP.hc('async', false));
            content = resp.get('result');
        } else {
            content = theContent;
        }
    } else if (TP.isNode(theContent)) {
        content = theContent;
    } else if (TP.isKindOf(theContent, TP.uri.URI)) {
        //  NB: We assume 'async' false here.
        resp = theContent.getResource(TP.hc('async', false));
        content = resp.get('result');
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
     * @method setWindowInfo
     * @summary Sets a value in the window's information hash. When the hash
     *     doesn't exist yet it is constructed as a result of this call.
     * @param {Window|String} aWindowOrID The window, or window ID to use as the
     *     first key.
     * @param {String} aKey The key into the specific window's info hash.
     * @param {Object} aValue The value to set for the key.
     * @returns {Object} The value registered for the key provided.
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

//  the TP.dom.Document wrapper for the window's document. This is managed
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
     * @method init
     * @summary Initializes a new instance.
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
function(aURL, aRequest) {

    /**
     * @method setLocation
     * @summary Sets the window's location to the URL provided. This method is
     *     similar to the native '<windowRef>.location =' call, except that it
     *     will process content at the end of the URL and set up proper TIBET
     *     constructs in the receiver's native window.
     * @param {String|TP.uri.URI} aURL The URL of the content to load into this
     *     window.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.core.Window} The receiver.
     */

    var win,
        url,
        blank,
        blankURI,
        frame,
        thisref,
        handler;

    //  Default URL to the blank page when empty or null/undefined.
    if (TP.isEmpty(aURL)) {
        url = TP.sys.cfg('path.blank_page');
        blank = true;
    } else {
        url = aURL;
    }

    TP.sys.logLink(url, TP.INFO);

    //  need a valid URI and creating one ensures we have one regardless of
    //  what we were originally provided. NOTE that we do this operation
    //  after checking for '' as a location which is how we clear content.
    if (TP.notValid(url = TP.uc(url))) {
        return this.raise('TP.sig.InvalidURI');
    }

    win = this.getNativeWindow();

    //  If the target is an XML rendering surface, which it normally should be,
    //  we can setContent directly. If not we can attempt to "double pump" it by
    //  loading a blank.xhtml file and hooking into the onload (which works if
    //  we're dealing with an iframe).
    if (TP.isXMLDocument(this.getNativeDocument())) {
        //  NOTE that we strip any fragment here to avoid having the setContent
        //  call attempt to resolve XPointer content slices etc. We're setting a
        //  location so the key is the root URL value.
        this.setContent(url, aRequest);
    } else if (TP.isIFrameWindow(win)) {

        //  Capture variable binding references.
        frame = win.frameElement;
        thisref = this;

        handler = function() {
            frame.removeEventListener('load', handler, false);
            if (!blank) {
                thisref.setContent(url, aRequest);
            } else if (TP.isValid(aRequest)) {
                aRequest.complete();
            }
        };
        frame.addEventListener('load', handler, false);

        if (blank) {
            win.location = url.getLocation();
        } else {
            blankURI = TP.uc(TP.sys.cfg('path.blank_page'));
            win.location = blankURI.getLocation();
        }
    } else {
        //  Not XML surface, not an IFRAME, just set location.
        win.location = url.getLocation();

        //  A bit optimistic but we don't have a choice really. Hopefully the
        //  request completion processing doesn't rely on rendering being
        //  complete since it may not be.
        if (TP.isValid(aRequest)) {
            aRequest.complete();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('setTheme',
function(themeName) {

    /**
     * @method setTheme
     * @summary Sets a data-theme attribute on the receiving window's document
     *     body to help drive themed CSS.
     * @param {String} themeName The theme name to set.
     * @returns {TP.core.Window} The receiver.
     */

    this.getDocument().setTheme(themeName);

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.UICanvas Interface
//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var marker,
        str,
        $depth,
        $level;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asDumpString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    str = '[' + TP.tname(this) + ' :: ';

    $depth = TP.ifInvalid(depth, 1);
    $level = TP.ifInvalid(level, 0);

    try {
        if ($level > $depth) {
            str += '@' + TP.id(this) + ']';
        } else {
            str += '(' + TP.dump(this.getNativeWindow(), $depth, $level + 1) +
                ')' + ']';
        }
    } catch (e) {
        str += '(' + TP.str(this.getNativeWindow()) + ')' + ']';
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asJSONSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '{"type":' + TP.tname(this).quoted('"') + ',' +
                '"data":{' + TP.jsonsrc(this.getNativeWindow()) + '}}';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asHTMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '<span class="TP_core_Window ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                TP.htmlstr(this.getNativeWindow()) +
                '</span>';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asPrettyString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    TP.pretty(this.getNativeWindow()) +
                    '</dl>';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
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
     * @method asString
     * @summary Returns the receiver as a string.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.Window's String representation. The default is true.
     * @returns {String} The receiver as a String.
     */

    var wantsVerbose,
        marker,
        str;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return TP.objectToString(this);
    }

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = TP.tname(this) +
                    ' :: ' +
                    '(' + TP.str(this.getNativeWindow()) + ')';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asXMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '<instance type="' + TP.tname(this) + '">' +
                    TP.xmlstr(this.getNativeWindow()) +
                    '</instance>';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('close',
function() {

    /**
     * @method close
     * @summary Closes the receiver.
     * @returns {TP.core.Window} The receiver.
     */

    //  this will close the window, and the unload hook should do the rest
    this.getNativeWindow().close();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getCanvasID',
function() {

    /**
     * @method getCanvasID
     * @summary Returns the receiver's "canvas ID" or global ID.
     * @returns {String} The window's global ID.
     */

    //  cached on creation
    return this.$get('$windowID');
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getContentDocument',
function() {

    /**
     * @method getContentDocument
     * @summary Returns a TP.dom.Document instance wrapping the receiver's
     *     document object. To get the native document object use
     *     getNativeDocument().
     * @returns {TP.dom.Document} The TP.dom.Document object wrapping the
     *     receiver's native document object.
     */

    var win,
        doc;

    if (TP.notValid(win = this.getNativeWindow())) {
        return this.raise('TP.sig.InvalidWindow');
    }

    //  try to reuse one TP.dom.Document if at all possible
    if (TP.isDocument(doc = this.$get('contentDoc'))) {
        //  need to check Document objects - they can become detached or
        //  otherwise messed with
        if (doc.getNativeNode() === win.document) {
            return doc;
        }
    }

    //  build/save a new wrapper for the current document object
    doc = TP.dom.Document.construct(win.document);
    this.$set('contentDoc', doc, false);

    return doc;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getContentWindow',
function() {

    /**
     * @method getContentWindow
     * @summary Returns the content window (that is the 'contained window') of
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
     * @method getGlobalID
     * @summary Returns the receiver's global ID.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The window's global ID (it's fully-qualified name).
     */

    //  cached on creation
    return this.$get('$windowID');
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getLocation',
function() {

    /**
     * @method getLocation
     * @summary Returns the location (URL) currently set for the receiver's
     *     document. Note that this is often NOT the native window's location
     *     property due to TIBET's use of setContent/setLocation which are not
     *     always able to properly update the location value.
     * @returns {String} The window's document location.
     */

    return TP.documentGetLocation(this.getNativeDocument());
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getLocalID',
function(assignIfAbsent) {

    /**
     * @method getLocalID
     * @summary Returns the receiver's "local ID", also known as it's 'name',
     *     but without any prefixes for parent windows.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The window's local ID (it's non-qualified name).
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
     * @method getNativeContentDocument
     * @summary Returns the content document (that is the contained 'document')
     *     of the receiver in a TP.dom.Document wrapper.
     * @returns {TP.dom.Document} The TP.dom.Document object contained by the
     *     receiver.
     */

    return this.getNativeDocument();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeContentWindow',
function() {

    /**
     * @method getNativeContentWindow
     * @summary Returns the content window (that is the 'contained window') of
     *     the receiver.
     * @returns {Window} The Window object contained by the receiver.
     */

    return this.getNativeWindow();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineHandler('DOMClose',
function(aSignal) {

    /**
     * @method handleDOMClose
     * @summary Closes the receiver.
     * @param {TP.sig.DOMClose} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.core.Window} The receiver.
     */

    this.close();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the node supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.dom.Node} The result of setting the content of the
     *     receiver.
     */

    var req,
        retval;

    req = TP.request(aRequest);

    retval = this.getContentDocument().setContent(aContentObject, req);

    //  A couple of things can go wrong in the setContent chain. One is that the
    //  content may not be found if aContentObject is a URI for example, and
    //  that URI ends up failing to load. In that case we need to check req.
    if (req.didFail()) {
        if (req.at(TP.ONFAIL)) {
            req.at(TP.ONFAIL)(req);
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
     * @method attachSTDIO
     * @summary Attaches the receiver's stdio hooks to a STDIO provider, an
     *     object which implements those hooks for reuse.
     * @param {Object} aProvider An object implementing stdin, stdout, and
     *     stderr hook functions.
     * @returns {TP.core.Window} The receiver.
     */

    var natWin;

    if (!TP.canInvokeInterface(
                    aProvider,
                    TP.ac('notify', 'stdin', 'stdout', 'stderr'))) {
        return this.raise(
            'TP.sig.InvalidProvider',
            'STDIO provider must implement stdin, stdout, and stderr');
    }

    natWin = this.getNativeWindow();

    natWin.TP.boot.$notify =
        function(anObject, aRequest) {

            return aProvider.notify(anObject, aRequest);
        };

    natWin.TP.stdin =
        function(aQuery, aDefault, aRequest) {

            return aProvider.stdin(aQuery, aDefault, aRequest);
        };

    natWin.TP.stdout =
        function(anObject, aRequest) {

            return aProvider.stdout(anObject, aRequest);
        };

    natWin.TP.stderr =
        function(anError, aRequest) {

            return aProvider.stderr(anError, aRequest);
        };

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('blur',
function() {

    /**
     * @method blur
     * @summary Blurs the receiver.
     */

    this.getNativeWindow().blur();

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('constructObject',
function(constructorName, varargs) {

    /**
     * @method constructObject
     * @summary Constructs an object in the receiver's native window.
     * @description Note that all parameters to this method are passed along in
     *     the object creation process. Therefore, arguments to the 'new', if
     *     you will, should be passed after the constructorName.
     * @param {String} constructorName The name of the constructor to use to
     *     construct the object.
     * @param {arguments} varargs Zero or more arguments to pass to the construct
     *     call being invoked.
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
     * @method getDocument
     * @summary Returns a TP.dom.Document instance wrapping the receiver's
     *     document object. To get the native document object use
     *     getNativeDocument.
     * @description Windows are unique in that their content document and their
     *     document are the same object. For other UICanvas objects the content
     *     document is contained within the canvas, but the document contains
     *     the canvas. Windows sit at the boundary.
     * @returns {TP.dom.Document}
     */

    return this.getContentDocument();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeDocument',
function() {

    /**
     * @method getNativeDocument
     * @summary Returns the receiver's native document object without creating
     *     a TP.dom.Document wrapper.
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
     * @method getNativeNode
     * @summary Returns the native node representing the receiver's content,
     *     which for a window is actually the native document node.
     * @returns {Document} The receiver's document object.
     */

    return this.getNativeDocument();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @method getNativeObject
     * @summary Returns the native object that the receiver is wrapping. In the
     *     case of TP.core.Window, this is the receiver's native window object.
     * @returns {Window} The receiver's native object.
     */

    return this.getNativeWindow();
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('getNativeWindow',
function() {

    /**
     * @method getNativeWindow
     * @summary Returns the window object itself.
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
     * @method getProperty
     * @summary Returns the value of the named attribute.
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
        TP.ifError() ?
                TP.error(
                    TP.ec(e, 'Unable to property: ' + attributeName)) : 0;
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
     * @method getWindow
     * @summary Returns the receiver.
     * @description This method exists for polymorphism purposes.
     * @returns {TP.core.Window} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('focus',
function() {

    /**
     * @method focus
     * @summary Focuses the receiver, possibly bringing it to the front.
     */

    this.getNativeWindow().focus();

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('isInstrumented',
function() {

    /**
     * @method isInstrumented
     * @summary Returns true if the window's native window has been
     *     instrumented with TIBET features.
     * @returns {Boolean} True if the window has been instrumented.
     */

    return TP.windowIsInstrumented(this.getNativeWindow());
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('refresh',
function() {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound elements
     *     in the window's document.
     * @returns {TP.core.Window} The receiver.
     */

    this.getContentDocument().refresh();

    return;
});

//  ------------------------------------------------------------------------

TP.core.Window.Inst.defineMethod('reload',
function(forceReload) {

    /**
     * @method reload
     * @summary Reloads the resource currently displayed in the receiver.
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
