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

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('constructDocument',
function(aNamespace, aTagname) {

    /**
     * @method constructDocument
     * @summary Creates an XML document. Note that if a tag name isn't
     *     supplied to this method, a documentElement will *not* be created
     *     for the returned document.
     * @param {String} aNamespace The namespace to use. Defaults to the null
     *     namespace.
     * @param {String} aTagname The element name to use for the document
     *     element. Defaults to ''.
     * @example Create an XML document, with no namespace and no document
     *     element:
     *     <code>
     *          xmlDoc = TP.constructDocument();
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp></samp>
     *     </code>
     * @example Create an XML document, with no namespace and a document
     *     element of 'foo':
     *     <code>
     *          xmlDoc = TP.constructDocument(null, 'foo');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo xmlns=""/&gt;</samp>
     *     </code>
     * @example Create an XML document, with a default namespace of
     *     'http://www.bar.com' and a document element of 'foo':
     *     <code>
     *          xmlDoc = TP.constructDocument('http://www.bar.com', 'foo');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo xmlns="http://www.bar.com"/&gt;</samp>
     *     </code>
     * @example Create an XML document, with a 'bar' prefixed namespace of
     *     'http://www.bar.com' and a document element of 'foo':
     *     <code>
     *          xmlDoc = TP.constructDocument('http://www.bar.com',
     *          'bar:foo');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;bar:foo xmlns:bar="http://www.bar.com"/&gt;</samp>
     *     </code>
     * @returns {XMLDocument} The newly created XML document.
     */

    var theNamespace,
        theTagName,
        parts,

        newDocStr,

        retVal;

    theNamespace = aNamespace;
    theTagName = TP.ifInvalid(aTagname, '');

    //  If we were handed both a namespace and a root tag name then we
    //  should build a document by TP.documentFromString()ing standard
    //  XML.
    //  This avoids a lot of problems in W3C-compliant browsers when
    //  dealing with XML documents, namespaces, etc.
    if (TP.notEmpty(theNamespace) && TP.notEmpty(theTagName)) {
        parts = theTagName.split(':');
        if (parts.getSize() > 1) {
            newDocStr = TP.join('<', theTagName,
                                ' xmlns:', parts.at(0), '="',
                                theNamespace, '">',
                                '</', theTagName, '>');
        } else {
            newDocStr = TP.join('<', theTagName, ' xmlns="',
                                theNamespace,
                                '"></', theTagName, '>');
        }

        retVal = TP.documentFromString(newDocStr);
    } else if (TP.isEmpty(theNamespace) && TP.notEmpty(theTagName)) {
        newDocStr = TP.join('<', theTagName, ' xmlns="">',
                            '</', theTagName, '>');

        retVal = TP.documentFromString(newDocStr);
    } else if (TP.notEmpty(theTagName)) {
        //  Otherwise, we were just handed a root tag name, so go ahead
        //  and use that.
        newDocStr = TP.join('<', theTagName, '></', theTagName, '>');

        retVal = TP.documentFromString(newDocStr);
    } else {
        //  They were both empty, so just use the 'createDocument' call.
        retVal = document.implementation.createDocument('', '', null);
    }

    retVal[TP.IS_XML] = true;

    if (TP.isElement(retVal.documentElement) &&
        retVal.documentElement.namespaceURI === TP.w3.Xmlns.XHTML) {

        retVal[TP.IS_XHTML] = true;
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.XML_FACTORY_DOCUMENT = TP.constructDocument();

//  ------------------------------------------------------------------------

TP.definePrimitive('documentConstructElement',
function(aDocument, elementName, elementNS) {

    /**
     * @method documentConstructElement
     * @summary Creates a new element in the document and namespace provided.
     * @param {Document} aDocument The document that will contain the new
     *     element.
     * @param {String} elementName The element type.
     * @param {String} elementNS The namespace to use.
     * @example Create an HTML element in an HTML document:
     *     <code>
     *          TP.documentConstructElement(document, 'span');
     *          <samp>[object HTMLSpanElement]</samp>
     *     </code>
     * @example Create an XHTML element in an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo
     *         xmlns="http://www.foo.com"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.documentConstructElement(xmlDoc, 'span', TP.w3.Xmlns.XHTML);
     *          <samp>[object HTMLSpanElement]</samp>
     *     </code>
     * @returns {Element} The newly created Element.
     * @exception TP.sig.InvalidDocument Raised when an invalid document is
     *     provided to the method.
     * @exception TP.sig.InvalidString Raised when a null or empty element name
     *     is provided to the method.
     * @exception TP.sig.DOMConstructException Raised when the element cannot be
     *     constructed in the supplied document.
     */

    var aNamespace,
        newElement;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    if (TP.isEmpty(elementName)) {
        return TP.raise(this, 'TP.sig.InvalidElementType');
    }

    //  The namespace is the 'null namespace' by default.
    aNamespace = TP.ifInvalid(elementNS, '');

    try {
        //  If it's an XML document or the namespace is SVG, create the
        //  element using createElementNS.
        if (TP.isXMLDocument(aDocument) || elementNS === TP.w3.Xmlns.SVG) {
            newElement = aDocument.createElementNS(aNamespace,
                                                    elementName);
        } else {
            newElement = aDocument.createElement(elementName);
        }
    } catch (e) {
        return TP.raise(this, 'TP.sig.DOMConstructException',
                        TP.ec(e));
    }

    return newElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentFromNode',
function(aNode) {

    /**
     * @method documentFromNode
     * @summary Wraps a copy of aNode in a new XML document or returns aNode if
     *     its already an XML document.
     * @param {Node} aNode The Node to wrap.
     * @example Obtain a XML document from an XML document Node:
     *     <code>
     *          xmlDoc = TP.doc('<foo bar="baz"/>');
     *          <samp>[object XMLDocument]</samp>a
     *          // Returns itself
     *          TP.documentFromNode(xmlDoc) === xmlDoc;
     *          <samp>true</samp>
     *     </code>
     * @example Obtain a XML document from an XML Node:
     *     <code>
     *          xmlDoc = TP.doc('<foo bar="baz"/>');
     *          <samp>[object XMLDocument]</samp>
     *          // Creates a new XML document and moves xmlDoc's
     *          // document element to it.
     *          fooDoc = TP.documentFromNode(xmlDoc.documentElement);
     *          fooDoc === xmlDoc;
     *          <samp>false</samp>
     *     </code>
     * @returns {XMLDocument} The new XML document wrapping aNode or aNode if
     *     its already an XML document.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidXMLDocument Raised when the node supplied is not
     *     part of an XML document.
     */

    var node,
        newDoc;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  If the supplied node is already an XML document, just return it.
    if (TP.isXMLDocument(aNode)) {
        return aNode;
    }

    //  get an xml node from any html nodes provided if at all possible
    if (!TP.isXMLDocument(TP.nodeGetDocument(aNode))) {
        node = TP.doc(TP.xmlnode(aNode));
        if (!TP.isXMLNode(node)) {
            return TP.raise(this,
                            'TP.sig.InvalidXMLDocument',
                            aNode);
        }
    } else {
        node = aNode;
    }

    //  Create a new XML document and append the node to it as the first
    //  child. Normally this would be the document element.
    newDoc = TP.constructDocument();

    //  TP.nodeAppendChild() will automatically import the appended node if
    //  it needs to.

    //  Note here how we pass 'false' to *not* awaken any content that gets
    //  appended.
    TP.nodeAppendChild(newDoc, TP.nodeCloneNode(aNode, true), false);

    return newDoc;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentAddContent',
function(aDocument, theContent, loadedFunction, shouldAwake) {

    /**
     * @method documentAddContent
     * @summary Adds content from theContent onto the end of the child content
     *     of the document element of the supplied document.
     * @param {Document} aDocument The document receiving content.
     * @param {Object} theContent The object to use as the source of the
     *     content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just added. The default for an 'add' operation is false.
     * @exception TP.sig.InvalidDocument
     * @returns {Node} The first node of the content that was just inserted.
     */

    var content;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument',
                                'Must provide a target Document.');
    }

    if (TP.notValid(theContent)) {
        TP.nodeEmptyContent(aDocument);
    }

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(theContent, 'getResource') ?
                theContent.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                theContent;
    content = TP.unwrap(content);

    if (TP.isHTMLNode(aDocument)) {
        return TP.htmlDocumentAddContent(aDocument, content,
                                            loadedFunction, shouldAwake);
    } else {
        return TP.xmlDocumentAddContent(aDocument, content,
                                            loadedFunction, shouldAwake);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentInsertContent',
function(aDocument, theContent, aPositionOrPath, loadedFunction, shouldAwake) {

    /**
     * @method documentInsertContent
     * @summary Inserts content from theContent into aDocument based on the
     *     position given. NOTE that the position given is utilized relative to
     *     the documentElement so TP.BEFORE_BEGIN and TP.AFTER_END are invalid
     *     positions.
     * @param {Document} aDocument The document receiving content.
     * @param {Object} theContent The object to use as the source of the
     *     content.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the document's documentElement or a path to evaluate to
     *     get to a node at that position. This should be one of four values:
     *     TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the
     *     path to evaluate. Default is TP.BEFORE_END.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted. The default for an 'insert' operation is false.
     * @exception TP.sig.InvalidDocument
     * @returns {Node} The first node of the content that was just inserted.
     */

    var positionOrPath,
        content;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument',
                                'Must provide a target Document.');
    }

    if (TP.notValid(theContent)) {
        return;
    }

    positionOrPath = TP.ifEmpty(aPositionOrPath, TP.BEFORE_END);

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(theContent, 'getResource') ?
                theContent.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                theContent;
    content = TP.unwrap(content);

    if (TP.isHTMLNode(aDocument)) {
        return TP.htmlDocumentInsertContent(aDocument, content,
                                            positionOrPath,
                                            loadedFunction, shouldAwake);
    } else {
        return TP.xmlDocumentInsertContent(aDocument, content,
                                            positionOrPath,
                                            loadedFunction, shouldAwake);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentPathContainsNode',
function(aDocument, aNode, aPath, aPathType) {

    /**
     * @method documentPathContainsNode
     * @summary Evaluates the path provided, producing a set of nodes that
     *     match the expression. If that result set contains aNode, then this
     *     method returns true, otherwise it returns false. There are several
     *     path types which might be used, but the most typical are XPaths,
     *     XPointers (which include xpointer(), xpath1() and element() schemes),
     *     and CSS queries. The latter are rare since the focus here is largely
     *     on "paths" and CSS selectors don't strictly define a path.
     * @param {Document} aDocument The document or element to query.
     * @param {Node} aNode The node to test against the result set.
     * @param {String} aPath The path to traverse in locating a value.
     * @param {String} aPathType One of the 'path type' constants:
     *     TP.XPATH_PATH_TYPE
     *     TP.XPOINTER_PATH_TYPE
     *     TP.ELEMENT_PATH_TYPE
     *     TP.XTENSION_POINTER_PATH_TYPE
     *     TP.CSS_PATH_TYPE
     *     TP.BARENAME_PATH_TYPE
     * @returns {Boolean} Whether or not aNode is contained in the set of
     *     results obtained by evaluating aPath against aDocument.
     * @exception TP.sig.InvalidPath Raised when an invalid path is provided to
     *     the method.
     * @exception TP.sig.InvalidDocument Raised when an invalid document is
     *     provided to the method.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var result,

        len,
        i;

    if (TP.notValid(aDocument)) {
        TP.raise(this, 'TP.sig.InvalidDocument');

        return;
    }

    if (TP.notValid(aNode)) {
        TP.raise(this, 'TP.sig.InvalidNode');

        return;
    }

    //  no query, no result
    if (TP.isEmpty(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidPath');
    }

    //  Note here how we force autoCollapse to false, since we're gonna loop
    //  below anyway.
    result = TP.nodeEvaluatePath(aDocument, aPath, aPathType, false);

    len = result.getSize();
    for (i = 0; i < len; i++) {
        if (result.at(i) === aNode) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentSetContent',
function(aDocument, theContent, loadedFunction, shouldAwake) {

    /**
     * @method documentSetContent
     * @summary Inserts content from theContent into aDocument, replacing any
     *     current content.
     * @param {Document} aDocument The document receiving content.
     * @param {Object} theContent The object to use as the source of the
     *     content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just set. The default for a 'set' operation is whether aDocument has
     *     a Window object associated with it or not.
     * @exception TP.sig.InvalidDocument
     * @returns {Node} The first node of the content that was just inserted.
     */

    var content,

        localName;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument',
                                'Must provide a target Document.');
    }

    if (TP.notValid(theContent)) {
        TP.nodeEmptyContent(aDocument);
    }

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(theContent, 'getResource') ?
                theContent.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                theContent;
    content = TP.unwrap(content);

    if (TP.isHTMLNode(aDocument)) {
        if (TP.isElement(theContent)) {
            localName = TP.elementGetLocalName(theContent).toLowerCase();

            //  We test the local name of the content we're append to make
            //  sure that if its an 'html' or 'body' node, that we're
            //  appending to the appropriate place.
            if (localName === 'html') {
                return TP.htmlDocumentSetContent(aDocument,
                                                    content,
                                                    loadedFunction,
                                                    shouldAwake);
            } else if (localName === 'body') {
                return TP.htmlElementSetContent(aDocument.documentElement,
                                                content,
                                                loadedFunction,
                                                shouldAwake);
            } else {
                return TP.htmlElementSetContent(
                                            TP.documentGetBody(aDocument),
                                            content,
                                            loadedFunction,
                                            shouldAwake);
            }
        } else {
            //  It's not a Node -- maybe a String.
            return TP.htmlDocumentSetContent(aDocument,
                                                content,
                                                loadedFunction,
                                                shouldAwake);
        }
    } else {
        return TP.xmlDocumentSetContent(aDocument, content,
                                        loadedFunction, shouldAwake);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlDocumentAddContent',
function(aDocument, theContent, loadedFunction, shouldAwake) {

    /**
     * @method xmlDocumentAddContent
     * @summary Adds content from theContent onto the end of the child content
     *     of the document element of the supplied document.
     * @param {Document} aDocument The document to receive the content.
     * @param {Node|String} theContent The object to use as the source of the
     *     content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just added. The default for an 'add' operation is false.
     * @exception TP.sig.InvalidDocument
     * @returns {Node} The first node of the content that was just inserted.
     */

    if (!TP.isXMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return TP.xmlElementAddContent(aDocument.documentElement,
                                    theContent,
                                    loadedFunction,
                                    shouldAwake);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlDocumentInsertContent',
function(aDocument, theContent, aPositionOrPath, loadedFunction, shouldAwake) {

    /**
     * @method xmlDocumentInsertContent
     * @summary Inserts content from theContent into/around the document
     *     element of the supplied document based on the position given. The
     *     position should indicate whether the content should become the
     *     previous sibling, next sibling, first child or last child.
     * @param {Document} aDocument The document to receive the content.
     * @param {Node|String} theContent The object to use as the source of the
     *     content.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the document's documentElement or a path to evaluate to
     *     get to a node at that position. This should be one of four values:
     *     TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the
     *     path to evaluate. Default is TP.BEFORE_END.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted. The default for an 'insert' operation is false.
     * @exception TP.sig.InvalidDocument
     * @returns {Node} The first node of the content that was just inserted.
     */

    if (!TP.isXMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return TP.xmlElementInsertContent(aDocument.documentElement,
                                        theContent,
                                        aPositionOrPath,
                                        loadedFunction,
                                        shouldAwake);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlDocumentSetContent',
function(aDocument, theContent, loadedFunction, shouldAwake) {

    /**
     * @method xmlDocumentSetContent
     * @summary Sets the content of the supplied document, replacing the
     *     document's documentElement with the resulting content if valid.
     * @description Content sent to a document must be suitable for replacing
     *     the entire content of the document, i.e. it becomes the source of the
     *     new documentElement. This implies that the content must be able to
     *     provide a valid node containing a single root element of the same
     *     document type (XML vs HTML).
     * @param {Document} aDocument The document to receive the content.
     * @param {Node|String} theContent The object to use as the source of the
     *     content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just set. The default for a 'set' operation is whether aDocument has
     *     a Window object associated with it or not.
     * @returns {Node} The first node of the content that was just inserted. In
     *     this case, the documentElement.
     */

    var hasWindow,

        awakenContent,
        nodeContent,

        docElem,

        newEvent,

        scriptURLs,

        allContentLoadedFunc,

        lastSourcedScript,

        scripts,
        scriptTextSiblingsContents,
        nextScriptSibling,

        i,

        docHead,

        styleLinks,

        loadFunc,

        scriptCount;

    if (!TP.isXMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Note whether or not the document has a window. This is used later to
    //  determine whether to try to emulate standard browser behavior.
    hasWindow = TP.nodeHasWindow(aDocument);

    awakenContent = TP.ifInvalid(shouldAwake, hasWindow);

    //  If the content is an XML node, then we just make sure its an
    //  Element, and not a Document.
    if (TP.isXMLNode(theContent)) {
        if (TP.isDocument(theContent)) {
            nodeContent = theContent.documentElement;
        } else {
            nodeContent = theContent;
        }

        //  Make sure to clone this content since we're going to be manipulating
        //  it below and don't want to modify the original.
        nodeContent = TP.nodeCloneNode(nodeContent, true);
    } else if (TP.isString(theContent)) {
        //  Try to create a real Node from the supplied content (passing
        //  'true' to TP.nodeAsString() so that it will report parsing
        //  errors). If we can't parse a valid Node from the content, we
        //  just create a Text node using the content and use that.
        if (TP.notValid(nodeContent =
                        TP.nodeFromString(theContent, null, true))) {
            nodeContent = TP.nodeGetDocument(nodeContent).createTextNode(
                                                                theContent);
        }
    } else {
        TP.raise(this, 'TP.sig.UnsupportedOperation');

        return null;
    }

    //  Before we move the nodeContent, if it's not detached, we stamp it with
    //  its previous position. That way, when it detaches from its current DOM,
    //  other machinery will know where it came from.
    if (!TP.nodeIsDetached(nodeContent)) {
        nodeContent[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(
                                                                nodeContent);
    }

    //  Set the TIBET flag that says we're "document.write()ing" (we are
    //  doing the XML equivalent thereof)
    TP.core.Window.$$isDocumentWriting = true;

    //  If we have a window, then create and dispatch an 'unload' event.
    //  Note how this is dispatched from the window's document, which is
    //  required to make it work.
    if (hasWindow) {

        newEvent = aDocument.createEvent('Event');
        newEvent.initEvent('unload', true, true);
        aDocument.dispatchEvent(newEvent);
    }

    docElem = aDocument.documentElement;

    //  Manually invoke the mutation removal event machinery. This won't happen
    //  automatically, since by emptying the content of the document above, we
    //  blew away the Mutation Observer registration.
    if (TP.isElement(docElem) && awakenContent) {
        TP.sig.MutationSignalSource[TP.composeHandlerName('MutationEvent')](
            {
                type: 'childList',
                target: docElem,
                removedNodes: TP.ac(docElem)
            });
    }

    //  Clear out the document's existing content.
    TP.nodeEmptyContent(aDocument);

    //  Script elements have to be treated specially. They won't be executed
    //  simply by placing their ancestor (in this case 'nodeContent') into the
    //  document, so we must manually process them (i.e. create new ones using
    //  the same URLs and add them individually - then they will be invoked
    //  properly).

    //  But because of the way they are processed by browsers, and because of
    //  the way that certain browsers (Chrome) will retain information (and
    //  attempt to act on that information) about script elements even if they
    //  are removed from the document, we make sure to capture their URLs
    //  *before* we set it into the document.

    //  Grab all of the existing script nodes.
    scriptURLs = TP.ac();
    scripts = TP.nodeGetElementsByTagName(nodeContent,
                                            'script',
                                            TP.w3.Xmlns.XHTML);

    scriptTextSiblingsContents = TP.ac();

    //  Loop over them, capture their 'src' URL *and remove them from the
    //  document*. If they have following sibling content that consists of a
    //  Text node, capture that too.
    for (i = 0; i < scripts.getSize(); i++) {

        scriptURLs.push(scripts.at(i).src);

        //  If the next sibling after the script node is a text node, we capture
        //  its contents and will put them back after we re-create the script
        //  nodes below. This lessens the impact of this process on the
        //  formatting of authored content.
        nextScriptSibling = scripts.at(i).nextSibling;
        if (TP.isTextNode(nextScriptSibling)) {
            scriptTextSiblingsContents.push(nextScriptSibling.nodeValue);
            TP.nodeDetach(nextScriptSibling);
        }

        TP.nodeDetach(scripts.at(i));
    }

    //  Append the new child into the target document
    TP.nodeAppendChild(aDocument, nodeContent, awakenContent);

    docHead = TP.documentEnsureHeadElement(aDocument);

    //  Grab all of the 'style related' link elements.
    styleLinks = TP.ac(docHead.querySelectorAll('link[type="text/css"]'));

    //  Since script elements, if we have them and they have a 'src'
    //  attribute, may be processed and fully realized in an asynchronous
    //  manner, we define a callback function that 'finishes up' the last parts
    //  of our simulated 'document.write()'. This includes dispatching a
    //  'DOMContentLoaded' event and calling any callback function supplied
    //  to this method.
    allContentLoadedFunc =
        function() {

            if (TP.isValid(lastSourcedScript)) {
                lastSourcedScript.onload = null;
            }

            //  We only signal TP.sig.DOMContentLoaded if the system is
            //  configured for it.
            if (TP.sys.shouldSignalDOMLoaded()) {
                if (hasWindow) {
                    //  If we have a window, then create and dispatch a
                    //  'DOMContentLoaded' event from the document as per
                    //  standard browser behavior..

                    //  This will eventually signal TP.sig.DOMContentLoaded via
                    //  the TP.$$processDocumentLoaded() call.
                    newEvent = aDocument.createEvent('HTMLEvents');
                    newEvent.initEvent('DOMContentLoaded', true, true);
                    aDocument.dispatchEvent(newEvent);
                } else {
                    try {
                        //  For document level operations this is the only
                        //  place we can properly signal
                        //  TP.sig.DOMContentLoaded since we want to be sure
                        //  it's really loaded and need to wait for the
                        //  onload triggering of this handler
                        TP.signal(TP.gid(aDocument),
                                    'TP.sig.DOMContentLoaded',
                                    aDocument.documentElement);
                    } catch (e) {
                        TP.ifError() ?
                            TP.error(
                                TP.ec(
                                    e, 'TP.sig.DOMContentLoaded handler' +
                                        ' generated error.')) : 0;
                    }
                }
            }

            //  Execute any loaded function that we were handed.
            if (TP.isCallable(loadedFunction)) {
                loadedFunction(aDocument);
            }

            //  clear the flag once we process our load function
            TP.core.Window.$$isDocumentWriting = false;
        };

    //  Now, using the scriptURLs and styleLinks Arrays as queues, set up a
    //  recursively called load handler that will be called back as each
    //  'script' or 'link' element is processed.

    //  For the gathered script URLs, we create a script element for each one,
    //  set its 'load' event handler to the load handler and then append the
    //  new script element to the head.

    //  This ensures that each script is loaded in order and is completely
    //  finished loading before the next script is loaded.
    scriptCount = 0;
    loadFunc = function(evt) {
        var scriptURL,

            newScript,

            textSiblingContent,

            styleLink,
            styleSheets,
            j,
            len,
            foundOne;

        if (TP.isEvent(evt)) {
            TP.eventGetTarget(evt).removeEventListener('load', loadFunc, false);
        }

        if (TP.notEmpty(styleLinks)) {

            //  Shift off the next style link element out of the queue
            styleLink = styleLinks.shift();

            foundOne = false;

            //  Grab the list of style sheets already installed in our document.
            styleSheets = aDocument.styleSheets;

            //  Iterate over them, looking for an href that will match the one
            //  in the stylesheet we're processing. If we find one, flip the
            //  flag.
            len = styleSheets.length;
            for (j = 0; j < len; j++) {
                if (styleSheets[j].href === styleLink.href) {
                    foundOne = true;
                    break;
                }
            }

            //  The stylesheet we're processing wasn't in the list of style
            //  sheets already attached to the document (which will only happen
            //  when they are done loading), so install a 'load' handler on it.
            if (!foundOne) {
                styleLink.addEventListener('load', loadFunc, false);
            } else {
                //  The stylesheet we are processing was already loaded. Since
                //  we've already removed it from our list of style links, we
                //  just need to re-invoke the load function manually.
                loadFunc();
            }
        } else if (TP.notEmpty(scriptURLs)) {

            //  Shift off the next script URL out of the queue
            scriptURL = scriptURLs.shift();

            newScript = TP.documentConstructScriptElement(
                                    aDocument,
                                    scriptURL);
            newScript.addEventListener('load', loadFunc, false);

            //  Append it into the document head.
            TP.nodeAppendChild(docHead, newScript, false);

            //  If there is text sibling content for this particular script
            //  node, then append it after the new script node.
            textSiblingContent = scriptTextSiblingsContents.at(scriptCount);
            if (TP.notEmpty(textSiblingContent)) {
                TP.nodeAppendChild(
                        docHead,
                        aDocument.createTextNode(textSiblingContent),
                        false);
            }

            //  Make sure to increment the scriptCount for the next pass!
            scriptCount++;
        } else {

            //  Make sure window listeners etc for content loaded are ready.
            TP.core.Window.installLoadUnloadHooks(TP.nodeGetWindow(aDocument));

            //  There are no more scripts - invoke the Function that signals
            //  that all content has been loaded.
            allContentLoadedFunc();
        }
    };

    //  Invoke the function once manually to 'kick start' everything.
    loadFunc();

    //  Return the document's documentElement, which should be the new
    //  element.
    return aDocument.documentElement;
});

//  ------------------------------------------------------------------------
//  ATTRIBUTE PRIMITIVES
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  ATTRIBUTE STRING CONVERSION
//  ------------------------------------------------------------------------

TP.definePrimitive('attributeStringAsHash',
function(aAttributeString) {

    /**
     * @method attributeStringAsHash
     * @summary Converts a properly formatted attribute string into the
     *     equivalent TP.core.Hash.
     * @param {String} aAttributeString A string of the form key="value"
     *     key="value".
     * @returns {TP.core.Hash} A new hash of attribute property/value pairs.
     */

    if (TP.isEmpty(aAttributeString)) {
        return TP.hc();
    }

    return TP.core.Hash.fromString(aAttributeString);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('attributeStringFromHash',
function(aHash) {

    /**
     * @method attributeStringFromHash
     * @summary Returns the provided hash's key/value pairs as a valid XML
     *     element attribute string.
     * @param {TP.core.Hash} aHash A valid TP.core.Hash containing keys suitable
     *     for a XML element.
     * @returns {String} A String in the format of an XML element attribute
     *     string.
     */

    var str,

        keys,
        len,
        i,

        key,
        val;

    if (TP.isEmpty(aHash)) {
        return '';
    }

    str = TP.ac();

    keys = TP.keys(aHash);
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);
        val = aHash.at(key);

        //  We only generate an attribute string chunk if the value is valid.
        if (TP.isValid(val)) {
            str.push(TP.str(key), '="', TP.str(val), '" ');
        }
    }

    str = str.join('');

    //  Slice off the last space
    return str.slice(0, str.getSize() - 1);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('attributeGetCanonicalName',
function(anAttributeNode) {

    /**
     * @method attributeGetCanonicalName
     * @summary Returns the prefix:attrname form of the attribute's name, using
     *     namespaceURI data and TIBET's XMLNS information to return the
     *     canonical prefix version.
     * @description Note that, in XML documents, if an attribute doesn't have a
     *     prefix, then its not considered a part of any namespace and therefore
     *     it will just returns its name. In an HTML document (which knows
     *     nothing of namespaces), this routine will 'fake' a prefix for
     *     non-prefixed attributes by prepending an 'html:' prefix onto them.
     *     This method, unlike TP.attributeGetFullName(), ignores any prefix
     *     given by the author to an attribute and attempts to compute a prefix
     *     by using any namespace information the attribute node may have. For
     *     instance, the author might have called the attribute 'xf:bind',
     *     because they aliased the prefix 'xf' to the XForms namespace, but
     *     this routine will return 'xforms:bind', since 'xforms' is the
     *     'canonical' prefix for this namespace. This distinction is important
     *     to the TIBET engine.
     * @param {Attribute} anAttributeNode The attribute node to retrieve the
     *     canonical name for.
     * @example Obtain the canonical name for an HTML attribute node whose name
     *     doesn't have a prefix:
     *     <code>
     *          attrNode =
     *         TP.documentGetBody(document).getAttributeNode('style');
     *          TP.attributeGetCanonicalName(attrNode);
     *          <samp>html:style</samp>
     *     </code>
     * @example Obtain the canonical name for an HTML attribute node whose name
     *     has a prefix (although its not really a namespace, because its HTML):
     *     <code>
     *          TP.elementSetAttribute(TP.documentGetBody(document),
     *          'foo:bar',
     *          'baz');
     *          attrNode =
     *         TP.documentGetBody(document).getAttributeNode('foo:bar');
     *          TP.attributeGetCanonicalName(attrNode);
     *          <samp>foo:bar</samp>
     *     </code>
     * @example Obtain the canonical name for an XML attribute node:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"
     *         goo="moo">Hi there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // This attribute is in the default namespace (no prefix)
     *          attrNode = xmlDoc.documentElement.getAttributeNode('goo');
     *          TP.attributeGetCanonicalName(attrNode);
     *          <samp>goo</samp>
     *          // This attribute is in the namespace with the 'xf'
     *          // prefix, but the canonical prefix is 'xforms' for
     *          // that namespace, so that's what get's used.
     *          attrNode =
     *          xmlDoc.documentElement.getAttributeNode('xf:bind');
     *          TP.attributeGetCanonicalName(attrNode);
     *          <samp>xforms:bind</samp>
     *     </code>
     * @returns {String} The attribute's canonical name.
     * @exception TP.sig.InvalidAttributeNode Raised when a non-attribute Node
     *     has been supplied to the method.
     */

    var uri,
        prefix,

        name,

        doc;

    if (!TP.isAttributeNode(anAttributeNode)) {
        return TP.raise(this, 'TP.sig.InvalidAttributeNode');
    }

    //  common case is HTML document attributes, so watch for that since the
    //  entire thing is a bit contrived in HTML
    doc = TP.nodeGetDocument(anAttributeNode);
    if (TP.isHTMLDocument(doc)) {
        //  grab the 'whole' name for the attribute. This may
        //  include a prefix.
        name = anAttributeNode.name;

        //  If the attribute already had a "prefix" (this is an HTML
        //  document after all, so none of this is real...), then
        //  just return that name.
        if (name.indexOf(':') !== TP.NOT_FOUND) {
            return name;
        } else {
            //  didn't have a prefix, so, as long as its owner element is
            //  really an HTML element (it could be SVG/VML), prepend 'html'
            //  and a colon (':') onto the front of the local name and
            //  return that.
            if (TP.isHTMLNode(TP.attributeGetOwnerElement(anAttributeNode))) {
                return 'html:' + name;
            }
        }
    }

    //  authored prefixes are meaningless here... we want to work from
    //  namespaceURI
    uri = TP.nodeGetNSURI(anAttributeNode);
    if (TP.notEmpty(uri)) {
        prefix = TP.w3.Xmlns.getCanonicalPrefix(uri);
    }

    //  if we couldn't get a canonical prefix, then see if we can get an
    //  authored prefix.
    if (TP.isEmpty(prefix)) {
        //  there's an authored prefix, so we'll go ahead use that
        //  (grudgingly...)
        prefix = anAttributeNode.prefix;
    }

    //  grab the local name for the attribute
    name = TP.attributeGetLocalName(anAttributeNode);

    if (TP.isEmpty(prefix)) {
        return name;
    } else {
        return prefix + ':' + name;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('attributeGetFullName',
function(anAttributeNode) {

    /**
     * @method attributeGetFullName
     * @summary Returns the prefix:attrname form of the attribute's name, if
     *     available.
     * @description Note that, in XML documents, if an attribute doesn't have a
     *     prefix, then its not considered a part of any namespace and therefore
     *     it will just returns its name. In an HTML document (which knows
     *     nothing of namespaces), this routine will 'fake' a prefix for
     *     non-prefixed attributes by prepending an 'html:' prefix onto them.
     *     This method, unlike TP.attributeGetCanonicalName(), does not try to
     *     compute a canonical prefix for the attribute. If the attribute is in
     *     an XML document and has a prefix, it will be returned as part of the
     *     name, otherwise it won't.
     * @param {Attribute} anAttributeNode The attribute node to retrieve the
     *     canonical name for.
     * @example Obtain the full name for an HTML attribute node whose name
     *     doesn't have a prefix:
     *     <code>
     *          attrNode =
     *         TP.documentGetBody(document).getAttributeNode('style');
     *          TP.attributeGetFullName(attrNode);
     *          <samp>html:style</samp>
     *     </code>
     * @example Obtain the full name for an HTML attribute node whose name has a
     *     prefix (although its not really a namespace, because its HTML):
     *     <code>
     *          TP.elementSetAttribute(TP.documentGetBody(document),
     *          'foo:bar',
     *          'baz');
     *          attrNode =
     *         TP.documentGetBody(document).getAttributeNode('foo:bar');
     *          TP.attributeGetFullName(attrNode);
     *          <samp>foo:bar</samp>
     *     </code>
     * @example Obtain the full name for an XML attribute node:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo">Hi there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // This attribute is in the default namespace (no prefix)
     *          attrNode = xmlDoc.documentElement.getAttributeNode('goo');
     *          TP.attributeGetFullName(attrNode);
     *          <samp>goo</samp>
     *          // This attribute is in the namespace with the 'bar'
     *          // prefix
     *          attrNode =
     *          xmlDoc.documentElement.getAttributeNode('bar:baz');
     *          TP.attributeGetFullName(attrNode);
     *          <samp>bar:baz</samp>
     *     </code>
     * @returns {String} The attribute's canonical name.
     * @exception TP.sig.InvalidAttributeNode Raised when a non-attribute Node
     *     has been supplied to the method.
     */

    var name;

    if (!TP.isAttributeNode(anAttributeNode)) {
        return TP.raise(this, 'TP.sig.InvalidAttributeNode');
    }

    //  In XML documents, if an attribute is not prefixed, then it is *not*
    //  considered to be in the 'default namespace' - it is considered to be
    //  in the 'null' namespace, so its very easy here - we just return the
    //  name of the attribute node. If its prefixed so be it and if its not
    //  so be it.
    if (TP.isXMLDocument(TP.nodeGetDocument(anAttributeNode))) {
        return anAttributeNode.name;
    }

    //  Otherwise, we're in an HTML document, which means that most of this
    //  is fake anyway.

    //  grab the 'whole' name for the attribute. This may include a prefix.
    name = anAttributeNode.name;

    //  in the case of HTML attributes, if a ':' has been used as part of
    //  the name (HTML elements don't care about namespaces), then return
    //  that name as the canonical name.
    if (name.indexOf(':') !== TP.NOT_FOUND) {
        return name;
    }

    //  didn't have a prefix, so prepend 'html' and a colon (':') onto the
    //  front of the local name and return that.
    return 'html:' + name;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('attributeGetLocalName',
function(anAttributeNode) {

    /**
     * @method attributeGetLocalName
     * @summary Returns the local name (that is, the name without the prefix)
     *     of the supplied attribute node.
     * @param {Attribute} anAttributeNode The attribute node to retrieve the
     *     local name for.
     * @example Obtain the local name for an attribute node:
     *     <code>
     *          attrNode =
     *         TP.documentGetBody(document).getAttributeNode('style');
     *          TP.attributeGetLocalName(attrNode);
     *          <samp>style</samp>
     *     </code>
     * @returns {String} The local name of the supplied node.
     * @exception TP.sig.InvalidAttributeNode Raised when a non-attribute Node
     *     has been supplied to the method.
     */

    var lname,
        index;

    if (!TP.isAttributeNode(anAttributeNode)) {
        return TP.raise(this, 'TP.sig.InvalidAttributeNode');
    }

    //  W3C-compliant browsers make no distinction between XML and HTML
    //  documents here. If the attribute is in an HTML document, the
    //  'whole name' will be returned since there is no concept of
    //  prefixes, namespaces, etc.
    lname = anAttributeNode.localName;
    if ((index = lname.indexOf(':')) !== TP.NOT_FOUND) {
        lname = lname.slice(index + 1);
    }

    return lname;
});

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

/*
Operations that make it easier to work with elements.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('elementAddAttributeValue',
function(anElement, attributeName, attributeValue, checkAttrNSURI) {

    /**
     * @method elementAddAttributeValue
     * @summary Adds the value of the attribute provided to any existing values
     *     which might exist, or sets the attribute to that value. This is used
     *     for space-separated attribute value management.
     * @param {Element} anElement The element to set the attribute on.
     * @param {String} attributeName The attribute to set.
     * @param {String} attributeValue The attribute value.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    var value;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    if (!TP.elementHasAttribute(anElement, attributeName, checkAttrNSURI)) {
        value = attributeValue;
    } else {
        value = TP.elementGetAttribute(anElement, attributeName,
                                                        checkAttrNSURI);
        value = value.split(' ').add(attributeValue).unique().join(' ');
    }

    TP.elementSetAttribute(anElement, attributeName, value, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementAddContent',
function(anElement, anObject, loadedFunction, shouldAwake) {

    /**
     * @method elementAddContent
     * @summary Adds content from anObject onto the end of the child content of
     *     anElement.
     * @param {Element} anElement The element receiving content.
     * @param {Object} anObject The object to use as the source of the content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just added. The default for an 'add' operation is false.
     * @exception TP.sig.InvalidElement
     * @returns {Node} The first node of the content that was just inserted.
     */

    var content;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement',
                                'Must provide a target Element node.');
    }

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(anObject, 'getResource') ?
                anObject.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                anObject;
    content = TP.unwrap(content);

    if (TP.isHTMLNode(anElement)) {
        return TP.htmlElementAddContent(anElement, content,
                                            loadedFunction, shouldAwake);
    } else {
        return TP.xmlElementAddContent(anElement, content,
                                            loadedFunction, shouldAwake);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementAddNSURI',
function(anElement, aPrefix, aURI) {

    /**
     * @method elementAddNSURI
     * @summary Adds an 'xmlns:<aPrefix>' attribute to the element. Note that
     *     'aPrefix' *must* be valid (i.e. you cannot use this mechanism to
     *     change the default namespace - no current DOM environment supports
     *     that). Note also that namespaces can only be added to elements in an
     *     XML document.
     * @param {Element} anElement The Element node to add a namespace to.
     * @param {String} aPrefix The prefix of the namespace being added. This can
     *     have the 'xmlns:' already prepended to it.
     * @param {String} aURI The URI of the namespace being added.
     * @example Add a namespace to an element in an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementAddNSURI(xmlDoc.documentElement,
     *          'svg',
     *          TP.w3.Xmlns.SVG);
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo xmlns="http://www.foo.com"
     *         xmlns:svg="http://www.w3.org/2000/svg"/&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidXMLDocument Raised when the element supplied is
     *     not part of an XML document.
     * @exception TP.sig.InvalidString Raised when a null or empty prefix or URI
     *     is provided to the method.
     */

    var xmlnsAttrName,

        attrs,
        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidXMLDocument');
    }

    if (TP.isEmpty(aPrefix) || TP.isEmpty(aURI)) {
        return TP.raise(this, 'TP.sig.InvalidString',
                        'Invalid or empty prefix or URI');
    }

    //  If the 'xmlns:' part was already provided in the supplied
    //  prefix, just use the string as is.
    if (/xmlns:/g.test(aPrefix)) {
        xmlnsAttrName = aPrefix;
    } else {
        //  Otherwise, we need to tack on the 'xmlns:' part to the
        //  supplied prefix.
        xmlnsAttrName = 'xmlns:' + aPrefix;
    }

    //  We need to make sure that we're not putting a namespace
    //  definition on an element that already has one.
    attrs = anElement.attributes;
    for (i = 0; i < attrs.length; i++) {
        if (attrs[i].name === xmlnsAttrName) {
            return;
        }
    }

    TP.elementSetAttributeInNS(anElement,
                                xmlnsAttrName,
                                aURI,
                                TP.w3.Xmlns.XMLNS);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementBecome',
function(anElement, tagName, attrHash, newXmlns, defaultAttrPrefixes) {

    /**
     * @method elementBecome
     * @summary Replaces the node with a new node of a different type, moving
     *     all attributes and children of the original node onto the new node.
     *     This is the core "compiled tag" support method allowing custom XML
     *     tags to switch into HTML tags.
     * @param {Element} anElement The original element to be transformed.
     * @param {String} tagName The local or full tag name to use for the new
     *     element.
     * @param {TP.core.Hash} attrHash An optional hash containing additional
     *     attributes for the new element. Note that if a same-named attribute
     *     already exists on the element, the value for that attribute will be
     *     updated to the value in this hash.
     * @param {String} newXmlns The official XMLNS for the new element. Default
     *     is XHTML.
     * @param {Boolean} defaultAttrPrefixes Whether prefixes for attributes
     *     should be defaulted to the current node's prefix on the new element.
     *     Default is false.
     * @returns {Element} A new element.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied tag name is empty.
     */

    var attrStr,

        prefix,
        elemWithNS,

        shouldPrefix,
        toXMLNS,

        sourceTagStr,

        tagstr,
        newElem,

        sourceNS,
        sourcePrefix,

        destPrefix,
        destNS,

        len,
        i,
        attrNode,
        attrValue,
        localName,
        hashVal;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(tagName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    attrStr = TP.isValid(attrHash) ? attrHash.asAttributeString() : '';

    //  If the newXmlns is empty, see if the new tag name has a prefix. If
    //  so, try to derive a namespaceURI from that.
    if (TP.isEmpty(toXMLNS = newXmlns)) {
        if (TP.regex.HAS_COLON.test(tagName)) {
            prefix = tagName.split(':').first();

            //  First, try to get the namespace declaration from the element
            //  itself
            if (TP.isEmpty(toXMLNS = TP.elementGetAttribute(
                                      anElement, 'xmlns:' + prefix))) {
                //  Next, try to get an ancestor that declared it
                if (!TP.isElement(
                          elemWithNS =
                              TP.nodeGetFirstAncestorByAttribute(
                                          anElement, 'xmlns:' + prefix))) {
                    //  Couldn't find one - use TIBET's meta information
                    toXMLNS = TP.w3.Xmlns.getPrefixURI(prefix);
                } else {
                    //  Get it from the ancestor that declared it
                    toXMLNS = TP.elementGetAttribute(elemWithNS,
                                                      'xmlns:' + prefix);
                }
            }

            //  Still empty? Default based on prefix then.
            if (TP.isEmpty(toXMLNS)) {
                toXMLNS = 'urn:' + prefix;

                TP.w3.Xmlns.registerNSInfo(
                        toXMLNS,
                        TP.hc('uri', toXMLNS, 'prefix', prefix));
            }
        } else {
            //  No prefix. Bare elements should default to XHTML.
            if (TP.isEmpty(toXMLNS)) {
                toXMLNS = TP.w3.Xmlns.XHTML;
            }
        }
    }

    //  If the hash didn't supply a 'tibet:tag' we compute one here. Note that
    //  the user could've specifically supplied a null value for 'tibet:tag' in
    //  the hash, which is an indication that they don't want any 'tibet:tag'
    //  for the resultant element (and which is why we use the TP.isNull check
    //  for that here).
    if (TP.notValid(attrHash) ||
        TP.notNull(attrHash.at('tibet:tag'))) {
        if (TP.isEmpty(anElement.prefix)) {
            sourceTagStr = ' tibet:tag="' +
                            TP.canonical(anElement) +
                            '"';
        } else {
            sourceTagStr = ' tibet:tag="' +
                            TP.qname(anElement) +
                            '"';
        }
    } else {
        sourceTagStr = '';
    }

    prefix = TP.notEmpty(prefix) ? ':' + prefix : '';
    tagstr = TP.join('<', tagName, ' xmlns' + prefix + '="', toXMLNS, '"',
                        (prefix === ':tibet' ?
                                '' :
                                ' xmlns:tibet="' + TP.w3.Xmlns.TIBET + '" ') +
                        sourceTagStr,
                        ' ', attrStr,
                        '>',
                    '</', tagName, '>');

    newElem = TP.elem(tagstr);
    TP.elementSetGenerator(newElem);

    if (TP.notValid(newElem)) {
        //  $elem above should have done a raise/report for us.
        return;
    }

    if (TP.notEmpty(anElement)) {
        TP.nodeMoveChildNodesTo(anElement, newElem, null, false);
    }

    //  ---
    //  Copy over attributes from the source to the target.
    //  ---

    if (TP.isTrue(defaultAttrPrefixes)) {
        shouldPrefix = true;
        if (TP.notEmpty(sourceNS = TP.nodeGetNSURI(anElement))) {
            if (TP.isEmpty(sourcePrefix = anElement.prefix)) {
                sourcePrefix = TP.w3.Xmlns.getURIPrefix(sourceNS,
                                                            anElement);
            }
        }

        if (TP.notEmpty(destNS = TP.nodeGetNSURI(newElem))) {
            if (TP.isEmpty(destPrefix = newElem.prefix)) {
                destPrefix = TP.w3.Xmlns.getURIPrefix(destNS, anElement);
            }
        }

        if (sourceNS === destNS &&
            sourcePrefix === destPrefix) {
            shouldPrefix = false;
        }
    }

    len = anElement.attributes.length;
    for (i = 0; i < len; i++) {
        attrNode = anElement.attributes[i];

        //  If the attribute's value is the same as the new element's
        //  namespace URI, don't copy it over - its an 'xmlns' attribute.
        //  This helps prevent the same namespace from being put on the
        //  element over and over again.
        if ((attrValue = attrNode.value) === toXMLNS) {
            continue;
        }

        //  If the attribute name itself (not the prefix, but just the
        //  attribute name) is 'xmlns', then we don't copy it since
        //  browsers freak out when we try to reset the default namespace.
        if ((localName = TP.attributeGetLocalName(attrNode)) === 'xmlns') {
            continue;
        }

        //  If the named attribute exists in the 'extra attribute' hash, its
        //  already going to be on the element. We don't want to blow it
        //  away, but we might not want it to stay on the element with its
        //  current value.
        if (TP.isValid(attrHash) &&
            TP.isValid(hashVal =
                    attrHash.at(TP.attributeGetFullName(attrNode)))) {
            attrNode.value = hashVal;
            continue;
        }

        if (TP.notEmpty(attrNode.namespaceURI)) {
            //  If the attribute node has an actual prefix, use it.
            if (TP.notEmpty(prefix = attrNode.prefix)) {
                TP.elementSetAttributeInNS(newElem,
                                            prefix + ':' + localName,
                                            attrValue,
                                            attrNode.namespaceURI);
            } else {
                //  Otherwise, just use the local name.
                TP.elementSetAttributeInNS(newElem,
                                            localName,
                                            attrValue,
                                            attrNode.namespaceURI);
            }
        } else if (shouldPrefix &&
                    TP.isString(sourceNS) &&
                    TP.notEmpty(sourcePrefix) &&
                    !TP.NEVER_PREFIXED_ATTRS.contains(localName)) {
            //  When we've got a valid NS, prefix, and clearance to prefix
            //  the attribute name then we'll do it the "official way".
            TP.elementSetAttributeInNS(
                                newElem,
                                sourcePrefix + ':' + localName,
                                attrValue,
                                sourceNS);
        } else {
            TP.elementSetAttribute(newElem,
                                    localName,
                                    attrValue);
        }
    }

    //  Replace the original in its source document so it truly "becomes"
    //  the new element.
    newElem = TP.nodeReplaceChild(anElement.parentNode, newElem, anElement);

    return newElem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementBubbleXMLNSAttributes',
function(anElement) {

    /**
     * @method elementBubbleXMLNSAttributes
     * @summary 'Bubbles' xmlns attributes from the supplied element 'up' it's
     *     ancestor chain in an attempt to 'de-clutter' the DOM tree. Note that
     *     care is taken to follow XML Namespaces rules (i.e. the namespace will
     *     only be redefined further up the chain if it has both the same prefix
     *     and same namespace URI value).
     * @param {Element} anElement The element to bubble the namespaces up from.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var docElem,
        docXMLNSAttrs,

        elemXMLNSAttrs,

        ancestors;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    docElem = TP.nodeGetDocument(anElement).documentElement;
    docXMLNSAttrs = TP.elementGetXMLNSAttributes(docElem, true);

    elemXMLNSAttrs = TP.elementGetXMLNSAttributes(anElement, true);

    //  This includes docElem
    ancestors = TP.nodeGetAncestors(anElement);

    elemXMLNSAttrs.perform(
        function(kvPair) {
            var wholeName,
                nsURIVal,

                entry,

                i,
                ancestor,
                nsVal;

            wholeName = kvPair.first();
            nsURIVal = kvPair.last();

            entry = docXMLNSAttrs.at(wholeName);

            //  If the document element has an attribute defined exactly the
            //  same (that is, it's name is the prefix + local name and it has
            //  the same value) then it has this namespace attribute and we can
            //  remove it from ourself.
            if (TP.isValid(entry) && entry === nsURIVal) {
                TP.elementRemoveNSURI(anElement, wholeName);

                return;
            }

            //  We don't copy the default namespace.
            if (wholeName === 'xmlns') {
                return;
            }

            //  The document element doesn't have it, so we need to work our way
            //  up the tree of ancestors. We will look for the first one that
            //  has the exact same namespace attribute (prefix + local name and
            //  the same value).
            for (i = 0; i < ancestors.getSize(); i++) {
                ancestor = ancestors.at(i);
                nsVal = TP.elementGetAttribute(ancestor, wholeName, true);

                //  If the ancestor has no value
                if (TP.isEmpty(nsVal)) {
                    //  If it's not the document element, then continue on up.
                    if (ancestor !== docElem) {
                        continue;
                    } else {
                        //  If it is the document element, then go ahead and
                        //  place the attribute, and remove it from ourself.
                        TP.elementAddNSURI(ancestor, wholeName, nsURIVal);
                        TP.elementRemoveNSURI(anElement, wholeName);
                        return;
                    }
                }

                //  If we find one that defines both the same namespace prefix
                //  and the same namespace URI value, then we can remove it from
                //  ourself and take no further action.
                if (nsVal === nsURIVal) {

                    TP.elementRemoveNSURI(anElement, wholeName);

                    return;
                }

                //  If we find one that defines the same namespace prefix, but
                //  with a different namespace URI value, then we have to go one
                //  level below it and put a namespace attribute there and
                //  remove it from ourself.
                if (nsVal !== nsURIVal && i > 0) {

                    TP.elementAddNSURI(
                            ancestors.at(i - 1), wholeName, nsURIVal);
                    TP.elementRemoveNSURI(anElement, wholeName);

                    return;
                }
            }
        });

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementBubbleXMLNSAttributesOnDescendants',
function(anElement) {

    /**
     * @method elementBubbleXMLNSAttributesOnDescendants
     * @summary 'Bubbles' xmlns attributes from the descendant elements of the
     *     supplied elements 'up' their ancestor chain in an attempt to
     *     'de-clutter' the DOM tree. Note that care is taken to follow XML
     *     Namespaces rules (i.e. the namespace will only be redefined further
     *     up the chain if it has both the same prefix and same namespace URI
     *     value).
     * @param {Element} anElement The element to query for descendants to bubble
     *     the namespaces up from.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var allElems;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Bubble xmlns attributes from the supplied Element.
    TP.elementBubbleXMLNSAttributes(anElement);

    //  Get all descendants, as long as they're Elements.
    allElems = TP.nodeGetDescendantElements(anElement);

    allElems.forEach(
        function(anElem) {
            TP.elementBubbleXMLNSAttributes(anElem);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementClean',
function(anElement) {

    /**
     * @method elementClean
     * @summary Cleans off all of the TIBET-specific or other
     *     'instance-specific' information from the supplied Element and any
     *     Element descendants.
     * @description This method cleans off the following attributes and
     *     properties from the supplied element and any Element descendants:
     *         - The 'id' attribute.
     * @param {Element} anElement The target element.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var allElems;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement',
                                'Must provide a valid Element node.');
    }

    TP.elementRemoveAttribute(anElement, 'id', true);

    //  Get all descendants, as long as they're Elements.
    allElems = TP.nodeGetDescendantElements(anElement);

    allElems.forEach(
        function(anElem) {
            //  TODO: Figure out what really needs to be removed here.
            //  TP.elementRemoveAttribute(anElem, 'id', true);
        });

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementCopyAttributes',
function(fromElement, toElement) {

    /**
     * @method elementCopyAttributes
     * @summary Copies all attributes from fromElement to toElement.
     * @param {Element} fromElement The source element.
     * @param {Element} toElement The target element.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var len,
        i,

        fromNS,
        fromAttr;

    if (!TP.isElement(fromElement) || !TP.isElement(toElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    len = fromElement.attributes.length;

    //  Loop over each attribute on the element. The 'xmlns' (or 'xmlns:...')
    //  attributes will be exposed here because this is the DOM, not XPath
    for (i = 0; i < len; i++) {
        fromAttr = fromElement.attributes[i];

        //  The 'namespace namespace' is defined by the W3C as
        //  'http://www.w3.org/2000/xmlns/'. We check for that and don't copy
        //  the attribute this way for namespace attributes. The call at the end
        //  of this routine will do that properly.
        if ((fromNS = fromAttr.namespaceURI) === TP.w3.Xmlns.XMLNS) {
            continue;
        }

        if (TP.notEmpty(fromNS)) {
            toElement.setAttributeNS(fromNS,
                                        fromAttr.name,
                                        fromAttr.value);
        } else {
            toElement.setAttribute(fromAttr.name,
                                    fromAttr.value);
        }
    }

    //  Copy over any namespace attributes.
    TP.elementCopyXMLNSAttributes(fromElement, toElement);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementCopyXMLNSAttributes',
function(fromElement, toElement) {

    /**
     * @method elementCopyXMLNSAttributes
     * @summary Copies any 'xmlns:' attributes from fromElement to toElement.
     * @description This method copies *only prefixed* namespaces. It will not
     *     copy the default namespace from fromElement. This method will also
     *     copy attributes between elements in different documents.
     * @param {Element} fromElement The source element.
     * @param {Element} toElement The target element.
     * @example Copy all of the 'xmlns:' attributes from one XML element to
     *     another:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          otherXMLDoc = TP.documentFromString('<fuzz></fuzz>');
     *          TP.elementCopyXMLNSAttributes(
     *          xmlDoc.documentElement,
     *          otherXMLDoc.documentElement);
     *          <samp>undefined</samp>
     *          TP.nodeAsString(otherXMLDoc);
     *          <samp>&lt;fuzz xmlns:bar="http://www.bar.com"/&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var len,
        i,

        fromAttr;

    if (!TP.isElement(fromElement) || !TP.isElement(toElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    len = fromElement.attributes.length;

    //  Loop over each attribute on the element. The 'xmlns' (or 'xmlns:...')
    //  attributes will be exposed here because this is the DOM, not XPath
    for (i = 0; i < len; i++) {
        fromAttr = fromElement.attributes[i];

        //  The 'namespace namespace' is defined by the W3C as
        //  'http://www.w3.org/2000/xmlns/'. We check for that, or (if its
        //  missing) we also check for the 'xmlns' prefix (IE seems to have
        //  problems setting the namespaceURI of Attribute nodes).
        if (fromAttr.namespaceURI === TP.w3.Xmlns.XMLNS ||
            fromAttr.prefix === 'xmlns') {
            //  NB: We only add prefixed namespaces here, not default
            //  namespaces.
            if (/xmlns:/g.test(fromAttr.name)) {
                TP.elementAddNSURI(toElement, fromAttr.name, fromAttr.value);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementFlagChange',
function(anElement, locationPath, action, shouldOverwrite) {

    /**
     * @method elementFlagChange
     * @summary Flags the element with a tibet:crud attribute containing the
     *     locationPath and action pair. Note that this attribute can hold
     *     multiple locationPath/action pair values.
     * @description The supplied location path should take the form of:
     *     TP.SELF                  ->  The action for the receiving element
     *                                  itself.
     *     TP.ATTR + attributeName  ->  The action for a named attribute
     *                                  E.g. 'TP.ATTRfoo'
     * @param {Element} anElement The element to flag for change using the
     *     supplied location path and action.
     * @param {String} locationPath The location path to set for an action.
     * @param {String} action An action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE.
     * @param {Boolean} shouldOverwrite Whether or not to overwrite the action
     *     for a particular location path on the supplied element. Defaults to
     *     true.
     * @returns {null}
     */

    var crudValue,
        crudEntries,

        foundEntry,

        len,
        i,

        locationChangePair;

    crudValue = TP.elementGetAttribute(anElement, 'tibet:crud', true);

    //  There may be multiple entries, separated by a vertical bar ('|'). Split
    //  them out.
    crudEntries = crudValue.split('|');

    foundEntry = false;
    len = crudEntries.getSize();
    for (i = 0; i < len; i++) {

        locationChangePair = crudEntries.at(i).split(':');

        //  Already have an entry for this location path? Just update the value.
        if (locationChangePair.first() === locationPath) {

            if (TP.notFalse(shouldOverwrite)) {
                crudEntries.atPut(i, locationPath + ':' + action);
            }

            foundEntry = true;

            //  We're done.
            break;
        }
    }

    //  If we didn't find an existing entry, make a new one.
    if (!foundEntry) {
        crudEntries.push(locationPath + ':' + action);
    }

    crudValue = crudEntries.join('|');

    TP.elementSetAttributeInNS(anElement,
                                'tibet:crud',
                                crudValue,
                                TP.w3.Xmlns.TIBET);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetChangeAction',
function(anElement, locationPath) {

    /**
     * @method elementGetChangeAction
     * @summary Returns any action for the supplied location path.
     * @description The supplied location path should take the form of:
     *     TP.SELF                  ->  The action for the receiving element
     *                                  itself.
     *     TP.ATTR + attributeName  ->  The action for a named attribute
     *                                  E.g. 'TP.ATTRfoo'
     * @param {Element} anElement The element to query for the action based on
     *     the supplied location path.
     * @param {String} locationPath The location path to query for an action.
     * @returns {String} An action such as TP.CREATE, TP.UPDATE or TP.DELETE
     */

    var crudValue,
        crudEntries,

        len,
        i,

        locationChangePair;

    //  See if there is a 'tibet:crud' attribute at all... if there isn't, there
    //  aren't any actions set on this element for either itself, any attributes
    //  it has or any children.
    if (TP.isEmpty(crudValue =
                    TP.elementGetAttribute(anElement, 'tibet:crud', true))) {

        return null;
    }

    //  There may be multiple entries, separated by a vertical bar ('|'). Split
    //  them out.
    crudEntries = crudValue.split('|');

    //  Loop and split each entry by a colon (':').
    len = crudEntries.getSize();
    for (i = 0; i < len; i++) {

        locationChangePair = crudEntries.at(i).split(':');

        //  Look for a location path that matches the supplied location. The
        //  action will be the second part of the pair.
        if (locationChangePair.first() === locationPath) {
            return locationChangePair.last();
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetLocalName',
function(anElement) {

    /**
     * @method elementGetLocalName
     * @summary Returns the local name (that is, the name without the prefix)
     *     of the supplied element node.
     * @param {Element} anElement The element node to retrieve the local name
     *     for.
     * @example Retrieve the 'local name' for the supplied element in an HTML
     *     document:
     *     <code>
     *          TP.elementGetLocalName(TP.documentGetBody(document));
     *          <samp>BODY</samp>
     *     </code>
     * @example Retrieve the 'local name' for the supplied element in an XML
     *     document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetLocalName(xmlDoc.documentElement);
     *          <samp>foo</samp>
     *     </code>
     * @returns {String} The local name of the supplied node.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    return anElement.localName;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetXMLNSAttributes',
function(anElement, includeDefault) {

    /**
     * @method elementGetXMLNSAttributes
     * @summary Returns all 'xmlns' attributes for the supplied element. Note
     *     that this method will *not* return any 'default namespace' 'xmlns'
     *     attribute that is defined on the supplied element unless the
     *     includeDefault flag is true.
     * @param {Element} anElement The element to return namespace attributes
     *     for.
     * @param {Boolean} includeDefault Whether or not to return any default
     *     'xmlns' attributes defined on the element. The default is false.
     * @returns {TP.core.Hash} A hash of xmlns attribute names and attribute
     *     values. Note that the names will be the attribute 'full name' (i.e.
     *     including the 'xmlns:' prefix).
     */

    var xmlnsAttrs,

        len,
        i,

        fromAttr;

    xmlnsAttrs = TP.hc();

    //  Loop over each attribute on the element. The 'xmlns' (or 'xmlns:...')
    //  attributes will be exposed here because this is the DOM, not XPath
    len = anElement.attributes.length;
    for (i = 0; i < len; i++) {
        fromAttr = anElement.attributes[i];

        //  The 'namespace namespace' is defined by the W3C as
        //  'http://www.w3.org/2000/xmlns/'. We check for that, or (if its
        //  missing) we also check for the 'xmlns' prefix (IE seems to have
        //  problems setting the namespaceURI of Attribute nodes).
        if (fromAttr.namespaceURI === TP.w3.Xmlns.XMLNS ||
            fromAttr.prefix === 'xmlns') {
            if (fromAttr.name === 'xmlns') {
                if (TP.isTrue(includeDefault)) {
                    xmlnsAttrs.atPut('xmlns', fromAttr.value);
                }
            } else {
                xmlnsAttrs.atPut(fromAttr.name, fromAttr.value);
            }
        }
    }

    return xmlnsAttrs;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementFromString',
function(aString, defaultNS, shouldReport) {

    /**
     * @method elementFromString
     * @summary Parses aString and returns the XML element representing the
     *     string's DOM representation. NOTE that only elements can be produced
     *     by this method, not document or text nodes for example. Use
     *     nodeFromString if you need more general parsing from text into node
     *     form.
     * @description This is different from TP.documentFromString() in that the
     *     node returned is the documentElement from that call and is,
     *     therefore, a Node not a Document.
     * @param {String} aString The source string to be parsed. Note that this
     *     String *must* be XML compliant.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @example Create a node from an XML String:
     *     <code>
     *          xmlElem = TP.elementFromString(
     *          '<foo><bar><baz/></bar></foo>');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Create a node from a malformed XML String (note the flag to show
     *     the parser errors):
     *     <code>
     *          xmlElem = TP.elementFromString(
     *          '<foo<bar><baz/></bar></foo>', true);
     *          <samp>(Parser error output)</samp>
     *     </code>
     * @returns {Node} The Node parsed from the supplied String.
     */

    var node;

    node = TP.nodeFromString(aString, defaultNS, shouldReport);

    if (TP.isElement(node)) {
        return node;
    }

    if (TP.isFragment(node)) {
        TP.ifWarn() ?
            TP.warn('Multiple nodes created. Creating first element.') : 0;

        //  The fragment may have a text node as its first child - we want
        //  the first one that's an Element.
        return TP.nodeGetFirstChildElement(node);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAttribute',
function(anElement, attributeName, checkAttrNSURI) {

    /**
     * @method elementGetAttribute
     * @summary Returns the value of the attribute provided.
     * @description This method provides some additional capabilities over the
     *     standard DOM '.getAttribute()' method:
     *          #1: If there is a method defined on the 'TP' object that follows
     *          a pattern of 'TP.elementGet<attributeName>', then that method
     *          will be called as a way of specializing attribute access. For
     *          instance, TIBET provides specialized methods for 'class' and
     *          'style' attributes. So using:
     *              TP.elementGetAttribute(anElement, 'class');
     *              will cause
     *              TP.elementGetClass(anElement); to be called.
     *          #2: Typically this method retrieves the attribute using the
     *          built-in platform attribute and namespace resolution mechanisms,
     *          but if a value cannot be determined and the supplied attribute
     *          name is prefixed (i.e. it is a namespaced attribute) and the
     *          checkAttrNSURI flag is set to 'true' this method tries an
     *          alternate mechanism to obtain a value. This mechanism uses the
     *          document's prefixes and TIBET's canonical prefixing information
     *          regarding namespaces to compute an alternate prefix for the
     *          attribute. For example, the canonical XHTML prefix is 'html:',
     *          but if the author has used the 'ht:' prefix for XHTML and the
     *          system attempts to retrieve the 'ht:foo' attribute, this
     *          method will (if the checkAttrNSURI parameter is true) also try
     *          to retrieve the value for the 'html:foo' attribute.
     * @param {Element} anElement The element to retrieve the attribute value
     *     from.
     * @param {String} attributeName The attribute to find.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @example Get the value of the attribute on an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *          xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"
     *          goo="moo">Hi there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          //  Simple attribute access
     *          TP.elementGetAttribute(xmlDoc.documentElement, 'goo');
     *          <samp>moo</samp>
     *          //  Prefixed attribute access
     *          TP.elementGetAttribute(xmlDoc.documentElement, 'xf:bind');
     *          <samp>theBinder</samp>
     *          //  Alternate prefix attribute access (need checkAttrNSURI flag)
     *          TP.elementGetAttribute(xmlDoc.documentElement,
     *          'xforms:bind',
     *          true);
     *          <samp>theBinder</samp>
     *     </code>
     * @returns {String} The attribute value, if found.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    var methodName,

        retVal,

        qualified,

        parts,
        nsURI;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    //  see if we have a specific getter like elementGetStyle
    methodName = 'elementGet' + attributeName.asTitleCase();
    if (TP.canInvoke(TP, methodName)) {
        return TP[methodName](anElement);
    }

    retVal = anElement.getAttribute(attributeName);

    //  DOM Level 4 says to return null here if attribute is missing, but we use
    //  an empty check anyway since some older browsers still return the empty
    //  String. Note that we return empty String here for backwards
    //  compatibility.
    if (TP.isEmpty(retVal)) {

        //  we can speed things up quite a bit if we avoid work related to
        //  namespaces as much as possible. In this case, test to see if the
        //  attribute name has a colon in it.
        qualified = TP.regex.HAS_COLON.test(attributeName);
        if (!qualified) {
            return '';
        }

        parts = attributeName.match(TP.regex.NS_QUALIFIED);
        if (TP.isEmpty(nsURI = anElement.lookupNamespaceURI(parts.at(1)))) {

            if (!checkAttrNSURI) {
                return '';
            }

            //  NOTE the dependency here on the XMLNS type which allows us
            //  to look up the registered URI for our prefix
            nsURI = TP.w3.Xmlns.getPrefixURI(parts.at(1));
            if (TP.isEmpty(nsURI)) {
                TP.ifWarn() ? TP.warn(
                'Couldn\'t find namespace URI for prefix: ' + parts.at(1)) : 0;
            }

            //  Note here that we use only the *local* attribute name as
            //  specified by the 'getAttributeNS' spec.
            if (TP.notEmpty(
                retVal = anElement.getAttributeNS(nsURI, parts.at(2)))) {
                return retVal;
            }

            return '';
        }

        //  Note here that we use only the *local* attribute name as specified
        //  by the 'getAttributeNS' spec.
        if (TP.notValid(retVal =
                        anElement.getAttributeNS(nsURI, parts.at(2)))) {

            //  We didn't get a value - so now we try a convenience provided by
            //  TIBET. Officially, X(HT)ML attributes are not in any namespace,
            //  including their owning element's namespace, unless they are
            //  specifically prefixed. But we provide a convenience such that,
            //  if there was no value returned by checking the 'whole attribute
            //  name' (i.e. with a prefix), we see if the namespace computed by
            //  the prefix supplied to this call is the same as the namespace of
            //  the owning element. If it is, we'll try again with just the
            //  local name of the attribute. This allows for markup authored
            //  like: <foo:bar baz="goo"/> and for us to use
            //  TP.elementGetAttribute('foo:baz') which will return 'goo'.
            if (nsURI === anElement.namespaceURI) {
                if (TP.notEmpty(retVal = anElement.getAttribute(parts.at(2)))) {
                    return retVal;
                }
            }

            return '';
        }
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAttributes',
function(anElement, attributeName, stripPrefixes) {

    /**
     * @method elementGetAttributes
     * @summary Returns a hash of zero to N attribute name/value pairs,
     *     potentially matching the attribute name provided. Note that this
     *     method will always process all attributes, whether they are in a
     *     particular namespace or not.
     * @description The attributeName in this case is expected to be of the form
     *     'wholename', '*:localname' or 'prefix:*', wildcarding either the
     *     prefix or the localname. If it is omitted, all attributes will be
     *     represented in the hash.
     * @param {Element} anElement The element to retrieve the attribute values
     *     from.
     * @param {String|RegExp} attributeName An attributeName "search" criteria
     *     of the form 'wholename' '*:localname' or 'prefix:*' or any RegExp.
     *     This is optional.
     * @param {Boolean} stripPrefixes Whether or not to strip any namespace
     *     prefixes from the attribute names as they are populated into the
     *     return value.
     * @example Grab all of the attribute values of an HTML element into a hash:
     *     <code>
     *          TP.elementGetAttributes(TP.documentGetBody(document));
     *          <samp>(hash of attributes from the body element)</samp>
     *     </code>
     * @example Grab all of the attribute values of an XML element into a hash:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo" boo="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributes(xmlDoc.documentElement);
     *          <samp>(hash of attributes from the document element)</samp>
     *     </code>
     * @example Grab only the attribute values of the attributes that start with
     *     'bar:' of an XML element into a hash:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo" bar:boo="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributes(xmlDoc.documentElement, 'bar:*');
     *          <samp>(hash of 'bar:*' attributes from the document
     *         element)</samp>
     *     </code>
     * @returns {TP.core.Hash} A collection of name/value pairs.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var dict,
        attrs,
        len,
        i,
        attrName;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    dict = TP.hc();

    //  filter by name as needed
    if (TP.isString(attributeName) || TP.isRegExp(attributeName)) {
        attrs = TP.elementGetAttributeNodes(anElement, attributeName);
    } else {
        attrs = anElement.attributes;
    }

    len = attrs.length;

    //  loop over the retrieved attribute nodes and put them into the hash
    //  keyed by name and with their value as the hash value.
    for (i = 0; i < len; i++) {
        attrName = attrs[i].name;

        //  If we're supposed to strip prefixes, then just put in one entry
        //  with the unprefixed name.
        if (stripPrefixes) {
            attrName = attrName.slice(attrName.indexOf(':') + 1);
        }

        dict.atPut(attrName, attrs[i].value);
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAttributeNames',
function(anElement, stripPrefixes) {

    /**
     * @method elementGetAttributeNames
     * @summary Returns an Array of zero to N attribute names of attributes on
     *     the provided element.
     * @description Note that this method will always process all attributes,
     *     whether they are in a particular namespace or not.
     * @param {Element} anElement The element to retrieve the attribute names
     *     from.
     * @param {Boolean} stripPrefixes Whether or not to strip any namespace
     *     prefixes from the attribute names as they are populated into the
     *     return value.
     * @example Grab all of the attribute names of an HTML element into an
     *     array:
     *     <code>
     *          TP.elementGetAttributeNames(TP.documentGetBody(document));
     *          <samp>(hash of attributes from the body element)</samp>
     *     </code>
     * @example Grab all of the attribute names of an XML element into an array:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo" boo="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributeNames(xmlDoc.documentElement);
     *          <samp>(array of attribute names from the document
     *         element)</samp>
     *     </code>
     * @example Grab all of the attribute names of an XML element into an array,
     *     stripping any prefixes they may have:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo" boo="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributeNames(xmlDoc.documentElement, true);
     *          <samp>(array of attribute names, stripped of their prefix, from
     *         the document element)</samp>
     *     </code>
     * @returns {String[]} A collection of name values.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var elementPrefix,

        names,

        attrs,

        len,
        i,

        attrName,

        nsIndex;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    elementPrefix = anElement.prefix;

    names = TP.ac();

    attrs = anElement.attributes;

    len = attrs.length;

    //  loop over the retrieved attribute nodes and put their names into the
    //  array
    for (i = 0; i < len; i++) {
        attrName = attrs[i].name;

        //  If we're supposed to strip prefixes, then just put in one entry
        //  with the unprefixed name.
        if (stripPrefixes) {
            attrName = attrName.slice(attrName.indexOf(':') + 1);
            names.push(attrName);
        } else if ((nsIndex = attrName.indexOf(':')) !== TP.NOT_FOUND) {
            //  Otherwise, if we have a prefix, then put in two entries: one
            //  with the prefix and one without.
            names.push(attrName);

            attrName = attrName.slice(nsIndex + 1);
            names.push(attrName);
        } else {
            //  Otherwise, if we don't have a prefix, but the element has a
            //  prefix, then put in two entries: one with the element's
            //  prefix and one without.
            if (TP.notEmpty(elementPrefix)) {
                names.push(elementPrefix + ':' + attrName);
            }

            names.push(attrName);
        }
    }

    return names;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAttributesAsNumbers',
function(anElement, attributeName, stripPrefixes) {

    /**
     * @method elementGetAttributesAsNumbers
     * @summary Returns a hash of zero to N attribute name/value pairs,
     *     potentially matching the attribute name provided. This routine
     *     returns each value as a Number. If the value couldn't be converted to
     *     a Number, the value returned for that attribute will be NaN.
     *     Note that this method will always process all attributes, whether
     *     they are in a particular namespace or not.
     * @description The attributeName in this case is expected to be of the form
     *     'wholename', '*:localname' or 'prefix:*', wildcarding either the
     *     prefix or the localname. If it is omitted, all attributes will be
     *     represented in the hash.
     * @param {Element} anElement The element to retrieve the attribute value
     *     from.
     * @param {String|RegExp} attributeName An attributeName "search" criteria
     *     of the form 'wholename' '*:localname' or 'prefix:*' or any RegExp.
     *     This is optional.
     * @param {Boolean} stripPrefixes Whether or not to strip any namespace
     *     prefixes from the attribute names as they are populated into the
     *     return value.
     * @example Grab all of the attribute values of an HTML element into a hash,
     *     where numeric values have been converted to Numbers and non-numeric
     *     values are represented by NaN values:
     *     <code>
     *          TP.elementGetAttributesAsNumbers(TP.documentGetBody(document));
     *          <samp>(hash of attributes from the body element)</samp>
     *     </code>
     * @example Grab all of the attribute values of an XML element into a hash,
     *     where numeric values have been converted to Numbers and non-numeric
     *     values are represented by NaN values:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo" boo="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributesAsNumbers(xmlDoc.documentElement);
     *          <samp>(hash of attributes from the document element)</samp>
     *     </code>
     * @example Grab only the attribute values of the attributes that start with
     *     'bar:' of an XML element into a hash, where numeric values have been
     *     converted to Numbers and non-numeric values are represented by NaN
     *     values:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo" bar:boo="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributesAsNumbers(xmlDoc.documentElement,
     *         'bar:*');
     *          <samp>(hash of 'bar:*' attributes from the document
     *         element)</samp>
     *     </code>
     * @returns {TP.core.Hash} A collection of name/value pairs. The value part
     *     of the pair is returned as a Number.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var elementPrefix,

        dict,

        attrs,

        len,
        i,

        attrName,

        nsIndex;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    elementPrefix = anElement.prefix;

    dict = TP.hc();

    if (TP.isString(attributeName) || TP.isRegExp(attributeName)) {
        attrs = TP.elementGetAttributeNodes(anElement, attributeName);
    } else {
        attrs = anElement.attributes;
    }

    len = attrs.length;

    //  loop over the retrieved attribute nodes and put them into the hash
    //  keyed by name and with their value as the hash value.
    for (i = 0; i < len; i++) {
        attrName = attrs[i].name;

        //  If we're supposed to strip prefixes, then just put in one entry
        //  with the unprefixed name.
        if (stripPrefixes) {
            attrName = attrName.slice(attrName.indexOf(':') + 1);
            dict.atPut(attrName, parseFloat(attrs[i].value));
        } else if ((nsIndex = attrName.indexOf(':')) !== TP.NOT_FOUND) {
            //  Otherwise, if we have a prefix, then put in two entries: one
            //  with the prefix and one without.
            dict.atPut(attrName, parseFloat(attrs[i].value));

            attrName = attrName.slice(nsIndex + 1);
            dict.atPut(attrName, parseFloat(attrs[i].value));
        } else {
            //  Otherwise, if we don't have a prefix, but the element has a
            //  prefix, then put in two entries: one with the element's
            //  prefix and one without.
            if (TP.notEmpty(elementPrefix)) {
                dict.atPut(elementPrefix + ':' + attrName,
                            parseFloat(attrs[i].value));
            }

            dict.atPut(attrName, parseFloat(attrs[i].value));
        }
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAttributeNode',
function(anElement, attributeName) {

    /**
     * @method elementGetAttributeNode
     * @summary Returns the first attribute node that matches the attribute
     *     name provided. Note that this method will always retrieve the first
     *     matching attribute node, whether it is in a particular namespace or
     *     not.
     * @description The attributeName in this case is expected to be of the form
     *     'wholename', '*:localname' or 'prefix:*', wildcarding either the
     *     prefix or the localname.
     * @param {Element} anElement The element to retrieve the attribute value
     *     from.
     * @param {String|RegExp} attributeName An attributeName "search" criteria
     *     of the form 'wholename' '*:localname' or 'prefix:*' or any RegExp.
     *     This is optional.
     * @example Return the attribute node of an HTML element:
     *     <code>
     *          TP.elementGetAttributeNode(TP.documentGetBody(document),
     *          'style');
     *          <samp>[object Attr]</samp>
     *     </code>
     * @example Grab the first attribute node of the element that starts with
     *     'bar:' of an XML element into a hash:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo" bar:boo="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributeNode(xmlDoc.documentElement, 'bar:*');
     *          <samp>(first 'bar:*' attribute node from the document
     *         element)</samp>
     *     </code>
     * @returns {Attribute|null} The first attribute node matching the attribute
     *     name criteria.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var nameMatch,

        attrs,
        len,
        i,

        attr;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return null;
    }

    if (TP.isRegExp(attributeName)) {
        nameMatch = attributeName;
    } else {
        nameMatch = TP.getQNameRegex(attributeName);
    }

    //  Loop over all of the attribute nodes and if their name produces a
    //  match using the RegExp that we generated, then return it.

    attrs = anElement.attributes;
    len = attrs.length;
    for (i = 0; i < len; i++) {
        attr = attrs[i];
        if (nameMatch.test(attr.name) && attr.specified) {
            return attr;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAttributeNodes',
function(anElement, attributeName) {

    /**
     * @method elementGetAttributeNodes
     * @summary Returns an array of zero to N attribute nodes that match the
     *     attribute name provided. Note that this method will always retrieve
     *     all attribute nodes, whether they are in a particular namespace or
     *     not.
     * @description The attributeName in this case is expected to be of the form
     *     'wholename', '*:localname' or 'prefix:*', wildcarding either the
     *     prefix or the localname. If it is omitted, all attributes will be
     *     represented in the array.
     * @param {Element} anElement The element to retrieve the attribute nodes
     *     from.
     * @param {String|RegExp} attributeName An attributeName "search" criteria
     *     of the form 'wholename' '*:localname' or 'prefix:*' or any RegExp.
     *     This is optional.
     * @example Grab all of the attribute nodes of an HTML element into a hash
     *     that are named 'style':
     *     <code>
     *          TP.elementGetAttributeNodes(TP.documentGetBody(document),
     *          'style');
     *          <samp>[object Attr]</samp>
     *     </code>
     * @example Grab only the attribute nodes of the attributes that start with
     *     'bar:' of an XML element into a hash:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" goo="moo" bar:boo="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributeNodes(xmlDoc.documentElement, 'bar:*');
     *          <samp>(array of 'bar:*' attribute nodes from the document
     *         element)</samp>
     *     </code>
     * @returns {Attribute[]} An array of zero to N attribute nodes.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var nameMatch,

        arr,

        attrs,
        len,
        i,

        attr;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.ac(anElement.attributes);
    }

    if (TP.isRegExp(attributeName)) {
        nameMatch = attributeName;
    } else {
        nameMatch = TP.getQNameRegex(attributeName);
    }

    arr = TP.ac();

    //  Loop over all of the attribute nodes and if their name produces a
    //  match using the RegExp that we generated, then add it to the result
    //  Array.

    attrs = anElement.attributes;
    len = attrs.length;
    for (i = 0; i < len; i++) {
        attr = attrs[i];
        if (nameMatch.test(attr.name) && attr.specified) {
            arr.push(attr);
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAttributeNodesInNS',
function(anElement, attributeName, attrNS) {

    /**
     * @method elementGetAttributeNodesInNS
     * @summary Returns an array of zero to N attribute nodes that match the
     *     attribute name provided and that exist in the attribute namespace.
     * @description The attributeName in this case is expected to be of the form
     *     'wholename', '*:localname' or 'prefix:*', wildcarding either the
     *     prefix or the localname. If it is omitted, all attributes will be
     *     represented in the hash.
     * @param {Element} anElement The element to retrieve the attribute value
     *     from.
     * @param {String|RegExp} attributeName An attributeName "search" criteria
     *     of the form 'wholename' '*:localname' or 'prefix:*' or any RegExp.
     *     This is optional.
     * @param {String} attrNS The namespace URI to use.
     * @example Grab only the attribute nodes of the attributes whose names are
     *     'baz' in an XML element and are also in the 'http://www.bar.com'
     *     namespace, into a hash:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com" xmlns:bar="http://www.bar.com"
     *         bar:baz="bazify" baz="zoo"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetAttributeNodesInNS(
     *          xmlDoc.documentElement,
     *          'baz',
     *          'http://www.bar.com');
     *          <samp>(array of 'baz' attribute nodes, which are also in the
     *         'http://www.bar.com' namespace, from the document element)</samp>
     *     </code>
     * @returns {Attribute[]} An array of zero to N attribute nodes.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute
     *     namespace is empty.
     */

    var arr,

        attrs,

        len,
        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attrNS)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    arr = TP.ac();

    if (TP.isString(attributeName) || TP.isRegExp(attributeName)) {
        attrs = TP.elementGetAttributeNodes(anElement, attributeName);
    } else {
        attrs = anElement.attributes;
    }

    len = attrs.length;

    for (i = 0; i < len; i++) {
        if (attrNS === attrs[i].namespaceURI) {
            arr.push(attrs[i]);
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetCanonicalName',
function(anElement, ignoreSourcetag) {

    /**
     * @method elementGetCanonicalName
     * @summary Returns the prefix:tagname form of the element's name, using
     *     namespaceURI data and TIBET's XMLNS information to return the
     *     canonical prefix version.
     * @description In an HTML document (which knows nothing of namespaces),
     *     this routine will 'fake' a prefix for non-prefixed elements by
     *     prepending an 'html:' prefix onto them. This method, unlike
     *     TP.elementGetFullName(), ignores any prefix given by the author to an
     *     element and attempts to compute a prefix by using any namespace
     *     information the element may have. For instance, the author might have
     *     called the element 'xf:input', because they aliased the prefix 'xf'
     *     to the XForms namespace, but this routine will return 'xforms:input',
     *     since 'xforms' is the 'canonical' prefix for this namespace. This
     *     distinction is important to the TIBET engine.
     * @param {Element} anElement The element to get the canonical name of.
     * @param {Boolean} ignoreSourcetag When true the element will ignore
     *     'tibet:tag' data and work purely from the node name and namespace URI
     *     data. Defaults to false.
     * @example Obtain the canonical name for an HTML element whose name doesn't
     *     have a prefix:
     *     <code>
     *          TP.elementGetCanonicalName(TP.documentGetBody(document));
     *          <samp>html:body</samp>
     *     </code>
     * @example Obtain the canonical name for an unprefixed XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<input xmlns="http://www.w3.org/2002/xforms"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetCanonicalName(xmlDoc.documentElement);
     *          <samp>xforms:input</samp>
     *     </code>
     * @example Obtain the canonical name for a prefixed XML element (but one
     *     that is not using the canonical prefix):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<xf:input xmlns:xf="http://www.w3.org/2002/xforms"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetCanonicalName(xmlDoc.documentElement);
     *          <samp>xforms:input</samp>
     *     </code>
     * @returns {String} The element's canonical name.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var tag,
        uri,
        prefix;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  tag is fastest if it exists and we're allowed to use it
    if (!ignoreSourcetag &&
        TP.notEmpty(tag = anElement.getAttribute('tibet:tag')) &&
        !TP.regex.HAS_ACP.test(tag)) {
        return tag;
    }

    //  prefixes are the tricky part...we want to work from namespaceURI
    uri = TP.nodeGetNSURI(anElement);
    if (TP.notEmpty(uri)) {
        prefix = TP.w3.Xmlns.getCanonicalPrefix(uri);
    }

    //  if a canonical prefix couldn't be found, then try to get a prefix
    //  from the element.
    if (TP.isEmpty(prefix)) {
        //  if the prefix is empty, then see if its an HTML element, in
        //  which case we 'fake' it by using 'html' as the prefix.
        if (TP.isHTMLNode(anElement)) {
            prefix = 'html';
        } else {
            //  Otherwise, use the prefix that was defined for the element
            //  if possible. this is authored value, not really canonical
            prefix = anElement.prefix;
            if (TP.isEmpty(prefix) && TP.isXHTMLNode(anElement)) {
                prefix = 'html';
            }
        }
    }

    //  now for the tag...we need local name, which differs between IE and
    //  Moz, but TIBET gives us the right answer ;-).
    tag = TP.elementGetLocalName(anElement);

    //  if there was no prefix (or we couldn't compute one), then just
    //  return the tag name here.
    if (TP.isEmpty(prefix)) {
        return tag;
    } else if (prefix === 'html') {
        //  NOTE that for our purposes all html tag names are lower case in
        //  their canonical form (since we're XHTML compliant).
        return prefix + ':' + tag.toLowerCase();
    } else {
        return prefix + ':' + tag;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetDocumentIndex',
function(anElement, joinChar) {

    /**
     * @method elementGetDocumentIndex
     * @summary Returns an index generated for the element within the document.
     * @description This index is unique within the elements's document and can
     *     be used for positioning comparison purposes with other elements. The
     *     format used here is consistent with the format for the element()
     *     scheme from XPointer but this routine does not attempt to find an
     *     ancestor with an ID, it produces a path composed entirely of
     *     numerical, 1-indexed, element positions.
     * @param {Element} anElement The Element to operate on.
     * @param {String} joinChar A character to use when joining the index parts.
     *     Default is / for element() scheme path construction.
     * @example Compute a document-level index for an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar>Some text<goo>More
     *         text</goo></bar>Yet more text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Compute the index for the 'goo' element
     *          TP.elementGetDocumentIndex(
     *          TP.nodeGetElementsByTagName(xmlDoc, 'goo').first());
     *          <samp>/1/1/2/1</samp>
     *     </code>
     * @example Compute a document-level index for an HTML element:
     *     <code>
     *          TP.elementGetDocumentIndex(TP.documentGetBody(document));
     *          <samp>/1/2/1</samp>
     *     </code>
     * @returns {String} The index or TP.NOT_FOUND.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var elem,
        index,
        path;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isDocument(anElement)) {
        return TP.NOT_FOUND;
    }

    elem = anElement;
    path = TP.ac();

    //  Loop over the ancestors as long as they're elements and get each
    //  parent index. Note how we pass 'true' so that only Element nodes are
    //  considered at each level.
    while (TP.isElement(elem) &&
            (index = TP.nodeGetIndexInParent(elem, true)) !== TP.NOT_FOUND) {
        path.push(index + 1);
        elem = elem.parentNode;
    }

    if (TP.isEmpty(path)) {
        return TP.NOT_FOUND;
    }

    return (joinChar || '/') + path.reverse().join(joinChar || '/');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetFullName',
function(anElement, ignoreSourcetag) {

    /**
     * @method elementGetFullName
     * @summary Returns the prefix:tagname form of the element's name without
     *     attempting to find a canonical prefix for any NS URI which might be
     *     present.
     * @description In an HTML document (which knows nothing of namespaces),
     *     this routine will 'fake' a prefix for non-prefixed elements by
     *     prepending an 'html:' prefix onto them. This method, unlike
     *     TP.elementGetCanonicalName(), does not try to compute a canonical
     *     prefix for the element. If the element is in an XML document and has
     *     a prefix, it will be returned as part of the name, otherwise it
     *     won't.
     * @param {Element} anElement The element to get the full name of.
     * @param {Boolean} ignoreSourcetag When true the element will ignore
     *     tibet:tag data and work purely from the node name and namespace
     *     URI data.
     * @example Obtain the full name for an HTML element whose name doesn't have
     *     a prefix:
     *     <code>
     *          TP.attributeGetFullName(TP.documentGetBody(document));
     *          <samp>html:style</samp>
     *     </code>
     * @example Obtain the full name for an unprefixed XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<input xmlns="http://www.w3.org/2002/xforms"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetFullName(xmlDoc.documentElement);
     *          <samp>input</samp>
     *     </code>
     * @example Obtain the full name for a prefixed XML element (but one that is
     *     not using the canonical prefix):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<xf:input xmlns:xf="http://www.w3.org/2002/xforms"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementGetFullName(xmlDoc.documentElement);
     *          <samp>xf:input</samp>
     *     </code>
     * @returns {String} The element's full name.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var tag,

        prefix;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  tag is fastest if it exists
    if (!ignoreSourcetag &&
        TP.notEmpty(tag = anElement.getAttribute('tibet:tag'))) {
        return tag;
    }

    //  now for the tag...we need local name, which differs between IE and
    //  Moz, but TIBET gives us the right answer ;-).
    tag = TP.elementGetLocalName(anElement);

    if (TP.regex.HAS_COLON.test(tag)) {
        return tag;
    }

    //  use the prefix that was defined for the element.
    if (TP.isEmpty(prefix = anElement.prefix)) {
        //  if the prefix is empty, then see if its an HTML element, in
        //  which case we 'fake' it by using 'html' as the prefix.
        if (TP.isHTMLNode(anElement) || TP.isXHTMLNode(anElement)) {
            prefix = 'html';
        } else if (TP.isXMLNode(anElement) &&
                    TP.isValid(TP.w3.Xmlns) &&
                    TP.notEmpty(anElement.namespaceURI)) {
            prefix = TP.w3.Xmlns.getCanonicalPrefix(anElement.namespaceURI);
        }
    }

    //  if there was no prefix then just return the tag name here.
    if (TP.isEmpty(prefix)) {
        return tag;
    } else if (prefix === 'html') {
        //  NOTE that for our purposes all html tag names are lower case in
        //  their canonical form
        return prefix + ':' + tag.toLowerCase();
    } else {
        return prefix + ':' + tag;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetGeneratingElement',
function(anElement) {

    /**
     * @method elementGetGeneratingElement
     * @summary Returns the 'generating element' that generated the supplied
     *     element. This is usually an instance of some kind of TIBET custom
     *     tag.
     * @param {Element} anElement The element to get the generating element
     *     for.
     * @returns {Element|null} The generating element, if found.
     * @exception TP.sig.InvalidElement
     */

    var tpElement,
        element;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement',
                                'Must provide a target Element node.');
    }

    tpElement = TP.wrap(anElement);
    if (TP.isKindOf(tpElement, TP.tag.CustomTag)) {
        return anElement;
    }

    element = anElement.parentNode;
    while (TP.isElement(element)) {
        tpElement = TP.wrap(element);
        if (TP.isKindOf(tpElement, TP.tag.CustomTag)) {
            return element;
        }
        element = element.parentNode;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetTextNodesMatching',
function(anElement, aMatchFunction) {

    /**
     * @method elementGetTextNodesMatching
     * @summary Returns any descendant Text nodes under the supplied element
     *     that return true when the supplied matching Function executed against
     *     their nodeValue.
     * @param {Function} aMatchFunction The Function to execute against the
     *     nodeValue of each descendant Text node. This should take one
     *     argument, the text node to test, and return a Boolean as to whether
     *     the text node matches.
     * @returns {Text[]} An array of Text nodes that match the criteria in the
     *     supplied matching Function.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var iterator,
        matchingTextNodes,
        textNode;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isCallable(aMatchFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    //  Create a NodeIterator that will walk the DOM tree.
    iterator = TP.nodeGetDocument(anElement).createNodeIterator(
                anElement,
                NodeFilter.SHOW_TEXT,
                null,
                false);

    //  Keep a list of the Text nodes that pass the test.
    matchingTextNodes = TP.ac();

    //  Iterate to the first Text node.
    textNode = iterator.nextNode();

    //  NB: We can use the 'isNode()' test since the NodeIterator guarantees us
    //  only Text nodes.
    while (TP.isNode(textNode)) {

        //  If executing the test Function returns true, then we add the Text
        //  node to our result list.
        if (aMatchFunction(textNode)) {
            matchingTextNodes.push(textNode);
        }

        //  Move on to the next Text node.
        textNode = iterator.nextNode();
    }

    return matchingTextNodes;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$elementGetPrefixedAttributeNode',
function(anElement, attributeName, checkAttrNSURI) {

    /**
     * @method $elementGetPrefixedAttributeNode
     * @summary Returns the attribute node for the name provided, optionally
     *     ensuring that a precise namespace URI match for prefixed attribute
     *     names is observed.
     * @description This is a private method. See TP.elementGetAttribute() for
     *     more information and examples on this functionality.
     * @param {Element} anElement The element to retrieve the attribute node
     *     from.
     * @param {String} attributeName The attribute to find.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, looking via URI
     *     rather than just prefix. Default is false (to keep things faster).
     * @returns {Attribute} The attribute node, if found.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    var arr,

        prefix,
        lname,

        nsuri,
        attrNode,

        docElem,

        prefixes,

        attributes,

        len,
        i,

        prefixToUse;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    if (TP.isTrue(checkAttrNSURI)) {
        //  we're being asked to be strict about NSURI, so we'll have to
        //  work a little. first we need the prefix so we can try to work
        //  from a canonical URI
        arr = attributeName.match(TP.regex.NS_QUALIFIED);
        if (TP.notValid(arr)) {
            //  Not a 'namespaced' attribute name. Return null.
            return null;
        }
        prefix = arr.at(1);
        lname = arr.at(2);

        //  NOTE the dependency here on the XMLNS type which allows us
        //  to look up the registered URI for our prefix
        nsuri = TP.w3.Xmlns.getPrefixURI(prefix);
        if (TP.notEmpty(nsuri)) {
            //  might get lucky and find it by full name and have it check
            //  out. this would be typical for things like ev: or bind:
            //  attributes that are orthagonal to the element
            if (TP.isAttributeNode(attrNode = anElement.getAttributeNode(
                                                        attributeName))) {
                if (TP.nodeGetNSURI(attrNode) === nsuri) {
                    return attrNode;
                }
            }

            //  second common case is where the attributes weren't strictly
            //  in any namespace, but that's not what most authors assume
            //  when they place unqualified names on an element in that
            //  namespace...
            if (TP.nodeGetNSURI(anElement) === nsuri) {
                //  the element is in our target namespace, so is the
                //  attribute there without the prefix? that's common
                if (TP.isAttributeNode(attrNode =
                                anElement.getAttributeNode(lname))) {
                    return attrNode;
                }
            }

            //  all we can do now is "scan" the attributes by nsuri, but we
            //  can shortcut that if the only registered prefix for that URI
            //  matches the one we've already checked... but first, we check to
            //  make sure we have a document element.
            if (TP.isElement(docElem =
                                TP.elem(TP.nodeGetDocument(anElement)))) {

                prefixes = TP.nodeGetNSPrefixes(docElem, nsuri, false);
            }

            //  If the prefixes weren't empty, but there was only one and it
            //  was the one we already checked, then bail out here.
            if (TP.notEmpty(prefixes) &&
                prefixes.getSize() === 1 &&
                prefixes.at(0) === prefix) {
                return null;
            }

            //  Otherwise, loop over all of the attributes, looking for an
            //  attribute node with a local name the same as lname and with
            //  a namespace URI the same as nsuri.
            attributes = anElement.attributes;
            len = attributes.length;
            for (i = 0; i < len; i++) {
                attrNode = attributes[i];
                if (TP.attributeGetLocalName(attrNode) === lname &&
                    TP.nodeGetNSURI(attrNode) === nsuri) {
                    return attrNode;
                }
            }

            return null;
        } else {
            //  not registered? no help then since we don't know the URI
            //  we're supposed to look for. basically we're forced into the
            //  same logic as if the flag were false...all we can do is fall
            //  through and go by prefix alone
            void 0;
        }
    }

    //  don't care about verifying URI, just find that prefix on an
    //  attribute, or determine that the attribute is on a tag with that
    //  prefix (and the attribute was authored using a mindset that presumed
    //  that attributes would get the namespaces of their ownerElement --
    //  which they don't)
    if (TP.isAttributeNode(attrNode =
                            anElement.getAttributeNode(attributeName))) {
        return attrNode;
    } else {
        //  have to know the prefix so we can see if that's the prefix on
        //  the element. if so we'll cheat a little and presume the author
        //  didn't follow the spec to the letter and didn't repeat the NS
        //  prefix on local attributes
        arr = attributeName.match(TP.regex.NS_QUALIFIED);
        if (TP.notValid(arr)) {
            return null;
        }

        prefix = arr.at(1);
        lname = arr.at(2);

        if (TP.isEmpty(prefixToUse = anElement.prefix)) {
            if (TP.isString(anElement.namespaceURI)) {
                prefixToUse =
                        TP.w3.Xmlns.getURIPrefix(anElement.namespaceURI);
            }
        }

        if (prefixToUse === prefix) {
            if (TP.isAttributeNode(
                        attrNode = anElement.getAttributeNode(lname))) {
                return attrNode;
            }
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHasAttribute',
function(anElement, attributeName, checkAttrNSURI) {

    /**
     * @method elementHasAttribute
     * @summary Returns true if the supplied element has the attribute
     *     matching the attribute name defined on it, even if the value of that
     *     is null.
     * @param {Element} anElement The element to test for the existence of the
     *     attribute.
     * @param {String} attributeName The name of the attribute to test.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @example Check to see if the supplied element has a particular attribute:
     *     <code>
     *          TP.elementHasAttribute(TP.documentGetBody(document),
     *         'style');
     *          <samp>true</samp>
     *     </code>
     * @example Check to see if the supplied element has a particular attribute
     *     in an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"
     *         goo="moo">Hi there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          //  Simple attribute access
     *          TP.elementHasAttribute(xmlDoc.documentElement, 'goo');
     *          <samp>true</samp>
     *          //  Prefixed attribute access
     *          TP.elementHasAttribute(xmlDoc.documentElement, 'xf:bind');
     *          <samp>true</samp>
     *          //  Prefixed attribute access without checkAttrNSURI - will fail
     *          TP.elementHasAttribute(xmlDoc.documentElement,
     *          'xforms:bind');
     *          <samp>false</samp>
     *          //  Alternate prefix attribute access (need checkAttrNSURI flag)
     *          TP.elementHasAttribute(xmlDoc.documentElement,
     *          'xforms:bind',
     *          true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the element has a value for the
     *     supplied attribute.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when a null or empty attribute name
     *     is provided to the method.
     */

    var qualified,

        parts,
        nsURI;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    if (!anElement.hasAttribute(attributeName)) {

        //  we can speed things up quite a bit if we avoid work related to
        //  namespaces as much as possible. In this case, test to see if the
        //  attribute name has a colon in it.
        qualified = TP.regex.HAS_COLON.test(attributeName);
        if (!qualified) {
            return false;
        }

        parts = attributeName.match(TP.regex.NS_QUALIFIED);
        if (TP.isEmpty(nsURI = anElement.lookupNamespaceURI(parts.at(1)))) {

            if (!checkAttrNSURI) {
                return false;
            }

            //  NOTE the dependency here on the XMLNS type which allows us
            //  to look up the registered URI for our prefix
            nsURI = TP.w3.Xmlns.getPrefixURI(parts.at(1));
            if (TP.isEmpty(nsURI)) {
                TP.ifWarn() ? TP.warn(
                'Couldn\'t find namespace URI for prefix: ' + parts.at(1)) : 0;
            }

            //  Yes, this could go below, but let's make it explicit for
            //  readability here.
            return anElement.hasAttributeNS(nsURI, parts.at(2));
        }

        //  Note here that we use only the *local* attribute name as specified
        //  by the 'hasAttributeNS' spec.
        if (!anElement.hasAttributeNS(nsURI, parts.at(2))) {

            //  We didn't get a 'true' - so now we try a convenience provided by
            //  TIBET. Officially, X(HT)ML attributes are not in any namespace,
            //  including their owning element's namespace, unless they are
            //  specifically prefixed. But we provide a convenience such that,
            //  if there was a false returned by checking the 'whole attribute
            //  name' (i.e. with a prefix), we see if the namespace computed by
            //  the prefix supplied to this call is the same as the namespace of
            //  the owning element. If it is, we'll try again with just the
            //  local name of the attribute. This allows for markup authored
            //  like: <foo:bar baz="goo"/> and for us to use
            //  TP.elementHasAttribute('foo:baz') which will return true.
            if (nsURI === anElement.namespaceURI) {
                return anElement.hasAttribute(parts.at(2));
            }

            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHasAttributeValue',
function(anElement, attributeName, attributeValue, checkAttrNSURI) {

    /**
     * @method elementHasAttributeValue
     * @summary Matches the value of the attribute with the value to see if
     *     they match.
     * @param {Element} anElement The element to match the attribute on.
     * @param {String} attributeName The attribute to match.
     * @param {String|RegExp} attributeValue The attribute value to try to match
     *     as either a String or as a RegExp.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @returns {Boolean} Whether or not the supplied attribute value matches
     *     the attribute value on the supplied element.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    var value,
        valueMatch;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    if (!TP.elementHasAttribute(anElement, attributeName, checkAttrNSURI)) {
        return false;
    }

    value = TP.elementGetAttribute(anElement, attributeName, checkAttrNSURI);

    if (TP.isRegExp(attributeValue)) {
        valueMatch = attributeValue;
    } else {
        //  NOTE: The RegExp here makes sure that the value is either first,
        //  last or is surrounded by one character of whitespace.
        valueMatch = TP.rc('(^|\\s)' + attributeValue + '(\\s|$)');
    }

    return valueMatch.test(value);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHasGeneratedID',
function(anElement) {

    /**
     * @method elementHasGeneratedID
     * @summary Returns true if the supplied element has a 'generated ID' - that
     *     is, an ID that was generated by TIBET and not set by the markup
     *     author or other code.
     * @param {Element} anElement The element to test for the existence of a
     *     generated ID.
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var id,

        fullName,
        generatedPrefix;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Grab the element's current ID - it's its empty, then it can't have been
    //  generated ;-).
    id = TP.elementGetAttribute(anElement, 'id', true);
    if (TP.isEmpty(id)) {
        return false;
    }

    //  The TIBET algorithm for generated IDs uses the full name and replaces
    //  ':' with '_'. Return whether or not the element's ID starts with that
    //  computed prefix.
    fullName = TP.elementGetFullName(anElement);
    generatedPrefix = fullName.replace(':', '_');

    return id.startsWith(generatedPrefix);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementInsertContent',
function(anElement, theContent, aPositionOrPath, loadedFunction, shouldAwake) {

    /**
     * @method elementInsertContent
     * @summary Inserts content from theContent into/around anElement based on
     *     the position given. The position should indicate whether the content
     *     should become the previous sibling, next sibling, first child or last
     *     child.
     * @param {Element} anElement The element receiving content.
     * @param {Object} theContent The object to use as the source of the
     *     content.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to anElement or a path to evaluate to get to a node at that
     *     position. This should be one of four values: TP.BEFORE_BEGIN,
     *     TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the path to evaluate.
     *     Default is TP.BEFORE_END.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted. The default for an 'insert' operation is false.
     * @exception TP.sig.InvalidElement
     * @returns {Node} The first node of the content that was just inserted.
     */

    var positionOrPath,
        content;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement',
                                'Must provide a target Element node.');
    }

    if (TP.notValid(theContent)) {
        return;
    }

    positionOrPath = TP.ifEmpty(aPositionOrPath, TP.BEFORE_END);

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(theContent, 'getResource') ?
                theContent.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                theContent;
    content = TP.unwrap(content);

    if (TP.isHTMLNode(anElement)) {
        return TP.htmlElementInsertContent(anElement, content,
                                            positionOrPath,
                                            loadedFunction, shouldAwake);
    } else {
        return TP.xmlElementInsertContent(anElement, content,
                                            positionOrPath,
                                            loadedFunction, shouldAwake);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementMergeAttributes',
function(fromElement, toElement, shouldOverlay, nameRegExp, useElementNS) {

    /**
     * @method elementMergeAttributes
     * @summary Merges the attributes across a pair of elements. Attributes
     *     from the fromElement are merged into the toElement.
     * @param {Element} fromElement The source element.
     * @param {Element} toElement The target element.
     * @param {Boolean} shouldOverlay If the same attribute exists on the
     *     toElement, should the new value be copied from the fromElement onto
     *     the toElement? Defaults to false.
     * @param {RegExp} nameRegExp If this RegExp is defined, then only
     *     attributes whose name matches using this RegExp will be merged from
     *     the fromElement onto the toElement.
     * @param {Boolean} useElementNS Whether or not to use the element's
     *     namespace for attributes that aren't already in a namespace. Defaults
     *     to false.
     * @example Merge attributes from one XML element to another (but not the
     *     overlaying the value of existing attributes)
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar xmlns="http://www.bar.com" id="barfy"
     *         goo="moo"/><baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementMergeAttributes(
     *          xmlDoc.documentElement.childNodes[0],
     *          xmlDoc.documentElement.childNodes[1]);
     *          <samp>undefined</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo&gt;&lt;bar xmlns="http://www.bar.com" id="barfy"
     *         goo="moo"/&gt;&lt;baz goo="moo"/&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @example Merge attributes from one XML element to another (including
     *     overlaying the value of existing attributes).
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar xmlns="http://www.bar.com" id="barfy"
     *         goo="moo"/><baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementMergeAttributes(
     *          xmlDoc.documentElement.childNodes[0],
     *          xmlDoc.documentElement.childNodes[1],
     *          true);
     *          <samp>undefined</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo&gt;&lt;bar xmlns="http://www.bar.com" id="barfy"
     *         goo="moo"/&gt;&lt;baz id="barfy"
     *         goo="moo"/&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @example Merge attributes ending with 'oo' from one XML element to
     *     another:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar xmlns="http://www.bar.com" id="barfy" goo="moo"
     *         boo="yoo" gar="mar"/><baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementMergeAttributes(
     *          xmlDoc.documentElement.childNodes[0],
     *          xmlDoc.documentElement.childNodes[1],
     *          false,
     *          /oo/);
     *          <samp>undefined</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo&gt;&lt;bar xmlns="http://www.bar.com" id="barfy"
     *         goo="moo" boo="yoo" gar="mar"/&gt;&lt;baz goo="moo"
     *         boo="yoo"/&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     */

    var forceCopy,
        hasMatcher,

        shouldPrefix,

        sourcePrefix,
        sourceNS,

        destPrefix,
        destNS,

        toXMLNS,

        len,
        i,

        attrNode,
        attrValue,

        localName,
        prefix;

    if (!TP.isElement(fromElement) || !TP.isElement(toElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    forceCopy = TP.ifInvalid(shouldOverlay, false);
    hasMatcher = TP.isRegExp(nameRegExp) ? true : false;
    toXMLNS = toElement.namespaceURI;

    if (TP.isTrue(useElementNS)) {
        shouldPrefix = true;
        if (TP.notEmpty(sourceNS = TP.nodeGetNSURI(fromElement))) {
            if (TP.isEmpty(sourcePrefix = fromElement.prefix)) {
                sourcePrefix = TP.w3.Xmlns.getURIPrefix(sourceNS,
                                                            fromElement);
            }
        }

        if (TP.notEmpty(destNS = TP.nodeGetNSURI(toElement))) {
            if (TP.isEmpty(destPrefix = toElement.prefix)) {
                destPrefix = TP.w3.Xmlns.getURIPrefix(destNS,
                                                        fromElement);
            }
        }

        if (sourceNS === destNS &&
            sourcePrefix === destPrefix) {
            shouldPrefix = false;
        }
    }

    len = fromElement.attributes.length;
    for (i = 0; i < len; i++) {
        attrNode = fromElement.attributes[i];

        //  If an attribute name matcher (a RegExp) is defined, then test it
        //  against the attribute node's name. If it doesn't pass, move on
        //  to the next attribute node.
        if (hasMatcher && !nameRegExp.test(attrNode.name)) {
            continue;
        }

        //  If the attribute's value is the same as the toElement's
        //  namespaceURI, don't copy it over - its an 'xmlns' attribute.
        //  This helps prevent the same namespace from being put on the
        //  element over and over again.
        if ((attrValue = attrNode.value) === toXMLNS) {
            continue;
        }

        //  If the attribute name itself (not the prefix, but just the
        //  attribute name) is 'xmlns', then we don't copy it since browsers
        //  freak out when we try to reset the default namespace.
        if ((localName = TP.attributeGetLocalName(attrNode)) === 'xmlns') {
            continue;
        }

        //  If we're not forcing an overlay and the fromElement already has
        //  an attribute with the same name, then we continue
        if (!forceCopy && TP.elementHasAttribute(toElement, attrNode.name)) {
            continue;
        }

        if (TP.notEmpty(attrNode.namespaceURI)) {
            //  If the attribute node has an actual prefix, use it.
            if (TP.notEmpty(prefix = attrNode.prefix)) {
                TP.elementSetAttributeInNS(toElement,
                                            prefix + ':' + localName,
                                            attrValue,
                                            attrNode.namespaceURI);
            } else {
                //  Otherwise, just use the local name.
                TP.elementSetAttributeInNS(toElement,
                                            localName,
                                            attrValue,
                                            attrNode.namespaceURI);
            }
        } else if (shouldPrefix &&
                    TP.isString(sourceNS) &&
                    TP.notEmpty(sourcePrefix) &&
                    !TP.NEVER_PREFIXED_ATTRS.contains(localName)) {
            TP.elementSetAttributeInNS(
                                toElement,
                                sourcePrefix + ':' + localName,
                                attrValue,
                                sourceNS);
        } else {
            TP.elementSetAttribute(toElement,
                                    localName,
                                    attrNode.value);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementReplaceWith',
function(anElement, anObject, loadedFunction, shouldAwake) {

    /**
     * @method elementReplaceWith
     * @summary Replaces the element with the object content provided.
     * @param {Element} anElement The element receiving content.
     * @param {Object} anObject The object to use as the source of the content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just replaced. The default for this operation is true.
     * @exception TP.sig.InvalidElement
     * @returns {Node} The first node of the content that was just inserted.
     */

    var content;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement',
                                'Must provide a target Element node.');
    }

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(anObject, 'getResource') ?
                anObject.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                anObject;
    content = TP.unwrap(content);

    if (TP.isHTMLNode(anElement)) {
        return TP.htmlElementReplaceWith(anElement, content,
                                            loadedFunction, shouldAwake);
    } else {
        return TP.xmlElementReplaceWith(anElement, content,
                                            loadedFunction, shouldAwake);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveAttribute',
function(anElement, attributeName, checkAttrNSURI) {

    /**
     * @method elementRemoveAttribute
     * @summary Removes an attribute from the supplied element whose name
     *     matches attributeName.
     * @param {Element} anElement The element to remove the attribute from.
     * @param {String} attributeName The name of the attribute to remove.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @example Remove the attribute named for the supplied element in an HTML
     *     document:
     *     <code>
     *          TP.elementSetAttribute(TP.documentGetBody(document), 'baz',
     *          'bazify');
     *          TP.elementHasAttribute(TP.documentGetBody(document), 'baz');
     *          <samp>true</samp>
     *          TP.elementRemoveAttribute(TP.documentGetBody(document),
     *         'baz');
     *          <samp>undefined</samp>
     *          TP.elementHasAttribute(TP.documentGetBody(document), 'baz');
     *          <samp>false</samp>
     *     </code>
     * @example Remove the attribute named for the supplied element in an XML
     *     document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"
     *         goo="moo">Hi there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Simple attribute removal
     *          TP.elementHasAttribute(xmlDoc.documentElement, 'goo');
     *          <samp>true</samp>
     *          TP.elementRemoveAttribute(xmlDoc.documentElement, 'goo');
     *          <samp>undefined</samp>
     *          TP.elementHasAttribute(xmlDoc.documentElement, 'goo');
     *          <samp>false</samp>
     *          // Prefixed attribute access
     *          TP.elementHasAttribute(xmlDoc.documentElement, 'xf:bind');
     *          <samp>true</samp>
     *          TP.elementRemoveAttribute(xmlDoc.documentElement,
     *          'xf:bind');
     *          <samp>undefined</samp>
     *          TP.elementHasAttribute(xmlDoc.documentElement, 'xf:bind');
     *          <samp>false</samp>
     *          // Prefixed attribute removal without checkAttrNSURI -
     *          // will fail
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"
     *         goo="moo">Hi there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementHasAttribute(xmlDoc.documentElement,
     *          'xforms:bind',
     *          true);
     *          <samp>true</samp>
     *          TP.elementRemoveAttribute(xmlDoc.documentElement,
     *          'xforms:bind');
     *          <samp>undefined</samp>
     *          TP.elementHasAttribute(xmlDoc.documentElement,
     *          'xforms:bind',
     *          true);
     *          <samp>true</samp>
     *          // Alternate prefix attribute access (need
     *          // checkAttrNSURI flag)
     *          TP.elementHasAttribute(xmlDoc.documentElement,
     *          'xforms:bind',
     *          true);
     *          <samp>true</samp>
     *          TP.elementRemoveAttribute(xmlDoc.documentElement,
     *          'xforms:bind',
     *          true);
     *          <samp>undefined</samp>
     *          TP.elementHasAttribute(xmlDoc.documentElement,
     *          'xforms:bind',
     *          true);
     *          <samp>false</samp>
     *     </code>
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when a null or empty attribute name
     *     is provided to the method.
     */

    var qualified,

        parts,
        nsURI;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    //  we can speed things up quite a bit if we avoid work related to
    //  namespaces as much as possible. In this case, test to see if the
    //  attribute name has a colon in it.
    qualified = TP.regex.HAS_COLON.test(attributeName);
    if (!qualified) {
        return anElement.removeAttribute(attributeName);
    } else {
        parts = attributeName.match(TP.regex.NS_QUALIFIED);
        if (TP.isEmpty(nsURI = anElement.lookupNamespaceURI(parts.at(1)))) {

            //  If we're not doing any advanced checking of namespaces, then
            //  exit here.
            if (!checkAttrNSURI) {
                return;
            }

            //  NOTE the dependency here on the XMLNS type which allows us
            //  to look up the registered URI for our prefix
            nsURI = TP.w3.Xmlns.getPrefixURI(parts.at(1));
            if (TP.isEmpty(nsURI)) {
                TP.ifWarn() ? TP.warn(
                'Couldn\'t find namespace URI for prefix: ' + parts.at(1)) : 0;
            }

            //  Yes, this could go below, but let's make it explicit for
            //  readability here.
            return anElement.removeAttributeNS(nsURI, parts.at(2));
        }

        //  Note here that we use only the *local* attribute name as specified
        //  by the 'removeAttributeNS' spec.
        anElement.removeAttributeNS(nsURI, parts.at(2));

        if (TP.elementHasAttribute(anElement, attributeName, checkAttrNSURI)) {

            //  If we still have the attribute, we try a convenience provided by
            //  TIBET. Officially, X(HT)ML attributes are not in any namespace,
            //  including their owning element's namespace, unless they are
            //  specifically prefixed. But we provide a convenience such that,
            //  if the attribute wasn't actually removed by using the
            //  'whole attribute name' (i.e. with a prefix), we see if the
            //  namespace computed by the prefix supplied to this call is the
            //  same as the namespace of the owning element. If it is, we'll try
            //  again with just the local name of the attribute. This allows for
            //  markup authored like: <foo:bar baz="goo"/> and for us to use
            //  TP.elementRemoveAttribute('foo:baz') which will remove the
            //  attribute.
            if (nsURI === anElement.namespaceURI) {
                anElement.removeAttribute(parts.at(2));
            }

            return;
        }
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveAttributeValue',
function(anElement, attrName, attrValue, checkAttrNSURI, removeEmptyAttr) {

    /**
     * @method elementRemoveAttributeValue
     * @summary Removes one or more occurrences of the attribute value from the
     *     supplied element.
     * @param {Element} anElement The element to remove the attribute value
     *     from.
     * @param {String} attrName The name of the attribute to remove the value
     *     from.
     * @param {String} attrValue The value to remove from the attribute's value.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @param {Boolean} [removeEmptyAttr=true] False will cause this method to
     *     *not* remove the attribute, even if it's empty after removing the
     *     value. The default is true.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @returns {Element} The element.
     */

    var existingWholeValue,

        valMatcher,
        val;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attrName)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    //  Note here how we just check to make sure the attribute value is
    //  'valid', because it might not necessarily be a String (might be a
    //  Boolean, Number, etc.)
    if (TP.notValid(attrValue)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.notEmpty(
            existingWholeValue =
                TP.elementGetAttribute(anElement, attrName, checkAttrNSURI))) {
        //  We construct a global RegExp where there could be a space and
        //  then the value we want to strip and then where there could be
        //  another space. This allows use to strip all occurrences of
        //  attrValue.
        valMatcher = TP.rc(' ?' + attrValue + ' ?', 'g');
        val = existingWholeValue.strip(valMatcher);

        if (TP.isEmpty(val) && TP.notFalse(removeEmptyAttr)) {
            TP.elementRemoveAttribute(anElement, attrName, checkAttrNSURI);
        } else {
            TP.elementSetAttribute(anElement, attrName, val, checkAttrNSURI);
        }
    }

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementReplaceAttributeValue',
function(anElement, attributeName, oldValue, newValue, checkAttrNSURI) {

    /**
     * @method elementReplaceAttributeValue
     * @summary Replaces the value of the attribute provided with a new value
     *     if the old value is found. If the old value isn't found no change is
     *     made to the attribute's value.
     * @param {Element} anElement The element to set the attribute on.
     * @param {String} attributeName The attribute to set.
     * @param {String} oldValue The old attribute value.
     * @param {String} newValue The new attribute value.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    var value,
        re;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    if (!TP.elementHasAttribute(anElement, attributeName, checkAttrNSURI)) {
        return;
    }

    value = TP.elementGetAttribute(anElement, attributeName, checkAttrNSURI);

    //  NOTE: The RegExp here makes sure that the oldValue is either first,
    //  last or is surrounded by one character of whitespace.
    re = TP.rc('(^|\\s)' + oldValue + '(\\s|$)');
    value = value.replace(re, '$1' + newValue + '$2');

    TP.elementSetAttribute(anElement, attributeName, value, checkAttrNSURI);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveNSURI',
function(anElement, aPrefix) {

    /**
     * @method elementRemoveNSURI
     * @summary Removes an 'xmlns:<aPrefix>' attribute from the element. Note
     *     that 'aPrefix' *must* be valid (i.e. you can use this
     *     mechanism to remove a default namespace attribute (i.e. a standalone
     *     'xmlns' attribute), but this will *not* change the default namespace
     *     of the supplied element - no current DOM environment supports that).
     *     Note also that namespaces can only be removed from elements in an XML
     *     document.
     * @param {Element} anElement The Element node to remove a namespace from.
     * @param {String} aPrefix The prefix of the namespace being removed. This
     *     can have the 'xmlns:' already prepended to it.
     * @example Add a namespace to an element in an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *          xmlns:svg="http://www.w3.org/2000/svg"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementRemoveNSURI(xmlDoc.documentElement,
     *          'svg');
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo xmlns="http://www.foo.com"/&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidXMLDocument Raised when the element supplied is
     *     not part of an XML document.
     * @exception TP.sig.InvalidString Raised when a null or empty prefix or URI
     *     is provided to the method.
     */

    var xmlnsAttrName;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidXMLDocument');
    }

    if (TP.isEmpty(aPrefix)) {
        return TP.raise(this, 'TP.sig.InvalidString',
                        'Invalid or empty prefix or URI');
    }

    //  If the prefix is just 'xmlns', we remove it and return - no need to
    //  continue.
    if (aPrefix === 'xmlns') {
        anElement.removeAttributeNS(TP.w3.Xmlns.XMLNS, aPrefix);
        return;
    }

    //  If the 'xmlns:' part was provided in the supplied prefix, split that off
    //  - this call doesn't want that.
    if (/xmlns:/g.test(aPrefix)) {
        xmlnsAttrName = aPrefix.slice(6);
    } else {
        //  Otherwise, just use it as is.
        xmlnsAttrName = aPrefix;
    }

    anElement.removeAttributeNS(TP.w3.Xmlns.XMLNS, xmlnsAttrName);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetAttribute',
function(anElement, attributeName, attributeValue, checkAttrNSURI) {

    /**
     * @method elementSetAttribute
     * @summary Sets the value of the attribute provided.
     * @description This method provides some additional capabilities over the
     *     standard DOM '.setAttribute()' method:
     *          #1: If there is a method defined on the 'TP' object that follows
     *          a pattern of 'TP.elementSet<attributeName>', then that method
     *          will be called as a way of specializing attribute access. For
     *          instance, TIBET provides specialized methods for 'class' and
     *          'style' attributes. So using:
     *              TP.elementSetAttribute(anElement, 'class', 'foo');
     *              will cause
     *              TP.elementSetClass(anElement, 'foo'); to be called.
     *          #2: Typically this method retrieves the attribute using the
     *          built-in platform attribute and namespace resolution mechanisms,
     *          but if a value cannot be determined and the supplied attribute
     *          name is prefixed (i.e. it is a namespaced attribute) and the
     *          checkAttrNSURI flag is set to 'true' this method tries an
     *          alternate mechanism to set the value. This mechanism uses the
     *          document's prefixes and TIBET's canonical prefixing information
     *          regarding namespaces to compute an alternate prefix for the
     *          attribute. For example, the canonical XHTML prefix is 'html:',
     *          but if the author has used the 'ht:' prefix for XHTML and the
     *          system attempts to set the 'ht:foo' attribute, this method will
     *          (if the checkAttrNSURI parameter is true) also try to set the
     *          value for the 'html:foo' attribute.
     *          If you want to force a specific namespace URI to be used you can
     *          call the companion method TP.elementSetAttributeInNS().
     * @param {Element} anElement The element to set the attribute on.
     * @param {String} attributeName The attribute to set.
     * @param {String} attributeValue The attribute value.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @example Set the value of the attribute on an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *          xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"
     *          goo="moo">Hi there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          //  Simple attribute set
     *          TP.elementSetAttribute(xmlDoc.documentElement, 'goo', 'boo');
     *          <samp>undefined</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo xmlns="http://www.foo.com"
     *          xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"
     *          goo="boo"&gt;Hi there&lt;/foo&gt;</samp>
     *          // Prefixed attribute set
     *          TP.elementSetAttribute(xmlDoc.documentElement,
     *          'xf:bind',
     *          'anotherBinder');
     *          <samp>undefined</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo xmlns="http://www.foo.com"
     *          xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="anotherBinder"
     *          goo="boo"&gt;Hi there&lt;/foo&gt;</samp>
     *          //  Alternate prefix attribute set (need checkAttrNSURI flag)
     *          TP.elementSetAttribute(xmlDoc.documentElement,
     *          'xforms:bind',
     *          'yetAnotherBinder',
     *          true);
     *          <samp>undefined</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo xmlns="http://www.foo.com"
     *          xmlns:xf="http://www.w3.org/2002/xforms"
     *          xf:bind="yetAnotherBinder" goo="boo"&gt;Hi
     *          there&lt;/foo&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    var methodName,

        qualified,

        parts,
        nsURI;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(attributeName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    //  If the attribute name is 'id', then make sure to set the computed &
    //  cached TP.GLOBAL_ID slot to null.
    if (attributeName === 'id') {
        anElement[TP.GLOBAL_ID] = null;
    }

    //  If we're not strict about namespaces, check to see if we have a
    //  more-specific 'setter'.
    methodName = 'elementSet' + attributeName.asTitleCase();
    if (TP.canInvoke(TP, methodName)) {
        TP[methodName](anElement, attributeValue);

        return;
    }

    //  we can speed things up quite a bit if we avoid work related to
    //  namespaces as much as possible. In this case, test to see if the
    //  attribute name has a colon in it.
    qualified = TP.regex.HAS_COLON.test(attributeName);
    if (!qualified) {
        return anElement.setAttribute(attributeName, attributeValue);
    } else {
        parts = attributeName.match(TP.regex.NS_QUALIFIED);
        if (TP.isEmpty(nsURI = anElement.lookupNamespaceURI(parts.at(1)))) {

            //  If we're not doing any advanced checking of namespaces, then
            //  exit here.
            if (!checkAttrNSURI) {
                return;
            }

            //  NOTE the dependency here on the XMLNS type which allows us
            //  to look up the registered URI for our prefix
            nsURI = TP.w3.Xmlns.getPrefixURI(parts.at(1));
            if (TP.isEmpty(nsURI)) {
                TP.ifWarn() ? TP.warn(
                'Couldn\'t find namespace URI for prefix: ' + parts.at(1)) : 0;
            }

            //  Using our own routine here causes an 'xmlns:<prefix>' definition
            //  to be stamped onto the element, unlike the native
            //  'setAttributeNS()' call below (which will use the full name and
            //  will put it in the right namespace, but not define the
            //  namespace).
            return TP.elementSetAttributeInNS(
                    anElement, attributeName, attributeValue, nsURI);
        }

        //  Note here that we use the full attribute name as specified by the
        //  'setAttributeNS' spec.
        return anElement.setAttributeNS(nsURI, attributeName, attributeValue);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetAttributes',
function(anElement, attributeHash, checkAttrNSURI) {

    /**
     * @method elementSetAttributes
     * @summary Sets the value of the attributes provided using the supplied
     *     TP.core.Hash.
     * @param {Element} anElement The element to set the attributes on.
     * @param {TP.core.Hash} attributeHash The attributes to set.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @example Set the attributes on an HTML element using the supplied hash:
     *     <code>
     *          TP.elementSetAttributes(TP.documentGetBody(document),
     *          TP.hc('foo','bar', 'boo','baz'));
     *          <samp>undefined</samp>
     *          // Grab the body's string... note the 'true' in the 3rd
     *          // parameter to only go 'shallow' so that we don't get
     *          // all of the body's children too.
     *          TP.nodeAsString(TP.documentGetBody(document), null, true);
     *          <samp>(html markup showing that the foo and boo attributes are
     *         part of the body's markup)</samp>
     *     </code>
     * @example Set the attributes on an XML element using the supplied hash:
     *     <code>
     *          xmlDoc = TP.doc('<foo moo="goo"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.elementSetAttributes(xmlDoc.documentElement,
     *          TP.hc('foo','bar', 'boo','baz'));
     *          <samp>undefined</samp>
     *          // Grab the xmlDoc's documentElement's string... note
     *          // the 'true' in the 3rd parameter to only go 'shallow'
     *          // so that we don't get all of the documentElement's
     *          // children too.
     *          TP.nodeAsString(xmlDoc.documentElement, null, true);
     *          <samp>&lt;foo moo="goo" foo="bar"
     *         boo="baz"&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidElement Raised when an invalid element is
     *     provided to the method.
     * @exception TP.sig.InvalidParameter Raised when an invalid attribute hash
     *     is provided to the method.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.notValid(attributeHash)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Loop over the supplied hash and set the attribute on the target
    //  element using the name (the first item in the key/value pair) and
    //  the value (the second item).
    attributeHash.perform(
            function(keyValuePair) {
                TP.elementSetAttribute(anElement,
                                        keyValuePair.first(),
                                        keyValuePair.last(),
                                        checkAttrNSURI);
            });

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetContent',
function(anElement, anObject, loadedFunction, shouldAwake) {

    /**
     * @method elementSetContent
     * @summary Inserts content from anObject into/around anElement based on
     *     the position given. The position should indicate whether the content
     *     should become the previous sibling, next sibling, first child or last
     *     child.
     * @param {Element} anElement The element receiving content.
     * @param {Object} anObject The object to use as the source of the content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just set. The default for a 'set' operation is whether anElement has
     *     a Window object associated with it or not.
     * @exception TP.sig.InvalidElement
     * @returns {Node} The first node of the content that was just inserted.
     */

    var content;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement',
                                'Must provide a target Element node.');
    }

    if (TP.notValid(anObject)) {
        TP.nodeEmptyContent(anElement);
    }

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(anObject, 'getResource') ?
                anObject.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                anObject;
    content = TP.unwrap(content);

    if (TP.isHTMLNode(anElement)) {
        return TP.htmlElementSetContent(anElement, content,
                                            loadedFunction, shouldAwake);
    } else {
        return TP.xmlElementSetContent(anElement, content,
                                            loadedFunction, shouldAwake);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetGenerator',
function(anElement) {

    /**
     * @method elementSetGenerator
     * @summary Sets the 'generator' of the target element. This is the
     *     canonical name of the element, which usually points back to the type
     *     that generated the target element when it was 'compiled'.
     * @param {Element} anElement The element to set the generator for.
     * @exception TP.sig.InvalidElement
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement',
                                'Must provide a target Element node.');
    }

    anElement[TP.GENERATOR] = TP.elementGetCanonicalName(anElement);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementStripChangeFlags',
function(anElement) {

    /**
     * @method elementStripChangeFlags
     * @summary Strips the element and any descendants of any change flags.
     * @param {Element} anElement The topmost element to start stripping change
     *     flags from.
     * @returns {null}
     */

    var descendantsWithCRUD;

    //  First, remove the 'tibet:crud' attribute from the element itself.
    TP.elementRemoveAttribute(anElement, 'tibet:crud', true);

    //  Then, descend and get descendant elements that have that attribute.
    descendantsWithCRUD = TP.nodeGetDescendantElementsByAttribute(
                                    anElement,
                                    'tibet:crud');

    //  Remove it from them too
    descendantsWithCRUD.perform(
        function(anElem) {
            TP.elementRemoveAttribute(anElem, 'tibet:crud', true);
        });

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('scriptElementGetType',
function(anElement) {

    /**
     * @method scriptElementGetType
     * @summary Returns a TIBET type, if one can be computed, from the supplied
     *     script element.
     * @description TIBET follows a naming convention whereby scripts that
     *     contain TIBET types are named consistently. This method takes
     *     advantage of that fact and tries to resolve an attribute on a script
     *     element into a named TIBET type.
     * @param {Element} anElement The script element to try to determine a TIBET
     *     type from.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.lang.RootObject|null} The type that can be determined
     *     from the script element provided.
     */

    var loc,

        typeName,
        type;

    //  Make sure we were handed a 'script' element.
    if (!TP.isElement(anElement) ||
        TP.elementGetLocalName(anElement).toLowerCase() !== 'script') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Grab the value of the 'source' attribute off of the script element.
    loc = TP.elementGetAttribute(anElement, 'source', true);

    if (TP.isEmpty(loc)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Slice off from the last '/' plus 1 to the end. That will be type name
    //  plus extension.
    loc = loc.slice(loc.lastIndexOf('/') + 1);

    //  Slice off extension
    typeName = loc.slice(0, loc.lastIndexOf('.'));

    //  Try to get the type object by that name - if it exists.
    type = TP.sys.getTypeByName(typeName);
    if (TP.isType(type)) {
        return type;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlElementAddContent',
function(anElement, theContent, loadedFunction, shouldAwake) {

    /**
     * @method xmlElementAddContent
     * @summary Adds content from theContent onto the end of the child content
     *     of anElement.
     * @param {Element} anElement The element receiving content.
     * @param {Node|String} theContent The content to insert into the element.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just added. The default for an 'add' operation is false.
     * @exception TP.sig.InvalidElement
     * @returns {Node} The first node of the content that was just added.
     */

    //  Simply a cover for inserting child content before the end of the
    //  element.
    return TP.xmlElementInsertContent(anElement,
                                        theContent,
                                        TP.BEFORE_END,
                                        loadedFunction,
                                        shouldAwake);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlElementInsertContent',
function(anElement, theContent, aPositionOrPath, loadedFunction, shouldAwake) {

    /**
     * @method xmlElementInsertContent
     * @summary Inserts content from theContent into/around anElement based on
     *     the position given. The position should indicate whether the content
     *     should become the previous sibling, next sibling, first child or last
     *     child.
     * @param {Element} anElement The element receiving content.
     * @param {Node|String} theContent The content to insert into the element.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to anElement or a path to evaluate to get to a node at that
     *     position. This should be one of four values: TP.BEFORE_BEGIN,
     *     TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the path to evaluate.
     *     Default is TP.BEFORE_END.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted. The default for an 'insert' operation is false.
     * @exception TP.sig.InvalidElement
     * @returns {Node} The first node of the content that was just inserted.
     */

    var awakenContent,

        thePosition,

        nodeContent,
        str,

        returnNode,

        insertionNode;

    if (!TP.isXMLNode(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    awakenContent = TP.ifInvalid(shouldAwake, false);

    thePosition = TP.ifEmpty(aPositionOrPath, TP.BEFORE_END);

    //  If the content is an XML node, then we just make sure its an
    //  Element, and not a Document.
    if (TP.isXMLNode(theContent)) {
        if (TP.isDocument(theContent)) {
            nodeContent = theContent.documentElement;
        } else {
            nodeContent = theContent;
        }
    } else if (TP.isString(theContent)) {
        //  Convert any entities to literals, since the caller assumed that they
        //  could pass entities, but this may create a Text node which will want
        //  literals.
        str = TP.xmlEntitiesToLiterals(theContent);

        //  Try to create a real Node from the supplied content (passing
        //  'true' to TP.nodeAsString() so that it will report parsing
        //  errors). If we can't parse a valid Node from the content, we
        //  just create a Text node using the content and use that.
        if (TP.notValid(nodeContent =
                        TP.nodeFromString(str, null, true))) {
            nodeContent = TP.nodeGetDocument(anElement).createTextNode(str);
        }
    } else {
        TP.raise(this, 'TP.sig.UnsupportedOperation');

        return null;
    }

    //  Before we move the nodeContent, if it's not detached, we stamp it with
    //  its previous position. That way, when it detaches from its current DOM,
    //  other machinery will know where it came from.
    if (!TP.nodeIsDetached(nodeContent)) {
        nodeContent[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(
                                                                nodeContent);
    }

    //  Based on the value of the position, we insert the node at the
    //  proper place in the DOM (pass in false to awaken the content - we
    //  don't awaken XML).
    switch (thePosition) {
        case TP.AFTER_END:

            //  Note the assignment to the returnNode here, since it might
            //  have come from a different document and been imported, etc.
            returnNode = TP.nodeInsertBefore(anElement.parentNode,
                                                nodeContent,
                                                anElement.nextSibling,
                                                awakenContent);

            break;

        case TP.BEFORE_BEGIN:

            //  Note the assignment to the returnNode here, since it might
            //  have come from a different document and been imported, etc.
            returnNode = TP.nodeInsertBefore(anElement.parentNode,
                                                nodeContent,
                                                anElement,
                                                awakenContent);

            break;

        case TP.AFTER_BEGIN:

            //  Note the assignment to the returnNode here, since it might
            //  have come from a different document and been imported, etc.
            returnNode = TP.nodeInsertBefore(anElement,
                                                nodeContent,
                                                anElement.firstChild,
                                                awakenContent);

            break;

        case TP.BEFORE_END:

            //  Note the assignment to the returnNode here, since it might
            //  have come from a different document and been imported, etc.
            returnNode = TP.nodeAppendChild(anElement,
                                            nodeContent,
                                            awakenContent);

            break;

        default:

            //  Evaluate the path, using anElement as the 'context node' and
            //  insert the new content before the returned node. Note here
            //  how we 'auto collapse' into one node (so if the path returns
            //  multiple nodes, only the first one will be used). This will
            //  also cause an invalid value if no nodes are found.

            if (TP.isNode(insertionNode = TP.nodeEvaluatePath(
                            anElement,
                            thePosition,
                            null,   //  let the call determine path type
                            true))) { //  autocollapse
                returnNode = TP.nodeInsertBefore(anElement,
                                                    nodeContent,
                                                    insertionNode,
                                                    awakenContent);
            }
    }

    //  If it's an element, bubble any namespaces we find to reduce clutter on
    //  the DOM tree
    if (TP.isElement(returnNode)) {
        TP.elementBubbleXMLNSAttributesOnDescendants(returnNode);
    }

    //  Execute any loaded function that we were handed.
    if (TP.isCallable(loadedFunction)) {
        loadedFunction(anElement.parentNode, returnNode);
    }

    //  Final operation is to signal that we've done the work
    try {
        //  We only signal TP.sig.DOMContentLoaded if the system is configured
        //  for it.
        if (TP.sys.shouldSignalDOMLoaded() && TP.isElement(returnNode)) {
            //  NB: For insert, it's actually the parent node that's changed
            //  it's content.
            TP.signal(TP.gid(returnNode.parentNode),
                        'TP.sig.DOMContentLoaded',
                        nodeContent);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e, 'TP.sig.DOMContentLoaded handler generated error.')) :
                0;
    }

    //  Return the new element.
    return returnNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlElementReplaceWith',
function(anElement, theContent, loadedFunction, shouldAwake) {

    /**
     * @method xmlElementReplaceWith
     * @summary Replaces anElement which should be an XML element.
     * @description This method sets the 'outer content' of anElement to
     *     theContent which means that the entire element, including its start
     *     and end tags, will be replaced with theContent. NOTE: This method may
     *     replace anElement!!! To use this method safely, always capture its
     *     return value and use that as the target element going forward.
     * @param {XMLElement} anElement The element to set the 'outer content' of.
     * @param {Node|String} theContent The content to replace the 'outer
     *     content' with.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just replaced. The default for this operation is true.
     * @exception TP.sig.InvalidElement
     * @returns {Element|Text} The newly created Node (could be a Text node,
     *     depending on how the replacement happened).
     */

    var awakenContent,

        nodeContent,
        str,

        // elemGID,

        returnNode;

    if (!TP.isXMLNode(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    awakenContent = shouldAwake;
    if (TP.notValid(awakenContent)) {
        awakenContent = TP.nodeHasWindow(anElement);
    }

    //  If the content is an XML node, then we just make sure its an
    //  Element, and not a Document.
    if (TP.isXMLNode(theContent)) {
        if (TP.isDocument(theContent)) {
            nodeContent = theContent.documentElement;
        } else {
            nodeContent = theContent;
        }
    } else if (TP.isString(theContent)) {

        //  Convert any entities to literals, since the caller assumed that they
        //  could pass entities, but this may create a Text node which will want
        //  literals.
        str = TP.xmlEntitiesToLiterals(theContent);

        //  Try to create a real Node from the supplied content (passing
        //  'true' to TP.nodeAsString() so that it will report parsing
        //  errors). If we can't parse a valid Node from the content, we
        //  just create a Text node using the content and use that.
        if (TP.notValid(nodeContent =
                        TP.nodeFromString(str, null, true))) {
            nodeContent = TP.nodeGetDocument(anElement).createTextNode(str);
        }
    } else {
        TP.raise(this, 'TP.sig.UnsupportedOperation');

        return null;
    }

    //  Before we move the nodeContent, if it's not detached, we stamp it with
    //  its previous position. That way, when it detaches from its current DOM,
    //  other machinery will know where it came from.
    if (!TP.nodeIsDetached(nodeContent)) {
        nodeContent[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(
                                                                nodeContent);
    }

    //  Before we remove anElement from its parent, we capture its 'gid' for
    //  later use.
    // elemGID = TP.gid(anElement);

    //  Replace anElement in its parent with the new node.

    //  Note the assignment to the returnNode here, since it might have come
    //  from a different document and been imported, etc.
    returnNode = TP.nodeReplaceChild(anElement.parentNode,
                                        nodeContent,
                                        anElement,
                                        awakenContent);

    //  If it's an element, bubble any namespaces we find to reduce clutter on
    //  the DOM tree
    if (TP.isElement(returnNode)) {
        TP.elementBubbleXMLNSAttributesOnDescendants(returnNode);
    }

    //  Execute any loaded function that we were handed.
    if (TP.isCallable(loadedFunction)) {
        loadedFunction(anElement, returnNode);
    }

    //  Final operation is to signal that we've done the work
    try {
        //  We only signal TP.sig.DOMContentLoaded if the system is
        //  configured for it.
        if (TP.sys.shouldSignalDOMLoaded() && TP.isElement(returnNode)) {
            //  NOTE NOTE NOTE
            //  we signal here, but from the PARENT since outer content replaces
            //  the original element
            TP.signal(TP.gid(returnNode.parentNode),
                        'TP.sig.DOMContentLoaded',
                        returnNode);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(
                    e, 'TP.sig.DOMContentLoaded handler generated error.')) : 0;
    }

    //  Return the new element.
    return returnNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlElementSetContent',
function(anElement, theContent, loadedFunction, shouldAwake) {

    /**
     * @method xmlElementSetContent
     * @summary Sets the 'content' of anElement, which should be an XML
     *     element.
     * @description This method sets the 'inner content' of anElement to
     *     theContent which means that just the contents of the element, not
     *     including its start and end tags, will be replaced with theContent.
     * @param {XMLElement} anElement The element to set the 'inner content' of.
     * @param {Node|String} theContent The content to replace the 'inner
     *     content' with.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just set. The default for a 'set' operation is whether anElement has
     *     a Window object associated with it or not.
     * @exception TP.sig.InvalidElement
     * @returns {Element|Text} The newly created Node (could be a Text node,
     *     depending on how the replacement happened).
     */

    var awakenContent,

        nodeContent,
        str,

        returnNode;

    if (!TP.isXMLNode(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    awakenContent = shouldAwake;
    if (TP.notValid(awakenContent)) {
        awakenContent = TP.nodeHasWindow(anElement);
    }

    //  If the content is an XML node, then we just make sure its an
    //  Element, and not a Document.
    if (TP.isXMLNode(theContent)) {
        if (TP.isDocument(theContent)) {
            nodeContent = theContent.documentElement;
        } else {
            nodeContent = theContent;
        }
    } else if (TP.isString(theContent)) {

        //  Convert any entities to literals, since the caller assumed that they
        //  could pass entities, but this may create a Text node which will want
        //  literals.
        str = TP.xmlEntitiesToLiterals(theContent);

        //  Try to create a real Node from the supplied content (passing
        //  'true' to TP.nodeAsString() so that it will report parsing
        //  errors). If we can't parse a valid Node from the content, we
        //  just create a Text node using the content and use that.
        if (TP.notValid(nodeContent =
                        TP.nodeFromString(str, null, true))) {
            nodeContent = TP.nodeGetDocument(anElement).createTextNode(str);
        }
    } else {
        TP.raise(this, 'TP.sig.UnsupportedOperation');

        return null;
    }

    //  Before we move the nodeContent, if it's not detached, we stamp it with
    //  its previous position. That way, when it detaches from its current DOM,
    //  other machinery will know where it came from.
    if (!TP.nodeIsDetached(nodeContent)) {
        nodeContent[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(
                                                                nodeContent);
    }

    //  Clear out the element's existing content.
    TP.nodeEmptyContent(anElement);

    //  Append the new child in (pass in false to awaken the content - we
    //  don't awaken XML).

    //  Note the assignment to the returnNode here, since it might have come
    //  from a different document and been imported, etc.
    returnNode = TP.nodeAppendChild(anElement, nodeContent, awakenContent);

    //  If it's an element, bubble any namespaces we find to reduce clutter on
    //  the DOM tree
    if (TP.isElement(returnNode)) {
        TP.elementBubbleXMLNSAttributesOnDescendants(returnNode);
    }

    //  Execute any loaded function that we were handed.
    if (TP.isCallable(loadedFunction)) {
        loadedFunction(anElement, returnNode);
    }

    //  Final operation is to signal that we've done the work
    try {
        //  We only signal TP.sig.DOMContentLoaded if the system is
        //  configured for it.
        if (TP.sys.shouldSignalDOMLoaded() && TP.isElement(returnNode)) {
            TP.signal(TP.gid(anElement),
                        'TP.sig.DOMContentLoaded',
                        theContent);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e,
                    'TP.sig.DOMContentLoaded handler generated error.')) : 0;
    }

    //  Return the new element.
    return returnNode;
});

//  ------------------------------------------------------------------------
//  ELEMENT REFLECTION
//  ------------------------------------------------------------------------

/*
Operations which test a Node for structural or 'containment' properties.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('elementIsNested',
function(anElement) {

    /**
     * @method elementIsNested
     * @summary Returns true if the element provided is nested within one or
     *     more parent elements with the same canonical name. This is often used
     *     in tag processing situations to avoid rework on nested elements which
     *     might otherwise occur.
     * @param {Element} anElement A native element to test.
     * @returns {Boolean} True if the element is a nested element.
     */

    var cname,
        ancestor;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    cname = TP.canonical(anElement);
    ancestor = TP.nodeDetectAncestor(
                    anElement,
                    function(anAncestor) {
                        return TP.canonical(anAncestor) === cname;
                    });

    return TP.isElement(ancestor);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeIsResponder',
function(aNode) {

    /**
     * @method nodeIsResponder
     * @summary Tests a node to determine if it's a valid responder element.
     *     Responders have either a tibet:ctrl or tibet:tag attribute (or are
     *     not in the XHTML namespace).
     * @param {Node} aNode The node to check.
     * @returns {Boolean} True for nodes which are elements having the proper
     *     attribute or tag values to describe a responder.
     */

    if (TP.isElement(aNode)) {
        if (TP.elementHasAttribute(aNode, 'tibet:tag') ||
            TP.elementHasAttribute(aNode, 'tibet:ctrl') ||
            !TP.w3.Xmlns.isNativeNS(TP.nodeGetNSURI(aNode))) {
            return true;
        }
    }
    return false;
});

//  ------------------------------------------------------------------------
//  DocumentFragment PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('fragmentFromString',
function(aString, defaultNS, shouldReport) {

    /**
     * @method fragmentFromString
     * @summary Parses aString and returns a document fragment containing the
     *     XML node representing the string's DOM representation. If the string
     *     is empty a fragment containing an empty text node is returned, when
     *     an element is produced that element is returned. CDATA and other node
     *     types are also possible output from this routine.
     * @param {String} aString The source string to be parsed. Note that this
     *     String *must* be XML compliant.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @example Create a node from an XML String:
     *     <code>
     *          xmlFrag = TP.fragmentFromString(
     *          '<foo></foo><bar></bar>');
     *          <samp>[object DocumentFragment]</samp>
     *     </code>
     * @example Create a node from a malformed XML String (note the flag to show
     *     the parser errors):
     *     <code>
     *          xmlElem = TP.fragmentFromString(
     *          '<foo</foo><bar></bar>', true);
     *          <samp>(Parser error output)</samp>
     *     </code>
     * @returns {DocumentFragment} The DocumentFragment parsed from the supplied
     *     String.
     */

    var aNode,
        fragment;

    //  TP.nodeFromString() will hand back a DocumentFragment if a fragment
    //  (i.e. a 'rootless XML string') was supplied to it. If it does, just
    //  return that.
    aNode = TP.nodeFromString(aString, defaultNS, shouldReport);
    if (TP.isFragment(aNode)) {
        return aNode;
    } else if (TP.isNode(aNode)) {
        //  Otherwise, construct a fragment and append the node returned to
        //  that.
        fragment = TP.documentConstructFragment(TP.nodeGetDocument(aNode));

        //  Note here how we pass 'false' to *not* awaken any content that
        //  gets appended.
        TP.nodeAppendChild(fragment, aNode, false);

        return fragment;
    }

    //  Couldn't get good result from TP.nodeFromString()... must've been a
    //  parsing error.

    return;
});

//  ------------------------------------------------------------------------
//  NodeList PRIMITIVES
//  ------------------------------------------------------------------------

/*
Operations designed to make it easier to work with NodeList instances.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeListAsDocument',
function(aNodeList, aTagname, aNamespace) {

    /**
     * @method nodeListAsDocument
     * @summary Returns a document object whose document element's child
     *     content consists of cloned versions of the nodeList items.
     * @description The root element of the document defaults to a tag name of
     *     'instanceData', consistent with the XForms specification if no tag
     *     name is provided. Note also that, if a namespace is provided, it
     *     applies *only to the document element of the new document that is
     *     created* and not to the cloned versions of the nodes supplied in the
     *     node list.
     * @param {NodeList} aNodeList The node list to convert.
     * @param {String} aTagname The name of the document element. Defaults to
     *     'instanceData'.
     * @param {String} aNamespace The namespace URI for the namespace of the
     *     document element.
     * @example Make an XML document from two nodes in an XML document. Note how
     *     the namespace and prefix only apply to the new document's document
     *     element:
     *     <code>
     *          xmlDoc = TP.doc('<foo><bar/><baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          newDoc = TP.nodeListAsDocument(
     *          TP.nodeGetChildElements(
     *          xmlDoc.documentElement),
     *          'boo:goo',
     *          'http://www.boo.com');
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;boo:goo xmlns:boo="http://www.boo.com"&gt;&lt;bar
     *         xmlns=""&gt;&lt;/bar&gt;&lt;baz
     *         xmlns=""&gt;&lt;/baz&gt;&lt;/boo:goo&gt;</samp>
     *     </code>
     * @returns {Document} The supplied NodeList as a Document.
     * @exception TP.sig.InvalidNodeList Raised when an invalid node list is
     *     provided to the method.
     * @exception TP.sig.InvalidDocument Raised when an invalid document is
     *     created by the method. This usually means a malformed tag name was
     *     supplied.
     * @exception TP.sig.InvalidNode Raised when one of the supplied nodes is
     *     not an XML node.
     */

    var tagName,
        doc,

        i;

    if (!TP.isNodeList(aNodeList)) {
        return TP.raise(this, 'TP.sig.InvalidNodeList');
    }

    tagName = TP.ifEmpty(aTagname, 'instanceData');

    //  create the document
    if (TP.notValid(doc = TP.constructDocument(aNamespace, tagName))) {
        return;
    }

    //  they must have specified an invalid element name, which isn't good
    if (TP.notValid(doc.documentElement)) {
        return TP.raise(this, 'TP.sig.InvalidDocument',
                                        'No documentElement found.');
    }

    for (i = 0; i < aNodeList.length; i++) {
        //  Make sure that the current node is an XML node
        if (!TP.isXMLNode(aNodeList[i])) {
            return TP.raise(this, 'TP.sig.InvalidNode',
                                        'All nodes must be XML nodes.');
        }

        //  Note here how we pass 'false' to *not* awaken any content that
        //  gets appended.
        TP.nodeAppendChild(
                doc.documentElement,
                TP.nodeCloneNode(aNodeList[i], true),
                false);
    }

    return doc;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeListAsFragment',
function(aNodeList, aDocument, shouldClone) {

    /**
     * @method nodeListAsFragment
     * @summary Returns a document fragment whose child content consists of the
     *     nodeList items.
     * @description The fragment is constructed relative to the document
     *     provided. If shouldClone is true then the content of the node list
     *     (or array) is cloned during the operation.
     * @param {NodeList} aNodeList The node list to convert.
     * @param {Document} aDocument The document that will "own" the fragment. If
     *     this isn't supplied, but the node list has at least one Node, either
     *     the UI canvas's document or the standard XML_FACTORY_DOCUMENT will be
     *     used.
     * @param {Boolean} shouldClone True to force the elements to be cloned.
     *     Default is false.
     * @example Make a document fragment using a list of HTML nodes. Note here
     *     how we force the call to clone the nodes, since we don't want to
     *     modify the original document. The document that the fragment will be
     *     created in will be the currently set 'UI canvas':
     *     <code>
     *          allSpans = TP.nodeGetElementsByTagName(document,
     *          'span');
     *          <samp>[object HTMLSpanElement], [object
     *         HTMLSpanElement]...</samp>
     *          allSpansFragment = TP.nodeListAsFragment(allSpans, null,
     *          true);
     *          <samp>[object DocumentFragment]</samp>
     *          TP.nodeAsString(allSpansFragment);
     *          <samp>(html markup showing that the content of the new fragment
     *         are all 'span' elements)</samp>
     *     </code>
     * @example Make a document fragment using a list of XML nodes. Note here
     *     that we're *not* going to clone the nodes, which will cause them to
     *     be removed from the original document, but since we're supplying that
     *     document to the call, the fragment will be created in the context of
     *     that document:
     *     <code>
     *          xmlDoc = TP.doc('<foo><bar/><baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          newFrag = TP.nodeListAsFragment(
     *          TP.nodeGetChildElements(
     *          xmlDoc.documentElement),
     *          xmlDoc);
     *          <samp>[object DocumentFragment]</samp>
     *          TP.nodeAsString(newFrag);
     *          <samp>&lt;bar&gt;&lt;/bar&gt;<baz&gt;&lt;/baz&gt;</samp>
     *     </code>
     * @returns {DocumentFragment} The list as a DocumentFragment.
     * @exception TP.sig.InvalidNodeList Raised when an invalid node list is
     *     provided to the method.
     * @exception TP.sig.InvalidDocument Raised when an invalid document is
     *     provided to the method or when a document cannot be created if
     *     needed.
     */

    var doc,
        fragment,
        i,
        len,
        node,
        list,
        firstNode;

    if (!TP.isNodeList(aNodeList)) {
        return TP.raise(this, 'TP.sig.InvalidNodeList');
    }

    //  if there's nothing in the node list, the caller better have provided
    //  a document in the appropriate parameter.
    if (aNodeList.length < 1) {
        doc = TP.ifInvalid(aDocument, TP.XML_FACTORY_DOCUMENT);

        return TP.documentConstructFragment(doc);
    }

    //  default to the document provided, or the document of the first node
    firstNode = aNodeList.item(0);
    doc = aDocument;
    if (TP.notValid(doc)) {
        doc = TP.nodeGetDocument(firstNode);
    }

    //  create the fragment
    if (TP.notValid(fragment = TP.documentConstructFragment(doc))) {
        return;
    }

    //  put elements in true array, eliminating issues with indexing when we
    //  don't clone and the elements leave a true nodelist
    list = TP.ac(aNodeList);
    len = list.getSize();
    for (i = 0; i < len; i++) {
        node = list.at(i);

        //  Note here how we pass 'false' to *not* awaken any content that
        //  gets appended.
        TP.nodeAppendChild(fragment,
                            shouldClone ? TP.copy(node) : node,
                            false);
    }

    return fragment;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeListFilterNonRoots',
function(aNodeList, aTestFunction) {

    /**
     * @method nodeListFilterNonRoots
     * @summary Filters any 'non-roots' out of the supplied NodeList.
     * @description This method filters out any Nodes from the supplied node
     *     list that are descendants of other nodes in the same list, thereby
     *     returning an Array of only 'root' nodes.
     * @param {NodeList|Node[]} aNodeList The node list to filter.
     * @param {Function} [aTestFunction] The function to use to test. This is
     *     optional and, if not supplied, a 'node contains' test is used. The
     *     function takes two parameters: the root node and the node to test
     *     and should return *true* if the node to test should be excluded from
     *     the roots list. The default test function will exclude the node to
     *     test if it is contained within the root node.
     * @returns {Node[]} The supplied NodeList filtered for non-root nodes.
     */

    var allNodes,

        testFunc,

        rootNodes,
        isDescendant,
        testNode,
        j;

    if (!TP.isArray(aNodeList)) {
        allNodes = TP.ac(aNodeList);
    } else {
        allNodes = TP.copy(aNodeList);
    }

    if (TP.isCallable(aTestFunction)) {
        testFunc = aTestFunction;
    } else {
        testFunc = function(aRootNode, aTestNode) {
                        return aRootNode.contains(aTestNode);
                    };
    }
    rootNodes = TP.ac();

    //  Iterate over all of the nodes.
    while (TP.notEmpty(allNodes)) {

        isDescendant = false;

        //  Shift off the head of the list.
        testNode = allNodes.shift();

        //  Iterate over all of the already plucked 'root' nodes and run the
        //  test function on them. If the test fails, then it's a descendant.
        for (j = 0; j < rootNodes.getSize(); j++) {
            if (testFunc(rootNodes.at(j), testNode)) {
                isDescendant = true;
                break;
            }
        }

        //  If it wasn't a descendant of one of the already plucked 'roots',
        //  then check the rest of the nodes left in the 'all' list.
        if (!isDescendant) {
            for (j = 0; j < allNodes.getSize(); j++) {
                if (allNodes.at(j).contains(testNode)) {
                    isDescendant = true;
                    break;
                }
            }
        }

        //  If it wasn't a descendant, then add it to the root list.
        if (!isDescendant) {
            rootNodes.push(testNode);
        }
    }

    return rootNodes;
});

//  ------------------------------------------------------------------------
//  NODE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAddContent',
function(aNode, anObject, loadedFunction, shouldAwake) {

    /**
     * @method nodeAddContent
     * @summary Adds content from anObject onto the end of the child content of
     *     anObject.
     * @param {Node} aNode The node to add content for.
     * @param {Object} anObject The object to use as the source of the content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just added. The default for an 'add' operation is false.
     * @returns {Node} The first node of the content that was just added.
     */

    //  Simply a cover for inserting child content before the end of the
    //  element.
    return TP.nodeInsertContent(aNode,
                                anObject,
                                TP.BEFORE_END,
                                loadedFunction,
                                shouldAwake);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAppendChild',
function(aNode, newNode, shouldAwake) {

    /**
     * @method nodeAppendChild
     * @summary Appends the new node to the supplied node and then 'awakens'
     *     (initializes) the newly added content.
     * @param {Node} aNode The node to append the child node to.
     * @param {Node|String} newNode The node to append to aNode, or a valid
     *     string of markup representing a single root node (with optional
     *     children) to append.
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just appended. The default for this operation is false.
     * @exception TP.sig.InvalidNode
     * @returns {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     */

    var childContent,
        firstElement,
        targetNode,

        iframeDocElems,

        importedContent,

        awakenContent,
        childNodeCount;

    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', aNode);
    }

    if (TP.isString(newNode)) {
        //  this will throw/raise so we don't have to
        childContent = TP.nodeFromString(newNode);
        if (!TP.isNode(newNode)) {
            return;
        }
    } else if (!TP.isNode(newNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', newNode);
    } else {
        childContent = newNode;
    }

    //  if the target is a document and not the documentElement we can't
    //  accept new content unless the document has no current document
    //  element.
    if (TP.isDocument(aNode)) {
        if (TP.isElement(aNode.documentElement)) {
            TP.raise(this, 'TP.sig.InvalidOperation',
                        'Cannot append to #document node with an' +
                        ' existing root.');

            return;
        } else if (TP.isFragment(childContent)) {
            //  not valid, but we may have more than one inbound element so
            //  we have to check and potentially discard extras
            firstElement = TP.nodeGetFirstChildElement(childContent);
            if (TP.notValid(firstElement)) {
                TP.raise(this, 'TP.sig.InvalidOperation',
                            'Must supply element for #document root.');

                return;
            } else if (childContent.childNodes.length > 1) {
                TP.ifWarn() && TP.sys.cfg('log.node_discarded') ?
                    TP.warn('Discarding nodes from fragment: ' +
                                TP.str(childContent)) : 0;
            }

            childContent = firstElement;
        }
    }

    targetNode = aNode;

    //  For some browsers, we need to capture the iframe content before we
    //  move the node. This includes any iframes that are descendants of the
    //  node we're moving.
    if (TP.isElement(newNode)) {
        iframeDocElems = TP.$$elementPreserveIFrameContent(newNode);
    }

    //  The logic in this method is predicated on the fact that childContent
    //  might very well be a Node.DOCUMENT_FRAGMENT_NODE and, therefore,
    //  will be inserting *multiple* children into the common parent.

    //  make sure the node we'll insert is a part of the target node's
    //  document. as of ff3 and s3 this is required to avoid exceptions
    importedContent = TP.nodeImportNode(targetNode, childContent);

    awakenContent = TP.ifInvalid(shouldAwake, false);

    //  Grab the current number of children
    childNodeCount = targetNode.childNodes.length;

    //  Before we move the importedContent, if it's not detached, we stamp it
    //  with its previous position. That way, when it detaches from its current
    //  DOM, other machinery will know where it came from.
    if (!TP.nodeIsDetached(importedContent)) {
        importedContent[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(
                                                            importedContent);
    }

    try {
        //  Append the new content. This will (or should) change the number
        //  of children. NOTE, this will empty importedContent if it's a
        //  fragment.
        targetNode.appendChild(importedContent);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'appendChild generated error.')) : 0;

        return;
    }

    //  if newNode was a fragment, then it should now be empty to maintain
    //  semantic consistency with a standard appendChild call. If newNode
    //  was a string we don't bother to empty it.
    if (TP.isFragment(newNode)) {
        TP.nodeEmptyContent(newNode);
    }

    //  If we preserved the iframe content (see above), then we need to
    //  restore it.
    if (TP.isElement(targetNode) && TP.notEmpty(iframeDocElems)) {
        TP.$$elementRestoreIFrameContent(targetNode, iframeDocElems);
    }

    if (awakenContent) {
        TP.nodeAwakenChildNodesFromTo(targetNode,
                                        childNodeCount,
                                        TP.LAST);
    }

    //  If the new content was a fragment, then we need to return the final
    //  content's child node that starts at that point.
    if (TP.isFragment(importedContent)) {
        return targetNode.childNodes[childNodeCount];
    }

    return importedContent;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeContainsNode',
function(aNode, aDescendant) {

    /**
     * @method nodeContainsNode
     * @summary Returns whether or not aNode is an ancestor (or the
     *     document for) aDescendant. If aNode is a Document node, this
     *     method will return true if aDescendant's document is aNode.
     * @param {Node} aNode The node to check to see if aDescendant is
     *     contained within it.
     * @param {Node} aDescendant The node to check to see if it is contained
     *     within aNode.
     * @example Test to see if the document element in an XML document is
     *     the parent of its firstChild:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeContainsNode(xmlDoc.documentElement,
     *          xmlDoc.documentElement.firstChild);
     *          <samp>true</samp>
     *          // But the inverse isn't true:
     *          TP.nodeContainsNode(xmlDoc.documentElement.firstChild,
     *          xmlDoc.documentElement);
     *          <samp>false</samp>
     *     </code>
     * @example Test to see if the document element in an HTML document is
     *     the parent of the body element:
     *     <code>
     *          TP.nodeContainsNode(document.documentElement,
     *          TP.documentGetBody(document));
     *          <samp>true</samp>
     *          // But the inverse isn't true:
     *          TP.nodeContainsNode(TP.documentGetBody(document),
     *          document.documentElement);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not aNode is a parent of aDescendant.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method or an invalid child
     *     is provided.
     */

    var root;

    //  No child nodes for anything that isn't an element, document or document
    //  fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isNode(aDescendant)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  For documents the question is whether the child is an element and is in
    //  the document and still attached to a viable branch of the
    //  documentElement tree
    if (TP.isDocument(aNode) && TP.isElement(aDescendant)) {
        if (TP.nodeGetDocument(aDescendant) !== aNode ||
            TP.notValid(aNode.documentElement)) {
            return false;
        }

        root = aNode.documentElement;
        if (root === aDescendant) {
            return true;
        }
    }

    root = TP.ifInvalid(root, aNode);

    //  Otherwise, we can use the built-in 'compareDocumentPosition' method
    //  here. Thanks to Peter-Paul Koch.
    return Boolean(root.compareDocumentPosition(aDescendant) & 16);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDetach',
function(aNode) {

    /**
     * @method nodeDetach
     * @summary Removes the node from its parent. This is simple sugar for
     *     TP.nodeRemoveChild().
     * @param {Node} aNode The node to detach.
     * @exception TP.sig.InvalidNode
     * @returns {Node} The detached node.
     */

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  Need to do whatever TP.nodeRemoveChild() does.
    return TP.nodeRemoveChild(aNode.parentNode, aNode);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEqualsNode',
function(aNode, otherNode) {

    /**
     * @method nodeEqualsNode
     * @summary Compares two nodes for 'equality'.
     * @description This method follows the DOM Level 3 standard for checking
     *     Nodes for equality with each other. This specification states that
     *     two Nodes are equal if:
     *          -   The two nodes are of the same type
     *          -   The following string attributes are equal (they are either
     *              both null or they have the same length and are character for
     *              character identical):
     *                  -   nodeName
     *                  -   localName
     *                  -   namespaceURI
     *                  -   prefix
     *                  -   nodeValue
     *          -   The 'attributes' NamedNodeMaps are equal (they are either
     *              both null or have the same length and for each node that
     *              exists in one map there is a node that exists in the other
     *              map and is equal although *not necessarily at the same
     *              index*).
     *          -   The 'childNodes' NodeLists are equal (they are either both
     *              null or have the same length and contain equal nodes *at the
     *              same index*). Note that this method normalizes these nodes
     *              to make sure that this comparison is performed accurately.
     * @param {Node} aNode The node to check against otherNode.
     * @param {Node} otherNode The node to check against aNode.
     * @returns {Boolean} Whether or not the two nodes are *equal* (not
     *     necessarily identical).
     * @exception TP.sig.InvalidNode Raised when either node is an invalid node.
     */

    if (!TP.isNode(aNode) || !TP.isNode(otherNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  In browsers that implement the W3C's DOM Level 3 'isEqualNode' call,
    //  we can just leverage that.

    return aNode.isEqualNode(otherNode);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetAncestorPositions',
function(aNode, includeNode, aPrefix, joinChar) {

    /**
     * @method nodeGetAncestorPositions
     * @summary Returns an array of position strings for the provided node's
     *     ancestors. If the includeNode flag is true then the list starts with
     *     aNode's position, otherwise the first entry represents aNode's
     *     parentNode position.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Boolean} includeNode True to include the node's position in the
     *     list. Default is false.
     * @param {String} aPrefix An optional prefix, usually a document location
     *     which allows the positions to be canvas and document specific for
     *     observations.
     * @param {String} joinChar A character to use when joining the index parts.
     *     Default is '.'.
     * @returns {String[]} An array of position strings.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var node,
        path,
        index,
        arr,
        prefix;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    prefix = TP.ifInvalid(aPrefix, '');

    path = TP.ac();

    if (TP.isAttributeNode(aNode)) {
        node = TP.attributeGetOwnerElement(aNode);
        index = TP.nodeGetIndexInParent(node);
        path.push(index + '@' + TP.attributeGetLocalName(aNode));
        node = node.parentNode;
    } else if (TP.isElement(aNode)) {
        node = aNode;
    } else {
        node = aNode.parentNode;
    }

    while (TP.isElement(node) &&
            (index = TP.nodeGetIndexInParent(node)) !== TP.NOT_FOUND) {
        path.push(index);
        node = node.parentNode;
    }

    if (index === TP.NOT_FOUND) {
        return TP.NOT_FOUND;
    }

    path.reverse();

    //  shift off the element's index if we're not going to include it. this
    //  way the loop below will start joining with parent index
    if (TP.notTrue(includeNode)) {
        path.length = path.length - 1;
    }

    arr = TP.ac();
    while (path.length > 0) {
        arr.push(prefix + path.join(joinChar || '.'));
        path.length = path.length - 1;
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDocumentPosition',
function(aNode, joinChar, stopAncestor, onlyElements) {

    /**
     * @method nodeGetDocumentPosition
     * @summary Returns a 0-indexed position generated for the node within the
     *     document. This position is unique within the node's document and can
     *     be used for positioning comparison purposes with other nodes.
     * @param {Node} aNode The Node to operate on.
     * @param {String} joinChar A character to use when joining the index parts.
     *     Default is '.'.
     * @param {Element} [stopAncestor] An element between aNode and aNode's
     *     document node that the position computation will 'stop' at. This
     *     parameter is optional.
     * @param {Boolean} [onlyElements=false] Whether or not to consider only
     *     Element nodes when computing the index.
     * @example Compute a document-level index for an XML node:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar>Some text<goo>More
     *         text</goo></bar>Yet more text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Compute the index for the 'goo' node
     *          TP.nodeGetDocumentPosition(
     *          TP.nodeGetElementsByTagName(xmlDoc, 'goo').first());
     *          <samp>0.0.1.0</samp>
     *     </code>
     * @example Compute a document-level index for an HTML node:
     *     <code>
     *          TP.nodeGetDocumentPosition(TP.documentGetBody(document));
     *          <samp>0.1.0</samp>
     *     </code>
     * @returns {String} The index or TP.NOT_FOUND.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var path,

        usingParent,

        node,
        index;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    path = TP.ac();

    usingParent = false;

    if (TP.isAttributeNode(aNode)) {
        node = TP.attributeGetOwnerElement(aNode);
        index = TP.nodeGetIndexInParent(node, onlyElements);
        path.push(index + '@' + TP.attributeGetLocalName(aNode));
        node = node.parentNode;
    } else if (TP.isElement(aNode)) {
        node = aNode;
    } else {
        //  A node, but not an Attribute, not an Element. Since we use a
        //  TP.isElement check below, we need to make sure to track that we're
        //  using the parent.
        node = aNode.parentNode;
        usingParent = true;
    }

    if (TP.isNode(stopAncestor) && node === stopAncestor) {
        return '';
    }

    //  Note the TP.isElement check - we don't want the Document node in here.
    while (TP.isElement(node) &&
            node !== stopAncestor &&
            (index = TP.nodeGetIndexInParent(node, onlyElements)) !==
                                                        TP.NOT_FOUND) {
        path.push(index);
        node = node.parentNode;
    }

    if (index === TP.NOT_FOUND) {
        return TP.NOT_FOUND;
    }

    //  If we were iterating on the parent (because the node was a
    //  non-Attribute, non-Element kind of node), then we need to unshift the
    //  node's index to its parent to get a complete path.
    if (usingParent) {
        index = TP.nodeGetIndexInParent(aNode, onlyElements);
        if (index !== TP.NOT_FOUND) {
            path.unshift(index);
        }
    }

    return path.reverse().join(joinChar || '.');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetResponderChain',
function(aNode, aSignal) {

    /**
     * @method nodeGetResponderChain
     * @summary Compiles a list of all the responder elements along the
     *     containment hierarchy for aNode. This method essentially iterates via
     *     nodeGetResponderElement until no more responder elements are found.
     * @param {Node} aNode The DOM node to operate on.
     * @param {TP.sig.Signal} aSignal The signal instance being dispatched.
     * @returns {Element[]} The list of responder elements found. The order of
     *     the list is from first (closest to the element) to last (furthest
     *     from element), essentially the order for event bubbling phase
     *     processing.
     */

    var arr,
        node;

    arr = TP.ac();

    node = TP.nodeGetResponderElement(aNode, aSignal);
    while (TP.isValid(node)) {
        arr.push(node);
        if (TP.notValid(node.parentNode)) {
            break;
        }
        node = TP.nodeGetResponderElement(node.parentNode, aSignal);
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetResponderElement',
function(aNode, aSignal) {

    /**
     * @method nodeGetResponderElement
     * @summary Finds the 'responder' element for aNode and returns it. A
     *     responder element is an element with either tibet:ctrl or tibet:tag
     *     or one whose type responds affirmatively to isResponderFor.
     *     NOTE that this method will also traverse up through iframe containers
     *     to locate a potential component element.
     * @param {Node} aNode The DOM node to operate on.
     * @param {TP.sig.Signal} aSignal The signal instance being dispatched.
     * @returns {Element} A valid element or null.
     */

    var node,
        win,

        attrVal,

        type,
        frame;

    if (TP.notValid(aNode)) {
        return this.raise('InvalidNode');
    }

    if (!TP.isElement(aNode)) {

        node = aNode.parentNode;
        if (TP.isValid(node)) {
            return TP.nodeGetResponderElement(node);
        }

        //  Check for a containing iframe element often used as a "screen".
        win = TP.nodeGetWindow(aNode);
        if (TP.isIFrameWindow(win)) {
            frame = win.frameElement;
            if (TP.isElement(frame)) {
                return TP.nodeGetResponderElement(frame);
            }
        }

        return;
    }

    //  Check first for a 'tibet:ctrl' attribute. This overrides all of the
    //  other logic. If we have a 'tibet:ctrl' attribute, then this element is
    //  definitely a responder element (for *some* signal). Whether or not the
    //  object that is named here via this attribute (either a type of some sort
    //  or a registered object) can actually respond to the signal is determined
    //  later by the signaling system.
    if (TP.elementHasAttribute(aNode, 'tibet:ctrl', true)) {
        return aNode;
    }

    //  Next, check to see if a 'tibet:tag' attribute is defined. If so, then it
    //  will point to a TIBET type of some sort. This mechanism allows the
    //  author to override the TIBET type that this tag would normally resolve
    //  to. Therefore, in the case of custom tags that have been 'compiled' into
    //  platform native markup (i.e. XHTML or SVG), this attribute will probably
    //  point to the custom TIBET type that the platform-native markup is
    //  standing in for.
    attrVal = TP.elementGetAttribute(aNode, 'tibet:tag', true);
    if (TP.notEmpty(attrVal)) {
        type = TP.sys.getTypeByName(attrVal);
    }

    if (!TP.isType(type)) {

        //  Native types may be responders but not have a tibet:tag or
        //  tibet:ctrl attribute so we need to query them by type.

        //  NB: Many times the node will already have it's node type, so we
        //  use a fast way to get that here.
        type = aNode[TP.NODE_TYPE];
        if (TP.notValid(type)) {
            type = TP.nodeGetConcreteType(aNode);
            aNode[TP.NODE_TYPE] = type;
        }
    }

    if (TP.canInvoke(type, 'isResponderFor')) {
        if (type.isResponderFor(aNode, aSignal)) {
            return aNode;
        }
    }

    if (TP.isValid(aNode.parentNode)) {
        return TP.nodeGetResponderElement(aNode.parentNode, aSignal);
    }

    //  Check for a containing iframe element often used as a "screen".
    win = TP.nodeGetWindow(aNode);
    if (TP.isIFrameWindow(win)) {
        frame = win.frameElement;
        if (TP.isElement(frame)) {
            return TP.nodeGetResponderElement(frame);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetIndexInParent',
function(aNode, onlyElements) {

    /**
     * @method nodeGetIndexInParent
     * @summary Returns the index of the node provided in its parentNode's
     *     childNodes array. If there is no parentNode for the node provided
     *     this method or aNode couldn't be found in the parent, this method
     *     returns TP.NOT_FOUND.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Boolean} [onlyElements=false] Whether or not to consider only
     *     Element nodes when computing the index.
     * @example Get an XML node's index in its parent:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><baz/>Hi<bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          barElem = TP.nodeGetElementsByTagName(xmlDoc, 'bar').first();
     *          <samp>[object XMLElement]</samp>
     *          TP.nodeGetIndexInParent(barElem);
     *          <samp>2</samp>
     *          TP.nodeGetIndexInParent(barElem, true);
     *          <samp>1</samp>
     *     </code>
     * @example Get an HTML node's index in its parent:
     *     <code>
     *          TP.nodeGetIndexInParent(document.documentElement);
     *          <samp>0</samp>
     *     </code>
     * @returns {Number} The index number, or TP.NOT_FOUND.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var nodeParent,
        children,
        len,
        i;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.notValid(nodeParent = aNode.parentNode)) {
        return TP.NOT_FOUND;
    }

    //  If we're excluding non-Elements, then just get the child elements,
    //  otherwise get all child nodes.
    if (TP.isTrue(onlyElements)) {
        children = TP.nodeGetChildElements(nodeParent);
    } else {
        children = TP.nodeGetChildNodes(nodeParent);
    }

    len = children.length;

    for (i = 0; i < len; i++) {
        if (children[i] === aNode) {
            return i;
        }
    }

    return TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeInsertBefore',
function(aNode, newNode, insertionPointNode, shouldAwake) {

    /**
     * @method nodeInsertBefore
     * @summary Inserts the new node into the child content of the supplied
     *     node before the supplied insertion point node and then 'awakens'
     *     (initializes) the newly added content. If insertionPointNode is null,
     *     then the new node is just appended to the child content of the
     *     supplied Node.
     * @param {Node} aNode The node to insert the child content into.
     * @param {Node} newNode The node to insert into aNode.
     * @param {Node} insertionPointNode The node to use as an insertion point.
     *     The new content will be inserted before this point.
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted. The default for this operation is false.
     * @exception TP.sig.InvalidNode
     * @returns {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     */

    var childContent,

        firstElement,

        targetNode,

        iframeDocElems,

        importedContent,

        awakenContent,
        start,
        end;

    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', aNode);
    }

    if (TP.isString(newNode)) {
        //  this will throw/raise so we don't have to
        childContent = TP.nodeFromString(newNode);
        if (!TP.isNode(newNode)) {
            return;
        }
    } else if (!TP.isNode(newNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', newNode);
    } else {
        childContent = newNode;
    }

    //  if the target is a document and not the documentElement we can't
    //  accept new content unless the document has no current document
    //  element.
    if (TP.isDocument(aNode)) {
        if (TP.isElement(aNode.documentElement)) {
            TP.raise(
            this,
            'TP.sig.InvalidOperation',
            'Cannot insertBefore #document node with an existing root.');

            return;
        } else if (TP.isNode(insertionPointNode)) {
            TP.raise(
            this,
            'TP.sig.InvalidOperation',
            'Cannot insertBefore empty #document using insertion point.');

            return;
        } else if (TP.isFragment(childContent)) {
            //  not valid, but we may have more than one inbound element so
            //  we have to check and potentially discard extras
            firstElement = TP.nodeGetFirstChildElement(childContent);
            if (TP.notValid(firstElement)) {
                TP.raise(this,
                        'TP.sig.InvalidOperation',
                        'Must supply element for #document root.');

                return;
            } else if (childContent.childNodes.length > 1) {
                TP.ifWarn() && TP.sys.cfg('log.node_discarded') ?
                    TP.warn('Discarding nodes from fragment: ' +
                                TP.str(childContent)) : 0;
            }

            //  Before we move the firstElement, if it's not detached, we stamp
            //  it with its previous position. That way, when it detaches from
            //  its current DOM, other machinery will know where it came from.
            if (!TP.nodeIsDetached(firstElement)) {
                firstElement[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(
                                                                firstElement);
            }

            return TP.nodeAppendChild(aNode, firstElement, shouldAwake);
        }
    }

    targetNode = aNode;

    //  Note that we don't check insertionPointNode here, since this method
    //  (like the native insertBefore() call) allows it to be null, in which
    //  case the new node is just appended.

    if (!targetNode.hasChildNodes() || TP.notValid(insertionPointNode)) {

        //  Before we move the childContent, if it's not detached, we stamp it
        //  with its previous position. That way, when it detaches from its
        //  current DOM, other machinery will know where it came from.
        if (!TP.nodeIsDetached(childContent)) {
            childContent[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(
                                                                childContent);
        }

        return TP.nodeAppendChild(targetNode, childContent, shouldAwake);
    }

    //  For some browsers, we need to capture the iframe content before we
    //  move the node. This includes any iframes that are descendants of the
    //  node we're moving.
    if (TP.isElement(newNode)) {
        iframeDocElems = TP.$$elementPreserveIFrameContent(newNode);
    }

    //  The logic in this method is predicated on the fact that childContent
    //  might very well be a Node.DOCUMENT_FRAGMENT_NODE and, therefore,
    //  will be inserting *multiple* children into the common parent.

    //  make sure the node we'll insert is a part of the target node's
    //  document. as of ff3 and s3 this is required to avoid exceptions
    importedContent = TP.nodeImportNode(targetNode, childContent);

    awakenContent = TP.ifInvalid(shouldAwake, false);

    if (awakenContent || TP.isFragment(importedContent)) {
        start = TP.nodeGetChildIndex(targetNode, insertionPointNode);
    }

    //  Before we move the importedContent, if it's not detached, we stamp it
    //  with its previous position. That way, when it detaches from its current
    //  DOM, other machinery will know where it came from.
    if (!TP.nodeIsDetached(importedContent)) {
        importedContent[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(
                                                            importedContent);
    }

    try {
        //  Insert the new content. This will (or should) change the number
        //  of children.
        targetNode.insertBefore(importedContent, insertionPointNode);
    } catch (e) {
        TP.ifError() ? TP.error(TP.ec(e, 'insertBefore generated error.')) : 0;

        return;
    }

    //  if newNode was a fragment, then it should now be empty to maintain
    //  semantic consistency with a standard appendChild call. If newNode
    //  was a string we don't bother to empty it.
    if (TP.isFragment(newNode)) {
        TP.nodeEmptyContent(newNode);
    }

    //  If we preserved the iframe content (see above), then we need to
    //  restore it.
    if (TP.isElement(targetNode) && TP.notEmpty(iframeDocElems)) {
        TP.$$elementRestoreIFrameContent(targetNode, iframeDocElems);
    }

    if (awakenContent) {
        //  Subtract one off of the end to avoid awakening the insertion
        //  point node itself.
        end = TP.nodeGetChildIndex(targetNode, insertionPointNode) - 1;

        TP.nodeAwakenChildNodesFromTo(targetNode, start, end);
    }

    //  If the new content was a fragment, then we need to return the final
    //  content's child node that starts at that point.
    if (TP.isFragment(importedContent)) {
        return targetNode.childNodes[start];
    }

    return importedContent;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeInsertContent',
function(aNode, anObject, aPositionOrPath, loadedFunction, shouldAwake) {

    /**
     * @method nodeInsertContent
     * @summary Inserts content from anObject into/around aNode based on the
     *     position or path given. The position or path should indicate whether
     *     the content should become the previous sibling, next sibling, first
     *     child or last child of aNode.
     * @description Element nodes can accept content and position it in a
     *     variety of ways subject to certain restrictions (such as you can't
     *     create a previous or next sibling to an element that is a
     *     documentElement). Other node types are even more restrictive and
     *     typically think in terms of simply setting their single "child" or
     *     value to the content provided. This routine will actually either
     *     prepend or append content in these cases based on whether a BEGIN or
     *     END position was provided (if a path was provided, content will
     *     always be inserted before the node the path resolved to). Note that
     *     for non-element nodes the TP.BEFORE_BEGIN and TP.AFTER_END are
     *     treated as if they were TP.AFTER_BEGIN and TP.BEFORE_END respectively
     *     and path values will not work. In other words since there's no
     *     element boundary which makes sense in those cases it's the content
     *     data which is either prepended or appended to.
     * @param {Node} aNode The node to insert content for.
     * @param {Object} anObject The object to use as the source of the content.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to anElement or a path to evaluate to get to a node at that
     *     position. This should be one of four values: TP.BEFORE_BEGIN,
     *     TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the path to evaluate.
     *     Default is TP.BEFORE_END.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted. The default for this operation is false.
     * @exception TP.sig.InvalidNode
     * @returns {Node} The first node of the content that was just inserted.
     */

    var positionOrPath,
        content,

        newNode;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                                'Must provide a valid target Node.');
    }

    positionOrPath = TP.ifEmpty(aPositionOrPath, TP.BEFORE_END);

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(anObject, 'getResource') ?
                anObject.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                anObject;
    content = TP.unwrap(content);

    switch (aNode.nodeType) {
        case Node.ELEMENT_NODE:

            if (TP.isHTMLNode(aNode)) {
                return TP.htmlElementInsertContent(aNode,
                                                    content,
                                                    positionOrPath,
                                                    loadedFunction,
                                                    shouldAwake);
            } else {
                return TP.xmlElementInsertContent(aNode,
                                                    content,
                                                    positionOrPath,
                                                    loadedFunction,
                                                    shouldAwake);
            }

        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
        case Node.PROCESSING_INSTRUCTION_NODE:
        case Node.COMMENT_NODE:

            switch (positionOrPath) {
                case TP.BEFORE_BEGIN:

                    if (TP.notValid(newNode = TP.node(content))) {
                        this.raise('TP.sig.InvalidContent');
                        return;
                    }

                    //  NB: We don't worry about awaken here because newNode
                    //  isn't an Element
                    TP.nodeInsertBefore(aNode.parentNode,
                                        newNode,
                                        aNode,
                                        false);

                    break;

                case TP.AFTER_BEGIN:

                    aNode.data = TP.str(content) + (aNode.data || '');

                    break;

                case TP.BEFORE_END:

                    aNode.data = (aNode.data || '') + TP.str(content);

                    break;

                case TP.AFTER_END:

                    if (TP.notValid(newNode = TP.node(content))) {
                        this.raise('TP.sig.InvalidContent');

                        return;
                    }

                    //  NB: We don't worry about awaken here because newNode
                    //  isn't an Element
                    if (TP.notValid(aNode.nextSibling)) {
                        //  last child? parent append should work then
                        TP.nodeAppendChild(aNode.parentNode,
                                            newNode,
                                            false);
                    } else {
                        //  not last? insertBefore next sibling then
                        TP.nodeInsertBefore(aNode.parentNode,
                                            newNode,
                                            aNode.nextSibling,
                                            false);
                    }
                    break;

                default:
                    TP.raise(this, 'TP.sig.InvalidPosition');
                    break;
            }

            break;

        case Node.DOCUMENT_NODE:

            if (TP.isHTMLNode(aNode)) {
                return TP.htmlDocumentInsertContent(aNode,
                                                    content,
                                                    positionOrPath,
                                                    loadedFunction,
                                                    shouldAwake);
            } else {
                return TP.xmlDocumentInsertContent(aNode,
                                                    content,
                                                    positionOrPath,
                                                    loadedFunction);
            }

        case Node.ATTRIBUTE_NODE:

            switch (positionOrPath) {
                case TP.BEFORE_BEGIN:

                    TP.raise(this, 'TP.sig.InvalidPosition');
                    break;

                case TP.AFTER_BEGIN:

                    aNode.value = TP.str(content) + (aNode.value || '');

                    break;

                case TP.BEFORE_END:

                    aNode.value = (aNode.value || '') + TP.str(content);

                    break;

                case TP.AFTER_END:

                    TP.raise(this, 'TP.sig.InvalidPosition');
                    break;

                default:
                    TP.raise(this, 'TP.sig.InvalidPosition');
                    break;
            }

            break;

        case Node.DOCUMENT_FRAGMENT_NODE:

            //  We can do the same insertion logic here that we use for
            //  Node.ELEMENT_NODE

            if (TP.isHTMLNode(aNode)) {
                return TP.htmlElementInsertContent(aNode,
                                                    content,
                                                    positionOrPath,
                                                    loadedFunction,
                                                    shouldAwake);
            } else {
                return TP.xmlElementInsertContent(aNode,
                                                    content,
                                                    positionOrPath,
                                                    loadedFunction,
                                                    shouldAwake);
            }

        case Node.ENTITY_REFERENCE_NODE:
        case Node.ENTITY_NODE:
        case Node.DOCUMENT_TYPE_NODE:
        case Node.NOTATION_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation');
            break;

        default:
            break;
    }

    return aNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeIsDetached',
function(aNode, aRootNode) {

    /**
     * @method nodeIsDetached
     * @summary Returns true if the node's parent chain does not terminate at
     *     the root node provided, or at a Document node when no specific root
     *     is given. The root node can be either an element node or a document
     *     node.
     * @param {Node} aNode The node to test.
     * @param {Node} aRootNode An optional node the tested node must reside in,
     *     hence a Document or Element (Collection) node.
     * @example Create an XML document and test the first child of its document
     *     element to see if it has been detached:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          docFirstChild = xmlDoc.documentElement.firstChild;
     *          TP.nodeIsDetached(docFirstChild);
     *          <samp>false</samp>
     *          // Detach it and test again
     *          TP.nodeDetach(docFirstChild);
     *          TP.nodeIsDetached(docFirstChild);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} True if the node isn't in a document.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var ancestor;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  attribute nodes are never detached
    if (TP.isAttributeNode(aNode)) {
        return false;
    }

    //  the node could be the root itself, in which case we're not
    //  considered detachable :)
    if (aNode === aRootNode) {
        return false;
    }

    //  document-level checks are faster then full traversals when they
    //  apply
    if (TP.isDocument(aRootNode)) {
        if (TP.isDocument(aNode)) {
            //  detached if the two documents aren't the same document
            return aNode !== aRootNode;
        } else if (TP.nodeGetDocument(aNode) !== aRootNode) {
            return true;
        }
    }

    if (TP.isNode(aRootNode)) {
        return !TP.nodeContainsNode(aRootNode, aNode);
    }

    if (TP.isDocument(aNode)) {
        return false;
    }

    //  looks like we need to verify the node is in a viable ancestor chain
    //  which terminates at a document element
    ancestor = aNode;
    while (ancestor && (ancestor = ancestor.parentNode)) {
        if (TP.isDocument(ancestor)) {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeNormalize',
function(aNode) {

    /**
     * @method nodeNormalize
     * @summary Normalizes adjacent Text nodes on the supplied Node and its
     *     descendants.
     * @param {Node} aNode The node to normalize.
     * @returns {Node} The node.
     * @exception TP.sig.InvalidNode Raised when the node is an invalid node.
     */

    var normalizeFunc;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  IE11 has a bug when normalizing nodes with dashes ('-') in them
    //  https://connect.microsoft.com/IE/feedback/details/832750
    if (TP.sys.isUA('IE') && aNode.textContent.indexOf('-') !== TP.NOT_FOUND) {
        normalizeFunc = function(node) {
            if (!node) {
                return;
            }
            if (node.nodeType === Node.TEXT_NODE) {
                while (node.nextSibling &&
                        node.nextSibling.nodeType === Node.TEXT_NODE) {
                    node.nodeValue += node.nextSibling.nodeValue;
                    node.parentNode.removeChild(node.nextSibling);
                }
            } else {
                normalizeFunc(node.firstChild);
            }
            normalizeFunc(node.nextSibling);
        };

        normalizeFunc(aNode);
    } else {
        aNode.normalize();
    }

    return aNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeRefreshDescendantDocumentPositions',
function(aNode) {

    /**
     * @method nodeRefreshDescendantDocumentPositions
     * @summary Refreshes the document positions for all of the descendant nodes
     *     of the supplied node.
     * @description This method refreshes the 0-indexed document position for
     *     each descendant node.
     * @param {Node} aNode The DOM node to operate on.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var allDescendantNodes;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  Grab all of the descendants (all descendants - not just Elements) and
    //  iterate, updating the document position.
    allDescendantNodes = TP.nodeGetDescendants(aNode);

    allDescendantNodes.forEach(
        function(descendantNode) {
            descendantNode[TP.PREVIOUS_POSITION] =
                TP.nodeGetDocumentPosition(descendantNode);
        });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeReplaceChild',
function(aNode, newNode, oldNode, shouldAwake) {

    /**
     * @method nodeReplaceChild
     * @summary Replaces the old node in the supplied node with the newNode and
     *     then 'awakens' (initializes) the newly added content.
     * @param {Node} aNode The node to replace the child node in.
     * @param {Node} newNode The node to replace the old node with.
     * @param {Node} oldNode The node to be replaced with newNode.
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just replaced. The default for this operation is false.
     * @exception TP.sig.InvalidNode
     * @returns {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     */

    var childContent,

        firstElement,

        targetNode,

        iframeDocElems,

        importedContent,

        awakenContent,

        start,
        end;

    if (!TP.isNode(aNode) || !TP.isNode(oldNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.isString(newNode)) {
        //  this will throw/raise so we don't have to
        childContent = TP.nodeFromString(newNode);
        if (!TP.isNode(newNode)) {
            return;
        }
    } else if (!TP.isNode(newNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', newNode);
    } else {
        childContent = newNode;
    }

    //  if the target is a document and not the documentElement we can't
    //  accept new content unless the oldNode is the documentElement
    if (TP.isDocument(aNode)) {
        if (TP.notValid(aNode.documentElement)) {
            TP.raise(this,
                        'TP.sig.InvalidOperation',
                        'Cannot replaceChild with empty #document node.');

            return;
        } else if (oldNode !== aNode.documentElement) {
            TP.raise(this,
                        'TP.sig.InvalidOperation',
                        'Cannot replaceChild other than #document node' +
                            ' root.');

            return;
        } else if (TP.isFragment(childContent)) {
            //  not valid, but we may have more than one inbound element so
            //  we have to check and potentially discard extras
            firstElement = TP.nodeGetFirstChildElement(childContent);
            if (TP.notValid(firstElement)) {
                TP.raise(this,
                            'TP.sig.InvalidOperation',
                            'Must supply element for #document root.');

                return;
            } else if (childContent.childNodes.length > 1) {
                TP.ifWarn() && TP.sys.cfg('log.node_discarded') ?
                    TP.warn('Discarding nodes from fragment: ' +
                                TP.str(childContent)) : 0;
            }

            childContent = firstElement;
        }
    }

    targetNode = aNode;

    //  For some browsers, we need to capture the iframe content before we
    //  move the node. This includes any iframes that are descendants of the
    //  node we're moving.
    if (TP.isElement(newNode)) {
        iframeDocElems = TP.$$elementPreserveIFrameContent(newNode);
    }

    //  The logic in this method is predicated on the fact that childContent
    //  might very well be a Node.DOCUMENT_FRAGMENT_NODE and, therefore,
    //  will be inserting *multiple* children into the common parent.

    //  make sure the node we'll insert is a part of the target node's
    //  document. as of ff3 and s3 this is required to avoid exceptions
    importedContent = TP.nodeImportNode(targetNode, childContent);

    //  We awaken if the content is an HTML node, otherwise we don't.
    awakenContent = TP.ifInvalid(shouldAwake, false);

    //  If we're awakening, or the new content is a fragment, then we need
    //  to capture the starting point.
    if (awakenContent || TP.isFragment(childContent)) {
        start = TP.nodeGetChildIndex(targetNode, oldNode);
    }

    //  Before we move the oldNode, if it's not detached, we stamp it with
    //  its previous position. That way, when it detaches from its current DOM,
    //  other machinery will know where it came from.
    if (!TP.nodeIsDetached(oldNode)) {
        oldNode[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(oldNode);
    }

    try {
        //  Replace the new content in. This will (or should) change the
        //  number of children.
        targetNode.replaceChild(importedContent, oldNode);
    } catch (e) {
        TP.ifError() ? TP.error(TP.ec(e, 'replaceChild generated error.')) : 0;
        return;
    }

    //  Copy any TIBET expandos to the imported node.
    TP.nodeCopyTIBETExpandos(oldNode, importedContent, false);

    //  if newNode was a fragment, then it should now be empty to maintain
    //  semantic consistency with a standard appendChild call. If newNode
    //  was a string we don't bother to empty it.
    if (TP.isFragment(newNode)) {
        TP.nodeEmptyContent(newNode);
    }

    //  If we preserved the iframe content (see above), then we need to
    //  restore it.
    if (TP.isElement(targetNode) && TP.notEmpty(iframeDocElems)) {
        TP.$$elementRestoreIFrameContent(targetNode, iframeDocElems);
    }

    if (awakenContent) {
        //  If we're inserting a Node that has childNodes (probably a
        //  Node.DOCUMENT_FRAGMENT), then the end is equal to the start plus
        //  the number of new nodes minus 1.
        if (TP.isValid(childContent.childNodes)) {
            end = start + (childContent.childNodes.length - 1);
        } else {
            //  Otherwise, we just inserted one Node.
            end = start + 1;
        }

        TP.nodeAwakenChildNodesFromTo(targetNode, start, end);
    }

    //  If the new content was a fragment, then we need to return the final
    //  content's child node that starts at that point.
    if (TP.isFragment(importedContent)) {
        return targetNode.childNodes[start];
    }

    return importedContent;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeRemoveChild',
function(aNode, oldNode) {

    /**
     * @method nodeRemoveChild
     * @summary Removes the oldNode in supplied node.
     * @param {Node} aNode The node to remove the child node from.
     * @param {Node} oldNode The node to remove from aNode.
     * @exception TP.sig.InvalidNode
     * @returns {Node} The old node.
     */

    if (!TP.isNode(aNode) || !TP.isNode(oldNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  Capture the position old node in the document and store it as the
    //  'previous position'
    oldNode[TP.PREVIOUS_POSITION] = TP.nodeGetDocumentPosition(oldNode);

    return aNode.removeChild(oldNode);
});

//  ------------------------------------------------------------------------
//  NODE CREATION
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeFromString',
function(aString, defaultNS, shouldReport) {

    /**
     * @method nodeFromString
     * @summary Parses aString and returns the XML node representing the
     *     string's DOM representation. If the string is empty an empty text
     *     node is returned, when an element is produced that element is
     *     returned. CDATA and other node types are also possible output from
     *     this routine.
     * @param {String} aString The source string to be parsed. Note that this
     *     String *must* be XML compliant.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @example Create a node from an XML String:
     *     <code>
     *          xmlElem = TP.nodeFromString(
     *          '<foo><bar><baz/></bar></foo>');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Create a node from a malformed XML String (note the flag to show
     *     the parser errors):
     *     <code>
     *          xmlElem = TP.nodeFromString(
     *          '<foo<bar><baz/></bar></foo>', null, true);
     *          <samp>(Parser error output)</samp>
     *     </code>
     * @returns {Node} The Node parsed from the supplied String.
     */

    var attrParts,

        newNode,
        content,

        piTarget,
        piData,

        doc,
        str;

    //  if it is an 'attribute expression' (i.e. 'foo="bar"'), we can create
    //  an attribute Node from it :-).
    if (TP.regex.XML_ATTR.test(aString)) {
        attrParts = TP.regex.XML_ATTR.match(aString);
        newNode = TP.XML_FACTORY_DOCUMENT.createAttribute(attrParts.at(1));

        //  Note that the value matched in the RegExp above contains the quotes
        //  for the most robust matching. We need to slice them off here.
        newNode.value = attrParts.at(4).slice(1, -1);

        return newNode;
    }

    //  if it is a 'comment expression' (i.e. '<!--foo-->'), we can create
    //  a Comment Node from it :-).
    if (TP.regex.XML_COMMENT_WHOLE.test(aString)) {
        content = TP.regex.XML_COMMENT_WHOLE.exec(aString)[1];

        newNode = TP.XML_FACTORY_DOCUMENT.createComment(content);

        return newNode;
    }

    //  if it is an 'CDATA expression' (i.e. '<![CDATA[foo]]>'), we can create
    //  a CDATA Node from it :-).
    if (TP.regex.XML_CDATA_WHOLE.test(aString)) {
        content = TP.regex.XML_CDATA_WHOLE.exec(aString)[1];

        newNode = TP.XML_FACTORY_DOCUMENT.createCDATASection(content);

        return newNode;
    }

    //  if it is a 'Processing Instruction' (i.e. '<?foo bar?>'), we can create
    //  a Processing Instruction Node from it :-).
    if (TP.regex.XML_PI_WHOLE.test(aString)) {
        content = TP.regex.XML_PI_WHOLE.exec(aString)[1];

        //  Now, split the 'target' and the 'data'
        piTarget = content.slice(0, content.indexOf(' '));
        piData = content.slice(content.indexOf(' ') + 1);

        newNode = TP.XML_FACTORY_DOCUMENT.createProcessingInstruction(
                        piTarget, piData);

        return newNode;
    }

    //  string without valid markup?...text node
    if (TP.isEmpty(aString) ||
        !aString.trim().startsWith('<') ||
        aString.length < '<a/>'.length) {
        //  make sure we provide '' or this call will fail
        return TP.XML_FACTORY_DOCUMENT.createTextNode(aString || '');
    }

    //  by wrapping in a root element we ensure we can create something,
    //  which we'll then unwrap and hand back in the best form possible, but
    //  we have to watch out for any XML declaration that might start things
    //  off
    str = aString.trim();
    str = str.strip(TP.regex.XML_PREFIX);
    str = str.trim();

    //  wrap the element content (skipping comments, PIs, etc).
    str = str.replace(TP.regex.ALL_ELEM_MARKUP, '<wrap>$&</wrap>');

    //  should be able to get a document built from the string
    doc = TP.documentFromString(str, defaultNS, shouldReport);

    if (TP.isDocument(doc)) {
        //  extract the content from our wrapper div...
        if (doc.documentElement.childNodes.length > 1) {
            //  pass document to keep import from being required to move
            //  the nodes into the fragment
            return TP.nodeListAsFragment(
                    doc.documentElement.childNodes);
        } else {
            return doc.documentElement.firstChild;
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  NODE "QUERIES"
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEvaluateBarename',
function(aNode, aPath, autoCollapse, createAttr) {

    /**
     * @method nodeEvaluateBarename
     * @summary Traverses a barename and returns the node corresponding to the
     *     bare name.
     * @description The XPointer standard includes a very simple scheme, the
     *     barename scheme, which operates much like HTML anchors, except on
     *     IDs. This would take the form of 'http://www.foo.com#barElem'. TIBET
     *     supports this, but extends it so that an attribute of that element
     *     can be obtained. Therefore, in TIBET, the following syntax can also
     *     be used: 'http://www.foo.com#barElem@bazAttr'. Lastly, this syntax
     *     can be used to retrieve all attribute nodes of an Element:
     *     'http://www.foo.com#bar@*'.
     * @param {Node} aNode The 'context node' for the evaluation.
     * @param {String} aPath A valid element scheme path.
     * @param {Boolean} autoCollapse Whether to collapse Array results if
     *     there's only one item in them. The default is false.
     * @param {Boolean} createAttr Whether or not we should create Attribute
     *     nodes if the barename uses 'TIBET extended syntax' and references an
     *     attribute, but that attribute doesn't exist.
     * @returns {Element|Attribute|Node[]} The element or attribute(s) obtained
     *     by evaluating the supplied path.
     * @exception TP.sig.InvalidPath Raised when an invalid barename is provided
     *     to the method.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var barename,

        id,
        attrName,

        elem,

        result;

    //  NOTE that there's no testing of parameters here; we assume an entry
    //  point of nodeEvaluatePath() and rely on it to have tested them.

    if (!TP.regex.BARENAME.test(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidPath');
    }

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  make sure we have a real path
    if (TP.isEmpty(barename = aPath.slice(1))) {
        return null;
    }

    result = null;

    //  We're asking for 'all' of the attributes
    if (/@\*/.test(barename)) {
        id = barename.slice(0, barename.indexOf('@'));

        if (TP.isElement(elem = TP.nodeGetElementById(aNode, id))) {
            result = TP.elementGetAttributeNodes(elem);
        }
    } else if (/@/.test(barename)) {
        //  We're asking for a specific attribute
        id = barename.slice(0, barename.indexOf('@'));
        attrName = barename.slice(barename.indexOf('@') + 1);

        if (TP.isElement(elem = TP.nodeGetElementById(aNode, id))) {
            result = elem.getAttributeNode(attrName);

            //  If we couldn't find an Attribute node, but we are configured to
            //  create Attribute nodes, then go ahead and create it and refetch
            //  the Attribute node.
            if (!TP.isAttributeNode(result) && TP.isTrue(createAttr)) {
                TP.elementSetAttribute(elem, attrName, '', true);
                result = elem.getAttributeNode(attrName);
            }
        }
    } else {
        //  No attributes - just the element with that id
        result = TP.nodeGetElementById(aNode, barename);
    }

    //  No results? Return an empty Array for consistency in return values.
    if (TP.notValid(result) && TP.notTrue(autoCollapse)) {
        return TP.ac();
    }

    if (TP.isArray(result) && TP.isTrue(autoCollapse)) {
        if (result.getSize() === 1) {
            return result.first();
        } else if (TP.isEmpty(result)) {
            return null;
        }
    }

    if (!TP.isArray(result) && TP.notTrue(autoCollapse)) {
        result = TP.ac(result);
    }

    return result;
});

//  ------------------------------------------------------------------------

//  TP.nodeEvaluateCSS is in TIBETCSSQuery

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEvaluateElementScheme',
function(aNode, aPath) {

    /**
     * @method nodeEvaluateElementScheme
     * @summary Traverses an element scheme path, returning the targeted
     *     element if one exists.
     * @description The XPointer standard includes several schemes, one of which
     *     is the element() scheme. In this scheme the fragment part of the URI
     *     is #element(path) where path is a forward-slash separated list of
     *     steps. The first step can be either a 1, signifying the root node of
     *     the document, or an ID. All other steps are child node indexes where,
     *     for compatibility with XPath, the first child's index is 1. The body
     *     element of an HTML document is therefore #element(/1/2) while the
     *     first child element of an element with ID 'foo' would be
     *     #element(foo/1). Note that you don't quote the ID; any non-numeric
     *     value in the first character will force ID semantics on the first
     *     segment.
     * @param {Node} aNode The 'context node' for the evaluation.
     * @param {String} aPath A valid element scheme path.
     * @returns {Element} The element obtained by evaluating the supplied path.
     * @exception TP.sig.InvalidPath Raised when an invalid element scheme is
     *     provided to the method.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var path,
        arr,

        rootID,

        startIndex,
        node,
        doc,

        children,

        len,
        i,
        index;

    //  NOTE that there's no testing of parameters here; we assume an entry
    //  point of nodeEvaluatePath() and rely on it to have tested them.

    if (TP.regex.ELEMENT_POINTER.test(aPath)) {
        path = TP.regex.ELEMENT_POINTER.match(aPath).at(1);
    } else if (/^\/1/.test(aPath)) {
        path = aPath;
    } else {
        return TP.raise(this, 'TP.sig.InvalidPath');
    }

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  paths could be one of two forms:
    //      /1/n/n/n/... in this case, we split and throw away the chunk in
    //      front of the first /, it's not needed
    //  OR:
    //      id/n/n/n/... in this case, we just split

    if (path.startsWith('/')) {
        arr = path.split('/');
        arr.shift();
    } else {
        arr = path.split('/');
    }

    //  acquire the root
    rootID = arr.at(0);

    //  if its a Number, use that as the placeholder for the #document node.
    if (TP.isNumber(parseInt(rootID, 10))) {
        //  must be a 1 to be valid
        if (parseInt(rootID, 10) !== 1) {
            return TP.raise(this, 'TP.sig.InvalidPath',
                        'element() scheme root must have index of 1');
        }

        node = TP.nodeGetDocument(aNode);
        startIndex = 0;

        if (!TP.isNode(node)) {
            //  already will have thrown TP.sig.DetachedNodeException
            return null;
        }
    } else {
        //  must be an ID we can find in the node's document
        doc = TP.nodeGetDocument(aNode);
        if (!TP.isDocument(doc)) {
            return TP.raise(this,
                            'TP.sig.DetachedNodeException');
        }

        node = TP.nodeGetElementById(doc, rootID);
        startIndex = 1;

        if (!TP.isNode(node)) {
            //  not an exception, just not found
            return null;
        }
    }

    //  with the root in place we can start working through remainder of the
    //  list, starting at startIndex to possibly skip the root ID
    len = arr.getSize();
    for (i = startIndex; i < len; i++) {
        index = parseInt(arr.at(i), 10);
        if (!TP.isNumber(index)) {
            return TP.raise(this,
                            'TP.sig.InvalidPath',
                            'element() scheme segments must be integers.');
        }

        //  Note here that we're only going after child *Elements* -- that's
        //  what this schema is about.
        children = TP.nodeGetChildElements(node);

        node = children.at(index - 1);
        if (!TP.isNode(node)) {
            return null;
        }
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEvaluatePath',
function(aNode, aPath, aPathType, autoCollapse, retryWithDocument) {

    /**
     * @method nodeEvaluatePath
     * @summary Evaluates the path provided, parsing for common path syntax.
     *     There are several path types which might be used, but the most
     *     typical are XPaths, XPointers (which include xpointer(), xpath1()
     *     and element() schemes), and CSS queries. The latter are rare since
     *     the focus here is largely on "paths" and CSS selectors don't strictly
     *     define a path.
     * @param {Node} aNode The document or element to query.
     * @param {String} aPath The path to traverse in locating a value.
     * @param {String} aPathType One of the 'path type' constants:
     *     TP.XPATH_PATH_TYPE
     *     TP.XPOINTER_PATH_TYPE
     *     TP.ELEMENT_PATH_TYPE
     *     TP.XTENSION_POINTER_PATH_TYPE
     *     TP.CSS_PATH_TYPE
     *     TP.BARENAME_PATH_TYPE
     * @param {Boolean} autoCollapse Whether to collapse Array results if
     *     there's only one item in them. The default is false.
     * @param {Boolean} retryWithDocument Whether or not we should retry with
     *     the supplied node's document node, if we got back no results. For
     *     now, due to the nature of the various types of paths, this only
     *     applies for the TP.CSS_PATH_TYPE path.
     * @returns {Object} The value of evaluating the path.
     * @exception TP.sig.InvalidPath Raised when an invalid path is provided to
     *      the method.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var path,
        result,

        thePathType;

    if (TP.notValid(aNode)) {
        TP.raise(this, 'TP.sig.InvalidNode',
                    'Node does not have path interface.');

        return;
    }

    //  no query, no result
    if (TP.isEmpty(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidPath');
    }

    //  If the path is just '.', then that's the shortcut to just return the
    //  target node itself.
    if (TP.regex.ONLY_PERIOD.test(aPath)) {
        return aNode;
    }

    //  common path in repeats etc. where performance is important is an
    //  attribute path so we can optimize for those (but not for '@*' paths
    //  where the caller wants all attributes).
    if (TP.regex.ATTRIBUTE.test(aPath) &&
        !TP.regex.ATTRIBUTE_ALL.test(aPath)) {
        path = aPath.slice(1);

        //  don't return '' here, return null if we can't find a real value
        result = TP.elementGetAttribute(aNode, path);

        return TP.isEmpty(result) ? null : result;
    }

    //  If the path type wasn't supplied, compute it.
    thePathType = aPathType;
    if (TP.notValid(thePathType)) {
        thePathType = TP.getAccessPathType(aPath);
    }

    switch (thePathType) {
        case TP.XPATH_PATH_TYPE:

            //  because nodeEvaluateXPath() has its own logic around result
            //  reduction, we need to do this here by always capturing a
            //  full nodeset and then returning the node if the result set
            //  has only one node and the caller wants auto collapse.
            result = TP.nodeEvaluateXPath(aNode, aPath, TP.NODESET);

            //  If autoCollapse was turned on, we need to either return the
            //  first result (if there is only one) or null if the result is
            //  empty
            if (TP.isTrue(autoCollapse)) {
                if (result.getSize() === 1) {
                    return result.at(0);
                } else if (TP.isEmpty(result)) {
                    return null;
                }
            }

            return result;

        case TP.XPOINTER_PATH_TYPE:
        case TP.ELEMENT_PATH_TYPE:

            //  #xpointer(...), #xpath1(...) or #element(...) schemes
            return TP.nodeEvaluateXPointer(aNode, aPath, autoCollapse);

        case TP.XTENSION_POINTER_PATH_TYPE:

            //  Other 'extended' schemes
            return TP.nodeEvaluateXTension(aNode, aPath, autoCollapse);

        case TP.CSS_PATH_TYPE:

            result = TP.nodeEvaluateCSS(aNode, aPath, autoCollapse);

            if (TP.notTrue(retryWithDocument)) {
                return result;
            }

            //  We're gonna retry with the node's document node as the
            //  context node. Note how we check for either 'not valid' or
            //  'is empty', because we may be autocollapsing or not.

            /* eslint-disable no-extra-parens */
            if (TP.notValid(result) ||
                (TP.isArray(result) && TP.isEmpty(result))) {
                return TP.nodeEvaluateCSS(TP.nodeGetDocument(aNode),
                                            aPath,
                                            autoCollapse);
            }
            /* eslint-enable no-extra-parens */

            return result;

        case TP.BARENAME_PATH_TYPE:

            return TP.nodeEvaluateBarename(
                            TP.nodeGetDocument(aNode), aPath, autoCollapse);

        default:

            return null;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEvaluateXPath',
function(aNode, anXPath, resultType, logErrors) {

    /**
     * @method nodeEvaluateXPath
     * @summary Returns the result of evaluating the XPath expression against
     *     the node given.
     * @param {Node} aNode The context node to begin querying for Nodes from.
     * @param {String} anXPath The XPath expression to use to query the tree
     *     starting from aNode.
     * @param {Number} resultType The type of result desired, either
     *     TP.NODESET or TP.FIRST_NODE.
     * @param {Boolean} logErrors Used to turn off error notification,
     *     particularly during operations such as string localization which
     *     can cause recusion issues.
     * @example Use XPath to select a set of nodes from a mixed namespace
     *     document:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo
     *         xmlns="http://www.foo.com"><baz:bar
     *
     *         xmlns:baz="http://www.baz.com"><baz:moo/><goo/></baz:bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeEvaluateXPath(xmlDoc, '//*');
     *          <samp>[object Element], [object Element], [object Element],
     *         [object Element]</samp>
     *          Select the 'foo' node (note that XPath 1.0 doesn't
     *          'do' default namespaces, so we have to do this another
     *          way):
     *          TP.nodeEvaluateXPath(xmlDoc, '//*[name() = "foo"]',
     *         TP.FIRST_NODE);
     *          <samp>[object Element]</samp>
     *
     * @example Use XPath to evaluate an expression that returns a scalar
     *     result (IE doesn't do this natively, but TIBET works around that
     *     limitation):
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeEvaluateXPath(xmlDoc, '1 + 2');
     *          <samp>3</samp>
     *     </code>
     * @example Use XPath to select a node that has a particular id using the
     *     'id()' function. Normally, this won't work unless the document has
     *     a DTD that specifies that that element should have an ID. TIBET
     *     makes it work when 'true' is passed for the 'rewriteIDs' parameter:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo id="fooElem"><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeEvaluateXPath(xmlDoc, 'id("fooElem")');
     *          <samp></samp>
     *          TP.nodeEvaluateXPath(xmlDoc, 'id("fooElem")', null, null,
     *         true);
     *          <samp></samp>
     *     </code>
     * @returns {Node[]|Node} The XPath execution result.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidString Raised when a null or empty XPath
     *     expression is provided to the method.
     */

    var log,

        theXPath,

        doc,

        result,

        nodePath,

        resultArr,
        firstItem,
        node,

        i,

        msg;

    //  According to the DOM Level 3 XPath specification, aNode can only be
    //  one of:
    //      Document, Element, Attribute, Text, CDATASection, Comment,
    //      ProcessingInstruction, or XPathNamespace node
    //  Therefore, no DocumentFragments

    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  NB: We can't use TP.isString() here, due to load ordering issues
    //  on startup.
    if (TP.isEmpty(anXPath)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    //  if we need it we can really turn on the XPath logging here
    TP.ifTrace() && TP.sys.hasLoaded() && TP.sys.shouldLogXPaths() ?
        TP.trace('Querying via XPath ' + anXPath,
                    TP.QUERY_LOG) : 0;

    log = TP.ifInvalid(logErrors, true);

    //  Allow the shortcut convenience that TIBET provides of specifying the
    //  '$def:' prefix (intentionally illegal because it leads with a '$') for
    //  elements that are in the default namespace.
    TP.regex.XPATH_DEFAULTNS.lastIndex = 0;
    theXPath = anXPath.replace(TP.regex.XPATH_DEFAULTNS,
                                '*[name()="$1"]');

    try {
        doc = TP.nodeGetDocument(aNode);

        //  IE11 currently does not have built-in XPath support, so we wire in
        //  both the Wicked Good XPath processor *and* the jquery-xpath engine
        //  here. We use both because Wicked Good XPath is very fast, but has
        //  bugs (esp. around namespaces - namespaced attributes, to be
        //  specific).

        //  Note that wgxpath has already been installed by the boot system onto
        //  the code frame (if a built-in XPath processor wasn't available,
        //  according to how wgxpath works). This gives us globals, such as
        //  'XPathResult', that are required for processing.
        //  Now, in this context, 'doc' very well might not be the top-level
        //  window/document (very doubtful, in fact), so we need to install an
        //  'evaluate' on 'doc' that will leverage both processors.

        if (TP.notValid(doc.evaluate)) {

            //  Install Wicked Good XPath (wgxpath) on the document. Note that
            //  it expects a Window(!) that will have a 'document' slot, but
            //  thankfully its good enough to hand it a POJO with a 'document'
            //  slot.
            TP.extern.wgxpath.install({
                document: doc
            });

            //  Grab the 'evaluate' function that wgxpath installed and alias it
            //  to '$evaluate'.
            doc.$evaluate = doc.evaluate;

            //  Overwrite the 'evaluate' function with a custom version that
            //  will call upon the jquery-xpath engine when necessary (see
            //  below).
            doc.evaluate =
                function(expression, contextNode, resolver, type, theResult) {

                    var emulatedResult;

                    //  Most of this function is to work around wgxpath bugs.

                    //  If the expression has a 'namespace-uri()' or 'number()'
                    //  call in it somewhere, then we can't trust wgxpath to
                    //  return the proper results. Invoke the jQuery XPath
                    //  processor.
                    if (/(namespace-uri\(|number\()/.test(expression)) {
                        emulatedResult = TP.extern.jxpath(
                                    contextNode, expression, resolver);
                    } else {

                        //  Execute the wgxpath engine
                        emulatedResult = this.$evaluate(
                            expression, contextNode, resolver, type, theResult);

                        //  If the result was supposed to be a node 'snapshot'
                        //  (according to XPathResult rules), but has a
                        //  'snapshotLength' of 0 (i.e. it is empty), then we
                        //  try again with the jQuery XPath processor - again to
                        //  work around wgxpath bugs.
                        if (TP.owns(emulatedResult, 'snapshotLength') &&
                            emulatedResult.snapshotLength === 0) {

                            emulatedResult = TP.extern.jxpath(
                                        contextNode, expression, resolver);
                        }
                    }

                    return emulatedResult;
                };
        }

        //  Run the XPath, using the XPathResult.ANY_TYPE so that we either
        //  get a scalar value or an iterable set of Nodes.
        result = doc.evaluate(
                        theXPath,
                        aNode,
                        TP.$$xpathResolverFunction,
                        XPathResult.ANY_TYPE,
                        null);

        //  If the result has a 'jquery' slot on it, then it's a jQuery result
        //  object that will have its results packaged according to jQuery
        //  rules, because these results were returned from the jQuery XPath
        //  processor.
        if (TP.isValid(result.jquery)) {

            //  Extract the jQuery results into a regular Array
            resultArr = TP.extern.jQuery.makeArray(result);

            //  Grab the first item from the Array. If it's a Number, String or
            //  Boolean, then the XPath didn't result in a Node or Nodes, but in
            //  a primitive value, so return it.
            firstItem = resultArr.first();
            if (TP.isNumber(firstItem) ||
                TP.isString(firstItem) ||
                TP.isBoolean(firstItem)) {

                return firstItem;
            }

            //  If what we got back was a NaN here, then we see if the path we
            //  were trying to run was trying to convert into a scalar (number()
            //  value). If so, then we strip off the conversion, run it again
            //  and return the 'first result' in the iteration. This allows us
            //  to have an 'empty Text node' that resolves to a null, rather
            //  than a NaN - important in cases where we're trying to determine
            //  whether we have a real value or not.
            if (TP.isNaN(firstItem)) {
                if (TP.regex.XPATH_HAS_SCALAR_CONVERSION.test(
                                                        theXPath)) {
                    nodePath =
                        TP.regex.XPATH_HAS_SCALAR_CONVERSION.match(
                                                        theXPath).at(1);
                    result = doc.evaluate(
                                    nodePath,
                                    aNode,
                                    TP.$$xpathResolverFunction,
                                    XPathResult.ANY_TYPE,
                                    null);

                    //  Extract the jQuery results into a regular Array
                    resultArr = TP.extern.jQuery.makeArray(result);

                    //  This should return a Text node (but may also return
                    //  null due to a bug in wgxpath).
                    result = resultArr.first();

                    //  If it's either null or an empty Text node, then return
                    //  null
                    if (TP.isNull(result)) {
                        return null;
                    }
                    if (TP.isTextNode(result) &&
                        TP.isEmpty(result.nodeValue)) {
                        return null;
                    }

                    //  Otherwise, return the original NaN
                    return NaN;
                }
            }

            //  If the caller wanted a nodeset, just return the Array.
            if (resultType === TP.NODESET) {
                return resultArr;
            } else if (resultType === TP.FIRST_NODE) {
                //  If the caller just wanted the first node, grab the first
                //  node from the Array and return it.
                if (TP.isNode(node = firstItem)) {
                    return node;
                }
            } else {
                //  If an explicit result type wasn't specified, then
                //  we use the 'only node rule' - which is that if the
                //  result set only contains one node, we return that.
                //  Otherwise, we return the Array.
                if (resultArr.getSize() === 1) {
                    return firstItem;
                }

                return resultArr;
            }

            //  return value default depends on request type
            if (resultType === TP.NODESET) {
                return TP.ac();
            } else {
                return null;
            }
        }

        //  If we got a value result, switch on the result type to get the
        //  primitive value. If its not one of the primitive values, then its
        //  a iterable node set, so we either iterate and repackage it into an
        //  Array or just iterate once and return the first node, depending on
        //  what our desired result type is.
        if (TP.isValid(result)) {
            switch (result.resultType) {
                case XPathResult.NUMBER_TYPE:

                    //  If what we got back was a NaN here, then we see if the
                    //  path we were trying to run was trying to convert into a
                    //  scalar (number() value). If so, then we strip off the
                    //  conversion, run it again and return the 'first result'
                    //  in the iteration. This allows us to have an 'empty Text
                    //  node' that resolves to a null, rather than a NaN -
                    //  important in cases where we're trying to determine
                    //  whether we have a real value or not.
                    if (TP.isNaN(result.numberValue)) {
                        if (TP.regex.XPATH_HAS_SCALAR_CONVERSION.test(
                                                                theXPath)) {
                            nodePath =
                                TP.regex.XPATH_HAS_SCALAR_CONVERSION.match(
                                                                theXPath).at(1);
                            result = doc.evaluate(
                                            nodePath,
                                            aNode,
                                            TP.$$xpathResolverFunction,
                                            XPathResult.ANY_TYPE,
                                            null);

                            //  This should return a Text node
                            result = result.iterateNext();

                            //  If the Text node is empty, return null
                            if (TP.isTextNode(result) &&
                                TP.isEmpty(result.nodeValue)) {
                                return null;
                            }

                            //  Otherwise, return the original NaN
                            return NaN;
                        }
                    } else {
                        return result.numberValue;
                    }

                    break;
                case XPathResult.BOOLEAN_TYPE:

                    return result.booleanValue;

                case XPathResult.STRING_TYPE:

                    return result.stringValue;

                default:

                    //  If the caller wanted a nodeset, make sure to return an
                    //  Array, even if its empty.
                    if (resultType === TP.NODESET) {
                        resultArr = TP.ac();

                        //  Repackage from the XPathResult into an Array.
                        while (TP.isNode(node = result.iterateNext())) {
                            resultArr.push(node);
                        }

                        return resultArr;
                    } else if (resultType === TP.FIRST_NODE) {

                        //  If the caller just wanted the first node, grab the
                        //  first node from the XPathResult and return it.
                        if (TP.isNode(node = result.iterateNext())) {
                            return node;
                        }
                    } else {
                        //  If an explicit result type wasn't specified, then
                        //  we use the 'only node rule' - which is that if the
                        //  result set only contains one node, we return that.
                        //  Otherwise, we return the Array.
                        resultArr = TP.ac();

                        while (TP.isNode(node = result.iterateNext())) {
                            resultArr.push(node);
                        }

                        if (resultArr.getSize() === 1) {
                            return resultArr.first();
                        }

                        return resultArr;
                    }
            }
        }
    } catch (e) {

        //  If the caller wanted a TP.NODESET, then we can retry with a snapshot
        //  result type, which is more resilient in face of DOM changes.
        if (resultType === TP.NODESET) {

            TP.ifInfo() ?
                TP.info('Error occurred executing XPath.' +
                        ' Retrying with snapshot result type') : 0;

            try {
                result = doc.evaluate(
                                theXPath,
                                aNode,
                                TP.$$xpathResolverFunction,
                                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                                null);

                resultArr = TP.ac();

                //  Repackage from the XPathResult into an Array.
                for (i = 0; i < result.snapshotLength; i++) {
                    resultArr.push(result.snapshotItem(i));
                }

                return resultArr;
            } catch (e2) {
                //  An error occurred the second time through - report it.
                if (log || !TP.sys.hasLoaded()) {
                    msg = TP.join('Error evaluating XPath ', anXPath);
                    TP.ifError() ?
                        TP.error(TP.ec(e2, msg), TP.QUERY_LOG) : 0;
                }
            }
        } else {
            if (log || !TP.sys.hasLoaded()) {
                msg = TP.join('Error evaluating XPath ', anXPath);
                TP.ifError() ?
                    TP.error(TP.ec(e, msg), TP.QUERY_LOG) : 0;
            }
        }
    }

    //  return value default depends on request type
    if (resultType === TP.NODESET) {
        return TP.ac();
    } else {
        return null;
    }
}, {
    dependencies: [TP.extern.wgxpath, TP.extern.jxpath, TP.extern.jQuery]
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEvaluateXPointer',
function(aNode, aPath, autoCollapse) {

    /**
     * @method nodeEvaluateXPointer
     * @summary Executes an XPointer, which may be one of a number of specific
     *     pointer schemes, returning the results. Samples include fragments of
     *     the form #barename, #xpointer(a_path), #xpath1(a_path),
     *     #element(a_path), etc.
     * @param {Node} aNode The 'context node' for the evaluation.
     * @param {String} aPath A valid xpointer expression/scheme such as
     *     xpointer(), xpath1(), element(), etc.
     * @param {Boolean} autoCollapse Whether to collapse Array results if
     *     there's only one item in them. The default is false.
     * @returns {Node[]|Node|Object} A collection of zero or more result nodes.
     */

    var path,
        result;

    //  NOTE that there's no testing of parameters here; we assume an entry
    //  point of nodeEvaluatePath() and rely on it to have tested them.

    //  Also note that, if the result here is not to be auto-collapsed, we
    //  hand back an empty Array to be consistent with the return value for
    //  all methods that do auto-reduction.

    //  element() scheme
    if (TP.regex.ELEMENT_POINTER.test(aPath)) {
        //  Note that because nodeEvaluateElementScheme() will always return
        //  a single Element, we only wrap it into an Array if the
        //  autoCollapse flag is not true.
        if (TP.isTrue(autoCollapse)) {
            return TP.nodeEvaluateElementScheme(aNode, aPath);
        } else {
            if (TP.notValid(result =
                            TP.nodeEvaluateElementScheme(aNode, aPath))) {
                return TP.ac();
            }

            return TP.ac(result);
        }
    } else if (TP.regex.XPATH_POINTER.test(aPath)) {
        //  strip XPath out of the xpointer() or xpath1() wrapper, leaving
        //  whatever might be there (which could include id(), instance(), etc.)
        path = TP.regex.XPATH_POINTER.match(aPath).at(2);

        if (TP.isTrue(autoCollapse)) {
            //  because auto-reduction means to return a 'collapsed' element
            //  only if there was only one return value, we always ask
            //  nodeEvaluateXPath() to hand us back a nodeset and then see
            //  if there is only one return value.
            result = TP.nodeEvaluateXPath(aNode, path, TP.NODESET);
            if (result.getSize() === 1) {
                return result.first();
            } else if (TP.isEmpty(result)) {
                return null;
            }

            return result;
        } else {
            //  This will always hand back an Array
            return TP.nodeEvaluateXPath(aNode, path, TP.NODESET);
        }
    } else {
        //  barename is our only remaining choice, and nodeGetElementById
        //  will manage any leading #. Note that TP.nodeGetElementById()
        //  will always return a single Element (never an Array), we just
        //  need to match 'return types' here and hand back an Array if
        //  we're not auto-reducing.
        if (TP.isTrue(autoCollapse)) {
            return TP.nodeGetElementById(aNode, aPath);
        } else {
            if (TP.notValid(result = TP.nodeGetElementById(aNode, aPath))) {
                return TP.ac();
            }

            return TP.ac(result);
        }
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEvaluateXTension',
function(aNode, aPath, autoCollapse) {

    /**
     * @method nodeEvaluateXTension
     * @summary Executes an extended XPointer scheme, typically css().
     * @param {Node} aNode The 'context node' for the evaluation.
     * @param {String} aPath An extended path/pointer scheme such as css(), etc.
     * @param {Boolean} autoCollapse Whether to collapse Array results if
     *     there's only one item in them. The default is false.
     * @returns {Node[]|Node} A collection of zero or more result nodes.
     */

    var query;

    //  NOTE that there's no testing of parameters here; we assume an entry
    //  point of nodeEvaluatePath() and rely on it to have tested them.

    if (TP.regex.CSS_POINTER.test(aPath)) {
        query = aPath.match(TP.regex.CSS_POINTER).at(1);

        return TP.nodeEvaluateCSS(aNode, query, autoCollapse);
    } else {
        TP.ifWarn() ?
            TP.warn('Unsupported query path syntax: ' + aPath,
                    TP.QUERY_LOG) : 0;

        return;
    }
});

//  ------------------------------------------------------------------------
//  NODE CONTENT COLLECTIONS
//  ------------------------------------------------------------------------

/*
Operations to acquire structurally related elements from a Node. Prebuilt
methods are defined here to acquire ancestors, children, descendants, and
siblings as well as child elements or descendant elements. A general purpose
routine for acquiring descendants of any type is also provided, however for
acquiring element descendants you should use the
TP.nodeGetDescendantElements() call since it's optimized for element access.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetAncestors',
function(aNode) {

    /**
     * @method nodeGetAncestors
     * @summary Returns an Array containing ancestor nodes of the provided
     *     node.
     * @description This list ends with the top-level element node and does not
     *     include the node's containing DOCUMENT_NODE. The list is ordered
     *     "outward" with the closest parent first.
     * @param {Node} aNode The DOM node to operate on.
     * @example Get all of the ancestors of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar><baz/></bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetAncestors(
     *          xmlDoc.documentElement.firstChild.firstChild);
     *          <samp>[object Element], [object Element]</samp>
     *     </code>
     * @example Get all of the ancestors of an HTML element:
     *     <code>
     *          TP.nodeGetAncestors(TP.documentGetBody(document).firstChild);
     *          <samp>[object HTMLBodyElement], [object HTMLHtmlElement]</samp>
     *     </code>
     * @returns {Node[]} An Array of the parent nodes of the supplied Node.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var ancestor,
        arr;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    arr = TP.ac();

    ancestor = aNode.parentNode;
    while (TP.isElement(ancestor)) {
        arr.push(ancestor);
        ancestor = ancestor.parentNode;
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetAncestorsInNS',
function(aNode, aNamespaceURI) {

    /**
     * @method nodeGetAncestorsInNS
     * @summary Returns an array of ancestors of the current element which are
     *     in the namespace provided. Note that this method only checks the
     *     elements themselves, not the attributes. If you want to also return
     *     elements that have attributes are in that namespace, use
     *     nodeGetAncestorsWithNS.
     * @param {Node} aNode The node to start traversal from.
     * @param {String} aNamespaceURI The URI for the namespace to check.
     * @returns {Element[]} An array of ancestors.
     */

    var arr,
        ancestor;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'InvalidNode');
    }

    if (TP.isEmpty(aNamespaceURI)) {
        return TP.raise(this, 'InvalidNamespace');
    }

    arr = TP.ac();

    ancestor = aNode.parentNode;
    while (TP.isElement(ancestor)) {
        if (ancestor.namespaceURI === aNamespaceURI) {
            arr.push(ancestor);
        }
        ancestor = ancestor.parentNode;
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetAncestorsWithNS',
function(aNode, aNamespaceURI) {

    /**
     * @method nodeGetAncestorsWithNS
     * @summary Returns an array of elements with either a namespaceURI or
     *     that has one or more attributes which are part of the namespace
     *     provided.
     * @param {Node} aNode The node to start traversal from.
     * @param {String} aNamespaceURI The URI for the namespace to check.
     * @returns {Element[]} An array of ancestors.
     */

    var arr,
        ancestor,
        attrs;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'InvalidNode');
    }

    if (TP.isEmpty(aNamespaceURI)) {
        return TP.raise(this, 'InvalidNamespace');
    }

    arr = TP.ac();

    ancestor = aNode.parentNode;
    while (TP.isElement(ancestor)) {
        if (ancestor.namespaceURI === aNamespaceURI) {
            arr.push(ancestor);
        } else {
            attrs = TP.elementGetAttributeNodesInNS(
                            ancestor, null, aNamespaceURI);
            if (TP.notEmpty(attrs)) {
                arr.push(ancestor);
            }
        }

        ancestor = ancestor.parentNode;
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetCommonAncestor',
function(firstNode, varargs) {

    /**
     * @method nodeGetCommonAncestor
     * @summary Returns the common ancestor of the supplied Nodes.
     * @description This is derived from code by 'Andy E':
     *     http://jsfiddle.net/AndyE/3FaRr/1/
     * @param {Node} firstNode The first DOM node to operate on.
     * @param {arguments} varargs The rest of DOM nodes to operate on.
     * @returns {Node} The common ancestor of the supplied Nodes.
     * @exception TP.sig.InvalidNode Raised when the first node provided to the
     *     method is invalid.
     * @exception TP.sig.InvalidParameter Raised when no more nodes are supplied
     *     to the method.
     */

    var i,
        nodes,

        startNode;

    if (!TP.isNode(firstNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.notValid(varargs)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    nodes = Array.prototype.slice.call(arguments, 1);

    startNode = firstNode;

    rocking:
        /* eslint-disable no-extra-parens */
        while ((startNode = startNode.parentNode)) {
        /* eslint-enable no-extra-parens */
            i = nodes.length;
            while (i--) {
                if ((startNode.compareDocumentPosition(nodes[i]) & 0x0010) !==
                                                                    0x0010) {
                    continue rocking;
                }
            }
            return startNode;
        }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetChildNodes',
function(aNode) {

    /**
     * @method nodeGetChildNodes
     * @summary Returns an Array of the child nodes of the provided node.
     * @param {Node} aNode The DOM node to operate on.
     * @example Get all of the child nodes of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar/>Some text<baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetChildNodes(xmlDoc.documentElement);
     *          <samp>[object Element], [object Text], [object Element]</samp>
     *     </code>
     * @example Get all of the child nodes of an HTML element:
     *     <code>
     *          TP.nodeGetChildNodes(document.documentElement);
     *          <samp>[object HTMLHeadElement], [object HTMLBodyElement]</samp>
     *     </code>
     * @returns {Node[]} An Array of the child nodes of the supplied Node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  NOTE the conversion to array here
    return TP.ac(aNode.childNodes);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetChildNodesByType',
function(aNode, aType, breadthFirst) {

    /**
     * @method nodeGetChildNodesByType
     * @summary Returns an Array of all child nodes of the provided node whose
     *     node type matches the type provided.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Number} aType The DOM node type constant to match against.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {Node[]} An Array containing the nodes found.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidParameter Raised when an invalid node type is
     *     provided to the method.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.notValid(aType)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    return TP.nodeSelectChildNodes(
                aNode,
                function(childNode) {
                    return childNode.nodeType === aType;
                });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetChildElementAt',
function(aNode, anIndex) {

    /**
     * @method nodeGetChildElementAt
     * @summary Returns the child element of aNode at the index provided, if
     *     such a child exists. Note that the index provided is used relative to
     *     children which are Element nodes only.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Number|Constant} anIndex The index in question, either a number
     *     or the constant TP.FIRST or TP.LAST.
     * @example Get the second child *element* node of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar/>Some text<baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          secondElement = TP.nodeGetChildElementAt(
     *          xmlDoc.documentElement, 1);
     *          <samp>[object Element]</samp>
     *          TP.nodeAsString(secondElement);
     *          <samp>&lt;baz&gt;&lt;/baz&gt;</samp>
     *     </code>
     * @example Get the first child *element* node of an HTML element:
     *     <code>
     *          firstElement = TP.nodeGetChildElementAt(
     *          TP.documentGetBody(document), 0);
     *          <samp>[object HTMLDivElement] (or the first child element of the
     *         body in the current document)</samp>
     *          TP.nodeAsString(firstElement);
     *          <samp>(html output of the first element of the body)</samp>
     *     </code>
     * @returns {Element} The child element of the supplied Node at the supplied
     *     index.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidParameter Raised when an invalid index is
     *     provided to the method.
     */

    var children,
        len,

        count,

        i,
        ind,
        node;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.notValid(anIndex)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  trim out extra overhead on IE (and browsers that implement the
    //  ElementTraversal specification) by using children array if available
    children = TP.nodeGetChildElements(aNode);

    len = children.length;
    count = 0;

    for (i = 0; i < len; i++) {
        ind = anIndex === TP.LAST ? len - i - 1 : i;
        node = children[ind];

        try {
            if (TP.isElement(node)) {
                switch (anIndex) {
                    //  note that because of our ind[ex] adjustment above
                    //  the logic is is the same, first element is what we
                    //  want
                    case 0:
                    case TP.FIRST:
                    case TP.LAST:
                        if (count === 0) {
                            return node;
                        }
                        break;

                    default:
                        if (count === anIndex) {
                            return node;
                        }
                        break;
                }

                count++;
            }
        } catch (e) {
            TP.ifError() ?
                TP.error(
                    TP.ec(e, 'Error retrieving child element at: ' + ind)) : 0;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetChildElements',
function(aNode) {

    /**
     * @method nodeGetChildElements
     * @summary Returns an Array of the child elements of the provided node.
     * @description No normalization of text node children is done in this
     *     process since we're only looking for element nodes.
     * @param {Node} aNode The DOM node to operate on.
     * @example Get all of the child *element* nodes of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar/>Some text<baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetChildElements(xmlDoc.documentElement);
     *          <samp>[object Element], [object Element]</samp>
     *     </code>
     * @example Get all of the child *element* nodes of an HTML element:
     *     <code>
     *          TP.nodeGetChildElements(TP.documentGetBody(document));
     *          <samp>[object HTMLDivElement] (or the first child element of the
     *         body in the current document)</samp>
     *     </code>
     * @returns {Element[]} An Array of the Element children of the supplied
     *     Node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var arr,
        nodes,
        len,

        i,

        node;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  In IE (and browsers that implement the Element Traversal
    //  specification), HTML elements have a convenience property called
    //  'children' that contains *only elements*, not all child nodes as the
    //  W3C property 'childNodes' does (and therefore doesn't require the
    //  looping behavior below).
    if (TP.isValid(aNode.children)) {
        return TP.ac(aNode.children);
    }

    arr = TP.ac();
    nodes = aNode.childNodes;
    len = nodes.length;

    for (i = 0; i < len; i++) {
        node = nodes[i];

        try {
            if (TP.isElement(node)) {
                arr.push(node);
            }
        } catch (e) {
            TP.ifError() ?
                TP.error(
                    TP.ec(e, 'Error retrieving child elements')) : 0;
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendants',
function(aNode, breadthFirst) {

    /**
     * @method nodeGetDescendants
     * @summary Returns an Array of the children, grandchildren, and so on of
     *     the node provided.
     * @description Note that the nodes acquired as descendants are normalized
     *     to coalesce text children as part of this method. Also note that for
     *     a variety of reasons the return values from this call are not likely
     *     to be identical across browsers due to differences in handling
     *     whitespace, comments, processing instructions, etc.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Get all of the descendant nodes of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar>Some text</bar><baz><underbaz/></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendants(xmlDoc);
     *          <samp>[object Element], [object Element], [object Text], [object
     *         Element], [object Element]</samp>
     *          // Do the same process, but return the results
     *          // 'breadth first'.
     *          TP.nodeGetDescendants(xmlDoc, true);
     *          <samp>[object Element], [object Element], [object Element],
     *         [object Text], [object Element]</samp>
     *     </code>
     * @example Get all of the descendant nodes of an HTML element:
     *     <code>
     *          TP.nodeGetDescendants(TP.documentGetBody(document));
     *          <samp>(descendant nodes of the body element in depth-first
     *         traversal order)</samp>
     *          // Do the same process, but return the results
     *          // 'breadth first'.
     *          TP.nodeGetDescendants(xmlDoc, true);
     *          <samp>(descendant nodes of the body element in breadth-first
     *         traversal order)</samp>
     *     </code>
     * @returns {Node[]} An Array containing the nodes found.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var arr,
        func,

        doc,
        walker;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    arr = TP.ac();
    func = function(node) {
        arr.push(node);
    };

    if (TP.isTrue(breadthFirst)) {
        TP.nodeBreadthTraversal(aNode, func, null, func, false);
    } else {
        doc = TP.nodeGetDocument(aNode);

        //  Create a TreeWalker that looks for CDATA sections, comments,
        //  text nodes (basically, what the DOM calls 'CharacterData') and
        //  elements.
        walker = doc.createTreeWalker(
                    aNode,
                    NodeFilter.SHOW_CDATA_SECTION |
                        NodeFilter.SHOW_COMMENT |
                        NodeFilter.SHOW_TEXT |
                        NodeFilter.SHOW_ELEMENT,
                    null,
                    false);

        //  Iterate and push the resultant nodes.
        while (walker.nextNode()) {
            arr.push(walker.currentNode);
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendantAt',
function(aNode, aPath) {

    /**
     * @method nodeGetDescendantAt
     * @summary Returns a descendant Element given a '.' separated 'path' of
     *     element indicies for each 'level'.
     * @description No normalization of text node children is done in this
     *     process since we're only looking for element nodes.
     * @param {Node} aNode The DOM node to operate on.
     * @example Get the descendant element node at address 0.1 (the 'baz'
     *     element):
     *     <code>
     *          xmlDoc = TP.nodeGetDescendantElementAt(
     *              TP.documentFromString('<foo><bar/>Some text<baz/></foo>'));
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendantAt(xmlDoc.documentElement, '0.1');
     *          <samp>[object Element]</samp>
     *     </code>
     * @returns {Element|null} The element at the address or null.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidParameter Raised when an invalid or empty 'path'
     *     is provided to the method.
     */

    var children,

        node,

        address,

        len,

        i,
        index;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  make sure we have a non-empty path
    if (TP.isEmpty(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    node = aNode;

    //  Split the address and iterate.

    address = aPath.split('.');

    len = address.getSize();
    for (i = 0; i < len; i++) {

        //  Grab only the child *elements*
        children = TP.nodeGetChildElements(node);

        try {
            index = parseInt(address.at(i), 10);
            node = children[index];

            if (!TP.isElement(node)) {
                return null;
            }

        } catch (e) {
            TP.ifError() ?
                TP.error(
                    TP.ec(
                        e, 'Error retrieving child element at: ' + index)) : 0;
        }
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendantsByType',
function(aNode, aType, breadthFirst) {

    /**
     * @method nodeGetDescendantsByType
     * @summary Returns an Array of all descendants of the provided node whose
     *     node type matches the type provided.
     * @description Note that node content is normalized before returning this
     *     list so that child text nodes are coalesced for consistency.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Number} aType The DOM node type constant to match against.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Get all of the descendant Text nodes of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar>Some text<goo>More
     *         text</goo></bar>Yet more text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeGetDescendantsByType(xmlDoc, Node.TEXT_NODE);
     *          <samp>[object Text], [object Text], [object Text]</samp>
     *          // Get the string value of each node to see what we
     *          // have.
     *          result.collect(function(aNode) {return TP.str(aNode)});
     *          <samp>Some text, More text, Yet more text</samp>
     *          // Do the same process, but return the results
     *          // 'breadth first'.
     *          result = TP.nodeGetDescendantsByType(xmlDoc,
     *          Node.TEXT_NODE,
     *          true);
     *          <samp>[object Text], [object Text], [object Text]</samp>
     *          // Get the string value of each node to see what we
     *          // have.
     *          result.collect(function(aNode) {return TP.str(aNode)});
     *          <samp>Yet more text, Some text, More text</samp>
     *     </code>
     * @example Get all of the descendant Text nodes of an HTML element:
     *     <code>
     *          TP.nodeGetDescendantsByType(
     *          TP.documentGetBody(document),
     *          Node.TEXT_NODE);
     *          <samp>(descendant text nodes of the body element in depth-first
     *         traversal order)</samp>
     *          // Do the same process, but return the results
     *          // 'breadth first'.
     *          TP.nodeGetDescendantsByType(
     *          TP.documentGetBody(document),
     *          Node.TEXT_NODE,
     *          true);
     *          <samp>(descendant text nodes of the body element in
     *         breadth-first traversal order)</samp>
     *     </code>
     * @returns {Node[]} An Array containing the nodes found.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidParameter Raised when an invalid node type is
     *     provided to the method.
     */

    var arr,
        func;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.notValid(aType)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    arr = TP.ac();
    func = function(node) {

        if (node.nodeType === aType) {
            arr.push(node);
        }
    };

    if (TP.isTrue(breadthFirst)) {
        TP.nodeBreadthTraversal(aNode, func, null, func, false);
    } else {
        TP.nodeDepthTraversal(aNode, func, null, func, false);
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendantElements',
function(aNode, breadthFirst) {

    /**
     * @method nodeGetDescendantElements
     * @summary Returns an Array of the children, grandchildren, and so on of
     *     the node provided which are Element nodes.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first (which is document order).
     * @example Get all of the Element nodes under the supplied Node as a
     *     regular JavaScript Array:
     *     <code>
     *          TP.nodeGetDescendantElements(document);
     *          <samp>...Array...</samp>
     *          TP.nodeGetDescendantElements(document, true);
     *          <samp>...Array sorted by 'breadth-first'...</samp>
     *     </code>
     * @returns {Element[]} An Array of the Element descendants of the supplied
     *     Node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    //  no child nodes for anything that isn't an element, document or document
    //  fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this,
                        'TP.sig.InvalidNode',
                        'Node not a collection Node.');
    }

    //  DOM-compliant document and element nodes can do this faster natively
    //  since depth first is how their lookups work
    if (TP.notTrue(breadthFirst) && !TP.isFragment(aNode)) {
        //  Note how we convert the NodeList into an Array to hand back the
        //  proper type. No additional processing is needed here.
        return TP.ac(aNode.getElementsByTagName('*'));
    }

    //  for breadth first (or fragment nodes) we've got to use alternative
    //  iteration
    return TP.nodeGetDescendantsByType(aNode, Node.ELEMENT_NODE, breadthFirst);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendantElementsByAttribute',
function(aNode, attrName, attrValue, breadthFirst) {

    /**
     * @method nodeGetDescendantElementsByAttribute
     * @summary Returns an Array containing descendants of the node provided
     *     which are Element nodes and which contain an attribute name/value
     *     matching the value provided.
     * @description If the supplied attribute value is null, this method will
     *     return Element nodes that have any value for the named attribute, no
     *     matter its value.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} attrName The attribute to test for.
     * @param {Object} attrValue The attribute value to check.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Retrieve all of the XML elements where the 'goo' attribute
     *     exists with a particular value:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo goo="moo"><bar
     *         goo="gar"><baz/></bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Grab an Array of elements where 'goo' equals 'moo'
     *          TP.nodeGetDescendantElementsByAttribute(xmlDoc, 'goo', 'moo');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Retrieve all of the XML elements where the 'goo' attribute
     *     exists but with no particular value:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo goo="moo"><bar
     *         goo="gar"><baz/></bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendantElementsByAttribute(xmlDoc, 'goo');
     *          <samp>[object Element], [object Element]</samp>
     *     </code>
     * @example Retrieve all of the HTML elements where the 'style' attribute
     *     exists but with no particular value:
     *     <code>
     *         TP.nodeGetDescendantElementsByAttribute(TP.documentGetBody(document),
     *          'style');
     *          <samp>(descendant element nodes of the body element that have a
     *         'style' attribute)</samp>
     *     </code>
     * @returns {Node[]} An Array containing the nodes found.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidName Raised when an invalid attribute name is
     *     provided to the method.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.isEmpty(attrName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    return TP.nodeSelectDescendantElements(
        aNode,
        function(node) {

            var re,
                attrs,
                len,
                i;

            //  We put try...catch around this because IE will sometimes
            //  throw exceptions...
            try {
                if (TP.regex.IS_NAMEXP.test(attrName)) {
                    re = TP.getQNameRegex(attrName);

                    attrs = node.attributes;
                    len = attrs.length;

                    for (i = 0; i < len; i++) {
                        //  find the name
                        if (re.test(attrs[i].name)) {
                            //  check the value as needed
                            if (TP.isValid(attrValue)) {
                                if (!TP.match(attrValue, attrs[i].value)) {
                                    continue;
                                }
                            }

                            return true;
                        }
                    }
                } else {
                    //  without a value we can go by existence alone which
                    //  should be a little faster
                    if (TP.notValid(attrValue)) {
                        if (TP.elementHasAttribute(node, attrName)) {
                            return true;
                        }
                    } else if (TP.match(
                                attrValue,
                                TP.elementGetAttribute(node, attrName))) {
                        return true;
                    }
                }
            } catch (e) {
                TP.ifError() ?
                    TP.error(
                        TP.ec(e, 'Error getting descendant elements' +
                                    ' by attribute: ' + attrName)) : 0;
            }

            return false;
        },
        null,
        breadthFirst);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendantElementsByAttributePrefix',
function(aNode, attrPrefix, attrValue, breadthFirst) {

    /**
     * @method nodeGetDescendantElementsByAttributePrefix
     * @summary Returns an Array of the children, grandchildren, and so on of
     *     the node provided which are Element nodes and which contain at least
     *     one attribute whose name is prefixed with the supplied prefix and
     *     whose value matches the supplied value.
     * @description If the supplied attribute value is null, this method will
     *     return Element nodes that have any value for the named attribute, no
     *     matter its value.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} attrPrefix The prefix string to test for.
     * @param {Object} attrValue The attribute value to check.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Retrieve all of the XML elements where an 'xf:'-prefixed
     *     attribute exists with a particular value:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"><bar
     *         xf:goo="moo">Hi there</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendantElementsByAttributePrefix(xmlDoc,
     *          'xf',
     *          'theBinder');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Retrieve all of the XML elements where an 'xf:'-prefixed
     *     attribute exists with no particular value:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"><bar
     *         xf:goo="moo">Hi there</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendantElementsByAttributePrefix(xmlDoc, 'xf');
     *          <samp>[object Element], [object Element]</samp>
     *     </code>
     * @returns {Node[]} An Array containing the nodes found.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidName Raised when an invalid attribute prefix is
     *     provided to the method.
     */

    var prefix;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.isEmpty(attrPrefix)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    prefix = attrPrefix.endsWith(':') ? attrPrefix : attrPrefix + ':';

    return TP.nodeSelectDescendantElements(
        aNode,
        function(node) {

            var attrs,
                len,
                i;

            //  We put try...catch around this because IE will sometimes
            //  throw exceptions...
            try {
                attrs = node.attributes;
                len = attrs.length;

                for (i = 0; i < len; i++) {
                    //  If we find that prefix within the attribute name
                    if (attrs[i].name.indexOf(prefix) !== TP.NOT_FOUND) {
                        //  If we've been given a valid attrValue to test,
                        //  then we only return true if that value matches
                        //  the actual attribute value.
                        if (TP.isValid(attrValue)) {
                            if (!TP.match(attrValue, attrs[i].value)) {
                                continue;
                            }
                        }

                        return true;
                    }
                }
            } catch (e) {
                TP.ifError() ?
                    TP.error(
                        TP.ec(e, 'Error getting descendant elements' +
                                    ' by attribute prefix: ' + attrPrefix)) : 0;
            }

            return false;
        },
        null,
        breadthFirst);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendantElementsByIdOrName',
function(aNode, anIdOrName) {

    /**
     * @method nodeGetDescendantElementsByIdOrName
     * @summary Returns any elements that can be found which have either the ID
     *     or name provided.
     * @description For HTML documents where radio buttons often use the 'name'
     *     attribute as an identifier rather than 'id' we need a way to query
     *     the document for elements matching an identifier which might be
     *     either a name or id value.
     *
     *     This method gives preference to elements with 'id' values. Only if
     *     no elements can be found with an 'id' having the value given will it
     *     then search for elements with a matching name value. Since this
     *     method is an "Or" rather than "And" it has the effect of discouraging
     *     markup which uses a value for the 'id' attribute as the value for the
     *     'name' attribute for non-radio elements.
     *
     *     NOTE: Since this function is used during event arming that means
     *     elements with a name value that overlap with an ID cannot be armed
     *     using normal mechanisms.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} anIdOrName The ID or name of the element to find.
     * @example Retrieve all of the XML elements where the 'id' or 'name'
     *     attribute has a particular value (note how precedence is given to
     *     'id'):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo id="foo"><bar name="foo">Hi there</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendantElementsByIdOrName(xmlDoc, 'foo');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Retrieve all of the XML elements where the 'id' or 'name'
     *     attribute has a particular value (multiples will be returned if the
     *     attribute is 'name'):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo name="foo"><bar name="foo">Hi there</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendantElementsByIdOrName(xmlDoc, 'foo');
     *          <samp>[object Element], [object Element]</samp>
     *     </code>
     * @returns {Element[]} The elements whose name is equal to anIdOrName or
     *     empty if there are no objects with that name.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidName Raised when an empty ID or name is provided
     *     to the method.
     */

    var elem,
        result;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  if we can find the element by ID we're done
    if (TP.isElement(elem = TP.nodeGetElementById(aNode, anIdOrName))) {
        //  Note here how we construct this Array and push the singular
        //  Element onto it, rather than using our convenience syntax of
        //  handing the Element directly to the Array constructor. This is
        //  to avoid situations where the Element (like (X)HTML 'select'
        //  elements) actually have a 'length' property and then we actually
        //  get an Array of the 'option' Elements (in that case) back,
        //  rather than the Element as the sole item in the Array.
        result = TP.ac();
        result.push(elem);

        return result;
    }

    //  default to the name attribute search
    return TP.nodeGetDescendantElementsByName(aNode, anIdOrName);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendantElementsByName',
function(aNode, aName) {

    /**
     * @method nodeGetDescendantElementsByName
     * @summary Returns an Array containing any descendants of the node
     *     provided which are Element nodes and whose name attributes match the
     *     name provided.
     * @description When the supplied node is an HTML document this will use the
     *     native call, otherwise it defers to using a manual search via the
     *     name attribute.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aName The name value to search for.
     * @example Retrieve all of the XML elements where the 'name' attribute has
     *     a particular value:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo id="foo"><bar name="foo">Hi there</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendantElementsByName(xmlDoc, 'foo');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Retrieve all of the XML elements where the 'name' attribute has
     *     a particular value (multiples will be returned if the attribute is
     *     'name'):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo name="foo"><bar name="foo">Hi there</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDescendantElementsByName(xmlDoc, 'foo');
     *          <samp>[object Element], [object Element]</samp>
     *     </code>
     * @returns {Element[]} An Array containing the elements found.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidName Raised when an empty name is provided to
     *     the method.
     */

    //  when the node is a native HTML document we can use the native
    //  call
    if (TP.isHTMLDocument(aNode)) {
        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode');
        }

        if (TP.isEmpty(aName)) {
            return TP.raise(this, 'TP.sig.InvalidName');
        }

        return aNode.getElementsByName(aName);
    }

    return TP.nodeGetDescendantElementsByAttribute(aNode, 'name', aName);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDocument',
function(aNode) {

    /**
     * @method nodeGetDocument
     * @summary Returns the document node containing the node provided. If the
     *     node provided is a Document node, this function will return the node
     *     provided.
     * @param {Node} aNode The DOM node to operate on.
     * @example Get the document of an element in an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns:bar="http://www.bar.com"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetDocument(xmlDoc.documentElement) === xmlDoc;
     *          <samp>true</samp>
     *     </code>
     * @example Get the document of an element in an HTML document:
     *     <code>
     *          TP.nodeGetDocument(TP.documentGetBody(document)) ===
     *         document;
     *          <samp>true</samp>
     *     </code>
     * @returns {Document} The document containing the supplied Node.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var doc,
        ancestor;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (aNode.nodeType === Node.DOCUMENT_NODE) {
        return aNode;
    }

    if (TP.isDocument(doc = aNode.ownerDocument)) {
        return doc;
    }

    //  NOTE thanks to a bug in early versions of Mozilla when you work with
    //  cloned documents the child elements can get detached from their
    //  ownerDocument pointers...so we iterate just in case.
    ancestor = aNode.parentNode;
    while (TP.isElement(ancestor)) {
        //  NB: This assignment should *not* be moved into the looping logic. We
        //  want 'ancestor' to remain what it is if its parent node is null.
        //  This means it is the document itself and we want to use it below.
        ancestor = ancestor.parentNode;
    }

    if (TP.isElement(ancestor)) {
        return ancestor.ownerDocument;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetElementById',
function(aNode, anID, retryWithPath) {

    /**
     * @method nodeGetElementById
     * @summary Returns the subelement of the node provided which has the ID
     *     given. This is a wrapper for ID retrieval using the standard
     *     getElementById() call which deals with problems across XML and HTML
     *     DOM trees between W3C-compliant browsers and IE. Note that the ID
     *     will have ":" translated to "_" to support NS-qualified IDs.
     * @description For HTML documents the standard getElementById call is often
     *     sufficient, however XML documents will vary on W3C-compliant browsers
     *     based on the namespace and whether there's an internal DTD that
     *     defines IDREF attributes for that document. Many of TIBET's external
     *     files are maintained in augmented XHTML files with these internal
     *     DTDs so an XPath fallback is just extra overhead since if the ID
     *     existed it would have been found. The $retryWithXPath attribute is
     *     therefore used internally by metadata-related searches to avoid this
     *     overhead. In non-XHTML XML documents this function will return null
     *     if the element with id anID is not either the supplied node or a
     *     child of the supplied node.
     * @param {Node} aNode The node to search.
     * @param {String} anID The string ID to search for.
     * @param {Boolean} retryWithPath False to force ID search to skip 'path
     *     query' fallbacks.
     * @example Get the element in an XML document with 'id' of 'bar':
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo id="bar"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetElementById(xmlDoc, 'bar');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Get the element in an HTML document with 'id' of 'bar':
     *     <code>
     *          TP.documentGetBody(document).setAttribute('id', 'myBody');
     *          <samp>undefined</samp>
     *          TP.nodeGetElementById(document, 'myBody');
     *          <samp>[object HTMLBodyElement]</samp>
     *     </code>
     * @returns {Element} A native element, if one is found.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidID Raised when a null or empty ID is provided to
     *     the method.
     */

    var doc,
        id,

        realID,
        result;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  ID has to be a valid IDREF, but we're not going to be that
    //  strict
    if (TP.isEmpty(anID)) {
        return TP.raise(this, 'TP.sig.InvalidID');
    }

    //  best case we're looking for an ID in an HTML document
    if (TP.notValid(doc = TP.nodeGetDocument(aNode))) {
        return null;
    }

    //  one special case is the id #document, which refers to the
    //  document element of a document. you can't find this by normal
    //  query
    if (anID === '#document') {
        return doc.documentElement;
    }

    //  empty document? no location
    if (TP.notValid(doc.documentElement)) {
        return;
    }

    id = anID.strip(TP.regex.BARENAME);

    //  for HTML documents the native getElementById() is sufficient
    if (TP.isHTMLDocument(doc)) {
        return doc.getElementById(id);
    }

    //  NOTE: ID replacement required to avoid problems with common ID
    //  content such as NS-qualified elements like type names. The XML
    //  spec says that we're limited to: [a-zA-Z_][a-zA-Z0-9.-_]*
    TP.regex.ID_HAS_NS.lastIndex = 0;
    realID = id.replace(TP.regex.ID_HAS_NS, '_');

    //  If we still couldn't produce a valid IDREF, then return null
    TP.regex.INVALID_ID_CHARS.lastIndex = 0;
    if (TP.regex.INVALID_ID_CHARS.test(realID)) {
        return null;
    }

    //  If its an XHTML document, getElementById() may work in
    //  W3C-compliant browsers. We leverage this fact around common XML
    //  metadata in Gecko and Webkit
    if (TP.canInvoke(doc, 'getElementById')) {

        /* eslint-disable no-extra-parens */
        if ((result = doc.getElementById(realID))) {
            return result;
        }
        /* eslint-enable no-extra-parens */
    }

    //  we force retry to false on our metadata XHTML files so we don't
    //  search for something we're not going to find
    if (TP.notFalse(retryWithPath)) {

        //  Otherwise, its XML that's not XHTML, so getElementById() won't work
        //  (sigh...), but modern browsers actually support querySelector() on
        //  XML nodes.
        result = aNode.querySelector('*[id="' + realID + '"]');
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetElementsByTagName',
function(aNode, aTagName, aNamespaceURI) {

    /**
     * @method nodeGetElementsByTagName
     * @summary Returns an Array containing any descendant elements of the
     *     supplied node whose tag names match the name provided. Note that this
     *     function can deal properly with namespace-qualified tag names across
     *     platforms.
     * @description This function can handle finding elements in the following
     *     situations where the standard 'getElementsByTagName()' call fails: 1)
     *     When elements are in the default namespace in an XML document, the
     *     standard is to *not* return them, but to instead force the programmer
     *     to use getElementsByTagNameNS() (and thereby forcing the caller to
     *     know the default namespace URI). Not only is this extremely
     *     inconvenient, it is inconsistent between the two major browsers.
     *     Mozilla ignores the standard and returns elements in the default
     *     namespace anyway. IE follows the spec here and won't return them, but
     *     doesn't supply the getElementsByTagNameNS() call, forcing the
     *     programmer to use an XPath. 2) When elements are in prefixed
     *     namespaces, the standard call works completely inverted between the
     *     two browsers. If the prefix is included as part of the supplied tag
     *     name, IE will find the elements but Mozilla will not. If the prefix
     *     is not included as part of the supplied tag name, IE will not find
     *     the elements but Mozilla will. 3) When a prefix happens to be used by
     *     two different namespaces (unlikely but possible), it is not possible
     *     to ask for a 'union' of all of the elements with a particular prefix,
     *     no matter what namespace they're associated with.
     *     getElementsByTagNameNS() discriminates based on namespaceURI, not
     *     prefix, and it doesn't exist on IE anyway. 4) In HTML documents, IE
     *     will return comment nodes when the '*' wildcard is used, even though
     *     they're not nodes of type Node.ELEMENT_NODE.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aTagName The string tag name to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @example Find all elements in all namespaces under an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms"><xf:bar>Hi
     *         there</xf:bar><baz>Hi there again<xf:foo>More
     *         hi!</xf:foo></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetElementsByTagName(xmlDoc, '*');
     *          <samp>[object Element], [object Element], [object
     *         Element]</samp>
     *     </code>
     * @example Find all elements named 'foo' under an XML document, no matter
     *     what namespace they're in (even a default namespace):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms"><xf:bar>Hi
     *         there</xf:bar><baz>Hi there again<xf:foo>More
     *         hi!</xf:foo></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetElementsByTagName(xmlDoc, 'foo');
     *          <samp>[object Element], [object Element]</samp>
     *     </code>
     * @example Find all elements under an XML document, but only if they're in
     *     the 'http://www.foo.com' namespace (even if 'http://www.foo.com' is
     *     used as a default namespace in one place and as a prefixed namespace
     *     in another):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms"><xf:bar>Hi
     *         there</xf:bar><baz>Hi there again<xf:foo>More
     *         hi!</xf:foo></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetElementsByTagName(xmlDoc,
     *          '*',
     *          'http://www.foo.com');
     *          <samp>[object Element], [object Element]</samp>
     *     </code>
     * @example Find all elements named 'xf:bar' under an XML document, no
     *     matter what namespace they're in (even a default namespace) and no
     *     matter what namespace URI the 'xf' prefix is an alias for (even if
     *     its an alias for multiple namespaces):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms"><xf:bar>Hi
     *         there</xf:bar><baz>Hi there again<xf:foo>More
     *         hi!</xf:foo></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetElementsByTagName(xmlDoc, 'xf:bar');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Find all elements named 'foo' under an XML document, but only if
     *     they're in the 'http://www.w3.org/2002/xforms' namespace (even if
     *     'http://www.w3.org/2002/xforms' is used as a default namespace in one
     *     place and as a prefixed namespace in another):
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms"><xf:bar>Hi
     *         there</xf:bar><baz>Hi there again<xf:foo>More
     *         hi!</xf:foo></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetElementsByTagName(
     *          xmlDoc,
     *          'foo',
     *          'http://www.w3.org/2002/xforms');
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Find all elements named 'xf:bar' under an XML document, but only
     *     if they're in the 'http://www.w3.org/2002/xforms' namespace. Note
     *     this will *not* find elements named just 'bar' (i.e. where
     *     'http://w3.org/2002/xforms' is the default namespace) nor will will
     *     it find elements whose name is 'xf:bar' where 'xf' is aliased to a
     *     different namespace than 'http://www.w3.org/2002/xforms':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms"><xf:bar>Hi
     *         there</xf:bar><baz>Hi there again<xf:foo>More
     *         hi!</xf:foo></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetElementsByTagName(
     *          xmlDoc,
     *          'xf:bar',
     *          'http://www.w3.org/2002/xforms');
     *          <samp>[object Element]</samp>
     *     </code>
     * @returns {Element[]} An Array containing native elements found.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidName Raised when an invalid tag name is provided
     *     to the method.
     */

    var path,
        func,
        matcher;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.isEmpty(aTagName)) {
        return TP.raise(this, 'TP.sig.InvalidName',
                                        'Invalid or empty tag name');
    }

    //  If we're not dealing with an XML document, then we need to return
    //  whatever the native call will do (XPaths won't work on non-XML
    //  documents such as IE's HTML DOM).
    if (!TP.isXMLDocument(TP.nodeGetDocument(aNode))) {
        //  If name is '*', then we use our TP.nodeGetDescendantElements()
        //  call, since on IE it properly filters out COMMENT_NODEs which
        //  getElementsByTagName('*') puts in.
        if (aTagName === '*' || aTagName === '*:*') {
            return TP.nodeGetDescendantElements(aNode, false);
        }

        //  as long as we're not trying to wildcard the name we can use the
        //  builtin call to do the work
        if (TP.isString(aTagName) &&
            !TP.regex.IS_NAMEXP.test(aTagName) &&
            !TP.isFragment(aNode)) {
            //  Note how we convert the NodeList into an Array to hand back
            //  the proper type.
            return TP.ac(aNode.getElementsByTagName(aTagName));
        }

        matcher = TP.getQNameRegex(aTagName);
        func = function(node) {

                    //  NOTE that since we're in HTML here we ignore the
                    //  namespace URI question
            if (matcher.test(TP.qname(node))) {
                return true;
            }
        };

        return TP.nodeSelectDescendantElements(aNode, func);
    }

    //  If we're being asked for '*', then that's all elements no matter
    //  what. Therefore, the XPath is simple and we don't need to take
    //  anything else into account.
    if (aTagName === '*' || aTagName === '*:*') {
        if (TP.notEmpty(aNamespaceURI)) {
            return TP.nodeEvaluateXPath(
                        aNode,
                        'descendant-or-self::*[namespace-uri() = "' +
                            aNamespaceURI + '"]',
                        TP.NODESET);
        }

        return TP.nodeGetDescendantElements(aNode, false);
    }

    //  can't process wildcarded names via xpath so do them here
    if (TP.isArray(aTagName) || TP.regex.IS_NAMEXP.test(aTagName)) {
        matcher = TP.getQNameRegex(aTagName);
        func = function(node) {

            if (matcher.test(TP.qname(node))) {
                if (TP.isString(aNamespaceURI)) {
                    if (TP.nodeGetNSURI(node) !== aNamespaceURI) {
                        return false;
                    }
                }
                return true;
            }
        };

        return TP.nodeSelectDescendantElements(aNode, func);
    }

    //  last option is that we're doing a normal tagname with optional
    //  namespace URI specification, which seems faster via XPath
    TP.regex.ID_HAS_NS.lastIndex = 0;
    if (TP.regex.ID_HAS_NS.test(aTagName)) {
        path = 'descendant-or-self::*[name() = "' + aTagName + '"';
    } else {
        path = 'descendant-or-self::*[local-name() = "' + aTagName + '"';
    }

    if (TP.notEmpty(aNamespaceURI)) {
        path += ' and namespace-uri() = "' + aNamespaceURI + '"';
    }

    path += ']';

    return TP.nodeEvaluateXPath(aNode, path, TP.NODESET);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstAncestorByAttribute',
function(aNode, attrName, attrValue, checkAttrNSURI) {

    /**
     * @method nodeGetFirstAncestorByAttribute
     * @summary Returns the first element ancestor of aNode which has an
     *     attribute matching attrName and whose value matches the optional
     *     attrValue provided.
     * @description This is a commonly used method in widget construction where
     *     an inner element is looking outward for its containing widget or
     *     control, often during event dispatch.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} attrName The attribute to test for.
     * @param {Object} attrValue The optional attribute value to check.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @example TODO:
     * @returns {Element} An element ancestor of the node.
     * @exception TP.sig.InvalidParameter Raised when a node that isn't of type
     *     Node.ELEMENT_NODE or Node.DOCUMENT_NODE is provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    if (TP.isEmpty(attrName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    return TP.nodeDetectAncestor(
            aNode,
            function(elem) {

                var re,
                    attrs,
                    len,
                    i;

                if (TP.regex.IS_NAMEXP.test(attrName)) {
                    re = TP.getQNameRegex(attrName);

                    attrs = elem.attributes;
                    len = attrs.length;

                    for (i = 0; i < len; i++) {
                        //  find the name
                        if (re.test(attrs[i].name)) {
                            //  check the value as needed
                            if (TP.isValid(attrValue)) {
                                if (!TP.match(attrValue, attrs[i].value)) {
                                    continue;
                                }
                            }

                            return true;
                        }
                    }
                } else {
                    //  without a value we can go by existence alone
                    //  which should be a little faster
                    if (TP.notValid(attrValue)) {
                        if (TP.elementHasAttribute(
                                    elem, attrName, checkAttrNSURI)) {
                            return true;
                        }
                    } else if (TP.match(
                                attrValue,
                                TP.elementGetAttribute(
                                    elem, attrName, checkAttrNSURI))) {
                        return true;
                    }
                }

                return false;
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstAncestorByTagName',
function(aNode, aTagName, aNamespaceURI) {

    /**
     * @method nodeGetFirstAncestorByTagName
     * @summary Returns the first element ancestor of aNode which matches the
     *     name and optional namespace URI provided.
     * @description This is a commonly used method in widget construction where
     *     an inner element is looking outward for its containing widget or
     *     control, often during event dispatch.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aTagName The string tagname to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @example TODO
     * @returns {Element} An element ancestor of the node.
     * @exception TP.sig.InvalidParameter Raised when a node that isn't of type
     *     Node.ELEMENT_NODE or Node.DOCUMENT_NODE is provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied tag name is empty.
     */

    var tagName,
        matcher;

    if (TP.isEmpty(aTagName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    //  qname returns lowercase tags for HTML (xhtml style)
    if (TP.isHTMLNode(aNode)) {
        tagName = aTagName.toLowerCase();
    } else {
        tagName = aTagName;
    }

    matcher = TP.getQNameRegex(tagName);

    return TP.nodeDetectAncestor(
            aNode,
            function(elem) {
                if (TP.isString(aNamespaceURI)) {
                    if (TP.nodeGetNSURI(elem) !== aNamespaceURI) {
                        return false;
                    }
                }

                return matcher.test(TP.qname(elem));
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstElementChildByAttribute',
function(aNode, attrName, attrValue) {

    /**
     * @method nodeGetFirstElementChildByAttribute
     * @summary Returns the first element child of aNode which has an attribute
     *     matching attrName and whose value matches the optional attrValue
     *     provided.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} attrName The attribute to test for.
     * @param {Object} attrValue The attribute value to check.
     * @example Get the first child Element node of an XML element that has an
     *     attribute 'goo' which has a value of 'moo':
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar><goo baz="goo">More
     *         text</goo></bar><boo baz="goo">Yet more text</boo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          aNode = TP.nodeGetFirstElementChildByAttribute(
     *          xmlDoc.documentElement,
     *          'baz',
     *          'goo');
     *          <samp>[object Element]</samp>
     *          // Get the string value to see what we have.
     *          TP.str(aNode);
     *          // Note here how it's 'boo' that is returned, not 'goo'
     *          // because 'boo' is a (direct) child and 'goo' isn't
     *          // (its a descendant, but not a direct child).
     *          <samp>&lt;boo baz="goo"&gt;Yet more text&lt;boo&gt;</samp>
     *     </code>
     * @example Get the first child Element node of an HTML element that has an
     *     attribute 'style' which has any value:
     *     <code>
     *          TP.nodeGetFirstElementChildByAttribute(
     *          document.documentElement,
     *          'style');
     *          // Assuming the 'body' element has a style...
     *          <samp>[object HTMLBodyElement]</samp>
     *     </code>
     * @returns {Element} An element child of the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidString Raised when the supplied attribute name
     *     is empty.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.isEmpty(attrName)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    return TP.nodeDetectChildElement(
            aNode,
            function(elem) {

                var matcher,
                    attrs,
                    len,
                    i;

                //  We put try...catch around this because IE will sometimes
                //  throw exceptions...
                try {
                    if (TP.regex.IS_NAMEXP.test(attrName)) {
                        matcher = TP.getQNameRegex(attrName);

                        attrs = elem.attributes;
                        len = attrs.length;

                        for (i = 0; i < len; i++) {
                            //  find the name
                            if (matcher.test(attrs[i].name)) {
                                //  check the value as needed
                                if (TP.isValid(attrValue)) {
                                    if (!TP.match(attrValue, attrs[i].value)) {
                                        continue;
                                    }
                                }

                                return true;
                            }
                        }
                    } else {
                        //  without a value we can go by existence alone
                        //  which should be a little faster
                        if (TP.notValid(attrValue)) {
                            if (TP.elementHasAttribute(elem, attrName)) {
                                return true;
                            }
                        } else if (TP.match(
                                    attrValue,
                                    TP.elementGetAttribute(elem, attrName))) {
                            return true;
                        }
                    }
                } catch (e) {
                    TP.ifError() ?
                        TP.error(
                            TP.ec(e, 'Error getting first element child' +
                                        ' by attribute: ' + attrName)) : 0;
                }

                return false;
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstElementChildByTagName',
function(aNode, aTagName, aNamespaceURI) {

    /**
     * @method nodeGetFirstElementChildByTagName
     * @summary Returns the first element descendant of aNode which matches the
     *     name and optional namespace URI provided. This is a commonly used
     *     method in widget construction where the outer widget is looking for
     *     specific parts of its content.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aTagName The string tagname to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @example Get the first child Element node of an XML element that has a
     *     tag name of 'bar' which has a namespace of
     *     'http://www.w3.org/2002/xforms':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar/><xf:bar xmlns="http://www.bar.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms"></xf:bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          aNode = TP.nodeGetFirstElementChildByTagName(
     *          xmlDoc.documentElement,
     *          'bar',
     *          'http://www.w3.org/2002/xforms');
     *          <samp>[object Element]</samp>
     *          // Get the string value to see what we have.
     *          TP.str(aNode);
     *          // Note here how it's 'xf:bar' that is returned, not
     *          // 'bar' because 'bar' has no namespace associated with
     *          // it, and we specified 'http://www.w3.org/2002/xforms'
     *          // with our query.
     *          <samp>&lt;xf:bar xmlns="http://www.bar.com"
     *         xmlns:xf="http://www.w3.org/2002/xforms"/&gt;</samp>
     *     </code>
     * @example Get the first child Element node of an HTML element that has a
     *     tag name of 'body':
     *     <code>
     *          TP.nodeGetFirstElementChildByTagName(
     *          document.documentElement,
     *          'body');
     *          <samp>[object HTMLBodyElement]</samp>
     *     </code>
     * @returns {Element} An element descendant of the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    var tagName,
        matcher;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.isEmpty(aTagName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    //  qname returns lowercase tags for HTML (xhtml style)
    if (TP.isHTMLNode(aNode)) {
        tagName = aTagName.toLowerCase();
    } else {
        tagName = aTagName;
    }

    matcher = TP.getQNameRegex(tagName);

    return TP.nodeDetectChildElement(
            aNode,
            function(elem) {

                if (TP.isString(aNamespaceURI)) {
                    if (TP.nodeGetNSURI(elem) !== aNamespaceURI) {
                        return false;
                    }
                }

                return matcher.test(TP.qname(elem));
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstChildByType',
function(aNode, aType) {

    /**
     * @method nodeGetFirstChildByType
     * @summary Returns the first child of aNode which has a nodeType matching
     *     the type provided.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Number} aType A Node.nodeType constant.
     * @example Get the first child Text node of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar>Some text<goo>More
     *         text</goo></bar>Yet more text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeGetFirstChildByType(
     *          xmlDoc.documentElement,
     *          Node.TEXT_NODE);
     *          <samp>[object Text]</samp>
     *          TP.str(result);
     *          <samp>Yet more text</samp>
     *     </code>
     * @example Get the first child Text node of an HTML element:
     *     <code>
     *          TP.nodeGetFirstChildByType(
     *          TP.documentGetBody(document),
     *          Node.TEXT_NODE);
     *          <samp>(the first child text node of the body element)</samp>
     *     </code>
     * @returns {Node} A child of the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidParameter Raised when an invalid node type is
     *     provided to the method.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.notValid(aType)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    return TP.nodeDetectChildNode(
            aNode,
            function(node) {

                return node.nodeType === aType;
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstChildContentNode',
function(aNode) {

    /**
     * @method nodeGetFirstChildContentNode
     * @summary Returns the first "content" child of aNode, the first text or
     *     CDATA child node.
     * @param {Node} aNode The DOM node to operate on.
     * @example Get the first child text or cdata node of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar>Some text<goo>More
     *         text</goo></bar>Yet more text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeGetFirstChildContentNode(
     *          xmlDoc.documentElement);
     *          <samp>Yet more text</samp>
     *     </code>
     * @returns {Node.TEXT_NODE|Node.CDATA_SECTION_NODE} A child of the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var children,
        len,
        i,
        type;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  NB: We can't use '.children' here - need *all* types of child nodes.
    children = aNode.childNodes;
    len = children.length;

    for (i = 0; i < len; i++) {
        type = children[i].nodeType;
        if (type === Node.TEXT_NODE || type === Node.CDATA_SECTION_NODE) {
            return children[i];
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstChildElement',
function(aNode) {

    /**
     * @method nodeGetFirstChildElement
     * @summary Returns the first element child of aNode. If there is no first
     *     element child for the node provided this method returns null.
     * @description This method is a common replacement for node.firstChild
     *     which ensures that text nodes, comment nodes, and other node types
     *     don't break your code when you're assuming element nodes.
     * @param {Node} aNode The DOM node to operate on.
     * @example Get the first child Element node of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar>Some text<goo>More
     *         text</goo></bar>Yet more text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeGetFirstChildElement(
     *          xmlDoc.documentElement);
     *          <samp>[object Element]</samp>
     *          TP.str(result);
     *          <samp>&lt;bar&gt;Some text&lt;goo&gt;More
     *         text&lt;/goo&gt;&lt;/bar&gt;</samp>
     *     </code>
     * @example Get the first child Element node of an HTML element:
     *     <code>
     *          TP.nodeGetFirstChildElement(
     *          document.documentElement);
     *          <samp>[object HTMLHeadElement]</samp>
     *     </code>
     * @returns {Element} An element child of the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var child;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  In IE (and browsers that implement the Element Traversal
    //  specification), HTML elements have a convenience property called
    //  'children' that contains *only elements*, not all child nodes as the
    //  W3C property 'childNodes' does (and therefore doesn't require the
    //  looping behavior below).
    if (TP.isValid(aNode.children)) {
        return aNode.children[0];
    }

    child = aNode.firstChild;
    while (child) {
        if (TP.isElement(child)) {
            return child;
        }

        child = child.nextSibling;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstDescendantByType',
function(aNode, aType) {

    /**
     * @method nodeGetFirstDescendantByType
     * @summary Returns the first descendant of aNode which has a nodeType
     *     matching the type provided.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Number} aType A Node.nodeType constant.
     * @example Get the first descendant Text node of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar>Some text<goo>More
     *         text</goo></bar>Yet more text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          aNode = TP.nodeGetFirstDescendantByType(
     *          xmlDoc.documentElement,
     *          Node.TEXT_NODE);
     *          <samp>[object Text]</samp>
     *          // Get the string value to see what we have.
     *          TP.str(aNode);
     *          // Note that its 'Yet more text' since this is the
     *          // *most direct* descendant of the document's
     *          // documentElement.
     *          <samp>Yet more text</samp>
     *     </code>
     * @example Get the first descendant Text node of an HTML element:
     *     <code>
     *          aNode = TP.nodeGetFirstDescendantByType(
     *          TP.documentGetBody(document),
     *          Node.TEXT_NODE);
     *          <samp>[object Text]</samp>
     *          // Get the string value to see what we have.
     *          TP.str(aNode);
     *          <samp>(the text of the first Text node under the body
     *          element)</samp>
     *     </code>
     * @returns {Node} A descendant of the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidParameter Raised when an invalid node type is
     *     provided to the method.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.notValid(aType)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    return TP.nodeDetectDescendant(
            aNode,
            function(node) {

                return node.nodeType === aType;
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstElementByAttribute',
function(aNode, attrName, attrValue) {

    /**
     * @method nodeGetFirstElementByAttribute
     * @summary Returns the first element descendant of aNode which has an
     *     attribute matching attrName and whose value matches the optional
     *     attrValue provided.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} attrName The attribute to test for.
     * @param {Object} attrValue The attribute value to check.
     * @example Get the first descendant Element node of an XML element that has
     *     an attribute 'goo' which has a value of 'moo':
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar><goo baz="goo">More
     *         text</goo></bar><boo baz="goo">Yet more text</boo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          aNode = TP.nodeGetFirstElementByAttribute(
     *          xmlDoc.documentElement,
     *          'baz',
     *          'goo');
     *          <samp>[object Element]</samp>
     *          // Get the string value to see what we have.
     *          TP.str(aNode);
     *          // Note here how it's 'boo' that is returned, not 'goo'
     *          // because 'boo' is a (direct) child and 'goo' isn't
     *          // (its a descendant, but not a direct child).
     *          <samp>&lt;boo baz="goo"&gt;Yet more text&lt;boo&gt;</samp>
     *     </code>
     * @example Get the first descendant Element node of an HTML element that
     *     has an attribute 'style' which has any value:
     *     <code>
     *          TP.nodeGetFirstElementByAttribute(
     *          document.documentElement,
     *          'style');
     *          // Assuming the 'body' element has a style...
     *          <samp>[object HTMLBodyElement]</samp>
     *     </code>
     * @returns {Element} An element descendant of the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.isEmpty(attrName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    return TP.nodeDetectDescendantElement(
            aNode,
            function(elem) {

                var matcher,
                    attrs,
                    len,
                    i;

                //  We put try...catch around this because IE will sometimes
                //  throw exceptions...
                try {
                    if (TP.regex.IS_NAMEXP.test(attrName)) {
                        matcher = TP.getQNameRegex(attrName);

                        attrs = elem.attributes;
                        len = attrs.length;

                        for (i = 0; i < len; i++) {
                            //  find the name
                            if (matcher.test(attrs[i].name)) {
                                //  check the value as needed
                                if (TP.isValid(attrValue)) {
                                    if (!TP.match(attrValue, attrs[i].value)) {
                                        continue;
                                    }
                                }

                                return true;
                            }
                        }
                    } else {
                        //  without a value we can go by existence alone
                        //  which should be a little faster
                        if (TP.notValid(attrValue)) {
                            if (TP.elementHasAttribute(elem, attrName)) {
                                return true;
                            }
                        } else if (TP.match(
                                    attrValue,
                                    TP.elementGetAttribute(elem, attrName))) {
                            return true;
                        }
                    }
                } catch (e) {
                    TP.ifError() ?
                        TP.error(
                            TP.ec(e, 'Error getting first element' +
                                        ' by attribute: ' + attrName)) : 0;
                }

                return false;
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstElementByTagName',
function(aNode, aTagName, aNamespaceURI) {

    /**
     * @method nodeGetFirstElementByTagName
     * @summary Returns the first element descendant of aNode which matches the
     *     name and optional namespace URI provided.
     * @description This is a commonly used method in widget construction where
     *     the outer widget is looking for specific parts of its content.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aTagName The string tagname to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @example Get the first descendant Element node of an XML element that has
     *     a tag name of 'bar' which has a namespace of
     *     'http://www.w3.org/2002/xforms':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><baz><xf:bar
     *         xmlns="http://www.bar.com"
     *
     *         xmlns:xf="http://www.w3.org/2002/xforms"></xf:bar><bar/></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          aNode = TP.nodeGetFirstElementByTagName(
     *          xmlDoc,
     *          'bar',
     *          'http://www.foo.com');
     *          <samp>[object Element]</samp>
     *          // Get the string value to see what we have.
     *          TP.str(aNode);
     *          // Note here how it's 'bar' that is returned, not
     *          // 'xf:bar' because 'bar' has the 'http://www.foo.com'
     *          // default namespace associated with it, and we
     *          // specified 'http://www.foo.com' with our query.
     *          <samp>&lt;bar xmlns="http://www.foo.com"/&gt;</samp>
     *     </code>
     * @example Get the first descendant Element node of an HTML element that
     *     has a tag name of 'body':
     *     <code>
     *          TP.nodeGetFirstElementByTagName(
     *          document,
     *          'body');
     *          <samp>[object HTMLBodyElement]</samp>
     *     </code>
     * @returns {Element} An element descendant of the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied tag name is empty.
     */

    var tagName,
        list,
        matcher;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (TP.isEmpty(aTagName)) {
        return TP.raise(this, 'TP.sig.InvalidName');
    }

    //  qname returns lowercase tags for HTML (xhtml style)
    if (TP.isHTMLNode(aNode)) {
        tagName = aTagName.toLowerCase();
    } else {
        tagName = aTagName;
    }

    if (TP.notEmpty(aNamespaceURI) &&
            TP.canInvoke(aNode, 'getElementsByTagNameNS')) {
        list = aNode.getElementsByTagNameNS(aNamespaceURI,
            tagName.split(':').first());
        return list[0];
    }

    matcher = TP.getQNameRegex(tagName);

    return TP.nodeDetectDescendantElement(
            aNode,
            function(elem) {

                if (TP.isString(aNamespaceURI)) {
                    if (TP.nodeGetNSURI(elem) !== aNamespaceURI) {
                        return false;
                    }
                }

                return matcher.test(TP.qname(elem));
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetFirstSiblingElement',
function(aNode, direction) {

    /**
     * @method nodeGetFirstSiblingElement
     * @summary Returns the next, or previous sibling of aNode which is an
     *     element. This is a useful operation when trying to iterate over only
     *     elements within a particular set of nodes.
     * @param {Node} aNode The node to start the search from.
     * @param {String} direction TP.NEXT or TP.PREVIOUS. The default is TP.NEXT
     *     so searching is forward.
     * @returns {Element} A native element.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided.
     */

    var dir,
        sibProp,
        theNode;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    dir = TP.ifInvalid(direction, TP.NEXT);

    if (dir === TP.NEXT) {
        if (TP.isElement(aNode.nextElementSibling)) {
            return aNode.nextElementSibling;
        }
    } else {
        if (TP.isElement(aNode.previousElementSibling)) {
            return aNode.previousElementSibling;
        }
    }

    sibProp = dir === TP.NEXT ? 'nextSibling' : 'previousSibling';

    theNode = aNode[sibProp];
    while (TP.isValid(theNode) && !TP.isElement(theNode)) {
        theNode = theNode[sibProp];
    }

    return theNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetNextNonChild',
function(aNode, nodeType) {

    /**
     * @method nodeGetNextNonChild
     * @summary Returns the next node in document order that isn't a child of
     *     the node provided. This will often be the node's nextSibling, but it
     *     may be a different node when aNode has no nextSibling. Note that the
     *     last node in document order won't return a valid node here.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Number} nodeType A valid nodeType constant. Defaults to any node
     *     type.
     * @example Get the next non-child element for the <baz> element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><baz/><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetNextNonChild(
     *          xmlDoc.documentElement.childNodes[0]);
     *          <samp><bar/></samp>
     *     </code>
     * @returns {Node} The next node in document order.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided.
     */

    var next,
        ancestor;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    next = aNode.nextSibling;
    while (next) {
        if (TP.notValid(nodeType) || next.nodeType === nodeType) {
            return next;
        }

        next = next.nextSibling;
    }

    //  node is last in its parent's list of children. have to start working
    //  upward until we find an ancestor with a nextSibling
    ancestor = aNode.parentNode;
    while (ancestor && TP.isElement(ancestor)) {
        next = ancestor.nextSibling;

        while (next) {
            if (TP.notValid(nodeType) || next.nodeType === nodeType) {
                return next;
            }

            next = next.nextSibling;
        }

        ancestor = ancestor.parentNode;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetSiblings',
function(aNode, aSubset) {

    /**
     * @method nodeGetSiblings
     * @summary Returns an Array containing the sibling nodes of the node
     *     provided.
     * @description Order is from the parent's first child to the parent's last
     *     child, with aNode removed from the list. Unlike other methods for
     *     node collections this method does *not* normalize content, so a text
     *     node's siblings will be found when multiple text nodes were created
     *     by the browser. This means that that sibling list won't be consistent
     *     for all node types across browsers.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @example Get an XML node's list of all of its sibling nodes:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar/><baz/><boo/><goo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Get the siblings of the 'baz' element
     *          result = TP.nodeGetSiblings(
     *          xmlDoc.documentElement.childNodes[1]);
     *          <samp>[object Element], [object Element], [object
     *         Element]</samp>
     *          // Get the local name of each node of the result to see what we
     *         have.
     *          result.collect(function(aNode) {return
     *         TP.elementGetLocalName(aNode)});
     *          <samp>bar, boo, goo</samp>
     *     </code>
     * @example Get an XML node's list of only its 'previous' sibling nodes:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar/><baz/><boo/><goo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Get the previous siblings of the 'baz' element
     *          result = TP.nodeGetSiblings(
     *          xmlDoc.documentElement.childNodes[1],
     *          TP.PREVIOUS);
     *          <samp>[object Element]</samp>
     *          // Get the local name of each node of the result to see what we
     *         have.
     *          result.collect(function(aNode) {return
     *         TP.elementGetLocalName(aNode)});
     *          <samp>bar</samp>
     *     </code>
     * @example Get an XML node's list of only its 'next' sibling nodes:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar/><baz/><boo/><goo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Get the next siblings of the 'baz' element
     *          result = TP.nodeGetSiblings(
     *          xmlDoc.documentElement.childNodes[1],
     *          TP.NEXT);
     *          <samp>[object Element], [object Element]</samp>
     *          // Get the local name of each node of the result to see what we
     *         have.
     *          result.collect(function(aNode) {return
     *         TP.elementGetLocalName(aNode)});
     *          <samp>boo, goo</samp>
     *     </code>
     * @example Get an HTML node's list of all of its sibling nodes:
     *     <code>
     *          // Get the siblings of the 'body' element
     *          TP.nodeGetSiblings(TP.documentGetBody(document));
     *          <samp>[object HTMLHeadElement]</samp>
     *     </code>
     * @returns {Node[]} An Array containing the nodes found.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var arr,
        node,

        ancestor,
        siblings,
        len,
        i;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    arr = TP.ac();

    switch (aSubset) {
        case TP.PREVIOUS:

            node = aNode.previousSibling;
            while (node) {
                arr.push(node);
                node = node.previousSibling;
            }

            //  Because we collected the previous siblings by walking backwards
            //  and the description of this method is that we always return
            //  results from first to last child, we need to reverse the results
            //  here.
            arr.reverse();

            break;

        case TP.NEXT:

            node = aNode.nextSibling;
            while (node) {
                arr.push(node);
                node = node.nextSibling;
            }
            break;

        default:

            ancestor = aNode.parentNode;
            if (TP.isElement(ancestor)) {
                siblings = ancestor.childNodes;
                len = siblings.length;

                //  aSubset was null, so collect everything but the node
                //  itself
                for (i = 0; i < len; i++) {
                    node = siblings[i];
                    if (node === aNode) {
                        continue;
                    }

                    arr.push(node);
                }
            }

            break;
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetTopAncestor',
function(aNode) {

    /**
     * @method nodeGetTopAncestor
     * @summary Returns the top-most node in aNode's ancestor chain. This is
     *     typically a Document node (#document) but will be an Element or the
     *     node itself if the node is in a detached tree branch.
     * @param {Node} aNode The DOM node to operate on.
     * @returns {Node} The topmost node.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var ancestor;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    ancestor = aNode.parentNode;
    if (TP.notValid(ancestor)) {
        return aNode;
    }

    while (TP.isElement(ancestor)) {
        if (TP.notValid(ancestor.parentNode)) {
            return ancestor;
        }

        ancestor = ancestor.parentNode;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeImportNode',
function(aNode, otherNode) {

    /**
     * @method nodeImportNode
     * @summary Imports the other node into the document of the supplied node
           if it doesn't already belong to that document.
     * @param {Node} aNode The node to obtain the document to import the
     *     otherNode to.
     * @param {Node} otherNode The node to import into the document of aNode
     *     if necessary.
     * @exception TP.sig.InvalidNode
     * @returns {Node} The other node. This may be a different node than what
           was supplied to this routine, if it was imported.
     */

    var nodeDoc,
        theNode,

        prefix,

        children,
        len,
        i;

    if (!TP.isNode(aNode) || !TP.isNode(otherNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  Grab aNode's document and check to see if otherNode is in the same
    //  document. If not, call the native 'importNode' routine.
    nodeDoc = TP.nodeGetDocument(aNode);

    if (nodeDoc !== TP.nodeGetDocument(otherNode)) {
        theNode = nodeDoc.importNode(otherNode, true);

        //  Copy any TIBET expandos to the imported node.
        TP.nodeCopyTIBETExpandos(otherNode, theNode, false);
    } else {
        theNode = otherNode;
    }

    //  If aNode is an XML node, do some namespace normalization. If aNode and
    //  theNode have the same namespace URI, then remove the 'xmlns' attribute
    //  (or 'xmlns:<prefix>' attribute where prefix matches the node's prefix -
    //  but *NOT* other 'xmlns:<prefix>' attributes - other nodes may need
    //  them). This is to avoid multiple namespace nodes showing up during
    //  serialization, which just makes things messy.
    if (TP.isXMLNode(aNode)) {
        if (TP.isElement(theNode)) {
            //  If the namespaceURIs are the same, then 'theNode' doesn't need
            //  to redefine the same namespace, so we can remove the namespace
            //  node defining that namespace (if there is one).
            if (aNode.namespaceURI === theNode.namespaceURI) {
                //  use the prefix that was defined for the element, if there is
                //  one.
                if (TP.notEmpty(prefix = theNode.prefix)) {
                    theNode.removeAttributeNS(TP.w3.Xmlns.XMLNS,
                                                'xmlns:' + prefix);
                } else {
                    //  Otherwise, just remove the default namespace 'xmlns'
                    //  one.
                    theNode.removeAttributeNS(TP.w3.Xmlns.XMLNS,
                                                'xmlns');
                }
            }
        } else if (TP.isFragment(theNode)) {
            //  theNode is a fragment. We need to do this process, but one by
            //  one through the fragment's child elements.

            children = TP.nodeGetChildElements(theNode);
            len = children.length;

            for (i = 0; i < len; i++) {
                if (aNode.namespaceURI === children[i].namespaceURI) {
                    if (TP.notEmpty(prefix = children[i].prefix)) {
                        children[i].removeAttributeNS(
                                TP.w3.Xmlns.XMLNS, 'xmlns:' + prefix);
                    } else {
                        children[i].removeAttributeNS(
                                TP.w3.Xmlns.XMLNS, 'xmlns');
                    }
                }
            }
        }
    }

    return theNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSwapNode',
function(firstNode, secondNode) {

    /**
     * @method nodeSwapNode
     * @summary Swaps the first node into the place where the second node is
     *     and vice versa. Note that both Nodes supplied to this method must be
     *     contained in the same overall Document.
     * @param {Node} firstNode The first node to swap.
     * @param {Node} secondNode The second node to swap.
     * @example Swap two nodes in an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo><bar/><baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSwapNode(xmlDoc.documentElement.firstChild,
     *          xmlDoc.documentElement.childNodes[1]);
     *          <samp>undefined</samp>
     *          TP.nodeAsString(xmlDoc);
     *          <samp>&lt;foo&gt;&lt;baz/&gt;&lt;bar/&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when either node is an invalid node
     *     or when the nodes are not contained in the same overall Document.
     */

    var insertionPoint,
        parentNode;

    if (!TP.isNode(firstNode) ||
        !TP.isNode(secondNode) ||
        TP.nodeGetDocument(firstNode) !== TP.nodeGetDocument(secondNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    insertionPoint = firstNode.nextSibling;

    //  If the insertion point is the same node as the secondNode, then set the
    //  insertion point to be the firstNode (we're switching places between two
    //  adjacent nodes).
    if (insertionPoint === secondNode) {
        insertionPoint = firstNode;
    }

    parentNode = firstNode.parentNode;

    //  Note here how we force awakening to 'false' in case we're dealing with
    //  HTML nodes here.

    TP.nodeReplaceChild(secondNode.parentNode,
                        firstNode,
                        secondNode,
                        false);

    TP.nodeInsertBefore(parentNode, secondNode, insertionPoint, false);

    return;
});

//  ------------------------------------------------------------------------
//  NODE COLLECTIONS
//  ------------------------------------------------------------------------

TP.definePrimitive('nodesGetRoots',
function(aNodeArray, shouldSort) {

    /**
     * @method nodesGetRoots
     * @summary Returns an Array containing all of the roots of the provided
     *     Array of nodes.
     * @description This method finds all of the 'roots' in the supplied Array.
     *     These are the nodes for which there is no ancestor *in the supplied
     *     Array* (they very well may have an ancestor, but it's not included in
     *     the Array.
     * @param {Node[]} aNodeArray The DOM nodes to operate on.
     * @param {Boolean} [shouldSort=false] Whether or not to sort the supplied
     *     nodes into 'document order'. This flag is defaulted to false, since
     *     most queries (XPath, CSS, etc.) will return 'document order' results
     *     and those are then likely supplied to this method. If this flag is
     *     true, then a sort is performed using the TP.sort.DOCUMENT_ORDER sort.
     * @returns {Node[]} An Array of the root nodes of the supplied nodes
     * @exception TP.sig.InvalidArray Raised when an invalid Array is provided
     *     to the method.
     */

    var nodes,
        arr;

    if (!TP.isArray(aNodeArray)) {
        return TP.raise(this, 'TP.sig.InvalidArray');
    }

    if (TP.isTrue(shouldSort)) {
        nodes = aNodeArray.sort(TP.sort.DOCUMENT_ORDER);
    } else {
        nodes = aNodeArray;
    }

    arr = TP.ac();

    nodes.forEach(
        function(foundNode) {

            var i,
                len;

            len = arr.getSize();
            for (i = 0; i < len; i++) {
                if (TP.nodeComparePosition(
                            foundNode, arr.at(i), TP.CONTAINS_NODE)) {
                    return;
                }
            }

            arr.push(foundNode);
        });

    return arr;
});

//  ------------------------------------------------------------------------
//  NODE TRAVERSAL
//  ------------------------------------------------------------------------

/*
Core DOM traversal routines. These allow us to walk the DOM efficiently in
either breath-first or depth-first fashion, performing operations at each
step and filtering for elements vs. content nodes as we go.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeBreadthTraversal',
function(aNode, enterFunc, exitFunc, contentFunc, includeRoot) {

    /**
     * @method nodeBreadthTraversal
     * @summary Traverses a node in a breadth-first fashion invoking any enter,
     *     exit, or content functions provided. The enter and pop functions are
     *     invoked for each structural (element) node while the content function
     *     is invoked for all non-element nodes regardless of their type.
     * @description When traversing in a breadth-first manner the semantics of
     *     the DOM are shifted slightly from the true structural nature of the
     *     tree. In particular, as each element is entered the enter function is
     *     invoked. The content function is then invoked for any non-element
     *     children of the node. Finally the exit function for the element is
     *     invoked. This has the effect of treating non-element child nodes as
     *     if they were at the same "level" of the tree as the element itself.
     *     This seems appropriate, particularly when you consider leaf node
     *     processing.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} enterFunc The function that is called when a Node is
     *     entered (becomes the currently processing element). Note this
     *     function is only called for Nodes of type Node.ELEMENT_NODE.
     * @param {Function} exitFunc The function that is called when a Node is
     *     exited (ceases to be the currently processing element). Note this
     *     function is only called for Nodes of type Node.ELEMENT_NODE.
     * @param {Function} contentFunc The function that is called when a Node's
     *     content is encountered. Note that this function is *not* called for
     *     Nodes of type Node.ELEMENT_NODE.
     * @param {Boolean} includeRoot True to include an enter/exit sequence on
     *     the initial element.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var doRoot,
        list,
        outer,
        i,
        currentNode,
        newNode,
        terminal,
        rootNode,
        ret,
        j,
        inner,
        innerChild,
        count,
        max,
        repcount,
        repmax;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  define our starting point, the initial element we'll process
    doRoot = TP.ifInvalid(includeRoot, true);

    //  if the root is part of the process we'll push it onto the front of
    //  the list
    if (doRoot) {
        list = TP.ac();
        list.push(TP.ac(aNode));
    } else {
        //  start with the list of child nodes. we'll be adding to this as
        //  we traverse and we'll keep going until we run out of nodes
        list = TP.ac();
        list.push(aNode.childNodes);
    }

    count = 0;
    max = TP.sys.cfg('content.max_traversal');
    repmax = TP.sys.cfg('content.max_replace');

    //  regardless of whether we're processing the root element itself or
    //  not we terminate when we complete processing back to that node.
    terminal = aNode;
    rootNode = TP.nodeGetTopAncestor(terminal);

    /* eslint-disable no-labels */

    //  Each entry in the list is either an array (when it's the root entry)
    //  or a nodelist, so "outer" is something we have to iterate over.

    /* eslint-disable no-extra-parens */
    while ((outer = list.shift())) {
    /* eslint-enable no-extra-parens */

        //  NOTE the iteration here does NOT cache length so the list can be
        //  modified as we work

        out:

        for (i = 0; i < outer.length; i++) {
            currentNode = outer[i];

            if (TP.isElement(currentNode)) {
                count += 1;
                if (count > max) {
                    TP.ifWarn() ?
                        TP.warn('Traversal terminated at' +
                                    ' content.max_traversal elements.') : 0;

                    break;
                }

                if (enterFunc) {
                    repcount = 0;
                    while (repcount < repmax &&
                        (TP.isNode(ret = enterFunc(currentNode)) ||
                        TP.isArray(ret))) {
                        //  update return values when we got back an array
                        if (TP.isArray(ret)) {
                            newNode = ret.at(0);
                            ret = ret.at(1);
                        } else {
                            newNode = ret;
                        }

                        //  if newNode isn't a node (it's TP.BREAK etc) or
                        //  if the same node was returned we're done, just
                        //  break out of the while so we can move forward.
                        if (!TP.isNode(newNode) ||
                            newNode === currentNode) {
                            break;
                        }

                        //  allow for root of traversal to be replaced as
                        //  well
                        if (currentNode === terminal) {
                            terminal = newNode;
                        }

                        currentNode = newNode;

                        if (ret === TP.BREAK ||
                            ret === TP.CONTINUE ||
                            ret === TP.DESCEND) {
                            break;
                        }

                        repcount += 1;
                    }

                    if (ret !== TP.BREAK &&
                        ret !== TP.CONTINUE &&
                        ret !== TP.DESCEND &&
                        TP.nodeIsDetached(currentNode, rootNode)) {
                        TP.ifWarn() && TP.sys.cfg('log.node_detachment') ?
                            TP.warn('Traversal node detached: ' +
                                        TP.str(currentNode, false)) : 0;

                        return;
                    }

                    if (ret === TP.BREAK) {
                        break;
                    } else if (ret === TP.CONTINUE) {
                        //  continue means close this element and move to
                        //  the next one
                        if (exitFunc) {
                            ret = exitFunc(currentNode);
                            if (ret === TP.BREAK) {
                                break;
                            }
                        }

                        continue;
                    }
                }

                if (contentFunc) {
                    inner = currentNode.childNodes;
                    for (j = 0; j < inner.length; j++) {
                        innerChild = inner[j];
                        if (!TP.isElement(innerChild)) {
                            ret = contentFunc(innerChild);
                            if (ret === TP.BREAK) {
                                break out;  //  terminate entirely
                            } else if (ret === TP.CONTINUE) {
                                //  break inner for loop and allow the
                                //  exitFunc to run on this node
                                break;
                            }
                        }
                    }
                }

                if (exitFunc) {
                    ret = exitFunc(currentNode);
                    if (ret === TP.BREAK) {
                        break;
                    } else if (ret === TP.CONTINUE) {
                        continue;
                    }
                }

                //  add this node's children so we'll loop over them, but
                //  again do NOT put them into an array, leave them in a
                //  native nodelist so they content will flex with changes
                //  in the tree structure which might occur
                list.push(currentNode.childNodes);
            }
        }
    }

    /* eslint-enable no-labels */

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDepthTraversal',
function(aNode, enterFunc, exitFunc, contentFunc, includeRoot) {

    /**
     * @method nodeDepthTraversal
     * @summary Traverses a node in a depth-first, document order fashion
     *     (without using recursion) and invokes any push, pop, or content
     *     function provided. The push and pop functions are invoked for each
     *     structural (element) node while the content function is invoked for
     *     all non-element nodes.
     * @description To have an operation affect every node you'll need to supply
     *     that function to the content function and one of the other two
     *     functions (push or pop) based on your traversal needs. NOTE that
     *     while all functions can return TP.BREAK to terminate the traversal,
     *     enterFunc can also return TP.CONTINUE to allow you to skip child
     *     content under an element and proceed to the next non-child element
     *     node for processing or TP.DESCEND to descend into child element
     *     content.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} enterFunc The function that is called when a Node is
     *     entered (becomes the currently processing element). Note this
     *     function is only called for Nodes of type Node.ELEMENT_NODE.
     * @param {Function} exitFunc The function that is called when a Node is
     *     exited (ceases to be the currently processing element). Note this
     *     function is only called for Nodes of type Node.ELEMENT_NODE.
     * @param {Function} contentFunc The function that is called when a Node's
     *     content is encountered. Note that this function is *not* called for
     *     Nodes of type Node.ELEMENT_NODE.
     * @param {Boolean} includeRoot True to include an enter/exit sequence on
     *     the initial element.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var doRoot,
        currentNode,
        newNode,
        ancestor,
        ret,
        next,
        terminal,
        rootNode,
        count,
        max,
        repcount,
        repmax;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  define our starting point, the initial element we'll process
    doRoot = TP.ifInvalid(includeRoot, true);

    if (doRoot && TP.isElement(aNode)) {
        currentNode = aNode;
    } else if (TP.isDocument(aNode)) {
        //  condense multiple text node children
        TP.nodeNormalize(aNode.documentElement);

        //  NB: We use 'firstChild', not 'documentElement' here, since we
        //  might have XML PI's that are children of the document, but are
        //  not under the root (i.e. 'documentElement') element.
        currentNode = aNode.firstChild;
    } else {
        currentNode = aNode.firstChild;
    }

    //  no node? no work
    if (TP.notValid(currentNode)) {
        return;
    }

    //  regardless of whether we're processing the root element itself or
    //  not we terminate when we complete processing back to that node.
    terminal = aNode;
    rootNode = TP.nodeGetTopAncestor(terminal);

    count = 0;
    max = TP.sys.cfg('content.max_traversal');
    repmax = TP.sys.cfg('content.max_replace');

    do {
        //  element nodes have enter/exit logic applied to them, while text
        //  nodes etc. have only content logic applied to them.
        if (TP.isElement(currentNode)) {
            count += 1;
            if (count > max) {
                TP.ifWarn() ?
                    TP.warn('Traversal terminated at' +
                                ' content.max_traversal elements.') : 0;

                break;
            }

            if (enterFunc) {
                repcount = 0;
                while (repcount < repmax &&
                        (TP.isNode(ret = enterFunc(currentNode)) ||
                        TP.isArray(ret))) {
                    //  update return values when we got back an array
                    if (TP.isArray(ret)) {
                        newNode = ret.at(0);
                        ret = ret.at(1);
                    } else {
                        newNode = ret;
                    }

                    //  if newNode isn't a node (it's TP.BREAK etc) or if
                    //  the same node was returned we're done, just break
                    //  out of the while so we can move forward.
                    if (!TP.isNode(newNode) || newNode === currentNode) {
                        break;
                    }

                    //  allow for root of traversal to be replaced as well
                    if (currentNode === terminal) {
                        terminal = newNode;
                    }

                    currentNode = newNode;

                    if (ret === TP.BREAK ||
                        ret === TP.CONTINUE ||
                        ret === TP.REPEAT ||
                        ret === TP.DESCEND) {
                        break;
                    }

                    repcount += 1;
                }

                if (ret !== TP.BREAK &&
                    ret !== TP.CONTINUE &&
                    ret !== TP.REPEAT &&
                    ret !== TP.DESCEND &&
                    TP.nodeIsDetached(currentNode, rootNode)) {
                    TP.ifWarn() && TP.sys.cfg('log.node_detachment') ?
                        TP.warn('Traversal node detached: ' +
                                    TP.str(currentNode, false)) : 0;

                    return;
                }

                if (ret === TP.BREAK) {
                    return;
                } else if (ret === TP.REPEAT) {
                    continue;
                } else if (ret === TP.CONTINUE) {
                    //  continue means skip remaining content for this node
                    //  and move to the next element at this level or higher
                    if (exitFunc) {
                        ret = exitFunc(currentNode);
                        if (ret === TP.BREAK) {
                            return;
                        }
                    }

                    if (currentNode === terminal) {
                        return;
                    }

                    if (TP.notValid(next = currentNode.nextSibling)) {
                        //  out of siblings, next unvisited element
                        //  will be up the chain somewhere
                        ancestor = currentNode.parentNode;
                        while (TP.isElement(ancestor)) {
                            if (exitFunc) {
                                ret = exitFunc(ancestor);
                                if (ret === TP.BREAK) {
                                    return;
                                }
                            }

                            if (ancestor === terminal) {
                                return;
                            }

                            if (TP.isNode(next = ancestor.nextSibling)) {
                                break;
                            }

                            ancestor = ancestor.parentNode;
                        }

                        if (TP.notValid(ancestor)) {
                            return;
                        }
                    }

                    //  now that we know what element is next we can
                    //  finally trigger the continue operation
                    currentNode = next;
                    continue;
                } else if (ret === TP.DESCEND) {
                    //  skip cycles on returned node, descend into
                    //  children by dropping out of here without a
                    //  return or continue call.
                    void 0;
                } else if (TP.isValid(ret)) {
                    TP.ifWarn() ?
                        TP.warn('Unrecognized traversal return value: ' +
                            ret) : 0;
                }
            }

            //  if the enterFunc didn't trigger a TP.BREAK or TP.CONTINUE
            //  condition then we want to continue our descent/traversal as
            //  long as there's a "down" from here
            if (currentNode.childNodes.length === 0) {
                //  no children means this node is done, so exit cleanly
                if (exitFunc) {
                    ret = exitFunc(currentNode);
                    if (ret === TP.BREAK) {
                        return;
                    }
                }

                if (currentNode === terminal) {
                    return;
                }

                //  if we have a sibling then that's our next position,
                //  otherwise we've got to search up and "right"
                if (TP.notValid(next = currentNode.nextSibling)) {
                    //  out of siblings, next unvisited element will be up
                    //  the chain somewhere
                    ancestor = currentNode.parentNode;
                    while (TP.isElement(ancestor)) {
                        if (exitFunc) {
                            ret = exitFunc(ancestor);
                            if (ret === TP.BREAK) {
                                return;
                            }
                        }

                        if (ancestor === terminal) {
                            return;
                        }

                        if (TP.isNode(next = ancestor.nextSibling)) {
                            break;
                        }

                        ancestor = ancestor.parentNode;
                    }

                    if (TP.notValid(ancestor)) {
                        return;
                    }
                }

                currentNode = next;
                continue;
            } else {
                //  at least one child, next node is our first child then
                //  (since we're working depth-first)
                currentNode = currentNode.firstChild;
            }
        } else {
            if (contentFunc) {
                //  we're looking at a text, comment, processing
                //  instruction or similar node.
                ret = contentFunc(currentNode);
                if (ret === TP.BREAK) {
                    return;
                } else if (ret === TP.CONTINUE) {
                    //  terminate processing our parent's content and move
                    //  on
                    ancestor = currentNode.parentNode;

                    //  if currentNode's ancestor is not an Element, then
                    //  its probably the Document, which means that
                    //  currentNode is probably a Processing Instruction
                    //  (otherwise, since we're in the contentFunc, it would
                    //  have to be an Element).
                    if (TP.isElement(ancestor)) {
                        while (TP.isElement(ancestor)) {
                            if (exitFunc) {
                                ret = exitFunc(ancestor);
                                if (ret === TP.BREAK) {
                                    return;
                                }
                            }

                            if (ancestor === terminal) {
                                return;
                            }

                            if (TP.isNode(next = ancestor.nextSibling)) {
                                break;
                            }

                            ancestor = ancestor.parentNode;
                        }

                        if (TP.notValid(ancestor)) {
                            return;
                        }

                        currentNode = next;

                        //  continue to the next node in the top-level
                        //  do...while
                        continue;
                    }
                } else if (TP.isNode(ret)) {
                    //  the contentFunc specified the node to traverse to
                    //  next
                    currentNode = ret;

                    continue;
                }
            }

            //  normal processing, just move to the next node in line
            if (TP.notValid(next = currentNode.nextSibling)) {
                //  out of siblings, next unvisited node
                //  will be up the chain somewhere
                ancestor = currentNode.parentNode;
                while (TP.isElement(ancestor)) {
                    if (exitFunc) {
                        ret = exitFunc(ancestor);
                        if (ret === TP.BREAK) {
                            return;
                        }
                    }

                    if (ancestor === terminal) {
                        return;
                    }

                    if (TP.isNode(next = ancestor.nextSibling)) {
                        break;
                    }

                    ancestor = ancestor.parentNode;
                }

                if (TP.notValid(ancestor)) {
                    return;
                }
            }

            currentNode = next;
        }
    }
    while (TP.isNode(currentNode) && currentNode !== terminal);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetChildIndex',
function(aNode, aChild) {

    /**
     * @method nodeGetChildIndex
     * @summary Returns the index in the childNodes array for the child
     *     provided. If aChild couldn't be found in the aNode, this method
     *     returns TP.NOT_FOUND.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Node} aChild The node to find.
     * @example Get a particular child node's index in an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><baz/><bar/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetChildIndex(
     *          xmlDoc.documentElement,
     *          xmlDoc.documentElement.childNodes[1]);
     *          <samp>1</samp>
     *     </code>
     * @example Get a particular child node's index in an HTML element:
     *     <code>
     *          TP.nodeGetChildIndex(document.documentElement,
     *          TP.documentGetBody(document));
     *          <samp>1</samp>
     *     </code>
     * @returns {Number} The index number, or TP.NOT_FOUND.
     * @exception TP.sig.InvalidNode Raised when either node provided to the
     *     method is invalid.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method or the supplied child
     *     isn't a valid node
     */

    var children,
        len,
        i;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isNode(aChild)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    children = aNode.childNodes;
    len = children.length;

    for (i = 0; i < len; i++) {
        if (children[i] === aChild) {
            return i;
        }
    }

    return TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------
//  NODE COLLECTION ITERATION
//  ------------------------------------------------------------------------

/*
Base operations providing iteration capability for nodes (particularly
element and document nodes) similar to those found in TIBET's collection
types.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAncestorsPerform',
function(aNode, aFunction) {

    /**
     * @method nodeAncestorsPerform
     * @summary Executes aFunction with each ancestor of the node, working from
     *     the node outward.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function which performs some action with an
     *     element node.
     * @example Iterate up an XML node's ancestor chain and print each tag name:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar><baz><boo/></baz></bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          fooStr = '';
     *          TP.nodeAncestorsPerform(
     *          TP.nodeGetElementsByTagName(xmlDoc, 'boo').first(),
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>baz bar foo</samp>
     *     </code>
     * @example Iterate up an HTML node's ancestor chain and print each tag
     *     name:
     *     <code>
     *          fooStr = '';
     *          TP.nodeAncestorsPerform(
     *          TP.documentGetBody(document).firstChild,
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>BODY HTML</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var count,
        ancestor;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    count = 0;
    ancestor = aNode.parentNode;

    while (TP.isElement(ancestor)) {
        if (aFunction(ancestor, count++) === TP.BREAK) {
            break;
        }

        ancestor = ancestor.parentNode;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeChildElementsPerform',
function(aNode, aFunction) {

    /**
     * @method nodeChildElementsPerform
     * @summary Executes aFunction with each child element of the node.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate.
     *     Note the filter here for child nodes that are elements.
     *     The index provided to aFunction is the index that would be used had
     *     you collected the elements first, then iterated on that array. This
     *     also means that, if the first or last node are not elements, the
     *     iteration function will not be called.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function which performs some action with
     *     each element provided.
     * @example Iterate across an XML node's child *element* list (i.e. where
     *     each item to the iteration method is a Node.ELEMENT_NODE) and print
     *     each tag name:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar/><baz><boo/></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          fooStr = '';
     *          TP.nodeChildElementsPerform(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>bar baz</samp>
     *     </code>
     * @example Iterate across an HTML node's child *element* list (i.e. where
     *     each item to the iteration method is a Node.ELEMENT_NODE) and print
     *     each tag name:
     *     <code>
     *          fooStr = '';
     *          TP.nodeChildElementsPerform(
     *          TP.documentGetBody(document),
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>(output of tag names of direct children of the body
     *         element)</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var children,
        len,
        i,
        count;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    if (TP.isElement(aNode)) {
        //  condense multiple text node children
        TP.nodeNormalize(aNode);
    }

    children = aNode.childNodes;
    len = children.length;

    count = 0;

    for (i = 0; i < len; i++) {

        //  skip non-element children
        if (!TP.isElement(children[i])) {
            continue;
        }

        //  NOTE that we have to adjust the index so it's the index
        //  of child elements found...ie our count
        if (aFunction(children[i], count++) === TP.BREAK) {
            break;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeChildNodesPerform',
function(aNode, aFunction) {

    /**
     * @method nodeChildNodesPerform
     * @summary Executes aFunction with each child node of the node. NOTE that
     *     as part of the processing here the node is normalized to coalesce
     *     adjacent text nodes.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function which performs some action with
     *     each element provided.
     * @example Iterate across an XML node's child list and print the string
     *     value of each node:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/>This is some
     *         text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          fooStr = '';
     *          TP.nodeChildNodesPerform(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          fooStr += TP.str(aNode) + ' | ';
     *          });
     *          fooStr;
     *          <samp>&lt;bar xmlns="http://www.foo.com"/&gt; | This is some
     *         text | </samp>
     *     </code>
     * @example Iterate across an HTML node's child list and print the string
     *     value of each node:
     *     <code>
     *          fooStr = '';
     *          TP.nodeChildNodesPerform(
     *          TP.nodeGetElementsByTagName(document, 'head').first(),
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>(output of the string value of direct child nodes of the
     *         head element)</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var children,
        len,
        i;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    if (TP.isElement(aNode)) {
        //  condense multiple text node children
        TP.nodeNormalize(aNode);
    }

    children = aNode.childNodes;
    len = children.length;

    for (i = 0; i < len; i++) {
        if (aFunction(children[i], i) === TP.BREAK) {
            break;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDescendantsPerform',
function(aNode, aFunction, breadthFirst) {

    /**
     * @method nodeDescendantsPerform
     * @summary Executes aFunction with each descendant of the node.
     * @description aFunction implementations can return TP.BREAK to terminate
     *     the traversal, TP.CONTINUE to allow you to skip child content under
     *     an element and proceed to the next non-child element node for
     *     processing (only when the current item is an Element, not non-Element
     *     content) or TP.DESCEND to descend into child element content. If you
     *     need to reverse the iteration use TP.nodeGetDescendants() to get the
     *     descendant list and then use Array's perform operation.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Iterate across an XML node's descendant list and print the
     *     string value of each node:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar>This is some
     *         text</bar>This is some more text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          fooStr = '';
     *          TP.nodeDescendantsPerform(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          fooStr += TP.str(aNode) + ' | ';
     *          });
     *          fooStr;
     *          <samp>&lt;bar xmlns="http://www.foo.com"&gt;This is some
     *         text&lt;/bar&gt; | This is some text | This is some more text |
     *         </samp>
     *     </code>
     * @example Iterate across an HTML node's descendant list and print the
     *     string value of each node:
     *     <code>
     *          fooStr = '';
     *          TP.nodeDescendantsPerform(
     *          TP.nodeGetElementsByTagName(document, 'head').first(),
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>(output of the string value of direct child nodes of the
     *         head element)</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    if (TP.isTrue(breadthFirst)) {
        return TP.nodeBreadthTraversal(
                            aNode, aFunction, null, aFunction, false);
    } else {
        return TP.nodeDepthTraversal(
                            aNode, aFunction, null, aFunction, false);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDescendantElementsPerform',
function(aNode, aFunction, breadthFirst) {

    /**
     * @method nodeDescendantElementsPerform
     * @summary Executes aFunction with each element descendant of the node.
     * @description aFunction implementations can return TP.BREAK to terminate
     *     the traversal, TP.CONTINUE to allow you to skip child content under
     *     an element and proceed to the next non-child element node for
     *     processing (only when the current item is an Element, not non-Element
     *     content) or TP.DESCEND to descend into child element content. If you
     *     need to reverse the iteration use TP.nodeGetDescendantElements() to
     *     get the descendant element list and then use Array's perform
     *     operation.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function which performs some action with
     *     each element provided.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Iterate across an XML node's descendant *element* list (i.e.
     *     where each item to the iteration method is a Node.ELEMENT_NODE) and
     *     print each tag name:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar/><baz><boo/></baz></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          fooStr = '';
     *          TP.nodeDescendantElementsPerform(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>bar baz boo</samp>
     *     </code>
     * @example Iterate across an HTML node's descendant *element* list (i.e.
     *     where each item to the iteration method is a Node.ELEMENT_NODE) and
     *     print each tag name:
     *     <code>
     *          fooStr = '';
     *          TP.nodeDescendantElementsPerform(
     *          TP.documentGetBody(document),
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>(output of tag names of descendants of the body
     *         element)</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    if (TP.isTrue(breadthFirst)) {
        //  NOTE that we pass as push function only, so no content nodes
        return TP.nodeBreadthTraversal(aNode, aFunction, null, null, false);
    } else {
        //  NOTE that we pass as push function only, so no content nodes
        return TP.nodeDepthTraversal(aNode, aFunction, null, null, false);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSiblingsPerform',
function(aNode, aFunction, aSubset) {

    /**
     * @method nodeSiblingsPerform
     * @summary Executes aFunction with each sibling of the node.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate.
     *     Note that the index provided to aFunction is the index that would
     *     have been used had you collected the siblings in an array first.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function which performs some action with
     *     each element provided.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @example Iterate across an XML node's sibling list and print each tag
     *     name:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar/><baz/><boo/><goo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Perform over the siblings of the 'baz' element
     *          fooStr = '';
     *          TP.nodeSiblingsPerform(
     *          xmlDoc.documentElement.childNodes[1],
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>bar boo goo</samp>
     *     </code>
     * @example Iterate across an XML node's 'previous' sibling list and print
     *     each tag name:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar/><baz/><boo/><goo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Perform over the previous siblings of the 'baz' element
     *          fooStr = '';
     *          TP.nodeSiblingsPerform(
     *          xmlDoc.documentElement.childNodes[1],
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          },
     *          null,
     *          true);
     *          fooStr;
     *          <samp>bar</samp>
     *
     * @example Iterate across an XML node's 'next' sibling list and print each
     *     tag name:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar/><baz/><boo/><goo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Perform over the next siblings of the 'baz' element
     *          fooStr = '';
     *          TP.nodeSiblingsPerform(
     *          xmlDoc.documentElement.childNodes[1],
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          },
     *          null,
     *          false);
     *          fooStr;
     *          <samp>boo goo</samp>
     *     </code>
     * @example Iterate across an HTML node's sibling list and print each tag
     *     name:
     *     <code>
     *          // Perform over the siblings of the 'body' element
     *          fooStr = '';
     *          TP.nodeSiblingsPerform(
     *          TP.documentGetBody(document),
     *          function(aNode) {
     *
     *          fooStr += aNode.tagName + ' ';
     *          });
     *          fooStr;
     *          <samp>HEAD</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var count,
        node,
        subset,

        siblings,
        len,
        i;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    count = 0;
    subset = aSubset;

    //  note this is the adjusted subset type
    switch (subset) {
        case TP.PREVIOUS:

            node = aNode.previousSibling;
            while (node) {
                if (aFunction(node, count++) === TP.BREAK) {
                    break;
                }

                node = node.previousSibling;
            }

            break;

        case TP.NEXT:

            node = aNode.nextSibling;
            while (node) {
                if (aFunction(node, count++) === TP.BREAK) {
                    break;
                }

                node = node.nextSibling;
            }

            break;

        default:

            siblings = aNode.parentNode.childNodes;
            len = siblings.length;

            for (i = 0; i < len; i++) {

                node = siblings[i];
                if (node === aNode) {
                    continue;
                }

                if (aFunction(node, count++) === TP.BREAK) {
                    break;
                }
            }

            break;
    }

    return;
});

//  ------------------------------------------------------------------------
//  NODE CONTENT DETECTION
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDetectAncestor',
function(aNode, aFunction) {

    /**
     * @method nodeDetectAncestor
     * @summary Returns the first ancestor of aNode for which aFunction returns
     *     true. The normal direction of this search is from the node "outward"
     *     toward the document root.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @example Iterate up an XML node's ancestor chain, finding the first
     *     element with a tag name of 'bar':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar><baz><boo/></baz></bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeDetectAncestor(
     *          TP.nodeGetElementsByTagName(xmlDoc, 'boo').first(),
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode) == 'bar') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Element]</samp>
     *          TP.elementGetLocalName(result);
     *          <samp>bar</samp>
     *     </code>
     * @example Iterate up an HTML node's ancestor chain, finding the first
     *     element with a tag name of 'html':
     *     <code>
     *          TP.nodeDetectAncestor(
     *          TP.documentGetBody(document).firstChild,
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode).toLowerCase() == 'html') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object HTMLHtmlElement]</samp>
     *     </code>
     * @returns {Node} An ancestor found acceptable by aFunction.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var found;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    TP.nodeAncestorsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                found = node;
                return TP.BREAK;
            }
        });

    return found;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDetectChildElement',
function(aNode, aFunction) {

    /**
     * @method nodeDetectChildElement
     * @summary Returns the first child element of aNode for which aFunction
     *     returns true. Iteration is from firstChild to lastChild.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @example Iterate over an XML node's child Element list, finding the first
     *     element with a tag name of 'baz':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><baz/><boo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeDetectChildElement(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode) == 'baz') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Element]</samp>
     *          TP.str(result);
     *          <samp>&lt;baz xmlns="http://www.foo.com"/&gt;</samp>
     *
     * @example Iterate over an HTML node's child Element list, finding the
     *     first element with a tag name of 'head':
     *     <code>
     *          TP.nodeDetectChildElement(
     *          document.documentElement,
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode).toLowerCase() == 'head') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object HTMLHeadElement]</samp>
     * @returns {Node} An child element found acceptable by aFunction.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var found;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    TP.nodeChildElementsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                found = node;
                return TP.BREAK;
            }
        });

    return found;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDetectChildNode',
function(aNode, aFunction) {

    /**
     * @method nodeDetectChildNode
     * @summary Returns the first child node of aNode for which aFunction
     *     returns true. Iteration is from firstChild to lastChild.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @example Iterate over an XML node's child list, finding the first node
     *     with a string value of 'More text':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/>Some text<baz/>More
     *         text<boo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeDetectChildNode(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          if (TP.nodeGetTextContent(aNode) == 'More text') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Text]</samp>
     *          TP.str(result);
     *          <samp>More text</samp>
     *
     * @example Iterate over an HTML node's child list, finding the first node
     *     with an index of 1 (this method is for exposition purposes -
     *     'TP.nodeGetChildNodes(TP.documentGetBody(document)).at(1);' is a more
     *     efficient way to do this):
     *     <code>
     *          TP.nodeDetectChildNode(
     *          TP.documentGetBody(document),
     *          function(aNode) {
     *
     *          if (TP.nodeGetIndexInParent(aNode) == 1) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>(the HTML node with an index of 1 in the body)</samp>
     * @returns {Node} An child node found acceptable by aFunction.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var found;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    TP.nodeChildNodesPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                found = node;
                return TP.BREAK;
            }
        },
        null);

    return found;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDetectDescendant',
function(aNode, aFunction, breadthFirst) {

    /**
     * @method nodeDetectDescendant
     * @summary Returns the first descendant of aNode for which aFunction
     *     returns true. Search is typically downward in a depth-first fashion.
     * @description If you need to reverse the iteration use
     *     TP.nodeGetDescendants() to get the descendant list and then use
     *     Array's perform operation.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Iterate over an XML node's descendant list, finding the first
     *     node with a string value of 'More text':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><goo>Some
     *         text</goo><baz/><boo>More text</boo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeDetectDescendant(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          // Note here that this call will reach into the
     *          // content of Node.ELEMENT_NODEs and get a
     *          // normalized text value.
     *          if (TP.nodeGetTextContent(aNode) == 'More text') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Element]</samp>
     *          TP.str(result);
     *          // We got the 'boo' *element* because the
     *          // 'TP.nodeGetTextContent()' call above reached into the
     *          // Element first (before it traversed to the actual
     *          // Text node), did the comparison, and returned true.
     *          <samp>&lt;boo xmlns="http://www.foo.com"&gt;More
     *         text&lt;/boo&gt;</samp>
     *
     * @example Iterate over an HTML node's descendant list, finding the first
     *     Element node with a 'style' attribute having any value (this example
     *     is for exposition purposes -
     *     'TP.nodeGetDescendantElementsByAttribute(
     *     TP.documentGetBody(document), 'style').first();' is a more efficient
     *     way to do this):
     *     <code>
     *          TP.nodeDetectDescendant(
     *          TP.documentGetBody(document),
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *          TP.elementHasAttribute(aNode, 'style')) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>(the first HTML descendant of the body element with a
     *         style attribute having a value)</samp>
     * @returns {Node} A descendant node found acceptable by aFunction.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var found;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    TP.nodeDescendantsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                found = node;
                return TP.BREAK;
            }
        },
        null,
        breadthFirst);

    return found;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDetectDescendantElement',
function(aNode, aFunction, breadthFirst) {

    /**
     * @method nodeDetectDescendantElement
     * @summary Returns the first element descendant of aNode for which
     *     aFunction returns true. Search is typically downward in a depth-first
     *     fashion.
     * @description If you need to reverse the iteration use
     *     TP.nodeGetDescendantElements() to get the descendant list and then
     *     use Array's perform operation.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Iterate over an XML node's descendant *element* list (i.e. where
     *     each item to the iteration method is a Node.ELEMENT_NODE), finding
     *     the first element with an underlying 'text value' of 'Some text':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><goo>Some
     *         text</goo><baz/><boo>More text</boo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeDetectDescendantElement(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          // Note here that this call will reach into the
     *          // content of Node.ELEMENT_NODEs and get a
     *          // normalized text value.
     *          if (TP.nodeGetTextContent(aNode) == 'Some text') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Element]</samp>
     *          TP.str(result);
     *          // We got the 'goo' *element* because the
     *          // 'TP.nodeGetTextContent()' call above reached into the
     *          // Element first (before it traversed to the actual
     *          // Text node), did the comparison, and returned true.
     *          <samp>&lt;goo xmlns="http://www.foo.com"&gt;More
     *         text&lt;/goo&gt;</samp>
     *
     * @example Iterate over an HTML node's descendant *element* list (i.e.
     *     where each item to the iteration method is a Node.ELEMENT_NODE),
     *     finding the first Element node with a 'style' attribute having any
     *     value (this example is for exposition purposes -
     *     'TP.nodeGetDescendantElementsByAttribute(
     *     TP.documentGetBody(document), 'style').first();' is a more efficient
     *     way to do this):
     *     <code>
     *          TP.nodeDetectDescendantElement(
     *          TP.documentGetBody(document),
     *          function(aNode) {
     *
     *          if (TP.elementHasAttribute(aNode, 'style')) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>(the first HTML descendant of the body element with a
     *         style attribute having a value)</samp>
     * @returns {Node} A descendant element found acceptable by aFunction.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var found;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    TP.nodeDescendantElementsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                found = node;
                return TP.BREAK;
            }
        },
        null,
        breadthFirst);

    return found;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDetectSibling',
function(aNode, aFunction, aSubset) {

    /**
     * @method nodeDetectSibling
     * @summary Returns the first sibling node (next, previous, or any) of
     *     aNode for which aFunction returns true.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @example Iterate over an XML node's sibling list finding the first node
     *     starting at the 'bar' element that is both an Element and has a local
     *     name of 'goo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><goo>Some
     *         text</goo><baz/><boo>More text</boo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeDetectSibling(
     *          xmlDoc.documentElement.firstChild,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *          (TP.elementGetLocalName(aNode) == 'goo')) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Element]</samp>
     *          TP.str(result);
     *          <samp>&lt;goo xmlns="http://www.foo.com"&gt;More
     *         text&lt;/goo&gt;</samp>
     *
     * @example Iterate over an XML node's 'previous' sibling list finding the
     *     first node starting at the 'bar' element that is both an Element and
     *     has a local name of 'goo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><goo>Some
     *         text</goo><baz/><boo>More text</boo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeDetectSibling(
     *          xmlDoc.documentElement.firstChild,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *          (TP.elementGetLocalName(aNode) == 'goo')) {
     *          return true;
     *          };
     *
     *          return false;
     *          },
     *          null,
     *          true);
     *          <samp>undefined</samp>
     *          This is correct as there isn't an Element node before
     *          'bar' with a tag name of 'goo'
     *
     * @example Iterate over an XML node's 'next' sibling list finding the first
     *     node starting at the 'bar' element that is both an Element and has a
     *     local name of 'goo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><goo>Some
     *         text</goo><baz/><boo>More text</boo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeDetectSibling(
     *          xmlDoc.documentElement.firstChild,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *          (TP.elementGetLocalName(aNode) == 'goo')) {
     *          return true;
     *          };
     *
     *          return false;
     *          },
     *          null,
     *          false);
     *          <samp>[object Element]</samp>
     *          TP.str(result);
     *          <samp>&lt;goo xmlns="http://www.foo.com"&gt;More
     *         text&lt;/goo&gt;</samp>
     *
     * @example Iterate over an HTML node's sibling list finding the first node
     *     starting at the first child that is both an Element and has a local
     *     name of 'body':
     *     <code>
     *          TP.nodeDetectSibling(
     *          document.documentElement.firstChild,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *          (TP.elementGetLocalName(aNode).toLowerCase() == 'body')) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object HTMLBodyElement]</samp>
     * @returns {Node} A sibling node found acceptable by aFunction.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var found;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    TP.nodeSiblingsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                found = node;
                return TP.BREAK;
            }
        },
        aSubset);

    return found;
});

//  ------------------------------------------------------------------------
//  NODE CONTENT SELECTION (FILTERING)
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSelectAncestors',
function(aNode, aFunction) {

    /**
     * @method nodeSelectAncestors
     * @summary Returns an array of ancestors of aNode for which aFunction
     *     returns true. The normal direction of this search is from the node
     *     "outward" toward the document root.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @example Iterate up an XML node's ancestor chain and return only those
     *     that have a tag name of 'foo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo
     *         xmlns="http://www.foo.com"><bar><foo><boo/></foo></bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeSelectAncestors(
     *          TP.nodeGetElementsByTagName(xmlDoc, 'boo').first(),
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode) == 'foo') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Element], [object Element]</samp>
     *          result.collect(
     *          function(aNode) {
     *
     *          return TP.elementGetLocalName(aNode);
     *          });
     *          <samp>foo, foo</samp>
     *     </code>
     * @example Iterate up an HTML node's ancestor chain and return only those
     *     that have a tag name of 'html':
     *     <code>
     *          TP.nodeSelectAncestors(
     *          TP.documentGetBody(document),
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode).toLowerCase() == 'html') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          // This is an Array
     *          <samp>[object HTMLHtmlElement]</samp>
     *     </code>
     * @returns {Node[]} An Array of ancestors found acceptable by aFunction.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var arr;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    arr = TP.ac();

    TP.nodeAncestorsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                arr.push(node);
            }
        });

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSelectChain',
function(aNode, aProperty) {

    /**
     * @method nodeSelectChain
     * @summary Returns an Array of objects that are obtained by recursively
     *     obtaining the property on each object, starting with the supplied DOM
     *     node.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aProperty The property name to use to obtain each return
     *     value.
     * @example Select all of an XML node's parent node list:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar><baz/></bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          // Grab the 'baz' element
     *          anElem = TP.nodeGetElementsByTagName(xmlDoc, 'baz').first();
     *          <samp>[object Element]</samp>
     *          // Grab all of its parent nodes (including #document
     *          // itself)
     *          parents = TP.nodeSelectChain(anElem, 'parentNode');
     *          parents.collect(function (anElem) {return anElem.nodeName});
     *          <samp>bar, foo, #document</samp>
     *     </code>
     * @example Select all of an HTML node's parent node node list:
     *     <code>
     *          parents = TP.nodeSelectChain(TP.documentGetBody(document),
     *         'parentNode');
     *          <samp>[object HTMLHtmlElement], [object HTMLDocument]</samp>
     *     </code>
     * @returns {Object[]} An Array of objects obtained by recursing using the
     *     supplied property.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidParameter Raised when an empty property name is
     *     provided to the method.
     */

    var anObj,
        arr;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    arr = TP.ac();

    anObj = aNode;

    while (TP.isValid(anObj = anObj[aProperty])) {
        arr.push(anObj);
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSelectChildElements',
function(aNode, aFunction) {

    /**
     * @method nodeSelectChildElements
     * @summary Returns an Array of child elements of aNode for which aFunction
     *     returns true. Iteration is from firstChild to lastChild.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @example Iterate across an XML node's child *element* list (i.e. where
     *     each item to the iteration method is a Node.ELEMENT_NODE) and return
     *     only those that have a tag name of 'foo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><baz/><foo/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSelectChildElements(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode) == 'foo') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          // This is an Array
     *          <samp>[object Element]</samp>
     *     </code>
     * @example Iterate across an HTML node's child *element* list (i.e. where
     *     each item to the iteration method is a Node.ELEMENT_NODE) and return
     *     only those that have a tag name of 'head':
     *     <code>
     *          TP.nodeSelectChildElements(
     *          document.documentElement,
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode).toLowerCase() == 'head') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          // This is an Array
     *          <samp>[object HTMLHeadElement]</samp>
     *     </code>
     * @returns {Element[]} An Array of child elements found acceptable by
     *     aFunction.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var arr;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    arr = TP.ac();

    TP.nodeChildElementsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                arr.push(node);
            }
        });

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSelectChildNodes',
function(aNode, aFunction) {

    /**
     * @method nodeSelectChildNodes
     * @summary Returns an Array of children of aNode for which aFunction
     *     returns true. Iteration is from firstChild to lastChild.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @example Iterate across an XML node's child list and return only those
     *     that have a string value of 'More text':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/>More text<baz/>Some
     *         text<bar/>More text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSelectChildNodes(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          if (TP.str(aNode) == 'More text') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Text], [object Text]</samp>
     *     </code>
     * @example Iterate across an HTML node's child list and return only those
     *     that are both an Element and have a tag name of 'head':
     *     <code>
     *          TP.nodeSelectChildNodes(
     *          document.documentElement,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *         (TP.elementGetLocalName(aNode).toLowerCase() == 'head')) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          // This is an Array
     *          <samp>[object HTMLHeadElement]</samp>
     *     </code>
     * @returns {Node[]} An Array of child nodes found acceptable by aFunction.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var arr;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    arr = TP.ac();

    TP.nodeChildNodesPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                arr.push(node);
            }
        },
        null);

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSelectDescendants',
function(aNode, aFunction, breadthFirst) {

    /**
     * @method nodeSelectDescendants
     * @summary Returns an Array of descendants of aNode for which aFunction
     *     returns true. Search is typically downward in a depth-first fashion.
     * @description If you need to reverse the iteration use
     *     TP.nodeGetDescendants() to get the descendant list and then use
     *     Array's perform operation.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Iterate across an XML node's descendant list and return only
     *     those that have a string value of 'Some text':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar>More text<baz/>Some
     *         text</bar>More text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSelectDescendants(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          if (TP.str(aNode) == 'Some text') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          // This is an Array
     *          <samp>[object Text]</samp>
     *     </code>
     * @example Iterate across an HTML node's descendant list and return only
     *     those that are both an Element and have a tag name of 'span':
     *     <code>
     *          TP.nodeSelectDescendants(
     *          document.documentElement,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *         (TP.elementGetLocalName(aNode).toLowerCase() == 'span')) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          // This is an Array
     *          <samp>(all of the 'span' elements that are under the document
     *         element)</samp>
     *     </code>
     * @returns {Node[]} An Array of descendant nodes found acceptable by
     *     aFunction.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var arr;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    arr = TP.ac();

    TP.nodeDescendantsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                arr.push(node);
            }
        },
        null,
        breadthFirst);

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSelectDescendantElements',
function(aNode, aFunction, breadthFirst) {

    /**
     * @method nodeSelectDescendantElements
     * @summary Returns an Array of descendant elements of aNode for which
     *     aFunction returns true. Search is typically downward in a depth-first
     *     fashion.
     * @description If you need to reverse the iteration use
     *     TP.nodeGetDescendantElements() to get the descendant list and then
     *     use Array's perform operation.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @example Iterate across an XML node's descendant *element* list (i.e.
     *     where each item to the iteration method is a Node.ELEMENT_NODE), and
     *     return only those that have a local name of 'boo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><boo>More text<baz/>Some
     *         text</boo>More text</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeSelectDescendantElements(
     *          xmlDoc.documentElement,
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode) == 'boo') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          // This is an Array
     *          <samp>[object Element]</samp>
     *          TP.str(result.at(0));
     *          <samp>&lt;boo xmlns="http://www.foo.com"&gt;More
     *         text&lt;<baz/&gt;Some text&lt;/boo&gt;</samp>
     *     </code>
     * @example Iterate across an HTML node's descendant *element* list (i.e.
     *     where each item to the iteration method is a Node.ELEMENT_NODE), and
     *     return only those that have a tag name of 'span':
     *     <code>
     *          TP.nodeSelectDescendantElements(
     *          document.documentElement,
     *          function(aNode) {
     *
     *          if (TP.elementGetLocalName(aNode).toLowerCase() == 'span') {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          // This is an Array
     *          <samp>(all of the 'span' elements that are under the document
     *         element)</samp>
     *     </code>
     * @returns {Element[]} An Array of descendant elements found acceptable by
     *     aFunction.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var arr;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    arr = TP.ac();

    TP.nodeDescendantElementsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                arr.push(node);
            }
        },
        null,
        breadthFirst);

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSelectSiblings',
function(aNode, aFunction, aSubset) {

    /**
     * @method nodeSelectSiblings
     * @summary Returns an array of siblings (next, previous, or any) of aNode
     *     for which aFunction returns true.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @example Iterate over an XML node's sibling list finding all nodes
     *     starting at the 'bar' element that is both an Element and has a local
     *     name of 'goo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><goo>Some
     *         text</goo><baz/><goo>More text</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeSelectSiblings(
     *          xmlDoc.documentElement.firstChild,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *          (TP.elementGetLocalName(aNode) == 'goo')) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>[object Element], [object Element]</samp>
     *          result.collect(function (aNode) {return aNode.tagName});
     *          <samp>goo, goo</samp>
     *
     * @example Iterate over an XML node's 'previous' sibling list finding all
     *     nodes starting at the 'bar' element that is both an Element and has a
     *     local name of 'goo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><goo>Some
     *         text</goo><baz/><goo>More text</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeSelectSiblings(
     *          xmlDoc.documentElement.firstChild,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *          (TP.elementGetLocalName(aNode) == 'goo')) {
     *          return true;
     *          };
     *
     *          return false;
     *          },
     *          null,
     *          true);
     *          <samp>(empty Array)</samp>
     *          This is correct as there isn't an Element node before
     *          'bar' with a tag name of 'goo'
     *
     * @example Iterate over an XML node's 'next' sibling list finding all nodes
     *     starting at the 'bar' element that is both an Element and has a local
     *     name of 'goo':
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar/><goo>Some
     *         text</goo><baz/><goo>More text</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          result = TP.nodeSelectSiblings(
     *          xmlDoc.documentElement.firstChild,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *          (TP.elementGetLocalName(aNode) == 'goo')) {
     *          return true;
     *          };
     *
     *          return false;
     *          },
     *          null,
     *          false);
     *          <samp>[object Element], [object Element]</samp>
     *          result.collect(function (aNode) {return aNode.tagName});
     *          <samp>goo, goo</samp>
     *
     * @example Iterate over an HTML node's sibling list finding the all nodes
     *     starting at the body element's first child that is both an Element
     *     and has a local name of 'span':
     *     <code>
     *          TP.nodeSelectSiblings(
     *          TP.documentGetBody(document).firstChild,
     *          function(aNode) {
     *
     *          if (TP.isElement(aNode) &&
     *         (TP.elementGetLocalName(aNode).toLowerCase() == 'span')) {
     *          return true;
     *          };
     *
     *          return false;
     *          });
     *          <samp>(all span elements that are siblings of the body element's
     *         first child)</samp>
     * @returns {Node[]} An Array of sibling nodes found acceptable by
     *          aFunction.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @exception TP.sig.InvalidFunction Raised when an invalid function is
     *     provided to the method.
     */

    var arr;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.isCallable(aFunction)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    arr = TP.ac();

    TP.nodeSiblingsPerform(
        aNode,
        function(node, index) {

            if (aFunction(node, index)) {
                arr.push(node);
            }
        },
        aSubset);

    return arr;
});

//  ------------------------------------------------------------------------
//  NODE NAMESPACE SUPPORT
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDefaultNSURI',
function(aNode, includeDefault) {

    /**
     * @method nodeGetDefaultNSURI
     * @summary Returns the default namespace that the node is in.
     * @description If the supplied element is an Element and is unprefixed,
     *     its namespace URI will be returned. If it is an Element and is
     *     prefixed, this method will continue to search its ancestor chain,
     *     looking for the first unprefixed element and return its namespace.
     * @param {Node} aNode The node to return the current default namespace URI
     *     of.
     * @returns {String|null} The default namespace of the supplied Node.
     */

    var ancestor;

    if (TP.isElement(aNode) && TP.isEmpty(aNode.prefix)) {
        return aNode.namespaceURI;
    }

    ancestor = aNode.parentNode;
    while (TP.isElement(ancestor)) {
        if (TP.isEmpty(ancestor.prefix)) {
            return ancestor.namespaceURI;
        }

        ancestor = ancestor.parentNode;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetNSPrefixes',
function(aNode, aNamespaceURI, includeDescendants) {

    /**
     * @method nodeGetNSPrefixes
     * @summary Returns an Array of namespace prefixes for aNamespaceURI on or
     *     in the supplied node.
     * @description The default call searches only the local attributes on the
     *     node. Passing true to includeDescendants will cause the entire node's
     *     content to be searched for prefixes.
     * @param {Node} aNode The XML node to retrieve the namespace prefixes for.
     * @param {String} aNamespaceURI The namespace URI to return the array of
     *     prefixes for. If empty, all defined prefixes will be returned.
     * @param {Boolean} includeDescendants Should the search run across the
     *     entire DOM tree? Default is false.
     * @example Obtain the namespace prefixes for the document element of an XML
     *     document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:bar="http://www.bar.com"><goo
     *         xmlns:baz="http://www.baz.com">Hi</goo> there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetNSPrefixes(xmlDoc.documentElement);
     *          <samp>bar</samp>
     *     </code>
     * @example Obtain the namespace prefixes for the document element *and its
     *     descendant elements* of an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:bar="http://www.bar.com"><goo
     *         xmlns:baz="http://www.baz.com">Hi</goo> there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetNSPrefixes(xmlDoc.documentElement, null, true);
     *          <samp>bar, baz</samp>
     *     </code>
     * @example Obtain the namespace prefixes for the document element *and its
     *     descendant elements* of an XML document, but only for the
     *     'http://www.baz.com' namespace:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:bar="http://www.bar.com"><goo
     *         xmlns:baz="http://www.baz.com">Hi</goo> there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetNSPrefixes(xmlDoc.documentElement,
     *          'http://www.baz.com',
     *          true);
     *          <samp>baz</samp>
     *     </code>
     * @returns {String[]} An array of namespace prefixes for the supplied
     *     aNamespaceURI in the document.
     * @exception TP.sig.InvalidParameter Raised when a node that isn't of type
     *     Node.ELEMENT_NODE or Node.DOCUMENT_NODE is provided to the method.
     */

    var arr,

        uris,
        prefixes,

        str,
        re,

        node,
        attrs,

        len,
        i,

        attr;

    //  we only do this for document and element node types
    if (!TP.isDocument(aNode) && !TP.isElement(aNode)) {
        TP.raise(this, 'TP.sig.InvalidParameter',
                                    'Node not an element or document.');
        return;
    }

    //  either way we'll need our result array
    arr = TP.ac();

    //  when no specific URI is provided we get the list of all that apply
    if (TP.isEmpty(aNamespaceURI)) {
        uris = TP.nodeGetNSURIs(aNode, includeDescendants);

        prefixes = uris.collect(
                function(uri) {

                    return TP.nodeGetNSPrefixes(aNode, uri,
                                                includeDescendants);
                });

        //  array of arrays, becomes a flat array with empty child arrays
        //  removed
        return prefixes.flatten().unique();
    }

    if (TP.isTrue(includeDescendants)) {
        str = TP.nodeAsString(aNode);

        re = TP.rc('xmlns:([^=]*)?="' +
                    TP.regExpEscape(aNamespaceURI) + '"', 'g');

        str.replace(
                re,
                function(wholeMatch, prefix) {

                    if (TP.notEmpty(prefix)) {
                        arr.push(prefix);
                    }

                    return wholeMatch;
                });

        //  in this case we want to unique the resulting list to avoid
        //  duplicates due to different NS contexts in the content
        arr.unique();
    } else {
        //  if we're not worried about child content we can work with the
        //  element's attribute list
        if (TP.isDocument(aNode)) {
            node = aNode.documentElement;
        } else if (TP.isElement(aNode)) {
            node = aNode;
        } else {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        attrs = node.attributes;
        len = attrs.length;

        for (i = 0; i < len; i++) {
            attr = attrs[i];
            if (attr.value === aNamespaceURI) {
                if (/xmlns:/.test(attr.name)) {
                    arr.push(attr.name.slice(6));
                }
            }
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetNSURI',
function(aNode) {

    /**
     * @method nodeGetNSURI
     * @summary Returns the namespaceURI of the node. This is typically found
     *     in the namepaceURI but in certain circumstances you'll get an empty
     *     value there even when the xmlns attribute is in place.
     * @param {Node} aNode The XML node to retrieve the namespace URI for.
     * @example Obtain the namespace URI for the document element of an XML
     *     document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:bar="http://www.bar.com"><goo
     *         xmlns:baz="http://www.baz.com">Hi</goo> there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetNSURI(xmlDoc.documentElement);
     *          <samp>http://www.foo.com</samp>
     *     </code>
     * @returns {String} A namespace URI or the empty string.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var ns,
        node,
        attrs,
        len,
        i;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.notEmpty(ns = aNode.namespaceURI)) {
        return ns;
    }

    node = TP.isDocument(aNode) ? aNode.documentElement : aNode;

    if (TP.isElement(node)) {
        attrs = node.attributes;
        len = attrs.length;

        for (i = 0; i < len; i++) {
            if (attrs[i].name === 'xmlns') {
                return attrs[i].value;
            }
        }
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetNSURIs',
function(aNode, includeDescendants) {

    /**
     * @method nodeGetNSURIs
     * @summary Returns an Array of unique namespace URIs in the supplied XML
     *     Node.
     * @param {Node} aNode The XML node to retrieve the namespace URIs for.
     * @param {Boolean} includeDescendants Should the search run across the
     *     entire DOM tree? Default is false.
     * @example Obtain the namespace URIs defined in the document element of an
     *     XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:bar="http://www.bar.com"><goo
     *         xmlns:baz="http://www.baz.com">Hi</goo> there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetNSURIs(xmlDoc.documentElement);
     *          <samp>http://www.foo.com, http://www.bar.com</samp>
     *     </code>
     * @example Obtain the namespace prefixes defined in the document element
     *     *and its descendant elements* of an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"
     *         xmlns:bar="http://www.bar.com"><goo
     *         xmlns:baz="http://www.baz.com">Hi</goo> there</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetNSURIs(xmlDoc.documentElement, true);
     *          <samp>http://www.foo.com, http://www.bar.com,
     *         http://www.baz.com</samp>
     *     </code>
     * @returns {String[]} An array of unique namespace URIs found in the node.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var node,

        arr,

        str,

        attrs,

        len,
        i;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  We may reassign this below, so we assign it here.

    node = aNode;

    switch (node.nodeType) {
        case Node.ATTRIBUTE_NODE:

            arr = TP.ac(aNode.namespaceURI);
            break;

            /* eslint-disable no-fallthrough */

        case Node.DOCUMENT_NODE:

            //  NOTE fallthrough here so we work on documentElement
            node = node.documentElement;

        case Node.ELEMENT_NODE:

            arr = TP.ac();

            if (TP.isTrue(includeDescendants)) {
                str = TP.nodeAsString(node);
                arr = TP.ac();

                TP.regex.NS_EXTRACTION.lastIndex = 0;
                str.replace(TP.regex.NS_EXTRACTION,
                            function(wholeMatch, prefix, uri) {

                                if (TP.isURIString(uri)) {
                                    arr.push(uri);
                                }

                                return wholeMatch;
                            });

                return arr.unique();
            }

            attrs = node.attributes;
            len = attrs.length;

            for (i = 0; i < len; i++) {
                if (/xmlns[:]?/.test(attrs[i].name)) {
                    arr.push(attrs[i].value);
                }
            }

            break;

        default:

            arr = TP.ac();
            break;
    }

    return arr;
});

//  ------------------------------------------------------------------------
//  NODE "GETTERS"
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetTextContent',
function(aNode) {

    /**
     * @method nodeGetTextContent
     * @summary Returns the text value of the node provided.
     * @description The actual behavior varies based on node type, but the
     *     result is the same, the content considered to be the text value of
     *     the receiving node is returned. For Element nodes, the text value of
     *     the *first Text node* (after normalization) will always be returned.
     *     For Document nodes, the markup string for the entire document will be
     *     returned.
     * @param {Node} aNode The DOM node to operate on.
     * @example Get the text value of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo>Hi</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetTextContent(xmlDoc.documentElement);
     *          <samp>Hi</samp>
     *     </code>
     * @example Get the text value of an XML element that has multiple child
     *     nodes:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo>Hi<bar/> There</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetTextContent(xmlDoc.documentElement);
     *          <samp>Hi There</samp>
     *     </code>
     * @example Get the text value of an XML element that has descendant nodes:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo>Hi<bar> There </bar>Folks!</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetTextContent(xmlDoc.documentElement);
     *          <samp>Hi There Folks!</samp>
     *     </code>
     * @example Get the text value of an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo>Hi<bar>There</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetTextContent(xmlDoc);
     *          <samp>Hi There</samp>
     *     </code>
     * @example Get the text value of an XML element's attribute:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo bar="baz">Hi</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetTextContent(
     *          xmlDoc.documentElement.attributes[0]);
     *          <samp>baz</samp>
     *     </code>
     * @example Get the text value of an XML comment:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo>Hi<!-- A comment
     *         --></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetTextContent(
     *          xmlDoc.documentElement.childNodes[1]);
     *          <samp> A comment </samp>
     *     </code>
     * @returns {String} The text content of the first text child of the
     *     supplied Node (after all Text nodes under it have been normalized).
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                                'Must provide a valid target Node.');
    }

    //  condense multiple text node children
    TP.nodeNormalize(aNode);

    switch (aNode.nodeType) {
        case Node.ELEMENT_NODE:
        case Node.DOCUMENT_FRAGMENT_NODE:

            return aNode.textContent;

        case Node.ATTRIBUTE_NODE:

            return aNode.value;

        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
        case Node.PROCESSING_INSTRUCTION_NODE:
        case Node.COMMENT_NODE:

            return aNode.data;

        case Node.DOCUMENT_NODE:

            return TP.nodeGetTextContent(aNode.documentElement);

        case Node.ENTITY_REFERENCE_NODE:
        case Node.ENTITY_NODE:
        case Node.DOCUMENT_TYPE_NODE:
        case Node.NOTATION_NODE:

            return '';

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetChildTextContent',
function(aNode, aTagName, aNamespaceURI) {

    /**
     * @method nodeGetChildTextContent
     * @summary Returns the normalized nodeValue of the node's first element
     *     with a node name of aTagName. This is a useful wrapper for pulling
     *     apart nodes which essentially represent lists.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aTagName The tag/element name to match.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @example Get the text value of an XML element's 'goo' child:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><goo>Hi</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetChildTextContent(xmlDoc.documentElement,
     *          'goo');
     *          <samp>Hi</samp>
     *     </code>
     * @example Get the text value of an XML element's 'moo' child:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><goo>Hi</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetChildTextContent(xmlDoc.documentElement,
     *          'moo');
     *          // 'moo' wasn't found, so this returns 'undefined'
     *          <samp>undefined</samp>
     *     </code>
     * @example Get the text value of an XML element's 'bar' child, but only the
     *     one in the 'http://www.bar.com' namespace:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar>Hi</bar><bar
     *         xmlns="http://www.bar.com">there</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeGetChildTextContent(xmlDoc.documentElement,
     *          'bar',
     *          'http://www.bar.com');
     *          <samp>undefined</samp>
     *     </code>
     * @returns {String} The text content of the text child of the first Element
     *     under the supplied Node whose tag name matches the supplied name
     *     (after all Text nodes under it have been normalized).
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var child;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    child = TP.nodeGetFirstElementChildByTagName(aNode,
                                                    aTagName,
                                                    aNamespaceURI);
    if (TP.isElement(child)) {
        return TP.nodeGetTextContent(child);
    }

    return;
});

//  ------------------------------------------------------------------------
//  NODE PHASE SUPPORT
//  ------------------------------------------------------------------------

/*
Operations which manipulate and test a Node's 'processing phase'
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetStartPhase',
function(aNode, phaseList, outerElem) {

    /**
     * @method nodeGetStartPhase
     * @summary Returns the starting phase aNode should be processed with based
     *     on the phase data of itself and/or its ancestors. We don't want to
     *     process content multiple times since there's no guarantee that
     *     operations are idempotent.
     * @param {Node} aNode The node to test.
     * @param {String[]} phaseList An optional array in which to find the target
     *     phase.
     * @param {Element} outerElem An optional 'outermost' element to test.
     *     Testing will not go higher than this element in the DOM tree.
     * @returns {String} The target phase for the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var elem,
        phases,
        phase;

    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  Convert non-element nodes into elements by traversing upward.
    elem = aNode;
    if (!TP.isElement(aNode)) {
        elem = TP.isDocument(aNode) ?
                    aNode.documentElement :
                    aNode.parentNode;

        if (TP.isFragment(elem)) {
            return null;
        }
    }

    //  The default phase list is non-cached page processing list.
    phases = TP.ifInvalid(phaseList, TP.shell.TSH.NOCACHE_PHASES);

    //  Once we have an element of any kind, loop upward until we a) find a
    //  tibet:phase, b) find the outerElem (if any), or c) run out of
    //  elements.
    while (TP.isElement(elem)) {
        if (TP.elementHasAttribute(elem, 'tibet:phase', true)) {
            break;
        }

        if (elem === outerElem) {
            break;
        }

        elem = elem.parentNode;
    }

    //  If we found any elements with a phase we want to start at that phase.
    //  Otherwise we'll start at the first phase in the list.
    if (TP.isElement(elem)) {
        //  We want to make sure the phase is in the phases list we're
        //  working with, if it isn't then we need to assume we start with
        //  the first phase in the new phase list.
        phase = TP.elementGetAttribute(elem, 'tibet:phase', true);
        if (phases.contains(phase)) {
            return phase;
        } else {
            return phases.first();
        }
    }

    return phases.first();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetTargetPhase',
function(aNode, phaseList, outerElem) {

    /**
     * @method nodeGetTargetPhase
     * @summary Returns the maximum phase aNode should be processed to based on
     *     the phase data of its ancestors.
     * @param {Node} aNode The node to test.
     * @param {String[]} phaseList An optional array in which to find the target
     *     phase.
     * @param {Element} outerElem An optional 'outermost' element to test.
     *     Testing will not go higher than this element in the DOM tree.
     * @returns {String} The target phase for the node.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var elem,
        phases,
        phase;

    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  Convert non-element nodes into elements by traversing upward.
    elem = aNode;
    if (!TP.isElement(aNode)) {
        elem = TP.isDocument(aNode) ?
                    aNode.documentElement :
                    aNode.parentNode;

        if (TP.isFragment(elem)) {
            return null;
        }
    }

    //  The default phase list is non-cached page processing list.
    phases = TP.ifInvalid(phaseList, TP.shell.TSH.NOCACHE_PHASES);

    //  Once we have an element of any kind, loop upward until we a) find a
    //  tibet:phase, b) find the outerElem (if any), or c) run out of
    //  elements.
    while (TP.isElement(elem)) {
        if (TP.elementHasAttribute(elem, 'tibet:phase', true)) {
            break;
        }

        if (elem === outerElem) {
            break;
        }

        elem = elem.parentNode;
    }

    //  If we found any elements with a phase we want to stop at that phase.
    //  Otherwise we'll stop at the last phase in the list.
    if (TP.isElement(elem)) {
        //  We want to make sure any current phase is in the phases list
        //  we're working with, if it isn't then we need to assume we end
        //  with the first phase in the new phase list.
        phase = TP.elementGetAttribute(elem, 'tibet:phase', true);
        if (phases.contains(phase) || phase === 'Execute') {
            return phase;
        } else {
            return phases.last();
        }
    }

    return phases.last();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeHasReachedPhase',
function(aNode, targetPhase, targetPhaseList, nodeOnly) {

    /**
     * @method nodeHasReachedPhase
     * @summary Returns true if the node provided appears to have been
     *     processed by the TIBET content processing subsystem. When a phase is
     *     specified it is checked against any optional list to see if
     *     processing has reached that phase.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} targetPhase A content processing phase name.
     * @param {String[]} targetPhaseList An ordered list of phase names used for
     *     testing.
     * @param {Boolean} nodeOnly Flag determining whether to check only the node
     *     or the parent chain as well. Default is node only.
     * @returns {Boolean} True if the node looks processed.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var elem,
        currentPhase,
        phaseList;

    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    //  Convert non-element nodes into elements by traversing upward.
    elem = aNode;
    if (!TP.isElement(aNode)) {
        elem = TP.isDocument(aNode) ?
                    aNode.documentElement :
                    aNode.parentNode;

        if (TP.isFragment(elem)) {
            return null;
        }
    }

    //  See if the element has a phase. If not, but it has a 'tibet:tag'
    //  attribute, then set its 'tibet:phase' to 'Compile'. We do this before
    //  we traverse the ancestor chain so that we can support tags that
    //  recursively replace themselves.
    currentPhase = TP.elementGetAttribute(elem, 'tibet:phase', true);
    if (TP.isEmpty(currentPhase)) {
        if (TP.elementHasAttribute(elem, 'tibet:tag', true)) {
            TP.elementSetAttribute(elem, 'tibet:phase', 'Compile', true);
        }
    }

    /*
    //  When ancestor scope is requested we search upward until we find a
    //  phase marker or run out of elements.
    if (TP.notFalse(nodeOnly)) {
        while (TP.isElement(elem)) {
            if (TP.elementHasAttribute(elem, 'tibet:phase', true)) {
                break;
            };

            elem = elem.parentNode;
        };
    };
    */

    //  If we ran out of elements above then the original element is
    //  sufficient.
    if (!TP.isElement(elem)) {
        elem = TP.isDocument(elem) ?
                elem.documentElement :
                elem.parentNode;
    }

    //  When no target phase is specified any evidence of conversion from
    //  non-HTML to HTML is enough.
    if (TP.isEmpty(targetPhase)) {
        return TP.elementHasAttribute(elem, 'tibet:tag', true);
    }

    currentPhase = TP.elementGetAttribute(elem, 'tibet:phase', true);
    if (TP.isEmpty(currentPhase)) {
        //  No current phase, result is indeterminate.
        return;
    }

    //  default phase list to NOCACHE phases when missing.
    phaseList = TP.ifInvalid(targetPhaseList, TP.shell.TSH.NOCACHE_PHASES);

    //  Note that execution is a "hard-coded phase" so it will never be in
    //  the phase list. We have to test specifically for that.
    if (targetPhase === 'Execute') {
        return currentPhase === 'Execute';
    } else if (phaseList.contains(targetPhase)) {
        return phaseList.indexOf(currentPhase) >=
                phaseList.indexOf(targetPhase);
    } else {
        return this.raise('TP.sig.InvalidPhase',
                            'Target phase not in phase list');
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeNormalizePhase',
function(aNode) {

    /**
     * @method nodeNormalizePhase
     * @summary Normalizes, aka coalesces tibet:phase information on the node
     *     by removing phase attributes which are superfluous.
     * @param {Node} aNode The node to normalize.
     * @returns {Node} The node.
     */

    //  TODO:   implement this :)

    return aNode;
});

//  ------------------------------------------------------------------------
//  NODE MODIFICATION
//  ------------------------------------------------------------------------

/*
Operations supporting common Node transformations. You can also use a
selection primitive such as TP.nodeGetChildNodes() followed by a perform or
similar iteration operation to operate on node content.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeCopyChildNodesTo',
function(fromNode, toNode, beforeNode, shouldAwake) {

    /**
     * @method nodeCopyChildNodesTo
     * @summary Copies children of the 'from' node to the 'to' node.
     * @param {Node} fromNode The source node.
     * @param {Node} toNode The target node.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just copied. The default for this operation is false.
     * @example Copy all of the children from the source document to a new,
     *     empty document:
     *     <code>
     *          srcDoc = TP.documentFromString(
     *          '<foo><goo>Hi</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          destDoc = TP.constructDocument();
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeCopyChildNodesTo(srcDoc, destDoc);
     *          <samp>undefined</samp>
     *          TP.str(destDoc);
     *          <samp>&lt;foo&gt;&lt;goo&gt;Hi&lt;/goo&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @example Copy all of the children from the source document to a new
     *     document that has only one node under its document element and insert
     *     all of the newly copied children before that one node:
     *     <code>
     *          srcDoc = TP.documentFromString(
     *          '<foo><goo>Hi</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          destDoc = TP.documentFromString(
     *          '<baz><bar/></baz>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeCopyChildNodesTo(
     *          srcDoc,
     *          destDoc,
     *          destDoc.documentElement.firstChild);
     *          <samp>undefined</samp>
     *          TP.str(destDoc);
     *
     *
     *         <samp>&lt;baz&gt;&lt;foo&gt;&lt;goo&gt;Hi&lt;/goo&gt;&lt;/foo&gt;&lt;bar/&gt;&lt;/baz&gt;</samp>
     *     </code>
     * @returns {Node} The first copied child node. This will be a different
     *     node than what was the first child node of the fromNode, as the node
     *     will have been copied and might have been imported.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var toElem,

        before,

        retNode,

        len,
        i;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(fromNode) || !TP.isCollectionNode(toNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    toElem = TP.isDocument(toNode) && TP.isElement(toNode.documentElement) ?
                    toNode.documentElement :
                    toNode;

    before = TP.ifInvalid(beforeNode, null);

    retNode = null;

    len = fromNode.childNodes.length;
    for (i = 0; i < len; i++) {
        //  Grab the first copied child node.
        if (TP.notValid(retNode)) {
            retNode = TP.nodeInsertBefore(
                            toElem,
                            TP.nodeCloneNode(fromNode.childNodes[i], true),
                            before,
                            shouldAwake);
        } else {
            //  If 'before' is null, this is the same as doing
            //  'appendChild'.
            TP.nodeInsertBefore(
                        toElem,
                        TP.nodeCloneNode(fromNode.childNodes[i], true),
                        before,
                        shouldAwake);
        }
    }

    return retNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeMoveChildNodesTo',
function(fromNode, toNode, beforeNode, shouldAwake) {

    /**
     * @method nodeMoveChildNodesTo
     * @summary Moves children of the 'from' node to the 'to' node.
     * @param {Node} fromNode The source node.
     * @param {Node} toNode The target node.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just moved. The default for this operation is false.
     * @example Move all of the children from the source document to a new,
     *     empty document:
     *     <code>
     *          srcDoc = TP.documentFromString(
     *          '<foo><goo>Hi</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          destDoc = TP.constructDocument();
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeMoveChildNodesTo(srcDoc, destDoc);
     *          <samp>undefined</samp>
     *          TP.str(destDoc);
     *          <samp>&lt;foo&gt;&lt;goo&gt;Hi&lt;/goo&gt;&lt;/foo&gt;</samp>
     *          TP.isEmpty(srcDoc);
     *          <samp>true</samp>
     *     </code>
     * @example Move all of the children from the source document to a new
     *     document that has only one node under its document element and insert
     *     all of the newly copied children before that one node:
     *     <code>
     *          srcDoc = TP.documentFromString(
     *          '<foo><goo>Hi</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          destDoc = TP.documentFromString(
     *          '<baz><bar/></baz>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeMoveChildNodesTo(
     *          srcDoc,
     *          destDoc,
     *          destDoc.documentElement.firstChild);
     *          <samp>undefined</samp>
     *          TP.str(destDoc);
     *
     *
     *         <samp>&lt;baz&gt;&lt;foo&gt;&lt;goo&gt;Hi&lt;/goo&gt;&lt;/foo&gt;&lt;bar/&gt;&lt;/baz&gt;</samp>
     *          TP.isEmpty(srcDoc);
     *          <samp>true</samp>
     *     </code>
     * @returns {Node} The first moved child node. This may be a different node
     *     than what was the first child node of the fromNode, as the node might
     *     have been imported.
     * @exception TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     */

    var toElem,

        before,

        retNode,

        len,
        i,

        childNode;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(fromNode) || !TP.isCollectionNode(toNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode',
                            'Node not a collection Node.');
    }

    toElem = TP.isDocument(toNode) && TP.isElement(toNode.documentElement) ?
                    toNode.documentElement :
                    toNode;

    before = TP.ifInvalid(beforeNode, null);

    retNode = null;

    len = fromNode.childNodes.length;
    for (i = 0; i < len; i++) {
        //  Make sure and remove the child from the fromNode first.
        //  Trust me... it works better this way.
        childNode = TP.nodeDetach(fromNode.childNodes[0]);

        //  Grab the first moved child node.
        if (TP.notValid(retNode)) {
            //  If 'before' is null, this is the same as doing
            //  'appendChild'.
            retNode = TP.nodeInsertBefore(toElem, childNode,
                                            before, shouldAwake);
        } else {
            //  If 'before' is null, this is the same as doing
            //  'appendChild'.
            TP.nodeInsertBefore(toElem, childNode, before, shouldAwake);
        }
    }

    return retNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSetContent',
function(aNode, anObject, loadedFunction, shouldAwake) {

    /**
     * @method nodeSetContent
     * @summary Sets the content of aNode to anObject, removing any current
     *     content. This method is a simple wrapper for empty/insert operations
     *     which specialize based on a variety of factors.
     * @param {Node} aNode The node to set the child content of.
     * @param {Object} anObject The object to use as the source of the content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just set. The default for a 'set' operation is whether aNode has a
     *     Window object associated with it or not.
     * @exception TP.sig.InvalidNode
     * @returns {Node} The first node of the content that was just set, or the
     *     node itself depending on the node type.
     */

    var content;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.notValid(anObject)) {
        TP.nodeEmptyContent(aNode);
    }

    //  this allows us to accept things like TP.uri.URI, TP.dom.Node, etc.
    //  and to process them as the content routines would expect.
    content = TP.canInvoke(anObject, 'getResource') ?
                anObject.getResource(
                    TP.hc('resultType', TP.DOM)).get('result') :
                anObject;
    content = TP.unwrap(content);

    switch (aNode.nodeType) {
        case Node.ELEMENT_NODE:

            if (TP.isHTMLNode(aNode)) {
                return TP.htmlElementSetContent(aNode,
                                                content,
                                                loadedFunction,
                                                shouldAwake);
            } else {
                return TP.xmlElementSetContent(aNode,
                                                content,
                                                loadedFunction,
                                                shouldAwake);
            }

        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
        case Node.PROCESSING_INSTRUCTION_NODE:
        case Node.COMMENT_NODE:

            aNode.data = TP.str(content);
            break;

        case Node.DOCUMENT_NODE:

            if (TP.isHTMLNode(aNode)) {
                return TP.htmlDocumentSetContent(aNode,
                                                content,
                                                loadedFunction,
                                                shouldAwake);
            } else {
                return TP.xmlDocumentSetContent(aNode,
                                                content,
                                                loadedFunction);
            }

        case Node.ATTRIBUTE_NODE:

            aNode.value = TP.str(content);
            break;

        case Node.DOCUMENT_FRAGMENT_NODE:

            //  We can do the same setting logic here that we use for
            //  Node.ELEMENT_NODE

            if (TP.isHTMLNode(aNode)) {
                return TP.htmlElementSetContent(aNode,
                                                content,
                                                loadedFunction,
                                                shouldAwake);
            } else {
                return TP.xmlElementSetContent(aNode,
                                                content,
                                                loadedFunction,
                                                shouldAwake);
            }

        case Node.ENTITY_REFERENCE_NODE:
        case Node.ENTITY_NODE:
        case Node.DOCUMENT_TYPE_NODE:
        case Node.NOTATION_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation');
            break;

        default:
            break;
    }

    return aNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSetTextContent',
function(aNode, anObject) {

    /**
     * @method nodeSetTextContent
     * @summary Sets the text of the node provided to aString.
     * @description The behavior here varies by node type. For element nodes, if
     *     the node already has a text node child as the first child, it will be
     *     updated. If not, a new text node will be inserted as the first child.
     *     If a CDATA section existed then it's value will be updated,
     *     preserving the original "structure" of the element. For attribute
     *     nodes, the value is updated, and so on.
     * @param {Node} aNode The DOM node to operate on.
     * @param {Object} anObject The source of the content to set.
     * @example Set the text value of an XML element:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo>Hi</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSetTextContent(xmlDoc.documentElement, 'Howdy');
     *          <samp>undefined</samp>
     *          TP.str(xmlDoc);
     *          <samp>&lt;foo&gt;Howdy&lt;/foo&gt;</samp>
     *     </code>
     * @example Set the text value of an XML element that has no pre-existing
     *     text:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSetTextContent(xmlDoc.documentElement, 'Howdy');
     *          <samp>undefined</samp>
     *          TP.str(xmlDoc);
     *          <samp>&lt;foo&gt;Howdy&lt;/foo&gt;</samp>
     *     </code>
     * @example Set the text value of an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo>Hi</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSetTextContent(xmlDoc, 'Howdy');
     *          <samp>undefined</samp>
     *          TP.str(xmlDoc);
     *          <samp>&lt;foo&gt;Howdy&lt;/foo&gt;</samp>
     *     </code>
     * @example Set the text value of an XML element's attribute:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo bar="baz">Hi</foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSetTextContent(
     *          xmlDoc.documentElement.attributes[0], 'moo');
     *          <samp>undefined</samp>
     *          TP.str(xmlDoc);
     *          <samp>&lt;foo bar="moo"&gt;Hi&lt;/foo&gt;</samp>
     *     </code>
     * @example Set the text value of an XML comment:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo>Hi<!-- A comment
     *         --></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSetTextContent(
     *          xmlDoc.documentElement.childNodes[1],
     *          'Another comment');
     *          <samp>undefined</samp>
     *          TP.str(xmlDoc);
     *          <samp>&lt;foo&gt;Hi&lt;!--Another
     *         comment--&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var resp,
        content;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.canInvoke(anObject, 'getResource')) {
        resp = anObject.getResource(
                        TP.hc('async', false, 'resultType', TP.TEXT));
        content = resp.get('result');
    } else {
        content = TP.str(anObject);
    }

    switch (aNode.nodeType) {
        case Node.ELEMENT_NODE:
        case Node.DOCUMENT_FRAGMENT_NODE:

            TP.nodeRefreshDescendantDocumentPositions(aNode);
            aNode.textContent = content;

            break;

        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
        case Node.PROCESSING_INSTRUCTION_NODE:
        case Node.COMMENT_NODE:

            aNode.data = content;

            break;

        case Node.DOCUMENT_NODE:

            TP.nodeSetTextContent(aNode.documentElement, content);
            break;

        case Node.ATTRIBUTE_NODE:
            aNode.value = content;
            break;

        case Node.ENTITY_REFERENCE_NODE:
        case Node.ENTITY_NODE:
        case Node.DOCUMENT_TYPE_NODE:
        case Node.NOTATION_NODE:

            return aNode;

        default:
            break;
    }

    return aNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSetChildTextContent',
function(aNode, aString, aTagName, aNamespaceURI) {

    /**
     * @method nodeSetChildTextContent
     * @summary Sets the text value of the node's first child element with a
     *     tag name of aTagName. This is a useful wrapper for manipulating nodes
     *     which essentially represent lists.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aString The content text to set.
     * @param {String} aTagName The tag/element name to match.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @example Set the text value of an XML element's 'goo' child:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><goo>Hi</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSetChildTextContent(xmlDoc.documentElement,
     *          'Hey',
     *          'goo');
     *          <samp>undefined</samp>
     *          TP.str(xmlDoc);
     *          <samp>&lt;foo&gt;&lt;goo&gt;Hey&lt;/goo&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @example Set the text value of an XML element's 'moo' child:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><goo>Hi</goo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSetChildTextContent(xmlDoc.documentElement,
     *          'Hey',
     *          'moo');
     *          <samp>undefined</samp>
     *          TP.str(xmlDoc);
     *          // 'moo' wasn't found, so it was added as a child
     *
     *
     *         <samp>&lt;foo&gt;&lt;goo&gt;Hey&lt;/goo&gt;&lt;moo&gt;Hey&lt;/moo&gt;&lt;/foo&gt;</samp>
     *     </code>
     * @example Set the text value of an XML element's 'bar' child, but only the
     *     one in the 'http://www.bar.com' namespace:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo xmlns="http://www.foo.com"><bar>Hi</bar><bar
     *         xmlns="http://www.bar.com">there</bar></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeSetChildTextContent(xmlDoc.documentElement,
     *          'Hey',
     *          'bar',
     *          'http://www.bar.com');
     *          <samp>undefined</samp>
     *          TP.str(xmlDoc);
     *          <samp>&lt;foo
     *         xmlns="http://www.foo.com">&lt;bar&gt;Hi&lt;bar&gt;&lt;bar
     *         xmlns="http://www.bar.com"&gt;Hey&lt;bar&gt;&lt;foo&gt;</samp>
     *     </code>
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     */

    var child,
        node,
        elemNode;

    child = TP.nodeGetFirstElementChildByTagName(aNode,
                                                    aTagName,
                                                    aNamespaceURI);
    if (TP.isElement(child)) {
        return TP.nodeSetTextContent(aString);
    } else {
        node = TP.nodeFromString(TP.join('<', aTagName, '>',
                                        aString,
                                        '</', aTagName, '>'));
        if (TP.isNode(node)) {
            elemNode = TP.elem(aNode);
            TP.nodeAppendChild(elemNode, node, false);
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  ALIASES (and wrappers)
//  ------------------------------------------------------------------------

/*
Common convenience wrappers designed primarily for the UI layers but also
very useful within TIBET code itself. These functions, along with many other
"dollar functions" in TIBET, provide high-level access to the various
underlying primitives, often helping to avoid type-checking in your code.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('canonical',
function(anObject) {

    /**
     * @method canonical
     * @summary Returns the canonical name of the object provided. This method
     *     is typically used as a simple wrapper around the primitives for
     *     element/attribute canonical names. When any other object is provided
     *     this method returns the result of TP.name(anObject).
     * @param {Object} anObject The object to interrogate.
     * @returns {String} The object's canonical name.
     * @exception TP.sig.InvalidParameter Raised when an invalid object is
     *     provided to the method.
     */

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.isElement(anObject)) {
        return TP.elementGetCanonicalName(anObject);
    } else if (TP.isAttributeNode(anObject)) {
        return TP.attributeGetCanonicalName(anObject);
    }

    return TP.name(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('doc',
function(anObject, defaultNS, shouldReport) {

    /**
     * @method doc
     * @summary Returns a native DOM Document node based on a variety of input
     *     object types including strings, nodes, or windows.
     * @param {Object} anObject A string, window, node, or other object which
     *     can provide a document or be used to construct one.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @example Obtain the document for a variety of different objects:
     *     <code>
     *          // Supplying no parameter returns a blank XML document:
     *          TP.doc();
     *          <samp>[object XMLDocument]</samp>
     *
     *          // Supplying a String parameter attempts to create an
     *          // XML document using the String as the XML content:
     *          TP.doc('<foo></foo>');
     *          <samp>[object XMLDocument]</samp>
     *
     *          // Supplying a Node parameter attempts to return the
     *          // document containing the Node or, if the Node doesn't
     *          // have a document, it returns a Document wrapping the
     *          // Node as the document element:
     *          TP.doc(TP.documentGetBody(document)) === document;
     *          <samp>true</samp>
     *
     *          // Supplying a Window parameter returns the document in
     *          // that window:
     *          TP.doc(top) === top.document;
     *          <samp>true</samp>
     *
     *          // Supplying a parameter that implements the
     *          // 'getNativeDocument' method will return the result of
     *          // sending that message. TP.core.Windows implement that
     *          // method:
     *          newWin = TP.core.Window.open();
     *          TP.doc(newWin);
     *          <samp>[object HTMLDocument]</samp>
     *     </code>
     * @returns {Document} A native document object.
     */

    var doc;

    if (TP.notValid(anObject)) {
        return TP.constructDocument();
    }

    //  for permission reasons it's important to check for xhr's early
    if (TP.isXHR(anObject)) {
        try {
            doc = anObject.responseXML;

            //  IE has the nasty habit of making an empty '#document' node
            //  here that passes TP.isNode(...) tests, but has no content
            //  because it couldn't be parsed into real XML.
            if (doc.childNodes.length === 0) {
                return TP.doc(anObject.responseText, defaultNS, shouldReport);
            } else {
                return TP.doc(doc);
            }
        } catch (e) {
            //  Moz in particular will throw exceptions on cross-domain
            return TP.doc(anObject.responseText, defaultNS, shouldReport);
        }
    }

    if (TP.isNode(anObject)) {
        doc = TP.nodeGetDocument(anObject);

        //  if the node has no document we attempt to create a new one for
        //  it and return that
        if (TP.notValid(doc)) {
            doc = TP.documentFromNode(anObject);
        }
    } else if (TP.isWindow(anObject)) {
        doc = anObject.document;
    } else if (TP.isString(anObject)) {
        doc = TP.documentFromString(anObject, defaultNS, shouldReport);
    } else if (TP.canInvoke(anObject, 'getNativeDocument')) {
        doc = anObject.getNativeDocument();
    } else if (TP.canInvoke(anObject, 'getResponseXML')) {
        return anObject.getResponseXML();
    }

    return doc;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elem',
function(anObject, defaultNS, shouldReport) {

    /**
     * @method elem
     * @summary Returns the best DOM Element representation for the object
     *     provided. For example, a document will return the documentElement, an
     *     element node will return the element itself, other node types return
     *     their parentNode, etc.
     * @param {Object} anObject Typically a Node of some form, but a wrapper
     *     such as a TP.dom.Node, TP.dom.DocumentNode, or TP.core.Window is
     *     also a workable parameter.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @returns {Element} A native Element node.
     * @exception TP.sig.InvalidParameter Raised when an invalid object is
     *     provided to the method.
     */

    var elem,

        doc,
        node;

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  for permission reasons it's important to check for xhr's early
    if (TP.isXHR(anObject)) {
        try {
            elem = anObject.responseXML;

            //  IE has the nasty habit of making an empty '#document' node
            //  here that passes TP.isNode(...) tests, but has no content
            //  because it couldn't be parsed into real XML.
            if (elem.childNodes.length === 0) {
                return TP.elem(anObject.responseText, defaultNS, shouldReport);
            } else {
                return TP.elem(elem);
            }
        } catch (e) {
            //  Moz in particular will throw exceptions on cross-domain
            return TP.elem(anObject.responseText, defaultNS, shouldReport);
        }
    }

    //  typically called with either element or document and we're trying to
    //  resolve to element or documentElement, so test those first
    if (TP.isElement(anObject)) {
        elem = anObject;
    } else if (TP.isDocument(anObject)) {
        elem = anObject.documentElement;
    } else if (TP.isFragment(anObject)) {
        elem = TP.nodeGetFirstChildElement(anObject);
    } else if (TP.isAttributeNode(anObject)) {
        elem = TP.attributeGetOwnerElement(anObject);
    } else if (TP.isNode(anObject)) {
        //  other node types should be able to return their parent element
        //  container
        elem = anObject.parentNode;
        if (!TP.isElement(elem)) {
            elem = null;
        }
    } else if (TP.isWindow(anObject)) {
        doc = anObject.document;
        if (TP.isDocument(doc)) {
            elem = doc.documentElement;
        }
    } else {
        //  call the $node wrapper which will deal with strings, wrapper
        //  types, and other data formats to get us a node
        node = TP.node(anObject, defaultNS, shouldReport);
        if (!TP.isNode(node)) {
            return;
        }

        //  don't recurse unless value changed during node transformation,
        //  in which case once we have a node we can return a decent value
        //  by calling back into this routine
        if (node !== anObject) {
            return TP.elem(node);
        }
    }

    return elem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('frag',
function(anObject, defaultNS, shouldReport) {

    /**
     * @method frag
     * @summary Returns the best DOM DocumentFragment representation of
     *     anObject. The various forms of input include strings, windows,
     *     documents, wrapper types, etc.
     * @description This method is essentially a cover for
     *     TP.fragmentFromString() and other fragment construction and
     *     extraction routines.
     * @param {Object} anObject A string, window, node, or other object which
     *     can provide a node or be used to construct one.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @example Obtain a native DOM Node from a variety of objects:
     *     <code>
     *          TP.frag('<foo></foo><bar></bar>');
     *          <samp>[object DocumentFragment]</samp>
     *          TP.frag(TP.sys.getUICanvas());
     *          <samp>[object DocumentFragment]</samp>
     *          TP.frag(TP.sys.getUICanvas().getNativeWindow());
     *          <samp>[object DocumentFragment]</samp>
     *          tpElem = TP.tpnode('<foo><bar/></foo>');
     *          <samp>[html:body HTMLBodyElement]</samp>
     *          TP.frag(tpElem);
     *          <samp>[object DocumentFragment]</samp>
     *     </code>
     * @returns {DocumentFragment} A native document fragment Node.
     */

    var frag,

        node,
        fragment;

    if (TP.notValid(anObject)) {
        return TP.documentConstructFragment(TP.XML_FACTORY_DOCUMENT);
    }

    //  for permission reasons it's important to check for xhr's early
    if (TP.isXHR(anObject)) {
        try {
            frag = anObject.responseXML;

            //  IE has the nasty habit of making an empty '#document' node
            //  here that passes TP.isNode(...) tests, but has no content
            //  because it couldn't be parsed into real XML.
            if (frag.childNodes.length === 0) {
                return TP.frag(anObject.responseText, defaultNS, shouldReport);
            } else {
                return TP.frag(frag);
            }
        } catch (e) {
            //  Moz in particular will throw exceptions on cross-domain
            return TP.frag(anObject.responseText, defaultNS, shouldReport);
        }
    }

    if (TP.isFragment(anObject)) {
        fragment = anObject;
    } else if (TP.isNode(anObject)) {
        if (TP.isDocument(node = anObject)) {
            node = anObject.documentElement;
        }

        fragment = TP.documentConstructFragment(TP.nodeGetDocument(node));

        //  Note here how we pass 'false' to *not* awaken any content that
        //  gets appended.
        TP.nodeAppendChild(fragment, node, false);
    } else if (TP.isKindOf(anObject, 'TP.dom.Node')) {
        fragment = TP.documentConstructFragment(anObject.getNativeDocument());

        //  Note here how we pass 'false' to *not* awaken any content that
        //  gets appended.
        TP.nodeAppendChild(fragment, anObject.getNativeNode(), false);
    } else if (TP.isString(anObject)) {
        fragment = TP.fragmentFromString(anObject, defaultNS, shouldReport);
    } else if (TP.isWindow(anObject)) {
        node = TP.nodeCloneNode(anObject.document.documentElement);
        fragment = TP.documentConstructFragment(TP.nodeGetDocument(node));

        //  Note here how we pass 'false' to *not* awaken any content that
        //  gets appended.
        TP.nodeAppendChild(fragment, node, false);
    } else if (TP.canInvoke(anObject, 'getNativeNode')) {
        fragment = TP.documentConstructFragment(anObject.getNativeDocument());
        if (TP.isDocument(node = anObject.getNativeNode())) {
            node = TP.nodeCloneNode(node.documentElement);
        }

        //  Note here how we pass 'false' to *not* awaken any content that
        //  gets appended.
        TP.nodeAppendChild(fragment, node, false);
    } else if (TP.canInvoke(anObject, 'getResponseXML')) {
        return TP.frag(anObject.getResponseXML());
    }

    return fragment;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('lname',
function(anObject) {

    /**
     * @method lname
     * @summary Returns the local name of the object provided. This method is
     *     typically used as a simple wrapper around the primitives for
     *     element/attribute local names. When any other object is provided this
     *     method returns the result of TP.name(anObject).
     * @param {Object} anObject The object to interrogate.
     * @returns {String} The object's local name.
     */

    if (TP.isElement(anObject)) {
        return TP.elementGetLocalName(anObject);
    } else if (TP.isAttributeNode(anObject)) {
        return TP.attributeGetLocalName(anObject);
    }

    return TP.name(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('node',
function(anObject, defaultNS, shouldReport) {

    /**
     * @method node
     * @summary Returns the best DOM node representation of anObject. The
     *     various forms of input include strings, windows, documents, wrapper
     *     types, etc.
     * @description This method is essentially a cover for TP.nodeFromString()
     *     and other node construction and extraction routines. NOTE that
     *     document objects are nodes, so you may receive a document node.
     * @param {Object} anObject A string, window, node, or other object which
     *     can provide a node or be used to construct one.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @example Obtain a native DOM Node from a variety of objects:
     *     <code>
     *          TP.node('<foo><bar/></foo>');
     *          <samp>[object Element]</samp>
     *          TP.node(TP.documentGetBody(document));
     *          <samp>[object HTMLBodyElement]</samp>
     *          TP.node(TP.documentGetBody(document)) ===
     *         TP.documentGetBody(document);
     *          <samp>true</samp>
     *          TP.node(TP.sys.getUICanvas())
     *          <samp>[object HTMLDocument]</samp>
     *          TP.node(top) === document;
     *          <samp>true</samp>
     *          TP.node(bodyTPElem);
     *          <samp>[object HTMLBodyElement]</samp>
     *          TP.node(bodyTPElem) === TP.documentGetBody(document);
     *          <samp>true</samp>
     *     </code>
     * @returns {Node} A native Node.
     * @exception TP.sig.InvalidParameter Raised when an invalid object is
     *     provided to the method.
     */

    var node;

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  for permission reasons it's important to check for xhr's early
    if (TP.isXHR(anObject)) {
        try {
            node = anObject.responseXML;

            //  IE has the nasty habit of making an empty '#document' node
            //  here that passes TP.isNode(...) tests, but has no content
            //  because it couldn't be parsed into real XML.
            if (node.childNodes.length === 0) {
                return TP.node(anObject.responseText, defaultNS, shouldReport);
            } else {
                return TP.node(node);
            }
        } catch (e) {
            //  Moz in particular will throw exceptions on cross-domain
            return TP.node(anObject.responseText, defaultNS, shouldReport);
        }
    }

    //  typically called with document or element nodes so test those first
    if (TP.isNode(anObject)) {
        return anObject;
    } else if (TP.isKindOf(anObject, 'TP.dom.Node')) {
        return anObject.getNativeNode();
    } else if (TP.isWindow(anObject)) {
        return anObject.document;
    } else if (TP.isString(anObject)) {
        return TP.nodeFromString(anObject, defaultNS, shouldReport);
    } else if (TP.canInvoke(anObject, 'getNativeNode')) {
        return anObject.getNativeNode();
    } else if (TP.canInvoke(anObject, 'getResponseXML')) {
        return anObject.getResponseXML();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('prefix',
function(anObject) {

    /**
     * @method prefix
     * @summary Returns the prefix, if any, of the object provided. The object
     *     should be a Node of some form. Note that only element and attribute
     *     nodes will have a valid prefix. All other objects will return null.
     * @param {Object} anObject The object to interrogate.
     * @returns {String} The object's prefix, if any.
     * @exception TP.sig.InvalidParameter Raised when an invalid object is
     *     provided to the method.
     */

    var name,
        res;

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    name = TP.qname(anObject);
    res = name.match(TP.regex.SCHEME);
    if (TP.isArray(res)) {
        return res.at(1);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('qname',
function(anObject) {

    /**
     * @method qname
     * @summary Returns the "qualified" or QName of the object provided.
     * @description This method is typically used as a simple wrapper around the
     *     primitives for element/attribute "full names". When any other object
     *     is provided this method returns the result of TP.name(anObject). NOTE
     *     that an object's QName is not always its "canonical name". For
     *     example, TIBET uses the prefix 'xforms:' for XForms elements as the
     *     canonical prefix, however many XForms authors prefer 'xf:'. QNames
     *     for such elements return 'xf:', while TP.canonical(anObject) would
     *     return 'xforms:*' instead.
     * @param {Object} anObject The object to interrogate.
     * @returns {String} The object's qualified name, or QName.
     * @exception TP.sig.InvalidParameter Raised when an invalid object is
     *     provided to the method.
     */

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.isElement(anObject)) {
        return TP.elementGetFullName(anObject);
    } else if (TP.isAttributeNode(anObject)) {
        return TP.attributeGetFullName(anObject);
    }

    return TP.name(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('tpdoc',
function(anObject, defaultNS, shouldReport) {

    /**
     * @method tpdoc
     * @summary Returns the best TP.dom.DocumentNode representation of
     *     anObject based on a variety of input object types.
     * @param {Object} anObject A string, window, node, or other object which
     *     can provide a document or be used to construct one.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @returns {TP.dom.DocumentNode} A TIBET document wrapper.
     */

    var doc;

    if (TP.notValid(anObject)) {
        return TP.dom.DocumentNode.construct(TP.constructDocument());
    }

    //  already one? don't want to unwrap/rewrap...
    if (TP.isKindOf(anObject, 'TP.dom.DocumentNode')) {
        return anObject;
    }

    //  for permission reasons it's important to check for xhr's early
    if (TP.isXHR(anObject)) {
        try {
            doc = anObject.responseXML;

            //  IE has the nasty habit of making an empty '#document' node
            //  here that passes TP.isNode(...) tests, but has no content
            //  because it couldn't be parsed into real XML.
            if (doc.childNodes.length === 0) {
                doc = TP.documentFromString(anObject.responseText,
                                            defaultNS,
                                            shouldReport);
                if (TP.isDocument(doc)) {
                    return TP.dom.DocumentNode.construct(doc);
                }
            } else {
                return TP.dom.DocumentNode.construct(doc);
            }
        } catch (e) {
            //  Moz in particular will throw exceptions on cross-domain
            doc = TP.documentFromString(anObject.responseText,
                                        defaultNS,
                                        shouldReport);
            if (TP.isDocument(doc)) {
                return TP.dom.DocumentNode.construct(doc);
            }
        }
    }

    //  typically called with document or element nodes so test those first
    if (TP.isDocument(anObject)) {
        return TP.dom.DocumentNode.construct(anObject);
    } else if (TP.isNode(anObject)) {
        doc = TP.nodeGetDocument(anObject);
        if (TP.isDocument(doc)) {
            return TP.dom.DocumentNode.construct(doc);
        }
    } else if (TP.isKindOf(anObject, 'TP.dom.Node')) {
        return anObject.getDocument();
    } else if (TP.isWindow(anObject)) {
        return TP.dom.DocumentNode.construct(anObject.document);
    } else if (TP.isString(anObject)) {
        doc = TP.documentFromString(anObject, defaultNS, shouldReport);
        if (TP.isDocument(doc)) {
            return TP.dom.DocumentNode.construct(doc);
        }
    } else if (TP.canInvoke(anObject, 'getDocument')) {
        return anObject.getDocument();
    } else if (TP.canInvoke(anObject, 'getResponseXML')) {
        return TP.dom.DocumentNode.construct(anObject.getResponseXML());
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('tpelem',
function(anObject, defaultNS, shouldReport) {

    /**
     * @method tpelem
     * @summary Returns the best TP.dom.ElementNode representation of the
     *     object based on a variety of input formats.
     * @param {Object} anObject Typically a Node of some form, but a wrapper
     *     such as a TP.dom.Node, TP.dom.DocumentNode, or TP.core.Window is
     *     also a workable parameter.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @returns {TP.dom.ElementNode} A TIBET element wrapper.
     * @exception TP.sig.InvalidParameter Raised when an invalid object is
     *     provided to the method.
     */

    var elem;

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  already one? don't want to unwrap/rewrap...
    if (TP.isKindOf(anObject, 'TP.dom.ElementNode')) {
        return anObject;
    }

    //  get best element rep we can from whatever it is...
    elem = TP.elem(anObject, defaultNS, shouldReport);
    if (TP.isElement(elem)) {
        return TP.dom.ElementNode.construct(elem);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('tpfrag',
function(anObject, defaultNS, shouldReport) {

    /**
     * @method tpfrag
     * @summary Returns the TP.dom.DocumentFragmentNode representation of the
     *     object based on a variety of input formats.
     * @param {Object} anObject Typically a Node of some form, but a wrapper
     *     such as a TP.dom.Node, TP.dom.DocumentNode, or TP.core.Window is
     *     also a workable parameter.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @returns {TP.dom.DocumentFragmentNode} A TIBET document fragment
     *     wrapper.
     */

    var frag;

    if (TP.notValid(anObject)) {
        return TP.dom.DocumentFragmentNode.construct(
                    TP.documentConstructFragment(TP.XML_FACTORY_DOCUMENT));
    }

    //  already one? don't want to unwrap/rewrap...
    if (TP.isKindOf(anObject, 'TP.dom.DocumentFragmentNode')) {
        return anObject;
    }

    //  get best fragment rep we can from whatever it is...
    frag = TP.frag(anObject, defaultNS, shouldReport);
    if (TP.isFragment(frag)) {
        return TP.dom.DocumentFragmentNode.construct(frag);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('tpnode',
function(anObject, defaultNS, shouldReport) {

    /**
     * @method tpnode
     * @summary A general purpose routine that can return a TIBET node wrapper
     *     based on a variety of input object types. NOTE that this method is
     *     less discriminating than TP.tpelem() in that it can return a wrapper
     *     for virtually any Node type.
     * @description This method is essentially a cover for creation of a
     *     TP.dom.Node from TP.nodeFromString() and other node construction and
     *     extraction routines. NOTE that document objects are nodes, so you may
     *     receive a document node.
     * @param {Object} anObject A string, window, node, or other object which
     *     can provide a node or be used to construct one.
     * @param {String|null} defaultNS What namespace should be used for the
     *     'default namespace' for element markup in the supplied String.
     *     Note that this should be an XML 'namespace URI' (i.e.
     *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
     *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
     *     the empty String ('') here. To not specify any default namespace
     *     value and let the parser do what it does natively, supply null here.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @example Obtain an instance of a TIBET TP.dom.Node subtype from a
     *     variety of objects:
     *     <code>
     *          TP.tpnode('<foo><bar/></foo>');
     *          <samp>[TP.dom.ElementNode Element]</samp>
     *          TP.tpnode(TP.documentGetBody(document));
     *          <samp>[html:body HTMLBodyElement]</samp>
     *          TP.tpnode(TP.sys.getUICanvas());
     *          <samp>[TP.dom.DocumentNode HTMLDocument]</samp>
     *          TP.tpnode(TP.sys.getUICanvas().getNativeWindow());
     *          <samp>[TP.dom.DocumentNode HTMLDocument]</samp>
     *          TP.tpnode(document);
     *          <samp>[TP.dom.DocumentNode HTMLDocument]</samp>
     *          bodyTPElem = TP.tpnode(TP.documentGetBody(document));
     *          <samp>[html:body HTMLBodyElement]</samp>
     *          TP.tpnode(bodyTPElem);
     *          <samp>[html:body HTMLBodyElement]</samp>
     *          TP.tpnode(bodyTPElem) === bodyTPElem;
     *          <samp>true</samp>
     *          topTPWin = TP.tpwin(TP.sys.getUICanvas());
     *          <samp>(UI canvas window name)</samp>
     *          TP.tpnode(topTPWin);
     *          <samp>[TP.dom.DocumentNode HTMLDocument]</samp>
     *     </code>
     * @returns {Node} A native Node.
     * @exception TP.sig.InvalidParameter Raised when an invalid object is
     *     provided to the method.
     */

    var node,
        resp,
        content;

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  already one? don't want to unwrap/rewrap...
    if (TP.isKindOf(anObject, 'TP.dom.Node')) {
        return anObject;
    }

    //  for permission reasons it's important to check for xhr's early
    if (TP.isXHR(anObject)) {
        try {
            node = anObject.responseXML;

            //  IE has the nasty habit of making an empty '#document' node
            //  here that passes TP.isNode(...) tests, but has no content
            //  because it couldn't be parsed into real XML.
            if (node.childNodes.length === 0) {
                node = TP.nodeFromString(anObject.responseText,
                                            defaultNS,
                                            shouldReport);
                if (TP.isNode(node)) {
                    return TP.dom.Node.construct(node);
                }
            } else {
                return TP.dom.Node.construct(node);
            }
        } catch (e) {
            //  Moz in particular will throw exceptions on cross-domain
            node = TP.nodeFromString(
                        anObject.responseText, defaultNS, shouldReport);
            if (TP.isNode(node)) {
                return TP.dom.Node.construct(node);
            }
        }
    }

    //  typically called with document or element nodes so test those first
    if (TP.isNode(anObject)) {
        return TP.dom.Node.construct(anObject);
    } else if (TP.isKindOf(anObject, 'TP.dom.Node')) {
        return anObject;
    } else if (TP.isWindow(anObject)) {
        return TP.dom.DocumentNode.construct(anObject.document);
    } else if (TP.isString(anObject)) {
        node = TP.nodeFromString(anObject, defaultNS, shouldReport);
        if (TP.isNode(node)) {
            return TP.dom.Node.construct(node);
        }
    } else if (TP.canInvoke(anObject, 'getData')) {
        //  Content objects often get asked for nodes. If it's an XMLContent
        //  object of some form it should work via getData.
        resp = anObject.getData();
        if (TP.isKindOf(resp, 'TP.dom.Node')) {
            return resp;
        }
        if (TP.isNode(resp)) {
            content = TP.wrap(resp);
            if (TP.isKindOf(content, 'TP.dom.Node')) {
                return content;
            }
        }
    } else if (TP.canInvoke(anObject, 'getResource')) {
        //  content will be a Node - we want a TP.dom.Node
        resp = anObject.getResource(
            TP.hc('async', false, 'resultType', TP.DOM));
        content = TP.wrap(resp.get('result'));

        if (TP.isKindOf(content, 'TP.dom.Node')) {
            return content;
        }
    } else if (TP.canInvoke(anObject, 'getResponseXML')) {
        return TP.dom.Node.construct(anObject.getResponseXML());
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
