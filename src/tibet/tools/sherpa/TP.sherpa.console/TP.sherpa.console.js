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
 * @type {TP.sherpa.console}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:console');

//  ----------------------------------------------------------------------------
//  Type Constants
//  ----------------------------------------------------------------------------

//  the default prompt separator/string (>>)
TP.sherpa.console.Type.defineConstant('DEFAULT_PROMPT', '&#160;&#187;');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the minimum height of the console editor.
TP.sherpa.console.Inst.defineAttribute('$minEditorHeight');

//  the minimum height of the console drawer.
TP.sherpa.console.Inst.defineAttribute('$minDrawerHeight');

//  the Function that will stop ACE from processing events.
TP.sherpa.console.Inst.defineAttribute('$aceEventStopper');

//  should we move the cursor?
TP.sherpa.console.Inst.defineAttribute('allowMouseCursorMovement');

//  should IO be concealed? this is used to simulate "password" mode
TP.sherpa.console.Inst.defineAttribute('conceal', false);

//  is the command line currently concealed from view?
TP.sherpa.console.Inst.defineAttribute('concealedInput');

TP.sherpa.console.Inst.defineAttribute('consoleInput',
    TP.cpc('xctrls|codeeditor#SherpaConsoleInput',
        TP.hc('shouldCollapse', true)));

TP.sherpa.console.Inst.defineAttribute('consoleOutput');

//  the number of 'new' items since we evaluated last
TP.sherpa.console.Inst.defineAttribute('newOutputCount');

