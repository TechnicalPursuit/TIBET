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

TP.sherpa.halo.Inst.defineAttribute(
        'breadcrumb',
        {value: TP.cpc('> sherpa|breadcrumb', TP.hc('shouldCollapse', true))});

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
        tpElem,

        breadcrumbData,

        breadcrumbTPElem;

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

                contextMenuTPElem = TP.byId('SherpaContextMenu', TP.win('UIROOT'));

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
                            'DrawerCloseWillChange',
                            'DrawerCloseDidChange'));

    //  Set up the breadcrumb data
    breadcrumbData = TP.hc();
    TP.uc('urn:tibet:sherpa_halo_breadcrumb').setResource(
                                            breadcrumbData,
                                            TP.hc('observeResource', true));

    breadcrumbTPElem = tpElem.get('breadcrumb');
    breadcrumbTPElem.defineMethod(
                    'getLabel',
                    function(anItem) {

                        var val,
                            id;

                        val = anItem.getLocalName();
                        if (TP.notEmpty(id = anItem.getAttribute('id'))) {
                            val += '#' + id;
                        }

                        return val;
                    });
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

    if (TP.bc(this.getAttribute('hidden')) === beHidden) {
        return this;
    }

    if (TP.isTrue(beHidden)) {
        this.ignore(this, 'TP.sig.DOMMouseMove');
        this.ignore(this, 'TP.sig.DOMMouseOver');
        this.ignore(this, 'TP.sig.DOMMouseOut');

        this.ignore(TP.core.Mouse, 'TP.sig.DOMMouseWheel');

        this.ignore(TP.ANY, 'TP.sig.DetachComplete');

        this.set('haloRect', null);
    } else {
        this.observe(this, 'TP.sig.DOMMouseMove');
        this.observe(this, 'TP.sig.DOMMouseOver');
        this.observe(this, 'TP.sig.DOMMouseOut');

        this.observe(TP.core.Mouse, 'TP.sig.DOMMouseWheel');

        this.observe(TP.ANY, 'TP.sig.DetachComplete');
    }

    this.get('breadcrumb').setAttrHidden(beHidden);

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

        this.ignore(this.getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        this.ignore(currentTargetTPElem.getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

        this.set('currentTargetTPElem', null);
    }

    this.signal('TP.sig.HaloDidBlur', TP.hc('haloTarget', currentTargetTPElem),
                TP.OBSERVER_FIRING);

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
        newTargetTPElem,

        canFocus;

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

            newTargetTPElem = currentTargetTPElem.getHaloParent(this);

            //  If the parent wasn't the same as the currently focused element,
            //  and it can be focused by the halo, then blur the existing
            //  element and focus the parent.
            if (!newTargetTPElem.identicalTo(currentTargetTPElem) &&
                newTargetTPElem.haloCanFocus(this, aSignal)) {

                this.blur();
                this.focusOn(newTargetTPElem);

                handledSignal = true;
            }
        } else {
            newTargetTPElem = TP.wrap(sigTarget);

            canFocus = newTargetTPElem.haloCanFocus(this, aSignal);

            if (canFocus === TP.ANCESTOR) {

                while (TP.isValid(newTargetTPElem =
                                    newTargetTPElem.getHaloParent(this))) {

                    canFocus = newTargetTPElem.haloCanFocus();

                    if (canFocus && canFocus !== TP.ANCESTOR) {
                        break;
                    }
                }
            }

            //  Couldn't find one to focus on? Clear the target.
            if (!canFocus) {
                newTargetTPElem = null;
            }
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

        this.observe(this.getDocument(),
                        TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        this.observe(target.getDocument(),
                        TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

        this.signal('TP.sig.HaloDidFocus', TP.hc('haloTarget', target),
                    TP.OBSERVER_FIRING);

        TP.uc('urn:tibet:sherpa_halo_breadcrumb').setResource(target);

    } else if (TP.isValid(this.get('currentTargetTPElem'))) {
        this.blur();
    } else {
        //  No existing target
        void 0;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('BreadcrumbClick',
function(aSignal) {

    var newTargetTPElem,
        targetElem,

        outlineVal;

    newTargetTPElem = aSignal.at('item');

    if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode)) {
        this.focusOn(newTargetTPElem);

        targetElem = TP.unwrap(newTargetTPElem);

        outlineVal = TP.elementPopStyleProperty(targetElem, 'outline');

        TP.elementSetStyleProperty(targetElem, 'outline', outlineVal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('BreadcrumbOver',
function(aSignal) {

    var newTargetTPElem,
        targetElem,

        outlineVal;

    newTargetTPElem = aSignal.at('item');

    if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode)) {
        targetElem = TP.unwrap(newTargetTPElem);

        outlineVal = TP.elementGetStyleProperty(targetElem, 'outline');
        TP.elementPushStyleProperty(targetElem, 'outline', outlineVal);

        TP.elementSetStyleProperty(targetElem, 'outline', 'dotted 1px red');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('BreadcrumbOut',
function(aSignal) {

    var newTargetTPElem,
        targetElem,

        outlineVal;

    newTargetTPElem = aSignal.at('item');

    if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode)) {
        targetElem = TP.unwrap(newTargetTPElem);

        outlineVal = TP.elementPopStyleProperty(targetElem, 'outline');

        TP.elementSetStyleProperty(targetElem, 'outline', outlineVal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DetachComplete',
function(aSignal) {

    var mutatedIDs,
        currentTargetTPElem,

        currentGlobalID,
        newTargetTPElem;

    if (TP.notEmpty(mutatedIDs = aSignal.at('mutatedNodeIDs'))) {

        currentTargetTPElem = this.get('currentTargetTPElem');

        if (TP.isValid(currentTargetTPElem)) {

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
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMResize',
function(aSignal) {

    var currentTargetTPElem;

    currentTargetTPElem = this.get('currentTargetTPElem');

    this.moveAndSizeToTarget(currentTargetTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMScroll',
function(aSignal) {

    var currentTargetTPElem;

    currentTargetTPElem = this.get('currentTargetTPElem');

    this.moveAndSizeToTarget(currentTargetTPElem);

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
{signal: 'DrawerCloseWillChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleDrawerCloseWillChange
     * @returns {TP.sherpa.halo} The receiver.
     */

    if (TP.isFalse(this.getAttribute('hidden'))) {
        this.set('$wasShowing', true);
        this.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler(
{signal: 'DrawerCloseDidChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleDrawerCloseDidChange
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem;

    if (this.get('$wasShowing')) {

        currentTargetTPElem = this.get('currentTargetTPElem');

        this.moveAndSizeToTarget(currentTargetTPElem);

        this.setAttribute('hidden', false);

        this.set('$wasShowing', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('HaloClick',
function(aSignal) {

    /**
     * @method handleHaloClick
     * @abstract Handles notifications of mouse click events.
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
        newTargetTPElem,

        canFocus;

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
                return;
            }

            canFocus = newTargetTPElem.haloCanFocus(this, aSignal);

            if (canFocus === TP.ANCESTOR) {

                while (TP.isValid(newTargetTPElem =
                                    newTargetTPElem.getHaloParent(this))) {

                    canFocus = newTargetTPElem.haloCanFocus();

                    if (canFocus && canFocus !== TP.ANCESTOR) {
                        break;
                    }
                }
            }

            //  Couldn't find one to focus on? Clear the target.
            if (!canFocus) {
                newTargetTPElem = null;
            }

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
        this.setAttribute('hidden', false);

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
