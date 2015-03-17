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

TP.tibet.data.Type.defineMethod('tagAttachData',
function(aRequest) {

    /**
     * @method tagAttachData
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        namedHref,
        namedURI,

        children,
        cdatas,

        resourceStr,

        resultType,

        thisTPDoc,
        loadedHandler;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    tpElem = TP.wrap(elem);

    //  If we're not empty, then we use our child content as our 'named'
    //  resource's content.
    if (TP.notEmpty(elem.childNodes)) {

        if (TP.notEmpty(namedHref = tpElem.getAttribute('name'))) {
            if (!TP.isURI(namedURI = TP.uc(namedHref))) {
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
        //  of that type and set it as the named URI's resource.

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

        //  Get this element's document wrapper.
        thisTPDoc = TP.wrap(elem).getDocument();

        //  Define a handler that waits for this element to be completely loaded
        //  into the page and then signals from the named URI that it's content
        //  has changed (this allows page-level bindings to be set up before the
        //  notifications go out that their data has changed).
        loadedHandler =
            function(aSig) {
                var newResource;

                loadedHandler.ignore(thisTPDoc, 'TP.sig.DOMContentLoaded');
                newResource = resultType.construct(resourceStr);

                //  If the named URI has existing data, then we signal
                //  'TP.sig.UIDataDestruct'.
                if (TP.notEmpty(namedURI.getResource())) {
                    tpElem.signal('TP.sig.UIDataDestruct');
                }

                //  Set the resource to the new resource (causing any observers
                //  of the URI to get notified of a change) and signal
                //  'TP.sig.UIDataConstruct'.
                namedURI.setResource(newResource);
                tpElem.signal('TP.sig.UIDataConstruct');

                //  Signal 'TP.sig.DOMReady' for consistency with other elements
                //  that signal this when their 'dynamic content' is resolved.
                tpElem.signal('TP.sig.DOMReady');
            };

        //  Tell the handler to observe this element's document wrapper.
        loadedHandler.observe(thisTPDoc, 'TP.sig.DOMContentLoaded');
    } else {

        //  Raise an exception
        return this.raise('TP.sig.InvalidNode');
    }

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
        namedURI;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
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
        }

        namedURI.unregister();
        namedURI.setResource(null);

        TP.wrap(elem).signal('TP.sig.UIDataDestruct');
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
    }

    return namedURI.getResource();
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

                tibetType = TP.core.XMLContent;

                break;

            default:
                tibetType = String;
        }
    }

    return tibetType;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
