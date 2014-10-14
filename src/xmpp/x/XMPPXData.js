//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.xmpp.XData}
 * @synopsis A wrapper for the X_DATA namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.XPayload.defineSubtype('XData');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Form types
TP.xmpp.XData.Type.defineConstant('FORM', 'form');
TP.xmpp.XData.Type.defineConstant('SUBMIT', 'submit');
TP.xmpp.XData.Type.defineConstant('CANCEL', 'cancel');
TP.xmpp.XData.Type.defineConstant('RESULT', 'result');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.XData.set('namespace', TP.xmpp.XMLNS.SASL);
TP.xmpp.XData.set('childTags', TP.ac('title', 'instructions', 'field'));

TP.xmpp.XData.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.XData.Inst.defineMethod('addFormItem',
function(aNode) {

    /**
     * @name addFormItem
     * @synopsis Adds a form item to the receiver.
     * @param {TP.xmpp.XDataField} aNode A data field to add to this data
     *     packet.
     * @returns {TP.xmpp.XData} The receiver.
     */

    if (!TP.isKindOf(aNode, TP.xmpp.XDataField)) {
        return this.raise('TP.sig.InvalidXMPPXDataField', aNode);
    }

    //  the data field gets added at the primitive level
    TP.nodeAppendChild(this.getNativeNode(),
                        TP.nodeCloneNode(aNode.getNativeNode(), true));

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.XData.Inst.defineMethod('setFormType',
function(aFormType) {

    /**
     * @name setFormType
     * @synopsis Sets the form type of the data packet.
     * @param {String} aFormType The form type of this data packet. This should
     *     be one of the following constant values: TP.xmpp.XData.FORM
     *     TP.xmpp.XData.SUBMIT TP.xmpp.XData.CANCEL TP.xmpp.XData.RESULT.
     * @returns {TP.xmpp.XData} The receiver.
     */

    this.setAttribute('type', aFormType);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
