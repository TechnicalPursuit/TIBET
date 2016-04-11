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

    return TP.name(anItem);
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

    var payload,

        target,
        targetID,

        info,

        hash,
        root,
        path;

    payload = aSignal.getPayload();

    target = payload.at('targetObject');
    targetID = payload.at('targetID');

    info = TP.hc('targetObject', target, 'targetID', targetID);

    if (this.hasDynamicRoot(target)) {

        this.selectItemNamedInBay(this.getItemLabel(target), 0);

        info.atPut('bayIndex', 0);

        this.traverseUsing(info);

    } else if (TP.isTrue(payload.at('addTargetAsRoot'))) {

        this.addDynamicRoot(target);
        this.selectItemNamedInBay(this.getItemLabel(target), 0);

        info.atPut('bayIndex', 1);

        this.traverseUsing(info);
    } else {
        //  We're not going to add as dynamic root, but try to traverse to
        //  instead

        //  The first thing to do is to query all of the existing static roots
        //  and see if any of them can handle the target object
        hash = this.get('fixedContentEntries');

        root = hash.detect(
                        function(kvPair) {
                            return kvPair.last().canHandle(target);
                        });

        //  If so, then we query that object to see if it can produce a path.
        if (TP.isValid(root)) {
            if (TP.notEmpty(path = root.getPathTo(target))) {
                //  If so, then navigate that path.
            }
        }
    }

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
        targetID,

        resolver,

        info,

        targetPath,
        pathSegments,

        i;

    payload = aSignal.getPayload();

    currentBayIndex = payload.at('bayIndex');
    domTarget = payload.at('domTarget');

    if (!TP.isNumber(currentBayIndex) && TP.isNode(domTarget)) {

        inspectorItem = TP.nodeGetFirstAncestorByTagName(
                                domTarget, 'sherpa:inspectoritem');

        inspectorItem = TP.wrap(inspectorItem);

        currentBayIndex = inspectorItem.getBayIndex();
    }

    inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);

    targetID = payload.at('targetID');
    target = payload.at('targetObject');

    if (TP.notValid(target) && TP.isNumber(currentBayIndex)) {
        inspectorItem = inspectorItems.at(currentBayIndex);
        resolver = inspectorItem.get('config').at('resolver');

        target = TP.resolveIDForTool(resolver, 'inspector', targetID);
    }

    info = TP.hc('targetObject', target, 'targetID', targetID);

    if (target === this) {

        this.buildRootData();
        this.selectItemNamedInBay(this.getItemLabel(target), 0);

        info.atPut('bayIndex', 0);

        this.traverseUsing(info);

        return this;
    }

    if (TP.isTrue(payload.at('addTargetAsRoot'))) {

        this.addDynamicRoot(target);
        this.selectItemNamedInBay(this.getItemLabel(target), 0);

        info.atPut('bayIndex', 1);

        this.traverseUsing(info);

        inspectorItems = TP.byCSSPath('sherpa|inspectoritem', this);
    }

    if (TP.notEmpty(payload.at('targetPath'))) {

        targetPath = payload.at('targetPath');
        pathSegments = targetPath.split('.');

        for (i = 0; i < pathSegments.getSize(); i++) {

            resolver = inspectorItems.at(i + 1).get('config').at('resolver');
            targetID = pathSegments.at(i);

            target = TP.resolveIDForTool(resolver, 'inspector', targetID);

            this.selectItemNamedInBay(targetID, i + 1);

            info = TP.hc('targetObject', target,
                            'targetID', targetID,
                            'bayIndex', i + 2);

            this.traverseUsing(info);
        }

        return this;
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

TP.sherpa.inspector.Inst.defineMethod('resolveIDForInspector',
function(anID, options) {

    /**
     * @method resolveIDForInspector
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
                        return TP.id(anItem) === anID;
                    });

    if (TP.notValid(target)) {
        fixedContentEntries = this.get('fixedContentEntries');
        target = fixedContentEntries.at(anID);
    }

    if (TP.notValid(target)) {
        target = TP.bySystemId(anID);
    }

    if (TP.notValid(target)) {
        target = TP.bySystemId('TSH').resolveObjectReference(anID, TP.request());
    }

    return target;
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

        fixedContentEntries;

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
            'resolveIDForInspector',
            function(anID, options) {
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
            'resolveIDForInspector',
            function(anID, options) {
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
            'resolveIDForInspector',
            function(anID, options) {
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
            'resolveIDForInspector',
            function(anID, options) {
                return this;
            });
    fixedContentEntries.atPut('Signal Map', rootObj);

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
            'resolveIDForInspector',
            function(anID, options) {
                return this;
            });
    fixedContentEntries.atPut('TSH History', rootObj);

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
                return TP.keys(TP.core.URI.get('instances'));
            });
    rootObj.defineMethod(
            'resolveIDForInspector',
            function(anID, options) {
                return this;
            });
    fixedContentEntries.atPut('URIs', rootObj);

    //  ---

    this.set('dynamicContentEntries', TP.ac());
    this.set('fixedContentEntries', fixedContentEntries);

    this.signal('FocusInspectorForBrowsing', TP.hc('targetObject', this));

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
        id,

        bayConfig,

        newBayNum,

        bindLoc,

        bayContent,

        existingItems;

    target = info.at('targetObject');
    id = info.at('targetID');

    if (TP.notValid(target)) {
        TP.error('Invalid inspector target: ' + id);

        return this;
    }

    bayConfig = TP.getConfigForTool(target,
                                    'inspector',
                                    TP.hc('targetID', id,
                                            'target', target));

    bayConfig.atPutIfAbsent('resolver', target);

    newBayNum = info.at('bayIndex');

    bindLoc = 'urn:tibet:sherpa_bay_' + newBayNum;

    bayContent = TP.getContentForTool(target,
                                        'inspector',
                                        TP.hc('bindLoc', bindLoc,
                                                'targetID', id,
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

TP.sherpa.InspectorRoot.Inst.defineMethod('resolveIDForInspector',
function(anID, options) {

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
