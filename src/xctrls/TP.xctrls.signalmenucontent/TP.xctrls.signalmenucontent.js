//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

/**
 * @type {TP.xctrls.signalmenucontent}
 * @summary TP.xctrls.TemplatedTag subtype which...
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('TP.xctrls:signalmenucontent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.signalmenucontent.Inst.defineHandler('UISelect',
function(aSignal) {

    /**
     * @method handleUISelect
     * @param {TP.sig.UISelect} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.signalmenucontent} The receiver.
     */

    var origin,
        sigName,
        dataIndex,

        itemValue,
        item,

        payload;

    //  Grab the signal origin and wrap it. This should be the menu itself.
    origin = TP.wrap(aSignal.getSignalOrigin());
    if (!TP.isKindOf(origin, TP.xctrls.menu)) {
        return this;
    }

    //  Grab the value, which will be the name of the signal to broadcast, and
    //  the value data, which will form the payload of the signal.
    sigName = origin.getValue();
    if (TP.isEmpty(sigName)) {
        return this;
    }

    dataIndex = aSignal.at('index');
    if (TP.notEmpty(dataIndex) && dataIndex >= 0) {
        payload = this.get('data').at(dataIndex);
    } else {
        itemValue = origin.get('value');
        item = origin.get('itemWithValue', itemValue);
        payload = TP.hc('signal', itemValue, 'label', item.getLabelText());
    }

    //  Signal with the signal name that was the selected value.
    this.signal(sigName, payload);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
