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
 * @type {TP.lama.respondershud}
 */

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.defineSubtype('respondershud');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineAttribute('currentTarget');

TP.lama.respondershud.Inst.defineAttribute('highlighted');

TP.lama.respondershud.Inst.defineAttribute('assistantFocusedItem',
    TP.cpc('> .content li.assistantfocus', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.respondershud.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description Because tibet:data tag content drives binds and we need to
     *     notify even without a full page load, we notify from here once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        eastDrawer,
        moveTileFunc;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    //  Grab the east drawer and define a function that, when the drawer
    //  animates back and forth into and out of its collapsed position that, if
    //  a tile is showing, will move the tile to the edge of the drawer.
    eastDrawer = TP.byId('east', tpElem.getNativeDocument());

    moveTileFunc = function(transitionSignal) {

        var tileTPElem,

            centerElem,
            centerElemPageRect,

            tileWidth,
            xCoord;

        tileTPElem = TP.byId('ResponderSummary_Tile',
                                eastDrawer.getNativeDocument());
        if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {
            //  Grab the center element and it's page rectangle.
            centerElem = TP.byId('center', eastDrawer.getNativeWindow());
            centerElemPageRect = centerElem.getPageRect();

            tileWidth = tileTPElem.getWidth();

            xCoord = centerElemPageRect.getX() +
                        centerElemPageRect.getWidth() -
                        tileWidth;

            tileTPElem.setPageX(xCoord);
        }
    };

    moveTileFunc.observe(eastDrawer, 'TP.sig.DOMTransitionEnd');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('addController',
function(aSignal) {

    /**
     * @method addController
     * @summary Invoked when a user has decided to 'Add Controller' from the
     *     context menu for hud sidebar panels.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    TP.alert('Called addController',
            TP.hc('dialogWindow', TP.sys.getUIRoot()));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('addItem',
function(aSignal) {

    /**
     * @method addItem
     * @summary Invoked when a user has decided to 'Add' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var contextMenuSignal,

        targetElem,

        dataIndex,

        data,
        itemData,

        target,

        typeName;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(dataIndex);

    //  Resolve the type from the type name that will be at the second position
    //  in the Array.
    target = TP.sys.getTypeByName(itemData.at(1));

    if (TP.isType(target)) {
        typeName = target.getName();

        TP.signal(null,
                    'ConsoleCommand',
                    TP.hc(
                        'cmdText',
                            ':method --assist' +
                                    ' --name=\'SignalName\'' +
                                    ' --kind=\'handler\'' +
                                    ' --owner=\'' + typeName + '\''
                    ));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('assistItem',
function(aSignal) {

    /**
     * @method assistItem
     * @summary Invoked when a user has decided to 'Assist' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var contextMenuSignal,

        targetElem,

        dataIndex,

        data,
        itemData,

        target,

        dataURI,
        methods,

        centerTPElem,
        centerTPElemPageRect,

        targetTPElem,
        targetElemPageRect,

        halo,
        sourceTPElem,

        tileTPElem,

        sheet,
        mainRule,

        tileWidth,

        assistantFocusedItem,

        xCoord;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(dataIndex);

    //  Resolve the type from the type name that will be at the second position
    //  in the Array.
    target = TP.sys.getTypeByName(itemData.at(1));
    if (!TP.isType(target)) {
        return this;
    }

    this.set('currentTarget', target);

    dataURI = TP.uc('urn:tibet:responder_methods');
    methods = this.getHandlerMethodsFor(target);

    // dataURI.setResource(target.getSupertypeNames());

    //  Use the same 'X' coordinate where the 'center' div is located in the
    //  page.
    centerTPElem = TP.byId('center', this.getNativeWindow());
    centerTPElemPageRect = centerTPElem.getPageRect();

    targetTPElem = TP.wrap(targetElem);

    //  Use the 'Y' coordinate where the target element is located in the page.
    targetElemPageRect = targetTPElem.getPageRect();

    halo = TP.byId('LamaHalo', this.getNativeDocument());
    sourceTPElem = halo.get('currentTargetTPElem');

    //  ---

    tileTPElem = TP.byId('ResponderSummary_Tile', this.getNativeWindow());
    if (TP.notValid(tileTPElem)) {

        tileTPElem = TP.bySystemId('Lama').makeTile('ResponderSummary_Tile');
        tileTPElem.setHeaderText('Responder Methods - ' + itemData.at(1));

        tileTPElem.setContent(TP.getContentForTool(
                                sourceTPElem,
                                'RespondersHUDTileBody',
                                TP.hc('dataURI', dataURI)));

        tileTPElem.get('footer').setContent(
                                TP.getContentForTool(
                                    sourceTPElem,
                                    'RespondersHUDTileFooter'));

        //  Observe the tile for PclassHiddenChange so that we can tell when it
        //  hides.
        this.observe(tileTPElem, 'PclassHiddenChange');

        sheet = this.getStylesheetForStyleResource();
        mainRule = TP.styleSheetGetStyleRulesMatching(
                            sheet,
                            'lama|tile#ResponderSummary_Tile').first();

        tileWidth = mainRule.style.minWidth.asNumber() + 2;

        //  NB: We need to set this because if the tile exists, we set it before
        //  obtaining the width.
        tileTPElem.setAttribute('hidden', false);

    } else {

        tileTPElem.setHeaderText('Responder Methods - ' + itemData.at(1));

        //  NB: We need to set this before getting the tile's current width
        tileTPElem.setAttribute('hidden', false);

        tileWidth = tileTPElem.getWidth();
    }

    //  If the assistant is already focused on another item, then remove the
    //  'assistantfocus' class on that item.
    assistantFocusedItem = this.get('assistantFocusedItem');
    if (TP.isValid(assistantFocusedItem)) {
        assistantFocusedItem.removeClass('assistantfocus');
    }

    //  Add the 'assistantfocus' class to the item that we're focusing.
    targetTPElem.addClass('assistantfocus');

    xCoord = centerTPElemPageRect.getX() +
                centerTPElemPageRect.getWidth() -
                tileWidth;
    tileTPElem.setPagePosition(
                TP.pc(xCoord, targetElemPageRect.getY()));

    (function() {
        //  Set the model's URI's resource and signal change. This will
        //  cause the properties to update.
        dataURI.setResource(methods, TP.hc('signalChange', true));
    }).queueAfterNextRepaint(tileTPElem.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('getConnectorDestinationRect',
function(aConnector) {

    /**
     * @method getConnectorDestinationRect
     * @summary Returns a TP.gui.Rect to be used as the connector destination's
     *     rectangle to display when it is currently being highlighted as the
     *     connector destination.
     * @param {TP.lama.connector} aConnector The connector that is requesting
     *     the destination rectangle.
     * @returns {TP.gui.Rect} The rectangle to use to draw the connector
     *     destination.
     */

    var destRect,
        connectorThickness;

    destRect = this.getGlobalRect();

    //  The default is to 'outset' the rectangle by the thickness of the
    //  connector.

    connectorThickness = aConnector.get('connectorThickness');

    destRect.subtractByPoint(
                TP.pc(connectorThickness, connectorThickness));
    destRect.shrink(connectorThickness, 0);

    return destRect;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.dom.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var node,
        attr,
        info,
        last;

    info = TP.ac();

    //  If the element is tofu, then we don't show any responders for it.
    if (aTPElement.getCanonicalName() === 'lama:tofu') {
        this.setValue(info);
        return this;
    }

    node = aTPElement.getNativeNode();
    while (TP.isNode(node)) {
        if (!TP.nodeIsResponder(node)) {
            node = node.parentNode;
            continue;
        }

        //  Tricky part here is that if we're looking at a tag that also has a
        //  controller we want to push both into list.
        attr = node.getAttribute('tibet:ctrl');
        if (TP.notEmpty(attr)) {
            info.push(TP.ac(TP.lid(node, true), attr, 'elem'));
        }

        attr = node.getAttribute('tibet:tag');
        if (TP.notEmpty(attr)) {
            info.push(TP.ac(TP.lid(node, true), attr, 'elem'));
        } else {
            info.push(
                TP.ac(TP.lid(node, true), TP.tname(TP.wrap(node)), 'elem'));
        }

        node = node.parentNode;
    }

    //  Add controller stack so we see those as well.
    TP.sys.getApplication().getControllers().perform(
        function(item) {

            var tname;

            tname = TP.tname(item);

            //  NB: We filter out the Lama here
            if (tname !== 'TP.lama.IDE') {
                info.push(
                    TP.ac(TP.lid(item, true), TP.tname(item), 'controller'));
            }
        });

    //  The list is from 'most specific to least specific' but we want to
    //  display 'top down' in the sidebar.
    info.reverse();

    this.setValue(info);

    //  Halo target is always last in the list, and always considered selected.
    last = this.get('listitems').last();
    if (TP.isValid(last)) {
        last.setAttribute('pclass:selected', 'true');
    }

    //  Scroll our list content to its bottom.
    this.get('listcontent').scrollTo(TP.BOTTOM);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('pathToItem',
function(aSignal) {

    /**
     * @method pathToItem
     * @summary Invoked when the user has decided to obtain the 'path' to an
     *     item and put it on the clipboard. In the case of this type, this will
     *     be the path to the 'generator' template or code.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var contextMenuSignal,

        targetElem,

        dataIndex,

        data,
        itemData,

        target,

        uri,

        srcPath,
        finalPath;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(dataIndex);

    //  Resolve the type from the type name that will be at the second position
    //  in the Array.
    target = TP.sys.getTypeByName(itemData.at(1));

    if (!TP.isType(target)) {
        return this;
    }

    //  Grab the source path to the target, which should be a type object.
    uri = TP.uc(TP.objectGetSourcePath(target));

    //  Get the path to that URI and make sure to slice off the leading '/'.
    //  This will ensure that the TP.uriJoinPaths call will join the paths
    //  properly.
    srcPath = uri.getPath();
    srcPath = srcPath.slice(srcPath.indexOf('/') + 1);

    //  Join the leading path to the 'TIBET public directory' to the source
    //  path. This will give us the final *relative* path from the project down
    //  to the template file.
    finalPath = TP.uriJoinPaths(TP.sys.cfg('boot.tibet_pub', ''),
                                srcPath);

    TP.documentCopyTextToClipboard(this.getNativeDocument(), finalPath);

    TP.alert('Path copied to clipboard',
            TP.hc('dialogWindow', TP.sys.getUIRoot()));

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('AddSignalHandler',
function(aSignal) {

    /**
     * @method handleAddSignalHandler
     * @summary Handles notifications of when the receiver wants to add a
     *     signal handler.
     * @param {TP.sig.AddSignalHandler} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var currentTarget,
        typeName,

        tileTPElem;

    currentTarget = this.get('currentTarget');

    if (TP.isType(currentTarget)) {
        typeName = currentTarget.getName();

        //  Hide the tile to get it out of the way.
        tileTPElem = TP.byId('ResponderSummary_Tile', this.getNativeDocument());
        if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {
            tileTPElem.setAttribute('hidden', true);
        }

        TP.signal(null,
                    'ConsoleCommand',
                    TP.hc(
                        'cmdText',
                            ':method --assist' +
                                    ' --name=\'SignalName\'' +
                                    ' --kind=\'handler\'' +
                                    ' --owner=\'' + typeName + '\''
                    ));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('FocusHalo',
function(aSignal) {

    /**
     * @method handleFocusHalo
     * @summary Handles notifications of when the receiver wants to focus the
     *     halo.
     * @param {TP.sig.FocusHalo} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var targetElem,

        dataIndex,

        data,
        itemData,

        peerID,

        newTargetTPElem,

        halo,
        currentTargetTPElem,

        didBlur;

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(dataIndex);

    peerID = itemData.at(0);

    newTargetTPElem = TP.bySystemId(peerID);

    //  If its a Node, then it was valid and it was found. Focus the halo.
    if (TP.isKindOf(newTargetTPElem, TP.dom.Node) &&
        !TP.isType(newTargetTPElem)) {
        halo = TP.byId('LamaHalo', this.getNativeDocument());

        currentTargetTPElem = halo.get('currentTargetTPElem');
        if (newTargetTPElem !== currentTargetTPElem) {

            didBlur = false;

            if (TP.notValid(currentTargetTPElem)) {
                //  Since we didn't have a current target, we say that we
                //  blurred, so that the focus operation below succeeds.
                didBlur = true;
            } else if (currentTargetTPElem.haloCanBlur(halo)) {
                //  If the halo has a current target that can be blurred, then
                //  blur it.
                halo.blur();
                didBlur = true;
            }

            //  Remove any highlighting that we were doing *on the new target*
            //  because we're going to focus the halo.
            newTargetTPElem.removeClass('lama-hud-highlight');

            if (didBlur && newTargetTPElem.haloCanFocus(halo)) {
                //  Focus the halo on our new element, passing true to actually
                //  show the halo if it's hidden.
                halo.focusOn(newTargetTPElem, true);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var tile;

    this.callNextMethod();

    //  Hide the tile.
    tile = TP.byId('ResponderSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    //  Turn off our ability to accept signal source connections
    this.removeAttribute('lama:connector-accept');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    this.callNextMethod();

    //  Turn on our ability to accept signal source connections
    this.setAttribute('lama:connector-accept', 'signalsource');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('PclassHiddenChange',
function(aSignal) {

    /**
     * @method handlePclassHiddenChangeFromResponderSummary_Tile
     * @summary Handles notifications of when the 'hidden' state of the
     *     assistant tile associated with this panel changes.
     * @param {TP.sig.PclassHiddenChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var isHidden,

        assistantFocusedItem;

    isHidden = TP.bc(aSignal.getOrigin().getAttribute('hidden'));

    //  If we're hiding, and there is an assistant focused item, then remove the
    //  'assistantfocus' class.
    if (isHidden) {
        assistantFocusedItem = this.get('assistantFocusedItem');
        if (TP.isValid(assistantFocusedItem)) {
            assistantFocusedItem.removeClass('assistantfocus');
        }
    }

    return this;
}, {
    origin: 'ResponderSummary_Tile'
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('InspectResponderSource',
function(aSignal) {

    /**
     * @method handleInspectResponderSource
     * @summary Handles notifications of when the receiver wants to inspect the
     *     current target and shift the Lama's inspector to focus it on that
     *     target.
     * @param {TP.sig.ResponderSource} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var targetElem,

        dataIndex,

        data,
        itemData,

        target,

        tile;

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Prevent default *on the trigger signal* (which is the GUI signal - the
    //  contextmenu signal) so that any sort of 'right click' menu doesn't show.
    aSignal.at('trigger').preventDefault();

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(dataIndex);

    //  Resolve the type from the type name that will be at the second position
    //  in the Array.
    target = TP.sys.getTypeByName(itemData.at(1));

    //  Hide the tile.
    tile = TP.byId('ResponderSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    //  Fire the inspector signal on the next repaint (which will ensure the
    //  tile is closed before navigating).
    (function() {
        //  Not an element so focus inspector, not halo.
        this.signal('InspectObject',
                    TP.hc('targetObject', target,
                            'targetAspect', TP.id(target),
                            'targetPath', '__TARGET__/Instance Handlers',
                            'showBusy', true));
    }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('InspectResponderMethod',
function(aSignal) {

    /**
     * @method handleInspectResponderMethod
     * @summary Handles notifications of when the receiver wants to inspect the
     *     selected responder method in the Lama inspector.
     * @param {TP.sig.InspectResponderMethod} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var val,
        target;

    val = TP.wrap(aSignal.getSignalOrigin()).get('value');
    if (TP.notEmpty(val)) {

        //  Grab the method by going to the '.Inst' of our current target (which
        //  should be a type) and looking for that slot.
        target = this.get('currentTarget').Inst[val];
        if (!TP.isMethod(target)) {
            //  The value might have trailing content indicating the owner. We
            //  need to slice that off here and try again.
            val = val.slice(0, val.indexOf(' '));
            target = this.get('currentTarget').Inst[val];
        }

        //  Hide the tile.
        TP.byId('ResponderSummary_Tile', this.getNativeWindow()).setAttribute(
                                                                'hidden', true);

        //  Fire the inspector signal on the next repaint (which will ensure the
        //  tile is closed before navigating).
        (function() {
            this.signal('InspectObject',
                        TP.hc('targetObject', target,
                                'showBusy', true));
        }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('LamaConnectCompleted',
function(aSignal) {

    /**
     * @method handleLamaConnectCompleted
     * @summary Handles when the Lama connector has completed a connection to
     *     an element.
     * @param {TP.sig.LamaConnectCompleted} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var data,
        itemData,

        target,

        connector;

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');

    //  Since we're connecting to 'the whole responder chain', we can just use
    //  the last item in the data set.
    itemData = data.last();

    //  Make sure it's real ;-).
    if (TP.isEmpty(itemData)) {
        return this;
    }

    //  Resolve the type from the type name that will be at the second position
    //  in the Array.
    target = TP.sys.getTypeByName(itemData.at(1));

    //  Turn off 'autohiding' the connector - we'll hide it when the assistant
    //  is done. Note that this is reset to 'true' every time the connector is
    //  hidden.
    connector = TP.byId('LamaConnector', this.getNativeDocument());
    connector.set('autohideConnector', false);

    //  Show the assistant.
    TP.lama.signalConnectionAssistant.showAssistant(
                TP.hc('sourceTPElement', aSignal.at('sourceElement'),
                        'destinationTarget', target,
                        'signalPolicy', TP.RESPONDER_FIRING));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('ShowContextMenu',
function(aSignal) {

    /**
     * @method handleShowContextMenu
     * @summary Handles notifications of wanting to show the context menu.
     * @param {TP.sig.ShowContextMenu} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    //  Focus the halo and then let the rest of the context menu machinery show
    //  the popup menu, etc.
    this.handleFocusHaloFromANYWhenANY(aSignal);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('getContentTagForContextMenu',
function(aSignal) {

    /**
     * @method getContentTagForContextMenu
     * @summary Returns the tag name of the content to use in a context menu.
     *     Note that this should return the plain (possibly namespaced) name
     *     with no markup bracketing, etc.
     * @param {TP.sig.ShowContextMenu} aSignal The TIBET signal which triggered
     *     the context menu to show and menu content to be required.
     * @returns {String} The name of the tag to use as content for the context
     *     menu.
     */

    var targetElem;

    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return 'lama:respondershudContextMenuContent';
    }

    return 'lama:respondershudItemContextMenuContent';
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('getHandlerMethodsFor',
function(aType) {

    /**
     * @method getHandlerMethodsFor
     * @summary Retrieves the (instance-level) handler methods for the supplied
     *     type.
     * @param {TP.lang.RootObject} aType The type to produce the handler methods
     *     for.
     * @returns {String[][]} An Array of Arrays containing the names of the
     *     instance-level 'handler only' methods for the supplied type.
     */

    var sourceType,

        result,

        instProto,
        superInstProto,

        rawData;

    sourceType = aType;

    result = TP.ac();

    instProto = sourceType.getInstPrototype();
    superInstProto = sourceType.getSupertype().getInstPrototype();

    //  ---

    //  Methods introduced on the type itself.

    result.push(TP.GROUPING_PREFIX + ' - Introduced');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_introduced_methods).sort();

    rawData = rawData.filter(
                    function(item) {
                        return TP.regex.HANDLER_NAME.test(item);
                    });

    result.push(rawData);

    //  ---

    //  Methods overridden from a supertype on the type.

    result.push(TP.GROUPING_PREFIX + ' - Overridden');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_overridden_methods).sort();

    rawData = rawData.filter(
                    function(item) {
                        return TP.regex.HANDLER_NAME.test(item);
                    });

    rawData.forEach(
            function(item) {
                var owner;

                //  Note here how we get the owner from our supertype's version
                //  of the method - we know we've overridden it, so we want the
                //  owner we've overridden it from.
                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = superInstProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    //  ---

    //  Methods inherited from a supertype on the type.

    result.push(TP.GROUPING_PREFIX + ' - Inherited');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_inherited_methods).sort();

    rawData = rawData.filter(
                    function(item) {
                        return TP.regex.HANDLER_NAME.test(item);
                    });

    rawData.forEach(
            function(item) {
                var owner;

                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = instProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    result = result.flatten();

    result = result.collect(
                function(entry) {
                    return TP.ac(
                            entry,
                            entry);
                });

    return result;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.extern.d3.selection} The supplied enter selection or a new
     *     selection containing any new content that was added.
     */

    var newContent;

    newContent = enterSelection.append('li');
    newContent.attr(
            'pclass:selected',
            function(d) {
                if (TP.isTrue(d[2])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'dataindex',
            function(d, i) {
                return i;
            }).text(
            function(d) {
                return d[1];
            }).attr('type',
            function(d) {
                return d[2];
            }).classed('item', true);

    return newContent;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    updateSelection.attr(
            'pclass:selected',
            function(d) {
                if (TP.isTrue(d[2])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'dataindex',
            function(d, i) {
                return i;
            }).text(
            function(d) {
                return d[1];
            }).attr('type',
            function(d) {
                return d[2];
            }).classed('item', true);

    return updateSelection;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineHandler('ToggleHighlight',
function(aSignal) {

    /**
     * @method ToggleHighlight
     * @summary Responds to mouse over/out notifications by toggling a
     *     class on individual peer elements. The result is that as the user
     *     hovers over elements in the sidebar the corresponding element in
     *     the canvas gets a 'lama-hud-highlight' class add/removed.
     * @param {TP.sig.ToggleHighlight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.respondershud} The receiver.
     */

    var uiDoc,

        oldTarget,
        target,
        targetData,
        targetDocElem,
        targetElem,
        peerID,

        hudInjectedStyleElement;

    //  Grab the UI canvas's document
    uiDoc = TP.sys.uidoc(true);

    //  Grab the highlighted element.
    oldTarget = this.get('highlighted');

    //  If oldTarget is valid, then we need to clear the highlighted element
    if (TP.isValid(oldTarget)) {

        //  Clear the oldTarget of the highlight class
        TP.elementRemoveClass(oldTarget, 'lama-hud-highlight');
        this.$set('highlighted', null, false);

        //  Grab the document element and remove the class that indicates that
        //  we're highlighting.
        targetDocElem = uiDoc.documentElement;
        TP.elementRemoveClass(targetDocElem, 'lama-hud-highlighting');
    }

    //  Grab the new 'DOM target' element, which will be the lozenge that the
    //  user is highlighting.
    targetElem = aSignal.getDOMTarget();

    //  If element doesn't have an 'dataindex' it's not something we can use.
    if (!TP.elementHasAttribute(targetElem, 'dataindex')) {
        return this;
    }

    //  The peerID on the lozenge will indicate which element in the UI canvas
    //  it is representing. If we don't have one, we exit.
    targetData = this.data.at(TP.elementGetAttribute(targetElem, 'dataindex'));
    if (TP.isEmpty(targetData)) {
        return this;
    }

    peerID = targetData.at(0);

    //  We can't highlight actual types like controllers. We need an ID to an
    //  element for proper highlighting.
    if (TP.regex.HAS_PERIOD.test(peerID)) {
        return this;
    }

    //  Query the DOM of the UI canvas for the target element.
    target = TP.byId(peerID, uiDoc, false);
    if (!TP.isElement(target)) {
        return this;
    }

    //  If the target and the old target are the same, then just exit here.
    if (target === oldTarget) {
        return this;
    }

    //  Grab the style sheet that the HUD injected into the UI canvas.
    hudInjectedStyleElement = TP.byId('hud_injected_generated',
                                        uiDoc,
                                        false);

    //  Set the '--lama-hud-highlight-color' to a light opacity version of our
    //  full color.
    TP.cssElementSetCustomCSSPropertyValue(
        hudInjectedStyleElement,
        '.lama-hud',
        '--lama-hud-highlight-color',
        'rgba(134, 175, 155, 0.3)',
        null,
        false);

    //  Add the highlight class to the target.
    TP.elementAddClass(target, 'lama-hud-highlight');
    this.$set('highlighted', target, false);

    //  Grab the document element and add the class that indicates that we're
    //  highlighting.
    targetDocElem = uiDoc.documentElement;
    TP.elementAddClass(targetDocElem, 'lama-hud-highlighting');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.respondershud.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.respondershud} The receiver.
     */

    this.callNextMethod();

    if (shouldObserve) {
        this.observe(this, 'TP.sig.LamaConnectCompleted');
    } else {
        this.ignore(this, 'TP.sig.LamaConnectCompleted');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
