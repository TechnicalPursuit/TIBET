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
    } else if (TP.isKindOf(resourceOrURI, TP.uri.TIBETURL)) {
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

    if (TP.isKindOf(finalTarget, TP.uri.TIBETURL)) {
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
            signalName = TP.makeStartUpper(sourceAttr) + 'Change';
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
                        newVal = transformFunc(source, TP.ac(newVal));
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
    } else if (TP.isKindOf(resourceOrURI, TP.uri.TIBETURL)) {
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
            signalName = TP.makeStartUpper(sourceAttr) + 'Change';
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
//  TP.dom.DocumentNode
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.dom.DocumentNode.Inst.defineAttribute('$signalingBatchID');
TP.dom.DocumentNode.Inst.defineAttribute('$repeatTemplates');
TP.dom.DocumentNode.Inst.defineAttribute('$refreshedElements');
TP.dom.DocumentNode.Inst.defineAttribute('$observedLocations');
TP.dom.DocumentNode.Inst.defineAttribute('$originalLocationInfos');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.DocumentNode.Inst.defineHandler('FacetChange',
function(aSignal) {

    /**
     * @method handleFacetChange
     * @summary Handles when an object (usually a URI of some sort) changes and
     *     some components on the receiver surface (i.e. usually GUI widgets)
     *     need to be updated in response to that change.
     * @param {Change} aSignal The signal instance which triggered this handler.
     * @returns {TP.dom.DocumentNode} The receiver.
     */

    var changedPaths,

        ourBatchID,
        signalBatchID,

        signalFlag,

        sigOrigin,
        primarySource,

        changedPrimaryLoc,
        changedPrimaryURI,

        doc,

        query,
        boundElems,

        tpDocElem,

        i,
        j,

        changedPathKeys,
        keysToProcess,

        changedKey,
        keyToProcess,

        matcher,
        len,

        attrName,

        ownerElem,
        ownerTPElem,

        aspect,
        facet,

        originWasURI,

        sigSource,
        sigIndexes,

        pathPieces,

        boundAttrNodes,
        attrs,
        attrVal,

        aspectNames,

        originVal,

        allRefreshedElements;

    //  See if the signal has a payload of TP.CHANGE_PATHS. If so, that means
    //  that there were specific paths to data that changed and we can more
    //  'intelligent' about updating just the items that are dependent on that
    //  data.
    changedPaths = aSignal.at(TP.CHANGE_PATHS);

    //  If the underlying machinery that sent this signal supports 'signal
    //  batching', then we can leverage that to avoid making multiple passes
    //  through the updating logic.

    //  The first step is to check for a batching ID.
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
                //  either case, don't update - just return.
                return this;
            }
        } else if (TP.isValid(
                    signalBatchID = aSignal.at(TP.END_SIGNAL_BATCH))) {
            if (ourBatchID !== signalBatchID) {
                //  The batch is ending, but it didn't match our cached batch ID
                //  then return.
                return this;
            }

            //  Otherwise, we clear our cached batch ID proceed ahead.
            this.set('$signalingBatchID', null);
        } else {
            //  This wasn't the end of the batch - return.
            return this;
        }
    }

    //  Turn off any kind of DOM loaded signaling. This just adds overhead and
    //  is unnecessary - in this mode, dependent items are themselves
    //  responsible for signaling that their content got replaced.
    signalFlag = TP.sys.shouldSignalDOMLoaded();
    TP.sys.shouldSignalDOMLoaded(false);

    //  Grab the signal origin and do some testing. The signal is either going
    //  to be coming from a data source URI or an 'on page' item that is in a
    //  'direct to GUI' binding relationship.
    sigOrigin = aSignal.getOrigin();

    if (TP.isKindOf(sigOrigin, TP.uri.URI)) {

        //  The changed data source is a URI

        //  The primary source is the overall 'whole data' object that changed.
        primarySource = sigOrigin.getResource().get('result');
        changedPrimaryLoc = sigOrigin.getPrimaryLocation();

        //  Compute a RegExp that will be used to match 'top level' (i.e. not
        //  nested under further data scopes) binding expressions.
        matcher = TP.rc(TP.regExpEscape(changedPrimaryLoc));

    } else {

        //  The changed data source is another item in a 'direct to GUI' binding
        //  relationship.

        //  Note that, for these kinds of expressions, we only match top-level
        //  expressions (i.e. these are usually something like TIBET 'uicanvas'
        //  URLs that don't respect any sort of binding data scope).

        //  The primary source is the value that changed on the signal origin -
        //  there is no 'larger object' for us to consider.
        primarySource = sigOrigin.get('value');
        changedPrimaryLoc = sigOrigin.getID();

        changedPrimaryURI = TP.uc(changedPrimaryLoc);

        //  Grab the 'canvas' from the primary location URI. If it's the same as
        //  the current GUI canvas window, then we're updating the correct
        //  window.
        if (changedPrimaryURI.getCanvas() === TP.sys.uiwin(true)) {

            if (TP.isKindOf(sigOrigin, TP.dom.ElementNode)) {

                //  If signal origin was a TP.dom.ElementNode, then we want to
                //  use its local ID to compute our RegExp to match 'top level'
                //  binding expressions.
                changedPrimaryLoc = sigOrigin.getLocalID();

            } else if (TP.isKindOf(sigOrigin, TP.dom.AttributeNode)) {

                //  If signal origin was a TP.dom.AttributeNode, then we want
                //  to use its owner element's local ID and then a '@' separator
                //  and then its local name to compute our RegExp to match 'top
                //  level' binding expressions.
                changedPrimaryLoc = sigOrigin.getOwnerElement().getLocalID() +
                                    '@' + sigOrigin.getLocalName();
            }

            //  Build a RegExp that will match any of the following:
            //      'tibet://uicanvas#foo'
            //      '#foo'
            //      'tibet://uicanvas#foo@bar'
            //      '#foo@bar'
            matcher = TP.rc('(tibet://uicanvas#' +
                            TP.regExpEscape(changedPrimaryLoc) + '|' +
                            '#' + TP.regExpEscape(changedPrimaryLoc) + ')');
        }
    }

    doc = this.getNativeNode();

    //  Query for all elements containing namespaced attributes of 'io', 'in',
    //  'scope' or repeat. This is the most sophisticated 'namespace like' query
    //  we can give the native querySelectorAll() call since it doesn't really
    //  recognize namespaces... we'll fix that later. Note here how we ignore
    //  bind:scopes that contain a '[' (and are therefore scopes generated by us
    //  under a bind:repeat).
    query = '*[*|io], *[*|in], *[*|scope]:not([*|scope*="["]), *[*|repeat]';

    boundElems = TP.ac(doc.documentElement.querySelectorAll(query));

    //  Grab the TP.dom.ElementNode that is our document Element.
    tpDocElem = this.getDocumentElement();

    aspect = aSignal.at('aspect');
    facet = aSignal.at('facet');

    originWasURI = TP.isURI(sigOrigin);

    sigSource = aSignal.getSource();
    sigIndexes = aSignal.at('indexes');

    //  If the signal had a payload of TP.CHANGE_PATHS then we can drive the
    //  updating process directly from those paths.
    if (TP.isValid(changedPaths)) {

        //  TIMING: var startUpdate = Date.now();

        //  Grab the keys of the changed paths and sort them so that the
        //  'shortest' keys are first. This will cause the 'least specific'
        //  paths to be sorted to the top.

        changedPathKeys = changedPaths.getKeys();
        changedPathKeys.sort(
            function(a, b) {
                return a.length - b.length;
            });

        //  Start with the shortest path key. This is the 'least specific path'.
        keysToProcess = TP.ac(changedPathKeys.first());

        //  Then iterate over all path keys that have changed. If the key starts
        //  with any of the keys that are in the keys that we're going to
        //  process, then it must be a 'more specific' version of that key, so
        //  we skip it. Otherwise, we add it to the list of keys that we're
        //  going to process. In this way, we end up with a reasonably
        //  parsimonious, yet complete, set of paths that we're going to update.
        for (i = 0; i < changedPathKeys.getSize(); i++) {

            //  NB: We use getSize() here as we expect that this Array could
            //  change size as we add keys to it.
            for (j = 0; j < keysToProcess.getSize(); j++) {
                changedKey = changedPathKeys.at(i);
                keyToProcess = keysToProcess.at(j);

                if (changedKey === keyToProcess &&
                    keysToProcess.indexOf(changedKey) !== TP.NOT_FOUND) {
                    continue;
                } else if (changedKey.startsWith(keyToProcess)) {
                    continue;
                }

                keysToProcess.push(changedPathKeys.at(i));
            }
        }

        //  Iterate over all of the keys and update any items that are dependent
        //  on them.
        keysToProcess.forEach(
                function(changedPath) {

                    var actions,
                        actionLen,
                        k,

                        initialVal,

                        pathAction,
                        pathParts,
                        pathType;

                    //  This will be a list of actions for the path - TP.CREATE,
                    //  TP.UPDATE, TP.DELETE, etc.
                    actions = changedPaths.at(changedPath).getKeys();

                    //  We have to iterate for each action.
                    actionLen = actions.getSize();
                    for (k = 0; k < actionLen; k++) {

                        //  The initial value is the primary source, but this
                        //  might change below.
                        initialVal = primarySource;

                        pathAction = actions.at(k);

                        //  Grab the path parts and type for the path that
                        //  changed.
                        pathParts = TP.getAccessPathParts(changedPath);
                        pathType = TP.getAccessPathType(changedPath);

                        //  If the path is an XPath and the changed path started
                        //  with a '/', then update the first part to contain
                        //  the '/' (TP.getAccessPathParts() will - correctly -
                        //  not include that '/', but we want it in this
                        //  context).
                        if (pathType === TP.XPATH_PATH_TYPE &&
                            changedPath.startsWith('/')) {
                            pathParts.atPut(0, '/' + pathParts.at(0));
                        } else if (pathType === TP.TIBET_PATH_TYPE) {

                            //  If it wasn't an XPath, reset the initial value
                            //  to its 'value'.
                            initialVal = initialVal.get('value');
                        }

                        //  Unshift the pointer scheme onto the front of the
                        //  list of path parts.
                        pathParts.unshift(
                                '#' + TP.getPointerScheme(changedPath) + '()');

                        //  Unshift the primary location onto the front.
                        pathParts.unshift(changedPrimaryLoc);

                        //  Refresh all 'branches' (i.e. items, including
                        //  top-level bound expressions and scoped expressions,
                        //  of course) using all of the information that we
                        //  compiled.
                        tpDocElem.$refreshBranches(
                            primarySource,
                            facet,
                            facet === 'value' ?
                                        initialVal :
                                        aSignal.at(TP.NEWVAL),
                            boundElems,
                            pathType,
                            pathParts,
                            pathAction,
                            false,
                            sigOrigin,
                            originWasURI,
                            sigSource,
                            sigIndexes);
                    }
                });

        //  TIMING: var endUpdate = Date.now();
        //  TIMING: TP.totalUpdateTime += (endUpdate - startUpdate);

    } else {

        //  TIMING: var startSetup = Date.now();

        //  If our signal origin is a URI and the aspect is one of URI's
        //  'special aspects', then we just return here.
        if (originWasURI && TP.uri.URI.SPECIAL_ASPECTS.contains(aspect)) {

            //  Set the DOM content loaded signaling whatever it was when we
            //  entered this method.
            TP.sys.shouldSignalDOMLoaded(signalFlag);

            return this;
        }

        //  If we have an aspect and the facet that we're updating is *not*
        //  'value', then that means we're updating other facets such as
        //  'readonly', 'required', etc. This means that we try to compute the
        //  path parts if our origin was a URI or just use the singular aspect
        //  as the 'path parts'. In either case, we use a TIBET-type path for
        //  non-'value' facets (no matter how the 'value' facet is bound).
        if (TP.notEmpty(aspect) && facet !== 'value') {

            if (originWasURI) {
                pathPieces = TP.ac(changedPrimaryLoc, '#tibet()', aspect);
            } else {
                pathPieces = TP.ac(aspect);
            }

            //  Refresh all 'branches' using the aspect from the path, since
            //  we're updating 'non value facet' bindings..
            tpDocElem.$refreshBranches(
                    primarySource,
                    facet,
                    aSignal.at(TP.NEWVAL),
                    boundElems,
                    TP.TIBET_PATH_TYPE,
                    pathPieces,
                    TP.UPDATE,
                    false,
                    sigOrigin,
                    originWasURI,
                    sigSource,
                    sigIndexes);
        } else if (TP.notEmpty(facet)) {

            //  Otherwise, we're updating a 'value' fact.

            //  If the signal origin is either a TIBETURL with a non-empty
            //  canvas or the signal origin wasn't a URI at all, it must've been
            //  another GUI control within the page. Because we don't have
            //  'changed data paths' to go by, we update all 'direct GUI'
            //  bindings.
            /* eslint-disable no-extra-parens */
            if ((TP.isKindOf(sigOrigin, TP.uri.TIBETURL) &&
                TP.notEmpty(sigOrigin.getCanvasName())) || !originWasURI) {
            /* eslint-enable no-extra-parens */

                //  Gather up all of the bound attributes.

                boundAttrNodes = TP.ac();

                //  Loop over all of the elements that were found.
                for (i = 0; i < boundElems.length; i++) {
                    attrs = boundElems[i].attributes;

                    //  Loop over all of the attributes of the found element.
                    for (j = 0; j < attrs.length; j++) {

                        attrVal = attrs[j].value;

                        //  If the attribute was in the BIND namespace and
                        //  either matched our matcher OR contained ACP
                        //  variables, then add it to our list of bound
                        //  attributes.
                        if (attrs[j].namespaceURI === TP.w3.Xmlns.BIND &&
                            (matcher.test(attrVal) ||
                                TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(
                                                                    attrVal))) {

                            boundAttrNodes.push(attrs[j]);
                        }
                    }
                }

                //  Sort the attribute nodes so that 'bind:in' attributes come
                //  first. This is important when an element has both 'bind:in'
                //  and 'bind:io' attributes, since we want the 'in' bindings to
                //  be refreshed first to have that data available to the 'io'
                //  bindings.
                boundAttrNodes.sort(
                    function(a, b) {

                        if (a.nodeName === 'bind:in' &&
                            b.nodeName !== 'bind:in') {
                            return -1;
                        } else if (a.nodeName !== 'bind:in' &&
                                    b.nodeName === 'bind:in') {
                            return 1;
                        }

                        return 0;
                    });

                if (originWasURI) {
                    originVal = sigOrigin.getContent();
                } else {
                    originVal = sigOrigin;
                }

                len = boundAttrNodes.getSize();
                for (i = 0; i < len; i++) {

                    attrName = boundAttrNodes.at(i).localName;

                    //  We only worry about updating 'bind:io' and 'bind:in'
                    //  paths.
                    if (attrName === 'io' || attrName === 'in') {

                        attrVal = boundAttrNodes.at(i).value;

                        if (matcher.test(attrVal)) {

                            ownerElem = boundAttrNodes.at(i).ownerElement;
                            ownerTPElem = TP.wrap(ownerElem);

                            //  Grab all of the names of the aspects referencing
                            //  the changed location, as given by the matcher.
                            aspectNames = ownerTPElem.$computeMatchingAspects(
                                                    boundAttrNodes.at(i).name,
                                                    attrVal,
                                                    matcher);

                            //  Note that we use sigOrigin here as the
                            //  primarySource and initialValue. We let the
                            //  observers of this element decide how to use this
                            //  element based on their standard data binding /
                            //  decoding methods (isSingleValued,
                            //  isScalarValued, etc.)
                            ownerTPElem.$refreshLeaf(
                                    facet,
                                    originVal,
                                    aspectNames,
                                    boundAttrNodes[i],
                                    null,
                                    sigSource,
                                    null,
                                    NaN);
                        }
                    }
                }
            } else {
                tpDocElem.$refreshBranches(
                        primarySource,
                        facet,
                        primarySource,
                        boundElems,
                        null,
                        null,
                        null,
                        false,
                        sigOrigin,
                        originWasURI,
                        sigSource,
                        sigIndexes);
            }
        }

        //  TIMING: var endSetup = Date.now();
        //  TIMING: TP.totalSetupTime += (endSetup - startSetup);
    }

    //  Set the DOM content loaded signaling whatever it was when we entered
    //  this method.
    TP.sys.shouldSignalDOMLoaded(signalFlag);

    //  Send a custom DOM-level event to allow 3rd party libraries to know that
    //  the bindings have been refreshed.
    allRefreshedElements = this.get('$refreshedElements');
    if (TP.notEmpty(allRefreshedElements)) {
        this.getBody().$sendNativeRefreshEvent();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.DocumentNode.Inst.defineHandler('UIRefresh',
function(aSignal) {

    /**
     * @method handleUIRefresh
     * @summary Refreshes the receiver's bound data.
     * @param {TP.sig.UIRefresh} aSignal The signal instance which triggered
     *     this handler.
     * @returns {TP.dom.DocumentNode} The receiver.
     */

    this.refresh();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.DocumentNode.Inst.defineMethod('refresh',
function(shouldRender) {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound elements
     *     in the document. For an HTML document this will refresh content under
     *     the body, while in an XML document all elements including the
     *     documentElement are refreshed.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var node,
        body;

    node = this.getNativeNode();

    if (TP.isHTMLDocument(node) || TP.isXHTMLDocument(node)) {
        if (TP.isElement(body = TP.documentGetBody(node))) {
            return TP.tpnode(body).refresh(shouldRender);
        }
    } else {
        return TP.tpnode(node.documentElement).refresh(shouldRender);
    }

    return false;
});

//  ------------------------------------------------------------------------
//  TP.dom.ElementNode
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The attributes for this element type that are considered to 'bidi
//  attributes' that can not only be bound to data source but be bound *back* to
//  the data source so that when they are changed by the user, they update the
//  data source.
TP.dom.ElementNode.Type.defineAttribute('bidiAttrs', TP.ac());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.dom.ElementNode.Type.defineMethod('computeBindingInfo',
function(targetElement, attributeValue) {

    /**
     * @method computeBindingInfo
     * @summary Gets binding information from the attribute named by the
     *     supplied attribute name on the receiver.
     * @param {Element} targetElement The element the attribute is on.
     * @param {String} attributeValue The element the attribute is on.
     * @returns {TP.core.Hash} A hash of binding information keyed by the
     *     binding target name.
     */

    var entryStr,
        bindEntries,

        keys,
        aspectName,

        len,
        i,

        entry,

        extractedEntry;

    if (TP.isEmpty(attributeValue)) {
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
    entryStr = TP.reformatJSToJSON(attributeValue);

    //  If we couldn't get a JSON String, try to default it to {"value":"..."}
    if (!TP.isJSONString(entryStr)) {
        entryStr = '{"value":"' + attributeValue + '"}';
    }

    //  Try to parse the entry string into a TP.core.Hash.
    bindEntries = TP.json2js(entryStr);

    if (TP.isEmpty(bindEntries)) {
        return this.raise('TP.sig.InvalidBinding',
                            'Source Element: ' + TP.str(targetElement) +
                            ' Generated bindings: ' + entryStr);
    }

    keys = bindEntries.getKeys();

    //  Loop over all of the extracted binding entries.
    len = bindEntries.getSize();
    for (i = 0; i < len; i++) {
        aspectName = keys.at(i);
        entry = bindEntries.at(aspectName);

        //  Extract the expression record from the entry. This returns a hash
        //  that we'll register under the aspectName.
        extractedEntry = this.extractExpressionRecord(aspectName, entry);

        bindEntries.atPut(aspectName, extractedEntry);
    }

    return bindEntries;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Type.defineMethod('computeTransformationFunction',
function(anExpression, stdinIsSpecial) {

    /**
     * @method computeTransformationFunction
     * @summary Computes a 'transformation function' for values that are bound
     *     by virtue of the binding expressions that are in the supplied
     *     expression.
     * @param {String} anExpression The expression to extract binding
     *     information from to compute the transformation function and data
     *     expressions.
     * @param {Boolean} [stdinIsSpecial=false] Whether or not the STDIN (i.e.
     *     '$_') syntax should be treated specially (not as part of a path).
     * @returns {Array<Function,String[]>} An Array of a Function, which is the
     *     Function that will transform the values being updated and an Array
     *     which contains all of the data expressions that are embedded in the
     *     expression.
     */

    var finalExpr,
        isSimpleExpr,

        textWithoutExprs,
        needsEval,

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

    finalExpr = anExpression;

    isSimpleExpr = true;

    //  Compute whether or not the transformation Function needs to eval its
    //  return value based on whether or not the statement *without the
    //  expressions* contains JavaScript operators.
    TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
    textWithoutExprs = anExpression.strip(TP.regex.BINDING_STATEMENT_EXTRACT);
    needsEval = TP.regex.JS_OPERATORS.test(textWithoutExprs);

    referencedExprs = TP.ac();

    //  While we can still extract binding expressions from the value, keep
    //  looping. This allows us to have multiple expressions in a single value
    //  (i.e. 'foo [[bar]] is called: [[baz]]')
    TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
    while (TP.isValid(exprParts =
            TP.regex.BINDING_STATEMENT_EXTRACT.exec(anExpression))) {

        //  We want the expression both with and without the surrounding
        //  brackets ([[...]])
        exprWithBrackets = exprParts.first();
        exprWithoutBrackets = exprParts.last();

        //  If the expression doesn't exactly equal the expression without
        //  brackets surrounded by brackets, then it has 'surrounding content'.
        hasSurroundingContent =
                '[[' + exprWithoutBrackets + ']]' !== anExpression;

        //  If the expression without brackets has an ACP format, then we slice
        //  around and extract separate value and format expressions.
        if (TP.regex.ACP_FORMAT.test(exprWithoutBrackets)) {

            sigilIndex = exprWithoutBrackets.indexOf('.%');

            valueExpr = exprWithoutBrackets.slice(0, sigilIndex).trim();
            formatExpr = ' .% ' + exprWithoutBrackets.slice(
                                                    sigilIndex + 2).trim();
        } else {

            //  Otherwise, the value expression is the whole expression without
            //  brackets and the format expression is empty.
            valueExpr = exprWithoutBrackets;
            formatExpr = '';
        }

        //  If the expression to execute is a path that contains variables, then
        //  we use the 'value' of the URI and leverage the transformation
        //  function installed below to form a final value.
        /* eslint-disable no-extra-parens */
        if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(valueExpr) ||
            (TP.regex.HAS_STDIN.test(valueExpr) && TP.isTrue(stdinIsSpecial))) {
        /* eslint-enable no-extra-parens */

            isSimpleExpr = false;

            //  If the expression to execute is a fully-formed URI, then we
            //  don't take the scope values into consideration. We build a URI
            //  location consisting of the URI's primary href with a
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

                if (splitURI.hasFragment()) {
                    valueExpr = splitURI.getPrimaryLocation() + '#tibet(.)';
                    //  Set the 'computed' value expression to just the fragment.
                    computedValueExpr = splitURI.getFragmentExpr();
                } else {
                    computedValueExpr = valueExpr;
                }
            } else {
                //  Set the 'computed' value expression to the whole value
                //  expression.
                computedValueExpr = valueExpr;
            }

            TP.regex.ACP_VARIABLE_FUNCTION_STATEMENT.lastIndex = 0;
            if (TP.regex.ACP_VARIABLE_FUNCTION_STATEMENT.test(valueExpr)) {
                TP.regex.ACP_VARIABLE_FUNCTION_STATEMENT.lastIndex = 0;
                computedValueExpr = valueExpr.replace(
                    TP.regex.ACP_VARIABLE_FUNCTION_STATEMENT, '({{$1}})$4');
            } else {
                computedValueExpr =
                    '{{' + computedValueExpr + formatExpr + '}}';
            }

            //  Make sure to replace that expression in the expression to
            //  execute with a 'formatting expression', so that the
            //  templating function below will work.
            finalExpr = finalExpr.replace(exprWithBrackets, computedValueExpr);

            //  Unquote any final expression (note that this only removes
            //  surrounding quotes - not embedded ones).
            finalExpr = finalExpr.unquoted('"');
        } else {

            //  If the expression has surrounding literal content we flip the
            //  'isSimpleExpr' flag to false and install a more complex
            //  transformation function below.
            if (TP.notEmpty(formatExpr) || hasSurroundingContent) {

                isSimpleExpr = false;

                finalExpr = finalExpr.replace(
                    exprWithBrackets,
                    '{{$ARG' + referencedExprs.getSize() + formatExpr + '}}');

                finalExpr = finalExpr.unquoted('"');
            }
        }

        //  Keep a list of the 'referenced value expressions'.
        referencedExprs.push(valueExpr);
    }

    //  If this is not a simple expression, then we install a transformation
    //  Function that will transform the data before returning it.
    if (!isSimpleExpr) {

        transformFunc = function(source, vals, targetTPElem,
                                 repeatSource, index, isXMLResource) {
            var wrappedVal,

                tpDoc,

                params,

                last,

                val,
                retVal;

            //  Wrap the value - it helps when trying to extract a value from it
            //  to get the most 'intelligent' data type.
            //  NB: For performance reasons, we don't do this for Arrays and
            //  TP.core.Hashes
            if (!TP.isArray(vals.first()) && !TP.isHash(vals.first())) {
                wrappedVal = TP.wrap(vals.first());
            } else {
                wrappedVal = vals.first();
            }

            if (TP.isValid(targetTPElem)) {
                tpDoc = targetTPElem.getDocument();
            }

            //  Iterating context
            if (TP.isNumber(index)) {

                if (isXMLResource) {

                    last = repeatSource.getSize();

                    params = TP.hc(
                                '$REQUEST', null,
                                'TP', TP,
                                'APP', APP,
                                '$SOURCE', source,
                                '$TAG', targetTPElem,
                                '$TARGET', tpDoc,
                                '$_', wrappedVal,
                                '$INPUT', repeatSource,
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
                                'TP', TP,
                                'APP', APP,
                                '$SOURCE', source,
                                '$TAG', targetTPElem,
                                '$TARGET', tpDoc,
                                '$_', wrappedVal,
                                '$INPUT', repeatSource,
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
                            'TP', TP,
                            'APP', APP,
                            '$SOURCE', source,
                            '$TAG', targetTPElem,
                            '$TARGET', tpDoc,
                            '$_', wrappedVal,
                            '$INPUT', vals);
            }

            //  Register the Array of values we were handed as 'arguments' under
            //  '$ARGN' variable names.
            vals.forEach(
                function(aVal, valIndex) {
                    params.atPut('$ARG' + valIndex, aVal);
                });

            //  If we got a non-empty Array of values, then process them. Note
            //  here that we do *not* hand in a 'main data source', but all
            //  parameters to the templating Function are supplied as params.
            if (TP.notEmpty(vals)) {
                val = transformFunc.$$templateFunc.transform(null, params);
                if (transformFunc.$$needsEval) {
                    try {
                        /* eslint-disable no-eval */
                        retVal = eval(val);
                        /* eslint-enable no-eval */
                    } catch (e) {
                        retVal = val;
                    }
                } else {
                    retVal = val;
                }

            } else {
                //  null or undefined (or empty), but let's be pendantic
                retVal = vals;
            }

            return retVal;
        };

        //  Compile the 'final expression' into a templating Function and
        //  stash a reference to it on our transformation Function.
        transformFunc.$$templateFunc = finalExpr.compile();

    } else {

        //  Otherwise, we generated a simple transformation Function that will
        //  just return the 'reduced value'. This is necessary especially for
        //  XML where val will be an Element, but we want the text value of
        //  the Element.
        transformFunc = function(source, initialVal) {
            var val,
                retVal;

            val = TP.val(initialVal);

            if (transformFunc.$$needsEval) {
                try {
                    /* eslint-disable no-eval */
                    retVal = eval(val);
                    /* eslint-enable no-eval */
                } catch (e) {
                    retVal = val;
                }
            } else {
                retVal = val;
            }

            return retVal;
        };
    }

    //  Mark the fact that this is a transformation Function. This assists
    //  callers in determining whether this Function was generated using this
    //  method and mechanism.
    transformFunc.$$transformationFunction = true;

    //  Mark whether or not the transformation Function needs to perform an
    //  eval() of its return value.
    transformFunc.$$needsEval = needsEval;

    //  Return an Array containing the transformation Function and an Array of
    //  the referenced expressions.
    return TP.ac(transformFunc, referencedExprs);
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Type.defineMethod('extractExpressionRecord',
function(aspectName, anExpression) {

    /**
     * @method extractExpressionRecord
     * @summary Constructs an 'expression record' from the supplied binding
     *     expression.
     * @param {String} aspectName The name of the aspect that the supplied
     *     binding expression was found in.
     * @param {String} anExpression The binding expression.
     * @returns {TP.core.Hash} A hash of binding information.
     */

    var recordText,

        hadBrackets,

        formatExpr,

        preEntry,
        postEntry,

        sigilIndex,

        fullExpr,

        transformInfo,
        transformFunc,
        dataLocs;

    recordText = anExpression;

    //  If the binding statement had embedded [[...]], then
    hadBrackets = TP.regex.BINDING_STATEMENT_DETECT.test(recordText);
    if (hadBrackets) {
        formatExpr = null;

        //  Slice out the expression from the record text and reset the record
        //  text
        preEntry = recordText.slice(0, recordText.indexOf('[['));
        postEntry = recordText.slice(recordText.indexOf(']]') + 2);
        recordText = recordText.slice(recordText.indexOf('[[') + 2,
                                        recordText.indexOf(']]'));

        //  If the record text has a formatting expression, then extract it into
        //  a separate formatting expression.
        if (TP.regex.ACP_FORMAT.test(recordText)) {
            sigilIndex = recordText.indexOf('.%');

            formatExpr = recordText.slice(sigilIndex);
            recordText = recordText.slice(0, sigilIndex).trim();
        }

        fullExpr = recordText;

        //  The prior expression will have trimmed off the first space, but
        //  we want to preserve it for the full expression.
        if (TP.notEmpty(formatExpr)) {
            fullExpr += ' ' + formatExpr;
        }

        fullExpr = preEntry + '[[' + fullExpr + ']]' + postEntry;

        //  Sometimes the expression is quoted to allow whitespace in the
        //  *value* portion of the 'JSON-y' structure that we use to define
        //  bindings, but we don't want surrounding quotes here - strip them
        //  off.
        fullExpr = fullExpr.unquoted();
    } else {

        //  Otherwise, the record text had no embedded brackets and we can just
        //  use that as the full expression.
        fullExpr = recordText;
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

        //  Compute the transform Function and dependent data expressions.
        transformInfo = this.computeTransformationFunction(fullExpr);

        //  The Function object that does the transformation.
        transformFunc = transformInfo.first();

        //  The referenced expressions.
        dataLocs = transformInfo.last();
    } else if (hadBrackets &&
        (!/^\s*\[\[/.test(fullExpr) || !/\]\]\s*$/.test(fullExpr) ||
        TP.regex.ACP_FORMAT.test(fullExpr) ||
        /\[\[/g.match(fullExpr).getSize() > 1)) {


        //  The full expression had 'surrounding content' (i.e. literal
        //  content on either or both sides of the leading or trailing
        //  square brackets). We need a transformation expression to handle
        //  this.
        transformInfo = this.computeTransformationFunction(fullExpr);

        //  The Function object that does the transformation.
        transformFunc = transformInfo.first();

        //  The referenced expressions.
        dataLocs = transformInfo.last();
    } else {

        //  Otherwise, the data locations consist of one expression, which
        //  is the whole record text.
        dataLocs = TP.ac(recordText);
    }

    return TP.hc('bindingAspect', aspectName,
                    'transformFunc', transformFunc,
                    'fullExpr', fullExpr,
                    'dataExprs', dataLocs);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineAttribute('scopeValues');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('addBindingExpressionTo',
function(attributeName, aspectName, expression) {

    /**
     * @method addBindingExpressionTo
     * @summary Adds the supplied binding expression to the receiver's binding
     *     attribute named by the supplied attribute name.
     * @param {String} attributeName The name of the binding attribute to
     *     update.
     * @param {String} aspectName The name of the aspect that we're setting up a
     *     binding expression for.
     * @param {String} expression The text of the 'full' binding expression to
     *     register for the named aspect.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,
        doc,

        registry,

        infoKey,

        bindEntries,

        attrVal,

        extractedEntry;

    //  Grab the native Element and Document.
    elem = this.getNativeNode();
    doc = TP.nodeGetDocument(elem);

    //  If there's no 'bind registry' installed on the Document, then create
    //  one. This registry is used to avoid computing the binding information
    //  from the attribute value each time we need it. It's computed once and
    //  then stored under a key that is the whole attribute value. In this way,
    //  it can be shared amongst multiple attributes and elements, as long as
    //  the value of the attribute is exactly the same.
    if (TP.notValid(registry = doc[TP.BIND_INFO_REGISTRY])) {
        registry = TP.hc();
        doc[TP.BIND_INFO_REGISTRY] = registry;
    }

    infoKey = TP.join(TP.gid(elem),
                        TP.JOIN,
                        attributeName,
                        TP.JOIN,
                        expression);

    //  If the attribute value (acting as a key) is already in the registry,
    //  then just exit here - we don't want dups in the registry.
    if (registry.hasKey(infoKey)) {
        bindEntries = registry.at(infoKey);
    } else {
        //  Ask the type to compute the binding info and put it into the
        //  registry.
        attrVal = TP.elementGetAttribute(elem, attributeName, true);

        //  NB: Even if attrVal is empty, we'll get an empty hash, which we need
        //  below.
        bindEntries = this.getType().computeBindingInfo(elem, attrVal);
        registry.atPut(infoKey, bindEntries);
    }

    //  Extract an expression record from the supplied aspect name and
    //  expression.
    extractedEntry = this.getType().extractExpressionRecord(
                                            aspectName, expression);

    //  Put it into the bind entries
    bindEntries.atPut(aspectName, extractedEntry);

    //  Now, because much of the binding machinery uses the attribute value to
    //  perform its work, we need to rewrite the attribute value and set it.

    //  Build up a 'fully bracketed' attribute value that contains each aspect
    //  and it's 'full expression'.
    attrVal = '{';

    bindEntries.perform(
        function(kvPair) {
            attrVal += kvPair.first() +
                        ': ' +
                        kvPair.last().at('fullExpr') +
                        ', ';
        });

    //  Slice off the last ', '
    attrVal = attrVal.slice(0, -2);

    attrVal += '}';

    //  Set the updated attribute value back onto the element.
    TP.elementSetAttribute(elem, attributeName, attrVal, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$computeValueForBoundAspect',
function(bindInfo, scopeValues) {

    /**
     * @method $computeValueForBoundAspect
     * @summary Computes the bound value for a particular bound aspect of the
     *     receiver.
     * @param {TP.core.Hash} bindInfo The hash of binding information for the
     *     particular bound aspect that we want a value for.
     * @param {String[]} scopeValues The list of scoping values (i.e. parts
     *     that, when combined, make up the entire bind scoping path).
     * @returns {Object|String} The value of the bound aspect. Note that if the
     *     supplied binding information for this aspect has more than 1 data
     *     expressions, this will be a String with all of the values
     *     concatenated together.
     */

    var dataExprs,
        len,
        i,

        dataExpr,

        allVals,
        fullExpr,

        wholeURI,

        result,
        finalResult;

    //  There will be 1...n data expressions here. Iterate over them and compute
    //  a model reference.
    dataExprs = bindInfo.at('dataExprs');
    len = dataExprs.getSize();

    for (i = 0; i < len; i++) {
        dataExpr = TP.trim(dataExprs.at(i));

        if (TP.isEmpty(dataExpr)) {
            continue;
        }

        if (TP.notEmpty(scopeValues)) {
            //  Concatenate the binding value onto the scope values array
            //  (thereby creating a new Array) and use it to join all of the
            //  values together.
            allVals = scopeValues.concat(dataExpr);
            fullExpr = TP.uriJoinFragments.apply(TP, allVals);

            //  If we weren't able to compute a real URI from the fully expanded
            //  URI value, then raise an exception and return here.
            if (!TP.isURIString(fullExpr)) {
                this.raise('TP.sig.InvalidURI');

                break;
            }

            wholeURI = TP.uc(fullExpr);
        } else {
            //  Scope values is empty - this is (hopefully) a fully qualified
            //  binding expression.

            //  If we weren't able to compute a real URI from the fully expanded
            //  URI value, then raise an exception and return here.
            if (!TP.isURIString(dataExpr = TP.trim(dataExpr))) {
                this.raise('TP.sig.InvalidURI');

                break;
            }

            wholeURI = TP.uc(dataExpr);
        }

        if (!TP.isURI(wholeURI)) {
            this.raise('TP.sig.InvalidURI');

            break;
        }

        //  Grab the result from the computed URI.
        result = wholeURI.getResource().get('result');

        //  If we have a valid result, then either set the finalResult to it or
        //  append it onto the finalResult if that already exists (this will
        //  occur if we have multiple data expressions).
        if (TP.isValid(result)) {
            if (TP.isValid(finalResult)) {
                finalResult = TP.str(finalResult) + result;
            } else {
                finalResult = result;
            }
        }
    }

    return finalResult;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$computeMatchingAspects',
function(attributeName, attributeValue, valueMatcher) {

    /**
     * @method $computeMatchingAspects
     * @summary Returns the names of the aspects that have expression values
     *     that match the supplied matcher.
     * description This method iterates through the aspects of the supplied
     *     bound attribute, looking for ones that have values that match the
     *     supplied valueMatcher regexp. Note that this method also takes into
     *     account the receiver's scoping values. If any of the scoping values
     *     match, then (if the aspect doesn't have an absolute URI as its
     *     value), that aspect is also added. Finally, if the aspect's value
     *     contains an ACP variable, that aspect is added.
     * @param {String} attributeName The name of binding attribute to retrieve
     *     the binding information from.
     * @param {String} attributeValue The value of the binding attribute to
     *     extract binding information from.
     * @param {RegExp} valueMatcher The RegExp to use to match against aspect
     *     values.
     * @returns {String[]} An array of aspect names that matched using the
     *     criteria described above.
     */

    var scopeVals,

        scopeMatched,

        len,
        i,

        bindingInfo,
        aspectNames;

    //  Grab all of the scoping values.
    scopeVals = this.getBindingScopeValues();

    //  See if any of the scope values match using the supplied matcher and set
    //  the flag. This will be used if the aspect's value doesn't contain a URI
    //  value but still needs to be matched because it's scope matched.

    scopeMatched = false;

    len = scopeVals.getSize();
    for (i = 0; i < len; i++) {
        if (valueMatcher.test(scopeVals.at(i))) {
            scopeMatched = true;
            break;
        }
    }

    //  Grab the binding information.
    bindingInfo = this.getBindingInfoFrom(attributeName, attributeValue);

    aspectNames = TP.ac();

    //  Iterate over each binding aspect/info pair
    bindingInfo.perform(
        function(kvPair) {
            var aspect,
                dataExprs,

                exprsLen,
                j,

                theExpr;

            aspect = kvPair.first();
            dataExprs = kvPair.last().at('dataExprs');

            //  Iterate over each data expression.
            exprsLen = dataExprs.getSize();
            for (j = 0; j < exprsLen; j++) {

                theExpr = dataExprs.at(j);

                //  If theExpr doesn't contain a likely URI but one of the
                //  scoping values matched, then add the aspect.
                if (!TP.isURIString(theExpr) && scopeMatched) {
                    aspectNames.push(aspect);
                    break;
                }

                //  If the matcher matched the expression itself, which means
                //  that the aspect is probably a 'whole URI' (since it failed
                //  the test above), then add the aspect.
                if (valueMatcher.test(theExpr)) {
                    aspectNames.push(aspect);
                    break;
                }

                //  Lastly, if the expression contains ACP variables, then add
                //  the aspect. We cannot be sure what is referenced here or
                //  not, so we need to be safe and include this aspect in our
                //  list.
                if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(theExpr)) {
                    aspectNames.push(aspect);
                    break;
                }
            }
        });

    return aspectNames;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('computeCommonScope',
function(sourceURI, isLeaf, alternateURI) {

    /**
     * @method computeCommonScope
     * @summary Computes a common scope that will allow the receiver to bind
     *     properly to the source URI given any inherited scoping values.
     * description This method will compute a common scoping value between the
     *     supplied source URI and the inherited scoping value that is computed
     *     from the receiver. If a common primary URI scope cannot be computed
     *     between the two, then the scoping value returned from this method
     *     will be prepended either by the optionally supplied 'alternate URI'
     *     or the primary URI of the supplied source URI.
     * @param {TP.core.URI} sourceURI The URI that a scope should be computed to
     *     from the receiver, given the receiver's inherited scoping values.
     *     Note that this URI *must* have a fragment.
     * @param {Boolean} isLeaf Whether or not the fragment in the source URI
     *     points to a 'leaf' data item.
     * @param {TP.core.URI} [alternateURI] An alternate URI that the computed
     *     scope value will be joined with if the computed scoping value cannot
     *     be computed relative to the receiver's inherited scope. If this value
     *     isn't supplied, the primary URI of the source URI will be used.
     * @returns {String} The computed scope.
     */

    var sourcePrimaryURI,

        sourceFrag,

        sourcePath,
        sourcePathType,
        sourcePathParts,

        inheritedScopeVals,
        inheritedExpr,
        inheritedURI,

        needsWholeScopingURI,

        inheritedPrimaryURI,

        inheritedFragExpr,

        inheritedFrag,
        inheritedPath,

        commonParts,

        scopeParts,

        separator,

        computedScope,

        scopePrefix,
        scopePath;

    sourcePrimaryURI = sourceURI.getPrimaryURI();

    sourceFrag = sourceURI.getFragment();
    if (TP.isEmpty(sourceFrag)) {
        //  TODO: Raise an exception
        return null;
    }

    sourcePath = TP.apc(sourceFrag);
    sourcePathType = sourcePath.getPathType();
    sourcePathParts = sourcePath.getPathParts();

    //  ---

    //  This is the scope path as seen by the receiver by looking up its tree.

    //  Grab the scoping values from the element we're connecting to.
    inheritedScopeVals = this.getBindingScopeValues();

    //  If the element we're connecting to has inherited scoping values, then
    //  compute the full URI from it and compute a scoping value based on
    //  comparing the URI we connected to and the URI we're 'inherting' scope
    //  from.
    if (TP.notEmpty(inheritedScopeVals)) {
        inheritedExpr = TP.uriJoinFragments.apply(TP, inheritedScopeVals);
        inheritedURI = TP.uc(inheritedExpr);
    } else {
        inheritedURI = null;
    }

    //  ---

    needsWholeScopingURI = true;

    if (TP.isValid(inheritedURI)) {

        inheritedPrimaryURI = inheritedURI.getPrimaryURI();

        //  Attempt to compute a scope by first looking at the *primary URIs* of
        //  the inherited and connected URIs.
        if (inheritedPrimaryURI.equalTo(sourcePrimaryURI)) {

            needsWholeScopingURI = false;

            //  NB: We use the fragment expression here to test for emptiness,
            //  since the fragment itself will contain the XPointer scheme.
            inheritedFragExpr = inheritedURI.getFragmentExpr();
            if (TP.notEmpty(inheritedFragExpr)) {

                //  Use the whole fragment here (including the XPointer scheme
                //  since that will produce more accurate paths).
                inheritedFrag = inheritedURI.getFragment();
                inheritedPath = TP.apc(inheritedFrag);

                //  Try to see if there are any common parts between the
                //  connected path and the inherited path.
                commonParts =
                    sourcePath.computeCommonLeadingParts(inheritedPath);

                //  Not a 100% match?
                if (commonParts.getSize() !== sourcePathParts.getSize()) {

                    scopeParts = sourcePathParts.slice(
                                                    commonParts.getSize());

                    if (isLeaf) {
                        scopeParts = scopeParts.slice(0, -1);
                    }

                    if (TP.notEmpty(scopeParts)) {
                        computedScope =
                            '#' + sourcePath.getPointerScheme() +
                            '(' +
                                TP.joinAccessPathParts(
                                    scopeParts, sourcePathType) +
                            ')';
                    } else {
                        //  Otherwise, the scopes are equivalent - there is no
                        //  real computed scope.
                        computedScope = '';
                    }
                }
            }
        }
    }

    //  The above logic did not compute a scope - we're going to just return a
    //  scope computed from the connected path and the supplied scoping URI.
    if (TP.notValid(computedScope)) {

        if (isLeaf) {
            scopeParts = sourcePathParts.slice(0, -1);
        } else {
            scopeParts = sourcePathParts;
        }

        //  Grab the property information under the entry that matches our
        //  scope (joined together by a path separator).
        if (sourcePathType === TP.TIBET_PATH_TYPE ||
            sourcePathType === TP.JSON_PATH_TYPE) {
            separator = '.';
        } else if (sourcePathType === TP.XPATH_PATH_TYPE) {
            separator = '/';
        }

        scopePrefix = scopeParts.join(separator);

        scopePath = TP.apc(scopePrefix);

        if (needsWholeScopingURI) {
            if (TP.isURI(alternateURI)) {
                computedScope = alternateURI.getLocation() +
                                scopePath.asXPointerString();
            } else {
                computedScope = sourcePrimaryURI.getLocation() +
                                scopePath.asXPointerString();
            }
        } else {
            computedScope = scopePath.asXPointerString();
        }
    }

    return computedScope;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$deleteRepeatRowAt',
function(indexes) {

    /**
     * @method $deleteRepeatRowAt
     * @summary Removes the rows at the indexes provided.
     * @description Note that the indexes supplied to this method should match
     *     the type of data source object of the repeat. If the data source of
     *     the repeat is an XML object, these indexes should be '1-based' (like
     *     XPath). If it is an JS or JSON object, these indexes should be
     *     '0-based' (like JSONPath).
     * @param {Number[]} indexes An Array of Numbers that indicate the indexes
     *     of the items to remove.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,

        wrapperElement,

        len,
        i,
        index,

        deletionElement,

        followingScopedSiblings,

        len2,
        j,
        scopedSibling,
        scopeVal,

        thisref,

        evt;

    elem = this.getNativeNode();

    //  Whichever element has a 'tibet:no-mutations' attribute on it is
    //  acting as a common wrapper for the 'rows' making up the repeat. This may
    //  be a <tbody> element if we're repeating rows in a <table>, but it
    //  doesn't have to be.
    if (TP.elementHasAttribute(elem, 'tibet:no-mutations', true)) {
        wrapperElement = elem;
    } else {
        wrapperElement = TP.byCSSPath(
                            '> *[tibet|no-mutations]',
                            elem,
                            true,
                            false);
    }

    if (!TP.isElement(wrapperElement)) {
        //  TODO: Raise exception
        return this;
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
                                wrapperElement,
                                true,
                                false);

        //  If we couldn't find the row to delete, then continue to the next
        //  index to delete.
        if (!TP.isElement(deletionElement)) {
            continue;
        }

        //  Now, grab all of the scoped siblings that follow the element that
        //  we're going to delete.
        followingScopedSiblings = TP.byCSSPath(
                                    '~ *[bind|scope^="["][bind|scope$="]"]',
                                    deletionElement,
                                    false,
                                    false);

        //  Now that we've found the scoped siblings, we can remove the deletion
        //  element
        TP.nodeDetach(deletionElement);

        //  Iterate over all of the scoped siblings and adjust their index. Note
        //  how we start by using the index we just deleted. Then we increment
        //  that number and advance.

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

    //  Send a UIDidDelete with ourself as the target and the set of indexes
    //  that the insertion happened at.
    thisref = this;

    (function() {
        thisref.signal('TP.sig.UIDidDelete',
                        TP.hc('target', thisref, 'indexes', indexes));
    }).queueBeforeNextRepaint(this.getNativeWindow());

    //  Send a custom DOM-level event to allow 3rd party libraries to know that
    //  content has been removed.

    evt = this.getNativeDocument().createEvent('Event');
    evt.initEvent('TIBETContentRemoved', true, true);
    evt.data = TP.ac(deletionElement);

    wrapperElement.dispatchEvent(evt);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$extractValue',
function(sourceVal, expression, pathConstructor, pathOptions) {

    /**
     * @method $extractValue
     * @summary Extracts a value from the supplied source value using the
     *     supplied expression. This method will test to see if the source value
     *     has a custom getter or attribute that matches expression (if
     *     expression conforms to the definition of a JavaScript identifier).
     * @param {Object} sourceVal The source value to extract the value from.
     * @param {String} expression The expression to use to extract the value.
     * @param {Function} pathConstructor The constructor to use to construct a
     *     path, if that's necessary
     * @param {TP.core.Hash} [pathOptions] The hash of options to use when
     *     constructing a path, if that's necessary.
     * @returns {Object} The value extracted from the source value.
     */

    var funcName,
        resultVal,

        extractPath;

    //  If the expression is just a JavaScript identifier (i.e. alphanum
    //  characters only), then test to see if the source value has either a
    //  'getter' or it (or its prototype) has an attribute that matches that
    //  name.
    if (TP.regex.JS_IDENTIFIER.test(expression)) {
        funcName = 'get' + TP.makeStartUpper(expression);
        if (TP.canInvoke(sourceVal, funcName)) {
            resultVal = sourceVal[funcName]();
        } else if (TP.owns(sourceVal, expression)) {
            resultVal = sourceVal.get(expression);
        } else if (TP.owns(Object.getPrototypeOf(sourceVal), expression)) {
            resultVal = sourceVal.get(expression);
        } else {
            //  None of the above were true. Build a path and execute it.
            extractPath = pathConstructor(expression, pathOptions);
            resultVal = extractPath.executeGet(sourceVal);
        }
    } else {
        //  Otherwise, the expression contained non-alphanumeric characters.
        //  Build a path and execute it.
        extractPath = pathConstructor(expression, pathOptions);
        resultVal = extractPath.executeGet(sourceVal);
    }

    return resultVal;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('flushBindingInfoCacheFor',
function(attributeName) {

    /**
     * @method flushBindingInfoCacheFor
     * @summary Flushes the binding information cache for the supplied attribute
     *     value.
     * @param {String} attributeName The name of the attribute to obtain binding
     *     information from.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,
        doc,

        registry,

        attrVal,

        infoKey;

    //  Grab the native Element and Document.
    elem = this.getNativeNode();
    doc = TP.nodeGetDocument(elem);

    //  If there's no 'bind registry' installed on the Document, then just
    //  return.
    if (TP.notValid(registry = doc[TP.BIND_INFO_REGISTRY])) {
        return this;
    }

    attrVal = TP.elementGetAttribute(elem, attributeName, true);

    infoKey = TP.join(TP.gid(elem),
                        TP.JOIN,
                        attributeName,
                        TP.JOIN,
                        attrVal);

    registry.removeKey(infoKey);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getAttrBindRepeatindex',
function(size) {

    /**
     * @method getAttrBindRepeatindex
     * @summary Gets the repeat index that the receiver will use to display
     *     'pages' of repeating data.
     * @returns {Number} The repeat index of the receiver.
     */

    var repeatIndex;

    repeatIndex = TP.elementGetAttribute(
                    this.getNativeNode(), 'bind:repeatindex', true);

    repeatIndex = repeatIndex.asNumber();
    if (!TP.isNumber(repeatIndex)) {
        repeatIndex = 0;
    }

    return repeatIndex;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getAttrBindRepeatsize',
function(size) {

    /**
     * @method getAttrBindRepeatsize
     * @summary Gets the repeat size that the receiver will use to display
     *     'pages' of repeating data.
     * @returns {Number} The repeat size of the receiver.
     */

    var repeatSize;

    repeatSize = TP.elementGetAttribute(
                    this.getNativeNode(), 'bind:repeatsize', true);

    repeatSize = repeatSize.asNumber();
    if (!TP.isNumber(repeatSize)) {
        repeatSize = 1;
    }

    return repeatSize;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getBindingInfoFrom',
function(attributeName, attributeValue, flushCache) {

    /**
     * @method getBindingInfoFrom
     * @summary Gets binding information from the attribute named by the
     *     supplied attribute name on the receiver.
     * @param {String} attributeName The name of the attribute that binding
     *     information is coming from.
     * @param {String} attributeValue The attribute value to obtain binding
     *     information from.
     * @param {Boolean} [flushCache=false] Whether or not to flush any currently
     *     cached binding info for the supplied attribute value.
     * @returns {TP.core.Hash} A hash of binding information keyed by the
     *     binding target name.
     */

    var elem,
        doc,

        registry,

        infoKey,

        bindEntries;

    //  Grab the native Element and Document.
    elem = this.getNativeNode();
    doc = TP.nodeGetDocument(elem);

    //  If there's no 'bind registry' installed on the Document, then create
    //  one. This registry is used to avoid computing the binding information
    //  from the attribute value each time we need it. It's computed once and
    //  then stored under a key that is the whole attribute value. In this way,
    //  it can be shared amongst multiple attributes and elements, as long as
    //  the value of the attribute is exactly the same.
    if (TP.notValid(registry = doc[TP.BIND_INFO_REGISTRY])) {
        registry = TP.hc();
        doc[TP.BIND_INFO_REGISTRY] = registry;
    }

    infoKey = TP.join(TP.gid(elem, true),
                        TP.JOIN,
                        attributeName,
                        TP.JOIN,
                        attributeValue);

    if (TP.isTrue(flushCache)) {
        registry.removeKey(infoKey);
    }

    //  If the attribute value (acting as a key) is already in the registry,
    //  then just exit here - we don't want dups in the registry.
    if (registry.hasKey(infoKey)) {
        return registry.at(infoKey);
    }

    //  Ask the type to compute the binding info and put it into the registry.
    bindEntries = this.getType().computeBindingInfo(elem, attributeValue);
    registry.atPut(infoKey, bindEntries);

    return bindEntries;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getBindingScopeValues',
function(trimFormatExprs, ignoreCache, setCache) {

    /**
     * @method getBindingScopeValues
     * @summary Returns the binding scope values by starting at the receiver
     *      and traversing the DOM tree up to the #document node, gathering
     *      'bind:scope' attribute values along the way. This will be used to
     *      qualify binding expressions on the receiver.
     * @param {Boolean} [trimFormatExprs=true] Whether or not to trim formatting
     *     expressions from the scoping values.
     * @param {Boolean} [ignoreCache=false] Whether or not to ignore the
     *     receiver's cache of scope values.
     * @param {Boolean} [setCache=true] Whether or not to cache the computed
     *     scope values in the receiver's cache.
     * @returns {String[]} An Array of binding scope values.
     */

    var elem,

        localScopeNode,

        scopeVals;

    //  If we've already cached our scope values, then there's no need to
    //  recompute them - just return the cached values.
    if (TP.notTrue(ignoreCache) &&
        TP.notEmpty(scopeVals = this.get('scopeValues'))) {
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

            var scopeAttrVal;

            //  Have to check to make sure we're not at the #document node.
            if (TP.isElement(aNode)) {

                //  Get any 'scope' attributes belonging to the TP.w3.Xmlns.BIND
                //  namespace.

                //  First, check to see if there's a 'bind:repeat' attribute. If
                //  so, we want to use it's value first.
                scopeAttrVal = TP.elementGetAttribute(
                                        aNode, 'bind:repeat', true);

                if (TP.notEmpty(scopeAttrVal)) {
                    scopeVals.push(scopeAttrVal);
                }

                //  If the scope value is a URI, then we break here - we now
                //  have a fully-formed set of scopes.
                if (TP.isURIString(scopeAttrVal)) {
                    return TP.BREAK;
                }

                //  Then, check to see if there's a 'bind:scope' attribute. If
                //  so, we want to use it's value next.
                scopeAttrVal = TP.elementGetAttribute(
                                        aNode, 'bind:scope', true);

                if (TP.notEmpty(scopeAttrVal)) {
                    scopeVals.push(scopeAttrVal);
                }

                //  If the scope value is a URI, then we break here - we now
                //  have a fully-formed set of scopes.
                if (TP.isURIString(scopeAttrVal)) {
                    return TP.BREAK;
                }
            }
        });

    //  Make sure to reverse the scope values, since we want the 'most
    //  significant' to be first.
    scopeVals.reverse();

    //  Trim off formatting expressions unless the caller explicitly asked not
    //  to do it.
    if (TP.notFalse(trimFormatExprs)) {
        scopeVals = scopeVals.map(
                        function(aVal) {
                            if (TP.regex.ACP_FORMAT.test(aVal)) {
                                return aVal.slice(0, aVal.indexOf('.%')).trim();
                            }

                            return aVal;
                        });
    }

    if (TP.notFalse(setCache)) {
        //  Cache the values. Note here how we supply false to *not* broadcast a
        //  change signal - otherwise, the binding machinery will get involved
        //  and send extra notifications.
        this.$set('scopeValues', scopeVals, false);
    }

    return scopeVals;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$getBoundElements',
function(wantsShallowScope) {

    /**
     * @method $getBoundElements
     * @summary Returns an Array of the bound elements under the receiver.
     * @param {Boolean} wantsShallowScope Whether or not to produce bound
     *     elements that are 'under' a nested scope (i.e. either a bind:scope or
     *     bind:repeat) under the receiver.
     * @returns {Element[]} An Array of bound elements.
     */

    var elem,

        doc,

        filterQuery,

        allFilters,
        ownShallowFilters,

        allBoundQuery,
        boundElems;

    elem = this.getNativeNode();

    doc = TP.nodeGetDocument(elem);

    //  Define a query that will filter out binding expressions under elements
    //  with a tibet:opaque="bind" attribute.
    filterQuery = '*|*[*|opaque="bind"]';

    if (wantsShallowScope) {
        //  Note here how we ignore bind:scopes that contain a '[' (and are
        //  therefore bind:repeat scopes).
        filterQuery += ', *[*|scope]:not([*|scope*="["]), *[*|repeat]';
    }

    //  Grab all of the filtering elements in the whole document.
    allFilters = TP.ac(doc.documentElement.querySelectorAll(filterQuery));

    //  We need to compute the set of filtering elements that *are* under the
    //  receiver, so that we can use them later for filtering.

    //  Filter all of the filtering elements in the document so that only those
    //  that are under the target element and at the shallowest level (i.e. not
    //  containing any other filtering elements themselves) are left.
    ownShallowFilters = allFilters.filter(
            function(aFilter) {

                var k;

                //  We don't want ourself in the list
                if (aFilter === elem) {
                    return false;
                }

                if (!elem.contains(aFilter)) {
                    return false;
                }

                for (k = 0; k < allFilters.length; k++) {
                    //  If:
                    //  -   We're not checking ourself as a filter
                    //  -   The filter we're checking is actually contained in
                    //      the element
                    //  -   The iterating filter contains the target filter
                    //  -   We're at the end of checking all of the filters
                    //  then return false to filter out the target filter.
                    if (allFilters[k] !== aFilter &&
                        elem.contains(allFilters[k]) &&
                        allFilters[k].contains(aFilter)) {
                            if (k === allFilters.length - 1) {
                                return false;
                            }
                    }
                }

                return true;
            });

    //  Grab all of the bound elements, including scoping elements, in the whole
    //  document. Note here how we ignore bind:scopes that contain a '[' (and
    //  are therefore scopes generated by us under a bind:repeat).
    allBoundQuery =
        '*[*|io], *[*|in], *[*|scope]:not([*|scope*="["]), *[*|repeat]';

    boundElems = TP.ac(doc.documentElement.querySelectorAll(allBoundQuery));

    //  Filter all of the bound elements so that they're a) under ourself and
    //  b) that they're only under one of *our* filtering elements.
    boundElems = boundElems.filter(
            function(aNewElem) {

                var k;

                //  We don't want ourself in the list
                if (aNewElem === elem) {
                    return false;
                }

                if (elem.contains(aNewElem)) {

                    for (k = 0; k < ownShallowFilters.length; k++) {

                        //  The element was contained in a subscope - return
                        //  false to filter it out.
                        if (ownShallowFilters[k].contains(aNewElem)) {
                            return false;
                        }
                    }

                    return true;
                }

                return false;
            });

    //  If there are shallow filter elements that occurred under the target
    //  element, then we add them to the result. Note that we filter out any
    //  non-roots (since we won't want nested shallow filters appended here -
    //  each filter root will find *all* of the bound nodes under itself,
    //  including those in a nested filter).
    if (TP.notEmpty(ownShallowFilters)) {
        ownShallowFilters = TP.nodeListFilterNonRoots(ownShallowFilters);
        boundElems = boundElems.concat(ownShallowFilters);
    }

    return boundElems;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getBoundValue',
function(aspectName) {

    /**
     * @method getBoundValue
     * @summary Returns the bound value of the aspect on the receiver.
     * @param {String} aspectName The name of the aspect that the caller wants
     *     the bound value for.
     * @returns {Object} The value of the bound aspect.
     */

    var result,

        scopeValues,

        bindingInfo,

        keys,
        len,
        i,

        bindEntry,
        bindAspectName,
        bindVal;

    result = null;

    scopeValues = this.getBindingScopeValues();

    //  Extract the binding information from the supplied binding information
    //  value String. This may have already been parsed and cached, in which
    //  case we get the cached values back.
    bindingInfo = this.getBindingInfoFrom(
                    'bind:in', this.getAttribute('bind:in'));

    keys = bindingInfo.getKeys();
    len = keys.getSize();
    for (i = 0; i < len; i++) {

        bindEntry = bindingInfo.at(keys.at(i));
        bindAspectName = bindEntry.first();

        if (bindAspectName === aspectName) {
            bindVal = bindEntry.last();

            result = this.$computeValueForBoundAspect(bindVal, scopeValues);

            return result;
        }
    }

    //  It might not have been in the 'bind:in', so we do it again with
    //  'bind:io'

    //  Extract the binding information from the supplied binding information
    //  value String. This may have already been parsed and cached, in which
    //  case we get the cached values back.
    bindingInfo = this.getBindingInfoFrom(
                    'bind:io', this.getAttribute('bind:io'));

    keys = bindingInfo.getKeys();
    len = keys.getSize();
    for (i = 0; i < len; i++) {

        bindEntry = bindingInfo.at(keys.at(i));
        bindAspectName = bindEntry.first();

        if (bindAspectName === aspectName) {
            bindVal = bindEntry.last();

            result = this.$computeValueForBoundAspect(bindVal, scopeValues);

            return result;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getBoundValues',
function(attributeName, scopeValues, bindingInfoValue) {

    /**
     * @method getBoundValues
     * @summary Returns a hash of the bound values of the receiver.
     * @param {String} attributeName The name of the attribute that binding
     *     information is coming from.
     * @param {String[]} scopeValues The list of scoping values (i.e. parts
     *     that, when combined, make up the entire bind scoping path).
     * @param {String} bindingInfoValue A String, usually in a JSON-like format,
     *     that details the binding information for the receiver. That is, the
     *     bounds aspects of the receiver and what they're bound to.
     * @returns {TP.core.Hash} A hash of the bound values where the key is the
     *     bound aspect and the value is the value of that aspect in the bound
     *     data source.
     */

    var retVal,

        bindingInfo;

    retVal = TP.hc();

    //  Extract the binding information from the supplied binding information
    //  value String. This may have already been parsed and cached, in which
    //  case we get the cached values back.
    bindingInfo = this.getBindingInfoFrom(attributeName, bindingInfoValue);

    //  Iterate over each binding expression in the binding information.
    bindingInfo.perform(
        function(bindEntry) {
            var aspectName,

                bindVal,

                result;

            aspectName = bindEntry.first();
            bindVal = bindEntry.last();

            result = this.$computeValueForBoundAspect(bindVal, scopeValues);

            retVal.atPut(aspectName, result);
        }.bind(this));

    return retVal;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$getBranchValueAndPathType',
function(branchExpr, initialVal, initialPathType) {

    /**
     * @method $getBranchValueAndPathType
     * @summary Returns the branch value given the expression and the initial
     *     value. If a path type is supplied, it is used to further refine the
     *     value extraction.
     * @param {String} branchExpr The branch binding expressions that we're
     *     using to retrieve the value.
     * @param {Object} initialVal The initial value to use to compute the branch
     *     value.
     * @param {Number} [initialPathType] The path type that was precomputed by
     *     the caller. Note that the method will also return a computed path
     *     type. If this parameter is supplied, it will be taken into account
     *     when computing the path type.
     * @returns {Array<Object, Number>} The computed value and path type.
     */

    var theVal,

        branchValReq,
        branchURI,
        branchVal,

        pathType;

    theVal = initialVal;

    //  If the attribute value is a whole URI, then just grab the
    //  result of the URI and use that as the branch value to
    //  process 'the next level down' in the branching.
    if (TP.isURIString(branchExpr)) {
        branchURI = TP.uc(branchExpr);
        branchValReq = TP.request('shouldCollapse', false);

        if (branchURI.hasFragment()) {
            branchVal = branchURI.getResource(branchValReq).get('result');
        } else if (TP.isValid(theVal)) {
            branchVal = theVal;
        } else {
            branchVal = branchURI.getResource(branchValReq).get('result');
        }

        //  Try to detect the type of path based on tasting the
        //  branch value. This makes things much easier later on.
        if (TP.isXMLNode(branchVal)) {
            pathType = TP.ifInvalid(initialPathType, TP.XPATH_PATH_TYPE);
        } else if (TP.isKindOf(branchVal, TP.dom.Node)) {
            pathType = TP.ifInvalid(initialPathType, TP.XPATH_PATH_TYPE);
        } else if (TP.regex.JSON_POINTER.test(branchExpr) ||
                    TP.regex.JSON_PATH.test(branchExpr)) {
            pathType = TP.ifInvalid(initialPathType, TP.JSON_PATH_TYPE);
        } else if (branchURI.hasFragment()) {
            pathType = branchURI.getFragmentAccessPathType();
        }

    } else {

        if (TP.isValid(theVal)) {

            //  Adjust for the fact that, if it's an Array of XML nodes, that
            //  the extraction expression will be done in XPath (i.e. 1-based),
            //  but the Array is, of course, 0-based. So unshift a TP.NULL as a
            //  first value onto the front of the Array (but only if we haven't
            //  been here before and there's already a TP.NULL in the first
            //  position).
            if (TP.isArray(theVal) &&
                theVal.first() !== TP.NULL &&
                TP.isXMLNode(TP.unwrap(theVal.first()))) {
                theVal = TP.copy(theVal);
                theVal.unshift(TP.NULL);
            }

            if (TP.isXMLNode(theVal)) {
                branchVal = TP.wrap(theVal).get(TP.xpc(branchExpr));
                pathType = TP.ifInvalid(initialPathType,
                                        TP.XPATH_PATH_TYPE);
            } else if (TP.isKindOf(theVal, TP.dom.Node)) {
                branchVal = theVal.get(TP.xpc(branchExpr));
                pathType = TP.ifInvalid(initialPathType,
                                        TP.XPATH_PATH_TYPE);
            } else if (TP.regex.JSON_POINTER.test(branchExpr) ||
                        TP.regex.JSON_PATH.test(branchExpr)) {
                if (!TP.isKindOf(theVal, TP.core.JSONContent)) {
                    theVal = TP.core.JSONContent.construct(theVal);
                }

                branchVal = this.$extractValue(theVal,
                                                branchExpr,
                                                TP.jpc,
                                                TP.hc('shouldCollapse', false));

                pathType = TP.ifInvalid(initialPathType, TP.JSON_PATH_TYPE);
            } else if (TP.isKindOf(theVal, TP.core.JSONContent) &&
                        TP.regex.JS_IDENTIFIER.test(branchExpr)) {
                branchVal = theVal.get('$.' + branchExpr);
                pathType = TP.JSON_PATH_TYPE;
            } else if (TP.notValid(theVal)) {
                branchVal = null;
            } else if (TP.isPlainObject(theVal)) {
                branchVal = theVal[branchExpr];
            } else {
                branchVal = theVal.get(branchExpr);
            }
        }
    }

    pathType = TP.ifInvalid(pathType, initialPathType);

    return TP.ac(branchVal, pathType);
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getFullBindingPathFrom',
function(pathTail) {

    /**
     * @method getFullBindingPathFrom
     * @summary Returns a path computed from the receiver's binding scope and
     *     the supplied path tail.
     * @param {String} [pathTail=''] The tail of the path to use for the
     *     returned full binding path. Note that this will default to the empty
     *     String.
     * @returns {String} The fully qualified binding path computed from the
     *     binding scope of the receiver and the supplied path tail.
     */

    var scopeVals,
        tail,

        allVals,

        fullPath;

    scopeVals = this.getBindingScopeValues();
    tail = TP.ifInvalid(pathTail, '');

    allVals = scopeVals.concat(tail);

    fullPath = TP.uriJoinFragments.apply(TP, allVals);

    return fullPath;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getFullyExpandedBindingExpressions',
function(attributeName) {

    /**
     * @method getFullyExpandedBindingExpressions
     * @summary Returns all of the 'fully expanded' binding expressions for the
     *     receiver.
     * @param {String} attributeName The name of the attribute to obtain binding
     *     information from.
     * @description These are computed by taking all of the scoping values plus
     *     the local expression and then expanding them into the fully expanded
     *     binding expression.
     * @returns {TP.core.Hash} A hash of the aspect names and an Array of
     *     fully-formed binding expressions on the receiver for each name.
     */

    var scopeVals,

        results,

        attrVal,

        info;

    if (TP.isEmpty(attributeName)) {
        return null;
    }

    //  Get all of the scoping values and the local attribute value for the
    //  attribute name computed above.
    scopeVals = this.getBindingScopeValues();

    results = TP.hc();

    //  If the attribute is a 'bind:scope' or 'bind:repeat', then all we really
    //  need are the scoping values themselves.
    if (attributeName === 'bind:scope' || attributeName === 'bind:repeat') {
        results.atPut('scope', TP.ac(TP.uriJoinFragments.apply(TP, scopeVals)));
    } else {
        attrVal = this.getAttribute(attributeName);

        //  Grab the binding info for that local attribute value.
        info = this.getBindingInfoFrom(attributeName, attrVal);

        info.perform(
            function(kvPair) {

                var dataExprs,
                    exprResults,

                    len,
                    i,

                    dataExpr,

                    allVals,
                    fullExpr;

                //  Get all data expressions for the named aspect.
                dataExprs = kvPair.last().at('dataExprs');

                exprResults = TP.ac();

                len = dataExprs.getSize();
                for (i = 0; i < len; i++) {
                    dataExpr = TP.trim(dataExprs.at(i));

                    if (TP.isEmpty(dataExpr)) {
                        continue;
                    }

                    //  Join together the each expression along with the scoping
                    //  values to calculate the 'fully formed' binding
                    //  expression.
                    allVals = scopeVals.concat(dataExpr);

                    fullExpr = TP.uriJoinFragments.apply(TP, allVals);

                    exprResults.push(fullExpr);
                }

                results.atPut(kvPair.first(), exprResults);
            });
    }

    return results;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$getNearestRepeatIndex',
function() {

    /**
     * @method $getNearestRepeatIndex
     * @summary Returns the 'nearest' repeat index to the receiver. The receiver
     *     might be nested in multiple repeat contexts and this will return the
     *     'most specific' one to the receiver.
     * @returns {Number} The repeat index 'nearest' to the receiver in it's
     *     ancestor chain or TP.NOT_FOUND.
     */

    var scopeVals,

        len,
        i,

        repeatIndex,

        val;

    //  Grab all of the binding scope values. If there aren't any, then we just
    //  return TP.NOT_FOUND
    scopeVals = this.getBindingScopeValues();

    if (TP.isEmpty(scopeVals)) {
        return TP.NOT_FOUND;
    }

    //  Reverse the values, since we want to find the nearest (i.e. the most
    //  specific) index (we might be in a nested repeat)
    scopeVals.reverse();

    repeatIndex = TP.NOT_FOUND;

    //  Iterate up through the scoping values, looking for a numeric scope.
    len = scopeVals.getSize();
    for (i = 0; i < len; i++) {

        val = scopeVals.at(i);

        //  If attribute value contains '[N]', where N is an integer, then we
        //  extract that and convert it to a Number.
        if (TP.regex.SIMPLE_NUMERIC_PATH.test(val)) {
            repeatIndex = TP.regex.SIMPLE_NUMERIC_PATH.exec(
                                        val).at(1).asNumber();
            break;
        }
    }

    return repeatIndex;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getRepeatPageCount',
function() {

    /**
     * @method getRepeatPageCount
     * @summary Returns the total number of repeat 'pages' there are in the
     *     receiver, based on the total number of items in the collection being
     *     represented by the 'bind:repeat' and the value of the
     *     'bind:repeatsize' attribute (which defaults to 1).
     * @returns {Number} The total number of repeat 'pages' there are.
     */

    var repeatCollection,
        repeatSize;

    repeatCollection = this.$getRepeatValue();

    if (!TP.isCollection(repeatCollection)) {
        return -1;
    }

    repeatSize = this.getAttribute('bind:repeatsize');

    return (repeatCollection.getSize() / repeatSize).floor();
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getRepeatPage',
function() {

    /**
     * @method getRepeatPage
     * @summary Returns the repeat page 'position', that is the currently
     *     showing page of repeating results.
     * @returns {Number} The repeat page position.
     */

    var repeatSize,
        repeatIndex;

    repeatSize = this.getAttribute('bind:repeatsize');
    repeatIndex = this.getAttribute('bind:repeatindex');

    return (repeatIndex / repeatSize).ceil();
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$getRepeatSourceAndIndex',
function(repeatElem) {

    /**
     * @method $getRepeatSourceAndIndex
     * @summary Returns the repeating data source and index for the receiver if
     *     the receiver is under a 'bind:repeat' and is participating in the
     *     repeating iteration mechanics.
     * @param {Element} repeatElem The element containing the repeat.
     * @returns {Array<Object,Number>} An Array containing the repeat source and
     *     repeat index.
     */

    var elem,

        cachedIndexingSource,

        repeatAttrVal,

        repeatSource,

        repeatScopeVals,
        repeatPath,

        attrVal,
        repeatIndex;

    elem = this.getNativeNode();

    //  See if there's a parent element where we've cached the repeat source
    //  (and repeat index) when we generated the repeat.
    cachedIndexingSource = TP.nodeDetectAncestor(
                            elem,
                            function(aNode) {
                                return TP.isValid(aNode[TP.REPEAT_SOURCE]) &&
                                        TP.isNumber(aNode[TP.REPEAT_INDEX]);
                            });

    //  If we successfully found a cached properties parent, return the value of
    //  the cached source and cached index for this element.
    if (TP.isElement(cachedIndexingSource)) {
        //  Return an Array containing the repeat source and repeat index.
        return TP.ac(cachedIndexingSource[TP.REPEAT_SOURCE],
                        cachedIndexingSource[TP.REPEAT_INDEX]);
    }

    //  If we successfully detected a 'bind:repeat' ancestor, then try to
    //  calculate a repeat resource and our index within that repeat resource.
    if (TP.isElement(repeatElem)) {

        //  Grab any cached repeat resource on the repeat element that we might
        //  have computed already.
        repeatSource = repeatElem[TP.REPEAT_SOURCE];

        //  If there is none, compute it and cache it on the repeat.
        if (TP.notValid(repeatSource)) {

            repeatAttrVal = TP.elementGetAttribute(elem, 'bind:repeat', true);

            //  Try to calculate a repeat resource

            //  NB: Note how we do *not* want the getResource() call to collapse
            //  it's results for these calls - we always want a collection.

            //  If it's a URI String, then we can calculate a TP.uri.URI from it
            //  and just grab that resource's value.
            if (TP.isURIString(repeatAttrVal)) {
                repeatSource = TP.uc(repeatAttrVal).getResource(
                            TP.request('shouldCollapse', false)).get('value');
            } else {

                //  Otherwise, get the 'bind:repeat' ancestor's binding scope
                //  values, compute a path from them and use that as the URI.
                repeatScopeVals = TP.wrap(repeatElem).
                                getBindingScopeValues().concat(repeatAttrVal);
                repeatPath = TP.uriJoinFragments.apply(TP, repeatScopeVals);

                repeatSource = TP.uc(repeatPath).getResource(
                            TP.request('shouldCollapse', false)).get('value');
            }

            repeatElem[TP.REPEAT_SOURCE] = repeatSource;
        }

        //  Try to calculate a repeat index

        //  If we have a numeric 'bind:scope' attribute, then that means that
        //  we're the actual 'row' in the repeat.
        if (TP.elementHasAttribute(elem, 'bind:scope', true)) {
            if (TP.notEmpty(attrVal = TP.elementGetAttribute(
                                            elem, 'bind:scope', true))) {

                //  If attribute value contains '[N]', where N is an integer,
                //  then we extract that and convert it to a Number.
                if (TP.regex.SIMPLE_NUMERIC_PATH.test(attrVal)) {
                    repeatIndex = TP.regex.SIMPLE_NUMERIC_PATH.exec(
                                                attrVal).at(1).asNumber();

                    //  Cache the repeat source and repeat index values on the
                    //  binding scope.
                    elem[TP.REPEAT_SOURCE] = repeatSource;
                    elem[TP.REPEAT_INDEX] = repeatIndex;
                }
            }
        }

        //  If we could not get a repeat index from ourself, then we look up the
        //  ancestor chain looking for one.
        if (!TP.isNumber(repeatIndex)) {

            TP.nodeDetectAncestor(
                elem,
                function(aNode) {
                    if (TP.isElement(aNode) &&
                        TP.notEmpty(attrVal = TP.elementGetAttribute(
                                                aNode, 'bind:scope', true))) {

                        //  If attribute value contains '[N]', where N is an
                        //  integer, then we extract that and convert it to a
                        //  Number.
                        if (TP.regex.SIMPLE_NUMERIC_PATH.test(attrVal)) {
                            repeatIndex = TP.regex.SIMPLE_NUMERIC_PATH.exec(
                                                    attrVal).at(1).asNumber();

                            //  Cache the repeat source and repeat index values on
                            //  the binding scope.
                            aNode[TP.REPEAT_SOURCE] = repeatSource;
                            aNode[TP.REPEAT_INDEX] = repeatIndex;

                            return true;
                        }
                    }

                    return false;
                });
        }

        //  Return an Array containing the repeat source and repeat index.
        return TP.ac(repeatSource, repeatIndex);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$getRepeatTemplate',
function() {

    /**
     * @method $getRepeatTemplate
     * @summary Returns the repeat template Element for the receiver.
     * @returns {Element} The repeat template Element.
     */

    var elem,

        templateID,
        templateInfo,

        repeatContent;

    elem = this.getNativeNode();

    //  If we successfully detected a 'bind:repeat' ancestor, then try to
    //  calculate a repeat resource and our index within that repeat resource.
    if (TP.elementHasAttribute(elem, 'bind:repeat', true)) {

        //  Grab the unique templateID that should've been placed on us when our
        //  template content was captured.
        templateID = TP.elementGetAttribute(elem, 'tibet:templateid', true);
        if (TP.isEmpty(templateID)) {
            //  TODO: Raise an exception
            return null;
        }

        //  The template content was stored on our TP.dom.Document when it was
        //  captured and was stored under our templateID.
        if (TP.notValid(
                templateInfo = this.getDocument().get('$repeatTemplates'))) {
            //  TODO: Raise an exception
            return null;
        }

        if (TP.notValid(repeatContent = templateInfo.at(templateID))) {
            //  TODO: Raise an exception
            return null;
            /*
            repeatContent = this.$captureRepeatContent(boundElems);
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
                    'replaceWith',
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

        return repeatContent;
    }

    return null;
}, {
    patchCallee: false
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$getRepeatValue',
function() {

    /**
     * @method $getRepeatValue
     * @summary Returns the repeating data source for the receiver if the
     *     receiver is itself a 'bind:repeat'.
     * @returns {Object} The object representing the receiver's repeat value.
     *     This should be a Collection that can be iterated on.
     */

    var elem,

        repeatScopeVals,
        repeatPath,

        repeatSource;

    elem = this.getNativeNode();

    //  If we successfully detected a 'bind:repeat' ancestor, then try to
    //  calculate a repeat resource and our index within that repeat resource.
    if (TP.elementHasAttribute(elem, 'bind:repeat', true)) {

        //  Try to calculate a repeat resource

        //  NB: Note how we do *not* want the getResource() call to collapse
        //  it's results for this call - we always want a collection.

        //  Get the 'bind:repeat' ancestor's binding scope values, compute a
        //  path from them and use that as the URI.
        repeatScopeVals = this.getBindingScopeValues();
        repeatPath = TP.uriJoinFragments.apply(TP, repeatScopeVals);

        repeatSource = TP.uc(repeatPath).getResource(
                        TP.request('shouldCollapse', false)).get('value');

        return repeatSource;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineHandler('UIPageEnd',
function(aSignal) {

    /**
     * @method handleUIPageEnd
     * @summary Handles when the data 'pages' should be set to the last page.
     * @param {TP.sig.UIPageEnd} aSignal The signal instance which triggered
     *     this handler.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,
        pagePos;

    elem = this.getNativeNode();
    if (TP.elementHasAttribute(elem, 'bind:repeat', true)) {

        pagePos = this.getRepeatPageCount() + 1;
        this.setRepeatPage(pagePos);

        //  Make sure to stop the signal propagation here - we've processed the
        //  paging.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineHandler('UIPageNext',
function(aSignal) {

    /**
     * @method handleUIPageNext
     * @summary Handles when the data 'pages' should be set to the next page
     *     from the current one.
     * @param {TP.sig.UIPageNext} aSignal The signal instance which triggered
     *     this handler.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,
        pagePos;

    elem = this.getNativeNode();
    if (TP.elementHasAttribute(elem, 'bind:repeat', true)) {

        pagePos = this.getRepeatPage() + 1;
        this.setRepeatPage(pagePos);

        //  Make sure to stop the signal propagation here - we've processed the
        //  paging.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineHandler('UIPagePrevious',
function(aSignal) {

    /**
     * @method handleUIPagePrevious
     * @summary Handles when the data 'pages' should be set to the previous page
     *     from the current one.
     * @param {TP.sig.UIPagePrevious} aSignal The signal instance which
     *     triggered this handler.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,
        pagePos;

    elem = this.getNativeNode();
    if (TP.elementHasAttribute(elem, 'bind:repeat', true)) {

        pagePos = this.getRepeatPage() - 1;
        this.setRepeatPage(pagePos);

        //  Make sure to stop the signal propagation here - we've processed the
        //  paging.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineHandler('UIPageSet',
function(aSignal) {

    /**
     * @method handleUIPageSet
     * @summary Handles when the data 'pages' should be set to a specific page.
     * @param {TP.sig.UIPageSet} aSignal The signal instance which triggered
     *     this handler.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,
        pagePos;

    elem = this.getNativeNode();
    if (TP.elementHasAttribute(elem, 'bind:repeat', true)) {

        pagePos = aSignal.at('pageNum') + 1;
        this.setRepeatPage(pagePos);

        //  Make sure to stop the signal propagation here - we've processed the
        //  paging.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineHandler('UIPageStart',
function(aSignal) {

    /**
     * @method handleUIPageStart
     * @summary Handles when the data 'pages' should be set to the first page.
     * @param {TP.sig.UIPageStart} aSignal The signal instance which triggered
     *     this handler.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem;

    elem = this.getNativeNode();
    if (TP.elementHasAttribute(elem, 'bind:repeat', true)) {

        this.setRepeatPage(1);

        //  Make sure to stop the signal propagation here - we've processed the
        //  paging.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineHandler('UIRefresh',
function(aSignal) {

    /**
     * @method handleUIRefresh
     * @summary Refreshes the receiver's bound data.
     * @param {TP.sig.UIRefresh} aSignal The signal instance which triggered
     *     this handler.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    this.refresh();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$insertRepeatRowAt',
function(indexes, aCollection) {

    /**
     * @method $insertRepeatRowAt
     * @summary Insert rows at the indexes provided.
     * @description Note that the indexes supplied to this method should match
     *     the type of data source object of the repeat. If the data source of
     *     the repeat is an XML object, these indexes should be '1-based' (like
     *     XPath). If it is an JS or JSON object, these indexes should be
     *     '0-based' (like JSONPath).
     * @param {Number[]} indexes An Array of Numbers that indicate the indexes
     *     of the items to insert new items at.
     * @param {Object} aCollection The collection data model that will be used
     *     for the repeating content. Note that this method merely generates the
     *     blank repeating row for the single insertion - it is up to other
     *     methods to refresh the data bindings within them.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,

        templateID,
        templateInfo,

        repeatContent,

        wrapperElement,

        tpDoc,

        isXMLResource,

        str,

        len,
        i,

        index,

        newElement,
        newTPElem,

        scopeIndex,
        last,

        info,

        result,

        insertionPoint,

        followingScopedSiblings,
        len2,
        j,
        scopedSibling,
        scopeVal,

        firstRow,

        thisref,

        evt;

    elem = this.getNativeNode();

    templateID = TP.elementGetAttribute(elem, 'tibet:templateid', true);
    if (TP.isEmpty(templateID)) {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(
            templateInfo = this.getDocument().get('$repeatTemplates'))) {
        //  TODO: Raise an exception
        return this;
    }

    //  This will be a DocumentFragment that we stuffed away when the receiver
    //  was rebuilt.
    if (TP.notValid(repeatContent = templateInfo.at(templateID))) {
        return this;
    }

    //  If the repeat content's child element list has a size of 1, then we
    //  reach under there and use that element as the repeat content
    if (TP.nodeGetChildElements(repeatContent).getSize() === 1) {
        repeatContent = repeatContent.firstElementChild;
    }

    //  Whichever element has a 'tibet:no-mutations' attribute on it is
    //  acting as a common wrapper for the 'rows' making up the repeat. This may
    //  be a <tbody> element if we're repeating rows in a <table>, but it
    //  doesn't have to be.
    if (TP.elementHasAttribute(elem, 'tibet:no-mutations', true)) {
        wrapperElement = elem;
    } else {
        wrapperElement = TP.byCSSPath(
                            '> *[tibet|no-mutations]',
                            elem,
                            true,
                            false);
    }

    if (!TP.isElement(wrapperElement)) {
        //  TODO: Raise exception
        return this;
    }

    tpDoc = this.getDocument();

    if (TP.canInvoke(aCollection, 'first')) {
        //  Detect whether we're drawing GUI for model which is a chunk of XML
        //  data - we'll use this information later.
        isXMLResource = TP.isXMLNode(TP.unwrap(aCollection.first()));
    } else {
        isXMLResource = false;
    }

    //  Get the String representation of the repeat content. We'll use this
    //  later to check for ACP expressions.
    str = TP.str(repeatContent);

    //  Loop over all of the supplied indices
    len = indexes.getSize();
    for (i = 0; i < len; i++) {

        index = indexes.at(i);

        //  Make sure to clone the content and set it's 'bind:scope' to the
        //  index that we're inserting at.
        newElement = TP.nodeCloneNode(repeatContent);
        newTPElem = TP.wrap(newElement);

        //  NB: We don't do index adjustment here for XML resources since the
        //  changed indices were supplied to this call already having been
        //  adjusted for the supplied data source.
        scopeIndex = index;

        if (TP.regex.HAS_ACP.test(str)) {
            if (isXMLResource) {

                last = aCollection.getSize();

                info = TP.hc(
                        '$REQUEST', null,
                        'TP', TP,
                        'APP', APP,
                        '$SOURCE', this,
                        '$TAG', newTPElem,
                        '$TARGET', tpDoc,
                        '$_', aCollection.at(scopeIndex),
                        '$INPUT', aCollection,
                        '$INDEX', scopeIndex,
                        '$FIRST', scopeIndex === 1,
                        '$MIDDLE', scopeIndex > 1 && scopeIndex < last,
                        '$LAST', scopeIndex !== last,
                        '$EVEN', scopeIndex % 2 === 0,
                        '$ODD', scopeIndex % 2 !== 0,
                        '$#', scopeIndex);
            } else {

                last = aCollection.getSize() - 1;

                info = TP.hc(
                        '$REQUEST', null,
                        'TP', TP,
                        'APP', APP,
                        '$SOURCE', this,
                        '$TAG', newTPElem,
                        '$TARGET', tpDoc,
                        '$_', aCollection.at(scopeIndex),
                        '$INPUT', aCollection,
                        '$INDEX', scopeIndex,
                        '$FIRST', scopeIndex === 0,
                        '$MIDDLE', scopeIndex > 0 && scopeIndex < last,
                        '$LAST', scopeIndex !== last,
                        '$EVEN', scopeIndex % 2 === 0,
                        '$ODD', scopeIndex % 2 !== 0,
                        '$#', scopeIndex);
            }

            result = str.transform(null, info);
            newElement = TP.elem(result);
        }

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
                                wrapperElement,
                                true,
                                false);

        //  There was no insertion point - just append the element.
        if (!TP.isElement(insertionPoint)) {
            newElement = TP.nodeAppendChild(wrapperElement, newElement, false);
        } else {

            //  Otherwise, go ahead and insert the element and then renumber all
            //  of the ones coming after. Note the reassignment.
            newElement = TP.nodeInsertBefore(
                            wrapperElement, newElement, insertionPoint, false);

            //  Now, grab all of the scoped siblings that follow the element
            //  that we're going to insert.
            followingScopedSiblings = TP.byCSSPath(
                                        '~ *[bind|scope^="["][bind|scope$="]"]',
                                        newElement,
                                        false,
                                        false);

            //  Iterate over all of the scoped siblings and adjust their index.
            //  Note how we start by incrementing the index 1 past where we just
            //  inserted the new row. Then we set the sibling to that scope
            //  number and advance.

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

        //  Awaken any content under the newly inserted Element.
        TP.nodeAwakenContent(newElement);

        //  Bubble any xmlns attributes upward to avoid markup clutter.
        TP.elementBubbleXMLNSAttributes(newElement);

        if (i === 0) {
            firstRow = newElement;
        }
    }

    if (TP.isElement(firstRow)) {
        //  Focus the first autofocus or focusable descendant of the new row.
        //  TODO: Should this be configurable (i.e. via another 'bind:'
        //  attribute - 'bind:focusfirst' or something).
        (function() {
            TP.wrap(firstRow).focusAutofocusedOrFirstFocusableDescendant();
        }).queueBeforeNextRepaint(this.getNativeWindow());
    }

    //  Send a UIDidInsert with ourself as the target and the set of indexes
    //  that the insertion happened at.
    thisref = this;

    (function() {
        thisref.signal('TP.sig.UIDidInsert',
                        TP.hc('target', thisref, 'indexes', indexes));
    }).queueBeforeNextRepaint(this.getNativeWindow());

    //  Send a custom DOM-level event to allow 3rd party libraries to know that
    //  content has been added.

    evt = this.getNativeDocument().createEvent('Event');
    evt.initEvent('TIBETContentAdded', true, true);
    evt.data = TP.ac(newElement);

    wrapperElement.dispatchEvent(evt);

    return newElement;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('isBoundElement',
function() {

    /**
     * @method isBoundElement
     * @summary Whether or not the receiver is a bound element.
     * @returns {Boolean} Whether or not the receiver is bound.
     */

    var elem;

    elem = this.getNativeNode();

    return TP.elementHasAttribute(elem, 'bind:in', true) ||
            TP.elementHasAttribute(elem, 'bind:out', true) ||
            TP.elementHasAttribute(elem, 'bind:io', true);
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('isScopingElement',
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

TP.dom.ElementNode.Inst.defineMethod('$refresh',
function(shouldRender) {

    /**
     * @method $refresh
     * @summary Updates the receiver's content by refreshing all bound aspects
     *     in the receiver.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var elem,

        scopeVals,

        didProcess,

        attrNode,
        attrVal,

        valChanged,

        willRender;

    elem = this.getNativeNode();

    //  If this element has a bind:repeat, then just refresh it and move on.
    if (TP.elementHasAttribute(elem, 'bind:repeat', true)) {

        //  If the repeat page position isn't already set to a Number, then
        //  initialize it to 1.
        if (!TP.isNumber(
                this.getAttribute('bind:repeatpage').asNumber())) {
            this.$setAttribute('bind:repeatpage', 1, false);
        }

        //  Refresh the repeating data under us, passing true to regenerate any
        //  new repeat chunks that may be required.
        this.$refreshRepeatData(true);

        return this;
    }

    didProcess = false;
    scopeVals = this.getBindingScopeValues();

    if (TP.elementHasAttribute(elem, 'bind:in', true)) {
        didProcess = true;
        attrNode = TP.elementGetAttributeNode(elem, 'bind:in');
        attrVal = this.getAttribute('bind:in');

        valChanged = this.$refreshAttr(scopeVals, attrNode, 'bind:in', attrVal);
    }

    if (TP.elementHasAttribute(elem, 'bind:io', true)) {
        didProcess = true;
        attrNode = TP.elementGetAttributeNode(elem, 'bind:io');
        attrVal = this.getAttribute('bind:io');

        valChanged = this.$refreshAttr(scopeVals, attrNode, 'bind:io', attrVal);
    }

    //  If this element has a bind:scope, then refresh our bound descendants.
    if (TP.elementHasAttribute(elem, 'bind:scope', true)) {
        this.refreshBoundDescendants(shouldRender, false);
    }

    if (!didProcess) {
        //  If this isn't an element around one of those four attributes, then
        //  just call render() and return.
        this.render();

        return this;
    }

    //  If there is no attribute value, then just return
    if (TP.isEmpty(attrVal)) {
        return this;
    }

    //  Note here how we force the value of willRender to shouldRender (no
    //  matter whether it's true or false) if shouldRender is supplied.
    if (TP.notValid(shouldRender)) {
        willRender = valChanged;
    } else {
        willRender = shouldRender;
    }

    if (willRender) {
        this.render();
    }

    return valChanged;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('refresh',
function(shouldRender, shouldRefreshBindings) {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound aspects
     *     in the receiver and all of the descendants of the receiver that are
     *     bound.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @param {Boolean} [shouldRefreshBindings] Whether or not to refresh data
     *     bindings from the receiver down (in a 'sparse' fashion). If not
     *     supplied, this parameter will default to true.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var retVal,

        allRefreshedElements;

    //  First, call refresh on all of the *direct children* of the receiver,
    //  specifying to *not* refresh data bindings. We'll do that in a more
    //  efficient way below. In this way, the child refresh will not try to
    //  refresh bindings, but leave it to the sparse update routine below to do
    //  it.
    this.getChildElements().forEach(
        function(aChildTPElem) {
            aChildTPElem.refresh(shouldRender, false);
        });

    //  If the caller hasn't explicitly said to refresh data bindings, then we
    //  do so.
    if (TP.notFalse(shouldRefreshBindings)) {
        retVal = this.$refresh(shouldRender);

        //  If this element has a 'bind:scope', then the '$refresh' call above
        //  will have already called refreshBoundDescendants on it. Note that
        //  refreshBoundDescendants will process refreshed elements so we only
        //  do that if we don't call it.
        if (!this.hasAttribute('bind:scope')) {
            this.refreshBoundDescendants(shouldRender);
        } else {
            //  Send a custom DOM-level event to allow 3rd party libraries to
            //  know that the bindings have been refreshed.
            allRefreshedElements = this.getDocument().get('$refreshedElements');
            if (TP.notEmpty(allRefreshedElements)) {
                this.$sendNativeRefreshEvent();
            }
        }
    } else {
        retVal = false;
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$refreshAttr',
function(scopeVals, attributeNode, bindingAttrName, bindingAttrValue) {

    /**
     * @method $refreshAttr
     * @summary Updates the receiver's content using the supplied scope values,
     *     attribute node and binding expression.
     * @param {String[]} scopeVals An Array of scoping values to use for
     *     computing the binding scope when evaluating the expressions as
     *     supplied in the binding expression.
     * @param {Attribute} attributeNode The attribute node that the binding
     *     expression was found on. This is passed along to code that refreshes
     *     expressions at our 'leaf' level.
     * @param {String} bindingAttrName The name of the binding attribute.
     * @param {String} bindingAttrValue The value of the binding attribute. This
     *     will contain the information that binding expressions can be
     *     extracted from.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var bindingInfo,

        scopedValExpr,
        scopedURI,
        scopedVal,

        pathType,

        valueAndPath,

        didRefresh;

    //  Extract the binding information from the supplied binding information
    //  value String. This may have already been parsed and cached, in which
    //  case we get the cached values back.
    bindingInfo = this.getBindingInfoFrom(bindingAttrName, bindingAttrValue);

    //  If we are inside of a scoping context.
    if (TP.notEmpty(scopeVals)) {
        //  Concatenate the binding value onto the scope values array (thereby
        //  creating a new Array) and use it to join all of the values together.
        scopedValExpr = TP.uriJoinFragments.apply(TP, scopeVals);

        //  If we weren't able to compute a real URI from the fully expanded URI
        //  value, then raise an exception and return here.
        if (!TP.isURIString(scopedValExpr)) {
            this.raise('TP.sig.InvalidURI');

            return false;
        }

        //  Create a URI from the scoped expression and get its result. This
        //  will provide with the 'closest scoped expression'. Note here how we
        //  specifically tell the URI to *not* signal change if it has to fetch
        //  new content.
        scopedURI = TP.uc(scopedValExpr);
        scopedVal = scopedURI.getResource(
                            TP.request('signalChange', false)).get('result');

        //  Obtain the branching value and path type, given the scoped value
        //  expression and the value as we've computed it so far.
        valueAndPath = this.$getBranchValueAndPathType(
                                scopedValExpr, scopedVal);

        scopedVal = valueAndPath.at(0);
        pathType = valueAndPath.at(1);

    } else {
        scopedVal = null;
        pathType = null;
    }

    didRefresh = false;

    //  Iterate over each binding expression in the binding information.
    bindingInfo.perform(
        function(bindEntry) {

            var aspectName,
                bindVal,

                dataExprs,
                transformFunc,

                refreshedEntry;

            aspectName = bindEntry.first();
            bindVal = bindEntry.last();

            //  There will be 1...n data expressions here.
            dataExprs = bindVal.at('dataExprs');

            //  If a transformation function was computed from the expression,
            //  it will be here.
            transformFunc = bindVal.at('transformFunc');

            //  Set our final value for the current binding expresssion. This
            //  will return whether or not setting this value will have changed
            //  one or more of the values of the observers.
            refreshedEntry = this.$setFinalValue(
                                    aspectName,
                                    dataExprs,
                                    scopedVal,
                                    TP.ac(aspectName),
                                    'value',
                                    transformFunc,
                                    pathType,
                                    this,
                                    null,
                                    NaN);

            //  If at least one returned true, then flip the flag to true. Note
            //  that this is constructed such that, once the flag is flipped to
            //  true, it cannot be changed back.
            if (refreshedEntry) {
                didRefresh = refreshedEntry;
            }
        }.bind(this));

    return didRefresh;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('refreshBoundDescendants',
function(shouldRender, shouldSendEvent) {

    /**
     * @method refreshBoundDescendants
     * @summary Updates bound descendants content by refreshing all bound
     *     aspects in each one.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @param {Boolean} [shouldSendEvent=true] Whether or not we should send a
     *     custom native event that indicates that we refreshed the bindings.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var boundDescendants,

        allRefreshedElements;

    //  Get the bound descendant elements of the receiver. Note how we pass
    //  'true' here to *just* get elements that are 'shallow'. If we pick up
    //  'scope' or 'repeat' elements, those will recursively call this method
    //  for any 'in' or 'io' elements under them.
    boundDescendants = TP.wrap(this.$getBoundElements(true));

    boundDescendants.forEach(
        function(aDescendant) {

            //  NB: We call the primitive '$refresh' call here - otherwise,
            //  we'll end up recursing. Note that, even though boundDescendants
            //  will contain 'bind:scope' and 'bind:repeat' elements at this
            //  point, they will be filtered out by this method. Their
            //  descendants, the real bind:[in|io|out] elements, will be
            //  refreshed.
            aDescendant.$refresh(shouldRender);
        });

    //  Send a custom DOM-level event to allow 3rd party libraries to know that
    //  the bindings have been refreshed.
    allRefreshedElements = this.getDocument().get('$refreshedElements');
    if (TP.notEmpty(allRefreshedElements) && TP.notFalse(shouldSendEvent)) {
        this.$sendNativeRefreshEvent();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$refreshBranches',
function(primarySource, aFacet, initialVal, needsRefreshElems, aPathType, pathParts, pathAction, isScoped, sigOrigin, originWasURI, changeSource, updateIndexes) {

    /**
     * @method $refreshBranches
     * @summary Refreshes any data bindings that are collections ('branches')
     *     under the set of supplied bound elements.
     * @param {Object} primarySource The object that is the primary data source
     *     that leafs under the receiver could be bound to. This is usually a
     *     collection of data.
     * @param {String} [aFacet=value] The facet of the binding expressions that
     *     we're refreshing. This defaults to 'value' which is the 99% case.
     * @param {Object} initialVal The initial value to use to update the
     *     binding. This could be mutated inside of this method to a final,
     *     massaged, value.
     * @param {Element[]} needsRefreshElems An array of elements that are
     *     descendants of the receiver that need to be refreshed from their
     *     binding expressions.
     * @param {Number} [aPathType] The path type that is contained in the
     *     binding expression.
     * @param {String[]} [pathParts] An array of parts of the data binding path
     *     that are being updated as computed by the data content management
     *     engine.
     * @param {String} pathAction If one of the leafs under the receiver is a
     *     repeating construct, then this is a constant to tell the machinery
     *     whether to create/insert or delete items.
     * @param {Boolean} [isScoped] Whether or not this invocation of this method
     *     is servicing a 'scoped' context. Used internally by recursive calls
     *     to this method.
     * @param {Object} [sigOrigin] If a signal initiated the refreshing process,
     *     this will be the signal's 'origin'.
     * @param {Boolean} [originWasURI=false] If a signal initiated the
     *     refreshing process, then this is whether or not the origin of the
     *     signal that started the refreshing process was a TP.uri.URI.
     * @param {Object} [changeSource] The source of the change. If a signal
     *     initiated the refreshing process, this will be the signal's 'source'.
     * @param {Number[]} [updateIndexes] If one of the leafs under the receiver
     *     is a repeating construct, then this is an optional set of indexes
     *     that tells the repeat where to insert, delete, etc.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,

        subscopes,

        boundElems,

        nextElems,

        primaryLoc,
        originalLocationInfos,
        matcherEntries,

        boundAttrCount,

        boundAttrNodes,
        attrs,
        i,
        j,

        theVal,

        primaryLocMatcher,

        len,

        boundAttr,
        attrName,
        attrVal,

        ownerElem,

        isScopingElement,

        valueAndPath,

        branchURI,
        branchVal,

        pathType,

        aspectNames,

        repeatElem,
        inRepeatContext,

        repeatSource,
        repeatIndex,
        repeatInfo,

        repeatScopeVals,
        repeatPath,
        repeatFragExpr,

        updateRepeatIndexes,

        ownerTPElem,

        searchParts,

        partsNegativeSlice,
        predicatePhaseOneComplete,

        didProcess,

        attrInfo,
        updatedUIAspects,

        lastPart,

        startPredIndex,
        endPredIndex,
        hasPredicate,
        predicateStmt,

        searchPath,

        branchMatcher,
        leafMatcher,

        processedElements,

        remainderParts,

        needsRefresh,
        allRefreshedElements,

        insideRepeatScope,

        newRowElem;

    elem = this.getNativeNode();

    //  TIMING: var startQuery = Date.now();

    //  Grab all of the elements that contain 'scope' or 'repeat' attributes.
    //  Note that we can't filter for the 'bind:' (TP.w3.Xmlns.BIND) namespace
    //  on those attributes here because the 'querySelectorAll' call has no
    //  namespace support :-(. It is, however, very fast. We'll filter for that
    //  later.
    subscopes = TP.ac(elem.querySelectorAll('*[*|scope], *[*|repeat]'));

    subscopes = subscopes.filter(
            function(aSubscope) {

                var k;

                //  We don't want ourself in the list
                if (aSubscope === elem) {
                    return false;
                }

                if (!elem.contains(aSubscope)) {
                    return false;
                }

                for (k = 0; k < subscopes.length; k++) {
                    //  If:
                    //  -   We're not checking ourself as a subscope
                    //  -   The subscope we're checking is actually contained in
                    //      the element
                    //  -   The iterating subscope contains the target subscope
                    //  -   We're at the end of checking all of the subscopes
                    //  then return false to filter out the target subscope.
                    if (subscopes[k] !== aSubscope &&
                        elem.contains(subscopes[k]) &&
                        subscopes[k].contains(aSubscope)) {
                            if (k === subscopes.length - 1) {
                                return false;
                            }
                    }
                }

                return true;
            });

    boundElems = needsRefreshElems;

    //  Get the set of elements that are contained within the receiver, but in a
    //  'shallow' fashion - that is, 'under' the receiver but not under any
    //  nested scopes (i.e. 'bind:scope' or 'bind:repeat') that are also under
    //  the receiver.
    nextElems = boundElems.filter(
            function(anElem) {

                var bindIOValue,
                    bindInValue,
                    bindOutValue,

                    k;

                bindIOValue = anElem.getAttributeNS(TP.w3.Xmlns.BIND, 'io');
                bindInValue = anElem.getAttributeNS(TP.w3.Xmlns.BIND, 'in');
                bindOutValue = anElem.getAttributeNS(TP.w3.Xmlns.BIND, 'out');

                //  We don't want ourself in the list unless we have a value for
                //  'bind:io', 'bind:in' or 'bind:out'
                if (anElem === elem) {
                    if (TP.notEmpty(bindIOValue) ||
                        TP.notEmpty(bindInValue) ||
                        TP.notEmpty(bindOutValue)) {
                        return true;
                    }

                    return false;
                }

                if (elem.contains(anElem)) {
                    for (k = 0; k < subscopes.length; k++) {

                        //  If the subscope contains the element, then we will
                        //  normally return false to exclude it from the
                        //  'this-level' scopes that we're interested in. One
                        //  exception to this is if the binding value contains
                        //  'urn:' or '//:' which would indicate some sort of
                        //  absolute path.
                        if (subscopes[k].contains(anElem)) {

                            if (TP.notEmpty(bindIOValue) &&
                                (bindIOValue.contains('urn:') ||
                                    bindIOValue.contains('://'))) {
                                    return true;
                            }

                            if (TP.notEmpty(bindInValue) &&
                                (bindInValue.contains('urn:') ||
                                    bindInValue.contains('://'))) {
                                    return true;
                            }

                            if (TP.notEmpty(bindOutValue) &&
                                (bindOutValue.contains('urn:') ||
                                    bindOutValue.contains('://'))) {
                                    return true;
                            }

                            return false;
                        }
                    }

                    return true;
                }

                return false;
            });

    //  Compute a RegExp matcher that will match the 'primary location' (i.e.
    //  the rooted URI).

    //  Grab the primary location of the signal origin.
    primaryLoc = sigOrigin.getPrimaryLocation();

    //  Grab the 'original location' info records that were computed by the
    //  'bind:' namespace object when the content containing these binds was
    //  loaded.
    originalLocationInfos = this.getDocument().get('$originalLocationInfos');

    matcherEntries = TP.ac();

    //  Iterate over each location info record and build up a set of RegExp
    //  expressions that will match the primary binding expressions in the
    //  document. A location info record will be a pair that contains the
    //  originally authored location in the first position and the concrete /
    //  fully expanded URI in the last position.
    originalLocationInfos.forEach(
        function(infoPair) {

            var originalLocation,
                concreteLocation;

            //  Grab the concrete location and test it against the primary
            //  location obtained above. If they don't match, then we're not
            //  going to match here at all.
            concreteLocation = infoPair.last();
            if (concreteLocation !== primaryLoc) {
                return;
            }

            //  Grab the originally authored location. If it contains a
            //  fragment, then we reset it by slicing off the fragment.
            originalLocation = infoPair.first();
            if (originalLocation.indexOf('#') !== TP.NOT_FOUND) {
                originalLocation = originalLocation.slice(
                                    0,
                                    originalLocation.indexOf('#'));
            }

            //  If the two locations *don't* match, then we add a separate
            //  RegExp expression entry for the originally authored location.
            //  This allows us to match locations like relative and virtual
            //  URIs.
            if (originalLocation !== concreteLocation) {
                matcherEntries.push(TP.regExpEscape(originalLocation));
            }

            //  Add a RegExp expression entry for the concrete location.
            matcherEntries.push(TP.regExpEscape(concreteLocation));
        });

    //  Compute an 'alternating RegExp' that contains all of the computed
    //  matcher entries.
    primaryLocMatcher = TP.rc('(' + matcherEntries.join('|') + ')');

    //  If we have subscopes, filter out any non-roots (since we won't want
    //  nested subscopes appended here - each subscope root will find *all* of
    //  the bound nodes under itself, including those in a nested subscope).
    if (TP.notEmpty(subscopes)) {
        subscopes = TP.nodeListFilterNonRoots(
                        subscopes,
                        function(rootNode, testNode) {
                            var val;

                            //  If the root node we're testing contains the test
                            //  node, then check for fully qualified URIs.
                            if (rootNode.contains(testNode)) {

                                //  Grab the 'bind:scope' value - if it's a
                                //  fully qualified URI and it matches the
                                //  primary location, then we return false to
                                //  *not* filter it from the subscopes list.
                                val = testNode.getAttributeNS(
                                            TP.w3.Xmlns.BIND, 'scope');
                                if (TP.isURIString(val) &&
                                    primaryLocMatcher.test(val)) {
                                    return false;
                                }

                                //  Grab the 'bind:repeat' value - if it's a
                                //  fully qualified URI and it matches the
                                //  primary location, then we return false to
                                //  *not* filter it from the subscopes list.
                                val = testNode.getAttributeNS(
                                            TP.w3.Xmlns.BIND, 'repeat');
                                if (TP.isURIString(val) &&
                                    primaryLocMatcher.test(val)) {
                                    return false;
                                }

                                return true;
                            }

                            return false;
                        });
        nextElems = nextElems.concat(subscopes);
    }

    //  Iterate over all of those elements containing binding attributes and
    //  grab the attribute nodes that are in the TP.w3.Xmlns.BIND namespace.
    boundAttrNodes = TP.ac();
    for (i = 0; i < nextElems.length; i++) {
        attrs = nextElems[i].attributes;

        boundAttrCount = 0;
        for (j = 0; j < attrs.length; j++) {

            //  Make sure the attribute is in the binding namespace. This also
            //  accounts for the deficency of the querySelectorAll() call above.
            if (attrs[j].namespaceURI === TP.w3.Xmlns.BIND &&
                /^bind:(in|out|io|scope|repeat)$/.test(attrs[j].name)) {
                boundAttrNodes.push(attrs[j]);
                boundAttrCount++;
            }
        }

        //  Stamp the number of bound attributes onto the element. We will use
        //  this to track how many bound attributes a particular element still
        //  has left for processing (for performance reasons).
        nextElems[i][TP.BOUND_ATTR_COUNT] = boundAttrCount;
    }

    //  Sort the attribute nodes so that 'bind:in' attributes come first. This
    //  is important when an element has both 'bind:in' and 'bind:io'
    //  attributes, since we want the 'in' bindings to be refreshed first to
    //  have that data available to the 'io' bindings.
    boundAttrNodes.sort(
        function(a, b) {

            if (a.nodeName === 'bind:in' && b.nodeName !== 'bind:in') {
                return -1;
            } else if (a.nodeName !== 'bind:in' && b.nodeName === 'bind:in') {
                return 1;
            }

            return 0;
        });

    //  TIMING: var endQuery = Date.now();
    //  TIMING: TP.totalBranchQueryTime += (endQuery - startQuery);

    if (TP.isPlainObject(initialVal)) {
        theVal = TP.hc(initialVal);
    } else {
        theVal = initialVal;
    }

    if (TP.isEmpty(pathParts)) {

        //  Loop over all of the found binding attributes.
        len = boundAttrNodes.getSize();
        for (i = 0; i < len; i++) {

            boundAttr = boundAttrNodes.at(i);

            attrName = boundAttr.localName;
            attrVal = boundAttr.value;

            /* eslint-disable no-extra-parens */
            isScopingElement = (attrName === 'scope' || attrName === 'repeat');
            /* eslint-enable no-extra-parens */

            ownerElem = boundAttr.ownerElement;

            //  If the attribute value contains a URI scheme, but it's primary
            //  location doesn't match the primary location that changed and
            //  that we're refreshing from (which may happen because we're
            //  querying from the *document* down), then just continue and move
            //  on,
            if (TP.regex.ALL_SCHEMES.test(attrVal) &&
                !primaryLocMatcher.test(attrVal)) {
                continue;
            }

            ownerTPElem = TP.wrap(ownerElem);

            //  Are we processing a nested scope?

            if (isScopingElement) {

                if (attrVal === '[NaN]') {
                    theVal = null;
                }

                //  If our facet is 'value', then we obtain the branching value
                //  and path type, given the expression in the attribute value,
                //  the value as we've computed it so far and whatever path type
                //  we've been able to calculate.
                //  If the facet is not 'value', then we just use what is
                //  supplied.
                if (aFacet === 'value') {

                    //  If the attribute is a 'bind:repeat' and the path isn't a
                    //  simple numeric path, then collapse the value.
                    if (attrName === 'repeat' &&
                        !TP.regex.SIMPLE_NUMERIC_PATH.test(attrVal)) {
                        theVal = TP.collapse(theVal);
                    }

                    valueAndPath = this.$getBranchValueAndPathType(
                                                attrVal, theVal, aPathType);

                    branchVal = valueAndPath.at(0);
                    pathType = valueAndPath.at(1);
                } else {
                    branchVal = theVal;
                    pathType = aPathType;
                }

                if (attrName === 'repeat') {

                    if (!TP.isURIString(attrVal)) {
                        repeatScopeVals =
                            this.getBindingScopeValues().concat(attrVal);
                        repeatPath =
                            TP.uriJoinFragments.apply(TP, repeatScopeVals);
                        repeatFragExpr = TP.uc(repeatPath).getFragmentExpr();
                        TP.apc(repeatFragExpr).executeGet(primarySource);
                    }

                    //  Normalize the value for repeat purposes (we're
                    //  interested in an Array of key,value pairs).
                    branchVal = this.$normalizeRepeatValue(branchVal);

                    //  Make sure that branchVal is a collection.
                    if (TP.isCollection(branchVal)) {

                        //  NB: This modifies the supplied 'boundElems' Array to
                        //  add the newly generated elements. They will be
                        //  refreshed below.
                        //  If $regenerateRepeat returns false, then it didn't
                        //  regenerate any chunks and, therefore, we need to
                        //  manually update the repeat indexes.
                        updateRepeatIndexes = !ownerTPElem.$regenerateRepeat(
                                                        branchVal, boundElems);
                        if (updateRepeatIndexes) {
                            ownerTPElem.$updateRepeatRowIndices(branchVal);
                        }
                    }
                } else if (attrName === 'scope') {

                    //  If the owner element had both a 'bind:scope' and one of
                    //  the binding attributes on it, then we refresh the
                    //  element itself.
                    if (ownerTPElem.isBoundElement()) {
                        aspectNames = ownerTPElem.$computeMatchingAspects(
                                                        boundAttr.name,
                                                        attrVal,
                                                        primaryLocMatcher);
                        ownerTPElem.$refreshLeaf(
                            aFacet,
                            branchVal,
                            aspectNames,
                            boundAttr,
                            pathType,
                            changeSource,
                            null,
                            null);

                        //  Now, we must remove the ownerTPElem from the list of
                        //  bound elements, or we'll recurse endlessly.
                        /* eslint-disable no-loop-func */
                        boundElems = boundElems.filter(
                            function(anElem) {
                                return anElem !== ownerTPElem.getNativeNode();
                            });
                        /* eslint-enable no-loop-func */
                    }
                }

                ownerTPElem.$refreshBranches(
                                primarySource,
                                aFacet,
                                branchVal,
                                boundElems,
                                pathType,
                                null,
                                pathAction,
                                true,
                                sigOrigin,
                                originWasURI,
                                changeSource,
                                updateIndexes);
            } else {

                //  If we're not scoped (i.e. we're running top-level
                //  expressions) and the expression that we're processing
                //  doesn't contain ACP variables and the primary location
                //  matcher doesn't match the expression, then it's a top-level
                //  expression pointing at another data location - don't process
                //  them.
                if (!isScoped &&
                    !TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(attrVal) &&
                    !primaryLocMatcher.test(attrVal)) {
                    continue;
                }

                //  Grab all of the names of the aspects referencing the changed
                //  location, as given by the primaryLocMatcher.
                aspectNames = ownerTPElem.$computeMatchingAspects(
                                                boundAttr.name,
                                                attrVal,
                                                primaryLocMatcher);

                repeatElem = TP.nodeDetectAncestor(
                            ownerElem,
                            function(aNode) {
                                var isRepeat;

                                isRepeat = TP.isElement(aNode) &&
                                            TP.elementHasAttribute(
                                                    aNode, 'bind:repeat', true);

                                return isRepeat;
                            });

                inRepeatContext = TP.isElement(repeatElem);

                repeatSource = null;
                repeatIndex = NaN;

                if (inRepeatContext) {
                    //  Grab the repeating information.
                    repeatInfo = this.$getRepeatSourceAndIndex(repeatElem);

                    if (TP.isValid(repeatInfo)) {
                        repeatSource = repeatInfo.first();
                        repeatIndex = repeatInfo.last();
                    }
                }

                //  Go ahead and process this as a leaf.
                ownerTPElem.$refreshLeaf(
                    aFacet,
                    theVal,
                    aspectNames,
                    boundAttr,
                    aPathType,
                    changeSource,
                    repeatSource,
                    repeatIndex);
            }
        }

    } else {

        searchParts = pathParts;

        partsNegativeSlice = 0;

        predicatePhaseOneComplete = false;

        //  Work in reverse order, trying to find the 'most specific' branching
        //  elements.
        while (TP.notEmpty(searchParts)) {

            didProcess = false;

            lastPart = searchParts.last();
            startPredIndex = lastPart.indexOf('[');

            //  Note that we don't allow statements such as '[0]' to qualify as
            //  predicates we want to process, hence looking for a '[' at a
            //  position greater than 0.
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
                branchMatcher = TP.rc(
                                '(^|:\\s*)' +
                                TP.regExpEscape(searchPath) +
                                '($|\\s*[,}])');
            } else {
                branchMatcher =
                    TP.rc(
                    '(^|:\\s*)' +
                    '((#[()a-zA-Z0-9]+)?' +
                    TP.regExpEscape(searchPath) +
                    '|.)' +
                    '($|\\s*[,}])');
            }

            //  If the search path is only one character and that character is
            //  '/' or '$', then we've reached the root of either an XPath or
            //  JSONPath. We don't update from whole roots, so empty the
            //  searchParts (so we don't endlessly recurse) and break out of the
            //  whole loop.
            if (searchPath === '/' || searchPath === '$') {
                searchParts.empty();
                break;
            }

            //  If there is only one search part, and it is a URI, then we've
            //  'trimmed back' to the most general part of the source URI. In
            //  that case, we only want to match 'leafs' that are looking at the
            //  'whole' URI, not all of the ones that have subparts that match.
            if (searchParts.getSize() === 1 && TP.isURIString(searchPath)) {
                leafMatcher = TP.rc(
                                '(^|:\\s*)' +
                                TP.regExpEscape(searchPath) +
                                '($|\\s*[,}])');
            } else {
                leafMatcher = TP.rc(TP.regExpEscape(searchPath));
            }

            processedElements = TP.ac();

            len = boundAttrNodes.getSize();
            for (j = 0; j < len; j++) {
                boundAttr = boundAttrNodes.at(j);

                attrName = boundAttr.localName;
                attrVal = boundAttr.value;

                ownerElem = boundAttr.ownerElement;

                //  Check to see if we've already processed this element. If
                //  there are more than one binding attributes on an element,
                //  we still don't want to process it more than once.
                if (processedElements.indexOf(ownerElem) !== TP.NOT_FOUND) {
                    if (ownerElem[TP.BOUND_ATTR_PROCESSED_COUNT] ===
                        ownerElem[TP.BOUND_ATTR_COUNT] - 1) {
                        continue;
                    }
                    ownerElem[TP.BOUND_ATTR_PROCESSED_COUNT]++;
                } else {
                    //  Keep track of already processed elements.
                    processedElements.push(ownerElem);
                    ownerElem[TP.BOUND_ATTR_PROCESSED_COUNT] = 0;
                }

                ownerTPElem = TP.wrap(ownerElem);

                isScopingElement =
                        attrName === 'scope' || attrName === 'repeat';

                if (isScopingElement && branchMatcher.test(attrVal)) {

                    //  If the scoping element has a '.' or '$_', then it wants
                    //  to scope to the data (probably a collection) that was
                    //  supplied to this method and is currently in theVal.
                    if (TP.regex.ONLY_PERIOD.test(attrVal) ||
                        TP.regex.ONLY_STDIN.test(attrVal)) {
                        return ownerTPElem.$refreshBranches(
                                primarySource,
                                aFacet,
                                theVal,
                                boundElems,
                                aPathType,
                                pathParts,
                                pathAction,
                                true,
                                sigOrigin,
                                originWasURI,
                                changeSource,
                                updateIndexes);
                    }

                    if (aFacet === 'value') {

                        if (TP.isURIString(attrVal)) {
                            branchURI = TP.uc(attrVal);
                            if (branchURI.hasFragment()) {
                                branchVal =
                                    branchURI.getResource().get('result');
                            } else {
                                branchVal = theVal;
                            }
                        } else {

                            if (TP.isValid(theVal)) {
                                if (TP.isArray(theVal) &&
                                    theVal.first() !== TP.NULL &&
                                    TP.isXMLNode(TP.unwrap(theVal.first()))) {
                                    theVal.unshift(TP.NULL);
                                }

                                if (TP.isXMLNode(theVal)) {

                                    branchVal =
                                        TP.wrap(theVal).get(TP.xpc(attrVal));
                                    pathType = TP.ifInvalid(
                                        aPathType, TP.XPATH_PATH_TYPE);

                                } else if (TP.isKindOf(theVal, TP.dom.Node)) {

                                    branchVal = theVal.get(TP.xpc(attrVal));
                                    pathType = TP.ifInvalid(aPathType,
                                                            TP.XPATH_PATH_TYPE);

                                } else if (
                                    TP.regex.JSON_POINTER.test(attrVal) ||
                                            TP.regex.JSON_PATH.test(attrVal)) {
                                    if (!TP.isKindOf(
                                            theVal, TP.core.JSONContent)) {
                                        theVal = TP.core.JSONContent.construct(
                                                                        theVal);
                                    }

                                    branchVal = this.$extractValue(
                                                theVal,
                                                attrVal,
                                                TP.jpc,
                                                TP.hc('shouldCollapse', false));

                                    pathType = TP.ifInvalid(aPathType,
                                                            TP.JSON_PATH_TYPE);
                                } else if (TP.isKindOf(
                                        theVal, TP.core.JSONContent) &&
                                        TP.regex.JS_IDENTIFIER.test(attrVal)) {
                                    attrVal = '$.' + attrVal;
                                    branchVal = theVal.get(attrVal);
                                    pathType = TP.JSON_PATH_TYPE;
                                } else {
                                    branchVal = theVal.get(attrVal);
                                    pathType = TP.ifInvalid(aPathType,
                                                            TP.TIBET_PATH_TYPE);
                                }
                            }
                        }
                    } else {
                        branchVal = initialVal;
                        pathType = TP.ifInvalid(aPathType, TP.TIBET_PATH_TYPE);
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

                    insideRepeatScope =
                        TP.regex.SIMPLE_NUMERIC_PATH.test(attrVal) &&
                        TP.elementHasClass(ownerElem, 'item');

                    if ((attrName === 'repeat' || insideRepeatScope) &&
                        TP.isEmpty(remainderParts) &&
                        attrVal === searchPath) {

                        if (insideRepeatScope) {
                            ownerElem = TP.nodeDetectAncestor(
                                ownerElem,
                                function(aNode) {
                                    return TP.isElement(aNode) &&
                                            TP.elementHasAttribute(
                                                    aNode, 'bind:repeat', true);
                                });

                            ownerTPElem = TP.wrap(ownerElem);
                        }

                        switch (pathAction) {

                            case TP.CREATE:
                            case TP.INSERT:

                                if (TP.notEmpty(updateIndexes)) {
                                    newRowElem =
                                        ownerTPElem.$insertRepeatRowAt(
                                                                updateIndexes,
                                                                branchVal);
                                    ownerTPElem.$refreshBranches(
                                        primarySource,
                                        'value',
                                        branchVal,
                                        ownerTPElem.$getBoundElements(),
                                        null,
                                        null,
                                        null,
                                        false,
                                        sigOrigin,
                                        true,
                                        ownerTPElem,
                                        null);

                                } else {

                                    ownerTPElem.empty();

                                    //  NB: This modifies the supplied
                                    //  'boundElems' Array to add the newly
                                    //  generated elements. They will be
                                    //  refreshed below.
                                    updateRepeatIndexes =
                                        !ownerTPElem.$regenerateRepeat(
                                                    branchVal, boundElems);
                                    //  If $regenerateRepeat returns false, then
                                    //  it didn't regenerate any chunks and,
                                    //  therefore, we need to manually update
                                    //  the repeat indexes.
                                    if (updateRepeatIndexes) {
                                        ownerTPElem.$updateRepeatRowIndices(
                                                        branchVal);
                                    }
                                }

                                needsRefresh = false;

                                break;

                            case TP.DELETE:

                                if (TP.notEmpty(updateIndexes)) {
                                    ownerTPElem.$deleteRepeatRowAt(
                                                            updateIndexes);
                                } else {
                                    ownerTPElem.empty();
                                }

                                needsRefresh = false;

                                break;

                            default:
                                break;
                        }

                        allRefreshedElements =
                            ownerTPElem.getDocument().get('$refreshedElements');
                        if (TP.notEmpty(allRefreshedElements)) {
                            ownerTPElem.$sendNativeRefreshEvent();
                        }
                    }

                    didProcess = true;

                    if (needsRefresh) {
                        ownerTPElem.$refreshBranches(
                                primarySource,
                                aFacet,
                                branchVal,
                                boundElems,
                                pathType,
                                remainderParts,
                                pathAction,
                                true,
                                sigOrigin,
                                originWasURI,
                                changeSource,
                                updateIndexes);
                    } else {
                        break;
                    }

                } else if (!isScopingElement && leafMatcher.test(attrVal)) {

                    //  If there is pseudo-JSON content in the attribute, that
                    //  means that a) the user might not just be binding to the
                    //  'value' aspect and b) there might be more than 1 aspect
                    //  binding defined.
                    if (/\{/g.test(attrVal)) {
                        //  Grab all of the binding values by parsing the
                        //  attribute value and making it into a Hash.
                        attrInfo = TP.json2js(TP.reformatJSToJSON(attrVal));

                        //  Select only those UI aspects that match the
                        //  leafMatcher (and therefore have a reference to the
                        //  updating model aspect)
                        /* eslint-disable no-loop-func */
                        updatedUIAspects = attrInfo.getKeys().select(
                            function(aKey) {
                                return leafMatcher.test(attrInfo.at(aKey));
                            });
                        /* eslint-enable no-loop-func */
                    } else {
                        //  Otherwise, we can just say that the 'value' aspect
                        //  is being updated.
                        updatedUIAspects = TP.ac('value');
                    }

                    repeatElem = TP.nodeDetectAncestor(
                            ownerElem,
                            function(aNode) {
                                var isRepeat;

                                isRepeat = TP.isElement(aNode) &&
                                            TP.elementHasAttribute(
                                                    aNode, 'bind:repeat', true);

                                return isRepeat;
                            });

                    inRepeatContext = TP.isElement(repeatElem);

                    repeatSource = null;
                    repeatIndex = NaN;

                    if (inRepeatContext) {
                        //  Grab the repeating information.
                        repeatInfo = this.$getRepeatSourceAndIndex(repeatElem);

                        if (TP.isValid(repeatInfo)) {
                            repeatSource = repeatInfo.first();
                            repeatIndex = repeatInfo.last();
                        }
                    }

                    ownerTPElem.$refreshLeaf(
                        aFacet,
                        theVal,
                        updatedUIAspects,
                        boundAttr,
                        aPathType,
                        changeSource,
                        repeatSource,
                        repeatIndex);

                    didProcess = true;
                }
            }

            //  If we didn't process at least once, and the last part of the
            //  path is a simple numeric path, and there is a value at the end
            //  of that path, then we may have an insertion.
            if (!didProcess &&
                TP.regex.SIMPLE_NUMERIC_PATH.test(lastPart) &&
                TP.isDefined(branchVal = TP.wrap(theVal).get(lastPart)) &&
                (pathAction === TP.CREATE || pathAction === TP.INSERT)) {

                if (TP.notEmpty(updateIndexes)) {
                    newRowElem = this.$insertRepeatRowAt(updateIndexes,
                                                            branchVal);

                    TP.wrap(newRowElem).refreshBoundDescendants();
                } else {

                    ownerTPElem.empty();

                    //  NB: This modifies the supplied 'boundElems' Array to add
                    //  the newly generated elements. They will be refreshed
                    //  below.
                    updateRepeatIndexes = !ownerTPElem.$regenerateRepeat(
                                                        branchVal, boundElems);

                    //  If $regenerateRepeat returns false, then it didn't
                    //  regenerate any chunks and, therefore, we need to
                    //  manually update the repeat indexes.
                    if (updateRepeatIndexes) {
                        ownerTPElem.$updateRepeatRowIndices(branchVal);
                    }

                    TP.wrap(ownerTPElem).refreshBoundDescendants();
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

TP.dom.ElementNode.Inst.defineMethod('$refreshLeaf',
function(aFacet, initialVal, updatedAspects, bindingAttr, aPathType, changeSource, repeatSource, repeatIndex) {

    /**
     * @method $refreshLeaf
     * @summary Refreshes any data bindings occurring as a 'leaf' (i.e. a
     *     scalar displayed value) under the receiver.
     * @param {String} [aFacet=value] The facet of the binding expressions that
     *     we're refreshing. This defaults to 'value' which is the 99% case.
     * @param {Object} initialVal The initial value to use to update the
     *     binding. This could be mutated inside of this method to a final,
     *     massaged, value.
     * @param {Array|TP.ALL} updatedAspects An Array of the aspects of the data
     *     model that are being updated or TP.ALL, to indicate that all of them
     *     are.
     * @param {AttributeNode} bindingAttr The attribute node containing the
     *     binding expression.
     * @param {Number} aPathType The path type that is contained in the
     *     binding expression.
     * @param {Object} changeSource The source of the change. If a signal
     *     initiated the refreshing process, this will be the signal's 'source'.
     * @param {Object} repeatSource The 'whole source' of the repeat, if the
     *     receiver is inside of a repeat context.
     * @param {Number} repeatIndex The index of the nearest scope within the
     *     nearest repeat if the receiver is inside of a repeat context.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var bindingInfo,

        didRefresh;

    //  Extract the binding information from the supplied binding information
    //  value String. This may have already been parsed and cached, in which
    //  case we get the cached values back.
    bindingInfo = this.getBindingInfoFrom(bindingAttr.name, bindingAttr.value);

    didRefresh = false;

    //  Iterate over each binding expression in the binding information.
    bindingInfo.perform(
        function(bindEntry) {

            var aspectName,
                bindVal,

                dataExprs,
                transformFunc,

                refreshedEntry;

            aspectName = bindEntry.first();
            bindVal = bindEntry.last();

            //  There will be 1...n data expressions here.
            dataExprs = bindVal.at('dataExprs');

            //  If a transformation function was computed from the expression,
            //  it will be here.
            transformFunc = bindVal.at('transformFunc');

            //  Set our final value for the current binding expresssion. This
            //  will return whether or not setting this value will have changed
            //  one or more of the values of the observers.
            refreshedEntry = this.$setFinalValue(
                                    aspectName,
                                    dataExprs,
                                    initialVal,
                                    updatedAspects,
                                    aFacet,
                                    transformFunc,
                                    aPathType,
                                    changeSource,
                                    repeatSource,
                                    repeatIndex);

            //  If at least one returned true, then flip the flag to true. Note
            //  that this is constructed such that, once the flag is flipped to
            //  true, it cannot be changed back.
            if (refreshedEntry) {
                didRefresh = refreshedEntry;
            }
        }.bind(this));

    return didRefresh;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$normalizeRepeatValue',
function(aRepeatValue) {

    /**
     * @method $normalizeRepeatValue
     * @summary Normalizes the supplied value into something that can be
     *     iterated over by a 'bind:repeat'. This is usually an Array.
     * @param {Object} aRepeatValue The value to normalize.
     * @returns {Object[]} An Array of objects that a bind:repeat can iterate
     *     over.
     */

    var repeatVal;

    repeatVal = aRepeatValue;

    //  If repeatVal is a POJO, make it into a TP.core.Hash.
    if (TP.isPlainObject(repeatVal)) {
        repeatVal = TP.hc(repeatVal);
    }

    //  Make sure that repeatVal is a collection.
    if (TP.isCollection(repeatVal)) {

        //  If repeatResult is a TP.core.Hash, then convert it
        //  into an Array of key/value pairs. Binding repeats
        //  need a collection they can index numerically.
        if (TP.isHash(repeatVal)) {
            repeatVal = repeatVal.getKVPairs();
        }

        //  If the repeatVal isn't an Array, then make it be the
        //  single item in an Array.
        if (!TP.isArray(repeatVal)) {
            repeatVal = TP.ac(repeatVal);
        }
    }

    return repeatVal;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$refreshRepeatData',
function(regenerateIfNecessary) {

    /**
     * @method $refreshRepeatData
     * @summary Refresh (and possibly regenerate) the data that is shown if the
     *     receiver contains a 'bind:repeat' attribute.
     * @param {Boolean} [regenerateIfNecessary=false] Whether or not to
     *     regenerate the UI chunks necessary to display the repeat. This is
     *     false by default because regeneration is performance intensive.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var scopeVals,

        lastExpr,
        sigilIndex,
        formatExpr,
        uriValueExpr,

        repeatFullExpr,

        repeatURI,
        repeatWholeURI,

        repeatWholeResult,
        repeatResult,

        repeatResultSize,

        regenerateFunc,

        allRefreshedElements,

        templatedAttrs,

        elem,
        tpDoc,

        isXMLResource,

        templatedElems,
        repeatIndex,
        repeatSize,

        groupingSize,
        repeatResultSlice,

        remainderTPElems,

        last,

        templateRefreshedElems,

        existingValueRefreshedElems,

        remainderAttrs;

    //  Grab our binding scoping values and compute a 'binding repeat'
    //  expression from them and any local value on us. Note here how we both
    //  ignore the cache and do *not* cache these values on the receiver.
    scopeVals = this.getBindingScopeValues(false, true, false);

    //  Grab the last of the scope values and see if it contains a formatting
    //  expression. If so, slice it off and copy & alter the scope values array
    //  to contain a last segment with no formatting expression. Retain the
    //  formatting expression for later use in this method.
    lastExpr = scopeVals.last();

    if (TP.regex.ACP_FORMAT.test(lastExpr)) {
        sigilIndex = lastExpr.indexOf('.%');

        formatExpr = lastExpr.slice(sigilIndex + 2).trim();
        uriValueExpr = lastExpr.slice(0, sigilIndex).trim();

        scopeVals = TP.copy(scopeVals);

        scopeVals.pop();
        scopeVals.push(uriValueExpr);
    }

    repeatFullExpr = TP.uriJoinFragments.apply(TP, scopeVals);

    //  Grab both the URI that is computed from our binding expression and it's
    //  'whole source' (i.e. the root collection that contains our bound data).
    repeatURI = TP.uc(repeatFullExpr);
    repeatWholeURI = repeatURI.getPrimaryURI();

    //  Grab the results of both URIs.

    //  NB: Note how we do *not* want the getResource() call to collapse
    //  it's results here - we always want a collection.
    repeatResult = repeatURI.getResource(
                    TP.request('shouldCollapse', false)).get('result');
    repeatWholeResult = repeatWholeURI.getResource(
                    TP.request('shouldCollapse', false)).get('result');

    if (TP.notValid(repeatResult)) {
        return this;
    }

    //  If we successfully extracted a formatting expression, use it here.
    if (TP.isValid(formatExpr)) {
        if (!TP.regex.SIMPLE_NUMERIC_PATH.test(repeatFullExpr)) {
            repeatResult = TP.collapse(repeatResult);
        }

        if (TP.isPlainObject(repeatResult)) {
            repeatResult = TP.hc(repeatResult);
        }

        repeatResult = TP.format(repeatResult, formatExpr);
    }

    //  Normalize the value for repeat purposes (we're interested in an Array of
    //  key,value pairs).
    repeatResult = this.$normalizeRepeatValue(repeatResult);
    repeatResultSize = repeatResult.getSize();

    regenerateFunc = function(shouldRegenerate) {
        var alreadySignaled,
            boundElems;

        //  Whether or not we signaled 'TP.sig.DidRenderData'.
        alreadySignaled = false;

        //  If this flag is true, then go ahead and regenerate (if necessary).
        //  Note how we pass any empty Array in here, since we're not adding or
        //  removing rows that need to be recursively processed at this time.
        if (TP.isTrue(shouldRegenerate)) {
            this.$regenerateRepeat(repeatResult, TP.ac());

            //  $regenerateRepeat signals 'TP.sig.DidRenderData'.
            alreadySignaled = true;
        }

        //  Grab any bound elements and refresh their values.

        boundElems = this.$getBoundElements();

        if (TP.notEmpty(boundElems)) {
            this.$refreshBranches(
                    repeatWholeResult,
                    'value',
                    repeatResult,
                    boundElems,
                    null,
                    null,
                    null,
                    false,
                    repeatWholeURI,
                    true,
                    this,
                    null);
        }

        //  If we haven't already signaled TP.sig.DidRenderData, do so now.
        if (!alreadySignaled) {
            this.signal('TP.sig.DidRenderData');
        }
    }.bind(this);

    //  Make sure that repeatResult is a collection.
    if (TP.isCollection(repeatResult)) {

        //  Grab the hash of refreshed elements. This will be updated by the
        //  binding machinery if there are bound elements to be refreshed.
        allRefreshedElements = this.getDocument().get('$refreshedElements');

        //  Call upon the regeneration function, which will regenerate the
        //  repeat (and update from bindings) if necessary.
        regenerateFunc(regenerateIfNecessary);

        //  If we didn't regenerate, then we need to see if we should update
        //  from templates.
        if (TP.notTrue(regenerateIfNecessary)) {

            isXMLResource = TP.isXMLNode(TP.unwrap(repeatResult.first()));

            //  Grab the repeat index. If one isn't available, we just use
            //  either 0 or 1, depending on whether we're dealing with an XML
            //  resource or not.
            repeatIndex = this.getAttribute('bind:repeatindex');
            if (!TP.isNumber(repeatIndex)) {
                if (isXMLResource) {
                    repeatIndex = 1;
                } else {
                    repeatIndex = 0;
                }
            }

            elem = this.getNativeNode();

            tpDoc = this.getDocument();

            //  Grab any templated elements and refresh their values.

            templatedElems =
                TP.byCSSPath('*[tibet|templateexpr]',
                                elem,
                                false,
                                true);

            if (TP.notEmpty(templatedElems)) {

                //  Grab the repeat size. If one isn't available, just use the
                //  whole size of the group.
                repeatSize = this.getAttribute('bind:repeatsize');
                if (!TP.isNumber(repeatSize)) {
                    repeatSize =
                        (repeatResultSize / templatedElems.getSize()).floor();
                }

                //  If the number of templated elements doesn't evenly divide
                //  into the repeatSize, then we need to regenerate the repeat.
                if (templatedElems.getSize() % repeatSize > 0) {
                    //  Call upon the regeneration function, which will
                    //  regenerate the repeat (and update from bindings) if
                    //  necessary.
                    regenerateFunc(true);

                    return this;
                }

                //  We have the total number of templated elements. We now need
                //  to compute how many are in each 'group' by dividing that
                //  into the size of the repeat result.
                groupingSize =
                    (templatedElems.getSize() / repeatSize).floor();

                groupingSize = groupingSize.max(1);

                //  Slice off the chunk of the repeat result that corresponds to
                //  the initial repeat index and size.
                repeatResultSlice = repeatResult.slice(
                                            repeatIndex,
                                            repeatIndex + repeatSize);

                //  Whatever is left over of the templated elements are ones
                //  that we need to set to blank.
                remainderTPElems = templatedElems.slice(
                                    groupingSize * repeatResultSlice.getSize());

                if (isXMLResource) {
                    last = repeatIndex + repeatSize;
                } else {
                    last = repeatIndex + repeatSize - 1;
                }

                //  Use this Array to keep track of the elements that we refresh
                //  using the templating machinery below.
                templateRefreshedElems = TP.ac();

                repeatResultSlice.forEach(
                    function(aData, scopeIndex) {
                        var startIndex,
                            endIndex,
                            firstTemplatedElem,
                            nearestScopeElem,
                            nearestScopeTPElem,
                            dataIndex,
                            i,
                            templatedElem,
                            info,
                            template,
                            val;

                        //  Set the starting index to the current scope index
                        //  times the number of elements in each group and the
                        //  end index to that plus the number of elements in
                        //  each group.
                        startIndex = scopeIndex * groupingSize;
                        endIndex = startIndex + groupingSize;

                        firstTemplatedElem =
                                templatedElems.at(startIndex).getNativeNode();

                        if (TP.elementHasAttribute(
                                    firstTemplatedElem, 'bind:scope', true)) {
                            nearestScopeElem = firstTemplatedElem;
                        } else {
                            //  Grab the nearest ancestor to the first templated
                            //  element in this group that has a scope.
                            nearestScopeElem =
                                TP.nodeDetectAncestorMatchingCSS(
                                    firstTemplatedElem,
                                    '*[bind|scope]',
                                    elem);
                        }

                        nearestScopeTPElem = TP.wrap(nearestScopeElem);

                        dataIndex = scopeIndex + repeatIndex;

                        for (i = startIndex; i < endIndex; i++) {

                            templatedElem = templatedElems.at(i);

                            if (isXMLResource) {
                                info = TP.hc(
                                        '$REQUEST', null,
                                        'TP', TP,
                                        'APP', APP,
                                        '$SOURCE', this,
                                        '$TAG', nearestScopeTPElem,
                                        '$TARGET', tpDoc,
                                        '$_', aData,
                                        '$INPUT', repeatResultSlice,
                                        '$INDEX', dataIndex,
                                        '$FIRST', dataIndex === 1,
                                        '$MIDDLE',
                                            dataIndex > 1 && dataIndex < last,
                                        '$LAST', dataIndex !== last,
                                        '$EVEN', dataIndex % 2 === 0,
                                        '$ODD', dataIndex % 2 !== 0,
                                        '$#', dataIndex);
                            } else {
                                info = TP.hc(
                                        '$REQUEST', null,
                                        'TP', TP,
                                        'APP', APP,
                                        '$SOURCE', this,
                                        '$TAG', nearestScopeTPElem,
                                        '$TARGET', tpDoc,
                                        '$_', aData,
                                        '$INPUT', repeatResultSlice,
                                        '$INDEX', dataIndex,
                                        '$FIRST', dataIndex === 0,
                                        '$MIDDLE',
                                            dataIndex > 0 && dataIndex < last,
                                        '$LAST', dataIndex !== last,
                                        '$EVEN', dataIndex % 2 === 0,
                                        '$ODD', dataIndex % 2 !== 0,
                                        '$#', dataIndex);
                            }

                            //  Grab the templating expression and wrap it in
                            //  ACP brackets. This allows the transform
                            //  machinery to treat it properly.
                            template = templatedElem.getAttribute(
                                                        'tibet:templateexpr');
                            template = '{{' + template + '}}';

                            //  Run the the transform machinery and use the
                            //  value it produces to set the 'value' of the
                            //  templated element.
                            val = template.transform(null, info);
                            templatedElems.at(i).set('value', val);

                            //  Add this to the list of elements that the
                            //  templating machinery refreshed.
                            templateRefreshedElems.push(
                                    templatedElem.getNativeNode());
                        }
                    }.bind(this));

                //  If there are remainder elements, they need to be set to
                //  blank and then added to the list of elements that the
                //  templating machinery refreshed.
                if (TP.notEmpty(remainderTPElems)) {
                    remainderTPElems.forEach(
                        function(aTPElem) {
                            aTPElem.setTextContent('');
                            templateRefreshedElems.push(
                                            aTPElem.getNativeNode());
                        });
                }

                //  If there were already refreshed elements because of the
                //  binding update machinery, just go into that hash under the
                //  'value__value' entry and add to it.
                if (TP.notEmpty(allRefreshedElements)) {
                    existingValueRefreshedElems =
                        allRefreshedElements.at('value__value');
                    existingValueRefreshedElems =
                        existingValueRefreshedElems.concat(
                                                    templateRefreshedElems);
                    allRefreshedElements.atPut(
                        'value__value', existingValueRefreshedElems);
                } else {
                    //  Otherwise, make a 'value__value' entry from the elements
                    //  that we refreshed from templates.
                    allRefreshedElements = TP.hc('value__value',
                                                    templateRefreshedElems);
                }
            }

            templatedAttrs =
                TP.byPath('.//*/@*' +
                    '[contains(., "' + TP.ACP_ENCODED_BEGIN + '") and ' +
                    'namespace-uri() != "' + TP.w3.Xmlns.BIND + '"]',
                            elem,
                            false,
                            false);

            if (TP.notEmpty(templatedAttrs)) {

                //  Grab the repeat size. If one isn't available, just use the
                //  whole size of the group.
                repeatSize = this.getAttribute('bind:repeatsize');
                if (!TP.isNumber(repeatSize)) {
                    repeatSize =
                        (repeatResultSize / templatedAttrs.getSize()).floor();
                }

                //  If the number of templated elements doesn't evenly divide
                //  into the repeatSize, then we need to regenerate the repeat.
                if (templatedAttrs.getSize() % repeatSize > 0) {
                    //  Call upon the regeneration function, which will
                    //  regenerate the repeat (and update from bindings) if
                    //  necessary.
                    regenerateFunc(true);

                    return this;
                }

                //  We have the total number of templated elements. We now need
                //  to compute how many are in each 'group' by dividing that
                //  into the size of the repeat result.
                groupingSize =
                    (templatedAttrs.getSize() / repeatSize).floor();

                groupingSize = groupingSize.max(1);

                //  Slice off the chunk of the repeat result that corresponds to
                //  the initial repeat index and size.
                repeatResultSlice = repeatResult.slice(
                                            repeatIndex,
                                            repeatIndex + repeatSize);

                //  Whatever is left over of the templated elements are ones
                //  that we need to set to blank.
                remainderAttrs = templatedAttrs.slice(
                                    groupingSize * repeatResultSlice.getSize());

                if (isXMLResource) {
                    last = repeatIndex + repeatSize;
                } else {
                    last = repeatIndex + repeatSize - 1;
                }

                //  Use this Array to keep track of the elements that we refresh
                //  using the templating machinery below.
                templateRefreshedElems = TP.ac();

                repeatResultSlice.forEach(
                    function(aData, scopeIndex) {
                        var startIndex,
                            endIndex,
                            ownerElem,
                            nearestScopeElem,
                            nearestScopeTPElem,
                            dataIndex,
                            i,
                            templatedAttr,
                            info,
                            jsonStr,
                            attrData;

                        //  Set the starting index to the current scope index
                        //  times the number of elements in each group and the
                        //  end index to that plus the number of elements in
                        //  each group.
                        startIndex = scopeIndex * groupingSize;
                        endIndex = startIndex + groupingSize;

                        ownerElem = templatedAttrs.at(startIndex).ownerElement;

                        if (TP.elementHasAttribute(
                                            ownerElem, 'bind:scope', true)) {
                            nearestScopeElem = ownerElem;
                        } else {
                            //  Grab the nearest ancestor to the first templated
                            //  element in this group that has a scope.
                            nearestScopeElem =
                                TP.nodeDetectAncestorMatchingCSS(
                                    templatedAttrs.at(startIndex).ownerElement,
                                    '*[bind|scope]',
                                    elem);
                        }

                        nearestScopeTPElem = TP.wrap(nearestScopeElem);

                        dataIndex = scopeIndex + repeatIndex;

                        for (i = startIndex; i < endIndex; i++) {

                            templatedAttr = templatedAttrs.at(i);

                            if (isXMLResource) {
                                info = TP.hc(
                                        '$REQUEST', null,
                                        'TP', TP,
                                        'APP', APP,
                                        '$SOURCE', this,
                                        '$TAG', nearestScopeTPElem,
                                        '$TARGET', tpDoc,
                                        '$_', aData,
                                        '$INPUT', repeatResultSlice,
                                        '$INDEX', dataIndex,
                                        '$FIRST', dataIndex === 1,
                                        '$MIDDLE',
                                            dataIndex > 1 && dataIndex < last,
                                        '$LAST', dataIndex !== last,
                                        '$EVEN', dataIndex % 2 === 0,
                                        '$ODD', dataIndex % 2 !== 0,
                                        '$#', dataIndex);
                            } else {
                                info = TP.hc(
                                        '$REQUEST', null,
                                        'TP', TP,
                                        'APP', APP,
                                        '$SOURCE', this,
                                        '$TAG', nearestScopeTPElem,
                                        '$TARGET', tpDoc,
                                        '$_', aData,
                                        '$INPUT', repeatResultSlice,
                                        '$INDEX', dataIndex,
                                        '$FIRST', dataIndex === 0,
                                        '$MIDDLE',
                                            dataIndex > 0 && dataIndex < last,
                                        '$LAST', dataIndex !== last,
                                        '$EVEN', dataIndex % 2 === 0,
                                        '$ODD', dataIndex % 2 !== 0,
                                        '$#', dataIndex);
                            }

                            jsonStr = TP.reformatJSToJSON(
                                        templatedAttr.nodeValue);

                            attrData = TP.json2js(jsonStr);

                            /* eslint-disable no-loop-func */
                            attrData.perform(
                                function(kvPair) {
                                    var attrName,
                                        attrVal,

                                        val;

                                    attrName = kvPair.first();
                                    attrVal = kvPair.last();

                                    attrVal = attrVal.unquoted('"');

                                    attrVal = attrVal.replace(
                                                TP.regex.ACP_ENCODED_BEGIN,
                                                TP.ACP_BEGIN);
                                    attrVal = attrVal.replace(
                                                TP.regex.ACP_ENCODED_END,
                                                TP.ACP_END);

                                    val = attrVal.transform(null, info);

                                    TP.elementSetAttribute(ownerElem,
                                                            attrName,
                                                            val,
                                                            true);
                                });
                            /* eslint-enable no-loop-func */

                            //  Add this to the list of elements that the
                            //  templating machinery refreshed.
                            templateRefreshedElems.push(
                                    templatedAttr.ownerElement);
                        }
                    }.bind(this));

                //  If there are remainder elements, they need to be set to
                //  blank and then added to the list of elements that the
                //  templating machinery refreshed.
                if (TP.notEmpty(remainderAttrs)) {
                    remainderAttrs.forEach(
                        function(anAttr) {
                            var jsonStr,
                                attrData;

                            jsonStr = TP.reformatJSToJSON(anAttr.nodeValue);

                            attrData = TP.json2js(jsonStr);

                            attrData.perform(
                                function(kvPair) {
                                    var attrName;

                                    attrName = kvPair.first();

                                    TP.elementRemoveAttribute(
                                                anAttr.ownerElement,
                                                attrName,
                                                true);
                                });

                            templateRefreshedElems.push(
                                            anAttr.ownerElement);
                        });
                }

                //  If there were already refreshed elements because of the
                //  binding update machinery, just go into that hash under the
                //  'value__value' entry and add to it.
                if (TP.notEmpty(allRefreshedElements)) {
                    existingValueRefreshedElems =
                        allRefreshedElements.at('value__value');
                    existingValueRefreshedElems =
                        existingValueRefreshedElems.concat(
                                                    templateRefreshedElems);
                    allRefreshedElements.atPut(
                        'value__value', existingValueRefreshedElems);
                } else {
                    //  Otherwise, make a 'value__value' entry from the elements
                    //  that we refreshed from templates.
                    allRefreshedElements = TP.hc('value__value',
                                                    templateRefreshedElems);
                }
            }
        }

        //  Send a custom DOM-level event to allow 3rd party libraries to know
        //  that the bindings have been refreshed.
        if (TP.notEmpty(allRefreshedElements)) {
            this.$sendNativeRefreshEvent();
        }

        this.signal('TP.sig.DidRenderData');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$regenerateRepeat',
function(aCollection, elems) {

    /**
     * @method $regenerateRepeat
     * @summary Regenerates any repeat content under the receiver, if the
     *     receiver is configured to have 'repeating content'.
     * @param {Object} aCollection The collection data model that will be used
     *     for the repeating content. Note that this method merely generates the
     *     blank repeating rows - it is up to other methods to refresh the data
     *     bindings within them.
     * @param {Element[]} elems The list of elements that the bind engine is
     *     currently processing, of which is this an element. We will splice any
     *     new content that this method generates into this collection so that
     *     the engine will recursively process into this new content.
     * @returns {Boolean} Whether or not new items were actually generated.
     */

    var repeatContent,

        resourceLength,

        elem,
        allRepeatChunks,

        existingChunkCount,

        repeatSize,
        endIndex,

        doc,

        bodyFragment,

        isXMLResource,

        str,
        last,
        info,
        result,

        startIndex,

        tpDoc,

        scopeIndex,

        i,

        newElement,
        newTPElem,

        newElems,
        elemIndex,
        args,

        overflow,
        remainderSize,
        remainderTextNodes,

        descendants,

        evt;

    if (TP.notValid(aCollection)) {
        //  TODO: Raise an exception
        return false;
    }

    if (TP.notValid(repeatContent = this.$getRepeatTemplate())) {
        //  TODO: Raise an exception
        return false;
    }

    resourceLength = aCollection.getSize();

    elem = this.getNativeNode();

    //  Find all of the existing *direct children* bound rows under us that have
    //  a 'bind:scope' that starts with a '[' and ends with a ']'.
    allRepeatChunks = TP.byCSSPath(
                        '> *[bind|scope^="["][bind|scope$="]"]',
                        elem,
                        false,
                        false);

    existingChunkCount = allRepeatChunks.getSize();

    //  If we have a 'bind:repeatindex', then we can compute a starting index
    //  from it.
    if (this.hasAttribute('bind:repeatindex')) {
        if (!TP.isNumber(startIndex =
                            this.getAttribute('bind:repeatindex').asNumber())) {
            startIndex = 0;
        }
    } else {
        startIndex = 0;
    }

    //  If we have a 'bind:repeatsize', then we can compute how many rows we
    //  should be displaying.
    if (this.hasAttribute('bind:repeatsize')) {

        //  If we have a 'bind:repeatsize', then we can compute an ending index
        //  from that and the startIndex
        if (TP.isNumber(repeatSize =
                        this.getAttribute('bind:repeatsize').asNumber())) {
            endIndex = startIndex + repeatSize;
        } else {
            endIndex = resourceLength - startIndex;
        }
    } else {
        endIndex = resourceLength;
    }

    //  If the repeat content's child element list has a size of 1, then we
    //  reach under there and use that element as the repeat content
    if (TP.nodeGetChildElements(repeatContent).getSize() === 1) {
        repeatContent = repeatContent.firstElementChild;
    }

    //  Get the String representation of the repeat content. We'll use this
    //  later to check for ACP expressions.
    str = TP.str(repeatContent);

    //  Use either the resource length or the paging size, whichever is smaller.
    endIndex = endIndex.min(resourceLength);

    //  If we have already generated chunks and the count of those generated
    //  items is the same as the chunks we're going to produce, then we don't
    //  need to regenerate so we can just exit here.
    if (existingChunkCount === endIndex - startIndex &&
        !TP.regex.HAS_ACP.test(str)) {

        //  Clear any repeat source or repeat index on any descendant elements.
        //  Just because we're reusing the chunk doesn't mean that we're using
        //  the same data source (or want whatever the index was set to last).
        TP.nodeGetDescendantElements(elem).forEach(
            function(anElem) {
                anElem[TP.REPEAT_SOURCE] = null;
                anElem[TP.REPEAT_INDEX] = null;
            });

        return false;
    }

    tpDoc = this.getDocument();
    doc = tpDoc.getNativeNode();

    bodyFragment = doc.createDocumentFragment();

    //  Detect whether we're drawing GUI for model which is a chunk of XML data
    //  - we'll use this information later.
    isXMLResource = TP.isXMLNode(TP.unwrap(aCollection.first()));

    for (i = startIndex; i < endIndex; i++) {

        //  Make sure to clone the content.
        newElement = TP.nodeCloneNode(repeatContent);
        newTPElem = TP.wrap(newElement);

        //  If this is an XML resource, then we need to bump the number by 1
        //  because XPath is 1-based.
        if (isXMLResource) {
            scopeIndex = i + 1;
        } else {
            scopeIndex = i;
        }

        if (TP.regex.HAS_ACP.test(str)) {
            if (isXMLResource) {

                last = aCollection.getSize();

                info = TP.hc(
                        '$REQUEST', null,
                        'TP', TP,
                        'APP', APP,
                        '$SOURCE', this,
                        '$TAG', newTPElem,
                        '$TARGET', tpDoc,
                        '$_', aCollection.at(scopeIndex),
                        '$INPUT', aCollection,
                        '$INDEX', scopeIndex,
                        '$FIRST', scopeIndex === 1,
                        '$MIDDLE', scopeIndex > 1 && scopeIndex < last,
                        '$LAST', scopeIndex !== last,
                        '$EVEN', scopeIndex % 2 === 0,
                        '$ODD', scopeIndex % 2 !== 0,
                        '$#', scopeIndex);
            } else {

                last = aCollection.getSize() - 1;

                info = TP.hc(
                        '$REQUEST', null,
                        'TP', TP,
                        'APP', APP,
                        '$SOURCE', this,
                        '$TAG', newTPElem,
                        '$TARGET', tpDoc,
                        '$_', aCollection.at(scopeIndex),
                        '$INPUT', aCollection,
                        '$INDEX', scopeIndex,
                        '$FIRST', scopeIndex === 0,
                        '$MIDDLE', scopeIndex > 0 && scopeIndex < last,
                        '$LAST', scopeIndex !== last,
                        '$EVEN', scopeIndex % 2 === 0,
                        '$ODD', scopeIndex % 2 !== 0,
                        '$#', scopeIndex);
            }

            result = str.transform(null, info);
            newElement = TP.elem(result);
        }

        //  Stamp a 'bind:scope' with an attribute containing the numeric
        //  scoping index (i.e. '[2]'). This will be used in bind scoping
        //  computations.
        TP.elementSetAttribute(newElement,
                                'bind:scope',
                                '[' + scopeIndex + ']',
                                true);

        //  Cache the repeating source and index on the element for much better
        //  bind:repeat performance
        newElement[TP.REPEAT_SOURCE] = aCollection;
        newElement[TP.REPEAT_INDEX] = scopeIndex;

        //  Append this new chunk of markup to the document fragment we're
        //  building up and then loop to the top to do it again.
        bodyFragment.appendChild(newElement);
    }

    //  If we have a real repeatSize, then see if there are remainder (i.e.
    //  blank) rows that need to be generated.
    if (TP.isNumber(repeatSize)) {

        overflow = endIndex % repeatSize;

        if (overflow > 0) {

            remainderSize = repeatSize - overflow;

            //  Iterate over the number of remaining rows, clone the content and
            //  blank all of the Text node (but only if they contain
            //  non-whitespace content).
            for (i = 0; i < remainderSize; i++) {

                //  Make sure to clone the content.
                newElement = TP.nodeCloneNode(repeatContent);

                remainderTextNodes = TP.elementGetTextNodesMatching(
                                        newElement, TP.RETURN_TRUE);
                remainderTextNodes.forEach(
                    function(aTextNode) {
                        if (!TP.regex.ONLY_WHITESPACE.test(
                                            aTextNode.nodeValue)) {
                            TP.nodeSetTextContent(aTextNode, '');
                        }
                    });

                //  If this is an XML resource, then we need to bump the number
                //  by 1 because XPath is 1-based.
                if (isXMLResource) {
                    scopeIndex = endIndex + i + 1;
                } else {
                    scopeIndex = endIndex + i;
                }

                //  Stamp a 'bind:scope' with an attribute containing the
                //  numeric scoping index (i.e. '[2]'). This will be used in
                //  bind scoping computations.
                TP.elementSetAttribute(newElement,
                                        'bind:scope',
                                        '[' + scopeIndex + ']',
                                        true);

                //  Cache the repeating source and index on the element for much
                //  better bind:repeat performance
                newElement[TP.REPEAT_SOURCE] = aCollection;
                newElement[TP.REPEAT_INDEX] = scopeIndex;

                //  Append this new chunk of markup to the document fragment
                //  we're building up and then loop to the top to do it again.
                bodyFragment.appendChild(newElement);
            }
        }
    }

    //  Put an attribute on ourself that will prevent Mutation signals from
    //  being sent from content under us. This also marks us as the 'repeating
    //  body' (i.e. the element containing the repeating content).
    TP.elementSetAttribute(elem, 'tibet:no-mutations', true, true);

    //  Grab all of the descendants under ourself.
    descendants = TP.nodeGetDescendants(elem);

    //  Make sure to empty the repeat element of any existing content. Note that
    //  we do this *before* sending the event in order to be consistent with
    //  when this event is sent from the MutationObserver machinery.
    TP.nodeEmptyContent(elem);

    //  Send a custom DOM-level event to allow 3rd party libraries to know that
    //  content has been removed.

    evt = doc.createEvent('Event');
    evt.initEvent('TIBETContentRemoved', true, true);
    evt.data = descendants;

    elem.dispatchEvent(evt);

    //  Finally, append the whole fragment under the receiver element
    TP.nodeAppendChild(elem, bodyFragment, false);

    //  Awaken any content that has been inserted under this element. We have to
    //  do this manually, since we turned off mutation tracking for this element
    //  above.
    TP.nodeAwakenContent(elem);

    //  Bubble any xmlns attributes that are found on descendants upward to
    //  avoid markup clutter.
    TP.elementBubbleXMLNSAttributesOnDescendants(elem);

    //  Grab any bound elements under this element. We will need to splice them
    //  into the list of elements that the engine is processing, of which we are
    //  one. This ensures that any nested binding constructs (i.e. nested
    //  repeats, for instance) are recursively processed.
    newElems = this.$getBoundElements(false);

    //  Splice the new elements just after our spot in the list of elements that
    //  the engine is currently processing.
    elemIndex = elems.indexOf(elem);
    args = TP.ac(elemIndex + 1, 0).concat(newElems);
    Array.prototype.splice.apply(elems, args);

    //  Send a custom DOM-level event to allow 3rd party libraries to know that
    //  content has been added.

    //  Grab all of the descendants under ourself.
    descendants = TP.nodeGetDescendants(elem);

    evt = doc.createEvent('Event');
    evt.initEvent('TIBETContentAdded', true, true);
    evt.data = descendants;

    elem.dispatchEvent(evt);

    this.signal('TP.sig.DidRenderData');

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$registerRepeatContent',
function() {

    /**
     * @method $registerRepeatContent
     * @summary Registers the content under the receiver as repeat content with
     *     the receiver's TP.dom.Document for iteration purposes.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,
        doc,

        nestedRepeatElems,
        nestedRepeatTPElems,

        i,

        repeatContent,

        elemsWithIDs,
        len,
        j,
        elemWithID,

        attrVal,

        repeatItems,

        templateID,
        templateInfo;

    elem = this.getNativeNode();

    //  If this attribute is present, then we've already register - just bail
    //  out.
    if (TP.elementHasAttribute(elem, 'tibet:templateid', true)) {
        return this;
    }

    doc = TP.nodeGetDocument(elem);

    //  Cause any repeats that haven't registered their content to grab it
    //  before we start other processing.
    //  To do this, we need any repeats that are under us (but only the ones
    //  under us, which is we need to use the filter here).
    nestedRepeatElems =
            TP.ac(doc.documentElement.querySelectorAll('*[*|repeat]'));
    nestedRepeatElems = nestedRepeatElems.filter(
                    function(anElem) {
                        return elem !== anElem && elem.contains(anElem);
                    });

    //  To avoid mutation events as register the repeat content will cause DOM
    //  modifications, we wrap all of the found 'bind:repeat' Elements at once
    //  here.
    nestedRepeatTPElems = TP.wrap(nestedRepeatElems);

    for (i = 0; i < nestedRepeatTPElems.getSize(); i++) {
        nestedRepeatTPElems.at(i).$registerRepeatContent();
    }

    //  Append a 'wrap element' as the container of the repeat content. This is
    //  especially useful if the repeat content has no root element itself and
    //  therefore we would end up with 1...n sibling nodes, which are harder to
    //  manage.
    repeatContent = TP.documentConstructElement(this.getNativeDocument(),
                                                'span',
                                                TP.w3.Xmlns.XHTML);

    //  Add a class of 'item' for easier managability.
    TP.elementAddClass(repeatContent, 'item');

    //  Strip out all 'id's on elements... if an Element has an ID, warn here.
    elemsWithIDs = TP.byCSSPath(' *[id]', elem, false, false);

    //  Loop over any elements that were found with IDs.
    len = elemsWithIDs.getSize();
    for (j = 0; j < len; j++) {

        elemWithID = elemsWithIDs.at(j);

        attrVal = TP.elementGetAttribute(elemWithID, 'id', true);

        if (!TP.regex.HAS_ACP.test(attrVal) &&
            !TP.elementHasGeneratedID(elemWithID)) {
            TP.ifWarn() ?
                TP.warn('Stripping ID from Element in repeat template: ' +
                        TP.str(elemWithID) + '. ' +
                        'IDs are supposed to be unique in markup.') : 0;
            TP.elementRemoveAttribute(elemWithID, 'id', true);
        }
    }

    //  Grab the childNodes of the receiver as a DocumentFragment.
    //  NOTE: This *removes* these child nodes from the receiver.
    repeatItems = TP.nodeListAsFragment(elem.childNodes);

    //  Append that DocumentFragment into our repeat content container.
    TP.nodeAppendChild(repeatContent, repeatItems, false);

    //  Generate a unique ID for our repeat content. We'll use this to register
    //  the repeat content with our TP.dom.DocumentNode.
    templateID = TP.genID('bind_repeat_template');

    //  Create a registry on our TP.dom.DocumentNode for repeat content if it's
    //  not already there.
    if (TP.notValid(
            templateInfo = this.getDocument().get('$repeatTemplates'))) {
        templateInfo = TP.hc();
        this.getDocument().set('$repeatTemplates', templateInfo);
    }

    //  Register our repeat content under the unique ID we generated.
    templateInfo.atPut(templateID, repeatContent);
    TP.elementSetAttribute(elem, 'tibet:templateid', templateID, true);

    return repeatContent;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$sendNativeRefreshEvent',
function() {

    /**
     * @method $sendNativeRefreshEvent
     * @summary Sends a native custom browser event ('TIBETBindingsRefreshed')
     *     with the elements that have been refreshed by the binding system
     *     This allow third party libraries to know when data changes have been
     *     in the TIBET system.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var allRefreshedElements,

        allContainedElements,

        notContainedElementInfo,

        evt;

    //  Send a custom DOM-level event to allow 3rd party libraries to know that
    //  the bindings have been refreshed.

    allRefreshedElements = this.getDocument().get('$refreshedElements');
    if (TP.notEmpty(allRefreshedElements)) {

        //  Allocate an Array for elements that *are* contained in the receiver.
        //  We will use this Array to send the signal.
        allContainedElements = TP.ac();

        //  Build out a Hash for elements that are *not* contained in the
        //  receiver. We'll preserve the Hash of the elements that are *not*
        //  contained within the receiver and set 'allRefreshedElements' to
        //  that.
        notContainedElementInfo = TP.hc();

        allRefreshedElements.perform(
            function(kvPair) {
                var containedElems,
                    notContainedElems,

                    aspectKey,
                    tpElems,

                    len,
                    i,

                    tpElem;

                containedElems = TP.ac();
                notContainedElems = TP.ac();

                aspectKey = kvPair.first();
                tpElems = kvPair.last();

                //  Iterate over all of the elements and sort them into two
                //  Arrays, one for elements contained in the receiver and one
                //  for elements that are not.
                len = tpElems.getSize();
                for (i = 0; i < len; i++) {
                    tpElem = tpElems.at(i);
                    if (this.contains(tpElem, TP.IDENTITY)) {
                        containedElems.push(tpElem);
                    } else {
                        notContainedElems.push(tpElem);
                    }
                }

                //  If there are elements that are contained in the receiver,
                //  concatenate them into the overall Array that we will use to
                //  send the signal.
                if (TP.notEmpty(containedElems)) {
                    allContainedElements =
                            allContainedElements.concat(containedElems);
                }

                //  If there are elements that are *not* contained in the
                //  receiver, add an entry to the Hash under the aspect key.
                //  This is the Hash that we'll preserve for other runs of this
                //  method.
                if (TP.notEmpty(notContainedElems)) {
                    notContainedElementInfo.atPut(aspectKey, notContainedElems);
                }
            }.bind(this));

        //  If we have contained elements, then send the signal.
        if (TP.notEmpty(allContainedElements)) {
            allContainedElements.unique();

            evt = this.getNativeDocument().createEvent('Event');
            evt.initEvent('TIBETBindingsRefreshed', true, true);

            evt.data = allContainedElements;

            this.getNativeNode().dispatchEvent(evt);
        }

        this.getDocument().set('$refreshedElements', notContainedElementInfo);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('setAttrBindRepeatindex',
function(index) {

    /**
     * @method setAttrBindRepeatindex
     * @summary Sets the repeat index that the receiver will use to start
     *     repeating from.
     * @param {Number} index The index to start repeating from.
     */

    //  NB: We pass true here to signal change in case anything in the GUI is
    //  watching this attribute.
    this.$setAttribute('bind:repeatindex', index, true);

    this.$updateRepeatRowIndices();

    //  Refresh the repeating data under us, passing false to *not* regenerate
    //  repeat chunks. We're merely changing the index here - that will not be
    //  required.
    this.$refreshRepeatData(false);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('setAttrBindRepeatsize',
function(size) {

    /**
     * @method setAttrBindRepeatsize
     * @summary Sets the repeat size that the receiver will use to display
     *     'pages' of repeating data.
     * @param {Number} size The size of the data 'page'.
     */

    //  NB: We pass true here to signal change in case anything in the GUI is
    //  watching this attribute.
    this.$setAttribute('bind:repeatsize', size, true);

    //  Refresh the repeating data under us, passing true to regenerate any new
    //  repeat chunks that may be required.
    this.$refreshRepeatData(true);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('setBoundAspect',
function(attributeName, anAspect, aValue, scopeVals, bindingInfoValue,
ignoreBidiInfo) {

    /**
     * @method setBoundAspect
     * @summary Sets the bound aspect of the receiver to the supplied value.
     *     This takes the supplied aspect and value and sets that value onto the
     *     model under that aspect.
     * @param {String} attributeName The name of the attribute to find the
     *     binding information that we're setting.
     * @param {String} anAspect The aspect of model that we're going to set
     * @param {Object} aValue The value to set onto the model.
     * @param {String[]} scopeVals The list of scoping values (i.e. parts that,
     *     when combined, make up the entire bind scoping path).
     * @param {String} bindingInfoValue A String, usually in a JSON-like format,
     *     that details the binding information for the receiver. That is, the
     *     bounds aspects of the receiver and what they're bound to.
     * @param {Boolean} [ignoreBidiInfo=false] Whether or not to ignore the
     *     receiver's bidirectional attribute information. If this parameter is
     *     true, this method will always set the bound value whether or not the
     *     bound attribute is considered to be both a getter and setter.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var bindingInfo,
        bidiAttrs;

    //  Extract the binding information from the supplied binding information
    //  value String. This may have already been parsed and cached, in which
    //  case we get the cached values back.
    bindingInfo = this.getBindingInfoFrom(attributeName, bindingInfoValue);

    if (TP.notTrue(ignoreBidiInfo)) {
        //  Grab the list of our 'bidirectional' instance (not DOM) attributes.
        //  This will tell us which aspects can be 'set' from GUI to model.
        bidiAttrs = this.getType().get('bidiAttrs');

        //  Make sure that the receiver is configured with bidi instance
        //  attributes. If there are none, that means that we have no GUI to
        //  model capable aspects, so warn and exit here.
        if (TP.isEmpty(bidiAttrs)) {
            TP.ifWarn() ?
                TP.warn('No bidi attrs defined for bound control: ' +
                        TP.name(this) + '.') : 0;

            return this;
        }
    }

    //  Iterate over each binding expression in the binding information.
    bindingInfo.perform(
        function(bindEntry) {

            var boundAspect,

                bindVal,

                dataExprs,
                i,
                dataExpr,

                allVals,
                fullExpr,

                wholeURI,
                primaryURI,

                frag,

                result,
                newValue;

            boundAspect = bindEntry.first();

            //  If the bound aspect that we're processing doesn't match the
            //  aspect name that was supplied to this method, then we skip it.
            if (boundAspect !== anAspect) {
                return;
            }

            //  If the attribute isn't one of the bidi attributes, then we can
            //  just exit here (i.e. its not an attribute that we can 'set' from
            //  the UI)
            if (TP.notTrue(ignoreBidiInfo) &&
                !bidiAttrs.contains(boundAspect)) {
                return;
            }

            bindVal = bindEntry.last();

            //  There will be 1...n data expressions here. Iterate over them and
            //  compute a model reference.
            dataExprs = bindVal.at('dataExprs');
            for (i = 0; i < dataExprs.getSize(); i++) {
                dataExpr = TP.trim(dataExprs.at(i));

                if (TP.isEmpty(dataExpr)) {
                    continue;
                }

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

                        break;
                    }

                    wholeURI = TP.uc(fullExpr);
                } else {
                    //  Scope values is empty - this is (hopefully) a fully
                    //  qualified binding expression.

                    //  If we weren't able to compute a real URI from the
                    //  fully expanded URI value, then raise an exception
                    //  and return here.
                    dataExpr = TP.trim(dataExpr);
                    if (!TP.isURIString(dataExpr) &&
                            !TP.regex.URI_FRAGMENT.test(dataExpr)) {
                        this.raise('TP.sig.InvalidURI');
                        break;
                    }

                    wholeURI = TP.uc(dataExpr);
                }

                if (!TP.isURI(wholeURI)) {
                    this.raise('TP.sig.InvalidURI');

                    break;
                }

                primaryURI = wholeURI.getPrimaryURI();
                frag = wholeURI.getFragment();

                //  Grab the result from the 'primary URI'. If the value can't
                //  be retrieved, then create a TP.lang.ValueHolder object and
                //  set it's 'value' value to the value that we're trying to
                //  set. Then set that as the 'whole resource' of the primary
                //  URI.
                if (TP.notValid(
                        result = primaryURI.getResource().get('result'))) {

                    newValue = TP.lang.ValueHolder.construct(aValue);

                    //  NB: This will mark the primaryURI as dirty.
                    primaryURI.setResource(
                        newValue, TP.hc('observeResource', true,
                                        'signalChange', true));
                } else {

                    //  Since we have a reference to the portion of the data
                    //  referenced by primaryURI, we have to manually mark it as
                    //  dirty here (and send a notification).
                    primaryURI.isDirty(true, true);

                    //  If no fragment could be computed, then we set the 'whole
                    //  value'.
                    if (TP.isEmpty(frag)) {
                        result.set('value', aValue);
                    } else {
                        //  If we got a Window wrapper as the result from the
                        //  primary URI, then we're a 'direct to GUI' binding.
                        //  Use the *whole* URI to get a reference to the
                        //  (wrapped) element and set its value.
                        if (TP.isKindOf(result, TP.core.Window)) {
                            result = wholeURI.getResource().get('result');
                            result.set('value', aValue);
                        } else {
                            result.set(TP.apc(frag), aValue);
                        }
                    }
                }
            }
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('setBoundValueIfBound',
function(aValue, ignoreBidiInfo) {

    /**
     * @method setBoundValueIfBound
     * @summary Sets the bound value of the receiver to the supplied value if
     *     the receiver is bound. This takes the supplied value and sets that
     *     value onto the model.
     * @description This method is a convenience wrapper for setBoundAspect
     *     that assumes an aspect of 'value' and that the receiver's binding
     *     scope values and binding attribute value will be used.
     * @param {Object} aValue The value to set onto the model.
     * @param {Boolean} [ignoreBidiInfo=false] Whether or not to ignore the
     *     receiver's bidirectional attribute information. If this parameter is
     *     true, this method will always set the bound value whether or not the
     *     bound attribute is considered to be both a getter and setter.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,

        attrName;

    //  If we're part of a chain that started with refreshing the bind machinery
    //  (i.e. the bind machinery called setValue(), which is calling us), then
    //  just bail out here.
    if (TP.isTrue(TP.$$settingFromBindMachinery)) {
        return this;
    }

    elem = this.getNativeNode();

    //  NB: 'bind:in' doesn't matter here - that goes 'in', these go 'out'.

    if (TP.elementHasAttribute(elem, 'bind:io', true)) {
        attrName = 'bind:io';
    } else if (TP.elementHasAttribute(elem, 'bind:out', true)) {
        attrName = 'bind:out';
    }

    if (TP.isEmpty(attrName)) {
        return this;
    }

    //  Call setBoundAspect, using the supplied value and assuming our binding
    //  scope values and the value of the found binding attribute.
    this.setBoundAspect(attrName,
                        'value',
                        aValue,
                        this.getBindingScopeValues(),
                        this.getAttribute(attrName),
                        ignoreBidiInfo);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$setFinalValue',
function(aspect, exprs, outerScopeValue, updatedAspects, aFacet, transformFunc, aPathType, changeSource, repeatSource, repeatIndex) {

    /**
     * @method $setFinalValue
     * @summary Sets the 'final value' of the receiver.
     * @param {String} aspect The aspect of the receiver to update.
     * @param {String[]} exprs The list of data expressions that were parsed
     *     from the overall binding expression.
     * @param {Object} outerScopeVal The outer scoped value (usually a
     *     collection) to use to update the binding (unless the binding is a
     *     fully qualified exression). The binding will take a portion of this
     *     data to update.
     * @param {Array|TP.ALL} updatedAspects An Array of the aspects of the data
     *     model that are being updated or TP.ALL, to indicate that all of them
     *     are.
     * @param {String} aFacet=value The facet of the data that we're updating.
     *     we're refreshing. This defaults to 'value' which is the 99% case.
     * @param {Function} transformFunc Any transformation Function that was
     *     computed from the binding expression (that will have 1..n data
     *     expressions - supplied here in the 'exprs' parameter) embedded in it.
     * @param {Number} aPathType The path type that is contained in the
     *     binding expression.
     * @param {Object} changeSource The source of the change. If a signal
     *     initiated the refreshing process, this will be the signal's 'source'.
     * @param {Object} repeatSource The 'whole source' of the repeat, if the
     *     receiver is inside of a repeat context.
     * @param {Number} repeatIndex The index of the nearest scope within the
     *     nearest repeat if the receiver is inside of a repeat context.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,

        facet,

        allRefreshedElements,
        refreshedElemsByAspectAndFacet,

        pathOptions,

        shouldExtractVal,
        shouldCollapseVal,

        getRequest,

        initialScopedValue,

        hasTransformFunc,

        finalVal,

        exprVals,

        len,
        i,

        scopedVal,

        expr,

        customGetterName,

        uriExpr,

        pathType,

        exprVal,

        pathExpr,

        isXMLResource,
        xmlTestVal,

        didRefresh;

    elem = this.getNativeNode();

    facet = TP.ifInvalid(aFacet, 'value');

    //  Grab the list of elements that have been refreshed.
    allRefreshedElements = this.getDocument().get('$refreshedElements');
    if (TP.notValid(allRefreshedElements)) {
        //  The hash of all refreshed elements didn't exist - create it.
        allRefreshedElements = TP.hc();
        this.getDocument().set('$refreshedElements', allRefreshedElements);

        //  Now, create an Array and register it under a composite key of the
        //  aspect and facet.
        refreshedElemsByAspectAndFacet = TP.ac();
        allRefreshedElements.atPut(
                    aspect + '__' + facet,
                    refreshedElemsByAspectAndFacet);
    } else {

        //  Grab the Array under the composite key of the aspect and facet.
        refreshedElemsByAspectAndFacet = allRefreshedElements.at(
                    aspect + '__' + facet);

        //  If that didn't exist, then create it.
        if (TP.notValid(refreshedElemsByAspectAndFacet)) {
            refreshedElemsByAspectAndFacet = TP.ac();
            allRefreshedElements.atPut(
                    aspect + '__' + facet,
                    refreshedElemsByAspectAndFacet);
        } else {
            //  Otherwise, if the Array under that composite key contains the
            //  receiver's native element, then we've already refreshed it in
            //  this 'pass'. Just return here.
            if (refreshedElemsByAspectAndFacet.indexOf(elem) !== TP.NOT_FOUND) {
                return this;
            }
        }
    }

    refreshedElemsByAspectAndFacet.push(elem);

    //  If we were handed an Array of the aspects of the model that were
    //  updated (and not TP.ALL, meaning all aspects), then check to see
    //  if the aspect we're currently updating is in that Array. If not,
    //  continue on.
    if (updatedAspects !== TP.ALL &&
        !updatedAspects.contains(aspect)) {
        return;
    }

    if (facet !== 'value' && TP.isValid(outerScopeValue)) {
        finalVal = outerScopeValue;
    } else {
        pathOptions = TP.hc();

        //  If the receiver is a 'scalar valued' target object, then we set
        //  flags to extract the value from the data value.
        shouldExtractVal = false;
        if (this.isScalarValued(aspect)) {
            shouldExtractVal = true;
            pathOptions.atPut('extractWith', 'value');
        }

        //  If the receiver is a 'single valued' target object, then we set
        //  flags to collapse a single item value from the data value.
        shouldCollapseVal = false;
        if (this.isSingleValued(aspect)) {
            shouldCollapseVal = true;
            pathOptions.atPut('shouldCollapse', true);
        }

        getRequest = TP.request('shouldCollapse', false);

        initialScopedValue = TP.collapse(outerScopeValue);

        hasTransformFunc = TP.isCallable(transformFunc);

        finalVal = '';

        exprVals = TP.ac();

        len = exprs.getSize();
        for (i = 0; i < len; i++) {

            //  NB: These get modified in the loop - we need to reset them here.
            scopedVal = initialScopedValue;
            customGetterName = null;

            expr = TP.trim(exprs.at(i));

            if (TP.isEmpty(expr)) {
                continue;
            }

            //  If we were handed a 'barename' expression, then we're
            //  referencing the value of another control on the same GUI page.
            if (TP.regex.BARENAME.test(expr)) {
                expr = 'tibet://uicanvas' + expr;
            } else if (TP.regex.JS_IDENTIFIER.test(expr)) {
                customGetterName = 'get' + TP.makeStartUpper(expr);
            }

            //  Compute a final value based on whether we were handed:
            //      1. A URI that we can extract the final value from.
            //      2. A path type if one was supplied and matches the value we
            //      were supplied.
            //      3. A value that can be extracted based on the supplied value
            //      and a computed extraction mechanism.

            if (TP.isURIString(expr)) {

                //  If there's a fragment, use that. Otherwise, we append a
                //  '#tibet(.)' fragment expression onto the URI, which will
                //  just return whatever object is considered the 'whole value'
                //  of the resource's result.
                if (TP.regex.URI_FRAGMENT.test(expr)) {
                    uriExpr = expr;
                } else {
                    uriExpr = TP.uc(expr).getPrimaryLocation() + '#tibet(.)';
                }

                exprVal = TP.uc(uriExpr).getResource(getRequest).get('result');

                if (shouldCollapseVal) {
                    exprVal = TP.collapse(exprVal);
                }

                //  If there is no transformation function defined, and if the
                //  value extraction flag is defined, then extract the value.
                //  If there is a transformation function, then we just hand the
                //  unextracted value of the data value to it.
                if (!hasTransformFunc && shouldExtractVal) {
                    exprVal = TP.val(exprVal);
                } else if (/tibet:\/\/uicanvas/.test(expr)) {
                    exprVal = TP.val(exprVal);
                }

            } else if (TP.isValid(customGetterName) &&
                        TP.canInvoke(scopedVal, customGetterName)) {

                //  There was a custom getter on the supplied scoped value -
                //  execute it and use that value.
                exprVal = scopedVal[customGetterName]();
            } else {

                //  Test the path type we were handed. If it doesn't match the
                //  type of data that we're processing in the loop, then we set
                //  the pathType to null and let the machinery handle it as if
                //  no path type was supplied.
                pathType = aPathType;

                //  If the expression contains ACP variables or a '$_' stdin
                //  indicator, then set the pathType to null and let the
                //  machinery that looks at the value compute the expression
                //  value.
                if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(expr) ||
                    expr.contains('$_')) {
                    pathType = null;
                }

                if (TP.isValid(pathType)) {

                    switch (pathType) {
                        case TP.XPATH_PATH_TYPE:

                            if (TP.isXMLNode(scopedVal) ||
                                TP.isKindOf(scopedVal, TP.dom.Node)) {
                                //  empty
                            } else {
                                pathType = null;
                            }

                            break;

                        case TP.JSON_PATH_TYPE:
                            if (TP.isKindOf(scopedVal, TP.core.JSONContent)) {
                                //  empty
                            } else {
                                pathType = null;
                            }

                            break;

                        default:
                            break;
                    }
                }

                if (TP.isValid(pathType)) {

                    if (TP.isValid(scopedVal)) {
                        switch (pathType) {

                            case TP.XPATH_PATH_TYPE:

                                if (TP.isXMLNode(scopedVal)) {
                                    scopedVal = TP.wrap(scopedVal);
                                }

                                exprVal = this.$extractValue(
                                                        scopedVal,
                                                        expr,
                                                        TP.xpc,
                                                        pathOptions);

                                break;

                            case TP.JSON_PATH_TYPE:

                                if (!/^\$\./.test(expr)) {
                                    expr = '$.' + expr;
                                }

                                //  Because of the check above, scopedVal has to
                                //  be a JSONContent object here.

                                exprVal = this.$extractValue(
                                                        scopedVal,
                                                        expr,
                                                        TP.jpc,
                                                        pathOptions);

                                break;

                            case TP.TIBET_PATH_TYPE:

                                if (TP.isPlainObject(scopedVal)) {
                                    exprVal = this.$extractValue(
                                                        TP.hc(scopedVal),
                                                        expr,
                                                        TP.tpc,
                                                        pathOptions);
                                } else {
                                    exprVal = this.$extractValue(
                                                        scopedVal,
                                                        expr,
                                                        TP.tpc,
                                                        pathOptions);
                                }

                                break;

                            default:

                                exprVal = scopedVal.get(expr);

                                break;
                        }
                    }

                } else {

                    if (TP.isValid(scopedVal)) {

                        //  Note use of 'primitive' fetch in some places here -
                        //  at this level we're just trying to extract values,
                        //  not track data interests or anything like that.

                        if (TP.regex.COMPOSITE_PATH.test(expr)) {
                            exprVal = TP.wrap(scopedVal).get(
                                                TP.apc(expr, pathOptions));
                        } else if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(
                                                                        expr)) {
                            exprVal = scopedVal;
                        } else if (TP.isPlainObject(scopedVal)) {
                            exprVal = TP.extern.jsonpath.nodes(
                                                    scopedVal, expr)[0];

                            if (TP.isValid(exprVal)) {
                                exprVal = exprVal.value;
                                exprVal =
                                    TP.processValueUsingConfig(
                                    exprVal,
                                    scopedVal,
                                    shouldCollapseVal,
                                    shouldExtractVal ? 'value' : null);
                            }
                        } else if (TP.isXMLNode(scopedVal)) {
                            exprVal = TP.nodeEvaluatePath(
                                        scopedVal,
                                        expr,
                                        TP.XPATH_PATH_TYPE,
                                        false);

                            exprVal =
                                TP.processValueUsingConfig(
                                exprVal,
                                scopedVal,
                                shouldCollapseVal,
                                shouldExtractVal ? 'value' : null);

                        } else if (TP.isKindOf(scopedVal, TP.dom.Node)) {
                            exprVal = TP.nodeEvaluatePath(
                                        TP.unwrap(scopedVal),
                                        expr,
                                        TP.XPATH_PATH_TYPE,
                                        false);

                            exprVal =
                                TP.processValueUsingConfig(
                                exprVal,
                                scopedVal,
                                shouldCollapseVal,
                                shouldExtractVal ? 'value' : null);

                        } else if (TP.isKindOf(scopedVal,
                                                TP.core.JSONContent)) {
                            pathExpr = expr;

                            if (TP.regex.JSON_POINTER.test(pathExpr)) {
                                pathExpr =
                                    TP.regex.JSON_POINTER.match(pathExpr).at(1);
                            }

                            exprVal = TP.extern.jsonpath.nodes(
                                    scopedVal.get('data'), pathExpr)[0];

                            if (TP.isValid(exprVal)) {
                                exprVal = exprVal.value;
                                exprVal =
                                    TP.processValueUsingConfig(
                                    exprVal,
                                    scopedVal,
                                    shouldCollapseVal,
                                    shouldExtractVal ? 'value' : null);
                            }
                        } else if (TP.isKindOf(scopedVal,
                                                TP.core.XMLContent)) {
                            pathExpr = expr;

                            if (TP.regex.XPATH_POINTER.test(pathExpr)) {
                                pathExpr =
                                    TP.regex.XPATH_POINTER.match(pathExpr).at(2);
                            }

                            exprVal = TP.nodeEvaluatePath(
                                        TP.unwrap(scopedVal.get('data')),
                                        pathExpr,
                                        TP.XPATH_PATH_TYPE,
                                        false);

                            exprVal =
                                TP.processValueUsingConfig(
                                exprVal,
                                scopedVal,
                                shouldCollapseVal,
                                shouldExtractVal ? 'value' : null);
                        } else if (TP.regex.JSON_POINTER.test(expr) ||
                                    TP.regex.JSON_PATH.test(expr)) {
                            pathExpr = expr;

                            if (TP.regex.JSON_POINTER.test(pathExpr)) {
                                pathExpr =
                                    TP.regex.JSON_POINTER.match(pathExpr).at(1);
                            }

                            if (TP.isKindOf(scopedVal, TP.core.JSONContent)) {
                                exprVal = TP.extern.jsonpath.nodes(
                                    scopedVal.get('data'), pathExpr)[0].value;
                            } else {
                                exprVal = TP.extern.jsonpath.nodes(
                                    scopedVal, pathExpr)[0].value;
                            }

                            exprVal =
                                TP.processValueUsingConfig(
                                exprVal,
                                scopedVal,
                                shouldCollapseVal,
                                shouldExtractVal ? 'value' : null);
                        } else if (TP.notValid(scopedVal)) {
                            exprVal = null;
                        } else if (TP.regex.QUOTED_CONTENT.test(expr)) {
                            exprVal = TP.regex.QUOTED_CONTENT.match(expr).at(2);
                        } else if (!TP.isMutable(scopedVal)) {
                            //  If it's a String, Number or Boolean, then
                            //  scopedVal is the actual value we want to use.
                            exprVal = scopedVal;
                        } else if (TP.isPlainObject(scopedVal)) {
                            exprVal = scopedVal[expr];
                        } else {
                            exprVal = scopedVal.get(expr);
                        }
                    }
                }

                //  If there is no transformation function defined, and if the
                //  value extraction flags are defined, then extract the value.
                //  If there is a transformation function, then we just hand the
                //  unextracted value of the data value to it.
                if (!hasTransformFunc && shouldExtractVal) {
                    exprVal = TP.val(exprVal);
                }

                if (shouldCollapseVal) {
                    exprVal = TP.collapse(exprVal);
                }
            }

            exprVals.push(exprVal);
        }

        //  If we ended up with a *valid* final value and a transformation
        //  Function was defined, then execute it with that value.
        if (TP.notEmpty(exprVals)) {
            if (hasTransformFunc) {

                xmlTestVal = exprVals.first();

                if (TP.isCollection(xmlTestVal)) {
                    isXMLResource = TP.isXMLNode(TP.unwrap(xmlTestVal.first()));
                } else {
                    isXMLResource = TP.isXMLNode(TP.unwrap(xmlTestVal));
                }

                if (isXMLResource) {
                    exprVals.convert(
                        function(aVal) {
                            if (TP.isNode(aVal) ||
                                TP.isKindOf(aVal, TP.dom.Node)) {
                                return TP.objectValue(aVal, 'value', true);
                            }
                        });
                }

                finalVal = transformFunc(
                                changeSource,
                                exprVals,
                                this,
                                repeatSource,
                                repeatIndex,
                                isXMLResource);
            } else {
                //  Try to preserve the data type here. If there is only 1
                //  expression, then there is no sense in stringifying the final
                //  value.
                if (exprVals.getSize() === 1) {
                    finalVal = exprVal;
                } else {
                    finalVal = exprVals.join('');
                }
            }
        }
    }

    //  NB: We will *always* call either setValue or setFacet, even if the value
    //  is null or undefined. This way we can let the receiver decide how to
    //  manage those values.
    if (aspect === 'value' && facet === 'value') {
        TP.$$settingFromBindMachinery = true;
        didRefresh = this.setValue(finalVal);
        TP.$$settingFromBindMachinery = false;
    } else {
        TP.$$settingFromBindMachinery = true;
        this.setFacet(aspect, facet, finalVal);
        TP.$$settingFromBindMachinery = false;
        didRefresh = true;
    }

    return didRefresh;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('setInitialValue',
function(aValue) {

    /**
     * @method setInitialValue
     * @summary Sets the initial value of the receiver.
     * @description This method is a convenience wrapper for setting an initial
     *     value. The property 'initialValue' has no special meaning, but is a
     *     defacto property name chosen by TIBET that will simply set the bound
     *     value. This should only be used in a 'read-only' fashion by authors
     *     to set the initial value of a piece of model data.
     * @param {Object} aValue The inital value to set onto the model.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    this.setBoundValueIfBound(aValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('setRepeatPage',
function(aPosition) {

    /**
     * @method setRepeatPage
     * @summary Sets the repeat page 'position', that is the currently showing
     *     page of repeating results.
     * @param {Number} aPosition The position to set the repeating paging system
     *     to.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var repeatSize,

        position,
        endIndex;

    repeatSize = this.getAttribute('bind:repeatsize');

    position = aPosition - 1;

    //  Can't go before the first page.
    if (position < 0) {
        return this;
    }

    //  Can't go after the last page.
    if (position > this.getRepeatPageCount()) {
        return this;
    }

    endIndex = position * repeatSize;

    this.setAttribute('bind:repeatindex', endIndex);

    //  NB: We pass true here to signal change in case anything in the GUI is
    //  watching this attribute.
    this.$setAttribute('bind:repeatpage', aPosition, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('$updateRepeatRowIndices',
function(aCollection) {

    /**
     * @method $updateRepeatRowIndices
     * @summary This method updates repeating rows indices based on the values
     *     of the receiver's 'bind:repeatindex' and 'bind:repeatsize' attribute
     *     values.
     * @description Note that the 'bind:repeatindex' is 1-based, so the first
     *     row is '1', not '0'. Also, this method will default the
     *     'bind:repeatsize' to the length of the collection or a maximum row
     *     value, whichever is less, if one isn't specified.
     * @param {Object} aCollection The collection data model that is used for
     *     the repeating content.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem,

        collection,
        isXMLResource,

        resourceLength,

        allRepeatChunks,

        startIndex,
        endIndex,
        repeatSize,

        indices,

        repeatElem,
        scopeIndex,

        len,
        i;

    elem = this.getNativeNode();

    collection = aCollection;

    //  If a collection wasn't supplied, then go obtain the 'repeat source'.
    if (!TP.isCollection(collection)) {
        collection = this.$getRepeatValue();
    }

    //  If collection is a TP.core.Hash, then convert it into an Array of
    //  key/value pairs. Binding repeats need a collection they can index
    //  numerically.
    if (TP.isHash(collection)) {
        collection = collection.getKVPairs();
    }

    //  Detect whether we're drawing GUI for model which is a chunk of XML data
    //  - we'll use this information later.
    isXMLResource = TP.isXMLNode(TP.unwrap(collection.first()));

    //  The maximum number of rows.
    resourceLength = collection.getSize();

    //  Find all of the existing *direct children* bound rows under us that have
    //  a 'bind:scope' that starts with a '[' and ends with a ']'.
    allRepeatChunks = TP.byCSSPath(
                        '> *[bind|scope^="["][bind|scope$="]"]',
                        elem,
                        false,
                        false);

    //  If we have a 'bind:repeatindex', then we can compute a starting index
    //  from it.
    if (this.hasAttribute('bind:repeatindex')) {
        if (!TP.isNumber(startIndex =
                            this.getAttribute('bind:repeatindex').asNumber())) {
            startIndex = 0;
        }
    } else {
        startIndex = 0;
    }

    //  If we have a 'bind:repeatsize', then we can compute how many rows we
    //  should be displaying.
    if (this.hasAttribute('bind:repeatsize')) {

        //  If we have a 'bind:repeatsize', then we can compute an ending index
        //  from that and the startIndex
        if (TP.isNumber(repeatSize =
                        this.getAttribute('bind:repeatsize').asNumber())) {
            endIndex = startIndex + repeatSize;
        } else {
            endIndex = resourceLength - startIndex;
        }

        endIndex -= 1;
    } else {
        endIndex = resourceLength;
    }

    //  The startIndex has to be at least 0.
    startIndex = startIndex.max(0);

    //  The endIndex cannot be larger than the number of rows.
    endIndex = endIndex.min(resourceLength);

    //  Generate a list of numbers from startIndex...endIndex.
    indices = Array.generateNumericSequence(startIndex, endIndex);

    //  Iterate over all of the repeating content rows in the receiver and show
    //  or hide them, depending on whether their index exists in the numeric
    //  sequence.
    len = allRepeatChunks.getSize();
    for (i = 0; i < len; i++) {

        repeatElem = allRepeatChunks.at(i);

        //  If we're dealing with an XML resource, then we add one to the index
        //  we're processing (since indices in XPath are 1-based, which is fine
        //  for XML, but not for other 0-based data, like JS or JSON).
        if (!isXMLResource) {
            scopeIndex = indices.at(i);
        } else {
            scopeIndex = indices.at(i) + 1;
        }

        //  Update the 'bind:scope' with an attribute containing the numeric
        //  scoping index (i.e. '[2]'). This will be used in bind scoping
        //  computations.
        TP.elementSetAttribute(repeatElem,
                                'bind:scope',
                                '[' + scopeIndex + ']',
                                true);

        //  Update the cached repeating index on the element for much better
        //  bind:repeat performance
        repeatElem[TP.REPEAT_INDEX] = scopeIndex;
    }

    if (!TP.isNumber(this.getAttribute('bind:repeatpage').asNumber())) {
        //  NB: We pass true here to signal change in case anything in the GUI
        //  is watching this attribute.
        this.$setAttribute('bind:repeatpage', 1, true);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.UIElementNode
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIEdit',
function(aSignal) {

    /**
     * @method handleUIEdit
     * @summary Handles when the user wants to edit the underlying data source.
     *     For now, this method a) only works for bind:repeat and b) only uses a
     *     simple text field to allow editing.
     * @param {TP.sig.UIEdit} aSignal The signal instance which triggered
     *     this handler.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var targetElem,
        textNode,

        removeEditorAndSetValue,
        moveEditorTo,

        editor,

        keydownHandler;

    //  It is important to remember that this code is shared by all
    //  TP.dom.ElementNode nodes. Therefore, we need to use other checking logic
    //  (like whether or not we have this attribute) to see if we handle this.

    if (!this.hasAttribute('bind:repeat')) {
        return this;
    }

    //  We can handle this - stop propagation so that ancestors up the chain
    //  don't get notified.
    aSignal.stopPropagation();

    //  Compute the target element from the underlying DOM signal.
    targetElem = aSignal.getDOMTarget();

    //  If the target was a Text node, then we use its parent node.
    if (TP.isTextNode(targetElem)) {
        textNode = targetElem;
        targetElem = targetElem.parentNode;
    } else {
        textNode = targetElem.firstChild;
    }

    //  A Function that tears down the editor and sets the bound value.
    removeEditorAndSetValue = function() {

        var newText,
            newTextNode,

            boundElem,
            boundTPElem;

        //  Grab the value from the editor and create a new Text node from it.
        newText = editor.value;
        newTextNode = editor.ownerDocument.createTextNode(newText);

        //  Now, starting from the editor, we need to determine the nearest
        //  'bound element' up our chain. This is the one we'll be setting the
        //  value for.
        boundElem = TP.nodeDetectAncestor(
                        editor,
                        function(aNode) {
                            return TP.isElement(aNode) &&
                                    TP.wrap(aNode).isBoundElement();
                        });

        //  Replace the editor with the newly generated text node
        TP.nodeReplaceChild(editor.parentNode,
                            newTextNode,
                            editor,
                            false);

        //  Wrap the element that we're really setting the value for and set its
        //  bound value.
        boundTPElem = TP.wrap(boundElem);
        boundTPElem.setBoundAspect(
                        'bind:in',
                        'value',
                        newText,
                        boundTPElem.getBindingScopeValues(),
                        boundTPElem.getAttribute('bind:in'),
                        true);
    };

    //  A Function that moves the editor to the supplied Element
    moveEditorTo = function(anElem) {

        var elemTextContent,
            elemTextNode;

        //  Grab the text content from the element
        elemTextContent = TP.nodeGetTextContent(anElem);

        //  Replace the underlying text node with the editor.
        elemTextNode = anElem.firstChild;
        editor = TP.nodeReplaceChild(anElem,
                                        editor,
                                        elemTextNode,
                                        false);

        //  Set the value of the editor to the element's text content.
        editor.value = elemTextContent;

        //  Select the text in the editor, but fork to allow the GUI to
        //  refresh, which seems to help out focusing mechanics.
        setTimeout(editor.select, TP.sys.cfg('editor.select.delay', 50));
    };

    //  Replace the text node with an editor and style it.
    editor = TP.nodeReplaceTextWithEditor(textNode);
    TP.elementSetStyleString(editor, 'width: 100%; height: 100%;');

    //  Set up a 'keydown' handler on the editor.
    editor.addEventListener(
            'keydown',
            keydownHandler = function(evt) {
                var editorTargetElem,
                    editorTargetType,

                    keyName,
                    sigName,

                    repeatElem,
                    allBindIns,

                    destinationElement;

                //  NB: We don't use variables captured from the enclosing scope
                //  (except for 'editor') in this handler function, since
                //  closure semantics can cause problems. Therefore, we obtain
                //  everything from 'editor' or from the event parameter.

                //  The current target element is the parent node of the editor.
                editorTargetElem = editor.parentNode;

                //  Get the TIBET type for the editor element.
                editorTargetType = TP.wrap(editorTargetElem).getType();

                //  Grab the key name and consult the editor type's key binding
                //  map for a signal name. This will tell us whether we should
                //  just keep processing keys or move the editor or dismiss the
                //  editor.
                keyName = TP.eventGetDOMSignalName(evt);
                sigName = editorTargetType.getKeybinding(keyName);

                //  If we didn't have a mapping signal, and the key name wasn't
                //  an 'Enter' then we will just keep processing keys
                if (TP.notValid(sigName) && keyName !== 'DOM_Enter_Down') {
                    return;
                }

                //  Grab our ancestor that contains the 'bind:repeat' attribute.
                repeatElem = TP.nodeDetectAncestor(
                                editorTargetElem,
                                function(aNode) {
                                    return TP.isElement(aNode) &&
                                            TP.elementHasAttribute(
                                                aNode, 'bind:repeat', true);
                                });

                //  Grab all of the elements under the element with the
                //  'bind:repeat' that have 'bind:in' attributes.
                allBindIns = TP.byCSSPath(' *[bind|in]',
                                            repeatElem,
                                            false,
                                            false);

                //  Based on the signal name, compute the element we should be
                //  going to.
                switch (sigName) {

                    case 'TP.sig.UIFocusFirst':

                        destinationElement = allBindIns.first();
                        break;

                    case 'TP.sig.UIFocusLast':

                        destinationElement = allBindIns.last();
                        break;

                    case 'TP.sig.UIFocusNext':

                        destinationElement =
                                allBindIns.after(editorTargetElem);
                        //  If we couldn't find an element following the target
                        //  element, then we wrap around to the first one.
                        if (!TP.isElement(destinationElement)) {
                            destinationElement = allBindIns.first();
                        }
                        break;

                    case 'TP.sig.UIFocusPrevious':

                        destinationElement =
                                allBindIns.before(editorTargetElem);

                        //  If we couldn't find an element preceding the target
                        //  element, then we wrap around to the last one.
                        if (!TP.isElement(destinationElement)) {
                            destinationElement = allBindIns.last();
                        }
                        break;

                    default:

                        //  No destination element could be computed - just
                        //  dismiss the editor and remove this handler. See
                        //  below.
                        destinationElement = TP.NOT_FOUND;
                        break;
                }

                //  Make sure to both prevent default and stop propagation of
                //  the native event. We don't want keypresses or keyups.
                evt.preventDefault();
                evt.stopPropagation();

                //  If we truly didn't find any destination element, then the
                //  user did something like hit Enter, which means they just
                //  wanted to dismiss the editor.
                if (destinationElement === TP.NOT_FOUND) {

                    //  Remove the editor and set the value.
                    removeEditorAndSetValue();

                    //  Remove the 'keydown' listener handler.
                    this.removeEventListener('keydown', keydownHandler, false);
                } else {

                    //  Otherwise, the user wants to move the editor to another
                    //  element.

                    //  Remove the editor and set the value.
                    removeEditorAndSetValue();

                    //  Move the editor to the destination element.
                    moveEditorTo(destinationElement);
                }
            });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
