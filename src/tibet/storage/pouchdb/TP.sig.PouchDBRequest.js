//  ========================================================================
/*
NAME:   TP.sig.PouchDBRequest.js
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
 * @type {TP.sig.PouchDBRequest}
 * @synopsis A subtype of TP.sig.Request that is used in conjunction with the
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
 *          'getItem' or 'putItem'. The data should be a TP.lang.Hash that is
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
 *     requestParams = TP.hc('action', 'createItem',
 *                              'dbName', 'pouchdb_test',
 *                              'id', 'author_info',
 *                              'body', TP.hc('foo', 'bar'));
 *     
 * @todo
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
