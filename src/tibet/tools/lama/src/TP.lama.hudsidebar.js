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
 * @type {TP.lama.hudsidebar}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('hudsidebar');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.lama.hudsidebar.isAbstract(true);

TP.lama.hudsidebar.addTraitTypes(TP.dom.D3Tag);

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

TP.lama.hudsidebar.defineAttribute('$lastContextMenuTag');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Type.defineMethod('tagAttachDOM',
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

TP.lama.hudsidebar.Type.defineMethod('tagDetachDOM',
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

TP.lama.hudsidebar.Inst.defineAttribute('$lastContextMenuSignal');

TP.lama.hudsidebar.Inst.defineAttribute('listcontent',
    TP.cpc('> .content', TP.hc('shouldCollapse', true)));

TP.lama.hudsidebar.Inst.defineAttribute('listitems',
    TP.cpc('> .content > li:not(.spacer)', TP.hc('shouldCollapse', false)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.dom.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('getContentTagForContextMenu',
function(aSignal) {

    /**
     * @method getContentTagForContextMenu
     * @summary Returns the tag name of the content to use in a context menu.
     *     Note that this should return the plain (possibly namespaced) name
     *     with no markup bracketing, etc.
     * @param {TP.sig.ShowContextMenu} aSignal The TIBET signal which triggered
     *     the context menu to show and menu content to be required.
     * @returns {String} The name of the tag to use as content for the context
     *     menu.
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('CanvasChanged',
function(aSignal) {

    /**
     * @method handleCanvasChanged
     * @summary Handles notifications of the canvas changing from the Lama
     *     object.
     * @param {TP.sig.CanvasChanged} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    var halo,
        haloTarget;

    //  Grab the halo and make sure it's focused. If not, we just bail out here.
    halo = TP.byId('LamaHalo', this.getNativeDocument());
    if (!halo.isFocused()) {
        return this;
    }

    haloTarget = halo.get('currentTargetTPElem');

    this.focusOnTarget(haloTarget);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromLamaHUD
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    var hudIsClosed;

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    if (hudIsClosed) {
        this.toggleObservations(false);
    } else {
        this.toggleObservations(true);
    }

    return this;
}, {
    origin: 'LamaHUD'
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    var lamaInst;

    this.setValue(null);

    lamaInst = TP.bySystemId('Lama');
    this.ignore(lamaInst, 'CanvasChanged');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    var haloTarget,

        lamaInst;

    haloTarget = aSignal.at('haloTarget');

    this.focusOnTarget(haloTarget);

    lamaInst = TP.bySystemId('Lama');
    this.observe(lamaInst, 'CanvasChanged');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of menu selections over the current
     *     HUD sidebar panel.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    var cmdVal;

    //  See if the DOM target has a 'data-cmd' attribute.
    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    //  If there was a 'data-cmd' attribute, see if it contained the name of an
    //  invocable method.
    if (TP.canInvoke(this, cmdVal)) {
        this[cmdVal](aSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('ShowContextMenu',
function(aSignal) {

    /**
     * @method handleShowContextMenu
     * @summary Handles notifications of wanting to show the context menu.
     * @param {TP.sig.ShowContextMenu} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    var triggerSignal,

        contentTag,

        lastContentTag,
        forceRefresh;

    //  Grab the 'trigger signal' - this will be the DOM-level 'context menu'
    //  signal.
    triggerSignal = aSignal.at('trigger');

    //  Make sure to prevent default on that signal to avoid having the context
    //  menu pop up.
    triggerSignal.preventDefault();
    triggerSignal.stopPropagation();

    //  Grab the tag name for the content tag that we're going to shove into the
    //  menu. If that's not available, exit here.
    contentTag = this.getContentTagForContextMenu(aSignal);
    if (TP.isEmpty(contentTag)) {
        return this;
    }

    lastContentTag = TP.lama.hudsidebar.get('$lastContextMenuTag');
    if (TP.notEmpty(lastContentTag)) {
        forceRefresh = lastContentTag !== contentTag;
    }
    TP.lama.hudsidebar.set('$lastContextMenuTag', contentTag);

    //  Capture the signal that triggered the context menu.
    this.set('$lastContextMenuSignal', aSignal);

    this.signal(
        'TogglePopup',
        TP.hc(
            'overlayID', 'LamaContextMenuPopup',
            'overlayAttrs', TP.hc('class', 'lamahudcontextmenu'),
            'contentID', 'LamaHudContextMenu',
            'contentAttributes',
                TP.hc(
                    'tibet:ctrl', this.getLocalID(),
                    'contenttag', contentTag
                ),
            'hideOn', 'SelectMenuItem',
            'useTopLevelContentElem', true,
            'trigger', triggerSignal,
            'triggerTPDocument', this.getDocument(),
            'triggerPoint', TP.MOUSE,
            'sticky', true,
            'forceRefresh', forceRefresh));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineHandler('ScreenWillToggle',
function(aSignal) {

    /**
     * @method handleScreenWillToggle
     * @summary Handles notifications of screen will toggle signals.
     * @param {TP.sig.ScreenWillToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
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

TP.lama.hudsidebar.Inst.defineHandler('ScreenDidToggle',
function(aSignal) {

    /**
     * @method handleScreenDidToggle
     * @summary Handles notifications of screen did toggle signals.
     * @param {TP.sig.ScreenDidToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudsidebar} The receiver.
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

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    this.observe(TP.byId('LamaHalo', this.getNativeDocument()),
                    TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    this.observe(TP.byId('LamaHUD', this.getNativeDocument()),
                    'PclassClosedChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    this.ignore(TP.byId('LamaHalo', this.getNativeDocument()),
                TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.extern.d3.selection} The supplied enter selection or a new
     *     selection containing any new content that was added.
     */

    var newContent;

    newContent = enterSelection.append('li');
    newContent.attr(
            'pclass:selected',
            function(d) {
                if (TP.isTrue(d[2])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'dataindex',
            function(d, i) {
                return i;
            }).text(
            function(d) {
                return d[1];
            }).classed('item', true);

    return newContent;
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('getRootUpdateSelection',
function(containerSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @param {TP.extern.d3.selection} containerSelection The selection made by
     *     having d3.js select() the receiver's 'selection container'.
     * @returns {TP.extern.d3.Selection} The receiver.
     */

    return containerSelection.selectAll('li');
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element|null} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    var content;

    content = this.get('listcontent');
    if (TP.notValid(content)) {
        return null;
    }

    return TP.unwrap(content);
});

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.hudsidebar} The receiver.
     */

    var world,
        currentScreenTPWin;

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

//  ------------------------------------------------------------------------

TP.lama.hudsidebar.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    updateSelection.attr(
            'pclass:selected',
            function(d) {
                if (TP.isTrue(d[2])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'dataindex',
            function(d, i) {
                return i;
            }).text(
            function(d) {
                return d[1];
            }).classed('item', true);

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
