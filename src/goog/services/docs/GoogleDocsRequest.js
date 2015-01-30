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
 * @type {GoogleDocsRequest}
 * @synopsis A subtype of TP.sig.HTTPRequest that knows how to manage data from
 *     the Google-hosted Google Docs server.
 * @example Using the Google Docs server from TIBET consists of:
 *
 *     1. Define the operation you want to perform via a set of 'request
 *     parameters'. The 'action' parameter will tell the service servicing this
 *     request what sort of action you want the service to perform. 2.
 *     Instantiating a GoogleDocsRequest object, supplying those parameters. 3.
 *     Firing the request.
 *
 *     Defining request parameters:
 *
 *     Here is an example of request parameters defined in the request (this
 *     example logs the user into the Docs server). Note that if the service
 *     that is servicing these requests has a service URI, the request can
 *     specify a 'relative' URI and it will be joined with the service's URI to
 *     form the full URI:
 *
 *     requestParams = TP.hc( 'action', 'login', 'username', '<your username>',
 *     'password', '<your password>');
 *
 *     Request parameters examples:
 *
 *     Log in to the Docs server:
 *
 *     requestParams = TP.hc( 'action', 'login', 'username', '<your username>',
 *     'password', '<your password>');
 *
 *     OR
 *
 *     Retrieve the list of all documents:
 *
 *     requestParams = TP.hc( 'action', 'fetchDocList');
 *
 *     OR
 *
 *     Retrieve the content of a document:
 *
 *     requestParams = TP.hc( 'action', 'downloadDoc', 'docId',
 *     '0Afwl9IpoPPh4ZHd2OGdqZ180ZGNiOHZ2aGM');
 *
 *     OR
 *
 *     Save a new document:
 *
 *     requestParams = TP.hc( 'action', 'uploadDoc', 'docName', 'Foo Document',
 *     'body', '<h1>This is some foo content</h1>');
 *
 *     OR
 *
 *     Log out of the Docs server:
 *
 *     requestParams = TP.hc( 'action', 'logout');
 *
 *     Package and fire the request:
 *
 *     gooReq = TP.sig.GoogleDocsRequest.construct(requestParams);
 *     gooReq.defineMethod('handleRequestSucceeded', function(aResponse) {
 *
 *     TP.info(aResponse.getResult(), TP.LOG); }); gooReq.fire();
 */

//  ------------------------------------------------------------------------

TP.sig.GoogleRequest.defineSubtype('GoogleDocsRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.GoogleDocsRequest.Type.defineAttribute('responseType',
                                            'TP.sig.GoogleDocsResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
