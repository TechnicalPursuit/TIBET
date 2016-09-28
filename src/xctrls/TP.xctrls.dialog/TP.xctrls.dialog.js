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
 * @summary Manages dialog XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:dialog');

TP.xctrls.dialog.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

TP.xctrls.dialog.Type.defineAttribute('opaqueSignalNames', null);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> *[tibet|pelem="body"]', TP.hc('shouldCollapse', true))});

TP.xctrls.dialog.Inst.defineAttribute(
        'curtain',
        {value: TP.xpc('//*[@id="systemCurtain"]', TP.hc('shouldCollapse', true)).
            set('fallbackWith',
                function(tpTarget) {
                    var docBody,
                        curtainElem;

                    docBody = tpTarget.getDocument().getBody();

                    if (TP.isValid(docBody)) {

                        curtainElem = TP.elem(
                            '<xctrls:curtain id="systemCurtain"/>');

                        return tpTarget.insertContent(
                                curtainElem,
                                TP.BEFORE_BEGIN,
                                TP.hc('doc', tpTarget.getNativeDocument()));
                    }
                })});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineHandler('DismissDialog',
function(aSignal) {

    /**
     * @method handleDismissDialog
     * @summary Handles notifications of when the receiver is to be dismissed
     * (i.e. hidden).
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.dialog} The receiver.
     */

    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setAttrHidden',
function(beClosed) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beClosed Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var curtainTPElem;

    if (this.getAttribute('modal') === 'true') {
        if (TP.isValid(curtainTPElem = this.get('curtain'))) {
            curtainTPElem.setAttribute('hidden', beClosed);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.sherpa.dialog} The receiver.
     */

    this.get('body').setContent(aContentObject, aRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setTitle',
function(aTitle) {

    /**
     * @method setTitle
     * @summary Sets the title of the receiver.
     * @param {String} aTitle The text content to set the title to.
     * @returns {TP.sherpa.dialog} The receiver.
     */

    this.get('header').setTextContent(aTitle);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.defineSubtype('DismissDialog');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
