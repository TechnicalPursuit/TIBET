/* copyright added via build process. see copyright.js in TIBET kernel */

/**
 * @overview When you use TIBET you're using a shared library model with code
 *     stored in a separate code frame while your user interface is typically
 *     drawn in an independent UI frame. To connect the UI frame to the shared
 *     library code TIBET leverages this "hook file" in any top-level page.
 *
 *     You should place a reference to this file in the head of any full page
 *     that you will load into your UI frame directly. NOTE that this file isn't
 *     needed in content that will be used as part of a larger DOM structure.
 *     Only the outermost documents you load at the window level require this
 *     reference if they will be calling on TIBET code from within the page.
 */

/* jshint debug:true,
          eqnull:true,
          maxerr:999
*/
/* global TP:true,
          Document:false,
          CSSPrimitiveValue:false
*/

//  ----------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Bundled or Unbundled Support
//  ------------------------------------------------------------------------

//  For Safari only...
if (!self.Window) {
    /* eslint-disable no-undef */
    Window = self.constructor; /* jshint ignore:line */
    /* eslint-enable no-undef */
}

//  ------------------------------------------------------------------------

TP.boot.$isEvent = function(anObj) {

    /**
     * @method $isEvent
     * @summary Returns true if the object provided is an Event object.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is an Event object.
     */

    /* eslint-disable no-extra-parens */
    return (anObj != null &&
            anObj.clientX !== undefined &&
            anObj.clientY !== undefined);
    /* eslint-enable no-extra-parens */
};

//  ------------------------------------------------------------------------

TP.boot.$$isIE = function() {

    /**
     * @method $$isIE
     * @summary Returns true if the current browser looks like it's IE.
     * @returns {Boolean}
     */

    return (/Trident/).test(navigator.userAgent);
};

//  ------------------------------------------------------------------------

TP.boot.$$isMoz = function() {

    /**
     * @method $$isMoz
     * @summary Returns true if the current browser looks like it's a
     *     Mozilla-based browser.
     * @returns {Boolean}
     */

    //  Firefox at least will always show an rv: and Gecko in the string.
    //  The Gecko portion is cloned a lot, but not the rv: portion.
    return (/rv:.+?Gecko/).test(navigator.userAgent) && !TP.boot.$$isIE();
};

//  ------------------------------------------------------------------------

