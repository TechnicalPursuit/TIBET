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
 * @type {TP.aws.AWSLambdaService}
 * @summary A subtype of TP.aws.AWSService that communicates with Amazon Lambda
 *     Services.
 */

//  ------------------------------------------------------------------------

TP.aws.AWSService.defineSubtype('AWSLambdaService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.aws.AWSLambdaService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.AWSLambdaRequest')));

//  ------------------------------------------------------------------------

TP.aws.AWSLambdaService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.aws.AWSLambdaService.Inst.defineHandler('AWSLambdaRequest',
function(aRequest) {

    /**
     * @method handleAWSLambdaRequest
     * @summary Handles when an TP.sig.AWSLambdaRequest is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.AWSLambdaRequest} aRequest The request object to take
     *     the request parameters from.
     * @returns {TP.aws.AWSLambdaService} The receiver.
     */

    return this.authenticateAndHandle(aRequest);
});

//  ------------------------------------------------------------------------

TP.aws.AWSLambdaService.Inst.defineMethod('processAuthenticatedRequest',
function(lambdaRequest) {

    /**
     * @method processAuthenticatedRequest
     * @summary Processes the supplied request in an authenticated context. This
     *     means that the TIBET machinery has ensured that any required
     *     authentication has taken place (if necessary).
     * @param {TP.sig.AWSLambdaRequest} lambdaRequest The request to handle after
     *     authentication (if necessary).
     * @returns {TP.aws.AWSLambdaService} The receiver.
     */

    var request,

        action,
        paramDict;

    request = TP.request(lambdaRequest);

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    action = request.at('action');

    paramDict = TP.ifInvalid(request.at('params'), TP.hc());

    //  Invoke the AWS Lambda function with the name of 'action' and the params
    //  from the paramsDict as its parameters.
    TP.extern.Promise.resolve().then(
        function() {
            return this.invoke(
                    action,
                    paramDict
                    ).then(
                function(result) {
                    var jsResults;

                    //  Grab the JSON string that is the result, make a
                    //  TIBET-ized JavaScript data structure from it and
                    //  complete the request with that result.
                    jsResults = TP.json2js(result);
                    request.complete(jsResults);
                }).catch(function(err) {
                    request.fail(err);
                });
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.aws.AWSLambdaService.Inst.defineMethod('invoke',
function(functionName, functionParams) {

    /**
     * @method invoke
     * @summary Invokes specified AWS Lambda function.
     * @param {String} functionName The name of the Lambda function to invoke.
     * @param {TP.core.Hash} functionParams A hash of the parameters to pass to
     *     the function (i.e. 'Body', 'Key', etc.).
     * @returns {Promise} The promisified request to the AWS Lambda function.
     */

    var serviceInfo,

        region,
        apiVersion,

        promise;

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

    //  Create a resolved Promise that will use the AWS.Lambda API to invoke a
    //  Lambda function on AWS and return result.
    promise = TP.extern.Promise.resolve().then(
        function(result) {

            var lambda,
                params,

                invocationParams;

            //  Create a new Lambda client-side invocation stub.
            lambda = new TP.extern.AWS.Lambda({
                region: region,
                apiVersion: apiVersion
            });

            //  If function params were supplied, then get a POJO from the Hash.
            //  Otherwise, just default params to a POJO.
            if (TP.notEmpty(functionParams)) {
                params = functionParams.asObject();
            } else {
                params = {};
            }

            //  Build a set of invocation params to invoke the Lambda function
            //  with.
            invocationParams = {
                FunctionName: functionName,
                InvocationType: 'RequestResponse',
                LogType: 'None',
                Payload: JSON.stringify(params)
            };

            //  Invoke the Lambda on the server, returning a Promise and then a
            //  Function that will parse the payload and return the body, which
            //  will be a String. That String might contain more JSON-ified
            //  data, but it's the callers responsibility to further parse that.
            return lambda.invoke(invocationParams).promise().then(
                    function(aResult) {
                        var payload;

                        payload = JSON.parse(aResult.Payload);
                        if (TP.isValid(payload.body)) {
                            return payload.body;
                        }

                        return null;
                    });
    });

    return promise;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
