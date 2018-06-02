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
 * @type {TP.uri.JSONPURLHandler}
 * @summary Supports operations specific to loading, saving, or deleting jsonp:
 *     URL content. For these types of URLs a 'load' operation is typically all
 *     that's reasonable.
 */

//  ------------------------------------------------------------------------

TP.uri.URIHandler.defineSubtype('JSONPURLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.JSONPURLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content and returns it on request.
     * @description This method performs the actual work of querying a JSONP URL
     *     for its content. Two notable parameters from the request are passed
     *     on to the JSON call:
     *
     *     'callbackFunc' - The name of the Function that the JSON call will
     *     put the result data into and which we then use to populate the result
     *     of the request. 'callbackName' - The name of the actual parameter
     *     that defines the callback function name. Google & Yahoo use the name
     *     'callback', but other systems might customize this. This defaults to
     *     'callback'.
     * @param {TP.uri.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response|undefined} A valid response object for the request.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidRequest
     */

    var request,
        response,

        uriparams,
        queryDict,

        requestParams,
        loadRequest;

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        this.raise('TP.sig.InvalidURI');

        return;
    }

    request = TP.request(aRequest);
    response = request.getResponse();

    //  We take values for XMPP requests from either the request or the URI.

    //  Grab any parameters that were supplied on the request (as part of
    //  a command line, etc.)
    uriparams = request.at('uriparams');
    if (TP.notValid(uriparams)) {
        uriparams = TP.hc();
    }

    //  Grab any parameters that were supplied as part of the URI itself.
    queryDict = targetURI.get('queryDict');
    if (TP.notValid(queryDict)) {
        queryDict = TP.hc();
    }

    queryDict.perform(
            function(kvPair) {
                uriparams.atPutIfAbsent(kvPair.first(), kvPair.last());
            });

    requestParams = TP.hc('uri', targetURI, 'uriparams', uriparams);

    //  Construct and initialize an TP.sig.JSONRequest using the params as a
    //  parameter.
    loadRequest = TP.sig.JSONRequest.construct(requestParams);

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the get item request finishes and
    //  to be 'dependent' on the success/failure of the get item request.
    request.andJoinChild(loadRequest);

    //  Fire the load request to trigger service operation.
    loadRequest.fire();

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(loadRequest);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.JSONPURLHandler.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes the target URL. This is an unsupported operation for a
     *     JSONP URL. NOTE: 'jsonp://' URIs don't implement this functionality.
     * @param {TP.uri.URI} targetURI The URI to delete. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response;

    this.raise('TP.sig.UnsupportedOperation');

    request = TP.request(aRequest);
    response = request.getResponse(false);
    request.fail();

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.JSONPURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Attempts to save data using standard TIBET save primitives to
     *     the URI (after rewriting) that is provided. NOTE: 'jsonp://' URIs
     *     don't implement this functionality.
     * @param {TP.uri.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response;

    this.raise('TP.sig.UnsupportedOperation');

    request = TP.request(aRequest);
    response = request.getResponse(false);
    request.fail();

    return response;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
