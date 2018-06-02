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
 * @type {TP.sig.XMPPResponse}
 */

//  ------------------------------------------------------------------------

TP.sig.URIResponse.defineSubtype('XMPPResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.XMPPResponse.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @method getFaultCode
     * @summary Returns the fault code if any.
     * @returns {String|undefined} A fault code.
     */

    var resultTPElem,
        errorTPElem;

    if (TP.isValid(resultTPElem = this.getResult()) &&
        resultTPElem.isError()) {
        errorTPElem = resultTPElem.getErrorElement();

        return errorTPElem.getErrorCondition().getLocalName();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.XMPPResponse.Inst.defineMethod('getFaultText',
function() {

    /**
     * @method getFaultText
     * @summary Returns the fault message string if any.
     * @returns {String|undefined} A fault message string.
     */

    var resultTPElem,
        errorTPElem;

    if (TP.isValid(resultTPElem = this.getResult()) &&
        resultTPElem.isError()) {
        errorTPElem = resultTPElem.getErrorElement();

        return errorTPElem.getErrorText();
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
