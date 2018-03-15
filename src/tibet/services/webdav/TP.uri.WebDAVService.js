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
 * @type {TP.uri.WebDAVService}
 * @summary A subtype of TP.uri.HTTPService that communicates with
 *     WebDAV-capable servers.
 * @example If the TP.core.WebDAVRequest/TP.core.WebDAVResponse processing model
 *     is used, it is unnecessary to manually set up an TP.uri.WebDAVService.
 *     As part of the TIBET infrastructure of using request/response pairs, a
 *     'default' instance of this service will be instantiated and registered to
 *     handle all TP.core.WebDAVRequests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'WebDAVService'. It should have a
 *     vcard entry in the currently executing project (with an '<fn>' of
 *     'WebDAVService'). If this vcard cannot be found, the user will be
 *     prompted to enter the information about the default server. If only part
 *     of the information is found the user can be prompted to enter the missing
 *     information.
 *
 *     It is possible, however, to manually set up a server. To do so, supply
 *     the 'uri' and 'iswebdav' parameters to the service as a set of connection
 *     parameters:
 *
 *     webdavService = TP.uri.WebDAVService.construct(
 *                          'WebDAVTestServer',
 *                          TP.hc('uri', 'http://demo.sabredav.org/',
 *                                  'iswebdav', true));
 *
 *     Or have a vcard entry where the '<fn>' entry matches the resource ID that
 *     is passed to the 'construct' call as detailed here:
 *
 *     E.g.
 *
 *     <vcard xmlns="urn:ietf:params:xml:ns:vcard-4.0"
 *              xmlns:vcard-ext="http://www.technicalpursuit.com/vcard-ext">
 *         <fn><text>WebDAVTestServer</text></fn>
 *         <note><text>The WebDAV test Service</text></note>
 *         <url><uri>http://demo.sabredav.org/</uri><url>
 *         <vcard-ext:x-is-webdav>true</vcard-ext:x-is-webdav>
 *     </vcard>
 *
 *     and then construct it using:
 *
 *     webdavService = TP.uri.WebDAVService.construct('WebDAVTestServer');
 *
 *     If these parameters aren't supplied in either the 'construct' call or in
 *     the vcard, the user can be prompted to supply them at runtime by
 *     specifying the placeholder value '{USER}' in the vcard entry:
 *
 *     <url><uri>{USER}<uri></url>
 *
 *     Note that the 'iswebdav' parameter is OR'ed against the system-wide
 *     'config' variable, 'http.use_webdav', before an HTTP call is issued.
 *     Since this config variable is usually defaulted to true this parameter
 *     isn't normally necessary.
 *
 *     You will then need to register your service instance so that it services
 *     TP.core.WebDAVRequests (otherwise, the TIBET machinery will instantiate
 *     the 'default' instance of TP.uri.WebDAVService as described above and
 *     register it to service these kinds of requests):
 *
 *     webdavService.register();
 */

//  ------------------------------------------------------------------------

TP.uri.HTTPService.defineSubtype('WebDAVService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.uri.WebDAVService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.WebDAVRequest')));

TP.uri.WebDAVService.register();

//  for ease-of-querying WebDAV XML results, we register the canonical
//  WebDAV namespace information with the XMLNS type. We use the
//  canonical form in the WebDAV queries we make in the WebDAV
//  primitives.
TP.w3.Xmlns.registerNSInfo('DAV:', TP.hc('prefix', 'D'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.WebDAVService.Inst.defineMethod('performHTTPCall',
function(aRequest) {

    /**
     * @method performHTTPCall
     * @summary Performs the HTTP call. This is the method that actually does
     *     the work and can be overridden in subtypes of this type that have
     *     special types of HTTP calling semantics.
     * @param {TP.core.WebDAVRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @exception TP.sig.InvalidURI
     * @returns {TP.core.WebDAVRequest} The supplied request.
     */

    var url,

        headers;

    //  rewriting sometimes still fails to produce a viable url. when that
    //  happens the rewrite call will have signaled the error so we just
    //  fail the request.
    url = aRequest.at('uri');
    if (TP.notValid(url)) {
        return aRequest.fail('TP.sig.InvalidURI');
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

            case 'read':

                TP.httpGet(url, aRequest);

                break;

            case 'write':

                TP.httpPut(url, aRequest);

                break;

            case 'remove':

                TP.httpDelete(url, aRequest);

                break;

            case 'copy':

                TP.webdavCopy(url, aRequest);

                break;

            case 'move':

                TP.webdavMove(url, aRequest);

                break;

            //      Collection management

            case 'makecoll':

                TP.webdavMkCol(url, aRequest);

                break;

            case 'listcoll':

                TP.webdavPropFind(url, aRequest);

                break;

            //      Property management

            case 'getprop':

                TP.webdavGetProperty(url, aRequest);

                break;

            case 'getprops':

                TP.webdavGetAllProperties(url, aRequest);

                break;

            case 'setprops':

                TP.webdavPropPatch(url, aRequest);

                break;

            case 'setprop':

                TP.webdavSetProperty(url, aRequest);

                break;

            case 'deleteprops':

                TP.webdavPropPatch(url, aRequest);

                break;

            //      Lock management

            case 'lock':

                TP.webdavLock(url, aRequest);

                break;

            case 'unlock':

                TP.webdavUnlock(url, aRequest);

                break;

            default:

                aRequest.fail('Unrecognized action');

                break;
        }
    } catch (e) {
        aRequest.atPut('object', e);
        aRequest.atPut('message', TP.str(e));

        return TP.httpError(
                    url,
                    TP.ifKeyInvalid('request', 'exceptionType',
                        'WebDAVException'),
                    aRequest);
    }

    return aRequest;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
