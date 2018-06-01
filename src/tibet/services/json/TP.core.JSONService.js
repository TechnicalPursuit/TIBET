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
 * @type {TP.core.JSONService}
 * @summary A subtype of TP.core.Service that communicates with JSON data
 *     services.
 * @example If the TP.sig.JSONRequest/TP.sig.JSONResponse processing model is
 *     used, it is unnecessary to manually set up a TP.core.JSONService. As part
 *     of the TIBET infrastructure of using request/response pairs, a 'default'
 *     instance of this service will be instantiated and registered to handle
 *     all TP.sig.JSONRequests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'JSONService'.
 *
 *     It is possible, however, to manually set up a server. To do so, execute
 *     the following:
 *
 *     myJSONService = TP.core.JSONService.construct('jsonService');
 *
 *     You will then need to register your service instance so that it services
 *     TP.sig.JSONRequests (otherwise, the TIBET machinery will instantiate the
 *     'default' instance of TP.core.JSONService as described above and register
 *     it to service these kinds of requests):
 *
 *     myJSONService.register();
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('JSONService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.JSONService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.JSONRequest')));

//  JSONP is async-only so configure for that
TP.core.JSONService.Type.defineAttribute('supportedModes',
                                        TP.core.SyncAsync.ASYNCHRONOUS);
TP.core.JSONService.Type.defineAttribute('mode',
                                        TP.core.SyncAsync.ASYNCHRONOUS);

