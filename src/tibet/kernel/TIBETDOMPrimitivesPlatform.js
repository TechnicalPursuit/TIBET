//  ========================================================================
/*
NAME:   TIBETDOMPrimitivesPlatform.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ========================================================================

/*
@file           TIBETDOMPrimitivesPlatform.js
@abstract       DOM primitives (manipulations specific to - or commonly
                associated with - non-visible DOM elements). The various
                primitives here provide platform-specific support for common
                DOM operations across HTML and XML DOM trees.
*/

/* JSHint checking */

/* global ActiveXObject:false,
          $$scalarExtractionDoc:true,
          $$numericFuncRegExp:true,
          $$pathValueOfNode:true
*/

//  ------------------------------------------------------------------------
//  UTILITY METHODS
//  ------------------------------------------------------------------------

TP.definePrimitive('$documentSetupNamespaces',
TP.hc(
    'test',
    'trident',
    'true',
    function(aDocument) {

        /**
         * @name $documentSetupNamespaces
         * @synopsis Examine the document and pull out any namespaces, along
         *     with their prefixes, for use in XPaths in the document. NB: This
         *     is a private method to Internet Explorer only.
         * @description This method is a rewrite of a snippet by Dimitre
         *     Novatchev (dnovatchev@yahoo.com) to fit TIBET coding
         *     style/standards.
         * @param {XMLDocument} aDocument The document to use.
         * @raises TP.sig.InvalidXMLDocument
         */

        var namespaceNodes,
            numNamespaces,

            arrayNamespaces,
            textArray,

            i,
            aNamespaceNode,
            namespaceXML;

        if (!TP.isXMLDocument(aDocument)) {
            return TP.raise(this, 'TP.sig.InvalidXMLDocument', arguments);
        }

        //  Grab all of the namespace nodes from every element in the
        //  document.
        try {
            namespaceNodes = aDocument.documentElement.selectNodes(
                                                        '//namespace::*');
        } catch (e) {
            //  We raise an exception here, but its not fatal so we move on.
            TP.raise(this, 'TP.sig.DOMException', arguments, TP.ec(e));

            return aDocument;
        }

        numNamespaces = namespaceNodes.length - 1;
        namespaceXML = '';

        //  If we actually found namespace nodes, iterate over them and
        //  build up a uniqued, space-separated list of namespace URIs that
        //  will be found in the document.
        if (numNamespaces >= 0) {
            //  Construct an Array, although we'll use it as a hash later.
            arrayNamespaces = new Array(numNamespaces);
            textArray = TP.ac();

            for (i = 0; i <= numNamespaces; i++) {
                aNamespaceNode = namespaceNodes.item(i);

                //  The 'xml' of the namespace node is the namespace's URI
                //  value.
                namespaceXML = aNamespaceNode.xml;

                //  Make sure that we don't get the 'xml' namespace itself
                //  here. IE has real problems with that because its already
                //  defined it. Also, we will never query for default
                //  namespaces (i.e. 'xmlns=') and a document could have
                //  more than 1 of those, which would cause real problems
                //  here, so we filter those out too. Also, we filter
                //  duplicates here as well.
                if ((namespaceXML.substr(0, 9) !== 'xmlns:xml') &&
                    (namespaceXML.substr(0, 6) !== 'xmlns=') &&
                    (TP.notTrue(arrayNamespaces[namespaceXML]))) {
                    //  Set a boolean flag at that point in the Array.
                    arrayNamespaces[namespaceXML] = true;

                    //  Concat it onto the namespace text that we'll use
                    //  later.
                    textArray.push(namespaceXML);
                }
            }
        }

        aDocument.setProperty('SelectionNamespaces', textArray.join(' '));

        return;
    },
    TP.DEFAULT,
    function(aDocument) {

        //  On other platforms, this is a no-op.

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$$xpathResolverFunction',
TP.hc(
    'test',
    'trident',
    'true',
    function(aPrefix) {

        //  On the Trident platform, this is not used.

        return;
    },
    TP.DEFAULT,
    function(aPrefix) {

        /**
         * @name $$xpathResolverFunction
         * @synopsis Resolves the supplied prefix into a matching namespace URI.
         * @param {String} aPrefix The prefix to use to look up a namespace URI.
         * @returns {String} The namespace URI that matches the supplied prefix.
         */

        var namespaceURI;

        if (TP.notEmpty(aPrefix) &&
            TP.isString(namespaceURI = TP.w3.Xmlns.getPrefixURI(aPrefix))) {
            return namespaceURI;
        }

        return null;
    }
));

//  ------------------------------------------------------------------------
//  ATTRIBUTE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('attributeGetLocalName',
TP.hc(
    'test',
    'trident',
    'true',
    function(anAttributeNode) {

        /**
         * @name attributeGetLocalName
         * @synopsis Returns the local name (that is, the name without the
         *     prefix) of the supplied attribute node.
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
         * @raise TP.sig.InvalidAttributeNode Raised when a non-attribute Node
         *     has been supplied to the method.
         * @todo
         */

        var lname,
            index;

        if (!TP.isAttributeNode(anAttributeNode)) {
            return TP.raise(this, 'TP.sig.InvalidAttributeNode', arguments);
        }

        //  If its an XML document, then we return 'baseName'.
        if (TP.isXMLDocument(TP.nodeGetDocument(anAttributeNode))) {
            return anAttributeNode.baseName;
        }

        lname = anAttributeNode.name;
        if ((index = lname.indexOf(':')) !== -1) {
            lname = lname.slice(index + 1);
        }

        return lname;
    },
    TP.DEFAULT,
    function(anAttributeNode) {

        /**
         * @name attributeGetLocalName
         * @synopsis Returns the local name (that is, the name without the
         *     prefix) of the supplied attribute node.
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
         * @raise TP.sig.InvalidAttributeNode Raised when a non-attribute Node
         *     has been supplied to the method.
         * @todo
         */

        var lname,
            index;

        if (!TP.isAttributeNode(anAttributeNode)) {
            return TP.raise(this, 'TP.sig.InvalidAttributeNode', arguments);
        }

        //  W3C-compliant browsers make no distinction between XML and HTML
        //  documents here. If the attribute is in an HTML document, the
        //  'whole name' will be returned since there is no concept of
        //  prefixes, namespaces, etc.
        lname = anAttributeNode.localName;
        if ((index = lname.indexOf(':')) !== -1) {
            lname = lname.slice(index + 1);
        }

        return lname;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('attributeGetOwnerElement',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(anAttributeNode) {

        /**
         * @name attributeGetOwnerElement
         * @synopsis Returns the owning element of the supplied attribute node.
         *     NOTE: This method only works on attribute nodes that exist on
         *     elements in an XML document.
         * @param {Attribute} anAttributeNode The attribute node to retrieve the
         *     owner element for.
         * @example Obtain the owner element for an attribute node:
         *     <code>
         *          xmlDoc = TP.doc('<foo bar="baz"/>');
         *          attrNode = xmlDoc.documentElement.getAttributeNode(
         *          'bar');
         *          TP.attributeGetOwnerElement(attrNode).tagName;
         *          <samp>foo</samp>
         *     </code>
         * @returns {Element} The owner element of the supplied attribute node.
         * @raise TP.sig.InvalidAttributeNode Raised when a non-attribute Node
         *     has been supplied to the method.
         * @raise TP.sig.InvalidXMLDocument Raised when the supplied attribute
         *     Node is not part of an XML document.
         * @todo
         */

        if (!TP.isAttributeNode(anAttributeNode)) {
            return TP.raise(this, 'TP.sig.InvalidAttributeNode', arguments);
        }

        return anAttributeNode.ownerElement;
    },
    'trident',
    function(anAttributeNode) {

        /**
         * @name attributeGetOwnerElement
         * @synopsis Returns the owning element of the supplied attribute node.
         *     NOTE: This method only works on attribute nodes that exist on
         *     elements in an XML document.
         * @param {Attribute} anAttributeNode The attribute node to retrieve the
         *     owner element for.
         * @example Obtain the owner element for an attribute node:
         *     <code>
         *          xmlDoc = TP.doc('<foo bar="baz"/>');
         *          attrNode = xmlDoc.documentElement.getAttributeNode(
         *          'bar');
         *          TP.attributeGetOwnerElement(attrNode).tagName;
         *          <samp>foo</samp>
         *     </code>
         * @returns {Element} The owner element of the supplied attribute node.
         * @raise TP.sig.InvalidAttributeNode Raised when a non-attribute Node
         *     has been supplied to the method.
         * @raise TP.sig.InvalidXMLDocument Raised when the supplied attribute
         *     Node is not part of an XML document.
         * @todo
         */

        if (!TP.isAttributeNode(anAttributeNode)) {
            return TP.raise(this, 'TP.sig.InvalidAttributeNode', arguments);
        }

        //  This only works on XML documents in IE
        if (!TP.isXMLDocument(TP.nodeGetDocument(anAttributeNode))) {
            return TP.raise(this, 'TP.sig.InvalidXMLDocument', arguments);
        }

        //  Since IE doesn't support DOM Level 2 (where Attribute nodes got
        //  an ownerElement slot), we use XPath here to get the attribute
        //  node's owning element.
        return anAttributeNode.selectSingleNode('..');
    },
    'webkit',
    function(anAttributeNode) {

        /**
         * @name attributeGetOwnerElement
         * @synopsis Returns the owning element of the supplied attribute node.
         *     NOTE: This method only works on attribute nodes that exist on
         *     elements in an XML document.
         * @param {Attribute} anAttributeNode The attribute node to retrieve the
         *     owner element for.
         * @example Obtain the owner element for an attribute node:
         *     <code>
         *          xmlDoc = TP.doc('<foo bar="baz"/>');
         *          attrNode = xmlDoc.documentElement.getAttributeNode(
         *          'bar');
         *          TP.attributeGetOwnerElement(attrNode).tagName;
         *          <samp>foo</samp>
         *     </code>
         * @returns {Element} The owner element of the supplied attribute node.
         * @raise TP.sig.InvalidAttributeNode Raised when a non-attribute Node
         *     has been supplied to the method.
         * @raise TP.sig.InvalidXMLDocument Raised when the supplied attribute
         *     Node is not part of an XML document.
         * @todo
         */

        if (!TP.isAttributeNode(anAttributeNode)) {
            return TP.raise(this, 'TP.sig.InvalidAttributeNode', arguments);
        }

        //  For some reason, DOM Level 4 removes 'ownerElement'
        if (!TP.isElement(anAttributeNode.ownerElement)) {
            return TP.nodeEvaluateXPath(anAttributeNode, '..');
        }
    }
));

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('createDocument',
TP.hc(
    'test',
    'trident',
    'true',
    function(aNamespace, aTagname, versionNumber) {

        /**
         * @name createDocument
         * @synopsis Creates an XML document. Note that if a tag name isn't
         *     supplied to this method, a documentElement will *not* be created
         *     for the returned document.
         * @param {String} aNamespace The namespace to use. Defaults to the null
         *     namespace.
         * @param {String} aTagname The element name to use for the document
         *     element. Defaults to ''.
         * @param {Number} versionNumber A specific version number which must be
         *     returned as a minimum version. Defaults to the latest version.
         * @example Create an XML document, with no namespace and no document
         *     element:
         *     <code>
         *          xmlDoc = TP.createDocument();
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp></samp>
         *     </code>
         * @example Create an XML document, with no namespace and a document
         *     element of 'foo':
         *     <code>
         *          xmlDoc = TP.createDocument(null, 'foo');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns=""/&gt;</samp>
         *     </code>
         * @example Create an XML document, with a default namespace of
         *     'http://www.bar.com' and a document element of 'foo':
         *     <code>
         *          xmlDoc = TP.createDocument('http://www.bar.com', 'foo');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns="http://www.bar.com"/&gt;</samp>
         *     </code>
         * @example Create an XML document, with a 'bar' prefixed namespace of
         *     'http://www.bar.com' and a document element of 'foo':
         *     <code>
         *          xmlDoc = TP.createDocument('http://www.bar.com',
         *          'bar:foo');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;bar:foo xmlns:bar="http://www.bar.com"/&gt;</samp>
         *     </code>
         * @returns {XMLDocument} The newly created XML document.
         * @todo
         */

        var theNamespace,
            theTagName,
            parts,

            versions,
            i,
            doc,

            newDocStr;

        theNamespace = aNamespace;
        theTagName = TP.notValid(aTagname) ? '' : aTagname;

        if (TP.isNumber(versionNumber)) {
            //  asked for a specific version...
            switch (versionNumber) {
                case 2:
                    doc = new ActiveXObject('Msxml2.DOMDocument');
                    break;
                case 3:
                    doc = new ActiveXObject('Msxml2.DOMDocument.3.0');
                    break;
                /*
                NB: MSXML versions 4 and 5 are not recommended by Microsoft
                case 4:
                    doc = new ActiveXObject('Msxml2.DOMDocument.4.0');
                    break;
                case 5:
                    doc = new ActiveXObject('Msxml2.DOMDocument.5.0');
                    break;
                */
                case 6:
                    doc = new ActiveXObject('Msxml2.DOMDocument.6.0');
                    break;
                default:
                    return TP.raise(null, 'TP.sig.InvalidParameter',
                                    arguments, 'Msxml version: ' +
                                                versionNumber +
                                                ' not valid.');
            }
        } else {
            //  attempt to get the latest and greatest version possible
            versions = TP.IE_DOM_DOCUMENT_VERSIONS;
            for (i = 0; i < versions.length; i++) {
                try {
                    doc = new ActiveXObject(versions[i]);
                    break;
                } catch (e) {
                }
            }

            if (TP.notValid(doc)) {
                return TP.raise(null, 'TP.sig.InvalidParameter', arguments,
                                    'Unable to create a DOM Document.');
            }
        }

        //  configure to avoid overhead and keep this process synchronous
        doc.resolveExternals = false;
        doc.validateOnParse = false;

        doc.async = false;

        doc.setProperty('SelectionLanguage', 'XPath');
        doc.setProperty('ProhibitDTD', false);

        //  If either the namespace name or tag name was supplied, we'll
        //  need this.
        newDocStr = TP.ac(TP.XML_10_HEADER, '\n');

        //  If we were handed both a namespace and a root tag name (or just
        //  a root tag name), then we should build a document by building
        //  the standard XML header (with the XML declaration) along with
        //  that tag name and/or namespace.
        if (TP.notEmpty(theNamespace) && TP.notEmpty(theTagName)) {
            parts = theTagName.split(':');
            if (parts.length > 1) {
                newDocStr.push('<', theTagName, ' xmlns:', parts[0], '="',
                                    theNamespace, '"></', theTagName, '>');
            } else {
                newDocStr.push('<', theTagName, ' xmlns="', theNamespace,
                                '"></', theTagName, '>');
            }

            doc.loadXML(newDocStr.join(''));
        } else if (TP.isEmpty(theNamespace) && TP.notEmpty(theTagName)) {
            newDocStr.push('<', theTagName,
                            ' xmlns=""></', theTagName, '>');

            doc.loadXML(newDocStr.join(''));
        } else if (TP.notEmpty(theTagName)) {
            newDocStr.push('<', theTagName, '></', theTagName, '>');

            doc.loadXML(newDocStr.join(''));
        }

        //  Return the newly created XML document, whether it was loaded
        //  with starter XML' or not.
        return doc;
    },
    TP.DEFAULT,
    function(aNamespace, aTagname) {

        /**
         * @name createDocument
         * @synopsis Creates an XML document. Note that if a tag name isn't
         *     supplied to this method, a documentElement will *not* be created
         *     for the returned document.
         * @param {String} aNamespace The namespace to use. Defaults to the null
         *     namespace.
         * @param {String} aTagname The element name to use for the document
         *     element. Defaults to ''.
         * @example Create an XML document, with no namespace and no document
         *     element:
         *     <code>
         *          xmlDoc = TP.createDocument();
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp></samp>
         *     </code>
         * @example Create an XML document, with no namespace and a document
         *     element of 'foo':
         *     <code>
         *          xmlDoc = TP.createDocument(null, 'foo');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns=""/&gt;</samp>
         *     </code>
         * @example Create an XML document, with a default namespace of
         *     'http://www.bar.com' and a document element of 'foo':
         *     <code>
         *          xmlDoc = TP.createDocument('http://www.bar.com', 'foo');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns="http://www.bar.com"/&gt;</samp>
         *     </code>
         * @example Create an XML document, with a 'bar' prefixed namespace of
         *     'http://www.bar.com' and a document element of 'foo':
         *     <code>
         *          xmlDoc = TP.createDocument('http://www.bar.com',
         *          'bar:foo');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;bar:foo xmlns:bar="http://www.bar.com"/&gt;</samp>
         *     </code>
         * @returns {XMLDocument} The newly created XML document.
         * @todo
         */

        var theNamespace,
            theTagName,
            parts,

            newDocStr;

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

            return TP.documentFromString(newDocStr);
        } else if (TP.isEmpty(theNamespace) && TP.notEmpty(theTagName)) {
            newDocStr = TP.join('<', theTagName, ' xmlns="">',
                                '</', theTagName, '>');

            return TP.documentFromString(newDocStr);
        } else if (TP.notEmpty(theTagName)) {
            //  Otherwise, we were just handed a root tag name, so go ahead
            //  and use that.
            newDocStr = TP.join('<', theTagName, '></', theTagName, '>');

            return TP.documentFromString(newDocStr);
        }

        //  They were both empty, so just use the 'createDocument' call.
        return document.implementation.createDocument('', '', null);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCreateElement',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(aDocument, elementName, elementNS) {

        /**
         * @name documentCreateElement
         * @synopsis Creates a new element in the document and namespace
         *     provided.
         * @param {Document} aDocument The document that will contain the new
         *     element.
         * @param {String} elementName The element type.
         * @param {String} elementNS The namespace to use.
         * @example Create an HTML element in an HTML document:
         *     <code>
         *          TP.documentCreateElement(document, 'span');
         *          <samp>[object HTMLSpanElement]</samp>
         *     </code>
         * @example Create an XHTML element in an XML document:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo
         *         xmlns="http://www.foo.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.documentCreateElement(xmlDoc, 'span', TP.w3.Xmlns.XHTML);
         *          <samp>[object HTMLSpanElement]</samp>
         *     </code>
         * @returns {Element} The newly created Element.
         * @raise TP.sig.InvalidDocument Raised when an invalid document is
         *     provided to the method.
         * @raise TP.sig.InvalidString Raised when a null or empty element name
         *     is provided to the method.
         * @raise TP.sig.DOMCreateException Raised when the element cannot be
         *     created in the supplied document.
         * @todo
         */

        var aNamespace,
            newElement;

        if (!TP.isDocument(aDocument)) {
            return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
        }

        if (TP.isEmpty(elementName)) {
            return TP.raise(this, 'TP.sig.InvalidElementType', arguments);
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
            return TP.raise(this, 'TP.sig.DOMCreateException',
                            arguments, TP.ec(e));
        }

        return newElement;
    },
    'trident',
    function(aDocument, elementName, elementNS) {

        /**
         * @name documentCreateElement
         * @synopsis Creates a new element in the document and namespace
         *     provided.
         * @param {Document} aDocument The document that will contain the new
         *     element.
         * @param {String} elementName The element type.
         * @param {String} elementNS The namespace to use.
         * @example Create an HTML element in an HTML document:
         *     <code>
         *          TP.documentCreateElement(document, 'span');
         *          <samp>[object HTMLSpanElement]</samp>
         *     </code>
         * @example Create an XHTML element in an XML document:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo
         *         xmlns="http://www.foo.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.documentCreateElement(xmlDoc, 'span', TP.w3.Xmlns.XHTML);
         *          <samp>[object HTMLSpanElement]</samp>
         *     </code>
         * @returns {Element} The newly created Element.
         * @raise TP.sig.InvalidDocument Raised when an invalid document is
         *     provided to the method.
         * @raise TP.sig.InvalidString Raised when a null or empty element name
         *     is provided to the method.
         * @raise TP.sig.DOMCreateException Raised when the element cannot be
         *     created in the supplied document.
         * @todo
         */

        var aNamespace,
            newElement,
            prefix;

        if (!TP.isDocument(aDocument)) {
            return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
        }

        if (TP.isEmpty(elementName)) {
            return TP.raise(this, 'TP.sig.InvalidElementType', arguments);
        }

        //  The namespace is the 'null namespace' by default.
        aNamespace = TP.ifInvalid(elementNS, '');

        try {
            if (TP.isXMLDocument(aDocument)) {
                //  Since MSXML doesn't support DOM Level 2, we have to use
                //  proprietary DOM calls to put elements in namespaces.
                newElement = aDocument.createNode(Node.ELEMENT_NODE,
                                                    elementName,
                                                    aNamespace);
            } else if (TP.notEmpty(aNamespace)) {
                //  If the elementNS isn't XHTML and has a prefix, then the
                //  wacky IE procedure is to concat the prefix onto the
                //  front of it (i.e. 'v:group' for a VML group) - if it
                //  doesn't already have a prefix.
                if ((aNamespace !== TP.w3.Xmlns.XHTML) &&
                    TP.notEmpty(prefix = TP.w3.Xmlns.get('info').at(
                                                aNamespace).at('prefix')) &&
                    !TP.regex.HAS_COLON.test(elementName)) {
                    newElement = aDocument.createElement(
                                                prefix + ':' + elementName);
                } else {
                    newElement = aDocument.createElement(elementName);
                }

                //  We also put an xmlns on it for grins (although its
                //  doubtful that it does all that much - you can't normally
                //  set the default namespace).
                TP.elementSetAttribute(newElement, 'xmlns', aNamespace);
            } else {
                //  Otherwise, no namespace was defined, so just do a
                //  regular createElement().
                newElement = aDocument.createElement(elementName);
            }
        } catch (e) {
            return TP.raise(this, 'TP.sig.DOMCreateException',
                            arguments, TP.ec(e));
        }

        return newElement;
    },
    'webkit',
    function(aDocument, elementName, elementNS) {

        /**
         * @name documentCreateElement
         * @synopsis Creates a new element in the document and namespace
         *     provided.
         * @param {Document} aDocument The document that will contain the new
         *     element.
         * @param {String} elementName The element type.
         * @param {String} elementNS The namespace to use.
         * @example Create an HTML element in an HTML document:
         *     <code>
         *          TP.documentCreateElement(document, 'span');
         *          <samp>[object HTMLSpanElement]</samp>
         *     </code>
         * @example Create an XHTML element in an XML document:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo
         *         xmlns="http://www.foo.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.documentCreateElement(xmlDoc, 'span', TP.w3.Xmlns.XHTML);
         *          <samp>[object HTMLSpanElement]</samp>
         *     </code>
         * @returns {Element} The newly created Element.
         * @raise TP.sig.InvalidDocument Raised when an invalid document is
         *     provided to the method.
         * @raise TP.sig.InvalidString Raised when a null or empty element name
         *     is provided to the method.
         * @raise TP.sig.DOMCreateException Raised when the element cannot be
         *     created in the supplied document.
         * @todo
         */

        var aNamespace,
            newElement;

        if (!TP.isDocument(aDocument)) {
            return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
        }

        if (TP.isEmpty(elementName)) {
            return TP.raise(this, 'TP.sig.InvalidElementType', arguments);
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
            return TP.raise(this, 'TP.sig.DOMCreateException',
                            arguments, TP.ec(e));
        }

        return newElement;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('documentFromString',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(aString, defaultNS, shouldReport) {

        /**
         * @name documentFromString
         * @synopsis Parses aString and returns the XML document representing
         *     the string's DOM representation.
         * @param {String} aString The source string to be parsed.
         * @param {String|null} defaultNS What namespace should be used for the
         *     'default namespace' for element markup in the supplied String.
         *     Note that this should be an XML 'namespace URI' (i.e.
         *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
         *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
         *     the empty String ('') here. To not specify any default namespace
         *     value and let the parser do what it does natively, supply null
         *     here.
         * @param {Boolean} shouldReport False to turn off exception reporting
         *     so strings can be tested for XML compliance without causing
         *     exceptions to be thrown.
         * @example Create an XML document from a String:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp><foo><bar/></foo></samp>
         *     </code>
         * @returns {XMLDocument} The XML document parsed from the string.
         * @raise TP.sig.DOMParseException Raised if the supplied String cannot
         *     be parsed into a proper XML DOM construct and the shouldReport
         *     flag is true.
         * @todo
         */

        var report,
            parser,

            str,

            xmlDoc,

            errorElement,
            errorMatchResults,
            errorRecord,
            list;

        report = TP.ifInvalid(shouldReport, false);

        //  force to true when TIBET is configured for parse debugging
        report = TP.ifInvalid(report, TP.sys.shouldReportParseErrors());

        //  NB: Do *not* change these to 'TIBET primitives' (like
        //  TP.isEmpty()) as this method gets used early in the booting
        //  process.

        //  String without valid markup? Not XML then.
        if (aString === '' ||
            !/^[\s\w]*</.test(aString) ||
            (aString.length < '<a/>'.length)) {
            return;
        }

        try {
            parser = new DOMParser();

            //  If the caller has specified a default namespace, use it here.
            if (TP.isString(defaultNS)) {
                str = '<root xmlns="' + defaultNS + '"';
            } else {
                str = '<root';
            }

            //  if TIBET has the 'TP.w3.Xmlns' type loaded, we leverage XMLNS
            //  'auto-qualification'
            if (TP.isType(TP.sys.getTypeByName('TP.w3.Xmlns'))) {
                str = aString.replace(
                    TP.regex.ALL_ELEM_MARKUP,
                    str + ' ' + TP.w3.Xmlns.get('XMLNSDefs') + '>$&</root>');
            } else {
                str = aString.replace(
                    TP.regex.ALL_ELEM_MARKUP,
                    str + '>$&</root>');
            }

            xmlDoc = parser.parseFromString(str, TP.XML_ENCODED);

            //  If there is an Element named 'parsererror', that is
            //  Mozilla's way of telling us that a parser error
            //  occurred ;-).
            if (xmlDoc.documentElement.nodeName === 'parsererror') {
                errorElement = xmlDoc.documentElement;

                //  Sometimes we don't want to report an error from here
                //  because we're calling this from the logging itself and
                //  we would recurse (or we're just 'tasting' the String).
                if (TP.notFalse(report)) {
                    //  Sometimes there is more information to go with the
                    //  parser error. If so, build a record of that
                    //  information to report with the exception.
                    if (TP.isNode(errorElement.firstChild)) {
                        errorMatchResults = TP.regex.GECKO_XML_PARSE.exec(
                                        errorElement.firstChild.nodeValue);

                        errorRecord =
                                TP.hc('reason', errorMatchResults.at(1),
                                        'line', errorMatchResults.at(2),
                                        'linepos', errorMatchResults.at(3));

                        list = TP.nodeGetElementsByTagName(
                                        errorElement, 'sourcetext');

                        errorRecord.atPut(
                                    'srcText',
                                    list.at(0).firstChild.nodeValue);
                    } else {
                        errorRecord = TP.hc('reason', 'Unknown',
                                            'line', 'Unknown',
                                            'linepos', 'Unknown',
                                            'srcText', 'Unknown');
                    }

                    TP.raise(this, 'TP.sig.DOMParseException',
                                arguments, errorRecord);
                }

                return null;
            }
        } catch (e) {
            //  Sometimes we don't want to report an error from here
            //  because we're calling this from the logging itself and we
            //  would recurse (or we're just 'tasting' the String).
            if (TP.notFalse(report)) {
                TP.raise(this, 'TP.sig.DOMParseException',
                            arguments, TP.ec(e));
            }

            return null;
        }

        //  Need to replace the '<root>' element that we used for XMLNS
        //  qualification with its first child (which is the real content).
        xmlDoc.replaceChild(
                xmlDoc.documentElement.firstChild,
                xmlDoc.documentElement);

        return xmlDoc;
    },
    'trident',
    function(aString, defaultNS, shouldReport, prohibitDTD) {

        /**
         * @name documentFromString
         * @synopsis Parses aString and returns the XML document representing
         *     the string's DOM representation.
         * @param {String} aString The source string to be parsed.
         * @param {Boolean} shouldReport False to turn off exception reporting
         *     so strings can be tested for XML compliance without causing
         *     exceptions to be thrown.
         * @param {String|null} defaultNS What namespace should be used for the
         *     'default namespace' for element markup in the supplied String.
         *     Note that this should be an XML 'namespace URI' (i.e.
         *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
         *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
         *     the empty String ('') here. To not specify any default namespace
         *     value and let the parser do what it does natively, supply null
         *     here.
         * @param {Boolean} prohibitDTD Normally we'd prohibit DTD processing
         *     for security reasons per Microsoft's recommendations, but some of
         *     our internal XML documents use inline DTD for ID access.
         * @example Create an XML document from a String:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp><foo><bar/></foo></samp>
         *     </code>
         * @returns {XMLDocument} The XML document parsed from the string.
         * @raise TP.sig.DOMParseException Raised if the supplied String cannot
         *     be parsed into a proper XML DOM construct and the shouldReport
         *     flag is true.
         * @todo
         */

        var prohibit,
            report,
            xmlDoc,

            contentString,
            str,

            successfulParse,
            parseErrorObj,
            errorRecord;

        prohibit = TP.ifInvalid(prohibitDTD, false);
        report = TP.ifInvalid(shouldReport, false);

        //  force to true when TIBET is configured for parse debugging
        report = TP.ifInvalid(report, TP.sys.shouldReportParseErrors());

        //  NB: Do *not* change these to 'TIBET primitives' (like
        //  TP.isEmpty()) as this method gets used early in the booting
        //  process.

        //  String without valid markup? Not XML then.
        if (aString === '' ||
            !/^[\s\w]*</.test(aString) ||
            (aString.length < '<a/>'.length)) {
            return;
        }

        //  Create a new document to fill with parsed content from the
        //  string
        xmlDoc = TP.createDocument();

        //  Make sure the string doesn't have the XML namespace's XMLNS
        //  defined (i.e. MSXML doesn't allow you to define:
        //  xmlns:xml="http://www.w3.org/1998/namespace")

        //  Note that, since MSXML predefines this, you can still have
        //  'xml:' attributes on elements in the document.
        TP.regex.XML_XMLNS_STRIP.lastIndex = 0;
        contentString = aString.strip(TP.regex.XML_XMLNS_STRIP);

        //  configure to work around issues with IE security patches
        xmlDoc.setProperty('ProhibitDTD', prohibit);

        //  if TIBET has the 'TP.w3.Xmlns' type loaded, we leverage XMLNS
        //  'auto-qualification'
        if (TP.isType(TP.sys.getTypeByName('TP.w3.Xmlns'))) {
            str = aString.replace(
                TP.regex.ALL_ELEM_MARKUP,
                str + ' ' + TP.w3.Xmlns.get('XMLNSDefs') + '>$&</root>');
        } else {
            str = aString.replace(
                TP.regex.ALL_ELEM_MARKUP,
                str + '>$&</root>');
        }

        //  Load the XML document from the supplied string and capture the
        //  return value. This value will be either true or false depending
        //  on whether the parse was successful or not.
        successfulParse = xmlDoc.loadXML(str);
        if (!successfulParse) {
            //  Sometimes we don't want to report an error from here because
            //  we're calling this from the logging itself and we would
            //  recurse (or we're just 'tasting' the String).
            if (TP.notFalse(report)) {
                parseErrorObj = xmlDoc.parseError;
                errorRecord = TP.hc('reason', parseErrorObj.reason,
                                    'srcText', parseErrorObj.srcText,
                                    'line', parseErrorObj.line,
                                    'linepos', parseErrorObj.linePos);

                TP.raise(this, 'TP.sig.DOMParseException', arguments,
                            errorRecord);
            }

            return null;
        }

        //  If the parse was successful, we need to make sure that the XML
        //  document produced was specification compliant.

        //  One of the problems that Microsoft's parser has is that it
        //  treats the <?xml version...?> XML declaration as a real XML
        //  Processing Instruction, which it is not. Therefore, we need to
        //  strip it out if its there.
        if ((xmlDoc.childNodes.length > 0) &&
            (xmlDoc.childNodes[0].nodeName === 'xml') &&
            (xmlDoc.childNodes[0].nodeType ===
                                     Node.PROCESSING_INSTRUCTION_NODE)) {
            TP.nodeDetach(xmlDoc.childNodes[0]);
        }

        TP.$documentSetupNamespaces(xmlDoc);

        //  Need to replace the '<root>' element that we used for XMLNS
        //  qualification with its first child (which is the real content).
        xmlDoc.replaceChild(
                xmlDoc.documentElement.firstChild,
                xmlDoc.documentElement);

        return xmlDoc;
    },
    'webkit',
    function(aString, defaultNS, shouldReport) {

        /**
         * @name documentFromString
         * @synopsis Parses aString and returns the XML document representing
         *     the string's DOM representation.
         * @param {String} aString The source string to be parsed.
         * @param {String|null} defaultNS What namespace should be used for the
         *     'default namespace' for element markup in the supplied String.
         *     Note that this should be an XML 'namespace URI' (i.e.
         *     'http://www.w3.org/1999/xhtml') *not* a namespace prefix (i.e.
         *     'html:'). To use the 'null' namespace (i.e. xmlns=""), supply
         *     the empty String ('') here. To not specify any default namespace
         *     value and let the parser do what it does natively, supply null
         *     here.
         * @param {Boolean} shouldReport False to turn off exception reporting
         *     so strings can be tested for XML compliance without causing
         *     exceptions to be thrown.
         * @example Create an XML document from a String:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp><foo><bar/></foo></samp>
         *     </code>
         * @returns {XMLDocument} The XML document parsed from the string.
         * @raise TP.sig.DOMParseException Raised if the supplied String cannot
         *     be parsed into a proper XML DOM construct and the shouldReport
         *     flag is true.
         * @todo
         */

        var report,
            parser,

            str,

            xmlDoc,

            errorElement,
            errorMatchResults,
            errorRecord;

        report = TP.ifInvalid(shouldReport, false);

        //  force to true when TIBET is configured for parse debugging
        report = TP.ifInvalid(report, TP.sys.shouldReportParseErrors());

        //  NB: Do *not* change these to 'TIBET primitives' (like
        //  TP.isEmpty())
        //  as this method gets used early in the booting process.

        //  String without valid markup? Not XML then.
        if (aString === '' ||
            !/^[\s\w]*</.test(aString) ||
            (aString.length < '<a/>'.length)) {
            return;
        }

        try {
            parser = new DOMParser();

            //  If the caller has specified a default namespace, use it here.
            if (TP.isString(defaultNS)) {
                str = '<root xmlns="' + defaultNS + '"';
            } else {
                str = '<root';
            }

            //  if TIBET has the 'TP.w3.Xmlns' type loaded, we leverage XMLNS
            //  'auto-qualification'
            if (TP.isType(TP.sys.getTypeByName('TP.w3.Xmlns'))) {
                str = aString.replace(
                    TP.regex.ALL_ELEM_MARKUP,
                    str + ' ' + TP.w3.Xmlns.get('XMLNSDefs') + '>$&</root>');
            } else {
                str = aString.replace(
                    TP.regex.ALL_ELEM_MARKUP,
                    str + '>$&</root>');
            }

            xmlDoc = parser.parseFromString(str, TP.XML_ENCODED);

            //  If there is an Element named 'parsererror', that is Webkit's
            //  way of telling us that a parser error occurred ;-).
            if (TP.isElement(errorElement =
                            xmlDoc.getElementsByTagName('parsererror')[0])) {
                //  Sometimes we don't want to report an error from here
                //  because we're calling this from the logging itself and
                //  we would recurse (or we're just 'tasting' the String).
                if (TP.notFalse(report)) {
                    //  Sometimes there is more information to go with the
                    //  parser error. If so, build a record of that
                    //  information to report with the exception.
                    if (TP.isNode(errorElement.firstChild)) {
                        errorMatchResults = TP.regex.WEBKIT_XML_PARSE.exec(
                                            TP.nodeAsString(errorElement));

                        errorRecord =
                                TP.hc('reason', errorMatchResults.at(3),
                                        'line', errorMatchResults.at(1),
                                        'linepos', errorMatchResults.at(2));
                    } else {
                        errorRecord = TP.hc('reason', 'Unknown',
                                            'line', 'Unknown',
                                            'linepos', 'Unknown');
                    }

                    TP.raise(this, 'TP.sig.DOMParseException', arguments,
                                errorRecord);
                }

                return null;
            }
        } catch (e) {
            //  Sometimes we don't want to report an error from here because
            //  we're calling this from the logging itself and we would
            //  recurse (or we're just 'tasting' the String).
            if (TP.notFalse(report)) {
                TP.raise(this, 'TP.sig.DOMParseException', arguments,
                            TP.ec(e));
            }

            return null;
        }

        //  Need to replace the '<root>' element that we used for XMLNS
        //  qualification with its first child (which is the real content).
        xmlDoc.replaceChild(
                xmlDoc.documentElement.firstChild,
                xmlDoc.documentElement);

        return xmlDoc;
    }
));

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('elementAddNamespace',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement, aPrefix, aURI) {

        /**
         * @name elementAddNamespace
         * @synopsis Adds an 'xmlns:<aPrefix>' attribute to the element. Note
         *     that 'aPrefix' *must* be valid (i.e. you cannot use this
         *     mechanism to change the default namespace - no current DOM
         *     environment supports that). Note also that namespaces can only be
         *     added to elements in an XML document.
         * @param {Element} anElement The Element node to add a namespace to.
         * @param {String} aPrefix The prefix of the namespace being added. This
         *     can have the 'xmlns:' already prepended to it.
         * @param {String} aURI The URI of the namespace being added.
         * @example Add a namespace to an element in an XML document:
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns="http://www.foo.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.elementAddNamespace(xmlDoc.documentElement,
         *          'svg',
         *          TP.w3.Xmlns.SVG);
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns="http://www.foo.com"
         *         xmlns:svg="http://www.w3.org/2000/svg"/&gt;</samp>
         *     </code>
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @raise TP.sig.InvalidXMLDocument Raised when the element supplied is
         *     not part of an XML document.
         * @raise TP.sig.InvalidString Raised when a null or empty prefix or URI
         *     is provided to the method.
         * @todo
         */

        var xmlnsAttrName,

            attrs,
            i,

            anElementDoc;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (!TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidXMLDocument', arguments);
        }

        if (TP.isEmpty(aPrefix) || TP.notValid(aURI)) {
            return TP.raise(this, 'TP.sig.InvalidString', arguments,
                            'Invalid or empty prefix or URI');
        }

        //  On IE, we'll get the 'Reserved namespace 'xml' can not be
        //  redeclared.' error message, even though we're trying to set it
        //  to the same value... so we bail here if the provided namespace
        //  is TP.w3.Xmlns.XML.

        if (aURI === TP.w3.Xmlns.XML) {
            return;
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

        //  Now, we must make sure and recompute the SelectionNamespaces
        //  property since we just added a namespace.

        //  If the node has a valid ownerDocument, use that. Otherwise,
        //  assume that it is an XMLDocument itself, so use itself as the
        //  document.
        if (TP.isDocument(anElement.ownerDocument)) {
            anElementDoc = anElement.ownerDocument;
        } else {
            anElementDoc = anElement;
        }

        //  Recompute SelectionNamespaces
        TP.$documentSetupNamespaces(anElementDoc);

        return;
    },
    TP.DEFAULT,
    function(anElement, aPrefix, aURI) {

        /**
         * @name elementAddNamespace
         * @synopsis Adds an 'xmlns:<aPrefix>' attribute to the element. Note
         *     that 'aPrefix' *must* be valid (i.e. you cannot use this
         *     mechanism to change the default namespace - no current DOM
         *     environment supports that). Note also that namespaces can only be
         *     added to elements in an XML document.
         * @param {Element} anElement The Element node to add a namespace to.
         * @param {String} aPrefix The prefix of the namespace being added. This
         *     can have the 'xmlns:' already prepended to it.
         * @param {String} aURI The URI of the namespace being added.
         * @example Add a namespace to an element in an XML document:
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns="http://www.foo.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.elementAddNamespace(xmlDoc.documentElement,
         *          'svg',
         *          TP.w3.Xmlns.SVG);
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns="http://www.foo.com"
         *         xmlns:svg="http://www.w3.org/2000/svg"/&gt;</samp>
         *     </code>
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @raise TP.sig.InvalidXMLDocument Raised when the element supplied is
         *     not part of an XML document.
         * @raise TP.sig.InvalidString Raised when a null or empty prefix or URI
         *     is provided to the method.
         * @todo
         */

        var xmlnsAttrName,

            attrs,
            i;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (!TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidXMLDocument', arguments);
        }

        if (TP.isEmpty(aPrefix) || TP.isEmpty(aURI)) {
            return TP.raise(this, 'TP.sig.InvalidString', arguments,
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
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetLocalName',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement) {

        /**
         * @name elementGetLocalName
         * @synopsis Returns the local name (that is, the name without the
         *     prefix) of the supplied element node.
         * @param {Element} anElement The element node to retrieve the local
         *     name for.
         * @example Retrieve the 'local name' for the supplied element in an
         *     HTML document:
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
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @todo
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        return TP.ifInvalid(anElement.baseName, anElement.tagName);
    },
    TP.DEFAULT,
    function(anElement) {

        /**
         * @name elementGetLocalName
         * @synopsis Returns the local name (that is, the name without the
         *     prefix) of the supplied element node.
         * @param {Element} anElement The element node to retrieve the local
         *     name for.
         * @example Retrieve the 'local name' for the supplied element in an
         *     HTML document:
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
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @todo
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        return anElement.localName;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHasAttribute',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement, attributeName, checkAttrNSURI) {

        /**
         * @name elementHasAttribute
         * @synopsis Returns true if the supplied element has the attribute
         *     matching the attribute name defined on it, even if the value of
         *     that is null.
         * @param {Element} anElement The element to test for the existence of
         *     the attribute.
         * @param {String} attributeName The name of the attribute to test.
         * @param {Boolean} checkAttrNSURI True will cause this method to be
         *     more rigorous in its checks for prefixed attributes, looking via
         *     URI rather than just prefix. Default is false (to keep things
         *     faster).
         * @example Check to see if the supplied element has a particular
         *     attribute:
         *     <code>
         *          TP.elementHasAttribute(TP.documentGetBody(document),
         *         'style');
         *          <samp>true</samp>
         *     </code>
         * @example Check to see if the supplied element has a particular
         *     attribute in an XML document:
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns="http://www.foo.com"
         *         xmlns:xf="http://www.w3.org/2002/xforms" xf:bind="theBinder"
         *         goo="moo">Hi there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          // Simple attribute access
         *          TP.elementHasAttribute(xmlDoc.documentElement, 'goo');
         *          <samp>true</samp>
         *          // Prefixed attribute access
         *          TP.elementHasAttribute(xmlDoc.documentElement, 'xf:bind');
         *          <samp>true</samp>
         *          // Prefixed attribute access without checkAttrNSURI -
         *          // will fail
         *          TP.elementHasAttribute(xmlDoc.documentElement,
         *          'xforms:bind');
         *          <samp>false</samp>
         *          // Alternate prefix attribute access (need
         *          // checkAttrNSURI flag)
         *          TP.elementHasAttribute(xmlDoc.documentElement,
         *          'xforms:bind',
         *          true);
         *          <samp>true</samp>
         *     </code>
         * @returns {Boolean} Whether or not the element has a value for the
         *     supplied attribute.
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @raise TP.sig.InvalidName Raised when a null or empty attribute name
         *     is provided to the method.
         * @todo
         */

        var qualified,
            attr,

            theAttrName,
            attrNode,

            testRegExp;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (TP.isEmpty(attributeName)) {
            return TP.raise(this, 'TP.sig.InvalidName', arguments);
        }

        if (TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            //  we can speed things up quite a bit if we avoid work related
            //  to namespaces as much as possible. In this case, test to see
            //  if the attribute name has a colon in it.
            qualified = TP.regex.HAS_COLON.test(attributeName);
            if (!qualified) {
                //  Even for XML documents IE still doesn't do this
                //  correctly, but 'getAttributeNode(attributeName)' will be
                //  null if this attribute is missing.
                return TP.isAttributeNode(
                            anElement.getAttributeNode(attributeName));
            } else {
                attr = TP.$elementGetPrefixedAttributeNode(anElement,
                                                            attributeName,
                                                            checkAttrNSURI);

                if (TP.isAttributeNode(attr)) {
                    return true;
                }

                return false;
            }
        }

        //  If the attribute name matches one of our 'special' pclass
        //  attributes that are stand ins for pseudo-classes, put a
        //  'pclass:' on front of it.
        if (TP.regex.PCLASS_CHANGE.test(attributeName)) {
            theAttrName = 'pclass:' + attributeName;
        } else {
            theAttrName = attributeName;
        }

        //  IE doesn't implement the standard DOM Level 1 hasAttribute()
        //  call.
        //  Unfortunately, this means that getAttribute will always return
        //  null, even if the attribute hasn't been defined. This confuses
        //  things if you end up using null values (i.e. does the attribute
        //  exist but it was set to null or doesn't it exist at all?)

        //  Therefore, we must test existence by seeing if
        //  TP.getAttributeNode() returns a valid attribute node or not. If
        //  it doesn't, then the attribute is definitely not there.

        if (TP.isAttributeNode(attrNode = anElement.getAttributeNode(theAttrName))) {
            //  If its a user-defined / expando attribute and we got here,
            //  that means its got a real value which means its really
            //  there.
            if (TP.isTrue(attrNode.expando)) {
                return true;
            }

            //  It looks like its a built-in. That's unfortunate because the
            //  test is now convoluted. Here's why:

            //  TP.getAttributeNode() will return a 'blank' attribute node
            //  if the attribute is considered to be a 'built-in' (i.e. in
            //  the HTML DTD - like 'id', 'class', etc.) even if the
            //  attribute isn't actually defined on the element. These
            //  attribute nodes will have an empty String value if they are
            //  the kind of attribute that expects a value or 'null' as the
            //  value if they're the kind of attribute that don't expect a
            //  value (i.e. the 'multiple' attribute on 'select' elements).
            //  So what happens if the attribute is supposed to have a blank
            //  String or a null *as its value*...?

            //  In the end, the only reliable way to test for this is to
            //  build a little RegExp and to test the 'outerHTML' of the
            //  element. It reliably reports whether the attribute actually
            //  exists on the element.

            //  Note the character class to not go beyond the first '>' and
            //  the space in front of the attribute name to make sure its
            //  an attribute name that we find.
            testRegExp = TP.rc('^[^>]+ ' + theAttrName + '=');

            return testRegExp.test(anElement.outerHTML);
        }

        return false;
    },
    TP.DEFAULT,
    function(anElement, attributeName, checkAttrNSURI) {

        var qualified,
            attr,

            theAttrName;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (TP.isEmpty(attributeName)) {
            return TP.raise(this, 'TP.sig.InvalidName', arguments);
        }

        //  If the document for the supplied element is an XML document,
        //  then we don't need to go any further. W3C-compliant browsers do
        //  this correctly and no CSS information needs to be applied.

        if (TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            //  we can speed things up quite a bit if we avoid work related
            //  to namespaces as much as possible. In this case, test to see
            //  if the attribute name has a colon in it.
            qualified = TP.regex.HAS_COLON.test(attributeName);
            if (!qualified) {
                //  Standards-based browsers do this correctly.
                return anElement.hasAttribute(attributeName);
            } else {
                attr = TP.$elementGetPrefixedAttributeNode(anElement,
                                                            attributeName,
                                                            checkAttrNSURI);

                if (TP.isAttributeNode(attr)) {
                    return true;
                }

                return false;
            }
        }

        //  If the attribute name matches one of our 'special' pclass
        //  attributes that are stand ins for pseudo-classes, put a
        //  'pclass:' on front of it.
        if (TP.regex.PCLASS_CHANGE.test(attributeName)) {
            theAttrName = 'pclass:' + attributeName;
        } else {
            theAttrName = attributeName;
        }

        //  Standards-based browsers do this correctly.
        return anElement.hasAttribute(theAttrName);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$$elementPreserveIFrameContent',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(anElement) {

        /**
         * @name $$elementPreserveIFrameContent
         * @synopsis Preserves iframe content for browser platforms which need
         *     it.
         * @description This patch is required for DOM modification calls (such
         *     as TP.nodeAppendChild()) that may be moving 'iframe' elements
         *     (either directly or as descendants of an element being moved).
         *     This is because some browser platforms, such as Gecko, do not
         *     preserve an iframe's content when its element is moved around in
         *     the DOM. For more information, see:
         *     https://bugzilla.mozilla.org/show_bug.cgi?id=254144
         * @param {Element} anElement The element to preserve iframe content
         *     for.
         * @returns {TP.lang.Hash} A hash containing the document Elements for
         *     each of the iframe's found under anElement (or for anElement
         *     itself if its an iframe).
         */

        var iframeElems,
            holderHash,

            i,

            iframeDoc,
            iframeID,
            iframeDocElem,

            newDocElem;

        //  Grab all of the iframes under the supplied element (and make it
        //  into an Array).
        iframeElems = TP.ac(anElement.getElementsByTagName('iframe'));

        //  If we got at least one iframe, go through and grab its document
        //  element and register it with the hash under a key matching the
        //  (possibly generated and assigned) 'id' for the iframe. Then
        //  replace that document element with a meaningless replacement
        //  element.
        if (TP.notEmpty(iframeElems)) {
            holderHash = TP.hc();

            for (i = 0; i < iframeElems.getSize(); i++) {
                if (TP.notValid(iframeDoc =
                            TP.elementGetIFrameDocument(iframeElems.at(i)))) {
                    continue;
                }

                iframeID = TP.lid(iframeElems[i], true);

                iframeDocElem = iframeDoc.documentElement;
                if (TP.isElement(iframeDocElem)) {
                    newDocElem = iframeDoc.createElement('replacement');
                    iframeDocElem.parentNode.replaceChild(newDocElem,
                                                            iframeDocElem);
                    holderHash.atPut(iframeID, iframeDocElem);
                }
            }
        }

        return holderHash;
    },
    'trident',
    function(anElement) {

        /**
         * @name $$elementPreserveIFrameContent
         * @synopsis Preserves iframe content for browser platforms which need
         *     it.
         * @description This patch is only required for certain browser
         *     platforms. See the versions of this method in those
         *     browser-specific files for more information. As of this writing,
         *     Trident does not require this method to do anything, but Gecko
         *     and Webkit do:
         *     https://bugzilla.mozilla.org/show_bug.cgi?id=254144
         *     https://bugs.webkit.org/show_bug.cgi?id=13574 This version of
         *     this method just returns null.
         * @param {Element} anElement The element to preserve iframe content
         *     for.
         * @returns {TP.lang.Hash} A hash containing the document Elements for
         *     each of the iframe's found under anElement (or for anElement
         *     itself if its an iframe).
         */

        return null;
    },
    'webkit',
    function(anElement) {

        /**
         * @name $$elementPreserveIFrameContent
         * @synopsis Preserves iframe content for browser platforms which need
         *     it.
         * @description This patch is required for DOM modification calls (such
         *     as TP.nodeAppendChild()) that may be moving 'iframe' elements
         *     (either directly or as descendants of an element being moved).
         *     This is because some browser platforms, such as Webkit-based
         *     ones, do not preserve an iframe's content when its element is
         *     moved around in the DOM. For more information, see:
         *     https://bugs.webkit.org/show_bug.cgi?id=13574
         * @param {Element} anElement The element to preserve iframe content
         *     for.
         * @returns {TP.lang.Hash} A hash containing the document Elements for
         *     each of the iframe's found under anElement (or for anElement
         *     itself if its an iframe).
         */

        var iframeElems,
            holderHash,

            i,

            iframeDoc,
            iframeID,
            iframeDocElem,

            newDocElem;

        //  Grab all of the iframes under the supplied element (and make it
        //  into an Array).
        iframeElems = TP.ac(anElement.getElementsByTagName('iframe'));

        //  If we got at least one iframe, go through and grab its document
        //  element and register it with the hash under a key matching the
        //  (possibly generated and assigned) 'id' for the iframe. Then
        //  replace that document element with a meaningless replacement
        //  element.
        if (TP.notEmpty(iframeElems)) {
            holderHash = TP.hc();

            for (i = 0; i < iframeElems.getSize(); i++) {
                if (TP.notValid(iframeDoc =
                        TP.elementGetIFrameDocument(iframeElems.at(i)))) {
                    continue;
                }

                iframeID = TP.lid(iframeElems[i], true);

                iframeDocElem = iframeDoc.documentElement;
                if (TP.isElement(iframeDocElem)) {
                    newDocElem = iframeDoc.createElement('replacement');
                    iframeDocElem.parentNode.replaceChild(newDocElem,
                                                            iframeDocElem);
                    holderHash.atPut(iframeID, iframeDocElem);
                }
            }
        }

        return holderHash;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveAttribute',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement, attributeName, checkAttrNSURI) {

        /**
         * @name elementRemoveAttribute
         * @synopsis Removes an attribute from the supplied element whose name
         *     matches attributeName.
         * @param {Element} anElement The element to remove the attribute from.
         * @param {String} attributeName The name of the attribute to remove.
         * @param {Boolean} checkAttrNSURI True will cause this method to be
         *     more rigorous in its checks for prefixed attributes, looking via
         *     URI rather than just prefix. Default is false (to keep things
         *     faster).
         * @example Remove the attribute named for the supplied element in an
         *     HTML document:
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
         * @example Remove the attribute named for the supplied element in an
         *     XML document:
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
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @raise TP.sig.InvalidName Raised when a null or empty attribute name
         *     is provided to the method.
         * @todo
         */

        var qualified,
            attr,

            theAttrName,

            win;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (TP.isEmpty(attributeName)) {
            return TP.raise(this, 'TP.sig.InvalidName', arguments);
        }

        //  If the document for the supplied element is an XML document,
        //  then we don't need to go any further. IE does this correctly and
        //  no CSS information needs to be applied.
        if (TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            //  we can speed things up quite a bit if we avoid work related
            //  to namespaces as much as possible. In this case, test to see
            //  if the attribute name has a colon in it.
            qualified = TP.regex.HAS_COLON.test(attributeName);
            if (!qualified) {
                //  IE does this correctly.
                return anElement.removeAttribute(attributeName);
            } else {
                attr = TP.$elementGetPrefixedAttributeNode(anElement,
                                                            attributeName,
                                                            checkAttrNSURI);

                if (TP.isAttributeNode(attr)) {
                    //  'removeAttribute' above returns null, but
                    //  'removeAttributeNode' will return the removed
                    //  attribute node. We want to emulate the behavior
                    //  above for consistency.
                    anElement.removeAttributeNode(attr);
                }

                return;
            }
        }

        //  If the attribute name matches one of our 'special' pclass
        //  attributes that are stand ins for pseudo-classes, put a
        //  'pclass:' on front of it.
        if (TP.regex.PCLASS_CHANGE.test(attributeName)) {
            theAttrName = 'pclass:' + attributeName;

            //  If it matched a pseudo-class, we go ahead and remove the
            //  attribute we were supplied with anyway. This allows elements
            //  like HTML checkboxes and radio buttons to remove their
            //  'selected' and 'checked' attributes.

            //  See below for why we do this 3 separate ways
            anElement.removeAttributeNode(
                                anElement.getAttributeNode(theAttrName));
            anElement[theAttrName] = null;
            anElement.removeAttribute(theAttrName);
        } else {
            theAttrName = attributeName;
        }

        //  If there has been CSS processing going on in anElement's Window,
        //  then go ahead and process any custom declarations.
        if (TP.isWindow(win = TP.nodeGetWindow(anElement))) {
        //if (TP.isWindow(win = TP.nodeGetWindow(anElement)) &&
        //  TP.isValid(win.$globalStyleRules)) {
            //  Invoke the CSS attribute change machinery. Note here that we
            //  have no new value, since we're removing the attribute.
            TP.$elementProcessCSSAttributeChange(
                    anElement,
                    theAttrName,
                    null,
                    function() {

                        try {
                            //  First we try to use 'removeAttributeNode' as
                            //  that looks to be the best way to get rid of
                            //  an attribute.
                            anElement.removeAttributeNode(
                                    anElement.getAttributeNode(theAttrName));

                            //  If that worked, we can bail out.
                            if (!TP.elementHasAttribute(anElement,
                                                        theAttrName)) {
                                return;
                            }

                            //  Otherwise, its being really stubborn.

                            //  Nulling out the attribute seems to have some
                            //  affect on built-in attributes in IE
                            //  (probably around this whole 'attributes are
                            //  properties' mess).
                            anElement[theAttrName] = null;

                            //  The problem is that nulling it also assigns
                            //  it a value again. So we need to remove it.
                            //  By this point 'removeAttribute' seems to
                            //  actually work.
                            anElement.removeAttribute(theAttrName);
                        } catch (e) {
                            //  It wasn't there, so just move on (sometimes
                            //  'table's throw an exception if the attribute
                            //  wasn't there).
                        }

                        //  Update any CSS expressions for the element.
                        //TP.elementUpdateCSSExprValues(anElement);
                    });
        }

        //  Flush any pending CSS changes.
        TP.$elementCSSFlush(anElement);

        return;
    },
    TP.DEFAULT,
    function(anElement, attributeName, checkAttrNSURI) {

        var qualified,
            attr,

            theAttrName,

            win;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (TP.isEmpty(attributeName)) {
            return TP.raise(this, 'TP.sig.InvalidName', arguments);
        }

        //  If the document for the supplied element is an XML document,
        //  then we don't need to go any further. W3C-compliant browsers do
        //  this correctly and no CSS information needs to be applied.
        if (TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            //  we can speed things up quite a bit if we avoid work related
            //  to namespaces as much as possible. In this case, test to see
            //  if the attribute name has a colon in it.
            qualified = TP.regex.HAS_COLON.test(attributeName);
            if (!qualified) {
                //  Standards-based browsers do this correctly.
                return anElement.removeAttribute(attributeName);
            } else {
                attr = TP.$elementGetPrefixedAttributeNode(anElement,
                                                            attributeName,
                                                            checkAttrNSURI);

                if (TP.isAttributeNode(attr)) {
                    //  'removeAttribute' above returns null, but
                    //  'removeAttributeNode' will return the removed
                    //  attribute node. We want to emulate the behavior
                    //  above for consistency.
                    anElement.removeAttributeNode(attr);
                }

                return;
            }
        }

        //  If the attribute name matches one of our 'special' pclass
        //  attributes that are stand ins for pseudo-classes, put a
        //  'pclass:' on front of it.
        if (TP.regex.PCLASS_CHANGE.test(attributeName)) {
            theAttrName = 'pclass:' + attributeName;

            //  If it matched a pseudo-class, we go ahead and remove the
            //  attribute we were supplied with anyway. This allows elements
            //  like HTML checkboxes and radio buttons to remove their
            //  'selected' and 'checked' attributes.
            anElement.removeAttribute(theAttrName);
        } else {
            theAttrName = attributeName;
        }

        //  If there has been CSS processing going on in anElement's Window,
        //  then go ahead and process any changes that removing this
        //  attribute will have brought.
        if (TP.isWindow(win = TP.nodeGetWindow(anElement))) {
        //if (TP.isValid(win = TP.nodeGetWindow(anElement)) &&
        //  TP.isValid(win.$globalStyleRules)) {
            //  Invoke the CSS attribute change machinery. Note here that we
            //  have no new value, since we're removing the attribute.
            TP.$elementProcessCSSAttributeChange(
                                anElement,
                                theAttrName,
                                null,
                                function() {

                                    //  W3C-compliant browsers do this
                                    //  correctly.
                                    anElement.removeAttribute(theAttrName);
                                });

            //  Update any CSS expressions for the element.
            //TP.elementUpdateCSSExprValues(anElement);
        } else {
            //  Standards-based browsers do this correctly.
            anElement.removeAttribute(theAttrName);
        }

        //  Flush any pending CSS changes.
        TP.$elementCSSFlush(anElement);

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$$elementRestoreIFrameContent',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(anElement, docElemsHash) {

        /**
         * @name $$elementRestoreIFrameContent
         * @synopsis Restores previously preserved iframe content for browser
         *     platforms which need it.
         * @description This patch is required for DOM modification calls (such
         *     as TP.nodeAppendChild()) that may be moving 'iframe' elements
         *     (either directly or as descendants of an element being moved).
         *     This is because some browser platforms, such as Gecko, do not
         *     preserve an iframe's content when its element is moved around in
         *     the DOM. For more information, see:
         *     https://bugzilla.mozilla.org/show_bug.cgi?id=254144
         * @param {Element} anElement The element to restore iframe content for.
         * @param {TP.lang.Hash} docElemsHash The hash containing the document
         *     elements previously captured during the preserve process.
         * @todo
         */

        var holderKeys,

            i,

            theIFrameElem,

            iframeDoc,
            iframeDocElem,

            newDocElem;

        //  Grab all of the keys out of the supplied hash and try to find
        //  iframe elements that have 'id's that match those keys. If an
        //  iframe can be found, replace its document element with the one
        //  in the hash that was preserved in the
        //  '$$elementPreserveIFrameContent' call.

        holderKeys = TP.keys(docElemsHash);
        for (i = 0; i < holderKeys.getSize(); i++) {
            theIFrameElem = TP.nodeGetDocument(anElement).getElementById(
                                                        holderKeys.at(i));

            if (TP.notValid(iframeDoc =
                            TP.elementGetIFrameDocument(theIFrameElem))) {
                continue;
            }

            iframeDocElem = iframeDoc.documentElement;
            if (TP.isElement(iframeDocElem)) {
                newDocElem = iframeDoc.adoptNode(
                                docElemsHash.at(holderKeys.at(i)), true);

                //  Need to do this so that 'certain browsers'...ahem...
                //  properly 'set up' their iframe's window context, etc.
                iframeDoc.open();
                iframeDoc.write('<html><head></head><body></body></html>');
                iframeDoc.close();

                iframeDocElem = iframeDoc.documentElement;

                iframeDocElem.parentNode.replaceChild(newDocElem,
                                                        iframeDocElem);
            }
        }

        return;
    },
    'trident',
    function(anElement, docElemsHash) {

        /**
         * @name $$elementRestoreIFrameContent
         * @synopsis Restores previously preserved iframe content for browser
         *     platforms which need it. This version of this method just
         *     returns.
         * @description This patch is only required for certain browser
         *     platforms. See the versions of this method in those
         *     browser-specific files for more information. As of this writing,
         *     Trident does not require this method to do anything, but Gecko
         *     and Webkit do:
         *     https://bugzilla.mozilla.org/show_bug.cgi?id=254144
         *     https://bugs.webkit.org/show_bug.cgi?id=13574 This version of
         *     this method just returns.
         * @param {Element} anElement The element to restore iframe content for.
         * @param {TP.lang.Hash} docElemsHash The hash containing the document
         *     elements previously captured during the preserve process.
         * @todo
         */

        return;
    },
    'webkit',
    function(anElement, docElemsHash) {

        /**
         * @name $$elementRestoreIFrameContent
         * @synopsis Restores previously preserved iframe content for browser
         *     platforms which need it.
         * @description This patch is required for DOM modification calls (such
         *     as TP.nodeAppendChild()) that may be moving 'iframe' elements
         *     (either directly or as descendants of an element being moved).
         *     This is because some browser platforms, such as Webkit-based
         *     ones, do not preserve an iframe's content when its element is
         *     moved around in the DOM. For more information, see:
         *     https://bugs.webkit.org/show_bug.cgi?id=13574
         * @param {Element} anElement The element to restore iframe content for.
         * @param {TP.lang.Hash} docElemsHash The hash containing the document
         *     elements previously captured during the preserve process.
         * @todo
         */

        var holderKeys,

            i,

            theIFrameElem,

            iframeDoc,
            iframeDocElem,

            newDocElem;

        //  Grab all of the keys out of the supplied hash and try to find
        //  iframe elements that have 'id's that match those keys. If an
        //  iframe can be found, replace its document element with the one
        //  in the hash that was preserved in the
        //  '$$elementPreserveIFrameContent' call.

        holderKeys = TP.keys(docElemsHash);
        for (i = 0; i < holderKeys.getSize(); i++) {
            theIFrameElem = TP.nodeGetDocument(anElement).getElementById(
                                                        holderKeys.at(i));

            if (TP.notValid(iframeDoc =
                            TP.elementGetIFrameDocument(theIFrameElem))) {
                continue;
            }

            iframeDocElem = iframeDoc.documentElement;
            if (TP.isElement(iframeDocElem)) {
                newDocElem = iframeDoc.adoptNode(
                                docElemsHash.at(holderKeys.at(i)), true);

                //  Need to do this so that 'certain browsers'...ahem...
                //  properly 'set up' their iframe's window context, etc.
                iframeDoc.open();
                iframeDoc.write('<html><head></head><body></body></html>');
                iframeDoc.close();

                iframeDocElem = iframeDoc.documentElement;

                iframeDocElem.parentNode.replaceChild(newDocElem,
                                                        iframeDocElem);
            }
        }

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetAttributeInNS',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(anElement, attrName, attrValue, attrNS) {

        /**
         * @name elementSetAttributeInNS
         * @synopsis Sets an attribute on the supplied element in the namespace
         *     provided. Note that the desired prefix should be provided as part
         *     of the attribute name. Note also that the attribute value can be
         *     the empty string ('') but not null or undefined.
         * @description If the supplied element's document is an HTML document,
         *     this method will perform a simple 'setAttribute()' call, but will
         *     use the 'whole name' (i.e. with a colon-separated name) as the
         *     name of the attribute.
         * @param {Element} anElement The element to set the attribute on.
         * @param {String} attrName The attribute name to use.
         * @param {String} attrValue The attribute value to use.
         * @param {String} attrNS The namespace URI to use.
         * @example Set an attribute on an element in an XML document, placing
         *     it into a particular namespace.
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.elementSetAttributeInNS(xmlDoc.documentElement,
         *          'bar:baz',
         *          'bazify',
         *          'http://www.bar.com');
         *          <samp>undefined</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"/&gt;</samp>
         *     </code>
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @raise TP.sig.InvalidString Raised when a null or empty attribute
         *     name is provided to the method.
         * @raise TP.sig.InvalidParameter Raised when a null or undefined
         *     attribute value is provided to the method.
         * @todo
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (TP.isEmpty(attrName)) {
            return TP.raise(this, 'TP.sig.InvalidString', arguments);
        }

        if (TP.notValid(attrValue)) {
            return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
        }

        if (TP.notEmpty(attrNS) &&
            TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            anElement.setAttributeNS(attrNS, attrName, attrValue);
        } else {
            anElement.setAttribute(attrName, attrValue);
        }

        return;
    },
    'trident',
    function(anElement, attrName, attrValue, attrNS) {

        /**
         * @name elementSetAttributeInNS
         * @synopsis Sets an attribute on the supplied element in the namespace
         *     provided. Note that the desired prefix should be provided as part
         *     of the attribute name. Note also that the attribute value can be
         *     the empty string ('') but not null or undefined.
         * @description If the supplied element's document is an HTML document,
         *     this method will perform a simple 'setAttribute()' call, but will
         *     use the 'whole name' (i.e. with a colon-separated name) as the
         *     name of the attribute.
         * @param {Element} anElement The element to set the attribute on.
         * @param {String} attrName The attribute name to use.
         * @param {String} attrValue The attribute value to use.
         * @param {String} attrNS The namespace URI to use.
         * @example Set an attribute on an element in an XML document, placing
         *     it into a particular namespace.
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.elementSetAttributeInNS(xmlDoc.documentElement,
         *          'bar:baz',
         *          'bazify',
         *          'http://www.bar.com');
         *          <samp>undefined</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"/&gt;</samp>
         *     </code>
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @raise TP.sig.InvalidString Raised when a null or empty attribute
         *     name is provided to the method.
         * @raise TP.sig.InvalidParameter Raised when a null or undefined
         *     attribute value is provided to the method.
         * @todo
         */

        var doc,
            attrNode;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (TP.isEmpty(attrName)) {
            return TP.raise(this, 'TP.sig.InvalidString', arguments);
        }

        if (TP.notValid(attrValue)) {
            return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
        }

        //  Since MSXML doesn't support DOM Level 2, we have to use
        //  proprietary MSXML DOM calls to put attributes in namespaces.
        //  Note that we only do this to XML documents in IE.
        doc = TP.nodeGetDocument(anElement);

        if (TP.notEmpty(attrNS) && TP.isXMLDocument(doc)) {
            attrNode = doc.createNode(Node.ATTRIBUTE_NODE,
                                        attrName,
                                        attrNS);
            attrNode.value = attrValue;

            anElement.attributes.setNamedItem(attrNode);
        } else {
            anElement.setAttribute(attrName, attrValue);
        }

        return;
    },
    'webkit',
    function(anElement, attrName, attrValue, attrNS) {

        /**
         * @name elementSetAttributeInNS
         * @synopsis Sets an attribute on the supplied element in the namespace
         *     provided. Note that the desired prefix should be provided as part
         *     of the attribute name. Note also that the attribute value can be
         *     the empty string ('') but not null or undefined.
         * @description If the supplied element's document is an HTML document,
         *     this method will perform a simple 'setAttribute()' call, but will
         *     use the 'whole name' (i.e. with a colon-separated name) as the
         *     name of the attribute.
         * @param {Element} anElement The element to set the attribute on.
         * @param {String} attrName The attribute name to use.
         * @param {String} attrValue The attribute value to use.
         * @param {String} attrNS The namespace URI to use.
         * @example Set an attribute on an element in an XML document, placing
         *     it into a particular namespace.
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.elementSetAttributeInNS(xmlDoc.documentElement,
         *          'bar:baz',
         *          'bazify',
         *          'http://www.bar.com');
         *          <samp>undefined</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"/&gt;</samp>
         *     </code>
         * @raise TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @raise TP.sig.InvalidString Raised when a null or empty attribute
         *     name is provided to the method.
         * @raise TP.sig.InvalidParameter Raised when a null or undefined
         *     attribute value is provided to the method.
         * @todo
         */

        var parts,
            prefix,

            attrs,
            i,
            xmlnsAttrName;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement', arguments);
        }

        if (TP.isEmpty(attrName)) {
            return TP.raise(this, 'TP.sig.InvalidString', arguments);
        }

        if (TP.notValid(attrValue)) {
            return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
        }

        if (TP.notEmpty(attrNS) &&
            TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            //  On Webkit, we have to make sure that the namespace is also
            //  defined if it isn't already... and we *must* do it before we
            //  try to use setAttributeNS(...), because that call will go
            //  ahead and supply a corresponding 'xmlns:<prefix>' node for
            //  the namespace, but its buggy and won't show up in the
            //  '.attributes' Array for subsequent calls. This way,
            //  setAttributeNS(...) looks at the element and determines that
            //  the namespace is already there.

            //  Note that we *ONLY* do this if the namespace of the
            //  attribute that is being added *ISN'T* the 'namespace
            //  namespace' (TP.w3.Xmlns.XMLNS).
            if (attrNS !== TP.w3.Xmlns.XMLNS) {
                //  Did the attribute name have a 'prefix' in it?
                if (TP.notEmpty(parts = attrName.split(':'))) {
                    //  If so, use it.
                    prefix = parts.first();
                } else {
                    //  Otherwise, use the canonical prefix for that
                    //  namespace.
                    prefix = TP.w3.Xmlns.getCanonicalPrefix();
                }

                //  If we successfully obtained a prefix, set the namespace
                //  on the element (if its not already there).
                if (TP.notEmpty(prefix)) {
                    xmlnsAttrName = 'xmlns:' + prefix;

                    //  We need to make sure that we're not putting a
                    //  namespace definition on an element that already has
                    //  one.
                    attrs = anElement.attributes;
                    for (i = 0; i < attrs.length; i++) {
                        if (attrs[i].name === xmlnsAttrName) {
                            break;
                        }
                    }

                    //  NOTE: We cannot use elementAddNamespace() here since
                    //  that call uses this call :-).
                    anElement.setAttributeNS(TP.w3.Xmlns.XMLNS,
                                                xmlnsAttrName,
                                                attrNS);
                }
            }

            //  Now that we're sure that the namespace is there, go ahead
            //  and set the attribute.
            anElement.setAttributeNS(attrNS, attrName, attrValue);
        } else {
            anElement.setAttribute(attrName, attrValue);
        }

        return;
    }
));

//  ------------------------------------------------------------------------
//  NODE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAsString',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(aNode, wantsXMLDeclaration, shallow) {

        /**
         * @name nodeAsString
         * @synopsis Returns the string representation of aNode.
         * @description This function takes in a flag as to whether the caller
         *     wants a specific behavior as to the presence of an XML
         *     declaration. The behavior of this function as to this flag's
         *     state is as follows:
         *     
         *     Flag value Existing declaration? Output ----------
         *     --------------------- ------ Not defined Yes With declaration Not
         *     defined No Without declaration True Yes With declaration True No
         *     With declaration False Yes Without declaration False No Without
         *     declaration
         *     
         *     NOTE: This flag is only used when the supplied Node is an XML
         *     document.
         * @param {Node} aNode The node to transform.
         * @param {Boolean} wantsXMLDeclaration Whether or not the caller wants
         *     an XML declaration placed on the front of the string
         *     representation. Default is false.
         * @param {Boolean} shallow True to output just the node when it's an
         *     element node so no children are represented. Default is false.
         * @example Create an XML document with an attribute and a text node
         *     child and generate the string representation of each construct
         *     (with no XML declaration):
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement.attributes[1]);
         *          <samp>bazify</samp>
         *          TP.nodeAsString(xmlDoc.documentElement.firstChild);
         *          <samp>Hi there</samp>
         *     </code>
         * @example Create an XML document with an attribute and a text node
         *     child and generate the string representation of each construct
         *     (with an XML declaration):
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc, true);
         *          <samp>&lt;?xml version="1.0"?&gt;&lt;foo
         *         xmlns:bar="http://www.bar.com" bar:baz="bazify"&gt;Hi
         *         there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement, true);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *     </code>
         * @example Create an XML document with a namespaced root node, add two
         *     'null namespaced' children to it and generate the string
         *     representation:
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns="http://www.foo.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentCreateElement(xmlDoc, 'bar', null));
         *          <samp>[object Element]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentCreateElement(xmlDoc, 'baz', ''));
         *          <samp>[object Element]</samp>
         *          TP.nodeAsString(xmlDoc, true);
         *          <samp>&lt;foo xmlns="http://www.foo.com"&gt;&lt;bar
         *         xmlns=""/&gt;&lt;baz xmlns=""/&gt;&lt;/foo&gt;</samp>
         *     </code>
         * @example Create a document fragment in an XML document, append some
         *     <code>
         *          elements to it, and generate its string representation:
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          docFrag = TP.documentCreateFragment(xmlDoc);
         *          TP.nodeAppendChild(
         *          docFrag,
         *          TP.documentCreateElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAppendChld(
         *          docFrag,
         *          TP.documentCreateElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAsString(docFrag);
         *          <samp>&lt;span
         *         xmlns="http://www.w3.org/1999/xhtml"/&gt;&lt;span
         *         xmlns="http://www.w3.org/1999/xhtml"/&gt;</samp>
         *     </code>
         * @example Generate a string representation of an HTML document:
         *     <code>
         *          TP.nodeAsString(document);
         *          <samp>...HTML output...</samp>
         *     </code>
         * @example Generate a string representation of an HTML element:
         *     <code>
         *          TP.nodeAsString(TP.documentGetBody(document));
         *          <samp>...HTML output...</samp>
         *     </code>
         * @returns {String} The String produced by 'rendering' the supplied
         *     node.
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @raise TP.sig.SerializationException Raised when the serialization
         *     machinery encounters an error serializing the node.
         * @raise TP.sig.UnsupportedOperation Raised when a Node is supplied
         *     that this method doesn't know how to generate a string
         *     representation of. These include Nodes of type:
         *     Node.ENTITY_REFERENCE_NODE Node.ENTITY_NODE
         *     Node.NOTATION_NODE
         * @todo
         */

        var node,
            str;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        node = shallow ? TP.nodeCloneNode(aNode, false) : aNode;

        //  depending on the node type we can optimize this call a bit
        switch (node.nodeType) {
            case Node.ATTRIBUTE_NODE:

                return node.name + '="' + node.value + '"';

            case Node.TEXT_NODE:

                return node.data;

            case Node.CDATA_SECTION_NODE:

                return '<![CDATA[' + node.data + ']]>';

            case Node.DOCUMENT_FRAGMENT_NODE:

                //  You can't run XPaths on document fragments on Mozilla,
                //  so the null namespace 'workaround' that we use below for
                //  Elements and Documents won't work anyway. Therefore, for
                //  document fragments, we just shortstop the process here
                //  and create a String from it the best we can.
                try {
                    str = (new XMLSerializer()).serializeToString(node);
                } catch (e) {
                    TP.raise(this, 'TP.sig.SerializationException',
                                arguments, TP.ec(e));
                    str = 'Serialization failed.';
                }

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }

                break;

            case Node.PROCESSING_INSTRUCTION_NODE:

                return '<?' + node.target + ' ' + node.data + '?>';

            case Node.COMMENT_NODE:

                return '<!--' + node.data + '-->';

            case Node.ENTITY_REFERENCE_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.ENTITY_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.DOCUMENT_TYPE_NODE:

                return '<!DOCTYPE ' + node.name +
                        ' PUBLIC ' + node.publicId + ' ' + node.systemId + '>';

            case Node.NOTATION_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.DOCUMENT_NODE:

                /* jshint -W086 */

                //  No document element? Return the empty string.
                if (TP.notValid(node.documentElement)) {
                    return '';
                }

                //  Note here how we don't break, but continue falling
                //  through...

            case Node.ELEMENT_NODE:
            default:

                //  Try to serialize the node. If it fails, report an error.
                try {
                    str = (new XMLSerializer()).serializeToString(node);

                    //  NB: we check for a space after the 'xml' part here
                    //  to avoid finding PIs. We only want the XML
                    //  declaration.

                    //  If we wanted a declaration, the supplied Node was
                    //  an XML document, and there isn't a declaration,
                    //  then prepend one.
                    if (wantsXMLDeclaration &&
                        (TP.isXMLDocument(node) ||
                             TP.isXMLDocument(node.parentNode))) {
                        if (!str.startsWith('<?xml ')) {
                            str = TP.XML_10_HEADER + '\n' + str;
                        }
                    } else {
                        //  Otherwise, if we didn't want a declaration, but
                        //  there was one, slice the header off.
                        if (str.startsWith('<?xml ')) {
                            str = str.slice(str.indexOf('?>') + 2);
                        }
                    }
                } catch (e) {
                    //  work around another Mozilla bug/trap
                    if (/restricted URI/.test(TP.str(e))) {
                        if (TP.isElement(node)) {
                            str = TP.elementGetOuterContent(node);
                        } else if (TP.isDocument(node)) {
                            str = TP.elementGetOuterContent(
                                                node.documentElement);
                        } else {
                            str = node.innerHTML;
                        }
                    } else {
                        TP.raise(this, 'TP.sig.SerializationException',
                                    arguments, TP.ec(e));
                        str = 'Serialization failed.';
                    }
                }

                /* jshint +W086 */

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }

                break;
        }

        return null;
    },
    'trident',
    function(aNode, wantsXMLDeclaration, shallow) {

        /**
         * @name nodeAsString
         * @synopsis Returns the string representation of aNode.
         * @description This function takes in a flag as to whether the caller
         *     wants a specific behavior as to the presence of an XML
         *     declaration. The behavior of this function as to this flag's
         *     state is as follows:
         *     
         *     Flag value Existing declaration? Output ----------
         *     --------------------- ------ Not defined Yes With declaration Not
         *     defined No Without declaration True Yes With declaration True No
         *     With declaration False Yes Without declaration False No Without
         *     declaration
         *     
         *     NOTE: This flag is only used when the supplied Node is an XML
         *     document.
         * @param {Node} aNode The node to transform.
         * @param {Boolean} wantsXMLDeclaration Whether or not the caller wants
         *     an XML declaration placed on the front of the string
         *     representation. Default is false.
         * @param {Boolean} shallow True to output just the node when it's an
         *     element node so no children are represented. Default is false.
         * @example Create an XML document with an attribute and a text node
         *     child and generate the string representation of each construct
         *     (with no XML declaration):
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement.attributes[1]);
         *          <samp>bazify</samp>
         *          TP.nodeAsString(xmlDoc.documentElement.firstChild);
         *          <samp>Hi there</samp>
         *     </code>
         * @example Create an XML document with an attribute and a text node
         *     child and generate the string representation of each construct
         *     (with an XML declaration):
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc, true);
         *          <samp>&lt;?xml version="1.0"?&gt;&lt;foo
         *         xmlns:bar="http://www.bar.com" bar:baz="bazify"&gt;Hi
         *         there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement, true);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *     </code>
         * @example Create an XML document with a namespaced root node, add two
         *     'null namespaced' children to it and generate the string
         *     representation:
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns="http://www.foo.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentCreateElement(xmlDoc, 'bar', null));
         *          <samp>[object Element]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentCreateElement(xmlDoc, 'baz', ''));
         *          <samp>[object Element]</samp>
         *          TP.nodeAsString(xmlDoc, true);
         *          <samp>&lt;foo xmlns="http://www.foo.com"&gt;&lt;bar
         *         xmlns=""/&gt;&lt;baz xmlns=""/&gt;&lt;/foo&gt;</samp>
         *     </code>
         * @example Create a document fragment in an XML document, append some
         *     <code>
         *          elements to it, and generate its string representation:
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          docFrag = TP.documentCreateFragment(xmlDoc);
         *          TP.nodeAppendChild(
         *          docFrag,
         *          TP.documentCreateElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAppendChld(
         *          docFrag,
         *          TP.documentCreateElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAsString(docFrag);
         *          <samp>&lt;span
         *         xmlns="http://www.w3.org/1999/xhtml"/&gt;&lt;span
         *         xmlns="http://www.w3.org/1999/xhtml"/&gt;</samp>
         *     </code>
         * @example Generate a string representation of an HTML document:
         *     <code>
         *          TP.nodeAsString(document);
         *          <samp>...HTML output...</samp>
         *     </code>
         * @example Generate a string representation of an HTML element:
         *     <code>
         *          TP.nodeAsString(TP.documentGetBody(document));
         *          <samp>...HTML output...</samp>
         *     </code>
         * @returns {String} The String produced by 'rendering' the supplied
         *     node.
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @raise TP.sig.SerializationException Raised when the serialization
         *     machinery encounters an error serializing the node.
         * @raise TP.sig.UnsupportedOperation Raised when a Node is supplied
         *     that this method doesn't know how to generate a string
         *     representation of. These include Nodes of type:
         *     Node.ENTITY_REFERENCE_NODE Node.ENTITY_NODE
         *     Node.NOTATION_NODE
         * @todo
         */

        var str,
            node,

            fragStr,
            i;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  shallow is a nice way to dump element without content
        node = shallow ? TP.nodeCloneNode(aNode, false) : aNode;

        //  depending on the node type we can optimize this call a bit
        switch (node.nodeType) {
            case Node.ATTRIBUTE_NODE:

                return node.name + '="' + node.value + '"';

            case Node.TEXT_NODE:

                return node.data;

            case Node.CDATA_SECTION_NODE:

                return '<![CDATA[' + node.data + ']]>';

            case Node.DOCUMENT_FRAGMENT_NODE:

                //  If the DocumentFragment is in an XML document, then its
                //  easy since the '.xml' property works properly.
                if (TP.isXMLDocument(TP.nodeGetDocument(node))) {
                    return node.xml;
                } else {
                    //  Otherwise, its the standard IE mess...

                    //  Construct a new Array to push String
                    //  representations of each child node into and loop
                    //  over the child nodes to construct a String
                    //  representation of the document fragment.
                    fragStr = TP.ac();
                    for (i = 0; i < node.childNodes.length; i++) {
                        fragStr.push(TP.nodeAsString(node.childNodes[i]));
                    }

                    //  Construct a String from the Array.
                    return fragStr.join('');
                }
                break;

            case Node.PROCESSING_INSTRUCTION_NODE:

                return '<?' + node.target + ' ' + node.data + '?>';

            case Node.COMMENT_NODE:

                return '<!--' + node.data + '-->';

            case Node.ENTITY_REFERENCE_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.ENTITY_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.DOCUMENT_TYPE_NODE:

                return '<!DOCTYPE ' + node.name +
                        ' PUBLIC ' + node.publicId + ' ' + node.systemId + '>';

            case Node.NOTATION_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.DOCUMENT_NODE:

                /* jshint -W086 */

                //  No document element? Return the empty string.
                if (TP.notValid(node.documentElement)) {
                    return '';
                }

                //  Note here how we don't break, but continue falling
                //  through...

            case Node.ELEMENT_NODE:
            default:

                //  Make sure that there is valid xml to use.
                //  NB: If node is a DOCUMENT_NODE, then it will *already*
                //  have an XML header on it. This affects our logic below.
                if (TP.isString(str = node.xml)) {
                    //  NB: we check for a space after the 'xml' part here
                    //  to avoid finding PIs. We only want the XML
                    //  declaration.

                    //  If we wanted a declaration, the supplied Node was
                    //  an XML document, and there isn't a declaration, then
                    //  prepend one.
                    if (wantsXMLDeclaration &&
                        (TP.isXMLDocument(node) ||
                            TP.isXMLDocument(node.parentNode))) {
                        if (!str.startsWith('<?xml ')) {
                            str = TP.XML_10_HEADER + '\n' + str;
                        }
                    } else {
                        //  Otherwise, if we didn't want a declaration, but
                        //  there was one, slice the header off.
                        if (str.startsWith('<?xml ')) {
                            str = str.slice(str.indexOf('?>') + 2);
                        }
                    }

                    return str;
                } else if (TP.isString(str = node.outerHTML)) {
                    return str;
                } else if (TP.isHTMLDocument(node) ||
                            TP.isXHTMLDocument(node)) {
                    return node.documentElement.outerHTML;
                }

                /* jshint +W086 */

                //  duplicate the exception we'd see from Nav here for
                //  consistency
                TP.raise(this, 'TP.sig.SerializationException', arguments);

                return 'Serialization failed.';
        }
    },
    'webkit',
    function(aNode, wantsXMLDeclaration, shallow) {

        /**
         * @name nodeAsString
         * @synopsis Returns the string representation of aNode.
         * @description This function takes in a flag as to whether the caller
         *     wants a specific behavior as to the presence of an XML
         *     declaration. The behavior of this function as to this flag's
         *     state is as follows:
         *     
         *     Flag value Existing declaration? Output ----------
         *     --------------------- ------ Not defined Yes With declaration Not
         *     defined No Without declaration True Yes With declaration True No
         *     With declaration False Yes Without declaration False No Without
         *     declaration
         *     
         *     NOTE: This flag is only used when the supplied Node is an XML
         *     document.
         * @param {Node} aNode The node to transform.
         * @param {Boolean} wantsXMLDeclaration Whether or not the caller wants
         *     an XML declaration placed on the front of the string
         *     representation. Default is false.
         * @param {Boolean} shallow True to output just the node when it's an
         *     element node so no children are represented. Default is false.
         * @example Create an XML document with an attribute and a text node
         *     child and generate the string representation of each construct
         *     (with no XML declaration):
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement.attributes[1]);
         *          <samp>bazify</samp>
         *          TP.nodeAsString(xmlDoc.documentElement.firstChild);
         *          <samp>Hi there</samp>
         *     </code>
         * @example Create an XML document with an attribute and a text node
         *     child and generate the string representation of each construct
         *     (with an XML declaration):
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc, true);
         *          <samp>&lt;?xml version="1.0"?&gt;&lt;foo
         *         xmlns:bar="http://www.bar.com" bar:baz="bazify"&gt;Hi
         *         there&lt;/foo&gt;</samp>
         *          TP.nodeAsString(xmlDoc.documentElement, true);
         *          <samp>&lt;foo xmlns:bar="http://www.bar.com"
         *         bar:baz="bazify"&gt;Hi there&lt;/foo&gt;</samp>
         *     </code>
         * @example Create an XML document with a namespaced root node, add two
         *     'null namespaced' children to it and generate the string
         *     representation:
         *     <code>
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns="http://www.foo.com"/>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentCreateElement(xmlDoc, 'bar', null));
         *          <samp>[object Element]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentCreateElement(xmlDoc, 'baz', ''));
         *          <samp>[object Element]</samp>
         *          TP.nodeAsString(xmlDoc, true);
         *          <samp>&lt;foo xmlns="http://www.foo.com"&gt;&lt;bar
         *         xmlns=""/&gt;&lt;baz xmlns=""/&gt;&lt;/foo&gt;</samp>
         *     </code>
         * @example Create a document fragment in an XML document, append some
         *     <code>
         *          elements to it, and generate its string representation:
         *          xmlDoc = TP.documentFromString(
         *          '<foo xmlns:bar="http://www.bar.com" bar:baz="bazify">Hi
         *         there</foo>');
         *          <samp>[object XMLDocument]</samp>
         *          docFrag = TP.documentCreateFragment(xmlDoc);
         *          TP.nodeAppendChild(
         *          docFrag,
         *          TP.documentCreateElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAppendChld(
         *          docFrag,
         *          TP.documentCreateElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAsString(docFrag);
         *          <samp>&lt;span
         *         xmlns="http://www.w3.org/1999/xhtml"/&gt;&lt;span
         *         xmlns="http://www.w3.org/1999/xhtml"/&gt;</samp>
         *     </code>
         * @example Generate a string representation of an HTML document:
         *     <code>
         *          TP.nodeAsString(document);
         *          <samp>...HTML output...</samp>
         *     </code>
         * @example Generate a string representation of an HTML element:
         *     <code>
         *          TP.nodeAsString(TP.documentGetBody(document));
         *          <samp>...HTML output...</samp>
         *     </code>
         * @returns {String} The String produced by 'rendering' the supplied
         *     node.
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @raise TP.sig.SerializationException Raised when the serialization
         *     machinery encounters an error serializing the node.
         * @raise TP.sig.UnsupportedOperation Raised when a Node is supplied
         *     that this method doesn't know how to generate a string
         *     representation of. These include Nodes of type:
         *     Node.ENTITY_REFERENCE_NODE Node.ENTITY_NODE
         *     Node.NOTATION_NODE
         * @todo
         */

        var node,
            str;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        node = shallow ? TP.nodeCloneNode(aNode, false) : aNode;

        //  depending on the node type we can optimize this call a bit
        switch (node.nodeType) {
            case Node.ATTRIBUTE_NODE:

                return node.name + '="' + node.value + '"';

            case Node.TEXT_NODE:

                return node.data;

            case Node.CDATA_SECTION_NODE:

                return '<![CDATA[' + node.data + ']]>';

            case Node.DOCUMENT_FRAGMENT_NODE:

                //  You can't run XPaths on document fragments on Mozilla,
                //  so the null namespace 'workaround' that we use below for
                //  Elements and Documents won't work anyway. Therefore, for
                //  document fragments, we just shortstop the process here
                //  and create a String from it the best we can.
                try {
                    str = (new XMLSerializer()).serializeToString(node);
                } catch (e) {
                    TP.raise(this, 'TP.sig.SerializationException',
                                arguments, TP.ec(e));
                    str = 'Serialization failed.';
                }

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }

                break;

            case Node.PROCESSING_INSTRUCTION_NODE:

                return '<?' + node.target + ' ' + node.data + '?>';

            case Node.COMMENT_NODE:

                return '<!--' + node.data + '-->';

            case Node.ENTITY_REFERENCE_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.ENTITY_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.DOCUMENT_TYPE_NODE:

                return '<!DOCTYPE ' + node.name +
                        ' PUBLIC ' + node.publicId + ' ' + node.systemId + '>';

            case Node.NOTATION_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
                break;

            case Node.DOCUMENT_NODE:

                /* jshint -W086 */

                //  No document element? Return the empty string.
                if (TP.notValid(node.documentElement)) {
                    return '';
                }

                //  Note here how we don't break, but continue falling
                //  through...

            case Node.ELEMENT_NODE:
            default:

                //  Try to serialize the node. If it fails, report an error.
                try {
                    str = (new XMLSerializer()).serializeToString(node);

                    //  NB: we check for a space after the 'xml' part here
                    //  to avoid finding PIs. We only want the XML
                    //  declaration.

                    //  If we wanted a declaration, the supplied Node was an
                    //  XML document, and there isn't a declaration, then
                    //  prepend one.
                    if (wantsXMLDeclaration &&
                        (TP.isXMLDocument(node) ||
                             TP.isXMLDocument(node.parentNode))) {
                        if (!str.startsWith('<?xml ')) {
                            str = TP.XML_10_HEADER + '\n' + str;
                        }
                    } else {
                        //  Otherwise, if we didn't want a declaration, but
                        //  there was one, slice the header off.
                        if (str.startsWith('<?xml ')) {
                            str = str.slice(str.indexOf('?>') + 2);
                        }
                    }
                } catch (e) {
                    //  work around another Mozilla bug/trap
                    if (/restricted URI/.test(TP.str(e))) {
                        if (TP.isElement(node)) {
                            str = TP.elementGetOuterContent(node);
                        } else if (TP.isDocument(node)) {
                            str = TP.elementGetOuterContent(
                                                node.documentElement);
                        } else {
                            str = node.innerHTML;
                        }
                    } else {
                        TP.raise(this, 'TP.sig.SerializationException',
                                    arguments, TP.ec(e));
                        str = 'Serialization failed.';
                    }
                }

                /* jshint +W086 */

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }

                break;
        }

        return null;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeCloneNode',
