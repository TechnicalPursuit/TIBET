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
 * @type {APP.tibetlama.ExtensionBridge}
 * @summary
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('APP.tibetlama.ExtensionBridge');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

APP.tibetlama.ExtensionBridge.Inst.defineMethod('init',
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
     * @returns {APP.tibetlama.ExtensionBridge} A new instance.
     */

    var handler;

    this.callNextMethod();

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

APP.tibetlama.ExtensionBridge.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    var focusedID;

    console.log('Halo did focus');

    focusedID =
        TP.wrap(aSignal.getOrigin()).get('currentTargetTPElem').getGlobalID();

    TP.topWindow.postMessage(
        {type: 'FROM_APP', payload: 'halo did focus: ' + focusedID});

    return this;
});

//  ------------------------------------------------------------------------

APP.tibetlama.ExtensionBridge.Inst.defineMethod('onerror',
function(evt) {

    /**
     * @method onerror
     * @summary The method that is invoked when the web socket that the receiver
     *     is managing has encountered an error.
     * @param {ErrorEvent} evt The event sent by the underlying system.
     * @returns {APP.tibetlama.ExtensionBridge} The receiver.
     */

    if (evt.source !== TP.topWindow) {
        return this;
    }

    if (evt.data.type && evt.data.type === 'TO_APP') {
        TP.error(evt);
    }

    return this;
});

//  ------------------------------------------------------------------------

APP.tibetlama.ExtensionBridge.Inst.defineMethod('onmessage',
function(evt) {

    /**
     * @method onmessage
     * @summary The method that is invoked when the web socket that the receiver
     *     is managing has data ready to be processed.
     * @param {MessageEvent} evt The event sent by the underlying system.
     * @returns {APP.tibetlama.ExtensionBridge} The receiver.
     */

    if (evt.source !== TP.topWindow) {
        return this;
    }

    if (evt.data.type && evt.data.type === 'TO_APP') {
        TP.info(evt.data);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
