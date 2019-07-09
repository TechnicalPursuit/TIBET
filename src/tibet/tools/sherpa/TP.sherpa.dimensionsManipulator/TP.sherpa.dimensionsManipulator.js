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

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.dimensionsManipulator.Inst.defineMethod('activate',
function(aTargetTPElem) {

    /**
     * @method activate
     * @summary Handles notifications of the canvas changing from the Sherpa
     *     object.
     * @param {TP.sig.CanvasChanged} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.dimensionsManipulator} The receiver.
     */

    //  Check to make sure we can alter the 'width' property on the target
    //  element (assuming we can alter 'height' as well).
    var cantAlterReasons;

    cantAlterReasons = aTargetTPElem.canAlterCSSProperty('width');

    if (TP.notEmpty(cantAlterReasons)) {
        if (cantAlterReasons.contains(TP.ELEMENT_NEEDS_TO_BE_BLOCK)) {
            TP.prompt(
                'This element needs a "display" property value of:' +
                ' "block", "inline-block", "list-item", "run-in", "table" or' +
                ' "table-cell" to be sizable. Enter a value for the "display"' +
                ' property:', 'block').then(
                function(displayVal) {
                    var modifyingRule;

                    if (displayVal === 'block' ||
                        displayVal === 'inline-block' ||
                        displayVal === 'list-item' ||
                        displayVal === 'run-in' ||
                        displayVal === 'table' ||
                        displayVal === 'table-cell') {

                        modifyingRule = TP.bySystemId('Sherpa').
                                        getOrMakeModifiableRule(aTargetTPElem);

                        if (TP.notValid(modifyingRule)) {
                            return this;
                        }

                        TP.styleRuleSetProperty(
                                modifyingRule, 'display', displayVal, true);

                    } else {
                        TP.alert(
                            'Invalid "display" property value: ' + displayVal);
                    }
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
        targetHeight;

    modifyingRule = this.$get('$currentModifyingRule');
    if (TP.notValid(modifyingRule)) {
        return this;
    }

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
    halo.moveAndSizeToTarget();

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.dimensionsManipulator.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver might be...
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
    if (TP.notValid(modifyingRule)) {
        return this;
    }

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

    this.callNextMethod();

    return this;
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

    var ourRect,

        haloTargetTPElem,
        halo,

        targetRect,

        x,
        y,

        northRect,
        westRect,
        southRect,
        eastRect;

    ourRect = this.getOffsetParent().getGlobalRect(false);

    haloTargetTPElem = this.$get('$currentTargetTPElement');
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

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
