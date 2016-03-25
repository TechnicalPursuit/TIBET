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

//  should IO be concealed? this is used to simulate "password" mode
TP.sherpa.console.Inst.defineAttribute('conceal', false);

//  Is the command line currently concealed from view?
TP.sherpa.console.Inst.defineAttribute('concealedInput');

TP.sherpa.console.Inst.defineAttribute(
        'consoleInput',
        {value: TP.cpc('xctrls|codeeditor#SherpaConsoleInput',
                                TP.hc('shouldCollapse', true))});

TP.sherpa.console.Inst.defineAttribute('consoleOutput');

TP.sherpa.console.Inst.defineAttribute('searcherTile');

TP.sherpa.console.Inst.defineAttribute('currentEvalMarker');
TP.sherpa.console.Inst.defineAttribute('evalMarkAnchorMatcher');

TP.sherpa.console.Inst.defineAttribute('currentInputMarker');

TP.sherpa.console.Inst.defineAttribute('currentCompletionMarker');

TP.sherpa.console.Inst.defineAttribute('currentPromptMarker');

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
     */

    var consoleInputTPElem,

        editorObj,

        contentTPElem,

        consoleOutputTPElem,

        hudTPElem,

        isHidden;

    consoleInputTPElem = this.get('consoleInput');

    //  Make sure to observe setup on the console input here, because it won't
    //  be fully formed when this line is executed.

    editorObj = consoleInputTPElem.$get('$editorObj');

    editorObj.setOption('theme', 'elegant');
    editorObj.setOption('mode', 'javascript');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', false);
    editorObj.setOption('viewportMargin', Infinity);
    editorObj.setOption('electricChars', false);
    editorObj.setOption('smartIndent', false);
    editorObj.setOption('autofocus', true);
    editorObj.setOption('matchBrackets', true);

    //  Note that we define the same key multiple times for expository purposes.
    //  CodeMirror doesn't seem to care.

    /* eslint-disable no-dupe-keys,quote-props */
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
            'Esc'               : TP.RETURN_TRUE    //  Exit mode
        });
    /* eslint-enable no-dupe-keys,quote-props */

    consoleInputTPElem.setEditorEventHandler('viewportChange',
            function() {
                this.adjustInputSize();
            }.bind(this));

    //  NB: We need to create the log view *before* we set up the console
    //  service.
    //this.setupLogView();

    //  Grab the consoleOutput TP.core.Element and set it up. Note that we need
    //  to do this *after* we set up the console input above.
    consoleOutputTPElem = TP.byId('SherpaConsoleOutput', TP.win('UIROOT'));
    consoleOutputTPElem.setup();

    this.set('consoleOutput', consoleOutputTPElem);

    //  Now we can set up the ConsoleService

    //  NB: We have to set up the ConsoleService this *after* we put in
    //  the output view.
    this.setupConsoleService();

    this.setupSearcher();

    hudTPElem = TP.byId('SherpaHUD', this.getNativeWindow());
    this.observe(hudTPElem, 'HiddenChange');

    //  Use the HUD's current value to set whether we are hidden or
    //  not.
    isHidden = TP.bc(hudTPElem.getAttribute('hidden'));
    this.setAttribute('hidden', isHidden);

    contentTPElem = TP.byId('content', this.getNativeWindow());
    TP.elementHideBusyMessage(contentTPElem.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------
//  Marker retrieval methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getCurrentEvalMarker',
function() {

    /**
     * @method getCurrentEvalMarker
     */

    var marker;

    if (TP.notValid(marker = this.$get('currentEvalMarker'))) {
        return null;
    }

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
     */

    var marker;

    if (TP.notValid(marker = this.$get('currentInputMarker'))) {
        return null;
    }

    if (TP.notValid(marker.find())) {
        marker.clear();
        this.set('currentInputMarker', null);

        return null;
    }

    return marker;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getCurrentPromptMarker',
function() {

    /**
     * @method getCurrentPromptMarker
     */

    var marker;

    if (TP.notValid(marker = this.$get('currentPromptMarker'))) {
        return null;
    }

    if (TP.notValid(marker.find())) {
        marker.clear();
        this.set('currentPromptMarker', null);

        return null;
    }

    return marker;
});

//  ------------------------------------------------------------------------
//  Handlers for signals from other widgets
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineHandler(
{signal: 'HiddenChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleHiddenChange
     */

    var isHidden;

    isHidden = TP.bc(aSignal.getOrigin().getAttribute('hidden'));

    this.setAttribute('hidden', isHidden);

    return this;
});

//  ------------------------------------------------------------------------
//  Other instance methods
//  ----------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('render',
function() {

    /**
     * @method render
     */

    var consoleInput;

    if (TP.isValid(consoleInput = this.get('consoleInput'))) {
        consoleInput.refreshEditor();
    }

    this.adjustInputSize();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     */

    var consoleInput,
        retVal;

    if (TP.bc(this.getAttribute('hidden')) === beHidden) {
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
     */

    var tsh;

    tsh = TP.core.TSH.getDefaultInstance();

    TP.sherpa.ConsoleService.construct(
        null,
        TP.hc('consoleModel', tsh,
                'consoleView', this));

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setupLogView',
function() {

    /**
     * @method setupLogView
     */

    var sherpaFrameBody,
        logviewTPElem;

    sherpaFrameBody = TP.documentGetBody(
                            TP.win('UIROOT.SHERPA_FRAME').document);

    logviewTPElem = TP.wrap(sherpaFrameBody).addContent(
                    TP.sherpa.logview.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    logviewTPElem.setup();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('toggleLog',
function() {

    /**
     * @method toggleLog
     */

    var logviewTPElem;

    logviewTPElem = TP.byId('SherpaLogView', TP.win('UIROOT.SHERPA_FRAME'));
    logviewTPElem.toggle('hidden');

    return this;
});

//  ------------------------------------------------------------------------
//  View Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clear',
function(resetPrompt, newPrompt) {

    /**
     * @method clear
     * @summary Clears the receiver's content, removing all output and
     *     resetting the console input to an empty input field.
     * @param {Boolean} [resetPrompt=false] Whether or not to reset the prompt.
     * @param {String} [newPrompt] The text to reset the prompt to.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    //  Refocus the input cell and set its cursor to the end.
    this.clearAllContent();

    this.focusInput();
    this.setInputCursorToEnd();

    if (resetPrompt) {
        this.setPrompt(newPrompt);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearAllContent',
function() {

    /**
     * @method clearAllContent
     * @summary Clears the input cell.
     * @returns {TP.sherpa.console} The receiver.
     */

    var marker;

    //  Clear the input and it's marks
    this.get('consoleInput').clearValue();

    this.teardownInputMark();
    this.teardownEvalMark();

    if (TP.isValid(marker = this.get('currentPromptMarker'))) {
        marker.clear();
        this.set('currentPromptMarker', null);
    }

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
     */

    var marker;

    if (TP.isValid(marker = this.get('currentCompletionMarker'))) {
        marker.clear();

        this.set('currentCompletionMarker', null);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Prompt Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getPrompt',
function() {

    /**
     * @method getPrompt
     * @summary Returns the prompt text used for the input cell.
     * @returns {String} The current prompt text or the empty String if that
     *     cannot be computed.
     */

    var marker,

        range,
        editor,
        promptText;

    //  If we have a valid prompt marker
    if (TP.isValid(marker = this.get('currentPromptMarker'))) {

        //  Find the marker in the input and grab its text.
        range = marker.find();
        editor = this.get('consoleInput').$get('$editorObj');
        promptText = editor.getRange(range.from, range.to);

        return promptText;
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('generatePromptMarkAt',
function(range, cssClass, promptText) {

    /**
     * @method generatePromptMarkAt
     */

    var consoleInput,

        content,

        doc,
        elem,

        marker,

        contentNode;

    consoleInput = this.get('consoleInput');

    content =
            '<div name="eval" class="indicator">' +
                '&#160;' +
            '</div>' +
            '<div name="autocomplete" class="indicator">' +
                '&#160;' +
            '</div>' +
            '<span class="text">' +
                TP.xmlEntitiesToLiterals(promptText) +
            '</span>';

    doc = this.getNativeDocument();

    elem = TP.documentConstructElement(doc, 'span', TP.w3.Xmlns.XHTML);
    TP.elementSetClass(elem, cssClass);
    TP.elementAddClass(elem, 'noselect');
    TP.elementSetAttribute(elem, 'id', TP.sys.cfg('sherpa.console_prompt'));

    marker = consoleInput.$get('$editorObj').markText(
        range.from,
        range.to,
        {
            atomic: true,
            readOnly: true,
            collapsed: true,
            replacedWith: elem,
            inclusiveLeft: true,        //  do not allow the cursor to be
                                        //  placed before the prompt mark
            inclusiveRight: false,
            clearWhenEmpty: false       //  don't require a character for this
                                        //  mark to span.
        }
    );

    //  Wire a reference to the marker back onto our output element
    elem.marker = marker;


    //  'innerHTML' seems to throw exceptions in XHTML documents on Firefox
    //elem.innerHTML = content;
    contentNode = TP.xhtmlnode(content);
    TP.nodeAppendChild(elem, contentNode, false);

    return marker;
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

    var cssClass,
        promptStr,

        consoleInput,

        editor,

        doc,

        elem,
        cursorRange,
        range,
        marker,

        textElem;

    cssClass = TP.ifInvalid(aCSSClass, 'console_prompt');

    promptStr = TP.ifInvalid(aPrompt, this.getType().DEFAULT_PROMPT);

    consoleInput = this.get('consoleInput');

    editor = this.get('consoleInput').$get('$editorObj');

    doc = this.getNativeDocument();
    if (!TP.isElement(elem = TP.byId(
                        TP.sys.cfg('sherpa.console_prompt'), doc, false))) {

        cursorRange = consoleInput.getCursor();

        range = {
            from: {line: cursorRange.line, ch: cursorRange.ch},
            to: {line: cursorRange.line, ch: cursorRange.ch + 1}
        };

        marker = this.generatePromptMarkAt(range, cssClass, promptStr);
        this.set('currentPromptMarker', marker);

        editor.setCursor(range.to);
    } else {
        textElem = TP.byCSSPath('.text', elem, true, false);
        TP.elementSetContent(textElem, TP.xmlEntitiesToLiterals(promptStr));
    }

    //  We probably resized the prompt mark - tell the editor to refresh.
    editor.refresh();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('togglePromptIndicator',
function(indicatorName, shouldBeVisible) {

    /**
     * @method togglePromptIndicator
     * @summary
     * @param {String} indicatorName The indicator to toggle.
     * @param {Boolean} shouldBeVisible
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

    var statID,

        hudWin,

        keyboardStatusTPElem,
        mouseStatusTPElem;

    statID = TP.ifEmpty(statusOutID, TP.ALL);

    hudWin = this.getNativeWindow();

    if (statID === 'keyboardInfo' || statID === TP.ALL) {
        keyboardStatusTPElem =
            TP.byCSSPath('#keyAndMouseReadout .keyboard', hudWin, true);
        keyboardStatusTPElem.setRawContent('');
    }

    if (statID === 'mouseInfo' || statID === TP.ALL) {
        mouseStatusTPElem =
            TP.byCSSPath('#keyAndMouseReadout .mouse', hudWin, true);
        mouseStatusTPElem.setRawContent('');
    }

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
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var statID,

        hudWin,

        timer,

        //canvasWin,

        str,
        arr,
        evt,

        keyboardStatusTPElem,
        mouseStatusTPElem;

    statID = TP.ifEmpty(statusOutID, TP.ALL);

    hudWin = this.getNativeWindow();

    /*
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
    */

    //  Note that we use $set() to manage the statusReadoutTimer here - this is
    //  a big performance win because the keyboard / mouse stuff is so
    //  performance intensive.

    //  Also, we use setTextContent() to update the controls.

    if (TP.isValid(timer = this.get('statusReadoutTimer'))) {
        clearTimeout(timer);
        this.$set('statusReadoutTimer', null, false);
    }

    keyboardStatusTPElem =
        TP.byCSSPath('#keyAndMouseReadout .keyboard', hudWin, true);
    mouseStatusTPElem =
        TP.byCSSPath('#keyAndMouseReadout .mouse', hudWin, true);

    //  ---
    //  keyboard key pressed
    //  ---

    if (statID === 'keyboardInfo' || statID === TP.ALL) {

        if (TP.canInvoke(aSignal, 'getEvent') &&
            TP.isEvent(evt = aSignal.getEvent())) {

            arr = TP.ac();

            arr.push(TP.isTrue(aSignal.getCtrlKey()) ? 'Ctrl' : null);
            arr.push(TP.isTrue(aSignal.getAltKey()) ? 'Alt' : null);
            arr.push(TP.isTrue(aSignal.getMetaKey()) ? 'Meta' : null);
            arr.push(TP.isTrue(aSignal.getShiftKey()) ? 'Shift' : null);
            arr.push('"' + TP.core.Keyboard.getEventVirtualKey(evt) + '"');
            arr.push(evt.keyCode);
            arr.push(evt.$unicodeCharCode);
            arr.compact();

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

                }.bind(this).fork(
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
function() {

    /**
     * @method adjustInputSize
     * @summary Adjusts the height of the input cell based on its contents.
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleInput,
        editorHeight,

        styleVals,

        drawerElement;

    consoleInput = this.get('consoleInput');
    editorHeight = consoleInput.getEditorHeight();

    styleVals = TP.elementGetStyleValuesInPixels(
                    this.getNativeNode(),
                    TP.ac('borderTopWidth', 'borderBottomWidth',
                            'marginTop', 'marginBottom',
                            'paddingTop', 'paddingBottom',
                            'bottom'));

    this.setHeight(editorHeight -
                    (styleVals.at('borderBottomWidth') +
                     styleVals.at('paddingBottom')));

    //  Set the south drawer to *not* transition. Note that it seems we have to
    //  do this by setting the style String directly as setting the 'transition'
    //  property of the style object has no effect (at least on Chrome).
    drawerElement = TP.byId('south', this.getNativeWindow(), false);
    TP.elementSetStyleString(drawerElement, 'transition: none');

    TP.elementSetHeight(drawerElement,
                        editorHeight +
                        styleVals.at('borderTopWidth') +
                        styleVals.at('borderBottomWidth') +
                        styleVals.at('marginTop') +
                        styleVals.at('marginBottom') +
                        styleVals.at('paddingTop') +
                        styleVals.at('paddingBottom') +
                        styleVals.at('bottom'));

    (function() {
        var styleStr;

        //  We can only do this after letting the GUI thread service, otherwise
        //  it has no effect.

        //  Set the style String to whatever it is minus the 'transition: none'
        //  value that we put on it above.
        styleStr = TP.elementGetStyleString(drawerElement);
        styleStr = styleStr.replace(/transition\:\s*none;\s*/,'');
        TP.elementSetStyleString(drawerElement, styleStr);
    }).fork(5);

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

    if (this.get('consoleOutput').getAttribute('panes') === 'growl') {
        this.setOutputDisplayMode('none');
        this.get('consoleOutput').removeClass('fade_out');
    }

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

TP.sherpa.console.Inst.defineMethod('eventIsInInput',
function(anEvent) {

    /**
     * @method eventInInput
     */

    return this.get('consoleInput').$get('$editorObj').hasFocus();
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
     * @summary Returns the value currently considered the 'input value'
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
                this.generateInputMarkAt({anchor: start, head: end}));

    (function() {

        this.focusInput();
        this.setInputCursorToEnd();

    }.bind(this)).afterUnwind();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setupInputMarkForExistingContent',
function() {

    /**
     * @method setupInputMarkForExistingContent
     */

    var consoleInput,

        end;

    if (TP.isValid(this.get('currentInputMarker'))) {
        this.teardownInputMark();
    }

    consoleInput = this.get('consoleInput');

    end = consoleInput.getCursor();

    this.set('currentInputMarker',
                this.generateInputMarkAt({anchor: {line: 0, ch:0}, head: end}));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('teardownInputMark',
function() {

    /**
     * @method teardownInputMark
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

TP.sherpa.console.Inst.defineMethod('shouldConcealInput',
function(aFlag) {

    /**
     * @method shouldConcealInput
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setupSearcher',
function() {

    /**
     * @method setupSearcher
     */

    var searcherTile,

        tileBody,
        searcherContent;

    searcherTile = TP.bySystemId('Sherpa').makeTile(
                                'searcher_tile',
                                this.get('consoleOutput'));
    searcherTile.setAttribute('contenttype', 'sherpa:searcher');

    this.set('searcherTile', searcherTile);

    tileBody = searcherTile.get('body');

    searcherContent = tileBody.addContent(
                        TP.sherpa.searcher.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML));

    searcherContent.awaken();
    searcherContent.setup();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('toggleSearcher',
function() {

    /**
     * @method toggleSearcher
     */

    var searcherTile,

        tileBody,
        searcherContent;

    if (TP.notValid(searcherTile = this.get('searcherTile'))) {
        searcherTile = TP.bySystemId('Sherpa').makeTile(
                                    'searcher_tile',
                                    this.get('consoleOutput'));
        searcherTile.setAttribute('contenttype', 'sherpa:searcher');

        this.set('searcherTile', searcherTile);

        tileBody = searcherTile.get('body');

        searcherContent = tileBody.addContent(
                            TP.sherpa.searcher.getResourceElement(
                                'template',
                                TP.ietf.Mime.XHTML));

        searcherContent.awaken();
        searcherContent.setup();
    } else {
        searcherContent = TP.byCSSPath('sherpa|searcher', searcherTile, true);
    }

    searcherTile.toggle('hidden');
    searcherContent.toggle('hidden');

    return this;
});

//  ------------------------------------------------------------------------
//  Output management methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearOutput',
function() {

    /**
     * @method clearOutput
     */

    //  Clear the output
    this.get('consoleOutput').clear();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('createOutputEntry',
function(uniqueID, dataRecord) {

    /**
     * @method createOutputEntry
     */

    return this.get('consoleOutput').createOutputEntry(uniqueID, dataRecord);
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getOutputDisplayMode',
function() {

    /**
     * @method getOutputDisplayMode
     */

    return this.get('consoleOutput').getAttribute('panes');
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setOutputDisplayMode',
function(displayModeVal) {

    /**
     * @method setOutputDisplayMode
     */

    var consoleOutput;

    consoleOutput = this.get('consoleOutput');

    consoleOutput.removeAttribute('exposed');

    return consoleOutput.setAttribute('panes', displayModeVal);
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('updateOutputEntry',
function(uniqueID, dataRecord) {

    /**
     * @method updateOutputEntry
     */

    this.teardownInputMark();

    return this.get('consoleOutput').updateOutputEntry(uniqueID, dataRecord);
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
//  Eval marking/value retrieval
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('computeEvalMarkRangeAnchor',
function() {

    /**
     * @method computeEvalMarkRangeAnchor
     */

    var promptMark,

        range,

        editor,

        head,

        matcher,

        searchCursor,
        retVal;

    if (TP.isValid(promptMark = this.get('currentPromptMarker'))) {
        range = promptMark.find();
        retVal = range.to;
    } else {
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
            retVal = {line: 0, ch: 0};
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
    }

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
        retVal = {line: lineInfo.line, ch: lineInfo.text.length};
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

    range = {anchor: this.computeEvalMarkRangeAnchor(),
                head: this.computeEvalMarkRangeHead()};

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

            newEvalRange = {anchor: currentInputRange.from,
                            head: currentInputRange.to};

            this.set('currentEvalMarker',
                        this.generateEvalMarkAt(newEvalRange));
        }
    }

    //  If we still don't have an eval marker, that means that we didn't have a
    //  valid input marker - set them both up here using the same range.
    if (TP.notValid(this.get('currentEvalMarker'))) {

        newEvalRange = this.computeEvalMarkRange();

        this.set('currentInputMarker',
                    this.generateInputMarkAt({anchor: newEvalRange.anchor,
                                                head: newEvalRange.head}));
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
