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
 * @type {TP.sig.PouchDBRequest}
 * @summary A subtype of TP.sig.Request that is used in conjunction with the
 *     TP.core.PouchDBService type to communicate to PouchDB data stores.
 * @example Communicating with a PouchDB data store from TIBET consists of:
 *
 *     1. Define the operation you want to perform via a set of 'request
 *          parameters'.
 *     2. Instantiating an TP.sig.PouchDBRequest object, supplying those
 *          parameters.
 *     3. Firing the request.
 *
 *     Defining request parameters:
 *
 *     - Request parameters need to include an 'action', which should be either
 *          'getItem' or 'putItem'. The data should be a TP.core.Hash that is
 *          placed in the 'body' parameter.
 *
 *     req = TP.sig.PouchDBRequest.construct(
 *                  TP.hc('action', 'updateOrCreateItem',
 *                          'dbName', 'pouchdb_test',
 *                          'id', 'author_info',
 *                          'body', TP.hc('foo', 'bar')));
 *
 *     Request parameters examples:
 *
 *     - 'Create' an item in PouchDB
 *
 *     requestParams = TP.hc('action', 'createItem',
 *                              'dbName', 'pouchdb_test',
 *                              'id', 'author_info',
 *                              'body', TP.hc('foo', 'bar'));
 *
 *     - 'Retrieve' an item from PouchDB
 *
 *     requestParams = TP.hc('action', 'retrieveItem',
 *                              'dbName', 'pouchdb_test',
 *                              'id', 'author_info');
 *
 *     - 'Retrieve' an item info from PouchDB
 *
 *     requestParams = TP.hc('action', 'retrieveItemInfo',
 *                              'dbName', 'pouchdb_test',
 *                              'id', 'author_info');
 *
 *     - 'Retrieve' a info about a DB in PouchDB
 *
 *     requestParams = TP.hc('action', 'retrieveDBInfo',
 *                              'dbName', 'pouchdb_test');
 *
 *     - 'Update' an item in PouchDB
 *
 *     requestParams = TP.hc('action', 'updateOrCreateItem',
 *                              'dbName', 'pouchdb_test',
 *                              'id', 'author_info',
 *                              'body', TP.hc('foo', 'baz'));
 *
 *     - 'Delete' the latest rev of an item from PouchDB
 *
 *     requestParams = TP.hc('action', 'deleteItem',
 *                              'dbName', 'pouchdb_test',
 *                              'id', 'author_info');
 *
 *     - 'Delete' a specific rev of an item from PouchDB
 *
 *     requestParams = TP.hc('action', 'deleteItem',
 *                              'dbName', 'pouchdb_test',
 *                              'id', 'author_info',
 *                              'rev', <rev_number>);
 *
 *     - 'Delete' a DB in PouchDB
 *
 *     requestParams = TP.hc('action', 'deleteDB',
 *                              'dbName', 'pouchdb_test');
 *
 *     Package and fire the request:
 *
 *     req = TP.sig.PouchDBRequest.construct(requestParams);
 *
 *     req.defineMethod('handleRequestSucceeded',
 *          function(aResponse) {
 *              TP.info('Success! Result: ' + TP.json(aResponse.getResult()));
 *          });
 *
 *     req.defineMethod('handleRequestFailed',
 *          function(aResponse) {
 *              TP.info('Failure... Result: ' + TP.json(aResponse.getResult()));
 *          });
 *
 *     req.fire();
 *
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('PouchDBRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.PouchDBRequest.Type.defineAttribute('responseType',
                                        'TP.sig.PouchDBResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.PouchDBRequest.Inst.defineMethod('failJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method failJob
     * @summary Fails the PouchDB request
     * @param {String} aFaultString A text description of the reason for the
     *     failure.
     * @param {Object} aFaultCode A reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.sig.PouchDBRequest}
     */

    var url,
        uri;

    url = this.at('uri');
    if (TP.isURI(url)) {
        uri = TP.uc(url);
        if (TP.isURI(uri)) {
            uri.isLoaded(false);
            uri.isDirty(true);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.PouchDBRequest.Inst.defineMethod('cancelJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancelJob
     * @summary Cancels the PouchDB request
     * @param {String} aFaultString A text description of the reason for the
     *     cancellation.
     * @param {Object} aFaultCode A reason for the cancellation.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.sig.PouchDBRequest}
     */

    var url,
        uri;

    url = this.at('uri');
    if (TP.isURI(url)) {
        uri = TP.uc(url);
        if (TP.isURI(uri)) {
            uri.isLoaded(false);
            uri.isDirty(true);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.PouchDBRequest.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @method completeJob
     * @summary Completes the request, peforming any wrapup that might be
     *     necessary to ensure proper capture of the result data.
     * @param {Object} aResult An optional object to set as the result of the
     *     request.
     * @returns {TP.sig.PouchDBRequest}
     */

    var url,
        uri,
        data;

    url = this.at('uri');
    if (TP.isURI(url)) {
        uri = TP.uc(url);
        if (TP.isURI(uri)) {
            data = uri.updateResourceCache(this);

            uri.isLoaded(true);
            uri.isDirty(false);
        }
    }

    data = data || aResult;
    this.set('result', data);

    return this.callNextMethod(data);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
