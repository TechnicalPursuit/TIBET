
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
//  ATTRIBUTE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('attributeGetOwnerElement',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    TP.DEFAULT,
    function(anAttributeNode) {

        /**
         * @method attributeGetOwnerElement
         * @summary Returns the owning element of the supplied attribute node.
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
         * @exception TP.sig.InvalidAttributeNode Raised when a non-attribute Node
         *     has been supplied to the method.
         * @exception TP.sig.InvalidXMLDocument Raised when the supplied attribute
         *     Node is not part of an XML document.
         */

        if (!TP.isAttributeNode(anAttributeNode)) {
            return TP.raise(this, 'TP.sig.InvalidAttributeNode');
        }

        return anAttributeNode.ownerElement;
    },
    'webkit',
    function(anAttributeNode) {

        /**
         * @method attributeGetOwnerElement
         * @summary Returns the owning element of the supplied attribute node.
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
         * @exception TP.sig.InvalidAttributeNode Raised when a non-attribute Node
         *     has been supplied to the method.
         * @exception TP.sig.InvalidXMLDocument Raised when the supplied attribute
         *     Node is not part of an XML document.
         */

        var owner;

        if (!TP.isAttributeNode(anAttributeNode)) {
            return TP.raise(this, 'TP.sig.InvalidAttributeNode');
        }

        //  For some reason, DOM Level 4 removes 'ownerElement'
        if (!TP.isElement(owner = anAttributeNode.ownerElement)) {
            owner = TP.nodeEvaluateXPath(anAttributeNode, '..');
        }

        return owner;
    }
));

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('$documentFixupInlineBindingAttrs',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    TP.DEFAULT,
    function(inputStr) {

        /**
         * @method $documentFixupInlineBindingAttrs
         * @summary Converts any inline binding expressions:
         *     value="[[foo.bar]]")
         *     to 'bind:io' attributes:
         *     bind:io="{value: foo}".
         *     This is done because a) it makes the bind machinery simpler and
         *     more efficient to search for bindings that are normalized like
         *     this and b) some browsers (like IE) don't like attribute values
         *     that it considers to be 'invalid' for some attributes (like the
         *     'style' attribute) and will strip them out.
         * @param {String} inputStr The markup String to convert inline binding
         *     expressions in.
         * @returns {String} A markup String that has inline binding expressions
         *     converted to 'bind:io' attributes.
         */

        var parser,
            workingDoc,

            result,

            inlineBindingAttrs,

            node,

            bindAttrLocalName,

            i,

            srcAttr,

            ownerElem,
            ownerType,
            ioAttrs,

            j,

            ownerElemAttr,
            val,
            bindAttr,

            isSingleValued,

            desugaredAttrsAttr,

            outputStr;

        //  Use the 'old ActiveX way' to parse the document - this parser
        //  does *not* strip "invalid" constructs from the markup.
        parser = new DOMParser();

        workingDoc = parser.parseFromString(inputStr, TP.XML_ENCODED);

        //  Look for any attributes that contain '[[' - these are binding
        //  expressions. Note how *do not* look for any that are in the
        //  TP.w3.Xmlns.BIND namespace, which means any 'bind:*' attributes
        //  themselves.
        result = workingDoc.evaluate(
                '//*/@*[contains(., "[[") and ' +
                'namespace-uri() != "' + TP.w3.Xmlns.BIND + '"]',
                workingDoc,
                null,
                XPathResult.ANY_TYPE,
                null);

        inlineBindingAttrs = TP.ac();
        while (TP.isNode(node = result.iterateNext())) {
            inlineBindingAttrs.push(node);
        }

        for (i = 0; i < inlineBindingAttrs.length; i++) {

            srcAttr = inlineBindingAttrs[i];

            //  Grab the Element node that owns this Attribute node.
            ownerElem = srcAttr.ownerElement;

            //  Grab the owner Element node's concrete type here and see if the
            //  attribute local name is in the list of bidirectional attributes.
            //  If it is, use 'io' as the binding attribute local name. If not,
            //  use 'in'.
            ownerType = TP.dom.ElementNode.getConcreteType(ownerElem);
            ioAttrs = ownerType.get('bidiAttrs');
            bindAttrLocalName =
                        ioAttrs.indexOf(srcAttr.localName) !== TP.NOT_FOUND ?
                        'io' :
                        'in';

            //  Initially set the bindAttr to null
            bindAttr = null;

            //  Loop over all of the attributes of the owner Element, looking to
            //  see if they're named 'bind:in'/'bind:io' or if they're named
            //  'in'/'io' with a namespaceURI of TP.w3.Xmlns.BIND. This means
            //  that we have an existing bind:io attribute that we should just
            //  add to.
            for (j = 0; j < ownerElem.attributes.length; j++) {
                ownerElemAttr = ownerElem.attributes[j];

                if (ownerElemAttr.localName === bindAttrLocalName &&
                     ownerElemAttr.namespaceURI === TP.w3.Xmlns.BIND) {
                    bindAttr = ownerElemAttr;
                    break;
                }
            }

            //  Make sure that we don't (re)process bind:in/bind:io attributes
            if (bindAttr === srcAttr) {
                continue;
            }

            val = srcAttr.nodeValue;

            isSingleValued = false;

            //  If the expression starts and ends exactly (modulo whitespace)
            //  with '[[' and ']]', and it doesn't contain ACP variables or
            //  formatting expressions, then we can trim off the '[[' and ']]'.
            if (/^\s*\[\[/.test(val) && /\]\]\s*$/.test(val) &&
                !TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(val) &&
                !TP.regex.ACP_FORMAT.test(val)) {
                //  Trim off whitespace
                val = TP.trim(val);

                //  Slice off the leading and trailing '[[' and ']]'
                val = val.slice(2, -2);
            } else if (!/^\s*\[\[/.test(val) || !/\]\]\s*$/.test(val)) {
                //  If the expression doesn't end exactly (modulo whitespace) at
                //  either the start or end, then we quote the entire
                //  expression.
                val = val.quoted('\'');

                //  Since we'll be putting this through a transformation
                //  function that will probably expect a single value, we need
                //  to mark it as such below. If the tag type doesn't want this,
                //  it will need to override the 'isSingleValued()' method.
                isSingleValued = true;
            }

            //  There was no existing bind:in/bind:io attribute - build one and
            //  set it's value.
            if (!TP.isAttributeNode(bindAttr)) {
                ownerElem.setAttributeNS(
                        TP.w3.Xmlns.BIND,
                        'bind:' + bindAttrLocalName,
                        '{' + srcAttr.name + ': ' + val + '}');

                if (isSingleValued) {
                    ownerElem.setAttributeNS(
                            TP.w3.Xmlns.TIBET,
                            'tibet:single',
                            srcAttr.name);
                }

                ownerElem.setAttributeNS(
                        TP.w3.Xmlns.TIBET,
                        'tibet:desugared',
                        srcAttr.name);
            } else {
                //  Already have a bind:in/bind:io attribute - add to it.
                bindAttr.nodeValue =
                    bindAttr.nodeValue.slice(
                        0, bindAttr.nodeValue.lastIndexOf('}')) +
                    ', ' +
                    srcAttr.name +
                    ': ' +
                    val +
                    '}';
                desugaredAttrsAttr =
                    ownerElem.attributes['tibet:desugared'];
                desugaredAttrsAttr.nodeValue += ' ' + srcAttr.name;
            }

            //  Remove the original Attribute node containing the '[[...]]'
            //  expression.
            ownerElem.removeAttributeNode(srcAttr);
        }

        //  Turn it back into a String.
        outputStr = (new XMLSerializer()).serializeToString(workingDoc);

        return outputStr;
    },
    'trident',
    function(inputStr) {

        /**
         * @method $documentFixupInlineBindingAttrs
         * @summary Converts any inline binding expressions:
         *     value="[[foo.bar]]")
         *     to 'bind:io' attributes:
         *     bind:io="{value: foo}".
         *     This is done because a) it makes the bind machinery simpler and
         *     more efficient to search for bindings that are normalized like
         *     this and b) some browsers (like IE) don't like attribute values
         *     that it considers to be 'invalid' for some attributes (like the
         *     'style' attribute) and will strip them out.
         * @param {String} inputStr The markup String to convert inline binding
         *     expressions in.
         * @returns {String} A markup String that has inline binding expressions
         *     converted to 'bind:io' attributes.
         */

        var activeXDoc,

            inlineBindingAttrs,
            i,

            srcAttr,

            ownerElem,
            j,

            ownerElemAttr,
            val,
            bindAttr,

            isSingleValued,

            desugaredAttrsAttr,

            outputStr;

        //  Use the 'old ActiveX way' to parse the document - this parser
        //  does *not* strip "invalid" constructs from the markup.
        activeXDoc = TP.boot.$documentFromStringIE(inputStr);

        //  Look for any attributes that contain '[[' - these are binding
        //  expressions. Note how *do not* look for any that are in the
        //  TP.w3.Xmlns.BIND namespace, which means any 'bind:*' attributes
        //  themselves.
        inlineBindingAttrs = activeXDoc.selectNodes(
                '//*/@*[contains(., "[[") and ' +
                'namespace-uri() != "' + TP.w3.Xmlns.BIND + '"]');

        //  Loop over any found and desugar them into 'bind:io' attributes.
        for (i = 0; i < inlineBindingAttrs.length; i++) {

            srcAttr = inlineBindingAttrs[i];

            //  Grab the Element node that owns this Attribute node.
            ownerElem = srcAttr.selectSingleNode('..');

            //  Initially set the bindAttr to null
            bindAttr = null;

            //  Loop over all of the attributes of the owner Element,
            //  looking to see if they're named 'bind:io' or if they're
            //  named 'io' with a namespaceURI of TP.w3.Xmlns.BIND. This
            //  means that we have an existing bind:io attribute that we
            //  should just add to.
            for (j = 0; j < ownerElem.attributes.length; j++) {
                ownerElemAttr = ownerElem.attributes[j];

                if (ownerElemAttr.localName === 'io' &&
                     ownerElemAttr.namespaceURI === TP.w3.Xmlns.BIND) {
                    bindAttr = ownerElemAttr;
                    break;
                }
            }

            //  Make sure that we don't (re)process bind:io attributes
            if (bindAttr === srcAttr) {
                continue;
            }

            val = srcAttr.nodeValue;

            isSingleValued = false;

            //  If the expression starts and ends exactly (modulo whitespace)
            //  with '[[' and ']]', and it doesn't contain ACP variables or
            //  formatting expressions, then we can trim off the '[[' and ']]'.
            if (/^\s*\[\[/.test(val) && /\]\]\s*$/.test(val) &&
                !TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(val) &&
                !TP.regex.ACP_FORMAT.test(val)) {
                //  Trim off whitespace
                val = TP.trim(val);

                //  Slice off the leading and trailing '[[' and ']]'
                val = val.slice(2, -2);
            } else if (!/^\s*\[\[/.test(val) || !/\]\]\s*$/.test(val)) {
                //  If the expression doesn't end exactly (modulo whitespace) at
                //  either the start or end, then we quote the entire
                //  expression.
                val = val.quoted('\'');

                //  Since we'll be putting this through a transformation
                //  function that will probably expect a single value, we need
                //  to mark it as such below. If the tag type doesn't want this,
                //  it will need to override the 'isSingleValued()' method.
                isSingleValued = true;
            }

            //  There was no existing bind:io attribute - build one and set
            //  it's value.
            if (!TP.isAttributeNode(bindAttr)) {
                bindAttr = activeXDoc.createNode(
                                        Node.ATTRIBUTE_NODE,
                                        'bind:io',
                                        TP.w3.Xmlns.BIND);

                ownerElem.setAttributeNode(bindAttr);

                bindAttr.nodeValue = '{' + srcAttr.name + ': ' + val + '}';

                if (isSingleValued) {
                    bindAttr = activeXDoc.createNode(
                                            Node.ATTRIBUTE_NODE,
                                            'tibet:single',
                                            TP.w3.Xmlns.TIBET);

                    ownerElem.setAttributeNode(bindAttr);

                    bindAttr.nodeValue = srcAttr.name;
                }

                desugaredAttrsAttr = activeXDoc.createNode(
                                        Node.ATTRIBUTE_NODE,
                                        'tibet:desugared',
                                        TP.w3.Xmlns.TIBET);

                ownerElem.setAttributeNode(desugaredAttrsAttr);

                desugaredAttrsAttr.nodeValue = srcAttr.name;
            } else {
                //  Already have a bind:io attribute - add to it.
                bindAttr.nodeValue =
                    bindAttr.nodeValue.slice(
                        0, bindAttr.nodeValue.lastIndexOf('}')) +
                    ', ' +
                    srcAttr.name +
                    ': ' +
                    val +
                    '}';
                desugaredAttrsAttr =
                    ownerElem.attributes['tibet:desugared'];
                desugaredAttrsAttr.nodeValue += ' ' + srcAttr.name;
            }

            //  Remove the original Attribute node containing the '[[...]]'
            //  expression.
            ownerElem.removeAttributeNode(srcAttr);
        }

        //  Turn it back into a String.
        outputStr = activeXDoc.xml;

        return outputStr;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('documentFromString',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(aString, defaultNS, shouldReport) {

        /**
         * @method documentFromString
         * @summary Parses aString and returns the XML document representing
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
         *     exceptions to be thrown. This is true by default.
         * @example Create an XML document from a String:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp><foo><bar/></foo></samp>
         *     </code>
         * @returns {XMLDocument} The XML document parsed from the string.
         * @exception TP.sig.DOMParseException Raised if the supplied String cannot
         *     be parsed into a proper XML DOM construct and the shouldReport
         *     flag is true.
         */

        var report,
            parser,

            str,

            defs,

            xmlDoc,

            errorElement,

            undefinedPrefixes,

            errorMatchResults,
            errorRecord,
            list;

        report = TP.ifInvalid(shouldReport, false);

        //  force to true when TIBET is configured for parse debugging
        if (TP.notValid(report)) {
            report = TP.sys.shouldReportParseErrors();
        }

        //  NB: Do *not* change these to 'TIBET primitives' (like
        //  TP.isEmpty()) as this method gets used early in the booting
        //  process.

        //  String without valid markup? Not XML then.
        if (aString === '' ||
            !/^[\s\w]*</.test(aString) ||
            aString.length < '<a/>'.length) {
            return;
        }

        //  If the caller has specified a default namespace, use it here. Even
        //  if this is the empty String, that's ok - it means they wanted an
        //  empty default namespace.
        if (TP.isString(defaultNS)) {
            str = '<tibet_root xmlns="' + defaultNS + '"';
        } else {
            str = '<tibet_root';
        }

        //  if TIBET has the 'TP.w3.Xmlns' type loaded, we leverage XMLNS
        //  'auto-qualification'
        if (TP.isType(TP.sys.getTypeByName('TP.w3.Xmlns')) &&
            TP.notEmpty(defs = TP.w3.Xmlns.get('XMLNSDefs'))) {
            str = aString.replace(
                TP.regex.ALL_ELEM_MARKUP,
                str + ' ' + defs + '>$&</tibet_root>');
        } else {
            str = aString.replace(
                TP.regex.ALL_ELEM_MARKUP,
                str + '>$&</tibet_root>');
        }

        //  Detect things like binding expressions here and massage the DOM to
        //  create (or add to an existing) bind:io attribute. Note here how we
        //  also check to make sure it's not a JSON String - we don't want long
        //  Strings of JSON data in our binding attributes.
        if (TP.regex.BINDING_STATEMENT_DETECT.test(str) &&
            !TP.isJSONString(str)) {
            str = TP.$documentFixupInlineBindingAttrs(str);
        }

        //  Make sure to replace any characters that are valid UTF-8, but not
        //  valid XML characters.
        str = str.replace(TP.regex.UTF8_BUT_NOT_XML_CHARS);

        parser = new DOMParser();

        xmlDoc = parser.parseFromString(str, TP.XML_ENCODED);

        //  If there is an Element named 'parsererror', that is
        //  Mozilla's way of telling us that a parser error
        //  occurred ;-).
        if (xmlDoc.documentElement.nodeName === 'parsererror') {
            errorElement = xmlDoc.documentElement;

            //  If the system is currently configured to automatically define
            //  undefined XML prefixes (either element or attribute), then
            //  attempt to do so.
            if (TP.sys.cfg('content.autodefine_missing_prefixes')) {

                //  Scan the content for undefined prefixes
                undefinedPrefixes = TP.xmlStringGetUndefinedPrefixes(aString);

                //  Declare the missing prefixes and then retry
                if (TP.notEmpty(undefinedPrefixes)) {
                    undefinedPrefixes.forEach(
                            function(aPrefix) {
                                TP.ifWarn() ?
                                    TP.warn('Declaring missing prefix: ' +
                                            aPrefix +
                                            ' as: ' +
                                            'urn:tmp:' +
                                            aPrefix) : 0;
                                TP.w3.Xmlns.registerNSInfo(
                                    'urn:tmp:' + aPrefix,
                                    TP.hc('prefix', aPrefix));
                            });

                    //  Return retrying the parsing now that the prefixes have
                    //  been defined.
                    return TP.documentFromString(
                            aString, defaultNS, shouldReport);
                }
            }

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
                            errorRecord);
            }

            return null;
        }

        //  If there is only 1 element child of the document element (i.e. the
        //  '<tibet_root>' element that we used for XMLNS qualification) then we
        //  need to replace that with its first child (which is the real
        //  content). Note that we do *NOT* do this if there is more than 1
        //  element child, which would indicate that we were handed a String
        //  that resolved as a DocumentFragment. In this case, we just hand back
        //  the <tibet_root> element.
        if (xmlDoc.documentElement.children.length === 1) {
            xmlDoc.replaceChild(
                    xmlDoc.documentElement.firstChild,
                    xmlDoc.documentElement);
        }

        return xmlDoc;
    },
    'trident',
    function(aString, defaultNS, shouldReport) {

        /**
         * @method documentFromString
         * @summary Parses aString and returns the XML document representing
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
         *     exceptions to be thrown. This is true by default.
         * @example Create an XML document from a String:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp><foo><bar/></foo></samp>
         *     </code>
         * @returns {XMLDocument} The XML document parsed from the string.
         * @exception TP.sig.DOMParseException Raised if the supplied String cannot
         *     be parsed into a proper XML DOM construct and the shouldReport
         *     flag is true.
         */

        var report,
            parser,

            str,

            defs,

            xmlDoc,

            undefinedPrefixes,

            errorRecord,

            activeXDoc,

            activeXBody,
            regularBody;

        report = TP.ifInvalid(shouldReport, false);

        //  force to true when TIBET is configured for parse debugging
        if (TP.notValid(report)) {
            report = TP.sys.shouldReportParseErrors();
        }

        //  NB: Do *not* change these to 'TIBET primitives' (like
        //  TP.isEmpty())
        //  as this method gets used early in the booting process.

        //  String without valid markup? Not XML then.
        if (aString === '' ||
            !/^[\s\w]*</.test(aString) ||
            aString.length < '<a/>'.length) {
            return;
        }

        //  If the caller has specified a default namespace, use it here. Even
        //  if this is the empty String, that's ok - it means they wanted an
        //  empty default namespace.
        if (TP.isString(defaultNS)) {
            str = '<tibet_root xmlns="' + defaultNS + '"';
        } else {
            str = '<tibet_root';
        }

        //  if TIBET has the 'TP.w3.Xmlns' type loaded, we leverage XMLNS
        //  'auto-qualification'
        if (TP.isType(TP.sys.getTypeByName('TP.w3.Xmlns')) &&
            TP.notEmpty(defs = TP.w3.Xmlns.get('XMLNSDefs'))) {
            str = aString.replace(
                TP.regex.ALL_ELEM_MARKUP,
                str + ' ' + defs + '>$&</tibet_root>');
        } else {
            str = aString.replace(
                TP.regex.ALL_ELEM_MARKUP,
                str + '>$&</tibet_root>');
        }

        //  Unfortunately, the DOMParser in IE decides to 'help' us by not
        //  allowing certain constructs (like binding expressions) in certain
        //  attributes (like 'style') if we're parsing XHTML. Therefore, we
        //  detect things like binding expressions here and massage the DOM to
        //  create (or add to an existing) bind:io attribute. Note here how we
        //  also check to make sure it's not a JSON String - we don't want long
        //  Strings of JSON data in our binding attributes.
        if (TP.regex.BINDING_STATEMENT_DETECT.test(str) &&
            !TP.isJSONString(str)) {
            str = TP.$documentFixupInlineBindingAttrs(str);
        }

        parser = new DOMParser();

        try {
            xmlDoc = parser.parseFromString(str, TP.XML_ENCODED);
        } catch (e) {

            //  If the system is currently configured to automatically define
            //  undefined XML prefixes (either element or attribute), then
            //  attempt to do so.
            if (TP.sys.cfg('content.autodefine_missing_prefixes')) {

                //  Scan the content for undefined prefixes
                undefinedPrefixes = TP.xmlStringGetUndefinedPrefixes(aString);

                //  Declare the missing prefixes and then retry
                if (TP.notEmpty(undefinedPrefixes)) {
                    undefinedPrefixes.forEach(
                            function(aPrefix) {
                                TP.ifWarn() ?
                                    TP.warn('Declaring missing prefix: ' +
                                            aPrefix +
                                            ' as: ' +
                                            'urn:tmp:' +
                                            aPrefix) : 0;
                                TP.w3.Xmlns.registerNSInfo(
                                    'urn:tmp:' + aPrefix,
                                    TP.hc('prefix', aPrefix));
                            });

                    //  Return retrying the parsing now that the prefixes have
                    //  been defined.
                    return TP.documentFromString(
                            aString, defaultNS, shouldReport);
                }
            }

            if (TP.notFalse(report)) {
                errorRecord = TP.hc('reason', TP.str(e.message));
                TP.raise(this, 'TP.sig.DOMParseException',
                            errorRecord);
            }

            return null;
        }

        //  Unfortunately, IE's DOMParser removes attributes from the '<body>'
        //  element (if there is one). So, to counter this, we use the 'old
        //  ActiveX way' to parse the document and copy the attributes from the
        //  body over from one to the other.
        if (/<body/.test(aString)) {
            activeXDoc = TP.boot.$documentFromStringIE(str);
            //  NB: This is the easiest way to do this, given that it might very
            //  well be in the XHTML namespace.
            activeXBody = activeXDoc.selectSingleNode(
                                            '//*[local-name() = "body"]');
            regularBody = xmlDoc.getElementsByTagName('body')[0];
            TP.elementCopyAttributes(activeXBody, regularBody);
        }

        //  If there is only 1 element child of the document element (i.e. the
        //  '<tibet_root>' element that we used for XMLNS qualification) then we
        //  need to replace that with its first child (which is the real
        //  content). Note that we do *NOT* do this if there is more than 1
        //  element child, which would indicate that we were handed a String
        //  that resolved as a DocumentFragment. In this case, we just hand back
        //  the <tibet_root> element.
        if (xmlDoc.documentElement.children.length === 1) {
            xmlDoc.replaceChild(
                    xmlDoc.documentElement.firstChild,
                    xmlDoc.documentElement);
        }

        return xmlDoc;
    },
    'webkit',
    function(aString, defaultNS, shouldReport) {

        /**
         * @method documentFromString
         * @summary Parses aString and returns the XML document representing
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
         *     exceptions to be thrown. This is true by default.
         * @example Create an XML document from a String:
         *     <code>
         *          xmlDoc = TP.documentFromString('<foo><bar/></foo>');
         *          <samp>[object XMLDocument]</samp>
         *          TP.nodeAsString(xmlDoc);
         *          <samp><foo><bar/></foo></samp>
         *     </code>
         * @returns {XMLDocument} The XML document parsed from the string.
         * @exception TP.sig.DOMParseException Raised if the supplied String cannot
         *     be parsed into a proper XML DOM construct and the shouldReport
         *     flag is true.
         */

        var report,
            parser,

            str,

            defs,

            xmlDoc,

            errorElement,
            errorStr,

            undefinedPrefixes,

            errorMatchResults,
            errorRecord;

        report = TP.ifInvalid(shouldReport, false);

        //  force to true when TIBET is configured for parse debugging
        if (TP.notValid(report)) {
            report = TP.sys.shouldReportParseErrors();
        }

        //  NB: Do *not* change these to 'TIBET primitives' (like
        //  TP.isEmpty())
        //  as this method gets used early in the booting process.

        //  String without valid markup? Not XML then.
        if (aString === '' ||
            !/^[\s\w]*</.test(aString) ||
            aString.length < '<a/>'.length) {
            return;
        }

        //  If the caller has specified a default namespace, use it here. Even
        //  if this is the empty String, that's ok - it means they wanted an
        //  empty default namespace.
        if (TP.isString(defaultNS)) {
            str = '<tibet_root xmlns="' + defaultNS + '"';
        } else {
            str = '<tibet_root';
        }

        //  if TIBET has the 'TP.w3.Xmlns' type loaded, we leverage XMLNS
        //  'auto-qualification'
        if (TP.isType(TP.sys.getTypeByName('TP.w3.Xmlns')) &&
            TP.notEmpty(defs = TP.w3.Xmlns.get('XMLNSDefs'))) {
            str = aString.replace(
                TP.regex.ALL_ELEM_MARKUP,
                str + ' ' + defs + '>$&</tibet_root>');
        } else {
            str = aString.replace(
                TP.regex.ALL_ELEM_MARKUP,
                str + '>$&</tibet_root>');
        }

        //  Detect things like binding expressions here and massage the DOM to
        //  create (or add to an existing) bind:io attribute. Note here how we
        //  also check to make sure it's not a JSON String - we don't want long
        //  Strings of JSON data in our binding attributes.
        if (TP.regex.BINDING_STATEMENT_DETECT.test(str) &&
            !TP.isJSONString(str)) {
            str = TP.$documentFixupInlineBindingAttrs(str);
        }

        //  Make sure to replace any characters that are valid UTF-8, but not
        //  valid XML characters.
        str = str.replace(TP.regex.UTF8_BUT_NOT_XML_CHARS);

        parser = new DOMParser();

        xmlDoc = parser.parseFromString(str, TP.XML_ENCODED);

        //  If there is an Element named 'parsererror', that is Webkit's
        //  way of telling us that a parser error occurred ;-).
        if (TP.isElement(errorElement =
                        xmlDoc.getElementsByTagName('parsererror')[0])) {

            //  If the system is currently configured to automatically define
            //  undefined XML prefixes (either element or attribute), then
            //  attempt to do so.
            if (TP.sys.cfg('content.autodefine_missing_prefixes')) {

                //  Scan the content for undefined prefixes
                undefinedPrefixes = TP.xmlStringGetUndefinedPrefixes(aString);

                //  Declare the missing prefixes and then retry
                if (TP.notEmpty(undefinedPrefixes)) {
                    undefinedPrefixes.forEach(
                            function(aPrefix) {
                                TP.ifWarn() ?
                                    TP.warn('Declaring missing prefix: ' +
                                            aPrefix +
                                            ' as: ' +
                                            'urn:tmp:' +
                                            aPrefix) : 0;
                                TP.w3.Xmlns.registerNSInfo(
                                    'urn:tmp:' + aPrefix,
                                    TP.hc('prefix', aPrefix));
                            });

                    //  Return retrying the parsing now that the prefixes have
                    //  been defined.
                    return TP.documentFromString(
                            aString, defaultNS, shouldReport);
                }
            }

            //  Sometimes we don't want to report an error from here
            //  because we're calling this from the logging itself and
            //  we would recurse (or we're just 'tasting' the String).
            if (TP.notFalse(report)) {

                errorStr = TP.nodeAsString(errorElement);

                //  Sometimes there is more information to go with the
                //  parser error. If so, build a record of that
                //  information to report with the exception.
                if (TP.isNode(errorElement.firstChild)) {
                    errorMatchResults =
                        TP.regex.WEBKIT_XML_PARSE.exec(errorStr);

                    errorRecord =
                            TP.hc('reason', errorMatchResults.at(3),
                                    'line', errorMatchResults.at(1),
                                    'linepos', errorMatchResults.at(2));
                } else {
                    errorRecord = TP.hc('reason', 'Unknown',
                                        'line', 'Unknown',
                                        'linepos', 'Unknown');
                }

                TP.raise(this, 'TP.sig.DOMParseException',
                            errorRecord);
            }

            return null;
        }

        //  If there is only 1 element child of the document element (i.e. the
        //  '<tibet_root>' element that we used for XMLNS qualification) then we
        //  need to replace that with its first child (which is the real
        //  content). Note that we do *NOT* do this if there is more than 1
        //  element child, which would indicate that we were handed a String
        //  that resolved as a DocumentFragment. In this case, we just hand back
        //  the <tibet_root> element.
        if (xmlDoc.documentElement.children.length === 1) {
            xmlDoc.replaceChild(
                    xmlDoc.documentElement.firstChild,
                    xmlDoc.documentElement);
        }

        //  Safari has a nasty bug whereby, if the child needs a namespace
        //  definition, but that existed on the document element, then it won't
        //  be 'copied' down onto the child (or is in an invisible way). This
        //  causes later serializations to double the namespace attributes which
        //  then causes parse errors.
        if (TP.sys.isUA('safari')) {

            xmlDoc = parser.parseFromString(
                                (new XMLSerializer()).serializeToString(xmlDoc),
                                TP.XML_ENCODED);
        }

        return xmlDoc;
    }
));

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('$$elementPreserveIFrameContent',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement) {

        /**
         * @method $$elementPreserveIFrameContent
         * @summary Preserves iframe content for browser platforms which need
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
         * @returns {TP.core.Hash} A hash containing the document Elements for
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
    function() {

        /**
         * @method $$elementPreserveIFrameContent
         * @summary Preserves iframe content for browser platforms which need
         *     it.
         * @description This patch is only required for certain browser
         *     platforms. See the versions of this method in those
         *     browser-specific files for more information. As of this writing,
         *     Trident does not require this method to do anything, but Gecko
         *     and Webkit do:
         *     https://bugzilla.mozilla.org/show_bug.cgi?id=254144
         *     https://bugs.webkit.org/show_bug.cgi?id=13574 This version of
         *     this method just returns null.
         * @returns {TP.core.Hash} A hash containing the document Elements for
         *     each of the iframe's found under anElement (or for anElement
         *     itself if its an iframe).
         */

        return null;
    },
    'webkit',
    function(anElement) {

        /**
         * @method $$elementPreserveIFrameContent
         * @summary Preserves iframe content for browser platforms which need
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
         * @returns {TP.core.Hash} A hash containing the document Elements for
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

TP.definePrimitive('$$elementRestoreIFrameContent',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement, docElemsHash) {

        /**
         * @method $$elementRestoreIFrameContent
         * @summary Restores previously preserved iframe content for browser
         *     platforms which need it.
         * @description This patch is required for DOM modification calls (such
         *     as TP.nodeAppendChild()) that may be moving 'iframe' elements
         *     (either directly or as descendants of an element being moved).
         *     This is because some browser platforms, such as Gecko, do not
         *     preserve an iframe's content when its element is moved around in
         *     the DOM. For more information, see:
         *     https://bugzilla.mozilla.org/show_bug.cgi?id=254144
         * @param {Element} anElement The element to restore iframe content for.
         * @param {TP.core.Hash} docElemsHash The hash containing the document
         *     elements previously captured during the preserve process.
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
         * @method $$elementRestoreIFrameContent
         * @summary Restores previously preserved iframe content for browser
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
         * @param {TP.core.Hash} docElemsHash The hash containing the document
         *     elements previously captured during the preserve process.
         */

        return;
    },
    'webkit',
    function(anElement, docElemsHash) {

        /**
         * @method $$elementRestoreIFrameContent
         * @summary Restores previously preserved iframe content for browser
         *     platforms which need it.
         * @description This patch is required for DOM modification calls (such
         *     as TP.nodeAppendChild()) that may be moving 'iframe' elements
         *     (either directly or as descendants of an element being moved).
         *     This is because some browser platforms, such as Webkit-based
         *     ones, do not preserve an iframe's content when its element is
         *     moved around in the DOM. For more information, see:
         *     https://bugs.webkit.org/show_bug.cgi?id=13574
         * @param {Element} anElement The element to restore iframe content for.
         * @param {TP.core.Hash} docElemsHash The hash containing the document
         *     elements previously captured during the preserve process.
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
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement, attrName, attrValue, attrNS) {

        /**
         * @method elementSetAttributeInNS
         * @summary Sets an attribute on the supplied element in the namespace
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
         * @exception TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @exception TP.sig.InvalidString Raised when a null or empty attribute
         *     name is provided to the method.
         * @exception TP.sig.InvalidParameter Raised when a null or undefined
         *     attribute value is provided to the method.
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        if (TP.isEmpty(attrName)) {
            return TP.raise(this, 'TP.sig.InvalidString');
        }

        if (TP.notValid(attrValue)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        if (TP.notEmpty(attrNS) &&
            TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
            anElement.setAttributeNS(attrNS, attrName, attrValue);
        } else {
            anElement.setAttribute(attrName, attrValue);
        }

        return;
    },
    TP.DEFAULT,
    function(anElement, attrName, attrValue, attrNS) {

        /**
         * @method elementSetAttributeInNS
         * @summary Sets an attribute on the supplied element in the namespace
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
         * @exception TP.sig.InvalidElement Raised when an invalid element is
         *     provided to the method.
         * @exception TP.sig.InvalidString Raised when a null or empty attribute
         *     name is provided to the method.
         * @exception TP.sig.InvalidParameter Raised when a null or undefined
         *     attribute value is provided to the method.
         */

        var parts,
            prefix,

            attrs,
            i,
            xmlnsAttrName;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        if (TP.isEmpty(attrName)) {
            return TP.raise(this, 'TP.sig.InvalidString');
        }

        if (TP.notValid(attrValue)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
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

                    if (!TP.isElement(
                              TP.nodeGetFirstAncestorByAttribute(
                                          anElement, xmlnsAttrName))) {

                        //  We need to make sure that we're not putting a
                        //  namespace definition on an element that already has
                        //  one.
                        attrs = anElement.attributes;
                        for (i = 0; i < attrs.length; i++) {
                            if (attrs[i].name === xmlnsAttrName) {
                                break;
                            }
                        }

                        //  NOTE: We cannot use elementAddNSURI() here since
                        //  that call uses this call :-).
                        anElement.setAttributeNS(TP.w3.Xmlns.XMLNS,
                                                    xmlnsAttrName,
                                                    attrNS);
                    }
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
    TP.sys.getBrowserUI,
    'gecko',
    function(aNode, wantsXMLDeclaration, shallow) {

        /**
         * @method nodeAsString
         * @summary Returns the string representation of aNode.
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
         *          TP.documentConstructElement(xmlDoc, 'bar', null));
         *          <samp>[object Element]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentConstructElement(xmlDoc, 'baz', ''));
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
         *          docFrag = TP.documentConstructFragment(xmlDoc);
         *          TP.nodeAppendChild(
         *          docFrag,
         *          TP.documentConstructElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAppendChld(
         *          docFrag,
         *          TP.documentConstructElement(xmlDoc, 'span',
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
         * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @exception TP.sig.SerializationException Raised when the serialization
         *     machinery encounters an error serializing the node.
         * @exception TP.sig.UnsupportedOperation Raised when a Node is supplied
         *     that this method doesn't know how to generate a string
         *     representation of. These include Nodes of type:
         *     Node.ENTITY_REFERENCE_NODE Node.ENTITY_NODE
         *     Node.NOTATION_NODE
         */

        var node,
            str;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode');
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
                                TP.ec(e));
                    str = 'Serialization failed.';
                }

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }

            case Node.PROCESSING_INSTRUCTION_NODE:

                return '<?' + node.target + ' ' + node.data + '?>';

            case Node.COMMENT_NODE:

                return '<!--' + node.data + '-->';

            case Node.ENTITY_REFERENCE_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

            case Node.ENTITY_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

            case Node.DOCUMENT_TYPE_NODE:

                return '<!DOCTYPE ' + node.name +
                        ' PUBLIC ' + node.publicId + ' ' + node.systemId + '>';

            case Node.NOTATION_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

                /* eslint-disable no-fallthrough */

            case Node.DOCUMENT_NODE:

                //  No document element? Return the empty string.
                if (TP.notValid(node.documentElement)) {
                    return '';
                }

                //  Note here how we don't break, but continue falling
                //  through...

            case Node.ELEMENT_NODE:

                //  Note here how we don't break, but continue falling
                //  through...

            default:

                /* eslint-enable no-fallthrough */

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
                            TP.ec(e));
                        str = 'Serialization failed.';
                    }
                }

                //  IE's XMLSerializer insists on putting a space before the
                //  close of an 'empty' tag: <foo />. We don't want that and we
                //  need to remain consistent between platforms, so we change
                //  those here as well.
                str = str.replace(/ \/>/g, '/>');

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }
        }

        return null;
    },
    'trident',
    function(aNode, wantsXMLDeclaration, shallow) {

        /**
         * @method nodeAsString
         * @summary Returns the string representation of aNode.
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
         *          TP.documentConstructElement(xmlDoc, 'bar', null));
         *          <samp>[object Element]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentConstructElement(xmlDoc, 'baz', ''));
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
         *          docFrag = TP.documentConstructFragment(xmlDoc);
         *          TP.nodeAppendChild(
         *          docFrag,
         *          TP.documentConstructElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAppendChld(
         *          docFrag,
         *          TP.documentConstructElement(xmlDoc, 'span',
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
         * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @exception TP.sig.SerializationException Raised when the serialization
         *     machinery encounters an error serializing the node.
         * @exception TP.sig.UnsupportedOperation Raised when a Node is supplied
         *     that this method doesn't know how to generate a string
         *     representation of. These include Nodes of type:
         *     Node.ENTITY_REFERENCE_NODE Node.ENTITY_NODE
         *     Node.NOTATION_NODE
         */

        var node,
            str,
            i;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode');
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

                //  IE11 has a bug where the XMLSerializer only serializes the
                //  first node in a DocumentFragment. To fix this, we just
                //  recurse and concat.
                str = '';
                for (i = 0; i < node.childNodes.length; i++) {
                    str += TP.nodeAsString(node.childNodes[i]);
                }

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }

            case Node.PROCESSING_INSTRUCTION_NODE:

                return '<?' + node.target + ' ' + node.data + '?>';

            case Node.COMMENT_NODE:

                return '<!--' + node.data + '-->';

            case Node.ENTITY_REFERENCE_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

            case Node.ENTITY_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

            case Node.DOCUMENT_TYPE_NODE:

                return '<!DOCTYPE ' + node.name +
                        ' PUBLIC ' + node.publicId + ' ' + node.systemId + '>';

            case Node.NOTATION_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

                /* eslint-disable no-fallthrough */

            case Node.DOCUMENT_NODE:

                //  No document element? Return the empty string.
                if (TP.notValid(node.documentElement)) {
                    return '';
                }

                //  Note here how we don't break, but continue falling
                //  through...

            case Node.ELEMENT_NODE:

                //  Note here how we don't break, but continue falling
                //  through...

            default:

                /* eslint-enable no-fallthrough */

                //  Try to serialize the node. If it fails, report an error.
                try {
                    str = (new XMLSerializer()).serializeToString(node);

                    //  IE's XMLSerializer insists on putting a space before the
                    //  close of an 'empty' tag: <foo />. We don't want that.
                    str = str.replace(/ \/>/g, '/>');

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
                                    TP.ec(e));
                        str = 'Serialization failed.';
                    }
                }

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }
        }

        return null;
    },
    TP.DEFAULT,
    function(aNode, wantsXMLDeclaration, shallow) {

        /**
         * @method nodeAsString
         * @summary Returns the string representation of aNode.
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
         *          TP.documentConstructElement(xmlDoc, 'bar', null));
         *          <samp>[object Element]</samp>
         *          TP.nodeAppendChild(
         *          xmlDoc.documentElement,
         *          TP.documentConstructElement(xmlDoc, 'baz', ''));
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
         *          docFrag = TP.documentConstructFragment(xmlDoc);
         *          TP.nodeAppendChild(
         *          docFrag,
         *          TP.documentConstructElement(xmlDoc, 'span',
         *         TP.w3.Xmlns.XHTML));
         *          TP.nodeAppendChld(
         *          docFrag,
         *          TP.documentConstructElement(xmlDoc, 'span',
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
         * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         * @exception TP.sig.SerializationException Raised when the serialization
         *     machinery encounters an error serializing the node.
         * @exception TP.sig.UnsupportedOperation Raised when a Node is supplied
         *     that this method doesn't know how to generate a string
         *     representation of. These include Nodes of type:
         *     Node.ENTITY_REFERENCE_NODE Node.ENTITY_NODE
         *     Node.NOTATION_NODE
         */

        var node,
            str;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode');
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

                try {
                    str = (new XMLSerializer()).serializeToString(node);
                } catch (e) {
                    TP.raise(this, 'TP.sig.SerializationException',
                                TP.ec(e));
                    str = 'Serialization failed.';
                }

                //  IE's XMLSerializer insists on putting a space before the
                //  close of an 'empty' tag: <foo />. We don't want that and we
                //  need to remain consistent between platforms, so we change
                //  those here as well.
                str = str.replace(/ \/>/g, '/>');

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }

            case Node.PROCESSING_INSTRUCTION_NODE:

                return '<?' + node.target + ' ' + node.data + '?>';

            case Node.COMMENT_NODE:

                return '<!--' + node.data + '-->';

            case Node.ENTITY_REFERENCE_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

            case Node.ENTITY_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

            case Node.DOCUMENT_TYPE_NODE:

                return '<!DOCTYPE ' + node.name +
                        ' PUBLIC ' + node.publicId + ' ' + node.systemId + '>';

            case Node.NOTATION_NODE:

                TP.raise(this, 'TP.sig.UnsupportedOperation');
                break;

                /* eslint-disable no-fallthrough */

            case Node.DOCUMENT_NODE:

                //  No document element? Return the empty string.
                if (TP.notValid(node.documentElement)) {
                    return '';
                }

                //  Note here how we don't break, but continue falling
                //  through...

            case Node.ELEMENT_NODE:

                //  Note here how we don't break, but continue falling
                //  through...

            default:

                /* eslint-enable no-fallthrough */

                //  Try to serialize the node. If it fails, report an error.
                try {
                    str = (new XMLSerializer()).serializeToString(node);

                    //  IE's XMLSerializer insists on putting a space before the
                    //  close of an 'empty' tag: <foo />. We don't want that and
                    //  we need to remain consistent between platforms, so we
                    //  change those here as well.
                    str = str.replace(/ \/>/g, '/>');

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
                                    TP.ec(e));
                        str = 'Serialization failed.';
                    }
                }

                //  If the node was originally an HTML node, then we need to
                //  make sure its return value is HTML
                if (TP.isHTMLNode(node)) {
                    return TP.stringAsHTMLString(str);
                } else {
                    return str;
                }
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
         * @method nodeCloneNode
         * @summary Clones a node, deeply if the 'deep' parameter is true.
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
         * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         */

        var shouldBeDeep,
            useString,
            newDoc,
            newDocElem;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode');
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
            newDoc = TP.constructDocument(null, 'nonsense');

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
         * @method nodeCloneNode
         * @summary Clones a node, deeply if the 'deep' parameter is true.
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
         * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
         *     the method.
         */

        var shouldBeDeep,
            useString;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode');
        }

        //  We can't clone an HTML document
        if (TP.isHTMLDocument(aNode)) {
            return null;
        }

        shouldBeDeep = TP.ifInvalid(deep, true);
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
    TP.sys.getBrowserUI,
    'gecko',
    function() {

        TP.regex.GECKO_XML_PARSE =
            /XML Parsing Error: ([^\n]+)\nLocation: [^\n]+\nLine Number (\d+), Column (\d+)/;

        return;
    },
    'trident',
    function() {

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
