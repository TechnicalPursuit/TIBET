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
 * @type {TP.http.service}
 * @summary A subtype of TP.tibet.service that exposes a remote HTTP service
 *     endpoint in markup.
 */

//  ------------------------------------------------------------------------

TP.tibet.service.defineSubtype('http.service');

//  NB: 'href' for us is a URI attribute, but it's *not* a 'reloadable' URI
//  attribute - we handle reloading specially for this tag.
TP.http.service.Type.set('uriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.http.service.Type.defineMethod('tagAttachData',
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

    //  If the element is being 'recast' (i.e. reprocessed in place, usually
    //  when developing with the Sherpa), then just return here. We don't want
    //  to do any further processing to process/register/unregister data.
    if (tpElem.isRecasting()) {
        return;
    }

    tpElem.setAttribute('statuscode', '');
    tpElem.setAttribute('statustext', '');

    //  Make sure to run the setter for this, if it has a value, as that's where
    //  the watch/unwatch happens.
    if (tpElem.hasAttribute('watched')) {
        tpElem.setAttrWatched(TP.bc(tpElem.getAttribute('watched')));
    } else {
        //  If we didn't have an watched attribute, then just set a blank
        //  one in case anyone is binding to it.
        tpElem.setAttribute('watched', '');
    }

    tpElem.shouldSignalChange(true);

    return;
});

//  ------------------------------------------------------------------------

