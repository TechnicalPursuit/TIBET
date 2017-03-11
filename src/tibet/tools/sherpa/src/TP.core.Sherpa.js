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

    if (!toggleKey.startsWith('TP.sig.')) {
        toggleKey = 'TP.sig.' + toggleKey;
    }

    //  set up keyboard toggle to show/hide the Sherpa
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

    return TP.isValid(TP.bySystemId('Sherpa'));
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Type.defineMethod('isOpen',
function() {

    var elem;

    elem = TP.byId('SherpaHUD', 'UIROOT');
    if (TP.isValid(elem)) {
        return !elem.hasAttribute('pclass:closed');
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

    //  Even if we showed our drawers above because of the 'boot.show_ide' flag,
    //  we need to flag ourself not completely loaded yet.
    this.set('setupComplete', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('finishSetup',
function() {

    var viewDoc,
        worldTPElem;

    //  Set up the HUD. NOTE: This *must* be set up first - other components
    //  will rely on finding it when they awaken.
    this.setupHUD();

    viewDoc = this.get('vWin').document;

    //  The World was set up on initial startup - set up the rest of the
    //  components. We do set up the World to observe when the HUD shows
    worldTPElem = TP.byId('SherpaWorld', viewDoc);
    worldTPElem.observe(TP.byId('SherpaHUD', viewDoc), 'ClosedChange');

    //  Set up the console
    this.setupConsole();

    //  Set up the context menu
    this.setupContextMenu();

    //  Set up the extruder
    this.setupExtruder();

    //  Set up the halo
    this.setupHalo();

    //  Set up the inspector
    this.setupInspector();

    //  Set up the searcher
    //  this.setupSearcher();

    //  Set up the thumbnail
    this.setupThumbnail();

    //  Set up the tile dock
    TP.uc('urn:tibet:sherpa_tiledock').setResource(
                                        TP.hc(),
                                        TP.hc('observeResource', true));

    (function() {
        var tpElem,
            consoleService;

        tpElem = TP.byCSSPath('#south > .drawer', viewDoc, true);
        tpElem.setAttribute('tibet:nomutationtracking', false);

        tpElem = TP.byCSSPath('#north > .drawer', viewDoc, true);
        tpElem.setAttribute('tibet:nomutationtracking', false);

        tpElem = TP.byId('center', viewDoc);
        tpElem.setAttribute('tibet:nomutationtracking', true);

        //  Hide the 'content' div
        TP.elementHide(TP.byId('content', viewDoc, false));

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

        this.set('setupComplete', true);

    }.bind(this)).fork(250);

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

TP.core.Sherpa.Inst.defineHandler('RemoteConsoleCommand',
function(aSignal) {

    /**
     * @method handleRemoteConsoleCommand
     * @summary Handles signals that trigger remote console command execution.
     * @param {TP.sig.RemoteConsoleCommand} aSignal The TIBET signal which
     *     triggered this method.
     */

    var consoleService,
        cmdText,

        originalRequest,
        originalArgs,

        req,

        successFunc,
        failFunc,

        refreshRequest;

    consoleService = TP.bySystemId('SherpaConsoleService');

    originalRequest = aSignal.at('originalRequest');

    cmdText = ':cli ' + TP.lname(originalRequest.at('cmdNode'));

    originalArgs = consoleService.get('model').getArguments(originalRequest);
    originalArgs.perform(
            function(kvPair) {
                var argName,
                    argValue;

                argName = kvPair.first();
                argValue = kvPair.last();

                if (argName.startsWith('tsh:')) {

                    //  Slice off the 'tsh:'
                    argName = argName.slice(4);

                    cmdText += ' --' + argName + '=\'' + argValue + '\'';
                }
            });

    if (TP.notEmpty(cmdText) && TP.isValid(consoleService)) {

        req = consoleService.sendConsoleRequest(cmdText);

        successFunc = aSignal.at(TP.ONSUCCESS);
        failFunc = aSignal.at(TP.ONFAIL);

        if (TP.isCallable(successFunc) ||
            TP.isCallable(failFunc)) {

            refreshRequest = TP.request();

            if (TP.isCallable(successFunc)) {
                refreshRequest.defineHandler(
                                'RequestSucceeded',
                                function(aResponse) {
                                    successFunc(aResponse);
                                });
            }

            if (TP.isCallable(failFunc)) {
                refreshRequest.defineHandler(
                                'RequestFailed',
                                function(aResponse) {
                                    failFunc(aResponse);
                                });
            }

            refreshRequest.andJoinChild(req);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('AssistObject',
function(aSignal) {

    /**
     * @method handleAssistObject
     * @summary
     * @param {TP.sig.FocusInspector} aSignal The TIBET signal which triggered
     *     this method.
     */

    var targetObj,
        tileContentTPElem,

        dialogPromise;

    targetObj = aSignal.getPayload().at('targetObject');

    tileContentTPElem = TP.wrap(TP.getContentForAssistant(targetObj));

    if (TP.isValid(tileContentTPElem)) {

        dialogPromise = TP.dialog(
            TP.hc(
                'dialogID', 'AssistantDialog',
                'isModal', true,
                'templateContent', tileContentTPElem,
                'beforeShow',
                    function(aDialogTPElem) {
                        aDialogTPElem.setHeight(450);
                    }));

        dialogPromise.then(
            function(aDialogTPElem) {

                var contentTPElem;

                contentTPElem = aDialogTPElem.get('bodyGroup').
                                                    getFirstChildElement();

                contentTPElem.set('assistantParams',
                                    aSignal.getPayload().at('assistantParams'));

                contentTPElem.awaken();
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('EditObject',
function(aSignal) {

    /**
     * @method handleEditObject
     * @summary
     * @param {TP.sig.EditObject} aSignal The TIBET signal which triggered
     *     this method.
     */

    var northDrawer;

    northDrawer = TP.byId('north', this.get('vWin'));

    northDrawer.setAttribute('closed', false);

    TP.byId('SherpaInspector', this.get('vWin')).signal(
                            'FocusInspectorForEditing', aSignal.getPayload());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineHandler('InspectObject',
function(aSignal) {

    /**
     * @method handleInspectObject
     * @summary
     * @param {TP.sig.InspectObject} aSignal The TIBET signal which triggered
     *     this method.
     */

    var northDrawer;

    northDrawer = TP.byId('north', this.get('vWin'));

    northDrawer.setAttribute('closed', false);

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
     */

    var notifier,
        message;

    notifier = TP.byId('SherpaNotifier', 'UIROOT');
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
     */

    this.toggle();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('makeCustomTagFrom',
function(aTPElem) {

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

    handler = function(typeAddedSignal) {

        var elem,
            tagType,
            tagName,

            resourceURI,
            serializationStorage;

        handler.ignore(TP.ANY, 'TypeAdded');

        elem = typeAddedSignal.at('node');

        //  Make sure that we can get a tag type with the supplied element and
        //  that it is a kind of templated tag.
        tagType = TP.scriptElementGetType(elem);

        if (TP.isKindOf(tagType, TP.core.TemplatedTag)) {

            //  Create a tag name from the type's namespace prefix and local
            //  name.
            tagName = tagType.getNamespacePrefix() +
                        ':' +
                        tagType.getLocalName();

            resourceURI = tagType.getResourceURI('template');

            serializationStorage = TP.hc();
            serializationStorage.atPut('store', resourceURI.getLocation());

            //  Stamp the 'tibet:tag' attribute on it before it goes out.
            TP.elementSetAttribute(TP.unwrap(aTPElem),
                                    'tibet:tag', tagName, true);

            aTPElem.serializeForStorage(serializationStorage);

            this.saveStorageSerialization(
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

    return;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('makeTile',
function(anID, aName, tileParent, shouldDock) {

    var tileTemplateTPElem,

        parent,
        tileTPElem,

        tileID,

        wantsToDock;

    tileTemplateTPElem = TP.sherpa.tile.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML);

    parent = tileParent;

    if (!TP.isElement(parent) &&
        !TP.isKindOf(parent, TP.core.ElementNode)) {
        parent = TP.byId('commonTileLayer', this.get('vWin'));
    }

    tileTPElem = TP.wrap(parent).addContent(tileTemplateTPElem);

    tileID = TP.escapeTypeName(anID);

    tileTPElem.setID(tileID);
    tileTPElem.setHeaderText(aName);

    wantsToDock = TP.notDefined(shouldDock, true);

    tileTPElem.set('shouldDock', wantsToDock);

    tileTPElem.awaken();

    //  Avoid the north and west drawers
    //  TODO: This is cheesy - calculate these from drawer positions
    tileTPElem.setOffsetPosition(TP.pc(65, 215));

    return tileTPElem;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('saveStorageSerialization',
function(serializationStorage, successFunc) {

    var stores;

    stores = serializationStorage.at('stores');

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
            req.defineHandler('RequestSucceeded',
                                function() {
                                    if (TP.isCallable(successFunc)) {
                                        successFunc();
                                    }
                                });

            uri.setResource(newContent);

            uri.save(req);
        });

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setup',
function() {

    var win,
        drawerElement,

        sherpaFinishSetupFunc,

        contentElem,

        allDrawers,

        centerElem,

        resizingHandler,
        observerConfig,
        resizer,

        framingStyleElement,
        variablesRule;

    //  If we didn't show the IDE when we first started, the trigger has now
    //  been fired to show it.
    if (!TP.sys.cfg('boot.show_ide')) {

        win = TP.win('UIROOT');
        drawerElement = TP.byId('south', win, false);

        (sherpaFinishSetupFunc = function(aSignal) {
            sherpaFinishSetupFunc.ignore(
                drawerElement, 'TP.sig.DOMTransitionEnd');

            //  The basic Sherpa framing has been set up, but we complete
            //  the setup here (after the drawers animate in). Note that
            //  this will exit but want to service part of its code after
            //  250ms.
            this.finishSetup();

            //  Complete the setup after a final 250ms timeout - we want to
            //  schedule this *after* the finishSetup().
            (function() {

                TP.byId('SherpaHUD', 'UIROOT').toggle('closed');

                this.sherpaSetupComplete();
            }.bind(this)).fork(250);

        }.bind(this)).observe(drawerElement, 'TP.sig.DOMTransitionEnd');

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

        TP.elementShow(contentElem);
        TP.elementShowBusyMessage(contentElem,
                                    '...initializing TIBET Sherpa...');

        allDrawers = TP.byCSSPath('.north, .south, .east, .west',
                                    win,
                                    false,
                                    false);

        //  Show the drawers.
        allDrawers.forEach(
                    function(anElem) {
                        anElem.removeAttributeNS(TP.w3.Xmlns.PCLASS, 'hidden');
                    });
    } else {

        //  The basic Sherpa framing has been drawn (because of the setting of
        //  the 'boot.show_ide' flag), but we complete the setup here.
        this.finishSetup();

        TP.byId('SherpaHUD', 'UIROOT').toggle('closed');

        //  Refresh the input area after a 1000ms timeout. This
        //  ensures that other layout will happen before the editor
        //  component tries to compute its layout
        (function() {
            TP.byId('SherpaConsole', TP.win('UIROOT')).render();
        }).fork(1000);
    }

    //  Set up mutation observers that will watch for the resizers to
    //  become/resign being active and manage the 'transition' property of the
    //  '#center' element appropriately.

    centerElem = TP.byId('center', TP.win('UIROOT'), false);

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

    resizer = TP.byCSSPath('div#northResizer', TP.win('UIROOT'), true, false);
    TP.addMutationObserver(
            resizer, resizingHandler, observerConfig, 'N_RESIZING_OBSERVER');
    TP.activateMutationObserver('N_RESIZING_OBSERVER');

    resizer = TP.byCSSPath('div#southResizer', TP.win('UIROOT'), true, false);
    TP.addMutationObserver(
            resizer, resizingHandler, observerConfig, 'S_RESIZING_OBSERVER');
    TP.activateMutationObserver('S_RESIZING_OBSERVER');

    //  Set up resizing worker functions and value gathering.

    framingStyleElement = TP.byCSSPath(
                            'style[tibet|originalHref$="sherpa_framing.css"]',
                            TP.win('UIROOT'),
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

    var uiDoc,

        consoleOutputTPElem,

        sherpaSouthDrawer,
        consoleInputTPElem,

        testAppender;

    uiDoc = this.get('vWin').document;

    //  We *must* set up the output first, since setting up the input will cause
    //  output to be logged.

    //  Create the <sherpa:consoleoutput> tag
    consoleOutputTPElem = TP.sherpa.consoleoutput.getResourceElement('template',
                            TP.ietf.Mime.XHTML);

    consoleOutputTPElem = consoleOutputTPElem.clone();
    consoleOutputTPElem.compile();

    consoleOutputTPElem.setAttribute('id', 'SherpaConsoleOutput');

    consoleOutputTPElem = TP.byId('center', uiDoc).addContent(
                                                    consoleOutputTPElem);
    consoleOutputTPElem.awaken();

    //  Now we can set up the input

    sherpaSouthDrawer = TP.byCSSPath('#south > .drawer', uiDoc, true);

    consoleInputTPElem = TP.sherpa.console.getResourceElement('template',
                            TP.ietf.Mime.XHTML);

    consoleInputTPElem = consoleInputTPElem.clone();
    consoleInputTPElem.compile();

    consoleInputTPElem = sherpaSouthDrawer.insertContent(
                                                consoleInputTPElem,
                                                '> sherpa|opener:nth-child(2)');

    consoleInputTPElem.setup();

    consoleInputTPElem.setOutputDisplayMode(
                        TP.sys.cfg('sherpa.tdc.output_mode', 'one'));

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
        menuTPElem;

    uiDoc = this.get('vWin').document;

    menuTPElem = TP.sherpa.contextmenu.getResourceElement('template',
                            TP.ietf.Mime.XHTML);

    menuTPElem = menuTPElem.clone();
    menuTPElem.compile();

    TP.byId('center', uiDoc).addContent(menuTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupExtruder',
function() {

    var newExtruder;

    newExtruder = TP.sherpa.extruder.construct();
    newExtruder.setID('SherpaExtruder');

    TP.sys.registerObject(newExtruder);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupHalo',
function() {

    var uiDoc,
        haloTPElem;

    uiDoc = this.get('vWin').document;

    haloTPElem = TP.sherpa.halo.getResourceElement('template',
                            TP.ietf.Mime.XHTML);

    haloTPElem = haloTPElem.clone();
    haloTPElem.compile();

    TP.byId('center', uiDoc).addContent(haloTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupHUD',
function() {

    var hudTPElem;

    hudTPElem = TP.byId('SherpaHUD', this.get('vWin'));
    hudTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupInspector',
function() {

    var inspectorTPElem,

        remoteSources;

    inspectorTPElem = TP.byId('SherpaInspector', this.get('vWin'));
    inspectorTPElem.setup();

    remoteSources = TP.sys.cfg('uri.remote_sources', TP.ac());

    remoteSources.forEach(
        function(aSource) {

            var sourceURI,
                sourceURIMap,
                inspectorHandlerTypeName,
                inspectorHandlerType,
                newHandler;

            sourceURI = TP.uc(aSource);

            sourceURIMap = TP.core.URI.$getURIMap(sourceURI);

            inspectorHandlerTypeName =
                    sourceURIMap.at('sherpa_inspector_handler');
            inspectorHandlerType =
                    TP.sys.getTypeByName(inspectorHandlerTypeName);

            if (TP.isType(inspectorHandlerType)) {

                newHandler = inspectorHandlerType.construct();
                newHandler.set('serverAddress', sourceURI.getRoot());

                inspectorTPElem.addSource(
                                newHandler.getInspectorPath(),
                                newHandler);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupSearcher',
function() {

    /**
     * @method setupSearcher
     */

    var searchDrawerContent;

    searchDrawerContent = TP.byCSSPath('sherpa|search > .content',
                                        this.get('vWin'),
                                        true);

    searchDrawerContent.insertContent('<sherpa:searcher/>', TP.AFTER_BEGIN);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupThumbnail',
function() {

    // TP.byId('SherpaThumbnail', this.get('vWin')).setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('sherpaSetupComplete',
function() {

    var uiRootWin;

    uiRootWin = TP.sys.getUIRoot(true);

    //  Refresh the input area after a 1000ms timeout. This ensures
    //  that other layout will happen before the editor component
    //  tries to compute its layout
    TP.byId('SherpaConsole', uiRootWin).render();

    TP.byCSSPath('#west sherpa|opener', uiRootWin).at(0).signal('Toggle');
    TP.byCSSPath('#east sherpa|opener', uiRootWin).at(0).signal('Toggle');

    TP.byId('SherpaHalo', uiRootWin).focusOn(
            TP.sys.getUICanvas().getDocument().getBody());

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('setupWorld',
function() {

    var uiScreensWin,
        uiDoc,

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

    uiScreensWin = this.get('vWin');
    uiDoc = uiScreensWin.document;

    //  Create the <sherpa:world> tag
    worldElem = TP.documentConstructElement(uiDoc,
                                            'sherpa:world',
                                            TP.w3.Xmlns.SHERPA);
    TP.elementSetAttribute(worldElem, 'id', 'SherpaWorld', true);
    TP.elementSetAttribute(worldElem, 'mode', 'normal', true);

    //  Create the screen holding div and append that to the <sherpa:world> tag
    screenHolderDiv = TP.documentConstructElement(uiDoc,
                                                    'div',
                                                    TP.w3.Xmlns.XHTML);
    screenHolderDiv = TP.nodeAppendChild(worldElem, screenHolderDiv, false);
    TP.elementAddClass(screenHolderDiv, 'screens');

    infoHolderDiv = TP.documentConstructElement(uiDoc,
                                                'div',
                                                TP.w3.Xmlns.XHTML);
    infoHolderDiv = TP.nodeAppendChild(worldElem, infoHolderDiv, false);
    TP.elementAddClass(infoHolderDiv, 'infos');

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
    worldTPElem = TP.byId('SherpaWorld', uiScreensWin);
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

    screens = worldTPElem.get('screens');
    screens.first().setSelected(true);

    infos = worldTPElem.get('infos');
    infos.first().setSelected(true);

    //  Hide the 'content' div
    TP.elementHide(TP.byId('content', uiScreensWin, false));

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Sherpa.Inst.defineMethod('toggle',
function() {

    //  If the Sherpa's setup is complete, then we just toggle the HUD and exit.
    if (this.get('setupComplete')) {
        TP.byId('SherpaHUD', 'UIROOT').toggle('closed');

        return this;
    }

    this.setup();

    return this;
});

//  ============================================================================
//  Sherpa-specific TP.sig.Signal subtypes
//  ============================================================================

//  Sherpa signals
TP.sig.Signal.defineSubtype('ToggleSherpa');

//  Console input signals
TP.sig.Signal.defineSubtype('ConsoleInput');

//  Console processing signals
TP.sig.ResponderSignal.defineSubtype('ConsoleCommand');
TP.sig.ResponderSignal.defineSubtype('RemoteConsoleCommand');

TP.sig.ResponderSignal.defineSubtype('AssistObject');
TP.sig.ResponderSignal.defineSubtype('EditObject');
TP.sig.ResponderSignal.defineSubtype('InspectObject');

//  Keyboard handling signals
TP.sig.Signal.defineSubtype('EndAutocompleteMode');
TP.sig.Signal.defineSubtype('EndSearchMode');

//  Tile signals
TP.sig.Signal.defineSubtype('TileDidOpen');
TP.sig.Signal.defineSubtype('TileWillClose');

//  Halo Signals
TP.sig.Signal.defineSubtype('HaloDidBlur');
TP.sig.Signal.defineSubtype('HaloDidFocus');

//  Inspector Signals
TP.sig.Signal.defineSubtype('NavigateInspector');

TP.sig.Signal.defineSubtype('InspectorDidFocus');

TP.sig.ResponderSignal.defineSubtype('FocusInspectorForBrowsing');
TP.sig.ResponderSignal.defineSubtype('FocusInspectorForEditing');

//  Breadcrumb Signals
TP.sig.Signal.defineSubtype('BreadcrumbSelected');

//  Screen Signals
TP.sig.Signal.defineSubtype('ToggleScreen');
TP.sig.Signal.defineSubtype('FocusScreen');

//  GUI Signals
TP.sig.ResponderSignal.defineSubtype('SherpaHaloToggle');
TP.sig.ResponderSignal.defineSubtype('ToggleExtrudeMode');

//  Notifier Signals
TP.sig.ResponderSignal.defineSubtype('SherpaNotify');
TP.sig.ResponderSignal.defineSubtype('DismissNotifier');

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
