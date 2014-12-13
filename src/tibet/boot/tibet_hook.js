/* copyright added via build process */

/**
 * When you use TIBET you're using a shared codebase and dataset stored in
 * a separate code frame while your user interface is typically drawn in
 * an independent UI frame. To connect the UI frame to the shared codebase
 * TIBET leverages this "hook file", which either finds TIBET or boots it as
 * needed.
 *
 * You should place a reference to this file in the head of any full page
 * that you will load into your UI frame directly. NOTE that this file isn't
 * needed in content that will be used as part of a larger DOM structure.
 * Only the outermost documents you load at the window level require this
 * reference if they will be calling on TIBET code from within the page.
 */

/* jshint debug:true,
          eqnull:true,
          maxerr:999
*/
/* global $$checked:true,
          $$tibet:true,
          $$getNextWindow:true,
          $$findTIBET:true,
          $$init:true,
          init:true,
          CSS2Properties:false,
          CSSPrimitiveValue:false,
          Document:false,
          XMLDocument:false
*/

(function(root) {

//  ------------------------------------------------------------------------
//  PRIVATE GLOBALS
//  ------------------------------------------------------------------------

//  window search routine will use this to avoid recursions
$$checked = null;

//  the tibet window reference, configured by the $$findTIBET() call when it
//  can locate a TIBET installation. if this variable is set it identifies
//  the shared codebase for the application.
$$tibet = null;

//  ------------------------------------------------------------------------
//  TIBET DETECTION
//  ------------------------------------------------------------------------

/*
Routines which can search through a set of windows, frames in a frameset, or
iframes in an attempt to locate the shared TIBET code frame.
*/

//  ------------------------------------------------------------------------

$$getNextWindow = function(aWindow, aTimestamp) {

    /**
     * @name $$getNextWindow
     * @synopsis Given a window reference this routine returns the next window
     *     to check when looking for a TIBET reference. This method relies
     *     heavily on the $$checked slot, which calling routines such as
     *     $$findTIBET() should set as they operate on each window.
     * @param {Window} aWindow The window to start looking for the TIBET frame
     *     in.
     * @param {String} aTimestamp The timestamp to use in the $$checked slot.
     * @return {Window} The next window to check in finding the TIBET frame.
     * @todo
     */

    var win,
        siblings,
        i;

    win = (aWindow == null) ? window : aWindow;

    //  before we start going up, can we go 'sideways'?
    if (win.parent != null && win.parent !== win) {
        siblings = win.parent.frames;
        if (siblings.length > 1) {
            //  there are siblings, see if any are unchecked...
            for (i = 0; i < siblings.length; i++) {
                //  catch block here in case we have siblings from
                //  other domains etc.
                try {
                    if (siblings[i].$$checked !== aTimestamp) {
                        return siblings[i];
                    }
                } catch (e) {
                }
            }
        }
    }

    //  check nested frames for parent reference option
    try {
        if (win.parent != null &&
            win.parent !== win &&
            win.parent.$$checked !== aTimestamp) {
            return win.parent;
        }
    } catch (e) {
    }

    //  somewhat redundant since parent should lead to this...
    try {
        if (win.top != null &&
            win.top !== win &&
            win.top.$$checked !== aTimestamp) {
            return win.top;
        }
    } catch (e) {
    }

    //  reached the top? how about an opener reference?
    try {
        if (win.opener != null &&
            win.opener !== win &&
            win.opener.$$checked !== aTimestamp) {
            return win.opener;
        }
    } catch (e) {
    }

    return;
};

//  ------------------------------------------------------------------------

$$findTIBET = function(aWindow) {

    /**
     * @name $$findTIBET
     * @synopsis Finds the TIBET code frame by traversing up the opener or
     *     parent chain until the window containing the slot named '$$TIBET' (a
     *     well known slot in the TIBET code frame that is used solely for this
     *     purpose) is found.
     * @description This function works hand-in-hand with $$getNextWindow() by
     *     setting the $$checked attribute on each frame/window as it is tested.
     *     The $$getNextWindow() call observes these and skips windows with a
     *     value matching the timestamp set at the start of this call. The use
     *     of a time allows this call to be run multiple times without causing
     *     windows to appear checked incorrectly. When a valid TIBET reference
     *     is found the window it was found in is mapped to the $$tibet
     *     variable.
     * @param {Window} aWindow The window to start looking for the TIBET frame
     *     in.
     * @return {Window} The TIBET frame.
     */

    var win,
        ts;

    if (top.$$tibet != null) {
        window.$$tibet = top.$$tibet;
        return top.$$tibet;
    } else if (top.$$TIBET === true) {
        window.$$tibet = top;
        return top;
    }

    if (window.$$tibet != null) {
        return window.$$tibet;
    } else if (window.$$TIBET === true) {
        return window;
    }

    //  start at the current window, or the window provided
    win = (aWindow == null) ? window : aWindow;

    ts = (new Date()).getTime();

    //  essentially loop up/across the window/frame hierarchy looking for
    //  either of the special keys that point to the codebase
    while (win != null) {
        try {
            win.$$checked = ts;
            if (win.$$tibet != null) {
                window.$$tibet = win.$$tibet;
                return win.$$tibet;
            } else if (win.$$TIBET === true) {
                window.$$tibet = win;
                return win;
            }
        } catch (e) {
        }

        win = $$getNextWindow(win, ts);
    }

    return;
};

//  ------------------------------------------------------------------------
//  PUBLIC GLOBALS
//  ------------------------------------------------------------------------

//  Define the only publicly available global in TIBET - 'TP'

if (self.TP == null) {

    //  ---
    //  Define a slightly more useful error handler.
    //  ---

    //  NOTE: If TP exists it means we're in the init file, not the hook file. In
    //  which case we want to retain the version of this put on by the boot scripts.
    window.onerror = function(msg, url, line, column, errorObj) {

        /**
         * @name onerror
         * @synopsis Captures global errors and outputs them appropriately. This
         *     hook allows TIBET to capture native JavaScript errors and avoid
         *     reporting them via the normal browser mechanism. This keeps users
         *     from being bombarded by messages about JS errors while allowing
         *     developers to see what's what.
         * @param {String} message The error message.
         * @param {String} url The url of the JavaScript script.
         * @param {Number} line The line number in that script.
         * @param {Number} column The column number in that script.
         * @param {Error} errorObj The error object of the error that caused this
         *     hook to trigger.
         * @returns {Boolean} TP.sys.shouldCaptureErrors() value.
         * @todo
         */

        var str;

        try {
            str = msg || 'Error';
            str += ' in file: ' + url + ' line: ' + line + ' column: ' + column;

            if (errorObj) {
                str += '\nSTACK:\n' + errorObj.stack;
            }

            // specifically watch for file launch issues.
            if (window.location.protocol.indexOf('file') === 0) {
                if (window.onerror.failedlaunch) {
                    return;
                }
                window.onerror.failedlaunch = true;
                //alert('File launch error. Check browser security settings.');
            } else {
                top.console.error(str);
            }
        } catch (e) {
            // don't let log errors trigger recursion, but don't bury them either.
            top.console.error('Error logging onerror: ' + e.message);
            top.console.error(str || msg);
        }

        return false;
    };


    //  ---
    //  Attempt to find the TIBET code frame.
    //  ---

    try {
        $$findTIBET();
    } catch (e) {
        return;
    }

    //  If a window containing TIBET was found (and it wasn't ourself), wire
    //  over the TP reference.
    if (window.$$tibet && window.$$tibet !== window) {
        window.TP = window.$$tibet.TP;
    } else {
        //  If the ECMAScript5 'defineProperty' call is available, use it
        //  to try to 'protect' the 'TP', 'TP.sys' and 'TP.boot' objects
        if (Object.defineProperty) {
            //  The TP object, which holds global constants, functions,
            //  types, and supporting variable data.
            //  !!NOTE!! We make this writable for now, since this might be
            //  being used in a file that isn't part of the booting process but
            //  is loaded before TIBET is ready. We'll get the final value and
            //  lock it down towards the end of the file.
            Object.defineProperty(self, 'TP', {value: {}, writable: true});

            //  The TP.boot object, which holds functions and data needed
            //  for booting and for loading code dynamically.
            Object.defineProperty(TP, 'boot', {value: {}, writable: false});

            //  The TP.sys object, which is responsible for system data,
            //  metadata, control parameters, etc.
            Object.defineProperty(TP, 'sys', {value: {}, writable: false});
        } else {
            TP = self.TP || {};
            TP.sys = TP.sys || {};
            TP.boot = TP.boot || {};
        }
    }
}

//  ------------------------------------------------------------------------

//  mirror boot.tibetinf in tibet_boot.js to autoboot properly
TP.$$tibetinf = TP.$$tibetinf || '/html';

//  should point to the page to install when autoBoot is activated
TP.$$bootpage = TP.$$bootpage || 'index.html';

//  signaling key for "all objects or origins"
TP.ANY = TP.ANY || 'ANY';

//  ------------------------------------------------------------------------
//  OBJECT TESTING
//  ------------------------------------------------------------------------

/*
Simple testing functions for various objects and their state.
*/

//  ------------------------------------------------------------------------

TP.boot.$isElement = function(anObj) {

    /**
     * @name $isElement
     * @synopsis Returns true if the object provided is a DOM element.
     * @param {Object} anObj The object to test.
     * @return {Boolean}
     */

    return (anObj != null && anObj.nodeType === Node.ELEMENT_NODE);
};

//  ------------------------------------------------------------------------

TP.boot.$isEmpty = function(anObj) {

    /**
     * @name $isEmpty
     * @synopsis Returns true if the object is null, has 0 length, or is ''.
     * @param {Object} anObj The object to test.
     * @return {Boolean}
     */

    return (anObj == null || anObj === '' || anObj.length === 0);
};

//  ------------------------------------------------------------------------

TP.boot.$isEvent = function(anObj) {

    /**
     * @name $isEvent
     * @synopsis Returns true if the object provided is an Event object.
     * @param {Object} anObj The Object to test.
     * @return {Boolean} Whether or not the supplied object is an Event object.
     */

    return (anObj != null &&
            anObj.clientX !== undefined &&
            anObj.clientY !== undefined);
};

//  ------------------------------------------------------------------------

TP.boot.$isTrue = function(aValue) {

    /**
     * @name $isTrue
     * @synopsis Return true if the argument is the Boolean 'true'. This is a
     *     more explicit test than 'if (anObj)' since that test will often lead
     *     your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @return {Boolean} True if aValue === true.
     */

    //  Seems pendantic, but its the best performer

    if (aValue === true) {
        return true;
    }

    if (aValue === false) {
        return false;
    }

    return (typeof(aValue) === 'boolean' && aValue.valueOf() === true);
};

//  ------------------------------------------------------------------------

TP.boot.$isValid = function(anObj) {

    /**
     * @name $isValid
     * @synopsis Returns whether or not the object is valid (that is, whether it
     *     is not undefined and not null).
     * @param {Object} anObj The object to test.
     * @return {Boolean} Whether or not anObj is valid.
     */

    return anObj != null;
};

//  ------------------------------------------------------------------------

TP.boot.$isWindow = function(anObj) {

    /**
     * @name isWindow
     * @synopsis Returns true if the object provided appears to be a valid
     *     window instance based on location and navigator slot checks.
     * @param {Object} anObj The object to test.
     * @return {Boolean} True if the object is a window.
     */

    if (anObj != null && anObj.moveBy !== undefined) {
        return true;
    }

    return false;
};

//  ------------------------------------------------------------------------

TP.boot.$notValid = function(aValue) {

    /**
     * @name $notValid
     * @synopsis Returns true if the object provided is null or undefined.
     * @param {Object} aValue The object to test.
     * @return {Boolean}
     */

    return aValue == null;
};

//  ------------------------------------------------------------------------
//  INTERNAL BROWSER CHECKS
//  ------------------------------------------------------------------------

/*
The rest of TIBET uses the TP.sys.isUA() function, these are intended to be
used only at the boot level for the hook file.
*/

//  ------------------------------------------------------------------------

//  For Safari only...
if (!self.Window) {
    /* eslint-disable no-undef */
    Window = self.constructor; /* jshint ignore:line */
    /* eslint-enable no-undef */
}

//  ------------------------------------------------------------------------

TP.boot.$$isIE = function() {

    /**
     * @name $$isIE
     * @synopsis Returns true if the current browser looks like it's IE.
     * @return {Boolean}
     */

    //  trivial exclusion rule
    if (/Gecko|Konqueror|AppleWebKit|KHTML/.test(navigator.userAgent)) {
        return false;
    }

    return (/MSIE/).test(navigator.userAgent);
};

//  ------------------------------------------------------------------------

TP.boot.$$isMoz = function() {

    /**
     * @name $$isMoz
     * @synopsis Returns true if the current browser looks like it's a
     *     Mozilla-based browser.
     * @return {Boolean}
     */

    //  Firefox at least will always show an rv: and Gecko in the string.
    //  The Gecko portion is cloned a lot, but not the rv: portion.
    return (/rv:.+?Gecko/).test(navigator.userAgent);
};

//  ------------------------------------------------------------------------

TP.boot.$$isWebkit = function() {

    /**
     * @name $$isWebkit
     * @synopsis Returns true if the current browser looks like it's a
     *     Webkit-based browser.
     * @return {Boolean}
     */

    return (/Konqueror|AppleWebKit|KHTML/).test(navigator.userAgent);
};

//  ------------------------------------------------------------------------
//  TP.* patches
//  ------------------------------------------------------------------------

if (TP.boot.$notValid(TP.DOM_SIGNAL_TYPE_MAP)) {
    //  NOTE that this is duplicated in the kernel DOM primitives so if
    //  you change things here you'll want to keep the other version in
    //  sync
    TP.DOM_SIGNAL_TYPE_MAP = {
        'abort': 'TP.sig.DOMAbort',
        'blur': 'TP.sig.DOMBlur',
        'change': 'TP.sig.DOMChange',
        'click': 'TP.sig.DOMClick',
        'copy': 'TP.sig.DOMCopy',
        'contextmenu': 'TP.sig.DOMContextMenu',
        'cut': 'TP.sig.DOMCut',
        'dblclick': 'TP.sig.DOMDblClick',
        'error': 'TP.sig.DOMError',
        'focus': 'TP.sig.DOMFocus',
        'keydown': 'TP.sig.DOMKeyDown',
        'keypress': 'TP.sig.DOMKeyPress',
        'keyup': 'TP.sig.DOMKeyUp',
        'load': 'TP.sig.DOMLoad',
        'mousedown': 'TP.sig.DOMMouseDown',
        'mouseenter': 'TP.sig.DOMMouseEnter',
        //  a synthetic TIBET event
        'mousehover': 'TP.sig.DOMMouseHover',
        'mouseleave': 'TP.sig.DOMMouseLeave',
        'mousemove': 'TP.sig.DOMMouseMove',
        'mouseout': 'TP.sig.DOMMouseOut',
        'mouseover': 'TP.sig.DOMMouseOver',
        'mouseup': 'TP.sig.DOMMouseUp',
        //  a synthetic TIBET event
        'dragdown': 'TP.sig.DOMDragDown',
        //  a synthetic TIBET event
        'draghover': 'TP.sig.DOMDragHover',
        //  a synthetic TIBET event
        'dragmove': 'TP.sig.DOMDragMove',
        //  a synthetic TIBET event
        'dragout': 'TP.sig.DOMDragOut',
        //  a synthetic TIBET event
        'dragover': 'TP.sig.DOMDragOver',
        //  a synthetic TIBET event
        'dragup': 'TP.sig.DOMDragUp',
        'move': 'TP.sig.DOMMove',
        'paste': 'TP.sig.DOMPaste',
        'reset': 'TP.sig.DOMReset',
        'resize': 'TP.sig.DOMResize',
        'submit': 'TP.sig.DOMSubmit',
        'transitionend': 'TP.sig.DOMTransitionEnd',
        'unload': 'TP.sig.DOMUnload'
    };

    if (TP.boot.$$isIE() || TP.boot.$$isWebkit()) {
        //  IE, safari, chrome, ...
        TP.DOM_SIGNAL_TYPE_MAP.mousewheel = 'TP.sig.DOMMouseWheel';
    } else {    //  firefox
        TP.DOM_SIGNAL_TYPE_MAP.DOMMouseScroll = 'TP.sig.DOMMouseWheel';
    }

    TP.DOM_SIGNAL_TYPE_MAP.at = function(anIndex) {

        return this[anIndex];
    };

    TP.DOM_SIGNAL_TYPE_MAP.atPut = function(anIndex, aValue) {

        this[anIndex] = aValue;

        return this;
    };
}

//  ------------------------------------------------------------------------
//  location= trap
//  ------------------------------------------------------------------------

/*
When a user clicks a link or a developer chooses to use window.location
rather than a TIBET setContent call the hook file will attempt to intercept
that operation and redirect it so that the content can be processed and
managed along with all other TIBET content.

NOTE that if you look closely you'll see that effectively the entire
remainder of the hook file is contained in the else clause of the following
if statement as a result.

NOTE ALSO: This only works for HTML documents, not XHTML documents.
*/

//  ------------------------------------------------------------------------

if (window.onerror.failedlaunch !== true &&
    window !== top &&
    top.TP != null &&
    top.TP.sys != null &&
    top.TP.sys.hasLoaded() === true &&
    top.TP.isHTMLDocument(document) === true &&
    top.TP.core.Window.$$isDocumentWriting !== true &&
    window.frameElement != null &&
    window.frameElement.hasAttribute('tibet_settinglocation') !== true) {
    //  if we're here because of a document.write then TIBET is
    //  processing the content already, otherwise we want to effectively
    //  snag the current location and ask TIBET to process that URI and
    //  return it to the current window as properly managed content
    top.TP.windowResetLocation(window);
} else {

    //  ------------------------------------------------------------------------
    //  COOKIE FUNCTIONS
    //  ------------------------------------------------------------------------

    /**
     * Basic cookie read/write operations. These aren't very sophisticated so
     * you shouldn't expect too much. It's adequate perhaps for storing
     * simple arrays or objects containing 'atomic values' only. Then again,
     * it's only expected to be used during booting, the TIBET kernel's
     * TP.core.Cookie type has more powerful routines.
     */

    //  ------------------------------------------------------------------------

    TP.boot.$formatCookieSource = function(anObj) {

        /**
         * @name $formatCookieSource
         * @synopsis Returns anObj, in JavaScript source-code format suitable
         *     for storage in a cookie.
         * @param {Object} anObj The object to format.
         * @return {String}
         */

        var str;

        if (anObj == null) {
            str = 'null';
        } else if (anObj.constructor === Date) {
            str = '"' + anObj.toString() + '"';
        } else if (anObj.constructor === String) {
            str = '"' + anObj + '"';
        } else {
            str = anObj.toString();
        }

        return str;
    };

    //  ------------------------------------------------------------------------

    TP.boot.getCookie = function(aName) {

        /**
         * @name getCookie
         * @synopsis Returns the value of the named cookie or undefined.
         * @param {String} aName The name of the desired cookie.
         * @return {String}
         */

        var cooky,
            end,
            start,
            str;

        try {
            cooky = document.cookie;
            if (cooky === '') {
                //  no cookies
                return;
            }
        } catch (e) {
            //  no cookies
            return;
        }

        start = cooky.indexOf(aName + '=');
        if (start === -1) {
            //  not found
            return;
        }

        end = cooky.indexOf(';', start + aName.length);
        if (end === -1) {
            end = cooky.length;
        }

        //  note that we decodeURI() the value and strip off the 'name=' part
        str = decodeURI(cooky.slice(start + aName.length + 1, end));

        return str;
    };

    //  ------------------------------------------------------------------------

    TP.boot.setCookie = function(aName, aValue, expiresAt, aPath, aDomain,
                                    wantsSecurity) {
        /**
         * @name setCookie
         * @synopsis Sets the value of the named cookie with associated params.
         *     The values and rules for the various params are documented in
         *     most JS texts. See JSTDG3 for a good discussion.
         * @param {String} aName The cookie name.
         * @param {String} aValue The cookie value.
         * @param {Date} expiresAt The cookie expiration date/time.
         * @param {String} aPath The cookie's path.
         * @param {String} aDomain An alternate cookie domain.
         * @param {Boolean} wantsSecurity Whether security is desired.
         * @return {Boolean} Whether the cookie was successfully set or not.
         */

        var cooky;

        if (aName == null || aValue == null) {
            return false;
        }

        cooky = aName + '=' + encodeURI(aValue);
        cooky += (expiresAt == null) ? '' : '; expires=' +
                                                    expiresAt.toGMTString();
        cooky += (wantsSecurity !== true) ? '' : '; secure';
        cooky += (aDomain == null) ? '' : '; domain=' + aDomain;
        cooky += (aPath == null) ? '' : '; path=' + aPath;

        try {
            document.cookie = cooky;
        } catch (e) {
            return false;
        }

        return true;
    };

    //  ------------------------------------------------------------------------
    //  BOOT PAGE FUNCTIONS
    //  ------------------------------------------------------------------------

    /*
    The standard TIBET application template, particularly the index.html page
    and prefs.html pages, contains a number of function references we share by
    keeping them here in the hook file.
    */

    //  ------------------------------------------------------------------------

    TP.boot.$byId = function(anID) {

        /**
         * @name $byId
         * @synopsis The de-facto standard $ function, a simple wrapper for
         *     document.getElementById.
         * @param {String|Element} anID The string ID to locate, or an element
         *     (which will be returned).
         * @return {Element}
         */

        if (typeof(anID) === 'string') {
            return document.getElementById(anID);
        }

        return anID;
    };

    //  ------------------------------------------------------------------------

    TP.boot.getWindowLocation = function() {

        /**
         * @name getWindowLocation
         * @synopsis Returns the window location (or the location that the
         *     system was trying to set the window to)
         * @return {String} The window's location (or attempted set location)
         */

        //  If the window is inside of an iframe, then we have to poke around a
        //  bit
        if (TP.boot.$isElement(window.frameElement)) {
            //  If TIBET is currently 'setting a location' on the iframe, it
            //  will have tagged the location string on the iframe as an
            //  attribute.
            if (window.frameElement.hasAttribute(
                                        'tibet_settinglocation') === true) {
                return window.frameElement.getAttribute(
                                        'tibet_settinglocation');
            }

            //  On Webkit-based browsers, there is a bug such that if 'content'
            //  is being document.write()n to an iframe that's nested inside of
            //  another iframe, its location will be reported with the value of
            //  the top-level window's location, not its parent's location, as
            //  is true in other browsers.
            if (window.location.toString() === top.location.toString() &&
                    window.parent !== window) {
                return window.parent.location.toString();
            }
        }

        return window.location.toString();
    };

    //  ------------------------------------------------------------------------

    TP.boot.hideContent = function(anID) {

        /**
         * @name hideContent
         * @synopsis Hides the identified element, or the current content
         *     element if no element is specified.
         * @param {String|Element} anID The element whose content should be
         *     hidden.
         * @return {null}
         */

        var elem,
            tWin;

        tWin = $$findTIBET();
        if (TP.boot.$isValid(elem =
                    TP.boot.$byId(anID || TP.boot.$$currentContentID, tWin))) {
            elem.style.display = 'none';
            if (TP.boot.$$currentContentID === anID) {
                TP.boot.$$currentContentID = null;
            }
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.hideUICanvas = function() {

        /**
         * @name hideUICanvas
         * @synopsis Hides the current tibet.uicanvas element in the
         *     application's main window.
         * @return {null}
         */

        var win;

        win = TP.sys.getWindowById(TP.sys.cfg('tibet.uicanvas'));
        if (TP.boot.$isValid(win)) {
            //  make sure iframes are hidden as well
            if (TP.boot.$isValid(win.frameElement)) {
                win.frameElement.style.visibility = 'hidden';
            }
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.hideUIRoot = function() {

        /**
         * @name hideUIRoot
         * @synopsis Hides the current tibet.uiroot element in the application's
         *     main window.
         * @return {null}
         */

        var win;

        win = TP.sys.getWindowById(TP.sys.cfg('tibet.uiroot'));
        if (TP.boot.$isValid(win)) {
            //  make sure iframes are hidden as well
            if (TP.boot.$isValid(win.frameElement)) {
                win.frameElement.style.visibility = 'hidden';
            }
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.launchApp = function() {

        /**
         * @name launchApp
         * @synopsis Forces the application's boot page into place, triggering
         *     an application startup sequence.
         * @return {null}
         */

        window.location = TP.$$bootpage;

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.showContent = function(anID) {

        /**
         * @name showContent
         * @synopsis Shows the identified element, or the current content
         *     element if no element is specified.
         * @param {String|Element} anID The element whose content should be
         *     displayed.
         * @return {null}
         */

        var elem,
            tWin;

        tWin = $$findTIBET();

        TP.boot.hideUICanvas();
        TP.boot.hideContent(TP.boot.$$currentContentID);

        if (TP.boot.$isValid(elem = TP.boot.$byId(anID, tWin))) {
            elem.style.display = 'block';
            TP.boot.$$currentContentID = anID;
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.showUICanvas = function(aURI) {

        /**
         * @name showUICanvas
         * @synopsis Displays the current tibet.uicanvas element in the
         *     application's main window. If aURI is provided the content of
         *     that URI is placed in the canvas.
         * @param {String} aURI The URI whose content should be loaded and
         *     displayed.
         * @return {null}
         */

        var win,
            file;

        TP.boot.hideContent();

        win = TP.sys.getWindowById(TP.sys.cfg('tibet.uicanvas'));
        if (TP.boot.$isValid(win)) {
            if (TP.boot.$isValid(aURI)) {
                file = TP.boot.$uriExpandPath(aURI);

                //  pretend this page never hit the history
                window.location.replace(file);
            }

            //  make sure iframes are visible when used in this fashion
            if (TP.boot.$isValid(win.frameElement)) {
                win.frameElement.style.visibility = 'visible';
            }
        }

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.startGUI = function() {

        /**
         * @name startGUI
         * @synopsis Triggers activation of the application's UI startup
         *     sequence. The actual boot process for loading all static
         *     elements of the application should have been completed prior to
         *     calling this function.
         * @return {null}
         */

        var tWin;

        tWin = $$findTIBET();
        if (tWin && tWin.TP.sys && tWin.main) {
            tWin.main();
        } else {
            /* eslint-disable no-alert */
            window.alert('Unable to find main().');
            /* eslint-enable no-alert */
        }

        return;
    };

    //  --------------------------------------------------------------------
    //  METADATA
    //  --------------------------------------------------------------------

    /*
    All objects which might be leveraged as 'types' including the builtins
    need to have basic metadata in TIBET. The values consist of slots for:

        TP.TYPE             Reference to the type of the receiver.

        TP.TYPEC            The type constructor, used for subtype creation.
        TP.INSTC            The inst constructor, used for instance creation.

        TP.TNAME            The type name in string form for easy access.
        TP.RNAME            The 'real' type name in JS-identifier form.

        TP.SUPER            The immediate supertype object.

        TP.ANCESTORS        Receiver's supertype list.
        TP.ANCESTOR_NAMES   Receiver's supertype names.
    */

    //  --------------------------------------------------------------------

    TP.boot.$$setupMetadata = function() {

        var registerMetadata;

        TP.NAME = '$$name';
        TP.TNAME = '$$typename';
        TP.RNAME = '$$realname';

        TP.TYPE = '$$type';

        TP.TYPEC = '$$Type';
        TP.INSTC = '$$Inst';

        TP.SUPER = '$$supertype';
        TP.ANCESTORS = '$$ancestors';
        TP.ANCESTOR_NAMES = '$$anames';

        TP.SUBTYPE_NAMES = '$$snames';
        TP.SUBTYPE_NAMES_DEEP = '$$snames_deep';
        TP.SUBTYPES = '$$subtypes';
        TP.SUBTYPES_DEEP = '$$subtypes_deep';

        registerMetadata = function (target, type,
                                        typeC, instC,
                                        tName, rName, name,
                                        superT, ancestors, ancestorNames) {

            target[TP.TYPE] = type;

            target[TP.TYPEC] = typeC;
            target[TP.INSTC] = instC;

            target[TP.TNAME] = tName;
            target[TP.RNAME] = rName;
            target[TP.NAME] = name;

            target[TP.SUPER] = superT;
            target[TP.ANCESTORS] = ancestors;
            target[TP.ANCESTOR_NAMES] = ancestorNames;
        };

        //  Here we instrument the "big 8" types native to JS so they are
        //  aware of the metadata we'll be asking for from anything we think
        //  of as a type. NOTE we use simple closure here to hide this work.

        //  ** NOTE NOTE NOTE **
        //  We use 'TP.ac()' here throughout this method because these
        //  Arrays need to be created *as TIBETan enhanced Arrays*. They
        //  will be used for reflection purposes, etc. *even if this Window
        //  is not the TIBET window*. This is why we check not only for
        //  'TP', but 'TP.ac' below.

        //  Array
        registerMetadata(
                Array, Array, Function, Function,
                'Array', 'Array', 'Array',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Boolean
        registerMetadata(
                Boolean, Boolean, Function, Function,
                'Boolean', 'Boolean', 'Boolean',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Date
        registerMetadata(
                Date, Date, Function, Function,
                'Date', 'Date', 'Date',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Function
        registerMetadata(
                Function, Function, Function, Function,
                'Function', 'Function', 'Function',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Number
        registerMetadata(
                Number, Number, Function, Function,
                'Number', 'Number', 'Number',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Object
        registerMetadata(
                Object, Object, Function, Function,
                'Object', 'Object', 'Object',
                null, TP.ac(), TP.ac());

        //  RegExp
        registerMetadata(
                RegExp, RegExp, Function, Function,
                'RegExp', 'RegExp', 'RegExp',
                Object, TP.ac(Object), TP.ac('Object'));

        //  String
        registerMetadata(
                String, String, Function, Function,
                'String', 'String', 'String',
                Object, TP.ac(Object), TP.ac('Object'));

        //  The subtypes (and 'deep subtypes') of Object are the other "big 7"
        Object[TP.SUBTYPES] =
                TP.ac(Array, Boolean, Date, Function, Number, RegExp, String);
        Object[TP.SUBTYPES_DEEP] =
                TP.ac(Array, Boolean, Date, Function, Number, RegExp, String);
        Object[TP.SUBTYPE_NAMES] =
                TP.ac('Array', 'Boolean', 'Date', 'Function',
                        'Number', 'RegExp', 'String');
        Object[TP.SUBTYPE_NAMES_DEEP] =
                TP.ac('Array', 'Boolean', 'Date', 'Function',
                        'Number', 'RegExp', 'String');

        //  Now we instrument DOM-specific 'types'

        //  Window
        registerMetadata(
                Window, Window, Function, Function,
                'DOMWindow', 'DOMWindow', 'DOMWindow',
                Object, TP.ac(Object), TP.ac('Object'));
        Window.$$nonFunctionConstructorObjectName = 'DOMWindow';

        //  Browser-specific DOM 'types'

        //  Webkit

        if (TP.boot.$$isWebkit()) {

            registerMetadata(
                    XMLDocument, XMLDocument, Function, Function,
                    'XMLDocument', 'XMLDocument', 'XMLDocument',
                    Document,
                    TP.ac(Document, Node, Object),
                    TP.ac('Document', 'Node', 'Object'));

            registerMetadata(
                    XMLHttpRequest, XMLHttpRequest, Function, Function,
                    'XMLHttpRequest', 'XMLHttpRequest', 'XMLHttpRequest',
                    Object,
                    TP.ac(Object),
                    TP.ac('Object'));

            //  Need to tell our machinery that NaN's *constructor* name is
            //  'Number'
            /* jshint ignore:start */
            /* eslint-disable no-proto */
            NaN.__proto__.$$nonFunctionConstructorConstructorName =
                                        'Number';
            /* eslint-enable no-proto */
            /* jshint ignore:end */
        }

        //  Firefox

        if (TP.boot.$$isMoz()) {

            registerMetadata(
                    CSS2Properties, CSS2Properties, Function, Function,
                    'CSSStyleDeclaration',
                    'CSSStyleDeclaration',
                    'CSSStyleDeclaration',
                    Object,
                    TP.ac(Object),
                    TP.ac('Object'));

            //  Need to tell our machinery that NaN's *constructor* name is
            //  'Number'
            /* jshint ignore:start */
            /* eslint-disable no-proto */
            NaN.__proto__.$$nonFunctionConstructorConstructorName = 'Number';
            /* eslint-enable no-proto */
            /* jshint ignore:end */
        }

        //  Internet Explorer

        /*
        if (TP.boot.$$isIE()) {
            Object.defineProperty(Window, '$$name',
                                {get: function () {return 'DOMWindow';}});

            Object.defineProperty(Document, '$$name',
                                {get: function () {
                                    if (this.xmlVersion) {
                                        return 'XMLDocument';
                                    } else {
                                        return 'HTMLDocument';
                                    }
                                }});
        }
        */
    };

    //  ------------------------------------------------------------------------

    TP.boot.installPatches = function (aWindow) {

        //  For IE... but required by the 'TP.boot.autoBoot' and
        //  'TP.boot.bootFromBookmark' functions.
        if (TP.boot.$notValid(aWindow.atob)) {
            aWindow.atob = function(aString) {
                /**
                 * @name atob
                 * @synopsis An implementation of the atob function found in
                 *     Mozilla which takes a Base64-encoded ascii string and
                 *     decodes it to binary form.
                 * @param {String} aString The string to convert.
                 * @return {Object} A decoded String.
                 */

                var atobData,
                    btoaData,

                    i,

                    c,
                    d,
                    e,
                    f,
                    n,

                    arr,
                    out,
                    ndx;

                if (typeof(aString) !== 'string') {
                    return TP.boot.$raise(this, 'InvalidParameter');
                }

                atobData = [];

                for (i = 0; i < 26; i++) {
                    atobData.push(String.fromCharCode(65 + i));
                }

                for (i = 0; i < 26; i++) {
                    atobData.push(String.fromCharCode(97 + i));
                }

                for (i = 0; i < 10; i++) {
                    atobData.push(String.fromCharCode(48 + i));
                }

                atobData.push('+');
                atobData.push('/');

                btoaData = [];

                for (i = 0; i < 128; i++) {
                    btoaData.push(-1);
                }

                for (i = 0; i < 64; i++) {
                    btoaData[atobData[i].charCodeAt(0)] = i;
                }

                arr = aString.split('');
                ndx = 0;
                out = '';

                n = 0;

                do {
                    f = arr[ndx++].charCodeAt(0);
                    i = btoaData[f];

                    /* jshint bitwise:false */
                    if (f >= 0 && f < 128 && i !== -1) {
                        if (n % 4 === 0) {
                            c = i << 2;
                        } else if (n % 4 === 1) {
                            c = c | (i >> 4);
                            d = (i & 0x0000000F) << 4;
                        } else if (n % 4 === 2) {
                            d = d | (i >> 2);
                            e = (i & 0x00000003) << 6;
                        } else {
                            e = e | i;
                        }
                    /* jshint bitwise:true */

                        n++;

                        if (n % 4 === 0) {
                            out += String.fromCharCode(c) +
                                    String.fromCharCode(d) +
                                    String.fromCharCode(e);
                        }
                    }
                }
                while (arr[ndx]);

                if (n % 4 === 3) {
                    out += String.fromCharCode(c) + String.fromCharCode(d);
                } else if (n % 4 === 2) {
                    out += String.fromCharCode(c);
                }

                return out;
            };
        }

        //  --------------------------------------------------------------------
        //  CSS OM Patches
        //  --------------------------------------------------------------------

        //  Mozilla has bugs around its Gecko rendering engine not properly
        //  supplying the offset* properties for custom elements. We rectify
        //  that here.
        if (TP.boot.$$isMoz()) {

            aWindow.Element.prototype.__defineGetter__(
                'offsetParent',
                function() {

                    return TP.elementGetOffsetParent(this);
                });

            aWindow.Element.prototype.__defineGetter__(
                'offsetTop',
                function() {

                    return Math.round(this.getBoundingClientRect().top);
                });

            aWindow.Element.prototype.__defineGetter__(
                'offsetLeft',
                function() {

                    return Math.round(this.getBoundingClientRect().left);
                });

            aWindow.Element.prototype.__defineGetter__(
                'offsetWidth',
                function() {

                    return Math.round(this.getBoundingClientRect().width);
                });

            aWindow.Element.prototype.__defineGetter__(
                'offsetHeight',
                function() {

                    return Math.round(this.getBoundingClientRect().height);
                });
        }

        //  --------------------------------------------------------------------
        //  Event Patches
        //  --------------------------------------------------------------------

        if (TP.boot.$$isMoz() || TP.boot.$$isWebkit()) {

            aWindow.Event.prototype.__defineGetter__(
                'offsetX',
                function() {

                    //  The spec says that offsetX should be computed from the
                    //  left of the *padding box* (i.e. including the padding,
                    //  but excluding the border).

                    var target,
                        compStyle,
                        offsetX,
                        absOffset;

                    target = this.target;

                    if (target && target.nodeType !== Node.DOCUMENT_NODE) {
                        target = (target.nodeType === Node.TEXT_NODE) ?
                                                    target.parentNode :
                                                    target;

                        compStyle = TP.elementGetComputedStyleObj(target);

                        if (compStyle.position === 'absolute' ||
                            compStyle.position === 'relative') {
                            offsetX = this.layerX;
                        } else {
                            absOffset =
                                TP.elementGetOffsetFromContainer(target);
                            offsetX = this.layerX - absOffset[0];

                            if (target.offsetParent) {
                                compStyle = TP.elementGetComputedStyleObj(
                                                        target.offsetParent);
                                offsetX -= compStyle.getPropertyCSSValue(
                                            'border-left-width').getFloatValue(
                                            CSSPrimitiveValue.CSS_PX);
                            }
                        }

                        return offsetX;
                    }

                    return 0;
                });

            aWindow.Event.prototype.__defineGetter__(
                'offsetY',
                function() {

                    //  The spec says that offsetY should be computed from the
                    //  top of the *padding box* (i.e. including the padding,
                    //  but excluding the border).

                    var target,
                        compStyle,
                        offsetY,
                        absOffset;

                    target = this.target;

                    if (target && target.nodeType !== Node.DOCUMENT_NODE) {
                        target = (target.nodeType === Node.TEXT_NODE) ?
                                                    target.parentNode :
                                                    target;

                        compStyle = TP.elementGetComputedStyleObj(target);

                        if (compStyle.position === 'absolute' ||
                            compStyle.position === 'relative') {
                            offsetY = this.layerY;
                        } else {
                            absOffset =
                                TP.elementGetOffsetFromContainer(target);
                            offsetY = this.layerY - absOffset[1];

                            if (target.offsetParent) {
                                compStyle = TP.elementGetComputedStyleObj(
                                                        target.offsetParent);
                                offsetY -= compStyle.getPropertyCSSValue(
                                            'border-top-width').getFloatValue(
                                            CSSPrimitiveValue.CSS_PX);
                            }
                        }

                        return offsetY;
                    }

                    return 0;
                });

            aWindow.Event.prototype.__defineGetter__(
                'resolvedTarget',
                function() {

                    var resolvedTarget;

                    if (TP.boot.$isValid(resolvedTarget =
                                            this._resolvedTarget)) {
                        return resolvedTarget;
                    }

                    if (!TP.boot.$isElement(resolvedTarget =
                                                TP.eventResolveTarget(this))) {
                        return null;
                    }

                    this._resolvedTarget = resolvedTarget;

                    return resolvedTarget;
                });
        } else if (TP.boot.$$isIE()) {
            //  IE

            Object.defineProperty(
                aWindow.Event.prototype,
                'target',
                {
                    get: function() {

                        return this.srcElement;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'currentTarget',
                {
                    get: function() {

                        //  We can never compute 'currentTarget' for IE in
                        //  TIBET, since we use document-level event handlers
                        return null;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'relatedTarget',
                {
                    get: function() {

                        return this.fromElement || this.toElement || null;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'metaKey',
                {
                    get: function() {

                        return false;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'pageX',
                {
                    get: function() {

                        var evtDoc;

                        evtDoc = this.srcElement.document;

                        //  We assume standards mode here, since its been the
                        //  documentElement holding the scroll left value since
                        //  standards mode in *IE6*
                        return this.clientX + evtDoc.documentElement.scrollLeft;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'pageY',
                {
                    get: function() {

                        var evtDoc;

                        evtDoc = this.srcElement.document;

                        //  We assume standards mode here, since its been the
                        //  documentElement holding the scroll top value since
                        //  standards mode in *IE6*
                        return this.clientY + evtDoc.documentElement.scrollTop;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'resolvedTarget',
                {
                    get: function() {

                        var resolvedTarget;

                        if (TP.boot.$isValid(resolvedTarget =
                                                    this._resolvedTarget)) {
                            return resolvedTarget;
                        }

                        if (!TP.boot.$isElement(resolvedTarget =
                                                TP.eventResolveTarget(this))) {
                            return null;
                        }

                        this._resolvedTarget = resolvedTarget;

                        return resolvedTarget;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'view',
                {
                    get: function() {

                        return this.srcElement.document.parentWindow;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'wheelDelta',
                {
                    get: function() {

                        if (this.type === 'mousewheel') {
                            return this.detail / 120;
                        }
                    }
                });

            //  Add 'stopPropagation' and 'preventDefault' methods
            aWindow.Event.prototype.stopPropagation = function() {

                this.cancelBubble = true;
            };

            aWindow.Event.prototype.preventDefault = function() {

                if (this.type === 'mouseover') {
                    this.returnValue = true;
                } else {
                    this.returnValue = false;
                }
            };
        }

        //  All browsers get 'at()' and 'atPut()' on their Event objects.
        aWindow.Event.prototype.at = function(key) {

            return this[key];
        };

        aWindow.Event.prototype.atPut = function(key, value) {

            this[key] = value;

            return this;
        };

        //  Add a 'copy' method for native Event objects that just returns a
        //  literal object.
        aWindow.Event.prototype.copy = function() {

            var proxy,
                proto,
                i;

            proxy = {
                    target: this.target,
                    $$target: this.$$target,

                    //  Never use the $$ version of currentTarget...
                    currentTarget: this.currentTarget,

                    relatedTarget: this.relatedTarget,
                    $$relatedTarget: this.$$relatedTarget,

                    type: this.type,
                    $$type: this.$$type,

                    timeStamp: this.timeStamp,
                    $$timestamp: this.$$timestamp,

                    clientX: this.clientX,
                    $$clientX: this.$$clientX,
                    clientY: this.clientY,
                    $$clientY: this.$$clientY,
                    $$clientPt: this.$$clientPt,

                    offsetX: this.offsetX,
                    $$offsetX: this.$$offsetX,
                    offsetY: this.offsetY,
                    $$offsetY: this.$$offsetY,
                    $$offsetPt: this.$$offsetPt,

                    view: this.view,
                    $$view: this.$$view,

                    pageX: this.pageX,
                    $$pageX: this.$$pageX,
                    pageY: this.pageY,
                    $$pageY: this.$$pageY,
                    $$pagePt: this.$$pagePt,

                    resolvedTarget: this.resolvedTarget,
                    $$_resolvedTarget: this.$$_resolvedTarget,

                    screenX: this.screenX,
                    $$screenX: this.$$screenX,
                    screenY: this.screenY,
                    $$screenY: this.$$screenY,
                    $$screenPt: this.$$screenPt,

                    $$transPt: this.$$transPt,

                    //  Never use the non-$$ version of keyCode...
                    $$keyCode: this.$$keyCode,

                    altKey: this.altKey,
                    $$altKey: this.$$altKey,
                    ctrlKey: this.ctrlKey,
                    $$ctrlKey: this.$$ctrlKey,
                    shiftKey: this.shiftKey,
                    $$shiftKey: this.$$shiftKey,

                    //  Never use the $$ version of metaKey...
                    metaKey: this.metaKey,

                    button: this.button,
                    $$button: this.$$button,

                    wheelDelta: this.wheelDelta,
                    $$wheelDelta: this.$$wheelDelta,

                    //  Specific to Mozilla/Webkit
                    charCode: this.charCode,

                    //  Specific to Mozilla
                    which: this.which,

                    //  Specific to IE
                    cancelBubble: this.cancelBubble,
                    returnValue: this.returnValue,

                    //  Special TIBET-an flags placed on events
                    $captured: this.$captured,
                    $dragdistance: this.$dragdistance,
                    $normalized: this.$normalized,
                    $notSignaled: this.$notSignaled,
                    $unicodeCharCode: this.$unicodeCharCode,
                    $computedName: this.$computedName
                };

            //  Now, copy all keys that are on the prototype that we don't know
            //  about.
            proto = aWindow.Event.prototype;
            for (i in proto) {
                if (proto.hasOwnProperty(i)) {
                    try {
                        if (typeof this[i] === 'function') {
                            proxy[i] = this[i];
                        }
                    } catch (e) {
                        // Ignore errors. Events don't like being touched.
                    }
                }
            }

            return proxy;
        };

        //  --------------------------------------------------------------------
        //  NamedNodeMap Patch
        //  --------------------------------------------------------------------

        //  As of Firefox 22, 'NamedNodeMap' only deals with attributes (as per
        //  DOM Level 4). This alias patches that for us.
        if (TP.boot.$notValid(aWindow.NamedNodeMap)) {
            aWindow.NamedNodeMap = aWindow.MozNamedAttrMap;
            Object.defineProperty(
                    aWindow.MozNamedAttrMap,
                    '$$name',
                    {get: function () {return 'NamedNodeMap';}});
        }

        //  --------------------------------------------------------------------
        //  Set up Metadata
        //  --------------------------------------------------------------------

        //  See the ** NOTE NOTE NOTE* above in TP.boot.$$setupMetadata about
        //  why we check not only for 'TP' here, but for 'TP.ac' (we also check
        //  to see if the Object constructor has a '$$name' slot just to avoid
        //  doing this again if it's been done).
        if (aWindow.TP && aWindow.TP.ac && !Object.$$name) {
            TP.boot.$$setupMetadata();
        }

        //  --------------------------------------------------------------------
        //  getKeys Patch
        //  --------------------------------------------------------------------

        //  Set up 'getKeys' for as many native Objects as we know about

        //  Array's 'getKeys' is in the kernel

        //  We do this for HTML Elements, but the prototype is different between
        //  W3C browsers and IE...
        if (TP.boot.$$isIE()) {
            aWindow.Element.prototype.getKeys = function() {

                return TP.sys.$htmlelemkeys;
            };
        } else {
            //  Don't want the HTML Element keys to show up on every Element in
            //  Gecko/Webkit (i.e. XML elements), so we specifically put them on
            //  HTMLElement
            aWindow.HTMLElement.prototype.getKeys = function() {

                return TP.sys.$htmlelemkeys;
            };
        }

        //  We do this for HTML Documents, but the prototype is different
        //  between W3C browsers and IE...
        if (TP.boot.$$isIE()) {
            aWindow.Document.prototype.getKeys = function() {

                return TP.sys.$htmldockeys;
            };
        } else {
            //  Don't want the HTML Document keys to show up on every Document in
            //  Gecko/Webkit (i.e. XML documents), so we specifically put them on
            //  HTMLDocument
            aWindow.HTMLDocument.prototype.getKeys = function() {

                return TP.sys.$htmldockeys;
            };
        }

        //  We don't do these for XML nodes, documents or elements. Those get
        //  checked in the TP.objectKeys() method.

        aWindow.Error.prototype.getKeys = function() {

            return TP.sys.$errorkeys;
        };

        aWindow.Event.prototype.getKeys = function() {

            return TP.sys.$eventkeys;
        };

        aWindow.NamedNodeMap.prototype.getKeys = function() {

            return TP.sys.$namednodemapkeys;
        };

        aWindow.NodeList.prototype.getKeys = function() {

            return TP.sys.$nodelistkeys;
        };

        //  String's 'getKeys' is in the kernel

        aWindow.Window.prototype.getKeys = function() {

            return TP.sys.$windowkeys;
        };

        aWindow.XMLHttpRequest.prototype.getKeys = function() {

            return TP.sys.$xhrkeys;
        };
    };

    //  ------------------------------------------------------------------------

    TP.windowIsInstrumented = TP.windowIsInstrumented || function(aWindow) {

        /**
         * @name windowIsInstrumented
         * @synopsis Returns true if the receiving window still sees TIBET
         *     instrumentation.
         * @param {Window} aWindow The native window to test. For the hook file
         *     version this defaults to 'window'.
         * @return {Boolean}
         * @todo
         */

        var win;

        win = (aWindow != null) ? aWindow : window;

        //  the things we'll use are the things we care about the most here
        return (win.$$instrumented === true &&
                win.$$tibet != null &&
                win.TP != null);
    };

    //  ------------------------------------------------------------------------
    //  EVENT DISPATCH
    //  ------------------------------------------------------------------------

    /*
    Functions in this section provide lightweight event dispatch and handler
    lookup features. These functions are replaced by their more powerful kernel
    equivalents when a shared TIBET codebase is found, allowing you to skin
    simple UI transformations without loading TIBET, then convert instantly to
    more sophisticated controllers once TIBET loads.
    */

    TP.boot.$$computeDispatchOrigin = function(orig, elem, args) {

        /**
         * @name $$computeDispatchOrigin
         * @synopsis Computes the likely origin for TP.boot.$$dispatch() when
         *     provided with an element and/or event object but not a string
         *     origin.
         * @description TIBET uses string origins for actual signaling to allow
         *     more flexibility and control. This method will attempt to compute
         *     a string origin for an element or event when no string origin is
         *     provided.
         * @param {Element} orig The event origin.
         * @param {Element} elem The element the event originated from, if the
         *     event origin isn't an Element.
         * @param {Event} args The event object that generated the event. If
         *     orig or elem can't be used, use this object to try to get its
         *     'source element' or 'target'.
         * @return {Element|String} Typically a string, but sometimes the
         *     element when no string value can be computed with certainty.
         * @todo
         */

        var tibetOrigin,
            origin;

        //  string origins are used without alteration so check that first
        if (typeof(orig) === 'string' && orig !== '') {
            return orig;
        }

        //  trying to get an element we can work from when origin isn't string
        if (TP.boot.$isElement(orig)) {
            origin = orig;
        } else if (TP.boot.$isElement(elem)) {
            //  we were given the element, so use it
            origin = elem;
        } else if (TP.boot.$isEvent(args)) {
            //  args is normally an Event object, so we'll check that next
            if ((origin = args.srcElement) == null) {
                //  IE uses srcElement, so if that wasn't there we'll try
                //  for Moz's target attribute
                origin = args.target;
            }
        }

        //  still null (or empty)? then we use the special value TP.ANY which
        //  tells TIBET listeners for any origin should match
        if (origin == null || origin === '') {
            return TP.ANY;
        }

        //  try to get an origin from the element itself. using tibet:origin
        //  allows an element to provide an origin other than its ID easily

        try {
            tibetOrigin = origin.getAttribute('tibet:origin');
            if (tibetOrigin != null && tibetOrigin !== '') {
                return tibetOrigin;
            }
        } catch (e) {
        }

        //  the remaining options need TIBET instrumentation in place
        if (TP.windowIsInstrumented(window)) {
            //  try to get a global ID from the element. Note here how we pass
            //  'true' as the second parameter to try to generate an ID if the
            //  element doesn't already have one.
            tibetOrigin = TP.gid(origin, true);
            if (tibetOrigin != null && tibetOrigin !== '') {
                return tibetOrigin;
            }

            //  try to get an ID from the element
            tibetOrigin = TP.elementGetAttribute(origin, 'id');
            if (tibetOrigin != null && tibetOrigin !== '') {
                return tibetOrigin;
            }
        }

        //  otherwise use the element
        return origin;

    };

    //  ------------------------------------------------------------------------

    TP.boot.$$displaySignalData = function(origin, signal, elem, args, policy) {

        /**
         * @name $$displaySignalData
         * @synopsis Provides a simple feedback mechanism during UI prototyping
         *     to ensure that the proper events are being thrown in response to
         *     UI interactions.
         * @description During UI prototyping it can be useful to have visual
         *     display of event data to confirm that the proper origin and
         *     signal data are being dispatched. This function is part of the
         *     default processing for the lightweight TP.boot.$$dispatch() call
         *     to help ensure that the UI is providing the proper signaling data
         *     in preparation for adding TIBET controller logic.
         * @param {String|Element} origin The event origin, either an element or
         *     the element's ID.
         * @param {String} signal The signal name to report.
         * @param {Element} elem The element that is the target of the event.
         * @param {Event|Object} args The event object itself, an Array, or a
         *     hash of parameter data.
         * @param {String} policy A TIBET dispatch policy. Ignored at this
         *     level.
         * @return {null}
         * @todo
         */

        try {
            if (origin == null || typeof(origin) === 'string') {
                window.status = 'origin: ' + origin + '::' +
                                origin +
                                ' signal: ' + signal;
            } else if (origin != null) {
                window.status = 'origin: ' + origin + '::' +
                                origin.getAttribute('id') +
                                ' signal: ' + signal;
            }
        } catch (e) {
        }

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$dispatch = function(orig, sig, elem, args, policy, display) {

        /**
         * @name $$dispatch
         * @synopsis Placeholder for TIBET's TP.dispatch action, which is
         *     installed on successful launch. This version supports the
         *     initial UI development process -- which can be done outside of
         *     TIBET.
         * @param {String|Element} orig The event origin, either an element or
         *     the element's ID.
         * @param {String} sig The signal name to provide to TIBET.
         * @param {Element} elem The element that is the target of the event.
         * @param {Event|Object} args The event object itself, an Array, or a
         *     hash of parameter data.
         * @param {String} policy A TIBET dispatch policy. Ignored at this
         *     level.
         * @param {Boolean} display Should the signal data be displayed,
         *     normally true.
         * @return {null}
         * @todo
         */

        var signal,
            origin,
            retval,
            fName,
            oStr;

        //  signal can be provided as a string or translated from the native
        //  event if necessary

        signal = sig;

        if (TP.boot.$isEmpty(signal) && TP.boot.$isEvent(args)) {
            signal = TP.DOM_SIGNAL_TYPE_MAP[args.type];
        } else {
            signal = TP.DOM_SIGNAL_TYPE_MAP[sig] || sig;
        }

        if (display !== false) {
            TP.boot.$$displaySignalData(orig, signal, elem, args, policy);
        }

        //  stop all events at the first layer/element that has a handler
        if (TP.boot.$isEvent(args)) {
            if (TP.boot.$$isIE()) {
                args.cancelBubble = true;
            } else {
                //  This seems to cause Mozilla to seize up, so we make it
                //  Webkit-only.
                if (TP.boot.$$isWebkit()) {
                    args.stopPropagation();
                }
            }
        }

        //  compute the TAP-style origin entry for this event to make sure we
        //  have all the right information to properly dispatch
        origin = TP.boot.$$computeDispatchOrigin(orig, elem, args);

        //  if the origin is a string then we'll check first for an
        //  origin-specific handler for the signal
        if (typeof(origin) === 'string') {
            oStr = origin.charAt(0).toUpperCase() + origin.slice(1);
            fName = '$handle' + oStr + signal;
            if (typeof(self[fName]) === 'function') {
                try {
                    retval = self[fName](oStr, signal, elem, args, policy);
                } catch (e) {
                }

                return retval;
            }
        }

        //  next we try to find a signal-specific handler to run
        fName = '$handle' + signal;
        if (typeof(self[fName]) === 'function') {
            try {
                retval = self[fName](origin, signal, elem, args, policy);
            } catch (e) {
            }

            return retval;
        }

        if (display !== false) {
            TP.boot.$$displaySignalData(origin, signal, elem, args, policy);
        }

        //  return void by default so the app doesn't disappear :)
        return;
    };

    //  ------------------------------------------------------------------------

    //  alias the primitive to the normal value for use in html-only mode. when
    //  loaded via TIBET TP.dispatch() will take precedence and it will be up to
    //  the handlers found via that call to dispatch back down into these
    //  primitive UI routines if they want to continue to leverage them.
    if (TP.boot.$isValid(window.TP) && TP.boot.$notValid(TP.dispatch)) {
        TP.dispatch = TP.boot.$$dispatch;
    }

    //  ------------------------------------------------------------------------

    TP.boot.$raise = function(anOrigin, anException, aPayload) {

        /**
         * @name $raise
         * @synopsis Dispatches the exception as a signal, using the origin and
         *     argument data provided. TIBET exceptions are lightweight and can
         *     be 'handled' or proceed to throw a native Error.
         * @param {Object} anOrigin The origin signaled for this event. Can be a
         *     string to allow spoofing of element IDs etc.
         * @param {Object} anException The signal being triggered.
         * @param {Object} aPayload arguments for the signal.
         * @return {null}
         * @todo
         */

        //  NOTE the context gets dropped here since the primitive version
        //  takes an element as the context
        return TP.boot.$$dispatch(anOrigin, anException, aPayload);
    };

    //  ------------------------------------------------------------------------
    //  EVENT HANDLER INSTALLATION
    //  ------------------------------------------------------------------------

    TP.boot.$$addUIHandler = function(anObject, eventName, handlerFunc) {

        /**
         * @name $$addUIHandler
         * @synopsis Adds a special 'UI' event handler to the object under the
         *     supplied event name. This handler is used to send low-level
         *     events to TIBET for further processing.
         * @param {Object} anObject The object that the event handler is to be
         *     installed on.
         * @param {String} eventName The name of the event that the handler will
         *     be installed for.
         * @param {Function} handlerFunc The handler function to use.
         * @return {null}
         * @todo
         */

        var theEventName,
                handlerWrapperFunc;

        theEventName = eventName;

        //  If we're on IE, we use 'activate / deactivate' instead of 'focus /
        //  blur' because 'focus' and 'blur' events don't bubble up to the
        //  document from the target element which means that if we're
        //  installing these handlers on the document, we'll never get the
        //  event.

        if (TP.boot.$$isIE()) {
            if (eventName === 'focus') {
                theEventName = 'activate';
            } else if (eventName === 'blur') {
                theEventName = 'deactivate';
            }

            handlerWrapperFunc = function(evt) {

                    //  W3C Event spec says there is a 'timeStamp' property -
                    //  which we try to set as early as possible.
                    evt.timeStamp = (new Date()).getTime();

                    return handlerFunc(evt);
                };

            anObject.attachEvent('on' + theEventName, handlerWrapperFunc);
        } else {
            if (TP.boot.$$isMoz() && (eventName === 'mousewheel')) {
                theEventName = 'DOMMouseScroll';
            }

            anObject.addEventListener(theEventName, handlerFunc, true);
        }

        //  Cache the handler function on the TP.boot object using the event
        //  name so that we can use it later when we remove the handler.
        TP.boot['$$' + theEventName + 'Handler'] = handlerFunc;

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$removeUIHandler = function(anObject, eventName) {

        /**
         * @name TP.boot.$$removeUIHandler
         * @synopsis Removes the special 'UI' event handler that was installed
         *     on the object.
         * @param {Object} anObject The object that the event handler was
         *     installed on.
         * @param {String} eventName The name of the event that the handler was
         *     installed for.
         * @return {null}
         * @todo
         */

        var handlerFunc,
                theEventName;

        theEventName = eventName;

        //  If we're on IE, we use 'activate / deactivate' instead of 'focus /
        //  blur' because 'focus' and 'blur' events don't bubble up to the
        //  document from the target element which means that if we're
        //  installing these handlers on the document, we'll never get the
        //  event.
        if (TP.boot.$$isIE()) {
            if (eventName === 'focus') {
                theEventName = 'activate';
            } else if (eventName === 'blur') {
                theEventName = 'deactivate';
            }
        }

        //  Make sure that we can find a valid 'special UI handler'. This was
        //  cached on a slot on the TP.boot object when we registered the
        //  handler via the TP.boot.$$addUIHandler() function above.
        handlerFunc = TP.boot['$$' + theEventName + 'Handler'];

        if (TP.boot.$notValid(handlerFunc)) {
            return;
        }

        if (TP.boot.$$isIE()) {
            anObject.detachEvent('on' + theEventName, handlerFunc);
        } else {
            if (TP.boot.$$isMoz() && (eventName === 'mousewheel')) {
                theEventName = 'DOMMouseScroll';
            }

            anObject.removeEventListener(theEventName, handlerFunc, true);
        }

        //  Clear the slot on the TP.boot object, so that we don't leave little
        //  bits, like unused Functions, around.
        TP.boot['$$' + theEventName + 'Handler'] = null;

        return;
    };

    //  ------------------------------------------------------------------------
    //  DOM MUTATION HOOK
    //  ------------------------------------------------------------------------

    TP.boot.$$addMutationSource = function(aDocument) {
        TP.core.MutationSignalSource.addObserverFor(aDocument);
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$removeMutationSource = function(aDocument) {
        TP.core.MutationSignalSource.removeObserverFor(aDocument);
    };

    //  ------------------------------------------------------------------------
    //  CSS STYLE MODIFICATION HOOK
    //  ------------------------------------------------------------------------

    TP.boot.$$captureStyle = function() {

        /**
         * @name $$captureStyle
         * @synopsis Hides style elements from the browser to keep it from
         *     reporting "errors" for namespaces other than HTML.
         * @return {null}
         */

        var head,
            handlerFunc;

        if (TP.boot.$$isIE()) {
            //  Attach an onreadystatechange that will hide the document's body
            //  before it has a chance to be shown.
            document.attachEvent(
                'onreadystatechange',
                handlerFunc = function() {

                    //  Make sure the browser is done loading the document.
                    if (document.readyState === 'complete') {
                        //  rip out this handler
                        document.detachEvent('onreadystatechange',
                                                handlerFunc);

                        //  make sure there's a body to manipulate, sometimes
                        //  things get a little out of sync with load/unload and
                        //  we don't want to make assumptions here
                        if (document.body) {
                            //  document.body.style.visibility = 'hidden';
                            void(0);
                        }
                    }
                });

            return;
        } else {
            //  Add our DOM insertion function as an Event handler for the
            //  DOMNodeInserted event on the head element. See the
            //  TP.$eventHandleStyleInsertion function for more information on
            //  why we do this.
            head = document.getElementsByTagName('head')[0];
            if (head) {
                head.addEventListener(
                    'DOMNodeInserted',
                    TP.$eventHandleStyleInsertion,
                    true);

                //  Add a listener for DOMContentLoaded so that when we know
                //  when all of the DOM elements have been constructed (even if
                //  all external resources like images, script, etc. might not
                //  have loaded yet).
                document.addEventListener(
                    'DOMContentLoaded',
                    handlerFunc = function() {

                        var hd;

                        //  clean up so we don't run into issues with recursions
                        //  or leaks
                        document.removeEventListener('DOMContentLoaded',
                                                        handlerFunc,
                                                        false);

                        if (document.body) {
                        //  Hide the body so that we can do style processing
                        //  without having it flicker around.
                        //  document.body.style.visibility = 'hidden';
                            void(0);
                        }

                        //  We don't do this on Mozilla in lieu of the logic in
                        //  TP.$eventHandleStyleInsertion function due to
                        //  Mozilla 1.8's CSS validation logic (which causes a
                        //  lot of spurious errors for us).
                        //TP.$windowDisableStyleSheets(window);

                        //  Remove the DOM insertion function from the 'head'
                        //  element if we can still find it
                        hd = document.getElementsByTagName('head')[0];
                        if (hd) {
                            hd.removeEventListener(
                                'DOMNodeInserted',
                                TP.$eventHandleStyleInsertion,
                                true);
                        }
                    },
                    false);
            }
        }
    };

    //  ------------------------------------------------------------------------
    //  PAGE SETUP/TEARDOWN
    //  ------------------------------------------------------------------------

    /*
    TIBET sets up global handlers for native events so it can manage the event
    system more effectively. These overall event handlers are setup/torn down by
    the functions in this section.
    */

    //  ------------------------------------------------------------------------

    TP.boot.$$stopAndPreventEvent = function(anEvent) {

        /**
         * @name $$stopAndPreventEvent
         * @synopsis A method that is meant to be used as an event handler that
         *     stops propagation and prevents default on the supplied event.
         * @param {HTMLEvent} anEvent The HTML event to stop propagation and
         *     prevent default of.
         * @return {null}
         * @todo
         */

        anEvent.stopPropagation();
        anEvent.preventDefault();

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$documentSetup = function(aDocument) {

        /**
         * @name $$documentSetup
         * @synopsis Sets up the supplied Document with event handlers that will
         *     cause elements in the page to have advanced event management.
         *     This includes the use of enhanced CSS constructs as managed by
         *     TIBET.
         * @param {HTMLDocument} aDocument The HTML document to enhance with
         *     advanced event management event handlers.
         * @return {null}
         */

        TP.boot.$$addUIHandler(aDocument,
                                'click',
                                TP.core.Mouse.$$handleMouseEvent);
        TP.boot.$$addUIHandler(aDocument,
                                'dblclick',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mousemove',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mouseover',
                                TP.core.Mouse.$$handleMouseEvent);
        TP.boot.$$addUIHandler(aDocument,
                                'mouseout',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mouseenter',
                                TP.core.Mouse.$$handleMouseEvent);
        TP.boot.$$addUIHandler(aDocument,
                                'mouseleave',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mousedown',
                                TP.core.Mouse.$$handleMouseEvent);
        TP.boot.$$addUIHandler(aDocument,
                                'mouseup',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'contextmenu',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mousewheel',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'keyup',
                                TP.core.Keyboard.$$handleKeyEvent);

        //  On IE, the 'topmost listener' for oncut/oncopy/onpaste that gets
        //  notified is the 'body' element. This doesn't affect the 'origin
        //  set' that gets signaled for these signals (they're fired with
        //  DOM_FIRING).
        if (TP.boot.$$isIE()) {
            TP.boot.$$addUIHandler(aDocument.body,
                                    'cut',
                                    TP.$$handleCut);
            TP.boot.$$addUIHandler(aDocument.body,
                                    'copy',
                                    TP.$$handleCopy);
            TP.boot.$$addUIHandler(aDocument.body,
                                    'paste',
                                    TP.$$handlePaste);
        } else {
            TP.boot.$$addUIHandler(aDocument,
                                    'cut',
                                    TP.$$handleCut);
            TP.boot.$$addUIHandler(aDocument,
                                    'copy',
                                    TP.$$handleCopy);
            TP.boot.$$addUIHandler(aDocument,
                                    'paste',
                                    TP.$$handlePaste);
        }

        TP.boot.$$addUIHandler(aDocument,
                                'blur',
                                TP.$$handleBlur);
        TP.boot.$$addUIHandler(aDocument,
                                'focus',
                                TP.$$handleFocus);

        TP.boot.$$addUIHandler(aDocument,
                                'keydown',
                                TP.core.Keyboard.$$handleKeyEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'keypress',
                                TP.core.Keyboard.$$handleKeyEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'change',
                                TP.$$handleChange);

        TP.boot.$$addUIHandler(aDocument,
                                'transitionend',
                                TP.$$handleTransitionEnd);

        //  Add a mutation signal source for mutations to this document
        TP.boot.$$addMutationSource(aDocument);

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$documentTeardown = function(aDocument) {

        /**
         * @name $$documentTeardown
         * @synopsis Tears down the supplied Document from the event handlers
         *     that caused elements in the page to have advanced event
         *     management. This includes the use of enhanced CSS constructs as
         *     managed by TIBET.
         * @param {HTMLDocument} aDocument The HTML document to tear down the
         *     advanced event management event handlers.
         * @return {null}
         */

        TP.boot.$$removeUIHandler(aDocument, 'click');
        TP.boot.$$removeUIHandler(aDocument, 'dblclick');

        TP.boot.$$removeUIHandler(aDocument, 'mousemove');

        TP.boot.$$removeUIHandler(aDocument, 'mouseover');
        TP.boot.$$removeUIHandler(aDocument, 'mouseout');

        TP.boot.$$removeUIHandler(aDocument, 'mouseenter');
        TP.boot.$$removeUIHandler(aDocument, 'mouseleave');

        TP.boot.$$removeUIHandler(aDocument, 'mousedown');
        TP.boot.$$removeUIHandler(aDocument, 'mouseup');

        TP.boot.$$removeUIHandler(aDocument, 'contextmenu');

        TP.boot.$$removeUIHandler(aDocument, 'mousewheel');

        TP.boot.$$removeUIHandler(aDocument, 'keyup');

        TP.boot.$$removeUIHandler(aDocument, 'cut');
        TP.boot.$$removeUIHandler(aDocument, 'copy');
        TP.boot.$$removeUIHandler(aDocument, 'paste');

        TP.boot.$$removeUIHandler(aDocument, 'blur');
        TP.boot.$$removeUIHandler(aDocument, 'focus');

        TP.boot.$$removeUIHandler(aDocument, 'keydown');
        TP.boot.$$removeUIHandler(aDocument, 'keypress');

        TP.boot.$$removeUIHandler(aDocument, 'change');

        TP.boot.$$removeUIHandler(aDocument, 'transitionend');

        //  Remove a mutation signal source for mutations to this document
        TP.boot.$$removeMutationSource(aDocument);

        return;
    };

    //  ------------------------------------------------------------------------

    $$init = function() {

        /**
         * @name $$init
         * @synopsis Performs any startup initialization the user interface
         *     elements require. This might include both minor layout
         *     adjustments and connection of low-level event handlers as well
         *     as dynamic content generation.
         * @return {null}
         */

        var tWin;

        //  if the page itself defined an init() function then we'll call it
        try {
            if (typeof(self.init) === 'function') {
                init();
            }
        } catch (e) {
            if (typeof(self.init) === 'function') {
                tWin = $$findTIBET();
                tWin.console.log('ERROR in init(): ' + e.message);
            }
        }

        //  protect the codebase from inadvertent exits.

        //  Note that the way this code operates is browser dependent:
        //      On Mozilla and IE, this hook isn't actually installed on every
        //      window. It is only done once on the top-level window.
        //      The call placed here is for Webkit-based browsers (Safari and
        //      Chrome), which need to install an attribute on the 'body'
        //      element for every visible iframe window. That logic has been
        //      written to look for the same property on the top-level window as
        //      the Mozilla and IE handlers, thereby routing the logic to have
        //      the same effect as it does on those browsers.
        TP.windowInstallOnBeforeUnloadHook(window);

        return;
    };

    //  ------------------------------------------------------------------------
    //  TIBET Bridge
    //  ------------------------------------------------------------------------

    /*
    When TIBET isn't found the hook file will try to launch the application the
    containing file appears to be a part of, marking the current page's URI in
    the location so TIBET can route the home page to that location if possible.

    When TIBET is found, the canvas is initialized -- configured so that the
    page is a well-behaved participant in the application.
    */

    //  ------------------------------------------------------------------------

    TP.boot.autoBoot = function() {

        /**
         * @name autoBoot
         * @synopsis Attempts to boot the TIBET index.html file for the current
         *     file's application, setting the current location to a cookie as a
         *     parameter to override the typical home page.
         * @return {null}
         */

        var loc,
            ndx,
            dir,
            prefix,
            url;

        //  by default we want any page with a hook file to autoboot TIBET if it
        //  ends up in the top window due to a double-click, bookmark, link,
        //  etc. HOWEVER, if we see TP.boot.launch we're in a tibet_init file
        //  meaning we're not just a hook page but a launch page. In that case
        //  we'll wait for launch to be called instead of autobooting.
        if (window !== top || window.$$autoboot === false ||
            typeof TP.boot.launch === 'function') {
            return;
        }

        loc = decodeURI(TP.boot.getWindowLocation());

        //  if we can't locate the TIBET-INF (or equivalent) on the path then
        //  we're not going to be able to find the index.html page
        ndx = loc.indexOf('/TIBET-INF');
        if (ndx === -1) {
            ndx = loc.indexOf(TP.$$tibetinf);
            if (ndx === -1) {
                return;
            } else {
                dir = TP.$$tibetinf;
            }
        } else {
            dir = '/TIBET-INF';
        }

        //  build up a (H)ome url reference for index.html to reference as the
        //  desired target page
        prefix = loc.slice(0, ndx);
        loc = '~' + loc.replace(prefix, '');

        url = prefix + '/' + TP.$$bootpage;

        //  pretend this page never hit the history
        window.location.replace(url);

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.bootFromBookmark = function() {

        /**
         * @name bootFromBookmark
         * @synopsis Attempts to boot the TIBET index.html file for the current
         *     file's application, setting the current location to a cookie as a
         *     parameter to override the typical home page.
         * @return {null}
         */

        var loc,
            parts,
            url;

        //  by default we want any page with a hook file to autoboot TIBET if it
        //  ends up in the top window due to a double-click, bookmark, link,
        //  etc.
        if (window !== top || window.$$autoboot === false) {
            return;
        }

        loc = decodeURI(TP.boot.getWindowLocation());

        parts = loc.split('#');

        url = parts[0];

        //  pretend this page never hit the history
        window.location.replace(url);

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.initializeCanvas = function(aWindow) {

        /**
         * @name initializeCanvas
         * @synopsis Performs the operations necessary to get this canvas
         *     (window) integrated with TIBET and ready to use.
         * @description This function is invoked when TIBET is found and the
         *     boot process has been detected to have reached a stage where its
         *     possible to properly setup the page.
         * @param aWindow {Window} The window (canvas) to initialize.
         * @return {null}
         */

        var handlerFunc;

        //  if we are _in_ the TIBET window (boot and hook together) then we
        //  don't do this step...the codeframe doesn't get this processing
        if ($$findTIBET() === aWindow) {
            return;
        }

        //  on occasion this file will load before the codebase and when the
        //  phase two booting kicks in we need to ensure it gets connected to
        //  the codebase properly
        if (self.$$tibet == null) {
            if ($$findTIBET() == null) {
                return;
            }
        }

        //  make sure our references are around, otherwise we're out of sync
        if (!TP.core.Window ||
            !TP.core.Window.installLoadUnloadHooks) {
            //  wait for it...
            TP.boot.initCanvas = function() {

                //  requeue until we find what we need
                if (!TP.core.Window ||
                    !TP.core.Window.installLoadUnloadHooks) {
                    setTimeout(TP.boot.initCanvas, 250);

                    return;
                }

                //  once TP.core.Window is in place do the work
                TP.boot.initializeCanvas();
            };

            //  invoke our newly constructed initializer
            TP.boot.initCanvas();

            return;
        }

        //  We don't do the rest of this (installing load/unload hooks, style
        //  capture, instrumenting the window, etc.) until TIBET has loaded.
        if (TP.sys.hasLoaded() === false) {
            return;
        }

        //  If this canvas (window) has already been initialized, then we don't
        //  need (or want) to do the rest of this.
        if (TP.boot.$isElement(aWindow.document.body)) {
            if (aWindow.document.body.hasAttribute('tibet_canvasinitialized')) {
                return;
            }
        }

        TP.boot.installPatches(aWindow);

        //  Install any style-specific trap functions. Primarily this helps us
        //  avoid flickering when the style is processed by hiding the document
        //  body and then letting the kernel show it again. This also helps with
        //  mozilla errors that will show up when using non-standard style
        //  (style that would require the CSS processor). This does *not*
        //  actually do the style processing, it simply ensures that the style
        //  nodes are captured to avoid error messages from an overzealous and
        //  non-conforming Mozilla CSS parser.
        /*
        if ($$tibet &&
            ($$tibet['TP'] != null) &&
            $$tibet.TP.sys.shouldProcessCSS()) {
            TP.boot.$$captureStyle();
        };
        */

        //  install load/unload hook functions so TIBET will get the right
        //  event notifications
        TP.core.Window.installLoadUnloadHooks(aWindow);

        //  install basic TIBET feature set
        TP.core.Window.instrument(aWindow);

        //  Set up a load handler (have to use the add* mechanism here to avoid
        //  blowing away any 'onload' handler on the document's body)
        if (TP.boot.$$isIE()) {
            aWindow.attachEvent('onload',
                handlerFunc = function() {

                    //  First step is to clean up so we don't do this twice
                    //this.detachEvent('onload', handlerFunc);

                    //  make sure that any 'page-level' initialization is
                    //  performed. If the page has an 'init' function, this
                    //  function will call it.
                    $$init();
                });

            aWindow.attachEvent('onunload',
                handlerFunc = function() {

                    //  First step is to clean up so we don't do this twice
                    //this.detachEvent('onunload', handlerFunc);

                    //  Second, teardown the document and any special event
                    //  handlers that got installed on it.
                    TP.boot.$$documentTeardown(this.document);
                });
        } else {    //  firefox, safari, chrome, ...
            //  Mozilla 1.9+ will not fire onload for iframes that are being
            //  document.written (sigh...), but DOMContentLoaded is good enough
            //  since this script will be loaded last.
            if (TP.boot.$$isMoz()) {
                aWindow.document.addEventListener('DOMContentLoaded',
                    handlerFunc = function() {

                        //  first step is to clean up so we don't do this twice
                        //this.removeEventListener('DOMContentLoaded',
                        //                          handlerFunc,
                        //                          false);

                        //  make sure that any 'page-level' initialization is
                        //  performed. If the page has an 'init' function, this
                        //  function will call it.
                        $$init();
                    }, false);
            } else {
                //  We do the same for Webkit-based browsers
                aWindow.document.addEventListener('DOMContentLoaded',
                    handlerFunc = function() {

                        //  first step is to clean up so we don't do this twice
                        //this.removeEventListener('DOMContentLoaded',
                        //                          handlerFunc,
                        //                          false);

                        //  make sure that any 'page-level' initialization is
                        //  performed. If the page has an 'init' function, this
                        //  function will call it.
                        $$init();
                    }, false);
            }

            aWindow.addEventListener('unload',
                handlerFunc = function() {

                    //  First step is to clean up so we don't do this twice
                    //this.removeEventListener('unload',
                    //                          handlerFunc,
                    //                          false);

                    //  Second, teardown the document and any special event
                    //  handlers that got installed on it.
                    TP.boot.$$documentTeardown(this.document);
                }, false);
        }

        //  NOTE: special case here, when processing documents into the ui
        //  frame in particular we want to manage the title
        if (parent === top) {
            top.document.title = aWindow.document.title;
        }

        //  Set up the document's event handlers, etc.
        TP.boot.$$documentSetup(aWindow.document);

        //  Set a flag so that we don't do this again.
        if (TP.boot.$isElement(aWindow.document.body)) {
            aWindow.document.body.setAttribute(
                    'tibet_canvasinitialized', 'true');
        }

        return;
    };

    //  ========================================================================
    //  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
    //  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
    //  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE

    //  THIS HAS TO BE THE LAST THING IN THIS FILE -- DO NOT ADD CODE BELOW IT
    //  ========================================================================

    if (window.onerror.failedlaunch === true) {
        //  we're done. the script already blew up with a file launch issue.
        void(0);
    } else if ($$findTIBET() == null) {
        //  we're in a page containing tibet_hook.js, but we can't find TIBET,
        //  which means it hasn't booted yet...so let's try to fix that :)
        TP.boot.autoBoot();
    } else if (window.$$tibet == null) {
        //  if the previous call didn't set up the proper tibet reference we
        //  still won't be able to function, so we try again via "reboot"
        TP.boot.autoBoot();
    } else {

        //  Now, we might have been loaded 'first' (before TIBET loaded), but in
        //  a different frame. That means that our 'TP' isn't the same as the
        //  real 'TP' from the TIBET code frame. Fix that before we go any
        //  further.
        if (window.$$tibet && window.$$tibet.TP !== window.TP) {
            //  Use this syntax rather than simple assignment to 'lock' the
            //  value so that user scripts can't change it.
            Object.defineProperty(
                    self, 'TP', {value: window.$$tibet.TP, writable: false});
        } else {
            //  Lock the value that we got when the file was loaded.
            Object.defineProperty(
                    self, 'TP', {value: window.TP, writable: false});
        }

        if (TP.boot.getURLBookmark()) {
            TP.boot.bootFromBookmark();
        } else if (TP.sys.hasLoaded() === false &&
                    TP.sys.cfg('boot.twophase') === true) {
            //  found and mapped over the tibet window reference and it doesn't
            //  look like the system has finished booting phase two...

            //  two-phased booting means that we may well be in a UI page while
            //  the kernel is loading "underneath us" in the code frame. Since
            //  this is all happening asynchronously we want to avoid issues
            //  caused by assuming any functionality is in place before we
            //  initialize the canvas.

            //  the second issue is that we want pages to be able to trigger the
            //  second phase of the boot process when they represent a page that
            //  is a "phase two" page. "phase one" pages like most login_* pages
            //  don't trigger the app targets to load but the login_ok page in
            //  particular will define phasetwo as true.

            //  the trick is getting the sequencing right. essentially we may
            //  have placed the phase two page in place before or after the phase
            //  one components complete their load process. when we get there
            //  early we have to wait until the boot completes. and if it were
            //  to fail for any reason we have to eventually terminate our
            //  observation so that the browser doesn't sit there iterating
            //  until the end of time. if we arrive late then the main boot
            //  logic won't be active any longer and we'll have to "reawaken it"
            //  to get it to pick up with phase two.

            //  we're in a page that says we can move on to phase two processing
            if (window.$$phasetwo === true) {
                if (TP.sys.cfg('boot.phasetwo') === true) {
                    //  if the load process is already working through phase two
                    //  then we don't need to do anything more to ensure booting
                    //  and we can be pretty sure that no matter where things
                    //  are in the boot process we can start the initialization
                    //  loop
                    TP.boot.initializeCanvas(window);
                } else {
                    //  to deal with the fact that the 'tibet' target may be in
                    //  any stage of loading we'll create a function that either
                    //  of the two sides can invoke to finish things
                    TP.boot.bootPhaseTwo = function() {

                        //  make sure the canvas is set up while the rest of the
                        //  process runs to load the application code
                        TP.boot.initializeCanvas(window);

                        //  notify the main boot code logic that phase two
                        //  should be imported. we'll leave it up to that code
                        //  to do the real work :)
                        TP.boot.$$importPhaseTwo();

                        return;
                    };

                    //  if the boot is paused it's because we got here late, so
                    //  it's up to us to trigger the final stage
                    if (TP.boot.$$stage === 'import_paused') {
                        TP.boot.bootPhaseTwo();
                    }
                }
            } else {
                //  we must be a phase one page in a two-phase world. which
                //  means we might sit here forever waiting for the user to get
                //  authenticated or otherwise trigger a phase-two page. might
                //  as well initialize.
                TP.boot.initializeCanvas(window);
            }
        } else {    //  single phase or post-boot
            //  when booting in single-phase mode every page can potentially be
            //  initialized (although they may be removed once the home page for
            //  the application loads)

            //  since we know that all code will load in a single phase without
            //  any kind of user-dependent pause we can start up the
            //  initializeCanvas loop here
            TP.boot.initializeCanvas(window);
        }
    }

}  //  DO NOT DELETE!!!    End 'location =' trap 'else' clause.

}(this));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
