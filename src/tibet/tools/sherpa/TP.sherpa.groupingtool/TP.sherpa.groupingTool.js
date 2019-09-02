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
 * @type {TP.sherpa.groupingTool}
 */

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.defineSubtype('groupingTool');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineAttribute('$sizingRect');
TP.sherpa.groupingTool.Inst.defineAttribute('$containedNodes');
TP.sherpa.groupingTool.Inst.defineAttribute('$childRecords');
TP.sherpa.groupingTool.Inst.defineAttribute('$descendantRecords');
TP.sherpa.groupingTool.Inst.defineAttribute('$uiTarget');

TP.sherpa.groupingTool.Inst.defineAttribute(
    'groupingbox',
    TP.cpc('> #groupingbox', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineMethod('activate',
function(aTargetTPElem, aSignal) {

    /**
     * @method activate
     * @summary Activates the receiver.
     * @param {TP.dom.ElementNode} aTargetTPElem The element that the receiver
     *     will be activated on.
     * @param {TP.sig.Signal} [aSignal] An optional signal that caused the
     *     receiver to activate.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    var sizingRect,

        groupingBoxStyleVals,

        halo,
        uiTarget,

        allChildTPNodes,
        allDescendantTPNodes,

        appTPElem,

        childRecords,
        descendantRecords,
        containedNodes;

    this.callNextMethod();

    sizingRect = TP.rtc(
                    aSignal.getPageX(),
                    aSignal.getPageY(),
                    0,
                    0);

    this.$set('$sizingRect', sizingRect, false);

    groupingBoxStyleVals = TP.elementGetComputedStyleValuesInPixels(
                            this.get('groupingbox').getNativeNode(),
                            TP.ac('borderTopWidth', 'borderRightWidth',
                                    'borderBottomWidth', 'borderLeftWidth'));

    //  Add the border of the groupingbox to the screen offset point.
    this.$get('$screenOffsetPoint').addToX(
                    groupingBoxStyleVals.at('borderLeftWidth') +
                    groupingBoxStyleVals.at('borderRightWidth'));

    this.$get('$screenOffsetPoint').addToY(
                    groupingBoxStyleVals.at('borderTopWidth') +
                    groupingBoxStyleVals.at('borderBottomWidth'));

    //  Grab the halo and make sure it's focused. If not, we just bail out here.
    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    if (!halo.isFocused()) {
        uiTarget = TP.sys.uidoc().getBody();
    } else {
        uiTarget = halo.get('currentTargetTPElem');
    }
    this.$set('$uiTarget', uiTarget);

    allChildTPNodes = uiTarget.getDescendants();
    allDescendantTPNodes = uiTarget.getDescendants();

    appTPElem = TP.bySystemId('Sherpa').getAppElement();

    //  Make sure to remov the app element from both collections here
    allChildTPNodes.remove(appTPElem);
    allDescendantTPNodes.remove(appTPElem);

    childRecords = TP.ac();
    this.$set('$childRecords', childRecords);

    allChildTPNodes.forEach(
        function(aTPNode) {
            var rect;

            rect = aTPNode.getPageRect();

            if (TP.notEmpty(rect)) {
                childRecords.push(TP.ac(aTPNode.getNativeNode(), rect));
            }
        });

    descendantRecords = TP.ac();
    this.$set('$descendantRecords', descendantRecords);

    allDescendantTPNodes.forEach(
        function(aTPNode) {
            var rect;

            rect = aTPNode.getPageRect();

            if (TP.notEmpty(rect)) {
                descendantRecords.push(TP.ac(aTPNode.getNativeNode(), rect));
            }
        });

    containedNodes = TP.ac();
    this.$set('$containedNodes', containedNodes);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is dragging.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    var sizingRect,

        offsetX,
        offsetY,

        doc,

        containedNodes,
        oldTargetRecords,
        targetRecords,

        natWindow;

    sizingRect = this.$get('$sizingRect');

    if (TP.isKindOf(aSignal, TP.sig.DOMMouseSignal)) {
        offsetX = this.$get('$screenOffsetPoint').getX();
        offsetY = this.$get('$screenOffsetPoint').getY();

        sizingRect.setWidth(aSignal.getPageX() - sizingRect.getX() + offsetX);
        sizingRect.setHeight(aSignal.getPageY() - sizingRect.getY() + offsetY);
    }

    doc = TP.sys.uidoc(true);

    containedNodes = this.$get('$containedNodes');

    if (aSignal.getMetaKey() === true) {
        oldTargetRecords = this.$get('$childRecords');
        targetRecords = this.$get('$descendantRecords');
    } else {
        oldTargetRecords = this.$get('$descendantRecords');
        targetRecords = this.$get('$childRecords');
    }

    oldTargetRecords.perform(
        function(record) {
            var node;

            node = record.first();

            if (TP.isElement(node)) {
                TP.elementRemoveClass(node, 'sherpa-grouping-grouped');
            }
        });

    containedNodes.empty();

    targetRecords.perform(
        function(record) {
            var node,
                rect;

            node = record.first();
            rect = record.last();

            if (sizingRect.containsRect(rect)) {
                if (containedNodes.indexOf(node) === TP.NOT_FOUND) {
                    containedNodes.push(node);
                }

                if (TP.isElement(node)) {
                    TP.elementAddClass(node, 'sherpa-grouping-grouped');
                }
            }
        });

    natWindow = this.getNativeWindow();

    (function() {
        this.render();
    }.bind(this)).queueForNextRepaint(natWindow);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is done with dragging and the mouse button
     *     has gone up.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    var containedNodes;

    containedNodes = this.$get('$containedNodes');

    if (TP.notEmpty(containedNodes)) {
        containedNodes.forEach(
            function(aNode) {
                if (TP.isElement(aNode)) {
                    TP.elementRemoveClass(aNode, 'sherpa-grouping-grouped');
                }
            });

        TP.sys.uidoc().signal('SherpaGroupingCompleted',
                                TP.hc('groupingTarget', this.get('$uiTarget'),
                                        'groupedNodes', containedNodes));
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineHandler('DOMModifierKeyChange',
function(aSignal) {

    /**
     * @method handleDOMModifierKeyChange
     * @param {TP.sig.DOMModifierKeyChange} aSignal The TIBET signal which
     *     triggered this handler.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    return this.handleDOMDragMoveFromANYWhenANY(aSignal);
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineHandler('ScreenWillToggle',
function(aSignal) {

    /**
     * @method handleScreenWillToggle
     * @summary Handles notifications of screen will toggle signals.
     * @param {TP.sig.ScreenWillToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    var world,

        oldScreenTPWin;

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());

    //  Grab the world's current screen TP.core.Window and ignore it for when
    //  it's document unloads & loads so that we can stop managing our click &
    //  context menu observations.
    oldScreenTPWin = world.get('selectedScreen').getContentWindow();
    this.ignore(oldScreenTPWin, 'DocumentLoaded');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineHandler('ScreenDidToggle',
function(aSignal) {

    /**
     * @method handleScreenDidToggle
     * @summary Handles notifications of screen did toggle signals.
     * @param {TP.sig.ScreenDidToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    var world,

        newScreen,
        newScreenTPWin;

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());

    //  Grab the new screen TP.core.Window and observe
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    newScreen = world.get('screens').at(aSignal.at('screenIndex'));

    if (TP.isValid(newScreen)) {
        newScreenTPWin = newScreen.getContentWindow();
        this.observe(newScreenTPWin, 'DocumentLoaded');
    }

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    var sizingRect;

    sizingRect = this.$get('$sizingRect');

    this.get('groupingbox').setOffsetPositionAndSize(sizingRect);

    /*
    coordsRect = TP.rtc(x + sizingRect.getWidth(), y + sizingRect.getHeight(),
                        sizingRect.getWidth(), sizingRect.getHeight());

    this.get('sizecoordinates').setOffsetPositionAndSize(coordsRect);
    this.get('sizecoordinates').setTextContent(
        '(' + haloTargetTPElem.getWidth().floor() +
        ',' + haloTargetTPElem.getHeight().floor() +
        ')');
    */

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary Sets the 'hidden' attribute of the receiver. This causes the
     *     grouping tool to show or hide itself independent of whether it's
     *     focused or not.
     * @param {Boolean} beHidden Whether or not the grouping tool should be
     *     hidden.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var wasHidden,

        doc,

        groupingStyleElement;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return wasHidden;
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    this.callNextMethod();

    //  Grab the current UI canvas document.
    doc = TP.sys.uidoc(true);

    if (TP.isTrue(beHidden)) {

        //  Grab the styles that the grouping tool injects into the UI canvas
        //  and disable that style element.
        groupingStyleElement = TP.byId('grouping_injected_generated', doc, false);
        if (TP.isElement(groupingStyleElement)) {
            groupingStyleElement.disabled = true;
        }
    } else {

        //  Grab the styles that the grouping tool injects into the UI canvas
        //  and enable that style element.
        groupingStyleElement = TP.byId('grouping_injected_generated', doc, false);
        if (TP.isElement(groupingStyleElement)) {
            groupingStyleElement.disabled = false;
        }
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    return beHidden;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineMethod('setupInjectedStyleSheet',
function() {

    /**
     * @method setupInjectedStyleSheet
     * @summary Set up the stylesheet that will be 'injected' into the UI canvas
     *     so that the grouping tool can affect visual changes in the UI canvas.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    var doc,
        styleElement;

    doc = TP.sys.uidoc(true);

    styleElement = TP.byId('grouping_injected_generated', doc, false);

    if (!TP.isElement(styleElement)) {
        styleElement = TP.documentAddCSSElement(
            doc,
            TP.uc('~TP.sherpa.groupingTool/TP.sherpa.grouping_injected.css').
                                                                getLocation(),
            true,
            false);

        TP.elementSetAttribute(
                styleElement, 'id', 'grouping_injected_generated');

        //  Mark the sheet as 'TIBET_PRIVATE' so that it's style rules are not
        //  considered when the element's style rules are computed.
        styleElement[TP.TIBET_PRIVATE] = true;

        //  Mark this element as one that was generated by TIBET and shouldn't
        //  be considered in CSS queries, etc.
        styleElement[TP.GENERATED] = true;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.groupingTool.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.sherpa.groupingTool} The receiver.
     */

    var world,
        currentScreenTPWin;

    if (shouldObserve) {

        //  Grab the world's current screen TP.core.Window and observe it for
        //  when it's document unloads & loads so that we can manage our click &
        //  context menu observations.
        world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
        this.observe(world, TP.ac('ScreenWillToggle', 'ScreenDidToggle'));

        currentScreenTPWin = world.get('selectedScreen').getContentWindow();
        this.observe(currentScreenTPWin, 'DocumentLoaded');

    } else {

        //  Grab the world's current screen TP.core.Window and ignore it for
        //  when it's document unloads & loads so that we can stop managing our
        //  click & context menu observations.
        world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
        this.ignore(world, TP.ac('ScreenWillToggle', 'ScreenDidToggle'));

        currentScreenTPWin = world.get('selectedScreen').getContentWindow();
        this.ignore(currentScreenTPWin, 'DocumentLoaded');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
