//  ========================================================================
/*
NAME:   TP.core.WebDAVService.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.core.WebDAVService}
 * @synopsis A subtype of TP.core.HTTPService that communicates with
 *     WebDAV-capable servers.
 * @example If the TP.core.WebDAVRequest/TP.core.WebDAVResponse processing model
 *     is used, it is unnecessary to manually set up an TP.core.WebDAVService.
 *     As part of the TIBET infrastructure of using request/response pairs, a
 *     'default' instance of this service will be instantiated and registered to
 *     handle all TP.core.WebDAVRequests.
 *     
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'TP.core.WebDAVServiceDefault'. It should have a
 *     vCard entry in the currently executing project (with an 'FN' of
 *     'TP.core.WebDAVServiceDefault'). If this vCard cannot be found, the user
 *     will be prompted to enter the information about the default server. If
 *     only part of the information is found the user can be prompted to enter
 *     the missing information.
 *     
 *     It is possible, however, to manually set up a server. To do so, supply
 *     the 'uri' and 'iswebdav' parameters to the service as a set of connection
 *     parameters:
 *     
 *     webdavService = TP.core.WebDAVService.construct( 'WebDAVTestServer',
 *     TP.hc('uri', 'http://demo.sabredav.org/', 'iswebdav', true));
 *     
 *     Or have a vCard entry where the 'FN' entry matches the resource ID that
 *     is passed to the 'construct' call as detailed here:
 *     
 *     E.g.
 *     
 *     Parameter vCard entry ----------- ----------- resourceID
 *     <FN>WebDAVTestServer</FN> uri <URI>http://demo.sabredav.org/<URI>
 *     iswebdav <X-IS-WEBDAV>true</X-IS-WEBDAV>
 *     
 *     and then construct it using:
 *     
 *     webdavService = TP.core.WebDAVService.construct( 'WebDAVTestServer');
 *     
 *     If these parameters aren't supplied in either the 'construct' call or in
 *     the vCard, the user can be prompted to supply them at runtime by
 *     specifying the placeholder value '{USER}' in the vCard entry:
 *     
 *     uri <URI>{USER}<URI>
 *     
 *     Note that the 'iswebdav' parameter is OR'ed against the system-wide
 *     'config' variable, 'http.use_webdav', before an HTTP call is issued.
 *     Since this config variable is usually defaulted to true this parameter
 *     isn't normally necessary.
 *     
 *     You will then need to register your service instance so that it services
 *     TP.core.WebDAVRequests (otherwise, the TIBET machinery will instantiate
 *     the 'default' instance of TP.core.WebDAVService as described above and
 *     register it to service these kinds of requests):
 *     
 *     webdavService.register();
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.HTTPService.defineSubtype('WebDAVService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.WebDAVService.Type.defineAttribute('triggerSignals',
                                        'TP.sig.WebDAVRequest');

TP.core.WebDAVService.register();

//  for ease-of-querying WebDAV XML results, we register the canonical
//  WebDAV namespace information with the XMLNS type. We use the
//  canonical form in the WebDAV queries we make in the WebDAV
//  primitives.
TP.w3.Xmlns.registerNSInfo('DAV:', TP.hc('prefix', 'D'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.WebDAVService.Inst.defineMethod('performHTTPCall',
function(aRequest) {

    /**
     * @name performHTTPCall
     * @synopsis Performs the HTTP call. This is the method that actually does
     *     the work and can be overridden in subtypes of this type that have
     *     special types of HTTP calling semantics.
     * @param {TP.core.WebDAVRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @raises TP.sig.InvalidURI
     * @returns {TP.core.WebDAVRequest} The supplied request.
     */

    var url,
        httpObj,

        headers;

    //  rewriting sometimes still fails to produce a viable url. when that
    //  happens the rewrite call will have signaled the error so we just
    //  fail the request.
    url = aRequest.at('uri');
    if (TP.notValid(url)) {
        return aRequest.fail(TP.FAILURE, 'TP.sig.InvalidURI');
    }

    try {
        //  TP.$httpWrapup() processing will call back to the request via
        //  handleIO* based on success/failure and the rest is handled
        //  there...see the request type's handleIO* methods for more

        //  WebDAV requires a 'Content-Type' of TP.XML_ENCODED. Make sure
        //  that happens here, because sometimes we're calling regular
        //  TP.http* primitives, not our special TP.webdav* primitives.

        headers = TP.ifKeyInvalid(aRequest, 'headers', TP.hc());
        aRequest.atPut('headers', headers);

        headers.atPut('Content-Type', TP.XML_ENCODED);

        //  Switch based on the request's action.

        switch (aRequest.at('action')) {
            //  Reading, writing, deleting, moving and copying

            case    'read':

                httpObj = TP.httpGet(url, aRequest);

            break;

            case    'write':

                httpObj = TP.httpPut(url, aRequest);

            break;

            case    'remove':

                httpObj = TP.httpDelete(url, aRequest);

            break;

            case    'copy':

                httpObj = TP.webdavCopy(url, aRequest);

            break;

            case    'move':

                httpObj = TP.webdavMove(url, aRequest);

            break;

            //      Collection management

            case    'makecoll':

                httpObj = TP.webdavMkCol(url, aRequest);

            break;

            case    'listcoll':

                httpObj = TP.webdavPropFind(url, aRequest);

            break;

            //      Property management

            case    'getprop':

                httpObj = TP.webdavGetProperty(url, aRequest);

            break;

            case    'getprops':

                httpObj = TP.webdavGetAllProperties(url, aRequest);

            break;

            case    'setprops':

                httpObj = TP.webdavPropPatch(url, aRequest);

            break;

            case    'setprop':

                httpObj = TP.webdavSetProperty(url, aRequest);

            break;

            case    'deleteprops':

                httpObj = TP.webdavPropPatch(url, aRequest);

            break;

            //      Lock management

            case    'lock':

                httpObj = TP.webdavLock(url, aRequest);

            break;

            case    'unlock':

                httpObj = TP.webdavUnlock(url, aRequest);

            break;

            default:

                aRequest.fail(TP.FAILURE, 'Unrecognized action');

            break;
        }
    } catch (e) {
        aRequest.atPut('object', e);
        aRequest.atPut('message', TP.str(e));

        return TP.httpError(
                    url,
                    TP.ifKeyInvalid('request', 'exceptionType',
                        'WebDAVException'),
                    arguments,
                    aRequest);
    }

    return aRequest;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
