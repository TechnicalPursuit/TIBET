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
 * @type {TP.amz.AmazonSimpleDBHandler}
 * @synopsis A URL handler type that can store and load from Amazon S3 URLs.
 */

//  ------------------------------------------------------------------------

TP.core.URIHandler.defineSubtype('amz:AmazonSimpleDBHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @name load
     * @synopsis Loads URI data content and returns it on request. This is a
     *     template method which defines the overall process used for loading
     *     URI data and ensuring that the URI's cache and header content are
     *     kept up to date. You should normally override one of the more
     *     specific load* methods in subtypes if you're doing custom load
     *     handling.
     * @param {TP.core.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,
        loadRequest,
        domainName,
        itemName;

    TP.stop('break.uri_load');

    request = TP.request(aRequest);
    response = request.constructResponse();

    //  If neither a domainName or a itemName is defined, then we just go
    //  with a request that has an action of 'ListDomains'.
    if (TP.isEmpty(domainName = request.at('DomainName'))) {
        loadRequest = TP.sig.AmazonSimpleDBRequest.construct(
            TP.hc('action', 'ListDomains',
                  'uri', targetURI.asString()));
    } else if (TP.isEmpty(itemName = request.at('ItemName'))) {
        loadRequest = TP.sig.AmazonSimpleDBRequest.construct(
            TP.hc('action', 'ListDomains',
                  'uri', targetURI.asString()));
    } else {
        loadRequest = TP.sig.AmazonSimpleDBRequest.construct(
            TP.hc('action', 'GetAttributes',
                  'uri', targetURI.asString(),
                  'uriparams', TP.hc('DomainName', domainName,
                                     'ItemName', itemName)));
    }

    //  Make sure the 'key' and 'secretkey' are populated into the load
    //  request.
    loadRequest.atPut('key', request.at('key'));
    loadRequest.atPut('secretkey', request.at('secretkey'));

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the get item request finishes and
    //  to be 'dependent' on the success/failure of the get item request.
    request.andJoinChild(loadRequest);

    //  Fire the get item request to trigger service operation.
    loadRequest.fire();

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(loadRequest);

    return response;
});

//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBHandler.Type.defineMethod('nuke',
function(targetURI, aRequest) {

    /**
     * @name nuke
     * @synopsis Deletes the target URL.
     * @param {TP.core.URI} targetURI The URI to nuke. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @name save
     * @synopsis Attempts to save data using standard TIBET save primitives to
     *     the URI (after rewriting) that is provided.
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,
        content,
        domainName,
        itemName,
        names,
        values,
        saveRequest;

    TP.stop('break.uri_save');

    request = TP.request(aRequest);
    response = request.constructResponse();

    //  Saving data to Amazon requires 'data' to save ;-)
    if (TP.isEmpty(content = targetURI.getResource(
            TP.hc('async', false, 'refresh', false)))) {
        request.fail('No content to send for: ' + TP.str(targetURI));

        return response;
    }

    if (TP.isString(content)) {
        //  If its a String, we treat it like an 'action=Select'
        saveRequest = TP.sig.AmazonSimpleDBRequest.construct(
            TP.hc('action', 'Select',
                  'uri', targetURI.asString(),
                  'uriparams', TP.hc('SelectExpression', content)));
    } else {
        //  Otherwise, we treat it like an 'action=PutAttributes'

        if (TP.isEmpty(domainName = request.at('DomainName'))) {
            request.fail('Missing parameter: DomainName');

            return response;
        }

        if (TP.isEmpty(itemName = request.at('ItemName'))) {
            request.fail('Missing parameter: ItemName');

            return response;
        }

        names = content.getKeys();
        values = content.getValues();

        saveRequest = TP.sig.AmazonSimpleDBRequest.construct(
            TP.hc('action', 'PutAttributes',
                  'uri', targetURI.asString(),
                  'uriparams', TP.hc('DomainName', domainName,
                                     'ItemName', itemName),
                  'Names', names,
                  'Values', values));
    }

    //  Make sure the 'key' and 'secretkey' are populated into the save
    //  request.
    saveRequest.atPut('key', request.at('key'));
    saveRequest.atPut('secretkey', request.at('secretkey'));

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
