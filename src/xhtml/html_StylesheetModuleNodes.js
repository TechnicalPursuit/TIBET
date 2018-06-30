//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.html.style
//  ========================================================================

/**
 * @type {TP.html.style}
 * @summary 'style' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('style');

TP.html.style.Type.set('booleanAttrs', TP.ac('scoped'));
TP.html.style.Type.set('reloadableUriAttrs', TP.ac('tibet:originalhref'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.style.Type.defineMethod('mutationUpdatedStyle',
function(aTargetElem) {

    /**
     * @method mutationUpdatedStyle
     * @summary Handles a remote resource change against the supplied native
     *     element.
     * @description This method is usually activated as the result of a 'DOM
     *     Mutation' of this node because of changes to the remote resource that
     *     caused this element to be created in the first place
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.html.style} The receiver.
     */

    var tpElem;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    tpElem = TP.wrap(aTargetElem);

    //  Notify stylesheets that are dependent on this one that it has loaded or
    //  reloaded.
    tpElem.notifyDependentsOfReload();

    //  Signal from our (wrapped) target element that we attached more nodes due
    //  to a mutation.
    TP.signal(TP.tpdoc(aTargetElem),
                'TP.sig.MutationStyleChange',
                TP.hc('mutationTarget', tpElem));

    return this;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.html.style.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element.
     */

    var elem,
        type;

    elem = aRequest.at('node');

    //  Grab the type and, if it's a 'TIBET CSS' type of styling, then change
    //  the original element into a 'tibet:style' tag.
    type = TP.elementGetAttribute(elem, 'type', true);
    if (type === TP.ietf.mime.TIBET_CSS) {
        elem = TP.elementBecome(elem, 'tibet:style', TP.hc('tibet:tag', ''));
    }

    return elem;
});

//  ------------------------------------------------------------------------

TP.html.style.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        handlerFunc;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  Register a handler function that will process @import'ed URIs and
    //  dispatch a TP.sig.DOMReady when the stylesheet has finished loading.
    handlerFunc =
        function() {

            var stylesheet,
                importHrefs;

            //  Remove this handler to avoid memory leaks.
            elem.removeEventListener('load', handlerFunc, false);

            //  Grab the stylesheet from the element.
            stylesheet = TP.cssElementGetStyleSheet(elem);

            //  If we have a valid CSSStyleSheet object
            if (TP.isValid(stylesheet)) {

                //  Intern the stylesheet's href as a TP.uri.URI. Note that we
                //  don't care about the return value here - we're simply
                //  interested in having a URI object matching the href here.
                TP.uc(stylesheet.href);

                //  Grab any hrefs from @import statements in the stylesheet and
                //  create instances of TP.uri.URIs from them as well. Again,
                //  we're not interested in the return values here. Note that
                //  this method, by default, will recursively retrieve @import
                //  hrefs.
                importHrefs = TP.styleSheetGetImportHrefs(stylesheet);
                importHrefs.forEach(
                    function(anHref) {
                        TP.uc(anHref);
                    });
            }

            //  If the element doesn't have a 'dependsOn' attribute (and,
            //  therefore, doesn't have other resources - usually @imports that
            //  it's waiting on and are being processed separately), dispatch
            //  'TP.sig.DOMReady'. This provides for consistency with other
            //  elements that dispatch this when their 'dynamic content' is
            //  resolved.
            //  Note that we use 'dispatch()' here because this is a DOM signal
            //  and we want all of the characteristics of a DOM signal.
            if (!TP.elementHasAttribute(elem, 'dependsOn', true)) {
                TP.wrap(elem).dispatch('TP.sig.DOMReady');
            }
        };

    elem.addEventListener('load', handlerFunc, false);

    return;
});

//  ------------------------------------------------------------------------

