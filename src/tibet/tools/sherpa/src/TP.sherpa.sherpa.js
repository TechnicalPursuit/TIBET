//  ============================================================================
//  TP.sherpa.sherpa
//  ============================================================================

/**
 * @type {TP.sherpa.sherpa}
 * @synopsis
 */

//  ----------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa.sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.sherpa.sherpa.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var elem,

        triggerKey;

    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Set up the trigger key

    if (TP.isEmpty(triggerKey = TP.elementGetAttribute(elem, 'sherpa:toggle'))) {
        triggerKey = 'DOM_Alt_Up_Up';
    }

    this.observe(
            null,
            'TP.sig.AppDidStart',
            function (aSignal) {
                (function () {
                    var uiRoot,
                        tsh;

                    uiRoot = TP.win('UIROOT');

                    tsh = TP.core.TSH.getDefaultInstance();

                    TP.core.sherpa.construct(
                        TP.hc('window', uiRoot,
                                'model', tsh,
                                'triggerKey', triggerKey
                        ));

                }.fork(100));
            });

    return this.callNextMethod();
});

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

    //  Initialize the quick bar
    //this.setupQuickBar();

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
    uiBootIFrameElem.style.display = 'none';

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
    worldTPElem.setup(2, 2, 1024, 768);

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

TP.core.sherpa.Inst.defineMethod('setupQuickBar',
function() {

    var uiRootDoc,
        quickBarTPElem;

    uiRootDoc = TP.doc(TP.win('UIROOT'));

    quickBarTPElem = TP.sherpa.quickbar.addResourceContentTo(
                            TP.ietf.Mime.XHTML,
                            TP.documentGetBody(uiRootDoc));
    quickBarTPElem.setup();

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
