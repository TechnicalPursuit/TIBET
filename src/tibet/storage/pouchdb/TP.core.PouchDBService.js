//  ========================================================================
/*
NAME:   TP.core.PouchDBService.js
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
 * @type {TP.core.PouchDBService}
 * @synopsis A subtype of TP.core.Service that communicates with in-browser
 *     PouchDB data stores.
 * @example If the TP.sig.PouchDBRequest/TP.sig.PouchDBResponse processing model
 *     is used, it is unnecessary to manually set up a TP.core.PouchDBService.
 *     As part of the TIBET infrastructure of using request/response pairs, a
 *     'default' instance of this service will be instantiated and registered to
 *     handle all TP.sig.PouchDBRequests.
 *     
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'TP.core.PouchDBServiceDefault'.
 *     
 *     It is possible, however, to manually set up a server. To do so, execute
 *     the following:
 *     
 *     myPouchDBService = TP.core.PouchDBService.construct(
 *          'myPouchDBServer');
 *     
 *     You will then need to register your service instance so that it services
 *     TP.sig.PouchDBRequests (otherwise, the TIBET machinery will
 *     instantiate the 'default' instance of TP.core.PouchDBService as
 *     described above and register it to service these kinds of requests):
 *     
 *     myPouchDBService.register();
 *
 * * @todo
 */

/* JSHint checking */

