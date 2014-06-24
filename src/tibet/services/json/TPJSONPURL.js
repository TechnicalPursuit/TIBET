//  ========================================================================
/*
NAME:   TP.core.JSONPURL.js
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
 * @type {TP.core.JSONPURL}
 * @synopsis A subtype of TP.core.URL specific to the 'jsonp://' scheme.
 * @description The overall format of a jsonp URI is:
 *     
 *     jsonp://[domain]/[path]/[entity]?[query]
 *     
 *     
 * @example

 // Read JSON data using JSONP and the CrunchBase API on Facebook.
 *     // NOTE: We do *not* supply the callback parameter here - TIBET's //
 *     machinery takes care of that for us. We use standard TIBET // observation
 *     mechanisms to be notified when the data is ready.
 *     
 *     myJSONPURL =
 *     TP.uc('jsonp://api.crunchbase.com/v/1/company/facebook.js');
 *     
 *     jsonRequest = TP.request('refresh', true);
 *     jsonRequest.defineMethod('handleRequestSucceeded', function(aRequest) {
 *     
 *     TP.ifInfo() ? TP.info('The results are: ' +
 *     TP.str(aRequest.getResult()), TP.LOG, arguments): 0; });
 *     
 *     // OR Fetch the content and ignore the URL cache, going to the // data
 *     source each time. myJSONPURL.getResourceText(jsonRequest);
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.URL.defineSubtype('JSONPURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  This RegExp splits up the URL into the following components:
//  jsonp://[domain]/[path]/[entity]?[query]
TP.core.JSONPURL.Type.defineConstant('JSONP_REGEX',
        TP.rc('jsonp://([^/]*)/?([^?]+)\\??(\\S*)'));

TP.core.JSONPURL.Type.defineConstant('SCHEME', 'jsonp');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  JSONP is async-only so configure for that
TP.core.JSONPURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.ASYNCHRONOUS);
TP.core.JSONPURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.ASYNCHRONOUS);

TP.core.JSONPURL.registerForScheme('jsonp');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.JSONPURL.Type.defineMethod('$getDefaultHandler',
function(targetURI, aRequest) {

    /**
     * @name $getDefaultHandler
     * @synopsis Return the default URI handler type for this URI type. The
     *     returned type must respond to the route() method to be a valid
     *     handler.
     * @param {TP.core.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object.
     * @todo
     */

    return TP.core.JSONPURLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.core.URI / TP.core.URL
TP.core.JSONPURL.Inst.defineAttribute('domain');
TP.core.JSONPURL.Inst.defineAttribute('entity');

TP.core.JSONPURL.Inst.defineAttribute('query');
TP.core.JSONPURL.Inst.defineAttribute('queryDict');

TP.core.JSONPURL.Inst.defineAttribute('useSSL', false);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.JSONPURL.Inst.defineMethod('init',
function(aURIString) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.core.JSONPURL} A new instance.
     */

    var results,
        pathAndName,
        uriQuery,
        queryDict;

    this.callNextMethod();

    //  Run the type's RegExp and grab the pieces of the URL.
    results = this.getType().JSONP_REGEX.exec(aURIString);
    if (TP.notValid(results)) {
        this.raise('TP.sig.InvalidURI',
                    arguments,
                    'Unable to parse: ' + aURIString);

        return;
    }

    this.set('domain', results.at(1));

    pathAndName = results.at(2);
    if (pathAndName.contains('/')) {
        this.set('path',
                    '/' + pathAndName.slice(0,
                                            pathAndName.lastIndexOf('/')));
        this.set('entity',
                    pathAndName.slice(pathAndName.lastIndexOf('/') + 1));
    } else {
        this.set('path', '/');
        this.set('entity', pathAndName);
    }

    //  If there are parameters in the query, process them into a hash.
    if (TP.notEmpty(uriQuery = results.at(3))) {
        this.set('query', uriQuery);

        //  Create a hash from the query string.
        queryDict = TP.lang.Hash.fromString(uriQuery);
        this.set('queryDict', queryDict);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
