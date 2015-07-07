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
 * @type {TP.xctrls.accordionbox}
 * @summary Manages accordionbox XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:accordionbox');

TP.xctrls.accordionbox.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

TP.xctrls.accordionbox.Type.resolveTraits(
        TP.ac('cmdRunContent', 'tagCompile'),
        TP.xctrls.Element);

TP.xctrls.accordionbox.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.accordionbox.Inst.defineAttribute(
        'subitems',
        {value: TP.cpc('xctrls|accordionitem', TP.hc('shouldCollapse', false))});

TP.xctrls.accordionbox.Inst.defineAttribute(
        'selectedItem',
        {value: TP.cpc('xctrls|accordionitem[pclass|selected]', TP.hc('shouldCollapse', true))});

TP.xctrls.accordionbox.Inst.defineAttribute(
        'itemWithValue',
        {value:
            TP.xpc('./xctrls:accordionitem/xctrls:value[text() = "{{1}}"]/..', TP.hc('shouldCollapse', true))});

TP.xctrls.accordionbox.Inst.defineAttribute(
        'selectedValue',
        {value:
            TP.xpc('string(./xctrls:accordionitem' +
                        '[@pclass:selected = "true"]/xctrls:value)', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.accordionbox.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.get('selectedValue');
});

//  ------------------------------------------------------------------------

TP.xctrls.accordionbox.Inst.defineMethod('handleValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary This method is invoked as the value of the tabbar is changed.
     *     This is due to a handler set up in our generated markup.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     */

    //  The value of the tabbar will have already been changed to the new
    //  value, and that's what our get('value') gets here.
    this.toggleSelectedItem(
                this.get('selectedItem'),
                this.get('itemWithValue', this.get('value')));

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.accordionbox.Inst.defineMethod('handleDOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @summary This method is invoked as each tabitem is clicked.
     * @param {TP.sig.DOMClick} aSignal The signal that caused this handler to
     *     trip.
     */

    var target,
        clickedValue;

    if (this.get('disabled') === true) {
        return;
    }

    //  Grab the signal target
    target = aSignal.getTarget();

    //  If the signal target wasn't the 'xctrls:accordionitem', then we need
    //  to 'search upward' through the ancestor chain to get it.
    if (TP.name(target) !== 'xctrls:accordionitem') {
        if (TP.notValid(
            target = TP.wrap(target).get('ancestor::xctrls:accordionitem'))) {
            return;
        }

        //  If we get a valid result, its going to be as an Array
        target = target.first();
    }

    //  Make sure we have a valid target element
    if (!TP.isElement(target)) {
        return;
    }

    //  Grab the value from the 'xctrls:value' element under the item
    clickedValue = TP.wrap(target).get('string(./xctrls:value)');

    if (TP.isValid(clickedValue)) {
        this.set('value', clickedValue);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.accordionbox.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.accordionbox} The receiver.
     */

    //  NB: This will cause the ValueChange handler above to be triggered,
    //  since we're observing the tabbar for ValueChange. That handler
    //  visually manipulates the items.

    this.toggleSelectedItem(this.get('selectedItem'),
                            this.get('itemWithValue', aValue));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
