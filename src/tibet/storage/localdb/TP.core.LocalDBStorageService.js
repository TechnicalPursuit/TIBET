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
 * @type {TP.core.LocalDBStorageService}
 * @summary A subtype of TP.core.Service that communicates with in-browser
 *     'local storage' local data stores.
 * @example If the TP.sig.LocalDBStorageRequest/TP.sig.LocalDBStorageResponse
 *     processing model is used, it is unnecessary to manually set up a
 *     TP.core.LocalDBStorageService. As part of the TIBET infrastructure of
 *     using request/response pairs, a 'default' instance of this service will
 *     be instantiated and registered to handle all
 *     TP.sig.LocalDBStorageRequests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'LocalDBStorageService'.
 *
 *     It is possible, however, to manually set up a server. To do so, execute
 *     the following:
 *
 *     myLocalDBStorageService = TP.core.LocalDBStorageService.construct(
 *          'localLocalDBStorageServer');
 *
 *     You will then need to register your service instance so that it services
 *     TP.sig.LocalDBStorageRequests (otherwise, the TIBET machinery will
 *     instantiate the 'default' instance of TP.core.LocalDBStorageService as
 *     described above and register it to service these kinds of requests):
 *
 *     myLocalDBStorageService.register();
 *
 *    The backing storage for local DB storage is W3C-specified 'local storage'.
 *    The specific data storage format for data stored in this way is:
 *
 *    localstorage key: TP.LOCALSTORAGE_DB_NAME
 *    localstorage value:
 *        {
 *            "<db_name>" :
 *            {
 *                "<_id>" :
 *                {
 *                    "_id" : <_id>,
 *                    "_date_created": <Date>,
 *                    "_date_modified": <Date>,
 *                    "_body": <body>
 *                }
 *            }
 *        }
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('LocalDBStorageService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.LocalDBStorageService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.LocalDBStorageRequest')));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  current versions of the LocalDBStorage spec allow sync only so force that
//  here
TP.core.LocalDBStorageService.Type.defineAttribute(
                        'supportedModes', TP.core.SyncAsync.SYNCHRONOUS);
TP.core.LocalDBStorageService.Type.defineAttribute(
                        'mode', TP.core.SyncAsync.SYNCHRONOUS);

