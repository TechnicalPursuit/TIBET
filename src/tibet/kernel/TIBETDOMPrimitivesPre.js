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
//  UTILITY METHODS
//  ------------------------------------------------------------------------

TP.definePrimitive('$$xpathResolverFunction',
function(aPrefix) {

    /**
     * @method $$xpathResolverFunction
     * @summary Resolves the supplied prefix into a matching namespace URI.
     * @param {String} aPrefix The prefix to use to look up a namespace URI.
     * @returns {String} The namespace URI that matches the supplied prefix.
     */

    var namespaceURI;

    if (TP.notEmpty(aPrefix) &&
        TP.isString(namespaceURI = TP.w3.Xmlns.getPrefixURI(aPrefix))) {
        return namespaceURI;
    }

    return null;
});

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('getQNameRegex',
function(aName) {

    /**
     * @method getQNameRegex
     * @summary Returns a RegExp built to match a tag or attribute name with
     *     optional wildcarding for prefixes or names. For example, a name of
     *     'xf:*' will produce a regular expression that will find all
     *     tag/attribute names with an xf prefix. This function is normally used
     *     by the various node/element selector calls in TIBET so you don't
     *     typically call it yourself.
     * @param {String} aName A string containing an optional prefix, colon, and
     *     name, or a * in place of either the prefix or name. IE: 'div',
     *     'html:*', '*:div', '*', '*:*', etc.
     * @returns {RegExp} A regular expression which properly escapes any
     *     wildcarding in the search.
     */

    var re,
        list;

    //  If aName was empty, we just generate a RegExp that matches
    //  any character.
    if (TP.isEmpty(aName)) {
        re = TP.rc('.*');
    } else {
        list = aName.split(' ');
        list = list.map(
            function(name) {

                if (/\*:\*/.test(name)) {
                    //  *:* -- we can match anything, so .* works
                    return '.*';
                } else if (/\*:/.test(name)) {
                    //  *:something -- so we have to escape the * or get
                    //  regex err
                    return name.replace('*:', '\\\\*:');
                } else if (/:\*/.test(name)) {
                    //  something:* -- so we have to escape the * or get
                    //  regex err
                    return name.replace(':*', ':\\\\*');
                } else {
                    //  no wildcard, use as is (so it could be a regex
                    //  anyway)
                    return name;
                }
            });

        re = TP.rc(list.join('|'));
    }

    return re;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentConstructFragment',
function(aDocument) {

    /**
     * @method documentConstructFragment
     * @summary Creates and returns a new document fragment for the document
     *     provided, or the document of the code frame. You should provide the
     *     document that you will append/insert the fragment into to avoid
     *     incorrect document DOM errors.
     * @param {Document} aDocument The document to use in the construction
     *     process. There is no default value.
     * @example Create a document fragment in myDocument
     *     <code>
     *          aFrag = TP.documentConstructFragment(document);
     *          <samp>[object DocumentFragment]</samp>
     *     </code>
     * @returns {DocumentFragment} A valid DOM DocumentFragment.
     * @exception TP.sig.InvalidDocument Raised when an invalid Document is
     *     provided to the method.
     */

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  NOTE the inversion of the name, this is the true call but it's not
    //  consistent with our naming conventions
    return aDocument.createDocumentFragment();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetDoctypeInfo',
function(aDocument) {

    /**
     * @method documentGetDoctypeInfo
     * @summary Returns the Document Type info for the supplied document.
     * @description This function returns one of two values, depending on the
     *     browser it is running in and whether or not the application author
     *     has placed a document type declaration at the top of the document. 1)
     *     If the document has a document type declaration and that information
     *     can be accessed in the browser, a literal object consisting of 3
     *     keys: docTypeName, publicID, systemID. 2) Otherwise, null is
     *     returned.
     * @param {XMLDocument} aDocument The document to query.
     * @example Get the doctype info from an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString('<!DOCTYPE moo [<!ELEMENT boo
     *         EMPTY>]><foo xmlns="http://www.foo.com"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.documentGetDoctypeInfo(xmlDoc).asString();
     *          <samp>{"docTypeName":"moo", "publicID":"", "systemID":""}</samp>
     *     </code>
     * @returns {TP.core.Hash} The document type info for this document.
     * @exception TP.sig.InvalidXMLDocument Raised when an invalid XML document
     *     is provided to the method.
     */

    var theDocType,
        docTypeInfo;

    if (!TP.isXMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidXMLDocument');
    }

    theDocType = aDocument.doctype;

    if (TP.isValid(theDocType)) {
        docTypeInfo = TP.hc('docTypeName', '',
                            'publicID', '',
                            'systemID', '');

        //  NB: Since 'theDocType' was created in another frame, it
        //  is not TIBET-enhanced, hence the 'direct access' syntax.
        if (TP.isString(theDocType.name)) {
            docTypeInfo.atPut('docTypeName', theDocType.name);
        }

        if (TP.isString(theDocType.publicId)) {
            docTypeInfo.atPut('publicID', theDocType.publicId);
        }

        if (TP.isString(theDocType.systemId)) {
            docTypeInfo.atPut('systemID', theDocType.systemId);
        }

        return docTypeInfo;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetMIMEType',
function(aDocument) {

    /**
     * @method documentGetMIMEType
     * @summary Returns the MIME type for the supplied document.
     * @description This function returns one of two values, depending on the
     *     browser it is running in and whether or not the application author
     *     has placed a 'meta' element that has a 'Content-Type' attribute
     *     defined in it. 1) If the document has a 'meta' element that has a
     *     'Content-Type' attribute, that value is parsed for the MIME type. 2)
     *     Otherwise, if its an HTML document, the value of
     *     TP.core.Browser.DEFAULT_MIME_TYPE is returned. If its an XML
     *     document, null is returned.
     * @param {Document} aDocument The document to query.
     * @example Get the MIME type from an HTML document:
     *     <code>
     *          TP.documentGetMIMEType(document);
     *          <samp>text/html</samp>
     *     </code>
     * @example Get the MIME type from an XML document:
     *     <code>
     *          xmlDoc = TP.documentFromString('<foo
     *         xmlns="http://www.foo.com"/>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.documentGetMIMEType(xmlDoc);
     *          <samp>null</samp>
     *     </code>
     * @returns {String} The MIME type for this document.
     * @exception TP.sig.InvalidDocument Raised when an invalid document is
     *     provided to the method.
     */

    var metaTags,

        i,
        metaName,
        metaValue;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    metaTags = aDocument.getElementsByTagName('meta');

    //  NB: 'getElementsByTagName' returns a DOMCollection, so we treat it
    //  accordingly
    for (i = 0; i < metaTags.length; i++) {
        //  If there is a 'meta' tag with the 'http-equiv' attribute and
        //  that attribute is 'Content-Type', then return the value of the
        //  attribute named 'content', which should be the MIME type.
        metaName = TP.getAttr(metaTags[i], 'http-equiv');
        if (TP.notEmpty(metaName) && metaName === 'Content-Type') {
            metaValue = TP.getAttr(metaTags[i], 'content');

            TP.regex.MIME_TYPE.lastIndex = 0;
            return TP.regex.MIME_TYPE.exec(metaValue)[0];
        }
    }

    if (TP.isHTMLDocument(aDocument)) {
        //  use the brower type's default value
        return TP.core.Browser.DEFAULT_MIME_TYPE;
    } else {
        return null;
    }
});

//  ------------------------------------------------------------------------
//  NODE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAddDefaultXMLNS',
function(aNode, namespaceURI) {

    /**
     * @method nodeAddDefaultXMLNS
     * @summary Sets the default namespace for the supplied Node (which needs
     *     to be a Document or Element) *and returns a new Node* (since it is
     *     impossible to actually set the default namespace on an existing
     *     Element).
     * @description If the supplied Node already has a default namespace, this
     *     method will *not* reset it.
     * @param {Node} aNode The Node to add the default namespace to.
     * @param {String} namespaceURI The namespace URI to associate with the
     *     default namespace.
     * @returns {Node} A new Node (Document or Element depending on what was
     *     provided to this method) with the namespace added to it.
     * @exception TP.sig.InvalidNode Raised when an invalid document or element
     *     is provided to the method.
     * @exception TP.sig.InvalidString Raised when an invalid namespace URI is
     *     provided to the method.
     */

    var elem,
        str;

    if (!TP.isDocument(aNode) && !TP.isElement(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.isEmpty(namespaceURI)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    elem = TP.isDocument(aNode) ? aNode.documentElement : aNode;

    str = TP.str(elem);

    if (!TP.regex.CONTAINS_ELEM_MARKUP.test(str)) {
        return TP.raise(this, 'TP.sig.InvalidMarkup');
    }

    //  Test the element to make sure that we don't already have an 'xmlns'
    //  attribute. We do this since, in this context, the 'namespaceURI'
    //  property is meaningless - we actually want to know if this element
    //  has the 'xmlns' *default* namespace attribute itself. The best way
    //  to do this is actually get a value for the 'xmlns' attribute... even
    //  namespace 'nodes' are exposed to the DOM.
    if (TP.notEmpty(TP.elementGetAttribute(elem, 'xmlns'))) {
        return aNode;
    }

    str = str.replace(TP.regex.OPENING_TAG_NAME,
                        '<$1 xmlns="' + namespaceURI + '"');

    if (TP.isDocument(aNode)) {
        return TP.doc(str);
    } else {
        return TP.elem(str);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeCopyTIBETExpandos',
function(srcNode, destNode, shouldRemove) {

    /**
     * @method nodeCopyTIBETExpandos
     * @summary Copies the special TIBET expandos from the srcNode to the
     *     destNode.
     * @param {Node} srcNode The node to copy the expandos from.
     * @param {Node} destNode The node to copy the expandos to.
     * @param {Boolean} [shouldRemove=true] Whether or not to remove expandos
     *     from the srcNode.
     * @exception TP.sig.InvalidNode
     */

    var srcDoc,
        destDoc,

        val;

    if (!TP.isNode(srcNode) || !TP.isNode(destNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    srcDoc = TP.nodeGetDocument(srcNode);
    destDoc = TP.nodeGetDocument(srcNode);

    //  We never copy the following TIBET expandos:
    //      TP.EVENT_IDS
    //      TP.WRAPPER

    //  We only copy the following TIBET expandos if the 2 documents are the
    //  same.
    if (srcDoc === destDoc) {
        destNode[TP.GLOBAL_ID] = TP.notEmpty(val = srcNode[TP.GLOBAL_ID]) ?
                                    val :
                                    destNode[TP.GLOBAL_ID];
    }

    //  We always copy the following TIBET expandos:
    destNode[TP.SHOULD_SIGNAL_CHANGE] =
            TP.notEmpty(val = srcNode[TP.SHOULD_SIGNAL_CHANGE]) ?
            val :
            destNode[TP.SHOULD_SIGNAL_CHANGE];
    destNode[TP.SHOULD_SUSPEND_SIGNALING] =
            TP.notEmpty(val = srcNode[TP.SHOULD_SUSPEND_SIGNALING]) ?
            val :
            destNode[TP.SHOULD_SUSPEND_SIGNALING];

    destNode[TP.GENERATOR] = TP.notEmpty(val = srcNode[TP.GENERATOR]) ?
                                val :
                                destNode[TP.GENERATOR];

    destNode[TP.PREVIOUS_POSITION] =
                            TP.notEmpty(val = srcNode[TP.PREVIOUS_POSITION]) ?
                            val :
                            destNode[TP.PREVIOUS_POSITION];

    if (TP.isDocument(srcNode) && TP.isDocument(destNode)) {
        destNode[TP.SRC_LOCATION] =
                    TP.notEmpty(val = srcNode[TP.SRC_LOCATION]) ?
                                val :
                                destNode[TP.SRC_LOCATION];
    }

    if (TP.notFalse(shouldRemove)) {
        srcNode[TP.EVENT_IDS] = null;

        srcNode[TP.WRAPPER] = null;
        srcNode[TP.NODE_TYPE] = null;

        srcNode[TP.GLOBAL_ID] = null;

        srcNode[TP.SHOULD_SIGNAL_CHANGE] = null;
        srcNode[TP.SHOULD_SUSPEND_SIGNALING] = null;

        srcNode[TP.GENERATOR] = null;
        srcNode[TP.PREVIOUS_POSITION] = null;

        if (TP.isDocument(srcNode) && TP.isDocument(destNode)) {
            srcNode[TP.SRC_LOCATION] = null;
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
