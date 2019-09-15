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
 * @type {TP.sherpa.positionManipulator}
 */

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.defineSubtype('positionManipulator');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.positionManipulator.Inst.defineAttribute('$isRelative');
TP.sherpa.positionManipulator.Inst.defineAttribute('$parentOffsets');
TP.sherpa.positionManipulator.Inst.defineAttribute('$thisOffsets');

TP.sherpa.positionManipulator.Inst.defineAttribute(
    'offsetparentoutline',
    TP.cpc('> #offsetparentoutline', TP.hc('shouldCollapse', true)));

TP.sherpa.positionManipulator.Inst.defineAttribute(
    'offsetguide',
    TP.cpc('> #offsetguide', TP.hc('shouldCollapse', true)));

TP.sherpa.positionManipulator.Inst.defineAttribute(
    'positioncoordinates',
    TP.cpc('> #positioncoordinates', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.positionManipulator.Inst.defineMethod('activate',
function(aTargetTPElem, aSignal) {

    /**
     * @method activate
     * @summary Activates the receiver.
     * @param {TP.dom.ElementNode} aTargetTPElem The element that the receiver
     *     will be activated on.
     * @param {TP.sig.Signal} [aSignal] An optional signal that caused the
     *     receiver to activate.
     * @returns {TP.sherpa.positionManipulator} The receiver.
     */

    //  Check to make sure we can alter the 'left' property on the target
    //  element (assuming we can alter 'top' as well).
    var cantAlterReasons,

        isRelative,
        parentOffsets,
        thisOffsets;

    cantAlterReasons = aTargetTPElem.canAlterCSSProperty('left');

    if (TP.notEmpty(cantAlterReasons)) {
        if (cantAlterReasons.contains(TP.ELEMENT_NEEDS_TO_BE_POSITIONED)) {
            TP.promptWithChoices(
                'This element needs one of the following "position"' +
                ' property values to be moveable:',
                TP.ac('relative', 'absolute', 'fixed'),
                'relative').then(
                function(positionVal) {
                    var modifyingRule;

                    if (TP.isEmpty(positionVal)) {
                        return;
                    }

                    if (positionVal === 'absolute' ||
                        positionVal === 'relative' ||
                        positionVal === 'fixed') {

                        modifyingRule = TP.bySystemId('Sherpa').
                                        getOrMakeModifiableRule(aTargetTPElem);

                        if (TP.notValid(modifyingRule)) {
                            return this;
                        }

                        TP.styleRuleSetProperty(
                                modifyingRule, 'position', positionVal, true);

                    } else {
                        TP.alert('Invalid "position" property value: ' +
                                    positionVal);
                    }
                });
            }

        //  Return here because we don't want to continue with activation.
        return this;
    }

    this.callNextMethod();

    isRelative = aTargetTPElem.getComputedStyleProperty('position') ===
                'relative';
    this.$set('$isRelative', isRelative);

    parentOffsets = TP.elementGetOffsetFromContainer(
                                        aTargetTPElem.getNativeNode());
    this.$set('$parentOffsets', parentOffsets);

    thisOffsets = TP.ac(aTargetTPElem.getComputedStyleProperty('left', true),
                        aTargetTPElem.getComputedStyleProperty('top', true));
    this.$set('$thisOffsets', thisOffsets);

    return this;
}, {
    patchCallee: true
});

//  ------------------------------------------------------------------------

TP.sherpa.positionManipulator.Inst.defineMethod('deactivate',
function() {

    /**
     * @method deactivate
     * @summary Deactivates the receiver.
     * @returns {TP.sherpa.positionManipulator} The receiver.
     */

    this.$set('$isRelative', false);
    this.$set('$parentOffsets', null);
    this.$set('$thisOffsets', null);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.positionManipulator.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is dragging.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.positionManipulator} The receiver.
     */

    var modifyingRule,

        halo,
        haloTargetTPElem,

        targetElem,

        targetLeft,
        targetTop,

        parentOffsets,
        thisOffsets,

        targetOffsetRect,

        natWindow;

    modifyingRule = this.$get('$currentModifyingRule');
    if (TP.notValid(modifyingRule)) {
        return this;
    }

    haloTargetTPElem = this.$get('$currentTargetTPElement');

    targetElem = haloTargetTPElem.getNativeNode();

    targetLeft = aSignal.getPageXAdjustedFor(targetElem);
    targetTop = aSignal.getPageYAdjustedFor(targetElem);

    parentOffsets = this.$get('$parentOffsets');
    thisOffsets = this.$get('$thisOffsets');

    targetLeft -= parentOffsets.first() - thisOffsets.first();
    targetTop -= parentOffsets.last() - thisOffsets.last();

    TP.styleRuleSetProperty(modifyingRule, 'left', targetLeft + 'px', false);
    TP.styleRuleSetProperty(modifyingRule, 'top', targetTop + 'px', false);

    targetOffsetRect = haloTargetTPElem.getOffsetParent().getPageRect(false);
    this.get('offsetparentoutline').setOffsetPositionAndSize(targetOffsetRect);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    natWindow = this.getNativeWindow();

    (function() {
        halo.moveAndSizeToTarget();
        this.render();
    }.bind(this)).queueForNextRepaint(natWindow);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.positionManipulator.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is done with dragging and the mouse button
     *     has gone up.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.positionManipulator} The receiver.
     */

    var modifyingRule,

        halo,
        haloTargetTPElem,

        targetElem,

        targetLeft,
        targetTop,

        parentOffsets,
        thisOffsets;

    modifyingRule = this.$get('$currentModifyingRule');
    if (TP.notValid(modifyingRule)) {
        return this;
    }

    haloTargetTPElem = this.$get('$currentTargetTPElement');

    targetElem = haloTargetTPElem.getNativeNode();

    targetLeft = aSignal.getPageXAdjustedFor(targetElem);
    targetTop = aSignal.getPageYAdjustedFor(targetElem);

    parentOffsets = this.$get('$parentOffsets');
    thisOffsets = this.$get('$thisOffsets');

    targetLeft -= parentOffsets.first() - thisOffsets.first();
    targetTop -= parentOffsets.last() - thisOffsets.last();

    TP.styleRuleSetProperty(modifyingRule, 'left', targetLeft + 'px', true);
    TP.styleRuleSetProperty(modifyingRule, 'top', targetTop + 'px', true);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    halo.moveAndSizeToTarget();

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.positionManipulator.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.sherpa.positionManipulator} The receiver.
     */

    var offsetRect,

        haloTargetTPElem,
        halo,

        targetRect,

        x,
        y,

        targetOffsetRect,
        guideRect,

        width,
        height,

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

    targetOffsetRect = haloTargetTPElem.getOffsetParent().getPageRect(false);
    x = targetOffsetRect.getX();
    y = targetOffsetRect.getY();
    width = targetRect.getX() - x;
    height = targetRect.getY() - y;

    guideRect = TP.rtc(x, y, width, height);
    this.get('offsetguide').setOffsetPositionAndSize(guideRect);

    x = targetRect.getX();
    y = targetRect.getY();
    width = TP.elementGetPixelValue(halo.getNativeNode(), '10em', 'width');
    height = TP.elementGetPixelValue(halo.getNativeNode(), '1.5em', 'height');

    coordsRect = TP.rtc(x, y - height, width, height);
    this.get('positioncoordinates').setOffsetPositionAndSize(coordsRect);
    this.get('positioncoordinates').setTextContent(
        '(' + haloTargetTPElem.getComputedStyleProperty('left', true) +
        ',' + haloTargetTPElem.getComputedStyleProperty('top', true) +
        ')');

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
