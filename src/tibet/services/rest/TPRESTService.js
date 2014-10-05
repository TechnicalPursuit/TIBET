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
 * @type {TP.core.RESTService}
 * @synopsis A service supporting simple REST calls with minimal encoding and
 *     serialization logic.
 * @examples
 // To construct the service, provide a resourceID to // identify
 *     the service instance and an optional "service // URI" pointing to the
 *     target service endpoint which will // be the default target URI for
 *     requests handled by the // service instance:
 *
 *     service = TP.core.RESTService.construct('XMLFetcher');
 *
 *     // if you will be using the service to handle asynchronous // calls you
 *     should invoke register on it so it observes // the trigger signals
 *     representing its request types:
 *
 *     service.register();
 *
 *     // NOTE that neither of the previous steps are necessary if // you can
 *     leverage a default service instance. Each // service type has the option
 *     of registering during type // initialize so that a default instance will
 *     handle // requests. TP.core.RESTService does that so you don't // really
 *     need a service instance.
 *
 *     // To leverage the REST service simply construct request // objects
 *     configured to match the parameters the service // type expects. The key
 *     ones are 'uri' and 'verb' which // are sufficient for GET requests. Add
 *     'uriparams' to put // additional qualifiers on the query portion of the
 *     URI. // Add 'body' to provide content for a POST, PUT, etc.
 *
 *     // request a standard page's content asynchronously. To // handle the
 *     response we add a local method which does // any callback processing we
 *     want:
 *
 *     request = TP.sig.RESTRequest.construct(
 *     TP.hc('uri','http://www.google.com'));
 *     request.defineMethod('handleRequestSucceeded', function(aResponse) {
 *
 *     TP.info(aResponse.getResult(), TP.LOG, arguments); }); request.fire();
 *
 *     // request a standard page's content synchronously. The // interesting
 *     thing here is that the two approaches are // identical in terms of how
 *     result processing can be // approached...you can still use the same
 *     callback hook:
 *
 *     request = TP.sig.RESTRequest.construct( TP.hc('uri',
 *     'http://www.google.com', 'async', false));
 *     request.defineMethod('handleRequestSucceeded', function(aResponse) {
 *
 *     TP.info(aResponse.getResult(), TP.LOG, arguments); }); request.fire();
 *
 *     // request a standard page's content synchronously without // a callback
 *     method in place: request = TP.sig.RESTRequest.construct( TP.hc('uri',
 *     'http://www.google.com', 'async', false)); request.fire();
 *     TP.info(request.getResponse().getResult(), TP.LOG, arguments);
 *
 *     // NOTE that if you have a specific service instance you // can trigger
 *     processing simply by asking the service to // handle the request. Note
 *     this example assumes sync:
 *
 *     response = TP.handle(service, request); TP.info(response.getResult(),
 *     TP.LOG, arguments);
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.HTTPService.defineSubtype('RESTService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  we'll respond to any TP.sig.RESTRequest signals
TP.core.RESTService.Type.defineAttribute('triggerSignals',
                                        'TP.sig.RESTRequest');

TP.core.RESTService.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
