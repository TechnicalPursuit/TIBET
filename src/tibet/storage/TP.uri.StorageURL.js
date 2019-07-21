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
 * @type {TP.uri.StorageURL}
 * @summary A subtype of TP.uri.URL specific to the storage: scheme, a custom
 *     TIBET scheme specific to working with local and session storage data.
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('TP.uri.StorageURL');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This RegExp splits up the URL into the following components:
//  storage://store(/?key[=value])
TP.uri.StorageURL.Type.defineConstant('STORAGE_URL_REGEX',
    TP.rc('^storage://([^/]+)((/)(.+))*'));

TP.uri.StorageURL.Type.defineConstant('SCHEME', 'storage');

TP.uri.StorageURL.Type.defineConstant('VALID_STORES',
    TP.ac('local', 'session'));

TP.uri.StorageURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.DUAL_MODE);
TP.uri.StorageURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.SYNCHRONOUS);

//  NOTE we need to register with the overall system to the URI.construct call
//  is aware of our scheme.
TP.uri.StorageURL.registerForScheme('storage');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.uri.StorageURL.Inst.defineAttribute('item');
TP.uri.StorageURL.Inst.defineAttribute('store');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.StorageURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Return the default URI handler type for this URI type.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler object.
     */

    //  Handle requests ourselves.
    return this;
});

//  ------------------------------------------------------------------------
//  Handler Methods
//  ------------------------------------------------------------------------

