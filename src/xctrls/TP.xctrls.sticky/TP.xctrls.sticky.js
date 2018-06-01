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
 * @type {TP.xctrls.sticky}
 * @summary Manages sticky XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.defineSubtype('xctrls:sticky');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.sticky.Type.defineConstant('STICKY_OFFSET', 8);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The ID of the shared sticky that is used in scenarios where stickies are
//  being shared.
TP.xctrls.sticky.Type.defineAttribute('sharedOverlayID', 'systemSticky');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.sticky.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     * @returns {TP.xctrls.sticky} The receiver.
     */

    //  Set up an observation for TP.sig.OpenSticky
    this.observe(TP.ANY, TP.ac(TP.sig.OpenSticky, TP.sig.ToggleSticky));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.sticky.Type.defineMethod('getSharedOverlayID',
function() {

    /**
     * @method getSharedOverlayID
     * @summary Returns the ID used as the 'shared overlay' for all stickys.
     * @returns {String} The ID to be used as the shared overlay ID.
     */

    return 'XCtrlsSticky';
});

//  ------------------------------------------------------------------------

TP.xctrls.sticky.Type.defineHandler('OpenSticky',
function(aSignal) {

    /**
     * @method handleOpenSticky
     * @summary Handles when the sticky is to be opened.
     * @param {TP.sig.OpenSticky} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.sticky} The receiver.
     */

    this.openOverlay(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.sticky.Type.defineHandler('ToggleSticky',
function(aSignal) {

    /**
     * @method handleToggleSticky
     * @summary Handles when the sticky is to be toggled.
     * @param {TP.sig.ToggleSticky} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.sticky} The receiver.
     */

    var stickyTPElem;

    stickyTPElem = this.getOverlayElement(aSignal);

    if (stickyTPElem.isVisible()) {
        stickyTPElem.setAttribute('hidden', true);
    } else {
        this.openOverlay(aSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.sticky.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.core.node[]} An Array of descendant nodes to serialize.
     */

    var selectedDescendants;

    selectedDescendants =
        this.get('./*[not(@tibet:assembly = \'xctrls:sticky\')]');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.sticky.Inst.defineMethod('getOverlayOffset',
function() {

    /**
     * @method getOverlayOffset
     * @summary Returns a numeric offset from the edge of the overlay's
     *     container that the overlay should use to offset it's position from
     *     the corner it will be positioned at.
     * @returns {Number} The offset.
     */

    return this.getType().STICKY_OFFSET;
});

//  ------------------------------------------------------------------------

TP.xctrls.sticky.Inst.defineHandler('CloseSticky',
function(aSignal) {

    /**
     * @method handleCloseSticky
     * @param {TP.sig.CloseSticky} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.sticky} The receiver.
     */

    this.setAttribute('hidden', true);
    this.setAttribute('active', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.sticky.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    if (beHidden) {
        this.ignore(TP.ANY, 'TP.sig.CloseSticky');
    } else {
        this.observe(TP.ANY, 'TP.sig.CloseSticky');
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
//  Sticky-specific TP.sig.Signal subtypes
//  ============================================================================

//  Sticky signals
TP.sig.OpenOverlay.defineSubtype('OpenSticky');
TP.sig.CloseOverlay.defineSubtype('CloseSticky');
TP.sig.Signal.defineSubtype('ToggleSticky');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
