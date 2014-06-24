//  ========================================================================
/*
NAME:   GoogleDocsRequest.js
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
 *     TP.log(aResponse.getResult(), TP.LOG, arguments); }); gooReq.fire();
 * @todo
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
