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

//  ------------------------------------------------------------------------
//  TP.core.DocumentNode
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineAttribute('changeRegistry');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('registerChangeLocationsFor',
function(bindingAttachLocations, attachPointTPElem) {

    var changeRegistry,
        j,

        attachLoc,
        primaryURI,
        attachPointElems;

    if (TP.notValid(changeRegistry = this.get('changeRegistry'))) {
        changeRegistry = TP.hc();
        this.set('changeRegistry', changeRegistry);
    }

    bindingAttachLocations.unique();

    for (j = 0; j < bindingAttachLocations.getSize(); j++) {
        attachLoc = bindingAttachLocations.at(j);

        primaryURI = TP.uc(attachLoc).getPrimaryURI();

        if (!changeRegistry.hasKey(attachLoc)) {
            this.observe(TP.uc(primaryURI), 'FacetChange');
            attachPointElems = TP.ac();
            changeRegistry.atPut(attachLoc, attachPointElems);
        } else {
            attachPointElems = changeRegistry.at(attachLoc);
        }

        if (attachPointElems.indexOf(attachPointTPElem) === TP.NOT_FOUND) {
            attachPointElems.push(attachPointTPElem);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineHandler('FacetChange',
function(aSignal) {

    /**
     * @method handleFacetChange
     * @summary
     * @param {Change} aSignal The signal instance which triggered this handler.
     */

    var changedPaths,
        changedPathsKeys,

        changedURIs,

        changeRegistry,

        primarySource,
        primaryLoc,

        len,
        i,

        key,

        changedPath,
        len2,
        k,

        changeRegistryKeys,
        registryPath,

        changedURI,

        initialVal,

        changedLoc,

        bindingAttachPoints,
        j,

        signalFlag;

    //console.profile('bind test');

    var start = Date.now();

    signalFlag = TP.sys.shouldSignalDOMLoaded();
    TP.sys.shouldSignalDOMLoaded(false);

    primarySource = aSignal.getOrigin().getResource().get('result');
    primaryLoc = aSignal.getOrigin().getLocation();

    changeRegistry = this.get('changeRegistry');

    if (TP.isValid(changedPaths = aSignal.at(TP.CHANGE_PATHS))) {

        changedPathsKeys = changedPaths.getKeys();
        len = changedPathsKeys.getSize();
        for (i = 0; i < len; i++) {

            changedPath = changedPathsKeys.at(i);

            changeRegistryKeys = changeRegistry.getKeys();
            len2 = changeRegistryKeys.getSize();

            for (k = 0; k < len2; k++) {

                changedURI = TP.uc(changeRegistryKeys.at(k));
                registryPath = changedURI.getFragmentExpr();

                if (registryPath.startsWith(changedPath) ||
                    registryPath === '.') {

                    initialVal = changedURI.getResource().get('value');
                    bindingAttachPoints = changeRegistry.at(
                                            changeRegistryKeys.at(k));
                    for (j = 0; j < bindingAttachPoints.getSize(); j++) {
                        bindingAttachPoints.at(j).refreshFrom(
                            changedURI, primarySource, aSignal, initialVal);
                    }

                }
            }
        }
    } else if (TP.isValid(
                changedURIs = aSignal.getOrigin().getSecondaryURIs())) {

        //  If we got all of the sub URIs, then we need to filter for URIs that
        //  have ACP_FORMATs or ACP_VARIABLES and throw them out. They're not
        //  useful and they cause problems.
        changedURIs = changedURIs.reject(
            function(aURI) {
                var loc;

                loc = aURI.getLocation();
                return TP.regex.ACP_FORMAT.test(loc) ||
                        TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(loc);
            });

        len = changedURIs.getSize();
        for (i = 0; i < len; i++) {

            changedURI = changedURIs.at(i);
            initialVal = changedURI.getResource().get('value');
            changedLoc = changedURI.getLocation();

            bindingAttachPoints = changeRegistry.at(changedLoc);

            if (TP.notEmpty(bindingAttachPoints)) {

                for (j = 0; j < bindingAttachPoints.getSize(); j++) {
                    bindingAttachPoints.at(j).refreshFrom(
                            changedURI, primarySource, aSignal, initialVal);
                }
            }
        }
    }

    TP.sys.shouldSignalDOMLoaded(signalFlag);

    var end = Date.now();

    TP.totalInitialGetTime += (end - start);

    //console.profileEnd();

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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineAttribute('bindInfos');

TP.core.ElementNode.Inst.defineAttribute('bindRegistry');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('refreshFrom',
function(aURI, aPrimarySource, aSignal, aValue) {

    var elem,

        isScoped,
        scopeVals,
        scopePath,

        val,

        bindRegistry,
        keys,

        fragment,

        i,
        j,
        entries,

        fullGetterPath,

        targetElem,
        transformFunc,
        finalVal;

    //  If we have a 'bind:scope' or 'bind:repeat', then we're a binding attach
    //  point and we refresh differently.
    elem = this.getNativeNode();

    if (TP.elementHasAttribute(elem, 'bind:scope', true) ||
        TP.elementHasAttribute(elem, 'bind:repeat', true)) {
        scopeVals = this.getBindingScopeValues();
        //scopePath = TP.uriJoinFragments.apply(TP, scopeVals);
        isScoped = true;
    } else {
        isScoped = false;
    }

    bindRegistry = this.getBindingRegistry();

    if (TP.isEmpty(bindRegistry)) {
        this.setFacet(aSignal.at('aspect'),
                        aSignal.at('facet'),
                        aValue,
                        false);

        return this;
    }

    keys = bindRegistry.getKeys();

    for (i = 0; i < keys.getSize(); i++) {

        fragment = keys.at(i);

        entries = bindRegistry.at(fragment);

        if (isScoped) {
            //  If it starts with a '$_.', then 'val' should point to the whole
            //  value and we need to slice the '$_.' off of the fragment for the
            //  'interest registration "get"' below.
            if (/^\$_\./.test(fragment)) {
                val = aValue;
                fragment = fragment.slice(3);
            } else {
                val = aValue.get(fragment);
            }

            //fullGetterPath = TP.uriJoinFragments(scopePath, fragment);
            fullGetterPath = TP.uriJoinFragments.apply(TP, scopeVals.concat(fragment));
            aPrimarySource.get(fullGetterPath);

        } else {
            val = aValue;
        }

        for (j = 0; j < entries.getSize(); j++) {
            targetElem = entries.at(j).at('target');

            if (TP.isCallable(transformFunc =
                                entries.at(j).at('transformFunc'))) {
                finalVal = transformFunc(aSignal.getSource(), val);
            } else {
                finalVal = val;
            }

            targetElem.setFacet('value',
                                aSignal.at('facet'),
                                finalVal,
                                false);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBindingAttachPoint',
function() {

    var bindingScopeElem;

    bindingScopeElem = TP.nodeDetectAncestor(
            this.getNativeNode(),
            function(aParentNode) {
                return TP.elementHasAttribute(aParentNode, 'bind:scope', true);
            });

    if (TP.isElement(bindingScopeElem)) {
        return TP.wrap(bindingScopeElem);
    }

    return this;
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

TP.core.ElementNode.Inst.defineMethod('getBindingRegistry',
function() {

    var bindRegistry;

    if (TP.notValid(bindRegistry = this.get('bindRegistry'))) {
        bindRegistry = TP.hc();
        this.set('bindRegistry', bindRegistry);
    }

    return bindRegistry;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('registerBindingAt',
function(anEntry, bindingAttachLocations) {

    var bindRegistry,

        exprs,
        i,
        dataExpr,

        entries,

        scopeVals,
        scopePath,

        dataLoc;

    bindRegistry = this.getBindingRegistry();

    exprs = anEntry.at('dataExprs');

    for (i = 0; i < exprs.getSize(); i++) {

        dataExpr = exprs.at(i);

        if (!TP.isArray(entries = bindRegistry.at(dataExpr))) {
            entries = TP.ac();
            bindRegistry.atPut(dataExpr, entries);
        }

        entries.push(anEntry);

        //  If the data expression is a fully formed URI, then use the primary
        //  URI of that to register for changes
        if (TP.isURI(dataExpr)) {
            dataLoc = TP.uc(dataExpr).getLocation();
        } else if (TP.notEmpty(scopeVals = this.getBindingScopeValues())) {
            scopePath = TP.uriJoinFragments.apply(TP, scopeVals);
            dataLoc = TP.uc(scopePath).getLocation();
        }

        if (TP.isValid(dataLoc)) {
            bindingAttachLocations.push(dataLoc);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBindingInfoFrom',
function(attributeName, wantsFullScope) {

    /**
     * @method getBindingInfoFrom
     * @summary Gets binding information from the attribute named by the
     *     supplied attribute name on the receiver.
     * @param {String} attributeName The *local* name of the attribute to obtain
     *     the binding information from.
     * @param {Boolean} [wantsFullScope=false] Whether or not to return 'fully
     *     scoped values'.
     * @returns {TP.core.Hash} A hash of binding information keyed by the
     *     binding target name.
     */

    var elem,

        attrVal,

        entryStr,
        bindEntries,

        keys,
        key,

        len,
        i,

        fullyExpandedVal,

        entry,
        hadBrackets,
        preEntry,
        postEntry,

        sigilIndex,
        formatExpr;

    elem = this.getNativeNode();

    //  If there is no value for the specified attribute on the receiver, then
    //  just return an empty hash here - there is no reason to compute a bind
    //  scope chain for an element that doesn't have any binding.
    if (TP.isEmpty(attrVal = TP.elementGetAttribute(
                                elem, 'bind:' + attributeName, true))) {
        return TP.hc();
    }

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

    //  If we couldn't get a JSON String, try to default it to
    //  {"value":"..."}
    if (!TP.isJSONString(entryStr)) {
        entryStr = '{"value":"' + attrVal + '"}';
    }

    //  Try to parse the entry string into a TP.core.Hash.
    bindEntries = TP.json2js(entryStr);

    if (TP.isEmpty(bindEntries)) {
        return this.raise('TP.sig.InvalidBinding',
                            'Source Element: ' + TP.str(elem) +
                            ' Generated bindings: ' + entryStr);
    }

    if (TP.notTrue(wantsFullScope)) {
        return bindEntries;
    }

    keys = bindEntries.getKeys();

    len = bindEntries.getSize();
    for (i = 0; i < len; i++) {
        key = keys.at(i);

        entry = bindEntries.at(key);

        TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
        hadBrackets = TP.regex.BINDING_STATEMENT_EXTRACT.test(entry);
        formatExpr = null;

        if (hadBrackets) {
            preEntry = entry.slice(0, entry.indexOf('[['));
            postEntry = entry.slice(entry.indexOf(']]') + 2);
            entry = entry.slice(entry.indexOf('[[') + 2, entry.indexOf(']]'));
        }

        if (TP.regex.ACP_FORMAT.test(entry)) {
            sigilIndex = entry.indexOf('.%');
            formatExpr = entry.slice(sigilIndex);
            entry = entry.slice(0, sigilIndex).trim();
        }

        fullyExpandedVal = entry;

        if (TP.notEmpty(formatExpr)) {
            fullyExpandedVal += formatExpr;
        }

        if (hadBrackets) {
            fullyExpandedVal =
                preEntry + '[[' + fullyExpandedVal + ']]' + postEntry;
        }

        bindEntries.atPut(key, fullyExpandedVal);
    }

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

    elem = this.getNativeNode();

    scopeVals = TP.ac();

    //  Check to see if there is a local 'scope' attribute on the element
    //  itself. This will be used to qualify any expressions on the element
    //  itself.
    if (TP.notEmpty(localScopeNode = TP.elementGetAttributeNodesInNS(
                            elem, '*:scope', TP.w3.Xmlns.BIND))) {
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

    return scopeVals;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('addBindingEntriesFromBindAttr',
function(bindingAttrName, bindingDirection, bidiAttrs, bindingAttachLocations,
            bindingAttachPoint) {

    var info,
        keys,
        len,
        i,

        attrName,
        attrExpr,
        transformExpr,

        transformInfo,
        transformFunc,
        dataLocs,

        direction;

    info = this.getBindingInfoFrom(bindingAttrName, true);
    keys = info.getKeys();
    len = keys.getSize();

    for (i = 0; i < len; i++) {

        attrName = keys.at(i);
        attrExpr = info.at(attrName);

        transformExpr = null;

        TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
        if (TP.regex.BINDING_STATEMENT_EXTRACT.test(attrExpr)) {
            transformExpr = attrExpr;
        } else if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(attrExpr)) {
            transformExpr = '[[' + attrExpr + ']]';
        } else if (TP.regex.ACP_FORMAT.test(attrExpr)) {
            transformExpr = '[[' + attrExpr + ']]';
        }

        if (TP.isValid(transformExpr)) {
            transformInfo = this.computeTransformationFunction(transformExpr);

            transformFunc = transformInfo.first();
            dataLocs = transformInfo.last();
        } else {
            dataLocs = TP.ac(attrExpr);
        }

        if (bindingDirection === TP.IO &&
            bidiAttrs.indexOf(attrName) === TP.NOT_FOUND) {
            direction = TP.IN;
        } else {
            direction = bindingDirection;
        }

        bindingAttachPoint.registerBindingAt(
                    TP.hc('target', this,
                            'targetAttrName', attrName,
                            'sourceAttrName', 'value',
                            'sourceFacet', 'value',
                            'direction', direction,
                            'transformFunc', transformFunc,
                            'dataExprs', dataLocs),
                    bindingAttachLocations);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('addBindingEntriesFromInlineAttr',
function(attrNode, bidiAttrs, bindingAttachLocations, bindingAttachPoint) {

    var attrExpr,
        transformExpr,

        transformInfo,
        transformFunc,
        dataLocs;

    if (bidiAttrs.indexOf(attrNode.name) === TP.NOT_FOUND) {
        return;
    }

    attrExpr = attrNode.value;

    transformExpr = null;

    TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
    if (TP.regex.BINDING_STATEMENT_EXTRACT.test(attrExpr)) {
        transformExpr = attrExpr;
    } else if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(attrExpr)) {
        transformExpr = '[[' + attrExpr + ']]';
    } else if (TP.regex.ACP_FORMAT.test(attrExpr)) {
        transformExpr = '[[' + attrExpr + ']]';
    }

    if (TP.isValid(transformExpr)) {
        transformInfo = this.computeTransformationFunction(transformExpr);

        transformFunc = transformInfo.first();
        dataLocs = transformInfo.last();
    } else {
        dataLocs = TP.ac(attrExpr);
    }

    bindingAttachPoint.registerBindingAt(
                TP.hc('target', this,
                        'targetAttrName', attrNode.name,
                        'sourceAttrName', 'value',
                        'sourceFacet', 'value',
                        'direction', TP.IO,
                        'transformFunc', transformFunc,
                        'dataExprs', dataLocs),
                bindingAttachLocations);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('rebuild',
function(aSignalOrHash) {

    var elem,

        bindingAttachPoint,

        bindingAttachLocations,
        bidiAttrs,

        j,

        attrNode;

    elem = this.getNativeNode();

    var start = Date.now();

    //  If this is a 'bind:scope' or 'bind:repeat', then we just return
    if (this.isScopingElement()) {
        return this;
    }

    bindingAttachPoint = this.getBindingAttachPoint();

    bindingAttachLocations = TP.ac();

    //  Obtain the names of any attributes that allow bi-directional
    //  binding. For TP.IO, we'll check these against the attribute name
    //  that the author wants to bind to double check that the attribute can
    //  be bound in both directions.
    bidiAttrs = this.getType().get('bidiAttrs');

    if (TP.elementHasAttribute(elem, 'bind:io', true)) {
        this.addBindingEntriesFromBindAttr(
                        'io', TP.IO, bidiAttrs,
                        bindingAttachLocations,
                        bindingAttachPoint);
    } else if (TP.elementHasAttribute(elem, 'bind:in', true)) {
        this.addBindingEntriesFromBindAttr(
                        'in', TP.IN, bidiAttrs,
                        bindingAttachLocations,
                        bindingAttachPoint);
    } else {

        for (j = 0; j < elem.attributes.length; j++) {
            attrNode = elem.attributes[j];
            if (attrNode.namespaceURI !== TP.w3.Xmlns.BIND &&
                attrNode.value.indexOf('[[') !== TP.NOT_FOUND) {
                this.addBindingEntriesFromInlineAttr(
                        attrNode, bidiAttrs,
                        bindingAttachLocations,
                        bindingAttachPoint);
            }
        }
    }

    if (TP.isEmpty(bindingAttachLocations)) {
        return this;
    }

    this.getDocument().registerChangeLocationsFor(
                bindingAttachLocations,
                bindingAttachPoint);

    end = Date.now();

    TP.totalRebuildTime += (end - start);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$regenerateRepeat',
function(aSource) {

});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('rebuildRepeat',
function(aSignalOrHash) {

    var bindingAttachPoint,

        bindingAttachLocations,
        bidiAttrs,

        childrenFragment;

    debugger;

    bindingAttachPoint = this.getBindingAttachPoint();

    bindingAttachLocations = TP.ac();

    this.addBindingEntriesFromBindAttr(
                    'repeat', TP.IN, bidiAttrs,
                    bindingAttachLocations,
                    bindingAttachPoint);

    if (TP.isEmpty(bindingAttachLocations)) {
        return this;
    }

    this.getDocument().registerChangeLocationsFor(
                bindingAttachLocations,
                bindingAttachPoint);

    this.empty();


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

TP.core.ElementNode.Inst.defineMethod('computeTransformationFunction',
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
            if (TP.isURI(valueExpr)) {

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

        transformFunc = function(source, val) {
            var wrappedVal,

                index,
                params,

                repeatResourceResult,
                last,

                retVal;

            wrappedVal = TP.wrap(val);

            if (TP.isNumber(index = transformFunc.$$repeatIndex)) {

                //  NB: We assume 'async' of false here.
                repeatResourceResult =
                    transformFunc.$$repeatInputURI.getResource().get('result');

                last = repeatResourceResult.getSize() - 1;

                //  Iterating context
                params = TP.hc(
                    '$REQUEST', null,
                    '$TP', TP,
                    '$APP', APP,
                    '$TAG', this,
                    '$TARGET', this.getDocument(),
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
                    '$TAG', this,
                    '$TARGET', this.getDocument(),
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
        }.bind(this);

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
//  end
//  ========================================================================
