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

TP.sherpa.Element.defineSubtype('sherpa:hud');

TP.sherpa.hud.addTraits(TP.core.TemplatedNode);

TP.sherpa.hud.Type.resolveTraits(
        TP.ac('tagCompile'),
        TP.core.TemplatedNode);

TP.sherpa.hud.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

TP.sherpa.hud.Inst.resolveTraits(
        TP.ac('haloCanBlur', 'haloCanFocus'),
        TP.sherpa.hud);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var toolbarElem;

    //  Set up the console toolbar
    toolbarElem = TP.wrap(TP.byId('SherpaConsoleOutputToolbar',
                                    this.getNativeWindow()));
    this.observe(toolbarElem,
                    'TP.sig.DOMClick',
                    function(aSignal) {
                        this.toggleOutputMode(
                            TP.elementGetAttribute(
                                aSignal.getTarget().parentNode, 'mode'));
                    }.bind(this));

    toolbarElem.toggle('hidden');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var drawerElement,

        toolbarElem,

        drawerFinishedFunc;

    if (TP.bc(this.getAttribute('hidden')) === beHidden) {
        return this;
    }

    drawerElement = TP.byId('south', this.getNativeWindow());

    toolbarElem = TP.wrap(TP.byId('SherpaConsoleOutputToolbar',
                                    this.getNativeWindow()));

    if (TP.isTrue(beHidden)) {

        //  We remove our 'south's 'no_transition' class so that it no longer
        //  'immediately snaps' like it needs to do during user interaction.
        TP.elementRemoveClass(drawerElement, 'no_transition');

        TP.elementGetStyleObj(drawerElement).height = '';

        toolbarElem.toggle('hidden');

        this.hideAllHUDDrawers();

        this.getNativeWindow().focus();
    } else {

        (drawerFinishedFunc = function(aSignal) {
            drawerFinishedFunc.ignore(
                drawerElement, 'TP.sig.DOMTransitionEnd');

            //  We add our 'south's 'no_transition' class so that during
            //  user interaction, resizing this drawer will be immediate.
            TP.elementAddClass(drawerElement, 'no_transition');

            toolbarElem.toggle('hidden');

        }).observe(drawerElement, 'TP.sig.DOMTransitionEnd');

        this.showAllHUDDrawers();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('hideAllHUDDrawers',
function() {

    /**
     * @method hideAllHUDDrawers
     * @returns {TP.sherpa.hud} The receiver.
     * @abstract
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
     * @method showAllHUDDrawers
     * @returns {TP.sherpa.hud} The receiver.
     * @abstract
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
//  Finalization
//  ------------------------------------------------------------------------

TP.sherpa.hud.finalizeTraits();

//  ========================================================================
//  TP.sherpa.huddrawer
//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:huddrawer');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
