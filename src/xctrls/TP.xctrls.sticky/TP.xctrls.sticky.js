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

TP.xctrls.sticky.Type.defineHandler('OpenSticky',
function(aSignal) {

    /**
     * @method handleOpenSticky
     * @summary Handles when the sticky is to be opened.
     * @param {TP.sig.OpenSticky} aSignal The TIBET signal which triggered
     *     this method.
     */

    return this.openOverlay(aSignal);
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
     */

    this.setAttribute('hidden', true);

    return;
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

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.sticky.Inst.defineMethod('setContentAndActivate',
function(openSignal, popupContent) {

    /**
     * @method setContentAndActivate
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the content supplied and activates the receiver. If the content is
     *     not supplied, then the supplied trigger signal will be queried for
     *     contentID (the ID of an inlined content element) or contentURI (a URI
     *     pointing to some content).
     * @param {TP.sig.OpenSticky} openSignal The signal that was thrown to cause
     *     this sticky to show.
     * @param {String|Element|DocumentFragment} [popupContent] The optional
     *     content to place inside of the sticky element.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var lastTriggerID,
        currentTriggerID,

        firstContentChildTPElem,

        stickyCorner,

        triggerRect,
        stickyPoint,
        triggerTPElem;

    lastTriggerID = this.getType().get('$lastTriggerID');
    currentTriggerID = this.get('$currentTriggerID');

    triggerTPElem = this.get('$triggerTPElement');

    //  If there is a real last content local ID and it equals the local ID of
    //  the content we're trying to set, then we don't need to set the content
    //  at all - just refresh it, position ourself (again, in case the trigger
    //  moved since the last time we showed it) and show ourself..
    if (currentTriggerID === lastTriggerID) {

        //  We can only refresh it if it has real child content.
        firstContentChildTPElem =
            this.get('overlayContent').getFirstChildElement();

        if (TP.isValid(firstContentChildTPElem)) {

            //  Note here how we don't force the rendering behavior - if the
            //  data has changed, the content will re-render.
            firstContentChildTPElem.refresh();

            //  First, see if the open signal provided a popup point.
            stickyPoint = openSignal.at('triggerPoint');

            //  If no popup point was given, compute one from the triggering
            //  element.
            if (TP.notValid(stickyPoint)) {

                if (TP.notValid(triggerTPElem)) {
                    //  TODO: Raise an exception
                    return this;
                }

                //  Grab the global rect from the supplied element.
                triggerRect = triggerTPElem.getGlobalRect();

                //  Compute the corner if its not supplied in the trigger
                //  signal.
                stickyCorner = openSignal.at('corner');
                if (TP.isEmpty(stickyCorner)) {
                    stickyCorner = TP.SOUTHWEST;
                }

                //  The point that the popup should appear at is the 'edge
                //  point' for that compass edge of the trigger rectangle.
                stickyPoint = triggerRect.getEdgePoint(stickyCorner);
            }

            //  If the signal doesn't have a flag to not position the popup,
            //  then position the popup relative to the popup point and the
            //  corner.
            if (TP.notTrue(openSignal.at('noPosition'))) {
                this.positionUsing(stickyPoint);
            }

            //  Show the sticky
            this.setAttribute('hidden', false);

            return this;
        }
    }

    //  By default, sticky overlays should be positioned southeast of their
    //  triggering element.
    openSignal.atPutIfAbsent('corner', TP.SOUTHEAST);

    this.callNextMethod();

    return this;
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
