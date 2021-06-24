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

    var value;

    value = TP.wrap(aSignal.getSignalOrigin()).getValue();

    if (TP.isEmpty(value)) {
        return this;
    }

    //  Signal with the signal name that was the selected value.
    this.signal(value);

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