TP.boot.$$isWebkit = function() {

    /**
     * @method $$isWebkit
     * @summary Returns true if the current browser looks like it's a
     *     Webkit-based browser.
     * @returns {Boolean}
     */

    return (/Konqueror|AppleWebKit|KHTML/).test(navigator.userAgent);
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
     * @method $$computeDispatchOrigin
     * @summary Computes the likely origin for TP.boot.$$dispatch() when
     *     provided with an element and/or event object but not a string
     *     origin.
     * @summary TIBET uses string origins for actual signaling to allow
     *     more flexibility and control. This method will attempt to compute
     *     a string origin for an element or event when no string origin is
     *     provided.
     * @param {Element} orig The event origin.
     * @param {Element} elem The element the event originated from, if the
     *     event origin isn't an Element.
     * @param {Event} args The event object that generated the event. If
     *     orig or elem can't be used, use this object to try to get its
     *     'source element' or 'target'.
     * @returns {Element|String} Typically a string, but sometimes the
     *     element when no string value can be computed with certainty.
     */

    var tibetOrigin,
        origin;

    //  string origins are used without alteration so check that first
    if (typeof orig === 'string' && orig !== '') {
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
        //  empty
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
     * @method $$displaySignalData
     * @summary Provides a simple feedback mechanism during UI prototyping
     *     to ensure that the proper events are being thrown in response to
     *     UI interactions.
     * @summary During UI prototyping it can be useful to have visual
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
     * @returns {null}
     */

    try {
        if (origin == null || typeof origin === 'string') {
            window.status = 'origin: ' + origin + '::' +
                            origin +
                            ' signal: ' + signal;
        } else if (origin != null) {
            window.status = 'origin: ' + origin + '::' +
                            origin.getAttribute('id') +
                            ' signal: ' + signal;
        }
    } catch (e) {
        //  empty
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$$dispatch = function(orig, sig, elem, args, policy, display) {

    /**
     * @method $$dispatch
     * @summary Placeholder for TIBET's TP.dispatch action, which is
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
     * @returns {null}
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
        //  This seems to cause Mozilla to seize up
        if (!TP.boot.$$isMoz()) {
            args.stopPropagation();
        }
    }

    //  compute the TAP-style origin entry for this event to make sure we
    //  have all the right information to properly dispatch
    origin = TP.boot.$$computeDispatchOrigin(orig, elem, args);

    //  if the origin is a string then we'll check first for an
    //  origin-specific handler for the signal
    if (typeof origin === 'string') {
        oStr = origin.charAt(0).toUpperCase() + origin.slice(1);
        fName = '$handle' + oStr + signal;
        if (typeof self[fName] === 'function') {
            try {
                retval = self[fName](oStr, signal, elem, args, policy);
            } catch (e) {
                //  empty
            }

            return retval;
        }
    }

    //  next we try to find a signal-specific handler to run
    fName = '$handle' + signal;
    if (typeof self[fName] === 'function') {
        try {
            retval = self[fName](origin, signal, elem, args, policy);
        } catch (e) {
            //  empty
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
     * @method $raise
     * @summary Dispatches the exception as a signal, using the origin and
     *     argument data provided. TIBET exceptions are lightweight and can
     *     be 'handled' or proceed to throw a native Error.
     * @param {Object} anOrigin The origin signaled for this event. Can be a
     *     string to allow spoofing of element IDs etc.
     * @param {Object} anException The signal being triggered.
     * @param {Object} aPayload arguments for the signal.
     * @returns {null}
     */

    //  NOTE the context gets dropped here since the primitive version
    //  takes an element as the context
    return TP.boot.$$dispatch(anOrigin, anException, aPayload);
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

TP.boot.installPatches = function(aWindow) {

    var $$msg;

    if (TP.sys.cfg('log.hook') && TP.sys.cfg('boot.context') !== 'phantomjs') {
        $$msg = 'TIBET hook installing window patches on ' + aWindow.name;
        TP.boot.$stdout($$msg, TP.INFO);
    }

    //  For IE...
    if (TP.boot.$$isIE()) {

        //  If this slot doesn't already exist, install a getter
        if (!aWindow.document.$$name) {
            aWindow.Object.defineProperty(
                aWindow.document,
                '$$name',
                {
                    get: function() {
                        if (this.xmlVersion) {
                            return 'XMLDocument';
                        } else {
                            return 'HTMLDocument';
                        }
                    }
                });
        }

        aWindow.atob = function(aString) {
            /**
             * @method atob
             * @summary An implementation of the atob function found in
             *     Mozilla which takes a Base64-encoded ascii string and
             *     decodes it to binary form.
             * @param {String} aString The string to convert.
             * @returns {Object} A decoded String.
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

            if (typeof aString !== 'string') {
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
                /* eslint-disable no-extra-parens */
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
                /* eslint-enable no-extra-parens */
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

                if (target && target.nodeType !== undefined &&
                    target.nodeType !== Node.DOCUMENT_NODE) {
                    target = target.nodeType === Node.TEXT_NODE ?
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

                if (target && target.nodeType !== undefined &&
                    target.nodeType !== Node.DOCUMENT_NODE) {
                    target = target.nodeType === Node.TEXT_NODE ?
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

    } else if (TP.boot.$$isIE()) {

        aWindow.Object.defineProperty(
            aWindow.Event.prototype,
            'wheelDelta',
            {
                configurable: true,
                get: function() {

                    if (this.type === 'mousewheel') {
                        return this.detail / 120;
                    }
                }
            });
    }

    //  All browsers get a 'resolvedTarget' getter on their Event objects.
    aWindow.Object.defineProperty(
        aWindow.Event.prototype,
        'resolvedTarget',
        {
            configurable: true,
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
                    //  empty
                    //  Ignore errors. Events don't like being touched.
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
        aWindow.Object.defineProperty(
            aWindow.MozNamedAttrMap,
            '$$name',
            {get: function() {return 'NamedNodeMap'; }});
    }

    //  --------------------------------------------------------------------
    //  Set up Metadata
    //  --------------------------------------------------------------------

    TP.boot.$$setupMetadata(aWindow);

    if (TP.sys.cfg('log.hook') && TP.sys.cfg('boot.context') !== 'phantomjs') {
        $$msg = 'TIBET hook updated JavaScript metadata.';
        TP.boot.$stdout($$msg, TP.INFO);
    }

    //  --------------------------------------------------------------------
    //  getKeys Patch
    //  --------------------------------------------------------------------

    //  Set up 'getKeys' for as many native Objects as we know about

    //  Array's 'getKeys' is in the kernel

    //  Don't want the HTML Element keys to show up on every Element so we
    //  specifically put them on HTMLElement
    aWindow.HTMLElement.prototype.getKeys = function() {
        return TP.sys.$htmlelemkeys;
    };

    //  Don't want the HTML Document keys to show up on every Document
    //  (i.e. XML documents), so we specifically put them on HTMLDocument
    aWindow.HTMLDocument.prototype.getKeys = function() {
        return TP.sys.$htmldockeys;
    };

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

TP.windowIsInstrumented = function(aWindow) {

    /**
     * @method windowIsInstrumented
     * @summary Returns true if the receiving window still sees TIBET
     *     instrumentation.
     * @param {Window} aWindow The native window to test. For the hook file
     *     version this defaults to 'window'.
     * @returns {Boolean}
     */

    var win;

    win = aWindow != null ? aWindow : window;

    //  the things we'll use are the things we care about the most here
    /* eslint-disable no-extra-parens */
    return (win.$$instrumented === true && win.$$TIBET && win.TP);
    /* eslint-enable no-extra-parens */
};

//  ------------------------------------------------------------------------
//  EVENT HANDLER INSTALLATION
//  ------------------------------------------------------------------------

TP.boot.$$addUIHandler = function(anObject, eventName, handlerFunc) {

    /**
     * @method $$addUIHandler
     * @summary Adds a special 'UI' event handler to the object under the
     *     supplied event name. This handler is used to send low-level
     *     events to TIBET for further processing.
     * @param {Object} anObject The object that the event handler is to be
     *     installed on.
     * @param {String} eventName The name of the event that the handler will
     *     be installed for.
     * @param {Function} handlerFunc The handler function to use.
     * @returns {null}
     */

    var theEventName;

    theEventName = eventName;

    if (TP.boot.$$isMoz() && eventName === 'mousewheel') {
        theEventName = 'DOMMouseScroll';
    }

    anObject.addEventListener(theEventName, handlerFunc, true);

    //  Cache the handler function on the TP.boot object using the event
    //  name so that we can use it later when we remove the handler.
    TP.boot['$$' + theEventName + 'Handler'] = handlerFunc;

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$$removeUIHandler = function(anObject, eventName) {

    /**
     * @method TP.boot.$$removeUIHandler
     * @summary Removes the special 'UI' event handler that was installed
     *     on the object.
     * @param {Object} anObject The object that the event handler was
     *     installed on.
     * @param {String} eventName The name of the event that the handler was
     *     installed for.
     * @returns {null}
     */

    var handlerFunc,
        theEventName;

    theEventName = eventName;

    //  Make sure that we can find a valid 'special UI handler'. This was
    //  cached on a slot on the TP.boot object when we registered the
    //  handler via the TP.boot.$$addUIHandler() function above.
    handlerFunc = TP.boot['$$' + theEventName + 'Handler'];

    if (TP.boot.$notValid(handlerFunc)) {
        return;
    }

    if (TP.boot.$$isMoz() && eventName === 'mousewheel') {
        theEventName = 'DOMMouseScroll';
    }

    anObject.removeEventListener(theEventName, handlerFunc, true);

    //  Clear the slot on the TP.boot object, so that we don't leave little
    //  bits, like unused Functions, around.
    TP.boot['$$' + theEventName + 'Handler'] = null;

    return;
};

//  ------------------------------------------------------------------------
//  DOM MUTATION HOOK
//  ------------------------------------------------------------------------

TP.boot.$$addMutationSource = function(aDocument) {
    TP.core.MutationSignalSource.watchDocument(aDocument);
};

//  ------------------------------------------------------------------------

TP.boot.$$removeMutationSource = function(aDocument) {
    TP.core.MutationSignalSource.unwatchDocument(aDocument);
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

TP.boot.$$documentSetup = function(aDocument) {

    /**
     * @method $$documentSetup
     * @summary Sets up the supplied Document with event handlers that will
     *     cause elements in the page to have advanced event management.
     *     This includes the use of enhanced CSS constructs as managed by
     *     TIBET.
     * @param {HTMLDocument} aDocument The HTML document to enhance with
     *     advanced event management event handlers.
     * @returns {null}
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

    TP.boot.$$addUIHandler(aDocument,
                            'cut',
                            TP.$$handleCut);
    TP.boot.$$addUIHandler(aDocument,
                            'copy',
                            TP.$$handleCopy);
    TP.boot.$$addUIHandler(aDocument,
                            'paste',
                            TP.$$handlePaste);

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
                            'load',
                            TP.$$handleLoad);

    TP.boot.$$addUIHandler(aDocument,
                            'change',
                            TP.$$handleChange);

    TP.boot.$$addUIHandler(aDocument,
                            'transitionend',
                            TP.$$handleTransitionEnd);

    TP.boot.$$addUIHandler(aDocument,
                            'scroll',
                            TP.$$handleScroll);

    TP.boot.$$addUIHandler(aDocument,
                            'submit',
                            TP.$$handleSubmit);
    TP.boot.$$addUIHandler(aDocument,
                            'reset',
                            TP.$$handleReset);

    //  Add a mutation signal source for mutations to this document
    TP.boot.$$addMutationSource(aDocument);

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$$documentTeardown = function(aDocument) {

    /**
     * @method $$documentTeardown
     * @summary Tears down the supplied Document from the event handlers
     *     that caused elements in the page to have advanced event
     *     management. This includes the use of enhanced CSS constructs as
     *     managed by TIBET.
     * @param {HTMLDocument} aDocument The HTML document to tear down the
     *     advanced event management event handlers.
     * @returns {null}
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

    TP.boot.$$removeUIHandler(aDocument, 'load');

    TP.boot.$$removeUIHandler(aDocument, 'change');

    TP.boot.$$removeUIHandler(aDocument, 'transitionend');

    TP.boot.$$removeUIHandler(aDocument, 'scroll');

    TP.boot.$$removeUIHandler(aDocument, 'submit');
    TP.boot.$$removeUIHandler(aDocument, 'reset');

    //  Remove a mutation signal source for mutations to this document
    TP.boot.$$removeMutationSource(aDocument);

    return;
};

//  ------------------------------------------------------------------------
//  TIBET Bridge
//  ------------------------------------------------------------------------

/*
When TIBET is found, the canvas is initialized -- configured so that the
page is a well-behaved participant in the application.
*/

//  ------------------------------------------------------------------------

TP.boot.initializeCanvas = function(aWindow) {

    /**
     * @method initializeCanvas
     * @summary Performs the operations necessary to get this canvas
     *     (window) integrated with TIBET and ready to use.
     * @summary This function is invoked when TIBET is found and the
     *     boot process has been detected to have reached a stage where its
     *     possible to properly setup the page.
     * @returns {null}
     */

    var win;

    if (TP.boot.$isWindow(aWindow)) {
        //  Should be a window.
        win = aWindow;
    } else if (TP.boot.$isElement(aWindow)) {
        //  In case it's an IFRAME
        win = aWindow.contentWindow;
    }

    if (TP.boot.$isWindow(win)) {
        TP.boot.initializeCanvasWindow(win);
        TP.boot.initializeCanvasDocument(win.document);
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.initializeCanvasDocument = function(aDocument) {

    var doc,
        win,
        name,
        $$msg;

    doc = aDocument;
    win = TP.boot.$documentGetWindow(doc);
    name = TP.boot.$isValid(win) ? win.name : '';

    //  Skip doing this twice.
    if (doc && doc.body && TP.boot.$isElement(doc.body)) {

        //  NB: hasAttributeNS, unlike setAttributeNS below, only wants the
        //  local attribute name.
        if (doc.body.hasAttributeNS(
                'http://www.technicalpursuit.com/1999/tibet',
                'canvasinitialized')) {

            if (TP.sys.cfg('log.hook') &&
                TP.sys.cfg('boot.context') !== 'phantomjs') {

                $$msg = 'TIBET hook skipping re-instrumentation of ' +
                        name + ' document';
                TP.boot.$stdout($$msg, TP.TRACE);
            }
            return;
        }
    }

    //  NOTE: special case here, when processing documents into the ui
    //  frame in particular we want to manage the title
    if (doc.parent === top) {
        top.document.title = doc.title;
    }

    //  Set up the document's event handlers, etc.
    TP.boot.$$documentSetup(doc);

    //  Set a flag so that we don't do this again.
    if (doc && doc.body && TP.boot.$isElement(doc.body)) {
        doc.body.setAttributeNS(
                'http://www.technicalpursuit.com/1999/tibet',
                'tibet:canvasinitialized',
                'true');
    }
};

//  ------------------------------------------------------------------------

TP.boot.initializeCanvasWindow = function(aWindow) {

    var win,
        $$msg,
        unloadedHandler;

    win = aWindow;

    if (win.$$hooked === true) {
        if (TP.sys.cfg('log.hook') &&
                TP.sys.cfg('boot.context') !== 'phantomjs') {
            $$msg = 'TIBET hook skipping re-instrumentation of window ' +
                    win.name;
            TP.boot.$stdout($$msg, TP.TRACE);
        }

        return;
    }

    //  window stuff here...

    TP.boot.installPatches(win);

    //  install load/unload hook functions so TIBET will get the right
    //  event notifications
    TP.core.Window.installLoadUnloadHooks(win);

    //  install basic TIBET feature set
    TP.core.Window.instrument(win);

    //  Install a popstate handler to catch changes via history API.
    win.addEventListener('popstate', function(evt) {
        TP.core.History.onpopstate(evt);
    }, false);

    win.addEventListener('unload',
        unloadedHandler = function() {

            win.$$hooked = false;

            //  First step is to clean up so we don't do this twice
            win.removeEventListener('unload',
                                      unloadedHandler,
                                      false);

            //  Second, teardown the document and any special event
            //  handlers that got installed on it.
            TP.boot.$$documentTeardown(win.document);
        }, false);

    win.$$hooked = true;
};

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
