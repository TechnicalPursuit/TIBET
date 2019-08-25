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
 * @type {TP.sherpa.canvastool}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('canvastool');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.sherpa.canvastool.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.setup();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineAttribute('$screenOffsetPoint');
//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineMethod('activate',
function(aTargetTPElem) {

    /**
     * @method activate
     * @summary Activates the receiver.
     * @param {TP.dom.ElementNode} aTargetTPElem The element that the receiver
     *     will be activated on.
     * @returns {TP.sherpa.canvastool} The receiver.
     */

    var world,
        screenOffsetPoint;

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    screenOffsetPoint = world.get('selectedScreen').getOffsetPoint();
    this.$set('$screenOffsetPoint', screenOffsetPoint);

    this.setAttribute('hidden', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineMethod('deactivate',
function() {

    /**
     * @method deactivate
     * @summary Deactivates the receiver.
     * @returns {TP.sherpa.canvastool} The receiver.
     */

    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is dragging.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.canvastool} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is done with dragging and the mouse button
     *     has gone up.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.canvastool} The receiver.
     */

    this.deactivate();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromSherpaHUD
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.canvastool} The receiver.
     */

    var hudIsClosed;

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    //  If the HUD is closed, then we also hide ourself. But not before
    //  capturing whether we were 'currently showing' or not (i.e. the HUD can
    //  hide or show independent of us). Otherwise, if the HUD is open, then
    //  we set ourself to whatever value we had when the HUD last hid.
    if (hudIsClosed) {
        this.toggleObservations(false);
    } else {
        this.toggleObservations(true);
    }

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.sherpa.canvastool} The receiver.
     */

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary Sets the 'hidden' attribute of the receiver. This causes the
     *     halo to show or hide itself independent of whether it's focused or
     *     not.
     * @param {Boolean} beHidden Whether or not the halo should be hidden.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var wasHidden,

        sherpaMain,

        toolsLayer;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return wasHidden;
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    this.callNextMethod();

    sherpaMain = TP.bySystemId('Sherpa');

    toolsLayer = sherpaMain.getToolsLayer();

    if (TP.isTrue(beHidden)) {

        this.ignore(TP.core.Mouse, 'TP.sig.DOMDragMove');
        this.ignore(TP.core.Mouse, 'TP.sig.DOMDragUp');

        toolsLayer.removeAttribute('activetool');

    } else {

        this.observe(TP.core.Mouse, 'TP.sig.DOMDragMove');
        this.observe(TP.core.Mouse, 'TP.sig.DOMDragUp');

        toolsLayer.setAttribute('activetool', this.getLocalID());
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    return beHidden;
});

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.canvastool} The receiver.
     */

    this.observe(TP.byId('SherpaHUD', this.getNativeDocument()),
                    'PclassClosedChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.canvastool.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.sherpa.canvastool} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
