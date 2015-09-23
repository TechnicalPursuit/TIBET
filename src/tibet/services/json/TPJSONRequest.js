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
 * @type {TP.sig.JSONRequest}
 * @summary A subtype of TP.sig.Request that is used in conjunction with the
 *     TP.core.JSONService type to communicate to JSON / JSONP services
 * @example Communicating with a JSON data source from TIBET consists of:
 *
 *     1. Define the operation you want to perform via a set of 'request
 *     parameters'. The 'uri' and 'uriparams' parameters will determine the
 *     endpoint and the query of the service call. 2. Instantiating an
 *     TP.sig.JSONRequest object, supplying those parameters. 3. Firing the
 *     request.
 *
 *     Defining request parameters:
 *
 *     jsonReq = TP.sig.JSONRequest.construct( TP.hc( 'uri',
 *     'jsonp://ajax.googleapis.com/ajax/services/search/web', 'uriparams',
 *     TP.hc('q', 'football', 'v', '1.0') ));
 *
 *     Request parameters examples:
 *
 *     // JSON data retrieved via the JSONP transport mechanism.
 *
 *     requestParams = TP.hc( 'uri',
 *     'jsonp://ajax.googleapis.com/ajax/services/search/web', 'uriparams',
 *     TP.hc('q', 'football', 'v', '1.0') );
 *
 *     // JSON data retrieved via the JSONP transport mechanism - with //
 *     custom callback function.
 *
 *     requestParams = TP.hc( 'uri',
 *     'jsonp://ajax.googleapis.com/ajax/services/search/web', 'uriparams',
 *     TP.hc('q', 'football', 'v', '1.0'), 'callbackFunc', function(result) {
 *
 *     TP.info('Result: ' + TP.json(result)); } );
 *
 *     // JSON data retrieved via the JSONP transport mechanism - with //
 *     different callback parameter name than 'callback' (some // services don't
 *     call the parameter that you put the name of // the callback function into
 *     'callback').
 *
 *     requestParams = TP.hc( 'uri',
 *     'jsonp://www.nonstandard.com/ajax/someservice', 'uriparams', TP.hc('q',
 *     'football', 'v', '1.0'), 'callbackParamName', 'jsoncallback', );
 *
 *     // JSON data retrieved via the HTTP transport mechanism.
 *
 *     requestParams = TP.hc( 'uri', 'http://search.twitter.com/search.json',
 *     'uriparams', TP.hc('q', 'devo', 'rpp', '15') );
 *
 *     // JSON data retrieved via the HTTP transport mechanism - with // custom
 *     callback function.
 *
 *     requestParams = TP.hc( 'uri', 'http://search.twitter.com/search.json',
 *     'uriparams', TP.hc('q', 'devo', 'rpp', '15'), 'callbackFunc',
 *     function(result) {
 *
 *     TP.info('Result: ' + TP.json(result)); } );
 *
 *     Package and fire the request:
 *
 *     jsonReq = TP.sig.JSONRequest.construct(requestParams);
 *     jsonReq.defineHandler('RequestSucceeded', function(aResponse) {
 *
 *     TP.info('Success! Result: ' + TP.json(aResponse.getResult())
 *     ); }); jsonReq.defineHandler('RequestFailed',
 *     function(aResponse) {
 *
 *     TP.info('Failure... Result: ' + aResponse.getFaultText()
 *     ); }); jsonReq.fire();
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('JSONRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.JSONRequest.Type.defineAttribute('responseType', 'TP.sig.JSONResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
