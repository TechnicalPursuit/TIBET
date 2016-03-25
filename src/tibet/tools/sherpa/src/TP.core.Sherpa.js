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
 * @type {TP.core.Sherpa}
 */

//  ============================================================================
//  TP.core.Sherpa
//  ============================================================================

TP.lang.Object.defineSubtype('core.Sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.core.Sherpa.Type.defineMethod('initialize',
function(aName) {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     * @returns {TP.core.Sherpa} The receiver.
     */

    var toggleKey,
        sherpaSetupFunc;

    //  If the Sherpa isn't configured to start, then exit here.
    if (!TP.sys.cfg('sherpa.enabled')) {
        return this;
    }

    //  Register our toggle key handler to finish Sherpa setup.
    toggleKey = TP.sys.cfg('sherpa.toggle_key');
    if (TP.isEmpty(toggleKey)) {
        TP.error('Sherpa is enabled but no toggle key defined.');
        return this;
    }

    if (!toggleKey.startsWith('TP.sig.')) {
        toggleKey = 'TP.sig.' + toggleKey;
    }

    //  Set up the handler to finish the setup of the Sherpa when the toggle key
    //  is pressed.

    /* eslint-disable no-wrap-func */
    //  set up keyboard toggle to show/hide the boot UI
    (sherpaSetupFunc = function() {

        var sherpaInst,

            win,
            drawerElement,

            sherpaFinishSetupFunc,

            contentElem,

            allDrawers;

        //  The first thing to do is to tell TP.core.Keyboard to *ignore* this
        //  handler Function. This is because, once we finish set up of the
        //  Sherpa, it will install it's own handler for the trigger key and
        //  take over that responsibility.
        sherpaSetupFunc.ignore(TP.core.Keyboard, toggleKey);

        if (TP.isValid(sherpaInst = TP.bySystemId('Sherpa'))) {

            //  If we didn't show the IDE when we first started, the trigger has
            //  now been fired to show it.
            if (!TP.sys.cfg('boot.show_ide')) {

                win = TP.win('UIROOT');
                drawerElement = TP.byId('south', win, false);

                (sherpaFinishSetupFunc = function(aSignal) {
                    sherpaFinishSetupFunc.ignore(
                        drawerElement, 'TP.sig.DOMTransitionEnd');

                    //  The basic Sherpa framing has been set up, but we
                    //  complete the setup here (after the drawers animate in).
                    sherpaInst.finishSetup();

                    //  Set the HUD to not be hidden
                    TP.byId('SherpaHUD', TP.win('UIROOT')).setAttribute(
                                                            'hidden', false);

                    //  Refresh the input area after a 1000ms timeout. This
                    //  ensures that other layout will happen before the editor
                    //  component tries to compute its layout
                    /* eslint-disable no-wrap-func,no-extra-parens */
                    (function() {
                        TP.byId('SherpaConsole', TP.win('UIROOT')).render();
                    }).fork(1000);
                    /* eslint-enable no-wrap-func,no-extra-parens */

                }).observe(drawerElement, 'TP.sig.DOMTransitionEnd');

                //  Show the center area and the drawers.

                //  First, we remove the 'fullscreen' class from the center
                //  element. This allows the 'content' element below to properly
                //  size it's 'busy message layer'.
                TP.elementRemoveClass(TP.byId('center', win, false),
                                        'fullscreen');

                //  Grab the existing 'content' element, which is now unused
                //  since the world element moved the screens out of it, and use
                //  it to show the 'loading' element. The console will later
                //  reuse it for it's output.
                contentElem = TP.byId('content', win, false);

                TP.elementShow(contentElem);
                TP.elementShowBusyMessage(contentElem,
                                            '...initializing TIBET Sherpa...');

                allDrawers = TP.byCSSPath('.north, .south, .east, .west',
                                            win,
                                            false,
                                            false);

                //  Show the drawers.
                allDrawers.perform(
                            function(anElem) {
                                TP.elementRemoveAttribute(
                                            anElem, 'pclass:hidden', true);
                            });
            } else {
                sherpaInst.finishSetup();

                //  Set the HUD to not be hidden
                TP.byId('SherpaHUD', TP.win('UIROOT')).setAttribute(
                                                        'hidden', false);

                //  Refresh the input area after a 1000ms timeout. This
                //  ensures that other layout will happen before the editor
                //  component tries to compute its layout
                /* eslint-disable no-wrap-func,no-extra-parens */
                (function() {
                    TP.byId('SherpaConsole', TP.win('UIROOT')).render();
                }).fork(1000);
                /* eslint-enable no-wrap-func,no-extra-parens */
            }
        }
    }).observe(TP.core.Keyboard, toggleKey);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Type.defineMethod('hasStarted',
function() {
    return TP.isValid(TP.bySystemId('Sherpa'));
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Type.defineMethod('isOpen',
function() {

    var elem;

    elem = TP.byId('SherpaHUD', this.get('vWin'));
    if (TP.isValid(elem)) {
        elem.isVisible();
    }

    return false;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Type.defineMethod('replaceWithUnknownElementProxy',
function(anElement) {

    var newTagContent,
        newElement;

    newTagContent = TP.str(anElement);

    newElement = TP.xhtmlnode(
        '<tibet:tofu on:click="TagAssist"' +
                ' proxyfor="' + TP.name(anElement) + '">' +
            '<span class="name">' +
                '&lt;' + TP.name(anElement) + '... /&gt;' +
            '</span>' +
            '<span class="content">' +
                '<![CDATA[' +
                newTagContent +
                ']]>' +
            '</span>' +
        '</tibet:tofu>');

    newElement = TP.elementReplaceWith(anElement, newElement);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the view window (i.e. the window containing the sherpa)
TP.core.Sherpa.Inst.defineAttribute('vWin');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.core.Sherpa} The receiver.
     */

    var uiBootIFrameElem,
        win,

        allDrawers;

    //  Manually 'display: none' the boot iframe. It's already
    //  'visibility:hidden', but we need to get it out of the way.
    uiBootIFrameElem = TP.byId('UIBOOT', top, false);
    if (TP.isValid(uiBootIFrameElem)) {
        TP.elementHide(uiBootIFrameElem);
    }

    win = TP.win('UIROOT');

    //  set up our window
    this.set('vWin', win);

    //  Set up the World
    this.setupWorld();

    //  Based on the setting of this flag, we show or hide the center area and
    //  the drawers (the HUD isn't real until we finish setup, so we do it
    //  manually here).
    if (TP.sys.cfg('boot.show_ide')) {

        TP.elementRemoveClass(TP.byId('center', win, false), 'fullscreen');

        allDrawers = TP.byCSSPath('.north, .south, .east, .west',
                                    win,
                                    false,
                                    false);

        allDrawers.perform(
                    function(anElem) {
                        TP.elementRemoveAttribute(
                                    anElem, 'pclass:hidden', true);
                    });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('finishSetup',
function() {

    var viewDoc,

        worldTPElem,

        toggleKey;

        //sherpaEastDrawer,
        //tileDockTPElem,

        //sherpaWestDrawer;
        //snippetBarTPElem;

    //  Set up the HUD
    this.setupHUD();

    viewDoc = this.get('vWin').document;

    //  The World was set up on initial startup - set up the rest of the
    //  components. We do set up the World to observe when the HUD shows
    worldTPElem = TP.byId('SherpaWorld', viewDoc);
    worldTPElem.observe(TP.byId('SherpaHUD', viewDoc), 'HiddenChange');

    //  Set up the halo
    this.setupHalo();

    //  Set up the context menu
    this.setupContextMenu();

    //  Set up the console
    this.setupConsole();

    //  Set up the inspector
    this.setupInspector();

    //  Configure a toggle so we can always get back to just showing the app.
    toggleKey = TP.sys.cfg('sherpa.toggle_key');

    if (!toggleKey.startsWith('TP.sig.')) {
        toggleKey = 'TP.sig.' + toggleKey;
    }

    //  set up keyboard toggle to show/hide us
    /* eslint-disable no-wrap-func,no-extra-parens */
    (function() {
        this.toggle();
    }).bind(this).observe(TP.core.Keyboard, toggleKey);
    /* eslint-enable no-wrap-func,no-extra-parens */

    /*
    (function () {

        var testTile = TP.byId('Sherpa', this.get('vWin')).makeTile(
                                'detailTile',
                                TP.documentGetBody(this.get('vWin').document));

        testTile.toggle('hidden');

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.DOM_T_Up__TP.sig.DOM_T_Up');
    */

    /*
    sherpaEastDrawer = TP.byCSSPath('#east > .drawer', viewDoc, true);

    tileDockTPElem = sherpaEastDrawer.addContent(
                        TP.sherpa.tiledock.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML));
    tileDockTPElem.setID('tileDock');
    //tileDockTPElem.awaken();
    //tileDockTPElem.render();


    sherpaWestDrawer = TP.byCSSPath('#west > .drawer', viewDoc, true);

    snippetBarTPElem = sherpaWestDrawer.addContent(
                        TP.sherpa.snippetbar.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML));
    snippetBarTPElem.setID('snippetBar');
    //snippetBarTPElem.awaken();
    //snippetBarTPElem.render();
    */

    (function() {
        var tpElem;

        tpElem = TP.byCSSPath('#south > .drawer', viewDoc, true);
        tpElem.setAttribute('tibet:nomutationtracking', true);

        tpElem = TP.byCSSPath('#north > .drawer', viewDoc, true);
        tpElem.setAttribute('tibet:nomutationtracking', true);

        tpElem = TP.byId('center', viewDoc);
        tpElem.setAttribute('tibet:nomutationtracking', true);

        //  Hide the 'content' div
        TP.elementHide(TP.byId('content', viewDoc, false));

    }).fork(500);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('ConsoleCommand',
function(aSignal) {

    /**
     * @method handleConsoleCommand
     * @summary Handles signals that trigger console command execution.
     * @param {TP.sig.ConsoleCommand} aSignal The TIBET signal which triggered
     *     this method.
     */

    var consoleService,
        cmdText;

    consoleService = TP.bySystemId('SherpaConsoleService');
    cmdText = aSignal.at('cmdText');

    if (TP.notEmpty(cmdText) && TP.isValid(consoleService)) {
        consoleService.sendConsoleRequest(cmdText);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('FocusWorkbench',
function(aSignal) {

    /**
     * @method handleFocusWorkbench
     * @summary
     * @param {TP.sig.FocusWorkbench} aSignal The TIBET signal which triggered
     *     this method.
     */

    var northDrawer;

    northDrawer = TP.byId('north', this.get('vWin'));

    northDrawer.setAttribute('closed', false);

    TP.byId('SherpaInspector', this.get('vWin')).signal(
                                'InspectObject', aSignal.getPayload());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('TypeLoaded',
function(aSignal) {

    /**
     * @method handleTypeLoaded
     * @summary Handles signals that are triggered when a new type is loaded.
     * @param {TP.sig.ConsoleCommand} aSignal The TIBET signal which triggered
     *     this method.
     */

    var newType,
        typeName;

    newType = aSignal.getOrigin();
    if (!TP.isType(newType)) {
        //  TODO: Raise an exception here.
        return this;
    }

    //  If the new type is a subtype of TP.core.CustomTag, then we need to have
    //  the 'tibet:tofu' tag replace any occurrences of itself that are proxies
    //  for that new tag type.
    if (TP.isSubtypeOf(newType, TP.core.CustomTag)) {
        typeName = newType.getName();
        TP.tibet.tofu.replaceOccurrencesOf(typeName);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('makeTile',
function(anID, tileParent) {

    var tileTPElem,
        tileTemplateTPElem,

        parent;

    tileTemplateTPElem = TP.sherpa.tile.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML);

    parent = tileParent;

    if (!TP.isElement(parent) &&
        !TP.isKindOf(parent, TP.core.ElementNode)) {
        parent = TP.byId('commonTileLayer', this.get('vWin'));
    }

    tileTPElem = TP.wrap(parent).addContent(tileTemplateTPElem);

    tileTPElem.setID(anID);
    tileTPElem.awaken();
    tileTPElem.setup();

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupConsole',
function() {

    var uiDoc,

        consoleOutputTPElem,

        sherpaSouthDrawer,
        consoleInputTPElem,

        testAppender;

    uiDoc = this.get('vWin').document;

    //  We *must* set up the output first, since setting up the input will cause
    //  output to be logged.

    //  Create the <sherpa:consoleoutput> tag
    consoleOutputTPElem =
            TP.byId('center', uiDoc).addContent(
                    TP.sherpa.consoleoutput.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    consoleOutputTPElem.setAttribute('id', 'SherpaConsoleOutput');
    consoleOutputTPElem.setAttribute('panes', 'none');

    consoleOutputTPElem.awaken();

    //  Now we can set up the input

    sherpaSouthDrawer = TP.byCSSPath('#south > .drawer', uiDoc, true);

    consoleInputTPElem = sherpaSouthDrawer.addContent(
                    TP.sherpa.console.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    consoleInputTPElem.setup();

    //  NB: The console observes the HUD when it's done loading it's editor,
    //  etc.

    //  Install log appenders that know how to render logging entries to the
    //  Sherpa.

    TP.getDefaultLogger().addAppender(TP.log.SherpaAppender.construct());
    APP.getDefaultLogger().addAppender(TP.log.SherpaAppender.construct());

    //  Effectively replace the test logger's appenders with just ours.

    TP.getLogger(TP.TEST_LOG).clearAppenders();

    testAppender = TP.log.SherpaTestAppender.construct();
    testAppender.setLayout(TP.log.SherpaTestLogLayout.construct());
    TP.getLogger(TP.TEST_LOG).addAppender(testAppender);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupContextMenu',
function() {

    var uiDoc,
        contextMenuTPElem;

    uiDoc = this.get('vWin').document;

    contextMenuTPElem = TP.byId('center', uiDoc).addContent(
                    TP.sherpa.contextmenu.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    contextMenuTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupHalo',
function() {

    var uiDoc,
        haloTPElem;

    uiDoc = this.get('vWin').document;

    haloTPElem = TP.byId('center', uiDoc).addContent(
                    TP.sherpa.halo.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    haloTPElem.setup();
    haloTPElem.observe(TP.byId('SherpaHUD', this.get('vWin')),
                        TP.ac('HiddenChange',
                                'DrawerCloseWillChange',
                                'DrawerCloseDidChange'));

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupHUD',
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

TP.core.Sherpa.Inst.defineMethod('setupInspector',
function() {

    var inspectorTPElem;

    inspectorTPElem = TP.byId('SherpaInspector', this.get('vWin'));
    inspectorTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupWorld',
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
    worldElem = TP.documentConstructElement(
                    uiDoc, 'sherpa:world', TP.w3.Xmlns.SHERPA);
    TP.elementSetAttribute(worldElem, 'id', 'SherpaWorld');

    //  Append the <sherpa:world> tag into the loaded Sherpa document.
    TP.xmlElementInsertContent(
            TP.byId('center', uiScreensWin, false),
            worldElem,
            TP.AFTER_BEGIN,
            null);

    //  Grab the 1...n 'prebuilt' iframes that are available in the Sherpa
    //  template. Create a <sherpa:screen> tag and wrap them in it and place
    //  that screen tag into the world.
    uiScreenIFrames = TP.byCSSPath('.center iframe', uiScreensWin, false, false);
    uiScreenIFrames.perform(
            function(anIFrameElem) {
                var elem;

                //  Wrap each iframe inside of a 'sherpa:screen' element
                elem = TP.documentConstructElement(uiDoc,
                                                'sherpa:screen',
                                                TP.w3.Xmlns.SHERPA);

                TP.nodeAppendChild(elem, anIFrameElem, false);
                TP.nodeAppendChild(worldElem, elem, false);
            });

    //  Get the number of actual iframes vs. the number of screens configured by
    //  the user as the desired number of iframes (defaulting to 1).
    numIFrames = uiScreenIFrames.getSize();
    configNumIFrames = TP.ifInvalid(1, TP.sys.cfg('sherpa.num_screens'));

    //  If there are not enough screens, according to the number configured by
    //  the user, create more.
    if (configNumIFrames > numIFrames) {
        for (i = 0; i < configNumIFrames - numIFrames; i++) {
            screenElem = TP.documentConstructElement(uiDoc,
                                                    'sherpa:screen',
                                                    TP.w3.Xmlns.SHERPA);
            iFrameElem = TP.documentConstructElement(uiDoc,
                                                    'iframe',
                                                    TP.w3.Xmlns.XHTML);

            TP.nodeAppendChild(screenElem, iFrameElem, false);
            TP.nodeAppendChild(worldElem, screenElem, false);
        }
    }

    //  Grab the <sherpa:world> tag and set it up.
    worldTPElem = TP.byId('SherpaWorld', uiScreensWin);
    worldTPElem.setup();

    //  Hide the 'content' div
    TP.elementHide(TP.byId('content', uiScreensWin, false));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('postPatch',
function(patchText, patchVirtualPath, onsuccess, onfailure) {

    var patchURL,

        postRequest;

    if (TP.isEmpty(patchText)) {
        return;
    }

    patchURL = TP.uc(TP.sys.cfg('tds.patch.uri'));
    if (TP.notValid(patchURL)) {
        TP.error('Unable to create URL for patch server.');
        return;
    }

    if (TP.isEmpty(patchVirtualPath)) {
        TP.error('Unable to locate source path for function.');
        return;
    }

    postRequest = patchURL.constructRequest(
                    TP.hc('async', false, 'mimetype', TP.JSON_ENCODED));

    patchURL.setResource(TP.hc('type', 'patch',
                                'nowatch', true,
                                'target', patchVirtualPath,
                                'content', patchText));

    patchURL.save(postRequest);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('toggle',
function() {

    var elem;

    elem = TP.byId('SherpaHUD', this.get('vWin'));
    if (TP.isValid(elem)) {
        elem.toggle('hidden');
    }

    return this;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