TP.core.JSONService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.JSONService.Inst.defineHandler('JSONRequest',
function(aRequest) {

    /**
     * @method handleJSONRequest
     * @summary Handles when an TP.sig.JSONRequest is fired. Since this service
     *     will register itself as the default handler for these kinds of
     *     requests, the default instance of it will usually handle all of these
     *     kinds of requests.
     * @param {TP.sig.JSONRequest} aRequest The TP.sig.JSONRequest request
     *     object to take the request parameters from.
     * @returns {TP.core.JSONService} The receiver.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidRequest
     */

    var request,
        callbackFunc,
        url,
        path,
        wasJSONP,
        params,
        response;

    if (!TP.isKindOf(aRequest, 'TP.sig.JSONRequest')) {
        this.raise('TP.sig.InvalidRequest');
        return this;
    }

    request = TP.request(aRequest);

    //  Make sure that we have a real URI
    url = TP.uc(request.at('uri'));

    //  if we don't have a viable URL, we must fail the request.
    if (TP.notValid(url)) {
        request.fail('TP.sig.InvalidURI');
        return this;
    }

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.

    //  NB: The JSONP service is only capable of asynchronous processing.
    request.atPut('async', this.rewriteRequestMode(request));

    path = TP.join(url.get('scheme'), '://',
                    url.get('domain'),
                    url.get('path'), '/',
                    url.get('entity'));

    if (/jsonp:/.test(path)) {
        wasJSONP = true;

        //  Replace the 'jsonp:' part of the URL with either 'http:' or
        //  'https:', depending on whether we're configured to 'use SSL'.
        if (TP.isTrue(url.get('useSSL'))) {
            path = path.replace('jsonp:', 'https:');
        } else {
            path = path.replace('jsonp:', 'http:');
        }
    }

    if (TP.notEmpty(params = request.at('uriparams'))) {
        //  when using x-www-form-urlencoded the return value is the
        //  "query" portion which needs to be added to the URI before
        //  sending
        params = TP.httpEncode(params, TP.URL_ENCODED);
        if (TP.notEmpty(params)) {
            path = TP.uriJoinQuery(path, params);
        }
    }

    request.atPut('finaluri', path);

    response = request.getResponse();

    //  Might be null - we check below
    callbackFunc = request.at('callbackFunc');

    //  If a 'jsonp:' scheme was used, the URL has already been converted to
    //  say 'http:' as the scheme, but we need to use the JSONP transport
    //  mechanism.
    if (wasJSONP) {
        //  Go ahead and make the real call and set the result in our
        //  request to the data returned.
        TP.jsonpCall(
            path,
            function(resultData) {

                var dat;

                //  presumably we should get viable data...if we don't (or
                //  we get a String that matches TP.regex.JSON_ERRMSG)
                //  consider that to be a failure.
                /* eslint-disable no-extra-parens */
                if (TP.notValid(resultData) ||
                    (TP.isString(resultData) &&
                        TP.regex.JSON_ERRMSG.test(resultData))) {
                /* eslint-enable no-extra-parens */

                    //  Set the 'comm object' of the url to be a plain Object
                    //  (to emulate an XHR). The caller can extract information
                    //  such as status codes, text, etc. from it.
                    url.set(
                        'commObject',
                        {
                            response: null,
                            responseText: null,
                            responseType: '',   //  default value
                            responseXML: null,
                            status: 500,
                            statusText: '500 ' + resultData
                        });

                    response.setSignalName('TP.sig.IOFailed');
                    response.fire();

                    response.setSignalName('TP.sig.IOCompleted');
                    response.fire();

                    request.set('result', null);

                    url.$setPrimaryResource(undefined, request);
                    url.isLoaded(false);

                    //  Note passing the second 'true' here to signal change of
                    //  the 'dirty' flag.
                    url.isDirty(true, true);

                    request.fail(resultData);
                } else {

                    //  Set the 'comm object' of the url to be a plain Object
                    //  (to emulate an XHR). The caller can extract information
                    //  such as status codes, text, etc. from it.
                    url.set(
                        'commObject',
                        {
                            response: resultData,
                            responseText: resultData,
                            responseType: 'json',
                            responseXML: null,
                            status: 200,
                            statusText: '200 OK'
                        });

                    response.setSignalName('TP.sig.IOSucceeded');
                    response.fire();

                    response.setSignalName('TP.sig.IOCompleted');
                    response.fire();

                    request.set('result', resultData);

                    dat = url.getRequestedResource(request);
                    /*
                    url.$setPrimaryResource(dat, request);
                    */
                    url.isLoaded(true);

                    //  Note passing the second 'true' here to signal change of
                    //  the 'dirty' flag.
                    url.isDirty(false, true);

                    request.complete(dat);
                }

                if (TP.isCallable(callbackFunc)) {
                    callbackFunc(resultData);
                }
            },
            request.at('callbackFuncName'),
            request.at('callbackParamName'));
    } else {
        //  Otherwise, we're fetching JSON over HTTP

        //  'uri' and 'finaluri' got set above
        //  'method' defaults to TP.HTTP_GET
        //  'body' and 'finalbody' are not set

        //  We default 'async' to true
        request.atPutIfAbsent('async', true);

        request.defineHandler(
            'IOSucceeded',
            function(aSignal) {

                var result,
                    req,

                    xhr,
                    xhrStr;

                result = TP.sc('Succeeded but no data.');

                req = aSignal.getPayload();

                if (TP.isXHR(xhr = req.at('commObj')) &&
                    TP.notEmpty(xhrStr = TP.str(xhr))) {
                    result = TP.json2js(xhrStr);
                }

                //  Set the 'comm object' of the url to be the XHR. The caller
                //  can extract information such as status codes, text, etc.
                //  from it.
                url.set('commObject', xhr);

                if (TP.isCallable(callbackFunc)) {
                    callbackFunc(result);
                }

                this.complete(result);
            });

        request.defineHandler(
            'IOFailed',
            function(aSignal) {

                var result,
                    req,

                    xhr,
                    xhrStr;

                result = TP.sc('Failed with no message.');

                req = aSignal.getPayload();

                if (TP.isXHR(xhr = req.at('commObj')) &&
                    TP.notEmpty(xhrStr = TP.str(xhr))) {
                    result = TP.sc('Failure: ') + xhrStr;
                }

                //  Set the 'comm object' of the url to be the XHR. The caller
                //  can extract information such as status codes, text, etc.
                //  from it.
                url.set('commObject', xhr);

                if (TP.isCallable(callbackFunc)) {
                    callbackFunc(result);
                }

                this.fail(result);
            });

        TP.httpCall(path, aRequest);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
