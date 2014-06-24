//  ========================================================================
/*
NAME:   TP.sig.SOAPResponse.js
AUTH:   Scott Shattuck (ss)
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
 * @type {TP.sig.SOAPResponse}
 * @synopsis Provides a general purpose SOAP response wrapper.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.defineSubtype('SOAPResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.SOAPResponse.Inst.defineMethod('getFaultActor',
function() {

    /**
     * @name getFaultActor
     * @synopsis Returns the SOAP fault actor, a SOAP-specific identifier of the
     *     service/action which failed.
     * @returns {String} A fault actor name.
     */

    var xml,
        tags;

    xml = this.getResponseXML();
    if (TP.notValid(xml)) {
        return;
    }

    tags = TP.nodeGetElementsByTagName(xml, 'faultactor');
    if (TP.notEmpty(tags)) {
        return TP.nodeGetTextContent(tags.at(0));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SOAPResponse.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @name getFaultCode
     * @synopsis Returns the SOAP fault code if any.
     * @returns {String} A fault code.
     */

    var xml,
        tags;

    xml = this.getResponseXML();
    if (TP.notValid(xml)) {
        return this.callNextMethod();
    }

    tags = TP.nodeGetElementsByTagName(xml, 'faultcode');
    if (TP.notEmpty(tags)) {
        return TP.nodeGetTextContent(tags.at(0));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SOAPResponse.Inst.defineMethod('getFaultDetails',
function() {

    /**
     * @name getFaultDetails
     * @synopsis Returns and SOAP fault details, a SOAP-specific long-text
     *     description of what went wrong.
     * @returns {String} Fault details.
     */

    var xml,
        tags;

    xml = this.getResponseXML();
    if (TP.notValid(xml)) {
        return;
    }

    tags = TP.nodeGetElementsByTagName(xml, 'details');
    if (TP.notEmpty(tags)) {
        return TP.nodeGetTextContent(tags.at(0));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SOAPResponse.Inst.defineMethod('getFaultText',
function() {

    /**
     * @name getFaultText
     * @synopsis Returns the SOAPfault message string if any.
     * @returns {String} A fault message string.
     */

    var xml,
        tags;

    xml = this.getResponseXML();
    if (TP.notValid(xml)) {
        return this.callNextMethod();
    }

    tags = TP.nodeGetElementsByTagName(xml, 'faultstring');
    if (TP.notEmpty(tags)) {
        return TP.nodeGetTextContent(tags.at(0));
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
