//  ========================================================================
/*
NAME:   xctrls_checkitem.js
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
 * @type {TP.xctrls.checkitem}
 * @synopsis Manages checkitem XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:checkitem');

TP.xctrls.checkitem.addTraitsFrom(TP.xctrls.Element,
                                    TP.core.TemplatedNode);
TP.xctrls.checkitem.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.checkitem.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.checkitem.Inst.defineAttribute(
        'valuePElem',
        {'value': TP.cpc('*[tibet|pelem="value"]', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.checkitem.Inst.defineMethod('handleDOMClick',
function(aSignal) {

    /**
     * @name handleDOMClick
     * @synopsis This method is invoked as the checkitem is clicked
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

TP.xctrls.checkitem.Inst.defineMethod('getDisplayValue',
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

TP.xctrls.checkitem.Inst.defineMethod('setDisabled',
function(beDisabled) {

    /**
     * @name setDisabled
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

TP.xctrls.checkitem.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.checkitem} The receiver.
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

TP.xctrls.checkitem.Inst.defineMethod('toggleValue',
function() {

    /**
     * @name toggleValue
     * @synopsis Toggles the value to the inverse of its current value.
     * @returns {TP.xctrls.checkitem} The receiver.
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
