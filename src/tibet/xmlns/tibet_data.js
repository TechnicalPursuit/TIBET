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
 * @type {TP.tibet.data}
 * @summary A subtype of TP.core.ElementNode that implements 'dataing'
 *     behavior for UI elements.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet:data');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.data.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        localHref,
        localURI,

        childNodes,
        children,
        cdatas,

        resourceStr,

        resultType,

        thisTPDoc,
        loadedHandler,

        remoteHref,
        remoteURI;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    tpElem = TP.wrap(elem);

    //  If we're not empty, then we use our child content as our 'local'
    //  resource's content and ignore any 'remote' URI attribute.
    if (TP.notEmpty(childNodes = elem.childNodes)) {

        if (TP.notEmpty(localHref = tpElem.getAttribute('local'))) {
            if (!TP.isURI(localURI = TP.uc(localHref))) {
                //  Raise an exception
                return this.raise('TP.sig.InvalidURI');
            }
        }

        //  NOTE: Many of these calls use the native node, since we want to
        //  manipulate native node objects here.

        //  Normalize the node to try to get the best representation
        TP.nodeNormalize(elem);

        //  Get a result type for the data (either defined on the receiver
        //  element itself or from a supplied MIME type), construct an instance
        //  of that type and set it as the local URI's resource.

        //  If there is a CDATA section, then we grab it's text value.
        cdatas = TP.nodeGetDescendantsByType(elem, Node.CDATA_SECTION_NODE);
        if (TP.notEmpty(cdatas)) {

            //  The string we'll use is from the first CDATA.
            resourceStr = TP.nodeGetTextContent(cdatas.first());

            //  If we can determine that it's JSON data, then we get a result
            //  type using the TP.JSON_ENCODED MIME type.
            if (TP.isJSONString(resourceStr)) {
                resultType = tpElem.getResultType(TP.JSON_ENCODED);
            }
        } else {
            //  Otherwise, if the first child element is an XML element
            children = TP.nodeGetChildElements(elem);

            if (TP.isXMLNode(children.first())) {
                //  Stringify the XML.
                resourceStr = TP.str(children.first());

                //  Get a result type using the TP.XML_ENCODED MIME type.
                resultType = tpElem.getResultType(TP.XML_ENCODED);
            }
        }

        //  If a result type couldn't be determined, then just use String.
        if (!TP.isType(resultType)) {
            resultType = String;
        }

        localURI.setResource(resultType.construct(resourceStr));

        //  Get this element's document wrapper.
        thisTPDoc = TP.wrap(elem).getDocument();

        //  Define a handler that waits for this element to be completely loaded
        //  into the page and then signals from the local URI that it's content
        //  has changed (this allows page-level bindings to be set up before the
        //  notifications go out that their data has changed).
        loadedHandler = function(aSig) {
            loadedHandler.ignore(thisTPDoc, 'TP.sig.DOMContentLoaded');
            localURI.$changed();
        };

        //  Tell the handler to observe this element's document wrapper.
        loadedHandler.observe(thisTPDoc, 'TP.sig.DOMContentLoaded');
    } else if (
        TP.notEmpty(remoteHref = TP.elementGetAttribute(elem, 'remote'))) {

        //  Otherwise we had no child content, but we did have a 'remote' URI
        //  reference. Make sure that we can create a URI object from it and, if
        //  so, wrap ourself into an instance of this type and call 'load'.

        if (!TP.isURI(remoteURI = TP.uc(remoteHref))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        localHref,
        localURI;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  If we're not empty, then we use our child content as our 'local'
    //  resource's content and ignore any 'remote' URI attribute.
    if (TP.notEmpty(elem.childNodes)) {

        if (TP.notEmpty(localHref = TP.elementGetAttribute(elem, 'local'))) {
            if (!TP.isURI(localURI = TP.uc(localHref))) {
                //  Raise an exception
                return this.raise('TP.sig.InvalidURI');
            }
        }

        localURI.unregister();
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineAttribute('refreshHandler');
TP.tibet.data.Inst.defineAttribute('refreshSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('getResultType',
function(mimeType) {

    /**
     * @method getResultType
     * @summary Returns a result type that will either be a TIBET type from the
     *     name specified by the 'resultType' attribute on the receiver or, if
     *     that's not defined, the MIME type supplied to this method.
     * @param {String} mimeType
     * @returns {TP.meta.lang.RootObject|String} The type object (or a String as
     *     a fallback) to create for the supplied result data.
     */

    var resultType,
        tibetType;

    //  See if the user has define a 'resultType' attribute on us. If so, try to
    //  see if TIBET really has a Type matching that.
    if (TP.notEmpty(resultType = this.getAttribute('resultType'))) {
        tibetType = TP.sys.getTypeByName(resultType);
    }

    //  We still don't have a type for the result. If a MIME type was supplied,
    //  switch off of that.
    if (!TP.isType(tibetType)) {

        //  Depending on the MIME type, return a TIBET (or JS) type object that
        //  the result can be constructed with.

        switch (mimeType) {

            case TP.JSON_ENCODED:

                tibetType = TP.core.JSONContent;

                break;

            case TP.XML_ENCODED:

                tibetType = TP.core.XMLContent;

                break;

            default:
                tibetType = String;
        }
    }

    return tibetType;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('load',
function() {

    /**
     * @method load
     * @summary (Re)loads the remote resource defined on the receiver into the
     *     local resource.
     * @returns {TP.tibet.data} The receiver.
     */

    var remoteHref,
        remoteURI,

        localHref,
        localURI,

        loadRequest,

        statusID,
        statusTPElem,
        thisArg;

    //  Make sure that a 'remote' href is available and a URI can be created
    //  from it.
    if (TP.notEmpty(remoteHref = this.getAttribute('remote'))) {
        if (!TP.isURI(remoteURI = TP.uc(remoteHref))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  Raise an exception
        return this;
    }

    //  We also need to make sure that we have a 'local' href attribute and we
    //  can make a URI from it.
    if (TP.notEmpty(localHref = this.getAttribute('local'))) {
        if (!TP.isURI(localURI = TP.uc(localHref))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  Raise an exception
        return this;
    }

    //  Mark the URI as 'not loaded' to ensure that it will force TIBET to
    //  load data from the underlying source.
    remoteURI.isLoaded(false);

    //  Set up a resource that defines a complete job handler to process the
    //  results.
    loadRequest = TP.request(TP.hc('refresh', true));

    //  If we have a 'status' attribute, it will contain a path that can be used
    //  to fetch the element on the page that we can set the content of with any
    //  status codes and messages.
    if (TP.notEmpty(statusID = this.getAttribute('status', true))) {
        statusTPElem =
                TP.wrap(TP.byPath(statusID, this.getNativeDocument(), true));
    }

    //  Add a 'local' method on the individual object that defines a handler for
    //  job completion
    loadRequest.defineMethod('handleRequestSucceeded',
        function(aResponse) {

            var resultType,
                result,

                mimeType;

            //  Grab the result from the response.
            result = aResponse.getResult();

            //  If the result is a String, try to turn it into more
            if (TP.isString(result)) {

                //  Obtain a MIME type for the result and use it to obtain a
                //  result type.
                mimeType = TP.ietf.Mime.guessMIMEType(result, remoteURI);

                resultType = this.getResultType(mimeType);
                result = resultType.construct(result);
            }

            //  Set the resource of the local URI to that. This will cause any
            //  observers of the URI to get notified of a change.
            localURI.setResource(result);

        }.bind(this));

    thisArg = this;

    loadRequest.defineMethod('handleRequestFailed',
        function(aResponse) {

            //  If there is a status element, then report the status code and
            //  text, supplying the request object as the parameter to these
            //  internal calls.
            if (TP.isValid(statusTPElem)) {
                statusTPElem.setContent(
                'Status code: ' + thisArg.$getHTTPRequestStatusCode(this) +
                ' Status text: ' + thisArg.$getHTTPRequestResponseText(this));
            }
        });

    //  Do the work to actually fetch the data.
    remoteURI.getResource(loadRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('save',
function() {

    /**
     * @method save
     * @returns {TP.tibet.data} The receiver.
     */

    var remoteHref,
        remoteURI,

        localHref,
        localURI,

        content,

        verb,
        saveParams,
        saveRequest,

        statusID,
        statusTPElem,
        thisArg;

    //  Make sure that a 'remote' href is available and a URI can be created
    //  from it.
    if (TP.notEmpty(remoteHref = this.getAttribute('remote'))) {
        if (!TP.isURI(remoteURI = TP.uc(remoteHref))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  Raise an exception
        return;
    }

    //  We also need to make sure that we have a 'local' href attribute and we
    //  can make a URI from it.
    if (TP.notEmpty(localHref = this.getAttribute('local'))) {
        if (!TP.isURI(localURI = TP.uc(localHref))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  Raise an exception
        return;
    }

    //  Grab the content of the local URI.
    content = localURI.getResource();

    //  Default the 'update' verb to TP.HTTP_PUT, unless the element has an
    //  attribute of 'updateVerb'.
    verb = TP.ifEmpty(this.getAttribute('updateVerb'), TP.HTTP_PUT);

    //  The parameters to the save call should specify the verb and force a
    //  refresh.
    saveParams = TP.hc('verb', verb, 'refresh', true);
    saveRequest = remoteURI.constructRequest(saveParams);

    //  If we have a 'status' attribute, it will contain a path that can be used
    //  to fetch the element on the page that we can set the content of with any
    //  status codes and messages.
    if (TP.notEmpty(statusID = this.getAttribute('status', true))) {
        statusTPElem =
                TP.wrap(TP.byPath(statusID, this.getNativeDocument(), true));
    }

    //  If the content is an XML node, then stringify it.
    if (TP.isXMLNode(content)) {
        content = TP.str(content);
    } else {
        //  Otherwise, JSONify it.
        content = TP.json(content);
    }

    thisArg = this;

    //  Add a 'local' method on the individual object that defines a handler for
    //  when the request succeeds.
    saveRequest.defineMethod('handleRequestSucceeded',
        function(aResponse) {

            //  If there is a status element, then report the status code and
            //  text, supplying the request object as the parameter to these
            //  internal calls.
            if (TP.isValid(statusTPElem)) {
                statusTPElem.setContent(
                'Status code: ' + thisArg.$getHTTPRequestStatusCode(this) +
                ' Status text: ' + thisArg.$getHTTPRequestResponseText(this));
            }

            if (!TP.isCallable(thisArg.get('refreshHandler'))) {
                thisArg.load();
            }
        });

    saveRequest.defineMethod('handleRequestFailed',
        function(aResponse) {

            //  If there is a status element, then report the status code and
            //  text, supplying the request object as the parameter to these
            //  internal calls.
            if (TP.isValid(statusTPElem)) {
                statusTPElem.setContent(
                'Status code: ' + thisArg.$getHTTPRequestStatusCode(this) +
                ' Status text: ' + thisArg.$getHTTPRequestResponseText(this));
            }
        });

    //  Set the content of the remote resource to the content we want to send.
    remoteURI.setResource(content);

    //  Do the work to actually store the data.
    remoteURI.save(saveRequest);

    return this;
});

//  ------------------------------------------------------------------------
//  TEMPORARY METHODS
//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('$getHTTPRequestStatusCode',
function(aRequest) {

    //  TODO: A hack until we can get this fixed in request/response

    return aRequest.getChildJoins(TP.AND).
                                    first().
                                    getResponse().
                                    getResponseStatusCode();
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('$getHTTPRequestResponseText',
function(aRequest) {

    //  TODO: A hack until we can get this fixed in request/response

    return aRequest.getChildJoins(TP.AND).
                                    first().
                                    getResponse().
                                    getResponseText();
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('enableAutoRefresh',
function() {

    var refreshHandler,
        newSource;

    //  TODO: A hack for CouchDB demo purposes only.

    newSource = TP.core.SSESignalSource.construct(
                    'http://127.0.0.1:5984/goodata/_changes?feed=eventsource');

    refreshHandler = function (aSignal) {
        var payload;

        if (TP.isValid(payload = aSignal.getPayload())) {
            //  TP.info('signame: ' + aSignal.getSignalName() +
            //          ' payload: ' + payload.asString(),
            //          TP.LOG);
            if (TP.json2js(payload.get('data')).at('id') === 'football_info') {
                this.load();
            }
        } else {
            //  TP.info('signame: ' + aSignal.getSignalName(), TP.LOG);
            void 0;
        }
    }.bind(this);

    //  Observe the signal stream
    refreshHandler.observe(newSource, 'TP.sig.SourceDataReceived');

    this.set('refreshHandler', refreshHandler);
    this.set('refreshSource', newSource);

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('disableAutoRefresh',
function() {

    //  TODO: A hack for CouchDB demo purposes only.

    var refreshHandler;

    if (TP.isCallable(refreshHandler = this.get('refreshHandler'))) {
        //  Ignore the signal stream
        refreshHandler.ignore(this.get('refreshSource'),
                                'TP.sig.SourceDataReceived');
        this.set('refreshHandler', null);
        this.set('refreshSource', null);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
