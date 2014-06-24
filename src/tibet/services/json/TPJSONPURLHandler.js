//  ========================================================================
/*
NAME:   TP.core.JSONPURLHandler.js
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
 * @type {TP.core.JSONPURLHandler}
 * @synopsis Supports operations specific to loading, saving, or deleting jsonp:
 *     URL content. For these types of URLs a 'load' operation is typically all
 *     that's reasonable.
 */

//  ------------------------------------------------------------------------

TP.core.URIHandler.defineSubtype('JSONPURLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.JSONPURLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @name load
     * @synopsis Loads URI data content and returns it on request.
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
     * @param {TP.core.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @raise TP.sig.InvalidURI, TP.sig.InvalidRequest
     * @todo
     */

    var request,
        response,

        uriparams,
        queryDict,

        requestParams,
        loadRequest;

    TP.debug('break.uri_load');

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        this.raise('TP.sig.InvalidURI', arguments);

        return;
    }

    request = TP.request(aRequest);
    response = request.constructResponse();

    //  We take values for XMPP requests from either the request or the URI.

    //  Grab any parameters that were supplied on the request (as part of
    //  a command line, etc.)
    uriparams = TP.ifInvalid(request.at('uriparams'), TP.hc());

    //  Grab any parameters that were supplied as part of the URI itself.
    queryDict = TP.ifInvalid(targetURI.get('queryDict'), TP.hc());
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

TP.core.JSONPURLHandler.Type.defineMethod('nuke',
function(targetURI, aRequest) {

    /**
     * @name nuke
     * @synopsis Deletes the target URL. This is an unsupported operation for a
     *     JSONP URL. NOTE: 'jsonp://' URIs don't implement this functionality.
     * @param {TP.core.URI} targetURI The URI to nuke. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        response;

    this.raise('TP.sig.UnsupportedOperation', arguments);

    request = TP.request(aRequest);
    response = request.constructResponse(false);
    request.fail();

    return response;
});

//  ------------------------------------------------------------------------

TP.core.JSONPURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @name save
     * @synopsis Attempts to save data using standard TIBET save primitives to
     *     the URI (after rewriting) that is provided. NOTE: 'jsonp://' URIs
     *     don't implement this functionality.
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        response;

    this.raise('TP.sig.UnsupportedOperation', arguments);

    request = TP.request(aRequest);
    response = request.constructResponse(false);
    request.fail();

    return response;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
