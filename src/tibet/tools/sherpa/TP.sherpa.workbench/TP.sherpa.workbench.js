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
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.workbench.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        sherpaInspectorTPElem,

        arrows;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    sherpaInspectorTPElem = TP.byId('SherpaInspector',
                                    tpElem.getNativeWindow());

    arrows = TP.byCSSPath('sherpa|scrollbutton',
                            elem,
                            false,
                            true);

    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', sherpaInspectorTPElem);
            });

    tpElem.setupBookmarkMenu();

    tpElem.observe(TP.byId('SherpaInspector', TP.win('UIRoot')),
                    'InspectorFocused');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('AddBookmark',
function(aSignal) {

    var currentHistoryEntry,
        cmdVal;

    currentHistoryEntry =
        TP.byId('SherpaInspector', TP.win('UIRoot')).get('currentHistoryEntry');

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

TP.sherpa.workbench.Inst.defineHandler('InspectorFocused',
function(aSignal) {

    this.updateNavigationButtons();

    return this;
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

    TP.info('Save the canvas content');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineHandler('ShowBookmarks',
function(aSignal) {

    TP.byId('SherpaBookmarkMenu', this.getNativeWindow()).activate();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.workbench.Inst.defineMethod('setupBookmarkMenu',
function() {

    var menuTPElem;

    menuTPElem = TP.sherpa.bookmarkmenu.getResourceElement('template',
                            TP.ietf.Mime.XHTML);

    menuTPElem = menuTPElem.clone();
    menuTPElem.compile();

    menuTPElem = TP.byId('SherpaHUD', this.getNativeWindow()).addContent(
                                                                menuTPElem);
    menuTPElem.awaken();

    this.updateNavigationButtons();

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

    pathStack = TP.byId('SherpaInspector', TP.win('UIRoot')).get('pathStack');
    pathStackIndex = TP.byId('SherpaInspector',
                                TP.win('UIRoot')).get('pathStackIndex');

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
//  end
//  ========================================================================
