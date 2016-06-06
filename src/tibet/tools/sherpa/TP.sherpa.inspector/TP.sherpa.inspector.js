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
 * @type {TP.sherpa.inspector}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('inspector');

TP.sherpa.inspector.addTraits(TP.sherpa.ToolAPI);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.setupRoots();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineAttribute(
        'container',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

TP.sherpa.inspector.Inst.defineAttribute('dynamicContentEntries');
TP.sherpa.inspector.Inst.defineAttribute('fixedContentEntries');

TP.sherpa.inspector.Inst.defineAttribute('selectedItems');

//  ------------------------------------------------------------------------
//  Instance Methods
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

    //  TODO: Grab bay flex value from config and configure the flex item

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

    var entries,
        data,
        hash,

        dataURI;

    entries = this.get('dynamicContentEntries');

    data = entries.collect(
                function(entry) {

                    return TP.ac(this.getItemLabel(entry), TP.id(entry));
                }.bind(this));

    hash = this.get('fixedContentEntries');

    hash.getKeys().sort().perform(
                function(aKey) {
                    data.add(TP.ac(aKey, TP.id(hash.at(aKey))));
                });

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

    item.set('config', itemConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method configureItem
     * @summary
     * @param
     * @returns {Element}
     */

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<sherpa:navlist bind:in="' + dataURI.asString() + '"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('getItemLabel',
function(anItem) {

    /**
     * @method getLabel
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

TP.sherpa.inspector.Inst.defineHandler('DetachContent',
function(aSignal) {

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

        fixedContentEntries,
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
                            resolver, 'inspector', targetAspect);
        }
    }

    info = TP.hc('targetObject', target, 'targetAspect', targetAspect);

    //  If the target is the inspector itself, build the root data, load up bay
    //  0 and return.
    if (target === this) {

        this.buildRootData();

        //  Populate bay 0
        info.atPut('bayIndex', 0);
        this.traverseUsing(info);

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

    } else if (TP.isEmpty(targetPath)) {

        //  We're not going to add as dynamic root, but try to traverse to
        //  instead.

        //  The first thing to do is to query all of the existing static roots
        //  and see if any of them can handle the target object.
        fixedContentEntries = this.get('fixedContentEntries');

        rootEntry = fixedContentEntries.detect(
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

            pathParts = targetPath.split('/');
            rootBayItem = pathParts.shift();
            targetPath = pathParts.join('/');

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
        }
    }

    if (TP.notEmpty(targetPath)) {

        pathSegments = targetPath.split('/');

        for (i = 0; i < pathSegments.getSize(); i++) {

            //  If we have a valid bay at a spot one more than the path segment
            //  that we're processing for, then grab its resolver and try to
            //  traverse that segment.
            nextBay = inspectorItems.at(i + 1);

            if (TP.isValid(nextBay)) {
                resolver = nextBay.get('config').at('resolver');

                inspectorData = TP.getDataForTool(
                                            target,
                                            'inspector',
                                            TP.hc('targetAspect', targetAspect));

                targetAspect = pathSegments.at(i);

                //  Resolve the targetAspect to a target object
                target = TP.resolveAspectForTool(
                                resolver, 'inspector', targetAspect);

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

            } else {

                //  Otherwise, we ran out of bays that could navigate our 'next
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
        fixedContentEntries;

    dynamicContentEntries = this.get('dynamicContentEntries');
    target = dynamicContentEntries.detect(
                    function(anItem) {
                        return TP.id(anItem) === anAspect;
                    });

    if (TP.notValid(target)) {
        fixedContentEntries = this.get('fixedContentEntries');
        target = fixedContentEntries.at(anAspect);
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

TP.sherpa.inspector.Inst.defineMethod('scrollBaysToEnd',
function() {

    /**
     * @method scrollBaysToEnd
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var inspectorElem;

    inspectorElem = this.getNativeNode();
    inspectorElem.scrollLeft = inspectorElem.scrollWidth;

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

TP.sherpa.inspector.Inst.defineMethod('setupRoots',
function() {

    /**
     * @method setupRoots
     * @summary
     * @returns {TP.sherpa.inspector} The receiver.
     */

    var rootObj,

        fixedContentEntries,

        northDrawerTPElement;

    fixedContentEntries = TP.hc();

    //  ---

    rootObj = TP.sherpa.InspectorRoot.construct();
    rootObj.setID('Config');

    rootObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.sys.cfg(aProperty);
            });
    rootObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.sys.cfg().getKeys().sort();
            });
    rootObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    fixedContentEntries.atPut('Config', rootObj);

    //  ---

    rootObj = TP.sherpa.InspectorRoot.construct();
    rootObj.setID('Local Storage');

    rootObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.str(top.localStorage[aProperty]);
            });
    rootObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.keys(top.localStorage);
            });
    rootObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    fixedContentEntries.atPut('Local Storage', rootObj);

    //  ---

    rootObj = TP.sherpa.InspectorRoot.construct();
    rootObj.setID('Session Storage');

    rootObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.str(top.sessionStorage[aProperty]);
            });
    rootObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.keys(top.sessionStorage);
            });
    rootObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    fixedContentEntries.atPut('Session Storage', rootObj);

    //  ---

    rootObj = TP.sherpa.InspectorRoot.construct();
    rootObj.setID('Signal Map');

    rootObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.json(TP.sig.SignalMap.INTERESTS[aProperty]);
            });
    rootObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.keys(TP.sig.SignalMap.INTERESTS);
            });
    rootObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    fixedContentEntries.atPut('Signal Map', rootObj);

    //  ---

    rootObj = TP.sherpa.InspectorRoot.construct();
    rootObj.setID('Test Browser Bays');

    rootObj.defineMethod(
            'get',
            function(aProperty) {
                return this;
            });
    rootObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.ac(
                        TP.ac(0, TP.id(this)),
                        TP.ac(1, TP.id(this)),
                        TP.ac(2, TP.id(this)),
                        TP.ac(3, TP.id(this)),
                        TP.ac(4, TP.id(this))
                        );
            });
    rootObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    fixedContentEntries.atPut('Test Browser Bays', rootObj);

    //  ---

    rootObj = TP.sherpa.InspectorRoot.construct();
    rootObj.setID('TSH History');

    rootObj.defineMethod(
            'get',
            function(aProperty) {
                return null;
            });
    rootObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.bySystemId('TSH').getHistory().collect(
                                function(item) {
                                    return item.at('cmd');
                                });
            });
    rootObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    fixedContentEntries.atPut('TSH History', rootObj);

    //  ---

    rootObj = TP.sherpa.InspectorRoot.construct();
    rootObj.setID('Types');

    rootObj.defineMethod(
            'canHandle',
            function(anObject) {
                return TP.isType(anObject);
            });
    rootObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.sys.getCustomTypes().at(aProperty);
            });
    rootObj.defineMethod(
            'getDataForInspector',
            function(options) {
                var customTypeNames;

                customTypeNames = TP.sys.getCustomTypeNames().sort();
                customTypeNames.isOriginSet(false);

                return customTypeNames;
            });
    rootObj.defineMethod(
            'getPathTo',
            function(anObject) {
                return 'Types' + '/' + TP.name(anObject);
            });
    rootObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return TP.sys.getTypeByName(anAspect);
            });
    fixedContentEntries.atPut('Types', rootObj);

    //  ---

    rootObj = TP.sherpa.InspectorRoot.construct();
    rootObj.setID('URIs');

    rootObj.defineMethod(
            'get',
            function(aProperty) {
                return TP.str(TP.core.URI.get('instances').
                                at(aProperty).getResource().get('result'));
            });
    rootObj.defineMethod(
            'getDataForInspector',
            function(options) {
                return TP.keys(TP.core.URI.get('instances')).sort();
            });
    rootObj.defineMethod(
            'resolveAspectForInspector',
            function(anAspect, options) {
                return this;
            });
    fixedContentEntries.atPut('URIs', rootObj);

    //  ---

    this.set('dynamicContentEntries', TP.ac());
    this.set('fixedContentEntries', fixedContentEntries);

    this.set('selectedItems', TP.hc());

    this.signal('FocusInspectorForBrowsing', TP.hc('targetObject', this));

    northDrawerTPElement = TP.byId('north', this.getNativeDocument());

    (function(aSignal) {

        var navlists;

        navlists = TP.byCSSPath('sherpa|navlist', this);
        navlists.forEach(
                function(aNavList) {
                    aNavList.render();
                });

    }.bind(this)).observe(northDrawerTPElement, 'TP.sig.DOMTransitionEnd');

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

        newBayNum,

        bindLoc,

        bayContent,

        existingItems;

    target = info.at('targetObject');
    aspect = info.at('targetAspect');

    if (TP.notValid(target)) {
        TP.error('Invalid inspector target: ' + target);

        return this;
    }

    bayConfig = TP.getConfigForTool(target,
                                    'inspector',
                                    TP.hc('targetAspect', aspect,
                                            'target', target));

    bayConfig.atPutIfAbsent('resolver', target);

    newBayNum = info.at('bayIndex');

    if (newBayNum > 0) {
        this.get('selectedItems').atPut(newBayNum - 1, aspect);
    }

    bindLoc = 'urn:tibet:sherpa_bay_' + newBayNum;

    bayContent = TP.getContentForTool(target,
                                        'inspector',
                                        TP.hc('bindLoc', bindLoc,
                                                'targetAspect', aspect,
                                                'target', target));

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

    this.scrollBaysToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.InspectorRoot');

TP.sherpa.InspectorRoot.addTraits(TP.sherpa.ToolAPI);

//  ------------------------------------------------------------------------

TP.sherpa.InspectorRoot.Inst.defineMethod('canHandle',
function(aTargetObject) {

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorRoot.Inst.defineMethod('getDataForInspector',
function(options) {

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorRoot.Inst.defineMethod('getPathTo',
function(aTargetObject) {

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.InspectorRoot.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
