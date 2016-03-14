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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineAttribute(
        'container',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineAttribute('dynamicContentEntries');
TP.sherpa.inspector.Inst.defineAttribute('fixedContentEntries');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('addItem',
function(itemContent, itemConfig) {

    /**
     * @method addItemContent
     * @summary
     * @param
     */

    var item;

    //  TODO: Grab bay flex value from config and configure the flex item

    item = TP.elem('<sherpa:inspectoritem/>');
    TP.nodeAppendChild(item, TP.unwrap(itemContent), false);
    item = TP.wrap(item);

    item = this.get('container').addContent(item);

    item.awaken();

    this.configureItem(item, itemConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('configureItem',
function(item, itemConfig) {

    /**
     * @method configureItem
     * @summary
     * @param
     */

    item.set('config', itemConfig);

    //  TODO: Do the rest

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('replaceItemContent',
function(item, itemContent, itemConfig) {

    /**
     * @method replaceItemContent
     * @summary
     * @param
     */

    var content;

    this.removeItemsAfter(item);

    content = item.setContent(itemContent);
    content.awaken();

    this.configureItem(item, itemConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('removeItemsAfter',
function(startItem) {

    /**
     * @method removeItemsAfter
     * @summary
     * @param
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

TP.sherpa.inspector.Inst.defineMethod('removeItem',
function(anItem) {

    /**
     * @method removeItem
     * @summary
     * @param
     */

    var natItem;

    natItem = anItem.getNativeNode();
    TP.nodeDetach(natItem);

    //  TODO: Update inspector's bay / resolver data to remove bay data for item.

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('TraverseObject',
function(aSignal) {

    var domTarget,
        inspectorItem,

        resolver,
        id,

        target,

        bayConfig,

        bayNum,
        newBayNum,

        bayContent,

        existingItems;

    domTarget = aSignal.at('selectionSignal').getDOMTarget();

    inspectorItem = TP.nodeGetFirstAncestorByTagName(
                                    domTarget, 'sherpa:inspectoritem');

    inspectorItem = TP.wrap(inspectorItem);

    resolver = inspectorItem.get('config').at('resolver');

    id = aSignal.at('targetID');

    target = resolver.resolveIDForInspector(
                                id, TP.hc('triggerSignal', aSignal));

    if (TP.notValid(target)) {
        TP.error('Invalid inspector target: ' + id);

        return this;
    }

    if (TP.canInvoke(target, 'getConfigForTool')) {
        bayConfig = target.getConfigForTool(
                                'inspector', TP.hc('triggerSignal', aSignal));
    } else {
        bayConfig = TP.hc();
    }

    bayConfig.atPutIfAbsent('resolver', target);

    bayNum = inspectorItem.getBayIndex();
    newBayNum = bayNum + 1;

    if (TP.canInvoke(target, 'getContentForTool')) {
        bayContent = target.getContentForTool(
                                'inspector',
                                TP.hc('bindURI', 'urn:tibet:sherpa_bay_' + newBayNum,
                                        'triggerSignal', aSignal));
    } else {
        //  TODO: Otherwise, run the pretty printer to produce something...
    }

    existingItems = TP.byCSSPath('sherpa|inspectoritem', this);
    if (existingItems.getSize() > newBayNum) {

        this.replaceItemContent(
                    existingItems.at(newBayNum), bayContent, bayConfig);

    } else {
        //  Add bay
        this.addItem(bayContent, bayConfig);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineHandler('InspectObject',
function(aSignal) {

    /**
     * @method handleInspectObject
     * @summary
     * @param {TP.sig.FocusWorkbench} aSignal The TIBET signal which triggered
     *     this method.
     */

    var payload,

        obj,
        id,

        target,

        bayContent,
        bayConfig,

        existingItems;

    payload = aSignal.getPayload();

    obj = payload.at('targetObject');
    id = payload.at('targetID');

    if (TP.isValid(obj)) {
        target = obj;
    } else {
        target = this.resolveIDForInspector(
                                id, TP.hc('triggerSignal', aSignal));
    }

    if (TP.notValid(target)) {
        TP.error('Invalid inspector target: ' + id);

        return this;
    }

    if (TP.canInvoke(target, 'getConfigForTool')) {
        bayConfig = target.getConfigForTool(
                                'inspector', TP.hc('triggerSignal', aSignal));
    } else {
        bayConfig = TP.hc();
    }

    bayConfig.atPut('resolver', target);

    var bindURI;

    if (target === this) {
        bindURI = 'urn:tibet:sherpa_bay_0';
        this.buildRootData();
    } else {
        bindURI = 'urn:tibet:sherpa_bay_1';

        //  NB: Do this *before* we get content so that dynamic list updates are
        //  finished.
        this.updateRootBay(target);
    }

    if (TP.canInvoke(target, 'getContentForTool')) {
        bayContent = target.getContentForTool(
                                'inspector',
                                TP.hc('bindURI', bindURI,
                                        'triggerSignal', aSignal));
    } else {
        //  TODO: Otherwise, run the pretty printer to produce something...
    }

    existingItems = TP.byCSSPath('sherpa|inspectoritem', this);
    if (existingItems.getSize() > 1) {

        this.replaceItemContent(existingItems.at(1), bayContent, bayConfig);

    } else {
        //  Add bay 0
        this.addItem(bayContent, bayConfig);
    }
    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('buildRootData',
function() {

    var entries,
        data,
        hash,

        dataURI;

    entries = this.get('dynamicContentEntries');

    data = entries.collect(
                function(entry) {
                    return TP.ac(TP.name(entry), TP.id(entry));
                });

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

TP.sherpa.inspector.Inst.defineMethod('updateRootBay',
function(target) {

    //  TODO: Update root with label config - look for it in the current list.
    //  If it's there, we should highlight it. Otherwise, add to the 'recents'
    //  part of the list (a LIFO queue with a 'sherpa.inspector.recent_max'
    //  count).

    var item;

    //  NB: Do this *before* we get content so that dynamic list updates are
    //  finished.
    this.get('dynamicContentEntries').unshift(target);

    this.buildRootData();

    item = TP.byCSSPath('sherpa|inspectoritem > *', this, true);
    item.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('resolveIDForInspector',
function(anID, options) {

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

TP.sherpa.inspector.Inst.defineMethod('getContentForInspector',
function(options) {

    var dataURI;

    //data = TP.sys.cfg('sherpa.inspector_roots');
    //data.sort();

    dataURI = TP.uc(options.at('bindURI'));

    return TP.elem('<sherpa:navlist src="' + dataURI.asString() + '"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.inspector.Inst.defineMethod('setup',
function() {

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

    this.set('dynamicContentEntries', TP.ac());
    this.set('fixedContentEntries', fixedContentEntries);

    this.signal('InspectObject', TP.hc('targetObject', this));

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.InspectorRoot');

TP.sherpa.InspectorRoot.addTraits(TP.sherpa.ToolAPI);

//  ------------------------------------------------------------------------

TP.core.UIElementNode.addTraits(TP.sherpa.ToolAPI);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
