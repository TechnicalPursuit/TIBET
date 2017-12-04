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
 * @type {TP.core.PouchDBURLHandler}
 * @summary A URI handler type that can store and load from 'pouchdb://' URIs.
 */

//  ------------------------------------------------------------------------

TP.core.URIHandler.defineSubtype('PouchDBURLHandler');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.PouchDBURLHandler.Type.defineAttribute('watchers');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.PouchDBURLHandler.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.addPackagingDependency(TP.extern.PouchDB);

    return;
});

//  ------------------------------------------------------------------------
//  CONTENT METHODS
//  ------------------------------------------------------------------------

TP.core.PouchDBURLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content and returns it on request. This is a
     *     template method which defines the overall process used for loading
     *     URI data and ensuring that the URI's cache and header content are
     *     kept up to date. You should normally override one of the more
     *     specific load* methods in subtypes if you're doing custom load
     *     handling.
     * @param {TP.core.URI} targetURI The URI to load. NOTE that this URI will
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

    if (dbName === '_all_dbs') {
        action = 'listDBs';
    } else if (request.at('method') === TP.HTTP_HEAD) {
        action = 'retrieveItemInfo';
    } else if (TP.isValid(resourceID)) {
        if (resourceID === '_all_docs') {
            action = 'retrieveDBInfo';
        } else {
            action = 'retrieveItem';
        }
    } else {
        //  Note that this merely creates a database if it doesn't exist and
        //  returns - no harm done.
        action = 'createDB';
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

    //  Construct and initialize a TP.sig.PouchDBRequest
    loadRequest = TP.sig.PouchDBRequest.construct(requestParams);

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

TP.core.PouchDBURLHandler.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes the target URL.
     * @param {TP.core.URI} targetURI The URI to delete. NOTE that this URI will
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

    //  Construct and initialize a TP.sig.PouchDBRequest
    deleteRequest = TP.sig.PouchDBRequest.construct(requestParams);

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

TP.core.PouchDBURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
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

        method,

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

        void 0;

        //  TODO: Figure this out.
        //  content = targetURI.get('$lastAdded');
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

    method = request.at('method');

    //  If we weren't given a method, try to 'do the right thing' here. If a
    //  valid resource ID wasn't supplied, then use POST (which PouchDB will
    //  interpret as an indication to generate the ID). Otherwise, use PUT.
    if (TP.notValid(method)) {
        if (TP.notValid(resourceID)) {
            method = TP.HTTP_POST;
        } else {
            method = TP.HTTP_PUT;
        }
    }

    //  If the user forces a POST, then we go ahead and configure the request to
    //  be 'createItem' - otherwise, we specify 'updateOrConstructItem' and let
    //  the service object handle the case where an item needs to be created.
    if (method === TP.HTTP_POST) {

        requestParams = TP.hc(
                        'action', 'createItem',
                        'dbName', dbName,
                        'securePW', securePW,
                        'body', content,
                        'uri', targetURI.getLocation());
    } else {

        if (TP.notValid(resourceID)) {
            request.fail('No resource ID specified for: ' + TP.str(targetURI));

            return response;
        }

        requestParams = TP.hc(
                        'action', 'updateOrConstructItem',
                        'dbName', dbName,
                        'securePW', securePW,
                        'id', resourceID,
                        'body', content,
                        'uri', targetURI.getLocation());
    }

    //  Construct and initialize a TP.sig.PouchDBRequest
    saveRequest = TP.sig.PouchDBRequest.construct(requestParams);

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

TP.core.PouchDBURLHandler.Type.defineMethod('watch',
function(targetURI, aRequest) {

    /**
     * @method watch
     * @summary Watches for changes to the URLs PouchDB resource.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        response,

        dbName,
        theDB,

        watchers,
        watcher;

    request = TP.request(aRequest);
    response = request.getResponse();

    if (TP.notValid(dbName = targetURI.get('dbName'))) {
        request.fail('No db name specified for: ' + TP.str(targetURI));

        return response;
    }

    if (TP.notValid(theDB = new TP.extern.PouchDB(dbName))) {
        request.fail(
                TP.sc('Cannot open pouchDB database named: ' + dbName));

        return response;
    }

    //  This type keeps a hash of 'watchers' - with the dbName as the key and a
    //  PouchDB 'changes' object as the value.
    if (TP.notValid(watchers = this.get('watchers'))) {
        watchers = TP.hc();
        this.set('watchers', watchers);

        this.observe(TP.sys, 'TP.sig.AppShutdown');
    }

    //  If there was no valid watcher for this database. Create one and
    //  configure it's event handler.
    if (TP.notValid(watcher = watchers.at(dbName))) {

        watcher = theDB.changes(
            {
                since: 'now',
                live: true,
                include_docs: true
            });
        watchers.atPut(dbName, watcher);

        //  Configure the 'change' event on the watcher to signal a URI change
        //  when notified of a change.
        watcher.on('change',
                    function(change) {
                        var doc,
                            id,

                            loc,
                            action,
                            uri;

                        if (TP.notValid(doc = change.doc)) {
                            return this.raise(
                                    'TP.sig.InvalidDocument',
                                    'Invalid document from change event.');
                        }

                        if (!TP.isString(id = doc._id)) {
                            return this.raise(
                                    'TP.sig.InvalidString',
                                    'Invalid document ID from change event.');
                        }

                        //  Form a URI location from the dbName and id
                        loc = 'pouchdb://' + dbName + '/' + id;

                        //  If the date create and the date modified are the
                        //  same, then the action is TP.CREATE, otherwise we're
                        //  updating so it's TP.UPDATE
                        action = doc.date_created === doc.date_modified ?
                                    TP.CREATE :
                                    TP.UPDATE;

                        //  Look up the URI without creating a new one if it
                        //  doesn't exist.
                        if (TP.isURI(uri = TP.core.URI.getInstanceById(loc))) {

                            //  Signal a 'TP.sig.ValueChange' from the URI,
                            //  using the computed action and supplying a new
                            //  value.
                            //  Note that the value for TP.NEWVAL should give us
                            //  the value that the other service calls do. See
                            //  the TP.core.PouchDBService type.
                            uri.$changed(
                                'value',
                                action,
                                TP.hc(TP.NEWVAL, TP.js2json(change.doc)));
                        }
                    });

        //  We keep a count of the number of times this watcher is used for a
        //  particular database. When it's 0, this watcher will be canceled.
        watcher._watcherCount = 1;
    } else {

        //  There was already a watcher for this database, but we need to
        //  increment it's watcherCount by 1 to keep track of how many URIs were
        //  interested in it. This is so that the 'unwatch' below knows when to
        //  cancel it (when watcherCount reaches 0).
        watcher._watcherCount++;
    }

    return response;
});

//  ------------------------------------------------------------------------

TP.core.PouchDBURLHandler.Type.defineHandler('AppShutdown',
function(aSignal) {

    /**
     * @method handleAppShutdown
     * @summary Handles when the app is about to be shut down. This is used to
     *     try to cancel any PouchDB watchers that are notifying us of changes
     *     to URLs that represent their resources.
     * @param {TP.sig.AppShutdown} aSignal The signal indicating that the
     *     application is to be shut down.
     * @returns {TP.core.PouchDBURLHandler} The receiver.
     */

    var watchers;

    //  This type keeps a hash of 'watchers' - with the dbName as the key and a
    //  PouchDB 'changes' object as the value.
    if (TP.notEmpty(watchers = this.get('watchers'))) {

        //  Get every watcher and cancel it - we're done.
        watchers.getValues().forEach(
                    function(watcher) {
                        watcher.cancel();
                    });
    }

    //  Ignore the app shutdown signal - we're done.
    this.ignore(TP.sys, 'TP.sig.AppShutdown');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.PouchDBURLHandler.Type.defineMethod('unwatch',
function(targetURI, aRequest) {

    /**
     * @method unwatch
     * @summary Removes any watches for changes to the URLs PouchDB resource.
     *     See this type's 'watch' method for more information.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        response,

        dbName,

        watchers,
        watcher;

    request = TP.request(aRequest);
    response = request.getResponse();

    if (TP.notValid(dbName = targetURI.get('dbName'))) {
        request.fail('No db name specified for: ' + TP.str(targetURI));

        return response;
    }

    //  This type keeps a hash of 'watchers' - with the dbName as the key and a
    //  PouchDB 'changes' object as the value.
    if (TP.notEmpty(watchers = this.get('watchers'))) {

        //  Grab the watcher for the database.
        watcher = watchers.at(dbName);

        //  If it's a valid watcher, decrement the count (the number of times
        //  it's been asked to watch) and check the count.
        if (TP.isValid(watcher)) {

            //  Decrement the watcher count - we're being unwatched.
            watcher._watcherCount--;

            //  If the count is back at 0, then we cancel the watcher and remove
            //  it from dictionary of watchers.
            if (watcher._watcherCount === 0) {
                watcher.cancel();
                watchers.removeKey(dbName);
            }
        }
    }

    //  No more watchers in the dictionary? Ignore the app shutdown signal.
    if (TP.isEmpty(watchers)) {
        this.ignore(TP.sys, 'TP.sig.AppShutdown');
    }

    return response;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
