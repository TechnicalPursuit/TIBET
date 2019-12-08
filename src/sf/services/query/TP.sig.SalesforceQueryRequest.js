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
 * @type {TP.sig.SalesforceQueryRequest}
 * @summary A subtype of TP.sig.IORequest that is used in conjunction with
 *     the TP.sf.SalesforceQueryService type to communicate to the Salesforce
 *     query service.
 * @example Accessing Amazon Lambda from TIBET consists of:
 *
 *     1. Define the operation you want to perform via a set of 'request
 *         parameters'
 *     2. Instantiating an TP.sig.SalesforceQueryRequest object, supplying those
 *         request parameters
 *     3. Firing the request.
 *
 *     Defining request parameters:
 *
 *     Note that the service will also identification and authentication
 *     credentials. See the type comment in TP.sf.SalesforceQueryService for more
 *     information.
 *
 *     Here is an example of them defined in the request:
 *
 *     requestParams = TP.hc(
 *              'action', 'invoke',
 *              'params',
 *                  TP.hc('FunctionName, 'hello',
 *                          'Payload', TP.js2json(TP.hc('param1', 'John'))));
 *
 *     Request parameters examples:
 *
 *     List all functions:
 *
 *     requestParams = TP.hc('action', 'listFunctions');
 *
 *     Package and fire the request:
 *
 *     lambdaReq = TP.sig.SalesforceQueryRequest.construct(requestParams);
 *     lambdaReq.defineHandler('RequestSucceeded',
 *              function(aResponse) {
 *                  TP.info(aResponse.getResult());
 *              });
 *     lambdaReq.fire();
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('SalesforceQueryRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.SalesforceQueryRequest.Type.defineAttribute('responseType',
    'TP.sig.SalesforceQueryResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
