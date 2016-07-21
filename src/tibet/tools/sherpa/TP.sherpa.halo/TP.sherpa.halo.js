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
 * @type {TP.sherpa.halo}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('halo');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineAttribute('$wasShowing');

TP.sherpa.halo.Inst.defineAttribute('currentTargetTPElem');
TP.sherpa.halo.Inst.defineAttribute('haloRect');

TP.sherpa.halo.Inst.defineAttribute('lastCorner');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.halo.Type.defineMethod('tagAttachDOM',
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

    (function(aSignal) {

        var signalGlobalPoint,
            haloGlobalRect,

            contextMenuTPElem;

        if (aSignal.getShiftKey()) {

            //  Make sure to prevent default to avoid having the context menu
            //  pop up.
            aSignal.preventDefault();
            aSignal.stopPropagation();

            this.changeHaloFocusOnClick(aSignal);
        } else {

            //  NB: We use global coordinates here as the halo and the signal
            //  that we're testing very well might have occurred in different
            //  documents.

            signalGlobalPoint = aSignal.getGlobalPoint();
            haloGlobalRect = this.getGlobalRect();

            if (haloGlobalRect.containsPoint(signalGlobalPoint)) {

                //  Make sure to prevent default to avoid having the context
                //  menu pop up.
                aSignal.preventDefault();
                aSignal.stopPropagation();

                contextMenuTPElem = TP.byId('SherpaContextMenu',
                                            TP.win('UIROOT'));

                contextMenuTPElem.setGlobalPosition(aSignal.getGlobalPoint());

                contextMenuTPElem.activate();
            }
        }
    }).bind(tpElem).observe(TP.core.Mouse, 'TP.sig.DOMContextMenu');

    (function(aSignal) {

        if (aSignal.getShiftKey() && TP.notTrue(this.getAttribute('hidden'))) {
            aSignal.preventDefault();
            aSignal.stopPropagation();

            this.changeHaloFocusOnClick(aSignal);

            return;
        } else if (this.contains(aSignal.getTarget())) {
            this[TP.composeHandlerName('HaloClick')](aSignal);
        }

    }).bind(tpElem).observe(TP.core.Mouse, 'TP.sig.DOMClick');

    tpElem.observe(TP.byId('SherpaHUD', tpElem.getNativeWindow()),
                    TP.ac('HiddenChange',
                            'DrawerClosedWillChange',
                            'DrawerClosedDidChange'));

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @param {Boolean} beHidden
     * @returns {TP.sherpa.halo} The receiver.
     */

    var wasHidden;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        return this;
    }

    if (TP.isTrue(beHidden)) {
        this.ignore(this, 'TP.sig.DOMMouseMove');
        this.ignore(this, 'TP.sig.DOMMouseOver');
        this.ignore(this, 'TP.sig.DOMMouseOut');

        this.ignore(TP.core.Mouse, 'TP.sig.DOMMouseWheel');

        this.ignore(TP.ANY, 'TP.sig.DetachComplete');

        this.ignore(this.getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        this.ignore(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

        this.set('haloRect', null);
    } else {
        this.observe(this, 'TP.sig.DOMMouseMove');
        this.observe(this, 'TP.sig.DOMMouseOver');
        this.observe(this, 'TP.sig.DOMMouseOut');

        this.observe(TP.core.Mouse, 'TP.sig.DOMMouseWheel');

        this.observe(TP.ANY, 'TP.sig.DetachComplete');

        this.observe(this.getDocument(),
                        TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        this.observe(TP.sys.getUICanvas().getDocument(),
                        TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('blur',
function() {

    /**
     * @method blur
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem;

    this.moveAndSizeToTarget(null);

    currentTargetTPElem = this.get('currentTargetTPElem');

    if (TP.isValid(currentTargetTPElem)) {

        this.set('currentTargetTPElem', null);
    }

    this.signal('TP.sig.HaloDidBlur', TP.hc('haloTarget', currentTargetTPElem),
                TP.OBSERVER_FIRING);

    this.ignore(currentTargetTPElem, 'TP.sig.DOMReposition');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('changeHaloFocusOnClick',
function(aSignal) {

    /**
     * @method changeHaloFocusOnClick
     * @param {TP.sig.DOMSignal} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var sigTarget,

        handledSignal,

        currentTargetTPElem,
        newTargetTPElem;

    sigTarget = aSignal.getTarget();

    handledSignal = false;

    currentTargetTPElem = this.get('currentTargetTPElem');

    //  If:
    //      a) We have an existing target
    //      b) AND: The user clicked the LEFT button
    //      c) AND: the existing target can blur
    if (TP.isValid(currentTargetTPElem) &&
        aSignal.getButton() === TP.LEFT &&
        currentTargetTPElem.haloCanBlur(this, aSignal)) {

        this.blur();
        this.setAttribute('hidden', true);

        handledSignal = true;
    } else if (aSignal.getButton() === TP.RIGHT) {

        //  If there is an existing target and it's either identical to the
        //  signal target or it contains the signal target, then we want to
        //  traverse 'up' the parent hierarchy.
        if (TP.isValid(currentTargetTPElem) &&
                (currentTargetTPElem.identicalTo(sigTarget) ||
                    currentTargetTPElem.contains(sigTarget))) {

            newTargetTPElem = TP.wrap(sigTarget);

            //  If the target element wasn't the same as the currently focused
            //  element, and a focusable element can be computed, then blur the
            //  existing element and focus the parent.
            if (!newTargetTPElem.identicalTo(currentTargetTPElem)) {

                newTargetTPElem = this.getNearestFocusable(
                                            newTargetTPElem, aSignal);

                //  Couldn't find a new target... exit.
                if (TP.notValid(newTargetTPElem)) {
                    return;
                }

                this.blur();
                this.focusOn(newTargetTPElem);

                handledSignal = true;
            }
        } else {
            newTargetTPElem = TP.wrap(sigTarget);

            newTargetTPElem = this.getNearestFocusable(
                                            newTargetTPElem, aSignal);
        }

        if (TP.isValid(newTargetTPElem)) {

            this.blur();
            this.focusOn(newTargetTPElem);

            this.setAttribute('hidden', false);

            handledSignal = true;
        }
    }

    if (handledSignal) {
        if (TP.isValid(newTargetTPElem)) {
            TP.documentClearSelection(newTargetTPElem.getNativeDocument());
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('focusOn',
function(target) {

    /**
     * @method focusOn
     * @param {TP.core.ElementNode} target
     * @returns {TP.sherpa.halo} The receiver.
     */

    if (TP.isKindOf(target, TP.core.ElementNode)) {

        this.moveAndSizeToTarget(target);

        this.set('currentTargetTPElem', target);

        this.signal('TP.sig.HaloDidFocus', TP.hc('haloTarget', target),
                    TP.OBSERVER_FIRING);

        this.observe(target, 'TP.sig.DOMReposition');

    } else if (TP.isValid(this.get('currentTargetTPElem'))) {
        this.blur();
    } else {
        //  No existing target
        void 0;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DetachComplete',
function(aSignal) {

    var currentTargetTPElem,

        mutatedIDs,

        currentGlobalID,
        newTargetTPElem,

        sigOriginTPNode;

    currentTargetTPElem = this.get('currentTargetTPElem');
    if (!TP.isKindOf(currentTargetTPElem, TP.core.ElementNode)) {
        return this;
    }

    if (TP.notEmpty(mutatedIDs = aSignal.at('mutatedNodeIDs'))) {

        currentGlobalID = currentTargetTPElem.getID();
        if (mutatedIDs.contains(currentGlobalID)) {

            this.blur();

            newTargetTPElem = TP.byId(currentTargetTPElem.getLocalID(),
                                        aSignal.getOrigin().getDocument());

            if (TP.isKindOf(newTargetTPElem, TP.core.Node)) {
                this.focusOn(newTargetTPElem);
            } else {
                this.setAttribute('hidden', true);
            }

            //  We handled this detachment signal - exit
            return this;
        }
    }

    //  We didn't actually detach the target element itself. See if the element
    //  that was getting detached was an ancestor (i.e. contains) the target
    //  element.

    sigOriginTPNode = aSignal.getSignalOrigin();

    if (TP.isKindOf(sigOriginTPNode, TP.core.Node) &&
        sigOriginTPNode.contains(currentTargetTPElem, TP.IDENTITY)) {

        this.blur();
        this.setAttribute('hidden', true);

        return this;
    }

    //  Next, check to see if any of the detached nodes were under current
    //  target. In this case, we don't need to refocus, but we may need to
    //  resize.

    if (sigOriginTPNode.identicalTo(currentTargetTPElem)) {
        this.moveAndSizeToTarget(currentTargetTPElem);
    }

    /*
    if (TP.notEmpty(mutatedIDs = aSignal.at('mutatedNodeIDs'))) {

        if (TP.isValid(currentTargetTPElem)) {

            doc = currentTargetTPElem.getNativeDocument();

            for (i = 0; i < mutatedIDs.getSize(); i++) {
                mutatedNode = TP.byId(mutatedIDs.at(i), doc, false);

                if (currentTargetTPElem.contains(mutatedNode, TP.IDENTITY)) {

                    this.moveAndSizeToTarget(currentTargetTPElem);
                    return this;
                }
            }
        }
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMReposition',
function(aSignal) {

    var currentTargetTPElem;

    if (TP.isFalse(this.getAttribute('hidden'))) {
        currentTargetTPElem = this.get('currentTargetTPElem');
        this.moveAndSizeToTarget(currentTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMResize',
function(aSignal) {

    var currentTargetTPElem;

    if (TP.isFalse(this.getAttribute('hidden'))) {
        currentTargetTPElem = this.get('currentTargetTPElem');
        this.moveAndSizeToTarget(currentTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMScroll',
function(aSignal) {

    var currentTargetTPElem;

    if (TP.isFalse(this.getAttribute('hidden'))) {
        currentTargetTPElem = this.get('currentTargetTPElem');
        this.moveAndSizeToTarget(currentTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler(
{signal: 'HiddenChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleHiddenChange
     * @returns {TP.sherpa.halo} The receiver.
     */

    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler(
{signal: 'DrawerClosedWillChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleDrawerClosedWillChange
     * @returns {TP.sherpa.halo} The receiver.
     */

    if (TP.isFalse(this.getAttribute('hidden'))) {
        this.set('$wasShowing', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler(
{signal: 'DrawerClosedDidChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleDrawerClosedDidChange
     * @returns {TP.sherpa.halo} The receiver.
     */

    if (this.get('$wasShowing')) {
        this.set('$wasShowing', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('HaloClick',
function(aSignal) {

    /**
     * @method handleHaloClick
     * @summary Handles notifications of mouse click events.
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var sigTarget,
        sigCorner,

        cornerSuffix;

    sigTarget = aSignal.getTarget();

    sigCorner = sigTarget.getAttribute('id');

    if (sigCorner.startsWith('haloCorner-')) {

        cornerSuffix = sigCorner.slice(11);

        switch (cornerSuffix) {
            case 'North':
                break;
            case 'Northeast':
                break;
            case 'East':
                break;
            case 'Southeast':
                break;
            case 'South':
                break;
            case 'Southwest':
                break;
            case 'West':
                break;
            case 'Northwest':
                break;
            default:
                //  TODO: error?
                break;
        }

        this.signal('TP.sig.Halo' + cornerSuffix + 'Click',
                    aSignal.getEvent(),
                    TP.INHERITANCE_FIRING);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseMove',
function(aSignal) {

    /**
     * @method handleDOMMouseMove
     * @param {TP.sig.DOMMouseMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseOver',
function(aSignal) {

    /**
     * @method handleDOMMouseOver
     * @param {TP.sig.DOMMouseOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    // this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseOut',
function(aSignal) {

    /**
     * @method handleDOMMouseOut
     * @param {TP.sig.DOMMouseOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    // this.hideHaloCorner();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseWheel',
function(aSignal) {

    /**
     * @method handleDOMMouseWheel
     * @param {TP.sig.DOMMouseWheel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,
        newTargetTPElem;

    if (aSignal.getShiftKey()) {

        aSignal.preventDefault();

        if (aSignal.getWheelDelta().abs() > 0.5) {
            currentTargetTPElem = this.get('currentTargetTPElem');

            if (aSignal.getDirection() === TP.UP) {
                newTargetTPElem = currentTargetTPElem.getHaloParent(this);
            } else {
                newTargetTPElem = currentTargetTPElem.getNextHaloChild(
                                                                this, aSignal);
            }

            newTargetTPElem = this.getNearestFocusable(
                                            newTargetTPElem, aSignal);

            //  Couldn't find a new target... exit.
            if (TP.notValid(newTargetTPElem)) {
                return;
            }

            if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode) &&
                !newTargetTPElem.identicalTo(currentTargetTPElem)) {

                this.blur();
                this.focusOn(newTargetTPElem);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('getNearestFocusable',
function(newTargetTPElem, aSignal) {

    var canFocus,

        focusableTPElem;

    //  Couldn't find a new target... exit.
    if (TP.notValid(newTargetTPElem)) {
        return null;
    }

    focusableTPElem = newTargetTPElem;

    canFocus = newTargetTPElem.haloCanFocus(this, aSignal);

    if (canFocus === TP.ANCESTOR) {

        while (TP.isValid(focusableTPElem =
                            focusableTPElem.getHaloParent(this))) {

            canFocus = focusableTPElem.haloCanFocus(this, aSignal);

            if (canFocus && canFocus !== TP.ANCESTOR) {
                break;
            }
        }
    }

    //  Couldn't find one to focus on? Return null.
    if (!canFocus) {
        return null;
    }

    return focusableTPElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('hideHaloCorner',
function() {

    var lastCorner,
        elem;

    lastCorner = this.get('lastCorner');

    if (TP.isElement(elem = TP.byId('haloCorner-' + lastCorner,
                            this.get('$document'),
                            false))) {
        TP.elementHide(elem);
    }

    //  Reset it to null
    this.set('lastCorner', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('moveAndSizeToTarget',
function(aTarget) {

    /**
     * @method moveAndSizeToTarget
     * @param {TP.core.ElementNode|undefined} aTarget
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,

        theRect,
        ourRect;

    currentTargetTPElem = this.get('currentTargetTPElem');

    if (TP.notValid(aTarget)) {
        //  No new target

        if (TP.notValid(currentTargetTPElem)) {
            //  No existing target either - bail out.
            return;
        }

        //  Grab rect for the existing target. Note that this will be supplied
        //  in *global* coordinates.
        theRect = currentTargetTPElem.getHaloRect(this);
    } else {
        //  Grab rect for the new target. Note that this will be supplied in
        //  *global* coordinates.
        theRect = aTarget.getHaloRect(this);
    }

    if (TP.notValid(aTarget) && TP.notValid(currentTargetTPElem)) {
        this.setAttribute('hidden', true);

        this.set('haloRect', null);
    } else {

        //  Given that the halo rect returned by one of the targets above is in
        //  *global* coordinates, we need to sure to adjust for the fact that
        //  the halo itself might be in a container that's positioned. We go to
        //  the halo's offset parent and get it's global rectangle.

        //  Note that we do this because the halo is currently hidden and won't
        //  give proper coordinates when computing relative to its offset
        //  parent.
        ourRect = this.getOffsetParent().getGlobalRect(true);

        theRect.subtractByPoint(ourRect.getXYPoint());

        this.setOffsetPositionAndSize(theRect);

        this.set('haloRect', theRect);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('showHaloCorner',
function(aSignal) {

    /**
     * @method showHaloCorner
     * @param {TP.sig.DOMSignal} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,

        angle,
        corner,
        lastCorner,
        elem;

    if (TP.isFalse(this.get('open'))) {
        return this;
    }

    currentTargetTPElem = this.get('currentTargetTPElem');

    if (TP.notValid(currentTargetTPElem)) {
        //  No existing target either - bail out.
        return;
    }

    angle = TP.computeAngleFromEnds(
                    currentTargetTPElem.getHaloRect(this).getCenterPoint(),
                    aSignal.getEvent());

    corner = TP.computeCompassCorner(angle, 8);

    lastCorner = this.get('lastCorner');

    if (corner !== lastCorner) {
        if (TP.isElement(elem =
                            TP.byId('haloCorner-' + lastCorner,
                            this.get('$document'),
                            false))) {
            TP.elementHide(elem);
        }

        if (TP.isElement(elem =
                            TP.byId('haloCorner-' + corner,
                            this.get('$document'),
                            false))) {
            TP.elementShow(elem);
        }
    }

    this.set('lastCorner', corner);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
