//  ========================================================================
/*
NAME:   TP.core.PouchDBURL.js
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
//  ========================================================================

/**
 * @type {TP.core.PouchDBURL}
 * @synopsis A subtype of TP.core.URL specific to the 'pouchdb:' scheme.
 * @description

    'pouchdb://' URLs behave in a very RESTy way and are modeled on those used
    in CouchDB. You can find an explanation of how those work here:

        http://wiki.apache.org/couchdb/HTTP_Document_API

    //  ---

    GET (RETRIEVE):

    pouchdb://<db_name>/<_id>

        Returns value of all keys in record

        {
            "_id": "author_info"
            "_date_created": <Date>,
            "_date_modified": <Date>
            "First_name": "Bill",
            "Last_name": "Edney"
        }

    //  ---

    HEAD:

    pouchdb://<db_name>/<_id>

        Returns values of '_date_created' and '_date_modified':

        {
            "_date_created": <Date>,
            "_date_modified": <Date>
        }

    //  ---

    Return listing of all documents in db:

    GET pouchdb://<db_name>/_all_docs

        Returns:

        {
            "total_rows": 3,
            "rows": [
                        {"_id": _id, ...},
                    ]
        }
    //  ---

    PUT (UPDATE):

    pouchdb://<db_name>/<_id>

        Sets the value of the 'body' under that _id:

        {
            "First_name": "Scott",
            "Last_name": "Shattuck"
        }

        Returns:

        {
            "ok": true,
            "_id": <_id>
        }

    //  ---

    POST (CREATE):

    pouchdb://<db_name>/

        Sets the value of the 'body' under a generated _id:

        {
            "First_name": "Scott",
            "Last_name": "Shattuck"
        }

        Returns:

        {
            "ok": true,
            "_id": <_id> (generated)
        }

    //  ---

    DELETE (DELETE):

    pouchdb://<db_name>/<_id>

        Removes the entire value under that _id:

        Returns:

        {
            "ok": true,
            "_id": <_id>
        }

    //  ---

    It is possible to encrypt/decrypt data automatically by supplying a
    'securePW' parameter on the URL:

    pouchdb://<db_name>/<_id>?securePW=fluffy
 */

//  ------------------------------------------------------------------------

TP.core.URL.defineSubtype('TP.core.PouchDBURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  This RegExp splits up the URL into the following components:
//  pouchdb://dbName/(?id)
TP.core.PouchDBURL.Type.defineConstant('POUCHDB_REGEX',
    TP.rc('^pouchdb:\/\/([^\/]+)(\/([^?]+)(\\??(\\S*))?)?'));

TP.core.PouchDBURL.Type.defineConstant('SCHEME', 'pouchdb');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.PouchDBURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.ASYNCHRONOUS);
TP.core.PouchDBURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.ASYNCHRONOUS);

TP.core.PouchDBURL.registerForScheme('pouchdb');

TP.core.PouchDBURL.Inst.defineAttribute('query');
TP.core.PouchDBURL.Inst.defineAttribute('queryDict');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.core.URI / TP.core.URL
TP.core.PouchDBURL.Inst.defineAttribute('dbName');
TP.core.PouchDBURL.Inst.defineAttribute('resourceID');

TP.core.PouchDBURL.Inst.defineAttribute('$lastAdded');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.PouchDBURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

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

    return TP.core.PouchDBURLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.PouchDBURL.Inst.defineMethod('init',
function(aURIString) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.core.PouchDBURL} A new instance.
     */

    var results,

        dbName,
        resourceID,
    
        uriQuery,
        queryDict;

    this.callNextMethod();

    //  Run the type's RegExp and grab the pieces of the URL.
    results = this.getType().POUCHDB_REGEX.exec(aURIString);

    if (TP.notValid(results) || TP.isEmpty(dbName = results.at(1))) {
        return this.raise('TP.sig.InvalidURI', arguments,
                    'Invalid pouch URL - no dbName: ' + aURIString);
    }

    //  Reset the 'path' ivar - the standard getPath() routine isn't smart
    //  enough to not include the query and it shouldn't for these kinds of
    //  URLs.
    this.set('path', TP.join(results.at(1), '/', results.at(3)));

    this.set('dbName', dbName);

    //  If there is a resource ID specified, then use it.
    if (TP.notEmpty(resourceID = results.at(3))) {
        this.set('resourceID', resourceID);
    }

    //  If there are parameters in the query, process them into a hash.
    if (TP.notEmpty(uriQuery = results.at(5))) {
        this.set('query', uriQuery);

        //  Create a hash from the query string.
        queryDict = TP.lang.Hash.fromString(uriQuery);

        this.set('queryDict', queryDict);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.PouchDBURL.Inst.defineMethod('addResource',
function(existingResource, newResource, aRequest) {

    /**
     * @name addResource
     * @synopsis Adds to the receiver's resource object, the object TIBET will
     *     treat as the resource for any subsequent processing.
     * @param {Object} existingResource The existing resource assigned to this
     *     object, if available.
     * @param {Object} newResource The resource object to add to the resource of
     *     the receiver.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.core.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     * @todo
     */

    this.set('$lastAdded', newResource);

    return;
});

//  ------------------------------------------------------------------------

TP.core.PouchDBURL.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @name getContent
     * @synopsis Fetches the receiver's content, returns a content-specific
     *     object or a TP.sig.Response when the request is asynchronous.
     * @description For pouchdb: URLs, this method defaults the 'refresh'
     *     parameter to true, which is inverted from the base URI type's value
     *     of 'false'. This is because most of the time the requestor won't want
     *     the cached value of the URI, but will want to query the database.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Object} 
     * @todo
     */

    if (TP.isValid(aRequest)) {
        aRequest.atPutIfAbsent('refresh', true);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
