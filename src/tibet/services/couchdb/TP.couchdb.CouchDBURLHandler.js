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
//  Type Constants
//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineConstant(
    'DATABASE_PATH_MATCHER',
    /^[a-z]{1}[a-z0-9_$()+-]*\/$/);

TP.couchdb.CouchDBURLHandler.Type.defineConstant(
    'DATABASE_AND_DOCUMENT_PATH_MATCHER',
    /^[a-z]{1}[a-z0-9_$()+-]*\/[a-z0-9]+$/);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Configuration names for the include/exclude configuration setting for the
//  remote url watcher types which mix this in.
TP.couchdb.CouchDBURLHandler.set('includeConfigName',
    'tds.couch.watch.include');
TP.couchdb.CouchDBURLHandler.set('excludeConfigName',
    'tds.couch.watch.exclude');

//  Server roots that have been authenticated.
TP.couchdb.CouchDBURLHandler.Type.defineAttribute('authenticatedRoots');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.set('authenticatedRoots', TP.hc());

    return;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('activateRemoteWatch',
function() {

    /**
     * @method activateRemoteWatch
     * @summary Performs any processing necessary to activate observation of
     *     remote URL changes.
     */

    //  If we're not watching CouchDB changes, then exit here.
    if (TP.notTrue(TP.sys.cfg('couch.watch.changes'))) {
        return;
    }

    //  Push ourself as a controller onto the application's controller stack.
    //  This will allow us to receive the TP.sig.AppDidStart signal below.
    TP.sys.getApplication().pushController(this);

    return;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('addAuthenticatedRoot',
function(aRootLocation, authenticationData) {

    /**
     * @method addAuthenticatedRoot
     * @summary Adds the supplied root location to the list of authenticated
     *     roots. This method will also cause that authentication to time out
     *     according to the setting of 'couch.auth_timeout' (defaulted to
     *     600000ms).
     * @param {String} aRootLocation The root location that has been
     *     authenticated and needs to be tracked.
     * @param {TP.core.Hash} [authenticationData] Data about the authenticated
     *     user returned by the authentication call, such as their role.
     * @returns {TP.couchdb.CouchDBURLHandler} The receiver.
     */

    var authenticatedRoots;

    authenticatedRoots = this.get('authenticatedRoots');

    authenticatedRoots.atPut(aRootLocation,
                                TP.ifInvalid(authenticationData, TP.hc()));

    //  Set a timeout that will remove the root from the list of authenticated
    //  roots.
    /* eslint-disable no-extra-parens */
    setTimeout(
        function() {
            authenticatedRoots.removeKey(aRootLocation);
        }, (TP.sys.cfg('couch.auth_timeout', 600) * 1000));
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('authenticate',
function(aURI, username, password) {

    /**
     * @method authenticate
     * @summary Authenticate the supplied URI. This will actually authenticate
     *     the root of the supplied URI.
     * @param {TP.core.URI} aURI The URI to authenticate.
     * @param {String} [username] The username to use to authenticate. If this
     *     is not supplied, the user will be prompted to supply it.
     * @param {String} [password] The password to use to authenticate. If this
     *     is not supplied, the user will be prompted to supply it.
     * @returns {TP.sig.HTTPRequest} The authentication request.
     */

    var rootLoc,
        href,
        authRequest,

        thisref,

        loginFunc;

    //  ---

    //  Build an authentication request that we can post below.

    //  Construct the proper href to the authentication endpoint.
    rootLoc = aURI.getRoot();
    href = rootLoc + '/_session';

    //  Now, since we know we're talking to CouchDB over HTTP, we construct an
    //  HTTPRequest. This will allow enhanced error handling of this request,
    //  such as signaling signals like 401, for instance, if there is an invalid
    //  login.
    authRequest = TP.sig.HTTPRequest.construct(
                    'uri', href,
                    'headers',
                        TP.hc('Content-Type', TP.JSON_ENCODED),
                    'simple_cors_only', true);

    //  If the low-level IO request succeeds, then we add the root location as
    //  an authenticated root and tell the HTTPService to handle the new request
    //  directly.
    thisref = this;
    authRequest.defineHandler('IOSucceeded',
        function(aResponse) {

            var result;

            //  Grab the response from the CouchDB cookie authentication call
            //  and convert the JSON string into a TIBET JS object (which will
            //  be a TP.core.Hash) and remove the 'ok' key. The remaining data
            //  will include an Array of roles that this user is now
            //  authenticated for.
            result = aResponse.get('result');
            result = TP.json2js(result);
            result.removeKey('ok');

            //  Note that we add the authenticated root *first* before we 'call
            //  up'. That way, any handlers that rely on this setting are seeing
            //  an accurate authenicated root list.
            thisref.addAuthenticatedRoot(rootLoc, result);

            this.callNextMethod();
        });

    //  Define a common login function that can either be called directly, or
    //  after the user has been prompted for a username and password. This
    //  function takes a username and password to be populated into the
    //  authentication request and posts it to CouchDB's '/_session' endpoint.
    //  Successful authentication here will mean that we have authenticated with
    //  CouchDB using cookie authentication.
    loginFunc = function(loginUsername, loginPassword) {

        var body;

        //  Encode the body of the authentication request by formatting the
        //  username and password as JSON.
        body = TP.hc(
                'username', loginUsername,
                'password', loginPassword).asJSONSource();

        authRequest.atPut('body', body);

        //  Post the authentication request to the auth endpoint.
        TP.httpPost(href, authRequest);
    };

    //  If the username and password (*both* of them) were supplied in this
    //  call, then there is no need to prompt the user for them. Try to log in
    //  using them.
    if (TP.notEmpty(username) && TP.notEmpty(password)) {
        loginFunc(username, password);
    } else {
        //  Otherwise, prompt the user for the CouchDB username
        TP.prompt('Enter CouchDB username:',
                    TP.notValid(username) ? '' : username).then(
            function(retVal) {

                var promptedUsername;

                //  If the value came back empty, then just return.
                if (TP.isEmpty(retVal)) {
                    return;
                }

                promptedUsername = retVal;

                //  Prompt the user for the CouchDB password
                TP.prompt('Enter CouchDB password:',
                            TP.notValid(password) ? '' : password,
                            TP.hc('secure', true)).then(
                    function(retVal2) {

                        var promptedPassword;

                        //  If the value came back empty, then just return.
                        if (TP.isEmpty(retVal2)) {
                            return;
                        }

                        promptedPassword = retVal2;

                        //  Got both a username and password - call the login
                        //  function.
                        loginFunc(promptedUsername, promptedPassword);
                    });
            });
    }

    return authRequest;
}, {
    patchCallee: false
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
     * @returns {TP.core.URI[]} An Array of URIs pointing to 'change feed'
     *     resources that will notify TIBET when the supplied URI's resource
     *     changes.
     */

    var watcherSourceURIs,

        rootURLs,
        targets;

    watcherSourceURIs = TP.ac();

    //  Grab the CouchDB 'root' URLs (i.e. servers) that the system knows about
    //  via the config system.
    rootURLs = TP.sys.getcfg('couch.known_server_urls');

    //  Grab the non-server URI patterns that we should be watching.
    targets = TP.sys.getcfg('couch.watch.feeds');

    //  Iterate over the root server URLs and process them.
    rootURLs.forEach(
            function(aPair) {

                var rootURL;

                //  The rootURL will be the last part of the pair.
                rootURL = aPair.last();

                //  Join each URI pattern part onto the end of each root URL
                //  and, if a URI string can be formed, add it to the watcher
                //  source URI list.
                targets.forEach(
                        function(target) {
                            var url;

                            url = TP.uriJoinPaths(rootURL, target);
                            if (TP.isURIString(url)) {
                                watcherSourceURIs.push(TP.uc(url));
                            }
                        });
            });

    return watcherSourceURIs;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineHandler('AppDidStart',
function(aSignal) {

    /**
     * @method handleAppDidStart
     * @summary Handles when a TDS-managed resource has changed.
     * @param {TP.sig.AppDidStart} aSignal The signal indicating that the
     *     application has completed all of its startup tasks.
     * @returns {TP.couchdb.CouchDBURLHandler} The receiver.
     */

    var watcherURIs,
        watchSource,

        authenticatedRoots,
        authenticatingRoots;

    //  Remove ourself from the application's controller stack - we won't be
    //  needing to get any more signals from there.
    TP.sys.getApplication().removeController(this);

    //  Grab all of the 'watcher sources' (i.e. individual CouchDB server
    //  instances) that we are watching.
    watcherURIs = this.getWatcherSourceURIs();

    //  Define a Function that will set up an EventSource on a supplied changes
    //  feed source URI.
    watchSource = function(aSourceURI) {
        var sourceType,
            signalType,

            signalSource;

        sourceType = this.getWatcherSourceType();
        signalType = this.getWatcherSignalType();

        signalSource = sourceType.construct(
                            aSourceURI.getLocation(),
                            TP.hc('withCredentials', true));

        if (TP.notValid(signalSource)) {
            return this.raise('InvalidURLWatchSource');
        }

        this.observe(signalSource, signalType);
    }.bind(this);

    authenticatedRoots = this.get('authenticatedRoots');

    //  Set up a hash that will track the currently authenticating roots so that
    //  we don't try to authenticate a particular root multiple times. This will
    //  have a key of the authenticating root and an Array of source URIs under
    //  that root that will be set up as EventSources after the connection is
    //  authenticated.
    authenticatingRoots = TP.hc();

    //  Iterate over each watcher source and authenticate with it using 'cookie
    //  authentication'. The browser and CouchDB will manage authentication
    //  after this by putting in the authentication token into the HTTP
    //  headers for each roundtrip.
    watcherURIs.perform(
        function(aURI) {

            var rootLoc,
                href,

                body,

                username,
                password,

                request;

            rootLoc = aURI.getRoot();

            if (TP.isValid(authenticatingRoots.at(rootLoc))) {
                //  This root is in the process of being authenticated, so we
                //  don't want to do that process again. We do, however, want to
                //  track all of the URIs that need to be watched once this root
                //  is authenticated.
                authenticatingRoots.at(rootLoc).push(aURI);
            } else if (authenticatedRoots.hasKey(rootLoc)) {
                //  If its already authenticated, then just call the Function to
                //  watch the source URI.
                watchSource(aURI);
            } else {

                //  Add the root location and the source URI as the first item
                //  in the Array to the hash of authenticating roots.
                authenticatingRoots.atPut(rootLoc, TP.ac(aURI));

                //  Construct the proper href to the authentication endpoint.
                href = rootLoc + '/_session';

                //  Prompt the user for the CouchDB username
                TP.prompt('Enter CouchDB username for: ' + href).then(
                    function(retVal) {

                        //  If the value came back empty, then just return.
                        if (TP.isEmpty(retVal)) {
                            return;
                        }

                        username = retVal;

                        //  Prompt the user for the CouchDB password
                        TP.prompt('Enter CouchDB password for: ' + href).then(
                            function(retVal2) {

                                //  If the value came back empty, then just
                                //  return.
                                if (TP.isEmpty(retVal2)) {
                                    return;
                                }

                                password = retVal2;

                                //  Encode the body of the authentication
                                //  request by formatting the username and
                                //  password as JSON.
                                body = TP.hc(
                                        'username', username,
                                        'password', password).asJSONSource();

                                //  Build a request that we can post below.
                                request = TP.request(
                                        'uri', href,
                                        'headers',
                                            TP.hc('Content-Type',
                                                    TP.JSON_ENCODED),
                                        'body', body,
                                        'simple_cors_only', true);

                                //  Set up a RequestSucceeded handler that will
                                //  set up a SSE observer on the CouchDB changes
                                //  feed.
                                request.defineHandler('RequestSucceeded',
                                    function(aResponse) {
                                        var authenticatedRoot,
                                            watchingURIs,

                                            result;

                                        //  Grab the root of the response's URI.
                                        //  This will be the root that has been
                                        //  authenticated.
                                        authenticatedRoot =
                                            TP.uc(aResponse.at('uri')).getRoot();

                                        //  Grab the response from the CouchDB
                                        //  cookie authentication call and
                                        //  convert the JSON string into a TIBET
                                        //  JS object (which will be a
                                        //  TP.core.Hash) and remove the 'ok'
                                        //  key. The remaining data will include
                                        //  an Array of roles that this user is
                                        //  now authenticated for.
                                        result = aResponse.get('result');
                                        result = TP.json2js(result);
                                        result.removeKey('ok');

                                        //  Add that to our list of
                                        //  authenticated roots.
                                        TP.couchdb.CouchDBURLHandler.
                                            addAuthenticatedRoot(
                                                authenticatedRoot,
                                                result);

                                        //  Grab the Array of URIs that want to
                                        //  be watched that are associated with
                                        //  our now authentication root.
                                        watchingURIs = authenticatingRoots.at(
                                                            authenticatedRoot);

                                        //  Call the function that will watch
                                        //  them.
                                        watchingURIs.forEach(
                                            function(watchURI) {
                                                watchSource(watchURI);
                                            });
                                    });

                                //  Post the request to the authentication
                                //  endpoint.
                                TP.httpPost(href, request);
                            });
                    });
            }
        });

    return this;
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
        url,

        id,
        dbDocPath,

        processed,
        docLoc,

        subURIs,
        matcher,
        viewURLs;

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

        processed = false;

        //  If the URL has subURIs, then we want to see if the change feed data
        //  mentions any of them as the 'id' of the document that changed.
        id = data.at('id');
        if (TP.notEmpty(id)) {

            //  Join the 'path' part of the URL (minus the root, and slicing off
            //  the leading '/') and the ID (which should be the ID of the
            //  document that changed).
            dbDocPath = TP.uriJoinPaths(url.getPath().slice(1), data.at('id'));

            //  Make sure that this path is pointing to a server/document.
            if (this.DATABASE_AND_DOCUMENT_PATH_MATCHER.test(dbDocPath)) {

                //  Join the whole URL's location with the ID. This will result
                //  in a URL that represents the full path to the CouchDB
                //  document.
                docLoc = TP.uriJoinPaths(url.getLocation(), data.at('id'));

                //  If there's a registered URL for that document, then we
                //  should fetch it from the server and signal a change
                if (TP.core.URI.hasInstance(docLoc)) {
                    url = TP.uc(docLoc);
                    url.getResource(
                            TP.hc('refresh', true, 'signalChange', true));

                    processed = true;
                }
            }
        }

        //  If we didn't process the URI, then it wasn't a regular document. We
        //  should let the regular processing machinery handle it.
        if (!processed) {

            //  NB: This will only actually process the resource change if the
            //  'uri.process_remote_changes' flag is true. Otherwise, it just
            //  tracks changes.
            TP.core.URI.processRemoteResourceChange(url);
        }

        //  Update any view URLs that we know about

        //  Compute a RegExp that will find 'view' URLs.
        matcher = TP.rc(url.getLocation() + '/_design/\\w+/_view');

        //  Grab the subURIs of the url that we know about and select out of
        //  them ones that reference a view, per our computed match RegExp
        //  above.
        subURIs = url.getSubURIs();
        viewURLs = subURIs.select(
                    function(aURI) {
                        return matcher.test(aURI.getLocation());
                    });

        //  Iterate over the view URLs and force them to refresh from the
        //  server.
        viewURLs.perform(
            function(aViewURL) {
                aViewURL.getResource(
                            TP.hc('refresh', true, 'signalChange', true));
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.couchdb.CouchDBURLHandler.Type.defineMethod('isAuthenticated',
function(targetURI, roleName) {

    /**
     * @method isAuthenticated
     * @summary Returns whether or not the URI is authenticated.
     * @param {TP.core.URI} targetURI The URI to test.
     * @param {String} [roleName] An optional role name to provide a further
     *     check.
     * @returns {Boolean} true if the URI is authenticated.
     */

    var rootURI,
        authenticationData,

        roles;

    rootURI = targetURI.getRoot();

    authenticationData = this.get('authenticatedRoots').at(rootURI);

    //  If a role name was supplied and we have valid authentication entry for
    //  the URI, then check to see if the role name is in the list of roles.
    if (TP.isValid(authenticationData) && TP.notEmpty(roleName)) {
        roles = authenticationData.at('roles');
        return roles.contains(roleName);
    }

    //  If the role name wasn't specified, then we just return whether we found
    //  an authenticated entry for the supplied URI.
    return TP.isValid(authenticationData);
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

    //  Make sure that the connection has been authenticated.
    if (!this.isAuthenticated(targetURI)) {

        //  If its not, simulate a HTTP 401 error and report it / fail it like
        //  the TIBET low-level HTTP code will.

        request.set('faultCode', 401);
        request.set('faultText', 'Unauthorized');

        TP.httpError(targetURI.getLocation(), 'HTTPException', request, false);

        request.fail(request.at('message'),
                        request.getFaultCode(),
                        TP.hc('error', request.at('error'),
                                'message', request.at('message')));

        return request.getResponse();
    }

    //  It's best to make CouchDB to deal with 'simple CORS' (i.e. no preflight
    //  requests, etc.) if possible. Configure that here so that TIBET's
    //  low-level HTTP machinery doesn't try to add headers, etc. that would
    //  automatically cause preflight requests for even simple CORS cases.
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

    //  Make sure that the connection has been authenticated.
    if (!this.isAuthenticated(targetURI)) {

        //  If its not, simulate a HTTP 401 error and report it / fail it like
        //  the TIBET low-level HTTP code will.

        request.set('faultCode', 401);
        request.set('faultText', 'Unauthorized');

        TP.httpError(targetURI.getLocation(), 'HTTPException', request, false);

        request.fail(request.at('message'),
                        request.getFaultCode(),
                        TP.hc('error', request.at('error'),
                                'message', request.at('message')));

        return request.getResponse();
    }

    //  It's best to make CouchDB to deal with 'simple CORS' (i.e. no preflight
    //  requests, etc.) if possible. Configure that here so that TIBET's
    //  low-level HTTP machinery doesn't try to add headers, etc. that would
    //  automatically cause preflight requests for even simple CORS cases.
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

    //  Make sure that the connection has been authenticated.
    if (!this.isAuthenticated(targetURI)) {

        //  If its not, simulate a HTTP 401 error and report it / fail it like
        //  the TIBET low-level HTTP code will.

        request.set('faultCode', 401);
        request.set('faultText', 'Unauthorized');

        TP.httpError(targetURI.getLocation(), 'HTTPException', request, false);

        request.fail(request.at('message'),
                        request.getFaultCode(),
                        TP.hc('error', request.at('error'),
                                'message', request.at('message')));

        return request.getResponse();
    }

    saveURI = targetURI;

    //  It's best to make CouchDB to deal with 'simple CORS' (i.e. no preflight
    //  requests, etc.) if possible. Configure that here so that TIBET's
    //  low-level HTTP machinery doesn't try to add headers, etc. that would
    //  automatically cause preflight requests for even simple CORS cases.
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

                    //  Note here that we pass 'false' to *not* signal changes
                    //  here.
                    origData.set('$._rev', newRev, false);

                    //  Now set the URI to not being dirty and signal change for
                    //  the whole URI.
                    targetURI.isDirty(false);
                    targetURI.$changed();
                });

    return this.callNextMethod(targetURI, request);
});

//  =======================================================================
//  Registration
//  ========================================================================

//  Make sure the remote url watcher knows about this handler type, but wait to
//  do this after the type has been fully configured to avoid api check error.
//  This will cause the activateRemoteWatch method to be invoked on the
//  TP.couchdb.CouchDBURLHandler to be invoked.
TP.core.RemoteURLWatchHandler.registerWatcher(TP.couchdb.CouchDBURLHandler);

//  =======================================================================
//  TP.sig.CouchDBChange
//  ========================================================================

TP.sig.RemoteURLChange.defineSubtype('CouchDBChange');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
