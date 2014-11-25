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
 * @type {TP.xctrls.radioitem}
 * @synopsis Manages radioitem XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:radioitem');

TP.xctrls.radioitem.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

TP.xctrls.radioitem.Type.resolveTrait('cmdRunContent', TP.xctrls.Element);
TP.xctrls.radioitem.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.xctrls.radioitem.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.radioitem.finalizeTraits();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineAttribute(
        'valuePElem',
        {'value': TP.cpc('*[tibet|pelem="value"]', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineMethod('handleDOMClick',
function(aSignal) {

    /**
     * @name handleDOMClick
     * @synopsis This method is invoked as the radioitem is clicked.
     * @param {TP.sig.DOMClick} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.get('disabled') === true) {
        return;
    }

    this.toggleValue();

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var textValue;

    if (this.hasAttribute('pclass:checked')) {
        //  Grab the value from the 'xctrls:value' element under ourself
        textValue = this.get('string(./xctrls:value)');

        return textValue;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineMethod('setAttrDisabled',
function(beDisabled) {

    /**
     * @name setAttrDisabled
     * @synopsis The setter for the receiver's disabled state.
     * @param {Boolean} beDisabled Whether or not the receiver is in a disabled
     *     state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    var valuePElem;

    valuePElem = this.get('valuePElem');

    if (TP.isTrue(beDisabled)) {
        valuePElem.setAttribute('disabled', true);
        valuePElem.setAttribute('pclass:disabled', 'true');
    } else {
        valuePElem.removeAttribute('disabled');
        valuePElem.removeAttribute('pclass:disabled');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.radioitem} The receiver.
     */

    var textValue;

    //  Grab the value from the 'xctrls:value' element under ourself
    textValue = this.get('string(./xctrls:value)');

    if (TP.equal(textValue, aValue)) {
        this.setAttribute('pclass:checked', 'true');
    } else {
        this.removeAttribute('pclass:checked');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineMethod('toggleValue',
function() {

    /**
     * @name toggleValue
     * @synopsis Toggles the value to the inverse of its current value.
     * @returns {TP.xctrls.radioitem} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getDisplayValue();

    //  This is simply a matter of setting the value to what's in our
    //  'xctrls:value' element, depending on whether we're already checked
    //  or not.
    if (this.hasAttribute('pclass:checked')) {
        //  Already checked? Set our value to null.
        newVal = null;
    } else {
        //  Otherwise set our value to the value of what's in our
        //  'xctrls:value' element.

        //  Grab the value from the 'xctrls:value' element under ourself
        newVal = this.get('string(./xctrls:value)');
    }

    this.set('value', newVal);

    if (this.shouldSignalChange()) {
        this.changed('value', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
