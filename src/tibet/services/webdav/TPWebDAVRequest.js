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
 * @type {TP.sig.WebDAVRequest}
 * @synopsis Simple WebDAV request type with minimal encoding/serialization.
 * @example Using a WebDAV server from TIBET consists of:
 *     
 *     1. Define the operation you want to perform via a set of 'request
 *     parameters'. The 'action' parameter will tell the service servicing this
 *     request what sort of action you want the service to perform. 2.
 *     Instantiating a TP.sig.WebDAVRequest object, supplying those parameters.
 *     3. Firing the request.
 *     
 *     Defining request parameters:
 *     
 *     Here is an example of request parameters defined in the request (this
 *     example creates the 'foo' 'collection'). Note that if the service that is
 *     servicing these requests has a service URI, the request can specify a
 *     'relative' URI and it will be joined with the service's URI to form the
 *     full URI:
 *     
 *     requestParams = TP.hc( 'action', 'makecoll', 'uri', 'foo/', 'username',
 *     '<your username>', 'password', '<your password>');
 *     
 *     Request parameters examples:
 *     
 *     Read content from a URI:
 *     
 *     requestParams = TP.hc( 'action', 'read', 'uri', 'foo/baz.txt');
 *     
 *     OR
 *     
 *     Write content to a URI:
 *     
 *     requestParams = TP.hc( 'action', 'write', 'uri', 'foo/baz.txt', 'body',
 *     'Some text...');
 *     
 *     OR
 *     
 *     Remove a resource pointed to by a URI:
 *     
 *     requestParams = TP.hc( 'action', 'remove', 'uri', 'foo/baz.txt');
 *     
 *     OR
 *     
 *     Copy a resource pointed to by a URI to another URI (and force
 *     overwrite):
 *     
 *     requestParams = TP.hc( 'action', 'copy', 'uri', 'foo/baz.txt',
 *     'destination', 'foo/goo.txt', 'overwrite', true);
 *     
 *     OR
 *     
 *     Move a resource pointed to by a URI to another URI (and force
 *     overwrite):
 *     
 *     requestParams = TP.hc( 'action', 'move', 'uri', 'foo/baz.txt',
 *     'destination', 'foo/goo.txt', 'overwrite', true);
 *     
 *     OR
 *     
 *     Create a 'collection' (i.e. directory):
 *     
 *     requestParams = TP.hc( 'action', 'makecoll', 'uri', 'foo/');
 *     
 *     OR
 *     
 *     List a 'collection' (i.e. directory):
 *     
 *     requestParams = TP.hc( 'action', 'listcoll', 'uri', 'foo/');
 *     
 *     OR
 *     
 *     Get a property of a resource pointed to by a URI:
 *     
 *     requestParams = TP.hc( 'action', 'getprop', 'uri', 'foo/baz.txt',
 *     'property', TP.hc('name', 'creationdate'));
 *     
 *     OR
 *     
 *     Get all properties of a resource pointed to by a URI:
 *     
 *     requestParams = TP.hc( 'action', 'getprops', 'uri', 'foo/baz.txt');
 *     
 *     OR
 *     
 *     Set a property of a resource pointed to by a URI:
 *     
 *     requestParams = TP.hc( 'action', 'setprop', 'uri', 'foo/baz.txt',
 *     'property', TP.hc('name', 'getlastmodified', 'value',
 *     TP.dc().as('TP.iso.ISO8601')));
 *     
 *     OR
 *     
 *     Set some properties of a resource pointed to by a URI:
 *     
 *     requestParams = TP.hc( 'action', 'setprop', 'uri', 'foo/baz.txt',
 *     'setList', TP.ac( TP.hc('name', 'author', 'value', 'Jim Whitehead', 'ns',
 *     'http://www.w3.org/standards/z39.50/'), TP.hc('name', 'getlastmodified',
 *     'value', TP.dc().as('TP.iso.ISO8601'))));
 *     
 *     OR
 *     
 *     Delete some properties of a resource pointed to by a URI:
 *     
 *     requestParams = TP.hc( 'action', 'deleteprops', 'uri', 'foo/baz.txt',
 *     'removeList', TP.ac( TP.hc('name', 'author', 'ns',
 *     'http://www.w3.org/standards/z39.50/'), TP.hc('name',
 *     'getlastmodified')));
 *     
 *     OR
 *     
 *     Lock a resource pointed to by a URI:
 *     
 *     requestParams = TP.hc( 'action', 'lock', 'uri', 'foo/baz.txt',
 *     'lockscope', TP.WEBDAV_LOCKSCOPE_EXCLUSIVE, 'lockowner',
 *     'http://www.foo.com/joe.html');
 *     
 *     OR
 *     
 *     Unlock a resource pointed to by a URI:
 *     
 *     requestParams = TP.hc( 'action', 'unlock', 'uri', 'foo/baz.txt',
 *     'locktoken', '<opaquelocktoken:a515cfa4-5da4-22e1-f5b5-00a0451e6bf7>');
 *     
 *     Package and fire the request:
 *     
 *     davReq = TP.sig.WebDAVRequest.construct(requestParams);
 *     davReq.defineMethod('handleRequestSucceeded', function(aResponse) {
 *     
 *     TP.log(aResponse.getResult(), TP.LOG, arguments); }); davReq.fire();
 * @todo
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.defineSubtype('WebDAVRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.WebDAVRequest.Type.defineAttribute('responseType',
                                        'TP.sig.WebDAVResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
