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
 * @type {TP.amazon.AmazonS3Service}
 * @summary A subtype of TP.core.RESTService that communicates with the Amazon
 *     S3 service.
 * @example If the TP.sig.AmazonS3Request/TP.sig.AmazonS3Response processing
 *     model is used, it is unnecessary to manually set up an
 *     TP.amazon.AmazonS3Service. As part of the TIBET infrastructure of using
 *     request/response pairs, a 'default' instance of this service will be
 *     instantiated and registered to handle all TP.sig.AmazonS3Requests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'AmazonS3ServiceDefault'. It should have a vCard
 *     entry in the currently executing project. If this vCard cannot be found,
 *     the user will be prompted to enter the information about this server. If
 *     only part of the information can be found (i.e. the URL, but not the KEY
 *     or SECRET-KEY), the user will be prompted to enter the missing
 *     information.
 *
 *     It is possible, however, to manually set up a server. To do so, either
 *     supply the 'key' and 'secretkey' to the service:
 *
 *     s3Service = TP.amazon.AmazonS3Service.construct(
 *                  'myAmazonS3Server',
 *                  TP.hc('uri', 'http://s3.amazonaws.com',
 *                          'key', '<developer key from Amazon>',
 *                          'secretkey', '<developer secret key from Amazon>'));
 *
 *     Or have a vCard entry where the 'FN' entry matches the resource ID that
 *     is passed to the 'construct' call as detailed here:
 *
 *     E.g.
 *
 *     <FN>myAmazonS3Server</FN>
 *     <URI>http://s3.amazonaws.com<URI>
 *     <KEY><developer key from Amazon></KEY>
 *     <X-SECRET-KEY><developer secret key from Amazon></X-SECRET-KEY>
 *
 *     NB: Please note the security implications of encoding the Amazon secret
 *     key into a configuration file. If you want to leverage TP.core.User's
 *     secure credentials database, use a value of {USER} for this field in the
 *     vCard:
 *
 *          <X-SECRET-KEY>{USER}</X-SECRET-KEY>
 *
 *     To prompt the user the first time the service is accessed (per session)
 *     to provide the value for this field, use a value of {PROMPT} for this
 *     field in the vCard:
 *
 *          <X-SECRET-KEY>{PROMPT}</X-SECRET-KEY>
 *
 *     As with the service default type, if these parameters aren't supplied
 *     using any of these mechanisms, the user will be prompted to supply them
 *     at runtime (the same as forcing this behavior with the {PROMPT} value).
 *
 *     You will then need to register your service instance so that it services
 *     TP.sig.AmazonS3Requests (otherwise, the TIBET machinery will instantiate
 *     the 'default' instance of TP.amazon.AmazonS3Service as described above and
 *     register it to service these kinds of requests):
 *
 *     s3Service.register();
 */

//  ------------------------------------------------------------------------

TP.core.RESTService.defineSubtype('amazon.AmazonS3Service');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.amazon.AmazonS3Service.Type.defineAttribute('triggerSignals',
    'TP.sig.AmazonS3Request');
