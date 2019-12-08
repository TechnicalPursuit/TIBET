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
 * @type {TP.sf.SalesforceService}
 * @summary A subtype of TP.core.IOService that communicates with various Amazon
 *     Web Services.
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('sf.SalesforceService');

//  Can't construct concrete instances of this type.
TP.sf.SalesforceService.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Type.defineConstant('JSFORCE_LOCATION',
        'http://cdnjs.cloudflare.com/ajax/libs/jsforce/1.9.1/jsforce.min.js');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Type.defineAttribute(
                        'supportedModes', TP.core.SyncAsync.ASYNCHRONOUS);
TP.sf.SalesforceService.Type.defineAttribute(
                        'mode', TP.core.SyncAsync.ASYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Type.defineMethod('isAuthenticated',
function(serviceName) {

    /**
     * @method isAuthenticated
     * @summary Returns whether or not the service is authenticated.
     * @param {String} serviceName The service name to test to see if its
     *     authenticated.
     * @returns {Boolean} true if the service is authenticated.
     */

    var inst;

    inst = this.getResourceById(serviceName);

    if (TP.isValid(inst)) {
        return inst.isAuthenticated();
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Type.defineMethod('authenticate',
function(serviceName) {

    /**
     * @method authenticate
     * @summary Authenticate the service associated with the supplied name.
     * @param {String} serviceName The name of the service to authenticate. This
     *     should have been already registered with the receiver as a registered
     *     instance using this name.
     * @returns {TP.sig.SalesForceAuthenticationRequest} The authentication
     *     request.
     */

    var serviceInfo,

        appID,

        authWindowWidth,
        authWindowHeight,

        authWindowTop,
        authWindowLeft,

        authWindowOptions,
        authSpecStr,

        authWindow,

        jsForceScriptURL,

        authRequest;

    serviceInfo = this.get('serviceInfo');

    //  Make sure that we have service info that we can draw from.
    if (TP.notValid(serviceInfo)) {
        return this.raise('InvalidQuery', 'Missing service information.');
    }

    //  Make sure that we have a configured appID.
    appID = serviceInfo.at('appID');
    if (TP.isEmpty(appID)) {
        return this.raise('InvalidQuery', 'Missing appID.');
    }

    //  Compute the OAuth2 window parameters

    authWindowWidth = 912;
    authWindowHeight = 513;

    /* eslint-disable no-extra-parens */
    authWindowLeft = (screen.width / 2) - (authWindowWidth / 2);
    authWindowTop = (screen.height / 2) - (authWindowHeight / 2);
    /* eslint-enable no-extra-parens */

    //  Construct a hash containing all of the parameters that we'll make a
    //  Window from.

    authWindowOptions = TP.hc(
                            'location', 'yes',
                            'toolbar', 'no',
                            'status', 'no',
                            'menubar', 'no',
                            'width', authWindowWidth,
                            'height', authWindowHeight,
                            'top', authWindowTop,
                            'left', authWindowLeft);

    //  Calculate a 'window.open' configuration String from that.
    authSpecStr = authWindowOptions.asDisplayString(
                            TP.hc('kvSeparator', '=', 'itemSeparator', ','));

    //  Open a new window. This is the window that we'll force a *separate* copy
    //  of the jsForce library. We'll use this to do the OAuth2 authentication
    //  and then grab the access token from its location hash once it redirects
    //  back to our domain.

    //  NB: We specify null here because that's what the jsForce library uses.
    //  When we force the separate copy of that lib into this window, their code
    //  will simply get a handle to this window rather than opening a new
    //  window. This is key, since we'll also have a handle to this window.
    authWindow = window.open('', null, authSpecStr);

    jsForceScriptURL = TP.uc(this.JSFORCE_LOCATION);

    //  Construct an authentication request.
    authRequest = TP.sig.SalesforceAuthenticationRequest.construct();

    TP.sys.fetchScriptInto(
                jsForceScriptURL,
                authWindow.document,
                null,
                TP.hc('crossorigin', true)).
        then(
            function() {
                this.$login(authWindow,
                            function(params) {
                                var serviceInst;

                                //  Construct a new service using the supplied
                                //  service name as the resource ID and register it.
                                serviceInst = this.construct(serviceName);
                                serviceInst.register();

                                serviceInst.$establishConnection(params);

                                authRequest.complete(
                                    this.isAuthenticated(serviceName));
                            }.bind(this),
                            function(err) {
                                authRequest.fail(err);
                            });
            }.bind(this));

    return authRequest;
});

//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Type.defineMethod('$login',
function(authWindow, authSuccess, authFailure) {

    var serviceInfo,
        appID,
        redirectURI,

        redirectLoc,

        gotAuthToken;

    serviceInfo = this.get('serviceInfo');

    //  Make sure that we have service info that we can draw from.
    if (TP.notValid(serviceInfo)) {
        return this.raise('InvalidQuery', 'Missing service information.');
    }

    //  Make sure that we have a configured appID.
    appID = serviceInfo.at('appID');
    if (TP.isEmpty(appID)) {
        return this.raise('InvalidQuery', 'Missing appID.');
    }

    //  Make sure that we have a configured redirectURI.
    redirectURI = serviceInfo.at('redirectURI');
    if (TP.isEmpty(redirectURI)) {
        return this.raise('InvalidQuery', 'Missing redirectURI.');
    }

    redirectLoc = TP.uc(redirectURI).getLocation();

    authWindow.jsforce.browser.init({
            clientId: appID,
            redirectUri: redirectLoc
        });

    authWindow.jsforce.browser.login();

    gotAuthToken = false;

    //  schedule a job to check on the window's close status
    TP.schedule(TP.hc(
                'step',
                function() {
                    var loc,
                        url,
                        params;

                    try {
                        loc = authWindow.location.href;
                        if (TP.notEmpty(loc) && loc.contains('blank.xhtml')) {
                            gotAuthToken = true;

                            authWindow.close();

                            url = TP.uc(loc);
                            params = url.getFragmentParameters();

                            if (params.hasKey('access_token')) {
                                authSuccess(params);
                            }

                            return true;
                        }
                    } catch (e) {
                        //  empty
                    }

                    return false;
                },
                'delay', 2000,      //  start after 2 second
                'interval', 500,    //  repeat every half second
                'limit',
                function(aJob) {

                    //  don't run more than 120 times (2 minutes)
                    if (aJob.get('iteration') > 120) {
                        authFailure();
                        return true;
                    }

                    //  don't run if we've extracted an authWindow location
                    if (gotAuthToken) {
                        authFailure();
                        return true;
                    }

                    return false;
                }));
});

//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Type.defineMethod('getServiceInfo',
function() {

    /**
     * @method getServiceInfo
     * @summary Returns a hash containing service information needed by
     *     Salesforce to identify and work with the service.
     * @description This hash should contain the following keys that will be
     *     used by Salesforce:
     *          appID
     *          redirectURI
     * @returns {TP.core.Hash} A hash of service information.
     */

    return TP.hc();
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Inst.defineAttribute('$connection');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Inst.defineMethod('$establishConnection',
function(params) {

    var conn;

    conn = new TP.extern.jsforce.Connection(
                {
                    instanceUrl: params.at('instance_url'),
                    accessToken: params.at('access_token')
                });

    this.$set('$connection', conn, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sf.SalesforceService.Inst.defineMethod('isAuthenticated',
function() {

    /**
     * @method isAuthenticated
     * @summary Returns whether or not the service is authenticated.
     * @returns {Boolean} true if the service is authenticated.
     */

    var connection;

    //  If we have a valid connection, then we have an authenticated session.
    connection = this.get('$connection');
    if (TP.isValid(connection)) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
