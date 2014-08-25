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
 * @type {TP.core.XMLRPCService}
 * @synopsis A TP.core.Service specific to making XMLRPC requests. This
 *     particular service is only available to browsers which support an
 *     XMLHttpRequest object.
 * @examples
 // construct a simple request, this one's for Flickr:
 *
 *     request = TP.sig.XMLRPCRequest.construct(); request.atPut('uri',
 *     'http://api.flickr.com/services/xmlrpc/');
 *     request.atPut('method','flickr.test.echo'); request.atPut('body',
 *     TP.hc('api_key', '67769adc70ee70b5f666167c9d3b11db', 'test','echo' ));
 *     request.defineMethod('handleRequestSucceeded', function(aResponse) {
 *
 *     TP.log(aResponse.getResult(), TP.LOG, arguments); });
 *
 *     // activate the request:
 *
 *     request.fire();
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.HTTPService.defineSubtype('XMLRPCService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  we'll respond to any TP.sig.XMLRPCRequest signals
TP.core.XMLRPCService.Type.defineAttribute('triggerSignals',
                                        'TP.sig.XMLRPCRequest');
TP.core.XMLRPCService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.XMLRPCService.Inst.defineMethod('rewriteRequestMIMEType',
function(aRequest) {

    /**
     * @name rewriteRequestMIMEType
     * @synopsis Returns the MIME type the request should be using. For an
     *     XML-RPC service this is always TP.XMLRPC_ENCODED.
     * @param {TP.sig.Request} aRequest The request being encoded.
     * @returns {Constant} A constant suitable for TP.httpEncode.
     */

    return TP.XMLRPC_ENCODED;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCService.Inst.defineMethod('rewriteRequestBody',
function(aRequest) {

    /**
     * @name rewriteRequestBody
     * @synopsis Encodes the request body for transmission. Processing in this
     *     method makes use of any 'mimetype' key in the request to determine an
     *     encoding to use. Supported encodings can be found in the
     *     TP.httpEncode primitive.
     * @param {TP.sig.XMLRPCRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {String} The string value of the encoded body content.
     */

    aRequest.atPut('bodyWantsXMLDeclaration', true);

    return aRequest.asXMLRPCMessage();
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCService.Inst.defineMethod('rewriteRequestHeaders',
function(aRequest) {

    /**
     * @name rewriteRequestHeaders
     * @synopsis Returns a TP.lang.Hash of HTTP headers appropriate for the
     *     service. XMLRPC requires Host and User-Agent headers to be defined so
     *     we ensure those are configured here.
     * @param {TP.sig.XMLRPCRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {TP.lang.Hash} The hash of HTTP headers.
     */

    var headers,
        url,
        host,
        port;

    headers = this.callNextMethod();
    headers.atPut('Content-Type', TP.XML_TEXT_ENCODED);

    //  User-Agent is added via the lower level httpCall so we skip that,
    //  but NOTE that User-Agent is required by the XMLRPC specification.

    //  XMLRPC also requires Host if at all possible
    url = TP.uc(aRequest.at('uri'));
    if (TP.isURI(url)) {
        //  have to watch out here for a couple of potential gotchas. First,
        //  we don't really want to use 'localhost', better to use 0.0.0.0
        //  and second we don't want to throw away the port number if it's
        //  not 80.
        port = url.get('port');
        port = port === 80 ? '' : ':' + port;

        host = url.get('host');
        host = host === 'localhost' ? '0.0.0.0' : host;

        headers.atPut('Host', host + port);
    }

    return headers;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCService.Inst.defineMethod('rewriteRequestVerb',
function(aRequest) {

    /**
     * @name rewriteRequestVerb
     * @synopsis Returns the HTTP verb to use for the request. For XMLRPC this
     *     always returns TP.HTTP_POST per the specification.
     * @param {TP.sig.XMLRPCRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     */

    return TP.HTTP_POST;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