TP.core.LocalDBStorageService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.LocalDBStorageService.Inst.defineHandler('LocalDBStorageRequest',
function(aRequest) {

    /**
     * @method handleLocalDBStorageRequest
     * @summary Handles when an TP.sig.LocalDBStorageRequest is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.LocalDBStorageRequest} aRequest The request object to take
     *     the request parameters from.
     * @returns {TP.core.LocalDBStorageService} The receiver.
     */

    var request,

        url,
        commObj,

        resultStr,

        storageInstance,

        allDBsValue,
        allDBs,

        theDB,

        needsFlush,

        id,
        dbName,
        body,

        resultData,

        produceResultOutput,

        securePW,

        rowData,

        str,
        resultType;

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
        responseType: 'text',
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

    if (TP.notValid(storageInstance = TP.core.LocalStorage.construct())) {

        resultStr = TP.sc('Cannot open local DB storage instance.');

        commObj.responseType = '';
        commObj.status = 500;
        commObj.statusText = '500 ' + resultStr;

        request.fail(resultStr);

        return this;
    }

    needsFlush = false;

    if (TP.notValid(
        allDBsValue = storageInstance.at(TP.LOCALSTORAGE_DB_NAME))) {

        allDBs = TP.hc();
        needsFlush = true;
    } else {
        if (TP.notValid(allDBs = TP.json2js(allDBsValue))) {
            resultStr = TP.sc('Local DB storage instance is corrupted.');

            commObj.responseType = '';
            commObj.status = 500;
            commObj.statusText = '500 ' + resultStr;

            request.fail(resultStr);

            return this;
        }
    }

    id = request.at('id');
    dbName = request.at('dbName');
    body = request.at('body');

    resultData = null;

    produceResultOutput = function(aRecord) {
        var output,
            outBody;

        output = aRecord.copy();

        outBody = output.at('_body');

        if (TP.notEmpty(securePW = request.at('securePW'))) {
            outBody = TP.decryptStorageValue(outBody, securePW);
            output.atPut('_body', outBody);
        }

        return output;
    };

    switch (request.at('action')) {
        case 'deleteDB':

            if (TP.notValid(allDBs.at(dbName))) {
                resultStr = TP.sc('Can\'t delete non-existent database named: ',
                                    dbName, '.');

                commObj.responseType = '';
                commObj.status = 500;
                commObj.statusText = '500 ' + resultStr;

                request.fail(resultStr);

                return this;
            }

            allDBs.removeKey(dbName);

            //  Assign what gets returned from here to match the CouchDB
            //  return value.
            resultData = TP.hc('ok', true);

            needsFlush = true;

            break;

        case 'deleteItem':

            if (TP.notValid(theDB = allDBs.at(dbName))) {
                resultStr =
                    TP.sc('Can\'t delete item in non-existent database named: ',
                            dbName, '.');

                commObj.responseType = '';
                commObj.status = 500;
                commObj.statusText = '500 ' + resultStr;

                request.fail(resultStr);

                return this;
            }

            if (TP.notValid(resultData = theDB.at(id))) {

                resultStr = TP.sc('Can\'t find item with id: ', id,
                                    ' in database:', dbName, ' to delete.');

                commObj.responseType = '';
                commObj.status = 500;
                commObj.statusText = '500 ' + resultStr;

                request.fail(resultStr);

                return this;
            }

            theDB.removeKey(id);

            //  Assign what gets returned from here to match the CouchDB
            //  return value.
            resultData = TP.hc('ok', true);

            needsFlush = true;

            break;

        case 'retrieveItem':

            if (TP.isValid(theDB = allDBs.at(dbName))) {

                if (TP.isValid(theDB.at(id))) {
                    resultData = produceResultOutput(theDB.at(id));
                }
            }

            break;

        case 'retrieveItemInfo':

            if (TP.isValid(theDB = allDBs.at(dbName))) {
                resultData = theDB.at(id);
                resultData = TP.hc(
                        '_date_created', resultData.at('_date_created'),
                        '_date_modified', resultData.at('_date_modified'));
            }

            break;

        case 'retrieveDBInfo':

            if (TP.isValid(theDB = allDBs.at(dbName))) {
                resultData = TP.hc('total_rows', theDB.getSize());
                rowData = TP.ac();
                theDB.perform(
                        function(kvPair) {
                            rowData.push(produceResultOutput(kvPair.last()));
                        });
                resultData.atPut('rows', rowData);
            }

            break;

        case 'createItem':

            if (TP.notValid(theDB = allDBs.at(dbName))) {
                theDB = TP.hc();
                allDBs.atPut(dbName, theDB);
            }

            if (TP.isValid(theDB.at(id))) {

                resultStr = TP.sc('Already had item with id: ', id,
                                    ' in database:', dbName, '.');

                commObj.responseType = '';
                commObj.status = 500;
                commObj.statusText = '500 ' + resultStr;

                request.fail(resultStr);

                //  Do not 'return' here - fall through, in case needsFlush is
                //  true and we want to store DB structure anyway...
            } else {

                //  Make sure we have a real id
                id = TP.isEmpty(id) ? TP.genUUID() : id;

                if (TP.notEmpty(securePW = request.at('securePW'))) {
                    body = TP.encryptStorageValue(TP.js2json(body), securePW);
                }

                resultData = TP.hc(
                                '_id', id,
                                '_date_created', TP.dc(),
                                '_date_modified', TP.dc(),
                                '_body', body);

                theDB.atPut(id, resultData);

                //  Assign what gets returned from here to match the CouchDB
                //  return value.
                resultData = TP.hc('ok', true, '_id', id);

                needsFlush = true;
            }

            break;

        case 'updateItem':

            if (TP.notValid(theDB = allDBs.at(dbName))) {
                theDB = TP.hc();
                allDBs.atPut(dbName, theDB);
            }

            if (TP.notEmpty(securePW = request.at('securePW'))) {
                body = TP.encryptStorageValue(TP.js2json(body), securePW);
            }

            //  We don't strictly need there to be existing data for an
            //  update. We'll create an item using the supplied id.
            if (TP.notValid(resultData = theDB.at(id))) {

                resultData = TP.hc(
                                '_id', id,
                                '_date_created', TP.dc(),
                                '_body', body);
            } else {
                //  There was existing data... update it.
                resultData.atPut('_body', body);
            }

            resultData.atPut('_date_modified', TP.dc());

            theDB.atPut(id, resultData);

            needsFlush = true;

            //  Assign what gets returned from here to match the CouchDB
            //  return value.
            resultData = TP.hc('ok', true, '_id', id);

            break;

        default:
            break;
    }

    if (needsFlush) {

        try {
            storageInstance.atPut(TP.LOCALSTORAGE_DB_NAME, TP.js2json(allDBs));
        } catch (e) {
            resultStr = e.message;

            commObj.responseType = '';
            commObj.status = 500;
            commObj.statusText = '500 ' + resultStr;

            request.fail(resultStr);
        }
    }

    str = TP.str(resultData);
    resultType = 'text';

    if (TP.isJSONString(resultData)) {
        resultType = 'json';
    } else if (TP.regex.CONTAINS_ELEM_MARKUP.test(resultData)) {
        resultData = TP.documentFromString(resultData);
        resultType = 'document';
    }

    commObj.response = resultData;
    commObj.responseType = resultType;
    commObj.responseText = str;
    commObj.responseXML = TP.isDocument(resultData) ? resultData : null;

    request.complete(resultData);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
