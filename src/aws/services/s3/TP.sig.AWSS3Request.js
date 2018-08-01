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
 * @type {TP.sig.AWSS3Request}
 * @summary A subtype of TP.sig.IORequest that is used in conjunction with
 *     the TP.aws.AWSS3Service type to communicate to the Amazon S3 service.
 * @example Accessing Amazon S3 from TIBET consists of:
 *
 *     1. Define the operation you want to perform via a set of 'request
 *         parameters'
 *     2. Instantiating an TP.sig.AWSS3Request object, supplying those
 *         request parameters
 *     3. Firing the request.
 *
 *     Defining request parameters:
 *
 *     Note that the service will also identification and authentication
 *     credentials. See the type comment in TP.aws.AWSS3Service for more
 *     information.
 *
 *     Here is an example of them defined in the request:
 *
 *     requestParams = TP.hc(
 *                      'action', 'getObject',
 *                      'params',
 *                          TP.hc('Bucket', 'tibetBucket'));
 *
 *     Request parameters examples:
 *
 *     Create a bucket:
 *
 *     requestParams = TP.hc('action', 'createBucket',
 *                              'params',
 *                                  TP.hc('Bucket', 'tibetBucket'));
 *
 *     OR
 *
 *     List all buckets:
 *
 *     requestParams = TP.hc('action', 'listBuckets');
 *
 *     OR
 *
 *     Delete bucket:
 *
 *     requestParams = TP.hc('action', 'deleteBucket',
 *                              'Bucket', 'tibetBucket');
 *
 *     OR
 *
 *     Put item into a bucket:
 *
 *     requestParams = TP.hc(
 *              'action', 'putObject',
 *              'params',
 *                     TP.hc('Bucket', 'tibetBucket',
 *                              'Body', 'Content going to an item in a bucket',
 *                              'Key', 'My_Item'));
 *
 *     OR
 *
 *     Get item from a bucket:
 *
 *     requestParams = TP.hc(
 *              'action', 'getObject',
 *              'params',
 *                     TP.hc('Bucket', 'tibetBucket',
 *                              'Key', 'My_Item'));
 *
 *     OR
 *
 *     Delete item from a bucket:
 *
 *     requestParams = TP.hc(
 *              'action', 'deleteObject',
 *              'params',
 *                     TP.hc('Bucket', 'tibetBucket',
 *                              'Key', 'My_Item'));
 *
 *     OR
 *
 *     List all keys in a bucket:
 *
 *     requestParams = TP.hc(
 *              'action', 'listObjectsV2',
 *              'params',
 *                  TP.hc('Bucket', 'tibetBucket'));
 *
 *     Package and fire the request:
 *
 *     s3Req = TP.sig.AWSS3Request.construct(requestParams);
 *     s3Req.defineHandler('RequestSucceeded',
 *              function(aResponse) {
 *                  TP.info(aResponse.getResult());
 *              });
 *     s3Req.fire();
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('AWSS3Request');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.AWSS3Request.Type.defineAttribute('responseType',
    'TP.sig.AWSS3Response');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
