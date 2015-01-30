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
 *     system under the name 'TP.core.LocalDBStorageServiceDefault'.
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
                        'triggerSignals', 'TP.sig.LocalDBStorageRequest');

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

TP.core.LocalDBStorageService.Inst.defineMethod('handleLocalDBStorageRequest',
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

        rowData;

    request = TP.request(aRequest);

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    if (TP.notValid(storageInstance = TP.core.LocalStorage.construct())) {
        request.fail(
                TP.sc('Cannot open local DB storage instance.'));

        return this;
    }

    needsFlush = false;

    if (TP.notValid(
        allDBsValue = storageInstance.at(TP.LOCALSTORAGE_DB_NAME))) {

        allDBs = TP.hc();
        needsFlush = true;
    } else {
        if (TP.notValid(allDBs = TP.json2js(allDBsValue))) {
            request.fail(
                    TP.sc('Local DB storage instance is corrupted.'));

            return this;
        }
    }

    id = aRequest.at('id');
    dbName = aRequest.at('dbName');
    body = aRequest.at('body');

    resultData = null;

    produceResultOutput = function (aRecord) {
        var output,
            outBody;

        output = aRecord.copy();

        outBody = output.at('_body');

        if (TP.notEmpty(securePW = aRequest.at('securePW'))) {
            outBody = TP.decryptStorageValue(outBody, securePW);
            output.atPut('_body', outBody);
        }

        return output;
    };

    switch (aRequest.at('action')) {
        case    'deleteDB':

            if (TP.notValid(allDBs.at(dbName))) {
                request.fail(
                        TP.sc(
                        'Can\'t delete non-existent database named: ',
                            dbName, '.'));

                return this;
            }

            allDBs.removeKey(dbName);

            //  Assign what gets returned from here to match the CouchDB
            //  return value.
            resultData = TP.hc('ok', true);

            needsFlush = true;

        break;

        case    'deleteItem':

            if (TP.notValid(theDB = allDBs.at(dbName))) {
                request.fail(
                        TP.sc(
                        'Can\'t delete item in non-existent database named: ',
                            dbName, '.'));

                return this;
            }

            if (TP.notValid(resultData = theDB.at(id))) {
                request.fail(
                        TP.sc('Can\'t find item with id: ', id,
                                ' in database:', dbName, ' to delete.'));

                return this;
            }

            theDB.removeKey(id);

            //  Assign what gets returned from here to match the CouchDB
            //  return value.
            resultData = TP.hc('ok', true);

            needsFlush = true;

        break;

        case    'retrieveItem':

            if (TP.isValid(theDB = allDBs.at(dbName))) {

                if (TP.isValid(theDB.at(id))) {
                    resultData = produceResultOutput(theDB.at(id));
                }
            }

        break;

        case    'retrieveItemInfo':

            if (TP.isValid(theDB = allDBs.at(dbName))) {
                resultData = theDB.at(id);
                resultData = TP.hc(
                        '_date_created', resultData.at('_date_created'),
                        '_date_modified', resultData.at('_date_modified'));
            }

        break;

        case    'retrieveDBInfo':

            if (TP.isValid(theDB = allDBs.at(dbName))) {
                resultData = TP.hc('total_rows', theDB.getSize());
                rowData = TP.ac();
                theDB.perform(
                        function (kvPair) {
                            rowData.push(produceResultOutput(kvPair.last()));
                        });
                resultData.atPut('rows', rowData);
            }

        break;

        case    'createItem':

            if (TP.notValid(theDB = allDBs.at(dbName))) {
                theDB = TP.hc();
                allDBs.atPut(dbName, theDB);
            }

            if (TP.isValid(theDB.at(id))) {
                request.fail(
                        TP.sc('Already had item with id: ', id,
                                ' in database:', dbName, '.'));

                //  Do not 'return' here - fall through, in case needsFlush is
                //  true and we want to store DB structure anyway...
            } else {

                //  Make sure we have a real id
                id = TP.isEmpty(id) ? TP.genUUID() : id;

                if (TP.notEmpty(securePW = aRequest.at('securePW'))) {
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

        case    'updateItem':

            if (TP.notValid(theDB = allDBs.at(dbName))) {
                theDB = TP.hc();
                allDBs.atPut(dbName, theDB);
            }

            if (TP.notEmpty(securePW = aRequest.at('securePW'))) {
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
        storageInstance.atPut(TP.LOCALSTORAGE_DB_NAME, TP.js2json(allDBs));
    }

    aRequest.complete(resultData);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
