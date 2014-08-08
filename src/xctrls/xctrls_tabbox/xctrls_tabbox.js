//  ========================================================================
/*
NAME:   xctrls_tabbox.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.tabbox}
 * @synopsis Manages tabbox XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:tabbox');

TP.xctrls.tabbox.addTraitsFrom(TP.xctrls.Element,
                                TP.core.TemplatedNode);
TP.xctrls.tabbox.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.tabbox.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.tabbox.Inst.defineAttribute(
        'tabbar',
        {'value': TP.cpc('xctrls|tabbar', true)});

TP.xctrls.tabbox.Inst.defineAttribute(
        'panels',
        {'value': TP.cpc('xctrls|panel', false)});

TP.xctrls.tabbox.Inst.defineAttribute(
        'selectedPanel',
        {'value': TP.cpc('xctrls|panel[pclass|selected]', true)});

TP.xctrls.tabbox.Inst.defineAttribute(
        'panelWithValue',
        {'value': TP.xpc('./xctrls:panel/xctrls:value[text() = "{{1}}"]/..', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.tabbox.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    //  We return the tabbar's value here
    return TP.wrap(this.get('tabbar')).get('value');
});

//  ------------------------------------------------------------------------

TP.xctrls.tabbox.Inst.defineMethod('handleValueChange',
function(aSignal) {

    /**
     * @name handleValueChange
     * @synopsis This method is invoked as the value of the tabbar is changed.
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
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
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
