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
 *                  TP.hc('action', 'updateItem',
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
 *     requestParams = TP.hc('action', 'updateItem',
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
 *              TP.info('Success! Result: ' + TP.json(aResponse.getResult()),
 *                      TP.LOG);
 *          });
 *
 *     req.defineMethod('handleRequestFailed',
 *          function(aResponse) {
 *              TP.info('Failure... Result: ' + TP.json(aResponse.getResult()),
 *                      TP.LOG);
 *          });
 *
 *     req.fire();
 *
 *     requestParams = TP.hc('action', 'createItem',
 *                              'dbName', 'pouchdb_test',
 *                              'id', 'author_info',
 *                              'body', TP.hc('foo', 'bar'));
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
//  end
//  ========================================================================
