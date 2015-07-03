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

TP.tds.TDSURLHandler.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time type initialization.
     */

    //  No instances of this object are created, so we need to finalize traits
    //  on type initialization.
    this.finalizeTraits();

    //  We use the SSE signal source as our watcher signal source type.
    this.set('watcherSignalSourceType', 'TP.core.SSESignalSource');

    //  The signal source URI to use to watch notifications from the TDS is the
    //  app root followed by the cfg variable that the TDS itself is using to
    //  publish changes to.
    this.set('watcherSignalSourceURI',
                TP.uc(TP.uriJoinPaths(TP.sys.cfg('path.app_root'),
                                        TP.sys.cfg('tds.watch.uri'))));

    //  The signal that this object (yes, the type itself) will be observing
    //  from the watcher and that the watcher will signal when it needs to
    //  notify of a change.
    this.set('watcherSignalType', 'TP.sig.TDSFileChangeSignal');

    return;
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
        origin,

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

    //  The origin comes from the SSE data and will be server URL, minus the
    //  actual file path.
    origin = payload.at('origin').asString();

    //  Strip any enclosing quotes from the path.
    path = path.asString().stripEnclosingQuotes();

    //  Join the two together to form the full URL path
    fileName = TP.uriJoinPaths(origin, path);

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
