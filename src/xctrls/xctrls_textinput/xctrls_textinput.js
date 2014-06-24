//  ========================================================================
/*
NAME:   xctrls_textinput.js
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
 * @type {TP.xctrls.textinput}
 * @synopsis Manages textinput XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:textinput');

TP.xctrls.textinput.addTraitsFrom(TP.xctrls.Element,
                                    TP.core.TemplatedNode);
TP.xctrls.textinput.Type.resolveTrait('tshCompile', TP.core.TemplatedNode);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.textinput.Inst.defineAttribute(
        'valuePElem',
        {'value': TP.cpc('*[tibet|pelem="value"]', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.textinput.Inst.defineMethod('blur',
function() {

    /**
     * @name blur
     * @returns {TP.xctrls.textinput} The receiver.
     * @abtract Blurs the receiver for keyboard input.
     * @todo
     */

    var valuePElem;

    this.callNextMethod();

    valuePElem = this.get('valuePElem');
    valuePElem.blur();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.textinput.Inst.defineMethod('focus',
function() {

    /**
     * @name focus
     * @returns {TP.xctrls.textinput} The receiver.
     * @abtract Focuses the receiver for keyboard input.
     * @todo
     */

    var valuePElem;

    this.callNextMethod();

    valuePElem = this.get('valuePElem');
    valuePElem.focus();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.textinput.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var valuePElem;

    valuePElem = this.get('valuePElem');

    return valuePElem.value;
});

//  ------------------------------------------------------------------------

TP.xctrls.textinput.Inst.defineMethod('setDisabled',
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

TP.xctrls.textinput.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.textinput} The receiver.
     */

    var valuePElem;

    valuePElem = this.get('valuePElem');

    valuePElem.value = aValue;

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
