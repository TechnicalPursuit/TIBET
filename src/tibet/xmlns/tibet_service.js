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

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The current href value.
TP.tibet.service.Inst.defineAttribute('$hrefValue');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TEMPORARY METHODS
//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('$getHTTPRequestStatusCode',
function(aRequest) {

    //  TODO: A hack until we can get this fixed in request/response

    return aRequest.getChildJoins(TP.AND).
                                    first().
                                    getResponse().
                                    getResponseStatusCode();
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('$getHTTPRequestResponseText',
function(aRequest) {

    //  TODO: A hack until we can get this fixed in request/response

    return aRequest.getChildJoins(TP.AND).
                                    first().
                                    getResponse().
                                    getResponseText();
});

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

TP.tibet.service.Inst.defineMethod('getAttrHref',
function() {

    /**
     * @method getAttrHref
     * @summary Returns the current 'href' value, which may be an attribute or a
     *     value resolved from a binding.
     * @returns {String} The current 'href' value for the receiver.
     */

    var val;

    if (TP.notEmpty(val = this.get('$hrefValue'))) {
        return val;
    }

    return this.$getAttribute('href');
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('setAttrHref',
function(hrefVal) {

    /**
     * @method setAttrHref
     * @summary Sets the 'href' value for the receiver. This will normally be
     *     triggered by the data binding machinery if the attribute is data
     *     bound.
     * @param {String} hrefVal The value to set the 'href' to.
     * @returns {TP.tibet.service} The receiver.
     */

    this.set('$hrefValue', hrefVal, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('trigger',
function() {

    /**
     * @method trigger
     * @summary This method causes the receiver to perform it's 'action'. In
     * this case, sending data to a remote URI endpoint.
     * @returns {TP.tibet.data} The receiver.
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
                        var val;

                        if (!TP.isURI(val = TP.uc(anHref))) {
                            //  Raise an exception
                            return this.raise('TP.sig.InvalidURI');
                        }

                        bodyURIs.push(val);
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
    request.defineMethod('handleRequestSucceeded',
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
                }

                //  If the named URI has existing data, then we signal
                //  'TP.sig.UIDataDestruct'.
                if (TP.notEmpty(resultURI.getResource())) {
                    thisArg.signal('TP.sig.UIDataDestruct');
                }

                //  Set the resource to the new resource (causing any observers
                //  of the URI to get notified of a change) and signal
                //  'TP.sig.UIDataConstruct'.
                resultURI.setResource(result);
                thisArg.signal('TP.sig.UIDataConstruct');

                //  Signal 'TP.sig.DOMReady' for consistency with other elements
                //  that signal this when their 'dynamic content' is resolved.
                thisArg.signal('TP.sig.DOMReady');
            }
        });

    request.defineMethod('handleRequestFailed',
        function(aResponse) {

            var errorRecord;

            //  TODO: This is a bit hackish and assumes that the request was an
            //  HTTP request.
            errorRecord = TP.hc(
                'code', thisArg.$getHTTPRequestStatusCode(this),
                'text', thisArg.$getHTTPRequestResponseText(this));

            thisArg.signal('TP.sig.UIDataFailed', errorRecord);
        });

    dataWillSendSignal = this.signal('TP.sig.UIDataWillSend');
    if (dataWillSendSignal.shouldPrevent()) {
        //  TODO: Log a warning?
        return this;
    }

    //  Do the work.

    //  Process any custom headers
    if (TP.isURI(headersURI) &&
        TP.isValid(headerContent =
                    headersURI.getResource(TP.hc('async', false)))) {
        headerContent = headerContent.get('value');
        headerContent = TP.hc(headerContent).copy();
        request.atPut('headers', headerContent);
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
                            var bodyVal;

                            if (TP.isValid(
                                    bodyVal = aURI.getResource(
                                                    TP.hc('async', false)))) {
                                bodyVal = bodyVal.get('value');
                            }

                            bodyContent.push(TP.hc('body', bodyVal));
                        });

                uri.setResource(bodyContent);
                uri.save(request);

                break;
            }
        /* eslint-enable no-fallthrough */
        case TP.HTTP_PUT:
            if (TP.isURI(val = bodyURIs.first()) &&
                TP.isValid(bodyContent =
                            val.getResource(TP.hc('async', false)))) {
                bodyContent = bodyContent.get('value');
                uri.setResource(bodyContent);
                uri.save(request);
            }
            break;
        case TP.HTTP_DELETE:
            uri.nuke(request);
            break;
    }

    //  Signal the fact that we're doing the work.
    this.signal('TP.sig.UIDataSent');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
