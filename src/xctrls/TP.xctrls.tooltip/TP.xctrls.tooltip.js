//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.tooltip}
 * @summary Manages tooltip XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.defineSubtype('xctrls:tooltip');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The ID of the shared popup that is used in scenarios where tooltips are
//  being shared.
TP.xctrls.SharedOverlay.Type.defineAttribute('sharedOverlayID',
                                                'systemTooltip');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     * @returns {TP.xctrls.tooltip} The receiver.
     */

    //  Set up an observation for TP.sig.OpenTooltip
    this.observe(TP.ANY, TP.sig.OpenTooltip);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Type.defineHandler('OpenTooltip',
function(aSignal) {

    /**
     * @method handleOpenTooltip
     * @param {TP.sig.OpenTooltip} aSignal The TIBET signal which triggered
     *     this method.
     */

    return this.openOverlay(aSignal);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Inst.defineMethod('getOverlayCorner',
function() {

    /**
     * @method getOverlayCorner
     * @summary Returns a constant responding to one of 8 compass points that
     *     the overlay will be positioned at relative to the overlay's
     *     container.
     * @returns {Number} A Number matching the constant corresponding to the
     *     compass corner.
     */

    return TP.SOUTHEAST;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Inst.defineHandler('CloseTooltip',
function(aSignal) {

    /**
     * @method handleCloseTooltip
     * @param {TP.sig.CloseTooltip} aSignal The signal that caused this handler
     *     to trip.
     */

    this.setAttribute('hidden', true);
    this.setAttribute('active', false);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.setAttribute('hidden', true);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Inst.defineHandler('DOMTransitionEnd',
function(aSignal) {

    /**
     * @method handleDOMTransitionEnd
     * @param {TP.sig.DOMTransitionEnd} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var elem;

    elem = this.getNativeNode();

    if (beHidden) {

        this.ignore(TP.core.Mouse, 'TP.sig.DOMClick');
        this.ignore(TP.ANY, 'TP.sig.CloseTooltip');

        this.ignore(elem, 'TP.sig.DOMTransitionEnd');

    } else {

        this.observe(TP.core.Mouse, 'TP.sig.DOMClick');
        this.observe(TP.ANY, 'TP.sig.CloseTooltip');

        this.observe(elem, 'TP.sig.DOMTransitionEnd');
    }

    //  NB: We do this at the next repaint so that the 'pclass:hidden' flag
    //  has a chance to take effect before flipping 'pclass:active' to true
    //  as well.
    (function() {
        this.setAttribute('active', !beHidden);
    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this.callNextMethod();
});

//  ============================================================================
//  tooltip-specific TP.sig.Signal subtypes
//  ============================================================================

//  tooltip signals
TP.sig.OpenOverlay.defineSubtype('OpenTooltip');
TP.sig.CloseOverlay.defineSubtype('CloseTooltip');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
