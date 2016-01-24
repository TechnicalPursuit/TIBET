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
     * @returns {TP.sig.RemoteURLChange} The type that will be
     *     instantiated to construct new signals that notify observers that the
     *     *remote* version of the supplied URI's resource has changed. At this
     *     level, this returns the common supertype of all such signals.
     */

    return TP.sig.CouchDBChange;
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

        changesFeedLoc,

        watcherLoc,
        watcherURI;

    //  We grab the URI's path parts
    pathParts = aURI.getPathParts();

    //  If there are no path parts, or the first part is '_all_dbs', then the
    //  supplied URI is referencing the server itself. Therefore, set up a
    //  watcher on the '_db_updates' feed.
    if (TP.isEmpty(pathParts) || pathParts.first() === '_all_dbs') {
        watcherLoc = TP.ac(aURI.getRoot(),
                            '_db_updates?feed=eventsource').join('/');
    } else {
        //  Otherwise, we are observing database-level changes, so we set up a
        //  watcher on that database's '_changes' feed.

        //  If we're observing changes on a design document, then we want the
        //  changes feed to include docs
        if (pathParts.at(1) === '_design') {
            changesFeedLoc = '_changes?feed=eventsource&include_docs=true';
        } else {
            //  Otherwise, we don't want docs
            changesFeedLoc = '_changes?feed=eventsource';
        }

        //  Join together the URI's root, the first path part (which, for
        //  CouchDB) is the database name, and the standard 'changes feed'
        //  portion.
        watcherLoc = TP.ac(aURI.getRoot(),
                            pathParts.first(),
                            changesFeedLoc).join('/');
    }

    if (!TP.isURIString(watcherLoc)) {
        return null;
    }

    watcherURI = TP.uc(watcherLoc);

    //  Make sure to switch *off* refreshing for the watcher URI itself
    watcherURI.set('shouldRefresh', false);

    return watcherURI;
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

    //  If there was a property named 'doc' in the data and it has a property
    //  named '_attachments', then we're observing a design document.
    if (TP.isValid(doc = data.at('doc')) &&
        TP.isValid(attachments = doc.at('_attachments'))) {

        //  Grab the '_rev' number
        rawRev = data.at('doc').at('_rev')
        rev = rawRev.slice(0, rawRev.indexOf('-')).asNumber();

        //  Iterate over all of the attachments and grab the one whose 'revpos'
        //  matches the rev number that changed.
        entry = attachments.detect(
                    function(kvPair) {
                        if (kvPair.last().at('revpos') === rev) {
                            return true;
                        }
                        return false
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

TP.couchdb.CouchDBURLHandler.Type.defineMethod('watch',
function(targetURI, aRequest) {

    /**
     * @method watch
     * @summary Watches for changes to the URLs remote resource, if the server
     *     that is supplying the remote resource notifies us when the URL has
     *     changed.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var pathParts,

        watchedLoc,
        watchedURI;

    //  We grab the URI's path parts
    pathParts = targetURI.getPathParts();

    //  If the URI has more than 1 'path parts', then it's a database or a
    //  URL under the database. We join the root and the first path part to
    //  point to the database (which is where we'll observe changes) to form the
    //  'watched URI'
    if (pathParts.getSize() > 1) {
        watchedLoc = TP.ac(targetURI.getRoot(), pathParts.first()).join('/');
        watchedURI = TP.uc(watchedLoc);

        //  Set our watched URI's 'autoRefresh' setting to that of the target
        //  URI.
        watchedURI.set('autoRefresh', targetURI.get('autoRefresh'));
    } else if (pathParts.first() === '_all_dbs') {
        //  Otherwise, if the first path part is '_all_dbs', then we'll be
        //  using the '_db_updates' feed, so we just use the root URI as the
        //  'watched URI'
        watchedURI = TP.uc(targetURI.getRoot());

        //  Set our watched URI's 'autoRefresh' setting to that of the target
        //  URI.
        watchedURI.set('autoRefresh', targetURI.get('autoRefresh'));
    } else {

        //  Otherwise, just use the target URI as the 'watched URI'
        watchedURI = targetURI;
    }

    return this.callNextMethod(watchedURI, aRequest);
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('unwatch',
function(targetURI, aRequest) {

    /**
     * @method unwatch
     * @summary Removes any watches for changes to the URLs remote resource. See
     *     this type's 'watch' method for more information.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var pathParts,

        unwatchedLoc,
        unwatchedURI;

    //  We grab the URI's path parts
    pathParts = targetURI.getPathParts();

    //  If the URI has more than 1 'path parts', then it's a database or a
    //  URL under the database. We join the root and the first path part to
    //  point to the database (which is where we'll observe changes) to form the
    //  'unwatched URI'
    if (pathParts.getSize() > 1) {
        unwatchedLoc = TP.ac(targetURI.getRoot(), pathParts.first()).join('/');
        unwatchedURI = TP.uc(unwatchedLoc);
    } else if (pathParts.first() === '_all_dbs') {
        //  Otherwise, if the first path part is '_all_dbs', then we'll be
        //  using the '_db_updates' feed, so we just use the root URI as the
        //  'unwatched URI'
        unwatchedURI = TP.uc(targetURI.getRoot());
    } else {

        //  Otherwise, just use the target URI as the 'unwatched URI'
        unwatchedURI = targetURI;
    }

    return this.callNextMethod(unwatchedURI, aRequest);
});

//  =======================================================================
//  TP.sig.CouchDBChange
//  ========================================================================

TP.sig.RemoteURLChange.defineSubtype('CouchDBChange');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
