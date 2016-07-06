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
 * @type {TP.sherpa.dispenser}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('dispenser');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.dispenser.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);
    tpElem.observe(TP.ANY,
                    TP.ac('TP.sig.DOMDNDInitiate', 'TP.sig.DOMDNDTerminate'));

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.dispenser.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);
    tpElem.ignore(TP.ANY,
                    TP.ac('TP.sig.DOMDNDInitiate', 'TP.sig.DOMDNDTerminate'));

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.dispenser.Inst.defineAttribute('$extruderWasActive');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.dispenser.Inst.defineHandler('DOMDNDInitiate',
function(aSignal) {

    var extruder,
        isActive;

    extruder = TP.bySystemId('SherpaExtruder');

    isActive = extruder.get('isActive');
    this.set('$extruderWasActive', isActive);

    if (!isActive) {
        extruder.extrude();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.dispenser.Inst.defineHandler('DOMDNDTerminate',
function(aSignal) {

    var extruder,
        wasActive;

    extruder = TP.bySystemId('SherpaExtruder');

    wasActive = this.get('$extruderWasActive');

    if (!wasActive) {

        (function() {
            extruder.unextrude();
        }.fork(100));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
