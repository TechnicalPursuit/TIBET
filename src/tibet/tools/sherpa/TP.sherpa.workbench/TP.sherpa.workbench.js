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
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineMethod('setup',
function() {

    var win,

        sherpaInspectorTPElem,
        arrows,

        sherpaHaloTPElem,

        sherpaOutliner;

    win = this.getNativeWindow();

    sherpaInspectorTPElem = TP.byId('SherpaInspector', win);

    arrows = TP.byCSSPath('sherpa|scrollbutton', win, false, true);

    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', sherpaInspectorTPElem);
            });

    this.setupBreadcrumb();

    this.updateNavigationButtons();
    this.updateToolbarButtons();

    this.observe(sherpaInspectorTPElem, 'InspectorDidFocus');

    //  Halo
    sherpaHaloTPElem = TP.byId('SherpaHalo', win);
    this.observe(sherpaHaloTPElem,
                    TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    //  Outliner
    sherpaOutliner = TP.bySystemId('SherpaOutliner');
    this.observe(sherpaOutliner,
                    TP.ac('TP.sig.BeginOutlineMode', 'TP.sig.EndOutlineMode'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineMethod('setupBreadcrumb',
function() {

    var breadcrumbTPElem;

    //  Set up the breadcrumb bar
    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', this.getNativeWindow());

    breadcrumbTPElem.setValue(TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineMethod('updateNavigationButtons',
function() {

    var backButton,
        forwardButton,

        pathStack,
        pathStackIndex;

    backButton = TP.byId('navigateback', this.getNativeNode(), false);
    forwardButton = TP.byId('navigateforward', this.getNativeNode(), false);

    pathStack = TP.byId('SherpaInspector', TP.win('UIROOT')).get('pathStack');
    pathStackIndex = TP.byId('SherpaInspector',
                                TP.win('UIROOT')).get('pathStackIndex');

    if (pathStackIndex <= 0) {
        TP.elementRemoveClass(backButton, 'more');
        TP.elementSetAttribute(backButton, 'disabled', true, true);
    } else {
        TP.elementAddClass(backButton, 'more');
        TP.elementRemoveAttribute(backButton, 'disabled', true);
    }

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

TP.sherpa.workbench.Inst.defineMethod('updateToolbarButtons',
function() {

    var workbenchToggleButtons,

        sherpaHaloTPElem,
        isFocused,

        sherpaOutliner;

    workbenchToggleButtons = TP.byId('workbenchToggleButtons',
                                        this.getNativeWindow());

    sherpaHaloTPElem = TP.byId('SherpaHalo', this.getNativeWindow());
    isFocused = sherpaHaloTPElem.isFocused();

    if (isFocused) {
        workbenchToggleButtons.addSelection('halo', 'value');
    } else {
        workbenchToggleButtons.removeSelection('halo', 'value');
    }

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

    var currentHistoryEntry,
        cmdVal;

    currentHistoryEntry =
        TP.byId('SherpaInspector', TP.win('UIROOT')).get('currentHistoryEntry');

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

    cmdVal = ':bookmark \'' + cmdVal + '\'';

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('InspectorDidFocus',
function(aSignal) {

    var origin,
        sigOriginTPElem,

        inspectorSelectedItemLabels,
        breadcrumbTPElem;

    this.updateNavigationButtons();

    origin = aSignal.getOrigin();

    if (TP.isString(origin)) {
        sigOriginTPElem = TP.bySystemId(origin);
    } else {
        sigOriginTPElem = TP.wrap(origin);
    }

    inspectorSelectedItemLabels = sigOriginTPElem.get('selectedItems');

    //  Set up the breadcrumb bar
    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', this.getNativeWindow());

    breadcrumbTPElem.setValue(inspectorSelectedItemLabels);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    this.updateToolbarButtons();

    return this;
}, {
    origin: 'SherpaHalo'
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    this.updateToolbarButtons();

    return this;
}, {
    origin: 'SherpaHalo'
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('BeginOutlineMode',
function(aSignal) {

    this.updateToolbarButtons();

    return this;
}, {
    origin: 'SherpaOutliner'
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('EndOutlineMode',
function(aSignal) {

    this.updateToolbarButtons();

    return this;
}, {
    origin: 'SherpaOutliner'
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('NavigateBack',
function(aSignal) {

    this.signal('NavigateInspector', TP.hc('direction', TP.PREVIOUS));
    this.updateNavigationButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('NavigateForward',
function(aSignal) {

    this.signal('NavigateInspector', TP.hc('direction', TP.NEXT));
    this.updateNavigationButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('NavigateHome',
function(aSignal) {

    this.signal('NavigateInspector', TP.hc('direction', TP.HOME));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('SaveCanvas',
function(aSignal) {

    var uiDoc,
        uiDocURI,

        serializationStorage;

    uiDoc = TP.sys.uidoc();

    uiDocURI = TP.uc(uiDoc.getLocation());

    serializationStorage = TP.hc();
    serializationStorage.atPut('store', uiDocURI.getLocation());

    uiDoc.serializeForStorage(serializationStorage);

    TP.bySystemId('Sherpa').saveStorageSerialization(serializationStorage);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('ShowBookmarks',
function(aSignal) {

    TP.byId('SherpaBookmarkMenu', this.getNativeWindow()).activate();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('ToggleHalo',
function(aSignal) {
    this.signal('SherpaHaloToggle', aSignal, TP.FIRE_ONE);
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('ToggleOutlines',
function(aSignal) {
    this.signal('SherpaOutlinerToggle', aSignal, TP.FIRE_ONE);
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('TSHBuild',
function(aSignal) {
    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(':build');
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('TSHDeploy',
function(aSignal) {
    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(':deploy');
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('TSHTest',
function(aSignal) {
    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(':test');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
