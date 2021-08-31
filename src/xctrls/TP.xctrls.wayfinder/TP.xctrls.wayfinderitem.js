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
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.wayfinderitem.Type.defineMethod('isOpaqueCapturerFor',
function(anElement, aSignal, signalNames) {

    /**
     * @method isOpaqueCapturerFor
     * @summary Returns whether the elements of this type are considered to be
     *     an 'opaque capturer' for the supplied signal (i.e. it won't let the
     *     signal 'descend' further into its descendant hierarchy). This means
     *     that they will handle the signal themselves and not allow targeted
     *     descendants underneath them to handle it.
     * @description At this level, the supplied element is checked to see if it
     *     can handle a particular key signal. If so, it is considered to be an
     *     opaque capturer.
     * @param {Element} anElem The element to check for the
     *     'tibet:opaque-capturing' attribute.
     * @param {String} aSignalName The signal to check.
     * @param {String[]} [signalNames] The list of signal names to use when
     *     computing opacity for the signal. This is an optional parameter. If
     *     this method needs the list of signal names and this parameter is not
     *     provided, it can be derived from the supplied signal itself.
     * @returns {Boolean} Whether or not the receiver is opaque during the
     *     capture phase for the signal.
     */

    return false;
});

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
