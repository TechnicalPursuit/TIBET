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
 * @type {TP.sherpa.gridManipulator}
 */

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.defineSubtype('gridManipulator');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.sherpa.gridManipulator.Type.defineConstant('RULE_TEMPLATE',
    '--sherpa-halo-multiplier-cols: 1;' +
    '--sherpa-halo-multiplier-rows: 1;' +

    '--sherpa-halo-multiplier-min-width: 10px;' +
    '--sherpa-halo-multiplier-min-height: 10px;' +

    'display: inline-grid;' +

    'min-width: --sherpa-halo-multiplier-min-width;' +
    'min-height: --sherpa-halo-multiplier-min-height;' +

    'grid-template-columns: repeat(var(--sherpa-halo-multiplier-cols), 1fr);' +
    'grid-template-rows: repeat(var(--sherpa-halo-multiplier-rows), 1fr);');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.gridManipulator.Inst.defineAttribute('$multiplierNumRows');
TP.sherpa.gridManipulator.Inst.defineAttribute('$multiplierNumCols');

TP.sherpa.gridManipulator.Inst.defineAttribute('$multiplierTargetWidth');
TP.sherpa.gridManipulator.Inst.defineAttribute('$multiplierTargetHeight');

TP.sherpa.gridManipulator.Inst.defineAttribute('$currentGridTPElement');
TP.sherpa.gridManipulator.Inst.defineAttribute('$multiplierTemplateTPElement');

TP.sherpa.gridManipulator.Inst.defineAttribute(
    'northguide',
    TP.cpc('> #northguide', TP.hc('shouldCollapse', true)));

TP.sherpa.gridManipulator.Inst.defineAttribute(
    'westguide',
    TP.cpc('> #westguide', TP.hc('shouldCollapse', true)));

TP.sherpa.gridManipulator.Inst.defineAttribute(
    'southguide',
    TP.cpc('> #southguide', TP.hc('shouldCollapse', true)));

TP.sherpa.gridManipulator.Inst.defineAttribute(
    'eastguide',
    TP.cpc('> #eastguide', TP.hc('shouldCollapse', true)));

