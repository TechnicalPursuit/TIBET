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
 *     TP.info(aResponse.getResult(), TP.LOG); }); gooReq.fire();
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
