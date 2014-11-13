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
 * @type {TP.goog.GoogleDocsService}
 * @synopsis A subtype of GoogleService that communicates with the Google-hosted
 *     Google Docs server.
 * @example If the TP.sig.GoogleDocsRequest/TP.sig.GoogleDocsResponse processing
 *     model is used, it is unnecessary to manually set up an
 *     TP.goog.GoogleDocsService. As part of the TIBET infrastructure of using
 *     request/response pairs, a 'default' instance of this service will be
 *     instantiated and registered to handle all TP.sig.GoogleDocsRequests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'TP.goog.GoogleDocsServiceDefault'. It should have
 *     a vCard entry in the currently executing project (with an 'FN' of
 *     'TP.goog.GoogleDocsServiceDefault'). If this vCard cannot be found, the
 *     user will be prompted to enter the information about the default server.
 *     If only part of the information is found the user can be prompted to
 *     enter the missing information.
 *
 *     It is possible, however, to manually set up a server. To do so, simply
 *     instantiate a server:
 *
 *     docsService = TP.goog.GoogleDocsService.construct(
 *     'GoogleDocsTestServer');
 *
 *     Or have a vCard entry where the 'FN' entry matches the resource ID that
 *     is passed to the 'construct' call as detailed here:
 *
 *     E.g.
 *
 *     Parameter vCard entry ----------- ----------- resourceID
 *     <FN>GoogleDocsTestServer</FN>
 *
 *     and then construct it using:
 *
 *     docsService =
 *     TP.goog.GoogleDocsService.construct('GoogleDocsTestServer');
 *
 *     You will then need to register your service instance so that it services
 *     TP.sig.GoogleDocsRequests (otherwise, the TIBET machinery will
 *     instantiate the 'default' instance of TP.goog.GoogleDocsService as
 *     described above and register it to service these kinds of requests):
 *
 *     waveService.register();
 * @todo
 */

//  ------------------------------------------------------------------------

TP.goog.GoogleService.defineSubtype('GoogleDocsService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.goog.GoogleDocsService.Type.defineAttribute('triggerSignals',
                                            'TP.sig.GoogleDocsRequest');

//  We basically ignore serviceURI, auth and iswebdav for Contacts, but
//  we need to give them values to avoid prompting on service creation.
TP.goog.GoogleDocsService.Type.defineAttribute('defaultedParameters',
        TP.hc('serviceURI', TP.NONE,
                'auth', TP.NONE,
                'iswebdav', false));

TP.goog.GoogleDocsService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.goog.GoogleDocsService.Inst.defineMethod('finalizeRequest',
function(aRequest) {

    /**
     * @name finalizeRequest
     * @synopsis Perform any final updates or processing on the request to make
     *     sure it is ready to send to TP.httpCall() for processing.
     * @param {TP.sig.GoogleDocsRequest} aRequest The request being finalized.
     * @returns {TP.sig.GoogleDocsRequest} The request to send. NOTE that this
     *     may not be the original request.
     */

    var params;

    //  All requests to Google Docs are async...
    aRequest.atPut('async', true);

    params = aRequest.atPutIfAbsent('uriparams', TP.hc());

    switch (aRequest.at('action')) {
        case 'login':

            //  All GData service logins require us to 'stamp in' the
            //  service we're requesting access to - in this case, 'writely'
            //  for Google Docs.
            params.atPut('service', 'writely');

        break;

        case 'downloadDoc':

            params.atPut('docId', aRequest.at('docId'));

        break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.goog.GoogleDocsService.Inst.defineMethod('rewriteRequestBody',
function(aRequest) {

    /**
     * @name rewriteRequestBody
     * @synopsis Encodes the request body for transmission. Processing in this
     *     method makes use of keys in the request to drive a call to the
     *     TP.httpEncode() primitive. If you don't want this processing to occur
     *     you can put a key of 'noencode' with a value of true in the request.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {String} The string value of the encoded body content.
     */

    var bodyData;

    switch (aRequest.at('action')) {
        case 'uploadDoc':

            //  If we're uploading a document, we need to rework it so that
            //  it consists of an Array of TP.lang.Hashes, each contains a
            //  'part' of a multipart submission. Each part will have its
            //  own 'body' and 'mimetype'. Google Docs wants a chunk of Atom
            //  metadata that describes the document being uploaded and then
            //  the document content itself.

            bodyData = TP.ac(
                TP.hc(
                    'body',
                        TP.join('<?xml version="1.0" encoding="UTF-8"?>',
                                '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:docs="http://schemas.google.com/docs/2007">',
                                    '<category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/docs/2007#document"/>',
                                    '<title>', aRequest.at('docName'), '</title>',
                                    '<docs:writersCanInvite value="false" />',
                                '</entry>'),
                    'mimetype',
                        TP.ATOM_ENCODED
                ),
                TP.hc(
                    'body',
                        aRequest.at('body'),
                    'mimetype',
                        TP.HTML_TEXT_ENCODED
                    )
            );

            //  Update the 'body' in the main request with the new body data
            //  and set the mimetype to multipart/related.
            aRequest.atPut('body', bodyData);
            aRequest.atPut('mimetype', TP.MP_RELATED_ENCODED);

        break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.goog.GoogleDocsService.Inst.defineMethod('rewriteRequestURI',
function(aRequest) {

    /**
     * @name rewriteRequestURI
     * @synopsis Rewrites the request's URI.
     * @param {TP.sig.GoogleDocsRequest} aRequest The request to rewrite.
     * @returns {TP.core.URI} The new/updated URI instance.
     */

    switch (aRequest.at('action')) {
        case 'fetchDocList':
        case 'uploadDoc':

            return 'http://docs.google.com/feeds/default/private/full';

        case 'downloadDoc':

            return 'http://docs.google.com/feeds/download/documents/Export';
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.goog.GoogleDocsService.Inst.defineMethod('rewriteRequestVerb',
function(aRequest) {

    /**
     * @name rewriteRequestVerb
     * @synopsis Returns the HTTP verb to use for the request. For Docs
     *     requests, this varies depending on operation.
     * @param {TP.sig.GoogleDocsRequest} aRequest The request whose parameters
     *     define the HTTP request.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     */

    switch (aRequest.at('action')) {
        case 'fetchDocList':
        case 'downloadDoc':

            return TP.HTTP_GET;

        case 'uploadDoc':

            return TP.HTTP_POST;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
