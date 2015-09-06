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

TP.sherpa.console.Inst.defineAttribute('currentPromptMarker');

TP.sherpa.console.Inst.defineAttribute('rawOutEntryTemplate');

TP.sherpa.console.Inst.defineAttribute('outputCoalesceRecords');
TP.sherpa.console.Inst.defineAttribute('outputCoalesceTimer');

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

    editorObj.setOption('theme', 'zenburn');
    editorObj.setOption('mode', 'javascript');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', false);
    editorObj.setOption('viewportMargin', Infinity);
    editorObj.setOption('electricChars', false);
    editorObj.setOption('smartIndent', false);
    editorObj.setOption('autofocus', true);

    editorObj.setOption(
        'extraKeys',
        {
            //  NB: These should match keys that are used by the console in
            //  TP.sherpa.ConsoleService
            'Shift-Enter': function() { return true; },

            'Shift-Up': function() {return true; },
            'Shift-Right': function() {return true; },
            'Shift-Down': function() {return true; },
            'Shift-Left': function() {return true; },

            'Shift-Alt-Up': function() {return true; },
            'Shift-Alt-Right': function() {return true; },
            'Shift-Alt-Down': function() {return true; },
            'Shift-Alt-Left': function() {return true; },

            'Shift-Backspace': function() {return true; },

            'Shift-Esc': function() {return true; },

            'Ctrl-Enter': function() {return true; }
        });

    consoleInputTPElem.setEditorEventHandler('viewportChange',
            function() {
                this.adjustInputSize();
            }.bind(this));

    //  NB: We need to create the log view *before* we set up the console
    //  service.
    //this.setupLogView();

    //  Set up the consoleOutput element by putting it in the previously
    //  used 'content' element that is currently displaying a 'busy' panel.

    contentTPElem = TP.byId('content', this.getNativeWindow());

    consoleOutputTPElem = contentTPElem.addContent(
                        TP.xhtmlnode('<div id="SherpaConsoleOutput"/>'));
    this.set('consoleOutput', consoleOutputTPElem);

    this.set('outputCoalesceRecords', TP.hc());

    //  Now we can set up the ConsoleService

    //  NB: We have to set up the ConsoleService this *after* we put in
    //  the output view.
    this.setupConsoleService();

    hudTPElem = TP.byId('SherpaHUD', this.getNativeWindow());
    this.observe(hudTPElem, 'HiddenChange');

    //  Use the HUD's current value to set whether we are hidden or
    //  not.
    isHidden = TP.bc(hudTPElem.getAttribute('hidden'));
    this.setAttribute('hidden', isHidden);

    TP.elementHideBusyMessage(contentTPElem.getNativeNode());

    //  Set the initial output mode to split horizontally with the console in
    //  the bottom.
    this.toggleOutputMode('h_split_bottom');

    return this;
});

//  ------------------------------------------------------------------------
//  Marker retrieval methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getCurrentEvalMarker',
function() {

    /**
     * @method getCurrentEvalMarker
     * @returns
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
     * @returns
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
     * @returns
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
//  Event Handling
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('handleDOMShiftUp__DOMShiftUp',
function(aSignal) {

    this.focusInput();
    this.setInputCursorToEnd();

    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('handleDOMQuestionMarkUp__DOMQuestionMarkUp',
function(aSignal) {

    this.toggleSearcher();

    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers for signals from other widgets
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('handleHiddenChangeFromSherpaHUD',
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

TP.sherpa.console.Inst.defineMethod('refresh',
function() {

    /**
     * @method refresh
     */

    var consoleInput;

    if (TP.isValid(consoleInput = this.get('consoleInput'))) {
        consoleInput.$get('$editorObj').refresh();
    }

    this.adjustInputSize();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @abstract
     * @param
     * @returns {TP.sherpa.hud} The receiver.
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

        //  Stop observing the 'double Shift key' for focusing the input cell.
        this.ignore(
            TP.core.Keyboard,
            'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up');

        this.ignore(
            TP.core.Keyboard,
            'TP.sig.DOM_QuestionMark_Up__TP.sig.DOM_QuestionMark_Up');

        TP.byId('content', this.getNativeWindow()).hide();

        //  Execute the supertype's method and capture the return value *after*
        //  everything has hidden.
        retVal = this.callNextMethod();

    } else {

        //  Execute the supertype's method and capture the return value *before*
        //  everything has been shown.
        retVal = this.callNextMethod();

        TP.byId('content', this.getNativeWindow()).show();

        consoleInput = this.get('consoleInput');
        consoleInput.focus();

        //  activate the input cell
        this.activateInputEditor();

        //  Start observing the 'double Shift key' for focusing the input cell.
        this.observe(
            TP.core.Keyboard,
            'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up');

        this.observe(
            TP.core.Keyboard,
            'TP.sig.DOM_QuestionMark_Up__TP.sig.DOM_QuestionMark_Up');
    }

    return retVal;
});