TP.hc(
    'test',
    'webkit',
    'true',
    function(aNode, deep, viaString) {

        /**
         * @name nodeCloneNode
         * @synopsis Clones a node, deeply if the 'deep' parameter is true.
         * @description If aNode is an XML Document node, this method builds and
         *     returns a proper clone of it. It it is an HTML Document node it
         *     returns null.
         * @param {Node|XMLDocument} aNode The node to clone.
         * @param {Boolean} deep Whether or not to clone the node 'deeply' (that
         *     is, to recursively clone its children). Defaults to true.
         * @param {Boolean} viaString If deep, this flag will cause the cloning
         *     to use string-based operations to ensure Moz doesn't mess up the
         *     document reference. Defaults to false.
         * @example Clone an HTML element:
         *     <code>
         *          TP.nodeCloneNode(TP.documentGetBody(document));
         *          <samp>[object HTMLBodyElement]</samp>
         *     </code>
         * @example Clone an XML document:
         *     <code>
         *          xmlDoc = TP.doc('<foo><bar><baz/></bar></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeCloneNode(xmlDoc);
         *          <samp>[object XMLDocument]</samp>
         *     </code>
         * @example Clone an XML element:
         *     <code>
         *          xmlDoc = TP.doc('<foo><bar><baz/></bar></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          theElem =
         *         TP.nodeCloneNode(xmlDoc.documentElement.firstChild);
         *          <samp>[object Element]</samp>
         *          TP.nodeAsString(theElem);
         *          <samp>&lt;bar&gt;&lt;baz&gt;&lt;/baz&gt;&lt;/bar&gt;</samp>
         *     </code>
         * @returns {Node} The resulting clone of aNode.
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @todo
         */

        var shouldBeDeep,
            useString,
            newDoc,
            newDocElem;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  We can't clone an HTML document
        if (TP.isHTMLDocument(aNode)) {
            return null;
        }

        shouldBeDeep = TP.ifInvalid(deep, true);

        //  Webkit doesn't implement cloning of 'Node.DOCUMENT_NODE's.
        //  http://bugs.webkit.org/show_bug.cgi?id=11646
        //  Therefore, we use another technique.
        if (TP.isXMLDocument(aNode)) {
            //  TODO: This technique assumes that there's only the document
            //  element in the source document. There may be other stuff at
            //  the 'top level' that should be cloned.

            //  NB: As of Chrome 6ish version of Webkit, the following
            //  technique is necessary:
            //      1.  Create the document with a nonsense element.
            //      2.  Import the document element of the existing document
            //          into the new document.
            //      3.  Replace the existing document element of the new
            //          document (i.e. the nonsense element) with the
            //          imported document element.
            newDoc = TP.createDocument(null, 'nonsense');

            newDocElem = newDoc.importNode(aNode.documentElement,
                                            shouldBeDeep);
            newDoc.replaceChild(newDocElem, newDoc.documentElement);

            return newDoc;
        }

        useString = TP.ifInvalid(viaString, false);

        if (shouldBeDeep && useString) {
            if (TP.isXMLDocument(aNode)) {
                return TP.documentFromString(TP.nodeAsString(aNode));
            } else {
                return TP.nodeFromString(TP.nodeAsString(aNode));
            }
        }

        //  Use the standard 'cloneNode' mechanism.
        return aNode.cloneNode(shouldBeDeep);
    },
    TP.DEFAULT,
    function(aNode, deep, viaString) {

        /**
         * @name nodeCloneNode
         * @synopsis Clones a node, deeply if the 'deep' parameter is true.
         * @description If aNode is an XML Document node, this method builds and
         *     returns a proper clone of it. It it is an HTML Document node it
         *     returns null.
         * @param {Node|XMLDocument} aNode The node to clone.
         * @param {Boolean} deep Whether or not to clone the node 'deeply' (that
         *     is, to recursively clone its children). Defaults to true.
         * @param {Boolean} viaString If deep, this flag will cause the cloning
         *     to use string-based operations to ensure Moz doesn't mess up the
         *     document reference. Defaults to false.
         * @example Clone an HTML element:
         *     <code>
         *          TP.nodeCloneNode(TP.documentGetBody(document));
         *          <samp>[object HTMLBodyElement]</samp>
         *     </code>
         * @example Clone an XML document:
         *     <code>
         *          xmlDoc = TP.doc('<foo><bar><baz/></bar></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeCloneNode(xmlDoc);
         *          <samp>[object XMLDocument]</samp>
         *     </code>
         * @example Clone an XML element:
         *     <code>
         *          xmlDoc = TP.doc('<foo><bar><baz/></bar></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          theElem =
         *         TP.nodeCloneNode(xmlDoc.documentElement.firstChild);
         *          <samp>[object Element]</samp>
         *          TP.nodeAsString(theElem);
         *          <samp>&lt;bar&gt;&lt;baz&gt;&lt;/baz&gt;&lt;/bar&gt;</samp>
         *     </code>
         * @returns {Node} The resulting clone of aNode.
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @todo
         */

        var shouldBeDeep,
            useString;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  We can't clone an HTML document
        if (TP.isHTMLDocument(aNode)) {
            return null;
        }

        shouldBeDeep = TP.ifInvalid(deep, true);
        useString = TP.ifInvalid(viaString, false);

        if (shouldBeDeep && viaString) {
            if (TP.isXMLDocument(aNode)) {
                return TP.documentFromString(TP.nodeAsString(aNode));
            } else {
                return TP.nodeFromString(TP.nodeAsString(aNode));
            }
        }

        //  Use the standard 'cloneNode' mechanism.
        return aNode.cloneNode(shouldBeDeep);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeContainsNode',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(aNode, aDescendant) {

        /**
         * @name nodeContainsNode
         * @synopsis Returns whether or not aNode is an ancestor (or the
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
         * @raise TP.sig.InvalidNode Raised when a node that isn't a kind
         *     'collection node' is provided to the method or an invalid child
         *     is provided.
         * @todo
         */

        var root;

        //  No child nodes for anything that isn't an element, document or
        //  document fragment
        if (!TP.isCollectionNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                                'Node not a collection Node.');
        }

        if (!TP.isNode(aDescendant)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  For documents the question is whether the child is an element
        //  and is in the document and still attached to a viable branch of
        //  the documentElement tree
        if (TP.isDocument(aNode) && TP.isElement(aDescendant)) {
            if ((TP.nodeGetDocument(aDescendant) !== aNode) ||
                TP.notValid(aNode.documentElement)) {
                return false;
            }

            root = aNode.documentElement;
            if (root === aDescendant) {
                return true;
            }
        }

        root = TP.ifInvalid(root, aNode);

        //  Otherwise, we can use the built-in 'compareDocumentPosition'
        //  method here. Thanks to Peter-Paul Koch.
        /* jshint bitwise:false */
        return !!(root.compareDocumentPosition(aDescendant) & 16);
    },
        /* jshint bitwise:true */
    'trident',
    function(aNode, aDescendant) {

        /**
         * @name nodeContainsNode
         * @synopsis Returns whether or not aNode is an ancestor (or the
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
         * @raise TP.sig.InvalidNode Raised when a node that isn't a kind
         *     'collection node' is provided to the method or an invalid child
         *     is provided.
         * @todo
         */

        var root,
            target;

        //  No child nodes for anything that isn't an element, document or
        //  document fragment
        if (!TP.isCollectionNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                                'Node not a collection Node.');
        }

        if (!TP.isNode(aDescendant)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  For documents the question is whether the child is an element
        //  and is in the document and still attached to a viable branch of
        //  the documentElement tree
        if (TP.isDocument(aNode) && TP.isElement(aDescendant)) {
            if ((TP.nodeGetDocument(aDescendant) !== aNode) ||
                TP.notValid(aNode.documentElement)) {
                return false;
            }

            root = aNode.documentElement;
            if (root === aDescendant) {
                return true;
            }
        }

        root = TP.ifInvalid(root, aNode);

        //  Otherwise, we can use the built-in 'contains' method if root
        //  has it as a method. HTML Element nodes have this IE-only method.
        if (TP.isCallable(root.contains)) {
            return root.contains(aDescendant);
        }

        //  We got here so root must be either a non-Element node or must be
        //  in an XML document, so we need to use this little traversal
        //  snippet.
        //  Thanks to Dean Edwards.

        target = aDescendant;
        while (target && (target = target.parentNode) && root !== target) {
            continue;
        }

        return !!target;
    },
    'webkit',
    function(aNode, aDescendant) {

        /**
         * @name nodeContainsNode
         * @synopsis Returns whether or not aNode is an ancestor (or the
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
         * @raise TP.sig.InvalidNode Raised when a node that isn't a kind
         *     'collection node' is provided to the method or an invalid child
         *     is provided.
         * @todo
         */

        var root,
            target;

        //  No child nodes for anything that isn't an element, document or
        //  document fragment
        if (!TP.isCollectionNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                                'Node not a collection Node.');
        }

        if (!TP.isNode(aDescendant)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  For documents the question is whether the child is an element
        //  and is in the document and still attached to a viable branch of
        //  the documentElement tree
        if (TP.isDocument(aNode) && TP.isElement(aDescendant)) {
            if ((TP.nodeGetDocument(aDescendant) !== aNode) ||
                TP.notValid(aNode.documentElement)) {
                return false;
            }

            root = aNode.documentElement;
            if (root === aDescendant) {
                return true;
            }
        }

        root = TP.ifInvalid(root, aNode);

        //  We got here so root must be either a non-Element node or must be
        //  in an XML document, so we need to use this little traversal
        //  snippet.
        //  Thanks to Dean Edwards.

        target = aDescendant;
        while (target && (target = target.parentNode) && root !== target) {
            continue;
        }

        return !!target;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEqualsNode',
TP.hc(
    'test',
    'trident',
    'true',
    function(aNode, otherNode) {

        /**
         * @name nodeEqualsNode
         * @synopsis Normalizes adjacent Text nodes on the supplied Node and its
         *     descendants.
         * @description This method follows the DOM Level 3 standard for
         *     checking Nodes for equality with each other. This specification
         *     states that two Nodes are equal if: - The two nodes are of the
         *     same type - The following string attributes are equal (they are
         *     either both null or they have the same length and are character
         *     for character identical): - nodeName - localName - namespaceURI -
         *     prefix - nodeValue - The 'attributes' NamedNodeMaps are equal
         *     (they are either both null or have the same length and for each
         *     node that exists in one map there is a node that exists in the
         *     other map and is equal although *not necessarily at the same
         *     index*). - The 'childNodes' NodeLists are equal (they are either
         *     both null or have the same length and contain equal nodes *at the
         *     same index*). Note that this method normalizes these nodes to
         *     make sure that this comparison is performed accurately.
         * @param {Node} aNode The node to check against otherNode.
         * @param {Node} otherNode The node to check against aNode.
         * @returns {Boolean} Whether or not the two nodes are *equal* (not
         *     necessarily identical).
         * @raise TP.sig.InvalidNode Raised when either node is an invalid node.
         * @todo
         */

        if (!TP.isNode(aNode) || !TP.isNode(otherNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  TODO: For now, this is just TP.todo()ed - since we're still
        //  using MSXML (even in IE9), we need to use that API to do this,
        //  if it exists.

        return TP.todo();
    },
    TP.DEFAULT,
    function(aNode, otherNode) {

        /**
         * @name nodeEqualsNode
         * @synopsis Normalizes adjacent Text nodes on the supplied Node and its
         *     descendants.
         * @description This method follows the DOM Level 3 standard for
         *     checking Nodes for equality with each other. This specification
         *     states that two Nodes are equal if: - The two nodes are of the
         *     same type - The following string attributes are equal (they are
         *     either both null or they have the same length and are character
         *     for character identical): - nodeName - localName - namespaceURI -
         *     prefix - nodeValue - The 'attributes' NamedNodeMaps are equal
         *     (they are either both null or have the same length and for each
         *     node that exists in one map there is a node that exists in the
         *     other map and is equal although *not necessarily at the same
         *     index*). - The 'childNodes' NodeLists are equal (they are either
         *     both null or have the same length and contain equal nodes *at the
         *     same index*). Note that this method normalizes these nodes to
         *     make sure that this comparison is performed accurately.
         * @param {Node} aNode The node to check against otherNode.
         * @param {Node} otherNode The node to check against aNode.
         * @returns {Boolean} Whether or not the two nodes are *equal* (not
         *     necessarily identical).
         * @raise TP.sig.InvalidNode Raised when either node is an invalid node.
         * @todo
         */

        if (!TP.isNode(aNode) || !TP.isNode(otherNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  In browsers that implement the W3C's DOM Level 3 'isEqualNode' call,
        //  we can just leverage that.

        return aNode.isEqualNode(otherNode);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEvaluateXPath',
TP.hc(
    'test',
    'trident',
    'true',
    function(aNode, anXPath, resultType, logErrors) {

        /**
         * @name nodeEvaluateXPath
         * @synopsis Returns the result of evaluating the XPath expression
         *     against the node given.
         * @param {Node} aNode The context node to begin querying for Nodes
         *     from.
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
         * @example Use XPath to select a node that has a particular id using
         *     the 'id()' function. Normally, this won't work unless the
         *     document has a DTD that specifies that that element should have
         *     an ID. TIBET makes it work when 'true' is passed for the
         *     'rewriteIDs' parameter:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo
         *         id="fooElem"><bar/></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeEvaluateXPath(xmlDoc, 'id("fooElem")');
         *          <samp></samp>
         *          TP.nodeEvaluateXPath(xmlDoc, 'id("fooElem")', null, null,
         *         true);
         *          <samp></samp>
         *     </code>
         * @returns {Array|Node} The XPath execution result.
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @raise TP.sig.InvalidString Raised when a null or empty XPath
         *     expression is provided to the method.
         * @todo
         */

        var log,

            theXPath,

            aNodeDoc,
            initialResultNodes,

            i,
            resultNodes,
            result,
            resultText,

            numResult,

            msg;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  NB: We can't use TP.isString() here, due to load ordering issues
        //  on startup.
        if (TP.isEmpty(anXPath)) {
            return TP.raise(this, 'TP.sig.InvalidString', arguments);
        }

        //  if we need it we can really turn on the XPath logging here
        TP.ifTrace(TP.sys.hasLoaded() && TP.sys.shouldLogXPaths()) ?
            TP.trace('Querying via XPath ' + anXPath,
                        TP.QUERY_LOG, arguments) : 0;

        log = TP.ifInvalid(logErrors, true);

        //  If the node has a valid ownerDocument, use that. Otherwise,
        //  assume that it is an XMLDocument itself, so use itself as the
        //  document.
        if (TP.isDocument(aNode.ownerDocument)) {
            aNodeDoc = aNode.ownerDocument;
        } else {
            aNodeDoc = aNode;
        }

        if (!TP.isXMLDocument(aNodeDoc)) {
            return TP.raise(this, 'TP.sig.InvalidXMLDocument', arguments);
        }

        //  Allow the shortcut convenience that TIBET provides of specifying
        //  the '$def:' prefix (intentionally illegal because it leads with
        //  a '$') for elements that are in the default namespace.
        TP.regex.XPATH_DEFAULTNS.lastIndex = 0;
        theXPath = anXPath.replace(TP.regex.XPATH_DEFAULTNS,
                                    '*[name()="$1"]');

        //  First, try to see if the XPath expression matches a Node or
        //  Nodeset.
        try {
            if (resultType === TP.NODESET) {
                initialResultNodes = aNode.selectNodes(theXPath);

                if (TP.isValid(initialResultNodes)) {
                    //  Repackage the initial result nodes as an Array of
                    //  nodes.
                    if (initialResultNodes.length > 0) {
                        resultNodes = TP.ac();

                        for (i = 0; i < initialResultNodes.length; i++) {
                            resultNodes.push(initialResultNodes[i]);
                        }

                        return resultNodes;
                    }
                }

                return TP.ac();
            } else if (resultType === TP.FIRST_NODE) {
                //  Otherwise, the requestor only wanted the first node in
                //  document order. Grab the first (or only) Node that
                //  matches the XPath expression given.
                result = aNode.selectSingleNode(theXPath);

                return result;
            } else {
                //  If an explicit result type wasn't specified, then we use
                //  the 'only node rule' - which is that if the result set
                //  only contains one node, we return that. Otherwise, we
                //  return the Array.

                initialResultNodes = aNode.selectNodes(theXPath);

                if (TP.isValid(initialResultNodes)) {
                    if (initialResultNodes.length === 1) {
                        return initialResultNodes[0];
                    }

                    //  Repackage the initial result nodes as an Array of
                    //  nodes.
                    if (initialResultNodes.length > 0) {
                        resultNodes = TP.ac();

                        for (i = 0; i < initialResultNodes.length; i++) {
                            resultNodes.push(initialResultNodes[i]);
                        }

                        return resultNodes;
                    }
                }

                return TP.ac();
            }
        } catch (e) {
            //  An exception was thrown from the 'select*Node(s)' call,
            //  which means that there is no Node or Nodeset result from the
            //  given XPath.
            //  It probably returns a scalar value. We need to rerun the
            //  XPath and see if there is a scalar value result.

            //  In IE, the only way to get a scalar value from an XPath
            //  expression is to use the expression in a stylesheet and grab
            //  the return value of transforming against that stylesheet. We
            //  defined the extraction stylesheet above in the global
            //  namespace.
            //  This technique is derived from a snippet by Dimitre
            //  Novatchev (dnovatchev@yahoo.com).

            //  Set the attribute in our stylesheet that holds the XPath
            //  that it is going to use in the transformation.
            $$pathValueOfNode.setAttribute('select', theXPath);

            $$scalarExtractionDoc.setProperty('SelectionNamespaces',
                TP.nodeGetDocument(aNode).getProperty(
                                            'SelectionNamespaces'));

            TP.elementCopyXMLNSAttributes(
                            TP.nodeGetDocument(aNode).documentElement,
                            $$scalarExtractionDoc.documentElement);

            try {
                //  The result will be an element (called 'resultText')
                //  containing our scalar value (we configured the
                //  stylesheet to omit the XML declaration - see above).
                result = TP.documentTransformNode($$scalarExtractionDoc,
                                                    aNode);

                //  Now, the scalar value should be the text value of the
                //  first child (a Text node) under what should be the only
                //  Element node in the result document (which should be the
                //  'resultText' element).

                if (TP.isXMLDocument(result)) {
                    resultText =
                        result.documentElement.firstChild.nodeValue;
                } else {
                    resultText = result.firstChild.nodeValue;
                }

                //  If the result is 'NaN', then a numeric computation went
                //  wrong and we should return the JavaScript NaN global
                //  (which is of a Number type).
                if (resultText === 'NaN') {
                    return NaN;
                }

                //  If the path contains one of the XPath numeric functions,
                //  we can try to construct a Number from the result.

                //  The numeric function RegExp is a global RegExp. Reset
                //  its last index here.
                $$numericFuncRegExp.lastIndex = 0;

                if ($$numericFuncRegExp.test(theXPath)) {
                    //  If trying to construct a Number from the result
                    //  results in a NaN, then the expression doesn't want
                    //  to return a Number but just uses Number functions
                    //  somewhere in the expression, so we just return the
                    //  String result.
                    numResult = TP.nc(resultText);

                    if (TP.isNaN(numResult)) {
                        return resultText;
                    }

                    //  Otherwise, we got a good numeric result so return
                    //  it.
                    return numResult;
                }

                //  If the result is either 'true' or 'false', then we
                //  construct a Boolean from it.
                if ((resultText === 'true') || (resultText === 'false')) {
                    return TP.bc(resultText);
                }

                //  It was just a String result, so return it.
                return resultText;
            /* jshint -W002 */
            } catch (e) {
            /* jshint +W002 */
                //  note that we allow for silent failure to avoid
                //  recursion, particularly in string localization calls
                if (log) {
                    msg = TP.join('Error evaluating XPath ', anXPath);
                    TP.ifError() ?
                        TP.error(TP.ec(e, msg), TP.QUERY_LOG, arguments) : 0;
                }
            }
        }

        return null;
    },
    TP.DEFAULT,
    function(aNode, anXPath, resultType, logErrors) {

        /**
         * @name nodeEvaluateXPath
         * @synopsis Returns the result of evaluating the XPath expression
         *     against the node given.
         * @param {Node} aNode The context node to begin querying for Nodes
         *     from.
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
         * @example Use XPath to select a node that has a particular id using
         *     the 'id()' function. Normally, this won't work unless the
         *     document has a DTD that specifies that that element should have
         *     an ID. TIBET makes it work when 'true' is passed for the
         *     'rewriteIDs' parameter:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo
         *         id="fooElem"><bar/></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeEvaluateXPath(xmlDoc, 'id("fooElem")');
         *          <samp></samp>
         *          TP.nodeEvaluateXPath(xmlDoc, 'id("fooElem")', null, null,
         *         true);
         *          <samp></samp>
         *     </code>
         * @returns {Array|Node} The XPath execution result.
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @raise TP.sig.InvalidString Raised when a null or empty XPath
         *     expression is provided to the method.
         * @todo
         */

        var log,

            theXPath,

            result,

            resultArr,
            node,

            msg;

        TP.debug('break.xpath');

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  NB: We can't use TP.isString() here, due to load ordering issues
        //  on startup.
        if (TP.isEmpty(anXPath)) {
            return TP.raise(this, 'TP.sig.InvalidString', arguments);
        }

        //  if we need it we can really turn on the XPath logging here
        TP.ifTrace(TP.sys.hasLoaded() && TP.sys.shouldLogXPaths()) ?
            TP.trace('Querying via XPath ' + anXPath,
                        TP.QUERY_LOG, arguments) : 0;

        log = TP.ifInvalid(logErrors, true);

        //  Allow the shortcut convenience that TIBET provides of specifying
        //  the '$def:' prefix (intentionally illegal because it leads with
        //  a '$') for elements that are in the default namespace.
        TP.regex.XPATH_DEFAULTNS.lastIndex = 0;
        theXPath = anXPath.replace(TP.regex.XPATH_DEFAULTNS,
                                    '*[name()="$1"]');

        try {
            //  Run the XPath, using the XPathResult.ANY_TYPE so that we
            //  either get a scalar value or an iterable set of Nodes.
            result = TP.nodeGetDocument(aNode).evaluate(
                            theXPath,
                            aNode,
                            TP.$$xpathResolverFunction,
                            XPathResult.ANY_TYPE,
                            null);

            //  If we got a value result, switch on the result type to get
            //  the primitive value. If its not one of the primitive values,
            //  then its a iterable node set, so we either iterate and
            //  repackage it into an Array or just iterate once and return
            //  the first node, depending on what our desired result type
            //  is.
            if (TP.isValid(result)) {
                switch (result.resultType) {
                    case XPathResult.NUMBER_TYPE:

                        return result.numberValue;

                    case XPathResult.BOOLEAN_TYPE:

                        return result.booleanValue;

                    case XPathResult.STRING_TYPE:

                        return result.stringValue;

                    default:

                        if (resultType === TP.NODESET) {
                            resultArr = TP.ac();

                            while (TP.isNode(node = result.iterateNext())) {
                                resultArr.push(node);
                            }

                            return resultArr;
                        } else if (resultType === TP.FIRST_NODE) {
                            if (TP.isNode(node = result.iterateNext())) {
                                return node;
                            }
                        } else {
                            //  If an explicit result type wasn't specified,
                            //  then we use the 'only node rule' - which is
                            //  that if the result set only contains one
                            //  node, we return that. Otherwise, we return
                            //  the Array.
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
            if (log || !TP.sys.hasLoaded()) {
                msg = TP.join('Error evaluating XPath ', anXPath);
                TP.ifError() ?
                    TP.error(TP.ec(e, msg), TP.QUERY_LOG, arguments) : 0;
            }
        }

        //  return value default depends on request type
        if (resultType === TP.NODESET) {
            return TP.ac();
        } else {
            return null;
        }
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDescendantElements',
TP.hc(
    'test',
    'trident',
    'true',
    function(aNode, breadthFirst) {

        /**
         * @name nodeGetDescendantElements
         * @synopsis Returns an Array of the children, grandchildren, and so on
         *     of the node provided which are Element nodes.
         * @param {Node} aNode The DOM node to operate on.
         * @param {Boolean} breadthFirst Breadth first if true. Default is
         *     false, meaning depth first (which is document order).
         * @example Get all of the Element nodes under the supplied Node as a
         *     regular JavaScript Array:
         *     <code>
         *          TP.nodeGetDescendantElements(document);
         *          <samp>...Array...</samp>
         *          TP.nodeGetDescendantElements(document, true);
         *          <samp>...Array sorted by 'breadth-first'...</samp>
         *     </code>
         * @returns {Array} An Array of the Element descendants of the supplied
         *     Node.
         * @raise TP.sig.InvalidNode Raised when a node that isn't a kind
         *     'collection node' is provided to the method.
         * @todo
         */

        var list,
            arr,
            i;

        //  no child nodes for anything that isn't an element, document or
        //  document fragment
        if (!TP.isCollectionNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                                'Node not a collection Node.');
        }

        //  DOM-compliant collection nodes can do this faster natively since
        //  depth first is how their lookups work
        if (TP.notTrue(breadthFirst) && !TP.isFragment(aNode)) {
            list = aNode.getElementsByTagName('*');

            //  IE puts nodes of type COMMENT_NODEs in the collection
            //  returned from getElementsByTagName('*'). Filter that here
            //  (which also allows us to repackage this as an Array in order
            //  to hand back the proper type).
            arr = TP.ac();
            for (i = 0; i < list.length; i++) {
                if (TP.isElement(list[i])) {
                    arr.push(list[i]);
                }
            }

            return arr;
        }

        //  for breadth first (or fragment nodes) we've got to use
        //  alternative iteration
        return TP.nodeGetDescendantsByType(aNode, Node.ELEMENT_NODE,
                                                            breadthFirst);
    },
    TP.DEFAULT,
    function(aNode, breadthFirst) {

        /**
         * @name nodeGetDescendantElements
         * @synopsis Returns an Array of the children, grandchildren, and so on
         *     of the node provided which are Element nodes.
         * @param {Node} aNode The DOM node to operate on.
         * @param {Boolean} breadthFirst Breadth first if true. Default is
         *     false, meaning depth first (which is document order).
         * @example Get all of the Element nodes under the supplied Node as a
         *     regular JavaScript Array:
         *     <code>
         *          TP.nodeGetDescendantElements(document);
         *          <samp>...Array...</samp>
         *          TP.nodeGetDescendantElements(document, true);
         *          <samp>...Array sorted by 'breadth-first'...</samp>
         *     </code>
         * @returns {Array} An Array of the Element descendants of the supplied
         *     Node.
         * @raise TP.sig.InvalidNode Raised when a node that isn't a kind
         *     'collection node' is provided to the method.
         * @todo
         */

        //  no child nodes for anything that isn't an element, document or
        //  document fragment
        if (!TP.isCollectionNode(aNode)) {
            return TP.raise(this,
                            'TP.sig.InvalidNode',
                            arguments,
                            'Node not a collection Node.');
        }

        //  DOM-compliant document and element nodes can do this faster
        //  natively since depth first is how their lookups work
        if (TP.notTrue(breadthFirst) && !TP.isFragment(aNode)) {
            //  Note how we convert the NodeList into an Array to hand back
            //  the proper type. No additional processing is needed here.
            return TP.ac(aNode.getElementsByTagName('*'));
        }

        //  for breadth first (or fragment nodes) we've got to use
        //  alternative iteration
        return TP.nodeGetDescendantsByType(aNode, Node.ELEMENT_NODE,
                                                            breadthFirst);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetDocument',
TP.hc(
    'test',
    'trident',
    'true',
    function(aNode) {

        /**
         * @name nodeGetDocument
         * @synopsis Returns the document node containing the node provided. If
         *     the node provided is a Document node, this function will return
         *     the node provided.
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
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @todo
         */

        var doc;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        if (aNode.nodeType === Node.DOCUMENT_NODE) {
            return aNode;
        }

        if (TP.isDocument(doc = aNode.ownerDocument)) {
            return doc;
        }

        return aNode.document;
    },
    TP.DEFAULT,
    function(aNode) {

        /**
         * @name nodeGetDocument
         * @synopsis Returns the document node containing the node provided. If
         *     the node provided is a Document node, this function will return
         *     the node provided.
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
         * @raise TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @todo
         */

        var doc,
            ancestor;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        if (aNode.nodeType === Node.DOCUMENT_NODE) {
            return aNode;
        }

        if (TP.isDocument(doc = aNode.ownerDocument)) {
            return doc;
        }

        //  NOTE thanks to a bug in early versions of Mozilla when you work
        //  with cloned documents the child elements can get detached from
        //  their ownerDocument pointers...so we iterate just in case.
        ancestor = aNode.parentNode;
        while (TP.isElement(ancestor) &&
                (ancestor.nodeType !== Node.DOCUMENT_NODE)) {
            //  NB: This assignment should *not* be moved into the looping
            //  logic. We want 'ancestor' to remain what it is if its
            //  parent node is null. This means it is the document itself
            //  and we want to use it below.
            ancestor = ancestor.parentNode;
        }

        if (TP.isElement(ancestor)) {
            return ancestor.ownerDocument;
        }

        return null;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetElementById',
TP.hc(
    'test',
    'trident',
    'true',
    function(aNode, anID) {

        /**
         * @name nodeGetElementById
         * @synopsis Returns the subelement of the node provided which has the
         *     ID given.
         * @description This is a wrapper for ID retrieval using the standard
         *     getElementById() call which deals with problems across XML and
         *     HTML DOM trees between Mozilla and IE. Note that the ID will have
         *     ":" translated to "_" to support NS-qualified IDs. In non-XHTML
         *     XML documents this function will return null if the element with
         *     id anID is not either the supplied node or a child of the
         *     supplied node.
         * @param {Node} aNode The node to search.
         * @param {String} anID The string ID to search for.
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
         * @raise TP.sig.InvalidNode Raised when a node that isn't a kind of
         *     'collection node' is provided to the method.
         * @raise TP.sig.InvalidID Raised when a null or empty ID is provided to
         *     the method.
         * @todo
         */

        var doc,
            id,

            realID,
            result;

        //  no child nodes for anything that isn't an element, document or
        //  document fragment
        if (!TP.isCollectionNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                                'Node not a collection Node.');
        }

        //  ID has to be a valid IDREF, but we're not going to be that
        //  strict
        if (TP.isEmpty(anID)) {
            return TP.raise(this, 'TP.sig.InvalidID', arguments);
        }

        //  best case we're looking for an ID in an HTML document, which is
        //  also our most common case
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

        //  MSXML4 (which is not normally used by TIBET since it isn't
        //  Microsoft sanctioned) has the 'nodeFromID' call available.
        //  MSXML6 also has this call, and it is the first version beyond
        //  MSXML3 sanctioned by Microsoft, hence the test is written in
        //  this way.

        //  NB: This code must be written this way, because nodeFromID()
        //  will not exist on versions of MSXML prior to version 4 and will
        //  throw an exception if an attempt is made to use it.
        if (TP.boot.isMSXML(4, TP.UP)) {
            try {
                result = aNode.nodeFromID(realID);
            } catch (e) {
                result = TP.nodeEvaluateXPath(
                            aNode,
                            'descendant-or-self::*[@id = "' + realID + '"]',
                            TP.FIRST_NODE);
            }
        } else {
            result = TP.nodeEvaluateXPath(
                        aNode,
                        'descendant-or-self::*[@id = "' + realID + '"]',
                        TP.FIRST_NODE);
        }

        return result;
    },
    TP.DEFAULT,
    function(aNode, anID, $retryWithXPath) {

        /**
         * @name nodeGetElementById
         * @synopsis Returns the subelement of the node provided which has the
         *     ID given.
         * @description This is a wrapper for ID retrieval using the standard
         *     getElementById() call which deals with problems across XML and
         *     HTML DOM trees between W3C-compliant browsers and IE. Note that
         *     the ID will have ":" translated to "_" to support NS-qualified
         *     IDs.
         * @description For HTML documents the standard getElementById call is
         *     often sufficient, however XML documents will vary on
         *     W3C-compliant browsers based on the namespace and whether there's
         *     an internal DTD that defines IDREF attributes for that document.
         *     Many of TIBET's metadata files are maintained in augmented XHTML
         *     files with these internal DTDs so an XPath fallback is just extra
         *     overhead since if the ID existed it would have been found. The
         *     $retryWithXPath attribute is therefore used internally by
         *     metadata-related searches to avoid this overhead. In non-XHTML
         *     XML documents this function will return null if the element with
         *     id anID is not either the supplied node or a child of the
         *     supplied node.
         * @param {Node} aNode The node to search.
         * @param {String} anID The string ID to search for.
         * @param {Boolean} $retryWithXPath False to force ID search to skip
         *     XPath fallbacks.
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
         * @raise TP.sig.InvalidNode Raised when a node that isn't a kind
         *     'collection node' is provided to the method.
         * @raise TP.sig.InvalidID Raised when a null or empty ID is provided to
         *     the method.
         * @todo
         */

        var doc,
            id,

            realID,
            result;

        //  no child nodes for anything that isn't an element, document or
        //  document fragment
        if (!TP.isCollectionNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                                'Node not a collection Node.');
        }

        //  ID has to be a valid IDREF, but we're not going to be that
        //  strict
        if (TP.isEmpty(anID)) {
            return TP.raise(this, 'TP.sig.InvalidID', arguments);
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
            if ((result = doc.getElementById(realID))) {
                return result;
            }
        }

        //  we force retry to false on our metadata XHTML files so we don't
        //  search for something we're not going to find
        if (TP.notFalse($retryWithXPath)) {
            //  Otherwise, its XML that's not XHTML, so getElementById()
            //  won't work (sigh...), so we need to use an XPath looking for
            //  the first Element with that ID.
            result = TP.nodeEvaluateXPath(
                    aNode,
                    'descendant-or-self::*[@id' + ' = "' + realID + '"]',
                    TP.FIRST_NODE);
        }

        return result;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeImportNode',
TP.hc(
    'test',
    'trident',
    'true',
    function(aNode, otherNode) {

        /**
         * @name nodeImportNode
         * @synopsis Imports the other node into the document of the supplied
         *     node if it doesn't already belong to that document.
         * @param {Node} aNode The node to obtain the document to import the
         *     otherNode to.
         * @param {Node} otherNode The node to import into the document of aNode
         *     if necessary.
         * @raises TP.sig.InvalidNode
         * @returns {Node} The other node. This may be a different node than
         *     what was supplied to this routine, if it was imported.
         * @todo
         */

        var nodeDoc,
            theNode,

            prefix,

            childNodes,
            len,
            i;

        if (!TP.isNode(aNode) || !TP.isNode(otherNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  Grab aNode's document and check to see if otherNode is in the
        //  same document. If not, call the native 'importNode' routine.
        nodeDoc = TP.nodeGetDocument(aNode);

        if (nodeDoc !== TP.nodeGetDocument(otherNode)) {
            //  The nodes aren't in the same document. On Trident, however,
            //  there is another    problem that we can solve here and that
            //  is the problem of trying to put XML nodes into HTML DOMs.
            //  Trident really hates that, so we can convert it here.

            if (TP.isHTMLNode(aNode) && TP.isHTMLNode(otherNode)) {
                //  TODO: For now, we don't worry about this since its
                //  'HTML to HTML', but it may really be from one HTML
                //  document to another HTML document, in which case we
                //  should 'do the right thing'.
                return otherNode;
            }

            if (TP.isHTMLNode(aNode) && TP.isXMLNode(otherNode)) {
                //  Do conversion from X(HT)ML to HTML.
                return TP.nodeAsHTMLNode(otherNode,
                                            TP.nodeGetDocument(aNode));
            } else if (TP.isXMLNode(aNode) && TP.isHTMLNode(otherNode)) {
                //  Do conversion from HTML to X(HT)ML.
                return TP.nodeAsXMLNode(otherNode,
                                            TP.nodeGetDocument(aNode));
            } else if (TP.isXMLNode(aNode) && TP.isXMLNode(otherNode)) {
                //  Up until MSXML 5, IE didn't do an importNode() for XML
                //  because it didn't worry about XML nodes going from one
                //  document to another. Since, according to MS you
                //  shouldn't support either MSXML 4 or 5, we detect for
                //  MSXML 6 or higher and go ahead and do the importNode()
                //  if we're running on that.
                if (TP.$msxml >= 6) {
                    //  Grab aNode's document and check to see if otherNode
                    //  is in the same document. If not, call the native
                    //  'importNode' routine.
                    nodeDoc = TP.nodeGetDocument(aNode);

                    if (nodeDoc !== TP.nodeGetDocument(otherNode)) {
                        theNode = nodeDoc.importNode(otherNode, true);
                    } else {
                        theNode = otherNode;
                    }
                } else {
                    theNode = otherNode;
                }
            }
        } else {
            theNode = otherNode;
        }

        //  Now do some namespace normalization. If aNode and theNode have
        //  the same namespace URI, then remove the 'xmlns' attribute (or
        //  'xmlns:<prefix>' attribute where prefix matches the node's
        //  prefix - but *NOT* other 'xmlns:<prefix>' attributes - other
        //  nodes may need them). This is to avoid multiple namespace nodes
        //  showing up during serialization, which just makes things messy.

        if (TP.isElement(theNode)) {
            //  If the namespaceURIs are the same, then 'theNode' doesn't
            //  need to redefine the same namespace, so we can remove the
            //  namespace node defining that namespace (if there is one).
            if (aNode.namespaceURI === theNode.namespaceURI) {
                //  use the prefix that was defined for the element, if
                //  there is one.
                if (TP.notEmpty(prefix = theNode.prefix)) {
                    //theNode.removeAttributeNS(TP.w3.Xmlns.XMLNS,
                    //                          'xmlns:' + prefix);
                } else {
                    //  Otherwise, just remove the default namespace 'xmlns'
                    //  one.
                    //theNode.removeAttributeNS(TP.w3.Xmlns.XMLNS, 'xmlns');
                }
            }
        } else if (TP.isFragment(theNode)) {
            //  theNode is a fragment. We need to do this process, but one
            //  by one through the fragment's child nodes.

            childNodes = theNode.childNodes;
            len = childNodes.length;

            for (i = 0; i < len; i++) {
                if (aNode.namespaceURI === childNodes[i].namespaceURI) {
                    if (TP.notEmpty(prefix = childNodes[i].prefix)) {
                        //childNodes[i].removeAttributeNS(TP.w3.Xmlns.XMLNS,
                        //                              'xmlns:' + prefix);
                    } else {
                        //childNodes[i].removeAttributeNS(TP.w3.Xmlns.XMLNS,
                        //                              'xmlns');
                    }
                }
            }
        }

        return theNode;
    },
    TP.DEFAULT,
    function(aNode, otherNode) {

        var nodeDoc,
            theNode,

            prefix,

            children,
            len,
            i;

        if (!TP.isNode(aNode) || !TP.isNode(otherNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  Grab aNode's document and check to see if otherNode is in the
        //  same document. If not, call the native 'importNode' routine.
        nodeDoc = TP.nodeGetDocument(aNode);

        if (nodeDoc !== TP.nodeGetDocument(otherNode)) {
            theNode = nodeDoc.importNode(otherNode, true);
        } else {
            theNode = otherNode;
        }

        //  If aNode is an XML node, do some namespace normalization. If
        //  aNode and theNode have the same namespace URI, then remove the
        //  'xmlns' attribute (or 'xmlns:<prefix>' attribute where prefix
        //  matches the node's prefix - but *NOT* other 'xmlns:<prefix>'
        //  attributes - other nodes may need them). This is to avoid
        //  multiple namespace nodes showing up during serialization, which
        //  just makes things messy.
        if (TP.isXMLNode(aNode)) {
            if (TP.isElement(theNode)) {
                //  If the namespaceURIs are the same, then 'theNode'
                //  doesn't need to redefine the same namespace, so we can
                //  remove the namespace node defining that namespace (if
                //  there is one).
                if (aNode.namespaceURI === theNode.namespaceURI) {
                    //  use the prefix that was defined for the element, if
                    //  there is one.
                    if (TP.notEmpty(prefix = theNode.prefix)) {
                        theNode.removeAttributeNS(TP.w3.Xmlns.XMLNS,
                                                    'xmlns:' + prefix);
                    } else {
                        //  Otherwise, just remove the default namespace
                        //  'xmlns' one.
                        theNode.removeAttributeNS(TP.w3.Xmlns.XMLNS,
                                                    'xmlns');
                    }
                }
            } else if (TP.isFragment(theNode)) {
                //  theNode is a fragment. We need to do this process, but
                //  one by one through the fragment's child elements.

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
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeSwapNode',
TP.hc(
    'test',
    'trident',
    'true',
    function(firstNode, secondNode) {

        /**
         * @name nodeSwapNode
         * @synopsis Swaps the first node into the place where the second node
         *     is and vice versa. Note that both Nodes supplied to this method
         *     must be contained in the same overall Document.
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
         * @raise TP.sig.InvalidNode Raised when either node is an invalid node
         *     or when the nodes are not contained in the same overall Document.
         * @todo
         */

        var insertionPoint,
            parentNode;

        if (!TP.isNode(firstNode) ||
            !TP.isNode(secondNode) ||
            (TP.nodeGetDocument(firstNode) !==
                 TP.nodeGetDocument(secondNode))) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        //  IE's native mechanism won't work on XML documents, so we only
        //  use it if the document isn't an XML document.
        if (!TP.isXMLDocument(TP.nodeGetDocument(firstNode))) {
            //  Use the native swapNode method.
            firstNode.swapNode(secondNode);

            return;
        }

        //  Otherwise, we use the more generic 'DOM-based' mechanism.

        insertionPoint = firstNode.nextSibling;

        //  If the insertion point is the same node as the secondNode, then
        //  set the insertion point to be the firstNode (we're switching
        //  places between two adjacent nodes).
        if (insertionPoint === secondNode) {
            insertionPoint = firstNode;
        }

        parentNode = firstNode.parentNode;

        //  Note here how we force awakening to 'false' in case we're
        //  dealing with HTML nodes here.

        TP.nodeReplaceChild(secondNode.parentNode,
                            firstNode,
                            secondNode,
                            false);

        TP.nodeInsertBefore(parentNode, secondNode, insertionPoint, false);

        return;
    },
    TP.DEFAULT,
    function(firstNode, secondNode) {

        /**
         * @name nodeSwapNode
         * @synopsis Swaps the first node into the place where the second node
         *     is and vice versa. Note that both Nodes supplied to this method
         *     must be contained in the same overall Document.
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
         * @raise TP.sig.InvalidNode Raised when either node is an invalid node
         *     or when the nodes are not contained in the same overall Document.
         * @todo
         */

        var insertionPoint,
            parentNode;

        if (!TP.isNode(firstNode) ||
            !TP.isNode(secondNode) ||
            (TP.nodeGetDocument(firstNode) !==
                 TP.nodeGetDocument(secondNode))) {
            return TP.raise(this, 'TP.sig.InvalidNode', arguments);
        }

        insertionPoint = firstNode.nextSibling;

        //  If the insertion point is the same node as the secondNode, then
        //  set the insertion point to be the firstNode (we're switching
        //  places between two adjacent nodes).
        if (insertionPoint === secondNode) {
            insertionPoint = firstNode;
        }

        parentNode = firstNode.parentNode;

        //  Note here how we force awakening to 'false' in case we're
        //  dealing with HTML nodes here.

        TP.nodeReplaceChild(secondNode.parentNode,
                            firstNode,
                            secondNode,
                            false);

        TP.nodeInsertBefore(parentNode, secondNode, insertionPoint, false);

        return;
    }
));

//  ------------------------------------------------------------------------
//  UTILITY DATA STRUCTURES
//  ------------------------------------------------------------------------

//  Lastly, we execute some functions that will set up certain data
//  structures for the various platforms.
TP.runConditionalFunction(
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function() {

        TP.regex.GECKO_XML_PARSE =
            /XML Parsing Error: ([^\n]+)\nLocation: [^\n]+\nLine Number (\d+), Column (\d+)/;

        return;
    },
    'trident',
    function() {

        //  Global XML trees to use for scalar extraction. See below.

        TP.sys.defineGlobal('$$scalarExtractionDoc',
                TP.documentFromString('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"><xsl:output omit-xml-declaration="yes"/><xsl:template match="*"><resultText><xsl:value-of select=""/></resultText></xsl:template></xsl:stylesheet>'));

        TP.sys.defineGlobal('$$pathValueOfNode',
                $$scalarExtractionDoc.selectSingleNode('//xsl:value-of'));

        TP.sys.defineGlobal('$$numericFuncRegExp',
                /ceiling|count|floor|last|number|position|round|string-length|sum/g);

        return;
    },
    'webkit',
    function() {

        TP.regex.WEBKIT_XML_PARSE =
            /error on line (\d+) at column (\d+): ([^<]+)/;

        return;
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
