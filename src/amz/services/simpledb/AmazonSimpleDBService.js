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
 * @type {TP.amz.AmazonSimpleDBService}
 * @synopsis A subtype of TP.core.RESTService that communicates with the Amazon
 *     TP.amz.SimpleDB service.
 * @example If the TP.sig.AmazonSimpleDBRequest / TP.sig.AmazonSimpleDBResponse
 *     processing model is used, it is unnecessary to manually set up an
 *     TP.amz.AmazonSimpleDBService. As part of the TIBET infrastructure of
 *     using request/response pairs, a 'default' instance of this service will
 *     be instantiated and registered to handle all
 *     TP.sig.AmazonSimpleDBRequests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'AmazonSimpleDBServiceDefault'. It should have a
 *     vCard entry in the currently executing project. If this vCard cannot be
 *     found, the user will be prompted to enter the information about this
 *     server. If only part of the information can be found (i.e. the URL, but
 *     not the KEY or SECRET-KEY), the user will be prompted to enter the
 *     missing information.
 *
 *     It is possible, however, to manually set up a server. To do so, either
 *     supply the 'key' and 'secretkey' to the service:
 *
 *     simpleDBService = TP.amz.AmazonSimpleDBService.construct(
 *                  'myAmazonSimpleDBServer',
 *                  TP.hc('uri', 'http://sdb.amazonaws.com',
 *                          'key', '<developer key from Amazon>',
 *                          'secretkey', '<developer secret key from Amazon>'));
 *
 *     Or have a vCard entry where the 'FN' entry matches the resource ID that
 *     is passed to the 'construct' call as detailed here:
 *
 *     E.g.
 *
 *     <FN>myAmazonSimpleDBServer</FN>
 *     <URI>http://sdb.amazonaws.com<URI>
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
 *     TP.sig.AmazonSimpleDBRequests (otherwise, the TIBET machinery will
 *     instantiate the 'default' instance of TP.amz.AmazonSimpleDBService and
 *     register it to service these kinds of requests):
 *
 *     simpleDBService.register();
 */

//  ------------------------------------------------------------------------

TP.core.RESTService.defineSubtype('amz:AmazonSimpleDBService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Type.defineAttribute(
    'triggerSignals', 'TP.sig.AmazonSimpleDBRequest');

TP.amz.AmazonSimpleDBService.Type.defineAttribute('version', '2009-04-15');

