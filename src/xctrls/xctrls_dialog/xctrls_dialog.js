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
 * @type {TP.xctrls.dialog}
 * @synopsis Manages dialog XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:dialog');

TP.xctrls.dialog.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

TP.xctrls.dialog.Type.resolveTrait('cmdRunContent', TP.xctrls.Element);
TP.xctrls.dialog.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.xctrls.dialog.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.dialog.finalizeTraits();

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
                function(windowContext) {
                    var curtainElem,
                        docBody;

                    curtainElem = TP.elem('<xctrls:curtain xmlns:xctrls="' +
                                            TP.w3.Xmlns.XCONTROLS +
                                            '"/>');

                    if (TP.isValid(docBody =
                            TP.wrap(TP.documentGetBody(windowContext)))) {
                        return TP.unwrap(docBody.insertContent(
                                            curtainElem,
                                            TP.BEFORE_END,
                                            TP.hc('doc', windowContext)));
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

TP.xctrls.dialog.Inst.defineMethod('setAttrClosed',
function(beClosed) {

    /**
     * @name setAttrClosed
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
