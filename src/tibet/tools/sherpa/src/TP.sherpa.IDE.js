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

    elem = TP.byId('SherpaHUD', TP.sys.getUIRoot());
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

//  A hash of Functions (keyed by 'connection vend type') that 'collect'
//  elements that should have that vend type added to their 'connection accept
//  type' dynamically when a connector session starts and removed when it ends.
TP.sherpa.IDE.Inst.defineAttribute('connectorCollectors');

//  A target element that would have had a 'tibet:nodragtrapping' attribute on
//  it when the connector session started, but needed to be removed to make the
//  DOMDrag* signals for connectors work. This needs to be tracked and put back
//  when the connector session has ended.
TP.sherpa.IDE.Inst.defineAttribute('$nodragtrapTarget');

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

    //  NOTE: DO NOT change this reference to TP.sys.getUIROOT(). This gets
    //  executed too early in the startup process.
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

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('activateTool',
function(toolID) {

    /**
     * @method activateTool
     * @summary Activates the tool with the supplied ID. This will suppress the
     *     halo from being the primary visual tool.
     * @param {String} toolID The ID of the tool to activate.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var haloTPElem,

        stripTPElem,
        toolTPElem;

    //  Hide the halo.
    haloTPElem = TP.byId('SherpaHalo', TP.sys.getUIRoot());
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

TP.sherpa.IDE.Inst.defineMethod('asJSONSource',
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

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('deactivateTool',
function(toolID) {

    /**
     * @method deactivateTool
     * @summary Deactivates the tool with the supplied ID. This will restore the
     *     halo to be the primary visual tool.
     * @param {String} toolID The ID of the tool to deactivate.
     * @returns {TP.sherpa.IDE} The receiver.
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
    haloTPElem = TP.byId('SherpaHalo', TP.sys.getUIRoot());
    haloTPElem.setAttribute('hidden', false);

    return this;
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
    worldTPElem.observe(TP.byId('SherpaHUD', viewDoc), 'PclassClosedChange');

    //  Set up any signal observations for Sherpa-wide handling.
    this.setupObservations();

    //  Set up the console
    this.setupConsole();

    //  Set up the context menu
    this.setupContextMenu();

    //  Set up the halo
    this.setupHalo();

    //  NB: We set these up *after* the halo is set up.

    //  Set up the manipulators
    this.setupManipulators();

    //  Set up the outliner
    this.setupOutliner();

    //  Set up the workbench
    this.setupWorkbench();

    //  Set up the inspector
    this.setupInspector();

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
            consoleService,

            hudElem,
            contentElem,

            stripElem;

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

        hudElem = TP.byId('SherpaHUD', viewDoc, false);
        contentElem = TP.byId('content', viewDoc, false);

        //  Now that we have a valid HUD element, move the 'content' element
        //  from being under the 'center' element to being under the HUD
        //  element.
        TP.nodeAppendChild(hudElem, contentElem, false);

        //  Now that the content element has been moved and is available to be
        //  the tools layer, set up the property adjuster
        thisref.setupAdjuster();

        //  Insert the 'tools closer' content as a sibling of the content (now
        //  tools) element and *before* it.
        stripElem = TP.xhtmlnode(
            '<div class="cssToolButtonStrip" pclass:hidden="true">' +
                '<div class="toolButton closeButton" on:click="CloseActiveTool"/>' +
            '</div>');
        TP.nodeInsertContent(contentElem, stripElem, TP.BEFORE_BEGIN);

        thisref.set('setupComplete', true);

        //  If a finalization Function was supplied, execute it.
        if (TP.isCallable(finalizationFunc)) {
            finalizationFunc();
        }

    }, TP.sys.cfg('sherpa.setup.delay', 250));

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('focusInputCell',
function(aTimeout, aCallback) {

    /**
     * @method focusInputCell
     * @summary Focuses the Sherpa's TDC input cell after a delay.
     * @param {Number} [aTimeout=250] The number of milliseconds to wait before
     *     trying to focus the TDC input cell.
     * @param {Function} [aCallback] An optional callback function that will be
     *     called back after the cell is focused.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var timeout;

    timeout = TP.ifInvalid(aTimeout, 250);

    //  Focus and set the cursor to the end of the Sherpa's input cell after a
    //  timeout (defaults to 250ms).
    setTimeout(
        function() {
            var consoleGUI;

            consoleGUI =
                TP.bySystemId('SherpaConsoleService').get('$consoleGUI');

            consoleGUI.focusInput();
            consoleGUI.setInputCursorToEnd();

            if (TP.isCallable(aCallback)) {
                aCallback();
            }
        }, timeout);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('getOrMakeModifiableRule',
function(aTargetTPElement) {

    /**
     * @method getOrMakeModifiableRule
     * @summary Using the supplied element, this method returns or constructs a
     *     CSS rule that will apply uniquely to the supplied element.
     * @param {TP.dom.ElementNode} aTargetTPElement The element to use to
     *     compute a CSS rule that will match.
     * @returns {CSSRule} An existing or newly constructed CSS rule that will
     *     match the supplied element uniquely.
     */

    var stylesHUD,

        modifyingRule,

        generatorTPElem,

        generatorType,
        targetType,

        ruleSelector,

        targetElem,
        sherpaID,
        targetDoc,

        matches,

        generatorSheet,

        newRuleIndex;

    stylesHUD = TP.byId('StylesHUD', TP.win('UIROOT'));

    //  Try to obtain a 'modifying rule' that we can use to manipulate.
    modifyingRule = stylesHUD.getModifiableRule(true);
    if (TP.notValid(modifyingRule)) {
        //  Grab the nearest 'generator' element to the target element. This
        //  will be the element (usually a CustomTag) that would have generated
        //  the target element (and which could be the target element itself).
        generatorTPElem = aTargetTPElement.getNearestHaloGenerator();
        if (TP.notValid(generatorTPElem)) {
            //  TODO: Raise an exception.
            return;
        }

        //  Compute a unique selector for the targeted element
        generatorType = generatorTPElem.getType();
        targetType = aTargetTPElement.getType();

        //  First, we scope it by the generator type.
        ruleSelector = generatorType.get('nsPrefix') + '|' +
                        generatorType.get('localName');

        //  With a descendant selector
        ruleSelector += ' ';

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
                                targetType.get('localName');
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

        sherpaID = TP.elementGetAttribute(targetElem, 'sherpaID', true);
        if (TP.isEmpty(sherpaID)) {
            //  Generate a unique ID for the target element, but do *not* assign
            //  it because we want to use it for a different, attribute, not
            //  'id'. 'id' attributes have a special XML-ish meaning and are
            //  stripped before the document is saved and we want this one to
            //  persist.
            sherpaID = TP.elemGenID(targetElem, false);

            aTargetTPElement.setAttribute('sherpaID', sherpaID);

            setTimeout(
                function() {
                    //  Manually update the canvas source of the target element.
                    //  Because we're in the midst of a D&D operation, mutation
                    //  observers will have been temporarily suspended.
                    //  Therefore, we do this manually.
                    this.updateUICanvasSource(
                        TP.ac(targetElem),
                        targetElem.parentNode,
                        TP.CREATE,
                        'sherpaID',
                        sherpaID,
                        null);
                }.bind(this), 10);
        }

        //  Add the SherpaID as an attribute selector.
        ruleSelector += '[sherpaID="' + sherpaID + '"]';

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
            generatorSheet = generatorTPElem.
                                getStylesheetForStyleResource();

            //  Create a new rule and add it to the end of the stylesheet.
            newRuleIndex = TP.styleSheetInsertRule(generatorSheet,
                                                    ruleSelector,
                                                    '',
                                                    null,
                                                    true);

            modifyingRule = generatorSheet.cssRules[newRuleIndex];
        }
    }

    return modifyingRule;
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

    //  The 'tools layer' is the 'content' div as we boot. We repurpose it
    //  to be the tools layer.
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

TP.sherpa.IDE.Inst.defineMethod('getToolsLayerOffsetsFromScreen',
function(aScreenTPElement) {

    /**
     * @method getToolsLayerOffsetsFromScreen
     * @summary Returns the X and Y offsets from the tools layer to the supplied
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

TP.sherpa.IDE.Inst.defineHandler('CloseActiveTool',
function(aSignal) {

    /**
     * @method handleCloseActiveTool
     * @summary Handles signals that the user wants to close the active tool.
     * @param {TP.sig.ConsoleCommand} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var toolsLayer,

        activeToolID;

    toolsLayer = this.getToolsLayer();

    activeToolID = toolsLayer.getAttribute('activetool');

    this.deactivateTool(activeToolID);

    return this;
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
        cmdText,

        request;

    //  Grab the console service. This gives us access to the currently active
    //  shell.
    consoleService = TP.bySystemId('SherpaConsoleService');

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
        currentCanvasDoc;

    //  Set up managed mutation observer machinery that uses our
    //  'processUICanvasMutationRecords' method to manage changes to the UI
    //  canvas.

    if (!this.get('setupComplete')) {
        return this;
    }

    //  If we're testing, then just exit here.
    if (TP.sys.isTesting()) {
        return this;
    }

    //  Grab the Sherpa's 'world' element and get the currently viewed canvas
    //  document from it.
    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();
    currentCanvasDoc = currentScreenTPWin.getDocument();

    //  Make sure to refresh all of the descendant document positions for the UI
    //  canvas.
    TP.nodeRefreshDescendantDocumentPositions(TP.unwrap(currentCanvasDoc));

    //  Grab the canvas document and observe mutation style change signals from
    //  it.
    this.observe(currentCanvasDoc, 'TP.sig.MutationStyleChange');

    //  Observe the canvas document for DOMDragDown and DOMMouseDown in a
    //  *capturing* fashion (to avoid having issues with the standard platform's
    //  implementation of mouse/drag down - in this way, we can preventDefault()
    //  on these events before they get in the way).
    this.observe(currentCanvasDoc,
                    TP.ac('TP.sig.DOMDragDown', 'TP.sig.DOMMouseDown'),
                    null,
                    TP.CAPTURING);

    //  Observe just the canvas document for when connections are completed to
    //  destination elements *within* the UI canvas (or are cancelled). Panels
    //  in the HUD (which  are in the UI root document) will observe this
    //  method themselves for connections made *to* elements in them.
    this.observe(currentCanvasDoc, TP.ac(
                                    'TP.sig.SherpaConnectCancelled',
                                    'TP.sig.SherpaConnectCompleted'));

    TP.activateMutationObserver(TP.unwrap(currentCanvasDoc),
                                'BUILDER_OBSERVER');

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

        currentCanvasDoc;

    //  If we're testing, then just exit here.
    if (TP.sys.isTesting()) {
        return this;
    }

    //  Grab the Sherpa's 'world' element and get the currently viewed canvas
    //  document from it.
    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();
    currentCanvasDoc = currentScreenTPWin.getDocument();

    //  Grab the canvas document and ignore mutation style change signals from
    //  it.
    this.ignore(currentCanvasDoc, 'TP.sig.MutationStyleChange');

    //  Ignore the canvas document for DOMDragDown and DOMMouseDown in a
    //  *capturing* fashion (to match our observation in the DocumentLoaded
    //  handler).
    this.ignore(currentCanvasDoc,
                TP.ac('TP.sig.DOMDragDown', 'TP.sig.DOMMouseDown'),
                null,
                TP.CAPTURING);

    //  Ignore the canvas document for when connections are completed to
    //  destination elements *within* the UI canvas (or are cancelled).
    this.ignore(currentCanvasDoc, TP.ac(
                                    'TP.sig.SherpaConnectCancelled',
                                    'TP.sig.SherpaConnectCompleted'));

    TP.deactivateMutationObserver('BUILDER_OBSERVER');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('DOMDragDown',
function(aSignal) {

    /**
     * @method handleDOMDragDown
     * @summary Handles notification of when the receiver might be starting a
     *     connection session.
     * @param {TP.sig.DOMDragDown} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var connector;

    connector = TP.byId('SherpaConnector', TP.sys.getUIRoot());
    if (TP.notValid(connector)) {
        return this;
    }

    //  If the Shift key is down and the Alt key is as well, then start a
    //  connector session.
    if (aSignal.getShiftKey() && aSignal.getAltKey()) {
        connector.startConnecting(aSignal);
    }

    return this;
}, {
    phase: TP.CAPTURING
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('DOMMouseDown',
function(aSignal) {

    /**
     * @method handleMouseDown
     * @summary Handles notification of when the receiver might be starting a
     *     connection session.
     * @param {TP.sig.DOMMouseDown} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var target;

    //  If both the Shift and Alt (Option) keys are down.
    if (aSignal.getShiftKey() && aSignal.getAltKey()) {

        //  First, prevent default on the signal. If we're over something like
        //  a text input, this is very important to prevent things like focusing
        //  and selection.
        aSignal.preventDefault();

        //  Next, grab the target and, if it's an Element and has a
        //  'tibet:nodragtrapping' attribute on it, remove that attribute and
        //  track the fact that we had a target that had that attribute.
        //  Controls like text input fields will have this attribute, because
        //  during normal production operation we do *not* want to allow
        //  TIBET-synthesized DOMDrag* signals to be originated from them. In
        //  this case, though, the 'builder' aspect of the Sherpa is going to
        //  override that.
        target = aSignal.getTarget();
        if (TP.isElement(target)) {
            TP.elementRemoveAttribute(target, 'tibet:nodragtrapping', true);
            this.$set('$nodragtrapTarget', target);
        }
    }

    return this;
}, {
    phase: TP.CAPTURING
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
    propertyMatcher = TP.rc(aSignal.at('mutatedProperty') +
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

TP.sherpa.IDE.Inst.defineHandler('SherpaConnectCancelled',
function(aSignal) {

    /**
     * @method handleSherpaConnectCancelled
     * @summary Handles notifications of the fact that the Sherpa connector
     *     did not successfully complete a connection and was cancelled.
     * @param {TP.sig.SherpaConnectCancelled} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var connector;

    connector = TP.byId('SherpaConnector', this.get('vWin'));

    connector.hideAllConnectorVisuals();

    //  Signal that the connection has failed.
    this.signal('SherpaConnectFailed');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('SherpaConnectCompleted',
function(aSignal) {

    /**
     * @method handleSherpaConnectCompleted
     * @summary Handles notifications of the fact that the Sherpa connector
     *     successfully completed a connection.
     * @param {TP.sig.SherpaConnectCompleted} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var srcTPElem,
        destTPElem,

        target,

        connector,

        vendValue,
        vendValues,

        acceptValue,
        acceptValues,

        dataSource,

        bindingData;

    srcTPElem = aSignal.at('sourceElement');
    destTPElem = TP.wrap(aSignal.getTarget());

    target = destTPElem.getType();

    //  Turn off 'autohiding' the connector - we'll hide it when the assistant
    //  is done. Note that this is reset to 'true' every time the connector is
    //  hidden.
    connector = TP.byId('SherpaConnector', this.get('vWin'));
    connector.set('autohideConnector', false);

    //  Grab the values that determine what type of connection we're vending.
    vendValue = srcTPElem.getAttribute('sherpa:connectorvend');
    vendValues = vendValue.split(' ');

    //  Grab the values that determine what type of connection we're accepting.
    acceptValue = destTPElem.getAttribute('sherpa:connectoraccept');
    acceptValues = acceptValue.split(' ');

    //  If both the vended values and the accepted values contained
    //  'bindingsource', then invoke the binding connection assistant.
    if (vendValues.contains('bindingsource') &&
        acceptValues.contains('bindingsource')) {

        //  Grab the value of the 'sherpa:connectordatasource' attribute. This
        //  will give us the system ID of the object that we can query to find
        //  'connector data' - data about this connector dragging session.
        dataSource = srcTPElem.getAttribute('sherpa:connectordatasource');
        if (TP.notEmpty(dataSource)) {

            //  Grab the connector data source object, if it can be found.
            dataSource = TP.bySystemId(dataSource, this.get('vWin'));
            if (TP.isValid(dataSource)) {

                //  Ask the connector data source for any data it might have
                //  regarding the connector session. Add the destination element
                //  to that and pass it along to the assistant.
                bindingData = dataSource.getConnectorData(srcTPElem);
                if (TP.isValid(bindingData)) {
                    bindingData.atPut('destTPElement', destTPElem);
                } else {
                    bindingData = TP.hc('destTPElement', destTPElem);
                }

                //  Show the assistant.
                TP.sherpa.bindingConnectionAssistant.showAssistant(bindingData);
            }
        }

        return this;
    }

    //  If both the vended values and the accepted values contained
    //  'signalsource', then invoke the signal connection assistant.
    if (vendValues.contains('signalsource') &&
        acceptValues.contains('signalsource')) {
        //  Show the assistant.
        TP.sherpa.signalConnectionAssistant.showAssistant(
                    TP.hc('sourceTPElement', srcTPElem,
                            'destinationTarget', target,
                            'signalOrigin', destTPElem.getLocalID()));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('SherpaConnectInitiate',
function(aSignal) {

    /**
     * @method handleSherpaConnectInitiate
     * @summary Handles notifications of the fact that the Sherpa connector
     *     initiated a connection session.
     * @param {TP.sig.SherpaConnectInitiate} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var sourceTPElem,

        collectors,

        vendValue,
        vendValues;

    //  Grab the connector source element
    sourceTPElem = aSignal.at('sourceElement');

    //  Grab the values that determine what type of connection we're vending.
    vendValue = sourceTPElem.getAttribute('sherpa:connectorvend');
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
            //  and add the vend value to the 'sherpa:connectoraccept'
            //  attribute.
            matchingNodes.forEach(
                function(aNode) {

                    if (TP.isElement(aNode)) {
                        TP.elementAddAttributeValue(aNode,
                                                    'sherpa:connectoraccept',
                                                    aVendValue,
                                                    true);
                    }
                });
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineHandler('SherpaConnectTerminate',
function(aSignal) {

    /**
     * @method handleSherpaConnectTerminate
     * @summary Handles notifications of the fact that the Sherpa connector
     *     terminated a connection session.
     * @param {TP.sig.SherpaConnectTerminate} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var noTrapTarget,

        sourceTPElem,
        destinationTPElem,

        collectors,

        vendValue,
        vendValues,

        connector;

    //  If we had a target that used to have a 'tibet:nodragtrapping' attribute
    //  on it, we need to put that back now that the connector session is
    //  terminating.
    noTrapTarget = this.$get('$nodragtrapTarget');
    if (TP.isValid(noTrapTarget)) {
        TP.elementSetAttribute(noTrapTarget,
                                'tibet:nodragtrapping',
                                'true',
                                true);
        this.$set('$nodragtrapTarget', null);
    }

    //  Grab the connector source and destination elements.
    sourceTPElem = aSignal.at('sourceElement');
    destinationTPElem = aSignal.at('destinationElement');

    //  Grab the values that determine what type of connection we're vending.
    vendValue = sourceTPElem.getAttribute('sherpa:connectorvend');
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
            //  and remove the vend value from the 'sherpa:connectoraccept'
            //  attribute.
            matchingNodes.forEach(
                function(aNode) {

                    if (TP.isElement(aNode)) {
                        TP.elementRemoveAttributeValue(
                                            aNode,
                                            'sherpa:connectoraccept',
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
        connector = TP.byId('SherpaConnector', TP.sys.getUIRoot());
        connector.hideAllConnectorVisuals();
    }

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

    notifier = TP.byId('SherpaNotifier', TP.sys.getUIRoot());
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

TP.sherpa.IDE.Inst.defineMethod('insertElementIntoCanvas',
function(newElement, insertionPointElement, aPositionOrPath, shouldFocusHalo,
shouldShowAssistant) {

    /**
     * @method insertElementIntoCanvas
     * @summary Inserts the supplied element into the canvas using the supplied
     *     insertion element at the supplied insertion point. The element should
     *     exist in the current canvas being managed by the Sherpa as this
     *     method turns on Sherpa mutation tracking machinery for the purpose of
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
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var newTPElem,
        insertionPointTPElem,

        insertedTPElem,
        insertedElem;

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
    insertedElem[TP.INSERTION_POSITION] = aPositionOrPath;
    insertedElem[TP.SHERPA_MUTATION] = TP.INSERT;

    this.focusInputCell();

    if (TP.isTrue(shouldFocusHalo)) {
        //  Focus the halo onto the inserted element after 1000ms
        setTimeout(
            function() {
                var viewDoc,
                    halo;

                //  The document that we were installed into.
                viewDoc = this.get('vWin').document;

                halo = TP.byId('SherpaHalo', viewDoc);

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

                if (TP.isTrue(shouldShowAssistant)) {
                    TP.byId('DOMHUD', viewDoc).showAssistant();
                }
            }.bind(this), 250);
    }

    //  Set up a timeout to delete those flags after a set amount of time
    setTimeout(
        function() {
            delete insertedElem[TP.INSERTION_POSITION];
            delete insertedElem[TP.SHERPA_MUTATION];
        }, TP.sys.cfg('sherpa.mutation_flag_clear_timeout', 5000));

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.IDE.Inst.defineMethod('insertServiceElementIntoCanvas',
function(remoteLocation, localLocation, insertionPointElement, aPositionOrPath,
shouldFocusHalo, shouldShowAssistant) {

    /**
     * @method insertServiceElementIntoCanvas
     * @summary Inserts a 'tibet:service' element into the canvas with the
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
     * @returns {TP.tibet.service} The wrapped newly inserted 'tibet:service'
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

    newServiceElem = TP.elem('<tibet:service' +
                                ' id="' + elemID + '"' +
                                ' href="' + remoteLocation + '"' +
                                ' result="' + localLoc + '"/>');

    this.insertElementIntoCanvas(
            newServiceElem,
            insertionPointElement,
            aPositionOrPath,
            shouldFocusHalo,
            shouldShowAssistant);

    return TP.wrap(newServiceElem);
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

            sherpaDoc;

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
        descendantListCreations,

        replacedNodesRecords;

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
                        attrPrefix = TP.w3.Xmlns.getPrefixForNSURI(
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
                    } else if (!attrIsEmpty && !attrWasEmpty &&
                                attrValue !== attrOldValue) {

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

    //  !!!NOTE NOTE NOTE!!!
    //  This processing logic is in a particular order for best results. That
    //  order is:
    //      Nodes created
    //      Attributes updated
    //      Attributes created
    //      Attributes deleted
    //      Nodes deleted

    replacedNodesRecords = TP.ac();

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
                    k,

                    removedNodesLen,
                    l,

                    foundMatch;

                creationRecords = kvPair.last();

                mutatedNodes = TP.ac();

                //  Iterate over each record and collect up all of the mutated
                //  nodes into a single Array.
                recordsLen = creationRecords.getSize();
                for (j = 0; j < recordsLen; j++) {
                    record = creationRecords.at(j);

                    nodesLen = record.addedNodes.length;
                    removedNodesLen = record.removedNodes.length;

                    for (k = 0; k < nodesLen; k++) {

                        //  If there were also removed nodes as part of the
                        //  record, then iterate over them looking for one whose
                        //  previous position matches that of the added node. If
                        //  a match is found, then that means that the removed
                        //  node is being replaced by the added node and should
                        //  be treated 'specially' by being placed in a
                        //  'replaced nodes' data set.
                        if (removedNodesLen > 0) {
                            foundMatch = false;
                            for (l = 0; l < removedNodesLen; l++) {
                                if (record.
                                        addedNodes[k][TP.PREVIOUS_POSITION] ===
                                    record.
                                        removedNodes[l][TP.PREVIOUS_POSITION]) {
                                    replacedNodesRecords.push(
                                        {
                                            old: record.removedNodes[l],
                                            new: record.addedNodes[k],
                                            target: record.target
                                        });
                                    foundMatch = true;
                                    break;
                                }
                            }

                            //  There was no matching removed node, so add the
                            //  nodes to our set of mutated nodes.
                            if (!foundMatch) {
                                mutatedNodes.push(record.addedNodes[k]);
                            }
                        } else {
                            mutatedNodes.push(record.addedNodes[k]);
                        }
                    }
                }

                //  Call the method to update our current UI canvas's source
                //  DOM.
                this.updateUICanvasSource(
                        mutatedNodes, record.target, TP.CREATE);
            }.bind(this));
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
                    k,

                    addedNodesLen,
                    l,

                    foundMatch;

                deletionRecords = kvPair.last();

                mutatedNodes = TP.ac();

                //  Iterate over each record and collect up all of the mutated
                //  nodes into a single Array.
                recordsLen = deletionRecords.getSize();
                for (j = 0; j < recordsLen; j++) {
                    record = deletionRecords.at(j);

                    nodesLen = record.removedNodes.length;
                    addedNodesLen = record.addedNodes.length;

                    for (k = 0; k < nodesLen; k++) {

                        //  If there were also added nodes as part of the
                        //  record, then iterate over them looking for one whose
                        //  previous position matches that of the removed node.
                        //  If a match is found, then that means that the
                        //  removed node is being replaced by the added node. It
                        //  was already handled above when processing added
                        //  nodes, so here we just skip over it, not adding it
                        //  to our mutated nodes.
                        if (addedNodesLen > 0) {
                            foundMatch = false;
                            for (l = 0; l < addedNodesLen; l++) {
                                if (record.
                                        removedNodes[k][TP.PREVIOUS_POSITION] ===
                                    record.
                                        addedNodes[l][TP.PREVIOUS_POSITION]) {
                                    foundMatch = true;
                                    break;
                                }
                            }

                            //  There was no matching added node, so add the
                            //  nodes to our set of mutated nodes.
                            if (!foundMatch) {
                                mutatedNodes.push(record.removedNodes[k]);
                            }
                        } else {
                            mutatedNodes.push(record.removedNodes[k]);
                        }
                    }
                }

                //  Call the method to update our current UI canvas's source
                //  DOM.
                this.updateUICanvasSource(
                        mutatedNodes, record.target, TP.DELETE);
            }.bind(this));
    }

    //  If we have specially generated 'replacement' records, then process them.
    if (TP.notEmpty(replacedNodesRecords)) {

        len = replacedNodesRecords.getSize();
        for (i = 0; i < len; i++) {
            record = replacedNodesRecords.at(i);

            this.updateUICanvasSource(
                    TP.ac(record.old),
                    record.target,
                    TP.UPDATE,
                    null,
                    null,
                    null,
                    true,
                    record.new);
        }
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

TP.sherpa.IDE.Inst.defineMethod('setAttributeOnElementInCanvas',
function(anElement, attributeName, attributeValue, shouldRefresh) {

    /**
     * @method setAttributeOnElement
     * @summary Sets the attribute on the supplied element with the supplied
     *     name to the supplied value. The element should exist in the current
     *     canvas being managed by the Sherpa as this method turns on Sherpa
     *     mutation tracking machinery for the purpose of updating a source
     *     document.
     * @param {TP.dom.ElementNode} anElement The element to set the attribute
     *     on.
     * @param {String} attributeName The name of the attribute to set.
     * @param {String} attributeValue The value to set on the attribute.
     * @param {Boolean} [shouldRefresh=true] Whether or not to refresh the
     *     element.
     * @returns {TP.sherpa.IDE} The receiver.
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

TP.sherpa.IDE.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the TP.sherpa.IDE object.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var win,
        thisref,

        connectorCollectors,

        drawerElement,
        sherpaFinishSetupFunc,

        contentElem,

        loadingImageLoc,
        loadingImageReq,

        allDrawers,

        centerElem,

        resizingHandler,
        observerConfig,
        resizer,

        framingStyleElement,
        variablesRule;

    win = this.get('vWin');

    thisref = this;

    //  Build a hash of two 'connector collector' Functions that will be used to
    //  select elements that should be enabled for that particular connector
    //  type.
    connectorCollectors = TP.hc(
        'bindingsource',
            function(sourceTPElem) {
                var uiDoc,
                    context;

                //  For binding sources, if the source element is not in the
                //  current UI canvas, then the context should be the UI canvas.
                uiDoc = TP.sys.uidoc();
                if (!uiDoc.contains(sourceTPElem)) {
                    context = uiDoc;
                } else {
                    context = sourceTPElem;
                }

                return TP.byCSSPath('html|input', context, false, false);
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
        //  'loading' element. The HUD will use it later for a 'tools layer'.
        contentElem = TP.byId('content', win, false);

        loadingImageLoc = TP.uc('~lib_media/tibet_logo.svg').getLocation();

        loadingImageReq = TP.request('uri', loadingImageLoc, 'async', false);
        loadingImageReq.defineHandler('IOCompleted',
            function(aSignal) {
                var loadingSVGElem;

                loadingSVGElem = aSignal.getResult().documentElement;

                (function() {

                    //  Show the content element, only so that we can size its
                    //  'busy' message layer properly.
                    TP.elementShow(contentElem);
                    TP.elementShowBusyMessage(
                                contentElem,
                                null,
                                loadingSVGElem);
                    TP.elementHide(contentElem);

                }).queueForNextRepaint(TP.nodeGetWindow(contentElem));
            });

        TP.httpGet(loadingImageLoc, loadingImageReq);

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

    //  Set up resizing worker functions and value gathering. Note that we make
    //  sure to go after only HTML style elements here.
    framingStyleElement =
        TP.byCSSPath('html|style[tibet|originalhref$="sherpa_framing.css"]',
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

    this.getToolsLayer().addContent(adjusterTPElem);

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

    //  If we're testing, then just exit here.
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
            //  The builder doesn't process MO events if we're testing.
            if (TP.sys.isTesting()) {
                return false;
            }
        },
        'BUILDER_OBSERVER');

    //  Add a managed Mutation Observer filter Function that will filter all
    //  mutation records for bind:in attribute mutations when the target element
    //  is a desugared text span. This is because this 'bind:in' was *generated*
    //  because of the desugaring and it won't be found in the source document.

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
        hudTPElem,

        menuTypes,
        len,
        i,

        menuType,
        menuTPElem;

    viewDoc = this.get('vWin').document;
    hudTPElem = TP.byId('SherpaHUD', this.get('vWin'));

    //  Add the stylesheet for the TP.xctrls.popup, if it's not there already.
    //  All context menus will use this and we might as well pre-populate it.
    TP.xctrls.popup.addStylesheetTo(viewDoc);

    //  Make a list of the all of the context menu types.
    menuTypes = TP.ac(
                    TP.sherpa.halocontextmenu,
                    TP.sherpa.hudcontextmenu
                    );

    //  Iterate over that list and set up the menu.
    len = menuTypes.getSize();
    for (i = 0; i < len; i++) {

        menuType = menuTypes.at(i);

        //  Add the stylesheet
        menuType.addStylesheetTo(viewDoc);

        //  Grab the template, clone it and add the raw content to the HUD
        //  element of the Sherpa.
        menuTPElem = menuType.getResourceElement(
                                'template', TP.ietf.mime.XHTML);
        menuTPElem = menuTPElem.clone();
        hudTPElem.addRawContent(menuTPElem);
    }

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

    var world,
        currentScreenTPWin,

        currentCanvasDoc,
        rootDoc,
        docs,

        connector;

    //  Grab the Sherpa's 'world' element and get the currently viewed canvas
    //  document from it.
    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
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
            TP.ac('TP.sig.DOMDragDown', 'TP.sig.DOMMouseDown'),
            null,
            TP.CAPTURING);

    //  Observe just the canvas document for when connections are completed to
    //  destination elements *within* the UI canvas (or are cancelled). Panels
    //  in the HUD (which  are in the UI root document) will observe this
    //  method themselves for connections made *to* elements in them.
    this.observe(currentCanvasDoc, TP.ac(
                                    'TP.sig.SherpaConnectCancelled',
                                    'TP.sig.SherpaConnectCompleted'));

    //  Observe the Sherpa's connector itself for connection initiation and
    //  termination.
    connector = TP.byId('SherpaConnector', this.get('vWin'));
    this.observe(connector,
                    TP.ac('TP.sig.SherpaConnectInitiate',
                            'TP.sig.SherpaConnectTerminate'));

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

TP.sherpa.IDE.Inst.defineMethod('setupManipulators',
function() {

    /**
     * @method setupManipulators
     * @summary Sets up the Sherpa's 'manipulator' components. These componest
     *     aid in visual editing of various properties of target elements -
     *     usually CSS properties.
     * @returns {TP.sherpa.IDE} The receiver.
     */

    var toolsLayerTPElem,
        manipulatorTPElem;

    toolsLayerTPElem = this.getToolsLayer();

    manipulatorTPElem = TP.sherpa.dimensionsManipulator.
                            getResourceElement('template', TP.ietf.mime.XHTML);

    manipulatorTPElem = manipulatorTPElem.clone();
    manipulatorTPElem.compile();

    toolsLayerTPElem.addContent(manipulatorTPElem);

    manipulatorTPElem = TP.sherpa.positionManipulator.
                            getResourceElement('template', TP.ietf.mime.XHTML);

    manipulatorTPElem = manipulatorTPElem.clone();
    manipulatorTPElem.compile();

    toolsLayerTPElem.addContent(manipulatorTPElem);

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
    //  that screen tag into the world. This will move the iframes out of the
    //  'content' div that originally held them and into the <sherpa:world>.
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

    //  Hide the 'content' div - it's empty now anyway.
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

        testNode,
        wrappedTestNode,

        result,

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

                //  This will be empty if mutationAncestor and tagSrcElem are
                //  the same node.
                if (TP.isEmpty(ancestorAddresses)) {
                    ancestorAddresses = TP.ac();

                    //  If the source node is a Document, then we need to
                    //  unshift a '0' onto the ancestor addresses because of
                    //  differences in how the computation will have occurred
                    //  (the original computation will have included the index
                    //  off of the Document).
                    if (TP.isDocument(sourceNode)) {
                        ancestorAddresses.unshift('0');
                    }
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

        insertionParent = sourceNode;

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

                //  If we're not currently processing an attribute change, then
                //  set the current node based on whether we're doing a pure
                //  append or not.
                if (!isAttrChange) {
                    testNode = currentNode.childNodes[address];

                    //  If there isn't a Node (even a Text node) at the final
                    //  address, then we're doing a pure append (in the case of
                    //  the operation being a TP.CREATE). Therefore, we set
                    //  currentNode (our insertion point) to null.
                    if (!TP.isNode(testNode)) {
                        currentNode = null;
                    } else {
                        //  Otherwise, set the currentNode (used as the
                        //  insertion point in a TP.CREATE) to the childNode at
                        //  the last address.
                        wrappedTestNode = TP.wrap(testNode);

                        result = wrappedTestNode.
                                    sherpaGetNodeForVisualDOMChange(
                                        mutatedNode,
                                        operation,
                                        addresses.at(j),
                                        addresses.slice(j + 1),
                                        addresses);

                        //  If the result is TP.CONTINUE, then the receiving
                        //  node does not want to be modified (or have
                        //  modifications performed under it), so we skip over
                        //  it.
                        if (result === TP.CONTINUE) {
                            break;
                        }

                        currentNode = result;
                    }

                    break;
                }
            }

            //  Grab the child of the current node and use it to test to figure
            //  out where to move next.
            testNode = currentNode.childNodes[address];

            //  If we got a valid test node, then wrap it and query it for the
            //  node to modify for a visual change.
            if (TP.isNode(testNode)) {
                wrappedTestNode = TP.wrap(testNode);

                result = wrappedTestNode.sherpaGetNodeForVisualDOMChange(
                                mutatedNode,
                                operation,
                                addresses.at(j),
                                addresses.slice(j + 1),
                                addresses);

                //  If the result is TP.CONTINUE, then the receiving node does
                //  not want to be modified (or have modifications performed
                //  under it), so we skip over it.
                if (result === TP.CONTINUE) {
                    break;
                }

                //  Otherwise, reset the node we'll use from here to the result
                //  that was returned.
                testNode = result;
            }

            //  If the test node is a Text node containing only whitespace and
            //  we're not actually mutating a Text node (i.e. setting it), then
            //  we skip it and move on to the next node.
            if (TP.isTextNode(testNode) &&
                TP.regex.ONLY_WHITESPACE.test(testNode.nodeValue) &&
                !TP.isTextNode(mutatedNode)) {
                currentNode = currentNode.childNodes[address + 1];
            } else {
                currentNode = testNode;
            }
        }

        if (result === TP.CONTINUE) {
            result = null;
            continue;
        }

        //  NB: This might push 'null'... and for non-attribute TP.CREATE
        //  operations, "that's ok" (since it will basically become an 'append'
        //  below).
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
                                    'bind:in',
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
            } else {

                //  Clone the node
                newNode = TP.nodeCloneNode(replacementNode, true, false);

                if (TP.isElement(newNode)) {

                    //  'Clean' the Element of any runtime constructs put
                    //  there by TIBET.
                    TP.elementClean(newNode);

                    //  Only replace the node and mark for dirty if the two
                    //  nodes aren't equal.
                    if (!TP.nodeEqualsNode(currentNode, newNode)) {
                        TP.nodeReplaceChild(currentNode.parentNode,
                                            newNode,
                                            currentNode,
                                            false);

                        shouldMarkDirty = true;
                    }
                } else if (TP.isTextNode(newNode)) {

                    //  It's just a Text node - we use it and it's contents
                    //  literally.

                    //  Only replace the node and mark for dirty if the two
                    //  nodes aren't equal.
                    if (!TP.nodeEqualsNode(currentNode, newNode)) {
                        TP.nodeReplaceChild(currentNode.parentNode,
                                            newNode,
                                            currentNode,
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

//  Tools layer signals
TP.sig.SherpaSignal.defineSubtype('CloseActiveTool');

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
