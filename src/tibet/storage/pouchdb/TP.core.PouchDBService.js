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
 * @type {TP.core.PouchDBService}
 * @summary A subtype of TP.core.Service that communicates with in-browser
 *     PouchDB data stores.
 * @example If the TP.sig.PouchDBRequest/TP.sig.PouchDBResponse processing model
 *     is used, it is unnecessary to manually set up a TP.core.PouchDBService.
 *     As part of the TIBET infrastructure of using request/response pairs, a
 *     'default' instance of this service will be instantiated and registered to
 *     handle all TP.sig.PouchDBRequests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'PouchDBService'.
 *
 *     It is possible, however, to manually set up a server. To do so, execute
 *     the following:
 *
 *     myPouchDBService = TP.core.PouchDBService.construct('myPouchDBServer');
 *
 *     You will then need to register your service instance so that it services
 *     TP.sig.PouchDBRequests (otherwise, the TIBET machinery will
 *     instantiate the 'default' instance of TP.core.PouchDBService as
 *     described above and register it to service these kinds of requests):
 *
 *     myPouchDBService.register();
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('PouchDBService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.PouchDBService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.PouchDBRequest')));

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
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.PouchDBService.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.PouchDB');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.PouchDBService.Inst.defineHandler('PouchDBRequest',
function(aRequest) {

    /**
     * @method handlePouchDBRequest
     * @summary Handles when an TP.sig.PouchDBRequest is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.PouchDBRequest} aRequest The request object to take
     *     the request parameters from.
     * @returns {TP.core.PouchDBService} The receiver.
     */

    var request,

        url,
        commObj,

        id,
        rev,
        dbName,
        body,

        theDB,

        resultStr,

        info,
        data,

        dateStamp;

    request = TP.request(aRequest);

    //  Make sure that we have a real URI
    url = TP.uc(request.at('uri'));

    //  if we don't have a viable URL, we must fail the request.
    if (TP.notValid(url)) {
        request.fail('TP.sig.InvalidURI');
        return this;
    }

    //  Set the 'comm object' of the url to be a plain Object (to emulate an
    //  XHR). The caller can extract information such as status codes, text,
    //  etc. from it.
    commObj = {
        response: null,
        responseText: null,
        responseType: 'json',
        responseXML: null,
        status: 200,
        statusText: '200 OK'
    };

    url.set('commObject', commObj);

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

        resultStr = TP.sc('Cannot open PouchDB database named: ' + dbName);

        commObj.responseType = '';
        commObj.status = 500;
        commObj.statusText = '500 ' + resultStr;

        request.fail(resultStr);

        return this;
    }

    switch (request.at('action')) {

        case 'createDB':

            //  The 'new TP.extern.PouchDB(dbName)' statement above creates a
            //  database if it didn't already exist. So we just exit here.

            //  Mirror what CouchDB returns here.
            resultStr = '{"ok":true}';

            commObj.response = resultStr;
            commObj.responseText = resultStr;

            request.complete(resultStr);

            break;

        case 'listDBs':

            if (TP.isValid(TP.extern.PouchDB.allDbs)) {
                TP.extern.PouchDB.allDbs(
                    function(err, resp) {

                        //  There was an error - fail the request.
                        if (TP.isValid(err)) {

                            resultStr = TP.sc('Trying to list all databases',
                                                ' but had an error: ',
                                                TP.str(err));

                            commObj.responseType = '';
                            commObj.status = 500;
                            commObj.statusText = '500 ' + resultStr;

                            return request.fail(resultStr, err);
                        }

                        resultStr = TP.js2json(resp);
                        commObj.response = resultStr;
                        commObj.responseText = resultStr;

                        request.complete(resultStr);
                    });
            } else {
                resultStr = TP.sc('Trying to list all databases but the',
                                    ' pouch-db-alldbs plugin isn\'t loaded');

                commObj.responseType = '';
                commObj.status = 500;
                commObj.statusText = '500 ' + resultStr;

                return request.fail(resultStr);
            }

            break;

        case 'deleteDB':

            theDB.destroy(
                function(err, resp) {

                    //  There was an error - fail the request.
                    if (TP.isValid(err)) {

                        resultStr = TP.str(err);

                        commObj.responseType = '';
                        commObj.status = 500;
                        commObj.statusText = '500 ' + resultStr;

                        return request.fail(
                                TP.sc('Trying to delete database:',
                                        dbName, ' but had an error: ',
                                        resultStr),
                                err);
                    }

                    resultStr = TP.js2json(resp);
                    commObj.response = resultStr;
                    commObj.responseText = resultStr;

                    request.complete(resultStr);
                });

            break;

        case 'deleteItem':

            //  If request has a 'rev' in it, then we construct an Object and
            //  hand that in.
            if (TP.notEmpty(rev)) {
                info = TP.hc('_id', id, '_rev', rev).asObject();
            } else {
                info = id;
            }

            theDB.get(
                info,
                function(err, resp) {

                    //  If the DB had an error, report it.
                    if (TP.isValid(err)) {
                        resultStr = TP.sc('Trying to delete item with id: ', id,
                                            ' from database:',
                                            dbName, ' but had an error: ',
                                            TP.str(err));

                        commObj.responseType = '';
                        commObj.status = 500;
                        commObj.statusText = '500 ' + resultStr;

                        return request.fail(resultStr, err);
                    }

                    //  If there wasn't a valid response or there was but it
                    //  didn't have a proper revision number, then we can't
                    //  update an object that doesn't exist.
                    if (TP.notValid(resp) || TP.notValid(resp._rev)) {

                        resultStr = TP.sc('There is no existing item with id: ',
                                            id, ' in database:', dbName, '.');

                        commObj.responseType = '';
                        commObj.status = 500;
                        commObj.statusText = '500 ' + resultStr;

                        return request.fail(resultStr);
                    }

                    //  Go ahead and try to 'remove' the data.
                    theDB.remove(
                        id,
                        resp._rev,
                        function(err2, resp2) {

                            //  There was an error - fail the request.
                            if (TP.isValid(err2)) {
                                resultStr = TP.sc(
                                        'Trying to delete item with id: ', id,
                                        ' from database:',
                                        dbName, ' but had an error: ',
                                        TP.str(err2));

                                commObj.responseType = '';
                                commObj.status = 500;
                                commObj.statusText = '500 ' + resultStr;

                                return request.fail(resultStr, err2);
                            }

                            resultStr = TP.js2json(resp2);
                            commObj.response = resultStr;
                            commObj.responseText = resultStr;

                            //  We succeeded! Complete the request with the
                            //  response from PouchDB.
                            request.complete(resultStr);
                        });
                });

            break;

        case 'retrieveItem':

            if (TP.isEmpty(id)) {

                resultStr = TP.sc('Trying to retrieve an item from the',
                                    ' database:', dbName,
                                    ' but had missing the unique id.');

                commObj.responseType = '';
                commObj.status = 500;
                commObj.statusText = '500 ' + resultStr;

                return request.fail(resultStr);
            }

            theDB.get(
                id,
                function(err, resp) {

                    //  There was an error - fail the request.
                    if (TP.isValid(err)) {
                        resultStr = TP.sc(
                                    'Trying to retrieve an item from database:',
                                    dbName, ' but had an error: ',
                                    TP.str(err));

                        commObj.responseType = '';
                        commObj.status = 500;
                        commObj.statusText = '500 ' + resultStr;

                        return request.fail(resultStr, err);
                    }

                    resultStr = TP.js2json(resp);
                    commObj.response = resultStr;
                    commObj.responseText = resultStr;

                    request.complete(resultStr);
                });

            break;

        case 'retrieveItemInfo':

            if (TP.isEmpty(id)) {

                resultStr = TP.sc('Trying to retrieve item info from the',
                                    ' database:', dbName,
                                    ' but had missing the unique id.');

                commObj.responseType = '';
                commObj.status = 500;
                commObj.statusText = '500 ' + resultStr;

                return request.fail(resultStr);
            }

            theDB.get(
                id,
                function(err, resp) {

                    var resultData;

                    //  There was an error - fail the request.
                    if (TP.isValid(err)) {
                        resultStr = TP.sc(
                                'Trying to retrieve item info from database:',
                                dbName, ' but had an error: ',
                                TP.str(err));

                        commObj.responseType = '';
                        commObj.status = 500;
                        commObj.statusText = '500 ' + resultStr;

                        return request.fail(resultStr, err);
                    }

                    resultData = TP.json2js(TP.js2json(resp));

                    resultData = TP.hc(
                        '_id', resultData.at('_id'),
                        'date_created', resultData.at('date_created'),
                        'date_modified', resultData.at('date_modified'));

                    resultStr = TP.js2json(resultData);
                    commObj.response = resultStr;
                    commObj.responseText = resultStr;

                    request.complete(resultStr);
                });

            break;

        case 'retrieveDBInfo':

            theDB.allDocs(
                function(err, resp) {

                    //  There was an error - fail the request.
                    if (TP.isValid(err)) {
                        resultStr = TP.sc(
                                'Trying to retrieve information about the',
                                ' database:', dbName, ' but had an error: ',
                                TP.str(err));

                        commObj.responseType = '';
                        commObj.status = 500;
                        commObj.statusText = '500 ' + resultStr;

                        return request.fail(resultStr, err);
                    }

                    resultStr = TP.js2json(resp);
                    commObj.response = resultStr;
                    commObj.responseText = resultStr;

                    request.complete(resultStr);
                });

            break;

        case 'createItem':

            //  Convert the object into a TP.core.Hash and then into a plain
            //  Object.
            data = body.asHash();

            dateStamp = TP.dc().asNumber();

            data.atPut('date_created', dateStamp);
            data.atPut('date_modified', dateStamp);

            //  If there is no id, then do a 'post' and let PouchDB create one.
            if (TP.isEmpty(id)) {

                //  Make sure to convert it to a POJO before handing it to
                //  PouchDB.
                data = data.asObject();

                //  Go ahead and try to 'post' the data.
                theDB.post(
                    data,
                    function(err, resp) {

                        //  There was an error - fail the request.
                        if (TP.isValid(err)) {
                            resultStr = TP.sc('Trying to create an item in the',
                                                ' database:', dbName,
                                                ' but had an error: ',
                                                TP.str(err));

                            commObj.responseType = '';
                            commObj.status = 500;
                            commObj.statusText = '500 ' + resultStr;

                            return request.fail(resultStr, err);
                        }

                        resultStr = TP.js2json(resp);
                        commObj.response = resultStr;
                        commObj.responseText = resultStr;

                        //  We succeeded! Complete the request with the
                        //  response from PouchDB.
                        request.complete(resultStr);
                    });

            } else {

                data.atPut('_id', id);

                //  Make sure to convert it to a POJO before handing it to
                //  PouchDB.
                data = data.asObject();

                theDB.get(
                    id,
                    function(err, resp) {

                        //  If the DB had an error and it wasn't a 404 (which we
                        //  we're not interested in), report it.
                        if (TP.isValid(err) && err.status !== 404) {
                            resultStr = TP.sc('Trying to create an item in the',
                                                ' database:', dbName,
                                                ' but had an error: ',
                                                TP.str(err));

                            commObj.responseType = '';
                            commObj.status = 500;
                            commObj.statusText = '500 ' + resultStr;

                            return request.fail(resultStr, err);
                        }

                        //  If there was a response and it had a proper revision
                        //  number, then an object under that key already
                        //  existed.
                        if (TP.isValid(resp) && TP.isValid(resp._rev)) {
                            resultStr = TP.sc('Already had item with id: ', id,
                                                ' in database:', dbName, '.');

                            commObj.responseType = '';
                            commObj.status = 500;
                            commObj.statusText = '500 ' + resultStr;

                            return request.fail(resultStr);
                        }

                        //  Go ahead and try to 'put' the data.
                        theDB.put(
                            data,
                            function(err2, resp2) {

                                //  There was an error - fail the request.
                                if (TP.isValid(err2)) {

                                    resultStr =
                                        TP.sc('Trying to create an item in the',
                                                ' database:', dbName,
                                                ' but had an error: ',
                                                TP.str(err2));

                                    commObj.responseType = '';
                                    commObj.status = 500;
                                    commObj.statusText = '500 ' + resultStr;

                                    return request.fail(resultStr, err2);
                                }

                                resultStr = TP.js2json(resp2);
                                commObj.response = resultStr;
                                commObj.responseText = resultStr;

                                //  We succeeded! Complete the request with the
                                //  response from PouchDB.
                                request.complete(resultStr);
                            });
                    });
            }

            break;

        case 'updateOrConstructItem':

            if (TP.isEmpty(id)) {

                resultStr = TP.sc('Trying to update an item in the',
                                    ' database:', dbName,
                                    ' but had missing the unique id.');

                return request.fail(resultStr);

            } else {

                //  Convert the object into a TP.core.Hash and then into a plain
                //  Object.
                data = body.asHash();

                data.atPut('_id', id);

                theDB.get(
                    id,
                    function(err, resp) {

                        var needsCreate;

                        dateStamp = TP.dc().asNumber();

                        //  If the DB had an error and it wasn't a 404 (which we
                        //  we're interested in for auto create), report it.
                        if (TP.isValid(err)) {
                            if (err.status !== 404) {
                                resultStr = TP.sc(
                                            'Trying to update an item in the',
                                            ' database:', dbName,
                                            ' but had an error: ',
                                            TP.str(err));

                                commObj.responseType = '';
                                commObj.status = 500;
                                commObj.statusText = '500 ' + resultStr;

                                return request.fail(resultStr, err);
                            } else {
                                needsCreate = true;
                            }
                        } else {
                            needsCreate = false;
                        }

                        //  If needsCreate is false and there wasn't a valid
                        //  response or there was but it didn't have a proper
                        //  revision number, then we can't update an object that
                        //  doesn't exist.
                        if (!needsCreate &&
                            (TP.notValid(resp) || TP.notValid(resp._rev))) {

                            resultStr = TP.sc(
                                        'There is no existing item with id: ',
                                        id, ' in database:', dbName, '.');

                            commObj.responseType = '';
                            commObj.status = 500;
                            commObj.statusText = '500 ' + resultStr;

                            return request.fail(resultStr);
                        }

                        //  Update the date modified stamp
                        data.atPut('date_modified', dateStamp);

                        //  If we're also creating, then we stamp in the date
                        //  created.
                        if (needsCreate) {

                            data.atPut('date_created', dateStamp);

                            //  Make sure to convert it to a POJO before handing
                            //  it to PouchDB.
                            data = data.asObject();
                        } else {

                            //  Otherwise, we grab the response, which is the
                            //  whole document (as we're doing an update) and
                            //  copy any new data from the passed in data over
                            //  to it.
                            data.getKeys().forEach(
                                function(aKey) {

                                    //  This is done this way because JSONifying
                                    //  nulls and undefineds don't cause the
                                    //  desired values for PouchDB. Nulls should
                                    //  just be null and undefineds should be
                                    //  omitted.
                                    if (TP.isNull(data.at(aKey))) {
                                        resp[aKey] = null;
                                    } else if (!TP.isDefined(aKey)) {
                                        //  empty
                                    } else if (aKey === '_rev') {
                                        //  empty
                                    } else {
                                        resp[aKey] = TP.json2js(
                                            TP.js2json(data.at(aKey)), false);
                                    }
                                });

                            //  Make the new data be that data.
                            data = resp;
                        }

                        //  Go ahead and try to 'put' the data.
                        theDB.put(
                            data,
                            function(err2, resp2) {

                                //  There was an error - fail the request.
                                if (TP.isValid(err2)) {
                                    resultStr = TP.sc(
                                            'Trying to create an item in the',
                                            ' database:', dbName,
                                            ' but had an error: ',
                                            TP.str(err2));

                                    commObj.responseType = '';
                                    commObj.status = 500;
                                    commObj.statusText = '500 ' + resultStr;

                                    return request.fail(resultStr, err2);
                                }

                                resultStr = TP.js2json(resp2);
                                commObj.response = resultStr;
                                commObj.responseText = resultStr;

                                //  We succeeded! Complete the request with the
                                //  response from PouchDB.
                                request.complete(resultStr);
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
