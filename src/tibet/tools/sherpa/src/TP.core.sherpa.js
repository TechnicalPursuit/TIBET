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

        var testTile = TP.byOID('Sherpa', this.get('vWin')).makeTile('detailTile');
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

    var sherpaFrameBody,
        tileTPElem;

    sherpaFrameBody = TP.documentGetBody(this.get('vWin').document);

    tileTPElem = TP.wrap(sherpaFrameBody).addContent(
                    TP.sherpa.tile.getResourceMarkup(TP.ietf.Mime.XHTML));

    tileTPElem.setID(anID);
    tileTPElem.setup();

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('makeEditorTile',
function(anID) {

    var sherpaFrameBody,
        tileTPElem;

    sherpaFrameBody = TP.documentGetBody(this.get('vWin').document);

    tileTPElem = TP.wrap(sherpaFrameBody).addContent(
                    TP.sherpa.editortile.getResourceMarkup(TP.ietf.Mime.XHTML));

    tileTPElem.setID(anID);
    tileTPElem.setup();

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupConsole',
function() {

    var sherpaSouthDrawer,
        consoleTPElem;

    sherpaSouthDrawer = TP.byCSS('#south > .drawer',
                                    this.get('vWin').document,
                                    true);

    consoleTPElem = TP.wrap(sherpaSouthDrawer).addContent(
                    TP.sherpa.console.getResourceMarkup(TP.ietf.Mime.XHTML));

    consoleTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupHalo',
function() {

    var sherpaFrameBody,
        haloTPElem;

    sherpaFrameBody = TP.documentGetBody(this.get('vWin').document);

    haloTPElem = TP.wrap(sherpaFrameBody).addContent(
                    TP.sherpa.halo.getResourceMarkup(TP.ietf.Mime.XHTML));

    haloTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupHUD',
function() {

    var sherpaFrameBody,
        hudTPElem;

    sherpaFrameBody = TP.documentGetBody(this.get('vWin').document);

    hudTPElem = TP.wrap(sherpaFrameBody).addContent(
                    TP.sherpa.hud.getResourceMarkup(TP.ietf.Mime.XHTML));

    hudTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupWorld',
function() {

    var uiScreensWin,

        worldElem,

        uiScreenIFrames,
        numIFrames,

        configNumIFrames,
        i,
    
        screenElem,
        iFrameElem,
    
        worldTPElem;

    uiScreensWin = this.get('vWin');

    //  Create the <sherpa:world> tag
    worldElem = TP.documentCreateElement(uiScreensWin.document,
                                            'world',
                                            TP.w3.Xmlns.SHERPA);
    TP.elementSetAttribute(worldElem, 'id', 'SherpaWorld');

    //  Grab the 1...n 'prebuilt' iframes that are available in the Sherpa
    //  template. Create a <sherpa:screen> tag and wrap them in it and place
    //  that screen tag into the world.
    uiScreenIFrames = TP.byCSS('.center iframe', uiScreensWin);
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

    //  Get the number of actual iframes vs. the number of screens configured by
    //  the user as the desired number of iframes (defaulting to 1).
    numIFrames = uiScreenIFrames.getSize();
    configNumIFrames = TP.ifInvalid(1, TP.sys.cfg('sherpa.num_screens'));

    //  If there are not enough screens, according to the number configured by
    //  the user, create more.
    if (configNumIFrames > numIFrames) {
        for (i = 0; i < (configNumIFrames - numIFrames); i++) {
            screenElem = TP.documentCreateElement(uiScreensWin.document,
                                                    'screen',
                                                    TP.w3.Xmlns.SHERPA);
            iFrameElem = TP.documentCreateElement(uiScreensWin.document,
                                                    'iframe',
                                                    TP.w3.Xmlns.XHTML);

            TP.nodeAppendChild(screenElem, iFrameElem, false);
            TP.nodeAppendChild(worldElem, screenElem, false);
        }
    }

    //  Append the <sherpa:world> tag into the loaded Sherpa document.
    TP.xmlElementInsertContent(
            TP.byId('center', uiScreensWin),
            worldElem,
            TP.AFTER_BEGIN,
            null,
            true);

    //  Grab the <sherpa:world> tag and set it up.
    worldTPElem = TP.byOID('SherpaWorld', uiScreensWin);
    worldTPElem.setup();

    //  Hide the 'content' div
    TP.elementHide(TP.byId('content', uiScreensWin));

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
