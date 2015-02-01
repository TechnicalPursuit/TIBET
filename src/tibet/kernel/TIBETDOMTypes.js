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
 * @
 */

/* JSHint checking */

/* jshint evil:true
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
     *     TIBET type name, then 'construct' is invoked against that type, with
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
     *     argument is supplied and it is a TP.lang.Hash, then the source node
     *     is wrapped in an instance of this type (i.e. this type's 'init'
     *     method is called) and then '.setAttribute()' is called on it for each
     *     item in the TP.lang.Hash. That value is then returned.
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

        template,
        str,
        uri,

        prefix,
        nsURI,
        defaultRootName,

        retVal,
        retType,

        inst,
        args;

    TP.stop('break.node_construct');

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

        //  If we got a real element that is either not in a document or was
        //  created in a document, but not appended to it (as will happen with
        //  the TP.XML_FACTORY_DOCUMENT), then create a document and hang the
        //  node off of it.
        if (TP.isElement(node) &&
                (TP.notValid(node.ownerDocument) ||
                 !TP.nodeContainsNode(node.ownerDocument, node))) {

            newDoc = TP.createDocument();

            //  Note here how we use a 'low level' append child. That is
            //  because we don't want any 'importNode' or anything to be run
            //  here - we're simply trying to give the node a real document to
            //  be hung off of.
            newDoc.appendChild(node);
        }

        //  We only do this if varargs is either a URI (or URI String) or a
        //  String. If its a TP.lang.Hash, it will be processed against a
        //  wrapped version of the node later in this method.
        if (TP.isValid(varargs) &&
            (TP.isURI(varargs) || TP.isString(varargs))) {
            if (TP.isURI(varargs)) {
                template = TP.uc(varargs).getResource(
                                            TP.hc('async', false,
                                                    'resultType', TP.WRAP));

                if (TP.isKindOf(template, 'TP.core.DocumentNode')) {
                    template.getDocumentElement().removeAttribute('id');
                } else if (TP.isKindOf(template, 'TP.core.ElementNode')) {
                    template.removeAttribute('id');
                }
            } else if (TP.isString(varargs)) {
                template = varargs;
            }

            str = TP.format(node, template, arguments[2]);

            //  NB: Make sure to not pass any other arguments besides the
            //  str in here - otherwise we recurse endlessly.
            retVal = this.construct(str);

            return retVal;
        }
    } else if (TP.isURI(nodeSpec)) {
        //  Make sure its a URI, and not a URI string.
        uri = TP.uc(nodeSpec);

        if (!TP.isNode(retVal = uri.getResource(
                                        TP.hc('async', false,
                                            'resultType', TP.WRAP)))) {
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
                //  Set retVal to null, so that when we invoke 'construct'
                //  against the retType (set above), it will be as if it was
                //  actually invoked with no nodeSpec and the machinery
                //  above will take over.
                retVal = null;
            }
        }

        if (!TP.isType(retType)) {
            retType = this;
        }

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
    //  the constructViaSubtype pathway
    if (this.isAbstract()) {
        return this.constructViaSubtype.apply(this, arguments);
    }

    //  ---
    //  Instance Construction
    //  ---

    //  See if the native node already has a pointer to a wrapper that was
    //  created for it.
    if (TP.isValid(inst = node[TP.WRAPPER])) {
        return inst;
    }

    args = TP.args(arguments);
    args.atPut(0, node);
    inst = this.callNextMethod.apply(this, args);

    //  If varargs is a TP.lang.Hash and inst is an instance of some subtype
    //  of TP.core.ElementNode, then try to execute '.setAttribute()'
    //  against the new instance for each key in the hash.
    if (TP.isKindOf(varargs, 'TP.lang.Hash') &&
        TP.isKindOf(inst, 'TP.core.ElementNode')) {
        varargs.perform(
            function(kvPair) {

                inst.setAttribute(kvPair.first(), kvPair.last());
            });
    }

    //  Go ahead and put a reference to the wrapper onto the native node.
    node[TP.WRAPPER] = inst;

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
        retVal;

    if (this.isAbstract()) {
        this.raise('TP.sig.UnsupportedOperation',
                        'Cannot construct instance of abstract type.');

        return;
    }

    if (TP.notEmpty(template = this.get('template'))) {
        if (TP.isNode(template)) {
            return TP.nodeCloneNode(template, true);
        } else if (TP.isURI(template)) {
            //  Make sure its a URI, and not a URI string.
            uri = TP.uc(template);

            if (!TP.isNode(retVal = uri.getResource(
                                            TP.hc('async', false,
                                                'resultType', TP.DOM)))) {
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
     *     to be thrown.
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
     * @returns {TP.core.Node} The receiver itself.
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
    inst = TP.byOID(observer);

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
     *     to be thrown.
     * @exception TP.sig.DOMParseException
     * @returns {TP.core.Node} The newly constructed TP.core.Node.
     */

    var content;

    if (TP.notValid(aURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  this will return a TP.core.Node if at all possible
    content = TP.wrap(aURI.getResourceNode(TP.hc('async', false)));
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

            return TP.core.AttributeNode;

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

    return;
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
//  Tag Phase Support
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

    //  Setting this to null is better for many VMs than using 'delete'.
    node[TP.WRAPPER] = null;

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  current checkpoint index, used by back/forward and getNativeNode to
//  manage which version of a transactional node is current. NOTE THAT WE
//  LEAVE THIS NULL, NOT 0, so we can tell the difference between indexed
//  receivers and those that just have a single node reference
TP.core.Node.Inst.defineAttribute('currentIndex');

//  should the receiver flag changes, i.e. mark elements with 'crud'
//  metadata in addition to or in lieu of actually altering markup
TP.core.Node.Inst.defineAttribute('changeFlagging', false);

//  whether the node has been 'dirtied' or altered since loading
TP.core.Node.Inst.defineAttribute('dirty', false);

//  the wrapped node when only one node is being managed
TP.core.Node.Inst.defineAttribute('node');

//  the wrapped native node stack when the receiver is using transactions
TP.core.Node.Inst.defineAttribute('nodes');

//  the checkpoint hash, used when the receiver is checkpointing
TP.core.Node.Inst.defineAttribute('points');

//  flag for whether this instance can be reused. typically yes.
TP.core.Node.Inst.defineAttribute('recyclable', true);

//  what phase is the node at in terms of content processing? we start at
//  'UNPROCESSED' for new nodes
TP.core.Node.Inst.defineAttribute('phase', 'UNPROCESSED');
TP.core.Node.Inst.defineAttribute('commitPhase', 'UNPROCESSED');

//  does this node act transactionally?
TP.core.Node.Inst.defineAttribute('transactional', false);

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
function() {

    /**
     * @method asDumpString
     * @summary Returns a "dump string", which is typically what is used by the
     *     TIBET logs when writing out an object.
     * @returns {String} A String suitable for log output.
     */

    var nativeNode;

    nativeNode = this.getNativeNode();

    return TP.tname(this) +
                ' :: ' +
                '(' +
                     TP.tname(nativeNode) +
                    ' :: ' +
                    this.asString() +
                ')';
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

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asJSONSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asJSONSource = true;

    try {
        str = '{"type":' + TP.tname(this).quoted('"') + ',' +
                '"data":' + TP.json(this.getNativeNode()) + '}';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asJSONSource;

    return str;
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
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        TP.tname(nativeNode) +
                    '<\/dd>' +
                    '<dt class="pretty key">Content<\/dt>' +
                    '<dd class="pretty value">' +
                        TP.pretty(nativeNode) +
                    '<\/dd>' +
                    '<\/dl>';
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

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asXMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asXMLString = true;

    try {
        str = '<instance type="' + TP.tname(this) + '">' +
                    TP.xmlstr(this.getNativeNode()) +
                    '<\/instance>';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asXMLString;

    return str;
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
        return this.raise('TP.sig.InvalidNode', otherNode);
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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest Optional control
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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest Optional control
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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest Optional control
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

TP.core.Node.Inst.defineMethod('getControlElement',
function() {

    /**
     * @method getControlElement
     * @summary Finds the control element for the receiver and returns it. This
     *     is typically invoked by pseudo-element children of the control during
     *     various processing which requires them to find the overall control
     *     (widget) element.
     * @returns {TP.core.ElementNode} A valid TP.core.ElementNode or null.
     */

    return TP.wrap(TP.nodeGetControlElement(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getControlID',
function(assignIfAbsent) {

    /**
     * @method getControlId
     * @summary Finds the control element for the receiver and returns it's ID.
     *     This is typically invoked by pseudo-element children of the control
     *     when building their local ID.
     * @param {Boolean} assignIfAbsent True to force the element to get a new ID
     *     if missing.
     * @returns {String} A valid element ID or null.
     */

    return TP.nodeGetControlID(this.getNativeNode(), assignIfAbsent);
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
        doc,
        win;

    //  we're after the real document, not the document of some clone, so
    //  we preserve changes here
    node = this.getNativeNode();
    doc = TP.nodeGetDocument(node);
    if (!TP.isDocument(doc)) {
        return this.raise('TP.sig.InvalidDocument',
                            'Unable to determine node\'s document.');
    }

    win = TP.nodeGetWindow(doc);
    if (TP.notValid(win)) {
        //  document isn't visible so there's no TP.core.Window for it
        return TP.core.Document.construct(doc);
    }

    return TP.core.Window.construct(win).getDocument();
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

    return TP.gid(this.getNativeNode());
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
    if (TP.isURI(url)) {
        return TP.uc(url).getLocation();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getOuterContent',
function(aRequest) {

    /**
     * @method getOuterContent
     * @summary Returns the receiver's 'outer' content - that is, its entire
     *     representation, including any childNode representations.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest Optional control
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

TP.core.Node.Inst.defineMethod('$$getNativeNodeFast',
function() {

    /**
     * @method $$getNativeNodeFast
     * @summary Returns the receiver's native DOM node object.
     * @returns {Node} The receiver's native DOM node.
     */

    return this.$get('node');
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('$$getNativeNodeSlow',
function(preserveDeletes, preserveCrud) {

    /**
     * @method $$getNativeNodeSlow
     * @summary Returns the receiver's native DOM node object.
     * @param {Boolean} preserveDeletes True will cause nodes with
     *     tibet:crud="delete" attributes to be preserved rather than filtered.
     *     This defaults to false so that consumers see the node as if deleted
     *     elements had actually been removed. Note that this is only relevant
     *     when the receiver's shouldFlagChanges value is true.
     * @param {Boolean} preserveCrud True will cause tibet:crud attributes to be
     *     kept on the output, the default is false, meaning the document
     *     normally appears as if it hasn't been flagged, even when flagging is
     *     being used. This helps avoid problems with style sheets and other
     *     processes finding tibet:crud attributes as part of their queries.
     * @returns {Node} The receiver's native DOM node.
     */

    var ndx,
        node,
        nodes,

        url,
        styleNode;

    //  NOTE:   we use $get here since we don't want to recurse over
    //          getProperty() calls that use getNativeNode
    if (TP.isValid(ndx = this.$get('currentIndex'))) {
        node = this.$get('nodes').at(ndx);
    } else {
        if (TP.isArray(nodes = this.$get('nodes'))) {
            node = nodes.last();
        } else {
            node = this.$get('node');
        }
    }

    //  if we've been flagging changes then we need to at least remove the
    //  deleted nodes so other methods don't attempt to modify them...
    if (this.shouldFlagChanges()) {
        if (TP.notTrue(preserveCrud)) {
            url = TP.uc('~lib_xsl/tp_removecrud.xsl');
        } else if (TP.notTrue(preserveDeletes)) {
            url = TP.uc('~lib_xsl/tp_removedeletes.xsl');
        }

        if (TP.isURI(url)) {
            styleNode = url.getNativeNode(TP.hc('async', false));
            if (TP.isNode(styleNode)) {
                return TP.documentTransformNode(styleNode, node);
            } else {
                TP.ifError() ?
                    TP.error(
                        'Unable to load node filtering transform: \'' +
                        url.getLocation(),
                        TP.LOG) : 0;
            }
        }
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('getNativeNode',
function() {

    /**
     * @method getNativeNode
     * @summary Returns the receiver's native DOM node object.
     * @description There are actually two variants of this method, which are
     *     manipulated based on whether the node is transactional/flagging
     *     changes. If either of those are true then a "slow" version is put in
     *     place that manages that overhead, otherwise the default
     *     implementation simply returns the ivar containing the internal node.
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

    return this.getContent();
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
        return this.raise('TP.sig.InvalidNode', otherNode);
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
function() {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} True when single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('isScalarValued',
function() {

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
     * @returns {Boolean} True when scalar valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('isTransactional',
function(aFlag) {

    /**
     * @method isTransactional
     * @summary Combined setter/getter for whether the receiver has been told
     *     to support transactional behavior via checkpoint, commit, and
     *     rollback.
     * @param {Boolean} aFlag The state of the node's transaction flag, which
     *     will be set when provided.
     * @returns {Boolean} The current transaction state, after any optional
     *     set() operation has occurred.
     */

    if (TP.isBoolean(aFlag)) {
        if (TP.isTrue(this.$get('transactional'))) {
            if (!aFlag) {
                //  was transactional, clearing it now...

                //  TODO: check for unsaved changes etc...

                this.$set('nodes', null, false);
                this.$set('points', null, false);
                this.$set('currentIndex', null, false);

                //  as long as we're not flagging changes we can go back to
                //  the fast node accessor
                if (TP.notTrue(this.shouldFlagChanges())) {
                    this.$set('getNativeNode', this.$$getNativeNodeFast,
                                false);
                }
            }
        } else {
            if (aFlag) {
                //  wasn't transactional, turning it on...

                //  have to use a slower approach to returning the native
                //  node since we have to check indexes etc.
                this.$set('getNativeNode', this.$$getNativeNodeSlow, false);

                this.$set('transactional', aFlag, false);
                this.checkpoint();
            }
        }

        this.$set('transactional', aFlag, false);

        if (aFlag && !TP.sys.shouldUseContentCheckpoints()) {
            TP.ifWarn() ?
                TP.warn('Node transactions have been activated but ' +
                            'content is not being checkpointed.',
                        TP.LOG) : 0;
        }
    }

    return this.$get('transactional');
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
function(aContentObject, aRequest) {

    /**
     * @method produceValue
     * @summary Produces the value that will be used by the setValue() method
     *     to set the content of the receiver.
     * @description This method works together with the 'isSingleValued()' and
     *     'isScalarValued()' methods to produce the proper value for the
     *     receiver. See the method description for isScalarValued() for more
     *     information.
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
    if (this.isSingleValued()) {
        input = this.$reduceValue(input, aRequest);
    }

    //  If we're scalar-valued we can't process nodes as values. We need to
    //  convert them into a proper scalar value. The same is true for any
    //  collection of input, we've got to convert it into a collection of scalar
    //  values rather than a collection of more complex objects
    if (this.isScalarValued()) {
        if (TP.isNode(input)) {
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
        } else if (TP.isKindOf(input, TP.lang.Hash)) {
            result = TP.hc();
            keys = input.getKeys();
            len = keys.getSize();
            for (i = 0; i < len; i++) {
                result.atPut(keys.at(i), TP.val(input.at(keys.at(i))));
            }
            value = result;
        } else if (TP.isMemberOf(input, Object)) {
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
     *     usually an Array, Object, TP.lang.Hash, NodeList or NamedNodeMap).
     *     The result set must be a collection for this method to operate
     *     correctly. In all other cases the original content object is
     *     returned. What this method returns depends on the type of content
     *     handed to it:
     *
     *     Array            The content at the index supplied or at 0 if no
     *                      index was supplied.
     *     Object           The *value* of the content at the index supplied or
     *                      at the first key if no index was supplied.
     *     TP.lang.Hash     The *value* of the content at the index supplied or
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

    if (!TP.isCollection(theContent) && !TP.isMemberOf(theContent, Object)) {
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
        //  This handles TP.lang.Hash, Objects and NamedNodeMaps

        index = TP.ifInvalid(anIndex, TP.keys(result).first());

        if (TP.isKindOf(result, TP.lang.Hash)) {
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

    var content;

    content = TP.str(this.produceContent(aContentObject, aRequest));

    this.setTextContent(content);

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

        nodes,
        ndx,

        flag;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode', aNode);
    }

    //  Notice here how we use the 'fast' native node get method to avoid any
    //  sorts of recursion issues.
    oldNode = this.$$getNativeNodeFast();

    //  what we do here varies by whether we're checkpointing or not...
    if (TP.isArray(nodes = this.get('nodes'))) {
        ndx = this.get('currentIndex');
        if (TP.isValid(ndx)) {
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

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.changed('content', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldNode, TP.NEWVAL, aNode));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('setProcessedContent',
function(newContent, aRequest) {

    /**
     * @method setProcessedContent
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
            //this.modelChanged(attributeName);

            //  NB: Use this construct this way for better performance
            if (TP.notValid(flag = shouldSignal)) {
                flag = this.shouldSignalChange();
            }

            if (flag) {
                this.changed(attributeName, TP.UPDATE);
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
     * @method setValue
     * @summary Sets the text value of the receiver's first text node to
     *     aValue. For general node types this method sets the value/content of
     *     the node.
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
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        oldValue,
        newValue,
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

    newValue = this.produceValue(aValue);

    //  refetch the true native node, preserving crud/deletes so the new
    //  value really sticks
    node = this.getNativeNode();

    //  set the text value if it appears it will change
    TP.nodeSetTextContent(node, newValue);

    //  signal as needed

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.changed('value', TP.UPDATE);
    }

    //  Since, at the TP.core.Node level, setting the value is equivalent to
    //  setting the content, we signal that we've done that.

    try {
        //  We only signal TP.sig.DOMContentLoaded if the system is configured
        //  for it.
        if (TP.sys.shouldSignalDOMLoaded()) {
            TP.signal(TP.gid(node),
                        'TP.sig.DOMContentLoaded',
                        newValue);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e,
                        'TP.sig.DOMContentLoaded handler generated error.'),
                TP.LOG) : 0;
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

    if (!TP.isURI(aURI)) {
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

    return this.setTextContent(aValue, shouldSignal);
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

    var node;

    if (!TP.isNode(node = this.getNativeNode())) {
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
//  NODE "TRANSACTIONS"
//  ------------------------------------------------------------------------

/*
Operations which form the core of the TP.core.Node "transaction" support
which allows node content to serve as a model supporting undo/redo
operations via back/forward (temporary) and commit/rollback (permanent)
methods.
*/

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('back',
function(aName) {

    /**
     * @method back
     * @summary Moves the receiver's current node index back to the named
     *     checkpoint index, or by one checkpoint such that requests for
     *     information about the receiver resolve to that state. No checkpoints
     *     are removed and a forward() will undo the effect of this call --
     *     unless you alter the state of the node after calling back().
     * @param {String} aName The name of a specific checkpoint to index to.
     *     Defaults to the prior checkpoint location.
     * @exception TP.sig.InvalidCheckpoint
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        nodes,
        points,
        ndx;

    if (!this.isTransactional()) {
        return this;
    }

    node = this.getNativeNode();

    if (TP.notValid(nodes = this.get('nodes'))) {
        //  no-op since we've never checkpointed
        return this;
    }

    if (TP.notEmpty(aName)) {
        if (TP.notValid(points = this.get('points'))) {
            //  if user thought there was a checkpoint but we don't have
            //  any then we consider that an error
            return this.raise('TP.sig.InvalidCheckpoint',
                                'No active checkpoints have been named.');
        }

        ndx = points.at(aName);
        if (TP.notValid(ndx)) {
            return this.raise('TP.sig.InvalidCheckpoint',
                                'Checkpoint ' + aName + ' not found.');
        }

        //  if the value changes here a change notice will fire...
        this.set('currentIndex', ndx.max(0));
    } else {
        //  decrement the index, but don't let it go below 0
        ndx = this.get('currentIndex');
        if (TP.notValid(ndx)) {
            //  note that nodes.getSize() - 1 points to the last element,
            //  and back should be backing up one slot from that so we
            //  remove 2 here
            ndx = (nodes.getSize() - 2);
        } else {
            //  remove one from current index
            ndx = ndx - 1;
        }

        //  note we dont' bother setting it if we're simply trying to
        //  back up on a single node list and we're at the end anyway..and
        //  we want to make sure we're not below zero
        ndx = ndx.max(0);
        if (ndx !== nodes.getSize() - 1) {
            this.set('currentIndex', ndx);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('changed',
function(anAspect, anAction, aDescription) {

    /**
     * @method changed
     * @summary Notifies observers that some aspect of the receiver has
     *     changed. The fundamental data-driven dependency method.
     * @description If 'anAspect' is provided then the signal fired will be
     *     'aspectChange' where 'aspect' is replaced with the title-case aspect
     *     value. For example, if the aspect is 'lastname' the signal will be:
     *
     *     LastnameChange
     *
     *     This allows observers to be very discriminating in their
     *     observations...down to a specific slot on an object rather than the
     *     entire object. When the aspect is a number the signal name is
     *     prefixed with 'Index' so an aspect of 1 would result in an
     *     Index1Change signal.
     *
     *     NOTE: if the receiver's shouldSignalChange() method returns false
     *     this method won't fire a signal. This helps to avoid signaling when
     *     no listeners are present. See the shouldSignalChange() method for
     *     more information.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This is
     *     usually 'add', 'remove', etc.
     * @param {TP.lang.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {TP.core.Node} The receiver.
     * @fires Change
     */

    //  NB: For new objects, this relies on 'undefined' being a 'falsey' value.
    //  We don't normally do this in TIBET, but this method is used heavily and
    //  is a hotspot.
    if (!this.shouldSignalChange()) {
        return;
    }

    //  when a change has happened we need to adjust to the current index so
    //  things like a combination of a back() and a set() will throw away
    //  the nodes after the current node, but when the aspect is current
    //  index itself we skip this since what's happening is just a forward
    //  or back call shifting the current "visible" node data
    if (TP.isEmpty(anAspect) || (anAspect !== 'currentIndex')) {
        this.discardCheckpointNodes();
    }

    //  with possible node list adjustments we now need to update the name
    //  to index hash entries
    this.discardCheckpointNames();

    //  during early operations this can be called and we don't want to
    //  trigger an exception in getDocument below
    if (!TP.isNode(this.getNativeNode())) {
        return this.callNextMethod();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('checkpoint',
function(aName) {

    /**
     * @method checkpoint
     * @summary Checkpoints the current node content, making it available for
     *     future rollback operations via either name or position.
     * @param {String} aName An optional name to assign to the checkpoint which
     *     can be supplied to rollback() calls.
     * @returns {Number} The number of checkpoints after the new checkpoint has
     *     been added.
     */

    var node,
        nodes,
        ndx,
        points;

    if (!this.isTransactional()) {
        return this;
    }

    node = this.getNativeNode();

    //  if no node list yet then construct one so we can store the data
    if (TP.notValid(nodes = this.get('nodes'))) {
        nodes = TP.ac();
        this.$set('nodes', nodes, false);
    }

    //  here's a bit of a twist, if we checkpoint while looking at an
    //  indexed location we have to clear the rest of the list and remove
    //  any checkpoint name references to points later in the list
    if (TP.isNumber(ndx = this.get('currentIndex'))) {
        //  set length to trim off elements past the current index location,
        //  discarding their changes, this will cause the discardCheckpoint
        //  routine to consider checkpoints referencing indexes past that
        //  point to be invalid so they get removed
        nodes.length = ndx + 1;

        //  since we've adjusted the node list length we need to update the
        //  index reference data
        this.discardCheckpointNames();
    }

    //  are we naming this one?
    if (TP.notEmpty(aName)) {
        //  construct a hash for named checkpoint references
        if (TP.notValid(points = this.get('points'))) {
            points = TP.hc();
            this.$set('points', points, false);
        }

        //  correlate name with current 'end of list' index which points to
        //  the node just prior to cloning it to save state at the "old"
        //  location
        points.atPut(aName, nodes.getSize() - 1);
    }

    //  with the node list in shape we can now add the new data, but note
    //  that we use a string-based clone process here to avoid document
    //  issues in mozilla
    nodes.add(TP.nodeCloneNode(node, true, true));

    //  clear the current index since we're essentially saying we want to
    //  operate at the current location and start to float with checkpoint
    //  state again
    this.set('currentIndex', null);

    return nodes.getSize();
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

TP.core.Node.Inst.defineMethod('commit',
function() {

    /**
     * @method commit
     * @summary Collapses the list of available nodes into a single committed
     *     copy of the node containing all changes made.
     * @returns {TP.core.Node} The receiver.
     */

    var node;

    if (!this.isTransactional()) {
        return this;
    }

    node = this.getNativeNode();

    //  the "origin" copy is kept in the single node slot for reference, but
    //  notice we don't signal change since the "visible state" won't
    //  actually alter, just the storage location...
    this.$set('node', node, false);

    //  clear the nodes and checkpoints until we get told to do a checkpoint
    //  again...
    this.$set('nodes', null, false);
    this.$set('points', null, false);
    this.$set('currentIndex', null, false);

    //  we need to hold the processing phase for the commit to avoid
    //  overhead when we subsequently rollback and need to reset the phase
    this.$set('commitPhase', this.get('phase'));

    //  re-establish original state in the nodes() array
    this.checkpoint();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('discardCheckpointNames',
function() {

    /**
     * @method discardCheckpointNames
     * @summary Flushes any stored checkpoint names which come after the
     *     current node list length.
     * @description When using back() and forward() along with checkpoint,
     *     rollback, or any mutation operations this method will be called to
     *     clear name references to indexes into the node list which no longer
     *     exist.
     * @returns {TP.core.Node} The receiver.
     */

    var nodes,
        points;

    if (!this.isTransactional()) {
        return this;
    }

    if (TP.notValid(nodes = this.get('nodes'))) {
        //  no-op since we've never checkpointed
        return this;
    }

    if (TP.isEmpty(nodes)) {
        //  when there are no nodes all points are invalid...
        this.set('points', null);
    } else if (TP.isArray(points = this.get('points'))) {
        //  clear out point references to non-existent entries
        points.perform(
            function(item) {

                if (item.last() > nodes.getSize() - 1) {
                    this.removeKey(item.first());
                }
            }.bind(points));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('discardCheckpointNodes',
function() {

    /**
     * @method discardCheckpointNodes
     * @summary Flushes any stored checkpoint data after the current node
     *     index. When using back() and forward() along with checkpoint,
     *     rollback, or any mutation operations this method will be called to
     *     clear the obsolete data itself.
     * @returns {TP.core.Node} The receiver.
     */

    var ndx,
        nodes;

    if (!this.isTransactional()) {
        return this;
    }

    if (TP.notValid(nodes = this.get('nodes'))) {
        //  no-op since we've never checkpointed
        return this;
    }

    //  when there's no index set there have been no back calls and so we're
    //  at the end, or a previous forward cleared it because we reached the
    //  end...
    if (TP.notValid(ndx = this.get('currentIndex'))) {
        return this;
    }

    //  we've got a valid index, which indicates where we're currently
    //  looking. we want to discard everything from that point on...
    nodes.length = ndx + 1;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('forward',
function(aName) {

    /**
     * @method forward
     * @summary Moves the receiver's current node index forward to the named
     *     checkpoint index, or by one checkpoint such that requests for
     *     information about the receiver resolve to that state.
     * @param {String} aName The name of a specific checkpoint to index to.
     *     Defaults to the next checkpoint location available.
     * @exception TP.sig.InvalidCheckpoint
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        nodes,
        ndx,
        points;

    node = this.getNativeNode();

    if (!this.isTransactional()) {
        return this;
    }

    if (TP.notValid(nodes = this.get('nodes'))) {
        //  no-op since we've never checkpointed
        return this;
    }

    //  when there's no index set there have been no back calls and so we're
    //  at the end, or a previous forward cleared it because we reached the
    //  end...
    if (TP.notValid(ndx = this.get('currentIndex'))) {
        return this;
    }

    if (TP.notEmpty(aName)) {
        if (TP.notValid(points = this.get('points'))) {
            //  if user thought there was a checkpoint but we don't have
            //  any then we consider that an error
            return this.raise('TP.sig.InvalidCheckpoint',
                                'No active checkpoints have been named.');
        }

        ndx = points.at(aName);
        if (TP.notValid(ndx)) {
            return this.raise('TP.sig.InvalidCheckpoint',
                                'Checkpoint ' + aName + ' not found.');
        }

        //  this will trigger a change notice so observers can update
        this.set('currentIndex', ndx);
    } else {
        //  increment the index, but don't let it go off the end
        ndx = this.get('currentIndex') + 1;
        if (ndx < nodes.getSize() - 1) {
            this.set('currentIndex', ndx);
        } else {
            //  if forward would go off then end then we'll reset so we
            //  start to float again
            this.set('currentIndex', null);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('hasCheckpoint',
function(aName) {

    /**
     * @method hasCheckpoint
     * @summary Looks up the named checkpoint and returns true if it exists.
     * @param {String} aName An optional name to look up.
     * @returns {Boolean} True if the receiver has the named checkpoint.
     */

    var points;

    if (!TP.isString(aName)) {
        return false;
    }

    if (TP.notValid(points = this.get('points'))) {
        return false;
    }

    return TP.isValid(points.at(aName));
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('rollback',
function(aName) {

    /**
     * @method rollback
     * @summary Rolls back changes made since the named checkpoint provided in
     *     the first parameter, or all changes if no checkpoint name is
     *     provided.
     * @param {String} aName An optional name provided when a checkpoint call
     *     was made, identifying the specific point to roll back to.
     * @exception TP.sig.InvalidRollback
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        nodes,
        point,
        points;

    if (!this.isTransactional()) {
        return this;
    }

    node = this.getNativeNode();

    //  if we don't have nodes then we don't have anything to roll back to
    if (TP.notValid(nodes = this.get('nodes'))) {
        //  no prior checkpoints, nothing to roll back
        if (TP.isString(aName)) {
            //  if user thought there was a checkpoint but we don't have
            //  any then we consider that an error
            return this.raise('TP.sig.InvalidRollback',
                                'No active checkpoints have been made.');
        } else {
            //  if no name provided we can consider this a no-op
            return this;
        }
    }

    //  we have nodes, now the question is do we have a named point to roll
    //  back to or are we just decrementing our list?
    if (TP.isString(aName)) {
        if (TP.notValid(points = this.get('points'))) {
            //  if user thought there was a checkpoint but we don't have
            //  any then we consider that an error
            return this.raise('TP.sig.InvalidRollback',
                                'No active checkpoints have been named.');
        }

        if (TP.notValid(point = points.at(aName))) {
            return this.raise('TP.sig.InvalidRollback',
                            'Checkpoint ' + aName + ' not found.');
        }

        //  discard nodes up to that point
        nodes.length = point + 1;

        //  watch for rollbacks that should update the processing phase
        if (TP.core.TSH.CACHE_PHASES.containsString(aName)) {
            this.set('phase', aName);
        }
    } else {
        //  flush all checkpoint data
        nodes.empty();
        nodes.add(TP.nodeCloneNode(this.$get('node'), true));

        this.$set('points', null, false);

        //  all the way back? then we're at the same phase as the last
        //  commit (or if no commit then we must be unprocessed)
        this.set('phase', this.get('commitPhase'));
    }

    //  in all cases we presume that the current state of the node should
    //  reflect the state at the rollback point now so we clear the index
    this.$set('currentIndex', null, false);

    //  rolling back means a change in visible state
    this.changed('value', TP.UPDATE);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('toEnd',
function() {

    /**
     * @method toEnd
     * @summary Moves the receiver's current node index to the end of any
     *     checkpoints which have been made, returning you to the last state of
     *     the node.
     * @returns {TP.core.Node} The receiver.
     */

    var node;

    node = this.getNativeNode();

    if (!this.isTransactional()) {
        return this;
    }

    this.set('currentIndex', null);

    return this;
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

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Whether or not we're already in the middle of 'transforming' a piece of
//  markup. This helps avoid endless recursions between the 'transform' method
//  and the 'compile' method/tag processing pipeline.
TP.core.CollectionNode.Inst.defineAttribute('$alreadyTransforming');

TP.core.CollectionNode.Inst.defineAttribute('preppedReps');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addTIBETSrc',
function(aURI, force) {

    /**
     * @method addTIBETSrc
     * @summary Adds an tibet:src value to the documentElement of the receiver.
     *     This method is normally invoked when the Node is "owned" by a URI to
     *     ensure proper ID generation can occur.
     * @param {TP.core.URI|String} aURI An optional URI value. If not provided
     *     then the receiver's uri is used.
     * @param {Boolean} force True to force setting the value even if the node
     *     already has one. Default is false.
     * @returns {TP.core.Node} The receiver.
     */

    var node,
        url;

    node = this.getNativeNode();

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
    //this.changed('@tibet:src', TP.CREATE);

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
     * @param {TP.lang.Hash|TP.sig.Request} aParamHash A set of key/value pairs
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
            if (TP.isURI(url = aParamHash.at('uri'))) {
                //  The 'uri' slot in the param hash typically contains a
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

    if (!TP.isURI(pathURI = TP.elementComputeXMLBaseFrom(node))) {
        pathURI = baseURI;
    }

    if (TP.isURI(pathURI) && TP.isURI(val)) {
        retVal = TP.uriJoinPaths(TP.uriCollectionPath(pathURI), val);
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('$getAttribute',
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

    if (TP.isDocument(node)) {
        node = node.documentElement;
    }

    return TP.elementGetAttribute(node, attributeName, true);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getAttribute',
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

    var funcName;

    //  try attribute manipulation naming convention first
    funcName = 'getAttr' + attributeName.asStartUpper();
    if (TP.canInvoke(this, funcName)) {
        return this[funcName]();
    }

    return this.$getAttribute(attributeName);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getAttributes',
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
     * @returns {TP.lang.Hash} A collection of name/value pairs.
     */

    var node;

    node = this.getNativeNode();

    if (TP.isDocument(node)) {
        node = node.documentElement;
    }

    return TP.elementGetAttributes(node, attributeName, stripPrefixes);
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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest Optional control
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

TP.core.CollectionNode.Inst.defineMethod('getTemplateName',
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

TP.core.CollectionNode.Inst.defineMethod('hasAttribute',
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

    if (TP.isDocument(node)) {
        node = node.documentElement;
    }

    if (!TP.isElement(node)) {
        return this.raise('TP.sig.InvalidOperation', this);
    }

    return TP.elementHasAttribute(node, attributeName, true);
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

TP.core.CollectionNode.Inst.defineMethod('$removeAttribute',
function(attributeName) {

    /**
     * @method removeAttribute
     * @summary Removes the named attribute. This version is a wrapper around
     *     the native element node removeAttribute call which attempts to handle
     *     standard change notification semantics for native nodes as well as
     *     proper namespace management.
     * @param {String} attributeName The attribute name to remove.
     */

    var attr,
        node;

    node = this.getNativeNode();

    if (TP.isDocument(node)) {
        node = node.documentElement;
    }

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

    //  NB: We don't flag changes for internal 'tibet:' attributes
    //  (presuming change flagging is on)
    if (this.shouldFlagChanges() &&
        !TP.regex.TIBET_SCHEME.test(attributeName)) {
        TP.elementFlagChange(node, TP.ATTR + attributeName, TP.DELETE);
    }

    //  rip out the attribute itself
    TP.elementRemoveAttribute(node, attributeName, true);

    this.changed('@' + attributeName, TP.DELETE);

    //  removeAttribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeAttribute',
function(attributeName) {

    /**
     * @method removeAttribute
     * @summary Removes the named attribute. This version is a wrapper around
     *     the native element node removeAttribute call which attempts to handle
     *     standard change notification semantics for native nodes as well as
     *     proper namespace management.
     * @param {String} attributeName The attribute name to remove.
     */

    var funcName;

    //  try attribute manipulation naming convention first
    funcName = 'removeAttr' + attributeName.asStartUpper();
    if (TP.canInvoke(this, funcName)) {
        return this[funcName]();
    }

    return this.$removeAttribute(attributeName);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('$setAttribute',
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

    var boolAttrs,

        node,

        oldValue,

        attr,
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

    if (TP.isDocument(node)) {
        node = node.documentElement;
    }

    //  work from the attribute node so we can be more accurate. this helps
    //  ensure that environments which don't preserve the concept of a
    //  namespace URI consistently (html) won't end up with two attributes
    //  of the same name but different namespace URIs
    attr = node.getAttributeNode(attributeName);

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

            this.changed('@' + attributeName,
                            TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldValue,
                                    TP.NEWVAL, attributeValue));

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

            this.changed('@' + attributeName, TP.CREATE);

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

    this.changed('@' + attributeName,
                    TP.CREATE,
                    TP.hc('oldValue', oldValue,
                            'newValue', attributeValue));

    //  setAttribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('setAttribute',
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

    var attrName,
        parts,

        funcName;

    //  try attribute manipulation naming convention first

    //  if the attribute is namespace qualified, we 'start upper' each piece.
    //  e.g. 'foo:bar' -> 'FooBar'
    if (/:/.test(attrName = attributeName)) {
        parts = attrName.split(/:/);
        attrName = parts.first().asStartUpper() + parts.last().asStartUpper();
    } else {
        //  Otherwise, we just 'start upper' the whole piece
        //  'foo' -> 'Foo'
        attrName = attrName.asStartUpper();
    }

    funcName = 'setAttr' + attrName;
    if (TP.canInvoke(this, funcName)) {
        return this[funcName](attributeValue);
    }

    return this.$setAttribute(attributeName, attributeValue);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('setAttributes',
function(attributeHash) {

    /**
     * @method setAttributes
     * @summary Sets the value of the attributes provided using the supplied
     *     TP.lang.Hash. For document nodes this operation effectively operates
     *     on the document's documentElement.
     * @param {TP.lang.Hash} attributeHash The attributes to set.
     */

    attributeHash.perform(
        function (kvPair) {
            this.setAttribute(kvPair.first(), kvPair.last());
        }.bind(this));
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
        this.changed('content', TP.UPDATE);
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
     * @param {TP.lang.Hash|TP.sig.Request} aParamHash A parameter container
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

    TP.stop('break.content_transform');

    if (TP.notEmpty(templateName = this.getTemplateName())) {
        templateFunc = TP.uc(templateName).getResource();
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
similar iteration operation to operate on node content. Be sure to leverage
the set() call or other methods which ensure consistency of data if the node
being operated on isTransactional() and has been checkpointing, otherwise
old checkpoint data may not be cleared properly.
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
        content;

    if (TP.notValid(newContent) || (newContent === '')) {
        return this.getNativeNode();
    }

    request = TP.request(aRequest);
    request.atPutIfAbsent('targetPhase', this.getTargetPhase());

    //  If the content to be set is a URI, then track it via the 'uri'
    //  property on the request. This allows us to use it later when
    //  attempting to add to the history mechanism.
    if (TP.isURI(newContent)) {
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

    //  If stdin content was supplied, execute the content as well as
    //  process it.
    if (TP.notEmpty(stdinContent)) {
        content = TP.processAndExecuteWith(newContent,
                                            request,
                                            stdinContent);
    } else {
        content = TP.process(newContent, request);
    }

    return this.addProcessedContent(content, request);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addProcessedContent',
function(newContent, aRequest) {

    /**
     * @method addProcessedContent
     * @summary Adds new content to the receiver without performing any content
     *     processing on it.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
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

    if (TP.notValid(newContent) || (newContent === '')) {
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
        loadFunc = function(aNode) {

                        reqLoadFunc(aNode);
                        thisref.changed('content', TP.APPEND);
                    };
    } else {
        loadFunc = function(aNode) {

                        thisref.contentAppendCallback(aNode);
                        thisref.changed('content', TP.APPEND);
                    };
    }

    result = func(node,
                    content,
                    loadFunc,
                    TP.ifKeyInvalid(request, 'awaken', false));

    //  If we're flagging changes, go ahead and do that now.
    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(node, TP.SELF, TP.APPEND);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(node),
                        TP.LOG) : 0;
    }

    //  The primitive will have returned a native Node, but we need to
    //  return a TP.core.Node.
    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('contentAppendCallback',
function(aNode) {

    /**
     * @method contentAppendCallback
     * @summary This method is the standard 'content append' callback when
     *     addProcessedContent() method is called.
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
     *     insertProcessedContent() method is called.
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
     *     setProcessedContent() method is called.
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
        content;

    if (TP.notValid(newContent) || (newContent === '')) {
        return this.getNativeNode();
    }

    request = TP.request(aRequest);
    request.atPutIfAbsent('targetPhase', this.getTargetPhase());

    //  If the content to be set is a URI, then track it via the 'uri'
    //  property on the request. This allows us to use it later when
    //  attempting to add to the history mechanism.
    if (TP.isURI(newContent)) {
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

    //  If stdin content was supplied, execute the content as well as
    //  process it.
    if (TP.notEmpty(stdinContent)) {
        content = TP.processAndExecuteWith(newContent,
                                            request,
                                            stdinContent);
    } else {
        content = TP.process(newContent, request);
    }

    return this.insertProcessedContent(content, aPositionOrPath, request);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('insertProcessedContent',
function(newContent, aPositionOrPath, aRequest) {

    /**
     * @method insertProcessedContent
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

    if (TP.notValid(newContent) || (newContent === '')) {
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
        loadFunc = function(aNode) {

                        reqLoadFunc(aNode);
                        thisref.changed('content', TP.INSERT);
                    };
    } else {
        loadFunc = function(aNode) {

                        thisref.contentInsertCallback(aNode);
                        thisref.changed('content', TP.INSERT);
                    };
    }

    result = func(node,
                    content,
                    aPositionOrPath,
                    loadFunc,
                    TP.ifKeyInvalid(request, 'awaken', false));

    //  If we're flagging changes, go ahead and do that now.
    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(node, TP.SELF, TP.INSERT);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(node),
                        TP.LOG) : 0;
    }

    //  The primitive will have returned a native Node, but we need to
    //  return a TP.core.Node.
    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} True when single valued.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('isScalarValued',
function() {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} True when scalar valued.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('reviveContent',
function(aParamHash) {

    /**
     * @method reviveContent
     * @summary Causes the receiver to perform whatever steps are necessary to
     *     revive its content, presuming that it has just been read in from a
     *     compiled cache representation.
     * @param {TP.lang.Hash} aParamHash A set of key/value pairs which should be
     *     used to control the transformation.
     * @returns {TP.core.Node} The receiver.
     */

    return this;
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
        content;

    //  We return if newContent isn't valid and clear ourself if newContent is
    //  the empty String.
    if (TP.notValid(newContent)) {
        return;
    } else if (newContent === '') {
        return this.empty();
    }

    //  If the unwrapped content isn't an Element and the stringified content
    //  isn't a URI and if the stringified content doesn't contain markup, then
    //  it doesn't need to be processed but can just be set as the regular
    //  content of the receiver, so we call up to the supertype to do that. At
    //  the Node level, it is determined whether this is a scalar or
    //  single-value node and might do some further processing on 'newContent'
    //  at that point.
    if (!TP.isElement(content = TP.unwrap(newContent)) &&
        !TP.isURI(content = TP.str(content)) &&
        !TP.regex.CONTAINS_ELEM_MARKUP.test(content)) {
        return this.callNextMethod();
    }

    request = TP.request(aRequest);
    request.atPutIfAbsent('targetPhase', this.getTargetPhase());

    //  If the content to be set is a URI, then track it via the 'uri'
    //  property on the request. This allows us to use it later when
    //  attempting to add to the history mechanism.
    if (TP.isURI(newContent)) {
        request.atPutIfAbsent('uri', newContent);
    }

    //  Put ourself into the 'target' slot, so that the content pipeline has
    //  the target 'surface' that its processing for available to it.
    request.atPut('target', this);

    //  For now, anyway, processing the content needs to be synchronous.
    request.atPut('async', false);

    //  Unlike the 'addContent()' and 'insertContent()' methods on this type,
    //  content drawn from here will *not* be awakened when the nodes are placed
    //  into a visible DOM. We're setting the whole content, so the Mutation
    //  Observer machinery will not be invoked. Therefore, we manually awaken
    //  the content from here.
    request.atPutIfAbsent('awaken', true);

    //  If stdin content was supplied, execute the content as well as
    //  process it.
    if (TP.notEmpty(stdinContent)) {
        content = TP.processAndExecuteWith(newContent,
                                            request,
                                            stdinContent);
    } else {
        content = TP.process(newContent, request);
    }

    if (request.didFail()) {
        return;
    }

    return this.setProcessedContent(content, request);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('setProcessedContent',
function(newContent, aRequest) {

    /**
     * @method setProcessedContent
     * @summary Sets the content of the receiver to the content provided
     *     without performing any content processing on it.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var node,

        content,
        request,

        arrContent,

        func,
        thisref,

        historyFunc,

        reqLoadFunc,
        loadFunc,

        result;

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

    //  Define a function that will be used during 'load processing' that
    //  will configure the document title and possibly the history mechanism
    //  if the request contains a 'uri' property.
    historyFunc =
        function(aNode) {

            var win,
                docTitle,
                docURI;

            //  If we're setting the content of a 'whole Document' and that
            //  Document has a Window and that Window is the current UI
            //  canvas, then set the top-level document's title to this
            //  content's title. If the content has a 'uri' property, add to
            //  TP.core.History's history-tracking mechanism as well.
            if (TP.isDocument(aNode) &&
                TP.isWindow(win = TP.nodeGetWindow(aNode)) &&
                (TP.gid(win) === TP.sys.getUICanvasName())) {
                docTitle = TP.documentGetTitleContent(aNode);

                TP.documentSetTitleContent(document, docTitle);

                if (TP.notEmpty(docURI = request.at('uri'))) {
                    TP.core.History.setLocation(docURI);
                }
            }
        };

    if (TP.isCallable(reqLoadFunc = request.at(TP.ONLOAD))) {
        loadFunc = function(aNode) {

                        reqLoadFunc(aNode);

                        historyFunc(aNode);

                        thisref.changed('content', TP.UPDATE);
                    };
    } else {
        loadFunc = function(aNode) {

                        thisref.contentReplaceCallback(aNode);

                        historyFunc(aNode);

                        thisref.changed('content', TP.UPDATE);
                    };
    }

    result = func(node,
                    content,
                    loadFunc,
                    TP.ifKeyInvalid(request, 'awaken', true));

    //  If we're flagging changes, go ahead and do that now.
    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(node, TP.SELF, TP.UPDATE);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(node),
                        TP.LOG) : 0;
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

TP.core.CollectionNode.Inst.defineMethod(
        'getDescendantElementsByAttributePrefix',
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
    while (TP.isNode(theNode) && (theNode !== stopNode)) {
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
                                attrValue));
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

TP.core.CollectionNode.Inst.defineMethod('ancestorsPerform',
function(aFunction, shouldReverse) {

    /**
     * @method ancestorsPerform
     * @summary Executes aFunction with each ancestor of the node, working from
     *     the node outward unless shouldReverse is true.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate. You
     *     can also call atStart or atEnd within your implemenation of aFunction
     *     to test if the iteration is at the beginning or end of the
     *     collection.
     * @param {Function} aFunction A function which performs some action with an
     *     element node.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     */

    return TP.nodeAncestorsPerform(this.getNativeNode(),
                                    aFunction,
                                    shouldReverse);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('childElementsPerform',
function(aFunction, shouldReverse) {

    /**
     * @method childElementsPerform
     * @summary Executes aFunction with each child element of the node.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate. You
     *     can also call atStart or atEnd within your implemenation of aFunction
     *     to test if the iteration is at the beginning or end of the
     *     collection. Note the filter here for child nodes that are elements.
     *     The index provided to aFunction is the index that would be used had
     *     you collected the elements first, then iterated on that array. This
     *     also means that, if the first or last node are not elements, the
     *     iteration function will not be called and you should take that into
     *     consideration when using atStart()/atEnd() functionality.
     * @param {Function} aFunction A function which performs some action with
     *     each element provided.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     */

    return TP.nodeChildElementsPerform(this.getNativeNode(),
                                        aFunction,
                                        shouldReverse);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('childNodesPerform',
function(aFunction, shouldReverse) {

    /**
     * @method childNodesPerform
     * @summary Executes aFunction with each child node of the node. NOTE that
     *     as part of the processing here the node is normalized to coalesce
     *     adjacent text nodes.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate. You
     *     can also call atStart or atEnd within your implemenation of aFunction
     *     to test if the iteration is at the beginning or end of the
     *     collection.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     */

    return TP.nodeChildNodesPerform(this.getNativeNode(),
                                    aFunction,
                                    shouldReverse);
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
function(aFunction, aSubset, shouldReverse) {

    /**
     * @method siblingsPerform
     * @summary Executes aFunction with each sibling of the node.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate. You
     *     can also call atStart or atEnd within your implemenation of aFunction
     *     to test if the iteration is at the beginning or end of the
     *     collection. Note that the index provided to aFunction is the index
     *     that would have been used had you collected the siblings in an array
     *     first, then iterated.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     */

    return TP.nodeSiblingsPerform(this.getNativeNode(),
                                    aFunction,
                                    aSubset,
                                    shouldReverse);
});

//  ------------------------------------------------------------------------
//  NODE CONTENT DETECTION
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectAncestor',
function(aFunction, shouldReverse) {

    /**
     * @method detectAncestor
     * @summary Returns the first ancestor of the node for which aFunction
     *     returns true. The normal direction of this search is from the node
     *     "outward" toward the document root.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     * @returns {TP.core.ElementNode} An ancestor found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeDetectAncestor(this.getNativeNode(),
                                            aFunction,
                                            shouldReverse));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectChildElement',
function(aFunction, shouldReverse) {

    /**
     * @method detectChildElement
     * @summary Returns the first child element of the receiver for which
     *     aFunction returns true. Iteration is from firstChild to lastChild.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     * @returns {TP.core.ElementNode} A child element found acceptable by
     *     aFunction.
     */

    return TP.wrap(TP.nodeDetectChildElement(this.getNativeNode(),
                                                aFunction,
                                                shouldReverse));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectChildNode',
function(aFunction, shouldReverse) {

    /**
     * @method detectChildNode
     * @summary Returns the first child node of the node for which aFunction
     *     returns true. Iteration is from firstChild to lastChild.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     * @returns {TP.core.Node} A child node found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeDetectChildNode(this.getNativeNode(),
                                            aFunction,
                                            shouldReverse));
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
function(aFunction, aSubset, shouldReverse) {

    /**
     * @method detectSibling
     * @summary Returns the first sibling node (next, previous, or any) of the
     *     node for which aFunction returns true.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     * @returns {TP.core.Node} A sibling found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeDetectSibling(this.getNativeNode(),
                                        aFunction,
                                        aSubset,
                                        shouldReverse));
});

//  ------------------------------------------------------------------------
//  NODE SELECTION (FILTERING)
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectAncestors',
function(aFunction, shouldReverse) {

    /**
     * @method selectAncestors
     * @summary Returns an array of ancestors of the node for which aFunction
     *     returns true. The normal direction of this search is from the node
     *     "outward" toward the document root.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     * @returns {Array} An Array of ancestors found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectAncestors(this.getNativeNode(),
                                            aFunction,
                                            shouldReverse));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectChildElements',
function(aFunction, shouldReverse) {

    /**
     * @method selectChildElements
     * @summary Returns an array of child elements of the receiver for which
     *     aFunction returns true. Iteration is from firstChild to lastChild.
     * @param {Function} aFunction A function which performs some action with
     *     each node provided.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     * @returns {TP.core.Node} A child element found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectChildElements(this.getNativeNode(),
                                                aFunction,
                                                shouldReverse));
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('selectChildNodes',
function(aFunction, shouldReverse) {

    /**
     * @method selectChildNodes
     * @summary Returns an Array of children of the node for which aFunction
     *     returns true. Iteration is from firstChild to lastChild.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     * @returns {Node} A child node found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectChildNodes(this.getNativeNode(),
                                            aFunction,
                                            shouldReverse));
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
function(aFunction, aSubset, shouldReverse) {

    /**
     * @method selectSiblings
     * @summary Returns an array of siblings (next, previous, or any) of the
     *     node for which aFunction returns true.
     * @param {Function} aFunction A function returning true when passed an
     *     acceptable node.
     * @param {String} aSubset TP.NEXT, TP.PREVIOUS, or null to collect all
     *     siblings.
     * @param {Boolean} shouldReverse Should this be "reversePerform"?
     * @returns {Array} An Array of siblings found acceptable by aFunction.
     */

    return TP.wrap(TP.nodeSelectDescendants(this.getNativeNode(),
                                            aFunction,
                                            aSubset,
                                            shouldReverse));
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
    }

    return TP.wrap(retVal);
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeChild',
function(aNode) {

    /**
     * @method removeChild
     * @summary Removes a specific child node, ensuring that proper flagging
     *     and/or removal are done along with change notification.
     * @param {Element} aNode A specific child/descendant node.
     * @returns {TP.core.CollectionNode} The receiver.
     */

    var node,
        child;

    node = this.getNativeNode();

    child = aNode;

    if (this.shouldFlagChanges()) {
        //  if we're flagging rather than 'doing' then we set the change flag to
        //  TP.DELETE and that's all
        TP.elementFlagChange(child, TP.SELF, TP.DELETE);

        TP.ifTrace() && TP.$DEBUG ?
            TP.trace('Node flagged: ' + TP.nodeAsString(child),
                        TP.LOG) : 0;
    } else {
        //  if we're not flagging then just rip it out of the DOM
        TP.nodeRemoveChild(node, child);
    }

    this.changed('content', TP.DELETE);

    return this;
});

//  ------------------------------------------------------------------------
//  TP.api.CollectionAPI
//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('add',
function() {

    /**
     * @method add
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    var node,
        len,
        i;

    node = this.getNativeNode();

    len = this.length;

    for (i = 0; i < arguments.length; i++) {

        //  Note that we use the low-level primitive here rather than
        //  'addContent()' / 'addProcessedContent()' because this is a
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllIfAbsent',
function() {

    /**
     * @method addAllIfAbsent
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addIfAbsent',
function() {

    /**
     * @method addIfAbsent
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addItem',
function() {

    /**
     * @method addItem
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addWithCount',
function() {

    /**
     * @method addWithCount
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('asArray',
function() {

    /**
     * @method asArray
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('asHash',
function() {

    /**
     * @method asHash
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('asIterator',
function() {

    /**
     * @method asIterator
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('asRange',
function() {

    /**
     * @method asRange
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('collectInvoke',
function() {

    /**
     * @method collectInvoke
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('compact',
function() {

    /**
     * @method compact
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('conform',
function() {

    /**
     * @method conform
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('convert',
function() {

    /**
     * @method convert
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectMax',
function() {

    /**
     * @method detectMax
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectMin',
function() {

    /**
     * @method detectMin
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('difference',
function() {

    /**
     * @method difference
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('disjunction',
function() {

    /**
     * @method disjunction
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
            TP.trace('Node flagged: ' + TP.nodeAsString(node),
                        TP.LOG) : 0;
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getItems',
function() {

    /**
     * @method getItems
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getIterator',
function() {

    /**
     * @method getIterator
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getIteratorType',
function() {

    /**
     * @method getIteratorType
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('grep',
function() {

    /**
     * @method grep
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('groupBy',
function() {

    /**
     * @method groupBy
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('isSortedCollection',
function() {

    /**
     * @method isSortedCollection
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('merge',
function() {

    /**
     * @method merge
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('partition',
function() {

    /**
     * @method partition
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performSet',
function() {

    /**
     * @method performSet
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performUntil',
function() {

    /**
     * @method performUntil
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performWhile',
function() {

    /**
     * @method performWhile
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replace',
function() {

    /**
     * @method replace
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replaceAll',
function() {

    /**
     * @method replaceAll
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('unique',
function() {

    /**
     * @method unique
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @exception TP.sig.InvalidParameter,TP.sig.IndexOutOfRange
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
                    }
                }
            } else {
                try {
                    TP.elementInsertContent(results[i], obj, position);
                } catch (e) {
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

        if ((node.childNodes.length < anIndex) || (anIndex < 0)) {
            return this.raise('TP.sig.IndexOutOfRange');
        }

        //  empty? then we insert, or iterate and insert as needed
        if ((node.childNodes.length === 0) && (anIndex === 0)) {
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atAllPut',
function() {

    /**
     * @method atAllPut
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atIfInvalid',
function() {

    /**
     * @method atIfInvalid
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atIfNull',
function() {

    /**
     * @method atIfNull
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atIfUndefined',
function() {

    /**
     * @method atIfUndefined
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atPut',
function() {

    /**
     * @method atPut
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('atPutIfAbsent',
function() {

    /**
     * @method atPutIfAbsent
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('containsKey',
function() {

    /**
     * @method containsKey
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('containsValue',
function() {

    /**
     * @method containsValue
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('detectKeyAt',
function() {

    /**
     * @method detectKeyAt
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getKeys',
function() {

    /**
     * @method getKeys
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getKVPairs',
function() {

    /**
     * @method getKVPairs
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getPairs',
function() {

    /**
     * @method getPairs
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getPosition',
function() {

    /**
     * @method getPosition
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('getPositions',
function() {

    /**
     * @method getPositions
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('grepKeys',
function() {

    /**
     * @method grepKeys
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('performOver',
function() {

    /**
     * @method performOver
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
            TP.trace('Node flagged: ' + TP.nodeAsString(child),
                        TP.LOG) : 0;
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeKey',
function() {

    /**
     * @method removeKey
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeKeys',
function() {

    /**
     * @method removeKeys
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('transpose',
function() {

    /**
     * @method transpose
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllAfter',
function() {

    /**
     * @method addAllAfter
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllBefore',
function() {

    /**
     * @method addAllBefore
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllFirst',
function() {

    /**
     * @method addAllFirst
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addAllLast',
function() {

    /**
     * @method addAllLast
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addBefore',
function() {

    /**
     * @method addBefore
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addFirst',
function() {

    /**
     * @method addFirst
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('addLast',
function() {

    /**
     * @method addLast
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('after',
function() {

    /**
     * @method after
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('before',
function() {

    /**
     * @method before
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeFirst',
function() {

    /**
     * @method removeFirst
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('removeLast',
function() {

    /**
     * @method removeLast
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replaceFirst',
function() {

    /**
     * @method replaceFirst
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('replaceLast',
function() {

    /**
     * @method replaceLast
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.defineMethod('reverse',
function() {

    /**
     * @method reverse
     * @returns {TP.core.CollectionNode} The receiver.
     * @abstract
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

        shouldProcess,

        request,

        processor,

        nodeGID,

        type;

    TP.stop('break.content_process');

    node = this.getNativeNode();

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

    if (shouldProcess) {
        request = TP.request(aRequest);

        //  We do *not* clone our native node before we process it - the
        //  processing system will not process a detached node so we process it
        //  in situ.

        //  Allocate a tag processor and initialize it with the COMPILE_PHASES
        processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                        TP.core.TagProcessor.COMPILE_PHASES);

        //  Capture this before processing - processing this node might very
        //  well detach it.
        nodeGID = TP.gid(node);

        //  Process the tree of markup
        processor.processTree(node, request);

        //  Signal from the node that compile processing is complete.
        TP.signal(nodeGID, 'TP.sig.CompileProcessingComplete');

        //  If the shell request failed then our enclosing request has failed.
        if (request.didFail()) {
            aRequest.fail(request.getFaultText(), request.getFaultCode());
            return;
        }
    }

    //  if our processing produced a new native node of the same type as our
    //  original content (so we're still the right kind of wrapper) we can
    //  update our internal node content. If not we'll need to get a new
    //  wrapper and return that as the result.

    if (!TP.isNode(node)) {
        return node;
    } else if ((type = TP.core.Node.getConcreteType(node)) === this.getType()) {
        this.setNativeNode(node);
    } else {
        return type.construct(node);
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
     * @returns {TP.core.CollectionNode} The receiver.
     */

    return this.compile(aRequest);
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
     * @summary Adds an tibet:src value to the documentElement of the receiver.
     *     This method is normally invoked when the Node is "owned" by a URI to
     *     ensure proper ID generation can occur.
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
     * @param {TP.lang.Hash|TP.sig.Request} aParamHash A set of key/value pairs
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
     * @returns {TP.lang.Hash} A collection of name/value pairs.
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
     *     TP.lang.Hash. For document nodes this operation effectively operates
     *     on the document's documentElement.
     * @description At this level, this method is a no-op.
     * @param {TP.lang.Hash} attributeHash The attributes to set.
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

        nodeGID;

    TP.stop('break.content_process');

    node = this.getNativeNode();

    request = TP.request(aRequest);

    //  Allocate a tag processor and initialize it with the COMPILE_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.COMPILE_PHASES);

    childNodes = TP.nodeGetChildNodes(node);

    len = childNodes.getSize();

    //  Process each child that we have.
    for (i = 0; i < len; i++) {

        //  Capture this before processing - processing this node might very
        //  well detach it.
        nodeGID = TP.gid(childNodes.at(i));

        processor.processTree(childNodes.at(i), request);

        //  If the shell request failed then our enclosing request has failed.
        if (request.didFail()) {
            aRequest.fail(request.getFaultText(), request.getFaultCode());
            return;
        }

        //  Signal from the node that compile processing is complete.
        TP.signal(nodeGID, 'TP.sig.CompileProcessingComplete');
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

//  The attributes for this element type that are considered to 'URI
//  attributes' that need XML Base/virtual URI resolution.
TP.core.ElementNode.Type.defineAttribute('uriAttrs', TP.ac());

//  the node's template. this will be used when instances are constructed
//  with a TP.lang.Hash incoming value
TP.core.ElementNode.Type.defineAttribute('template');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('computeResourceURI',
function(resource, mimeType) {

    /**
     * @method computeResourceURI
     * @summary Computes a resource URI using information including a resource
     *     "name" and mime type (for use in determining potential extensions).
     *     This routine is leveraged by getResourceURI-invoked methods which
     *     need to compute default file paths such as getTemplateURI and
     *     getStyleURI.
     * @discussion There are a couple of concerns regarding resources. First, we
     *     might be in a "rollup" state where tags which normally have their own
     *     file/uri need to use a uri path from a rolled up production file.
     *     Second, tags in a namespace may be sharing a namespace-level
     *     resource file (which is a form of limited rollup). Finally we might
     *     be using a specific resource file for the tag but it could be in any
     *     number of formats from XSL to JS to XHTML to SVG and so on.
     *
     *     To help avoid 404's this method relies on a combination of config
     *     flag and attribute settings which let you control the computation of
     *     a resource URI explicitly for each element type.
     *
     *     The config flag values are always of the form 'path' + typeName +
     *     '.{{resource}}'. If that value is set it should be a URI and it will
     *     be used as-is UNLESS the extension has a rollup setting. For example,
     *     if the extension would be xhtml and xhtml.resource.rollup="{{uri}}"
     *     is set the specified rollup URI will be returned. NOTE the rollup
     *     setting is typically managed by the TIBET CLI as part of packaging.
     *
     *     Attributes which help control this method allow you to define whether
     *     the type should defer to a namespace-level resource and which mime
     *     extension should be used. For example, if you set the type attribute
     *     namespaced{{resource}} to true the receiver will delegate to the
     *     namespace. If you set {{resource}}Extension that extension will be
     *     used regardless of any value implied via the mimeType parameter.
     * @param {String} resource The resource name. Typically template, style,
     *     theme, etc. but it could be essentially anything except the word
     *     'resource' (since that would trigger a recursion).
     * @param {String} mimeType The mimeType for the resource being looked up.
     * @returns {String} A properly computed URL in string form.
     */

    var type,
        uri,
        location,
        ext,
        namespace,
        mime,
        extensions,
        name,
        key,
        value;

    if (!TP.isString(resource) || TP.isEmpty(resource) ||
            resource === 'resource') {
        return this.raise('TP.sig.InvalidParameter',
            'Must supply a valid resource name.');
    }

    name = this.getResourceTypeName();

    //  If we're set to leverage namespaced CSS or namespaced templates, etc.
    //  then we delegate our answer to the namespace object for the receiver. If
    //  we're in a rollup state the namespace object should handle that fact.
    if (TP.isTrue(this.get('namespaced' + resource.asTitleCase()))) {
        type = this.getNamespaceObject();
        if (TP.canInvoke(type, 'getResourceURI')) {
            uri = type.getResourceURI(resource, mimeType);

            // Depending on resource type we adjust shared template URIs to use
            // a slice. For now we'll do this for XHTML and XML templates.
            if (TP.isURI(uri)) {
                mime = uri.getMIMEType();
                if (mime === TP.ietf.Mime.XHTML || mime === TP.ietf.Mime.XML) {
                    location = uri.getLocation();
                    location += '#' + TP.escapeTypeName(name);
                    uri = TP.uc(location);
                }
            }

            return uri;
        }
    }

    //  If we have an explicit mapping for an extension we will avoid worrying
    //  about any mime type extension list and just rely on the explicit one.
    ext = this.get(resource.toLowerCase() + 'Extension');
    if (TP.isEmpty(ext)) {

        //  Without an explicit extension we'll drop back to mime type and see
        //  if we can leverage that.
        mime = TP.ifInvalid(this.get(resource.toLowerCase() + 'Mime'),
                mimeType);
        if (TP.isEmpty(mime)) {
            switch (resource.toLowerCase()) {
                case 'template':
                    mime = TP.ietf.Mime.XHTML;
                    break;
                case 'style':
                    mime = TP.ietf.Mime.CSS;
                    break;
                case 'theme':
                    mime = TP.ietf.Mime.CSS;
                    break;
                default:
                    mime = TP.ietf.Mime.XML;
                    break;
            }
        }

        // Once we have a mime type we can fetch the extensions and default to
        // the first one (the canonical one based on convention).
        extensions = TP.ietf.Mime.getExtensions(mime);
        if (TP.notEmpty(extensions)) {
            ext = extensions.at(0);
        }
    }

    //  With an extension we can now check to see if we're supposed to use
    //  rollup resources for that extension. If so it'll be a config flag
    //  pointing to the URI we should use.
    key = ext + '.' + resource.toLowerCase() + '.rollup';
    value = TP.sys.cfg(key);
    if (TP.notEmpty(value)) {
        return value;
    }

    //  Not doing a rollup? See if we have an explicit mapping for our resource.
    key = 'path.' + name + '.' + resource.toLowerCase();
    value = TP.sys.cfg(key);
    if (TP.notEmpty(value)) {
        return value;
    }

    //  If we couldn't compute a URI, default it to the receiver's load
    //  location and use the extension computed earlier.
    return TP.objectGetSourceCollectionPath(this) +
        '/' + this.getName() + '.' + ext;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('constructContentObject',
function(aURI, content) {

    /**
     * @method constructContentObject
     * @summary Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {TP.core.URI} aURI The URI containing the content.
     * @param {Object} content The content to set into the content object.
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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
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
     *     'attrInfo' TP.lang.Hash|Function The Hash or Function to use to
     *     compute attributes for the main element. 'format' String How items
     *     should be formatted when this routine loops. 'autowrap' Boolean
     *     Whether or not this routine iterates over an item list, generating
     *     markup for individual items, or just generates 'start & end' tags and
     *     hands the Object to the 'format' specified (or to this tag's 'item
     *     tag name') to iterate. 'infos' Array The Array containing information
     *     about each 'level' of the formatting recursion. If attrInfo is
     *     supplied, and its a Function, that Function should be defined like
     *     so:
     *
     *     function(item) {
     *
     *     return 'foo="bar"'; };
     *
     *     where the item is the Array itself. It should return a String as
     *     demonstrated. If itemAttrInfo is supplied, and its a Function, that
     *     Function should be defined like so:
     *
     *     function(item) {
     *
     *     return 'foo="bar"'; };
     *
     *     where the item is the item itself at that position in the Array. It
     *     should return a String as demonstrated.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var theRequest,

        currentLevel,
        infos,
        levelInfo,

        attrInfo,
        attrStr,

        tagName,
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
            //  We're at 'level 0'
            levelInfo = theRequest;
        } else if (TP.notValid(infos = theRequest.at('infos')) ||
            (TP.notValid(levelInfo = infos.at(currentLevel - 1)))) {
            levelInfo = TP.hc();
        }
    } else {
        //  We must be at 'level 0' - there not even a 'currentLevel' set.
        levelInfo = theRequest;
    }

    //  If 'currentLevel' wasn't defined before, that means that we're at
    //  level 0 (the caller's entry point). Define it to be 'level 1'.
    //  Otherwise, increment the level count.
    if (TP.notValid(theRequest.at('currentLevel'))) {
        theRequest.atPut('currentLevel', 1);
    } else {
        theRequest.atPut('currentLevel', theRequest.at('currentLevel') + 1);
    }

    tagName = this.getCanonicalName();

    //  Note that for these configuration parameters, 'levelInfo' very well
    //  maybe be an empty TP.lang.Hash.

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
        formatArgs = theRequest;
    }

    if (!shouldAutoWrap) {
        //  No attribute info? Then we can just use the tag name and the
        //  item format.
        if (TP.notValid(attrInfo)) {
            attrStr = '';
        } else {
            //  If attrInfo isn't a Function, then see if its a String or
            //  TP.lang.Hash.
            if (!TP.isCallable(attrInfo)) {
                if (TP.isString(attrInfo)) {
                    //  It's a String - just use it.
                    attrStr = ' ' + attrInfo;
                } else if (TP.isValid(attrInfo)) {
                    //  It should be a TP.lang.Hash at this point - convert
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
                                        theRequest);
    } else {
        //  No attribute info? Then we can just use the tag name and the
        //  item format.
        if (TP.notValid(attrInfo)) {
            attrStr = '';
        } else {
            //  If attrInfo isn't a Function, then see if its a String or
            //  TP.lang.Hash.
            if (!TP.isCallable(attrInfo)) {
                attrStr = ' {{$attrStr}}';

                if (TP.isString(attrInfo)) {
                    //  It's a String - just use it.
                    theRequest.atPut(
                                '$attrStr',
                                attrInfo);
                } else if (TP.isValid(attrInfo)) {
                    //  It should be a TP.lang.Hash at this point - convert
                    //  to a String.
                    theRequest.atPut('$attrStr',
                                        attrInfo.asAttributeString());
                } else {
                    //  Otherwise, its not valid so its the empty String.
                    theRequest.atPut('$attrStr', '');
                }
            } else {
                attrStr = ' {{.%$attrInfo}}';
            }
        }

        //  Generate a chunk of markup representing the supplied object.
        retVal = this.generateMarkup(anObject, attrStr,
                                        itemFormat, shouldAutoWrap,
                                        formatArgs,
                                        theRequest);
    }

    //  Decrement the level count by 1, now that we've returned from our
    //  formatting invocation.
    theRequest.atPut('currentLevel', theRequest.at('currentLevel') - 1);

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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var val;

    if (TP.isTrue(aRequest.at('escapeContent'))) {
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

TP.core.ElementNode.Type.defineMethod('generateEmptyMarkup',
function() {

    /**
     * @method generateEmptyMarkup
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
     * @param {TP.lang.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.lang.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     */

    var tagName,
        template,
        str;

    tagName = this.getCanonicalName();

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

TP.core.ElementNode.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided.
     * @description This method determines the 'TP wrapper' type for the
     *     supplied node by using the following logic cascade. 1. Checks for the
     *     'tibet:ctrl' attribute on the node and attempts to obtain a type
     *     matching that name. 2. Checks for the 'tibet:tag' attribute on
     *     the node and attempts to obtain a type matching that name. 3. If
     *     there is a 'tibet:tag' attribute and its exact type cannot be
     *     found, it computes a name using that name and the suffix ':Element'
     *     and attempts to obtain a type matching that name. 4. Obtains the
     *     node's 'full name' (i.e. the name that the author used in the source
     *     markup) and attempts to obtain a type matching that name. 5. Obtains
     *     the node's 'canonical name' (i.e. if the node has a namespace, it
     *     uses the canonical prefix for that namespace) and attempts to obtain
     *     a type matching that name. 6. Obtains the node's 'canonical prefix'
     *     (if the node has a namespace) and computes a name using that prefix
     *     and the suffix ':Element' and attempts to obtain a type matching that
     *     name. 7. Obtains the node's namespace URI (if the node has a
     *     namespace) and checks with the XMLNS 'info' hash to see if there is a
     *     'defaultNodeType' name registered under that namespace and attempts
     *     to obtain a type matching that name.
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
    //  node, then just return it (note that we only do this for HTML nodes,
    //  since doing this to XML nodes in Mozilla causes a problem with the
    //  XML DOM data structure such that XPath queries take a 10X
    //  performance hit).
    if (TP.isValid(type = aNode.tpNodeType)) {
        return type;
    }

    //  ctrl is how we override the standard controller for a node even
    //  when the tag points to a particular type. this allows us to
    //  provide custom controllers on individual tags
    if (TP.notEmpty(name = TP.elementGetAttribute(aNode,
                                                    'tibet:ctrl',
                                                    true))) {
        last = name;
        if (TP.isType(type = TP.sys.require(name))) {
            //  Only set the slot if its an HTML node... see above.
            TP.isHTMLNode(aNode) ? aNode.tpNodeType = type : 0;

            return type;
        }
    }

    //  tag is how we can override the natural tag's lookup model
    if (TP.notEmpty(
            name = TP.elementGetAttribute(aNode,
                                            'tibet:tag',
                                            true)) &&
        (name !== last)) {
        last = name;
        //  name wins if we have a type with that precise name
        if (TP.isType(type = TP.sys.require(name))) {
            //  Only set the slot if its an HTML node... see above.
            TP.isHTMLNode(aNode) ? aNode.tpNodeType = type : 0;

            return type;
        }

        //  namespace qualified tags have two more tests to see if
        //  a) to see if there is a type named '<prefix>:Element' or
        //  b) the namespace has a default type we should use
        if (TP.regex.NS_QUALIFIED.test(name)) {
            if (TP.notEmpty(prefix = name.match(/(.*):/)[1])) {
                //  If that namespace has a 'prefix' associated with it,
                //  we'll try to find a type named '<prefix>:Element'
                if (TP.isType(type = TP.sys.require(prefix + ':Element'))) {
                    //  Only set the slot if its an HTML node... see above.
                    TP.isHTMLNode(aNode) ? aNode.tpNodeType = type : 0;

                    return type;
                }

                if (TP.notEmpty(url = TP.w3.Xmlns.getPrefixURI(prefix))) {
                    if (TP.isValid(info =
                                    TP.w3.Xmlns.get('info').at(url))) {
                        if (TP.notEmpty(defaultType =
                                            info.at('defaultNodeType'))) {
                            if (TP.isType(type =
                                            TP.sys.require(defaultType))) {
                                //  Only set the slot if its an HTML node...
                                //  see above.
                                TP.isHTMLNode(aNode) ?
                                        aNode.tpNodeType = type :
                                        0;

                                return type;
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
    if ((name !== last) && TP.isType(type = TP.sys.require(name))) {

        //  Sometime local tag names are also native types in the system - don't
        //  return those
        if (!TP.isNativeType(type)) {
            //  Only set the slot if its an HTML node... see above.
            TP.isHTMLNode(aNode) ? aNode.tpNodeType = type : 0;

            return type;
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
    if ((name !== last) && TP.isType(type = TP.sys.require(name))) {
        //  Only set the slot if its an HTML node... see above.
        TP.isHTMLNode(aNode) ? aNode.tpNodeType = type : 0;

        return type;
    }

    //  couldn't find either a tibet:ctrl, a tibet:tag or a type
    //  that matches either the 'full name' given in the source or the
    //  'canonical name' that is computed using the node's namespace's
    //  'canonicalprefix', so we try is to see if the node has a native
    //  namespace URI, and if so, we'll try 2 other approaches.

    if (TP.notEmpty(url = TP.nodeGetNSURI(aNode))) {
        if (TP.isValid(info = TP.w3.Xmlns.get('info').at(url))) {
            //  If that namespace has a 'prefix' associated with it, we'll
            //  try to find a type named '<prefix>:Element'
            if (TP.notEmpty(prefix = info.at('prefix'))) {
                if (TP.isType(type = TP.sys.require(prefix + ':Element'))) {
                    //  Only set the slot if its an HTML node... see above.
                    TP.isHTMLNode(aNode) ? aNode.tpNodeType = type : 0;

                    return type;
                }
            }

            //  If that namespace has a 'defaultNodeType' associated
            //  with it, we'll try to find a type named that.
            if (TP.notEmpty(defaultType = info.at('defaultNodeType'))) {
                if (TP.isType(type = TP.sys.require(defaultType))) {
                    //  Only set the slot if its an HTML node... see above.
                    TP.isHTMLNode(aNode) ? aNode.tpNodeType = type : 0;

                    return type;
                }
            }
        }
    }

    //  default is to wrap based on XML vs. HTML
    if (TP.isHTMLNode(aNode)) {
        //  NOTE that we don't cache tpNodeType here to leave open the
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
     *     fromArray()/fromObject() methods.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.lang.Hash} formatArgs The 'formatting arguments' used by this
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

TP.core.ElementNode.Type.defineMethod('getNativeObserver',
function(aSignal) {

    /**
     * @method getNativeObserver
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
    if (TP.notValid(listener)) {
        return null;
    }

    if (TP.isEmpty(id = TP.elementGetAttribute(listener, 'observer'))) {
        id = TP.elementGetAttribute(listener, 'ev:observer', true);
        if (TP.isEmpty(id)) {
            return;
        }
    }

    inst = TP.byOID(id);
    if (TP.notValid(inst)) {
        return this.raise('TP.sig.InvalidHandler',
                            'Unable to construct handler instance');
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getQueryPath',
function(wantsDeep) {

    /**
     * @method getQueryPath
     * @summary Returns the 'query path' that can be used in calls such as
     *     'nodeEvaluatePath' to obtain all of the occurrences of the receiver
     *     in a document.
     * @param {Boolean} wantsDeep Whether or not the query should represent a
     *     'deep query' - that is, all of the occurrences of this element even
     *     under elements of the same type. This defaults to false.
     * @returns {String} The path that can be used to query for Nodes of this
     *     type.
     */

    var fullName;

    //  Note here how we generate a CSS3 namespace query
    fullName = this.get('nsPrefix') + '|' + this.get('localName');

    //  If the caller wants a deep query, we can simply return the full name
    //  here.
    if (TP.isTrue(wantsDeep)) {
        return fullName;
    }

    //  Otherwise, we return a query that looks for a) immediate children with
    //  this name and b) descendants with this name, but only those that don't
    //  have a parent with this name - hence giving the 'shallow' quality.
    return '> ' + fullName + ', *:not(' + fullName + ') ' + fullName;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('getResourceElement',
function(resource, mimeType) {

    /**
     * @method getResourceElement
     * @summary Returns a resource element wrapper specific to the resource and
     *     mime type provided. This routine leverages getResourceURI to locate
     *     the source URI and then loads and wraps its content as needed.
     * @param {String} resource The resource name. Typically template, style,
     *     theme, etc. but it could be essentially anything except the word
     *     'resource' (since that would trigger a recursion).
     * @param {String} mimeType The mimeType for the resource being looked up.
     * @returns {TP.core.ElementNode} The wrapped element containing the
     *     content.
     */

    var uri,
        src,
        str,
        doc,
        openingTag,
        updatedOpeningTag,
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
    str = uri.getResourceText(TP.hc('async', false));

    //  If the markup author didn't provide a default namespace, we'll try to
    //  default it here by rewriting the opening tag.
    if (TP.notEmpty(openingTag = TP.regex.OPENING_TAG.exec(str).at(0))) {
        //  TODO: This should not be hardcoded to assume the default namespace
        //  is XHTML - we should at least be trying to look it up based on the
        //  file extension.

        if (!/xmlns=/.test(openingTag)) {
            // Watch out for <blah/> vs <blah> here...
            if (TP.regex.CLOSED_TAG.match(str)) {
                str = str.slice(0, -2) +
                    ' xmlns="' + TP.w3.Xmlns.XHTML + '"/>';
            } else {
                updatedOpeningTag =
                    TP.regex.OPENING_TAG.exec(str).at(0).slice(0, -1) +
                    ' xmlns="' + TP.w3.Xmlns.XHTML + '">';
                str = str.replace(openingTag, updatedOpeningTag);
            }
        }
    }

    doc = TP.documentFromString(str, null, true);

    //  Make sure that the resource had real markup that could be built as such.
    if (!TP.isDocument(doc) || !TP.isElement(elem = doc.documentElement)) {
        //  TODO: Raise an exception
        return this;
    }

    //  If we were able to load a real document from the source URI stamp that
    //  path on the resulting element so we have it for reference.
    if (TP.notEmpty(src)) {
        TP.elementSetAttribute(elem, 'tibet:src', src, true);
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
function(resource, mimeType) {

    /**
     * @method getResourceURI
     * @summary Returns a resource URI specific to the receiver for the named
     *     resource and mimeType. This method is used to look up template,
     *     style, theme, and other resource URIs by leveraging methods on the
     *     receiver specific to each resource/mime requirement.
     * @param {String} resource The resource name. Typically 'template',
     *     'style', 'theme', etc. but it could be essentially anything except
     *     the word 'resource' (since that would trigger a recursion).
     * @param {String} mimeType The mimeType for the resource being looked up.
     *     This is used to locate viable extensions based on the data in TIBET's
     *     TP.ietf.Mime.INFO dictionary.
     * @returns {TP.core.URI} The computed resource URI.
     */

    var method,
        uri,
        extensions,
        len,
        i,
        ext,
        typeName,
        key,
        value;

    if (!TP.isString(resource) || TP.isEmpty(resource) ||
            resource === 'resource') {
        return this.raise('TP.sig.InvalidParameter',
            'Must supply a valid resource name.');
    }

    //  If we can build a getter for the resource in question we'll rely on that
    //  method to do the right thing for that resource.
    method = 'get' + resource.asTitleCase() + 'URI';
    if (TP.canInvoke(this, method)) {
        uri = this[method](mimeType);
    } else {
        uri = this.get(resource.toLowerCase() + 'URI');
    }

    // For resource methods there are a lot of default versions which return
    // null so we don't assume we're done here unless we got a real value
    // that's not TP.NO_RESULT. That value is used to say "stop".
    if (TP.notEmpty(uri)) {
        if (uri === TP.NO_RESULT) {
            return;
        }

        return uri;
    }

    // Extensions are typically ordered from canonical to least-likely so we
    // loop here trying to find a method specific to the MIME extension.
    if (TP.notEmpty(mimeType) &&
            TP.notEmpty(extensions = TP.ietf.Mime.getExtensions(mimeType))) {

        len = extensions.length;
        for (i = 0; i < len; i++) {
            ext = extensions.at(i);

            // The word resource would trigger a recursion so mask off that one.
            if (ext === 'resource') {
                return;
            }

            method = 'get' + ext.asTitleCase() + 'URI';
            if (TP.canInvoke(this, method)) {
                uri = this[method]();
            } else {
                uri = this.get(ext.toLowerCase() + 'URI');
            }

            if (TP.notEmpty(uri)) {
                if (uri === TP.NO_RESULT) {
                    return;
                }

                return uri;
            }
        }
    }

    // Final option if no method is found is to create a configuration key and
    // see if there's a mapping under that key.
    typeName = this.getResourceTypeName();
    key = 'path.' + typeName + '.' + resource.toLowerCase();
    value = TP.sys.cfg(key);

    if (TP.notEmpty(value)) {
        return TP.uc(value);
    }

    return;
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

TP.core.ElementNode.Type.defineMethod('guessContentTypeAndLocation',
function(anElement) {

    /**
     * @method guessContentTypeAndLocation
     * @summary Retrieves (and caches on the receiver) the MIME type and
     *     location of the receiver's content.
     * @description This method guesses the receiver's content type and
     *     location, if the receiver has external content. It then populates
     *     that information on the 'tibet:src' and 'tibet:mime' attributes.
     * @param {Element|TP.core.ElementNode} anElement The element to guess the
     *     type and location for.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var elem,
        src,

        mime,
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
    src = TP.elementGetAttribute(elem, 'tibet:src', true);
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

            mimeTypes.perform(
                    function(aMIMEType) {

                        uri = this.getResourceURI('template', aMIMEType);

                        if (TP.isURI(uri)) {
                            src = uri.getLocation();
                            mime = aMIMEType;

                            return TP.BREAK;
                        }
                    }.bind(this));
        }
    }

    if (TP.notEmpty(src)) {
        TP.elementSetAttribute(elem, 'tibet:src', src, true);
    }

    if (TP.notEmpty(mime)) {
        TP.elementSetAttribute(elem, 'tibet:mime', mime, true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('handleSignal',
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
    observer = this.getNativeObserver(aSignal);

    if (TP.notValid(observer)) {
        return this.raise('TP.sig.InvalidHandler',
                            'Unable to obtain observer.');
    }

    return TP.handle(observer, aSignal);
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

TP.core.ElementNode.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @method shouldAutoWrapItems
     * @summary Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.lang.Hash} formatArgs An optional object containing
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
//  Awakening Methods
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

    TP.stop('break.awaken_content');

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  Allocate a tag processor and initialize it with the ATTACH_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.ATTACH_PHASES);

    //  Process the tree of markup
    processor.processTree(aNode);

    //  Signal from the node that attach processing is complete.
    TP.signal(TP.gid(aNode), 'TP.sig.AttachProcessingComplete');

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

TP.core.ElementNode.Type.defineMethod('tagUnmarshal',
function(aRequest) {

    /**
     * @method tagUnmarshal
     * @summary Unmarshals the receiver's content. This includes resolving XML
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
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, and will use calls to
     *     actually set the attribute into that namespace. Default is false (to
     *     keep things faster).
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

    retVal = TP.elementAddAttributeValue(natNode,
                                            attributeName, attributeValue,
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

        retVal,
        newValue;

    natNode = this.getNativeNode();

    oldValue = TP.elementGetClass(natNode);

    retVal = TP.elementAddClass(natNode, className);

    newValue = TP.elementGetClass(natNode);

    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(natNode, TP.ATTR + 'class', TP.UPDATE);
    }

    this.changed('@class',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldValue,
                            TP.NEWVAL, newValue));

    return retVal;
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
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName) &&
                !TP.regex.ATTRIBUTE.test(attributeName)) {
        path = TP.apc(attributeName).set('shouldCollapse', true);
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
        funcName = 'get' + attributeName.asStartUpper();
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
        funcName = 'is' + attributeName.asStartUpper();
        if (TP.isMethod(this[funcName])) {
            return this[funcName]();
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how, if we were given more than 1 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 1) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource());
        } else {
            args = TP.ac(this.getPathSource(), this.getPathParameters());
        }

        //  Make sure to TP.wrap() the return value for consistent results
        return TP.wrap(path.executeGet.apply(path, args));
    }

    //  let the standard mechanism handle it
    return this.getProperty(attributeName);
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

        retVal,
        newValue;

    natNode = this.getNativeNode();

    oldValue = TP.elementGetClass(natNode);

    retVal = TP.elementRemoveClass(natNode, className);

    newValue = TP.elementGetClass(natNode);

    if (this.shouldFlagChanges()) {
        TP.elementFlagChange(natNode, TP.ATTR + 'class', TP.DELETE);
    }

    this.changed('@class',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldValue,
                            TP.NEWVAL, newValue));

    return retVal;
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

        funcName,

        args;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName) &&
                !TP.regex.ATTRIBUTE.test(attributeName)) {
        path = TP.apc(attributeName).set('shouldCollapse', true);
    }

    if (TP.notValid(path)) {

        //  optimize for attribute access when prefix indicates (but not for
        //  '@*' paths where the caller wants all attributes).
        if (TP.regex.ATTRIBUTE.test(attributeName) &&
            !TP.regex.ATTRIBUTE_ALL.test(attributeName)) {
            return this.setAttribute(attributeName.slice(1), attributeValue);
        }

        //  try common naming convention first
        funcName = 'set' + attributeName.asStartUpper();
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
            funcName = 'is' + attributeName.asStartUpper();
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
            args.atPut(0, this.getPathSource());
        } else {
            args = TP.ac(this.getPathSource(), attributeValue, shouldSignal,
                            this.getPathParameters());
        }

        return path.executeSet.apply(path, args);
    }

    //  let the standard method handle it
    return this.setProperty(attributeName, attributeValue, shouldSignal);
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
     * @param {Boolean} shouldSignal Should changes be notified. If false changes
     *     are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.core.Node} The receiver.
     */

    var newValue,
        flag;

    newValue = this.produceValue(aValue);

    this.setContent(newValue);

    //  signal as needed

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.changed('value', TP.UPDATE);
    }

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
    natElem = this.$$getNativeNodeFast();

    if (TP.isBoolean(aFlag)) {
        if (TP.notTrue(aFlag)) {
            TP.elementRemoveAttribute(natElem, 'tibet:shouldFlagChanges');
            //  turn it off
            if (!this.isTransactional()) {
                this.$set('getNativeNode',
                            this.$$getNativeNodeFast,
                            false);
            }
        } else {
            TP.elementSetAttribute(
                    natElem, 'tibet:shouldFlagChanges', true);
            this.$set('getNativeNode',
                        this.$$getNativeNodeSlow,
                        false);
        }
    }

    return TP.elementGetAttribute(natElem, 'tibet:shouldFlagChanges') ===
                    'true';
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('shouldSignalChange',
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
    //  native element node.

    var natElem;

    //  Notice here how we use the 'fast' native node get method to avoid any
    //  sorts of recursion issues.
    natElem = this.$$getNativeNodeFast();

    if (TP.isBoolean(aFlag)) {
        if (TP.notTrue(aFlag)) {
            delete natElem[TP.SHOULD_SIGNAL_CHANGE];

            return false;
        } else {
            natElem[TP.SHOULD_SIGNAL_CHANGE] = true;

            return true;
        }
    }

    //  when suspended is true we always return false which allows an
    //  override to succeed
    if (natElem[TP.SHOULD_SUSPEND_SIGNALING] === true) {
        return false;
    }

    return natElem[TP.SHOULD_SIGNAL_CHANGE] === true;
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

        //  fallback here is to use TP.byOID which means we can use TIBET URI
        //  references (or standard URIs for that matter) so that dispatch
        //  is "cross-document" (think iframes :))
        if (!TP.isElement(targetElem)) {
            targetElem = TP.byOID(aTarget);

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
    return TP.dispatch(null,        //  'V' will be computed from targetElem
                        aSignal,
                        targetElem,
                        argsOrEvent,
                        aPolicy,
                        isCancelable,
                        isBubbling);
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
 * @The methods here provide support for display and storage formatting offield
 *     data as well as general-purpose data validation.
 *
 *     TIBET formatters work in chains, successively processing the value. This
 *     allows you to reuse formatters more effectively. The xctrls:saveas and
 *     xctrls:showas attributes accept whitespace-separated type names whichwill
 *     be used to format the output of the previous formatter in the list.
 *
 *     The type validation process here is general purpose in the sense that
 *     sinceboth model and UI elements ultimately have TP.core.Node wrappers
 *     they canboth benefit from type checks. There are two mechanisms for
 *     validation: XMLSchema and TIBET-specific types. Both offer advantages and
 *     disadvantages butthe nice thing is you can mix them in the same
 *     environment if you need to.
 *
 *     When using XML Schema simply put xsi:type attributes on the elements you
 *     wish to constrain, or use the xctrls:type attribute to access TIBET
 *     types.The xctrls:type attribute takes a list of types separated by either
 *     a spaceor vertical bar (|). When separated by spaces all types must agree
 *     the valueis valid, when separated by a vertical bar only one of the types
 *     must agree.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$formatValue',
function(aValue, attributeName) {

    /**
     * @method $formatValue
     * @summary Formats a value using the formatter list in the attribute
     *     provided.
     * @description The value provided is formatted based on the rules of the
     *     formatter type(s) found in the attribute provided. Note that even
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
     * @param {String} attributName An attribute name containing formatters.
     * @returns {String} The formatted value.
     */

    var result,
        value,
        formats,
        i,
        len;

    TP.stop('break.bind_format');

    //  nothing to do?
    if (TP.isEmpty(formats = this.getAttribute(attributeName, true))) {
        return aValue;
    }

    value = aValue;

    //  if the formats represent a list we've got to do more work, but we
    //  want to move fast on the most common case (1 value, 1 format)
    if (!TP.regex.MULTI_VALUED.test(formats)) {
        if (!TP.isCollection(value)) {
            result = TP.format(value, formats);
            value = TP.notValid(result) ? value : result;

            return value;
        } else {
            //  multiple values but one format. iteration is easiest
            return value.collect(
                    function(item) {

                        var val;

                        val = TP.format(item, formats);
                        val = TP.notValid(val) ? item : val;

                        return val;
                    });
        }
    }

    formats = formats.split(' ');
    len = formats.getSize();

    try {
        if (!TP.isCollection(value)) {
            //  one value, multiple formats -- second most common case,
            //  basically a format chain
            for (i = 0; i < len; i++) {
                value = TP.format(value, formats.at(i));
            }

            value = TP.notValid(value) ? aValue : value;

            return value;
        } else {
            //  multiple values w/multiple formatters, rare but possible
            value = value.collect(
                    function(item) {

                        var j,
                            val;

                        val = item;
                        for (j = 0; j < len; j++) {
                             val = TP.format(val, formats.at(j));
                        }

                        val = TP.notValid(val) ? item : val;

                        return val;
                    });
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Formatting error.'),
                        TP.LOG) : 0;

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

    TP.stop('break.validate');

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
                    TP.error(TP.ec(e, 'Validation error.'),
                        TP.LOG) : 0;

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
                    TP.error(TP.ec(e, 'Validation error.'),
                        TP.LOG) : 0;

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

//  ========================================================================
//  TP.core.TextNode
//  ========================================================================

TP.core.Node.defineSubtype('TextNode');

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
     *     TP.core.ProcessingInstructionNode itself. The lookup process first
     *     calculates a type name by acquiring the PI's name, title casing that
     *     name, making its first character be uppercase, and stripping it of
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

    if (TP.isType(type)) {
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
        docElem,

        sheetPath,

        hrefValue,
        url,

        styleTPDoc,

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

    //  If there's no document element, then just exit... nothing to do
    //  here.
    if (!TP.isElement(docElem = doc.documentElement)) {
        return TP.CONTINUE;
    }

    //  See if the document element has a 'tibet:src' attribute. If so, we
    //  can try to use it to provide a collection path (if the sheet needs
    //  it - i.e. it's not an absolute path).
    if (TP.elementHasAttribute(docElem, 'tibet:src', true)) {
        sheetPath = TP.uriCollectionPath(
                        TP.elementGetAttribute(docElem, 'tibet:src', true));
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
    styleTPDoc = url.getResource(TP.hc('async', false, 'resultType', TP.WRAP));
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

    //  If we got an XSLT TP.core.Node, do the transform and get the result.
    if (TP.isKindOf(styleTPDoc, 'TP.core.XSLDocumentNode')) {
        resultNode = TP.node(
                        TP.unwrap(styleTPDoc.transform(docElem, aRequest)));
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
    doc.replaceChild(resultNode, docElem);

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
                if (TP.isType(type = TP.sys.require(name))) {
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
        if (TP.isType(type = TP.sys.require(name))) {
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
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName).set('shouldCollapse', true);
    }

    if (TP.notValid(path)) {

        //  We can shortcut barename IDs by evaluating just the barename syntax
        if (TP.regex.BARENAME.test(attributeName)) {
            //  Make sure to TP.wrap() the return value for consistent results
            return TP.wrap(TP.nodeEvaluateBarename(this.getNativeNode(),
                                                    attributeName));
        }

        //  try common naming convention
        funcName = 'get' + attributeName.asStartUpper();
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
        funcName = 'is' + attributeName.asStartUpper();
        if (TP.isMethod(this[funcName])) {
            return this[funcName]();
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how, if we were given more than 1 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 1) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource());
        } else {
            args = TP.ac(this.getPathSource(), this.getPathParameters());
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
    if (TP.isURI(url)) {
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
     * @returns {html:body} The 'body' element of the receiver.
     */

    var doc;

    if (!TP.isDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    return TP.wrap(TP.documentGetBody(doc));
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

TP.core.HTMLDocumentNode.Inst.defineMethod('getHead',
function() {

    /**
     * @method getHead
     * @summary Returns the TP.core.ElementNode that represents the 'head'
     *     element in this document.
     * @exception TP.sig.InvalidDocument
     * @returns {html:head} The 'head' element of the receiver.
     */

    var doc;

    if (!TP.isDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    return TP.wrap(TP.documentGetHead(doc));
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

    var doc;

    if (!TP.isDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    return TP.nodeGetWindow(doc);
});

//  ------------------------------------------------------------------------

TP.core.HTMLDocumentNode.Inst.defineMethod('handleDOMClose',
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
     * @returns {html:body} The 'body' element of the receiver.
     */

    var doc;

    if (!TP.isDocument(doc = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidDocument');
    }

    return TP.wrap(TP.documentGetBody(doc));
});

//  ------------------------------------------------------------------------

TP.core.XHTMLDocumentNode.Inst.defineMethod('getHead',
function() {

    /**
     * @method getHead
     * @summary Returns the TP.core.ElementNode that represents the 'head'
     *     element in this document.
     * @exception TP.sig.InvalidDocument
     * @returns {html:head} The 'head' element of the receiver.
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

TP.core.XHTMLDocumentNode.Inst.defineMethod('handleDOMClose',
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
     * @param {TP.lang.Hash|TP.sig.Request} aParamHash A parameter container
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

    TP.stop('break.content_transform');

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
//  TP.core.ActionElementNode
//  ========================================================================

/**
 * @type {TP.core.ActionElementNode}
 * @summary TP.core.ActionElementNode is the supertype for all action elements
 *     in the TIBET framework. Action nodes are found most typically in
 *     association with XControls and the various TIBET shells where they serve
 *     as "xml macros" for various JavaScript operations or commands.
 * @description An action element is essentially a "macro" encoded in tag form.
 *     The XForms specification defines a number of these tags and TIBET extends
 *     this concept as part of the TIBET Shell (TSH).
 *
 *     Because of their use in visual markup as well as TIBET scripts action
 *     tags provide both a signaling interface and a direct invocation
 *     interface. The signaling interface simply defers to the direct invocation
 *     approach, so you'll normally just implement an act() method on your
 *     action element with a request object as the first parameter. Note that
 *     like much of TIBET's other APIs a request in this contect can be a
 *     TP.sig.Request or a simple hash of parameter values.
 */
//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('ActionElementNode');

//  can't construct concrete instances of this
TP.core.ActionElementNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the default request type to use for construction of a request
TP.core.ActionElementNode.Type.defineAttribute('requestType', 'TP.sig.Request');

//  an optional name which refines the request by altering its name
TP.core.ActionElementNode.Type.defineAttribute('requestName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('canAct',
function(aNode) {

    /**
     * @method canAct
     * @summary Returns true if the node provided is 'actionable' based on ACL
     *     permissions for the current user.
     * @param {Node} aNode A native node to test for ACL restrictions.
     * @returns {Boolean} True if the action can proceed.
     */

    var actionable,
        attrs,

        rkeys,
        ekeys,

        len,
        i,
        attr;

    //  presume true
    actionable = true;

    //  one interesting thing here is that we tie action execution into ACL
    //  checks, restricting script/command access based on ACL keys
    if (TP.notEmpty(attrs = TP.elementGetAttributeNodes(aNode, 'acl:*'))) {
        rkeys = TP.sys.getRealUser().getAccessKeys();
        ekeys = TP.sys.getEffectiveUser().getAccessKeys();

        len = attrs.getSize();

        for (i = 0; i < len; i++) {
            attr = attrs[i];
            switch (attr.name) {
                case 'acl:if_real':

                    //  only if rkeys contains this key
                    actionable = false;
                    if (rkeys.containsAny(attr.value.split(' '))) {
                        actionable = true;
                    }

                    break;

                case 'acl:if_effective':

                    //  only if ekeys contains this key
                    actionable = false;
                    if (ekeys.containsAny(attr.value.split(' '))) {
                        actionable = true;
                    }

                    break;

                case 'acl:unless_real':

                    //  unless rkeys contains these keys
                    if (rkeys.containsAny(attr.value.split(' '))) {
                        actionable = false;
                    }

                    break;

                case 'acl:unless_effective':

                    //  unless ekeys contains these keys
                    if (ekeys.containsAny(attr.value.split(' '))) {
                        actionable = false;
                    }

                    break;
            }
        }
    }

    return actionable;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidFilter');

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSource');

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Runs the receiver, effectively invoking its action.
     * @description This method is invoked any time a tag is being run as part
     *     of the processing of an enclosing tsh:script, which happens most
     *     often when the tag is being run interactively. When being run
     *     interactively the tag will execute when no ev:event is defined which
     *     implies processing should wait for that event.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. TP.CONTINUE and TP.BREAK are common values.
     */

    var interactive,
        node,
        str;

    interactive = TP.ifKeyInvalid(aRequest, 'cmdInteractive', false);
    if (interactive) {
        node = aRequest.at('cmdNode');
        if (TP.notEmpty(TP.elementGetAttribute(node, 'ev:event', true))) {
            str = TP.wrap(node).asString();

            //  Output with asIs false will echo the tag for display.
            aRequest.stdout(str,
                        TP.hc('cmdBox', false, 'cmdAsIs', false,
                        'cmdAppend', true, 'cmdEcho', true));

            //  Have to output the action to get it into the DOM for
            //  awakening etc, otherwise it can't register/run.
            aRequest.stdout(str,
                        TP.hc('cmdBox', false, 'cmdAsIs', true,
                            'cmdEcho', true));

            aRequest.set('result', str);
            aRequest.complete();

            return TP.CONTINUE;
        }
    }

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidTransform');

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('getActionInput',
function(aRequest) {

    /**
     * @method getActionInput
     * @summary Returns either the request's standard input or the receiver's
     *     'primary argument'.
     * @param {TP.sig.Request} aRequest The request to check for stdin.
     * @returns {Object} The input data.
     */

    var node,
        input;

    if (!TP.isNode(node = aRequest.at('cmdNode'))) {
        return;
    }

    if (TP.notEmpty(input = aRequest.stdin())) {
        //  stdin is always an array, so we can just return it
        return input;
    } else {
        input = this.getPrimaryArgument(aRequest);
    }

    if (TP.isValid(input)) {
        input = TP.ac(input);
    }

    return input;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('getActionParam',
function(aRequest, parameterName) {

    /**
     * @method getActionParam
     * @summary Checks the receiver for child <param> tags and returns the
     *     value associated with the named parameter if found.
     * @param {TP.sig.Request} aRequest The request being processed.
     * @param {String} parameterName The name of the parameter to find.
     * @returns {String} The parameter value, if any.
     */

    var shell;

    shell = aRequest.at('cmdShell');
    if (TP.notValid(shell)) {
        this.raise('TP.sig.InvalidRequest',
                    'No cmdShell in request.');

        return;
    }

    return shell.getParam(aRequest, parameterName);
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('getPrimaryArgument',
function(aRequest) {

    /**
     * @method getPrimaryArgument
     * @summary Returns the value of the receiver's primary argument, which
     *     must be named by the return value of getPrimaryArgumentName(). By
     *     default action tags return null here due to there being no default
     *     for getPrimaryArgumentName. Overriding that method to provide a valid
     *     name is usually sufficient.
     * @param {TP.sig.Request} aRequest The request being processed.
     * @returns {Object} The argument data.
     */

    var name,
        shell;

    if (TP.isEmpty(name = this.getPrimaryArgumentName())) {
        return;
    }

    shell = aRequest.at('cmdShell');
    if (TP.isValid(shell)) {
        //  NB: We supply 'null' here as the default value
        return shell.getArgument(aRequest, name, null, true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('getPrimaryArgumentName',
function() {

    /**
     * @method getPrimaryArgumentName
     * @summary Returns the primary argument name, which by default is null.
     *     For action tags this method typically must be overridden or the
     *     getPrimaryArgument() and getActionInput() calls will typically fail
     *     to return useful results.
     * @returns {String} The argument name.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('showDebug',
function(aRequest, expandArguments, resolveArguments) {

    /**
     * @method showDebug
     * @summary Prints debugging information about the tag, including the full
     *     XML information that got generated when the source code was
     *     'desugared' and all different values of the passed arguments.
     * @param {TP.sig.Request} aRequest The shell request to print debugging
     *     information for.
     * @param {Boolean} expandArguments Whether or not to show the 'expanded'
     *     value for arguments. The default is true.
     * @param {Boolean} resolveArguments Whether or not to show the 'resolved'
     *     value for arguments. The default is false.
     */

    var shell,

        requestKeys,
        reportHash,

        payload,

        argsReportHash,

        attrs,
        len,
        i,

        item,
        name,

        values,
        originalValue,

        valueDict,

        expandedValue,
        expandedTN,

        j,

        resolvedValue,
        resolvedTN;

    TP.stop('break.tsh_uri');

    shell = aRequest.at('cmdShell');

    reportHash = TP.hc();

    payload = aRequest.getPayload();
    requestKeys = payload.getKeys();

    len = requestKeys.getSize();
    for (i = 0; i < len; i++) {
        reportHash.atPut(
            requestKeys.at(i),
            TP.xmlLiteralsToEntities(TP.str(payload.at(requestKeys.at(i)))));
    }

    argsReportHash = TP.hc();

    //  all parameters should be named, those with tsh: prefixes are used
    //  by the enclosing request.
    attrs = shell.getArguments(aRequest, true).getItems();
    len = attrs.getSize();
    for (i = 0; i < len; i++) {

        item = attrs.at(i);

        name = item.first();

        if (/^ARGV/.test(name)) {

            values = item.last();

            for (j = 0; j < values.getSize(); j++) {

                originalValue = values.at(j).first();
                valueDict = TP.hc(
                    'Original value tname', TP.tname(originalValue),
                    'Original value', originalValue);

                if (TP.notFalse(expandArguments)) {
                    expandedValue = values.at(j).last();

                    if (TP.notDefined(expandedValue)) {
                        expandedValue = TP.UNDEF;
                        expandedTN = 'Undefined';
                    } else if (TP.isNull(expandedValue)) {
                        expandedValue = TP.NULL;
                        expandedTN = 'Null';
                    } else {
                        expandedTN = TP.tname(expandedValue);
                    }

                    valueDict.add(
                        'Expanded value tname', expandedTN,
                        'Expanded value', expandedValue);
                }

                if (TP.isTrue(resolveArguments)) {

                    resolvedValue = shell.resolveObjectReference(
                                        expandedValue, aRequest);

                    if (TP.notDefined(resolvedValue)) {
                        resolvedValue = TP.UNDEF;
                        resolvedTN = 'Undefined';
                    } else if (TP.isNull(resolvedValue)) {
                        resolvedValue = TP.NULL;
                        resolvedTN = 'Null';
                    } else {
                        resolvedTN = TP.tname(resolvedValue);
                    }

                    valueDict.add(
                        'Resolved value tname', resolvedTN,
                        'Resolved value', resolvedValue);
                }

                argsReportHash.atPut(
                    name + '[' + j + ']',
                    valueDict);
            }
        } else {
            originalValue = item.last().first();
            valueDict = TP.hc(
                'Original value tname', TP.tname(originalValue),
                'Original value', originalValue);

            if (TP.notFalse(expandArguments)) {
                expandedValue = item.last().last();

                if (TP.notDefined(expandedValue)) {
                    expandedValue = TP.UNDEF;
                    expandedTN = 'Undefined';
                } else if (TP.isNull(expandedValue)) {
                    expandedValue = TP.NULL;
                    expandedTN = 'Null';
                } else {
                    expandedTN = TP.tname(expandedValue);
                }

                valueDict.add(
                    'Expanded value tname', expandedTN,
                    'Expanded value', expandedValue);
            }

            if (TP.isTrue(resolveArguments)) {
                resolvedValue = shell.resolveObjectReference(
                                        expandedValue, aRequest);

                if (TP.notDefined(resolvedValue)) {
                    resolvedValue = TP.UNDEF;
                    resolvedTN = 'Undefined';
                } else if (TP.isNull(resolvedValue)) {
                    resolvedValue = TP.NULL;
                    resolvedTN = 'Null';
                } else {
                    resolvedTN = TP.tname(resolvedValue);
                }

                valueDict.add(
                    'Resolved value tname', resolvedTN,
                    'Resolved value', resolvedValue);
            }

            argsReportHash.atPut(
                name,
                valueDict);
        }
    }

    reportHash.atPut('ARGS:', argsReportHash);

    aRequest.stdout(reportHash);

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  Default for action tags is to not be transformed, but to have a
    //  'tibet-action' CSS class added to their markup.

    elem = aRequest.at('node');
    TP.elementAddClass(elem, 'tibet-action');

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. TP.CONTINUE and TP.BREAK are common values.
     */

    //  Typically this is overridden.
    return TP.DESCEND;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('act',
function(aSignal) {

    /**
     * @method act
     * @summary Performs the action the receiver is responsible for. This
     *     method should be overridden in subtypes to provide concrete behavior.
     * @description The act method is typically invoked indirectly by the handle
     *     functionality found in this type, however you can invoke it directly
     *     when you've got a handle to a specific action element. When invoked
     *     via handle the signal which is currently being processed is provided
     *     as the first argument.
     * @param {TP.sig.Signal} aSignal The signal instance which triggered this
     *     activity. Only valid when being invoked in response to a handle call.
     * @returns {TP.core.ActionElementNode} The receiver.
     */

    var request,
        shell;

    //  not all action invocations go through handle* so we'll break here
    TP.stop('break.tsh_action');

    //  check with the type to see if we can run
    if (TP.notTrue(this.getType().canAct(this.getNativeNode()))) {
        return this;
    }

    request = this.constructActRequest(aSignal);

    shell = TP.core.TSH.getDefaultInstance();
    shell.handleShellRequest(request);

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('constructActRequest',
function(aSignal) {

    /**
     * @method constructActRequest
     * @summary Returns a TP.sig.Request subtype instance suitable for the
     *     receiver's requirements. This is typically a TP.sig.ShellRequest so
     *     the TIBET Shell can be used to process/execute the tag.
     * @param {TP.sig.Signal|TP.lang.Hash} aSignal A signal or hash containing
     *     parameter data.
     * @returns {TP.sig.Request} A proper TP.sig.Request for the action.
     */

    return TP.sig.ShellRequest.construct(
                    TP.hc('cmdLiteral', true,
                            'cmdNode', this.getNativeNode(),
                            'cmdExecute', true,
                            'cmdPhases', 'Execute',
                            'cmdSilent', true,
                            'cmdTrigger', aSignal,
                            TP.STDIN, TP.ac(aSignal.get('payload'))
                    ));
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('getActionParam',
function(aRequest, parameterName) {

    /**
     * @method getActionParam
     * @summary Checks the receiver for child <param> tags and returns the
     *     value associated with the named parameter if found.
     * @param {TP.sig.Request} aRequest The request being processed.
     * @param {String} parameterName The name of the parameter to find.
     * @returns {String} The parameter value, if any.
     */

    return this.getType().getActionParam(aRequest, parameterName);
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('getRequestName',
function() {

    /**
     * @method getRequestName
     * @summary Returns the request name used for this service when no override
     *     has been given on the element.
     * @returns {String} A specific request name.
     */

    return this.getType().get('requestName');
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('getRequestType',
function() {

    /**
     * @method getRequestType
     * @summary Returns the request type used for this service when no override
     *     has been given on the element.
     * @returns {TP.sig.Request} A specific request type.
     */

    var name,
        type;

    name = this.getType().get('requestType') || 'TP.sig.Request';

    type = TP.sys.require(name);
    if (TP.notValid(type)) {
        this.raise('TP.sig.InvalidType',
                    'Request type not found for: ' + this.asString());

        type = TP.sig.Request;
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('getDownstreamSegment',
function() {

    /**
     * @method getUpstreamSegment
     * @summary Returns the 'downstream' segment for this action - that is, any
     *     following action element in a command sequence.
     * @returns {TP.core.ActionElementNode|null} The downstream segment of this
     *     action or null if it's the last segment.
     */

    var retVal;

    retVal = this.detectSibling(
                function(aNode) {
                    if (TP.isElement(aNode) &&
                        TP.elementGetLocalName(aNode) === 'cmd') {
                            return true;
                        }

                    return false;
                },
                TP.NEXT);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('getUpstreamSegment',
function() {

    /**
     * @method getUpstreamSegment
     * @summary Returns the 'upstream' segment for this action - that is, any
     *     preceding action element in a command sequence.
     * @returns {TP.core.ActionElementNode|null} The upstream segment of this
     *     action or null if it's the first segment.
     */

    var retVal;

    retVal = this.detectSibling(
                function(aNode) {
                    if (TP.isElement(aNode) &&
                        TP.elementGetLocalName(aNode) === 'cmd') {
                            return true;
                        }

                    return false;
                },
                TP.PREVIOUS);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('getRedirectionType',
function() {

    /**
     * @method getRedirectionType
     * @summary Returns what kind of redirection type, if any, the receiver
     *     has.
     * @returns {Constant} One of the following: TP.ADD, TP.GET, TP.SET,
     *     TP.FILTER, TP.TRANSFORM (or TP.NONE if there is no redirection)
     */

    var pipe;

    pipe = this.getAttribute('tsh:pipe', true);

    if (TP.TSH_ADD_PIPES.contains(pipe)) {
        return TP.ADD;
    } else if (TP.TSH_GET_PIPES.contains(pipe)) {
        return TP.GET;
    } else if (TP.TSH_SET_PIPES.contains(pipe)) {
        return TP.SET;
    } else if (TP.TSH_FILTER_PIPES.contains(pipe)) {
        return TP.FILTER;
    } else if (TP.TSH_TRANSFORM_PIPES.contains(pipe)) {
        return TP.TRANSFORM;
    }

    return TP.NONE;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('isLastSegment',
function() {

    /**
     * @method isLastSegment
     * @summary Returns whether or not this node is the last 'segment' of
     *     commands in a script.
     * @returns {Boolean} Whether or not this is the 'last segment' of a script.
     */

    return TP.notValid(this.getDownstreamSegment());
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('handleSignal',
function(aSignal) {

    /**
     * @method handleSignal
     * @summary Responds to an inbound signal by running the receiver's
     *     action(s) via the act() method.
     * @param {TP.sig.Signal} aSignal The signal instance which triggered this
     *     call.
     */

    var sig;

    if (this.shouldSignalChange()) {
        sig = this.signal('TP.sig.WillRun');
        if (sig.shouldPrevent()) {
            return;
        }
    }

    try {
        this.act(aSignal);
    } catch (e) {
    } finally {
        if (this.shouldSignalChange()) {
            this.signal('TP.sig.DidRun');
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('isOutermostAction',
function() {

    /**
     * @method isOutermostAction
     * @summary Returns true if the receiver is the outermost action handler
     *     (not '<action> element).
     * @description The XForms specification states the when an action handler
     *     is the outermost handler model updates occur immediately, but when
     *     enclosed in an action element they can have a deferred update effect.
     *     The result is that all elements which can potentially defer their
     *     updates need to know if they're "outermost" so they know whether to
     *     message the model or simply flag it for later rebuild processing. We
     *     also allow action tags as children of ev:listeners and in that case
     *     we also consider them "nested" rather than top-most actions.
     * @returns {Boolean} True if the receiver is the top-most action.
     */

    var node,
        tag;

    node = this.getNativeNode();

    //  go up the parent chain and if we don't find an xctrls:action above
    //  us then we're outermost and should not defer model updating
    while (TP.isElement(node = node.parentNode) &&
            TP.isCallable(node.getAttribute)) {
        tag = TP.elementGetAttribute(node, 'tibet:tag', true);
        if ((tag === 'xctrls:action') || (tag === 'ev:listener')) {
            return false;
        }
    }

    return true;
});

//  ========================================================================
//  TP.core.InfoElementNode
//  ========================================================================

/**
 * @type {TP.core.InfoElementNode}
 * @summary TP.core.InfoElementNode is the supertype for all 'info' elements in
 *     the TIBET framework. Examples of info elements are acl:info, bind:info,
 *     drag:info, ev:info, and similar items which provide processing
 *     information but don't typically perform direct action in the way that a
 *     TP.core.ActionElementNode might.
 */
//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('InfoElementNode');

//  Can't construct concrete instances of this type.
TP.core.InfoElementNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.InfoElementNode.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

TP.core.InfoElementNode.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidFilter');

    return;
});

//  ------------------------------------------------------------------------

TP.core.InfoElementNode.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSource');

    return;
});

//  ------------------------------------------------------------------------

TP.core.InfoElementNode.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Runs the receiver, effectively invoking its action.
     * @description This method is invoked any time a tag is being run as part
     *     of the processing of an enclosing tsh:script, which happens most
     *     often when the tag is being run interactively. When being run
     *     interactively the tag will execute when no ev:event is defined which
     *     implies processing should wait for that event.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. TP.CONTINUE and TP.BREAK are common values.
     */

    var interactive,
        node,
        str;

    interactive = TP.ifKeyInvalid(aRequest, 'cmdInteractive', false);
    if (interactive) {
        node = aRequest.at('cmdNode');
        if (TP.notEmpty(TP.elementGetAttribute(node, 'ev:event', true))) {
            str = TP.wrap(node).asString();

            //  Output with asIs false will echo the tag for display.
            aRequest.stdout(str,
                            TP.hc('cmdBox', false, 'cmdAsIs', false,
                                'cmdAppend', true, 'cmdEcho', true));

            //  Have to output the action to get it into the DOM for
            //  awakening etc, otherwise it can't register/run.
            aRequest.stdout(str,
                            TP.hc('cmdBox', false, 'cmdAsIs', true,
                                'cmdEcho', true));

            aRequest.set('result', str);
            aRequest.complete();

            return TP.CONTINUE;
        }
    }

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.InfoElementNode.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

TP.core.InfoElementNode.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidTransform');

    return;
});

//  ------------------------------------------------------------------------

TP.core.InfoElementNode.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  Default for info tags is to not be transformed, but to have a
    //  'tibet-info' CSS class added to their markup.

    elem = aRequest.at('node');
    TP.elementAddClass(elem, 'tibet-info');

    return;

});

//  ========================================================================
//  TP.core.PipeSegmentElementNode
//  ========================================================================

/**
 * @type {TP.core.PipeSegmentElementNode}
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('PipeSegmentElementNode');

//  Can't construct concrete instances of this type.
TP.core.PipeSegmentElementNode.isAbstract(true);

//  ------------------------------------------------------------------------

TP.core.PipeSegmentElementNode.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @method cmdFilterInput
     * @summary Run when the receiver is being used in a filtering pipe.
     * @param {TP.sig.Request} aRequest The request to process.
     */

    this.processInput(aRequest, 'filterInput');

    return;
});

//  ------------------------------------------------------------------------

TP.core.PipeSegmentElementNode.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @method cmdTransformInput
     * @summary Run when the receiver is being used in a transforming pipe.
     * @param {TP.sig.Request} aRequest The request to process.
     */

    this.processInput(aRequest, 'transformInput');

    return;
});

//  ------------------------------------------------------------------------

TP.core.PipeSegmentElementNode.Type.defineMethod('filterInput',
function(anInput, cmdNode, aRequest) {

    /**
     * @method filterInput
     * @summary Filters an input object using information from the request
     *     provided. This method must be overridden by subtypes to avoid having
     *     an TP.sig.InvalidFilter exception raised.
     * @param {Object} anInput The object to test/filter.
     * @param {Node} cmdNode The original filtration node.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @exception TP.sig.InvalidFilter
     * @returns {Boolean} True if the object should remain in the output stream,
     *     false otherwise.
     */

    this.raise('TP.sig.InvalidFilter');

    return false;
});

//  ------------------------------------------------------------------------

TP.core.PipeSegmentElementNode.Type.defineMethod('getDefaultAction',
function(aRequest) {

    /**
     * @method getDefaultAction
     * @summary Returns the proper action name to use based on the pipe symbol
     *     being processed.
     * @param {TP.sig.Request} aRequest The request to process.
     * @returns {String} 'filterInput' or 'transformInput'.
     */

    var node,
        pipe;

    if (!TP.isElement(node = aRequest.at('cmdNode'))) {
        return;
    }

    pipe = TP.elementGetAttribute(node, 'tsh:pipe', true);
    if (/\?/.test(pipe)) {
        return 'filterInput';
    }

    return 'transformInput';
});

//  ------------------------------------------------------------------------

TP.core.PipeSegmentElementNode.Type.defineMethod('processInput',
function(aRequest, functionName) {

    /**
     * @method processInput
     * @summary Performs common processing of the input in terms of setting up
     *     a loop for iterating on splatted input, providing the proper
     *     collect/select branching for filtering vs. transforming, etc. This
     *     method is typically invoked for you and will call either filter() or
     *     transform() to do the real work of the receiving tag.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @param {String} functionName 'filterInput' or 'transformInput'.
     */

    var node,
        input,

        len,
        i,
        content,
        msg,
        result;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(node = aRequest.at('cmdNode'))) {
        msg = 'No action node.';
        aRequest.fail(msg);

        return;
    }

    //  Check input, and whether it's required.
    if (TP.notValid(input = this.getActionInput(aRequest))) {
        if (this.shouldFailOnEmptyInput()) {
            msg = 'No action input.';
            aRequest.fail(msg);

            return;
        } else {
            //  Mimic stdin, which provides an Array
            input = TP.ac();
        }
    }

    len = input.getSize();
    for (i = 0; i < len; i++) {
        content = input.at(i);
        if (TP.notValid(content)) {
            continue;
        }

        //  if we're splatted then the return/output variable is expected to
        //  be a collection rather than a single item
        if (aRequest.at('cmdIterate')) {
            if (TP.isCollection(content)) {
                switch (functionName) {
                    case 'filterInput':

                        //  even though the filter call can process things
                        //  in a loop we interpret the splat as a directive
                        //  to return an array of results rather than a
                        //  single string so we loop here
                        /* eslint-disable no-loop-func */
                        result = content.select(
                            function(item) {

                                return this.filterInput(item,
                                                        node,
                                                        aRequest);
                            }.bind(this));
                        /* eslint-enable no-loop-func */

                        break;

                    case 'transformInput':

                        //  even though the transform call can process
                        //  things in a loop we interpret the splat as a
                        //  directive to return an array of results rather
                        //  than a single string so we loop here
                        /* eslint-disable no-loop-func */
                        result = content.collect(
                            function(item) {

                                return this.transformInput(item,
                                                            node,
                                                            aRequest);
                            }.bind(this));
                        /* eslint-enable no-loop-func */

                        break;

                    default:

                        msg = 'Invalid operation: ' + functionName;
                        aRequest.fail(msg);

                        return;
                }
            } else {
                TP.ifWarn() ?
                    TP.warn('Splatting with non-collection content.',
                            TP.LOG) : 0;

                result = TP.ac(this[functionName](content, node, aRequest));
            }
        } else {
            //  no splat, no repeat
            result = this[functionName](content, node, aRequest);
        }
    }

    if (aRequest.didFail()) {
        //  If the request failed, it will have already printed the failure code
        //  and message. Make sure that any result is appended to any output so
        //  that it doesn't replace the failure code and/or message (and prepend
        //  any result with the label 'Result: ').
        aRequest.atPut('cmdAppend', true);
        aRequest.stdout(TP.sc('Result: ') + result);
    } else {
        aRequest.complete(result);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.PipeSegmentElementNode.Type.defineMethod('shouldFailOnEmptyInput',
function() {

    /**
     * @method shouldFailOnEmptyInput
     * @summary Returns true when the receiver's type will typically fail() any
     *     request which can't provide viable input data. The default is true.
     * @returns {Boolean} Whether processing should stop if input data is null
     *     or undefined.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.PipeSegmentElementNode.Type.defineMethod('transformInput',
function(anInput, cmdNode, aRequest) {

    /**
     * @method transformInput
     * @summary Transforms an input object using information from the request
     *     provided. This method must be overridden by subtypes to avoid having
     *     an TP.sig.InvalidTransform exception raised.
     * @param {Object} anInput The object to transform.
     * @param {Node} cmdNode The original transformation node.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @exception TP.sig.InvalidTransform
     * @returns {Object} The transformed input.
     */

    this.raise('TP.sig.InvalidTransform');

    return;
});

//  ------------------------------------------------------------------------

TP.core.PipeSegmentElementNode.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Run when the receiver is executed directly, or as part of a
     *     cmdRunContent invocation from the interactive shell. This method
     *     relies on the default action implied by the current pipe symbol to
     *     dispatch to the proper cmd*Input method.
     * @param {TP.sig.Request} aRequest The request to process.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue.
     */

    var action;

    action = this.getDefaultAction(aRequest);

    switch (action) {
        case 'filterInput':
            return this.cmdFilterInput(aRequest);
        case 'transformInput':
            return this.cmdTransformInput(aRequest);
        default:
            return TP.CONTINUE;
    }
});

//  ========================================================================
//  XSLT ELEMENTS
//  ========================================================================

TP.core.ElementNode.defineSubtype('xsl:Element');

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

TP.core.ElementNode.defineSubtype('xi:Element');

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
        content = url.getResource(TP.hc('async', false));
        content = TP.unwrap(content);
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

TP.core.ElementNode.defineSubtype('core:TemplatedNode');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation.
TP.core.TemplatedNode.isAbstract(true);

//  Whether or not the node wants a 'tsh:template' wrapper (necessary for
//  dynamic templating, etc.)
TP.core.TemplatedNode.Type.defineAttribute('wantsTemplateWrapper');

//  ------------------------------------------------------------------------

TP.core.TemplatedNode.Type.defineMethod('getTemplateURI',
function(mimeType) {

    /**
     * @method getTemplateURI
     * @summary Returns a template URI for the receiver. For templated nodes
     *     this routine should always return a valid URI.
     * @param {String} mimeType The mimeType for the resource being looked up.
     * @returns {TP.core.URI} The computed resource URI.
     */

    var uri;

    uri = this.$get('templateURI');
    if (TP.notEmpty(uri)) {
        if (uri === TP.NO_RESULT) {
            return;
        }

        return TP.uc(uri);
    }

    uri = this.computeResourceURI('template', mimeType);
    if (TP.isValid(uri)) {
        return TP.uc(uri);
    }

    return;
});

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

        genName,

        wantsTemplateWrapper,

        replacement,
        canonicalName;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  If the element already has a TP.GENERATOR, then it had to be placed here
    //  by some template in an earlier iteration. If the generator was ourself,
    //  return nothing, thereby causing elem to be untouched.
    if (TP.notEmpty(genName = elem[TP.GENERATOR]) &&
        genName === this.getCanonicalName()) {
        return;
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
        replacement = TP.documentCreateElement(
                            TP.nodeGetDocument(elem),
                            'tsh:template',
                            TP.w3.Xmlns.TSH);

        canonicalName = TP.elementGetCanonicalName(elem);

        //  Set the name of the replacement and the 'generator name' to be the
        //  canonical name of the templated element.
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
        replacement = this.getResourceElement(
                        'template',
                        TP.elementGetAttribute(elem, 'tibet:mime', true));

        replacement = TP.unwrap(replacement.clone());
        replacement[TP.GENERATOR] = canonicalName;

        //  Merge any remaining attributes. Note that we don't want to overwrite
        //  or duplicate any src attribute we had to compute.
        TP.elementMergeAttributes(elem, replacement);
    }

    //  Replace the original element in the DOM so processing will continue in
    //  the proper context.
    replacement = TP.elementReplaceWith(elem, replacement);

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
    //  elements.
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

TP.core.ElementNode.defineSubtype('core:EmptyElementNode');

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
     * @param {TP.sig.Request|TP.lang.Hash} aRequest Optional control
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
     * @param {TP.lang.Hash} filter The filter parameters that determine which
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
     * @param {TP.lang.Hash} filter The filter parameters that determine which
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
     * @param {TP.lang.Hash} filter The filter parameters that determine which
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
     * @param {TP.lang.Hash} filter The filter parameters that determine which
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
     * @param {TP.lang.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} An instance of a Node with anObj encoded according to
     *     this format.
     */

    var nullVal,

        dataElem,
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

    dataElem = TP.XML_FACTORY_DOCUMENT.createElement('data');
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
     * @param {TP.lang.Hash} filter The filter parameters that determine which
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
                TP.htmlEntitiesToXmlEntities(anObj.asString()))));

    return stringElem;
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('fromTP_lang_Hash',
function(anObj, filter, useNil) {

    /**
     * @method fromTP.lang.Hash
     * @summary Returns a Node that represents anObj in the XML-RPC format.
     * @param {Object} anObj The object to format.
     * @param {TP.lang.Hash} filter The filter parameters that determine which
     *     attributes of anObj to include in the output. The default is
     *     'unique_attributes'.
     * @param {Boolean} useNil Should null values be filled in with the
     *     non-standard nil?
     * @returns {Node} The receiver as an XML-RPC Node.
     */

    return this.fromObject(anObj, filter, useNil);
});

//  ------------------------------------------------------------------------

TP.core.XMLRPCNode.Type.defineMethod('objectFromNodeViaXSLT',
function(aNode) {

    /**
     * @method objectFromNodeViaXSLT
     * @summary Returns aNode as a TIBET/JavaScript object.
     * @param {Node} aNode The Node to reconstitute into a JavaScript object.
     * @returns {Object} The TIBET/JavaScript object that was reconstituted from
     *     the supplied Node.
     */

    var doc,
        node,
        url,
        styleDoc,
        newNode,
        jsString,
        $$inst;

    url = TP.uc('~lib_xsl/tp_xmlrpc2js.xsl');
    if (TP.isURI(url)) {
        styleDoc = url.getNativeNode();
        if (!TP.isXMLDocument(styleDoc)) {
            this.raise('TP.sig.InvalidStylesheet',
                        url.getLocation());
        }
    } else {
        this.raise('TP.sig.InvalidStylesheet',
                    url.getLocation());
    }

    if (TP.isNode(aNode)) {
        node = aNode;
    } else {
        node = aNode.getNativeNode();
    }

    //  TODO:   remove this once the primitive handles it internally
    if (!TP.isXMLDocument(node)) {
        doc = TP.createDocument();
        TP.nodeAppendChild(doc, node);
        node = doc;
    }

    newNode = TP.documentTransformNode(styleDoc, node);
    if (!TP.isNode(newNode)) {
        return this.raise('TP.sig.XSLTException');
    }

    jsString = TP.nodeGetTextContent(newNode.documentElement);
    if (TP.isEmpty(jsString)) {
        return this.raise('InvalidTP.core.XMLRPCNode');
    }

    try {
        //  a bit of a custom entities to literals conversion here since we
        //  turn &apos; into an escaped single quote inside content
        jsString = jsString.replace(/\&lt;/g, '<'
                            ).replace(/\&gt;/g, '>'
                            ).replace(/\&apos;/g, '\''
                            ).replace(/\&quot;/g, '"'
                            ).replace(/\&nbsp;/g, ' '
                            ).replace(/\&amp;/g, '&');

        /* eslint-disable no-eval */
        $$inst = eval(jsString);
        /* eslint-enable no-eval */
    } catch (e) {
        return this.raise('InvalidTP.core.XMLRPCNode',
                            TP.ec(e, TP.join('Error in: ', jsString)));
    }

    return $$inst;
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
                (TP.elementGetLocalName(tagChild) === 'data')) {
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

            break;

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

            break;

        case 'boolean':

            return TP.isNode(tagChild) ? (tagChild.nodeValue === 1) : null;

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

            break;

        default:

            return this.raise('InvalidTP.core.XMLRPCNode', node);
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
