//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.uri.PouchDBURL}
 * @summary A subtype of TP.uri.URL specific to the 'pouchdb:' scheme.
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
            "First_name": "November",
            "Last_name": "Jones"
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
            "First_name": "November",
            "Last_name": "Jones"
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

TP.uri.URL.defineSubtype('TP.uri.PouchDBURL');

TP.uri.PouchDBURL.addTraits(TP.uri.CommURL);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  This RegExp splits up the URL into the following components:
//  pouchdb://dbName/(?id)
TP.uri.PouchDBURL.Type.defineConstant('POUCHDB_REGEX',
    TP.rc('^pouchdb://([^/]+)(/([^?]+)(\\??(\\S*))?)?'));

TP.uri.PouchDBURL.Type.defineConstant('SCHEME', 'pouchdb');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.uri.PouchDBURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.ASYNCHRONOUS);
TP.uri.PouchDBURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.ASYNCHRONOUS);

TP.uri.PouchDBURL.registerForScheme('pouchdb');

TP.uri.PouchDBURL.Inst.defineAttribute('query');
TP.uri.PouchDBURL.Inst.defineAttribute('queryDict');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.uri.URI / TP.uri.URL
TP.uri.PouchDBURL.Inst.defineAttribute('dbName');
TP.uri.PouchDBURL.Inst.defineAttribute('resourceID');

TP.uri.PouchDBURL.Inst.defineAttribute('$lastAdded');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.PouchDBURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Return the default URI handler type for this URI type.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type
     *     object.
     */

    return TP.uri.PouchDBURLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.PouchDBURL.Inst.defineMethod('init',
function(aURIString) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.uri.PouchDBURL} A new instance.
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
        return this.raise('TP.sig.InvalidURI',
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
        queryDict = TP.core.Hash.fromString(uriQuery);

        this.set('queryDict', queryDict);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.PouchDBURL.Inst.defineMethod('addResource',
function(existingResource, newResource, aRequest) {

    /**
     * @method addResource
     * @summary Adds to the receiver's resource object, the object TIBET will
     *     treat as the resource for any subsequent processing.
     * @param {Object} existingResource The existing resource assigned to this
     *     object, if available.
     * @param {Object} newResource The resource object to add to the resource of
     *     the receiver.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.uri.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     */

    this.set('$lastAdded', newResource);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
