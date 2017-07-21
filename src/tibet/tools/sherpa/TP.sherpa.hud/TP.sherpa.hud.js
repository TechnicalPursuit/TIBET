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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineAttribute('initialBackgroundClassNames');
TP.sherpa.hud.Inst.defineAttribute('currentBackgroundClassNames');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('isVisible',
function() {

    return !TP.bc(this.getAttribute('hidden'));
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

    //  Capture the current classes for the 'visible' state for the background
    //  element to the set of classes that are present on the background
    //  element. We will restore these when the HUD is shown.

    backgroundElem = TP.byId('background', win, false);

    this.set('currentBackgroundClassNames',
                TP.elementGetAttribute(backgroundElem, 'class', true));

    TP.elementSetAttribute(
        backgroundElem,
        'class',
        this.get('initialBackgroundClassNames'),
        true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hud} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hud} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setAttrClosed',
function(beClosed) {

    /**
     * @method setAttrClosed
     * @summary
     * @returns {TP.sherpa.hud} The receiver.
     */

    var wasClosed,

        drawerElement;

    wasClosed = TP.bc(this.getAttribute('closed'));

    if (wasClosed === beClosed) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return this;
    }

    drawerElement = TP.byId('south', this.getNativeWindow(), false);

    if (TP.isTrue(beClosed)) {

        TP.elementGetStyleObj(drawerElement).height = '';

        this.hideAllHUDDrawers();

        this.getNativeWindow().focus();
    } else {

        this.showAllHUDDrawers();
    }

    return this.callNextMethod();
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
        backgroundElem,

        currentBackgroundClassNames;

    win = this.getNativeWindow();
    hudDrawers = TP.wrap(TP.byCSSPath('.framing', win));

    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setAttribute('hidden', false);
        });

    centerElem = TP.byId('center', win, false);

    TP.elementRemoveClass(centerElem, 'fullscreen');

    //  Restore the current classes for the 'visible' state for the background
    //  element from either what was captured before we hid or the initial set
    //  of classes that was present on the background element when the HUD was
    //  initialized.

    backgroundElem = TP.byId('background', win, false);

    //  If there are no current background class names, then initialize them to
    //  the initial background class names
    currentBackgroundClassNames = this.get('currentBackgroundClassNames');
    if (TP.isEmpty(currentBackgroundClassNames)) {
        this.set('currentBackgroundClassNames',
                    this.get('initialBackgroundClassNames'));
    } else {
        TP.elementSetAttribute(
            backgroundElem,
            'class',
            currentBackgroundClassNames,
            true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary
     * @returns {TP.sherpa.hud} The receiver.
     */

    var backgroundElem,

        world,
        currentScreenTPWin;

    backgroundElem = TP.byId('background', this.getNativeWindow(), false);

    //  Capture the initial set of background class names for use later in
    //  toggling.
    this.set('initialBackgroundClassNames',
                TP.elementGetAttribute(backgroundElem, 'class', true));

    //  Grab the world's current screen TP.core.Window and observe it for when
    //  it's document unloads & loads so that we can manage our click & context
    //  menu observations.
    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    this.observe(world, 'ToggleScreen');

    currentScreenTPWin = world.get('selectedScreen').getContentWindow();
    this.observe(currentScreenTPWin,
                    TP.ac('DocumentLoaded', 'DocumentUnloaded'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineHandler('ToggleScreen',
function(aSignal) {

    /**
     * @method handleToggleScreen
     * @summary Handles notifications of screen toggle signals.
     * @param {TP.sig.ToggleScreen} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hud} The receiver.
     */

    var world,
        oldScreenTPWin,

        newScreen,
        newScreenTPWin;

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());

    //  Grab the old screen TP.core.Window and ignore
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    oldScreenTPWin = world.get('selectedScreen').getContentWindow();
    this.ignore(oldScreenTPWin, TP.ac('DocumentLoaded', 'DocumentUnloaded'));

    //  Grab the new screen TP.core.Window and observe
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    newScreen = world.get('screens').at(aSignal.at('screenIndex'));

    if (TP.isValid(newScreen)) {
        newScreenTPWin = newScreen.getContentWindow();
        this.observe(newScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    }

    return this;
});

//  ========================================================================
//  TP.sherpa.huddrawer
//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:huddrawer');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
