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
 * @type {TP.google.GoogleContactsService}
 * @summary A subtype of GoogleService that communicates with the Google-hosted
 *     Google Contacts server.
 * @example If the TP.google.GoogleContactsRequest / TP.sig.GoogleContactsResponse
 *     processing model is used, it is unnecessary to manually set up an
 *     TP.google.GoogleContactsService. As part of the TIBET infrastructure of
 *     using request/response pairs, a 'default' instance of this service will
 *     be instantiated and registered to handle all
 *     TP.google.GoogleContactsRequests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'TP.google.GoogleContactsServiceDefault'. It should
 *     have a vCard entry in the currently executing project (with an 'FN' of
 *     'TP.google.GoogleContactsServiceDefault'). If this vCard cannot be found,
 *     the user will be prompted to enter the information about the default
 *     server. If only part of the information is found the user can be prompted
 *     to enter the missing information.
 *
 *     It is possible, however, to manually set up a server. To do so, simply
 *     instantiate a server:
 *
 *     contactsService = TP.google.GoogleContactsService.construct(
 *     'GoogleContactsTestServer');
 *
 *     Or have a vCard entry where the 'FN' entry matches the resource ID that
 *     is passed to the 'construct' call as detailed here:
 *
 *     E.g.
 *
 *     Parameter vCard entry ----------- ----------- resourceID
 *     <FN>GoogleContactsTestServer</FN>
 *
 *     and then construct it using:
 *
 *     contactsService = TP.google.GoogleContactsService.construct(
 *     'GoogleContactsTestServer');
 *
 *     You will then need to register your service instance so that it services
 *     TP.google.GoogleContactsRequests (otherwise, the TIBET machinery will
 *     instantiate the 'default' instance of TP.google.GoogleContactsService as
 *     described above and register it to service these kinds of requests):
 *
 *     contactsService.register();
 */

//  ------------------------------------------------------------------------

TP.google.GoogleService.defineSubtype('GoogleContactsService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.google.GoogleContactsService.Type.defineAttribute(
                        'triggerSignals', 'TP.sig.GoogleContactsRequest');

//  We basically ignore serviceURI, auth and iswebdav for Contacts, but
//  we need to give them values to avoid prompting on service creation.
TP.google.GoogleContactsService.Type.defineAttribute('defaultedParameters',
                TP.hc('serviceURI', TP.NONE,
                        'auth', TP.NONE,
                        'iswebdav', false));

TP.google.GoogleContactsService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.google.GoogleContactsService.Inst.defineMethod('finalizeRequest',
function(aRequest) {

    /**
     * @method finalizeRequest
     * @summary Perform any final updates or processing on the request to make
     *     sure it is ready to send to TP.httpCall() for processing.
     * @param {TP.google.GoogleContactsRequest} aRequest The request being
     *     finalized.
     * @returns {TP.google.GoogleContactsRequest} The request to send. NOTE that
     *     this may not be the original request.
     */

    var params;

    //  All requests to Google Contacts are async...
    aRequest.atPut('async', true);

    params = aRequest.atPutIfAbsent('uriparams', TP.hc());

    switch (aRequest.at('action')) {
        case 'login':

            //  All GData service logins require us to 'stamp in' the
            //  service we're requesting access to - in this case, 'cp' for
            //  Google Contacts.
            params.atPut('service', 'cp');

            break;

        default:
            break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.google.GoogleContactsService.Inst.defineMethod('rewriteRequestURI',
function(aRequest) {

    /**
     * @method rewriteRequestURI
     * @summary Rewrites the request's URI.
     * @param {TP.google.GoogleContactsRequest} aRequest The request to rewrite.
     * @returns {TP.core.URI} The new/updated URI instance.
     */

    switch (aRequest.at('action')) {
        case 'fetchContacts':

            return 'http://www.google.com/m8/feeds/contacts/' +
                                            aRequest.at('userEmail') +
                                            '/full';
        default:
            break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.google.GoogleContactsService.Inst.defineMethod('rewriteRequestVerb',
function(aRequest) {

    /**
     * @method rewriteRequestVerb
     * @summary Returns the HTTP verb to use for the request. For Contacts
     *     requests, this varies depending on operation.
     * @param {TP.google.GoogleContactsRequest} aRequest The request whose
     *     parameters define the HTTP request.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     */

    switch (aRequest.at('action')) {
        case 'fetchContacts':

            return TP.HTTP_GET;

        default:
            break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
