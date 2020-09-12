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
 * @type {TP.lama.gridManipulator}
 */

//  ------------------------------------------------------------------------

TP.lama.manipulator.defineSubtype('gridManipulator');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.lama.gridManipulator.Type.defineConstant('RULE_TEMPLATE',
    '--lama-halo-multiplier-cols: 1;' +
    '--lama-halo-multiplier-rows: 1;' +

    '--lama-halo-multiplier-min-width: 10px;' +
    '--lama-halo-multiplier-min-height: 10px;' +

    'min-width: --lama-halo-multiplier-min-width;' +
    'min-height: --lama-halo-multiplier-min-height;' +

    'grid-template-columns: repeat(var(--lama-halo-multiplier-cols), 1fr);' +
    'grid-template-rows: repeat(var(--lama-halo-multiplier-rows), 1fr);');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.gridManipulator.Inst.defineAttribute('$multiplierNumRows');
TP.lama.gridManipulator.Inst.defineAttribute('$multiplierNumCols');

TP.lama.gridManipulator.Inst.defineAttribute('$multiplierTargetWidth');
TP.lama.gridManipulator.Inst.defineAttribute('$multiplierTargetHeight');

TP.lama.gridManipulator.Inst.defineAttribute('$currentGridTPElement');
TP.lama.gridManipulator.Inst.defineAttribute('$multiplierTemplateTPElement');

TP.lama.gridManipulator.Inst.defineAttribute('$changesMadeAfterDragUp');
TP.lama.gridManipulator.Inst.defineAttribute('$targetLamaID');

TP.lama.gridManipulator.Inst.defineAttribute(
    'northguide',
    TP.cpc('> #northguide', TP.hc('shouldCollapse', true)));

TP.lama.gridManipulator.Inst.defineAttribute(
    'westguide',
    TP.cpc('> #westguide', TP.hc('shouldCollapse', true)));

TP.lama.gridManipulator.Inst.defineAttribute(
    'southguide',
    TP.cpc('> #southguide', TP.hc('shouldCollapse', true)));

TP.lama.gridManipulator.Inst.defineAttribute(
    'eastguide',
    TP.cpc('> #eastguide', TP.hc('shouldCollapse', true)));

