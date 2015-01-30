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
 * @type {TP.sig.LocalDBStorageRequest}
 * @synopsis A subtype of TP.sig.Request that is used in conjunction with the
 *     TP.core.LocalDBStorageService type to communicate to in-browser 'local
 *     storage' data stores.
 * @example Communicating with a local data store from TIBET consists of:
 *
 *     1. Define the operation you want to perform via a set of 'request
 *          parameters'.
 *     2. Instantiating an TP.sig.LocalDBStorageRequest object, supplying those
 *          parameters.
 *     3. Firing the request.
 *
 *     Defining request parameters:
 *
 *     - Request parameters need to include an 'action', which should be either
 *          'getItem' or 'putItem'. The data should be a TP.lang.Hash that is
 *          placed in the 'body' parameter.
 *
 *     req = TP.sig.LocalDBStorageRequest.construct(
 *                  TP.hc('action', 'updateItem',
 *                          'dbName', 'local_test',
 *                          'id', 'author_info',
 *                          'body', TP.hc('foo', 'bar')));
 *
 *     Request parameters examples:
 *
 *     - 'Create' an item in local DB
 *
 *     requestParams = TP.hc('action', 'createItem',
 *                              'dbName', 'local_test',
 *                              'id', 'author_info',
 *                              'body', TP.hc('foo', 'bar'));
 *
 *     - 'Retrieve' an item from local DB
 *
 *     requestParams = TP.hc('action', 'retrieveItem',
 *                              'dbName', 'local_test',
 *                              'id', 'author_info');
 *
 *     - 'Retrieve' an item info from local DB
 *
 *     requestParams = TP.hc('action', 'retrieveItemInfo',
 *                              'dbName', 'local_test',
 *                              'id', 'author_info');
 *
 *     - 'Retrieve' a info about a DB in local DB
 *
 *     requestParams = TP.hc('action', 'retrieveDBInfo',
 *                              'dbName', 'local_test');
 *
 *     - 'Update' an item in local DB
 *
 *     requestParams = TP.hc('action', 'updateItem',
 *                              'dbName', 'local_test',
 *                              'id', 'author_info',
 *                              'body', TP.hc('foo', 'baz'));
 *
 *     - 'Delete' an item from local DB
 *
 *     requestParams = TP.hc('action', 'deleteItem',
 *                              'dbName', 'local_test',
 *                              'id', 'author_info');
 *
 *     - 'Delete' a DB in local DB
 *
 *     requestParams = TP.hc('action', 'deleteDB',
 *                              'dbName', 'local_test');
 *
 *     Package and fire the request:
 *
 *     req = TP.sig.LocalDBStorageRequest.construct(requestParams);
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
 *     Data can be easily encrypted and decrypted by adding a 'securePW'
 *     attribute to the request:
 *
 *     requestParams = TP.hc('action', 'createItem',
 *                              'dbName', 'local_test',
 *                              'securePW', 'fluffy',
 *                              'id', 'author_info',
 *                              'body', TP.hc('foo', 'bar'));
 *
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('LocalDBStorageRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.LocalDBStorageRequest.Type.defineAttribute('responseType',
                                        'TP.sig.LocalDBStorageResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
