//  ========================================================================
/*
NAME:   TIBETDOMPrimitivesPre.js
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
@file       TIBETDOMPrimitivesPre.js
@abstract   DOM-specific operations which form the foundation for, or which
            may be replaced or modified by, browser-specific code which
            loads later.
*/

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('getQNameRegex',
function(aName) {

    /**
     * @name getQNameRegex
     * @synopsis Returns a RegExp built to match a tag or attribute name with
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
     * @todo
     */

    var re,
        list;

    //  If aName was empty, we just generate a RegExp that matches
    //  any character.
    if (TP.isEmpty(aName)) {
        re = TP.rc('.*');
    } else {
        list = aName.split(' ');
        list.convert(
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

TP.definePrimitive('documentCreateFragment',
function(aDocument) {

    /**
     * @name documentCreateFragment
     * @synopsis Creates and returns a new document fragment for the document
     *     provided, or the document of the code frame. You should provide the
     *     document that you will append/insert the fragment into to avoid
     *     incorrect document DOM errors.
     * @param {Document} aDocument The document to use in the construction
     *     process. There is no default value.
     * @example Create a document fragment in myDocument
     *     <code>
     *          aFrag = TP.documentCreateFragment(document);
     *          <samp>[object DocumentFragment]</samp>
     *     </code>
     * @returns {DocumentFragment} A valid DOM DocumentFragment.
     * @raise TP.sig.InvalidDocument Raised when an invalid Document is provided
     *     to the method.
     * @todo
     */

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  NOTE the inversion of the name, this is the true call but it's not
    //  consistent with our naming conventions
    return aDocument.createDocumentFragment();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetDoctypeInfo',
function(aDocument) {

    /**
     * @name documentGetDoctypeInfo
     * @synopsis Returns the Document Type info for the supplied document.
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
     * @returns {TP.lang.Hash} The document type info for this document.
     * @raise TP.sig.InvalidXMLDocument Raised when an invalid XML document is
     *     provided to the method.
     * @todo
     */

    var theDocType,
        docTypeInfo;

    if (!TP.isXMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidXMLDocument', arguments);
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
     * @name documentGetMIMEType
     * @synopsis Returns the MIME type for the supplied document.
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
     * @raise TP.sig.InvalidDocument Raised when an invalid document is provided
     *     to the method.
     * @todo
     */

    var metaTags,

        i,
        metaName,
        metaValue;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    metaTags = aDocument.getElementsByTagName('meta');

    //  NB: 'getElementsByTagName' returns a DOMCollection, so we treat it
    //  accordingly
    for (i = 0; i < metaTags.length; i++) {
        //  If there is a 'meta' tag with the 'http-equiv' attribute and
        //  that attribute is 'Content-Type', then return the value of the
        //  attribute named 'content', which should be the MIME type.
        metaName = TP.getAttr(metaTags[i], 'http-equiv');
        if (TP.notEmpty(metaName) && (metaName === 'Content-Type')) {
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
     * @name nodeAddDefaultXMLNS
     * @synopsis Sets the default namespace for the supplied Node (which needs
     *     to be a Document or Element) *and returns a new Node* (since it is
     *     impossible to actually set the default namespace on an existing
     *     Element).
     * @description If the supplied Node already has a default namespace, this
     *     method will *not* reset it.
     * @param {Node} aNode The Node to add the default namespace to.
     * @returns {Node} A new Node (Document or Element depending on what was
     *     provided to this method) with the namespace added to it.
     * @raise TP.sig.InvalidNode Raised when an invalid document or element is
     *     provided to the method.
     * @raise TP.sig.InvalidString Raised when an invalid namespace URI is
     *     provided to the method.
     * @todo
     */

    var elem,
        str;

    if (!TP.isDocument(aNode) && !TP.isElement(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    if (TP.isEmpty(namespaceURI)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    elem = TP.isDocument(aNode) ? aNode.documentElement : aNode;

    str = TP.str(elem);

    if (!TP.regex.CONTAINS_ELEM_MARKUP.test(str)) {
        return TP.raise(this, 'TP.sig.InvalidMarkup', arguments);
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
//  end
//  ========================================================================
