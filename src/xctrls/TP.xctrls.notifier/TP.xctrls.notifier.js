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
 * @type {TP.xctrls.notifier}
 * @summary Manages notifier XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.defineSubtype('xctrls:notifier');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineConstant('NOTIFIER_OFFSET', 8);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The ID of the shared popup that is used in scenarios where notifiers are
//  being shared.
TP.xctrls.SharedOverlay.Type.defineAttribute('sharedOverlayID',
                                                'systemNotifier');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     * @returns {TP.xctrls.notifier} The receiver.
     */

    //  Set up an observation for TP.sig.OpenNotifier
    this.observe(TP.ANY, TP.sig.OpenNotifier);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineMethod('getTriggerElement',
function(aSignal, triggerTPDocument) {

    /**
     * @method getTriggerElement
     * @summary Returns the TP.dom.ElementNode that is acting as the
     *     'triggering' element for the overlay. This can be one of three
     *     values:
     *     - The element matching a 'triggerPath' supplied in aSignal
     *     - The target element of the trigger signal supplied in aSignal
     *     - The body element of the triggerTPDocument which should be the
     *         TP.core.Document that the triggering element is contained in.
     * @param {TP.sig.OpenNotifier} aSignal The TIBET signal which triggered
     *     this method.
     * @param {TP.core.Document} triggerTPDocument The TP.core.Document that the
     *     triggering element is contained in.
     * @returns {TP.dom.ElementNode} The TP.dom.ElementNode that caused the
     *     overlay to trigger.
     */

    //  xctrls:notifier elements are always 'triggered' by the body
    return triggerTPDocument.getBody();
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineHandler('OpenNotifier',
function(aSignal) {

    /**
     * @method handleOpenNotifier
     * @param {TP.sig.OpenNotifier} aSignal The TIBET signal which triggered
     *     this method.
     */

    return this.openOverlay(aSignal);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('getOverlayOffset',
function() {

    /**
     * @method getOverlayOffset
     * @summary Returns a numeric offset from the edge of the overlay's
     *     container that the overlay should use to offset it's position from
     *     the corner it will be positioned at.
     * @returns {Number} The offset.
     */

    return this.getType().NOTIFIER_OFFSET;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('CloseNotifier',
function(aSignal) {

    /**
     * @method handleCloseNotifier
     * @param {TP.sig.CloseNotifier} aSignal The signal that caused this handler
     *     to trip.
     */

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('DOMTransitionEnd',
function(aSignal) {

    /**
     * @method handleDOMTransitionEnd
     * @param {TP.sig.DOMTransitionEnd} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('setAttrHidden',
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
        this.ignore(TP.ANY, 'TP.sig.CloseNotifier');

        this.ignore(elem, 'TP.sig.DOMTransitionEnd');

    } else {

        this.observe(TP.core.Mouse, 'TP.sig.DOMClick');
        this.observe(TP.ANY, 'TP.sig.CloseNotifier');

        this.observe(elem, 'TP.sig.DOMTransitionEnd');

        //  NB: We do this at the next repaint so that the 'pclass:hidden' flag
        //  has a chance to take effect before flipping 'pclass:active' to true
        //  as well.
        (function() {
            this.setAttribute('active', true);
        }.bind(this)).queueForNextRepaint(this.getNativeWindow());
    }

    return this.callNextMethod();
});

//  ============================================================================
//  notifier-specific TP.sig.Signal subtypes
//  ============================================================================

//  notifier signals
TP.sig.OpenOverlay.defineSubtype('OpenNotifier');
TP.sig.CloseOverlay.defineSubtype('CloseNotifier');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
