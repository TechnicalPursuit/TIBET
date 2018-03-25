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
 * @type {TP.sig.XMLRPCResponse}
 * @summary Provides a general purpose XMLRPC response wrapper.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.defineSubtype('XMLRPCResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.XMLRPCResponse.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @method getFaultCode
     * @summary Returns the XML-RPC fault code if any.
     * @returns {Number} A fault code.
     */

    var xml,
        tags;

    xml = this.getResponseXML();
    if (TP.notValid(xml)) {
        return this.callNextMethod();
    }

    tags = TP.nodeGetElementsByTagName(xml, 'fault');
    if (TP.notEmpty(tags)) {
        tags = TP.nodeGetElementsByTagName(tags.at(0), 'int');
        if (TP.notEmpty(tags)) {
            return TP.nc(TP.nodeGetTextContent(tags.at(0)));
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.XMLRPCResponse.Inst.defineMethod('getFaultText',
function() {

    /**
     * @method getFaultText
     * @summary Returns the XML-RPC fault message string if any.
     * @returns {String} A fault message string.
     */

    var xml,
        tags;

    xml = this.getResponseXML();
    if (TP.notValid(xml)) {
        return this.callNextMethod();
    }

    tags = TP.nodeGetElementsByTagName(xml, 'fault');
    if (TP.notEmpty(tags)) {
        tags = TP.nodeGetElementsByTagName(tags.at(0), 'string');
        if (TP.notEmpty(tags)) {
            return TP.sc(TP.nodeGetTextContent(tags.at(0)));
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.XMLRPCResponse.Inst.defineMethod('getResultObject',
function() {

    /**
     * @method getResultObject
     * @summary Returns the response content in JavaScript object form. If the
     *     receiver represents a failed request then the content of the fault
     *     object is returned.
     * @returns {Object}
     */

    var res,
        node,
        tags;

    res = this.getResponseXML();
    if (TP.notValid(res)) {
        return;
    }

    if (this.didFail()) {
        tags = TP.nodeGetElementsByTagName(res, 'fault');
        if (TP.notEmpty(tags)) {
            node = TP.nodeGetChildElementAt(tags.at(0), 0);
        }
    } else {
        //  note that this should work since there can be only one return
        //  value, contained in a param tag
        tags = TP.nodeGetElementsByTagName(res, 'param');
        if (TP.notEmpty(tags)) {
            node = TP.nodeGetChildElementAt(tags.at(0), 0);
        }
    }

    return TP.dom.XMLRPCNode.objectFromNode(node);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
