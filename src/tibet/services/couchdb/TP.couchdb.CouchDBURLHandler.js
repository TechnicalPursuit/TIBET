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

TP.couchdb.CouchDBURLHandler.Type.defineMethod('getCouchURL',
function(options) {

    /**
     * @method getCouchURL
     * @summary Computes the proper CouchDB URL for use as a base URL.
     * @param {Object} [options] A parameter block with possible user/pass data
     *     if using basic authentication to access CouchDB.
     * @return {String} The database url.
     */

    var opts,
        cfg_root,
        db_scheme,
        db_host,
        db_port,
        db_user,
        db_pass,
        db_url;

    opts = options || {};

    cfg_root = opts.cfg_root || 'tds.couch';

    db_url = TP.ifInvalid(opts.db_url, TP.sys.cfg('tds.couch.db_url'));
    if (!db_url) {
        //  Build up from config or defaults as needed.
        db_scheme = opts.db_scheme ||
            TP.sys.getcfg(cfg_root + '.scheme') || 'http';
        db_host = opts.db_host ||
            TP.sys.getcfg(cfg_root + '.host') || '127.0.0.1';
        db_port = opts.db_port ||
            TP.sys.getcfg(cfg_root + '.port') === undefined ? '5984' :
                TP.sys.getcfg(cfg_root + '.port');

        //  NOTE these are ENV variables on the server. In the client we allow
        //  them to be set temporarily via config but that is NOT SECURE.
        db_user = TP.ifInvalid(opts.db_user, TP.sys.cfg('tds.couch.db_user'));
        db_pass = TP.ifInvalid(opts.db_pass, TP.sys.cfg('tds.couch.db_pass'));

        //  Watch out for special chars, esp in the password.
        if (db_user) {
            db_user = encodeURIComponent(db_user);
        }

        if (db_pass) {
            db_pass = encodeURIComponent(db_pass);
        }

        db_url = db_scheme + '://';
        if (db_user && db_pass) {
            db_url += db_user + ':' + db_pass + '@' + db_host;
        } else {
            db_url += db_host;
        }

        if (db_port) {
            db_url += ':' + db_port;
        }
    }

    return db_url;
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
        db_url,
        targets;

    db_url = this.getCouchURL();
    list = TP.ac();

    targets = TP.sys.cfg('uri.watch_couchdb_uris');
    targets.forEach(function(target) {
        var url;

        url = TP.uriJoinPaths(db_url, target);
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
