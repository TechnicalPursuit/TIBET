//  ========================================================================
/*
NAME:   TP.sig.JSONRequest.js
AUTH:   Scott Shattuck (ss)
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
 * @type {TP.sig.JSONRequest}
 * @synopsis A subtype of TP.sig.Request that is used in conjunction with the
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
 *     TP.log('Result: ' + TP.json(result), TP.LOG, arguments); } );
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
 *     TP.log('Result: ' + TP.json(result), TP.LOG, arguments); } );
 *     
 *     Package and fire the request:
 *     
 *     jsonReq = TP.sig.JSONRequest.construct(requestParams);
 *     jsonReq.defineMethod('handleRequestSucceeded', function(aResponse) {
 *     
 *     TP.log('Success! Result: ' + TP.json(aResponse.getResult()), TP.LOG,
 *     arguments); }); jsonReq.defineMethod('handleRequestFailed',
 *     function(aResponse) {
 *     
 *     TP.log('Failure... Result: ' + aResponse.getFaultText(), TP.LOG,
 *     arguments); }); jsonReq.fire();
 * @todo
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
