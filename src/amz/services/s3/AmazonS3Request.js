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
 * @type {TP.sig.AmazonS3Request}
 * @summary A subtype of TP.sig.RESTRequest that is used in conjunction with
 *     the TP.amz.AmazonS3Service type to communicate to the Amazon S3 service.
 * @example Accessing Amazon S3 from TIBET consists of:
 *
 *     1. Define the operation you want to perform via a set of 'request
 *         parameters'
 *     2. Instantiating an TP.sig.AmazonS3Request object, supplying those
 *         request parameters
 *     3. Firing the request.
 *
 *     Defining request parameters:
 *
 *     Note that the service will also need a 'key' and a 'secret key'. These
 *     can be included in the request as 'key' and 'secretkey', but if they are
 *     not defined in the request, they will be obtained either by looking for a
 *     vCard entry matching the service's 'resourceID' in the current
 *     application's 'cfg' hash or by prompting the user. See the type comment
 *     in TP.amz.AmazonS3Service for more information.
 *
 *     Here is an example of them defined in the request:
 *
 *     requestParams = TP.hc(
 *                      'action', 'getItemFromBucket',
 *                      'uri', 'http://s3.amazonaws.com/myBucket/myItem',
 *                      'key', '<developer key from Amazon>',
 *                      'secretkey', '<developer secret key from Amazon>');
 *
 *     Request parameters examples:
 *
 *     Create a bucket:
 *
 *     requestParams = TP.hc('action', 'createBucket',
 *                              'uri', 'http://s3.amazonaws.com/tibetBucket');
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
 *                              'uri', 'http://s3.amazonaws.com/tibetBucket');
 *
 *     OR
 *
 *     Put item into a bucket:
 *
 *     requestParams = TP.hc(
 *              'action', 'putItemInBucket',
 *              'uri', 'http://s3.amazonaws.com/tibetBucket/myItem/mySubItem',
 *              'body', 'This is content going to an item in a bucket');
 *
 *     OR
 *
 *     Get item from a bucket:
 *
 *     requestParams = TP.hc(
 *              'action', 'getItemFromBucket',
 *              'uri', 'http://s3.amazonaws.com/tibetBucket/myItem/mySubItem');
 *
 *     OR
 *
 *     Delete item from a bucket:
 *
 *     requestParams = TP.hc(
 *              'action', 'deleteItemFromBucket',
 *              'uri', 'http://s3.amazonaws.com/tibetBucket/myItem/mySubItem');
 *
 *     OR
 *
 *     List all keys in a bucket:
 *
 *     requestParams = TP.hc(
 *              'action', 'listKeysInBucket',
 *              'uri', 'http://s3.amazonaws.com/tibetBucket');
 *
 *     Package and fire the request:
 *
 *     s3Req = TP.sig.AmazonS3Request.construct(requestParams);
 *     s3Req.defineMethod(
 *              'handleRequestSucceeded',
 *              function(aResponse) {
 *                  TP.info(aResponse.getResult(), TP.LOG);
 *              });
 *     s3Req.fire();
 */

//  ------------------------------------------------------------------------

TP.sig.RESTRequest.defineSubtype('AmazonS3Request');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.AmazonS3Request.Type.defineAttribute('responseType',
    'TP.sig.AmazonS3Response');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.AmazonS3Request.Inst.defineMethod('init',
function(aRequest, aResourceID, aThreadID) {

    /**
     * @method init
     * @summary Initialize a new request.
     * @description Each request is composed of a request payload (usually a
     *     TP.lang.Hash), and optional resourceID and threadID elements. The
     *     resourceID allows a request to target a particular resource while the
     *     threadID allows the request to be associated with an ongoing
     *     request/response 'conversation' between parties. When creating the
     *     instance TP.sig.Request will use any type-specific requestTemplate
     *     and merge it with any incoming request information.
     * @param {TP.lang.Hash} aRequest An object containing specific request
     *     parameters which will by used by the request's responder to process
     *     the request. NOTE that this takes the same parameter slot as the root
     *     payload for TP.sig.Signal. This should be specific to the signal
     *     type.
     * @param {String} aResourceID A unique resource identifier.
     * @param {String} aThreadID A unique thread identifier.
     * @returns {TP.sig.AmazonS3Request} A new instance.
     */

    var newReq,
        uriPath,
        bucketName,
        keyName,
        reqURI;

    newReq = this.callNextMethod();

    if (TP.isEmpty(reqURI = TP.uc(newReq.at('uri')))) {
        //  TODO: Raise TP.sig.InvalidURI
        return;
    }

    newReq.atPut('serviceURI', TP.join(reqURI.get('scheme'),
        '://', reqURI.get('host')));

    if (TP.isEmpty(uriPath = reqURI.get('path'))) {
        //  No bucket name or key name... must be performing an 'all
        //  buckets' operation
        return newReq;
    }

    //  Slice off the leading '/'
    uriPath = uriPath.slice(1);

    if (!uriPath.contains('/')) {
        bucketName = uriPath.slice(0);
        newReq.atPut('bucketName', bucketName);

        return newReq;
    } else {
        bucketName = uriPath.slice(0, uriPath.indexOf('/'));
        newReq.atPut('bucketName', bucketName);
    }

    keyName = uriPath.slice(uriPath.indexOf('/') + 1);

    if (keyName.endsWith('/')) {
        keyName = keyName.slice(0, uriPath.lastIndexOf('/'));
    }

    newReq.atPut('keyName', keyName);

    return newReq;
});

