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
 * @type {TP.xctrls.popup}
 * @summary Manages popup XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.defineSubtype('xctrls:popup');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineConstant('POPUP_OFFSET', 8);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.popup.defineAttribute('themeURI', TP.NO_RESULT);

//  The ID of the shared popup that is used in scenarios where popups are being
//  shared.
TP.xctrls.popup.Type.defineAttribute('sharedOverlayID', 'systemPopup');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    //  Set up an observation for TP.sig.OpenPopup
    this.observe(TP.ANY, TP.ac(TP.sig.OpenPopup, TP.sig.TogglePopup));

    return;
});

//  ----------------------------------------------------------------------------

TP.xctrls.popup.Type.defineMethod('constructOverlay',
function(anOverlayID, aTPDocument) {

    /**
     * @method constructOverlay
     * @summary Returns (and, if necessary, constructs) the overlay found by
     *     using the supplied overlayID to query the supplied document.
     * @description We override this method from its supertype here since, when
     *     the popup is triggered for the first time, we won't have an
     *     opportunity to catch the first keyup event (because setup for
     *     instances of our supertype happens asynchronously). Therefore, we
     *     want to install the keyup handler here for that first time.
     * @param {String} anOverlayID The ID to use to query for the overlay.
     * @param {TP.dom.Document} aTPDocument The document to create the overlay
     *     in, if it can't be found. Note that, in this case, the overlay will
     *     be created as the last child of the document's 'body' element.
     * @returns {TP.xctrls.popup} The matching overlay on the supplied
     *     TP.dom.Document.
     */

    var overlayTPElem;

    overlayTPElem = this.callNextMethod();

    overlayTPElem.observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    return overlayTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineHandler('OpenPopup',
function(aSignal) {

    /**
     * @method handleOpenPopup
     * @summary Handles when the popup is to be opened.
     * @param {TP.sig.OpenPopup} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.meta.xctrls.popup} The receiver.
     */

    var popupTPElem;

    popupTPElem = this.getOverlayElement(aSignal);
    if (popupTPElem.isDisplayed() && !popupTPElem.isContentDifferent(aSignal)) {
        return this;
    }

    if (TP.isTrue(aSignal.at('sticky'))) {
        popupTPElem.set('isSticky', true, false);
    } else {
        popupTPElem.set('isSticky', false, false);
    }

    this.openOverlay(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineHandler('TogglePopup',
function(aSignal) {

    /**
     * @method handleTogglePopup
     * @summary Handles when the popup is to be toggled.
     * @param {TP.sig.TogglePopup} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.meta.xctrls.popup} The receiver.
     */

    var popupTPElem;

    popupTPElem = this.getOverlayElement(aSignal);
    if (popupTPElem.isDisplayed() && !popupTPElem.isContentDifferent(aSignal)) {
        return this;
    }

    if (TP.isTrue(aSignal.at('sticky'))) {
        popupTPElem.set('isSticky', true, false);
    } else {
        popupTPElem.set('isSticky', false, false);
    }

    if (popupTPElem.isDisplayed()) {
        popupTPElem.setAttribute('closed', true);
        popupTPElem.setAttribute('hidden', true);
    } else {
        this.openOverlay(aSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description Because tibet:data tag content drives binds and we need to
     *     notify even without a full page load, we notify from here once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  We need to set the 'no mutation tracking' attribute to ignore mutations
    //  to either ourself or our ancestors, but only after we've awoken. This
    //  means that we need to allow mutations once in order to get awoken (and
    //  get to this method), but then we need to turn it off.
    TP.elementSetAttribute(
            elem, 'tibet:no-mutations', 'ansorself', true);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Whether or not the popup is 'sticky'... that is, showing without the mouse
//  button being down or after a key up.
TP.xctrls.popup.Inst.defineAttribute('isSticky');

//  Whether or not the currently processing DOMClick signal is the 'triggering'
//  signal or is a subsequent DOMClick.
TP.xctrls.popup.Inst.defineAttribute('isTriggeringSignal');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('getDescendantsForSerialization',
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
        this.get('./*[not(@tibet:assembly = \'xctrls:popup\')]');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('getAlignmentCompassCorner',
function() {

    /**
     * @method getAlignmentCompassCorner
     * @summary Returns a constant responding to one of 8 compass points that
     *     the overlay will be positioned at relative to the element that it is
     *     trying to align to. This is the point that the overlay wants to be
     *     positioned *to* relative to it's aligning element.
     * @returns {Number} A Number matching the constant corresponding to the
     *     compass corner.
     */

    return TP.SOUTHWEST;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('getOverlayOffset',
function() {

    /**
     * @method getOverlayOffset
     * @summary Returns a numeric offset from the edge of the overlay's
     *     container that the overlay should use to offset it's position from
     *     the corner it will be positioned at.
     * @returns {Number} The offset.
     */

    return this.getType().POPUP_OFFSET;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineHandler('ClosePopup',
function(aSignal) {

    /**
     * @method handleClosePopup
     * @param {TP.sig.ClosePopup} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.popup} The receiver.
     */

    this.setAttribute('closed', true);
    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.popup} The receiver.
     */

    var targetElem,
        triggerTPElem,
        triggerElem,

        clickAway,

        shouldClose;

    targetElem = aSignal.getResolvedTarget();

    triggerTPElem = this.get('$triggerTPElement');

    //  If we don't have a valid triggering element, then check to see if the
    //  target element of the DOMClick is contained in ourself. If not, then
    //  hide ourself.
    if (TP.notValid(triggerTPElem)) {
        if (!this.contains(targetElem)) {
            this.setAttribute('closed', true);
            this.setAttribute('hidden', true);
        }
    } else {

        triggerElem = TP.unwrap(triggerTPElem);

        //  If the target element of the DOMClick isn't contained in ourself
        //  (the popup itself), then check to see if the triggering element
        //  contains the target element (or is the triggering element itself).
        //  Also, check to see if this is *not* the triggering click. If any of
        //  those is the case, then hide ourself.
        if (!this.contains(targetElem)) {

            //  If the target element isn't the trigger element and the trigger
            //  element doesn't contain the target element, then the user
            //  'clicked away' from the trigger.
            clickAway = triggerElem !== targetElem &&
                            !triggerElem.contains(targetElem);

            if (this.get('isTriggeringSignal') && !clickAway) {
                shouldClose = false;
            } else {
                /* eslint-disable no-extra-parens */
                shouldClose = clickAway || triggerElem === targetElem;
                /* eslint-enable no-extra-parens */
            }

            if (shouldClose) {
                this.setAttribute('closed', true);
                this.setAttribute('hidden', true);
            }
        }
    }

    //  Flip the isTriggeringSignal flag - there's no way that any subsequent
    //  clicks during this 'popup open' session are the triggering signal.
    this.set('isTriggeringSignal', false, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineHandler('DOMKeyUp',
function(aSignal) {

    /**
     * @method handleDOMKeyUp
     * @param {TP.sig.DOMKeyUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.popup} The receiver.
     */

    var targetElem,
        triggerTPElem;

    targetElem = aSignal.getResolvedTarget();

    triggerTPElem = this.get('$triggerTPElement');

    //  If we don't have a valid triggering element, then check to see if the
    //  target element of the DOMKeyUp is contained in ourself. If not, then
    //  hide ourself.
    if (TP.notValid(triggerTPElem)) {
        if (!this.contains(targetElem)) {
            this.setAttribute('closed', true);
            this.setAttribute('hidden', true);
        }
    } else {

        //  If the target element of the DOMKeyUp isn't contained in ourself,
        //  then check to see if the triggering element contains the target
        //  element (or is the triggering element itself). Also, check to see if
        //  this is *not* the triggering keyup. If any of those is the case,
        //  then hide ourself.
        if (!this.contains(targetElem)) {

            if (TP.unwrap(triggerTPElem) !== targetElem &&
                !triggerTPElem.contains(targetElem)) {
                this.setAttribute('closed', true);
                this.setAttribute('hidden', true);
            } else if (!this.get('isTriggeringSignal')) {
                this.setAttribute('closed', true);
                this.setAttribute('hidden', true);
            }
        }
    }

    //  Flip the isTriggeringSignal flag - there's no way that any subsequent
    //  keyups during this 'popup open' session are the triggering signal.
    this.set('isTriggeringSignal', false, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    if (beHidden) {

        //  Blur any focused element that is enclosed within us.
        this.blurFocusedDescendantElement();

        this.ignore(TP.core.Mouse, 'TP.sig.DOMClick');
        this.ignore(TP.core.Keyboard, 'TP.sig.DOMKeyUp');
        this.ignore(TP.ANY, 'TP.sig.ClosePopup');

        this.ignoreKeybindingsDirectly();

    } else {

        this.observe(TP.core.Mouse, 'TP.sig.DOMClick');
        this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');
        this.observe(TP.ANY, 'TP.sig.ClosePopup');

        //  If this popup is 'sticky', that means it stays visible even after
        //  mouse up (rather than being shown on click, for example, it might be
        //  being shown on mouse down). In that case, the current click will be
        //  considered to be the 'triggering click'. By setting this to true,
        //  when the mouse button is released outside of the trigger, the popup
        //  will 'stick' and not dismiss (the first time only).
        if (this.get('isSticky') === true) {
            this.set('isTriggeringSignal', true, false);
        } else {
            this.set('isTriggeringSignal', false, false);
        }

        this.observeKeybindingsDirectly();

        //  Focus any autofocused element or the first focusable element under
        //  us. Note that we have to fork this for GUI refresh reasons - sigh.
        (function() {
            this.focusAutofocusedOrFirstFocusableDescendant();
        }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('setContentAndActivate',
function(openSignal, popupContent) {

    /**
     * @method setContentAndActivate
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the content supplied and activates the receiver. If the content is
     *     not supplied, then the supplied trigger signal will be queried for
     *     contentID (the ID of an inlined content element) or contentURI (a URI
     *     pointing to some content).
     * @param {TP.sig.OpenPopup} openSignal The signal that was thrown to cause
     *     this popup to show.
     * @param {String|Element|DocumentFragment} [popupContent] The optional
     *     content to place inside of the popup element.
     * @returns {TP.dom.Node} The result of setting the content of the
     *     receiver.
     */

    var overlayTPElem,
        firstContentChildTPElem,

        positionCC,

        triggerPoint,
        mousePoint,
        triggerTPElem,

        alignmentCC,

        tpDocBody,
        constrainingRects,
        constrainingTPElements,

        offsetX,
        offsetY;

    overlayTPElem = this.getType().getOverlayElement(openSignal);

    //  If there is a real last content local ID and it equals the local ID of
    //  the content we're trying to set, then we don't need to set the content
    //  at all - just refresh it, position ourself (again, in case the trigger
    //  moved since the last time we showed it) and show ourself..
    if (!overlayTPElem.isContentDifferent(openSignal)) {

        //  We can only refresh it if it has real child content.
        firstContentChildTPElem =
            this.get('overlayContent').getFirstChildElement();

        if (TP.isValid(firstContentChildTPElem)) {

            //  Note here how we don't force the rendering behavior - if the
            //  data has changed, the content will re-render.
            firstContentChildTPElem.refresh();

            //  Compute the position compass corner if its not supplied in the
            //  trigger signal.
            positionCC = openSignal.at('positionCompassCorner');
            if (TP.isEmpty(positionCC)) {
                positionCC = this.getPositionCompassCorner();
            }

            //  First, see if the open signal provided a popup point.
            triggerPoint = openSignal.at('triggerPoint');

            mousePoint = TP.core.Mouse.getLastMovePoint();

            //  If no popup point was given, compute one from the triggering
            //  element.
            if (TP.notValid(triggerPoint)) {

                triggerTPElem = this.get('$triggerTPElement');

                if (TP.notValid(triggerTPElem)) {
                    //  TODO: Raise an exception
                    return this;
                }

                //  Compute the alignment compass corner if its not supplied in
                //  the trigger signal.
                alignmentCC = openSignal.at('alignmentCompassCorner');
                if (TP.isEmpty(alignmentCC)) {
                    alignmentCC = this.getAlignmentCompassCorner();
                }

            } else if (triggerPoint === TP.MOUSE) {
                triggerPoint = mousePoint;
            }

            tpDocBody = this.getDocument().getBody();

            //  Grab the list 'constraining rectangles' from the overlay info.
            //  These *must* be in 'global coordinates'. Note that we'll make a
            //  copy of the array, since we're going to modify.
            if (TP.isEmpty(constrainingRects =
                            openSignal.at('constrainingRects'))) {
                constrainingRects = TP.ac();
            } else {
                constrainingRects = TP.copy(constrainingRects);
            }

            constrainingRects.push(tpDocBody.getGlobalRect());

            if (TP.notEmpty(constrainingTPElements =
                            openSignal.at('constrainingTPElements'))) {
                constrainingTPElements.forEach(
                    function(aTPElem) {
                        //  We already added the body above so we skip it here.
                        if (aTPElem !== tpDocBody) {
                            return;
                        }

                        constrainingRects.push(aTPElem.getGlobalRect());
                    });
            }

            //  Initially set the overlay to hide (by supplying true we flip the
            //  'visibility' property).
            this.hide(true);

            //  Show the popup and set up signal handlers.
            //  NOTE: We make sure to do this *before* we position - otherwise,
            //  our width and height will not be set properly and 'edge
            //  avoidance' code will not work.
            this.setAttribute('hidden', false);
            this.setAttribute('closed', false);

            //  If the signal doesn't have a flag to not position the popup,
            //  then position the popup relative to the popup point and the
            //  corner.
            if (TP.notTrue(openSignal.at('noPosition'))) {
                offsetX = openSignal.atIfInvalid('offsetX',
                                                    this.getOverlayOffset());
                offsetY = openSignal.atIfInvalid('offsetY',
                                                    this.getOverlayOffset());

                //  Queue the positioning of the overlay into a 'next repaint'
                //  so that layout of the overlay's content happens and proper
                //  sizing numbers can be computed.
                (function() {
                    if (triggerPoint) {
                        this.setPositionRelativeTo(
                                            triggerPoint,
                                            positionCC,
                                            alignmentCC,
                                            triggerTPElem,
                                            constrainingRects,
                                            TP.ac(mousePoint),
                                            offsetX,
                                            offsetY);
                    } else {
                        this.positionUsingCompassPoints(
                                            positionCC,
                                            alignmentCC,
                                            triggerTPElem,
                                            constrainingRects,
                                            TP.ac(mousePoint),
                                            offsetX,
                                            offsetY);
                    }

                    //  Now set the overlay to show (by flipping the
                    //  'visibility' property back).
                    this.show();
                }.bind(this)).queueBeforeNextRepaint(this.getNativeWindow());
            }

            return this;
        }
    }

    openSignal.atPutIfAbsent('positionCompassCorner', positionCC);
    openSignal.atPutIfAbsent('alignmentCompassCorner', alignmentCC);

    this.callNextMethod();

    return this;
});

//  ============================================================================
//  Popup-specific TP.sig.Signal subtypes
//  ============================================================================

//  Popup signals
TP.sig.OpenOverlay.defineSubtype('OpenPopup');
TP.sig.CloseOverlay.defineSubtype('ClosePopup');
TP.sig.Signal.defineSubtype('TogglePopup');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