TP.http.service.Type.defineMethod('tagResolve',
function(aRequest) {

    /**
     * @method tagResolve
     * @summary Resolves the receiver's content. This includes resolving XML
     *     Base URIs and virtual URIs that may occur on the receiver's
     *     attributes.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    //  We return here because we *don't* want our 'href' attribute rewritten.
    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.http.service.Inst.defineAttribute('isActivated');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.http.service.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary This method causes the receiver to perform it's 'action'. In
     *     this case, retrieving or sending data to a remote URI endpoint.
     * @returns {TP.http.service} The receiver.
     */

    var href,
        uri,

        request,

        headersURI,
        bodyURIs,
        resultURI,

        val,

        method,

        thisref,

        hasContentType,

        resp,

        headerContent,
        bodyContent,

        updateUponComplete,

        dataWillSendSignal;

    //  If the element is being 'recast' (i.e. recomputed in place, usually when
    //  developing with the Sherpa), then just return here. We don't want to do
    //  any further processing to process/register/unregister data.
    if (this.isRecasting()) {
        return this;
    }

    //  If we're already activated, just exit here.
    if (TP.isTrue(this.get('isActivated'))) {
        return this;
    }

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

    //  If we're running in headless mode (we're probably testing), then we need
    //  to rewrite the URL to have an HTTP resource.
    if (TP.sys.isHeadless()) {
        href = TP.elementGetAttribute(this.getNativeNode(), 'href', true);

        if (href.startsWith('file:///')) {
            href = href.slice(8);
        } else if (href.startsWith('/')) {
            href = href.slice(1);
        }

        href = TP.uriJoinPaths('http://127.0.0.1:1407', href);

        TP.elementSetAttribute(this.getNativeNode(), 'href', href, true);

        //  Make sure to recompute the URI here.
        uri = TP.uc(href);
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

    //  See if a 'name' href is available and a URI can be created from it.
    if (TP.notEmpty(href = this.getAttribute('name'))) {
        if (!TP.isURI(resultURI = TP.uc(href))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  We might be a 'send only' service tag.
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

            //  Extract the 1...n URIs that comprise the body content.
            href = TP.extractURIs(href);

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

    request.atPut('method', method);

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

    hasContentType = this.hasAttribute('content');

    //  NB: This is the HTTP resultType parameter, not the result type that we
    //  will use to package the data.
    request.atPut('resultType', TP.WRAP);

    thisref = this;

    //  Add a 'local' method on the individual object that defines a handler for
    //  job completion
    request.defineHandler('RequestSucceeded',
        function(aResponse) {

            var contentType,
                result,

                mimeType,

                newResource,
                strResource;

            //  Mark the URI as being loaded, since we marked it as not being so
            //  above. We need to do this manually to ensure that, if the
            //  resource came back the same, this flag gets set back to it's
            //  prior value, which the URI won't do.
            uri.isLoaded(true);

            //  Signal the fact that we've done the work.
            thisref.signal('TP.sig.UIDataReceived');

            //  Check and dispatch a signal from our attributes if one exists
            //  for this signal.
            thisref.dispatchResponderSignalFromAttr('UIDataReceived', null);

            //  We only do this if the result URI is real - some services might
            //  be 'send only' and not define a result URI.
            if (TP.isURI(resultURI)) {

                //  Grab the result from the response.
                result = aResponse.getResult();

                //  If the result is a String, try to turn it into more
                if (TP.isString(result)) {

                    //  Obtain a MIME type for the result and use it to obtain a
                    //  result type.
                    mimeType = TP.ietf.mime.guessMIMEType(result, uri);

                    contentType = thisref.getContentType(mimeType);

                    //  If a result type couldn't be determined, then just use
                    //  String.
                    if (!TP.isType(contentType)) {
                        contentType = String;
                    }

                    //  If the new resource result is a content object of some
                    //  sort (highly likely) then we should initialize it with
                    //  both the content String and the URI that it should be
                    //  associated with. The content object type will convert it
                    //  from a String to the proper type.
                    if (TP.isSubtypeOf(contentType, TP.core.Content)) {
                        newResource = contentType.construct(result, resultURI);
                        if (this.hasAttribute('buildout')) {
                            newResource.set(
                                    'buildout',
                                    TP.bc(this.getAttribute('buildout')));
                        }
                    } else {
                        strResource = TP.str(result);
                        if (contentType === String) {
                            newResource = strResource;
                        } else {
                            newResource = contentType.from(strResource);
                        }
                    }

                } else if (TP.isNode(result)) {
                    newResource = TP.wrap(result);
                } else {
                    newResource = result;
                }

                //  If the named URI has existing data, then we signal
                //  'TP.sig.UIDataDestruct'.

                //  NB: We assume 'async' of false here.
                if (TP.notEmpty(resultURI.getResource().get('result'))) {

                    thisref.signal('TP.sig.UIDataDestruct');

                    //  Check and dispatch a signal from our attributes if one
                    //  exists for this signal.
                    thisref.dispatchResponderSignalFromAttr(
                                                'UIDataDestruct', null);
                }

                //  Set the resource to the new resource (causing any observers
                //  of the URI to get notified of a change) and signal
                //  'TP.sig.UIDataConstruct'.
                resultURI.setResource(
                    newResource,
                    TP.hc('observeResource', true, 'signalChange', true));

                thisref.signal('TP.sig.UIDataConstruct');

                //  Check and dispatch a signal from our attributes if one
                //  exists for this signal.
                thisref.dispatchResponderSignalFromAttr(
                                                'UIDataConstruct', null);

                //  Dispatch 'TP.sig.DOMReady' for consistency with other
                //  elements that dispatch this when their 'dynamic content' is
                //  resolved. Note that we use 'dispatch()' here because this is
                //  a DOM signal and we want all of the characteristics of a DOM
                //  signal.
                thisref.dispatch('TP.sig.DOMReady');
            }
        });

    request.defineHandler('RequestFailed',
        function(aResponse) {

            var errorRecord,

                statusCode,
                statusText;

            //  If we can retrieve a communications object (an XHR for HTTP
            //  comm, or an emulated object for others), then we can extract a
            //  status code and status text from it.
            if (TP.canInvoke(uri, 'getCommObject')) {
                statusCode = uri.getCommStatusCode();
                statusText = uri.getCommStatusText();

                errorRecord = TP.hc('code', statusCode, 'text', statusText);
            } else {
                errorRecord = null;
            }

            thisref.signal('TP.sig.UIDataFailed', errorRecord);

            //  Check and dispatch a signal from our attributes if one exists
            //  for this signal.
            thisref.dispatchResponderSignalFromAttr('UIDataFailed', null);
        });

    //  Initially, set the 'update URI upon completion' flag to false. Some
    //  calls, like PUT, POST and DELETE, will update the URI with their result
    //  upon completion.
    updateUponComplete = false;

    request.defineHandler('RequestCompleted',
        function(aResponse) {

            var statusCode,
                statusText,

                updateURI,
                responseBodyContent;

            //  If we can retrieve a communications object (an XHR for HTTP
            //  comm, or an emulated object for others), then we can extract a
            //  status code and status text from it.
            if (TP.canInvoke(uri, 'getCommObject')) {
                statusCode = uri.getCommStatusCode();
                statusText = uri.getCommStatusText();

                thisref.setAttribute('statuscode', statusCode);
                thisref.setAttribute('statustext', statusText);
            }

            //  If we're updating the URI when complete, then do so here. Note
            //  that we only update the first body URI (if we were sending
            //  multipart, there will be multiple body URIs).
            if (updateUponComplete && TP.notEmpty(bodyURIs)) {

                updateURI = bodyURIs.first();

                responseBodyContent = uri.getResource(
                                    TP.hc('async', false,
                                            'refresh', false)).get('result');
                responseBodyContent = TP.copy(responseBodyContent);

                if (TP.isKindOf(responseBodyContent, TP.core.Content)) {
                    responseBodyContent.set('sourceURI', updateURI, false);
                }

                updateURI.setResource(responseBodyContent);
            }

            //  Mark us as no longer being activated
            this.set('isActivated', false);
        }.bind(this));

    dataWillSendSignal = this.signal('TP.sig.UIDataWillSend');
    if (dataWillSendSignal.shouldPrevent()) {
        //  TODO: Log a warning?
        return this;
    }

    //  Check and dispatch a signal from our attributes if one exists for this
    //  signal.
    this.dispatchResponderSignalFromAttr('UIDataWillSend', null);

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

    //  Mark us as having activated
    this.set('isActivated', true);

    //  If the author determined that they want a specialized result type, then
    //  we just want the TP.TEXT back from these calls to the server. We'll do
    //  the data conversion above in the RequestSucceeded handler method.
    if (hasContentType) {
        request.atPut('resultType', TP.TEXT);
    }

    //  Process the method
    switch (request.at('method')) {
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

                    //  Copy the body to be used as the resource of the URI to
                    //  send and, if it's a Content object, update that copy's
                    //  URI to the URI object that we're getting ready to send..
                    bodyContent = TP.copy(bodyContent);
                    if (TP.isKindOf(bodyContent, TP.core.Content)) {
                        bodyContent.set('sourceURI', uri, false);
                    }

                    uri.setResource(bodyContent);
                } else {
                    uri.setResource('');
                }
            } else {
                uri.setResource('');
            }

            //  We want to update the URI with the results when we complete the
            //  remote call.
            updateUponComplete = true;

            //  Set 'refresh' to false - we're not interested in what the server
            //  currently has.
            request.atPut('refresh', false);

            uri.save(request);

            break;
        case TP.HTTP_DELETE:

            //  We want to update the URI with the results when we complete the
            //  remote call.
            updateUponComplete = true;

            uri.delete(request);

            break;
        default:
            this.signal('TP.sig.UIDataFailed');

            //  Check and dispatch a signal from our attributes if one exists
            //  for this signal.
            this.dispatchResponderSignalFromAttr('UIDataFailed', null);
            break;
    }

    //  Signal the fact that we're doing the work.
    this.signal('TP.sig.UIDataSent');

    //  Check and dispatch a signal from our attributes if one exists
    //  for this signal.
    this.dispatchResponderSignalFromAttr('UIDataSent', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.http.service.Inst.defineMethod('setAttrWatched',
function(watchedValue) {

    /**
     * @method setAttrWatched
     * @summary Sets the 'watched' value for the receiver.
     * @param {String} watchedValue A value of 'true' or 'false' as to whether
     *     the remote URI on the receiver should be 'watched' for changes.
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

    val = TP.bc(watchedValue);
    uri.set('watched', val);

    if (val) {
        this.observe(uri, 'TP.sig.ValueChange');
    } else {
        this.ignore(uri, 'TP.sig.ValueChange');
    }

    this.$setAttribute('watched', val);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.http.service.Inst.defineMethod('setAttrHref',
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

TP.http.service.Inst.defineMethod('setFacet',
function(aspectName, facetName, facetValue, shouldSignal) {

    /**
     * @method setFacet
     * @summary Sets the value of the named facet of the named aspect to the
     *     value provided.
     * @param {String} aspectName The name of the aspect to set.
     * @param {String} facetName The name of the facet to set.
     * @param {Boolean} facetValue The value to set the facet to.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    var elem;

    elem = this.getNativeNode();

    //  If we're setting this value due to an update from the binding machinery
    //  and we have awakened and the aspect name isn't one our 'special' ones,
    //  then go ahead and activate.
    if (TP.isTrue(TP.$$settingFromBindMachinery)) {
        if (elem[TP.AWAKENED] &&
            aspectName !== 'watched' &&
            aspectName !== 'href') {
            this.activate();
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
