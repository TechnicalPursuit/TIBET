//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @
 */

//  ========================================================================
//  TP.core.Device
//  ========================================================================

TP.sig.SignalSource.defineSubtype('core.Device');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  the forwarding function used when we need to pass events to the main
//  notification center.
TP.core.Device.Type.defineConstant('REDIRECTOR',
    function(aSignal) {

        var normalizedEvent,
            targetElem;

        normalizedEvent = aSignal.getEvent();

        if (TP.isElement(targetElem =
                            TP.eventGetResolvedTarget(normalizedEvent))) {
            //  NOTE that device events are natively DOM events so we fire
            //  with a DOM_FIRING policy here
            aSignal.fire(
                TP.elementGetEventOrigins(targetElem, normalizedEvent),
                normalizedEvent,
                TP.DOM_FIRING);
        }
    });

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var signals,
        len,
        map,
        i,
        signal,
        count,
        handler,
        dict,
        arr;

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();

    //  If there's a policy or the origin is specific rather than the receiver's
    //  device name then we just want to set up a "redirect" handler that pushes
    //  the signal to the notification system where things like policy and
    //  origin targeting can be processed.

    /* eslint-disable no-extra-parens */
    if (TP.notEmpty(aPolicy) ||
        (anOrigin !== this && anOrigin !== this.getName())) {
    /* eslint-enable no-extra-parens */

        //  we have to track observe/ignore stats more closely when we set up
        //  redirections since each ignore says to remove the redirector, but we
        //  need to keep at least one as long as we've got more observes than we
        //  do ignores
        map = this.get('redirections');

        for (i = 0; i < len; i++) {
            signal = signals.at(i).getSignalName();
            count = map.at(signal);

            if (TP.isNumber(count) && count > 1) {
                //  increment the count
                map.atPut(signal, count + 1);
            } else {
                map.atPut(signal, 1);
            }
        }

        handler = this.REDIRECTOR;
    } else {
        handler = aHandler;
    }

    //  invalid handler, no response can happen
    if (TP.notValid(handler)) {
        this.raise('TP.sig.InvalidHandler');

        return false;
    }

    dict = this.get('observers');

    for (i = 0; i < len; i++) {
        signal = signals.at(i).getSignalName();

        //  Signal paths are signals with a '__' separation. We use a subtype
        //  specific method to process those. Keyboard shortcuts are the
        //  typically use of this syntax.
        if (/__/.test(signal)) {
            this.addShortcutObserver(signal, handler);
        } else {
            if (TP.notValid(arr = dict.at(signal))) {
                arr = TP.ac();
                dict.atPut(signal, arr);
            }

            arr.push(handler);

            //  unfortunately there's a bit of potential overhead here since we
            //  need to unique for each possible signal name in the list
            arr.unique();
        }
    }

    //  if the handler we registered was not the original one then we swapped it
    //  out for the redirector and we want the notification center to go ahead
    //  and register it.

    /* eslint-disable no-extra-parens */
    return (handler !== aHandler);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('addShortcutObserver',
function(aSignal, aHandler) {

    /**
     * @method addShortcutObserver
     * @summary Adds a local signal observation for a "signal path", which is
     *     effectively a "gesture". Keyboard shortcuts are the primary example
     *     of signal paths. The default implementation simply returns.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @returns {Object[]} The handler array with the new observer added.
     */

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('getDOMSignalName',
function(normalizedEvent) {

    /**
     * @method getDOMSignalName
     * @summary Returns the DOM signal name for a particular event.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {String} The key event DOM signal name.
     */

    return TP.DOM_SIGNAL_TYPE_MAP.at(TP.eventGetType(normalizedEvent));
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('invokeObservers',
function(singletonName, normalizedEvent, aSignal) {

    /**
     * @method invokeObservers
     * @summary Runs the event handlers for any registered observers.
     * @description Each native event type has a singleton TIBET signal instance
     *     registered with the device type. This singleton is acquired, updated,
     *     and then passed to each handler for processing. The normalizedEvent
     *     becomes the payload/native event for the signal and is thereby
     *     available to each handler for use.
     * @param {String} singletonName The attribute name used to acquire a
     *     singleton signal instance for the invocation.
     * @param {Event} normalizedEvent A normalized (augmented) native event
     *     object conforming to a set of common and W3-compliant methods.
     * @param {TP.sig.Signal} aSignal Optional signal to use rather than the
     *     singleton/event pair.
     * @returns {TP.sig.Signal} The TIBET signal instance used during
     *     notification.
     */

    TP.override();

    return aSignal;
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var signals,
        len,
        map,
        i,
        signal,
        count,
        handler,
        dict,
        arr;

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();

    /* eslint-disable no-extra-parens */
    if (TP.notEmpty(aPolicy) ||
        (anOrigin !== this && anOrigin !== this.getName())) {
    /* eslint-enable no-extra-parens */

        map = this.get('redirections');

        for (i = 0; i < len; i++) {
            signal = signals.at(i).getSignalName();
            count = map.at(signal);

            if (TP.isNumber(count) && count > 1) {
                //  decrement the count
                map.atPut(signal, count - 1);
            } else {
                map.atPut(signal, 0);
            }
        }

        handler = this.REDIRECTOR;
    } else {
        handler = aHandler;
    }

    dict = this.get('observers');
    for (i = 0; i < len; i++) {
        signal = signals.at(i).getSignalName();

        //  Signal paths are signals with a '__' separation. We use a
        //  subtype specific method to process those. Keyboard shortcuts are
        //  the typically use of this syntax.
        if (/__/.test(signal)) {
            this.removeShortcutObserver(signal, handler);
        } else {
            if (TP.isArray(arr = dict.at(signal))) {
                //  NOTE: We use an *identical* compare here - otherwise,
                //  the system wanders all over trying to compute equality
                //  values for the handlers.
                arr.remove(handler, TP.IDENTITY);
                if (TP.isEmpty(arr)) {
                    dict.removeKey(signal);
                }
            }
        }
    }

    //  If we've changed the handler to the redirector we need to make sure
    //  the notification center removes it as well.

    /* eslint-disable no-extra-parens */
    return (handler !== aHandler);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('removeShortcutObserver',
function(aSignal, aHandler) {

    /**
     * @method removeShortcutObserver
     * @summary Removes a local signal observation for a "signal path", which
     *     is effectively a "gesture". Keyboard shortcuts are the primary
     *     example of signal paths. The default implementation simply returns.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @returns {Number} The number of handlers that were removed.
     */

    return 0;
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('signalObservers',
function(anOrigin, aSignal, aPayload, aPolicy, aType, isCancelable,
         isBubbling) {

    /**
     * @method signalObservers
     * @summary Signals a local signal observation which is roughly like a DOM
     *     element throwing an event. The observer is typically the handler
     *     provided to a signal() call while the signal is a signal or string
     *     which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be constructed.
     *     Defaults to TP.sig.Signal.
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to signal the signal, false otherwise.
     */

    var signals,
        len,
        i,
        signame,
        signal,
        typename,
        type;

    //  have to recast this into something we can pass to the invoke
    //  observers call, or we have to duplicate that logic when provided
    //  with a signal that somehow didn't originate from the lower-level
    //  device traps...perhaps it's a synthetic key/mouse event.

    if (anOrigin !== this && anOrigin !== this.getName()) {
        return true;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();

    for (i = 0; i < len; i++) {
        signal = signals.at(i);
        if (!TP.isKindOf(signal, TP.sig.Signal)) {
            if (TP.regex.KEY_EVENT.test(signal)) {
                if (signal.indexOf('_Up') !== TP.NOT_FOUND) {
                    typename = 'TP.sig.DOMKeyUp';
                } else if (signal.indexOf('_Press') !== TP.NOT_FOUND) {
                    typename = 'TP.sig.DOMKeyPress';
                } else {
                    typename = 'TP.sig.DOMKeyDown';
                }
            } else {
                typename = signal;
            }

            //  might be a type if the signal is already real
            type = TP.isTypeName(typename) ?
                    TP.sys.getTypeByName(typename) :
                    TP.sys.getTypeByName(typename);

            if (TP.notValid(type)) {
                this.raise('TP.sig.InvalidType',
                            'Unable to find signal type: ' + typename);

                return false;
            }

            signame = signal;

            signal = type.construct(aPayload);
            if (TP.notValid(signal)) {
                this.raise(
                    'TP.sig.InvalidSignal',
                    'Unable to construct signal instance: ' + signame);

                return false;
            }

            signal.setSignalName(signame);
        }

        this.invokeObservers(null, aPayload, signal);
    }

    return false;
});

//  ========================================================================
//  TP.core.Keyboard
//  ========================================================================

TP.core.Device.defineSubtype('Keyboard');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  overall hash of observations made locally to a specific device
TP.core.Keyboard.Type.defineAttribute('observers', TP.hc());

//  map of signals which we've placed redirectors for
TP.core.Keyboard.Type.defineAttribute('redirections', TP.hc());

//  last event for each of down, press, and up events
TP.core.Keyboard.Type.defineAttribute('lastDown');
TP.core.Keyboard.Type.defineAttribute('lastPress');
TP.core.Keyboard.Type.defineAttribute('lastUp');

//  encached instances of prebuilt signals
TP.core.Keyboard.Type.defineAttribute('keyup');
TP.core.Keyboard.Type.defineAttribute('keydown');
TP.core.Keyboard.Type.defineAttribute('keypress');

//  container for a singleton TP.sig.DOMModifierKeyChange signal used for
//  notification of a change in one or more modifier keys
TP.core.Keyboard.Type.defineAttribute('modifierkeychange');

//  current state of the modifier keys (alt, ctrl, meta/command, and shift)
TP.core.Keyboard.Type.defineAttribute('altDown', false);
TP.core.Keyboard.Type.defineAttribute('ctrlDown', false);
TP.core.Keyboard.Type.defineAttribute('metaDown', false);
TP.core.Keyboard.Type.defineAttribute('shiftDown', false);

//  the current keyboard subtype the user has configured
TP.core.Keyboard.Type.defineAttribute('currentKeyboard');

//  the keyboard's XML map URI, whose contentNode is the actual map
TP.core.Keyboard.Type.defineAttribute('mapuri');

//  a common cache for the current keyboard's XML map
TP.core.Keyboard.Type.defineAttribute('mapxml');

//  a timer used in certain situations to wait for press before signaling
TP.core.Keyboard.Type.defineAttribute('downTimer');

//  a timer used when the keyboard is processing keyboard shortcuts.
TP.core.Keyboard.Type.defineAttribute('shortcutsTimer');

//  a map of keyboard shortcuts which have been observed via a__b syntax
TP.core.Keyboard.Type.defineAttribute('shortcuts', TP.hc());
TP.core.Keyboard.Type.defineAttribute('shortcutIndex', TP.core.Keyboard.shortcuts);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var name,
        type;

    //  construct a template instance for signals we care about
    this.$set('keyup',
        TP.sys.getTypeByName('TP.sig.DOMKeyUp').construct(null, true));
    this.$set('keydown',
        TP.sys.getTypeByName('TP.sig.DOMKeyDown').construct(null, true));
    this.$set('keypress',
        TP.sys.getTypeByName('TP.sig.DOMKeyPress').construct(null, true));
    this.$set('modifierkeychange',
        TP.sys.getTypeByName('TP.sig.DOMModifierKeyChange').construct(null,
                                                                true));

    //  load the current keyboard type and its associated keymap
    name = TP.ifInvalid(TP.sys.cfg('tibet.keyboard'),
                        'TP.core.USAscii101Keyboard');

    type = TP.sys.getTypeByName(name) ||
            TP.sys.getTypeByName('TP.core.USAscii101Keyboard');

    if (TP.notValid(type)) {
        TP.ifError() ?
                TP.error('Unable to install keyboard type: ' + name) : 0;

        return;
    }

    //  configure the initial keyboard (and load the initial keymap)
    this.setCurrentKeyboard(type);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('addShortcutObserver',
function(aSignal, aHandler) {

    /**
     * @method addShortcutObserver
     * @summary Adds a local signal observation for a "signal path", which is
     *     effectively a "gesture".
     * @description Keyboard shortcuts are stored as a nested set of hashes
     *     where each hash contains the name of the overall shortcut signal, an
     *     optional hash of shortcuts which extend the current one, and an
     *     optional array of handler objects/functions (observers).
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @returns {Object[]} The handler array with the new observer added.
     */

    var shortcutData,
        handlers;

    shortcutData = this.getShortcutData(aSignal, true);
    if (TP.notValid(handlers = shortcutData.at('handlers'))) {
        handlers = TP.ac();
        shortcutData.atPut('handlers', handlers);
    }

    handlers.push(aHandler);
    handlers.unique();

    return handlers;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('resetEventData',
function(filterWindow) {

    /**
     * @method resetEventData
     * @summary Resets any event data cached by the receiver. It is important
     *     to call this when the GUI is flushed between page refreshes to avoid
     *     having obsolete references to old DOM structures.
     * @param {Window} filterWindow The window to filter cached events by. If
     *     the event occurred in this window, it will be cleared.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    var evtTestFunc,
        sigTestFunc;

    evtTestFunc = function(sigName) {

        var event;

        event = this.get(sigName);

        if (TP.isEvent(event) &&
            TP.eventGetWindow(event) === filterWindow) {
            return true;
        }

        return false;
    }.bind(this);

    sigTestFunc = function(sigName) {

        var signal;

        signal = this.get(sigName);

        if (TP.isValid(signal) &&
            TP.isValid(signal.getPayload()) &&
            TP.unwrap(signal.getWindow()) === filterWindow) {
            return true;
        }

        return false;
    }.bind(this);

    if (evtTestFunc('lastDown')) {
        this.set('lastDown', null);
    }

    if (evtTestFunc('lastPress')) {
        this.set('lastPress', null);
    }

    if (evtTestFunc('lastUp')) {
        this.set('lastUp', null);
    }

    if (sigTestFunc('keyup')) {
        this.get('keyup').setEvent(null);
    }

    if (sigTestFunc('keydown')) {
        this.get('keydown').setEvent(null);
    }

    if (sigTestFunc('keypress')) {
        this.get('keypress').setEvent(null);
    }

    if (sigTestFunc('modifierkeychange')) {
        this.get('modifierkeychange').setEvent(null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getShortcutData',
function(aSignal, shouldBuild) {

    /**
     * @method getShortcutData
     * @summary Returns the hash used to store shortcut information for a
     *     specific signal path.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Boolean} shouldBuild
     * @returns {TP.core.Hash|undefined} The shortcut data.
     */

    var shortcuts,

        path,
        name,
        parts,

        len,
        i,
        part,

        dict,
        subS;

    /*
        shortcuts = {
            a:
            {
                h = [...],
                s =
                {
                    b:
                    {
                        h = [...],
                        s =
                        {
                            c:
                            {
                                h = [...],
                                n = 'a__b__c'
                            }
                        }
                        n = 'a__b'
                    }
                }
                n = 'a'
            }
        }
    */

    shortcuts = this.get('shortcuts');

    path = '';
    name = aSignal.getSignalName();
    parts = name.split('__');

    len = parts.getSize();
    for (i = 0; i < len; i++) {
        part = parts.at(i);

        path = TP.isEmpty(path) ? part : path + '__' + part;
        dict = shortcuts.at(part);

        if (TP.notValid(dict)) {
            if (TP.notTrue(shouldBuild)) {
                return;
            }

            dict = TP.hc();
            subS = TP.hc();

            dict.atPut('shortcuts', subS);
            dict.atPut('name', path);
            dict.atPut('handlers', TP.ac());

            shortcuts.atPut(part, dict);
        }

        shortcuts = dict.at('shortcuts');
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('loadKeymap',
function() {

    /**
     * @method loadKeymap
     * @summary Loads the XML keyboard map for the receiving keyboard type.
     * @exception TP.sig.InvalidKeymap When the XML keyboard map file can't be
     *     loaded.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    var req,
        response,
        fname,
        path,

        url,
        resp,
        xml;

    req = TP.hc('async', false);

    //  Note that we expand the paths here first before creating a URI. In
    //  this way, all of the 'metadata' URIs are uniformly concrete URIs
    //  instead of TIBET URIs.

    //  the local file name is the type name
    fname = this.getName();

    //  look for a config parameter mapping the keyboard away from ~lib_dat
    path = TP.sys.cfg(fname + '.xml');
    if (!path) {
        path = TP.uriExpandPath('~lib_dat/' + fname + '.xml');
    }

    url = TP.uc(path);
    response = url.getContent();
    if (TP.isValid(response)) {
        xml = response.getData().getNativeNode();
    }

    if (!xml) {
        resp = url.getNativeNode(req);
        if (TP.notValid(xml = resp.get('result'))) {
            return this.raise('TP.sig.InvalidKeymap');
        }
    }

    this.$set('mapuri', url);

    //  cache the XML for speed in other lookups
    TP.core.Keyboard.$set('mapxml', xml);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getCurrentKeyboard',
function() {

    /**
     * @method getCurrentKeyboard
     * @summary Returns the currently active keyboard instance used to perform
     *     all key-event related lookups and processing.
     * @returns {TP.core.Keyboard} The current keyboard instance.
     */

    return TP.core.Keyboard.$get('currentKeyboard');
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('get',
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value for attributeName. TP.core.Keyboard subtypes
     *     look first on themselves and then look to the root TP.core.Keyboard
     *     type for responses to this method.
     * @param {String} attributeName The attribute name to look up.
     * @returns {Object} The attribute value.
     */

    var value;

    //  look locally first using the standard lookup mechanisms (note that
    //  we do *not* callNextMethod) here because of performance reasons.
    value = this.$get(attributeName);

    //  check the root TP.core.Keyboard type in case it's a 'shared'
    //  variable
    if (TP.notValid(value) && this !== TP.core.Keyboard) {
        value = TP.core.Keyboard.get(attributeName);
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('invokeObservers',
function(singletonName, normalizedEvent, aSignal) {

    /**
     * @method invokeObservers
     * @summary Runs the event handlers for any registered observers.
     * @description Each native event type has a singleton TIBET signal instance
     *     registered with the device type. This singleton is acquired, updated,
     *     and then passed to each handler for processing. The normalizedEvent
     *     becomes the payload/native event for the signal and is thereby
     *     available to each handler for use.
     * @param {String} singletonName The attribute name used to acquire a
     *     singleton signal instance for the invocation.
     * @param {Event} normalizedEvent A normalized (augmented) native event
     *     object conforming to a set of common and W3-compliant methods.
     * @param {TP.sig.Signal} aSignal Optional signal to use rather than the
     *     singleton/event pair.
     * @returns {TP.sig.Signal|undefined} The signal that was actually
     *     triggered.
     */

    var targetElem,

        fname,
        elemType,

        signal,
        redirector,

        dict,

        signames,
        len,
        i,

        logInfo,

        handlers,

        handlersLen,
        j,

        handler,
        signame,

        matchedShortcutSegment,
        shortcutData,
        shortcutName,
        shortcutSig,
        shortcuts,

        shouldClearTimer,
        timer;

    if (!TP.sys.hasInitialized()) {
        return;
    }

    //  Sometimes this method is invoked for a synthetic event (like updating
    //  the modifier keys or a TIBET drag event). The normalized event object
    //  will have the real platform event in it (i.e. keydown) which should
    //  *not* be dispatched to the on* call in the case of a synthetic
    //  event.
    //  Therefore, we check here to make sure that the singleton name matches
    //  the real event name before calling on*
    if (singletonName === TP.eventGetType(normalizedEvent)) {

        if (TP.isElement(targetElem =
                            TP.eventGetResolvedTarget(normalizedEvent))) {
            fname = 'on' + TP.eventGetType(normalizedEvent);

            elemType = TP.wrap(targetElem).getType();

            //  Message the type for the element that is 'responsible' for
            //  this event. It's native control sent this event and we need
            //  to let the type know about it.
            if (TP.canInvoke(elemType, fname)) {
                elemType[fname](targetElem, normalizedEvent);
            }

            //  If the native event was prevented, then we should just bail out
            //  here.
            //  NB: 'defaultPrevented' is a DOM Level 3 property, which seems to
            //  be well supported on TIBET's target browser environments.
            if (normalizedEvent.defaultPrevented === true) {
                return;
            }
        }
    }

    //  when we're provided with a signal we don't need to build one.
    signal = aSignal;
    if (TP.notValid(signal)) {
        //  build up a true signal from our template instance
        if (TP.notValid(signal = this.get(singletonName))) {
            TP.ifWarn() ?
                TP.warn('Event singleton not found for: ' + singletonName) : 0;
            return;
        }

        //  Make sure to recycle the signal instance to clear any previous
        //  state.
        signal.recycle();

        //  let the signal type manage updates on signal naming etc through
        //  the setEvent functions they can optionally implement.
        signal.setEvent(normalizedEvent);

        //  when we reuse singleton we need to initialize origin to the resolved
        //  target
        signal.set('origin', signal.getResolvedTarget());
    }

    //  capture the information we'll need to see about redirections
    redirector = this.REDIRECTOR;

    dict = this.get('observers');

    signames = signal.getSignalNames();

    matchedShortcutSegment = false;
    shouldClearTimer = false;

    len = signames.getSize();
    for (i = 0; i < len; i++) {

        signame = signames.at(i);

        //  Set the signal name to the currently processing signal name since
        //  key signals have a variety of signal names (virtual, Unicode, type
        //  names).
        signal.setSignalName(signame);

        if (TP.sys.shouldLogKeys() && /DOMKey/.test(signame)) {

            logInfo = TP.hc(
                'target', TP.isValid(normalizedEvent.$$target) ?
                            TP.id(normalizedEvent.$$target) :
                            TP.id(normalizedEvent.target),
                'relatedTarget',
                            TP.isValid(normalizedEvent.$$relatedTarget) ?
                            TP.id(normalizedEvent.$$relatedTarget) :
                            TP.id(normalizedEvent.relatedTarget),
                'resolvedTarget',
                            TP.isValid(normalizedEvent.$$_resolvedTarget) ?
                            TP.id(normalizedEvent.$$_resolvedTarget) :
                            TP.id(normalizedEvent.resolvedTarget),
                'type', TP.isValid(normalizedEvent.$$type) ?
                            normalizedEvent.$$type :
                            normalizedEvent.type,
                'timestamp', TP.isValid(normalizedEvent.$$timestamp) ?
                            normalizedEvent.$$timestamp :
                            normalizedEvent.timestamp,
                'view', TP.isValid(normalizedEvent.$$view) ?
                            normalizedEvent.$$view :
                            normalizedEvent.view,

                'keyCode', TP.isValid(normalizedEvent.keyCode) ?
                                        normalizedEvent.keyCode : '',
                //  NB: We report $$keyCode separately here - it's normalized by
                //  TIBET
                '$$keyCode', TP.isValid(normalizedEvent.$$keyCode) ?
                                        normalizedEvent.$$keyCode : '',
                'charCode', TP.isValid(normalizedEvent.charCode) ?
                                        normalizedEvent.charCode : '',
                'unicode', TP.isValid(normalizedEvent.$unicodeCharCode) ?
                                        normalizedEvent.$unicodeCharCode : '',
                'which', TP.isValid(normalizedEvent.which) ?
                                        normalizedEvent.which : '',

                'shift', normalizedEvent.shiftKey,
                'alt', normalizedEvent.altKey,
                'ctrl', normalizedEvent.ctrlKey,
                'meta', normalizedEvent.metaKey,

                'low_level_signame', singletonName,
                'high_level_signame', signame,
                'specific_signame', this.getDOMSignalName(normalizedEvent),

                'keyname', this.getVirtualKeyName(normalizedEvent),
                'special', TP.isValid(normalizedEvent.$special) ?
                            normalizedEvent.$special : false
                );

            TP.sys.logKey(logInfo, null);
        }

        //  Look for keyboard shortcut. As we see each key signal we look in
        //  the current shortcut hash for that signal. If we find one we check
        //  for a non-hash value (indicating we're complete and the shortcut
        //  should fire) or another hash (indicating more keys to follow). A
        //  value of undefined means this isn't a keyboard shortcut sequence.
        if (TP.isValid(shortcutData = this.get('shortcutIndex').at(signame))) {
            /*
                shortcuts = {
                    a:
                    {
                        h = [...],
                        s =
                        {
                            b:
                            {
                                h = [...],
                                s =
                                {
                                    c:
                                    {
                                        h = [...],
                                        n = 'a__b__c'
                                    }
                                }
                                n = 'a__b'
                            }
                        }
                        n = 'a'
                    }
                }
            */

            //  Each shortcut ends in a hash with two optional keys, an array
            //  of handlers and a hash of child shortcuts. If we're at that end
            //  hash, that means we've 'satisfied' a sequence and it's time to
            //  fire it.
            if (TP.notEmpty(handlers = shortcutData.at('handlers'))) {

                shortcutName = shortcutData.at('name');
                handlersLen = handlers.getSize();

                if (handlersLen > 0) {
                    shortcutSig = signal.getType().construct(
                                                    signal.getPayload());
                    shortcutSig.setSignalName(shortcutName);
                    shortcutSig.setOrigin(signal.getOrigin());
                }

                for (j = 0; j < handlersLen; j++) {
                    if (shortcutSig.shouldStop()) {
                        break;
                    }

                    handler = handlers.at(j);

                    try {
                        TP.handle(handler, shortcutSig);
                    } catch (e) {
                        TP.raise(this, 'TP.sig.HandlerException',
                                    TP.ec(e));
                    }
                }

                shouldClearTimer = true;

                //  Reset to the top-most hash since we just fired a sequence
                this.set('shortcutIndex', this.get('shortcuts'));
            } else if (TP.notEmpty(shortcuts = shortcutData.at('shortcuts'))) {

                matchedShortcutSegment = true;

                /* eslint-disable no-loop-func */
                TP.core.Keyboard.$set('shortcutsTimer',
                    setTimeout(
                        function() {

                            //  clear so press/up don't get confused and try to
                            //  process their timer-specific logic
                            TP.core.Keyboard.$set('shortcutsTimer', null);

                            //  Reset to the top-most hash because we couldn't
                            //  complete a shortcut in the allotted amount of
                            //  time.
                            this.set('shortcutIndex', this.get('shortcuts'));
                        }.bind(this),
                            TP.sys.cfg('keyboard.shortcut_cancel_delay')));
                /* eslint-enable no-loop-func */

                //  If we're not at the end of the sequence migrate our hash
                //  reference "down" to the next level and mark the fact that we
                //  found a shortcut segment for this signal name.
                this.set('shortcutIndex', shortcuts);
            } else {
                shouldClearTimer = true;

                //  Reset to the top-most hash if we're at the end of a shortcut
                //  sequence (or didn't find one at all).
                this.set('shortcutIndex', this.get('shortcuts'));
            }
        } else if (i === len - 1 &&
                    /Up$/.test(signame) &&
                    this.get('shortcuts') !== this.get('shortcutIndex') &&
                    !matchedShortcutSegment) {

            //  If we didn't find shortcut data (but we were in the middle of
            //  trying to which means the current shortcut index is different
            //  that the overall shortcuts hash) and this is the last signal
            //  name we're processing and none of the other signal names found a
            //  shortcut segment, we reset to the 'top-level' hash. Note
            //  that we only reset to the top for Up events. Down and Press are
            //  ignored which avoids problems with modifier keys and
            //  intermediate events.

            //  if it's an up and it's a modifier-only, then don't reset
            if (/^(Shift|Alt|Ctrl)_Up/.test(normalizedEvent.$computedName)) {
                //  Reset to the top-most hash if we're at the end of a shortcut
                continue;
            }

            shouldClearTimer = true;

            this.set('shortcutIndex', this.get('shortcuts'));
        }

        if (shouldClearTimer) {
            //  We found handlers at the current shortcut level - cancel the
            //  'reset shortcuts timer'
            if (TP.isNumber(timer = TP.core.Keyboard.$get('shortcutsTimer'))) {
                clearTimeout(timer);
                TP.core.Keyboard.$set('shortcutsTimer', null);
            }
        }

        //  Process the handlers registered under the signal name.
        if (TP.notEmpty(handlers = dict.at(signame))) {
            handlersLen = handlers.getSize();
            for (j = 0; j < handlersLen; j++) {
                if (signal.shouldStop()) {
                    break;
                }

                handler = handlers.at(j);

                //  when we're using the redirector as the handler we need to
                //  push the original origin back into place, otherwise we set
                //  it to the receiver (since observe is for the device).
                if (handler !== redirector) {
                    signal.set('origin', this);
                }

                try {
                    TP.handle(handler, signal);
                } catch (e) {
                    TP.raise(this, 'TP.sig.HandlerException',
                                TP.ec(e));
                }
            }
        }
    }

    return signal;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('removeShortcutObserver',
function(aSignal, aHandler) {

    /**
     * @method removeShortcutObserver
     * @summary Removes a local signal observation for a "signal path", which
     *     is effectively a "gesture". Keyboard shortcuts are the primary
     *     example of signal paths.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off.
     * @returns {Number} The number of handlers that were removed.
     */

    var sd,
        handlers;

    sd = this.getShortcutData(aSignal);
    if (TP.notValid(sd) || TP.notValid(handlers = sd.at('handlers'))) {
        return 0;
    }

    return handlers.remove(aHandler, TP.IDENTITY);
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('setCurrentKeyboard',
function(aKeyboard) {

    /**
     * @method setCurrentKeyboard
     * @summary Defines the currently active keyboard instance used to perform
     *     all key-event related lookups and processing.
     * @param {TP.core.Keyboard} aKeyboard The keyboard instance to use for all
     *     key-event related processing.
     * @returns {TP.core.Keyboard} The current keyboard instance.
     */

    TP.core.Keyboard.$set('currentKeyboard', aKeyboard);

    //  force the new keyboard's map to become the one we cache etc.
    aKeyboard.loadKeymap();

    return TP.core.Keyboard.$get('currentKeyboard');
});

//  ------------------------------------------------------------------------
//  EVENT HANDLING
//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$handleKeyEvent',
function(nativeEvent) {

    /**
     * @method $$handleKeyEvent
     * @summary Responds to notification of a native keyboard event. This is
     *     the primary entry point for all keyboard event handling.
     * @param {Event} nativeEvent The native event.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    var ev,
        lastEvent,
        lastEventName,
        timer;

    if (!TP.sys.hasInitialized()) {
        return this;
    }

    //  Don't come through this handler twice for the same Event
    if (nativeEvent.$captured) {
        return this;
    }
    nativeEvent.$captured = true;

    //  normalize the event
    ev = TP.event(nativeEvent);

    switch (TP.eventGetType(ev)) {
        case 'keydown':

            //  suppress dups for IE...we manage repeat differently
            //  Note that we only do this if the event is not synthetic
            //  (otherwise it causes problems with our test harness).
            if (TP.sys.isUA('IE') && !ev.synthetic) {

                lastEvent = TP.core.Keyboard.get('lastDown');
                if (TP.isEvent(lastEvent) &&
                    TP.eventIsDuplicate(lastEvent, ev)) {
                    return this;
                }
            }

            //  Clear all history to avoid confusion in state.
            TP.core.Keyboard.$set('lastPress', null);
            TP.core.Keyboard.$set('lastUp', null);

            //  Capture the event into a variable that will keep a reference
            //  to the last time this event happened. This is used in a
            //  variety of ways in the $$handle* calls, and both the event
            //  and the slot may be altered during the course of that call.
            lastEventName = 'lastDown';
            TP.core.Keyboard.$set(lastEventName, ev);

            if (TP.isNumber(timer = TP.core.Keyboard.$get('downTimer'))) {
                clearTimeout(timer);
                TP.core.Keyboard.$set('downTimer', null);
            }

            TP.core.Keyboard.getCurrentKeyboard().$$handleKeyDown(ev);

            break;

        case 'keypress':

            //  suppress dups for IE...we manage repeat differently
            //  Note that we only do this if the event is not synthetic
            //  (otherwise it causes problems with our test harness).
            if (TP.sys.isUA('IE') && !ev.synthetic) {

                lastEvent = TP.core.Keyboard.get('lastPress');
                if (TP.isEvent(lastEvent) &&
                    TP.eventIsDuplicate(lastEvent, ev)) {
                    return this;
                }
            }

            //  Capture the event into a variable that will keep a reference
            //  to the last time this event happened. This is used in a
            //  variety of ways in the $$handle* calls, and both the event
            //  and the slot may be altered during the course of that call.
            lastEventName = 'lastPress';
            TP.core.Keyboard.$set(lastEventName, ev);

            TP.core.Keyboard.getCurrentKeyboard().$$handleKeyPress(ev);

            break;

        case 'keyup':

            //  suppress dups for IE...we manage repeat differently
            //  Note that we only do this if the event is not synthetic
            //  (otherwise it causes problems with our test harness).
            if (TP.sys.isUA('IE') && !ev.synthetic) {

                lastEvent = TP.core.Keyboard.get('lastUp');
                if (TP.isEvent(lastEvent) &&
                    TP.eventIsDuplicate(lastEvent, ev)) {
                    return this;
                }
            }

            //  Capture the event into a variable that will keep a reference
            //  to the last time this event happened. This is used in a
            //  variety of ways in the $$handle* calls, and both the event
            //  and the slot may be altered during the course of that call.
            lastEventName = 'lastUp';
            TP.core.Keyboard.$set(lastEventName, ev);

            TP.core.Keyboard.getCurrentKeyboard().$$handleKeyUp(ev);

            break;

        default:
            return this;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$handleKeyDown',
function(normalizedEvent) {

    /**
     * @method $$handleKeyDown
     * @summary Responds to notifications that a keydown event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    this.$$updateModifierStates(normalizedEvent);

    this[TP.composeHandlerName('KeyDown')](normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineHandler('KeyDown',
function(normalizedEvent) {

    /**
     * @method handleKeyDown
     * @summary A method which subtypes override to perform key handling
     *     specific to keydown events.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$handleKeyPress',
function(normalizedEvent) {

    /**
     * @method $$handleKeyPress
     * @summary Responds to notifications that a keypress event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    this[TP.composeHandlerName('KeyPress')](normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineHandler('KeyPress',
function(normalizedEvent) {

    /**
     * @method handleKeyPress
     * @summary A method which subtypes override to perform key handling
     *     specific to keypress events.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$handleKeyUp',
function(normalizedEvent) {

    /**
     * @method $$handleKeyUp
     * @summary Responds to notifications that a keyup event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    this.$$updateModifierStates(normalizedEvent);

    this[TP.composeHandlerName('KeyUp')](normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineHandler('KeyUp',
function(normalizedEvent) {

    /**
     * @method handleKeyUp
     * @summary A method which subtypes override to perform key handling
     *     specific to keyup events.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$updateModifierStates',
function(normalizedEvent) {

    /**
     * @method $$updateModifierStates
     * @summary Updates the modifier status based on the supplied Event.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Keyboard} The receiver.
     */

    var key,
        dirty;

    dirty = false;

    key = TP.eventGetAltKey(normalizedEvent);
    if (this.isAltDown() !== key) {
        dirty = true;
        this.isAltDown(key);
    }

    key = TP.eventGetShiftKey(normalizedEvent);
    if (this.isShiftDown() !== key) {
        dirty = true;
        this.isShiftDown(key);
    }

    key = TP.eventGetCtrlKey(normalizedEvent);
    if (this.isCtrlDown() !== key) {
        dirty = true;
        this.isCtrlDown(key);
    }

    key = TP.eventGetMetaKey(normalizedEvent);
    if (this.isMetaDown() !== key) {
        dirty = true;
        this.isMetaDown(key);
    }

    if (dirty) {
        this.invokeObservers('modifierkeychange', normalizedEvent);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  KEY/STATE QUERIES
//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('computeFullSignalName',
function(normalizedEvent, keyName, shift) {

    /**
     * @method computeFullSignalName
     * @summary Returns the 'full' signal name for a particular event. This
     *     method takes the key name and adds a prefix of 'Shift_', 'Alt_',
     *     'Ctrl_' or 'Meta_' and a suffix of '_Down', '_Press', '_Up', all
     *     dependent on the event's modifier states and 'action' (i.e. down,
     *     press or up).
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @param {String} keyName The key name.
     * @param {Boolean} shift Whether or not the key was shifted. Note that we
     *     allow the caller to supply this rather than calculating it from the
     *     supplied event so that the caller can 'spoof' it.
     * @returns {String} The 'full' key event DOM signal name.
     */

    var sigkey,
        signame;

    //  Make sure that any key name that is *only* a lowercase alpha character
    //  ([a-z]) is uppercased. So that, instead of returning 'DOM_Meta_z_Down',
    //  this method will return 'DOM_Meta_Z_Down' (which is how TIBET normalizes
    //  this situation - if the caller wants uppercase, they should specify
    //  'Shift_' somewhere in the signal name).
    sigkey = keyName;
    if (/^[a-z]{1}$/.test(sigkey)) {
        sigkey = keyName.toUpperCase();
    }

    //  Because the modifier name for 'Control' is 'Ctrl', users of TIBET will
    //  expect that, when trying to observe *the Control key itself*, that they
    //  can use the word 'Ctrl'. In other words, because they can subscribe to
    //  'DOM_Ctrl_K_Press' that they will also be able to subscribe to
    //  'DOM_Ctrl_Press'. The W3C name for Control is 'Control', but that's not
    //  what will be expected.
    if (keyName === 'Control') {
        sigkey = 'Ctrl';
    }

    //  All key events get a suffix suitable to that event
    switch (TP.eventGetType(normalizedEvent)) {
        case 'keyup':

            signame = sigkey + '_Up';
            break;

        case 'keydown':

            signame = sigkey + '_Down';
            break;

        case 'keypress':

            signame = sigkey + '_Press';
            break;

        default:

            signame = sigkey;
            break;
    }

    //  Modifier keys are prefixes which effectively start with optional
    //  Ctrl, Alt, or Meta followed by optional Shift state.
    if (shift && sigkey !== 'Shift') {
        signame = 'Shift_' + signame;
    }

    if (TP.eventGetAltKey(normalizedEvent) && sigkey !== 'Alt') {
        signame = 'Alt_' + signame;
    }

    if (TP.eventGetCtrlKey(normalizedEvent) && sigkey !== 'Ctrl') {
        signame = 'Ctrl_' + signame;
    }

    if (TP.eventGetMetaKey(normalizedEvent) && sigkey !== 'Meta') {
        signame = 'Meta_' + signame;
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getDOMSignalName',
function(normalizedEvent) {

    /**
     * @method getDOMSignalName
     * @summary Returns the DOM signal name for a particular event.
     * @description The returned signal name is based largely on the current
     *     keyboard's mapping for the particular event information including
     *     charCode, keyCode, and modifier key states. For example, a keyup
     *     event with the shift key active and a keycode of 13 on a US ASCII 101
     *     keyboard would return a signal name of DOM_Shift_Enter_Up.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {String} The key event DOM signal name.
     */

    return 'DOM_' + this.$getVirtualKeySignalName(normalizedEvent);
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getPrintableGlyph',
function(anEvent) {

    /**
     * @method getPrintableGlyph
     * @summary Returns the printable glyph (if available) for the keycode in
     *     the event provided.
     * @param {Event} anEvent A native key event.
     * @returns {String|null} The printable glyph or null if the keycode
     *     doesn't match a printable glyph.
     */

    var entry,
        glyph;

    //  Grab the XML element from the receiver's XML key map.
    entry = this.getVirtualKeyEntry(anEvent);

    if (!TP.isElement(entry)) {
        return null;
    }

    glyph = TP.elementGetAttribute(entry, 'glyph', true);

    if (TP.isEmpty(glyph)) {
        return null;
    }

    return glyph;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getVirtualKeyEntry',
function(anEvent) {

    /**
     * @method getVirtualKeyEntry
     * @summary Returns the current keyboard's virtual key entry in its XML
     *     lookup table for the keycode in the event provided.
     * @param {Event|Signal} anEvent The event or signal containing the event.
     * @returns {Element|undefined} The virtual key entry, or undefined when not
     *     found.
     */

    var ev,
        type,

        xml,

        key,
        shift,

        path,
        elems,
        elem;

    if (TP.notValid(anEvent)) {
        this.raise('TP.sig.InvalidEvent');
        return;
    }

    ev = TP.isEvent(anEvent) ? anEvent : anEvent.get('event');
    type = TP.eventGetType(ev);

    if (!TP.regex.KEY_EVENT.test(type)) {
        return;
    }

    if (TP.notValid(xml = TP.core.Keyboard.get('mapxml'))) {
        return;
    }

    key = TP.eventGetKeyCode(ev);

    //  bit of a trick here to avoid a Shift_Shift in particular
    if (key !== TP.SHIFT_KEY) {
        shift = TP.eventGetShiftKey(ev);
    }

    //  if the event was 'shift'ed, then we have to query twice, once for the
    //  'shift'ed code and, if an entry wasn't found, query again for the
    //  un'shift'ed code.
    if (shift) {
        path = TP.join(
                '//*[@keycode="_', key, '_shifted"]',
                '[(@platform="', TP.$platform,
                    '" and @browser="', TP.sys.getBrowser(), '")',
                ' or (@browser="', TP.sys.getBrowser(), '")',
                ' or (@platform="', TP.$platform, '")',
                ' or .]');

        elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
    }

    //  If either the Shift key wasn't down or it was but we didn't get a valid
    //  set of entries, then query.
    if (TP.isEmpty(elems)) {

        path = TP.join(
                '//*[@keycode="_', key, '"]',
                '[(@platform="', TP.$platform,
                    '" and @browser="', TP.sys.getBrowser(), '")',
                ' or (@browser="', TP.sys.getBrowser(), '")',
                ' or (@platform="', TP.$platform, '")',
                ' or .]');

        elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
    }

    //  If more than one element was returned, that means that we must have
    //  entries for specific browser, platform or both. Sort them so that
    //  entries with platform, then browser, then browser and platform (least to
    //  most specific) are towards the end of the list and use the last one.
    if (elems.getSize() > 1) {
        elems.sort(TP.sort.KEYMAP_ELEMENT);
        elem = elems.last();
    } else {
        //  There was only one.
        elem = elems.first();
    }

    return elem;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getVirtualKeyName',
function(anEvent) {

    /**
     * @method getVirtualKeyName
     * @summary Returns the current keyboard's virtual key name for the keycode
     *     in the event provided.
     * @param {Event|Signal} anEvent The event or signal containing the event.
     * @returns {String|undefined} The virtual key name, or undefined when not
     *     found.
     */

    var ev,
        type,

        xml,

        key,
        shift,

        path,
        elems,
        elem,

        vk;

    if (TP.notValid(anEvent)) {
        this.raise('TP.sig.InvalidEvent');
        return;
    }

    ev = TP.isEvent(anEvent) ? anEvent : anEvent.get('event');
    type = TP.eventGetType(ev);

    if (!TP.regex.KEY_EVENT.test(type)) {
        return;
    }

    if (TP.notValid(xml = TP.core.Keyboard.get('mapxml'))) {
        return;
    }

    key = TP.eventGetKeyCode(ev);

    //  bit of a trick here to avoid a Shift_Shift in particular
    if (key !== TP.SHIFT_KEY) {
        shift = TP.eventGetShiftKey(ev);
    }

    //  if the event was 'shift'ed, then we have to query twice, once for the
    //  'shift'ed code and, if an entry wasn't found, query again for the
    //  un'shift'ed code.
    if (shift) {
        path = TP.join(
                '//*[@keycode="_', key, '_shifted"]',
                '[(@platform="', TP.$platform,
                    '" and @browser="', TP.sys.getBrowser(), '")',
                ' or (@browser="', TP.sys.getBrowser(), '")',
                ' or (@platform="', TP.$platform, '")',
                ' or .]');

        elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
    }

    //  If either the Shift key wasn't down or it was but we didn't get a valid
    //  set of entries, then query.
    if (TP.isEmpty(elems)) {

        path = TP.join(
                '//*[@keycode="_', key, '"]',
                '[(@platform="', TP.$platform,
                    '" and @browser="', TP.sys.getBrowser(), '")',
                ' or (@browser="', TP.sys.getBrowser(), '")',
                ' or (@platform="', TP.$platform, '")',
                ' or .]');

        elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
    }

    //  If there was still no entry found, then see if we can derive it from the
    //  character code produced by the String type.
    if (TP.isEmpty(elems)) {
        if (TP.core.Keyboard.isPrintable(anEvent)) {
            vk = String.fromCharCode(key);
        }
    } else {

        //  If more than one element was returned, that means that we must have
        //  entries for specific browser, platform or both. Sort them so that
        //  entries with platform, then browser, then browser and platform
        //  (least to most specific) are towards the end of the list and use the
        //  last one.
        if (elems.getSize() > 1) {
            elems.sort(TP.sort.KEYMAP_ELEMENT);
            elem = elems.last();
        } else {
            //  There was only one.
            elem = elems.first();
        }

        //  Now get the virtual key value from either the key or glyph
        //  attribute.
        vk = TP.ifEmpty(
                    TP.elementGetAttribute(elem, 'key'),
                    TP.elementGetAttribute(elem, 'glyph'));
    }

    //  No char was there? Guess we'll use the key code itself in string form
    if (TP.notValid(vk)) {
        vk = 'KeyCode' + (TP.isString(key) ? key : '');
    }

    return vk;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getKeyCodeForKeyNamed',
function(keyNameOrGlyph) {

    /**
     * @method getKeyCodeForKeyNamed
     * @summary Returns the current keyboard's virtual key code for the name
     *     provided.
     * @param {String} keyNameOrGlyph The name or glyph of the key to look up.
     *     If a key name, this would be something like 'Backspace'. If a key
     *     glyph, it would be something like 'D'.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The virtual key code, or -1 when not found.
     */

    var xml,

        path,
        elems,

        keyCode,

        elem;

    if (!TP.isString(keyNameOrGlyph)) {
        this.raise('TP.sig.InvalidParameter');
        return TP.NOT_FOUND;
    }

    if (TP.notValid(xml = TP.core.Keyboard.get('mapxml'))) {
        return TP.NOT_FOUND;
    }

    path = TP.join(
            '//*[@key="', keyNameOrGlyph, '"]',
            '[(@platform="', TP.$platform,
                '" and @browser="', TP.sys.getBrowser(), '")',
            ' or (@browser="', TP.sys.getBrowser(), '")',
            ' or (@platform="', TP.$platform, '")',
            ' or .]');

    if (TP.isEmpty(elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET))) {
        path = TP.join(
                '//*[@glyph="', keyNameOrGlyph, '"]',
                '[(@platform="', TP.$platform,
                    '" and @browser="', TP.sys.getBrowser(), '")',
                ' or (@browser="', TP.sys.getBrowser(), '")',
                ' or (@platform="', TP.$platform, '")',
                ' or .]');

        //  Couldn't find an entry using either 'key' or 'glyph'
        if (TP.isEmpty(elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET))) {
            return TP.NOT_FOUND;
        }
    }

    //  If more than one element was returned, that means that we must have
    //  entries for specific browser, platform or both. Sort them so that
    //  entries with platform, then browser, then browser and platform
    //  (least to most specific) are towards the end of the list and use the
    //  last one.
    if (elems.getSize() > 1) {
        elems.sort(TP.sort.KEYMAP_ELEMENT);
        elem = elems.last();
    } else {
        //  There was only one.
        elem = elems.first();
    }

    if (TP.notEmpty(keyCode = TP.elementGetAttribute(elem, 'keycode'))) {
        //  Slice off the '_' and make it a Number
        return keyCode.slice(1).asNumber();
    }

    return TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$getVirtualKeySignalName',
function(normalizedEvent) {

    /**
     * @method $getVirtualKeySignalName
     * @summary Returns the 'raw key' signal name for a particular event. This
     *     will then be prepended by 'DOM_' by the getDOMSignalName() method to
     *     generate the proper 'full' signal name.
     * @description The returned signal name is based largely on the current
     *     keyboard's mapping for the particular event information including
     *     charCode, keyCode, and modifier key states. For example, a keyup
     *     event with the shift key active and a keycode of 13 on a US ASCII 101
     *     keyboard would return a signal name of Shift_Enter_Up.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {String} The key event DOM signal name.
     */

    var signame,

        shift,
        key,

        xml,

        vk,

        path,
        elems,
        elem;

    //  If we've already cached the name, then return it.
    if (TP.isString(signame = normalizedEvent.$computedName)) {
        return signame;
    }

    key = TP.eventGetKeyCode(normalizedEvent);

    if (key) {    //  not null and not 0
        if (TP.notValid(xml = TP.core.Keyboard.get('mapxml'))) {
            //  if no keymap is found we've got a real problem. our only
            //  potential option is to hope the key is a character code
            //  don't get string versions of control characters
            if (TP.core.Keyboard.isPrintable(normalizedEvent)) {
                vk = String.fromCharCode(key);
                normalizedEvent.$unicodeCharCode =
                    vk.asUnicodeLiteral().replace('\\u', 'U');
            }
        } else {
            //  bit of a trick here to avoid a Shift_Shift in particular
            if (key !== TP.SHIFT_KEY) {
                shift = TP.eventGetShiftKey(normalizedEvent);
            }

            //  if the event was 'shift'ed, then we have to query twice, once
            //  for the 'shift'ed code and, if an entry wasn't found, query
            //  again for the un'shift'ed code.
            if (shift) {
                path = TP.join(
                        '//*[@keycode="_', key, '_shifted"]',
                        '[(@platform="', TP.$platform,
                            '" and @browser="', TP.sys.getBrowser(), '")',
                        ' or (@browser="', TP.sys.getBrowser(), '")',
                        ' or (@platform="', TP.$platform, '")',
                        ' or .]');

                elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
            }

            //  If either the Shift key wasn't down or it was but we didn't get
            //  a valid set of entries, then query.
            if (TP.isEmpty(elems)) {

                path = TP.join(
                        '//*[@keycode="_', key, '"]',
                        '[(@platform="', TP.$platform,
                            '" and @browser="', TP.sys.getBrowser(), '")',
                        ' or (@browser="', TP.sys.getBrowser(), '")',
                        ' or (@platform="', TP.$platform, '")',
                        ' or .]');

                elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
            }

            //  If there was still no entry found, then see if we can derive it
            //  from the character code produced by the String type.
            if (TP.isEmpty(elems)) {
                //  don't get string versions of control characters
                if (TP.core.Keyboard.isPrintable(normalizedEvent)) {
                    vk = String.fromCharCode(key);
                    normalizedEvent.$unicodeCharCode =
                        vk.asUnicodeLiteral().replace('\\u', 'U');
                }
            } else {

                //  If more than one element was returned, that means that we
                //  must have entries for specific browser, platform or both.
                //  Sort them so that entries with platform, then browser, then
                //  browser and platform (least to most specific) are towards
                //  the end of the list and use the last one.
                if (elems.getSize() > 1) {
                    elems.sort(TP.sort.KEYMAP_ELEMENT);
                    elem = elems.last();
                } else {
                    //  There was only one.
                    elem = elems.first();
                }

                //  When we find a shifted value we make sure to not put
                //  'Shift_' onto the signal name... the vk name is all we
                //  want to see. In other words, we'll never generate
                //  'Shift_Asterisk'...
                if (shift && TP.elementGetAttribute(
                                    elem, 'keycode').endsWith('_shifted')) {
                    shift = false;
                }

                //  Otherwise, get it from either the key or glyph attribute.
                vk = TP.ifEmpty(
                        TP.elementGetAttribute(elem, 'key'),
                        TP.elementGetAttribute(elem, 'glyph'));

                normalizedEvent.$unicodeCharCode =
                        TP.elementGetAttribute(elem, 'char');
            }
        }
    }

    //  No char was there? Guess we'll use the key code itself in string form
    if (TP.notValid(vk)) {
        vk = 'KeyCode' + (TP.isString(key) ? key : 'UNKNOWN');
    }

    signame = this.computeFullSignalName(normalizedEvent, vk, shift);

    normalizedEvent.$computedName = signame;

    return signame;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isAltDown',
function(aFlag) {

    /**
     * @method isAltDown
     * @summary Returns true if the Alt key is currently pressed.
     * @param {Boolean} aFlag Set the 'isDown' state of the key to true or
     *     false.
     * @returns {Boolean} True if the Alt key is down.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('altDown', aFlag);
    }

    return this.$get('altDown');
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isCtrlDown',
function(aFlag) {

    /**
     * @method isCtrlDown
     * @summary Returns true if the Ctrl key is currently pressed.
     * @param {Boolean} aFlag Set the 'isDown' state of the key to true or
     *     false.
     * @returns {Boolean} True if the Ctrl key is down.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('ctrlDown', aFlag);
    }

    return this.$get('ctrlDown');
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isMetaDown',
function(aFlag) {

    /**
     * @method isMetaDown
     * @summary Returns true if the Meta key is currently pressed.
     * @param {Boolean} [aFlag] An optional flag to set the value.
     * @returns {Boolean} True if the Meta key is down.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('metaDown', aFlag);
    }

    return this.$get('metaDown');
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isPrintable',
function(anEvent) {

    /**
     * @method isPrintable
     * @summary Returns true if the event represents a character that should be
     *     printable given the current keyboard mapping.
     * @param {Event} anEvent A native key event.
     * @returns {Boolean} True if the event's keycode/charcode should produce a
     *     printable character given the current keyboard.
     */

    return this.getCurrentKeyboard().isPrintable(anEvent);
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isShiftDown',
function(aFlag) {

    /**
     * @method isShiftDown
     * @summary Returns true if the Shift key is currently pressed.
     * @param {Boolean} aFlag Set the 'isDown' state of the key to true or
     *     false.
     * @returns {Boolean} True if the Shift key is down.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('shiftDown', aFlag);
    }

    return this.$get('shiftDown');
});

//  ========================================================================
//  TP.core.USAscii101Keyboard
//  ========================================================================

TP.core.Keyboard.defineSubtype('USAscii101Keyboard');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.USAscii101Keyboard.Type.defineHandler('KeyDown',
function(normalizedEvent) {

    /**
     * @method handleKeyDown
     * @summary Handles key down events for the TP.core.USAscii101Keyboard
     *     type.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.USAscii101Keyboard} The receiver.
     */

    var key;
        // lastDown;

    key = TP.eventGetKeyCode(normalizedEvent);

    if (TP.sys.isUA('GECKO') && TP.sys.isMac()) {
        //  hozed on some keys, they report 0 as keyCode. have to wait for
        //  press event...thankfully moz will produce one (for now)
        if (key === 0) {
            normalizedEvent.$notSignaled = true;

            return this;
        }
    }

    /*
    //  arrow keys suck pretty much across the board. can't tell if it's an
    //  arrow or a %, &, (, or ' until the press event...but only Moz will
    //  provide a press event if it's actually an arrow. Also, home and $
    //  are confused. Cool huh?
    if (key >= 36 && key <= 40) {
        if (TP.sys.isUA('GECKO')) {
            //  wait for press to decide
            normalizedEvent.$notSignaled = true;

            return this;
        } else {
            //  Won't get a press from an arrow on IE or Safari so we have
            //  to hack it a little differently. A non-special key will get
            //  an immediate press and can cancel the following timer,
            //  otherwise the up handler can do it, provided that the down
            //  doesn't signal if the key is simply held down for some time.
            //  The variable here is how long is the delay between down and
            //  press event notification so the timeout coordinates with
            //  press properly.
            lastDown = TP.core.Keyboard.get('lastDown');
            if (!TP.isEvent(lastDown)) {
                return this;
            }

            lastDown.$notSignaled = true;
            lastDown.$special = true;

            TP.core.Keyboard.$set('downTimer',
                setTimeout(
                    function() {

                        //  clear so press/up don't get confused and try to
                        //  process their timer-specific logic
                        TP.core.Keyboard.$set('downTimer', null);

                        //  if the timer doesn't get cancelled by a press or
                        //  an up then we can presume we got a down on a key
                        //  that won't get a press...meaning it must be
                        //  special and hence an arrow key or similarly
                        //  hozed up key event.
                        lastDown.$notSignaled = null;

                        TP.core.Keyboard.invokeObservers('keydown',
                                                            lastDown);
                    }, 10));

            return;
        }
    }
    */

    this.invokeObservers('keydown', normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.USAscii101Keyboard.Type.defineHandler('KeyPress',
function(normalizedEvent) {

    /**
     * @method handleKeyPress
     * @summary Handles key press events for the TP.core.USAscii101Keyboard
     *     type.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.USAscii101Keyboard} The receiver.
     */

    var lastDown,
        special,
        lastKey,
        key;
        // timer;

    if (TP.sys.isUA('GECKO')) {
        lastDown = TP.core.Keyboard.get('lastDown');

        special = normalizedEvent.which === 0;
        if (special) {
            if (TP.isEvent(lastDown) && lastDown.$notSignaled) {
                lastDown.$special = true;
                lastDown.$notSignaled = null;

                this.invokeObservers('keydown', lastDown);
            }

            //  suppress to match DOM Level 3 standard and IE/Safari
            TP.core.Keyboard.$set('lastPress', null);

            return this;
        }

        //  press keys are often wrong...map to what was seen onkeydown
        //  unless that was 0
        if ((lastKey = TP.eventGetKeyCode(lastDown)) !== 0) {
            if (TP.isNumber(lastKey)) {
                normalizedEvent.$$keyCode = lastKey;
            }
        }

        key = TP.eventGetKeyCode(normalizedEvent);

        if (TP.isEvent(lastDown) && lastDown.$notSignaled) {
            lastDown.$notSignaled = null;
            lastDown.$special = null;
            lastDown.$$keyCode = key;

            this.invokeObservers('keydown', lastDown);
        }
    } else {
        //  if there's a down timer running then the key was in a range
        //  where we needed to wait for a press or up to tell what it was.
        //  clear the timer if we get a press since that means the key
        //  wasn't special on IE or Safari, just a normal key with an ascii
        //  code we can look up.
        /*
        if (TP.isNumber(timer = TP.core.Keyboard.$get('downTimer'))) {
            clearTimeout(timer);
            TP.core.Keyboard.$set('downTimer', null);

            lastDown = TP.core.Keyboard.get('lastDown');
            if (TP.isEvent(lastDown)) {
                lastDown.$notSignaled = null;
                lastDown.$special = null;

                this.invokeObservers('keydown', lastDown);
            }
        } else {
        */
        //  no timer and we got a press, must be a valid key in a range
        //  where the down was already signaled. for consistency we
        //  could potentially bring the down key's data forward and we
        //  actually need to do that since some codes report incorrectly
        //  due to ascii offsets of 32 etc.
        lastDown = TP.core.Keyboard.get('lastDown');
        if (TP.isEvent(lastDown) &&
            (lastKey = TP.eventGetKeyCode(lastDown)) !== 0) {
            normalizedEvent.$$keyCode = lastKey;
        }
        // }
    }

    this.invokeObservers('keypress', normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.USAscii101Keyboard.Type.defineHandler('KeyUp',
function(normalizedEvent) {

    /**
     * @method handleKeyUp
     * @summary Handles key up events for the TP.core.USAscii101Keyboard type.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.USAscii101Keyboard} The receiver.
     */

    var key,
        lastEvent,
        lastKey;
        // timer;

    if (TP.sys.isUA('GECKO')) {
        lastEvent = TP.core.Keyboard.get('lastPress') ||
                    TP.core.Keyboard.get('lastDown');

        if (TP.isEvent(lastEvent)) {
            normalizedEvent.$special = lastEvent.$special;
        }

        key = TP.eventGetKeyCode(normalizedEvent);
        if (key === 0) {
            if (TP.isEvent(lastEvent) &&
                (lastKey = TP.eventGetKeyCode(lastEvent)) !== 0) {
                normalizedEvent.$$keyCode = lastKey;
            }
        }
    } else {
        //  if there's a down timer running then the key was in a range
        //  where we needed to wait for a press or up to tell what it was.
        //  if we got an up and the timer's still valid that means there was
        //  no press event, hence the key was special (an arrow key etc)
        /*
        if (TP.isNumber(timer = TP.core.Keyboard.$get('downTimer'))) {
            clearTimeout(timer);
            TP.core.Keyboard.$set('downTimer', null);

            //  unless we map over the value we'll likely report
            //  incorrectly...remember what goes down must come up ;)
            lastEvent = TP.core.Keyboard.get('lastDown');
            if (TP.isEvent(lastEvent)) {
                normalizedEvent.$$keyCode = lastEvent.$$keyCode;
                normalizedEvent.$special = lastEvent.$special;

                this.invokeObservers('keydown', lastEvent);
            }
        } else {
        */
        //  no timer means key wasn't in the special range where we had
        //  to set a timer. should be a simple matter of ensuring we map
        //  over any knowledge that the key was special because we saw a
        //  press event etc.
        lastEvent = TP.core.Keyboard.get('lastPress') ||
                    TP.core.Keyboard.get('lastDown');
        if (TP.isEvent(lastEvent)) {
            normalizedEvent.$special = lastEvent.$special;
        }
        // }
    }

    this.invokeObservers('keyup', normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.USAscii101Keyboard.Type.defineMethod('isPrintable',
function(anEvent) {

    /**
     * @method isPrintable
     * @summary Returns true if the event represents a character that should be
     *     printable given the current keyboard mapping.
     * @param {Event} anEvent A native key event.
     * @returns {Boolean} True if the event's keycode/charcode should produce a
     *     printable character given the current keyboard.
     */

    var entry;

    //  Grab the XML element from the receiver's XML key map.
    entry = this.getVirtualKeyEntry(anEvent);

    //  If we got a valid entry and that entry has a 'glyph', then it's a
    //  printable character.
    return TP.isElement(entry) && TP.elementHasAttribute(entry, 'glyph', true);
});

//  ========================================================================
//  TP.core.Mouse
//  ========================================================================

TP.core.Device.defineSubtype('Mouse');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineAttribute(
        'hoverFunc',
        function() {

            var lastMove,
                lastOver,

                hoverRepeat,
                targetElem,
                targetRepeat,
                repeatAncestor,

                func;

            //  clean up after ourselves.
            TP.core.Mouse.$set('overTimer', null);
            TP.core.Mouse.$set('hoverTimer', null);
            TP.core.Mouse.$set('hoverRepeatTimer', null);

            //  make sure we've got a last move to work from
            lastMove = TP.core.Mouse.$get('lastMove');
            if (!TP.isEvent(lastMove)) {
                return;
            }

            if (TP.core.Mouse.$$isDragging(lastMove)) {
                TP.eventSetType(lastMove, 'draghover');

                TP.core.Mouse.invokeObservers(
                        'draghover',
                        lastMove);
            } else {
                TP.eventSetType(lastMove, 'mousehover');

                TP.core.Mouse.invokeObservers(
                        'mousehover',
                        lastMove);
            }

            //  we use the 'lastOver' to obtain the repeat value, if it has
            //  one. We don't want to pick up repeat values from every
            //  element we go over, in case we're in drag mode.
            if (!TP.isEvent(lastOver = TP.core.Mouse.$get('lastOver'))) {
                return;
            }

            hoverRepeat = TP.sys.cfg('mouse.hover_repeat');

            //  Get a resolved event target, given the event. This takes
            //  into account disabled elements and will look for a target
            //  element with the appropriate 'enabling attribute', if
            //  possible.
            if (TP.isElement(targetElem =
                            TP.eventGetResolvedTarget(lastOver))) {

                //  If the event target has an 'tibet:hoverrepeat' attribute,
                //  try to convert it to a Number and if that's successful,
                //  set hoverRepeat to it.
                targetRepeat = TP.elementGetAttribute(
                                            targetElem,
                                            'tibet:hoverrepeat',
                                            true);

                //  If we got a hover repeat value, then try to convert it to a
                //  Number and use it.
                if (TP.notEmpty(targetRepeat)) {
                    targetRepeat = targetRepeat.asNumber();

                    if (TP.isNumber(targetRepeat)) {
                        hoverRepeat = targetRepeat;
                    }
                } else {

                    //  Otherwise, search up the ancestor chain looking for an
                    //  element with a hover repeat attribute.
                    repeatAncestor = TP.nodeAncestorMatchingCSS(
                                            targetElem, '*[tibet|hoverrepeat]');

                    //  If we found an ancestor that had a hover repeat
                    //  attribute, then obtain its value, try to convert it to a
                    //  Number and use it.
                    if (TP.isElement(repeatAncestor)) {
                        targetRepeat = TP.elementGetAttribute(
                                                            repeatAncestor,
                                                            'tibet:hoverrepeat',
                                                            true);
                        targetRepeat = targetRepeat.asNumber();

                        if (TP.isNumber(targetRepeat)) {
                            hoverRepeat = targetRepeat;
                        }
                    }
                }
            }

            func =
                function() {

                    var priorMove,
                        doc;
                        // obs;

                    priorMove = TP.core.Mouse.$get('lastMove');

                    //  If there was no 'last move' native event that we can
                    //  leverage, then we can't do much so we exit here and
                    //  don't reschedule the timer.
                    if (!TP.isEvent(priorMove)) {
                        return;
                    }

                    //  If there are no mouse/drag hover subscriptions,
                    //  then there is no point in continuing so we exit here
                    //  and don't reschedule the timer.
                    //  TODO: This doesn't work with using 'on:mousehover' or
                    //  'on:draghover', so we comment it out for now. It's
                    //  doesn't seem to have a huge effect on performance.
                    // obs = TP.core.Mouse.get('observers');
                    // if (!obs.hasKey('TP.sig.DOMMouseHover') &&
                     //   !obs.hasKey('TP.sig.DOMDragHover')) {
                      //  return;
                    // }

                    //  If the document doesn't itself have focus or doesn't
                    //  have an active element, then that probably means
                    //  this window isn't in focus to the user, which means
                    //  hover events don't mean much. So we exit here and
                    //  don't reschedule the timer.
                    doc = TP.eventGetWindow(priorMove).document;
                    if (!doc.hasFocus() || !doc.activeElement) {
                        return;
                    }

                    //  If we're in a dragging state, then send invoke
                    //  observers for 'draghover', otherwise invoke the ones
                    //  for 'mousehover'.
                    if (TP.core.Mouse.$$isDragging(priorMove)) {
                        TP.eventSetType(priorMove, 'draghover');

                        TP.core.Mouse.invokeObservers(
                                'draghover',
                                priorMove);
                    } else {
                        TP.eventSetType(priorMove, 'mousehover');

                        TP.core.Mouse.invokeObservers(
                                'mousehover',
                                priorMove);
                    }

                    //  reschedule the repeat timer
                    TP.core.Mouse.$set(
                        'hoverRepeatTimer',
                        setTimeout(func, hoverRepeat));
                };

            //  set up the hover repeat timer
            TP.core.Mouse.$set(
                'hoverRepeatTimer',
                setTimeout(func, hoverRepeat));
        });

//  overall hash of observations made locally to a specific device
TP.core.Mouse.Type.defineAttribute('observers', TP.hc());

//  map of signals which we've placed redirectors for
TP.core.Mouse.Type.defineAttribute('redirections', TP.hc());

//  timers for click vs. dblclick and hover delay
TP.core.Mouse.Type.defineAttribute('clickTimer');
TP.core.Mouse.Type.defineAttribute('overTimer');
TP.core.Mouse.Type.defineAttribute('hoverTimer');
TP.core.Mouse.Type.defineAttribute('hoverRepeatTimer');

//  whether or not we've sent the 'dragdown' signal
TP.core.Mouse.Type.defineAttribute('$sentDragDown', false);

//  if we're not in a valid drag target
TP.core.Mouse.Type.defineAttribute('$notValidDragTarget', false);

//  a hash of any window offsets that were computed between a mouse down/drag
//  and a mouse up. This is cleared in the mouse up and (re)created when the
//  call is made to compute the window offsets.
TP.core.Mouse.Type.defineAttribute('$interWindowPointOffsets', false);

TP.core.Mouse.Type.defineAttribute('leftDown', false);
TP.core.Mouse.Type.defineAttribute('middleDown', false);
TP.core.Mouse.Type.defineAttribute('rightDown', false);

TP.core.Mouse.Type.defineAttribute('lastDown');
TP.core.Mouse.Type.defineAttribute('lastMove');
TP.core.Mouse.Type.defineAttribute('lastUp');

TP.core.Mouse.Type.defineAttribute('lastOver');
TP.core.Mouse.Type.defineAttribute('lastOut');

TP.core.Mouse.Type.defineAttribute('lastEnter');
TP.core.Mouse.Type.defineAttribute('lastLeave');

TP.core.Mouse.Type.defineAttribute('lastClick');
TP.core.Mouse.Type.defineAttribute('lastDblClick');
TP.core.Mouse.Type.defineAttribute('lastContextMenu');

TP.core.Mouse.Type.defineAttribute('lastMouseWheel');

//  encached copies of native event wrapper signals
TP.core.Mouse.Type.defineAttribute('mousedown');
TP.core.Mouse.Type.defineAttribute('mousemove');
TP.core.Mouse.Type.defineAttribute('mouseup');

TP.core.Mouse.Type.defineAttribute('mouseover');
TP.core.Mouse.Type.defineAttribute('mouseout');

TP.core.Mouse.Type.defineAttribute('mouseenter');
TP.core.Mouse.Type.defineAttribute('mouseleave');

TP.core.Mouse.Type.defineAttribute('click');
TP.core.Mouse.Type.defineAttribute('dblclick');
TP.core.Mouse.Type.defineAttribute('contextmenu');

TP.core.Mouse.Type.defineAttribute('mousewheel');

TP.core.Mouse.Type.defineAttribute('mousehover');

//  drag signals
TP.core.Mouse.Type.defineAttribute('dragdown');
TP.core.Mouse.Type.defineAttribute('dragmove');
TP.core.Mouse.Type.defineAttribute('dragup');

TP.core.Mouse.Type.defineAttribute('dragover');
TP.core.Mouse.Type.defineAttribute('dragout');

TP.core.Mouse.Type.defineAttribute('draghover');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    //  construct a template instance for signals we care about
    this.$set('mousedown',
            TP.sys.getTypeByName('TP.sig.DOMMouseDown').construct(null, true));
    this.$set('mousemove',
            TP.sys.getTypeByName('TP.sig.DOMMouseMove').construct(null, true));
    this.$set('mouseup',
            TP.sys.getTypeByName('TP.sig.DOMMouseUp').construct(null, true));

    this.$set('mouseover',
            TP.sys.getTypeByName('TP.sig.DOMMouseOver').construct(null, true));
    this.$set('mouseout',
            TP.sys.getTypeByName('TP.sig.DOMMouseOut').construct(null, true));

    this.$set('mouseenter',
            TP.sys.getTypeByName('TP.sig.DOMMouseEnter').construct(null, true));
    this.$set('mouseleave',
            TP.sys.getTypeByName('TP.sig.DOMMouseLeave').construct(null, true));

    this.$set('click',
            TP.sys.getTypeByName('TP.sig.DOMClick').construct(null, true));
    this.$set('dblclick',
            TP.sys.getTypeByName('TP.sig.DOMDblClick').construct(null, true));
    this.$set('contextmenu',
            TP.sys.getTypeByName('TP.sig.DOMContextMenu').construct(null, true));

    this.$set('mousewheel',
            TP.sys.getTypeByName('TP.sig.DOMMouseWheel').construct(null, true));

    this.$set('mousehover',
            TP.sys.getTypeByName('TP.sig.DOMMouseHover').construct(null, true));

    //  drag signals
    this.$set('dragdown',
            TP.sys.getTypeByName('TP.sig.DOMDragDown').construct(null, true));
    this.$set('dragmove',
            TP.sys.getTypeByName('TP.sig.DOMDragMove').construct(null, true));
    this.$set('dragup',
            TP.sys.getTypeByName('TP.sig.DOMDragUp').construct(null, true));

    this.$set('dragover',
            TP.sys.getTypeByName('TP.sig.DOMDragOver').construct(null, true));
    this.$set('dragout',
            TP.sys.getTypeByName('TP.sig.DOMDragOut').construct(null, true));

    this.$set('draghover',
            TP.sys.getTypeByName('TP.sig.DOMDragHover').construct(null, true));

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('computeWindowOffsetsBetween',
function(aWindow, otherWindow) {

    /**
     * @method computeWindowOffsetsBetween
     * @summary Computes (and possibly caches) window offset data between two
     *     windows. Note that any cache built here is reset with every mouse up
     *     event.
     * @param {Window} aWindow The first window to compute the offset between.
     * @param {Window} otherWindow The second window to compute the offset
     *     between.
     * @returns {Number[]} An Array of two Numbers where the first number is the
     *     X offset between the two windows and the second number is the Y
     *     offset between the two windows.
     */

    var win1GID,
        win2GID,

        info,
        win1Info,

        offsets;

    win1GID = TP.gid(aWindow);
    win2GID = TP.gid(otherWindow);

    //  A set of nested hashes, keyed first on the first window and then on the
    //  second window.
    info = this.$get('$interWindowPointOffsets');

    //  Cascade logic to first try to find a valid hash, then a valid nested
    //  hash under the first window's GID and then an Array of offsets under the
    //  second window's GID in the nested hash.

    //  Note here that we only compute the offsets when *absolutely* necessary.
    //  The whole purpose of this caching scheme is to avoid window offset
    //  computations during operations like mouse dragging.
    if (TP.isValid(info)) {
        win1Info = info.at(win1GID);
        if (TP.isValid(win1Info)) {
            offsets = win1Info.at(win2GID);
            if (TP.isValid(offsets)) {
                return offsets;
            }
            offsets = TP.windowComputeWindowOffsets(
                                aWindow, otherWindow, false);
            win1Info.atPut(win2GID, offsets);
        } else {
            offsets = TP.windowComputeWindowOffsets(
                                aWindow, otherWindow, false);
            info.atPut(win1GID, TP.hc(win2GID, offsets));
        }
    } else {
        offsets = TP.windowComputeWindowOffsets(aWindow, otherWindow, false);
        info = TP.hc(win1GID, TP.hc(win2GID, offsets));
        this.$set('$interWindowPointOffsets', info);
    }

    return offsets;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('resetEventData',
function(filterWindow) {

    /**
     * @method resetEventData
     * @summary Resets any event data cached by the receiver. It is important
     *     to call this when the GUI is flushed between page refreshes to avoid
     *     having obsolete references to old DOM structures.
     * @param {Window} filterWindow The window to filter cached events by. If
     *     the event occurred in this window, it will be cleared.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var evtTestFunc,
        sigTestFunc;

    evtTestFunc = function(sigName) {

        var event;

        event = this.get(sigName);

        if (TP.isEvent(event) &&
            TP.eventGetWindow(event) === filterWindow) {
            return true;
        }

        return false;
    }.bind(this);

    sigTestFunc = function(sigName) {

        var signal;

        signal = this.get(sigName);

        if (TP.isValid(signal) &&
            TP.isValid(signal.getPayload()) &&
            signal.getWindow() === filterWindow) {
            return true;
        }

        return false;
    }.bind(this);

    if (evtTestFunc('lastDown')) {
        this.set('lastDown', null);
    }

    if (evtTestFunc('lastMove')) {
        this.set('lastMove', null);
    }

    if (evtTestFunc('lastUp')) {
        this.set('lastUp', null);
    }

    if (evtTestFunc('lastOver')) {
        this.set('lastOver', null);
    }

    if (evtTestFunc('lastOut')) {
        this.set('lastOut', null);
    }

    if (evtTestFunc('lastClick')) {
        this.set('lastClick', null);
    }

    if (evtTestFunc('lastDblClick')) {
        this.set('lastDblClick', null);
    }

    if (evtTestFunc('lastContextMenu')) {
        this.set('lastContextMenu', null);
    }

    if (evtTestFunc('lastMouseWheel')) {
        this.set('lastMouseWheel', null);
    }

    if (sigTestFunc('mousedown')) {
        this.get('mousedown').setEvent(null);
    }

    if (sigTestFunc('mousemove')) {
        this.get('mousemove').setEvent(null);
    }

    if (sigTestFunc('mouseup')) {
        this.get('mouseup').setEvent(null);
    }

    if (sigTestFunc('mouseover')) {
        this.get('mouseover').setEvent(null);
    }

    if (sigTestFunc('mouseout')) {
        this.get('mouseout').setEvent(null);
    }

    if (sigTestFunc('mouseenter')) {
        this.get('mouseenter').setEvent(null);
    }

    if (sigTestFunc('mouseleave')) {
        this.get('mouseleave').setEvent(null);
    }

    if (sigTestFunc('click')) {
        this.get('click').setEvent(null);
    }

    if (sigTestFunc('dblclick')) {
        this.get('dblclick').setEvent(null);
    }

    if (sigTestFunc('contextmenu')) {
        this.get('contextmenu').setEvent(null);
    }

    if (sigTestFunc('mousewheel')) {
        this.get('mousewheel').setEvent(null);
    }

    if (sigTestFunc('mousehover')) {
        this.get('mousehover').setEvent(null);
    }

    if (sigTestFunc('dragdown')) {
        this.get('dragdown').setEvent(null);
    }

    if (sigTestFunc('dragmove')) {
        this.get('dragmove').setEvent(null);
    }

    if (sigTestFunc('dragup')) {
        this.get('dragup').setEvent(null);
    }

    if (sigTestFunc('dragover')) {
        this.get('dragover').setEvent(null);
    }

    if (sigTestFunc('dragout')) {
        this.get('dragout').setEvent(null);
    }

    if (sigTestFunc('draghover')) {
        this.get('draghover').setEvent(null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('invokeObservers',
function(singletonName, normalizedEvent, aSignal) {

    /**
     * @method invokeObservers
     * @summary Runs the event handlers for any registered observers.
     * @description Each native event type has a singleton TIBET signal instance
     *     registered with the device type. This singleton is acquired, updated,
     *     and then passed to each handler for processing. The normalizedEvent
     *     becomes the payload/native event for the signal and is thereby
     *     available to each handler for use.
     * @param {String} singletonName The attribute name used to acquire a
     *     singleton signal instance for the invocation.
     * @param {Event} normalizedEvent A normalized (augmented) native event
     *     object conforming to a set of common and W3-compliant methods.
     * @param {TP.sig.Signal} aSignal Optional signal to use rather than the
     *     singleton/event pair.
     * @returns {TP.sig.Signal|undefined} The signal that was actually
     *     triggered.
     */

    var targetElem,

        fname,
        elemType,

        signal,
        redirector,
        redirected,
        dict,

        logInfo,

        handlers,

        len,
        i,
        handler,

        typename;

    if (!TP.sys.hasInitialized()) {
        return;
    }

    if (TP.isElement(targetElem =
                        TP.eventGetResolvedTarget(normalizedEvent))) {
        fname = 'on' + TP.eventGetType(normalizedEvent);

        elemType = TP.wrap(targetElem).getType();

        //  Message the type for the element that is 'responsible' for
        //  this event. It's native control sent this event and we need
        //  to let the type know about it.
        if (TP.canInvoke(elemType, fname)) {
            elemType[fname](targetElem, normalizedEvent);
        }

        //  If the native event was prevented, then we should just bail out
        //  here.
        //  NB: 'defaultPrevented' is a DOM Level 3 property, which seems to
        //  be well supported on TIBET's target browser environments.
        if (normalizedEvent.defaultPrevented === true) {
            return;
        }
    }

    //  when we're provided with a signal we don't need to build one.
    signal = aSignal;
    if (TP.notValid(signal)) {
        //  build up a true signal from our template instance
        if (TP.notValid(signal = this.get(singletonName))) {
            TP.ifWarn() ?
                TP.warn('Event singleton not found for: ' + singletonName) : 0;

            return;
        }

        //  Make sure to recycle the signal instance to clear any previous
        //  state.
        signal.recycle();

        //  let the signal type manage updates on signal naming etc through
        //  the setEvent functions they can optionally implement.
        signal.setEvent(normalizedEvent);

        //  when we reuse singleton we need to initialize origin to the resolved
        //  target
        signal.set('origin', signal.getResolvedTarget());
    }

    //  capture the information we'll need to see about redirections
    redirector = this.REDIRECTOR;

    //  we force redirection but we only want to do it once. this flag keeps us
    //  from dispatching the same signal to the redirector twice.
    redirected = false;

    dict = this.get('observers');

    //  We process both the specific signal and the overall signal type so
    //  both kinds of observations will succeed.

    if (TP.sys.shouldLogMouse()) {

        logInfo = TP.hc(
            'target', TP.isValid(normalizedEvent.$$target) ?
                        TP.id(normalizedEvent.$$target) :
                        TP.id(normalizedEvent.target),
            'relatedTarget',
                        TP.isValid(normalizedEvent.$$relatedTarget) ?
                        TP.id(normalizedEvent.$$relatedTarget) :
                        TP.id(normalizedEvent.relatedTarget),
            'resolvedTarget',
                        TP.isValid(normalizedEvent.$$_resolvedTarget) ?
                        TP.id(normalizedEvent.$$_resolvedTarget) :
                        TP.id(normalizedEvent.resolvedTarget),
            'type', TP.isValid(normalizedEvent.$$type) ?
                        normalizedEvent.$$type :
                        normalizedEvent.type,
            'timestamp', TP.isValid(normalizedEvent.$$timestamp) ?
                        normalizedEvent.$$timestamp :
                        normalizedEvent.timestamp,
            'view', TP.isValid(normalizedEvent.$$view) ?
                        normalizedEvent.$$view :
                        normalizedEvent.view,

            'clientX', TP.isValid(normalizedEvent.$$clientX) ?
                        normalizedEvent.$$clientX :
                        normalizedEvent.clientX,
            'clientY', TP.isValid(normalizedEvent.$$clientY) ?
                        normalizedEvent.$$clientY :
                        normalizedEvent.clientY,
            'offsetX', TP.isValid(normalizedEvent.$$offsetX) ?
                        normalizedEvent.$$offsetX :
                        normalizedEvent.offsetX,
            'offsetY', TP.isValid(normalizedEvent.$$offsetY) ?
                        normalizedEvent.$$offsetY :
                        normalizedEvent.offsetY,
            'pageX', TP.isValid(normalizedEvent.$$pageX) ?
                        normalizedEvent.$$pageX :
                        normalizedEvent.pageX,
            'pageY', TP.isValid(normalizedEvent.$$pageY) ?
                        normalizedEvent.$$pageY :
                        normalizedEvent.pageY,
            'screenX', TP.isValid(normalizedEvent.$$screenX) ?
                        normalizedEvent.$$screenX :
                        normalizedEvent.screenX,
            'screenY', TP.isValid(normalizedEvent.$$screenY) ?
                        normalizedEvent.$$screenY :
                        normalizedEvent.screenY,

            'button', TP.isValid(normalizedEvent.$$button) ?
                        normalizedEvent.$$button :
                        normalizedEvent.button,
            'wheelDelta', TP.isValid(normalizedEvent.$$wheelDelta) ?
                        normalizedEvent.$$wheelDelta :
                        normalizedEvent.wheelDelta,

            'which', TP.isValid(normalizedEvent.which) ?
                                    normalizedEvent.which : '',

            'shift', normalizedEvent.shiftKey,
            'alt', normalizedEvent.altKey,
            'ctrl', normalizedEvent.ctrlKey,
            'meta', normalizedEvent.metaKey,

            'low_level_signame', singletonName,
            'high_level_signame', signal.getSignalName(),

            'special', TP.isValid(normalizedEvent.$special) ?
                        normalizedEvent.$special : false
            );

        TP.sys.logMouse(logInfo, null);
    }

    //  Process the handlers registered under the signal name.
    if (TP.notEmpty(handlers = dict.at(signal.getSignalName()))) {
        len = handlers.getSize();
        for (i = 0; i < len; i++) {
            if (signal.shouldStop()) {
                break;
            }

            handler = handlers.at(i);

            //  when we're using the redirector as the handler we need to
            //  push the original origin back into place, otherwise we set
            //  it to the receiver (since observe is for the device).
            if (handler !== redirector) {
                signal.set('origin', this);
            } else {
                redirected = true;
            }

            try {
                TP.handle(handler, signal);
            } catch (e) {
                TP.raise(this, 'TP.sig.HandlerException', TP.ec(e));
            }
        }
    } else {
        redirected = true;
        TP.handle(redirector, signal);
    }

    //  If the signal name wasn't the same as the signal's signal name then
    //  we go ahead and process the handlers registered under the type name,
    //  because its a spoofed signal.

    typename = signal.getName();

    if (signal.getSignalName() !== typename) {

        //  Reset the signal name to the type name because we need to
        //  signal to observers of the type name.
        signal.setSignalName(typename);

        if (TP.notEmpty(handlers = dict.at(typename))) {
            len = handlers.getSize();
            for (i = 0; i < len; i++) {
                if (signal.shouldStop()) {
                    break;
                }

                handler = handlers.at(i);

                //  when we're using the redirector as the handler we need
                //  to push the original origin back into place, otherwise
                //  we set it to the receiver (since observe is for the
                //  device).
                if (handler !== redirector) {
                    signal.set('origin', this);
                }

                try {
                    TP.handle(handler, signal);
                } catch (e) {
                    TP.raise(this, 'TP.sig.HandlerException',
                                TP.ec(e));
                }
            }
        } else if (!redirected) {
            TP.handle(redirector, signal);
        }
    }

    return signal;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleClick',
function(normalizedEvent) {

    /**
     * @method $$handleClick
     * @summary Responds to notifications from the native event system that a
     *     click event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var lastDown,

        clickDelay,
        targetElem,
        targetDelay,

        theEvent;

    if (TP.isNumber(TP.core.Mouse.$$clickTimer)) {
        return this;
    }

    lastDown = this.get('lastDown');

    //  If we can't compute a distance from the last mousedown then we assume
    //  this is a valid click event
    if (!TP.isEvent(lastDown)) {
        this.invokeObservers('click', normalizedEvent);

        return this;
    }

    //  make sure that we're not dragging...
    if (TP.core.Mouse.$$isDragging(normalizedEvent)) {
        return this;
    }

    //  The clickDelay is used when a piece of UI has been authored in such a
    //  way that a real distinction wants to be made between 'click' and 'double
    //  click' (rather than 'double click' just being 'more click'). If another
    //  click happens within the clickDelay time, the double click handler
    //  cancels the timeout and no 'click' handlers are fired.

    //  Initially set the clickDelay to the system configured click delay. This
    //  is usually set to 0 such that there is no delay and has the effect that
    //  'double click' is just 'more click'.
    clickDelay = TP.sys.cfg('mouse.click_delay');

    //  Get a resolved event target, given the event. This takes into account
    //  disabled elements and will look for a target element with the
    //  appropriate 'enabling attribute', if possible.
    if (TP.isElement(targetElem = TP.eventGetResolvedTarget(normalizedEvent))) {
        //  If the event target has an 'tibet:clickdelay' attribute, try to
        //  convert it to a Number and if that's successful, set clickDelay to
        //  it.
        if (TP.isNumber(targetDelay =
                            TP.elementGetAttribute(
                                            targetElem,
                                            'tibet:clickdelay',
                                            true).asNumber())) {
            clickDelay = targetDelay;
        }
    }

    //  Use a timer that can be cancelled by dblclick events so we don't cause
    //  event-level confusion. the semantics should be maintained by the
    //  application however that dblclick is "more click".
    theEvent = normalizedEvent;

    TP.core.Mouse.$$clickTimer = setTimeout(
        function() {

            TP.core.Mouse.invokeObservers('click', theEvent);

            TP.core.Mouse.$$clickTimer = undefined;
        }, clickDelay);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleContextMenu',
function(normalizedEvent) {

    /**
     * @method $$handleContextMenu
     * @summary Responds to notifications from the native event system that a
     *     context menu event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var signal;

    signal = this.invokeObservers('contextmenu', normalizedEvent);
    if (TP.isKindOf(signal, 'TP.sig.Signal')) {
        if (signal.shouldPrevent()) {
            normalizedEvent.preventDefault();
        }

        if (signal.shouldStop()) {
            normalizedEvent.stopPropagation();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleDblClick',
function(normalizedEvent) {

    /**
     * @method $$handleDblClick
     * @summary Responds to notifications from the native event system that a
     *     dblclick event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    //  clear any click timer...double-click overrides click at the raw
    //  event level
    if (TP.isNumber(TP.core.Mouse.$$clickTimer)) {
        clearTimeout(TP.core.Mouse.$$clickTimer);
        TP.core.Mouse.$$clickTimer = undefined;
    }

    this.invokeObservers('dblclick', normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseEvent',
function(nativeEvent) {

    /**
     * @method $$handleMouseEvent
     * @summary Responds to notification of a native mouse event.
     * @param {Event} nativeEvent The native event.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var ev,
        lastEventName;

    //  Don't come through this handler twice for the same Event
    if (nativeEvent.$captured) {
        return this;
    }
    nativeEvent.$captured = true;

    //  normalize the event
    ev = TP.event(nativeEvent);

    //  we'll switch on type here so we can fine-tune each event type's
    //  logic as needed

    //  Note here that for every one of these cases we capture the event
    //  into a variable that will keep a reference to the last time this
    //  event happened. This is used in a variety of ways in the
    //  $$handle* calls, and both the event and the slot may be altered
    //  during the course of that call.
    switch (TP.eventGetType(ev)) {
        case 'mousedown':

            lastEventName = 'lastDown';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseDown(ev);
            break;

        case 'mousemove':

            lastEventName = 'lastMove';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseMove(ev);
            break;

        case 'mouseup':

            lastEventName = 'lastUp';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseUp(ev);
            break;

        case 'mouseover':

            lastEventName = 'lastOver';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseOver(ev);
            break;

        case 'mouseout':

            lastEventName = 'lastOut';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseOut(ev);
            break;

        case 'mouseenter':

            lastEventName = 'lastEnter';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseEnter(ev);
            break;

        case 'mouseleave':

            lastEventName = 'lastLeave';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseLeave(ev);
            break;

        case 'click':

            lastEventName = 'lastClick';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleClick(ev);
            break;

        case 'dblclick':

            lastEventName = 'lastDblClick';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleDblClick(ev);
            break;

        case 'contextmenu':

            lastEventName = 'lastContextMenu';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleContextMenu(ev);
            break;

        case 'mousewheel':
        case 'DOMMouseScroll':

            //  NOTE the translation for Moz vs. IE in the signal names via
            //  fallthrough on the cases above

            lastEventName = 'lastMouseWheel';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseWheel(ev);
            break;

        default:
            return this;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseDown',
function(normalizedEvent) {

    /**
     * @method $$handleMouseDown
     * @summary Responds to notifications from the native event system that a
     *     mouse down event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    //  Update button state(s)
    this.$$updateButtonStates(normalizedEvent);

    //  'dragdown' isn't triggered in this way (because of further tolerance
    //  computations that need to be done), only 'mousedown'.
    this.invokeObservers('mousedown', normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseMove',
function(normalizedEvent) {

    /**
     * @method $$handleMouseMove
     * @summary Responds to notifications from the native event system that a
     *     mouse move event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var dragDownEvent,
        doc;

    //  TODO:   verify whether this is still required on target browsers
    TP.core.Keyboard.getCurrentKeyboard().$$updateModifierStates(
                                                        normalizedEvent);

    if (this.$$isDragging(normalizedEvent)) {
        if (TP.notTrue(this.$get('$sentDragDown'))) {
            //  Need to 'copy and retask' the 'last down' event, so that the
            //  correct targeting is performed and so that the proper kind
            //  of signal type, etc. is selected. We can do this by copying
            //  the 'last down' event and setting its 'event type'.
            if (TP.isEvent(dragDownEvent = this.get('lastDown'))) {
                dragDownEvent = dragDownEvent.copy();
                TP.eventSetType(dragDownEvent, 'dragdown');

                //  Make sure to suspend all mutation observer machinery for
                //  performance here during a drag session. This significantly
                //  increases drag performance during the session and gets
                //  switched back on in $$handleMouseUp.
                TP.suspendAllMutationObservers();

                this.invokeObservers('dragdown', dragDownEvent);

                this.$set('$sentDragDown', true);
            }
        }

        TP.eventSetType(normalizedEvent, 'dragmove');

        doc = TP.eventGetTargetDocument(normalizedEvent);
        if (TP.isDocument(doc)) {

            if (doc.selection) {
                doc.selection.empty();
            } else {
                doc.defaultView.getSelection().removeAllRanges();
            }
        }

        this.invokeObservers('dragmove', normalizedEvent);
    } else {
        this.invokeObservers('mousemove', normalizedEvent);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseWheel',
function(normalizedEvent) {

    /**
     * @method $$handleMouseWheel
     * @summary Responds to notifications from the native event system that a
     *     mouse wheel event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    this.invokeObservers('mousewheel', normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseUp',
function(normalizedEvent) {

    /**
     * @method $$handleMouseUp
     * @summary Responds to notifications from the native event system that a
     *     mouse up event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var wasDragging,
        doc;

    //  Note how we do this before we update the button state.
    wasDragging = this.$$isDragging(normalizedEvent);

    //  Update button state(s) - the user needs to know which button went up
    //  in their handler.
    this.$$updateButtonStates(normalizedEvent);

    if (wasDragging) {
        TP.eventSetType(normalizedEvent, 'dragup');

        doc = TP.eventGetTargetDocument(normalizedEvent);
        if (TP.isDocument(doc)) {

            if (doc.selection) {
                doc.selection.empty();
            } else {
                doc.defaultView.getSelection().removeAllRanges();
            }
        }

        //  Resume all mutation observer machinery. Note how we do this *before*
        //  we invoke the dragup observers. That way, if any of them do DOM
        //  manipulation, mutation observer firing will again be taking place
        //  for those operations.
        TP.resumeAllMutationObservers();

        this.invokeObservers('dragup', normalizedEvent);

        this.$set('$sentDragDown', false);
    } else {
        this.invokeObservers('mouseup', normalizedEvent);
    }

    this.$set('$notValidDragTarget', false);

    try {
        clearTimeout(this.$get('overTimer'));
        clearTimeout(this.$get('hoverTimer'));
        clearTimeout(this.$get('hoverRepeatTimer'));
    } catch (e) {
        TP.ifError() ?
                TP.error('Unable to clear hover timeout') : 0;
    }

    this.$set('$interWindowPointOffsets', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseOver',
function(normalizedEvent) {

    /**
     * @method $$handleMouseOver
     * @summary Responds to notifications from the native event system that a
     *     mouse over event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var targetElem,

        overDelay,
        targetOverDelay,

        overAncestor,

        overHandler;

    //  Get a resolved event target, given the event. This takes into
    //  account disabled elements and will look for a target element
    //  with the appropriate 'enabling attribute', if possible.

    if (TP.isElement(targetElem = TP.eventGetResolvedTarget(normalizedEvent))) {
        TP.elementSetAttribute(targetElem, 'pclass:hover', 'true', true);
    }

    overDelay = TP.sys.cfg('mouse.over_delay');

    //  Get a resolved event target, given the event. This takes into account
    //  disabled elements and will look for a target element with the
    //  appropriate 'enabling attribute', if possible.
    if (TP.isElement(targetElem)) {

        //  If the event target has an 'tibet:overdelay' attribute, try to
        //  convert it to a Number and if that's successful, set overDelay to
        //  it.
        targetOverDelay = TP.elementGetAttribute(targetElem,
                                                    'tibet:overdelay',
                                                    true);

        //  If we got a over delay value, then try to convert it to a Number and
        //  use it.
        if (TP.notEmpty(targetOverDelay)) {
            targetOverDelay = targetOverDelay.asNumber();

            if (TP.isNumber(targetOverDelay)) {
                overDelay = targetOverDelay;
            }
        } else {

            //  Otherwise, search up the ancestor chain looking for an element
            //  with a over delay attribute.
            overAncestor = TP.nodeAncestorMatchingCSS(
                                        targetElem, '*[tibet|overdelay]');

            //  If we found an ancestor that had a over delay attribute, then
            //  obtain its value, try to convert it to a Number and use it.
            if (TP.isElement(overAncestor)) {
                targetOverDelay = TP.elementGetAttribute(
                                                    overAncestor,
                                                    'tibet:overdelay',
                                                    true);
                targetOverDelay = targetOverDelay.asNumber();

                if (TP.isNumber(targetOverDelay)) {
                    overDelay = targetOverDelay;
                }
            }
        }
    }

    overHandler = function() {

        var hoverDelay,
            targetHoverDelay,

            hoverAncestor;

        if (this.$$isDragging(normalizedEvent)) {
            TP.eventSetType(normalizedEvent, 'dragover');

            this.invokeObservers('dragover', normalizedEvent);
        } else {
            this.invokeObservers('mouseover', normalizedEvent);
        }

        hoverDelay = TP.sys.cfg('mouse.hover_delay');

        //  Get a resolved event target, given the event. This takes into
        //  account disabled elements and will look for a target element
        //  with the appropriate 'enabling attribute', if possible.
        if (TP.isElement(targetElem)) {

            //  If the event target has an 'tibet:hoverdelay' attribute, try
            //  to convert it to a Number and if that's successful, set
            //  hoverDelay to it.
            targetHoverDelay = TP.elementGetAttribute(
                                                targetElem,
                                                'tibet:hoverdelay',
                                                true);

            //  If we got a hover delay value, then try to convert it to a
            //  Number and use it.
            if (TP.notEmpty(targetHoverDelay)) {
                targetHoverDelay = targetHoverDelay.asNumber();

                if (TP.isNumber(targetHoverDelay)) {
                    hoverDelay = targetHoverDelay;
                }
            } else {

                //  Otherwise, search up the ancestor chain looking for an
                //  element with a hover delay attribute.
                hoverAncestor = TP.nodeAncestorMatchingCSS(
                                            targetElem, '*[tibet|hoverdelay]');

                //  If we found an ancestor that had a hover delay attribute,
                //  then obtain its value, try to convert it to a Number and use
                //  it.
                if (TP.isElement(hoverAncestor)) {
                    targetHoverDelay = TP.elementGetAttribute(
                                                        hoverAncestor,
                                                        'tibet:hoverdelay',
                                                        true);
                    targetHoverDelay = targetHoverDelay.asNumber();

                    if (TP.isNumber(targetHoverDelay)) {
                        hoverDelay = targetHoverDelay;
                    }
                }
            }
        }

        TP.core.Mouse.$set('hoverTimer',
                            setTimeout(this.$get('hoverFunc'), hoverDelay));
    }.bind(this);

    TP.core.Mouse.$set('overTimer',
                        setTimeout(overHandler, overDelay));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseOut',
function(normalizedEvent) {

    /**
     * @method $$handleMouseOut
     * @summary Responds to notifications from the native event system that a
     *     mouse over event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var targetElem;

    //  Get a resolved event target, given the event. This takes into
    //  account disabled elements and will look for a target element
    //  with the appropriate 'enabling attribute', if possible.

    //  TODO: remove this, replace with "wake up mr. css processor?"
    if (TP.isElement(targetElem = TP.eventGetResolvedTarget(normalizedEvent))) {
        TP.elementRemoveAttribute(targetElem, 'pclass:hover', true);
    }

    if (this.$$isDragging(normalizedEvent)) {
        TP.eventSetType(normalizedEvent, 'dragout');

        this.invokeObservers('dragout', normalizedEvent);
    } else {
        this.invokeObservers('mouseout', normalizedEvent);
    }

    try {
        clearTimeout(this.$get('overTimer'));
        clearTimeout(this.$get('hoverTimer'));
        clearTimeout(this.$get('hoverRepeatTimer'));
    } catch (e) {
        TP.ifError() ?
                TP.error('Unable to clear hover timeout') : 0;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseEnter',
function(normalizedEvent) {

    /**
     * @method $$handleMouseEnter
     * @summary Responds to notifications from the native event system that a
     *     mouse enter event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    this.invokeObservers('mouseenter', normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseLeave',
function(normalizedEvent) {

    /**
     * @method $$handleMouseLeave
     * @summary Responds to notifications from the native event system that a
     *     mouse leave event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    this.invokeObservers('mouseleave', normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$isDragging',
function(normalizedEvent) {

    /**
     * @method $$isDragging
     * @summary Returns true if the mouse is currently in a 'dragging' mode.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {Boolean} True if dragging, false otherwise.
     */

    var dragButtonDown,

        lastDown,

        target,
        val,
        ans,

        distance,

        dragDistance,
        dragDelay,

        targetElem,

        targetDistance,
        targetDelay,

        elapsedTime;

    //  If we've sent a 'drag down', then we're in the middle of dragging...
    //  short stop it here.
    if (TP.isTrue(this.$get('$sentDragDown'))) {
        return true;
    }

    if (TP.isTrue(this.$get('$notValidDragTarget'))) {
        return false;
    }

    /* eslint-disable no-extra-parens */
    dragButtonDown =
                (this.$get('leftDown') &&
                    TP.sys.cfg('mouse.drag_buttons').contains('left')) ||
                (this.$get('middleDown') &&
                    TP.sys.cfg('mouse.drag_buttons').contains('middle')) ||
                (this.$get('rightDown') &&
                    TP.sys.cfg('mouse.drag_buttons').contains('right'));
    /* eslint-enable no-extra-parens */

    if (dragButtonDown) {
        if (!TP.isEvent(lastDown = this.get('lastDown'))) {
            return false;
        }

        //  Compute whether or not the target wants to allow dragging (and cache
        //  the value if it doesn't).
        target = TP.eventGetTarget(normalizedEvent);
        val = TP.elementGetAttribute(
                        target, 'tibet:no-dragtrap', true);
        if (val === 'true') {
            this.$set('$notValidDragTarget', true);
            return false;
        }

        if (TP.isElement(
            ans = TP.nodeAncestorMatchingCSS(
                        target,
                        '*[tibet|no-dragtrap]'))) {

            val = TP.elementGetAttribute(
                        ans, 'tibet:no-dragtrap', true);
            if (val === 'true') {
                this.$set('$notValidDragTarget', true);
                return false;
            }
        }

        distance = TP.computeDistance(lastDown, normalizedEvent);

        //  Initially, set the drag pixel distance to the value from the
        //  TP.sys.cfg() variable
        dragDistance = TP.sys.cfg('mouse.drag_distance');

        //  Initially, set the drag time delay to the value from the
        //  TP.sys.cfg() variable
        dragDelay = TP.sys.cfg('mouse.drag_delay');

        //  Get a resolved event target, given the event. This takes into
        //  account disabled elements and will look for a target element
        //  with the appropriate 'enabling attribute', if possible.
        if (TP.isElement(targetElem = TP.eventGetResolvedTarget(
                                                        normalizedEvent))) {
            //  If the event target has an 'tibet:dragdistance' attribute, try
            //  to convert it to a Number and if that's successful, set
            //  dragDistance to it.
            if (TP.isNumber(targetDistance =
                                TP.elementGetAttribute(
                                            targetElem,
                                            'tibet:dragdistance',
                                            true).asNumber())) {
                dragDistance = targetDistance;
            }

            //  If the event target has an 'tibet:dragdelay' attribute, try
            //  to convert it to a Number and if that's successful, set
            //  dragDelay to it.
            if (TP.isNumber(targetDelay =
                                TP.elementGetAttribute(
                                            targetElem,
                                            'tibet:dragdelay',
                                            true).asNumber())) {
                dragDelay = targetDelay;
            }
        }

        elapsedTime = TP.eventGetTime(normalizedEvent) -
                        TP.eventGetTime(lastDown);

        /* eslint-disable no-extra-parens */
        return (distance >= dragDistance && elapsedTime >= dragDelay);
        /* eslint-enable no-extra-parens */
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$updateButtonStates',
function(normalizedEvent) {

    /**
     * @method $$updateButtonStates
     * @summary Updates the button status based on the supplied Event.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {TP.meta.core.Mouse} The receiver.
     */

    var button,
        value;

    button = TP.button(normalizedEvent);

    value = normalizedEvent.type === 'mousedown' ? true : false;

    switch (button) {
        case TP.LEFT:

            this.$set('leftDown', value);
            break;

        case TP.MIDDLE:

            this.$set('middleDown', value);
            break;

        case TP.RIGHT:

            this.$set('rightDown', value);
            break;

        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
