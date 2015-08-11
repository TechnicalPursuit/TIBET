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
 * @type {TP.goog.GoogleService}
 * @summary A subtype of TP.core.HTTPService that communicates with a Google
 *     server.
 * @summary This is an abstract supertype for all Google-related services.
 *     It knows how to authenticate the user using Google's 'ClientLogin'
 *     protocol. Subtypes add more functionality.
 */

//  ------------------------------------------------------------------------

TP.core.HTTPService.defineSubtype('goog.GoogleService');

TP.goog.GoogleService.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The version of the GData API that we're using for this service. The
//  default is '3.0', but subtypes can override.
TP.goog.GoogleService.Type.defineAttribute('gdataVersion', '3.0');

TP.goog.GoogleService.Type.defineAttribute('defaultedParameters',
                TP.hc('auth', TP.NONE,
                        'iswebdav', false));

TP.goog.GoogleService.register();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.goog.GoogleService.Inst.defineAttribute('authToken');

TP.goog.GoogleService.Inst.defineAttribute('username');
TP.goog.GoogleService.Inst.defineAttribute('password');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.goog.GoogleService.Inst.defineMethod('init',
function(resourceID, aRequest) {

    /**
     * @method init
     * @summary Returns an initialized instance of the receiver. If aRequest is
     *     provided it can help define the service's operation by providing a
     *     default serviceURI for the receiver. This uri is used when incoming
     *     requests don't provide a specific value.
     * @param {String} resourceID A unique service identifier.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.goog.GoogleService} A new instance.
     */

    var paramDict,

        username,
        password;

    this.callNextMethod();

    //  define the username & password based on:
    //  a)  any incoming request object that might be used to
    //      template/initiate the service
    //  b)  any vCard entry that the server might have in the application's
    //      configuration
    //  c)  prompting the user for the value(s)

    //  If a request was supplied, we can use that to store the values.
    //  Otherwise, just construct a hash to store them.
    if (TP.isValid(aRequest)) {
        paramDict = aRequest;
    } else {
        paramDict = TP.hc();
    }

    //  The required username isn't in the paramDict? Abort it.
    if (TP.notValid(username = paramDict.at('username'))) {
        aRequest.fail(
            TP.sc('Missing required username parameter in request'));

        return;
    }

    this.set('username', username);

    //  The required password isn't in the paramDict? Abort it.
    if (TP.notValid(password = paramDict.at('password'))) {
        aRequest.fail(
            TP.sc('Missing required password parameter in request'));

        return;
    }

    this.set('password', password);

    return this;
});

//  ------------------------------------------------------------------------

