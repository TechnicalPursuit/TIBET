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
 * @summary A subtype of HTTPURLHandler that manages URLs coming from the TDS.
 *     The TDS can provide change notifications about the URLs it manages and
 *     this type can then dispatch those changes into the TIBET change
 *     notification system.
 */

//  ------------------------------------------------------------------------

TP.core.HTTPURLHandler.defineSubtype('couchdb.CouchDBURLHandler');

TP.couchdb.CouchDBURLHandler.addTraits(TP.core.RemoteURLWatchHandler);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('getWatcherSignalSourceType',
function(aURI) {

    /**
     * @method getWatcherSignalSourceType
     * @summary Returns the TIBET type of the watcher signal source. Typically,
     *     this is one of the prebuilt TIBET watcher types, like
     *     TP.core.SSESignalSource for Server-Sent Event sources.
     * @param {TP.core.URI} aURI The URI representing the resource to be
     *     watched.
     * @returns {TP.core.SSESignalSource} The type that will be instantiated to
     *     make a watcher for the supplied URI.
     */

    return TP.core.SSESignalSource;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('getWatcherSignalType',
function(aURI) {

    /**
     * @method getWatcherSignalType
     * @summary Returns the TIBET type of the watcher signal. This will be the
     *     signal that the signal source sends when it wants to notify URIs of
     *     changes.
     * @param {TP.core.URI} aURI The URI representing the resource to be
     *     watched.
     * @returns {TP.sig.RemoteURLChangeSignal} The type that will be
     *     instantiated to construct new signals that notify observers that the
     *     *remote* version of the supplied URI's resource has changed. At this
     *     level, this returns the common supertype of all such signals.
     */

    return TP.sig.CouchDBChangeSignal;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('getWatcherURI',
function(aURI) {

    /**
     * @method getWatcherURI
     * @summary Returns the URI to the resource that acts as a watcher to watch
     *     for changes to the resource of the supplied URI.
     * @param {TP.core.URI} aURI The URI representing the resource to be
     *     watched.
     * @returns {TP.core.URI} A URI pointing to the resource that will notify
     *     TIBET when the supplied URI's resource changes.
     */

    var pathParts,
        watcherLoc;

    //  We grab the URI's path parts
    pathParts = aURI.getPathParts();

    //  Join together the URI's root, the first path part (which, for CouchDB)
    //  is the database name, and the standard 'changes feed' portion.
    watcherLoc = TP.ac(aURI.getRoot(),
                        pathParts.first(),
                        '_changes?feed=eventsource').join('/');

    if (!TP.isURI(watcherLoc)) {
        return null;
    }

    return TP.uc(watcherLoc);
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('handleCouchDBChangeSignal',
function(aSignal) {

    /**
     * @method handleCouchDBChangeSignal
     * @summary Handles when a TDS-managed resource has changed.
     * @param {TP.sig.CouchDBChangeSignal} aSignal The signal indicating that a
     *     TDS-managed resource has changed.
     * @returns {TP.couchdb.CouchDBURLHandler} The receiver.
     */

    var payload,
        data,

        signalSourceURL,

        path,
        origin,

        urlLoc,
        url;

    //  Make sure that the system is currently configured to process remote
    //  changes.
    if (TP.notTrue(TP.sys.cfg('uri.process_remote_changes'))) {
        return;
    }

    //  Make sure that we have a payload
    if (TP.notValid(payload = aSignal.getPayload())) {
        return;
    }

    //  And that we have SSE data in that payload
    data = payload.at('data');
    if (TP.notValid(data)) {
        return;
    }

    //  For CouchDB, we observe at a database-level, so we want the database
    //  URL.
    signalSourceURL = TP.uc(payload.at('sourceURL'));
    if (!TP.isURI(signalSourceURL)) {
        return;
    }

    //  Get the path and slice off from the first slash to where the '/_changes'
    //  portion starts. This will give us our database name - the database that
    //  changed.
    path = signalSourceURL.getPath();
    path = path.slice(1, path.indexOf('/_changes'));

    //  The origin comes from the SSE data and will be server URL, minus the
    //  actual file path.
    origin = payload.at('origin').asString();

    //  Strip any enclosing quotes from the path.
    path = path.asString().stripEnclosingQuotes();

    //  Join the two together to form the full URL path
    urlLoc = TP.uriJoinPaths(origin, path);

    //  If we can successfully create a URL from the data, then process the
    //  change.
    if (TP.isURI(url = TP.uc(urlLoc))) {
        TP.core.URI.processRemoteResourceChange(url);
    }

    return this;
});

//  =======================================================================
//  TP.sig.CouchDBChangeSignal
//  ========================================================================

TP.sig.RemoteURLChangeSignal.defineSubtype('CouchDBChangeSignal');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
