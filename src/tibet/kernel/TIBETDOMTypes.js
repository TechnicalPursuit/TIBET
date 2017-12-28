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

//  ========================================================================
//  TP.core.Node
//  ========================================================================

/**
 * @summary General purpose Node object. This type provides a convenient
 *     wrapper around native DOM node instances. This allows TIBET methods to be
 *     used effectively on DOM nodes.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Node');

//  actual node instances returned are specialized on a number of factors
TP.core.Node.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('construct',
function(nodeSpec, varargs) {

    /**
     * @method construct
     * @summary Constructs a new instance to wrap a native node. The native
     *     node may have been provided or a String could have been provided . By
     *     far the most common usage is construction of a wrapper around an
     *     existing node.
     * @description This method takes two arguments. Depending on the validity
     *     and types of those arguments, various sorts of Node construction can
     *     happen:
     *
     *     Stage 1: Obtain a source node
     *
     *     - If nodeSpec is a TP.core.Node, it is simply returned and no
     *     further stages are processed.
     *
     *     - If nodeSpec is not valid, an attempt is made to construct a native
     *     node to use as the source object using the receiver's
     *     'constructNativeNode' method. As this type level, that method tries
     *     to use the built-in 'template' object (either a Node, URI or markup
     *     String) to construct a native node.
     *
     *     - If nodeSpec is a native node, it is kept as the source node.
     *
     *     - If nodeSpec is a TP.core.URI or a String that can be determined to
     *     be a URI, the resource TP.core.Node of that URI is fetched, cloned
     *     and returned. No further stages are processed.
     *
     *     - If nodeSpec is a String that can be determined to be only markup,
     *     a native node is made from that markup, and that node is recursively
     *     supplied to another call to this method.
     *
     *     - If nodeSpec is a non-markup String that ends with a colon (':'),
     *     then that String is treated as a 'namespace prefix' and an XML
     *     namespace URI is resolved from it. If that namespace has a default
     *     root element name associated with it, a native Element is built using
     *     that name and that element is recursively supplied to another call to
     *     this method.
     *
     *     - If nodeSpec is a non-markup String that can be resolved into a
     *     TIBET type name, then construct is invoked against that type, with
     *     a null as the first parameter and the other parameters supplied to
     *     this method. That type can then decide the best course of action for
     *     making instances of itself.
     *
     *     Stage 2: Process a source node
     *
     *     - If no varargs argument is supplied, then the supplied source node
     *     is wrapped in an instance of this type (i.e. this type's 'init'
     *     method is called) and that value is returned. - If a varargs argument
     *     is supplied and it is either a URI (or URI string) or a String, it
     *     (or its resource) is used as the template for performing a
     *     transformation using the source node as the source object to the
     *     transformation. If a third argument is supplied to this method, it is
     *     supplied to the transformation as a 'transform hash'. - If a varargs
     *     argument is supplied and it is a TP.core.Hash, then the source node
     *     is wrapped in an instance of this type (i.e. this type's 'init'
     *     method is called) and then '.setAttribute()' is called on it for each
     *     item in the TP.core.Hash. That value is then returned.
     *
     *
     * @param {Node|URI|String|TP.core.Node} nodeSpec Some suitable object to
     *     construct a source node. See type discussion above. Can also be null.
     * @param {Array} varargs Optional additional arguments for the
     *     constructor.
     * @returns {TP.core.Node} A new instance.
     */

    var node,
        newDoc,

        resp,
        template,
        str,
        uri,

        prefix,
        nsURI,
        defaultRootName,

        retVal,
        retType,

        inst,
        args,

        concreteInst;

    //  ---
    //  Node Construction
    //  ---

    if (!TP.isNode(node = nodeSpec)) {
        //  note that this will throw if receiver is abstract or if the node
        //  creation fails
        if (!TP.isNode(node = this.constructNativeNode())) {
            return;
        }
    }

    //  first phase is all about getting a valid native node to wrap either
    //  as input, or by working with the input in some fashion
    if (TP.isNode(node)) {

        //  If we got a real element that is detached and was created in a
        //  document, but not appended to it (as will happen with the
        //  TP.XML_FACTORY_DOCUMENT), then create a document and hang the node
        //  off of it.
        if (TP.isElement(node) &&
            !TP.nodeIsDetached(node) &&
            !TP.nodeContainsNode(node.ownerDocument, node)) {

            newDoc = TP.constructDocument();

            //  Note here how we use a 'low level' append child. That is
            //  because we don't want any 'importNode' or anything to be run
            //  here - we're simply trying to give the node a real document to
            //  be hung off of.
            newDoc.appendChild(node);
        }

        //  We only do this if varargs is either a URI (or URI String) or a
        //  String. If its a TP.core.Hash, it will be processed against a
        //  wrapped version of the node later in this method.
        if (TP.isValid(varargs) &&
            (TP.isURI(varargs) || TP.isString(varargs))) {

            args = varargs;

            if (TP.isURIString(args)) {
                args = TP.uc(args);
            }

            if (TP.isURI(args)) {
                resp = TP.uc(args).getResource(
                            TP.hc('async', false, 'resultType', TP.WRAP));
                template = resp.get('result');

                if (TP.isKindOf(template, 'TP.core.DocumentNode')) {
                    template.getDocumentElement().removeAttribute('id');
                } else if (TP.isKindOf(template, 'TP.core.ElementNode')) {
                    template.removeAttribute('id');
                }
            } else if (TP.isString(args)) {
                template = args;
            }

            str = TP.format(node, template, arguments[2]);

            //  NB: Make sure to not pass any other arguments besides the
            //  str in here - otherwise we recurse endlessly.
            retVal = this.construct(str);

            return retVal;
        }
    } else if (TP.isURIString(nodeSpec)) {

        uri = TP.uc(nodeSpec);
        resp = uri.getResource(TP.hc('async', false, 'resultType', TP.WRAP));

        if (!TP.isNode(retVal = resp.get('result'))) {
            return;
        }

        return retVal.clone(true);
    } else if (TP.isURI(nodeSpec)) {

        uri = nodeSpec;
        resp = uri.getResource(TP.hc('async', false, 'resultType', TP.WRAP));

        if (!TP.isNode(retVal = resp.get('result'))) {
            return;
        }

        return retVal.clone(true);
    } else if (TP.isString(nodeSpec)) {
        str = nodeSpec;

        //  If the nodeSpec is some kind of markup String, try to construct
        //  a Node from it
        if (TP.regex.XML_ALL_MARKUP.test(str)) {
            if (!TP.isNode(node = TP.nodeFromString(str))) {
                return;
            }

            retVal = node;
            retType = TP.core.Node.getConcreteType(node);
        } else {
            str = nodeSpec.trim();

            //  If it ends with a colon (':'), then it might have been a
            //  shorthand with only a namespace prefix. Look up to see if
            //  that prefix corresponds to a namespace URI that has a
            //  'default root element'. If so, join it together with the
            //  xmlns specified and try to construct a node from that.
            if (str.endsWith(':')) {
                prefix = str.slice(0, -1);

                if (TP.isEmpty(nsURI = TP.w3.Xmlns.getPrefixURI(prefix))) {
                    return;
                }

                if (TP.isEmpty(defaultRootName =
                            TP.w3.Xmlns.getRootElementName(nsURI))) {
                    return;
                }

                str = TP.join('<', str, defaultRootName, '/>');

                if (!TP.isElement(node = TP.nodeFromString(str))) {
                    return;
                }

                retVal = node;
            } else if (TP.isType(retType = TP.sys.getTypeByName(str))) {
                //  Set retVal to null, so that when we invoke construct
                //  against the retType (set above), it will be as if it was
                //  actually invoked with no nodeSpec and the machinery
                //  above will take over.
                retVal = null;
            }
        }

        /* eslint-disable consistent-this */
        if (!TP.isType(retType)) {
            retType = this;
        }
        /* eslint-enable consistent-this */

        switch (arguments.length) {
            case 0:
            case 1:
                return retType.construct(retVal);
            case 2:
                return retType.construct(retVal, varargs);
            default:
                args = TP.args(arguments);
                args.atPut(0, retVal);
                return retType.construct.apply(this, args);
        }
    } else if (TP.isKindOf(nodeSpec, 'TP.core.Node')) {
        //  it's already wrapped, return it
        return nodeSpec;
    } else {
        //  not valid alternatives for node content (yet)
        this.raise('TP.sig.InvalidParameter');

        return;
    }

    //  NOTE that we override construct here to ensure that all node types
    //  will perform the processing necessary to construct viable node
    //  content and register their instances correctly, but abstract types
    //  don't need to do that, they need to move as quickly as possible to
    //  the constructViaSubtype pathway.
    if (this.isAbstract()) {
        concreteInst = this.constructViaSubtype.apply(this, arguments);
    }

    //  ---
    //  Instance Construction
    //  ---

    //  If we're not an abstract type and therefore couldn't have executed
    //  constructViaSubtype above, see if the native node already has a pointer
    //  to a wrapper that was created for it.
    inst = node[TP.WRAPPER];
    if (TP.notValid(concreteInst) && TP.isValid(inst)) {
        return inst;
    }

    args = TP.args(arguments);
    args.atPut(0, node);

    //  If we are an abstract type and therefore executed constructViaSubtype
    //  above and actually got a real concrete instance, then use that as our
    //  instance.
    if (TP.isValid(concreteInst)) {
        inst = concreteInst;
    } else {
        inst = this.callNextMethod.apply(this, args);
    }

    //  If varargs is a TP.core.Hash and inst is an instance of some subtype
    //  of TP.core.ElementNode, then try to execute '.setAttribute()'
    //  against the new instance for each key in the hash.
    if (TP.isHash(varargs) &&
        TP.isKindOf(inst, 'TP.core.ElementNode')) {
        varargs.perform(
            function(kvPair) {
                inst.setAttribute(kvPair.first(), kvPair.last());
            });
    }

    //  Go ahead and put a reference to the wrapper onto the native node.
    node[TP.WRAPPER] = inst;

    //  Grab the *actual* type (the computed type above could've been a type
    //  cluster, etc.) and cache it on the node for fast access.
    node[TP.NODE_TYPE] = inst.getType();

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('constructNativeNode',
function() {

    /**
     * @method constructNativeNode
     * @summary Returns a node suitable for use as an instance of the receiver.
     * @returns {Node} A new native node, cloned from the receiver's template.
     */

    var template,

        uri,
        resp,
        retVal;

    if (this.isAbstract()) {
        this.raise('TP.sig.UnsupportedOperation',
                        'Cannot construct instance of abstract type.');

        return;
    }

    if (TP.notEmpty(template = this.get('template'))) {
        if (TP.isNode(template)) {
            return TP.nodeCloneNode(template, true);
        } else if (TP.isURIString(template)) {

            uri = TP.uc(template);
            resp = uri.getResource(TP.hc('async', false, 'resultType', TP.DOM));

            if (!TP.isNode(retVal = resp.get('result'))) {
                return;
            }

            return TP.nodeCloneNode(retVal, true);
        } else if (TP.isURI(template)) {

            uri = template;
            resp = uri.getResource(TP.hc('async', false, 'resultType', TP.DOM));

            if (!TP.isNode(retVal = resp.get('result'))) {
                return;
            }

            return TP.nodeCloneNode(retVal, true);
        } else if (TP.isString(template)) {
            return TP.elementFromString(template);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('fromNode',
function(aNode) {

    /**
     * @method fromNode
     * @summary Constructs and returns a new instance initialized using the
     *     node provided.
     * @param {Node} aNode A native node.
     * @returns {TP.core.Node} The newly constructed TP.core.Node.
     */

    return this.construct(aNode);
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('fromString',
function(aString, defaultNS, shouldReport) {

    /**
     * @method fromString
     * @summary Parses aString and returns a TP.core.Node wrapper around the
     *     string's root node representation.
     * @param {String} aString The source string to be parsed.
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
     * @exception TP.sig.DOMParseException
     * @returns {TP.core.Node} The newly constructed TP.core.Node.
     */

    var node;

    if (!TP.isDocument(
        node = TP.documentFromString(aString, defaultNS, shouldReport))) {
        return;
    }

    return this.fromNode(node);
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('fromTP_core_Node',
function(aNode) {

    /**
     * @method fromTP.core.Node
     * @summary Returns the TP.core.Node wrapper provided.
     * @param {TP.core.Node} aNode A wrapped node.
     * @returns {TP.core.Node} The supplied object.
     */

    return aNode;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('fromTP_sig_Signal',
function(aSignal) {

    /**
     * @method fromTP.sig.Signal
     * @summary Constructs and returns a new instance initialized using data in
     *     the signal provided.
     * @param {TP.sig.Signal} aSignal The signal instance to construct a handler
     *     instance for.
     * @returns {TP.core.Node} The newly constructed TP.core.Node.
     */

    var inst,
        listener,
        observer;

    listener = aSignal.get('listener');
    if (TP.notValid(listener)) {
        return this.callNextMethod();
    }

    observer = TP.elementGetAttribute(listener, 'observer');
    if (TP.notValid(observer)) {
        return this.callNextMethod();
    }

    //  this should go off to TIBET and try to find a proper node type based
    //  on the tag name information
    inst = TP.bySystemId(observer);

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('fromTP_core_URI',
function(aURI, shouldReport) {

    /**
     * @method fromTP.core.URI
     * @summary Returns a new instance of the receiver, constructed around the
     *     DOM content of the URI provided. Note that the URI must point to XML
     *     data for this call to succeed.
     * @param {TP.core.URI} aURI A URI referencing XML content.
     * @param {Boolean} shouldReport False to turn off exception reporting so
     *     strings can be tested for XML compliance without causing exceptions
     *     to be thrown. This is true by default.
     * @exception TP.sig.DOMParseException
     * @returns {TP.core.Node} The newly constructed TP.core.Node.
     */

    var resp,
        content;

    if (TP.notValid(aURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  this will return a TP.core.Node if at all possible
    resp = aURI.getResource(
                TP.hc('async', false, 'resultType', TP.DOM));
    content = TP.wrap(resp.get('result'));

    if (TP.isKindOf(content, TP.core.Node)) {
        return content;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('getCanonicalPrefix',
function(aNode) {

    /**
     * @method getCanonicalPrefix
     * @summary Returns the canonical prefix for the namepaceURI of the node.
     *     If the node does not show itself as having a namespaceURI then the
     *     prefix returned is the empty string.
     * @param {Node|TP.core.Node} aNode The node whose canonical prefix should
     *     be returned.
     * @returns {String} The canonical prefix, if found.
     */

    var node,
        ns,
        prefix;

    //  In case aNode was a TP.core.Node.
    node = TP.unwrap(aNode);

    if (TP.isDocument(node)) {
        if (!TP.isDocument(node.documentElement)) {
            return '';
        }

        node = node.documentElement;
    }

    if (TP.notEmpty(ns = TP.nodeGetNSURI(node))) {
        prefix = TP.w3.Xmlns.getCanonicalPrefix(ns);
    }

    return TP.ifEmpty(prefix, '');
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided.
     * @param {Node} aNode The native node to wrap.
     * @exception TP.sig.InvalidNode
     * @returns {TP.lang.RootObject.<TP.core.Node>} A TP.core.Node subtype type
     *     object.
     */

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode',
                            'No node provided.');
    }

    switch (aNode.nodeType) {
        case Node.ELEMENT_NODE:

            return TP.core.ElementNode.getConcreteType(aNode);

        case Node.DOCUMENT_NODE:

            return TP.core.DocumentNode.getConcreteType(aNode);

        case Node.DOCUMENT_FRAGMENT_NODE:

            return TP.core.DocumentFragmentNode;

        case Node.ATTRIBUTE_NODE:

            return TP.core.AttributeNode.getConcreteType(aNode);

        case Node.TEXT_NODE:

            return TP.core.TextNode;

        case Node.CDATA_SECTION_NODE:

            return TP.core.CDATASectionNode;

        case Node.PROCESSING_INSTRUCTION_NODE:

            return TP.core.ProcessingInstructionNode.getConcreteType(aNode);

        case Node.ENTITY_REFERENCE_NODE:

            return TP.core.EntityReferenceNode;

        case Node.ENTITY_NODE:

            return TP.core.EntityNode;

        case Node.COMMENT_NODE:

            return TP.core.CommentNode;

        case Node.DOCUMENT_TYPE_NODE:

            return TP.core.DocumentTypeNode;

        case Node.NOTATION_NODE:

            return TP.core.NotationNode;

        default:
            return this.raise('TP.sig.InvalidNode',
                                'Unable to determine node type.');
    }
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('getContentLanguage',
function(aNode) {

    /**
     * @method getContentLanguage
     * @summary Returns the node's xml:lang value, or the current default
     *     language if no xml:lang specification is found in the node's parent
     *     chain.
     * @param {Node|TP.core.Node} aNode The node whose content language should
     *     be returned.
     * @returns {String} The node's content language.
     */

    var node,
        lang;

    //  In case aNode was a TP.core.Node.
    node = TP.unwrap(aNode);

    if (TP.isDocument(node)) {
        if (!TP.isDocument(node.documentElement)) {
            return '';
        }

        node = node.documentElement;
    }

    //  iterate upward until we run out of elements to test
    while (TP.isElement(node)) {
        if (TP.notEmpty(lang = TP.elementGetAttribute(node,
                                                        'xml:lang',
                                                        true))) {
            break;
        }

        node = node.parentNode;
    }

    return TP.ifEmpty(lang, TP.sys.env('tibet.xmllang', 'en-us')).
                                                            toLowerCase();
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('getContentMIMEType',
function(aNode) {

    /**
     * @method getContentMIMEType
     * @summary Returns the node's "content MIME type", the MIME type the node
     *     can render most effectively. This information is drawn from the
     *     namespaceURI of the node in most cases. The mappings between
     *     namespace URIs and MIME types are found in the XMLNS 'info' hash.
     * @param {Node|TP.core.Node} aNode The node whose content mime type should
     *     be returned.
     * @returns {String} The node's content MIME type.
     */

    var node,
        ns,
        mime;

    //  In case aNode was a TP.core.Node.
    node = TP.unwrap(aNode);

    //  this works off URI and root element information to try to give us a
    //  best guess
    if (TP.isDocument(node)) {
        return TP.core.Node.getDocumentMIMEType(node);
    }

    //  if not a document we can still try to use the XMLNS data
    if (TP.notEmpty(ns = TP.nodeGetNSURI(node))) {
        mime = TP.w3.Xmlns.getMIMEType(ns);
    }

    //  TODO:   do we want pure XML here?
    return TP.ifEmpty(mime, TP.ietf.Mime.XHTML);
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('getDocumentMIMEType',
function(aNode) {

    /**
     * @method getDocumentMIMEType
     * @summary Returns the MIME type of the document containing the node
     *     provided. This method is used to help determine which subtype of
     *     TP.core.DocumentNode to use when creating new document wrappers but
     *     can be useful in other contexts as well.
     * @param {Node} aNode The node whose document mime type should be returned.
     * @exception TP.sig.InvalidDocument
     * @returns {String} The MIME type to be used as a render type for this tag.
     */

    var node,

        doc,
        docElement,

        ns,
        info,
        mimeType,
        nodeName;

    //  In case aNode was a TP.core.Node.
    node = TP.unwrap(aNode);

    doc = TP.nodeGetDocument(node);
    if (!TP.isDocument(doc)) {
        return this.raise('TP.sig.InvalidDocument',
                            'Unable to determine node\'s document.');
    }

    //  empty document? either TP.ietf.Mime.PLAIN or TP.ietf.Mime.XML
    if (!TP.isElement(docElement = doc.documentElement)) {
        if (TP.isXMLDocument(doc)) {
            return TP.ietf.Mime.XML;
        } else {
            return TP.ietf.Mime.PLAIN;
        }
    }

    if (!TP.isXMLDocument(doc)) {
        //  TODO:   handle META instructions and/or DOCTYPES here
        if (docElement.nodeName.toLowerCase() === 'html') {
            return TP.ietf.Mime.HTML;
        } else {
            return TP.ietf.Mime.PLAIN;
        }
    }

    //  most accurate is to work from the namespaceURI if found/registered
    if (TP.notEmpty(ns = TP.nodeGetNSURI(docElement))) {
        if (TP.isValid(info = TP.w3.Xmlns.get('info').at(ns))) {
            mimeType = info.at('mimetype');
        }
    } else {
        //  second chance is that we find a canonical root element name
        nodeName = TP.elementGetLocalName(docElement);
        info = TP.w3.Xmlns.get('info').detect(
                function(item) {

                    return item.last().at('rootElement') === nodeName;
                });

        if (TP.isValid(info)) {
            mimeType = info.last().at('mimetype');
        }
    }

    return TP.ifInvalid(mimeType, TP.ietf.Mime.XML);
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('getNSURI',
function() {

    /**
     * @method getNSURI
     * @summary Returns the namespaceURI of the receiver. This is computed from
     *     the receiver's prefix, so the prefix and namespace *must* be
     *     registered in TIBET's central registry.
     * @returns {String} A namespace URI or the empty string.
     */

    return TP.w3.Xmlns.getPrefixURI(this.get('nsPrefix'));
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('getQueryPath',
function() {

    /**
     * @method getQueryPath
     * @summary Returns the 'query path' that can be used in calls such as
     *     'nodeEvaluatePath' to obtain all of the occurrences of the receiver
     *     in a document.
     * @returns {String} The path that can be used to query for Nodes of this
     *     type.
     */

    //  At this level, we return the empty String.
    return '';
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('generatedNode',
function(aNode) {

    /**
     * @method generatedNode
     * @summary Returns whether or not the receiver generated the supplied Node.
     * @param {Node} aNode The node to check for a generator.
     * @returns {Boolean} True when the receiver is the generator for the
     *     supplied Node.
     */

    var generatorName,
        generatorType;

    generatorName = aNode[TP.GENERATOR];
    if (TP.isEmpty(generatorName)) {
        return false;
    }

    generatorType = TP.sys.getTypeByName(generatorName);
    if (!TP.isType(generatorType)) {
        return false;
    }

    return generatorType === this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('isResponderFor',
function(aNode, aSignal) {

    /**
     * @method isResponderFor
     * @summary Returns true if the type in question should be considered a
     *     responder for the specific node/signal pair provided.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    var signames,

        fname,
        len,
        i,

        desc,
        tpNode;

    if (TP.isValid(aSignal)) {
        signames = aSignal.getSignalNames();
    } else {
        signames = TP.ac('Signal');
    }

    //  Convert all the signal names to simple form (making sure they're
    //  canonical).
    signames = signames.map(
                function(name) {
                    //  Expand first to make sure signal name is prefixed, if
                    //  necessary, but then contract that. This gives canonical
                    //  results.
                    return TP.contractSignalName(TP.expandSignalName(name));
                });

    //  Iterate over all of the signal names and check to see if they respond to
    //  a type method of 'isResponderFor' + the signal name.
    len = signames.getSize();
    for (i = 0; i < len; i++) {
        fname = 'isResponderFor' + signames.at(i);
        if (TP.canInvoke(this, fname)) {
            return this[fname](aNode, aSignal);
        }
    }

    //  If we couldn't find an 'isResponderFor' method, see if the target node
    //  has an instance handler method. If it does, then consider ourself to be
    //  a responder for that signal.

    if (TP.isValid(aSignal)) {
        desc = {
            signal: aSignal,
            //  TODO: determine why we thought this was a good idea. It's
            //  commented out because it means many on: scenarios will fail.
            // dontTraverseSpoofs: true,   //  We're not interested in spoofs
            phase: '*'                  //  We want handler methods of any phase
                                        //  since all we're doing is returning a
                                        //  Boolean.
        };

        tpNode = TP.wrap(aNode);

        if (TP.isCallable(tpNode.getBestHandler(aSignal, desc))) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('populateSubstitutionInfo',
function(aRequest) {

    /**
     * @method populateSubstitutionInfo
     * @summary Populates a hash of substitution information.
     * @description This method populates the following variables into a hash
     *     that it returns, useful for executing substitutions.
     *
     *          TP          ->  The TP root.
     *          APP         ->  The APP root.
     *          $REQUEST    ->  The request that triggered this processing.
     *          $TAG        ->  The TP.core.ElementNode that contains this text
     *                          node.
     *          $TARGET     ->  The target TP.core.DocumentNode, if any, that
     *                          the result of this processing will be rendered
     *                          into.
     *          $SOURCE     ->  The original source tag, if this is being
     *                          processed as part of a nested template.
     *          $SELECTION  ->  The current selection. This could be text or an
     *                          Array of objects determined by the selection
     *                          manager.
     *          $*          ->  An alias for $SELECTION
     *          $FOCUS      ->  The currently focused TP.core.ElementNode in the
     *                          target TP.core.DocumentNode.
     *          $@          ->  An alias for $FOCUS
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {TP.core.Hash} The hash containing the substitution info as
     *     detailed in the description.
     */

    var node,
        parentNode,

        selectionFunc,
        focusFunc,

        sources,
        source,

        info;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(node = aRequest.at('node'))) {
        return;
    }

    if (TP.isAttributeNode(node)) {
        parentNode = TP.attributeGetOwnerElement(node);
    } else {
        parentNode = node.parentNode;
    }

    selectionFunc = function() {

        var targetTPDoc;

        if (TP.isValid(targetTPDoc = aRequest.at('target'))) {
            return TP.wrap(
                    TP.documentGetSelectionText(
                        TP.unwrap(targetTPDoc)));
        }
    };

    focusFunc = function() {

        var targetTPDoc;

        if (TP.isValid(targetTPDoc = aRequest.at('target'))) {
            return TP.wrap(
                    TP.documentGetFocusedElement(
                        TP.unwrap(targetTPDoc)));
        }
    };

    if (TP.notEmpty(sources = aRequest.at('sources'))) {
        source = sources.last();
    }

    info = TP.hc(
        '$REQUEST', aRequest,
        'TP', TP,
        'APP', APP,
        '$TAG', TP.wrap(parentNode),
        '$TARGET', aRequest.at('target'),
        '$SOURCE', TP.wrap(source),
        '$SELECTION', selectionFunc,
        '$*', selectionFunc,            //  Alias for $SELECTION
        '$FOCUS', focusFunc,
        '$@', focusFunc                 //  Alias for $FOCUS
        );

    return info;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('shouldWrapACPOutput',
function() {

    /**
     * @method shouldWrapACPOutput
     * @summary Whether or not we should wrap ACP expression output in an XHTML
     *     span element. The default is true, but some subtypes that allow ACP
     *     in their embedded templates might choose to not generate these
     *     wrapper spans.
     * @returns {Boolean} Whether or not to wrap it.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('tagPrecompile',
function(aRequest) {

    /**
     * @method tagPrecompile
     * @summary Precompiles the content by running any substitution expressions
     *     in it.
     * @description At this level, this method runs substitutions against the
     *     text content of the node (and the text content of any attributes) and
     *     supplies the following variables to the substitutions expressions:
     *
     *          TP         ->  The TP root.
     *          APP        ->  The APP root.
     *          $REQUEST    ->  The request that triggered this processing.
     *          $TAG        ->  The TP.core.ElementNode that is being processed.
     *          $TARGET     ->  The target TP.core.DocumentNode, if any, that
     *                          the result of this processing will be rendered
     *                          into.
     *          $SOURCE     ->  The original source tag, if this is being
     *                          processed as part of a nested template.
     *          $SELECTION  ->  The current selection. This could be text or an
     *                          Array of objects determined by the selection
     *                          manager.
     *          $*          ->  An alias for $SELECTION
     *          $FOCUS      ->  The currently focused TP.core.ElementNode in the
     *                          target TP.core.DocumentNode.
     *          $@          ->  An alias for $FOCUS
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        tpNode,

        info,

        str,

        result,
        elem,
        frag,

        attrs,
        len,
        j;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(node = aRequest.at('node'))) {
        return;
    }

    //  Wrap it so that when we ask for its text content, we're getting the best
    //  representation.
    tpNode = TP.wrap(node);

    //  Populate the substitution information with various variables, etc.
    info = this.populateSubstitutionInfo(aRequest);

    //  The $TAG will have been set to our parent node (the default behavior of
    //  the call above), so we need to set it to the wrapper currently
    //  processing node.
    info.atPut('$TAG', tpNode);

    info.atPut('shouldEcho', false);
    info.atPut('annotateMarkup', this.shouldWrapACPOutput());

    //  Grab the best representation text. This may contain ACP templating
    //  expressions.
    str = tpNode.getContent();

    //  Run a transform on it.
    result = str.transform(tpNode, info);

    //  If the result contains 'element' markup (and does *not* contain more
    //  ACP expressions), then try to create a Fragment from it and use that
    //  to replace the node.
    if (!TP.regex.HAS_ACP.test(result) &&
        TP.regex.CONTAINS_ELEM_MARKUP.test(result)) {

        elem = TP.elem('<root>' + result + '</root>',
                        TP.w3.Xmlns.XHTML,
                        false);

        //  Note that we convert into a DocumentFragment here since the
        //  transformed String may contain multiple peer nodes (although we were
        //  able to parse it due to wrapping it into Element markup above -- but
        //  that's not the 'real' markup).
        frag = TP.nodeListAsFragment(elem.childNodes);

        //  This will check for either Elements or DocumentFragments (and
        //  Documents, too, which is invalid here but highly unlikely).
        if (TP.isCollectionNode(frag)) {
            TP.elementSetContent(node, frag, null, false);
        }
    } else if (TP.notEmpty(result)) {
        //  Otherwise, it was just a straight templated value (or it
        //  contained further ACP templating expressions) - just set the
        //  original node's text content.
        tpNode.setTextContent(result);
    }

    //  Process the attribute text.
    attrs = TP.elementGetAttributeNodes(node);

    len = attrs.getSize();
    for (j = 0; j < len; j++) {
        //  Grab the text content of the Attribute node.
        str = TP.nodeGetTextContent(attrs.at(j));
        if (TP.regex.HAS_ACP.test(str)) {
            //  Run a transform on it.
            TP.nodeSetTextContent(
                attrs.at(j),
                str.transform(TP.wrap(attrs.at(j)), info));
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Performs any 'detach' logic when the node is detached from its
     *     owning document.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        id,

        uri;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(node = aRequest.at('node'))) {
        return;
    }

    id = TP.gid(node);

    if (TP.isURI(uri = TP.core.URI.getInstanceById(id))) {
        uri.clearCaches();
        TP.core.URI.removeInstance(uri);
    }

    //  Setting these to null is better for many VMs than using 'delete'.
    node[TP.WRAPPER] = null;
    node[TP.NODE_TYPE] = null;

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  should the receiver flag changes, i.e. mark elements with 'crud'
//  metadata in addition to or in lieu of actually altering markup
TP.core.Node.Inst.defineAttribute('changeFlagging', false);

//  whether the node has been 'dirtied' or altered since loading
TP.core.Node.Inst.defineAttribute('dirty', false);

//  the wrapped node when only one node is being managed
TP.core.Node.Inst.defineAttribute('node');

//  flag for whether this instance can be reused. typically yes.
TP.core.Node.Inst.defineAttribute('recyclable', true);

//  what phase is the node at in terms of content processing? we start at
//  'UNPROCESSED' for new nodes
TP.core.Node.Inst.defineAttribute('phase', 'UNPROCESSED');

//  when loaded via a TP.core.URI this will hold the URI's 'uri' string as a
//  backlink the node can use to get to the original URI instance.
TP.core.Node.Inst.defineAttribute('uri');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.core.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.core.Node} The initialized instance.
     */

    this.callNextMethod();

    if (TP.isNode(aNode)) {
        this.$set('node', aNode, false);
    } else {
        return this.raise('TP.sig.InvalidParameter');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('addContent',
function(aContentObject, aRequest) {

    /**
     * @method addContent
     * @summary Adds the value supplied to the content of the receiver's native
     *     DOM counterpart.
     * @description At this level, this method merely sets adds to the text
     *     content of the node what is produced by executing the
     *     'produceContent' on the supplied content object. Subtypes should
     *     override this method to provide a more specific version of this.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     */

    var content;

    content = TP.str(this.getContent());

    content += TP.str(this.produceContent(aContentObject, aRequest));

    this.setTextContent(content);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns a "dump string", which is typically what is used by the
     *     TIBET logs when writing out an object.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A String suitable for log output.
     */

    var nativeNode;

    nativeNode = this.getNativeNode();

    return '[' + TP.tname(this) + ' (' + TP.tname(nativeNode) + ')' +
                    ' :: ' + this.asString() + ']';
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asHTMLNode',
function(aDocument) {

    /**
     * @method asHTMLNode
     * @summary Returns an HTML node built from the receiver's content. This
     *     may involve rebuilding the node in an HTML document provided for the
     *     purpose of the conversion. The result node will have non-compatible
     *     constructs removed.
     * @param {HTMLDocument} aDocument An HTML Document to use as the owner
     *     document.
     * @returns {Node} An HTML node.
     */

    var doc;

    doc = TP.isHTMLDocument(aDocument) ?
                    aDocument : this.getNativeDocument();

    return TP.nodeAsHTMLNode(this.getNativeNode(), doc);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Returns an HTML string built from the receiver. The result will
     *     have any non-compatible constructs removed.
     * @returns {String} An HTML string.
     */

    return TP.nodeAsHTMLString(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asJSONSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '{"type":' + TP.tname(this).quoted('"') + ',' +
                '"data":' + TP.jsonsrc(this.getNativeNode()) + '}';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asObject',
function() {

    /**
     * @method asObject
     * @summary Returns a 'plain JavaScript object' version of the receiver.
     *     This uses the JXON standard to convert the receiver's DOM structure
     *     to one or more JavaScript objects.
     * @returns {Object} The receiver as a plain JavaScript object.
     */

    if (TP.isPrototype(this)) {
        return;
    }

    return TP.xml2js(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('toJSON',
function() {

    /**
     * @method toJSON
     * @summary Returns the object to use in JSON representations.
     * @returns {Object} The object to use in a JSON representation.
     */

    return this.asObject();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var nativeNode;

    nativeNode = this.getNativeNode();

    return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        TP.tname(nativeNode) +
                    '</dd>' +
                    '<dt class="pretty key">Content</dt>' +
                    '<dd class="pretty value">' +
                        TP.pretty(nativeNode) +
                    '</dd>' +
                    '</dl>';
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return 'TP.tpnode(\'' + this.asString() + '\')';
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns a basic string representation of the receiver. For
     *     TP.core.Nodes this is the serialized string representation of the
     *     native node content.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.Node's String representation. The verbose
     *     representation will contain an XML declaration (if the receiver is
     *     an XML document). Both verbose and non-verbose representations will
     *     also contain all of the child content. The default is true.
     * @returns {String} The receiver as a String.
     */

    var nativeNode,
        wantsVerbose,
        str;

    nativeNode = this.getNativeNode();

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        //  NB: The defaults here are 'false' and 'false' to not product an XML
        //  declaration and to not be 'shallow' (include all of the child
        //  content).
        return TP.nodeAsString(nativeNode);
    }

    try {

        if (TP.isDocument(nativeNode)) {
            //  NB: The parameters to TP.nodeAsString() here tell it to produce
            //  an XML declaration and to not be 'shallow' (i.e. produce all
            //  child content).
            str = TP.nodeAsString(nativeNode, true, false);
        } else {
            //  NB: The parameters to TP.nodeAsString() here tell it to not
            //  produce an XML declaration and to not be 'shallow' (i.e.
            //  produce all child content).
            str = TP.nodeAsString(nativeNode, false, false);
        }

    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asXHTMLNode',
function() {

    /**
     * @method asXHTMLNode
     * @summary Returns an XHTML node built from the receiver.
     * @description The emphasis here on XHTML, implying that the return value
     *     is an XML node, not an HTML node. Also note that since it's XML the
     *     resulting node may have content in other namespaces. Use
     *     TP.nodePurifyXMLNS() to remove all non-XHTML content, or
     *     TP.nodeRemoveXMLNS() to remove single namespace content.
     * @returns {Node} An XML node containing XHTML content.
     */

    //  We assume that we're (at least partially) an XHTML node.
    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asXHTMLString',
function() {

    /**
     * @method asXHTMLString
     * @summary Returns an XHTML string built from the receiver.
     * @returns {String} A properly formed XHTML string.
     */

    //  We assume that we're (at least partially) an XHTML node.
    return this.asString();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asXMLNode',
function(aDocument) {

    /**
     * @method asXMLNode
     * @summary Returns an XML node built from the receiver if possible.
     * @param {XMLDocument} aDocument An XML Document to use as the owner
     *     document.
     * @returns {Node} An XML node.
     */

    var doc;

    doc = TP.isXMLDocument(aDocument) ?
                aDocument : this.getNativeDocument();

    return TP.nodeAsXMLNode(this.getNativeNode(), doc);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asXMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '<instance type="' + TP.tname(this) + '">' +
                    TP.xmlstr(this.getNativeNode()) +
                    '</instance>';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('detach',
function() {

    /**
     * @method detach
     * @summary Removes the receiver from its parent.
     * @returns {Boolean} Whether or not the supplied node is equal to the
     *     receiver.
     * @returns {TP.core.Node} The detached node.
     */

    var node;

    node = this.getNativeNode();

    return TP.wrap(TP.nodeDetach(node));
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.core.Node} A copy of the receiver.
     */

    var natNode,
        newNatNode;

    natNode = this.getNativeNode();

    newNatNode = TP.copy(natNode);

    return this.getType().fromNode(newNatNode);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('equalTo',
function(aNode) {

    /**
     * @method equalTo
     * @summary Returns whether the supplied node is 'equal to' the receiver.
     * @description This method follows the DOM Level 3 standard for
     *     checking Nodes for equality with each other. This specification
     *     states that two Nodes are equal if:
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
     * @param {TP.core.Node|Node} aNode The TP.core.Node or Node to use in the
     *     comparison.
     * @exception TP.sig.InvalidNode
     * @returns {Boolean} Whether or not the supplied node is equal to the
     *     receiver.
     */

    var otherNode;

    otherNode = TP.unwrap(aNode);
    if (!TP.isNode(otherNode)) {
        return false;
    }

    return TP.nodeEqualsNode(this.getNativeNode(), otherNode);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getAncestorPositions',
function(includeNode, aPrefix, joinChar) {

    /**
     * @method getAncestorPositions
     * @summary Returns an array of position strings for the receiver's
     *     ancestors. If the includeNode flag is true then the list starts with
     *     the receiver's position, otherwise the first entry represents the
     *     receiver's parentNode position.
     * @param {Boolean} includeNode True to include the receiver's position in
     *     the list. Default is false.
     * @param {String} aPrefix An optional prefix, usually a document location
     *     which allows the positions to be canvas and document specific for
     *     observations.
     * @param {String} joinChar A character to use when joining the index parts.
     *     Default is '.'.
     * @returns {Array} An array of position strings.
     */

    return TP.nodeGetAncestorPositions(this.getNativeNode(),
                                        aPrefix,
                                        joinChar);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getCanonicalPrefix',
function() {

    /**
     * @method getCanonicalPrefix
     * @summary Returns the canonical prefix for the namepaceURI of the
     *     receiver. If the receiver does not show itself as having a
     *     namespaceURI then the prefix returned is the empty string.
     * @returns {String} The prefix, if found.
     */

    return TP.core.Node.getCanonicalPrefix(this);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getCanvasID',
function() {

    /**
     * @method getCanvasID
     * @summary Returns the receiver's canvas ID, the ID of the canvas in which
     *     it resides. This is typically synonymous with the ID of the
     *     receiver's window or frame. When no canvas ID can be found this
     *     method returns the empty string.
     * @returns {String} The canvas ID, if found, or the empty string.
     */

    var win;

    win = this.getWindow();
    if (TP.isValid(win)) {
        return win.getCanvasID();
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @method getContent
     * @summary Returns the receiver's content.
     * @description At this level, this method merely returns the text content
     *     of its native node. Subtypes should override this method to provide a
     *     more specific version of this.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {String} The text content of the native node.
     */

    return this.getTextContent();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getContentNode',
function(aRequest) {

    /**
     * @method getContentNode
     * @summary Returns the receiver's native node. This method is provided for
     *     API compatibility with other types.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {Node} A native node.
     */

    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getContentText',
function(aRequest) {

    /**
     * @method getContentText
     * @summary Returns the receiver's content in text form. This method is
     *     provided for API compatibility with other types.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {String} The receiver's content as a String.
     */

    return this.getTextContent();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getContentLanguage',
function() {

    /**
     * @method getContentLanguage
     * @summary Returns the receiver's xml:lang value, or the current default
     *     language if no xml:lang specification is found in the receiver's
     *     parent chain.
     * @returns {String} The receiver's content language.
     */

    return TP.core.Node.getContentLanguage(this);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getContentLanguage',
function() {

    /**
     * @method getContentLanguage
     * @summary Returns the receiver's xml:lang value, or the current default
     *     language if no xml:lang specification is found in the receiver's
     *     parent chain.
     * @returns {String} The receiver's content language.
     */

    return TP.core.Node.getContentLanguage(this);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getContentMIMEType',
function() {

    /**
     * @method getContentMIMEType
     * @summary Returns the receiver's "content MIME type", the MIME type the
     *     receiver can render most effectively. This information is drawn from
     *     the namespaceURI of the receiver in most cases. The mappings between
     *     namespace URIs and MIME types are found in the XMLNS 'info' hash.
     * @returns {String} The receiver's content MIME type.
     */

    return TP.core.Node.getContentMIMEType(this);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getDocument',
function() {

    /**
     * @method getDocument
     * @summary Returns the receiver's TIBET document wrapper. This method will
     *     attempt to get the uniqued version provided via TP.core.Window, which
     *     encaches its document instance to avoid duplication. If the document
     *     isn't visible this method will return a new TP.core.DocumentNode
     *     wrapper.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.DocumentNode} The receiver's document.
     */

    var node,
        doc;

    //  we're after the real document, not the document of some clone, so
    //  we preserve changes here
    node = this.getNativeNode();

    doc = TP.nodeGetDocument(node);
    if (!TP.isDocument(doc)) {
        return this.raise('TP.sig.InvalidDocument',
                            'Unable to determine node\'s document.');
    }

    return TP.wrap(doc);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getDocumentPosition',
function(joinChar) {

    /**
     * @method getDocumentPosition
     * @summary Returns a 0-indexed position generated for the receiver within
     *     the document. This position is unique within the receiver's document
     *     and can be used for positioning comparison purposes with other nodes.
     * @param {String} joinChar A character to use when joining the index parts.
     *     Default is '.'.
     * @returns {String} The index or TP.NOT_FOUND.
     */

    return TP.nodeGetDocumentPosition(this.getNativeNode(), joinChar);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getDocumentMIMEType',
function() {

    /**
     * @method getDocumentMIMEType
     * @summary Returns the MIME type of the document containing the node.
     * @returns {String} The MIME type of the receiver's node.
     */

    //  we're after the real document, not the document of some clone, so
    //  we preserve changes here
    return TP.core.Node.getDocumentMIMEType(this);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getGlobalID',
function(assignIfAbsent) {

    /**
     * @method getGlobalID
     * @summary Returns the global ID (a TIBET URI) of the receiver.
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The global ID of the receiver.
     */

    return TP.gid(this.getNativeNode(), assignIfAbsent);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getID',
function() {

    /**
     * @method getID
     * @summary Returns the public ID of the receiver.
     * @returns {String} The public ID of the receiver.
     */

    //  Make sure that, if the receiver is a prototype, we just return the value
    //  of the TP.ID slot. Otherwise, we're trying to get an ID from an object
    //  that represents only a partially formed instance for this type.
    if (TP.isPrototype(this)) {
        return this[TP.ID];
    }

    return TP.gid(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getIndexInParent',
function() {

    /**
     * @method getIndexInParent
     * @summary Returns the index in this node's *parent node's* childNodes
     *     array for the receiver.
     * @returns {Number} The index number, or TP.NOT_FOUND.
     */

    var node,
        parentNode;

    node = this.getNativeNode();
    parentNode = node.parentNode;

    return TP.nodeGetChildIndex(parentNode, node);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getLocalID',
function(assignIfAbsent) {

    /**
     * @method getLocalID
     * @summary Returns the local ID of the element, the ID of the node as
     *     defined in the document it resides in. Since this value isn't unique
     *     across documents it's considered a "local ID".
     * @param {Boolean} assignIfAbsent True if an ID should be assigned when one
     *     isn't present. Default is false.
     * @returns {String} The local ID of the receiver.
     */

    return TP.lid(this.getNativeNode(), assignIfAbsent);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getLocalName',
function() {

    /**
     * @method getLocalName
     * @summary Returns the local (or base) name of the receiver. This method
     *     is only truly valid for elements and attributes (although documents
     *     will return 'document'), so the default version returns an
     *     TP.sig.InvalidOperation exception.
     * @exception TP.sig.InvalidOperation
     * @returns {String} The local name of the receiver.
     */

    return this.raise('TP.sig.InvalidOperation');
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getLocation',
function() {

    /**
     * @method getLocation
     * @summary Returns the location of the node's associated URI, if the node
     *     was loaded on behalf of a URI.
     * @returns {String} The location of the receiver's URI.
     */

    var url;

    url = this.get('uri');
    if (TP.isURIString(url)) {
        return TP.uc(url).getLocation();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getParentNode',
function() {

    /**
     * @method getParentNode
     * @summary Returns a TP.core.Node wrapping the parent node of the receiver.
     * @returns {TP.core.Node} The parent node of the receiver.
     */

    return TP.wrap(this.getNativeNode().parentNode);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getOuterContent',
function(aRequest) {

    /**
     * @method getOuterContent
     * @summary Returns the receiver's 'outer' content - that is, its entire
     *     representation, including any childNode representations.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {String} The outer content of the native node.
     */

    //  For most nodes, this is the same as asString().
    return this.asString();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getMIMEType',
function() {

    /**
     * @method getMIMEType
     * @summary Returns a best-guess MIME type for the receiver, first trying
     *     to acquire it from the receiver's URI if it has one, then via the
     *     receiver's document.
     * @returns {String} The MIME type of the receiver.
     */

    var url;

    if (TP.isURI(url = this.get('uri'))) {
        return TP.uc(url).getMIMEType();
    }

    return this.getDocumentMIMEType();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getName',
function() {

    /**
     * @method getName
     * @summary Returns the receiver's name, if it exists.
     * @returns {String} The public name of the receiver.
     */

    return TP.name(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getNativeDocument',
function() {

    /**
     * @method getNativeDocument
     * @summary Returns the document object containing the receiver.
     * @returns {Document} The document containing the receiver.
     */

    return TP.nodeGetDocument(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getNativeNode',
function() {

    /**
     * @method getNativeNode
     * @summary Returns the receiver's native DOM node object.
     * @returns {Node} The receiver's native DOM node.
     */

    return this.$get('node');
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @method getNativeObject
     * @summary Returns the native object that the receiver is wrapping. In the
     *     case of TP.core.Nodes, this is the receiver's native node.
     * @returns {Node} The receiver's native object.
     */

    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getNativeWindow',
function() {

    /**
     * @method getNativeWindow
     * @summary Returns the document's native window object.
     * @returns {Window} The receiver's document's native window object.
     */

    //  we're after the real document, not the document of some clone, so
    //  we preserve changes here
    return TP.nodeGetWindow(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getNSPrefixes',
function(aNamespaceURI, includeDescendants) {

    /**
     * @method getNSPrefixes
     * @summary Returns an Array of namespace prefixes for aNamespaceURI in the
     *     receiver.
     * @param {String} aNamespaceURI The namespace URI to return the array of
     *     prefixes for. If empty, all defined prefixes will be returned.
     * @param {Boolean} includeDescendants Should the search run across the
     *     entire DOM tree? Default is false.
     * @returns {Array} An array of namespace prefixes for the supplied
     *     aNamespaceURI in the document.
     */

    return TP.nodeGetNSPrefixes(this.getNativeNode(),
                                aNamespaceURI,
                                includeDescendants);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getNSURI',
function() {

    /**
     * @method getNSURI
     * @summary Returns the namespaceURI of the receiver. This is typically
     *     found in the namepaceURI but in certain circumstances you'll get an
     *     empty value there even when the xmlns attribute is in place.
     * @returns {String} A namespace URI or the empty string.
     */

    return TP.nodeGetNSURI(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getNSURIs',
function(includeDescendants) {

    /**
     * @method getNSURIs
     * @summary Returns an Array of unique namespace URIs in the receiver.
     * @param {Boolean} includeDescendants Should the search run across the
     *     entire DOM tree? Default is false.
     * @returns {Array} An array of unique namespace URIs found in the receiver.
     */

    return TP.nodeGetNSURIs(this.getNativeNode(), includeDescendants);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getProperty',
function(attributeName) {

    /**
     * @method getProperty
     * @summary Returns the value of the named property, checking the native
     *     node first, then the receiver.
     * @returns {Object} The value of the property at the supplied attribute
     *     name in the receiver.
     */

    var node,
        val;

    if (!TP.isNode(node = this.getNativeNode())) {
        return this.$get(attributeName);
    }

    try {
        val = node[attributeName];
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e,
                    'Error retrieving node property: ' + attributeName)) : 0;
    }

    if (TP.notValid(val)) {
        return this.$get(attributeName);
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getTargetPhase',
function(phaseList, outerElem) {

    /**
     * @method getTargetPhase
     * @summary Returns the maximum phase the node should be processed to based
     *     on checking it and its ancestors for phase information. Child content
     *     shouldn't exceed the phase of its enclosing ancestors.
     * @param {Array} phaseList An optional array in which to find the target
     *     phase.
     * @param {Element} outerElem An optional 'outermost' element to test.
     *     Testing will not go higher than this element in the DOM tree.
     * @returns {String} The maximum content processing phase name.
     */

    return TP.nodeGetTargetPhase(this.getNativeNode(),
                                    phaseList,
                                    outerElem);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getTextContent',
function() {

    /**
     * @method getTextContent
     * @summary Returns the normalized text content of the receiver's first
     *     text node.
     * @returns {String} The receiver's text value.
     */

    return TP.nodeGetTextContent(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver. Unless overridden by a
     *     custom subtype this method will return the text value of the
     *     receiving node.
     * @returns {String} The value in string form.
     */

    return this.getTextContent();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getWindow',
function() {

    /**
     * @method getWindow
     * @summary Returns the receiver's containing TP.core.Window object.
     * @returns {TP.core.Window} The receiver's TP.core.Window object.
     */

    var win;

    win = this.getNativeWindow();
    if (TP.isWindow(win)) {
        win = TP.core.Window.construct(win);
    }

    return win;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('hasReachedPhase',
function(targetPhase, targetPhaseList) {

    /**
     * @method hasReachedPhase
     * @summary Returns true if the receiver is processed up to or beyond the
     *     phase provided. If no phase is provided, 'Finalize' is assumed (since
     *     that's the last valid phase that doesn't require run-time canvas
     *     information)
     * @param {String} targetPhase A TIBET content "process phase" constant such
     *     as 'Compile'.
     * @param {Array} targetPhaseList An optional list of phases to search for
     *     the target phase. The default is TP.core.TSH.NOCACHE.
     * @returns {Boolean} True if the phase has been reached.
     */

    return TP.nodeHasReachedPhase(
                this.getNativeNode(), targetPhase, targetPhaseList);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('hasWindow',
function() {

    /**
     * @method hasWindow
     * @summary Returns whether or not the receiver is in a Window.
     * @returns {Boolean} Whether or not the receiver is in a Window.
     */

    return TP.isWindow(this.getNativeWindow());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('identicalTo',
function(aNode) {

    /**
     * @method identicalTo
     * @summary Returns whether the supplied node is 'identical to' the
     *     receiver.
     * @description This method will return true if the underlying native Node
     *     of the receiver is identical to the supplied Node (or underlying
     *     native Node if a TP.core.Node was supplied).
     * @param {TP.core.Node|Node} aNode The TP.core.Node or Node to use in the
     *     comparison.
     * @exception TP.sig.InvalidNode
     * @returns {Boolean} Whether or not the supplied node is identical to the
     *     receiver.
     */

    var otherNode;

    otherNode = TP.unwrap(aNode);

    if (!TP.isNode(otherNode)) {
        return false;
    }

    return this.getNativeNode() === otherNode;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('isDirty',
function(aFlag) {

    /**
     * @method isDirty
     * @summary Combined setter/getter for whether the receiver has been
     *     changed since it was first loaded.
     * @param {Boolean} aFlag The state of the node's dirty flag, which will be
     *     set when provided.
     * @returns {Boolean} The current dirty state, after any optional set()
     *     operation has occurred.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('dirty', aFlag, false);
    }

    return this.$get('dirty');
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('isDetached',
function(aRootNode) {

    /**
     * @method isDetached
     * @summary Returns true if the receiver's parent chain does not terminate
     *     at the root node provided, or at a Document node when no specific
     *     root is given. The root node can be either an element node or a
     *     document node.
     * @param {Node} aRootNode An optional node the receiver must reside in,
     *     hence a Document or Element (Collection) node.
     * @returns {Boolean} True if the receiver isn't in a document.
     */

    return TP.nodeIsDetached(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('$$isPair',
function() {

    /**
     * @method $$isPair
     * @summary Returns true if the receiver can be considered an ordered pair.
     *     This is never true for a node.
     * @returns {Boolean} False for nodes.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('isSingleValued',
function(aspectName) {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is single valued for.
     * @returns {Boolean} True when single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('isScalarValued',
function(aspectName) {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description Most 'field-level' UI controls bind to scalar values (i.e.
     *     Booleans, Numbers and Strings), but action tags and certain other
     *     complex UI elements can bind to nodes or nodelists. In the first
     *     case, this method should return true and in the second it should
     *     return false.
     *     Note that this is different than saying that the receiver is 'single
     *     valued', which means that it can accept only one value. That one
     *     value might very well might not be a scalar value.
     *     When you combine isScalarValued() with isSingleValued() you get a
     *     fairly broad range of options for what a control wants to consume.
     *     Here are examples:
     *
     *     Description         isScalarValued        isSingleValued
     *     -----------         --------------        --------------
     *     X(HT)ML node        true                  true
     *     X(HT)ML element     false                 false
     *     <html:input>        true                  true
     *     <html:textarea>     true                  true
     *     <html:select>       true                  false
     *
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is scalar valued for.
     * @returns {Boolean} True when scalar valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('produceContent',
function(aContentObject, aRequest) {

    /**
     * @method produceContent
     * @summary Produces the content that will be used by the addContent() and
     *     setContent() methods to set the content of the receiver.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     */

    return TP.str(aContentObject);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('produceValue',
function(aspectName, aContentObject, aRequest) {

    /**
     * @method produceValue
     * @summary Produces the value that will be used by the setValue() method
     *     to set the content of the receiver.
     * @description This method works together with the 'isSingleValued()' and
     *     'isScalarValued()' methods to produce the proper value for the
     *     receiver. See the method description for isScalarValued() for more
     *     information.
     * @param {String} aspectName The aspect name on the receiver that the value
     *     is being produced for. Many times, this is 'value'.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     */

    var input,
        value,

        result,
        len,
        i,

        keys;

    input = aContentObject;

    //  Reduce the content so we're not dealing with an Array when we're
    //  single-valued... no point in either observing too much or in running it
    //  all through a formatting pipeline when we only want one value.
    if (this.isSingleValued(aspectName)) {
        input = this.$reduceValue(input, aRequest);
    }

    //  If we're scalar-valued we can't process nodes as values. We need to
    //  convert them into a proper scalar value. The same is true for any
    //  collection of input, we've got to convert it into a collection of scalar
    //  values rather than a collection of more complex objects
    if (this.isScalarValued(aspectName)) {
        if (TP.isString(input)) {
            value = input;
        } else if (TP.isNode(input)) {
            value = TP.val(input);
        } else if (TP.isNodeList(input)) {
            //  Since we're scalar-valued we want NodeLists to be converted to
            //  Arrays of the node "values" in text form
            result = TP.ac();
            len = input.length;
            for (i = 0; i < len; i++) {
                result.atPut(i, TP.val(input[i]));
            }
            value = result;
        } else if (TP.isNamedNodeMap(input)) {
            //  Since we're scalar-valued we want NamedNodeMaps to be converted
            //  to Arrays of the map "values" in text form
            result = TP.ac();
            len = input.length;
            for (i = 0; i < len; i++) {
                result.atPut(i, TP.val(input.item(i)));
            }
            value = result;
        } else if (TP.isArray(input)) {
            //  For arrays that aren't nodelists we'll ask for the value via a
            //  more general-purpose routine
            result = TP.ac();
            len = input.getSize();
            for (i = 0; i < len; i++) {
                result.atPut(i, TP.val(input.at(i)));
            }
            value = result;
        } else if (TP.isHash(input)) {
            result = TP.hc();
            keys = input.getKeys();
            len = keys.getSize();
            for (i = 0; i < len; i++) {
                result.atPut(keys.at(i), TP.val(input.at(keys.at(i))));
            }
            value = result;
        } else if (TP.isPlainObject(input)) {
            result = {};
            keys = TP.keys(input);
            len = keys.getSize();
            for (i = 0; i < len; i++) {
                result[keys.at(i)] = TP.val(input[keys.at(i)]);
            }
            value = result;
        } else {
            //  Anything else we'll try to convert using our general purpose
            //  value routine, which quite often returns the string value
            value = TP.val(input);
        }
    } else {
        value = input;
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('$reduceValue',
function(theContent, anIndex) {

    /**
     * @method $reduceValue
     * @summary Reduces the content value to a 'single value'.
     * @description When the receiver isSingleValued() this method will return a
     *     single object from a content result set (a collection of some sort -
     *     usually an Array, Object, TP.core.Hash, NodeList or NamedNodeMap).
     *     The result set must be a collection for this method to operate
     *     correctly. In all other cases the original content object is
     *     returned. What this method returns depends on the type of content
     *     handed to it:
     *
     *     Array            The content at the index supplied or at 0 if no
     *                      index was supplied.
     *     Object           The *value* of the content at the index supplied or
     *                      at the first key if no index was supplied.
     *     TP.core.Hash     The *value* of the content at the index supplied or
     *                      at the first key if no index was supplied.
     *     NodeList         The content at the index supplied or at 0 if no
     *                      index was supplied.
     *     NamedNodeMap     The *value* of the content at the index supplied or
     *                      at the first key if no index was supplied.
     * @param {Object} theContent The original content object.
     * @param {Number|String} anIndex The index into the collection to use to
     *     supply the value.
     * @returns {Object} The original data, or the proper "single object" from
     *     that collection.
     */

    var result,
        index,
        len;

    if (TP.isString(theContent)) {
        return theContent;
    }

    if (!TP.isCollection(theContent) && !TP.isPlainObject(theContent)) {
        return theContent;
    }

    result = theContent;

    if (TP.isNodeList(result)) {
        result = TP.ac(result);
    }

    //  Because of the conversion above, this handles both Arrays and NodeLists
    if (TP.isArray(result)) {
        index = TP.ifInvalid(anIndex, 0);

        len = result.getSize();

        try {
            //  NB: We use 'native' syntax here as 'result' might be a NodeList
            if (index > len) {
                result = result.at(len - 1);
            } else if (index < 0) {
                result = result.at(0);
            } else {
                result = result.at(index);
            }
        } catch (e) {
            result = undefined;
        }
    } else {
        //  This handles TP.core.Hash, Objects and NamedNodeMaps

        index = anIndex;
        if (TP.notValid(index)) {
            index = TP.keys(result).first();
        }

        if (TP.isHash(result)) {
            result = result.at(index);
        } else {
            result = result[index];
        }
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('selectChain',
function(aProperty) {

    /**
     * @method selectChain
     * @summary Returns an Array of objects that are obtained by recursively
     *     obtaining the property on each object, starting with the receiver.
     * @param {String} aProperty The property name to use to obtain each return
     *     value.
     * @returns {Array} An Array of objects obtained by recursing using the
     *     supplied property.
     */

    return TP.wrap(TP.nodeSelectChain(this.getNativeNode(), aProperty));
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @description At this level, this method merely sets the text content of
     *     the node to what is produced by executing the 'produceContent'
     *     on the supplied content object. Subtypes should override this method
     *     to provide a more specific version of this.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     */

    this.setTextContent(aContentObject);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('setNativeNode',
function(aNode, shouldSignal) {

    /**
     * @method setNativeNode
     * @summary Sets the receiver's native DOM node object.
     * @param {Node} aNode The node to wrap.
     * @param {Boolean} shouldSignal If false this operation will not trigger a
     *     change notification. This defaults to the return value of sending
     *     shouldSignalChange() to the receiver.
     * @exception TP.sig.InvalidNode
     * @returns {TP.core.Node} The receiver.
     */

    var oldNode,

        flag;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode', aNode);
    }

    this.$set('node', aNode, false);

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.$changed('content', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldNode, TP.NEWVAL, aNode));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('setRawContent',
function(newContent, aRequest) {

    /**
     * @method setRawContent
     * @summary Sets the content of the receiver to the content provided
     *     without performing any content processing on it. At this level, this
     *     method just performs a setContent() and returns.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    return this.setContent(newContent, aRequest);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('setProperty',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method setProperty
     * @summary Sets the value of the named attribute to attributeValue. For a
     *     TP.core.Node this is called by set() after the attribute has been
     *     resolved and the value has been validated.
     * @param {String} attributeName The attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal Should changes be notified. If false changes
     *     are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.core.Node} The receiver.
     * @fires Change
     */

    var model,
        val,
        flag;

    //  no model? store locally. note that the fetch here is for the
    //  unchanged node, preserving any crud/delete flagged nodes
    if (!TP.isNode(model = this.getNativeNode())) {
        return this.$set(attributeName,
                            attributeValue,
                            shouldSignal);
    }

    //  issue for TP.core.Node is that we don't want to put things on the
    //  node that might disappear if the node gets transformed when those
    //  things are defined attributes of TP.core.Node (or the subtype). So
    //  we have to check for that case first...
    if (TP.isDefined(this.$get(attributeName))) {
        return this.$set(attributeName,
                            attributeValue,
                            shouldSignal);
    }

    //  do it the old-fashioned way...
    val = this.getProperty(attributeName);
    if (TP.isDefined(val)) {
        //  val exists either as null or other defined value. the ==
        //  test should be adequate since we're getting a value from the
        //  model which is typically a string/number/boolean.
        if (typeof val === typeof attributeValue) {
            if (val === attributeValue) {
                //  if new value is a match then no change is needed
                return this;
            }
        }
    }

    //  model exists so set the value...to null if we have to for
    //  initialization. note we use try/catch here to avoid problems with IE
    //  complaining about slot access for things it doesn't recognize
    try {
        model[attributeName] = TP.ifUndefined(attributeValue, null);
        if (model[attributeName] === attributeValue) {
            // this.modelChanged(attributeName);

            //  NB: Use this construct this way for better performance
            if (TP.notValid(flag = shouldSignal)) {
                flag = this.shouldSignalChange();
            }

            if (flag) {
                this.$changed(attributeName, TP.UPDATE);
            }
        } else {
            //  value didn't take...non-mutable model/aspect?
            this.$set(attributeName, attributeValue, shouldSignal);
        }
    } catch (e) {
        this.$set(attributeName, attributeValue, shouldSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('setTextContent',
function(aValue, shouldSignal) {

    /**
     * @method setTextContent
     * @summary Sets the text content of the receiver's first text node to
     *     aValue. For general node types this method sets the value/content of
     *     the node.
     * @description For common nodes the standard attribute list and the type of
     *     input determines what is actually manipulated. For element and
     *     document nodes the behavior is a little different. When the receiver
     *     has a pre-existing value attribute that's typically what is
     *     manipulated. When no value attribute is found the content of the node
     *     is changed. The type of node and input can alter how this actually is
     *     done. See the setContent call for more information.
     * @param {Object} aValue The value to set the 'content' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        oldValue,
        flag;

    //  fetch the value without preserving changes so we can test against
    //  the "current state" if flagged
    node = this.getNativeNode();

    //  capture a value so we can test for change
    oldValue = TP.nodeGetTextContent(node);

    //  this test should be adequate for text comparison
    if (aValue === oldValue) {
        return this;
    }

    //  refetch the true native node, preserving crud/deletes so the new
    //  value really sticks
    node = this.getNativeNode();

    //  set the text value if it appears it will change
    TP.nodeSetTextContent(node, aValue);

    //  signal as needed

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.$changed('value', TP.UPDATE);
    }

    //  Since, at the TP.core.Node level, setting the value is equivalent to
    //  setting the content, we signal that we've done that.

    try {
        //  We only signal TP.sig.DOMContentLoaded if the system is configured
        //  for it.
        if (TP.sys.shouldSignalDOMLoaded()) {
            TP.signal(TP.gid(node),
                        'TP.sig.DOMContentLoaded',
                        aValue);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e,
                    'TP.sig.DOMContentLoaded handler generated error.')) : 0;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('setUri',
function(aURI) {

    /**
     * @method setUri
     * @summary Sets the 'source URI' of the receiver. This allows tracking of
     *     the source that the receiver came from.
     * @param {TP.core.URI} aURI The URI to set as the receiver's source URI.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.core.Node} The receiver.
     */

    if (!TP.isURIString(aURI) && !TP.isURI(aURI)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.$set('uri', aURI.asString(), false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For general node types
     *     this method sets the value/content of the node. See this type's
     *     'setTextContent' method for more information.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.core.Node} The receiver.
     */

    var newValue;

    newValue = this.produceValue('value', aValue);

    return this.setTextContent(newValue, shouldSignal);
});

//  ------------------------------------------------------------------------
//  DNU SUPPORT
//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @method canResolveDNU
     * @summary Provides an instance that triggers the DNU machinery with an
     *     opportunity to handle the problem itself. TP.core.Nodes look to the
     *     TP.* primitives, followed by their native node in an attempt to
     *     resolve these situations.
     * @param {Object} anOrigin The object asking for help. The receiver in this
     *     case.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @exception TP.sig.InvalidNode
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     TRUE for TP.core.Node subtypes.
     */

    var node,
        fname,
        target,
        invocable;

    if (!TP.isNode(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode');
    }

    if (TP.isEmpty(aMethodName)) {
        return false;
    }

    //  first check is for a TP primitive starting with "element",
    //  "document", etc. based on the node type we've got
    switch (node.nodeType) {
        case Node.ELEMENT_NODE:

            fname = 'element' + aMethodName.asTitleCase();
            if (TP.canInvoke(TP, fname)) {
                target = 'TP';
            }

            break;

        case Node.DOCUMENT_NODE:

            fname = 'document' + aMethodName.asTitleCase();
            if (TP.canInvoke(TP, fname)) {
                target = 'TP';
            }

            break;

        case Node.ATTRIBUTE_NODE:

            fname = 'attribute' + aMethodName.asTitleCase();
            if (TP.canInvoke(TP, fname)) {
                target = 'TP';
            }

            break;

        default:
            break;
    }

    //  common fallback case is generic node* method
    if (TP.notValid(target)) {
        fname = 'node' + aMethodName.asTitleCase();
        if (TP.canInvoke(TP, fname)) {
            target = 'TP';
        }

        //  slighly less common fallback case is object* method
        if (TP.notValid(target)) {
            fname = 'object' + aMethodName.asTitleCase();
            if (TP.canInvoke(TP, fname)) {
                target = 'TP';
            }

            if (TP.notValid(target)) {
                //  finally, look to the native node itself
                if (TP.canInvoke(node, aMethodName)) {
                    target = 'this.getNativeNode()';
                    invocable = TP.isCallable(node[aMethodName].invoke);
                }
            }
        }
    }

    if (TP.notValid(target)) {
        return false;
    }

    //  return the result of building the resolver we need
    return this.$$constructDNUResolver(target, fname, invocable);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('$$constructDNUResolver',
function(aTarget, aMethodName, supportsInvoke) {

    /**
     * @method $$constructDNUResolver
     * @summary Builds a method capable of resolving a DNU and associates it
     *     with the receiver. If this operation is successful this method will
     *     return true, supporting the canResolve method.
     * @param {String} aTarget A target string which is the receiver of the
     *     resolving method. Normally 'TP' for a TP.core.Node.
     * @param {String} aMethodName The name of the method to invoke on the
     *     target.
     * @param {Boolean} supportsInvoke False to force apply to be used.
     * @returns {Boolean} True if the creation is successful.
     */

    var fstr,
        func;

    if (TP.isFalse(supportsInvoke)) {
        fstr = TP.join('function(arglist)',
                        '{',
                            'var args;',
                            'args = TP.args(arglist);',
                            'args.unshift(this.getNativeNode());',
                            'return ', aTarget, '[', aMethodName, '].',
                                'apply(', aTarget, ', args);',
                        '}');
    } else {
        fstr = TP.join('function(arglist)',
                        '{',
                            'return ', aTarget, '[', aMethodName, '].',
                                'apply(', aTarget, ', arglist);',
                        '}');
    }

    func = TP.fc(fstr);

    if (!TP.isFunction(func)) {
        return false;
    }

    //  add it to the receiver's type as a new instance method
    this.getType().Inst.defineMethod(aMethodName, func);

    return TP.canInvoke(this, aMethodName);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @method resolveDNU
     * @summary Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given.
     * @description Handles resolution of methods which have triggered the
     *     inferencer. For TP.core.DocumentNodes the resolution process is used
     *     in conjunction with method aspects to allow the receiver to translate
     *     method calls.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @exception TP.sig.InvalidNode
     * @returns {Object} The result of invoking the method using the receiver's
     *     native node.
     */

    if (!TP.isNode(this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode');
    }

    if (TP.isEmpty(aMethodName)) {
        return false;
    }

    return this[aMethodName].apply(this, anArgArray);
});

//  ------------------------------------------------------------------------
//  XPATH SUPPORT
//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('evaluateXPath',
function(XPathExpr, resultType, logErrors) {

    /**
     * @method evaluateXPath
     * @summary Returns the result of executing the XPath expression provided
     *     against the receiver's native node/nodeset.
     * @param {String} XPathExpr The XPath expression to use to query the tree
     *     starting from the receiver.
     * @param {Number} resultType The type of result desired, either TP.NODESET
     *     or TP.FIRST_NODE.
     * @param {Boolean} logErrors Used to turn off error notification,
     *     particularly during operations such as string localization which can
     *     cause recusion issues.
     * @returns {Object} The result of executing the XPath.
     */

    return TP.xpc(XPathExpr).exec(this, resultType, logErrors);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('evaluateXPathFromNode',
function(XPathExpr, resultType, logErrors, aNode, flagChanges) {

    /**
     * @method evaluateXPathFromNode
     * @summary Returns the result of executing the XPath expression provided
     *     against the supplied native node/nodeset.
     * @param {String} XPathExpr The XPath expression to use to query the tree
     *     starting from the supplied Node.
     * @param {Number} resultType The type of result desired, either TP.NODESET
     *     or TP.FIRST_NODE.
     * @param {Boolean} logErrors Used to turn off error notification,
     *     particularly during operations such as string localization which can
     *     cause recusion issues.
     * @param {Node} aNode The context node for the XPath expression.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @exception TP.sig.InvalidNode
     * @returns {Object} The result of executing the XPath.
     */

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    return TP.xpc(XPathExpr).execOnNative(aNode,
                                            resultType,
                                            logErrors,
                                            flagChanges);
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getDelegate',
function() {

    /**
     * @method getDelegate
     * @summary Returns the receiver's delegate. For TP.core.Node this is the
     *     receiver's native node.
     * @returns {Node} The receiver's native node.
     */

    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('clone',
function(deep, viaString) {

    /**
     * @method cloneNode
     * @summary Clones the receiver, deeply if the 'deep' parameter is true.
     * @param {Boolean} deep Whether or not to clone the node 'deeply' (that is,
     *     to recursively clone its children). Defaults to true.
     * @param {Boolean} viaString If deep, this flag will cause the cloning to
     *     use string-based operations to ensure Moz doesn't mess up the
     *     document reference. Defaults to false.
     * @returns {TP.core.Node} The resulting clone of aNode.
     */

    return TP.wrap(TP.nodeCloneNode(this.getNativeNode(), deep, viaString));
});

//  ------------------------------------------------------------------------
//  NODE CHANGE TRACKING
//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('shouldSignalChange',
function(aFlag) {

    /**
     * @method shouldSignalChange
     * @summary Defines whether the receiver should actively signal change
     *     notifications.
     * @description In general objects do not signal changes when no observers
     *     exist. This flag is triggered by observe where the signal being
     *     observed is a form of Change signal to "arm" the object for change
     *     notification. You can also manipulate it during multi-step
     *     manipulations to signal only when a series of changes has been
     *     completed.
     * @param {Boolean} aFlag true/false signaling status.
     * @returns {Boolean} The current status.
     */

    //  NB: Because of all of the machinery around signaling and tracking
    //  changes, it's best that this method is written to poke around at the
    //  native node.

    var natNode;

    //  Notice here how we use the 'fast' native node get method to avoid any
    //  sorts of recursion issues.
    natNode = this.getNativeNode();

    if (TP.notValid(natNode)) {
        return;
    }

    if (TP.isBoolean(aFlag)) {
        if (TP.notTrue(aFlag)) {
            delete natNode[TP.SHOULD_SIGNAL_CHANGE];

            return false;
        } else {
            natNode[TP.SHOULD_SIGNAL_CHANGE] = true;

            return true;
        }
    }

    //  when suspended is true we always return false which allows an
    //  override to succeed
    if (natNode[TP.SHOULD_SUSPEND_SIGNALING] === true) {
        return false;
    }

    return natNode[TP.SHOULD_SIGNAL_CHANGE] === true;
});

//  ------------------------------------------------------------------------
//  Primitives
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetConcreteType',
function(aNode) {

    /**
     * @method nodeGetConcreteType
     * @summary Returns the specific TP.core.Node subtype associated with the
     *     node provided.
     * @param {Node} aNode The native node to test.
     * @exception TP.sig.InvalidNode
     * @returns {TP.lang.RootObject.<TP.core.Node>} A TP.core.Node subtype type
     *     object.
     */

    return TP.core.Node.getConcreteType(aNode);
});

//  ========================================================================
//  TP.core.CollectionNode
//  ========================================================================

/**
 * @type {TP.core.CollectionNode}
 * @summary A node type providing common collection-style operations for
 *     certain node subtypes such as document and element nodes.
 * @description The TP.core.CollectionNode is an abstract supertype for nodes
 *     such as document or element nodes which can support a TIBET collection
 *     API. The API methods of this type are extensive since TP.core.Node is the
 *     primary data management structure for XForms and various web service
 *     request/response pairs. The API includes methods from:
 *
 *     TP.api.CollectionAPI:
 *
 *     'add', 'addAll', 'addAllIfAbsent', 'addIfAbsent', 'addItem',
 *     'addWithCount', 'asArray', 'asHash', 'asIterator', 'asRange', 'asString',
 *     'collapse', 'collect', 'collectGet', 'collectInvoke', 'compact',
 *     'conform', 'contains', 'containsAll', 'containsAny', 'containsString',
 *     'convert', 'countOf', 'detect', 'detectInvoke', 'detectMax', 'detectMin',
 *     'difference', 'disjunction', 'empty', 'flatten', 'getItems',
 *     'getIterator', 'getIteratorType', 'getSize', 'getValues', 'grep',
 *     'groupBy', 'injectInto', 'intersection', 'isSortedCollection', 'merge',
 *     'partition', 'perform', 'performInvoke', 'performSet', 'performUntil',
 *     'performWhile', 'performWith', 'reject', 'remove', 'removeAll',
 *     'replace', 'replaceAll', 'select', 'union', 'unique',
 *
 *     TP.api.IndexedCollectionAPI:
 *
 *     'addAt', 'addAllAt', 'at', 'atAll', 'atAllPut',
 *     'atIfInvalid', 'atIfNull', 'atIfUndefined', 'atPut', 'atPutIfAbsent',
 *     'containsKey', 'containsValue', 'detectKeyAt', 'getKeys', 'getKVPairs',
 *     'getPairs', 'getPosition', 'getPositions', 'grepKeys', 'performOver',
 *     'removeAt', 'removeAtAll', 'removeKey', 'removeKeys', 'transpose',
 *
 *     TP.api.OrderedCollectionAPI:
 *
 *     'addAfter', 'addAllAfter', 'addAllBefore', 'addAllFirst', 'addAllLast',
 *     'addBefore', 'addFirst', 'addLast', 'after', 'before', 'first',
 *     'getLastPosition', 'last', 'orderedBy', 'removeFirst', 'removeLast',
 *     'replaceFirst', 'replaceLast', 'reverse',
 *
 *     The methods defined above are adjusted such that they normally operate
 *     on other TP.core.Nodes, native Nodes, Nodelists, or TIBET collections
 *     containing TP.core.Nodes or Nodes. Most methods rely on XPath expressions
 *     when locations are being defined.
 */

//  ------------------------------------------------------------------------

TP.core.Node.defineSubtype('core.CollectionNode');

//  can't construct concrete instances of this since its really not a native
//  node type wrapper
TP.core.CollectionNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Type.defineAttribute('namespace', null);

//  the node's tag name. for elements this is the tag name used when
//  creating a new instance of the receiver without additional data. for a
//  document this is the tag name of the document element created when no
//  other data is available
TP.core.CollectionNode.Type.defineAttribute('tagname', null);

//  a registry of 'original nodes' that were authored.
TP.core.CollectionNode.Type.defineAttribute('originals');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Whether or not we're already in the middle of 'transforming' a piece of
//  markup. This helps avoid endless recursions between the 'transform' method
//  and the 'compile' method/tag processing pipeline.
TP.core.CollectionNode.Inst.defineAttribute('$alreadyTransforming');

TP.core.CollectionNode.Inst.defineAttribute('preppedReps');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Type.defineMethod('refreshInstances',
function(aDocument) {

    /**
     * @method refreshInstances
     * @summary Refreshes instances on the supplied Document or the current
     *     uicanvas if aDocument isn't supplied.
     * @description This method attempts to obtain the node as it was originally
     *     authored, recompile and re-awaken it.
     * @param {Document} aDocument The native document containing instances of
     *     this node to refresh instances of. This defaults to the document of
     *     the current uicanvas.
     */

    var originals,

        cssQuery,
        doc,
        instances;

    //  Grab our 'originals' registry. This is where we store clones of the
    //  original node.
    if (!TP.isValid(originals = this.get('originals'))) {
        return;
    }

    //  Compute the CSS query path, indicating that we want a path that will
    //  find both 'deep elements' (i.e. elements even under other elements of
    //  this same type) and compiled representations of this element.
    cssQuery = this.getQueryPath(true, true);

    //  Default the document to the uicanvas's document. Note the 'true' here to
    //  get the native document.
    doc = aDocument;
    if (TP.notValid(doc)) {
        doc = TP.sys.uidoc(true);
    }

    //  Find any instances that are currently drawn on the document.
    instances = TP.byCSSPath(cssQuery, doc);

    //  Iterate over the instances that were found.
    instances.forEach(
        function(aTPElem) {

            var authoredElem,
                gid,
                recastTPDoc,
                handler;

            //  Grab the originally authored representation of the node.
            authoredElem = originals.at(aTPElem.getLocalID());

            if (TP.isNode(authoredElem)) {
                authoredElem = TP.nodeCloneNode(authoredElem);

                //  Note here how we set the 'tibet:recasting' attribute to let
                //  the system know that we're recasting the current, in place,
                //  element. This flag will be removed by the 'mutation added'
                //  method.

                gid = aTPElem.getID();

                //  Signal that we're going to recast the node.
                TP.signal(null,
                            'TP.sig.NodeWillRecast',
                            TP.hc('recastTarget', aTPElem));

                //  This is all being done in a 50ms setTimeout, so that any GUI
                //  updating that happens as part of the NodeWillRecast signal
                //  can be rendered.
                setTimeout(
                    function() {

                        var autodefineMissingTags;

                        //  The new content may have a tag that we don't know
                        //  about. Therefore we force the system to autodefine
                        //  missing tags here.
                        autodefineMissingTags =
                            TP.sys.cfg('sherpa.autodefine_missing_tags');
                        TP.sys.setcfg('sherpa.autodefine_missing_tags', true);

                        //  Compile the content, supplying the authored node as
                        //  the 'alternate element' to compile. This is the core
                        //  of 'recasting'. Note that awaken will happen via the
                        //  core TIBET Mutation Observer when the new node is
                        //  attached to the DOM. It will send a MutationAttach
                        //  signal that we install a handler for below.
                        aTPElem.setAttribute('tibet:recasting', true);
                        aTPElem.compile(null, true, authoredElem);

                        //  Put the autodefine setting back to what it was.
                        TP.sys.setcfg('sherpa.autodefine_missing_tags',
                                        autodefineMissingTags);

                        //  The native node might have changed under the covers
                        //  during compilation, so we need to set the attribute
                        //  again.
                        aTPElem.setAttribute('tibet:recasting', true);

                        recastTPDoc = TP.tpdoc(aTPElem);

                        //  Install a handler looking for a MutationAttach
                        //  signal that will have the global ID for the element
                        //  being recast.
                        handler = function(aSignal) {

                            var recastTPElem;

                            //  If one of the mutated nodes was our recast
                            //  Element, then the GIDs will be the same (but its
                            //  a 'new element' insofar as the DOM is concerned,
                            //  so we can't use '===' comparing).
                            if (aSignal.at('mutatedNodeIDs').contains(gid)) {

                                //  Make sure to uninstall the handler.
                                handler.ignore(recastTPDoc,
                                                'TP.sig.MutationAttach');

                                //  Grab the wrapped element by using the GID to
                                //  get a reference back to it.
                                recastTPElem = TP.bySystemId(gid);

                                //  Refresh any data bindings that are a part of
                                //  or are under the recast element.
                                recastTPElem.refresh();

                                //  Signal that we did recast the node.
                                TP.signal(null,
                                            'TP.sig.NodeDidRecast',
                                            TP.hc('recastTarget',
                                                    recastTPElem));
                            }
                        };

                        //  Set up the MutationAttach observation on the
                        //  original Element's Document. This will stay the
                        //  same throughout the recasting process, so we're safe
                        //  to do that.
                        handler.observe(recastTPDoc, 'TP.sig.MutationAttach');
                    }, 50);
            }
        });

    return;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Type.defineMethod('$tagCompileAndRegister',
function(aRequest) {

    /**
     * @method $tagCompileAndRegister
     * @summary A private method that is used by the tag processing system to
     *      store off a copy of the original collection node if the system is
     *      configured to do. It then calls the authored 'tagCompile' method.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The new element.
     */

    var elem,
        elemClone,

        result,

        originals,
        localID;

    elem = aRequest.at('node');

    //  Make sure that we can invoke 'tagCompile' on ourself - if not, just
    //  exit.
    if (!TP.canInvoke(this, 'tagCompile')) {
        return elem;
    }

    //  Clone the original element for comparison purposes below. This avoids
    //  issues with the node equality routine and Text nodes under original
    //  Element. If all that changes is a single Text node under the original
    //  Element, then elem and result will still be considered equal because the
    //  change will now be present in *both* of them (changing the Text node's
    //  value by compiling it will change it in both because it's just the
    //  '.nodeValue' that's being updated).
    elemClone = TP.nodeCloneNode(elem);

    result = this.tagCompile(aRequest);

    //  We didn't get a valid Node or Array back - log an Error
    if (!TP.isNode(result) && !TP.isArray(result)) {
        TP.ifError() ?
            TP.error(
                this.getTypeName() +
                ' compile returned invalid replacement for: ' +
                TP.str(elem)) : 0;
    }

    //  If we got a collection node back, register a reference to a clone of the
    //  original element (if the 'content.retain_originals' cfg flag is on).
    if (!TP.nodeEqualsNode(result, elemClone) && TP.isCollectionNode(result)) {
        if (TP.sys.cfg('content.retain_originals')) {

            //  Make sure to create the type-level (each type - not shared)
            //  originals registry. This will hold clones of the original nodes
            //  shared by type.
            originals = this.get('originals');
            if (!TP.isValid(originals)) {
                originals = TP.hc();
                this.set('originals', originals);
            } else {
                //  If we had an originals registry, check to make sure that it
                //  doesn't already have the local id of the element in it. If
                //  it does, just return. Note how we pass 'false' to *not*
                //  assign an ID.
                localID = TP.elementGetAttribute(elem, 'id', true);
                if (originals.hasKey(localID)) {

                    //  Make sure to set the result's ID here - this will link
                    //  the result to the original element for future
                    //  replacement.
                    TP.elementSetAttribute(result, 'id', localID, true);
                    return result;
                }
            }

            //  If the result defined an ID, then we use that - note how we pass
            //  'false' to *not* assign an ID.
            localID = TP.elementGetAttribute(result, 'id', true);

            if (TP.isEmpty(localID)) {
                //  The result didn't have an ID - compute one. This will be our
                //  key into the registry.
                localID = TP.lid(elem, true);
            } else {
                //  The result had an ID - we need to make sure that original
                //  elem has a matching one.
                TP.elementSetAttribute(elem, 'id', localID, true);
            }

            //  If the registry doesn't have it, then register the original.
            //  Note that this is one-time only so that we don't overwrite what
            //  the author originally intended with subsequent renderings.
            if (!originals.hasKey(localID)) {
                originals.atPut(localID, TP.nodeCloneNode(elem));
            }

            //  Make sure to *always* set the ID on the result - this is
            //  important so that we can find the copy in the registry more than
            //  once.
            TP.elementSetAttribute(result, 'id', localID, true);
        }
    } else if (TP.isArray(result)) {
        //  TODO: We don't currently handle setting the original element on an
        //  Array of returned elements - might not be possible.
    }

    return result;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addTIBETSrc',
function(aURI, force) {

    /**
     * @method addTIBETSrc
     * @summary Adds a TP.SRC_LOCATION value to the ownerDocument of the
     *     receiver (or the receiver itself, if its the Document). This method
     *     is normally invoked when the Node is "owned" by a URI to ensure
     *     proper ID generation can occur.
     * @param {TP.core.URI|String} aURI An optional URI value. If not provided
     *     then the receiver's uri is used.
     * @param {Boolean} force True to force setting the value even if the node
     *     already has one. Default is false.
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        url;

    node = TP.nodeGetDocument(this.getNativeNode());

    url = aURI || this.get('uri');
    if (TP.notValid(url)) {
        return;
    }

    if (TP.isKindOf(url, TP.core.URI)) {
        url = url.getLocation();
    }

    TP.documentSetLocation(node, url, force);

    //  NB: We don't signal change here because when we have a URI with this
    //  node as it's primary resource, signaling change from it's resource node
    //  causes 'handleChange' to fire, which then tries to obtain the primary
    //  resource which then loops back around to this method, setting up a
    //  recursion.

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addXMLBase',
function(aURI, force, aParamHash) {

    /**
     * @method addXMLBase
     * @summary Adds an XML Base value to the documentElement of the receiver.
     *     This method is normally invoked when the Node is "owned" by a URI to
     *     ensure proper base-aware attribute computation can occur. If the
     *     receiver's document already has xml:base definition on the
     *     documentElement this method will return without altering the content.
     * @param {TP.core.URI|String} aURI An optional URI value. If not provided
     *     then the receiver's uri is used.
     * @param {Boolean} force True to force setting the value even if the node
     *     already has one. Default is false.
     * @param {TP.core.Hash|TP.sig.Request} aParamHash A set of key/value pairs
     *     which should be used to control the transformation. If the 'aURI'
     *     value is null and a 'uri' slot is defined on this object, that
     *     object's String value will be used as the XML Base value.
     * @returns {TP.core.Node} The receiver.
     */

    var url,
        node,
        doc;

    node = this.getNativeNode();

    //  if we've already got an xml:base reference we can exit
    if (this.hasXMLBase()) {
        return this;
    }

    url = aURI || this.get('uri');

    //  If a specific URL wasn't supplied, check to see if a parameter hash
    //  was supplied.
    if (TP.notValid(url)) {
        if (TP.isValid(aParamHash)) {
            //  Check to see if the parameter hash has a 'uri' value.

            //  NOTE the key here which is required to get proper relative
            //  path resolution
            url = aParamHash.at('uri');
            if (TP.isURIString(url) || TP.isURI(url)) {
                //  The 'uri' slot in the param hash sometimes contains a
                //  TP.core.URI instance... make sure its a String.
                url = url.asString();
            } else {
                url = '~app_xmlbase';
            }
        } else {
            url = '~app_xmlbase';
        }
    }

    if (TP.isDocument(node)) {
        node = node.documentElement;
    }

    //  if we're going to add one we want to add it to the documentElement
    //  of the enclosing document
    doc = TP.nodeGetDocument(node);
    if (TP.isEmpty(doc)) {
        return this;
    }

    node = doc.documentElement;
    if (!TP.isElement(node)) {
        return this;
    }

    //  If its already got one, bail out here.
    if (TP.elementHasAttribute(node, 'xml:base', true) && TP.notTrue(force)) {
        return this;
    }

    //  need to rewrite and fully expand these so they're a true reflection
    //  of where this file was loaded from. Note that we only do this if the
    //  url is absolute
    if (TP.uriIsAbsolute(url.getLocation())) {
        url = TP.core.URI.rewrite(url).getLocation();
    }

    //  we may need to reset the value for things like cache file nodes, so
    //  don't bother checking for existing values here.
    TP.elementSetAttributeInNS(
                            node,
                            'xml:base',
                            TP.uriCollectionPath(url) + '/',
                            TP.w3.Xmlns.XML);

    this.changed('@xml:base', TP.CREATE);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('computeAbsoluteURIFromValue',
function(aValue) {

    /**
     * @method computeAbsoluteURIFromAttribute
     * @summary Returns the value of the supplied URI value which is expected
     *      to contain a URI joined with the value of the receiver's 'XML Base'
     *      value or it's document's 'baseURI'.
     * @param {String} aValue The URI to use as the relative path.
     * @returns {String} The supplied URI value as joined to the receiver's XML
     *      Base value or its document's base URI.
     */

    var node,
        baseURI,
        pathURI,
        val,

        retVal;

    if (TP.isEmpty(val = aValue)) {
        return '';
    }

    node = this.getNativeNode();

    if (TP.isDocument(node)) {
        baseURI = node.baseURI;
        node = node.documentElement;
    } else {
        baseURI = node.ownerDocument.baseURI;
    }

    if (!TP.isURIString(pathURI = TP.elementComputeXMLBaseFrom(node))) {
        pathURI = baseURI;
    }

    if (TP.isURI(pathURI) && TP.isURI(val)) {
        retVal = TP.uriJoinPaths(TP.uriCollectionPath(pathURI), val);
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @method getContent
     * @summary Returns the receiver's content.
     * @description At this level, this method returns its 'inner content',
     *     which is basically all of its child nodes serialized as a document
     *     fragment.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {String} The text content of the native node.
     */

    var nativeNode,
        frag;

    nativeNode = this.getNativeNode();

    if (nativeNode.childNodes.length === 1) {
        if (TP.isTextNode(nativeNode.firstChild)) {
            return this.getTextContent();
        }

        return TP.wrap(nativeNode.firstChild).asString();
    }

    //  Note here that we're only interested in the shallow '.childNodes'
    //  collection. Note also that we allow this routine to default the
    //  document, but force it to make a copy of the fragment - otherwise, we'll
    //  lose the content.
    if (!TP.isFragment(frag = TP.nodeListAsFragment(
                                        nativeNode.childNodes, null, true))) {
        return '';
    }

    return TP.wrap(frag).asString();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getIndexInParent',
function() {

    /**
     * @method getIndexInParent
     * @summary Returns the index of the node in its parentNode's childNodes
     *     array. If there is no parentNode for the node this method returns
     *     TP.NOT_FOUND.
     * @returns {Number} The index number, or TP.NOT_FOUND.
     */

    return TP.nodeGetIndexInParent(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver. Unless overridden by a
     *     custom subtype this method will return the text value of the
     *     receiving node.
     * @returns {String} The value in string form.
     */

    return this.getContent();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('hasXMLBase',
function() {

    /**
     * @method hasXMLBase
     * @summary Returns true if xml:base references are found on or above the
     *     receiver.
     * @returns {Boolean} Whether an xml:base reference was found on or above
     *     the receiver.
     */

    var node;

    node = this.getNativeNode();

    if (TP.isDocument(node)) {
        node = node.documentElement;
    }

    if (TP.notEmpty(TP.elementGetAttribute(node, 'xml:base', true))) {
        return true;
    }

    while (TP.isElement(node = node.parentNode)) {
        if (TP.notEmpty(TP.elementGetAttribute(node, 'xml:base', true))) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('setNativeNode',
function(aNode, shouldSignal) {

    /**
     * @method setNativeNode
     * @summary Sets the receiver's native DOM node object.
     * @param {Node} aNode The node to wrap.
     * @param {Boolean} shouldSignal If false this operation will not trigger a
     *     change notification. This defaults to the return value of sending
     *     shouldSignalChange() to the receiver.
     * @exception TP.sig.InvalidNode
     * @returns {TP.core.Node} The receiver.
     */

    var nodes,
        ndx,

        elem,
        phase,
        doc,
        flag;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode', aNode);
    }

    //  what we do here varies by whether we're checkpointing or not...
    if (TP.isArray(nodes = this.get('nodes'))) {
        ndx = this.get('currentIndex');
        if (TP.isNumber(ndx)) {
            //  working in the middle of the list, have to truncate
            nodes.length = ndx;
            nodes.add(aNode);

            //  clear the index since we're basically defining the end of
            //  the list now
            this.$set('currentIndex', null, false);
        } else {
            nodes.atPut(nodes.getSize() - 1, aNode);
        }
    } else {
        this.$set('node', aNode, false);
    }

    //  update our processing phase to match that of our node (or it's
    //  enclosing document)
    if (TP.isDocument(aNode)) {
        if (TP.isElement(elem = aNode.documentElement)) {
            phase = TP.elementGetAttribute(elem, 'tibet:phase', true);
        }
    } else if (TP.isElement(aNode)) {
        if (TP.isDocument(doc = TP.nodeGetDocument(aNode))) {
            if (TP.isElement(elem = doc.documentElement)) {
                phase = TP.elementGetAttribute(elem, 'tibet:phase', true);
            }
        }

        if (TP.isEmpty(phase)) {
            phase = TP.elementGetAttribute(aNode, 'tibet:phase', true);
        }
    }

    //  default phase is unprocessed so we reset properly on new content
    phase = TP.ifEmpty(phase, 'UNPROCESSED');

    //  if we're setting a new node for any phase prior to finalized then
    //  our prepped cache is invalid (it's caching data from a phase this
    //  node hasn't reached yet)
    if (phase !== 'Finalize') {
        this.$set('preppedReps', null, false);
    }

    //  skip any wrapper method so we don't reset on the native element
    this.$set('phase', phase, false);

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.$changed('content', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('serializeForStorage',
function(storageInfo) {

    /**
     * @method serializeForStorage
     * @summary Serialize the receiver in a manner appropriate for storage.
     * @description This method provides a serialized representation of the
     *     receiver that can be used to store it in a persistent storage. The
     *     supplied storageInfo hash should contain a storage key under the
     *     'store' key that will be used to uniquely identify the content
     *     produced for this receiver. Note that nested nodes might produce
     *     their own 'serialization stores'. All of the stores can be found
     *     under the 'stores' key in the storageInfo after the serialization
     *     process is complete.
     *     For this type, serialization means writing an opening tag for the
     *     element by calling 'serializeOpenTag', then whatever non-Element
     *     content (i.e. text nodes, comment nodes, etc) and then the closing
     *     tag for the element by calling 'serializeCloseTag'.
     * @param {TP.core.Hash} storageInfo A hash containing various flags for and
     *     results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the receiver's document
     *          node should include an 'XML declaration' at the start of its
     *          serialization. The default is false.
     *          'wantsPrefixedXMLNSAttrs': Whether or not the receiver and its
     *          decendant elements should generate prefixed (i.e. 'xmlns:foo')
     *          attributes to support their proper serialization. The default is
     *          true.
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
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node,

        str,

        storeKey,
        stores,

        result;

    node = this.getNativeNode();

    if (TP.isDocument(node)) {
        node = node.documentElement;
    }

    //  Make sure that we have a result that we can concatentate results to.
    storageInfo.atPutIfAbsent('result', TP.ac());

    //  NB: We do *NOT* capture the above 'result' into a closured local
    //  variable and use it below, because steps in the processing process might
    //  decide to clear out the results and we need to respect that.

    //  Traverse in a depth-wise manner, starting at the receiver's native node.
    TP.nodeDepthTraversal(
        node,
        function(anElem) {

            //  This function gets called when the start tag of an element is
            //  encountered.

            var tpElem,
                serializationResult;

            //  Wrap the element and serialize its open tag.
            tpElem = TP.wrap(anElem);
            serializationResult = tpElem.serializeOpenTag(storageInfo);

            //  If we got a String back, there are no special control constants
            //  (i.e. TP.CONTINUE, TP.DESCEND or TP.BREAK), so we just push the
            //  result and continue with the 'default' behavior (which will be
            //  to descend if the receiver has child nodes)
            if (TP.isString(serializationResult)) {
                storageInfo.at('result').push(serializationResult);
                return;
            } else if (TP.isArray(serializationResult)) {

                //  Otherwise, if we got an Array, that means that the result
                //  will be in the first position and should be pushed onto the
                //  results and the special control constant is in the second
                //  position and should be returned.
                storageInfo.at('result').push(serializationResult.first());
                return serializationResult.last();
            } else {

                //  Otherwise, all we got back was a special control constant.
                return serializationResult;
            }
        },
        function(anElem) {

            //  This function gets called when the end tag of an element is
            //  encountered.

            var tpElem,
                serializationResult;

            //  Wrap the element and serialize its close tag.
            tpElem = TP.wrap(anElem);
            serializationResult = tpElem.serializeCloseTag(storageInfo);

            //  This behavior is the same as for the opening tag - see the
            //  Function above.

            if (TP.isString(serializationResult)) {
                storageInfo.at('result').push(serializationResult);
                return;
            } else if (TP.isArray(serializationResult)) {
                storageInfo.at('result').push(serializationResult.first());
                return serializationResult.last();
            } else {
                return serializationResult;
            }
        },
        function(nonElementNode) {

            //  This function gets called when non-element content (i.e. comment
            //  nodes, other text nodes, etc.) of an element is encountered.

            var commentText;

            //  Switch on the node type... we currently support TEXT_NODEs
            //  and COMMENT_NODEs.
            switch (nonElementNode.nodeType) {
                case Node.TEXT_NODE:

                    str = TP.htmlEntitiesToXMLEntities(
                                    nonElementNode.nodeValue, false, false);
                    str = TP.xmlLiteralsToEntities(
                                    str, false, false);

                    //  We make sure to replace any 'special characters' with
                    //  their entity equivalent. This is because that is
                    //  probably how things were authored in the original
                    //  markup.
                    str = str.replace(
                            /[\u00A0-\u9999<>&]/gim,
                            function(char) {
                                return '&#' + char.charCodeAt(0) + ';';
                            });

                    storageInfo.at('result').push(str);

                    break;

                case Node.COMMENT_NODE:

                    //  Make sure that any embedded '--' are converted to
                    //  something benign.
                    commentText = nonElementNode.nodeValue.replace(
                                                            /--/g, '__');

                    //  Push on content that has the proper leading and
                    //  trailing comment characters.
                    storageInfo.at('result').push('<!--' + commentText + '-->');

                    break;

                case Node.CDATA_SECTION_NODE:

                    str = nonElementNode.nodeValue;

                    storageInfo.at('result').push('<![CDATA[' + str + ']]>');

                    break;

                default:
                    break;
            }
        }
    );

    //  Join together the result Array and convert any HTML entities to their
    //  XML equivalent. This causes replacements such as any HTML '&nbsp;'s
    //  with the XML-compliant '&#160;'s.
    result = TP.htmlEntitiesToXMLEntities(storageInfo.at('result').join(''));

    result += '\n';

    //  Grab the current store key and put the result into the overall 'stores'
    //  hash (creating it if it doesn't exist).
    storeKey = storageInfo.at('store');

    if (TP.isValid(storeKey)) {
        stores = storageInfo.atPutIfAbsent('stores', TP.hc());
        stores.atPut(storeKey, result);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('transform',
function(anObject, aParamHash) {

    /**
     * @method transform
     * @summary Transforms the supplied Node (or TP.core.Node) by using the
     *     content of the receiver.
     * @param {Object} anObject The object supplying the data to use in the
     *     transformation.
     * @param {TP.core.Hash|TP.sig.Request} aParamHash A parameter container
     *     responding to at(). For string transformations a key of 'repeat' with
     *     a value of true will cause iteration to occur (if anObject is an
     *     'ordered collection' this flag needs to be set to 'true' in order to
     *     have 'automatic' iteration occur). Additional keys of '$STARTINDEX'
     *     and '$REPEATCOUNT' determine the range of the iteration. A special
     *     key of 'xmlns:fixup' should be set to true to fix up 'xmlns'
     *     attributes such that they won't be lost during the transformation.
     * @returns {String} The string resulting from the transformation process.
     */

    var templateName,
        templateFunc,

        resultStr,
        resultNode,
        resultTPNode,

        str,
        urn;

    if (TP.notEmpty(templateName = this.getTemplateName())) {

        //  NB: This should be a URN, therefore we assume 'async' of false here.
        templateFunc = TP.uc(templateName).getResource().get('result');
        if (TP.isCallable(templateFunc)) {
            //  Run the transform Function
            resultStr = templateFunc.transform(anObject, aParamHash);
/*
            //  Strip out any 'attr="null"' attributes - existence of null
            //  attributes can cause unintended consequences.
            TP.regex.XML_ATTR_CONTAINING_NULL.lastIndex = 0;
            resultStr = resultStr.strip(TP.regex.XML_ATTR_CONTAINING_NULL);
*/
            //  Now, we need to make sure that any constructs that were
            //  generated into the result that need tag compilation are
            //  processed.

            //  Try to create a real Node from the supplied content (passing
            //  'true' to TP.nodeAsString() so that it will report parsing
            //  errors). If we can't parse a valid Node from the content, we
            //  just return the String.
            if (TP.isElement(
                    resultNode = TP.nodeFromString(resultStr, null, true)) &&
                TP.notTrue(this.get('$alreadyTransforming'))) {

                this.set('$alreadyTransforming', true);
                resultTPNode = TP.wrap(resultNode);
                resultTPNode.compile();
                this.set('$alreadyTransforming', false);

                return resultTPNode.asString();
            } else {
                return resultStr;
            }
        }
    }

    //  Turn ourself into a String and continue.
    str = this.asString();

    //  We want a compiled Function so we go ahead and compile a Function
    //  off of our String representation, but don't register the Function as
    //  the template.
    if (TP.notEmpty(str) &&
        TP.isCallable(templateFunc = str.compile(null, true, false))) {

        //  Create a template name per tsh:template model.
        //  TODO:   convert genID into a "hash code" for uniquing.
        templateName = 'template_' + TP.genID();
        this.setAttribute('tsh:template_name', templateName);

        //  Store the function in the URN for later lookup.
        urn = TP.TIBET_URN_PREFIX + templateName;
        TP.uc(urn).setResource(templateFunc);
    }

    if (TP.isCallable(templateFunc)) {
        //  Run the transform Function
        resultStr = templateFunc.transform(anObject, aParamHash);
/*
        //  Strip out any 'attr="null"' attributes - existence of null
        //  attributes can cause unintended consequences.
        TP.regex.XML_ATTR_CONTAINING_NULL.lastIndex = 0;
        resultStr = resultStr.strip(TP.regex.XML_ATTR_CONTAINING_NULL);
*/
        //  Now, we need to make sure that any constructs that were generated
        //  into the result that need tag compilation are processed.

        //  Try to create a real Node from the supplied content (passing 'true'
        //  to TP.nodeAsString() so that it will report parsing errors). If we
        //  can't parse a valid Node from the content, we just return the
        //  String.
        if (TP.isElement(
                resultNode = TP.nodeFromString(resultStr, null, true)) &&
            TP.notTrue(this.get('$alreadyTransforming'))) {

            this.set('$alreadyTransforming', true);
            resultTPNode = TP.wrap(resultNode);
            resultTPNode.compile();
            this.set('$alreadyTransforming', false);

            return resultTPNode.asString();
        } else {
            return resultStr;
        }
    }

    //  Didn't have a template function and couldn't build one either.
    return this.raise('TP.sig.InvalidFunction');
});

//  ------------------------------------------------------------------------
//  NODE MODIFICATION
//  ------------------------------------------------------------------------

/*
Operations supporting common Node transformations. You can also use a
selection operation such as getChildNodes() followed by a perform() or
similar iteration operation to operate on node content.
*/

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addContent',
function(newContent, aRequest, stdinContent) {

    /**
     * @method addContent
     * @summary Adds (appends) new content to the receiver, processing it first
     *     for any tag transformations, interpolations, etc.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Object} stdinContent Content to set as the 'stdin' when executing
     *     the supplied content. Note that if this parameter is supplied, the
     *     content is 'executed', as well as processed, by the shell.
     * @returns {TP.core.Node} The result of adding content to the receiver.
     */

    var request,
        resp,
        content;

    if (TP.notValid(newContent) || newContent === '') {
        return this.getNativeNode();
    }

    request = TP.request(aRequest);
    request.atPutIfAbsent('targetPhase', this.getTargetPhase());

    //  If the content to be set is a URI, then track it via the 'uri'
    //  property on the request. This helps downstream routines check to see if
    //  the content changes are URI/document level.
    if (TP.isURIString(newContent)) {
        request.atPutIfAbsent('uri', newContent);
    }

    //  Put ourself into the 'target' slot, so that the content pipeline has
    //  the target 'surface' that its processing for available to it.
    request.atPut('target', this);

    //  For now, anyway, processing the content needs to be synchronous.
    request.atPut('async', false);

    //  Content drawn from here will be awakened when the nodes are placed into
    //  a visible DOM, so we don't awaken them here.
    request.atPutIfAbsent('awaken', false);

    //  If stdin content was supplied, execute the content as well as process
    //  it.
    if (TP.notEmpty(stdinContent)) {
        resp = TP.processAndExecuteWith(newContent,
                                        request,
                                        stdinContent);
    } else {
        resp = TP.process(newContent, request);
    }

    if (request.didFail()) {
        return;
    }

    content = resp.get('result');

    return this.addRawContent(content, request);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addRawContent',
function(newContent, aRequest, shouldSignal) {

    /**
     * @method addRawContent
     * @summary Adds new content to the receiver without performing any content
     *     processing on it.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Boolean} shouldSignal If false this operation will not trigger a
     *     change notification. This defaults to true.
     * @returns {TP.core.Node} The result of adding content to the receiver.
     */

    var node,

        content,
        request,

        arrContent,

        func,
        thisref,

        reqLoadFunc,
        loadFunc,

        result;

    node = this.getNativeNode();

    if (TP.notValid(newContent) || newContent === '') {
        return node;
    }

    request = TP.request(aRequest);
    content = TP.unwrap(newContent);

    if (!TP.isKindOf(content, Node) && !TP.isString(content)) {

        //  If the content is an Array, then we want the individual
        //  '.asString()' representations of each item - not what Array gives
        //  us.
        if (TP.isArray(arrContent = content)) {
            content = '';
            arrContent.perform(
                    function(item) {
                        content += TP.str(item);
                    });
        } else {
            content = TP.str(content);
        }
    }

    func = this.getContentPrimitive(TP.APPEND);
    thisref = this;

    if (TP.isCallable(reqLoadFunc = request.at(TP.ONLOAD))) {
        loadFunc =
            function(targetNode, newNode) {

                reqLoadFunc(targetNode, newNode);

                if (TP.notFalse(shouldSignal)) {
                    thisref.changed('content', TP.APPEND);
                }
            };
    } else {
        loadFunc =
            function(targetNode, newNode) {

                thisref.contentAppendCallback(targetNode);

                if (TP.notFalse(shouldSignal)) {
                    thisref.changed('content', TP.APPEND);
                }
            };
    }

    result = func(node,
                    content,
                    loadFunc,
                    TP.ifKeyInvalid(request, 'awaken', false));

    //  If we're an Element and we're flagging changes, go ahead and do that
    //  now.
    if (TP.isElement(node) && this.shouldFlagChanges()) {
        TP.elementFlagChange(node, TP.SELF, TP.APPEND);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(node)) : 0;
    }

    //  The primitive will have returned a native Node, but we need to
    //  return a TP.core.Node.
    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('clearTextContent',
function() {

    /**
     * @method clearTextContent
     * @summary Clears out the text content of any text nodes under the
     *     receiver, thereby clearing all of the text and leaving just the node
     *     structure.
     * @description This method works by setting each text node to the empty
     *     String.
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node,
        descendantTextNodes;

    node = this.getNativeNode();

    //  First, we make sure to normalize to reduce the number of total text
    //  nodes.
    TP.nodeNormalize(node);

    //  Grab all of the descendant text nodes and empty their textContent.
    descendantTextNodes = TP.nodeGetDescendantsByType(node, Node.TEXT_NODE);
    descendantTextNodes.perform(
            function(aTextNode) {
                aTextNode.textContent = '';
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('contentAppendCallback',
function(aNode) {

    /**
     * @method contentAppendCallback
     * @summary This method is the standard 'content append' callback when
     *     addRawContent() method is called.
     * @param {Node} aNode The node that content has been appended to. Unless
     *     this node has been altered by the method that is appending the
     *     content, this should be the same as the receiver's native node.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('contentInsertCallback',
function(aNode) {

    /**
     * @method contentInsertCallback
     * @summary This method is the standard 'content insert' callback when
     *     insertRawContent() method is called.
     * @param {Node} aNode The node that content has been inserted into. Unless
     *     this node has been altered by the method that is inserting the
     *     content, this should be the same as the receiver's native node.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('contentReplaceCallback',
function(aNode) {

    /**
     * @method contentReplaceCallback
     * @summary This method is the standard 'content replace' callback when
     *     setRawContent() method is called.
     * @param {Node} aNode The node that content has been replaced for. Unless
     *     this node has been altered by the method that is replacing the
     *     content, this should be the same as the receiver's native node.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getContentPrimitive',
function(operation) {

    /**
     * @method getContentPrimitive
     * @summary Returns the primitive function used to perform the operation
     *     specified. For example, an operation of TP.APPEND might return the
     *     TP.nodeAddContent primitive or a related function specific to the
     *     type of node being modified.
     * @param {String} operation A constant defining the operation. Valid values
     *     include: TP.APPEND TP.INSERT TP.UPDATE.
     * @exception TP.sig.InvalidOperation When the operation isn't a valid one.
     * @returns {Function} A TP primitive function.
     */

    switch (operation) {
        case TP.APPEND:
            return TP.nodeAddContent;
        case TP.INSERT:
            return TP.nodeInsertContent;
        case TP.UPDATE:
            return TP.nodeSetContent;
        default:
            return this.raise('TP.sig.InvalidOperation');
    }
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('insertContent',
function(newContent, aPositionOrPath, aRequest, stdinContent) {

    /**
     * @method insertContent
     * @summary Inserts content from newContent into the receiver based on the
     *     position given. The position should indicate whether the content
     *     should become the previous sibling, next sibling, first child or last
     *     child of aNode.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the receiver or a path to evaluate to get to a node at
     *     that position. This should be one of four values: TP.BEFORE_BEGIN
     *     TP.AFTER_BEGIN TP.BEFORE_END TP.AFTER_END or the path to evaluate.
     *     Default is TP.BEFORE_END.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Object} stdinContent Content to set as the 'stdin' when executing
     *     the supplied content. Note that if this parameter is supplied, the
     *     content is 'executed', as well as processed, by the shell.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var request,
        resp,
        content;

    if (TP.notValid(newContent) || newContent === '') {
        return this.getNativeNode();
    }

    request = TP.request(aRequest);
    request.atPutIfAbsent('targetPhase', this.getTargetPhase());

    //  If the content to be set is a URI, then track it via the 'uri'
    //  property on the request. This allows us to use it later when
    //  attempting to add to the history mechanism.
    if (TP.isURIString(newContent)) {
        request.atPutIfAbsent('uri', newContent);
    }

    //  Put ourself into the 'target' slot, so that the content pipeline has
    //  the target 'surface' that its processing for available to it.
    request.atPut('target', this);

    //  For now, anyway, processing the content needs to be synchronous.
    request.atPut('async', false);

    //  Content drawn from here will be awakened when the nodes are placed into
    //  a visible DOM, so we don't awaken them here.
    request.atPutIfAbsent('awaken', false);

    //  If stdin content was supplied, execute the content as well as process
    //  it.
    if (TP.notEmpty(stdinContent)) {
        resp = TP.processAndExecuteWith(newContent, request, stdinContent);
    } else {
        resp = TP.process(newContent, request);
    }

    if (request.didFail()) {
        return;
    }

    content = resp.get('result');

    return this.insertRawContent(content, aPositionOrPath, request);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('insertRawContent',
function(newContent, aPositionOrPath, aRequest, shouldSignal) {

    /**
     * @method insertRawContent
     * @summary Inserts new content in the receiver without performing any
     *     content processing on it.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the receiver or a path to evaluate to get to a node at
     *     that position. This should be one of four values: TP.BEFORE_BEGIN
     *     TP.AFTER_BEGIN TP.BEFORE_END TP.AFTER_END or the path to evaluate.
     *     Default is TP.BEFORE_END.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Boolean} shouldSignal If false this operation will not trigger a
     *     change notification. This defaults to true.
     * @returns {TP.core.Node} The result of adding content to the receiver.
     */

    var node,

        content,
        request,

        arrContent,

        func,
        thisref,

        reqLoadFunc,
        loadFunc,

        result;

    node = this.getNativeNode();

    if (TP.notValid(newContent) || newContent === '') {
        return node;
    }

    request = TP.request(aRequest);
    content = TP.unwrap(newContent);

    if (!TP.isKindOf(content, Node) && !TP.isString(content)) {

        //  If the content is an Array, then we want the individual
        //  '.asString()' representations of each item - not what Array gives
        //  us.
        if (TP.isArray(arrContent = content)) {
            content = '';
            arrContent.perform(
                    function(item) {
                        content += TP.str(item);
                    });
        } else {
            content = TP.str(content);
        }
    }

    func = this.getContentPrimitive(TP.INSERT);
    thisref = this;

    if (TP.isCallable(reqLoadFunc = request.at(TP.ONLOAD))) {
        loadFunc =
            function(targetNode, newNode) {

                reqLoadFunc(targetNode, newNode);

                if (TP.notFalse(shouldSignal)) {
                    thisref.changed('content', TP.INSERT);
                }
            };
    } else {
        loadFunc =
            function(targetNode, newNode) {

                thisref.contentInsertCallback(targetNode);

                if (TP.notFalse(shouldSignal)) {
                    thisref.changed('content', TP.INSERT);
                }
            };
    }

    result = func(node,
                    content,
                    aPositionOrPath,
                    loadFunc,
                    TP.ifKeyInvalid(request, 'awaken', false));

    //  If we're an Element and we're flagging changes, go ahead and do that
    //  now.
    if (TP.isElement(node) && this.shouldFlagChanges()) {
        TP.elementFlagChange(node, TP.SELF, TP.INSERT);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(node)) : 0;
    }

    //  The primitive will have returned a native Node, but we need to
    //  return a TP.core.Node.
    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('isEmpty',
function() {

    /**
     * @method isEmpty
     * @summary Returns whether or not the receiver is considered 'empty'.
     * @returns {Boolean} Whether or not the receiver is empty.
     */

    return TP.nodeGetChildNodes(this.getNativeNode()).getSize() === 0;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('isRecasting',
function() {

    /**
     * @method isRecasting
     * @summary Returns whether or not the receiver is considered to be in state
     *     of 'recasting' - that is, TIBET's compilation and rendering machinery
     *     are re-processing it (probably in a Sherpa development session).
     * @returns {Boolean} Whether or not the receiver is empty.
     */

    var elem,
        ans;

    elem = this.getNativeNode();

    //  True if we ourself are being recast.
    if (TP.elementHasAttribute(elem, 'tibet:recasting', true)) {
        return true;
    }

    //  Or if one of our ancestors is being recast.
    ans = TP.nodeAncestorMatchingCSS(elem, '*[tibet|recasting]');

    return TP.isElement(ans);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('reviveContent',
function(aParamHash) {

    /**
     * @method reviveContent
     * @summary Causes the receiver to perform whatever steps are necessary to
     *     revive its content, presuming that it has just been read in from a
     *     compiled cache representation.
     * @param {TP.core.Hash} aParamHash A set of key/value pairs which should be
     *     used to control the transformation.
     * @returns {TP.core.Node} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replaceWith',
function(newContent, aRequest, stdinContent) {

    /**
     * @method replaceWith
     * @summary Replaces the receiver's native DOM counterpart with the content
     *     supplied.
     * @param {Object} newContent The content to replace the receiver with. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Object} stdinContent Content to set as the 'stdin' when executing
     *     the supplied content. Note that if this parameter is supplied, the
     *     content is 'executed', as well as processed, by the shell.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var request,
        resp,
        content,

        str,

        isElement,
        isURIStr,
        containsElemMarkup,
        containsEntities;

    //  We return if newContent isn't valid and clear ourself if newContent is
    //  the empty String.
    if (TP.notValid(newContent)) {
        return;
    } else if (newContent === '') {
        return this.empty();
    }

    content = TP.unwrap(newContent);
    str = TP.str(content);

    isElement = TP.isElement(content);

    //  NB: We use the TP.regex.URI_LIKELY RegExp here instead of the
    //  TP.isURIString() method because the content can be so mixed that it
    //  might have embedded URIs.
    isURIStr = TP.regex.URI_LIKELY.test(str);

    containsElemMarkup = TP.regex.CONTAINS_ELEM_MARKUP.test(str);
    containsEntities = TP.regex.HAS_ENTITY.test(str);

    //  If the unwrapped content isn't an Element and the stringified content
    //  isn't a URI and if the stringified content doesn't contain markup or
    //  entities, then it doesn't need to be processed but can just be set as
    //  the regular content of the receiver, so we call up to the supertype to
    //  do that. At the Node level, it is determined whether this is a scalar
    //  or single-value node and might do some further processing on
    //  'newContent' at that point.
    if (!isElement &&
        !isURIStr &&
        !containsElemMarkup &&
        !containsEntities) {
        return this.callNextMethod();
    }

    //  If the unwrapped content isn't an Element and the stringified content
    //  isn't a URI and if the stringified content doesn't contain markup but
    //  does contain entities, then it doesn't need to be processed but can just
    //  be set as the regular content of the receiver, so we call
    //  replaceRawWith() to do that.
    if (!isElement &&
        !isURIStr &&
        !containsElemMarkup &&
        containsEntities) {
        return this.replaceRawWith(content, request);
    }

    request = TP.request(aRequest);
    request.atPutIfAbsent('targetPhase', this.getTargetPhase());

    //  If the content to be set is a URI, then track it via the 'uri'
    //  property on the request. This allows us to use it later when
    //  attempting to add to the history mechanism.
    if (TP.isURIString(newContent)) {
        request.atPutIfAbsent('uri', newContent);
    }

    //  Put ourself into the 'target' slot, so that the content pipeline has
    //  the target 'surface' that its processing for available to it.
    request.atPut('target', this);

    //  For now, anyway, processing the content needs to be synchronous.
    request.atPut('async', false);

    //  If this is not a Document node, content drawn from here will be awakened
    //  when the nodes are placed into a visible DOM, so we don't awaken them
    //  here. But, if this is a Document node, we need to manually configure the
    //  nodes to be awakened.
    if (TP.isDocument(this.getNativeNode())) {
        request.atPutIfAbsent('awaken', true);
    }

    //  If stdin content was supplied, execute the content as well as process
    //  it.
    if (TP.notEmpty(stdinContent)) {
        resp = TP.processAndExecuteWith(newContent, request, stdinContent);
    } else {
        resp = TP.process(newContent, request);
    }

    if (request.didFail()) {
        return;
    }

    content = resp.get('result');

    return this.replaceRawWith(content, request);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replaceRawWith',
function(newContent, aRequest, shouldSignal) {

    /**
     * @method replaceRawWith
     * @summary Replaces the receiver with the content provided without
     *     performing any content processing on it.
     * @param {Object} newContent The content to replace the receiver with. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Boolean} shouldSignal If false this operation will not trigger a
     *     change notification. This defaults to true.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var node,
        content,
        request,
        arrContent,
        func,
        thisref,
        reqLoadFunc,
        loadFunc,
        result,

        docURI;

    node = this.getNativeNode();

    //  We return if newContent isn't valid and clear ourself if newContent is
    //  the empty String.
    if (TP.notValid(newContent)) {
        return;
    } else if (newContent === '') {
        return this.empty();
    }

    request = TP.request(aRequest);
    content = TP.unwrap(newContent);

    if (!TP.isKindOf(content, Node) && !TP.isString(content)) {

        //  If the content is an Array, then we want the individual
        //  '.asString()' representations of each item - not what Array gives
        //  us.
        if (TP.isArray(arrContent = content)) {
            content = '';
            arrContent.perform(
                    function(item) {
                        content += TP.str(item);
                    });
        } else {
            content = TP.str(content);
        }
    }

    func = this.getContentPrimitive(TP.REPLACE);
    thisref = this;

    if (TP.isEmpty(docURI = request.at('uri')) &&
        TP.isKindOf(newContent, TP.core.Node)) {
        docURI = newContent.get('uri');
    }
    if (TP.isDocument(node) && TP.notEmpty(docURI)) {
        //  NB: We pass true to force the document URI to update.
        TP.documentSetLocation(node, docURI.getLocation(), true);
    }

    if (TP.isCallable(reqLoadFunc = request.at(TP.ONLOAD))) {
        loadFunc =
            function(targetNode, newNode) {

                reqLoadFunc(targetNode, newNode);

                if (TP.notFalse(shouldSignal)) {
                    thisref.changed('content', TP.UPDATE);
                }
            };
    } else {
        loadFunc =
            function(targetNode, newNode) {

                if (TP.notFalse(shouldSignal)) {
                    thisref.changed('content', TP.UPDATE);
                }
            };
    }

    result = func(node,
                    content,
                    loadFunc,
                    TP.ifKeyInvalid(request, 'awaken', false));

    //  If we're an Element and we're flagging changes, go ahead and do that
    //  now.
    if (TP.isElement(node) && this.shouldFlagChanges()) {
        TP.elementFlagChange(node, TP.SELF, TP.UPDATE);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(node)) : 0;
    }

    //  The primitive will have returned a native Node, but we need to
    //  return a TP.core.Node.
    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('setContent',
function(newContent, aRequest, stdinContent) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the content supplied.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Object} stdinContent Content to set as the 'stdin' when executing
     *     the supplied content. Note that if this parameter is supplied, the
     *     content is 'executed', as well as processed, by the shell.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var request,
        resp,
        content,

        str,

        isElement,
        isURIStr,
        containsElemMarkup,
        containsEntities;

    //  We return if newContent isn't valid and clear ourself if newContent is
    //  the empty String.
    if (TP.notValid(newContent)) {
        return;
    } else if (newContent === '') {
        return this.empty();
    }

    content = TP.unwrap(newContent);
    str = TP.str(content);

    isElement = TP.isElement(content);

    //  NB: We use the TP.regex.URI_LIKELY RegExp here instead of the
    //  TP.isURIString() method because the content can be so mixed that it
    //  might have embedded URIs.
    isURIStr = TP.regex.URI_LIKELY.test(str);

    containsElemMarkup = TP.regex.CONTAINS_ELEM_MARKUP.test(str);
    containsEntities = TP.regex.HAS_ENTITY.test(str);

    //  If the unwrapped content isn't an Element and the stringified content
    //  isn't a URI and if the stringified content doesn't contain markup or
    //  entities, then it doesn't need to be processed but can just be set as
    //  the regular content of the receiver, so we call up to the supertype to
    //  do that. At the Node level, it is determined whether this is a scalar
    //  or single-value node and might do some further processing on
    //  'newContent' at that point.
    if (!isElement &&
        !isURIStr &&
        !containsElemMarkup &&
        !containsEntities) {
        return this.callNextMethod();
    }

    //  If the unwrapped content isn't an Element and the stringified content
    //  isn't a URI and if the stringified content doesn't contain markup but
    //  does contain entities, then it doesn't need to be processed but can just
    //  be set as the regular content of the receiver, so we call
    //  setRawContent() to do that.
    if (!isElement &&
        !isURIStr &&
        !containsElemMarkup &&
        containsEntities) {
        return this.setRawContent(content, request);
    }

    request = TP.request(aRequest);
    request.atPutIfAbsent('targetPhase', this.getTargetPhase());

    //  If the content to be set is a URI, then track it via the 'uri' property
    //  on the request. This allows us to use it later when attempting to add to
    //  the history mechanism.
    if (TP.isURIString(newContent)) {
        request.atPutIfAbsent('uri', newContent);
    }

    //  Put ourself into the 'target' slot, so that the content pipeline has the
    //  target 'surface' that its processing for available to it.
    request.atPut('target', this);

    //  For now, anyway, processing the content needs to be synchronous.
    request.atPut('async', false);

    //  If this is not a Document node, content drawn from here will be awakened
    //  when the nodes are placed into a visible DOM, so we don't awaken them
    //  here. But, if this is a Document node, we need to manually configure the
    //  nodes to be awakened.
    if (TP.isDocument(this.getNativeNode())) {
        request.atPutIfAbsent('awaken', true);
    }

    //  If stdin content was supplied, execute the content as well as process
    //  it.
    if (TP.notEmpty(stdinContent)) {
        resp = TP.processAndExecuteWith(newContent, request, stdinContent);
    } else {
        resp = TP.process(newContent, request);
    }

    if (request.didFail()) {
        return;
    }

    content = resp.get('result');

    return this.setRawContent(content, request);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('setRawContent',
function(newContent, aRequest, shouldSignal) {

    /**
     * @method setRawContent
     * @summary Sets the content of the receiver to the content provided
     *     without performing any content processing on it.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Boolean} shouldSignal If false this operation will not trigger a
     *     change notification. This defaults to true.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var node,
        content,
        request,
        arrContent,
        func,
        thisref,
        reqLoadFunc,
        loadFunc,
        result,

        docURI;

    node = this.getNativeNode();

    //  We return if newContent isn't valid and clear ourself if newContent is
    //  the empty String.
    if (TP.notValid(newContent)) {
        return;
    } else if (newContent === '') {
        return this.empty();
    }

    request = TP.request(aRequest);
    content = TP.unwrap(newContent);

    if (!TP.isKindOf(content, Node) && !TP.isString(content)) {

        //  If the content is an Array, then we want the individual
        //  '.asString()' representations of each item - not what Array gives
        //  us.
        if (TP.isArray(arrContent = content)) {
            content = '';
            arrContent.perform(
                    function(item) {
                        content += TP.str(item);
                    });
        } else {
            content = TP.str(content);
        }
    }

    func = this.getContentPrimitive(TP.UPDATE);
    thisref = this;

    if (TP.isEmpty(docURI = request.at('uri')) &&
        TP.isKindOf(newContent, TP.core.Node)) {
        docURI = newContent.get('uri');
    }
    if (TP.isDocument(node) && TP.notEmpty(docURI)) {
        //  NB: We pass true to force the document URI to update.
        TP.documentSetLocation(node, docURI.getLocation(), true);
    }

    if (TP.isCallable(reqLoadFunc = request.at(TP.ONLOAD))) {
        loadFunc =
            function(targetNode, newNode) {

                reqLoadFunc(targetNode, newNode);

                if (TP.notFalse(shouldSignal)) {
                    thisref.changed('content', TP.UPDATE);
                }
            };
    } else {
        loadFunc =
            function(targetNode, newNode) {

                thisref.contentReplaceCallback(targetNode);

                if (TP.notFalse(shouldSignal)) {
                    thisref.changed('content', TP.UPDATE);
                }
            };
    }

    //  Note how we default the 'awaken' setting here:

    //  If this is not a Document node, content drawn from here will be awakened
    //  when the nodes are placed into a visible DOM, so we don't awaken them
    //  here. But, if this is a Document node, we need to manually configure the
    //  nodes to be awakened.

    result = func(node,
                    content,
                    loadFunc,
                    TP.ifKeyInvalid(request, 'awaken', TP.isDocument(node)));

    //  If we're an Element and we're flagging changes, go ahead and do that
    //  now.
    if (TP.isElement(node) && this.shouldFlagChanges()) {
        TP.elementFlagChange(node, TP.SELF, TP.UPDATE);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(node)) : 0;
    }

    //  The primitive will have returned a native Node, but we need to
    //  return a TP.core.Node.
    return TP.wrap(result);
});

//  ------------------------------------------------------------------------
//  NODE CONTENT COLLECTIONS
//  ------------------------------------------------------------------------

/*
Operations to acquire structurally related elements from a Node.
*/

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getAncestors',
function() {

    /**
     * @method getAncestors
     * @summary Returns an Array containing the parent nodes of the receiver.
     *     This list ends with the top level node.
     * @returns {Array} An Array of the parent nodes of the supplied Node.
     */

    return TP.wrap(TP.nodeGetAncestors(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getChildIndex',
function(aChild) {

    /**
     * @method getChildIndex
     * @summary Returns the index in the childNodes array for the child
     *     provided. If aChild couldn't be found in the aNode, this method
     *     returns TP.NOT_FOUND.
     * @param {Node} aChild The node to find.
     * @returns {Number} The index number, or TP.NOT_FOUND.
     */

    return TP.nodeGetChildIndex(this.getNativeNode(), aChild);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getChildNodes',
function() {

    /**
     * @method getChildNodes
     * @summary Returns an Array of the child nodes of the receiver.
     * @returns {Array} An Array of the child nodes of the receiver.
     */

    return TP.wrap(TP.nodeGetChildNodes(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getChildElementAt',
function(anIndex) {

    /**
     * @method getChildElementAt
     * @summary Returns the child element of the receiver at the index
     *     provided, if such a child exists. Note that the index provided is
     *     used relative to children which are Element nodes only.
     * @param {Number} anIndex The index in question.
     * @returns {TP.core.ElementNode} The child element of the supplied Node at
     *     the supplied index.
     */

    return TP.wrap(TP.nodeGetChildElementAt(this.getNativeNode(),
                                            anIndex));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getChildElements',
function() {

    /**
     * @method getChildElements
     * @summary Returns an Array of the children of the receiver which are
     *     Element nodes.
     * @returns {Array} An Array of the Element children of the supplied Node.
     */

    return TP.wrap(TP.nodeGetChildElements(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getDescendants',
function(breadthFirst) {

    /**
     * @method getDescendants
     * @summary Returns an Array of the children, grandchildren, and so on of
     *     the receiver. Note that for a variety of reasons the return values
     *     from this call are not likely to be the same across browsers,
     *     primarily due to different handling of whitespace (Node.TEXT_NODE) in
     *     the various DOM parsers.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {Array} An Array containing the nodes found.
     */

    return TP.wrap(TP.nodeGetDescendants(this.getNativeNode(),
                                            breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getDescendantsByType',
function(aType, breadthFirst) {

    /**
     * @method getDescendantsByType
     * @summary Returns an Array of the children, grandchildren, and so on of
     *     the receiver whose node type matches the type provided. Note that if
     *     the type is Node.TEXT_NODE a normalize() call is done to return the
     *     largest possible node content.
     * @param {Number} aType The DOM node type constant to match against.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {Array} An Array containing the nodes found.
     */

    return TP.wrap(TP.nodeGetDescendantsByType(this.getNativeNode(),
                                                aType,
                                                breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getDescendantElements',
function(breadthFirst) {

    /**
     * @method getDescendantElements
     * @summary Returns an Array of the children, grandchildren, and so on of
     *     the receiver which are Element nodes.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {Array} An Array of the Element descendants of the supplied
     *     Node.
     */

    return TP.wrap(TP.nodeGetDescendantElements(this.getNativeNode(),
                                                breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getDescendantElementsByAttribute',
function(attrName, attrValue, breadthFirst) {

    /**
     * @method getDescendantElementsByAttribute
     * @summary Returns an Array containing descendants of the receiver which
     *     are Element nodes and which contain an attribute name/value matching
     *     the value provided.
     * @description If the supplied attribute value is null, this method will
     *     return Element nodes that have any value for the named attribute, no
     *     matter its value.
     * @param {String} attrName The attribute to test for.
     * @param {Object} attrValue The attribute value to check.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {Array} An Array containing the nodes found.
     */

    return TP.wrap(TP.nodeGetDescendantElementsByAttribute(
                                                    this.getNativeNode(),
                                                    attrName,
                                                    attrValue,
                                                    breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getDescendantElementsByAttributePrefix',
function(attrPrefix, attrValue, breadthFirst) {

    /**
     * @method getDescendantElementsByAttributePrefix
     * @summary Returns an Array of the children, grandchildren, and so on of
     *     the receiver which are Element nodes and which contain an attribute
     *     name prefixed as required and whose value matches the optionally
     *     supplied value.
     * @description If the supplied attribute value is null, this method will
     *     return Element nodes that have any value for the named attribute, no
     *     matter its value.
     * @param {String} attrPrefix The prefix string to test for.
     * @param {Object} attrValue The attribute value to check.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {Array} An Array containing the nodes found.
     */

    return TP.wrap(TP.nodeGetDescendantElementsByAttributePrefix(
                                                    this.getNativeNode(),
                                                    attrPrefix,
                                                    attrValue,
                                                    breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getDescendantElementsByIdOrName',
function(anIdOrName) {

    /**
     * @method getDescendantElementsByIdOrName
     * @summary Returns any elements that can be found which have either the ID
     *     or Name provided.
     * @description For HTML documents where radio buttons often use the 'name'
     *     attribute as an identifier rather than 'id' we need a way to query
     *     the document for elements matching an identifier which might be
     *     either a name or id value.
     *
     *     This method gives preference to ID values, then searches for
     *     elements with the matching name value, returning an array in both
     *     cases. Since this method is an "Or" rather than "And" it has the
     *     effect of discouraging markup which uses an ID as the value of the
     *     name attribute for other elements, at least as far as it applies to
     *     this function.
     *
     *     NOTE: Since this function is used during event arming that means
     *     elements with a name value that overlaps with an ID cannot be armed
     *     using normal mechanisms.
     * @param {String} anIdOrName The ID or name of the element to find.
     * @returns {Array} The objects whose name is equal to anIdOrName or empty
     *     if there are no objects with that name.
     */

    return TP.wrap(TP.nodeGetDescendantElementsByIdOrName(
                                                this.getNativeNode(),
                                                anIdOrName));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getDescendantElementsByName',
function(aName) {

    /**
     * @method getDescendantElementsByName
     * @summary Returns an Array containing any descendants of the receiver
     *     which are Element nodes and whose 'name' attributes match the name
     *     provided.
     * @param {String} aName The value of the 'name' attribute to search for.
     * @returns {Array} An Array containing native elements found.
     */

    return TP.wrap(TP.nodeGetDescendantElementsByName(
                                            this.getNativeNode(),
                                            aName));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getElementsByClassName',
function(aClassName) {

    /**
     * @method getElementsByClassName
     * @summary Returns an Array of Elements under the receiver whose CSS class
     *     name matches aClassName.
     * @param {String} aClassName The class name to use to find matching
     *     elements. Multiple class names should be space separated.
     * @returns {Array} An Array of Elements under anElement whose CSS class
     *     name matches aClassName.
     */

    return TP.wrap(TP.nodeGetElementsByClassName(this.getNativeNode(),
                                                    aClassName));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getElementById',
function(anID, retryWithXPath) {

    /**
     * @method getElementById
     * @summary Returns the element with the ID specified, if found in the
     *     receiver's DOM hierarchy.
     * @param {String} anID The unique ID to search for.
     * @param {Boolean} retryWithXPath True will force TIBET to use an XPath
     *     search for id attributes when the native call fails.
     * @returns {TP.core.ElementNode} A TP.core.ElementNode wrapping the node
     *     with the ID specified.
     */

    if (TP.isPrototype(this)) {
        return;
    }

    return TP.wrap(TP.nodeGetElementById(this.getNativeNode(),
                                            anID,
                                            retryWithXPath));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getElementByIndex',
function(anIndex) {

    /**
     * @method getElementByIndex
     * @summary Returns the element at the specified index.
     * @description When using this method indexes are in the form consistent
     *     with the element() scheme in XPointer and those from
     *     TP.elementGetDocumentIndex(). When invoked with a non-document node
     *     the index is taken to be relative to the receiving node.
     * @param {String} anIndex The index to search for.
     * @returns {TP.core.ElementNode} The element with the index specified.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getElementsBySelector',
function(aSelectorStr) {

    /**
     * @method getElementsBySelector
     * @summary Returns any elements matching the selector given in the
     *     supplied selector String.
     * @param {Node} aNode The node to begin the search. If this parameter is
     *     null, the entire document is searched.
     * @param {String} aSelectorStr The CSS selector to use to search the DOM.
     * @returns {Array} An Array containing native elements found.
     */

    return TP.wrap(TP.nodeEvaluateCSS(this.getNativeNode(),
                                        aSelectorStr));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getElementsByTagName',
function(aName, aNamespaceURI) {

    /**
     * @method getElementsByTagName
     * @summary Returns an Array containing any descendant elements of the
     *     supplied node whose tag names match the name provided. Note that this
     *     function can deal properly with namespace-qualified tag names across
     *     platforms.
     * @description This method merely returns the result of calling the TIBET
     *     DOM primitive call TP.nodeGetElementsByTagName() on the receiver's
     *     native node and then TP.wrap()ing the result. See that function for
     *     more information on the capabilities of this method.
     * @param {String} aName The string tagname to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @returns {Array} An Array containing elements found.
     */

    return TP.wrap(TP.nodeGetElementsByTagName(this.getNativeNode(),
                                                aName,
                                                aNamespaceURI));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getSiblings',
function() {

    /**
     * @method getSiblings
     * @summary Returns an Array containing the sibling nodes of the receiver.
     *     Order is from the parent's first child to the parent's last child,
     *     with aNode removed from the list.
     * @returns {Array} An Array containing the nodes found.
     */

    return TP.wrap(TP.nodeGetSiblings(this.getNativeNode()));
});

//  ------------------------------------------------------------------------
//  XPATH SUPPORT
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('generateXPathTo',
function(aNode) {

    /**
     * @method generateXPathTo
     * @summary Generates a 'simple' XPath expression that would access the
     *     supplied node from the receiver's native node.
     * @param {Node|TP.core.Node} aNode The node to generate the path to.
     * @exception TP.sig.InvalidNode
     * @returns {String} The generated XPath expression.
     */

    var node,

        targetNode,

        pathStr,
        theNode,

        stopNode;

    node = this.getNativeNode();

    //  In case aNode was a TP.core.Node.
    targetNode = TP.unwrap(aNode);

    if (!TP.isNode(targetNode)) {
        return this.raise('TP.sig.InvalidNode',
                            'No node provided.');
    }

    //  Need to check to make sure that targetNode is a descendant of our
    //  native node.
    if (TP.notTrue(TP.nodeContainsNode(node, targetNode))) {
        return this.raise('TP.sig.InvalidNode',
                            'Node provided not descendant of receiver.');
    }

    //  First, we need to see if targetNode is an attribute node or not
    if (targetNode.nodeType === Node.ATTRIBUTE_NODE) {
        pathStr = '/@' + targetNode.name;
        theNode = TP.attributeGetOwnerElement(targetNode);
    } else {
        pathStr = '/' + targetNode.tagName;
        theNode = targetNode.parentNode;
    }

    node = this.getNativeNode();

    if (TP.isDocument(node)) {
        if (TP.isEmpty(node)) {
            //  no nodes? then no real path, but return what we've got
            return pathStr;
        }

        stopNode = node.documentElement.parentNode;
    } else {
        stopNode = node;
    }

    //  TODO: Need to detect if we're at a place where there are multiple
    //  occurrences of the same named element and then generate an index
    //  predicate onto that step in the path.
    while (TP.isNode(theNode) && theNode !== stopNode) {
        pathStr = '/' + theNode.tagName + pathStr;
        theNode = theNode.parentNode;
    }

    return pathStr;
});

//  ------------------------------------------------------------------------
//  CHILD TEXT VALUES
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getChildTextContent',
function(aName, aNamespaceURI) {

    /**
     * @method getChildTextContent
     * @summary Returns the normalized text content of the first child element
     *     with the tag name provided. This is a useful method for pulling apart
     *     nodes which essentially represent lists.
     * @param {String} aName The child tag name to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @returns {String} The text content of the text child of the first Element
     *     under the receiver whose tag name matches the supplied name (after
     *     all Text nodes under it have been normalized).
     */

    return TP.nodeGetChildTextContent(this.getNativeNode(),
                                        aName,
                                        aNamespaceURI);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('setChildTextContent',
function(aString, aName, aNamespaceURI) {

    /**
     * @method setChildTextContent
     * @summary Sets the text value of the receiver's first element with a tag
     *     name of aName. This is a useful wrapper for manipulating nodes which
     *     essentially represent lists.
     * @param {String} aName The tag/element name to match.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @param {String} aString The content text to set.
     * @returns {TP.core.Node} The receiver.
     */

    //  NOTE the localization here
    TP.nodeSetChildTextContent(
                    this.getNativeNode(),
                    aString.localize(this.getContentLanguage()),
                    aName,
                    aNamespaceURI);

    this.changed('value', TP.UPDATE);

    return this;
});

//  ------------------------------------------------------------------------
//  ANCESTOR SEARCH
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstAncestorByAttribute',
function(attrName, attrValue) {

    /**
     * @method getFirstAncestorByAttribute
     * @summary Returns the first element ancestor of the receiver which has an
     *     attribute matching attrName and whose value matches the optional
     *     attrValue provided.
     * @description This is a commonly used method in widget construction where
     *     an inner element is looking outward for its containing widget or
     *     control, often during event dispatch.
     * @param {String} attrName The attribute to test for.
     * @param {Object} attrValue The optional attribute value to check.
     * @returns {TP.core.ElementNode} An element ancestor of the node.
     * @exception TP.sig.InvalidParameter Raised when a node that isn't of type
     *     Node.ELEMENT_NODE or Node.DOCUMENT_NODE is provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     */

    return TP.wrap(TP.nodeGetFirstAncestorByAttribute(
                                this.getNativeNode(),
                                attrName,
                                attrValue,
                                true));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstAncestorByTagName',
function(aTagName, aNamespaceURI) {

    /**
     * @method getFirstAncestorByTagName
     * @summary Returns the first element ancestor of the receiver which
     *     matches the name and optional namespace URI provided.
     * @description This is a commonly used method in widget construction where
     *     an inner element is looking outward for its containing widget or
     *     control, often during event dispatch.
     * @param {String} aTagName The string tagname to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @returns {TP.core.ElementNode} An element ancestor of the node.
     * @exception TP.sig.InvalidParameter Raised when a node that isn't of type
     *     Node.ELEMENT_NODE or Node.DOCUMENT_NODE is provided to the method.
     * @exception TP.sig.InvalidName Raised when the supplied tag name is empty.
     */

    return TP.wrap(TP.nodeGetFirstAncestorByTagName(
                                this.getNativeNode(),
                                aTagName,
                                aNamespaceURI));
});

//  ------------------------------------------------------------------------
//  FIRST CHILD/ELEMENT SEARCH
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstElementChildByAttribute',
function(attrName, attrValue) {

    /**
     * @method getFirstElementChildByAttribute
     * @summary Returns the first element child of the node which has an
     *     attribute matching attrName and whose value matches the optional
     *     attrValue provided.
     * @param {String} attrName The attribute to test for.
     * @param {Object} attrValue The attribute value to check.
     * @returns {TP.core.ElementNode} An element child of the node.
     */

    return TP.wrap(TP.nodeGetFirstElementChildByAttribute(
                                                    this.getNativeNode(),
                                                    attrName,
                                                    attrValue));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstElementChildByTagName',
function(aName, aNamespaceURI) {

    /**
     * @method getFirstElementChildByTagName
     * @summary Returns the first element descendant of the node which matches
     *     the name and optional namespace URI provided.
     * @description This is a commonly used method in widget construction where
     *     the outer widget is looking for specific parts of its content.
     * @param {String} aName The string tagname to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @returns {TP.core.ElementNode} An element descendant of the node.
     */

    return TP.wrap(TP.nodeGetFirstElementChildByTagName(
                                                    this.getNativeNode(),
                                                    aName,
                                                    aNamespaceURI));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstChildByType',
function(aType) {

    /**
     * @method getFirstChildByType
     * @summary Returns the first child of the node which has a nodeType
     *     matching the type provided.
     * @param {Number} aType A DOM Node nodeType constant.
     * @returns {TP.core.Node} A child of the node.
     */

    return TP.wrap(TP.nodeGetFirstChildByType(this.getNativeNode(),
                                                aType));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstChildContentNode',
function() {

    /**
     * @method getFirstChildContentNode
     * @summary Returns the first "content" child of the receiver, the first
     *     text or CDATA child node.
     * @returns {TP.core.TextNode|TP.core.CDATASectionNode} The first text child
     *     of the receiver.
     */

    return TP.wrap(TP.nodeGetFirstChildContentNode(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstChildElement',
function() {

    /**
     * @method getFirstChildElement
     * @summary Returns the first element child of the node.
     * @description This method is a replacement for node.firstChild which
     *     ensures that text nodes, comment nodes, and other node types don't
     *     break your code when you're assuming element nodes.
     * @returns {TP.core.ElementNode} An element child of the node.
     */

    return TP.wrap(TP.nodeGetFirstChildElement(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstDescendantByType',
function(aType) {

    /**
     * @method getFirstDescendantByType
     * @summary Returns the first descendant of the node which has a nodeType
     *     matching the type provided.
     * @param {Node} aNode The node to process.
     * @param {Number} aType A Node.nodeType constant.
     * @returns {TP.core.Node} A descendant of the node.
     */


    return TP.wrap(TP.nodeGetFirstDescendantByType(this.getNativeNode(),
                                                    aType));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstElementByAttribute',
function(attrName, attrValue) {

    /**
     * @method getFirstElementByAttribute
     * @summary Returns the first element descendant of the node which has an
     *     attribute matching attrName and whose value matches the optional
     *     attrValue provided.
     * @param {String} attrName The attribute to test for.
     * @param {Object} attrValue The attribute value to check.
     * @returns {TP.core.ElementNode} An element descendant of the node.
     */

    return TP.wrap(TP.nodeGetFirstElementByAttribute(this.getNativeNode(),
                                                        attrName,
                                                        attrValue));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstElementByTagName',
function(aName, aNamespaceURI) {

    /**
     * @method getFirstElementByTagName
     * @summary Returns the first element descendant of the node which matches
     *     the name and optional namespace URI provided.
     * @description This is a commonly used method in widget construction where
     *     the outer widget is looking for specific parts of its content.
     * @param {String} aName The string tagname to search for.
     * @param {String} aNamespaceURI The namespace URI to search for.
     * @returns {TP.core.ElementNode} An element descendant of the node.
     */

    return TP.wrap(TP.nodeGetFirstElementByTagName(this.getNativeNode(),
                                                    aName,
                                                    aNamespaceURI));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getFirstSiblingElement',
function(direction) {

    /**
     * @method getFirstSiblingElement
     * @summary Returns the next, or previous sibling of the receiver which is
     *     an element. This is a useful operation when trying to iterate over
     *     only elements within a particular set of nodes.
     * @param {String} aDirection TP.NEXT or TP.PREVIOUS. The default is TP.NEXT
     *     so searching is forward.
     * @returns {TP.core.ElementNode} The first sibling.
     */

    return TP.wrap(TP.nodeGetFirstSiblingElement(this.getNativeNode(),
                                                    direction));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getNextNonChild',
function(nodeType) {

    /**
     * @method getNextNonChild
     * @summary Returns the next node in document order that isn't a child of
     *     the node provided. This will often be the receiver's nextSibling, but
     *     it may be a different node when the receiver has no nextSibling. Note
     *     that the last node in document order won't return a valid node here.
     * @param {Number} nodeType A valid nodeType constant. Defaults to any node
     *     type.
     * @returns {TP.core.Node} The next TP.core.Node in document order.
     */

    return TP.wrap(TP.nodeGetNextNonChild(this.getNativeNode(), nodeType));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getTopAncestor',
function() {

    /**
     * @method getTopAncestor
     * @summary Returns the top-most node in the receiver's ancestor chain.
     *     This is typically a Document node (#document) but will be an Element
     *     or the node itself if the receiver is in a detached tree branch.
     * @returns {TP.core.Node} The topmost TP.core.Node.
     */

    return TP.wrap(TP.nodeGetTopAncestor(this.getNativeNode()));
});

//  ------------------------------------------------------------------------
//  NODE COLLECTION ITERATION
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('ancestorsDetect',
function(aFunction) {

    /**
     * @method ancestorsDetect
     * @summary Returns the first ancestor of the receiver for whom aFunction
     *     returns true.
     * @param {Function} aFunction A function taking a node and returning a
     *     node.
     */

    return TP.nodeDetectAncestor(this.getNativeNode(), aFunction);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('ancestorMatchingCSS',
function(aSelector, stopAncestor) {

    /**
     * @method ancestorMatchingCSS
     * @summary Returns the first ancestor of the receiver for which aSelector
     *     matches.
     * @param {String} aSelector The selector to match.
     * @param {Element} [stopAncestor] The ancestor to stop at. If not supplied,
     *     this would be identical to the document node of the document that
     *     the receiver is contained in.
     * @returns {?TP.core.ElementNode} The ancestor element that matches the
     *     CSS.
     */

    return TP.wrap(TP.nodeAncestorMatchingCSS(this.getNativeNode(),
                                                aSelector,
                                                stopAncestor));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('ancestorsPerform',
function(aFunction) {

    /**
     * @method ancestorsPerform
     * @summary Executes aFunction with each ancestor of the node, working from
     *     the node outward.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate.
     * @param {Function} aFunction A function which performs some action with an
     *     element node.
     */

    return TP.nodeAncestorsPerform(this.getNativeNode(), aFunction);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('ancestorsSelect',
function(aFunction) {

    /**
     * @method ancestorsSelect
     * @summary Returns a collection of the receiver's ancestors for whom
     *     aFunction return true.
     * @param {Function} aFunction A function taking a node and returning a
     *     node.
     */

    return TP.nodeSelectAncestors(this.getNativeNode(), aFunction);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('childElementsPerform',
function(aFunction) {

    /**
     * @method childElementsPerform
     * @summary Executes aFunction with each child element of the node.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate.
     *     Note the filter here for child nodes that are elements. The index
     *     provided to aFunction is the index that would be used had you
     *     collected the elements first, then iterated on that array. This also
     *     means that, if the first or last node are not elements, the iteration
     *     function will not be called.
     * @param {Function} aFunction A function which performs some action with
     *     each element provided.
     */

    return TP.nodeChildElementsPerform(this.getNativeNode(),
                                        aFunction);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('childNodesPerform',
function(aFunction) {

    /**
     * @method childNodesPerform
     * @summary Executes aFunction with each child node of the node. NOTE that
     *     as part of the processing here the node is normalized to coalesce
     *     adjacent text nodes.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     */

    return TP.nodeChildNodesPerform(this.getNativeNode(),
                                    aFunction);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('descendantsPerform',
function(aFunction, breadthFirst) {

    /**
     * @method descendantsPerform
     * @summary Executes aFunction with each descendant of the node.
     * @description aFunction implementations can return TP.BREAK to terminate
     *     the traversal, TP.CONTINUE to allow you to skip child content under
     *     an element and proceed to the next non-child element node for
     *     processing (only when the current item is an Element, not non-Element
     *     content) or TP.DESCEND to descend into child element content. If you
     *     need to reverse the iteration use TP.nodeGetDescendants() to get the
     *     descendant list and then use Array's perform operation.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     */

    return TP.nodeDescendantsPerform(this.getNativeNode(),
                                        aFunction,
                                        breadthFirst);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('descendantElementsPerform',
function(aFunction, breadthFirst) {

    /**
     * @method descendantElementsPerform
     * @summary Executes aFunction with each element descendant of the node.
     * @description aFunction implementations can return TP.BREAK to terminate
     *     the traversal, TP.CONTINUE to allow you to skip child content under
     *     an element and proceed to the next non-child element node for
     *     processing (only when the current item is an Element, not non-Element
     *     content) or TP.DESCEND to descend into child element content. If you
     *     need to reverse the iteration use TP.nodeGetDescendantElements() to
     *     get the descendant element list and then use Array's perform
     *     operation.
     * @param {Function} aFunction A function which performs some action with
     *     each element provided.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     */

    return TP.nodeDescendantElementsPerform(this.getNativeNode(),
                                            aFunction,
                                            breadthFirst);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('siblingsPerform',
function(aFunction, aSubset) {

    /**
     * @method siblingsPerform
     * @summary Executes aFunction with each sibling of the node.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate.
     *     Note that the index provided to aFunction is the index
     *     that would have been used had you collected the siblings in an array
     *     first, then iterated.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     */

    return TP.nodeSiblingsPerform(this.getNativeNode(),
                                    aFunction,
                                    aSubset);
});

//  ------------------------------------------------------------------------
//  NODE CONTENT DETECTION
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectAncestor',
function(aFunction) {

    /**
     * @method detectAncestor
     * @summary Returns the first ancestor of the node for which aFunction
     *     returns true. The normal direction of this search is from the node
     *     "outward" toward the document root.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @returns {TP.core.ElementNode} An ancestor found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeDetectAncestor(this.getNativeNode(),
                                            aFunction));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectChildElement',
function(aFunction) {

    /**
     * @method detectChildElement
     * @summary Returns the first child element of the receiver for which
     *     aFunction returns true. Iteration is from firstChild to lastChild.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @returns {TP.core.ElementNode} A child element found acceptable by
     *     aFunction.
     */

    return TP.wrap(TP.nodeDetectChildElement(this.getNativeNode(),
                                                aFunction));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectChildNode',
function(aFunction) {

    /**
     * @method detectChildNode
     * @summary Returns the first child node of the node for which aFunction
     *     returns true. Iteration is from firstChild to lastChild.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @returns {TP.core.Node} A child node found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeDetectChildNode(this.getNativeNode(),
                                            aFunction));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectDescendant',
function(aFunction, breadthFirst) {

    /**
     * @method detectDescendant
     * @summary Returns the first descendant of the node for which aFunction
     *     returns true. Search is typically downward in a depth-first fashion.
     * @description Note that you can't reverse this detection process. To
     *     perform a reverse detection use nodeGetDescendants() to get the
     *     collection in the order you desire and iterate on that.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {TP.core.Node} A descendant found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeDetectDescendant(this.getNativeNode(),
                                            aFunction,
                                            breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectDescendantElement',
function(aFunction, breadthFirst) {

    /**
     * @method detectDescendantElement
     * @summary Returns the first element descendant of the node for which
     *     aFunction returns true. Search is typically downward in a depth-first
     *     fashion.
     * @description Note that you can't reverse this detection process. To
     *     perform a reverse detection use TP.nodeGetDescendantElements() to get
     *     the collection in the order you desire and iterate on that
     *     collection.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {TP.core.ElementNode} A descendant element found acceptable by
     *     aFunction.
     */

    return TP.wrap(TP.nodeDetectDescendantElement(this.getNativeNode(),
                                                    aFunction,
                                                    breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectSibling',
function(aFunction, aSubset) {

    /**
     * @method detectSibling
     * @summary Returns the first sibling node (next, previous, or any) of the
     *     node for which aFunction returns true.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @returns {TP.core.Node} A sibling found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeDetectSibling(this.getNativeNode(),
                                        aFunction,
                                        aSubset));
});

//  ------------------------------------------------------------------------
//  NODE SELECTION (FILTERING)
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectAncestors',
function(aFunction) {

    /**
     * @method selectAncestors
     * @summary Returns an array of ancestors of the node for which aFunction
     *     returns true. The normal direction of this search is from the node
     *     "outward" toward the document root.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @returns {Array} An Array of ancestors found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectAncestors(this.getNativeNode(),
                                            aFunction));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectChildElements',
function(aFunction) {

    /**
     * @method selectChildElements
     * @summary Returns an array of child elements of the receiver for which
     *     aFunction returns true. Iteration is from firstChild to lastChild.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @returns {TP.core.Node} A child element found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectChildElements(this.getNativeNode(),
                                                aFunction));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectChildNodes',
function(aFunction) {

    /**
     * @method selectChildNodes
     * @summary Returns an Array of children of the node for which aFunction
     *     returns true. Iteration is from firstChild to lastChild.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @returns {Node} A child node found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectChildNodes(this.getNativeNode(),
                                            aFunction));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectDescendants',
function(aFunction, breadthFirst) {

    /**
     * @method selectDescendants
     * @summary Returns an Array of descendants of the node for which aFunction
     *     returns true. Search is typically downward in a depth-first fashion.
     * @description Note that you can't reverse this selection process. To
     *     perform a reverse selection use nodeGetDescendants() to get the
     *     collection in the order you desire and iterate on that.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {Node} An descendant found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectDescendants(this.getNativeNode(),
                                            aFunction,
                                            breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectDescendantElements',
function(aFunction, breadthFirst) {

    /**
     * @method selectDescendantElements
     * @summary Returns an Array of descendant elements of the node for which
     *     aFunction returns true. Search is typically downward in a depth-first
     *     fashion.
     * @description Note that you can't reverse this selection process. To
     *     perform a reverse selection use TP.nodeGetDescendantElements() to get
     *     the collection in the order you desire and iterate on that
     *     collection.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} breadthFirst Breadth first if true. Default is false,
     *     meaning depth first.
     * @returns {Array} An array of descendant elements found acceptable by
     *     aFunction.
     */

    return TP.wrap(TP.nodeSelectDescendantElements(this.getNativeNode(),
                                                    aFunction,
                                                    breadthFirst));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectSiblings',
function(aFunction, aSubset) {

    /**
     * @method selectSiblings
     * @summary Returns an array of siblings (next, previous, or any) of the
     *     node for which aFunction returns true.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @returns {Array} An Array of siblings found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectDescendants(this.getNativeNode(),
                                            aFunction,
                                            aSubset));
});

//  ------------------------------------------------------------------------
//  NODE MODIFICATION
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('copyChildNodesTo',
function(toNode, beforeNode) {

    /**
     * @method copyChildNodesTo
     * @summary Copies children of the receiver to another node.
     * @param {Node} toNode The target node.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @returns {TP.core.Node} The first copied child node. This will be a
     *     different node than what was the first child node of the receiver, as
     *     the node will have been copied and might have been imported.
     */

    var node,

        retVal,

        oldSize,
        newSize;

    node = this.getNativeNode();

    try {
        oldSize = node.childNodes.length;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error reading child nodes length.')) : 0;
    }

    retVal = TP.nodeCopyChildNodesTo(node, toNode, beforeNode);

    try {
        newSize = node.childNodes.length;
        if (newSize < oldSize) {
            this.changed('content', TP.DELETE);
        } else if (newSize > oldSize) {
            this.changed('content', TP.INSERT);
        } else {
            this.changed('content', TP.UPDATE);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error reading child nodes length.')) : 0;
    }

    return TP.wrap(retVal);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('moveChildNodesTo',
function(toNode, beforeNode) {

    /**
     * @method moveChildNodesTo
     * @summary Moves children of the receiver to another node.
     * @param {Node} toNode The target node.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @returns {TP.core.Node} The first moved child node. This will be a
     *     different node than what was the first child node of the receiver, as
     *     the node will have been copied and might have been imported.
     */

    var node,

        retVal,

        oldSize,
        newSize;

    node = this.getNativeNode();

    try {
        oldSize = node.childNodes.length;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error reading child nodes length.')) : 0;
    }

    retVal = TP.nodeMoveChildNodesTo(node, toNode, beforeNode);

    try {
        newSize = node.childNodes.length;
        if (newSize < oldSize) {
            this.changed('content', TP.DELETE);
        } else if (newSize > oldSize) {
            this.changed('content', TP.INSERT);
        } else {
            this.changed('content', TP.UPDATE);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error reading child nodes length.')) : 0;
    }

    return TP.wrap(retVal);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeChildElement',
function(anElement) {

    /**
     * @method removeChildElement
     * @summary Removes a specific child *element*, ensuring that proper
     *     flagging and/or removal are done along with change notification.
     * @param {Element} anElement A specific child/descendant element.
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node,
        child;

    node = this.getNativeNode();

    child = anElement;

    if (this.shouldFlagChanges()) {
        //  if we're flagging rather than 'doing' then we set the change flag to
        //  TP.DELETE and that's all
        TP.elementFlagChange(child, TP.SELF, TP.DELETE);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(child)) : 0;
    } else {
        //  if we're not flagging then just rip it out of the DOM
        TP.nodeRemoveChild(node, child);
    }

    this.changed('content', TP.DELETE);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeChildElementAt',
function(anIndex) {

    /**
     * @method removeChildElementAt
     * @summary Removes the child element at the supplied index, ensuring that
     *     proper flagging and/or removal are done along with change
     *     notification.
     * @param {Number} anIndex The index of the child *element*
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var child;

    child = TP.unwrap(this.getChildElementAt(anIndex));
    if (!TP.isElement(child)) {
        return this.raise(
                'TP.sig.InvalidIndex',
                'Invalid index: ' + anIndex);
    }

    return this.removeChildElement(child);
});

//  ------------------------------------------------------------------------
//  TP.api.CollectionAPI
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('add',
function() {

    /**
     * @method add
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node,
        len,
        i;

    node = this.getNativeNode();

    len = this.length;

    for (i = 0; i < arguments.length; i++) {

        //  Note that we use the low-level primitive here rather than
        //  'addContent()' / 'addRawContent()' because this is a
        //  'lower-level' API and we don't want processed content.
        TP.nodeAddContent(node, arguments[i], null, false);
    }

    if (arguments.length > 0) {
        this.changed('length', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAll',
function() {

    /**
     * @method addAll
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllIfAbsent',
function() {

    /**
     * @method addAllIfAbsent
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addIfAbsent',
function() {

    /**
     * @method addIfAbsent
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addItem',
function() {

    /**
     * @method addItem
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addWithCount',
function() {

    /**
     * @method addWithCount
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('asArray',
function() {

    /**
     * @method asArray
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('asHash',
function() {

    /**
     * @method asHash
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('asIterator',
function() {

    /**
     * @method asIterator
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('asRange',
function() {

    /**
     * @method asRange
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  asString                    TP.core.Node
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('collapse',
function() {

    /**
     * @method collapse
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('collect',
function(aFunction, deep, breadthFirst) {

    /**
     * @method collect
     * @summary Runs aFunction iteratively over each element of the receiver
     *     and returns an Array containing the return values.
     * @param {Function} aFunction A function taking 2 parameters, the current
     *     item and index.
     * @param {Boolean} deep Should the iteration cover all descendant nodes as
     *     well? Defaults to false so only direct children are involved.
     * @param {Boolean} breadthFirst True will capture descendants in
     *     breadth-first order. Only used when deep is true.
     * @returns {Array} The return values from each iteration of the supplied
     *     Function.
     */

    var node;

    node = this.getNativeNode();

    //  NB: We do *not* wrap the return results of these invocations, since
    //  they very well may not be returning Nodes.

    if (TP.ifInvalid(deep, false)) {
        return TP.nodeGetDescendants(node, breadthFirst).collect(aFunction);
    } else {
        return TP.ac(node.childNodes).collect(aFunction);
    }
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('collectGet',
function() {

    /**
     * @method collectGet
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('collectInvoke',
function() {

    /**
     * @method collectInvoke
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('compact',
function() {

    /**
     * @method compact
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('conform',
function() {

    /**
     * @method conform
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('contains',
function(aDescendant, aTest) {

    /**
     * @method contains
     * @summary Returns whether or not the receiver is an ancestor (or the
     *     document for) aDescendant. If the receiver is a TP.core.DocumentNode,
     *     this method will return true if aDescendant's document is the
     *     receiver.
     * @description This method checks 'deeply' throughout the receiver's tree.
     * @param {Node|TP.core.Node} aDescendant Whether or not the receiver
     *     contains the supplied (TP)Node.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Boolean} Whether or not the receiver contains the node
     *     provided.
     */

    var node,
        it;

    node = this.getNativeNode();

    if (aTest === TP.IDENTITY) {
        return TP.nodeContainsNode(node, TP.unwrap(aDescendant));
    }

    it = this.detect(
            function(item, index) {

                return TP.equal(item, aDescendant);
            },
            true);

    //  might contain a null, and nulls can be compared
    return TP.isDefined(it);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('containsAll',
function(aCollection, aTest) {

    /**
     * @method containsAll
     * @summary Returns true if all the elements in the collection provided are
     *     found in the receiver.
     * @param {TP.api.CollectionAPI} aCollection The collection of elements all
     *     of which must be equal to at least one element in the receiver for
     *     this method to return true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains all of the
     *     elements in the collection provided.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('containsAny',
function(aCollection) {

    /**
     * @method containsAny
     * @summary Returns true if any the elements in the collection provided are
     *     found in the receiver.
     * @param {TP.api.CollectionAPI} aCollection The collection of elements any
     *     of which must be equal to at least one element in the receiver for
     *     this method to return true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains any of the
     *     elements in the collection provided.
     */

    return TP.todo();

});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('containsString',
function() {

    /**
     * @method convert
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('convert',
function() {

    /**
     * @method convert
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('countOf',
function(aNode, aTest) {

    /**
     * @method countOf
     * @summary Returns a count of the number of times aNode is found in the
     *     array.
     * @param {Node|TP.core.Node} aNode The element whose value is checked
     *     against.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The number of occurrences of aNode.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detect',
function(aFunction, deep, breadthFirst) {

    /**
     * @method detect
     * @summary Runs aFunction iteratively over each element of the receiver
     *     and returns the first element for which aFunction is true.
     * @param {Function} aFunction A function taking 2 parameters, the current
     *     item and index.
     * @param {Boolean} deep Should the iteration cover all descendant nodes as
     *     well? Defaults to false so only direct children are involved.
     * @param {Boolean} breadthFirst True will capture descendants in
     *     breadth-first order. Only used when deep is true.
     * @returns {TP.core.Node} The first element detected by the supplied
     *     Function.
     */

    var node;

    node = this.getNativeNode();

    if (TP.ifInvalid(deep, false)) {
        return TP.wrap(TP.nodeDetectDescendant(node,
                                                aFunction,
                                                null,
                                                breadthFirst));
    } else {
        return TP.wrap(TP.nodeDetectChildNode(node, aFunction));
    }
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectInvoke',
function() {

    /**
     * @method detectInvoke
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectMax',
function() {

    /**
     * @method detectMax
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectMin',
function() {

    /**
     * @method detectMin
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('difference',
function() {

    /**
     * @method difference
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('disjunction',
function() {

    /**
     * @method disjunction
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('empty',
function() {

    /**
     * @method empty
     * @summary Removes all content nodes (child nodes) from the receiver's
     *     native node, effectively emptying the node.
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node;

    node = this.getNativeNode();

    if (this.shouldFlagChanges()) {
        //  if we're flagging rather than 'doing' then we set the change flag to
        //  TP.DELETE and that's all
        TP.elementFlagChange(node, TP.SELF, TP.DELETE);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(node)) : 0;
    } else {
        //  if we're not flagging then just rip it out of the DOM
        TP.nodeEmptyContent(node);
    }

    this.changed('content', TP.DELETE);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('flatten',
function() {

    /**
     * @method flatten
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getItems',
function() {

    /**
     * @method getItems
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getIterator',
function() {

    /**
     * @method getIterator
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getIteratorType',
function() {

    /**
     * @method getIteratorType
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getSize',
function() {

    /**
     * @method getSize
     * @summary Returns the size of the receiver. For TP.core.CollectionNodes,
     *     this is the number of *child* (not descendant) nodes that they have.
     * @returns {Number} The size of the receiver.
     */

    var node;

    node = this.getNativeNode();

    return node.childNodes.length;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getValues',
function() {

    /**
     * @method getValues
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('grep',
function() {

    /**
     * @method grep
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('groupBy',
function() {

    /**
     * @method groupBy
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('injectInto',
function(aValue, aFunction, deep, breadthFirst) {

    /**
     * @method injectInto
     * @summary Performs the function with each element of the receiver as the
     *     first argument and aValue as the second argument. The current index
     *     is provided as the third argument.
     * @description injectInto allows you to pass an additional value to the
     *     function along with each element of the receiver as it performs the
     *     function. This is useful when attempting to do an operation like
     *     summing all the values in an array where the added variable you pass
     *     in holds the sum.
     *
     *     The actual behavior is embodied in:
     *
     *     aValue = aFunction(this[index], aValue, index)
     *
     *     You should therefore pass a function which expects three arguments
     *     where the first argument is the current array element. On completion
     *     the injected value is returned.
     * @param {Object} aValue The value to pass as the second argument to
     *     aFunction.
     * @param {Function} aFunction A function which performs some action with
     *     the elements it is passed and returns aValue.
     * @param {Boolean} deep Should the iteration cover all descendant nodes as
     *     well? Defaults to false so only direct children are involved.
     * @param {Boolean} breadthFirst True will capture descendants in
     *     breadth-first order. Only used when deep is true.
     * @returns {Object} The value of performing aFunction with aValue over the
     *     receiver.
     */

    var node;

    node = this.getNativeNode();

    if (TP.ifInvalid(deep, false)) {
        return TP.nodeGetDescendants(node, breadthFirst).injectInto(
                                                            aValue,
                                                            aFunction);
    } else {
        return TP.ac(node.childNodes).injectInto(aValue, aFunction);
    }
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('intersection',
function() {

    /**
     * @method intersection
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('isSortedCollection',
function() {

    /**
     * @method isSortedCollection
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('merge',
function() {

    /**
     * @method merge
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('partition',
function() {

    /**
     * @method partition
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('perform',
function(aFunction, deep, breadthFirst) {

    /**
     * @method perform
     * @summary Runs aFunction iteratively over each element of the receiver.
     * @param {Function} aFunction A function taking 2 parameters, the current
     *     item and index.
     * @param {Boolean} deep Should the iteration cover all descendant nodes as
     *     well? Defaults to false so only direct children are involved.
     * @param {Boolean} breadthFirst True will capture descendants in
     *     breadth-first order. Only used when deep is true.
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node;

    node = this.getNativeNode();

    if (TP.ifInvalid(deep, false)) {
        TP.nodeDescendantsPerform(node, aFunction, null, breadthFirst);
    } else {
        TP.nodeChildNodesPerform(node, aFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performInvoke',
function() {

    /**
     * @method performInvoke
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performSet',
function() {

    /**
     * @method performSet
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performUntil',
function() {

    /**
     * @method performUntil
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performWhile',
function() {

    /**
     * @method performWhile
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  performWith         Kernel
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('reject',
function(aFunction, deep, breadthFirst) {

    /**
     * @method reject
     * @summary Runs aFunction iteratively over each element of the receiver
     *     and returns an Array containing the items for which the function
     *     returns false. In other words, the function returns true if the item
     *     should be rejected from the result set.
     * @param {Function} aFunction A function taking 2 parameters, the current
     *     item and index. This function should return true if the item should
     *     be removed from the result set.
     * @param {Boolean} deep Should the iteration cover all descendant nodes as
     *     well? Defaults to false so only direct children are involved.
     * @param {Boolean} breadthFirst True will capture descendants in
     *     breadth-first order. Only used when deep is true.
     * @returns {Array} An Array of TP.core.Nodes that weren't rejected by the
     *     supplied Function.
     */

    var node;

    node = this.getNativeNode();

    if (TP.ifInvalid(deep, false)) {
        return TP.wrap(TP.nodeGetDescendants(node, breadthFirst).reject(
                                                                aFunction));
    } else {
        return TP.wrap(TP.ac(node.childNodes).reject(aFunction));
    }
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('remove',
function(attributeName) {

    /**
     * @method remove
     * @summary Removes the named attribute from the receiver when dealing with
     *     a non-XPath attribute specification, or all nodes matching the XPath
     *     when provided with an XPath.
     * @description In this type, if an XPath is supplied, then it is used to
     *     locate nodes (including attribute nodes) to remove. NB: You *must*
     *     use a '/', '[', '@' or '.' to allow the XPath mechanism to trigger
     *     properly.
     * @param {String} attributeName The attribute name to remove.
     * @exception TP.sig.InvalidParameter
     * @returns {Number}
     */

    var path;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  If the attributeName matches any char that would indicate a valid
    //  XPath expression, then we will remove nodes using that path.
    if (TP.regex.XPATH_PATH.test(attributeName)) {
        path = TP.xpc(attributeName);
        path.shouldFlagChanges(this.shouldFlagChanges());

        //  This will signal change and flag changes (if enabled)
        return path.execRemove(this);
    }

    //  This will signal change and flag changes (if enabled)
    return this.removeAttribute(attributeName);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeAll',
function() {

    /**
     * @method removeAll
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replace',
function() {

    /**
     * @method replace
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replaceAll',
function() {

    /**
     * @method replaceAll
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('select',
function(aFunction, deep, breadthFirst) {

    /**
     * @method select
     * @summary Runs aFunction iteratively over each element of the receiver
     *     and returns an Array containing the elements for which the function
     *     returns true.
     * @param {Function} aFunction A function taking 2 parameters, the current
     *     item and index. This function should return true if the item should
     *     be included in the result set.
     * @param {Boolean} deep Should the iteration cover all descendant nodes as
     *     well? Defaults to false so only direct children are involved.
     * @param {Boolean} breadthFirst True will capture descendants in
     *     breadth-first order. Only used when deep is true.
     * @returns {Array} An Array of TP.core.Nodes that were selected by the
     *     supplied Function.
     */

    var node;

    node = this.getNativeNode();

    if (TP.ifInvalid(deep, false)) {
        return TP.wrap(TP.nodeSelectDescendants(node,
                                                aFunction,
                                                null,
                                                breadthFirst));
    } else {
        return TP.wrap(TP.nodeSelectChildNodes(node, aFunction));
    }
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('union',
function() {

    /**
     * @method union
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('unique',
function() {

    /**
     * @method unique
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  TP.api.IndexedCollectionAPI
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAt',
function(anObject, anIndex, aPosition) {

    /**
     * @method addAt
     * @summary Inserts content into the receiver at the index location
     *     provided. The position defines a "before" or "after" orientation to
     *     the insertion. The default is AfterEnd so the result is like an
     *     appendChild operation.
     * @param {Node|TP.core.Node|Nodelist} anObject A node or nodelist
     *     containing the new content.
     * @param {Number} anIndex The numerical index, corresponding to a childNode
     *     index, or an XPath which selects nodes as "pivot" points.
     * @param {String} aPosition The position to place the content relative to
     *     the receiver. This should be one of four values: TP.BEFORE_BEGIN,
     *     TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END. Default is TP.AFTER_END.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.IndexOutOfRange
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node,

        obj,

        position,
        child,
        results,

        len,
        i,

        objLen,
        j;

    node = this.getNativeNode();

    if (!TP.isNode(anObject) &&
        !TP.isKindOf(anObject, 'TP.core.Node') &&
        !TP.isNodeList(anObject)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Must provide a Node or list of Nodes.');
    }

    obj = TP.unwrap(anObject);

    //  default to an appendChild
    position = TP.ifInvalid(aPosition, TP.AFTER_END);

    //  for XPaths we find the child nodes by running the path, then we can
    //  use them as the pivot points for the content insertion
    if (TP.regex.XPATH_PATH.test(anIndex)) {
        results = this.evaluateXPath(anIndex);
        if (TP.isEmpty(results)) {
            return;
        }

        //  for each node we need to insert the content, either a node or a
        //  set of nodes from a nodelist
        len = results.getSize();
        for (i = 0; i < len; i++) {
            if (TP.isNodeList(obj)) {
                objLen = obj.length;
                for (j = 0; j < objLen; j++) {
                    try {
                        TP.elementInsertContent(
                                        results[i], obj[j], position);
                    } catch (e) {
                        TP.ifError() ?
                            TP.error(TP.ec(e, 'Error adding node at.')) : 0;
                    }
                }
            } else {
                try {
                    TP.elementInsertContent(results[i], obj, position);
                } catch (e) {
                    TP.ifError() ?
                        TP.error(TP.ec(e, 'Error adding node at.')) : 0;
                }
            }
        }

        this.changed('content', TP.INSERT);

        return this;
    } else {
        if (!TP.isNumber(parseInt(anIndex, 10))) {
            this.raise('TP.sig.InvalidParameter',
                        'Index must be an XPath or a Number: ' + anIndex);

            return this;
        }

        if (node.childNodes.length < anIndex || anIndex < 0) {
            return this.raise('TP.sig.IndexOutOfRange');
        }

        //  empty? then we insert, or iterate and insert as needed
        if (node.childNodes.length === 0 && anIndex === 0) {
            if (TP.isNodeList(obj)) {
                objLen = obj.length;

                for (i = 0; i < objLen; i++) {
                    TP.nodeAppendChild(node, obj[i]);
                }
            } else {
                TP.nodeAppendChild(node, obj);
            }

            this.changed('content', TP.INSERT);

            return this;
        }

        child = node.childNodes[anIndex];

        if (TP.isNodeList(obj)) {
            //  if we have the child as a starting point and we're going to
            //  insert a block of data "before" it then we want to insert
            //  from the start to the end of the collection so each new item
            //  goes between the last insertion and the child. if we're
            //  going after however, we want to insert from the end of the
            //  list forward, so the last item we insert is the first one in
            //  the list.
            switch (position) {
                case TP.BEFORE_END:
                case TP.BEFORE_BEGIN:

                    objLen = obj.length;
                    for (i = 0; i < objLen; i++) {
                        results = TP.elementInsertContent(child,
                                                            obj[i],
                                                            aPosition);
                    }

                    break;

                default:

                    for (i = obj.length - 1; i >= 0; i--) {
                        results = TP.elementInsertContent(child,
                                                            obj[i],
                                                            aPosition);
                    }

                    break;
            }
        } else {
            results = TP.elementInsertContent(child, obj, aPosition);
        }

        if (TP.isValid(results)) {
            this.changed('content', TP.INSERT);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllAt',
function() {

    /**
     * @method addAllAt
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('at',
function(anIndex) {

    /**
     * @method at
     * @summary Returns the content at the index provided. A synonym for get().
     *     For TP.core.CollectionNodes, the 'index' is an attribute name.
     * @returns {String|Object} The value of the desired index/attribute.
     */

    return this.get(anIndex);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atAll',
function() {

    /**
     * @method atAll
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atAllPut',
function() {

    /**
     * @method atAllPut
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atIfInvalid',
function() {

    /**
     * @method atIfInvalid
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atIfNull',
function() {

    /**
     * @method atIfNull
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atIfUndefined',
function() {

    /**
     * @method atIfUndefined
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atPut',
function() {

    /**
     * @method atPut
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atPutIfAbsent',
function() {

    /**
     * @method atPutIfAbsent
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('containsKey',
function() {

    /**
     * @method containsKey
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('containsValue',
function() {

    /**
     * @method containsValue
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectKeyAt',
function() {

    /**
     * @method detectKeyAt
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getKeys',
function() {

    /**
     * @method getKeys
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getKVPairs',
function() {

    /**
     * @method getKVPairs
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getPairs',
function() {

    /**
     * @method getPairs
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getPosition',
function() {

    /**
     * @method getPosition
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getPositions',
function() {

    /**
     * @method getPositions
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('grepKeys',
function() {

    /**
     * @method grepKeys
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performOver',
function() {

    /**
     * @method performOver
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeAt',
function(anIndex) {

    /**
     * @method removeAt
     * @summary Removes content at the index provided. Note that the index may
     *     be either a numerical value, or an XPath which selects nodes for
     *     removal.
     * @param {Number|String} anIndex An integer index, or an XPath which
     *     selects nodes for removal.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node,
        path,
        child;

    node = this.getNativeNode();

    //  if it looks like an XPath then we'll do it that way...
    if (TP.regex.XPATH_PATH.test(anIndex)) {
        path = TP.xpc(anIndex);
        path.shouldFlagChanges(this.shouldFlagChanges());

        return path.execRemove(this);
    }

    if (!TP.isNumber(parseInt(anIndex, 10))) {
        this.raise('TP.sig.InvalidParameter',
                    'Index must be an XPath or a Number: ' + anIndex);

        return this;
    }

    if (node.childNodes.length < anIndex || anIndex < 0) {
        return this.raise('TP.sig.IndexOutOfRange');
    }

    child = node.childNodes[anIndex];

    if (this.shouldFlagChanges()) {
        //  if we're flagging rather than 'doing' then we set the change flag to
        //  TP.DELETE and that's all
        TP.elementFlagChange(child, TP.SELF, TP.DELETE);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(child)) : 0;
    } else {
        //  if we're not flagging then just rip it out of the DOM
        TP.nodeDetach(child);
    }

    this.changed('content', TP.DELETE);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeAtAll',
function() {

    /**
     * @method removeAtAll
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeKey',
function() {

    /**
     * @method removeKey
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeKeys',
function() {

    /**
     * @method removeKeys
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('transpose',
function() {

    /**
     * @method transpose
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  TP.api.OrderedCollectionAPI
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAfter',
function() {

    /**
     * @method addAfter
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllAfter',
function() {

    /**
     * @method addAllAfter
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllBefore',
function() {

    /**
     * @method addAllBefore
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllFirst',
function() {

    /**
     * @method addAllFirst
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllLast',
function() {

    /**
     * @method addAllLast
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addBefore',
function() {

    /**
     * @method addBefore
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addFirst',
function() {

    /**
     * @method addFirst
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addLast',
function() {

    /**
     * @method addLast
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('after',
function() {

    /**
     * @method after
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('before',
function() {

    /**
     * @method before
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('first',
function(aNumber) {

    /**
     * @method first
     * @summary Returns the first N *immediate children* elements of the
     *     receiver where N defaults to 1.
     * @param {Number} aNumber The number of elements to return. When N is
     *     greater than 1 the return value is a new array.
     * @returns {Object} The first N elements (TP.core.Nodes) in this node.
     */

    var node,

        childNodesArr,
        result;

    node = this.getNativeNode();

    childNodesArr = TP.ac(node.childNodes);
    result = childNodesArr.first(aNumber);

    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getLastPosition',
function() {

    /**
     * @method getLastPosition
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('last',
function(aNumber) {

    /**
     * @method last
     * @summary Returns the last N *immediate children* elements of the
     *     receiver where N defaults to 1.
     * @param {Number} aNumber The number of elements to return. When N is
     *     greater than 1 the return value is a new array.
     * @returns {Object} The last N elements (TP.core.Nodes) in this node.
     */

    var node,

        childNodesArr,
        result;

    node = this.getNativeNode();

    childNodesArr = TP.ac(node.childNodes);
    result = childNodesArr.last(aNumber);

    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('orderedBy',
function() {

    /**
     * @method orderedBy
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeFirst',
function() {

    /**
     * @method removeFirst
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeLast',
function() {

    /**
     * @method removeLast
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replaceFirst',
function() {

    /**
     * @method replaceFirst
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replaceLast',
function() {

    /**
     * @method replaceLast
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('reverse',
function() {

    /**
     * @method reverse
     * @summary
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  Content Processing
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('awaken',
function() {

    /**
     * @method awaken
     * @summary This method invokes the 'awaken' functionality of the tag
     *     processing system, to provide 'post-render' awakening of various
     *     features such as events and CSS styles.
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        shouldProcess;

    node = this.getNativeNode();

    //  Initially we're set to process this markup.
    shouldProcess = true;

    //  But if the node is an Element and it has an attribute of
    //  'tibet:noawaken', then skip processing it.
    if (TP.isElement(node) &&
        TP.elementHasAttribute(node, 'tibet:noawaken', true)) {
        shouldProcess = false;
    }

    if (shouldProcess) {
        TP.nodeAwakenContent(this.getNativeNode());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('compile',
function(aRequest, replaceNode, alternateNode) {

    /**
     * @method compile
     * @summary This method invokes the 'compile' functionality of the tag
     *     processing system, to provide conversion from authored markup into
     *     markup that can be understood by the platform.
     * @description It is important to note that this method will use the
     *     receiver's native node as the source for compilation *and will
     *     reassign the receiver's native node reference to any new content
     *     produced*. It will *not*, however, replace it's old node in that
     *     node's hierarchy unless the 'replaceNode' flag is true (or unless the
     *     receiver's compilation process has already done it).
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @param {Boolean} [replaceNode=false] Whether or not this method will
     *     replace its native node in that node's hierarchy. Note that,
     *     depending on the receiver's compilation process, this might have
     *     already been done.
     * @param {Node} [alternateNode] An alternate node to use in place of the
     *     native node of the receiver when compiling. This parameter is
     *     optional.
     * @returns {TP.core.CollectionNode} The receiver or a new object if the
     *     tag content compiles to a different kind of tag than the receiver.
     */

    var originalNode,

        node,

        shouldProcess,

        request,

        processor,

        nodeGID,

        workNode,
        newNode,

        type;

    originalNode = this.getNativeNode();

    //  If an alternate node was supplied, use it (and set it as our native node
    //  so that the compilation machinery will work properly).
    if (TP.isNode(alternateNode)) {

        //  Remove all TP.GLOBAL_ID and TP.EVENT_IDs slots from the original and
        //  alternate nodes, so that these are recomputed when being swapped
        //  around the DOM.
        delete originalNode[TP.EVENT_IDS];
        delete originalNode[TP.GLOBAL_ID];

        delete alternateNode[TP.EVENT_IDS];
        delete alternateNode[TP.GLOBAL_ID];

        //  Remove all TP.GLOBAL_ID and TP.EVENT_IDs slots from any elements
        //  under the alternate node that have them - this will cause them to
        //  reset.
        if (TP.isCollectionNode(alternateNode)) {
            TP.ac(alternateNode.getElementsByTagName('*')).forEach(
                    function(anElem) {
                        delete anElem[TP.EVENT_IDS];
                        delete anElem[TP.GLOBAL_ID];
                    });
        }

        node = alternateNode;
        this.setNativeNode(alternateNode);
    } else {
        node = originalNode;
    }

    //  before we worry about anything else let's make sure we've got the
    //  proper frame of reference for any URI content
    if (TP.isDocument(node)) {
        this.addTIBETSrc(this.get('uri'));
        this.addXMLBase(this.get('uri'), null, aRequest);
    }

    //  Initially we're set to process this markup.
    shouldProcess = true;

    //  But if the node is an Element and it has an attribute of
    //  'tibet:nocompile', then skip processing it.
    if (TP.isElement(node) &&
        TP.elementHasAttribute(node, 'tibet:nocompile', true)) {
        shouldProcess = false;
    }

    //  If the node is a Document and it's documentElement has an attribute of
    //  'tibet:nocompile', then skip processing it.
    if (TP.isDocument(node) &&
        TP.elementHasAttribute(node.documentElement, 'tibet:nocompile', true)) {
        shouldProcess = false;
    }

    if (shouldProcess) {
        request = TP.request(aRequest);

        //  We do *not* clone our native node before we process it - the
        //  processing system will not process a detached node so we process it
        //  in situ.

        //  Allocate a tag processor and initialize it with the COMPILE_PHASES
        processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                        TP.core.TagProcessor.COMPILE_PHASES);

        //  Capture this before processing - the following steps will virtually
        //  detach this node.
        nodeGID = TP.gid(node);

        //  If we're working with a Document, get it's document element - we
        //  don't really process Document nodes.
        if (TP.isDocument(node)) {
            workNode = node.documentElement;
        } else {
            workNode = node;
        }

        //  Wrap the work node in a 'root element for processing'. This is
        //  because, the way the transformation engine works, it holds onto the
        //  root node reference as it processes and replaces, so we want to give
        //  it a root that means nothing to the caller of this method. Also,
        //  this facilitates processing DocumentFragments in case we are one of
        //  those.
        workNode = TP.elem('<processingroot>' +
                            TP.str(workNode) +
                            '</processingroot>');

        if (!TP.isCollectionNode(workNode)) {
            request.fail('work node is not a collection node', TP.FAILED);
            return;
        }

        //  Process the tree of markup
        processor.processTree(workNode, request);

        //  Pluck the first child out of our faked 'root' from above.
        newNode = workNode.firstChild;

        //  Signal from the node that compile processing is complete.
        TP.signal(nodeGID, 'TP.sig.CompileComplete');

        //  If the shell request failed then our enclosing request has failed.
        if (request.didFail()) {
            request.fail(request.getFaultText(),
                            request.getFaultCode(),
                            request.getFaultInfo());
            return;
        }
    } else {

        //  We're not processing - exit here.
        return this;
    }

    //  if our processing produced a new native node of the same type as our
    //  original content (so we're still the right kind of wrapper) we can
    //  update our internal node content. If not we'll need to get a new
    //  wrapper and return that as the result.

    if (!TP.isNode(newNode)) {

        return newNode;

    } else if (TP.isDocument(node)) {

        //  The original node was a document, so set its document element to the
        //  newly produced node.
        TP.nodeReplaceChild(node, newNode, node.documentElement, false);

    } else if ((type = TP.core.Node.getConcreteType(newNode)) ===
                                                            this.getType()) {

        //  if our processing produced a new native node of the same type as our
        //  original native node (so we're still the right kind of wrapper) we
        //  can update our internal node content.
        if (!TP.nodeIsDetached(originalNode) && TP.isTrue(replaceNode)) {

            newNode = TP.elementReplaceWith(
                                originalNode, newNode, null, false);
        }
        this.setNativeNode(newNode);

    } else {
        //  It's not so we'll need to get a new wrapper and return that as the
        //  result.
        return type.construct(newNode);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('deaden',
function() {

    /**
     * @method deaden
     * @summary This method invokes the 'deaden' functionality of the tag
     *     processing system, to provide 'post-render' deadening of various
     *     features such as events and CSS styles.
     * @description You don't normally call this - in fact, it's rarely invoked.
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        shouldProcess;

    node = this.getNativeNode();

    //  Initially we're set to process this markup.
    shouldProcess = true;

    //  But if the node is an Element and it has an attribute of
    //  'tibet:noawaken', then skip processing it.
    if (TP.isElement(node) &&
        TP.elementHasAttribute(node, 'tibet:noawaken', true)) {
        shouldProcess = false;
    }

    if (shouldProcess) {
        TP.nodeDeadenContent(this.getNativeNode());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('processTP_sig_Request',
function(aRequest) {

    /**
     * @method processTP_sig_Request
     * @summary Processes the receiver's content. The processing is done via
     *     the TSH as a standard set of execution phases defined as sets of
     *     sequenced phase names on the TSH type.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.sig.Response} A response containing the processing results.
     */

    var request,
        result,
        response;

    request = TP.request(aRequest);
    result = this.compile(request);

    response = request.getResponse(result);
    request.complete(result);

    return response;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('$escapeCSSConstructs',
function() {

    /**
     * @method $escapeCSSConstructs
     * @summary An internal method that makes sure that any link or style
     *     elements containing external references are escaped before performing
     *     an XSLT operations. Failure to do this can cause Mozilla-based
     *     browsers to crash.
     */

    var node,
        newNode;

    node = this.getNativeNode();

    if (TP.canInvoke(TP, '$nodeEscapeCSSConstructs')) {
        newNode = TP.$nodeEscapeCSSConstructs(node);
        if (newNode !== node) {
            this.setNativeNode(newNode, false);
        }
    }

    return;
});

//  ========================================================================
//  TP.core.DocumentFragmentNode
//  ========================================================================

TP.core.CollectionNode.defineSubtype('DocumentFragmentNode');

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('addTIBETSrc',
function(aURI, force) {

    /**
     * @method addTIBETSrc
     * @summary Adds a TP.SRC_LOCATION value to the ownerDocument of the
     *     receiver (or the receiver itself, if its the Document). This method
     *     is normally invoked when the Node is "owned" by a URI to ensure
     *     proper ID generation can occur.
     * @description At this level, this method is a no-op.
     * @param {TP.core.URI|String} aURI An optional URI value. If not provided
     *     then the receiver's uri is used.
     * @param {Boolean} force True to force setting the value even if the node
     *     already has one. Default is false.
     * @returns {TP.core.Node} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('addXMLBase',
function(aURI, force, aParamHash) {

    /**
     * @method addXMLBase
     * @summary Adds an XML Base value to the documentElement of the receiver.
     *     This method is normally invoked when the Node is "owned" by a URI to
     *     ensure proper base-aware attribute computation can occur. If the
     *     receiver's document already has xml:base definition on the
     *     documentElement this method will return without altering the content.
     * @description At this level, this method is a no-op.
     * @param {TP.core.URI|String} aURI An optional URI value. If not provided
     *     then the receiver's uri is used.
     * @param {Boolean} force True to force setting the value even if the node
     *     already has one. Default is false.
     * @param {TP.core.Hash|TP.sig.Request} aParamHash A set of key/value pairs
     *     which should be used to control the transformation. If the 'aURI'
     *     value is null and a 'uri' slot is defined on this object, that
     *     object's String value will be used as the XML Base value.
     * @returns {TP.core.Node} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return 'TP.tpfrag(\'' + this.asString() + '\')';
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('getAttribute',
function(attributeName) {

    /**
     * @method getAttribute
     * @summary Returns the value of the attribute provided.
     * @description At this level, this method is a no-op.
     * @param {String} attributeName The attribute to find.
     * @returns {String} The attribute value, if found.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('getAttributes',
function(attributeName, stripPrefixes) {

    /**
     * @method getAttributes
     * @summary Returns a hash of zero to N attribute name/value pairs,
     *     potentially matching the attribute name provided. For document nodes
     *     this operation effectively operates on the document's
     *     documentElement.
     * @description At this level, this method is a no-op.
     * @param {String|RegExp} attributeName An attributeName "search" criteria
     *     of the form 'wholename' '*:localname' or 'prefix:*' or any RegExp.
     *     This is optional.
     * @param {Boolean} stripPrefixes Whether or not to strip any namespace
     *     prefixes from the attribute names as they are populated into the
     *     return value.
     * @returns {TP.core.Hash} A collection of name/value pairs.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('getTemplateName',
function() {

    /**
     * @method getTemplateName
     * @summary Returns the name of any associated template for the receiver.
     * @description At this level, this method is a no-op.
     * @returns {String} The template name.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('hasAttribute',
function(attributeName) {

    /**
     * @method hasAttribute
     * @summary Returns whether or not the receiver has the named attribute
     *     provided. This method essentially emulates the native node
     *     hasAttribute call. Note that this call is only valid for Element
     *     nodes; when invoked on a document wrapper the documentElement is
     *     targeted.
     * @description At this level, this method is a no-op.
     * @param {String} attributeName The attribute to test.
     * @exception TP.sig.InvalidOperation
     * @returns {Boolean} Whether or not the receiver has the named attribute.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('hasXMLBase',
function() {

    /**
     * @method hasXMLBase
     * @summary Returns true if xml:base references are found on or above the
     *     receiver.
     * @description At this level, this method is a no-op.
     * @returns {Boolean} Whether an xml:base reference was found on or above
     *     the receiver.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('removeAttribute',
function(attributeName) {

    /**
     * @method removeAttribute
     * @summary Removes the named attribute. This version is a wrapper around
     *     the native element node removeAttribute call which attempts to handle
     *     standard change notification semantics for native nodes as well as
     *     proper namespace management.
     * @description At this level, this method is a no-op.
     * @param {String} attributeName The attribute name to remove.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('setAttribute',
function(attributeName, attributeValue) {

    /**
     * @method setAttribute
     * @summary Sets the value of the named attribute. This version is a
     *     wrapper around the native element node setAttribute call which
     *     attempts to handle standard change notification semantics for native
     *     nodes as well as proper namespace management.
     * @description At this level, this method is a no-op.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('setAttributes',
function(attributeHash) {

    /**
     * @method setAttributes
     * @summary Sets the value of the attributes provided using the supplied
     *     TP.core.Hash. For document nodes this operation effectively operates
     *     on the document's documentElement.
     * @description At this level, this method is a no-op.
     * @param {TP.core.Hash} attributeHash The attributes to set.
     */

    return;
});

//  ------------------------------------------------------------------------
//  Content Processing
//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('awaken',
function() {

    /**
     * @method awaken
     * @summary This method invokes the 'awaken' functionality of the tag
     *     processing system, to provide 'post-render' awakening of various
     *     features such as events and CSS styles.
     * @returns {TP.core.Node} The receiver.
     */

    //  DocumentFragments aren't responsible for awakening their content - for
    //  the most part they've already been 'flattened out' by the time their
    //  inserted into a visual DOM (unless they've been created there - but then
    //  you're already dealing with awakened nodes).

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('compile',
function(aRequest) {

    /**
     * @method compile
     * @summary This method invokes the 'compile' functionality of the tag
     *     processing system, to provide conversion from authored markup into
     *     markup that can be understood by the platform.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.core.CollectionNode} The receiver or a new object if the
     *     tag content compiles to a different kind of tag than the receiver.
     */

    var node,

        request,

        processor,

        childNodes,
        len,
        i,

        childNode,
        nodeGID;

    node = this.getNativeNode();

    request = TP.request(aRequest);

    //  Allocate a tag processor and initialize it with the COMPILE_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.COMPILE_PHASES);

    childNodes = TP.nodeGetChildNodes(node);

    len = childNodes.getSize();

    //  Process each child that we have.
    for (i = 0; i < len; i++) {

        childNode = childNodes.at(i);

        //  Capture this before processing - processing this node might very
        //  well detach it.
        nodeGID = TP.gid(childNode);

        //  But if the node is an Element and it has an attribute of
        //  'tibet:nocompile', then skip processing it.
        if (TP.isElement(childNode) &&
            TP.elementHasAttribute(childNode, 'tibet:nocompile', true)) {
            continue;
        }

        processor.processTree(childNode, request);

        //  If the shell request failed then our enclosing request has failed.
        if (request.didFail()) {
            aRequest.fail(request.getFaultText(),
                            request.getFaultCode(),
                            request.getFaultInfo());
            return;
        }

        //  Signal from the node that compile processing is complete.
        TP.signal(nodeGID, 'TP.sig.CompileComplete');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  XPATH SUPPORT
//  ------------------------------------------------------------------------

TP.core.DocumentFragmentNode.Inst.defineMethod('generateXPathTo',
function(aNode) {

    /**
     * @method generateXPathTo
     * @summary Generates a 'simple' XPath expression that would access the
     *     supplied node from the receiver's native node.
     * @description At this level, this method is a no-op.
     * @param {Node|TP.core.Node} aNode The node to generate the path to.
     * @returns {String} The generated XPath expression.
     */

    return;
});

//  ========================================================================
//  TP.core.ElementNode
//  ========================================================================

TP.core.CollectionNode.defineSubtype('ElementNode');

//  allow for subtypes to be created based on namespace and localname
TP.core.ElementNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The attributes for this element type that are considered to 'boolean
//  attributes' that either exist or don't exist - this matters especially to
//  HTML (but not XHTML ;-) ).
TP.core.ElementNode.Type.defineAttribute('booleanAttrs', TP.ac());

//  A cache of computed URI keys. This dictionary is used to avoid recomputing
//  the resource URI values for various keys. Note that the keys here mirror
//  those you'd normally see in TP.sys.cfg with respect to paths.
TP.core.ElementNode.Type.defineAttribute('computedKeys', TP.hc());

//  The attributes for this element type that are considered to 'URI
//  attributes' that need XML Base/virtual URI resolution.
TP.core.ElementNode.Type.defineAttribute('uriAttrs', TP.ac());

//  The attributes for this element type that are URI attributes that are also
//  'reloadable' - that is, if the system is configured to reload URIs and the
//  server that the resource loads from can send change notifications about URI
//  changes, this type will be messaged when the resource pointed to by one of
//  these URI attributes changes.
TP.core.ElementNode.Type.defineAttribute('reloadableUriAttrs', TP.ac());

//  the node's template. this will be used when instances are constructed
//  with a TP.core.Hash incoming value
TP.core.ElementNode.Type.defineAttribute('template');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('computeResourceExtension',
function(resource, mimeType) {

    /**
     * @method computeResourceExtension
     * @summary Returns the default extension to use for the resource and mime
     *     type provided. Information in TP.ietf.Mime is used when a list of
     *     extensions is needed.
     * @param {String} resource The resource name. Typically template, style,
     *     style_{theme}, etc. but it could be essentially anything except the
     *     word 'resource' (since that would trigger a recursion).
     * @param {String} mimeType The mimeType for the resource being looked up.
     * @returns {String} The computed extension.
     */

    var res,
        ext,
        mime,
        extensions;

    res = resource.toLowerCase();

    //  If we have an explicit mapping for an extension we will avoid worrying
    //  about any mime type extension list and just rely on the explicit one.
    ext = this.get(res.asTitleCase() + 'Extension');
    if (TP.isEmpty(ext)) {

        //  Without an explicit extension we'll drop back to mime type and see
        //  if we can leverage that.
        mime = TP.ifInvalid(this.get(res + 'Mime'), mimeType);

        if (TP.isEmpty(mime)) {

            if (/^style_/.test(res)) {
                mime = TP.ietf.Mime.CSS;
            } else if (/^template_/.test(res)) {
                mime = TP.ietf.Mime.XHTML;
            } else {
                switch (res) {
                    case 'template':
                        mime = TP.ietf.Mime.XHTML;
                        break;
                    case 'style':
                        mime = TP.ietf.Mime.CSS;
                        break;
                    default:
                        mime = TP.ietf.Mime.XML;
                        break;
                }
            }
        }

        //  Once we have a mime type we can fetch the extensions and default to
        //  the first one (the canonical one based on convention).
        extensions = TP.ietf.Mime.getExtensions(mime);
        if (TP.notEmpty(extensions)) {
            ext = extensions.at(0);
        }
    }

    return ext;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('computeResourceURI',
function(resource, mimeType, fallback) {

    /**
     * @method computeResourceURI
     * @summary Computes a resource URI using information including a resource
     *     "name" and mime type (for use in determining potential extensions).
     *     This routine is leveraged by getResourceURI-invoked methods which
     *     need to compute default file paths.
     * @description The computation process goes through a number of checks:
     *
     *     First, we might be in a "rollup" state where tags which normally have
     *     their own file/uri need to use a uri path from a rolled up file.
     *     This check uses path.{resource}.rollup as a cfg key.
     *
     *     Second, tags in a namespace may be sharing a namespace-level
     *     resource file (which is a common form of limited rollup).
     *     This check uses path.{prefix}.{resource}.rollup as a cfg key.
     *
     *     Third, we might be using a specific resource file for the tag.
     *     This check uses path.{resourceName}.{resource}.rollup as a cfg key
     *     where resourceName is the receiver's getResourceTypeName() value.
     *
     *     If no config flag setting is found the type is queried via a call to
     *     get() with a property name of {resource}URI which will essentially
     *     check for a get{Resource}URI method or attribute value.
     *
     *     The receiver's namespace is then queried using the same get() call to
     *     let a namespace respond on behalf of its members.
     *
     *     Last, but not least a computation using the receiver's load path is
     *     used to try to find a file with a MIME-specific extension for the
     *     resource being computed. Basically we assume a tag's template and css
     *     are in the same directory with the tag javascript.
     *
     *     In all cases whatever value is found/computed is cached under a key
     *     of path.{name}.{res} for future lookups. These latter keys are
     *     not saved, they exist only at runtime.
     *
     * @param {String} resource The resource name. Typically template, style,
     *     style_{theme}, etc. but it could be essentially anything except the
     *     word 'resource' (since that would trigger a recursion).
     * @param {String} mimeType The mimeType for the resource being looked up.
     * @param {Boolean} [fallback] Compute a fallback value?  Defaults to the
     *     value of 'uri.<resource type>_fallback'.
     * @returns {String} A properly computed URL in string form.
     */

    var res,
        name,
        theme,
        cachekey,
        computed,
        prefix,
        key,
        value,
        type,
        ext,
        uri;

    if (!TP.isString(resource) || TP.isEmpty(resource) ||
            resource === 'resource') {
        return this.raise('TP.sig.InvalidParameter',
            'Must supply a valid resource name.');
    }

    res = resource.toLowerCase();
    name = this.getResourceTypeName();
    theme = /^style_/.test(res) ? theme = res.split('_').last() : '';

    //  ---
    //  source file and test file lookups.
    //  ---

    if (res === 'source') {
        return TP.objectGetSourcePath(this);
    }

    if (res === 'tests') {
        //  TODO: should _test be a config var?
        return TP.objectGetSourcePath(this).replace(/\.js$/, '_test.js');
    }

    //  ---
    //  cached value check
    //  ---

    //  If we've done computation before don't repeat it. Also, this serves
    //  as a way for individual types to provide a specific override via cfg.

    cachekey = 'path.' + name + '.' + res;

    computed = TP.core.ElementNode.get('computedKeys');
    value = computed.at(cachekey);
    if (TP.notEmpty(value)) {
        return value === TP.NO_RESULT ? void 0 : value;
    }

    //  ---
    //  resource-level rollup check
    //  ---

    //  Production-level rollups are done via the CLI and have to be able to
    //  override pretty much any other consideration in terms of computation
    //  order so we check those first.

    //  TODO:   should we use a project-specific one here?
    // key = 'path.' + project + '.' + res + '.rollup';
    key = 'path.' + res + '.rollup';
    value = TP.sys.cfg(key);
    if (TP.notEmpty(value)) {
        computed.atPut(cachekey, TP.uriNormalize(value));
        if (value !== TP.NO_RESULT) {
            return value;
        }
    }

    //  ---
    //  namespace-level rollup check
    //  ---

    prefix = this.getNamespacePrefix().toLowerCase();

    key = 'path.' + prefix + '.' + res + '.rollup';
    value = TP.sys.cfg(key);
    if (TP.notEmpty(value)) {
        computed.atPut(cachekey, TP.uriNormalize(value));
        if (value !== TP.NO_RESULT) {
            return value;
        }
    }

    //  ---
    //  resource-level flag check
    //  ---

    key = 'path.' + name + '.' + res;
    value = TP.sys.cfg(key);
    if (TP.notEmpty(value)) {
        computed.atPut(cachekey, TP.uriNormalize(value));
        return value === TP.NO_RESULT ? void 0 : value;
    }

    //  ---
    //  receiver method
    //  ---

    //  Don't cause infinite recursion... (get('resource' + 'URI') etc.)
    if (res !== 'resource') {
        //  Must have asked for style_{theme} as the resource value.
        if (TP.notEmpty(theme)) {
            uri = this.get('themeURI', theme);
        } else {
            uri = this.get(res + 'URI');    // e.g. 'style' + 'URI'
        }
        if (TP.notEmpty(uri)) {
            if (uri === TP.NO_RESULT) {
                return;
            }
            return uri;
        }
    }

    //  ---
    //  namespace method
    //  ---

    type = this.getNamespaceObject();
    if (TP.canInvoke(type, 'get')) {
        if (res !== 'resource') {
            uri = type.get(res.toLowerCase() + 'URI');
            if (TP.notEmpty(uri)) {
                if (uri === TP.NO_RESULT) {
                    return;
                }
                return uri;
            }
        }
    }

    //  ---
    //  computed fallback
    //  ---

    //  If forced false nothing else matters...we're done.
    if (TP.isFalse(fallback)) {
        return;
    }

    //  If forced true, or the flag is true, we'll compute a fallback value.
    res = /^style_/.test(res) ? 'style' : res;
    if (TP.isTrue(fallback) ||
        TP.isTrue(TP.sys.cfg('uri.' + res + '_fallback'))) {

        ext = this.computeResourceExtension(resource, mimeType);

        //  Default to receiver's load path and full type name.
        value = TP.objectGetSourceCollectionPath(this) + '/' + this.getName();

        //  Tack on theme as needed to provide theme-specific computation.
        value = TP.isEmpty(theme) ? value : value + '_' + theme;

        //  Finally add the proper mime extension such as CSS or XHTML.
        value += '.' + ext;

        computed.atPut(cachekey, TP.uriNormalize(value));
        return value;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('constructContentObject',
function(content, aURI) {

    /**
     * @method constructContentObject
     * @summary Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {Object} content The content to set into the content object.
     * @param {TP.core.URI} aURI The URI containing the content.
     * @returns {Object} The object representation of the content.
     */

    var contentObj;

    if (TP.isDocument(contentObj = content)) {
        contentObj = content.documentElement;
    }

    return this.construct(contentObj);
});

//  ------------------------------------------------------------------------

//  fromArray() is handled by fromObject() below

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('fromBoolean',
function(anObject, aRequest) {

    /**
     * @method fromBoolean
     * @summary Returns a formatted XML String with the supplied Boolean object
     *     as the content.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    return TP.join(
            '<', this.getCanonicalName(), '>',
                    TP.str(anObject),
            '</', this.getCanonicalName(), '>');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('fromDate',
function(anObject, aRequest) {

    /**
     * @method fromDate
     * @summary Returns a formatted XML String with the supplied Date object as
     *     the content.
     * @description The supplied request can contain the following keys and
     *     values that are used in this method:
     *
     *     'escapeContent' Boolean Whether or not to 'escape' the content (i.e.
     *     if it has embedded markup). This defaults to false.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var val;

    if (TP.isTrue(aRequest.at('escapeContent'))) {
        val = TP.xmlLiteralsToEntities(TP.str(anObject));
    } else {
        val = TP.str(anObject);
    }

    return TP.join(
            '<', this.getCanonicalName(), '>',
                    val,
            '</', this.getCanonicalName(), '>');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('fromNumber',
function(anObject, aRequest) {

    /**
     * @method fromNumber
     * @summary Returns a formatted XML String with the supplied Number object
     *     as the content.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    return TP.join(
            '<', this.getCanonicalName(), '>',
                    TP.str(anObject),
            '</', this.getCanonicalName(), '>');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('fromObject',
function(anObject, aRequest) {

    /**
     * @method fromObject
     * @summary Returns a formatted XML String with each item in the Array as
     *     the content of each item in the Array.
     * @description The supplied request can contain the following keys and
     *     values that are used in this method:
     *
     *     'attrInfo'   TP.core.Hash|Function
     *     The Hash or Function to use to compute attributes for the main
     *     element.
     *
     *     'format'     String
     *     How items should be formatted when this routine loops.
     *
     *     'autowrap'   Boolean
     *     Whether or not this routine iterates over an item list, generating
     *     markup for individual items, or just generates 'start & end' tags and
     *     hands the Object to the 'format' specified (or to this tag's 'item
     *     tag name') to iterate.
     *
     *     'infos'      Array
     *     The Array containing information about each 'level' of the formatting
     *     recursion. If attrInfo is supplied, and its a Function, that Function
     *     should be defined like so:
     *
     *         function(item) {
     *             return 'foo="bar"';
     *         };
     *
     *     where the item is the Array itself. It should return a String as
     *     demonstrated. If itemAttrInfo is supplied, and its a Function, that
     *     Function should be defined like so:
     *
     *         function(item) {
     *             return 'foo="bar"';
     *         };
     *
     *     where the item is the item itself at that position in the Array. It
     *     should return a String as demonstrated.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var theRequest,

        currentLevel,
        infos,
        levelInfo,
        i,
        reqCopy,

        attrInfo,
        attrStr,

        itemFormat,
        formatArgs,

        shouldAutoWrap,

        retVal;

    if (TP.notValid(anObject)) {
        return this.raise('TP.sig.InvalidObject');
    }

    //  Get the 'top-level' request
    if (TP.notValid(aRequest)) {
        theRequest = TP.hc();
    } else {
        theRequest = aRequest;
    }

    //  If we have a 'currentLevel', see what level we're at and whether or
    //  not we have info for that level.
    if (TP.isNumber(currentLevel = theRequest.at('currentLevel'))) {
        if (currentLevel === 0) {
            //  We're at 'level 0' - use a copy of the supplied request.
            levelInfo = TP.copy(theRequest);
        } else {

            //  See if there's an Array of 'infos' hashes. These will be used to
            //  communicate parameters 'further down' into the recursion.
            infos = theRequest.at('infos');

            //  No infos - just use a copy of the supplied request.
            if (TP.notValid(infos)) {
                levelInfo = TP.copy(theRequest);
            } else {

                //  Otherwise, grab the info hash representing our level (which
                //  will be the one at our current level minus 1).
                levelInfo = infos.at(currentLevel - 1);

                //  If there is none, then we need to search for one.
                if (TP.notValid(levelInfo)) {

                    //  Start two levels up from our current level.
                    i = currentLevel - 2;

                    //  Back up through all of the level numbers, looking for a
                    //  valid info hash.
                    while (i > -1) {
                        if (TP.isValid(infos.at(i))) {
                            levelInfo = infos.at(i);
                            break;
                        }
                        i--;
                    }

                    //  If we still didn't find an info hash, just use a copy of
                    //  the supplied request.
                    if (TP.notValid(levelInfo)) {
                        levelInfo = TP.copy(theRequest);
                    } else {

                        //  Otherwise, copy the supplied request (to get the
                        //  most specific values) and then add in any values
                        //  that we got from the info hash we computed.
                        reqCopy = TP.copy(theRequest.getPayload());
                        reqCopy.addAllIfAbsent(levelInfo);
                        levelInfo = reqCopy;
                    }
                }
            }
        }
    } else {
        //  We must be at 'level 0' - there not even a 'currentLevel' set. Use a
        //  copy of the supplied request.
        levelInfo = TP.copy(theRequest);
    }

    //  If 'currentLevel' wasn't defined before, that means that we're at
    //  level 0 (the caller's entry point). Define it to be 'level 1'.
    //  Otherwise, increment the level count.
    if (TP.notValid(levelInfo.at('currentLevel'))) {
        levelInfo.atPut('currentLevel', 1);
    } else {
        levelInfo.atPut('currentLevel', levelInfo.at('currentLevel') + 1);
    }

    //  Note that for these configuration parameters, 'levelInfo' very well
    //  maybe be an empty TP.core.Hash.

    //  Grab the attribute info from the level info
    attrInfo = levelInfo.at('$attrInfo');

    //  If the level info specified a format, use that. Otherwise, see if
    //  the receiver has an 'item tag name' (e.g. 'tr' has an 'item tag
    //  name' of 'td').
    if (TP.isEmpty(itemFormat = levelInfo.at('format'))) {
        itemFormat = this.getItemTagName(anObject, levelInfo);
    }

    //  Now we're going to determine whether we'll auto-wrap or not.
    shouldAutoWrap = this.shouldAutoWrapItems(anObject, levelInfo);

    //  If itemFormat isn't real here, then we just use 'String' -
    //  everything can respond to 'asString()' ;-).
    if (TP.notValid(itemFormat)) {
        itemFormat = 'String';
        formatArgs = null;
    } else {
        formatArgs = levelInfo;
    }

    if (!shouldAutoWrap) {
        //  No attribute info? Then we can just use the tag name and the
        //  item format.
        if (TP.notValid(attrInfo)) {
            attrStr = '';
        } else {
            //  If attrInfo isn't a Function, then see if its a String or
            //  TP.core.Hash.
            if (!TP.isCallable(attrInfo)) {
                if (TP.isString(attrInfo)) {
                    //  It's a String - just use it.
                    attrStr = ' ' + attrInfo;
                } else if (TP.isValid(attrInfo)) {
                    //  It should be a TP.core.Hash at this point - convert
                    //  to a String.
                    attrStr = ' ' + attrInfo.asAttributeString();
                } else {
                    //  Otherwise, its not valid so its the empty String.
                    attrStr = '';
                }
            } else {
                attrStr = ' ' + attrInfo(anObject);
            }
        }

        //  Generate a chunk of markup representing the supplied object.
        retVal = this.generateMarkup(anObject, attrStr,
                                        itemFormat, shouldAutoWrap,
                                        formatArgs,
                                        levelInfo);
    } else {
        //  No attribute info? Then we can just use the tag name and the
        //  item format.
        if (TP.notValid(attrInfo)) {
            attrStr = '';
        } else {
            //  If attrInfo isn't a Function, then see if its a String or
            //  TP.core.Hash.
            if (!TP.isCallable(attrInfo)) {
                attrStr = ' {{$attrStr}}';

                if (TP.isString(attrInfo)) {
                    //  It's a String - just use it.
                    levelInfo.atPut(
                                '$attrStr',
                                attrInfo);
                } else if (TP.isValid(attrInfo)) {
                    //  It should be a TP.core.Hash at this point - convert
                    //  to a String.
                    levelInfo.atPut('$attrStr',
                                        attrInfo.asAttributeString());
                } else {
                    //  Otherwise, its not valid so its the empty String.
                    levelInfo.atPut('$attrStr', '');
                }
            } else {
                attrStr = ' {{.%$attrInfo}}';
            }
        }

        //  Generate a chunk of markup representing the supplied object.
        retVal = this.generateMarkup(anObject, attrStr,
                                        itemFormat, shouldAutoWrap,
                                        formatArgs,
                                        levelInfo);
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('fromString',
function(anObject, aRequest) {

    /**
     * @method fromString
     * @summary Returns a formatted XML String with the supplied String object
     *     as the content.
     * @description The supplied request can contain the following keys and
     *     values that are used in this method:
     *
     *     'escapeContent' Boolean Whether or not to 'escape' the content (i.e.
     *     if it has embedded markup). This defaults to false.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var val,
        request;

    request = TP.request(aRequest);

    if (TP.isTrue(request.at('escapeContent'))) {
        val = TP.xmlLiteralsToEntities(
                            TP.htmlEntitiesToXMLEntities(TP.str(anObject)));
    } else {
        val = TP.str(anObject);
    }

    return TP.join(
            '<', this.getCanonicalName(), '>',
                    val,
            '</', this.getCanonicalName(), '>');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('generateMarkup',
function(anObject, attrStr, itemFormat, shouldAutoWrap, formatArgs, theRequest) {

    /**
     * @method generateMarkup
     * @summary Generates markup for the supplied Object using the other
     *     parameters supplied.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {String} attrStr The String containing either the literal
     *     attribute markup or a 'template invocation' that can be used inside
     *     of a template.
     * @param {String} itemFormat The name of an 'item format', either a tag
     *     name (which defaults to the 'item tag name' of this type) or some
     *     other format type which can be applied to this type.
     * @param {Boolean} shouldAutoWrap Whether or not the markup generation
     *     machinery should 'autowrap' items of the supplied object (each item
     *     in an Array or each key/value pair in an Object).
     * @param {TP.core.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.core.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     */

    var tagName,
        template,
        str;

    tagName = this.getCanonicalName();

    //  Don't generate markup annotated with the data expression
    theRequest.atPut('annotateMarkup', false);

    //  If we're not auto-wrapping, then just do an 'as' with the object.
    if (TP.isFalse(shouldAutoWrap)) {
        //  Join the tag name with the result of calling 'as' using the
        //  itemFormat to format the whole Array we were supplied.
        str = TP.join('<', tagName, attrStr, '>',
                        anObject.as(itemFormat, formatArgs),
                        '</', tagName, '>');
    } else {
        //  Otherwise, we're going to auto-wrap, so we leverage the
        //  'template' capability.

        //  If the object is an Array, then wrap each item in a tag.

        //  Build a template by joining the tag name with an invocation of
        //  the itemFormat for each value.
        if (TP.isArray(anObject) || TP.notTrue(theRequest.at('repeat'))) {
            template = TP.join('<', tagName, attrStr, '>',
                                '{{.%', itemFormat, '}}',
                                '</', tagName, '>');
        } else {
            //  Otherwise, the object that will be handed to the iteration
            //  mechanism will be [key,value] pairs, so we can use that fact
            //  to generate item tags around each one.

            //  Build a template by joining the tag name with an invocation
            //  of the itemFormat for both the key and the value.
            template = TP.join('<', tagName, attrStr, '>',
                                '{{0.%', itemFormat, '}}',
                                '</', tagName, '>',
                                '<', tagName, attrStr, '>',
                                '{{1.%', itemFormat, '}}',
                                '</', tagName, '>');
        }

        //  Perform the transformation.
        str = template.transform(anObject, theRequest);
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('generateMarkupContent',
function() {

    /**
     * @method generateMarkupContent
     * @summary Generates the 'empty markup' representation of the receiver.
     *     The empty representation contains no attributes or child node
     *     content, but does contain the proper 'xmlns' attribute so that the
     *     receiver can be properly placed in any document that has that
     *     namespace defined.
     * @returns {String} The 'empty markup' representation of the receiver.
     */

    var str;

    str = TP.join('<',
                this.getNamespacePrefix(),
                ':',
                this.getLocalName(),
                ' xmlns:', this.getNamespacePrefix(),
                '="',
                TP.w3.Xmlns.getPrefixURI(this.getNamespacePrefix()),
                '"/>');

    return str;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getCanonicalName',
function() {

    /**
     * @method getCanonicalName
     * @summary Returns the receiver's canonical tag name. For elements types,
     * this is the tag prefix (usually corresponding to the tag type's
     * namespace) followed by a colon (':') followed by the tag's 'local name'
     * (usually corresponding to the tag type's name).
     * @returns {String} The receiver's canonical name.
     */

    return this.get('nsPrefix') + ':' + this.get('localName');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided.
     * @description This method determines the 'TP wrapper' type for the
     *     supplied node by using the following logic cascade. 1. Checks for the
     *     'tibet:tag' attribute on the node and attempts to obtain a type
     *     matching that name. 2. If there is a 'tibet:tag' attribute and its
     *     exact type cannot be found, it computes a name using that name and
     *     the suffix ':Element' and attempts to obtain a type matching that
     *     name. 3. Obtains the node's 'full name' (i.e. the name that the
     *     author used in the source markup) and attempts to obtain a type
     *     matching that name. 4. Obtains the node's 'canonical name' (i.e. if
     *     the node has a namespace, it uses the canonical prefix for that
     *     namespace) and attempts to obtain a type matching that name. 5.
     *     Obtains the node's 'canonical prefix' (if the node has a namespace)
     *     and computes a name using that prefix and the suffix ':Element' and
     *     attempts to obtain a type matching that name. 6. Obtains the node's
     *     namespace URI (if the node has a namespace) and checks with the XMLNS
     *     'info' hash to see if there is a 'defaultNodeType' name registered
     *     under that namespace and attempts to obtain a matching type.
     * @param {Node} aNode The native node to wrap.
     * @returns {TP.lang.RootObject.<TP.core.ElementNode>} A TP.core.ElementNode
     *     subtype type object.
     */

    var name,
        last,
        type,

        prefix,

        url,
        info,

        defaultType;

    //  If the proper TP.core.Node subtype has been cached on the supplied
    //  node, then just return it.
    if (TP.isValid(type = aNode[TP.NODE_TYPE])) {
        return type;
    }

    //  tag is how we can override the natural tag's lookup model
    if (TP.notEmpty(name = TP.elementGetAttribute(
                                    aNode,
                                    'tibet:tag',
                                    true)) && name !== last) {
        last = name;
        //  name wins if we have a type with that precise name
        if (TP.isType(type = TP.sys.getTypeByName(name))) {

            //  If the type's Type prototype is not the same as this one's Type
            //  prototype and it owns a 'getConcreteType' method (meaning it is
            //  a type cluster and wants to specialize the type even further),
            //  then invoke that and use the return value.
            if (type.Type !== this.Type &&
                TP.owns(type.Type, 'getConcreteType')) {
                type = type.getConcreteType(aNode);
            }

            if (!type.isAbstract()) {
                //  Only set the slot if its an HTML node... see above.
                TP.isHTMLNode(aNode) ? aNode[TP.NODE_TYPE] = type : 0;

                return type;
            }
        }

        //  namespace qualified tags have two more tests to see if
        //  a) to see if there is a type named '<prefix>:Element' or
        //  b) the namespace has a default type we should use
        if (TP.regex.NS_QUALIFIED.test(name)) {
            if (TP.notEmpty(prefix = name.match(/(.*):/)[1])) {
                //  If that namespace has a 'prefix' associated with it,
                //  we'll try to find a type named '<prefix>:Element'
                if (TP.isType(type = TP.sys.getTypeByName(prefix + ':Element')) &&
                    !type.isAbstract()) {
                    //  Only set the slot if its an HTML node... see above.
                    TP.isHTMLNode(aNode) ? aNode[TP.NODE_TYPE] = type : 0;

                    return type;
                }

                if (TP.notEmpty(url = TP.w3.Xmlns.getPrefixURI(prefix))) {
                    if (TP.isValid(info =
                                    TP.w3.Xmlns.get('info').at(url))) {
                        if (TP.notEmpty(defaultType =
                                            info.at('defaultNodeType'))) {
                            if (TP.isType(type =
                                            TP.sys.getTypeByName(defaultType))) {

                                //  If the type's Type prototype is not the same
                                //  as this one's Type prototype and it owns a
                                //  'getConcreteType' method (meaning it is a
                                //  type cluster and wants to specialize the
                                //  type even further), then invoke that and use
                                //  the return value.
                                if (type.Type !== this.Type &&
                                    TP.owns(type.Type, 'getConcreteType')) {
                                    type = type.getConcreteType(aNode);
                                }

                                if (!type.isAbstract()) {
                                    //  Only set the slot if its an HTML node...
                                    //  see above.
                                    TP.isHTMLNode(aNode) ?
                                            aNode[TP.NODE_TYPE] = type :
                                            0;

                                    return type;
                                }
                            }
                        }
                    }
                }
            }
        }

        //  TODO:   log a warning? no wrapper type but a tag?
    }

    //  We next try to find a type based on the 'full name'. This will be
    //  the name that the author gave in the source markup.
    //  Note how we pass 'true' to ignore any tibet:tag value (which
    //  shouldn't exist anyway)
    last = name;
    name = TP.elementGetFullName(aNode, true);
    if (name !== last && TP.isType(type = TP.sys.getTypeByName(name))) {

        //  Sometime local tag names are also native types in the system - don't
        //  return those
        if (!TP.isNativeType(type)) {

            //  If the type's Type prototype is not the same as this one's Type
            //  prototype and it owns a 'getConcreteType' method (meaning it is
            //  a type cluster and wants to specialize the type even further),
            //  then invoke that and use the return value.
            if (type.Type !== this.Type &&
                TP.owns(type.Type, 'getConcreteType')) {
                type = type.getConcreteType(aNode);
            }

            if (!type.isAbstract()) {
                //  Only set the slot if its an HTML node... see above.
                TP.isHTMLNode(aNode) ? aNode[TP.NODE_TYPE] = type : 0;

                return type;
            }
        }
    }

    //  We next try to find a type based on the 'canonical name'. This may
    //  be different from the name that the author gave in the source
    //  markup, since it uses the 'canonical prefix' for the node (if the
    //  node has a namespace).
    //  Note how we pass 'true' to ignore any tibet:tag value (which
    //  shouldn't exist anyway)
    last = name;
    name = TP.elementGetCanonicalName(aNode, true);
    if (name !== last && TP.isType(type = TP.sys.getTypeByName(name))) {

        //  If the type's Type prototype is not the same as this one's Type
        //  prototype and it owns a 'getConcreteType' method (meaning it is a
        //  type cluster and wants to specialize the type even further), then
        //  invoke that and use the return value.
        if (type.Type !== this.Type &&
            TP.owns(type.Type, 'getConcreteType')) {
            type = type.getConcreteType(aNode);
        }

        if (!type.isAbstract()) {
            //  Only set the slot if its an HTML node... see above.
            TP.isHTMLNode(aNode) ? aNode[TP.NODE_TYPE] = type : 0;

            return type;
        }
    }

    //  couldn't find either a tibet:tag or a type that matches either the 'full
    //  name' given in the source or the 'canonical name' that is computed using
    //  the node's namespace's 'canonicalprefix', so we try is to see if the
    //  node has a native namespace URI, and if so, we'll try 2 other
    //  approaches.

    if (TP.notEmpty(url = TP.nodeGetNSURI(aNode))) {
        if (TP.isValid(info = TP.w3.Xmlns.get('info').at(url))) {
            //  If that namespace has a 'prefix' associated with it, we'll
            //  try to find a type named '<prefix>:Element'
            if (TP.notEmpty(prefix = info.at('prefix'))) {
                if (TP.isType(type = TP.sys.getTypeByName(prefix + ':Element'))) {

                    //  If the type's Type prototype is not the same as this
                    //  one's Type prototype and it owns a 'getConcreteType'
                    //  method (meaning it is a type cluster and wants to
                    //  specialize the type even further), then invoke that and
                    //  use the return value.
                    if (type.Type !== this.Type &&
                        TP.owns(type.Type, 'getConcreteType')) {
                        type = type.getConcreteType(aNode);
                    }

                    if (!type.isAbstract()) {
                        //  Only set the slot if its an HTML node... see above.
                        TP.isHTMLNode(aNode) ? aNode[TP.NODE_TYPE] = type : 0;

                        return type;
                    }
                }
            }

            //  If that namespace has a 'defaultNodeType' associated
            //  with it, we'll try to find a type named that.
            if (TP.notEmpty(defaultType = info.at('defaultNodeType'))) {
                if (TP.isType(type = TP.sys.getTypeByName(defaultType))) {

                    //  If the type's Type prototype is not the same as this
                    //  one's Type prototype and it owns a 'getConcreteType'
                    //  method (meaning it is a type cluster and wants to
                    //  specialize the type even further), then invoke that and
                    //  use the return value.
                    if (type.Type !== this.Type &&
                        TP.owns(type.Type, 'getConcreteType')) {
                        type = type.getConcreteType(aNode);
                    }

                    if (!type.isAbstract()) {
                        //  Only set the slot if its an HTML node... see above.
                        TP.isHTMLNode(aNode) ? aNode[TP.NODE_TYPE] = type : 0;

                        return type;
                    }
                }
            }
        }
    }

    //  default is to wrap based on XML vs. HTML
    if (TP.isHTMLNode(aNode)) {
        //  NOTE that we don't cache TP.NODE_TYPE here to leave open the
        //  possibility that we're still loading functionality and may find
        //  a better match on subsequent attempts
        return TP.core.HTMLElementNode;
    } else {
        //  TODO Should be checking for XHTML nodes as well.
        return TP.core.XMLElementNode;
    }
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getItemTagName',
function(anObject, formatArgs) {

    /**
     * @method getItemTagName
     * @summary Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods. Note that this should return the
     *     receiver's *canonical* name.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.core.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @returns {String} The item tag name.
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getKeybindingsURI',
function(mimeType) {

    /**
     * @method getKeybindingsURI
     * @summary Returns a keybinding map file URI for the receiver. This method
     *     will only return a valid URI if one is found via configuration
     *     settings. There is no default/fallback logic for key mapping.
     * @param {String} mimeType The mimeType for the resource being looked up.
     * @returns {TP.core.URI} The computed resource URI.
     */

    var uri,
        name,
        key,
        value;

    uri = this.$get('keybindingsURI');
    if (TP.notEmpty(uri)) {
        if (uri === TP.NO_RESULT) {
            return;
        }

        return TP.uc(uri);
    }

    name = this.getResourceTypeName();
    key = 'path.' + name + '.keybindings';
    value = TP.sys.cfg(key);

    if (TP.notEmpty(value)) {
        return TP.uc(value);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getNamespaceType',
function(mimeType) {

    /**
     * @method getNamespaceType
     * @summary Returns the 'namespace' for the receiver. The canonical form of
     *     the name of the namespace type is the namespace root (i.e. 'TP'),
     *     followed by the namespace (i.e. 'html'), followed by 'XMLNS'.
     * @returns {TP.meta.core.ElementNode} The type object representing the
     *     receiver's namespace type.
     */

    var root,
        nsName,
        typeName,
        type;

    root = this.getNamespaceRoot();
    nsName = this.getNamespacePrefix();

    typeName = root + '.' + nsName + '.' + 'XMLNS';

    if (!TP.isType(type = TP.sys.getTypeByName(typeName))) {
        return;
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getDependencies',
function() {

    /**
     * @method getDependencies
     * @summary Returns an Array of Objects that the receiver considers to be
     *     it's manually determined set of 'dependent' objects that it needs in
     *     order to operate successfully. These objects can be any type of
     *     object in the system, so long as they themselves can respond to the
     *     'getDependencies' method. In this way, we can recursively
     *     determine the chain of dependent objects. This terminates at the
     *     meta-level by returning an empty Array.
     * @description Many objects can be determined via method invocation
     *     tracking to be included or excluded for packaging purposes. This
     *     method allows the receiving object to statically force a particular
     *     object to be included along with the receiver in the package. In
     *     some cases this is the only way to determine whether or not an object
     *     should be included/excluded in a particular package.
     * @returns {Object[]} The property descriptor of the attribute on the
     *     receiver.
     */

    var dependencies,

        nsType;

    //  First, grab whatever dependencies the supertype thinks are important.
    dependencies = this.callNextMethod();

    if (TP.isType(nsType = this.getNamespaceType())) {
        dependencies.push(nsType);
    }

    return dependencies;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getQueryPath',
function(wantsDeep, wantsCompiled, wantsDisabled) {

    /**
     * @method getQueryPath
     * @summary Returns the 'query path' that can be used in calls such as
     *     'nodeEvaluatePath' to obtain all of the occurrences of the receiver
     *     in a document.
     * @param {Boolean} wantsDeep Whether or not the query should represent a
     *     'deep query' - that is, all of the occurrences of this element even
     *     under elements of the same type. This defaults to false.
     * @param {Boolean} [wantsCompiled=false] Whether or not the query should
     *     also find compiled representations of the receiver. This defaults to
     *     false.
     * @param {Boolean} [wantsDisabled=true] Whether or not the query should
     *     also find disabled versions of the receiver. This defaults to true.
     * @returns {String} The path that can be used to query for Nodes of this
     *     type.
     */

    var sourceTagQuery,
        compiledTagQuery,
        query;

    //  Note here how we generate a CSS3 namespace query
    sourceTagQuery = this.get('nsPrefix') + '|' + this.get('localName');
    if (TP.isFalse(wantsDisabled)) {
        sourceTagQuery += ':not([disabled])';
    }

    compiledTagQuery = '*[tibet|tag="' +
                        this.get('nsPrefix') + ':' + this.get('localName') +
                        '"]';
    if (TP.isFalse(wantsDisabled)) {
        compiledTagQuery += ':not([disabled])';
    }

    query = sourceTagQuery;

    if (TP.isTrue(wantsCompiled)) {
        query += ', ' + compiledTagQuery;
    }

    //  If the caller wants a deep query, we can simply return the full name
    //  here.
    if (TP.isTrue(wantsDeep)) {
        return query;
    }

    //  Otherwise, we return a query that looks for a) immediate children with
    //  this name and b) descendants with this name, but only those that don't
    //  have a parent with this name - hence giving the 'shallow' quality.
    query = '> ' + sourceTagQuery +
            ',' + ' *:not(' + sourceTagQuery + ') ' + sourceTagQuery;

    if (TP.isTrue(wantsCompiled)) {
        query += ',' +
                    ' > ' + compiledTagQuery +
                    ',' + ' *:not(' + compiledTagQuery + ') ' +
                                                        compiledTagQuery;
    }

    return query;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getResourceElement',
function(resource, mimeType, setupFunc) {

    /**
     * @method getResourceElement
     * @summary Returns a resource element wrapper specific to the resource and
     *     mime type provided. This routine leverages getResourceURI to locate
     *     the source URI and then loads and wraps its content as needed.
     * @param {String} resource The resource name. Typically template, style,
     *     style_{theme}, etc. but it could be essentially anything except the
     *     word 'resource' (since that would trigger a recursion).
     * @param {String} mimeType The mimeType for the resource being looked up.
     * @param {Function} [setupFunc] An optional set up function for the
     *     resource element that will be executed before it is wrapped for
     *     return.
     * @returns {TP.core.ElementNode} The wrapped element containing the
     *     content.
     */

    var uri,
        src,
        resp,
        str,

        mime,
        xmlnsInfo,
        defaultNS,

        doc,
        elem;

    uri = this.getResourceURI(resource, mimeType);

    if (!TP.isURI(uri)) {
        return this.raise('InvalidURI',
            'Unable to locate resource URI for ' + this.asString());
    }

    src = uri.getLocation();

    //  Grab the receiver's content for processing. We do this synchronously
    //  here and we also get it in string form so we can process the markup and
    //  add default namespace as needed to make authoring more convenient.
    resp = uri.getResource(
            TP.hc('async', false,
                    'resultType', TP.TEXT,
                    'signalChange', false));

    str = resp.get('result');

    if (TP.isEmpty(mime = mimeType)) {
        mime = TP.ietf.Mime.guessMIMEType(str, uri);
    }

    //  Try to guess the default XML namespace from the MIME type computed from
    //  the supplied text and URL.
    if (TP.isValid(xmlnsInfo = TP.w3.Xmlns.fromMIMEType(mime))) {
        defaultNS = xmlnsInfo.at('uri');
    } else {
        defaultNS = null;
    }

    doc = TP.documentFromString(str, defaultNS, true);

    //  Make sure that the resource had real markup that could be built as such.
    if (!TP.isDocument(doc) || !TP.isElement(elem = doc.documentElement)) {
        return this.raise('InvalidTemplate', src);
    }

    //  If we were able to load a real document from the source URI stamp that
    //  path on it so we have it for reference.
    if (TP.notEmpty(src)) {
        doc[TP.SRC_LOCATION] = src;
    }

    //  If we were supplied with a setup Function, then execute it here.
    if (TP.isCallable(setupFunc)) {
        setupFunc(elem);
    }

    return TP.wrap(elem);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getResourceTypeName',
function() {

    /**
     * @method getResourceTypeName
     * @summary Returns the resource type name for this type. The resource type
     *     name is used when computing resource paths for this type. It is
     *     usually the type name, but can be some other unique identifier.
     * @returns {String} The resource type name for the receiver.
     */

    return this.getName();
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getResourceURI',
function(resource, mimeType, fallback) {

    /**
     * @method getResourceURI
     * @summary Returns a resource URI specific to the receiver for the named
     *     resource and mimeType. This method is used to look up template,
     *     style, theme, and other resource URIs by leveraging cfg flags and
     *     methods on the receiver specific to each resource/mime requirement.
     * @param {String} resource The resource name. Typically 'template',
     *     'style', 'style_{theme}', etc. but it could be essentially anything
     *     except the word 'resource' (since that would trigger a recursion).
     * @param {String} mimeType The mimeType for the resource being looked up.
     *     This is used to locate viable extensions based on the data in TIBET's
     *     TP.ietf.Mime.INFO dictionary.
     * @param {Boolean} [fallback] Compute a fallback value?  Defaults to the
     *     value of 'uri.fallbacks'.
     * @returns {TP.core.URI} The computed resource URI.
     */

    var str,
        uri;

    str = this.computeResourceURI(resource, mimeType, fallback);

    if (TP.notEmpty(str) && str !== 'NO_RESULT') {
        uri = TP.uc(str);
        if (TP.isValid(uri)) {
            return uri.getConcreteURI();
        } else {
            TP.ifWarn() ?
                TP.warn('Unable to construct concrete URI for: ' + str) : 0;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getStyleExtension',
function() {

    /**
     * @method getStyleExtension
     * @summary Returns any mapped style extension. This allows projects to
     *     configure for less or sass across all style URIs.
     * @returns {String} The style extension, if any is mapped.
     */

    var name,
        prefix,
        key,
        ext;

    name = this.getResourceTypeName();
    prefix = this.getNamespacePrefix().toLowerCase();

    //  e.g. style.TP.xctrls.codeeditor.extension => 'css'
    key = 'style.' + name + '.extension';
    ext = TP.sys.getcfg(key);

    if (TP.isEmpty(ext)) {
        //  e.g. style.xctrls.extension => 'less'
        key = 'style.' + prefix + '.extension';
        ext = TP.sys.getcfg(key);
    }

    if (TP.isEmpty(ext)) {
        //  NOTE: this is _not_ 'style.project.extension' in case there's a
        //  prefix somewhere that's "project".
        ext = TP.sys.getcfg('project.style.extension');
    }

    return ext;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getXMLObserver',
function(aSignal) {

    /**
     * @method getXMLObserver
     * @summary Attempts to extract the actual observer of the signal from the
     *     supplied signal. This is very useful in cases where the target of the
     *     signal has been set to a type.
     * @param {The} aSignal signal to attempt to extract the observer from.
     * @returns {Object} The native observer.
     */

    var listener,
        id,
        inst;

    listener = aSignal.get('listener');
    if (!TP.isElement(listener)) {
        return null;
    }

    if (TP.isEmpty(id = TP.elementGetAttribute(listener, 'observer'))) {
        id = TP.elementGetAttribute(listener, 'ev:observer', true);
        if (TP.isEmpty(id)) {
            return;
        }
    }

    inst = TP.bySystemId(id);
    if (TP.notValid(inst)) {
        return this.raise('TP.sig.InvalidHandler',
                            'Unable to construct handler instance');
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('guessContentTypeAndLocation',
function(anElement) {

    /**
     * @method guessContentTypeAndLocation
     * @summary Retrieves (and caches on the receiver) the MIME type and
     *     location of the receiver's content.
     * @description This method guesses the receiver's content type and
     *     location, if the receiver has external content. It then populates
     *     that information on the TP.SRC_LOCATION property and 'tibet:mime'
     *     attribute.
     * @param {Element|TP.core.ElementNode} anElement The element to guess the
     *     type and location for.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var elem,
        src,
        len,
        i,
        mime,
        mimeType,
        uri,
        mimeTypes;

    //  Make sure that we were supplied a real Element (or TP.core.ElementNode)
    if (!TP.isElement(elem = TP.unwrap(anElement))) {
        //  TODO: Raise an exception
        return this;
    }

    //  The source attribute can be provided or computed from configuration
    //  data. When it's not provided we need to know whether to look for an
    //  XSLT or XHTML file when the markup type is XML of some form.
    src = elem.ownerDocument[TP.SRC_LOCATION];
    if (TP.isEmpty(src)) {
        //  If a MIME type was explicitly defined by the targeted element, then
        //  get its resource URI and use that as the source.
        if (TP.notEmpty(
                mime = TP.elementGetAttribute(elem, 'tibet:mime', true))) {
            uri = this.getResourceURI('template', mime);

            if (TP.isURI(uri)) {
                src = uri.getLocation();
            }
        } else {
            //  Otherwise, try to poke at the resource URI with a set of MIME
            //  types and see if there are any matches. Note that this Array is
            //  constructed in order with the most common types first and least
            //  common last.
            mimeTypes = TP.ac(TP.ietf.Mime.XHTML,
                                TP.ietf.Mime.XML,
                                TP.ietf.Mime.XSLT);

            len = mimeTypes.getSize();
            for (i = 0; i < len; i++) {
                mimeType = mimeTypes.at(i);
                uri = this.getResourceURI('template', mimeType);

                if (TP.isURI(uri)) {
                    src = uri.getLocation();
                    mime = mimeType;
                    break;
                }
            }
        }
    }

    if (TP.notEmpty(src)) {
        elem.ownerDocument[TP.SRC_LOCATION] = src;
    }

    if (TP.notEmpty(mime)) {
        TP.elementSetAttribute(elem, 'tibet:mime', mime, true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineHandler('Signal',
function(aSignal) {

    /**
     * @method handleSignal
     * @summary Handles notification of an incoming signal. For types the
     *     standard handle call will try to locate a signal-specific handler
     *     function just like with instances, but the default method for
     *     handling them defers to an instance rather than the type itself.
     * @param {TP.sig.Signal} aSignal The signal instance to respond to.
     * @returns {Object} The function's return value.
     */

    var observer;

    //  if the signal has an observer instance we can identify and acquire
    //  then we can leverage that, otherwise we shouldn't have been targeted
    observer = this.getXMLObserver(aSignal);

    //  Guard against recursion by invoking this indirectly again.
    if (observer === this) {
        return this.raise('TP.sig.InvalidHandler',
            'Recursive observer definition.');
    }

    if (TP.isValid(observer)) {
        return TP.handle(observer, aSignal);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('isBlockLevel',
function() {

    /**
     * @method isBlockLevel
     * @summary Returns whether the receiving type represents a block level
     *     element either in native form or when compiling (in the case of
     *     action elements).
     * @returns {Boolean} Whether the element is block level. The default is
     *     false.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('isOpaqueBubblerFor',
function(anElement, aSignal) {

    /**
     * @method isOpaqueBubblerFor
     * @summary Returns whether the elements of this type are considered to be
     *     an 'opaque bubbler' for the supplied signal (i.e. it won't let the
     *     signal 'ascend' further up its parent hierarchy). This means that
     *     they will handle the signal themselves and not allow ancestors above
     *     them to handle it.
     * @description At this level, the supplied element is checked for a
     *     'tibet:opaque_bubbling' attribute, which should contain a
     *     space-separated set of TIBET signal names that will be captured by
     *     this element during the bubble phase of signaling. If that attribute
     *     is not present, it will check the 'opaqueBubblingSignalNames' type
     *     attribute for a list of signal names.
     * @param {Element} anElem The element to check for the
     *     'tibet:opaque_bubbling' attribute.
     * @param {TP.sig.Signal} aSignal The signal to check.
     * @returns {Boolean} Whether or not the receiver is opaque during the
     *     bubble phase for the signal.
     */

    var attrVal,

        opaqueSigNames,

        sigNames,

        len,
        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Check to see if the supplied element has a 'tibet:opaque_bubbling'
    //  attribute. If so, split on space (' ') and use those values as the list
    //  of signals.
    if (TP.elementHasAttribute(anElement, 'tibet:opaque_bubbling', true)) {
        attrVal = TP.elementGetAttribute(
                        anElement, 'tibet:opaque_bubbling', true);
        opaqueSigNames = attrVal.split(' ');
    } else {
        //  Otherwise, ask the type.
        opaqueSigNames = this.get('opaqueBubblingSignalNames');
    }

    if (TP.isEmpty(opaqueSigNames)) {
        return false;
    }

    //  Some signals, keyboard signals in particular, have multiple signal
    //  names. We need to make sure that all of them are tested here.
    sigNames = aSignal.getSignalNames();

    len = sigNames.getSize();
    for (i = 0; i < len; i++) {
        if (opaqueSigNames.indexOf(sigNames.at(i)) !== TP.NOT_FOUND) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('isOpaqueCapturerFor',
function(anElement, aSignal) {

    /**
     * @method isOpaqueCapturerFor
     * @summary Returns whether the elements of this type are considered to be
     *     an 'opaque capturer' for the supplied signal (i.e. it won't let the
     *     signal 'descend' further into its descendant hierarchy). This means
     *     that they will handle the signal themselves and not allow targeted
     *     descendants underneath them to handle it.
     * @description At this level, the supplied element is checked for a
     *     'tibet:opaque_capturing' attribute, which should contain a
     *     space-separated set of TIBET signal names that will be captured by
     *     this element during the capture phase of signaling. If that attribute
     *     is not present, it will check the 'opaqueCapturingSignalNames' type
     *     attribute for a list of signal names.
     * @param {Element} anElem The element to check for the
     *     'tibet:opaque_capturing' attribute.
     * @param {TP.sig.Signal} aSignal The signal to check.
     * @returns {Boolean} Whether or not the receiver is opaque during the
     *     capture phase for the signal.
     */

    var attrVal,

        opaqueSigNames,

        sigNames,

        len,
        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Check to see if the supplied element has a 'tibet:opaque_capturing'
    //  attribute. If so, split on space (' ') and use those values as the list
    //  of signals.
    if (TP.elementHasAttribute(anElement, 'tibet:opaque_capturing', true)) {
        attrVal = TP.elementGetAttribute(
                        anElement, 'tibet:opaque_capturing', true);
        opaqueSigNames = attrVal.split(' ');
    } else {
        //  Otherwise, ask the type.
        opaqueSigNames = this.get('opaqueCapturingSignalNames');
    }

    if (TP.isEmpty(opaqueSigNames)) {
        return false;
    }

    //  Some signals, keyboard signals in particular, have multiple signal
    //  names. We need to make sure that all of them are tested here.
    sigNames = aSignal.getSignalNames();

    len = sigNames.getSize();
    for (i = 0; i < len; i++) {
        if (opaqueSigNames.indexOf(sigNames.at(i)) !== TP.NOT_FOUND) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('mutationAddedNodes',
function(anElement, nodesAdded) {

    /**
     * @method mutationAddedNodes
     * @summary Handles a 'nodes added' synthetic 'event' that was dispatched
     *     against the supplied native element.
     * @description This method is usually activated as the result of a 'DOM
     *     Mutation' of this node whereby a descendant is being added. Note that
     *     the 'nodesAdded' parameter here contains a list of *roots* that will
     *     have been added to the receiver. Any descendants of these roots will
     *     not be in this list.
     * @param {HTMLElement} anElement The target element computed for this
     *     signal.
     * @param {Array} nodesAdded The nodes added to the receiver.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var processor,

        mutatedGIDs,

        rootNodesAdded,

        len,
        i,

        root;

    if (!TP.isElement(anElement)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Allocate a tag processor and initialize it with the ATTACH_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.ATTACH_PHASES);

    mutatedGIDs = TP.ac();

    //  Filter out any non-roots. We only want to process roots.
    rootNodesAdded = TP.nodeListFilterNonRoots(nodesAdded);

    //  Now, process each *root* that we have gotten as an added root
    len = rootNodesAdded.getSize();
    for (i = 0; i < len; i++) {
        root = rootNodesAdded.at(i);

        //  Check to make sure we haven't already awakened this content. If so
        //  we want to exit.
        if (root[TP.AWAKENED]) {
            continue;
        }

        //  Check to make sure this isn't a 'generated node'. If so we want to
        //  exit.
        if (root[TP.GENERATED]) {
            continue;
        }

        //  It seems weird that the root might be detached since it was 'added',
        //  but the way that mutation observers work (they trigger this code) is
        //  that the root might have been added and then removed all before the
        //  'mutation records' are processed. We need to make sure the DOM root
        //  is still attached.
        if (TP.nodeIsDetached(root)) {
            continue;
        }

        //  If the root is an Element and it has an attribute of
        //  'tibet:noawaken', then skip processing it.
        if (TP.isElement(root) &&
            TP.elementHasAttribute(root, 'tibet:noawaken', true)) {
            continue;
        }

        //  If the root has an ancestor Element that has an attribute of
        //  'tibet:noawaken', then skip processing it.
        if (TP.isElement(TP.nodeGetFirstAncestorByAttribute(
                                        root, 'tibet:noawaken', null, true))) {
            continue;
        }

        //  Note here how we assign the global ID if there isn't one present.
        //  This is important for observers of this signal who will want to come
        //  back and reference these elements.
        if (TP.isElement(root)) {
            mutatedGIDs.push(TP.gid(root, true));
        } else {
            mutatedGIDs.push(TP.gid(root.parentNode, true));
        }

        processor.processTree(root);

        //  Signal from the root node that attach processing is complete.
        TP.signal(TP.wrap(root),
                    'TP.sig.AttachComplete',
                    TP.hc('mutatedNodeIDs', mutatedGIDs));

        //  If the node is an element, then remove any 'tibet:recasting' flag
        //  that might have been put on the element by our redraw machinery.
        if (TP.isElement(root)) {
            TP.elementRemoveAttribute(root, 'tibet:recasting', true);
        }
    }

    //  Signal from our target element's document that we attached nodes due to
    //  a mutation.
    TP.signal(TP.tpdoc(anElement),
                'TP.sig.MutationAttach',
                TP.hc('mutationTarget', TP.wrap(anElement),
                        'mutatedNodeIDs', mutatedGIDs));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('mutationRemovedNodes',
function(anElement, nodesRemoved) {

    /**
     * @method mutationRemovedNodes
     * @summary Handles a 'nodes removed' synthetic 'event' that was dispatched
     *     against the supplied native element.
     * @description This method is usually activated as the result of a 'DOM
     *     Mutation' of this node whereby a descendant is being removed. Note
     *     that the 'nodesRemoved' parameter here contains a list of *roots*
     *     that will have been removed from the receiver. Any descendants of
     *     these roots will not be in this list.
     * @param {HTMLElement} anElement The target element computed for this
     *     signal.
     * @param {Array} nodesRemoved  The nodes removed from the receiver.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var processor,

        mutatedGIDs,

        rootNodesRemoved,

        focusStackCheckElems,

        len,
        i,

        shouldProcess,

        parentHasNoAwaken,
        targetHasNoAwaken,
        targetAnsHasNoAwaken,

        root;

    if (!TP.isElement(anElement)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Allocate a tag processor and initialize it with the DETACH_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.DETACH_PHASES);

    mutatedGIDs = TP.ac();

    //  Filter out any non-roots. We only want to process roots.
    rootNodesRemoved = TP.nodeListFilterNonRoots(nodesRemoved);

    focusStackCheckElems = TP.ac();

    //  Now, process each *root* that we have gotten as a removed root
    len = rootNodesRemoved.getSize();
    for (i = 0; i < len; i++) {

        root = rootNodesRemoved.at(i);

        //  Check to make sure this isn't a 'generated node'. If so we want to
        //  exit.
        if (root[TP.GENERATED]) {
            continue;
        }

        //  Note here how we assign the global ID if there isn't one present.
        //  This is important for observers of this signal who will want to come
        //  back and reference these elements.
        if (TP.isElement(root)) {
            mutatedGIDs.push(TP.gid(root, true));
        } else {
            mutatedGIDs.push(TP.gid(root.parentNode, true));
        }

        //  Initially we're set to process this markup.
        shouldProcess = true;

        //  But if the root is an Element and it has an attribute of
        //  'tibet:noawaken', then skip processing it.
        if (TP.isElement(root) &&
            TP.elementHasAttribute(root, 'tibet:noawaken', true)) {
            shouldProcess = false;
        }

        //  If the shouldProcess flag is still true
        if (shouldProcess) {
            //  We need to now check for 'tibet:noawaken' in the hierarchy of
            //  the root. Because the root is detached, we need to break this
            //  check into 2 parts: the first part will check the root's
            //  ancestor tree (if there is any) and the second part will check
            //  from the target root.
            //  Then both results will be checked. This gives the maximum chance
            //  that a 'tibet:noawaken' flag will be found, if it ever existed
            //  for this root.

            if (TP.isElement(root.parentNode)) {
                parentHasNoAwaken = TP.nodeGetFirstAncestorByAttribute(
                                            root, 'tibet:noawaken', null, true);
            }

            targetHasNoAwaken = TP.elementHasAttribute(
                                    anElement, 'tibet:noawaken', true);

            targetAnsHasNoAwaken = TP.nodeGetFirstAncestorByAttribute(
                                    anElement, 'tibet:noawaken', null, true);

            if (parentHasNoAwaken ||
                targetHasNoAwaken ||
                targetAnsHasNoAwaken) {
                shouldProcess = false;
            }
        }

        if (shouldProcess) {
            //  Note here how we pass true to allow the processing pipeline to
            //  process the root, even though it was detached.
            processor.processTree(root, null, true);
        }

        if (TP.isElement(root)) {
            focusStackCheckElems.push(root);

            focusStackCheckElems = focusStackCheckElems.concat(
                                TP.nodeGetDescendantElements(root, '*'));
        }

        //  Signal from the root node that detach processing is complete.
        TP.signal(TP.wrap(root),
                    'TP.sig.DetachComplete',
                    TP.hc('mutatedNodeIDs', mutatedGIDs));
    }

    //  Signal from our target element's document that we detached nodes due to
    //  a mutation.
    TP.signal(TP.tpdoc(anElement),
                'TP.sig.MutationDetach',
                TP.hc('mutationTarget', TP.wrap(anElement),
                        'mutatedNodeIDs', mutatedGIDs));

    //  Filter any elements that are descendants of the nodes we are removing
    //  from the DOM out of the $focus_stack.

    if (TP.notEmpty(focusStackCheckElems)) {
        TP.$focus_stack = TP.$focus_stack.reject(
                            function(aTPElem) {
                                if (focusStackCheckElems.contains(
                                        aTPElem.getNativeNode(),
                                        TP.IDENTITY)) {
                                    return true;
                                }

                                return false;
                            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @method shouldAutoWrapItems
     * @summary Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.core.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver. For most tags this is a noop.
     * @param {TP.sig.ShellRequest} aRequest The shell request currently being
     *     processed.
     * @returns {Object} A value which controls outer TSH loop processing.
     *     Common values are TP.CONTINUE and TP.BREAK.
     */

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//  Awakening/Deadening Methods
//  ------------------------------------------------------------------------

/*
TIBET's content-setting methods rely on TP.nodeAwakenContent to ensure
that any runtime setup or "awakening" needed by the new content gets done.

Specific examples include XML Events setup, which is needed to ensure that
both the arming and observation phases are done for any ev: namespaced
content. Without an awakening step the page's events would not operate.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAwakenContent',
function(aNode) {

    /**
     * @method nodeAwakenContent
     * @summary This method is the primary entry point for awakening new
     *     content that has been added to a visible DOM.
     * @description You don't normally call this, it's invoked by the various
     *     setContent() calls to ensure that new content is properly awakened.
     * @param {Node} aNode The node to awaken.
     * @exception TP.sig.InvalidNode
     */

    var processor;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  NB: We don't bother to check the TP.AWAKENED and TP.GENERATED flags here
    //  since we're 'forcing' an awaken.

    //  If the node is an Element and it has an attribute of 'tibet:noawaken',
    //  then skip processing it.
    if (TP.isElement(aNode) &&
        TP.elementHasAttribute(aNode, 'tibet:noawaken', true)) {
        return;
    }

    //  If the node has an ancestor Element that has an attribute of
    //  'tibet:noawaken', then skip processing it.
    if (TP.isElement(TP.nodeGetFirstAncestorByAttribute(
                                    aNode, 'tibet:noawaken', null, true))) {
        return;
    }

    //  Allocate a tag processor and initialize it with the ATTACH_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.ATTACH_PHASES);

    //  Process the tree of markup
    processor.processTree(aNode);

    //  Flag the node as having been awakened. This state is checked by mutation
    //  handlers etc. to avoid duplicate effort.
    aNode[TP.AWAKENED] = true;

    //  If the node is an element, then remove any 'tibet:recasting' flag that
    //  might have been put on the element by our redraw machinery.
    if (TP.isElement(aNode)) {
        TP.elementRemoveAttribute(aNode, 'tibet:recasting', true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeDeadenContent',
function(aNode) {

    /**
     * @method nodeDeadenContent
     * @summary This method is the primary entry point for deadening existing
     *     content that is being removed from a visible DOM.
     * @description You don't normally call this - in fact, it's rarely invoked.
     * @param {Node} aNode The node to deaden.
     * @exception TP.sig.InvalidNode
     */

    var processor;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  NB: We don't bother to check the TP.AWAKENED and TP.GENERATED flags here
    //  since we're 'forcing' a deaden.

    //  If the node is an Element and it has an attribute of 'tibet:noawaken',
    //  then skip processing it.
    if (TP.isElement(aNode) &&
        TP.elementHasAttribute(aNode, 'tibet:noawaken', true)) {
        return;
    }

    //  If the node has an ancestor Element that has an attribute of
    //  'tibet:noawaken', then skip processing it.
    if (TP.isElement(TP.nodeGetFirstAncestorByAttribute(
                                    aNode, 'tibet:noawaken', null, true))) {
        return;
    }

    //  Allocate a tag processor and initialize it with the ATTACH_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.DETACH_PHASES);

    //  Process the tree of markup
    processor.processTree(aNode);

    //  Flag the node as having not been awakened. This state is checked by
    //  mutation handlers etc. to avoid duplicate effort.
    aNode[TP.AWAKENED] = false;

    //  If the node is an element, then remove any 'tibet:recasting' flag that
    //  might have been put on the element by our redraw machinery.
    if (TP.isElement(aNode)) {
        TP.elementRemoveAttribute(aNode, 'tibet:recasting', true);
    }

    return;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagAttachBinds',
function(aRequest) {

    /**
     * @method tagAttachBinds
     * @summary Awakens any bind: namespace event handlers for the element in
     *     aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        type;

    if (TP.notValid(type = TP.bind.XMLNS)) {
        return this.raise('TP.sig.InvalidType',
                            'Couldn\'t find the \'bind:\' namespace type');
    }

    node = aRequest.at('node');

    return type.setup(node);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description At this level, this type detects any 'on:' attributes that
     *     have to do with 'attachment' and processes them according to 'on:'
     *     rules.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        onAttrNodes,

        len,
        i,

        name,

        sigData;

    node = aRequest.at('node');

    //  Detect if there are any attribute nodes in the 'on:' namespace
    if (TP.notEmpty(onAttrNodes = TP.elementGetAttributeNodesInNS(
                            node, null, TP.w3.Xmlns.ON))) {

        //  If so, loop over them, detecting to see if any of them have to do
        //  with attachment.
        len = onAttrNodes.getSize();
        for (i = 0; i < len; i++) {

            name = TP.attributeGetLocalName(onAttrNodes.at(i));

            //  If the name matches any one of the three forms that we allow,
            //  then go ahead and grab the signal data from the attribute's
            //  value and queue the signal.
            if (name === 'attach' ||
                name === 'TP.sig.AttachComplete' ||
                name === 'AttachComplete') {

                sigData = onAttrNodes.at(i).value;

                TP.queueSignalFromData(
                    sigData,
                    node,
                    null,   //  signal
                    null,   //  payload
                    null,   //  policy
                    TP.sig.ResponderSignal);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        reloadableAttrs,
        len,
        i,

        attrName,
        val,

        uri,

        obsAttrs;

    //  If we are configured to watch remote resources, then we need to query
    //  this type for any 'reloadable URI attributes' and observe any URI
    //  values that we find there.
    if (TP.sys.cfg('uri.watch_remote_changes')) {

        //  Make sure that we have a node to work from.
        if (!TP.isElement(elem = aRequest.at('node'))) {
            return this.raise('TP.sig.InvalidNode');
        }

        tpElem = TP.wrap(elem);

        //  Iterate over the reloadable attributes and try to get a URI value
        //  from each one.

        reloadableAttrs = this.get('reloadableUriAttrs');
        len = reloadableAttrs.getSize();

        for (i = 0; i < len; i++) {
            attrName = reloadableAttrs.at(i);

            if (TP.notEmpty(
                val = TP.elementGetAttribute(elem, attrName, true))) {

                //  If we can create a valid URI from the value we find there,
                //  observe it for changes and tell it to watch its handler for
                //  change notifications.

                uri = TP.uc(val);
                if (TP.isURI(uri)) {
                    tpElem.observe(uri, 'TP.sig.ValueChange');
                    uri.watch();
                }

                if (!TP.isArray(obsAttrs = elem[TP.OBSERVED_ATTRS])) {
                    obsAttrs = TP.ac();
                    elem[TP.OBSERVED_ATTRS] = obsAttrs;
                }

                obsAttrs.push(attrName);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagAttachEvents',
function(aRequest) {

    /**
     * @method tagAttachEvents
     * @summary Attaches any ev: namespace event handlers for the element in
     *     aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        type;

    if (TP.notValid(type = TP.ev.XMLNS)) {
        return this.raise('TP.sig.InvalidType',
                            'Couldn\'t find the \'ev:\' namespace type');
    }

    node = aRequest.at('node');

    return type.setup(node);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagAttachSignals',
function(aRequest) {

    /**
     * @method tagAttachSignals
     * @summary Awakens any on: namespace signal handlers for the element in
     *     aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        type;

    if (TP.notValid(type = TP.on.XMLNS)) {
        return this.raise('TP.sig.InvalidType',
                            'Couldn\'t find the \'on:\' namespace type');
    }

    node = aRequest.at('node');

    return type.setup(node);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagDetachBinds',
function(aRequest) {

    /**
     * @method tagDetachBinds
     * @summary Detaches any bind: namespace event handlers for the element in
     *     aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        type;

    if (TP.notValid(type = TP.bind.XMLNS)) {
        return this.raise('TP.sig.InvalidType',
                            'Couldn\'t find the \'bind:\' namespace type');
    }

    node = aRequest.at('node');

    return type.teardown(node);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagDetachComplete',
function(aRequest) {

    /**
     * @method tagDetachComplete
     * @summary Executes when the tag's detachment phases are fully complete.
     * @description At this level, this type detects any 'on:' attributes that
     *     have to do with 'detachment' and processes them according to 'on:'
     *     rules.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        onAttrNodes,

        len,
        i,

        name,

        sigData;

    node = aRequest.at('node');

    //  Detect if there are any attribute nodes in the 'on:' namespace
    if (TP.notEmpty(onAttrNodes = TP.elementGetAttributeNodesInNS(
                            node, null, TP.w3.Xmlns.ON))) {

        //  If so, loop over them, detecting to see if any of them have to do
        //  with detachment.
        len = onAttrNodes.getSize();
        for (i = 0; i < len; i++) {

            name = TP.attributeGetLocalName(onAttrNodes.at(i));

            //  If the name matches any one of the three forms that we allow,
            //  then go ahead and grab the signal data from the attribute's
            //  value and queue the signal.
            if (name === 'detach' ||
                name === 'TP.sig.DetachComplete' ||
                name === 'DetachComplete') {

                sigData = onAttrNodes.at(i).value;

                TP.queueSignalFromData(
                    sigData,
                    node,
                    null,   //  signal
                    null,   //  payload
                    null,   //  policy
                    TP.sig.ResponderSignal);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Performs any 'detach' logic when the node is detached from its
     *     owning document.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        reloadableAttrs,
        len,
        i,

        attrName,
        val,

        uri,

        obsAttrs;

    //  If we are configured to watch remote resources, then we need to query
    //  this type for any 'reloadable URI attributes' and ignore any URI
    //  values that we find there (we will have already observed them in the
    //  'tagAttachDOM' call above).
    if (TP.sys.cfg('uri.watch_remote_changes')) {

        //  Make sure that we have a node to work from.
        if (!TP.isElement(elem = aRequest.at('node'))) {
            return this.raise('TP.sig.InvalidNode');
        }

        tpElem = TP.wrap(elem);

        //  Iterate over the reloadable attributes and try to get a URI value
        //  from each one.

        reloadableAttrs = this.get('reloadableUriAttrs');
        len = reloadableAttrs.getSize();

        for (i = 0; i < len; i++) {

            if (!TP.isArray(obsAttrs = elem[TP.OBSERVED_ATTRS])) {
                continue;
            }

            attrName = reloadableAttrs.at(i);

            if (obsAttrs.contains(attrName)) {

                if (TP.notEmpty(val =
                        TP.elementGetAttribute(elem, attrName, true))) {

                    //  If we can create a valid URI from the value we find
                    //  there, ignore it for changes and tell it to unwatch its
                    //  handler for change notifications.

                    uri = TP.uc(val);
                    if (TP.isURI(uri)) {
                        tpElem.ignore(uri, 'TP.sig.ValueChange');

                        //  NOTE: we DO NOT unwatch() the URI since other
                        //  elements may be observing it.
                    }

                    obsAttrs.splice(obsAttrs.indexOf(attrName), 1);
                }
            }
        }

        //  Note: call this *after* we do the above since it does a bunch of
        //  unregistration, etc.
        this.callNextMethod();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagDetachEvents',
function(aRequest) {

    /**
     * @method tagDetachEvents
     * @summary Detaches any ev: namespace event handlers for the element in
     *     aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        type;

    if (TP.notValid(type = TP.ev.XMLNS)) {
        return this.raise('TP.sig.InvalidType',
                            'Couldn\'t find the \'ev:\' namespace type');
    }

    node = aRequest.at('node');

    return type.teardown(node);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagDetachSignals',
function(aRequest) {

    /**
     * @method tagDetachSignals
     * @summary Detaches any on: namespace signal handlers for the element in
     *     aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        type;

    if (TP.notValid(type = TP.on.XMLNS)) {
        return this.raise('TP.sig.InvalidType',
                            'Couldn\'t find the \'on:\' namespace type');
    }

    node = aRequest.at('node');

    return type.teardown(node);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('tagResolve',
function(aRequest) {

    /**
     * @method tagResolve
     * @summary Resolves the receiver's content. This includes resolving XML
     *     Base URIs and virtual URIs that may occur on the receiver's
     *     attributes.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        uriAttrs;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    //  Grab the element's 'URI attributes'. If that's empty, then just
    //  return.
    if (TP.isEmpty(uriAttrs = this.get('uriAttrs'))) {
        return;
    }

    //  Iterate over any URI attributes and call rewrite() on their values.
    //  This will cause any mapped URIs to be rewritten before their XML
    //  Base value is resolved.
    uriAttrs.perform(
            function(attrName) {

                var attrVal,
                    newVal;

                attrVal = TP.elementGetAttribute(elem, attrName, true);

                //  Just in case the URI was encoded, as it is by some browsers
                //  (Firefox), make sure to decode it.
                attrVal = decodeURIComponent(attrVal);

                //  If its an absolute URI, check to see if it needs to be
                //  rewritten.
                if (TP.uriIsAbsolute(attrVal)) {
                    newVal = TP.core.URI.rewrite(attrVal).getLocation();

                    if (newVal !== attrVal) {
                        TP.elementSetAttribute(elem,
                                                attrName,
                                                newVal,
                                                true);
                    }
                }
            });

    //  update the XML Base references in the node
    TP.elementResolveXMLBase(elem, uriAttrs);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  An Array of attributes that we're suspending from setting temporarily.
TP.core.ElementNode.Inst.defineAttribute('$suspendedAttributes');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('addAttributeValue',
function(attributeName, attributeValue, checkAttrNSURI) {

    /**
     * @method addAttributeValue
     * @summary Adds an attribute value to the receiver. If the attribute
     *     doesn't exist this is equivalent to setAttribute, however if the
     *     attribute does exist this method will add the new value as a
     *     space-separated portion of the attribute's value.
     * @param {String} attributeName The attribute to set.
     * @param {String} attributeValue The attribute value.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @returns {TP.core.ElementNode} The receiver.
     */

    var natNode,
        hadAttr,
        oldValue,

        retVal,
        newValue,

        op;

    natNode = this.getNativeNode();

    hadAttr = TP.elementHasAttribute(natNode, attributeName);

    oldValue = TP.elementGetAttribute(natNode, attributeName, checkAttrNSURI);

    retVal = TP.elementAddAttributeValue(natNode, attributeName, attributeValue,
                                            checkAttrNSURI);

    newValue = TP.elementGetAttribute(natNode, attributeName, checkAttrNSURI);

    op = hadAttr ? TP.UPDATE : TP.CREATE;

    if (this.shouldFlagChanges() &&
        !TP.regex.TIBET_SCHEME.test(attributeName)) {
        TP.elementFlagChange(natNode, TP.ATTR + attributeName, op);
    }

    this.changed('@' + attributeName,
                    op,
                    TP.hc(TP.OLDVAL, oldValue,
                            TP.NEWVAL, newValue));

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('addClass',
function(className) {

    /**
     * @method addClass
     * @summary Adds the named class to the receiving element.
     * @param {String} className The class to add.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var natNode,
        oldValue,
        newValue;

    natNode = this.getNativeNode();

    oldValue = TP.elementGetClass(natNode);
    TP.elementAddClass(natNode, className);
    newValue = TP.elementGetClass(natNode);

    if (oldValue === newValue) {
        return this;
    }

    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(natNode, TP.ATTR + 'class', TP.UPDATE);
    }

    this.changed('@class',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldValue,
                            TP.NEWVAL, newValue));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @description Note that we implement this method because, in order to have
     *     TP.core.ElementNodes as event sources, they *must* have an assigned,
     *     globally-unique, ID. By implementing this method, we ensure they have
     *     that before they're registered in the signaling system as signal
     *     sources.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    //  To be observed, we really need a global ID. Here, we don't care about
    //  the return value, but make sure to force the assignment of an ID if it's
    //  not already there.
    TP.gid(this.getNativeNode(), true);

    //  Always tell the notification to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return 'TP.tpelem(\'' + this.asString() + '\')';
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('computeAttrMethodName',
function(aPrefix, anAttributeName) {

    /**
     * @method computeAttrMethodName
     * @summary Computes a 'specific' method name based on the supplied prefix
     *     and attribute name. This is usually used for things like 'specific'
     *     setter and getter attribute methods that would be called in lieu of
     *     setAttribute()/getAttribute().
     * @param {String} aPrefix The prefix to prepend to the method name.
     * @param {String} anAttributeName The attribute name to use to compute the
     *     method name. Note that this can be a namespaced attribute name (i.e.
     *     with a colon - ':') and this method will 'collapse' that into a
     *     canonical form.
     * @returns {String} The computed method name.
     */

    var attrName,
        parts,

        methodName;

    attrName = anAttributeName;

    //  if the attribute is namespace qualified, we 'start upper' each piece.
    //  e.g. 'foo:bar' -> 'FooBar'
    if (TP.regex.HAS_COLON.test(attrName)) {
        parts = attrName.split(/:/);
        attrName = TP.makeStartUpper(parts.first()) +
                    TP.makeStartUpper(parts.last());
    } else {

        //  Otherwise, we just 'start upper' the whole piece
        //  'foo' -> 'Foo'
        attrName = TP.makeStartUpper(attrName);
    }

    methodName = aPrefix + attrName;

    return methodName;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
         sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the instance receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @returns {Object} The receiver.
     */

    var targetAttr;

    targetAttr = targetAttributeName;

    //  If the targetAttributeName is either '@content' or '@value', then we
    //  trim it down to 'content' or 'value' - these have special meanings in
    //  TIBET.
    if (targetAttr === '@content') {
        targetAttr = 'content';
    } else if (targetAttr === '@value') {
        targetAttr = 'value';
    }

    return this.callNextMethod(targetAttr, resourceOrURI, sourceAttributeName,
                                sourceFacetName, transformationFunc);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('destroyBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
         sourceFacetName) {

    /**
     * @method destroyBinding
     * @summary Removes a binding from the instance receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The receiver.
     */

    var targetAttr;

    targetAttr = targetAttributeName;

    //  If the targetAttributeName is either '@content' or '@value', then we
    //  trim it down to 'content' or 'value' - these have special meanings in
    //  TIBET.
    if (targetAttr === '@content') {
        targetAttr = 'content';
    } else if (targetAttr === '@value') {
        targetAttr = 'value';
    }

    return this.callNextMethod(targetAttr, resourceOrURI, sourceAttributeName,
                                sourceFacetName);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('get',
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value, if any, of the attribute provided. Note
     *     however that special parsing rules apply to TP.core.Node types.
     * @description TP.core.Nodes, particularly TP.core.ElementNode nodes, can
     *     process complex paths consistent with a variety of standards. The
     *     parsing of these paths is handled by the TP.nodeEvaluatePath()
     *     primitive when any non-JS identifier characters are found in the
     *     path. In all other cases the standard attribute/property access rules
     *     apply. This implies that to force a path to be parsed a certain way
     *     there must be either unique character values in the path or a
     *     "scheme" function must enclose the path. This latter approach is
     *     consistent with how XPointers and XForms extensions work, making use
     *     of xpointer(), xpath1(), element() and similar schemes. TIBET adds
     *     css() and similar extensions to allow a URI fragment to define a
     *     specific form of path traversal, reducing overhead and helping to
     *     avoid ambiguous syntax variations. In the absence of this indicator
     *     the path is checked for various characters that might help indicate
     *     what type of path it is, but given the overlap between standards the
     *     result isn't always deterministic. See nodeEvaluatePath() for more.
     * @param {String} attributeName The name of the attribute to return.
     * @returns {String|Object} The value of the desired attribute.
     */

    var path,
        pathStr,

        funcName,

        args;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  We can shortcut '#document' by just returning our document
    if (attributeName === '#document') {
        return this.getDocument();
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(pathStr, 'value'))) {
                //  There wasn't a valid access path aliased to that identifier,
                //  so just use the path we were originally going to use.
                path = attributeName;
            }
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName) &&
                !TP.regex.ATTRIBUTE.test(attributeName)) {
        path = TP.apc(attributeName, TP.hc('shouldCollapse', true));
    }

    if (TP.notValid(path)) {
        //  optimize for attribute access when prefix indicates (but not for
        //  '@*' paths where the caller wants all attributes).
        if (TP.regex.ATTRIBUTE.test(attributeName) &&
            !TP.regex.ATTRIBUTE_ALL.test(attributeName)) {
            return this.getAttribute(attributeName.slice(1));
        }

        //  We can shortcut barename IDs by evaluating just the barename syntax
        if (TP.regex.BARENAME.test(attributeName)) {

            //  Make sure to TP.wrap() the return value for consistent results
            return TP.wrap(TP.nodeEvaluateBarename(this.getNativeNode(),
                                                    attributeName));
        }

        //  try common naming convention
        funcName = 'get' + TP.makeStartUpper(attributeName);
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }

        //  booleans can often be found via is* methods
        funcName = 'is' + TP.makeStartUpper(attributeName);
        if (TP.isMethod(this[funcName])) {
            return this[funcName]();
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        pathStr = path.asString();
        if (pathStr === '.') {
            return this;
        }

        //  Note here how, if we were given more than 1 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 1) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource(path));
        } else {
            args = TP.ac(this.getPathSource(path), this.getPathParameters());
        }

        //  Make sure to TP.wrap() the return value for consistent results
        return TP.wrap(path.executeGet.apply(path, args));
    }

    //  let the standard mechanism handle it
    return this.getProperty(attributeName);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$getAttribute',
function(attributeName) {

    /**
     * @method $getAttribute
     * @summary Returns the value of the attribute provided.
     * @description The typical operation is to retrieve the attribute from the
     *     receiver's native node. When the attribute is prefixed this method
     *     will attempt to find the matching attribute value for that prefix
     *     based on the document's prefixes and TIBET's canonical prefixing
     *     information regarding namespaces. Note that this call is only valid
     *     for Element nodes; when invoked on a document the documentElement is
     *     targeted.
     * @param {String} attributeName The attribute to find.
     * @returns {String} The attribute value, if found.
     */

    var node;

    node = this.getNativeNode();

    return TP.elementGetAttribute(node, attributeName, true);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getAttribute',
function(attributeName) {

    /**
     * @method getAttribute
     * @summary Returns the value of the attribute provided.
     * @description The typical operation is to retrieve the attribute from the
     *     receiver's native node. When the attribute is prefixed this method
     *     will attempt to find the matching attribute value for that prefix
     *     based on the document's prefixes and TIBET's canonical prefixing
     *     information regarding namespaces. Note that this call is only valid
     *     for Element nodes; when invoked on a document the documentElement is
     *     targeted.
     * @param {String} attributeName The attribute to find.
     * @returns {String} The attribute value, if found.
     */

    var methodName;

    //  try attribute manipulation naming convention first
    methodName = this.computeAttrMethodName('getAttr', attributeName);
    if (TP.canInvoke(this, methodName)) {
        return this[methodName]();
    }

    return this.$getAttribute(attributeName);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getAttributes',
function(attributeName, stripPrefixes) {

    /**
     * @method getAttributes
     * @summary Returns a hash of zero to N attribute name/value pairs,
     *     potentially matching the attribute name provided. For document nodes
     *     this operation effectively operates on the document's
     *     documentElement.
     * @param {String|RegExp} attributeName An attributeName "search" criteria
     *     of the form 'wholename' '*:localname' or 'prefix:*' or any RegExp.
     *     This is optional.
     * @param {Boolean} stripPrefixes Whether or not to strip any namespace
     *     prefixes from the attribute names as they are populated into the
     *     return value.
     * @returns {TP.core.Hash} A collection of name/value pairs.
     */

    var node;

    node = this.getNativeNode();

    return TP.elementGetAttributes(node, attributeName, stripPrefixes);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getCanonicalName',
function() {

    /**
     * @method getCanonicalName
     * @summary Returns a string containing the receiving node's canonical
     *     name, the canonical namespace prefix and local name combination.
     * @returns {String} The receiver's tag name.
     */

    return TP.elementGetCanonicalName(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getClass',
function() {

    /**
     * @method getClass
     * @summary Returns the CSS class attribute value of the receiving element.
     * @returns {String} The class value, if any.
     */

    var natNode;

    natNode = this.getNativeNode();

    return TP.elementGetClass(natNode);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getContentPrimitive',
function(operation) {

    /**
     * @method getContentPrimitive
     * @summary Returns the primitive function used to perform the operation
     *     specified. For example, an operation of TP.APPEND might return the
     *     TP.nodeAddContent primitive or a related function specific to the
     *     type of node being modified.
     * @param {String} operation A constant defining the operation. Valid values
     *     include: TP.APPEND TP.INSERT TP.UPDATE.
     * @exception TP.sig.InvalidOperation When the operation isn't a valid one.
     * @returns {Function} A TP primitive function.
     */

    switch (operation) {
        case TP.APPEND:
            return TP.elementAddContent;
        case TP.INSERT:
            return TP.elementInsertContent;
        case TP.REPLACE:
            return TP.elementReplaceWith;
        case TP.UPDATE:
            return TP.elementSetContent;
        default:
            return this.raise('TP.sig.InvalidOperation');
    }
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getChangeAction',
function(locationPath) {

    /**
     * @method getChangeAction
     * @summary Returns any action for the supplied location path.
     * @description The supplied location path should take the form of:
     *     TP.SELF                  ->  The action for the receiving element
     *                                  itself.
     *     TP.ATTR + attributeName  ->  The action for a named attribute
     *                                  E.g. 'TP.ATTRfoo'
     * @param {String} locationPath The location path to query for an action.
     * @returns {String} An action such as TP.CREATE, TP.UPDATE or TP.DELETE
     */

    var action;

    action = TP.elementGetChangeAction(
                            this.getNativeNode(true, true),
                            locationPath);

    return action;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getFullName',
function() {

    /**
     * @method getFullName
     * @summary Returns a string containing the receiving node's full
     *     name, the actual namespace prefix and local name combination.
     * @returns {String} The receiver's tag name.
     */

    return TP.elementGetFullName(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getID',
function() {

    /**
     * @method getID
     * @summary Returns the public ID of the receiver.
     * @returns {String} The public ID of the receiver.
     */

    //  Make sure that, if the receiver is a prototype, we just return the value
    //  of the TP.ID slot. Otherwise, we're trying to get an ID from an object
    //  that represents only a partially formed instance for this type.
    if (TP.isPrototype(this)) {
        return this[TP.ID];
    }

    //  Note the difference here from the version we override from our supertype
    //  - we want to force the assignment of an ID if it's not already there.

    return TP.gid(this.getNativeNode(), true);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getLocalName',
function() {

    /**
     * @method getLocalName
     * @summary Returns the local (unprefixed) name of the receiver.
     * @returns {String} The local name of the receiver.
     */

    return TP.elementGetLocalName(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getTagName',
function() {

    /**
     * @method getTagName
     * @summary Returns a string containing the receiving node's 'tagname'.
     *     This operation only returns valid strings for Element nodes.
     * @returns {String} The receiver's tag name.
     */

    var node;

    node = this.getNativeNode();

    return node.tagName;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getTemplateName',
function() {

    /**
     * @method getTemplateName
     * @summary Returns the name of any associated template for the receiver.
     * @returns {String} The template name.
     */

    var urn;

    urn = this.getAttribute('tsh:template_name');
    if (TP.notEmpty(urn)) {
        urn = urn.startsWith(TP.TIBET_URN_PREFIX) ?
                    urn :
                    TP.TIBET_URN_PREFIX + urn;

        return urn;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getTextContent',
function() {

    /**
     * @method getTextContent
     * @summary Returns the normalized text content of the receiver.
     * @returns {String} The receiver's text value.
     */

    var content,
        type,
        formats;

    content = TP.nodeGetTextContent(this.getNativeNode());

    //  If the receiver has a 'ui:type' attribute, then try first to convert the
    //  content to that type before trying to format it.
    if (TP.notEmpty(type = this.getAttribute('ui:type'))) {
        if (!TP.isType(type = TP.sys.getTypeByName(type))) {
            return this.raise('TP.sig.InvalidType');
        } else {
            content = type.fromString(content);
        }
    }

    //  If the receiver has a 'ui:storage' attribute, then format the return
    //  value according to the formats found there.
    if (TP.notEmpty(formats = this.getAttribute('ui:storage'))) {
        content = this.$formatValue(content, formats);
    }

    return content;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getTextNodesMatching',
function(aMatchFunction) {

    /**
     * @method getTextNodesMatching
     * @summary Returns any descendant Text nodes under the receiving element
     *     that return true when the supplied matching Function executed against
     *     their nodeValue.
     * @param {Function} aMatchFunction The Function to execute against the
     *     nodeValue of each descendant Text node. This should take one
     *     argument, the text node to test, and return a Boolean as to whether
     *     the text node matches.
     * @returns {Text[]} An array of Text nodes that match the criteria in the
     *     supplied matching Function.
     */

    return TP.elementGetTextNodesMatching(
                            this.getNativeNode(), aMatchFunction);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles notification of a change.
     * @description If the origin is a URI that one of our 'reloadable
     *     attributes' has as the reference to its remote resource, then the
     *     'reloadFrom<Attr>' method is invoked on the receiver.
     * @param {TP.sig.Signal} aSignal The signal instance to respond to.
     */

    var origin,

        aspect,

        originLocation,

        reloadableAttrs,
        len,
        i,

        attrName,
        attrVal,
        attrURI,

        val,

        methodName;

    //  Grab the signal origin - for changes to observed URI resources (see the
    //  tagAttachDOM()/tagDetachDOM() methods) this should be the URI that
    //  changed.
    origin = aSignal.getSignalOrigin();

    //  If it was a URL, then process it as a 'remote resource change'.
    if (TP.isKindOf(origin, TP.core.URL)) {

        //  If the aspect is one of URI's 'special aspects', then we just return
        //  here.
        aspect = aSignal.at('aspect');
        if (TP.core.URI.SPECIAL_ASPECTS.contains(aspect)) {
            return;
        }

        //  Grab the fully expanded location of the URI that changed.
        originLocation = origin.getLocation();

        //  Iterate over the reloadable attributes.

        reloadableAttrs = this.getType().get('reloadableUriAttrs');
        len = reloadableAttrs.getSize();

        for (i = 0; i < len; i++) {

            attrName = reloadableAttrs.at(i);

            if (TP.notEmpty(attrVal = this.getAttribute(attrName)) &&
                    TP.isURI(attrURI = TP.uc(attrVal))) {

                //  Grab any URI location value that can be computed from the
                //  result of getting the attribute on ourself (and removing any
                //  'unique query' cache-busting string from it).
                val = TP.uriRemoveUniqueQuery(attrURI.getLocation());

                //  If that value equals the location that changed, call the
                //  proper messaging machinery.
                if (val === originLocation) {

                    //  Compute a method name for reloading the resource
                    //  referenced by that attribute on ourself and invoke it if
                    //  we respond to that method.
                    methodName = this.computeAttrMethodName(
                                                'reloadFromAttr', attrName);

                    if (TP.canInvoke(this, methodName)) {
                        this[methodName](val);
                        break;
                    }
                }
            }
        }
    } else {
        return this.callNextHandler();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('hasClass',
function(className) {

    /**
     * @method hasClass
     * @summary Tests to see if the receiving element has the named class.
     * @param {String} className The class to test.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var natNode;

    natNode = this.getNativeNode();

    return TP.elementHasClass(natNode, className);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('hasAttribute',
function(attributeName) {

    /**
     * @method hasAttribute
     * @summary Returns whether or not the receiver has the named attribute
     *     provided. This method essentially emulates the native node
     *     hasAttribute call. Note that this call is only valid for Element
     *     nodes; when invoked on a document wrapper the documentElement is
     *     targeted.
     * @param {String} attributeName The attribute to test.
     * @exception TP.sig.InvalidOperation
     * @returns {Boolean} Whether or not the receiver has the named attribute.
     */

    var node;

    node = this.getNativeNode();

    return TP.elementHasAttribute(node, attributeName, true);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isSingleValued',
function(aspectName) {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is single valued for.
     * @returns {Boolean} True when single valued.
     */

    var elem,
        attrVal;

    elem = this.getNativeNode();

    //  If this element has a 'tibet:single' attribute, then we return the value
    //  of that. This allows 'instance level' programming of a particular
    //  element.
    if (TP.elementHasAttribute(elem, 'tibet:single', true)) {
        if (TP.notEmpty(aspectName)) {
            attrVal = TP.elementGetAttribute(elem, 'tibet:single', true);
            attrVal = attrVal.split(' ');
            return attrVal.contains(aspectName);
        }

        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isScalarValued',
function(aspectName) {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is scalar valued for.
     * @returns {Boolean} True when scalar valued.
     */

    //  If this element has a 'tibet:scalar' attribute, then we return the value
    //  of that. This allows 'instance level' programming of a particular
    //  element.
    var elem,
        attrVal;

    elem = this.getNativeNode();

    //  If this element has a 'tibet:scalar' attribute, then we return the value
    //  of that. This allows 'instance level' programming of a particular
    //  element.
    if (TP.elementHasAttribute(elem, 'tibet:scalar', true)) {
        if (TP.notEmpty(aspectName)) {
            attrVal = TP.elementGetAttribute(elem, 'tibet:scalar', true);
            attrVal = attrVal.split(' ');
            return attrVal.contains(aspectName);
        }

        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('produceValue',
function(aspectName, aContentObject, aRequest) {

    /**
     * @method produceValue
     * @summary Produces the value that will be used by the setValue() method
     *     to set the content of the receiver.
     * @description This method works together with the 'isSingleValued()' and
     *     'isScalarValued()' methods to produce the proper value for the
     *     receiver. See the method description for isScalarValued() for more
     *     information.
     * @param {String} aspectName The aspect name on the receiver that the value
     *     is being produced for. Many times, this is 'value'.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     */

    var value,
        formats;

    value = aContentObject;

    //  If the receiver has a 'ui:display' attribute, then format the return
    //  value according to the formats found there.
    if (TP.notEmpty(formats = this.getAttribute('ui:display'))) {
        value = this.$formatValue(value, formats);
        value = this.callNextMethod(aspectName, value, aRequest);
    } else {
        value = this.callNextMethod();
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('removeClass',
function(className) {

    /**
     * @method removeClass
     * @summary Removes the named class from the receiving element.
     * @param {String} className The class to remove, if found.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var natNode,
        oldValue,
        newValue;

    natNode = this.getNativeNode();

    oldValue = TP.elementGetClass(natNode);
    TP.elementRemoveClass(natNode, className);
    newValue = TP.elementGetClass(natNode);

    if (oldValue === newValue) {
        return this;
    }

    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(natNode, TP.ATTR + 'class', TP.DELETE);
    }

    this.changed('@class',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldValue,
                            TP.NEWVAL, newValue));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$removeAttribute',
function(attributeName, shouldSignal) {

    /**
     * @method removeAttribute
     * @summary Removes the named attribute. This version is a wrapper around
     *     the native element node removeAttribute call which attempts to handle
     *     standard change notification semantics for native nodes as well as
     *     proper namespace management.
     * @param {String} attributeName The attribute name to remove.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     */

    var attr,
        node,

        flag;

    node = this.getNativeNode();

    //  work from the attribute node so we can be more accurate. this helps
    //  ensure that environments which don't preserve the concept of a
    //  namespace URI consistently (html) won't end up with two attributes
    //  of the same name but different namespace URIs

    if (TP.regex.HAS_COLON.test(attributeName)) {
        //  Note here the usage of our own call which will attempt to divine
        //  the namespace URI if the checkAttrNSURIs flag is true.
        attr = TP.$elementGetPrefixedAttributeNode(node,
                                                    attributeName,
                                                    true);
    } else {
        attr = node.getAttributeNode(attributeName);
    }

    //  no node? nothing to remove then
    if (TP.notValid(attr)) {
        return;
    }

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    //  NB: We don't flag changes for internal 'tibet:' attributes
    //  (presuming change flagging is on)
    if (this.shouldFlagChanges() &&
        !TP.regex.TIBET_SCHEME.test(attributeName)) {
        TP.elementFlagChange(node, TP.ATTR + attributeName, TP.DELETE);
    }

    //  rip out the attribute itself
    TP.elementRemoveAttribute(node, attributeName, true);

    if (flag) {
        this.$changed('@' + attributeName, TP.DELETE);
    }

    //  removeAttribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('removeAttribute',
function(attributeName) {

    /**
     * @method removeAttribute
     * @summary Removes the named attribute. This version is a wrapper around
     *     the native element node removeAttribute call which attempts to handle
     *     standard change notification semantics for native nodes as well as
     *     proper namespace management.
     * @param {String} attributeName The attribute name to remove.
     */

    var methodName;

    //  try attribute manipulation naming convention first
    methodName = this.computeAttrMethodName('removeAttr', attributeName);
    if (TP.canInvoke(this, methodName)) {
        return this[methodName]();
    }

    return this.$removeAttribute(attributeName);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('replaceClass',
function(oldClass, newClass) {

    /**
     * @method replaceClass
     * @summary A convenience wrapper for TP.elementReplaceClass.
     * @param {String} oldClass The class value to find.
     * @param {String} newClass The class value to set.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var natNode,
        oldValue,
        newValue;

    natNode = this.getNativeNode();

    oldValue = TP.elementGetClass(natNode);
    TP.elementReplaceClass(natNode, oldClass, newClass);
    newValue = TP.elementGetClass(natNode);

    if (oldValue === newValue) {
        return this;
    }

    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(natNode, TP.ATTR + 'class', TP.UPDATE);
    }

    this.changed('@class',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldValue,
                            TP.NEWVAL, newValue));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('resume',
function(aSignal) {

    /**
     * @method resume
     * @summary Causes notifications of the signal provided to resume. Undoes
     *     the effect of having called suspend(). The origin being resumed is
     *     the receiver.
     * @param {TP.sig.Signal} aSignal The signal to resume.
     * @returns {Object} The registration.
     */

    //  re-enabling all notification
    if (TP.notValid(aSignal)) {
        delete this.getNativeNode()[TP.SHOULD_SUSPEND_SIGNALING];
    }

    return TP.resume(this, aSignal);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('resumeSettingOf',
function(attributeName) {

    /**
     * @method resumeSettingOf
     * @summary Removes a previous suspension of setting of the supplied
     *     attribute name by the suspendSettingOf method.
     * @param {String} attributeName The attribute name to resume.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var suspendedAttrs;

    suspendedAttrs = this.get('$suspendedAttributes');
    if (TP.notValid(suspendedAttrs)) {
        return this;
    }

    suspendedAttrs.remove(attributeName);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('serializeCloseTag',
function(storageInfo) {

    /**
     * @method serializeCloseTag
     * @summary Serializes the closing tag for the receiver.
     * @description At this type level, this method, in conjunction with the
     *     'serializeOpenTag' method, will always produce the 'XML version' of
     *     an empty tag (i.e. '<foo/>' rather than '<foo></foo>').
     * @param {TP.core.Hash} storageInfo A hash containing various flags for and
     *     results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the receiver's document
     *          node should include an 'XML declaration' at the start of its
     *          serialization. The default is false.
     *          'wantsPrefixedXMLNSAttrs': Whether or not the receiver and its
     *          decendant elements should generate prefixed (i.e. 'xmlns:foo')
     *          attributes to support their proper serialization. The default is
     *          true.
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

    var result,
        elem;

    result = TP.ac();

    elem = this.getNativeNode();

    //  If the tag is empty, then the serializeOpenTag() method will have
    //  written 'empty XML syntax', so we don't need to do anything here.
    if (TP.isEmpty(elem)) {
        return '';
    }

    result.push('</', elem.tagName.toLowerCase(), '>');

    return result.join('');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('serializeOpenTag',
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
     *          'wantsXMLDeclaration': Whether or not the receiver's document
     *          node should include an 'XML declaration' at the start of its
     *          serialization. The default is false.
     *          'wantsPrefixedXMLNSAttrs': Whether or not the receiver and its
     *          decendant elements should generate prefixed (i.e. 'xmlns:foo')
     *          attributes to support their proper serialization. The default is
     *          true.
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

    var result,

        elem,

        elemTagName,

        realElemPrefix,
        realElemLocalName,

        computedElemName,
        computedElemNameParts,
        computedElemPrefix,
        computedElemLocalName,

        elemAttrs,

        i,

        attrName,
        attrPrefix,
        attrValue,

        currentNSURI,
        currentNSPrefixes,

        wantsPrefixedXMLNSAttrs,

        mimeType,

        storageLoc;

    result = TP.ac();

    elem = this.getNativeNode();

    //  Grab the element's tag name and convert it to lowercase. It
    //  it's empty, bail out.
    if (TP.isEmpty(elemTagName = elem.tagName.toLowerCase())) {
        return;
    }

    //  If the tag is a 'meta' tag with a 'generator', then its
    //  unnecessary for our produced markup so we exit here.
    if (elemTagName === 'meta') {
        if (elem.name.toLowerCase() === 'generator') {
            return;
        }
    }

    realElemPrefix = this.getNamespacePrefix();
    realElemLocalName = this.getTagName();

    computedElemName = this.getFullName();
    computedElemNameParts = computedElemName.split(':');
    computedElemPrefix = computedElemNameParts.first();
    computedElemLocalName = computedElemNameParts.last();

    currentNSPrefixes = TP.ac();

    wantsPrefixedXMLNSAttrs = storageInfo.atIfInvalid(
                                    'wantsPrefixedXMLNSAttrs', true);

    //  Start the tag
    result.push('<', elemTagName);

    //  Grab the element's attributes
    elemAttrs = elem.attributes;

    //  Loop over them and compute the name and value for them.
    for (i = 0; i < elemAttrs.length; i++) {

        attrName = elemAttrs[i].localName;
        attrPrefix = elemAttrs[i].prefix;
        attrValue = elemAttrs[i].value;

        //  If the attribute has a colon (':') in it, check to see if a
        //  namespace can be found that would match the part of the attribute
        //  name before the colon.
        if (TP.notEmpty(attrPrefix)) {

            switch (attrPrefix) {

                case 'acl':
                case 'xml':
                    continue;

                case 'tibet':

                    if (attrName !== 'tag') {
                        continue;
                    }
                    break;

                case 'xmlns':   //  NB: We allow default namespaces below.

                    //  If the prefix has a matching URI, then it's a 'built in'
                    //  (or has been registered), so we skip it. Otherwise, it
                    //  needs to be printed.
                    if (TP.notEmpty(TP.w3.Xmlns.getPrefixURI(attrName))) {
                        continue;
                    }

                /* eslint-disable no-fallthrough */
                default:

                    //  If this prefix is not in the 'current prefixes list'
                    //  (tracked element-by-element and emptied after each
                    //  element is processed) then try to grab the URI and build
                    //  an 'xmlns' attribute.
                    if (!currentNSPrefixes.contains(attrPrefix)) {
                        currentNSURI = TP.w3.Xmlns.getPrefixURI(attrPrefix);

                        if (wantsPrefixedXMLNSAttrs) {

                            if (TP.notEmpty(currentNSURI)) {
                                result.push(' ', 'xmlns:', attrPrefix,
                                        '="', currentNSURI, '"');
                            } else {
                                result.push(' ', 'xmlns:', attrPrefix,
                                        '="urn:tibet:unrecognizednamespace"');
                            }
                        }

                        //  Remember that we processed this prefix for this
                        //  element so that we don't end up with multiple
                        //  'xmlns:' attributes with the same prefix on the same
                        //  element.
                        currentNSPrefixes.push(attrPrefix);
                    }
                /* eslint-enable no-fallthrough */
            }
        }

        switch (attrName) {
            case 'xmlns':

                //  A default namespace. Try to obtain the document's MIME type
                //  and derive a namespace from it. If it's the same as the
                //  value of this attribute, then ignore it (per TIBET's 'auto
                //  namespacing' capability).
                mimeType = this.getDocumentMIMEType();

                if (TP.notEmpty(mimeType)) {
                    currentNSURI = TP.w3.Xmlns.fromMIMEType(mimeType).at('uri');
                    if (TP.notEmpty(currentNSURI) &&
                        currentNSURI === attrValue) {
                        continue;
                    }
                }

                break;

            case 'id':

                if (attrValue.startsWith(
                        computedElemPrefix + '_' +
                        computedElemLocalName + '_')) {
                    continue;
                }

                if (attrValue.startsWith(
                        realElemPrefix + '_' +
                        realElemLocalName + '_')) {
                    continue;
                }

                break;

            case 'href':

                if (elem.tagName !== 'link' && elem.tagName !== 'a') {
                    break;
                }

                storageLoc = storageInfo.at('store');

                if (TP.isURIString(storageLoc)) {
                    attrValue = TP.uriRelativeToPath(
                                    attrValue,
                                    storageLoc,
                                    true);
                }

                break;

            case 'src':

                if (elem.tagName !== 'script') {
                    break;
                }

                storageLoc = storageInfo.at('store');

                if (TP.isURIString(storageLoc)) {
                    attrValue = TP.uriRelativeToPath(
                                    attrValue,
                                    storageLoc,
                                    true);
                }

                break;

            case 'style':

                //  The best way to get the attribute value of the 'style'
                //  attribute is to grab its 'cssText' property (we also
                //  lowercase it here to conform to TIBET coding standards).
                attrValue = TP.elementGetStyleObj(elem).cssText.toLowerCase();
                break;

            default:

                //  No special handling... just go ahead and use the value from
                //  the attribute node.
                break;
        }

        //  If no attribute value was supplied, then we merely set it to be the
        //  empty string.
        if (TP.isEmpty(attrValue)) {
            if (TP.isEmpty(attrPrefix)) {
                result.push(' ', attrName, '=""');
            } else {
                result.push(' ', attrPrefix, ':', attrName, '=""');
            }
        } else {
            //  Otherwise, we set it to its value after replacing literal
            //  constructs with entities.
            if (TP.isEmpty(attrPrefix)) {
                result.push(' ', attrName, '="',
                            TP.xmlLiteralsToEntities(attrValue).replace(
                                                            /&apos;/g, '\''),
                            '"');
            } else {
                result.push(' ', attrPrefix, ':', attrName, '="',
                            TP.xmlLiteralsToEntities(attrValue).replace(
                                                            /&apos;/g, '\''),
                            '"');
            }
        }
    }

    //  End the tag.

    //  If the tag is empty, then we use 'XML empty' syntax.
    if (TP.isEmpty(elem)) {
        result.push('/>');
    } else {
        result.push('>');
    }

    //  Clear out any current namespace prefixes we are tracking.
    currentNSPrefixes.empty();

    return result.join('');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute or path target to the
     *     value provided.
     * @description Paths of various forms can be used to define what should be
     *     set via this call. These paths are typically found in XML source such
     *     as XForms or XControls in bind: attributes. NB: You *must* use a '/',
     *     '[', '(', or '@' in the XPath to allow XPaths to be recognized
     *     properly. If you want to set child nodes by using their tag name, you
     *     must use an expression such as './child' and not just 'child', as the
     *     latter will be used by this object to look up a 'child' slot on this
     *     object. When a non-path attribute name is provided and it resolves
     *     via aspect mapping to a path this process is also invoked. All other
     *     attributes are set on the TP.core.Node itself just as with other
     *     TIBET instances.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The result of setting the attribute on the receiver.
     *     This can vary in actual type.
     */

    var path,
        pathStr,

        funcName,

        args;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(pathStr, 'value'))) {
                //  There wasn't a valid access path aliased to that identifier,
                //  so just use the path we were originally going to use.
                path = attributeName;
            }
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName) &&
                !TP.regex.ATTRIBUTE.test(attributeName)) {
        path = TP.apc(attributeName, TP.hc('shouldCollapse', true));
    }

    if (TP.notValid(path)) {

        //  optimize for attribute access when prefix indicates (but not for
        //  '@*' paths where the caller wants all attributes).
        if (TP.regex.ATTRIBUTE.test(attributeName) &&
            !TP.regex.ATTRIBUTE_ALL.test(attributeName)) {
            return this.setAttribute(attributeName.slice(1), attributeValue);
        }

        //  try common naming convention first
        funcName = 'set' + TP.makeStartUpper(attributeName);
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }

        //  booleans can often be set via is* methods, which take a parameter
        //  in TIBET syntax
        if (TP.isBoolean(attributeValue)) {
            funcName = 'is' + TP.makeStartUpper(attributeName);
            if (TP.isMethod(this[funcName])) {
                return this[funcName](attributeValue);
            }
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how, if we were given more than 3 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 3) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource(path));
        } else {
            args = TP.ac(this.getPathSource(path), attributeValue, shouldSignal,
                            this.getPathParameters());
        }

        return path.executeSet.apply(path, args);
    }

    //  let the standard method handle it
    return this.setProperty(attributeName, attributeValue, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setClass',
function(className) {

    /**
     * @method setClass
     * @summary A convenience wrapper for TP.elementSetClass.
     * @param {String} className The class value to set.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var natNode,
        oldValue,
        newValue;

    natNode = this.getNativeNode();

    oldValue = TP.elementGetClass(natNode);
    TP.elementSetClass(natNode, className);
    newValue = TP.elementGetClass(natNode);

    if (oldValue === newValue) {
        return this;
    }

    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(natNode, TP.ATTR + 'class', TP.UPDATE);
    }

    this.changed('@class',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldValue,
                            TP.NEWVAL, newValue));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setID',
function(anID) {

    /**
     * @method setID
     * @summary Sets the public ID of the receiver. Note that this corresponds
     *     to the 'local ID' of the receiver.
     * @description Note that this method will assign a generated ID if the
     *     supplied ID is empty.
     * @param {String} anID The value to use as a public ID.
     * @returns {String} The ID that was set.
     */

    var natNode,
        wasRegistered,

        id,
        docID,
        globalID;

    natNode = this.getNativeNode();

    //  If the receiver was registered under an 'id', unregister it and
    //  re-register with the new ID below.
    if (TP.notEmpty(id = TP.gid(natNode, false)) && id !== anID) {
        wasRegistered = TP.sys.hasRegistered(this, id);
        TP.sys.unregisterObject(this, id);
    }

    if (TP.isEmpty(id = anID)) {
        id = TP.elemGenID(natNode);
    }

    TP.elementSetAttribute(natNode, 'id', id, true);

    if (TP.notEmpty(docID = TP.gid(TP.nodeGetDocument(natNode), true))) {
        globalID = docID.replace(/#.+/, '#' + id);
        //  Note here how we put the slot directly on the element for speed and
        //  to avoid markup clutter.
        natNode[TP.GLOBAL_ID] = globalID;
    }

    if (wasRegistered) {
        //  Note here how we *refetch the global ID* since that's what we're
        //  replacing... not just the local ID that we just set.
        id = TP.gid(natNode, false);
        TP.sys.registerObject(this, id);
    }

    return id;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setPhase',
function(aPhase) {

    /**
     * @method setPhase
     * @summary Sets the current processing phase for the content. This
     *     attribute is also placed on the content itself to mark it for
     *     inspection by other routines.
     * @param {String} aPhase A content-processing phase value.
     * @returns {TP.core.ElementNode} The receiver.
     */

    //  don't forget to do the real work ;)
    this.$set('phase', aPhase);

    //  update the native node. usually we won't be doing this at the node
    //  level, but on occasion we'll process here rather than at the
    //  document level

    //  Note here how we pass 'true' as the fourth parameter to use 'strict'
    //  namespace setting to force this call to truly place the attribute
    //  inside of the 'tibet:' namespace. Otherwise, the attribute will
    //  'lose' its namespace along the way of processing.
    TP.elementSetAttribute(this.getNativeNode(),
                            'tibet:phase',
                            aPhase,
                            true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$setAttribute',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method setAttribute
     * @summary Sets the value of the named attribute. This version is a
     *     wrapper around the native element node setAttribute call which
     *     attempts to handle standard change notification semantics for native
     *     nodes as well as proper namespace management.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {null} Null according to the spec for DOM 'setAttribute'.
     */

    var boolAttrs,

        node,

        hadAttribute,

        oldValue,

        attr,

        flag,

        nameParts,
        prefix,
        name,
        url;

    if (TP.notEmpty(boolAttrs = this.get('booleanAttrs')) &&
        boolAttrs.containsString(attributeName) &&
        TP.isFalsey(attributeValue)) {

        return this.removeAttribute(attributeName);
    }

    node = this.getNativeNode();

    hadAttribute = TP.elementHasAttribute(node, attributeName, true);

    //  work from the attribute node so we can be more accurate. this helps
    //  ensure that environments which don't preserve the concept of a
    //  namespace URI consistently (html) won't end up with two attributes
    //  of the same name but different namespace URIs

    if (TP.regex.HAS_COLON.test(attributeName)) {
        //  Note here the usage of our own call which will attempt to divine
        //  the namespace URI if the checkAttrNSURIs flag is true.
        attr = TP.$elementGetPrefixedAttributeNode(node,
                                                    attributeName,
                                                    true);
    } else {
        attr = node.getAttributeNode(attributeName);
    }

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (TP.isAttributeNode(attr)) {
        //  Capture the current value
        oldValue = attr.value;

        if (attr.value === attributeValue) {
            return;
        } else {
            //  NB: We don't flag changes for internal 'tibet:' attributes
            //  (presuming change flagging is on)
            if (this.shouldFlagChanges() &&
                !TP.regex.TIBET_SCHEME.test(attributeName)) {
                TP.elementFlagChange(node, TP.ATTR + attributeName, TP.UPDATE);
            }

            attr.value = attributeValue;

            if (flag) {
                this.$changed('@' + attributeName,
                                hadAttribute ? TP.UPDATE : TP.CREATE,
                                TP.hc(TP.OLDVAL, oldValue,
                                        TP.NEWVAL, attributeValue));
            }

            return;
        }
    }

    //  if this is a prefixed attribute then we'll attempt to "do the right
    //  thing" by finding the registered namespace and placing the attribute
    //  in that namespace
    if (TP.regex.NS_QUALIFIED.test(attributeName)) {
        nameParts = attributeName.match(TP.regex.NS_QUALIFIED);
        prefix = nameParts.at(1);
        name = nameParts.at(2);

        if (attributeName.startsWith('xmlns')) {
            //  If the caller was trying to add an 'xmlns' attribute, then
            //  first check to make sure that they weren't trying to set the
            //  default namespace - can't do that :-(.
            if (attributeName === 'xmlns') {
                //  TODO: Throw an error - you cannot reset the default
                //  namespace :-(.
                return;
            }

            //  Otherwise, they're trying to add a prefixed namespace
            //  definition.
            TP.elementAddNamespace(node,
                                    prefix + ':' + name,
                                    attributeValue);

            //  NB: We don't 'flag changes' for setting an 'xmlns:*' attribute

            if (flag) {
                this.$changed('@' + attributeName, TP.CREATE);
            }

            return;
        }

        //  if we made it here we're not setting an xmlns attribute so the
        //  only other reason not to flag the element is if we're setting a
        //  tibet: internal attribute (presuming change flagging is on)
        if (this.shouldFlagChanges() &&
            !TP.regex.TIBET_SCHEME.test(attributeName)) {
            TP.elementFlagChange(node, TP.ATTR + attributeName, TP.CREATE);
        }

        //  seems like we're dealing with a prefixed attribute that isn't an
        //  xmlns attribute, so the question is do we know a URI so we can
        //  map it properly?
        if (TP.notEmpty(url = TP.w3.Xmlns.getPrefixURI(prefix))) {
            TP.elementSetAttributeInNS(node,
                                        prefix + ':' + name,
                                        attributeValue,
                                        url);
        } else {
            //  no known prefix, just set it as an attribute whose name
            //  happens to include a colon
            TP.elementSetAttribute(node, attributeName, attributeValue);
        }
    } else {
        //  not a prefixed attribute so we just need to ensure that we've
        //  updated the element crud flags as needed and set the value
        if (this.shouldFlagChanges()) {
            TP.elementFlagChange(node, TP.ATTR + attributeName, TP.CREATE);
        }

        TP.elementSetAttribute(node, attributeName, attributeValue);
    }

    if (flag) {
        this.$changed('@' + attributeName,
                        TP.CREATE,
                        TP.hc('oldValue', oldValue,
                                'newValue', attributeValue));
    }

    //  setAttribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setAttribute',
function(attributeName, attributeValue) {

    /**
     * @method setAttribute
     * @summary Sets the value of the named attribute. This version is a
     *     wrapper around the native element node setAttribute call which
     *     attempts to handle standard change notification semantics for native
     *     nodes as well as proper namespace management.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     */

    var suspendedAttrs,

        methodName;

    //  Make sure that we're not suspending changes to the supplied attribute.
    //  If we are, then just return.
    suspendedAttrs = this.$get('$suspendedAttributes');
    if (TP.isValid(suspendedAttrs) &&
        suspendedAttrs.indexOf(attributeName) !== TP.NOT_FOUND) {
        //  returns null according to the spec for DOM 'setAttribute'.
        return;
    }

    //  try attribute manipulation naming convention first
    methodName = this.computeAttrMethodName('setAttr', attributeName);
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](attributeValue);
    }

    //  Otherwise, there was no specific setter, so just use $setAttribute()
    return this.$setAttribute(attributeName, attributeValue);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setAttributes',
function(attributeHash) {

    /**
     * @method setAttributes
     * @summary Sets the value of the attributes provided using the supplied
     *     TP.core.Hash. For document nodes this operation effectively operates
     *     on the document's documentElement.
     * @param {TP.core.Hash} attributeHash The attributes to set.
     */

    attributeHash.perform(
        function(kvPair) {
            this.setAttribute(kvPair.first(), kvPair.last());
        }.bind(this));
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For general node types
     *     this method sets the value/content of the node.
     * @description For common nodes the standard attribute list and the type of
     *     input determines what is actually manipulated. For element and
     *     document nodes the behavior is a little different. When the receiver
     *     has a pre-existing value attribute that's typically what is
     *     manipulated. When no value attribute is found the content of the node
     *     is changed. The type of node and input can alter how this actually is
     *     done. See the setContent call for more information.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.core.ElementNode} The receiver.
     */

    var flag,

        newValue;

    newValue = this.produceValue('value', aValue);

    //  If the value is a String, but doesn't have Element markup in it, then we
    //  can just use 'setTextContent'. Otherwise, we have to use the full
    //  'setContent'.
    if (TP.isString(newValue) &&
        !TP.regex.CONTAINS_ELEM_MARKUP.test(newValue)) {
        this.setTextContent(newValue, shouldSignal);
    } else {
        this.setContent(newValue);
    }

    //  signal as needed

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.$changed('value', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('suspendSettingOf',
function(attributeName) {

    /**
     * @method suspendSettingOf
     * @summary Suspends the setting of the supplied attribute name. Setting can
     *     be resumed by using the resumeSettingOf method.
     * @param {String} attributeName The attribute name to suspend.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var suspendedAttrs;

    suspendedAttrs = this.get('$suspendedAttributes');
    if (TP.notValid(suspendedAttrs)) {
        suspendedAttrs = TP.ac();
        this.set('$suspendedAttributes', suspendedAttrs);
    }

    suspendedAttrs.push(attributeName);

    //  NB: This mutates the Array
    suspendedAttrs.unique();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('toggleClass',
function(className) {

    /**
     * @method toggleClass
     * @summary A convenience wrapper which will toggle a class, meaning that
     *     if the class is present it is removed, and if it's not present it
     *     will be added.
     * @param {String} className The class value to toggle.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var natNode,
        oldValue,
        newValue;

    natNode = this.getNativeNode();

    oldValue = TP.elementGetClass(natNode);
    if (TP.hasClass(natNode, className)) {
        TP.elementRemoveClass(natNode, className);
    } else {
        TP.elementAddClass(natNode, className);
    }
    newValue = TP.elementGetClass(natNode);

    if (oldValue === newValue) {
        return this;
    }

    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(natNode, TP.ATTR + 'class', TP.UPDATE);
    }

    this.changed('@class',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldValue,
                            TP.NEWVAL, newValue));

    return this;
});

//  ------------------------------------------------------------------------
//  NODE CHANGE TRACKING
//  ------------------------------------------------------------------------

/**
 * @Methods in this section provide support for tracking state changes on the
 *     markup by flagging the elements involved with special attributes. These
 *     values are then observed in other parts of TP.core.Node's processing
 *     machinery.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('shouldFlagChanges',
function(aFlag) {

    /**
     * @method shouldFlagChanges
     * @summary A combined setter/getter for the change flagging flag for the
     *     receiver.
     * @description When a TP.core.ElementNode instance is flagging changes the
     *     alterations it makes to a DOM structure are flagged in the form of
     *     'tibet:crud' attributes. Note in particular that deletes don't
     *     actually occur when change flagging is on, items are simply flagged
     *     for delete.
     * @returns {Boolean} Whether or not to flag changes to the receiver.
     */

    var natElem;

    //  NB: Because of all of the machinery around signaling and tracking
    //  changes, it's best that this method is written to poke around at the
    //  native element node.

    //  Notice here how we use the 'fast' native node get method to avoid any
    //  sorts of recursion issues.
    natElem = this.getNativeNode();

    if (TP.isBoolean(aFlag)) {
        if (TP.notTrue(aFlag)) {
            TP.elementRemoveAttribute(natElem, 'tibet:shouldFlagChanges');
        } else {
            TP.elementSetAttribute(
                    natElem, 'tibet:shouldFlagChanges', true);
        }
    }

    return TP.elementGetAttribute(natElem, 'tibet:shouldFlagChanges') ===
                    'true';
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('suspend',
function(aSignal) {

    /**
     * @method suspend
     * @summary Causes notifications of aSignal to pause from the receiver.
     *     Calling resume() with the same signal type will turn them back on.
     * @param {TP.sig.Signal} aSignal The signal to suspend.
     * @returns {Object} The registration.
     */

    //  turning off all notifications
    if (TP.notValid(aSignal)) {
        this.getNativeNode()[TP.SHOULD_SUSPEND_SIGNALING] = true;
    }

    return TP.suspend(this, aSignal);
});

//  ------------------------------------------------------------------------
//  Event Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('dispatch',
function(aSignal, aTarget, argsOrEvent, aPolicy, isCancelable, isBubbling) {

    /**
     * @method dispatch
     * @summary Dispatches a signal to the target element via TP.DOM_FIRING.
     * @description This method is used rather than signal() when it's necessary
     *     to ensure compatibility the requirements of XForms event processing.
     *     When the target is a window this routine will target that window's
     *     document.
     * @param {String|TP.sig.Signal} aSignal The signal or signal name to
     *     signal, often null so it defaults to the event name.
     * @param {Object} aTarget The target element that the event might have
     *     originated from. Usually set to 'this' in an on* method to provide
     *     the originating context object.
     * @param {Object} argsOrEvent The native Event object or other signal args
     *     in a hash.
     * @param {Object} aPolicy A standard signal policy name or definition.
     *     Defaults to TP.INHERITANCE_FIRING unless the signal has a default
     *     firing policy.
     * @param {Boolean} isCancelable Optional boolean for whether the signal is
     *     cancelable.
     * @param {Boolean} isBubbling Optional flag for whether this signal should
     *     bubble.
     * @returns {TP.sig.Signal} The signal instance which was fired.
     */

    var targetElem,
        doc;

    //  first task is to acquire the target element so we'll be able to
    //  determine the event path IDs we'll signal across
    if (TP.notValid(aTarget)) {
        targetElem = this.getNativeNode();
    } else if (TP.isString(aTarget)) {
        doc = this.getNativeDocument();
        targetElem = TP.nodeGetElementById(doc, aTarget, true);

        //  fallback here is to use TP.byId which means we can use TIBET URI
        //  references (or standard URIs for that matter) so that dispatch
        //  is "cross-document" (think iframes :))
        if (!TP.isElement(targetElem)) {
            targetElem = TP.byId(aTarget);

            if (TP.canInvoke(targetElem, 'getNativeNode')) {
                targetElem = targetElem.getNativeElement();
            } else if (TP.canInvoke(targetElem, 'getNativeDocument')) {
                targetElem = targetElem.getNativeDocument();
            } else {
                return this.raise('TP.sig.InvalidTarget',
                                    'Specified target not found: ' +
                                        aTarget);
            }
        }
    } else if (TP.isElement(aTarget)) {
        targetElem = aTarget;
    } else if (TP.canInvoke(aTarget, 'getNativeNode')) {
        targetElem = aTarget.getNativeNode();
    } else if (TP.canInvoke(aTarget, 'getNativeDocument')) {
        targetElem = aTarget.getNativeDocument();
    } else {
        return this.raise('TP.sig.InvalidParameter',
                            'Specified target not a valid dispatch target');
    }

    //  do the actual dispatch work here using TIBET's standard
    //  TP.dispatch() call (this can handle keyboard events etc)
    return TP.dispatch(targetElem,
                        aSignal,
                        targetElem,
                        argsOrEvent,
                        aPolicy,
                        isCancelable,
                        isBubbling);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getEventIds',
function() {

    /**
     * @method getEventIds
     * @summary Returns an array of the event IDs (origin IDs) for the
     *     receiver, starting with the receiver and working out to the top-most
     *     parent element.
     * @description The returned Array is configured as an 'origin set' for use
     *     by the TIBET notification system.
     * @returns {Array} An Array containing the event IDs of the receiver.
     */

    //  The TP.elementGetEventIds() call's return value has already been
    //  configured as an 'origin set'.
    return TP.elementGetEventIds(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('observe',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method observe
     * @summary Causes notifications to a particular handler to start. The
     *     origin and signal combination define how this occurs. Using null for
     *     either value means "any" and sets up a generic observation. The
     *     policy is a "registration" policy that defines how the observation
     *     will be configured. If no handler is provided the receiver is assumed
     *     and registered.
     * @param {Object} anOrigin The originator to be observed.
     * @param {TP.sig.Signal} aSignal The signal to observe.
     * @param {Object} aHandler The handler to notify.
     * @param {Function} aPolicy A "registration" policy that will define how
     *     the handler is registered.
     * @returns {Object} The registration object.
     */

    //  make sure we have an ID that will let the notification system find
    //  this element again
    if (TP.isEmpty(this.getAttribute('id'))) {
        //  Assign an ID
        TP.lid(this, true);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  Formatting/Validation Methods
//  ------------------------------------------------------------------------

/**
 *     The methods here provide support for display and storage formatting of
 *     field data as well as general-purpose data validation.
 *
 *     TIBET formatters work in chains, successively processing the value. This
 *     allows you to reuse formatters more effectively. The ui:display and
 *     ui:storage namespaced attributes accept whitespace-separated format
 *     expression values which will be used to format the output of the previous
 *     formatter in the list.
 *
 *     The type validation process here is general purpose in the sense that
 *     since both model and UI elements ultimately have TP.core.Node wrappers
 *     they can both benefit from type checks. There are two mechanisms for
 *     validation: XMLSchema and TIBET-specific types. Both offer advantages and
 *     disadvantages but the nice thing is you can mix them in the same
 *     environment if you need to.
 *
 *     When using XML Schema simply put xsi:type attributes on the elements you
 *     wish to constrain, or use the ui:type attribute to access TIBET types.
 *     The ui:type attribute takes a list of types separated by either a
 *     space or vertical bar (|). When separated by spaces all types must agree
 *     the value is valid, when separated by a vertical bar only one of the
 *     types must agree.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$formatValue',
function(aValue, formats) {

    /**
     * @method $formatValue
     * @summary Formats a value using the formatter list in the attribute
     *     provided.
     * @description The value provided is formatted based on the rules of the
     *     formatter value(s) found in the attribute provided. Note that even
     *     null values are formatted based on this rule such that you can cause
     *     a null to appear as '' or null or any other value your formatter
     *     cares to output. For that reason you can't "default" the value
     *     provided to this method since even a null value is considered a valid
     *     value to format. If the format type cannot produce a proper
     *     instance/output for the from() method for a null then the result of
     *     TP.str(null) is returned.
     *
     *     NOTE that when an error is encountered during any phase of the
     *     formatting process the value is returned without any alteration so
     *     partially formatted results are not returned. This is also true when
     *     a value "degrades" from a non-null to a null value. In that case the
     *     original value is returned.
     * @param {Object} aValue The value to format.
     * @param {String} formats A string of format expressions separated by a
     *     '|.'
     * @returns {String} The formatted value.
     */

    var value,
        params,

        result,

        i,
        len,

        elemFmts,
        format;

    //  nothing to do?
    if (TP.isEmpty(formats)) {
        return aValue;
    }

    value = aValue;

    params = TP.hc('target', this);

    //  If the formats represent a list we've got to do more work, but if not,
    //  we want to move fast on the most common case.
    try {
        if (!TP.regex.ACP_FORMAT_SEPARATOR.test(formats)) {

            //  one format
            format = formats;

            if (/^\s*\*/.test(format)) {
                format = format.slice(format.indexOf('*') + 1).trim();
                params.atPut('repeat', true);
            } else {
                params.atPut('repeat', false);
            }

            result = TP.format(value, format, params);
            value = TP.notValid(result) ? value : result;

            return value;
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Formatting error.')) : 0;

        value = aValue;
    }

    //  Formatters can sometimes consist of chain separated (for compatibility
    //  with TSH) with '.|'. We split these and process each one individually in
    //  the chain.

    elemFmts = formats.split(TP.regex.ACP_FORMAT_SEPARATOR);
    len = elemFmts.getSize();

    try {
        //  one value, multiple formats -- second most common case,
        //  basically a format chain
        for (i = 0; i < len; i++) {

            format = elemFmts.at(i);

            //  If it was a chain, we will have a leading '$_' followed by a
            //  '.|' (or '.|*') in which case the first item will be '$_'.  We
            //  will throw this away, since it's there to represent 'standard
            //  in' for compatibility with shell formatting expressions.
            if (format === '$_') {
                continue;
            }

            if (/^\s*\*/.test(format)) {
                format = format.slice(format.indexOf('*') + 1).trim();
                params.atPut('repeat', true);
            } else {
                params.atPut('repeat', false);
            }

            value = TP.format(value, format, params);
        }

        value = TP.notValid(value) ? aValue : value;

        return value;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Formatting error.')) : 0;

        value = aValue;
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$validateValue',
function(aValue) {

    /**
     * @method $validateValue
     * @summary Ensures that the value provided is valid according to the
     *     receiver's type constraints.
     * @description The validation is actually done by types specified via the
     *     xsi:type attribute or the tibet:type attribute if found. When using
     *     xsi:type, the XML Schema mechanism, you are restricted to a single
     *     type name but you can use any type TIBET can locate which implements
     *     validate. TIBET includes built-in support for the base 46 XML Schema
     *     types and can also process XML Schema documents although that process
     *     can be much slower and isn't recommended for UI validation
     *     processing. When using tibet:type you can provide a list of type
     *     names separated by spaces or vertical bars. When using spaces all
     *     types much validate, when using vertical bars only one must validate
     *     the value. As with XML Schema, the types you name must implement
     *     validate).
     * @param {Object} aValue The value to validate. Defaults to the results of
     *     this.getValue().
     * @returns {Boolean} True if the validation succeeds or no validators are
     *     found.
     */

    var i,
        type,
        validators,
        value,
        valid;

    value = aValue;

    //  if we have an XML Schema attribute then we work from that to
    //  perform validation since its the W3 standard form for this
    if (TP.notEmpty(type = this.getAttribute('xsi:type', true))) {
        //  first try to get the type directly. the xs: type will do this as
        //  well, but why load that type (even dynamically) if we don't have
        //  to? if all the validity check types are non-XML Schema types
        //  this test should let us skip loading xs: namespaced code.
        if (TP.isType(TP.sys.getTypeByName(type))) {
            return type.validate(value, this);
        }

        //  not a known type? use the full xml schema type validation
        //  process then since we're using an xsi prefix'ed attribute
        if (TP.isType(type = 'xs:'.asType())) {
            return type.validate(value, this);
        }

        //  TODO:   log a warning here?
        return true;
    }

    //  no xsi:type attribute, we'll try tibet:type then
    if (TP.notEmpty(validators = this.getAttribute('tibet:type', true))) {
        //  union (or)
        if (/\|/.test(validators)) {
            try {
                validators = validators.split('|');

                for (i = 0; i < validators.getSize(); i++) {
                    type = TP.sys.getTypeByName(validators.at(i));
                    if (TP.isType(type)) {
                        valid = type.validate(value);
                        if (valid) {
                            return true;
                        }
                    }
                }
            } catch (e) {
                TP.ifError() ?
                    TP.error(TP.ec(e, 'Validation error.')) : 0;

                //  don't let a coding error in a validator keep the UI from
                //  allowing data submission
                return true;
            }
        } else {
            //  intersection (and)
            try {
                validators = validators.split(' ');
                for (i = 0; i < validators.getSize(); i++) {
                    type = TP.sys.getTypeByName(validators.at(i));
                    if (TP.isType(type)) {
                        valid = type.validate(value);
                        if (!valid) {
                            return false;
                        }
                    }
                }
            } catch (e) {
                TP.ifError() ?
                    TP.error(TP.ec(e, 'Validation error.')) : 0;

                //  don't let a coding error in a validator keep the UI from
                //  allowing data submission
                return true;
            }
        }
    }

    return true;
});

//  ========================================================================
//  TP.core.HTMLElementNode
//  ========================================================================


/**
 * @summary A placeholder used only when an HTML DOM element doesn't locate a
 *     viable wrapper type.
 */
TP.core.ElementNode.defineSubtype('HTMLElementNode');

//  actual HTML Element instances returned are specialized on a number of
//  factors
TP.core.HTMLElementNode.isAbstract(true);

//  ------------------------------------------------------------------------

TP.core.HTMLElementNode.Inst.defineMethod('getContentPrimitive',
function(operation) {

    /**
     * @method getContentPrimitive
     * @summary Returns the primitive function used to perform the operation
     *     specified. For example, an operation of TP.APPEND might return the
     *     TP.nodeAddContent primitive or a related function specific to the
     *     type of node being modified.
     * @param {String} operation A constant defining the operation. Valid values
     *     include: TP.APPEND TP.INSERT TP.UPDATE.
     * @exception TP.sig.InvalidOperation When the operation isn't a valid one.
     * @returns {Function} A TP primitive function.
     */

    switch (operation) {
        case TP.APPEND:
            return TP.htmlElementAddContent;
        case TP.INSERT:
            return TP.htmlElementInsertContent;
        case TP.REPLACE:
            return TP.htmlElementReplaceWith;
        case TP.UPDATE:
            return TP.htmlElementSetContent;
        default:
            return this.raise('TP.sig.InvalidOperation');
    }
});

//  ========================================================================
//  TP.core.XMLElementNode
//  ========================================================================


/**
 * @summary A placeholder used only when an XML DOM element doesn't locate a
 *     viable wrapper type.
 */
TP.core.ElementNode.defineSubtype('XMLElementNode');

//  ------------------------------------------------------------------------

TP.core.XMLElementNode.Inst.defineMethod('getContentPrimitive',
function(operation) {

    /**
     * @method getContentPrimitive
     * @summary Returns the primitive function used to perform the operation
     *     specified. For example, an operation of TP.APPEND might return the
     *     TP.nodeAddContent primitive or a related function specific to the
     *     type of node being modified.
     * @param {String} operation A constant defining the operation. Valid values
     *     include: TP.APPEND TP.INSERT TP.UPDATE.
     * @exception TP.sig.InvalidOperation When the operation isn't a valid one.
     * @returns {Function} A TP primitive function.
     */

    switch (operation) {
        case TP.APPEND:
            return TP.xmlElementAddContent;
        case TP.INSERT:
            return TP.xmlElementInsertContent;
        case TP.REPLACE:
            return TP.xmlElementReplaceWith;
        case TP.UPDATE:
            return TP.xmlElementSetContent;
        default:
            return this.raise('TP.sig.InvalidOperation');
    }
});

//  ========================================================================
//  TP.core.AttributeNode
//  ========================================================================

TP.core.Node.defineSubtype('AttributeNode');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.AttributeNode.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns a viable attribue node type for aNode.
     * @description If a specific type isn't found the return value is
     *     TP.core.AttributeNode itself. The lookup process calculates a type
     *     name by acquiring the attribute's 'full name' (it's prefix + local
     *     name), and looking up a type based on that.
     * @returns {TP.lang.RootObject.<TP.core.AttributeNode>} A
     *     TP.core.AttributeNode subtype type object.
     */

    var name,
        type;

    name = TP.attributeGetFullName(aNode);

    type = TP.sys.getTypeByName(name);

    //  Make sure that we got a subtype of TP.core.AttributeNode. Sometimes the
    //  value of an attribute will have the same value as a custom tag name and
    //  we don't want that in this case.
    if (TP.isType(type) &&
        TP.isSubtypeOf(type, TP.core.AttributeNode) &&
        !type.isAbstract()) {
        return type;
    }

    return TP.core.AttributeNode;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.AttributeNode.Inst.defineMethod('getLocalName',
function() {

    /**
     * @method getLocalName
     * @summary Returns the local (unprefixed) name of the receiver.
     * @returns {String} The local name of the receiver.
     */

    return TP.attributeGetLocalName(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.AttributeNode.Inst.defineMethod('getOwnerElement',
function() {

    /**
     * @method getOwnerElement
     * @summary Returns the receiver's owner element as a TP.core.ElementNode.
     * @returns {TP.core.ElementNode} The owner element of the receiver.
     */

    return TP.wrap(TP.attributeGetOwnerElement(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.AttributeNode.Inst.defineMethod('getTextContent',
function() {

    /**
     * @method getTextContent
     * @summary Returns the normalized text content of the receiver.
     * @returns {String} The receiver's text value.
     */

    var node;

    node = this.getNativeNode();

    return node.value;
});

//  ------------------------------------------------------------------------

TP.core.AttributeNode.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For attribute nodes,
     *     this calls 'setAttribute' with the attribute name on the owner
     *     element.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.core.Node} The receiver.
     */

    var newValue;

    newValue = this.produceValue('value', aValue);

    this.getOwnerElement().setAttribute(this.getNativeNode().nodeName,
                                        newValue);

    return this;
});

//  ========================================================================
//  TP.core.TextNode
//  ========================================================================

TP.core.Node.defineSubtype('TextNode');

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.core.TextNode.Type.defineMethod('tagAttachBinds',
function(aRequest) {

    /**
     * @method tagAttachBinds
     * @summary Awakens any binding expressions for the text node in
     *     aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,

        str,
        index,

        exprNode,

        newSpan;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(node = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Grab the original text node's text content and compute the index to the
    //  starting '[['
    str = TP.nodeGetTextContent(node);
    index = str.indexOf('[[');

    //  Use the DOM to split the text node at that boundary. This creates a text
    //  node with the content *after* the index and appends it as 'node's
    //  nextSibling into the DOM.
    exprNode = node.splitText(index);

    //  Grab that text node's content and compute the index to the ']]' (plus 2
    //  - we want to leave the expression end delimiter in exprNode)
    str = TP.nodeGetTextContent(exprNode);
    index = str.indexOf(']]') + 2;

    //  We don't care about what's on the right hand side, so we don't grab the
    //  return value here. This creates another text node to the right with
    //  whatever text was there and appends it as 'exprNode's nextSibling into
    //  the DOM.
    exprNode.splitText(index);

    //  Get the text of exprNode, which will now be the '[[...]]' expression.
    str = TP.nodeGetTextContent(exprNode);

    //  Trim off the surrounding whitespace
    str = TP.trim(str);

    //  If the expression doesn't contain a '%', then it doesn't need quoting,
    //  but does need the leading and trailing '[[' and ']]' to be trimmed.
    if (!TP.regex.HAS_PERCENT.test(str)) {
        str = str.slice(2, -2);
    } else {
        str = str.quoted('\'');
    }

    //  Create a new span and set a 'bind:in' attribute on it, binding it's
    //  'content' property using the expression given (minus the leading and
    //  trailing brackets).
    newSpan = TP.documentConstructElement(TP.doc(node),
                                            'span',
                                            TP.w3.Xmlns.XHTML);

    TP.elementSetAttribute(newSpan,
                            'bind:in',
                            '{content: ' + str + '}',
                            true);

    //  Replace that text node with the span, leaving the text nodes to the left
    //  (the original) to the right (created by the 2nd 'splitText' above).
    newSpan = TP.nodeReplaceChild(node.parentNode,
                                    newSpan,
                                    exprNode,
                                    false);

    return newSpan;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TextNode.Inst.defineMethod('getTextContent',
function() {

    /**
     * @method getTextContent
     * @summary Returns the normalized text content of the receiver.
     * @returns {String} The normalized text content of the receiver.
     */

    var node;

    node = this.getNativeNode();

    return node.nodeValue;
});

//  ========================================================================
//  TP.core.CDATASectionNode
//  ========================================================================

TP.core.Node.defineSubtype('CDATASectionNode');

//  ------------------------------------------------------------------------

TP.core.CDATASectionNode.Inst.defineMethod('getTextContent',
function() {

    /**
     * @method getTextContent
     * @summary Returns the normalized text content of the receiver.
     * @returns {String} The normalized text content of the receiver.
     */

    var node;

    node = this.getNativeNode();

    return node.nodeValue;
});

//  ========================================================================
//  TP.core.EntityReferenceNode
//  ========================================================================

TP.core.Node.defineSubtype('EntityReferenceNode');

//  ========================================================================
//  TP.core.EntityNode
//  ========================================================================

TP.core.Node.defineSubtype('EntityNode');

//  ========================================================================
//  TP.core.ProcessingInstructionNode
//  ========================================================================

TP.core.Node.defineSubtype('ProcessingInstructionNode');

//  actual TP.core.ProcessingInstructionNode instances returned are
//  specialized on a number of factors
TP.core.ProcessingInstructionNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ProcessingInstructionNode.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns a viable processing instruction node type for aNode.
     * @description If a specific type isn't found the return value is
     *     either TP.core.HTMLProcessingInstruction or
     *     TP.core.XMLProcessingInstruction depending on whether the node's
     *     owner document is HTML or XML. The lookup process first calculates
     *     a type name by acquiring the PI's name, title casing that name,
     *     making its first character be uppercase, and stripping it of
     *     punctuation. It then uses that name with a suffix of 'PINode'. For
     *     example, a PI of the form '<?tibet-stylesheet?>' will search for
     *     TP.core.TibetStylesheetPINode.
     * @returns {TP.lang.RootObject.<TP.core.ProcessingInstructionNode>} A
     *     TP.core.ProcessingInstructionNode subtype type object.
     */

    var name,
        type;

    name = aNode.target;
    name = name.asTitleCase().strip(TP.regex.PUNCTUATION);

    //  TODO: This is a hardcoded namespace -- probably need a version of
    //  getTypeByName() that can do a 'deep' search across namespaces.
    type = TP.sys.getTypeByName('TP.core.' + name + 'PINode');

    //  Make sure that we got a subtype of TP.core.ProcessingInstructionNode.
    //  Sometimes the value of a processing instruction will have the same value
    //  as a custom tag name and we don't want that in this case.
    if (TP.isType(type) &&
        TP.isSubtypeOf(type, TP.core.ProcessingInstructionNode) &&
        !type.isAbstract()) {
        return type;
    }

    //  default is to wrap based on XML vs. HTML
    if (TP.isHTMLNode(aNode)) {
        return TP.core.HTMLProcessingInstruction;
    } else {
        return TP.core.XMLProcessingInstruction;
    }
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ProcessingInstructionNode.Inst.defineMethod('getTextContent',
function() {

    /**
     * @method getTextContent
     * @summary Returns the normalized text content of the receiver.
     * @returns {String} The normalized text content of the receiver.
     */

    var node;

    node = this.getNativeNode();

    return node.nodeValue;
});

//  ========================================================================
//  TP.core.TibetStylesheetPINode
//  ========================================================================

TP.core.ProcessingInstructionNode.defineSubtype('TibetStylesheetPINode');

//  A RegExp that matches 'href' entries with processing instructions
TP.core.TibetStylesheetPINode.Type.defineConstant(
                        'HREF_REGEX',
                        TP.rc('.*href=[\'"](.*)[\'"]'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.TibetStylesheetPINode.Type.defineMethod('tagInstructions',
function(aRequest) {

    /**
     * @method tagInstructions
     * @summary Processes any 'tibet-stylesheet' processing instructions in the
     *     receiver's content. When you load content via XMLHTTP.sig.Request
     *     these PIs aren't executed so you have to run them through this
     *     transform to see their effect on the document.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @exception TP.sig.InvalidNode
     */

    var node,

        doc,

        sheetPath,

        hrefValue,
        url,

        resp,
        styleTPDoc,

        rootElem,
        resultNode;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(node = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.ifInfo() ?
        TP.sys.logTransform(
                TP.annotate(
                        node, 'XSLT finalization transform starting.'),
            TP.INFO) : 0;

    doc = TP.nodeGetDocument(node);

    //  See if the document has a TP.SRC_LOCATION property. If so, we can try to
    //  use it to provide a collection path (if the sheet needs it - i.e. it's
    //  not an absolute path).
    if (TP.isValid(doc[TP.SRC_LOCATION])) {
        sheetPath = TP.uriCollectionPath(doc[TP.SRC_LOCATION]);
    } else if (TP.isValid(aRequest)) {
        //  Otherwise, see if the request has that path under the 'uri' key.

        if (TP.isValid(sheetPath = aRequest.at('uri'))) {
            //  The 'uri' slot in the param hash typically contains a
            //  TP.core.URI instance... make sure its a String.
            sheetPath = sheetPath.asString();

            //  And we want the 'collection' URL.
            sheetPath = TP.uriCollectionPath(sheetPath);
        } else {
            sheetPath = '~app_xsl';
        }
    } else {
        //  Otherwise, just use the app's 'xsl' path.
        sheetPath = '~app_xsl';
    }

    //  Use our HREF_REGEX to pull out the 'href' data off of the processing
    //  instruction (as it doesn't have 'real' attributes - it just
    //  considers its internal content to be raw text).
    hrefValue = this.HREF_REGEX.exec(node.data).at(1);

    //  If we didn't get a valid href value
    if (TP.isEmpty(hrefValue)) {
        //  No valid href - log an error and return.
        TP.ifError() ?
            TP.error('Invalid stylesheet href',
                        TP.TRANSFORM_LOG) : 0;

        return;
    }

    //  Construct a TP.core.URI relative to the sheetPath from the href
    //  value.
    url = TP.uc(TP.uriResolvePaths(sheetPath, hrefValue));

    //  Grab the content (TP) node of the stylesheet. If its a
    //  TP.core.XSLDocumentNode, run the transformation process using it.
    resp = url.getResource(TP.hc('async', false, 'resultType', TP.WRAP));
    styleTPDoc = resp.get('result');

    if (!TP.canInvoke(styleTPDoc, 'getNativeNode')) {
        //  Couldn't find the sheet - log an error and return.
        TP.ifError() ?
            TP.error('Invalid stylesheet at: ' + url.getLocation(),
                        TP.TRANSFORM_LOG) : 0;

        return;
    }

    //  It's best to remove ourself (the actual PI) from the content before
    //  processing to avoid any problems with the XSLT engines.
    TP.nodeRemoveChild(node.parentNode, node);

    //  We want to transform the element that represents the *root* of node we
    //  were handed (as per XSLT). In regular XSLT, this will be the document
    //  element, but in our environment we have a specially configured 'root'
    //  element that takes into account the fact that the tag transformation
    //  engine is holding onto the same element throughout the transformation
    //  process.
    if (!TP.isNode(rootElem = aRequest.at('root'))) {
        //  TODO: Raise an exception.
        return;
    }

    //  If we got an XSLT TP.core.Node, do the transform and get the result.
    if (TP.isKindOf(styleTPDoc, 'TP.core.XSLDocumentNode')) {
        resultNode = TP.node(
                        TP.unwrap(styleTPDoc.transform(rootElem, aRequest)));
    } else {
        TP.ifError() ?
            TP.error('Invalid stylesheet at ' + url.getLocation(),
                        TP.TRANSFORM_LOG) : 0;
    }

    //  Didn't get a valid result. Raise an exception and bail.
    if (!TP.isNode(resultNode)) {
        return this.raise('TP.sig.InvalidNode',
                            'Transformation returned empty document.');
    }

    //  Go ahead and replace the document element with the native node of
    //  the newly transformed content.
    rootElem.parentNode.replaceChild(resultNode, rootElem);

    TP.ifInfo() ?
        TP.sys.logTransform(
                TP.annotate(TP.str(resultNode),
                            'XSLT finalization transform complete.'),
            TP.INFO) : 0;

    return;
});

//  ========================================================================
//  TP.core.HTMLProcessingInstruction
//  ========================================================================

TP.core.ProcessingInstructionNode.defineSubtype('HTMLProcessingInstruction');

//  ========================================================================
//  TP.core.XMLProcessingInstruction
//  ========================================================================

TP.core.ProcessingInstructionNode.defineSubtype('XMLProcessingInstruction');

//  ========================================================================
//  TP.core.CommentNode
//  ========================================================================

TP.core.Node.defineSubtype('CommentNode');

//  ------------------------------------------------------------------------

TP.core.CommentNode.Inst.defineMethod('getTextContent',
function() {

    /**
     * @method getTextContent
     * @summary Returns the normalized text content of the receiver.
     * @returns {String} The normalized text content of the receiver.
     */

    var node;

    node = this.getNativeNode();

    return node.nodeValue;
});

//  ========================================================================
//  TP.core.DocumentNode
//  ========================================================================

TP.core.CollectionNode.defineSubtype('DocumentNode');

//  abstract because we specialize document node types by mime type
TP.core.DocumentNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.DocumentNode.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided. In this case
     *     the node is always some form of Document node (type 9).
     * @param {Node} aNode The native node to wrap.
     * @returns {TP.lang.RootObject.<TP.core.DocumentNode>} A
     *     TP.core.DocumentNode subtype type object.
     */

    var mime,
        info,
        name,
        type,
        prefix;

    //  get the mime type and see if we have a type for that mime type, that
    //  way we can manage documents like xslts etc. using custom subtypes
    mime = TP.core.Node.getContentMIMEType(aNode);
    if (TP.isString(mime)) {
        //  two choices here, there may be a 'tpDocNodeType' registered, or
        //  we may just work from naming convention
        if (TP.notEmpty(info = TP.ietf.Mime.get('info').at(mime))) {
            if (TP.notEmpty(name = info.at('tpDocNodeType'))) {
                if (TP.isType(type = TP.sys.getTypeByName(name)) &&
                    !type.isAbstract()) {
                    return type;
                }
            }
        }
    }

    //  next choice is to work from document prefix (the canonical prefix
    //  for the document element's namespace URI)
    prefix = TP.core.Node.getCanonicalPrefix(aNode);
    if (TP.notEmpty(prefix)) {
        prefix = prefix.toUpperCase();
        name = prefix + 'DocumentNode';

        //  use require to see if we can find that document type and use it
        if (TP.isType(type = TP.sys.getTypeByName(name)) && !type.isAbstract()) {
            return type;
        }
    }

    //  default is to wrap based on XML vs. HTML
    if (TP.isHTMLDocument(aNode)) {
        return TP.core.HTMLDocumentNode;
    } else if (TP.isXHTMLDocument(aNode)) {
        return TP.core.XHTMLDocumentNode;
    } else {
        return TP.core.XMLDocumentNode;
    }
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @description Note that we implement this method because, in order to have
     *     TP.core.DocumentNodes as event sources, they *must* have an assigned,
     *     globally-unique, ID. By implementing this method, we ensure they have
     *     that before they're registered in the signaling system as signal
     *     sources.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    //  To be observed, we really need a global ID. Here, we don't care about
    //  the return value, but make sure to force the assignment of an ID if it's
    //  not already there.
    TP.gid(this.getNativeNode(), true);

    //  Always tell the notification to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return 'TP.tpdoc(\'' + this.asString() + '\')';
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('get',
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value, if any, of the attribute provided. NOTE
     *     however that special parsing rules apply to TP.core.Node types with
     *     respect to the nature of the attribute name provided.
     * @description TP.core.Nodes, particularly TP.core.ElementNode nodes, can
     *     process complex paths consistent with XPointer and XPath syntax.
     *     These sometimes overlapping syntax options are handled in the order
     *     presented here. First a check is done to see if the path appears to
     *     be an XPointer (indicated by the existence of a # and either an ID,
     *     xpointer(), xpath1(), or element() function. Next are XPaths,
     *     indicated by characters such as '[', '(', '/', etc. Finally,
     *     dot-separated paths are treated as TIBET's "aspect path" form.
     * @param {String} attributeName The name of the attribute to return.
     * @returns {String|Object} The value of the desired attribute.
     */

    var path,
        pathStr,

        args,

        funcName;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  We can shortcut '#document' by just returning this. The '#document'
    //  of us is ourself ;-)
    if (attributeName === '#document') {
        return this;
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(pathStr, 'value'))) {
                //  There wasn't a valid access path aliased to that identifier,
                //  so just use the path we were originally going to use.
                path = attributeName;
            }
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName, TP.hc('shouldCollapse', true));
    }

    if (TP.notValid(path)) {

        //  We can shortcut barename IDs by evaluating just the barename syntax
        if (TP.regex.BARENAME.test(attributeName)) {
            //  Make sure to TP.wrap() the return value for consistent results
            return TP.wrap(TP.nodeEvaluateBarename(this.getNativeNode(),
                                                    attributeName));
        }

        //  try common naming convention
        funcName = 'get' + TP.makeStartUpper(attributeName);
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }

        //  booleans can often be found via is* methods
        funcName = 'is' + TP.makeStartUpper(attributeName);
        if (TP.isMethod(this[funcName])) {
            return this[funcName]();
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        pathStr = path.asString();
        if (pathStr === '.') {
            return this;
        }

        //  Note here how, if we were given more than 1 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 1) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource(path));
        } else {
            args = TP.ac(this.getPathSource(path), this.getPathParameters());
        }

        //  Make sure to TP.wrap() the return value for consistent results
        return TP.wrap(path.executeGet.apply(path, args));
    }

    //  let the standard mechanism handle it
    return this.getProperty(attributeName);
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getDocument',
function() {

    /**
     * @method getDocument
     * @summary Returns a TP.core.DocumentNode representing the receiver's
     *     document. For TP.core.DocumentNode this returns the receiver itself.
     * @returns {TP.core.DocumentNode} The document of the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getDocumentElement',
function() {

    /**
     * @method getDocumentElement
     * @summary Returns the receiver's root element as a TP.core.ElementNode.
     * @returns {TP.core.ElementNode} The root element of the receiver.
     */

    return TP.wrap(this.getNativeDocument().documentElement);
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getDocumentElementType',
function() {

    /**
     * @method getDocumentElementType
     * @summary Returns the Type object that TIBET would use to wrap the
     *     receiver's root element as a TP.core.ElementNode.
     * @returns {TP.lang.RootObject.<TP.core.ElementNode>} A TP.core.ElementNode
     *     subtype type object.
     */

    return TP.core.ElementNode.getConcreteType(
                        this.getNativeDocument().documentElement);
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getID',
function() {

    /**
     * @method getID
     * @summary Returns the public ID of the receiver.
     * @returns {String} The public ID of the receiver.
     */

    //  Make sure that, if the receiver is a prototype, we just return the value
    //  of the TP.ID slot. Otherwise, we're trying to get an ID from an object
    //  that represents only a partially formed instance for this type.
    if (TP.isPrototype(this)) {
        return this[TP.ID];
    }

    //  Note the difference here from the version we override from our supertype
    //  - we want to force the assignment of an ID if it's not already there.

    return TP.gid(this.getNativeNode(), true);
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getLocalName',
function() {

    /**
     * @method getLocalName
     * @summary Returns the local (or base) name of the receiver. In the case
     *     of 'document' nodes, this returns the 'document' value.
     * @returns {String} The local name of the receiver.
     */

    return 'document';
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getLocation',
function() {

    /**
     * @method getLocation
     * @summary Returns the location of the documents's associated URI.
     * @returns {String} The location of the receiver's URI.
     */

    var url;

    url = TP.documentGetLocation(this.getNativeNode());
    if (TP.isURIString(url)) {
        return TP.uc(url).getLocation();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getNativeDocument',
function() {

    /**
     * @method getNativeDocument
     * @summary Returns the receiver's native document.
     * @returns {Document} The receiver's native document.
     */

    //  For TP.core.DocumentNodes, the document *is* their native node.
    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getNativeDocumentElement',
function() {

    /**
     * @method getNativeDocumentElement
     * @summary Returns the receiver's native document element.
     * @returns {Node} The receiver's native document element.
     */

    return this.getNativeDocument().documentElement;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getRoot',
function() {

    /**
     * @method getRoot
     * @summary Returns the TP.core.ElementNode that represents the root
     *     element in this document. For HTML/XHTML documents this would be the
     *     <html> element. For an SVG document it would be the <svg> element.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.ElementNode} The root element of the receiver.
     */

    return TP.wrap(TP.documentGetRoot(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getTheme',
function() {

    /**
     * @method getTheme
     * @summary Gets the data-theme attribute on the document body that is
     *     helping to drive themed CSS.
     * @returns {String} The theme in effect for the receiver.
     */

    return TP.documentGetTheme(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getTitle',
function() {

    /**
     * @method getTitle
     * @summary Returns the receiver's 'title' content. This is the
     *     text content of the 'title' element in the receiver's 'head' element.
     * @returns {String} The document's title content.
     */

    return TP.documentGetTitleContent(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver.
     * @description Document nodes are handled a little differently than
     *     typical nodes since without their documentElement they're not of much
     *     use. For that reason setting the value of a document node actually
     *     sets the value of the document's documentElement.
     * @exception TP.sig.InvalidDocument
     * @returns {String} The value in string form.
     */

    var tpElem;

    if (TP.isValid(tpElem = this.getDocumentElement())) {
        return tpElem.getValue();
    }

    return this.raise('TP.sig.InvalidDocument',
                        'No document element.');
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles notification of a change.
     * @description If the origin is the URI that the receiver is observing
     *     for change (because it loaded that URI into itself), then this method
     *     reloads the URI's remote resource into the receiver.
     * @param {TP.sig.Signal} aSignal The signal instance to respond to.
     */

    var req,
        origin,
        aspect;

    //  Grab the signal origin - for changes to observed URI resources (see the
    //  tagAttachDOM()/tagDetachDOM() methods) this should be the URI that
    //  changed.
    origin = aSignal.getSignalOrigin();

    //  If it was a URL, then process it as a 'remote resource change'.
    if (TP.isKindOf(origin, TP.core.URI)) {

        //  If the aspect is one of URI's 'special aspects', then we just return
        //  here.
        aspect = aSignal.at('aspect');
        if (TP.core.URI.SPECIAL_ASPECTS.contains(aspect)) {
            return;
        }

        req = TP.request();
        this.setContent(origin, req);
    } else {
        return this.callNextMethod();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('serializeForStorage',
function(storageInfo) {

    /**
     * @method serializeForStorage
     * @summary Serialize the receiver in a manner appropriate for storage.
     * @description This method provides a serialized representation of the
     *     receiver that can be used to store it in a persistent storage. The
     *     supplied storageInfo hash should contain a storage key under the
     *     'store' key that will be used to uniquely identify the content
     *     produced for this receiver. Note that nested nodes might produce
     *     their own 'serialization stores'. All of the stores can be found
     *     under the 'stores' key in the storageInfo after the serialization
     *     process is complete.
     *     For this type, serialization means possibly writing an XML
     *     declaration (if the 'wantsXMLDeclaration' flag in the storageInfo
     *     hash is true) and the HTML5 doctype. It then calls upon its document
     *     element to serialize itself.
     * @param {TP.core.Hash} storageInfo A hash containing various flags for and
     *     results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the document node should
     *          include an 'XML declaration' at the start of its serialization.
     *          The default is false.
     *          'wantsPrefixedXMLNSAttrs': Whether or not element nodes in the
     *          document should generate prefixed (i.e. 'xmlns:foo') attributes
     *          to support their proper serialization. The default is true.
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
     * @returns {TP.core.DocumentNode} The receiver.
     */

    var result;

    result = storageInfo.atPutIfAbsent('result', TP.ac());

    if (storageInfo.at('wantsXMLDeclaration') === true) {
        result.push(TP.XML_10_HEADER, '\n\n');
    }

    result.push(TP.w3.DocType.XHTML_50.asString(), '\n\n');

    this.getDocumentElement().serializeForStorage(storageInfo);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('setID',
function(anID) {

    /**
     * @method setID
     * @summary Sets the public ID of the receiver. Note that while, for
     *     Element nodes, this corresponds to the 'local ID' of the receiver,
     *     for Document nodes this corresponds to the 'global ID' (since they
     *     don't really have a local ID).
     * @description Note that this method will assign a generated ID if the
     *     supplied ID is empty.
     * @param {String} anID The value to use as a public ID.
     * @returns {String} The ID that was set.
     */

    var node;

    node = this.getNativeNode();

    TP.elementSetAttribute(
                    node.documentElement, TP.GLOBAL_DOCID_ATTR, anID, true);

    return anID;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('setPhase',
function(aPhase) {

    /**
     * @method setPhase
     * @summary Sets the current processing phase for the content. This
     *     attribute is also placed on the content itself to mark it for
     *     inspection by other routines such as hasReachedPhase.
     * @param {String} aPhase A content-processing phase value.
     * @returns {TP.core.DocumentNode} The receiver.
     */

    var elem;

    //  don't forget to do the real work ;)
    this.$set('phase', aPhase);

    //  we'll set the documentElement's attribute, as long as we have one
    elem = this.getNativeDocument().documentElement;
    if (TP.isNode(elem)) {
        //  Note here how we pass 'true' as the fourth parameter to use
        //  'strict' namespace setting to force this call to truly place the
        //  attribute inside of the 'tibet:' namespace. Otherwise, the
        //  attribute will 'lose' its namespace along the way of processing.
        TP.elementSetAttribute(elem, 'tibet:phase', aPhase, true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('setRawContent',
function(newContent, aRequest, shouldSignal) {

    /**
     * @method setRawContent
     * @summary Sets the content of the receiver to the content provided
     *     without performing any content processing on it.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Boolean} shouldSignal If false this operation will not trigger a
     *     change notification. This defaults to true.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var loc,
        uri,

        retVal,

        natWin,
        unloadHandler;

    //  Call up to our supertype, which will set the location/content.
    retVal = this.callNextMethod();

    //  If the receiver is associated with a Window (i.e. it's being drawn into
    //  a visible DOM), observe / ignore its content for change.
    if (TP.isWindow(natWin = this.getNativeWindow())) {

        //  Get the new location and observe/watch the URI for the ValueChange.
        loc = this.getLocation();
        uri = TP.uc(loc);

        if (TP.isURI(uri)) {
            this.observe(uri, 'TP.sig.ValueChange');
            uri.watch();
        }

        //  Set up an 'document unloaded' handler on the native window so when
        //  the URI unloads from the window, it is unwatched and ignored for
        //  ValueChange.
        /* eslint-disable no-extra-parens */
        unloadHandler = (function(aSig) {

            var wasRegistered,
                unloadURI;

            unloadHandler.ignore(TP.gid(natWin), 'TP.sig.DocumentUnloaded');

            wasRegistered = TP.core.URI.hasInstance(loc);
            unloadURI = TP.uc(loc);

            //  Grab our current location and ignore/unwatch the URI for the
            //  ValueChange.
            if (TP.isURI(unloadURI)) {
                this.ignore(unloadURI, 'TP.sig.ValueChange');
                unloadURI.unwatch();
            }

            if (!wasRegistered) {
                unloadURI.unregister();
            }
        }.bind(this));
        /* eslint-enable no-extra-parens */

        unloadHandler.observe(TP.gid(natWin), 'TP.sig.DocumentUnloaded');
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('setTheme',
function(themeName) {

    /**
     * @method setTheme
     * @summary Sets a data-theme attribute on the receiver's body to help drive
     *     themed CSS.
     * @param {String} themeName The theme name to set for the document.
     * @returns {TP.core.DocumentNode} The receiver.
     */

    TP.documentSetTheme(this.getNativeNode(), themeName);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('setTitle',
function(titleText) {

    /**
     * @method setTitle
     * @summary Sets the receiver's 'title' content.
     * @param {String} titleText The value to use as the title content.
     * @returns {TP.core.DocumentNode} The receiver.
     */

    TP.documentSetTitleContent(this.getNativeNode(), titleText);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('setValue',
function(aValue, signalFlag) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node.
     * @description Document nodes are handled a little differently than
     *     typical nodes since without their documentElement they're not of much
     *     use. For that reason setting the value of a document node actually
     *     sets the value of the document's documentElement.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} signalFlag Should changes be notified. If false changes
     *     are not signaled. Defaults to this.shouldSignalChange().
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.Node} The receiver.
     */

    var tpElem;

    if (TP.isValid(tpElem = this.getDocumentElement())) {

        //  NB: This will signal change
        tpElem.setValue(aValue, signalFlag);

        return this;
    }

    return this.raise('TP.sig.InvalidDocument',
                        'No document element.');
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('shouldFlagChanges',
function(aFlag) {

    /**
     * @method shouldFlagChanges
     * @summary A combined setter/getter for the change flagging flag for the
     *     receiver.
     * @description When the document element of a TP.core.DocumentNode instance
     *     is flagging changes the alterations it makes to a DOM structure are
     *     flagged in the form of 'tibet:crud' attributes. Note in particular
     *     that deletes don't actually occur when change flagging is on, items
     *     are simply flagged for delete.
     * @returns {Boolean} Whether or not to flag changes to the receiver.
     */

    return this.getDocumentElement().shouldFlagChanges(aFlag);
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('shouldSignalChange',
function(aFlag) {

    /**
     * @method shouldSignalChange
     * @summary Defines whether the receiver should actively signal change
     *     notifications.
     * @description In general objects do not signal changes when no observers
     *     exist. This flag is triggered by observe where the signal being
     *     observed is a form of Change signal to "arm" the object for change
     *     notification. You can also manipulate it during multi-step
     *     manipulations to signal only when a series of changes has been
     *     completed.
     * @param {Boolean} aFlag true/false signaling status.
     * @returns {Boolean} The current status.
     */

    var tpDocElem;

    tpDocElem = this.getDocumentElement();

    if (TP.isValid(tpDocElem)) {
        return tpDocElem.shouldSignalChange(aFlag);
    }
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('transform',
function(anObject, aParamHash) {

    /**
     * @method transform
     * @summary Transforms the supplied Node (or TP.core.Node) by using the
     *     content of the receiver.
     * @param {Object} anObject The object supplying the data to use in the
     *     transformation.
     * @param {TP.core.Hash|TP.sig.Request} aParamHash A parameter container
     *     responding to at(). For string transformations a key of 'repeat' with
     *     a value of true will cause iteration to occur (if anObject is an
     *     'ordered collection' this flag needs to be set to 'true' in order to
     *     have 'automatic' iteration occur). Additional keys of '$STARTINDEX'
     *     and '$REPEATCOUNT' determine the range of the iteration. A special
     *     key of 'xmlns:fixup' should be set to true to fix up 'xmlns'
     *     attributes such that they won't be lost during the transformation.
     * @returns {String} The string resulting from the transformation process.
     */

    return this.getDocumentElement().transform(anObject, aParamHash);
});

//  ------------------------------------------------------------------------

//  create backstop hooks for the native document methods we support
TP.backstop(
    TP.ac('createElement',
            'createTextNode',
            'getElementsByName',
            'createAttribute',
            'createComment',
            'createDocumentFragment',
            'createCDATASection',
            'createEntityReference',
            'createProcessingInstruction'),
    TP.core.DocumentNode.getInstPrototype());

//  ========================================================================
//  TP.core.Document (alias)
//  ========================================================================

TP.core.Document = TP.core.DocumentNode;
TP.sys.addCustomType('TP.core.Document', TP.core.Document);

//  ========================================================================
//  TP.core.HTMLDocumentNode
//  ========================================================================

/**
 * @type {TP.core.HTMLDocumentNode}
 * @summary Generic HTML document wrapper.
 */

//  ------------------------------------------------------------------------

TP.core.DocumentNode.defineSubtype('HTMLDocumentNode');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('close',
function() {

    /**
     * @method close
     * @summary Closes the document and flushes any write content. This method
     *     will automatically instrument the window as well.
     * @exception TP.sig.InvalidDocument
     */

    var doc,
        win;

    if (!TP.isHTMLDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    //  Assign ids to common elements, such as the root element, the head
    //  element and the body element. These might have gotten blown away in
    //  (re)writing the document content.
    win = this.getNativeWindow();

    if (TP.isWindow(win)) {
        TP.windowAssignCommonIds(win);
    }

    doc.close();

    //  updates the window to be instrumented which also will have been
    //  cleared by any write calls
    if (TP.isWindow(win)) {
        TP.core.Window.instrument(win);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('getBody',
function() {

    /**
     * @method getBody
     * @summary Returns the TP.core.ElementNode that represents the 'body'
     *     element in this document.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.html.body} The 'body' element of the receiver.
     */

    return TP.wrap(TP.documentGetBody(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('getContentPrimitive',
function(operation) {

    /**
     * @method getContentPrimitive
     * @summary Returns the primitive function used to perform the operation
     *     specified. For example, an operation of TP.APPEND might return the
     *     TP.nodeAddContent primitive or a related function specific to the
     *     type of node being modified.
     * @param {String} operation A constant defining the operation. Valid values
     *     include: TP.APPEND TP.INSERT TP.UPDATE.
     * @exception TP.sig.InvalidOperation When the operation isn't a valid one.
     * @returns {Function} A TP primitive function.
     */

    switch (operation) {
        case TP.APPEND:
            return TP.htmlDocumentAddContent;
        case TP.INSERT:
            return TP.htmlDocumentInsertContent;
        case TP.UPDATE:
            return TP.htmlDocumentSetContent;
        default:
            return this.raise('TP.sig.InvalidOperation');
    }
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('getFocusedElement',
function(orActiveElement) {

    /**
     * @method getFocusedElement
     * @summary Returns the TP.core.ElementNode that represents the currently
     *     focused (i.e. 'active') element in this document.
     * @param {Boolean} [orActiveElement=true] Whether or not to return the
     *     standard HTML5 '.activeElement' if a 'TIBET focused' element isn't
     *     available. The default is true.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.ElementNode} The currently focused element.
     */

    return TP.wrap(TP.documentGetFocusedElement(
        this.getNativeNode(), orActiveElement));
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('getHead',
function() {

    /**
     * @method getHead
     * @summary Returns the TP.core.ElementNode that represents the 'head'
     *     element in this document.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.html.head} The 'head' element of the receiver.
     */

    return TP.wrap(TP.documentGetHead(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('getNativeWindow',
function() {

    /**
     * @method getNativeWindow
     * @summary Returns the document's native window object.
     * @exception TP.sig.InvalidDocument
     * @returns {Window} The receiver's native window object.
     */

    return TP.nodeGetWindow(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineHandler('DOMClose',
function(aSignal) {

    /**
     * @method handleDOMClose
     * @summary Closes the document and targets the window with an
     *     TP.sig.DOMClose.
     * @param {TP.sig.DOMClose} aSignal The signal instance which triggered this
     *     handler.
     */

    //  close our document down so it's empty
    this.close();

    //  and target our window for close as well
    TP.handle(this.getWindow(), aSignal, 'TP.sig.DOMClose');

    return;
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('open',
function(mimeType) {

    /**
     * @method open
     * @summary Opens the document for writing.
     * @param {The} mimeType MIME type used when opening the native document.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.DocumentNode} The receiver.
     */

    var doc,
        win;

    if (!TP.isHTMLDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    doc.open(mimeType);

    //  We make sure that the window is re-instrumented here because, in
    //  some browsers, opening the document of the window blows away the
    //  TIBET instrumentation.
    win = this.getNativeWindow();
    if (TP.isWindow(win)) {
        TP.core.Window.instrument(win);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('write',
function(theContent, setupFunction) {

    /**
     * @method write
     * @summary Writes content to the receiver's native document, ensuring that
     *     open and close are called, along with any logging which might be
     *     turned on.
     * @param {String} theContent The content to write into the native document.
     * @param {Function} setupFunction The setup function to execute as part of
     *     the document's 'onload' processing.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.DocumentNode} The receiver.
     */

    var doc,
        win,
        content;

    if (!TP.isHTMLDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    //  If a valid setup function was supplied, register it as an 'onload'
    //  function on the document. This will then be executed when the
    //  native document's 'close' method is called.

    //  NB: It doesn't matter if the setupFunction gets registered multiple
    //  times (because this method might have been called multiple times
    //  before close()) because the code that actually executes the onload
    //  function uniques all of its functions before it runs them.
    if (TP.isCallable(setupFunction)) {
        win = this.getNativeWindow();
        if (TP.isWindow(win)) {
            TP.core.Window.registerOnloadFunction(win, setupFunction);
        }
    }

    content = theContent;

    //  watch for tibet_ and replace hacks as needed
    if (/tibet_/.test(content)) {
        //  due to certain bugs in mozilla we want to check for a
        //  couple of special attributes/elements and replace them
        //  before we hand back the content
        try {
            //  update namespace references
            content = content.replace(/tibet__/g, 'tibet:');

            //  we had to escape HTML style elements and HTML link elements
            //  pointing to stylesheets and CSS imports to avoid problems
            //  with the content processing system under Mozilla, so we need
            //  to unescape those constructs here before we write the file.
            content = TP.$unescapeCSSConstructs(content);
        } catch (e) {
            //  typical error here is html rather than xhtml markup
            //  coming in and being mangled (since it wasn't really
            //  xml from the transformer's perspective)
            return this.raise(
                        'TP.sig.InvalidDocument',
                        TP.ec(e, TP.join('XML-to-XHTML conversion failed. ',
                                            'Was it truly XHTML?')));
        }
    }

    doc.write(content);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('writeln',
function(content, setupFunction) {

    /**
     * @method writeln
     * @summary Writes content to the receiver's native document (with a
     *     newline).
     * @param {String} content The content to write into the native document.
     * @param {Function} setupFunction The setup function to execute as part of
     *     the document's 'onload' processing.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.DocumentNode} The receiver.
     */

    var doc,
        win;

    if (!TP.isHTMLDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    //  If a valid setup function was supplied, register it as an 'onload'
    //  function on the document. This will then be executed when the
    //  native document's 'close' method is called.

    //  NB: It doesn't matter if the setupFunction gets registered multiple
    //  times (because this method might have been called multiple times
    //  before close()) because the code that actually executes the onload
    //  function uniques all of its functions before it runs them.
    if (TP.isCallable(setupFunction)) {
        win = this.getNativeWindow();
        if (TP.isWindow(win)) {
            TP.core.Window.registerOnloadFunction(win, setupFunction);
        }
    }

    doc.writeln(content);

    return this;
});

//  ========================================================================
//  TP.core.XMLDocumentNode
//  ========================================================================

/**
 * @type {TP.core.XMLDocumentNode}
 * @summary Generic XML document wrapper.
 */

//  ------------------------------------------------------------------------

TP.core.DocumentNode.defineSubtype('XMLDocumentNode');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.XMLDocumentNode.Inst.defineMethod('getContentPrimitive',
function(operation) {

    /**
     * @method getContentPrimitive
     * @summary Returns the primitive function used to perform the operation
     *     specified. For example, an operation of TP.APPEND might return the
     *     TP.nodeAddContent primitive or a related function specific to the
     *     type of node being modified.
     * @param {String} operation A constant defining the operation. Valid values
     *     include: TP.APPEND TP.INSERT TP.UPDATE.
     * @exception TP.sig.InvalidOperation When the operation isn't a valid one.
     * @returns {Function} A TP primitive function.
     */

    switch (operation) {
        case TP.APPEND:
            return TP.xmlDocumentAddContent;
        case TP.INSERT:
            return TP.xmlDocumentInsertContent;
        case TP.UPDATE:
            return TP.xmlDocumentSetContent;
        default:
            return this.raise('TP.sig.InvalidOperation');
    }
});

//  ========================================================================
//  TP.core.XHTMLDocumentNode
//  ========================================================================

/**
 * @type {TP.core.XHTMLDocumentNode}
 * @summary XHTML document wrapper.
 */

//  ------------------------------------------------------------------------

TP.core.XMLDocumentNode.defineSubtype('XHTMLDocumentNode');

//  ------------------------------------------------------------------------

TP.core.XHTMLDocumentNode.Inst.defineMethod('getBody',
function() {

    /**
     * @method getBody
     * @summary Returns the TP.core.ElementNode that represents the 'body'
     *     element in this document.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.html.body} The 'body' element of the receiver.
     */

    var doc;

    if (!TP.isDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    return TP.wrap(TP.documentGetBody(doc));
});

//  ------------------------------------------------------------------------

TP.core.XHTMLDocumentNode.Inst.defineMethod('getFocusedElement',
function(orActiveElement) {

    /**
     * @method getFocusedElement
     * @summary Returns the TP.core.ElementNode that represents the currently
     *     focused (i.e. 'active') element in this document.
     * @param {Boolean} [orActiveElement=true] Whether or not to return the
     *     standard HTML5 '.activeElement' if a 'TIBET focused' element isn't
     *     available. The default is true.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.ElementNode} The currently focused element.
     */

    var doc;

    if (!TP.isDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    return TP.wrap(TP.documentGetFocusedElement(doc, orActiveElement));
});

//  ------------------------------------------------------------------------

TP.core.XHTMLDocumentNode.Inst.defineMethod('getHead',
function() {

    /**
     * @method getHead
     * @summary Returns the TP.core.ElementNode that represents the 'head'
     *     element in this document.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.html.head} The 'head' element of the receiver.
     */

    var doc;

    if (!TP.isDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    return TP.wrap(TP.documentGetHead(doc));
});

//  ------------------------------------------------------------------------

TP.core.XHTMLDocumentNode.Inst.defineMethod('getNativeWindow',
function() {

    /**
     * @method getNativeWindow
     * @summary Returns the document's native window object.
     * @exception TP.sig.InvalidDocument
     * @returns {Window} The receiver's native window object.
     */

    var doc;

    if (!TP.isDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    return TP.nodeGetWindow(doc);
});

//  ------------------------------------------------------------------------

TP.core.XHTMLDocumentNode.Inst.defineHandler('DOMClose',
function(aSignal) {

    /**
     * @method handleDOMClose
     * @summary Closes the document and targets the window with an
     *     TP.sig.DOMClose.
     * @param {TP.sig.DOMClose} aSignal The signal instance which triggered this
     *     handler.
     */

    //  and target our window for close as well
    TP.handle(this.getWindow(), aSignal, 'TP.sig.DOMClose');

    return;
});

//  ========================================================================
//  TP.core.XSLDocumentNode
//  ========================================================================

/**
 * @type {TP.core.XSLDocumentNode}
 * @summary A type specific to XSL documents.
 */

//  ------------------------------------------------------------------------

TP.core.XMLDocumentNode.defineSubtype('XSLDocumentNode');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.XSLDocumentNode.Inst.defineMethod('transform',
function(anObject, aParamHash) {

    /**
     * @method transform
     * @summary Transforms the supplied Node (or TP.core.Node) by using the
     *     content of the receiver.
     * @param {Object} anObject The object supplying the data to use in the
     *     transformation.
     * @param {TP.core.Hash|TP.sig.Request} aParamHash A parameter container
     *     responding to at(). For string transformations a key of 'repeat' with
     *     a value of true will cause iteration to occur (if anObject is an
     *     'ordered collection' this flag needs to be set to 'true' in order to
     *     have 'automatic' iteration occur). Additional keys of '$STARTINDEX'
     *     and '$REPEATCOUNT' determine the range of the iteration. A special
     *     key of 'xmlns:fixup' should be set to true to fix up 'xmlns'
     *     attributes such that they won't be lost during the transformation.
     * @exception TP.sig.InvalidNode
     * @returns {String} The string resulting from the transformation process.
     */

    var node,

        dataNode,

        result,
        resultTPNode;

    node = this.getNativeNode();

    if (TP.isNode(anObject)) {
        dataNode = anObject;
    } else if (TP.canInvoke(anObject, 'getNativeNode')) {
        dataNode = anObject.getNativeNode();
    } else if (TP.isString(anObject)) {
        dataNode = TP.documentFromString(anObject);
    } else if (TP.canInvoke(anObject, 'asXMLNode')) {
        dataNode = anObject.asXMLNode();
    }

    if (!TP.isNode(dataNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    result = TP.documentTransformNode(node, dataNode, aParamHash);

    //  Now, we need to make sure that any constructs that were generated into
    //  the result that need tag compilation are processed.

    if (TP.isElement(result) &&
        TP.notTrue(this.get('$alreadyTransforming'))) {

        this.set('$alreadyTransforming', true);
        resultTPNode = TP.wrap(result);
        resultTPNode.compile();
        this.set('$alreadyTransforming', false);

        return resultTPNode.asString();

    } else if (TP.isNode(result)) {
        return TP.str(result);
    }

    return null;
});

//  ========================================================================
//  TP.core.DocumentTypeNode
//  ========================================================================

TP.core.Node.defineSubtype('DocumentTypeNode');

//  ========================================================================
//  TP.core.NotationNode
//  ========================================================================

TP.core.Node.defineSubtype('NotationNode');

//  ========================================================================
//  XSLT ELEMENTS
//  ========================================================================

TP.core.ElementNode.defineSubtype('xsl.Element');

//  actual XSL Element instances returned are specialized on a number of
//  factors
TP.xsl.Element.isAbstract(true);

//  ------------------------------------------------------------------------
//  xsl:stylesheet
//  ------------------------------------------------------------------------

TP.xsl.Element.defineSubtype('stylesheet');

//  ------------------------------------------------------------------------
//  xsl:import
//  ------------------------------------------------------------------------

TP.xsl.Element.defineSubtype('import');

TP.xsl.import.Type.set('uriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------
//  xsl:include
//  ------------------------------------------------------------------------

TP.xsl.Element.defineSubtype('include');

TP.xsl.include.Type.set('uriAttrs', TP.ac('href'));

//  ========================================================================
//  XINCLUDE PROCESSING
//  ========================================================================

TP.core.ElementNode.defineSubtype('xi.Element');

//  actual XI Element instances returned are specialized on a number of
//  factors
TP.xi.Element.isAbstract(true);

//  ------------------------------------------------------------------------
//  xi:include
//  ------------------------------------------------------------------------

TP.xi.Element.defineSubtype('include');

TP.xi.include.Type.set('uriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------

TP.xi.include.Type.defineMethod('tagIncludes',
function(aRequest) {

    /**
     * @method tagIncludes
     * @summary Processes any 'xinclude' elements in the receiver's content.
     *     This will expand any virtual URIs and resolve XML Base references on
     *     the xinclude element, retrieve the (possibly XPointered) content from
     *     the designated URI and replace it in-situ, replacing the xinclude
     *     element.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Node} The node representing the newly included content, telling
     *     the system to descend into the children of this element (which very
     *     well may be content that was included by this element).
     */

    var elem,

        fallback,

        parse,
        href,
        xpointer,

        parts,
        path,
        resp,
        content,

        url,

        newNode,

        errorMsgElem,

        i,
        cnode;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.ifInfo() ?
        TP.sys.logTransform(
                TP.annotate(TP.str(elem),
                            'XInclude content inclusion starting.'),
            TP.INFO) : 0;

    //  now update the XML Base references in the element
    TP.elementResolveXMLBase(elem, this.get('uriAttrs'));

    //  according to the latest spec the following rules apply:
    //
    //  1.  if parse isn't found parse="xml"
    //  2.  if href is missing or empty xpointer must be present
    //  3.  if href is present no # is allowed in any position
    //  4.  if parse="text" then xpointer is not allowed
    //  5.  if parse="xml" encoding has no effect
    //
    //  6.  if accept is provided it should be used as Accept header
    //  7.  if accept-language is provided it should be used as the
    //          Accept-Language header

    fallback = false;

    if (TP.isEmpty(parse = TP.elementGetAttribute(elem, 'parse'))) {
        parse = 'xml';
    } else {
        parse = parse.toLowerCase();
        if (parse !== 'xml' && parse !== 'text') {
            //  fatal error according to spec, must have text or xml
            this.raise('TP.sig.InvalidXInclude',
                'XInclude requires parse="text" or parse="xml" : ' +
                TP.nodeAsString(elem));

            return;
        }
    }

    href = TP.elementGetAttribute(elem, 'href');
    xpointer = TP.elementGetAttribute(elem, 'xpointer');

    if (parse === 'text' && TP.notEmpty(xpointer)) {
        //  fatal error according to spec, must have xml with xpointer
        this.raise('TP.sig.InvalidXInclude',
            'XInclude requires parse="xml" for xpointer: ' +
            TP.nodeAsString(elem));

        return;
    }

    if (TP.notEmpty(href)) {
        if (/#/.test(href)) {
            //  fatal error according to specification...
            this.raise('TP.sig.InvalidXInclude',
                'Invalid href for XInclude: ' +
                TP.nodeAsString(elem));

            return;
        }
    } else {
        if (TP.isEmpty(xpointer)) {
            //  fatal error according to spec, must have href or xpointer
            //  value to include something
            this.raise('TP.sig.InvalidXInclude',
                'XInclude requires href or xpointer value: ' +
                TP.nodeAsString(elem));

            return;
        }
    }

    if (TP.isEmpty(href)) {
        //  xpointer should be pointing to a part of the current document so
        //  try to locate that element
        if (/^xmlns/.test(xpointer)) {
            //  TODO
            return TP.todo();
        } else if (TP.notEmpty(parts = xpointer.match(TP.regex.XPOINTER))) {
            //  with no href the pointer is to the current document being
            //  transformed.

            //  save the path we've found so far
            path = parts.at(2).unquoted();

            //  see if we can optimize even further by matching an ID
            //  lookup instead of a general form XPath
            if (TP.notEmpty(parts = xpointer.match(TP.regex.ID_POINTER))) {
                path = parts.at(1).unquoted();
                content = TP.nodeGetElementById(elem, path, true);
            } else {
                //  use the saved path from first match here
                content = TP.nodeEvaluateXPath(elem, path);
            }
        } else {
            //  with no href the pointer is to the current document
            //  being transformed...
            content = TP.nodeGetElementById(elem, xpointer, true);
        }
    } else {
        if (TP.notEmpty(xpointer)) {
            href = href + '#' + xpointer;
        }

        url = TP.uc(href);
        if (!TP.isURI(url)) {
            //  bad URI specification
            this.raise('TP.sig.InvalidXInclude',
                'Invalid href value, could not construct URI instance: ' +
                TP.nodeAsString(elem));

            return;
        }

        //  rely on the URI to manage things for content acquisition, but
        //  unwrap any node wrappers we might get
        resp = url.getResource(TP.hc('async', false, 'resultType', TP.WRAP));
        content = TP.unwrap(resp.get('result'));
    }

    //  no content to include?
    if (TP.notValid(content)) {
        //  look for a fallback element that defines what we should do next
        fallback = TP.nodeGetFirstElementChildByTagName(elem, 'fallback');

        //  If we found a 'fallback' element, we need to use that to obtain
        //  our error message.
        if (TP.isElement(fallback)) {
            //  Move all of the children under the 'fallback' element into
            //  the spot occupied by XInclude element, remove the XInclude
            //  element and return the fallback's first new child.
            newNode = TP.nodeMoveChildNodesTo(fallback,
                                                elem.parentNode,
                                                elem);
            TP.nodeDetach(elem);

            return newNode;
        } else {
            if (TP.notValid(href)) {
                TP.ifWarn() ?
                    TP.warn('Invalid HREF attribute for XInclude.',
                            TP.TRANSFORM_LOG) : 0;
            } else if (TP.notValid(url)) {
                TP.ifWarn() ?
                    TP.warn('Unable to construct URI for XInclude HREF: ' +
                                href,
                            TP.TRANSFORM_LOG) : 0;
            } else {
                TP.ifWarn() ?
                    TP.warn('Content not found for XInclude HREF: ' +
                                href,
                            TP.TRANSFORM_LOG) : 0;
            }

            //  Otherwise, we insert our own error element into the
            //  resulting markup and proceed.

            //  TODO: This is a dependency on XHTML-only reps. Make it
            //  generic. Also, update this to the 'workflow model'.
            errorMsgElem = TP.nodeGetDocument(elem).createElement('span');
            TP.nodeAppendChild(
                errorMsgElem,
                TP.nodeGetDocument(elem).createTextNode(
                'Could not retrieve content for: ' +
                    TP.xmlEntitiesToLiterals(TP.nodeAsString(elem))));

            //  Replace the XInclude element with the error message element
            //  and return.
            newNode = TP.nodeReplaceChild(elem.parentNode,
                                            errorMsgElem,
                                            elem);

            return newNode;
        }
    } else if (TP.isDocument(content)) {
        if (TP.notEmpty(content)) {
            content = TP.nodeCloneNode(content.documentElement);
            newNode = TP.nodeInsertBefore(elem.parentNode,
                                            content,
                                            elem);
            TP.nodeDetach(elem);
        }
    } else if (TP.isNode(content)) {
        content = TP.nodeCloneNode(content);
        newNode = TP.nodeInsertBefore(elem.parentNode,
                                        content,
                                        elem);
        TP.nodeDetach(elem);
    } else if (TP.isArray(content)) {
        //  Loop over all of the content nodes handed back by getting the
        //  content from the URI, insert them before the XInclude element
        //  one at a time and then finally remove the XInclude.
        for (i = 0; i < content.getSize(); i++) {
            cnode = TP.nodeCloneNode(content.at(i));

            //  We want the first new node inserted.
            if (!TP.isNode(newNode)) {
                newNode = TP.nodeInsertBefore(elem.parentNode,
                                                cnode,
                                                elem);
            } else {
                TP.nodeInsertBefore(elem.parentNode,
                                    cnode,
                                    elem);
            }
        }

        TP.nodeDetach(elem);
    }

    TP.ifInfo() ?
        TP.sys.logTransform(
                TP.annotate(TP.str(elem),
                            'XInclude content inclusion complete.'),
            TP.INFO) : 0;

    return newNode;
});

//  ========================================================================
//  TP.core.TemplatedNode
//  ========================================================================

/**
 * @type {TP.core.TemplatedNode}
 * @summary A trait type which allows the target type to have sugared access to
 *     a tsh:template during compilation. The result is that the tag can
 *     leverage a src="" attribute, child content, or other means to make the
 *     compiled representation of the tag easier to maintain. The common usage
 *     pattern is a .JS file, a .XHTML or .XSL "template", and .CSS file which
 *     make up the tag "bundle".
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('core.TemplatedNode');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation.
TP.core.TemplatedNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Whether or not the node wants a 'tsh:template' wrapper (necessary for
//  dynamic templating, etc.)
TP.core.TemplatedNode.Type.defineAttribute('wantsTemplateWrapper');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.core.TemplatedNode.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM. This type replaces the current node with the result of
     *     executing its template content.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The new element.
     */

    var elem,
        id,

        wantsTemplateWrapper,

        replacement,
        replacementClone,

        canonicalName,

        resourceTPElem,
        resourceElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  If we generated this element, then just return it.
    if (this.generatedNode(elem)) {
        return elem;
    }

    wantsTemplateWrapper = TP.ifInvalid(this.get('wantsTemplateWrapper'),
                                        false);

    if (wantsTemplateWrapper) {
        //  The process here is fairly direct. We create a surrogate
        //  tsh:template which replaces the receiver. That template tag is _not
        //  yet processed_ but is instrumented to know that it should replace
        //  itself with the result of running itself immediately. The
        //  TP.GENERATOR property gives the template a reference back to the
        //  original type which built it.
        replacement = TP.documentConstructElement(
                            TP.nodeGetDocument(elem),
                            'tsh:template',
                            TP.w3.Xmlns.TSH);

        canonicalName = TP.elementGetCanonicalName(elem);

        //  Set the name of the replacement and the 'generator name' to be the
        //  canonical name of the templated element. This is not the normal
        //  value of TP.GENERATOR, which is why we don't use
        //  TP.elementSetGenerator.
        TP.elementSetAttribute(
                replacement, 'tsh:name', canonicalName, true);
        replacement[TP.GENERATOR] = canonicalName;

        this.guessContentTypeAndLocation(elem);

        //  Migrate any child content to the template. That content will serve
        //  as fallback data should the src not be found, or not exist.
        TP.nodeMoveChildNodesTo(elem, replacement);

        //  Merge any remaining attributes. Note that we don't want to overwrite
        //  or duplicate any src attribute we had to compute.
        TP.elementMergeAttributes(elem, replacement);

        //  Remove any processing phase attribute migrated from the receiver...
        //  we'll let the processing engine worry about that.
        TP.elementRemoveAttribute(elem, 'tibet:phase', true);

    } else {

        canonicalName = TP.elementGetCanonicalName(elem);

        //  We didn't need a template wrapper - just fetch the resource content
        //  as indicated by the MIME type that should be in the element's
        //  'tibet:mime' attribute (if missing, the MIME type will be guessed).
        resourceTPElem = this.getResourceElement(
                            'template',
                            TP.elementGetAttribute(elem, 'tibet:mime', true));

        //  If no replacement came back we're dealing with likely problems in
        //  the template itself. Those should be notified via the prior call.
        if (TP.notValid(resourceTPElem)) {
            return;
        }

        //  Use the *native* mechanism to clone the Element here - otherwise,
        //  the wrapped element will try to return a wrapper and end up going
        //  through the whole cycle to create another wrapper element, etc.
        resourceElem = resourceTPElem.getNativeNode();
        replacementClone = TP.nodeCloneNode(resourceElem);

        //  Make sure that (almost) all of the expandos get copied to the clone.
        TP.nodeCopyTIBETExpandos(resourceElem, replacementClone, false);

        //  We've computed the generator, so (re)set it here. This is not the
        //  normal value of TP.GENERATOR, which is why we don't use
        //  TP.elementSetGenerator.
        replacementClone[TP.GENERATOR] = canonicalName;

        //  Merge any remaining attributes. Note that we don't want to overwrite
        //  or duplicate any src attribute we had to compute.
        TP.elementMergeAttributes(elem, replacementClone);

        //  One last thing...since this is a template we need to force any
        //  existing ID from the source element over any ID found on the
        //  template content. Template content will get IDs largely due to
        //  change notification semantics, but they should never take the place
        //  of IDs from the authored source.
        id = TP.elementGetAttribute(elem, 'id');
        if (TP.notEmpty(id)) {
            TP.elementSetAttribute(replacementClone, 'id', id);
        }

        replacement = replacementClone;
    }

    //  Replace the original element in the DOM so processing will continue in
    //  the proper context.
    replacement = TP.elementReplaceWith(elem, replacement, null, false);

    return replacement;
});

//  ========================================================================
//  TP.core.EmbeddedTemplateNode
//  ========================================================================

/**
 * @type {TP.core.EmbeddedTemplateNode}
 * @summary A trait type which allows the target type to have embedded elements
 *     of tsh:template under it.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.EmbeddedTemplateNode');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation.
TP.core.EmbeddedTemplateNode.isAbstract(true);

//  ------------------------------------------------------------------------

TP.core.EmbeddedTemplateNode.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        templateElems,
        ourID;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Grab all template elements
    if (TP.isEmpty(templateElems =
                    TP.nodeGetElementsByTagName(elem, 'tsh:template'))) {
        return elem;
    }

    //  Grab our ID (making sure we have one and generating/assigning one if
    //  we don't)
    ourID = TP.lid(elem, true);

    //  Note how we stamp a TP.GENERATOR of our ID onto individual template
    //  elements. This is not the normal value of TP.GENERATOR, which is why we
    //  don't use TP.elementSetGenerator.
    templateElems.perform(
        function(anElem) {

            var templateName,
                transformElem;

            if (TP.notEmpty(templateName = TP.elementGetAttribute(
                                                anElem, 'tsh:name', true))) {
                TP.uc(TP.TIBET_URN_PREFIX + templateName).setResource(null);
            }

            //  We are the TP.GENERATOR for these template elements.
            anElem[TP.GENERATOR] = ourID;

            transformElem = TP.tsh.template.wrapInTransformElement(
                                                            anElem, ourID);

            //  Note here that we don't have to capture the return value,
            //  since we're not doing anything with it.
            TP.nodeReplaceChild(anElem.parentNode,
                                transformElem,
                                anElem,
                                false);
        });

    return;
});

//  ========================================================================
//  TP.core.EmptyElementNode
//  ========================================================================

/**
 * @type {TP.core.EmptyElementNode}
 * @summary A trait type which allows the target type to be defined as 'empty'
 *     for purposes of setting content, etc.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('core.EmptyElementNode');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation.
TP.core.EmptyElementNode.isAbstract(true);

//  ------------------------------------------------------------------------

TP.core.EmptyElementNode.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @method getContent
     * @summary Returns the receiver's content.
     * @description Tags that trait-in this type are supposed to be "EMPTY",
     *     according to some definition (maybe a DTD or something). Therefore,
     *     for this type, this method does nothing and returns null.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {null}
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.core.EmptyElementNode.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @description Tags that trait-in this type are supposed to be "EMPTY",
     *     according to some definition (maybe a DTD or something). Therefore,
     *     for this type, this method does nothing and returns null.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {null}
     */

    return null;
});

//  ========================================================================
//  XML-RPC NODE FORMAT
//  ========================================================================

/**
 * @type {TP.core.XMLRPCNode}
 * @summary A type capable of serializing data into XMLRPC format and of
 *     reconstituting XMLRPC-formatted XML nodes into JavaScript objects. This
 *     type is used as the primary "internal" TIBET data conversion type since
 *     TIBET's default XML format is XMLRPC.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.XMLRPCNode');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the value to use if nil support is turned on
TP.core.XMLRPCNode.Type.defineConstant('NIL', '<nil/>');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('fromArray',
function(anObj, filter, useNil) {

    /**
     * @method fromArray
     * @summary Returns a Node that represents anObj in the XML-RPC format.
     * @param {Object} anObj The object to format.
     * @param {TP.core.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} The receiver as an XML-RPC Node.
     */

    var nullVal,

        dataElem,

        len,
        i,
        valueElem,
        theValue,

        str,
        arrayElem;

    //  If we're using the NIL value, then use it for nulls, otherwise we
    //  use the empty String.
    if (TP.isTrue(useNil)) {
        nullVal = TP.documentFromString(this.NIL).documentElement;
    } else {
        nullVal = TP.XML_FACTORY_DOCUMENT.createTextNode('');
    }

    //  If the supplied object is not valid, return the value used for
    //  nulls.
    if (TP.notValid(anObj)) {
        return nullVal;
    }

    dataElem = TP.XML_FACTORY_DOCUMENT.createElement('data');

    //  Loop over the supplied object, creating a 'value' element for each
    //  value and appending that to the parent 'data' element.
    len = anObj.getSize();
    for (i = 0; i < len; i++) {
        valueElem = TP.XML_FACTORY_DOCUMENT.createElement('value');

        //  If the value is not valid, use the null value
        if (TP.notValid(theValue = anObj.at(i))) {
            //  Note reassignment since the node we're adding might have
            //  come from another document.
            nullVal = TP.nodeAppendChild(valueElem, nullVal);
        } else {
            //  Otherwise, the value is valid so ask it for its
            //  TP.core.XMLRPCNode representation.
            try {
                TP.nodeAppendChild(valueElem,
                                    theValue.as('TP.core.XMLRPCNode'));
            } catch (e) {
                if (TP.notValid(str = TP.str(e))) {
                    str = '!!! SERIALIZATION ERROR !!!';
                }

                TP.nodeAppendChild(valueElem, str.as('TP.core.XMLRPCNode'));
            }
        }

        TP.nodeAppendChild(dataElem, valueElem);
    }

    //  Create an overall 'array' element and append the 'data' element to
    //  that.
    arrayElem = TP.XML_FACTORY_DOCUMENT.createElement('array');
    TP.nodeAppendChild(arrayElem, dataElem);

    return arrayElem;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('fromBoolean',
function(anObj, filter, useNil) {

    /**
     * @method fromBoolean
     * @summary Returns a Node that represents anObj in the XML-RPC format.
     * @param {Object} anObj The object to format.
     * @param {TP.core.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} The receiver as an XML-RPC Node.
     */

    var booleanElem;

    booleanElem = TP.XML_FACTORY_DOCUMENT.createElement('boolean');

    //  The XML-RPC standard says that Boolean values are either '0' or '1',
    //  so we convert the supplied object into a Number before creating the
    //  text node around it.
    TP.nodeAppendChild(
            booleanElem,
            TP.XML_FACTORY_DOCUMENT.createTextNode(anObj.asNumber()));

    return booleanElem;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('fromDate',
function(anObj, filter, useNil) {

    /**
     * @method fromDate
     * @summary Returns a Node that represents anObj in the XML-RPC format.
     * @param {Object} anObj The object to format.
     * @param {TP.core.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} The receiver as an XML-RPC Node.
     */

    var dateElem;

    dateElem = TP.XML_FACTORY_DOCUMENT.createElement('dateTime.iso8601');

    //  The XML-RPC standard says that Date values are always formatted
    //  according to ISO 8601 so we do that here (without YMD separators)
    TP.nodeAppendChild(
        dateElem,
        TP.XML_FACTORY_DOCUMENT.createTextNode(
            anObj.as('TP.iso.ISO8601',
                        TP.iso.ISO8601.FORMATS.at('YYYYMMDDTHH:MM:SS'))));

    return dateElem;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('fromNumber',
function(anObj, filter, useNil) {

    /**
     * @method fromNumber
     * @summary Returns a Node that represents anObj in the XML-RPC format.
     * @param {Object} anObj The object to format.
     * @param {TP.core.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} The receiver as an XML-RPC Node.
     */

    var numberElem;

    //  If the value of the supplied object when rounded is the same as the
    //  object itself, then its an integer - otherwise, its a double.
    if (anObj.round() === anObj) {
        numberElem = TP.XML_FACTORY_DOCUMENT.createElement('i4');
    } else {
        numberElem = TP.XML_FACTORY_DOCUMENT.createElement('double');
    }

    TP.nodeAppendChild(
        numberElem,
        TP.XML_FACTORY_DOCUMENT.createTextNode(anObj.toString()));

    return numberElem;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('fromObject',
function(anObj, filter, useNil) {

    /**
     * @method fromObject
     * @summary Returns an instance that encodes anObj in the format according
     *     to the type description.
     * @param {Object} anObj The object to format.
     * @param {TP.core.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} An instance of a Node with anObj encoded according to
     *     this format.
     */

    var nullVal,

        structElem,

        aFilter,
        k,
        len,
        i,

        theValue,

        memberElem,
        nameElem,

        str,

        valueElem;

    //  If we're using the NIL value, then use it for nulls, otherwise we
    //  use the empty String.
    if (TP.isTrue(useNil)) {
        nullVal = TP.documentFromString(this.NIL).documentElement;
    } else {
        nullVal = TP.XML_FACTORY_DOCUMENT.createTextNode('');
    }

    //  If the supplied object is not valid, return the value used for
    //  nulls.
    if (TP.notValid(anObj)) {
        return nullVal;
    }

    structElem = TP.XML_FACTORY_DOCUMENT.createElement('struct');

    aFilter = TP.ifInvalid(filter, 'unique_attributes');
    k = anObj.getKeys(aFilter).sort();

    //  Loop over the keys of the supplied object, creating a 'member'
    //  element for each key/value pair and appending that to the parent
    //  'struct' element.
    len = k.getSize();
    for (i = 0; i < len; i++) {
        memberElem = TP.XML_FACTORY_DOCUMENT.createElement('member');

        //  Create a 'name' element to hold the key name and append it to
        //  the parent 'member' element.
        nameElem = TP.XML_FACTORY_DOCUMENT.createElement('name');

        str = k.at(i);

        TP.nodeAppendChild(
                nameElem,
                TP.XML_FACTORY_DOCUMENT.createTextNode(str));

        //  Note reassignment since the node we're adding might have come
        //  from another document.
        nameElem = TP.nodeAppendChild(memberElem, nameElem);

        //  Create a 'value' element to hold the key name and append it to
        //  the parent 'member' element.
        valueElem = TP.XML_FACTORY_DOCUMENT.createElement('value');

        //  If the value is not valid, use the null value
        if (TP.notValid(theValue = anObj.at(k.at(i)))) {
            TP.nodeAppendChild(valueElem, nullVal);
        } else {
            //  Otherwise, the value is valid so ask it for its
            //  TP.core.XMLRPCNode representation.
            try {
                TP.nodeAppendChild(valueElem,
                                    theValue.as('TP.core.XMLRPCNode'));
            } catch (e) {
                if (TP.notValid(str = TP.str(e))) {
                    str = '!!! SERIALIZATION ERROR !!!';
                }

                TP.nodeAppendChild(valueElem, str.as('TP.core.XMLRPCNode'));
            }
        }

        TP.nodeAppendChild(memberElem, valueElem);

        TP.nodeAppendChild(structElem, memberElem);
    }

    return structElem;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('fromString',
function(anObj, filter, useNil) {

    /**
     * @method fromString
     * @summary Returns a Node that represents anObj in the XML-RPC format.
     * @param {Object} anObj The object to format.
     * @param {TP.core.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} The receiver as an XML-RPC Node.
     */

    var stringElem;

    stringElem = TP.XML_FACTORY_DOCUMENT.createElement('string');

    //  note the encoding of literals to entities here to avoid issues
    TP.nodeAppendChild(
        stringElem,
        TP.XML_FACTORY_DOCUMENT.createTextNode(
            TP.xmlLiteralsToEntities(
                TP.htmlEntitiesToXMLEntities(anObj.asString()))));

    return stringElem;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('fromTP_core_Hash',
function(anObj, filter, useNil) {

    /**
     * @method fromTP_core_Hash
     * @summary Returns a Node that represents anObj in the XML-RPC format.
     * @param {Object} anObj The object to format.
     * @param {TP.core.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} The receiver as an XML-RPC Node.
     */

    return this.fromObject(anObj, filter, useNil);
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('objectFromNode',
function(aNode) {

    /**
     * @method objectFromNode
     * @summary Returns aNode as a TIBET/JavaScript object.
     * @param {Node} aNode The Node to reconstitute into a JavaScript object.
     * @returns {Object} The TIBET/JavaScript object that was reconstituted from
     *     the supplied Node.
     */

    var len,
        i,
        key,
        val,
        inst,
        str,
        node,
        member,
        members,
        tagType,
        tagChild;

    if (!TP.isNode(aNode)) {
        return;
    }

    //  often provided a document element, we need to drill down to content
    if (!TP.isElement(aNode)) {
        node = aNode.firstChild;
    } else {
        node = aNode;
    }

    tagType = TP.elementGetLocalName(node);
    tagChild = node.firstChild;

    //  since we're dealing with primitive nodes we'll just go with a
    //  simple procedural mechanism here rather than trying to do an OO
    //  approach here
    switch (tagType) {
        case 'array':

            //  note that we want to avoid any text nodes here...
            tagChild = TP.nodeGetChildElementAt(node, 0);

            if (TP.isNode(tagChild) &&
                TP.elementGetLocalName(tagChild) === 'data') {
                //  valid data structure embedded in array tag...append
                //  each child element of the 'data' tag (which will be
                //  value tags containing data of various formats) into
                //  an array
                inst = TP.ac();
                members = TP.nodeGetChildElements(tagChild);

                len = members.getSize();
                for (i = 0; i < len; i++) {
                    member = members.at(i);

                    if (TP.elementGetLocalName(member) === 'value') {
                        inst.add(this.objectFromNode(member));
                    }
                }
                return inst;
            } else {
                //  no nested data tag
                return this.raise('InvalidTP.core.XMLRPCNode',
                                    node);
            }

        case 'base64':

            if (TP.isNode(tagChild)) {
                str = TP.str(tagChild.nodeValue);

                try {
                    //  Mozilla can be very touchy about this function if
                    //  the data isn't actually encoded properly
                    return TP.atob(str);
                } catch (e) {
                    return str;
                }
            } else {
                return null;
            }

        case 'boolean':

            return TP.isNode(tagChild) ? tagChild.nodeValue === 1 : null;

        case 'dateTime.iso8601':

            return TP.isNode(tagChild) ?
                        Date.fromString(tagChild.nodeValue) : null;

        case 'double':
        case 'int':
        case 'i4':

            return TP.isNode(tagChild) ?
                        TP.nc(tagChild.nodeValue) : null;

        case 'string':

            //  note the TP.xmlEntitiesToLiterals() call here to reverse the
            //  encoding process which needs to escape them
            return TP.isNode(tagChild) ?
                TP.str(TP.xmlEntitiesToLiterals(tagChild.nodeValue)) : null;

        case 'struct':

            //  structs will contain 0 or more member elements containing
            //  a 'name' and a 'value'. iterating across the members and
            //  adding their values under the names will rebuild the inst
            inst = TP.hc();
            members = TP.nodeGetChildElements(node);

            len = members.getSize();
            for (i = 0; i < len; i++) {
                member = members.at(i);

                if (TP.elementGetLocalName(member) === 'member') {
                    //  note that we want to avoid any text nodes here...
                    key = TP.nodeGetChildElementAt(member, 0);
                    val = TP.nodeGetChildElementAt(member, 1);

                    inst.atPut(key.firstChild.nodeValue,
                                this.objectFromNode(val));
                }
            }

            return inst;

        case 'value':

            //  value tags will either contain a child tag, or a string
            //  value (not consistent here since the string tag isn't
            //  required...presumably that's to make things easier by
            //  creating special cases in encoding ;)

            //  note that we want to avoid any text nodes here...
            tagChild = TP.nodeGetChildElementAt(node, 0);

            if (TP.isNode(tagChild)) {
                //  embedded tag so we can ignore the 'value' wrapper
                return this.objectFromNode(tagChild);
            } else {
                //  embedded string but no string tag...
                tagChild = node.firstChild;

                return TP.isNode(tagChild) ?
                            TP.str(tagChild.nodeValue) : null;
            }

        default:

            return this.raise('InvalidTP.core.XMLRPCNode', node);
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
