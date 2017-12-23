//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
*/

/* global CSSRule:false
*/

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('documentAddCSSElement',
function(targetDoc, cssHref, inlineRuleText) {

    /**
     * @method documentAddCSSElement
     * @summary Adds the appropriate CSS element to the document based on
     *     whether the inlineRuleText parameter is 'true' or not. If it is, the
     *     style text will be retrieved from the cssHref and will be 'inlined'
     *     with an HTML 'style' element in the head of the document.
     * @param {Document} targetDoc The document to which the new element should
     *     be added.
     * @param {String} cssHref The href to use on the newly added CSS element.
     * @param {Boolean} inlineRuleText Whether or not the rule text should be
     *     'inlined' into the document. Defaults to false.
     * @exception TP.sig.InvalidDocument
     * @returns {HTMLElement} The new link or style element that was added.
     */

    var response,
        cssText,

        newNativeElem;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Make sure that the target document has a valid 'head' element or we're
    //  going nowhere.
    TP.documentEnsureHeadElement(targetDoc);

    if (TP.isTrue(inlineRuleText)) {

        //  If inlineRuleText is true, then we load the style rule text
        //  synchronously. If its not empty, we use that style text to add
        //  under a 'style' element.
        response = TP.uc(cssHref).getResource(
                                TP.hc('async', false, 'resultType', TP.TEXT));
        cssText = response.get('result');

        newNativeElem = TP.documentAddCSSStyleElement(targetDoc, cssText);
    } else {
        newNativeElem = TP.documentAddCSSLinkElement(targetDoc, cssHref);
    }

    return newNativeElem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentAddCSSLinkElement',
function(targetDoc, linkHref, beforeNode) {

    /**
     * @method documentAddCSSLinkElement
     * @summary Adds a 'link' element to the target document with the provided
     *     href as the link's href.
     * @param {Document} targetDoc The document to which the new link element
     *     should be added.
     * @param {String} linkHref The href to use on the newly added 'link'
     *     element.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @exception TP.sig.InvalidDocument
     * @returns {HTMLElement} The new link element that was added.
     */

    var targetHead,
        newLinkElement,

        before;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Make sure that the target document has a valid 'head' element or
    //  we're going nowhere.
    targetHead = TP.documentEnsureHeadElement(targetDoc);

    //  Create a new 'link' element.
    newLinkElement = TP.documentConstructElement(targetDoc,
                                                'link',
                                                TP.w3.Xmlns.XHTML);

    TP.elementSetAttribute(newLinkElement, 'type', TP.CSS_TEXT_ENCODED);
    TP.elementSetAttribute(newLinkElement, 'rel', 'stylesheet');

    before = TP.ifInvalid(beforeNode, null);

    //  We don't have to worry about reassignment of newLinkElement to the
    //  return value of this method since we know we created it in
    //  targetDoc.
    TP.nodeInsertBefore(targetHead, newLinkElement, before, false);

    //  Set the new link element's href to linkHref. This loads the style
    //  sheet rules asynchronously.
    TP.elementSetAttribute(newLinkElement, 'href', linkHref);

    return newLinkElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentAddCSSStyleElement',
function(targetDoc, styleText, beforeNode) {

    /**
     * @method documentAddCSSStyleElement
     * @summary Adds a 'style' element to the target document with the
     *     optionally provided styleText as the rule text.
     * @param {Document} targetDoc The document to which the new style element
     *     should be added.
     * @param {String} styleText The optional rule text to use in the newly
     *     created style element.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @exception TP.sig.InvalidDocument
     * @returns {HTMLElement} The new style element that was added.
     */

    var targetHead,
        newStyleElement,

        before;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Make sure that the target document has a valid 'head' element or
    //  we're going nowhere.
    targetHead = TP.documentEnsureHeadElement(targetDoc);

    //  Create a new 'style' element
    newStyleElement = TP.documentConstructCSSStyleElement(targetDoc);

    //  Got to do this *before* we try to set the text content of the style
    //  element.

    before = TP.ifInvalid(beforeNode, null);

    //  We don't have to worry about reassignment of newStyleElement to the
    //  return value of this method since we know we created it in
    //  targetDoc.
    TP.nodeInsertBefore(targetHead, newStyleElement, before, false);

    if (TP.isString(styleText)) {
        //  Set the content of the style element to the new style text.
        TP.cssStyleElementSetContent(newStyleElement, styleText);
    }

    return newStyleElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentConstructCSSStyleElement',
function(targetDoc) {

    /**
     * @method documentConstructCSSStyleElement
     * @summary Constructs a 'style' element on the target document.
     * @param {Document} targetDoc The document to which the new style element
     *     should be added.
     * @exception TP.sig.InvalidDocument
     * @returns {HTMLElement} The new style element that was added.
     */

    var newStyleElement;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Create a new 'style' element
    newStyleElement = TP.documentConstructElement(targetDoc, 'style',
                                                    TP.w3.Xmlns.XHTML);

    TP.elementSetAttribute(newStyleElement, 'type', TP.CSS_TEXT_ENCODED);

    return newStyleElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCopyCSSElements',
function(cssElements, targetDoc) {

    /**
     * @method documentCopyCSSElements
     * @summary Copies style information from the 'link' and 'style' elements
     *     supplied in the element array and creates new 'link' and 'style'
     *     elements with that information in the target document.
     * @param {Array} cssElements The Array of 'style' and 'link' elements that
     *     will have their style information copied and used in the target
     *     document.
     * @param {Document} targetDoc The document whose style nodes should be
     *     updated.
     * @exception TP.sig.InvalidDocument
     * @exception TP.sig.InvalidArray
     */

    var i,
        aCSSElement,

        localName;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    if (!TP.isArray(cssElements)) {
        return TP.raise(this, 'TP.sig.InvalidArray');
    }

    for (i = 0; i < cssElements.getSize(); i++) {
        aCSSElement = cssElements.at(i);

        localName = TP.elementGetLocalName(aCSSElement).toLowerCase();

        if (localName === 'link') {
            TP.documentCopyCSSLinkElement(aCSSElement, targetDoc);
        } else if (localName === 'style') {
            TP.documentCopyCSSStyleElement(aCSSElement, targetDoc);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCopyCSSLinkElement',
function(anElement, targetDoc, inlineRuleText, onlyIfAbsent) {

    /**
     * @method documentCopyCSSLinkElement
     * @summary Copies style information from the supplied 'link' element and
     *     creates a new 'link' element with that information in the target
     *     document. NB: The caller *must* supply a 'link' element here, with a
     *     'rel' attribute of 'stylesheet', or an TP.sig.InvalidElement
     *     exception will be thrown.
     * @param {HTMLElement} anElement The 'link' element that should be copied
     *     into the target document.
     * @param {Document} targetDoc The document to which the CSS text should be
     *     added.
     * @param {Boolean} inlineRuleText Whether or not the rule text should be
     *     'inlined' into the document. Defaults to false.
     * @param {Boolean} onlyIfAbsent Whether or not the style element/link
     *     should be added only if it doesn't already exist. Defaults to false.
     * @exception TP.sig.InvalidDocument
     * @exception TP.sig.InvalidElement
     */

    var shouldOnlyIfAbsent,

        linkHref,

        targetHead,

        existingLinkElements,
        i,

        sourceDirectory,

        resp,
        cssText,

        newNativeElem;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.elementGetLocalName(anElement).toLowerCase() !== 'link' ||
        TP.elementGetAttribute(anElement, 'rel') !== 'stylesheet') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    shouldOnlyIfAbsent = TP.ifInvalid(onlyIfAbsent, false);

    linkHref = TP.elementGetAttribute(anElement, 'href');
    targetHead = targetDoc.getElementsByTagName('head')[0];

    //  If shouldOnlyIfAbsent is true, then we need to make sure that the
    //  target document doesn't already have a 'link' element with an 'href'
    //  equal to linkHref.
    if (TP.isElement(targetHead) && shouldOnlyIfAbsent) {
        existingLinkElements = TP.nodeGetElementsByTagName(targetHead,
                                                            'link');

        for (i = 0; i < existingLinkElements.getSize(); i++) {
            if (existingLinkElements.at(i).rel === 'stylesheet' &&
                TP.elementGetAttribute(
                        existingLinkElements.at(i), 'href') === linkHref) {
                return existingLinkElements.at(i);
            }
        }
    }

    //  Grab the 'source directory' of the text. To do this, we go back to
    //  the document *of the original style element*, grab its location and
    //  then get the collection (i.e. 'directory') URL of that path.
    sourceDirectory = TP.uriCollectionPath(
                            TP.documentGetLocation(
                                TP.nodeGetDocument(anElement)));

    if (TP.isTrue(inlineRuleText)) {

        //  If inlineRuleText is true, then we load the style rule text
        //  synchronously. If its not empty, we use that style text to add
        //  under a 'style' element.

        resp = TP.uc(linkHref).getResource(
                                TP.hc('async', false, 'resultType', TP.TEXT));
        cssText = resp.get('result');

        newNativeElem = TP.documentAddCSSStyleElement(targetDoc, cssText);
    } else {
        newNativeElem = TP.documentAddCSSLinkElement(
                                targetDoc,
                                TP.uriJoinPaths(sourceDirectory, linkHref));
    }

    return newNativeElem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCopyCSSStyleElement',
function(anElement, targetDoc) {

    /**
     * @method documentCopyCSSStyleElement
     * @summary Copies style information from the supplied 'style' element and
     *     creates a new 'style' element with that information in the target
     *     document. NB: The caller *must* supply a 'style' element here, or an
     *     'TP.sig.InvalidElement' exception will be thrown.
     * @param {HTMLElement} anElement The 'style' element that should be copied
     *     into the target document.
     * @param {Document} targetDoc The document to which the CSS text should be
     *     added.
     * @exception TP.sig.InvalidDocument
     * @exception TP.sig.InvalidElement
     * @returns {HTMLElement|null} The newly added 'style' element if the style
     *     was *not* processed by the CSS processor or null if it was.
     */

    var cssText,

        newNativeElem;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.elementGetLocalName(anElement).toLowerCase() !== 'style') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    cssText = TP.cssStyleElementGetContent(anElement);

    newNativeElem = TP.documentAddCSSStyleElement(targetDoc, cssText);

    return newNativeElem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetNativeCSSElements',
function(aDocument) {

    /**
     * @method documentGetNativeCSSElements
     * @summary Returns the supplied document's style sheet elements, if any.
     *     Note that this returns both 'style' elements and 'link' elements that
     *     have a 'rel' attribute with a value of 'stylesheet'. If the document
     *     has no head element or style elements, this method returns an empty
     *     Array.
     * @param {Document} aDocument The document to use.
     * @exception TP.sig.InvalidDocument
     * @returns {Array} An Array of either the 'link' or 'style' elements in the
     *     supplied document.
     */

    var targetHead,

        headElems,

        linkElems,
        res;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Make sure that the source document has a valid 'head' element or
    //  we're going nowhere.
    headElems = TP.nodeGetElementsByTagName(aDocument, 'head');
    if (!TP.isElement(targetHead = headElems.at(0))) {
        return TP.ac();
    }

    linkElems = TP.nodeGetElementsByTagName(targetHead, 'link');

    //  Select 'link' elements that are 'stylesheet' links.
    res = linkElems.select(
        function(aLinkElement) {

            if (TP.elementGetAttribute(aLinkElement, 'rel') ===
                                                    'stylesheet' &&
                TP.elementGetAttribute(aLinkElement, 'type') ===
                                                    TP.CSS_TEXT_ENCODED) {
                return true;
            }

            return false;
        });

    //  Add all 'style' elements to the result array.
    res.addAll(TP.nodeGetElementsByTagName(targetHead, 'style'));

    return res;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetNativeStyleRules',
function(aDocument) {

    /**
     * @method documentGetNativeStyleRules
     * @summary Returns all of the CSS style rules for the supplied document.
     *     Because this routine uses the TP.styleSheetGetStyleRules() function,
     *     it will also return any rules found in embedded @import statements in
     *     CSS.
     * @param {HTMLDocument} aDocument The document to retrieve all style rules
     *     for.
     * @exception TP.sig.InvalidDocument
     * @returns {Array} The list of CSS rules for the supplied document.
     */

    var allSheets,
        allRules,

        i;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Grab all of the style sheets in the document, whether they were linked
    //  in or defined in the head of the document. Note that this is given in
    //  'tree order', according to the CSS OM specification.
    allSheets = aDocument.styleSheets;

    allRules = TP.ac();

    //  Loop over the sheets, grabbing each one's rules and adding them all
    //  to our overall collection.
    for (i = 0; i < allSheets.length; i++) {
        allRules.addAll(TP.styleSheetGetStyleRules(allSheets[i]));
    }

    return allRules;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetStyleRules',
function(aDocument) {

    /**
     * @method documentGetStyleRules
     * @summary Returns all of the CSS style rules for the supplied document.
     * @description If the TP.sys.shouldProcessCSS() flag is 'true' (the
     *     default) this call will return an Array of TP.core.Hashes that
     *     represent all of the rules in this document. If it is false, this
     *     method will return the result of calling
     *     TP.documentGetNativeStyleRules() and the result will be an Array of
     *     native 'rule' objects for this browser.
     * @param {HTMLDocument} aDocument The document to retrieve all style rules
     *     for.
     * @exception TP.sig.InvalidDocument
     * @returns {Array} An Array of either TP.core.Hashes or native browser
     *     'rule' objects representing the CSS rules for the supplied document.
     */

    return TP.documentGetNativeStyleRules(aDocument);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentInlineCSSURIContent',
function(aDocument, styleURI, inlinedStyleContent, beforeNode, refreshImports) {

    /**
     * @method documentInlineCSSUriContent
     * @summary Adds a 'style' element to the target document with the provided
     *     content as the element's content.
     * @description Note that this method also recursively resolves any @import
     *     statements and inlines their content as well. Additionally, it also
     *     rewrites any CSS 'url(...)' values by resolving them against the
     *     stylesheet's URL.
     * @param {Document} aDocument The document where the inlined CSS content
     *     will be added.
     * @param {TP.core.URI} styleURI The URI of the original content that the
     *     inlined content will be acting in place of.
     * @param {String} inlinedStyleContent The style content that will be
     *     inlined into the style element.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @param {Boolean} refreshImports Whether or not to refresh the content
     *     from any @import statements from their remote location.
     * @exception TP.sig.InvalidDocument
     * @returns {HTMLElement} The new style element that was added.
     */

    var shouldRefresh,

        inlinedStyleElem,

        docHead,

        addedNewStyleElement,

        processedStyleContent,

        inlinedCollectionLoc,

        processedContentNode;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    shouldRefresh = TP.ifInvalid(refreshImports, false);

    //  First, see if we've processed this style URI into an *XHTML* style
    //  element before (note the specific namespace query of 'html|' for XHTML
    //  style elements only - we don't want 'tibet:style' elements).
    inlinedStyleElem = TP.byCSSPath('html|style[tibet|originalHref=' +
                                        '"' +
                                        styleURI.getOriginalSource() +
                                        '"]',
                                    aDocument,
                                    true,
                                    false);

    //  If not, create one.
    if (!TP.isElement(inlinedStyleElem)) {

        inlinedStyleElem = TP.documentConstructCSSStyleElement(aDocument);

        TP.elementSetAttribute(inlinedStyleElem,
                                'tibet:originalHref',
                                styleURI.getOriginalSource(),
                                true);

        docHead = TP.documentEnsureHeadElement(aDocument);

        //  Insert it into document head. It's empty, but it needs to be there
        //  so that, if we recurse because of '@import' statements below, the
        //  'insertBefore()' will work.
        TP.nodeInsertBefore(docHead,
                            inlinedStyleElem,
                            beforeNode,
                            false);

        addedNewStyleElement = true;
    } else {
        addedNewStyleElement = false;
    }

    processedStyleContent = inlinedStyleContent;

    inlinedCollectionLoc = TP.uriCollectionPath(
                                styleURI.getRootAndPath());

    //  Scan the content for @import rules. If found, resolve their value
    //  against the collection URI of the URI we're currently processing (which
    //  will act as the based) and recursively create a new 'style' element with
    //  that new value, using the element we just created as the 'before
    //  element'. This keeps ordering intact in an attempt to follow CSS
    //  precedence rules.
    TP.regex.CSS_IMPORT_RULE.lastIndex = 0;
    if (TP.regex.CSS_IMPORT_RULE.test(processedStyleContent)) {

        TP.regex.CSS_IMPORT_RULE.lastIndex = 0;
        processedStyleContent = processedStyleContent.replace(
                TP.regex.CSS_IMPORT_RULE,
                function(wholeMatch, leadingText, importLocation) {

                    var importedStyleLocation,
                        importedStyleURI,

                        fetchOptions,
                        importedStyleContent;

                    if (TP.notEmpty(importLocation)) {

                        //  Compute the value for the URL at the end of the
                        //  @import statement by joining it with the 'collection
                        //  location' for the stylesheet it was found in.
                        importedStyleLocation =
                                    TP.uriJoinPaths(
                                        inlinedCollectionLoc,
                                        importLocation);

                        importedStyleURI =
                                    TP.uc(importedStyleLocation);

                        //  Fetch content from the URI's resource

                        //  Note how we force 'refresh' to false, since we'll be
                        //  reading from inlined content.
                        fetchOptions = TP.hc('async', false,
                                                'resultType', TP.TEXT,
                                                'refresh', shouldRefresh);
                        importedStyleContent =
                            importedStyleURI.getResource(
                                        fetchOptions).get('result');

                        //  Recurse, adding a style element for the found URI
                        //  and using the element that we're adding in the outer
                        //  scope as the insertion point.
                        TP.documentInlineCSSURIContent(
                                        aDocument,
                                        importedStyleURI,
                                        importedStyleContent,
                                        inlinedStyleElem,
                                        shouldRefresh);
                    }

                    //  Return the empty String, which will actually remove the
                    //  @import statement from the CSS source text.
                    return '';
                });
    }

    //  Scan the content for url(...) property values. If found, resolve their
    //  value against the collection URI of the URI we're currently processing.
    TP.regex.CSS_URL_PROPERTY.lastIndex = 0;
    if (TP.regex.CSS_URL_PROPERTY.test(processedStyleContent)) {

        TP.regex.CSS_URL_PROPERTY.lastIndex = 0;
        processedStyleContent = processedStyleContent.replace(
                TP.regex.CSS_URL_PROPERTY,
                function(wholeMatch, leadingText, locationValue) {

                    var importedStyleLocation;

                    if (TP.notEmpty(locationValue)) {

                        //  Compute the value for the URL in the url(...)
                        //  property by joining it with the 'collection
                        //  location' for the stylesheet it was found in.
                        importedStyleLocation =
                                    TP.uriJoinPaths(
                                        inlinedCollectionLoc,
                                        locationValue);
                    }

                    //  Return the String that must exactly replace what the
                    //  RegExp matched (we default to enclosing the value in
                    //  double quotes - the RegExp strips all quoting anyway).
                    return ': ' +
                            'url("' + importedStyleLocation + '");';
                });
    }

    //  Scan the content for url(...) values in general. If found, resolve their
    //  value against the values available for all virtual URIs in TIBET.
    TP.regex.CSS_URL_VALUE.lastIndex = 0;
    if (TP.regex.CSS_URL_VALUE.test(processedStyleContent)) {

        TP.regex.CSS_URL_VALUE.lastIndex = 0;
        processedStyleContent = processedStyleContent.replace(
                TP.regex.CSS_URL_VALUE,
                function(wholeMatch, leadingText, locationValue) {

                    var loc;

                    if (TP.notEmpty(locationValue)) {

                        //  Compute the value for the URL in the
                        //  url(...) property by joining it with the
                        //  'collection location' for the stylesheet it
                        //  was found in.
                        loc = TP.uc(locationValue).getLocation();
                    }

                    //  Return the String that must exactly replace what
                    //  the RegExp matched (we default to enclosing the
                    //  value in double quotes - the RegExp strips all
                    //  quoting anyway).
                    return 'url("' + loc + '")';
                });
    }

    if (addedNewStyleElement) {

        //  Create a CDATA section to hold the processed style content
        processedContentNode =
            aDocument.createCDATASection(processedStyleContent);

        //  Append it to the new style element
        TP.nodeAppendChild(inlinedStyleElem, processedContentNode, false);

        //  Awaken it. This will cause the new style element to observe changes
        //  via the 'tibet:originalHref' attribute.
        TP.nodeAwakenContent(inlinedStyleElem);
    } else {
        TP.cssStyleElementSetContent(inlinedStyleElem, processedStyleContent);
    }

    return inlinedStyleElem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$documentRefreshAppliedRulesCaches',
function(aDocument, flushCaches) {

    /**
     * @method $documentRefreshAppliedRulesCaches
     * @summary Refreshes all style rules for every element in the document.
     *     The end result of running this function is that every element in the
     *     document will have a 'TP.APPLIED_RULES' property that contains an
     *     Array of CSS style rules that apply to it.
     * @description As this function iterates over every CSS rule in the
     *     document, querying the document for matching elements and then adding
     *     to that element's 'TP.APPLIED_RULES' property with that rule.
     *     Therefore, this can be a time consuming process.
     * @param {HTMLDocument} aDocument The document to refresh all of the
     *     elements of.
     * @param {Boolean} [flushCaches=false] Whether or not we should flush the
     *     element-level rule caches. After this method is executed, elements
     *     will have cached Arrays containing the Rule objects applying to them.
     *     Passing true here will cause those caches to flush.
     * @exception TP.sig.InvalidDocument
     */

    var shouldFlushCaches,

        docRules,

        leni,
        i,
        aRule,

        parentSS,

        elementsMatchingRule,

        lenj,
        j,
        matchingElement,

        appliedRules;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    shouldFlushCaches = TP.ifInvalid(flushCaches, false);

    //  Grab all of the document's CSS rules.
    docRules = TP.documentGetNativeStyleRules(aDocument);

    //  Iterate over them, querying the document for any elements that match
    //  the selector text of the rule. Then, iterate over those elements and add
    //  the rule to its 'appliedRules' Array.
    leni = docRules.getSize();
    for (i = 0; i < leni; i++) {

        aRule = docRules.at(i);

        //  Not a CSSRule.STYLE_RULE? Must be an @import or a @namespace - move
        //  on.
        if (aRule.type !== CSSRule.STYLE_RULE) {
            continue;
        }

        //  Find the style sheet associated with the element that inserted the
        //  rule's stylesheet (because of @import, it might not be the sheet in
        //  the 'parentStyleSheet' slot of the rule itself).
        parentSS = aRule.parentStyleSheet;
        while (parentSS.parentStyleSheet) {
            parentSS = parentSS.parentStyleSheet;
        }

        //  If the stylesheet came from a private TIBET stylesheet (normally
        //  used for IDE or other purposes), then don't consider it.
        if (parentSS.ownerNode[TP.TIBET_PRIVATE]) {
            continue;
        }

        //  Grab any elements that match the rule's selector
        elementsMatchingRule = TP.nodeEvaluateCSS(aDocument,
                                                    aRule.selectorText);

        //  Iterate over those elements, and add the rule object to that
        //  element's list of applicable rules
        lenj = elementsMatchingRule.getSize();
        for (j = 0; j < lenj; j++) {

            if (j === 0 && shouldFlushCaches) {
                matchingElement[TP.APPLIED_RULES] = null;
            }

            matchingElement = elementsMatchingRule.at(j);

            appliedRules = matchingElement[TP.APPLIED_RULES];

            if (TP.notValid(appliedRules)) {
                appliedRules = TP.ac();
                matchingElement[TP.APPLIED_RULES] = appliedRules;
            }

            appliedRules.push(aRule);
            appliedRules.unique();
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentReloadCSSLinkElementHref',
function(aDocument, anHref) {

    /**
     * @method documentReloadCSSLinkElementHref
     * @summary Reloads any style 'link' element pointing to the supplied
     *     href, if it can be found in the supplied Document.
     * @param {Document} aDocument The document to look for 'link' elements
     *     in.
     * @param {String} anHref The href to try to find to reload.
     * @exception TP.sig.InvalidDocument
     * @exception TP.sig.InvalidString
     */

    var currentTopLevelLinkElems,

        existingHrefs,

        oldHref,

        len,
        i,

        index;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    if (TP.isEmpty(anHref)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    //  Gather the hrefs of the current 'top-level' 'link' elements in the
    //  supplied element's document. The reason we do this rather than just
    //  query for an element's authored 'href=' value is that the '.href'
    //  property will be the *fully expanded* href value and that's the one(s)
    //  we'll need for comparison.
    currentTopLevelLinkElems =
                TP.byCSSPath('link[rel="stylesheet"]', aDocument, false, false);
    existingHrefs = currentTopLevelLinkElems.collect(
                function(anElem) {
                    var href;

                    //  In case a previous run of this method was the generator
                    //  of this element, we need to strip out any 'unique query'
                    //  parameters that we added to force the reload in order to
                    //  do a proper comparison.
                    href = TP.uriRemoveUniqueQuery(anElem.href);

                    return href;
                });

    //  In case a previous run of this method was the generator of this element,
    //  we need to strip out any 'unique query' parameters that we added to
    //  force the reload in order to do a proper comparison.
    oldHref = TP.uriRemoveUniqueQuery(anHref);

    //  If the existing hrefs in the document do not contain the href we're
    //  looking for, then it may be in an @import. Flatten out those @import
    //  statements (recursively), generating a top level 'link' element for each
    //  one (in the order they were found to preserve CSS specificity rules).
    if (!existingHrefs.contains(oldHref)) {

        len = currentTopLevelLinkElems.getSize();
        for (i = 0; i < len; i++) {
            TP.cssLinkElementFlattenImports(currentTopLevelLinkElems.at(i));
        }

        //  Re-run the query. This time, there will be a fully realized value
        //  as the href, so we can use it here.
        currentTopLevelLinkElems =
                TP.byCSSPath('link[rel="stylesheet"][href="' + oldHref + '"]',
                            aDocument,
                            false,
                            false);

        if (TP.isEmpty(currentTopLevelLinkElems)) {
            //  Still couldn't find it even after flattening all of the
            //  referenced @imports. Exit here.
            //  TODO: Raise an exception?
            return;
        }

        //  Requery for the now existing hrefs (we don't need to worry about
        //  detecting and stripping any '_tibet_nocache' prefix here because
        //  these are all new).
        existingHrefs = currentTopLevelLinkElems.collect(
                function(anElem) {
                    return anElem.href;
                });
    }

    //  Look for the href in the set of existing hrefs we have. That will be the
    //  same index as the 'link' element that we found or generated.
    index = TP.NOT_FOUND;

    len = existingHrefs.getSize();
    for (i = 0; i < len; i++) {
        if (existingHrefs.at(i) === oldHref) {
            index = i;
            break;
        }
    }

    //  If we actually found an index, then grab the element at that spot, set
    //  it's 'href' to the supplied href, adding a query that will ensure that
    //  any caching is busted and it reloads from the server.
    if (index !== TP.NOT_FOUND) {
        currentTopLevelLinkElems.at(index).href = TP.uriAddUniqueQuery(oldHref);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetUnusedStyleRules',
function(aDocument) {

    /**
     * @method documentGetUnusedStyleRules
     * @summary Returns all of the unused CSS style rules for the supplied
     *     document.
     * @description This method will get all of the CSS style rules referenced
     *     in a particular Document and see if any elements in that Document
     *     match those rules at the point in time that this method is invoked.
     * @param {HTMLDocument} aDocument The document to retrieve all unused style
     *     rules for.
     * @exception TP.sig.InvalidDocument
     * @returns {Array} An Array of native browser 'rule' objects representing
     *     the unused CSS rules for the supplied document.
     */

    var unusedRules,
        allRules,

        selectorText,

        i;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    unusedRules = TP.ac();

    allRules = TP.documentGetStyleRules(aDocument);

    for (i = 0; i < allRules.getSize(); i++) {

        //  If this is not a STYLE_RULE, then it's probably some kind of '@'
        //  rule and we can't determine whether those are unused or not without
        //  a *much* more sophisticated analysis.
        if (allRules.at(i).type !== CSSRule.STYLE_RULE) {
            continue;
        }

        selectorText = allRules.at(i).selectorText;

        if (TP.isEmpty(TP.nodeEvaluateCSS(aDocument, selectorText))) {
            unusedRules.push(allRules.at(i));
        }
    }

    return unusedRules;
});

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('elementConvertUnitLengthToPixels',
function(anElement, aValue, targetProperty, wantsTransformed) {

    /**
     * @method elementConvertUnitLengthToPixels
     * @summary A routine that computes a number of pixels from the supplied
     *     CSS unit value.
     * @description Note that the supplied value here must be a 'CSS unit value'
     *     (i.e. '3em' or '27%'). It cannot be a CSS value such as 'normal' or
     *     'inherit'.
     * @param {HTMLElement} anElement The element to use to compute the pixel
     *     value from.
     * @param {String} aValue The size value to convert into pixels.
     * @param {String} targetProperty The name of the property being converted.
     *     This isn't strictly required, but is desired to produce the most
     *     accurate results.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidString
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidStyleDeclaration
     * @returns {Number} The number of pixels that the supplied value will be in
     *     pixels for the supplied Element.
     */

    var targetPropName,

        styleObj,

        elementCurrentStyleVal,
        computedStyle,

        valueInPixels;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aValue)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    //  If the value is not expressed using 'unit length' (i.e. it is a keyword
    //  such as 'inherit', 'initial', 'none', etc.), then we bail out here -
    //  can't do anything.
    if (!TP.regex.CSS_UNIT.test(aValue)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    targetPropName = TP.ifInvalid(targetProperty, 'left');
    targetPropName = targetPropName.toLowerCase();

    styleObj = TP.elementGetStyleObj(anElement);

    //  Capture the inline 'style' for the target property (note that we're
    //  *not* interested in the computed style here - just if any value has been
    //  placed directly in the target property on the 'style' object, either by
    //  JavaScript or by using the 'style' attribute).
    //  Note that if no value has been specified by either of these mechanisms,
    //  this value will be null (or the empty String).
    elementCurrentStyleVal = styleObj[targetPropName];

    //  Set the target property on element to the supplied value (or 0, if the
    //  value isn't valid).
    styleObj[targetPropName] = aValue || 0;

    //  Grab the computed style for the element.
    if (TP.notValid(computedStyle =
                    TP.elementGetComputedStyleObj(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
    }

    //  We wrap this in a try...catch, since sometimes Mozilla throws an
    //  exception when attempting to get the computed value, especially on the
    //  'body' element.
    try {
        //  Get the value in pixels by using the 'getPropertyValue' call of
        //  the computed style, asking for 'pixels' as type of the return value.
        valueInPixels = TP.elementGetPixelValue(
                        anElement,
                        computedStyle.getPropertyValue(targetPropName),
                        targetPropName.asDOMName(),
                        wantsTransformed);
    } catch (e) {
        //  Can't compute the value anyway, so just return 0.
        return 0;
    }

    //  Reset the inline style back to what it was (maybe the empty String...
    //  see above).
    styleObj[targetPropName] = elementCurrentStyleVal;

    //  If the computation returned NaN, be nice and return 0.
    if (TP.isNaN(valueInPixels)) {
        return 0;
    }

    if (TP.isTrue(wantsTransformed)) {
        return TP.elementTransformCSSPixelValue(anElement,
                                                valueInPixels,
                                                targetPropName);
    }

    return valueInPixels;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetComputedStyleObj',
function(anElement) {

    /**
     * @method elementGetComputedStyleObj
     * @summary Returns the computed (resolved) style of the element. The
     *     result of intersecting the various inputs on style which affect the
     *     element in question.
     * @param {Element} anElement The element to inspect.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidDocument
     * @returns {Object} An object whose getPropertyValue function can be used
     *     to get individual style data values.
     */

    var doc;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isDocument(doc = TP.nodeGetDocument(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return TP.nodeGetWindow(doc).getComputedStyle(anElement, null);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPixelValue',
function(anElement, aValue, targetProperty, wantsTransformed) {

    /**
     * @method elementGetPixelValue
     * @summary A handy routine that returns pixel values regardless of what
     *     the CSS units were. This means that web developers can mix and match
     *     measurement units in their style sheets. it is not uncommon to
     *     express something like padding in "em" units while border thickness
     *     is most often expressed in pixels.
     * @param {HTMLElement} anElement The element to use to compute the pixel
     *     value from.
     * @param {String} aValue The size value to convert into pixels.
     * @param {String} targetProperty The name of the property being converted.
     *     This is only required if a percentage value is given, but is desired
     *     to produce the most accurate results.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @exception TP.sig.InvalidElement
     * @returns {Number} The number of pixels that the supplied value will be in
     *     pixels for the supplied Element. Note that this routine can also
     *     return NaN, if it cannot compute a numeric value.
     */

    var val,

        parentElem,

        results,
        numericPart,
        unitPart,
        pixelsPerPoint;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  No value for this property? Then it's pixel value is 0.
    if (TP.isEmpty(aValue)) {
        return 0;
    }

    val = TP.trim(aValue);

    //  If it's just a pixel value, then we can do a simple parse here and
    //  return.
    if (TP.regex.CSS_PIXEL.test(val)) {
        if (TP.isNaN(results = parseFloat(val))) {
            return 0;
        }

        return TP.isTrue(wantsTransformed) ?
                 TP.elementTransformCSSPixelValue(
                                        anElement,
                                        results,
                                        targetProperty) :
                 results;
    }

    //  If the value is not expressed using 'unit length' (i.e. it is a
    //  keyword such as 'inherit', 'initial', 'none', etc.), then we try to
    //  'do the right thing', based on a property name if one was supplied.
    if (!TP.regex.CSS_UNIT.test(val)) {
        switch (val) {
            case 'inherit':

                //  We inherited the property - return whatever our *parent
                //  node* ('inherit' *always* refers to the parent node) has
                //  as a value for this property.
                if (TP.isElement(parentElem = anElement.parentNode)) {
                    return TP.elementGetPixelValue(parentElem,
                                                    val,
                                                    targetProperty,
                                                    wantsTransformed);
                }

                break;

            case 'initial':
                //  TODO: This is a CSS3 value - what to do here?
                return NaN;

            case 'normal':
                //  TODO: Not sure what to do here
                return NaN;

            case 'thin':
            case 'medium':
            case 'thick':

                //  Could be border values... check further
                if (/border.*?Width/.test(targetProperty)) {
                    switch (val) {
                        case 'thin':
                            results = 2;
                            break;

                        case 'medium':
                            results = 4;
                            break;

                        case 'thick':
                            results = 6;
                            break;

                        default:
                            break;
                    }

                    return TP.isTrue(wantsTransformed) ?
                             TP.elementTransformCSSPixelValue(
                                                    anElement,
                                                    results,
                                                    targetProperty) :
                             results;
                }

                return NaN;

                //  Otherwise, return NaN
            case 'auto':
            case 'none':
            default:
                return NaN;
        }

        return;
    }

    //  If the value is expressed using a 'non-relative' unit measurement
    //  (i.e. not '%', 'em' or 'ex'), then we can try to convert it just
    //  using the 'pixelsPerPoint' computation.
    if (TP.regex.CSS_NON_RELATIVE_UNIT.test(val)) {
        results = TP.regex.CSS_NON_RELATIVE_UNIT.exec(val);
        numericPart = parseFloat(results.at(2));
        unitPart = results.at(3);

        //  Grab the number of 'pixels per point'.
        pixelsPerPoint = TP.getPixelsPerPoint();

        //  Based on the units expressed, return the proper number of
        //  pixels.
        switch (unitPart) {
            case 'pt':

                results = pixelsPerPoint * numericPart;

                break;

            case 'in':

                results = pixelsPerPoint * numericPart * 72;

                break;

            case 'pc':

                results = pixelsPerPoint * numericPart * 12;

                break;

            case 'mm':

                results = pixelsPerPoint * (numericPart / (7.2 / 2.54));

                break;

            case 'cm':

                results = pixelsPerPoint * (numericPart / (72 / 2.54));

                break;

            default:
                break;
        }

        return TP.isTrue(wantsTransformed) ?
                 TP.elementTransformCSSPixelValue(
                                        anElement,
                                        results,
                                        targetProperty) :
                 results;
    }

    //  If it's a percentage value and we've been supplied with a target
    //  property, then we can determine the pixel value by calling a routine
    //  that, based on the property name, will return the correct number of
    //  pixels.
    if (TP.regex.PERCENTAGE.test(val)) {
        if (TP.notValid(targetProperty)) {
            TP.ifError() ?
                TP.error('Percentage computation needs target property',
                            TP.CSS_LOG) : 0;

            return 0;
        }

        return TP.elementGetNumericValueFromPercentage(anElement,
                                                        targetProperty,
                                                        val,
                                                        wantsTransformed);
    }

    return TP.elementConvertUnitLengthToPixels(anElement,
                                                val,
                                                targetProperty,
                                                wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPseudoInlineStyleObj',
function(anElement) {

    /**
     * @method elementGetPseudoInlineStyleObj
     * @summary Returns a 'pseudo inline' style object. This is really the
     *     style object from a created CSS rule, since non-(X)HTML elements
     *     don't support the inline '.style' property / the 'style' attribute.
     * @param {HTMLElement} anElement The element to use to compute the pixel
     *     value from.
     * @exception TP.sig.InvalidElement
     * @returns {Object} The inline CSS style object of the supplied element.
     */

    var newSheet,

        styleElem,
        styleSheet,
        sheetRules,

        indexNum,
        rule,

        elemID,
        selectorText,

        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Initially set the flag to say that we haven't created a new sheet.
    newSheet = false;

    //  Try to obtain the style element and its sheet - if its not
    //  available, create one and grab its sheet
    if (!TP.isElement(styleElem =
                        TP.nodeGetElementById(TP.nodeGetDocument(anElement),
                                                'pseudo_inline_rules'))) {
        if (!TP.isElement(styleElem =
                TP.documentAddCSSStyleElement(TP.nodeGetDocument(anElement)))) {
            //  TODO: Raise an exception and return
            void 0;
        }

        //  Uniquely identify the 'pseudo inline style element'
        TP.elementSetAttribute(styleElem, 'id', 'pseudo_inline_rules');

        //  We did create a new sheet
        newSheet = true;
    }

    //  Grab the style sheet object and its rules.

    styleSheet = TP.cssElementGetStyleSheet(styleElem);

    sheetRules = styleSheet.cssRules;

    //  If the supplied element has a style rule index number, then it
    //  must've been assigned that before
    if (TP.isNumber(indexNum = anElement._pseudoInlineRuleIndex)) {
        //  See if we can locate a rule at that index and make sure its a
        //  'style rule' (i.e. not an AT_RULE or something).
        if (TP.isValid(rule = sheetRules[indexNum]) &&
                rule.type === CSSRule.STYLE_RULE) {
            //  Return the style object associated with the rule.
            return rule.style;
        }
    }

    //  Make sure the element has an 'id' attribute and pass true to force
    //  assignment if its not there.
    elemID = TP.lid(anElement, true);

    //  We also use a second attribute to force more specificity.
    TP.elementSetAttribute(anElement, 'pseudoinline', elemID);

    //  Compute the selector text
    selectorText = '#' + elemID + '[pseudoinline="' + elemID + '"]';

    //  If we didn't create a new sheet, then maybe we just lost the rule
    //  somewhere in the existing sheet...

    if (!newSheet) {
        //  We didn't create a new sheet - look for a style rule matching
        for (i = 0; i < sheetRules.length; i++) {
            //  If we find a rule that's both a style rule and where the
            //  selector matches, then shove its index onto the element and
            //  return the style object associated with the rule.
            if (sheetRules[i].type === sheetRules[i].STYLE_RULE &&
                sheetRules[i].selectorText === selectorText) {
                rule = sheetRules[i];
                anElement._pseudoInlineRuleIndex = i;

                return rule.style;
            }
        }
    }

    //  Create a new rule and add it to the end of the stylesheet.
    TP.styleSheetInsertRule(styleSheet, selectorText, '');

    sheetRules = styleSheet.cssRules;

    //  The element's rule index will be the last rule's index
    anElement._pseudoInlineRuleIndex = sheetRules.length - 1;

    //  Return the style object associated with the new rule.
    return sheetRules[sheetRules.length - 1].style;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementTransformCSSPixelValue',
function(anElement, pixelValue, aPropertyName) {

    /**
     * @method elementTransformCSSPixelValue
     * @summary Transforms a pixel value from the given value to a value that
     *     takes into account any CSS transformations that have been applied to
     *     the element.
     * @param {HTMLElement} anElement The element to transform the pixel value
     *     against.
     * @param {Number} pixelValue The pixel value to transform.
     * @param {String} aPropertyName The name of the property that the pixel
     *     value came from. This name needs to have one of the following words
     *     in it in order for the value to convert properly: "top", "right",
     *     "bottom", "left".
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidNumber
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The transformed pixel value.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isNumber(pixelValue)) {
        return TP.raise(this, 'TP.sig.InvalidNumber');
    }

    if (!TP.isString(aPropertyName)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  If the property name is either a *[t|T]op* or *[b|B]ottom*, then we're
    //  converting the Y value
    if (/(top|bottom)/i.test(aPropertyName)) {
        return TP.elementLocalToGlobalXY(anElement, 0, pixelValue).last();
    } else if (/(left|right)/i.test(aPropertyName)) {
        //  Otherwise, if the property name is either a *[l|L]eft* or
        //  *[r|R]ight*, then we're converting the X value
        return TP.elementLocalToGlobalXY(anElement, pixelValue, 0).first();
    } else {
        return pixelValue;
    }
});

//  ------------------------------------------------------------------------
//  STYLE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('cssElementResolveVirtualURIs',
function(anElement) {

    /**
     * @method cssElementResolveVirtualURIs
     * @summary Resolves any virtual URIs in the stylesheet of the supplied
     *     element. The element should be a CSS 'link' or 'style' element.
     * @param {Element} anElement The 'link' or 'style' element to resolve the
     *     virtual URIs in.
     * @exception TP.sig.InvalidElement
     */

    var replaceURLValues,

        sheet,
        rules,

        i,

        currentRuleText,
        newRuleText;

    //  Make sure we were handed a 'link' or 'style' element.
    if (!TP.isElement(anElement) ||
        TP.elementGetLocalName(anElement).toLowerCase() !== 'link' &&
        TP.elementGetLocalName(anElement).toLowerCase() !== 'style') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Define a Function that can replace 'url(...)' values.
    replaceURLValues = function(origRuleText) {

        var replacedRuleText;

        //  Scan the content for url(...) values. If found, resolve their
        //  value.

        TP.regex.CSS_URL_VALUE.lastIndex = 0;
        replacedRuleText = origRuleText.replace(
                TP.regex.CSS_URL_VALUE,
                function(wholeMatch, leadingText, locationValue) {

                    var loc;

                    if (TP.notEmpty(locationValue)) {

                        //  Compute the value for the URL in the
                        //  url(...) property by joining it with the
                        //  'collection location' for the stylesheet it
                        //  was found in.
                        loc = TP.uc(locationValue).getLocation();
                    }

                    //  Return the String that must exactly replace what
                    //  the RegExp matched (we default to enclosing the
                    //  value in double quotes - the RegExp strips all
                    //  quoting anyway).
                    return 'url("' + loc + '")';
                });

        return replacedRuleText;
    };

    //  Grab the stylesheet rules.
    sheet = TP.cssElementGetStyleSheet(anElement);
    rules = sheet.cssRules;

    //  Iterate over them and, if they're of type STYLE_RULE or FONT_FACE_RULE,
    //  then use the Function above to see if they need to have URI content
    //  replaced.
    for (i = 0; i < rules.length; i++) {

        currentRuleText = rules[i].cssText;

        TP.regex.CSS_URL_VALUE.lastIndex = 0;
        if (TP.regex.CSS_URL_VALUE.test(currentRuleText)) {

            newRuleText = replaceURLValues(currentRuleText);

            sheet.deleteRule(i);
            sheet.insertRule(newRuleText, i);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('cssLinkElementFlattenImports',
function(anElement) {

    /**
     * @method cssLinkElementFlattenImports
     * @summary 'Flatten's any @import statements in the supplied 'link'
     *     element's out into 'link' elements in the supplied element's
     *     document. Note that this method will *not* overwrite any existing
     *     'link' elements that have the same 'href' as the @import'ed
     *     stylesheet.
     * @param {Element} anElement The 'link' element to flatten the CSS @imports
     *     under.
     * @exception TP.sig.InvalidElement
     */

    var doc,

        currentTopLevelLinkElems,

        existingHrefs,

        sheets,
        startSheet,

        hrefsToAdd,

        len,
        i,

        sheetHref,

        newLinkElem;

    //  Make sure we were handed a 'link' element.
    if (!TP.isElement(anElement) ||
        TP.elementGetLocalName(anElement).toLowerCase() !== 'link') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    doc = TP.nodeGetDocument(anElement);

    //  Gather the hrefs of the current 'top-level' 'link' elements in the
    //  supplied element's document. The reason we do this rather than just
    //  query for an element's authored 'href=' value is that the '.href'
    //  property will be the *fully expanded* href value and that's the one(s)
    //  we'll need for comparison.
    currentTopLevelLinkElems =
                TP.byCSSPath('link[rel="stylesheet"]', doc, false, false);
    existingHrefs = currentTopLevelLinkElems.collect(
                                                function(anElem) {
                                                    return anElem.href;
                                                });

    //  Now, gather the sheets (recursively) for all of the @imports referenced
    //  by the supplied 'link' element
    sheets = TP.ac();

    //  Start with the style sheet of the supplied element.
    startSheet = TP.cssElementGetStyleSheet(anElement);
    sheets.push(startSheet);

    //  This method will recursively gather the @import sheets (in order, to
    //  preserve CSS specificity order).
    sheets = sheets.concat(TP.styleSheetGetImportSheets(startSheet));

    hrefsToAdd = TP.ac();

    //  Iterate over them and, if the href *isn't* in the list of the top-level
    //  'link' elements above, add it to the list to process.
    len = sheets.getSize();
    for (i = 0; i < len; i++) {

        sheetHref = sheets.at(i).href;

        if (!existingHrefs.contains(sheetHref)) {
            hrefsToAdd.push(sheetHref);
        }
    }

    //  If there are hrefs to add, generate a 'link' element for each one.
    if (TP.notEmpty(hrefsToAdd)) {

        len = hrefsToAdd.getSize();
        for (i = 0; i < len; i++) {

            newLinkElem = TP.documentAddCSSLinkElement(doc, hrefsToAdd.at(i));
            TP.elementSetAttribute(newLinkElem, 'tibet:flattened',
                                    'true', true);
        }

        //  We added a bunch of hrefs representing the (recursively gathered)
        //  @import'ed URLs. We should disable the main 'link' element that was
        //  holding them all.
        anElement.disabled = true;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('cssStyleElementGetContent',
function(anElement) {

    /**
     * @method cssStyleElementGetContent
     * @summary Returns the all of the CSS text under anElement, which should
     *     be a 'style' element. NB: The caller *must* supply a 'style' element
     *     here, or an 'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The 'style' element to retrieve the CSS text
     *     for.
     * @exception TP.sig.InvalidElement
     * @returns {String} The CSS text under anElement.
     */

    if (!TP.isElement(anElement) ||
        TP.elementGetLocalName(anElement).toLowerCase() !== 'style') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.notValid(anElement.firstChild)) {
        return '';
    }

    return anElement.firstChild.nodeValue;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('cssStyleElementSetContent',
function(anElement, styleText) {

    /**
     * @method cssStyleElementSetContent
     * @summary Sets the all of the CSS text under anElement, which should be a
     *     'style' element. NB: The caller *must* supply a 'style' element here,
     *     or an 'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The 'style' element to set the CSS text for.
     * @param {String} styleText The CSS text to use as the rule text for the
     *     style element.
     * @exception TP.sig.InvalidElement
     */

    var styleTextNode;

    if (!TP.isElement(anElement) ||
        TP.elementGetLocalName(anElement).toLowerCase() !== 'style') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  If there's no valid text node under the style element, create one
    //  with the content.
    if (!TP.isTextNode(styleTextNode = anElement.firstChild)) {
        TP.nodeAppendChild(
            anElement,
            TP.nodeGetDocument(anElement).createTextNode(styleText),
            false);
    } else {
        styleTextNode.nodeValue = styleText;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleRuleGetRuleInfo',
function(aStyleRule, allDocumentStyleSheets) {

    /**
     * @method styleRuleGetRuleInfo
     * @summary Returns an Array of TP.core.Hashes that contain style
     *     information for the supplied rule.
     * @description The reason that an Array is returned here is that the rule
     *     may have simple selectors separated by a ','. Each simple selector is
     *     returned in its own entry along with the rest of the rule
     *     information.
     * @param {CSSStyleRule} aStyleRule The style rule to retrieve the rule
     *     information for.
     * @param {CSSStyleSheet[]} allDocumentStyleSheets All of the style sheets
     *     that are present in the same document as the style rule is in.
     * @returns {TP.core.Hash[]} An Array of TP.core.Hash objects with style
     *     rule information for each style rule that matches the supplied
     *     element.
     *          originalSelector:   The original 'whole' selector
     *          selector:           The simple selector split out from the whole
     *                              selector.
     *          specificityInfo:    Specificity information about the selector.
     *                              See the calculateSingleCSSSelectorSpecificity()
     *                              method for more information on the values
     *                              here.
     *          sheetLocation:      The URL location of the stylesheet.
     *          sheetPosition:      The position of the stylesheet in the list of
     *                              stylesheets in a document.
     *          rulePosition:       The position of the rule in the list of
     *                              rules in its stylesheet.
     *          rule:               The original CSSStyleRule object.
     * @exception TP.sig.InvalidParameter
     */

    var rulePos,
        ruleStyleSheet,

        sheetLoc,

        sheetPos,
        possiblePos,
        sheetMatchingHref,

        selectorText,
        simpleSelectors,

        entries,

        selectorsLen,
        i,

        ruleEntry;

    if (!TP.isStyleRule(aStyleRule)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Grab the rule's stylesheet
    ruleStyleSheet = aStyleRule.parentStyleSheet;

    //  Compute the rule's 'position' within its stylesheet. This is used in
    //  some scenarios of selector sorting.
    rulePos = TP.ac(ruleStyleSheet.cssRules).indexOf(aStyleRule);

    //  Grab the rule's location using the TIBET mechanism to do so. This will
    //  use other metadata if the original href that loaded the sheet is not
    //  present.
    sheetLoc = TP.styleSheetGetLocation(ruleStyleSheet);

    //  Now try to compute the sheet's 'position' within its overall document.
    //  Because sometimes the sheet cannot be found in the document's set of
    //  stylesheets, an alternate method is also used that compares the sheet's
    //  'hrefs' and will return that.
    sheetPos = allDocumentStyleSheets.indexOf(ruleStyleSheet);
    if (sheetPos === TP.NOT_FOUND) {
        possiblePos = -1;
        sheetMatchingHref = allDocumentStyleSheets.detect(
                               function(aSheet, index) {
                                   possiblePos = index;
                                   return aSheet.href === ruleStyleSheet.href;
                               });
        if (TP.isValid(sheetMatchingHref)) {
            sheetPos = possiblePos;
        }
    }

    selectorText = aStyleRule.selectorText.trim();

    entries = TP.ac();

    simpleSelectors = selectorText.split(',');

    //  Iterate over all of the simple selectors, making an entry for each one.
    selectorsLen = simpleSelectors.getSize();
    for (i = 0; i < selectorsLen; i++) {
        ruleEntry = TP.hc(
            'originalSelector',
            selectorText,
            'selector',
            simpleSelectors.at(i).trim(),
            'specificityInfo',
            TP.calculateSingleCSSSelectorSpecificity(simpleSelectors.at(i)),
            'sheetLocation',
            sheetLoc,
            'sheetPosition',
            sheetPos,
            'rulePosition',
            rulePos,
            'rule',
            aStyleRule);

        entries.push(ruleEntry);
    }

    return entries;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleRuleGetSourceInfo',
function(aStyleRule, sourceASTs) {

    /**
     * @method styleRuleGetSourceInfo
     * @summary Returns source information for the supplied style rule.
     * @param {CSSStyleRule} aStyleRule The style rule to retrieve the source
     *     information for.
     * @param {TP.core.Hash} sourceASTs A cache, supplied by the caller, that
     *     this method will use to generate the AST for a particular sheet only
     *     once and then cache in this object. In this way, this method can be
     *     called more than once (maybe in a loop) and the ASTs will not be
     *     generated for each rule in each sheet.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.core.Hash} A hash containing the source information for the
     *     supplied rule.
     */

    var results,

        ownerSheet,
        nativeRuleIndex,

        sheetLoc,
        styleElem,

        httpObj,
        srcText,

        request,

        sheetAST,

        vendorPrefix,

        rules,

        index,
        len,
        i,
        rule,

        embeddedRules,
        embeddedLength,

        args,

        ruleInfo;

    if (!TP.isStyleRule(aStyleRule)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  First, we need to get the stylesheet of the style rule and its index
    //  in the stylesheet
    results = TP.styleRuleGetStyleSheetAndIndex(aStyleRule);

    ownerSheet = results.first();
    nativeRuleIndex = results.last();

    sheetLoc = ownerSheet.href;

    //  See if a Hash was passed into that caches sheet ASTs. This allows the
    //  caller to process an entire batch of rules without fetching the source
    //  and building an AST for the entire CSS sheet for each call into this
    //  method, which only processes a single rule.

    /* eslint-disable no-extra-parens */
    if (!TP.isHash(sourceASTs) ||
        (TP.isHash(sourceASTs) &&
            TP.notValid(sheetAST = sourceASTs.at(sheetLoc)))) {
    /* eslint-enable no-extra-parens */

        //  If there is no sheet location, then it must be a sheet that was
        //  generated for an inline 'style' element.
        if (!TP.isString(sheetLoc)) {
            if (!TP.isElement(styleElem = ownerSheet.ownerNode)) {
                return TP.hc();
            }

            //  The sheet location is the global ID of the style element and the
            //  source text to process is the content of that element.
            sheetLoc = TP.gid(styleElem);
            srcText = TP.nodeGetTextContent(styleElem);
        } else {

            //  Otherwise, it's an external sheet - fetch it's contents
            //  *synchronously*.
            //  TODO:   rebuilt to eliminate the sync call here.
            request = TP.request('async', false);
            TP.httpGet(sheetLoc, request);
            httpObj = request.at('commObj');
            srcText = httpObj.responseText;
        }

        //  If we couldn't get source text, then we return an empty Hash.
        if (TP.isEmpty(srcText)) {
            return TP.hc();
        }

        //  Generate an AST from the CSS text.
        sheetAST = TP.extern.cssParser.parse(
            srcText,
            {
                source: sheetLoc
            });

        if (TP.isHash(sourceASTs)) {
            sourceASTs.atPut(sheetLoc, sheetAST);
        }
    }

    //  Compute a vendor prefix.
    if (TP.sys.isUA('GECKO')) {
        vendorPrefix = '-moz-';
    } else if (TP.sys.isUA('IE')) {
        vendorPrefix = '-ms-';
    } else if (TP.sys.isUA('WEBKIT')) {
        vendorPrefix = '-webkit-';
    }

    //  Now iterate through all results in the AST, looking for the style rule
    //  with the same index.

    //  Note here how we make a copy of this Array, in case we modify it below
    //  by splicing @media rules into it.

    //  NB: We're going after all of the rules (including those imported from
    //  @import statements) by going after the '.rules' Array here, not
    //  '.cssRules'.
    rules = TP.copy(sheetAST.stylesheet.rules);

    index = 0;

    len = rules.getSize();
    for (i = 0; i < len; i++) {
        rule = rules.at(i);

        //  We process @media rules by grabbing their inner style rules and
        //  splicing them into the Array and adjusting our 'len' to count to the
        //  end. This is important because our native rule index will have been
        //  computed taking these rules into account and so we need to do so
        //  here.
        if (rule.type === 'media') {

            embeddedRules = rule.rules;
            embeddedLength = embeddedRules.length;

            args = TP.ac(i + 1, 0).concat(embeddedRules);
            Array.prototype.splice.apply(rules, args);
            len += embeddedLength;

            continue;
        }

        //  We skip comments
        if (rule.type === 'comment') {
            continue;
        }

        //  We skip @keyframes rules that don't pertain to our platform. The
        //  native rule index, as calculated by the browser, won't have counted
        //  rules that are not for our current platform.
        if (rule.type === 'keyframes' && rule.vendor !== vendorPrefix) {
            continue;
        }

        //  We skip @document rules that don't pertain to our platform. The
        //  native rule index, as calculated by the browser, won't have counted
        //  rules that are not for our current platform.
        if (rule.type === 'document' && rule.vendor !== vendorPrefix) {
            continue;
        }

        //  If the index is the same as the native index calculated for our
        //  rule, then we break and exit.
        if (index === nativeRuleIndex) {

            ruleInfo = rule;
            break;
        }

        index++;
    }

    if (TP.isValid(ruleInfo)) {
        return TP.hc(ruleInfo);
    }

    return TP.hc();
}, {
    dependencies: [TP.extern.cssParser]
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleRuleGetStyleSheet',
function(aStyleRule) {

    /**
     * @method styleRuleGetStyleSheet
     * @summary Returns the native style sheet object associated with the
     *     supplied style rule.
     * @param {CSSStyleRule} aStyleRule The style rule to retrieve the
     *     stylesheet of.
     * @exception TP.sig.InvalidParameter
     * @returns {CSSStyleSheet} The stylesheet object containing the rule.
     */

    if (!TP.isStyleRule(aStyleRule)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  The DOM standard is to just return the parentStyleSheet property of
    //  the rule.

    return aStyleRule.parentStyleSheet;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleRuleGetStyleSheetAndIndex',
function(aStyleRule) {

    /**
     * @method styleRuleGetStyleSheetAndIndex
     * @summary Returns the native style sheet object associated with the
     *     supplied style rule and the index that the rule can be found within
     *     that style sheet.
     * @param {CSSStyleRule} aStyleRule The style rule to retrieve the
     *     stylesheet of.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidStyleSheet
     * @returns {Array} An Array of the stylesheet object containing the rule
     *     and the index the rule can be found in the sheet.
     */

    var styleSheet,
        allRules,
        i;

    if (!TP.isStyleRule(aStyleRule)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    styleSheet = TP.styleRuleGetStyleSheet(aStyleRule);

    if (!TP.isStyleSheet(styleSheet)) {
        return TP.raise(this, 'TP.sig.InvalidStyleSheet');
    }

    //  NB: Note how we do *not* expand imports here
    allRules = TP.styleSheetGetStyleRules(styleSheet, false);

    for (i = 0; i < allRules.getSize(); i++) {
        if (allRules.at(i) === aStyleRule) {
            return TP.ac(styleSheet, i);
        }
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetGetImportHrefs',
function(aStylesheet, expandImports) {

    /**
     * @method styleSheetGetImportHrefs
     * @summary Retrieves the imported hrefs from the supplied stylesheet.
     * @param {CSSStyleSheet} aStylesheet The style sheet to retrieve the
     *     imported hrefs from.
     * @param {Boolean} [expandImports=true] Whether or not @import statements
     *     should be recursively 'expanded' and the hrefs gathered from them
     *     too. This defaults to true.
     * @exception TP.sig.InvalidParameter
     * @returns {String[]} A list of imported hrefs.
     */

    var resultSheets,

        hrefs;

    if (!TP.isStyleSheet(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    resultSheets = TP.styleSheetGetImportSheets(aStylesheet, expandImports);

    hrefs = resultSheets.collect(
                            function(aSheet) {
                                return aSheet.href;
                            });

    return hrefs;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetGetImportSheets',
function(aStylesheet, expandImports) {

    /**
     * @method styleSheetGetImportSheets
     * @summary Retrieves the imported stylesheets from the supplied stylesheet.
     * @param {CSSStyleSheet} aStylesheet The style sheet to retrieve the
     *     imported stylesheets from.
     * @param {Boolean} [expandImports=true] Whether or not @import statements
     *     should be recursively 'expanded' and the stylesheets gathered from
     *     them too. This defaults to true.
     * @exception TP.sig.InvalidParameter
     * @returns {CSSStyleSheet[]} A list of imported stylesheets.
     */

    var resultSheets,
        sheetRules,

        shouldExpand,

        i;

    if (!TP.isStyleSheet(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    shouldExpand = TP.ifInvalid(expandImports, true);

    resultSheets = TP.ac();

    //  Grab the rules from the sheet.
    sheetRules = aStylesheet.cssRules;

    //  Loop over each rule in the sheet and, if the rule is an 'IMPORT_RULE',
    //  add it to our result Array - and recurse if the shouldExpand parameter
    //  is true.
    for (i = 0; i < sheetRules.length; i++) {

        //  If the rule is an '@import' rule, call this function recursively
        //  on the rule's 'stylesheet' property (which will be the actual
        //  stylesheet object of the stylesheet being imported) and add all
        //  of the hrefs found there to our result array.
        if (sheetRules[i].type === CSSRule.IMPORT_RULE) {

            if (shouldExpand) {
                resultSheets.addAll(
                    TP.styleSheetGetImportSheets(sheetRules[i].styleSheet));
            }

            resultSheets.push(sheetRules[i].styleSheet);
        }
    }

    return resultSheets;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetGetLocation',
function(aStylesheet) {

    /**
     * @method styleSheetGetLocation
     * @summary Retrieves the location for the supplied stylesheet. Note that
     *     some stylesheet, like those produced from compiled or processed CSS,
     *     will be associated with an XHTML 'style' element that doesn't have an
     *     'href' pointing back to the source of the sheet. In this case, we
     *     have stamped a TIBETan attribute on it that points back to the
     *     original source.
     * @param {CSSStyleSheet} aStylesheet The style sheet to retrieve the
     *     location of.
     * @exception TP.sig.InvalidParameter
     * @returns {String} The location URL of the source of the stylesheet.
     */

    var loc;

    if (!TP.isStyleSheet(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  If there is an 'href', use it.
    loc = aStylesheet.href;
    if (TP.notEmpty(loc)) {
        return loc;
    }

    //  Otherwise, if we can get to the stylesheet's owner node, return whatever
    //  is stored in 'tibet:originalHref'.
    if (TP.isElement(aStylesheet.ownerNode)) {
        return TP.elementGetAttribute(
                    aStylesheet.ownerNode, 'tibet:originalHref', true);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetGetStyleRules',
function(aStylesheet, expandImports) {

    /**
     * @method styleSheetGetStyleRules
     * @summary Retrieves the rules from the supplied stylesheet. Note that
     *     this function also recursively descends through CSS @import
     *     statements to retrieve any imported style rules.
     * @param {CSSStyleSheet} aStylesheet The style sheet to retrieve the rules
     *     from.
     * @param {Boolean} [expandImports=true] Whether or not @import statements
     *     should be recursively 'expanded' and the rules gathered from them
     *     from. This defaults to true.
     * @exception TP.sig.InvalidParameter
     * @returns {Array} A list of CSSStyleRule objects in the supplied
     *     CSSStyleSheet, including those that may have been imported using an.
     *     @import statement.
     */

    var resultRules,
        sheetRules,

        shouldExpand,

        i;

    if (!TP.isStyleSheet(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    shouldExpand = TP.ifInvalid(expandImports, true);

    resultRules = TP.ac();

    //  Grab the rules from the sheet.
    sheetRules = aStylesheet.cssRules;

    //  Loop over each rule in the sheet and add the rule to our result
    //  Array.
    for (i = 0; i < sheetRules.length; i++) {
        //  If the rule is an '@import' rule, call this function recursively
        //  on the rule's 'stylesheet' property (which will be the actual
        //  stylesheet object of the stylesheet being imported) and add all
        //  of the rules found there to our result array.
        if (shouldExpand && sheetRules[i].type === CSSRule.IMPORT_RULE) {

            if (TP.isValid(sheetRules[i].styleSheet)) {
                resultRules.addAll(
                    TP.styleSheetGetStyleRules(sheetRules[i].styleSheet));
            }
        } else {
            resultRules.push(sheetRules[i]);
        }
    }

    return resultRules;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetGetStyleRulesMatching',
function(aStylesheet, selectorText) {

    /**
     * @method styleSheetGetStyleRulesMatching
     * @summary Retrieves the rules from the supplied stylesheet whose selector
     *     matches the supplied selector text. Note that this function also
     *     recursively descends through CSS @import statements to retrieve any
     *     imported style rules.
     * @param {CSSStyleSheet} aStylesheet The style sheet to retrieve the rules
     *     from.
     * @param {String} selectorText The text of the selector to match.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidString
     * @returns {Array} A list of CSS rules in the supplied style sheet,
     *     including those that may have been imported using an. @import
     *     statement, whose selector match the supplied selector text.
     */

    var resultRules,
        sheetRules,

        i;

    if (!TP.isStyleSheet(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.isEmpty(selectorText)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    resultRules = TP.ac();

    //  Grab the rules from the sheet.
    sheetRules = aStylesheet.cssRules;

    //  Loop over each rule in the sheet and add the rule to our result
    //  Array.
    for (i = 0; i < sheetRules.length; i++) {
        //  If the rule is an '@import' rule, call this function recursively
        //  on the rule's 'stylesheet' property (which will be the actual
        //  stylesheet object of the stylesheet being imported) and add all
        //  of the rules found there to our result array.
        if (sheetRules[i].type === CSSRule.IMPORT_RULE) {
            resultRules.addAll(
                    TP.styleSheetGetStyleRulesMatching(
                                    sheetRules[i].styleSheet,
                                    selectorText));
        } else if (sheetRules[i].selectorText === selectorText) {
            resultRules.push(sheetRules[i]);
        }
    }

    return resultRules;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetInsertRule',
function(aStylesheet, selectorText, ruleText, ruleIndex) {

    /**
     * @method styleSheetInsertRule
     * @summary Inserts a rule into the stylesheet specified at the specified
     *     rule index. Note that the rule text should *not* have the leading and
     *     trailing brackets.
     * @param {CSSStyleSheet} aStylesheet The style sheet to add the rule to.
     * @param {String} selectorText The CSS selectorText to use when applying
     *     the rule.
     * @param {String} ruleText The style text of the rule.
     * @param {Number} ruleIndex The index to insert the style rule at. If not
     *     supplied, the rule will be inserted at the end.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidString
     * @returns {Number} The index of the newly created rule within the
     *     stylesheet element's rule set. This is important in case the rule
     *     needs to be deleted later. If the index was supplied to this method,
     *     this value will be the same as that supplied.
     */

    var theRuleText,

        newRuleIndex,

        ownerTPElem;

    if (!TP.isStyleSheet(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  NB: We allow empty rule text
    if (TP.isEmpty(selectorText)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    theRuleText = TP.ifInvalid(ruleText, '');

    newRuleIndex = TP.ifInvalid(ruleIndex, aStylesheet.cssRules.length);

    aStylesheet.insertRule(TP.join(selectorText, '{', theRuleText, '}'),
                            newRuleIndex);

    if (TP.isElement(aStylesheet.ownerNode)) {

        ownerTPElem = TP.wrap(aStylesheet.ownerNode);

        //  Signal from our (wrapped) owner element that we a style rule.
        TP.signal(TP.tpdoc(aStylesheet.ownerNode),
                    'TP.sig.MutationStyleChange',
                    TP.hc('mutationTarget', ownerTPElem));
    }

    return newRuleIndex;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$styleSheetRefreshAppliedRulesCaches',
function(aStylesheet) {

    /**
     * @method $styleSheetRefreshAppliedRulesCaches
     * @summary Refreshes all style rules for every element that will match
     *     style rules in the supplied style sheet.
     *     The end result of running this function is that every element in the
     *     document will have a 'TP.APPLIED_RULES' property that contains an
     *     Array of CSS style rules from the supplied stylesheet that apply to
     *     it.
     * @param {CSSStyleSheet} aStylesheet The style sheet to obtain the rules
     *     from.
     * @exception TP.sig.InvalidParameter
     */

    var sheetRules,

        parentSS,

        doc,

        leni,
        i,
        aRule,

        elementsMatchingRule,

        lenj,
        j,
        matchingElement,

        appliedRules;

    if (!TP.isStyleSheet(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Iterate (if necessary) to find the stylesheet associated with the actual
    //  node (link, style, etc. element) that inserted it (because of @import,
    //  the supplied style sheet's 'parentStyleSheet' might not be that sheet).
    parentSS = aStylesheet;
    while (parentSS.parentStyleSheet) {
        parentSS = parentSS.parentStyleSheet;
    }

    //  If the stylesheet came from a private TIBET stylesheet (normally
    //  used for IDE or other purposes), then don't consider it.
    if (parentSS.ownerNode[TP.TIBET_PRIVATE]) {
        return;
    }

    //  Grab all the stylesheets's CSS rules.
    sheetRules = TP.styleSheetGetStyleRules(aStylesheet);

    doc = TP.nodeGetDocument(parentSS.ownerNode);

    //  Iterate over them, querying the document for any elements that match
    //  the selector text of the rule. Then, iterate over those elements and add
    //  the rule to its 'appliedRules' Array.
    leni = sheetRules.getSize();
    for (i = 0; i < leni; i++) {

        aRule = sheetRules.at(i);

        //  Not a CSSRule.STYLE_RULE? Must be an @import or a @namespace - move
        //  on.
        if (aRule.type !== CSSRule.STYLE_RULE) {
            continue;
        }

        //  Grab any elements that match the rule's selector
        elementsMatchingRule = TP.nodeEvaluateCSS(doc, aRule.selectorText);

        //  Iterate over those elements, and add the rule object to that
        //  element's list of applicable rules
        lenj = elementsMatchingRule.getSize();
        for (j = 0; j < lenj; j++) {

            matchingElement = elementsMatchingRule.at(j);

            appliedRules = matchingElement[TP.APPLIED_RULES];

            //  If the element doesn't have a TP.APPLIED_RULES property, we
            //  *don't* create one here. Otherwise, that cache will be
            //  out-of-date because it will only reflect the rules in the
            //  imported sheet. Much better to not install one and let the
            //  element force a refresh of the document styles, which will
            //  reflect all of the rules from all of the sheets that will be
            //  applied to this element.
            if (TP.notValid(appliedRules)) {
                continue;
            }

            appliedRules.push(aRule);
            appliedRules.unique();
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetRemoveRule',
function(aStylesheet, ruleIndex) {

    /**
     * @method styleSheetRemoveRule
     * @summary Removes the stylesheet rule at the rule index of the stylesheet
     *     element specified.
     * @param {CSSStyleSheet} aStylesheet The style sheet to remove the rule
     *     from.
     * @param {Number} ruleIndex The index of the rule within the stylesheet to
     *     remove.
     * @exception TP.sig.InvalidParameter
     */

    var ownerTPElem;

    if (!TP.isStyleSheet(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  The W3C standard is 'deleteRule'.
    aStylesheet.deleteRule(ruleIndex);

    if (TP.isElement(aStylesheet.ownerNode)) {

        ownerTPElem = TP.wrap(aStylesheet.ownerNode);

        //  Signal from our (wrapped) owner element that we a style rule.
        TP.signal(TP.tpdoc(aStylesheet.ownerNode),
                    'TP.sig.MutationStyleChange',
                    TP.hc('mutationTarget', ownerTPElem));
    }

    return;
});

//  ------------------------------------------------------------------------
//  ELEMENT-LEVEL FUNCTIONS
//  ------------------------------------------------------------------------

TP.definePrimitive('cssElementGetStyleSheet',
function(anElement) {

    /**
     * @method cssElementGetStyleSheet
     * @summary Returns the CSS style sheet object belonging to anElement,
     *     which must be either a 'link' or a 'style' element. NB: The caller
     *     *must* supply a 'link' or 'style' element here, or an
     *     'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The element to retrieve the CSS style sheet
     *     object for.
     * @exception TP.sig.InvalidElement
     * @returns {CSSStyleSheet} The style sheet object.
     */

    var localName;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    localName = TP.elementGetLocalName(anElement).toLowerCase();

    if (localName !== 'link' && localName !== 'style') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    return anElement.sheet;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
