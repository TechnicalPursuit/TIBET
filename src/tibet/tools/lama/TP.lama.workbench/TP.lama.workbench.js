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
 * @type {TP.lama.workbench}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('workbench');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineAttribute('allStatusInfo');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.lama.workbench} The receiver.
     */

    var win,

        lamaInspectorTPElem,
        arrows,

        breadcrumbTPElem;

    win = this.getNativeWindow();

    //  Set up the inspector scroll buttons
    lamaInspectorTPElem = TP.byId('LamaInspector', win);

    arrows = TP.byCSSPath('lama|scrollbutton', win, false, true);
    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', lamaInspectorTPElem);
            });

    //  Set up the breadcrumb bar
    breadcrumbTPElem = TP.byId('LamaBreadcrumb', this.getNativeWindow());
    breadcrumbTPElem.setValue(TP.ac());

    //  Update the navigation and toolbar buttons to match the initial Lama
    //  Inspector values, etc.
    this.updateNavigationButtons();
    this.updateToolbarButtons();

    this.observe(TP.byId('LamaHUD', this.getNativeWindow()),
                    'PclassClosedChange');

    this.toggleObservations(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineMethod('updateNavigationButtons',
function() {

    /**
     * @method updateNavigationButtons
     * @summary Updates the workbench's navigation buttons.
     * @returns {TP.lama.workbench} The receiver.
     */

    var backButton,
        forwardButton,

        lamaInspectorTPElem,

        pathStack,
        pathStackIndex;

    //  Grab the 'back' and 'forward' buttons.
    backButton = TP.byId('navigateback', this.getNativeNode(), false);
    forwardButton = TP.byId('navigateforward', this.getNativeNode(), false);

    lamaInspectorTPElem = TP.byId('LamaInspector', this.getNativeWindow());

    //  Grab the current 'path stack' and 'path stack index' from the inspector.
    pathStack = lamaInspectorTPElem.get('pathStack');
    pathStackIndex = lamaInspectorTPElem.get('pathStackIndex');

    //  If the path stack index is at 0 or less, then disable the 'back' button.
    //  Otherwise, enable it.
    if (pathStackIndex <= 0) {
        TP.elementRemoveClass(backButton, 'more');
        TP.elementSetAttribute(backButton, 'disabled', true, true);
    } else {
        TP.elementAddClass(backButton, 'more');
        TP.elementRemoveAttribute(backButton, 'disabled', true);
    }

    //  If the path stack index is the last position in the pathStack, then
    //  disable the 'forward' button. Otherwise, enable it.
    if (pathStackIndex === pathStack.getSize() - 1) {
        TP.elementRemoveClass(forwardButton, 'more');
        TP.elementSetAttribute(forwardButton, 'disabled', true, true);
    } else {
        TP.elementAddClass(forwardButton, 'more');
        TP.elementRemoveAttribute(forwardButton, 'disabled', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineMethod('updateStatusbar',
function(statusInfo) {

    /**
     * @method updateStatusbar
     * @summary Updates the workbench's status bar.
     * @returns {TP.lama.workbench} The receiver.
     */

    var lamaStatusbar,

        allStatusInfo,

        str;

    lamaStatusbar = TP.byId('LamaStatusbar', this.getNativeWindow());

    allStatusInfo = this.get('allStatusInfo');
    if (TP.notValid(allStatusInfo)) {
        allStatusInfo = TP.hc();
        this.set('allStatusInfo', allStatusInfo);
    }

    str = '';

    if (statusInfo.hasKey('insertionPosition')) {
        allStatusInfo.atPut('insertionPosition',
                            statusInfo.at('insertionPosition'));
    }

    if (statusInfo.hasKey('mousePoint')) {
        allStatusInfo.atPut('mousePoint',
                            statusInfo.at('mousePoint'));
    } else {
        allStatusInfo.atPut('mousePoint', TP.pc(0, 0));
    }

    if (statusInfo.hasKey('isCloning')) {
        allStatusInfo.atPut('isCloning',
                            statusInfo.at('isCloning'));
    } else {
        allStatusInfo.atPut('isCloning', false);
    }

    str = 'Insertion position: ' +
            allStatusInfo.at('insertionPosition') +
            '    Mouse position: ' +
            allStatusInfo.at('mousePoint').asString() +
            '    Cloning: ' +
            allStatusInfo.at('isCloning').asString();

    lamaStatusbar.setContent(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineMethod('updateToolbarButtons',
function() {

    /**
     * @method updateToolbarButtons
     * @summary Updates the workbench's toolbar buttons.
     * @returns {TP.lama.workbench} The receiver.
     */

    var workbenchToggleButtons,

        lamaHaloTPElem,
        isFocused,

        lamaOutliner;

    //  Grab the group of toggle buttons uses for toggling the halo and the
    //  outliner.
    workbenchToggleButtons = TP.byId('workbenchToggleButtons',
                                        this.getNativeWindow());

    //  If the halo is focused, then turn the button on - otherwise, turn it
    //  off.
    lamaHaloTPElem = TP.byId('LamaHalo', this.getNativeWindow());
    isFocused = lamaHaloTPElem.isFocused();
    if (isFocused) {
        workbenchToggleButtons.addSelection('halo', 'value');
    } else {
        workbenchToggleButtons.removeSelection('halo', 'value');
    }

    //  If the outliner is active (i.e. showing outlines), then turn the button
    //  on - otherwise, turn it off.
    lamaOutliner = TP.bySystemId('LamaOutliner');
    if (!lamaOutliner.get('isActive')) {
        workbenchToggleButtons.removeSelection('outline', 'value');
    } else {
        workbenchToggleButtons.addSelection('outline', 'value');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.workbench} The receiver.
     */

    var win,

        lamaInspectorTPElem,

        lamaHaloTPElem,

        lamaOutliner;

    win = this.getNativeWindow();

    //  Set up the inspector scroll buttons
    lamaInspectorTPElem = TP.byId('LamaInspector', win);

    //  Halo observations
    lamaHaloTPElem = TP.byId('LamaHalo', win);

    //  Outliner observations
    lamaOutliner = TP.bySystemId('LamaOutliner');

    if (shouldObserve) {
        //  Inspector observations
        this.observe(lamaInspectorTPElem, 'InspectorDidFocus');
        this.observe(lamaHaloTPElem,
                        TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

        this.observe(lamaOutliner,
                        TP.ac('TP.sig.BeginOutlineMode',
                                'TP.sig.EndOutlineMode'));

        this.observe(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                    'TP.sig.DOMDNDCompleted'));

        //  Lama observations
        this.observe(TP.bySystemId('Lama'), 'LamaReady');
    } else {
        //  Inspector observations
        this.ignore(lamaInspectorTPElem, 'InspectorDidFocus');
        this.ignore(lamaHaloTPElem,
                        TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

        this.ignore(lamaOutliner,
                        TP.ac('TP.sig.BeginOutlineMode',
                                'TP.sig.EndOutlineMode'));

        this.ignore(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                    'TP.sig.DOMDNDCompleted'));

        //  Lama observations
        this.ignore(TP.bySystemId('Lama'), 'LamaReady');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Handlers
//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('AddBookmark',
function(aSignal) {

    /**
     * @method handleAddBookmark
     * @summary Handles notifications of when the user wants to add a bookmarked
     *     inspector location to their list of bookmarked locations.
     * @param {TP.sig.AddBookmark} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.workbench} The receiver.
     */

    var cmdVal;

    //  Grab the current history entry as a path.
    cmdVal = TP.byId('LamaInspector', this.getNativeWindow()).
                getCurrentHistoryEntryAsPath();

    //  Build the command and execute it.
    cmdVal = ':bookmark \'' + cmdVal + '\'';
    TP.bySystemId('LamaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromLamaHUD
     * @summary Handles when the HUD's 'closed' state changes.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.workbench} The receiver.
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

//  ----------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('DOMDNDInitiate',
function(aSignal) {

    /**
     * @method handleDOMDNDInitiate
     * @summary Handles when the drag and drop system initiates a dragging
     *     session.
     * @param {TP.sig.DOMDNDInitiate} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    TP.byId('LamaStatusbar', this.getNativeWindow()).setAttribute(
                                                        'hidden', false);


    this.observe(TP.core.Mouse, 'TP.sig.DOMDragMove');

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('DOMDNDCompleted',
function(aSignal) {

    /**
     * @method handleDOMDNDCompleted
     * @summary Handles when the drag and drop system completes a dragging
     *     session.
     * @param {TP.sig.DOMDNDCompleted} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    TP.byId('LamaStatusbar', this.getNativeWindow()).setAttribute(
                                                        'hidden', true);

    this.ignore(TP.core.Mouse, 'TP.sig.DOMDragMove');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('InspectorDidFocus',
function(aSignal) {

    /**
     * @method handleInspectorDidFocus
     * @summary Handles notifications of when the Lama inspector has focused
     *     on a particular target.
     * @param {TP.sig.InspectorDidFocus} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    var origin,
        sigOriginTPElem,

        inspectorSelectedItemLabels,
        breadcrumbTPElem;

    //  Make sure that the navigation buttons are updated to reflect the new
    //  location.
    this.updateNavigationButtons();

    //  The origin should be the inspector
    origin = aSignal.getOrigin();
    if (TP.isString(origin)) {
        sigOriginTPElem = TP.bySystemId(origin);
    } else {
        sigOriginTPElem = TP.wrap(origin);
    }

    //  Grab the selected *labels* from the inspector.
    inspectorSelectedItemLabels = sigOriginTPElem.get('selectedLabels');

    //  Grab the breadcrumb bar
    breadcrumbTPElem = TP.byId('LamaBreadcrumb', this.getNativeWindow());

    //  Set the value of the breadcrumb bar, which will cause the breadcrumb to
    //  redraw.
    breadcrumbTPElem.setValue(inspectorSelectedItemLabels);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlurFromLamaHalo
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    //  The halo changed it's focus - we need to update our toolbar buttons.
    this.updateToolbarButtons();

    return this;
}, {
    origin: 'LamaHalo'
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocusFromLamaHalo
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    //  The halo changed it's focus - we need to update our toolbar buttons.
    this.updateToolbarButtons();

    return this;
}, {
    origin: 'LamaHalo'
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('BeginOutlineMode',
function(aSignal) {

    /**
     * @method handleBeginOutlineModeFromLamaOutliner
     * @summary Handles notifications of when the Lama outliner has activated
     *     its 'outline mode'.
     * @param {TP.sig.BeginOutlineMode} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    //  The outliner turned on outline mode - we need to update our toolbar
    //  buttons.
    this.updateToolbarButtons();

    return this;
}, {
    origin: 'LamaOutliner'
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('EndOutlineMode',
function(aSignal) {

    /**
     * @method handleEndOutlineModeFromLamaOutliner
     * @summary Handles notifications of when the Lama outliner has
     *     deactivated its 'outline mode'.
     * @param {TP.sig.EndOutlineMode} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    //  The outliner turned off outline mode - we need to update our toolbar
    //  buttons.
    this.updateToolbarButtons();

    return this;
}, {
    origin: 'LamaOutliner'
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which
     *     triggered this handler.
     * @returns {TP.lama.workbench} The receiver.
     */

    (function() {
        var mousePoint,
            canvasOffsets;

        mousePoint = aSignal.getGlobalPoint();
        canvasOffsets = TP.windowComputeWindowOffsets(
                            TP.sys.getUIRoot(true), TP.sys.getUICanvas(true));

        mousePoint.setX(mousePoint.getX() - canvasOffsets.at('0'));
        mousePoint.setY(mousePoint.getY() - canvasOffsets.at('1'));

        this.updateStatusbar(TP.hc('mousePoint', mousePoint));
    }.bind(this).queueAfterNextRepaint(this.getNativeWindow()));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('NavigateBack',
function(aSignal) {

    /**
     * @method handleNavigateBack
     * @summary Handles notifications of when the user wants to navigate 'back'
     *     in the 'stack' of navigated locations.
     * @param {TP.sig.NavigateBack} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    this.signal('NavigateInspector',
                TP.hc('direction', TP.PREVIOUS, 'showBusy', true));

    //  Make sure that the navigation buttons are updated to reflect the new
    //  location.
    this.updateNavigationButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('NavigateForward',
function(aSignal) {

    /**
     * @method handleNavigateForward
     * @summary Handles notifications of when the user wants to navigate
     *     'forward' in the 'stack' of navigated locations.
     * @param {TP.sig.NavigateForward} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    this.signal('NavigateInspector',
                TP.hc('direction', TP.NEXT, 'showBusy', true));

    //  Make sure that the navigation buttons are updated to reflect the new
    //  location.
    this.updateNavigationButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('NavigateHome',
function(aSignal) {

    /**
     * @method handleNavigateHome
     * @summary Handles notifications of when the user wants to navigate 'home'
     *     to the inspector root bay.
     * @param {TP.sig.NavigateHome} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    this.signal('NavigateInspector', TP.hc('direction', TP.HOME));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('LamaReady',
function(aSignal) {

    /**
     * @method handleLamaReady
     * @summary Handles notification of when the Lama has completely opened to
     *     its initial state and is ready for interaction.
     * @param {TP.sig.LamaReady} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('ShowBookmarks',
function(aSignal) {

    /**
     * @method handleShowBookmarks
     * @summary Handles notifications of when the user wants to show the menu of
     *     saved bookmarks.
     * @param {TP.sig.ShowBookmarks} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    TP.byId('LamaBookmarkMenu', this.getNativeWindow()).activate();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('ToggleHalo',
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

TP.lama.workbench.Inst.defineHandler('ToggleOutlines',
function(aSignal) {

    /**
     * @method handleToggleOutlines
     * @summary Handles notifications of when the user wants to toggle the
     *     outliner's outline mode on and off.
     * @param {TP.sig.ToggleOutlines} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.workbench} The receiver.
     */

    this.signal('LamaOutlinerToggle', aSignal, TP.FIRE_ONE);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('TSHBuild',
function(aSignal) {

    /**
     * @method handleTSHBuild
     * @summary Handles notifications of when the receiver wants to build their
     *     project using the TSH.
     * @param {TP.sig.TSHBuild} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.workbench} The receiver.
     */

    var cmdVal;

    TP.confirm('Build Application Packages?').then(
        function(shouldBuild) {
            if (TP.notTrue(shouldBuild)) {
                TP.info('Build cancelled.');
                return;
            }

            //  Build the command and execute it.
            cmdVal = ':build';
            TP.bySystemId('LamaConsoleService').sendConsoleRequest(cmdVal);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('TSHDeploy',
function(aSignal) {

    /**
     * @method handleTSHDeploy
     * @summary Handles notifications of when the receiver wants to deploy their
     *     project using the TSH.
     * @param {TP.sig.TSHDeploy} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.workbench} The receiver.
     */

    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText', ':deploy --assist'
                ));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('TSHRefresh',
function(aSignal) {

    /**
     * @method handleTSHRefresh
     * @summary Handles notifications of when the receiver wants to refresh the
     *     current canvas using the TSH.
     * @param {TP.sig.TSHRefresh} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.workbench} The receiver.
     */

    var canvasWin,

        canvasLoc,
        canvasURI,

        virtualLoc,

        cmdVal;

    //  Grab the canvas window and it's location and make a URI from that.
    canvasWin = TP.sys.uiwin();

    canvasLoc = canvasWin.getLocation();
    canvasURI = TP.uc(canvasLoc);

    virtualLoc = canvasURI.getVirtualLocation();

    cmdVal = virtualLoc + ' -refresh .> TP.sys.uiwin()';

    TP.bySystemId('LamaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.workbench.Inst.defineHandler('TSHTest',
function(aSignal) {

    /**
     * @method handleTSHTest
     * @summary Handles notifications of when the receiver wants to test their
     *     project using the TSH.
     * @param {TP.sig.TSHTest} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.workbench} The receiver.
     */

    TP.confirm('Run Application Test Suites?').then(
        function(shouldTest) {
            var cmdVal,
                shell;

            if (TP.notTrue(shouldTest)) {
                TP.info('Test run cancelled.');
                return;
            }

            //  Build the command and execute it.
            cmdVal = ':test';

            shell = TP.bySystemId('TSH');
            if (TP.notValid(shell)) {
                TP.info('No valid shell. Test run cancelled.');
                return;
            }

            TP.bySystemId('LamaConsoleService').sendConsoleRequest(cmdVal);
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