TP.lama.gridManipulator.Inst.defineAttribute(
    'rowscolsreadout',
    TP.cpc('> #rowscolsreadout', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.gridManipulator.Inst.defineMethod('activate',
function(aTargetTPElem, aSignal) {

    /**
     * @method activate
     * @summary Activates the receiver.
     * @param {TP.dom.ElementNode} aTargetTPElem The element that the receiver
     *     will be activated on.
     * @param {TP.sig.Signal} [aSignal] An optional signal that caused the
     *     receiver to activate.
     * @returns {TP.lama.gridManipulator} The receiver.
     */

    var targetElem,

        gridTPElement,
        gridElem,

        wasPositioned,
        position,
        pageBox,
        top,
        left,

        width,
        height,

        gridCellElem,
        gridCellTPElem,

        modifyingRule,

        multiplierTemplateTPElement,

        halo,

        numRows,
        numCols;

    targetElem = aTargetTPElem.getNativeNode();

    gridTPElement = aTargetTPElem.lamaGetNearestMultipliedElement();
    if (TP.notValid(gridTPElement)) {

        //  We didn't find one - create one and insert it.
        gridElem = TP.documentConstructElement(this.getNativeDocument(),
                                                'div',
                                                TP.w3.Xmlns.XHTML);

        TP.elementSetAttribute(
                gridElem, 'tibet:tag', 'dom:MultipliedElement', true);
        TP.elementSetAttribute(
                gridElem, 'lama:multiplied', 'true', true);

        gridTPElement = TP.wrap(gridElem);

        this.$set('$multiplierNumRows', 1, false);
        this.$set('$multiplierNumCols', 1, false);

        this.callNextMethod();

        wasPositioned = false;

        //  If the element that we're going to be multiplying is positioned,
        //  then grab it's position, top and left values. We're going to
        //  position the grid element and want those values.
        if (TP.elementIsPositioned(targetElem)) {
            wasPositioned = true;

            position = TP.elementGetComputedStyleProperty(targetElem,
                                                            'position');

            pageBox = TP.elementGetBorderBox(targetElem);
            top = pageBox.at('top');
            left = pageBox.at('left');
        }

        //  Create a grid cell element that we can clone as we drag using the
        //  target. Note that the target element will be cloned here and, after
        //  it is replaced below, targetElem will no longer point to any element
        //  in the visual DOM.
        gridCellElem = this.$makeMultiplierCell(gridElem, targetElem);

        //  Set the Lama to process DOM mutations. Note that we set the
        //  'isSticky' parameter of this method to true (the 2nd 'true'), which
        //  means that the setting with *not* reset until we deactivate and we
        //  also supply the grid element as the root of the mutations.
        TP.bySystemId('Lama').set(
                'shouldProcessDOMMutations', true, true);

        //  Swap the target element for the grid element.
        gridElem = TP.nodeReplaceChild(
                            targetElem.parentNode, gridElem, targetElem, false);
        gridTPElement = TP.wrap(gridElem);

        modifyingRule = TP.bySystemId('Lama').getOrMakeModifiableRule(
                                    gridTPElement,
                                    this.getType().RULE_TEMPLATE);

        //  If the original element was positioned, then we want to position the
        //  grid element where it was.
        if (wasPositioned) {
            TP.styleRuleSetProperty(modifyingRule, 'display', 'grid', true);
            TP.styleRuleSetProperty(modifyingRule, 'position', position, true);
            TP.styleRuleSetProperty(modifyingRule, 'top', top + 'px', true);
            TP.styleRuleSetProperty(modifyingRule, 'left', left + 'px', true);
        } else {
            TP.styleRuleSetProperty(
                                modifyingRule, 'display', 'inline-grid', true);
        }

        //  Append an initial cell element into the grid. This effectively 'puts
        //  back' the target, but now wrapped in the grid element.
        gridCellElem = TP.nodeAppendChild(gridElem, gridCellElem, false);

        gridCellTPElem = TP.wrap(gridCellElem);

        //  Grab the width and height of the newly added grid cell element. This
        //  is the only accurate way to measure - we wants the dimensions of the
        //  element that we're really multiplying.
        width = gridCellTPElem.getWidth();
        height = gridCellTPElem.getHeight();

        this.$set('$multiplierTargetWidth', width, false);
        this.$set('$multiplierTargetHeight', height, false);

        //  Set the initial width & height of the overall grid element to the
        //  width and height of the multiplier element.

        //  Note that we can pass 'false' for these two properties, since we set
        //  them one final time in the DOMDragUp handler with a 'true'.
        TP.styleRuleSetProperty(modifyingRule, 'width', width + 'px', false);
        TP.styleRuleSetProperty(modifyingRule, 'height', height + 'px', false);

        TP.styleRuleSetProperty(modifyingRule,
                                '--lama-halo-multiplier-min-width',
                                width + 'px',
                                true);

        TP.styleRuleSetProperty(modifyingRule,
                                '--lama-halo-multiplier-min-height',
                                height + 'px',
                                true);

        multiplierTemplateTPElement = aTargetTPElem;

        //  Focus the halo onto the grid element.
        halo = TP.byId('LamaHalo', this.getNativeDocument());
        halo.focusOn(gridTPElement, true);

    } else {
        gridElem = gridTPElement.getNativeNode();

        //  Set the Lama to process DOM mutations. Note that we set the
        //  'isSticky' parameter of this method to true (the 2nd 'true'), which
        //  means that the setting with *not* reset until we deactivate and we
        //  also supply the grid element as the root of the mutations.
        TP.bySystemId('Lama').set(
                'shouldProcessDOMMutations', true, true);

        modifyingRule = TP.bySystemId('Lama').getOrMakeModifiableRule(
                                    gridTPElement,
                                    this.getType().RULE_TEMPLATE);

        numRows = modifyingRule.style.getPropertyValue(
                        '--lama-halo-multiplier-rows').asNumber();
        numCols = modifyingRule.style.getPropertyValue(
                        '--lama-halo-multiplier-cols').asNumber();

        this.$set('$multiplierNumRows', numRows, false);
        this.$set('$multiplierNumCols', numCols, false);

        multiplierTemplateTPElement = gridTPElement.getFirstChildElement();

        width = multiplierTemplateTPElement.getWidth();
        height = multiplierTemplateTPElement.getHeight();

        this.$set('$multiplierTargetWidth', width, false);
        this.$set('$multiplierTargetHeight', height, false);

        TP.styleRuleSetProperty(modifyingRule,
                                '--lama-halo-multiplier-min-width',
                                width + 'px',
                                true);

        TP.styleRuleSetProperty(modifyingRule,
                                '--lama-halo-multiplier-min-height',
                                height + 'px',
                                true);

        this.callNextMethod();

        //  No need to focus the halo here - it's already focused on the grid
        //  element.
    }

    this.$set('$currentGridTPElement', gridTPElement);
    this.$set('$multiplierTemplateTPElement', multiplierTemplateTPElement);

    this.$set('$currentModifyingRule', modifyingRule);

    this.$set('$changesMadeAfterDragUp', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.gridManipulator.Inst.defineMethod('deactivate',
function() {

    /**
     * @method deactivate
     * @summary Deactivates the receiver.
     * @returns {TP.lama.gridManipulator} The receiver.
     */

    this.$set('$multiplierNumRows', -1);
    this.$set('$multiplierNumCols', -1);

    this.$set('$multiplierTargetWidth', 0);
    this.$set('$multiplierTargetHeight', 0);

    this.$set('$currentGridTPElement', null);
    this.$set('$multiplierTemplateTPElement', null);

    this.$set('$targetLamaID', null);

    //  If there were changes made *after* the drag up, then we go ahead and set
    //  the shouldProcessDOMMutations flag to true again, but this time without
    //  the 'isSticky' parameter set to true, which means it will time out after
    //  a certain amount of time and reset itself back to false.
    if (TP.isTrue(this.$get('$changesMadeAfterDragUp'))) {
        TP.bySystemId('Lama').set('shouldProcessDOMMutations', true);
    } else {
        //  No changes after the drag up, which means that all of the mutations
        //  will have been processed during the drag itself, so we just turn the
        //  shouldProcessDOMMutations flag to false.
        TP.bySystemId('Lama').set('shouldProcessDOMMutations', false);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.gridManipulator.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is dragging.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.gridManipulator} The receiver.
     */

    var targetWidth,
        targetHeight,

        oldNumCols,
        oldNumRows,

        gridTPElement,
        gridElem,

        currentGridBox,

        gridWidth,
        gridHeight,

        numCols,
        numRows,

        multiplierElem,

        gridChildElementCount,
        shouldHaveCount,

        numToGenerate,
        i,
        newElem,
        numToRemove,

        modifyingRule,

        halo;

    targetWidth = this.$get('$multiplierTargetWidth');
    targetHeight = this.$get('$multiplierTargetHeight');

    oldNumCols = this.$get('$multiplierNumCols');
    oldNumRows = this.$get('$multiplierNumRows');

    gridTPElement = this.$get('$currentGridTPElement');
    gridElem = gridTPElement.getNativeNode();

    currentGridBox = TP.elementGetBorderBox(gridTPElement.getNativeNode(),
                                            false);

    gridWidth = aSignal.getPageXAdjustedFor(gridElem) -
                    currentGridBox.at('left');
    gridHeight = aSignal.getPageYAdjustedFor(gridElem) -
                    currentGridBox.at('top');

    modifyingRule = this.$get('$currentModifyingRule');

    TP.styleRuleSetProperty(modifyingRule, 'width', gridWidth + 'px', false);
    TP.styleRuleSetProperty(modifyingRule, 'height', gridHeight + 'px', false);

    numRows = (gridHeight / targetHeight).floor();
    numCols = (gridWidth / targetWidth).floor();

    numRows = numRows.max(1);
    numCols = numCols.max(1);

    multiplierElem = this.$get('$multiplierTemplateTPElement').getNativeNode();

    if (numRows !== oldNumRows || numCols !== oldNumCols) {

        gridChildElementCount = gridElem.childElementCount;

        shouldHaveCount = numRows * numCols;

        if (shouldHaveCount > gridChildElementCount) {
            numToGenerate = shouldHaveCount - gridChildElementCount;
            for (i = 0; i < numToGenerate; i++) {
                newElem = this.$makeMultiplierCell(gridElem, multiplierElem);
                newElem = TP.nodeAppendChild(gridElem, newElem, false);
            }

        } else if (shouldHaveCount < gridChildElementCount) {
            numToRemove = gridChildElementCount - shouldHaveCount;
            for (i = 0; i < numToRemove; i++) {
                TP.nodeRemoveChild(gridElem, gridElem.lastElementChild);
            }
        }

        TP.styleRuleSetProperty(modifyingRule,
                                '--lama-halo-multiplier-rows',
                                numRows,
                                false);

        this.$set('$multiplierNumRows', numRows, false);

        TP.styleRuleSetProperty(modifyingRule,
                                '--lama-halo-multiplier-cols',
                                numCols,
                                false);

        this.$set('$multiplierNumCols', numCols, false);
    }

    halo = TP.byId('LamaHalo', this.getNativeDocument());
    halo.moveAndSizeToTarget();

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.gridManipulator.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is done with dragging and the mouse button
     *     has gone up.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.gridManipulator} The receiver.
     */

    var numRows,
        numCols,

        halo,

        gridTPElem,
        gridElem,

        soleTargetElem,

        targetLamaID,

        soleTargetTPElem,

        modifyingRule,

        gridWidth,
        gridHeight;

    numRows = this.$get('$multiplierNumRows');
    numCols = this.$get('$multiplierNumCols');

    halo = TP.byId('LamaHalo', this.getNativeDocument());

    gridTPElem = this.$get('$currentGridTPElement');

    //  If there is only one row and column, then the user shrank the grid back
    //  to 1X1 and we'll just take out the grid and put (a clone of) the target
    //  element back.
    if (numRows === 1 && numCols === 1) {
        gridElem = gridTPElem.getNativeNode();

        soleTargetElem = gridElem.firstElementChild.firstElementChild;

        soleTargetElem =
            TP.nodeReplaceChild(
                        gridElem.parentNode, soleTargetElem, gridElem, false);

        //  If there was a target lamaID, that means that the user *started*
        //  with a 1X1 grid as well and is just 'putting things back to what
        //  they were before', so we just put the lamaID back.
        targetLamaID = this.$get('$targetLamaID');
        if (TP.isValid(targetLamaID)) {
            TP.elementSetAttribute(
                soleTargetElem, 'lamaID', targetLamaID, true);
        }

        soleTargetTPElem = TP.wrap(soleTargetElem);

        //  Focus the halo onto the grid element.
        halo.focusOn(soleTargetTPElem, true);

        this.$set('$changesMadeAfterDragUp', true);

    } else {

        modifyingRule = this.$get('$currentModifyingRule');

        gridWidth = gridTPElem.getWidth();
        gridHeight = gridTPElem.getHeight();

        TP.styleRuleSetProperty(modifyingRule, 'width', gridWidth + 'px', true);
        TP.styleRuleSetProperty(modifyingRule, 'height', gridHeight + 'px', true);

        numCols = this.$get('$multiplierNumCols');
        numRows = this.$get('$multiplierNumRows');

        TP.styleRuleSetProperty(modifyingRule,
                                '--lama-halo-multiplier-rows',
                                numRows,
                                true);

        TP.styleRuleSetProperty(modifyingRule,
                                '--lama-halo-multiplier-cols',
                                numCols,
                                true);

        halo.moveAndSizeToTarget();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.gridManipulator.Inst.defineMethod('$makeMultiplierCell',
function(gridElem, targetElem) {

    /**
     * @method $makeMultiplierCell
     * @summary Creates a new 'cell' containing a cloned version of the supplied
     *     target element and a wrapping 'cell' element.
     * @param {Element} gridElem The grid element that the multiplier 'cell'
     *     will be added to.
     * @param {Element} targetElem The element to wrap into a multiplier cell.
     * @returns {Element} The wrapping 'cell' element.
     */

    var doc,

        wrapperElem,
        targetCloneElem;

    doc = TP.nodeGetDocument(gridElem);

    wrapperElem = TP.documentConstructElement(doc, 'div', TP.w3.Xmlns.XHTML);
    TP.elementSetAttribute(wrapperElem, 'lama:multipliercell', 'true', true);

    targetCloneElem = TP.nodeCloneNode(targetElem);

    TP.elementRemoveAttribute(targetCloneElem, 'id', true);

    //  If the element has a 'lamaID', then stash it away before we remove it.
    //  This is because, if the grid is starting from one target element to
    //  clone and then the user changes their mind and we end up with one row
    //  and one column, then the grid will be removed and a clone of the target
    //  element (the first cell) will be put in its place. We want that to have
    //  the same lamaID if possible.
    if (TP.elementHasAttribute(targetCloneElem, 'lamaID', true)) {
        this.$set('$targetLamaID',
                    TP.elementGetAttribute(targetCloneElem, 'lamaID', true));
        TP.elementRemoveAttribute(targetCloneElem, 'lamaID', true);
    }

    TP.nodeAppendChild(wrapperElem, targetCloneElem, false);

    return wrapperElem;
});

//  ------------------------------------------------------------------------

TP.lama.gridManipulator.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.lama.gridManipulator} The receiver.
     */

    var ourRect,

        haloTargetTPElem,
        halo,

        targetRect,

        x,
        y,

        northRect,
        westRect,
        southRect,
        eastRect,

        coordsRect;

    ourRect = this.getOffsetParent().getGlobalRect(false);

    haloTargetTPElem = this.$get('$currentGridTPElement');
    if (TP.notValid(haloTargetTPElem)) {
        return this;
    }

    halo = TP.byId('LamaHalo', TP.sys.getUIRoot());

    targetRect = haloTargetTPElem.getHaloRect(halo);
    targetRect.subtractByPoint(ourRect.getXYPoint());

    x = targetRect.getX();
    y = targetRect.getY();

    northRect = TP.rtc(x, y, targetRect.getWidth(), 0.0);
    this.get('northguide').setOffsetPositionAndSize(northRect);

    westRect = TP.rtc(x, y, 0.0, targetRect.getHeight());
    this.get('westguide').setOffsetPositionAndSize(westRect);

    southRect = TP.rtc(x, y + targetRect.getHeight(),
                        targetRect.getWidth(), 0.0);
    this.get('southguide').setOffsetPositionAndSize(southRect);

    eastRect = TP.rtc(x + targetRect.getWidth(), y,
                        0.0, targetRect.getHeight());
    this.get('eastguide').setOffsetPositionAndSize(eastRect);

    coordsRect = TP.rtc(x + targetRect.getWidth(), y + targetRect.getHeight(),
                        targetRect.getWidth(), targetRect.getHeight());
    this.get('rowscolsreadout').setOffsetPositionAndSize(coordsRect);
    this.get('rowscolsreadout').setTextContent(
        this.$get('$multiplierNumRows') + ' rows ' +
        this.$get('$multiplierNumCols') + ' cols');

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
