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
 * @type {TP.xctrls.slidebar}
 * @summary Manages slidebar XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:slidebar');

TP.xctrls.slidebar.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Shared drag responder instances
TP.xctrls.slidebar.Type.defineAttribute('vertSlideResponder');
TP.xctrls.slidebar.Type.defineAttribute('horizSlideResponder');

TP.xctrls.slidebar.Type.defineAttribute('defaultIncrement', 5);

TP.xctrls.slidebar.Type.defineAttribute('opaqueSignalNames',
        TP.ac('TP.sig.DOMMouseDown',
                'TP.sig.DOMDragMove',
                'TP.sig.DOMClick'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineAttribute(
        'thumb',
        {value: TP.cpc('*[tibet|pelem="thumb"]', TP.hc('shouldCollapse', true))});

TP.xctrls.slidebar.Inst.defineAttribute(
        'decrementButton',
        {value: TP.cpc('.decrement', TP.hc('shouldCollapse', true))});

TP.xctrls.slidebar.Inst.defineAttribute(
        'incrementButton',
        {value: TP.cpc('.increment', TP.hc('shouldCollapse', true))});

TP.xctrls.slidebar.Inst.defineAttribute(
        'dragger',
        {value: TP.cpc('*[tibet|pelem="drag"]', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemTPNode;

    //  Make sure to call the 'xctrls:Element' version of 'tagAttachDOM',
    //  since it does processing for this step (note that it's a mixin, so
    //  we can't 'callNextMethod' here and get its method). We make sure to
    //  use 'call' so that 'this' references get resolved properly.
    TP.xctrls.Element.tagAttachDOM.call(this, aRequest);

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.core.Node representing the rich text area. Note
    //  that this will both ensure a unique 'id' for the element and
    //  register it.
    elemTPNode = TP.tpnode(elem);

    elemTPNode.setAttribute('value', '0');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var barLength,
        thumbLength,

        percentage;

    //  TODO: Right now we assume a vertical orientation.

    barLength = TP.elementGetHeight(this.getNativeNode());
    thumbLength = TP.elementGetHeight(this.get('thumb'));

    percentage = this.getThumbPosition() / (barLength - thumbLength);

    return percentage;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('getThumbPosition',
function() {

    /**
     * @method getThumbPosition
     * @summary Returns the slidebar's 'thumb position' in pixels (relative to
     *     the overall slidebar).
     * @returns {Number} The receiver's thumb position.
     */

    var currentVal;

    //  TODO: Right now we assume a vertical orientation.

    currentVal = TP.elementGetStyleValueInPixels(this.get('thumb'), 'top');

    return currentVal;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('handleDOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @summary This method is invoked as the slidebar's buttons are clicked.
     *     It notifies any observers that the slidebar's value has changed.
     * @param {TP.sig.DOMClick} aSignal The signal that caused this handler to
     *     trip.
     */

    var side;

    if (aSignal.getTarget() === this.get('decrementButton')) {
        side = 'TP.TOP';
    }

    if (aSignal.getTarget() === this.get('incrementButton')) {
        side = 'TP.BOTTOM';
    }

    this.moveByIncrement(
                side,
                TP.ifEmpty(this.getAttribute('xctrls:increment'),
                            this.getType().get('defaultIncrement')));

    if (this.shouldSignalChange()) {
        this.changed('value', TP.UPDATE);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('handleDOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary This method is invoked as the slidebar is dragged. It notifies
     *     any observers that the slidebar's value has changed.
     * @param {TP.sig.DOMDragMove} aSignal The signal that caused this handler
     *     to trip.
     */

    if (this.shouldSignalChange()) {
        this.changed('value', TP.UPDATE);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('moveByIncrement',
function(aSide, incrementValue) {

    /**
     * @method moveByIncrement
     * @param {undefined} aSide
     * @param {undefined} incrementValue
     * @returns {TP.xctrls.slidebar} The receiver.
     * @abstract
     */

    var increment;

    //  TODO: Right now we assume a vertical orientation.

    increment = TP.elementGetPixelValue(this.get('thumb'),
                                        incrementValue,
                                        'top');

    if (aSide === 'TP.TOP') {
        increment = -increment;
    }

    this.setThumbPosition(this.getThumbPosition() + increment);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.slidebar} The receiver.
     */

    var barLength,
        thumbLength,

        absolutePixels;

    //  TODO: Right now we assume a vertical orientation.

    barLength = TP.elementGetHeight(this.getNativeNode());
    thumbLength = TP.elementGetHeight(this.get('thumb'));

    absolutePixels = (barLength - thumbLength) * aValue;

    this.setThumbPosition(absolutePixels);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('setThumbPosition',
function(pixelValue) {

    /**
     * @method setThumbPosition
     * @summary Sets the slidebar's 'thumb position' in pixels (relative to the
     *     overall slidebar).
     * @param {Number} pixelValue The value to set.
     * @returns {TP.xctrls.slidebar} The receiver.
     */

    var barLength,
        thumbLength,
        maxValue,

        newPosition;

    //  TODO: Right now we assume a vertical orientation.

    barLength = TP.elementGetHeight(this.getNativeNode());
    thumbLength = TP.elementGetHeight(this.get('thumb'));

    maxValue = barLength - thumbLength;

    newPosition = pixelValue.max(0);
    newPosition = newPosition.min(maxValue);

    TP.elementGetStyleObj(this.get('thumb')).top = newPosition + 'px';

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
