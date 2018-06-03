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
 * @type {TP.xctrls.SwitchableElement}
 * @summary Manages switchable XControls. This is a trait type that is meant to
 *     be 'traited' in to a concrete type.
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('SwitchableElement');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.xctrls.SwitchableElement.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  This type relies on the following instance attributes, which *must* be
//  defined somewhere on the type (or other traits) that this type is traited
//  into. Note that the definitions are commented out here on purpose as they're
//  really concrete-type specific.

/**
 * The collection of items that the receiver switches between.
 * @type {Element[]}
 */

//  TP.xctrls.switchable.Inst.defineAttribute('subitems');

/**
 * The currently selected item.
 * @type {TP.dom.UIElementNode}
 */

//  TP.xctrls.switchable.Inst.defineAttribute('selectedItem');

/**
 * The item with a particular value (used for switching). The value will be
 * supplied as a parameter at position 0.
 * @type {TP.dom.UIElementNode}
 */

//  TP.xctrls.switchable.Inst.defineAttribute('itemWithValue',

/**
 * The value of the currently selected item.
 * @type {String}
 */

//  TP.xctrls.switchable.Inst.defineAttribute('selectedValue');

//  ------------------------------------------------------------------------

TP.xctrls.SwitchableElement.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.get('selectedValue');
});

//  ------------------------------------------------------------------------

TP.xctrls.SwitchableElement.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver.
     * @returns {String} The value in string form.
     */

    return this.getDisplayValue();
});

//  ------------------------------------------------------------------------

TP.xctrls.SwitchableElement.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary This method is invoked as the 'value' (i.e. which panel is
     *     showing) of the switchable is changed.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.xctrls.SwitchableElement} The receiver.
     */

    this.setDisplayValue(aSignal.getValue());

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.SwitchableElement.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. You
     *     don't normally call this method directly, instead call setValue().
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.SwitchableElement} The receiver.
     */

    var oldItem,
        newItem;

    //  these could be an Array - if it's empty, set it to null
    oldItem = this.get('selectedItem');
    if (TP.isArray(oldItem) && TP.isEmpty(oldItem)) {
        oldItem = null;
    }

    newItem = this.get('itemWithValue', aValue);
    if (TP.isArray(newItem) && TP.isEmpty(newItem)) {
        newItem = null;
    }

    this.toggleSelectedItem(oldItem, newItem);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.SwitchableElement.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For a UI element this
     *     method will ensure any display formatters are invoked. NOTE that this
     *     method does not update the receiver's bound value if it's a bound
     *     control. In fact, this method is used in response to a change in the
     *     bound value to update the display value, so this method should avoid
     *     changes to the bound value to avoid recursions.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.xctrls.SwitchableElement} The receiver.
     */

    var oldValue,
        newValue,

        newItem,

        displayValue,

        flag;

    oldValue = this.getValue();

    newValue = this.produceValue('value', aValue);

    //  If the values are equal, there's nothing to do here - bail out.
    if (TP.equal(TP.str(oldValue), TP.str(newValue))) {
        return this;
    }

    //  If the item that matches the new value is disabled, then bail out.
    newItem = this.get('itemWithValue', newValue);

    if (TP.notValid(newItem) || TP.isEmpty(newItem)) {
        return this;
    }

    if (newItem.isDisabled()) {
        return this;
    }

    this.setDisplayValue(newValue);

    //  signal as needed

    displayValue = this.getDisplayValue();

    //  Sometimes the display value computed from the new value can be equal to
    //  the old value. If that's *not* the case, then propagate and set the
    //  bound value.
    if (!TP.equal(oldValue, displayValue)) {
        //  NB: Use this construct this way for better performance
        if (TP.notValid(flag = shouldSignal)) {
            flag = this.shouldSignalChange();
        }

        if (flag) {
            this.$changed('value', TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