TP.goog.GoogleService.Inst.defineMethod('finalizeRequest',
function(aRequest) {

    /**
     * @method finalizeRequest
     * @summary Perform any final updates or processing on the request to make
     *     sure it is ready to send to TP.httpCall() for processing.
     * @param {TP.sig.GoogleRequest} aRequest The request being finalized.
     * @returns {TP.sig.GoogleRequest} The request to send. NOTE that this may
     *     not be the original request.
     */

    var params;

    //  All requests to Google are async...
    aRequest.atPut('async', true);

    params = aRequest.atPutIfAbsent('uriparams', TP.hc());

    switch (aRequest.at('action')) {
        case 'login':

            params.atPut('accountType', 'GOOGLE');
            params.atPut('Email', this.get('username'));
            params.atPut('Passwd', this.get('password'));

            //  The GData APIs like to see a 'source' of:
            //      companyName-applicationName-versionID

            params.atPutIfAbsent('source', TP.join('TPI-TIBET-' +
                TP.sys.$version.root));

            break;

        default:
            break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.goog.GoogleService.Inst.defineMethod('handleRequestSucceeded',
function(aSignal) {

    /**
     * @method handleRequestSucceeded
     * @summary Handles any signal being managed by this service that has
     *     successfully completed.
     * @param {TP.sig.Response} aSignal The response masquerading as a
     *     "Succeeded" signal.
     * @returns {TP.sig.Response} The supplied response signal.
     */

    var request,
        response,

        responseText,

        error,
        auth,
        authToken;

    request = aSignal.getRequest();
    response = request.getResponse();

    switch (request.at('action')) {
        case 'login':

            if (TP.notEmpty(responseText = response.getResponseText())) {
                error = responseText.match(/Error=([A-z]+)/);
                auth = responseText.match(/Auth=([A-z0-9_-]+)/);

                if (responseText.indexOf('Email:') > 0 ||
                    TP.notEmpty(error)) {
                    TP.ifError() ?
                        TP.error('Google login error: ' + responseText) : 0;
                } else {
                    if (TP.notEmpty(auth)) {
                        authToken = auth.at(1);

                        this.set('authToken', authToken);
                    }
                }
            }

            //  Now we take the unusual step of removing the username and
            //  password keys from the login request. This is to avoid problems
            //  when querying Google again using the same request (Google will
            //  reject traffic with the username/password encoded in the URL)
            request.getParameters().removeKey('username');
            request.getParameters().removeKey('password');
            break;

        default:
            return this.callNextMethod();
    }

    return aSignal;
});

//  ------------------------------------------------------------------------

TP.goog.GoogleService.Inst.defineMethod('handleHTTPRequest',
function(aRequest) {

    /**
     * @method handleHTTPRequest
     * @summary Constructs an appropriate response for the request provided,
     *     working to manage asynchronous calls in a manner consistent with the
     *     rest of the service/request/response model.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @exception TP.sig.InvalidRequest, TP.sig.InvalidURI
     * @returns {TP.sig.HTTPResponse} The service's response to the request.
     */

    var authRequest;

    //  If we don't have an auth token, we need to make a request to get one

    //  NB: Make sure the request wasn't the login request itself - that's
    //  gonna be us trying to get the token...
    if (TP.isEmpty(this.get('authToken')) &&
        aRequest.at('action') !== 'login') {

        aRequest.cancel(
            TP.sc('No authToken available. Refiring after token fetched.'));

        //  Construct the authentication request and set up a success
        //  handler that will populate the 'auth' slot on the original
        //  request's parameters when the token is obtained.
        authRequest = TP.sig.GoogleRequest.construct(
                                            TP.hc('action', 'login'));
        authRequest.defineMethod(
            'handleRequestSucceeded',
            function(authResponse) {

                //  Call 'up' to our instance handler to parse out the
                //  'authToken' for use further down.
                this.handleRequestSucceeded(authResponse);

                //  Now that we've manually called the handler method, we
                //  can stopPropation() on the response so that it doesn't
                //  get called again.
                authResponse.stopPropagation();

                //  Now we take the unusual step of removing the username
                //  and password keys from the originating request. This is
                //  to avoid problems when querying Google again using the
                //  same request (Google will reject traffic with the
                //  username/password encoded in the URL)
                aRequest.getParameters().removeKey('username');
                aRequest.getParameters().removeKey('password');

                aRequest.getParameters().atPut('auth',
                                                this.get('authToken'));

                //  Refire the cancelled original request, now that its
                //  'auth' parameter has a real value to work with.
                aRequest.fire();
            }.bind(this));

        //  Direct this service instance to handle the authentication
        //  request directly. We do this rather than firing the request
        //  since authRequest is a plain TP.sig.GoogleRequest and no
        //  concrete Google service will have registered as being a handler
        //  for that kind of request (and we don't want them to - we don't
        //  want multiple service instances handling these kinds of
        //  requests).
        TP.handle(this, authRequest);

        return aRequest.constructResponse();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.goog.GoogleService.Inst.defineMethod('rewriteRequestHeaders',
function(aRequest) {

    /**
     * @method rewriteRequestHeaders
     * @summary Returns a TP.core.Hash of HTTP headers appropriate for the
     *     service.
     * @param {TP.sig.GoogleRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {TP.core.Hash} The hash of HTTP headers.
     */

    var headers;

    headers = this.callNextMethod();

    headers.atPut('GData-Version', this.getType().get('gdataVersion'));

    switch (aRequest.at('action')) {
        case 'login':

            //  No headers for 'login' - we're actually trying to get the
            //  auth token... :-)

            break;

        default:

            headers.atPut('Authorization',
                            'GoogleLogin auth=' + this.get('authToken'));

            break;
    }

    return headers;
});

//  ------------------------------------------------------------------------

TP.goog.GoogleService.Inst.defineMethod('rewriteRequestURI',
function(aRequest) {

    /**
     * @method rewriteRequestURI
     * @summary Rewrites the request's URI.
     * @param {TP.sig.GoogleRequest} aRequest The request to rewrite.
     * @returns {TP.goog.URI} The new/updated URI instance.
     */

    switch (aRequest.at('action')) {
        case 'login':

            return 'https://www.google.com/accounts/ClientLogin';

        default:

            aRequest.fail('Unrecognized action');

            //  NOTE the getRequestURI method throws an exception if no URI
            //  can be computed from the service uri or the request payload
            return;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.goog.GoogleService.Inst.defineMethod('rewriteRequestVerb',
function(aRequest) {

    /**
     * @method rewriteRequestVerb
     * @summary Returns the HTTP verb to use for the request. For Wave
     *     requests, this varies depending on operation.
     * @param {TP.sig.GoogleRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     */

    switch (aRequest.at('action')) {
        case 'login':

            return TP.HTTP_POST;

        default:
            break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
