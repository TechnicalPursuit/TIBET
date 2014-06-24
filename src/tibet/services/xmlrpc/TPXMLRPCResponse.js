//  ========================================================================
/*
NAME:   TP.sig.XMLRPCResponse.js
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
 * @type {TP.sig.XMLRPCResponse}
 * @synopsis Provides a general purpose XMLRPC response wrapper.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.defineSubtype('XMLRPCResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.XMLRPCResponse.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @name getFaultCode
     * @synopsis Returns the XML-RPC fault code if any.
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
     * @name getFaultText
     * @synopsis Returns the XML-RPC fault message string if any.
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
     * @name getResultObject
     * @synopsis Returns the response content in JavaScript object form. If the
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

    return TP.core.XMLRPCNode.objectFromNode(node);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
