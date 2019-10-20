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
 * @summary A subtype of TP.dom.ElementNode that implements the ability to put
 *         'static data' in the page.
 */

//  ------------------------------------------------------------------------

TP.dom.UIDataElement.defineSubtype('tibet:data');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.data.Type.defineMethod('tagPrecompile',
function(aRequest) {

    /**
     * @method tagPrecompile
     * @summary Precompiles the content by running any substitution expressions
     *     in it.
     * @description At this level, this method runs substitutions against the
     *     the text content of any attributes *only* (and *not* its text content
     *     like the supertype, in case that has ACP expressions embedded in its
     *     data) and supplies the following variables to the substitutions
     *     expressions:
     *
     *          TP         ->  The TP root.
     *          APP        ->  The APP root.
     *          $REQUEST    ->  The request that triggered this processing.
     *          $TAG        ->  The TP.dom.ElementNode that is being processed.
     *          $TARGET     ->  The target TP.dom.DocumentNode, if any, that
     *                          the result of this processing will be rendered
     *                          into.
     *          $SOURCE     ->  The original source tag, if this is being
     *                          processed as part of a nested template.
     *          $SELECTION  ->  The current selection. This could be text or an
     *                          Array of objects determined by the selection
     *                          manager.
     *          $*          ->  An alias for $SELECTION
     *          $FOCUS      ->  The currently focused TP.dom.ElementNode in the
     *                          target TP.dom.DocumentNode.
     *          $@          ->  An alias for $FOCUS
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        tpNode,

        info,

        str,

        result,
        elem,
        frag,

        attrs,
        len,
        j;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(node = aRequest.at('node'))) {
        return;
    }

    //  Wrap it so that when we ask for its text content, we're getting the best
    //  representation.
    tpNode = TP.wrap(node);

    //  Populate the substitution information with various variables, etc.
    info = this.populateSubstitutionInfo(aRequest);

    //  The $TAG will have been set to our parent node (the default behavior of
    //  the call above), so we need to set it to the wrapper currently
    //  processing node.
    info.atPut('$TAG', tpNode);

    info.atPut('shouldEcho', false);
    info.atPut('annotateMarkup', this.shouldWrapACPOutput());

    //  Make sure that any required data (i.e. 'id' attributes and others) are
    //  defined. id attributes, in particular, because they can be dynamically
    //  assigned by TIBET, are assumed to 'always exist'. This insures that they
    //  do for use in ACP template processing. Note that we always use the outer
    //  content here, since there may be attributes that we need to detect.
    tpNode.prepopulateRequiredTemplateData(info, tpNode.getOuterContent());

    //  Process the attributes. This method should resolve any ACP expressions
    //  in the attributes themselves.
    attrs = TP.elementGetAttributeNodes(node);
    len = attrs.getSize();
    for (j = 0; j < len; j++) {
        tpNode.transformAttributeNode(attrs.at(j), info);
    }

    return;
});

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

    //  If the element is being 'recast' (i.e. recomputed in place, usually when
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

TP.tibet.data.Inst.defineMethod('hasLocalData',
function() {

    /**
     * @method hasLocalData
     * @summary Does this element have local, not remote data. In particular,
     *     should it rely on child node content for example, over remote hrefs?
     * @returns {Boolean} Whether or not the receiver has local data.
     */

    var elem,
        childCDATASectionNodes;

    elem = this.getNativeNode();
    childCDATASectionNodes = TP.nodeGetChildNodesByType(
                                        elem, Node.CDATA_SECTION_NODE);

    return TP.notEmpty(childCDATASectionNodes);
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

        resourceStr,

        buildout;

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

        //  If we should make structures, then go ahead and set the content to
        //  'null'. Some content types, such as TP.core.XMLContent and
        //  TP.core.JSONContent, can handle null content objects handed to their
        //  initialization logic.
        buildout = TP.bc(this.getAttribute('buildout'));
        if (buildout) {
            this.setContent(null);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.defineMethod('setAttrName',
function(aName) {

    /**
     * @method setAttrName
     * @summary Sets the 'name' value for the receiver. This will cause the
     *     receiver to reregister it's content under the new name URI.
     * @param {String} anHref The value to set the 'href' to.
     */

    var oldName,
        oldURI,

        resource,

        newURI;

    oldName = this.$getAttribute('name');

    //  NB: We assume 'async' of false here.
    if (!TP.isURI(oldURI = TP.uc(oldName))) {
        //  Raise an exception
        return this.raise('TP.sig.InvalidURI');
    }
    resource = oldURI.getResource().get('result');
    if (TP.canInvoke(resource, 'setData')) {
        resource.setData(null);
    }
    oldURI.unregister();

    //  NB: We assume 'async' of false here.
    if (!TP.isURI(newURI = TP.uc(aName))) {
        //  Raise an exception
        return this.raise('TP.sig.InvalidURI');
    }

    newURI.setResource(
        resource,
        TP.hc('observeResource', true, 'signalChange', true));

    this.$setAttribute('name', aName);

    //  setting an attribute returns void according to the spec
    return;
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
     *     For this method, the most notable parameter is 'shouldSignal'. If
     *     this is set to false (it defaults to true), then change signaling
     *     from the receiver will not occur.
     * @returns {null}
     */

    var namedHref,
        namedURI,

        req,
        shouldSignal,

        mimeType,
        contentType,

        newResource,
        strResource,

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

    req = TP.request(aRequest);
    shouldSignal = TP.notFalse(req.at('shouldSignal'));

    if (TP.isEmpty(mimeType = this.getAttribute('type'))) {
        mimeType = TP.ietf.mime.guessMIMEType(aContentObject);
    }

    //  If the MIME type that was computed is text/plain, then something
    //  probably went wrong (i.e. the data couldn't be parsed) and so we warn
    //  about that.
    if (TP.notNull(aContentObject) && mimeType === TP.PLAIN_TEXT_ENCODED) {
        TP.ifWarn() ?
            TP.warn('Computed a content type of text/plain for' +
                    ' <tibet:data/> with id: ' +
                    this.getAttribute('id') + '.') : 0;
    }

    //  Obtain a MIME type for the result and use it to obtain a result type.
    //  Note that there might not be either a 'type' or 'content' attribute
    //  on the receiver, in which case we'll just get a String result type here.
    contentType = this.getContentType(mimeType);

    //  If the new resource result is a content object of some sort (highly
    //  likely) then we should initialize it with both the content String and
    //  the URI that it should be associated with. The content object type will
    //  convert it from a String to the proper type.
    if (TP.isSubtypeOf(contentType, TP.core.Content)) {
        newResource = contentType.construct(aContentObject, namedURI);
        if (this.hasAttribute('buildout')) {
            newResource.set('buildout',
                            TP.bc(this.getAttribute('buildout')));
        }
    } else {
        strResource = TP.str(aContentObject);
        if (contentType === String) {
            newResource = strResource;
        } else {
            newResource = contentType.from(strResource);
        }
    }

    //  Make sure that it's valid for its container. Note that we pass 'false'
    //  as a second parameter here for content objects that do both trivial and
    //  full facet checks on their data. We only want trival checks here (i.e.
    //  is the XML inside of a TP.core.XMLContent really XML - same for JSON)
    isValid = contentType.validate(newResource, false);
    if (!isValid) {
        return this.raise('TP.sig.InvalidValue');
    }

    //  If the named URI has existing data, then we signal
    //  'TP.sig.UIDataDestruct'.
    //  NB: We assume 'async' of false here.
    if (shouldSignal && TP.notEmpty(namedURI.getResource().get('result'))) {
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

    if (shouldSignal) {
        this.signal('TP.sig.UIDataConstruct');

        //  Check and dispatch a signal from our attributes if one exists for
        //  this signal.
        this.dispatchResponderSignalFromAttr('UIDataConstruct', null);

        //  Dispatch 'TP.sig.DOMReady' for consistency with other elements that
        //  dispatch this when their 'dynamic content' is resolved. Note that we
        //  use 'dispatch()' here because this is a DOM signal and we want all
        //  of the characteristics of a DOM signal.
        this.dispatch('TP.sig.DOMReady');
    }

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
