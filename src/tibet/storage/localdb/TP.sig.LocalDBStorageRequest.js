//  ========================================================================
/*
NAME:   TP.sig.LocalDBStorageRequest.js
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
 *              TP.log('Success! Result: ' + TP.json(aResponse.getResult()),
 *                      TP.LOG,
 *                      arguments);
 *          });
 *
 *     req.defineMethod('handleRequestFailed',
 *          function(aResponse) {
 *              TP.log('Failure... Result: ' + TP.json(aResponse.getResult()),
 *                      TP.LOG,
 *                      arguments);
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
 * @todo
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