//  ------------------------------------------------------------------------

TP.sig.AmazonS3Request.defineSubtype('AmazonS3GetItemRequest');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.AmazonS3GetItemRequest.Inst.defineMethod('init',
function(aRequest, aResourceID, aThreadID) {

    /**
     * @method init
     * @summary Initialize a new request.
     * @description Each request is composed of a request payload (usually a
     *     TP.lang.Hash), and optional resourceID and threadID elements. The
     *     resourceID allows a request to target a particular resource while the
     *     threadID allows the request to be associated with an ongoing
     *     request/response 'conversation' between parties. When creating the
     *     instance TP.sig.Request will use any type-specific requestTemplate
     *     and merge it with any incoming request information.
     * @param {TP.lang.Hash} aRequest An object containing specific request
     *     parameters which will by used by the request's responder to process
     *     the request. NOTE that this takes the same parameter slot as the root
     *     payload for TP.sig.Signal. This should be specific to the signal
     *     type.
     * @param {String} aResourceID A unique resource identifier.
     * @param {String} aThreadID A unique thread identifier.
     * @returns {TP.sig.AmazonS3GetItemRequest} A new instance.
     */

    aRequest.atPutIfAbsent('action', 'getItemFromBucket');

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.AmazonS3Request.defineSubtype('AmazonS3PutItemRequest');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.AmazonS3PutItemRequest.Inst.defineMethod('init',
function(aRequest, aResourceID, aThreadID) {

    /**
     * @method init
     * @summary Initialize a new request.
     * @description Each request is composed of a request payload (usually a
     *     TP.lang.Hash), and optional resourceID and threadID elements. The
     *     resourceID allows a request to target a particular resource while the
     *     threadID allows the request to be associated with an ongoing
     *     request/response 'conversation' between parties. When creating the
     *     instance TP.sig.Request will use any type-specific requestTemplate
     *     and merge it with any incoming request information.
     * @param {TP.lang.Hash} aRequest An object containing specific request
     *     parameters which will by used by the request's responder to process
     *     the request. NOTE that this takes the same parameter slot as the root
     *     payload for TP.sig.Signal. This should be specific to the signal
     *     type.
     * @param {String} aResourceID A unique resource identifier.
     * @param {String} aThreadID A unique thread identifier.
     * @returns {TP.sig.AmazonS3PutItemRequest} A new instance.
     */

    aRequest.atPutIfAbsent('action', 'putItemInBucket');

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.AmazonS3PutItemRequest.Inst.defineMethod('handle404',
function(aResponse) {

    /**
     * @method handle404
     * @param {TP.lang.Hash} aRequest An object containing specific request
     *     parameters which will by used by the request's responder to process
     *     the request. NOTE that this takes the same parameter slot as the root
     *     payload for TP.sig.Signal. This should be specific to the signal
     *     type.
     * @returns {TP.sig.AmazonS3PutItemRequest} A new instance.
     * @abstract
     */

    var putItemRequestParams,

        createBucketRequest;

    //  Couldn't find the bucket - try to create it.
    if (aResponse.get('faultText') === 'Not Found') {

        //  We just reuse our parameters, the URI in the 'createBucket'
        //  request and all of them in the 'put retry' request.
        putItemRequestParams = this.getParameters();

        //  Construct the 'create bucket' request, using the URI specified
        //  in the original put item request.
        createBucketRequest = TP.sig.AmazonS3Request.construct(
            TP.hc('action', 'createBucket',
                  'uri', putItemRequestParams.at('uri')));

        //  'Join' the bucket creation request to the original put item
        //  request. This will cause the original put item request to
        //  'pause' until the create bucket request finishes and to be
        //  'dependent' on the success/failure of the create bucket request.
        this.andJoinChild(createBucketRequest);

        //  If the create bucket request succeeds, then retry the put item
        //  request.
        createBucketRequest.defineMethod('handleRequestSucceeded',
            function(successResponse) {
                var putItemRetryRequest;

                putItemRetryRequest =
                    TP.sig.AmazonS3PutItemRequest.construct(
                        putItemRequestParams);

                //  Join the put item retry request to the create bucket
                //  request, again chaining things to make them dependent.
                createBucketRequest.andJoinChild(putItemRetryRequest);

                putItemRetryRequest.fire();
            });

        //  Fire the create bucket request to trigger service operation.
        createBucketRequest.fire();
    } else {
        //  some other failure, unrecoverable for now.
        this.fail();
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
