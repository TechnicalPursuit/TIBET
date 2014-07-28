//  ============================================================================
//  TP.sherpa.sherpa
//  ============================================================================

/**
 * @type {TP.sherpa.sherpa}
 * @synopsis
 */

//  ============================================================================
//  TP.core.sherpa
//  ============================================================================

TP.lang.Object.defineSubtype('core.sherpa');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the view window (i.e. the window containing the sherpa)
TP.core.sherpa.Inst.defineAttribute('vWin');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('init',
function(info) {

    /**
     * @name init
     * @synopsis Constructor for new instances.
     * @param {TP.lang.Hash}
     * @returns {TP.core.ConsoleService} A new instance.
     * @todo
     */

    var win,
        doc,
    
        uiBootIFrameElem;

    win = info.at('window');
    doc = TP.doc(win);

    //  set up our window
    this.set('vWin', win);

    //  Initialize the World
    this.setupWorld();

    //  Initialize the HUD
    this.setupHUD();

    //  Initialize the halo
    this.setupHalo();

    //  Initialize the console
    this.setupConsole();

    //  set up keyboard toggle to show/hide us
    (function () {

            this.toggle();

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.' + info.at('triggerKey'));

    /*
    (function () {

        var testTile = TP.byOID('Sherpa').makeTile('detailTile');
        testTile.toggle('hidden');

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.DOM_T_Up__TP.sig.DOM_T_Up');
    */

    //  Manually 'display: none' the boot iframe. It's already
    //  'visibility:hidden', but we need to get it out of the way.
    uiBootIFrameElem = TP.byId('UIBOOT', top);
    TP.elementHide(uiBootIFrameElem);

    this.setID('Sherpa');
    TP.sys.registerObject(this);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('makeTile',
function(anID) {

    var uiRootDoc,
        tileTPElem;

    uiRootDoc = TP.doc(TP.win('UIROOT'));

    tileTPElem = TP.sherpa.tile.addResourceContentTo(
                            TP.ietf.Mime.XHTML,
                            TP.documentGetBody(uiRootDoc));
    tileTPElem.setID(anID);

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('makeEditorTile',
function(anID) {

    var uiRootDoc,
        tileTPElem;

    uiRootDoc = TP.doc(TP.win('UIROOT'));

    tileTPElem = TP.sherpa.editortile.addResourceContentTo(
                            TP.ietf.Mime.XHTML,
                            TP.documentGetBody(uiRootDoc));
    tileTPElem.setID(anID);
    tileTPElem.setup();

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupWorld',
function() {

    var uiScreensWin,

        worldElem,

        uiScreenIFrames,
        numIFrames,
    
        screenElem,
        iFrameElem,
    
        worldTPElem;

    uiScreensWin = TP.byOID('UISCREENS', TP.win('UIROOT')).
                        getNativeContentWindow();
    
    worldElem = TP.documentCreateElement(uiScreensWin.document,
                                            'world',
                                            TP.w3.Xmlns.SHERPA);
    TP.elementSetAttribute(worldElem, 'id', 'SherpaWorld');

    uiScreenIFrames = TP.byCSS('iframe.screen', uiScreensWin);
    uiScreenIFrames.perform(
            function(anIFrameElem) {
                var screenElem;

                //  Wrap each iframe inside of a 'sherpa:screen' element
                screenElem = TP.documentCreateElement(uiScreensWin.document,
                                                        'screen',
                                                        TP.w3.Xmlns.SHERPA);

                TP.nodeAppendChild(screenElem, anIFrameElem, false);
                TP.nodeAppendChild(worldElem, screenElem, false);
            });

    numIFrames = uiScreenIFrames.getSize();

    if (numIFrames > 1 && numIFrames.isOdd()) {
        screenElem = TP.documentCreateElement(uiScreensWin.document,
                                                'screen',
                                                TP.w3.Xmlns.SHERPA);
        iFrameElem = TP.documentCreateElement(uiScreensWin.document,
                                                'iframe',
                                                TP.w3.Xmlns.XHTML);

        TP.nodeAppendChild(screenElem, iFrameElem, false);
        TP.nodeAppendChild(worldElem, screenElem, false);
    }

    TP.xmlElementAddContent(
            TP.documentGetBody(TP.doc(uiScreensWin)), worldElem, null, true);

    worldTPElem = TP.byOID('SherpaWorld', uiScreensWin);
    worldTPElem.setup();

    //  TODO: For now, we set the world to be focused on the screen at 0,0
    worldTPElem.fitToScreen(0, 0);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupHUD',
function() {

    var uiRootDoc,
        hudTPElem;

    uiRootDoc = TP.doc(TP.win('UIROOT'));

    hudTPElem = TP.sherpa.hud.addResourceContentTo(
                            TP.ietf.Mime.XHTML,
                            TP.documentGetBody(uiRootDoc));
    hudTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupConsole',
function() {

    var uiRootDoc,
        consoleTPElem;

    uiRootDoc = TP.doc(TP.win('UIROOT'));

    consoleTPElem = TP.sherpa.console.addResourceContentTo(
                            TP.ietf.Mime.XHTML,
                            TP.documentGetBody(uiRootDoc));
    consoleTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupHalo',
function() {

    var uiRootDoc,
        haloTPElem;

    uiRootDoc = TP.doc(TP.win('UIROOT'));

    haloTPElem = TP.sherpa.halo.addResourceContentTo(
                            TP.ietf.Mime.XHTML,
                            TP.documentGetBody(uiRootDoc));
    haloTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('toggle',
function() {

    TP.byOID('SherpaHUD', this.get('vWin')).toggle('hidden');

    return this;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