TP.sherpa.gridManipulator.Inst.defineAttribute(
    'rowscolsreadout',
    TP.cpc('> #rowscolsreadout', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.gridManipulator.Inst.defineMethod('activate',
function(aTargetTPElem, aSignal) {

    /**
     * @method activate
     * @summary Activates the receiver.
     * @param {TP.dom.ElementNode} aTargetTPElem The element that the receiver
     *     will be activated on.
     * @param {TP.sig.Signal} [aSignal] An optional signal that caused the
     *     receiver to activate.
     * @returns {TP.sherpa.gridManipulator} The receiver.
     */

    var targetElem,

        gridTPElement,
        gridElem,

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

    gridTPElement = aTargetTPElem.sherpaGetNearestMultipliedElement();
    if (TP.notValid(gridTPElement)) {

        //  We didn't find one - create one and insert it.
        gridElem = TP.documentConstructElement(this.getNativeDocument(),
                                                'div',
                                                TP.w3.Xmlns.XHTML);

        TP.elementSetAttribute(gridElem, 'sherpa:multiplied', 'true', true);
        gridTPElement = TP.wrap(gridElem);

        this.$set('$multiplierNumRows', 1, false);
        this.$set('$multiplierNumCols', 1, false);

        this.callNextMethod();

        //  Create a grid cell element that we can clone as we drag using the
        //  target.
        gridCellElem = this.$makeMultiplierCell(gridElem, targetElem);

        //  Swap the target element for the grid element.
        gridElem = TP.nodeReplaceChild(
                            targetElem.parentNode, gridElem, targetElem, false);
        gridTPElement = TP.wrap(gridElem);

        modifyingRule = TP.bySystemId('Sherpa').getOrMakeModifiableRule(
                                    gridTPElement,
                                    this.getType().RULE_TEMPLATE);

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
                                '--sherpa-halo-multiplier-min-width',
                                width + 'px',
                                true);

        TP.styleRuleSetProperty(modifyingRule,
                                '--sherpa-halo-multiplier-min-height',
                                height + 'px',
                                true);

        multiplierTemplateTPElement = aTargetTPElem;

        halo = TP.byId('SherpaHalo', this.getNativeDocument());
        halo.focusOn(gridTPElement, true);

    } else {
        gridElem = gridTPElement.getNativeNode();

        modifyingRule = TP.bySystemId('Sherpa').getOrMakeModifiableRule(
                                    gridTPElement,
                                    this.getType().RULE_TEMPLATE);

        numRows = modifyingRule.style.getPropertyValue(
                        '--sherpa-halo-multiplier-rows').asNumber();
        numCols = modifyingRule.style.getPropertyValue(
                        '--sherpa-halo-multiplier-cols').asNumber();

        this.$set('$multiplierNumRows', numRows, false);
        this.$set('$multiplierNumCols', numCols, false);

        multiplierTemplateTPElement =
            gridTPElement.getFirstChildElement().getFirstChildElement();

        width = multiplierTemplateTPElement.getWidth();
        height = multiplierTemplateTPElement.getHeight();

        this.$set('$multiplierTargetWidth', width, false);
        this.$set('$multiplierTargetHeight', height, false);

        TP.styleRuleSetProperty(modifyingRule,
                                '--sherpa-halo-multiplier-min-width',
                                width + 'px',
                                true);

        TP.styleRuleSetProperty(modifyingRule,
                                '--sherpa-halo-multiplier-min-height',
                                height + 'px',
                                true);

        this.callNextMethod();

        //  No need to focus the halo here - it's already focused on the grid
        //  element.
    }

    TP.elementPushAndSetStyleProperty(gridElem, 'border', 'dashed 1px black');

    this.$set('$currentGridTPElement', gridTPElement);
    this.$set('$multiplierTemplateTPElement', multiplierTemplateTPElement);

    this.$set('$currentModifyingRule', modifyingRule);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.gridManipulator.Inst.defineMethod('deactivate',
function() {

    /**
     * @method deactivate
     * @summary Deactivates the receiver.
     * @returns {TP.sherpa.gridManipulator} The receiver.
     */

    var gridElem;

    gridElem = this.$get('$currentGridTPElement').getNativeNode();

    TP.elementPopAndSetStyleProperty(gridElem, 'border');

    this.$set('$multiplierNumRows', -1);
    this.$set('$multiplierNumCols', -1);

    this.$set('$multiplierTargetWidth', 0);
    this.$set('$multiplierTargetHeight', 0);

    this.$set('$currentGridTPElement', null);
    this.$set('$multiplierTemplateTPElement', null);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.gridManipulator.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is dragging.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.gridManipulator} The receiver.
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
                                '--sherpa-halo-multiplier-rows',
                                numRows,
                                false);

        this.$set('$multiplierNumRows', numRows, false);

        TP.styleRuleSetProperty(modifyingRule,
                                '--sherpa-halo-multiplier-cols',
                                numCols,
                                false);

        this.$set('$multiplierNumCols', numCols, false);
    }

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    halo.moveAndSizeToTarget();

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.gridManipulator.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is done with dragging and the mouse button
     *     has gone up.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.gridManipulator} The receiver.
     */

    var halo;

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    halo.moveAndSizeToTarget();

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.gridManipulator.Inst.defineMethod('$makeMultiplierCell',
function(gridElem, targetElem) {

    /**
     * @method $makeMultiplierCell
     * @summary Creates a new 'cell' containing a cloned version of the supplied
     *     target element and a wrapping 'cell' element.
     * @param {Element} gridElem
     * @param {Element} targetElem The element to wrap into a multiplier 'cell'
     * @returns {Element} The wrapping 'cell' element.
     */

    var doc,

        wrapperElem,
        targetCloneElem;

    doc = TP.nodeGetDocument(gridElem);

    wrapperElem = TP.documentConstructElement(doc, 'div', TP.w3.Xmlns.XHTML);

    targetCloneElem = TP.nodeCloneNode(targetElem);

    TP.nodeAppendChild(wrapperElem, targetCloneElem, false);

    return wrapperElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.gridManipulator.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.sherpa.gridManipulator} The receiver.
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

    halo = TP.byId('SherpaHalo', TP.sys.getUIRoot());

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
