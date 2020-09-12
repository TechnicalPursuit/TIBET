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
 * @type {TP.lama.inspectoritem}
 */

//  ------------------------------------------------------------------------

TP.lama.Element.defineSubtype('inspectoritem');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.inspectoritem.Inst.defineAttribute('config');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.inspectoritem.Inst.defineMethod('focus',
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

TP.lama.inspectoritem.Inst.defineMethod('getBayIndex',
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

TP.lama.inspectoritem.Inst.defineMethod('getBayMultiplier',
function() {

    /**
     * @method getBayMultiplier
     * @summary
     * @param
     */

    var multiplier;

    multiplier = this.getComputedStyleProperty('--lama-inspector-width');
    if (TP.notEmpty(multiplier)) {
        return multiplier.asNumber();
    }

    return 1;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
