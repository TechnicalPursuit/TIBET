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
 * @type {TP.lama.IDE}
 */

//  ============================================================================
//  TP.lama.IDE
//  ============================================================================

TP.lang.Object.defineSubtype('lama.IDE');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.lama.IDE.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var toggleKey;

    //  If the Lama isn't configured to start, then exit here.
    if (!TP.sys.cfg('lama.enabled')) {
        return this;
    }

    //  Register our toggle key handler to finish Lama setup.
    toggleKey = TP.sys.cfg('lama.toggle_key');
    if (TP.isEmpty(toggleKey)) {
        TP.error('Lama is enabled but no toggle key defined.');
        return this;
    }

    //  Make sure the toggle key signal starts with 'TP.sig.' so that the
    //  observation works properly (specific-key observations need the full
    //  name).
    if (!toggleKey.startsWith('TP.sig.')) {
        toggleKey = 'TP.sig.' + toggleKey;
    }

    //  Set up keyboard toggle to show/hide the Lama
    (function() {
        TP.signal(null, 'ToggleLama');
    }).observe(TP.core.Keyboard, toggleKey);

    return;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Type.defineMethod('hasStarted',
function() {

    /**
     * @method hasStarted
     * @summary Whether or not the Lama itself has started (i.e. is installed
     *     and is ready).
     * @returns {Boolean} Whether or not the Lama is ready.
     */

    var inst;

    inst = TP.bySystemId('Lama');

    return TP.isValid(inst) && TP.isTrue(inst.get('setupComplete'));
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Type.defineMethod('isOpen',
function() {

    /**
     * @method isOpen
     * @summary Whether or not the Lama is 'open' (i.e. has started and its
     *     HUD component is currently showing).
     * @returns {Boolean} Whether or not the Lama is open.
     */

    var elem;

    elem = TP.byId('LamaHUD', TP.sys.getUIRoot());
    if (TP.isValid(elem)) {
        return !elem.hasAttribute('pclass:closed');
    }

    return false;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Type.defineMethod('replaceWithUnknownElementProxy',
function(anElement) {

    /**
     * @method replaceWithUnknownElementProxy
     * @summary This method, invoked from the core TIBET tag processing
     *     machinery if the Lama is loaded and running in the current system,
     *     will replace the supplied element with a stand in (a so-called 'tofu'
     *     element) that represents an element type that is not yet known to the
     *     system.
     * @param {Element} anElement The element to replace.
     * @returns {TP.meta.lama.IDE} The receiver.
     */

    var newElement;

    //  Build a chunk of markup that is a 'lama:tofu' element with identifying
    //  information about the element that it is standing in for.
    newElement = TP.xhtmlnode(
        '<lama:tofu on:click="TagAssist"' +
                ' proxyfor="' + TP.name(anElement) + '">' +
            '<span class="name">' +
                '&lt;' + TP.name(anElement) + '... /&gt;' +
            '</span>' +
        '</lama:tofu>');

    TP.elementReplaceWith(anElement, newElement);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the view window (i.e. the window containing the lama)
TP.lama.IDE.Inst.defineAttribute('vWin');

//  whether or not our setup is complete
TP.lama.IDE.Inst.defineAttribute('setupComplete');

//  whether or not the Lama should process mutations to the DOM of the
//  current UI canvas and update the source DOM that is represented there.
TP.lama.IDE.Inst.defineAttribute('shouldProcessDOMMutations');

//  a timeout that will cause the 'shouldProcessDOMMutations' flag to be reset
//  to false. This is needed because the Mutation Observer machinery that we use
//  to manage changes to the source DOM is an asynchronous mechanism and the
//  shouldProcessDOMMutations flag is used by this machinery to determine
//  whether or not to update the source DOM of the current UI canvas.
TP.lama.IDE.Inst.defineAttribute('$shouldProcessTimeout');

//  A hash of Functions (keyed by 'connection vend type') that 'collect'
//  elements that should have that vend type added to their 'connection accept
//  type' dynamically when a connector session starts and removed when it ends.
TP.lama.IDE.Inst.defineAttribute('connectorCollectors');

//  A target element that would have had a 'tibet:no-dragtrap' attribute on
//  it when the connector session started, but needed to be removed to make the
//  DOMDrag* signals for connectors work. This needs to be tracked and put back
//  when the connector session has ended.
TP.lama.IDE.Inst.defineAttribute('$nodragtrapTarget');

//  The current active builder MutationSummary object.
TP.lama.IDE.Inst.defineAttribute('$builderMutationSummary');

//  An Array of 'mutation observer filter Function' object built specifically
//  for the builder.
TP.lama.IDE.Inst.defineAttribute('$builderMOFilterFuncs');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.lama.IDE} The receiver.
     */

    var uiBootIFrameElem,
        win;

    //  Manually 'display: none' the boot iframe. It's already
    //  'visibility:hidden', but we need to get it out of the way.
    uiBootIFrameElem = TP.byId('UIBOOT', TP.topWindow, false);
    if (TP.isValid(uiBootIFrameElem)) {
        TP.elementHide(uiBootIFrameElem);
    }

    //  Set up our window. By default, the Lama exists in the UIROOT window.

    //  NOTE: DO NOT change this reference to TP.sys.getUIROOT(). This gets
    //  executed too early in the startup process.
    win = TP.win('UIROOT');
    this.set('vWin', win);

    //  Set the flag that will determine whether or not we're processing DOM
    //  mutations for the current UI DOM mutations.
    this.set('shouldProcessDOMMutations', false);

    //  Set up the World
    this.setupWorld();

    //  Because of the setTimeout below, need to flag ourself not loaded yet.
    this.set('setupComplete', false);

    //  Based on the setting of this flag, we show or hide the center area and
    //  the drawers (the HUD isn't real until we finish setup, so we show or
    //  hide it manually here).
    if (TP.sys.cfg('boot.show_ide')) {

        //  NB: Give the user a bit of time to see the app canvas before
        //  bringing in the HUD.
        setTimeout(
            this.setup.bind(this),
            500);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('activateTool',
function(toolID) {

    /**
     * @method activateTool
     * @summary Activates the tool with the supplied ID. This will suppress the
     *     halo from being the primary visual tool.
     * @param {String} toolID The ID of the tool to activate.
     * @returns {TP.lama.IDE} The receiver.
     */

    var haloTPElem,

        stripTPElem,
        toolTPElem;

    //  Hide the halo.
    haloTPElem = TP.byId('LamaHalo', TP.sys.getUIRoot());
    haloTPElem.setAttribute('hidden', true);

    //  Show the CSS tool button strip.
    stripTPElem =
        this.getToolsLayer().getParentNode().get('> .cssToolButtonStrip');
    stripTPElem.setAttribute('hidden', false);

    //  Show the tool matching the toolID (if it can be found).
    toolTPElem = TP.byId(toolID, TP.sys.getUIRoot());
    if (TP.isValid(toolTPElem)) {
        toolTPElem.setAttribute('hidden', false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('addScreenLocation',
function(aLocation) {

    /**
     * @method addScreenLocation
     * @summary Adds a screen location to the Lama's list of managed screen
     *     locations.
     * @returns {String} aLocation The URI location that should be added to the
     *     list of screens.
     * @returns {TP.lama.IDE} The receiver.
     */

    var loc,

        screenLocEntries,
        locs;

    //  Grab the fully expanded location of the supplied location.
    loc = TP.uc(aLocation).getLocation();

    //  Grab the set of managed screen locations and convert them to their fully
    //  expanded form. This will allow us to compare to the supplied location in
    //  a canonicalized way.
    screenLocEntries =
        TP.uc('urn:tibet:lama_screenlocs').getResource().get(
                                                        'result');
    locs = screenLocEntries.collect(
                function(aLoc) {
                    return TP.uc(aLoc).getLocation();
                });

    //  If the list of managed screen locations already contain the supplied
    //  location, exit here. We only allow one occurrence.
    if (locs.contains(aLocation)) {
        return;
    }

    //  Add the virtualized form of the supplied location to the list.
    screenLocEntries.push(TP.uriInTIBETFormat(loc));

    //  Let everyone who is observing the list of managed screen locations know
    //  that it just changed.
    TP.uc('urn:tibet:lama_screenlocs').$changed();

    //  Tell the TSH to save its profile, which will cause it to save the list
    //  of managed screen locations, amongst other things.
    TP.bySystemId('TSH').saveProfile();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @description We override at this level to just produce type and ID since
     *     this is a very 'deep' object that produces a very long JSON
     *     representation that takes a long time to render in a user interface.
     * @returns {String} A JSON-formatted string.
     */

    var str;

    str = '{"type":"' + TP.tname(this) + '",' +
            '"ID":"' + TP.id(this) + '"}';

    return str;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('asTP_lama_pp',
function() {

    /**
     * @method asTP_lama_pp
     * @summary Returns a String compatible with other productions in the
     *     TP.lama.pp formatting type.
     * @returns {String} The receiver as a String producing output compatible
     *     with TP.lama.pp type.
     */

    return '';
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('computeMutableStyleSheet',
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
     *     element.
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

        if (currentTPElem.lamaShouldAlterStyle()) {

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

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('deactivateTool',
function(toolID) {

    /**
     * @method deactivateTool
     * @summary Deactivates the tool with the supplied ID. This will restore the
     *     halo to be the primary visual tool.
     * @param {String} toolID The ID of the tool to deactivate.
     * @returns {TP.lama.IDE} The receiver.
     */

    var toolTPElem,

        stripTPElem,
        haloTPElem;

    //  Hide the tool matching the toolID (if it can be found).
    toolTPElem = TP.byId(toolID, TP.sys.getUIRoot());
    if (TP.isValid(toolTPElem)) {
        toolTPElem.setAttribute('hidden', true);
    }

    //  Hide the CSS tool button strip.
    stripTPElem =
        this.getToolsLayer().getParentNode().get('> .cssToolButtonStrip');
    stripTPElem.setAttribute('hidden', true);

    //  Show the halo.
    haloTPElem = TP.byId('LamaHalo', TP.sys.getUIRoot());
    haloTPElem.setAttribute('hidden', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('finishSetup',
function(finalizationFunc) {

    /**
     * @method finishSetup
     * @summary Finishes the Lama setup process by setting up all of the
     *     Lama's tools and configuring its drawers.
     * @param {Function} finalizationFunc The Function to execute when the setup
     *     is truly finished.
     * @returns {TP.lama.IDE} The receiver.
     */

    var mode,

        viewDoc,
        thisref,
        worldTPElem;

    mode = TP.sys.cfg('lama.mode');

    if (mode === 'full') {
        //  Set up the HUD. NOTE: This *must* be set up first - other components
        //  will rely on finding it when they awaken.
        this.setupHUD();
    } else {
        //  Set up the Lamabar
        this.setupLamabar();
    }

    //  The document that we were installed into.
    viewDoc = this.get('vWin').document;

    //  The World was set up on initial startup - set up the rest of the
    //  components. We do set up the World to observe when the HUD shows
    worldTPElem = TP.byId('LamaWorld', viewDoc);
    worldTPElem.observe(TP.byId('LamaHUD', viewDoc), 'PclassClosedChange');

    //  Set up any signal observations for Lama-wide handling.
    this.setupObservations();

    if (mode === 'full') {
        //  Set up the console
        this.setupConsole();
    }

    //  Set up the context menu
    this.setupContextMenu();

    //  Set up the halo
    this.setupHalo();

    //  NB: We set these up *after* the halo is set up.

    //  Set up the manipulators
    this.setupTools();

    if (mode === 'full') {

        //  NB: For now, we only set up the outliner when in 'full' mode,
        //  because it has console references in it. But we need to remove those
        //  and make it work in 'minimal' mode as well.

        //  Set up the outliner
        this.setupOutliner();

        //  Set up the workbench
        this.setupWorkbench();

        //  Set up the inspector
        this.setupInspector();
    }

    //  Set up connectors
    this.setupConnectors();

    //  Set up the mutation observer that manages keeping all of the DOM and
    //  markup that we're managing in sync.
    this.setupBuilderObserver();

    //  Configure the north and south drawers to not track mutations for
    //  performance (we don't use mutation signals there anyway) and to set up
    //  the console service's keyboard state machine. Note that we do this in a
    //  queued function to let the system do a GUI repaint to show initializing
    //  status, etc.
    thisref = this;

    (function() {
        var tpElem,

            screenLocEntries,
            homeURL,

            consoleService,

            hudElem,
            contentElem,

            stripElem;

        if (mode === 'full') {
            tpElem = TP.byCSSPath('#south > .drawer', viewDoc, true);
            tpElem.setAttribute('tibet:no-mutations', false);

            tpElem = TP.byCSSPath('#north > .drawer', viewDoc, true);
            tpElem.setAttribute('tibet:no-mutations', false);

            tpElem = TP.byId('center', viewDoc);
            tpElem.setAttribute('tibet:no-mutations', true);
        }

        //  Grab the current screen location entries. If they're empty, populate
        //  them with at least one entry: the home URL that we're going to put
        //  into SCREEN_0.
        screenLocEntries =
            TP.uc('urn:tibet:lama_screenlocs').getResource().get(
                                                            'result');
        if (TP.isEmpty(screenLocEntries)) {
            homeURL = TP.sys.getHomeURL(true);
            screenLocEntries = TP.ac(TP.uriInTIBETFormat(homeURL));
            TP.uc('urn:tibet:lama_screenlocs').setResource(
                                        screenLocEntries,
                                        TP.hc('observeResource', true,
                                                'signalChange', true));
            if (mode === 'full') {
                TP.bySystemId('TSH').saveProfile();
            }
        }

        if (mode === 'full') {
            consoleService = TP.bySystemId('LamaConsoleService');

            //  Now that all components have loaded (and possibly installed
            //  state machine responders into the console service's state
            //  machine), activate the console service's state machine.
            consoleService.get('keyboardStateMachine').activate();

            //  Also, set the variable that will represent the UI canvas. This
            //  will switch as different screens are selected.
            consoleService.get('model').setVariable(
                'UICANVAS',
                worldTPElem.get('selectedScreen').getContentWindow());
        }

        hudElem = TP.byId('LamaHUD', viewDoc, false);
        contentElem = TP.byId('content', viewDoc, false);

        //  Now that we have a valid HUD element, move the 'content' element
        //  from being under the 'center' element to being under the HUD
        //  element.
        TP.nodeAppendChild(hudElem, contentElem, false);

        if (mode === 'full') {
            //  Now that the content element has been moved and is available to
            //  be the tools layer, set up the property adjuster
            thisref.setupAdjuster();
        }

        //  Insert the 'tools closer' content as a sibling of the content (now
        //  tools) element and *before* it.
        stripElem = TP.xhtmlnode(
            '<div class="cssToolButtonStrip" pclass:hidden="true">' +
                '<div class="toolButton closeButton"' +
                        ' on:click="CloseActiveTool"/>' +
            '</div>');
        TP.nodeInsertContent(contentElem, stripElem, TP.BEFORE_BEGIN);

        thisref.set('setupComplete', true);

        //  If a finalization Function was supplied, execute it.
        if (TP.isCallable(finalizationFunc)) {
            finalizationFunc();
        }

    }).queueAfterNextRepaint();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('focusInputCell',
function(aTimeout, aCallback) {

    /**
     * @method focusInputCell
     * @summary Focuses the Lama's TDC input cell after a delay.
     * @param {Number} [aTimeout=250] The number of milliseconds to wait before
     *     trying to focus the TDC input cell.
     * @param {Function} [aCallback] An optional callback function that will be
     *     called back after the cell is focused.
     * @returns {TP.lama.IDE} The receiver.
     */

    var timeout;

    timeout = TP.ifInvalid(aTimeout, 250);

    //  Focus and set the cursor to the end of the Lama's input cell after a
    //  timeout (defaults to 250ms).
    setTimeout(
        function() {
            var consoleGUI;

            consoleGUI =
                TP.bySystemId('LamaConsoleService').get('$consoleGUI');

            consoleGUI.focusInput();
            consoleGUI.setInputCursorToEnd();

            if (TP.isCallable(aCallback)) {
                aCallback();
            }
        }, timeout);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('getAppElement',
function() {

    /**
     * @method getAppElement
     * @summary Returns the application element.
     * @returns {TP.dom.Element} The 'application' element.
     */

    var appTagName,
        appTagNameQuery,

        world,
        screenDocs,

        len,
        i,

        appTPElem;

    //  NB: We pass false here to skip returning any Lama tag since we're
    //  running in a Lama-enabled environment.
    appTagName = TP.tibet.root.computeAppTagTypeName(false);
    appTagNameQuery = appTagName.replace(':', '|');

    //  Grab all of the world's 'screen' documents. We'll look for the
    //  application element in each of them until we find one.
    world = TP.byId('LamaWorld', TP.sys.getUIRoot());
    screenDocs = world.getScreenDocuments();

    len = screenDocs.getSize();
    for (i = 0; i < len; i++) {
        //  Try to get the application element. If we find one in this screen's
        //  document, then break.
        appTPElem = screenDocs.at(i).get(appTagNameQuery);
        if (TP.isValid(appTPElem)) {
            break;
        }
    }

    return appTPElem;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('getOrMakeModifiableRule',
function(aTargetTPElement, initialRuleText) {

    /**
     * @method getOrMakeModifiableRule
     * @summary Using the supplied element, this method returns or constructs a
     *     CSS rule that will apply uniquely to the supplied element.
     * @param {TP.dom.ElementNode} aTargetTPElement The element to use to
     *     compute a CSS rule that will match.
     * @param {String} [initialRuleText] If a new rule has to be created in this
     *     method, this is an optional chunk of rule text that will be used to
     *     start the rule with. This should *not* include the surrounding
     *     opening and closing braces ('{' and '}').
     * @returns {CSSRule|null} An existing or newly constructed CSS rule that
     *     will match the supplied element uniquely.
     */

    var stylesHUD,

        modifyingRule,

        generatorTPElem,

        generatorType,
        targetType,

        ruleSelector,

        targetElem,
        lamaID,
        targetDoc,

        matches,

        generatorSheet,

        ruleText,

        newRuleIndex;

    stylesHUD = TP.byId('StylesHUD', TP.win('UIROOT'));

    //  Try to obtain a 'modifying rule' that we can use to manipulate.
    modifyingRule = stylesHUD.getModifiableRule(true);
    if (TP.notValid(modifyingRule)) {

        //  Grab the type of the target element.
        targetType = aTargetTPElement.getType();

        //  Grab the nearest 'generator' element to the target element. This
        //  will be the element (usually a CustomTag) that would have generated
        //  the target element (and which could be the target element itself).
        generatorTPElem = aTargetTPElement.getNearestHaloGenerator();
        if (TP.notValid(generatorTPElem)) {
            //  TODO: Raise an exception.
            return;
        }

        if (generatorTPElem !== aTargetTPElement) {
            //  Compute a unique selector for the targeted element
            generatorType = generatorTPElem.getType();

            //  First, we scope it by the generator type.
            ruleSelector = generatorType.get('nsPrefix') + '|' +
                            generatorType.get('localName');

            //  With a descendant selector
            ruleSelector += ' ';
        } else {
            //  The generator and the target are the same element
            ruleSelector = '';
        }

        targetElem = aTargetTPElement.getNativeNode();

        //  If the target is a custom tag.
        if (TP.isKindOf(aTargetTPElement, TP.tag.CustomTag)) {
            //  Then, add a selector for the tag target itself, which will
            //  depend on whether we're using a 'translated' tag (a tag that has
            //  been translated into a natively-supported namespace) or an XML
            //  namespaced tag.
            if (TP.w3.Xmlns.isNativeNS(targetElem.namespaceURI)) {
                ruleSelector += '*[tibet|tag="' +
                                targetType.get('nsPrefix') + ':' +
                                targetType.get('localName') +
                                '"]';
            } else {
                ruleSelector += targetType.get('nsPrefix') + '|' +
                                targetType.get('localName');
            }
        } else if (TP.w3.Xmlns.isNativeNS(targetElem.namespaceURI) &&
                    TP.isEmpty(targetElem.prefix)) {
            //  If the target is in a natively-supported namespace (but is not a
            //  custom tag - it is truly a native tag of the environment), just
            //  use the local name.
            ruleSelector += targetType.get('localName');
        } else {
            ruleSelector += targetType.get('nsPrefix') + '|' +
                            targetType.get('localName');
        }

        lamaID = TP.elementGetAttribute(targetElem, 'lamaID', true);
        if (TP.isEmpty(lamaID)) {
            //  Generate a unique ID for the target element, but do *not* assign
            //  it because we want to use it for a different attribute, not
            //  'id'. 'id' attributes have a special XML-ish meaning and are
            //  stripped before the document is saved and we want this one to
            //  persist.
            lamaID = TP.elemGenID(targetElem, false);

            aTargetTPElement.setAttribute('lamaID', lamaID);

            //  Make sure to refresh all of the descendant document positions
            //  for the UI canvas since we're going to be updating the canvas
            //  source.
            TP.nodeRefreshDescendantDocumentPositions(TP.sys.uidoc(true));

            //  Manually update the canvas source of the target element.
            //  Because we're in the midst of a D&D operation, mutation
            //  observers will have been temporarily suspended.
            //  Therefore, we do this manually. Note here how we do not signal
            //  CanvasChanged. This is due to the fact that 'lamaID' is an
            //  internal attribute that we don't care about observers knowing.
            this.updateUICanvasSource(
                TP.ac(targetElem),
                targetElem.parentNode,
                TP.CREATE,
                'lamaID',
                lamaID,
                null,
                false);
        }

        //  Add the LamaID as an attribute selector.
        ruleSelector += '[lamaID="' + lamaID + '"]';

        targetDoc = aTargetTPElement.getNativeDocument();

        //  Make sure that the newly generated selector matches (and matches
        //  *only*) the target element.
        matches = TP.byCSSPath(
                        ruleSelector, targetDoc, false, false);
        if (matches.getSize() === 1 &&
            matches.first() === targetElem) {

            //  The match was successful - and we only matched the target
            //  element. Generate a new rule into the stylesheet using our
            //  computed selector.

            //  Grab the style sheet for the generator.
            generatorSheet = generatorTPElem.getNearestGeneratorStylesheet();

            //  If we got a valid generator sheet, then go ahead and insert the
            //  rule.
            if (TP.isStyleSheet(generatorSheet)) {
                ruleText = TP.ifInvalid(initialRuleText, '');

                //  Create a new rule and add it to the end of the stylesheet.
                newRuleIndex = TP.styleSheetInsertRule(generatorSheet,
                                                        ruleSelector,
                                                        ruleText,
                                                        null,
                                                        false);

                modifyingRule = generatorSheet.cssRules[newRuleIndex];
            } else {
                //  TODO: Raise an exception
                modifyingRule = null;
            }
        }
    }

    return modifyingRule;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('getToolsLayer',
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

    //  The 'tools layer' is the 'content' div as we boot. We repurpose it
    //  to be the tools layer.
    contentTPElem = TP.byId('content', viewDoc);

    //  If the content element hasn't been 'converted to being the tools layer',
    //  do so now and show it.
    if (!contentTPElem.hasAttribute('toolslayer')) {
        contentTPElem.setAttribute('toolslayer', 'true');
        contentTPElem.show();
    }

    return contentTPElem;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('getToolsLayerOffsetsFromScreen',
function(aScreenTPElement) {

    /**
     * @method getToolsLayerOffsetsFromScreen
     * @summary Returns the X and Y offsets from the tools layer to the supplied
     *     screen. This can used in computations that require drawing on the
     *     tools layer from coordinates computed inside of a particular screen.
     * @param {TP.lama.screen} aScreenTPElement The screen element to compute
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

    //  The 'center' element is the parent for the world element.
    centerTPElem = TP.byId('center', viewDoc);

    //  Grab the center element's global rectangle.
    centerGlobalRect = centerTPElem.getGlobalRect();

    //  The 'tools layer' is the 'content' div, as we boot.
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

TP.lama.IDE.Inst.defineHandler('CloseActiveTool',
function(aSignal) {

    /**
     * @method handleCloseActiveTool
     * @summary Handles signals that the user wants to close the active tool.
     * @param {TP.sig.ConsoleCommand} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var toolsLayer,

        activeToolID;

    toolsLayer = this.getToolsLayer();

    activeToolID = toolsLayer.getAttribute('activetool');

    this.deactivateTool(activeToolID);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('ConsoleCommand',
function(aSignal) {

    /**
     * @method handleConsoleCommand
     * @summary Handles signals that trigger console command execution.
     * @param {TP.sig.ConsoleCommand} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var consoleService,
        cmdText,

        request;

    //  Grab the console service. This gives us access to the currently active
    //  shell.
    consoleService = TP.bySystemId('LamaConsoleService');

    //  Grab the command text to execute from the signal.
    cmdText = aSignal.at('cmdText');

    //  If it's real and we were able to find the console server, then send the
    //  console request.
    if (TP.notEmpty(cmdText) && TP.isValid(consoleService)) {
        request = consoleService.sendConsoleRequest(cmdText);
        aSignal.atPut('consoleRequest', request);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('RemoteConsoleCommand',
function(aSignal) {

    /**
     * @method handleRemoteConsoleCommand
     * @summary Handles signals that trigger remote console command execution.
     * @param {TP.sig.RemoteConsoleCommand} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.IDE} The receiver.
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
    consoleService = TP.bySystemId('LamaConsoleService');

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
    //  consoleService's 'model' - i.e. the TSH). Note here how we ask for all
    //  forms of the argument, because we want to use the *original* values.
    originalArgs = consoleService.get('model').getArguments(originalRequest,
                                                            TP.ALLFORMS);

    //  Iterate over the ARGV, processing any unnamed arguments
    originalArgs.at('ARGV').forEach(
            function(argValPair) {
                var val;

                //  The 'original' (not expanded) value will be the first value
                //  in the pair.
                val = argValPair.first();
                if (TP.isJSONString(val)) {
                    val = val.quoted();
                }

                cmdText += ' ' + val;
            });

    //  This is a TP.core.Hash - iterate over it and gather up the arguments.
    //  These will be key/value pairs where the value is another pair..
    originalArgs.perform(
            function(kvPair) {
                var argName,
                    argValue;

                argName = kvPair.first();

                //  The 'original' (not expanded) value will be the first value
                //  in the value pair.
                argValue = kvPair.last().first();
                if (TP.isJSONString(argValue)) {
                    argValue = argValue.quoted();
                }

                //  We already processed ARGV above, which includes all ARG*
                //  arguments.
                if (/(^ARG|^tsh:ARG)/.test(argName)) {
                    return;
                }

                //  Note that we only gather arguments that are 'tsh:'
                //  arguments.
                if (argName.startsWith('tsh:')) {

                    //  Slice off the 'tsh:'
                    argName = argName.slice(4);

                    cmdText += ' --' + argName + '=' + argValue;
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

TP.lama.IDE.Inst.defineHandler('AssistObject',
function(aSignal) {

    /**
     * @method handleAssistObject
     * @summary Handles signals that trigger an 'object assistant'.
     * @description Some objects (including console commands) fire this signal
     *     when they want the Lama to present an 'object assistant' in a modal
     *     dialog box.
     * @param {TP.sig.AssistObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
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

                contentTPElem = aDialogTPElem.
                                get('contentElement').
                                getFirstChildElement();

                contentTPElem.set('assistantParams',
                                    aSignal.getPayload().at('assistantParams'));
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @description Note that this handler fires because the Lama is in the
     *     controller stack and this signal is sent through there as well as its
     *     direct observers.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var currentScreenTPWin,
        currentCanvasDoc;

    //  If the Lama hasn't 'set up' yet, that means it hasn't even opened
    //  once. This signal got dispatched because the Lama is in the controller
    //  stack, but hasn't yet been opened. In that case, we don't want to
    //  observe any signals.
    if (!this.get('setupComplete')) {
        return this;
    }

    //  If we're testing, then just exit here.
    if (TP.sys.isTesting()) {
        return this;
    }

    //  Create a TP.core.Window from the signal origin (which should be a String
    //  with the window's name).
    currentScreenTPWin = TP.core.Window.construct(aSignal.getOrigin());
    currentCanvasDoc = currentScreenTPWin.getDocument();

    //  Grab the canvas document and observe mutation style change signals from
    //  it.
    this.observe(currentCanvasDoc, 'TP.sig.MutationStyleChange');

    //  Observe the canvas document for DOMDragDown and DOMMouseDown in a
    //  *capturing* fashion (to avoid having issues with the standard platform's
    //  implementation of mouse/drag down - in this way, we can preventDefault()
    //  on these events before they get in the way).
    this.observe(currentCanvasDoc,
                    TP.ac('TP.sig.DOMDragDown',
                            'TP.sig.DOMMouseDown',
                            'TP.sig.DOMDblClick'),
                    null,
                    TP.CAPTURING);

    //  Observe just the canvas document for when connections are completed to
    //  destination elements *within* the UI canvas (or are cancelled). Panels
    //  in the HUD (which  are in the UI root document) will observe this
    //  method themselves for connections made *to* elements in them.
    this.observe(currentCanvasDoc, TP.ac(
                                    'TP.sig.LamaConnectCancelled',
                                    'TP.sig.LamaConnectCompleted',
                                    'TP.sig.LamaGroupingCompleted'));

    //  Set up a Mutation Summary observer on the document. This will process
    //  changes made to the UI document and propagate them to the correct source
    //  document for saving.
    this.setupMutationSummaryOn(currentCanvasDoc.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var world,
        currentScreenTPWin,

        currentCanvasDoc;

    //  If the Lama hasn't 'set up' yet, that means it hasn't even opened
    //  once. This signal got dispatched because the Lama is in the controller
    //  stack, but hasn't yet been opened. In that case, we don't want to
    //  ignore any signals.
    if (!this.get('setupComplete')) {
        return this;
    }

    //  If we're testing, then just exit here.
    if (TP.sys.isTesting()) {
        return this;
    }

    //  Grab the Lama's 'world' element and get the currently viewed canvas
    //  document from it.
    world = TP.byId('LamaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();
    currentCanvasDoc = currentScreenTPWin.getDocument();

    //  Grab the canvas document and ignore mutation style change signals from
    //  it.
    this.ignore(currentCanvasDoc, 'TP.sig.MutationStyleChange');

    //  Ignore the canvas document for DOMDragDown and DOMMouseDown in a
    //  *capturing* fashion (to match our observation in the DocumentLoaded
    //  handler).
    this.ignore(currentCanvasDoc,
                TP.ac('TP.sig.DOMDragDown',
                        'TP.sig.DOMMouseDown',
                        'TP.sig.DOMDblClick'),
                null,
                TP.CAPTURING);

    //  Ignore the canvas document for when connections are completed to
    //  destination elements *within* the UI canvas (or are cancelled).
    this.ignore(currentCanvasDoc, TP.ac(
                                    'TP.sig.LamaConnectCancelled',
                                    'TP.sig.LamaConnectCompleted',
                                    'TP.sig.LamaGroupingCompleted'));

    //  Tear down any Mutation Summary observer on the document.
    this.teardownCurrentMutationSummary();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('DOMDblClick',
function(aSignal) {

    /**
     * @method handleDOMDblClick
     * @summary Handles when a text node (or wrapping Element) in the current
     *     UI canvas is double clicked for editing.
     * @param {TP.sig.DOMDblClick} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var targetElem;

    //  If the signal didn't happen in the current UI canvas, then we move on.
    //  Inline editing is limited to UI canvas only.
    if (aSignal.getDocument() !== TP.sys.uidoc()) {
        return this;
    }

    //  If the Shift key is down, then we go ahead and resolve the target and
    //  set up an 'inline editor' on it.
    if (aSignal.getShiftKey()) {

        //  Compute the target element from the underlying DOM signal.
        targetElem = aSignal.getResolvedTarget();

        this.setupEditorOn(targetElem);
    }

    return this;
}, {
    phase: TP.CAPTURING
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('DOMDragDown',
function(aSignal) {

    /**
     * @method handleDOMDragDown
     * @summary Handles notification of when the receiver might be starting a
     *     connection session.
     * @param {TP.sig.DOMDragDown} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var connector,
        tool;

    //  If the Shift key is down and the Alt key is as well, then start a
    //  connector session.
    if (aSignal.getShiftKey() && aSignal.getAltKey()) {
        connector = TP.byId('LamaConnector', TP.sys.getUIRoot());
        if (TP.notValid(connector)) {
            return this;
        }

        connector.startConnecting(aSignal);

        return this;
    }

    //  If the signal didn't happen in the current UI canvas, then we move on.
    //  All of the remaining controls are limited to UI canvas only.
    if (aSignal.getDocument() !== TP.sys.uidoc()) {
        return this;
    }

    //  If only the Alt key is down, then activate the grouping tool.
    if (aSignal.getAltKey()) {
        tool = TP.byId('LamaGroupingTool', TP.sys.getUIRoot());
        if (TP.notValid(tool)) {
            return this;
        }

        tool.activate(null, aSignal);

        return this;
    }

    return this;
}, {
    phase: TP.CAPTURING
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('DOMMouseDown',
function(aSignal) {

    /**
     * @method handleMouseDown
     * @summary Handles notification of when the receiver might be starting a
     *     connection session.
     * @param {TP.sig.DOMMouseDown} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var target;

    //  If both the Shift and Alt (Option) keys are down.
    if (aSignal.getShiftKey() && aSignal.getAltKey()) {

        //  First, prevent default on the signal. If we're over something like
        //  a text input, this is very important to prevent things like focusing
        //  and selection.
        aSignal.preventDefault();

        //  Next, grab the target and, if it's an Element and has a
        //  'tibet:no-dragtrap' attribute on it, remove that attribute and
        //  track the fact that we had a target that had that attribute.
        //  Controls like text input fields will have this attribute, because
        //  during normal production operation we do *not* want to allow
        //  TIBET-synthesized DOMDrag* signals to be originated from them. In
        //  this case, though, the 'builder' aspect of the Lama is going to
        //  override that.
        target = aSignal.getTarget();
        if (TP.isElement(target) &&
            TP.elementHasAttribute(target, 'tibet:no-dragtrap', true)) {
                TP.elementRemoveAttribute(target, 'tibet:no-dragtrap', true);
                this.$set('$nodragtrapTarget', target);
        }
    }

    return this;
}, {
    phase: TP.CAPTURING
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('DOMMouseWheel',
function(aSignal) {

    /**
     * @method handleDOMMouseWheel
     * @summary Handles notifications of mouse wheel signals.
     * @param {TP.sig.DOMMouseWheel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.world} The receiver.
     */

    var targetTPElem;

    if (aSignal.getCtrlKey()) {
        aSignal.preventDefault();

        //  Zoom the body to the point supplied by the signal.
        targetTPElem = TP.sys.uidoc().getBody();
        targetTPElem.zoomToPoint(
                        aSignal.getPagePoint(),
                        aSignal.getWheelDelta(),
                        0.1,
                        4);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('EditObject',
function(aSignal) {

    /**
     * @method handleEditObject
     * @summary Handles signals that trigger the inspector's object editing
     *     capabilities.
     * @param {TP.sig.EditObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var northDrawer;

    //  Open the north drawer
    northDrawer = TP.byId('north', this.get('vWin'));
    northDrawer.setAttribute('closed', false);

    //  Signal the inspector to focus itself for editing on the target object
    //  supplied in the payload.
    TP.byId('LamaInspector', this.get('vWin')).signal(
                            'FocusInspectorForEditing', aSignal.getPayload());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('InspectObject',
function(aSignal) {

    /**
     * @method handleInspectObject
     * @summary Handles signals that trigger the inspector's object inspection
     *     capabilities.
     * @param {TP.sig.InspectObject} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
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
            TP.byId('LamaInspector', this.get('vWin')).signal(
                    'FocusInspectorForBrowsing',
                    aSignal.getPayload());

        }.bind(this);

        drawerIsOpenFunc.observe(northDrawer, 'TP.sig.DOMTransitionEnd');

        northDrawer.setAttribute('closed', false);
    } else {
        //  Signal the inspector to focus itself for browsing on the target
        //  object supplied in the payload.
        TP.byId('LamaInspector', this.get('vWin')).signal(
                'FocusInspectorForBrowsing',
                aSignal.getPayload());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('MutationStyleChange',
function(aSignal) {

    /**
     * @method handleMutationStyleChange
     * @summary Handles notifications of node style changes from the overall
     *     canvas that the Lama is working with.
     * @param {TP.sig.MutationStyleChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.IDE} The receiver.
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

            //  Stamp the owner element with a 'tibet:no-reload' attribute so
            //  that the style element will *not* reload when it receives a
            //  change notification due to its underlying content changing.
            TP.elementSetAttribute(ownerElem, 'tibet:no-reload', 'true', true);

            //  Set the resource of the sheetURI. This should dirty it.
            sheetURI.setResource(finalContent);

            //  Remove the 'tibet:no-reload' attribute from the owner element
            //  so that it will now reload when its content changes.
            TP.elementRemoveAttribute(ownerElem, 'tibet:no-reload', true);

            return this;
        } else {
            //  TODO: Raise an exception
            return this;
        }
    }

    //  If we didn't find a matching rule to update, then if the operation is
    //  TP.CREATE, we can just append the new rule to the URI content matching
    //  the sheet's location.
    if (!currentContent.contains(mutatedRule.selectorText)) {

        if (operation === TP.CREATE) {

            //  Grab all of the declarations for the mutated rule, split them
            //  and join them back together with newlines to match TIBET
            //  formatting rules.
            rules = TP.styleRuleGetDeclarationsSource(mutatedRule).split(';');
            str = rules.join(';\n');

            //  Build up a content chunk that can be appended to the URI content
            //  matching the sheet's location.
            str = mutatedRule.selectorText + ' {\n' + str + '}\n';
            finalContent = currentContent + '\n' + str;

            //  Stamp the owner element with a 'tibet:no-reload' attribute so
            //  that the style element will *not* reload when it receives a
            //  change notification due to its underlying content changing.
            TP.elementSetAttribute(ownerElem, 'tibet:no-reload', 'true', true);

            //  Set the resource of the sheetURI. This should dirty it.
            sheetURI.setResource(finalContent);

            //  Remove the 'tibet:no-reload' attribute from the owner element
            //  so that it will now reload when its content changes.
            TP.elementRemoveAttribute(ownerElem, 'tibet:no-reload', true);

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
    /* eslint-disable no-control-regex */
    matcher = TP.rc(
                '(^|\\}|\\*\\/)\\s*(' +
                RegExp.escapeMetachars(
                str.replace(/[\u0009\u000A\u0020\u000D]+/g, 'SECRET_SAUCE')).
                    replace(/SECRET_SAUCE/g, '\\s*') +
                ')',
                'g');
    /* eslint-enable no-control-regex */

    //  Kick the match count once so that, if we didn't find any matching
    //  selectors 'ahead' of us in the file, we'll match our lone selector
    //  occurrence.
    preRuleSelectorCount++;
    for (i = 0; i < preRuleSelectorCount; i++) {
        //  Find the rule text start in the content by matching using the
        //  generated RegExp.
        match = matcher.exec(currentContent);

        //  Adjust the lastIndex to start the next exec() after the matched
        //  rule. Note here how we add the difference between the whole match
        //  and the match at group 1. This gives us the offset from the head of
        //  the match into just where the selector begins.
        startIndex = match.index + (match[0].length - match[2].length);
        matcher.lastIndex = currentContent.indexOf('}', startIndex) + 1;
    }

    //  If no match could be found, exit here.
    if (TP.notValid(match)) {
        //  TODO: Raise an exception
        return this;
    }

    //  The rule text starts where the match was made (plus the offset as
    //  described above) and ends at the trailing bracket ('}');
    startIndex = match.index + (match[0].length - match[2].length);
    endIndex = currentContent.indexOf('}', startIndex) + 1;

    //  Grab the rule text
    ruleText = currentContent.slice(startIndex, endIndex);

    //  Generate a RegExp that will match the name of the mutated property and
    //  it's declaration through the semicolon (';').
    propertyMatcher = TP.rc('(^|;\\s*)+' +
                            aSignal.at('mutatedProperty') +
                            '\\s*:.+;[\\n\\r]?');

    //  If the signal indicated an operation of TP.UPDATE, we need to test to
    //  make sure that the property text actually exists in the rule text.
    //  Sometimes, due to a desire to not signal each style property mutation, a
    //  'final' mutation signal will be sent with an operation of TP.UPDATE, but
    //  the property doesn't actually exist yet in the source that we're
    //  managing. In that case, we switch the operation to TP.CREATE.
    if (!propertyMatcher.test(ruleText)) {
        operation = TP.CREATE;
    }

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
                        function(wholeMatch, prefix) {
                            return prefix +
                                    aSignal.at('mutatedProperty') +
                                    ': ' +
                                    aSignal.at(TP.NEWVAL) +
                                    ';\n';
                        });

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
    patch = TP.extern.Diff.createPatch(loc, currentContent, newContent);
    finalContent = TP.extern.Diff.applyPatch(currentContent, patch);

    //  Stamp the owner element with a 'tibet:no-reload' attribute so that the
    //  style element will *not* reload when it receives a change notification
    //  due to its underlying content changing.
    TP.elementSetAttribute(ownerElem, 'tibet:no-reload', 'true', true);

    //  Set the resource of the sheetURI. This should dirty it.
    sheetURI.setResource(finalContent, TP.request('isDirty', true));

    //  Remove the 'tibet:no-reload' attribute from the owner element so that
    //  it will now reload when its content changes.
    TP.elementRemoveAttribute(ownerElem, 'tibet:no-reload', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('ScreenWillToggle',
function(aSignal) {

    /**
     * @method handleScreenWillToggle
     * @summary Handles notifications of screen will toggle signals.
     * @param {TP.sig.ScreenWillToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var world,

        oldScreenTPWin,
        oldCanvasDoc;

    world = TP.byId('LamaWorld', TP.sys.getUIRoot());

    //  Grab the old screen TP.core.Window and ignore
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    oldScreenTPWin = world.get('selectedScreen').getContentWindow();
    this.ignore(oldScreenTPWin, TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    oldCanvasDoc = oldScreenTPWin.getDocument();

    //  Grab the canvas document and ignore mutation style change signals from
    //  it.
    this.ignore(oldCanvasDoc, 'TP.sig.MutationStyleChange');

    //  Ignore the canvas document for DOMDragDown and DOMMouseDown in a
    //  *capturing* fashion (to match our observation in the DocumentLoaded
    //  handler).
    this.ignore(oldCanvasDoc,
                TP.ac('TP.sig.DOMDragDown',
                        'TP.sig.DOMMouseDown',
                        'TP.sig.DOMDblClick'),
                null,
                TP.CAPTURING);

    //  Ignore the canvas document for when connections are completed to
    //  destination elements *within* the UI canvas (or are cancelled).
    this.ignore(oldCanvasDoc, TP.ac(
                                    'TP.sig.LamaConnectCancelled',
                                    'TP.sig.LamaConnectCompleted',
                                    'TP.sig.LamaGroupingCompleted'));

    this.ignore(oldCanvasDoc, 'TP.sig.DOMMouseWheel');

    //  Tear down any Mutation Summary observer on the document.
    this.teardownCurrentMutationSummary();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('ScreenDidToggle',
function(aSignal) {

    /**
     * @method handleScreenDidToggle
     * @summary Handles notifications of screen did toggle signals.
     * @param {TP.sig.ScreenDidToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var world,

        newScreen,
        newScreenTPWin,
        newCanvasDoc;

    world = TP.byId('LamaWorld', TP.sys.getUIRoot());

    //  Grab the new screen TP.core.Window and observe
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    newScreen = world.get('screens').at(aSignal.at('screenIndex'));

    if (TP.isValid(newScreen)) {
        newScreenTPWin = newScreen.getContentWindow();
        this.observe(newScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    }

    newCanvasDoc = newScreenTPWin.getDocument();

    //  Grab the canvas document and observe mutation style change signals from
    //  it.
    this.observe(newCanvasDoc, 'TP.sig.MutationStyleChange');

    //  Observe the canvas document for DOMDragDown and DOMMouseDown in a
    //  *capturing* fashion (to avoid having issues with the standard platform's
    //  implementation of mouse/drag down - in this way, we can preventDefault()
    //  on these events before they get in the way).
    this.observe(newCanvasDoc,
                    TP.ac('TP.sig.DOMDragDown',
                            'TP.sig.DOMMouseDown',
                            'TP.sig.DOMDblClick'),
                    null,
                    TP.CAPTURING);

    //  Observe just the canvas document for when connections are completed to
    //  destination elements *within* the UI canvas (or are cancelled). Panels
    //  in the HUD (which  are in the UI root document) will observe this
    //  method themselves for connections made *to* elements in them.
    this.observe(newCanvasDoc, TP.ac(
                                    'TP.sig.LamaConnectCancelled',
                                    'TP.sig.LamaConnectCompleted',
                                    'TP.sig.LamaGroupingCompleted'));

    this.observe(newCanvasDoc, 'TP.sig.DOMMouseWheel');

    //  Set up a Mutation Summary observer on the document. This will process
    //  changes made to the UI document and propagate them to the correct source
    //  document for saving.
    this.setupMutationSummaryOn(newCanvasDoc.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('LamaConnectCancelled',
function(aSignal) {

    /**
     * @method handleLamaConnectCancelled
     * @summary Handles notifications of the fact that the Lama connector
     *     did not successfully complete a connection and was cancelled.
     * @param {TP.sig.LamaConnectCancelled} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var connector;

    connector = TP.byId('LamaConnector', this.get('vWin'));

    connector.hideAllConnectorVisuals();

    //  Signal that the connection has failed.
    this.signal('LamaConnectFailed');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('LamaConnectCompleted',
function(aSignal) {

    /**
     * @method handleLamaConnectCompleted
     * @summary Handles notifications of the fact that the Lama connector
     *     successfully completed a connection.
     * @param {TP.sig.LamaConnectCompleted} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var srcTPElem,
        destTPElem,

        targetType,

        connector,

        vendValue,
        vendValues,

        acceptValue,
        acceptValues,

        dataSource;

    srcTPElem = aSignal.at('sourceElement');
    destTPElem = TP.wrap(aSignal.getTarget());

    targetType = destTPElem.getType();

    //  Turn off 'autohiding' the connector - we'll hide it when the assistant
    //  is done. Note that this is reset to 'true' every time the connector is
    //  hidden.
    connector = TP.byId('LamaConnector', this.get('vWin'));
    connector.set('autohideConnector', false);

    //  Grab the values that determine what type of connection we're vending.
    vendValue = srcTPElem.getAttribute('lama:connector-vend');
    vendValues = vendValue.split(' ');

    //  Grab the values that determine what type of connection we're accepting.
    acceptValue = destTPElem.getAttribute('lama:connector-accept');
    acceptValues = acceptValue.split(' ');

    //  If both the vended values and the accepted values contained
    //  'bindingsource', then invoke the binding connection assistant.
    if (vendValues.contains('bindingsource') &&
        acceptValues.contains('bindingsource')) {

        //  Grab the value of the 'lama:connector-source' attribute. This
        //  will give us the system ID of the object that we can query to find
        //  'connector data' - data about this connector dragging session.
        dataSource = srcTPElem.getAttribute('lama:connector-source');
        if (TP.notEmpty(dataSource)) {

            //  Grab the connector data source object, if it can be found.
            dataSource = TP.bySystemId(dataSource, this.get('vWin'));
            if (TP.isValid(dataSource)) {

                //  Ask the connector data source for any data it might have
                //  regarding the connector session. Add the destination element
                //  to that and pass it along to the assistant.
                dataSource.getConnectorData(srcTPElem).then(
                    function(bindingData) {

                        var bindData;

                        bindData = bindingData;

                        if (TP.isValid(bindData)) {
                            bindData.atPut('destTPElement', destTPElem);
                        } else {
                            bindData = TP.hc('destTPElement', destTPElem);
                        }

                        //  Show the assistant.
                        TP.lama.bindingConnectionAssistant.showAssistant(
                                                                bindData);
                    });
            }
        }

        return this;
    }

    //  If both the vended values and the accepted values contained
    //  'signalsource', then invoke the signal connection assistant.
    if (vendValues.contains('signalsource') &&
        acceptValues.contains('signalsource')) {
        //  Show the assistant.
        TP.lama.signalConnectionAssistant.showAssistant(
                    TP.hc('sourceTPElement', srcTPElem,
                            'destinationTarget', targetType,
                            'signalOrigin', destTPElem.getLocalID()));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('LamaConnectInitiate',
function(aSignal) {

    /**
     * @method handleLamaConnectInitiate
     * @summary Handles notifications of the fact that the Lama connector
     *     initiated a connection session.
     * @param {TP.sig.LamaConnectInitiate} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var sourceTPElem,

        collectors,

        vendValue,
        vendValues;

    //  Grab the connector source element
    sourceTPElem = aSignal.at('sourceElement');

    //  Grab the values that determine what type of connection we're vending.
    vendValue = sourceTPElem.getAttribute('lama:connector-vend');
    vendValues = vendValue.split(' ');

    //  Grab the target collectors for connection sessions.
    collectors = this.get('connectorCollectors');

    //  Iterate over each vending value, run the collection function and
    //  manipulate the results.
    vendValues.forEach(
        function(aVendValue) {

            var collector,
                matchingNodes;

            //  Grab the Function in the collectors according to the current
            //  vend value and make sure it's a Function.
            collector = collectors.at(aVendValue);
            if (!TP.isCallable(collector)) {
                return;
            }

            //  Run the Function, supplying the source element in case it wants
            //  to use it for context.
            matchingNodes = collector(sourceTPElem);

            //  Iterate over each node that matched, which should be an Element,
            //  and add the vend value to the 'lama:connector-accept'
            //  attribute.
            matchingNodes.forEach(
                function(aNode) {

                    if (TP.isElement(aNode)) {
                        TP.elementAddAttributeValue(aNode,
                                                    'lama:connector-accept',
                                                    aVendValue,
                                                    true);
                    }
                });
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('LamaConnectTerminate',
function(aSignal) {

    /**
     * @method handleLamaConnectTerminate
     * @summary Handles notifications of the fact that the Lama connector
     *     terminated a connection session.
     * @param {TP.sig.LamaConnectTerminate} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var noTrapTarget,

        sourceTPElem,
        destinationTPElem,

        collectors,

        vendValue,
        vendValues,

        connector;

    //  If we had a target that used to have a 'tibet:no-dragtrap' attribute
    //  on it, we need to put that back now that the connector session is
    //  terminating.
    noTrapTarget = this.$get('$nodragtrapTarget');
    if (TP.isValid(noTrapTarget)) {
        TP.elementSetAttribute(noTrapTarget,
                                'tibet:no-dragtrap',
                                'true',
                                true);
        this.$set('$nodragtrapTarget', null);
    }

    //  Grab the connector source and destination elements.
    sourceTPElem = aSignal.at('sourceElement');
    destinationTPElem = aSignal.at('destinationElement');

    //  Grab the values that determine what type of connection we're vending.
    vendValue = sourceTPElem.getAttribute('lama:connector-vend');
    vendValues = vendValue.split(' ');

    //  Grab the target collectors for connection sessions.
    collectors = this.get('connectorCollectors');

    //  Iterate over each vending value, run the collection function and
    //  manipulate the results.
    vendValues.forEach(
        function(aVendValue) {

            var collector,
                matchingNodes;

            //  Grab the Function in the collectors according to the current
            //  vend value and make sure it's a Function.
            collector = collectors.at(aVendValue);
            if (!TP.isCallable(collector)) {
                return;
            }

            //  Run the Function, supplying the source element in case it wants
            //  to use it for context.
            matchingNodes = collector(sourceTPElem);

            //  Iterate over each node that matched, which should be an Element,
            //  and remove the vend value from the 'lama:connector-accept'
            //  attribute.
            matchingNodes.forEach(
                function(aNode) {

                    if (TP.isElement(aNode)) {
                        TP.elementRemoveAttributeValue(
                                            aNode,
                                            'lama:connector-accept',
                                            aVendValue,
                                            true);
                    }
                });
        });

    //  If there was a completed connection, then the assistants (or whatever
    //  object is handling those) is responsible for hiding the connectors when
    //  it is completely finished, but in the case of invalid destination
    //  elements they will never be notified, so we have to hide it here.
    if (TP.notValid(destinationTPElem)) {
        connector = TP.byId('LamaConnector', TP.sys.getUIRoot());
        connector.hideAllConnectorVisuals();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('LamaGroupingCompleted',
function(aSignal) {

    /**
     * @method handleLamaGroupingCompleted
     * @summary Handles notifications of the fact that the Lama grouping tool
     *     has finished a grouping session.
     * @param {TP.sig.LamaGroupingCompleted} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var groupedNodes;

    //  Grab all of the nodes that were grouped. This includes all kinds of
    //  Nodes, not just Elements.
    groupedNodes = aSignal.at('groupedNodes');
    if (TP.isEmpty(groupedNodes)) {
        return this;
    }

    //  Prompt the user to give a 'grouping tag name', with pre-supplied values
    //  for XHTML 'span' and 'div'.
    TP.promptWithChoices(
        'Group these elements under a common parent:',
        TP.ac('html:span', 'html:div'),
        'html:span').then(
        function(groupingTagName) {

            var halo,

                tagName,
                groupingElem,

                roots,

                firstElem,
                insertedGroupingElem,

                len,
                i;

            if (TP.isEmpty(groupingTagName)) {
                return;
            }

            //  Grab the halo and see if it's focused.
            halo = TP.byId('LamaHalo', TP.sys.getUIRoot());
            if (halo.isFocused()) {
                halo.blur();
            }

            //  Tell ourself that it should go ahead and process DOM mutations
            //  to the source DOM.
            this.set('shouldProcessDOMMutations', true);

            //  If the grouping tag name that the user supplied began with
            //  'html:', then slice off the prefix and create the Element using
            //  a default namespace of XHTML.
            if (/html:/.test(groupingTagName)) {
                tagName = groupingTagName.slice(5);
                groupingElem = TP.xhtmlnode('<' + tagName + '/>');
            } else {
                //  Otherwise, use whatever tag name they gave.
                tagName = groupingTagName;
                groupingElem = TP.elem('<' + tagName + '/>');
            }

            //  Filter out non-roots. This leaves only the 'roots' of the
            //  collection and significantly reduces the processing when moving
            //  nodes around inside of both the UI canvas document and any
            //  source documents.
            roots = TP.nodeListFilterNonRoots(groupedNodes);

            //  Grab the first root and replace it with the grouping element.
            firstElem = roots.first();
            insertedGroupingElem = TP.elementReplaceWith(
                                        firstElem, groupingElem, null, false);

            //  Move all of the nodes under the grouping element, making sure to
            //  pass false to not awaken the nodes.
            len = roots.getSize();
            for (i = 0; i < len; i++) {
                TP.nodeAppendChild(insertedGroupingElem,
                                    roots.at(i),
                                    false);
            }

            //  After a 1000ms timeout, focus the halo on the element
            //  representing the grouping element that was actually inserted in
            //  the UI canvas.
            (function() {
                //  Focus the halo on our new grouping element, passing true to
                //  actually show the halo if it's hidden.
                halo.focusOn(TP.wrap(insertedGroupingElem), true);
            }).queueAfterNextRepaint();
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('TypeLoaded',
function(aSignal) {

    /**
     * @method handleTypeLoaded
     * @summary Handles signals that are triggered when a new type is loaded.
     * @param {TP.sig.TypeLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var newType,
        typeName;

    newType = aSignal.getOrigin();
    if (!TP.isType(newType)) {
        //  TODO: Raise an exception here.
        return this;
    }

    //  If the new type is a subtype of TP.tag.CustomTag, then we need to have
    //  the 'lama:tofu' tag replace any occurrences of itself that are proxies
    //  for that new tag type.
    if (TP.isSubtypeOf(newType, TP.tag.CustomTag)) {
        typeName = newType.getName();
        TP.lama.tofu.replaceOccurrencesOf(typeName);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('RouteExit',
function(aSignal) {

    /**
     * @method handleRouteExit
     * @summary Handles when the route in the current UI canvas is changed and
     *     the current document content unloads.
     * @description Note that this handler fires because the Lama is in the
     *     controller stack and this signal is sent through there as well as its
     *     direct observers.
     * @param {TP.sig.RouteExit} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    var lamaDoc,
        halo;

    //  The document that we were installed into.
    lamaDoc = this.get('vWin').document;

    halo = TP.byId('LamaHalo', lamaDoc);

    if (TP.isValid(halo)) {
        //  Note that we do not worry here whether the current target can be
        //  blurred or not. The screen content is changing and we can't stop it.
        halo.blur();
        halo.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineHandler('ToggleLama',
function(aSignal) {

    /**
     * @method handleToggleLama
     * @summary Handles signals that are triggered when the Lama is to be
     *     toggled.
     * @param {TP.sig.ToggleLama} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.IDE} The receiver.
     */

    this.toggle();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('insertElementIntoCanvas',
function(newElement, insertionPointElement, aPositionOrPath, shouldFocusHalo,
shouldShowAssistant, insertionCompletedHandler) {

    /**
     * @method insertElementIntoCanvas
     * @summary Inserts the supplied element into the canvas using the supplied
     *     insertion element at the supplied insertion point. The element should
     *     exist in the current canvas being managed by the Lama as this
     *     method turns on Lama mutation tracking machinery for the purpose of
     *     updating a source document.
     * @param {Element} newElement The element to insert.
     * @param {Element} insertionPointElement The element to use as an insertion
     *     point. Combined with the supplied insertion position, this will
     *     determine where the element is inserted.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the supplied insertion point element or a path to
     *     evaluate to get to a node at that position. This should be one of
     *     four values: TP.BEFORE_BEGIN TP.AFTER_BEGIN TP.BEFORE_END
     *     TP.AFTER_END or the path to evaluate. Default is TP.BEFORE_END.
     * @param {Boolean} [shouldFocusHalo=false] Whether or not we should focus
     *     the halo after insertion.
     * @param {Boolean} [shouldShowAssistant=false] Whether or not we should
     *     show the element's DOMHUD assistant after insertion. The default is
     *     false and is dependent on whether we're focusing the halo as well.
     * @param {Function} [insertionCompletedHandler] A Function to execute when
     *     the element has been inserted and any halo focusing has occurred.
     * @returns {TP.lama.IDE} The receiver.
     */

    var newTPElem,
        insertionPointTPElem,

        insertedTPElem,
        insertedElem,

        handler;

    newTPElem = TP.wrap(newElement);

    insertionPointTPElem = TP.wrap(insertionPointElement);

    //  ---

    //  Tell ourself that it should go ahead and process DOM mutations to the
    //  source DOM.
    this.set('shouldProcessDOMMutations', true);

    //  Insert the new element into target element at the inserted position.
    insertedTPElem = insertionPointTPElem.insertContent(
                                newTPElem, aPositionOrPath);

    insertedElem = TP.unwrap(insertedTPElem);

    //  Set up a handler that waits until the content renders and then focus it.
    (handler = function(didRenderSignal) {
        handler.ignore(insertedTPElem, 'TP.sig.DidRender');

        TP.nodeRefreshDescendantDocumentPositions(insertedElem);

    }).observe(insertedTPElem, 'TP.sig.DidRender');

    insertedElem[TP.INSERTION_POSITION] = aPositionOrPath;
    insertedElem[TP.LAMA_MUTATION] = TP.INSERT;

    this.focusInputCell();

    if (TP.isTrue(shouldFocusHalo)) {
        //  Focus the halo onto the inserted element after 1000ms
        (function() {
            var viewDoc,
                halo;

            //  The document that we were installed into.
            viewDoc = this.get('vWin').document;

            halo = TP.byId('LamaHalo', viewDoc);

            //  This will move the halo off of the old element. Note that we
            //  do *not* check here whether or not we *can* blur - we
            //  definitely want to blur off of the old DOM content - it's
            //  probably gone now anyway.
            halo.blur();

            //  Focus the halo on our new element, passing true to actually
            //  show the halo if it's hidden.
            if (insertedTPElem.haloCanFocus(halo)) {
                halo.focusOn(insertedTPElem, true);
            }

            if (TP.isCallable(insertionCompletedHandler)) {
                insertionCompletedHandler(insertedTPElem);
            }

            if (TP.isTrue(shouldShowAssistant)) {
                TP.byId('DOMHUD', viewDoc).showAssistant();
            }
        }).bind(this).queueAfterNextRepaint();
    }

    //  Set up a timeout to delete those flags after a set amount of time
    setTimeout(
        function() {
            delete insertedElem[TP.INSERTION_POSITION];
            delete insertedElem[TP.LAMA_MUTATION];
        }, TP.sys.cfg('lama.mutation_flag_clear_timeout', 5000));

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('insertServiceElementIntoCanvas',
function(remoteLocation, localLocation, insertionPointElement, aPositionOrPath,
shouldFocusHalo, shouldShowAssistant, insertionCompletedHandler) {

    /**
     * @method insertServiceElementIntoCanvas
     * @summary Inserts a 'http:service' element into the canvas with the
     *     supplied remote (and possibly local) locations using the supplied
     *     insertion element at the supplied insertion point.
     * @param {String} remoteLocation The remote URI location to use for the
     *     service tag.
     * @param {String} [localLocation] The local URI location to use for the
     *     service tag. If this parameter is not supplied, then a local URI
     *     location will be computed.
     * @param {Element} insertionPointElement The element to use as an insertion
     *     point. Combined with the supplied insertion position, this will
     *     determine where the element is inserted.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the supplied insertion point element or a path to
     *     evaluate to get to a node at that position. This should be one of
     *     four values: TP.BEFORE_BEGIN TP.AFTER_BEGIN TP.BEFORE_END
     *     TP.AFTER_END or the path to evaluate. Default is TP.BEFORE_END.
     * @param {Boolean} [shouldFocusHalo=false] Whether or not we should focus
     *     the halo after insertion.
     * @param {Boolean} [shouldShowAssistant=false] Whether or not we should
     *     show the element's DOMHUD assistant after insertion. The default is
     *     false and is dependent on whether we're focusing the halo as well.
     * @param {Function} [insertionCompletedHandler] A Function to execute when
     *     the element has been inserted and any halo focusing has occurred.
     * @returns {TP.tibet.service} The wrapped newly inserted 'http:service'
     *     element.
     */

    var elemID,
        localLoc,

        newServiceElem;

    //  If a local location wasn't supplied, then generate an ID and compute a
    //  URI from it.
    if (TP.isEmpty(localLocation)) {
        elemID = 'uri' + TP.genID().replace('$', '_');
        localLoc = TP.TIBET_URN_PREFIX + elemID + '_result';
    } else {
        //  Otherwise, grab the local location. To compute a local ID, if it
        //  matches a 'urn:tibet' URN, then grab the resource name to use as a
        //  element ID.
        localLoc = localLocation;
        if (TP.regex.TIBET_URN.test(localLoc)) {
            elemID = TP.regex.TIBET_URN_SPLITTER.exec(localLoc).at(2);
        } else {
            elemID = 'uri' + TP.genID().replace('$', '_');
        }
    }

    //  Make sure the local location has a real URI allocated to it so that the
    //  system can reference it and use it.
    TP.uc(localLoc);

    newServiceElem = TP.elem('<http:service' +
                                ' id="' + elemID + '"' +
                                ' href="' + remoteLocation + '"' +
                                ' name="' + localLoc + '"/>');

    this.insertElementIntoCanvas(
            newServiceElem,
            insertionPointElement,
            aPositionOrPath,
            shouldFocusHalo,
            shouldShowAssistant,
            insertionCompletedHandler);

    return TP.wrap(newServiceElem);
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('makeCustomTagFrom',
function(aTPElem) {

    /**
     * @method makeCustomTagFrom
     * @summary Constructs a custom tag using the supplied element. This will
     *     invoke the 'type assistant' with the 'templatedtag' DNA selected.
     * @param {TP.dom.ElementNode} aTPElem The element content to make a custom
     *     tag from.
     * @returns {TP.lama.IDE} The receiver.
     */

    var newTagName,

        additionHandler,
        cancellationHandler;

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
    additionHandler = function(typeAddedSignal) {

        var elem,
            tagType,
            tagName,

            resourceURI,
            loc,

            serializationStorage,
            str,

            lamaDoc;

        //  Make sure to unregister the handler - this is a one shot.
        additionHandler.ignore(TP.ANY, 'TypeAdded');

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
            lamaDoc = this.get('vWin').document;

            //  Save the template to the file system. If this succeeds, then
            //  replace the supplied TP.dom.ElementNode with the new custom tag.
            this.saveElementSerialization(
                    serializationStorage,
                    function() {
                        var newElem,

                            oldElem,
                            parentElem,

                            newTPElem,

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

                            //  Make sure to refresh all of the descendant
                            //  document positions for the UI canvas since we're
                            //  going to be updating the canvas source.
                            TP.nodeRefreshDescendantDocumentPositions(
                                                            TP.sys.uidoc(true));

                            this.updateUICanvasSource(
                                    TP.ac(oldElem),
                                    oldElem.parentNode,
                                    TP.DELETE,
                                    null,
                                    null,
                                    null,
                                    false);

                            newElem = TP.nodeReplaceChild(
                                        parentElem, newElem, oldElem);

                            TP.nodeRefreshDescendantDocumentPositions(
                                                            TP.sys.uidoc(true));

                            this.updateUICanvasSource(
                                    TP.ac(newElem),
                                    newElem.parentNode,
                                    TP.CREATE,
                                    null,
                                    null,
                                    null,
                                    false);

                            newTPElem = TP.wrap(newElem);

                            halo = TP.byId('LamaHalo', lamaDoc);

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

    additionHandler.observe(TP.ANY, 'TypeAdded');

    //  Set up a handler that will wait for a 'TypeAdditionCancelled' signal.
    cancellationHandler = function(typeAdditionCancelledSignal) {

        additionHandler.ignore(TP.ANY, 'TypeAdded');
        cancellationHandler.ignore(TP.ANY, 'TypeAdditionCancelled');
    };

    cancellationHandler.observe(TP.ANY, 'TypeAdditionCancelled');

    return this;
}, {
    patchCallee: false
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('makeTile',
function(anID, headerText, tileParent) {

    /**
     * @method makeTile
     * @summary Makes a new TP.lama.tile 'draggable' surface and populates it
     *     into the Lama's common layer (if tileParent isn't supplied) for
     *     managing tiles.
     * @param {String} anID The ID to give to the tile for future referencing.
     * @param {String} headerText Text to place into the 'header' of the tile.
     * @param {Element} [tileParent] The tile parent element. If this is not
     *     supplied, then the Lama's common tile layer is used as the tile
     *     parent.
     * @returns {TP.lama.tile} The newly created tile.
     */

    var tileTemplateTPElem,

        parent,
        tileTPElem,

        tileID,

        centerTPElem,
        centerTPElemPageRect;

    //  Grab the TP.lama.tile's template.
    tileTemplateTPElem = TP.lama.tile.getResourceElement(
                            'template',
                            TP.ietf.mime.XHTML);

    //  If the caller didn't supply a parent, then use the Lama's common tile
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

TP.lama.IDE.Inst.defineMethod('processDeletionSummary',
function(aSummary, removedNodes) {

    /**
     * @method processDeletionSummary
     * @summary Processes a 'deletion' summary from the MutationSummary
     *     machinery.
     * @param {Object} aSummary A 'deletion' summary object produced by the
     *     MutationSummary object.
     * @param {Node[]} removedNodes The Array of nodes that were removed from
     *     the current UI canvas document.
     * @returns {TP.lama.IDE} The receiver.
     */

    var records,

        roots;

    //  Grab all of the native MutationObserver records.
    records = aSummary.projection.mutations;

    //  Filter out non-roots. This leaves only the 'roots' of the collection and
    //  significantly reduces the processing when moving nodes around inside of
    //  both the UI canvas document and any source documents.

    //  Unfortunately, we cannot use our normal TP.nodeListFilterNonRoots method
    //  here, since by the time the MutationObserver/MutationSummary machinery
    //  has been able to process the mutation, these nodes have already been
    //  removed from the DOM tree and their parentNode slot is undefined.
    //  Therefore, we need to filter down to roots by using value of the
    //  TP.PREVIOUS_POSITION slot.
    roots = removedNodes.filter(
        function(aNode) {
            var nodePosition,

                len,
                i,

                removedNode;

            nodePosition = aNode[TP.PREVIOUS_POSITION];
            if (TP.notValid(nodePosition)) {
                return false;
            }

            len = removedNodes.getSize();
            for (i = 0; i < len; i++) {
                removedNode = removedNodes.at(i);
                if (aNode !== removedNode &&
                    nodePosition.startsWith(
                        removedNode[TP.PREVIOUS_POSITION])) {
                    return false;
                }
            }

            return true;
    });

    //  Sort the remaining root nodes so that they are in 'document order' *by
    //  using their TP.PREVIOUS value*.
    roots.sort(TP.sort.DOM_POSITION_SORT);

    //  Reverse that so that we're coming 'up' the DOM tree from the 'lower
    //  right' leafs 'up' to the 'upper left'. This helps significantly when
    //  processing mutations by mutating the least significant nodes first.
    roots.reverse();

    //  Iterate over each root node and update the source document(s)
    //  represented by the UI currently drawn in the UI canvas document.
    roots.forEach(
        function(aRoot) {

            var matchingRecord,
                mutationAncestor;

            //  Grab the low-level MutationObserver record associated with the
            //  root. We want to use it's 'target' Node when updating the UI
            //  canvas sources below.
            matchingRecord = records.detect(
                function(aRecord) {
                    if (aRecord.type === 'childList' &&
                        TP.ac(aRecord.removedNodes).indexOf(
                                    aRoot) !== TP.NOT_FOUND) {
                        return true;
                    }
                });

            //  MutationSummary has a nice facility where it will preserve the
            //  'old parent' references (which, unfortunately, we cannot wire
            //  into the parentNode slot, or we could use this technique above).
            //  But we do use this technique to compute a mutation ancestor for
            //  updating the UI canvas sources below. We iterate 'up' from the
            //  target through the 'old parent's looking for the 'topmost' node
            //  that has been detached.
            mutationAncestor = matchingRecord.target;
            while (TP.nodeIsDetached(mutationAncestor)) {
                mutationAncestor = aSummary.getOldParentNode(
                                                mutationAncestor);
            }

            //  If we could grab a matching MutationObserver record, then update
            //  the UI canvas.
            if (TP.isValid(matchingRecord)) {
                this.updateUICanvasSource(
                        TP.ac(aRoot),
                        mutationAncestor,
                        TP.DELETE);
            }
        }.bind(this));

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('processInsertionSummary',
function(aSummary, addedNodes) {

    /**
     * @method processInsertionSummary
     * @summary Processes an 'insertion' summary from the MutationSummary
     *     machinery.
     * @param {Object} aSummary An 'insertion' summary object produced by the
     *     MutationSummary object.
     * @param {Node[]} addedNodes The Array of nodes that were added to the
     *     current UI canvas document.
     * @returns {TP.lama.IDE} The receiver.
     */

    var records,

        roots;

    //  Grab all of the native MutationObserver records.
    records = aSummary.projection.mutations;

    //  When the Lama has it's 'shouldProcessDOMMutations' flag set, it
    //  updates all of the visual nodes with a TP.PREVIOUS_POSITION value. Some
    //  added nodes, however, might not have TP.PREVIOUS_POSITION values -
    //  iterate over them and make sure, but don't overwrite any current values.
    addedNodes.forEach(
        function(aNode) {
            //  Don't overwrite any value it already has.
            if (TP.notValid(aNode[TP.PREVIOUS_POSITION])) {
                aNode[TP.PREVIOUS_POSITION] =
                                TP.nodeGetDocumentPosition(aNode);
            }
        });

    //  Filter out non-roots. This leaves only the 'roots' of the collection and
    //  significantly reduces the processing when moving nodes around inside of
    //  both the UI canvas document and any source documents.
    roots = TP.nodeListFilterNonRoots(addedNodes);

    //  Sort the remaining root nodes so that they are in 'document order' *by
    //  using their TP.PREVIOUS value*.
    roots.sort(TP.sort.DOM_POSITION_SORT);

    //  Iterate over each root node and update the source document(s)
    //  represented by the UI currently drawn in the UI canvas document.
    roots.forEach(
        function(aRoot) {

            var matchingRecord;

            //  Grab the low-level MutationObserver record associated with the
            //  root. We want to use it's 'target' Node when updating the UI
            //  canvas sources below.
            matchingRecord = records.detect(
                function(aRecord) {
                    if (aRecord.type === 'childList' &&
                        TP.ac(aRecord.addedNodes).indexOf(
                                    aRoot) !== TP.NOT_FOUND) {
                        return true;
                    }
                });

            //  If we could grab a matching MutationObserver record, then update
            //  the UI canvas.
            if (TP.isValid(matchingRecord)) {
                this.updateUICanvasSource(
                        TP.ac(aRoot),
                        matchingRecord.target,
                        TP.CREATE);
            }
        }.bind(this));

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('processSummaries',
function(summaries) {

    /**
     * @method processSummaries
     * @summary Processes one or more 'mutation summary' records from the
     *     current MutationSummary object that is using a MutationObserver to
     *     object the UI canvas document to service the builder functionality.
     * @param {Object[]} summaries One or more summary objects produced by the
     *     current MutationSummary object.
     * @returns {TP.lama.IDE} The receiver.
     */

    var thisref;

    thisref = this;

    //  Process each summary.
    summaries.forEach(
        function(aSummary) {
            var changedAttributes,

                allMoved,
                movedAndNeedsInsertion;

            //  All of the moved nodes (not simply added or deleted) are either
            //  in the 'reparented' Array or in the 'reordered' Array.
            allMoved = aSummary.reparented.concat(aSummary.reordered);

            //  If there were 'moved' nodes', process them as 'deletes' first
            //  and then reset their 'previous position' numbers and process
            //  them as additions..
            if (TP.notEmpty(allMoved)) {
                thisref.processDeletionSummary(aSummary, allMoved);

                allMoved.forEach(
                    function(aNode) {
                        aNode[TP.PREVIOUS_POSITION] =
                                        TP.nodeGetDocumentPosition(aNode);
                    });

                thisref.processInsertionSummary(aSummary, allMoved);
            }

            //  If there were truly 'removed' nodes, process those as 'deletes'.
            if (TP.notEmpty(aSummary.removed)) {
                thisref.processDeletionSummary(aSummary, aSummary.removed);
            }

            //  If there were truly 'added' nodes, process those as 'adds'.
            if (TP.notEmpty(aSummary.added)) {
                thisref.processInsertionSummary(aSummary, aSummary.added);
            }

            //  If there were 'moved' nodes', process those *again* as 'adds'.
            if (TP.notEmpty(allMoved)) {

                //  If there were also truly 'added' nodes, filter out any
                //  'moved' nodes that were under an 'added' root. Otherwise,
                //  we're just doing a lot of extra work.
                if (TP.notEmpty(aSummary.added)) {
                    movedAndNeedsInsertion = allMoved.filter(
                        function(aNode) {
                            var len,
                                i;

                            len = aSummary.added.getSize();
                            for (i = 0; i < len; i++) {
                                if (aSummary.added.at(i).contains(aNode)) {
                                    return false;
                                }
                            }

                            return true;
                        });

                } else {
                    movedAndNeedsInsertion = allMoved;
                }

                //  If there were moved (and possibly filtered above) nodes,
                //  then update their TP.PREVIOUS_POSITION (since they moved)
                //  and go ahead and process them as 'adds'.
                if (TP.notEmpty(movedAndNeedsInsertion)) {
                    movedAndNeedsInsertion.forEach(
                        function(aNode) {
                            aNode[TP.PREVIOUS_POSITION] =
                                            TP.nodeGetDocumentPosition(aNode);
                        });

                    thisref.processInsertionSummary(
                                aSummary, movedAndNeedsInsertion);
                }
            }

            //  Process attribute changes.
            changedAttributes = aSummary.attributeChanged;
            if (TP.notEmpty(changedAttributes)) {
                TP.keys(changedAttributes).forEach(
                    function(attrName) {

                        var elems;

                        elems = changedAttributes[attrName];
                        elems.forEach(
                            function(anElem) {
                                var oldVal,
                                    newVal,

                                    attrIsEmpty,
                                    attrWasEmpty,

                                    op;

                                oldVal = aSummary.getOldAttribute(
                                            anElem,
                                            attrName);

                                newVal = TP.elementGetAttribute(
                                            anElem,
                                            attrName,
                                            true);

                                attrIsEmpty = TP.isEmpty(newVal);
                                attrWasEmpty = TP.isEmpty(oldVal);

                                //  Select the proper 'operation' depending on
                                //  the new value, the old value and whether or
                                //  not the attribute was empty and is now
                                //  empty.
                                if (!attrIsEmpty && attrWasEmpty) {
                                    op = TP.CREATE;
                                } else if (!attrIsEmpty && !attrWasEmpty &&
                                            newVal !== oldVal) {
                                    op = TP.UPDATE;
                                } else if (attrIsEmpty) {
                                    //  NB: We don't care about attrWasEmpty
                                    //  here - we just delete it.
                                    op = TP.DELETE;
                                }

                                //  Update the UI canvas sources.
                                thisref.updateUICanvasSource(
                                        TP.ac(anElem),
                                        anElem,
                                        op,
                                        attrName,
                                        newVal,
                                        oldVal);
                            });
                    });
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('removeScreenLocation',
function(aLocation) {

    /**
     * @method removeScreenLocation
     * @summary Removes a screen location from the Lama's list of managed
     *     screen locations.
     * @returns {String} aLocation The URI location that should be removed from
     *     the list of screens.
     * @returns {TP.lama.IDE} The receiver.
     */

    var loc,

        screenLocEntries,
        locs,

        index,

        viewDoc,
        worldTPElem;

    //  Grab the fully expanded location of the supplied location.
    loc = TP.uc(aLocation).getLocation();

    //  Grab the set of managed screen locations and convert them to their fully
    //  expanded form. This will allow us to compare to the supplied location in
    //  a canonicalized way.
    screenLocEntries =
        TP.uc('urn:tibet:lama_screenlocs').getResource().get(
                                                        'result');
    locs = screenLocEntries.collect(
                function(aLoc) {
                    return TP.uc(aLoc).getLocation();
                });

    //  If the list of managed screen locations don't contain the supplied
    //  location, exit here. It's not in our list.
    if (!locs.contains(loc)) {
        return;
    }

    index = locs.indexOf(loc);
    if (index === 0) {
        return this;
    }

    //  Remove the virtualized form of the supplied location from the list.
    loc = TP.uriInTIBETFormat(aLocation);
    screenLocEntries.remove(loc);

    //  Let everyone who is observing the list of managed screen locations know
    //  that it just changed.
    TP.uc('urn:tibet:lama_screenlocs').$changed();

    //  Tell the TSH to save its profile, which will cause it to save the list
    //  of managed screen locations, amongst other things.
    TP.bySystemId('TSH').saveProfile();

    //  Grab the world and tell it to destroy the screen that is containing the
    //  location (as identified by its index).
    viewDoc = this.get('vWin').document;
    worldTPElem = TP.byId('LamaWorld', viewDoc);

    worldTPElem.destroyScreen('SCREEN_' + index);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('saveElementSerialization',
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
     * @returns {TP.lama.IDE} The receiver.
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

TP.lama.IDE.Inst.defineMethod('setAttributeOnElementInCanvas',
function(anElement, attributeName, attributeValue, shouldRefresh) {

    /**
     * @method setAttributeOnElement
     * @summary Sets the attribute on the supplied element with the supplied
     *     name to the supplied value. The element should exist in the current
     *     canvas being managed by the Lama as this method turns on Lama
     *     mutation tracking machinery for the purpose of updating a source
     *     document.
     * @param {TP.dom.ElementNode} anElement The element to set the attribute
     *     on.
     * @param {String} attributeName The name of the attribute to set.
     * @param {String} attributeValue The value to set on the attribute.
     * @param {Boolean} [shouldRefresh=true] Whether or not to refresh the
     *     element.
     * @returns {TP.lama.IDE} The receiver.
     */

    //  Tell ourself that it should go ahead and process DOM mutations to the
    //  source DOM.
    this.set('shouldProcessDOMMutations', true);

    //  Go ahead and set the attribute.
    anElement.setAttribute(attributeName, attributeValue);

    if (TP.notFalse(shouldRefresh)) {
        //  In case the attribute affects data binding, we go ahead and refresh
        //  it here.
        anElement.refresh();
    }

    this.focusInputCell();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupFull',
function() {

    /**
     * @method setupFull
     * @summary Perform the initial setup for the 'full version' of the
     *     TP.lama.IDE object.
     * @returns {TP.lama.IDE} The receiver.
     */

    var win,
        thisref,

        allDrawers,

        centerElem,

        resizingHandler,
        observerConfig,
        resizer,

        framingStyleElement,
        variablesRule;

    win = this.get('vWin');

    thisref = this;

    //  Show the center area and the drawers.

    //  First, we remove the 'fullscreen' class from the center element.
    //  This allows the 'content' element below to properly size it's 'busy
    //  message layer'.
    TP.elementRemoveClass(TP.byId('center', win, false),
                            'fullscreen');

    //  Next, start showing the logo animation.

    //  NB: The logo animation is happening at the same time as the drawer
    //  animation, but it is the logo animation that drives the setup
    //  completion.
    this.showLoadingImage(
        function() {
            //  The basic Lama framing has been set up, but we complete
            //  the setup here
            thisref.finishSetup(
                    function() {
                        thisref.lamaSetupFullComplete();
                    });
        });

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

    //  Set up resizing worker functions and value gathering. Note that we make
    //  sure to go after only HTML style elements here.
    framingStyleElement =
        TP.byCSSPath('html|style[tibet|originalhref$="lama_framing.css"]',
                        win,
                        true,
                        false);

    variablesRule = TP.styleSheetGetStyleRulesMatching(
                        TP.cssElementGetStyleSheet(framingStyleElement),
                        'body').first();

    //  Install a custom function on the TP.dnd.DragResponder type that can be
    //  referenced in the markup.
    TP.dnd.DragResponder.Type.defineConstant(
        'ALTER_LAMA_CUSTOM_PROPERTY',
        function(anElement, styleObj, computedVals, infoAttrs) {

            var customPropertyName,

                minVal,
                val;

            customPropertyName = infoAttrs.at('drag:property');
            switch (customPropertyName) {

                case '--lama-drawer-north-open-height':

                    minVal = TP.elementGetPixelValue(
                                anElement,
                                variablesRule.style.getPropertyValue(
                                    '--lama-drawer-north-open-min-height'));

                    val = computedVals.at('height');
                    val = val.max(minVal);

                    break;

                case '--lama-drawer-south-open-height':

                    minVal = TP.elementGetPixelValue(
                                anElement,
                                variablesRule.style.getPropertyValue(
                                    '--lama-drawer-south-open-min-height'));

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

TP.lama.IDE.Inst.defineMethod('setupMinimal',
function() {

    /**
     * @method setupMinimal
     * @summary Perform the initial setup for the 'minimal version' of the
     *     TP.lama.IDE object.
     * @returns {TP.lama.IDE} The receiver.
     */

    var thisref;

    thisref = this;

    this.showLoadingImage(
        function() {
            //  The basic Lama framing has been set up, but we complete
            //  the setup here
            thisref.finishSetup(
                    function() {
                        thisref.lamaSetupMinimalComplete();
                    });
        });

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setShouldProcessDOMMutations',
function(shouldProcess, isSticky, fromNode) {

    /**
     * @method setShouldProcessDOMMutations
     * @summary Sets the flag to tell this object whether or not to process
     *     mutations to the source DOM it is managing.
     * @description Note that if shouldProcess is true and isSticky is false,
     *     this flag will be reset to false after a certain amount of time.
     *     This is due to the fact that mutations 'come in' asynchronously and
     *     so the flag never has a chance to reset to false otherwise, as
     *     setting to false cannot be done at the 'point of mutation' in the
     *     code..
     * @param {Boolean} shouldProcess Whether or not the receiver should process
     *     mutations to the source DOM of the currently displayed DOM in the UI
     *     canvas fails.
     * @param {Boolean} [isSticky=false] Whether or not this method should set
     *     up a timer to reset the flag to false after a period of time. The
     *     default is false, which means the method *will* set up a timer.
     * @param {Node} [fromNode] The node to monitor for DOM mutations. This
     *     defaults to the UICANVAS's document node.
     * @returns {TP.lama.IDE} The receiver.
     */

    var shouldProcessTimeout,

        node;

    //  It is currently true - clear any existing timeout and get ready to reset
    //  it.
    if (TP.isTrue(this.get('shouldProcessDOMMutations'))) {
        clearTimeout(this.get('$shouldProcessTimeout'));
        this.set('$shouldProcessTimeout', null);
    }

    //  If the flag was true and isSticky is not true, then set up a timeout
    //  that will reset the flag back after a certain amount of time (default to
    //  1000ms).
    if (shouldProcess) {

        if (TP.notTrue(isSticky)) {
            shouldProcessTimeout = setTimeout(
                function() {
                    this.$set('shouldProcessDOMMutations', false);
                }.bind(this),
                TP.sys.cfg('lama.mutation_track_clear_timeout', 1000));

            this.set('$shouldProcessTimeout', shouldProcessTimeout);
        }

        if (TP.notValid(fromNode)) {
            node = TP.sys.uidoc(true);
        } else {
            node = fromNode;
        }

        //  Make sure to refresh all of the descendant document positions for
        //  the UI canvas.
        TP.nodeRefreshDescendantDocumentPositions(node);
    } else {

        //  It was false - clear any existing timeout.
        clearTimeout(this.get('$shouldProcessTimeout'));
        this.set('$shouldProcessTimeout', null);
    }

    this.$set('shouldProcessDOMMutations', shouldProcess);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupAdjuster',
function() {

    /**
     * @method setupAdjuster
     * @summary Sets up the Lama's 'style adjuster' component. The Lama's
     *     style adjuster provides a GUI to adjust the current halo target's
     *     cascaded style.
     * @returns {TP.lama.IDE} The receiver.
     */

    var adjusterTPElem;

    adjusterTPElem = TP.tpelem(
        '<lama:adjuster id="LamaAdjuster" pclass:hidden="true"/>');

    this.getToolsLayer().addContent(adjusterTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupBuilderObserver',
function() {

    /**
     * @method setupBuilderObserver
     * @summary Sets up a managed Mutation Observer that handles insertions and
     *     deletions as GUI is built using various parts of the Lama.
     * @returns {TP.lama.IDE} The receiver.
     */

    var builderFilterFuncs,

        world,
        currentScreenTPWin;

    //  If we're testing, then just exit here.
    if (TP.sys.isTesting()) {
        return this;
    }

    //  Set up an Array that will collect filter functions for the builder's
    //  MutationSummary observer.
    builderFilterFuncs = TP.ac();
    this.$set('$builderMOFilterFuncs', builderFilterFuncs);

    //  Add a managed Mutation Observer filter Function that will filter all
    //  mutation records for when we're currently not configured to process
    //  current UI canvas DOM mutations.

    builderFilterFuncs.push(
        function(aMutationRecord) {
            return this.get('shouldProcessDOMMutations');
        }.bind(this));

    //  Add a managed Mutation Observer filter Function that will filter all
    //  mutation records for when we're testing:

    builderFilterFuncs.push(
        function(aMutationRecord) {
            //  The builder doesn't process MO events if we're testing.
            if (TP.sys.isTesting()) {
                return false;
            }
        });

    //  Add a managed Mutation Observer filter Function that will filter all
    //  mutation records for bind:in attribute mutations when the target element
    //  is a desugared text span. This is because this 'bind:in' was *generated*
    //  because of the desugaring and it won't be found in the source document.

    builderFilterFuncs.push(
        function(aMutationRecord) {
            if (aMutationRecord.type === 'attributes' &&
                aMutationRecord.attributeName === 'in' &&
                aMutationRecord.attributeNamespace === TP.w3.Xmlns.BIND &&
                TP.elementHasAttribute(aMutationRecord.target,
                                        'tibet:textbinding',
                                        true)) {
                return false;
            }
        });

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
    //      - Lama-related 'class' attributes
    //      - Lama-related other attributes

    builderFilterFuncs.push(
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
                        attrPrefix = TP.w3.Xmlns.getPrefixForNSURI(
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
                        //  contains 'lama-', we ignore it

                        if (TP.notEmpty(attrValue) &&
                            attrValue.contains('lama-')) {
                            return false;
                        }

                        if (TP.notEmpty(attrOldValue) &&
                            attrOldValue.contains('lama-')) {
                            return false;
                        }

                        break;

                    default:

                        //  If the attribute name starts with 'lama-', we
                        //  ignore it.
                        if (attrName.startsWith('lama-')) {
                            return false;
                        }

                        break;
                }
            }

            return true;
        });

    //  Add managed Mutation Observer filter Functions that will filter child
    //  tree mutation records for:
    //
    //      - generated elements

    builderFilterFuncs.push(
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

                        if (TP.elementHasAttribute(
                            elem, 'tibet:originalhref', true)) {
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

                        if (TP.elementHasAttribute(
                            elem, 'tibet:recasting', true)) {
                            return false;
                        }

                        if (TP.elementHasAttribute(
                            elem, 'tibet:originalhref', true)) {
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
        });

    builderFilterFuncs.push(
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

                        if (TP.elementHasAttribute(
                            elem, 'tibet:originalhref', true)) {
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

                        if (TP.elementHasAttribute(
                            elem, 'tibet:recasting', true)) {
                            return false;
                        }
                        if (TP.elementHasAttribute(
                            elem, 'tibet:originalhref', true)) {
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
        });

    //  Because the 'DocumentLoaded' handler that normally activates this
    //  managed mutation observer has already been executed when the UI canvas
    //  was first displayed, we need to activate the first time here.
    world = TP.byId('LamaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();

    //  Set up a Mutation Summary observer on the document. This will process
    //  changes made to the UI document and propagate them to the correct source
    //  document for saving.
    this.setupMutationSummaryOn(currentScreenTPWin.getNativeDocument());

    //  Grab the canvas document and observe mutation style change signals from
    //  it.
    this.observe(currentScreenTPWin.getDocument(),
                    'TP.sig.MutationStyleChange');

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupConnectors',
function() {

    /**
     * @method setupConnectors
     * @summary Sets up the Lama's 'connectors'.
     * @returns {TP.lama.IDE} The receiver.
     */

    var connectorCollectors;

    //  Build a hash of two 'connector collector' Functions that will be used to
    //  select elements that should be enabled for that particular connector
    //  type.
    connectorCollectors = TP.hc(
        'bindingsource',
            function(sourceTPElem) {
                var uiDoc,
                    elems;

                //  For binding sources, if the source element is not in the
                //  current UI canvas, then the context should be the UI canvas.
                uiDoc = TP.sys.uidoc();
                if (!uiDoc.contains(sourceTPElem)) {
                    elems = TP.byCSSPath('html|body *', uiDoc, false, false);
                } else {
                    elems = TP.byCSSPath('*', sourceTPElem, false, false);
                }

                return elems;
            },
        'signalsource',
            function(sourceTPElem) {

                var result,
                    uiDoc,
                    node;

                result = TP.ac();

                //  For signal sources, if the source element is not in the
                //  current UI canvas, then just return the empty Array.
                uiDoc = TP.sys.uidoc();
                if (!uiDoc.contains(sourceTPElem)) {
                    return result;
                }

                //  Iterate up from the source element to it's document element,
                //  collecting responders along the way.
                node = sourceTPElem.getNativeNode();
                while (TP.isElement(node)) {
                    if (!TP.nodeIsResponder(node)) {
                        node = node.parentNode;
                        continue;
                    }

                    result.push(node);

                    node = node.parentNode;
                }

                return result;
            }
    );

    this.set('connectorCollectors', connectorCollectors);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupConsole',
function() {

    /**
     * @method setupConsole
     * @summary Sets up the Lama's 'console' component. The Lama's console
     *     provides a command line interface to the underlying TIBET Shell
     *     (TSH).
     * @returns {TP.lama.IDE} The receiver.
     */

    var viewDoc,

        consoleOutputTPElem,
        consoleInputTPElem,

        lamaSouthDrawer,
        tshPanel,

        testAppender;

    viewDoc = this.get('vWin').document;

    //  We *must* set up the output first, since setting up the input will cause
    //  output to be logged.

    //  Create the <lama:consoleoutput> tag
    consoleOutputTPElem = TP.lama.consoleoutput.getResourceElement('template',
                            TP.ietf.mime.XHTML);

    consoleOutputTPElem = consoleOutputTPElem.clone();
    consoleOutputTPElem.compile();

    //  Set the console output's ID and add it to the 'center' div.
    consoleOutputTPElem.setAttribute('id', 'LamaConsoleOutput');

    consoleOutputTPElem = TP.byId('center', viewDoc).addContent(
                                                    consoleOutputTPElem);

    //  Now we can set up the input cell. It currently goes into the south
    //  drawer.

    consoleInputTPElem = TP.lama.console.getResourceElement('template',
                            TP.ietf.mime.XHTML);

    consoleInputTPElem = consoleInputTPElem.clone();
    consoleInputTPElem.compile();

    //  Grab the south drawer
    lamaSouthDrawer = TP.byCSSPath('#south > .drawer', viewDoc, true);

    //  Grab the panel that the TSH is supposed to go into
    tshPanel = TP.byPath(
        './xctrls:panelbox/xctrls:panel[./xctrls:value/. = "TSH"]' +
            '/xctrls:content',
        lamaSouthDrawer,
        true);

    //  Insert our input element into that panel.
    consoleInputTPElem = tshPanel.insertContent(consoleInputTPElem);

    //  Do further set up for the console input. Note that this will also do
    //  further set up for the console output that we attached above.
    consoleInputTPElem.setup();

    //  Set the initial output mode.
    consoleInputTPElem.setOutputDisplayMode(
                        TP.sys.cfg('lama.tdc.output_mode', 'one'));

    //  NB: The console observes the HUD when it's done loading it's editor,
    //  etc.

    //  Install log appenders that know how to render logging entries to the
    //  Lama for both the lib (TP) and the app (APP).

    TP.getDefaultLogger().addAppender(TP.log.LamaAppender.construct());
    APP.getDefaultLogger().addAppender(TP.log.LamaAppender.construct());

    //  Now, effectively replace the test logger's appenders with just ours.
    //  This makes sure that when tests are executed in the Lama that the
    //  output is placed into our console output.
    TP.getLogger(TP.TEST_LOG).clearAppenders();

    testAppender = TP.log.LamaTestAppender.construct();
    testAppender.setLayout(TP.log.LamaTestLogLayout.construct());
    TP.getLogger(TP.TEST_LOG).addAppender(testAppender);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupContextMenu',
function() {

    /**
     * @method setupContextMenu
     * @summary Sets up the Lama's 'context menu' component. The Lama's
     *     context menu provides a way to issue commands to the system via the
     *     'right button' click.
     * @returns {TP.lama.IDE} The receiver.
     */

    var viewDoc,
        hudTPElem,

        menuTypes,
        len,
        i,

        menuType,
        menuTPElem;

    viewDoc = this.get('vWin').document;
    hudTPElem = TP.byId('LamaHUD', this.get('vWin'));

    //  Add the stylesheet for the TP.xctrls.popup, if it's not there already.
    //  All context menus will use this and we might as well pre-populate it.
    TP.xctrls.popup.addStylesheetTo(viewDoc);

    //  Make a list of the all of the context menu types.
    menuTypes = TP.ac(
                    TP.lama.halocontextmenu,
                    TP.lama.hudcontextmenu
                    );

    //  Iterate over that list and set up the menu.
    len = menuTypes.getSize();
    for (i = 0; i < len; i++) {

        menuType = menuTypes.at(i);

        //  Add the stylesheet
        menuType.addStylesheetTo(viewDoc);

        //  Grab the template, clone it and add the raw content to the HUD
        //  element of the Lama.
        menuTPElem = menuType.getResourceElement(
                                'template', TP.ietf.mime.XHTML);
        menuTPElem = menuTPElem.clone();
        hudTPElem.addRawContent(menuTPElem);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupEditorOn',
function(aTargetNode) {

    /**
     * @method setupEditorOn
     * @summary Sets up an 'inline editor' on the supplied node. This inline
     *     editor allows editing of the supplied Node, if its a Text node, or
     *     the first child of the supplied Node, if it's an Element.
     * @param {Node} aNode The Node that the editor should be set up on.
     * @returns {TP.lama.IDE} The receiver.
     */

    var targetElem,
        textNode,

        fontVal,
        hiddenSpan,
        editor,

        sizeEditorToContent,
        removeEditorAndSetValue,

        initialContent,

        thisref,

        keydownHandler;

    //  If the target was a Text node, then we use its parent node.
    if (TP.isTextNode(aTargetNode)) {
        textNode = aTargetNode;
        targetElem = aTargetNode.parentNode;
    } else {
        textNode = aTargetNode.firstChild;
        targetElem = aTargetNode;
    }

    //  Set up a span that will provide a way to measure the width of the text
    //  in the inline editor.

    //  We need the target element's 'font' values for the most accurate width
    //  measurements.
    fontVal = TP.elementGetComputedStyleObj(targetElem).font;

    //  Construct the span. Note here how we can't set 'display: none' (even
    //  though we don't want this span to show to the user, because otherwise
    //  the CSS OM will always return a width of 0. Therefore, we 'show' it to
    //  the user, but set it's height to be 0 so that they can't actually see
    //  it..
    hiddenSpan = TP.documentConstructElement(
                    TP.nodeGetDocument(textNode),
                    'span',
                    TP.w3.Xmlns.XHTML);

    //  Set the span as TP.GENERATED so that the mutation system ignores it.
    hiddenSpan[TP.GENERATED] = true;
    TP.elementSetStyleString(
        hiddenSpan,
        'position: absolute;' +
        ' height: 0;' +
        ' overflow: hidden;' +
        ' white-space: pre;' +
        ' font: ' + fontVal + ';' +
        ' padding: 0;' +
        ' margin: 0');

    TP.nodeAppendChild(targetElem, hiddenSpan, false);

    //  Replace the text node with an editor and style it.
    editor = TP.nodeReplaceTextWithEditor(textNode);
    TP.elementSetStyleString(
        editor,
        ' border: solid 1px darkgray;' +
        ' outline: none !important;' +
        ' font: ' + fontVal + ';' +
        ' padding: 0;' +
        ' margin: 0');

    //  A Function that sizes the text content so that we can resize the editor
    //  to that width.
    sizeEditorToContent = function(content) {
        var width;

        TP.nodeSetTextContent(hiddenSpan, content);

        width = TP.elementGetWidth(hiddenSpan);
        (function() {
            TP.elementSetWidth(editor, width + 'px');
        }).queueBeforeNextRepaint(TP.nodeGetWindow(editor));
    };

    //  A Function that tears down the editor and sets the bound value.
    removeEditorAndSetValue = function() {

        var newText,
            newTextNode;

        //  Grab the value from the editor and create a new Text node from
        //  it.
        newText = editor.value;
        newTextNode = TP.nodeGetDocument(editor).createTextNode(newText);

        //  Detach our measuring span.
        TP.nodeDetach(hiddenSpan);

        //  Set the flag that will determine whether or not we're processing DOM
        //  mutations for the current UI DOM mutations. We need to update the
        //  text node here, so we need this.
        this.set('shouldProcessDOMMutations', true);

        //  Replace the editor with the newly generated text node
        TP.nodeReplaceChild(editor.parentNode,
                            newTextNode,
                            editor,
                            false);
    }.bind(this);

    //  Grab the initial content of the Text node and size the editor to it.
    initialContent = TP.nodeGetTextContent(textNode);
    sizeEditorToContent(initialContent);

    thisref = this;

    //  Set up a 'keydown' handler on the editor. Capture the Function so that
    //  we can use it later to remove it as a listener.
    editor.addEventListener(
        'keydown',
        keydownHandler = function(evt) {
            var keyName,

                startVal,
                endVal,
                val,

                direction,

                searchElem,
                searchTPElem,

                successorTN;

            keyName = TP.eventGetDOMSignalName(evt);

            //  If the character is a printable character or Backspace, then add
            //  or remove it from the editor's value. Note here how we splice
            //  any content preceding or coming after the selection, since we
            //  need that plus the character that is being inserted to compute
            //  the proper width.
            if (TP.core.Keyboard.getCurrentKeyboard().isPrintable(evt) ||
                keyName === 'DOM_Backspace_Down') {

                startVal = this.value.slice(0, this.selectionStart);
                endVal = this.value.slice(this.selectionEnd);

                val = startVal +
                        String.fromCharCode(TP.eventGetKeyCode(evt)) +
                        endVal;

                sizeEditorToContent(val);

                return;
            }

            if (keyName === 'DOM_Tab_Down' ||
                keyName === 'DOM_Shift_Tab_Down') {

                if (TP.wrap(evt).getShiftKey()) {
                    direction = TP.PREVIOUS;
                } else {
                    direction = TP.NEXT;
                }

                searchElem = targetElem;

                //  Search up from the target element, looking for an Element
                //  that will give us a non-null Text node value.
                while (TP.isElement(searchElem)) {
                    searchTPElem = TP.wrap(searchElem);
                    successorTN =
                        searchTPElem.lamaGetSuccessorEditableTextNode(
                                        direction,
                                        targetElem);

                    //  Found a text node - break here.
                    if (TP.isTextNode(successorTN)) {
                        break;
                    }

                    searchElem = searchElem.parentNode;
                }

                //  Remove the editor and set the value.
                removeEditorAndSetValue();

                //  Remove the keydown handler (which is where we're at) as a
                //  listener.
                this.removeEventListener('keydown', keydownHandler, false);

                //  If we successfully computed a successor text node (either
                //  forwards or backwards), then set up an editor on that.
                if (TP.isTextNode(successorTN)) {
                    thisref.setupEditorOn(successorTN);
                }

                return;
            }

            //  If the key isn't an Enter, then it was another non-printable,
            //  non-Tab character. In any case, we don't want it. and so we
            //  return here.
            if (keyName !== 'DOM_Enter_Down') {
                return;
            }

            //  Remove the editor and set the value.
            removeEditorAndSetValue();

            this.removeEventListener('keydown', keydownHandler, false);
        });

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupLamabar',
function() {

    /**
     * @method setupLamabar
     * @summary Sets up the Lama's 'Lamabar' component. The Lama's Lamabar
     *     provides a GUI to manipulate which tools are seen on screen.
     * @returns {TP.lama.IDE} The receiver.
     */

    var tileTPElem,
        lamabarTPElem;

    lamabarTPElem = TP.tpelem('<lama:lamabar id="Lamabar"/>');

    tileTPElem = this.makeTile('LamabarTile');

    tileTPElem.setContent(lamabarTPElem);

    tileTPElem.setAttribute('hidden', false);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupMutationSummaryOn',
function(aNode) {

    /**
     * @method setupMutationSummaryOn
     * @summary Sets up a MutationSummary object on the supplied node. This
     *     object services the builder functionality of the Lama to keep any
     *     source document(s) up-to-date as the user mutates the DOM visually.
     * @param {Node} aNode The Node that the MutationSummary object should be
     *     observing for DOM mutations.
     * @returns {TP.lama.IDE} The receiver.
     */

    var summaryConfig,
        mutationSummary,

        allFilterFuncs,
        activeFilterFuncs;

    //  Build a configuration POJO to create the MutationSummary with. Note here
    //  how we supply a bound Function that is our 'processSummaries' method and
    //  we ask for *all* mutation summaries (no CSS queries at this level -
    //  we're interested in everything).
    summaryConfig = {
        callback: this.processSummaries.bind(this),
        rootNode: aNode,
        queries: [
            {all: true}
        ]
    };

    //  Create a MutationSummary and store it away. The teardown method will
    //  need that reference to cause the current MutationSummary to disconnect.
    mutationSummary = new TP.extern.MutationSummary(summaryConfig);
    this.$set('$builderMutationSummary', mutationSummary);

    //  TIBET's 'managed mutation observer' infrastructure already has the
    //  facility for filter functions that will filter out MutationObserver
    //  records that we're not interested in processing. Unfortunately, the
    //  MutationSummary object doesn't have a similar facility for filtering
    //  these records before computing its summary from them. So we wire
    //  capability that in by 'hooking' the MutationSummary's 'createSummaries'
    //  method and filtering the records before invoking the MutationSummary's
    //  'old' createSummaries method.

    //  Obtain the filter Functions that we're interested in. The first set are
    //  the Functions registered to filter all MutationObserver records for any
    //  of TIBET's managed mutation observers. The second set is a list of
    //  builder-specific MutationObserver filter functions.
    allFilterFuncs = TP.$$mutationObserverRegistry.at('$ALL_FILTER_FUNCS');
    activeFilterFuncs = allFilterFuncs.concat(
                                this.$get('$builderMOFilterFuncs'));

    //  Hook the created MutationSummary's 'createSummaries' method and overlay
    //  it with our own version that filters the MutationObserver records before
    //  calling the old hooked method with those that remain after we ran our
    //  filter Functions.
    mutationSummary._oldCreateSummaries = mutationSummary.createSummaries;
    mutationSummary.createSummaries = function(mutations) {

        var filteredMutations;

        filteredMutations = mutations.filter(
            function(aRecord) {

                var len,
                    i;

                len = activeFilterFuncs.getSize();
                for (i = 0; i < len; i++) {
                    if (activeFilterFuncs.at(i)(aRecord) === false) {
                        return false;
                    }
                }

                return true;
            });

        //  Because the MutationSummary library does not handle namespaced
        //  attributes properly (i.e. when looking at an attribute name, it
        //  won't also consider the attributeNamespace, prepend the computed
        //  prefix onto it and then try to fetch the value), we build 'faux'
        //  MutationObserver records for any 'attributes' mutation and do that
        //  work ourselves. We then pass those in to the Mutation Summary
        //  library.
        filteredMutations = filteredMutations.collect(
            function(aRecord) {
                var fauxRecord,
                    prefix;

                //  If it was an 'attributes' mutation and had a real attributes
                //  namespace, then generate a faux record.
                if (aRecord.type === 'attributes' &&
                    TP.notEmpty(aRecord.attributeNamespace)) {

                    //  Look up the prefix for the given namespace from the
                    //  target element 'outward'..
                    prefix = aRecord.target.lookupPrefix(
                                    aRecord.attributeNamespace);

                    //  Generate the faux record, which will mostly be a shallow
                    //  copy of a Mutation Observer record, but with the 'full'
                    //  attribute name.
                    fauxRecord = {
                        addedNodes: aRecord.addedNodes,
                        attributeName: prefix + ':' + aRecord.attributeName,
                        attributeNamespace: aRecord.attributeNamespace,
                        nextSibling: aRecord.nextSibling,
                        oldValue: aRecord.oldValue,
                        previousSibling: aRecord.previousSibling,
                        removedNodes: aRecord.removedNodes,
                        target: aRecord.target,
                        type: aRecord.type
                    };

                    return fauxRecord;
                }

                return aRecord;
            });

        return this._oldCreateSummaries(filteredMutations);
    };

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupObservations',
function() {

    /**
     * @method setupObservations
     * @summary Sets up any 'IDE-wide' signal observations.
     * @returns {TP.lama.IDE} The receiver.
     */

    var world,
        currentScreenTPWin,

        currentCanvasDoc,
        rootDoc,
        docs,

        connector;

    //  Grab the Lama's 'world' element and get the currently viewed canvas
    //  document from it.
    world = TP.byId('LamaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();
    currentCanvasDoc = currentScreenTPWin.getDocument();

    //  Grab the UI root document.
    rootDoc = TP.sys.getUIRoot().getDocument();

    //  Put both the root and the current canvas document into an Array and
    //  configure that Array to be an origin set.
    docs = TP.ac(rootDoc, currentCanvasDoc);
    docs.isOriginSet(true);

    //  Observe both documents for DOMDragDown and DOMMouseDown in a *capturing*
    //  fashion (to avoid having issues with the standard platform's
    //  implementation of mouse/drag down - in this way, we can preventDefault()
    //  on these events before they get in the way).
    this.observe(
            docs,
            TP.ac('TP.sig.DOMDragDown',
                    'TP.sig.DOMMouseDown',
                    'TP.sig.DOMDblClick'),
            null,
            TP.CAPTURING);

    //  Observe just the canvas document for when connections are completed to
    //  destination elements *within* the UI canvas (or are cancelled). Panels
    //  in the HUD (which  are in the UI root document) will observe this
    //  method themselves for connections made *to* elements in them.
    this.observe(currentCanvasDoc, TP.ac(
                                    'TP.sig.LamaConnectCancelled',
                                    'TP.sig.LamaConnectCompleted',
                                    'TP.sig.LamaGroupingCompleted'));

    this.observe(currentCanvasDoc, 'TP.sig.DOMMouseWheel');

    //  Observe the Lama's connector itself for connection initiation and
    //  termination.
    connector = TP.byId('LamaConnector', this.get('vWin'));
    this.observe(connector,
                    TP.ac('TP.sig.LamaConnectInitiate',
                            'TP.sig.LamaConnectTerminate'));

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupHalo',
function() {

    /**
     * @method setupHalo
     * @summary Sets up the Lama's 'halo' component. The halo is the component
     *     that overlays elements in the GUI and controls which element is the
     *     current focus of manipulation activities.
     * @returns {TP.lama.IDE} The receiver.
     */

    var haloTPElem,
        toolsLayerTPElem;

    haloTPElem = TP.lama.halo.getResourceElement('template',
                            TP.ietf.mime.XHTML);

    haloTPElem = haloTPElem.clone();
    haloTPElem.compile();

    toolsLayerTPElem = this.getToolsLayer();
    toolsLayerTPElem.addContent(haloTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupHUD',
function() {

    /**
     * @method setupHUD
     * @summary Sets up the Lama's 'hud' component. The hud is the component
     *     that controls the drawers that encompass the user's application
     *     canvas. These drawers contain controls that the user uses to
     *     manipulate their applocation.
     * @returns {TP.lama.IDE} The receiver.
     */

    var hudTPElem;

    hudTPElem = TP.byId('LamaHUD', this.get('vWin'));
    hudTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupInspector',
function() {

    /**
     * @method setupInspector
     * @summary Sets up the Lama's 'inspector' component. The inspector is the
     *     component that allows a user to browse 'under the covers' using a
     *     multi-bay, hierarchical approach.
     * @returns {TP.lama.IDE} The receiver.
     */

    var inspectorTPElem;

    inspectorTPElem = TP.byId('LamaInspector', this.get('vWin'));
    inspectorTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupOutliner',
function() {

    /**
     * @method setupOutliner
     * @summary Sets up the Lama's 'outliner' component. The outliner is the
     *     component that allows a user to visualize and manipulate the
     *     underlying DOM structure of their application.
     * @returns {TP.lama.IDE} The receiver.
     */

    //  The outliner doesn't have a visual 'tag' representation, so we manually
    //  construct it. This will set its ID and register it so that it can be
    //  found.
    TP.lama.outliner.construct();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupTools',
function() {

    /**
     * @method setupTools
     * @summary Sets up the Lama's 'manipulator' components. These componest
     *     aid in visual editing of various properties of target elements -
     *     usually CSS properties.
     * @returns {TP.lama.IDE} The receiver.
     */

    var toolsLayerTPElem,
        toolTPElem;

    toolsLayerTPElem = this.getToolsLayer();

    //  Dimensioning tool

    toolTPElem = TP.lama.dimensionsManipulator.
                            getResourceElement('template', TP.ietf.mime.XHTML);

    toolTPElem = toolTPElem.clone();
    toolTPElem.compile();

    toolsLayerTPElem.addContent(toolTPElem);

    //  Positioning tool

    toolTPElem = TP.lama.positionManipulator.
                            getResourceElement('template', TP.ietf.mime.XHTML);

    toolTPElem = toolTPElem.clone();
    toolTPElem.compile();

    toolsLayerTPElem.addContent(toolTPElem);

    //  Gridding tool

    toolTPElem = TP.lama.gridManipulator.
                            getResourceElement('template', TP.ietf.mime.XHTML);

    toolTPElem = toolTPElem.clone();
    toolTPElem.compile();

    toolsLayerTPElem.addContent(toolTPElem);

    //  Grouping tool

    toolTPElem = TP.lama.groupingTool.
                            getResourceElement('template', TP.ietf.mime.XHTML);

    toolTPElem = toolTPElem.clone();
    toolTPElem.compile();

    toolsLayerTPElem.addContent(toolTPElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupWorkbench',
function() {

    /**
     * @method setupWorkbench
     * @summary Sets up the Lama's 'workbench' component. The workbench is the
     *     component that contains the inspector and its attendant toolbars.
     * @returns {TP.lama.IDE} The receiver.
     */

    var workbenchTPElem;

    workbenchTPElem = TP.byId('LamaWorkbench', this.get('vWin'));
    workbenchTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('setupWorld',
function() {

    /**
     * @method setupWorld
     * @summary Sets up the Lama's 'world' component. The world is the
     *     component that holds a collection of 'screens' used by the Lama to
     *     load different parts of the user's application GUI into and allows
     *     the author to easily switch between them.
     * @returns {TP.lama.IDE} The receiver.
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

    //  Create the <lama:world> tag
    worldElem = TP.documentConstructElement(viewDoc,
                                            'lama:world',
                                            TP.w3.Xmlns.LAMA);
    TP.elementSetAttribute(worldElem, 'id', 'LamaWorld', true);
    TP.elementSetAttribute(worldElem, 'mode', 'normal', true);

    //  Create the 'screen' holding div and append that to the <lama:world>
    //  tag
    screenHolderDiv = TP.documentConstructElement(viewDoc,
                                                    'div',
                                                    TP.w3.Xmlns.XHTML);
    screenHolderDiv = TP.nodeAppendChild(worldElem, screenHolderDiv, false);
    TP.elementAddClass(screenHolderDiv, 'screens');

    //  Create the 'screen info' holding div and append that to the
    //  <lama:world> tag.
    infoHolderDiv = TP.documentConstructElement(viewDoc,
                                                'div',
                                                TP.w3.Xmlns.XHTML);
    infoHolderDiv = TP.nodeAppendChild(worldElem, infoHolderDiv, false);
    TP.elementAddClass(infoHolderDiv, 'infos');

    //  Append the <lama:world> tag into the loaded Lama document.
    TP.xmlElementInsertContent(
            TP.byId('center', viewDoc, false),
            worldElem,
            TP.AFTER_BEGIN,
            null);

    //  Grab the 1...n 'prebuilt' iframes that are available in the Lama
    //  template. Create a <lama:screen> tag and wrap them in it and place
    //  that screen tag into the world. This will move the iframes out of the
    //  'content' div that originally held them and into the <lama:world>.
    uiScreenIFrames = TP.byCSSPath('.center iframe', viewDoc, false, false);
    uiScreenIFrames.forEach(
            function(anIFrameElem, index) {
                TP.lama.world.$buildScreenFromIFrame(
                        anIFrameElem,
                        index,
                        null,
                        screenHolderDiv,
                        infoHolderDiv);
            });

    //  Grab the <lama:world> tag and awaken it.
    worldTPElem = TP.byId('LamaWorld', viewDoc);
    worldTPElem.awaken();

    //  Get the number of actual iframes vs. the number of screens configured by
    //  the user as the desired number of iframes (defaulting to 1).
    numIFrames = uiScreenIFrames.getSize();
    configNumIFrames = TP.ifInvalid(1, TP.sys.cfg('lama.num_screens'));

    //  If there are not enough screens, according to the number configured by
    //  the user, create more.
    if (configNumIFrames > numIFrames) {

        for (i = 0; i < configNumIFrames - numIFrames; i++) {
            worldTPElem.createScreen('SCREEN_' + (i + numIFrames));
        }
    }

    //  Set both the first screen and it's info div to be the 'selected' one.
    screens = worldTPElem.get('screens');
    screens.first().setSelected(true);

    infos = worldTPElem.get('infos');
    infos.first().setSelected(true);

    //  Hide the 'content' div - it's empty now anyway.
    TP.elementHide(TP.byId('content', viewDoc, false));

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('showLoadingImage',
function(completionFunc) {

    /**
     * @method showLoadingImage
     * @summary Shows the Lama's 'loading' image and invokes the completionFunc,
     *     if supplied, when it is finished.
     * @param {Function} [completionFunc] The Function to call when the loading
     *     image finishes.
     * @returns {TP.lama.IDE} The receiver.
     */

    var win,

        contentElem,

        loadingImageLoc,
        loadingImageReq;

    win = this.get('vWin');

    //  Grab the existing 'content' element, which is now unused since the
    //  world element moved the screens out of it, and use it to show the
    //  'loading' element. The HUD will use it later for a 'tools layer'.
    contentElem = TP.byId('content', win, false);

    loadingImageLoc = TP.uc('~lib_media/tibet_logo.svg').getLocation();

    loadingImageReq = TP.request('uri', loadingImageLoc);
    loadingImageReq.defineHandler('IOCompleted',
        function(aSignal) {
            var loadingSVGElem,
                hookElem,
                animationFinishFunc;

            loadingSVGElem = aSignal.getResult().documentElement;

            //  After the drawers have finished animating in, delay,
            //  giving the animation a chance to finish cleanly before
            //  proceeding.
            hookElem = TP.byCSSPath('.right_hook', win, true, false);
            animationFinishFunc = function() {
                animationFinishFunc.ignore(hookElem, 'TP.sig.DOMAnimationEnd');
                //  Hide the Lama's busy message... getting ready for use.
                TP.elementHideBusyMessage(contentElem);
                if (TP.isCallable(completionFunc)) {
                    completionFunc();
                }
            };

            //  NB: Because we're bringing in the SVG elements without IDs, we
            //  need to make sure that the hook element has an ID before
            //  observing it.
            TP.lid(hookElem, true);

            animationFinishFunc.observe(hookElem, 'TP.sig.DOMAnimationEnd');

            (function() {

                //  Show the content element, only so that we can size its
                //  'busy' message layer properly.
                TP.elementShow(contentElem);
                TP.elementShowBusyMessage(
                            contentElem,
                            null,
                            loadingSVGElem);
                TP.elementHide(contentElem);

            }).queueBeforeNextRepaint(TP.nodeGetWindow(contentElem));
        });

    TP.httpGet(loadingImageLoc, loadingImageReq);

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('lamaSetupFullComplete',
function() {

    /**
     * @method lamaSetupFullComplete
     * @summary Completes the setting up of the Lama. This is called once all
     *     of the Lama's drawers have loaded with their content, have animated
     *     in and the logo is done animating.
     * @returns {TP.lama.IDE} The receiver.
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
    TP.byId('LamaConsole', viewWin).render();

    thisref = this;
    drawerElement = TP.byId('west', viewWin, false);

    hudCompletelyOpenFunc = function(aSignal) {

        //  Turn off any future notifications.
        hudCompletelyOpenFunc.ignore(
                                drawerElement, 'TP.sig.DOMTransitionEnd');

        //  After the drawers have finished animating in, delay until the next
        //  repaint, giving the animation a chance to finish cleanly before
        //  proceeding.
        (function() {
            TP.byId('LamaHUD', viewWin).toggle('closed');

            //  put our project identifier in place in the notifier bar
            TP.bySystemId('LamaConsoleService').notify(TP.sc(
                'Welcome to Lama&#8482; Shift-Right-Click in page to begin' +
                ' editing.'
                ));

            thisref.signal('LamaReady');
        }).queueAfterNextRepaint();
    };
    hudCompletelyOpenFunc.observe(drawerElement, 'TP.sig.DOMTransitionEnd');

    //  Toggle the east and west drawers to their 'maximum open' state.
    TP.byCSSPath('#west lama|opener', viewWin).at(0).signal('UIToggle');
    TP.byCSSPath('#east lama|opener', viewWin).at(0).signal('UIToggle');

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('lamaSetupMinimalComplete',
function() {

    /**
     * @method lamaSetupMinimalComplete
     * @summary Completes the setting up of the Lama when in 'minimal' mode.
     * @returns {TP.lama.IDE} The receiver.
     */

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('styleLocationIsMutable',
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

TP.lama.IDE.Inst.defineMethod('teardownCurrentMutationSummary',
function() {

    /**
     * @method teardownCurrentMutationSummary
     * @summary Disconnects the currently active MutationSummary object
     *     servicing the builder functionality from the piece of DOM that it is
     *     observing and providing summaries for.
     * @returns {TP.lama.IDE} The receiver.
     */

    var builderMutationSummary;

    builderMutationSummary = this.$get('$builderMutationSummary');

    //  Only disconnect if we're still connected. If TIBET is being reloaded,
    //  this will not be the case and the MutationSummary machinery will already
    //  have been disconnected.
    if (builderMutationSummary.connected) {
        builderMutationSummary.disconnect();
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('toggle',
function() {

    /**
     * @method toggle
     * @summary Toggles the Lama's HUD open and closed.
     * @returns {TP.lama.IDE} The receiver.
     */

    var mode;

    mode = TP.sys.cfg('lama.mode');

    //  For now, we only run the Lama on Chrome
    if (!TP.sys.isUA('chrome')) {
        TP.alert(
            'The TIBET Lama technology preview is not supported on this' +
            ' platform.<br/>' +
            'Please use Google Chrome.<br/>' +
            'More information can be found here:<br/>' +
            'www.technicalpursuit.com/docs/faq.html#platforms');

        return this;
    }

    //  If the Lama's setup is complete, then we just toggle the HUD and exit.
    if (this.get('setupComplete')) {
        if (mode === 'full') {
            //  Hide the HUD
            TP.byId('LamaHUD', this.get('vWin')).toggle('closed');
        } else {
            //  Hide the Lamabar
            TP.byId('LamabarTile', this.get('vWin')).toggle('hidden');
        }

        return this;
    }

    //  Otherwise, execute the setup process.
    if (mode === 'full') {
        this.setupFull();
    } else {
        this.setupMinimal();
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.IDE.Inst.defineMethod('updateUICanvasSource',
function(mutatedNodes, mutationAncestor, operation, attributeName,
         attributeValue, oldAttributeValue, shouldSignal, replacementNode) {

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
     * @param {Node} [replacementNode] The replacement node if we're replacing a
     *     single node with another node. In this case, mutatedNodes will
     *     contain a single node, which will be the one we're replacing.
     * @returns {TP.lama.IDE} The receiver.
     */

    var isAttrChange,

        visualAppElem,
        visualRootElem,

        appDescendantsToProcess,

        visualGeneratorElem,
        visualGeneratorTPElem,

        visualSourceSearchElem,

        visualSourceDocument,
        visualGeneratorDocument,

        sourceLoc,
        sourceURI,

        sourceNode,

        computePositionDiff,

        sourceMatchingNodes,

        visualMutatedNode,

        wasTextBinding,

        visualAddressParts,

        visualMutationTestNode,
        visualMutationTestTPElem,
        allowMutations,

        leni,
        i,

        visualAfterAddresses,

        templateTestNode,
        len,
        testAddressParts,

        lenj,
        j,

        address,

        sourceTestNextSibling,

        sourceInsertionParent,
        sourceCurrentNode,

        sourceTestNode,
        wrappedTestNode,

        result,

        mutationAncestorTPElem,
        bindInfo,
        bindExprStr,

        newSourceNode,

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

    visualAppElem = TP.unwrap(this.getAppElement());

    //  If there was no visual app element, then we'll just the first mutated
    //  node's document documentElement.
    if (TP.notValid(visualAppElem)) {
        visualRootElem = TP.nodeGetDocument(mutatedNodes.first()).
                                                        documentElement;
        visualRootElem[TP.PREVIOUS_POSITION] =
            TP.nodeGetDocumentPosition(visualRootElem);
    } else {
        visualRootElem = visualAppElem;
    }

    //  If the operation is not TP.DELETE, then we can be a little more
    //  efficient by filtering mutations by filtering out any nodes that mutated
    //  that are not under the visual app element. Note that we cannot do this
    //  for deleted nodes, since they're no longer part of the hierarchy and
    //  this mechanism will always result in an empty Array.
    if (operation !== TP.DELETE || isAttrChange) {
        appDescendantsToProcess = mutatedNodes.filter(
            function(anElem) {
                return visualRootElem.contains(anElem);
            });
    } else {
        appDescendantsToProcess = mutatedNodes;
    }

    //  If there are no mutated nodes to process, then exit here. Otherwise,
    //  logic below will fail.
    if (TP.isEmpty(appDescendantsToProcess)) {
        return this;
    }

    //  Search the hierarchy for the nearest custom tag (using the same search
    //  criteria as above) to set as the 'visual generator' element.
    visualGeneratorElem = mutationAncestor;

    while (TP.isElement(visualGeneratorElem) &&
            visualGeneratorElem !== visualRootElem) {
        visualGeneratorTPElem = TP.wrap(visualGeneratorElem);
        if (visualGeneratorTPElem.lamaShouldAlterTemplate()) {
            break;
        }

        visualGeneratorElem = visualGeneratorElem.parentNode;
    }

    //  We need to make sure to have positions for the visual generator element
    //  and the mutated nodes
    if (TP.notValid(visualGeneratorElem[TP.PREVIOUS_POSITION])) {
        return this.raise(
                    'InvalidObject',
                    'Visual generator node needs node position');
    }

    leni = appDescendantsToProcess.getSize();
    for (i = 0; i < leni; i++) {
        if (TP.notValid(visualGeneratorElem[TP.PREVIOUS_POSITION])) {
            return this.raise(
                    'InvalidObject',
                    'Mutated node at: ' + i + ' needs node position');
        }
    }

    //  If the target Node is detached (or its not an Element), that means it
    //  must be being deleted from the visible DOM. By the time this method is
    //  called, because of the way MutationObservers work, its parentNode will
    //  be set to null and we have to use a more complex mechanism to get it's
    //  position in the DOM.
    if (TP.nodeIsDetached(appDescendantsToProcess.first()) ||
        !TP.isElement(appDescendantsToProcess.first())) {
        visualSourceSearchElem = mutationAncestor;
    } else {
        visualSourceSearchElem = appDescendantsToProcess.first();
    }

    //  If no tag source element could be computed, that means we're going to
    //  use the whole document as the source.
    if (!TP.isElement(visualGeneratorElem)) {
        visualSourceDocument = TP.nodeGetDocument(visualSourceSearchElem);
        sourceLoc = visualSourceDocument[TP.SRC_LOCATION];
        if (TP.isDocument(visualGeneratorElem)) {
            visualGeneratorElem[TP.PREVIOUS_POSITION] = '';
        }
    } else {
        visualGeneratorTPElem = TP.wrap(visualGeneratorElem);

        if (TP.isKindOf(visualGeneratorTPElem, TP.tag.TemplatedTag)) {
            //  Otherwise, grab the computed resource URI for the 'template' of
            //  the tag source element.
            sourceLoc = TP.wrap(visualGeneratorElem).
                        getType().
                        computeResourceURI('template');
        } else {
            visualGeneratorDocument = TP.nodeGetDocument(visualGeneratorElem);
            sourceLoc = visualGeneratorDocument[TP.SRC_LOCATION];
        }
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

    computePositionDiff = function(nodeA, nodeB) {

        var posAParts,
            posBParts,

            posALen,
            posBLen,

            ndx,

            retParts;

        if (TP.notValid(nodeA[TP.PREVIOUS_POSITION])) {
            //  TODO: Raise an exception.
            return TP.ac();
        }
        if (TP.notValid(nodeB[TP.PREVIOUS_POSITION])) {
            //  TODO: Raise an exception.
            return TP.ac();
        }

        posAParts = nodeA[TP.PREVIOUS_POSITION].split('.');
        posBParts = nodeB[TP.PREVIOUS_POSITION].split('.');

        posALen = posAParts.getSize();
        posBLen = posBParts.getSize();

        if (posALen === posBLen) {
            return TP.ac();
        }

        for (ndx = 0; ndx < posBLen; ndx++) {
            if (posAParts.at(ndx) !== posBParts.at(ndx)) {
                retParts = posBParts.slice(ndx);
                break;
            }
        }

        return retParts;
    };

    sourceMatchingNodes = TP.ac();

    leni = appDescendantsToProcess.getSize();
    for (i = 0; i < leni; i++) {

        visualMutatedNode = appDescendantsToProcess.at(i);

        if (TP.isElement(visualMutatedNode)) {
            //  If the mutated node is an *Element* and has a
            //  'tibet:textbinding' attribute on it, that means that it was
            //  created by the mechanism that looks for ACP expressions in
            //  markup and creates a 'span' to wrap them.
            wasTextBinding =
                TP.elementHasAttribute(
                    visualMutatedNode, 'tibet:textbinding');
        } else {
            wasTextBinding = false;
        }

        /* eslint-disable no-extra-parens */
        if (TP.nodeIsDetached(visualMutatedNode) ||
            (operation === TP.DELETE &&
                TP.notEmpty(visualMutatedNode[TP.PREVIOUS_POSITION]))) {
        /* eslint-enable no-extra-parens */

            //  Compute the difference in addresses between the visual generator
            //  element and the node that was mutated.
            visualAddressParts = computePositionDiff(visualGeneratorElem,
                                                        visualMutatedNode);

            //  Now, iterate 'down' from the visual generator element and test
            //  for ACP template expr 'span' elements that were inserted. We
            //  want to skip those addresses, so we build a new set of addresses
            //  and use those moving forward.
            templateTestNode = visualGeneratorElem;
            len = visualAddressParts.getSize();
            testAddressParts = TP.ac();

            for (i = 0; i < len; i++) {
                if (TP.isElement(templateTestNode) &&
                    TP.name(templateTestNode) === 'tibet:acp') {
                    //  empty
                } else {
                    testAddressParts.push(visualAddressParts.at(i));
                }

                templateTestNode = templateTestNode.childNodes[
                                                    visualAddressParts.at(i)];
            }

            //  Reset our visual address parts to whatever we computed.
            visualAddressParts = testAddressParts;

            //  If visualMutatedNode was a Text node that was a desugared text
            //  binding, then we normalize the visualMutatedElem (which will be
            //  the parent Element node) and grab it's address to use to find
            //  the source DOM's corresponding Text node.
            if (wasTextBinding) {
                //  Because the last address will be the generated span that
                //  TIBET generated for this desugared text binding, and we're
                //  going to be removing the originally-authored text node from
                //  the source document, we need to pop one address off,
                //  basically ignoring the span.
                //  The set of addresses will now address the element that was
                //  the element that the expression was originally placed into.
                visualAddressParts.pop();
            }
        } else {
            //  Compute the difference in addresses between the visual generator
            //  element and the node that was mutated.
            visualAddressParts = computePositionDiff(visualGeneratorElem,
                                                        visualMutatedNode);

            if (TP.notEmpty(visualAddressParts)) {
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
                    visualAddressParts.pop();
                    visualAddressParts.pop();
                }
            } else {
                visualAddressParts = TP.ac();
            }
        }

        //  It's ok if the source node is a Document since addresses take into
        //  account the index from the #document into the root Element.

        sourceInsertionParent = sourceNode;

        sourceCurrentNode = sourceNode;

        //  Loop over all of the addresses and traverse the source DOM using
        //  those addresses until we find the target of the mutations.
        lenj = visualAddressParts.getSize();
        for (j = 0; j < lenj; j++) {

            address = visualAddressParts.at(j);
            visualAfterAddresses = visualAddressParts.slice(j + 1);

            if (!TP.isNode(sourceCurrentNode)) {
                //  TODO: Raise an exception.
                return this;
            }

            //  If we're at the last address, that means we've reached our
            //  'destination' node.
            if (j === lenj - 1) {

                sourceInsertionParent = sourceCurrentNode;

                //  Iterate from the destination node and track whether any of
                //  its ancestors (up until the visual generator element) will
                //  disallow mutations.

                //  We initially set this flag to true and allow a negative
                //  result from one of the ancestors set it to false.
                allowMutations = true;

                visualMutationTestNode = visualMutatedNode.parentNode;

                //  Note here how we make sure we don't go 'above' the visual
                //  generator element.
                while (TP.isElement(visualMutationTestNode) &&
                        visualMutationTestNode !== visualGeneratorElem) {
                    visualMutationTestTPElem = TP.wrap(visualMutationTestNode);
                    if (!visualMutationTestTPElem.
                        lamaAllowDescendantMutations(
                                operation,
                                address,
                                visualAfterAddresses,
                                visualAddressParts,
                                attributeName,
                                attributeValue,
                                oldAttributeValue)) {

                        allowMutations = false;

                        //  If one of the ancestors isn't going to allow the
                        //  mutation, then we might as well break.
                        break;
                    }

                    visualMutationTestNode = visualMutationTestNode.parentNode;
                }

                //  One of the ancestors didn't allow the mutation - set the
                //  result to TP.CONTINUE to pass this node over and break from
                //  the outer loop.
                if (!allowMutations) {
                    result = TP.CONTINUE;
                    break;
                }

                //  If we're not currently processing an attribute change, then
                //  set the current node based on whether we're doing a pure
                //  append or not.
                if (!isAttrChange) {
                    sourceTestNode = sourceCurrentNode.childNodes[address];

                    //  If there isn't a Node (even a Text node) at the final
                    //  address, then we're doing a pure append (in the case of
                    //  the operation being a TP.CREATE). Therefore, we set
                    //  sourceCurrentNode (our insertion point) to null.
                    if (!TP.isNode(sourceTestNode)) {
                        sourceCurrentNode = null;
                    } else {

                        //  If the test node is a Text node containing only
                        //  whitespace and we're not actually mutating a Text
                        //  node (i.e. setting it), then we skip it and move on
                        //  to the next node.
                        if (TP.isWhitespaceTextNode(sourceTestNode) &&
                            !TP.isTextNode(visualMutatedNode)) {
                            address = parseInt(address, 10);
                            sourceTestNextSibling =
                                    sourceCurrentNode.childNodes[address + 1];

                            if (TP.isNode(sourceTestNextSibling)) {
                                sourceTestNode = sourceTestNextSibling;
                            }
                        }

                        //  Otherwise, set the sourceCurrentNode (used as the
                        //  insertion point in a TP.CREATE) to the childNode at
                        //  the last address.
                        wrappedTestNode = TP.wrap(sourceTestNode);

                        result = wrappedTestNode.
                                    lamaGetNodeForVisualDOMChange(
                                        visualMutatedNode,
                                        operation,
                                        address,
                                        visualAfterAddresses,
                                        visualAddressParts,
                                        attributeName,
                                        attributeValue,
                                        oldAttributeValue);

                        //  If the result is TP.CONTINUE, then the receiving
                        //  node does not want to be modified (or have
                        //  modifications performed under it), so we skip over
                        //  it.
                        if (result === TP.CONTINUE) {
                            break;
                        }

                        sourceCurrentNode = result;
                    }

                    break;
                }
            }

            //  Grab the child of the current node and use it to test to figure
            //  out where to move next.
            sourceTestNode = sourceCurrentNode.childNodes[address];

            //  If we got a valid test node, then wrap it and query it for the
            //  node to modify for a visual change.
            if (TP.isNode(sourceTestNode)) {
                wrappedTestNode = TP.wrap(sourceTestNode);

                result = wrappedTestNode.lamaGetNodeForVisualDOMChange(
                                visualMutatedNode,
                                operation,
                                address,
                                visualAfterAddresses,
                                visualAddressParts,
                                attributeName,
                                attributeValue,
                                oldAttributeValue);

                //  If the result is TP.CONTINUE, then the receiving node does
                //  not want to be modified (or have modifications performed
                //  under it), so we skip over it.
                if (result === TP.CONTINUE) {
                    break;
                }

                //  Otherwise, reset the node we'll use from here to the result
                //  that was returned.
                sourceTestNode = result;
            }

            //  If the test node is a Text node containing only whitespace and
            //  we're not actually mutating a Text node (i.e. setting it), then
            //  we skip it and move on to the next node.
            if (TP.isWhitespaceTextNode(sourceTestNode) &&
                !TP.isTextNode(visualMutatedNode)) {
                address = parseInt(address, 10);
                sourceCurrentNode = sourceCurrentNode.childNodes[address + 1];
            } else {
                sourceCurrentNode = sourceTestNode;
            }
        }

        if (result === TP.CONTINUE) {
            result = null;
            continue;
        }

        if (isAttrChange && TP.notValid(sourceCurrentNode)) {
            continue;
        }

        //  NB: This might push 'null'... and for non-attribute TP.CREATE
        //  operations, "that's ok" (since it will basically become an 'append'
        //  below).
        sourceMatchingNodes.push(sourceCurrentNode);
    }

    if (TP.isEmpty(sourceMatchingNodes)) {

        //  TODO: Raise an exception.
        return this;
    }

    //  If we're changing the attribute, but don't have at last one element to
    //  change it on, then raise an exception and exit
    if (isAttrChange && TP.isEmpty(sourceMatchingNodes)) {

        //  TODO: Raise an exception.
        return this;
    }

    shouldMarkDirty = false;

    leni = sourceMatchingNodes.getSize();
    for (i = 0; i < leni; i++) {

        sourceCurrentNode = sourceMatchingNodes.at(i);

        if (isAttrChange && TP.isTextNode(sourceCurrentNode)) {
            continue;
        }

        if (operation === TP.CREATE) {

            if (isAttrChange) {
                TP.elementSetAttribute(sourceCurrentNode,
                                        attributeName,
                                        attributeValue,
                                        true);
                shouldMarkDirty = true;
            } else {

                visualMutatedNode = appDescendantsToProcess.at(i);

                if (TP.isElement(visualMutatedNode)) {
                    //  If the mutated node is an *Element* and has a
                    //  'tibet:textbinding' attribute on it, that means that it
                    //  was created by the mechanism that looks for ACP
                    //  expressions in markup and creates a 'span' to wrap them.
                    wasTextBinding =
                        TP.elementHasAttribute(
                            visualMutatedNode, 'tibet:textbinding');
                } else {
                    wasTextBinding = false;
                }

                //  If this was a Text node representing a desugared text
                //  binding then we have to update the text expression by using
                //  the first data expression found in the updating ancestor's
                //  (to the Text node) binding information.
                if (wasTextBinding) {

                    mutationAncestorTPElem = TP.wrap(mutationAncestor);
                    bindInfo = mutationAncestorTPElem.getBindingInfoFrom(
                            'bind:in',
                            mutationAncestorTPElem.getAttribute('bind:in'));

                    bindExprStr = bindInfo.at('value').at('fullExpr');

                    //  Create a new text node and append it to the current node
                    //  in the source DOM (the ancestor of the Text node there)
                    //  that contains the binding expression. Note that the Text
                    //  node containing the old binding expression will have
                    //  already been removed by a prior mutation.
                    TP.nodeAppendChild(
                        sourceCurrentNode,
                        TP.nodeGetDocument(sourceCurrentNode).createTextNode(
                                                                bindExprStr),
                        false);

                    shouldMarkDirty = true;
                } else {

                    //  Clone the node
                    newSourceNode = TP.nodeCloneNode(
                                        visualMutatedNode, true, false);

                    if (TP.isElement(newSourceNode)) {

                        //  'Clean' the Element of any runtime constructs put
                        //  there by TIBET.
                        TP.elementClean(newSourceNode);

                        TP.nodeInsertBefore(sourceInsertionParent,
                                            newSourceNode,
                                            sourceCurrentNode,
                                            false);
                    } else if (TP.isTextNode(newSourceNode)) {

                        //  It's just a Text node - we use it and it's contents
                        //  literally.
                        TP.nodeAppendChild(sourceInsertionParent,
                                            newSourceNode,
                                            false);
                    }

                    shouldMarkDirty = true;
                }
            }
        } else if (operation === TP.DELETE) {

            if (isAttrChange) {
                TP.elementRemoveAttribute(
                            sourceCurrentNode, attributeName, true);
                shouldMarkDirty = true;
            } else {
                if (wasTextBinding) {
                    //  NB: sourceCurrentNode is the ancestor Element that is
                    //  holding the text node that represents the sugared
                    //  binding expression.
                    TP.nodeDetach(sourceCurrentNode.firstChild);
                    shouldMarkDirty = true;
                } else {
                    TP.nodeDetach(sourceCurrentNode);
                    shouldMarkDirty = true;
                }
            }

        } else if (operation === TP.UPDATE) {

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
                    TP.elementSetAttribute(sourceCurrentNode,
                                            attributeName,
                                            attributeValue,
                                            true);
                    shouldMarkDirty = true;
                }
            } else {

                //  Clone the node
                newSourceNode = TP.nodeCloneNode(replacementNode, true, false);

                if (TP.isElement(newSourceNode)) {

                    //  'Clean' the Element of any runtime constructs put there
                    //  by TIBET.
                    TP.elementClean(newSourceNode);

                    //  Only replace the node and mark for dirty if the two
                    //  nodes aren't equal.
                    if (!TP.nodeEqualsNode(sourceCurrentNode, newSourceNode)) {
                        TP.nodeReplaceChild(sourceCurrentNode.parentNode,
                                            newSourceNode,
                                            sourceCurrentNode,
                                            false);

                        shouldMarkDirty = true;
                    }
                } else if (TP.isTextNode(newSourceNode)) {

                    //  It's just a Text node - we use it and it's contents
                    //  literally.

                    //  Only replace the node and mark for dirty if the two
                    //  nodes aren't equal.
                    if (!TP.nodeEqualsNode(sourceCurrentNode, newSourceNode)) {
                        TP.nodeReplaceChild(sourceCurrentNode.parentNode,
                                            newSourceNode,
                                            sourceCurrentNode,
                                            false);

                        shouldMarkDirty = true;
                    }
                }
            }
        }
    }

    if (shouldMarkDirty) {
        wasDirty = sourceURI.isDirty();

        //  Set the resource of the sourceURI back to the updated source node.
        //  Note here how we force the 'isDirty' flag to true. Otherwise, there
        //  will be a lot of flailing as the source DOM is modified. We always
        //  consider the URI to be dirty from here on out until the user saves
        //  it.
        sourceURI.setResource(sourceNode,
                                TP.request('signalChange', false,
                                            'isDirty', true));

        //  Lastly, because of the way that the dirtying machinery works, we
        //  need to separately signal the dirty each time (except the first
        //  time, because the setResource() call above will do that). This is
        //  because 2nd and subsequent times, when the dirty flag is true, it
        //  won't send the notification again. We need observers of 'dirty' to
        //  keep getting notifications.
        if (wasDirty) {
            TP.$changed.call(
                sourceURI,
                'dirty',
                TP.UPDATE,
                TP.hc(TP.OLDVAL, true, TP.NEWVAL, true));
        }
    }

    return this;
});

//  ============================================================================
//  Lama-specific TP.sig.Signal subtypes
//  ============================================================================

//  Lama signals
TP.sig.Signal.defineSubtype('LamaSignal');

TP.sig.LamaSignal.Type.isControllerSignal(true);
TP.sig.LamaSignal.isControllerRoot(true);

TP.sig.LamaSignal.defineSubtype('ToggleLama');

TP.sig.LamaSignal.defineSubtype('LamaReady');

//  Console input signals
TP.sig.LamaSignal.defineSubtype('ConsoleInput');

//  Console processing signals
TP.sig.ResponderSignal.defineSubtype('ConsoleCommand');
TP.sig.ResponderSignal.defineSubtype('RemoteConsoleCommand');

TP.sig.ResponderSignal.defineSubtype('AssistObject');
TP.sig.ResponderSignal.defineSubtype('EditObject');
TP.sig.ResponderSignal.defineSubtype('InspectObject');

TP.sig.ResponderSignal.defineSubtype('RemoveConsoleTab');

//  Keyboard handling signals
TP.sig.LamaSignal.defineSubtype('EndAutocompleteMode');
TP.sig.LamaSignal.defineSubtype('EndSearchMode');

//  Tile signals
TP.sig.LamaSignal.defineSubtype('TileDidOpen');
TP.sig.LamaSignal.defineSubtype('TileWillDetach');

//  Halo Signals
TP.sig.LamaSignal.defineSubtype('HaloDidBlur');
TP.sig.LamaSignal.defineSubtype('HaloDidFocus');

//  Inspector Signals
TP.sig.LamaSignal.defineSubtype('NavigateInspector');

TP.sig.LamaSignal.defineSubtype('InspectorDidFocus');

TP.sig.ResponderSignal.defineSubtype('FocusInspectorForBrowsing');
TP.sig.ResponderSignal.defineSubtype('FocusInspectorForEditing');

//  Breadcrumb Signals
TP.sig.LamaSignal.defineSubtype('BreadcrumbSelected');

//  Screen Signals
TP.sig.LamaSignal.defineSubtype('ToggleScreen');
TP.sig.LamaSignal.defineSubtype('FocusScreen');

TP.sig.LamaSignal.defineSubtype('ScreenWillToggle');
TP.sig.LamaSignal.defineSubtype('ScreenDidToggle');

//  GUI Signals
TP.sig.ResponderSignal.defineSubtype('LamaHaloToggle');
TP.sig.ResponderSignal.defineSubtype('LamaOutlinerToggle');

//  Lama canvas signals
TP.sig.LamaSignal.defineSubtype('CanvasChanged');

//  Tools layer signals
TP.sig.LamaSignal.defineSubtype('CloseActiveTool');

//  Grouping tool signals
TP.sig.LamaSignal.defineSubtype('LamaGroupingCompleted');

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
