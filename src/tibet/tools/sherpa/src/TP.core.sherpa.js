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
 * @type {TP.core.sherpa}
 * @synopsis
 */

//  ============================================================================
//  TP.core.sherpa
//  ============================================================================

TP.lang.Object.defineSubtype('core.sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.core.sherpa.Type.defineMethod('initialize',
function(aName) {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     * @return {TP.core.Sherpa} The receiver.
     */

    var toggleKey,
        sherpaSetupFunc;

    //  If the Sherpa isn't configured to start, then exit here.
    if (!TP.sys.cfg('tibet.sherpa')) {
        return this;
    }

    //  Otherwise, clear the 'boot.toggle_on' flag. We don't want the boot log
    //  to be toggled. We'll be handling all of that.
    TP.sys.setcfg('boot.toggle_on', null);

    //  Register our toggle key handler to finish Sherpa setup.
    toggleKey = TP.sys.cfg('sherpa.toggle_on');
    if (!toggleKey.startsWith('TP.sig.')) {
        toggleKey = 'TP.sig.' + toggleKey;
    }

    //  Set up the handler to finish the setup of the Sherpa when the toggle key
    //  is pressed.

    /* eslint-disable no-wrap-func */
    //  set up keyboard toggle to show/hide the boot UI
    (sherpaSetupFunc = function () {

        var sherpaInst,

            win,
            drawerElement,

            sherpaFinishSetupFunc,

            contentElem;

        //  The first thing to do is to tell TP.core.Keyboard to *ignore* this
        //  handler Function. This is because, once we finish set up of the
        //  Sherpa, it will install it's own handler for the trigger key and
        //  take over that responsibility.
        sherpaSetupFunc.ignore(TP.core.Keyboard, toggleKey);

        if (TP.isValid(sherpaInst = TP.byOID('Sherpa'))) {

            //  If we didn't show the IDE when we first started, the trigger
            //  has now been fired to show it.
            if (!TP.sys.cfg('boot.show_ide')) {

                win = TP.win('UIROOT');
                drawerElement = TP.byCSS('div#south', win, true);

                (sherpaFinishSetupFunc = function(aSignal) {
                    sherpaFinishSetupFunc.ignore(
                        drawerElement, 'TP.sig.DOMTransitionEnd');

                        //  The basic Sherpa framing has been set up, but we
                        //  complete the setup here (after the drawers
                        //  animate in).
                        sherpaInst.finishSetup();

                        //  We add our 'south's 'no_transition' class so
                        //  that during user interaction, resizing this
                        //  drawer will be immediate.
                        TP.elementAddClass(drawerElement, 'no_transition');

                        TP.byOID('SherpaHUD', TP.win('UIROOT')).setAttribute(
                                                                'hidden', false);

                }).observe(drawerElement, 'TP.sig.DOMTransitionEnd');

                //  Show the center area and the drawers.

                //  First, we remove the 'fullscreen' class from the center
                //  element. This allows the 'content' element below to properly
                //  size it's 'busy message layer'.
                TP.elementRemoveClass(TP.byId('center', win), 'fullscreen');

                //  Grab the existing 'content' element, which is now unused
                //  since the world element moved the screens out of it, and use
                //  it to show the 'loading' element. The console will later
                //  reuse it for it's output.
                contentElem = TP.byId('content', win);

                TP.elementShow(contentElem);
                TP.elementShowBusyMessage(contentElem,
                    '...initializing TIBET Sherpa...');

                //  Show the drawers.
                TP.byCSS('.north, .south, .east, .west', win).perform(
                            function (anElem) {
                                TP.elementRemoveAttribute(
                                            anElem, 'pclass:hidden', true);
                            });
            } else {
                sherpaInst.finishSetup();
            }
        }
    }).observe(TP.core.Keyboard, toggleKey);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the view window (i.e. the window containing the sherpa)
TP.core.sherpa.Inst.defineAttribute('vWin');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('init',
function() {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @returns {TP.core.sherpa} The receiver.
     */

    var uiBootIFrameElem,
        win;

    //  Manually 'display: none' the boot iframe. It's already
    //  'visibility:hidden', but we need to get it out of the way.
    uiBootIFrameElem = TP.byId('UIBOOT', top);
    TP.elementHide(uiBootIFrameElem);

    win = TP.win('UIROOT');

    //  set up our window
    this.set('vWin', win);

    //  Set up the World
    this.setupWorld();

    //  Based on the setting of this flag, we show or hide the center area and
    //  the drawers (the HUD isn't real until we finish setup, so we do it
    //  manually here).
    if (TP.sys.cfg('boot.show_ide')) {
        TP.elementRemoveClass(TP.byId('center', win), 'fullscreen');
        TP.byCSS('.north, .south, .east, .west', win).perform(
                    function (anElem) {
                        TP.elementRemoveAttribute(
                                    anElem, 'pclass:hidden', true);
                    });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('finishSetup',
function() {

    var win,
        doc,

        worldTPElem,

        toggleKey;

    win = this.get('vWin');
    doc = TP.doc(win);

    //  Set up the HUD
    this.setupHUD();

    //  The World was set up on initial startup - set up the rest of the
    //  components. We do set up the World to observe when the HUD shows
    worldTPElem = TP.byOID('SherpaWorld', this.get('vWin'));
    worldTPElem.observe(TP.byOID('SherpaHUD', this.get('vWin')),
                        'HiddenChange');

    //  Set up the halo
    this.setupHalo();

    //  Set up the console
    this.setupConsole();

    //  Configure a toggle so we can always get back to just showing the app.
    toggleKey = TP.sys.cfg('sherpa.toggle_on');

    if (!toggleKey.startsWith('TP.sig.')) {
        toggleKey = 'TP.sig.' + toggleKey;
    }

    //  set up keyboard toggle to show/hide us
    /* eslint-disable no-wrap-func */
    (function () {
        this.toggle();
    }).bind(this).observe(TP.core.Keyboard, toggleKey);
    /* eslint-enable no-wrap-func */

    /*
    (function () {

        var testTile = TP.byOID('Sherpa', this.get('vWin')).makeTile('detailTile');
        testTile.toggle('hidden');

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.DOM_T_Up__TP.sig.DOM_T_Up');
    */

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('makeTile',
function(anID) {

    var sherpaFrameBody,
        tileTPElem;

    sherpaFrameBody = TP.documentGetBody(this.get('vWin').document);

    tileTPElem = TP.wrap(sherpaFrameBody).addContent(
                    TP.sherpa.tile.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

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
                    TP.sherpa.editortile.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    tileTPElem.setID(anID);
    tileTPElem.setup();

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupConsole',
function() {
    var sherpaSouthDrawer,
        consoleTPElem;

        //worldTPElem,
        //consoleOutTPElem;

    sherpaSouthDrawer = TP.byCSS('#south > .drawer',
                                    this.get('vWin').document,
                                    true);

    consoleTPElem =
            TP.wrap(sherpaSouthDrawer).addContent(
                TP.sherpa.console.getResourceElement('template',
                    TP.ietf.Mime.XHTML));

    consoleTPElem.setup();

    //  NB: The console observes the HUD when it's done loading it's editor,
    //  etc.

    /*
    worldTPElem = TP.byOID('SherpaWorld', this.get('vWin'));

    consoleOutTPElem = worldTPElem.createSlotElement('SherpaConsoleSlot');
    */

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupHalo',
function() {

    var sherpaFrameBody,
        haloTPElem;

    sherpaFrameBody = TP.documentGetBody(this.get('vWin').document);

    haloTPElem = TP.wrap(sherpaFrameBody).addContent(
                    TP.sherpa.halo.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    haloTPElem.setup();
    haloTPElem.observe(TP.byOID('SherpaHUD', this.get('vWin')),
                        'HiddenChange');

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupHUD',
function() {

    var sherpaFrameBody,
        hudTPElem;

    sherpaFrameBody = TP.documentGetBody(this.get('vWin').document);

    hudTPElem = TP.wrap(sherpaFrameBody).addContent(
                    TP.sherpa.hud.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    hudTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.sherpa.Inst.defineMethod('setupWorld',
function() {

    var uiScreensWin,
        uiDoc,

        worldElem,

        uiScreenIFrames,
        numIFrames,

        configNumIFrames,
        i,

        screenElem,
        iFrameElem,

        worldTPElem;

    uiScreensWin = this.get('vWin');
    uiDoc = uiScreensWin.document;

    //  Create the <sherpa:world> tag
    worldElem = TP.documentCreateElement(uiDoc, 'world', TP.w3.Xmlns.SHERPA);
    TP.elementSetAttribute(worldElem, 'id', 'SherpaWorld');

    //  Append the <sherpa:world> tag into the loaded Sherpa document.
    TP.xmlElementInsertContent(
            TP.byId('center', uiScreensWin),
            worldElem,
            TP.AFTER_BEGIN,
            null);

    //  Grab the 1...n 'prebuilt' iframes that are available in the Sherpa
    //  template. Create a <sherpa:screen> tag and wrap them in it and place
    //  that screen tag into the world.
    uiScreenIFrames = TP.byCSS('.center iframe', uiScreensWin);
    uiScreenIFrames.perform(
            function(anIFrameElem) {
                var screenElem;

                //  Wrap each iframe inside of a 'sherpa:screen' element
                screenElem = TP.documentCreateElement(uiDoc,
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
            screenElem = TP.documentCreateElement(uiDoc,
                                                    'screen',
                                                    TP.w3.Xmlns.SHERPA);
            iFrameElem = TP.documentCreateElement(uiDoc,
                                                    'iframe',
                                                    TP.w3.Xmlns.XHTML);

            TP.nodeAppendChild(screenElem, iFrameElem, false);
            TP.nodeAppendChild(worldElem, screenElem, false);
        }
    }

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
