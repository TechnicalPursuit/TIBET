//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.clipbox}
 * @summary Manages clipbox XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:clipbox');

TP.xctrls.clipbox.addTraits(TP.xctrls.Element);

TP.xctrls.clipbox.Type.resolveTraits(
        TP.ac('cmdRunContent', 'tagCompile'),
        TP.xctrls.Element);

TP.xctrls.clipbox.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.clipbox.finalizeTraits();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.clipbox.Inst.defineAttribute(
        'bodyElement',
        {'value': TP.cpc('> xctrls|body', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.clipbox.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var clippedVal,

        bodyElem,
        totalVal,

        existingVal,

        percentage;

    //  TODO: Right now we assume a vertical orientation.

    clippedVal = this.getHeight();

    bodyElem = this.get('bodyElement');
    totalVal = TP.elementGetHeight(bodyElem);

    existingVal = TP.elementGetStyleValueInPixels(bodyElem, 'top');

    existingVal = existingVal.asNumber().abs();

    percentage = existingVal / (totalVal - clippedVal);

    return percentage;
});

//  ------------------------------------------------------------------------

TP.xctrls.clipbox.Inst.defineMethod('handleSlide',
function(aSignal) {

    /**
     * @method handleSlide
     * @abstract
     */

    var sigParams;

    //  'Slide' signals can have a payload
    sigParams = aSignal.getPayload();

    this.moveByIncrement(
                sigParams.at('side'),
                TP.ifInvalid(sigParams.at('increment'),
                                this.getAttribute('xctrls:increment')));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.clipbox.Inst.defineMethod('handleValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary This method is invoked as the value of the tabbar is changed.
     *     This is due to a handler set up in our generated markup.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     */

    this.setValue(aSignal.getSignalOrigin().getValue());

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.clipbox.Inst.defineMethod('moveByIncrement',
function(aSide, incrementValue) {

    /**
     * @method moveByIncrement
     * @param {String} aSide
     * @param {Number} incrementValue
     * @abstract
     */

    var bodyElem,

        theSide,

        increment,
        existingVal;

    //  TODO: Right now we assume a vertical orientation.

    bodyElem = this.get('bodyElement');

    theSide = TP.ifInvalid(aSide, 'TP.TOP');

    increment = TP.elementGetPixelValue(bodyElem,
                                        incrementValue,
                                        'top');

    if (theSide === 'TP.TOP') {
        increment = -increment;
    }

    existingVal = TP.elementGetStyleValueInPixels(bodyElem, 'top');

    TP.elementGetStyleObj(bodyElem).top =
                                (existingVal + increment) + 'px';

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.clipbox.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.clipbox} The receiver.
     */

    var clippedVal,

        bodyElem,
        totalVal,

        absolutePixels;

    //  TODO: Right now we assume a vertical orientation.

    clippedVal = this.getHeight();

    bodyElem = this.get('bodyElement');
    totalVal = TP.elementGetHeight(bodyElem);

    absolutePixels = aValue * (totalVal - clippedVal);

    TP.elementGetStyleObj(bodyElem).top = -absolutePixels + 'px';

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
