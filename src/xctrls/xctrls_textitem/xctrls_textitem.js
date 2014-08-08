//  ========================================================================
/*
NAME:   xctrls_textitem.js
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
 * @type {TP.xctrls.textitem}
 * @synopsis Manages textitem XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:textitem');

TP.xctrls.textitem.addTraitsFrom(TP.xctrls.Element,
                                    TP.core.TemplatedNode);
TP.xctrls.textitem.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.textitem.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.textitem.Inst.defineMethod('handleDOMClick',
function(aSignal) {

    /**
     * @name handleDOMClick
     * @synopsis This method is invoked as the textitem is clicked.
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
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
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
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
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
     * @name toggleValue
     * @synopsis Toggles the value to the inverse of its current value.
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
