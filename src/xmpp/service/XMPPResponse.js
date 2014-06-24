//  ========================================================================
/*
NAME:   TP.sig.XMPPResponse.js
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
//  ------------------------------------------------------------------------

/**
 * @type {TP.sig.XMPPResponse}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.sig.URIResponse.defineSubtype('XMPPResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.XMPPResponse.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @name getFaultCode
     * @synopsis Returns the fault code if any.
     * @returns {String} A fault code.
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
     * @name getFaultText
     * @synopsis Returns the fault message string if any.
     * @returns {String} A fault message string.
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