TP.amazon.AmazonS3Service.register();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.amazon.AmazonS3Service.Inst.defineAttribute('serverKey');
TP.amazon.AmazonS3Service.Inst.defineAttribute('secretServerKey');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.amazon.AmazonS3Service.Inst.defineMethod('init',
function(resourceID, aRequest) {

    /**
     * @method init
     * @summary Returns an initialized instance of the receiver. If aRequest is
     *     provided it can help define the service's operation by providing a
     *     default serviceURI for the receiver. This uri is used when incoming
     *     requests don't provide a specific value.
     * @param {String} resourceID A unique service identifier.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.URIService} A new instance.
     */

    this.callNextMethod();

    this.configureAuthData(aRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.amazon.AmazonS3Service.Inst.defineMethod('clearAuthData',
function() {

    /**
     * @method clearAuthData
     * @summary Clears any stored authentication from the receiver and any
     *     backing store.
     * @returns {TP.core.Service} The receiver.
     */

    this.callNextMethod();

    this.set('serverKey', null);
    this.set('secretServerKey', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.amazon.AmazonS3Service.Inst.defineMethod('configureAuthData',
function(aRequest) {

    /**
     * @method configureAuthData
     * @summary Configures authentication data for the receiver.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.Service} The receiver.
     */

    var paramDict,
        serverKey,
        secretServerKey;

    this.callNextMethod();

    //  define the server key & secret key based on:
    //  a)  any incoming request object that might be used to
    //      template/initiate the service
    //  b)  any vCard entry that the server might have in the application's
    //      configuration
    //  c)  prompting the user for the value(s)

    //  If a request was supplied, we can use that to store the values.
    //  Otherwise, just construct a hash to store them.
    if (TP.isValid(aRequest)) {
        paramDict = aRequest;
    } else {
        paramDict = TP.hc();
    }

    //  Try to populate any missing parameters in the paramDict from the
    //  receiver's vCard entry. If these parameters are missing from the
    //  request, but are in the vCard, this should get them into the request.
    //  If they are not in the vCard, the user will be prompted for them with
    //  the supplied message. Note that by passing 'false' as the last field
    //  here, the field is considered to be 'not required'. We will still try to
    //  execute the service command, even if the value is null. This call will,
    //  however, set the value to TP.NULL to indicate the user intended to not
    //  supply it.

    this.populateMissingVCardData(
        TP.hc('key',
                TP.ac(
                    'key',
                    'Enter server key (optional for public buckets): ',
                    false),
              'secretkey',
                TP.ac(
                    'secretkey',
                    'Enter secret server key (optional for public buckets): ',
                    false)),
        paramDict);

    //  The required serverKey isn't in the paramDict? Abort it. Note that the
    //  value very well may be TP.NULL if the user didn't provide a value
    //  above, in which case this statement will not be true.
    if (TP.notValid(serverKey = paramDict.at('key'))) {
        aRequest.fail(
            TP.sc('Missing required server key parameter in request'));

        return;
    }

    this.set('serverKey', serverKey);

    //  The required secretServerKey isn't in the paramDict? Abort it. Note that
    //  the value very well may be TP.NULL if the user didn't provide a value
    //  above, in which case this statement will not be true.
    if (TP.notValid(secretServerKey = paramDict.at('secretkey'))) {
        aRequest.fail(
            TP.sc('Missing required secret server key parameter in request'));

        return;
    }

    this.set('secretServerKey', secretServerKey);

    return this;
});

//  ------------------------------------------------------------------------

TP.amazon.AmazonS3Service.Inst.defineMethod('rewriteRequestVerb',
function(aRequest) {

    /**
     * @method rewriteRequestVerb
     * @summary Returns the HTTP verb to use for the request. For the Amazon S3
     *     service the verb used depends on the 'action' that the request is
     *     configured for.
     * @param {TP.sig.AmazonS3Request} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     */

    //  Switch based on the request's action.

    switch (aRequest.at('action')) {
        case 'createBucket':
            //      Bucket management
            return TP.HTTP_PUT;
        case 'deleteBucket':
            return TP.HTTP_DELETE;
        case 'listBuckets':
            return TP.HTTP_GET;
        case 'checkBucketExists':
            return TP.HTTP_HEAD;
        case 'deleteItemFromBucket':
            //      Item management
            return TP.HTTP_DELETE;
        case 'listKeysInBucket':
            return TP.HTTP_GET;
        case 'getItemFromBucket':
            return TP.HTTP_GET;
        case 'headItemInBucket':
            return TP.HTTP_HEAD;
        case 'putItemInBucket':
            return TP.HTTP_PUT;
        default:
            aRequest.fail('Unrecognized action');
            return '';
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.amazon.AmazonS3Service.Inst.defineMethod('rewriteRequestURI',
function(aRequest) {

    /**
     * @method rewriteRequestURI
     * @summary Rewrites the request's URI. For the Amazon S3 service, this
     *     means computing the bucket and item name from the request and
     *     generating a URI from it.
     * @param {TP.sig.AmazonS3Request} aRequest The request to rewrite.
     * @returns {TP.core.URI} The new/updated URI instance.
     */

    var resource;

    switch (aRequest.at('action')) {
        case 'createBucket':
        case 'deleteBucket':
        case 'listKeysInBucket':
        case 'checkBucketExists':
            resource = TP.join('/', aRequest.at('bucketName'));
            break;
        case 'listBuckets':
            resource = '/';
            break;
        case 'deleteItemFromBucket':
        case 'getItemFromBucket':
        case 'headItemInBucket':
        case 'putItemInBucket':
            resource = TP.join('/', aRequest.at('bucketName'),
                '/', aRequest.at('keyName'));
            break;
        default:
            aRequest.fail('Unrecognized action');

            //  NOTE the getRequestURI method throws an exception if no URI
            //  can be computed from the service uri or the request payload
            return;
    }

    aRequest.atPut('resource', resource);

    return this.get('serviceURI') + resource;
});

//  ------------------------------------------------------------------------

TP.amazon.AmazonS3Service.Inst.defineMethod('rewriteRequestHeaders',
function(aRequest) {

    /**
     * @method rewriteRequestHeaders
     * @summary Returns a TP.core.Hash of HTTP headers appropriate for the
     *     service. Typical headers include an X-Request-Id for the request ID
     *     to help identify "conversations" related to a particular request.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {TP.core.Hash} The hash of rewritten request headers.
     */

    var headers,
        verb,
        resource,
        key,
        secretKey,
        contentType,
        headerDate,
        aclAuthStr,
        acl,
        meta,
        metaAuthStr,
        authenticationInfo,
        authorization;

    //  Do whatever our supertype does to configure the header hash.
    headers = this.callNextMethod();

    //  No verb? Then fail the request and return.
    if (TP.isEmpty(verb = aRequest.at('verb'))) {
        aRequest.fail(
            'No verb in TP.amazon.AmazonS3Service::rewriteRequestHeaders');

        return null;
    }

    //  No resource? Then fail the request and return.
    if (TP.isEmpty(resource = aRequest.at('resource'))) {
        aRequest.fail(
        'No resource in TP.amazon.AmazonS3Service::rewriteRequestHeaders');

        return null;
    }

    //  No key? Then fail the request and return.
    if (TP.isEmpty(key = this.get('serverKey')) &&
            TP.isEmpty(key = aRequest.at('key'))) {
        aRequest.fail(
        'No key in TP.amazon.AmazonS3Service::rewriteRequestHeaders');

        return null;
    }

    //  No secretKey? Then fail the request and return.
    if (TP.isEmpty(secretKey = this.get('secretServerKey')) &&
            TP.isEmpty(secretKey = aRequest.at('secretKey'))) {
        aRequest.fail(
        'No secretKey in TP.amazon.AmazonS3Service::rewriteRequestHeaders');

        return null;
    }

    //  If a specific contentType wasn't defined
    if (TP.notValid(contentType = aRequest.at('contentType'))) {

        //  If the verb is PUT, then we try to guess a MIME type given the body
        //  content. This method will default to TP.ietf.Mime.PLAIN.
        if (verb === TP.HTTP_PUT) {

            contentType = TP.ietf.Mime.guessMIMEType(aRequest.at('body'));

            //  Furthermore, if the action is 'putItemInBucket', we make
            //  sure that the encoding is UTF-8.
            if (aRequest.at('action') === 'putItemInBucket') {
                contentType += '; charset=' + TP.UTF8;
            }
        } else {
            //  Otherwise, there is no contentType.
            contentType = '';
        }
    }

    headers.atPut('Content-Type', contentType);

    //  If either the 'key' or 'secretKey' is TP.NULL, then the user didn't
    //  provide it so we'll skip this and assume that the user knows this is a
    //  publicly open bucket.
    if (key === TP.NULL || secretKey === TP.NULL) {
        return headers;
    }

    //  Build up the auth string (note that these have to be done in
    //  alphabetical order of the header name)

    aclAuthStr = '';

    //  If an ACL was defined, make an HTTP header entry for it and add it
    //  to the 'aclAuthStr' for authentication computation later.
    if (TP.notEmpty(acl = aRequest.at('acl'))) {
        headers.atPut('x-amz-acl', acl);
        aclAuthStr += 'x-amz-acl:' + acl + '\n';
    } else if (aRequest.at('action') === 'putItemInBucket') {
        //  An ACL wasn't defined, but the action was 'putItemInBucket', so
        //  we need an ACL - default it to 'public-read'
        headers.atPut('x-amz-acl', 'public-read');
        aclAuthStr += 'x-amz-acl:' + 'public-read' + '\n';
    }

    //  The date we'll use in our header, as formatted by the HTTPDate
    //  formatter. Note here how we use the 'x-amz-date' capability since in
    //  XHR Level 2 it is now illegal to set the 'Date' header.
    headerDate = TP.dc().formatHTTPDate();
    headers.atPut('x-amz-date', headerDate);
    aclAuthStr += 'x-amz-date:' + headerDate + '\n';

    //  There was a TP.core.Hash of 'meta' data supplied.
    if (TP.isValid(meta = aRequest.at('meta'))) {
        metaAuthStr = TP.ac();

        //  Loop over each key/value pair in the meta information.
        meta.perform(
            function(kvPair) {

                //  Make an HTTP header entry for it and add it to the
                //  'metaAuthStr' for authentication computation later.
                headers.atPut('x-amz-meta-' + kvPair.first(),
                                    kvPair.last());

                metaAuthStr.push('x-amz-meta-', kvPair.first(), ':',
                                    kvPair.last(), '\n');
            });

        metaAuthStr = metaAuthStr.join('');
    } else {
        //  Ensure that the 'meta' authenication computation String is truly
        //  the empty String (not null or undefined).
        metaAuthStr = '';
    }

    //  Build up an 'authentication info' String as per the Amazon S3
    //  specification. This will get hashed and put into a special HTTP
    //  header for the S3 service.

    //  Before changing this, please know what you're doing... This is a *very*
    //  specific String, newlines and all, that gets hashed for authentication
    //  purposes.
    authenticationInfo = TP.join(
        verb, '\n',             //  verb

        '', '\n',               //  content MD5

        contentType, '\n',      //  content type

        '', '\n',               //  date (we use 'x-amz-date' instead, so this is
                                //  left blank per S3 documentation)

        aclAuthStr,             //  ACL header to sign

        metaAuthStr,            //  meta to sign

        resource);

    //  Hash it using our 'secretKey'
    authorization = TP.hmac(authenticationInfo, secretKey,
                            TP.HASH_SHA1, TP.HASH_B64);

    //  Put it at the special 'Authorization' header in the request.
    headers.atPut('Authorization',
        TP.join('AWS ', key, ':', authorization));

    return headers;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
