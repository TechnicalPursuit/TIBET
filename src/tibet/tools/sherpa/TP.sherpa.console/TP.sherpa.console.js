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

//  should IO be concealed? this is used to simulate "password" mode
TP.sherpa.console.Inst.defineAttribute('conceal', false);

//  Is the command line currently concealed from view?
TP.sherpa.console.Inst.defineAttribute('concealedInput');

TP.sherpa.console.Inst.defineAttribute('consoleInput',
    TP.cpc('xctrls|codeeditor#SherpaConsoleInput',
        TP.hc('shouldCollapse', true)));

TP.sherpa.console.Inst.defineAttribute('consoleOutput');

TP.sherpa.console.Inst.defineAttribute('currentEvalMarker');
TP.sherpa.console.Inst.defineAttribute('evalMarkAnchorMatcher');

TP.sherpa.console.Inst.defineAttribute('currentInputMarker');

TP.sherpa.console.Inst.defineAttribute('currentCompletionMarker');

//  The number of 'new' items since we evaluated last
TP.sherpa.console.Inst.defineAttribute('newOutputCount');

//  A timer that will flip the status readout back to mouse coordinates after a
//  period of time.
TP.sherpa.console.Inst.defineAttribute('statusReadoutTimer');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInputTPElem,

        editorObj,

        contentTPElem,

        consoleOutputTPElem,

        hudTPElem,

        isHidden,

        consoleDrawerTPElem;

    consoleInputTPElem = this.get('consoleInput');

    //  Make sure to observe setup on the console input here, because it won't
    //  be fully formed when this line is executed.

    editorObj = consoleInputTPElem.$get('$editorObj');

    editorObj.setOption('theme', 'elegant');
    editorObj.setOption('mode', 'javascript');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', true);
    editorObj.setOption('viewportMargin', Infinity);
    editorObj.setOption('electricChars', false);
    editorObj.setOption('smartIndent', false);
    editorObj.setOption('autofocus', true);
    editorObj.setOption('matchBrackets', true);

    //  Note that we define the same key multiple times for expository purposes.
    //  CodeMirror doesn't seem to care.

    /* eslint-disable no-dupe-keys,quote-props,key-spacing */
    editorObj.setOption(
        'extraKeys',
        {
            //  NB: These should match keys that are used by the console in
            //  TP.sherpa.ConsoleService

            //  Normal mode
            'Shift-Enter'       : TP.RETURN_TRUE,   //  Accept raw input

            'Shift-Up'          : TP.RETURN_TRUE,   //  Previous history
            'Shift-Down'        : TP.RETURN_TRUE,   //  Next history

            'Ctrl-U'            : TP.RETURN_TRUE,   //  Clear input
            'Ctrl-K'            : TP.RETURN_TRUE,   //  Clear output

            'Shift-Esc'         : TP.RETURN_TRUE,   //  Cancel process

            'PageDown'          : TP.RETURN_TRUE,   //  Scroll page down
            'PageUp'            : TP.RETURN_TRUE,   //  Scroll page up

            'Ctrl-Up'           : TP.RETURN_TRUE,   //  Change output mode
            'Ctrl-Down'         : TP.RETURN_TRUE,   //  Change output mode

            //  Eval mark mode
            'Shift-Up'          : TP.RETURN_TRUE,   //  Move Anchor Up
            'Shift-Right'       : TP.RETURN_TRUE,   //  Move Anchor Right
            'Shift-Down'        : TP.RETURN_TRUE,   //  Move Anchor Down
            'Shift-Left'        : TP.RETURN_TRUE,   //  Move Anchor Left

            'Shift-Alt-Up'      : TP.RETURN_TRUE,   //  Move Head Up
            'Shift-Alt-Right'   : TP.RETURN_TRUE,   //  Move Head Right
            'Shift-Alt-Down'    : TP.RETURN_TRUE,   //  Move Head Down
            'Shift-Alt-Left'    : TP.RETURN_TRUE,   //  Move Head Left

            //  Help mode
            'Esc'               : TP.RETURN_TRUE,   //  Exit mode

            //  History mode
            'Esc'               : TP.RETURN_TRUE,   //  Exit mode

            //  Autocomplete mode
            'Ctrl-A'            : TP.RETURN_TRUE,   //  Enter mode
            'Esc'               : TP.RETURN_TRUE,   //  Exit mode

            //  'growl mode expose/conceal' key handlers
            'Space'             :
                function() {

                    var currentEditorVal,

                        consoleOutput,
                        mode;

                    //  This should only work if the input is empty.
                    currentEditorVal = consoleInputTPElem.getValue();
                    if (TP.notEmpty(currentEditorVal)) {
                        return TP.extern.CodeMirror.Pass;
                    }

                    consoleOutput = this.get('consoleOutput');

                    mode = consoleOutput.getAttribute('mode');

                    //  If we're not showing cells at all, then set the mode to
                    //  growl and force toggle the display to expose the last
                    //  cell.
                    if (mode === 'none') {
                        consoleOutput.setAttribute('mode', 'growl');
                        consoleOutput.growlModeForceDisplayToggle();

                        //  Return false so that CodeMirror will *not* process
                        //  this as a regular keystroke.
                        return false;
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

                        //  Return false so that CodeMirror will *not* process
                        //  this as a regular keystroke.
                        return false;
                    }

                    return TP.extern.CodeMirror.Pass;
                }.bind(this),

            'Shift-Space'       :
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

                        //  Return false so that CodeMirror will *not* process
                        //  this as a regular keystroke.
                        return false;
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

                        //  Return false so that CodeMirror will *not* process
                        //  this as a regular keystroke.
                        return false;
                    }
                    return TP.extern.CodeMirror.Pass;
                }.bind(this),

            //  Scroll long output items
            'Down'              :
                function() {
                    return TP.extern.CodeMirror.Pass;
                },

            'Up'                :
                function() {
                    return TP.extern.CodeMirror.Pass;
                }
        });

    /* eslint-enable no-dupe-keys,quote-props,key-spacing */

    //  A CodeMirror-specific event handler that triggers when its viewport
    //  changes. In that case, we adjust our input size.
    consoleInputTPElem.setEditorEventHandler('viewportChange',
            function() {
                //  Adjust the input size *without* animating the drawer.
                this.adjustInputSize(false);
            }.bind(this));

    //  Grab the consoleOutput TP.core.Element and set it up. Note that we need
    //  to do this *after* we set up the console input above.
    consoleOutputTPElem = TP.byId('SherpaConsoleOutput', TP.win('UIROOT'));
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
    consoleDrawerTPElem = TP.byId('south', TP.win('UIROOT'));
    this.observe(consoleDrawerTPElem, 'ClosedChange');

    return this;
});