TP.html.style.Type.defineMethod('tagDetachComplete',
function(aRequest) {

    /**
     * @method tagDetachComplete
     * @summary Executes when the tag's detachment phases are fully complete.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        typeName,

        type;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  If the element has an associated TIBET type, use it to maintain that
    //  type's list of where it's stylesheets have been loaded.
    typeName = TP.elementGetAttribute(elem, 'tibet:type', true);
    if (TP.notEmpty(typeName)) {

        //  Grab the type and, if it's a subtype of TP.dom.UIElementNode, then
        //  remove this Element's Document from the list of where its
        //  stylesheets are loaded.
        type = TP.sys.getTypeByName(typeName);
        if (TP.isKindOf(type, TP.dom.UIElementNode)) {
            type.get('loadedStylesheetDocumentGIDs').remove(
                        TP.wrap(elem).getDocument().getGlobalID());
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.style.Inst.defineMethod('notifyDependentsOfReload',
function() {

    /**
     * @method notifyDependentsOfReload
     * @summary Notifies any other HTML style elements that are dependent on
     *     this element loading that it has done so. This may allow them to
     *     finally indicate that they are ready, if the receiver is the last one
     *     they were waiting on.
     * @returns {TP.html.style} The receiver.
     */

    var natDoc,

        targetID,

        dependentElements,
        dependentElement,

        len,
        i,

        attrVal,
        idValIndex;

    natDoc = this.getNativeDocument();

    //  Get our local ID and slice off the '_generated' suffix if it exists.
    //  This is because our ID will have gotten registered with any dependent
    //  style elements without the '_generated' suffix.
    targetID = this.getLocalID();
    if (targetID.endsWith('_generated')) {
        targetID = targetID.slice(0, -10);
    }

    //  Query the document head to see if there are any other style elements
    //  that have our ID *anywhere* in the value of their 'dependsOn' attribute.
    dependentElements = TP.byCSSPath(
                            '> style[dependsOn*="' + targetID + '"]',
                            TP.documentGetHead(natDoc),
                            false,
                            false);

    len = dependentElements.getSize();
    for (i = 0; i < len; i++) {

        dependentElement = dependentElements.at(i);

        //  Grab the value of the 'dependsOn' attribute and split on the TP.JOIN
        //  character, which is what all of its dependent IDs was joined on.
        attrVal = TP.elementGetAttribute(dependentElement, 'dependsOn', true);
        attrVal = attrVal.split(TP.JOIN);

        //  Splice out our ID from the list of dependent IDs on the dependent
        //  element.
        idValIndex = attrVal.indexOf(targetID);
        attrVal.splice(idValIndex, 1);

        //  If our ID was the last one, then we remove the 'dependsOn' attribute
        //  from the dependent element and signal that it's ready to go.
        if (TP.isEmpty(attrVal)) {

            TP.elementRemoveAttribute(dependentElement, 'dependsOn', true);

            TP.wrap(dependentElement).dispatch('TP.sig.DOMReady');

        } else {

            //  Otherwise, there are other dependent IDs, so we join them back
            //  together and set the attribute to that new value.
            TP.elementSetAttribute(
                        dependentElement,
                        'dependsOn',
                        attrVal.join(TP.JOIN),
                        true);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.style.Inst.defineMethod('reloadFromAttrTibetOriginalhref',
function(anHref) {

    /**
     * @method reloadFromAttrTibetOriginalhref
     * @summary Sets the href that the receiver will use to retrieve its
     *     content.
     * @description Note that the only reason that the receiver would have this
     *     attribute is if is an 'inlined' version of an XHTML 'link' element.
     *     Therefore, when we refresh its content because its URL changed, we
     *     always inline the content, thereby matching the original action.
     * @param {String} anHref The URL that the receiver will use to fetch its
     *     content.
     * @returns {TP.html.style} The receiver.
     */

    var styleURI,

        inlinedStyleElem,

        fetchOptions,

        styleContent;

    styleURI = TP.uc(anHref);

    if (TP.isURI(styleURI)) {

        //  Grab any existing inlined style element, if available.
        inlinedStyleElem = TP.byCSSPath(
                                'html|style[tibet|originalhref=' +
                                '"' +
                                styleURI.getOriginalSource() +
                                '"]',
                            this.getNativeDocument(),
                            true,
                            false);

        //  If the element existed, check to make sure that it
        //  doesn't have a 'tibet:dontreload' attribute. If it does,
        //  then exit here without reloading.
        if (TP.isElement(inlinedStyleElem) &&
            TP.elementHasAttribute(
                inlinedStyleElem, 'tibet:dontreload', true)) {
            return this;
        }

        //  Fetch the CSS content *synchronously*
        fetchOptions = TP.hc('async', false, 'resultType', TP.TEXT);
        styleContent = styleURI.getResource(fetchOptions).get('result');

        //  Set the content of the style element that contains the inlined
        //  style (which will be ourself), resolving @import statements and
        //  possible rewriting CSS url(...) values.
        TP.documentInlineCSSURIContent(
                        this.getNativeDocument(),
                        styleURI,
                        styleContent,
                        this.getNativeNode().nextSibling);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.style.Inst.defineMethod('serializeCloseTag',
function(storageInfo) {

    /**
     * @method serializeCloseTag
     * @summary Serializes the closing tag for the receiver.
     * @description At this type level, this method, in conjunction with the
     *     'serializeOpenTag' method, will always produce the 'XML version' of
     *     an empty tag (i.e. '<foo/>' rather than '<foo></foo>').
     * @param {TP.core.Hash} storageInfo A hash containing various flags for and
     *     results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the document node should
     *          include an 'XML declaration' at the start of it's serialization.
     *          The default is false.
     *          'result': The current serialization result as it's being built
     *          up.
     *          'store': The key under which the current serialization result
     *          will be stored.
     *          'stores': A hash of 1...n serialization results that were
     *          generated during the serialization process. Note that nested
     *          nodes might generated results that will go into different
     *          stores, and so they will all be stored here, each keyed by a
     *          unique key (which, by convention, will be the URI they should be
     *          saved to).
     * @returns {String} A serialization of the closing tag of the receiver.
     */

    var attrNode;

    attrNode = this.getNativeNode().attributes.id;
    if (TP.isAttributeNode(attrNode)) {
        if (attrNode.value.endsWith('_generated')) {
            return TP.CONTINUE;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.style.Inst.defineMethod('serializeOpenTag',
function(storageInfo) {

    /**
     * @method serializeOpenTag
     * @summary Serializes the opening tag for the receiver.
     * @description At this type level, this method performs a variety of
     *     transformations and filtering of various attributes. See the code
     *     below for more details. One notable transformation is that this
     *     method, in conjunction with the 'serializeCloseTag' method,  will
     *     always produce the 'XML version' of an empty tag (i.e. '<foo/>'
     *     rather than '<foo></foo>').
     * @param {TP.core.Hash} storageInfo A hash containing various flags for and
     *     results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the document node should
     *          include an 'XML declaration' at the start of it's serialization.
     *          The default is false.
     *          'result': The current serialization result as it's being built
     *          up.
     *          'store': The key under which the current serialization result
     *          will be stored.
     *          'stores': A hash of 1...n serialization results that were
     *          generated during the serialization process. Note that nested
     *          nodes might generated results that will go into different
     *          stores, and so they will all be stored here, each keyed by a
     *          unique key (which, by convention, will be the URI they should be
     *          saved to).
     * @returns {String} A serialization of the opening tag of the receiver.
     */

    var attrNode;

    attrNode = this.getNativeNode().attributes.id;
    if (TP.isAttributeNode(attrNode)) {
        if (attrNode.value.endsWith('_generated')) {
            return TP.CONTINUE;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
