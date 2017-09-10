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
 * @type {TP.couchdb.CouchDBURLHandler}
 * @summary A URL handler that manages URLs coming from CouchDB. Changes from
 *     CouchDB come in the form of the CouchDB changes feed, which this handler
 *     can be configured to observe. NOTE that CouchDB observations are done
 *     independently of the 'tds.watch' configuration. This independence lets
 *     you interact with both the TDS and CouchDB as needed.
 */

//  ------------------------------------------------------------------------

TP.core.HTTPURLHandler.defineSubtype('couchdb.CouchDBURLHandler');

TP.couchdb.CouchDBURLHandler.addTraits(TP.core.RemoteURLWatchHandler);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Configuration names for the include/exclude configuration setting for the
//  remote url watcher types which mix this in.
TP.couchdb.CouchDBURLHandler.set('includeConfigName',
    'tds.couch.watch.include');
TP.couchdb.CouchDBURLHandler.set('excludeConfigName',
    'tds.couch.watch.exclude');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('activateRemoteWatch',
function() {

    /**
     * @method activateRemoteWatch
     * @summary Performs any processing necessary to activate observation of
     *     remote URL changes.
     */

    var sourceType,
        signalType,
        thisref;

    if (TP.notTrue(TP.sys.cfg('uri.watch_couchdb_changes'))) {
        return;
    }

    sourceType = this.getWatcherSourceType();
    signalType = this.getWatcherSignalType();

    thisref = this;

    //  For Couch we set up multiple observations against different URIs.
    this.getWatcherSourceURIs().perform(
        function(sourceURI) {
            var signalSource;

            signalSource = sourceType.construct(
                                        sourceURI.getLocation(),
                                        TP.hc('withCredentials', true));
            if (TP.notValid(signalSource)) {
                return thisref.raise('InvalidURLWatchSource');
            }

            thisref.observe(signalSource, signalType);
        });

    return;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('deactivateRemoteWatch',
function() {

    /**
     * @method deactivateRemoteWatch
     * @summary Performs any processing necessary to shut down observation of
     *     remote URL changes.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('getWatcherSignalType',
function() {

    /**
     * @method getWatcherSignalType
     * @summary Returns the TIBET type of the watcher signal. This will be the
     *     signal that the signal source sends when it wants to notify URIs of
     *     changes.
     * @returns {TP.sig.RemoteURLChange} The type that will be
     *     instantiated to construct new signals that notify observers that the
     *     *remote* version of the supplied URI's resource has changed. At this
     *     level, this returns the common supertype of all such signals.
     */

    return TP.sig.CouchDBChange;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('getWatcherSourceURIs',
function() {

    /**
     * @method getWatcherSourceURIs
     * @summary Returns an array of URIs which are needed to observe CouchDBs
     *     various change feeds.
     * @returns {TP.core.URI} A URI pointing to the resource that will notify
     *     TIBET when the supplied URI's resource changes.
     */

    var list,
        rootURL,
        targets;

    rootURL = TP.sys.getcfg('uri.couchdb_urls').first().last();

    list = TP.ac();

    targets = TP.sys.cfg('uri.watch_couchdb_uris');
    targets.forEach(
            function(target) {
                var url;

                url = TP.uriJoinPaths(rootURL, target);
                if (TP.isURIString(url)) {
                    list.push(url);
                }
            });

    return list;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineHandler('CouchDBChange',
function(aSignal) {

    /**
     * @method handleCouchDBChange
     * @summary Handles when a TDS-managed resource has changed.
     * @param {TP.sig.CouchDBChange} aSignal The signal indicating that a
     *     TDS-managed resource has changed.
     * @returns {TP.couchdb.CouchDBURLHandler} The receiver.
     */

    var payload,
        data,
        doc,
        attachments,
        rawRev,
        rev,
        entry,
        signalSourceURL,
        path,
        changesPathIndex,
        origin,
        urlLoc,
        url;

    //  Make sure that we have a payload
    if (TP.notValid(payload = aSignal.getPayload())) {
        return;
    }

    //  And that we have SSE data in that payload
    data = payload.at('data');
    if (TP.notValid(data)) {
        return;
    }

    //  If there was a property named 'doc' in the data and it has a property
    //  named '_attachments', then we're observing a design document.
    if (TP.isValid(doc = data.at('doc')) &&
        TP.isValid(attachments = doc.at('_attachments'))) {

        //  Grab the '_rev' number
        rawRev = data.at('doc').at('_rev');
        rev = rawRev.slice(0, rawRev.indexOf('-')).asNumber();

        //  Iterate over all of the attachments and grab the one whose 'revpos'
        //  matches the rev number that changed.
        entry = attachments.detect(
                    function(kvPair) {
                        if (kvPair.last().at('revpos') === rev) {
                            return true;
                        }
                        return false;
                    });

        //  If we successfully found one, then the first item in it's key/value
        //  pair was the URL that changed.
        if (TP.isValid(entry)) {
            urlLoc = TP.uriJoinPaths(TP.uc('~app').getLocation(),
                                        entry.first());
        }

    } else {
        //  Otherwise, these changes came from a changes feed monitoring pure
        //  data, not the URLs making up a CouchApp.

        //  For CouchDB, we observe at a database-level, so we want the database
        //  URL.
        signalSourceURL = TP.uc(payload.at('sourceURL'));
        if (!TP.isURI(signalSourceURL)) {
            return;
        }

        path = signalSourceURL.getPath();

        //  Slice off the portion of the path from the first slash to where the
        //  '/_changes' portion starts. This will give us our database name -
        //  the database that changed. If there is no '/_changes' portion, then
        //  this must be an observation on the '_db_updates' feed, so we just
        //  set the path to the empty String.
        changesPathIndex = path.indexOf('/_changes');
        if (changesPathIndex !== TP.NOT_FOUND) {

            path = path.slice(1, changesPathIndex);

            //  Strip any enclosing quotes from the path.
            path = path.asString().stripEnclosingQuotes();

        } else {
            path = '';
        }

        //  The origin comes from the SSE data and will be server URL, minus the
        //  actual file path.
        origin = payload.at('origin').asString();

        //  Join the two together to form the full URL path
        urlLoc = TP.uriJoinPaths(origin, path);
    }

    //  If we can successfully create a URL from the data, then process the
    //  change.
    if (TP.isURI(url = TP.uc(urlLoc))) {
        TP.core.URI.processRemoteResourceChange(url);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('isWatchableURI',
function(targetURI) {

    /**
     * @method isWatchableURI
     * @summary Tests a URI against include/exclude filters to determine if
     *     changes to the URI should be considered for processing.
     * @param {String|TP.core.URI} targetURI The URI to test.
     * @returns {Boolean} true if the URI passes include/exclude filters.
     */

    //  TODO: In actuality, only some CouchDB URIs are watchable, but for now we
    //  always return true.

    return true;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('maskCouchAuth',
function(url) {

    /**
     * @method maskCouchAuth
     * @summary Returns a version of the url provided with any user/pass
     *     information masked out. This is used for prompts and logging where
     *     basic auth data could potentially be exposed to view.
     * @param {String} url The URL to mask.
     * @returns {String} The masked URL.
     */

    var regex,
        match,
        newurl;

    //  scheme://(user):(pass)@hostetc...
    regex = /(.*)\/\/(.*):(.*)@(.*)/;

    if (!regex.test(url)) {
        return url;
    }

    match = regex.exec(url);
    newurl = match[1] + '//' + match[4];

    return newurl;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.core.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request;

    request = TP.request(aRequest);

    //  Currently, CouchDB can only deal with 'simple CORS' (i.e. no preflight
    //  requests, etc.). Configure that here so that TIBET's low-level HTTP
    //  machinery doesn't try to send such things.
    request.atPut('simple_cors_only', true);

    return this.callNextMethod(targetURI, request);
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes a URI entirely, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.core.URI} targetURI The URI to delete. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request;

    request = TP.request(aRequest);

    //  Currently, CouchDB can only deal with 'simple CORS' (i.e. no preflight
    //  requests, etc.). Configure that here so that TIBET's low-level HTTP
    //  machinery doesn't try to send such things.
    request.atPut('simple_cors_only', true);

    return this.callNextMethod(targetURI, request);
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Saves URI data content. This is the default data persistence
     *     method for most URI content. Important request keys include 'method',
     *     'crud', and 'body'. Method will typically default to a POST unless
     *     TP.sys.cfg(http.use_webdav) is true and the crud parameter is set to
     *     'insert', in which case a PUT is used. The crud parameter effectively
     *     defaults to 'update' so you should set it to 'insert' when new
     *     content is being created. The 'body' should contain the new/updated
     *     content, but this is normally configured by the URI's save() method
     *     itself.
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        saveURI;

    //  TODO: Only do this if targetURI is pointing to a CouchDB document

    request = TP.request(aRequest);

    saveURI = targetURI;

    //  Currently, CouchDB can only deal with 'simple CORS' (i.e. no preflight
    //  requests, etc.). Configure that here so that TIBET's low-level HTTP
    //  machinery doesn't try to send such things.
    request.atPut('simple_cors_only', true);

    //  Add a local handler for when the request succeeds that will update the
    //  '_rev' in the locally cached data to the new 'rev' sent back by the
    //  server.
    request.defineHandler('RequestSucceeded',
                function(aResponse) {
                    var newRev,
                        origData;

                    //  Grab the new 'rev' number from the result of the server
                    //  call.
                    newRev = aResponse.get('result').get('$.rev');

                    //  Using a JSONPath, set the value of '_rev' in the
                    //  original data to the new rev. This original data may be
                    //  used over and over again as updates are made, but per
                    //  CouchDB rules, it needs a new rev each time
                    origData = saveURI.getResource().get('result');
                    origData.set('$._rev', newRev);
                });

    return this.callNextMethod(targetURI, request);
});

//  =======================================================================
//  Registration
//  ========================================================================

//  Make sure the remote url watcher knows about this handler type, but wait to
//  do this after the type has been fully configured to avoid api check error.
TP.core.RemoteURLWatchHandler.registerWatcher(TP.couchdb.CouchDBURLHandler);

//  =======================================================================
//  TP.sig.CouchDBChange
//  ========================================================================

TP.sig.RemoteURLChange.defineSubtype('CouchDBChange');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
