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
 * @type {TP.lama.hud}
 */

//  ------------------------------------------------------------------------

TP.lama.Element.defineSubtype('hud');

TP.lama.hud.addTraitTypes(TP.dom.TemplatedNode);

TP.lama.hud.Type.resolveTrait('tagExpand', TP.dom.TemplatedNode);

TP.lama.hud.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

TP.lama.hud.Inst.resolveTraits(
        TP.ac('haloCanBlur', 'haloCanFocus'),
        TP.lama.hud);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineAttribute('initialBackgroundClassNames');
TP.lama.hud.Inst.defineAttribute('currentBackgroundClassNames');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineMethod('isVisible',
function(partial, direction, wantsTransformed) {

    /**
     * @method isVisible
     * @summary Returns whether or not the receiver is *really* visible to the
           user, no matter what its CSS setting is.
     * @description In addition to the standard CSS properties of 'display' and
           'visibility', this call also takes into account scrolling and any
           CSS transformation that has been applied to the element.
     * @param {Boolean} [partial=false] Whether or not the element can be
     *     partially visible or has to be completely visible. The default is
     *     false (i.e. it should be completely visible).
     * @param {String} [direction] The direction to test visibility in. If
     *     specified, this should be either TP.HORIZONTAL or TP.VERTICAL. If
     *     this is not specified, then both directions will be tested.
     * @param {Boolean} [wantsTransformed=false] An optional parameter that
     *     determines whether to use 'transformed' values if the element has
     *     been transformed with a CSS transformation. The default is false.
     * @returns {Boolean} Whether or not anElement is visible.
     */

    return !TP.bc(this.getAttribute('hidden'));
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineHandler('ScreenWillToggle',
function(aSignal) {

    /**
     * @method handleScreenWillToggle
     * @summary Handles notifications of screen will toggle signals.
     * @param {TP.sig.ScreenWillToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hud} The receiver.
     */

    var world,

        oldScreenTPWin;

    world = TP.byId('LamaWorld', TP.sys.getUIRoot());

    //  Grab the old screen TP.core.Window and ignore
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    oldScreenTPWin = world.get('selectedScreen').getContentWindow();
    this.ignore(oldScreenTPWin, TP.ac('DocumentLoaded', 'DocumentUnloaded'));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineHandler('ScreenDidToggle',
function(aSignal) {

    /**
     * @method handleScreenDidToggle
     * @summary Handles notifications of screen did toggle signals.
     * @param {TP.sig.ScreenDidToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hud} The receiver.
     */

    var world,

        newScreen,
        newScreenTPWin;

    world = TP.byId('LamaWorld', TP.sys.getUIRoot());

    //  Grab the new screen TP.core.Window and observe
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    newScreen = world.get('screens').at(aSignal.at('screenIndex'));

    if (TP.isValid(newScreen)) {
        newScreenTPWin = newScreen.getContentWindow();
        this.observe(newScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    }

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineMethod('hideAllHUDDrawers',
function() {

    /**
     * @method hideAllHUDDrawers
     * @summary Hides all of the HUD drawers.
     * @returns {TP.lama.hud} The receiver.
     */

    var win,

        hudDrawers,

        centerElem,
        backgroundElem;

    win = this.getNativeWindow();

    //  Grab all of the drawers by querying for elements with the '.framing'
    //  CSS class.
    hudDrawers = TP.byCSSPath('.framing', win);

    //  Set them all to be hidden.
    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setAttribute('hidden', true);
        });

    //  Set the '#center' element to be fullscreen by adding the '.fullscreen'
    //  CSS class.
    centerElem = TP.byId('center', win, false);
    TP.elementAddClass(centerElem, 'fullscreen');

    //  Capture the current classes for the 'visible' state for the background
    //  element to the set of classes that are present on the background
    //  element. We will restore these when the HUD is shown.

    backgroundElem = TP.byId('background', win, false);

    this.set('currentBackgroundClassNames',
                TP.elementGetAttribute(backgroundElem, 'class', true));

    //  Set the background element's 'class' attribute to be whatever was the
    //  initial set of background class names.
    TP.elementSetAttribute(
        backgroundElem,
        'class',
        this.get('initialBackgroundClassNames'),
        true);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hud} The receiver.
     */

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hud} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineMethod('setAttrClosed',
function(beClosed) {

    /**
     * @method setAttrClosed
     * @summary Sets the 'closed' attribute of the receiver. This method causes
     *     the HUD to show or hide itself.
     * @param {Boolean} beClosed Whether or not the console should be closed.
     * @returns {Boolean} Whether the receiver's state is closed.
     */

    var wasClosed,

        doc,
        hudStyleElement;

    wasClosed = TP.bc(this.getAttribute('closed'));

    if (wasClosed === beClosed) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return this;
    }

    //  Grab the current UI canvas document.
    doc = TP.sys.uidoc(true);

    if (beClosed) {

        //  Hide all of the HUD drawers.
        this.hideAllHUDDrawers();

        //  Grab the styles that the HUD injects into the UI canvas and disable
        //  that style element.
        hudStyleElement = TP.byId('hud_injected_generated', doc, false);
        if (TP.isElement(hudStyleElement)) {
            hudStyleElement.disabled = true;
        }

        //  Remove the CSS class from the UI canvas's document element that
        //  qualifies elements in the injected style element
        TP.elementRemoveClass(doc.documentElement, 'lama-hud');

        this.toggleObservations(false);

        this.getNativeWindow().focus();
    } else {

        //  Grab the styles that the HUD injects into the UI canvas and enable
        //  that style element.
        hudStyleElement = TP.byId('hud_injected_generated', doc, false);
        if (TP.isElement(hudStyleElement)) {
            hudStyleElement.disabled = false;
        }

        //  Add the CSS class to the UI canvas's document element that qualifies
        //  elements in the injected style element
        TP.elementAddClass(doc.documentElement, 'lama-hud');

        this.toggleObservations(true);

        //  Show all of the HUD drawers.
        this.showAllHUDDrawers();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineMethod('showAllHUDDrawers',
function() {

    /**
     * @method showAllHUDDrawers
     * @summary Shows all of the HUD drawers.
     * @returns {TP.lama.hud} The receiver.
     */

    var win,

        hudDrawers,

        centerElem,
        backgroundElem,

        currentBackgroundClassNames;

    win = this.getNativeWindow();

    //  Grab all of the drawers by querying for elements with the '.framing'
    //  CSS class.
    hudDrawers = TP.byCSSPath('.framing', win);

    //  Set them all to be shown.
    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setAttribute('hidden', false);
        });

    //  Set the '#center' element to not be fullscreen by removing the
    //  '.fullscreen' CSS class.
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
        //  Set the background element's 'class' attribute to be whatever is the
        //  current set of background class names.
        TP.elementSetAttribute(
            backgroundElem,
            'class',
            currentBackgroundClassNames,
            true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.lama.hud} The receiver.
     */

    var backgroundElem;

    backgroundElem = TP.byId('background', this.getNativeWindow(), false);

    //  Capture the initial set of background class names for use later in
    //  toggling.
    this.set('initialBackgroundClassNames',
                TP.elementGetAttribute(backgroundElem, 'class', true));

    this.toggleObservations(true);

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineMethod('setupInjectedStyleSheet',
async function() {

    /**
     * @method setupInjectedStyleSheet
     * @summary Set up the stylesheet that will be 'injected' into the UI canvas
     *     so that the HUD can affect visual changes in the UI canvas.
     * @returns {TP.lama.hud} The receiver.
     */

    var doc,
        styleElement;

    doc = TP.sys.uidoc(true);

    styleElement = TP.byId('hud_injected_generated', doc, false);

    if (!TP.isElement(styleElement)) {
        styleElement = await TP.documentAddCSSElement(
            doc,
            TP.uc('~TP.lama.hud/TP.lama.hud_injected.css').getLocation(),
            true,
            false);

        TP.elementSetAttribute(styleElement, 'id', 'hud_injected_generated');

        //  Mark the sheet as 'TIBET_PRIVATE' so that it's style rules are not
        //  considered when the element's style rules are computed.
        styleElement[TP.TIBET_PRIVATE] = true;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hud.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.hud} The receiver.
     */

    var world,
        currentScreenTPWin;

    //  Grab the world's current screen TP.core.Window and observe it for when
    //  its document unloads & loads so that we can manage our click & context
    //  menu observations.
    world = TP.byId('LamaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();

    if (shouldObserve) {
        this.observe(world, TP.ac('ScreenWillToggle', 'ScreenDidToggle'));

        this.observe(currentScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    } else {
        this.ignore(world, TP.ac('ScreenWillToggle', 'ScreenDidToggle'));

        this.ignore(currentScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    }

    return this;
});

//  ========================================================================
//  TP.lama.huddrawer
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('lama:huddrawer');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
