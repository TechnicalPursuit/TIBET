//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
Common HTTP verb support. Each of the calls in this file ultimately relies
on the low-level TP.httpCall function in one of the browser-specific HTTP
support files. The value of these wrappers lies in their pre-built request
configuration logic, which helps keep things easier for callers and in their
common response handling.

NOTE that all of these functions return the XMLHttpRequest object used to
process the request to ensure consistency and provide a means for aborting
a request or checking on its completion status.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('httpAbort',
function(httpObj) {

    /**
     * @method httpAbort
     * @summary Aborts an in-process XMLHttpRequest, clearing any handlers
     *     which may be present.
     * @param {XMLHttpRequest} httpObj The native XMLHttpRequest to abort.
     * @returns {XMLHttpRequest} The aborted XHR object.
     */

    if (TP.notValid(httpObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  IE prefers an empty function here
    httpObj.onreadystatechange = TP.RETURN_NULL;
    httpObj.abort();

    return httpObj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpDelete',
function(targetUrl, aRequest) {

    /**
     * @method httpDelete
     * @summary Attempts to delete the target URL via an HTTP DELETE. On
     *     success the return value's status property will be TP.core.HTTP.OK.
     *     Note that no redirect processing is used in this call to avoid any
     *     potential confusion related to the true target unless you
     *     specifically add a key of 'redirect' with a value of true to the
     *     request.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI, HTTPException
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     */

    var request;

    //  we use httpSend which is used for state-change verbs and their
    //  processing. but we make sure the request says noredirect for DELETE
    //  and we also turn off query and payload processing
    request = TP.ifInvalid(aRequest, TP.request());
    request.atPutIfAbsent('redirect', false);

    return TP.$httpSend(TP.HTTP_DELETE, targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpGet',
function(targetUrl, aRequest) {

    /**
     * @method httpGet
     * @summary Gets the named resource via an HTTP GET call. You can pass
     *     parameters to the root url by using the query parameter of aRequest.
     *     The query is application/x-www-form-urlencoded and appended to the
     *     targetUrl. If no query is provided then the URI is assumed to be
     *     complete and is used "as is". For GET calls the Content-Type is
     *     automatically set to the encoding format of the data to ensure
     *     consistency.
     * @param {String} targetUrl The request's target URL, or the root of that
     *     URL, ready for the addition of any encoded data values.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI, HTTPException
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     */

    var request,
        headers,
        contentType;

    request = TP.ifInvalid(aRequest, TP.request());

    //  here we ensure the proper Content-Type header is set for GET. Note
    //  that, unlike in PUT and POST, we force x-www-form-urlencoded and log
    //  a warning if they tried to supply another Content-Type.
    headers = request.at('headers');
    if (TP.notValid(headers)) {
        headers = TP.hc('Content-Type', TP.URL_ENCODED);
        request.atPutIfAbsent('headers', headers);
    } else {
        if (TP.notEmpty(contentType = headers.at('Content-Type'))) {
            if (contentType !== TP.URL_ENCODED) {
                TP.ifWarn() ?
                    TP.warn('Content-Type supplied to GET call.' +
                                ' Forcing to be ' + TP.URL_ENCODED + '.',
                            TP.IO_LOG) : 0;
            }
        }

        headers.atPut('Content-Type', TP.URL_ENCODED);
    }

    return TP.$httpQuery(TP.HTTP_GET, targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpHead',
function(targetUrl, aRequest) {

    /**
     * @method httpHead
     * @summary Returns an XMLHttpRequest containing the result of a HEAD call
     *     with the specified URL.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     */

    return TP.$httpQuery(TP.HTTP_HEAD, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpOptions',
function(targetUrl, aRequest) {

    /**
     * @method httpOptions
     * @summary Makes an OPTIONS request of the URL provided. The 'Allow'
     *     header from the response, available via getResponseHeader, provides
     *     the option list.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     */

    return TP.$httpQuery(TP.HTTP_OPTIONS, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpPost',
function(targetUrl, aRequest) {

    /**
     * @method httpPost
     * @summary Sends the data contained in the 'body' parameter of the request
     *     to the targetUrl using an HTTP POST.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     */

    return TP.$httpSend(TP.HTTP_POST, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpPut',
function(targetUrl, aRequest) {

    /**
     * @method httpPut
     * @summary Sends the data contained in the 'body' parameter of the request
     *     to the targetUrl using an HTTP PUT.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     */

    return TP.$httpSend(TP.HTTP_PUT, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpTrace',
function(targetUrl, aRequest) {

    /**
     * @method httpTrace
     * @summary Returns an XMLHttpRequest object containing TRACE results for
     *     the specified URL. Response headers and resultText of that object
     *     will contain the requested data.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     */

    return TP.$httpQuery(TP.HTTP_TRACE, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$httpQuery',
function(httpVerb, targetUrl, aRequest) {

    /**
     * @method $httpQuery
     * @summary Returns an XMLHttpRequest containing the result of an HTTP
     *     "query", meaning a non-state-changing request, with the specified
     *     verb, URL, and associated parameters. This routine is the common
     *     handler for GET, HEAD, OPTIONS, and TRACE. You can pass parameters to
     *     the root url by using the query parameter of aRequest. The query's
     *     key/value pairs are then application/x-www-form-urlencoded and
     *     appended to the URL.
     * @param {String} httpVerb TP.HTTP_GET, TP.HTTP_HEAD, TP.HTTP_OPTIONS, or
     *     TP.HTTP_TRACE.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     */

    var request,
        httpObj;

    request = TP.ifInvalid(aRequest, TP.request());

    request.atPut('uri', targetUrl);
    request.atPut('verb', httpVerb);

    if (TP.isEmpty(targetUrl)) {
        return TP.httpError(targetUrl, 'TP.sig.InvalidURI',
                            request);
    }

    try {
        httpObj = TP.httpCall(targetUrl, request);
    } catch (e) {
        request.atPut('object', e);
        request.atPut('message', TP.str(e));

        return TP.httpError(
                    targetUrl,
                    TP.ifKeyInvalid(request,
                                    'exceptionType',
                                    'HTTPException'),
                    request);
    }

    return httpObj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$httpSend',
function(httpVerb, targetUrl, aRequest) {

    /**
     * @method $httpSend
     * @summary Sends the data contained in the 'body' parameter of the request
     *     to the targetUrl using the command verb provided (normally
     *     TP.HTTP_POST or TP.HTTP_PUT).
     * @param {String} httpVerb TP.HTTP_POST, TP.HTTP_PUT, etc.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @exception TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     */

    var request,
        headers,
        httpObj;

    request = TP.ifInvalid(aRequest, TP.request());
    request.atPut('uri', targetUrl);
    request.atPut('verb', httpVerb);

    if (TP.isEmpty(targetUrl)) {
        return TP.httpError(targetUrl, 'TP.sig.InvalidURI',
                            request);
    }

    // Ensure headers are converted to a hash
    headers = TP.hc(request.at('headers'));
    request.atPut('headers', headers);

    try {
        httpObj = TP.httpCall(targetUrl, request);
    } catch (e) {
        request.atPut('object', e);
        request.atPut('message', TP.str(e));

        return TP.httpError(
                    targetUrl,
                    TP.ifKeyInvalid(request,
                                    'exceptionType',
                                    'HTTPException'),
                    request);
    }

    return httpObj;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
