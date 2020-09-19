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
//  TP.sig.DevtoolsSignal (and subtypes)
//  ========================================================================

//  A signal used by others to send a message through this bridge. The app's
//  Application instance handles these signals and then passes them to its
//  current bridge instance for processing.
TP.sig.ResponderSignal.defineSubtype('DevtoolsMessage');

//  Signals fired by this bridge but not handled by it. These signals are the
//  bridge's way of communicating with the TIBET application instance (and any
//  other responders in the chain at signaling time).

TP.sig.ResponderSignal.defineSubtype('DevtoolsIO');
TP.sig.DevtoolsIO.defineSubtype('DevtoolsInput');
TP.sig.DevtoolsIO.defineSubtype('DevtoolsOutput');

TP.sig.ERROR.defineSubtype('DevtoolsError');
TP.sig.DevtoolsError.defineSubtype('DevtoolsInputError');
TP.sig.DevtoolsError.defineSubtype('DevtoolsOutputError');

//  ========================================================================
//  TP.lama.ExtensionBridge
//  ========================================================================

/**
 * @type {TP.lama.ExtensionBridge}
 * @summary
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('TP.lama.ExtensionBridge');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.ExtensionBridge.Inst.defineMethod('init',
function(onmessage, onerror) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @param {Function} [onmessage] Optional onmessage handler. Defaults to the
     *     receiving type's onmessage method, allowing you to create custom
     *     worker subtypes with specific methods for message protocol handling.
     * @param {Function} [onerror] Optional onerror handler. Defaults to the
     *     receiving type's onerror method, allowing you to create custom
     *     worker subtypes with specific methods for message error handling.
     * @returns {TP.lama.ExtensionBridge} A new instance.
     */

    var handler;

    this.callNextMethod();

    TP.debug('installing devtools extension bridge');

    try {

        //  Set up the onmessage handler by either using the supplied one or
        //  binding to our method.
        handler = onmessage;
        if (TP.notValid(handler)) {
            handler = this.onmessage.bind(this);
        }
        TP.topWindow.addEventListener('message', handler, false);

        //  Set up the onerror handler by either using the supplied one or
        //  binding to our method.
        handler = onerror;
        if (TP.notValid(handler)) {
            handler = this.onerror.bind(this);
        }
        TP.topWindow.addEventListener('error', handler, false);

    } catch (e) {
        return this.raise('LamaError', e);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.ExtensionBridge.Inst.defineMethod('onerror',
function(evt) {

    /**
     * @method onerror
     * @summary The method that is invoked when the web socket that the receiver
     *     is managing has encountered an error.
     * @param {ErrorEvent} evt The event sent by the underlying system.
     * @returns {TP.lama.ExtensionBridge} The receiver.
     */

    TP.debug('devtools bridge onerror');

    if (evt.source !== TP.topWindow) {
        return this;
    }

    if (TP.sys.inExtension() === true) {
        if (evt.data.type && evt.data.type === 'TO_DEVTOOLS') {
            TP.error(evt);
            this.signal('DevtoolsInputError', evt);
        }
    } else {
        if (evt.data.type && evt.data.type === 'FROM_DEVTOOLS') {
            TP.error(evt);
            this.signal('DevtoolsOutputError', evt);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.ExtensionBridge.Inst.defineMethod('onmessage',
function(evt) {

    /**
     * @method onmessage
     * @summary The method that is invoked when the web socket that the receiver
     *     is managing has data ready to be processed.
     * @param {MessageEvent} evt The event sent by the underlying system.
     * @returns {TP.lama.ExtensionBridge} The receiver.
     */

    TP.debug('devtools bridge onmessage');

    if (evt.source !== TP.topWindow) {
        return this;
    }

    if (TP.sys.inExtension() === true) {
        if (evt.data.type && evt.data.type === 'TO_DEVTOOLS') {
            this.signal('DevtoolsInput', evt);
        }
    } else {
        if (evt.data.type && evt.data.type === 'FROM_DEVTOOLS') {
            this.signal('DevtoolsOutput', evt);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.ExtensionBridge.Inst.defineMethod('send',
function(message) {

    /**
     */

    var event,
        payload;

    if (TP.isString(message)) {
        payload = {
            message: message
        };
    } else if (TP.canInvoke(message, 'getPayload')) {
        payload = message.getPayload();
    } else {
        payload = message;
    }

    payload = TP.ifInvalid(TP.obj(payload), {});

    event = {
        payload: payload
    };

    if (TP.sys.inExtension() === true) {
        event.type = 'FROM_DEVTOOLS';
    } else {
        event.type = 'TO_DEVTOOLS';
    }

    TP.topWindow.postMessage(event);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
