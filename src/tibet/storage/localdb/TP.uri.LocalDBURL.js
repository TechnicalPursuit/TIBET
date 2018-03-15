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
 * @type {TP.uri.LocalDBURL}
 * @summary A subtype of TP.uri.URL specific to the 'local:' scheme.
 * @description

    'local://' URLs behave in a very RESTy way and are modeled on those used in
    CouchDB. You can find an explanation of how those work here:

        http://wiki.apache.org/couchdb/HTTP_Document_API

    //  ---

    GET (RETRIEVE):

    local://<db_name>/<_id>

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

    local://<db_name>/<_id>

        Returns values of '_date_created' and '_date_modified':

        {
            "_date_created": <Date>,
            "_date_modified": <Date>
        }

    //  ---

    Return listing of all documents in db:

    GET local://<db_name>/_all_docs

        Returns:

        {
            "total_rows": 3,
            "rows": [
                        {"_id": _id, ...},
                    ]
        }
    //  ---

    PUT (UPDATE):

    local://<db_name>/<_id>

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

    local://<db_name>/

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

    local://<db_name>/<_id>

        Removes the entire value under that _id:

        Returns:

        {
            "ok": true,
            "_id": <_id>
        }

    //  ---

    It is possible to encrypt/decrypt data automatically by supplying a
    'securePW' parameter on the URL:

    local://<db_name>/<_id>?securePW=fluffy
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('TP.uri.LocalDBURL');

TP.uri.LocalDBURL.addTraits(TP.uri.CommURL);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  This RegExp splits up the URL into the following components:
//  local://dbName/(?id)
TP.uri.LocalDBURL.Type.defineConstant('LOCALDB_REGEX',
    TP.rc('^localdb://([^/]+)(/([^?]+)(\\??(\\S*))?)?'));

TP.uri.LocalDBURL.Type.defineConstant('SCHEME', 'localdb');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.uri.LocalDBURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.SYNCHRONOUS);
TP.uri.LocalDBURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.SYNCHRONOUS);

TP.uri.LocalDBURL.registerForScheme('localdb');

TP.uri.LocalDBURL.Inst.defineAttribute('query');
TP.uri.LocalDBURL.Inst.defineAttribute('queryDict');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.uri.URI / TP.uri.URL
TP.uri.LocalDBURL.Inst.defineAttribute('dbName');
TP.uri.LocalDBURL.Inst.defineAttribute('resourceID');

TP.uri.LocalDBURL.Inst.defineAttribute('$lastAdded');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.LocalDBURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Return the default URI handler type for this URI type.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.uri.URIHandler>} A TP.uri.URIHandler
     *     subtype type object.
     */

    return TP.uri.LocalDBURLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.LocalDBURL.Inst.defineMethod('init',
function(aURIString) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.uri.LocalDBURL} A new instance.
     */

    var results,

        dbName,
        resourceID,

        uriQuery,
        queryDict;

    this.callNextMethod();

    //  Run the type's RegExp and grab the pieces of the URL.
    results = this.getType().LOCALDB_REGEX.exec(aURIString);

    if (TP.notValid(results) || TP.isEmpty(dbName = results.at(1))) {
        return this.raise('TP.sig.InvalidURI',
                    'Invalid local URL - no dbName: ' + aURIString);
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

TP.uri.LocalDBURL.Inst.defineMethod('addResource',
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

    return;
});

//  ------------------------------------------------------------------------

TP.uri.LocalDBURL.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @method getContent
     * @summary Fetches the receiver's content, returns a content-specific
     *     object or a TP.sig.Response when the request is asynchronous.
     * @description For localdb: URLs, this method defaults the 'refresh'
     *     parameter to true, which is inverted from the base URI type's value
     *     of 'false'. This is because most of the time the requestor won't want
     *     the cached value of the URI, but will want to query the database.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Object}
     */

    if (TP.isValid(aRequest)) {
        aRequest.atPutIfAbsent('refresh', true);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
