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
 * @type {TP.tibet.service}
 * @summary A subtype of TP.core.ElementNode that exposes a remote service
 *     endpoint in markup.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet.service');

//  NB: 'href' for us is a URI attribute, but it's *not* a 'reloadable' URI
//  attribute - we handle reloading specially for this tag.
TP.tibet.service.Type.set('uriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.service.Type.defineMethod('tagAttachData',
function(aRequest) {

    /**
     * @method tagAttachData
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.setAttribute('statuscode', '');
    tpElem.setAttribute('statustext', '');

    //  Make sure to run the setter for this, if it has a value, as that's where
    //  the watch/unwatch happens.
    if (tpElem.hasAttribute('autorefresh')) {
        tpElem.setAttrAutorefresh(TP.bc(tpElem.getAttribute('autorefresh')));
    } else {
        //  If we didn't have an autorefresh attribute, then just set a blank
        //  one in case anyone is binding to it.
        tpElem.setAttribute('autorefresh', '');
    }

    tpElem.shouldSignalChange(true);

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        sigName;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Grab a wrapped version of the element.
    tpElem = TP.wrap(elem);

    //  If it has an 'activateOn' attribute, then the author wants us to
    //  activate when that signal is fired.
    if (tpElem.hasAttribute('activateOn')) {

        //  Get the signal name and normalize it.
        sigName = tpElem.getAttribute('activateOn');
        sigName = TP.expandSignalName(sigName);

        //  If 'TP.sig.AttachComplete', then 'just do it'
        if (sigName === 'TP.sig.AttachComplete') {
            tpElem.trigger();
        } else {
            //  Otherwise, observe the signal and install a local method that
            //  will trigger us when the signal is handled.
            tpElem.observe(tpElem, sigName);
            tpElem.defineMethod(
                    TP.escapeTypeName(sigName),
                    function(aSignal) {
                        this.trigger();
                    });
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Type.defineMethod('tagDetachComplete',
function(aRequest) {

    /**
     * @method tagDetachComplete
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        sigName;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    tpElem = TP.wrap(elem);

    //  If it has an 'activateOn' attribute, then the author wanted us to
    //  activate when that signal is fired and we set up a handler in the
    //  'tagAttachComplete' method above. We need to ignore that signal now.
    if (tpElem.hasAttribute('activateOn')) {

        //  Get the signal name and normalize it.
        sigName = tpElem.getAttribute('activateOn');
        sigName = TP.expandSignalName(sigName);

        //  Ignore any 'activateOn' signal that we were set up to observe.
        tpElem.ignore(tpElem, sigName);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Type.defineMethod('tagDetachData',
function(aRequest) {

    /**
     * @method tagDetachData
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        resultHref,
        resultURI,

        resource;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    if (TP.notEmpty(resultHref = TP.elementGetAttribute(elem, 'result'))) {
        if (!TP.isURI(resultURI = TP.uc(resultHref))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    }

    //  If the new resource result is a content object of some sort (highly
    //  likely) then it should respond to 'setData' so set its data to null
    //  (which will cause it to ignore its data for *Change signals).

    //  NB: We assume 'async' of false here.
    resource = resultURI.getResource().get('result');
    if (TP.canInvoke(resource, 'setData')) {
        resource.setData(null);
    }

    resultURI.unregister();

    //  We're done with this data - signal 'TP.sig.UIDataDestruct'.
    TP.wrap(elem).signal('TP.sig.UIDataDestruct');

    return;
});

//  ------------------------------------------------------------------------
//  TEMPORARY METHODS
//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('$getHTTPRequestStatusCode',
function(aRequest) {

    var descendantJoins,

        i,
        join;

    //  TODO: A hack until we can get this fixed in request/response

    descendantJoins = aRequest.getDescendantJoins(TP.AND);

    for (i = 0; i < descendantJoins.getSize(); i++) {
        join = descendantJoins.at(i);
        if (TP.isKindOf(join, TP.sig.HTTPRequest)) {
            return join.getResponse().getResponseStatusCode();
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('$getHTTPRequestStatusText',
function(aRequest) {

    var descendantJoins,

        i,
        join;

    //  TODO: A hack until we can get this fixed in request/response

    descendantJoins = aRequest.getDescendantJoins(TP.AND);

    for (i = 0; i < descendantJoins.getSize(); i++) {
        join = descendantJoins.at(i);
        if (TP.isKindOf(join, TP.sig.HTTPRequest)) {
            return join.getResponse().getResponseStatusText();
        }
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('getResultType',
function(mimeType) {

    /**
     * @method getResultType
     * @summary Returns a result type that will either be a TIBET type from the
     *     name specified by the 'resultType' attribute on the receiver or, if
     *     that's not defined, the MIME type supplied to this method.
     * @param {String} mimeType The MIME type of the data. This will be used to
     *     guess the data type if the receiver doesn't have a 'resultType'
     *     defined on it.
     * @returns {TP.meta.lang.RootObject|String} The type object (or String as
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

TP.tibet.service.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles notification of a change.
     * @description This is triggered if we're watching the remote resource
     *     referenced by our 'href'.
     * @param {TP.sig.Signal} aSignal The signal instance to respond to.
     */

    this.trigger();

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('setAttrAutorefresh',
function(refreshValue) {

    /**
     * @method setAttrAutorefresh
     * @summary Sets the 'autorefresh' value for the receiver.
     * @param {String} refreshValue
     */

    var href,
        uri,
        val;

    //  Make sure that a main href is available and a URI can be created from
    //  it.
    if (TP.notEmpty(href = this.getAttribute('href'))) {
        if (!TP.isURI(uri = TP.uc(href))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  Raise an exception
        return this;
    }

    val = TP.bc(refreshValue);
    uri.set('autoRefresh', val);

    if (val) {
        this.observe(uri, 'TP.sig.ValueChange');
    } else {
        this.ignore(uri, 'TP.sig.ValueChange');
    }

    this.$setAttribute('autorefresh', val);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('setAttrHref',
function(anHref) {

    /**
     * @method setAttrHref
     * @summary Sets the 'href' value for the receiver. This will normally be
     *     triggered by the data binding machinery if the attribute is data
     *     bound.
     * @param {String} anHref The value to set the 'href' to.
     */

    this.$setAttribute('href', anHref);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('trigger',
function() {

    /**
     * @method trigger
     * @summary This method causes the receiver to perform it's 'action'. In
     * this case, sending data to a remote URI endpoint.
     * @returns {TP.tibet.service} The receiver.
     */

    var href,
        uri,

        request,

        headersURI,
        bodyURIs,
        resultURI,

        val,

        method,

        thisArg,

        resp,

        headerContent,
        bodyContent,

        dataWillSendSignal;

    //  Make sure that a main href is available and a URI can be created from
    //  it.
    if (TP.notEmpty(href = this.getAttribute('href'))) {
        if (!TP.isURI(uri = TP.uc(href))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  Raise an exception
        return this;
    }

    //  Configure the main URI to force a refresh of its contents.
    request = TP.request(TP.hc('refresh', true));

    //  See if a 'headers' href is available and a URI can be created from it.
    if (TP.notEmpty(href = this.getAttribute('headers'))) {
        if (!TP.isURI(headersURI = TP.uc(href))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  We might not be using extra headers
        void 0;
    }

    //  See if a 'result' href is available and a URI can be created from it.
    if (TP.notEmpty(href = this.getAttribute('result'))) {
        if (!TP.isURI(resultURI = TP.uc(href))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  We might have a 'send only' service.
        void 0;
    }

    //  If there's an HTTP method, use it - otherwise default to GET.
    if (TP.notEmpty(val = this.getAttribute('method'))) {
        method = val;
    } else {
        method = TP.HTTP_GET;
    }

    //  If a 'multipart' attribute is defined then use it as part of the mime
    //  type (prepended with 'multipart/') and configure the individual part
    //  mimetypes into the 'multiparttypes' slot on the request.
    if (TP.notEmpty(val = this.getAttribute('multipart'))) {
        request.atPut('mimetype', 'multipart/' + val);
        //  The mime types for the individual will be a space separated list
        //  under 'mimetype' - they need to go into 'multiparttypes'
        if (TP.notEmpty(val = this.getAttribute('mimetype'))) {
            request.atPut('multiparttypes', val.split(' '));
        }
    } else if (TP.notEmpty(val = this.getAttribute('mimetype'))) {
        request.atPut('mimetype', val);
    }

    //  If we're doing a POST or a PUT, see if a 'body' href is available and a
    //  URI can be created from it.
    if (method === TP.HTTP_POST || method === TP.HTTP_PUT) {

        bodyURIs = TP.ac();

        //  If it's multipart, there may be multiple space-separated URIs
        if (TP.notEmpty(href = this.getAttribute('body'))) {
            href = href.split(' ');
            href.perform(
                    function(anHref) {
                        var hrefURI;

                        if (!TP.isURI(hrefURI = TP.uc(anHref))) {
                            //  Raise an exception
                            return this.raise('TP.sig.InvalidURI');
                        }

                        bodyURIs.push(hrefURI);
                    }.bind(this));
        }
    }

    request.atPut('verb', method);

    //  Mark the URI as 'not loaded' to ensure that it will force TIBET to
    //  load data from the underlying source.
    uri.isLoaded(false);

    //  Set up a variety of other TIBETan properties of the call

    if (TP.notEmpty(val = this.getAttribute('async'))) {
        request.atPut('async', TP.bc(val));
    } else {
        request.atPut('async', true);
    }

    if (TP.notEmpty(val = this.getAttribute('timeout'))) {
        if (TP.isNumber(val = parseInt(val, 10))) {
            val = val.asDuration();
        }
        request.atPut('timeout', Date.getMillisecondsInDuration(val));
    }

    if (TP.notEmpty(val = this.getAttribute('encoding'))) {
        request.atPut('encoding', val);
    }

    if (TP.notEmpty(val = this.getAttribute('separator'))) {
        request.atPut('separator', val);
    }

    //  NB: This is the HTTP resultType parameter, not the result type that we
    //  will use to package the data.
    request.atPut('requestType', TP.WRAP);

    thisArg = this;

    //  Add a 'local' method on the individual object that defines a handler for
    //  job completion
    request.defineHandler('RequestSucceeded',
        function(aResponse) {

            var resultType,
                result,

                mimeType;

            //  Signal the fact that we've done the work.
            thisArg.signal('TP.sig.UIDataReceived');

            //  We only do this if the result URI is real - some services might
            //  be 'send only' and not define a result URI.
            if (TP.isURI(resultURI)) {

                //  Grab the result from the response.
                result = aResponse.getResult();

                //  If the result is a String, try to turn it into more
                if (TP.isString(result)) {

                    //  Obtain a MIME type for the result and use it to obtain a
                    //  result type.
                    mimeType = TP.ietf.Mime.guessMIMEType(result, uri);

                    resultType = thisArg.getResultType(mimeType);
                    result = resultType.construct(result);
                } else if (TP.isNode(result)) {
                    result = TP.wrap(result);
                }

                //  If the named URI has existing data, then we signal
                //  'TP.sig.UIDataDestruct'.

                //  NB: We assume 'async' of false here.
                if (TP.notEmpty(resultURI.getResource().get('result'))) {
                    thisArg.signal('TP.sig.UIDataDestruct');
                }

                //  Set the resource to the new resource (causing any observers
                //  of the URI to get notified of a change) and signal
                //  'TP.sig.UIDataConstruct'.
                resultURI.setResource(result);
                thisArg.signal('TP.sig.UIDataConstruct');

                //  Dispatch 'TP.sig.DOMReady' for consistency with other
                //  elements that dispatch this when their 'dynamic content' is
                //  resolved. Note that we use 'dispatch()' here because this is
                //  a DOM signal and we want all of the characteristics of a DOM
                //  signal.
                thisArg.dispatch('TP.sig.DOMReady');
            }
        });

    request.defineHandler('RequestFailed',
        function(aResponse) {

            var errorRecord,

                statusCode,
                statusText;

            //  If this wasn't an HTTP request, these will return null.
            statusCode = thisArg.$getHTTPRequestStatusCode(this);
            statusText = thisArg.$getHTTPRequestStatusText(this);

            //  TODO: This is a bit hackish and assumes that the request was
            //  an HTTP request.
            errorRecord = TP.hc('code', statusCode, 'text', statusText);

            thisArg.signal('TP.sig.UIDataFailed', errorRecord);
        });

    request.defineHandler('RequestCompleted',
        function(aResponse) {

            var statusCode,
                statusText;

            //  If this wasn't an HTTP request, these will return null.
            statusCode = thisArg.$getHTTPRequestStatusCode(this);
            statusText = thisArg.$getHTTPRequestStatusText(this);

            thisArg.setAttribute('statuscode', statusCode);
            thisArg.setAttribute('statustext', statusText);
        });

    dataWillSendSignal = this.signal('TP.sig.UIDataWillSend');
    if (dataWillSendSignal.shouldPrevent()) {
        //  TODO: Log a warning?
        return this;
    }

    //  Do the work.

    //  Process any custom headers
    if (TP.isURI(headersURI)) {

        //  NB: We assume 'async' of false here.
        resp = headersURI.getResource(TP.hc('async', false));

        if (TP.isValid(headerContent = resp.get('result'))) {
            headerContent = headerContent.get('value');
            headerContent = TP.hc(headerContent).copy();
            request.atPut('headers', headerContent);
        }
    }

    //  Process the verb
    switch (request.at('verb')) {
        case TP.HTTP_GET:
            uri.getResource(request);
            break;
        /* eslint-disable no-fallthrough */
        case TP.HTTP_POST:

            //  NB: If we're not a multi-part post, we fall through to the logic
            //  we share with PUT below.
            if (TP.notEmpty(this.getAttribute('multipart'))) {

                bodyContent = TP.ac();
                bodyURIs.perform(
                        function(aURI) {
                            var bodyResp,
                                bodyVal;

                            //  NB: We assume 'async' of false here.
                            bodyResp = aURI.getResource(TP.hc('async', false));

                            if (TP.isValid(bodyVal = bodyResp.get('result'))) {
                                bodyVal = bodyVal.get('value');
                            }

                            bodyContent.push(TP.hc('body', bodyVal));
                        });

                uri.setResource(bodyContent);

                //  Set 'refresh' to false - we're not interested in what the
                //  server currently has.
                request.atPut('refresh', false);

                uri.save(request);

                break;
            }
        /* eslint-enable no-fallthrough */
        case TP.HTTP_PUT:

            if (TP.isURI(val = bodyURIs.first())) {

                //  NB: We assume 'async' of false here.
                resp = val.getResource(TP.hc('async', false));
                bodyContent = resp.get('result');

                //  If we had a body, set the resource of the URI to it. We
                //  might not - we might have a simple payload in the query.
                if (TP.isValid(bodyContent)) {
                    bodyContent = bodyContent.get('value');
                    uri.setResource(bodyContent);
                } else {
                    uri.setResource('');
                }
            } else {
                uri.setResource('');
            }

            //  Set 'refresh' to false - we're not interested in what the server
            //  currently has.
            request.atPut('refresh', false);

            uri.save(request);

            break;
        case TP.HTTP_DELETE:
            uri.nuke(request);

            break;
        default:
            this.signal('TP.sig.UIDataFailed');
            break;
    }

    //  Signal the fact that we're doing the work.
    this.signal('TP.sig.UIDataSent');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
