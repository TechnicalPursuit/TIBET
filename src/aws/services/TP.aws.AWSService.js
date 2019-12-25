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
 * @type {TP.aws.AWSService}
 * @summary A subtype of TP.core.IOService that communicates with various Amazon
 *     Web Services.
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('aws.AWSService');

//  Can't construct concrete instances of this type.
TP.aws.AWSService.isAbstract(true);

//  This is an authenticated service.
TP.aws.AWSService.addTraits(TP.core.AuthenticatedService);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.aws.AWSService.Type.defineAttribute(
                        'supportedModes', TP.core.SyncAsync.ASYNCHRONOUS);
TP.aws.AWSService.Type.defineAttribute(
                        'mode', TP.core.SyncAsync.ASYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.aws.AWSService.Type.defineMethod('authenticate',
function(serviceName) {

    /**
     * @method authenticate
     * @summary Authenticate the service associated with the supplied name.
     * @param {String} serviceName The name of the service to authenticate. This
     *     should have been already registered with the receiver as a registered
     *     instance using this name.
     * @returns {TP.sig.AWSAuthenticationRequest} The authentication request.
     */

    var serviceInfo,

        region,
        apiVersion,
        userPoolID,
        appID,
        identityPoolID,

        thisref,

        authRequest,

        finishAuthentication,

        authInfoRequest;

    serviceInfo = this.get('serviceInfo');

    //  Make sure that we have service info that we can draw from.
    if (TP.notValid(serviceInfo)) {
        return this.raise('InvalidQuery', 'Missing service information.');
    }

    //  Make sure that we have a configured region.
    region = serviceInfo.at('region');
    if (TP.isEmpty(region)) {
        return this.raise('InvalidQuery', 'Missing region.');
    }

    //  Make sure that we have a configured apiVersion.
    apiVersion = serviceInfo.at('apiVersion');
    if (TP.isEmpty(apiVersion)) {
        return this.raise('InvalidQuery', 'Missing apiVersion.');
    }

    //  Make sure that we have a configured userPoolID. This should match the
    //  user pool that our Lambda function has.
    userPoolID = serviceInfo.at('userPoolID');
    if (TP.isEmpty(userPoolID)) {
        return this.raise('InvalidQuery', 'Missing userPoolID.');
    }

    //  Make sure that we have a configured appID.
    appID = serviceInfo.at('appID');
    if (TP.isEmpty(appID)) {
        return this.raise('InvalidQuery', 'Missing appID.');
    }

    //  Make sure that we have a configured identityPoolID.
    identityPoolID = serviceInfo.at('identityPoolID');
    if (TP.isEmpty(identityPoolID)) {
        return this.raise('InvalidQuery', 'Missing identityPoolID.');
    }

    thisref = this;

    //  Construct an authentication request.
    authRequest = TP.sig.AWSAuthenticationRequest.construct();

    finishAuthentication = function(username, password) {

        var authData,
            authDetails,

            poolData,
            userPool,

            userData,

            cognitoUser,

            promise;

        //  Authenticate the user, based on username and password

        authData = TP.hc('Username', username,
                            'Password', password).asObject();
        authDetails = new TP.extern.AmazonCognitoIdentity.AuthenticationDetails(
                                                                    authData);

        poolData = TP.hc('UserPoolId', userPoolID,
                            'ClientId', appID).asObject();
        userPool = new TP.extern.AmazonCognitoIdentity.CognitoUserPool(
                                                                    poolData);

        userData = TP.hc('Username', username,
                            'Pool', userPool).asObject();

        cognitoUser = new TP.extern.AmazonCognitoIdentity.CognitoUser(userData);

        //  Construct a Promise that will call on the AWS Cognito library to
        //  authenticate the service given the Cognito User data structure
        //  computed above. This will resolve the Promise with the JWT token
        //  returned if the authentication happened and will reject the Promise
        //  if it didn't.
        promise = TP.extern.Promise.construct(
            function(resolver, rejector) {

                cognitoUser.authenticateUser(authDetails, {
                    onSuccess: function(result) {
                        var idToken;

                        idToken = result.getIdToken().getJwtToken();
                        resolver(idToken);
                    },

                    onFailure: function(err) {
                        rejector(err);
                    }
                });
            });

        //  Add a Promise that will take the resultant JWT token and establish a
        //  session with it.
        promise = promise.then(
            function(result) {

                //  'result' here is the JWT token

                var loginInfo,

                    authDomain,

                    credentialsInfo,
                    credentials,

                    sessionPromise;

                //  Compute an authentication domain for use in conjunction with
                //  the JWT for login information.
                authDomain = 'cognito-idp.' + region + '.amazonaws.com/' +
                                userPoolID;
                loginInfo = TP.hc(authDomain, result);

                //  Now, in conjunction with the Identity Pool ID, compute the
                //  login credentials.
                credentialsInfo =
                    TP.hc('IdentityPoolId', identityPoolID,
                            'Logins', loginInfo);

                //  Convert to a POJO for use with the AWS Cognito library.
                credentialsInfo = credentialsInfo.asObject();

                credentials = new TP.extern.AWS.CognitoIdentityCredentials(
                                                            credentialsInfo);

                //  Update the AWS config with the region and credentials
                //  computed from Cognito.
                TP.extern.AWS.config.update({
                    region: region,
                    credentials: credentials
                });

                //  Now that the credentials have been updated, construct a
                //  nested Promise that will attempt to obtain a session using
                //  the Cognito user.
                sessionPromise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        cognitoUser.getSession(
                            function(err, session) {

                                var serviceInst;

                                if (TP.isValid(err)) {
                                    return rejector(
                                            err.message || JSON.stringify(err));
                                }

                                //  Construct a new service using the supplied
                                //  service name as the resource ID and register
                                //  it.
                                serviceInst = thisref.construct(serviceName);
                                serviceInst.register();

                                //  Cache our session.
                                serviceInst.set('$session', session);

                                resolver();
                            });
                    });

                return sessionPromise;
            });

        promise.then(
            function(result) {
                //  We succeeded in authenticating - complete the authenication
                //  request.
                authRequest.complete();
            }).catch(
            function(err) {
                //  We failed to authenticate - fail the request with the error.
                authRequest.fail(err);
            });
    };

    //  Allocate and initialize an AWS authentication information request. It
    //  will be expected that this request will return a username and password
    //  to authenticate with AWS.
    authInfoRequest = TP.sig.AWSAuthenticationInfoRequest.construct();
    authInfoRequest.defineHandler('RequestSucceeded',
        function(aResponse) {
            var result;

            result = aResponse.getResult();
            finishAuthentication(result.at('username'), result.at('password'));
        });

    //  Set the main authentication request as a slot on the authentication info
    //  request so that consumers who are providing authentication info can also
    //  hook into the main authentication request to know when it succeeds or
    //  fails.
    authInfoRequest.set('authRequest', authRequest);

    //  Fire the info request to get things started.
    authInfoRequest.fire();

    return authRequest;
});

