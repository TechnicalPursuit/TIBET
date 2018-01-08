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
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     * @returns {TP.core.Sherpa} The receiver.
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

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Type.defineMethod('hasStarted',
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

TP.core.Sherpa.Type.defineMethod('isOpen',
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

TP.core.Sherpa.Type.defineMethod('replaceWithUnknownElementProxy',
function(anElement) {

    /**
     * @method replaceWithUnknownElementProxy
     * @summary This method, invoked from the core TIBET tag processing
     *     machinery if the Sherpa is loaded and running in the current system,
     *     will replace the supplied element with a stand in (a so-called 'tofu'
     *     element) that represents an element type that is not yet known to the
     *     system.
     * @param {Element} anElement The element to replace.
     * @returns {TP.core.Sherpa} The receiver.
     */

    var newTagContent,
        newElement;

    newTagContent = TP.str(anElement);

    //  Build a chunk of markup that is a 'tibet:tofu' element with identifying
    //  information about the element that it is standing in for.
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

    TP.elementReplaceWith(anElement, newElement);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the view window (i.e. the window containing the sherpa)
TP.core.Sherpa.Inst.defineAttribute('vWin');

//  whether or not our setup is complete
TP.core.Sherpa.Inst.defineAttribute('setupComplete');

//  whether or not the Sherpa should process mutations to the DOM of the
//  current UI canvas and update the source DOM that is represented there.
TP.core.Sherpa.Inst.defineAttribute('shouldProcessDOMMutations');

//  a timeout that will cause the 'shouldProcessDOMMutations' flag to be reset
//  to false. This is needed because the Mutation Observer machinery that we use
//  to manage changes to the source DOM is an asynchronous mechanism and the
//  shouldProcessDOMMutations flag is used by this machinery to determine
//  whether or not to update the source DOM of the current UI canvas.
TP.core.Sherpa.Inst.defineAttribute('$shouldProcessTimeout');

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

TP.core.Sherpa.Inst.defineMethod('asTP_sherpa_pp',
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

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('finishSetup',
function() {

    /**
     * @method finishSetup
     * @summary Finishes the Sherpa setup process by setting up all of the
     *     Sherpa's tools and configuring its drawers.
     * @returns {TP.core.Sherpa} The receiver.
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

    //  Set up the searcher
    //  this.setupSearcher();

    //  Set up the thumbnail viewer
    this.setupThumbnail();

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

    }, TP.sys.cfg('sherpa.setup.delay', 250));

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
     * @returns {TP.core.Sherpa} The receiver.
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

TP.core.Sherpa.Inst.defineHandler('RemoteConsoleCommand',
function(aSignal) {

    /**
     * @method handleRemoteConsoleCommand
     * @summary Handles signals that trigger remote console command execution.
     * @param {TP.sig.RemoteConsoleCommand} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.core.Sherpa} The receiver.
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

TP.core.Sherpa.Inst.defineHandler('AssistObject',
function(aSignal) {

    /**
     * @method handleAssistObject
     * @summary Handles signals that trigger an 'object assistant'.
     * @description Some objects (including console commands) fire this signal
     *     when they want the Sherpa to present an 'object assistant' in a modal
     *     dialog box.
     * @param {TP.sig.AssistObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.core.Sherpa} The receiver.
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

TP.core.Sherpa.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @description Note that this handler fires because the Sherpa is in the
     *     controller stack and this signal is sent through there as well as its
     *     direct observers.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.core.sherpa} The receiver.
     */

    var world,
        currentScreenTPWin;

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

    TP.activateMutationObserver(
        currentScreenTPWin.getNativeDocument(),
        'BUILDER_OBSERVER');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.core.sherpa} The receiver.
     */

    if (TP.sys.isTesting()) {
        return this;
    }

    TP.deactivateMutationObserver('BUILDER_OBSERVER');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('EditObject',
function(aSignal) {

    /**
     * @method handleEditObject
     * @summary Handles signals that trigger the inspector's object editing
     *     capabilities.
     * @param {TP.sig.EditObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.core.Sherpa} The receiver.
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

TP.core.Sherpa.Inst.defineHandler('InspectObject',
function(aSignal) {

    /**
     * @method handleInspectObject
     * @summary Handles signals that trigger the inspector's object inspection
     *     capabilities.
     * @param {TP.sig.InspectObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.core.Sherpa} The receiver.
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

TP.core.Sherpa.Inst.defineHandler('TypeLoaded',
function(aSignal) {

    /**
     * @method handleTypeLoaded
     * @summary Handles signals that are triggered when a new type is loaded.
     * @param {TP.sig.TypeLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.core.Sherpa} The receiver.
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

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('RouteExit',
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
     * @returns {TP.core.sherpa} The receiver.
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

TP.core.Sherpa.Inst.defineHandler('SherpaNotify',
function(aSignal) {

    /**
     * @method handleSherpaNotify
     * @summary Displays a notifier for the signal payload's message slot, if
     *     any.
     * @param {TP.sig.SherpaNotify} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.core.Sherpa} The receiver.
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
        return;
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

TP.core.Sherpa.Inst.defineHandler('ToggleSherpa',
function(aSignal) {

    /**
     * @method handleToggleSherpa
     * @summary Handles signals that are triggered when the Sherpa is to be
     *     toggled.
     * @param {TP.sig.ToggleSherpa} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.core.Sherpa} The receiver.
     */

    this.toggle();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('makeCustomTagFrom',
function(aTPElem) {

    /**
     * @method makeCustomTagFrom
     * @summary Constructs a custom tag using the supplied element. This will
     *     invoke the 'type assistant' with the 'templatedtag' DNA selected.
     * @param {TP.core.Element} aTPElem The element content to make a custom tag
     *     from.
     * @returns {TP.core.sherpa} The receiver.
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
                                ' --supertype=\'TP.core.TemplatedTag\'' +
                                ' --dna=\'templatedtag\''
                ));

    //  Set up a handler that will wait for a 'TypeAdded' signal.
    handler = function(typeAddedSignal) {

        var elem,
            tagType,
            tagName,

            resourceURI,
            serializationStorage,

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
        //  representation of supplied TP.core.Element as the new tag's
        //  template.
        if (TP.isKindOf(tagType, TP.core.TemplatedTag)) {

            //  Create a tag name from the type's namespace prefix and local
            //  name.
            tagName = tagType.getNamespacePrefix() +
                        ':' +
                        tagType.getLocalName();

            //  Get the resource URI that we'll use to store it under.
            resourceURI = tagType.getResourceURI('template');

            //  Create a serialization storage object and populate the root
            //  store location with the resource URI.
            serializationStorage = TP.hc();
            serializationStorage.atPut('store', resourceURI.getLocation());

            //  Stamp the 'tibet:tag' attribute on it before it goes out.
            TP.elementSetAttribute(TP.unwrap(aTPElem),
                                    'tibet:tag', tagName, true);

            //  Run the serialization engine on it.
            aTPElem.serializeForStorage(serializationStorage);

            //  The document that we were installed into.
            sherpaDoc = this.get('vWin').document;

            //  Save the template to the file system. If this succeeds, then
            //  replace the supplied TP.core.Element with the new custom tag.
            this.saveElementSerialization(
                    serializationStorage,
                    function() {
                        var oldElem,
                            parentElem,
                            newTPElem,
                            newElem,

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

                            //  Tell the main Sherpa object that it should go
                            //  ahead and process DOM mutations to the source
                            //  DOM.
                            TP.bySystemId('Sherpa').set(
                                'shouldProcessDOMMutations', true);

                            newElem = TP.unwrap(newTPElem);
                            newElem = TP.nodeReplaceChild(
                                        parentElem, newElem, oldElem);
                            newTPElem = TP.wrap(newElem);

                            halo = TP.byId('SherpaHalo', sherpaDoc);

                            //  This will move the halo off of the old element.
                            //  Note that we do *not* check here whether or not
                            //  we *can* blur - we definitely want to blur off
                            //  of the old DOM content - it's probably gone now
                            //  anyway.

                            //  Blur and refocus the halo on the haloTarget.
                            halo.blur();

                            if (newTPElem.haloCanFocus(halo)) {
                                halo.focusOn(newTPElem);
                            }
                        }
                    });
        }
    }.bind(this);

    handler.observe(TP.ANY, 'TypeAdded');

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('makeTile',
function(anID, headerText, tileParent, shouldDock) {

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
     * @param {Boolean} [shouldDock=true] Whether or not to configure the tile
     *     to be 'dockable'.
     * @returns {TP.sherpa.tile} The newly created tile.
     */

    var tileTemplateTPElem,

        parent,
        tileTPElem,

        tileID,

        wantsToDock,

        centerTPElem,
        centerTPElemPageRect;

    //  Grab the TP.sherpa.tile's template.
    tileTemplateTPElem = TP.sherpa.tile.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML);

    //  If the caller didn't supply a parent, then use the Sherpa's common tile
    //  layer as the new tile's parent.
    parent = tileParent;
    if (!TP.isElement(parent) &&
        !TP.isKindOf(parent, TP.core.ElementNode)) {
        parent = TP.byId('commonTileLayer', this.get('vWin'));
    }

    //  Add the tile's template to the parent.
    tileTPElem = TP.wrap(parent).addContent(tileTemplateTPElem);

    //  Make sure to escape any necessary characters.
    tileID = TP.escapeTypeName(anID);

    //  Set the ID and header text
    tileTPElem.setID(tileID);
    tileTPElem.setHeaderText(headerText);

    //  The default is to create a dockable tile.
    wantsToDock = TP.notDefined(shouldDock, true);
    tileTPElem.set('shouldDock', wantsToDock);

    //  Center this based on where the 'center' div is located.
    centerTPElem = TP.byId('center', this.get('vWin'));
    centerTPElemPageRect = centerTPElem.getOffsetRect();

    tileTPElem.setOffsetPosition(
        TP.pc(centerTPElemPageRect.getX(), centerTPElemPageRect.getY()));

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('processUICanvasMutationRecords',
function(mutationRecords) {

    /**
     * @method processUICanvasMutationRecords
     * @summary Processes records from a Mutation Observer against the source of
     *     the document currently rendered as the UI canvas.
     * @param {MutationRecord[]} mutationRecords The Array of MutationRecords
     *     that we are being asked to process.
     * @returns {TP.core.sherpa} The receiver.
     */

    var len,
        i,
        record,

        lenj,
        j,

        attrName,
        attrPrefix,
        attrValue,
        attrOldValue,

        attrIsEmpty,
        attrWasEmpty,

        node;

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
                        this.updateUICanvasSource(record.target,
                                                    null,
                                                    TP.CREATE,
                                                    attrName,
                                                    attrValue,
                                                    null);
                    } else if (!attrIsEmpty && !attrWasEmpty) {
                        this.updateUICanvasSource(record.target,
                                                    null,
                                                    TP.UPDATE,
                                                    attrName,
                                                    attrValue,
                                                    attrOldValue);
                    } else if (attrIsEmpty && !attrWasEmpty) {
                        this.updateUICanvasSource(record.target,
                                                    null,
                                                    TP.DELETE,
                                                    attrName,
                                                    null,
                                                    attrOldValue);
                    }
                }

                break;

            case 'childList':

                //  NB: We process the removed nodes *first* here. This allows
                //  us to keep things in sync much better when replacing one
                //  node with another. They will typically come in on the same
                //  mutation record with 1 node removed and 1 node added and we
                //  want to keep that order.

                if (TP.notEmpty(record.removedNodes)) {
                    lenj = record.removedNodes.length;
                    for (j = 0; j < lenj; j++) {

                        node = record.removedNodes[j];
                        this.updateUICanvasSource(
                                    node, record.target, TP.DELETE);
                    }
                }

                if (TP.notEmpty(record.addedNodes)) {
                    lenj = record.addedNodes.length;
                    for (j = 0; j < lenj; j++) {

                        node = record.addedNodes[j];
                        this.updateUICanvasSource(
                                    node, record.target, TP.CREATE);
                    }
                }

                break;

            default:
                break;
        }
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('saveElementSerialization',
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
     * @returns {TP.core.Sherpa} The receiver.
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
            req = uri.constructRequest();

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

TP.core.Sherpa.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the TP.core.Sherpa object.
     * @returns {TP.core.sherpa} The receiver.
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
                thisref.finishSetup();

                //  Complete the setup after a final delay - we want to
                //  schedule this *after* the finishSetup().
                setTimeout(function() {
                    TP.byId('SherpaHUD', win).toggle('closed');
                    thisref.sherpaSetupComplete();
                }, 250);

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
                            'style[tibet|originalHref$="sherpa_framing.css"]',
                            win,
                            true,
                            false);

    variablesRule = TP.styleSheetGetStyleRulesMatching(
                        TP.cssElementGetStyleSheet(framingStyleElement),
                        'body').first();

    //  Install a custom function on the TP.core.DragResponder type that can be
    //  referenced in the markup.
    TP.core.DragResponder.Type.defineConstant(
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

TP.core.Sherpa.Inst.defineMethod('setShouldProcessDOMMutations',
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
     * @returns {TP.core.Sherpa} The receiver.
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

TP.core.Sherpa.Inst.defineMethod('setupBuilderObserver',
function() {

    /**
     * @method setupBuilderObserver
     * @summary Sets up a managed Mutation Observer that handles insertions and
     *     deletions as GUI is built using various parts of the Sherpa.
     * @returns {TP.core.sherpa} The receiver.
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
                                        'tibet:desugaredTextBinding',
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
    //          'tibet:globalDocID'
    //          'tibet:originalHref'
    //          'tibet:recasting'
    //          'tibet:type'
    //      - generated 'id' attributes
    //      - Sherpa-related 'class' attributes
    //      - Sherpa-related other attributes

    TP.addMutationObserverFilter(
        function(aMutationRecord) {

            var attrName,
                attrPrefix,
                attrValue,
                attrOldValue,

                realElemPrefix,
                realElemLocalName,

                computedElemName,
                computedElemNameParts,
                computedElemPrefix,
                computedElemLocalName;

            if (aMutationRecord.type === 'attributes') {

                //  Compute attribute name, value, old value and prefix

                attrName = aMutationRecord.attributeName;

                if (TP.notEmpty(aMutationRecord.attributeNamespace)) {
                    if (!TP.regex.HAS_COLON.test(attrName)) {
                        attrPrefix = TP.w3.Xmlns.getURIPrefix(
                                        aMutationRecord.attributeNamespace,
                                        aMutationRecord.target);
                        attrName = attrPrefix + ':' + attrName;
                    } else {
                        attrPrefix = attrName.slice(
                                        0, attrName.indexOf(':'));
                    }
                }

                attrValue = TP.elementGetAttribute(
                                aMutationRecord.target,
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

                switch (attrName) {

                    case 'tibet:focuscontext':
                    case 'tibet:for':
                    case 'tibet:globalDocID':
                    case 'tibet:originalHref':
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

                        //  In the first case, we use the real element name
                        //  prefix and tagName and see if they're joined
                        //  together with an underscore ('_'). If so, then it's
                        //  very likely that TIBET generated it and so we ignore
                        //  it.
                        realElemPrefix = aMutationRecord.target.prefix;
                        realElemLocalName = aMutationRecord.target.tagName;

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
                                TP.elementGetFullName(aMutationRecord.target);
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

    //  Add a managed Mutation Observer filter Function that will filter
    //  child tree mutation records for:
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
                        if (attrValue === TP.ietf.Mime.TIBET_CSS) {
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

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupConsole',
function() {

    /**
     * @method setupConsole
     * @summary Sets up the Sherpa's 'console' component. The Sherpa's console
     *     provides a command line interface to the underlying TIBET Shell
     *     (TSH).
     * @returns {TP.core.sherpa} The receiver.
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
                            TP.ietf.Mime.XHTML);

    consoleOutputTPElem = consoleOutputTPElem.clone();
    consoleOutputTPElem.compile();

    //  Set the console output's ID and add it to the 'center' div.
    consoleOutputTPElem.setAttribute('id', 'SherpaConsoleOutput');

    consoleOutputTPElem = TP.byId('center', viewDoc).addContent(
                                                    consoleOutputTPElem);

    //  Now we can set up the input cell. It currently goes into the south
    //  drawer.

    consoleInputTPElem = TP.sherpa.console.getResourceElement('template',
                            TP.ietf.Mime.XHTML);

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

TP.core.Sherpa.Inst.defineMethod('setupContextMenu',
function() {

    /**
     * @method setupContextMenu
     * @summary Sets up the Sherpa's 'context menu' component. The Sherpa's
     *     context menu provides a way to issue commands to the system via the
     *     'right button' click.
     * @returns {TP.core.sherpa} The receiver.
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
                            TP.ietf.Mime.XHTML);

    menuTPElem = menuTPElem.clone();

    TP.byId('center', this.get('vWin')).addRawContent(menuTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupHalo',
function() {

    /**
     * @method setupHalo
     * @summary Sets up the Sherpa's 'halo' component. The halo is the component
     *     that overlays elements in the GUI and controls which element is the
     *     current focus of manipulation activities.
     * @returns {TP.core.sherpa} The receiver.
     */

    var haloTPElem;

    haloTPElem = TP.sherpa.halo.getResourceElement('template',
                            TP.ietf.Mime.XHTML);

    haloTPElem = haloTPElem.clone();
    haloTPElem.compile();

    TP.byId('center', this.get('vWin')).addContent(haloTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupHUD',
function() {

    /**
     * @method setupHUD
     * @summary Sets up the Sherpa's 'hud' component. The hud is the component
     *     that controls the drawers that encompass the user's application
     *     canvas. These drawers contain controls that the user uses to
     *     manipulate their applocation.
     * @returns {TP.core.sherpa} The receiver.
     */

    var hudTPElem;

    hudTPElem = TP.byId('SherpaHUD', this.get('vWin'));
    hudTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupInspector',
function() {

    /**
     * @method setupInspector
     * @summary Sets up the Sherpa's 'inspector' component. The inspector is the
     *     component that allows a user to browse 'under the covers' using a
     *     multi-bay, hierarchical approach.
     * @returns {TP.core.sherpa} The receiver.
     */

    var inspectorTPElem;

    inspectorTPElem = TP.byId('SherpaInspector', this.get('vWin'));
    inspectorTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupOutliner',
function() {

    /**
     * @method setupOutliner
     * @summary Sets up the Sherpa's 'outliner' component. The outliner is the
     *     component that allows a user to visualize and manipulate the
     *     underlying DOM structure of their application.
     * @returns {TP.core.sherpa} The receiver.
     */

    //  The outliner doesn't have a visual 'tag' representation, so we manually
    //  construct it. This will set its ID and register it so that it can be
    //  found.
    TP.sherpa.outliner.construct();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupSearcher',
function() {

    /*
    var searchDrawerContent;

    searchDrawerContent = TP.byCSSPath('sherpa|search > .content',
                                        this.get('vWin'),
                                        true);

    searchDrawerContent.insertContent('<sherpa:searcher/>', TP.AFTER_BEGIN);
    */

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupThumbnail',
function() {

    /*
    TP.byId('SherpaThumbnail', this.get('vWin')).setup();
    */

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupWorkbench',
function() {

    /**
     * @method setupWorkbench
     * @summary Sets up the Sherpa's 'workbench' component. The workbench is the
     *     component that contains the inspector and its attendant toolbars.
     * @returns {TP.core.sherpa} The receiver.
     */

    var workbenchTPElem;

    workbenchTPElem = TP.byId('SherpaWorkbench', this.get('vWin'));
    workbenchTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupWorld',
function() {

    /**
     * @method setupWorld
     * @summary Sets up the Sherpa's 'world' component. The world is the
     *     component that holds a collection of 'screens' used by the Sherpa to
     *     load different parts of the user's application GUI into and allows
     *     the author to easily switch between them.
     * @returns {TP.core.sherpa} The receiver.
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

TP.core.Sherpa.Inst.defineMethod('sherpaSetupComplete',
function() {

    /**
     * @method sherpaSetupComplete
     * @summary Completes the setting up of the Sherpa. This is called once all
     *     of the Sherpa's drawers have loaded with their content and have
     *     animated in. It is called only once, however.
     * @returns {TP.core.sherpa} The receiver.
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
            thisref.signal('SherpaReady');
        }, 1000);
    };
    hudCompletelyOpenFunc.observe(drawerElement, 'TP.sig.DOMTransitionEnd');

    //  Toggle the east and west drawers to their 'maximum open' state.
    TP.byCSSPath('#west sherpa|opener', viewWin).at(0).signal('UIToggle');
    TP.byCSSPath('#east sherpa|opener', viewWin).at(0).signal('UIToggle');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('showTileAt',
function(tileID, title, existedHandler, newHandler) {

    /**
     * @method showTileAt
     * @summary Shows a tile with the supplied title and content at the supplied
     *     point.
     * @param {String} tileID The unique ID of the tile. If a tile with this ID
     *     cannot be found in the same document as the sidebar, then a new tile
     *     will be created.
     * @param {String} title The title of the tile.
     * @param {Function} [existedHandler] If supplied, this Function is executed
     *     after the tile is shown on screen when the tile already existed and
     *     wasn't created again.
     * @param {Function} [newHandler] If supplied, this Function is executed
     *     after the tile is shown on screen when the tile was newly created.
     * @returns {TP.core.Sherpa} The receiver.
     */

    var alreadyExisted,
        tileTPElem;

    alreadyExisted = false;

    //  Look for an existing tile.
    tileTPElem = TP.byId(tileID, this.get('vWin'));

    //  Couldn't find one? Create one.
    if (TP.notValid(tileTPElem)) {
        //  NB: Because we don't supply a parent here, the Sherpa will use the
        //  'common tile layer'.
        tileTPElem = this.makeTile(tileID, title);
    } else {
        tileTPElem.setHeaderText(title);
        alreadyExisted = true;
    }

    //  Show the tile.
    tileTPElem.setAttribute('hidden', false);

    if (alreadyExisted) {
        if (TP.isCallable(existedHandler)) {
            existedHandler(tileTPElem);
        }
    } else {
        if (TP.isCallable(newHandler)) {
            newHandler(tileTPElem);
        }
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('toggle',
function() {

    /**
     * @method toggle
     * @summary Toggles the Sherpa's HUD open and closed.
     * @returns {TP.core.sherpa} The receiver.
     */

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

TP.core.Sherpa.Inst.defineMethod('updateUICanvasSource',
function(aNode, aNodeAncestor, operation, attributeName, attributeValue,
         oldAttributeValue) {

    /**
     * @method updateUICanvasSource
     * @summary Updates the source of the document currently being displayed as
     *     the UI canvas.
     * @param {Node} aNode The target Node that the mutation occurred against.
     * @param {Element} aNodeAncestor The ancestor of the mutating Element.
     *     This is particularly useful when deleting nodes because the mutating
     *     Element will already be detached from the DOM.
     * @param {String} operation The action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE that is currently causing the mutation.
     * @param {String} attributeName The name of the attribute that is changing
     *     (if this is an 'attributes' mutation).
     * @param {String} attributeValue The value of the attribute that is
     *     changing (if this is an 'attributes' mutation).
     * @param {String} oldAttributeValue The prior value of the attribute that
     *     is changing (if this is an 'attributes' mutation and the operation is
     *     TP.UPDATE or TP.DELETE).
     * @returns {TP.core.sherpa} The receiver.
     */

    var isAttrChange,

        xhtmlURIs,

        // xmlns,

        tagSrcElem,
        wasSrcRoot,

        startAtSearchElem,

        searchElem,

        ansXmlns,

        originatingDoc,

        sourceLoc,
        sourceURI,

        sourceNode,

        wasADesugaredTextBinding,

        originatingAddress,
        addresses,
        ancestorAddresses,

        currentNode,

        len,
        i,

        address,

        insertionParent,

        updatingAnsTPElem,
        bindInfo,
        bindExprStr,

        newNode,

        results,

        shouldMarkDirty,
        wasDirty;

    /*
    console.log('nodeName: ' + aNode.nodeName + '\n' +
                'operation: ' + operation + '\n' +
                'attrName: ' + attributeName + '\n' +
                'oldAttrValue: ' + oldAttributeValue + '\n' +
                'attrValue: ' + attributeValue);
    */

    if (!TP.isNode(aNode)) {
        //  TODO: Raise an exception here
        return this;
    }

    if (TP.isElement(aNode)) {
        this.signal('CanvasChanged', TP.hc('target', aNode,
                                            'operation', operation,
                                            'attrName', attributeName,
                                            'newValue', attributeValue,
                                            'prevValue', oldAttributeValue));
    }

    isAttrChange = TP.notEmpty(attributeName);

    xhtmlURIs = TP.w3.Xmlns.getXHTMLURIs();

    //  Whether or not the target Element is actually a 'source root' (i.e. is
    //  it itself a custom tag of some sort with a source). Initially set to
    //  false.
    wasSrcRoot = false;

    //  If the target Node is detached (or its not an Element), that means it
    //  must be being deleted from the visible DOM. By the time this method is
    //  called, because of the way MutationObservers work, its parentNode will
    //  be set to null and we have to use a more complex mechanism to get it's
    //  position in the DOM.
    if (TP.nodeIsDetached(aNode) || !TP.isElement(aNode)) {
        searchElem = aNodeAncestor;
        startAtSearchElem = true;
    } else {
        searchElem = aNode;
        startAtSearchElem = false;
    }

    //  If the element we're using to search for the source is itself a) not in
    //  the XHTML namespace and b) has a 'tibet:tag' attribute, then its acting
    //  as it's own tag source. So we make it such and flip our wasSrcRoot flag.
    /*
    xmlns = searchElem.namespaceURI;
    if (isAttrChange &&
        (!xhtmlURIs.contains(xmlns) ||
            TP.elementHasAttribute(searchElem, 'tibet:tag', true))) {

        tagSrcElem = searchElem;
        wasSrcRoot = true;
    } else {
    */
    //  If we're supposed to start our search for the tag source element at
    //  our search element, then the mutated node must be being detached and
    //  therefore the initial search element is set to the aNodeAncestor
    //  above. We want to start the search there.
    if (startAtSearchElem) {
        tagSrcElem = searchElem;
    } else {

        //  Otherwise, we want to start the search for the tag source
        //  element at the search element's parentNode.
        tagSrcElem = searchElem.parentNode;
    }

    //  Search the hierarchy for the nearest custom tag (using the same
    //  search criteria as above) to set as the tag source element.
    while (TP.isElement(tagSrcElem)) {

        ansXmlns = tagSrcElem.namespaceURI;
        if (!xhtmlURIs.contains(ansXmlns) ||
            TP.elementHasAttribute(tagSrcElem, 'tibet:tag', true)) {
            break;
        }

        tagSrcElem = tagSrcElem.parentNode;
    }
    // }

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

    //  If the element we're using to search for has a
    //  'tibet:desugaredTextBinding' attribute on it, that means that it was
    //  created by the mechanism that looks for ACP expressions in markup and
    //  creates a 'span' to wrap them.
    wasADesugaredTextBinding =
        TP.elementHasAttribute(searchElem, 'tibet:desugaredTextBinding');

    //  Find the location in the *source* DOM (the one that we just retrieved)
    //  that represents the underlying DOM structure of the source that rendered
    //  the current GUI that we're modifying.

    if (!wasSrcRoot) {

        if (TP.nodeIsDetached(aNode)) {

            //  If aNode was detached and the operation is *not* TP.DELETE,
            //  then we have a problem. Raise an exception and exit.
            if (operation !== TP.DELETE) {
                //  TODO: Raise an exception here
                return this;
            }

            //  If aNode was a Text node that was a desugared text binding, then
            //  we normalize the searchElem (which will be the parent Element
            //  node) and grab it's address to use to find the source DOM's
            //  corresponding Text node.
            if (wasADesugaredTextBinding) {

                TP.nodeNormalize(searchElem);

                originatingAddress = TP.nodeGetDocumentPosition(
                                        searchElem.parentNode,
                                        null,
                                        tagSrcElem);
                addresses = originatingAddress.split('.');

            } else {

                //  If aNode was a regular Text, then use the address of the
                //  node ancestor (which will be it's parent Element node).
                if (TP.isTextNode(aNode)) {
                    ancestorAddresses = TP.nodeGetDocumentPosition(
                                            aNodeAncestor, null, tagSrcElem);
                    ancestorAddresses = ancestorAddresses.split('.');
                } else {
                    //  Now, we need to make sure that our detached node has a
                    //  TP.PREVIOUS_POSITION value. This is placed by TIBET
                    //  routines before the node is deleted and provides the
                    //  document position that the node had before it was
                    //  removed. We need this, because the node is detached and
                    //  we no longer have access to its (former) parentNode.
                    originatingAddress = aNode[TP.PREVIOUS_POSITION];
                    if (TP.isEmpty(originatingAddress)) {
                        //  TODO: Raise an exception here
                        return this;
                    }

                    addresses = originatingAddress.split('.');

                    //  Note here how we get the ancestor addresses all the way
                    //  to the top of the document. This is by design because
                    //  the TP.PREVIOUS_POSITION for the detached node will have
                    //  been computed the same way.
                    ancestorAddresses =
                        TP.nodeGetDocumentPosition(aNodeAncestor).split('.');

                    //  If the size difference between the ancestor addresses
                    //  and the originating address is more than 1, then the
                    //  node is more than 1 level 'deeper' from the ancestor and
                    //  we don't worry about it because we assume that one of
                    //  the direct children of the ancestor (an ancestor of our
                    //  detached node) will be detached via this mechanism,
                    //  thereby taking care of us.
                    if (addresses.getSize() - ancestorAddresses.getSize() > 1) {
                        return this;
                    }

                    //  Now, we recompute the addresses for the traversal below
                    //  to be between the updating ancestor and the tag source
                    //  Element. This will then be accurate to update the source
                    //  DOM, which is always relative to the tag source element.
                    ancestorAddresses = TP.nodeGetDocumentPosition(
                                            aNodeAncestor, null, tagSrcElem);

                    //  This will be empty if aNodeAncestor and tagSrcElem are
                    //  the same node.
                    if (TP.isEmpty(ancestorAddresses)) {
                        ancestorAddresses = TP.ac();
                    } else {
                        ancestorAddresses = ancestorAddresses.split('.');
                    }

                    //  Finally, we push on the last position of the address
                    //  that the detached node had. Given our test above of 'not
                    //  more than 1 level between the updating ancestor and the
                    //  detached node', this will complete the path that we need
                    //  to update the source DOM.
                    ancestorAddresses.push(addresses.last());
                }

                if (TP.notEmpty(ancestorAddresses)) {
                    //  Set it to be ready to go for logic below.
                    addresses = ancestorAddresses;
                }

                if (addresses.getSize() === 1 && addresses.first() === '') {
                    addresses.empty();
                }
            }
        } else {
            //  Now we get the address from the target element that the user is
            //  actually manipulating up through the tag source element. We will
            //  use this address information to traverse the source DOM.
            originatingAddress = TP.nodeGetDocumentPosition(aNode,
                                                            null,
                                                            tagSrcElem);
            if (TP.notEmpty(originatingAddress)) {
                addresses = originatingAddress.split('.');

                if (wasADesugaredTextBinding) {
                    addresses.pop();
                }
            } else {
                addresses = TP.ac();
            }
        }

        //  Make sure that the source node is not a Document.
        if (TP.isDocument(sourceNode)) {
            sourceNode = TP.nodeGetDocument(sourceNode).documentElement;
        }

        insertionParent = null;

        currentNode = sourceNode;

        //  Loop over all of the addresses and traverse the source DOM using
        //  those addresses until we find the target of the mutations.
        len = addresses.getSize();
        for (i = 0; i < len; i++) {

            address = addresses.at(i);

            if (i === len - 1) {

                insertionParent = currentNode;

                //  If there isn't a Node (even a Text node) at the final
                //  address, then we're doing a pure append (in the case of the
                //  operation being a TP.CREATE). Therefore, we set currentNode
                //  (our insertion point) to null.
                if (TP.notValid(currentNode) ||
                        !TP.isNode(currentNode.childNodes[address])) {
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
    } else {

        //  Otherwise, the tag source element is itself being modified, so we
        //  can shortcut the whole search process here.
        currentNode = sourceNode;
    }

    //  If we're changing the attribute, but don't have an element to change it
    //  one, then raise an exception and exit
    if (isAttrChange && !TP.isElement(currentNode)) {

        //  TODO: Raise an exception.
        return this;
    }

    shouldMarkDirty = false;

    if (operation === TP.CREATE) {

        if (isAttrChange) {
            TP.elementSetAttribute(currentNode,
                                    attributeName,
                                    attributeValue,
                                    true);
            shouldMarkDirty = true;
        } else {

            //  If this was a Text node representing a desugared text binding
            //  then we have to update the text expression by using the first
            //  data expression found in the updating ancestor's (to the Text
            //  node) binding information.
            if (wasADesugaredTextBinding) {

                updatingAnsTPElem = TP.wrap(aNodeAncestor);
                bindInfo = updatingAnsTPElem.getBindingInfoFrom(
                                    updatingAnsTPElem.getAttribute('bind:in'));

                bindExprStr = bindInfo.at('value').at('dataExprs').at(0);
                bindExprStr = '[[' + bindExprStr + ']]';

                //  Create a new text node and append it to the current node in
                //  the source DOM (the ancestor of the Text node there) that
                //  contains the binding expression. Note that the Text node
                //  containing the old binding expression will have already been
                //  removed by a prior mutation.
                TP.nodeAppendChild(
                    currentNode,
                    TP.nodeGetDocument(currentNode).createTextNode(bindExprStr),
                    false);

                shouldMarkDirty = true;
            } else {

                //  Clone the node
                newNode = TP.nodeCloneNode(aNode, true, false);

                if (TP.isElement(newNode)) {

                    //  'Clean' the Element of any runtime constructs put there
                    //  by TIBET.
                    TP.elementClean(newNode);

                    TP.nodeInsertBefore(insertionParent,
                                        newNode,
                                        currentNode,
                                        false);
                } else if (TP.isTextNode(newNode)) {

                    //  It's just a Text node - we use it and it's contents
                    //  literally.
                    TP.nodeAppendChild(currentNode,
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
            if (wasADesugaredTextBinding) {
                //  NB: currentNode is the ancestor Element that is holding the
                //  text node that represents the sugared binding expression.
                TP.nodeDetach(currentNode.firstChild);
                shouldMarkDirty = true;
            } else if (TP.isTextNode(aNode)) {
                //  NB: currentNode is the ancestor Element holding the text
                //  node that matches aNode. We have to find the text node that
                //  matches the nodeValue of aNode and remove it.
                results = TP.elementGetTextNodesMatching(
                                    currentNode,
                                    function(aTextNode) {
                                        return aTextNode.nodeValue ===
                                                aNode.nodeValue;
                                    });
                if (TP.notEmpty(results)) {
                    TP.nodeDetach(results.first());
                    shouldMarkDirty = true;
                }
            } else {
                TP.nodeDetach(currentNode);
                shouldMarkDirty = true;
            }
        }

    } else if (operation === TP.UPDATE) {

        //  No other node types except Attribute nodes will have a TP.UPDATE
        //  operation (the other nodes - Elements and Text nodes - will 'delete'
        //  and 'insert' themselves in two separate operations.
        if (isAttrChange) {
            TP.elementSetAttribute(currentNode,
                                    attributeName,
                                    attributeValue,
                                    true);
            shouldMarkDirty = true;
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
