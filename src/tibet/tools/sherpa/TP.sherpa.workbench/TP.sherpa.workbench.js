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
 * @type {TP.sherpa.workbench}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('workbench');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineAttribute('allStatusInfo');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    var win,

        sherpaInspectorTPElem,
        arrows,

        breadcrumbTPElem,

        sherpaHaloTPElem,

        sherpaOutliner;

    win = this.getNativeWindow();

    //  Set up the inspector scroll buttons
    sherpaInspectorTPElem = TP.byId('SherpaInspector', win);

    arrows = TP.byCSSPath('sherpa|scrollbutton', win, false, true);
    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', sherpaInspectorTPElem);
            });

    //  Set up the breadcrumb bar
    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', this.getNativeWindow());
    breadcrumbTPElem.setValue(TP.ac());

    //  Update the navigation and toolbar buttons to match the initial Sherpa
    //  Inspector values, etc.
    this.updateNavigationButtons();
    this.updateToolbarButtons();

    //  Inspector observations
    this.observe(sherpaInspectorTPElem, 'InspectorDidFocus');

    //  Halo observations
    sherpaHaloTPElem = TP.byId('SherpaHalo', win);
    this.observe(sherpaHaloTPElem,
                    TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    //  Outliner observations
    sherpaOutliner = TP.bySystemId('SherpaOutliner');
    this.observe(sherpaOutliner,
                    TP.ac('TP.sig.BeginOutlineMode', 'TP.sig.EndOutlineMode'));

    this.observe(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                'TP.sig.DOMDNDCompleted'));

    //  Sherpa observations
    this.observe(TP.bySystemId('Sherpa'), 'SherpaReady');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineMethod('updateNavigationButtons',
function() {

    /**
     * @method updateNavigationButtons
     * @summary Updates the workbench's navigation buttons.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    var backButton,
        forwardButton,

        sherpaInspectorTPElem,

        pathStack,
        pathStackIndex;

    //  Grab the 'back' and 'forward' buttons.
    backButton = TP.byId('navigateback', this.getNativeNode(), false);
    forwardButton = TP.byId('navigateforward', this.getNativeNode(), false);

    sherpaInspectorTPElem = TP.byId('SherpaInspector', this.getNativeWindow());

    //  Grab the current 'path stack' and 'path stack index' from the inspector.
    pathStack = sherpaInspectorTPElem.get('pathStack');
    pathStackIndex = sherpaInspectorTPElem.get('pathStackIndex');

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

TP.sherpa.workbench.Inst.defineMethod('updateStatusbar',
function(statusInfo) {

    /**
     * @method updateStatusbar
     * @summary Updates the workbench's status bar.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    var sherpaStatusbar,

        allStatusInfo,

        str;

    sherpaStatusbar = TP.byId('SherpaStatusbar', this.getNativeWindow());

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

    sherpaStatusbar.setContent(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineMethod('updateToolbarButtons',
function() {

    /**
     * @method updateToolbarButtons
     * @summary Updates the workbench's toolbar buttons.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    var workbenchToggleButtons,

        sherpaHaloTPElem,
        isFocused,

        sherpaOutliner;

    //  Grab the group of toggle buttons uses for toggling the halo and the
    //  outliner.
    workbenchToggleButtons = TP.byId('workbenchToggleButtons',
                                        this.getNativeWindow());

    //  If the halo is focused, then turn the button on - otherwise, turn it
    //  off.
    sherpaHaloTPElem = TP.byId('SherpaHalo', this.getNativeWindow());
    isFocused = sherpaHaloTPElem.isFocused();
    if (isFocused) {
        workbenchToggleButtons.addSelection('halo', 'value');
    } else {
        workbenchToggleButtons.removeSelection('halo', 'value');
    }

    //  If the outliner is active (i.e. showing outlines), then turn the button
    //  on - otherwise, turn it off.
    sherpaOutliner = TP.bySystemId('SherpaOutliner');
    if (!sherpaOutliner.get('isActive')) {
        workbenchToggleButtons.removeSelection('outline', 'value');
    } else {
        workbenchToggleButtons.addSelection('outline', 'value');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Handlers
//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('AddBookmark',
function(aSignal) {

    /**
     * @method handleAddBookmark
     * @summary Handles notifications of when the user wants to add a bookmarked
     *     inspector location to their list of bookmarked locations.
     * @param {TP.sig.AddBookmark} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    var currentHistoryEntry,
        cmdVal;

    //  Grab the current history entry as computed by the Sherpa Inspector.
    currentHistoryEntry = TP.byId('SherpaInspector', this.getNativeWindow()).
                                                    get('currentHistoryEntry');

    if (TP.isEmpty(currentHistoryEntry)) {
        return this;
    }

    //  Escape any embedded slashes in each component
    currentHistoryEntry = currentHistoryEntry.collect(
                            function(anItem) {
                                return anItem.replace(/\//g, '\\/');
                            });

    //  Join them together with a slash
    cmdVal = currentHistoryEntry.join('/');

    //  Build the command and execute it.
    cmdVal = ':bookmark \'' + cmdVal + '\'';
    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('DOMDNDInitiate',
function(aSignal) {

    /**
     * @method handleDOMDNDInitiate
     * @summary Handles when the drag and drop system initiates a dragging
     *     session.
     * @param {TP.sig.DOMDNDInitiate} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    TP.byId('SherpaStatusbar', this.getNativeWindow()).setAttribute(
                                                        'hidden', false);


    this.observe(TP.core.Mouse, 'TP.sig.DOMDragMove');

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('DOMDNDCompleted',
function(aSignal) {

    /**
     * @method handleDOMDNDCompleted
     * @summary Handles when the drag and drop system completes a dragging
     *     session.
     * @param {TP.sig.DOMDNDCompleted} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    TP.byId('SherpaStatusbar', this.getNativeWindow()).setAttribute(
                                                        'hidden', true);

    this.ignore(TP.core.Mouse, 'TP.sig.DOMDragMove');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('InspectorDidFocus',
function(aSignal) {

    /**
     * @method handleInspectorDidFocus
     * @summary Handles notifications of when the Sherpa inspector has focused
     *     on a particular target.
     * @param {TP.sig.InspectorDidFocus} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.workbench} The receiver.
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
    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', this.getNativeWindow());

    //  Set the value of the breadcrumb bar, which will cause the breadcrumb to
    //  redraw.
    breadcrumbTPElem.setValue(inspectorSelectedItemLabels);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    //  The halo changed it's focus - we need to update our toolbar buttons.
    this.updateToolbarButtons();

    return this;
}, {
    origin: 'SherpaHalo'
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    //  The halo changed it's focus - we need to update our toolbar buttons.
    this.updateToolbarButtons();

    return this;
}, {
    origin: 'SherpaHalo'
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('BeginOutlineMode',
function(aSignal) {

    /**
     * @method handleBeginOutlineMode
     * @summary Handles notifications of when the Sherpa outliner has activated
     *     its 'outline mode'.
     * @param {TP.sig.BeginOutlineMode} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    //  The outliner turned on outline mode - we need to update our toolbar
    //  buttons.
    this.updateToolbarButtons();

    return this;
}, {
    origin: 'SherpaOutliner'
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('EndOutlineMode',
function(aSignal) {

    /**
     * @method handleEndOutlineMode
     * @summary Handles notifications of when the Sherpa outliner has
     *     deactivated its 'outline mode'.
     * @param {TP.sig.EndOutlineMode} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    //  The outliner turned off outline mode - we need to update our toolbar
    //  buttons.
    this.updateToolbarButtons();

    return this;
}, {
    origin: 'SherpaOutliner'
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which
     *     triggered this handler.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    var mousePoint,
        canvasOffsets;

    mousePoint = aSignal.getGlobalPoint();
    canvasOffsets = TP.windowComputeWindowOffsets(
                            TP.sys.getUIRoot(true), TP.sys.getUICanvas(true));

    mousePoint.setX(mousePoint.getX() - canvasOffsets.at('0'));
    mousePoint.setY(mousePoint.getY() - canvasOffsets.at('1'));

    this.updateStatusbar(TP.hc('mousePoint', mousePoint));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('NavigateBack',
function(aSignal) {

    /**
     * @method handleNavigateBack
     * @summary Handles notifications of when the user wants to navigate 'back'
     *     in the 'stack' of navigated locations.
     * @param {TP.sig.NavigateBack} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    this.signal('NavigateInspector',
                TP.hc('direction', TP.PREVIOUS, 'showBusy', true));

    //  Make sure that the navigation buttons are updated to reflect the new
    //  location.
    this.updateNavigationButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('NavigateForward',
function(aSignal) {

    /**
     * @method handleNavigateForward
     * @summary Handles notifications of when the user wants to navigate
     *     'forward' in the 'stack' of navigated locations.
     * @param {TP.sig.NavigateForward} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    this.signal('NavigateInspector',
                TP.hc('direction', TP.NEXT, 'showBusy', true));

    //  Make sure that the navigation buttons are updated to reflect the new
    //  location.
    this.updateNavigationButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('NavigateHome',
function(aSignal) {

    /**
     * @method handleNavigateHome
     * @summary Handles notifications of when the user wants to navigate 'home'
     *     to the inspector root bay.
     * @param {TP.sig.NavigateHome} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    this.signal('NavigateInspector', TP.hc('direction', TP.HOME));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('SherpaReady',
function(aSignal) {

    /**
     * @method handleSherpaReady
     * @summary Handles notification of when the Sherpa has completely opened to
     *     its initial state and is ready for interaction.
     * @param {TP.sig.SherpaReady} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    //  Preload the snippets menu
    TP.xctrls.popup.preload(
            TP.hc('triggerTPDocument', this.getDocument(),
                    'overlayID', 'SnippetsPopup',
                    'triggerID', 'snippetMenuTrigger',
                    'contentURI', 'urn:tibet:TP.sherpa.snippetMenuContent'));

    //  Preload the bookmarks menu
    TP.xctrls.popup.preload(
            TP.hc('triggerTPDocument', this.getDocument(),
                    'overlayID', 'BookmarksPopup',
                    'triggerID', 'showbookmarks',
                    'contentURI', 'urn:tibet:TP.sherpa.bookmarkMenuContent'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('ShowBookmarks',
function(aSignal) {

    /**
     * @method handleShowBookmarks
     * @summary Handles notifications of when the user wants to show the menu of
     *     saved bookmarks.
     * @param {TP.sig.ShowBookmarks} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    TP.byId('SherpaBookmarkMenu', this.getNativeWindow()).activate();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('ToggleHalo',
function(aSignal) {

    /**
     * @method handleToggleHalo
     * @summary Handles notifications of when the user wants to toggle the halo
     *     on and off. In the case where the halo is being toggled off, the last
     *     halo'ed element will be preserved and will become focused by the halo
     *     if this signal is used again to toggle the halo back on.
     * @param {TP.sig.ToggleHalo} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    this.signal('SherpaHaloToggle', aSignal, TP.FIRE_ONE);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('ToggleOutlines',
function(aSignal) {

    /**
     * @method handleToggleOutlines
     * @summary Handles notifications of when the user wants to toggle the
     *     outliner's outline mode on and off.
     * @param {TP.sig.ToggleOutlines} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    this.signal('SherpaOutlinerToggle', aSignal, TP.FIRE_ONE);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('TSHBuild',
function(aSignal) {

    /**
     * @method handleTSHBuild
     * @summary Handles notifications of when the receiver wants to build their
     *     project using the TSH.
     * @param {TP.sig.TSHBuild} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    var cmdVal;

    TP.confirm('Build Application Packages?').then(
        function(build) {
            if (TP.notTrue(build)) {
                TP.info('Build cancelled.');
                return;
            }

            //  Build the command and execute it.
            cmdVal = ':build';
            TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('TSHDeploy',
function(aSignal) {

    /**
     * @method handleTSHDeploy
     * @summary Handles notifications of when the receiver wants to deploy their
     *     project using the TSH.
     * @param {TP.sig.TSHDeploy} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    var profileName;

    //  Grab the profile name and slice off everything after the '@'. That will
    //  be what we default the 'ShipIt environment name'.
    profileName = TP.sys.getcfg('boot.profile');
    profileName = profileName.slice(0, profileName.indexOf('@'));

    TP.prompt('Enter environment name:',
                profileName).then(
        function(userValue) {
            var cmdVal;

            //  Build the command and execute it.
            cmdVal = ':deploy';

            if (TP.notEmpty(userValue)) {
                cmdVal += ' ' + userValue;
                TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('TSHTest',
function(aSignal) {

    /**
     * @method handleTSHTest
     * @summary Handles notifications of when the receiver wants to test their
     *     project using the TSH.
     * @param {TP.sig.TSHTest} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.workbench} The receiver.
     */

    TP.confirm('Run Application Test Suites?').then(
        function(build) {
            var cmdVal,
                shell,
                haloType;

            if (TP.notTrue(build)) {
                TP.info('Test run cancelled.');
                return;
            }

            //  Build the command and execute it.
            cmdVal = ':test';

            shell = TP.bySystemId('TSH');
            if (TP.isValid(shell)) {

                haloType = shell.getVariable('HALO_TYPE');
                if (TP.isType(haloType)) {
                    cmdVal += ' $HALO_TYPE';
                }
            }

            TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
