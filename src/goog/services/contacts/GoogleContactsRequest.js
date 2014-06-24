//  ========================================================================
/*
NAME:   TP.sig.GoogleContactsRequest.js
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
 * @type {TP.sig.GoogleContactsRequest}
 * @synopsis A subtype of TP.sig.HTTPRequest that knows how to manage data from
 *     the Google-hosted Google Contacts server.
 * @example Using the Google Contacts server from TIBET consists of:
 *     
 *     1. Define the operation you want to perform via a set of 'request
 *     parameters'. The 'action' parameter will tell the service servicing this
 *     request what sort of action you want the service to perform. 2.
 *     Instantiating a TP.sig.GoogleContactsRequest object, supplying those
 *     parameters. 3. Firing the request.
 *     
 *     Defining request parameters:
 *     
 *     Here is an example of request parameters defined in the request (this
 *     example logs the user into the Contacts server). Note that if the service
 *     that is servicing these requests has a service URI, the request can
 *     specify a 'relative' URI and it will be joined with the service's URI to
 *     form the full URI:
 *     
 *     requestParams = TP.hc( 'action', 'login');
 *     
 *     Request parameters examples:
 *     
 *     Log in to the Contacts server:
 *     
 *     requestParams = TP.hc( 'action', 'login');
 *     
 *     OR
 *     
 *     Retrieve the list of all contacts:
 *     
 *     requestParams = TP.hc( 'action', 'fetchContacts', 'userEmail', 'bedney
 * @technicalpursuit.com');

 Package and fire the request:
 *     
 *     gooReq = TP.sig.GoogleContactsRequest.construct(requestParams);
 *     gooReq.defineMethod('handleRequestSucceeded', function(aResponse) {
 *     
 *     TP.log(aResponse.getResult(), TP.LOG, arguments); }); gooReq.fire();
 * @todo
 */

//  ------------------------------------------------------------------------

TP.sig.GoogleRequest.defineSubtype('GoogleContactsRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.GoogleContactsRequest.Type.defineAttribute(
                        'responseType', 'TP.sig.GoogleContactsResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
