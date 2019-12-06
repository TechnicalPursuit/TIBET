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
 * @type {TP.aws.AWSPassthroughService}
 * @summary A subtype of TP.aws.AWSLambdaService that communicates with various
 *     Amazon Web Services via a 'passthrough'.
 * @description This type provides a method that can be invoked as a
 *     'passthrough' mechanism when needing to invoke any of Amazon Web Services
 *     without having to deal with individual authentication, identification or
 *     CORS issues on a 'per method' basis.
 */

//  ------------------------------------------------------------------------

TP.aws.AWSLambdaService.defineSubtype('aws.AWSPassthroughService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.aws.AWSPassthroughService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.AWSPassthroughRequest')));

//  ------------------------------------------------------------------------

TP.aws.AWSPassthroughService.register();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.aws.AWSPassthroughService.Type.defineMethod('getServiceInfo',
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

    var serviceInfo;

    serviceInfo = TP.hc(
        'region', TP.sys.getcfg('aws.passthrough.region'),
        'apiVersion', TP.sys.getcfg('aws.passthrough.apiVersion'),
        'userPoolID', TP.sys.getcfg('aws.passthrough.userPoolID'),
        'appID', TP.sys.getcfg('aws.passthrough.appID'),
        'identityPoolID', TP.sys.getcfg('aws.passthrough.identityPoolID'));

    return serviceInfo;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.aws.AWSPassthroughService.Inst.defineHandler('AWSPassthroughRequest',
function(aRequest) {

    /**
     * @method handleAWSPassthroughRequest
     * @summary Handles when an TP.sig.AWSPassthroughRequest is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.AWSPassthroughRequest} aRequest The request object to take
     *     the request parameters from.
     * @returns {TP.aws.AWSPassthroughService} The receiver.
     */

    //  Since we're the observer of these types of signals, because of the way
    //  TP.core.Resource objects work we have to catch this signal here and then
    //  'call up' to the next-most-specific handler.
    return this.callNextHandler();
});

//  ------------------------------------------------------------------------

TP.aws.AWSPassthroughService.Inst.defineMethod('invoke',
function(methodName, methodParams) {

    /**
     * @method invoke
     * @summary Invokes the TIBET 'AWS Passthrough' - a CORS-enabled AWS Lambda
     *     function that gives access to other AWS services.
     * @param {String} methodName The name of the method to invoke on the
     *     service (i.e. 'listBuckets', etc.).
     * @param {TP.core.Hash} methodParams A hash of the parameters to pass to
     *     the function (i.e. 'Body', 'Key', etc.).
     * @returns {Promise} The promisified request to the AWS Lambda function.
     */

    var serviceInfo,

        region,
        apiVersion,

        remoteService,
        invocationParams,
        functionParams;

    serviceInfo = this.getType().get('serviceInfo');

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

    if (TP.isEmpty(methodParams)) {
        return this.raise('InvalidQuery', 'Missing method parameters.');
    }

    //  Grab the name of the remote AWS service that the passthrough 'invoker'
    //  Lambda function will be invoking on the AWS servers.
    remoteService = methodParams.at('remoteService');

    if (TP.isEmpty(remoteService)) {
        return this.raise('InvalidQuery',
                            'Missing passthrough remote service name.');
    }

    //  Copy the method parameters and remove the 'remoteService' key. We do
    //  *not* want this to be passed as a parameter when the server-side
    //  'invoker' Lamdba function is invoked.
    invocationParams = TP.copy(methodParams);
    invocationParams.removeKey('remoteService');

    //  Build a set of parameters to the invoker function itself that detail the
    //  remote service name, the name of the method to invoke on the remote
    //  service in AWS and the params (the invocation params we computed
    //  earlier) to that method.
    functionParams = TP.hc();
    functionParams.atPut('service', remoteService);
    functionParams.atPut('methodName', methodName);
    functionParams.atPut('params', invocationParams);

    return this.callNextMethod('passthrough', functionParams);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
