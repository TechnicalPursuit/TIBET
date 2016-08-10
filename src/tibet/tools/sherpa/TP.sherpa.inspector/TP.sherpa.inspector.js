//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.sherpa.InspectorSource
//  ========================================================================

/**
 * @type {TP.sherpa.InspectorSource}
 */

TP.lang.Object.defineSubtype('sherpa.InspectorSource');

TP.sherpa.InspectorSource.addTraits(TP.sherpa.ToolAPI);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineAttribute('sourceEntries');
TP.sherpa.InspectorSource.Inst.defineAttribute('sourceName');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.InspectorSource} The receiver.
     */

    var retVal;

    retVal = this.callNextMethod();

    this.$set('sourceEntries', TP.hc(), false);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('addSource',
function(sourceParts, sourceHandler) {

    var pathParts,
        resolver,

        len,

        newItemPathPart,

        i;

    pathParts = sourceParts;
    resolver = this;

    len = pathParts.getSize();

    if (len > 1) {

        newItemPathPart = pathParts.last();

        pathParts = pathParts.slice(0, -1);
        len = pathParts.getSize();

        for (i = 0; i < len; i++) {
            resolver = resolver.getSourceAt(pathParts.at(i));

            if (TP.notValid(resolver)) {
                //  TODO: Log a warning.
            }
        }

        resolver.addSource(TP.ac(newItemPathPart), sourceHandler);
    } else {
        this.get('sourceEntries').atPut(sourceParts.first(), sourceHandler);
        sourceHandler.set('sourceName', sourceParts.first());
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('canHandle',
function(aTargetObject) {

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('getDataForInspector',
function(options) {

    var sourceEntries;

    sourceEntries = this.get('sourceEntries');
    if (TP.isValid(sourceEntries)) {
        return TP.keys(sourceEntries);
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary
     * @returns
     */

    var targetAspect,
        data,
        dataURI;

    targetAspect = options.at('targetAspect');

    //  Note here how we use '$get()' rather than 'get()'. This is because many
    //  subtypes or instances of these objects will override 'get()' and we
    //  don't want to have them have to test against this there.
    if (targetAspect === this.$get('sourceName')) {

        data = this.getDataForInspector(options);

        dataURI = TP.uc(options.at('bindLoc'));
        dataURI.setResource(data,
                            TP.request('signalChange', false));

        return TP.elem('<sherpa:navlist bind:in="' +
                        dataURI.asString() +
                        '"/>');
    } else {
        return this.getContentForEditor(options);
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('getPathTo',
function(aTargetObject) {

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('getSource',
function(sourceParts, sourceHandler) {

    var resolver,

        len,

        i;

    resolver = this;

    len = sourceParts.getSize();

    if (len > 1) {

        len = sourceParts.getSize();

        for (i = 0; i < len; i++) {
            resolver = resolver.getSourceAt(sourceParts.at(i));

            if (TP.notValid(resolver)) {
                //  TODO: Log a warning.
            }
        }

        return resolver;
    } else {
        return this.getSourceAt(sourceParts.first());
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('getSourceAt',
function(sourceID) {

    return this.get('sourceEntries').at(sourceID);
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    return this.get('sourceEntries').at(anAspect);
});

//  ========================================================================
//  TP.sherpa.InspectorPathSource
//  ========================================================================

/**
 * @type {TP.sherpa.InspectorPathSource}
 */

TP.sherpa.InspectorSource.defineSubtype('sherpa.InspectorPathSource');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineAttribute('methodRegister');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.InspectorPathSource} The receiver.
     */

    this.callNextMethod();

    this.set('methodRegister', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineMethod('dispatchMethodForPath',
function(pathParts, methodPrefix, args) {

    /**
     * @method
     * @summary
     * @param
     * @param
     * @param
     * @returns
     */

    var path,

        methodRegister,
        methodKeys,

        len,
        i,

        matcher,

        method;

    path = pathParts.join(TP.SEPARATOR);

    methodRegister = this.get('methodRegister');

    methodKeys = methodRegister.getKeys();
    methodKeys.sort(
            function(key1, key2) {

                return methodRegister.at(key1).last() <
                        methodRegister.at(key2).last();
            });

    len = methodKeys.getSize();

    for (i = 0; i < len; i++) {

        matcher = methodRegister.at(methodKeys.at(i)).first();

        if (matcher.test(path)) {
            method = this[methodPrefix + methodKeys.at(i)];
            break;
        }
    }

    if (TP.isMethod(method)) {
        return method.apply(this, args);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
     * @summary
     * @returns
     */

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getConfigFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary
     * @returns
     */

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getContentFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary
     * @returns
     */

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getDataFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineMethod('registerMethodSuffixForPath',
function(methodName, regExpParts) {

    /**
     * @method
     * @summary
     * @param
     * @param
     * @returns
     */

    this.get('methodRegister').atPut(
            methodName,
            TP.ac(
                TP.rc('^' + regExpParts.join('') + '$'),
                regExpParts.getSize()));

    return this;
});

//  ========================================================================
//  TP.sherpa.Inspector
//  ========================================================================

/**
 * @type {TP.sherpa.inspector}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('inspector');

//  The inspector itself is an inspector source for the 'root' entries.
TP.sherpa.inspector.addTraits(TP.sherpa.InspectorSource);

TP.sherpa.inspector.Inst.resolveTrait('init', TP.sherpa.TemplatedTag);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineAttribute(
        'container',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

TP.sherpa.inspector.Inst.defineAttribute('dynamicContentEntries');

TP.sherpa.inspector.Inst.defineAttribute('selectedItems');

TP.sherpa.inspector.Inst.defineAttribute('visibleSlotCount');

TP.sherpa.inspector.Inst.defineAttribute('currentFirstVisiblePosition');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('init',
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

    this.$set('sourceEntries', TP.hc(), false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('addDynamicRoot',
function(target) {

    /**
     * @method addDynamicRoot
     * @summary
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    //  TODO: Update root with label config - look for it in the current list.
    //  If it's there, we should highlight it. Otherwise, add to the 'recents'
    //  part of the list (a LIFO queue with a 'sherpa.inspector.recent_max'
    //  count).

    var dynamicEntries;

    dynamicEntries = this.get('dynamicContentEntries');

    //  Make sure that we don't already have the target in our list of dynamic
    //  entries.
    if (!dynamicEntries.contains(target, TP.IDENTITY)) {

        //  Wasn't found - add it and rebuild the root data.
        dynamicEntries.unshift(target);
        this.buildRootData();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('addItem',
function(itemContent, itemConfig) {

    /**
     * @method addItem
     * @summary
     * @param
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var item;

    item = TP.tpelem('<sherpa:inspectoritem/>');

    item.setContent(TP.wrap(itemContent));

    //  Append the new inspector item to the container here.
    //  Note the reassignment here
    item = this.get('container').addContent(item);

    //  Awaken the content here.
    item.awaken();

    this.configureItem(item, itemConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('buildRootData',
function() {

    /**
     * @method buildRootData
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var data,

        dataURI;

    data = this.getDataForInspector();

    dataURI = TP.uc('urn:tibet:sherpa_bay_0');
    dataURI.setResource(data);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('configureItem',
function(item, itemConfig) {

    /**
     * @method configureItem
     * @summary
     * @param
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var itemConfigKeys;

    itemConfigKeys = itemConfig.getKeys();

    itemConfigKeys.forEach(
            function(aKey) {
                if (aKey.startsWith(TP.ATTR + '_')) {
                    item.setAttribute(aKey.slice(5), itemConfig.at(aKey));
                }
            });

    item.set('config', itemConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('getItemFromSlotPosition',
function(aSlotPosition) {

    /**
     * @method
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var inspectorItems,
        currentSlotCount,

        len,
        i;

    if (!TP.isNumber(aSlotPosition)) {
        return null;
    }

    inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);
    if (aSlotPosition === 0) {
        return inspectorItems.first();
    }

    currentSlotCount = inspectorItems.first().getBayMultiplier();

    len = inspectorItems.getSize();
    for (i = 1; i < len; i++) {
        currentSlotCount += inspectorItems.at(i).getBayMultiplier();

        if (currentSlotCount > aSlotPosition) {
            return inspectorItems.at(i);
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('getItemLabel',
function(anItem) {

    /**
     * @method getItemLabel
     * @summary
     * @param
     * @returns {String}
     */

    if (TP.isMethod(anItem)) {
        return anItem[TP.DISPLAY];
    }

    if (TP.isNode(anItem) || TP.isKindOf(anItem, TP.core.Node)) {
        return TP.lid(anItem);
    }

    return TP.name(anItem);
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('getSlotPositionFromItem',
function(anItem) {

    /**
     * @method
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var inspectorItems,

        item0Multiplier,
        currentSlotCount,

        len,
        i;

    inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);
    if (anItem === inspectorItems.first()) {
        return 0;
    }

    //  We assume that the first item has a width of 1.
    item0Multiplier = inspectorItems.first().getBayMultiplier();

    currentSlotCount = item0Multiplier;

    len = this.getTotalSlotCount();

    //  Start at the second item
    for (i = 1; i < len; i++) {
        currentSlotCount += inspectorItems.at(i).getBayMultiplier();

        if (inspectorItems.at(i) === anItem) {
            return currentSlotCount - item0Multiplier;
        }
    }

    return -1;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('getTotalSlotCount',
function() {

    /**
     * @method getTotalSlotCount
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var totalSlotCount;

    totalSlotCount = 0;

    TP.byCSSPath('sherpa|inspectoritem', this).forEach(
            function(inspectorItem, index) {
                totalSlotCount += inspectorItem.getBayMultiplier();
            });

    return totalSlotCount;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('DetachContent',
function(aSignal) {

    /**
     * @method handleDetachContent
     * @summary
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var domTarget,

        inspectorItem,
        detachingContent,
        tpDetachingContent,

        srcID,
        tileID,

        tileTPElem,
        tileBody,

        newInspectorItemContent;

    domTarget = aSignal.getDOMTarget();

    inspectorItem = TP.nodeGetFirstAncestorByTagName(
                            domTarget, 'sherpa:inspectoritem');

    detachingContent = TP.nodeGetFirstChildElement(inspectorItem);
    tpDetachingContent = TP.wrap(detachingContent);

    srcID = tpDetachingContent.getLocalID();

    //  NB: Because we don't supply a parent here, the Sherpa will use the
    //  'common tile layer'.
    tileID = srcID + '_Tile';
    tileTPElem = TP.bySystemId('Sherpa').makeTile(tileID, srcID);

    //  Stamp the 'current path' onto the tile for future retrieval purposes
    tileTPElem.setAttribute(
                'path',
                this.get('selectedItems').getValues().join(' :: '));

    tileBody = tileTPElem.get('body');

    TP.nodeAppendChild(tileBody.getNativeNode(), detachingContent, false);

    if (TP.canInvoke(tpDetachingContent, 'setDetached')) {
        tpDetachingContent.setDetached(true);
    }

    tileTPElem.toggle('hidden');

    newInspectorItemContent = TP.xhtmlnode(
            '<span>' + TP.sc('This content is open in a tile.') +
            ' <button onclick="' +
            'tile = TP.byId(\'' + tileID + '\',' +
                ' TP.win(\'UIROOT\'), true);' +
            'if (TP.isValid(tile)) {tile.setAttribute(\'hidden\', false)}">' +
            'Open Tile' +
            '</button></span>');

    TP.wrap(inspectorItem).setContent(newInspectorItemContent);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @summary
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var currentFirstVisiblePosition;

    this.sizeItems();

    currentFirstVisiblePosition = this.get('currentFirstVisiblePosition');
    this.scrollItemToFirstVisiblePosition(
            this.getItemFromSlotPosition(currentFirstVisiblePosition));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('FocusInspectorForEditing',
function(aSignal) {

    /**
     * @method handleFocusInspectorForEditing
     * @summary
     * @param {TP.sig.FocusInspectorForEditing} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.inspector} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('FocusInspectorForBrowsing',
function(aSignal) {

    /**
     * @method handleFocusInspectorForBrowsing
     * @summary
     * @param {TP.sig.FocusInspectorForBrowsing} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var payload,

        currentBayIndex,

        domTarget,
        inspectorItem,
        inspectorItems,

        target,
        targetAspect,
        targetPath,

        resolver,

        info,

        sourceEntries,
        rootEntry,
        rootEntryResolver,
        rootBayItem,

        pathParts,
        rootInfo,

        pathSegments,

        i,

        nextBay,

        inspectorData;

    inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

    payload = aSignal.getPayload();

    targetAspect = payload.at('targetAspect');
    target = payload.at('targetObject');
    targetPath = payload.at('targetPath');

    //  Try to determine the current bay index.

    currentBayIndex = payload.at('bayIndex');
    domTarget = payload.at('domTarget');

    //  If one isn't provided, but a DOM target is, then try to compute one from
    //  there.
    if (!TP.isNumber(currentBayIndex) && TP.isNode(domTarget)) {

        inspectorItem = TP.nodeGetFirstAncestorByTagName(
                                domTarget, 'sherpa:inspectoritem');

        inspectorItem = TP.wrap(inspectorItem);

        currentBayIndex = inspectorItem.getBayIndex();
    }

    //  Try to determine the current target.

    //  If a valid target wasn't supplied, but we do have a current bay index,
    //  go to the inspector item located in that bay and obtain it's 'resolver'.
    if (TP.notValid(target) && TP.isNumber(currentBayIndex)) {

        inspectorItem = inspectorItems.at(currentBayIndex);
        resolver = inspectorItem.get('config').at('resolver');

        //  If we have a valid resolver, use it to compute the target from the
        //  target aspect.
        if (TP.isValid(resolver)) {
            target = TP.resolveAspectForTool(
                                    resolver,
                                    'inspector',
                                    targetAspect);
        }
    }

    info = TP.hc('targetObject', target, 'targetAspect', targetAspect);

    //  If the target is the inspector itself, build the root data, load up bay
    //  0 and return.
    if (target === this) {

        this.buildRootData();

        //  Populate bay 0
        info.atPut('bayIndex', 0);
        info.atPut('targetAspect', this.getID());

        this.traverseUsing(info);

        //  Listen for when we resize, either because something moved us like a
        //  drawer or because our document (window) resized.
        this.observe(this, 'TP.sig.DOMResize');
        this.observe(this.getDocument(), 'TP.sig.DOMResize');

        return this;
    }

    if (TP.isTrue(payload.at('addTargetAsRoot'))) {

        //  Add the target as a 'dynamic root' (if it's not already there).
        this.addDynamicRoot(target);

        this.selectItemNamedInBay(this.getItemLabel(target), 0);

        info.atPut('bayIndex', 1);

        //  Select the item (in bay 0) and populate bay 1
        this.traverseUsing(info);

        //  Now that we have more inspector items, obtain the list again.
        inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

    } else if (TP.isValid(resolver)) {


        if (TP.isNumber(currentBayIndex)) {
            info.atPut('bayIndex', currentBayIndex + 1);
        }

        this.traverseUsing(info);

        return this;
    } else if (TP.isEmpty(targetPath)) {

        //  We're not going to add as dynamic root, but try to traverse to
        //  instead.

        //  The first thing to do is to query all of the existing static roots
        //  and see if any of them can handle the target object.
        sourceEntries = this.get('sourceEntries');

        rootEntry = sourceEntries.detect(
                        function(kvPair) {
                            return kvPair.last().canHandle(target);
                        });

        if (TP.isValid(rootEntry)) {
            rootEntryResolver = rootEntry.last();
        }

        //  If we got a valid root entry (and the resolver for that entry is not
        //  the resolver we already have and isn't the inspector itself), then
        //  we query that object to see if it can produce a path.
        if (TP.isValid(rootEntryResolver) &&
            rootEntryResolver !== resolver &&
            resolver !== this) {

            targetPath = rootEntryResolver.getPathTo(target);

            //  Reset the target to the resolver - we've gotten the path to it
            //  now, so we need to start from the root resolved object
            target = rootEntryResolver;

            pathParts = targetPath.split(TP.SEPARATOR);
            rootBayItem = pathParts.shift();
            targetPath = pathParts.join(TP.SEPARATOR);

            this.selectItemNamedInBay(rootBayItem, 0);

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc(
                            'bayIndex', 1,
                            'targetAspect', rootBayItem,
                            'targetObject', target);
            this.traverseUsing(rootInfo);

            info.atPut('bayIndex', 2);

            //  Now that we have more inspector items, obtain the list again.
            inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

        } else {

            //  Otherwise, we couldn't find a bay to use to navigate our 'next
            //  segment', so let's try to add this as a 'rooted' target and
            //  navigate from there.
            info = TP.copy(payload);
            info.atPut('addTargetAsRoot', true);

            aSignal.setPayload(info);

            //  Note the recursive invocation of this method by calling
            //  'TP.handle' with 'this' as the handler. We don't want to
            //  invoke this method directly, because the mangled method name
            //  computed from a handler shouldn't really be hardcoded.
            return TP.handle(this, aSignal);
        }
    }

    if (TP.notEmpty(targetPath)) {

        pathSegments = targetPath.split(TP.SEPARATOR);

        for (i = 0; i < pathSegments.getSize(); i++) {

            //  If we have a valid bay at a spot one more than the path segment
            //  that we're processing for, then grab its resolver and try to
            //  traverse that segment.
            nextBay = inspectorItems.at(i + 1);

            if (TP.isValid(nextBay)) {
                resolver = nextBay.get('config').at('resolver');

                inspectorData =
                    TP.getDataForTool(
                        target,
                        'inspector',
                        TP.hc('targetAspect', targetAspect,
                                'pathParts',
                                    this.get('selectedItems').getValues()));

                targetAspect = pathSegments.at(i);

                //  Resolve the targetAspect to a target object
                target = TP.resolveAspectForTool(
                                resolver,
                                'inspector',
                                targetAspect);

                if (TP.notValid(target)) {
                    break;
                }

                if (TP.isEmpty(inspectorData) ||
                    !inspectorData.contains(targetAspect)) {
                    break;
                }

                this.selectItemNamedInBay(targetAspect, i + 1);

                info = TP.hc('targetObject', target,
                                'targetAspect', targetAspect,
                                'bayIndex', i + 2);

                this.traverseUsing(info);
            }
        }

    } else {

        if (TP.isNumber(currentBayIndex)) {
            info.atPut('bayIndex', currentBayIndex + 1);
        }

        this.traverseUsing(info);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('hasDynamicRoot',
function(target) {

    /**
     * @method hasDynamicRoot
     * @summary
     * @param
     * @returns {Boolean}
     */

    var dynamicEntries;

    dynamicEntries = this.get('dynamicContentEntries');

    //  Make sure that we don't already have the target in our list of dynamic
    //  entries.
    return dynamicEntries.contains(target, TP.IDENTITY);
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('removeItem',
function(anItem) {

    /**
     * @method removeItem
     * @summary
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var natItem;

    natItem = anItem.getNativeNode();
    TP.nodeDetach(natItem);

    //  TODO: Update inspector's bay / resolver data to remove bay data for item.

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('removeItemsAfter',
function(startItem) {

    /**
     * @method removeItemsAfter
     * @summary
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var existingItems,

        startIndex,

        len,
        i;

    existingItems = TP.byCSSPath('sherpa|inspectoritem', this);

    startIndex = existingItems.indexOf(startItem, TP.IDENTITY);

    len = existingItems.getSize();
    for (i = startIndex + 1; i < len; i++) {
        this.removeItem(existingItems.at(i));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('replaceItemContent',
function(item, itemContent, itemConfig) {

    /**
     * @method replaceItemContent
     * @summary
     * @param
     * @param
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var content;

    this.removeItemsAfter(item);

    content = item.setContent(itemContent);
    content.awaken();

    this.configureItem(item, itemConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('scrollBy',
function(direction) {

    /**
     * @method scrollBy
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var currentFirstVisiblePosition,

        currentItem,

        inspectorItems,
        desiredItem;

    currentFirstVisiblePosition = this.get('currentFirstVisiblePosition');
    currentItem = this.getItemFromSlotPosition(currentFirstVisiblePosition);

    inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

    if (direction === TP.LEFT) {
        desiredItem = inspectorItems.before(currentItem, TP.IDENTITY);
    } else if (direction === TP.RIGHT) {
        desiredItem = inspectorItems.after(currentItem, TP.IDENTITY);
    }

    this.scrollItemToFirstVisiblePosition(desiredItem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('scrollItemsToEnd',
function() {

    /**
     * @method scrollItemsToEnd
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var totalSlotCount,
        firstVisibleSlotPosition;

    totalSlotCount = this.get('totalSlotCount');

    if (totalSlotCount <= this.get('visibleSlotCount')) {
        firstVisibleSlotPosition = 0;
    } else {
        firstVisibleSlotPosition = totalSlotCount - this.get('visibleSlotCount');
    }

    this.scrollItemToFirstVisiblePosition(
            this.getItemFromSlotPosition(firstVisibleSlotPosition),
            TP.LEFT);

    this.set('currentFirstVisiblePosition', firstVisibleSlotPosition);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('scrollItemToFirstVisiblePosition',
function(item, aDirection) {

    /**
     * @method scrollItemToFirstVisiblePosition
     * @summary
     * @param
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var totalSlotCount,
        visibleSlotCount,

        currentFirstVisiblePosition,
        desiredFirstVisiblePosition,
        inspectorElem,

        inspectorItems,
        i,
        widthAccum,

        currentLastVisiblePosition,

        direction,

        lastVisibleItem,
        itemOffsetWidth;

    //  Grab the number of total and visible slots
    totalSlotCount = this.get('totalSlotCount');
    visibleSlotCount = this.get('visibleSlotCount');

    //  If they're the same, we can exit here - there's no scrolling to be done.
    if (totalSlotCount <= visibleSlotCount) {

        //  We still may have to update the scroll buttons as this call might
        //  have happened because the user resized the window.
        this.updateScrollButtons();

        return this;
    }

    //  Grab both the current and desired 'first visible position'.
    currentFirstVisiblePosition = this.get('currentFirstVisiblePosition');
    desiredFirstVisiblePosition = this.getSlotPositionFromItem(item);

    inspectorElem = this.getNativeNode();

    //  If they're equal, then may just need to adjust the scrolling, as this
    //  call might have happened because the user resized the window.
    if (currentFirstVisiblePosition === desiredFirstVisiblePosition) {

        inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

        //  Accumulate all of the widths.
        widthAccum = 0;
        for (i = 0; i < desiredFirstVisiblePosition; i++) {
            widthAccum += inspectorItems.at(i).getWidth();
        }

        inspectorElem.scrollLeft = widthAccum;

        //  Make sure to update the scroll buttons :-).
        this.updateScrollButtons();

        return this;
    }

    //  Compute the 'current last visible position.
    currentLastVisiblePosition = currentFirstVisiblePosition + visibleSlotCount;

    //  Make sure that it's always one less than the total slot count.
    if (currentLastVisiblePosition >= totalSlotCount) {
        currentLastVisiblePosition = totalSlotCount - 1;
    }

    //  If the desired position is less than the current position, then move to
    //  the right.
    if (desiredFirstVisiblePosition < currentFirstVisiblePosition) {
        direction = TP.ifInvalid(aDirection, TP.RIGHT);

        //  We need compare to the bay that is second to last, in this case.
        currentLastVisiblePosition -= 1;
    } else if (desiredFirstVisiblePosition > currentFirstVisiblePosition) {
        direction = TP.ifInvalid(aDirection, TP.LEFT);
    } else {
        direction = TP.ifInvalid(aDirection, TP.LEFT);
    }

    //  Grab the item that is at the last slot position. We'll be adjusting by
    //  its width.
    lastVisibleItem = this.getItemFromSlotPosition(currentLastVisiblePosition);

    //  And it's width.
    itemOffsetWidth = lastVisibleItem.getWidth();

    if (direction === TP.LEFT) {
        inspectorElem.scrollLeft += itemOffsetWidth;
    } else if (direction === TP.RIGHT) {
        inspectorElem.scrollLeft -= itemOffsetWidth;
    }

    //  Set the current first visible position to what we just scrolled to.
    this.set('currentFirstVisiblePosition', desiredFirstVisiblePosition);

    //  Make sure to update the scroll buttons :-).
    this.updateScrollButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('updateScrollButtons',
function() {

    var arrows;

    arrows = TP.byCSSPath(
                'sherpa|scrollbutton',
                TP.unwrap(TP.byId('SherpaWorkbench', this.getNativeWindow())),
                false,
                true);

    arrows.forEach(
            function(anArrow) {
                anArrow.updateForScrollingContent();
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('selectItemNamedInBay',
function(itemName, bayNum) {

    /**
     * @method selectItemNamedInBay
     * @summary
     * @param
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var inspectorItems;

    if (TP.notEmpty(inspectorItems =
                    TP.byCSSPath('sherpa|inspectoritem > *', this))) {

        //  This will have already been re-rendered because of data binding,
        //  but we need to select what the new item will be.
        inspectorItems.at(bayNum).select(itemName);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var formattedContentMaxLength,

        generateFormattedContentElement,

        sourceObj,

        isSetup,
        navlists;

    formattedContentMaxLength = 25000;

    //  ---

    generateFormattedContentElement = function(aContent) {

        var str,
            result,
            inspectorElem;

        str = TP.str(aContent);
        if (str.getSize() > formattedContentMaxLength) {
            result = str.asEscapedXML();
        } else {
            if (TP.notEmpty(aContent)) {
                result = TP.sherpa.pp.fromString(aContent);
            }
        }

        inspectorElem = TP.xhtmlnode(
                '<div class="cm-s-elegant scrollable wrapped select">' +
                    result +
                '</div>');

        return inspectorElem;
    };

    //  ---
    //  Set up roots
    //  ---

    sourceObj = TP.sherpa.InspectorSource.construct();
    this.addSource(TP.ac('TIBET'), sourceObj);

    sourceObj = TP.sherpa.InspectorSource.construct();
    this.addSource(TP.ac('Remote Data Sources'), sourceObj);

    //  ---
    //  Add TIBET sources
    //  ---

    sourceObj = TP.sherpa.InspectorSource.construct();
    sourceObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.sys.cfg(aProperty);
            });
    sourceObj.defineMethod(
            'getContentForEditor',
            function(options) {

                var result,
                    inspectorElem;

                result = this.get(options.at('targetAspect'));
                inspectorElem = generateFormattedContentElement(result);

                return inspectorElem;
            });
    sourceObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.sys.cfg().getKeys().sort();
            });
    sourceObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    this.addSource(TP.ac('TIBET', 'Config'), sourceObj);

    //  ---

    sourceObj = TP.sherpa.InspectorSource.construct();
    sourceObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.str(top.localStorage[aProperty]);
            });
    sourceObj.defineMethod(
            'getContentForEditor',
            function(options) {

                var result,
                    inspectorElem;

                result = this.get(options.at('targetAspect'));
                inspectorElem = generateFormattedContentElement(result);

                return inspectorElem;
            });
    sourceObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.keys(top.localStorage);
            });
    sourceObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    this.addSource(TP.ac('TIBET', 'Local Storage'), sourceObj);

    //  ---

    sourceObj = TP.sherpa.InspectorSource.construct();
    sourceObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.str(top.sessionStorage[aProperty]);
            });
    sourceObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.keys(top.sessionStorage);
            });
    sourceObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    this.addSource(TP.ac('TIBET', 'Session Storage'), sourceObj);

    //  ---

    sourceObj = TP.sherpa.InspectorSource.construct();
    sourceObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.json(TP.sig.SignalMap.interests[aProperty]);
            });
    sourceObj.defineMethod(
            'getContentForEditor',
            function(options) {

                var result,
                    inspectorElem;

                result = this.get(options.at('targetAspect'));
                inspectorElem = generateFormattedContentElement(result);

                return inspectorElem;
            });
    sourceObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.keys(TP.sig.SignalMap.interests).sort();
            });
    sourceObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    this.addSource(TP.ac('TIBET', 'Signal Map'), sourceObj);

    //  ---

    sourceObj = TP.sherpa.InspectorSource.construct();
    sourceObj.defineMethod(
            'canHandle',
            function(anObject) {
                return TP.isType(anObject);
            });
    sourceObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.sys.getCustomTypes().at(aProperty);
            });
    sourceObj.defineMethod(
            'getDataForInspector',
            function(options) {
                var customTypeNames;

                customTypeNames = TP.sys.getCustomTypeNames().sort();
                customTypeNames.isOriginSet(false);

                return customTypeNames;
            });
    sourceObj.defineMethod(
            'getPathTo',
            function(anObject) {
                return 'Types' + TP.SEPARATOR + TP.name(anObject);
            });
    sourceObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return TP.sys.getTypeByName(anAspect);
            });
    this.addSource(TP.ac('TIBET', 'Types'), sourceObj);

    //  ---

    sourceObj = TP.sherpa.InspectorSource.construct();
    sourceObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.core.URI.get('instances').
                                at(aProperty).getResource().get('result');
            });

    sourceObj.defineMethod(
            'getConfigForInspector',
            function(options) {
                var targetAspect;

                targetAspect = options.at('targetAspect');

                options.atPut(TP.ATTR + '_contenttype', 'html:div');
                if (targetAspect !== this.getID()) {
                    options.atPut(TP.ATTR + '_class', 'doublewide');
                }

                return options;
            });

    sourceObj.defineMethod(
            'getContentForEditor',
            function(options) {

                var result,
                    str,
                    inspectorElem;

                result = this.get(options.at('targetAspect'));
                if (TP.isValid(result)) {
                    str = TP.str(result);
                    if (str.getSize() > formattedContentMaxLength) {
                        result = str.asEscapedXML();
                    } else {
                        if (TP.isKindOf(result, TP.core.CSSStyleSheet)) {
                            result = '<span class="sherpa_pp String">' +
                                        TP.sherpa.pp.runCSSModeOn(result) +
                                        '</span>';
                        } else if (TP.isKindOf(result, TP.core.XMLContent) ||
                                    TP.isKindOf(result, TP.core.Node)) {
                            result = '<span class="sherpa_pp String">' +
                                        TP.sherpa.pp.runXMLModeOn(result) +
                                        '</span>';
                        } else if (TP.isKindOf(result, TP.core.JSONContent)) {
                            result = '<span class="sherpa_pp String">' +
                                        TP.sherpa.pp.runJSONModeOn(result) +
                                        '</span>';
                        } else {
                            result = TP.sherpa.pp.fromString(result);
                        }
                    }
                }

                if (TP.notEmpty(result)) {
                    inspectorElem = TP.xhtmlnode(
                        '<div class="cm-s-elegant scrollable wrapped select">' +
                            result +
                        '</div>');
                }

                //  If we didn't get a valid inspector node, then we can't
                //  display the content
                if (!TP.isElement(inspectorElem)) {
                    inspectorElem = TP.xhtmlnode(
                            '<div class="cm-s-elegant">' +
                                'Unable to display URI content' +
                            '</div>');
                }

                return inspectorElem;
            });
    sourceObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.keys(TP.core.URI.get('instances')).sort();
            });
    sourceObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    this.addSource(TP.ac('TIBET', 'URIs'), sourceObj);

    //  ---
    //  Other instance data/handlers
    //  ---

    this.set('dynamicContentEntries', TP.ac());

    this.set('selectedItems', TP.hc());

    isSetup = false;

    if (!isSetup) {
        this.signal('FocusInspectorForBrowsing', TP.hc('targetObject', this));
        isSetup = true;
    } else {
        navlists = TP.byCSSPath('sherpa|navlist', this);
        navlists.forEach(
                function(aNavList) {
                    aNavList.render();
                });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('sizeItems',
function() {

    /**
     * @method sizeItems
     * @summary Resizes the inspector items to fit within an even number of
     *     visible slots.
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var inspectorItems,

        totalSlotCount,

        multipliers,

        minItemCount,

        inspectorStyleVals,
        visibleInspectorWidth,

        initialSlotWidth,
        definiteSlotMinWidth,

        scannedItemMinWidth,

        visibleSlotCount,

        finalSlotWidth,
        finalVisibleInspectorWidth,

        widthDifference,
        perSlotShimWidth,

        firstVisibleSlotPosition,

        accumWidth;

    inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

    //  We initialize the slot count with the number of inspector items. This
    //  makes the assumption that each one is only 1 'slot' wide. We'll loop
    //  over them below to adjust that assumption.
    totalSlotCount = inspectorItems.getSize();

    multipliers = TP.ac();

    scannedItemMinWidth = 0;

    //  Iterate over all of the inspector items, detecting both their 'slot'
    //  width and if they have any minimum CSS width that they need.
    inspectorItems.forEach(
            function(anItem) {

                var itemElem,
                    computedStyleObj,

                    multiplier,

                    minWidth;

                //  Grab the item's computed style object.
                itemElem = TP.unwrap(anItem);
                computedStyleObj = TP.elementGetComputedStyleObj(itemElem);

                //  The 'slot width' multiplier is contained in a custom CSS
                //  property.
                multiplier = computedStyleObj.getPropertyValue(
                                            '--sherpa-inspector-width');

                //  If the multiplier value was real, then convert it to a
                //  Number and add it to the total slot count (after subtracting
                //  1, since our calculations later already assume a '1' width
                //  per slot
                if (TP.notEmpty(multiplier)) {
                    multiplier = multiplier.asNumber();
                    totalSlotCount += multiplier - 1;
                    multipliers.push(multiplier);
                } else {
                    //  Otherwise, no value was found, so we represent this item
                    //  with a slot width of '1'
                    multipliers.push(1);
                }

                //  Obtain the pixel value of any minimum width for this item.
                minWidth = TP.elementGetPixelValue(
                                itemElem,
                                computedStyleObj.minWidth);

                if (!TP.isNaN(minWidth)) {
                    scannedItemMinWidth = scannedItemMinWidth.max(minWidth);
                }
            });

    //  If no minimum value width could be computed from scanning the items,
    //  grab the default one from a cfg() variable.
    if (scannedItemMinWidth === 0) {
        scannedItemMinWidth = TP.sys.cfg(
                                'sherpa.inspector.min_item_width', 2000);
    }

    //  The minimum number of inspector items 'across' when computing bay
    //  widths, etc. So even if there's one 1 bay populated, this will cause the
    //  overall width to be divided by this value (3rds by default).
    minItemCount = TP.sys.cfg('sherpa.inspector.min_item_count', 3);

    //  The number of *total* slots (including those hidden by scrolling) is the
    //  actual number of slots as computed above or the minimum item count,
    //  whichever is greater.
    totalSlotCount = totalSlotCount.max(minItemCount);

    //  Compute the *visible* width of the inspector.

    //  We need to subtract off the left and right border.
    inspectorStyleVals = TP.elementGetStyleValuesInPixels(
                            this.getNativeNode(),
                            TP.ac('borderLeftWidth', 'borderRightWidth'));

    //  Now take the overall (offset) width of the inspector and subtract those
    //  borders.
    visibleInspectorWidth = this.getWidth() -
                            (inspectorStyleVals.at('borderLeftWidth') +
                            inspectorStyleVals.at('borderRightWidth'));

    //  The *initial* slot width is computed by dividing the overall visible
    //  inspector width by the total number of 'slots' and rounding down.
    initialSlotWidth = (visibleInspectorWidth / totalSlotCount).floor();

    //  Now we compute a *definite* slot minimum width by using the initial slot
    //  width we computed or the scanned item minimum width, whichever is
    //  greater.
    definiteSlotMinWidth = initialSlotWidth.max(scannedItemMinWidth);

    //  The number of visible slots is computed by divided the *visible* width
    //  of the inspector and dividing by the definite slot minimum width (and
    //  rounding down).
    visibleSlotCount = (visibleInspectorWidth / definiteSlotMinWidth).floor();
    this.set('visibleSlotCount', visibleSlotCount);

    //  The final slot width is computed by dividing the visible width of the
    //  inspector by the number of visible slots (and rounding down). This gives
    //  us the width of each slot as if an exact number of slots could fit into
    //  the inspector with no scrolling.
    finalSlotWidth = (visibleInspectorWidth / visibleSlotCount).floor();

    //  Now we compute the 'final' visible inspector width by taking the number
    //  of visible slots and multiplying it by the final computed slot width.
    //  This will give us the width of the inspector if the slots fit exactly on
    //  the boundaries.
    finalVisibleInspectorWidth = visibleSlotCount * finalSlotWidth;

    //  Since it's highly unlikely that an exact number of slots could fit into
    //  the visible width of the inspector (unless it's *exactly* wide enough to
    //  fit them), there will be an overlap difference.
    widthDifference = visibleInspectorWidth - finalVisibleInspectorWidth;

    //  There will a 'per slot' shim width that we need to add to each slot.
    //  Compute that here.
    perSlotShimWidth = widthDifference / visibleSlotCount;
    finalSlotWidth += perSlotShimWidth;

    //  Grab the position of the currently 'first visible' slot.
    firstVisibleSlotPosition = this.get('currentFirstVisiblePosition');

    //  If it doesn't exist, initialize it to the total number of slots minus
    //  the number of visible slots
    if (!TP.isNumber(firstVisibleSlotPosition)) {
        firstVisibleSlotPosition = totalSlotCount - visibleSlotCount;
        this.set('currentFirstVisiblePosition', firstVisibleSlotPosition);
    }

    //  Now we have to adjust the item bay widths based on their multipliers
    //  (which we captured in an Array above). Note that we also keep an
    //  'accumulated width' here so that we can do 'first visible slot'
    //  adjustments afterwards.
    accumWidth = 0;

    inspectorItems.forEach(
            function(anBay, index) {

                var width;

                width = finalSlotWidth * multipliers.at(index);
                anBay.setWidth(width);

                //  If the item's index is greater than or equal to the position
                //  of the first visible slot, then it exists within the set of
                //  visible slots and we need to add it's width to the
                //  accumulated width.
                if (index >= firstVisibleSlotPosition) {
                    accumWidth += width;
                }
            });

    //  If the accumulated width is greater than or equal to the visible
    //  inspector width (and there is more than 1 slot), then increment the
    //  first visible slot's position.
    if (accumWidth >= visibleInspectorWidth && visibleSlotCount > 1) {
        firstVisibleSlotPosition += 1;
        this.set('currentFirstVisiblePosition', firstVisibleSlotPosition);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('traverseUsing',
function(info) {

    /**
     * @method traverseUsing
     * @summary
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var target,
        aspect,

        bayConfig,

        selectedItems,

        newBayNum,

        i,
        entryKey,
        entry,

        bindLoc,

        bayContent,

        existingItems;

    target = info.at('targetObject');
    aspect = info.at('targetAspect');

    if (TP.notValid(target)) {
        TP.error('Invalid inspector target: ' + target);

        return this;
    }

    selectedItems = this.get('selectedItems');

    //  We need to do this first since we need to add the aspect before we make
    //  the call to get the configuration.
    newBayNum = info.at('bayIndex');
    if (newBayNum > 0) {
        selectedItems.atPut(newBayNum - 1, aspect);

        //  'Trim off' any selected items from newBayNum forward. This is
        //  because we might have 'selected back' and we don't want old data
        //  here.
        for (i = newBayNum; ; i++) {

            entryKey = i.toString();
            entry = selectedItems.at(entryKey);
            if (TP.notValid(entry)) {
                break;
            }

            selectedItems.removeKey(entryKey);
        }
    }

    bayConfig = TP.getConfigForTool(
                target,
                'inspector',
                TP.hc('targetAspect', aspect,
                        'target', target,
                        'pathParts', selectedItems.getValues()));

    bayConfig.atPutIfAbsent('resolver', target);

    bindLoc = 'urn:tibet:sherpa_bay_' + newBayNum;

    bayContent = TP.getContentForTool(
                target,
                'inspector',
                TP.hc('bindLoc', bindLoc,
                        'targetAspect', aspect,
                        'target', target,
                        'pathParts', selectedItems.getValues()));

    if (!TP.isElement(bayContent)) {
        return this;
    }

    existingItems = TP.byCSSPath('sherpa|inspectoritem', this);
    if (existingItems.getSize() > newBayNum) {

        this.replaceItemContent(
                    existingItems.at(newBayNum), bayContent, bayConfig);

    } else {
        //  Add bay
        this.addItem(bayContent, bayConfig);
    }

    //  Signal changed on the URI that we're using as our data source. The bay
    //  content should've configured itself to observe this data when awoken.
    if (TP.notEmpty(bindLoc)) {
        TP.uc(bindLoc).$changed();
    }

    this.sizeItems();

    this.scrollItemsToEnd();

    return this;
});

//  ------------------------------------------------------------------------
//  TP.sherpa.ToolAPI Methods
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method
     * @summary
     * @param
     * @returns {Element}
     */

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<sherpa:navlist bind:in="' + dataURI.asString() + '"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('getDataForInspector',
function(options) {

    var entries,
        data,
        hash;

    entries = this.get('dynamicContentEntries');
    data = entries.collect(
                function(entry) {
                    return TP.ac(this.getItemLabel(entry), TP.id(entry));
                }.bind(this));

    hash = this.get('sourceEntries');
    hash.getKeys().sort().perform(
                function(aKey) {
                    data.add(TP.ac(aKey, aKey));
                });

    return data;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary
     * @param
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var target,
        dynamicContentEntries,
        sourceEntries;

    dynamicContentEntries = this.get('dynamicContentEntries');
    target = dynamicContentEntries.detect(
                    function(anItem) {
                        return TP.id(anItem) === anAspect;
                    });

    if (TP.notValid(target)) {
        sourceEntries = this.get('sourceEntries');
        target = sourceEntries.at(anAspect);
    }

    if (TP.notValid(target)) {
        target = TP.bySystemId(anAspect);
    }

    if (TP.notValid(target)) {
        target = TP.bySystemId('TSH').resolveObjectReference(
                                                anAspect, TP.request());
    }

    return target;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
