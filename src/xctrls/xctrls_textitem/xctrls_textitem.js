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
 * @type {TP.xctrls.textitem}
 * @summary Manages textitem XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:textitem');

TP.xctrls.textitem.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.textitem.Inst.defineMethod('handleDOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @summary This method is invoked as the textitem is clicked.
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

TP.xctrls.textitem.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var textValue;

    if (this.hasAttribute('pclass:selected')) {
        //  Grab the value from the 'xctrls:value' element under ourself
        textValue = this.get('string(./xctrls:value)');

        return textValue;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.textitem.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.textitem} The receiver.
     */

    var textValue;

    //  Grab the value from the 'xctrls:value' element under ourself
    textValue = this.get('string(./xctrls:value)');

    if (TP.equal(textValue, aValue)) {
        this.setAttribute('pclass:selected', 'true');
    } else {
        this.removeAttribute('pclass:selected');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.textitem.Inst.defineMethod('toggleValue',
function() {

    /**
     * @method toggleValue
     * @summary Toggles the value to the inverse of its current value.
     * @returns {TP.xctrls.textitem} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getDisplayValue();

    //  This is simply a matter of setting the value to what's in our
    //  'xctrls:value' element, depending on whether we're already selected
    //  or not.
    if (this.hasAttribute('pclass:selected')) {
        //  Already selected? Set our value to null.
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
