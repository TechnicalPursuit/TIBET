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
//  TP.lama.*
//  ========================================================================

TP.sys.addFeatureTest('lama',
function() {

    //  NB: For the system to be considered to have the 'lama' feature, it has
    //  to both have the 'TP.lama.IDE' type loaded *and* have the Lama
    //  enabled for opening. The Lama HUD doesn't necessarily have to be open.
    return TP.isType(TP.sys.getTypeByName('TP.lama.IDE')) &&
            TP.sys.cfg('lama.enabled') === true &&
            TP.sys.inExtension() !== true;
});

//  ========================================================================
//  TP.tibet.acp
//  ========================================================================

TP.dom.UIElementNode.defineSubtype('tibet:acp');

//  ------------------------------------------------------------------------

TP.tibet.acp.Type.defineMethod('isResponderFor',
function(aSignal, aNode) {

    /**
     * @method isResponderFor
     * @summary Returns true if the type in question should be considered a
     *     responder for the specific node/signal pair provided.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return false;
});

//  ========================================================================
//  TP.tag.CustomTag
//  ========================================================================

/**
 * @type {TP.tag.CustomTag}
 * @summary A common supertype for custom UI tags.
 */

//  ------------------------------------------------------------------------

TP.dom.NonNativeUIElementNode.defineSubtype('TP.tag.CustomTag');

TP.tag.CustomTag.Type.resolveTrait(
        'tagExpand',
        TP.dom.UIElementNode);

TP.tag.CustomTag.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.dom.UIElementNode);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Whether or not we're currently in the process of being serialized.
TP.tag.CustomTag.Inst.defineAttribute('$areSerializing');

//  Whether or not we have real selected descendant content that we serialize.
//  This is used to determine what kind of tag (empty or not) to serialize.
TP.tag.CustomTag.Inst.defineAttribute('$serializesAsEmpty');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tag.CustomTag.Type.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles notification of a change.
     * @description If the origin is a URI that one of our 'reloadable
     *     attributes' has as the reference to its remote resource, then the
     *     'reloadFrom<Attr>' method is invoked on the receiver.
     * @param {TP.sig.Signal} aSignal The signal instance to respond to.
     * @returns {TP.meta.tag.CustomTag} The receiver.
     */

    var origin,
        aspect;

    //  Grab the signal origin - for changes to observed URI resources (see the
    //  tagAttachDOM()/tagDetachDOM() methods) this should be the URI that
    //  changed.
    origin = aSignal.getSignalOrigin();

    //  If it was a URL, then check to see if it's one of URL's 'special
    //  aspects'.
    if (TP.isKindOf(origin, TP.uri.URL)) {

        //  If the aspect is one of URI's 'special aspects', then we just return
        //  here.
        aspect = aSignal.at('aspect');
        if (TP.uri.URI.SPECIAL_ASPECTS.contains(aspect)) {
            return this;
        }
    }

    if (TP.canInvoke(this, 'refreshInstances')) {
        this.refreshInstances();
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.dom.Node[]} An Array of descendant nodes to serialize.
     */

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('getSerializationTraversal',
function() {

    /**
     * @method getSerializationTraversal
     * @summary Returns a constant, either TP.DESCEND or TP.CONTINUE, that
     *     determines whether serialization will descend into descendant nodes
     *     of this node or not. If TP.CONTINUE is returned that means that only
     *     select descendants, as determined by this type's
     *     getDescendantsForSerialization method will be serialized.
     * @returns {Number} Either TP.DESCEND or TP.CONTINUE.
     */

    var ourName,
        appTagName;

    ourName = this.getCanonicalName();

    //  NB: We pass false here to skip returning any Lama tag since we're
    //  running in a Lama-enabled environment.
    appTagName = TP.tibet.root.computeAppTagTypeName(false);

    //  If our (canonical) name is the same as the app tag name, then we allow
    //  descendant mutations.
    if (ourName === appTagName) {
        return TP.DESCEND;
    }

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('isSerializationEmpty',
function() {

    /**
     * @method isSerializationEmpty
     * @summary Returns whether or not the receiver should serialize with no
     *     content (i.e. an 'empty element')
     * @description At this type level, this simply returns whether the receiver
     *     is empty (i.e. devoid of child nodes). Subtypes may choose to use
     *     different criteria to determine this.
     * @returns {Boolean} Whether or not the receiver should serialize as an
     *     'empty element'.
     */

    return this.get('$serializesAsEmpty');
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('serializeCloseTag',
function(storageInfo) {

    /**
     * @method serializeCloseTag
     * @summary Serializes the closing tag for the receiver.
     * @description At this type level, this method, in conjunction with the
     *     'serializeOpenTag' method, will always produce the 'XML version' of
     *     an empty tag (i.e. '<foo/>' rather than '<foo></foo>').
     * @param {TP.core.Hash} storageInfo A hash containing various flags for and
     *     results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the document node should
     *          include an 'XML declaration' at the start of it's serialization.
     *          The default is false.
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

    var str;

    //  If we're serializing, then we just do what our supertype does and
    //  descend into our child nodes.
    if (this.get('$areSerializing')) {
        str = this.callNextMethod();
        return TP.ac(str, TP.DESCEND);
    }

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('serializeOpenTag',
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
     *          'wantsXMLDeclaration': Whether or not the document node should
     *          include an 'XML declaration' at the start of it's serialization.
     *          The default is false.
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

    var str,

        traversalSetting,

        currentStore,
        currentResult,

        resourceURI,

        loc;

    //  If we're serializing, then we just do what our supertype does and
    //  descend into our child nodes.
    if (this.get('$areSerializing')) {

        //  Grab the traversal setting. If it's not TP.DESCEND (which is the
        //  default), then call a method to serialize select descendants.
        traversalSetting = this.get('serializationTraversal');
        if (traversalSetting !== TP.DESCEND) {
            //  Serialize descendants. Set whether or not we serialize as empty
            //  as to whether there was actual descendant content.
            str = this.serializeSelectDescendants(storageInfo);
            this.set('$serializesAsEmpty', TP.isEmpty(str), false);
        } else {
            str = '';
            //  Otherwise, this tag serializes as empty if it really is empty.
            //  Note that we don't rely on the isSerializationEmpty method here
            //  since it is the consumer of this flag - we're setting the flag
            //  for it's usage.
            this.set('$serializesAsEmpty', this.isEmpty(), false);
        }

        //  Call 'super' to get the serialized version of ourself and prepend it
        //  onto our selected descendants markup.
        str = this.callNextMethod() + str;

        return TP.ac(str, traversalSetting);
    }

    //  Turn the serializing flag on.
    this.set('$areSerializing', true, false);

    //  Grab our template's resource URI - we'll use this as our 'store' key.
    resourceURI = this.getType().getResourceURI(
                        'template',
                        TP.elementGetAttribute(
                            this.getNativeNode(), 'tibet:mime', true));

    loc = resourceURI.getLocation();

    currentStore = storageInfo.at('store');

    //  If we're 'locking' the store, that means that all serialization results
    //  will go into a single serialization store. That means that nested tags
    //  will represent themselves in their hosting template - their template
    //  won't change.
    if (TP.notTrue(storageInfo.at('lockStore'))) {

        //  If we're not actually serializing our own template, then store off
        //  the current result - we'll need it below.
        if (currentStore !== loc) {
            currentResult = storageInfo.at('result');
        }

        //  Set our template resource URI as the current 'store' key and create
        //  a new result Array.
        storageInfo.atPut('store', loc);
        storageInfo.atPut('result', TP.ac());

        //  Serialize ourself - this will loop back around to this method, hence
        //  the '$areSerializing' flag. This will also place any generated
        //  results 'under' us into the 'stores' hash under our store key.
        this.serializeForStorage(storageInfo);

        //  If we're not actually serializing our own template, then restore the
        //  current 'store' (i.e. location) and result.
        if (currentStore !== loc) {
            //  Restore the previous 'store' key and result.
            storageInfo.atPut('store', currentStore);
            storageInfo.atPut('result', currentResult);
        }
    } else {
        //  Serialize ourself - this will loop back around to this method, hence
        //  the '$areSerializing' flag. This will also place any generated
        //  results 'under' us into the 'stores' hash under our store key.
        this.serializeForStorage(storageInfo);
    }

    //  Turn the serializing flag off.
    this.set('$areSerializing', false, false);

    //  If we're not actually serializing our own template, then return an empty
    //  version of ourself as the placeholder in the 'higher level' markup that
    //  we're being serialized as a part of.
    if (currentStore !== loc && TP.notTrue(storageInfo.at('lockStore'))) {
        //  Return an Array containing our full name (as opposed to our actual
        //  rendered tag name) as an empty tag and continue on to our next
        //  sibling, thereby treating our child content as opaque.
        return TP.ac('<' + this.getFullName() + '/>', TP.CONTINUE);
    }

    //  We were serializing our own template and we included the results of that
    //  above - just hand back the empty String and continue on to the next
    //  sibling.
    return TP.ac('', TP.CONTINUE);
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('serializeSelectDescendants',
function(storageInfo) {

    /**
     * @method serializeSelectDescendants
     * @summary Serializes selected descendants per the logic of this tag. This
     *     method is only called if the setting of 'serializationTraversal' is
     *     set to a value *other* than TP.DESCEND (which is the default). Note
     *     that, at a minimum, this method *must* return the empty String.
     * @description At this type level, this method just returns the empty
     *     String. A templated tag subtype might choose to override this to
     *     serialize selected descendants. If so, it needs to set it's
     *     type-level 'serializationTraversal' attribute to something other than
     *     TP.DESCEND (probably TP.CONTINUE) and then implement this method.
     * @param {TP.core.Hash} storageInfo A hash containing various flags for and
     *     results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the document node should
     *          include an 'XML declaration' at the start of it's serialization.
     *          The default is false.
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
     * @returns {String} A serialization of selected descendants of the
     *     receiver.
     */

    var selectedDescendants,

        localID,

        serializationStorage,
        str;

    //  Get the descendants that we want to serialize. If there are none, just
    //  return the empty String.
    selectedDescendants = this.getDescendantsForSerialization();
    if (TP.isEmpty(selectedDescendants)) {
        return '';
    }

    localID = this.getLocalID();

    //  Set up a serialization storage, with a store registered under our local
    //  (unique) ID. Note that we also copy other 'meta information' about
    //  serializaton.
    serializationStorage = TP.hc(
        'store', localID,
        'wantsPrefixedXMLNSAttrs', storageInfo.at('wantsPrefixedXMLNSAttrs'));

    str = '';

    //  Iterate over the selected descendants and serialize them into the store.
    selectedDescendants.forEach(
        function(aDescendant) {
            var siblings;

            //  Grab all of our 'previous' siblings.
            siblings = aDescendant.getSiblings(TP.PREVIOUS);
            siblings.forEach(
                function(aSiblingTPNode) {
                    //  Make sure the sibling isn't an Element
                    if (!TP.isKindOf(aSiblingTPNode, TP.dom.ElementNode)) {
                        str += aSiblingTPNode.serializeNonTag(
                                            serializationStorage);
                    }
                });

            //  Note here how we create a new result for each iteration of this
            //  loop. This is because we're creating content above and below and
            //  don't want the serialization routine to use the store, but to
            //  use a fresh result at each 'level'.
            serializationStorage.atPut('result', TP.ac());
            aDescendant.serializeForStorage(serializationStorage);

            //  Grab the result at the store registered under our local ID.
            str += serializationStorage.at('stores').at(localID);

            //  Grab all of our 'next' siblings.
            siblings = aDescendant.getSiblings(TP.NEXT);
            siblings.forEach(
                function(aSiblingTPNode) {
                    //  Make sure the sibling isn't an Element
                    if (!TP.isKindOf(aSiblingTPNode, TP.dom.ElementNode)) {
                        str += aSiblingTPNode.serializeNonTag(
                                            serializationStorage);
                    }
                });
        });

    return str;
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Type.defineMethod('$shouldAddToOriginals',
function(originalNode, mutatedNode, targetNode) {
    /**
     * @method $shouldAddToOriginals
     * @summary Whether or not the receiver should add a node that is being
     *     processed to its set of 'originals' - that is, nodes that need to be
     *     updated if the receiver's computation/templating output changes.
     * @description For this type, the Window that the node is destined for (as
     *     supplied by the targetNode, if its available) will be queried for. If
     *     it is the same as the current UI canvas, then true is returned. If
     *     there is no targetNode or it's Window cannot be determined, then true
     *     will be returned.
     * @param {Node} sourceNode A clone of the original node that is
     *     representing the receiver before 'computation'/'transformation. The
     *     original version of this node is what will be added to the set of
     *     originals.
     * @param {Node} mutatedNode The original node after having been mutated by
     *     computation/transformation.
     * @param {Node} targetNode The target element that the receiver is a part
     *     of. This is useful when needing information about the visual surface
     *     that the currently processing element will be drawn into.
     * @returns {Boolean} Whether or not to add the node to the receiver's set
     *     of 'originals'.
     */

    var win;

    if (TP.isNode(targetNode)) {
        win = TP.nodeGetWindow(targetNode);
        if (TP.isWindow(win)) {
            return win === TP.sys.uiwin(true);
        }
    }

    return true;
});

//  ========================================================================
//  TP.tag.ComputedTag
//  ========================================================================

/**
 * @type {TP.tag.ComputedTag}
 * @summary A common supertype for computed UI tags.
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('TP.tag.ComputedTag');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tag.ComputedTag.Type.defineMethod('defineMethod',
function(methodName, methodBody, methodDescriptor, display, $isHandler) {

    /**
     * @method defineMethod
     * @summary Adds the function with name and body provided as a type or
     *     'type local' method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} methodDescriptor An optional 'property descriptor'. If a
     *     'value' slot is supplied here, it is ignored in favor of the
     *     methodBody parameter to this method.
     * @param {String} display Optional string defining the public display name
     *     for the function.
     * @param {Boolean} [$isHandler=false] True will cause the definition to
     *     pass without errors for deprecated use of defineMethod for handlers.
     * @returns {Function} The newly defined method.
     */

    var retVal;

    //  Gotta love TIBET - redefining the 'defineMethod' method for a particular
    //  type and its subtypes. And callNextMethod() too!

    retVal = this.callNextMethod();

    //  If we're redefining the 'tagCompile' or 'tagExpand' method and the
    //  system has started, then we need to refresh all of the existing
    //  instances.
    if ((methodName === 'tagCompile' || methodName === 'tagExpand') &&
        TP.sys.hasStarted()) {
        this[TP.OWNER].refreshInstances();
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.Type.defineMethod('getComputedSource',
function(tpElement, aRequest) {

    /**
     * @method getComputedSource
     * @summary Returns a String of computed source for the receiver.
     * @param {TP.dom.ElementNode} tpElement The element being processed.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {String|Array} A String containing the markup to replace the
     *     element being processed or an Array containing the String in the
     *     first position and a constant of TP.REPLACE (the default) or
     *     TP.UPDATE which tells the caller whether to replace the element being
     *     processed or to leave it in place but replace its entire content.
     */

    var str;

    if (TP.sys.hasFeature('lama')) {
        str = '<a onclick="TP.bySystemId(\'LamaConsoleService\')' +
                '.sendConsoleRequest(\':inspect ' +
                tpElement.getID().replace(':', '.') + '.Type.tagExpand' +
                '\'); return false;" href="#" tibet:tag="' +
                tpElement.getCanonicalName() + '" tibet:no-rewrite="true">' +
                '&lt;' + tpElement.getCanonicalName() + '/&gt;' +
                '</a>';
    } else {
        str = '<a onclick="alert(\'Edit ' + tpElement.getID() +
                '.Type.tagExpand.\')" href="#" tibet:tag="' +
                tpElement.getCanonicalName() + '" tibet:no-rewrite="true">' +
                '&lt;' + tpElement.getCanonicalName() + '/&gt;' +
                '</a>';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.Type.defineMethod('isDOMCacheable',
function() {

    /**
     * @method isDOMCacheable
     * @summary Can nodes of this type be cached in the DOM cache?  The default
     *     is true. Computed tags are not cacheable.
     * @returns {Boolean} The cacheable status.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.Type.defineMethod('tagExpand',
function(aRequest) {

    /**
     * @method tagExpand
     * @summary Expand instances of the tag into their HTML representation.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The new element.
     */

    var elem,
        tpElem,

        result,

        str,
        action,

        newNode,

        isFragment,

        retVal;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    tpElem = TP.wrap(elem);
    try {
        result = this.getComputedSource(tpElem, aRequest);
    } catch (e) {
        TP.ifError() ? TP.error(
            TP.ec(e, `Error in ${this.getName()}.Type.getComputedSource`)) : 0;
    }

    if (TP.isPair(result)) {
        str = result.first();
        action = result.last();
    } else if (TP.isString(result)) {
        str = result;
    } else {
        str = '<!-- ' + TP.xmlstr(elem) + ' -->';
    }

    newNode = TP.xhtmlnode(str);

    isFragment = TP.isFragment(newNode);

    //  Note here how we return the *result* of this method due to node
    //  importing, etc.
    switch (action) {
        case TP.UPDATE:
            //  Replace the element's content.
            if (isFragment) {
                //  NB: nodeSetContent will return the first child that was
                //  appended, but that's not sufficient here.
                TP.nodeSetContent(elem, newNode);
                newNode = elem;
                retVal = TP.ac(newNode.childNodes);
            } else {
                newNode = TP.nodeSetContent(elem, newNode);
                retVal = newNode;
            }
            break;
        case TP.REPLACE:
            //  Fallthrough
        default:
            //  Replace the whole element.
            newNode = TP.elementReplaceWith(elem, newNode);
            retVal = newNode;
            break;
    }

    //  TODO: Need to review. Should we be doing all of the stuff that Templated
    //  Tag does at the end of its tagExpand??

    TP.elementSetGenerator(newNode);

    return retVal;
});

//  ========================================================================
//  TP.tag.TemplatedTag
//  ========================================================================

/**
 * @type {TP.tag.TemplatedTag}
 * @summary A common supertype for templated UI tags. This type provides an
 * inheritance root for templated tags by mixing in TemplatedNode properly.
 */

TP.tag.CustomTag.defineSubtype('TP.tag.TemplatedTag');

//  Mix in templating behavior, resolving computation in favor of templating.
TP.tag.TemplatedTag.addTraitTypes(TP.dom.TemplatedNode);

TP.tag.TemplatedTag.Type.resolveTrait('tagExpand', TP.dom.TemplatedNode);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.Type.defineAttribute('registeredForURIUpdates');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.Type.defineMethod('construct',
function(nodeSpec, varargs) {

    /**
     * @method construct
     * @summary Constructs a new instance to wrap a native node. The native node
     *     may have been provided or a String could have been provided. By far
     *     the most common usage is construction of a wrapper around an existing
     *     node.
     * @param {Node|URI|String|TP.dom.Node} nodeSpec Some suitable object to
     *     construct a source node. See type discussion above. Can also be null.
     * @param {arguments} varargs Optional additional arguments for the
     *     constructor.
     * @returns {TP.tag.TemplatedTag} A new instance.
     */

    var retVal,

        elem,
        uri;

    //  Call up to get the instance of this type wrapping our native node.
    retVal = this.callNextMethod();

    //  Grab the native node
    elem = retVal.getNativeNode();

    //  If we haven't set up this type to register for updates coming from it's
    //  URI, do so now.
    if (TP.notTrue(this.get('registeredForURIUpdates'))) {

        uri = this.getResourceURI(
                        'template',
                        TP.elementGetAttribute(elem, 'tibet:mime', true));

        if (TP.isURI(uri)) {
            this.observe(uri, 'TP.sig.ValueChange');
            uri.watch();
        }

        //  Set the flag so that we don't do this again.
        this.set('registeredForURIUpdates', true);
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.Inst.defineMethod('getSerializationTraversal',
function() {

    /**
     * @method getSerializationTraversal
     * @summary Returns a constant, either TP.DESCEND or TP.CONTINUE, that
     *     determines whether serialization will descend into descendant nodes
     *     of this node or not. If TP.CONTINUE is returned that means that only
     *     select descendants, as determined by this type's
     *     getDescendantsForSerialization method will be serialized.
     * @returns {Number} Either TP.DESCEND or TP.CONTINUE.
     */

    var docSourceLoc,
        docSourceURI,

        templateSourceURI;

    docSourceLoc = this.getDocument().getDocumentElement().
                                        getAttribute(TP.GLOBAL_DOCID_ATTR);

    if (TP.isURIString(docSourceLoc, true)) {
        docSourceURI = TP.uc(docSourceLoc).getPrimaryURI();
        templateSourceURI = this.getType().getResourceURI('template');

        if (TP.equal(docSourceURI, templateSourceURI)) {
            return TP.DESCEND;
        }
    }

    return this.callNextMethod();
});

//  ========================================================================
//  TP.tibet.app
//  ========================================================================

/**
 * @type {TP.tibet.app}
 * @summary TP.tibet.app represents the 'non-Lama' application tag. It is
 *     usually generated by the TP.tibet.root tag type if Lama is not loaded
 *     or disabled.
 */

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.defineSubtype('tibet:app');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how this property is TYPE_LOCAL, by
//  design.
TP.tibet.app.defineAttribute('styleURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tibet.app.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    //  TODO: The UICANVAS should be set to be the UIROOT here.

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.tibet.app.Type.defineMethod('tagExpand',
function(aRequest) {

    /**
     * @method tagExpand
     * @summary Expand the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description In this type, this method generates either a 'tibet:app' or
     *     a 'tibet:lama' tag, depending on whether or not the current boot
     *     environment is set to 'development' or not.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Element} The new element.
     */

    var elem,

        projectName,
        tagName,

        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    projectName = TP.sys.cfg('project.name');
    tagName = TP.sys.cfg('tibet.apptag') || 'APP.' + projectName + '|app';

    newElem = TP.xhtmlnode(
    '<div tibet:tag="tibet:app" class="tag-defaulted">' +
        '<h1 class="tag-defaulted">' +
            'Application tag for ' + projectName + ' failed to render. ' +
            'Defaulted to &lt;tibet:app/&gt;' +
        '</h1>' +

        '<p>' +
        'If you are seeing this error message it usually means either:<br/><br/>' +
        '- The tag specified for your application (' + tagName + ') is missing; or<br/>' +
        '- <b>The specified tag type has a syntax error or failed to load.</b>' +
        '</p>' +

        '<p>Source for that tag would typically be found in:</p>' +

        '<p><code>src/tags/' + tagName.replace(/:/g, '.') + '.js</code></p>' +

        '<p>' +
        'Check that file for syntax errors if it is the right file, or check' +
        ' your tibet.apptag settings to ensure the right tag type is being' +
        ' specified along with your ~app_cfg/main.xml package to ensure you' +
        ' are loading it.' +
        '</p>' +

        '<p class="hint">' +
        'Hint: You can use Alt-Up to toggle the boot log/console.' +
        '</p>' +
    '</div>');

    //  Note here how we return the *result* of this method due to node
    //  importing, etc.
    newElem = TP.elementReplaceWith(elem, newElem);

    TP.elementSetGenerator(newElem);

    return newElem;
});

//  ========================================================================
//  TP.tibet.root
//  ========================================================================

/**
 * @type {TP.tibet.root}
 * @summary TP.tibet.root represents the tag placed in 'UIROOT' pages (i.e. the
 *     root page of the system). Depending on whether the Lama project is
 *     loaded/disabled, this tag will generate either a 'tibet:app' tag or a
 *     'tibet:lama' tag to handle the main UI.
 */

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.defineSubtype('tibet:root');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.tibet.root.defineAttribute('styleURI', TP.NO_RESULT);
TP.tibet.root.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tibet.root.Type.defineMethod('computeAppTagTypeName',
function(wantsLama) {

    /**
     * @method computeAppTagTypeName
     * @summary Computes the current tag type name by using system config
     *     information to try to find a type and, if that can't found, falling
     *     back to the 'tibet:lama' or 'tibet:app' tag.
     * @param {Boolean} wantsLama Whether or not to include the 'tibet:lama'
     *     tag in the result output. The default is true.
     * @returns {String} The name of the type to use as the 'app tag'.
     */

    var cfg,
        opts,

        lamaOk,

        type,
        name;

    //  Build up a list of tag names to check. We'll use the first one we have a
    //  matching type for.
    opts = TP.ac();

    cfg = TP.sys.cfg('tibet.apptag');
    if (TP.notEmpty(cfg)) {
        opts.push(cfg);
    }

    cfg = TP.sys.cfg('project.name');
    if (TP.notEmpty(cfg)) {
        opts.push(cfg + ':app');
    }

    lamaOk = TP.ifInvalid(wantsLama, true);

    if (TP.sys.hasFeature('lama') && lamaOk) {
        opts.unshift('tibet:lama');
    }

    //  When in doubt at least produce something :)
    opts.push('tibet:app');

    //  Keep string for error reporting.
    cfg = opts.join();

    while (TP.notValid(type) && TP.notEmpty(name = opts.shift())) {
        type = TP.sys.getTypeByName(name, false);
    }

    if (!TP.isType(type)) {
        this.raise('TypeNotFound', 'Expected one of: ' + cfg);
        return null;
    }

    return name;
});

//  ------------------------------------------------------------------------

TP.tibet.root.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Sets up runtime machinery for the element in aRequest.
     * @description In this type, if the Lama is not 'active' this method
     *     loads the URL pointed to by the TP.sys.getHomeURL method into the
     *     UIROOT frame. If a value hasn't been configured, then the standard
     *     system blank page is loaded into that frame.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemWin,
        request,
        homeURL;

    //  If the Lama is configured to be on (and we've actually loaded the
    //  Lama code), then exit here - the Lama does some special things to
    //  the 'tibet:root' tag.
    if (TP.sys.hasFeature('lama')) {
        return;
    }

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  Make sure that we have a Window to draw into.
    if (!TP.isWindow(elemWin = TP.nodeGetWindow(elem))) {
        return;
    }

    //  Capture the actual home page URL for loading which means passing true
    //  here to force session variables to be checked.
    homeURL = TP.uc(TP.sys.getHomeURL(true));

    request = TP.request();
    request.atPut(TP.ONLOAD,
                function(aDocument) {
                    //  Signal we are starting. This provides a hook for
                    //  extensions etc. to tap into the startup sequence before
                    //  routing or other behaviors but after we're sure the UI
                    //  is finalized.
                    TP.signal('TP.sys', 'AppWillStart');

                    //  Signal actual start. The default handler on Application
                    //  will invoke the start() method in response to this
                    //  signal.
                    TP.signal('TP.sys', 'AppStart');
                });

    //  We load the URL associated with the home URL, but we only trigger this
    //  *after* we've finished loading the document containing this tag.
    TP.wrap(elemWin).queueAfterNextReload(
                function() {
                    TP.wrap(elemWin).setContent(homeURL, request);
                });

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.root.Type.defineMethod('tagExpand',
function(aRequest) {

    /**
     * @method tagExpand
     * @summary Expand the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description In this type, if the Lama is 'active' (not just loaded but
     *     active) this method converts the receiver (a 'tibet:root' tag) into a
     *     'tibet:lama' tag.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The new element.
     */


    var elem,
        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  If the Lama is configured to be on (and we've actually loaded the
    //  Lama code), then turn the receiver into a 'tibet:lama' tag.
    if (TP.sys.hasFeature('lama')) {

        newElem = TP.elementBecome(elem, 'tibet:lama');

        //  We're changing out the tag entirely, so remove any evidence via the
        //  tibet:tag reference.
        TP.elementRemoveAttribute(newElem, 'tibet:tag', true);

        TP.elementSetGenerator(newElem);

        return newElem;
    }

    elem = TP.nodeCloneNode(elem);

    TP.elementSetGenerator(elem);

    return elem;
});

//  ========================================================================
//  TP.tag.InfoTag
//  ========================================================================

/**
 * @type {TP.tag.InfoTag}
 * @summary TP.tag.InfoTag is the supertype for all 'info' elements in
 *     the TIBET framework. Examples of info elements are acl:info, bind:info,
 *     drag:info, ev:info, and similar items which provide processing
 *     information but don't typically perform direct action in the way that a
 *     TP.tag.ActionTag might.
 */
//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('InfoTag');

//  Can't construct concrete instances of this type.
TP.tag.InfoTag.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are *not*
//  TYPE_LOCAL, by design.
TP.tag.InfoTag.Type.defineAttribute('styleURI', TP.NO_RESULT);
TP.tag.InfoTag.Type.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tag.InfoTag.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.InfoTag.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidFilter');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.InfoTag.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSource');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.InfoTag.Type.defineMethod('cmdRunContent',
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

    interactive = TP.ifKeyInvalid(aRequest, 'cmdBuildGUI', false);
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

TP.tag.InfoTag.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.InfoTag.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidTransform');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.InfoTag.Type.defineMethod('tagExpand',
function(aRequest) {

    /**
     * @method tagExpand
     * @summary Expand the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The new element.
     */

    var elem;

    //  Default for info tags is to not be transformed, but to have a
    //  'tibet-info' CSS class added to their markup.

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    TP.elementAddClass(elem, 'tibet-info');

    elem = TP.nodeCloneNode(elem);

    TP.elementSetGenerator(elem);

    return elem;
});

//  ========================================================================
//  TP.tag.ActionTag
//  ========================================================================

/**
 * @type {TP.tag.ActionTag}
 * @summary TP.tag.ActionTag is the supertype for all action elements
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
 *     approach, so you'll normally just implement a tshExecute() method on your
 *     action element with a request object as the first parameter. Note that
 *     like much of TIBET's other APIs a request in this context can be a
 *     TP.sig.Request or a simple hash of parameter values.
 */
//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('ActionTag');

//  can't construct concrete instances of this
TP.tag.ActionTag.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are *not*
//  TYPE_LOCAL, by design.
TP.tag.ActionTag.Type.defineAttribute('styleURI', TP.NO_RESULT);
TP.tag.ActionTag.Type.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the default request type to use for construction of a request
TP.tag.ActionTag.Type.defineAttribute('requestType', 'TP.sig.Request');

//  an optional name which refines the request by altering its name
TP.tag.ActionTag.Type.defineAttribute('requestName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('canAct',
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

                default:

                    actionable = false;
                    break;
            }
        }
    }

    return actionable;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidFilter');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSource');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('cmdRunContent',
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

    interactive = TP.ifKeyInvalid(aRequest, 'cmdBuildGUI', false);
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

TP.tag.ActionTag.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @inheritDoc
     */

    this.raise('TP.sig.InvalidTransform');

    return;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('getActionInput',
function(aRequest) {

    /**
     * @method getActionInput
     * @summary Returns either the request's standard input or the receiver's
     *     'primary argument'.
     * @param {TP.sig.Request} aRequest The request to check for stdin.
     * @returns {Object|undefined} The input data.
     */

    var input;

    if (!TP.isNode(aRequest.at('cmdNode'))) {
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

TP.tag.ActionTag.Type.defineMethod('getActionParam',
function(aRequest, parameterName) {

    /**
     * @method getActionParam
     * @summary Checks the receiver for child <param> tags and returns the
     *     value associated with the named parameter if found.
     * @param {TP.sig.Request} aRequest The request being processed.
     * @param {String} parameterName The name of the parameter to find.
     * @returns {String|undefined} The parameter value, if any.
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

TP.tag.ActionTag.Type.defineMethod('getPrimaryArgument',
function(aRequest) {

    /**
     * @method getPrimaryArgument
     * @summary Returns the value of the receiver's primary argument, which
     *     must be named by the return value of getPrimaryArgumentName(). By
     *     default action tags return null here due to there being no default
     *     for getPrimaryArgumentName. Overriding that method to provide a valid
     *     name is usually sufficient.
     * @param {TP.sig.Request} aRequest The request being processed.
     * @returns {Object|undefined} The argument data.
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

TP.tag.ActionTag.Type.defineMethod('getPrimaryArgumentName',
function() {

    /**
     * @method getPrimaryArgumentName
     * @summary Returns the primary argument name, which by default is null.
     *     For action tags this method typically must be overridden or the
     *     getPrimaryArgument() and getActionInput() calls will typically fail
     *     to return useful results.
     * @returns {undefined} The argument name.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('isResponderFor',
function(aSignal, aNode) {

    /**
     * @method isResponderFor
     * @summary Returns true if the type in question should be considered a
     *     responder for the specific node/signal pair provided.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('tagExpand',
function(aRequest) {

    /**
     * @method tagExpand
     * @summary Expand the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The new element.
     */

    var elem;

    //  Default for action tags is to not be transformed, but to have a
    //  'tibet-action' CSS class added to their markup.

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    TP.elementAddClass(elem, 'tibet-action');

    elem = TP.nodeCloneNode(elem);

    TP.elementSetGenerator(elem);

    return elem;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Number} A TSH shell loop control constant which controls how
     *     the outer TSH processing loop should continue. Common values are
     *     TP.CONTINUE, TP.DESCEND, and TP.BREAK.
     */

    return aRequest.complete();
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tag.ActionTag.Inst.defineMethod('act',
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
     * @param {TP.sig.Signal} [aSignal] The signal instance which triggered this
     *     activity. Only valid when being invoked in response to a handle call.
     * @returns {TP.tag.ActionTag} The receiver.
     */

    var request,
        shell;

    //  check with the type to see if we can run
    if (TP.notTrue(this.getType().canAct(this.getNativeNode()))) {
        return this;
    }

    request = this.constructActRequest(aSignal);

    shell = TP.shell.TSH.getDefaultInstance();
    shell[TP.composeHandlerName('ShellRequest')](request);

    return this;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Inst.defineMethod('constructActRequest',
function(aSignal) {

    /**
     * @method constructActRequest
     * @summary Returns a TP.sig.Request subtype instance suitable for the
     *     receiver's requirements. This is typically a TP.sig.ShellRequest so
     *     the TIBET Shell can be used to process/execute the tag.
     * @param {TP.sig.Signal|TP.core.Hash} [aSignal] A signal or hash containing
     *     parameter data. Note that this parameter is optional and is only used
     *     if the receiver is being invoked due to a handle call.
     * @returns {TP.sig.Request} A proper TP.sig.Request for the action.
     */

    var request;

    request = TP.sig.ShellRequest.construct(
                    TP.hc('cmdLiteral', true,
                            'cmdNode', this.getNativeNode(),
                            'cmdExecute', true,
                            'cmdPhases', 'Execute'
                    ));

    if (TP.isKindOf(aSignal, TP.sig.Signal)) {
        request.atPut('cmdTrigger', aSignal);
        request.atPut(TP.STDIN, TP.ac(aSignal.get('payload')));
    }

    return request;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Inst.defineMethod('getActionParam',
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

TP.tag.ActionTag.Inst.defineMethod('getRequestName',
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

TP.tag.ActionTag.Inst.defineMethod('getRequestType',
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

    type = TP.sys.getTypeByName(name);
    if (TP.notValid(type)) {
        this.raise('TP.sig.InvalidType',
                    'Request type not found for: ' + this.asString());

        type = TP.sig.Request;
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Inst.defineMethod('getDownstreamSegment',
function() {

    /**
     * @method getUpstreamSegment
     * @summary Returns the 'downstream' segment for this action - that is, any
     *     following action element in a command sequence.
     * @returns {TP.tag.ActionTag|null} The downstream segment of this
     *     action or null if it's the last segment.
     */

    var retVal;

    retVal = this.detectSibling(
                function(aTPNode) {
                    var node;

                    node = TP.unwrap(aTPNode);
                    if (TP.isElement(node) &&
                        TP.elementGetLocalName(node) === 'cmd') {
                        return true;
                    }

                    return false;
                },
                TP.NEXT);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Inst.defineMethod('getUpstreamSegment',
function() {

    /**
     * @method getUpstreamSegment
     * @summary Returns the 'upstream' segment for this action - that is, any
     *     preceding action element in a command sequence.
     * @returns {TP.tag.ActionTag|null} The upstream segment of this
     *     action or null if it's the first segment.
     */

    var retVal;

    retVal = this.detectSibling(
                function(aTPNode) {
                    var node;

                    node = TP.unwrap(aTPNode);
                    if (TP.isElement(node) &&
                        TP.elementGetLocalName(node) === 'cmd') {
                        return true;
                    }

                    return false;
                },
                TP.PREVIOUS);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Inst.defineMethod('getRedirectionType',
function() {

    /**
     * @method getRedirectionType
     * @summary Returns what kind of redirection type, if any, the receiver
     *     has.
     * @returns {String} One of the following: TP.ADD, TP.GET, TP.SET,
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

TP.tag.ActionTag.Inst.defineMethod('isLastSegment',
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

TP.tag.ActionTag.Inst.defineHandler('Signal',
function(aSignal) {

    /**
     * @method handleSignal
     * @summary Responds to an inbound signal by running the receiver's
     *     action(s) via the act() method.
     * @param {TP.sig.Signal} aSignal The signal instance which triggered this
     *     call.
     * @returns {TP.tag.ActionTag} The receiver.
     */

    var sig;

    sig = this.signal('TP.sig.WillRun');
    if (sig.shouldPrevent()) {
        return this;
    }

    try {
        this.act(aSignal);
    } finally {
        this.signal('TP.sig.DidRun');
    }

    return this;
});

//  ========================================================================
//  TP.dom.PipeSegmentElementNode
//  ========================================================================

/**
 * @type {TP.dom.PipeSegmentElementNode}
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('dom.PipeSegmentElementNode');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.dom.PipeSegmentElementNode.isAbstract(true);

//  ------------------------------------------------------------------------

TP.dom.PipeSegmentElementNode.Type.defineMethod('cmdFilterInput',
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

TP.dom.PipeSegmentElementNode.Type.defineMethod('cmdTransformInput',
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

TP.dom.PipeSegmentElementNode.Type.defineMethod('filterInput',
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

TP.dom.PipeSegmentElementNode.Type.defineMethod('getDefaultAction',
function(aRequest) {

    /**
     * @method getDefaultAction
     * @summary Returns the proper action name to use based on the pipe symbol
     *     being processed.
     * @param {TP.sig.Request} aRequest The request to process.
     * @returns {String|undefined} 'filterInput' or 'transformInput'.
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

TP.dom.PipeSegmentElementNode.Type.defineMethod('processInput',
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
     * @param {String|undefined} functionName 'filterInput' or 'transformInput'.
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
                    TP.warn('Splatting with non-collection content.') : 0;

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

TP.dom.PipeSegmentElementNode.Type.defineMethod('shouldFailOnEmptyInput',
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

TP.dom.PipeSegmentElementNode.Type.defineMethod('transformInput',
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
     * @returns {undefined} The transformed input.
     */

    this.raise('TP.sig.InvalidTransform');

    return;
});

//  ------------------------------------------------------------------------

TP.dom.PipeSegmentElementNode.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Run when the receiver is executed directly, or as part of a
     *     cmdRunContent invocation from the interactive shell. This method
     *     relies on the default action implied by the current pipe symbol to
     *     dispatch to the proper cmd*Input method.
     * @param {TP.sig.Request} aRequest The request to process.
     * @returns {Number} A TSH shell loop control constant which controls how
     *     the outer TSH processing loop should continue. Common values are
     *     TP.CONTINUE, TP.DESCEND, and TP.BREAK.
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
//  TP.dom.MultipliedElement
//  ========================================================================

/**
 * @type {TP.dom.MultipliedElement}
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('dom.MultipliedElement');

TP.dom.MultipliedElement.addTraitTypes(TP.dom.ElementNode);

TP.dom.MultipliedElement.Inst.resolveTraits(
        TP.ac('serializeCloseTag', 'serializeOpenTag'),
        TP.dom.ElementNode);

TP.dom.MultipliedElement.defineAttribute('styleURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
