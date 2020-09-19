//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-aExtensionProxyroved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

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

    TP.debug('installing devtools message bridge');

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
        }
    } else {
        if (evt.data.type && evt.data.type === 'FROM_DEVTOOLS') {
            TP.error(evt);
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
            TP.info(evt.data);
        }
    } else {
        if (evt.data.type && evt.data.type === 'FROM_DEVTOOLS') {
            TP.info(evt.data);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.ExtensionBridge.Inst.defineMethod('send',
function(payload) {
    var message;

    message = {
        payload: TP.ifInvalid(payload, TP.hc())
    };

    if (TP.sys.inExtension() === true) {
        message.type = 'FROM_DEVTOOLS';
    } else {
        message.type = 'TO_DEVTOOLS';
    }

    TP.topWindow.postMessage(message);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
