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

//  ========================================================================
//  MARKUP BINDING
//  ========================================================================

TP.totalSetupTime = 0;

TP.totalBranchQueryTime = 0;
TP.totalInlineQueryTime = 0;
TP.totalTextQueryTime = 0;

TP.totalUpdateTime = 0;

TP.totalInitialGetTime = 0;

//  ------------------------------------------------------------------------
//  TP.core.DocumentNode
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineAttribute('$signalingBatchID');
TP.core.DocumentNode.Inst.defineAttribute('$observedURIs');
TP.core.DocumentNode.Inst.defineAttribute('$repeatTemplates');

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

    var changedPaths,

        ourBatchID,
        signalBatchID,

        signalFlag,

        primarySource,
        initialVal,

        doc,

        query,
        elems,

        tpDocElem,

        changedPrimaryLoc,

        boundAttrNodes,
        i,
        attrs,
        j,
        attrVal,

        changedPathKeys,
        keysToProcess,

        matcher,
        len,

        attrName,

        ownerTPElem;

    changedPaths = aSignal.at(TP.CHANGE_PATHS);

    if (TP.isValid(changedPaths)) {
        if (TP.notValid(ourBatchID = this.get('$signalingBatchID'))) {

            //  If there's already a TP.END_SIGNAL_BATCH id before we've even
            //  set our cached batch ID, then there must've only been one path
            //  so we go ahead and process the signal.
            if (TP.isValid(signalBatchID = aSignal.at(TP.END_SIGNAL_BATCH))) {
                //  empty
            } else {
                if (TP.isValid(
                        signalBatchID = aSignal.at(TP.START_SIGNAL_BATCH))) {
                    this.set('$signalingBatchID', signalBatchID);
                }

                //  At the start of a batch (or a batchID wasn't provided). In
                //  either case, don't update - just return
                return;
            }
        } else if (TP.isValid(signalBatchID = aSignal.at(TP.END_SIGNAL_BATCH))) {
            if (ourBatchID !== signalBatchID) {
                //  The batch is ending, but it didn't match our cached batch ID
                //  then return
                return;
            }

            //  Otherwise, we clear our cached batch ID proceed ahead.
            this.set('$signalingBatchID', null);
        } else {
            //  This wasn't the end of the batch - return.
            return;
        }
    }

    signalFlag = TP.sys.shouldSignalDOMLoaded();
    TP.sys.shouldSignalDOMLoaded(false);

    primarySource = aSignal.getOrigin().getResource().get('result');
    initialVal = primarySource;

    doc = this.getNativeNode();

    //  Query for all elements containing namespaced attributes of 'io', 'in',
    //  'scope' or repeat. This is the most sophisticated 'namespace like' query
    //  we can give the native querySelectorAll() call since it doesn't really
    //  recognize namespaces... we'll fix that later.
    query = '*[*|io], *[*|in], *[*|scope], *[*|repeat]';

    elems = TP.ac(doc.documentElement.querySelectorAll(query));

    tpDocElem = this.getDocumentElement();

    changedPrimaryLoc = aSignal.getOrigin().getPrimaryLocation();

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

    if (TP.isValid(changedPaths)) {

        var startUpdate = Date.now();

        changedPathKeys = changedPaths.getKeys();

        changedPathKeys.sort(
            function(a, b) {

                return a.length - b.length;
            });

        keysToProcess = TP.ac(changedPathKeys.first());

        for (i = 0; i < changedPathKeys.getSize(); i++) {

            //  NB: We use getSize() here as we expect that this Array could
            //  change size as we add keys to it.
            for (j = 0; j < keysToProcess.getSize(); j++) {
                if (changedPathKeys.at(i).startsWith(keysToProcess.at(j))) {
                    continue;
                }

                keysToProcess.push(changedPathKeys.at(i));
            }
        }

        keysToProcess.perform(
                function(changedPath) {

                    var actions,
                        actionLen,
                        k,

                        pathAction,
                        pathParts,
                        pathType;

                    actions = changedPaths.at(changedPath).getKeys();

                    actionLen = actions.getSize();
                    for (k = 0; k < actionLen; k++) {
                        pathAction = actions.at(k);

                        pathParts = TP.getAccessPathParts(changedPath);
                        pathType = TP.getAccessPathType(changedPath);

                        if (pathType === TP.XPATH_PATH_TYPE &&
                            changedPath.startsWith('/')) {
                            pathParts.atPut(0, '/' + pathParts.at(0));
                        } else if (pathType === TP.TIBET_PATH_TYPE) {
                            initialVal = initialVal.get('value');
                        }

                        pathParts.unshift(
                                '#' + TP.getPointerScheme(changedPath) + '()');

                        //  Unshift the primary location onto the front.
                        pathParts.unshift(changedPrimaryLoc);

                        tpDocElem.refreshBranches(
                            primarySource, aSignal, elems, initialVal,
                            pathType, pathParts, pathAction);
                    }
                });

        var endUpdate = Date.now();
        TP.totalUpdateTime += (endUpdate - startUpdate);

    } else {

        var startSetup = Date.now();

        //  Refresh all 'absolute' leafs

        matcher = TP.rc(TP.regExpEscape(changedPrimaryLoc));

        len = boundAttrNodes.getSize();
        for (i = 0; i < len; i++) {

            attrName = boundAttrNodes.at(i).localName;

            ownerTPElem = TP.wrap(boundAttrNodes.at(i).ownerElement);

            if (attrName === 'io' || attrName === 'in') {

                attrVal = boundAttrNodes.at(i).value;

                if (matcher.test(attrVal)) {
                    ownerTPElem.refreshLeaf(primarySource, aSignal,
                                            initialVal, boundAttrNodes[i]);
                }
            }
        }

        //  Refresh all bindings
        tpDocElem.refreshBranches(
                primarySource, aSignal, elems, initialVal,
                null, null, null);

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
            if (TP.isURIString(valueExpr)) {

                //  Grab the primary URI from a URI computed from the value
                //  expression and append a '#tibet(.)' on it (which will
                //  retrieve the whole value).
                splitURI = TP.uc(valueExpr);
                valueExpr = splitURI.getPrimaryLocation() + '#tibet(.)';

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

        transformFunc = function(source, val, targetTPElem,
                                    repeatSource, index, isXMLResource) {
            var wrappedVal,

                params,

                repeatResourceResult,
                last,

                retVal;

            wrappedVal = TP.wrap(val);

            //  Iterating context
            if (TP.isNumber(index)) {

                if (isXMLResource) {

                    last = repeatSource.getSize();

                    params = TP.hc(
                        '$REQUEST', null,
                        '$TP', TP,
                        '$APP', APP,
                        '$TAG', targetTPElem,
                        '$TARGET', targetTPElem.getDocument(),
                        '$_', wrappedVal,
                        '$INPUT', repeatResourceResult,
                        '$INDEX', index,
                        '$FIRST', index === 1,
                        '$MIDDLE', index > 1 && index < last,
                        '$LAST', index !== last,
                        '$EVEN', index % 2 === 0,
                        '$ODD', index % 2 !== 0,
                        '$#', index);
                } else {

                    last = repeatSource.getSize() - 1;

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
                }
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

        //  If the expression contains ACP variables, then we *must* generate a
        //  transformation Function to process them properly. The expression
        //  might or might not have surrounding '[[...]]', but we take care of
        //  that here.
        if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(fullExpr)) {

            //  If the expression doesn't start with '[[' AND end with ']]',
            //  then we fix that here.
            if (!/^\s*\[\[/.test(fullExpr) && !/\]\]\s*$/.test(fullExpr)) {
                fullExpr = '[[' + fullExpr + ']]';
            }

            transformInfo = this.computeTransformationFunction(
                                                    fullExpr);

            //  The Function object that does the transformation.
            transformFunc = transformInfo.first();

            //  The referenced expressions
            dataLocs = transformInfo.last();
        } else if (hadBrackets &&
            (!/^\s*\[\[/.test(fullExpr) || !/\]\]\s*$/.test(fullExpr) ||
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

TP.core.ElementNode.Inst.defineMethod('$getBoundElements',
function(wantsShallow) {

    var elem,

        doc,

        subscopeQuery,
        allSubscopes,
        shallowSubscopes,

        allBoundQuery,
        boundElems;

    elem = this.getNativeNode();

    doc = TP.nodeGetDocument(elem);

    //  If the caller wants the 'shallow set', then we do *not* want to return
    //  elements that are under subscopes of the receiver. We need to compute
    //  the set of subscopes that *are* under the receiver, so that we can use
    //  them later for filtering.
    if (wantsShallow) {
        subscopeQuery = '*[*|scope], *[*|repeat]';

        allSubscopes =
            TP.ac(doc.documentElement.querySelectorAll(subscopeQuery));
        shallowSubscopes = allSubscopes.filter(
                function(aSubscope) {

                    var k;

                    for (k = 0; k < allSubscopes.length; k++) {
                        if (allSubscopes[k] !== aSubscope &&
                            allSubscopes[k].contains(aSubscope)) {
                            return false;
                        }
                    }

                    return true;
                });
    }

    allBoundQuery = '*[*|io], *[*|in], *[*|scope], *[*|repeat]';

    boundElems = TP.ac(doc.documentElement.querySelectorAll(allBoundQuery));
    boundElems = boundElems.filter(
            function(aNewElem) {

                var k;

                if (aNewElem === elem) {
                    return false;
                }

                if (elem.contains(aNewElem)) {
                    if (wantsShallow) {
                        for (k = 0; k < shallowSubscopes.length; k++) {

                            //  The element was contained in a subscope - return
                            //  false to filter it out.
                            if (shallowSubscopes[k].contains(aNewElem)) {
                                return false;
                            }
                        }
                    }

                    return true;
                }

                return false;
            });

    if (TP.notEmpty(shallowSubscopes)) {
        boundElems = boundElems.concat(shallowSubscopes);
    }

    return boundElems;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$getRepeatSourceAndIndex',
function() {

    var elem,

        repeatElem,
        repeatAttrVal,

        repeatIndex,

        repeatSource,

        repeatScopeVals,
        repeatPath;

    elem = this.getNativeNode();

    repeatElem = TP.nodeDetectAncestor(
                    elem,
                    function(aNode) {
                        var isRepeat;

                        isRepeat = TP.isElement(aNode) &&
                                    TP.elementHasAttribute(
                                            aNode, 'bind:repeat', true);

                        if (isRepeat) {
                            repeatAttrVal =
                                    TP.elementGetAttribute(
                                            aNode, 'bind:repeat', true);
                        }

                        return isRepeat;
                    });

    if (TP.isElement(repeatElem)) {

        //  Try to calculate a repeat source
        if (TP.isURIString(repeatAttrVal)) {
            repeatSource = TP.uc(repeatAttrVal).getResource().get('value');
        } else {
            repeatScopeVals = TP.wrap(repeatElem).
                                getBindingScopeValues().concat(repeatAttrVal);
            repeatPath = TP.uriJoinFragments.apply(TP, repeatScopeVals);
            repeatSource = TP.uc(repeatPath).getResource().get('value');
        }

        //  Try to calculate a repeat index
        TP.nodeDetectAncestor(
            elem,
            function(aNode) {
                var attrVal;

                if (TP.isElement(aNode) &&
                    TP.notEmpty(attrVal = TP.elementGetAttribute(
                                                aNode, 'bind:scope', true))) {
                    if (TP.regex.SIMPLE_NUMERIC_PATH.test(attrVal)) {
                        repeatIndex = TP.regex.SIMPLE_NUMERIC_PATH.exec(
                                                    attrVal).at(1).asNumber();
                        return true;
                    }
                }

                return false;
            });

        return TP.ac(repeatSource, repeatIndex);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$deleteRepeatRowAt',
function(indexes) {

    var elem,

        mgmtElement,

        len,
        i,
        index,

        deletionElement,

        followingScopedSiblings,

        len2,
        j,
        scopedSibling,
        scopeVal;

    elem = this.getNativeNode();

    mgmtElement = TP.byCSSPath(
                        '> *[tibet|nomutationtracking]',
                        elem,
                        true,
                        false);

    if (!TP.isElement(mgmtElement)) {
        //  TODO: Raise exception
        return;
    }

    //  Loop over all of the supplied indices
    len = indexes.getSize();
    for (i = 0; i < len; i++) {

        index = indexes.at(i);

        //  The deletion element would be the element with the same index as the
        //  row we're deleting. If we find one, we delete that row and decrement
        //  the number of all numeric scoped elements *at the same level* with
        //  an index equal to or greater than the delete index.
        deletionElement = TP.byCSSPath(
                                '> *[bind|scope="[' + index + ']"]',
                                mgmtElement,
                                true,
                                false);

        followingScopedSiblings = TP.byCSSPath(
                                    '~ *[bind|scope]',
                                    deletionElement,
                                    false,
                                    false);

        //  Now that we've found the scoped siblings, we can remove the deletion
        //  element
        TP.nodeDetach(deletionElement);

        len2 = followingScopedSiblings.getSize();
        for (j = 0; j < len2; j++) {

            scopedSibling = followingScopedSiblings.at(j);

            if (TP.notEmpty(scopeVal = TP.elementGetAttribute(
                                    scopedSibling, 'bind:scope', true))) {
                if (TP.regex.SIMPLE_NUMERIC_PATH.test(scopeVal)) {

                    TP.elementSetAttribute(
                            scopedSibling,
                            'bind:scope',
                            '[' + index + ']',
                            true);

                    //  Note how we increment this *after* we set the attribute.
                    //  This is because we're shifting everything 'up' and so we
                    //  want to start renumbering *at the same index* as the
                    //  deletion element was.
                    index += 1;
                }
            }
        }
    }

    return deletionElement;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$insertRepeatRowAt',
function(indexes) {

    var elem,

        templateID,
        templateInfo,

        repeatContent,

        mgmtElement,

        index,

        len,
        i,

        newElement,

        insertionPoint,

        followingScopedSiblings,
        len2,
        j,
        scopedSibling,
        scopeVal;

    elem = this.getNativeNode();

    templateID = TP.elementGetAttribute(elem, 'tibet:templateID', true);
    if (TP.isEmpty(templateID)) {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(templateInfo = this.getDocument().get('$repeatTemplates'))) {
        //  TODO: Raise an exception
        return this;
    }

    //  This will be a DocumentFragment that we stuffed away when the receiver
    //  was rebuilt.
    if (TP.notValid(repeatContent = templateInfo.at(templateID))) {
        return this;
    }

    mgmtElement = TP.byCSSPath(
                        '> *[tibet|nomutationtracking]',
                        elem,
                        true,
                        false);

    if (!TP.isElement(mgmtElement)) {
        //  TODO: Raise exception
        return;
    }

    //  Loop over all of the supplied indices
    len = indexes.getSize();
    for (i = 0; i < len; i++) {

        index = indexes.at(i);

        //  Make sure to clone the content.
        newElement = TP.nodeCloneNode(repeatContent);

        TP.elementSetAttribute(newElement,
                                'bind:scope',
                                '[' + index + ']',
                                true);

        //  An insertion point would be the element with the same index as the
        //  row we're inserting. If we find one, we insert the new row before
        //  that and increment the number of all numeric scoped elements *at the
        //  same level* with an index equal to or greater than the insert index.
        insertionPoint = TP.byCSSPath(
                                '> *[bind|scope="[' + index + ']"]',
                                mgmtElement,
                                true,
                                false);

        //  There was no insertion point - just append the element.
        if (!TP.isElement(insertionPoint)) {
            TP.nodeAppendChild(mgmtElement, newElement, false);
        } else {

            //  Otherwise, go ahead and insert the element and then renumber all
            //  of the ones coming after. Note the reassignment.
            newElement = TP.nodeInsertBefore(
                            mgmtElement, newElement, insertionPoint, false);

            followingScopedSiblings = TP.byCSSPath(
                                        '~ *[bind|scope]',
                                        newElement,
                                        false,
                                        false);

            len2 = followingScopedSiblings.getSize();
            for (j = 0; j < len2; j++) {

                scopedSibling = followingScopedSiblings.at(j);

                if (TP.notEmpty(scopeVal = TP.elementGetAttribute(
                                        scopedSibling, 'bind:scope', true))) {
                    if (TP.regex.SIMPLE_NUMERIC_PATH.test(scopeVal)) {

                        index += 1;
                        TP.elementSetAttribute(
                                scopedSibling,
                                'bind:scope',
                                '[' + index + ']',
                                true);
                    }
                }
            }
        }

        TP.nodeAwakenContent(newElement);

        //  Bubble any xmlns attributes upward to avoid markup clutter.
        TP.elementBubbleXMLNSAttributes(newElement);
    }

    return newElement;
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

    /**
     * @method isScopingElement
     * @summary Returns whether or not the receiver is a 'scoping' element (that
     *     is, an Element containing a 'bind:scope' or 'bind:repeat').
     * @returns {Boolean} Whether or not the receiver is a scoping element.
     */

    var elem;

    elem = this.getNativeNode();

    return TP.elementHasAttribute(elem, 'bind:scope', true) ||
            TP.elementHasAttribute(elem, 'bind:repeat', true);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('refreshBranches',
function(primarySource, aSignal, elems, initialVal, aPathType, pathParts, pathAction, altContext) {

    var elem,

        subscopes,

        nextElems,

        boundAttrNodes,
        attrs,
        i,
        j,

        ownerWrappers,

        theVal,

        primaryLocMatcher,

        len,

        boundAttr,
        attrName,
        attrVal,

        ownerElem,

        isScopingElement,

        branchURI,
        branchVal,

        pathType,

        repeatScopeVals,
        repeatPath,
        repeatFragExpr,

        ownerTPElem,

        searchParts,

        partsNegativeSlice,
        predicatePhaseOneComplete,

        didProcess,

        lastPart,

        startPredIndex,
        endPredIndex,
        hasPredicate,
        predicateStmt,

        searchPath,

        branchMatcher,
        leafMatcher,

        jsonContent,

        remainderParts,

        needsRefresh,

        indexes,
        newRowElem,
        newSubElems;

    elem = this.getNativeNode();

    var startQuery = Date.now();

    subscopes = TP.ac(elem.querySelectorAll('*[*|scope], *[*|repeat]'));

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

    if (TP.isPlainObject(initialVal)) {
        theVal = TP.hc(initialVal);
    } else {
        theVal = initialVal;
    }

    if (TP.isEmpty(pathParts)) {

        primaryLocMatcher =
            TP.rc(TP.regExpEscape(aSignal.getOrigin().getPrimaryLocation()));

        len = boundAttrNodes.getSize();
        for (i = 0; i < len; i++) {
            boundAttr = boundAttrNodes.at(i);

            attrName = boundAttr.localName;
            attrVal = boundAttr.value;

            ownerElem = boundAttr.ownerElement;

            //  Nested scope?
            isScopingElement = attrName === 'scope' || attrName === 'repeat';
            if (isScopingElement) {

                if (TP.isURIString(attrVal) &&
                    !primaryLocMatcher.test(attrVal)) {
                    continue;
                }

                if (TP.isURIString(attrVal)) {
                    branchURI = TP.uc(attrVal);
                    if (branchURI.hasFragment()) {
                        branchVal = branchURI.getResource().get('result');
                    } else {
                        branchVal = theVal;
                    }
                } else {
                    if (TP.isArray(theVal) &&
                        theVal.first() !== TP.NULL &&
                        TP.isXMLNode(TP.unwrap(theVal.first()))) {
                        theVal.unshift(TP.NULL);
                    }

                    if (TP.isXMLNode(theVal)) {
                        branchVal = TP.wrap(theVal).get(TP.xpc(attrVal));
                        pathType = TP.ifInvalid(aPathType, TP.XPATH_PATH_TYPE);
                    } else if (TP.isKindOf(theVal, TP.core.Node)) {
                        branchVal = theVal.get(TP.xpc(attrVal));
                        pathType = TP.ifInvalid(aPathType, TP.XPATH_PATH_TYPE);
                    } else if (TP.regex.JSON_POINTER.test(attrVal) ||
                                TP.regex.JSON_PATH.test(attrVal)) {
                        if (TP.isKindOf(theVal, TP.core.JSONContent)) {
                            branchVal = TP.jpc(attrVal).executeGet(theVal);
                        } else {
                            jsonContent = TP.core.JSONContent.construct(theVal);
                            branchVal = TP.jpc(attrVal).executeGet(jsonContent);
                        }
                        pathType = TP.ifInvalid(aPathType, TP.JSON_PATH_TYPE);
                    } else if (TP.notValid(theVal)) {
                        branchVal = null;
                    } else {
                        branchVal = theVal.get(attrVal);
                    }
                }

                pathType = TP.ifInvalid(pathType, aPathType);

                if (attrName === 'repeat') {

                    if (!TP.isURIString(attrVal)) {
                        repeatScopeVals =
                            this.getBindingScopeValues().concat(attrVal);
                        repeatPath =
                            TP.uriJoinFragments.apply(TP, repeatScopeVals);
                        repeatFragExpr = TP.uc(repeatPath).getFragmentExpr();
                        TP.apc(repeatFragExpr).executeGet(primarySource);
                    }

                    TP.wrap(ownerElem).$regenerateRepeat(branchVal, elems);
                }

                TP.wrap(ownerElem).refreshBranches(
                    primarySource, aSignal, elems, branchVal,
                    pathType, null, null);
            } else {

                //  There are different types of wrappers depending on full tag
                //  name of element (ns:tagname)

                /*
                if (TP.notValid(
                        ownerTPElem = ownerWrappers.at(ownerElem.tagName))) {
                    ownerTPElem = TP.core.ElementNode.construct(ownerElem);
                    ownerWrappers.atPut(ownerElem.tagName, ownerTPElem);
                }

                //  NB: Primitive and fast way to set native node
                ownerTPElem.$set('node', ownerElem, false);
                */

                ownerTPElem = TP.wrap(ownerElem);

                ownerTPElem.refreshLeaf(
                    primarySource, aSignal, theVal, boundAttr, aPathType);
            }
        }

    } else {

        searchParts = pathParts;

        partsNegativeSlice = 0;

        predicatePhaseOneComplete = false;

        //  Work in reverse order, trying to find the 'most specific'
        //  branching elements.
        while (TP.notEmpty(searchParts)) {

            didProcess = false;

            lastPart = searchParts.last();
            startPredIndex = lastPart.indexOf('[');

            //  Note that we don't allow statements such as '[0]' to qualify as
            //  predicates we want to process, hence looking for a '[' at a
            //  position greater than 0;
            hasPredicate = startPredIndex > 0;

            if (hasPredicate && predicatePhaseOneComplete) {
                endPredIndex = lastPart.lastIndexOf(']') + 1;
                predicateStmt = lastPart.slice(startPredIndex, endPredIndex);
                lastPart = lastPart.slice(0, startPredIndex);
                searchParts.atPut(searchParts.getSize() - 1, lastPart);
            } else {
                predicateStmt = null;
            }

            if (searchParts.getSize() > 1) {
                if (TP.isURIString(searchParts.first())) {
                    //  Has a full URL
                    searchPath = TP.uriJoinFragments.apply(TP, searchParts);
                } else if (searchParts.first().startsWith('#')) {
                    //  Starts with XPointer scheme
                    searchPath = TP.uriJoinFragments.apply(TP, searchParts);
                } else {
                    searchPath = TP.joinAccessPathParts(searchParts, aPathType);
                }
            } else {
                searchPath = searchParts.first();
            }

            //  If the search path contains a complete URL, then we build the
            //  branch matcher directly from that.
            if (TP.isURIString(searchPath) || searchPath.startsWith('#')) {
                branchMatcher =
                    TP.rc('^' + TP.regExpEscape(searchPath) + '$');
            } else {
                branchMatcher =
                    TP.rc('^(' + '(#[()a-zA-Z0-9]+)?' +
                            TP.regExpEscape(searchPath) +
                            '|\.)$');
            }

            leafMatcher = TP.rc(TP.regExpEscape(searchPath));

            len = boundAttrNodes.getSize();
            for (j = 0; j < len; j++) {
                boundAttr = boundAttrNodes.at(j);

                attrName = boundAttr.localName;
                attrVal = boundAttr.value;

                ownerElem = boundAttr.ownerElement;

                isScopingElement = attrName === 'scope' || attrName === 'repeat';

                if (isScopingElement && branchMatcher.test(attrVal)) {

                    ownerTPElem = TP.wrap(ownerElem);

                    if (attrVal === '.') {
                        return ownerTPElem.refreshBranches(
                                primarySource, aSignal, elems, theVal,
                                aPathType, pathParts, pathAction, this);
                    }

                    if (TP.isURIString(attrVal)) {
                        branchURI = TP.uc(attrVal);
                        if (branchURI.hasFragment()) {
                            branchVal = branchURI.getResource().get('result');
                        } else {
                            branchVal = theVal;
                        }
                    } else {

                        if (TP.isArray(theVal) &&
                            theVal.first() !== TP.NULL &&
                            TP.isXMLNode(TP.unwrap(theVal.first()))) {
                            theVal.unshift(TP.NULL);
                        }

                        if (TP.isXMLNode(theVal)) {
                            branchVal = TP.wrap(theVal).get(TP.xpc(attrVal));
                            pathType = TP.ifInvalid(aPathType, TP.XPATH_PATH_TYPE);
                        } else if (TP.isKindOf(theVal, TP.core.Node)) {
                            branchVal = theVal.get(TP.xpc(attrVal));
                            pathType = TP.ifInvalid(aPathType, TP.XPATH_PATH_TYPE);
                        } else if (TP.regex.JSON_POINTER.test(attrVal) ||
                                    TP.regex.JSON_PATH.test(attrVal)) {
                            if (TP.isKindOf(theVal, TP.core.JSONContent)) {
                                branchVal = TP.jpc(attrVal).executeGet(theVal);
                            } else {
                                jsonContent = TP.core.JSONContent.construct(theVal);
                                branchVal = TP.jpc(attrVal).executeGet(jsonContent);
                            }
                            pathType = TP.ifInvalid(aPathType, TP.JSON_PATH_TYPE);
                        } else {
                            branchVal = theVal.get(attrVal);
                            pathType = TP.ifInvalid(aPathType, TP.TIBET_PATH_TYPE);
                        }
                    }

                    if (partsNegativeSlice === 0) {
                        remainderParts = TP.ac();
                    } else {
                        remainderParts = pathParts.slice(partsNegativeSlice);
                    }

                    pathType = TP.ifInvalid(pathType, aPathType);

                    if (hasPredicate && predicatePhaseOneComplete) {
                        remainderParts.unshift(predicateStmt);
                    }

                    needsRefresh = true;

                    var isRepeatScope =
                        TP.regex.SIMPLE_NUMERIC_PATH.test(attrVal) &&
                        TP.elementHasClass(ownerElem, 'item');

                    if ((attrName === 'repeat' || isRepeatScope) &&
                        TP.isEmpty(remainderParts) &&
                        attrVal === searchPath) {

                        if (isRepeatScope) {
                            ownerElem = ownerElem.parentNode.parentNode;
                            ownerTPElem = TP.wrap(ownerElem);
                        }

                        indexes = aSignal.at('indexes');

                        switch (pathAction) {

                            case TP.CREATE:
                            case TP.INSERT:

                                if (TP.notEmpty(indexes)) {
                                    newRowElem =
                                        ownerTPElem.$insertRepeatRowAt(indexes);
                                    newSubElems =
                                        TP.wrap(newRowElem).$getBoundElements(
                                                                        false);

                                    if (isRepeatScope) {
                                    var insertParts = pathParts.slice(0, -1);
                                    } else {
                                    var insertParts = pathParts;
                                    }

                                    ownerTPElem.refreshBranches(
                                        primarySource, aSignal, newSubElems,
                                        theVal, pathType, insertParts,
                                        pathAction);

                                    needsRefresh = false;
                                } else {

                                    //  NB: This modifies the supplied 'elems'
                                    //  Array to add the newly generated
                                    //  elements. They will be refreshed below.
                                    ownerTPElem.$regenerateRepeat(
                                                    branchVal, elems);
                                }

                                break;

                            case TP.DELETE:

                                if (TP.notEmpty(indexes)) {
                                    ownerTPElem.$deleteRepeatRowAt(indexes);
                                } else {
                                    ownerTPElem.empty();
                                    ownerTPElem.set('generatedItemCount', 0);
                                }

                                needsRefresh = false;

                                break;

                            default:
                                break;
                        }
                    }

                    didProcess = true;

                    if (needsRefresh) {
                        ownerTPElem.refreshBranches(
                                primarySource, aSignal, elems, branchVal,
                                pathType, remainderParts, pathAction);
                    } else {
                        break;
                    }

                } else if (!isScopingElement && leafMatcher.test(attrVal)) {

                    /*
                    if (TP.notValid(
                        ownerTPElem = ownerWrappers.at(ownerElem.tagName))) {
                        ownerTPElem = TP.core.ElementNode.construct(ownerElem);
                        ownerWrappers.atPut(ownerElem.tagName, ownerTPElem);
                    }

                    //  NB: Primitive and fast way to set native node
                    ownerTPElem.$set('node', ownerElem, false);
                    */

                    ownerTPElem = TP.wrap(ownerElem);

                    ownerTPElem.refreshLeaf(
                        primarySource, aSignal, theVal, boundAttr, aPathType);

                    didProcess = true;
                }
            }

            //  If we didn't process at least once, and the last part of the
            //  path is a simple numeric path, and there is a value at the end
            //  of that patch, then we may have an insertion.
            if (!didProcess &&
                TP.regex.SIMPLE_NUMERIC_PATH.test(attrVal) &&
                TP.isDefined(branchVal = TP.wrap(theVal).get(attrVal)) &&
                (pathAction === TP.CREATE || pathAction === TP.INSERT)) {

                indexes = aSignal.at('indexes');

                if (TP.notEmpty(indexes)) {
                    newRowElem = this.$insertRepeatRowAt(indexes);
                    newSubElems = TP.wrap(newRowElem).$getBoundElements(false);

                    this.refreshBranches(
                        primarySource, aSignal, newSubElems,
                        theVal, pathType, TP.ac(),
                        pathAction);

                } else {

                    //  NB: This modifies the supplied 'elems'
                    //  Array to add the newly generated
                    //  elements. They will be refreshed below.
                    ownerTPElem.$regenerateRepeat(branchVal, elems);
                }
            }

            if (hasPredicate && !predicatePhaseOneComplete) {
                predicatePhaseOneComplete = true;
            } else {
                predicatePhaseOneComplete = false;
                partsNegativeSlice--;
                searchParts = pathParts.slice(0, partsNegativeSlice);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('refreshLeaf',
function(primarySource, aSignal, initialVal, bindingAttr, aPathType) {

    var facet,

        pathOptions,

        aspect,

        entry,

        exprs,
        expr,

        pathType,

        path,

        attrValue,

        info,
        infoKeys,

        primaryLocation,

        theVal,

        len,
        i,

        transformFunc,
        finalVal,

        jsonContent,

        isXMLResource,
        repeatInfo,
        repeatIndex,
        repeatSource;

    var start = Date.now();

    facet = aSignal.at('facet');

    attrValue = bindingAttr.value;
    info = this.getBindingInfoFrom(attrValue);

    infoKeys = info.getKeys();

    //  So, for now, we don't support mixed scoped and absolute references to
    //  resources that are not the ones that we're scoped for. So, since we
    //  already update absolute references in the main change method, we filter
    //  for absolute references that are not ones that we are currently part of
    //  the update chain for.
    primaryLocation = aSignal.getOrigin().getPrimaryLocation();

    theVal = TP.collapse(initialVal);

    pathOptions = TP.hc();
    if (this.isScalarValued(aspect)) {
        pathOptions.atPut('extractWith', 'value');
    }

    if (this.isSingleValued(aspect)) {
        pathOptions.atPut('shouldCollapse', true);
    }

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

            pathType = aPathType;

            if (TP.isValid(pathType)) {

                switch (pathType) {
                    case TP.XPATH_PATH_TYPE:

                        if (TP.isXMLNode(theVal) ||
                            TP.isKindOf(theVal, TP.core.Node)) {
                            //  empty
                        } else {
                            pathType = null;
                        }

                        break;

                    case TP.JSON_PATH_TYPE:
                        if (TP.isKindOf(theVal, TP.core.JSONContent)) {
                            //  empty
                        } else {
                            pathType = null;
                        }

                        break;

                    default:
                        break;
                }
            }

            expr = exprs.at(0);

            if (TP.isURIString(expr)) {

                if (expr.startsWith(primaryLocation)) {
                    finalVal = TP.uc(expr).getResource().get('result');
                } else {
                    continue;
                }
            } else if (TP.isValid(pathType)) {

                switch (pathType) {
                    case TP.XPATH_PATH_TYPE:
                        path = TP.xpc(expr, pathOptions);

                        if (TP.isXMLNode(theVal)) {
                            finalVal = path.executeGet(TP.wrap(theVal));
                        } else if (TP.isKindOf(theVal, TP.core.Node)) {
                            finalVal = path.executeGet(theVal);
                        }
                        break;

                    case TP.JSON_PATH_TYPE:

                        if (!/^\$\./.test(expr)) {
                            expr = '$.' + expr;
                        }

                        path = TP.jpc(expr, pathOptions);

                        //  Because of the check above, theVal has to be a
                        //  JSONContent object here.
                        finalVal = path.executeGet(theVal);

                        break;

                    case TP.TIBET_PATH_TYPE:
                        path = TP.tpc(expr, pathOptions);

                        finalVal = path.executeGet(theVal);
                        break;

                    default:
                        finalVal = theVal.get(expr);
                        break;
                }

            } else {

                if (TP.regex.COMPOSITE_PATH.test(expr)) {
                    if (TP.isValid(entry.at('transformFunc'))) {
                        finalVal = theVal;
                    } else {
                        finalVal = TP.wrap(theVal).get(TP.apc(expr, pathOptions));
                    }
                } else if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(expr)) {
                    finalVal = theVal;
                } else if (TP.isPlainObject(theVal)) {
                    finalVal = TP.hc(theVal).get(expr);
                } else if (TP.isXMLNode(theVal)) {
                    finalVal = TP.wrap(theVal).get(TP.xpc(expr, pathOptions));
                } else if (TP.isKindOf(theVal, TP.core.Node)) {
                    finalVal = theVal.get(TP.xpc(expr, pathOptions));
                } else if (TP.regex.JSON_POINTER.test(expr) ||
                            TP.regex.JSON_PATH.test(expr)) {
                    if (TP.isKindOf(theVal, TP.core.JSONContent)) {
                        finalVal = TP.jpc(expr, pathOptions).executeGet(theVal);
                    } else {
                        jsonContent = TP.core.JSONContent.construct(theVal);
                        finalVal = TP.jpc(expr, pathOptions).executeGet(jsonContent);
                    }
                } else if (TP.notValid(theVal)) {
                    finalVal = null;
                } else {
                    finalVal = theVal.get(expr);
                }
            }

            //if (TP.notValid(finalVal) &&
             //   TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(expr)) {
              //  finalVal = theVal;
            //}
        }


        if (TP.isValid(finalVal)) {
            if (TP.isCallable(transformFunc = entry.at('transformFunc'))) {

                if (TP.isCollection(finalVal)) {
                    isXMLResource = TP.isXMLNode(TP.unwrap(finalVal.first()));
                } else {
                    isXMLResource = TP.isXMLNode(TP.unwrap(finalVal));
                }

                //  Important for the logic in the transformation Function to
                //  set this to NaN and let the logic below set it if it finds
                //  it.
                repeatIndex = NaN;

                if (TP.isValid(repeatInfo = this.$getRepeatSourceAndIndex())) {
                    repeatSource = repeatInfo.first();
                    repeatIndex = repeatInfo.last();
                }

                finalVal = transformFunc(
                                aSignal.getSource(),
                                finalVal,
                                this,
                                repeatSource,
                                repeatIndex,
                                isXMLResource);
            }
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

TP.core.ElementNode.Inst.defineMethod('$regenerateRepeat',
function(aCollection, elems) {

    var existingItemCount,

        elem,

        templateInfo,
        templateID,
        repeatContent,

        bodyFragment,

        isXMLResource,

        startIndex,
        endIndex,

        idSuffix,

        scopeIndex,

        i,

        elemsWithIDs,
        j,
        elemWithID,
        oldIdVal,
        newIdVal,

        newElement,

        mgmtElement,

        newElems,
        elemIndex,
        args;

    if (TP.notValid(aCollection)) {
        return;
    }

    if (TP.isDefined(existingItemCount = this.get('generatedItemCount'))) {
        if (existingItemCount === aCollection.getSize()) {
            return this;
        }
    }

    elem = this.getNativeNode();

    templateID = TP.elementGetAttribute(elem, 'tibet:templateID', true);
    if (TP.isEmpty(templateID)) {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(templateInfo = this.getDocument().get('$repeatTemplates'))) {
        //  TODO: Raise an exception
        return this;
    }

    //  This will be a DocumentFragment that we stuffed away when the receiver
    //  was rebuilt.
    if (TP.notValid(repeatContent = templateInfo.at(templateID))) {
        //  TODO: Raise an exception
        return this;
        /*
        repeatContent = this.$captureRepeatContent(elems);
        if (!TP.owns(this, 'addContent')) {
            this.defineMethod(
                'addContent',
                function(newContent, aRequest, stdinContent) {
                    this.callNextMethod();
                    this.$captureRepeatContent();
                });
            this.defineMethod(
                'insertContent',
                function(newContent, aRequest, stdinContent) {
                    this.callNextMethod();
                    this.$captureRepeatContent();
                });
            this.defineMethod(
                'replaceContent',
                function(newContent, aRequest, stdinContent) {
                    this.callNextMethod();
                    this.$captureRepeatContent();
                });
            this.defineMethod(
                'setContent',
                function(newContent, aRequest, stdinContent) {
                    this.callNextMethod();
                    this.$captureRepeatContent();
                });
        }
        */
    }

    bodyFragment = TP.nodeGetDocument(elem).createDocumentFragment();

    isXMLResource = TP.isXMLNode(TP.unwrap(aCollection.first()));

    startIndex = 0;
    endIndex = aCollection.getSize();

    //  Calculate an ID suffix by concatenating any 'bind:scope' numeric values
    //  up the chain.
    idSuffix = '';

    TP.nodeAncestorsPerform(
        elem,
        function(aNode) {

            var scopeVal;

            if (TP.isElement(aNode) &&
                TP.notEmpty(scopeVal = TP.elementGetAttribute(
                                                aNode, 'bind:scope', true))) {
                if (TP.regex.SIMPLE_NUMERIC_PATH.test(scopeVal)) {
                    idSuffix += scopeVal.slice(1, -1);
                }
            }
        });

    //  Iterate over the resource and build out a chunk of markup for each
    //  item in the resource.
    for (i = startIndex; i < endIndex; i++) {

        //  Make sure to clone the content.
        newElement = TP.nodeCloneNode(repeatContent);

        if (isXMLResource) {
            scopeIndex = i + 1;
        } else {
            scopeIndex = i;
        }

        elemsWithIDs = TP.byCSSPath('*[id]', newElement, false, false);

        for (j = 0; j < elemsWithIDs.getSize(); j++) {

            elemWithID = elemsWithIDs.at(j);

            oldIdVal = TP.elementGetAttribute(elemWithID, 'id', true);
            newIdVal = oldIdVal + idSuffix + scopeIndex;

            TP.elementSetAttribute(elemWithID, 'id', newIdVal, true);
        }

        //  TODO: Make sure to update any *references* (i.e. IDREFs) to the ID
        //  that we just changed.

        TP.elementSetAttribute(
                newElement, 'bind:scope', '[' + scopeIndex + ']', true);

        //  Append this new chunk of markup to the document fragment we're
        //  building up and then loop to the top to do it again.
        bodyFragment.appendChild(newElement);
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

    newElems = this.$getBoundElements(false);

    elemIndex = elems.indexOf(elem);

    args = TP.ac(elemIndex + 1, 0).concat(newElems);
    Array.prototype.splice.apply(elems, args);

    this.defineAttribute('generatedItemCount');
    this.set('generatedItemCount', aCollection.getSize());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$registerRepeatContent',
function() {

    var elem,
        doc,

        nestedRepeatElems,
        nestedRepeatTPElems,

        i,

        repeatContent,

        repeatItems,

        templateID,
        templateInfo;

    elem = this.getNativeNode();

    //  If this attribute is present, then we've already register - just bail
    //  out
    if (TP.elementHasAttribute(elem, 'tibet:templateID', true)) {
        return this;
    }

    doc = TP.nodeGetDocument(elem);

    //  Cause any repeats that haven't registered their content to grab it
    //  before we start other processing.
    nestedRepeatElems =
            TP.ac(doc.documentElement.querySelectorAll('*[*|repeat]'));
    nestedRepeatElems = nestedRepeatElems.filter(
                    function(anElem) {
                        return elem !== anElem && elem.contains(anElem);
                    })

    //  To avoid mutation events as register the repeat content will cause DOM
    //  modifications, we wrap all of the found 'bind:repeat' Elements at once
    //  here.
    nestedRepeatTPElems = TP.wrap(nestedRepeatElems);

    for (i = 0; i < nestedRepeatTPElems.getSize(); i++) {
        nestedRepeatTPElems.at(i).$registerRepeatContent();
    }

    //  Append a 'wrap element' as the 'root element' of the repeat content.
    repeatContent = TP.documentConstructElement(this.getNativeDocument(),
                                                'span',
                                                TP.w3.Xmlns.XHTML);

    TP.elementAddClass(repeatContent, 'item');

    //  Grab the childNodes of the receiver as a DocumentFragment.
    //  NOTE: This *removes* these child nodes from the receiver.
    repeatItems = TP.nodeListAsFragment(elem.childNodes);

    TP.nodeAppendChild(repeatContent, repeatItems, false);

    templateID = TP.genID('bind_repeat_template');

    if (TP.notValid(templateInfo = this.getDocument().get('$repeatTemplates'))) {
        templateInfo = TP.hc();
        this.getDocument().set('$repeatTemplates', templateInfo);
    }

    templateInfo.atPut(templateID, repeatContent);
    TP.elementSetAttribute(elem, 'tibet:templateID', templateID, true);

    return repeatContent;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setBoundValue',
function(aValue, scopeVals, bindingInfoValue) {

    var bindingInfo,

        bidiAttrs;

    bindingInfo = this.getBindingInfoFrom(bindingInfoValue);

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
                    if (!TP.isURIString(fullExpr)) {
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
                    if (!TP.isURIString(dataExpr = TP.trim(dataExpr))) {
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
