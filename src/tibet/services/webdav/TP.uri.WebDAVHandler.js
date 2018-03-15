//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.uri.WebDAVHandler}
 * @summary A URL handler type that can store and load from WebDAV-capable
 *     URLs.
 */

//  ------------------------------------------------------------------------

TP.uri.URIHandler.defineSubtype('WebDAVHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  CONTENT METHODS
//  ------------------------------------------------------------------------

TP.uri.WebDAVHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content and returns it on request. This is a
     *     template method which defines the overall process used for loading
     *     URI data and ensuring that the URI's cache and header content are
     *     kept up to date. You should normally override one of the more
     *     specific load* methods in subtypes if you're doing custom load
     *     handling.
     * @param {TP.uri.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,

        action,

        loadRequest;

    request = TP.request(aRequest);
    response = request.getResponse();

    //  Manipulating a 'WebDAV' resource requires an 'action'
    if (TP.isEmpty(action = request.at('action'))) {
        request.fail();

        return response;
    }

    //  Construct and initialize an TP.core.WebDAVRequest using the URI as a
    //  parameter.
    loadRequest = TP.core.WebDAVRequest.construct(
                            TP.hc('action', action,
                                    'uri', targetURI.asString(),
                                    'username', request.at('username'),
                                    'password', request.at('password')
                                    ));

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

TP.uri.WebDAVHandler.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes the target URL.
     * @param {TP.uri.URI} targetURI The URI to delete. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.uri.WebDAVHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Attempts to save data using standard TIBET save primitives to
     *     the URI (after rewriting) that is provided.
     * @param {TP.uri.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,

        resp,
        content,

        action,

        saveRequest;

    request = TP.request(aRequest);
    response = request.getResponse();

    //  Saving data to a 'WebDAV' resource requires 'data' to save ;-)
    resp = targetURI.getResource(TP.hc('async', false, 'resultType', TP.TEXT));
    if (TP.isEmpty(content = resp.get('result'))) {

        request.fail();

        return response;
    }

    //  Manipulating a 'WebDAV' resource requires an 'action'
    if (TP.isEmpty(action = request.at('action'))) {
        request.fail();

        return response;
    }

    saveRequest = TP.core.WebDAVRequest.construct(
                            TP.hc('uri', targetURI.asString(),
                                    'body', content,
                                    'action', action,
                                    'refreshContent', false,
                                    'username', request.at('username'),
                                    'password', request.at('password')
                                    ));

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the put item request finishes and
    //  to be 'dependent' on the success/failure of the put item request.
    request.andJoinChild(saveRequest);

    //  Fire the save request to trigger service operation.
    saveRequest.fire();

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(saveRequest);

    return response;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
