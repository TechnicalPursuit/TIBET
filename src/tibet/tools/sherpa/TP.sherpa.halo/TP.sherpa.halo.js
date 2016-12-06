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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineAttribute('$wasShowing');
TP.sherpa.halo.Inst.defineAttribute('$dontSignalBlurFocus');

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

    tpElem.observe(TP.ANY, 'SherpaHaloToggle');

    tpElem.observe(TP.core.Mouse,
                    TP.ac('TP.sig.DOMClick', 'TP.sig.DOMContextMenu'));

    tpElem.observe(TP.byId('SherpaHUD', tpElem.getNativeWindow()),
                    'ClosedChange');

    tpElem.observe(TP.bySystemId('SherpaExtruder'), 'ExtruderDOMInsert');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('blur',
function() {

    /**
     * @method blur
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem;

    currentTargetTPElem = this.get('currentTargetTPElem');

    if (TP.notValid(currentTargetTPElem)) {
        return this;
    }

    if (currentTargetTPElem.hasAttribute('tibet:refreshing')) {
        this.set('$dontSignalBlurFocus', true);
    }

    this.moveAndSizeToTarget(null);

    if (TP.isValid(currentTargetTPElem)) {

        this.set('currentTargetTPElem', null);
    }

    if (TP.notTrue(this.get('$dontSignalBlurFocus'))) {
        this.signal('TP.sig.HaloDidBlur',
                    TP.hc('haloTarget', currentTargetTPElem),
                    TP.OBSERVER_FIRING);
    }

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

        //  NOTE: Make sure to hide the halo *before* we blur - this way any
        //  signal handlers that are watching the target element are properly
        //  shut down.
        this.setAttribute('hidden', true);
        this.blur();

        handledSignal = true;
    } else if (aSignal.getButton() === TP.RIGHT) {

        //  A Shift-Right-Click - we're shifting focus to a new element.

        newTargetTPElem = TP.wrap(sigTarget);

        if (TP.isValid(currentTargetTPElem)) {

            //  If the Control key is being pressed, and the current target is
            //  either identical to the new one or it contains the new one, then
            //  we want to traverse 'up' the parent hierarchy.
            if (aSignal.getCtrlKey() &&
                (currentTargetTPElem.identicalTo(newTargetTPElem) ||
                currentTargetTPElem.contains(newTargetTPElem))) {

                //  Note here how we ask the *current* target for its nearest
                //  focusable element. The new target very well might at this
                //  point be a descendant of the current target and so asking it
                //  for its nearest focusable target will probably return either
                //  the current target or actually a descendant of the current
                //  target that is somewhere 'between' the two.

                newTargetTPElem = currentTargetTPElem.getNearestHaloFocusable(
                                                            this, aSignal);
            } else {

                //  The Control key is not being pressed, so we could use the
                //  new target. But first, we need to make sure it can be
                //  halo'ed on. If not, find it's nearest haloable element 'up'
                //  the parent hierarchy.
                if (!newTargetTPElem.haloCanFocus(this, aSignal)) {
                    newTargetTPElem = newTargetTPElem.getNearestHaloFocusable(
                                                            this, aSignal);
                }
            }

        } else {

            //  No current target - completely new selection.

            //  If it can't be focused, traverse 'up' the parent hierarchy.
            if (!newTargetTPElem.haloCanFocus(this, aSignal)) {
                newTargetTPElem = newTargetTPElem.getNearestHaloFocusable(
                                                                this, aSignal);
            }
        }

        //  Couldn't find a new target... exit.
        if (TP.notValid(newTargetTPElem)) {
            return this;
        }

        //  We computed a new target above. If it's not the same as the current
        //  target, then blur the current one and focus on the new one.
        if (TP.isValid(newTargetTPElem) &&
            !newTargetTPElem.identicalTo(currentTargetTPElem)) {

            if (TP.isValid(currentTargetTPElem)) {
                this.ignore(currentTargetTPElem, 'TP.sig.DOMReposition');
                this.blur();
            }

            this.focusOn(newTargetTPElem);

            //  NB: This will set up the DOMReposition handler on the target
            //  element
            this.setAttribute('hidden', false);

            handledSignal = true;
        }
    }

    //  If we actually handled the signal, then we need to clear whatever
    //  selection might have gotten made. It seems that 'preventDefault()'ing
    //  the event (which we do in the callers of this method) doesn't quite do
    //  all of the right things.
    if (handledSignal) {
        if (TP.isValid(newTargetTPElem)) {
            TP.documentClearSelection(newTargetTPElem.getNativeDocument());
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('deleteTarget',
function() {

    /**
     * @method deleteTarget
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,

        ourName,
        appTagName;

    currentTargetTPElem = this.get('currentTargetTPElem');

    ourName = currentTargetTPElem.getCanonicalName();

    //  NB: We pass false here to skip returning any Sherpa tag if we're running
    //  in a Sherpa-enabled environment.
    appTagName = TP.tibet.root.computeAppTagTypeName(false);

    //  If our (canonical) name is the same as the app tag name, then we don't
    //  allow it to be deleted.
    if (ourName === appTagName) {
        TP.alert('It is not possible to delete the root application tag.');
        return this;
    }

    TP.confirm('Really delete the halo\'ed element?').then(
        function(shouldDelete) {

            if (shouldDelete) {
                currentTargetTPElem.detach();
            }
        });

    return TP.TSH_NO_VALUE;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('emptyTarget',
function() {

    /**
     * @method emptyTarget
     * @returns
     */

    var currentTargetTPElem;

    currentTargetTPElem = this.get('currentTargetTPElem');

    TP.confirm('Really empty the halo\'ed element?').then(
        function(shouldEmpty) {

            if (shouldEmpty) {
                currentTargetTPElem.empty();
            }
        });

    return TP.TSH_NO_VALUE;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('inspectTargetAspect',
function(aspectPathParts) {

    /**
     * @method inspectTargetAspect
     * @param {Array} aspectPathParts
     * @returns
     */

    var currentTargetTPElem,
        newTargetTPElem,

        pathParts;

    currentTargetTPElem = this.get('currentTargetTPElem');

    newTargetTPElem = currentTargetTPElem.getNearestHaloGenerator(this);

    if (TP.isValid(newTargetTPElem)) {
        this.blur();
        this.focusOn(newTargetTPElem);
    } else {
        newTargetTPElem = currentTargetTPElem;
    }

    pathParts = aspectPathParts;
    pathParts.unshift('__TARGET__');

    this.signal('InspectObject',
                    TP.hc('targetObject', newTargetTPElem,
                            'targetPath', pathParts.join(TP.PATH_SEP)));

    return TP.TSH_NO_VALUE;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('focusOn',
function(newTargetTPElem) {

    /**
     * @method focusOn
     * @param {TP.core.ElementNode} newTargetTPElem
     * @returns {TP.sherpa.halo} The receiver.
     */

    if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode)) {

        //  If we're visible, then move and size the halo to the target
        if (!this.getAttribute('hidden')) {
            this.moveAndSizeToTarget(newTargetTPElem);
        }

        this.set('currentTargetTPElem', newTargetTPElem);

        if (TP.notTrue(this.get('$dontSignalBlurFocus'))) {
            this.signal('TP.sig.HaloDidFocus',
                        TP.hc('haloTarget', newTargetTPElem),
                        TP.OBSERVER_FIRING);
        }

        if (newTargetTPElem.hasAttribute('tibet:refreshing')) {
            this.set('$dontSignalBlurFocus', false);
        }

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

            //  If the node isn't actually detaching from the DOM, then we're
            //  changing content underneath it, so there's no need to signal
            //  focus and blur (although we do call the routines to keep
            //  everything up to date).
            if (!TP.nodeIsDetached(currentTargetTPElem.getNativeNode())) {
                this.set('$dontSignalBlurFocus', true);
            }

            this.blur();

            newTargetTPElem = TP.byId(currentTargetTPElem.getLocalID(),
                                        aSignal.getOrigin().getDocument());

            if (TP.isKindOf(newTargetTPElem, TP.core.Node)) {
                this.focusOn(newTargetTPElem);
            } else {
                this.setAttribute('hidden', true);
            }

            //  If this flag got set above, set it back.
            if (this.get('$dontSignalBlurFocus') === true) {
                this.set('$dontSignalBlurFocus', false);
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

TP.sherpa.halo.Inst.defineHandler('ExtruderDOMInsert',
function(aSignal) {

    var newTargetTPElem,
        currentTargetTPElem;

    newTargetTPElem = aSignal.at('insertedTPElem');
    currentTargetTPElem = this.get('currentTargetTPElem');

    if (!newTargetTPElem.identicalTo(currentTargetTPElem)) {

        //  See if we can focus the new target element - if not, we'll search up
        //  the parent chain for the nearest focusable element
        if (!newTargetTPElem.haloCanFocus(this, aSignal)) {
            newTargetTPElem = newTargetTPElem.getNearestHaloFocusable(
                                                            this, aSignal);
        }

        //  Couldn't find a focusable target... exit.
        if (TP.notValid(newTargetTPElem)) {
            return this;
        }

        if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode) &&
            !newTargetTPElem.identicalTo(currentTargetTPElem)) {

            //  This will move the halo off of the old element.
            this.blur();

            //  This will move the halo to the new element.
            this.focusOn(newTargetTPElem);
        }

        //  This will 'unhide' the halo.
        this.setAttribute('hidden', false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler(
{signal: 'ClosedChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleClosedChange
     * @returns {TP.sherpa.halo} The receiver.
     */

    var hud,
        hudIsHidden,

        wasHidden;

    hud = TP.byId('SherpaHUD', this.getNativeWindow());

    hudIsHidden = TP.bc(hud.getAttribute('closed'));

    if (hudIsHidden) {
        wasHidden = TP.bc(this.getAttribute('hidden'));
        this.set('$wasShowing', !wasHidden);

        this.setAttribute('hidden', true);
    } else {
        this.setAttribute('hidden', !this.get('$wasShowing'));
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

TP.sherpa.halo.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    if (aSignal.getShiftKey() && TP.notTrue(this.getAttribute('hidden'))) {
        aSignal.preventDefault();
        aSignal.stopPropagation();

        this.changeHaloFocusOnClick(aSignal);

        return;
    } else if (this.contains(aSignal.getTarget())) {
        this[TP.composeHandlerName('HaloClick')](aSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMContextMenu',
function(aSignal) {

    /**
     * @method handleDOMContextMenu
     * @param {TP.sig.DOMContextMenu} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

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

    // this.showHaloCorner(aSignal);

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

            //  Couldn't find a new target... exit.
            if (TP.notValid(newTargetTPElem)) {
                return this;
            }

            //  See if we can focus the new target element - if not, we'll
            //  search up the parent chain for the nearest focusable element
            if (!newTargetTPElem.haloCanFocus(this, aSignal)) {
                newTargetTPElem = newTargetTPElem.getNearestHaloFocusable(
                                                                this, aSignal);
            }

            //  Couldn't find a focusable target... exit.
            if (TP.notValid(newTargetTPElem)) {
                return this;
            }

            if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode) &&
                !newTargetTPElem.identicalTo(currentTargetTPElem)) {

                //  This will move the halo off of the old element.
                this.blur();

                //  This will move the halo to the new element.
                this.focusOn(newTargetTPElem);
            }
        }
    }

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
function(newTargetTPElem) {

    /**
     * @method moveAndSizeToTarget
     * @param {TP.core.ElementNode|undefined} newTargetTPElem
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,

        theRect,
        ourRect;

    currentTargetTPElem = this.get('currentTargetTPElem');

    if (TP.notValid(newTargetTPElem)) {
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
        theRect = newTargetTPElem.getHaloRect(this);
    }

    if (TP.notValid(newTargetTPElem) && TP.notValid(currentTargetTPElem)) {
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

TP.sherpa.halo.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @param {Boolean} beHidden
     * @returns {TP.sherpa.halo} The receiver.
     */

    var wasHidden,
        currentTargetTPElem;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        return this;
    }

    currentTargetTPElem = this.get('currentTargetTPElem');

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

        if (TP.isValid(currentTargetTPElem)) {
            this.ignore(currentTargetTPElem, 'TP.sig.DOMReposition');
        }

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

        if (TP.isValid(currentTargetTPElem)) {
            this.observe(currentTargetTPElem, 'TP.sig.DOMReposition');
        }

        this.moveAndSizeToTarget(this.get('currentTargetTPElem'));
    }

    return this.callNextMethod();
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

TP.sherpa.halo.Inst.defineHandler('SherpaHaloToggle',
function(aSignal) {

    this.setAttribute('hidden', !this.getAttribute('hidden'));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
