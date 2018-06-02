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
 * @type {TP.sig.SOAPResponse}
 * @summary Provides a general purpose SOAP response wrapper.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.defineSubtype('SOAPResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.SOAPResponse.Inst.defineMethod('getFaultActor',
function() {

    /**
     * @method getFaultActor
     * @summary Returns the SOAP fault actor, a SOAP-specific identifier of the
     *     service/action which failed.
     * @returns {String|undefined} A fault actor name.
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
     * @method getFaultCode
     * @summary Returns the SOAP fault code if any.
     * @returns {String|undefined} A fault code.
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
     * @method getFaultDetails
     * @summary Returns and SOAP fault details, a SOAP-specific long-text
     *     description of what went wrong.
     * @returns {String|undefined} Fault details.
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
     * @method getFaultText
     * @summary Returns the SOAPfault message string if any.
     * @returns {String|undefined} A fault message string.
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
