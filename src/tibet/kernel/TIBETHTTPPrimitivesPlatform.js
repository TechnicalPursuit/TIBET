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
 * Platform-specific HTTP method support via XMLHttpRequest.
 * @description Note how we do *not* wrap ANY of the debugging messages below
 *     into TP.sc() calls, because when localization occurs, and we've booted
 *     over an HTTP-based URL, it tries to use this routine to do the
 *     localization, which causes major recursion problems.
 */

/* global Components:false
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('$httpObtainSecurityInfo',
TP.hc(
    'test',
    'gecko',
    'true',
    function(httpObj) {

        /**
         * @method $httpObtainSecurityInfo
         * @summary Obtains Gecko-specific security information from the
         *     supplied httpObj's channel, if it has one.
         * @param {XHR} httpObj The XMLHttpRequest object containing the channel
         *     to retrieve security information from.
         * @returns {String} The security information contained in the channel
         *     of the supplied XHR object.
         */

        var successfulExec,
            retMsg;

        retMsg = TP.ac();

        /* eslint-disable new-cap */
        successfulExec = TP.executePrivileged(
            TP.ACCESS_XDOMAIN_XMLHTTP,
            'This TIBET-based application would like to read XMLHttpRequest security information',
            'This TIBET-based application cannot read XMLHttpRequest security information',
            false,      //  don't bother trying to do this without privileges
            function() {

                var channel,
                    compInf,

                    securityInfo,

                    cert,
                    verificationResult,

                    validity;

                try {
                    channel = httpObj.channel;
                    compInf = Components.interfaces;

                    if (!(channel instanceof compInf.nsIChannel)) {
                        //  No channel available.
                        return;
                    }

                    securityInfo = channel.securityInfo;

                    if (securityInfo instanceof
                                    compInf.nsITransportSecurityInfo) {
                        securityInfo.QueryInterface(
                                compInf.nsITransportSecurityInfo);

                        retMsg.push('Security state: ');

                        //  Check security state flags
                        if ((securityInfo.securityState &
                            compInf.nsIWebProgressListener.STATE_IS_SECURE) ===
                        compInf.nsIWebProgressListener.STATE_IS_SECURE) {
                            retMsg.push('secure\n');
                        } else if ((securityInfo.securityState &
                            compInf.nsIWebProgressListener.STATE_IS_INSECURE) ===
                        compInf.nsIWebProgressListener.STATE_IS_INSECURE) {
                            retMsg.push('insecure\n');
                        } else if ((securityInfo.securityState &
                            compInf.nsIWebProgressListener.STATE_IS_BROKEN) ===
                        compInf.nsIWebProgressListener.STATE_IS_BROKEN) {
                            retMsg.push('unknown\n');
                        }

                        retMsg.push('\tSecurity description: ',
                                    securityInfo.shortSecurityDescription,
                                    '\n');
                        retMsg.push('\tSecurity error message: ',
                                    securityInfo.errorMessage,
                                    '\n');
                    } else {
                        retMsg.push(
                            '\tNo security info available for this channel\n');
                    }

                    //  Print SSL certificate details
                    if (securityInfo instanceof compInf.nsISSLStatusProvider) {
                        cert = securityInfo.QueryInterface(
                        compInf.nsISSLStatusProvider).SSLStatus.QueryInterface(
                            compInf.nsISSLStatus).serverCert;
                        retMsg.push('\nCertificate Status:\n');

                        verificationResult = cert.verifyForUsage(
                                    compInf.nsIX509Cert.CERT_USAGE_SSLServer);
                        retMsg.push('\tVerification: ');

                        switch (verificationResult) {
                            case compInf.nsIX509Cert.VERIFIED_OK:

                                retMsg.push('OK');
                                break;

                            case compInf.nsIX509Cert.NOT_VERIFIED_UNKNOWN:

                                retMsg.push('not verfied/unknown');
                                break;

                            case compInf.nsIX509Cert.CERT_REVOKED:

                                retMsg.push('revoked');
                                break;

                            case compInf.nsIX509Cert.CERT_EXPIRED:

                                retMsg.push('expired');
                                break;

                            case compInf.nsIX509Cert.CERT_NOT_TRUSTED:

                                retMsg.push('not trusted');
                                break;

                            case compInf.nsIX509Cert.ISSUER_NOT_TRUSTED:

                                retMsg.push('issuer not trusted');
                                break;

                            case compInf.nsIX509Cert.ISSUER_UNKNOWN:

                                retMsg.push('issuer unknown');
                                break;

                            case compInf.nsIX509Cert.INVALID_CA:

                                retMsg.push('invalid CA');
                                break;

                            default:

                                retMsg.push('unexpected failure');
                                break;
                        }

                        retMsg.push('\n');

                        retMsg.push('\tCommon name (CN) = ',
                                    cert.commonName, '\n');
                        retMsg.push('\tOrganisation = ',
                                    cert.organization, '\n');
                        retMsg.push('\tIssuer = ',
                                    cert.issuerOrganization, '\n');
                        retMsg.push('\tSHA1 fingerprint = ',
                                    cert.sha1Fingerprint, '\n');

                        validity = cert.validity.QueryInterface(
                                            compInf.nsIX509CertValidity);
                        retMsg.push('\tValid from ',
                                    validity.notBeforeGMT, '\n');
                        retMsg.push('\tValid until ',
                                    validity.notAfterGMT, '\n');
                    }
                } catch (e) {
                    retMsg.push(TP.str(e));
                }
            });
            /* eslint-enable new-cap */

        if (successfulExec) {
            return retMsg.join('');
        }

        return null;
    },
    TP.DEFAULT,
    function(httpObj) {

        //  NB: Other browsers don't need this call - just return.
        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('httpCall',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(targetUrl, aRequest) {

        /**
         * @method httpCall
         * @summary Performs an XMLHttpRequest based on the information
         *     provided in aRequest. NOTE that the request object is updated
         *     with a number of keys which define the actual data used for the
         *     current HTTP call.
         * @param {String} targetUrl The request's target URL.
         * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
         *     additional parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeException
         * @exception TP.sig.HTTPException
         * @exception TP.sig.HTTPHeaderException
         * @exception TP.sig.HTTPSendException
         * @throws Error Various HTTP-related errors.
         * @returns {TP.sig.Response} The response object for the request used.
         */

        var request,
            url,
            query,

            method,
            async,

            content,
            contentString,

            httpObj,

            username,
            password,

            job,
            estr;

        //  ensure we've got a default request object to avoid problems
        //  below
        request = TP.request(aRequest);

        //  with request mapping ensured we can now test for viable target
        //  URI
        url = targetUrl || request.at('uri');
        if (TP.isEmpty(url)) {
            TP.httpError(targetUrl, 'TP.sig.InvalidURI', request);
            return;
        }

        if (!TP.isURIString(url)) {
            TP.httpError(url, 'TP.sig.InvalidParameter', request);
            return;
        }

        //  expand the url as needed using any query data in the request.
        //  NOTE that we do this for all request types, so any URL can be
        //  augmented by adding a query string or query hash to the request
        //  without actually altering the original URI. ALSO NOTE that we do
        //  NOT rewrite here, that must be done in higher-level methods so
        //  this call can be certain of what's being requested
        url = url.getLocation();
        request.addIfAbsent('uri', url);

        if (TP.notEmpty(query = request.at('uriparams'))) {
            //  when using x-www-form-urlencoded the return value is the
            //  "query" portion which needs to be added to the URI before
            //  sending
            query = TP.httpEncode(query, TP.URL_ENCODED);
            if (TP.notEmpty(query)) {
                url = TP.uriJoinQuery(url, query);
            }
        }
        request.atPut('finaluri', url);

        //  TODO: if nocache is true we want to add a unique ID to the
        //  query/url

        request.addIfAbsent('method', TP.HTTP_GET);
        method = request.at('method');

        request.addIfAbsent('async', true);
        async = request.at('async');

        //  we want to send the string representation whenever there's data
        content = request.at('body');
        if (TP.isValid(content)) {
            contentString = TP.httpEncodeRequestBody(request);
            request.atPut('finalbody', contentString);
            if (TP.isNode(content)) {
                request.atIfInvalid('bodyWantsXMLDeclaration', false);
            }
        }

        //  set up the actual request
        try {
            httpObj = TP.httpConstruct(url);
            request.atPut('commObj', httpObj);

            //  NOTE: As of Chrome 19+, etc. using the username/password fields
            //  of the 'open()' method below is unsupported because that will
            //  result in a 'URL embedded entity' (i.e.
            //  'username:password@foo.com'). We can't get rid of these request
            //  parameters, because they're used by things like the 'basic auth'
            //  header generator, but we don't extract them here
            //  username = request.at('username');
            //  password = request.at('password');

            //  if either username or password use our special value, TP.NONE,
            //  set them to null so that the word 'none' isn't used and so that
            //  we are XHR spec compliant
            if (request.at('username') === TP.NONE) {
                username = null;
            }

            if (request.at('password') === TP.NONE) {
                password = null;
            }

            httpObj.open(method, url, async, username, password);
        } catch (e) {
            request.atPut('object', e);
            request.atPut('message', TP.str(e));

            TP.httpError(targetUrl, 'HTTPException', request);
            return;
        }

        if (TP.isValid(request.at('withCredentials')) &&
            'withCredentials' in httpObj) {
            httpObj.withCredentials = request.at('withCredentials');
        }

        //  configure headers based on URI and header collection
        try {
            TP.httpSetHeaders(url, request, httpObj);
        } catch (e) {
            request.atPut('object', e);
            request.atPut('message', TP.str(e));

            TP.httpError(targetUrl, 'HTTPHeaderException', request);
            return;
        }

        //  We've assembled all of the information we need to see if a 'simple
        //  CORS' request is doable. If the caller has specified 'simple CORS'
        //  then we should check it and return if it's not doable. Note that the
        //  method we call here will log warnings with more information.
        if (TP.sys.cfg('http.simple_cors_only') ||
            request.at('simple_cors_only')) {
            if (!TP.httpRequestPassesSimpleCORSRestrictions(request)) {
                return;
            }
        }

        //  configure for async processing as needed
        if (async) {
            //  going to be async? then we'll want a timeout option
            //  via a job
            job = TP.schedule(
                TP.hc('step',
                        function() {

                            TP.$httpTimeout(targetUrl, request,
                                            httpObj);

                            return true;
                        },
                        'delay',
                            TP.ifInvalid(
                                    request.at('timeout'),
                                    TP.sys.cfg('http.timeout'))));

            //  creating a closure lets us manage the timeout job,
            //  handle logging of the request data, and process the
            //  results easier
            httpObj.onreadystatechange = function() {

                //  the only state we bother with is "complete"
                if (httpObj.readyState !== 4) {
                    return;
                }

                //  close out the timeout job silently
                job.kill(true);

                request.atPut('direction',
                                TP.RECV);
                request.atPut('message',
                                'HTTP request completed.');

                TP.ifInfo() && TP.sys.shouldLogIO() ?
                    TP.sys.logIO(request, TP.INFO) :
                    0;

                TP.$httpWrapup(targetUrl, request, httpObj);
            };
        }

        //  isolate the actual send call for finer-grained error
        //  handling
        try {
            request.atPut('direction', TP.SEND);
            request.atPut('message', 'HTTP request initiated.');

            TP.ifInfo() && TP.sys.shouldLogIO() ?
                TP.sys.logIO(request, TP.INFO) : 0;

            //  NB: We have to "'' +" the content string here to
            //  get a primitive string - for some reason, Gecko
            //  doesn't like to send 'String Objects'. But we only
            //  do this if contentString is valid.
            if (TP.isString(contentString)) {
                contentString = '' + contentString;
            }

            try {
                //  the actual send
                httpObj.send(contentString);
            } catch (e2) {

                estr = TP.tostr(e2);
                if (TP.isString(estr) && /0x80004005/.test(estr)) {
                    if (TP.uriNeedsPrivileges(targetUrl)) {
                        //  Probably a CORS request that failed
                        estr = 'The URL needs privileges and' +
                                    ' couldn\'t obtain them. Bad' +
                                    ' CORS request?';
                    } else if (httpObj.status === 0 &&
                        TP.isEmpty(estr =
                                    TP.$httpObtainSecurityInfo(
                                        httpObj))) {
                        //  domain probably missing but no valid status
                        //  comes back
                        estr = 'XHR status is 0 and there' +
                                    ' was no security info.' +
                                    ' URL missing domain or bad' +
                                    ' certificate?';
                    }

                    TP.ifWarn() ? TP.warn(estr) : 0;
                } else {
                    //  throw so the outer catch block can handle it
                    throw e2;
                }
            }

            //  if we're not relying on the asynch handler to log we
            //  do it here
            if (TP.notTrue(async)) {
                request.atPut('direction', TP.RECV);
                request.atPut('message', 'HTTP request completed.');

                TP.ifInfo() && TP.sys.shouldLogIO() ?
                    TP.sys.logIO(request, TP.INFO) : 0;

                TP.$httpWrapup(targetUrl, request, httpObj);
            }
        } catch (e) {
            if (TP.isValid(job)) {
                //  close out the timeout job silently
                job.kill(true);
            }

            request.atPut('direction', TP.RECV);
            request.atPut('object', e);
            request.atPut('message', 'HTTP request failed: ' +
                                        TP.str(e));

            TP.httpError(targetUrl, 'HTTPSendException', request);
            return;
        }

        //  NOTE:   appears to be a Moz bug here when the connection
        //          is refused, the httpObj goes away and no
        //          exception is thrown.
        if (TP.notValid(httpObj)) {
            request.atPut('message',
                            'The server may have refused the ' +
                                    'connection. Is the URI a valid ' +
                                    'target?');

            TP.httpError(targetUrl, 'HTTPException', request);
            return;
        }

        return request.getResponse();
    },
    'trident',
    function(targetUrl, aRequest) {

        /**
         * @method httpCall
         * @summary Performs an XMLHttpRequest based on the information
         *     provided in aRequest. NOTE that the request object is updated
         *     with a number of keys which define the actual data used for the
         *     current HTTP call.
         * @param {String} targetUrl The request's target URL.
         * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
         *     additional parameters.
         * @throws Error Various HTTP-related errors.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeException
         * @exception TP.sig.HTTPException
         * @exception TP.sig.HTTPHeaderException
         * @exception TP.sig.HTTPSendException
         * @returns {TP.sig.Response} The response object for the request used.
         */

        var request,
            url,
            query,

            method,
            async,

            content,
            contentString,

            username,
            password,

            httpObj,
            job;

        //  ensure we've got a default request object to avoid problems
        //  below
        request = TP.request(aRequest);

        //  with request mapping ensured we can now test for viable target
        //  URI
        url = targetUrl || request.at('uri');
        if (TP.isEmpty(url)) {
            TP.httpError(targetUrl, 'TP.sig.InvalidURI', request);
            return;
        }

        if (!TP.isURIString(url)) {
            TP.httpError(url, 'TP.sig.InvalidParameter', request);
            return;
        }

        //  expand the url as needed using any query data in the request.
        //  NOTE that we do this for all request types, so any URL can be
        //  augmented by adding a query string or query hash to the request
        //  without actually altering the original URI. ALSO NOTE that we do
        //  NOT rewrite here, that must be done in higher-level methods so
        //  this call can be certain of what's being requested
        url = url.getLocation();
        request.addIfAbsent('uri', url);

        if (TP.notEmpty(query = request.at('uriparams'))) {
            //  when using x-www-form-urlencoded the return value is the
            //  "query" portion which needs to be added to the URI before
            //  sending
            query = TP.httpEncode(query, TP.URL_ENCODED);
            if (TP.notEmpty(query)) {
                url = TP.uriJoinQuery(url, query);
            }
        }
        request.atPut('finaluri', url);

        //  TODO: if nocache is true we want to add a unique ID to the
        //  query/url

        request.addIfAbsent('method', TP.HTTP_GET);
        method = request.at('method');

        request.addIfAbsent('async', true);
        async = request.at('async');

        //  we want to send the string representation whenever there's data
        content = request.at('body');
        if (TP.isValid(content)) {
            contentString = TP.httpEncodeRequestBody(request);
            request.atPut('finalbody', contentString);
            if (TP.isNode(content)) {
                request.atIfInvalid('bodyWantsXMLDeclaration', false);
            }
        }

        //  set up the actual request
        try {
            httpObj = TP.httpConstruct(url);
            request.atPut('commObj', httpObj);

            //  NOTE: As of Chrome 19+, etc. using the username/password fields
            //  of the 'open()' method below is unsupported because that will
            //  result in a 'URL embedded entity' (i.e.
            //  'username:password@foo.com'). We can't get rid of these request
            //  parameters, because they're used by things like the 'basic auth'
            //  header generator, but we don't extract them here
            //  username = request.at('username');
            //  password = request.at('password');

            //  if either username or password use our special value, TP.NONE,
            //  set them to null so that the word 'none' isn't used and so that
            //  we are XHR spec compliant
            if (request.at('username') === TP.NONE) {
                username = null;
            }

            if (request.at('password') === TP.NONE) {
                password = null;
            }

            httpObj.open(method, url, async, username, password);
        } catch (e) {
            request.atPut('object', e);
            request.atPut('message', TP.str(e));

            TP.httpError(targetUrl, 'HTTPException', request);
            return;
        }

        if (TP.isValid(request.at('withCredentials')) &&
            'withCredentials' in httpObj) {
            httpObj.withCredentials = request.at('withCredentials');
        }

        //  configure headers based on URI and header collection
        try {
            TP.httpSetHeaders(url, request, httpObj);
        } catch (e) {
            request.atPut('object', e);
            request.atPut('message', TP.str(e));

            TP.httpError(targetUrl, 'HTTPHeaderException', request);
            return;
        }

        //  We've assembled all of the information we need to see if a 'simple
        //  CORS' request is doable. If the caller has specified 'simple CORS'
        //  then we should check it and return if it's not doable. Note that the
        //  method we call here will log warnings with more information.
        if (TP.sys.cfg('http.simple_cors_only') ||
            request.at('simple_cors_only')) {
            if (!TP.httpRequestPassesSimpleCORSRestrictions(request)) {
                return;
            }
        }

        //  configure for async processing as needed
        if (async) {
            //  going to be async? then we'll want a timeout option via a
            //  job
            job = TP.schedule(
                TP.hc('step',
                        function() {

                            TP.$httpTimeout(targetUrl,
                                            request,
                                            httpObj);

                            return true;
                        },
                        'delay', TP.ifInvalid(
                                            request.at('timeout'),
                                            TP.sys.cfg('http.timeout'))));

            //  creating a closure lets us manage the timeout job, handle
            //  logging of the request data, and process the results easier
            httpObj.onreadystatechange = function() {

                //  the only state we bother with is "complete"
                if (httpObj.readyState !== 4) {
                    return;
                }

                //  close out the timeout job silently
                job.kill(true);

                request.atPut('direction', TP.RECV);
                request.atPut('message', 'HTTP request completed.');

                TP.ifInfo() && TP.sys.shouldLogIO() ?
                    TP.sys.logIO(request, TP.INFO) : 0;

                TP.$httpWrapup(targetUrl, request, httpObj);
            };
        }

        //  isolate the actual send call for finer-grained error handling
        try {
            request.atPut('direction', TP.SEND);
            request.atPut('message', 'HTTP request initiated.');

            TP.ifInfo() && TP.sys.shouldLogIO() ?
                TP.sys.logIO(request, TP.INFO) : 0;

            //  NB: For Mozilla, we "'' +" the content string here to get a
            //  primitive string - here, we just do it for consistency with
            //  Mozilla. But we only do this if contentString is valid.
            if (TP.isString(contentString)) {
                contentString = '' + contentString;
            }

            try {
                //  the actual send
                httpObj.send(contentString);
            } catch (e2) {
                //  throw so the outer catch block can handle it
                throw e2;
            }

            //  if we're not relying on the asynch handler to log we do it
            //  here
            if (TP.notTrue(async)) {
                request.atPut('direction', TP.RECV);
                request.atPut('message', 'HTTP request completed.');

                TP.ifInfo() && TP.sys.shouldLogIO() ?
                        TP.sys.logIO(request, TP.INFO) : 0;

                TP.$httpWrapup(targetUrl, request, httpObj);
            }
        } catch (e) {
            if (TP.isValid(job)) {
                //  close out the timeout job silently
                job.kill(true);
            }

            request.atPut('direction', TP.RECV);
            request.atPut('object', e);
            request.atPut('message', 'HTTP request failed: ' + TP.str(e));

            TP.httpError(targetUrl, 'HTTPSendException', request);
            return;
        }

        return request.getResponse();
    },
    'webkit',
    function(targetUrl, aRequest) {

        /**
         * @method httpCall
         * @summary Performs an XMLHttpRequest based on the information
         *     provided in aRequest. NOTE that the request object is updated
         *     with a number of keys which define the actual data used for the
         *     current HTTP call.
         * @param {String} targetUrl The request's target URL.
         * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
         *     additional parameters.
         * @throws Error Various HTTP-related errors.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeException
         * @exception TP.sig.HTTPException
         * @exception TP.sig.HTTPHeaderException
         * @exception TP.sig.HTTPSendException
         * @returns {TP.sig.Response} The response object for the request used.
         */

        var request,
            url,
            query,

            method,
            async,

            content,
            contentString,

            username,
            password,

            httpObj,
            job;

        //  ensure we've got a default request object to avoid problems
        //  below
        request = TP.request(aRequest);

        //  with request mapping ensured we can now test for viable target
        //  URI
        url = targetUrl || request.at('uri');
        if (TP.isEmpty(url)) {
            TP.httpError(targetUrl, 'TP.sig.InvalidURI', request);
            return;
        }

        if (!TP.isURIString(url)) {
            TP.httpError(url, 'TP.sig.InvalidParameter', request);
            return;
        }

        //  On Webkit, if we launched over HTTP and do *not* have CORS support,
        //  we can *only* query against the domain we launched from. If we
        //  launched from the file system, we can (try to) query any URL.
        if (TP.sys.isHTTPBased() &&
            TP.uriNeedsPrivileges(targetUrl) &&
            !('withCredentials' in new XMLHttpRequest())) {

            request.atPut('message', 'Permission not available to ' +
                                        'make cross-domain HTTP call');

            TP.httpError(targetUrl, 'TP.sig.PrivilegeViolation', request);
            return;
        }

        //  expand the url as needed using any query data in the request.
        //  NOTE that we do this for all request types, so any URL can be
        //  augmented by adding a query string or query hash to the request
        //  without actually altering the original URI. ALSO NOTE that we do
        //  NOT rewrite here, that must be done in higher-level methods so
        //  this call can be certain of what's being requested
        url = url.getLocation();
        request.addIfAbsent('uri', url);

        if (TP.notEmpty(query = request.at('uriparams'))) {
            //  when using x-www-form-urlencoded the return value is the
            //  "query" portion which needs to be added to the URI before
            //  sending
            query = TP.httpEncode(query, TP.URL_ENCODED);
            if (TP.notEmpty(query)) {
                url = TP.uriJoinQuery(url, query);
            }
        }
        request.atPut('finaluri', url);

        //  TODO: if nocache is true we want to add a unique ID to the
        //  query/url

        request.addIfAbsent('method', TP.HTTP_GET);
        method = request.at('method');

        request.addIfAbsent('async', true);
        async = request.at('async');

        //  we want to send the string representation whenever there's data
        content = request.at('body');
        if (TP.isValid(content)) {
            contentString = TP.httpEncodeRequestBody(request);
            request.atPut('finalbody', contentString);
            if (TP.isNode(content)) {
                request.atIfInvalid('bodyWantsXMLDeclaration', false);
            }
        }

        //  set up the actual request
        try {
            httpObj = TP.httpConstruct(url);
            request.atPut('commObj', httpObj);

            //  NOTE: As of Chrome 19+, etc. using the username/password fields
            //  of the 'open()' method below is unsupported because that will
            //  result in a 'URL embedded entity' (i.e.
            //  'username:password@foo.com'). We can't get rid of these request
            //  parameters, because they're used by things like the 'basic auth'
            //  header generator, but we don't extract them here
            //  username = request.at('username');
            //  password = request.at('password');

            //  if either username or password use our special value, TP.NONE,
            //  set them to null so that the word 'none' isn't used and so that
            //  we are XHR spec compliant
            if (request.at('username') === TP.NONE) {
                username = null;
            }

            if (request.at('password') === TP.NONE) {
                password = null;
            }

            httpObj.open(method, url, async, username, password);
        } catch (e) {
            request.atPut('object', e);
            request.atPut('message', TP.str(e));

            TP.httpError(targetUrl, 'HTTPException', request);
            return;
        }

        if (TP.isValid(request.at('withCredentials')) &&
            'withCredentials' in httpObj) {
            httpObj.withCredentials = request.at('withCredentials');
        }

        //  configure headers based on URI and header collection
        try {
            TP.httpSetHeaders(url, request, httpObj);
        } catch (e) {
            request.atPut('object', e);
            request.atPut('message', TP.str(e));

            TP.httpError(targetUrl, 'HTTPHeaderException', request);
            return;
        }

        //  We've assembled all of the information we need to see if a 'simple
        //  CORS' request is doable. If the caller has specified 'simple CORS'
        //  then we should check it and return if it's not doable. Note that the
        //  method we call here will log warnings with more information.
        if (TP.sys.cfg('http.simple_cors_only') ||
            request.at('simple_cors_only')) {
            if (!TP.httpRequestPassesSimpleCORSRestrictions(request)) {
                return;
            }
        }

        //  configure for async processing as needed
        if (async) {
            //  going to be async? then we'll want a timeout option via a
            //  job
            job = TP.schedule(
                TP.hc('step',
                        function() {

                            TP.$httpTimeout(targetUrl,
                                            request,
                                            httpObj);

                            return true;
                        },
                        'delay', TP.ifInvalid(
                                            request.at('timeout'),
                                            TP.sys.cfg('http.timeout'))));

            //  creating a closure lets us manage the timeout job, handle
            //  logging of the request data, and process the results easier
            httpObj.onreadystatechange = function() {

                //  the only state we bother with is "complete"
                if (httpObj.readyState !== 4) {
                    return;
                }

                //  close out the timeout job silently
                job.kill(true);

                request.atPut('direction', TP.RECV);
                request.atPut('message', 'HTTP request completed.');

                TP.ifInfo() && TP.sys.shouldLogIO() ?
                    TP.sys.logIO(request, TP.INFO) : 0;

                TP.$httpWrapup(targetUrl, request, httpObj);
            };
        }

        //  isolate the actual send call for finer-grained error handling
        try {
            request.atPut('direction', TP.SEND);
            request.atPut('message', 'HTTP request initiated.');

            TP.ifInfo() && TP.sys.shouldLogIO() ?
                TP.sys.logIO(request, TP.INFO) : 0;

            //  NB: For Mozilla, we "'' +" the content string here to get a
            //  primitive string - here, we just do it for consistency with
            //  Mozilla. But we only do this if contentString is valid.
            if (TP.isString(contentString)) {
                contentString = '' + contentString;
            }

            //  the actual send
            httpObj.send(contentString);

            //  if we're not relying on the asynch handler to log we do it
            //  here
            if (TP.notTrue(async)) {
                request.atPut('direction', TP.RECV);
                request.atPut('message', 'HTTP request completed.');

                TP.ifInfo() && TP.sys.shouldLogIO() ?
                        TP.sys.logIO(request, TP.INFO) : 0;

                TP.$httpWrapup(targetUrl, request, httpObj);
            }
        } catch (e) {
            if (TP.isValid(job)) {
                //  close out the timeout job silently
                job.kill(true);
            }

            request.atPut('direction', TP.RECV);
            request.atPut('object', e);
            request.atPut('message', 'HTTP request failed: ' + TP.str(e));

            TP.httpError(targetUrl, 'HTTPSendException', request);
            return;
        }

        return request.getResponse();
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
