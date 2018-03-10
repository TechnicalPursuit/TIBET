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
 * @summary A subtype of TP.core.ElementNode that implements the ability to put
 *         'static data' in the page.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet:data');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.data.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description Because tibet:data tag content drives binds and we need to
     *     notify even without a full page load, we notify from here once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    //  If the element is being 'recast' (i.e. recompiled in place, usually when
    //  developing with the Sherpa), then just return here. We don't want to do
    //  any further processing to process/register/unregister data.
    if (tpElem.isRecasting()) {
        return;
    }

    //  Start off by 'resetting' the element. This will set up all of the data
    //  structures, etc.
    tpElem.reset();

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Type.defineMethod('tagDetachData',
function(aRequest) {

    /**
     * @method tagDetachData
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        namedHref,
        namedURI,

        resource,

        tpElem;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    tpElem = TP.wrap(elem);

    //  If the element is being 'recast' (i.e. recompiled in place, usually when
    //  developing with the Sherpa), then just return here. We don't want to do
    //  any further processing to process/register/unregister data.
    if (tpElem.isRecasting()) {
        return;
    }

    //  If we're not empty, then we use our child content as our 'named'
    //  resource's content and ignore any 'remote' URI attribute.
    if (TP.notEmpty(elem.childNodes)) {

        if (TP.notEmpty(namedHref = TP.elementGetAttribute(elem, 'name'))) {
            if (!TP.isURI(namedURI = TP.uc(namedHref))) {
                //  Raise an exception
                return this.raise('TP.sig.InvalidURI');
            }
        } else {
            //  No 'name' attribute.
            return;
        }

        //  If the new resource result is a content object of some sort (highly
        //  likely) then it should respond to 'setData' so set its data to null
        //  (which will cause it to ignore its data for *Change signals).

        //  NB: We assume 'async' of false here.
        resource = namedURI.getResource().get('result');
        if (TP.canInvoke(resource, 'setData')) {
            resource.setData(null);
        }

        namedURI.unregister();

        //  We're done with this data - signal 'TP.sig.UIDataDestruct'.
        tpElem.signal('TP.sig.UIDataDestruct');

        //  Check and dispatch a signal from our attributes if one exists for
        //  this signal.
        tpElem.dispatchResponderSignalFromAttr('UIDataDestruct', null);
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('getNamedResource',
function() {

    /**
     * @method getNamedResource
     * @returns {Object} Returns the resource named by the receiver.
     */

    var namedHref,
        namedURI;

    if (TP.notEmpty(namedHref = this.getAttribute('name'))) {
        if (!TP.isURI(namedURI = TP.uc(namedHref))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  No 'name' attribute.
        return null;
    }

    //  NB: We assume 'async' of false here.
    return namedURI.getResource().get('result');
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('getResultType',
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
            case TP.XHTML_ENCODED:
            case TP.XSLT_ENCODED:
            case TP.ATOM_ENCODED:
            case TP.XMLRPC_ENCODED:
            case TP.SOAP_ENCODED:

                tibetType = TP.core.XMLContent;

                break;

            default:
                tibetType = String;
        }
    }

    return tibetType;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('isReadyToRender',
function() {

    /**
     * @method isReadyToRender
     * @summary Whether or not the receiver is 'ready to render'. For this type,
     *     this always returns true.
     * @returns {Boolean} Whether or not the receiver is ready to render.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('reset',
function() {

    /**
     * @method reset
     * @summary Resets the receiver to have the data structures and content as
     *     originally authored by the page author.
     * @returns {TP.tibet.data} The receiver.
     */

    var elem,
        namedHref,
        children,
        cdatas,
        resourceStr;

    elem = this.getNativeNode();

    //  If we're not empty, then we use our child content as our 'named'
    //  resource's content.
    if (TP.notEmpty(elem.childNodes)) {

        namedHref = this.getAttribute('name');
        if (!TP.isURI(TP.uc(namedHref))) {
            return this.raise('TP.sig.InvalidURI');
        }

        //  NOTE: logic here focuses on the native node since we want to
        //  manipulate native node objects here.

        //  Normalize the node to try to get the best representation.
        TP.nodeNormalize(elem);

        //  Get a result type for the data (either defined on the receiver
        //  element itself or from a supplied MIME type), construct an instance
        //  of that type and set it as the named URI's resource.

        //  If there is a CDATA section, then we grab it's text value...it's
        //  probably JSON data.
        cdatas = TP.nodeGetDescendantsByType(elem, Node.CDATA_SECTION_NODE);
        if (TP.notEmpty(cdatas)) {
            //  The string we'll use is from the first CDATA.
            resourceStr = TP.nodeGetTextContent(cdatas.first());
        } else {
            children = TP.nodeGetChildElements(elem);

            //  We rely on the first child element to be XML for usable data.
            if (TP.isXMLNode(children.first())) {
                if (children.getSize() > 1) {
                    return this.raise(
                            'TP.sig.InvalidNode',
                            'tibet:data elements do not support fragments.');
                }

                //  Stringify the XML for use in our upcoming setContent call.
                resourceStr = TP.str(children.first());
            }
        }

        if (TP.notEmpty(resourceStr)) {
            //  A bit strange to remove content into string form only to set it
            //  again, but the setContent step forces interpretation of the data
            //  into our URI, triggers the right change notifications etc.
            this.setContent(resourceStr);
        }
    } else {
        return this.raise('TP.sig.InvalidNode');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {null}
     */

    var namedHref,
        namedURI,

        mimeType,
        resultType,

        newResource,

        isValid;

    this.callNextMethod();

    if (TP.notEmpty(namedHref = this.getAttribute('name'))) {
        if (!TP.isURI(namedURI = TP.uc(namedHref))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  No 'name' attribute.
        return null;
    }

    if (TP.isEmpty(mimeType = this.getAttribute('type'))) {
        mimeType = TP.ietf.mime.guessMIMEType(aContentObject);
    }

    //  If the MIME type that was computed is text/plain, then something
    //  probably went wrong (i.e. the data couldn't be parsed) and so we warn
    //  about that.
    if (mimeType === TP.PLAIN_TEXT_ENCODED) {
        TP.ifWarn() ?
            TP.warn('Computed a content type of text/plain for' +
                    ' <tibet:data/> with id: ' +
                    this.getAttribute('id') + '.') : 0;
    }

    //  Obtain a MIME type for the result and use it to obtain a result type.
    resultType = this.getResultType(mimeType);

    //  If a result type couldn't be determined, then just use String.
    if (!TP.isType(resultType)) {
        resultType = String;
    }

    //  Make sure that it's valid for its container. Note that we pass 'false'
    //  as a second parameter here for content objects that do both trivial and
    //  full facet checks on their data. We only want trival checks here (i.e.
    //  is the XML inside of a TP.core.XMLContent really XML - same for JSON)
    isValid = resultType.validate(aContentObject, false);
    if (!isValid) {
        return this.raise('TP.sig.InvalidValue');
    }

    //  If the new resource result is a content object of some sort (highly
    //  likely) then we should initialize it with both the content String and
    //  the URI that it should be associated with. The content object type will
    //  convert it from a String to the proper type.
    if (TP.isSubtypeOf(resultType, TP.core.Content)) {
        newResource = resultType.construct(aContentObject, namedURI);
    } else if (resultType === String) {
        newResource = TP.str(aContentObject);
    }

    //  If the named URI has existing data, then we signal
    //  'TP.sig.UIDataDestruct'.
    //  NB: We assume 'async' of false here.
    if (TP.notEmpty(namedURI.getResource().get('result'))) {
        this.signal('TP.sig.UIDataDestruct');

        //  Check and dispatch a signal from our attributes if one exists for
        //  this signal.
        this.dispatchResponderSignalFromAttr('UIDataDestruct', null);
    }

    //  Set the resource to the new resource (causing any observers of the URI
    //  to get notified of a change) and signal 'TP.sig.UIDataConstruct'.
    namedURI.setResource(
        newResource,
        TP.hc('observeResource', true, 'signalChange', true));

    this.signal('TP.sig.UIDataConstruct');

    //  Check and dispatch a signal from our attributes if one exists for this
    //  signal.
    this.dispatchResponderSignalFromAttr('UIDataConstruct', null);

    //  Dispatch 'TP.sig.DOMReady' for consistency with other elements that
    //  dispatch this when their 'dynamic content' is resolved. Note that we use
    //  'dispatch()' here because this is a DOM signal and we want all of the
    //  characteristics of a DOM signal.
    this.dispatch('TP.sig.DOMReady');

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