//  a timer that will flip the status readout back to mouse coordinates after a
//  period of time.
TP.sherpa.console.Inst.defineAttribute('statusReadoutTimer');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('createNewConsoleEditorFor',
function(tabValue, tabLabel) {

    /**
     * @method createNewConsoleEditorFor
     * @summary Creates a new console tab and, using the supplied value, loads
     *     it with the content for that value.
     * @param {String} tabValue The value to use as the tab and panel's value.
     *     This is the value that will be resolved in the system and that
     *     resolved object will be used as the source for the editor.
     * @param {String} tabLabel The label to use for the new tab.
     * @returns {TP.sherpa.console} The receiver.
     */

    var newPanel,

        editorTPElem,
        toolbarTPElem,

        sourceObj,

        editorLID,

        panelContentElem,
        elem,

        editor,
        handler;

    //  Ask the inspector to create a new console tab with the value and label.
    //  This will return the new panel that we can add content to. Note that we
    //  pass false here to tell the system to *not* create a profile entry.
    newPanel = this.makeNewConsoleTabPanel(tabValue, tabLabel, false);

    //  Depending on whether or not the value is a URI string, we create either
    //  a general URI editor or a method editor.
    if (TP.isURIString(tabValue)) {

        editorTPElem = TP.sherpa.urieditor.getResourceElement(
                                'template',
                                TP.ietf.mime.XHTML);

        toolbarTPElem = TP.sherpa.uriEditorToolbarContent.getResourceElement(
                                'template',
                                TP.ietf.mime.XHTML);

        sourceObj = TP.uc(tabValue);

    } else {

        editorTPElem = TP.sherpa.methodeditor.getResourceElement(
                                'template',
                                TP.ietf.mime.XHTML);

        toolbarTPElem = TP.sherpa.methodEditorToolbarContent.getResourceElement(
                                'template',
                                TP.ietf.mime.XHTML);

        //  The tab value will be the method's TP.DISPLAY name. Fetch the method
        //  object based on that value.
        sourceObj = TP.methodByDisplayName(tabValue);
    }

    editorTPElem = editorTPElem.clone();
    toolbarTPElem = toolbarTPElem.clone();

    //  Make sure to compile the templates in case they have elements that need
    //  to be compiled.
    editorTPElem.compile();
    toolbarTPElem.compile();

    //  We don't want adding the editor and it's toolbar to the DOM to cause
    //  mutation signals to be processed.
    newPanel.setAttribute('tibet:nomutationtracking', 'true');

    //  Compute a unique ID for the editor, based on the number of tabs that are
    //  already in the console tab view.
    editorLID = 'editor_' + (this.getTabCount() - 1);

    //  Grab the 'xctrls:content' element from it.
    panelContentElem = newPanel.get('contentElement').getNativeNode();

    //  Grab the toolbar's native element and set the 'tibet:ctrl' attribute
    //  (used for dispatching responder signals) to the new unique ID that we
    //  computed above so that responder signals from this particular toolbar
    //  will go to the right place (ourself, via our new ID).
    elem = TP.unwrap(toolbarTPElem);
    TP.elementSetAttribute(elem, 'tibet:ctrl', editorLID, true);
    TP.elementAddClass(elem, 'tabbed');

    //  Move the toolbar into place in our panel content.
    TP.nodeAppendChild(panelContentElem, elem, false);

    //  Grab our native element and reset the 'id' to the new unique ID that we
    //  computed above. This will tie us together with the toolbar via it's
    //  now-reset 'tibet:ctrl' attribute above.
    elem = TP.unwrap(editorTPElem);
    TP.elementSetAttribute(elem, 'id', editorLID, true);

    //  Add a class of 'tabbed' and add the editor into place in our panel
    //  content.
    TP.elementAddClass(elem, 'tabbed');
    editorTPElem = TP.wrap(panelContentElem).addContent(editorTPElem);

    //  Set up a handler on the underlying 'editor' object of the editor element
    //  for the TP.sig.DOMReady signal that will be fired when the editor is
    //  ready to have its value set.
    editor = editorTPElem.get('editor');

    handler = function(aSignal) {
        handler.ignore(editor, 'TP.sig.DOMReady');

        //  The editor is ready - set the value.
        editorTPElem.set('value', sourceObj);
    };
    handler.observe(editor, 'TP.sig.DOMReady');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getTabCount',
function() {

    /**
     * @method getTabCount
     * @summary Returns the number of tabs in the console tab control.
     * @returns {Number} The number of tabs in the console tab control.
     */

    var tabsURI,
        data;

    tabsURI = TP.uc('urn:tibet:sherpa_tabs');
    data = TP.val(tabsURI.getResource().get('result'));

    return data.getSize();
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('hasTabForValue',
function(aValue) {

    /**
     * @method hasTabForValue
     * @summary Returns whether or not the console's tab control has a tab whose
     *     value matches the supplied value.
     * @param {String} aValue The value to match.
     * @returns {Boolean} Whether or not there is a tab matching that value.
     */

    var tabsURI,
        data,

        keys,
        tabHasValue;

    tabsURI = TP.uc('urn:tibet:sherpa_tabs');
    data = TP.val(tabsURI.getResource().get('result'));

    tabHasValue = false;
    if (TP.notEmpty(data)) {

        //  Grab up all of the items in the first position at each Array in the
        //  data. This will be the 'key'.
        keys = data.collect(TP.RETURN_FIRST);

        //  If there is a tab with a value matching one of the keys, then we
        //  will detect it. If it's valid, then we know we have a tab matching
        //  that.
        tabHasValue = TP.isValid(
                        keys.detect(
                            function(aKey) {
                                return aKey === aValue;
                            }));
    }

    return tabHasValue;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('makeNewConsoleTabPanel',
function(tabValue, tabLabel, shouldCreateProfileEntry) {

    /**
     * @method makeNewConsoleTabPanel
     * @summary Makes a new tab in the console using the supplied value and
     *     label.
     * @param {String} tabValue The value to use as the tab and panel's value.
     *     This is the value that will tie them together so that when the value
     *     of the tabbar is changed, the panel will change to match.
     * @param {String} tabLabel The label to use for the new tab.
     * @param {Boolean} [shouldCreateProfileEntry=true] Whether or not the
     *     system should create an entry for this tab in the user's shell
     *     profile.
     * @returns {TP.xctrls.panel} The newly created panel, ready for new content
     *     to be placed into it.
     */

    var tabsURI,
        data,

        panelBox,
        newPanel,

        editorTabEntries;

    //  Grab the value holder holding the tab data.
    tabsURI = TP.uc('urn:tibet:sherpa_tabs');

    //  Grab the data and push a new value of an Array consisting of the value
    //  and the label.
    data = TP.val(tabsURI.getResource().get('result'));
    data.push(TP.ac(tabValue, tabLabel));

    //  Signal that the data has changed - we need to do this manually since we
    //  extracted the data from the value holder URI.
    tabsURI.$changed();

    //  Grab the Sherpa console's panel box and add a new panel, supplying the
    //  value we are using to tie the two together.
    panelBox = TP.byId('SherpaConsolePanelbox', this.getNativeDocument());
    newPanel = panelBox.addPanel(tabValue);

    //  If we should create an entry in the profile, then do so and tell the
    //  shell to save the profile.
    if (TP.notFalse(shouldCreateProfileEntry)) {
        editorTabEntries =
            TP.uc('urn:tibet:sherpa_consoletabs').getResource().get('result');

        editorTabEntries.push(TP.ac(tabValue, tabLabel));

        TP.bySystemId('TSH').saveProfile();
    }

    return newPanel;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInputTPElem,

        spaceHandler,
        shiftSpaceHandler,

        loadHandler,

        contentTPElem,

        consoleOutputTPElem,

        hudTPElem,

        isHidden,

        consoleDrawerTPElem,

        data,
        tabSelectionURI;

    consoleInputTPElem = this.get('consoleInput');

    //  Make sure to observe setup on the console input here, because it won't
    //  be fully formed when this line is executed.

    spaceHandler =
        function() {

            var currentEditorVal,

                consoleOutput,
                mode;

            //  This should only work if the input is empty.
            currentEditorVal = consoleInputTPElem.getValue();
            if (TP.notEmpty(currentEditorVal)) {
                //  Return false so that ACE *will* process this as a regular
                //  keystroke.
                return false;
            }

            consoleOutput = this.get('consoleOutput');

            mode = consoleOutput.getAttribute('mode');

            //  If we're not showing cells at all, then set the mode to growl
            //  and force toggle the display to expose the last cell.
            if (mode === 'none') {
                consoleOutput.removeAttribute('hidden');
                consoleOutput.removeAttribute('showing_all');

                consoleOutput.setAttribute('mode', 'growl');
                consoleOutput.growlModeForceDisplayToggle();

                //  Return true so that ACE will *not* process this as a regular
                //  keystroke.
                return true;
            } else if (mode === 'one') {
                if (consoleOutput.hasAttribute('showing_all')) {
                    consoleOutput.removeAttribute('showing_all');
                } else {
                    consoleOutput.setAttribute('showing_all', 'true');
                }

                //  Return true so that ACE will *not* process this as a regular
                //  keystroke.
                return true;
            } else if (mode === 'all') {
                if (consoleOutput.hasAttribute('pclass:hidden')) {
                    consoleOutput.removeAttribute('hidden');
                } else {
                    consoleOutput.setAttribute('hidden', true);
                }

                //  Return true so that ACE will *not* process this as a regular
                //  keystroke.
                return true;
            }

            //  Otherwise, if we're in growl mode, then there are 2
            //  possibilities.
            if (mode === 'growl') {

                //  If we were already toggling from before (as shown by having
                //  either 'exposed' or 'concealed' attributes), and we were
                //  exposed, then we set the mode back to 'none' and remove the
                //  'exposed' attribute so that subsequent outputting will still
                //  work.
                if (consoleOutput.hasAttribute('exposed')) {
                    consoleOutput.setAttribute('mode', 'none');
                    consoleOutput.removeAttribute('exposed');
                } else {

                    //  Otherwise, we're in growl mode because the *user* (not
                    //  the toggling code above) put us there and so we just
                    //  force toggle the display to expose the last cell.
                    consoleOutput.growlModeForceDisplayToggle();
                }

                //  Return true so that ACE will *not* process this as a regular
                //  keystroke.
                return true;
            }

            //  Return false so that ACE *will* process this as a regular
            //  keystroke.
            return false;
        }.bind(this);

    shiftSpaceHandler =
        function() {

            var consoleOutput,
                mode;

            //  Shift-Space does the exact same thing as Space does
            //  above, but will work whether the input cell is empty or
            //  not.

            consoleOutput = this.get('consoleOutput');

            mode = consoleOutput.getAttribute('mode');

            //  If we're not showing cells at all, then set the mode to
            //  growl and force toggle the display to expose the last
            //  cell.
            if (mode === 'none') {
                consoleOutput.setAttribute('mode', 'growl');
                consoleOutput.growlModeForceDisplayToggle();

                //  Return true so that ACE will *not* process this as a
                //  regular keystroke.
                return true;
            }

            //  Otherwise, if we're in growl mode, then there are 2
            //  possibilities.
            if (mode === 'growl') {

                //  If we were already toggling from before (as shown by
                //  having either 'exposed' or 'concealed' attributes),
                //  and we were exposed, then we set the mode back to
                //  'none' and remove the 'exposed' attribute so that
                //  subsequent outputting will still work.
                if (consoleOutput.hasAttribute('exposed')) {
                    consoleOutput.setAttribute('mode', 'none');
                    consoleOutput.removeAttribute('exposed');
                } else {

                    //  Otherwise, we're in growl mode because the
                    //  *user* (not the toggling code above) put us
                    //  there and so we just force toggle the display to
                    //  expose the last cell.
                    consoleOutput.growlModeForceDisplayToggle();
                }

                //  Return true so that ACE will *not* process this as a
                //  regular keystroke.
                return true;
            }

            //  Return false so that ACE *will* process this as a
            //  regular keystroke.
            return false;
        }.bind(this);

    loadHandler =
        function() {
            var editorObj,
                themeName,

                aceTATPElem;

            loadHandler.ignore(consoleInputTPElem, 'TP.sig.DOMReady');

            consoleInputTPElem.setEditorMode('ace/mode/javascript');

            themeName = TP.sys.cfg('sherpa.rich_input_theme', 'dawn');
            consoleInputTPElem.setEditorTheme('ace/theme/' + themeName);

            editorObj = consoleInputTPElem.$get('$editorObj');

            aceTATPElem = TP.byCSSPath(
                            '> * textarea.ace_text-input',
                            consoleInputTPElem,
                            true);
            aceTATPElem.defineHandler('UIFocusNext',
                function(aSignal) {
                    aSignal.stopPropagation();
                });

            editorObj.getSession().setUseSoftTabs(true);
            editorObj.getSession().setNavigateWithinSoftTabs(true);

            editorObj.commands.addCommand({
                name: 'RawInput',
                bindKey: {win: 'Shift-Return', mac: 'Shift-Return'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'PreviousHistory',
                bindKey: {win: 'Shift-Up', mac: 'Shift-Up'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'NextHistory',
                bindKey: {win: 'Shift-Down', mac: 'Shift-Down'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'ClearInput',
                bindKey: {win: 'Ctrl-U', mac: 'Ctrl-U'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'ClearOutput',
                bindKey: {win: 'Ctrl-K', mac: 'Ctrl-K'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'CancelProcess',
                bindKey: {win: 'Shift-Esc', mac: 'Shift-Esc'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'RotateOutputModeUp',
                bindKey: {win: 'Ctrl-Up', mac: 'Ctrl-Up'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'RotateOutputModeDown',
                bindKey: {win: 'Ctrl-Down', mac: 'Ctrl-Down'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'HelpMode_Or_EndAutocomplete',
                bindKey: {win: 'Esc', mac: 'Esc'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'StartAutocomplete',
                bindKey: {win: 'Ctrl-A', mac: 'Ctrl-A'},
                exec: TP.RETURN_TRUE,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'ShowLastGrowlOutput',
                bindKey: {win: 'Space', mac: 'Space'},
                exec: spaceHandler,
                passEvent: false,
                readOnly: false
            });

            editorObj.commands.addCommand({
                name: 'ShowLastGrowlOutputAlways',
                bindKey: {win: 'Shift-Space', mac: 'Shift-Space'},
                exec: shiftSpaceHandler,
                passEvent: false,
                readOnly: false
            });
        };

    loadHandler.observe(consoleInputTPElem, 'TP.sig.DOMReady');

    (function() {
        //  Adjust the input size *without* animating the drawer.
        this.adjustInputSize(false);
    }.bind(this)).observe(consoleInputTPElem, 'TP.sig.EditorResize');

    //  Set the receiver to allow the cursor to be moved. We can initially set
    //  this using the $set() method so that the setter isn't called.
    this.$set('allowMouseCursorMovement', true);

    //  A function that will cause ACE to stop propagation of events into its
    //  internals.
    this.set('$aceEventStopper',
                function(evt) {
                    evt.stop();
                });

    //  Grab the consoleOutput TP.dom.ElementNode and set it up. Note that we
    //  need to do this *after* we set up the console input above.
    consoleOutputTPElem = TP.byId('SherpaConsoleOutput',
                                    this.getNativeDocument());
    consoleOutputTPElem.setup();

    this.set('consoleOutput', consoleOutputTPElem);

    //  Set the number of 'new' output items to 0, to start. Note this *must* be
    //  done before we set up the ConsoleService.
    this.set('newOutputCount', 0);

    //  Now we can set up the ConsoleService

    //  NB: We have to set up the ConsoleService this *after* we put in the
    //  output view.
    this.setupConsoleService();

    //  Observe the HUD for when it opens/closes
    hudTPElem = TP.byId('SherpaHUD', this.getNativeWindow());
    this.observe(hudTPElem, 'ClosedChange');

    //  Use the HUD's current value to set whether we are hidden or not.
    isHidden = TP.bc(hudTPElem.getAttribute('hidden'));
    this.setAttribute('hidden', isHidden);

    //  Hide the Sherpa's busy message... getting ready for use.
    contentTPElem = TP.byId('content', this.getNativeWindow());
    TP.elementHideBusyMessage(contentTPElem.getNativeNode());

    //  Observe the HUD's south drawer for when it opens/closes
    consoleDrawerTPElem = TP.byId('south', this.getNativeDocument());
    this.observe(consoleDrawerTPElem, 'ClosedChange');

    //  Set the overall data Array as the resource for the console tabs.
    data = TP.ac(
            TP.ac('TSH', 'TSH')
            );
    TP.uc('urn:tibet:sherpa_tabs').setResource(data);

    //  Set the selection hash for the console tabs.
    data = TP.hc('selection', 'TSH');
    TP.uc('urn:tibet:current_console_tab').setResource(data);

    this.observe(TP.uc('urn:tibet:sherpa_consoletabs'), 'ValueChange');

    //  Observe the current tab selection for the tabbar in the source drawer
    //  for when its value changes.
    tabSelectionURI = TP.uc('urn:tibet:current_console_tab#tibet(selection)');
    this.observe(tabSelectionURI, 'ValueChange');

    //  Sherpa observations
    this.observe(TP.bySystemId('Sherpa'), 'SherpaReady');

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers for signals from other widgets
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles when the HUD's 'closed' state changes. We track that by
     *     showing/hiding ourself.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.console} The receiver.
     */

    var isHidden;

    isHidden = TP.bc(aSignal.getOrigin().getAttribute('hidden'));

    this.setAttribute('hidden', isHidden);

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles when the HUD's 'south drawer' 'closed' state changes.
     *     We track that by adjusting the size of our input cell area.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.console} The receiver.
     */

    var isClosed,

        southDrawer,
        drawerIsOpenFunc;

    isClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    southDrawer = aSignal.getOrigin();

    drawerIsOpenFunc = function(transitionSignal) {

        var consoleInputTPElem;

        //  Turn off any future notifications.
        drawerIsOpenFunc.ignore(southDrawer, 'TP.sig.DOMTransitionEnd');

        consoleInputTPElem = this.get('consoleInput');
        if (TP.isValid(consoleInputTPElem) && consoleInputTPElem.isVisible()) {
            consoleInputTPElem.focus();
        }

    }.bind(this);

    drawerIsOpenFunc.observe(southDrawer, 'TP.sig.DOMTransitionEnd');

    if (!isClosed) {

        TP.elementGetStyleObj(TP.unwrap(southDrawer)).height = '';
        TP.elementGetStyleObj(TP.unwrap(this)).height = '';

    } else {
        //  Adjust the input size - by passing true here, we're anticipating
        //  animating the drawer.
        this.adjustInputSize(true);
    }

    return this;
}, {
    origin: 'south'
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineHandler('RemoveConsoleTab',
function(aSignal) {

    /**
     * @method handleRemoveConsoleTab
     * @summary Handles when the user clicked the 'close mark' on a particular
     *     tab to close it.
     * @param {TP.sig.RemoveConsoleTab} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.console} The receiver.
     */

    var tabItem,
        tabValue,

        editorTabEntries,
        editorTabValues,
        valueIndex,

        tabbar,
        newTabValue,

        panelBox,
        inspector;

    //  The tab item will be the parent of the signal's target (which is the
    //  'div' with the close mark on it).
    tabItem = TP.wrap(aSignal.getTarget().parentNode);

    //  Grab its value.
    if (TP.isValid(tabItem)) {
        tabValue = tabItem.get('value');
    }

    //  Find the entry matching the tab value in the console tab entries that we
    //  store in the profile.
    editorTabEntries =
        TP.uc('urn:tibet:sherpa_consoletabs').getResource().get('result');
    editorTabValues = editorTabEntries.collect(TP.RETURN_FIRST);
    valueIndex = editorTabValues.indexOf(tabValue);

    //  Remove the entry corresponding to that tab value.
    editorTabEntries.splice(valueIndex, 1);

    //  Tell the Shell to save the profile.
    TP.bySystemId('TSH').saveProfile();

    //  Remove the item from the tabbar matching that value.
    tabbar = TP.byId('SherpaConsoleTabbar', this.getNativeDocument());
    tabbar.removeItem(tabValue);

    //  Remove the item from the panelbox matching that value.
    panelBox = TP.byId('SherpaConsolePanelbox', this.getNativeDocument());
    panelBox.removePanel(tabValue);

    //  Grab the new tab value (which will have already been computed by the tab
    //  item removal code) and set the panel box to it.
    newTabValue = tabbar.get('value');
    panelBox.setValue(newTabValue);

    //  Repopulate the current bay in the inspector. That way, if the content
    //  that the tab was holding should now (again) be displayed in the
    //  inspector, it will be redisplayed.
    inspector = TP.byId('SherpaInspector', this.getNativeDocument());
    inspector.repopulateBay();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineHandler('SherpaReady',
function(aSignal) {

    /**
     * @method handleSherpaReady
     * @summary Handles notification of when the Sherpa has completely opened to
     *     its initial state and is ready for interaction.
     * @param {TP.sig.SherpaReady} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInputTPElem,
        readyHandler;

    consoleInputTPElem = this.get('consoleInput');

    if (!consoleInputTPElem.isReadyToRender()) {
        readyHandler = function() {
            readyHandler.ignore(consoleInputTPElem, 'TP.sig.DOMReady');
            if (consoleInputTPElem.isVisible()) {
                consoleInputTPElem.focus();
            }
        };

        readyHandler.observe(consoleInputTPElem, 'TP.sig.DOMReady');
    } else {
        if (consoleInputTPElem.isVisible()) {
            consoleInputTPElem.focus();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the underlying value of the tabbar selection of our
     *     tabbar editing changes.
     * @param {TP.sig.ValueChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.console} The receiver.
     */

    var editorTabEntries,

        len,
        i,
        entry,

        value,

        consoleInputTPElem;

    if (aSignal.getOrigin() === TP.uc('urn:tibet:sherpa_consoletabs')) {

        editorTabEntries =
            TP.uc('urn:tibet:sherpa_consoletabs').getResource().get('result');

        if (TP.notEmpty(editorTabEntries)) {
            len = editorTabEntries.getSize();

            for (i = 0; i < len; i++) {
                entry = editorTabEntries.at(i);
                this.createNewConsoleEditorFor(entry.first(), entry.last());
            }
        }

    } else {

        value = aSignal.getOrigin().getResource().get('result');

        //  If the new value is 'TSH', then we need to grab the console input
        //  and set up a timeout to refresh the editor and focus. This causes
        //  the embedded CodeMirror editor to redraw properly.
        if (value === 'TSH') {

            if (TP.isValid(consoleInputTPElem = this.get('consoleInput'))) {
                setTimeout(
                    function() {
                        if (consoleInputTPElem.isVisible()) {
                            consoleInputTPElem.focus();
                        }
                    }, 100);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineHandler('AddSnippet',
function(aSignal) {

    /**
     * @method handleAddSnippet
     * @summary Handles when the user wants to add a snippet.
     * @param {TP.sig.AddSnippet} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleService,
        cmdText;

    consoleService = TP.bySystemId('SherpaConsoleService');
    cmdText = this.getInputContent();

    if (TP.notEmpty(cmdText) && TP.isValid(consoleService)) {

        cmdText = ':snippet \'' + cmdText + '\'';

        consoleService.sendConsoleRequest(cmdText);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Other instance methods
//  ----------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.console} The receiver.
     */

    //  Adjust the input size *without* animating the drawer.
    this.adjustInputSize(false);

    //  This will refresh the new output counter. See the setter.
    this.set('newOutputCount', this.get('newOutputCount'));

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setAllowMouseCursorMovement',
function(shouldAllow) {

    /**
     * @method setAllowMouseCursorMovement
     * @summary Sets whether or not we're allowing our embedded editor to move
     *     the cursor via mouse events. Note that this will not prevent the
     *     editor from moving the cursor itself or the user from moving it with
     *     the keyboard.
     * @param {Boolean} shouldAllow Whether or not the editor should allow
     *     cursor movement with the mouse.
     * @returns {TP.sherpa.console} The receiver.
     */

    var evtNames,

        consoleInputTPElem,
        editorObj,

        stopper;

    this.$set('allowMouseCursorMovement', shouldAllow);

    evtNames = TP.ac('mousedown',
                        'dblclick',
                        'tripleclick',
                        'quadclick',
                        'click',
                        'mousemove');

    consoleInputTPElem = this.get('consoleInput');
    editorObj = consoleInputTPElem.$get('$editorObj');

    stopper = this.get('$aceEventStopper');

    if (TP.isTrue(shouldAllow)) {
        evtNames.forEach(
            function(name) {
                editorObj.off(name, stopper);
            });
    } else {
        evtNames.forEach(
            function(name) {
                editorObj.on(name, stopper);
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary Sets the 'hidden' attribute of the receiver. This method causes
     *     the console output to show or hide itself as well and manages
     *     activation and deactivation of the input cell.
     * @param {Boolean} beHidden Whether or not the console should be hidden.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var wasHidden,
        retVal;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return this;
    }

    if (TP.isTrue(beHidden)) {
        //  Clear the value
        this.clearInput();

        //  blur whatever was the active element. This makes sure that the input
        //  cell no longer has focus.
        this.getNativeDocument().activeElement.blur();

        this.get('consoleOutput').setAttribute('hidden', true);

        //  Execute the supertype's method and capture the return value *after*
        //  everything has hidden.
        retVal = this.callNextMethod();

    } else {

        //  Execute the supertype's method and capture the return value *before*
        //  everything has been shown.
        retVal = this.callNextMethod();

        this.get('consoleOutput').setAttribute('hidden', false);
    }

    return retVal;
});

//  ----------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setupConsoleService',
function() {

    /**
     * @method setupConsoleService
     * @summary Sets up the console service that the receiver interacts with to
     *     control user input and execution.
     * @returns {TP.sherpa.console} The receiver.
     */

    var tsh;

    tsh = TP.shell.TSH.getDefaultInstance();

    TP.sherpa.ConsoleService.construct(
        null,
        TP.hc('consoleModel', tsh,
                'consoleView', this));

    return this;
});

//  ------------------------------------------------------------------------
//  View Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clear',
function() {

    /**
     * @method clear
     * @summary Clears the receiver's content, removing all output and
     *     resetting the console input to an empty input field.
     * @returns {TP.sherpa.console} The receiver.
     */

    //  Clear both input and output.
    this.clearAllContent();

    //  Refocus the input cell and set its cursor to the end.
    this.focusInput();
    this.setInputCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearAllContent',
function() {

    /**
     * @method clearAllContent
     * @summary Clears both the input cell and the console output.
     * @returns {TP.sherpa.console} The receiver.
     */

    //  Clear the input and it's marks
    this.get('consoleInput').clearValue();

    //  Clear any status information that we automatically update for the user.
    this.clearStatus();

    //  Clear the output
    this.get('consoleOutput').clear();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setIndicatorAttribute',
function(indicatorName, indicatorAttrName, indicatorAttrVal) {

    /**
     * @method setIndicatorAttribute
     * @summary Sets the named attribute of the named indicator to the value
     *     supplied.
     * @param {String} indicatorName The name of the indicator element to set
     *     the attribute on.
     * @param {String} indicatorAttrName The name of the attribute on the
     *     indicator element to set the value of.
     * @param {String} indicatorAttrVal The value to set the attribute to.
     * @returns {TP.sherpa.console} The receiver.
     */

    var doc,
        indicatorTPElem;

    doc = this.getNativeDocument();
    if (TP.notValid(indicatorTPElem = TP.byCSSPath(
                    '*[name="' + indicatorName + '"]', doc, true))) {
        return this;
    }

    //  If the method was supplied null or undefined, then remove the attribute.
    if (TP.notValid(indicatorAttrVal)) {
        indicatorTPElem.removeAttribute(indicatorAttrName);
    } else {
        indicatorTPElem.setAttribute(indicatorAttrName, indicatorAttrVal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('toggleIndicatorVisibility',
function(indicatorName, shouldBeVisible) {

    /**
     * @method toggleIndicatorVisibility
     * @summary Toggles the named indicator's visibility.
     * @param {String} indicatorName The name of the indicator to toggle.
     * @param {Boolean} shouldBeVisible Whether or not the indicator should be
     *     visible.
     * @returns {TP.sherpa.console} The receiver.
     */

    var doc,
        indicatorTPElem;

    doc = this.getNativeDocument();
    if (TP.notValid(indicatorTPElem = TP.byCSSPath(
                    '*[name="' + indicatorName + '"]', doc, true))) {
        return this;
    }

    if (shouldBeVisible) {
        indicatorTPElem.show();
    } else {
        indicatorTPElem.hide();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setPrompt',
function(aPrompt, aCSSClass) {

    /**
     * @method setPrompt
     * @summary Sets the text prompt used for the input cell.
     * @param {String} aPrompt The prompt to define.
     * @param {String} aCSSClass An optional CSS class name to use for display
     *     of the prompt string.
     * @returns {TP.sherpa.console} The receiver.
     */

    //  TODO: Do something here.

    return this;
});

//  ------------------------------------------------------------------------
//  Status Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearStatus',
function(statusOutID) {

    /**
     * @method clearStatus
     * @summary Clears any status information in the status bar content,
     *     resetting it to the default state.
     * @param {String} statusOutID The ID of the status readout to clear.
     * @returns {TP.sherpa.console} The receiver.
     */

    /*
    var statID,

        hudWin,

        keyboardStatusTPElem,
        mouseStatusTPElem;

    statID = TP.ifEmpty(statusOutID, TP.ALL);

    hudWin = this.getNativeWindow();

    if (statID === 'keyboardInfo' || statID === TP.ALL) {
        keyboardStatusTPElem = TP.byId('keyboardReadout', hudWin);
        keyboardStatusTPElem.setRawContent('');
    }

    if (statID === 'mouseInfo' || statID === TP.ALL) {
        mouseStatusTPElem = TP.byId('mouseReadout', hudWin);
        mouseStatusTPElem.setRawContent('');
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('updateStatus',
function(aSignal, statusOutID) {

    /**
     * @method updateStatus
     * @summary Updates the status bar with information which is drawn from the
     *     current environment and the signal provided. The signal is typically
     *     a TP.sig.UserIOResponse containing information about the processing
     *     which just occurred.
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     * @param {String} statusOutID The ID of the status readout to update.
     * @returns {TP.sherpa.console} The receiver.
     */

    var statID,

        hudWin,

        timer,

        // canvasWin,

        str,
        arr,
        evt,

        keyCode,
        unicodeCharCode,

        hasModifier,

        keyboardStatusTPElem,
        mouseStatusTPElem,

        virtKey;

    statID = TP.ifEmpty(statusOutID, TP.ALL);

    hudWin = this.getNativeWindow();

    /*
    //  TODO: This was disabled in original version

    //  ---
    //  status context ID (execution window's global ID)
    //  ---

    if (statID === 'currentCanvasInfo' || statID === TP.ALL) {
        if (TP.isWindow(canvasWin = TP.sys.getUICanvas(true))) {
            str = TP.gid(canvasWin).sliceFrom('.', false, true);

            TP.byId('currentCanvasInfo', hudWin).setRawContent(str);
        }
    }

    //  ---
    //  logging level
    //  ---

    if (statID === 'logLevelInfo' || statID === TP.ALL) {
        str = TP.getLogLevel().getName() + '::' + APP.getLogLevel().getName();

        TP.byId('logLevelInfo', hudWin).setRawContent(str);
    }

    //  Note that we use $set() to manage the statusReadoutTimer here - this is
    //  a big performance win because the keyboard / mouse stuff is so
    //  performance intensive.

    //  Also, we use setTextContent() to update the controls.

    if (TP.isValid(timer = this.get('statusReadoutTimer'))) {
        clearTimeout(timer);
        this.$set('statusReadoutTimer', null, false);
    }

    //  TODO-END
    */

    keyboardStatusTPElem = TP.byId('keyboardReadout', hudWin);
    mouseStatusTPElem = TP.byId('mouseReadout', hudWin);

    //  ---
    //  keyboard key pressed
    //  ---

    if (statID === 'keyboardInfo' || statID === TP.ALL) {

        if (TP.canInvoke(aSignal, 'getEvent') &&
            TP.isEvent(evt = aSignal.getEvent())) {

            keyCode = TP.eventGetKeyCode(evt);
            unicodeCharCode = evt.$unicodeCharCode;

            arr = TP.ac();

            hasModifier = false;

            //  Sometimes the virtual key name will have 'Ctrl', 'Shift', etc.
            //  as part of the name - we don't want to repeat it. So we use this
            //  set of case-insensitive RegExps below.
            virtKey = TP.core.Keyboard.getVirtualKeyName(evt);
            if (!/Ctrl/i.test(virtKey)) {
                arr.push(TP.isTrue(aSignal.getCtrlKey()) ? 'Ctrl' : null);
                hasModifier = true;
            }
            if (!/Alt/i.test(virtKey)) {
                arr.push(TP.isTrue(aSignal.getAltKey()) ? 'Alt' : null);
                hasModifier = true;
            }
            if (!/Meta/i.test(virtKey)) {
                arr.push(TP.isTrue(aSignal.getMetaKey()) ? 'Meta' : null);
                hasModifier = true;
            }
            if (!/Shift/i.test(virtKey)) {
                arr.push(TP.isTrue(aSignal.getShiftKey()) ? 'Shift' : null);
                hasModifier = true;
            }

            if (hasModifier && TP.isEmpty(unicodeCharCode)) {
                return this;
            }

            arr.push(
                TP.core.Keyboard.getVirtualKeyName(evt),
                keyCode,
                unicodeCharCode);

            arr.compact();

            if (TP.isEmpty(arr.last())) {
                arr.pop();
            }

            str = arr.join(' : ');

            keyboardStatusTPElem.setTextContent(str);

            if (TP.isKindOf(aSignal, TP.sig.DOMKeyUp)) {
                timer = function() {
                    var lastMove;

                    this.$set('statusReadoutTimer', null, false);

                    lastMove = TP.core.Mouse.$get('lastMove');

                    if (TP.isEvent(lastMove) &&
                        TP.eventGetWindow(lastMove) ===
                        TP.sys.getUICanvas(true)) {
                        this.updateStatus(
                                TP.sig.DOMMouseMove.construct(lastMove),
                                'mouseInfo');
                    } else {
                        this.updateStatus(
                                null,
                                'mouseInfo');
                    }
                }.bind(this);

                setTimeout(
                    timer,
                    TP.sys.cfg('sherpa.readout_mouse_reset_time', 1000));

                this.$set('statusReadoutTimer', timer, false);
            }
        } else {
            keyboardStatusTPElem.empty();
        }
    }

    //  ---
    //  mouse move triggered
    //  ---

    if (statID === 'mouseInfo' || statID === TP.ALL) {

        if (TP.canInvoke(aSignal, 'getEvent') &&
            TP.isEvent(evt = aSignal.getEvent())) {

            if (TP.notValid(aSignal)) {
                str = '';
            } else {
                str = aSignal.getPageX() + ' :: ' + aSignal.getPageY();
            }

            mouseStatusTPElem.setTextContent(str);
        } else {
            mouseStatusTPElem.empty();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Input Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('adjustInputSize',
function(shouldAnimate) {

    /**
     * @method adjustInputSize
     * @summary Adjusts the height of the input cell based on its contents.
     * @param {Boolean} [shouldAnimate=false] True to animate the drawer that
     *     the console is placed in. By default, this is false to allow quick
     *     response when the drawer is 'closed' (i.e. in elastic mode).
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleDrawer,

        consoleInput,
        editorHeight,

        styleVals,

        drawerElement,
        drawerHeight,

        panelboxElem;

    consoleDrawer = TP.byId('south', this.getNativeDocument());

    if (!consoleDrawer.hasAttribute('pclass:closed')) {
        return this;
    }

    consoleInput = this.get('consoleInput');
    editorHeight = consoleInput.getEditorHeight();

    if (TP.notValid(this.get('$minEditorHeight'))) {
        this.set('$minEditorHeight', editorHeight);
    } else {
        editorHeight = editorHeight.max(this.get('$minEditorHeight'));
    }

    this.setHeight(editorHeight);

    drawerElement = TP.byId('south', this.getNativeWindow(), false);

    if (TP.isFalse(shouldAnimate)) {
        //  Set the south drawer to *not* transition. Note that it seems we have
        //  to do this by setting the style String directly as setting the
        //  'transition' property of the style object has no effect (at least on
        //  Chrome).
        TP.elementSetStyleString(drawerElement, 'transition: none');
    }

    //  We compute the drawer height from the editor height.
    drawerHeight = editorHeight;

    //  Grab the xctrls:panelbox element that we're contained in
    panelboxElem = TP.byCSSPath('> * xctrls|panelbox',
                                consoleDrawer,
                                true,
                                false);

    //  Add in the top, bottom, borderTop, borderBottom offsets from ourself.

    styleVals = TP.elementGetComputedStyleValuesInPixels(
                    panelboxElem,
                    TP.ac('borderTopWidth', 'borderBottomWidth',
                            'top', 'bottom'));

    drawerHeight += styleVals.at('top') +
                    styleVals.at('bottom') +
                    styleVals.at('borderBottomWidth') +
                    styleVals.at('borderTopWidth');

    //  Add the pixel widths of the top and bottom border from the inner div
    //  with class 'drawer' that holds all of the contents of the drawer.
    styleVals = TP.elementGetComputedStyleValuesInPixels(
                    drawerElement.firstElementChild,
                    TP.ac('borderTopWidth'));

    drawerHeight += styleVals.at('borderTopWidth');

    //  Add a 1-pixel fudge factor here.
    drawerHeight += 1;

    if (TP.notValid(this.get('$minDrawerHeight'))) {
        this.set('$minDrawerHeight', drawerHeight);
    } else {
        drawerHeight = drawerHeight.max(this.get('$minDrawerHeight'));
    }

    TP.elementSetHeight(drawerElement, drawerHeight);

    if (TP.isFalse(shouldAnimate)) {
        (function() {
            var styleStr,

                editorTPElem,
                editorObj;

            //  We can only do this after letting the GUI thread service,
            //  otherwise it has no effect.

            //  Set the style String to whatever it is minus the 'transition:
            //  none' value that we put on it above.
            styleStr = TP.elementGetStyleString(drawerElement);
            styleStr = styleStr.replace(/transition:\s*none;\s*/, '');

            TP.elementSetStyleString(drawerElement, styleStr);
            editorTPElem = TP.byCSSPath(
                                ' xctrls|codeeditor', drawerElement, true);
            editorObj = editorTPElem.$get('$editorObj');
            if (TP.isValid(editorObj)) {
                editorObj.resize();
            }

        }).queueForNextRepaint(this.getNativeWindow());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearInput',
function() {

    /**
     * @method clearInput
     * @summary Clears the input cell.
     * @returns {TP.sherpa.console} The receiver.
     */

    var editor;

    editor = this.get('consoleInput');
    if (TP.isValid(editor)) {
        return editor.clearValue();
    }

    //  Hide any 'pinned' items that are in 'growl' mode, but exposed. We do
    //  this by setting the output display mode to 'none'.
    if (this.get('consoleOutput').getAttribute('mode') === 'growl') {
        this.setOutputDisplayMode('none');
        this.get('consoleOutput').removeClass('fade_out');
    }

    //  End the autocomplete mode, if we're in it
    TP.signal(TP.ANY, 'TP.sig.EndAutocompleteMode');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('focusInput',
function(select) {

    /**
     * @method focusInput
     * @summary Focuses the input cell and optionally selects its contents.
     * @param {Boolean} select True to select in addition to focusing.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInputTPElem;

    consoleInputTPElem = this.get('consoleInput');

    if (!consoleInputTPElem.isVisible()) {
        return this;
    }

    //  We wrap this in a try...catch that does nothing because, on startup,
    //  it seems like the textfield isn't focusable on IE and this will
    //  throw an exception. It's not a big deal, except that this means that
    //  the text field will not focus on startup.
    try {
        if (select) {
            this.get('consoleInput').select();
        } else {
            this.get('consoleInput').focus();
        }
    } catch (e) {
        //  empty
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getInputContent',
function() {

    /**
     * @method getInputContent
     * @summary Returns the value currently considered the 'input value'.
     * @returns {String} The user's input.
     */

    var editor,
        inputText;

    editor = this.get('consoleInput');
    if (TP.isValid(editor)) {
        inputText = editor.getValue();
    } else {
        inputText = '';
    }

    return inputText;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setInputCursorToEnd',
function() {

    /**
     * @method setInputCursorToEnd
     * @summary Moves the cursor to the end.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInputTPElem;

    if (TP.isFalse(this.get('allowMouseCursorMovement'))) {
        return this;
    }

    consoleInputTPElem = this.get('consoleInput');

    if (!consoleInputTPElem.isVisible()) {
        return this;
    }

    consoleInputTPElem.setCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setInputContent',
function(anObject, shouldAppend) {

    /**
     * @method setInputContent
     * @summary Sets the value of the input cell, essentially 'pre-filling' the
     *     input area with content.
     * @param {Object} anObject The object defining the input.
     * @param {Boolean} shouldAppend Whether or not to append the value of
     *     anObject to any existing content.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInput,
        val;

    if (TP.isEmpty(anObject)) {
        this.clearInput();
        return this;
    }

    if (TP.isTrue(shouldAppend)) {
        val = this.getInputContent();
        val = val + TP.str(anObject);
    } else {
        val = TP.str(anObject);
    }

    consoleInput = this.get('consoleInput');
    consoleInput.setValue(val);

    //  Focus and set the cursor to the end on the next browser repaint.
    (function() {

        this.focusInput();
        this.setInputCursorToEnd();

    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------
//  Output display mode management methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('decreaseOutputDisplayMode',
function() {

    /**
     * @method decreaseOutputDisplayMode
     * @summary 'Decreases' the setting of the output display mode. This
     *     direction moves from 'all' to 'one' to 'growl'.
     * @returns {TP.sherpa.console} The receiver.
     */

    var outputModeVal,
        newOutputModeVal;

    //  Grab the current setting.
    outputModeVal = this.getOutputDisplayMode();

    //  Based on the current setting, 'decrease' the setting by one increment.
    switch (outputModeVal) {
        case 'all':
            newOutputModeVal = 'one';
            break;
        case 'one':
            newOutputModeVal = 'none';
            break;
        case 'none':
            //  Wrap around
            newOutputModeVal = 'all';
            break;
        default:
            break;
    }

    //  If we actually made a change, then the new output mode won't be empty.
    if (TP.notEmpty(newOutputModeVal)) {
        this.setOutputDisplayMode(newOutputModeVal);
    }

    //  This will refresh the new output counter. See the setter.
    this.set('newOutputCount', this.get('newOutputCount'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getOutputDisplayMode',
function() {

    /**
     * @method getOutputDisplayMode
     * @summary Returns the output display mode. This value will be one of:
     *     'all'
     *     'one'
     *     'growl'
     * @returns {String} The current output display mode.
     */

    return this.get('consoleOutput').getAttribute('mode');
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('increaseOutputDisplayMode',
function() {

    /**
     * @method increaseOutputDisplayMode
     * @summary 'Increases' the setting of the output display mode.
     *     This direction moves from 'growl' to 'one' to 'all'.
     * @returns {TP.sherpa.console} The receiver.
     */

    var outputModeVal,
        newOutputModeVal;

    //  Grab the current setting.
    outputModeVal = this.getOutputDisplayMode();

    //  Based on the current setting, 'decrease' the setting by one increment.
    switch (outputModeVal) {
        case 'none':
        case 'growl':
            newOutputModeVal = 'one';
            break;
        case 'one':
            newOutputModeVal = 'all';
            break;
        case 'all':
            //  Wrap around
            newOutputModeVal = 'none';
            break;
        default:
            break;
    }

    //  If we actually made a change, then the new output mode won't be empty.
    if (TP.notEmpty(newOutputModeVal)) {
        this.setOutputDisplayMode(newOutputModeVal);
    }

    //  This will refresh the new output counter. See the setter.
    this.set('newOutputCount', this.get('newOutputCount'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setOutputDisplayMode',
function(displayModeVal) {

    /**
     * @method setOutputDisplayMode
     * @summary Sets the output display mode.
     * @param {String} displayModeVal The new output display mode. This should
     *     be one of 'all', 'one', 'growl'.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleOutput,

        outputModeVal;

    consoleOutput = this.get('consoleOutput');

    //  Grab the current setting.
    outputModeVal = this.getOutputDisplayMode();

    //  If its been set to 'growl', then make sure to remove the 'fade_out'
    //  class. Otherwise, the output will continue to fade out no matter what
    //  our new setting is here.
    if (outputModeVal === 'growl') {
        consoleOutput.removeClass('fade_out');
    }

    //  Remove these management classes from the console output. They will be
    //  re-populated by machinery in the TP.sherpa.consoleoutput type as
    //  necessary.
    consoleOutput.removeAttribute('exposed');
    consoleOutput.removeAttribute('concealed');
    consoleOutput.removeAttribute('sticky');

    //  Set the console output's 'mode' attribute to our new display mode value.
    consoleOutput.setAttribute('mode', displayModeVal);

    //  If we're shifting to 'all' mode, make sure that the output is scrolled
    //  to the end.
    if (displayModeVal === 'all') {
        consoleOutput.scrollOutputToEnd();
    }

    //  Set our 'mode' attribute to our new display mode value.
    this.setIndicatorAttribute('outputmode', 'mode', displayModeVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('shouldCoalesceLogMessages',
function() {

    /**
     * @method shouldCoalesceLogMessages
     * @summary Whether or not to coalesce logging messages.
     * @returns {Boolean} Whether or not to coalesce logging messages.
     */

    var outputModeVal;

    //  If the Sherpa isn't open, then any logging messages were not produced by
    //  user input, so it's ok to coalesce logging messages no matter what our
    //  current display mode setting.
    if (!TP.sherpa.IDE.isOpen()) {
        return true;
    }

    //  Grab the current setting.
    outputModeVal = this.getOutputDisplayMode();

    //  Only coalesce log messages if our output mode is 'all'. Otherwise,
    //  logging messages will get hidden because it will be reusing items that
    //  are already hidden.
    return outputModeVal === 'all';
});

//  ------------------------------------------------------------------------
//  Output management methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('createOutputItem',
function(uniqueID, dataRecord) {

    /**
     * @method createOutputItem
     * @summary Creates an output item within the overall console output element
     *     that will be used to hold the output of a single command processed by
     *     the console (and very likely an underlying shell).
     * @param {String} uniqueID A unique ID that will be used to look up for an
     *     existing output item. This is usually supplied by the caller when the
     *     intent is to reuse an existing output item for a new command. In the
     *     case when an existing output item can be found, this method just
     *     returns without creating a new one.
     * @param {TP.core.Hash} dataRecord A hash containing the data that will be
     *     used for the output. At this stage, this includes:
     *          'hid'       The shell history ID
     *          'cssClass'  Any desired additional CSS classes *for the output
     *                      item itself* (the output content very well might
     *                      contain CSS classes to style it's output in a
     *                      special way).
     *          'cmdText'   The command that was executed to produce the output
     *                      that this item is being created for.
     * @returns {TP.sherpa.console} The receiver.
     */

    this.get('consoleOutput').createOutputItem(uniqueID, dataRecord);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('updateOutputItem',
function(uniqueID, dataRecord) {

    /**
     * @method updateOutputItem
     * @summary Updates the output item specified by the supplied unique ID with
     *     the data contained in the supplied data record.
     * @discussion The supplied unique ID will be used to look up an existing
     *     output item. If an output item does not exist with this ID, this
     *     method will try to create one using the createOutputItem(). If one
     *     still cannot be created, this method will raise an error.
     * @param {String} uniqueID A unique ID that will be used to look up for an
     *     existing output item.
     * @param {TP.core.Hash} dataRecord A hash containing the data that will be
     *     used for the output. At this stage, this includes:
     *          'hid'       The shell history ID
     *          'cssClass'  Any desired additional CSS classes *for the output
     *                      item itself* (the output content very well might
     *                      contain CSS classes to style it's output in a
     *                      special way).
     *          'cmdText'   The command that was executed to produce the output
     *                      that this item is being created for.
     *          'typeinfo'  Type information for the 'top-level' object that is
     *                      being output. This can also contain the semaphore
     *                      text of 'LOG' to let this method know that the data
     *                      being output is part of a logging sequence.
     *          'stats'     Execution statistics from the shell that indicate
     *                      how long it took to produce the output.
     *          'rawData'   The raw data produced by the shell. It is different
     *                      than the 'output' field in that 'output' may have
     *                      already undergone some kind of formatting through a
     *                      pipeline or some other mechanism. If 'output' is
     *                      empty, then this raw data is used as the visual
     *                      output.
     *          'output'    The fully formatted data. If this is empty, then the
     *                      content in 'rawData' is used.
     * @returns {TP.sherpa.console} The receiver.
     */

    this.get('consoleOutput').updateOutputItem(uniqueID, dataRecord);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('scrollOutputToEnd',
function() {

    /**
     * @method scrollOutputToEnd
     * @summary Adjust the height of the input cell based on its contents.
     * @returns {TP.sherpa.console} The receiver.
     */

    return this.get('consoleOutput').scrollOutputToEnd();
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setNewOutputCount',
function(outputCount) {

    /**
     * @method setNewOutputCount
     * @summary A setter for the number of output items that there currently are
     *     in total. This allows the output mode indicator to adjust to let the
     *     user know if there is more output that is being hidden because of the
     *     mode that they're in.
     * @param {Number} outputCount The number of output items in total.
     * @returns {TP.sherpa.console} The receiver.
     */

    var outputModeVal;

    this.$set('newOutputCount', outputCount);

    //  If the outputCount is 0, remove the 'newoutput' attribute and return.
    //  None of the modes need to show highlighting if the count is 0.
    if (outputCount === 0) {
        this.setIndicatorAttribute('outputmode', 'newoutput', null);
        return this;
    }

    //  From here on out, the outputCount is always at least 1

    outputModeVal = this.getOutputDisplayMode();

    switch (outputModeVal) {
        case 'none':
        case 'growl':
            //  If the current mode is 'none'/'growl', then we always need to
            //  highlight
            this.setIndicatorAttribute('outputmode', 'newoutput', true);
            break;
        case 'one':

            //  If the current mode is 'one', and we have more than 1 new output
            //  item, then we need to highlight. Otherwise, we make sure that
            //  the highlight is turned off.
            if (outputCount > 1) {
                this.setIndicatorAttribute('outputmode', 'newoutput', true);
            } else {
                this.setIndicatorAttribute('outputmode', 'newoutput', null);
            }
            break;
        case 'all':
            //  If the current mode is 'all', then we just leave the counter
            //  alone and we make sure that the newoutput prompt indicator
            //  attribute is removed
            this.setIndicatorAttribute('outputmode', 'newoutput', null);
            break;
        default:
            break;
    }

    return this;
});

//  ========================================================================
//  end
//  ========================================================================
