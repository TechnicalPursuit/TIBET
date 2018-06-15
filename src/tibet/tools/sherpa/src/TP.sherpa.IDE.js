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
 * @type {TP.sherpa.IDE}
 */

//  ============================================================================
//  TP.sherpa.IDE
//  ============================================================================

TP.lang.Object.defineSubtype('sherpa.IDE');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var toggleKey;

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

    //  Make sure the toggle key signal starts with 'TP.sig.' so that the
    //  observation works properly (specific-key observations need the full
    //  name).
    if (!toggleKey.startsWith('TP.sig.')) {
        toggleKey = 'TP.sig.' + toggleKey;
    }

    //  Set up keyboard toggle to show/hide the Sherpa
    (function() {
        TP.signal(null, 'ToggleSherpa');
    }).observe(TP.core.Keyboard, toggleKey);

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Type.defineMethod('hasStarted',
function() {

    /**
     * @method hasStarted
     * @summary Whether or not the Sherpa itself has started (i.e. is installed
     *     and is ready).
     * @returns {Boolean} Whether or not the Sherpa is ready.
     */

    var inst;

    inst = TP.bySystemId('Sherpa');

    return TP.isValid(inst) && TP.isTrue(inst.get('setupComplete'));
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Type.defineMethod('isOpen',
function() {

    /**
     * @method isOpen
     * @summary Whether or not the Sherpa is 'open' (i.e. has started and its
     *     HUD component is currently showing).
     * @returns {Boolean} Whether or not the Sherpa is open.
     */

    var elem;

    elem = TP.byId('SherpaHUD', TP.win('UIROOT'));
    if (TP.isValid(elem)) {
        return !elem.hasAttribute('pclass:closed');
    }

    return false;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Type.defineMethod('replaceWithUnknownElementProxy',
function(anElement) {

    /**
     * @method replaceWithUnknownElementProxy
     * @summary This method, invoked from the core TIBET tag processing
     *     machinery if the Sherpa is loaded and running in the current system,
     *     will replace the supplied element with a stand in (a so-called 'tofu'
     *     element) that represents an element type that is not yet known to the
     *     system.
     * @param {Element} anElement The element to replace.
     * @returns {TP.meta.sherpa.IDE} The receiver.
     */

    var newTagContent,
        newElement;

    newTagContent = TP.str(anElement);

    //  Build a chunk of markup that is a 'sherpa:tofu' element with identifying
    //  information about the element that it is standing in for.
    newElement = TP.xhtmlnode(
        '<sherpa:tofu on:click="TagAssist"' +
                ' proxyfor="' + TP.name(anElement) + '">' +
            '<span class="name">' +
                '&lt;' + TP.name(anElement) + '... /&gt;' +
            '</span>' +
            '<span class="content">' +
                '<![CDATA[' +
                newTagContent +
                ']]>' +
            '</span>' +
        '</sherpa:tofu>');

    TP.elementReplaceWith(anElement, newElement);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the view window (i.e. the window containing the sherpa)
TP.sherpa.IDE.Inst.defineAttribute('vWin');

//  whether or not our setup is complete
TP.sherpa.IDE.Inst.defineAttribute('setupComplete');

//  whether or not the Sherpa should process mutations to the DOM of the
//  current UI canvas and update the source DOM that is represented there.
TP.sherpa.IDE.Inst.defineAttribute('shouldProcessDOMMutations');

//  a timeout that will cause the 'shouldProcessDOMMutations' flag to be reset
//  to false. This is needed because the Mutation Observer machinery that we use
//  to manage changes to the source DOM is an asynchronous mechanism and the
//  shouldProcessDOMMutations flag is used by this machinery to determine
//  whether or not to update the source DOM of the current UI canvas.
TP.sherpa.IDE.Inst.defineAttribute('$shouldProcessTimeout');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.IDE} The receiver.
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

    //  Set up our window. By default, the Sherpa exists in the UIROOT window.
    win = TP.win('UIROOT');
    this.set('vWin', win);

    //  Set the flag that will determine whether or not we're processing DOM
    //  mutations for the current UI DOM mutations.
    this.set('shouldProcessDOMMutations', false);

    //  Set up the World
    this.setupWorld();

    //  Based on the setting of this flag, we show or hide the center area and
    //  the drawers (the HUD isn't real until we finish setup, so we show or
    //  hide it manually here).
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

    //  Even if we showed our drawers above because of the 'boot.show_ide' flag,
    //  we need to flag ourself not completely loaded yet.
    this.set('setupComplete', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('asTP_sherpa_pp',
function() {

    /**
     * @method asTP_sherpa_pp
     * @summary Returns a String compatible with other productions in the
     *     TP.sherpa.pp formatting type.
     * @returns {String} The receiver as a String producing output compatible
     *     with TP.sherpa.pp type.
     */

    return '';
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('computeMutableStyleSheet',
function(startTPElement) {

    /**
     * @method computeMutableStyleSheet
     * @summary Starting at the supplied element, this method computes the
     *     'nearest' mutable style sheet that rules affecting the element could
     *     be placed in. By default, this will be the nearest templated tag
     *     ancestor of the supplied element.
     * @param {TP.dom.ElementNode} startTPElement The element to start searching
     *     'upwards' through the ancestor hierarchy for mutable style sheets.
     * @returns {CSSStyleSheet} The nearest mutable style sheet to the supplied
     *      element.
     */

    var ancestors,

        doc,

        len,
        i,

        currentTPElem,

        styleURI,
        styleLoc,
        styleElem;

    //  Get the supplied element's ancestor chain and build a list from that.
    ancestors = startTPElement.getAncestors();

    doc = TP.sys.uidoc(true);

    len = ancestors.getSize();
    for (i = 0; i < len; i++) {
        currentTPElem = ancestors.at(i);

        if (currentTPElem.sherpaShouldAlterStyle()) {

            styleURI = currentTPElem.getType().getResourceURI(
                                                'style', TP.ietf.mime.CSS);

            //  If the style URI doesn't end in '.css', then continue.
            if (styleURI.getExtension() !== 'css') {
                continue;
            }

            styleLoc = styleURI.getLocation();

            //  First, look to see if there's a generated <style> element in the
            //  UI canvas document for the type of the element that we found.
            //  Note that we make sure to go after only HTML style elements
            //  here.
            styleElem = TP.byCSSPath(
                        'html|style[tibet|originalhref="' + styleLoc + '"]',
                        doc,
                        true,
                        false);

            if (TP.isElement(styleElem)) {
                return TP.cssElementGetStyleSheet(styleElem);
            }
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('finishSetup',
function(finalizationFunc) {

    /**
     * @method finishSetup
     * @summary Finishes the Sherpa setup process by setting up all of the
     *     Sherpa's tools and configuring its drawers.
     * @param {Function} finalizationFunc The Function to execute when the setup
     *     is truly finished.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var viewDoc,
        thisref,
        worldTPElem;

    //  Set up the HUD. NOTE: This *must* be set up first - other components
    //  will rely on finding it when they awaken.
    this.setupHUD();

    //  The document that we were installed into.
    viewDoc = this.get('vWin').document;

    //  The World was set up on initial startup - set up the rest of the
    //  components. We do set up the World to observe when the HUD shows
    worldTPElem = TP.byId('SherpaWorld', viewDoc);
    worldTPElem.observe(TP.byId('SherpaHUD', viewDoc), 'ClosedChange');

    //  Set up any signal observations for Sherpa-wide handling.
    this.setupObservations();

    //  Set up the console
    this.setupConsole();

    //  Set up the context menu
    this.setupContextMenu();

    //  Set up the halo
    this.setupHalo();

    //  NB: We set these up *after* the halo is set up.

    //  Set up the outliner
    this.setupOutliner();

    //  Set up the workbench
    this.setupWorkbench();

    //  Set up the inspector
    this.setupInspector();

    //  Set up the thumbnail viewer
    this.setupThumbnail();

    //  Set up the property adjuster
    this.setupAdjuster();

    //  Set up the mutation observer that manages keeping all of the DOM and
    //  markup that we're managing in sync.
    this.setupBuilderObserver();

    //  Configure the north and south drawers to not track mutations for
    //  performance (we don't use mutation signals there anyway) and to set up
    //  the console service's keyboard state machine. Note that we do this in a
    //  fork to let the system do a GUI refresh to show initializng status,
    //  etc.
    thisref = this;
    setTimeout(function() {
        var tpElem,
            consoleService;

        tpElem = TP.byCSSPath('#south > .drawer', viewDoc, true);
        tpElem.setAttribute('tibet:nomutationtracking', false);

        tpElem = TP.byCSSPath('#north > .drawer', viewDoc, true);
        tpElem.setAttribute('tibet:nomutationtracking', false);

        tpElem = TP.byId('center', viewDoc);
        tpElem.setAttribute('tibet:nomutationtracking', true);

        //  Make sure to refresh all of the descendant document positions for
        //  the UI canvas.
        TP.nodeRefreshDescendantDocumentPositions(TP.sys.uidoc(true));

        consoleService = TP.bySystemId('SherpaConsoleService');

        //  Now that all components have loaded (and possibly installed state
        //  machine responders into the console service's state machine),
        //  activate the console service's state machine.
        consoleService.get('keyboardStateMachine').activate();

        //  Also, set the variable that will represent the UI canvas. This will
        //  switch as different screens are selected.
        consoleService.get('model').setVariable(
            'UICANVAS',
            worldTPElem.get('selectedScreen').getContentWindow());

        thisref.set('setupComplete', true);

        //  If a finalization Function was supplied, execute it.
        if (TP.isCallable(finalizationFunc)) {
            finalizationFunc();
        }

    }, TP.sys.cfg('sherpa.setup.delay', 250));

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('getToolsLayer',
function() {

    /**
     * @method getToolsLayer
     * @summary Returns the layer used to put certain tools, like the halo, on.
     * @returns {TP.html.div} The 'tools layer' element.
     */

    var viewDoc,
        contentTPElem;

    //  The document that we were installed into.
    viewDoc = this.get('vWin').document;

    //  The 'tools layer' is the 'content' div, until we boot.
    contentTPElem = TP.byId('content', viewDoc);

    //  If the content element hasn't been 'converted to being the tools layer',
    //  do so now and show it.
    if (!contentTPElem.hasAttribute('isToolsLayer')) {
        contentTPElem.setAttribute('isToolsLayer', 'true');
        contentTPElem.show();
    }

    return contentTPElem;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('getToolsLayerOffsetFromScreen',
function(aScreenTPElement) {

    /**
     * @method getToolsLayerOffsetFromScreen
     * @summary Returns the 'offset' from the tools layer to the supplied
     *     screen. This can used in computations that require drawing on the
     *     tools layer from coordinates computed inside of a particular screen.
     * @param {TP.sherpa.screen} aScreenTPElement The screen element to compute
     *     the offset to the tool layer for.
     * @returns {Number[]} The X and Y offset to be used in computations
     */

    var viewDoc,

        screenTPElem,
        screenGlobalRect,

        centerTPElem,
        centerGlobalRect,

        screenToContentDiffX,
        screenToContentDiffY,

        contentTPElem,
        contentGlobalRect,

        contentToCenterDiffX,
        contentToCenterDiffY,

        offset;

    //  The document that we were installed into.
    viewDoc = this.get('vWin').document;

    //  If no valid screen element was supplied, just return 0,0 as the offsets
    screenTPElem = aScreenTPElement;
    if (TP.notValid(screenTPElem)) {
        return TP.ac(0, 0);
    }

    //  Grab the screen element's global rectangle.
    screenGlobalRect = screenTPElem.getGlobalRect();

    //  The 'center' element is the common parent for the world and the tools
    //  layer.
    centerTPElem = TP.byId('center', TP.win('UIROOT'));

    //  Grab the center element's global rectangle.
    centerGlobalRect = centerTPElem.getGlobalRect();

    //  The 'tools layer' is the 'content' div, until we boot.
    contentTPElem = TP.byId('content', viewDoc);

    //  Grab the tool layer element's global rectangle.
    contentGlobalRect = contentTPElem.getGlobalRect();

    //  Compute the difference between the screen and content X and Y
    screenToContentDiffX = screenGlobalRect.getX() -
                            contentGlobalRect.getX();
    screenToContentDiffY = screenGlobalRect.getY() -
                            contentGlobalRect.getY();

    //  And the difference between the content and center X and Y
    contentToCenterDiffX = contentGlobalRect.getX() - centerGlobalRect.getX();
    contentToCenterDiffY = contentGlobalRect.getY() - centerGlobalRect.getY();

    //  Add the differences together and use those as the X and Y offsets.
    offset = TP.ac(
        screenToContentDiffX + contentToCenterDiffX,
        screenToContentDiffY + contentToCenterDiffY
    );

    return offset;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('ConsoleCommand',
function(aSignal) {

    /**
     * @method handleConsoleCommand
     * @summary Handles signals that trigger console command execution.
     * @param {TP.sig.ConsoleCommand} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var consoleService,
        cmdText;

    //  Grab the console service. This gives us access to the currently active
    //  shell.
    consoleService = TP.bySystemId('SherpaConsoleService');

    //  Grab the command text to execute from the signal.
    cmdText = aSignal.at('cmdText');

    //  If it's real and we were able to find the console server, then send the
    //  console request.
    if (TP.notEmpty(cmdText) && TP.isValid(consoleService)) {
        consoleService.sendConsoleRequest(cmdText);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('RemoteConsoleCommand',
function(aSignal) {

    /**
     * @method handleRemoteConsoleCommand
     * @summary Handles signals that trigger remote console command execution.
     * @param {TP.sig.RemoteConsoleCommand} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var consoleService,
        cmdText,

        originalRequest,
        originalArgs,

        req,

        successFunc,
        failFunc,

        updateRequest;

    //  Grab the console service. This gives us access to the currently active
    //  shell.
    consoleService = TP.bySystemId('SherpaConsoleService');

    //  The original request will be the one that got built when the user
    //  invoked the command locally in the TSH.
    originalRequest = aSignal.at('originalRequest');

    //  Grab the 'local name' of the original request's command node. This will
    //  give us the command that they were attempting to execute on the client.
    cmdText = TP.lname(originalRequest.at('cmdNode'));

    //  Prepend ':cli' onto it. When executed, this command will route the
    //  original command over to the server-side for server execution.
    cmdText = ':cli ' + cmdText;

    //  Gather up the arguments from the original request (using the
    //  consoleService's 'model' - i.e. the TSH).
    originalArgs = consoleService.get('model').getArguments(originalRequest);

    //  Iterate over the ARGV, processing any unnamed arguments
    originalArgs.at('ARGV').forEach(
            function(argName) {
                cmdText += ' ' + argName;
            });

    //  This is a TP.core.Hash - iterate over it and gather up the arguments.
    originalArgs.perform(
            function(kvPair) {
                var argName,
                    argValue;

                argName = kvPair.first();
                argValue = kvPair.last();

                //  We already processed ARGV above, which includes all ARG*
                //  arguments.
                if (/^ARG/.test(argName)) {
                    return;
                }

                //  Note that we only gather arguments that are 'tsh:'
                //  arguments.
                if (argName.startsWith('tsh:')) {

                    //  Slice off the 'tsh:'
                    argName = argName.slice(4);

                    cmdText += ' --' + argName + '=\'' + argValue + '\'';
                }
            });

    //  If it's real and we were able to find the console server, then send the
    //  console request.
    if (TP.notEmpty(cmdText) && TP.isValid(consoleService)) {

        //  Send the now rewritten command (prepended with ':cli') to the
        //  console service (which will send it onto the TSH) for processing.
        req = consoleService.sendConsoleRequest(cmdText);

        //  If the supplied signal had 'success' and/or 'failure' handler
        //  Function(s) configured, then configure the just-fired request to
        //  invoke them when it either succeeds or fails.
        successFunc = aSignal.at(TP.ONSUCCESS);
        failFunc = aSignal.at(TP.ONFAIL);

        if (TP.isCallable(successFunc) ||
            TP.isCallable(failFunc)) {

            //  A request that will be configured with succeeded/failed handlers
            //  to call whatever the supplied signal supplied as success and/or
            //  failure handler.
            updateRequest = TP.request();

            //  Install a success handler if a success Function was supplied.
            if (TP.isCallable(successFunc)) {
                updateRequest.defineHandler(
                                'RequestSucceeded',
                                function(aResponse) {
                                    successFunc(aResponse);
                                });
            }

            //  Install a failure handler if a failure Function was supplied.
            if (TP.isCallable(failFunc)) {
                updateRequest.defineHandler(
                                'RequestFailed',
                                function(aResponse) {
                                    failFunc(aResponse);
                                });
            }

            //  Join the update request onto the request that was sent to the
            //  console service for processing. This will cause it to be
            //  performed upon completion of that request.
            updateRequest.andJoinChild(req);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('AssistObject',
function(aSignal) {

    /**
     * @method handleAssistObject
     * @summary Handles signals that trigger an 'object assistant'.
     * @description Some objects (including console commands) fire this signal
     *     when they want the Sherpa to present an 'object assistant' in a modal
     *     dialog box.
     * @param {TP.sig.AssistObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var targetObj,
        assistantContentTPElem,

        dialogPromise;

    //  Grab the target object from the signal's payload
    targetObj = aSignal.getPayload().at('targetObject');

    if (TP.notValid(targetObj)) {
        //  TODO: Raise an exception here.
        return this;
    }

    //  Grab the assistant content
    assistantContentTPElem = TP.wrap(TP.getContentForAssistant(targetObj));

    //  If we got valid assistant content, then show a dialog with it.
    if (TP.isValid(assistantContentTPElem)) {

        dialogPromise = TP.dialog(
            TP.hc(
                'dialogID', 'CmdAssistantDialog',
                'isModal', true,
                'title', aSignal.getPayload().at('title'),
                'templateContent', assistantContentTPElem));

        //  After the dialog is showing, set the assistant parameters on the
        //  content object from those defined in the original signal's payload.
        dialogPromise.then(
            function(aDialogTPElem) {

                var contentTPElem;

                contentTPElem = aDialogTPElem.get('bodyGroup').
                                                    getFirstChildElement();

                contentTPElem.set('assistantParams',
                                    aSignal.getPayload().at('assistantParams'));
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @description Note that this handler fires because the Sherpa is in the
     *     controller stack and this signal is sent through there as well as its
     *     direct observers.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var world,
        currentScreenTPWin,

        canvasDoc;

    //  Set up managed mutation observer machinery that uses our
    //  'processUICanvasMutationRecords' method to manage changes to the UI
    //  canvas.

    if (!this.get('setupComplete')) {
        return this;
    }

    if (TP.sys.isTesting()) {
        return this;
    }

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();

    //  Make sure to refresh all of the descendant document positions for the UI
    //  canvas.
    canvasDoc = currentScreenTPWin.getNativeDocument();
    TP.nodeRefreshDescendantDocumentPositions(canvasDoc);

    //  Grab the canvas document and observe mutation style change signals from
    //  it.
    this.observe(TP.wrap(canvasDoc), 'TP.sig.MutationStyleChange');

    TP.activateMutationObserver(canvasDoc, 'BUILDER_OBSERVER');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var world,
        currentScreenTPWin,

        canvasDoc;

    if (TP.sys.isTesting()) {
        return this;
    }

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();

    canvasDoc = currentScreenTPWin.getNativeDocument();

    //  Grab the canvas document and ignore mutation style change signals from
    //  it.
    this.ignore(TP.wrap(canvasDoc), 'TP.sig.MutationStyleChange');

    TP.deactivateMutationObserver('BUILDER_OBSERVER');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('DOMDragDown',
function(aSignal) {

    /**
     * @method handleDOMDragDown
     * @summary Handles notification of when the receiver might need to start a
     *     connection session.
     * @param {TP.sig.DOMDragDown} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var connector;

    connector = TP.byId('SherpaConnector', TP.win('UIROOT'));
    if (TP.notValid(connector)) {
        return this;
    }

    //  If the Shift key is down and the Alt key is as well, then start a
    //  connector session.
    if (aSignal.getShiftKey() && aSignal.getAltKey()) {
        connector.startConnecting(aSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('EditObject',
function(aSignal) {

    /**
     * @method handleEditObject
     * @summary Handles signals that trigger the inspector's object editing
     *     capabilities.
     * @param {TP.sig.EditObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var northDrawer;

    //  Open the north drawer
    northDrawer = TP.byId('north', this.get('vWin'));
    northDrawer.setAttribute('closed', false);

    //  Signal the inspector to focus itself for editing on the target object
    //  supplied in the payload.
    TP.byId('SherpaInspector', this.get('vWin')).signal(
                            'FocusInspectorForEditing', aSignal.getPayload());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('InspectObject',
function(aSignal) {

    /**
     * @method handleInspectObject
     * @summary Handles signals that trigger the inspector's object inspection
     *     capabilities.
     * @param {TP.sig.InspectObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var northDrawer,
        isClosed,

        drawerIsOpenFunc;

    //  Open the north drawer
    northDrawer = TP.byId('north', this.get('vWin'));

    isClosed = TP.bc(northDrawer.getAttribute('closed'));

    if (isClosed) {
        drawerIsOpenFunc = function(transitionSignal) {

            //  Turn off any future notifications.
            drawerIsOpenFunc.ignore(northDrawer, 'TP.sig.DOMTransitionEnd');

            //  Signal the inspector to focus itself for browsing on the target
            //  object supplied in the payload.
            TP.byId('SherpaInspector', this.get('vWin')).signal(
                    'FocusInspectorForBrowsing',
                    aSignal.getPayload());

        }.bind(this);

        drawerIsOpenFunc.observe(northDrawer, 'TP.sig.DOMTransitionEnd');

        northDrawer.setAttribute('closed', false);
    } else {
        //  Signal the inspector to focus itself for browsing on the target
        //  object supplied in the payload.
        TP.byId('SherpaInspector', this.get('vWin')).signal(
                'FocusInspectorForBrowsing',
                aSignal.getPayload());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('MutationStyleChange',
function(aSignal) {

    /**
     * @method handleMutationStyleChange
     * @summary Handles notifications of node style changes from the overall
     *     canvas that the Sherpa is working with.
     * @param {TP.sig.MutationStyleChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var mutatedRule,

        operation,

        results,
        ownerSheet,
        ruleIndex,

        loc,
        sheetURI,

        ownerElem,

        shouldRefresh,
        currentResource,
        currentContent,
        finalContent,

        lastNSIndex,
        endOfLastNSIndex,
        beforeNSContent,
        afterNSContent,

        sheetRules,
        preRuleSelectorCount,
        i,

        rules,

        str,

        matcher,
        match,

        startIndex,
        endIndex,
        ruleText,
        propertyMatcher,

        newStr,
        newContent,
        patch;

    //  The native CSSRule object that mutated is in the signal
    mutatedRule = aSignal.at('mutatedRule');

    //  If there is no mutated rule, (which will happen if the signal isn't a
    //  TP.sig.MutationStylePropertyChange or TP.sig.MutationStyleRuleChange)
    //  then exit here.
    if (TP.notValid(mutatedRule)) {
        return this;
    }

    operation = aSignal.at('operation');

    //  Make sure we get *all* the rules here (i.e. we do *not* filter for
    //  CSSRule.STYLE_RULE types of rules). Later on, we grab all of the rules
    //  from the stylesheet and want the rule index to match up.
    results = TP.styleRuleGetStyleSheetAndIndex(mutatedRule, false);

    ownerSheet = results.first();
    ruleIndex = results.last();

    //  Grab its location and make a URI.
    loc = TP.styleSheetGetLocation(ownerSheet);
    sheetURI = TP.uc(loc);

    if (!TP.isURI(sheetURI)) {
        //  TODO: Raise an exception
        return this;
    }

    ownerElem = TP.styleSheetGetOwnerNode(ownerSheet);

    //  Load the URI's content if it isn't already loaded and obtain it.
    shouldRefresh = !sheetURI.isLoaded();
    currentResource = sheetURI.getResource(
                        TP.hc('refresh', shouldRefresh, 'async', false));

    //  NB: We'll get a CSS stylesheet content object here - we want its String.
    currentContent = currentResource.get('result').asString();

    //  Before we try to match any existing rules of type CSSRule.STYLE_RULE in
    //  the sheet, see what kind of rule we have here. If it's an @namespace
    //  rule or a @import rule, then all we can do is insert those as new rules
    //  anyway and we can handle that process here.
    if (mutatedRule.type === CSSRule.NAMESPACE_RULE ||
        mutatedRule.type === CSSRule.IMPORT_RULE) {

        if (operation === TP.CREATE) {

            //  If it's an @import rule, then we place it before any other rules
            //  in the content
            if (mutatedRule.type === CSSRule.IMPORT_RULE) {
                finalContent = mutatedRule.cssText + '\n' + currentContent;
            } else if (mutatedRule.type === CSSRule.NAMESPACE_RULE) {

                //  Otherwise, find the index of the last occurrence of
                //  @namespace declaration.
                lastNSIndex = currentContent.lastIndexOf('@namespace');

                //  Now, search for its corresponding ');', relative to that
                //  last index. Add 2 to account for the size of ');'.
                endOfLastNSIndex = currentContent.indexOf(');', lastNSIndex) + 2;

                //  Slice off all of the content that occurs before the last
                //  occurrence of @namespace declaration.
                beforeNSContent = currentContent.slice(0, endOfLastNSIndex + 1);

                //  Slice off all of the content that occurs after the last
                //  occurrence of @namespace declaration and its content.
                afterNSContent = currentContent.slice(endOfLastNSIndex + 1);

                //  Assemble the final content by piecing the before and after
                //  pieces with the cssText of the mutated rule.
                finalContent = beforeNSContent +
                                mutatedRule.cssText + '\n' +
                                afterNSContent;
            }

            //  Stamp the owner element with a 'tibet:dontreload' attribute so
            //  that the style element will *not* reload when it receives a
            //  change notification due to its underlying content changing.
            TP.elementSetAttribute(ownerElem, 'tibet:dontreload', 'true', true);

            //  Set the resource of the sheetURI. This should dirty it.
            sheetURI.setResource(finalContent);

            //  Remove the 'tibet:dontreload' attribute from the owner element
            //  so that it will now reload when its content changes.
            TP.elementRemoveAttribute(ownerElem, 'tibet:dontreload', true);

            return this;
        } else {
            //  TODO: Raise an exception
            return this;
        }
    }

    //  If we didn't find a matching rule to update, then if the operation is
    //  TP.CREATE, we can just append the new rule to the URI content matching
    //  the sheet's location.
    if (ruleIndex === TP.NOT_FOUND) {

        if (operation === TP.CREATE) {

            //  Grab all of the declarations for the mutated rule, split them
            //  and join them back together with newlines to match TIBET
            //  formatting rules.
            rules = TP.styleRuleGetDeclarationsSource(mutatedRule).split(';');
            str = rules.join(';\n');

            //  Build up a content chunk that can be appended to the URI content
            //  matching the sheet's location.
            str = mutatedRule.selectorText + '\n{\n' + str + '}\n';
            finalContent = currentContent + '\n' + str;

            //  Stamp the owner element with a 'tibet:dontreload' attribute so
            //  that the style element will *not* reload when it receives a
            //  change notification due to its underlying content changing.
            TP.elementSetAttribute(ownerElem, 'tibet:dontreload', 'true', true);

            //  Set the resource of the sheetURI. This should dirty it.
            sheetURI.setResource(finalContent);

            //  Remove the 'tibet:dontreload' attribute from the owner element
            //  so that it will now reload when its content changes.
            TP.elementRemoveAttribute(ownerElem, 'tibet:dontreload', true);

            return this;
        } else {
            //  TODO: Raise an exception
            return this;
        }
    }

    //  Look for the rule by using the selector text

    //  We need to see if there are rules 'higher up' in the sheet that have the
    //  same selector as the mutated rule and, therefore, adjust the string that
    //  we look for to compute the match.

    //  First, iterate on the sheet's rules from 0 to the ruleIndex, checking
    //  each selector against our mutated rule's selector. If one matches, kick
    //  the match counter.

    //  NB: Note how we do *not* expand imports here and we do *not* filter for
    //  CSSRule.STYLE_RULE types of rules.
    sheetRules = TP.styleSheetGetStyleRules(ownerSheet, false, false);

    preRuleSelectorCount = 0;

    //  Iterate up *through the rule just before our mutated rule*
    for (i = 0; i < ruleIndex; i++) {
        if (sheetRules.at(i).selectorText === mutatedRule.selectorText) {
            preRuleSelectorCount++;
        }
    }

    str = mutatedRule.selectorText + ' {';

    //  Generate a matcher RegExp
    matcher = TP.rc(RegExp.escapeMetachars(
                    str.replace(/[\u0009\u000A\u0020\u000D]+/g, 'SECRET_SAUCE')).
                        replace(/SECRET_SAUCE/g, '\\s*'), 'g');

    //  Kick the match count once so that, if we didn't find any matching
    //  selectors 'ahead' of us in the file, we'll match our lone selector
    //  occurrence.
    preRuleSelectorCount++;
    for (i = 0; i < preRuleSelectorCount; i++) {
        //  Find the rule text start in the content by matching using the
        //  generated RegExp.
        match = matcher.exec(currentContent);

        //  Adjust the lastIndex to start the next exec() after the matched
        //  rule.
        matcher.lastIndex = currentContent.indexOf('}', match.index) + 1;
    }

    //  If no match could be found, exit here.
    if (TP.notValid(match)) {
        //  TODO: Raise an exception
        return this;
    }

    //  The rule text starts where the match was made and ends at the trailing
    //  bracket ('}');
    startIndex = match.index;
    endIndex = currentContent.indexOf('}', startIndex) + 1;

    //  Grab the rule text
    ruleText = currentContent.slice(startIndex, endIndex);

    //  Generate a RegExp that will match the name of the mutated property and
    //  it's declaration through the semicolon (';').
    propertyMatcher = TP.rc(aSignal.at('mutatedProperty') +
                            '\\s*:.+;[\\n\\r]?');

    //  Switch on the operation performed.
    switch (operation) {
        case TP.CREATE:
            //  If we're creating a new property, just splice it in before the
            //  closing brace ('}') for the whole rule.
            newStr = ruleText.slice(0, -1) +
                        aSignal.at('mutatedProperty') + ': ' +
                        aSignal.at(TP.NEWVAL) + ';\n';
            newStr += '}';
            break;
        case TP.UPDATE:
            //  If we're updating an existing property, using the property
            //  matcher RegExp we generated above to replace the property's
            //  value with the new value.
            newStr = ruleText.replace(
                        propertyMatcher,
                        aSignal.at('mutatedProperty') + ': ' +
                        aSignal.at(TP.NEWVAL) + ';\n');
            break;
        case TP.DELETE:
            //  If we're updating an existing property, using the property
            //  matcher RegExp we generated above to replace the property's
            //  value with the empty String.
            newStr = ruleText.replace(propertyMatcher, '');
            break;
        default:
            break;
    }

    //  Splice the newly generated content into the current content.
    newContent = currentContent.slice(0, startIndex) +
                    newStr +
                    currentContent.slice(endIndex);

    //  Generate a patch against the existing content and then immediately apply
    //  the patch.
    patch = TP.extern.JsDiff.createPatch(loc, currentContent, newContent);
    finalContent = TP.extern.JsDiff.applyPatch(currentContent, patch);

    //  Stamp the owner element with a 'tibet:dontreload' attribute so that the
    //  style element will *not* reload when it receives a change notification
    //  due to its underlying content changing.
    TP.elementSetAttribute(ownerElem, 'tibet:dontreload', 'true', true);

    //  Set the resource of the sheetURI. This should dirty it.
    sheetURI.setResource(finalContent);

    //  Remove the 'tibet:dontreload' attribute from the owner element so that
    //  it will now reload when its content changes.
    TP.elementRemoveAttribute(ownerElem, 'tibet:dontreload', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('TypeLoaded',
function(aSignal) {

    /**
     * @method handleTypeLoaded
     * @summary Handles signals that are triggered when a new type is loaded.
     * @param {TP.sig.TypeLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var newType,
        typeName;

    newType = aSignal.getOrigin();
    if (!TP.isType(newType)) {
        //  TODO: Raise an exception here.
        return this;
    }

    //  If the new type is a subtype of TP.tag.CustomTag, then we need to have
    //  the 'sherpa:tofu' tag replace any occurrences of itself that are proxies
    //  for that new tag type.
    if (TP.isSubtypeOf(newType, TP.tag.CustomTag)) {
        typeName = newType.getName();
        TP.sherpa.tofu.replaceOccurrencesOf(typeName);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('RouteExit',
function(aSignal) {

    /**
     * @method handleRouteExit
     * @summary Handles when the route in the current UI canvas is changed and
     *     the current document content unloads.
     * @description Note that this handler fires because the Sherpa is in the
     *     controller stack and this signal is sent through there as well as its
     *     direct observers.
     * @param {TP.sig.RouteExit} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var sherpaDoc,
        halo;

    //  The document that we were installed into.
    sherpaDoc = this.get('vWin').document;

    halo = TP.byId('SherpaHalo', sherpaDoc);

    if (TP.isValid(halo)) {
        //  Note that we do not worry here whether the current target can be
        //  blurred or not. The screen content is changing and we can't stop it.
        halo.blur();
        halo.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('SherpaNotify',
function(aSignal) {

    /**
     * @method handleSherpaNotify
     * @summary Displays a notifier for the signal payload's message slot, if
     *     any.
     * @param {TP.sig.SherpaNotify} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var notifier,
        notifierContent,

        message,

        triggerTPDoc;

    notifier = TP.byId('SherpaNotifier', TP.win('UIROOT'));
    notifier.setStyleProperty(
                '--sherpa-notifier-fadeout-duration',
                TP.sys.cfg('sherpa.notifier_fadeout_duration', 5000) + 'ms');
    notifier.setStyleProperty(
                '--sherpa-notifier-fadeout-delay',
                TP.sys.cfg('sherpa.notifier_fadeout_delay', 5000) + 'ms');

    notifierContent = TP.byId('SherpaNotifierContent', this.get('vWin'));
    if (TP.notValid(notifierContent)) {
        return this;
    }

    message = aSignal.at('message');
    if (TP.notEmpty(message)) {
        notifierContent.setContent(
                        TP.xhtmlnode('<div>' + message + '</div>'));
    }

    triggerTPDoc = TP.tpdoc(this.get('vWin'));

    this.signal(
        'OpenNotifier',
        TP.hc(
            'overlayID', 'SherpaNotifier',
            'contentID', 'SherpaNotifierContent',
            'noPosition', true,
            'triggerTPDocument', triggerTPDoc));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('ToggleSherpa',
function(aSignal) {

    /**
     * @method handleToggleSherpa
     * @summary Handles signals that are triggered when the Sherpa is to be
     *     toggled.
     * @param {TP.sig.ToggleSherpa} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    this.toggle();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('makeCustomTagFrom',
function(aTPElem) {

    /**
     * @method makeCustomTagFrom
     * @summary Constructs a custom tag using the supplied element. This will
     *     invoke the 'type assistant' with the 'templatedtag' DNA selected.
     * @param {TP.dom.ElementNode} aTPElem The element content to make a custom
     *     tag from.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var newTagName,

        handler;

    //  We start the new tag name out with the application's namespace prefix
    //  and a ':'.
    newTagName = TP.sys.getApplication().getType().getNamespacePrefix() + ':';

    //  Fire a 'ConsoleCommand' with a ':tag --assist' command, supplying the
    //  name and the DNA for a templated tag.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText',
                        ':type --assist' +
                                ' --name=\'' + newTagName + '\'' +
                                ' --supertype=\'TP.tag.TemplatedTag\'' +
                                ' --dna=\'templatedtag\''
                ));

    //  Set up a handler that will wait for a 'TypeAdded' signal.
    handler = function(typeAddedSignal) {

        var elem,
            tagType,
            tagName,

            resourceURI,
            loc,

            serializationStorage,
            str,

            sherpaDoc;

        //  Make sure to unregister the handler - this is a one shot.
        handler.ignore(TP.ANY, 'TypeAdded');

        //  Grab the '<script>' node that was added for the newly defined tag
        //  type. This will supply our new tag name.
        elem = typeAddedSignal.at('node');

        //  Make sure that we can get a tag type with the supplied element and
        //  that it is a kind of templated tag.
        tagType = TP.scriptElementGetType(elem);

        //  Now, if it's a templated tag, we have to serialize and save a markup
        //  representation of supplied TP.dom.ElementNode as the new tag's
        //  template.
        if (TP.isKindOf(tagType, TP.tag.TemplatedTag)) {

            //  Create a tag name from the type's namespace prefix and local
            //  name.
            tagName = tagType.getNamespacePrefix() +
                        ':' +
                        tagType.getLocalName();

            //  Get the resource URI that we'll use to store it under.
            resourceURI = tagType.getResourceURI('template');

            loc = resourceURI.getLocation();

            //  Create a serialization storage object and populate the root
            //  store location with the resource URI.
            serializationStorage = TP.hc(
                                    'store', loc,
                                    'lockStore', true,
                                    'wantsPrefixedXMLNSAttrs', false);

            //  Run the serialization engine on it.
            aTPElem.serializeForStorage(serializationStorage);

            str = serializationStorage.at('stores').at(loc);
            str = '<' + tagName + '>\n' + str + '</' + tagName + '>';
            serializationStorage.at('stores').atPut(loc, str);

            //  The document that we were installed into.
            sherpaDoc = this.get('vWin').document;

            //  Save the template to the file system. If this succeeds, then
            //  replace the supplied TP.dom.ElementNode with the new custom tag.
            this.saveElementSerialization(
                    serializationStorage,
                    function() {
                        var newElem,

                            oldElem,
                            parentElem,

                            newTPElem,

                            prevPosition,
                            oldElemClone,
                            newElemClone,

                            halo;

                        newElem = TP.nodeFromString('<' + tagName + '/>');

                        //  If we can make a new Element from the tagName, then
                        //  we grab the oldNode, run the new Element through the
                        //  compiler (thereby setting up proper registrations,
                        //  etc. for it) and then replace the old element with
                        //  the new one.
                        if (TP.isElement(newElem)) {

                            oldElem = aTPElem.getNativeNode();
                            parentElem = oldElem.parentNode;

                            newTPElem = aTPElem.compile(null, true, newElem);

                            newElem = TP.unwrap(newTPElem);

                            prevPosition = oldElem[TP.PREVIOUS_POSITION];

                            oldElemClone = TP.nodeCloneNode(oldElem, false);
                            oldElemClone[TP.PREVIOUS_POSITION] = prevPosition;

                            newElemClone = TP.nodeCloneNode(newElem, false);
                            newElemClone[TP.PREVIOUS_POSITION] = prevPosition;

                            this.updateUICanvasSource(
                                    TP.ac(oldElemClone),
                                    oldElem.parentNode,
                                    TP.DELETE,
                                    null,
                                    null,
                                    null,
                                    false);

                            newElem = TP.nodeReplaceChild(
                                        parentElem, newElem, oldElem);

                            this.updateUICanvasSource(
                                    TP.ac(newElemClone),
                                    newElem.parentNode,
                                    TP.CREATE,
                                    null,
                                    null,
                                    null,
                                    false);

                            newTPElem = TP.wrap(newElem);

                            halo = TP.byId('SherpaHalo', sherpaDoc);

                            //  This will move the halo off of the old element.
                            //  Note that we do *not* check here whether or not
                            //  we *can* blur - we definitely want to blur off
                            //  of the old DOM content - it's probably gone now
                            //  anyway.

                            //  Blur and refocus the halo on the haloTarget.
                            halo.blur();

                            if (!newTPElem.isReadyToRender()) {
                                newTPElem.defineMethod('stylesheetReady',
                                    function(aStyleTPElem) {

                                        this.callNextMethod();

                                        if (this.haloCanFocus(halo)) {
                                            halo.focusOn(this);
                                        }
                                    });
                            } else {
                                if (this.haloCanFocus(halo)) {
                                    halo.focusOn(this);
                                }
                            }
                        }
                    }.bind(this));
        }
    }.bind(this);

    handler.observe(TP.ANY, 'TypeAdded');

    return this;
}, {
    patchCallee: false
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('makeTile',
function(anID, headerText, tileParent) {

    /**
     * @method makeTile
     * @summary Makes a new TP.sherpa.tile 'draggable' surface and populates it
     *     into the Sherpa's common layer (if tileParent isn't supplied) for
     *     managing tiles.
     * @param {String} anID The ID to give to the tile for future referencing.
     * @param {String} headerText Text to place into the 'header' of the tile.
     * @param {Element} [tileParent] The tile parent element. If this is not
     *     supplied, then the Sherpa's common tile layer is used as the tile
     *     parent.
     * @returns {TP.sherpa.tile} The newly created tile.
     */

    var tileTemplateTPElem,

        parent,
        tileTPElem,

        tileID,

        centerTPElem,
        centerTPElemPageRect;

    //  Grab the TP.sherpa.tile's template.
    tileTemplateTPElem = TP.sherpa.tile.getResourceElement(
                            'template',
                            TP.ietf.mime.XHTML);

    //  If the caller didn't supply a parent, then use the Sherpa's common tile
    //  layer as the new tile's parent.
    parent = tileParent;
    if (!TP.isElement(parent) &&
        !TP.isKindOf(parent, TP.dom.ElementNode)) {
        parent = TP.byId('commonTileLayer', this.get('vWin'));
    }

    //  Add the tile's template to the parent.
    tileTPElem = TP.wrap(parent).addContent(tileTemplateTPElem);

    //  Make sure to escape any necessary characters.
    tileID = TP.escapeTypeName(anID);

    //  Set the ID and header text
    tileTPElem.setID(tileID);
    tileTPElem.setHeaderText(headerText);

    //  Center this based on where the 'center' div is located.
    centerTPElem = TP.byId('center', this.get('vWin'));
    centerTPElemPageRect = centerTPElem.getOffsetRect();

    tileTPElem.setOffsetPosition(
        TP.pc(centerTPElemPageRect.getX(), centerTPElemPageRect.getY()));

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('processUICanvasMutationRecords',
function(mutationRecords) {

    /**
     * @method processUICanvasMutationRecords
     * @summary Processes records from a Mutation Observer against the source of
     *     the document currently rendered as the UI canvas.
     * @param {MutationRecord[]} mutationRecords The Array of MutationRecords
     *     that we are being asked to process.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var len,
        i,
        record,

        attrName,
        attrPrefix,
        attrValue,
        attrOldValue,

        attrIsEmpty,
        attrWasEmpty,

        attrCreatedRecords,
        attrUpdatedRecords,
        attrDeletedRecords,

        descendantListCreatedRecords,
        descendantListDeletedRecords,

        descendantListDeletions,
        descendantListCreations;

    //  Create separate Arrays for the various kinds of operations we'll be
    //  processing. The mutation records will be sorted into these Arrays so
    //  that a single 'batch' of records for a particular operation will be
    //  processed all at once.
    attrCreatedRecords = TP.ac();
    attrUpdatedRecords = TP.ac();
    attrDeletedRecords = TP.ac();

    descendantListCreatedRecords = TP.ac();
    descendantListDeletedRecords = TP.ac();

    len = mutationRecords.getSize();
    for (i = 0; i < len; i++) {

        record = mutationRecords.at(i);

        switch (record.type) {
            case 'attributes':

                attrName = record.attributeName;

                if (TP.notEmpty(record.attributeNamespace)) {
                    if (!TP.regex.HAS_COLON.test(attrName)) {
                        attrPrefix = TP.w3.Xmlns.getURIPrefix(
                                        record.attributeNamespace,
                                        record.target);
                        attrName = attrPrefix + ':' + attrName;
                    } else {
                        attrPrefix = attrName.slice(
                                        0, attrName.indexOf(':'));
                    }
                }

                attrValue = TP.elementGetAttribute(
                                record.target,
                                attrName,
                                true);
                attrOldValue = record.oldValue;

                //  Ensure that the target Element is indeed an Element and that
                //  it's not detached. We're not interested in attributes on
                //  detached Elements.
                if (TP.isElement(record.target) &&
                    !TP.nodeIsDetached(record.target)) {

                    //  Detect whether this is a TP.CREATE, TP.UPDATE or
                    //  TP.DELETE base on whether there is a (new) attribute
                    //  value and whether there was an existing old attribute
                    //  value.

                    attrIsEmpty = TP.isEmpty(attrValue);
                    attrWasEmpty = TP.isEmpty(attrOldValue);

                    if (!attrIsEmpty && attrWasEmpty) {

                        //  Capture the attributeName and attributeValue
                        //  directly onto the record Object under private TIBET
                        //  names. We'll use this later when dispatching.
                        record.tp_attrName = attrName;
                        record.tp_attrValue = attrValue;

                        //  Add this record to the proper sorting Array for its
                        //  particular kind of operation.
                        attrCreatedRecords.push(record);
                    } else if (!attrIsEmpty && !attrWasEmpty) {

                        //  Capture the attributeName, attributeValue and
                        //  oldAttributeValue directly onto the record Object
                        //  under private TIBET names. We'll use this later when
                        //  dispatching.
                        record.tp_attrName = attrName;
                        record.tp_attrValue = attrValue;
                        record.tp_attrOldValue = attrOldValue;

                        //  Add this record to the proper sorting Array for its
                        //  particular kind of operation.
                        attrUpdatedRecords.push(record);
                    } else if (attrIsEmpty && !attrWasEmpty) {

                        //  Capture the attributeName and old attributeValue
                        //  directly onto the record Object under private TIBET
                        //  names. We'll use this later when dispatching.
                        record.tp_attrName = attrName;
                        record.tp_attrOldValue = attrOldValue;

                        //  Add this record to the proper sorting Array for its
                        //  particular kind of operation.
                        attrDeletedRecords.push(record);
                    }
                }

                break;

            case 'childList':

                if (TP.notEmpty(record.removedNodes)) {
                    //  Add this record to the proper sorting Array for its
                    //  particular kind of operation.
                    descendantListDeletedRecords.push(record);
                }

                if (TP.notEmpty(record.addedNodes)) {
                    //  Add this record to the proper sorting Array for its
                    //  particular kind of operation.
                    descendantListCreatedRecords.push(record);
                }

                break;

            default:
                break;
        }
    }

    //  Process all of the records that created attributes.
    len = attrCreatedRecords.getSize();
    for (i = 0; i < len; i++) {
        record = attrCreatedRecords.at(i);

        //  Call the method to update our current UI canvas's source DOM. Note
        //  here how there be only one mutated node (the Element that the
        //  Attribute mutated on) and how we pass it's parent node as the
        //  'mutation ancestor'.
        this.updateUICanvasSource(TP.ac(record.target),
                                    record.target.parentNode,
                                    TP.CREATE,
                                    record.tp_attrName,
                                    record.tp_attrValue,
                                    null);
    }

    //  Process all of the records that updated attributes.
    len = attrUpdatedRecords.getSize();
    for (i = 0; i < len; i++) {
        record = attrUpdatedRecords.at(i);

        //  Call the method to update our current UI canvas's source DOM. Note
        //  here how there be only one mutated node (the Element that the
        //  Attribute mutated on) and how we pass it's parent node as the
        //  'mutation ancestor'.
        this.updateUICanvasSource(TP.ac(record.target),
                                    record.target.parentNode,
                                    TP.UPDATE,
                                    record.tp_attrName,
                                    record.tp_attrValue,
                                    record.tp_attrOldValue);
    }

    //  Process all of the records that deleted attributes.
    len = attrDeletedRecords.getSize();
    for (i = 0; i < len; i++) {
        record = attrDeletedRecords.at(i);

        //  Call the method to update our current UI canvas's source DOM. Note
        //  here how there be only one mutated node (the Element that the
        //  Attribute mutated on) and how we pass it's parent node as the
        //  'mutation ancestor'.
        this.updateUICanvasSource(TP.ac(record.target),
                                    record.target.parentNode,
                                    TP.DELETE,
                                    record.tp_attrName,
                                    null,
                                    record.tp_attrOldValue);
    }

    //  Process all of the records that deleted child nodes.
    if (TP.notEmpty(descendantListDeletedRecords)) {

        //  Group the records by the target. This ensures that all mutated nodes
        //  that were descendants of a particular target are going to get
        //  processed at once. This will create a TP.core.Hash.
        descendantListDeletions = descendantListDeletedRecords.groupBy(
                                function(item, index) {
                                    return TP.gid(item.target);
                                });

        //  Iterate over the hash and process each batch of grouped records.
        descendantListDeletions.perform(
            function(kvPair) {

                var deletionRecords,
                    mutatedNodes,

                    recordsLen,
                    j,

                    nodesLen,
                    k;

                deletionRecords = kvPair.last();

                mutatedNodes = TP.ac();

                //  Iterate over each record and collect up all of the mutated
                //  nodes into a single Array.
                recordsLen = deletionRecords.getSize();
                for (j = 0; j < recordsLen; j++) {
                    record = deletionRecords.at(j);

                    nodesLen = record.removedNodes.length;
                    for (k = 0; k < nodesLen; k++) {
                        mutatedNodes.push(record.removedNodes[k]);
                    }
                }

                //  Call the method to update our current UI canvas's source
                //  DOM.
                this.updateUICanvasSource(
                        mutatedNodes, record.target, TP.DELETE);
            }.bind(this));
    }

    //  Process all of the records that created child nodes.
    if (TP.notEmpty(descendantListCreatedRecords)) {

        //  Group the records by the target. This ensures that all mutated nodes
        //  that were descendants of a particular target are going to get
        //  processed at once. This will create a TP.core.Hash.
        descendantListCreations = descendantListCreatedRecords.groupBy(
                                function(item, index) {
                                    return TP.gid(item.target);
                                });

        //  Iterate over the hash and process each batch of grouped records.
        descendantListCreations.perform(
            function(kvPair) {

                var creationRecords,
                    mutatedNodes,

                    recordsLen,
                    j,

                    nodesLen,
                    k;

                creationRecords = kvPair.last();

                mutatedNodes = TP.ac();

                //  Iterate over each record and collect up all of the mutated
                //  nodes into a single Array.
                recordsLen = creationRecords.getSize();
                for (j = 0; j < recordsLen; j++) {
                    record = creationRecords.at(j);

                    nodesLen = record.addedNodes.length;
                    for (k = 0; k < nodesLen; k++) {
                        mutatedNodes.push(record.addedNodes[k]);
                    }
                }

                //  Call the method to update our current UI canvas's source
                //  DOM.
                this.updateUICanvasSource(
                        mutatedNodes, record.target, TP.CREATE);
            }.bind(this));
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('saveElementSerialization',
function(storageSerialization, successFunc, failFunc) {

    /**
     * @method saveElementSerialization
     * @summary Saves the supplied element serialization to the server.
     * @param {TP.core.Hash} storageSerialization The hash containing the
     *     serialization of an element to save. This encoding will also contain
     *     the location to save the serialization (and any nested
     *     serializations) to.
     * @param {Function} successFunc The Function to execute if the saving
     *     process succeeds.
     * @param {Function} failFunc The Function to execute if the saving process
     *     fails.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var stores;

    stores = storageSerialization.at('stores');

    //  Iterate over all of the top-level keys in the serialization.
    stores.getKeys().forEach(
        function(loc) {

            var newContent,

                uri,
                req;

            //  Grab the new content stored at the location in the stores
            //  that were generated by the serialization process.
            newContent = stores.at(loc);

            //  No sense in making the server call if there is no new
            //  content.
            if (TP.isEmpty(newContent)) {
                return;
            }

            uri = TP.uc(loc);
            req = uri.constructRequest(
                    TP.hc('serializationParams',
                        TP.hc(
                            'store',
                                storageSerialization.at('store'),
                            'lockStore',
                                storageSerialization.at('lockStore'),
                            'wantsPrefixedXMLNSAttrs',
                                storageSerialization.at(
                                                'wantsPrefixedXMLNSAttrs')
                        )));

            //  Install a success handler if a success Function was supplied.
            if (TP.isCallable(successFunc)) {
                req.defineHandler('RequestSucceeded',
                                    function() {
                                        successFunc();
                                    });
            }

            //  Install a failure handler if a failure Function was supplied.
            if (TP.isCallable(failFunc)) {
                req.defineHandler('RequestFailed',
                                    function(aResponse) {
                                        failFunc();
                                    });
            }

            //  Set the URI's content to the storage content.
            uri.setResource(newContent);

            //  Save it.
            uri.save(req);
        });

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the TP.sherpa.IDE object.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var win,
        drawerElement,
        thisref,
        sherpaFinishSetupFunc,

        contentElem,

        allDrawers,

        centerElem,

        resizingHandler,
        observerConfig,
        resizer,

        framingStyleElement,
        variablesRule;

    win = this.get('vWin');

    thisref = this;

    //  If we didn't show the IDE when we first started, the trigger has now
    //  been fired to show it.
    if (!TP.sys.cfg('boot.show_ide')) {

        drawerElement = TP.byId('south', win, false);

        sherpaFinishSetupFunc = function(aSignal) {

            //  Turn off any future notifications.
            sherpaFinishSetupFunc.ignore(
                drawerElement, 'TP.sig.DOMTransitionEnd');

            //  After the drawers have finished animating in, delay,
            //  giving the animation a chance to finish cleanly before
            //  proceeding.
            setTimeout(function() {

                //  The basic Sherpa framing has been set up, but we complete
                //  the setup here (after the drawers animate in). Note that
                //  this will exit but want to service part of its code after
                //  a short delay.
                thisref.finishSetup(
                        function() {
                            thisref.sherpaSetupComplete();
                        });

            }, 1000);

        };
        sherpaFinishSetupFunc.observe(drawerElement, 'TP.sig.DOMTransitionEnd');

        //  Show the center area and the drawers.

        //  First, we remove the 'fullscreen' class from the center element.
        //  This allows the 'content' element below to properly size it's 'busy
        //  message layer'.
        TP.elementRemoveClass(TP.byId('center', win, false),
                                'fullscreen');

        //  Grab the existing 'content' element, which is now unused since the
        //  world element moved the screens out of it, and use it to show the
        //  'loading' element. The console will later reuse it for it's output.
        contentElem = TP.byId('content', win, false);

        //  Show the content element, only so that we can size a 'busy' message
        //  to it properly. Then hide it again.
        TP.elementShow(contentElem);
        TP.elementShowBusyMessage(contentElem,
                                    '...initializing TIBET Sherpa...');
        TP.elementHide(contentElem);

        //  Grab all of the drawer - north, south, east and west
        allDrawers = TP.byCSSPath('.north, .south, .east, .west',
                                    win,
                                    false,
                                    false);

        //  Show the drawers.
        allDrawers.forEach(
                    function(anElem) {
                        TP.elementRemoveAttribute(
                                    anElem, 'pclass:hidden', true);
                    });
    } else {

        //  The basic Sherpa framing has been drawn (because of the setting of
        //  the 'boot.show_ide' flag), but we complete the setup here.
        this.finishSetup();

        TP.byId('SherpaHUD', win).toggle('closed');

        //  Refresh the input area after a 1000ms timeout. This ensures that
        //  animations and other layout will happen before the editor component
        //  tries to compute its layout.
        setTimeout(function() {
            TP.byId('SherpaConsole', win).render();
        }, 1000);
    }

    //  ---

    //  Set up mutation observers that will watch for the resizers to
    //  become/resign being active and manage the 'transition' property of the
    //  '#center' element appropriately. This is so that when the user is
    //  resizing, the transitions don't try to execute.

    centerElem = TP.byId('center', win, false);

    //  Define a handling function that will alter the transition property
    resizingHandler = function(mutationRecords) {

        var styleObj,

            i,
            len,
            record;

        styleObj = TP.elementGetStyleObj(centerElem);

        len = mutationRecords.getSize();
        for (i = 0; i < len; i++) {
            record = mutationRecords.at(i);

            //  If we're altering the 'active' (i.e. 'pclass:active') attribute,
            //  then locally change the transition depending on whether the
            //  target element already has the 'pclass:active' attribute or not.
            if (record.attributeName === 'active') {

                if (TP.elementHasAttribute(
                        record.target, 'pclass:active', true)) {

                    styleObj.transition = 'none';
                } else {
                    styleObj.transition = '';
                }
            }
        }
    };

    //  Now, set up managed mutation observer machinery that uses the above
    //  handler to manage the transitions.

    observerConfig = {
        subtree: true,
        attributes: true
    };

    resizer = TP.byCSSPath('div#northResizer', win, true, false);
    TP.addMutationObserver(
            resizingHandler, observerConfig, 'N_RESIZING_OBSERVER');
    TP.activateMutationObserver(resizer, 'N_RESIZING_OBSERVER');

    resizer = TP.byCSSPath('div#southResizer', win, true, false);
    TP.addMutationObserver(
            resizingHandler, observerConfig, 'S_RESIZING_OBSERVER');
    TP.activateMutationObserver(resizer, 'S_RESIZING_OBSERVER');

    //  ---

    //  Set up resizing worker functions and value gathering.

    framingStyleElement = TP.byCSSPath(
                            'style[tibet|originalhref$="sherpa_framing.css"]',
                            win,
                            true,
                            false);

    variablesRule = TP.styleSheetGetStyleRulesMatching(
                        TP.cssElementGetStyleSheet(framingStyleElement),
                        'body').first();

    //  Install a custom function on the TP.dnd.DragResponder type that can be
    //  referenced in the markup.
    TP.dnd.DragResponder.Type.defineConstant(
        'ALTER_SHERPA_CUSTOM_PROPERTY',
        function(anElement, styleObj, computedVals, infoAttrs) {

            var customPropertyName,

                minVal,
                val;

            customPropertyName = infoAttrs.at('drag:property');
            switch (customPropertyName) {

                case '--sherpa-drawer-north-open-height':

                    minVal = TP.elementGetPixelValue(
                                anElement,
                                variablesRule.style.getPropertyValue(
                                    '--sherpa-drawer-north-open-min-height'));

                    val = computedVals.at('height');
                    val = val.max(minVal);

                    break;

                case '--sherpa-drawer-south-open-height':

                    minVal = TP.elementGetPixelValue(
                                anElement,
                                variablesRule.style.getPropertyValue(
                                    '--sherpa-drawer-south-open-min-height'));

                    val = computedVals.at('height');
                    val = val.max(minVal);

                    break;
                default:
                    return;
            }

            if (TP.notEmpty(customPropertyName)) {
                variablesRule.style.setProperty(
                                customPropertyName,
                                val + 'px');
            }
        });

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setShouldProcessDOMMutations',
function(shouldProcess) {

    /**
     * @method setShouldProcessDOMMutations
     * @summary Sets the flag to tell this object whether or not to process
     *     mutations to the source DOM it is managing.
     * @description Note that if shouldProcess is true, this flag will be reset
     *     to false after a certain amount of time. This is due to the fact that
     *     mutations 'come in' asynchronously and so the flag never has a chance
     *     to reset to false otherwise, as setting to false cannot be done at
     *     the 'point of mutation' in the code..
     * @param {Boolean} shouldProcess Whether or not the receiver should process
     *     mutations to the source DOM of the currently displayed DOM in the UI
     *     canvas fails.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var shouldProcessTimeout;

    //  It is currently true - clear any existing timeout and get ready to reset
    //  it.
    if (TP.isTrue(this.get('shouldProcessDOMMutations'))) {
        clearTimeout(this.get('$shouldProcessTimeout'));
        this.set('$shouldProcessTimeout', null);
    }

    //  If the flag was true, then set up a timeout that will reset the flag
    //  back after a certain amount of time (default to 1000ms).
    if (shouldProcess) {
        shouldProcessTimeout = setTimeout(
            function() {
                this.$set('shouldProcessDOMMutations', false);
            }.bind(this),
            TP.sys.cfg('sherpa.mutation_track_clear_timeout', 1000));

        this.set('$shouldProcessTimeout', shouldProcessTimeout);
    } else {

        //  It was false - clear any existing timeout.
        clearTimeout(this.get('$shouldProcessTimeout'));
        this.set('$shouldProcessTimeout', null);
    }

    this.$set('shouldProcessDOMMutations', shouldProcess);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupAdjuster',
function() {

    /**
     * @method setupAdjuster
     * @summary Sets up the Sherpa's 'style adjuster' component. The Sherpa's
     *     style adjuster provides a GUI to adjust the current halo target's
     *     cascaded style.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var adjusterTPElem;

    adjusterTPElem = TP.tpelem(
        '<sherpa:adjuster id="SherpaAdjuster" pclass:hidden="true"/>');

    TP.byId('center', this.get('vWin')).addContent(adjusterTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupBuilderObserver',
function() {

    /**
     * @method setupBuilderObserver
     * @summary Sets up a managed Mutation Observer that handles insertions and
     *     deletions as GUI is built using various parts of the Sherpa.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var observerConfig,

        world,
        currentScreenTPWin;

    if (TP.sys.isTesting()) {
        return this;
    }

    //  Add a managed Mutation Observer filter Function that will filter all
    //  mutation records for when we're currently not configured to process
    //  current UI canvas DOM mutations.

    TP.addMutationObserverFilter(
        function(aMutationRecord) {
            return this.get('shouldProcessDOMMutations');
        }.bind(this),
        'BUILDER_OBSERVER');

    //  Add a managed Mutation Observer filter Function that will filter all
    //  mutation records for when we're testing:

    TP.addMutationObserverFilter(
        function(aMutationRecord) {
            if (TP.sys.isTesting()) {
                return false;
            }
        },
        'BUILDER_OBSERVER');

    //  Add a managed Mutation Observer filter Function that will filter all
    //  mutation records for bind:in attribute mutations when the target element
    //  is a desugared text span.

    TP.addMutationObserverFilter(
        function(aMutationRecord) {
            if (aMutationRecord.type === 'attributes' &&
                aMutationRecord.attributeName === 'in' &&
                aMutationRecord.attributeNamespace === TP.w3.Xmlns.BIND &&
                TP.elementHasAttribute(aMutationRecord.target,
                                        'tibet:textbinding',
                                        true)) {
                return false;
            }
        },
        'BUILDER_OBSERVER');

    //  Add a managed Mutation Observer filter Function that will filter
    //  attribute mutation records for:
    //
    //      - TIBET-related namespace prefixes:
    //          'dnd'
    //          'xmlns'
    //          'pclass'
    //      - TIBET attributes:
    //          'tibet:focuscontext'
    //          'tibet:for'
    //          'tibet:globaldocid'
    //          'tibet:originalhref'
    //          'tibet:recasting'
    //          'tibet:type'
    //      - generated 'id' attributes
    //      - Sherpa-related 'class' attributes
    //      - Sherpa-related other attributes

    TP.addMutationObserverFilter(
        function(aMutationRecord) {

            var elem,

                attrName,
                attrPrefix,
                attrValue,
                attrOldValue,

                realElemPrefix,
                realElemLocalName,

                computedElemName,
                computedElemNameParts,
                computedElemPrefix,
                computedElemLocalName;

            elem = aMutationRecord.target;

            if (aMutationRecord.type === 'attributes') {

                //  Compute attribute name, value, old value and prefix

                attrName = aMutationRecord.attributeName;

                if (TP.notEmpty(aMutationRecord.attributeNamespace)) {
                    if (!TP.regex.HAS_COLON.test(attrName)) {
                        attrPrefix = TP.w3.Xmlns.getURIPrefix(
                                        aMutationRecord.attributeNamespace,
                                        elem);
                        attrName = attrPrefix + ':' + attrName;
                    } else {
                        attrPrefix = attrName.slice(
                                        0, attrName.indexOf(':'));
                    }
                }

                attrValue = TP.elementGetAttribute(
                                elem,
                                attrName,
                                true);
                attrOldValue = aMutationRecord.oldValue;

                switch (attrPrefix) {

                    //  Ignore any attributes with these prefixes
                    case 'dnd':
                    case 'xmlns':
                    case 'pclass':
                        return false;
                    default:
                        break;
                }

                //  It's a 'tibet:' attribute that we never serialize.
                if (TP.NEVER_SERIALIZED_TIBET_ATTRS.contains(attrName)) {
                    return false;
                }

                switch (attrName) {

                    case 'tibet:focuscontext':
                    case 'tibet:for':
                    case 'tibet:globaldocid':
                    case 'tibet:originalhref':
                    case 'tibet:recasting':
                    case 'tibet:type':
                        return false;

                    case 'id':

                        //  Test to see if the 'id' attribute value is one that
                        //  is generated by TIBET.

                        //  If it ends with '_generated', then we know it is.
                        if (attrValue.endsWith('_generated')) {
                            return false;
                        }

                        //  For XHTML 'style' elements that are generated as
                        //  part of the style processing machinery, these
                        //  elements will not exist in the source document. Even
                        //  though the ID value will likely be a generated ID
                        //  matching a type name, the logic below won't catch
                        //  them because the prefix on a 'style' element will
                        //  likely be null.
                        if (TP.elementHasAttribute(
                            elem, 'tibet:originalhref', true)) {
                            return false;
                        }

                        //  In the first case, we use the real element name
                        //  prefix and tagName and see if they're joined
                        //  together with an underscore ('_'). If so, then it's
                        //  very likely that TIBET generated it and so we ignore
                        //  it.
                        realElemPrefix = elem.prefix;
                        realElemLocalName = elem.tagName;

                        if (attrValue.startsWith(
                                realElemPrefix + '_' +
                                realElemLocalName + '_')) {
                            return false;
                        }

                        //  In the second case, we use the computed element name
                        //  prefix and computed tag name and see if they're
                        //  joined together with an underscore ('_'). If so,
                        //  then it's very likely that TIBET generated it and so
                        //  we ignore it.
                        computedElemName =
                                TP.elementGetFullName(elem);
                        computedElemNameParts =
                                computedElemName.split(':');
                        computedElemPrefix =
                                computedElemNameParts.first();
                        computedElemLocalName =
                                computedElemNameParts.last();

                        if (attrValue.startsWith(
                                computedElemPrefix + '_' +
                                computedElemLocalName + '_')) {
                            return false;
                        }

                        break;

                    case 'class':

                        //  If either the new or old 'class' attribute value
                        //  contains 'sherpa-', we ignore it

                        if (TP.notEmpty(attrValue) &&
                            attrValue.contains('sherpa-')) {
                            return false;
                        }

                        if (TP.notEmpty(attrOldValue) &&
                            attrOldValue.contains('sherpa-')) {
                            return false;
                        }

                        break;

                    default:

                        //  If the attribute name starts with 'sherpa-', we
                        //  ignore it.
                        if (attrName.startsWith('sherpa-')) {
                            return false;
                        }

                        break;
                }
            }

            return true;
        },
        'BUILDER_OBSERVER');

    //  Add managed Mutation Observer filter Functions that will filter child
    //  tree mutation records for:
    //
    //      - generated elements

    TP.addMutationObserverFilter(
        function(aMutationRecord) {

            var len,
                i,

                node,
                elem,
                attrValue;

            if (TP.notEmpty(aMutationRecord.addedNodes)) {

                len = aMutationRecord.addedNodes.length;
                for (i = 0; i < len; i++) {

                    node = aMutationRecord.addedNodes[i];

                    //  Nodes that are generated by TIBET, such as dragging
                    //  elements and resize trackers.
                    if (TP.isTrue(node[TP.GENERATED])) {
                        return false;
                    }

                    if (TP.isElement(node)) {
                        elem = node;
                        if (TP.elementHasAttribute(
                            elem, 'tibet:recasting', true)) {
                            return false;
                        }
                        attrValue = TP.elementGetAttribute(elem, 'id', true);
                        if (attrValue.endsWith('_generated')) {
                            return false;
                        }
                        attrValue = TP.elementGetAttribute(elem, 'type', true);
                        if (attrValue === TP.ietf.mime.TIBET_CSS) {
                            return false;
                        }
                    } else if (TP.isTextNode(node) ||
                                TP.isCDATASectionNode(node) ||
                                TP.isCommentNode(node)) {

                        if (TP.isEmpty(node)) {
                            return false;
                        }

                        elem = aMutationRecord.target;

                        //  Nodes that are generated by TIBET, such as
                        //  dragging elements and resize trackers.
                        if (TP.isTrue(elem[TP.GENERATED])) {
                            return false;
                        }

                        attrValue = TP.elementGetAttribute(elem, 'id', true);
                        if (attrValue.endsWith('_generated')) {
                            return false;
                        }
                    }
                }
            }

            return true;
        },
        'BUILDER_OBSERVER');

    TP.addMutationObserverFilter(
        function(aMutationRecord) {

            var len,
                i,

                node,
                elem,
                attrValue;

            if (TP.notEmpty(aMutationRecord.removedNodes)) {

                len = aMutationRecord.removedNodes.length;
                for (i = 0; i < len; i++) {

                    node = aMutationRecord.removedNodes[i];

                    //  Nodes that are generated by TIBET, such as dragging
                    //  elements and resize trackers.
                    if (TP.isTrue(node[TP.GENERATED])) {
                        return false;
                    }

                    if (TP.isElement(node)) {
                        elem = node;
                        if (TP.elementHasAttribute(
                            elem, 'tibet:recasting', true)) {
                            return false;
                        }
                        attrValue = TP.elementGetAttribute(elem, 'id', true);
                        if (attrValue.endsWith('_generated')) {
                            return false;
                        }
                    } else if (TP.isTextNode(node) ||
                                TP.isCDATASectionNode(node) ||
                                TP.isCommentNode(node)) {

                        if (TP.isEmpty(node)) {
                            return false;
                        }

                        elem = aMutationRecord.target;

                        //  Nodes that are generated by TIBET, such as
                        //  dragging elements and resize trackers.
                        if (TP.isTrue(elem[TP.GENERATED])) {
                            return false;
                        }

                        attrValue = TP.elementGetAttribute(elem, 'id', true);
                        if (attrValue.endsWith('_generated')) {
                            return false;
                        }
                    }
                }
            }

            return true;
        },
        'BUILDER_OBSERVER');

    //  Set up managed mutation observer machinery that uses our
    //  'processUICanvasMutationRecords' method to manage changes to the UI
    //  canvas.

    observerConfig = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true
    };

    TP.addMutationObserver(
        this.processUICanvasMutationRecords.bind(this),
        observerConfig,
        'BUILDER_OBSERVER');

    //  Because the 'DocumentLoaded' handler that normally activates this
    //  managed mutation observer has already been executed when the UI canvas
    //  was first displayed, we need to activate the first time here.
    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();

    TP.activateMutationObserver(
        currentScreenTPWin.getNativeDocument(),
        'BUILDER_OBSERVER');

    //  Grab the canvas document and observe mutation style change signals from
    //  it.
    this.observe(currentScreenTPWin.getDocument(),
                    'TP.sig.MutationStyleChange');

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupConsole',
function() {

    /**
     * @method setupConsole
     * @summary Sets up the Sherpa's 'console' component. The Sherpa's console
     *     provides a command line interface to the underlying TIBET Shell
     *     (TSH).
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var viewDoc,

        consoleOutputTPElem,
        consoleInputTPElem,

        sherpaSouthDrawer,
        tshPanel,

        testAppender;

    viewDoc = this.get('vWin').document;

    //  We *must* set up the output first, since setting up the input will cause
    //  output to be logged.

    //  Create the <sherpa:consoleoutput> tag
    consoleOutputTPElem = TP.sherpa.consoleoutput.getResourceElement('template',
                            TP.ietf.mime.XHTML);

    consoleOutputTPElem = consoleOutputTPElem.clone();
    consoleOutputTPElem.compile();

    //  Set the console output's ID and add it to the 'center' div.
    consoleOutputTPElem.setAttribute('id', 'SherpaConsoleOutput');

    consoleOutputTPElem = TP.byId('center', viewDoc).addContent(
                                                    consoleOutputTPElem);

    //  Now we can set up the input cell. It currently goes into the south
    //  drawer.

    consoleInputTPElem = TP.sherpa.console.getResourceElement('template',
                            TP.ietf.mime.XHTML);

    consoleInputTPElem = consoleInputTPElem.clone();
    consoleInputTPElem.compile();

    //  Grab the south drawer
    sherpaSouthDrawer = TP.byCSSPath('#south > .drawer', viewDoc, true);

    //  Grab the panel that the TSH is supposed to go into
    tshPanel = TP.byPath(
        './xctrls:panelbox/xctrls:panel[./xctrls:value/. = "TSH"]' +
            '/xctrls:content',
        sherpaSouthDrawer,
        true);

    //  Insert our input element into that panel.
    consoleInputTPElem = tshPanel.insertContent(consoleInputTPElem);

    //  Do further set up for the console input. Note that this will also do
    //  further set up for the console output that we attached above.
    consoleInputTPElem.setup();

    //  Set the initial output mode.
    consoleInputTPElem.setOutputDisplayMode(
                        TP.sys.cfg('sherpa.tdc.output_mode', 'one'));

    //  NB: The console observes the HUD when it's done loading it's editor,
    //  etc.

    //  Install log appenders that know how to render logging entries to the
    //  Sherpa for both the lib (TP) and the app (APP).

    TP.getDefaultLogger().addAppender(TP.log.SherpaAppender.construct());
    APP.getDefaultLogger().addAppender(TP.log.SherpaAppender.construct());

    //  Now, effectively replace the test logger's appenders with just ours.
    //  This makes sure that when tests are executed in the Sherpa that the
    //  output is placed into our console output.
    TP.getLogger(TP.TEST_LOG).clearAppenders();

    testAppender = TP.log.SherpaTestAppender.construct();
    testAppender.setLayout(TP.log.SherpaTestLogLayout.construct());
    TP.getLogger(TP.TEST_LOG).addAppender(testAppender);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupContextMenu',
function() {

    /**
     * @method setupContextMenu
     * @summary Sets up the Sherpa's 'context menu' component. The Sherpa's
     *     context menu provides a way to issue commands to the system via the
     *     'right button' click.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var viewDoc,
        menuTPElem;

    viewDoc = this.get('vWin').document;

    //  Add the stylesheet for the TP.xctrls.popup, if it's not there already.
    //  All context menus will use this and we might as well pre-populate it.
    TP.xctrls.popup.addStylesheetTo(viewDoc);

    //  TODO: Make a loop here that will add the other context menus

    TP.sherpa.halocontextmenu.addStylesheetTo(viewDoc);

    menuTPElem = TP.sherpa.halocontextmenu.getResourceElement('template',
                            TP.ietf.mime.XHTML);

    menuTPElem = menuTPElem.clone();

    TP.byId('center', this.get('vWin')).addRawContent(menuTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupObservations',
function() {

    /**
     * @method setupObservations
     * @summary Sets up any 'IDE-wide' signal observations.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    this.observe(TP.core.Mouse, 'TP.sig.DOMDragDown');

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupHalo',
function() {

    /**
     * @method setupHalo
     * @summary Sets up the Sherpa's 'halo' component. The halo is the component
     *     that overlays elements in the GUI and controls which element is the
     *     current focus of manipulation activities.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var haloTPElem,
        toolsLayerTPElem;

    haloTPElem = TP.sherpa.halo.getResourceElement('template',
                            TP.ietf.mime.XHTML);

    haloTPElem = haloTPElem.clone();
    haloTPElem.compile();

    toolsLayerTPElem = this.getToolsLayer();
    toolsLayerTPElem.addContent(haloTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupHUD',
function() {

    /**
     * @method setupHUD
     * @summary Sets up the Sherpa's 'hud' component. The hud is the component
     *     that controls the drawers that encompass the user's application
     *     canvas. These drawers contain controls that the user uses to
     *     manipulate their applocation.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var hudTPElem;

    hudTPElem = TP.byId('SherpaHUD', this.get('vWin'));
    hudTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupInspector',
function() {

    /**
     * @method setupInspector
     * @summary Sets up the Sherpa's 'inspector' component. The inspector is the
     *     component that allows a user to browse 'under the covers' using a
     *     multi-bay, hierarchical approach.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var inspectorTPElem;

    inspectorTPElem = TP.byId('SherpaInspector', this.get('vWin'));
    inspectorTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupOutliner',
function() {

    /**
     * @method setupOutliner
     * @summary Sets up the Sherpa's 'outliner' component. The outliner is the
     *     component that allows a user to visualize and manipulate the
     *     underlying DOM structure of their application.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    //  The outliner doesn't have a visual 'tag' representation, so we manually
    //  construct it. This will set its ID and register it so that it can be
    //  found.
    TP.sherpa.outliner.construct();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupThumbnail',
function() {

    /*
    TP.byId('SherpaThumbnail', this.get('vWin')).setup();
    */

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupWorkbench',
function() {

    /**
     * @method setupWorkbench
     * @summary Sets up the Sherpa's 'workbench' component. The workbench is the
     *     component that contains the inspector and its attendant toolbars.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var workbenchTPElem;

    workbenchTPElem = TP.byId('SherpaWorkbench', this.get('vWin'));
    workbenchTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('setupWorld',
function() {

    /**
     * @method setupWorld
     * @summary Sets up the Sherpa's 'world' component. The world is the
     *     component that holds a collection of 'screens' used by the Sherpa to
     *     load different parts of the user's application GUI into and allows
     *     the author to easily switch between them.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var viewDoc,

        worldElem,
        screenHolderDiv,
        infoHolderDiv,

        uiScreenIFrames,
        numIFrames,

        configNumIFrames,
        i,

        worldTPElem,

        screens,
        infos;

    //  Grab the document that we were installed into.
    viewDoc = this.get('vWin').document;

    //  Create the <sherpa:world> tag
    worldElem = TP.documentConstructElement(viewDoc,
                                            'sherpa:world',
                                            TP.w3.Xmlns.SHERPA);
    TP.elementSetAttribute(worldElem, 'id', 'SherpaWorld', true);
    TP.elementSetAttribute(worldElem, 'mode', 'normal', true);

    //  Create the 'screen' holding div and append that to the <sherpa:world>
    //  tag
    screenHolderDiv = TP.documentConstructElement(viewDoc,
                                                    'div',
                                                    TP.w3.Xmlns.XHTML);
    screenHolderDiv = TP.nodeAppendChild(worldElem, screenHolderDiv, false);
    TP.elementAddClass(screenHolderDiv, 'screens');

    //  Create the 'screen info' holding div and append that to the
    //  <sherpa:world> tag.
    infoHolderDiv = TP.documentConstructElement(viewDoc,
                                                'div',
                                                TP.w3.Xmlns.XHTML);
    infoHolderDiv = TP.nodeAppendChild(worldElem, infoHolderDiv, false);
    TP.elementAddClass(infoHolderDiv, 'infos');

    //  Append the <sherpa:world> tag into the loaded Sherpa document.
    TP.xmlElementInsertContent(
            TP.byId('center', viewDoc, false),
            worldElem,
            TP.AFTER_BEGIN,
            null);

    //  Grab the 1...n 'prebuilt' iframes that are available in the Sherpa
    //  template. Create a <sherpa:screen> tag and wrap them in it and place
    //  that screen tag into the world.
    uiScreenIFrames = TP.byCSSPath('.center iframe', viewDoc, false, false);
    uiScreenIFrames.forEach(
            function(anIFrameElem, index) {
                TP.sherpa.world.$buildScreenFromIFrame(
                        anIFrameElem,
                        index,
                        null,
                        screenHolderDiv,
                        infoHolderDiv);
            });

    //  Grab the <sherpa:world> tag and awaken it.
    worldTPElem = TP.byId('SherpaWorld', viewDoc);
    worldTPElem.awaken();

    //  Get the number of actual iframes vs. the number of screens configured by
    //  the user as the desired number of iframes (defaulting to 1).
    numIFrames = uiScreenIFrames.getSize();
    configNumIFrames = TP.ifInvalid(1, TP.sys.cfg('sherpa.num_screens'));

    //  If there are not enough screens, according to the number configured by
    //  the user, create more.
    if (configNumIFrames > numIFrames) {

        for (i = 0; i < configNumIFrames - numIFrames; i++) {
            worldTPElem.createScreenElement('SCREEN_' + (i + numIFrames));
        }
    }

    //  Set both the first screen and it's info div to be the 'selected' one.
    screens = worldTPElem.get('screens');
    screens.first().setSelected(true);

    infos = worldTPElem.get('infos');
    infos.first().setSelected(true);

    //  Hide the 'content' div
    TP.elementHide(TP.byId('content', viewDoc, false));

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('sherpaSetupComplete',
function() {

    /**
     * @method sherpaSetupComplete
     * @summary Completes the setting up of the Sherpa. This is called once all
     *     of the Sherpa's drawers have loaded with their content and have
     *     animated in. It is called only once, however.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var viewWin,

        thisref,
        drawerElement,

        hudCompletelyOpenFunc;

    //  Grab the root window.
    viewWin = this.get('vWin');

    //  Render the console component. This ensures that all of the setup has
    //  happened and that all of the pieces that the console requires are ready
    //  to go.
    TP.byId('SherpaConsole', viewWin).render();

    thisref = this;
    drawerElement = TP.byId('west', viewWin, false);

    hudCompletelyOpenFunc = function(aSignal) {

        //  Turn off any future notifications.
        hudCompletelyOpenFunc.ignore(
                                drawerElement, 'TP.sig.DOMTransitionEnd');

        //  After the drawers have finished animating in, delay, giving the
        //  animation a chance to finish cleanly before proceeding.
        setTimeout(function() {
            TP.byId('SherpaHUD', viewWin).toggle('closed');
            thisref.signal('SherpaReady');
        }, 1500);
    };
    hudCompletelyOpenFunc.observe(drawerElement, 'TP.sig.DOMTransitionEnd');

    //  Toggle the east and west drawers to their 'maximum open' state.
    TP.byCSSPath('#west sherpa|opener', viewWin).at(0).signal('UIToggle');
    TP.byCSSPath('#east sherpa|opener', viewWin).at(0).signal('UIToggle');

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('styleLocationIsMutable',
function(styleLoc) {

    /**
     * @method styleLocationIsMutable
     * @summary Returns whether or not the supplied location (which should be a
     *     fully expanded URL location string) is a mutable location.
     * @description There are a number of factors that determine whether or not
     *     a style location is mutable or not.
     *     1. If the source location is null, then it is not editable.
     *     2. If the source location points to a '.less' file, then it not
     *     editable.
     *     3. If the source location points to a '.css' file, then a further
     *     check needs to be made on the path.
     *         a. If the path is under the TIBET framework directory, then it is
     *         not editable. The rule could be copied to a location where it is
     *         editable.
     *         b. If the path is under the application directory, then it is
     *         editable.
     * @param {String} styleLoc The fully expanded URL location of the style to
     *     check for mutability.
     * @returns {Boolean} Whether or not the supplied style location is mutable.
     */

    var ext,
        expandedLoc,

        testPath;

    if (TP.notValid(styleLoc)) {
        return false;
    }

    //  If it's a LESS file, then it's not mutable.
    ext = TP.uriExtension(styleLoc);
    if (ext === 'less') {
        return false;
    }

    expandedLoc = TP.uriExpandPath(styleLoc);

    //  If it's anywhere under the library root, then it's not mutable.
    testPath = TP.getLibRoot();
    if (expandedLoc.contains(testPath)) {
        return false;
    }

    //  If it's anywhere under the app's 'TIBET-INF' directory, then it's not
    //  mutable.
    testPath = TP.uriExpandPath(TP.sys.cfg('path.app_inf'));
    if (expandedLoc.startsWith(testPath)) {
        return false;
    }

    return true;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('toggle',
function() {

    /**
     * @method toggle
     * @summary Toggles the Sherpa's HUD open and closed.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    //  For now, we only run the Sherpa on Chrome
    if (!TP.sys.isUA('chrome')) {
        TP.alert(
            'The TIBET Sherpa technology preview is not supported on this' +
            ' platform.<br/>' +
            'Please use Google Chrome.<br/>' +
            'More information can be found here:<br/>' +
            'www.technicalpursuit.com/docs/faq.html#platforms');

        return this;
    }

    //  If the Sherpa's setup is complete, then we just toggle the HUD and exit.
    if (this.get('setupComplete')) {
        TP.byId('SherpaHUD', this.get('vWin')).toggle('closed');

        return this;
    }

    //  Otherwise, execute the setup process.
    this.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('updateUICanvasSource',
function(mutatedNodes, mutationAncestor, operation, attributeName,
         attributeValue, oldAttributeValue, shouldSignal) {

    /**
     * @method updateUICanvasSource
     * @summary Updates the source of the document currently being displayed as
     *     the UI canvas.
     * @param {Node[]} mutatedNodes The set of target Nodes that the mutations
     *     occurred against.
     * @param {Element} mutationAncestor The common ancestor of the mutating
     *     nodes. This is particularly useful when deleting nodes because the
     *     mutating Element will already be detached from the DOM.
     * @param {String} operation The action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE that is currently causing the mutation.
     * @param {String} [attributeName] The name of the attribute that is changing
     *     (if this is an 'attributes' mutation).
     * @param {String} [attributeValue] The value of the attribute that is
     *     changing (if this is an 'attributes' mutation).
     * @param {String} [oldAttributeValue] The prior value of the attribute that
     *     is changing (if this is an 'attributes' mutation and the operation is
     *     TP.UPDATE or TP.DELETE).
     * @param {Boolean} [shouldSignal=true] If false no signaling occurs.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var isAttrChange,

        tagSrcElem,
        tagTPSrcElem,

        searchElem,

        originatingDoc,

        sourceLoc,
        sourceURI,

        sourceNode,

        wasTextBinding,

        processingNodes,
        mutatedNode,
        mutatedElem,

        originatingAddress,
        addresses,
        ancestorAddresses,

        currentNode,

        leni,
        i,

        lenj,
        j,

        address,

        insertionParent,

        updatingAnsTPElem,
        bindInfo,
        bindExprStr,

        newNode,

        shouldMarkDirty,
        wasDirty;

    /*
    for (i = 0; i < mutatedNodes.getSize(); i++) {
        console.log('nodeName: ' + mutatedNodes.at(i).nodeName + '\n' +
                    'operation: ' + operation + '\n' +
                    'attrName: ' + attributeName + '\n' +
                    'oldAttrValue: ' + oldAttributeValue + '\n' +
                    'attrValue: ' + attributeValue);
    }
    */

    if (TP.isEmpty(mutatedNodes)) {
        return this;
    }

    if (TP.notFalse(shouldSignal)) {
        //  Signal the system to let it know that the UI canvas changed.
        this.signal('CanvasChanged', TP.hc('targets', mutatedNodes,
                                            'operation', operation,
                                            'attrName', attributeName,
                                            'newValue', attributeValue,
                                            'prevValue', oldAttributeValue));
    }

    isAttrChange = TP.notEmpty(attributeName);

    //  Search the hierarchy for the nearest custom tag (using the same search
    //  criteria as above) to set as the tag source element.
    tagSrcElem = mutationAncestor;

    while (TP.isElement(tagSrcElem)) {
        tagTPSrcElem = TP.wrap(tagSrcElem);
        if (tagTPSrcElem.sherpaShouldAlterTemplate()) {
            break;
        }

        tagSrcElem = tagSrcElem.parentNode;
    }

    //  If the target Node is detached (or its not an Element), that means it
    //  must be being deleted from the visible DOM. By the time this method is
    //  called, because of the way MutationObservers work, its parentNode will
    //  be set to null and we have to use a more complex mechanism to get it's
    //  position in the DOM.
    if (TP.nodeIsDetached(mutatedNodes.first()) ||
        !TP.isElement(mutatedNodes.first())) {
        searchElem = mutationAncestor;
    } else {
        searchElem = mutatedNodes.first();
    }

    //  If no tag source element could be computed, that means we're going to
    //  use the whole document as the source.
    if (!TP.isElement(tagSrcElem)) {
        originatingDoc = TP.nodeGetDocument(searchElem);
        sourceLoc = originatingDoc[TP.SRC_LOCATION];
    } else {
        //  Otherwise, grab the computed resource URI for the 'template' of the
        //  tag source element.
        sourceLoc = TP.wrap(tagSrcElem).
                        getType().
                        computeResourceURI('template');
    }

    if (TP.isEmpty(sourceLoc) || sourceLoc === TP.NO_RESULT) {
        //  TODO: Raise an exception here
        return this;
    }

    //  Make a URI from the source location and fetch its results
    //  *synchronously*. This will provide the 'source DOM' that we must modify.
    sourceURI = TP.uc(sourceLoc);
    sourceNode =
        sourceURI.getResource(
            TP.hc('async', false, 'resultType', TP.DOM)).get('result');

    //  Make sure to clone the source node before modifying the current node
    //  (which will either be the sourceNode or a descendant of it). That way,
    //  when we set the sourceURI's resource to it, it won't be the same node as
    //  the one that the sourceURI is holding now and the 'equals' comparison
    //  will operate properly.
    sourceNode = TP.nodeCloneNode(sourceNode);

    //  Find the location in the *source* DOM (the one that we just retrieved)
    //  that represents the underlying DOM structure of the source that we're
    //  modifying.

    processingNodes = TP.ac();

    leni = mutatedNodes.getSize();
    for (i = 0; i < leni; i++) {

        mutatedNode = mutatedNodes.at(i);

        //  Compute a 'mutated element' from the mutated node. This may be the
        //  node itself, if it's an Element.
        if (TP.isElement(mutatedNode)) {
            mutatedElem = mutatedNode;
        } else if (TP.isElement(mutatedNode.parentNode)) {
            mutatedElem = mutatedNode.parentNode;
        } else {
            mutatedElem = mutationAncestor;
        }

        //  If the mutated *element* (which could be the parent Element of the
        //  mutated node, if the mutated node is a Text node) has a
        //  'tibet:textbinding' attribute on it, that means that it was
        //  created by the mechanism that looks for ACP expressions in markup
        //  and creates a 'span' to wrap them.
        wasTextBinding =
            TP.elementHasAttribute(
                mutatedElem, 'tibet:textbinding');

        /* eslint-disable no-extra-parens */
        if (TP.nodeIsDetached(mutatedNode) ||
            (operation === TP.DELETE &&
                TP.notEmpty(mutatedNode[TP.PREVIOUS_POSITION]))) {
        /* eslint-enable no-extra-parens */

            //  If mutatedNode was a Text node that was a desugared text
            //  binding, then we normalize the mutatedElem (which will be the
            //  parent Element node) and grab it's address to use to find the
            //  source DOM's corresponding Text node.
            if (wasTextBinding) {
                TP.nodeNormalize(mutatedElem);

                originatingAddress = TP.nodeGetDocumentPosition(
                                        mutatedElem,
                                        null,
                                        tagSrcElem);
                addresses = originatingAddress.split('.');

                //  Now, because the last address will be the generated span
                //  that TIBET generated for this desugared text binding, and
                //  we're going to be removing the originally-authored text node
                //  from the source document, we need to pop one address off,
                //  basically ignoring the span.
                //  The set of addresses will now address the element that was
                //  the element that the expression was originally placed into.
                addresses.pop();
            } else {

                //  Now, we need to make sure that our detached node has a
                //  TP.PREVIOUS_POSITION value. This is placed by TIBET routines
                //  before the node is deleted and provides the document
                //  position that the node had before it was removed. We need
                //  this, because the node is detached and we no longer have
                //  access to its (former) parentNode.
                originatingAddress = mutatedNode[TP.PREVIOUS_POSITION];
                if (TP.isEmpty(originatingAddress)) {
                    //  TODO: Raise an exception here
                    return this;
                }

                addresses = originatingAddress.split('.');

                //  Note here how we get the ancestor addresses all the way to
                //  the top of the document. This is by design because the
                //  TP.PREVIOUS_POSITION for the detached node will have been
                //  computed the same way.
                ancestorAddresses =
                    TP.nodeGetDocumentPosition(mutationAncestor).split('.');

                //  If the size difference between the ancestor addresses and
                //  the originating address is more than 1, then the node is
                //  more than 1 level 'deeper' from the ancestor and we don't
                //  worry about it because we assume that one of the direct
                //  children of the ancestor (an ancestor of our detached node)
                //  will be detached via this mechanism, thereby taking care of
                //  us.
                if (addresses.getSize() - ancestorAddresses.getSize() > 1) {
                    return this;
                }

                //  Now, we recompute the addresses for the traversal below to
                //  be between the updating ancestor and the tag source Element.
                //  This will then be accurate to update the source DOM, which
                //  is always relative to the tag source element.
                ancestorAddresses = TP.nodeGetDocumentPosition(
                                        mutationAncestor, null, tagSrcElem);

                //  This will be empty if mutationAncestor and tagSrcElem are the
                //  same node.
                if (TP.isEmpty(ancestorAddresses)) {
                    ancestorAddresses = TP.ac();
                } else {
                    ancestorAddresses = ancestorAddresses.split('.');
                }

                //  Finally, we push on the last position of the address that
                //  the detached node had. Given our test above of 'not more
                //  than 1 level between the updating ancestor and the detached
                //  node', this will complete the path that we need to update
                //  the source DOM.
                ancestorAddresses.push(addresses.last());

                if (TP.notEmpty(ancestorAddresses)) {
                    //  Set it to be ready to go for logic below.
                    addresses = ancestorAddresses;
                }

                //  If it just contains one item, the empty string, then empty
                //  it.
                if (addresses.getSize() === 1 && addresses.first() === '') {
                    addresses.empty();
                }
            }
        } else {
            //  Now we get the address from the target element that the user is
            //  actually manipulating as offset by the tag source element. We
            //  will use this address information to traverse the source DOM.
            originatingAddress = TP.nodeGetDocumentPosition(mutatedNode,
                                                            null,
                                                            tagSrcElem);
            if (TP.notEmpty(originatingAddress)) {
                addresses = originatingAddress.split('.');

                //  Now, if we're processing a desugared text binding, the last
                //  address will be the text node that we're updating in the DOM
                //  with the new value and the next to last address will be the
                //  generated span that TIBET generated for this desugared text
                //  binding. Therefore, we need to pop two addresses off,
                //  basically ignoring both the text node and it's wrapping the
                //  span.
                //  The set of addresses will now address the element that was
                //  the element that the expression was originally placed into.
                if (wasTextBinding) {
                    addresses.pop();
                    addresses.pop();
                }
            } else {
                addresses = TP.ac();
            }
        }

        //  It's ok if the source node is a Document since addresses take into
        //  account the index from the #document into the root Element.

        insertionParent = null;

        currentNode = sourceNode;

        //  Loop over all of the addresses and traverse the source DOM using
        //  those addresses until we find the target of the mutations.
        lenj = addresses.getSize();
        for (j = 0; j < lenj; j++) {

            address = addresses.at(j);

            if (!TP.isNode(currentNode)) {
                //  TODO: Raise an exception.
                return this;
            }

            if (j === lenj - 1) {

                insertionParent = currentNode;

                //  If there isn't a Node (even a Text node) at the final
                //  address, then we're doing a pure append (in the case of the
                //  operation being a TP.CREATE). Therefore, we set currentNode
                //  (our insertion point) to null.
                if (!TP.isNode(currentNode.childNodes[address])) {
                    currentNode = null;
                } else {
                    //  Otherwise, set the currentNode (used as the insertion
                    //  point in a TP.CREATE) to the childNode at the last
                    //  address.
                    currentNode = currentNode.childNodes[address];
                }

                break;
            }

            currentNode = currentNode.childNodes[address];
        }

        //  NB: This might push 'null'... and for TP.CREATE operations, "that's
        //  ok" (since it will basically become an 'append' below).
        processingNodes.push(currentNode);
    }

    if (TP.isEmpty(processingNodes)) {

        //  TODO: Raise an exception.
        return this;
    }

    //  If we're changing the attribute, but don't have at last one element to
    //  change it on, then raise an exception and exit
    if (isAttrChange && TP.isEmpty(processingNodes)) {

        //  TODO: Raise an exception.
        return this;
    }

    shouldMarkDirty = false;

    leni = processingNodes.getSize();
    for (i = 0; i < leni; i++) {

        currentNode = processingNodes.at(i);

        if (operation === TP.CREATE) {

            if (isAttrChange) {
                TP.elementSetAttribute(currentNode,
                                        attributeName,
                                        attributeValue,
                                        true);
                shouldMarkDirty = true;
            } else {

                mutatedNode = mutatedNodes.at(i);

                if (TP.isElement(mutatedNode)) {
                    mutatedElem = mutatedNode;
                } else if (TP.isElement(mutatedNode.parentNode)) {
                    mutatedElem = mutatedNode.parentNode;
                } else {
                    mutatedElem = mutationAncestor;
                }

                wasTextBinding =
                    TP.elementHasAttribute(
                        mutatedElem, 'tibet:textbinding');

                //  If this was a Text node representing a desugared text
                //  binding then we have to update the text expression by using
                //  the first data expression found in the updating ancestor's
                //  (to the Text node) binding information.
                if (wasTextBinding) {

                    updatingAnsTPElem = TP.wrap(mutationAncestor);
                    bindInfo = updatingAnsTPElem.getBindingInfoFrom(
                                    updatingAnsTPElem.getAttribute('bind:in'));

                    bindExprStr = bindInfo.at('value').at('fullExpr');

                    //  Create a new text node and append it to the current node
                    //  in the source DOM (the ancestor of the Text node there)
                    //  that contains the binding expression. Note that the Text
                    //  node containing the old binding expression will have
                    //  already been removed by a prior mutation.
                    TP.nodeAppendChild(
                        currentNode,
                        TP.nodeGetDocument(currentNode).createTextNode(
                                                                bindExprStr),
                        false);

                    shouldMarkDirty = true;
                } else {

                    //  Clone the node
                    newNode = TP.nodeCloneNode(mutatedNode, true, false);

                    if (TP.isElement(newNode)) {

                        //  'Clean' the Element of any runtime constructs put
                        //  there by TIBET.
                        TP.elementClean(newNode);

                        TP.nodeInsertBefore(insertionParent,
                                            newNode,
                                            currentNode,
                                            false);
                    } else if (TP.isTextNode(newNode)) {

                        //  It's just a Text node - we use it and it's contents
                        //  literally.
                        TP.nodeAppendChild(insertionParent,
                                            newNode,
                                            false);
                    }

                    shouldMarkDirty = true;
                }
            }
        } else if (operation === TP.DELETE) {

            if (isAttrChange) {
                TP.elementRemoveAttribute(currentNode, attributeName, true);
                shouldMarkDirty = true;
            } else {
                if (wasTextBinding) {
                    //  NB: currentNode is the ancestor Element that is holding
                    //  the text node that represents the sugared binding
                    //  expression.
                    TP.nodeDetach(currentNode.firstChild);
                    shouldMarkDirty = true;
                } else {
                    TP.nodeDetach(currentNode);
                    shouldMarkDirty = true;
                }
            }

        } else if (operation === TP.UPDATE) {

            //  No other node types except Attribute nodes will have a TP.UPDATE
            //  operation (the other nodes - Elements and Text nodes - will
            //  'delete' and 'insert' themselves in two separate operations).
            if (isAttrChange) {

                //  If the attribute was one of the special 'href'/'onclick'
                //  combinations that we generate on links to 'trap' routing
                //  accesses, then don't save these attributes.
                if (attributeName === 'href' && attributeValue === '#') {
                    //  empty
                } else if (attributeName === 'onclick' &&
                            attributeValue.contains('TP.go2(\'#')) {
                    //  empty
                } else {
                    TP.elementSetAttribute(currentNode,
                                            attributeName,
                                            attributeValue,
                                            true);
                    shouldMarkDirty = true;
                }
            }
        }
    }

    if (shouldMarkDirty) {
        //  Set the resource of the sourceURI back to the updated source node.
        sourceURI.setResource(sourceNode, TP.request('signalChange', false));

        //  Lastly, because of the way that the dirtying machinery works, we
        //  need to separately signal the dirty each time. This is because 2nd
        //  and subsequent times, when the dirty flag is true, it won't send the
        //  notification again. We need observers of 'dirty' to keep getting
        //  notifications.
        wasDirty = sourceURI.isDirty();
        TP.$changed.call(
            sourceURI,
            'dirty',
            TP.UPDATE,
            TP.hc(TP.OLDVAL, wasDirty, TP.NEWVAL, true));
    }

    //  Make sure to refresh all of the descendant document positions.
    TP.nodeRefreshDescendantDocumentPositions(TP.sys.uidoc(true));

    return this;
});

//  ============================================================================
//  Sherpa-specific TP.sig.Signal subtypes
//  ============================================================================

//  Sherpa signals
TP.sig.Signal.defineSubtype('SherpaSignal');

TP.sig.SherpaSignal.Type.isControllerSignal(true);
TP.sig.SherpaSignal.isControllerRoot(true);

TP.sig.SherpaSignal.defineSubtype('ToggleSherpa');

TP.sig.SherpaSignal.defineSubtype('SherpaReady');

//  Console input signals
TP.sig.SherpaSignal.defineSubtype('ConsoleInput');

//  Console processing signals
TP.sig.ResponderSignal.defineSubtype('ConsoleCommand');
TP.sig.ResponderSignal.defineSubtype('RemoteConsoleCommand');

TP.sig.ResponderSignal.defineSubtype('AssistObject');
TP.sig.ResponderSignal.defineSubtype('EditObject');
TP.sig.ResponderSignal.defineSubtype('InspectObject');

TP.sig.ResponderSignal.defineSubtype('RemoveConsoleTab');

//  Keyboard handling signals
TP.sig.SherpaSignal.defineSubtype('EndAutocompleteMode');
TP.sig.SherpaSignal.defineSubtype('EndSearchMode');

//  Tile signals
TP.sig.SherpaSignal.defineSubtype('TileDidOpen');
TP.sig.SherpaSignal.defineSubtype('TileWillDetach');

//  Halo Signals
TP.sig.SherpaSignal.defineSubtype('HaloDidBlur');
TP.sig.SherpaSignal.defineSubtype('HaloDidFocus');

//  Inspector Signals
TP.sig.SherpaSignal.defineSubtype('NavigateInspector');

TP.sig.SherpaSignal.defineSubtype('InspectorDidFocus');

TP.sig.ResponderSignal.defineSubtype('FocusInspectorForBrowsing');
TP.sig.ResponderSignal.defineSubtype('FocusInspectorForEditing');

//  Breadcrumb Signals
TP.sig.SherpaSignal.defineSubtype('BreadcrumbSelected');

//  Screen Signals
TP.sig.SherpaSignal.defineSubtype('ToggleScreen');
TP.sig.SherpaSignal.defineSubtype('FocusScreen');

//  GUI Signals
TP.sig.ResponderSignal.defineSubtype('SherpaHaloToggle');
TP.sig.ResponderSignal.defineSubtype('SherpaOutlinerToggle');

//  Notifier Signals
TP.sig.ResponderSignal.defineSubtype('SherpaNotify');

//  Sherpa canvas signals
TP.sig.SherpaSignal.defineSubtype('CanvasChanged');

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
