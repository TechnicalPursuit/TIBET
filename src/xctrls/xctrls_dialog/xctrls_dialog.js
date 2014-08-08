//  ========================================================================
/*
NAME:   xctrls_dialog.js
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
 * @type {TP.xctrls.dialog}
 * @synopsis Manages dialog XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:dialog');

TP.xctrls.dialog.addTraitsFrom(TP.xctrls.Element,
                                TP.core.TemplatedNode);
TP.xctrls.dialog.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.dialog.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineAttribute(
        'body',
        {'value': TP.cpc('*[tibet|pelem="body"]', true)});

TP.xctrls.dialog.Inst.defineAttribute(
        'curtain',
        {'value': TP.xpc('//xctrls:curtain[1]', true).
            set('fallbackWith',
                function(aContext) {
                    var curtainElem,
                        docBody;

                    curtainElem = TP.elem('<xctrls:curtain xmlns:xctrls="' +
                                            TP.w3.Xmlns.XCONTROLS +
                                            '"/>');

                    if (TP.isValid(docBody =
                                    TP.wrap(TP.documentGetBody(aContext)))) {
                        return TP.unwrap(docBody.insertContent(
                                            curtainElem,
                                            TP.BEFORE_END,
                                            TP.hc('doc', aContext)));
                    }
                })});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return TP.wrap(this.get('body')).getContentText();
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setClosed',
function(beClosed) {

    /**
     * @name setClosed
     * @synopsis The setter for the receiver's closed state.
     * @param {Boolean} beClosed Whether or not the receiver is in a closed
     *     state.
     * @returns {Boolean} Whether the receiver's state is closed.
     */

    var curtainTPElem;

    if (this.getAttribute('modal') === 'true') {
        if (TP.isValid(curtainTPElem = TP.wrap(this.get('curtain')))) {
            curtainTPElem.set('hidden', beClosed);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.dialog} The receiver.
     */

    TP.wrap(this.get('body')).setContent(aValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
