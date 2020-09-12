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
 * @type {TP.lama.manipulator}
 */

//  ------------------------------------------------------------------------

TP.lama.canvastool.defineSubtype('manipulator');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.lama.manipulator.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.manipulator.Inst.defineAttribute('$currentTargetTPElement');
TP.lama.manipulator.Inst.defineAttribute('$currentModifyingRule');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.manipulator.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @summary Handles notifications of document size changes from the overall
     *     canvas that the halo is working with.
     * @param {TP.sig.DOMResize} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.manipulator} The receiver.
     */

    //  If we're not hidden, then we move and resize to the halo's target. It's
    //  size and position might very well have changed due to resizing changes
    //  in the document.
    if (TP.isFalse(this.getAttribute('hidden'))) {
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.manipulator.Inst.defineHandler('DOMScroll',
function(aSignal) {

    /**
     * @method handleDOMScroll
     * @summary Handles notifications of document scrolling changes from the
     *     overall canvas that the manipulator is working with.
     * @param {TP.sig.DOMScroll} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.manipulator} The receiver.
     */

    //  If we're not hidden, then we move and resize to the halo's target. It's
    //  size and position might very well have changed due to scrolling changes
    //  in the document.
    if (TP.isFalse(this.getAttribute('hidden'))) {
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.manipulator.Inst.defineMethod('setAttrHidden',
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

        lamaMain,

        haloTPElem,

        targetTPElem,

        modifyingRule;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return wasHidden;
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    this.callNextMethod();

    lamaMain = TP.bySystemId('Lama');

    haloTPElem = TP.byId('LamaHalo', this.getNativeDocument());

    targetTPElem = haloTPElem.get('currentTargetTPElem');

    //  If we don't have a valid target element, then we exit here *without
    //  calling up to our supertype*. We don't want the attribute to be
    //  toggled, but we don't have valid target to show the halo on.
    if (TP.notValid(targetTPElem)) {
        return this;
    }

    if (TP.isTrue(beHidden)) {

        this.$set('$currentTargetTPElement', null);
        this.$set('$currentModifyingRule', null);

        this.ignore(this.getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        this.ignore(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

    } else {

        modifyingRule = lamaMain.getOrMakeModifiableRule(targetTPElem);

        //  We immediately got a modifiable rule.
        if (TP.isValid(modifyingRule)) {
            this.$set('$currentTargetTPElement', targetTPElem);
            this.$set('$currentModifyingRule', modifyingRule);

            this.observe(this.getDocument(),
                            TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
            this.observe(TP.sys.getUICanvas().getDocument(),
                            TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        }
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    return beHidden;
});

//  ------------------------------------------------------------------------

TP.lama.manipulator.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.manipulator} The receiver.
     */

    if (shouldObserve) {
        this.observe(TP.byId('LamaHalo', this.getNativeDocument()),
                        TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    } else {
        this.ignore(TP.byId('LamaHalo', this.getNativeDocument()),
                        TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
