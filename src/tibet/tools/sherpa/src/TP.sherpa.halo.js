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
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:halo');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineAttribute('currentTargetTPElem');
TP.sherpa.halo.Inst.defineAttribute('haloRect');

TP.sherpa.halo.Inst.defineAttribute('lastCorner');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    /* eslint-disable no-wrap-func */
    (function (aSignal) {
        if (aSignal.getShiftKey()) {
            //  Make sure to prevent default to avoid having the context menu
            //  pop up.
            aSignal.preventDefault();
            aSignal.stopPropagation();

            this.changeHaloFocus(aSignal);
            return;
        }
    }).bind(this).observe(TP.core.Mouse, 'TP.sig.DOMContextMenu');

    (function (aSignal) {
        if (aSignal.getShiftKey() && TP.notTrue(this.getAttribute('hidden'))) {
            aSignal.preventDefault();
            aSignal.stopPropagation();

            this.changeHaloFocus(aSignal);
            return;
        }
    }).bind(this).observe(TP.core.Mouse, 'TP.sig.DOMClick');
    /* eslint-disable no-wrap-func */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @name setAttrHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    if (TP.bc(this.getAttribute('hidden')) === beHidden) {
        return this;
    }

    if (TP.isTrue(beHidden)) {
        this.ignore(this, 'TP.sig.DOMMouseMove');
        this.ignore(this, 'TP.sig.DOMMouseOver');
        this.ignore(this, 'TP.sig.DOMMouseOut');

        this.ignore(this, 'TP.sig.DOMMouseWheel');
    } else {
        this.observe(this, 'TP.sig.DOMMouseMove');
        this.observe(this, 'TP.sig.DOMMouseOver');
        this.observe(this, 'TP.sig.DOMMouseOut');

        this.observe(this, 'TP.sig.DOMMouseWheel');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('blur',
function() {

    /**
     * @name blur
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    var currentTargetTPElem;

    this.moveAndSizeToTarget(null);

    currentTargetTPElem = this.get('currentTargetTPElem');

    this.set('currentTargetTPElem', null);

    this.signal('TP.sig.HaloDidBlur', TP.hc('haloTarget', currentTargetTPElem));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('focusOn',
function(target) {

    /**
     * @name focusOn
     * @param {TP.core.Node} target
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    if (TP.isKindOf(target, TP.core.ElementNode)) {
        this.moveAndSizeToTarget(target);

        this.set('currentTargetTPElem', target);
    } else if (TP.isValid(this.get('currentTargetTPElem'))) {
        this.blur();
    } else {
        //  No existing target
        void(0);
    }

    this.signal('TP.sig.HaloDidFocus', TP.hc('haloTarget', target));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleSherpaHUDHiddenChange',
function(aSignal) {

    /**
     * @name handleHiddenChange
     */

    this.setAttribute('hidden', true);
    this.set('haloRect', null);

    return this;
});

//  ------------------------------------------------------------------------
//  Mouse Handling
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleTP_sig_DOMClick',
function(aSignal) {

    /**
     * @name handleTP_sig_DOMClick
     * @synopsis Handles notifications of mouse click events.
     * @param {DOMClick} aSignal The TIBET signal which triggered this method.
     */

    var sigTarget,
        sigSuffix,
        lastCorner;

    if (aSignal.getShiftKey()) {
        aSignal.preventDefault();
        aSignal.stopPropagation();

        this.changeHaloFocus(aSignal);

        return;
    }

    sigTarget = aSignal.getTarget();

    if (sigTarget === this.get('$haloTPElem').getNativeNode() ||
        this.get('$haloTPElem').contains(sigTarget)) {
        sigSuffix = null;

        if (TP.isValid(lastCorner = this.get('lastCorner'))) {
            switch (lastCorner) {
                case 1:
                    sigSuffix = 'North';
                    break;
                case 5:
                    sigSuffix = 'Northeast';
                    break;
                case 9:
                    sigSuffix = 'East';
                    break;
                case 13:
                    sigSuffix = 'Southeast';
                    break;
                case 17:
                    sigSuffix = 'South';
                    break;
                case 21:
                    sigSuffix = 'Southwest';
                    break;
                case 25:
                    sigSuffix = 'West';
                    break;
                case 29:
                    sigSuffix = 'Northwest';
                    break;
            }
        }

        if (TP.isValid(sigSuffix)) {
            this.signal('TP.sig.Halo' + sigSuffix + 'Click',
                aSignal.getEvent(), TP.INHERITANCE_FIRING);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleDOMMouseMove',
function(aSignal) {

    /**
     * @name handleDOMMouseMove
     * @param {TP.sig.DOMMouseMove} aSignal
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleDOMMouseOver',
function(aSignal) {

    /**
     * @name handleDOMMouseOver
     * @param {TP.sig.DOMMouseOver} aSignal
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    //this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleDOMMouseOut',
function(aSignal) {

    /**
     * @name handleDOMMouseOut
     * @param {TP.sig.DOMMouseOut} aSignal
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    //this.hideHaloCorner();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleDOMMouseWheel',
function(aSignal) {

    /**
     * @name handleDOMMouseWheel
     * @param {TP.sig.DOMMouseWheel} aSignal
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    //TP.info('got to TP.sherpa.halo::handleDOMMouseWheel', TP.LOG);
    return;
/*
    var currentTargetTPElem,
        newTargetTPElem;

    if (aSignal.getWheelDelta().abs() > 0.5) {
        currentTargetTPElem = this.get('currentTargetTPElem');

        if (aSignal.getDirection() === TP.UP) {
            newTargetTPElem = currentTargetTPElem.getHaloParent(this);
        } else {
            newTargetTPElem = currentTargetTPElem.getNextHaloChild(
                this, aSignal);
        }

        if (TP.notValid(newTargetTPElem)) {
            return;
        }

        if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode) &&
            (newTargetTPElem !== currentTargetTPElem)) {
            this.focusOn(newTargetTPElem);
        }
    }

    return this;
*/
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('hideHaloCorner',
function() {

    var lastCorner,
        elem;

    lastCorner = this.get('lastCorner');

    if (TP.isElement(elem = TP.byId('haloCorner-' + lastCorner,
            this.get('$document')))) {
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
     * @name moveAndSizeToTarget
     * @param {undefined} aTarget

     * @returns {TP.sherpa.halo} The receiver.
     * @abstract

     * @todo
     */

    var existingTPTarget,
        theRect;

    existingTPTarget = this.get('currentTargetTPElem');

    if (TP.notValid(aTarget)) {
        //  No new target

        if (TP.notValid(existingTPTarget)) {
            //  No existing target either - bail out.
            return;
        }

        //  Grab rect for existing target and adjust to be in halves
        theRect = existingTPTarget.getHaloRect(this);
        theRect = TP.rtc(
            theRect.getX() + (theRect.getWidth() / 2),
            theRect.getY() + (theRect.getHeight() / 2),
            0,
            0);
    } else {
        theRect = aTarget.getHaloRect(this);
    }

    if (TP.notValid(aTarget) && TP.notValid(existingTPTarget)) {
        this.setAttribute('hidden', true);

        this.set('haloRect', null);
    } else {
        this.setPagePositionAndSize(theRect);
        this.setAttribute('hidden', false);

        this.set('haloRect', theRect);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('showHaloCorner',
function(aSignal) {

    /**
     * @name showHaloCorner
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    var existingTPTarget,

        angle,
        corner,
        lastCorner,
        elem;

    if (TP.isFalse(this.get('open'))) {
        return this;
    }

    existingTPTarget = this.get('currentTargetTPElem');

    if (TP.notValid(existingTPTarget)) {
        //  No existing target either - bail out.
        return;
    }

    angle = TP.computeAngleFromEnds(
        existingTPTarget.getHaloRect(this).getCenterPoint(),
        aSignal.getEvent());

    corner = TP.computeCompassCorner(angle, 8);

    lastCorner = this.get('lastCorner');

    if (corner !== lastCorner) {
        if (TP.isElement(elem = TP.byId('haloCorner-' + lastCorner,
                this.get('$document')))) {
            TP.elementHide(elem);
        }

        if (TP.isElement(elem = TP.byId('haloCorner-' + corner,
                this.get('$document')))) {
            TP.elementShow(elem);
        }
    }

    this.set('lastCorner', corner);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('changeHaloFocus',
function(aSignal) {

    /**
     * @name changeHaloFocus
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract

     * @todo
     */

    var sigTarget,
        targetWin,

        handledSignal,

        existingTPTarget,
        targetTPElem;

    sigTarget = aSignal.getTarget();

    //  Compute the 'target window' - that is, the window that the event's
    //  target is in... this may be different than the signals' window (weird, I
    //  know).
    if (TP.isValid(this.get('currentTargetTPElem'))) {
        targetWin = this.get('currentTargetTPElem').getNativeWindow();
    }

    handledSignal = false;

    existingTPTarget = this.get('currentTargetTPElem');

    //  If:
    //      a) We have an existing target
    //      b) AND: The user clicked the LEFT button
    //      c) AND: the existing target can blur
    if (TP.isValid(existingTPTarget) &&
        aSignal.getButton() === TP.LEFT &&
        existingTPTarget.haloCanBlur(this, aSignal)) {

            this.blur();
            this.setAttribute('hidden', true);

            handledSignal = true;
    } else if (aSignal.getButton() === TP.RIGHT) {

        if (TP.isValid(existingTPTarget) &&
                this.getNativeNode() === sigTarget) {

            targetTPElem = existingTPTarget.getHaloParent(this);

            if (targetTPElem !== existingTPTarget &&
                targetTPElem.haloCanFocus(this, aSignal)) {

                this.signal('TP.sig.HaloDidBlur');
                this.signal('TP.sig.HaloDidBlur',
                            TP.hc('haloTarget', targetTPElem));

                this.focusOn(targetTPElem);

                handledSignal = true;
            }
        } else {
            targetTPElem = TP.wrap(sigTarget);

            if (targetTPElem.haloCanFocus(this, aSignal)) {

                //  This will cause the halo to move and size to a new target.
                this.focusOn(targetTPElem);
                this.setAttribute('hidden', false);

                handledSignal = true;
            }
        }
    }

    if (handledSignal) {
        TP.documentClearSelection(this.getNativeDocument());
        aSignal.preventDefault();
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
