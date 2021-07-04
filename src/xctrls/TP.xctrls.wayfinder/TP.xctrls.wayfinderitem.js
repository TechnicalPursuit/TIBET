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
 * @type {TP.xctrls.wayfinderitem}
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('wayfinderitem');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.wayfinderitem.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.wayfinderitem.Inst.defineAttribute('config');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.wayfinderitem.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @param {String} moveAction The type of 'move' that the user requested.
     *     This can be one of the following:
     *          TP.FIRST
     *          TP.LAST
     *          TP.NEXT
     *          TP.PREVIOUS
     *          TP.FIRST_IN_GROUP
     *          TP.LAST_IN_GROUP
     *          TP.FIRST_IN_NEXT_GROUP
     *          TP.FIRST_IN_PREVIOUS_GROUP
     *          TP.FOLLOWING
     *          TP.PRECEDING.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var firstChildTPElement;

    firstChildTPElement = this.getFirstChildElement();
    if (TP.canInvoke(firstChildTPElement, 'focus')) {
        return firstChildTPElement.focus();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinderitem.Inst.defineMethod('render',
function(moveAction) {

    var firstChildTPElement;

    firstChildTPElement = this.getFirstChildElement();
    if (TP.canInvoke(firstChildTPElement, 'render')) {
        return firstChildTPElement.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinderitem.Inst.defineMethod('getBayIndex',
function() {

    /**
     * @method getBayIndex
     * @summary
     * @param
     */

    var inspectorTPElem;

    inspectorTPElem = this.getParentNode();

    return inspectorTPElem.getChildIndex(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinderitem.Inst.defineMethod('getBayMultiplier',
function() {

    /**
     * @method getBayMultiplier
     * @summary
     * @param
     */

    var multiplier;

    multiplier = this.getComputedStyleProperty('--sherpa-wayfinder-width');
    if (TP.notEmpty(multiplier)) {
        return multiplier.asNumber();
    }

    return 1;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
