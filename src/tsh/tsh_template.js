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
 * @type {TP.tsh.template}
 * @summary A subtype of TP.core.ElementNode that knows how to define XML, XSLT
 *     and JavaScript templates and register them with the system. The resulting
 *     templates can be leveraged by tsh:transform and TP.core.TemplatedNode in
 *     particular.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:template');

TP.tsh.template.addTraits(TP.tsh.Element);

TP.tsh.template.Type.set('uriAttrs', TP.ac('src'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.template.Type.defineMethod('processJSTemplate',
function(anElement, aName, aURI) {

    /**
     * @method processJSTemplate
     * @summary Sets up a JavaScript template using information given by the
     *     supplied Element. The template string can be found in an external
     *     file, or in child content (preferably in a CDATA). When an external
     *     file is used the root element is expected to contain the template
     *     text within a CDATA block.
     * @param {Element} anElement The request command node.
     * @param {String} aName The template's registered name.
     * @param {TP.core.URI} aURI The src URI, if any.
     * @exception TP.sig.InvalidTemplate
     * @returns {Function} The template function created, if any.
     */

    var result,
        str,
        templateNode,
        func;

    if (TP.isURI(aURI)) {
        result = aURI.getResourceNode(TP.hc('async', false));
        if (TP.isDocument(result)) {
            //  Extract the text content of the root node, it's only there
            //  so we have a place for a CDATA block.
            str = TP.nodeGetTextContent(result.documentElement);
        }
    }

    //  Fallback is child content as long as the URI was valid, even if it
    //  didn't load.
    if (!TP.isString(str) || TP.isEmpty(str)) {
        //  Prefer CDATA section content.
        if (TP.isCDATASectionNode(templateNode = TP.nodeGetFirstChildByType(
                                            anElement,
                                            Node.CDATA_SECTION_NODE))) {
            str = TP.nodeGetTextContent(templateNode);
        } else {
            //  Not best-practice, but we'll move on with trying to get text
            //  content and warn about the CDATA section usage.
            str = TP.nodeGetTextContent(anElement);

            TP.ifWarn() ?
                TP.warn('Template not found in CDATA block for: ' +
                        this.asString(), TP.LOG) : 0;
        }
    }

    //  If we couldn't find template content via src= or child content we
    //  exit.
    if (!TP.isString(str) || TP.isEmpty(str)) {
        return this.raise('TP.sig.InvalidTemplate',
                            'Empty or invalid template for: ' +
                            this.asString());
    }

    //  If the escape attribute is present it means the template was
    //  written with whitespace for readability, but that whitespace should
    //  be escaped before the template is used/processed.
    if (TP.elementGetAttribute(anElement, 'escape') === 'true') {
        str = str.escapeWhitespace();
    }

    //  Now that we've obtained the template, go ahead and compile, force
    //  the cache lookup to be skipped, and force the result into cache.
    //  This causes the Function object to be cached and replace any entry
    //  that was registered there before under that name.
    func = str.compile(aName, true, true);
    if (!TP.isFunction(func)) {
        return this.raise('TP.sig.InvalidTemplate',
                            'JS template failed to compile for: ' +
                            this.asString());
    }

    return func;
});

//  ------------------------------------------------------------------------

TP.tsh.template.Type.defineMethod('processXMLTemplate',
function(anElement, aName, aURI) {

    /**
     * @method processXMLTemplate
     * @summary Sets up an XML template using information given by the supplied
     *     Element. When an external file is used the entire root node and all
     *     descendants are considered the template.
     * @param {Element} anElement The request command node.
     * @param {String} aName The template's registered name.
     * @param {TP.core.URI} aURI The src URI, if any.
     * @exception TP.sig.InvalidDocument
     * @returns {Element|Array} The new element for tshCompile processing or an
     *     array with the new element and a processing constant such as
     *     TP.DESCEND.
     */

    var result,
        elements,
        len,
        i,
        child,
        fragment,
        node;

    if (TP.isURI(aURI)) {
        result = aURI.getResourceNode(TP.hc('async', false));

        //  Need to add the TP.w3.Xmlns.TIBET namespace so that other
        //  attributes will work.
        if (TP.isDocument(result)) {
            TP.elementAddNamespace(result.documentElement,
                                    'tibet',
                                    TP.w3.Xmlns.TIBET);
        }
    }

    //  Fallback is child content as long as the URI was valid, even if it
    //  didn't load.
    if (!TP.isDocument(result)) {
        //  NOTE that relying on child elements means any text content must
        //  be enclosed in an element.
        elements = TP.nodeGetChildElements(anElement);

        // Prefer singly-rooted templates, but fragment-based processing can
        // be done.
        switch (elements.getSize()) {
            case 0:

                return this.raise('TP.sig.InvalidTemplate',
                                    'Empty or invalid template for: ' +
                                    this.asString());

            case 1:

                node = elements.first();

                //  Clone the template so that we don't mess up its unique
                //  document (which might be shared across multiple
                //  TP.tsh.template occurrences).
                node = TP.nodeCloneNode(node, true);
                TP.elementAddNamespace(node, 'tibet', TP.w3.Xmlns.TIBET);

                //  Create a TP.core.XMLDocumentNode from its String
                //  representation so we truly create a new Document.
                result = TP.doc(TP.str(node));

                break;

            default:
                //  Have to create a fragment.
                fragment = TP.documentCreateFragment(
                                        TP.nodeGetDocument(anElement));

                len = elements.getSize();
                for (i = 0; i < len; i++) {
                    child = elements.at(i);
                    child = TP.nodeCloneNode(child, true);
                    TP.elementAddNamespace(child,
                                            'tibet',
                                            TP.w3.Xmlns.TIBET);
                    fragment.appendChild(child);
                }

                result = fragment;

                break;
        }
    }

    if (!TP.isNode(result)) {
        return this.raise('TP.sig.InvalidTemplate',
                            'Unable to acquire XML document for: ' +
                            this.asString());
    }

    //  For XML node templates, since we don't have a source URL here, we
    //  use a URN and register it under the template name.
    TP.uc(TP.TIBET_URN_PREFIX + aName).setResource(TP.wrap(result));

    return result;
});

//  ------------------------------------------------------------------------

TP.tsh.template.Type.defineMethod('processXSLTTemplate',
function(anElement, aName, aURI) {

    /**
     * @method processXSLTTemplate
     * @summary Sets up an XSLT template using information given by the
     *     supplied Element. When an external file is used it is expected to
     *     contain a properly formed XSLT document. When child nodes of the
     *     template are used they are spliced into the XSLT boilerplate document
     *     to spare authors from having to duplicate that boilerplate with each
     *     transform.
     * @param {Element} anElement The request command node.
     * @param {String} aName The template's registered name.
     * @param {TP.core.URI} aURI The src URI, if any.
     * @exception TP.sig.InvalidDocument
     * @returns {Element|Array} The new element for tshCompile processing or an
     *     array with the new element and a processing constant such as
     *     TP.DESCEND.
     */

    var template,
        result,
        elements,
        insertionNode;

    //  Grab a copy of our type's XSLT template. We're going to
    //  shove the sheet content into it at the appropriate place.
    template = this.getXSLTBoilerplate(anElement);
    if (!TP.isKindOf(template, 'TP.core.XSLDocumentNode')) {
        return this.raise('TP.sig.InvalidDocument',
                            'Unable to load XSLT template document.');
    }

    //  Try to load via 'src' URI if we have one.
    if (TP.isURI(aURI)) {
        result = aURI.getResourceNode(TP.hc('async', false));

        //  Need to add the TP.w3.Xmlns.TIBET namespace so that other
        //  attributes will work.
        if (TP.isDocument(result)) {
            TP.elementAddNamespace(result.documentElement,
                                    'tibet',
                                    TP.w3.Xmlns.TIBET);
        }
    }

    //  Fallback is child content as long as the URI was valid, even if it
    //  didn't load.
    if (!TP.isDocument(result)) {
        //  NOTE that relying on child elements means any text content must
        //  be enclosed in an element.
        elements = TP.nodeGetChildElements(anElement);

        //  Prefer singly-rooted templates, but fragment-based processing
        //  can be done.
        switch (elements.getSize()) {
            case 0:

                return this.raise('TP.sig.InvalidTemplate',
                                    'Empty or invalid template for: ' +
                                    this.asString());

            default:

                //  Clone the template so that we don't mess up its unique
                //  document (which might be shared across multiple
                //  TP.tsh.template occurrences).
                result = TP.nodeCloneNode(template.getNativeNode(), true);

                //  Grab the special 'INLINE_CONTENT_HERE' node.
                if (TP.notValid(insertionNode = TP.nodeGetElementById(
                                                    result,
                                                    'INLINE_CONTENT_HERE'))) {
                    return this.raise('TP.sig.InvalidTemplate',
                                        'Can\'t find insertion marker ' +
                                        'for XSLT template.');
                }

                //  Copy the children of the supplied element over to the
                //  template document and remove the insertion placeholder.
                TP.nodeCopyChildNodesTo(anElement,
                                        insertionNode.parentNode,
                                        insertionNode);

                TP.nodeDetach(insertionNode);

                break;
        }
    }

    if (!TP.isNode(result)) {
        return this.raise('TP.sig.InvalidTemplate',
                            'Unable to acquire XSLT document for: ' +
                            this.asString());
    }

    //  For XSL node templates, since we don't have a source URL here, we
    //  use a URN and register it under the template name.
    TP.uc(TP.TIBET_URN_PREFIX + aName).setResource(TP.wrap(result));

    return result;
});

//  ------------------------------------------------------------------------

TP.tsh.template.Type.defineMethod('getTemplateGenerator',
function(anElement) {

    /**
     * @method getTemplateGenerator
     * @summary Returns the optional generator type for the template element.
     *     This value is only valid when the template has been dynamically
     *     created during tag processing to assist with content processing.
     * @param {Element} anElement The template element to query.
     * @returns {TP.lang.RootObject.<TP.core.ElementNode>} A TP.core.ElementNode
     *     subtype type object used for the generator.
     */

    var generator;

    if (!TP.isElement(anElement)) {
        return this.raise('TP.sig.InvalidElement');
    }

    generator = anElement.getAttribute('tsh:generator');
    if (TP.notEmpty(generator)) {
        return TP.sys.require(generator);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.template.Type.defineMethod('getTemplateResult',
function(aTemplateName, aDataSource, formatParams) {

    /**
     * @method getTemplateResult
     * @summary Returns the result of processing the template using the data
     *     source and parameters provided.
     * @param {String} aTemplateName The template name to look up and execute.
     * @param {Object} aDataSource The object serving as the primary data
     *     source. Typically the original templated element.
     * @param {TP.lang.Hash|TP.sig.Request} formatParams An object which can
     *     provide additional formatting data.
     * @returns {Node} A node representing the template result data.
     */

    var uri,
        template,

        natTemplate,
        embeddedTemplates,
        natDoc,

        result,

        templateDummies,

        node;

    uri = TP.uc(TP.TIBET_URN_PREFIX + aTemplateName);
    if (TP.notValid(uri)) {
        //  TODO
        void 0;
    }

    template = uri.getResource(TP.hc('resultType', TP.WRAP));
    if (TP.notValid(template) || !TP.canInvoke(template, 'format')) {
        //  TODO
        void 0;
    }

    //  If the template is a type of TP.core.CollectionNode, then we have to
    //  make sure that any embedded templates inside of it are temporarily
    //  replaced with a 'dummy', so that they're not processed.
    if (TP.isKindOf(template, TP.core.CollectionNode)) {
        //  Acquire any embedded 'tsh:template' elements under the template
        natTemplate = TP.unwrap(template);
        embeddedTemplates = TP.nodeGetElementsByTagName(natTemplate,
                                                        'tsh:template');

        //  Loop over the embedded templates and replace them with a 'dummy'
        //  element.
        natDoc = TP.nodeGetDocument(natTemplate);
        embeddedTemplates.perform(
                function(anElem) {

                    var newDummyElem;

                    newDummyElem = TP.documentCreateElement(
                                                natDoc, 'templateDummy');

                    TP.nodeReplaceChild(anElem.parentNode,
                                        newDummyElem,
                                        anElem,
                                        false);
                });
    }

    //  Transform the template. This causes any data in the data source to
    //  be substituted into the template, with the data source being either
    //  JS or XML data and the template being a JS template (that should
    //  produce a Node), or an XML or XSLT template.
    result = template.transform(aDataSource, formatParams);

    if (TP.isString(result)) {
        node = TP.nodeFromString(result);
    } else {
        node = result;
    }

    //  Now, if the embedded templates Array isn't empty, loop back over the
    //  dummies and replace them with the original embedded templates. Note
    //  that because TP.nodeGetElementsByTagName() always returns elements
    //  in document order, we don't have to worry about ordering - they'll
    //  be in the Array in the same order in which the dummies were placed
    //  into the document.
    if (TP.notEmpty(embeddedTemplates)) {
        templateDummies = TP.nodeGetElementsByTagName(
                                                node, 'templateDummy');

        templateDummies.perform(
                function(anElem, index) {

                    TP.nodeReplaceChild(anElem.parentNode,
                                        embeddedTemplates.at(index),
                                        anElem,
                                        false);
                });
    }

    //  When we still don't have a node we try to produce one that
    //  represents a useful error message that will present itself where the
    //  template would have gone.
    if (!TP.isNode(node)) {
        node = TP.nodeFromString(
                TP.join(
                    '<span xmlns="', TP.w3.Xmlns.XHTML, '">',
                        TP.sc('Error producing node from template: '),
                        aTemplateName,
                    '</span>'));
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.tsh.template.Type.defineMethod('getXSLTBoilerplate',
function(anElement) {

    /**
     * @method getXSLTBoilerplate
     * @summary Returns the XSLT document used to 'wrap' XSLT template content.
     *     The boilerplace document is cloned and the raw template content is
     *     injected, creating a fully-formed XSLT template suitable for
     *     transforming input documents.
     * @param {Element} anElement The template element.
     * @exception TP.sig.InvalidDocument, TP.sig.InvalidURI
     * @returns {TP.core.XSLDocumentNode} The document to used as the XSLT
     *     boilerplate.
     */

    var src,
        uri,
        doc;

    src = TP.sys.cfg('path.xslt.boilerplate');

    uri = TP.uc(src);
    if (TP.notValid(uri)) {
        return this.raise('TP.sig.InvalidURI',
                            'Unable to load XSLT boilerplate: ' + src);
    }

    doc = TP.wrap(uri.getResourceNode(TP.hc('async', false)));
    if (!TP.isKindOf(doc, 'TP.core.XSLDocumentNode')) {
        return this.raise('TP.sig.InvalidDocument',
                            'Unable to acquire XSLT template for: ' +
                            this.asString());
    }

    return doc;
});

//  ------------------------------------------------------------------------

TP.tsh.template.Type.defineMethod('wrapInTransformElement',
function(transformElement, templatePrefix) {

    /**
     * @method wrapInTransformElement
     * @summary Returns a 'tsh:transform' element wrapped around the content of
     *     the supplied Element. Note that this returns a completely new Element
     *     under the transform, not the supplied Element.
     * @param {Element} transformElement The Element to wrap into a
     *     tsh:transform Element.
     * @param {String} templatePrefix A prefix to be used when naming the
     *     template (if it doesn't have a name already).
     * @returns {Element} The 'tsh:transform' element wrapping a copy of the
     *     supplied template element.
     */

    var str,

        newTransformElem,
        newTemplateElem,

        prefix,
        templateName;

    //  Grab a String representation of ourself and wrap it inside of a
    //  'tsh:transform' element.
    str = TP.join('<tsh:transform xmlns:tsh="', TP.w3.Xmlns.TSH, '">',
                    TP.str(transformElement),
                    '</tsh:transform>');

    //  Create an Element from that
    if (!TP.isElement(newTransformElem = TP.elem(str))) {
        //  TODO: Raise an exception
        return null;
    }

    //  Grab the first element child - this will be the template.
    newTemplateElem = TP.nodeGetFirstChildElement(newTransformElem);

    prefix = TP.ifInvalid(templatePrefix, '');

    //  If the template doesn't have a 'template name', then we construct
    //  one out of our ID and the template name and set it.
    if (TP.isEmpty(
            templateName =
                TP.elementGetAttribute(newTemplateElem, 'tsh:name', true))) {
        templateName = 'template_' + prefix + '_' + TP.genID();

        TP.elementSetAttribute(newTemplateElem,
                                'tsh:name',
                                templateName,
                                true);
    }

    //  Since we're wrapping a single template in a transform element, it is
    //  (by default) the 'root' template element.
    TP.elementSetAttribute(newTemplateElem, 'tsh:root', 'true', true);

    TP.elementSetAttribute(newTransformElem,
                            'tsh:root_template',
                            templateName,
                            true);

    return newTransformElem;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tsh.template.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Compiles templates defined with this element into TIBET
     *     representations for use in templating.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} If the receiver is a 'generator', then the result of
     *     executing the receiver's template. Otherwise, null.
     */

    var elem,
        src,
        uri,

        name,
        type,
        generatorName,

        result,
        newNode,
        processInnerFrag,
        child,
        fragmentParentNode,
        wrapper,

        request,
        processedNode,
        retNode,

        ownerElem;

    //  Make sure that we have a node to work from.
    if (TP.notValid(elem = aRequest.at('node'))) {
        return;
    }

    //  Start by looking for 'src' rather than embedded content, unless the
    //  fallback attribute is present and set to true for testing/forced
    //  use.
    if (TP.elementHasAttribute(elem, 'tibet:src', true) &&
        TP.notTrue(TP.bc(TP.elementGetAttribute(
                                    elem, 'tsh:fallback', true)))) {
        src = TP.elementGetAttribute(elem, 'tibet:src', true);
        if (TP.isEmpty(src) || TP.notValid(uri = TP.uc(src))) {
            this.raise('TP.sig.InvalidURI',
                        'Invalid URI in src attribute: ' + src);

            return;
        }
    }

    //  Templates should have a name associated with them for easy processing.
    //  If the template doesn't have a 'template name', then we construct one
    //  out of our ID and the template name and set it.
    if (TP.isEmpty(name = TP.elementGetAttribute(elem, 'tsh:name', true))) {
        //  TODO:   convert this call to TP.genID() into a "hash code" for
        //  uniquing.
        name = 'template_' + TP.genID();

        TP.elementSetAttribute(elem, 'tsh:name', name, true);
    }

    //  Templates can be of three basic types: JS (aka "string"), XSLT, or XML
    //  (aka "content").
    if (TP.isEmpty(type = TP.elementGetAttribute(elem, 'tibet:mime', true))) {
        type = TP.ietf.Mime.XML;
    }

    switch (type) {
        case TP.ietf.Mime.JS:

            this.processJSTemplate(elem, name, uri);
            break;

        case TP.ietf.Mime.XSLT:

            this.processXSLTTemplate(elem, name, uri);
            break;

        case TP.ietf.Mime.XML:
        case TP.ietf.Mime.XHTML:

            this.processXMLTemplate(elem, name, uri);
            break;

        default:

            this.raise('TP.sig.InvalidTemplate',
                        'Unknown template type: ' + type);
            return;
    }

    //  If we're "generated" (as when used by TP.core.TemplatedNode objects) we
    //  expand now, while we still have a location in the DOM.
    if (TP.notEmpty(generatorName = TP.elementGetAttribute(
                                        elem, 'tsh:generator', true))) {
        //  Expand the template now. Generated template elements are helpers
        //  used at compile time, not just in response to events. NOTE that we
        //  pass the template elem in this case since it contains the
        //  attributes and child content of the original generator.
        result = this.getTemplateResult(name, elem, aRequest);

        if (!TP.isNode(result)) {
            //  Should always receive back a new node (even if it's a
            //  DocumentFragment).
            this.raise('TP.sig.InvalidNode',
                        'Template ' + name + ' produced invalid output: ' +
                        result);

            return;
        }

        if (!TP.isFragment(result)) {
            //  Now, merge any attributes *that don't already have defined
            //  values on the result* from the source node onto the result. Note
            //  that we pass 'false' here, so that attributes with the same name
            //  that have values (and which might have been calculated as part
            //  of template execution process) are *not* overwritten on the
            //  result.
            TP.elementMergeAttributes(elem, result, false);

            //  If the phase is 'Compile', remove the 'tsh:generator' attribute
            //  (admin cruft).
            if (TP.elementGetAttribute(
                            result, 'tibet:phase', true) === 'Compile') {
                TP.elementRemoveAttribute(result, 'tsh:generator', true);
            }
        }

        //  Ensure the new elem migrates to the target document as needed.
        newNode = TP.nodeImportNode(elem, result);

        //  Now it gets tricky. If the new elem is a different tag type then we
        //  can process the new elem from the earliest phase up through compile
        //  to match our current state. But if the new elem is the same tag
        //  type and we do that we'll end up running those phases twice (we
        //  already ran them to get this far...). So the trick in the latter
        //  case is to presume the outer elem is "compiled" already and that
        //  only the children need processing.

        processInnerFrag = false;

        if (TP.isElement(newNode) &&
            TP.elementGetCanonicalName(newNode) === generatorName) {
            child = TP.nodeGetFirstChildElement(newNode);

            //  No more child *elements*?
            if (TP.notValid(child)) {
                //  No child elements means replacement must be complete.
                newNode = TP.elementReplaceWith(elem, newNode);

                return TP.ac(newNode, TP.CONTINUE);
            } else {
                processInnerFrag = true;
            }
        } else if (!TP.isElement(newNode)) {
            processInnerFrag = true;
        }

        if (processInnerFrag) {
            //  Grab a reference to newNode before we muck with it and it's
            //  childNodes
            fragmentParentNode = newNode;

            newNode = TP.nodeListAsFragment(newNode.childNodes);

            //  The shell can't process document fragments, so wrap it in
            //  something we can identify and remove after processing.
            wrapper = TP.documentCreateElement(TP.nodeGetDocument(elem),
                                                'fragwrapper');
            wrapper.appendChild(newNode);

            newNode = wrapper;
        }

        //  Process the new content of the template, ensuring it is compiled
        //  using the elem it will replace as the "target" for any context data
        //  it might need. Do this outside the main DOM or the traversal can get
        //  complicated/confused.
        request = TP.request(
                    TP.hc('cmdExecute', false,
                            'cmdSilent', true,
                            'cmdTargetDoc', TP.nodeGetDocument(elem),
                            'cmdPhases', TP.core.TSH.COMPILE_PHASES,
                            'targetPhase', 'Compile'));

        processedNode = TP.process(newNode, request);

        if (!TP.isNode(processedNode = TP.unwrap(processedNode))) {
            this.raise('TP.sig.InvalidNode');
        }

        //  If the top-level elem is the 'fragment wrapper' that we wrapped the
        //  content with above, then we were processing a fragment. Unwrap it
        //  and put the processed children back into their original elem.
        if (TP.name(processedNode) === 'fragwrapper') {
            //  Get all of the *processed* child nodes as a fragment
            processedNode = TP.nodeListAsFragment(processedNode.childNodes);

            //  The fragmentParentNode was emptied in the
            //  TP.nodeListAsFragment() call above...
            TP.nodeAppendChild(fragmentParentNode, processedNode);

            //  The processedNode is now the fragmentParentNode
            processedNode = fragmentParentNode;
        }

        //  If processedNode is a fragment, the reassignment here will make
        //  it the first child of that fragment *after* it has been inserted
        //  where 'elem' used to be. This is then important in the following
        //  call where we descend.

        //  If it's not a fragment, we still replace it in this way since it's
        //  just a simple swap.

        //  Note the reassignment here and the 'false' as the 4th parameter,
        //  indicating that we do *not* want the content to be awakened.
        processedNode = TP.elementReplaceWith(elem, processedNode, null, false);

        retNode = processedNode;
    } else {
        retNode = elem;
    }

    ownerElem = retNode.parentNode;

    //  If the tsh:template is a 'root' template, or the only template
    //  child of its parent, then place the template name on that parent
    //  so it knows which template to run as the root.
    if (TP.isElement(ownerElem) &&
        !TP.elementHasAttribute(ownerElem, 'tsh:root_template', true) &&
            (TP.elementGetAttribute(retNode, 'tsh:root', true) === 'true' ||
             TP.nodeGetElementsByTagName(ownerElem,
                                         'tsh:template').getSize() === 1)) {
        TP.elementSetAttribute(ownerElem, 'tsh:root_template', name, true);

        //  This might not have been set (in the logic above, it might be
        //  only element child of the ownerElem, so we patch it here to say that
        //  it's the root template.
        TP.elementSetAttribute(retNode, 'tsh:root', 'true', true);
    }

    //  We were "generated" (as when used by templated nodes), which means
    //  that we expanded.
    if (TP.notEmpty(generatorName)) {
        //  If we had a generator, then that means we probably expanded
        //  markup somewhere along the way which means we need to update
        //  whatever was placed in the cache at that name during the
        //  'process*' step near the beginning of this method.
        TP.uc(TP.TIBET_URN_PREFIX + name).setResource(
                                        TP.wrap(processedNode));

        return retNode;
    } else {
        //  Not a generated template, so no new content will be added at
        //  this time that might require processing and the template node
        //  can remain in the DOM.
        return;
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