//  ------------------------------------------------------------------------

TP.aws.AWSService.Type.defineMethod('getServiceInfo',
function() {

    /**
     * @method getServiceInfo
     * @summary Returns a hash containing service information needed by AWS to
     *     identify and work with the service.
     * @description This hash should contain the following keys that will be
     *     used by AWS:
     *          region
     *          apiVersion
     *          userPoolID
     *          appID
     *          identityPoolID
     * @returns {TP.core.Hash} A hash of service information.
     */

    return TP.hc();
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.aws.AWSService.Inst.defineAttribute('$session');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.aws.AWSService.Inst.defineMethod('isAuthenticated',
function() {

    /**
     * @method isAuthenticated
     * @summary Returns whether or not the service is authenticated.
     * @returns {Boolean} true if the service is authenticated.
     */

    var serviceInfo,

        userPoolID,
        appID,

        poolData,
        userPool,

        cognitoUser,

        session;

    serviceInfo = this.getType().get('serviceInfo');

    //  Make sure that we have service info that we can draw from.
    if (TP.notValid(serviceInfo)) {
        return this.raise('InvalidQuery', 'Missing service information.');
    }

    //  Make sure that we have a configured userPoolID. This should match the
    //  user pool that our Lambda function has.
    userPoolID = serviceInfo.at('userPoolID');
    if (TP.isEmpty(userPoolID)) {
        return this.raise('InvalidQuery', 'Missing userPoolID.');
    }

    //  Make sure that we have a configured appID.
    appID = serviceInfo.at('appID');
    if (TP.isEmpty(appID)) {
        return this.raise('InvalidQuery', 'Missing appID.');
    }

    //  Compute a data structure for the pool and grab the currently associated
    //  user.
    poolData = TP.hc('UserPoolId', userPoolID,
                        'ClientId', appID).asObject();
    userPool = new TP.extern.AmazonCognitoIdentity.CognitoUserPool(poolData);

    cognitoUser = userPool.getCurrentUser();

    //  If we have a valid user and we have a valid session, then we have an
    //  authenticated session.
    if (TP.isValid(cognitoUser)) {
        session = this.get('$session');
        if (TP.isValid(session)) {
            return session.isValid();
        }
    }

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
