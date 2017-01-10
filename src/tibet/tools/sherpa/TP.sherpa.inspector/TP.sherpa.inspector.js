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

    /* eslint-disable consistent-this */

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

    /* eslint-enable consistent-this */

    return;
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

TP.sherpa.InspectorSource.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
     * @summary
     * @returns
     */

    var targetAspect;

    targetAspect = options.at('targetAspect');

    //  Note here how we use '$get()' rather than 'get()'. This is because many
    //  subtypes or instances of these objects will override 'get()' and we
    //  don't want to have them have to test against this there.
    if (targetAspect === this.$get('sourceName')) {
        options.atPut(TP.ATTR + '_contenttype', 'sherpa:navlist');
    } else {
        options.atPut(TP.ATTR + '_contenttype', 'html:div');
    }

    return options;
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

TP.sherpa.InspectorSource.Inst.defineMethod('getSource',
function(sourceParts, sourceHandler) {

    var resolver,

        len,

        i;

    /* eslint-disable consistent-this */

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

    /* eslint-enable consistent-this */
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

    path = TP.PATH_START + pathParts.join(TP.PATH_SEP) + TP.PATH_END;

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

    return null;
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
                                        'getConfigForInspectorFor',
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

    var data,
        dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    data = this.getDataForInspector(options);
    dataURI.setResource(data, TP.request('signalChange', false));

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getContentForInspectorFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineMethod('getContentForToolbar',
function(options) {

    /**
     * @method getContentForToolbar
     * @summary
     * @returns
     */

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getContentForToolbarFor',
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
                                        'getDataForInspectorFor',
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
                TP.rc('^' +
                        TP.PATH_START + regExpParts.join('') + TP.PATH_END +
                        '$'),
                regExpParts.getSize()));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary
     * @returns
     */

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
//  Type Constants
//  ------------------------------------------------------------------------

//  Path aliases for use in the system
TP.sherpa.inspector.Type.defineConstant(
    'ALIASES', TP.hc(
        '_TYPES_', TP.ac('TIBET', 'Types'),
        '_URIS_', TP.ac('TIBET', 'URIs')
    ));

//  Commonly used options
TP.sherpa.inspector.Type.defineConstant(
    'OPTIONS', TP.ac(
        TP.ATTR + '_contenttype',
        TP.ATTR + '_class'
    ));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineAttribute(
    'container', {
        value: TP.cpc('> .content', TP.hc('shouldCollapse', true))
    });

TP.sherpa.inspector.Inst.defineAttribute('$haloAddedTarget');

TP.sherpa.inspector.Inst.defineAttribute('dynamicContentEntries');

TP.sherpa.inspector.Inst.defineAttribute('selectedItems');

TP.sherpa.inspector.Inst.defineAttribute('totalSlotCount');
TP.sherpa.inspector.Inst.defineAttribute('visibleSlotCount');

TP.sherpa.inspector.Inst.defineAttribute('currentFirstVisiblePosition');

TP.sherpa.inspector.Inst.defineAttribute('pathStack');
TP.sherpa.inspector.Inst.defineAttribute('pathStackIndex');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Type.defineMethod('buildPath',
function() {

    /**
     * @method buildPath
     * @summary
     * @param {String} varargs 0 to N variable args to put together to form a
     *     path.
     * @returns {String} The initialized instance.
     */

    var args,
        pathParts;

    args = TP.args(arguments);

    pathParts = this.resolvePathAliases(args);

    return pathParts.join(TP.PATH_SEP);
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Type.defineMethod('resolvePathAliases',
function(pathParts) {

    var methodInfo,
        methodParts,

        methodName,
        trackName,
        typeName,

        newPathParts,

        aliases,

        i,
        pathPart;

    if (TP.isEmpty(pathParts)) {
        return pathParts;
    }

    if (pathParts.first() === '_METHOD_') {

        methodInfo = pathParts.last();
        methodParts = methodInfo.split('.');

        methodName = TP.rc('^' + TP.regExpEscape(methodParts.last()));

        if (/Inst\./.test(methodInfo)) {
            trackName = 'Instance Methods';
            typeName = methodParts.slice(0, -2).join('.');
        } else if (/Type\./.test(methodInfo)) {
            trackName = 'Type Methods';
            typeName = methodParts.slice(0, -2).join('.');
        } else {
            trackName = '';
            typeName = methodParts.slice(0, -1).join('.');
        }

        newPathParts = TP.ac('TIBET', 'Types', typeName, trackName, methodName);
    } else {
        newPathParts = TP.ac();

        aliases = this.ALIASES;

        for (i = 0; i < pathParts.getSize(); i++) {

            pathPart = pathParts.at(i);

            if (aliases.hasKey(pathPart)) {
                newPathParts.push(aliases.at(pathPart));
            } else {
                newPathParts.push(pathPart);
            }
        }

        newPathParts = newPathParts.flatten();
    }

    return newPathParts;
});

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

    this.$set('pathStack', TP.ac(), false);
    this.$set('pathStackIndex', -1, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('addDynamicRoot',
function(target, forceRefresh) {

    /**
     * @method addDynamicRoot
     * @summary
     * @param
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    //  TODO: Update root with label config - look for it in the current list.
    //  If it's there, we should highlight it. Otherwise, add to the 'recents'
    //  part of the list (a LIFO queue with a 'sherpa.inspector.recent_max'
    //  count).

    var dynamicEntries;

    dynamicEntries = this.get('dynamicContentEntries');

    //  If the halo currently added the target, then we don't have to modify the
    //  dynamic entries or refresh the root data entries, but we do have to flip
    //  this flag so that when the halo blurs this target, it doesn't remove it.
    if (this.get('$haloAddedTarget')) {
        this.set('$haloAddedTarget', false);
        return this;
    }

    //  Make sure that we don't already have the target in our list of dynamic
    //  entries.
    if (!dynamicEntries.contains(target, TP.IDENTITY)) {

        //  Wasn't found - add it and rebuild the root data.
        dynamicEntries.unshift(target);
        this.buildRootData();

    } else if (forceRefresh) {
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

    var commonOptions,
        itemConfigKeys;

    itemConfigKeys = itemConfig.getKeys();

    commonOptions = this.getType().OPTIONS;
    commonOptions.forEach(
            function(aKey) {
                if (aKey.startsWith(TP.ATTR + '_') &&
                    itemConfigKeys.indexOf(aKey.slice(5)) === TP.NOT_FOUND) {
                    item.removeAttribute(aKey.slice(5));
                }
            });

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

TP.sherpa.inspector.Inst.defineMethod('focusInspectorOnHome',
function() {

    /**
     * @method focusInspectorOnHome
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var info;

    info = TP.hc('targetObject', this,
                    'targetAspect', this.getID(),
                    'bayIndex', 0);

    this.traverseUsing(info, false);

    this.get('selectedItems').empty();

    this.signal('InspectorDidFocus');

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

    var sourceName;

    if (TP.canInvoke(anItem, 'getSherpaInspectorLabel')) {
        return anItem.getSherpaInspectorLabel();
    }

    if (TP.isMethod(anItem)) {
        return anItem[TP.DISPLAY];
    }

    if (TP.isElement(anItem) || TP.isKindOf(anItem, TP.core.ElementNode)) {
        return TP.name(anItem) + ' - #' + TP.lid(anItem);
    }

    sourceName = anItem.get('sourceName');
    if (TP.notEmpty(sourceName)) {
        return sourceName;
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

TP.sherpa.inspector.Inst.defineHandler('MethodAdded',
function(aSignal) {

    //  Not supplying a bay number to refresh will cause the current bay to
    //  refresh.
    this.refreshBay();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('TypeAdded',
function(aSignal) {

    //  Not supplying a bay number to refresh will cause the current bay to
    //  refresh.
    this.refreshBay();

    return this;
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

    var inspectorItem,
        tpDetachingContent,

        srcID,
        tileID,

        tileTPElem,
        tileBody,

        newInspectorItemContent;

    inspectorItem = TP.byCSSPath('sherpa|inspectoritem', this).last();

    tpDetachingContent = inspectorItem.getFirstChildElement();

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

    TP.nodeAppendChild(
            tileBody.getNativeNode(),
            TP.unwrap(tpDetachingContent),
            false);

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

TP.sherpa.inspector.Inst.defineHandler('BreadcrumbSelected',
function(aSignal) {

    /**
     * @method handleBreadcrumbSelected
     * @summary
     * @param {TP.sig.BreadcrumbSelected} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var items;

    items = aSignal.at('items');

    if (TP.notEmpty(items)) {
        this.traversePath(items);
        this.signal('InspectorDidFocus');
    }

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

        initialSelectedItemValues,

        resolver,

        info,

        dynamicContentEntries,

        haloDidAddTarget,

        sourceEntries,
        rootEntryResolver,
        rootBayItem,

        originalPathParts,
        pathParts,
        rootInfo,

        i,

        nextBay,

        historyPathParts;

    inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

    payload = aSignal.getPayload();

    targetAspect = payload.at('targetAspect');
    target = payload.at('targetObject');
    targetPath = payload.at('targetPath');

    initialSelectedItemValues = this.get('selectedItems').getValues();

    //  If the path is already selected, then we're already there - exit early.
    if (TP.notEmpty(initialSelectedItemValues) &&
        initialSelectedItemValues.join(TP.PATH_SEP) === targetPath) {
        return this;
    }

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
                        targetAspect,
                        TP.hc('pathParts',
                                this.get('selectedItems').getValues()));
        }

        if (target === TP.BREAK) {
            return this;
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

        this.signal('InspectorDidFocus');

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

        //  Resolve the targetAspect to a target object
        target = TP.resolveAspectForTool(
                        resolver,
                        'inspector',
                        targetAspect,
                        TP.hc('pathParts',
                                this.get('selectedItems').getValues()));

        info.atPut('targetObject', target);

        this.traverseUsing(info);

        this.signal('InspectorDidFocus');

        return this;
    } else if (TP.isEmpty(targetPath)) {

        //  We're not going to add as dynamic root, but try to traverse to
        //  instead.

        //  First, see if the target can produce a path that we can try.
        originalPathParts = TP.getPathPartsForTool(
                                target,
                                'Inspector',
                                TP.hc('pathParts',
                                        this.get('selectedItems').getValues()));

        //  If any of these path parts returned an alias, look it up here.
        pathParts = this.getType().resolvePathAliases(originalPathParts);

        //  Compute the root resolver

        //  First, try the dynamic entries

        dynamicContentEntries = this.get('dynamicContentEntries');

        //  See if we've already got the root resolver as a current dynamic
        //  root.
        rootEntryResolver = dynamicContentEntries.detect(
                            function(anItem) {
                                return TP.id(anItem) === pathParts.first();
                            });

        if (TP.notValid(rootEntryResolver)) {
            sourceEntries = this.get('sourceEntries');
            rootEntryResolver = sourceEntries.at(pathParts.first());
        }

        //  If we got a valid root resolver entry
        if (TP.isValid(rootEntryResolver)) {

            //  Reset the target to the resolver - we've gotten the path to it
            //  now, so we need to start from the root resolved object
            target = rootEntryResolver;

            rootBayItem = pathParts.shift();
            targetPath = pathParts.join(TP.PATH_SEP);

            this.selectItemNamedInBay(this.getItemLabel(target), 0);

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', target);
            this.traverseUsing(rootInfo);

            //  If there were no more segments to the path, then just exit here.
            if (TP.isEmpty(targetPath)) {
                return this;
            }

            info.atPut('targetPath', targetPath);

            //  We computed a target path and navigated the first bay. We need
            //  to reset the target aspect to be the first item of the remaining
            //  path
            info.atPut('targetAspect', targetPath.first());

            info.atPut('bayIndex', 2);

            //  Now that we have more inspector items, obtain the list again.
            inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

        } else {
            //  No root resolver - can't go any further
            return this;
        }
    } else if (TP.notValid(target) && TP.notEmpty(targetPath)) {

        pathParts = targetPath.split(TP.PATH_SEP);

        //  If any of these path parts returned an alias, look it up here.
        pathParts = this.getType().resolvePathAliases(pathParts);

        //  Compute the target

        //  First, try the dynamic entries

        dynamicContentEntries = this.get('dynamicContentEntries');

        //  See if we've already got the target as a current dynamic root.
        target = dynamicContentEntries.detect(
                        function(anItem) {
                            return TP.id(anItem) === pathParts.first();
                        });

        //  If not, see if we can find the target somewhere in the system.
        //  Because the 'path' that gets bookmarked when a dynamic root is
        //  bookmarked is the target's global ID, we can use TP.bySystemId() to
        //  see if the target can be found somewhere in the system.

        if (TP.notValid(target)) {
            target = TP.bySystemId(pathParts.first());

            //  If we found a valid target, add it as a dynamic root. It is now
            //  available for the rest of the session.
            if (TP.isValid(target)) {

                //  For now, we flip this flag to false since if there's another
                //  object that has been halo'ed on and the halo has added that
                //  reference to the root bays, the call to 'addDynamicRoot'
                //  will flip this flag false and just return - which is
                //  definitely not what we want.
                haloDidAddTarget = this.get('$haloAddedTarget');
                this.set('$haloAddedTarget', false);

                this.addDynamicRoot(target);

                this.set('$haloAddedTarget', haloDidAddTarget);
            }
        }

        //  If we got a valid target
        if (TP.isValid(target)) {

            rootBayItem = pathParts.shift();
            targetPath = null;

            this.selectItemNamedInBay(this.getItemLabel(target), 0);

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', target);
            this.traverseUsing(rootInfo, false);

            info.atPut('bayIndex', 2);

            //  Now that we have more inspector items, obtain the list again.
            inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

        } else {

            //  Second, try the static root entries

            //  Get the root resolver
            sourceEntries = this.get('sourceEntries');
            rootEntryResolver = sourceEntries.at(pathParts.first());

            //  If we got a valid root resolver entry
            if (TP.isValid(rootEntryResolver)) {

                //  Reset the target to the resolver - we've gotten the path to it
                //  now, so we need to start from the root resolved object
                target = rootEntryResolver;

                rootBayItem = pathParts.shift();
                targetPath = pathParts.join(TP.PATH_SEP);

                this.selectItemNamedInBay(rootBayItem, 0);

                //  Select the item (in bay 0) and populate bay 1
                rootInfo = TP.hc('bayIndex', 1,
                                    'targetAspect', rootBayItem,
                                    'targetObject', target);
                this.traverseUsing(rootInfo, false);

                info.atPut('bayIndex', 2);

                //  Now that we have more inspector items, obtain the list again.
                inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);
            }
        }
    }

    if (TP.notEmpty(targetPath)) {

        if (TP.isEmpty(pathParts)) {
            pathParts = targetPath.split(TP.PATH_SEP);
        }

        //  If the first path part is '__TARGET__', then we compute a path to
        //  the target object and replace that entry with it.
        if (pathParts.first() === '__TARGET__') {

            originalPathParts = TP.getPathPartsForTool(
                                target,
                                'Inspector',
                                TP.hc('pathParts',
                                        this.get('selectedItems').getValues()));

            //  Replace the entry by slicing off the '__TARGET__' entry and
            //  appending that to the computed path parts.
            if (TP.notEmpty(originalPathParts)) {
                pathParts = originalPathParts.concat(pathParts.slice(1));
            }

            rootBayItem = pathParts.shift();

            this.selectItemNamedInBay(this.getItemLabel(target), 0);

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', target);
            this.traverseUsing(rootInfo, false);

            //  Now that we have more inspector items, obtain the list again.
            inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);
        }

        //  If any of these path parts returned an alias, look it up here.
        pathParts = this.getType().resolvePathAliases(pathParts);

        for (i = 0; i < pathParts.getSize(); i++) {

            //  If we have a valid bay at a spot one more than the path
            //  segment that we're processing for, then grab its resolver and
            //  try to traverse that segment.
            nextBay = inspectorItems.at(i + 1);

            if (TP.isValid(nextBay)) {
                resolver = nextBay.get('config').at('resolver');

                targetAspect = pathParts.at(i);

                //  Resolve the targetAspect to a target object
                target = TP.resolveAspectForTool(
                                resolver,
                                'inspector',
                                targetAspect,
                                TP.hc('pathParts',
                                        this.get('selectedItems').getValues()));

                if (TP.notValid(target)) {
                    break;
                }

                //  Select the item named. Note that targetAspect could be a
                //  RegExp here and it's up to the control to do the right thing
                //  with that.
                this.selectItemNamedInBay(targetAspect, i + 1);

                //  If targetAspect is a RegExp, then we can't use that as the
                //  final value for selection - go to the control that's
                //  embedded in the inspector item at i + 1 and get it's
                //  currentValue to use as the targetAspect.
                if (TP.isRegExp(targetAspect)) {
                    targetAspect = this.getInspectorItemContentItem(
                                                i + 1).get('$currentValue');
                }

                //  If we got original path parts above (which might be
                //  aliased), those are the ones that we want to pass along for
                //  history purposes here. If it's empty, then just use the path
                //  parts that we computed (prepended by the rootBayItem, if we
                //  have one).
                if (TP.notEmpty(originalPathParts)) {
                    historyPathParts = originalPathParts;
                } else {
                    historyPathParts = pathParts.slice(0, i + 1);
                    if (TP.notEmpty(rootBayItem)) {
                        historyPathParts.unshift(rootBayItem);
                    }
                }

                info = TP.hc('targetObject', target,
                                'targetAspect', targetAspect,
                                'bayIndex', i + 2,
                                'historyPathParts', historyPathParts);

                //  Only create a history entry if we're processing the last
                //  item in the path.
                if (i < pathParts.getSize() - 1) {
                    this.traverseUsing(info, false);
                } else {
                    this.traverseUsing(info);
                }

                //  Now that we have more inspector items, obtain the list
                //  again.
                inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);
            }
        }
    } else {

        if (TP.isValid(info.at('targetObject'))) {
            if (TP.isNumber(currentBayIndex)) {
                info.atPut('bayIndex', currentBayIndex + 1);
            }

            this.traverseUsing(info);
        }
    }

    this.signal('InspectorDidFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     */

    var haloTarget,

        dynamicEntries;

    haloTarget = aSignal.at('haloTarget');

    haloTarget.defineMethod(
                'getSherpaInspectorLabel',
                function() {
                    return 'HALO - ' +
                            TP.name(this) +
                            ' - #' +
                            TP.lid(this);
                });

    haloTarget.defineMethod(
                'getPathPartsForInspector',
                function() {
                    return TP.ac(this.getID());
                });

    dynamicEntries = this.get('dynamicContentEntries');

    //  Make sure that we don't already have the target in our list of dynamic
    //  entries.
    if (!dynamicEntries.contains(haloTarget, TP.IDENTITY)) {

        //  Wasn't found - add it and rebuild the root data.
        dynamicEntries.unshift(haloTarget);

        //  Track whether or not the halo itself added the target.
        this.set('$haloAddedTarget', true);
    } else {
        this.set('$haloAddedTarget', false);
    }

    //  Refresh the root data entries
    this.buildRootData();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     */

    var haloTarget,
        haloTargetID,

        firstSelectedValue,

        dynamicEntries,
        dynamicEntriesIds,

        targetIndex;

    haloTarget = aSignal.at('haloTarget');

    if (TP.owns(haloTarget, 'getSherpaInspectorLabel')) {
        delete haloTarget.getSherpaInspectorLabel;
    }

    if (TP.owns(haloTarget, 'getPathPartsForInspector')) {
        delete haloTarget.getPathPartsForInspector;
    }

    haloTargetID = TP.id(haloTarget);

    firstSelectedValue = this.get('selectedItems').getValues().first();
    if (haloTargetID === firstSelectedValue) {
        this.focusInspectorOnHome();
    }

    //  If the halo added the target, then remove it.
    if (this.get('$haloAddedTarget')) {

        dynamicEntries = this.get('dynamicContentEntries');
        dynamicEntriesIds = dynamicEntries.collect(
                            function(anEntry) {
                                return TP.id(anEntry);
                            });

        targetIndex = dynamicEntriesIds.indexOf(haloTargetID);

        if (targetIndex !== TP.NOT_FOUND) {
            dynamicEntries.splice(targetIndex, 1);
        }
    }

    //  Refresh the root data entries
    this.buildRootData();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('NavigateInspector',
function(aSignal) {

    /**
     * @method handleNavigateInspector
     * @summary
     * @param {TP.sig.NavigateInspector} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var pathStack,
        pathStackIndex,

        newPathStackIndex;

    pathStack = this.get('pathStack');
    pathStackIndex = this.get('pathStackIndex');

    switch (aSignal.at('direction')) {

        case TP.HOME:
            this.focusInspectorOnHome();
            return this;

        case TP.PREVIOUS:
            newPathStackIndex = (0).max(pathStackIndex - 1);
            break;

        case TP.NEXT:
            newPathStackIndex = (pathStackIndex + 1).min(
                                this.get('pathStack').getSize() - 1);
            break;

        default:
            break;
    }

    if (newPathStackIndex !== pathStackIndex) {

        this.traversePath(pathStack.at(newPathStackIndex));

        this.set('pathStackIndex', newPathStackIndex);
    }

    this.signal('InspectorDidFocus');

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

TP.sherpa.inspector.Inst.defineMethod('getCurrentHistoryEntry',
function() {

    /**
     * @method getCurrentHistoryEntry
     * @summary
     * @param
     * @returns {Boolean}
     */

    return this.get('pathStack').at(this.get('pathStackIndex'));
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('refreshBay',
function(aBayNum) {

    /**
     * @method refreshBay
     * @summary
     * @param {Number} [aBayNum] The bay number to refresh. If this is not
     *     supplied, the current bay is refreshed. Note that this is 1-based!!
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var selectedItems,
        selectedItemValues,

        targetObj,
        targetAspect,

        data,

        bayNum,

        dataURI;

    selectedItems = this.get('selectedItems');
    selectedItemValues = selectedItems.getValues();

    targetObj =
        TP.uc('urn:tibet:sherpa_inspector_target').getResource().get('result');

    bayNum = TP.ifInvalid(aBayNum, selectedItems.getSize());

    //  bayNum will be 1-based, but we need to subtract 1 since
    //  selectedItemValues won't be.
    targetAspect = selectedItemValues.at(bayNum - 1);

    data = TP.getDataForTool(
                    targetObj,
                    'inspector',
                    TP.hc('targetAspect', targetAspect,
                            'pathParts', selectedItemValues));

    dataURI = TP.uc('urn:tibet:sherpa_bay_' + bayNum);
    dataURI.setResource(data, TP.request('signalChange', false));

    dataURI.$changed();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('removeDynamicRoot',
function(target, forceRefresh) {

    /**
     * @method removeDynamicRoot
     * @summary
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var dynamicEntries,
        targetIndex;

    dynamicEntries = this.get('dynamicContentEntries');

    targetIndex = dynamicEntries.indexOf(target);

    if (targetIndex !== TP.NOT_FOUND) {
        dynamicEntries.splice(targetIndex, 1);
        this.buildRootData();
    } else if (forceRefresh) {
        this.buildRootData();
    }

    return this;
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

        desiredFirstVisiblePosition =
            desiredFirstVisiblePosition.min(inspectorItems.getSize());

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

TP.sherpa.inspector.Inst.defineMethod('getInspectorItemContentItem',
function(bayNum) {

    /**
     * @method getInspectorItemContentItem
     * @summary
     * @param
     * @param
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var inspectorItemContentItems;

    if (TP.notEmpty(inspectorItemContentItems =
                    TP.byCSSPath('sherpa|inspectoritem > *', this))) {

        return inspectorItemContentItems.at(bayNum);
    }

    return null;
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

    var inspectorItemContentItems;

    if (TP.notEmpty(inspectorItemContentItems =
                    TP.byCSSPath('sherpa|inspectoritem > *', this))) {

        //  This will have already been re-rendered because of data binding,
        //  but we need to select what the new item will be.
        inspectorItemContentItems.at(bayNum).select(itemName);
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

        isSetup;

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
            'getConfigForInspector',
            function(options) {
                var targetAspect;

                targetAspect = options.at('targetAspect');

                options.atPut(TP.ATTR + '_contenttype', 'html:div');
                if (targetAspect !== 'Local Storage') {
                    options.atPut(TP.ATTR + '_class', 'doublewide');
                }

                return options;
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
            'getConfigForInspector',
            function(options) {
                var targetAspect;

                targetAspect = options.at('targetAspect');

                options.atPut(TP.ATTR + '_contenttype', 'html:div');
                if (targetAspect !== 'Session Storage') {
                    options.atPut(TP.ATTR + '_class', 'doublewide');
                }

                return options;
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
            'getConfigForInspector',
            function(options) {
                var targetAspect;

                targetAspect = options.at('targetAspect');

                options.atPut(TP.ATTR + '_contenttype', 'html:div');
                if (targetAspect !== 'Signal Map') {
                    options.atPut(TP.ATTR + '_class', 'doublewide');
                }

                return options;
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
            'get',
            function(aProperty) {
                return TP.sys.getCustomTypes().at(aProperty);
            });
    sourceObj.defineMethod(
            'getContentForToolbar',
            function(options) {
                return TP.elem('<sherpa:typesToolbarContent tibet:ctrl="urn:tibet:sherpa_inspector_target"/>');
            });
    sourceObj.defineMethod(
            'getDataForInspector',
            function(options) {
                var customTypeNames;

                customTypeNames = TP.sys.getCustomTypeNames().sort();
                customTypeNames.isOriginSet(false);

                return customTypeNames;
            });
    sourceObj.defineHandler('SherpaInspectorAddType',
            function(aSignal) {
                TP.signal(null,
                            'ConsoleCommand',
                            TP.hc(
                                'cmdText',
                                    ':type --assist' +
                                            ' --name=\'newType\'' +
                                            ' --dna=\'default\''
                            ));
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

                var fullURIStr;

                fullURIStr = TP.uriResolveVirtualPath(aProperty);

                return TP.core.URI.get('instances').
                                at(fullURIStr).getResource().get('result');
            });
    sourceObj.defineMethod(
            'getConfigForInspector',
            function(options) {
                var targetAspect,

                    str,
                    result;

                targetAspect = options.at('targetAspect');

                options.atPut(TP.ATTR + '_class', 'doublewide');

                if (targetAspect === 'URIs') {
                    options.atPut(TP.ATTR + '_contenttype', 'sherpa:navlist');
                } else {
                    result = this.get(options.at('targetAspect'));
                    if (TP.isValid(result)) {
                        str = TP.str(result);
                        if (str.getSize() <= formattedContentMaxLength) {
                            options.atPut(
                                TP.ATTR + '_contenttype', 'sherpa:urieditor');
                        }
                    }

                    options.atPut(TP.ATTR + '_contenttype', 'html:div');
                }

                return options;
            });
    sourceObj.defineMethod(
            'getContentForEditor',
            function(options) {

                var targetAspect,

                    result,
                    str,

                    data,
                    dataURI,

                    uriEditorTPElem,

                    inspectorElem;

                targetAspect = options.at('targetAspect');

                result = this.get(targetAspect);

                if (TP.isValid(result)) {
                    str = TP.str(result);

                    if (str.getSize() > formattedContentMaxLength) {
                        result = str.asEscapedXML();

                        if (TP.notEmpty(result)) {
                            inspectorElem = TP.xhtmlnode(
                                '<div class="cm-s-elegant scrollable wrapped select">' +
                                    result +
                                '</div>');
                        }

                    } else {

                        data = this.getDataForInspector(options);

                        dataURI = TP.uc(options.at('bindLoc'));
                        dataURI.setResource(
                                    data, TP.request('signalChange', false));

                        uriEditorTPElem = TP.wrap(
                                    TP.getContentForTool(data, 'Inspector'));

                        uriEditorTPElem = uriEditorTPElem.clone();
                        uriEditorTPElem.setAttribute('id', 'inspectorEditor');

                        uriEditorTPElem.setAttribute(
                                            'bind:in', dataURI.asString());

                        inspectorElem = TP.unwrap(uriEditorTPElem);
                    }

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

                var targetAspect,
                    fullURIStr;

                targetAspect = options.at('targetAspect');

                if (targetAspect === 'URIs') {
                    return TP.keys(TP.core.URI.get('instances')).sort().collect(
                            function(aURIStr) {
                                return TP.uriInTIBETFormat(aURIStr);
                            });
                } else {
                    fullURIStr = TP.uriResolveVirtualPath(targetAspect);

                    return TP.core.URI.get('instances').at(fullURIStr);
                }
            });
    sourceObj.defineMethod(
            'getContentForToolbar',
            function(options) {

                var targetAspect;

                targetAspect = options.at('targetAspect');

                if (targetAspect !== 'URIs') {
                    return TP.elem(
                        '<sherpa:uriEditorToolbarContent tibet:ctrl="inspectorEditor"/>');
                }
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
    }

    //  Listen for when we resize, either because something moved us like a
    //  drawer or because our document (window) resized.
    this.observe(this, 'TP.sig.DOMResize');
    this.observe(this.getDocument(), 'TP.sig.DOMResize');

    this.observe(TP.ANY,
                    TP.ac('TP.sig.NavigateInspector',
                            'TP.sig.TypeAdded',
                            'TP.sig.MethodAdded'));

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    this.observe(TP.byId('SherpaBreadcrumb', TP.win('UIROOT')),
                    'TP.sig.BreadcrumbSelected');

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

        accumWidth,

        toolbarElem,
        toolbarStyleObj;

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
    this.set('totalSlotCount', totalSlotCount);

    //  Compute the *visible* width of the inspector.

    //  We need to subtract off the left and right border.
    inspectorStyleVals = TP.elementGetComputedStyleValuesInPixels(
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
            function(aBay, index) {

                var width,
                    bayContent;

                width = finalSlotWidth * multipliers.at(index);
                aBay.setWidth(width);

                bayContent = aBay.getFirstChildElement();

                if (TP.canInvoke(bayContent, 'render')) {
                    bayContent.render();
                }

                //  If the item's index is greater than or equal to the position
                //  of the first visible slot, then it exists within the set of
                //  visible slots and we need to add it's width to the
                //  accumulated width.
                if (index >= firstVisibleSlotPosition) {
                    accumWidth += width;
                }
            });

    toolbarElem = TP.byId('SherpaToolbar', TP.win('UIROOT'), false);
    toolbarStyleObj = TP.elementGetStyleObj(toolbarElem);

    /* eslint-disable no-extra-parens */
    if (visibleSlotCount === multipliers.last()) {

        //  Cheesy. Should sum the widths of the items to the left of the toolbar
        //  and use that number here.
        toolbarStyleObj.left = '282px';
        toolbarStyleObj.width = '';
    } else {
        toolbarStyleObj.left = '';
        toolbarStyleObj.width = (finalSlotWidth * multipliers.last()) + 'px';
    }
    /* eslint-enable no-extra-parens */

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

TP.sherpa.inspector.Inst.defineMethod('traversePath',
function(pathParts) {

    var inspectorItems,

        sourceEntries,
        rootEntryResolver,

        resolvedPathParts,

        target,

        i,

        nextBay,
        resolver,

        targetAspect,
        info;

    inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

    sourceEntries = this.get('sourceEntries');
    rootEntryResolver = sourceEntries.at(pathParts.first());

    //  If any of these path parts returned an alias, look it up here.
    resolvedPathParts = this.getType().resolvePathAliases(pathParts);

    if (TP.isEmpty(resolvedPathParts)) {
        this.focusInspectorOnHome();

        return this;
    }

    //  We start the target at the root entry resolver.
    target = rootEntryResolver;

    for (i = 0; i < resolvedPathParts.getSize(); i++) {

        //  If we have a valid bay at a spot one more than the path
        //  segment
        //  that we're processing for, then grab its resolver and try to
        //  traverse that segment.
        nextBay = inspectorItems.at(i);

        if (TP.isValid(nextBay)) {
            resolver = nextBay.get('config').at('resolver');

            targetAspect = resolvedPathParts.at(i);

            //  Resolve the targetAspect to a target object
            target = TP.resolveAspectForTool(
                            resolver,
                            'inspector',
                            targetAspect,
                            TP.hc('pathParts',
                                    this.get('selectedItems').getValues()));

            if (TP.notValid(target)) {
                break;
            }

            this.selectItemNamedInBay(targetAspect, i);

            //  NB: Don't worry about not supplying 'historyPathParts' here,
            //  since we don't want to create history entries anyway - hence the
            //  'false' below.
            info = TP.hc('targetObject', target,
                            'targetAspect', targetAspect,
                            'bayIndex', i + 1);

            this.traverseUsing(info, false);

            //  Now that we have more inspector items, obtain the list
            //  again.
            inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('traverseUsing',
function(info, createHistoryEntry) {

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

        existingItems,

        toolbar,
        toolbarContent,

        targetURI,

        pathStack,
        pathStackIndex,

        historyPathParts;

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

    if (TP.notValid(bayConfig)) {
        return this;
    }

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

    //  Update the toolbar (or clear it)
    toolbar = TP.byId('SherpaToolbar', TP.win('UIROOT'));
    toolbarContent = TP.getContentForTool(
                        target,
                        'toolbar',
                        TP.hc('targetAspect', aspect,
                                'target', target,
                                'pathParts', selectedItems.getValues()));

    if (TP.isElement(toolbarContent)) {
        toolbarContent = toolbar.setContent(toolbarContent);
        toolbarContent.awaken();
    } else {
        toolbar.empty();
    }

    //  Update the target value holder with the current target object.
    targetURI = TP.uc('urn:tibet:sherpa_inspector_target');
    targetURI.setResource(target,
                            TP.request('signalChange', false));

    //  Size the inspector items
    this.sizeItems();

    //  Scroll them to the end
    this.scrollItemsToEnd();

    if (TP.notFalse(createHistoryEntry)) {

        pathStack = this.get('pathStack');
        pathStackIndex = this.get('pathStackIndex');

        if (pathStackIndex < pathStack.getSize() - 1) {
            pathStack = pathStack.slice(0, pathStackIndex + 1);
            this.set('pathStack', pathStack);
        }

        //  See if the caller supplied specific path parts we should use for our
        //  history entry. If not, just use the currently selected path.
        historyPathParts = info.at('historyPathParts');
        if (TP.isEmpty(historyPathParts)) {
            historyPathParts = this.get('selectedItems').getValues();
        }

        pathStack.push(historyPathParts);
        this.set('pathStackIndex', pathStack.getSize() - 1);
    }

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
        data;

    entries = this.get('dynamicContentEntries');
    data = entries.collect(
                function(entry) {
                    return TP.ac(this.getItemLabel(entry), TP.id(entry));
                }.bind(this));

    entries = this.get('sourceEntries').getKeys().sort();
    entries.perform(
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
