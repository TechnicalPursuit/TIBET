//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 */

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('elementComputeXMLBaseFrom',
function(anElement, expandVirtuals) {

    /**
     * @method elementComputeXMLBaseFrom
     * @summary Computes the XML Base path from anElement out to the root
     *     element of the element's owner document.
     * @description XML Base entries are cumulative. Suppose elementA is a
     *     parent of anElement and has an base entry of 'foo/bar/'. elementB is
     *     a parent of elementA and has an XML Base entry of '/baz'. The XML
     *     Base path for anElement, then, is computed to be '/baz/foo/bar/'.
     *     Note that, once an entry that has a colon (':') is found, traversal
     *     is halted (as a 'scheme' for the URI has been found) and the base is
     *     computed from there, as that designates the beginning of an absolute
     *     path entry.
     * @param {Element} anElement The Element to begin the computation of the
     *     XML Base path from.
     * @param {Boolean} expandVirtuals Whether or not we should 'expand'
     *     'virtual URIs' in XML Base entries that we encounter along the way
     *     when computing the XML Base for the supplied Element. This defaults
     *     to true.
     * @exception TP.sig.InvalidElement
     * @returns {String} The XML Base path as computed from anElement up the
     *     document hierarchy.
     */

    var elem,

        shouldExpand,

        base,
        expandedBase,

        computedBase;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    elem = anElement;
    shouldExpand = TP.ifInvalid(expandVirtuals, true);

    base = TP.ifEmpty(TP.elementGetAttribute(elem, 'xml:base', true), '');

    //  Make sure the 'xml:base' is expanded and if its not, set the
    //  attribute's value back to the fully expanded value.
    expandedBase = TP.uriExpandPath(base);
    if (base !== expandedBase && shouldExpand) {
        TP.elementSetAttributeInNS(elem, 'xml:base', expandedBase,
                                    TP.w3.Xmlns.XML);
    }

    if (TP.notEmpty(expandedBase) && TP.uriIsAbsolute(expandedBase)) {
        return expandedBase;
    }

    //  The initial value of the computed base is the expanded version of
    //  our starting 'xml:base'. Now we'll traverse the tree and add from
    //  there.
    computedBase = expandedBase;

    //  Traverse up the element's parent chain
    while (TP.isElement(elem = elem.parentNode)) {
        if (TP.notEmpty(base = TP.elementGetAttribute(elem,
                                                        'xml:base',
                                                        true))) {
            //  Make sure the 'xml:base' is expanded and if its not, set the
            //  attribute's value back to the fully expanded value.
            expandedBase = TP.uriExpandPath(base);
            if (base !== expandedBase && shouldExpand) {
                TP.elementSetAttributeInNS(elem,
                                            'xml:base',
                                            expandedBase,
                                            TP.w3.Xmlns.XML);
            }

            computedBase = TP.uriJoinPaths(expandedBase, computedBase);

            if (TP.uriIsAbsolute(computedBase)) {
                return computedBase;
            }
        }
    }

    return computedBase;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementComputeTIBETTypeKey',
function(anElement) {

    /**
     * @method elementComputeTIBETTypeKey
     * @summary Returns a unique key that will identify the TIBET type that
     *     matches the supplied Element.
     * @param {Element} anElement The Element to compute the unique key for.
     * @returns {String} A unique key that identifiers the TIBET type.
     * @exception TP.sig.InvalidElement
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  If the element is an XHTML 'input' type, we further qualify by the
    //  'type' property.
    if (anElement.namespaceURI === TP.w3.Xmlns.XHTML &&
        anElement.localName === 'input') {

        return TP.elementGetFullName(anElement) +
                    '[type="' + anElement.type + '"]';
    }

    return TP.elementGetFullName(anElement);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementResolveXMLBase',
function(anElement, uriAttrNames, aPrefix, aSuffix) {

    /**
     * @method elementResolveXMLBase
     * @summary Loops over the supplied list of attribute names and resolves
     *     their values on the supplied element with respect to XML Base. If the
     *     URI is not absolute and needs an XML Base value, this is obtained and
     *     the attribute value is rewritten with that value..
     * @param {Element} anElement The element to update any URI attributes of.
     * @param {String[]} uriAttrNames The list of attribute names that should be
     *     considered for XML Base processing.
     * @param {String} aPrefix An optional prefix that should be stripped before
     *     computing the full URI and prepended back onto the result value.
     * @param {String} aSuffix An optional suffix that should be stripped before
     *     computing the full URI and appended back onto the result value.
     * @exception TP.sig.InvalidElement Raised when an invalid element is provided
     *     to the method.
     * @exception TP.sig.InvalidParameter Raised when a null value is supplied for
     *     the uriAttrNames parameter.
     */

    var computedBase,

        len,
        i,

        thePrefix,
        theSuffix,

        baseVal,
        basePath;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    len = uriAttrNames.getSize();
    for (i = 0; i < len; i++) {
        //  If there is no value for the attribute in question on the
        //  element, just continue on to the next one.
        if (TP.isEmpty(baseVal = TP.elementGetAttribute(
                                                anElement,
                                                uriAttrNames.at(i),
                                                true))) {
            continue;
        }


        //  Just in case the URI was encoded, as it is by some browsers
        //  (Firefox), make sure to decode it.
        baseVal = decodeURIComponent(baseVal);

        //  <a href="#">...</a> should not be rewritten.
        if (baseVal === '#' && uriAttrNames.at(i) === 'href') {
            return;
        }

        thePrefix = '';
        theSuffix = '';

        //  Strip the prefix, if there is one.
        if (baseVal.startsWith(aPrefix)) {
            baseVal = baseVal.slice(aPrefix.getSize());

            //  Grab it to use for rebuilding the value later.
            thePrefix = aPrefix;
        }

        //  Strip the suffix, if there is one.
        if (baseVal.endsWith(aSuffix)) {
            //  Note the computation of the negative index here - we're
            //  slicing from the end.
            baseVal = baseVal.slice(0, aSuffix.getSize() * -1);

            //  Grab it to use for rebuilding the value later.
            theSuffix = aSuffix;
        }

        //  NB: We don't bother to test to make sure baseVal is a URI here
        //  since it could be just 'foo.xml' at this point (which won't pass
        //  our TP.isURI() test). So we just compute the base and join the
        //  paths together.

        //  Expand the 'baseVal' path, converting any virtual constructs. If
        //  it isn't an absolute path, go ahead and compute the XML base
        //  value up the tree.
        baseVal = TP.uriResolveVirtualPath(baseVal);

        if (!TP.uriIsAbsolute(baseVal)) {

            //  If the URL we're resolving is a fragment we need an entire URL
            //  not just the base.
            if (/^#/.test(baseVal)) {
                computedBase = TP.documentGetLocation(
                    TP.nodeGetDocument(anElement));
            } else {
                computedBase = TP.elementComputeXMLBaseFrom(anElement);
            }

            //  Compute the base path using the XML Base as computed from
            //  the element and the value of 'baseVal'. Note here how we
            //  pass 'false' to the TP.uriResolvePaths() call, forcing it to
            //  recognize that computedBase and baseVal are directories, not
            //  URIs to paths.
            basePath = TP.uriResolvePaths(computedBase, baseVal, false);
        } else {
            //  Otherwise, it was an absolute path, so just use it.
            basePath = baseVal;
        }

        //  If a basePath could not be computed, put an error message into
        //  the attribute value.
        if (TP.notValid(basePath)) {
            //  Note here how we prepend/append the prefix/suffix. The above
            //  mechanism might have set them - otherwise, they're empty.
            TP.elementSetAttribute(
                        anElement,
                        uriAttrNames.at(i),
                        'Couldn\'t compute base for: ' +
                            thePrefix + baseVal + theSuffix);
        } else {
            //  Note here how we prepend/append the prefix/suffix. The above
            //  mechanism might have set them - otherwise, they're empty.
            TP.elementSetAttribute(
                        anElement,
                        uriAttrNames.at(i),
                        TP.uriJoinPaths(TP.uriJoinPaths(
                            thePrefix, basePath), theSuffix));
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  NODE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeComparePosition',
function(aNode, otherNode, aPosition) {

    /**
     * @method nodeComparePosition
     * @summary Returns one of 5 values that can be used to determine the
     *     position of otherNode relative to aNode. Note that this comparison is
     *     *always* made from otherNode to aNode.
     * @description The aPosition parameter of this method has the following
     *     behavior, according to the defined 'TP' constants:
     *          TP.SAME_NODE            aNode and otherNode are the same Node
     *          TP.PRECEDING_NODE       otherNode precedes aNode in the document
     *          TP.FOLLOWING_NODE       otherNode follows aNode in the document
     *          TP.CONTAINS_NODE        otherNode contains aNode in the document
     *          TP.CONTAINED_BY_NODE    otherNode is contained by aNode in the
     *                                  document
     * @param {Node} aNode The node to check to see if otherNode is contained
     *     within it.
     * @param {Node} otherNode The node to check to see if it is contained
     *     within aNode.
     * @param {Number} aPosition One of the following constants: TP.SAME_NODE
     *     TP.PRECEDING_NODE TP.FOLLOWING_NODE TP.CONTAINS_NODE
     *     TP.CONTAINED_BY_NODE.
     * @example Test to see if the first child of the document element of an XML
     *     document is followed by the second child of the document element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar/><baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeComparePosition(
     *          xmlDoc.documentElement.childNodes[0],
     *          xmlDoc.documentElement.childNodes[1],
     *          TP.FOLLOWING_NODE);
     *          <samp>true</samp>
     *     </code>
     * @example Test to see if the body element of an HTML document is preceded
     *     by the head element:
     *     <code>
     *          TP.nodeComparePosition(
     *          TP.documentGetBody(document),
     *          document.documentElement.childNodes[0],
     *          TP.PRECEDING_NODE);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not otherNode is positioned relative to
     *     aNode according to the supplied position.
     * @exception TP.sig.InvalidNode Raised when either node is invalid as provided
     *     to the method.
     * @exception TP.sig.InvalidParameter Raised when an invalid position is
     *     provided to the method.
     */

    var position;

    //  In W3C-compliant browsers, this leverages compareDocumentPosition(),
    //  which is built-in for both HTML and XML documents. On IE, it
    //  leverages that call for XML documents and '.sourceIndex' for HTML
    //  documents.

    //  NB: This function originally from John Resig, under an MIT license.
    /* eslint-disable no-nested-ternary */
    position =
        aNode.compareDocumentPosition ?
            aNode.compareDocumentPosition(otherNode) :
            aNode.contains ?
                (aNode !== otherNode && aNode.contains(otherNode) && 16) +
                (aNode !== otherNode && otherNode.contains(aNode) && 8) +
                (aNode.sourceIndex >= 0 && otherNode.sourceIndex >= 0 ?
                    (aNode.sourceIndex < otherNode.sourceIndex && 4) +
                    (aNode.sourceIndex > otherNode.sourceIndex && 2) :
                    1) + 0 :
                    0;
    /* eslint-enable no-nested-ternary */

    return Boolean(position & aPosition);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetBestNode',
function(aNode) {

    /**
     * @method nodeGetBestNode
     * @summary Returns the 'best' node for the node provided.
     * @description The 'best node' for a node is the node that best represents
     *     it for things like 'content type tasting' to determine MIME types,
     *     etc. Often, when trying to determine content types by 'tasting',
     *     you want to make sure to get the document element of the supplied
     *     node's document or, if aNode is a document fragment, you want the
     *     first child, etc.
     * @param {Node} aNode The node to get the 'best', 'most representative'
     *     node of.
     * @returns {Node} The 'best' node for the node provided.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to the
     *     method.
     */

    var doc,
        retNode;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.nodeIsDetached(aNode)) {
        doc = TP.nodeGetDocument(aNode);
        if (TP.notValid(doc)) {
            //  xml, but no document-level data to go by...
            retNode = aNode;
        } else {
            retNode = doc.documentElement;
        }
    } else {
        if (TP.isFragment(aNode)) {
            retNode = aNode.firstChild;
        } else {
            retNode = aNode;
        }
    }

    if (TP.isElement(retNode)) {

        //  If the element is our special 'wrap' element, use it's first
        //  child.
        if (TP.elementGetLocalName(retNode) === 'wrap') {
            retNode = retNode.firstChild;
        }
    }

    return retNode;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
