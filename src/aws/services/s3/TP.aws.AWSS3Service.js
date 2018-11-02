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
 * @type {TP.aws.AWSS3Service}
 * @summary A subtype of TP.aws.AWSService that communicates with Amazon S3
 *     Services.
 */

//  ------------------------------------------------------------------------

TP.aws.AWSService.defineSubtype('AWSS3Service');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.aws.AWSS3Service.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.AWSS3Request')));

//  ------------------------------------------------------------------------

TP.aws.AWSS3Service.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.aws.AWSS3Service.Inst.defineHandler('AWSS3Request',
function(aRequest) {

    /**
     * @method handleAWSS3Request
     * @summary Handles when an TP.sig.AWSS3Request is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.AWSS3Request} aRequest The request object to take
     *     the request parameters from.
     * @returns {TP.aws.AWSS3Service} The receiver.
     */

    //  TODO: Until we finish this logic, we turn off eslint 'no-unused-vars'

    /* eslint-disable no-unused-vars */

    var request,

        action,
        paramDict,

        isAuthenticated,

        promise;

    request = TP.request(aRequest);

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    action = request.at('action');

    paramDict = TP.ifInvalid(request.at('params'), TP.hc());

    isAuthenticated = this.isAuthenticated();

    if (!isAuthenticated) {
        promise = TP.extern.Promise.reject();
    } else {
        promise = TP.extern.Promise.resolve();
    }
    /* eslint-enable no-unused-vars */


    //  TODO: Need to finish this

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
