//  ========================================================================
/*
NAME:   TP.sherpa.console.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
*/
//  ========================================================================

/**
 * @type {TP.sherpa.console}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:console');

TP.sherpa.console.shouldRegisterInstances(true);

//  ----------------------------------------------------------------------------
//  Type Constants
//  ----------------------------------------------------------------------------

//  the default prompt separator/string (>>)
TP.sherpa.console.Type.defineConstant('DEFAULT_PROMPT', '&#160;&#187;');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('cmdNode'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return TP.DESCEND;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  should IO be concealed? this is used to simulate "password" mode
TP.sherpa.console.Inst.defineAttribute('conceal', false);

//  Is the command line currently concealed from view?
TP.sherpa.console.Inst.defineAttribute('concealedInput');

TP.sherpa.console.Inst.defineAttribute(
        'textInput',
        {'value': TP.cpc('xctrls|codeeditor', true)});

TP.sherpa.console.Inst.defineAttribute('currentEvalMarker');
TP.sherpa.console.Inst.defineAttribute('evalMarkAnchorMatcher');

TP.sherpa.console.Inst.defineAttribute('currentInputMarker');

TP.sherpa.console.Inst.defineAttribute('currentPromptMarker');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    var textInput,
        textInputStartupComplete;

    textInput = this.get('textInput');

    //  Make sure to observe a setup on the text input here, because it won't be
    //  fully formed when this line is executed.
    textInputStartupComplete = function(aSignal) {
        textInputStartupComplete.ignore(
                aSignal.getOrigin(), aSignal.getSignalName());

        textInput.setEditorEventHandler('viewportChange',
                function () {
                    this.adjustTextInputSize();
                }.bind(this));

        //  NB: We need to create the log view *before* we set up the console
        //  service.
        this.setupLogView();

        this.setupConsoleService();

    }.bind(this);

    textInputStartupComplete.observe(textInput, 'TP.sig.DOMReady');

    (function () {

        this.toggle('hidden');

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setHidden',
function(beHidden) {

    /**
     * @name setHidden
     * @abstract
     * @param
     * @returns {TP.sherpa.hud} The receiver.
     */

    var textInput;

    if (this.get('hidden') === beHidden) {
        return this;
    }

    if (TP.isTrue(beHidden)) {
        //  Clear the value
        this.clearInput();

        //  deactivate the input cell
        this.deactivateInputEditor();
    } else {
        textInput = this.get('textInput');
        textInput.focus();

        //  activate the input cell
        this.activateInputEditor();
    }

    return this.callNextMethod();
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

    var uiRootDoc,
        logview;

    uiRootDoc = TP.doc(TP.win('UIROOT'));

    logview = TP.sherpa.logview.addResourceContentTo(
                        TP.ietf.Mime.XHTML,
                        TP.documentGetBody(uiRootDoc));

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('toggleLog',
function() {

    var logview;

    //var logviewTile = TP.byOID('Sherpa').makeTile('logviewTile');

/*
    if (TP.notValid(logview = TP.byOID('SherpaLogView'))) {
        uiRootDoc = TP.doc(TP.win('UIROOT'));

        logview = TP.sherpa.logview.addResourceContentTo(
                            TP.ietf.Mime.XHTML,
                            TP.documentGetBody(uiRootDoc));
        logview.setID('SherpaLogView');
    }
*/

    //logviewTile.toggle('hidden');
    logview = TP.byOID('SherpaLogView');
    logview.toggle('hidden');

    //logviewTile.setPagePositionAndSize(TP.rtc(100, 100, 300, 300));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('activateInputEditor',
function() {

    /**
     * @name activateInputEditor
     * @returns {TP.sherpa.console} The receiver.
     * @abstract
     * @todo
     */

    var textInput;

    textInput = this.get('textInput');

    textInput.setKeyHandler(TP.core.Keyboard.$$handleKeyEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('deactivateInputEditor',
function() {

    /**
     * @name deactivateInputEditor
     * @returns {TP.sherpa.console} The receiver.
     * @abstract
     * @todo
     */

    var textInput;

    textInput = this.get('textInput');

    textInput.unsetCurrentKeyHandler();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('eventIsInInput',
function(anEvent) {

    /**
     * @name eventInInput
     */

    return TP.eventGetWindow(anEvent).document ===
            this.get('textInput').getNativeContentDocument();
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('showingEvalMark',
function() {

    /**
     * @name showingEvalMark
     */

    return TP.isValid(this.get('currentEvalMarker'));
});

//  ------------------------------------------------------------------------
//  View Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('adjustTextInputSize',
function() {

    /**
     * @name adjustTextInputSize
     * @synopsis Adjust the height of the input cell based on its contents.
     */

    var textInput,
        newHeight;

    textInput = this.get('textInput');

    newHeight = textInput.getEditorHeight();
    this.setHeight(newHeight);

    var body = textInput.getNativeContentDocument().body;
    body.scrollTop = body.scrollHeight;

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearAllContent',
function() {

    /**
     * @name clearAllContent
     * @synopsis Clears the input cell.
     * @returns {TP.sherpa.console} The receiver.
     */

    this.get('textInput').clearValue();

    this.clearStatus();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @name setCursorToEnd
     * @synopsis Moves the cursor to the end.
     * @returns {TP.sherpa.console} The receiver.
     */

    this.get('textInput').setCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('scrollToEnd',
function() {

    /**
     * @name scrollToEnd
     * @synopsis Adjust the height of the input cell based on its contents.
     */

    var body = this.get('textInput').getNativeContentDocument().body;
    body.scrollTop = body.scrollHeight;

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('toggleMaximized',
function() {

    /**
     * @name toggleMaximized
     * @synopsis
     * @returns {TP.sherpa.console} The receiver.
     */

    var textInput,
        editorElem;

    textInput = this.get('textInput');
    editorElem = TP.byCSS('.CodeMirror',
                            textInput.getNativeContentDocument(),
                            true);

    if (this.hasAttribute('maximized')) {
        this.removeAttribute('maximized');
        TP.elementRemoveAttribute(editorElem, 'maximized');
    } else {
        this.setAttribute('maximized', true);
        TP.elementSetAttribute(editorElem, 'maximized', 'true');
    }

    this.focusInput();

    return this;
});

//  ------------------------------------------------------------------------
//  Prompt Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getPrompt',
function() {

    /**
     * @name getPrompt
     * @synopsis
     * @returns {String}
     * @todo
     */

    return '>';
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('generatePromptMarkAt',
function(range, cssClass, promptText) {

    /**
     * @name generatePromptMarkAt
     * @synopsis
     * @param
     * @param
     * @returns
     */

    var textInput,

        doc,
        elem,
        marker;

    textInput = this.get('textInput');

    doc = textInput.getNativeContentDocument();

    elem = doc.createElement('span');
    elem.className = cssClass;
    elem.id = TP.sys.cfg('sherpa.console_prompt');
    elem.innerHTML = promptText;

    marker = textInput.$getEditorInstance().markText(
        range.from,
        range.to,
        {
            'atomic': true,
            'readOnly': true,
            'collapsed': true,
            'replacedWith': elem,
            'inclusiveLeft': false,
            'inclusiveRight': false
        }
    );

    //  Wire a reference to the marker back onto our output element
    elem.marker = marker;

    return marker;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('movePromptMarkToCursor',
function() {

    /**
     * @name movePromptMarkToCursor
     * @synopsis
     * @returns
     */

    var marker,

        elem,
        cssClass,
        promptStr,

        textInput,
        cursorRange,
        range;

    elem = marker.widgetNode.firstChild;
    cssClass = TP.elementGetClass(elem);
    promptStr = elem.innerHTML;

    marker.clear();

    textInput = this.get('textInput');

    cursorRange = textInput.getCursor();

    range = {
                'from': {line: cursorRange.line, ch: cursorRange.ch},
                'to': {line:cursorRange.line, ch:cursorRange.ch + 1}
            };

    textInput.insertAtCursor(' ');

    marker = this.generatePromptMarkAt(range, cssClass, promptStr);
    this.set('currentPromptMarker', marker);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setPrompt',
function(aPrompt, aCSSClass) {

    /**
     * @name setPrompt
     * @synopsis Sets the text prompt used for the input cell.
     * @param {String} aPrompt The prompt to define.
     * @param {String} aCSSClass An optional CSS class name to use for display
     *     of the prompt string.
     * @returns {TP.sherpa.cmdline} The receiver.
     * @todo
     */

    var cssClass,
        promptStr,

        textInput,

        doc,
        range,
        marker,
        elem,

        editor,

        cursorRange;

    TP.sys.setcfg('sherpa.console_prompt', 'sherpaPrompt');

    cssClass = TP.ifInvalid(aCSSClass, 'console_prompt');

    promptStr = TP.ifInvalid(aPrompt, this.getType().DEFAULT_PROMPT);

    textInput = this.get('textInput');

    doc = textInput.getNativeContentDocument();

    if (TP.notValid(elem = TP.byId(TP.sys.cfg('sherpa.console_prompt'), doc))) {
        cursorRange = textInput.getCursor();

        range = {
                    'from': {line: cursorRange.line, ch: cursorRange.ch},
                    'to': {line:cursorRange.line, ch:cursorRange.ch + 1}
                };

        textInput.insertAtCursor(' ');

        marker = this.generatePromptMarkAt(range, cssClass, promptStr);
        this.set('currentPromptMarker', marker);

        editor = this.get('textInput').$getEditorInstance();
        editor.setCursor(range.to);
    } else {
        TP.elementSetClass(elem, cssClass);
        elem.innerHTML = promptStr;
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Status Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearStatus',
function() {

    /**
     * @name clearStatus
     * @synopsis Clears any status information such as window.status and/or any
     *     status bar content, resetting it to the default state.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     * @todo
     */

    //  NB: This only works if the user gives us permission - need a different
    //  way
    TP.status('');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('updateStatus',
function(aSignal) {

    /**
     * @name updateStatus
     * @synopsis Updates the status bar with information which is drawn from the
     *     current environment and the signal provided. The signal is typically
     *     a TP.sig.UserIOResponse containing information about the processing
     *     which just occurred.
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     */

    /*
    var model,
        doc,
        outCell,
        evt,
        arr,
        str,
        canvasWin;

    model = this.getModel();
    doc = this.get('vWin').document;

    //  Make sure that we have a valid signal and that we actually have
    //  cells to update the status of.
    if (TP.isValid(aSignal) && TP.notEmpty(this.get('$cellHash'))) {
        //  fake "reuse" here so we get back the original command cell
        aSignal.atPut('cmdAppend', true);
        outCell = this.getOutputCell(aSignal);

        if (TP.isValid(outCell)) {
            outCell.updateStats(aSignal);
        }
    }

    //  ---
    //  status context ID (execution window's global ID)
    //  ---

    str = '';
    if (TP.isWindow(canvasWin = TP.sys.getUICanvas(true))) {
        str = '' + TP.gid(canvasWin).sliceFrom('.', false, true);

        TP.htmlElementSetContent(TP.byId('status2', this.$get('vWin')),
            str, null, false);
    }

    //  ---
    //  logging level
    //  ---

    str = '' + TP.boot.Log.getStringForLevel(TP.sys.getLogLevel());
    TP.htmlElementSetContent(TP.byId('status3', this.$get('vWin')),
        str, null, false);

    //  ---
    //  keyboard modifiers pressed
    //  ---

    if (TP.isEvent(evt = aSignal.getEvent())) {

        arr = TP.ac();
        arr.push(aSignal.getCtrlKey() ? 'Ctrl' : null);
        arr.push(aSignal.getAltKey() ? 'Alt' : null);
        arr.push(aSignal.getMetaKey() ? 'Meta' : null);
        arr.push(aSignal.getShiftKey() ? 'Shift' : null);
        arr.compact();

        str = arr.join(':');
        TP.htmlElementSetContent(TP.byId('status1', this.$get('vWin')),
            str, null, false);
    }
    */

    return;
});

//  ------------------------------------------------------------------------
//  Input Management Methods
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('clearInput',
function() {

    /**
     * @name clearInput
     * @synopsis Clears the input cell.
     * @returns {TP.sherpa.console} The receiver.
     */

    var marker,
        editor,
    
        range;

    if (TP.isValid(marker = this.get('currentInputMarker'))) {

        range = marker.find();

        editor = this.get('textInput').$getEditorInstance();

        editor.setSelection(range.from, range.to);
        editor.replaceSelection('');

        this.teardownInputMark();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('focusInput',
function(select) {

    /**
     * @name focusInput
     * @synopsis
     * @param {Boolean} select True to select in addition.
     * @returns {TP.sherpa.console} The receiver.
     */

    //  We wrap this in a try...catch that does nothing because, on startup,
    //  it seems like the textfield isn't focusable on IE and this will
    //  throw an exception. It's not a big deal, except that this means that
    //  the text field will not focus on startup.
    try {
        if (select) {
            this.get('textInput').select();
        } else {
            this.get('textInput').focus();
        }
    } catch (e) {
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setInputContent',
function(anObject, shouldAppend) {

    /**
     * @name setInputContent
     * @synopsis Sets the value of the input cell, essentially 'pre-filling' the
     *     input area with content.
     * @description If shouldAppend is true, and the input cell already has
     *     content, a '.;\n' is appended to the front of the content.
     * @param {Object} anObject The object defining the input.
     * @param {Boolean} shouldAppend Whether or not to append the value of
     *     anObject to any existing content.
     * @returns {TP.sherpa.console} The receiver.
     * @todo
     */

    var textInput,

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

    textInput = this.get('textInput');
    if (TP.isTrue(shouldAppend)) {
        //if (TP.notEmpty(val = textInput.get('value'))) {
        //    val += '.;\n';
        //}
        val = '';

        val = val + TP.str(anObject);
    } else {
        val = TP.str(anObject);
    }

    editor = textInput.$getEditorInstance();

    if (TP.isValid(marker = this.get('currentInputMarker'))) {

        range = marker.find();

        start = range.from;

        editor.setSelection(range.from, range.to);
        editor.replaceSelection(val);

        end = textInput.getCursor();
    
        this.teardownInputMark();

    } else {
        start = textInput.getCursor();

        textInput.insertAtCursor(val);

        end = textInput.getCursor();
    }

    this.set('currentInputMarker',
                this.markInputRange({anchor: start, head: end}));

    (function() {
        this.focusInput();
        this.setCursorToEnd();

    }.bind(this)).afterUnwind();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('teardownInputMark',
function() {

    /**
     * @name teardownInputMark
     */

    if (TP.isValid(this.get('currentInputMarker'))) {
        this.get('currentInputMarker').clear();
        this.set('currentInputMarker', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('markInputRange',
function(aRange) {

    /**
     * @name markInputRange
     */

    return this.get('textInput').$getEditorInstance().markText(
        aRange.anchor,
        aRange.head,
        {
            'className': 'bordered-input',
            'startStyle': 'bordered-input-left',
            'endStyle': 'bordered-input-right',
            'atomic': false,
            'inclusiveLeft': false,
            'inclusiveRight': true,
        }
    );
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('shouldConcealInput',
function(aFlag) {

    /**
     * @name shouldConcealInput
     * @synopsis Returns false for now.
     * @param {Boolean} aFlag The new value to set.
     * @returns {Boolean} 
     */

    return false;
});

//  ------------------------------------------------------------------------
//  Output marking
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getInputStats',
function(aSignal) {

    /**
     * @name getInputStats
     * @synopsis
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

TP.sherpa.console.Inst.defineMethod('getInputTypeInfo',
function(aSignal) {

    /**
     * @name getInputTypeInfo
     * @synopsis
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

    if (TP.notValid(val)) {
        return '';
    }

    if (TP.isValid(val)) {

        str = '' + TP.tname(val);

        if (TP.isCollection(val) && TP.sys.cfg('tdc.type_collections', true)) {
            if (TP.isEmpty(val)) {
                str += '()';
            } else {
                values = val.getValues();
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

        if (TP.isEmpty(str) || (str === 'ready')) {
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

TP.sherpa.console.Inst.defineMethod('createOutputMark',
function(uniqueID, dataRecord) {

    /**
     * @name createOutputMark
     * @synopsis
     * @param
     * @param
     * @returns {TP.sherpa.console} The receiver.
     */

    var textInput,

        doc,
        outElem,

        marker,
        range,
        outputRange,
   
        hid,
        hidStr,

        cmdText,

        inputClass,

        statsStr,
 
        resultTypeStr,
 
        recordStr;

    textInput = this.get('textInput');

    doc = textInput.getNativeContentDocument();

    if (!TP.isElement(outElem = doc.getElementById(uniqueID))) {
        if (TP.isValid(marker = this.get('currentInputMarker'))) {
            range = marker.find();
            outputRange = {
                'from': {'line': range.to.line, 'ch': range.to.ch},
                'to': {'line': range.to.line, 'ch': range.to.ch + 1}
            };
        
            textInput.insertAtCursor(' ');
        } else {
            outputRange = {
                'from': textInput.getCursor('anchor'),
                'to': textInput.getCursor('head')
            };

            if (outputRange.from.line === outputRange.to.line &&
                    outputRange.from.ch === outputRange.to.ch) {
                textInput.insertAtCursor(' ');
                outputRange.to.ch = outputRange.to.ch + 1;
            }
        }

        textInput.refreshEditor();

        hid = dataRecord.at('hid');
        hidStr = TP.isEmpty(hid) ? '&#160;&#160;' : '!' + hid;

        cmdText = dataRecord.at('cmdtext');
        cmdText = cmdText.truncate(TP.sys.cfg('tdc.max_title', 70));

        //  TODO: Use this CSS class
        inputClass = dataRecord.at('inputclass');

        statsStr = this.getInputStats(dataRecord.at('request'));
        resultTypeStr = this.getInputTypeInfo(dataRecord.at('request'));

        recordStr = hidStr + ' ' +
                    cmdText + ' ' +
                    statsStr + ' ' +
                    resultTypeStr;

        outElem = this.createOutputMarkerAt(
            outputRange,
            uniqueID,
            recordStr);
    }

    outElem.innerHTML = '&hellip;';
    textInput.refreshEditor();

    if (outputRange.to.line === textInput.$getEditorInstance().lastLine()) {
        textInput.appendToLine('\n', TP.LAST);
    }

    this.teardownInputMark();

    this.adjustTextInputSize();

    console.log('Echo input text: ' + recordStr);

    this.movePromptMarkToCursor();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('updateOutputMark',
function(uniqueID, dataRecord) {

    /**
     * @name updateOutputMark
     * @synopsis
     * @param
     * @param
     * @returns {TP.sherpa.console} The receiver.
     */

    var textInput,

        doc,
        outElem,

        outputText,
        outputClass;

    textInput = this.get('textInput');

    doc = textInput.getNativeContentDocument();

    if (!TP.isElement(outElem = doc.getElementById(uniqueID))) {
    
        console.log('Couldn\'t find out cell for: ' + uniqueID);
        return this;
    }

    outputText = dataRecord.at('output');

    //  TODO: Use this CSS class
    outputClass = dataRecord.at('outputclass');

    outElem.innerHTML = outputText;

    this.adjustTextInputSize();

    console.log('Echo output text: ' + outputText);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('addLoggedValue',
function(dataRecord) {

    /**
     * @name addLoggedValue
     * @synopsis
     * @param
     * @returns {TP.sherpa.console} The receiver.
     */

    var outputText,
        outputClass;

    outputText = dataRecord.at('output');

    //  TODO: Use this CSS class
    outputClass = dataRecord.at('outputclass');

    TP.byOID('SherpaLogView').addProcessedContent(outputText + '\n');

    console.log('Echo logged text: ' + outputText);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('createOutputElement',
function(uniqueID) {

    /**
     * @name createOutputElement
     * @synopsis
     * @param
     * @returns
     */

    var doc,
        outSpan;

    doc = this.get('textInput').getNativeContentDocument();

    outSpan = doc.createElement('span');
    outSpan.className = 'output';
    outSpan.id = uniqueID;

    return outSpan;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('createOutputMarkerAt',
function(range, uniqueID, titleText) {

    /**
     * @name createOutputMarkerAt
     * @synopsis
     * @param
     * @param
     * @param
     * @returns
     */

    var elem,
        marker;

    elem = this.createOutputElement(uniqueID);

    marker = this.get('textInput').$getEditorInstance().markText(
        range.from,
        range.to,
        {
            'atomic': true,
            'collapsed': true,
            'replacedWith': elem,
            'inclusiveLeft': false,
            'inclusiveRight': false,
            'clearWhenEmpty': false
        }
    );

    TP.elementSetAttribute(elem, 'title', titleText);

    //  Wire a reference to the marker back onto our output element
    elem.marker = marker;

    return elem;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('findOutputMarks',
function(from, to) {

    /**
     * @name findOutputMarks
     * @synopsis
     * @param
     * @param
     * @returns
     */

    var editor,

        marks,
        results,
    
        elem,

        i;

    editor = this.get('textInput').$getEditorInstance();

    marks = editor.findMarks(from, to);
    results = TP.ac();

    for (i = 0; i < marks.length; i++) {
        if (TP.isElement(elem = marks[i].replacedWith) &&
            TP.elementHasClass(elem, 'output')) {
            results.push(marks[i]);
        }
    }

    return results;
});

//  ------------------------------------------------------------------------
//  Eval marking/value retrieval
//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('setupEvalMark',
function() {

    /**
     * @name setupEvalMark
     * @synopsis
     * @returns {TP.sherpa.console} The receiver.
     */

    var currentInputRange,
        newEvalRange;

    //  If the text input is empty, there is no reason to setup anything... exit
    //  here.
    if (TP.isEmpty(this.get('textInput').getValue())) {
        return this;
    }

    if (TP.isValid(this.get('currentInputMarker'))) {
        currentInputRange = this.get('currentInputMarker').find();
        newEvalRange = {'anchor': currentInputRange.from,
                        'head': currentInputRange.to};

        this.teardownInputMark();
    
        this.set('currentEvalMarker', this.markEvalRange(newEvalRange));

    } else if (TP.notValid(this.get('currentEvalMarker'))) {
        newEvalRange = this.computeEvalMarkRange();
    
        this.set('currentEvalMarker', this.markEvalRange(newEvalRange));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('shiftEvalMark',
function(direction, endPoint) {

    /**
     * @name shiftEvalMark
     * @synopsis
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
    if (TP.notValid(cimRange)) {
        return this;
    }

    editor = this.get('textInput').$getEditorInstance();

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

        if (endPoint === TP.HEAD) {
        } else {
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

    this.set('currentEvalMarker', this.markEvalRange(cimRange));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('teardownEvalMark',
function() {

    /**
     * @name teardownEvalMark
     * @synopsis
     * @returns {TP.sherpa.console} The receiver.
     */

    if (TP.isValid(this.get('currentEvalMarker'))) {
        this.get('currentEvalMarker').clear();
        this.set('currentEvalMarker', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('getEvalValue',
function() {

    /**
     * @name getEvalValue
     * @synopsis Returns the value currently considered the 'input value'
     * @returns {String} The user's input.
     */

    var inputText,
   
        marker,

        editor,
        range;

    inputText = null;

    //  Try to set up an eval mark
    if (TP.notValid(this.get('currentEvalMarker'))) {
        this.setupEvalMark();
    }

    //  Only compute the text if you get a valid range
    if (TP.isValid(marker = this.get('currentEvalMarker')) &&
            TP.isValid(range = marker.find())) {
        editor = this.get('textInput').$getEditorInstance();
        inputText = editor.getRange(range.from, range.to);
    } else {
        this.teardownEvalMark();
    }

    return inputText;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('computeEvalMarkRangeAnchor',
function() {

    /**
     * @name computeEvalMarkRangeAnchor
     * @synopsis
     * @returns
     */

    var editor,
    
        head,

        matcher,

        searchCursor,
        lineInfo,
        retVal,
        marks;

    if (TP.isValid(promptMark = this.get('currentPromptMarker'))) {
        range = promptMark.find();
        retVal = range.to;
    } else {
        editor = this.get('textInput').$getEditorInstance();

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
            retVal = {line: 0, ch:0};
        }

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
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('computeEvalMarkRangeHead',
function() {

    /**
     * @name computeEvalMarkRangeHead
     * @synopsis
     * @returns
     */

    var editor,
    
        anchor,
        searchCursor,
        lineInfo,
        retVal,
        marks;

    editor = this.get('textInput').$getEditorInstance();

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

    //  See if there are any output marks between the anchor and head
    marks = this.findOutputMarks(anchor, retVal);
    if (marks.length > 0) {
        retVal = marks[0].find().from;
    }

    //  If the 'ch' is at the beginning of the line, decrement the line and set
    //  the 'ch' to end of the line
    if (retVal.ch === 0) {
        lineInfo = editor.lineInfo(retVal.line - 1);
        retVal = {line: Math.max(retVal.line - 1, 0),
                    ch: lineInfo.text.length};
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('computeEvalMarkRange',
function() {

    /**
     * @name computeEvalMarkRange
     * @synopsis
     * @returns
     */

    var editor,
    
        selection,
        range;

    editor = this.get('textInput').$getEditorInstance();

    //  If there are real selections, then just use the first one
    selection = editor.getSelection();
    if (selection.length > 0) {
        return editor.listSelections()[0];
    }

    range = {'anchor': this.computeEvalMarkRangeAnchor(),
                'head': this.computeEvalMarkRangeHead()};

    return range;
});

//  ------------------------------------------------------------------------

TP.sherpa.console.Inst.defineMethod('markEvalRange',
function(aRange) {

    /**
     * @name markEvalRange
     * @synopsis
     * @returns
     */

    return this.get('textInput').$getEditorInstance().markText(
        aRange.anchor,
        aRange.head,
        {
            'className': 'bordered-eval',
            'startStyle': 'bordered-eval-left',
            'endStyle': 'bordered-eval-right',
            'atomic': true,
            'inclusiveLeft': false,
            'inclusiveRight': false,
        }
    );
});

//  ========================================================================
//  end
//  ========================================================================
