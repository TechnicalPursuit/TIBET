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
 * @type {TP.sherpa.dimensionsManipulator}
 */

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.defineSubtype('dimensionsManipulator');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.dimensionsManipulator.Inst.defineAttribute(
    'northguide',
    TP.cpc('> #northguide', TP.hc('shouldCollapse', true)));

TP.sherpa.dimensionsManipulator.Inst.defineAttribute(
    'westguide',
    TP.cpc('> #westguide', TP.hc('shouldCollapse', true)));

TP.sherpa.dimensionsManipulator.Inst.defineAttribute(
    'southguide',
    TP.cpc('> #southguide', TP.hc('shouldCollapse', true)));

TP.sherpa.dimensionsManipulator.Inst.defineAttribute(
    'eastguide',
    TP.cpc('> #eastguide', TP.hc('shouldCollapse', true)));

TP.sherpa.dimensionsManipulator.Inst.defineAttribute(
    'sizecoordinates',
    TP.cpc('> #sizecoordinates', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.dimensionsManipulator.Inst.defineMethod('activate',
function(aTargetTPElem, aSignal) {

    /**
     * @method activate
     * @summary Activates the receiver.
     * @param {TP.dom.ElementNode} aTargetTPElem The element that the receiver
     *     will be activated on.
     * @param {TP.sig.Signal} [aSignal] An optional signal that caused the
     *     receiver to activate.
     * @returns {TP.sherpa.dimensionsManipulator} The receiver.
     */

    //  Check to make sure we can alter the 'width' property on the target
    //  element (assuming we can alter 'height' as well).
    var cantAlterReasons,
        currentDisplayVal;

    cantAlterReasons = aTargetTPElem.canAlterCSSProperty('width');

    if (TP.notEmpty(cantAlterReasons)) {
        if (cantAlterReasons.contains(TP.ELEMENT_NEEDS_TO_BE_BLOCK)) {

            //  Grab the current 'display' CSS property value for the target.
            currentDisplayVal = aTargetTPElem.getComputedStyleProperty(
                                                                'display');

            TP.promptWithChoices(
                'This element has a "display" CSS property value of: ' +
                '<b>' + currentDisplayVal + '</b>' +
                ' and needs one of the following values to be sizable:',
                TP.ac('block',
                        'flow',
                        'flow-root',
                        'table',
                        'flex',
                        'grid',
                        'ruby',
                        'list-item',
                        'table-cell',
                        'run-in'
                ),
                'block').then(
                function(displayVal) {
                    var modifyingRule;

                    if (TP.isEmpty(displayVal)) {
                        return;
                    }

                    modifyingRule = TP.bySystemId('Sherpa').
                                    getOrMakeModifiableRule(aTargetTPElem);

                    if (TP.notValid(modifyingRule)) {
                        return this;
                    }

                    TP.styleRuleSetProperty(
                            modifyingRule, 'display', displayVal, true);

                }.bind(this));
            }

        //  Return here because we don't want to continue with activation.
        return this;
    }

    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.dimensionsManipulator.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is dragging.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.dimensionsManipulator} The receiver.
     */

    var modifyingRule,

        halo,
        haloTargetTPElem,

        targetElem,

        currentTargetBox,

        targetWidth,
        targetHeight,

        natWindow;

    modifyingRule = this.$get('$currentModifyingRule');

    haloTargetTPElem = this.$get('$currentTargetTPElement');

    targetElem = haloTargetTPElem.getNativeNode();

    currentTargetBox = TP.elementGetBorderBox(targetElem, false);

    targetWidth = aSignal.getPageXAdjustedFor(targetElem) -
                    currentTargetBox.at('left');
    targetHeight = aSignal.getPageYAdjustedFor(targetElem) -
                    currentTargetBox.at('top');

    TP.styleRuleSetProperty(modifyingRule, 'width', targetWidth + 'px', false);
    TP.styleRuleSetProperty(modifyingRule, 'height', targetHeight + 'px', false);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    natWindow = this.getNativeWindow();

    (function() {
        halo.moveAndSizeToTarget();
        this.render();
    }.bind(this)).queueBeforeNextRepaint(natWindow);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.dimensionsManipulator.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is done with dragging and the mouse button
     *     has gone up.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.dimensionsManipulator} The receiver.
     */

    var modifyingRule,

        halo,
        haloTargetTPElem,

        targetElem,

        currentTargetBox,

        targetWidth,
        targetHeight;

    modifyingRule = this.$get('$currentModifyingRule');

    haloTargetTPElem = this.$get('$currentTargetTPElement');

    targetElem = haloTargetTPElem.getNativeNode();

    currentTargetBox = TP.elementGetBorderBox(targetElem, false);

    targetWidth = aSignal.getPageXAdjustedFor(targetElem) -
                    currentTargetBox.at('left');
    targetHeight = aSignal.getPageYAdjustedFor(targetElem) -
                    currentTargetBox.at('top');

    TP.styleRuleSetProperty(modifyingRule, 'width', targetWidth + 'px', true);
    TP.styleRuleSetProperty(modifyingRule, 'height', targetHeight + 'px', true);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    halo.moveAndSizeToTarget();

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.dimensionsManipulator.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.sherpa.dimensionsManipulator} The receiver.
     */

    var offsetRect,

        haloTargetTPElem,
        halo,

        targetRect,

        x,
        y,
        width,
        height,

        northRect,
        westRect,
        southRect,
        eastRect,

        coordsRect;

    haloTargetTPElem = this.$get('$currentTargetTPElement');

    //  Sometimes, depending on how redrawing gets sequenced with mouse up
    //  events, the current target will have already been set to null by the
    //  mouse up. Check for that here and simply return if that's the case.
    if (TP.notValid(haloTargetTPElem)) {
        return this;
    }

    offsetRect = this.getOffsetParent().getGlobalRect(false);

    halo = TP.byId('SherpaHalo', TP.sys.getUIRoot());

    targetRect = haloTargetTPElem.getHaloRect(halo);
    targetRect.subtractByPoint(offsetRect.getXYPoint());

    x = targetRect.getX();
    y = targetRect.getY();

    width = targetRect.getWidth();
    height = targetRect.getHeight();

    northRect = TP.rtc(x, y, width, 0.0);
    this.get('northguide').setOffsetPositionAndSize(northRect);

    westRect = TP.rtc(x, y, 0.0, height);
    this.get('westguide').setOffsetPositionAndSize(westRect);

    southRect = TP.rtc(x, y + height, width, 0.0);
    this.get('southguide').setOffsetPositionAndSize(southRect);

    eastRect = TP.rtc(x + width, y, 0.0, height);
    this.get('eastguide').setOffsetPositionAndSize(eastRect);

    coordsRect = TP.rtc(x + width, y + height, width, height);
    this.get('sizecoordinates').setOffsetPositionAndSize(coordsRect);
    this.get('sizecoordinates').setTextContent(
        '(' + haloTargetTPElem.getWidth().floor() +
        ',' + haloTargetTPElem.getHeight().floor() +
        ')');

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