//  ----------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setupConsoleService',
function() {

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

    var logviewTPElem;

    logviewTPElem = TP.byId('SherpaLogView', TP.win('UIROOT.SHERPA_FRAME'));
    logviewTPElem.toggle('hidden');

    return this;
});

//  ------------------------------------------------------------------------
//  View Management Methods
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
    this.get('consoleOutput').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('toggleOutputMode',
function(aMode) {

    /**
     * @method toggleOutputMode
     * @returns {TP.sherpa.console} The receiver.
     */

    var centerElem;

    centerElem = TP.byId('center', this.getNativeWindow(), false);

    switch (aMode) {
        case 'h_split_bottom':

            TP.elementRemoveClass(centerElem, 'all-console');
            TP.elementRemoveClass(centerElem, 'all-world');

            TP.elementRemoveClass(centerElem, 'v-split-left');
            TP.elementRemoveClass(centerElem, 'v-split-right');
            TP.elementRemoveClass(centerElem, 'h-split-top');

            TP.elementAddClass(centerElem, 'h-split-bottom');

            break;

        case 'h_split_top':

            TP.elementRemoveClass(centerElem, 'all-console');
            TP.elementRemoveClass(centerElem, 'all-world');

            TP.elementRemoveClass(centerElem, 'v-split-left');
            TP.elementRemoveClass(centerElem, 'v-split-right');
            TP.elementRemoveClass(centerElem, 'h-split-bottom');

            TP.elementAddClass(centerElem, 'h-split-top');

            break;

        case 'v_split_left':

            TP.elementRemoveClass(centerElem, 'all-console');
            TP.elementRemoveClass(centerElem, 'all-world');

            TP.elementRemoveClass(centerElem, 'h-split-top');
            TP.elementRemoveClass(centerElem, 'h-split-bottom');
            TP.elementRemoveClass(centerElem, 'v-split-right');

            TP.elementAddClass(centerElem, 'v-split-left');

            break;

        case 'v_split_right':

            TP.elementRemoveClass(centerElem, 'all-console');
            TP.elementRemoveClass(centerElem, 'all-world');

            TP.elementRemoveClass(centerElem, 'h-split-top');
            TP.elementRemoveClass(centerElem, 'h-split-bottom');
            TP.elementRemoveClass(centerElem, 'v-split-left');

            TP.elementAddClass(centerElem, 'v-split-right');

            break;

        case 'allworld':

            TP.elementRemoveClass(centerElem, 'all-console');

            TP.elementRemoveClass(centerElem, 'v-split-left');
            TP.elementRemoveClass(centerElem, 'v-split-right');
            TP.elementRemoveClass(centerElem, 'h-split-top');
            TP.elementRemoveClass(centerElem, 'h-split-bottom');

            TP.elementAddClass(centerElem, 'all-world');

            break;

        case 'allconsole':
        default:

            TP.elementRemoveClass(centerElem, 'all-world');

            TP.elementRemoveClass(centerElem, 'v-split-left');
            TP.elementRemoveClass(centerElem, 'v-split-right');
            TP.elementRemoveClass(centerElem, 'h-split-top');
            TP.elementRemoveClass(centerElem, 'h-split-bottom');

            TP.elementAddClass(centerElem, 'all-console');

            break;
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
     * @returns {String}
     */

    return '>';
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('generatePromptMarkAt',
function(range, cssClass, promptText) {

    /**
     * @method generatePromptMarkAt
     * @param
     * @param
     * @returns
     */

    var consoleInput,

        doc,
        elem,
        marker;

    consoleInput = this.get('consoleInput');

    doc = this.getNativeDocument();

    elem = TP.documentCreateElement(doc, 'span', TP.w3.Xmlns.XHTML);
    TP.elementSetClass(elem, cssClass);
    TP.elementAddClass(elem, 'noselect');
    TP.elementSetAttribute(elem, 'id', TP.sys.cfg('sherpa.console_prompt'));
    TP.xmlElementSetContent(elem, TP.xmlEntitiesToLiterals(promptText));

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
     * @returns {TP.sherpa.cmdline} The receiver.
     */

    var cssClass,
        promptStr,

        consoleInput,

        doc,
        range,
        marker,
        elem,

        editor,

        cursorRange;

    TP.sys.setcfg('sherpa.console_prompt', 'sherpaPrompt');

    cssClass = TP.ifInvalid(aCSSClass, 'console_prompt');

    promptStr = TP.ifInvalid(aPrompt, this.getType().DEFAULT_PROMPT);

    consoleInput = this.get('consoleInput');

    doc = this.getNativeDocument();

    editor = this.get('consoleInput').$get('$editorObj');

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
        TP.elementSetClass(elem, cssClass);
        TP.elementAddClass(elem, 'noselect');
        TP.htmlElementSetContent(elem, promptStr);
    }

    //  We probably resized the prompt mark - tell the editor to refresh.
    editor.refresh();

    return this;
});

//  ------------------------------------------------------------------------
//  Status Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearStatus',
function(statusOutID) {

    /**
     * @method clearStatus
     * @summary Clears any status information such as window.status and/or any
     *     status bar content, resetting it to the default state.
     * @param
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var statusTPElem;

    if (TP.notEmpty(statusOutID) &&
        TP.isValid(statusTPElem = TP.byId(
                                    statusOutID, this.getNativeWindow()))) {
        statusTPElem.setRawContent('');
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
     */

    var statID,

        canvasWin,

        str,
        arr,
        evt;

    statID = TP.ifEmpty(statusOutID, TP.ALL);

    //  ---
    //  status context ID (execution window's global ID)
    //  ---

    if (statID === 'currentCanvasInfo' || statID === TP.ALL) {
        if (TP.isWindow(canvasWin = TP.sys.getUICanvas(true))) {
            str = TP.gid(canvasWin).sliceFrom('.', false, true);

            TP.byId('currentCanvasInfo',
                    this.getNativeWindow()).setRawContent(str);
        }
    }

    //  ---
    //  logging level
    //  ---

    if (statID === 'logLevelInfo' || statID === TP.ALL) {
        str = TP.getLogLevel().getName() + '::' + APP.getLogLevel().getName();

        TP.byId('logLevelInfo', this.getNativeWindow()).setRawContent(str);
    }

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

            TP.byId('keyboardInfo', this.getNativeWindow()).setRawContent(str);
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

            TP.byId('mouseInfo', this.getNativeWindow()).setRawContent(str);
        } else {
            TP.byId('mouseInfo', this.getNativeWindow()).clearTextContent();
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  Input Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('activateInputEditor',
function() {

    /**
     * @method activateInputEditor
     * @returns {TP.sherpa.console} The receiver.
     * @abstract
     */

    var consoleInput;

    consoleInput = this.get('consoleInput');

    consoleInput.setKeyHandler(
            function(evt) {
                var end;

                if (TP.notValid(this.get('currentInputMarker'))) {

                    end = consoleInput.getCursor();

                    this.set('currentInputMarker',
                        this.generateInputMarkAt(
                            {anchor: {line: 0, ch: 0}, head: end}));
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
     * @summary Adjust the height of the input cell based on its contents.
     */

    var consoleInput,
        editorHeight,

        styleVals;

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

    TP.elementSetHeight(TP.byId('south', this.getNativeWindow(), false),
                        editorHeight +
                        styleVals.at('borderTopWidth') +
                        styleVals.at('borderBottomWidth') +
                        styleVals.at('marginTop') +
                        styleVals.at('marginBottom') +
                        styleVals.at('paddingTop') +
                        styleVals.at('paddingBottom') +
                        styleVals.at('bottom'));
    return;
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

    if (TP.isValid(marker = this.get('currentInputMarker'))) {

        editor = this.get('consoleInput').$get('$editorObj');
        range = marker.find();

        editor.setSelection(range.from, range.to);
        editor.replaceSelection('');

        this.teardownInputMark();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('deactivateInputEditor',
function() {

    /**
     * @method deactivateInputEditor
     * @returns {TP.sherpa.console} The receiver.
     * @abstract
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
     * @param {Boolean} select True to select in addition.
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
     * @description If shouldAppend is true, and the input cell already has
     *     content, a '.;\n' is appended to the front of the content.
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

    consoleInput = this.get('consoleInput');
    if (TP.isTrue(shouldAppend)) {
        //if (TP.notEmpty(val = consoleInput.get('value'))) {
        //    val += '.;\n';
        //}
        val = '';

        val = val + TP.str(anObject);
    } else {
        val = TP.str(anObject);
    }

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

    this.set('currentInputMarker',
                this.generateInputMarkAt({anchor: start, head: end}));

    (function() {
        this.focusInput();
        this.setInputCursorToEnd();

    }.bind(this)).afterUnwind();

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
            className: 'bordered-input',
            startStyle: 'bordered-input-left',
            endStyle: 'bordered-input-right',
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
     * @summary Returns false for now.
     * @param {Boolean} aFlag The new value to set.
     * @returns {Boolean}
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('toggleSearcher',
function() {

    /**
     * @method toggleSearcher
     * @summary Returns false for now.
     * @param {Boolean} aFlag The new value to set.
     * @returns {Boolean}
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
    }

    searcherTile.toggle('hidden');
    searcherContent.toggle('hidden');

    return this;
});

//  ------------------------------------------------------------------------
//  Output management methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getInputStats',
function(aSignal) {

    /**
     * @method getInputStats
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     * @returns {TP.sherpa.console} The receiver.
     */

    var val,
        str;

    //  TODO: Isn't aSignal the same as our signal and, if not, is that an
    //  error?

    //  ---
    //  execution statistics, when available
    //  ---

    //  update the last command execution time
    val = aSignal.get('evaltime');
    str = TP.ifInvalid(val, '0');

    val = aSignal.get('tagtime');
    str += ' | ' + TP.ifInvalid(val, '0');

    val = aSignal.get('exectime');
    str += ' | ' + TP.ifInvalid(val, '0');

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getOutputTypeInfo',
function(aSignal) {

    /**
     * @method getOutputTypeInfo
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     * @returns {TP.sherpa.console} The receiver.
     */

    var val,
        str,
        values,
        len,
        startTN,
        wasSame,
        i;

    //  TODO: Isn't aSignal the same as our signal and, if not, is that an
    //  error?

    //  if no action pending then display current result type/id
    if (TP.canInvoke(aSignal, 'getResult')) {
        val = aSignal.getResult();
    }

    if (aSignal.isFailing() || aSignal.didFail()) {
        return 'undefined';
    }

    if (TP.isValid(val)) {

        str = '' + TP.tname(val);

        if (TP.isCollection(val) && TP.sys.cfg('tdc.type_collections', true)) {
            if (TP.isEmpty(val)) {
                str += '()';
            } else {

                if (TP.canInvoke(val, 'getValues')) {
                    values = val.getValues();
                } else {
                    // Probably a native collection like HTMLCollection etc.
                    values = TP.ac();
                    len = val.length;
                    for (i = 0; i < len; i++) {
                        values.push(val[i]);
                    }
                }

                len = values.getSize();
                startTN = TP.tname(values.at(0));
                wasSame = true;

                for (i = 1; i < len; i++) {
                    if (TP.tname(values.at(i)) !== startTN) {
                        wasSame = false;
                        break;
                    }
                }

                if (TP.isTrue(wasSame)) {
                    str += '(' + startTN + ')';
                } else {
                    str += '(Object)';
                }

                str += ' (' + len + ')';
            }
        }

        if (TP.isEmpty(str) || str === 'ready') {
            str = 'Object';
        }
    } else if (TP.isNull(val)) {
        str = 'null';
    } else {
        str = 'undefined';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('createOutputEntry',
function(uniqueID, dataRecord) {

    /**
     * @method createOutputEntry
     * @param
     * @param
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleOutput,

        doc,

        hid,
        hidstr,

        cmdText,

        cssClass,

        inputData,

        resp,
        entryStr,

        outElem;

    consoleOutput = this.get('consoleOutput');

    doc = consoleOutput.getNativeDocument();

    if (!TP.isElement(outElem = doc.getElementById(uniqueID))) {

        hid = dataRecord.at('hid');
        hidstr = TP.isEmpty(hid) ? '' : '!' + hid;

        cssClass = dataRecord.at('cssClass');
        cssClass = TP.isEmpty(cssClass) ? '' : cssClass;

        cmdText = TP.ifInvalid(dataRecord.at('cmdtext'), '');
        cmdText = cmdText.truncate(TP.sys.cfg('tdc.max_title', 70));

        //  If there's ACP in the text, we need to escape it before feeding it
        //  into the template transformation machinery.
        if (TP.regex.HAS_ACP.test(cmdText)) {
            cmdText = cmdText.replace(/\{\{/g, '\\{{').
                                replace(/\}\}/g, '\\}}');
        }

        cmdText = cmdText.asEscapedXML();

        inputData = TP.hc(
                        'id', uniqueID,
                        'inputclass', cssClass,
                        'hid', hidstr,
                        'cmdtext', cmdText,
                        'empty', '',
                        'resulttype', '',
                        'stats', '&#8230;');

        resp = TP.uc('~ide_root/xhtml/sherpa_console_templates.xhtml' +
                            '#xpath1(//*[@name="consoleEntry"])').transform(
                                inputData,
                                TP.request('async', false));
        entryStr = resp.get('result');

        outElem = TP.xmlElementAddContent(
                        this.get('consoleOutput').getNativeNode(),
                        TP.xhtmlnode(entryStr));
        TP.elementRemoveAttribute(outElem, 'name');
        TP.elementSetAttribute(outElem, 'tibet:noawaken', 'true', true);

    } else {
        //  Print an error
        void 0;
    }

    this.teardownInputMark();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('updateOutputEntry',
function(uniqueID, dataRecord) {

    /**
     * @method updateOutputEntry
     * @param
     * @param
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleOutput,

        doc,
        cellGroupElem,

        typeinfo,
        rawData,
        outputText,

        outputClass,

        resultTile,

        outputData,
        resp,
        outputStr,

        outputCoalesceRecords,
        coalesceRecord,

        coalesceFragment,
        flushTimer,
        updateStats,

        request,

        rawOutEntryTemplate;

    consoleOutput = this.get('consoleOutput');

    doc = consoleOutput.getNativeDocument();

    //  If we can't find the output cell that this output was using before
    //  (sometimes outputs like to reuse the same cell - i.e. logging), then
    //  attempt to recreate it.
    if (!TP.isElement(cellGroupElem = doc.getElementById(uniqueID))) {

        //  Note here how we pass in no output data - we'll fill that in below.
        this.createOutputEntry(uniqueID, TP.hc());

        //  If we still couldn't create the cell, then notify with an error
        //  message and bail out.
        if (!TP.isElement(cellGroupElem = doc.getElementById(uniqueID))) {
            TP.ifError() ?
                    TP.error(
                        'Couldn\'t find out cell for: ' + uniqueID) : 0;

            return this;
        }
    }

    typeinfo = dataRecord.at('typeinfo');
    rawData = dataRecord.at('rawData');
    outputText = dataRecord.at('output');

    //  If we're outputting logging data, add the '.logoutput' class to the
    //  output cell element and empty the content of the cells under the input
    //  line..
    if (typeinfo === 'LOG') {
        TP.elementAddClass(cellGroupElem, 'logoutput');
        TP.nodeEmptyContent(cellGroupElem);
    }

    //  If the output text is empty and the user is asking for structured
    //  output, then created a tile and set the raw data as its source object.
    if (TP.isEmpty(outputText) &&
        TP.isTrue(dataRecord.at('structuredOutput'))) {

        //  Make sure to configure this particular cell group so that content
        //  *can* be awakened under it - our structured output might very well
        //  need it.
        TP.elementRemoveAttribute(cellGroupElem, 'tibet:noawaken', true);

        resultTile = TP.bySystemId('Sherpa').makeEditorTile(
                                    uniqueID + '_tile',
                                    cellGroupElem);
        resultTile.setAttribute('attachedto', 'console');
        resultTile.set('sourceObject', rawData);
        resultTile.toggle('hidden');

    } else {

        //  If we're not outputting real output, then set the outputStr to the
        //  empty String and skip executing the output template.
        if (rawData === TP.TSH_NO_VALUE) {
            outputStr = '';
        } else {
            outputClass = dataRecord.at('cssClass');

            //  Run the output template and fill in the data
            outputData = TP.hc('output', outputText,
                                'outputclass', outputClass);

            if (TP.notValid(
                    rawOutEntryTemplate = this.get('rawOutEntryTemplate'))) {

                resp = TP.uc(
                    '~ide_root/xhtml/sherpa_console_templates.xhtml' +
                        '#xpath1(//*[@name="raw_outputEntry"])').getResource(
                        TP.request('async', false));

                rawOutEntryTemplate = resp.get('result');
                this.set('rawOutEntryTemplate', rawOutEntryTemplate);
            }

            outputStr = rawOutEntryTemplate.transform(outputData);

            if (!TP.isString(outputStr)) {

                //  Something went wrong during templating. The outputData
                //  didn't get converted and now our outputStr is just a
                //  reference to outputData.

                //  Try reprocessing the output since 99% of the errors will be
                //  DOM parse issues meaning something in the data wasn't
                //  properly escaped.
                outputData.atPut('output',
                        TP.boot.$dump(outputData.at('output'), '', true));

                outputStr = rawOutEntryTemplate.transform(outputData);
            }
        }

        updateStats = function(record, groupElem) {

            var statsStr,
                resultTypeStr;

            if (record.at('typeinfo') === 'LOG') {
                return;
            }

            //  Now, update statistics and result type data that was part of the
            //  entry that we inserted before with the input content.
            if (TP.isValid(request = record.at('request'))) {
                statsStr = TP.isEmpty(record.at('stats')) ?
                                this.getInputStats(request) :
                                record.at('stats');
                resultTypeStr = TP.isEmpty(record.at('typeinfo')) ?
                                this.getOutputTypeInfo(request) :
                                record.at('typeinfo');
            } else {
                statsStr = '';
                resultTypeStr = '';
            }

            TP.xmlElementSetContent(
                    TP.byCSSPath('.typeinfo', groupElem, true, false),
                    TP.xhtmlnode(resultTypeStr));

            TP.xmlElementSetContent(
                    TP.byCSSPath('.stats', groupElem, true, false),
                    TP.xhtmlnode(statsStr));
        }.bind(this);

        //  For superior performance, we 'coalesce' output. This allows quite a
        //  bit of data to be accumulated in a DocumentFragment and then, every
        //  so often via a timer, be appended to the output element. This avoids
        //  a lot of document reflows for the console output.

        //  There should be an 'output coalescing record' for each piece of
        //  data that we're trying to output. This can be more than one since
        //  our results can be asynchronous and we need to write them to the
        //  correct fragment which will then get appended to the correct output
        //  element for that result set.
        outputCoalesceRecords = this.get('outputCoalesceRecords');
        if (TP.notValid(coalesceRecord = outputCoalesceRecords.at(uniqueID))) {

            //  If we couldn't find an existing coalescing record for the
            //  supplied ID, then we create a coalescing fragment and a record
            //  holding it, the data record and the overall output element.
            coalesceFragment = TP.documentCreateFragment(doc);
            outputCoalesceRecords.atPut(
                                    uniqueID,
                                    TP.hc('fragment', coalesceFragment,
                                            'dataRecord', dataRecord,
                                            'cellGroupElem', cellGroupElem));
        } else {
            //  Otherwise, we're coalescing for output that is already in the
            //  process of being written - just grab the fragment.
            coalesceFragment = coalesceRecord.at('fragment');
        }

        coalesceFragment.appendChild(TP.xhtmlnode(outputStr));

        //  Make sure that we have a coalescing timer set up.
        if (!(flushTimer = this.get('outputCoalesceTimer'))) {
            flushTimer = setTimeout(
                function() {

                    //  Iterate over all of the coalescing records, append
                    //  whatever is in the fragment onto the output element and
                    //  update the cell's statistics.
                    outputCoalesceRecords.getValues().forEach(
                        function(record) {
                            record.at('cellGroupElem').appendChild(
                                                record.at('fragment'));

                            updateStats(record.at('dataRecord'),
                                        record.at('cellGroupElem'));
                        });

                    //  Empty the set of coalescing records. We'll generate more
                    //  the next time around.
                    outputCoalesceRecords.empty();

                    this.scrollOutputToEnd();

                    flushTimer = null;
                    this.set('outputCoalesceTimer', null);
                }.bind(this),
                80);

            this.set('outputCoalesceTimer', flushTimer);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('generateOutputElement',
function(uniqueID) {

    /**
     * @method generateOutputElement
     * @param
     * @returns
     */

    var elem;

    elem = TP.xhtmlnode('<div></div>');

    TP.elementSetAttribute(elem, 'id', uniqueID);

    elem = TP.nodeAppendChild(this.get('consoleOutput').getNativeNode(),
                                elem);

    return elem;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('scrollOutputToEnd',
function() {

    /**
     * @method scrollOutputToEnd
     * @summary Adjust the height of the input cell based on its contents.
     */

    var consoleOutputElem;

    consoleOutputElem = this.get('consoleOutput').getNativeNode();
    consoleOutputElem.scrollTop = consoleOutputElem.scrollHeight;

    return;
});

//  ------------------------------------------------------------------------
//  Eval marking/value retrieval
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setupEvalMark',
function() {

    /**
     * @method setupEvalMark
     * @returns {TP.sherpa.console} The receiver.
     */

    var currentInputRange,
        newEvalRange;

    //  If the text input is empty, there is no reason to setup anything... exit
    //  here.
    if (TP.isEmpty(this.get('consoleInput').getValue())) {
        return this;
    }

    if (TP.isValid(this.get('currentInputMarker'))) {
        if (TP.isValid(
                currentInputRange = this.get('currentInputMarker').find())) {

            newEvalRange = {anchor: currentInputRange.from,
                            head: currentInputRange.to};

            this.set('currentEvalMarker',
                        this.generateEvalMarkAt(newEvalRange));
        }
    }

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
     * @param
     * @param
     * @returns {TP.sherpa.console} The receiver.
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
     * @returns {TP.sherpa.console} The receiver.
     */

    if (TP.isValid(this.get('currentEvalMarker'))) {
        this.get('currentEvalMarker').clear();
        this.set('currentEvalMarker', null);
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

    //  Only compute the text if you get a valid range
    if (TP.isValid(marker = this.get('currentInputMarker'))) {
        range = marker.find();
        editor = this.get('consoleInput').$get('$editorObj');
        inputText = editor.getRange(range.from, range.to);
    } else {
        this.teardownInputMark();
    }

    return inputText;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('computeEvalMarkRangeAnchor',
function() {

    /**
     * @method computeEvalMarkRangeAnchor
     * @returns
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
            //  Couldn't find a starting '>', so we just use the beginning of the
            //  editor
            retVal = {line: 0, ch: 0};
        }

        /*
        //  See if there are any output marks between the anchor and head
        marks = this.findOutputMarks(retVal, head);
        if (marks.length > 0) {
            retVal = marks[marks.length - 1].find().to;
        }

        //  If the 'ch' is at the end of the line, increment the line and set the
        //  'ch' to 0
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
     * @returns
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
     * @returns
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
     * @returns
     */

    var marker;

    marker = this.get('consoleInput').$get('$editorObj').markText(
        range.anchor,
        range.head,
        {
            className: 'bordered-eval',
            startStyle: 'bordered-eval-left',
            endStyle: 'bordered-eval-right',
            atomic: true,
            inclusiveLeft: false,
            inclusiveRight: false
        }
    );

    return marker;
});

//  ========================================================================
//  end
//  ========================================================================
