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
 * @type {TP.tibet.style}
 * @summary A subtype of TP.dom.ElementNode that implements the ability to have
 *      'non native' style content (such as LESS) embedded on a page.
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('tibet:style');

TP.tibet.style.Type.set('uriAttrs', TP.ac('href'));
TP.tibet.style.Type.set('reloadableUriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.style.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        href;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    tpElem = TP.wrap(elem);

    //  If we're not empty, then we reload from our child text content.
    if (!tpElem.isEmpty()) {

        tpElem.reloadFromContent();

    } else if (TP.notEmpty(href = TP.elementGetAttribute(elem, 'href', true))) {

        //  Otherwise, if our 'href' attribute isn't empty, then we reload from
        //  the content that can be found at the end of the URI contained there.
        tpElem.reloadFromAttrHref(href);

    } else {

        //  Raise an exception
        return this.raise('TP.sig.InvalidNode');
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('isReadyToRender',
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

TP.tibet.style.Inst.defineMethod('reloadFromAttrHref',
function(anHref) {

    /**
     * @method reloadFromAttrHref
     * @summary Reloads the receiver with the content found at the end of the
     *     href.
     * @param {String} anHref The URL that the receiver will use to reload its
     *     content.
     * @returns {TP.tibet.style} The receiver.
     */

    var doc,

        generatedStyleID,
        ourID,

        newStyleElem,
        existingStyleElem,

        ext,
        hrefURI,
        hrefLocation,
        newHref,

        styleURI,
        fetchOptions,
        inlineStyleContent,
        inlinedStyleElem;

    if (TP.notEmpty(anHref)) {

        ext = TP.uriExtension(anHref);

        hrefURI = TP.uc(anHref);
        hrefLocation = hrefURI.getLocation();

        switch (ext) {

            default:

                doc = this.getNativeDocument();

                //  Get our local ID, assigning it if necessary.
                ourID = this.getLocalID(true);

                //  Compute an ID for our generated (real) CSS style sheet.
                generatedStyleID = ourID + '_generated';

                if (this.getAttribute('type') === TP.ietf.mime.TIBET_CSS) {

                    styleURI = TP.uc(hrefLocation);

                    //  Grab any existing inlined style element, if available.
                    //  Note that we make sure to go after only HTML style
                    //  elements here.
                    inlinedStyleElem = TP.byCSSPath(
                                            'html|style[tibet|originalhref=' +
                                            '"' +
                                            styleURI.getOriginalSource() +
                                            '"]',
                                        doc,
                                        true,
                                        false);

                    //  If the element existed, check to make sure that it
                    //  doesn't have a 'tibet:no-reload' attribute. If it does,
                    //  then exit here without reloading.
                    if (TP.isElement(inlinedStyleElem) &&
                        TP.elementHasAttribute(
                            inlinedStyleElem, 'tibet:no-reload', true)) {
                        return;
                    }

                    //  Note how we *don't* specify 'refresh' here, since we
                    //  want the latest content as set into the URL.
                    fetchOptions = TP.hc('async', false,
                                            'resultType', TP.TEXT,
                                            'signalChange', false);
                    inlineStyleContent =
                        styleURI.getResource(fetchOptions).get('result');

                    //  Set the content of an inlined XHTML style element that
                    //  contains the inlined style, resolving @import statements
                    //  and possible rewriting CSS url(...) values. Note that
                    //  this will generate a new style element if it has to.
                    inlinedStyleElem = TP.documentInlineCSSURIContent(
                                            doc,
                                            styleURI,
                                            inlineStyleContent,
                                            this.getNativeNode().nextSibling,
                                            true);

                    //  NB: We do *not* mark this element as having been
                    //  generated by TIBET because we want it itself to be
                    //  findable via TIBET's CSS query mechanism

                    //  Make sure also to set the style element's 'id'
                    //  attribute, so that the above 'uniquing' logic will work
                    //  for future occurrences of this element being processed
                    //  (which ensures that we don't add the same element more
                    //  than once).
                    TP.elementSetAttribute(inlinedStyleElem,
                                            'id',
                                            generatedStyleID,
                                            true);

                    //  Track the original source from the URI - this is what
                    //  the author originally typed and might be a virtual URI.
                    //  We'd like to track it here.
                    TP.elementSetAttribute(inlinedStyleElem,
                                            'tibet:originalhref',
                                            styleURI.getOriginalSource(),
                                            true);

                } else {

                    //  Grab any existing style element, if available.
                    existingStyleElem = TP.byCSSPath(
                                        '*[tibet|for="' + ourID + '"]',
                                        doc,
                                        true,
                                        false);

                    //  If the element existed, check to make sure that it
                    //  doesn't have a 'tibet:no-reload' attribute. If it does,
                    //  then exit here without reloading.
                    if (TP.isElement(existingStyleElem) &&
                        TP.elementHasAttribute(
                            existingStyleElem, 'tibet:no-reload', true)) {
                        return;
                    }

                    //  If there is no existing 'style' element, create one and
                    //  set its content.
                    if (!TP.isElement(existingStyleElem)) {
                        //  Just some CSS - link it in.
                        newStyleElem = TP.documentAddCSSLinkElement(
                                            doc,
                                            hrefLocation,
                                            this.getNativeNode().nextSibling);

                        //  Mark this element as having been generated by TIBET.
                        newStyleElem[TP.GENERATED] = true;

                        TP.elementSetAttribute(
                                newStyleElem, 'id', generatedStyleID, true);

                        //  Set an attribute on our newly created style element
                        //  that links it back to the source element.
                        TP.elementSetAttribute(newStyleElem,
                                                'tibet:for',
                                                ourID,
                                                true);

                        //  Track the original source from the URI - this is what
                        //  the author originally typed and might be a virtual
                        //  URI. We'd like to track it here.
                        TP.elementSetAttribute(inlinedStyleElem,
                                                'tibet:originalhref',
                                                hrefLocation,
                                                true);

                    } else {

                        //  Otherwise, just compute a new href from the old href
                        //  value that is guaranteed to be unique and set the
                        //  'href' property of the existing style element to it,
                        //  thereby guaranteeing a reload of the content.
                        newHref = TP.uriAddUniqueQuery(hrefLocation);

                        existingStyleElem.href = newHref;
                    }
                }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('reloadFromContent',
function() {

    /**
     * @method reloadFromContent
     * @summary Reloads the receiver with the child text content found inside of
     *     the receiver.
     * @returns {null}
     */

    var resourceStr,

        doc,

        generatedStyleID,
        ourID,

        type,

        newStyleElem,
        existingStyleElem;

    doc = this.getNativeDocument();

    //  Get our local ID, assigning it if necessary.
    ourID = this.getLocalID(true);

    //  Compute an ID for our generated (real) CSS style sheet.
    generatedStyleID = ourID + '_generated';

    resourceStr = this.getTextContent();

    //  If there's a 'type' attribute, that should have the type of style
    //  that we're being asked to process.
    type = this.getAttribute('type');

    switch (type) {
        default:

            //  If there is no existing 'style' element, create one and set
            //  its content.
            if (!TP.isElement(
                    existingStyleElem =
                    TP.byCSSPath('*[tibet|for="' + ourID + '"]',
                                    doc,
                                    true,
                                    false))) {

                //  Just some CSS
                newStyleElem = TP.documentAddCSSStyleElement(
                                    doc,
                                    resourceStr,
                                    this.getNativeNode().nextSibling);

                TP.elementSetAttribute(
                        newStyleElem, 'id', generatedStyleID, true);

                //  Set an attribute on our newly created style element that
                //  links it back to the source element.
                TP.elementSetAttribute(newStyleElem, 'tibet:for', ourID, true);
            } else {
                //  Otherwise, just set the content of the existing one.
                TP.cssStyleElementSetContent(existingStyleElem, resourceStr);
            }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('serializeCloseTag',
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

    attrNode = this.getNativeNode().attributes.type;
    if (TP.isAttributeNode(attrNode)) {
        //  If the 'type' attribute is 'TIBET_CSS', that means it was
        //  auto-populated and shouldn't be written.
        if (attrNode.value === TP.ietf.mime.TIBET_CSS) {
            return TP.CONTINUE;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('serializeOpenTag',
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

    attrNode = this.getNativeNode().attributes.type;
    if (TP.isAttributeNode(attrNode)) {
        //  If the 'type' attribute is 'TIBET_CSS', that means it was
        //  auto-populated and shouldn't be written.
        if (attrNode.value === TP.ietf.mime.TIBET_CSS) {
            return TP.CONTINUE;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {null}
     */

    this.callNextMethod();

    //  reload from the child text content found inside ourself.
    this.reloadFromContent();

    return null;
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('setAttrHref',
function(anHref) {

    /**
     * @method setAttrHref
     * @summary Sets the href that the receiver will use to retrieve its
     *     content.
     * @param {String} anHref The URL that the receiver will use to fetch its
     *     content.
     */

    this.$setAttribute('href', anHref);

    //  reload from the content found at the href.
    this.reloadFromAttrHref(anHref);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
