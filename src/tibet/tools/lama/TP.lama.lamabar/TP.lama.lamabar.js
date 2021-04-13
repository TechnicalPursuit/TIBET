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
 * @type {TP.lama.lamabar}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('lamabar');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.lamabar.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.wrap(elem).setup();

    return;
});

//  ------------------------------------------------------------------------

TP.lama.lamabar.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.wrap(elem).teardown();

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.lamabar.Inst.defineAttribute('foo');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.lamabar.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.lamabar} The receiver.
     */

    var lamaInst;

    this.setValue(null);

    lamaInst = TP.bySystemId('Lama');
    this.ignore(lamaInst, 'CanvasChanged');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.lamabar.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.lamabar} The receiver.
     */

    var haloTarget,

        pagePoint;

    haloTarget = aSignal.at('haloTarget');

    pagePoint = haloTarget.getPagePoint();

    TP.core.ElectronMain.signalMain(
        'TP.sig.FocusRendererElement',
        TP.hc(
            'targetID', haloTarget.getLocalID(),
            'elementX', pagePoint.getX(),
            'elementY', pagePoint.getY()
        ));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.lamabar.Inst.defineHandler('ToggleHalo',
function(aSignal) {

    /**
     * @method handleToggleHalo
     * @summary Handles notifications of when the user wants to toggle the halo
     *     on and off. In the case where the halo is being toggled off, the last
     *     halo'ed element will be preserved and will become focused by the halo
     *     if this signal is used again to toggle the halo back on.
     * @param {TP.sig.ToggleHalo} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    this.signal('LamaHaloToggle', aSignal, TP.FIRE_ONE);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.lamabar.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary Sets the 'hidden' attribute of the receiver. This method causes
     *     the HUD to show or hide itself.
     * @param {Boolean} beHidden Whether or not the console should be hidden.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var wasHidden;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return this;
    }

    if (beHidden) {
        this.toggleObservations(false);
    } else {
        this.toggleObservations(true);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.lamabar.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.lama.lamabar} The receiver.
     */

    /*
    var url;

    this.observe(TP.byId('LamaHalo', this.getNativeDocument()),
                    'TP.sig.HaloDidBlur');

    this.observe(TP.sys.uidoc(), 'TP.sig.MutationStyleChange');

    this.set('$updateRulesOnly', false);

    //  Preload the CSS info file from this type's directory and set the
    //  cssSchema instance variable to the result.
    url = TP.uc('~ide_root/TP.lama.lamabar/css-schema.xml');

    url.getResource(TP.hc('resultType', TP.DOM)).then(
        function(result) {
            this.set('cssSchema', result);
        }.bind(this));
    */

    this.toggleObservations(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.lamabar.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.lama.lamabar} The receiver.
     */

    /*
    this.ignore(TP.byId('LamaHalo', this.getNativeDocument()),
                    'TP.sig.HaloDidBlur');

    this.ignore(TP.sys.uidoc(), 'TP.sig.MutationStyleChange');
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.lamabar.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.lamabar} The receiver.
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
