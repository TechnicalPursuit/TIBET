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

TP.core.Sherpa.Type.defineMethod('tokenizeForMatches',
function(inputText) {

    /**
     * @method tokenizeForMatches
     */

    var tokens,

        context,
        fragment,
        resolutionChunks,
        index,

        captureFragment,

        len,
        i,

        token,
        shouldExit,
        noMatches,

        isWhitespace;

    //  Invoke the tokenizer
    tokens = TP.$condenseJS(
                    inputText, false, false,
                    //  All of the JS operators *and* the TSH operators
                    TP.tsh.script.$tshAndJSOperators,
                    true, true, true);

    //  Reverse the tokens to start from the back
    tokens.reverse();

    context = 'JS';
    fragment = null;
    resolutionChunks = TP.ac();
    index = TP.NOT_FOUND;

    captureFragment = true;
    shouldExit = false;
    noMatches = false;

    isWhitespace = function(aToken) {
        var tokenName;

        tokenName = aToken.name;

        /* eslint-disable no-extra-parens */
        return (tokenName === 'space' ||
                tokenName === 'tab' ||
                tokenName === 'newline');
        /* eslint-enable no-extra-parens */
    };

    len = tokens.getSize();
    for (i = 0; i < len; i++) {
        token = tokens.at(i);

        switch (token.name) {

            case 'comment':

                noMatches = true;
                shouldExit = true;

                break;

            case 'uri':

                context = 'URI';

                resolutionChunks = null;
                fragment = token.value;
                index = token.from;

                shouldExit = true;

                break;

            case 'space':
            case 'tab':
            case 'newline':

                if (i === 0) {
                    noMatches = true;
                }

                shouldExit = true;

                break;

            case 'keyword':

                context = 'KEYWORD';

                if (tokens.at(i + 1) &&
                    isWhitespace(tokens.at(i + 1))) {
                    resolutionChunks = null;
                    fragment = token.value;
                    index = token.from;

                    shouldExit = true;
                } else {
                    fragment = token.value;
                    index = token.from;
                }

                break;

            case 'operator':

                switch (token.value) {

                    case '[':

                        if (tokens.at(i - 1).value === '\'') {
                            if (captureFragment === true) {
                                index = token.from + 2;
                            }

                            fragment = '';
                            captureFragment = false;
                        } else {
                            noMatches = true;
                            shouldExit = true;
                        }

                        break;

                    case '.':
                        if (captureFragment === true) {
                            index = token.from + 1;
                        }

                        captureFragment = false;

                        break;

                    case ':':

                        if (i === len - 1) {
                            context = 'TSH';

                            resolutionChunks = null;

                            index = 1;
                            shouldExit = true;
                        }

                        break;

                    case '/':

                        if (i === len - 1) {
                            context = 'CFG';

                            resolutionChunks = null;

                            index = 1;
                            shouldExit = true;
                        }

                        break;

                    default:

                        noMatches = true;
                        shouldExit = true;

                        break;
                }

                break;

            default:
                //  'substitution'
                //  'reserved'
                //  'identifier'
                //  'number'
                //  'string'
                //  'regexp'
                if (captureFragment) {
                    fragment = token.value;
                    index = token.from;
                } else {
                    resolutionChunks.unshift(token.value);
                }
                break;
        }

        if (noMatches) {
            context = null;

            resolutionChunks = null;
            fragment = null;
            index = TP.NOT_FOUND;
        }

        if (shouldExit) {
            break;
        }
    }

    if (TP.isEmpty(resolutionChunks) && TP.notEmpty(fragment)) {
        resolutionChunks = TP.ac(fragment);
    }

    return TP.hc(
            'context', context,
            'fragment', fragment,
            'resolutionChunks', resolutionChunks,
            'index', index);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the view window (i.e. the window containing the sherpa)
TP.core.Sherpa.Inst.defineAttribute('vWin');

//  whether or not our setup is complete
TP.core.Sherpa.Inst.defineAttribute('setupComplete');

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

    //  Set up the outliner
    this.setupOutliner();

    //  Set up the halo
    this.setupHalo();

    //  Set up the inspector
    this.setupInspector();

    //  Set up the searcher
    //  this.setupSearcher();

    //  Set up the thumbnail viewer
    this.setupThumbnail();

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

    //  This is a TP.core.Hash - iterate over it and gather up the arguments.
    originalArgs.perform(
            function(kvPair) {
                var argName,
                    argValue;

                argName = kvPair.first();
                argValue = kvPair.last();

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
                'dialogID', 'AssistantDialog',
                'isModal', true,
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

    var northDrawer;

    //  Open the north drawer
    northDrawer = TP.byId('north', this.get('vWin'));
    northDrawer.setAttribute('closed', false);

    //  Signal the inspector to focus itself for browsing on the target object
    //  supplied in the payload.
    TP.byId('SherpaInspector', this.get('vWin')).signal(
                            'FocusInspectorForBrowsing', aSignal.getPayload());

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
        message;

    notifier = TP.byId('SherpaNotifier', this.get('vWin'));
    if (TP.notValid(notifier)) {
        return;
    }

    message = aSignal.at('message');
    if (TP.notEmpty(message)) {
        notifier.setContent(message);
    }

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
                                ' --dna=\'templatedtag\''
                ));

    //  Set up a handler that will wait for a 'TypeAdded' signal.
    handler = function(typeAddedSignal) {

        var elem,
            tagType,
            tagName,

            resourceURI,
            serializationStorage;

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

            //  Save the template to the file system. If this succeeds, then
            //  replace the supplied TP.core.Element with the new custom tag.
            this.saveElementSerialization(
                    serializationStorage,
                    function() {
                        var newElem;

                        newElem = TP.nodeFromString('<' + tagName + '/>');
                        if (TP.isElement(newElem)) {
                            aTPElem.replaceWith(newElem);
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

        wantsToDock;

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

    //  Awaken the tile.
    tileTPElem.awaken();

    //  Avoid the north and west drawers
    //  TODO: This is cheesy - calculate these from drawer positions
    tileTPElem.setOffsetPosition(TP.pc(65, 215));

    return tileTPElem;
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

    //  Set up mutation observers that will watch for the resizers to
    //  become/resign being active and manage the 'transition' property of the
    //  '#center' element appropriately.

    centerElem = TP.byId('center', win, false);

    resizingHandler = function(mutationRecords) {

        var i,
            len,
            record;

        len = mutationRecords.getSize();

        for (i = 0; i < len; i++) {
            record = mutationRecords.at(i);

            if (record.attributeName === 'active') {

                if (TP.elementHasAttribute(
                        record.target, 'pclass:active', true)) {

                    centerElem.style.transition = 'none';
                } else {
                    centerElem.style.transition = '';
                }
            }
        }
    };

    observerConfig = {
        subtree: true,
        attributes: true
    };

    resizer = TP.byCSSPath('div#northResizer', win, true, false);
    TP.addMutationObserver(
            resizer, resizingHandler, observerConfig, 'N_RESIZING_OBSERVER');
    TP.activateMutationObserver('N_RESIZING_OBSERVER');

    resizer = TP.byCSSPath('div#southResizer', win, true, false);
    TP.addMutationObserver(
            resizer, resizingHandler, observerConfig, 'S_RESIZING_OBSERVER');
    TP.activateMutationObserver('S_RESIZING_OBSERVER');

    //  Set up resizing worker functions and value gathering.

    framingStyleElement = TP.byCSSPath(
                            'style[tibet|originalHref$="sherpa_framing.css"]',
                            win,
                            true,
                            false);

    variablesRule = TP.styleSheetGetStyleRulesMatching(
                        TP.cssElementGetStyleSheet(framingStyleElement),
                        'body').first();

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

        sherpaSouthDrawer,
        consoleInputTPElem,

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

    //  Insert the console input before the 2nd-child.
    consoleInputTPElem = sherpaSouthDrawer.insertContent(
                                                consoleInputTPElem,
                                                '> sherpa|opener:nth-child(2)');

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

    var menuTPElem;

    menuTPElem = TP.sherpa.contextmenu.getResourceElement('template',
                            TP.ietf.Mime.XHTML);

    menuTPElem = menuTPElem.clone();
    menuTPElem.compile();

    TP.byId('center', this.get('vWin')).addContent(menuTPElem);

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

    var newOutliner;

    //  The outliner doesn't have a visual 'tag' representation, so we manually
    //  construct it, set its ID and register it so that it can be found.
    newOutliner = TP.sherpa.outliner.construct();

    newOutliner.setID('SherpaOutliner');
    TP.sys.registerObject(newOutliner);

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

    var viewWin;

    //  Grab the root window.
    viewWin = this.get('vWin');

    //  Render the console component. This ensures that all of the setup has
    //  happened and that all of the pieces that the console requires are ready
    //  to go.
    TP.byId('SherpaConsole', viewWin).render();

    //  Toggle the east and west drawers to their 'maximum open' state.
    TP.byCSSPath('#west sherpa|opener', viewWin).at(0).signal('Toggle');
    TP.byCSSPath('#east sherpa|opener', viewWin).at(0).signal('Toggle');

    //  Focus the halo onto the body of the document loaded into the UI canvas.
    TP.byId('SherpaHalo', viewWin).focusOn(
            TP.sys.getUICanvas().getDocument().getBody());

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

//  ============================================================================
//  Sherpa-specific TP.sig.Signal subtypes
//  ============================================================================

//  Sherpa signals
TP.sig.Signal.defineSubtype('SherpaSignal');

TP.sig.SherpaSignal.Type.isControllerSignal(true);
TP.sig.SherpaSignal.isControllerRoot(true);

TP.sig.SherpaSignal.defineSubtype('ToggleSherpa');

//  Console input signals
TP.sig.SherpaSignal.defineSubtype('ConsoleInput');

//  Console processing signals
TP.sig.ResponderSignal.defineSubtype('ConsoleCommand');
TP.sig.ResponderSignal.defineSubtype('RemoteConsoleCommand');

TP.sig.ResponderSignal.defineSubtype('AssistObject');
TP.sig.ResponderSignal.defineSubtype('EditObject');
TP.sig.ResponderSignal.defineSubtype('InspectObject');

//  Keyboard handling signals
TP.sig.SherpaSignal.defineSubtype('EndAutocompleteMode');
TP.sig.SherpaSignal.defineSubtype('EndSearchMode');

//  Tile signals
TP.sig.SherpaSignal.defineSubtype('TileDidOpen');
TP.sig.SherpaSignal.defineSubtype('TileWillClose');

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
TP.sig.ResponderSignal.defineSubtype('DismissNotifier');

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
