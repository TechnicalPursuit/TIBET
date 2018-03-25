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
 * @type {TP.uri.LocalDBURLHandler}
 * @summary A URI handler type that can store and load from 'localdb://' URIs.
 */

//  ------------------------------------------------------------------------

TP.uri.URIHandler.defineSubtype('LocalDBURLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  CONTENT METHODS
//  ------------------------------------------------------------------------

TP.uri.LocalDBURLHandler.Type.defineMethod('load',
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
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidRequest
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,

        action,
        resourceID,
        dbName,

        queryDict,
        securePW,

        requestParams,

        loadRequest;

    request = TP.request(aRequest);
    response = request.getResponse();

    //  GET requests require at least a dbName
    if (TP.notValid(dbName = targetURI.get('dbName'))) {
        request.fail('No db name specified for: ' + TP.str(targetURI));

        return response;
    }

    resourceID = targetURI.get('resourceID');

    if (request.at('method') === TP.HTTP_HEAD) {
        action = 'retrieveItemInfo';
    } else if (TP.isValid(resourceID)) {
        if (resourceID === '_all_docs') {
            action = 'retrieveDBInfo';
        } else {
            action = 'retrieveItem';
        }
    } else {
        request.fail('Can\'t compute a load action for: ' + TP.str(targetURI));

        return response;
    }

    if (TP.isValid(queryDict = targetURI.get('queryDict'))) {
        securePW = queryDict.at('securePW');
    }

    requestParams = TP.hc(
                    'action', action,
                    'dbName', dbName,
                    'securePW', securePW,
                    'id', resourceID,
                    'uri', targetURI.getLocation());

    //  Construct and initialize a TP.sig.LocalDBStorageRequest
    loadRequest = TP.sig.LocalDBStorageRequest.construct(requestParams);

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

TP.uri.LocalDBURLHandler.Type.defineMethod('delete',
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

    var request,
        response,

        action,

        dbName,
        resourceID,

        queryDict,
        securePW,

        requestParams,

        deleteRequest;

    request = TP.request(aRequest);
    response = request.getResponse();

    //  DELETE requests require a dbName
    if (TP.notValid(dbName = targetURI.get('dbName'))) {
        request.fail('No db name specified for: ' + TP.str(targetURI));

        return response;
    }

    if (TP.isValid(resourceID = targetURI.get('resourceID'))) {
        action = 'deleteItem';
    } else {
        action = 'deleteDB';
    }

    if (TP.isValid(queryDict = targetURI.get('queryDict'))) {
        securePW = queryDict.at('securePW');
    }

    requestParams = TP.hc(
                    'action', action,
                    'dbName', dbName,
                    'securePW', securePW,
                    'id', resourceID,
                    'uri', targetURI.getLocation());

    //  Construct and initialize a TP.sig.LocalDBStorageRequest
    deleteRequest = TP.sig.LocalDBStorageRequest.construct(requestParams);

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the get item request finishes and
    //  to be 'dependent' on the success/failure of the delete item request.
    request.andJoinChild(deleteRequest);

    //  Fire the delete request to trigger service operation.
    deleteRequest.fire();

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(deleteRequest);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.LocalDBURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary
     * @param {TP.uri.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidRequest
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,

        dbName,
        resourceID,

        queryDict,
        securePW,

        cmdAction,
        resp,
        content,

        requestParams,

        saveRequest;

    request = TP.request(aRequest);
    response = request.getResponse();

    //  PUT and POST requests require at least a dbName
    if (TP.notValid(dbName = targetURI.get('dbName'))) {
        request.fail('No db name specified for: ' + TP.str(targetURI));

        return response;
    }

    resourceID = targetURI.get('resourceID');

    //  If we're adding content, then see if we have the content to add.
    cmdAction = request.at('cmdAction');

    if (cmdAction === TP.ADD) {
        //  Adding content - grab the 'last added content' that should be on our
        //  URI

        //  TODO: Figure this out.
        //  content = targetURI.get('$lastAdded');
        void 0;
    } else {
        //  Setting the content

        //  Grab whatever is in *the memory cache* of the URI. This will be the
        //  value of whatever was just 'set' as the 'resource' of the URI -
        //  the result value will be the value that we want to update.

        //  Note here how we force refresh. as well as async, to 'false' so we
        //  effectively do a synchronous "cache read".
        resp = targetURI.getResource(TP.hc('refresh', false, 'async', false));
        if (TP.isEmpty(content = resp.get('result'))) {
            request.fail('No content to save for: ' + TP.str(targetURI));

            return response;
        }
    }

    if (TP.isValid(queryDict = targetURI.get('queryDict'))) {
        securePW = queryDict.at('securePW');
    }

    if (request.at('method') === TP.HTTP_PUT) {

        if (TP.notValid(resourceID)) {
            request.fail('No resource ID specified for: ' + TP.str(targetURI));

            return response;
        }

        requestParams = TP.hc(
                        'action', 'updateItem',
                        'dbName', dbName,
                        'securePW', securePW,
                        'id', resourceID,
                        'body', content,
                        'uri', targetURI.getLocation());
    } else {

        requestParams = TP.hc(
                        'action', 'createItem',
                        'dbName', dbName,
                        'securePW', securePW,
                        'body', content,
                        'uri', targetURI.getLocation());
    }

    //  Construct and initialize a TP.sig.LocalDBStorageRequest
    saveRequest = TP.sig.LocalDBStorageRequest.construct(requestParams);

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the put item request finishes and
    //  to be 'dependent' on the success/failure of the save request.
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