//  ------------------------------------------------------------------------
//  Marker retrieval methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getCurrentEvalMarker',
function() {

    /**
     * @method getCurrentEvalMarker
     * @summary Returns the input cell's current 'eval marker'.
     * @returns {Object} An Object specific to CodeMirror that represents a
     *     'mark'.
     */

    var marker;

    if (TP.notValid(marker = this.$get('currentEvalMarker'))) {
        return null;
    }

    //  If the marker cannot be 'resolved', then clear it and clear it's caching
    //  variable.
    if (TP.notValid(marker.find())) {
        marker.clear();
        this.set('currentEvalMarker', null);

        return null;
    }

    return marker;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getCurrentInputMarker',
function() {

    /**
     * @method getCurrentInputMarker
     * @summary Returns the input cell's current 'input marker'.
     * @returns {Object} An Object specific to CodeMirror that represents a
     *     'mark'.
     */

    var marker;

    if (TP.notValid(marker = this.$get('currentInputMarker'))) {
        return null;
    }

    //  If the marker cannot be 'resolved', then clear it and clear it's caching
    //  variable.
    if (TP.notValid(marker.find())) {
        marker.clear();
        this.set('currentInputMarker', null);

        return null;
    }

    return marker;
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

        var consoleInput;

        //  Turn off any future notifications.
        drawerIsOpenFunc.ignore(southDrawer, 'TP.sig.DOMTransitionEnd');

        if (TP.isValid(consoleInput = this.get('consoleInput'))) {
            consoleInput.refreshEditor();
            consoleInput.focus();
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

TP.sherpa.console.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary
     * @param {TP.sig.ValueChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.console} The receiver.
     */

    var value,

        consoleInput;

    value = aSignal.getOrigin().getResource().get('result');

    if (value === 'TSH') {
        if (TP.isValid(consoleInput = this.get('consoleInput'))) {
            consoleInput.refreshEditor();
            setTimeout(
                function() {
                    consoleInput.refreshEditor();
                    consoleInput.focus();
                }, 100);
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

    var consoleInput;

    if (TP.isValid(consoleInput = this.get('consoleInput'))) {
        consoleInput.refreshEditor();
    }

    //  Adjust the input size *without* animating the drawer.
    this.adjustInputSize(false);

    //  This will refresh the new output counter. See the setter.
    this.set('newOutputCount', this.get('newOutputCount'));

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

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
     * @returns {TP.sherpa.console} The receiver.
     */

    var wasHidden,

        consoleInput,
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

        //  deactivate the input cell
        this.deactivateInputEditor();

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

        consoleInput = this.get('consoleInput');
        consoleInput.focus();

        //  activate the input cell
        this.activateInputEditor();
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

    tsh = TP.core.TSH.getDefaultInstance();

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

    this.teardownInputMark();
    this.teardownEvalMark();

    //  Clear any status information that we automatically update for the user.
    this.clearStatus();

    //  Clear the output
    this.get('consoleOutput').clear();

    return this;
});

//  ------------------------------------------------------------------------
//  Completion Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('generateCompletionMarkAt',
function(aRange, completionContent) {

    /**
     * @method generateCompletionMarkAt
     * @summary Generates a CodeMirror 'mark' at the supplied range with the
     *     supplied content for use by the 'autocomplete' functionality.
     * @param {Object} aRange An object specific to CodeMirror that represents a
     *     textual 'range'.
     * @param {String} completionContent The XHTML content to place within the
     *     'mark'.
     * @returns {Object} An Object specific to CodeMirror that represents a
     *     'mark'.
     */

    var doc,
        elem,
        marker;

    doc = this.getNativeDocument();

    elem = TP.documentConstructElement(doc, 'span', TP.w3.Xmlns.XHTML);
    TP.elementSetClass(elem, 'completion-mark');
    TP.xmlElementSetContent(elem, TP.xmlEntitiesToLiterals(completionContent));

    marker = this.get('consoleInput').$get('$editorObj').markText(
        aRange.anchor,
        aRange.head,
        {
            atomic: true,
            readOnly: true,
            replacedWith: elem,
            clearWhenEmpty: false,
            inclusiveLeft: false,
            inclusiveRight: true    //  don't allow the cursor to be placed
                                    //  after the completion mark
        }
    );

    return marker;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('teardownCompletionMark',
function() {

    /**
     * @method teardownCompletionMark
     * @summary Tears down the 'completion mark' by clearing it and resetting
     *     it's caching instance variable.
     * @returns {TP.sherpa.console} The receiver.
     */

    var marker;

    if (TP.isValid(marker = this.get('currentCompletionMarker'))) {
        marker.clear();

        this.set('currentCompletionMarker', null);
    }

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

    /*
    var statID,

        hudWin,

        timer,

        // canvasWin,

        str,
        arr,
        evt,

        keyboardStatusTPElem,
        mouseStatusTPElem,

        virtKey;

    statID = TP.ifEmpty(statusOutID, TP.ALL);

    hudWin = this.getNativeWindow();

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

    keyboardStatusTPElem = TP.byId('keyboardReadout', hudWin);
    mouseStatusTPElem = TP.byId('mouseReadout', hudWin);

    //  ---
    //  keyboard key pressed
    //  ---

    if (statID === 'keyboardInfo' || statID === TP.ALL) {

        if (TP.canInvoke(aSignal, 'getEvent') &&
            TP.isEvent(evt = aSignal.getEvent())) {

            arr = TP.ac();

            //  Sometimes the virtual key name will have 'Ctrl', 'Shift', etc.
            //  as part of the name - we don't want to repeat it. So we use this
            //  set of case-insensitive RegExps below.
            virtKey = TP.core.Keyboard.getEventVirtualKey(evt);
            if (!/Ctrl/i.test(virtKey)) {
                arr.push(TP.isTrue(aSignal.getCtrlKey()) ? 'Ctrl' : null);
            }
            if (!/Alt/i.test(virtKey)) {
                arr.push(TP.isTrue(aSignal.getAltKey()) ? 'Alt' : null);
            }
            if (!/Meta/i.test(virtKey)) {
                arr.push(TP.isTrue(aSignal.getMetaKey()) ? 'Meta' : null);
            }
            if (!/Shift/i.test(virtKey)) {
                arr.push(TP.isTrue(aSignal.getShiftKey()) ? 'Shift' : null);
            }

            arr.push(
                TP.core.Keyboard.getEventVirtualKey(evt),
                TP.eventGetKeyCode(evt),
                evt.$unicodeCharCode);
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

                }.bind(this).fork(      //  TODO: fork is obsolete. redo.
                    TP.ifInvalid(
                        TP.sys.cfg('sherpa.readout_mouse_reset_time'),
                        1000));
                this.$set('statusReadoutTimer', timer, false);
            }
        } else {
            keyboardStatusTPElem.clearTextContent();
        }

        mouseStatusTPElem.hide();
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
            mouseStatusTPElem.clearTextContent();
        }

        mouseStatusTPElem.show();
    }
    */

    return this;
});

//  ------------------------------------------------------------------------
//  Input Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('activateInputEditor',
function() {

    /**
     * @method activateInputEditor
     * @summary Activates the input editor by setting up some of its necessary
     *     low-level key handlers, etc.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInput;

    consoleInput = this.get('consoleInput');

    consoleInput.setKeyHandler(
            function(evt) {

                if (TP.notValid(this.get('currentInputMarker'))) {

                    this.setupInputMarkForExistingContent();
                }

                return TP.core.Keyboard.$$handleKeyEvent(evt);
            }.bind(this));

    return this;
});

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

    consoleDrawer = TP.byId('south', TP.win('UIROOT'));

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

    styleVals = TP.elementGetComputedStyleValuesInPixels(
                    this.getNativeNode(),
                    TP.ac('paddingTop', 'paddingBottom'));

    //  We compute the drawer height from the editor height.
    drawerHeight = editorHeight;

    //  Add in the padding offsets from ourself.
    drawerHeight += styleVals.at('paddingTop') + styleVals.at('paddingBottom');

    //  Grab the xctrls:panelbox element that we're contained in
    panelboxElem = TP.byCSSPath('xctrls|panelbox', consoleDrawer, true, false);

    //  Add in the top, bottom, borderTop, borderBottom offsets from ourself.

    styleVals = TP.elementGetComputedStyleValuesInPixels(
                    panelboxElem,
                    TP.ac('borderTopWidth', 'borderBottomWidth',
                            'top', 'bottom'));

    drawerHeight += styleVals.at('top') +
                    styleVals.at('bottom') +
                    styleVals.at('borderBottomWidth') +
                    styleVals.at('borderTopWidth');

    //  Add a 1-pixel fudge factor here. This is probably compensating for the
    //  fact that the xctrls:codeeditor has a 1 pixel margin on top and bottom
    //  or that the CodeMirror code imposes some sort of overlap.
    drawerHeight += 1;

    if (TP.notValid(this.get('$minDrawerHeight'))) {
        this.set('$minDrawerHeight', drawerHeight);
    } else {
        drawerHeight = drawerHeight.max(this.get('$minDrawerHeight'));
    }

    TP.elementSetHeight(drawerElement, drawerHeight);

    if (TP.isFalse(shouldAnimate)) {
        (function() {
            var styleStr;

            //  We can only do this after letting the GUI thread service,
            //  otherwise it has no effect.

            //  Set the style String to whatever it is minus the 'transition:
            //  none' value that we put on it above.
            styleStr = TP.elementGetStyleString(drawerElement);
            styleStr = styleStr.replace(/transition:\s*none;\s*/, '');

            TP.elementSetStyleString(drawerElement, styleStr);
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

    var marker,
        editor,

        range;

    if (TP.notValid(marker = this.get('currentInputMarker'))) {
        this.setupInputMarkForExistingContent();
        marker = this.get('currentInputMarker');
    }

    if (TP.notValid(marker)) {
        return this;
    }

    editor = this.get('consoleInput').$get('$editorObj');
    range = marker.find();

    editor.setSelection(range.from, range.to);
    editor.replaceSelection('');

    this.teardownInputMark();

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

TP.sherpa.console.Inst.defineMethod('deactivateInputEditor',
function() {

    /**
     * @method deactivateInputEditor
     * @summary Deactivates the input editor by tearing down some of its
     *     necessary low-level key handlers, etc.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInput;

    consoleInput = this.get('consoleInput');

    consoleInput.unsetCurrentKeyHandler();

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

    var inputText,

        marker,

        editor,
        range;

    inputText = null;

    //  First, see if we have a valid eval mark.
    if (TP.isValid(marker = this.get('currentEvalMarker'))) {
        //  empty
    } else if (TP.isValid(marker = this.get('currentInputMarker'))) {
        //  empty
    } else {
        return '';
    }

    //  Find the marker in the input and grab its text.
    range = marker.find();
    editor = this.get('consoleInput').$get('$editorObj');
    inputText = editor.getRange(range.from, range.to);

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

    this.get('consoleInput').setCursorToEnd();

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

        val,

        editor,
        marker,

        range,

        start,
        end;

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
    editor = consoleInput.$get('$editorObj');

    if (TP.isValid(marker = this.get('currentInputMarker'))) {

        range = marker.find();
        start = range.from;

        editor.setSelection(range.from, range.to);
        editor.replaceSelection(val);

        end = consoleInput.getCursor();

        this.teardownInputMark();
    }

    if (TP.notValid(range)) {

        start = consoleInput.getCursor();

        consoleInput.insertAtCursor(val);

        end = consoleInput.getCursor();
    }

    //  Reset the current input marker to encompass all of the new content.
    this.set('currentInputMarker',
                this.generateInputMarkAt(
                    {
                        anchor: start,
                        head: end
                    }));

    //  Focus and set the cursor to the end on the next browser repaint.
    (function() {

        this.focusInput();
        this.setInputCursorToEnd();

    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setupInputMarkForExistingContent',
function() {

    /**
     * @method setupInputMarkForExistingContent
     * @summary Sets up a CodeMirror 'mark' that tracks the input cell's current
     *     input.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInput,

        end;

    if (TP.isValid(this.get('currentInputMarker'))) {
        this.teardownInputMark();
    }

    consoleInput = this.get('consoleInput');

    end = consoleInput.getCursor();

    this.set('currentInputMarker',
                this.generateInputMarkAt(
                    {
                        anchor: {
                            line: 0, ch: 0
                        },
                        head: end
                    }));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('teardownInputMark',
function() {

    /**
     * @method teardownInputMark
     * @summary Tears down the 'input mark' by clearing it and resetting
     *     it's caching instance variable.
     * @returns {TP.sherpa.console} The receiver.
     */

    if (TP.isValid(this.get('currentInputMarker'))) {
        this.get('currentInputMarker').clear();
        this.set('currentInputMarker', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('generateInputMarkAt',
function(aRange) {

    /**
     * @method generateInputMarkAt
     * @summary Generates a CodeMirror 'mark' at the supplied range that tracks
     *     the input cell's current input.
     * @param {Object} aRange An object specific to CodeMirror that represents a
     *     textual 'range'.
     * @returns {Object} An Object specific to CodeMirror that represents a
     *     'mark'.
     */

    var marker;

    marker = this.get('consoleInput').$get('$editorObj').markText(
        aRange.anchor,
        aRange.head,
        {
            className: 'input-mark',
            startStyle: 'input-mark-left',
            endStyle: 'input-mark-right',
            atomic: false,
            inclusiveLeft: true,
            inclusiveRight: true
        }
    );

    return marker;
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
    if (!TP.core.Sherpa.isOpen()) {
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

    this.teardownInputMark();

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

//  ------------------------------------------------------------------------
//  Eval marking/value retrieval (EXPERIMENTAL)
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('computeEvalMarkRangeAnchor',
function() {

    /**
     * @method computeEvalMarkRangeAnchor
     */

    var editor,

        head,

        matcher,

        searchCursor,
        retVal;

    editor = this.get('consoleInput').$get('$editorObj');

    //  Look for the following, in this order (at the beginning of a line)
    //      - The current prompt (preceded by zero-or-more whitespace)
    //      - A newline
    //      - One of the TSH characters
    head = editor.getCursor();

    if (!TP.isRegExp(matcher = this.get('evalMarkAnchorMatcher'))) {
        matcher = TP.rc('^(\\s*' +
                        '\\n' + '|' +
                        TP.regExpEscape(TP.TSH_OPERATOR_CHARS) +
                        ')');
        this.set('evalMarkAnchorMatcher', matcher);
    }

    searchCursor = editor.getSearchCursor(matcher, head);

    if (searchCursor.findPrevious()) {
        //  We want the 'to', since that's the end of the '^\s*>' match
        retVal = searchCursor.to();
    } else {
        //  Couldn't find a starting '>', so we just use the beginning of
        //  the editor
        retVal = {
            line: 0,
            ch: 0
        };
    }

    /*
    //  See if there are any output marks between the anchor and head
    marks = this.findOutputMarks(retVal, head);
    if (marks.length > 0) {
        retVal = marks[marks.length - 1].find().to;
    }

    //  If the 'ch' is at the end of the line, increment the line and set
    //  the 'ch' to 0
    lineInfo = editor.lineInfo(retVal.line);

    //  If we matched one of the TSH operator characters then it was a TSH
    //  command and we want that character included.
    if (lineInfo.text.contains(TP.TSH_OPERATOR_CHARS)) {
        retVal.ch -= 1;
    }

    if (retVal.ch === lineInfo.text.length) {
        retVal = {line: Math.min(retVal.line + 1, editor.lastLine()),
                    ch: 0};
    }
    */

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('computeEvalMarkRangeHead',
function() {

    /**
     * @method computeEvalMarkRangeHead
     */

    var editor,

        anchor,
        searchCursor,
        lineInfo,
        retVal;

    editor = this.get('consoleInput').$get('$editorObj');

    anchor = editor.getCursor();
    searchCursor = editor.getSearchCursor(/^(\s*<|\n)/, anchor);

    if (searchCursor.findNext()) {
        //  We want the 'from', since that's the start of the '^\s*<' match
        retVal = searchCursor.from();
    } else {
        //  Couldn't find an ending '<', so we just use the end of the editor
        lineInfo = editor.lineInfo(editor.lastLine());
        retVal = {
            line: lineInfo.line,
            ch: lineInfo.text.length
        };
    }

    /*
    //  See if there are any output marks between the anchor and head
    marks = this.findOutputMarks(anchor, retVal);
    if (marks.length > 0) {
        retVal = marks[0].find().from;
    }

    //  If the 'ch' is at the beginning of the line, decrement the line and set
    //  the 'ch' to end of the line
    if (retVal.ch === 0) {
        lineInfo = editor.lineInfo(retVal.line - 1);
        retVal = {'line': Math.max(retVal.line - 1, 0),
                    'ch': lineInfo.text.length};
    }
    */

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('computeEvalMarkRange',
function() {

    /**
     * @method computeEvalMarkRange
     */

    var editor,

        selection,
        range;

    editor = this.get('consoleInput').$get('$editorObj');

    //  If there are real selections, then just use the first one
    selection = editor.getSelection();
    if (selection.length > 0) {
        return editor.listSelections()[0];
    }

    range = {
        anchor: this.computeEvalMarkRangeAnchor(),
        head: this.computeEvalMarkRangeHead()
    };

    return range;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('generateEvalMarkAt',
function(range) {

    /**
     * @method generateEvalMarkAt
     */

    var marker;

    marker = this.get('consoleInput').$get('$editorObj').markText(
        range.anchor,
        range.head,
        {
            className: 'eval-mark',
            startStyle: 'eval-mark-left',
            endStyle: 'eval-mark-right',
            atomic: true,
            inclusiveLeft: false,
            inclusiveRight: false
        }
    );

    return marker;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('transitionToSeparateEvalMarker',
function() {

    /**
     * @method transitionToSeparateEvalMarker
     * @summary Transitions from using just the input marker to having a
     *     separate eval marker. This is used when the user wants to evaluate
     *     only a portion of what is in the input cell.
     * @returns {TP.sherpa.console} The receiver.
     */

    var currentInputRange,
        newEvalRange;

    //  If the text input is empty, there is no reason to setup anything... exit
    //  here.
    if (TP.isEmpty(this.get('consoleInput').getValue())) {
        return this;
    }

    //  If we have a valid input marker, then we use it to set up the eval
    //  marker.
    if (TP.isValid(this.get('currentInputMarker'))) {
        if (TP.isValid(
                currentInputRange = this.get('currentInputMarker').find())) {

            newEvalRange = {
                anchor: currentInputRange.from,
                head: currentInputRange.to
            };

            this.set('currentEvalMarker',
                        this.generateEvalMarkAt(newEvalRange));
        }
    }

    //  If we still don't have an eval marker, that means that we didn't have a
    //  valid input marker - set them both up here using the same range.
    if (TP.notValid(this.get('currentEvalMarker'))) {

        newEvalRange = this.computeEvalMarkRange();

        this.set('currentInputMarker',
                    this.generateInputMarkAt(
                        {
                            anchor: newEvalRange.anchor,
                            head: newEvalRange.head
                        }));
        this.set('currentEvalMarker', this.generateEvalMarkAt(newEvalRange));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('showingEvalMark',
function() {

    /**
     * @method showingEvalMark
     */

    return TP.isValid(this.get('currentEvalMarker'));
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('shiftEvalMark',
function(direction, endPoint) {

    /**
     * @method shiftEvalMark
     */

    var currentEvalMarker,

        cimRange,

        editor,
        currentLineInfo,
        lastLineInfo;

    if (TP.notValid(currentEvalMarker = this.get('currentEvalMarker'))) {
        return this;
    }

    cimRange = currentEvalMarker.find();

    editor = this.get('consoleInput').$get('$editorObj');

    lastLineInfo = editor.lineInfo(editor.lastLine());

    cimRange.anchor = cimRange.from;
    cimRange.head = cimRange.to;

    if (direction === TP.LEFT) {

        if (endPoint === TP.HEAD) {
            if (cimRange.anchor.line === cimRange.head.line &&
                cimRange.head.ch === cimRange.anchor.ch + 1) {
                return this;
            }
        } else {

            if (cimRange.anchor.line === 0 &&
                cimRange.anchor.ch === 0) {
                return this;
            }

            if (cimRange.anchor.line === cimRange.head.line &&
                cimRange.anchor.ch === cimRange.head.ch + 1) {
                return this;
            }
        }

        if (cimRange[endPoint].ch === 0) {

            //  If the line isn't 0, jump to the previous line
            if (cimRange[endPoint].line !== 0) {
                cimRange[endPoint].line = Math.max(
                                        cimRange[endPoint].line - 1,
                                        0);
                currentLineInfo = editor.lineInfo(
                                        cimRange[endPoint].line);
                cimRange[endPoint].ch = currentLineInfo.text.length - 1;
            }
        } else {
            cimRange[endPoint].ch -= 1;
        }
    }

    if (direction === TP.RIGHT) {

        if (endPoint === TP.HEAD) {
            if (cimRange.head.line === lastLineInfo.line &&
                cimRange.head.ch === lastLineInfo.ch) {
                return this;
            }

            if (cimRange.anchor.line === cimRange.head.line &&
                cimRange.head.ch === cimRange.anchor.ch - 1) {
                return this;
            }
        } else {
            if (cimRange.anchor.line === cimRange.head.line &&
                cimRange.anchor.ch === cimRange.head.ch - 1) {
                return this;
            }
        }

        currentLineInfo = editor.lineInfo(
                                cimRange[endPoint].line);

        if (cimRange[endPoint].ch === currentLineInfo.text.length - 1) {
            //  If the line isn't the last, jump to the next line
            if (cimRange[endPoint].line !== lastLineInfo.line) {
                cimRange[endPoint].line = Math.min(
                                        cimRange[endPoint].line + 1,
                                        lastLineInfo.line);
                cimRange[endPoint].ch = 0;
            } else {
                //  Otherwise, let the very last character be selected
                cimRange[endPoint].ch += 1;
            }
        } else {
            cimRange[endPoint].ch += 1;
        }
    }

    if (direction === TP.UP) {

        if (endPoint === TP.HEAD) {
            if (cimRange.head.line === cimRange.anchor.line) {
                return this;
            }
        }

        if (cimRange[endPoint].line === 0) {
            return this;
        }

        cimRange[endPoint].line -= 1;
    }

    if (direction === TP.DOWN) {

        if (endPoint !== TP.HEAD) {
            if (cimRange.anchor.line === cimRange.head.line) {
                return this;
            }
        }

        if (cimRange[endPoint].line === lastLineInfo.line) {
            return this;
        }

        cimRange[endPoint].line += 1;
    }

    currentEvalMarker.clear();

    this.set('currentEvalMarker', this.generateEvalMarkAt(cimRange));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('teardownEvalMark',
function() {

    /**
     * @method teardownEvalMark
     */

    if (TP.isValid(this.get('currentEvalMarker'))) {
        this.get('currentEvalMarker').clear();
        this.set('currentEvalMarker', null);
    }

    return this;
});

//  ========================================================================
//  end
//  ========================================================================
