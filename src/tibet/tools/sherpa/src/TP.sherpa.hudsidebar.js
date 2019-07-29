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
 * @type {TP.sherpa.hudsidebar}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('hudsidebar');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.sherpa.hudsidebar.isAbstract(true);

TP.sherpa.hudsidebar.addTraits(TP.dom.D3Tag);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Type.defineMethod('tagAttachDOM',
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

TP.sherpa.hudsidebar.Type.defineMethod('tagDetachDOM',
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

TP.sherpa.hudsidebar.Inst.defineAttribute('$lastContextMenuSignal');

TP.sherpa.hudsidebar.Inst.defineAttribute('listcontent',
    TP.cpc('> .content', TP.hc('shouldCollapse', true)));

TP.sherpa.hudsidebar.Inst.defineAttribute('listitems',
    TP.cpc('> .content > li:not(.spacer)', TP.hc('shouldCollapse', false)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.dom.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('getContentTagNameForContextMenu',
function(aSignal) {

    /**
     * @method getContentTagNameForContextMenu
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

TP.sherpa.hudsidebar.Inst.defineHandler('CanvasChanged',
function(aSignal) {

    /**
     * @method handleCanvasChanged
     * @summary Handles notifications of the canvas changing from the Sherpa
     *     object.
     * @param {TP.sig.CanvasChanged} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var halo,
        haloTarget;

    //  Grab the halo and make sure it's focused. If not, we just bail out here.
    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    if (!halo.isFocused()) {
        return this;
    }

    haloTarget = halo.get('currentTargetTPElem');

    this.focusOnTarget(haloTarget);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromSherpaHUD
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
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
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var sherpaInst;

    this.setValue(null);

    sherpaInst = TP.bySystemId('Sherpa');
    this.ignore(sherpaInst, 'CanvasChanged');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var haloTarget,

        sherpaInst;

    haloTarget = aSignal.at('haloTarget');

    this.focusOnTarget(haloTarget);

    sherpaInst = TP.bySystemId('Sherpa');
    this.observe(sherpaInst, 'CanvasChanged');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of menu selections over the current
     *     HUD sidebar panel.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
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

TP.sherpa.hudsidebar.Inst.defineHandler('ShowContextMenu',
function(aSignal) {

    /**
     * @method handleShowContextMenu
     * @summary Handles notifications of wanting to show the context menu.
     * @param {TP.sig.ShowContextMenu} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var triggerSignal,
        contentTagName;

    //  Grab the 'trigger signal' - this will be the DOM-level 'context menu'
    //  signal.
    triggerSignal = aSignal.at('trigger');

    //  Make sure to prevent default on that signal to avoid having the context
    //  menu pop up.
    triggerSignal.preventDefault();
    triggerSignal.stopPropagation();

    //  Grab the tag name for the content tag that we're going to shove into the
    //  menu. If that's not available, exit here.
    contentTagName = this.getContentTagNameForContextMenu(aSignal);
    if (TP.isEmpty(contentTagName)) {
        return this;
    }

    //  Capture the signal that triggered the context menu.
    this.set('$lastContextMenuSignal', aSignal);

    this.signal(
        'TogglePopup',
        TP.hc(
            'overlayID', 'SherpaContextMenuPopup',
            'overlayCSSClass', 'sherpahudcontextmenu',
            'contentID', 'SherpaHudContextMenu',
            'contentAttributes',
                TP.hc(
                    'tibet:ctrl', this.getLocalID(),
                    'contenttagname', contentTagName
                ),
            'hideOn', 'SelectMenuItem',
            'useTopLevelContentElem', true,
            'trigger', triggerSignal,
            'triggerTPDocument', this.getDocument(),
            'triggerPoint', TP.MOUSE,
            'sticky', true));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('ToggleScreen',
function(aSignal) {

    /**
     * @method handleToggleScreen
     * @summary Handles notifications of screen toggle signals.
     * @param {TP.sig.ToggleScreen} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
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

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    this.observe(TP.byId('SherpaHalo', this.getNativeDocument()),
                    TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    this.observe(TP.byId('SherpaHUD', this.getNativeDocument()),
                    'PclassClosedChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    this.ignore(TP.byId('SherpaHalo', this.getNativeDocument()),
                TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('buildNewContent',
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

TP.sherpa.hudsidebar.Inst.defineMethod('getRootUpdateSelection',
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

TP.sherpa.hudsidebar.Inst.defineMethod('getSelectionContainer',
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

TP.sherpa.hudsidebar.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var world,
        currentScreenTPWin;

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();

    if (shouldObserve) {
        this.observe(world, 'ToggleScreen');
        this.observe(currentScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    } else {
        this.ignore(world, 'ToggleScreen');
        this.ignore(currentScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('updateExistingContent',
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
