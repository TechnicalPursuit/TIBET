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
TP.xctrls.tooltip.Type.defineAttribute('sharedOverlayID',
                                        'systemTooltip');

//  A timeout timer used by tooltips to slightly delay their appearance.
TP.xctrls.tooltip.Type.defineAttribute('$displayDelayTimer');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var cancellingSignalNames;

    //  Set up an observation for TP.sig.OpenTooltip and TP.sig.CancelTooltip
    this.observe(TP.ANY, TP.ac(TP.sig.OpenTooltip, TP.sig.CancelTooltip));

    //  Set up a capturing handler that will capture the following signals:
    cancellingSignalNames =
        TP.ac(
            'TP.sig.DOMClick',
            'TP.sig.DOMDblClick',

            'TP.sig.DOMContextMenu',

            'TP.sig.DOMKeyDown',
            'TP.sig.DOMKeyPress',
            'TP.sig.DOMKeyUp',

            'TP.sig.DOMMouseDown',
            'TP.sig.DOMMouseUp',

            'TP.sig.DOMMouseWheel',

            'TP.sig.DOMKeyDown',
            'TP.sig.DOMKeyPress',
            'TP.sig.DOMKeyUp',
            'TP.sig.DOMModifierKeyChange',

            'TP.sig.DOMDragDown',
            'TP.sig.DOMDragUp'
        );

    //  Observe those signals.
    this.observe(
        TP.ANY,
        cancellingSignalNames,
        null,
        TP.sig.SignalMap.REGISTER_CAPTURING);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Type.defineMethod('getSharedOverlayID',
function() {

    /**
     * @method getSharedOverlayID
     * @summary Returns the ID used as the 'shared overlay' for all tooltips.
     * @returns {String} The ID to be used as the shared overlay ID.
     */

    return 'XCtrlsTooltip';
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Type.defineHandler('DOMUISignal',
function(aSignal) {

    /**
     * @method handleDOMUISignal
     * @summary Handles notifications of a variety of mouse and key signals.
     * @param {TP.sig.DOMUISignal} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.meta.xctrls.tooltip} The receiver.
     */

    //  For the cancelling signals that we subscribed to above, clear the
    //  timeout to avoid showing the tooltip.
    clearTimeout(this.get('$displayDelayTimer'));

    return this;
}, {
    phase: TP.CAPTURING
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Type.defineHandler('OpenTooltip',
function(aSignal) {

    /**
     * @method handleOpenTooltip
     * @param {TP.sig.OpenTooltip} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.meta.xctrls.tooltip} The receiver.
     */

    var delayVal,
        timer;

    //  Make sure to clear any existing timeout that we have running.
    clearTimeout(this.get('$displayDelayTimer'));

    //  If the signal has a delay property, use that. Otherwise use the cfg
    //  value or 1000 as the default.
    delayVal = aSignal.atIfInvalid(
                    'delay',
                    TP.sys.cfg('xctrls.tooltip_delay', 1000));

    //  Make a new timer by setting a timeout around opening the overlay that
    //  the tooltip shares and cache it on ourself.
    timer = setTimeout(
            function() {
                return this.openOverlay(aSignal);
            }.bind(this),
            delayVal);

    this.set('$displayDelayTimer', timer, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Type.defineHandler('CancelTooltip',
function(aSignal) {

    /**
     * @method handleCancelTooltip
     * @param {TP.sig.CancelTooltip} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.meta.xctrls.tooltip} The receiver.
     */

    clearTimeout(this.get('$displayDelayTimer'));

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.dom.Node[]} An Array of descendant nodes to serialize.
     */

    var selectedDescendants;

    selectedDescendants =
        this.get('./*[not(@tibet:assembly = \'xctrls:tooltip\')]');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

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
     * @returns {TP.xctrls.tooltip} The receiver.
     */

    //  Make sure to clear any existing timeout that we have running and set the
    //  attribute to null.
    this.getType().set('$displayDelayTimer', null, false);

    this.setAttribute('hidden', true);
    this.setAttribute('active', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.tooltip} The receiver.
     */

    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.tooltip.Inst.defineHandler('DOMTransitionEnd',
function(aSignal) {

    /**
     * @method handleDOMTransitionEnd
     * @param {TP.sig.DOMTransitionEnd} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.tooltip} The receiver.
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
TP.sig.CloseOverlay.defineSubtype('CancelTooltip');
TP.sig.CloseOverlay.defineSubtype('CloseTooltip');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
