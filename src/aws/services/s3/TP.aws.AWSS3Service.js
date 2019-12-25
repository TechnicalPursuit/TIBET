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

    return this.authenticateAndHandle(aRequest);
});

//  ------------------------------------------------------------------------

TP.aws.AWSS3Service.Inst.defineMethod('processAuthenticatedRequest',
function(s3Request) {

    /**
     * @method processAuthenticatedRequest
     * @summary Processes the supplied request in an authenticated context. This
     *     means that the TIBET machinery has ensured that any required
     *     authentication has taken place (if necessary).
     * @param {TP.sig.AWSS3Request} s3Request The request to handle after
     *     authentication (if necessary).
     * @returns {TP.aws.AWSS3Service} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
