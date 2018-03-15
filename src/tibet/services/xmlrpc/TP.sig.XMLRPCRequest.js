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
 * @type {TP.sig.XMLRPCRequest}
 * @summary Signal/request type for XMLRPC messaging. Noteable request keys
 *     include 'method', 'usenil', 'filter', and 'bodyarray' which define the
 *     procedure to call, whether a non-standard <nil/> should be used to
 *     represent null, which keys from an object represent parameters, and
 *     whether an array in the 'body' should be treated as a list or a single
 *     object.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.defineSubtype('XMLRPCRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.XMLRPCRequest.Type.defineAttribute('responseType', 'TP.sig.XMLRPCResponse');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.XMLRPCRequest.Type.defineMethod('formatParameter',
function(anObject, aRequest) {

    /**
     * @method formatParameter
     * @summary Returns a string representing the object in XMLRPC parameter
     *     form. The overall string will always contain an enclosing pair of
     *     <param><value> elements containing the object value in XMLRPC form.
     * @param {TP.sig.XMLRPCRequest} aRequest The request to format for.
     * @returns {String} A viable XMLRPC params block.
     */

    var request,
        filter,
        usenil,
        arr,
        node;

    request = aRequest;
    if (TP.isValid(request)) {
        filter = request.atIfInvalid('filter', 'unique_attributes');
        usenil = request.atIfInvalid('usenil', false);
    } else {
        filter = 'unique_attributes';
        usenil = false;
    }

    arr = TP.ac();
    arr.push('<param><value>');

    if (TP.notValid(anObject)) {
        arr.push(usenil ? TP.dom.XMLRPCNode.NIL : '');
    } else {
        if (TP.canInvoke(anObject, 'as')) {
            node = anObject.as('TP.dom.XMLRPCNode', filter, usenil);
        } else {
            node = TP.dom.XMLRPCNode.from(anObject, filter, usenil);
        }

        if (TP.notValid(node)) {
            arr.push(usenil ? TP.dom.XMLRPCNode.NIL : '');
        } else {
            arr.push(TP.str(node));
        }
    }

    arr.push('</value></param>');

    return arr.join('');
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.XMLRPCRequest.Inst.defineMethod('asXMLRPCBody',
function(aRequest) {

    /**
     * @method asXMLRPCBody
     * @summary Formats the receiver as the body (<params>) of an XMLRPC
     *     message. The resulting data can then be injected into a viable XMLRPC
     *     methodCall container for transmission.
     * @param {TP.sig.Request} aRequest The request to format for.
     * @returns {String} A viable XMLRPC params block in string form.
     */

    var request,
        body,
        bodyMsg;

    //  default for a request is the request itself
    request = aRequest || this;

    //  no body? no params
    body = this.at('body');
    if (TP.notValid(body)) {
        return '<params/>';
    }

    //  Array and other specialty payloads can do this on their own
    if (TP.canInvoke(body, 'asXMLRPCBody')) {
        return body.asXMLRPCBody(request);
    }

    //  Array is the only "list" we accept, all other types we treat as
    //  single objects (and hence single parameters) so just format it
    bodyMsg = TP.join(
            '<params>',
            this.getType().formatParameter(body, request),
            '</params>');

    return bodyMsg;
});

//  ------------------------------------------------------------------------

TP.sig.XMLRPCRequest.Inst.defineMethod('asXMLRPCMessage',
function() {

    /**
     * @method asXMLRPCMessage
     * @summary Returns the request object in XML format appropriate for use as
     *     an XMLRPC payload. This method is useful for processing XMLRPC
     *     requests as well as in leveraging other communication pathways to
     *     tunnel XMLRPC payloads (or for debugging).
     * @description Transforms the receiver into a viable XMLRPC message node.
     *     The 'usenil' key, if any, in the receiver's payload defines whether a
     *     non-standard <nil/> is used when a parameter value is null/undefined.
     * @returns {Node} A valid XMLRPC message payload.
     */

    var method,
        arr;

    //  common list mechanism for xml rpc
    method = this.atIfInvalid('method', 'system.listMethods');

    //  open our call block and inject the required methodName element
    arr = TP.ac('<methodCall><methodName>', method, '</methodName>');

    //  produce any params element necessary based on body slot content
    arr.push(TP.ifInvalid(this.asXMLRPCBody(this), '<params/>'));

    //  close off the method call block
    arr.push('</methodCall>');

    return TP.node(arr.join(''));
});

//  ========================================================================
//  ARRAY EXTENSIONS
//  ========================================================================

/**
 * @Because an Array might be either a single parameter or a list of parameters
 *     we implement a custom encoder for it here.
 */

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asXMLRPCBody',
function(aRequest) {

    /**
     * @method asXMLRPCBody
     * @summary Formats the receiver as the body (<params>) of an XMLRPC
     *     message. The resulting data can then be injected into a viable XMLRPC
     *     methodCall container for transmission. IFF the request includes a key
     *     of 'bodyarray' with a value of 'list' then the array is treated as a
     *     set of parameters rather than a single array to be encoded as one
     *     parameter.
     * @param {TP.sig.Request} aRequest The request to format for.
     * @returns {String} A viable XMLRPC params block in string form.
     */

    var request,
        param,
        list,
        arr,
        len,
        i;

    request = TP.request(aRequest);

    param = request.atIfInvalid('bodyarray', 'single');
    list = param === 'list' ? true : false;

    arr = TP.ac();

    //  XMLRPC can have from 0 to N <param><value> entries whose content is
    //  the parameter value. This creates a bit of an issue around Array...
    //  do we use the Array as a single parameter or as a list of them?
    if (list) {
        len = this.getSize();
        if (len > 0) {
            arr.push('<params>');
            for (i = 0; i < len; i++) {
                arr.push(TP.sig.XMLRPCRequest.formatParameter(this.at(i),
                                                            request));
            }
            arr.push('</params>');
        } else {
            arr.push('<params/>');
        }
    } else {
        arr.push('<params>',
                    TP.sig.XMLRPCRequest.formatParameter(this, request),
                    '</params>');
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
