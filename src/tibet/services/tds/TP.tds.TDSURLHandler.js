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
 * @type {TP.tds.TDSURLHandler}
 * @summary A subtype of HTTPURLHandler that manages URLs coming from the TDS.
 *     The TDS can provide change notifications about the URLs it manages and
 *     this type can then dispatch those changes into the TIBET change
 *     notification system.
 */

//  ------------------------------------------------------------------------

TP.core.HTTPURLHandler.defineSubtype('tds.TDSURLHandler');

TP.tds.TDSURLHandler.addTraits(TP.core.RemoteURLWatchHandler);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tds.TDSURLHandler.Type.defineMethod('getWatcherSignalSourceType',
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

TP.tds.TDSURLHandler.Type.defineMethod('getWatcherSignalType',
function(aURI) {

    /**
     * @method getWatcherSignalType
     * @summary Returns the TIBET type of the watcher signal. This will be the
     *     signal that the signal source sends when it wants to notify URIs of
     *     changes.
     * @param {TP.core.URI} aURI The URI representing the resource to be
     *     watched.
     * @returns {TP.sig.TDSFileChangeSignal} The type that will be instantiated
     *     to construct new signals that notify observers that the *remote*
     *     version of the supplied URI's resource has changed.
     */

    return TP.sig.TDSFileChangeSignal;
});

//  ------------------------------------------------------------------------

TP.tds.TDSURLHandler.Type.defineMethod('getWatcherURI',
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

    var watcherURI;

    watcherURI =  TP.uc(TP.uriJoinPaths(
                            TP.sys.cfg('path.app_root'),
                            TP.sys.cfg('tds.watch.uri')));

    //  Make sure to switch *off* refreshing for the watcher URI itself
    watcherURI.set('shouldRefresh', false);

    return watcherURI;
});

//  ------------------------------------------------------------------------

TP.tds.TDSURLHandler.Type.defineMethod('handleTDSFileChangeSignal',
function(aSignal) {

    /**
     * @method handleTDSFileChangeSignal
     * @summary Handles when a TDS-managed resource has changed.
     * @param {TP.sig.TDSFileChangeSignal} aSignal The signal indicating that a
     *     TDS-managed resource has changed.
     * @returns {TP.tds.TDSURLHandler} The receiver.
     */

    var payload,
        data,

        path,
        root,

        fileName,

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

    //  If we can't determine the file path we can't take action in any case.
    path = data.at('path');
    if (TP.isEmpty(path)) {
        return;
    }

    //  Get the root of our watch activity since all paths are provided relative
    //  to the watch root.
    root = TP.sys.cfg('tds.watch.root');
    root = TP.uriExpandPath(root);

    //  Strip any enclosing quotes from the path.
    path = path.asString().stripEnclosingQuotes();

    //  Join the two together to form the full URL path
    fileName = TP.uriJoinPaths(root, path);

    //  If we can successfully create a URL from the data, then process the
    //  change.
    if (TP.isURI(url = TP.uc(fileName))) {
        TP.core.URI.processRemoteResourceChange(url);
    }

    return this;
});

//  =======================================================================
//  TP.sig.TDSFileChangeSignal
//  ========================================================================

TP.sig.RemoteURLChangeSignal.defineSubtype('TDSFileChangeSignal');

//  We configure our NATIVE_NAME to the same SSE-level event that the TDS is
//  configured to send.
TP.sig.TDSFileChangeSignal.Type.defineConstant('NATIVE_NAME',
    TP.sys.cfg('tds.watch.event'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
