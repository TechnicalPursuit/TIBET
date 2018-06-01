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
Platform-specific functionality related to XSLT operations.
*/

/* JSHint checking */

/* global XSLTProcessor:false,
          ActiveXObject:false
*/

//  ------------------------------------------------------------------------
//  XSLT PRIMITIVES
//  ------------------------------------------------------------------------

//  First, we execute some functions that will set up certain data
//  structures for Gecko.
TP.runConditionalFunction(
TP.hc(
    'test',
    'gecko',
    'true',
    function() {

        //  (More) friendly error messages for common XSLT exceptions for
        //  the Mozilla Transformiix XSLT processor.

        TP.MOZ_XSLT_ERROR_CODES =
        TP.hc(
                '0x80600001',
                    'XSLT parse exception ' +
                        '(NS_ERROR_XSLT_PARSE_FAILURE)',
                '0x80600002',
                    'XPath parse failure exception ' +
                        '(NS_ERROR_XPATH_PARSE_FAILURE)',
                '0x80600003',
                    'XSLT already set exception ' +
                        '(NS_ERROR_XSLT_ALREADY_SET)',
                '0x80600004',
                    'XSLT execution failure exception. Missing include or' +
                    ' import? ' +
                        '(NS_ERROR_XSLT_EXECUTION_FAILURE)',
                '0x80600005',
                    'XPath unknown function exception ' +
                        '(NS_ERROR_XPATH_UNKNOWN_FUNCTION)',
                '0x80600006',
                    'XSLT bad recursion exception ' +
                        '(NS_ERROR_XSLT_BAD_RECURSION)',
                '0x80600007',
                    'XSLT bad value exception ' +
                        '(NS_ERROR_XSLT_BAD_VALUE)',
                '0x80600008',
                    'XSLT nodeset expected exception ' +
                        '(NS_ERROR_XSLT_NODESET_EXPECTED)',
                '0x80600009',
                    'XSLT aborted exception ' +
                        '(NS_ERROR_XSLT_ABORTED)',
                '0x8060000a',
                    'XSLT network error exception ' +
                        '(NS_ERROR_XSLT_NETWORK_ERROR)',
                '0x8060000b',
                    'XSLT wrong MIME type exception ' +
                        '(NS_ERROR_XSLT_WRONG_MIME_TYPE)',
                '0x8060000c',
                    'XSLT load recursion exception ' +
                        '(NS_ERROR_XSLT_LOAD_RECURSION)',
                '0x8060000d',
                    'XPath bad argument count exception ' +
                        '(NS_ERROR_XPATH_BAD_ARGUMENT_COUNT)',
                '0x8060000e',
                    'XPath bad extension function exception ' +
                        '(NS_ERROR_XPATH_BAD_EXTENSION_FUNCTION)',
                '0x8060000f',
                    'XPath parenthesis expected exception ' +
                        '(NS_ERROR_XPATH_PAREN_EXPECTED)',
                '0x80600010',
                    'XPath invalid axis exception ' +
                        '(NS_ERROR_XPATH_INVALID_AXIS)',
                '0x80600011',
                    'XPath no node type test exception ' +
                        '(NS_ERROR_XPATH_NO_NODE_TYPE_TEST)',
                '0x80600012',
                    'XPath bracket expected exception ' +
                        '(NS_ERROR_XPATH_BRACKET_EXPECTED)',
                '0x80600013',
                    'XPath invalid variable name exception ' +
                        '(NS_ERROR_XPATH_INVALID_VAR_NAME)',
                '0x80600014',
                    'XPath unexpected end exception ' +
                        '(NS_ERROR_XPATH_UNEXPECTED_END)',
                '0x80600015',
                    'XPath operator expected exception ' +
                        '(NS_ERROR_XPATH_OPERATOR_EXPECTED)',
                '0x80600016',
                    'XPath unclosed literal exception ' +
                        '(NS_ERROR_XPATH_UNCLOSED_LITERAL)',
                '0x80600017',
                    'XPath bad colon exception ' +
                        '(NS_ERROR_XPATH_BAD_COLON)',
                '0x80600018',
                    'XPath bad bang exception ' +
                        '(NS_ERROR_XPATH_BAD_BANG)',
                '0x80600019',
                    'XPath illegal character exception ' +
                        '(NS_ERROR_XPATH_ILLEGAL_CHAR)',
                '0x8060001a',
                    'XPath binary expected exception ' +
                        '(NS_ERROR_XPATH_BINARY_EXPECTED)',
                '0x8060001b',
                    'XSLT loading error. Check file paths. ' +
                        '(NS_ERROR_XSLT_LOAD_BLOCKED_ERROR)',
                '0x8060001c',
                    'XPath invalid expression evaluated exception ' +
                        '(NS_ERROR_XPATH_INVALID_EXPRESSION_EVALUATED)',
                '0x8060001d',
                    'XPath unbalanced curly brace exception ' +
                        '(NS_ERROR_XSLT_UNBALANCED_CURLY_BRACE)',
                '0x8060001e',
                    'XSLT bad node name exception ' +
                        '(NS_ERROR_XSLT_BAD_NODE_NAME)',
                '0x80004005',
                    'XSLT error. Missing or misnamed parameter or' +
                        ' variable?',
                '0x804b000a',
                    'URI error. Malformed URI.'
        );

        //  A RegExp to extract the XSLT exception failure code number.
        TP.regex.ERROR = TP.rc('Component returned failure code: (\\w+)');

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$documentEscapeContent',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(aDocument, tagNameArray) {

        /**
         * @method $documentEscapeContent
         * @summary Escapes the content under the all of the tags named in the
         *     tags array in the supplied document with CDATA sections.
         * @description This works around a bug in the Mozilla XSLT engine,
         *     Transformiix, that assumes that escaping content is the same as
         *     placing it in CDATA sections, which its not - especially if its
         *     the output of (X)HTML 'style' or 'script'.
         * @param {XMLDocument} aDocument The XML document to escape the content
         *     in.
         * @param {String[]} tagNameArray An Array of tag names to escape the
         *     content of.
         */

        var i,
            len,
            i2,
            len2,
            name,
            elem,
            elementsToEscape;

        //  Loop over those element names.
        len = tagNameArray.getSize();
        for (i = 0; i < len; i++) {
            name = tagNameArray[i];

            //  Grab an Array of elements in the result document
            //  that we're supposed to escape.
            elementsToEscape = TP.nodeGetElementsByTagName(aDocument, name);

            //  Loop over them and grab their first child,
            //  which should be a text child, and replace it
            //  with a CDATA section wrapping the node value of
            //  that text node.
            len2 = elementsToEscape.getSize();
            for (i2 = 0; i2 < len2; i2++) {
                elem = elementsToEscape.at(i2);

                //  Make sure to do this only if the first
                //  child is a text node.

                if (TP.isTextNode(elem.firstChild)) {
                    TP.nodeReplaceChild(
                        elem,
                        aDocument.createCDATASection(
                                            elem.firstChild.nodeValue),
                        elem.firstChild);
                }
            }
        }

        return;
    },
    'trident',
    function(aDocument, tagNameArray) {

        //  This method is unnecessary on Trident
        return;
    },
    'webkit',
    function(aDocument, tagNameArray) {

        /**
         * @method $documentEscapeContent
         * @summary Escapes the content under the all of the tags named in the
         *     tags array in the supplied document with CDATA sections.
         * @description This works around a bug in the Mozilla XSLT engine,
         *     Transformiix, that assumes that escaping content is the same as
         *     placing it in CDATA sections, which its not - especially if its
         *     the output of (X)HTML 'style' or 'script'. TODO: It is unknown
         *     whether Webkit actually needs to do this - it needs testing.
         * @param {XMLDocument} aDocument The XML document to escape the content
         *     in.
         * @param {String[]} tagNameArray An Array of tag names to escape the
         *     content of.
         */

        var i,
            len,
            i2,
            len2,
            name,
            elem,
            elementsToEscape;

        //  Loop over those element names.
        len = tagNameArray.getSize();
        for (i = 0; i < len; i++) {
            name = tagNameArray.at(i);

            //  Grab an Array of elements in the result document
            //  that we're supposed to escape.
            elementsToEscape = TP.nodeGetElementsByTagName(aDocument, name);

            //  Loop over them and grab their first child,
            //  which should be a text child, and replace it
            //  with a CDATA section wrapping the node value of
            //  that text node.
            len2 = elementsToEscape.getSize();
            for (i2 = 0; i2 < len2; i2++) {
                elem = elementsToEscape.at(i2);

                //  Make sure to do this only if the first
                //  child is a text node.

                if (TP.isTextNode(elem.firstChild)) {
                    TP.nodeReplaceChild(
                        elem,
                        aDocument.createCDATASection(
                                            elem.firstChild.nodeValue),
                        elem.firstChild);
                }
            }
        }
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$fixupNamespacedAttributesPre',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(inputNode) {

        /**
         * @method $fixupNamespacedAttributesPre
         * @summary Encodes namespace attributes from their original form to a
         *     form that will survive Mozilla's XSLT transformation. They will
         *     be restored to their original form by the 'post' routine below.
         * @description Unfortunately, Mozilla's XSLT processor does not
         *     currently support namespace nodes. Even worse, it actually
         *     removes 'xmlns' attributes from transformed Nodes (instead of
         *     just leaving them alone).
         * @param {Node} inputNode The input data element.
         */

        var allElements,
            j,
            len,
            elem,
            attrLength,
            i;

        //  Since the XPath processor knows nothing about 'xmlns' (or
        //  'xmlns:...') attributes (but the DOM does), we've got to this
        //  the 'old fashioned' way -- via the DOM. Sigh...

        //  Grab all elements
        allElements = TP.nodeGetElementsByTagName(inputNode, '*');

        len = allElements.getSize();
        for (j = 0; j < len; j++) {
            elem = allElements.at(j);

            attrLength = elem.attributes.length;

            //  Loop over each attribute on the element. The 'xmlns'
            //  (or 'xmlns:...') attributes will be exposed here because
            //  this is the DOM, not XPath
            for (i = 0; i < attrLength; i++) {
                //  The 'namespace namespace' is defined by the W3C as
                //  'http://www.w3.org/2000/xmlns/' and we can use that
                //  here to see if the attribute itself has that
                //  namespace. If so, then its an 'xmlns' (or
                //  'xmlns:...') attribute, so we add a 'hack' attribute
                //  that encodes it.
                if (TP.nodeGetNSURI(elem.attributes[i]) ===
                        TP.w3.Xmlns.XMLNS) {
                    //  We append the attribute's local name (which
                    //  will either be 'xmlns' or a prefix in front of
                    //  'xmlns', depending on whether this is defining
                    //  a default namespace or not.
                    TP.elementSetAttribute(
                        elem,
                        'tibet_XSLTNSHack__' +
                            TP.attributeGetLocalName(elem.attributes[i]),
                        elem.attributes[i].value);
                }
            }
        }

        return;
    },
    'trident',
    function(inputNode) {

        //  This method is unnecessary on Trident
        return;
    },
    'webkit',
    function(inputNode) {

        /**
         * @method $fixupNamespacedAttributesPre
         * @summary Encodes namespace attributes from their original form to a
         *     form that will survive Mozilla's XSLT transformation. They will
         *     be restored to their original form by the 'post' routine below.
         * @description Unfortunately, Mozilla's XSLT processor does not
         *     currently support namespace nodes. Even worse, it actually
         *     removes 'xmlns' attributes from transformed Nodes (instead of
         *     just leaving them alone). TODO: It is unknown whether Webkit
         *     actually needs to do this - it needs testing.
         * @param {Node} inputNode The input data element.
         */

        var allElements,
            j,
            len,
            elem,
            attrLength,
            i;

        //  Since the XPath processor knows nothing about 'xmlns' (or
        //  'xmlns:...') attributes (but the DOM does), we've got to this
        //  the 'old fashioned' way -- via the DOM. Sigh...

        //  Grab all elements
        allElements = TP.nodeGetElementsByTagName(inputNode, '*');

        len = allElements.getSize();
        for (j = 0; j < len; j++) {
            elem = allElements.at(j);

            attrLength = elem.attributes.length;

            //  Loop over each attribute on the element. The 'xmlns'
            //  (or 'xmlns:...') attributes will be exposed here because
            //  this is the DOM, not XPath
            for (i = 0; i < attrLength; i++) {
                //  The 'namespace namespace' is defined by the W3C as
                //  'http://www.w3.org/2000/xmlns/' and we can use that
                //  here to see if the attribute itself has that
                //  namespace. If so, then its an 'xmlns' (or
                //  'xmlns:...') attribute, so we add a 'hack' attribute
                //  that encodes it.
                if (TP.nodeGetNSURI(elem.attributes[i]) ===
                        TP.w3.Xmlns.XMLNS) {
                    //  We append the attribute's local name (which
                    //  will either be 'xmlns' or a prefix in front of
                    //  'xmlns', depending on whether this is defining
                    //  a default namespace or not.
                    TP.elementSetAttribute(
                        elem,
                        'tibet_XSLTNSHack__' +
                            TP.attributeGetLocalName(elem.attributes[i]),
                        elem.attributes[i].value);
                }
            }
        }

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$fixupNamespacedAttributesPost',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(inputNode, resultDoc) {

        /**
         * @method $fixupNamespacedAttributesPost
         * @summary Restores namespace attributes to their original form from
         *     having been processed by the 'pre' routine above.
         * @param {Node} inputNode The input data element.
         * @param {XMLDocument} resultDoc The result XML document after
         *     transformation.
         */

        var xsltHackAttrs,
            ownerElement,
            prefixName,
            i,
            len,
            anAttr;

        //  Replace any 'tibet_XSLTNSHack' attributes that got put on the
        //  original input node by us in the 'pre' routine above.

        //  Search for any attributes named 'tibet_XSLTNSHack' using an
        //  XPath expression. This works on this document (unlike in the
        //  'pre' function above) because these are just regular attributes
        //  and are therefore 'visible' to the XPath processor.
        xsltHackAttrs =
            TP.nodeEvaluateXPath(
                    inputNode,
                    '//@*[starts-with(local-name(),"tibet_XSLTNSHack")]',
                    TP.NODESET);

        //  Loop over the found attributes.
        len = xsltHackAttrs.getSize();
        for (i = 0; i < len; i++) {
            anAttr = xsltHackAttrs.at(i);

            ownerElement = TP.attributeGetOwnerElement(anAttr);

            //  Remove the 'XSLTHack' attribute node.
            ownerElement.removeAttributeNode(anAttr);
        }

        //  Replace any 'tibet_XSLTNSHack' attributes that got copied on the
        //  result document by the XSLT transformation with an 'xmlns' (or
        //  'xmlns:...') attribute, thereby restoring the original
        //  namespace.

        //  First, check to make sure we have a valid document element
        if (TP.notValid(resultDoc.documentElement)) {
            return;
        }

        //  Search for any attributes named 'tibet_XSLTNSHack' using an
        //  XPath expression.
        xsltHackAttrs =
            TP.nodeEvaluateXPath(
                    resultDoc,
                    '//@*[starts-with(local-name(),"tibet_XSLTNSHack")]',
                    TP.NODESET);

        len = xsltHackAttrs.getSize();
        for (i = 0; i < len; i++) {
            anAttr = xsltHackAttrs.at(i);

            ownerElement = TP.attributeGetOwnerElement(anAttr);
            prefixName = anAttr.name.split('__').at(1);

            //  If the prefixName isn't 'xmlns', that means that it
            //  was a 'prefixed namespace definition' that was
            //  encoded and the prefixName needs to be prepended
            //  with 'xmlns:'.
            if (prefixName !== 'xmlns') {
                prefixName = 'xmlns:' + prefixName;
            }

            //  Restore the namespace attribute by using
            //  'setAttributeNS' with the 'namespace namespace' ;-).
            ownerElement.setAttributeNS(
                    TP.w3.Xmlns.XMLNS,
                    prefixName,
                    anAttr.value);

            //  Remove the 'XSLTHack' attribute node.
            ownerElement.removeAttributeNode(anAttr);
        }

        return;
    },
    'trident',
    function(inputNode, resultDoc) {

        //  This method is unnecessary on Trident
        return;
    },
    'webkit',
    function(inputNode, resultDoc) {

        /**
         * @method $fixupNamespacedAttributesPost
         * @summary Restores namespace attributes to their original form from
         *     having been processed by the 'pre' routine above.
         * @description TODO: It is unknown whether Webkit actually needs to do
         *     this - it needs testing.
         * @param {Node} inputNode The input data element.
         * @param {XMLDocument} resultDoc The result XML document after
         *     transformation.
         */

        var xsltHackAttrs,
            ownerElement,
            prefixName,
            i,
            len,
            anAttr;

        //  Replace any 'tibet_XSLTNSHack' attributes that got put on the
        //  original input node by us in the 'pre' routine above.

        //  Search for any attributes named 'tibet_XSLTNSHack' using an
        //  XPath expression. This works on this document (unlike in the
        //  'pre' function above) because these are just regular attributes
        //  and are therefore 'visible' to the XPath processor.
        xsltHackAttrs =
            TP.nodeEvaluateXPath(
                    inputNode,
                    '//@*[starts-with(local-name(),"tibet_XSLTNSHack")]',
                    TP.NODESET);

        //  Loop over the found attributes.
        len = xsltHackAttrs.getSize();
        for (i = 0; i < len; i++) {
            anAttr = xsltHackAttrs.at(i);

            ownerElement = TP.attributeGetOwnerElement(anAttr);

            //  Remove the 'XSLTHack' attribute node.
            ownerElement.removeAttributeNode(anAttr);
        }

        //  Replace any 'tibet_XSLTNSHack' attributes that got copied on the
        //  result document by the XSLT transformation with an 'xmlns' (or
        //  'xmlns:...') attribute, thereby restoring the original
        //  namespace.

        //  First, check to make sure we have a valid document element
        if (TP.notValid(resultDoc.documentElement)) {
            return;
        }

        //  Search for any attributes named 'tibet_XSLTNSHack' using an
        //  XPath expression.
        xsltHackAttrs =
            TP.nodeEvaluateXPath(
                    resultDoc,
                    '//@*[starts-with(local-name(),"tibet_XSLTNSHack")]',
                    TP.NODESET);

        len = xsltHackAttrs.getSize();
        for (i = 0; i < len; i++) {
            anAttr = xsltHackAttrs.at(i);

            ownerElement = TP.attributeGetOwnerElement(anAttr);
            prefixName = anAttr.name.split('__').at(1);

            //  If the prefixName isn't 'xmlns', that means that it
            //  was a 'prefixed namespace definition' that was
            //  encoded and the prefixName needs to be prepended
            //  with 'xmlns:'.
            if (prefixName !== 'xmlns') {
                prefixName = 'xmlns:' + prefixName;
            }

            //  Restore the namespace attribute by using
            //  'setAttributeNS' with the 'namespace namespace' ;-).
            ownerElement.setAttributeNS(
                    TP.w3.Xmlns.XMLNS,
                    prefixName,
                    anAttr.value);

            //  Remove the 'XSLTHack' attribute node.
            ownerElement.removeAttributeNode(anAttr);
        }

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('documentTransformNode',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(styleDoc, inputNode, paramHash) {

        /**
         * @method documentTransformNode
         * @summary Transforms the inputNode using the XSLT style sheet node
         *     provided, returning a node with the result data.
         * @param {XMLDocument} styleDoc The XSLT style document.
         * @param {Node} inputNode The input data element.
         * @param {TP.core.Hash} paramHash A hash of optional parameters to be
         *     passed to the style sheet. A key of 'xmlns:fixup' set to true
         *     will repair xmlns attributes.
         * @exception TP.sig.XSLTException
         * @exception TP.sig.InvalidXMLDocument
         * @returns {Node} The transformed Node.
         */

        var gotDoc,
            inputDoc,
            resultDoc,
            processor,

            realStyleDoc,

            paramNodes,
            len,
            i,
            node,

            fixupXMLNSAttrs,

            outputNodes,
            cdataSectionElementNames,

            exceptionMsgParts,
            exceptionWarningMsg,
            srcURI,

            docAttrs,
            foundDefaultNSAttr;

        if (!TP.isXMLDocument(styleDoc)) {
            return TP.raise(this, 'TP.sig.InvalidXMLDocument');
        }

        //  have to have a document or the tranformation will fail
        gotDoc = TP.isXMLDocument(inputNode);
        if (!gotDoc) {
            try {
                inputDoc = TP.documentFromNode(
                                TP.nodeCloneNode(inputNode, true));
            } catch (e) {
                return TP.raise(this, 'TP.sig.InvalidXMLDocument',
                                TP.ec(e));
            }
        } else {
            inputDoc = inputNode;
        }

        //  Normally, we let the caller decide if they want to fix xmlns
        //  attributes, but if the inputDoc itself is an XSLT, then we
        //  *know* that we need to make sure to preserve namespaces (as they
        //  will get used in things like template match XPaths).
        if (TP.nodeGetNSURI(inputDoc.documentElement) === TP.w3.Xmlns.XSLT) {
            fixupXMLNSAttrs = true;
        } else {
            fixupXMLNSAttrs = TP.ifKeyInvalid(paramHash,
                                                'xmlns:fixup',
                                                true);
        }

        if (TP.notValid(processor)) {
            try {
                //  create an xslt processor we can use to transform the
                //  data
                processor = new XSLTProcessor();

                if (TP.notEmpty(paramHash)) {
                    paramNodes = TP.ac();

                    paramHash.perform(
                        function(kvPair) {

                            var paramName,
                                paramValue;

                            paramName = kvPair.first();
                            paramValue = TP.ifInvalid(kvPair.last(), '');

                            //  We can't have parameter names that start with
                            //  '$' - that conflicts with XSLT variables.
                            if (/^\$/.test(paramName)) {
                                return;
                            }

                            processor.setParameter(
                                        null,
                                        paramName,
                                        paramValue);
                        });
                }

                //  Mozilla is very strict about having an XML declaration on
                //  the XSLT document itself, so we 'recreate' the style
                //  document to make sure it has one.
                realStyleDoc = TP.doc(TP.nodeAsString(styleDoc, true, false));

                //  NB: We *must* import the stylesheet *after* we set the
                //  parameters, in case any of them were 'node set'
                //  parameters.
                processor.importStylesheet(realStyleDoc);
            } catch (e) {
                //  See if we can extract the failure code from the
                //  exception message.
                exceptionMsgParts = TP.str(e).match(TP.regex.ERROR);

                //  If we successfully extracted an error code, it will be
                //  in position 1, and if that can be found in our list of
                //  error codes, then log a warning with our nicer error
                //  message.
                if (TP.isArray(exceptionMsgParts) &&
                    exceptionMsgParts.getSize() > 1 &&
                    TP.isString(exceptionWarningMsg =
                                TP.MOZ_XSLT_ERROR_CODES.at(
                                                exceptionMsgParts.at(1)))) {
                    if (TP.notEmpty(srcURI = styleDoc[TP.SRC_LOCATION])) {
                        exceptionWarningMsg += ' in: ' + srcURI;
                    }

                    TP.ifWarn() ?
                        TP.warn(exceptionWarningMsg,
                                TP.TRANSFORM_LOG) : 0;
                }

                TP.raise(this, 'TP.sig.XSLTException', TP.ec(e));

                return;
            }
        }

        try {
            //  Because of Mozilla's lack of support for namespaces in its
            //  XSLT processing (see above), we have to do some 'fixups'
            //  before we process the inputNode. We only do this if
            //  fixupXMLNSAttrs is true (which is the default).
            if (fixupXMLNSAttrs) {
                TP.$fixupNamespacedAttributesPre(inputDoc);
            }

            //  watch out for CSS within XHTML...can crash Mozilla
            inputDoc = TP.$nodeEscapeCSSConstructs(inputDoc);

            //  Do the deed...
            resultDoc = processor.transformToDocument(inputDoc);

            //  If we didn't get a valid result document, raise an exception
            //  and exit here.
            if (!TP.isXMLDocument(resultDoc) ||
                TP.notValid(resultDoc.documentElement)) {
                TP.raise(this, 'TP.sig.XSLTException',
                            'Unable to produce valid XML document.');

                return;
            }

            //  Now, if fixupXMLNSAttrs is true, undo whatever sort of
            //  strange machinations we had to do due to Mozilla's lack of
            //  namespace support.
            if (fixupXMLNSAttrs) {
                TP.$fixupNamespacedAttributesPost(inputDoc, resultDoc);
            }

            //  If there are any 'xsl:output' elements, grab the first (and
            //  should be only) one and check to see if it has a
            //  'cdata-section-elements' attribute on it. This means that
            //  the author of the stylesheet wanted certain elements to have
            //  their text content wrapped in CDATA sections, but since
            //  Transformiix refuses to do that, we'll do it manually here.
            if (TP.notEmpty(outputNodes = TP.nodeGetElementsByTagName(
                                                    styleDoc, 'xsl:output'))) {
                //  If there was actually content for the
                //  'cdata-section-elements' attribute, split it on space to
                //  get an Array of element names that we're supposed to
                //  wrap text child content for.
                if (TP.notEmpty(cdataSectionElementNames =
                                TP.elementGetAttribute(
                                                outputNodes.at(0),
                                                'cdata-section-elements'))) {
                    cdataSectionElementNames =
                                cdataSectionElementNames.split(' ');

                    TP.$documentEscapeContent(resultDoc,
                                                cdataSectionElementNames);
                }
            }

            //  Go ahead and auto-escape 'html:script' and 'html:style'
            //  elements in the output.
            TP.$documentEscapeContent(resultDoc,
                                        TP.ac('script',
                                            'style',
                                            'html:script',
                                            'html:style',
                                            'tibet_style'));

            if (TP.isArray(paramNodes)) {
                //  Remove any 'node set' parameter values that we added
                //  above.
                //  We do this by cleaning out all children under the
                //  parameter node.
                len = paramNodes.getSize();
                for (i = 0; i < len; i++) {
                    node = paramNodes.at(i);
                    TP.nodeDetach(node.firstChild);
                }
            }
        } catch (e) {
            //  See if we can extract the failure code from the exception
            //  message.
            exceptionMsgParts = TP.str(e).match(TP.regex.ERROR);

            //  If we successfully extracted an error code, it will be in
            //  position 1, and if that can be found in our list of error
            //  codes, then log a warning with our nicer error message.
            if (TP.isArray(exceptionMsgParts) &&
                exceptionMsgParts.getSize() > 1 &&
                TP.isString(exceptionWarningMsg =
                                    TP.MOZ_XSLT_ERROR_CODES.at(
                                        exceptionMsgParts.at(1)))) {
                if (TP.notEmpty(srcURI = styleDoc[TP.SRC_LOCATION])) {
                    exceptionWarningMsg += ' in: ' + srcURI;
                }

                TP.ifWarn() ?
                    TP.warn(exceptionWarningMsg,
                            TP.TRANSFORM_LOG) : 0;
            }

            TP.raise(this, 'TP.sig.XSLTException', TP.ec(e));

            return;
        }

        //  return the resultDoc as our return value as long as it's valid
        //  and has a document element
        if (!TP.isDocument(resultDoc) ||
            TP.notValid(resultDoc.documentElement)) {
            return;
        }

        //  We only do this if the documentElement doesn't have a prefix.
        //  This avoids an XMLSerializer bug on Mozilla.
        if (TP.isEmpty(resultDoc.documentElement.prefix)) {
            //  If the documentElement has a namespaceURI, the XSLTProcessor
            //  might have ripped out any default namespace attribute that
            //  it had, which will eventually cause the XMLSerializer to
            //  produce that 'a0' junk that we hate so much.

            //  The following code detects whether there's a default
            //  namespace or not and, if not, puts a default namespace
            //  attribute on the documentElement that is the namespace it
            //  has anyway, but this time set as the default namespace.
            //  This makes the XMLSerializer shut up about that 'a0' stuff.
            //  Note that, if this routine detects a default namespace, it
            //  will leave it alone even if its not the same namespace as
            //  the document element's namespace. This avoids problems when
            //  XSLTing an XSLT itself, since it very rarely uses the XSLT
            //  namespace as its default namespace.
            foundDefaultNSAttr = false;

            docAttrs = resultDoc.documentElement.attributes;
            for (i = 0; i < docAttrs.length; i++) {
                if (TP.attributeGetLocalName(docAttrs[i]) === 'xmlns') {
                    foundDefaultNSAttr = true;
                    break;
                }
            }

            if (!foundDefaultNSAttr) {
                resultDoc.documentElement.setAttributeNS(
                            TP.w3.Xmlns.XMLNS,
                            'xmlns',
                            TP.nodeGetNSURI(resultDoc.documentElement));
            }
        }

        //  if we didn't get a document then don't return one, return the
        //  document element instead
        if (!gotDoc) {
            return resultDoc.documentElement;
        }

        return resultDoc;
    },
    'trident',
    function(styleDoc, inputNode, paramHash) {

        var outputElements,
            theOutputElement,

            node,

            versions,
            i,

            freeThreadedStyleDoc,
            newNSNode,
            attrNode,

            xslTemplate,
            processor,

            result;

        if (!TP.isXMLDocument(styleDoc)) {
            return TP.raise(this, 'TP.sig.InvalidDocument');
        }

        //  We 'auto-wrap' html 'script' and 'style' elements in CDATA
        //  sections to avoid having characters critical to these languages
        //  (like '>') be escaped in the destination markup.
        //  The XSLT standard way of doing this is to add these tag names to
        //  the 'cdata-sections-elements' attribute of the 'xsl:output'
        //  element. We need to check first to make sure that, if there was
        //  a preexisting 'xsl:output' element, that we simply add our stuff
        //  to it.
        if (TP.notEmpty(outputElements =
                        TP.nodeGetElementsByTagName(styleDoc, 'xsl:output'))) {
            //  We found an existing element, so use it.
            theOutputElement = outputElements.first();

            //  Avoid an issue with not having the 'html:' namespace prefix
            //  defined.
            TP.elementSetAttributeInNS(styleDoc.documentElement,
                                        'xmlns:html',
                                        TP.w3.Xmlns.XHTML,
                                        TP.w3.Xmlns.XMLNS);


            //  If it already has a 'cdata-section-elements' attribute,
            //  simply add our 'script', 'style' and (private) 'tibet_style'
            //  elements to the 'cdata-section-elements' attributes. Note
            //  here how we have to a) also supply 'html:' prefixed versions
            //  of these elements and b) we have to supply an 'html:'
            //  prefixed version of the 'tibet_style' element, even though
            //  its not a real element of the 'html' markup language.
            if (TP.elementHasAttribute(theOutputElement,
                                        'cdata-section-elements')) {
                TP.elementSetAttribute(
                    theOutputElement,
                    'cdata-section-elements',
                        TP.elementGetAttribute(
                            theOutputElement, 'cdata-section-elements') +
                            'script style tibet_style ' +
                            'html:script html:style html:tibet_style');
            } else {
                //  Otherwise go ahead and just set it to those element
                //  names.
                TP.elementSetAttribute(
                    theOutputElement,
                    'cdata-section-elements',
                            'script style tibet_style ' +
                            'html:script html:style html:tibet_style');
            }
        } else {
            //  Otherwise, there was no preexisting 'xsl:output' element, so
            //  we create one, set its 'cdata-section-elements' attribute
            //  and append it to the documentElement of the style document
            //  (which should be an 'xsl:stylesheet' element).
            theOutputElement = TP.documentConstructElement(styleDoc,
                                                        'output',
                                                        TP.w3.Xmlns.XSLT);

            TP.elementSetAttribute(theOutputElement,
                        'cdata-section-elements',
                        'script style html:script html:style tibet_style');

            //  Note reassignment since the node we're adding might have
            //  come from another document.
            theOutputElement = TP.nodeAppendChild(styleDoc.documentElement,
                                                    theOutputElement);
        }

        //  Because we added 'html:script' and 'html:style' to our 'output
        //  element', we need to make sure the namespace is defined here.
        TP.elementAddNamespace(styleDoc.documentElement,
                                'html',
                                TP.w3.Xmlns.XHTML);

        if (!TP.isDocument(inputNode)) {
            node = TP.constructDocument();
            node.appendChild(TP.nodeCloneNode(inputNode, true));
        } else {
            node = inputNode;
        }

        //  if we don't have a cached processor then go ahead and build one
        //  now based on the styleDoc provided
        if (TP.notValid(processor)) {
            //  We need to convert from the supplied style document, which
            //  is not a 'free threaded' document, into the free threaded
            //  document required by the xslTemplate by allocating a free
            //  threaded document and then loading the XML source text from
            //  the supplied style document.

            //  attempt to get the latest and greatest version possible
            versions = TP.IE_THREADED_DOM_VERSIONS;
            for (i = 0; i < versions.getSize(); i++) {
                try {
                    freeThreadedStyleDoc =
                                new ActiveXObject(versions.at(i));
                    break;
                } catch (e) {
                    TP.ifError() ?
                        TP.error(
                            TP.ec(e, 'Error creating style document')) : 0;
                }
            }

            if (TP.notValid(freeThreadedStyleDoc)) {
                return TP.raise(
                        this, 'TP.sig.InvalidParameter',
                        'Unable to create a free threaded XSL document.');
            }

            //  MSXML 6.0 requires these properties for 'full operation' of
            //  an XSLT, but other versions of MSXML will throw exceptions
            //  if you try to set these properties.
            if (TP.$msxml >= 6) {
                freeThreadedStyleDoc.setProperty(
                                        'AllowDocumentFunction', true);
                freeThreadedStyleDoc.setProperty(
                                        'AllowXsltScript', true);
            }

            //  MSXML 6.0 also requires this to be set so that XSLT
            //  'include' and 'import' elements work properly.
            freeThreadedStyleDoc.resolveExternals = true;

            //  Load the style document's XML into the free-threaded
            //  document.
            freeThreadedStyleDoc.loadXML(TP.str(styleDoc.documentElement));

            //  Unfortunately, the XMLSerializer used above in the 'TP.str()'
            //  call has a bug that it will move namespace nodes off of the
            //  document element and propagate it onto the elements that
            //  actually use it in the markup. This is bad for XSLT, since it
            //  uses prefixes *inside* the actual markup generation and needs
            //  those namespaces defined on the document element.
            //  Therefore, we use 'ActiveX DOM' calls to make copy those
            //  'xmlns:' attributes back on the processor document's document
            //  element.
            for (i = 0; i < styleDoc.documentElement.attributes.length; i++) {
                attrNode = styleDoc.documentElement.attributes[i];
                if (attrNode.namespaceURI !== TP.w3.Xmlns.XMLNS) {
                    continue;
                }

                newNSNode = freeThreadedStyleDoc.createNode(
                                        Node.ATTRIBUTE_NODE,
                                        attrNode.name,
                                        TP.w3.Xmlns.XMLNS);
                newNSNode.nodeValue = attrNode.value;

                freeThreadedStyleDoc.documentElement.setAttributeNode(newNSNode);
            }

            //  attempt to get the latest and greatest version possible
            versions = TP.IE_XSL_TEMPLATE_VERSIONS;
            for (i = 0; i < versions.getSize(); i++) {
                try {
                    xslTemplate = new ActiveXObject(versions.at(i));
                    break;
                } catch (e) {
                    TP.ifError() ?
                        TP.error(
                            TP.ec(e, 'Error creating XSLT document')) : 0;
                }
            }

            if (TP.notValid(xslTemplate)) {
                return TP.raise(this, 'TP.sig.InvalidParameter',
                                    'Unable to create a XSL DOM Template.');
            }

            //  Set its stylesheet to the free threaded document we created,
            //  which is now loaded with the markup from the supplied style
            //  document.
            xslTemplate.stylesheet = freeThreadedStyleDoc;

            try {
                processor = xslTemplate.createProcessor();

                //  Attempt to register the 'tibet' object under a urn
                //  namespace
                processor.addObject(self, 'urn:ecma:262-3');
            } catch (e) {
                return TP.raise(this, 'TP.sig.XSLTException',
                                TP.ec(e));
            }
        }

        //  do the work :)
        try {
            //  watch out for CSS within XHTML...can crash Mozilla and we
            //  want our markup and xslt processors to be working with
            //  consistent data
            node = TP.$nodeEscapeCSSConstructs(node);

            //  set the processor's input to be our incoming XML data/doc
            processor.input = node;

            //  apply any parameters provided to the processor itself
            if (TP.notEmpty(paramHash)) {

                paramHash.perform(
                    function(kvPair) {

                        var paramName,
                            paramValue,

                            activeXNodeDoc,
                            activeXNodeValue;

                        paramName = kvPair.first();
                        paramValue = TP.ifInvalid(kvPair.last(), '');

                        //  We can't have parameter names that start with '$' -
                        //  that conflicts with XSLT variables.
                        if (/^\$/.test(paramName)) {
                            return;
                        }

                        //  if the paramValue isn't a Node, then we try to
                        //  use its asString() value, followed by its
                        //  valueOf() value, followed by just using the
                        //  parameter directly
                        if (!TP.isNode(paramValue)) {
                            if (TP.canInvoke(paramValue, 'asString')) {
                                processor.addParameter(
                                    kvPair.first(), paramValue.asString());
                            } else if (TP.canInvoke(paramValue, 'valueOf')) {
                                processor.addParameter(
                                    paramName, paramValue.valueOf());
                            } else {
                                processor.addParameter(
                                    paramName, paramValue);
                            }
                        } else {
                            //  otherwise, its a Node, so we need to stringify
                            //  it, recreate it as an ActiveX document and then
                            //  get the first child node of that as the value to
                            //  use.
                            activeXNodeDoc = TP.boot.$documentFromStringIE(
                                                            TP.str(paramValue));
                            activeXNodeValue = activeXNodeDoc.childNodes[0];

                            processor.addParameter(paramName, activeXNodeValue);
                        }
                    });
            }

            //  perform the actual transformation.
            processor.transform();
        } catch (e) {
            return TP.raise(this, 'TP.sig.XSLTException',
                            TP.ec(e));
        }

        //  NB: We *must* capture the output into this temporary variable
        //  here. TP.documentFromString() calls TP.constructDocument() which
        //  does a 'loadXML' of 'blank content'. This parsing causes
        //  processor.output to be emptied out.
        result = processor.output;

        //  Turn the result String back into an XML node before we hand it
        //  back.

        //  NB: This function will make the result document 'specification
        //  compliant'. See the function above or TP.documentFromString for
        //  more details. Note here how we also pass 'true' to report XML
        //  errors, since sometimes XSLT problems generate incorrect XML
        //  output which will be readily trapped and be made apparent by
        //  attempting to parse it.
        node = TP.documentFromString(result, null, true);
        if (!TP.isXMLDocument(node) || TP.notValid(node.documentElement)) {
            TP.raise(this, 'TP.sig.XSLTException',
                    'Unable to produce valid XML document.');

            return;
        }

        //  If we didn't get a document then don't return one, return the
        //  document element instead
        if (!TP.isXMLDocument(inputNode)) {
            return node.documentElement;
        }

        return node;
    },
    'webkit',
    function(styleDoc, inputNode, paramHash) {

        /**
         * @method documentTransformNode
         * @summary Transforms the inputNode using the XSLT style sheet node
         *     provided, returning a node with the result data.
         * @param {XMLDocument} styleDoc The XSLT style document.
         * @param {Node} inputNode The input data element.
         * @param {TP.core.Hash} paramHash A hash of optional parameters to be
         *     passed to the style sheet. A key of 'xmlns:fixup' set to true
         *     will repair xmlns attributes.
         * @exception TP.sig.XSLTException
         * @exception TP.sig.InvalidXMLDocument
         * @returns {Node} The transformed Node.
         */

        var gotDoc,
            inputDoc,
            resultDoc,
            processor,

            realStyleDoc,

            paramNodes,
            len,
            i,
            node,

            fixupXMLNSAttrs,

            outputNodes,
            cdataSectionElementNames,

            docAttrs,
            foundDefaultNSAttr;

        if (!TP.isXMLDocument(styleDoc)) {
            return TP.raise(this, 'TP.sig.InvalidXMLDocument');
        }

        //  have to have a document or the tranformation will fail
        gotDoc = TP.isXMLDocument(inputNode);
        if (!gotDoc) {
            try {
                inputDoc = TP.documentFromNode(
                                TP.nodeCloneNode(inputNode, true));
            } catch (e) {
                return TP.raise(this, 'TP.sig.InvalidXMLDocument',
                                TP.ec(e));
            }
        } else {
            inputDoc = inputNode;
        }

        //  Normally, we let the caller decide if they want to fix xmlns
        //  attributes, but if the inputDoc itself is an XSLT, then we
        //  *know* that we need to make sure to preserve namespaces (as they
        //  will get used in things like template match XPaths).
        if (TP.nodeGetNSURI(inputDoc.documentElement) === TP.w3.Xmlns.XSLT) {
            fixupXMLNSAttrs = true;
        } else {
            fixupXMLNSAttrs = TP.ifKeyInvalid(paramHash,
                                                'xmlns:fixup',
                                                true);
        }

        if (TP.notValid(processor)) {
            try {
                //  create an xslt processor we can use to transform the
                //  data
                processor = new XSLTProcessor();

                if (TP.notEmpty(paramHash)) {
                    paramNodes = TP.ac();

                    //  We clone the style doc since we might need to alter it
                    //  below.
                    realStyleDoc = TP.nodeCloneNode(styleDoc, true);

                    paramHash.perform(
                        function(kvPair) {

                            var paramName,
                                paramValue,

                                paramElem,

                                newElem;

                            paramName = kvPair.first();
                            paramValue = TP.ifInvalid(kvPair.last(), '');

                            //  We can't have parameter names that start with
                            //  '$' - that conflicts with XSLT variables.
                            if (/^\$/.test(paramName)) {
                                return;
                            }

                            //  Webkit-based browsers have a long-standing bug
                            //  with using Nodes as parameters... sigh
                            //  https://bugs.webkit.org/show_bug.cgi?id=14101
                            if (TP.isNode(paramValue)) {
                                //  Search the style doc to see if there's an
                                //  'xsl:param' element with a name matching
                                //  paramName
                                if (TP.isElement(
                                    paramElem = TP.nodeEvaluateXPath(
                                        realStyleDoc,
                                        '//xsl:param[@name="' + paramName + '"]',
                                        TP.FIRST_NODE))) {

                                    //  Create an 'xsl:variable' element and set
                                    //  it's name to be the same as the
                                    //  'xsl:param'
                                    newElem = TP.documentConstructElement(
                                                        realStyleDoc,
                                                        'xsl:variable',
                                                        TP.w3.Xmlns.XSLT);
                                    TP.elementSetAttribute(
                                                    newElem, 'name', paramName);

                                    //  Swap in the 'xsl:variable' element for
                                    //  the 'xsl:param' element.
                                    newElem = TP.nodeReplaceChild(
                                                    paramElem.parentNode,
                                                    newElem,
                                                    paramElem);

                                    //  Append the content under the
                                    //  'xsl:variable' element.
                                    TP.nodeAppendChild(
                                                    newElem, paramValue, false);
                                }
                            } else {
                                processor.setParameter(
                                            null,
                                            paramName,
                                            paramValue);
                            }
                        });
                } else {
                    realStyleDoc = styleDoc;
                }

                //  NB: We *must* import the stylesheet *after* we set the
                //  parameters, in case any of them were 'node set'
                //  parameters.
                processor.importStylesheet(realStyleDoc);
            } catch (e) {
                TP.raise(this, 'TP.sig.XSLTException', TP.ec(e));

                return;
            }
        }

        try {
            //  Because of Mozilla's lack of support for namespaces in its
            //  XSLT processing (see above), we have to do some 'fixups'
            //  before we process the inputNode. We only do this if
            //  fixupXMLNSAttrs is true (which is the default).
            if (fixupXMLNSAttrs) {
                TP.$fixupNamespacedAttributesPre(inputDoc);
            }

            //  watch out for CSS within XHTML...can crash Mozilla
            inputDoc = TP.$nodeEscapeCSSConstructs(inputDoc);

            //  Do the deed...
            resultDoc = processor.transformToDocument(inputDoc);

            //  If we didn't get a valid result document, raise an exception
            //  and exit here.
            if (!TP.isXMLDocument(resultDoc) ||
                TP.notValid(resultDoc.documentElement)) {
                TP.raise(this, 'TP.sig.XSLTException',
                            'Unable to produce valid XML document.');

                return;
            }

            //  Now, if fixupXMLNSAttrs is true, undo whatever sort of
            //  strange machinations we had to do due to Mozilla's lack of
            //  namespace support.
            if (fixupXMLNSAttrs) {
                TP.$fixupNamespacedAttributesPost(inputDoc, resultDoc);
            }

            //  If there are any 'xsl:output' elements, grab the first (and
            //  should be only) one and check to see if it has a
            //  'cdata-section-elements' attribute on it. This means that
            //  the author of the stylesheet wanted certain elements to have
            //  their text content wrapped in CDATA sections, but since
            //  Transformiix refuses to do that, we'll do it manually here.
            if (TP.notEmpty(outputNodes = TP.nodeGetElementsByTagName(
                                                    styleDoc, 'xsl:output'))) {
                //  If there was actually content for the
                //  'cdata-section-elements' attribute, split it on space to
                //  get an Array of element names that we're supposed to
                //  wrap text child content for.
                if (TP.notEmpty(cdataSectionElementNames =
                                TP.elementGetAttribute(
                                                outputNodes.at(0),
                                                'cdata-section-elements'))) {
                    cdataSectionElementNames =
                                cdataSectionElementNames.split(' ');

                    TP.$documentEscapeContent(resultDoc,
                                                cdataSectionElementNames);
                }
            }

            //  Go ahead and auto-escape 'html:script' and 'html:style'
            //  elements in the output.
            TP.$documentEscapeContent(resultDoc,
                                        TP.ac('script',
                                            'style',
                                            'html:script',
                                            'html:style',
                                            'tibet_style'));

            if (TP.isArray(paramNodes)) {
                //  Remove any 'node set' parameter values that we added
                //  above.
                //  We do this by cleaning out all children under the
                //  parameter node.
                len = paramNodes.getSize();
                for (i = 0; i < len; i++) {
                    node = paramNodes.at(i);
                    TP.nodeDetach(node.firstChild);
                }
            }
        } catch (e) {
            TP.raise(this, 'TP.sig.XSLTException', TP.ec(e));

            return;
        }

        //  return the resultDoc as our return value as long as it's valid
        //  and has a document element
        if (!TP.isDocument(resultDoc) ||
            TP.notValid(resultDoc.documentElement)) {
            return;
        }

        //  We only do this if the documentElement doesn't have a prefix.
        //  This avoids an XMLSerializer bug on Mozilla.

        //  TODO: Check to see if we need to do this on Webkit...
        if (TP.isEmpty(resultDoc.documentElement.prefix)) {
            //  If the documentElement has a namespaceURI, the XSLTProcessor
            //  might have ripped out any default namespace attribute that
            //  it had, which will eventually cause the XMLSerializer to
            //  produce that 'a0' junk that we hate so much.

            //  The following code detects whether there's a default
            //  namespace or not and, if not, puts a default namespace
            //  attribute on the documentElement that is the namespace it
            //  has anyway, but this time set as the default namespace.
            //  This makes the XMLSerializer shut up about that 'a0' stuff.
            //  Note that, if this routine detects a default namespace, it
            //  will leave it alone even if its not the same namespace as
            //  the document element's namespace. This avoids problems when
            //  XSLTing an XSLT itself, since it very rarely uses the XSLT
            //  namespace as its default namespace.
            foundDefaultNSAttr = false;

            docAttrs = resultDoc.documentElement.attributes;
            for (i = 0; i < docAttrs.length; i++) {
                if (TP.attributeGetLocalName(docAttrs[i]) === 'xmlns') {
                    foundDefaultNSAttr = true;
                    break;
                }
            }

            if (!foundDefaultNSAttr) {
                resultDoc.documentElement.setAttributeNS(
                            TP.w3.Xmlns.XMLNS,
                            'xmlns',
                            TP.nodeGetNSURI(resultDoc.documentElement));
            }
        }

        //  if we didn't get a document then don't return one, return the
        //  document element instead
        if (!gotDoc) {
            return resultDoc.documentElement;
        }

        return resultDoc;
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
