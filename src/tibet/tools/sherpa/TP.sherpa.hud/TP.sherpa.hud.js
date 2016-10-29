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
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('hud');

TP.sherpa.hud.addTraits(TP.core.TemplatedNode);

TP.sherpa.hud.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.sherpa.hud.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

TP.sherpa.hud.Inst.resolveTraits(
        TP.ac('haloCanBlur', 'haloCanFocus'),
        TP.sherpa.hud);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('isVisible',
function() {

    return !TP.bc(this.getAttribute('hidden'));
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary
     * @returns {TP.sherpa.hud} The receiver.
     */

    var wasHidden,

        drawerElement;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        return this;
    }

    drawerElement = TP.byId('south', this.getNativeWindow(), false);

    if (TP.isTrue(beHidden)) {

        TP.elementGetStyleObj(drawerElement).height = '';

        this.hideAllHUDDrawers();

        this.getNativeWindow().focus();
    } else {

        this.showAllHUDDrawers();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('hideAllHUDDrawers',
function() {

    /**
     * @method hideAllHUDDrawers
     * @summary
     * @returns {TP.sherpa.hud} The receiver.
     */

    var win,

        hudDrawers,

        centerElem,
        backgroundElem;

    win = this.getNativeWindow();
    hudDrawers = TP.wrap(TP.byCSSPath('.framing', win));

    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setAttribute('hidden', true);
        });

    centerElem = TP.byId('center', win, false);

    TP.elementAddClass(centerElem, 'fullscreen');

    //  Remove classes from the background div that cause other components (like
    //  the console output) to resize when drawers are open fully.
    backgroundElem = TP.byId('background', win, false);

    //  Stash the current classes for the 'visible' state for the background
    //  element on a custom attribute.
    TP.elementSetAttribute(backgroundElem,
                            'tibet:visible-classes',
                            TP.elementGetAttribute(backgroundElem, 'class', true),
                            true);

    //  NB: This should match the original setting of 'class' for the background
    //  element.
    TP.elementSetAttribute(backgroundElem, 'class', 'noselect', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('showAllHUDDrawers',
function() {

    /**
     * @method showAllHUDDrawers
     * @summary
     * @returns {TP.sherpa.hud} The receiver.
     */

    var win,

        hudDrawers,

        centerElem,
        backgroundElem;

    win = this.getNativeWindow();
    hudDrawers = TP.wrap(TP.byCSSPath('.framing', win));

    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setAttribute('hidden', false);
        });

    centerElem = TP.byId('center', win, false);

    TP.elementRemoveClass(centerElem, 'fullscreen');

    //  Remove classes from the background div that cause other components (like
    //  the console output) to resize when drawers are open fully.
    backgroundElem = TP.byId('background', win, false);

    //  Restore the current classes for the 'visible' state for the background
    //  element from a custom attribute to the 'class' attribute and remove the
    //  custom attribute.
    TP.elementSetAttribute(
        backgroundElem,
        'class',
        TP.elementGetAttribute(backgroundElem, 'tibet:visible-classes', true),
        true);
    TP.elementRemoveAttribute(backgroundElem, 'tibet:visible-classes', true);

    return this;
});

//  ========================================================================
//  TP.sherpa.huddrawer
//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:huddrawer');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
