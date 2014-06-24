//  ========================================================================
/*
NAME:   TP.xmpp.XData.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
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
        return this.raise('TP.sig.InvalidXMPPXDataField', arguments, aNode);
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
