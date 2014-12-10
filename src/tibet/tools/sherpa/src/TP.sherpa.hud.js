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
 * @type {TP.sherpa.hud}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:hud');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.hud.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('node'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @name setAttrHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var southDrawer,

        evtName,
        func;

    if (TP.bc(this.getAttribute('hidden')) === beHidden) {
        return this;
    }

    southDrawer = TP.byId('south', this.getNativeWindow());

    if (TP.isTrue(beHidden)) {

        //  We remove our 'south's 'no_transition' class so that it no longer
        //  'immediately snaps' like it needs to do during user interaction.
        TP.elementRemoveClass(southDrawer, 'no_transition');
        //TP.byId('south', this.getNativeWindow()).style.height = '';
        TP.elementGetStyleObj(southDrawer).height = '';

        this.hideAllHUDDrawers();

        this.getNativeWindow().focus();
    } else {

        if (TP.sys.isUA('WEBKIT')) {
            evtName = 'webkitTransitionEnd';
        } else {
            evtName = 'transitionend';
        }

        southDrawer.addEventListener(
            evtName,
            func = function() {

                southDrawer.removeEventListener(
                                evtName,
                                func,
                                true);

                //  We add our 'south's 'no_transition' class so that during
                //  user interaction, resizing this drawer will be immediate.
                TP.elementAddClass(southDrawer, 'no_transition');
            },
            true);

        this.showAllHUDDrawers();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('hideAllHUDDrawers',
function() {

    /**
     * @name hideAllHUDDrawers
     * @returns {TP.sherpa.hud} The receiver.
     * @abstract
     * @todo
     */

    var win,
        hudDrawers;

    win = this.getNativeWindow();
    hudDrawers = TP.wrap(TP.byCSS('.framing', win));

    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setAttrHidden(true);
        });

    TP.elementAddClass(TP.byId('center', win), 'fullscreen');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('showAllHUDDrawers',
function() {

    /**
     * @name showAllHUDDrawers
     * @returns {TP.sherpa.hud} The receiver.
     * @abstract
     * @todo
     */

    var win,
        hudDrawers;

    win = this.getNativeWindow();
    hudDrawers = TP.wrap(TP.byCSS('.framing', win));

    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setAttrHidden(false);
        });

    TP.elementRemoveClass(TP.byId('center', win), 'fullscreen');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('haloCanBlur',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('haloCanFocus',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:huddrawer');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
