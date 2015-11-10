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
     * @method setup
     */

    /* eslint-disable no-wrap-func,no-extra-parens */
    (function(aSignal) {
        if (aSignal.getShiftKey()) {
            //  Make sure to prevent default to avoid having the context menu
            //  pop up.
            aSignal.preventDefault();
            aSignal.stopPropagation();

            this.changeHaloFocus(aSignal);

            return;
        }
    }).bind(this).observe(TP.core.Mouse, 'TP.sig.DOMContextMenu');

    (function(aSignal) {
        if (aSignal.getShiftKey() && TP.notTrue(this.getAttribute('hidden'))) {
            aSignal.preventDefault();
            aSignal.stopPropagation();

            this.changeHaloFocus(aSignal);

            return;
        } else if (this.contains(aSignal.getTarget())) {
            this[TP.composeHandlerName('HaloClick')](aSignal);
        }
    }).bind(this).observe(TP.core.Mouse, 'TP.sig.DOMClick');

    /*
    (function(aSignal) {
        if (TP.notTrue(this.getAttribute('hidden'))) {
            aSignal.preventDefault();
            aSignal.stopPropagation();

            TP.bySystemId('SherpaConsoleService').sendShellCommand(':edit $HALO');
        }
    }).bind(this).observe(TP.core.Mouse, 'TP.sig.DOMDblClick');
    */
    /* eslint-disable no-wrap-func,no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
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

        this.ignore(TP.core.Mouse, 'TP.sig.DOMMouseWheel');
    } else {
        this.observe(this, 'TP.sig.DOMMouseMove');
        this.observe(this, 'TP.sig.DOMMouseOver');
        this.observe(this, 'TP.sig.DOMMouseOut');

        this.observe(TP.core.Mouse, 'TP.sig.DOMMouseWheel');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('blur',
function() {

    /**
     * @method blur
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     */

    var currentTargetTPElem;

    this.moveAndSizeToTarget(null);

    currentTargetTPElem = this.get('currentTargetTPElem');

    this.ignore(this.getDocument(), 'TP.sig.DOMScroll');

    this.set('currentTargetTPElem', null);

    this.signal('TP.sig.HaloDidBlur', TP.hc('haloTarget', currentTargetTPElem));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('focusOn',
function(target) {

    /**
     * @method focusOn
     * @param {TP.core.Node} target
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     */

    if (TP.isKindOf(target, TP.core.ElementNode)) {
        this.moveAndSizeToTarget(target);

        this.set('currentTargetTPElem', target);

        this.observe(this.getDocument(), 'TP.sig.DOMScroll');

        this.signal('TP.sig.HaloDidFocus', TP.hc('haloTarget', target));

    } else if (TP.isValid(this.get('currentTargetTPElem'))) {
        this.blur();
    } else {
        //  No existing target
        void 0;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMScroll',
function(aSignal) {

    this.moveAndSizeToTarget();
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler(
{signal: 'HiddenChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleHiddenChange
     */

    this.setAttribute('hidden', true);
    this.set('haloRect', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('HaloClick',
function(aSignal) {

    /**
     * @method handleHaloClick
     * @summary Handles notifications of mouse click events.
     * @param {DOMClick} aSignal The TIBET signal which triggered this method.
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
     * @param {TP.sig.DOMMouseMove} aSignal
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     */

    this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseOver',
function(aSignal) {

    /**
     * @method handleDOMMouseOver
     * @param {TP.sig.DOMMouseOver} aSignal
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     */

    //this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseOut',
function(aSignal) {

    /**
     * @method handleDOMMouseOut
     * @param {TP.sig.DOMMouseOut} aSignal
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     */

    //this.hideHaloCorner();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseWheel',
function(aSignal) {

    /**
     * @method handleDOMMouseWheel
     * @param {TP.sig.DOMMouseWheel} aSignal
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
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
     * @param {undefined} aTarget

     * @returns {TP.sherpa.halo} The receiver.
     * @abstract

     */

    var currentTargetTPElem,
        theRect;

    currentTargetTPElem = this.get('currentTargetTPElem');

    if (TP.notValid(aTarget)) {
        //  No new target

        if (TP.notValid(currentTargetTPElem)) {
            //  No existing target either - bail out.
            return;
        }

        //  Grab rect for existing target and adjust to be in halves
        theRect = currentTargetTPElem.getHaloRect(this);
    } else {
        theRect = aTarget.getHaloRect(this);
    }

    if (TP.notValid(aTarget) && TP.notValid(currentTargetTPElem)) {
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
     * @method showHaloCorner
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
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

TP.sherpa.halo.Inst.defineMethod('changeHaloFocus',
function(aSignal) {

    /**
     * @method changeHaloFocus
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract

     */

    var sigTarget,

        handledSignal,

        currentTargetTPElem,
        targetTPElem;

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

            targetTPElem = currentTargetTPElem.getHaloParent(this);

            //  If the parent wasn't the same as the currently focused element,
            //  and it can be focused by the halo, then blur the existing
            //  element and focus the parent.
            if (!targetTPElem.identicalTo(currentTargetTPElem) &&
                targetTPElem.haloCanFocus(this, aSignal)) {

                this.blur();
                this.focusOn(targetTPElem);

                handledSignal = true;
            }
        } else {
            targetTPElem = TP.wrap(sigTarget);

            if (targetTPElem.haloCanFocus(this, aSignal)) {

                this.blur();
                this.focusOn(targetTPElem);

                this.setAttribute('hidden', false);

                handledSignal = true;
            }
        }
    }

    if (handledSignal) {
        if (TP.isValid(targetTPElem)) {
            TP.documentClearSelection(targetTPElem.getNativeDocument());
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
