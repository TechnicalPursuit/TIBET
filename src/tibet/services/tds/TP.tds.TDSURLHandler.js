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
     * @returns {TP.sig.TDSFileChange} The type that will be instantiated
     *     to construct new signals that notify observers that the *remote*
     *     version of the supplied URI's resource has changed.
     */

    return TP.sig.TDSFileChange;
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

    watcherURI = TP.uc(TP.uriJoinPaths(
                        TP.sys.cfg('path.app_root'),
                        TP.sys.cfg('tds.watch.uri')));

    //  Make sure to switch *off* refreshing for the watcher URI itself
    watcherURI.set('shouldRefresh', false);

    return watcherURI;
});

//  ------------------------------------------------------------------------

TP.tds.TDSURLHandler.Type.defineMethod('patch',
function(targetURI, aRequest) {

    /**
     * @method patch
     * @summary Patches the remote version of the resource pointed to by the
     *     supplied URI by saving a patch in the 'unified diff' format to the
     *     endpoint of a server (such as the TDS) that can handle a patching
     *     operation against that kind of remote resource.
     * @param {TP.core.URI} targetURI The URI to patch. NOTE that this URI will
     *     not have been rewritten/resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        response,

        localResult,
        localContent,

        promise;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        request.fail();
        return response;
    }

    localResult = targetURI.getResource().get('result');
    localContent = TP.str(localResult);

    //  This call will generate a patch using the supplied local content and
    //  will fetch the remote content from the targetURI *as it currently exists
    //  on the server* but *without updating the targetURI's resource with the
    //  remote content*.
    promise = targetURI.computeDiffPatchAgainst(localContent);

    promise.then(
            function(diffPatch) {
                if (TP.notEmpty(diffPatch)) {
                    return this.sendPatch(targetURI, diffPatch);
                }
                return null;
            }.bind(this)).then(
            function(successfulPatch) {
                request.set('result', successfulPatch);
                request.complete();
            });

    return response;
});

//  ------------------------------------------------------------------------

TP.tds.TDSURLHandler.Type.defineMethod('sendPatch',
function(targetURI, patch) {

    /**
     * @method sendPatch
     * @summary Sends an HTTP POST with the supplied diff patch String and
     *     virtual resource location to the server to try to patch the remote
     *     version of the resource pointed to by the receiver.
     * @param {TP.core.URI} targetURI The URI to patch. NOTE that this URI will
     *     not have been rewritten/resolved.
     * @param {String} patch A 'unified diff' patch String that will be used
     *     to patch the remote version of the resource pointed to by the
     *     receiver.
     * @returns {Promise} A Promise whose resolved value will be a Boolean
     *     indicating whether the patch operation was successful.
     */

    var patchVirtualLoc,
        patchURL,
        promise;

    //  Make sure that we have non-empty diff patch and virtual location
    //  Strings.
    if (TP.isEmpty(patch)) {
        return TP.extern.Promise.resolve(false);
    }

    patchVirtualLoc = targetURI.getVirtualLocation();
    if (TP.isEmpty(patchVirtualLoc)) {
        return this.raise('TP.sig.InvalidOperation',
            'Unable to locate source path for content.');
    }

    promise = TP.extern.Promise.construct(
                function(resolver, rejector) {

                    var patchRequest;

                    //  Construct a POST request for the patching operation.
                    //  Note here how it has a JSON mimetype, which is what the
                    //  patching service for the TDS expects.
                    patchRequest = targetURI.constructRequest(
                                            TP.hc('mimetype', TP.JSON_ENCODED));

                    patchRequest.defineHandler('RequestSucceeded',
                                                    function() {
                                                        resolver(true);
                                                    });

                    patchRequest.defineHandler('RequestFailed',
                                                    function() {
                                                        resolver(false);
                                                    });

                    //  Set the body for the request to the patching service URL
                    //  to what the patching service expects to see.
                    patchRequest.atPut('body',
                                            TP.hc('type', 'diff',
                                                    'nowatch', true,
                                                    'target', patchVirtualLoc,
                                                    'content', patch));

                    patchURL.httpPatch(patchRequest);
                });

    return promise;
});

//  ------------------------------------------------------------------------

TP.tds.TDSURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Saves URI data content. This is the default data persistence
     *     method for most URI content. In this type, this will call 'patch' if
     *     the supplied URI points to content that is 'patchable' by the TDS.
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        response;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        request.fail();
        return response;
    }

    if (!targetURI.canDiffPatch()) {
        return this.callNextMethod();
    }

    return this.patch(targetURI, aRequest);
});

//  ------------------------------------------------------------------------

TP.tds.TDSURLHandler.Type.defineHandler('TDSFileChange',
function(aSignal) {

    /**
     * @method handleTDSFileChange
     * @summary Handles when a TDS-managed resource has changed.
     * @param {TP.sig.TDSFileChange} aSignal The signal indicating that a
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
//  TP.sig.TDSFileChange
//  ========================================================================

TP.sig.RemoteURLChange.defineSubtype('TDSFileChange');

//  We configure our NATIVE_NAME to the same SSE-level event that the TDS is
//  configured to send.
TP.sig.TDSFileChange.Type.defineConstant('NATIVE_NAME',
    TP.sys.cfg('tds.watch.event'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
