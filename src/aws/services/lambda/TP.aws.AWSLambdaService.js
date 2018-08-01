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

    var request,

        action,
        paramDict;

    request = TP.request(aRequest);

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    action = request.at('action');

    paramDict = TP.ifInvalid(request.at('params'), TP.hc());

    //  Invoke the TIBET AWS 'passthrough' with 'Lambda' as the service.
    this.getType().invokePassthrough(
            'Lambda',
            action,
            paramDict
            ).then(
        function(result) {
            var jsResults;

            //  Grab the JSON string that is the result, make a TIBET-ized
            //  JavaScript data structure from it and complete the request with
            //  that result.
            jsResults = TP.json2js(result);
            request.complete(jsResults);
        }).catch(function(err) {
            request.fail(err);
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