/* global PouchDB:true
*/

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('PouchDBService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.PouchDBService.Type.defineAttribute(
                        'triggerSignals', 'TP.sig.PouchDBRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  current versions of the PouchDB spec allow sync only so force that
//  here
TP.core.PouchDBService.Type.defineAttribute(
                        'supportedModes', TP.core.SyncAsync.ASYNCHRONOUS);
TP.core.PouchDBService.Type.defineAttribute(
                        'mode', TP.core.SyncAsync.ASYNCHRONOUS);

TP.core.PouchDBService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.PouchDBService.Inst.defineMethod('handlePouchDBRequest',
function(aRequest) {

    /**
     * @name handlePouchDBRequest
     * @synopsis Handles when an TP.sig.PouchDBRequest is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.PouchDBRequest} aRequest The request object to take
     *     the request parameters from.
     * @returns {TP.core.PouchDBService} The receiver.
      @todo
     */

    var request,

        theDB,

        id,
        rev,
        dbName,
        body,

        info,
        data,
        resultData,
        theDate;

    request = TP.request(aRequest);

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    id = request.at('id');
    rev = request.at('rev');
    dbName = request.at('dbName');
    body = request.at('body');

    if (TP.notValid(theDB = new TP.extern.PouchDB(dbName))) {
        request.fail(
                TP.FAILURE,
                TP.sc('Cannot open pouchDB database named: ' + dbName));

        return this;
    }

    switch (request.at('action')) {

        case    'deleteDB':

            PouchDB.destroy(
                dbName,
                function(error, response) {

                    //  There was an error - fail the request.
                    if (TP.isValid(error)) {
                        return request.fail(
                                TP.FAILURE,
                                TP.sc('Trying to delete database:',
                                        dbName, ' but had an error: ',
                                        TP.str(error)));
                    }

                    request.complete(response);
                });

        break;

        case    'deleteItem':

            //  If request has a 'rev' in it, then we construct an Object and
            //  hand that in.
            if (TP.notEmpty(rev)) {
                info = TP.hc('_id', id, '_rev', rev).asObject();
            } else {
                info = id;
            }

            theDB.get(
                info,
                function(error, response) {

                    var deleteInfo;

                    //  If the DB had an error, report it.
                    if (TP.isValid(error)) {
                        return request.fail(
                                TP.FAILURE,
                                TP.sc('Trying to delete item with id: ', id,
                                        ' from database:',
                                        dbName, ' but had an error: ',
                                        TP.str(error)));
                    }

                    //  If there wasn't a valid response or there was but it
                    //  didn't have a proper revision number, then we can't
                    //  update an object that doesn't exist.
                    if (TP.notValid(response) || TP.notValid(response._rev)) {
                        return request.fail(
                                TP.FAILURE,
                                TP.sc('There is no existing item with id: ',
                                        id, ' in database:', dbName, '.'));
                    }

                    deleteInfo = TP.hc('_id', id, '_rev', response._rev);
                    deleteInfo = deleteInfo.asObject();

                    //  Go ahead and try to 'remove' the data.
                    theDB.remove(
                        deleteInfo,
                        function(error, response) {

                            //  There was an error - fail the request.
                            if (TP.isValid(error)) {
                                return request.fail(
                                    TP.FAILURE,
                                    TP.sc('Trying to delete item with id: ', id,
                                            ' from database:',
                                            dbName, ' but had an error: ',
                                            TP.str(error)));
                            }

                            //  We succeeded! Complete the request with the
                            //  response from PouchDB.
                            request.complete(response);
                        });
                });

        break;

        case    'retrieveItem':

            if (TP.isEmpty(id)) {

                return request.fail(
                    TP.FAILURE,
                    TP.sc('Trying to retrieve an item from the',
                            ' database:', dbName,
                            ' but had missing the unique id.'));

            }

            theDB.get(
                id,
                function(error, response) {

                    //  There was an error - fail the request.
                    if (TP.isValid(error)) {
                        return request.fail(
                            TP.FAILURE,
                            TP.sc('Trying to retrieve an item from database:',
                                    dbName, ' but had an error: ',
                                    TP.str(error)));
                    }

                    request.complete(response);
                });

        break;

        case    'retrieveItemInfo':

            if (TP.isEmpty(id)) {

                return request.fail(
                    TP.FAILURE,
                    TP.sc('Trying to retrieve item info from the',
                            ' database:', dbName,
                            ' but had missing the unique id.'));

            }

            theDB.get(
                id,
                function(error, response) {

                    //  There was an error - fail the request.
                    if (TP.isValid(error)) {
                        return request.fail(
                            TP.FAILURE,
                            TP.sc('Trying to retrieve item info from database:',
                                    dbName, ' but had an error: ',
                                    TP.str(error)));
                    }

                    resultData = TP.hc(
                        '_id', response.at('_id'),
                        'date_created', response.at('date_created'),
                        'date_modified', response.at('date_modified'));

                    request.complete(response);
                });

        break;

        case    'retrieveDBInfo':

            theDB.allDocs(
                function(error, response) {

                    //  There was an error - fail the request.
                    if (TP.isValid(error)) {
                        return request.fail(
                            TP.FAILURE,
                            TP.sc('Trying to retrieve information about the',
                                    ' database:', dbName, ' but had an error: ',
                                    TP.str(error)));
                    }

                    request.complete(response);
                });

        break;

        case    'createItem':

            //  Convert the object into a TP.lang.Hash and then into a plain
            //  Object.
            data = body.asHash().asObject();
            theDate = TP.dc();

            data.atPut('date_created', theDate);
            data.atPut('date_modified', theDate);

            //  If there is no id, then do a 'post' and let PouchDB create one.
            if (TP.isEmpty(id)) {

                //  Go ahead and try to 'post' the data.
                theDB.post(
                    data,
                    function(error, response) {

                        //  There was an error - fail the request.
                        if (TP.isValid(error)) {
                            return request.fail(
                                TP.FAILURE,
                                TP.sc('Trying to create an item in the',
                                        ' database:', dbName,
                                        ' but had an error: ',
                                        TP.str(error)));
                        }

                        //  We succeeded! Complete the request with the
                        //  response from PouchDB.
                        request.complete(response);
                    });

            } else {

                data.atPut('_id', id);

                theDB.get(
                    id,
                    function(error, response) {

                        //  If the DB had an error and it wasn't a 404 (which we
                        //  we're not interested in), report it.
                        if (TP.isValid(error) && error.status !== 404) {
                            return request.fail(
                                    TP.FAILURE,
                                    TP.sc('Trying to create an item in the',
                                            ' database:', dbName,
                                            ' but had an error: ',
                                            TP.str(error)));
                        }

                        //  If there was a response and it had a proper revision
                        //  number, then an object under that key already existed.
                        if (TP.isValid(response) && TP.isValid(response._rev)) {
                            return request.fail(
                                    TP.FAILURE,
                                    TP.sc('Already had item with id: ', id,
                                            ' in database:', dbName, '.'));
                        }

                        //  Go ahead and try to 'put' the data.
                        theDB.put(
                            data,
                            function(error, response) {

                                //  There was an error - fail the request.
                                if (TP.isValid(error)) {
                                    return request.fail(
                                        TP.FAILURE,
                                        TP.sc('Trying to create an item in the',
                                                ' database:', dbName,
                                                ' but had an error: ',
                                                TP.str(error)));
                                }

                                //  We succeeded! Complete the request with the
                                //  response from PouchDB.
                                request.complete(response);
                            });
                    });
            }

        break;

        case    'updateItem':

            if (TP.isEmpty(id)) {

                return request.fail(
                    TP.FAILURE,
                    TP.sc('Trying to update an item in the',
                            ' database:', dbName,
                            ' but had missing the unique id.'));

            } else {

                //  Convert the object into a TP.lang.Hash and then into a plain
                //  Object.
                data = body.asHash().asObject();
                data.atPut('_id', id);

                theDB.get(
                    id,
                    function(error, response) {

                        //  If the DB had an error report it.
                        if (TP.isValid(error)) {
                            return request.fail(
                                    TP.FAILURE,
                                    TP.sc('Trying to update an item in the',
                                            ' database:', dbName,
                                            ' but had an error: ',
                                            TP.str(error)));
                        }

                        //  If there wasn't a valid response or there was but it
                        //  didn't have a proper revision number, then we can't
                        //  update an object that doesn't exist.
                        if (TP.notValid(response) || TP.notValid(response._rev)) {
                            return request.fail(
                                    TP.FAILURE,
                                    TP.sc('There is no existing item with id: ',
                                            id, ' in database:', dbName, '.'));
                        }

                        //  Update the rev number in the data we're updating.
                        //  This will cause the update to happen.
                        data.atPut('_rev', response._rev);

                        //  Update the date modified stamp
                        data.atPut('date_modified', TP.dc());

                        //  Go ahead and try to 'put' the data.
                        theDB.put(
                            data,
                            function(error, response) {

                                //  There was an error - fail the request.
                                if (TP.isValid(error)) {
                                    return request.fail(
                                        TP.FAILURE,
                                        TP.sc('Trying to create an item in the',
                                                ' database:', dbName,
                                                ' but had an error: ',
                                                TP.str(error)));
                                }

                                //  We succeeded! Complete the request with the
                                //  response from PouchDB.
                                request.complete(response);
                            });
                    });
            }

        break;

        default:
        break;
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