TP.amz.AmazonSimpleDBService.register();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Inst.defineAttribute('serverKey');
TP.amz.AmazonSimpleDBService.Inst.defineAttribute('secretServerKey');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Inst.defineMethod('init',
function(resourceID, aRequest) {

    /**
     * @name init
     * @synopsis Returns an initialized instance of the receiver. If aRequest is
     *     provided it can help define the service's operation by providing a
     *     default serviceURI for the receiver. This uri is used when incoming
     *     requests don't provide a specific value.
     * @param {String} resourceID A unique service identifier.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.URIService} A new instance.
     */

    this.callNextMethod();

    this.configureAuthData(aRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Inst.defineMethod('clearAuthData',
function() {

    /**
     * @name clearAuthData
     * @synopsis Clears any stored authentication from the receiver and any
     *     backing store.
     * @returns {TP.core.Service} The receiver.
     */

    this.callNextMethod();

    this.set('serverKey', null);
    this.set('secretServerKey', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Inst.defineMethod('configureAuthData',
function(aRequest) {

    /**
     * @name configureAuthData
     * @synopsis Configures authentication data for the receiver.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional request or
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
    //  the supplied message.

    this.populateMissingVCardData(
        TP.hc('key',
                TP.ac(
                    'key',
                    'Enter server key (optional for public buckets): '),
              'secretkey',
                TP.ac(
                    'secretkey',
                    'Enter secret server key (optional for public buckets): ')),
        paramDict);

    //  The required serverKey isn't in the paramDict? Abort it.
    if (TP.notValid(serverKey = paramDict.at('key'))) {
        aRequest.fail(
            TP.sc('Missing required server key parameter in request'));

        return;
    }

    this.set('serverKey', serverKey);

    //  The required secretServerKey isn't in the paramDict? Abort it.
    if (TP.notValid(secretServerKey = paramDict.at('secretkey'))) {
        aRequest.fail(
            TP.sc('Missing required secret server key parameter in request'));

        return;
    }

    this.set('secretServerKey', secretServerKey);

    return this;
});

//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Inst.defineMethod('encodeURIParam',
function(uriParam) {

    /**
     * @name encodeURIParam
     * @synopsis Encodes the supplied URI parameter using the standard Amazon
     *     encoding, as per the SimpleDB scratchpad code example.
     * @param {String} uriParam The value to encode.
     * @returns {String} The supplied parameter encoded.
     */

    //  Do the standard Amazon encoding, as per the SimpleDB scratchpad code
    //  example.
    return encodeURIComponent(uriParam).replace(/!/g, '%21').
        replace(/'/g, '%27').
        replace(/\(/g, '%28').
        replace(/\)/g, '%29').
        replace(/\*/g, '%2A');
});

//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Inst.defineMethod('finalizeRequest',
function(aRequest) {

    /**
     * @name finalizeRequest
     * @synopsis Perform any final updates or processing on the request to make
     *     sure it is ready to send to TP.httpCall() for processing. For the
     *     Amazon SimpleDB service, this is the key routine that computes an
     *     authentication 'signature' using the 'uriparams' in the request, plus
     *     some additional parameters added here.
     * @param {TP.sig.AmazonSimpleDBRequest} aRequest The request being
     *     finalized.
     * @returns {TP.sig.AmazonSimpleDBRequest} The request to send. NOTE that
     *     this may not be the original request.
     */

    var key,
        secretKey,
        action,
        urlDate,
        resourceComponents,
        currentParams,
        resourceKeys,
        uri,
        uriPath,
        signatureString,
        signature;

    //  No key? Then fail the request and return.
    if (TP.isEmpty(key = this.get('serverKey')) &&
            TP.isEmpty(key = aRequest.at('key'))) {
        aRequest.fail(
            'No key in TP.amz.AmazonSimpleDBService::finalizeRequest');

        return null;
    }

    //  No secretKey? Then fail the request and return.
    if (TP.isEmpty(secretKey = this.get('secretServerKey')) &&
            TP.isEmpty(secretKey = aRequest.at('secretkey'))) {
        aRequest.fail(
            'No secretKey in TP.amz.AmazonSimpleDBService::finalizeRequest');

        return null;
    }

    action = aRequest.at('action');

    //  If the action is PutAttributes or DeleteAttributes repackage any
    //  'names', 'values' or 'replaces' keys.
    if ((action === 'PutAttributes') || (action === 'DeleteAttributes')) {
        this.repackageAttributes(aRequest);
    }

    //  Follow the Amazon SimpleDB procedure for including certain
    //  parameters in the GET request and for computing a signature from
    //  those parameters to authenticate us with the server.

    //  The date we'll use in our URL resource, as formatted by an
    //  TP.iso.ISO8601 timestamp formatter.
    urlDate = TP.dc().as(
        'TP.iso.ISO8601', '%{yyyy}-%{mm}-%{dd}T%{hhi}:%{mmn}:%{ss}.000Z');

    //  The initial set of components of the resource include our action,
    //  our Amazon 'key' and the current timestamp
    resourceComponents = TP.hc(
        'Action', aRequest.at('action'),
        'AWSAccessKeyId', key,
        'SignatureVersion', '2',
        'SignatureMethod', 'HmacSHA1',
        'Timestamp', urlDate,
        'Version', TP.amz.AmazonSimpleDBService.get('version'));

    //  If there were existing 'uri parameters' in the incoming request, add
    //  them (and overlay any values in) the resource components.
    if (TP.isValid(currentParams = aRequest.at('uriparams'))) {
        resourceComponents.addAll(currentParams);
    }

    //  Grab the keys and sort them using a natural order sort.
    resourceKeys = TP.keys(resourceComponents).sort(TP.NATURAL_ORDER_SORT);

    //  Build up an Array to turn into the 'signature string' that will be
    //  hashed to become the request's 'signature'.

    //  First, we need the URI as a TP.core.URI and its path.
    uri = TP.uc(aRequest.at('uri'));
    uriPath = uri.get('path');

    //  Start with the verb, the host from the URI and either the path or
    //  just a '/' if the path is empty.
    signatureString = TP.ac(aRequest.at('verb'), '\n',
        uri.get('host'), '\n', TP.isEmpty(uriPath) ? '/' : uriPath, '\n');

    //  Loop over all of the keys in the resource and add them to the
    //  signature string, sandwiching them with '=' and '&'.
    resourceKeys.perform(
        function(aKey) {

            //  We encode the URI parameters as per our encoding method but
            //  then we back out the transformations that
            //  'encodeURIComponent()' (called from that method) makes for
            //  '~' and '/' for the key and for '~' for the value, as per
            //  the spec from Amazon.
            signatureString.push(
                this.encodeURIParam(aKey).
                    replace('%7E', '~').
                    replace('%2F', '/'),
                '=',
                this.encodeURIParam(resourceComponents.at(aKey)).
                    replace('%7E', '~'),
                '&');
        }.bind(this));

    //  Pop off the last ampersand ('&')
    signatureString.pop();

    signatureString = signatureString.join('');

    //  Hash it using our 'secretKey'
    signature = TP.hmac(signatureString, secretKey, TP.HASH_SHA1, TP.HASH_B64);

    //  Put it at the special 'Signature' component in the resource
    //  components.
    resourceComponents.atPut('Signature', signature);

    //  Overwrite whatever TP.lang.Hash was at the 'uriparams' in the
    //  request with our resource components. We added any pre-existing ones
    //  above, so this doesn't actually destroy anything originally included
    //  in the request.
    aRequest.atPut('uriparams', resourceComponents);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Inst.defineMethod('repackageAttributes',
function(aRequest) {

    /**
     * @name repackageAttributes
     * @synopsis Repackages any 'attribute' names, values, replaces, etc. as per
     *     the Amazon SimpleDB specification.
     * @param {TP.sig.AmazonSimpleDBRequest} aRequest The request the attributes
     *     are being rewritten for.
     */

    var anAction,
        uriParams,
        names,
        values,
        replaces,
        count;

    //  Grab the 'action' and the 'uri parameters'.
    anAction = aRequest.at('action');
    uriParams = aRequest.at('uriparams');

    //  Grab any 'Name's, 'Value's and 'Replace's off of the request.
    names = aRequest.at('Names');
    values = aRequest.at('Values');
    replaces = aRequest.at('Replaces');

    //  'DeleteAttributes' allows an empty 'Names' list - it will just
    //  delete all attributes.
    if (TP.isEmpty(names) && (anAction === 'DeleteAttributes')) {
        return;
    }

    //  If 'Names' is empty and we got here, then it must be a
    //  'PutAttributes' - 'Names' is required for that operation.
    if (TP.isEmpty(names)) {
        aRequest.fail(
            TP.join(TP.sc('Missing "Names" parameter in request for action:'),
                ' "', anAction, '"'));
        return;
    }

    //  If 'Values' is empty but 'Names' is not, then we bail out since we
    //  need values for names.
    if (TP.isEmpty(values)) {
        aRequest.fail(
            TP.join(TP.sc('Missing "Values" parameter in request for action:'),
                ' "', anAction, '"'));
        return;
    }

    if (anAction === 'PutAttributes') {
        //  We keep track of our own count, since it will be different than
        //  the various indices that we encounter as we loop.
        count = 0;

        //  Loop over 'values' - they're the driver here.
        values.perform(
            function(aValue, anIndex) {

                var aName;

                //  Grab the 'name' at the same index.
                aName = names.at(anIndex);

                //  If the value is an Array, then we're putting multiple
                //  values at the same name in the attributes list of the
                //  item.
                if (TP.isArray(aValue)) {
                    //  Loop over each value, and add an entry for each name
                    //  / value pair. Note that the value of aName will be
                    //  constant here but the value and the count changes.
                    aValue.perform(
                        function(multiVal) {

                            uriParams.atPut(
                                TP.join('Attribute.', count, '.Name'),
                                aName);
                            uriParams.atPut(
                                TP.join('Attribute.', count++, '.Value'),
                                multiVal);
                        });
                } else {
                    //  Otherwise, we're only adding a single entry for the
                    //  name / value pair.
                    uriParams.atPut(
                        TP.join('Attribute.', count, '.Name'),
                        aName);
                    uriParams.atPut(
                        TP.join('Attribute.', count++, '.Value'),
                        aValue);
                }
            });

        //  If 'replaces' were defined, then we have to add them to the uri
        //  parameters.
        if (TP.notEmpty(replaces)) {
            //  Loop over 'replaces'
            replaces.perform(
                function(aName) {

                    var nameIndex;

                    //  We need to find the index of the name of the
                    //  attribute that we're replacing - that will be the
                    //  value that we use as the index on the 'replace'.
                    nameIndex = names.indexOf(aName);

                    uriParams.atPut(
                        TP.join('Attribute.', nameIndex, '.Replace'),
                        'true');
                });
        }
    } else if (anAction === 'DeleteAttributes') {
        //  We keep track of our own count, since it will be different than
        //  the various indices that we encounter as we loop.
        count = 0;

        //  Loop over 'values' - they're the driver here.
        values.perform(
            function(aValue, anIndex) {

                var aName;

                //  Grab the 'name' at the same index.
                aName = names.at(anIndex);

                //  If the value is an Array, then we're deleting multiple
                //  values at the same name in the attributes list of the
                //  item.
                if (TP.isArray(aValue)) {
                    //  Loop over each value, and add an entry for each name
                    //  / value pair. Note that the value of aName will be
                    //  constant here but the value and the count changes.
                    aValue.perform(
                        function(multiVal) {

                            uriParams.atPut(
                                TP.join('Attribute.', count, '.Name'),
                                aName);
                            uriParams.atPut(
                                TP.join('Attribute.', count++, '.Value'),
                                multiVal);
                        });
                } else {
                    //  Otherwise, we're only adding a single entry for the
                    //  name / value pair - using just the name.
                    uriParams.atPut(
                        TP.join('Attribute.', count++, '.Name'),
                        aName);
                }
            });
    }

    return;
});

//  ------------------------------------------------------------------------

TP.amz.AmazonSimpleDBService.Inst.defineMethod('rewriteRequestVerb',
function(aRequest) {

    /**
     * @name rewriteRequestVerb
     * @synopsis Returns the HTTP verb to use for the request. For the Amazon
     *     SimpleDB service the verb used is always TP.HTTP_GET.
     * @param {TP.sig.AmazonSimpleDBRequest} aRequest The request whose
     *     parameters define the HTTP request.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     */

    return TP.HTTP_GET;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
