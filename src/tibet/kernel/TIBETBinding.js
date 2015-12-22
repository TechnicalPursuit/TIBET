//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

//  ========================================================================
//  OBJECT BINDING
//  ========================================================================

TP.definePrimitive('defineBinding',
function(target, targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the supplied target object.
     * @param {Object} target The target object to define the binding on.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will bound to. If not
     *     specified, this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @param {Function} transformationFunc
     * @returns {Object} The target object.
     */

    var resource,

        finalTarget,

        sourceAttr,

        facetName,
        signalName,
        aspectKey,

        methodName,

        handler,

        resourceValue,

        i,
        allFacets;

    if (TP.isEmpty(targetAttributeName)) {
        return this.raise('TP.sig.InvalidParameter',
            'No attribute name provided for bind.');
    }

    if (TP.isString(resourceOrURI)) {
        resource = TP.uc(TP.TIBET_URN_PREFIX + resourceOrURI);
    } else if (TP.isKindOf(resourceOrURI, TP.core.TIBETURL)) {
        resource = resourceOrURI.getConcreteURI();
    } else {
        resource = resourceOrURI;
    }

    //  Prefer URIs but can bind to any object in theory.
    if (TP.notValid(resource)) {
        return this.raise('TP.sig.InvalidResource',
            'No resource spec provided for bind.');
    }

    finalTarget = target;

    if (TP.isKindOf(finalTarget, TP.core.TIBETURL)) {
        finalTarget = finalTarget.getConcreteURI();
    }

    //  Get the source attribute. If there is no source attribute, then use the
    //  target attribute as the source attribute.
    if (TP.notValid(sourceAttr = sourceAttributeName)) {
        sourceAttr = targetAttributeName;
    }

    //  Get the source facet. If there is no source facet, then default it to
    //  'value'.
    if (TP.notValid(facetName = sourceFacetName)) {
        facetName = 'value';
    }

    //  Choose the correct subtype of TP.sig.FacetSignal to use, depending on
    //  facet.
    switch (facetName) {

        //  Specifying TP.ALL means that we use the supertype of all facet
        //  signals.
        case TP.ALL:
            signalName = 'TP.sig.FacetChange';
            break;

        case 'readonly':
            signalName = 'TP.sig.ReadonlyChange';
            break;

        case 'relevant':
            signalName = 'TP.sig.RelevantChange';
            break;

        case 'required':
            signalName = 'TP.sig.RequiredChange';
            break;

        case 'valid':
            signalName = 'TP.sig.ValidChange';
            break;

        case 'value':
        default:
            signalName = 'TP.sig.ValueChange';
            break;
    }

    if (sourceAttr.isAccessPath()) {

        //  Do a 'get' to establish the interest in the path - we're not really
        //  interested in the value though. We don't do this if it's a URI,
        //  though, since the URI will do that automatically.
        if (!TP.isURI(resource)) {
            resource.get(sourceAttr);
        }
    } else {
        //  If the facet is 'value' as well, but the sourceAttr *isn't*, then we
        //  go ahead and set up for a spoofed <aspect>Change signal (if the
        //  sourceAttr is 'value' we'd rather have a signal name of
        //  'TP.sig.ValueChange' than 'ValueChange').
        if (facetName === 'value' && sourceAttr !== 'value') {
            signalName = sourceAttr.asStartUpper() + 'Change';
        }
    }

    //  Make sure that target object has a local method to handle the change
    methodName = TP.composeHandlerName(signalName);

    if (TP.notValid(handler = finalTarget.getMethod(methodName))) {

        //  Define a handler function
        handler = function(aSignal) {

            var origin,

                aspect,
                facet,

                mapKey,

                entry,
                targetAttr,
                transformFunc,

                source,
                newVal,

                parsedVal;

            try {
                origin = aSignal.getOrigin();

                aspect = aSignal.at('aspect');

                facet = aSignal.at('facet');

                //  Compute a map key in the same way we did above when we made
                //  the registration and see if the map has it.
                mapKey = TP.gid(origin) +
                                TP.JOIN +
                                TP.str(aspect) +
                                TP.JOIN +
                                facet;

                //  If we found a target attribute registration under the key,
                //  then perform the set()
                if (TP.notEmpty(entry =
                                handler.$observationsMap.at(mapKey))) {

                    //  The target attribute is the first item in the entry pair
                    //  and any (optional) transformation Function is the last.
                    targetAttr = entry.first();
                    transformFunc = entry.last();

                    newVal = aSignal.getValue();

                    //  If what we got back was a String, and that String can be
                    //  parsed into another 'JavaScript primitive' data type
                    //  (Number, Boolean, RegExp, etc.), then we do that here
                    //  *before* we call the transformation function.
                    if (TP.isString(newVal) &&
                        TP.isValid(parsedVal =
                                    TP.getParsedPrimitiveValue(newVal))) {
                        newVal = parsedVal;
                    }

                    //  If there was a transformation Function registered, then
                    //  execute it.
                    if (TP.isCallable(transformFunc)) {

                        source = aSignal.getSource();
                        newVal = transformFunc(source, newVal);
                    }

                    this.setFacet(targetAttr, facet, newVal, false);
                }
            } catch (e) {
                this.raise('TP.sig.InvalidBinding', TP.ec(e));
            }
        };

        //  Allocate an aspect map that various aspects will register themselves
        //  with. This allows a set of source aspects to share a single change
        //  handler function.
        handler.$observationsMap = TP.hc();
        finalTarget.defineHandler(signalName, handler);
    }

    if (facetName !== TP.ALL) {

        //  The key into the aspect map is the global ID of the resource, the
        //  source attr name and the source facet name all joined together.
        aspectKey = TP.gid(resource) + TP.JOIN +
                    TP.str(sourceAttr) + TP.JOIN +
                    facetName;

        //  Add an entry to make a mapping between a source aspect and a target
        //  aspect.
        handler.$observationsMap.atPut(aspectKey,
                                        TP.ac(targetAttributeName,
                                                transformationFunc));
    } else {

        //  TP.ALL was specified - set up an entry for each facet.

        allFacets = TP.FACET_NAMES.concat('value');
        for (i = 0; i < allFacets.getSize(); i++) {

            aspectKey = TP.gid(resource) + TP.JOIN +
                        TP.str(sourceAttr) + TP.JOIN +
                        allFacets.at(i);

            handler.$observationsMap.atPut(aspectKey,
                                            TP.ac(targetAttributeName,
                                                    transformationFunc));
        }
    }

    //  PERF

    //  If the resource is a URI and we can obtain the resource result value of
    //  it, make sure that it is configured to signal Change notifications.

    //  NB: We assume 'async' of false here.
    if (TP.isURI(resource) &&
        TP.isValid(resourceValue =
            resource.getResource(TP.hc('resultType', TP.WRAP)).get('result'))) {
        resourceValue.shouldSignalChange(true);
    }

    //  Go ahead and make the observation.
    finalTarget.observe(resource, signalName);

    return finalTarget;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will bound to. If not
     *     specified, this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @returns {Object} The receiver.
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName, transformationFunc);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the type receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will bound to. If not
     *     specified, this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @returns {Object} The receiver.
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName, transformationFunc);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the instance receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will bound to. If not
     *     specified, this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @returns {Object} The receiver.
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName, transformationFunc);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('destroyBinding',
function(target, targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @method destroyBinding
     * @summary Removes a binding from the supplied target object.
     * @param {Object} target The target object to remove the binding from.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will be unbound. If not
     *     specified, this will default to 'value'.
     * @returns {Object} The target object.
     */

    var resource,
        sourceAttr,

        facetName,
        signalName,
        aspectKey,

        methodName,

        handler,

        i,
        allFacets;

    if (TP.isEmpty(targetAttributeName)) {
        return this.raise('TP.sig.InvalidParameter',
            'No attribute name provided for bind.');
    }

    if (TP.isString(resourceOrURI)) {
        resource = TP.uc(TP.TIBET_URN_PREFIX + resourceOrURI);
    } else if (TP.isKindOf(resourceOrURI, TP.core.TIBETURL)) {
        resource = resourceOrURI.getConcreteURI();
    } else {
        resource = resourceOrURI;
    }

    //  Prefer URIs but can bind to any object in theory.
    if (TP.notValid(resource)) {
        return this.raise('TP.sig.InvalidResource',
            'No resource spec provided for bind.');
    }

    //  Get the source attribute. If there is no source attribute, then use the
    //  target attribute as the source attribute.
    if (TP.notValid(sourceAttr = sourceAttributeName)) {
        sourceAttr = targetAttributeName;
    }

    //  Get the source facet. If there is no source facet, then default it to
    //  'value'.
    if (TP.notValid(facetName = sourceFacetName)) {
        facetName = 'value';
    }

    //  Choose the correct subtype of TP.sig.FacetSignal to use, depending on
    //  facet.
    switch (facetName) {

        //  Specifying TP.ALL means that we use the supertype of all facet
        //  signals.
        case TP.ALL:
            signalName = 'TP.sig.FacetChange';
            break;

        case 'readonly':
            signalName = 'TP.sig.ReadonlyChange';
            break;

        case 'relevant':
            signalName = 'TP.sig.RelevantChange';
            break;

        case 'required':
            signalName = 'TP.sig.RequiredChange';
            break;

        case 'valid':
            signalName = 'TP.sig.ValidChange';
            break;

        case 'value':
        default:
            signalName = 'TP.sig.ValueChange';
            break;
    }

    if (!sourceAttr.isAccessPath()) {
        //  If the facet is 'value' as well, but the sourceAttr *isn't*, then we
        //  go ahead and set up for a spoofed <aspect>Change signal (if the
        //  sourceAttr is 'value' we'd rather have a signal name of
        //  'TP.sig.ValueChange' than 'ValueChange').
        if (facetName === 'value' && sourceAttr !== 'value') {
            signalName = sourceAttr.asStartUpper() + 'Change';
        }
    }

    //  Make sure that target object has a local method to handle the change
    methodName = TP.composeHandlerName(signalName);

    if (TP.isValid(handler = target.getMethod(methodName)) &&
        TP.isValid(handler.$observationsMap)) {

        if (facetName !== TP.ALL) {

            //  The key into the aspect map is the global ID of the resource,
            //  the source attr name and the source facet name all joined
            //  together.
            aspectKey = TP.gid(resource) + TP.JOIN +
                        TP.str(sourceAttr) + TP.JOIN +
                        facetName;

            //  There was a valid handler and a valid key map - remove our
            //  source aspect from it.
            handler.$observationsMap.removeKey(aspectKey);
        } else {

            //  TP.ALL was specified - remove the entry for each facet.

            allFacets = TP.FACET_NAMES.concat('value');
            for (i = 0; i < allFacets.getSize(); i++) {

                aspectKey = TP.gid(resource) + TP.JOIN +
                            TP.str(sourceAttr) + TP.JOIN +
                            allFacets.at(i);

                handler.$observationsMap.removeKey(aspectKey);
            }
        }
    }

    //  Ignore the target.
    target.ignore(resource, signalName);

    return target;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('destroyBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @method destroyBinding
     * @summary Removes a binding from the receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will be unbound. If not
     *     specified, this will default to 'value'.
     * @returns {Object} The receiver.
     */

    return TP.destroyBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('destroyBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @method destroyBinding
     * @summary Removes a binding from the type receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will be unbound. If not
     *     specified, this will default to 'value'.
     * @returns {Object} The receiver.
     */

    return TP.destroyBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('destroyBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @method destroyBinding
     * @summary Removes a binding from the instance receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will be unbound. If not
     *     specified, this will default to 'value'.
     * @returns {Object} The receiver.
     */

    return TP.destroyBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBindingScopeValues',
function() {

    /**
     * @method getBindingScopeValues
     * @summary Returns the binding scope values by starting at the receiver
     *      and traversing the DOM tree up to the #document node, gathering
     *      'bind:scope' attribute values along the way. This will be used to
     *      qualify binding expressions on the receiver.
     * @returns {Array} An Array of binding scope values.
     */

    var elem,

        localScopeNode,

        scopeVals;

    if (TP.notEmpty(scopeVals = this.get('scopeValues'))) {
        return scopeVals;
    }

    elem = this.getNativeNode();

    scopeVals = TP.ac();

    //  Check to see if there is a local 'scope' attribute on the element
    //  itself. This will be used to qualify any expressions on the element
    //  itself.
    if (TP.notEmpty(localScopeNode = TP.elementGetAttributeNodesInNS(
                            elem, /\w+:(scope|repeat)/, TP.w3.Xmlns.BIND))) {
        scopeVals.push(localScopeNode[0].value);
    }

    //  Gather the 'bind:scope' setting up the chain.
    TP.nodeAncestorsPerform(
        elem,
        function(aNode) {

            var scopeAttrNodes;

            //  Have to check to make sure we're not at the #document node.
            if (TP.isElement(aNode)) {

                //  Get any 'scope' attributes belonging to the TP.w3.Xmlns.BIND
                //  namespace.

                //  First, check to see if there's a 'bind:repeat' attribute. If
                //  so, we want to use it's value first.
                scopeAttrNodes = TP.elementGetAttributeNodesInNS(
                                aNode, 'repeat', TP.w3.Xmlns.BIND);

                if (TP.notEmpty(scopeAttrNodes)) {
                    scopeVals.push(scopeAttrNodes[0].value);
                }

                //  Then, check to see if there's a 'bind:scope' attribute. If
                //  so, we want to use it's value next.
                scopeAttrNodes = TP.elementGetAttributeNodesInNS(
                                aNode, 'scope', TP.w3.Xmlns.BIND);

                if (TP.notEmpty(scopeAttrNodes)) {
                    scopeVals.push(scopeAttrNodes[0].value);
                }
            }
        });

    //  Make sure to reverse the scope values, since we want the 'most
    //  significant' to be first.
    scopeVals.reverse();

    this.set('scopeValues', scopeVals);

    return scopeVals;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$regenerateRepeat',
function(aCollection) {

    var elem,

        repeatContent,

        bodyFragment,

        mgmtElement,

        startIndex,
        endIndex,

        i,

        newNode;

    if (TP.notValid(aCollection)) {
        return;
    }

    elem = this.getNativeNode();

    //  This will be a DocumentFragment that we stuffed away when the receiver
    //  was rebuilt.
    repeatContent = this.get('repeatContent');

    bodyFragment = TP.nodeGetDocument(elem).createDocumentFragment();

    startIndex = 0;
    endIndex = aCollection.getSize();

    //  Iterate over the resource and build out a chunk of markup for each
    //  item in the resource.
    for (i = startIndex; i < endIndex; i++) {

        //  Make sure to clone the content.
        newNode = TP.nodeCloneNode(repeatContent);

        //  Append this new chunk of markup to the document fragment we're
        //  building up and then loop to the top to do it again.
        bodyFragment.appendChild(newNode);
    }

    //  Append a 'management element' under ourself to manage things like awaken
    mgmtElement = TP.documentConstructElement(this.getNativeDocument(),
                                                'span',
                                                TP.w3.Xmlns.XHTML);
    TP.elementSetAttribute(mgmtElement, 'tibet:nomutationtracking', true, true);

    //  Append the management element under the receiver element
    mgmtElement = TP.nodeAppendChild(elem, mgmtElement, false);


    //  Finally, append the whole fragment under the receiver element
    TP.nodeAppendChild(mgmtElement, bodyFragment, false);

    //  Bubble any xmlns attributes upward to avoid markup clutter.
    TP.elementBubbleXMLNSAttributes(mgmtElement);

    TP.nodeAwakenContent(mgmtElement);

    this.defineAttribute('generatedContent');
    this.set('generatedContent', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('rebuildRepeat',
function(aSignalOrHash) {

    var bindingAttachPoint,

        bindingAttachLocations,
        bidiAttrs,

        childrenFragment;

    bindingAttachPoint = this.getBindingAttachPoint();

    bindingAttachLocations = TP.ac();

    this.addBindingEntriesFromBindAttr(
                    'repeat', TP.IN, bidiAttrs,
                    bindingAttachLocations,
                    bindingAttachPoint);

    if (TP.isEmpty(bindingAttachLocations)) {
        return this;
    }

    this.getDocument().registerChangeNotificationsFor(
                bindingAttachLocations,
                bindingAttachPoint);

    //  If there is no children content already captured, then capture it.
    if (TP.notValid(childrenFragment = this.get('repeatContent'))) {

        //  Grab the childNodes of the receiver as a DocumentFragment.
        //  NOTE: This *removes* these child nodes from the receiver.
        childrenFragment = TP.nodeListAsFragment(
                                this.getNativeNode().childNodes);

        //  Make sure to define the attribute or TIBET will warn ;-).
        this.defineAttribute('repeatContent');

        //  Store our repeat content away for use later.
        this.set('repeatContent', childrenFragment);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------

//  ========================================================================
//  MARKUP BINDING
//  ========================================================================

//  ------------------------------------------------------------------------
//  TP.core.DocumentNode
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineHandler('FacetChange',
function(aSignal) {

    /**
     * @method handleFacetChange
     * @summary
     * @param {Change} aSignal The signal instance which triggered this handler.
     */

    var signalFlag,

        primarySource,

        doc,

        query,
        elems,

        boundAttrNodes,
        i,
        j,

        attrs,

        tpDocElem,

        changedPrimaryLoc,
        changedPathKeys,
        len,
        len2,

        attrName,

        searchPath,

        matcher,

        pathParts,

        changedPaths,

        changedPath,

        initialVal,

        ownerTPElem,
        attrVal;

    signalFlag = TP.sys.shouldSignalDOMLoaded();
    TP.sys.shouldSignalDOMLoaded(false);

    primarySource = aSignal.getOrigin().getResource().get('result');
    initialVal = primarySource.get('value');

    doc = this.getNativeNode();

    //  Query for all elements containing namespaced attributes of 'io', 'in',
    //  'scope' or repeat. This is the most sophisticated 'namespace like' query
    //  we can give the native querySelectorAll() call since it doesn't really
    //  recognize namespaces... we'll fix that later.
    query = '*[*|io]' + ', ' +
            '*[*|in]' + ', ' +
            '*[*|scope]' + ', ' +
            '*[*|repeat]';

    elems = TP.ac(doc.documentElement.querySelectorAll(query));

    tpDocElem = this.getDocumentElement();

    changedPrimaryLoc = aSignal.getOrigin().getPrimaryURI().getLocation();

    boundAttrNodes = TP.ac();
    for (i = 0; i < elems.length; i++) {
        attrs = elems[i].attributes;

        for (j = 0; j < attrs.length; j++) {

            attrVal = attrs[j].value;

            if (attrs[j].namespaceURI === TP.w3.Xmlns.BIND &&
                (attrVal.indexOf(changedPrimaryLoc) !== TP.NOT_FOUND ||
                TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(attrVal))) {
                boundAttrNodes.push(attrs[j])
            }
        }
    }

    if (TP.isValid(changedPaths = aSignal.at(TP.CHANGE_PATHS))) {

        var startUpdate = Date.now();

        //  TODO: Probably need to go after all of the changed path values
        //  rather than the key

        changedPath = aSignal.at('aspect');

        //  Start by refreshing all bindings that mention the primary URI as
        //  part of their binding expression.
        pathParts = TP.getAccessPathParts(changedPath);

        //  Unshift the primary location onto the front.
        pathParts.unshift(changedPrimaryLoc);

        tpDocElem.refreshBranches(
                primarySource, aSignal, elems, initialVal, pathParts);

        var endUpdate = Date.now();
        TP.totalUpdateTime += (endUpdate - startUpdate);

    } else {

        var startSetup = Date.now();

        //  Refresh all bindings
        tpDocElem.refreshBranches(
                primarySource, aSignal, elems, initialVal, null);

        var endSetup = Date.now();
        TP.totalSetupTime += (endSetup - startSetup);
    }

    TP.sys.shouldSignalDOMLoaded(signalFlag);

    return;
});

//  ------------------------------------------------------------------------
//  TP.core.ElementNode
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The attributes for this element type that are considered to 'bidi
//  attributes' that can not only be bound to data source but be bound *back* to
//  the data source so that when they are changed by the user, they update the
//  data source.
TP.core.ElementNode.Type.defineAttribute('bidiAttrs', TP.ac());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('computeTransformationFunction',
function(attrValue) {

    var finalExpr,
        isSimpleExpr,

        referencedExprs,

        sigilIndex,

        exprParts,
        exprWithBrackets,
        exprWithoutBrackets,

        hasSurroundingContent,

        formatExpr,
        valueExpr,

        splitURI,
        computedValueExpr,

        transformFunc;

    //  The final computed expression
    finalExpr = attrValue;

    isSimpleExpr = true;

    referencedExprs = TP.ac();

    //  While we can still extract binding expressions from the value, keep
    //  looping. This allows us to have multiple expressions in a single value
    //  (i.e. 'foo [[bar]] is called: [[baz]]')
    TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
    while (TP.isValid(exprParts =
            TP.regex.BINDING_STATEMENT_EXTRACT.exec(attrValue))) {

        //  We want the expression both with and without the surrounding
        //  brackets ([[...]])
        exprWithBrackets = exprParts.first();
        exprWithoutBrackets = exprParts.last();

        hasSurroundingContent = '[[' + exprWithoutBrackets + ']]' !== attrValue;

        if (TP.regex.ACP_FORMAT.test(exprWithoutBrackets)) {
            sigilIndex = exprWithoutBrackets.indexOf('.%');

            valueExpr = exprWithoutBrackets.slice(0, sigilIndex).trim();
            formatExpr = ' .% ' + exprWithoutBrackets.slice(
                                                    sigilIndex + 2).trim();
        } else {
            valueExpr = exprWithoutBrackets;
            formatExpr = '';
        }

        //  If the expression to execute is a path that contains variables, then
        //  we just set up an observation on the 'value' of the URI and leverage
        //  the transformation function installed below to form a final value.
        if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(valueExpr)) {

            isSimpleExpr = false;

            //  If the expression to execute is a fully-formed URI, then we
            //  don't take the scope values into consideration. We build a
            //  URI location consisting of the URI's primary href with a
            //  '#tibet(...)' XPointer that will return the source object
            //  itself. This is important in the transformation function when we
            //  run the 'transform' call, because the expression is going to
            //  expect to run against the core source object itself. We then
            //  reset the expression to execute to be just the fragment text.
            if (TP.regex.URI_STRICT.test(valueExpr) &&
                TP.regex.SCHEME.test(valueExpr)) {

                //  Grab the primary URI from a URI computed from the value
                //  expression and append a '#tibet(.)' on it (which will
                //  retrieve the whole value).
                splitURI = TP.uc(valueExpr);
                valueExpr = splitURI.getPrimaryHref() + '#tibet(.)';

                //  Reset the value expression to just the fragment.
                computedValueExpr = splitURI.getFragmentExpr();
            } else {
                computedValueExpr = valueExpr;
            }

            //  Make sure to replace that expression in the expression to
            //  execute with a 'formatting expression', so that the templating
            //  function below will work.
            finalExpr = finalExpr.replace(
                            exprWithBrackets,
                            '{{' + computedValueExpr + formatExpr + '}}');
            finalExpr = finalExpr.unquoted('"');
        } else {

            //  If the expression to execute (surrounded by '[['...']]') is not
            //  the same as the whole attribute value, that means that there's
            //  surrounding literal content, so we flip the 'isSimpleExpr' flag
            //  to false and install a more complex transformation function
            //  below.
            if (TP.notEmpty(formatExpr) || hasSurroundingContent) {
                isSimpleExpr = false;
                finalExpr = finalExpr.replace(
                                exprWithBrackets,
                                '{{value' + formatExpr + '}}');
                finalExpr = finalExpr.unquoted('"');
            }
        }

        referencedExprs.push(valueExpr);
    }

    //  If this is not a simple expression, then we install a transformation
    //  Function that will transform the data before returning it.
    if (!isSimpleExpr) {

        transformFunc = function(
                            source, val, targetTPElem, repeatSource, index) {
            var wrappedVal,

                params,

                repeatResourceResult,
                last,

                retVal;

            wrappedVal = TP.wrap(val);

            if (TP.isNumber(index)) {

                last = repeatSource.getSize() - 1;

                //  Iterating context
                params = TP.hc(
                    '$REQUEST', null,
                    '$TP', TP,
                    '$APP', APP,
                    '$TAG', targetTPElem,
                    '$TARGET', targetTPElem.getDocument(),
                    '$_', wrappedVal,
                    '$INPUT', repeatResourceResult,
                    '$INDEX', index,
                    '$FIRST', index === 0,
                    '$MIDDLE', index > 0 && index < last,
                    '$LAST', index !== last,
                    '$EVEN', index % 2 === 0,
                    '$ODD', index % 2 !== 0,
                    '$#', index);
            } else {
                //  Non-iterating context
                params = TP.hc(
                    '$REQUEST', null,
                    '$TP', TP,
                    '$APP', APP,
                    '$TAG', targetTPElem,
                    '$TARGET', targetTPElem.getDocument(),
                    '$_', wrappedVal,
                    '$INPUT', val);
            }

            //  Don't try to template invalid values.
            if (TP.isValid(val)) {
                retVal = transformFunc.$$templateFunc.transform(val, params);
            } else {
                //  null or undefined, but let's be pendantic
                retVal = val;
            }

            return retVal;
        };

        transformFunc.$$templateFunc = finalExpr.compile();

    } else {

        //  Otherwise, we generated a simple transformation Function that will
        //  just return the 'reduced value'. This is necessary especially for
        //  XML where val will be an Element, but we want the text value of
        //  the Element.
        transformFunc = function(source, val) {
            return TP.val(val);
        };
    }

    return TP.ac(transformFunc, referencedExprs);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('computeBindingInfo',
function(targetElement, attributeValue) {

    /**
     * @method getBindingInfoFrom
     * @summary Gets binding information from the attribute named by the
     *     supplied attribute name on the receiver.
     * @returns {TP.core.Hash} A hash of binding information keyed by the
     *     binding target name.
     */

    var attrVal,

        entryStr,
        bindEntries,

        keys,
        key,

        len,
        i,

        fullExpr,

        entry,
        hadBrackets,
        preEntry,
        postEntry,

        sigilIndex,
        formatExpr,

        transformInfo,
        transformFunc,
        dataLocs;

    attrVal = attributeValue;

    //  Otherwise, parse out each name: value pair.

    //  First, try to get the attribute as a JSON string. This allows for
    //  attribute values like:
    //
    //      {value: urn:tibet:fluffy}
    //
    //      which are converted to:
    //
    //      {"value": "urn:tibet:fluffy"}
    entryStr = TP.reformatJSToJSON(attrVal);

    //  If we couldn't get a JSON String, try to default it to {"value":"..."}
    if (!TP.isJSONString(entryStr)) {
        entryStr = '{"value":"' + attrVal + '"}';
    }

    //  Try to parse the entry string into a TP.core.Hash.
    bindEntries = TP.json2js(entryStr);

    if (TP.isEmpty(bindEntries)) {
        return this.raise('TP.sig.InvalidBinding',
                            'Source Element: ' + TP.str(targetElement) +
                            ' Generated bindings: ' + entryStr);
    }

    keys = bindEntries.getKeys();

    len = bindEntries.getSize();
    for (i = 0; i < len; i++) {
        key = keys.at(i);

        entry = bindEntries.at(key);

        hadBrackets = TP.regex.BINDING_STATEMENT_DETECT.test(entry);

        if (hadBrackets) {
            formatExpr = null;

            preEntry = entry.slice(0, entry.indexOf('[['));
            postEntry = entry.slice(entry.indexOf(']]') + 2);
            entry = entry.slice(entry.indexOf('[[') + 2, entry.indexOf(']]'));

            if (TP.regex.ACP_FORMAT.test(entry)) {
                sigilIndex = entry.indexOf('.%');
                formatExpr = entry.slice(sigilIndex);
                entry = entry.slice(0, sigilIndex).trim();
            }

            fullExpr = entry;

            if (TP.notEmpty(formatExpr)) {
                fullExpr += formatExpr;
            }

            fullExpr =
                preEntry + '[[' + fullExpr + ']]' + postEntry;

            //  Sometimes the expression is quoted to allow whitespace in the
            //  *value* portion of the 'JSON-y' structure that we use to define
            //  bindings, but we don't want surrounding quotes here - strip them
            //  off.
            fullExpr = fullExpr.unquoted();
        } else {
            fullExpr = entry;
        }

        if (hadBrackets &&
            (!/^\s*\[\[/.test(fullExpr) || !/\]\]\s*$/.test(fullExpr) ||
            TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(fullExpr) ||
            TP.regex.ACP_FORMAT.test(fullExpr))) {

            transformInfo = this.computeTransformationFunction(
                                                    fullExpr);

            //  The Function object that does the transformation.
            transformFunc = transformInfo.first();

            //  The referenced expressions
            dataLocs = transformInfo.last();
        } else {
            dataLocs = TP.ac(entry);
        }

        bindEntries.atPut(key, TP.hc('targetAttrName', key,
                                        'transformFunc', transformFunc,
                                        'dataExprs', dataLocs))
    }

    return bindEntries;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineAttribute('scopeValues');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getTextNodesMatching',
function(aMatchFunc) {

    var iterator,
        matchingTextNodes,
        textNode;

    var startTextQuery = Date.now();

    iterator = this.getDocument().getNativeNode().createNodeIterator(
                this.getNativeNode(), NodeFilter.SHOW_TEXT, null, false);

    matchingTextNodes = TP.ac();
    textNode = iterator.nextNode();
    while (textNode) {
        if (aMatchFunc(textNode)) {
            matchingTextNodes.push(textNode);
        }
        textNode = iterator.nextNode();
    }

    var endTextQuery = Date.now();
    TP.totalTextQueryTime += (endTextQuery - startTextQuery);

    return matchingTextNodes;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBindingInfoFrom',
function(attributeValue) {

    /**
     * @method getBindingInfoFrom
     * @summary Gets binding information from the attribute named by the
     *     supplied attribute name on the receiver.
     * @returns {TP.core.Hash} A hash of binding information keyed by the
     *     binding target name.
     */

    var elem,
        doc,

        registry,

        bindEntries;

    elem = this.getNativeNode();
    doc = TP.nodeGetDocument(this.getNativeNode());

    if (TP.notValid(registry = doc[TP.BIND_INFO_REGISTRY])) {
        registry = TP.hc();
        doc[TP.BIND_INFO_REGISTRY] = registry;
    }

    if (registry.hasKey(attributeValue)) {
        return registry.at(attributeValue);
    }

    bindEntries = this.getType().computeBindingInfo(elem, attributeValue);

    registry.atPut(attributeValue, bindEntries);

    return bindEntries;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isBoundElement',
function() {

    /**
     * @method isBoundElement
     * @summary Whether or not the receiver is a bound element.
     * @returns {Boolean} Whether or not the receiver is bound.
     */

    var bindAttrNodes;

    //  We look for either 'in', 'out', 'io' here to determine if the receiver
    //  is bound. The 'scope' attribute doesn't indicate that it is bound.
    bindAttrNodes = TP.elementGetAttributeNodesInNS(
            this.getNativeNode(), /.*:(in|out|io)/, TP.w3.Xmlns.BIND);

    if (TP.notEmpty(bindAttrNodes)) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isScopingElement',
function() {

    var elem;

    elem = this.getNativeNode();

    return TP.elementHasAttribute(elem, 'bind:scope', true) ||
            TP.elementHasAttribute(elem, 'bind:repeat', true);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('refreshBranches',
function(primarySource, aSignal, elems, initialVal, pathParts) {

    var elem,

        subscopes,

        nextElems,

        boundAttrNodes,
        attrs,
        i,
        j,

        ownerElem,

        searchParts,

        partsNegativeSlice,

        searchPath,

        branchMatcher,
        leafMatcher,

        ownerWrappers,

        len,

        boundAttr,
        attrName,
        attrVal,

        ownerTPElem,
        expr,
        branchVal,

        remainderParts;

    elem = this.getNativeNode();

    var startQuery = Date.now();

    subscopes = TP.ac(elem.querySelectorAll('*[*|scope]'));

    subscopes = subscopes.filter(
            function(aSubscope) {

                var k;

                for (k = 0; k < subscopes.length; k++) {
                    if (subscopes[k] !== aSubscope &&
                        subscopes[k].contains(aSubscope)) {
                        return false;
                    }
                }

                return true;
            });

    nextElems = elems.filter(
            function(anElem) {

                var k;

                if (anElem === elem) {
                    return false;
                }

                if (elem.contains(anElem)) {
                    for (k = 0; k < subscopes.length; k++) {
                        if (subscopes[k].contains(anElem)) {
                            return false;
                        }
                    }

                    return true;
                }
                return false;
            });

    nextElems = nextElems.concat(subscopes);

    boundAttrNodes = TP.ac();
    for (i = 0; i < nextElems.length; i++) {
        attrs = nextElems[i].attributes;

        for (j = 0; j < attrs.length; j++) {

            //  Make sure the attribute is in the binding namespace
            if (attrs[j].namespaceURI === TP.w3.Xmlns.BIND) {
                boundAttrNodes.push(attrs[j])
            }
        }
    }

    ownerWrappers = TP.hc();

    var endQuery = Date.now();
    TP.totalBranchQueryTime += (endQuery - startQuery);

    if (TP.isEmpty(pathParts)) {

        len = boundAttrNodes.getSize();
        for (i = 0; i < len; i++) {
            boundAttr = boundAttrNodes.at(i);

            attrName = boundAttr.localName;
            attrVal = boundAttr.value;

            ownerElem = boundAttr.ownerElement;

            //  Nested scope?
            if (attrName === 'scope' || attrName === 'repeat') {

                expr = attrVal;

                if (TP.regex.URI_STRICT.test(expr) &&
                    TP.regex.SCHEME.test(expr)) {
                    expr = TP.uc(expr).getFragmentExpr();
                }

                if (TP.notEmpty(expr)) {
                    branchVal = initialVal.get(expr);
                } else {
                    branchVal = initialVal;
                }

                TP.wrap(ownerElem).refreshBranches(
                            primarySource, aSignal, elems, branchVal, null);
            } else {

                //  There are different types of wrappers depending on full tag
                //  name of element (ns:tagname)

                if (TP.notValid(
                        ownerTPElem = ownerWrappers.at(ownerElem.tagName))) {
                    ownerTPElem = TP.core.ElementNode.construct(ownerElem);
                    ownerWrappers.atPut(ownerElem.tagName, ownerTPElem);
                }

                //  NB: Primitive and fast way to set native node
                ownerTPElem.$set('node', ownerElem, false);

                ownerTPElem.refreshLeaf(
                            primarySource, aSignal, initialVal, boundAttr);
            }
        }

    } else {

        searchParts = pathParts;

        partsNegativeSlice = 0;

        //  Work in reverse order, trying to find the 'most specific'
        //  branching elements.
        while (TP.notEmpty(searchParts)) {

            //  Build a matcher to search for the search path
            searchPath = TP.uriJoinFragments.apply(TP, searchParts);

            branchMatcher = TP.rc('^' + TP.regExpEscape(searchPath));
            leafMatcher = TP.rc(TP.regExpEscape(searchPath));

            len = boundAttrNodes.getSize();
            for (j = 0; j < len; j++) {
                boundAttr = boundAttrNodes.at(j);

                attrName = boundAttr.localName;
                attrVal = boundAttr.value;

                ownerElem = boundAttr.ownerElement;

                if ((attrName === 'scope' || attrName === 'repeat') &&
                    branchMatcher.test(attrVal)) {

                    ownerTPElem = TP.wrap(ownerElem);

                    expr = attrVal;

                    if (TP.regex.URI_STRICT.test(expr) &&
                        TP.regex.SCHEME.test(expr)) {
                        expr = TP.uc(expr).getFragmentExpr();
                    }

                    if (TP.notEmpty(expr)) {
                        branchVal = initialVal.get(expr);
                    } else {
                        branchVal = initialVal;
                    }

                    remainderParts = pathParts.slice(partsNegativeSlice);

                    ownerTPElem.refreshBranches(
                            primarySource,
                            aSignal,
                            elems,
                            branchVal,
                            remainderParts);
                } else if (leafMatcher.test(attrVal)) {

                    //  TODO: Different types of wrappers depending on full name
                    //  of element (ns:tagname)

                    if (TP.notValid(
                        ownerTPElem = ownerWrappers.at(ownerElem.tagName))) {
                        ownerTPElem = TP.core.ElementNode.construct(ownerElem);
                        ownerWrappers.atPut(ownerElem.tagName, ownerTPElem);
                    }

                    //  NB: Primitive and fast way to set native node
                    ownerTPElem.$set('node', ownerElem, false);

                    ownerTPElem.refreshLeaf(
                                primarySource, aSignal, initialVal, boundAttr);
                }
            }

            partsNegativeSlice--;
            searchParts = pathParts.slice(0, partsNegativeSlice);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('refreshLeaf',
function(primarySource, aSignal, initialVal, bindingAttr) {

    var facet,

        aspect,

        entry,

        exprs,
        expr,

        attrValue,

        info,
        infoKeys,
        len,
        i,

        transformFunc,
        finalVal;

    var start = Date.now();

    if (TP.notValid(initialVal)) {
        return this;
    }

    facet = aSignal.at('facet');

    attrValue = bindingAttr.value;
    info = this.getBindingInfoFrom(attrValue);

    infoKeys = info.getKeys();
    len = infoKeys.getSize();

    for (i = 0; i < len; i++) {

        aspect = infoKeys.at(i);
        entry = info.at(aspect);

        exprs = entry.at('dataExprs');

        if (TP.notEmpty(exprs)) {

            //  This should only have one expression. If it has more than
            //  one, then we need to raise an exception.
            if (exprs.getSize() > 1) {
                //  TODO: Raise
                continue;
            }

            expr = exprs.at(0);

            if (TP.regex.URI_STRICT.test(expr) &&
                TP.regex.SCHEME.test(expr)) {
                expr = TP.uc(expr).getFragmentExpr();
            }

            finalVal = initialVal.get(expr);
            if (TP.notValid(finalVal) &&
                TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(expr)) {
                finalVal = initialVal;
            }
        }

        if (TP.isCallable(transformFunc = entry.at('transformFunc'))) {

            finalVal = transformFunc(
                            aSignal.getSource(),
                            finalVal,
                            this,
                            null,
                            null);
        }

        if (aspect === 'value') {
            this.setValue(finalVal, false);
        } else {
            this.setFacet(aspect, facet, finalVal, false);
        }
    }

    var end = Date.now();
    TP.totalInitialGetTime += (end - start);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setBoundValue',
function(aValue) {

    var scopeVals,
        bindingInfo,

        bidiAttrs;

    scopeVals = this.getBindingScopeValues();

    bindingInfo = this.getBindingInfoFrom(this.getAttribute('bind:io'));

    bidiAttrs = this.getType().get('bidiAttrs');

    bindingInfo.perform(
        function(bindEntry) {

            var attrName,

                bindVal,

                dataExprs,
                i,
                dataExpr,

                allVals,
                fullExpr,

                wholeURI,
                primaryURI,

                frag;

            attrName = bindEntry.first();

            //  If the attribute isn't one of the bidi attributes, then we can
            //  just exit here (i.e. its not an attribute that we can 'set' from
            //  the UI)
            if (!bidiAttrs.contains(attrName)) {
                return;
            }

            bindVal = bindEntry.last();

            dataExprs = bindVal.at('dataExprs');

            for (i = 0; i < dataExprs.getSize(); i++) {
                dataExpr = dataExprs.at(i);

                if (TP.notEmpty(scopeVals)) {
                    //  Concatenate the binding value onto the scope values
                    //  array (thereby creating a new Array) and use it to
                    //  join all of the values together.
                    allVals = scopeVals.concat(dataExpr);
                    fullExpr = TP.uriJoinFragments.apply(TP, allVals);

                    //  If we weren't able to compute a real URI from the
                    //  fully expanded URI value, then raise an exception
                    //  and return here.
                    if (!TP.regex.URI_STRICT.test(fullExpr)) {
                        this.raise('TP.sig.InvalidURI');

                        return TP.BREAK;
                    }

                    wholeURI = TP.uc(fullExpr);
                } else {
                    //  Scope values is empty - this is (hopefully) a fully
                    //  qualified binding expression.

                    //  If we weren't able to compute a real URI from the
                    //  fully expanded URI value, then raise an exception
                    //  and return here.
                    if (!TP.regex.URI_STRICT.test(dataExpr = TP.trim(dataExpr))) {
                        this.raise('TP.sig.InvalidURI');

                        return TP.BREAK;
                    }

                    wholeURI = TP.uc(dataExpr);
                }

                primaryURI = wholeURI.getPrimaryURI();
                frag = wholeURI.getFragmentExpr();

                primaryURI.getResource().get('result').set(
                                                TP.apc(frag), aValue);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
