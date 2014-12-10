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

    var doc,
        triggerElement;

    doc = this.getNativeDocument();

    //  Create and overlay a small version of the TIBET image for access.
    triggerElement = TP.documentCreateElement(
                            doc, 'div', TP.w3.Xmlns.XHTML);

    TP.elementSetAttribute(triggerElement, 'id', 'triggerHUD');

    TP.nodeAppendChild(TP.documentGetBody(doc), triggerElement);

    /* eslint-disable no-wrap-func */
    (function(aSignal) {
            this.toggle('hidden');
    }).bind(this).observe(TP.wrap(triggerElement), 'TP.sig.DOMClick');
    /* eslint-enable no-wrap-func */

    //  If this flag was set to not show the IDE, then we have to sync our
    //  setting to it. Note that we use the lower-level '$isInState' call
    //  here to avoid triggering our 'setAttrHidden' call.
    if (!TP.sys.cfg('boot.show_ide')) {
        this.$isInState('pclass:hidden', true);
    }

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

    if (TP.bc(this.getAttribute('hidden')) === beHidden) {
        return this;
    }

    //TP.byOID('SherpaConsole', this.getNativeWindow()).setAttribute(
     //                                               'hidden', beHidden);

    if (TP.isTrue(beHidden)) {
        this.hideAllHUDDrawers();

        this.getNativeWindow().focus();
    } else {
        this.showAllHUDDrawers();

        //TP.byOID('SherpaConsole', this.getNativeWindow()).focusInput();
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
