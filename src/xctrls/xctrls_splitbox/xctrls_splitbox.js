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
 * @type {TP.xctrls.splitbox}
 * @summary Manages splitbox XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:splitbox');

TP.xctrls.splitbox.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

TP.xctrls.splitbox.Type.resolveTrait('cmdRunContent', TP.xctrls.Element);
TP.xctrls.splitbox.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.xctrls.splitbox.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.splitbox.finalizeTraits();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.splitbox.Inst.defineAttribute(
        'splitbar',
        {value: TP.cpc('xctrls|splitbar', true)});

TP.xctrls.splitbox.Inst.defineAttribute(
        'beforePanel',
        {value: TP.xpc('./xctrls:panel[1]', true)});

TP.xctrls.splitbox.Inst.defineAttribute(
        'afterPanel',
        {value: TP.xpc('./xctrls:panel[2]', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.splitbox.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    //  We return the splitbar's value here
    return TP.wrap(this.get('splitbar')).get('value');
});

//  ------------------------------------------------------------------------

TP.xctrls.splitbox.Inst.defineMethod('handleValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary This method is invoked as the value of the splitbar is changed.
     *     This is due to a handler set up in our generated markup.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     */

    var bar,
        beforePanel,
        afterPanel,

        ourSize,
        barPosition;

    //  We need to resize the panels to match our bar's position
    bar = this.get('splitbar');

    beforePanel = this.get('beforePanel');
    afterPanel = this.get('afterPanel');

    //  TODO: Right now we assume a vertical orientation.

    ourSize = this.getHeight();
    barPosition = TP.wrap(bar).getOffsetPoint().getY();

    TP.elementGetStyleObj(beforePanel).height = barPosition + 'px';

    TP.elementGetStyleObj(afterPanel).top = barPosition + 'px';

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.splitbox.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.splitbox} The receiver.
     */

    //  NB: This will cause the ValueChange handler above to be triggered,
    //  since we're observing the splitbar for ValueChange. That handler
    //  visually manipulates the panels.

    TP.wrap(this.get('splitbar')).set('value', aValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