TP.uri.StorageURL.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.uri.URI} targetURI The URI to load. Note that this call is
     *     typically made via the load call of a URI and so rewriting and
     *     routing have already occurred.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     */

    var request,
        response,
        store,
        item,
        result,
        parsed;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    store = TP.global[targetURI.get('store') + 'Storage'];
    if (TP.notValid(store)) {
        this.raise('InvalidStore', targetURI.get('store'));
    }

    item = targetURI.get('item');
    if (TP.notEmpty(item)) {
        result = store.getItem(item);
        if (TP.notEmpty(result)) {
            try {
                parsed = TP.json2js(result);
                result = parsed;
            } catch (e) {
                //  ignore data that wasn't JSON formatted properly and just
                //  rely on the origin result.
                void 0;
            }
        }

        request.complete(result);
    } else {
        result = TP.hc(store);
        request.complete(result);
    }

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes a URI entirely, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.uri.URI} targetURI The URI to delete. Note that this call is
     *     typically made via the delete call of a URI and so rewriting and
     *     routing have already occurred.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     */

    var request,
        response,
        store,
        item;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    store = TP.global[targetURI.get('store') + 'Storage'];
    if (TP.notValid(store)) {
        this.raise('InvalidStore', targetURI.get('store'));
    }

    item = targetURI.get('item');
    if (TP.isEmpty(item)) {
        this.raise('InvalidOperation');
        request.fail('InvalidOperation');
    } else {
        store.removeItem(item);
        request.complete();
    }

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Saves URI data content. This is the default data persistence
     *     method for most URI content.
     * @description By creating alternative URI handlers and ensuring that URI
     *     routing can find them you can alter how data is managed for different
     *     URI instances. See TP.uri.URIRewriter and TP.uri.URIMapper for more
     *     information. Important keys include 'append', 'body', and 'backup',
     *     which define whether this save should append or write new content,
     *     what content is being saved, and whether a backup should be created
     *     if possible (for 'file' scheme uris).
     * @param {String|TP.uri.URI} targetURI A target URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     */

    var request,
        response,
        store,
        item,
        content;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    store = TP.global[targetURI.get('store') + 'Storage'];
    if (TP.notValid(store)) {
        this.raise('InvalidStore', targetURI.get('store'));
    }

    item = targetURI.get('item');
    if (TP.isEmpty(item)) {
        this.raise('InvalidOperation');
        request.fail('InvalidOperation');
    } else {
        //  NOTE we do _not_ want to force a fetch here, we only want whatever
        //  the targetURI already has stored as its resource.
        content = targetURI.$get('resource');

        //  often a content wrapper...we need string value.
        if (TP.isValid(content)) {
            content = TP.str(content);
        }

        store.setItem(item, TP.js2json(content));
        request.complete();
    }

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Type.defineMethod('watch',
function(targetURI, aRequest) {

    /**
     * @method watch
     * @summary Watches URI data content. This is used for URIs that represent
     *     remote resources in the system and can be notified by a server-side
     *     component that those resources have changed.
     * @description At this level, this method does nothing. Handlers that
     *     represent change-notification capable servers should override this
     *     method to set up change notification machinery for this URI back to
     *     TIBET.
     * @param {String|TP.uri.URI} targetURI A target URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     */

    var request,
        response;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    request.fail('UnsupportedOperation');

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Type.defineMethod('unwatch',
function(targetURI, aRequest) {

    /**
     * @method unwatch
     * @summary Unwatches (i.e. ignores) URI data content. This is used for URIs
     *     that represent remote resources in the system and can be notified by
     *     a server-side component that those resources have changed.
     * @description At this level, this method does nothing. Handlers that
     *     represent change-notification capable servers should override this
     *     method to tear down change notification machinery that it would have
     *     method to tear down change notification machinery for this URI that
     *     it would have set up to TIBET.
     * @param {String|TP.uri.URI} targetURI A target URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     */

    var request,
        response;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    request.fail('UnsupportedOperation');

    return response;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.StorageURL.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @method $getPrimaryResource
     * @summary Returns the value for the targeted URL from browser storage.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     content set as its result.
     */

    var request,
        result,
        response;

    request = this.constructRequest(aRequest);

    //  NOTE that we always load from localStorage value...never 'resource'
    result = this.load().get('result');
    this.$set('resource', result);

    //  filter any remaining data
    if (TP.isTrue(filterResult) && TP.isValid(result)) {
        result = this.$getFilteredResult(result, request, false);
    }

    response = request.getResponse(result);
    request.complete(result);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Inst.defineMethod('getResource',
function(aRequest) {

    /**
     * @method getResource
     * @summary Returns the resource the URL references.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     content set as its result.
     */

    var primaryResource,

        request,
        result,

        response;

    request = this.constructRequest(aRequest);

    primaryResource = this.$get('resource');

    result = this.$getFilteredResult(primaryResource, request);

    //  synchronous? complete any request we might actually have.
    if (TP.canInvoke(request, 'complete')) {
        request.complete(result);
    }

    response = request.getResponse(result);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the URI, essentially the 'resource'.
     * @returns {Object} The value of the receiver's resource.
     */

    return TP.val(this.getContent());
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Inst.defineMethod('isPrimaryURI',
function() {

    /**
     * @method isPrimaryURI
     * @summary Returns true if the receiver is a primary URI, meaning it has
     *     no fragment portion and can store data. Storage URIs are always
     *     primary URIs, there is no concept of a fragment.
     * @returns {Boolean} True if the receiver is a primary URI.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @method $initURIComponents
     * @summary Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.core.Hash} parts The parsed URI components.
     * @returns {TP.uri.StorageURL} The receiver.
     */

    this.callNextMethod();

    if (TP.isEmpty(parts)) {
        return this;
    }

    //  NOTE: These 'set' calls use 'false' to avoid notification!! This is
    //  necessary when creating a URI, since otherwise the change notification
    //  mechanism will cause errors trying to get observations set up before
    //  everything is in place.

    this.set('store', parts.at('store'), false);
    this.set('item', parts.at('item'), false);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash} The parsed URI 'components'.
     */

    var hash,
        parts;

    this.callNextMethod();

    parts = this.getType().STORAGE_URL_REGEX.exec(
                    'storage:' + schemeSpecificString);

    if (TP.notValid(parts)) {
        return TP.hc();
    }

    hash = TP.hc();
    hash.atPut('store', parts[1]);
    hash.atPut('item', parts[4]);

    return hash;
});

//  ------------------------------------------------------------------------

TP.uri.StorageURL.Inst.defineMethod('$setPrimaryResource',
function(aResource, aRequest) {

    /**
     * @method $setPrimaryResource
     * @summary Sets the receiver's resource object, the object TIBET will
     *     treat as the primary resource for any subsequent processing.
     * @param {Object} aResource The resource object to assign.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @listens {TP.sig.Change} Observes the primary resource for Change.
     * @returns {TP.uri.StorageURL|TP.sig.Response} The receiver or a
     *     TP.sig.Response when the resource must be acquired in an async fashion
     *     prior to setting any fragment value.
     */

    this.$set('resource', aResource);

    //  NOTE that we always push value to proper storage target.
    if (aResource === undefined) {
        this.delete(aRequest);
    } else {
        this.save(aRequest);
    }

    //  Perform normal processing to ensure we signal etc.
    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
