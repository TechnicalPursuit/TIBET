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
 * @type {TP.sf.SalesforceQueryService}
 * @summary A subtype of TP.sf.SalesforceQueryService that communicates with
 *     the Salesforce query service.
 */

//  ------------------------------------------------------------------------

TP.sf.SalesforceService.defineSubtype('sf.SalesforceQueryService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sf.SalesforceQueryService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.SalesforceQueryRequest')));

//  ------------------------------------------------------------------------

TP.sf.SalesforceQueryService.register();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sf.SalesforceQueryService.Type.defineMethod('getServiceInfo',
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

    var serviceInfo;

    serviceInfo = TP.hc(
        'appID', TP.sys.getcfg('salesforce.query.appID'),
        'redirectURI', TP.sys.getcfg(
                            'salesforce.query.redirectURI',
                            '~lib_xhtml/blank.xhtml'));

    return serviceInfo;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sf.SalesforceQueryService.Inst.defineHandler('SalesforceQueryRequest',
function(aRequest) {

    /**
     * @method handleSalesforceQueryRequest
     * @summary Handles when an TP.sig.SalesforceQueryRequest is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.SalesforceQueryRequest} aRequest The request object to
     *     take the request parameters from.
     * @returns {TP.sf.SalesforceQueryService} The receiver.
     */

    return this.authenticateAndHandle(aRequest);
});

//  ------------------------------------------------------------------------

TP.sf.SalesforceQueryService.Inst.defineMethod('processAuthenticatedRequest',
function(queryRequest) {

    /**
     * @method processAuthenticatedRequest
     * @summary Processes the supplied request in an authenticated context. This
     *     means that the TIBET machinery has ensured that any required
     *     authentication has taken place (if necessary).
     * @param {TP.sig.SalesforceQueryRequest} queryRequest The request to handle
     *     after authentication (if necessary).
     * @returns {TP.sf.SalesforceQueryService} The receiver.
     */

    var request,

        query;

    request = TP.request(queryRequest);

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    query = request.at('query');

    //  Invoke the Salesforce SOQL query call with the query of 'query'. This
    //  call returns a Promise. We set up a resolver and rejector on that
    //  Promise to either complete or fail the request, depending on the
    //  outcome.
    Promise.resolve().then(
        function() {
            return this.query(
                    query
                    ).then(
                function(result) {
                    request.complete(result);
                }).catch(function(err) {
                    request.fail(err.message, err);
                });
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.sf.SalesforceQueryService.Inst.defineMethod('query',
function(oqlQuery) {

    /**
     * @method query
     * @summary Executes the supplied query against the Salesforce SOQL service.
     * @param {String} oqlQuery The SOQL query to execute.
     * @returns {Promise} The promisified query call. When this call resolves or
     *     rejects, the query action is complete.
     */

    var serviceInfo,

        appID,
        connection;

    if (!this.isAuthenticated()) {
        return this.raise('InvalidConnection', 'No authenticated connection.');
    }

    serviceInfo = this.getType().get('serviceInfo');

    //  Make sure that we have service info that we can draw from.
    if (TP.notValid(serviceInfo)) {
        return this.raise('InvalidQuery', 'Missing service information.');
    }

    //  Make sure that we have an app ID
    appID = serviceInfo.at('appID');
    if (TP.isEmpty(appID)) {
        return this.raise('InvalidQuery', 'Missing appID.');
    }

    connection = this.get('$connection');
    if (TP.notValid(connection)) {
        return this.raise('InvalidConnection', 'No valid connection.');
    }

    if (TP.isEmpty(oqlQuery)) {
        return this.raise('InvalidQuery', 'Missing query.');
    }

    //  Make sure to return a native Promise here to keep things consistent.
    return Promise.resolve(connection.query(oqlQuery));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
