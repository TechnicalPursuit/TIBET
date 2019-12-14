//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.sig.HTTPRequest
//  ========================================================================

/**
 * @type {TP.sig.HTTPRequest}
 * @summary Top-level request type for HTTP-based services.
 */

//  ------------------------------------------------------------------------

TP.sig.URIRequest.defineSubtype('HTTPRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Type.defineAttribute('responseType', 'TP.sig.HTTPResponse');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineMethod('failJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method failJob
     * @summary Fails the HTTP request, aborting any underlying native
     *     XMLHttpRequest object as well. NOTE that this would have to be an
     *     asynchronous request for this to work effectively.
     * @param {String} aFaultString A text description of the reason for the
     *     failure.
     * @param {Object} aFaultCode A reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.sig.HTTPRequest}
     */

    var httpObj,
        msg,
        url,
        uri;

    //  presumably we can do this only because the request is async and
    //  we've got some cycles...so do what we can to turn off the request
    if (TP.isXHR(httpObj = this.at('commObj'))) {
        TP.httpAbort(httpObj);
    }

    msg = aFaultCode + ' ' + aFaultString;

    this.atPut('direction', TP.RECV);
    this.atPut('message',
        TP.isEmpty(msg) ? 'HTTP request aborted.' :
                        'HTTP request aborted: ' + msg);

    TP.ifInfo() && TP.sys.shouldLogIO() ?
            TP.sys.logIO(this, TP.INFO) : 0;

    //  TODO: migrate to the TP.core.HTTPURIHandler

    //  update what we consider to be our "final uri", the qualified URI
    //  based on parameter data etc.
    url = this.at('finaluri');
    if (TP.isURIString(url)) {
        uri = TP.uc(url);
        if (TP.isURI(uri)) {
            uri.isLoaded(false);
            //  Note here that we don't alter the status of the dirty flag. If
            //  the resource is dirty, it stays dirty. If not, we don't alter
            //  that.
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineMethod('cancelJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancelJob
     * @summary Cancels an HTTP request, aborting any underlying native
     *     XMLHttpRequest object as well. NOTE that this would have to
     * @param {String} aFaultString A text description of the reason for the
     *     cancellation.
     * @param {Object} aFaultCode A reason for the cancellation.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.sig.HTTPRequest}
     */

    var httpObj,
        msg,
        url,
        uri;

    //  presumably we can do this only because the request is async and
    //  we've got some cycles...so do what we can to turn off the request
    if (TP.isXHR(httpObj = this.at('commObj'))) {
        TP.httpAbort(httpObj);
    }

    msg = aFaultCode + ' ' + aFaultString;

    this.atPut('direction', TP.RECV);
    this.atPut('message',
        TP.isEmpty(msg) ? 'HTTP request cancelled.' :
                        'HTTP request cancelled: ' + msg);

    TP.ifInfo() && TP.sys.shouldLogIO() ?
            TP.sys.logIO(this, TP.INFO) : 0;

    //  TODO: migrate to the TP.core.HTTPURIHandler

    //  update what we consider to be our "final uri", the qualified URI
    //  based on parameter data etc.
    url = this.at('finaluri');
    if (TP.isURIString(url)) {
        uri = TP.uc(url);
        if (TP.isURI(uri)) {
            uri.isLoaded(false);
            //  Note here that we don't alter the status of the dirty flag. If
            //  the resource is dirty, it stays dirty. If not, we don't alter
            //  that.
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @method completeJob
     * @summary Completes the request, peforming any wrapup that might be
     *     necessary to ensure proper capture of the result data.
     *     TP.sig.URIRequests will attempt to update their target URI instance
     *     with any result data in response to this call.
     * @param {Object} aResult An optional object to set as the result of the
     *     request.
     * @returns {TP.sig.HTTPRequest}
     */

    var httpObj,
        url,
        uri,
        data,
        result,

        wasRefreshingContent;

    httpObj = this.at('commObj');

    //  update what we consider to be our "final uri", the qualified URI
    //  based on parameter data etc.
    url = this.at('finaluri');
    if (TP.isURIString(url)) {
        uri = TP.uc(url);
        if (TP.isURI(uri)) {
            uri.updateHeaders(httpObj);

            //  Get the filtered resource result as our request response. This
            //  does not change the uri's internally held resource (although it
            //  may change the internal data of a content object resource).
            data = uri.getRequestedResource(this);
        }
    }

    result = TP.ifInvalid(aResult, data);

    switch (this.at('resultType')) {
        case TP.DOM:
            if (!TP.isNode(result)) {
                result = httpObj.responseXML;
            }
            break;
        case TP.TEXT:
            if (!TP.isString(result)) {
                result = httpObj.responseText;
            }
            break;
        case TP.XHR:
        case TP.NATIVE:
            if (!TP.isXHR(result)) {
                result = httpObj;
            }
            break;
        default:    //  TP.WRAP
            break;
    }

    //  Set the result to the new data (or to the old data if the new data was
    //  invalid, per our switch statement above).
    this.set('result', result);

    //  Now, if we have a valid URI, update the resource cache again, which will
    //  use the result we just set and will update it to the new (or maybe old)
    //  data. NOTE: we capture the result and return it as the result from the
    //  HTTP call. This is important so that we get the last, most up-to-date
    //  data representation.
    if (TP.isValid(uri)) {

        //  Note how we force the 'refreshContent' setting to true here - this
        //  will make sure that the resource cache is updated with the content
        //  from this request and that the proper result is returned.
        wasRefreshingContent = this.at('refreshContent');
        this.atPut('refreshContent', true);

        //  Get the filtered resource result as our request response. This does
        //  not change the uri's internally held resource (although it may
        //  change the internal data of a content object resource).
        result = uri.getRequestedResource(this);

        this.atPut('refreshContent', wasRefreshingContent);
    }

    return this.callNextMethod(result);
});

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineHandler('IOFailed',
function(aSignal) {

    /**
     * @method handleIOFailed
     * @summary Handles notification that the underlying IO operation failed
     *     for some reason. The reason for the failure should be recorded in the
     *     response's faultCode/faultText content. IFF the receiver handles the
     *     specific status code, i.e. it has a method such as handle404, then
     *     that handler is called before processing a fail call.
     * @param {TP.sig.IOFailed} aSignal A response object containing the native
     *     XMLHttpRequest as 'commObj'.
     * @returns {TP.sig.HTTPRequest} The receiver.
     */

    var request,
        httpObj,
        code,
        handlerName,
        defer,
        faultCode,
        result;

    request = aSignal.getPayload();
    if (TP.isValid(request)) {
        httpObj = request.at('commObj');
        this.atPut('commObj', httpObj);
    }

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        //  the next thing to try is to see if we handle the status code in
        //  question, which lets us defer to handle404 etc.
        code = httpObj.status;

        //  set the fault code, which might be cleared if the handler is
        //  able to recover gracefully.
        this.set('faultCode', code);

        //  set the fault text, if any. this should be cleared by any handler
        //  function as needed.
        this.set('faultText', httpObj.statusText);

        handlerName = TP.composeHandlerName(code);
        if (TP.canInvoke(request, handlerName)) {
            defer = true;
            request[handlerName](aSignal);
        } else if (TP.canInvoke(this, handlerName)) {
            defer = true;
            this[handlerName](aSignal);
        }
    } finally {
        //  When we've deferred to a status-specific handler that handler is
        //  responsible for completion of the job since some handlers may
        //  need to make additional asynchronous calls to resolve things.
        if (TP.notTrue(defer)) {
            if (TP.isValid(faultCode = this.getFaultCode())) {
                this.fail(this.getFaultText(), faultCode, this.getFaultInfo());
            } else {
                result = aSignal.getResult();
                if (TP.isValid(result)) {
                    this.complete(result);
                } else {
                    this.complete();
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineHandler('IOSucceeded',
function(aSignal) {

    /**
     * @method handleIOSucceeded
     * @summary A handler which is invoked when the request's low-level IO has
     *     completed successfully.
     * @param {TP.sig.IOSucceeded} aSignal The signal, whose payload is includes
     *     the low-level request object itself as httpObj.
     * @returns {TP.sig.HTTPRequest} The receiver.
     */

    var request,
        httpObj,
        code,
        defer,
        handlerName,
        faultCode,
        result;

    //  first step is to make sure that if the incoming signal's request
    //  isn't actually the receiver we still tuck away the xhr for reference
    request = aSignal.getPayload();
    if (TP.isValid(request)) {
        httpObj = request.at('commObj');
        this.atPut('commObj', httpObj);
    }

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        //  the next thing to try is to see if we handle the status code in
        //  question, which lets us defer to handle304 etc.
        code = httpObj.status;

        handlerName = TP.composeHandlerName(code);
        if (TP.canInvoke(request, handlerName)) {
            defer = true;
            request[handlerName](aSignal);
        } else if (TP.canInvoke(this, handlerName)) {
            defer = true;
            this[handlerName](aSignal);
        }
    } finally {
        //  When we've deferred to a status-specific handler that handler is
        //  responsible for completion of the job since some handlers may
        //  need to make additional asynchronous calls to resolve things.
        if (TP.notTrue(defer)) {
            if (TP.isValid(faultCode = this.getFaultCode())) {
                this.fail(this.getFaultText(), faultCode, this.getFaultInfo());
            } else {
                result = aSignal.getResult();
                if (TP.isValid(result)) {
                    this.complete(result);
                } else {
                    this.complete();
                }
            }
        }
    }

    return this;
});

//  ========================================================================
//  TP.sig.HTTPResponse
//  ========================================================================

/**
 * @type {TP.sig.HTTPResponse}
 * @summary Provides a general purpose HTTP response wrapper.
 */

//  ------------------------------------------------------------------------

TP.sig.URIResponse.defineSubtype('HTTPResponse');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineAttribute('responseXML');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @method getFaultCode
     * @summary Returns the fault code if any.
     * @returns {String|undefined} A fault code.
     */

    var httpObj,
        statusCode;

    httpObj = this.getRequest().at('commObj');
    if (TP.isXHR(httpObj)) {
        if (!TP.httpDidSucceed(httpObj)) {
            //  If the XHR mechanism has aborted in Mozilla, it will cause
            //  the '.status' property to throw an exception if it is read.
            try {
                statusCode = httpObj.status;
            } catch (e) {
                statusCode = null;
            } finally {
                /* eslint-disable no-unsafe-finally */
                return statusCode;
                /* eslint-enable no-unsafe-finally */
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getFaultText',
function() {

    /**
     * @method getFaultText
     * @summary Returns the fault message string if any.
     * @returns {String|undefined} A fault message string.
     */

    var httpObj;

    httpObj = this.getRequest().at('commObj');
    if (TP.isXHR(httpObj)) {
        if (!TP.httpDidSucceed(httpObj)) {
            return httpObj.statusText;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @method getNativeObject
     * @summary Returns the native XMLHttpRequest object which serves as the
     *     container for the response data managed by this type. This method is
     *     consistent with the requirements of TP.unwrap() so that
     *     TP.unwrap()ing a TP.sig.HTTPResponse will return you the native
     *     XMLHttpRequest that it contains.
     * @returns {XMLHttpRequest} The native XMLHttpRequest.
     */

    //  if we have one it'll be stored with our request in the 'commObj' key
    return this.getRequest().at('commObj');
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseHeader',
function(headerName) {

    /**
     * @method getResponseHeader
     * @summary Returns the value of the named response header.
     * @param {String} headerName The HTTP header to return.
     * @returns {String|undefined}
     */

    var httpObj,
        header;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    try {
        header = httpObj.getResponseHeader(headerName);
    } catch (e) {
        //  moz likes to toss its cookies rather than be sensible here when
        //  a header isn't found :(
        return;
    }

    return header;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseHeaders',
function() {

    /**
     * @method getResponseHeaders
     * @summary Returns a hash containing all response header key/value pairs.
     * @returns {TP.core.Hash|undefined}
     */

    var httpObj,

        str,

        dict,
        arr,

        i,

        parts,
        key,
        value;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    str = httpObj.getAllResponseHeaders();

    dict = TP.hc();
    arr = str.split('\n');

    for (i = 0; i < arr.getSize(); i++) {
        parts = arr.at(i).split(':');
        key = parts.shift();
        value = parts.join(':');

        if (TP.notEmpty(key)) {
            dict.atPut(key, value);
        }
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseStatusCode',
function() {

    /**
     * @method getResponseStatusCode
     * @summary Returns the HTTP status code (200 for success) of the response.
     * @returns {Number|undefined} The status code.
     */

    var httpObj;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        return httpObj.status;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error retrieving status code.')) : 0;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseStatusText',
function() {

    /**
     * @method getResponseStatusText
     * @summary Returns the status message (text) of the response.
     * @returns {String|undefined}
     */

    var httpObj;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    try {
        return httpObj.statusText;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error retrieving status text.')) : 0;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseText',
function() {

    /**
     * @method getResponseText
     * @summary Returns the response text.
     * @returns {String|undefined}
     */

    var httpObj,
        text;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    try {
        text = httpObj.responseText;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error retrieving response text.')) : 0;
    }

    return text;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseXML',
function() {

    /**
     * @method getResponseXML
     * @summary Returns the DOM Node containing the response in XML form.
     * @returns {XMLDocument|undefined}
     */

    var xml,
        httpObj,
        url,
        text,

        xmlnsInfo,
        defaultNS;

    //  did we already build it? just return it
    if (TP.isNode(xml = this.$get('responseXML'))) {
        return xml;
    }

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    try {
        //  Moz needs to work from text to avoid tainting-related
        //  exceptions and other browsers mess with responseXML as well, so
        //  we just use the text.
        text = httpObj.responseText;

        if (TP.notEmpty(text)) {

            //  Try to guess the default XML namespace from the MIME type
            //  computed from the supplied text and URL.
            url = TP.uc(this.getRequest().at('finaluri'));
            if (TP.isValid(xmlnsInfo =
                            TP.w3.Xmlns.fromMIMEType(
                                TP.ietf.mime.guessMIMEType(text, url)))) {
                defaultNS = xmlnsInfo.at('uri');
            } else {
                defaultNS = null;
            }

            //  NOTE not everything we go after actually _is_ XML to tell
            //  the parse step to work quietly
            xml = TP.documentFromString(text, defaultNS, false);
        }
    } catch (e) {
        xml = null;
    }

    if (TP.isNode(xml)) {
        this.$set('responseXML', xml);
    }

    return xml;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResult',
function(aFormat) {

    /**
     * @method getResult
     * @summary Returns the request result.
     * @description If a result type is specified in the responder's payload
     *     under the 'resultType' key, that is the result type used. Otherwise,
     *     by default it tries to return the XML representation, followed by the
     *     text representation if the XML can't be formed from the response. An
     *     explicit return type can be forced by supplying a format constant.
     * @param {Number} aFormat One of the TP constants for low-level result
     *     data: TP.DOM, TP.TEXT, or TP.NATIVE.
     * @returns {Object} The object in the requested format.
     */

    var format,
        result;

    format = aFormat;
    if (TP.notValid(format)) {
        format = this.at('resultType');
    }

    switch (format) {
        case TP.DOM:
            return this.getResponseXML();
        case TP.TEXT:
            return this.getResponseText();
        case TP.XHR:
        case TP.NATIVE:
            return this.getRequest().at('commObj');
        default:
            //  Default is to try to find the best object possible at the
            //  low level.
            result = this.$get('result');
            if (TP.notValid(result)) {
                result = this.getResponseXML();
            }

            if (TP.notValid(result)) {
                result = this.getResponseText();
            }
            return result;
    }
});

//  ========================================================================
//  TP.uri.HTTPService
//  ========================================================================

/**
 * @type {TP.uri.HTTPService}
 * @summary The top-level service for all services which use HTTP-based
 *     primitives for their transport layer. This service is capable of
 *     performing all the basic requirements of making XMLHttpRequest calls
 *     while offering several template methods that subtypes can override to
 *     perform service-specific adjustments to the overall request processing
 *     logic.
 */

//  ------------------------------------------------------------------------

TP.uri.URIService.defineSubtype('HTTPService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the default MIME type to use for encoding the body
TP.uri.HTTPService.Type.defineAttribute('mimetype', TP.PLAIN_TEXT_ENCODED);

//  the default method to use for services of this type
TP.uri.HTTPService.Type.defineAttribute('httpMethod', TP.HTTP_GET);

//  HTTP services can support access via either sync or async requests
TP.uri.HTTPService.Type.defineAttribute('supportedModes',
                                        TP.core.SyncAsync.DUAL_MODE);
TP.uri.HTTPService.Type.defineAttribute('mode',
                                        TP.core.SyncAsync.ASYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineMethod('finalizeRequest',
function(aRequest) {

    /**
     * @method finalizeRequest
     * @summary Perform any final updates or processing on the request to make
     *     sure it is ready to send to TP.httpCall for processing.
     * @param {TP.sig.Request} aRequest The request being finalized.
     * @returns {TP.sig.HTTPRequest} The request to send. NOTE that this may not
     *     be the original request.
     */

    var mimetype,

        body,
        boundaryMarker,

        headers;

    mimetype = aRequest.at('mimetype');

    //  If the MIME type is set to be one of the 'multipart' encoding types
    //  that we support, then we need to grab the 'boundary' that will be
    //  found throughout the body, but we grab the one at the end surrounded
    //  by '--' and '--'.
    if (mimetype === TP.MP_RELATED_ENCODED ||
        mimetype === TP.MP_FORMDATA_ENCODED) {

        body = aRequest.at('body');
        boundaryMarker = /--([$\w]+)--/.match(body);

        headers = aRequest.at('headers');

        //  If we successfully got a boundary value, then add it to the
        //  'Content-Type' header.
        if (TP.isValid(boundaryMarker) && TP.notEmpty(boundaryMarker.at(1))) {
            headers.atPut('Content-Type',
                            TP.join(mimetype,
                                    '; boundary="',
                                    boundaryMarker.at(1),
                                    '"'));
        } else {
            headers.atPut('Content-Type', mimetype);
        }
    }

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineMethod('getMIMEType',
function() {

    /**
     * @method getMIMEType
     * @summary Returns the MIME type this service uses for body encoding by
     *     default. This value is only used when a request does not specify a
     *     mimetype directly.
     * @returns {String} A constant suitable for TP.httpEncode.
     */

    return this.$get('mimetype') || this.getType().get('mimetype');
});

//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineMethod('getHTTPMethod',
function() {

    /**
     * @method getHTTPMethod
     * @summary Returns the HTTP method used for this service type by default.
     *     In some cases this value isn't simply a default, it's the value used
     *     for all requests made via this service.
     * @returns {String} A TIBET HTTP method constant such as TP.HTTP_GET.
     */

    return this.$get('httpMethod') || this.getType().get('httpMethod');
});

//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineHandler('HTTPRequest',
function(aRequest) {

    /**
     * @method handleHTTPRequest
     * @summary Constructs an appropriate response for the request provided,
     *     working to manage asynchronous calls in a manner consistent with the
     *     rest of the service/request/response model.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @exception TP.sig.InvalidRequest
     * @exception TP.sig.InvalidURI
     * @returns {TP.sig.HTTPResponse|undefined} The service's response to the
     *     request.
     */

    var request,
        url,
        response;

    if (!TP.isKindOf(aRequest, 'TP.sig.HTTPRequest')) {
        this.raise('TP.sig.InvalidRequest');

        return;
    }

    //  If either a new 'serviceURI' parameter or a 'uri' parameter with an
    //  absolute path is supplied in the request, we reset our serviceURI to
    //  that value.
    this.updateServiceURI(aRequest);

    request = aRequest;

    //  start by rewriting the uri to target the proper concrete location
    request.atPut('uri', this.rewriteRequestURI(request));

    //  rewriting sometimes still fails to produce a viable url. when that
    //  happens the rewrite call will have signaled the error so we just
    //  fail the request.
    url = request.at('uri');
    if (TP.notValid(url)) {
        return request.fail('TP.sig.InvalidURI');
    }

    //  rewrite the method as needed. some services require POST etc.
    request.atPut('method', this.rewriteRequestMethod(request));

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    //  NOTE that we need to do this prior to the body processing
    request.atPut('mimetype', this.rewriteRequestMIMEType(request));

    //  rewrite/update the request body content
    request.atPut('body', this.rewriteRequestBody(request));

    //  Since we just encoded the body, we don't need to do it again.
    request.atPut('isencoded', true);

    //  rewrite/update the headers as needed for this service
    //  NOTE that we do this last so all body transformations are done in
    //  case we want to manipulate the headers based on body content
    request.atPut('headers', this.rewriteRequestHeaders(request));

    //  one last chance to tweak things before we ship it to the primitive
    //  and NOTE NOTE NOTE that we capture the return value here which
    //  allows the entire request to be reconstructed if necessary
    request = this.finalizeRequest(request);

    //  with all request tweaking in place we can now construct our
    //  response, which may have had the type/name altered by request
    //  rewriting
    response = request.getResponse();

    //  go ahead and perform the HTTP call
    this.performHTTPCall(request);

    //  we return a response specific to the request, but note that it may
    //  not be complete if the call was async
    return response;
});

//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineMethod('performHTTPCall',
function(aRequest) {

    /**
     * @method performHTTPCall
     * @summary Performs the HTTP call. This is the method that actually does
     *     the work and can be overridden in subtypes of this type that have
     *     special types of HTTP calling semantics (WebDAV is a good example of
     *     this).
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @exception TP.sig.InvalidURI
     * @returns {TP.sig.HTTPRequest|undefined} The supplied request.
     */

    var url;

    //  Make sure we have a viable URL.
    url = aRequest.at('uri');
    if (TP.notValid(url)) {
        return aRequest.fail('TP.sig.InvalidURI');
    }

    try {
        //  TP.$httpWrapup() processing will call back to the request via
        //  handleIO* based on success/failure and the rest is handled
        //  there...see the request type's handleIO* methods for more
        TP.httpCall(url, aRequest);
    } catch (e) {
        aRequest.atPut('object', e);
        aRequest.atPut('message', TP.str(e));

        TP.httpError(url,
            TP.ifKeyInvalid(aRequest, 'exceptionType', 'HTTPException'),
            aRequest);
        return;
    }

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineMethod('rewriteRequestBody',
function(aRequest) {

    /**
     * @method rewriteRequestBody
     * @summary Encodes the request body for transmission. Processing in this
     *     method makes use of keys in the request to drive a call to the
     *     TP.httpEncode() primitive. If you don't want this processing to occur
     *     you can put a key of 'noencode' with a value of true in the request.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {String|undefined} The string value of the encoded body content.
     */

    var body;

    body = aRequest.at('body');
    if (TP.notValid(body)) {
        return;
    }

    //  Use whatever the body object reports back as it's 'best HTTP value'
    body = body.asHTTPValue();
    aRequest.atPut('body', body);

    return TP.httpEncodeRequestBody(aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineMethod('rewriteRequestMIMEType',
function(aRequest) {

    /**
     * @method rewriteRequestMIMEType
     * @summary Returns the MIME type this service uses for body encoding.
     * @param {TP.sig.HTTPRequest} aRequest The request to rewrite for.
     * @returns {String} A constant suitable for TP.httpEncode.
     */

    //  Return the MIME type using the following hierarchy:
    //      1.  The request's mimetype. If empty:
    //      2.  The service instance's mimetype. If empty:
    //      3.  The MIME type that can be guessed from the content and the URI,
    //          defaulting to the service type's mime type.
    return TP.ifEmpty(
            aRequest.at('mimetype'),
            TP.ifEmpty(
                this.$get('mimetype'),
                TP.ietf.mime.guessMIMEType(
                    aRequest.at('body'),
                    TP.uc(aRequest.at('uri')),
                    this.getType().get('mimetype'))
                )
            );
});

//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineMethod('rewriteRequestHeaders',
function(aRequest) {

    /**
     * @method rewriteRequestHeaders
     * @summary Returns a TP.core.Hash of HTTP headers appropriate for the
     *     service.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {TP.core.Hash} The hash of rewritten request headers.
     */

    var headers,
        url;

    //  make sure we can define header values as needed to control the call
    headers = aRequest.at('headers');
    if (TP.notValid(headers)) {
        headers = TP.hc();
    }

    //  Make sure we have a viable URL.
    url = aRequest.at('uri');
    if (TP.notValid(url)) {
        return aRequest.fail('TP.sig.InvalidURI');
    }

    //  If there is no header defined for Content-Type in the request, use the
    //  MIME type that was determined for body encoding.
    headers.atPutIfAbsent('Content-Type', aRequest.at('mimetype'));

    return headers;
});

//  ------------------------------------------------------------------------

TP.uri.HTTPService.Inst.defineMethod('rewriteRequestMethod',
function(aRequest) {

    /**
     * @method rewriteRequestMethod
     * @summary Returns the HTTP method to use for the request. For many
     *     services the value in the request will be used, but some services
     *     force the method to be a specific one, such as XML-RPC where POST is
     *     a requirement.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {String} A TIBET HTTP method constant such as TP.HTTP_GET.
     */

    return TP.ifEmpty(aRequest.at('method'), this.getHTTPMethod());
});

//  ========================================================================
//  TP.sig.HTTPLoadRequest
//  ========================================================================

TP.sig.HTTPRequest.defineSubtype('HTTPLoadRequest');

//  ========================================================================
//  TP.sig.HTTPDeleteRequest
//  ========================================================================

TP.sig.HTTPRequest.defineSubtype('HTTPDeleteRequest');

//  ========================================================================
//  TP.sig.HTTPSaveRequest
//  ========================================================================

TP.sig.HTTPRequest.defineSubtype('HTTPSaveRequest');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
