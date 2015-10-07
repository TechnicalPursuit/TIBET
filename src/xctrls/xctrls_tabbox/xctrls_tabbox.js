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
 * @type {TP.xctrls.tabbox}
 * @summary Manages tabbox XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:tabbox');

TP.xctrls.tabbox.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.tabbox.Inst.defineAttribute(
        'tabbar',
        {value: TP.cpc('xctrls|tabbar', TP.hc('shouldCollapse', true))});

TP.xctrls.tabbox.Inst.defineAttribute(
        'panels',
        {value: TP.cpc('xctrls|panel', TP.hc('shouldCollapse', false))});

TP.xctrls.tabbox.Inst.defineAttribute(
        'selectedPanel',
        {value: TP.cpc('xctrls|panel[pclass|selected]', TP.hc('shouldCollapse', true))});

TP.xctrls.tabbox.Inst.defineAttribute(
        'panelWithValue',
        {value: TP.xpc('./xctrls:panel/xctrls:value[text() = "{{0}}"]/..', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.tabbox.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    //  We return the tabbar's value here
    return TP.wrap(this.get('tabbar')).get('value');
});

//  ------------------------------------------------------------------------

TP.xctrls.tabbox.Inst.defineHandler('ValueChange',
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
                this.get('selectedPanel'),
                this.get('panelWithValue', this.get('value')));

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.tabbox.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.tabbox} The receiver.
     */

    //  NB: This will cause the ValueChange handler above to be triggered,
    //  since we're observing the tabbar for ValueChange. That handler
    //  visually manipulates the panels.

    TP.wrap(this.get('tabbar')).set('value', aValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
