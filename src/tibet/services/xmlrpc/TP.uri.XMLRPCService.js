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
 * @type {TP.uri.XMLRPCService}
 * @summary A TP.core.Service specific to making XMLRPC requests. This
 *     particular service is only available to browsers which support an
 *     XMLHttpRequest object.
 * @examples
 *
 *     Construct a simple request, this one's for Flickr:
 *
 *     request = TP.sig.XMLRPCRequest.construct();
 *
 *     request.atPut('uri', 'http://api.flickr.com/services/xmlrpc/');
 *
 *     request.atPut('method','flickr.test.echo');
 *     request.atPut('body',
 *                      TP.hc('api_key', '67769adc70ee70b5f666167c9d3b11db',
 *                              'test','echo' ));
 *
 *     request.defineHandler('RequestSucceeded',
 *                              function(aResponse) {
 *                                  TP.info(aResponse.getResult());
 *                              });
 *
 *     Activate the request:
 *
 *     request.fire();
 */

//  ------------------------------------------------------------------------

TP.uri.HTTPService.defineSubtype('XMLRPCService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  we'll respond to any TP.sig.XMLRPCRequest signals
TP.uri.XMLRPCService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.XMLRPCRequest')));

TP.uri.XMLRPCService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.XMLRPCService.Inst.defineMethod('rewriteRequestMIMEType',
function(aRequest) {

    /**
     * @method rewriteRequestMIMEType
     * @summary Returns the MIME type the request should be using. For an
     *     XML-RPC service this is always TP.XMLRPC_ENCODED.
     * @param {TP.sig.Request} aRequest The request being encoded.
     * @returns {String} A constant suitable for TP.httpEncode.
     */

    return TP.XMLRPC_ENCODED;
});

//  ------------------------------------------------------------------------

TP.uri.XMLRPCService.Inst.defineMethod('rewriteRequestBody',
function(aRequest) {

    /**
     * @method rewriteRequestBody
     * @summary Encodes the request body for transmission. Processing in this
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

TP.uri.XMLRPCService.Inst.defineMethod('rewriteRequestHeaders',
function(aRequest) {

    /**
     * @method rewriteRequestHeaders
     * @summary Returns a TP.core.Hash of HTTP headers appropriate for the
     *     service. XMLRPC requires Host and User-Agent headers to be defined so
     *     we ensure those are configured here.
     * @param {TP.sig.XMLRPCRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {TP.core.Hash} The hash of HTTP headers.
     */

    var headers,
        url,
        hostname,
        port;

    headers = this.callNextMethod();
    headers.atPut('Content-Type', TP.XML_TEXT_ENCODED);

    //  User-Agent is added via the lower level httpCall so we skip that,
    //  but NOTE that User-Agent is required by the XMLRPC specification.

    //  XMLRPC also requires Host if at all possible
    url = TP.uc(aRequest.at('uri'));
    if (TP.isURI(url)) {
        //  have to watch out here for a couple of potential gotchas. First,
        //  we don't really want to use 'localhost', better to use 127.0.0.1
        //  and second we don't want to throw away the port number if it's
        //  not 80.
        port = url.get('port');
        port = port === 80 ? '' : ':' + port;

        hostname = url.get('hostname');
        hostname = hostname === 'localhost' ? '127.0.0.1' : hostname;

        headers.atPut('Host', hostname + port);
    }

    return headers;
});

//  ------------------------------------------------------------------------

TP.uri.XMLRPCService.Inst.defineMethod('rewriteRequestMethod',
function(aRequest) {

    /**
     * @method rewriteRequestMethod
     * @summary Returns the HTTP method to use for the request. For XMLRPC this
     *     always returns TP.HTTP_POST per the specification.
     * @param {TP.sig.XMLRPCRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {String} A TIBET HTTP method constant such as TP.HTTP_GET.
     */

    return TP.HTTP_POST;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
