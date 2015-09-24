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
 * @type {TP.sig.AmazonSimpleDBRequest}
 * @summary A subtype of TP.sig.RESTRequest that is used in conjunction with
 *     the TP.amz.AmazonSimpleDBService type to communicate to the Amazon
 *     SimpleDB service.
 * @example Accessing Amazon SimpleDB from TIBET consists of:
 *
 *     1. Define the operation you want to perform via a set of 'request
 *         parameters'
 *     2. Instantiating an TP.sig.AmazonSimpleDBRequest object, supplying those
 *         request parameters
 *     3. Firing the request.
 *
 *     Defining request parameters:
 *
 *     Note that the service will also need a 'key' and a 'secret key'. These
 *     can be included in the request as 'key' and 'secretkey', but if they are
 *     not defined in the request, they will be obtained either by looking for a
 *     vCard entry matching the service's 'resourceID' in the current
 *     application's 'cfg' hash or by prompting the user. See the type comment
 *     in TP.amz.AmazonSimpleDBService for more information.
 *
 *     Here is an example of them defined in the request:
 *
 *     requestParams = TP.hc(
 *                      'serviceURI', 'https://sdb.amazonaws.com',
 *                      'action', 'ListDomains',
 *                      'key', '<developer key from Amazon>',
 *                      'secretkey', '<developer secret key from Amazon>');
 *
 *     Request parameters examples:
 *
 *     Create a domain:
 *
 *     requestParams = TP.hc('action', 'CreateDomain',
 *                              'uriparams', TP.hc('DomainName', 'myDomain'));
 *
 *     OR
 *
 *     List all domains:
 *
 *     requestParams = TP.hc('action', 'ListDomains');
 *
 *     OR
 *
 *     Delete a domain:
 *
 *     requestParams = TP.hc('action', 'DeleteDomain',
 *                              'uriparams', TP.hc('DomainName', 'myDomain'));
 *
 *     OR
 *
 *     Put some data values into a domain:
 *
 *     requestParams = TP.hc('action', 'PutAttributes',
 *              'uriparams',
 *                  TP.hc('DomainName', 'myDomain',
 *                          'ItemName', 'myItem'),
 *              'Names', TP.ac('color', 'size', 'price'),
 *              'Values', TP.ac('blue', TP.ac('small', 'med', 'large'), .50),
 *              'Replaces', TP.ac('color', 'price') );
 *
 *     OR
 *
 *     Get some data values from a domain:
 *
 *     requestParams = TP.hc(
 *              'action', 'GetAttributes',
 *              'uriparams',
 *                  TP.hc('DomainName', 'myDomain',
 *                          'ItemName', 'myItem',
*                          'AttributeName', 'size'));
 *
 *     OR
 *
 *     Remove some data values from a domain:
 *
 *     requestParams = TP.hc(
 *              'action', 'DeleteAttributes',
 *              'uriparams',
 *                  TP.hc('DomainName', 'myDomain',
 *                          'ItemName', 'myItem'),
 *              'Names', TP.ac('color', 'size', 'price'),
 *              'Values', TP.ac(TP.ALL, // Remove only the 'small' and 'large'
 *                                      // values for 'size'
 *                              TP.ac('small', 'large'),
 *                              TP.ALL));
 *
 *     OR
 *
 *     Select some data values from a domain:
 *
 *     requestParams = TP.hc(
 *          'action', 'Select',
 *          'uriparams', TP.hc('SelectExpression',
 *                              'select * from myDomain where "size" = "med"'));
 *
 *     Package and fire the request:
 *
 *     simpleDBReq = TP.sig.AmazonSimpleDBRequest.construct( requestParams);
 *     simpleDBReq.defineHandler('RequestSucceeded',
 *              function(aResponse) {
 *                  TP.info(aResponse.getResult());
 *              });
 *     simpleDBReq.fire();
 */

//  ------------------------------------------------------------------------

TP.sig.RESTRequest.defineSubtype('AmazonSimpleDBRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.AmazonSimpleDBRequest.Type.defineAttribute('responseType',
    'TP.sig.AmazonSimpleDBResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
