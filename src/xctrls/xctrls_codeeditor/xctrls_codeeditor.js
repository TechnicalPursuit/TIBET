//  ========================================================================
/*
NAME:   xctrls_codeeditor.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.codeeditor}
 * @synopsis A subtype of TP.xctrls.FramedElement that wraps the CodeMirror code
 *     editor.
 */

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.defineSubtype('codeeditor');

TP.xctrls.codeeditor.shouldRegisterInstances(true);

//  Events:
//      xctrls-codeeditor-selected

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Type.defineConstant('XML_MODE', 'xml');
TP.xctrls.codeeditor.Type.defineConstant('CSS_MODE', 'css');
TP.xctrls.codeeditor.Type.defineConstant('JS_MODE', 'javascript');

//  A URI to the 'frame file' - the file that will be loaded into the
//  iframe that this type builds to hold the custom control.
TP.xctrls.codeeditor.set('frameFileURI',
    TP.uc('~lib_src/xctrls/xctrls_codeeditor/xctrls_codeeditor_stub.html'));

TP.xctrls.codeeditor.addTraitsFrom(TP.html.textUtilities);

TP.xctrls.codeeditor.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.xctrls.FramedElement);

TP.xctrls.codeeditor.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @name cmdGetContent
     * @synopsis Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj,
        output;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail(TP.FAILURE, 'No command instance.');
    }

    if (TP.notValid(output = obj.getValue())) {
        return aRequest.fail(TP.FAILURE, 'No content.');
    } else {
        output = TP.join('<span xmlns="', TP.w3.Xmlns.XHTML, '">',
                            output,
                            '</span>');

        return aRequest.complete(output);
    }
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @name cmdSetContent
     * @synopsis Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        content;

    if (TP.isEmpty(input = aRequest.stdin())) {
        return aRequest.fail(TP.FAILURE, 'No content.');
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail(TP.FAILURE, 'No command instance.');
    }

    //  stdin is always an Array, so we want the first item.
    content = input.at(0);

    obj.setContent(content, aRequest);

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineAttribute('$oldSelectionLength');
TP.xctrls.codeeditor.Inst.defineAttribute('$currentKeyHandler');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('configure',
function() {

    /**
     * @name configure
     * @synopsis Configure the custom element as part of the startup process.
     *     This is called from the iframe's 'onload' hook and provides a
     *     mechanism for further processing after the content in the iframe has
     *     been completely loaded and initialized.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.refresh();

    //  Make sure to 'call up' so that signaling of 'TP.sig.DOMReady'
    //  occurs.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('executeMode',
function(aText, aMode, tokenizeCallback) {

    /**
     * @name executeMode
     * @synopsis Executes a CodeMirror 'mode' 'outside' of the editor. This
     *     method is useful for tokenizing a particular string.
     * @param {String} aText The string to execute the mode on.
     * @param {String} aMode The name of the CodeMirror 'mode' to execute on the
     *     supplied String.
     * @param {Function} tokenizeCallback The function to execute each time a
     *     token is encountered. This function accepts two parameters, the token
     *     value and the token 'type' (which is a name that CodeMirror uses to
     *     style it - e.g. 'number').
     * @returns {TP.xctrls.codeeditor} The receiver.
     * @todo
     */

    this.$getEditorConstructor().runMode(aText, aMode, tokenizeCallback);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('focus',
function() {

    /**
     * @name focus
     * @synopsis Focuses the receiver for keyboard input.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$getEditorInstance().focus();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.$getEditorInstance().getValue();
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('$getEditorConstructor',
function() {

    /**
     * @name $getEditorConstructor
     * @synopsis Returns the internal CodeMirror editor constructor.
     * @returns {Object} The internal CodeMirror editor constructor.
     */

    return this.get('tpIFrame').getNativeContentWindow().CodeMirror;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('$getEditorInstance',
function() {

    /**
     * @name $getEditorInstance
     * @synopsis Returns the internal CodeMirror editor instance.
     * @returns {Object} The internal CodeMirror editor instance.
     */

    return this.get('tpIFrame').get('cmEditor');
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @todo
     */

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('select',
function() {

    /**
     * @name select
     * @synopsis Selects the receiver for keyboard input (this also focuses the
     *     receiver).
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor,
        lastLineInfo;

    editor = this.$getEditorInstance();
    if (TP.notValid(lastLineInfo = editor.lineInfo(editor.lineCount() - 1))) {
        return this;
    }

    editor.setSelection({line: 0, ch: 0},
                        {line: editor.lineCount() - 1,
                            ch: lastLineInfo.text.length});

    this.focus();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    //  TODO: Detect CSS and set the proper parser

    if (TP.regex.CONTAINS_ELEM_MARKUP.test(aValue)) {
        this.setEditorMode(this.getType().XML_MODE);
    } else {
        this.setEditorMode(this.getType().JS_MODE);
    }

    this.$getEditorInstance().setValue(aValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setEditorMode',
function(modeConst) {

    /**
     * @name setEditorMode
     * @synopsis Sets the editor 'mode' (i.e. the CodeMirror mode that is used
     *     for tokenization).
     * @param {String} modeConst The CodeMirror mode name.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.$getEditorInstance().setOption('mode', modeConst);
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setEditorTheme',
function(themeName) {

    /**
     * @name setEditorTheme
     * @synopsis Sets the editor 'theme' (i.e. the CodeMirror theme currently in
     *     force.
     * @param {String} themeName The CodeMirror theme name.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.$getEditorInstance().setOption('theme', themeName);
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setKeyHandler',
function(aHandlerFunc) {

    /**
     * @name setKeyHandler
     * @synopsis Sets the CodeMirror key handling function to the supplied
     *     function.
     * @param {Function} aHandlerFunc The function to supply to CodeMirror as
     *     the key handling function. This Function takes 2 parameters: The
     *     editor instance and the raw key event. It should return false if it
     *     does *not* want CodeMirror to handle the event.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var cmHandlerFunc,
        editor;

    cmHandlerFunc = function(editor, evt) {

            aHandlerFunc(evt);
        };

    editor = this.$getEditorInstance();
    editor.on('keydown', cmHandlerFunc);
    editor.on('keyup', cmHandlerFunc);
    editor.on('keypress', cmHandlerFunc);

    this.set('$currentKeyHandler', cmHandlerFunc);
    
    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setShowLineNumbers',
function(shouldShow) {

    /**
     * @name setShowLineNumbers
     * @synopsis
     * @param {Boolean} shouldShow The CodeMirror mode name.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.$getEditorInstance().setOption('lineNumbers', shouldShow);
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('unsetCurrentKeyHandler',
function() {

    /**
     * @name unsetCurrentKeyHandler
     * @synopsis Removes the currently set CodeMirror key handling function.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var cmHandlerFunc,
        editor;

    if (!TP.isCallable(cmHandlerFunc = this.get('$currentKeyHandler'))) {
        return this;
    }

    editor = this.$getEditorInstance();
    editor.off('keydown', cmHandlerFunc);
    editor.off('keyup', cmHandlerFunc);
    editor.off('keypress', cmHandlerFunc);

    this.set('$currentKeyHandler', null);
    
    return this;
});

//  ------------------------------------------------------------------------
//  textUtilities methods
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('clearValue',
function() {

    /**
     * @name clearValue
     * @synopsis Clears the entire value of the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal;

    oldVal = this.$getEditorInstance().getValue();

    this.$getEditorInstance().setValue('');

    this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('clearSelection',
function() {

    /**
     * @name clearSelection
     * @synopsis Clears the currently selected text.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal;

    oldVal = this.getSelection();

    this.$getEditorInstance().replaceSelection('');

    this.changed('selection', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('collapseSelection',
function(toStart) {

    /**
     * @name collapseSelection
     * @synopsis Collapse the current selection to one end or the other.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @returns {TP.xctrls.codeeditor} The receiver.
     * @todo
     */

    /* TODO: Needs to be updated to CodeMirror 4.X codebase
    var editor,

        startCoords,
        endCoords;

    editor = this.$getEditorInstance();

    startCoords = editor.coordsFromIndex(0);
    endCoords = editor.coordsFromIndex(this.getValue().getSize() - 1);

    if (toStart) {
        editor.setSelection(startCoords, startCoords);
    } else {
        editor.setSelection(endCoords, endCoords);
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getSelection',
function() {

    /**
     * @name getSelection
     * @synopsis Returns the currently selected text.
     * @returns {String} The currently selected text.
     */

    /* TODO: Needs to be updated to CodeMirror 4.X codebase
    return this.$getEditorInstance().getSelection();
    */
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getSelectionEnd',
function() {

    /**
     * @name getSelectionEnd
     * @synopsis Returns the ending index of the currently selected text.
     * @returns {Number} The ending index of the current selection.
     */

    /* TODO: Needs to be updated to CodeMirror 4.X codebase
    return this.$getEditorInstance().getCursor().ch;
    */
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getSelectionStart',
function() {

    /**
     * @name getSelectionStart
     * @synopsis Returns the starting index of the currently selected text.
     * @returns {Number} The starting index of the current selection.
     */

    /* TODO: Needs to be updated to CodeMirror 4.X codebase
    return this.$getEditorInstance().getCursor(true).ch;
    */
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('insertAfterSelection',
function(aText) {

    /**
     * @name insertAfterSelection
     * @synopsis Inserts the supplied text after the current selection.
     * @param {String} aText The text to insert.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$getEditorInstance().replaceSelection(TP.join(oldVal, aText));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('insertBeforeSelection',
function(aText) {

    /**
     * @name insertBeforeSelection
     * @synopsis Inserts the supplied text before the current selection.
     * @param {String} aText The text to insert before the current selection.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$getEditorInstance().replaceSelection(TP.join(aText, oldVal));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('replaceSelection',
function(aText) {

    /**
     * @name replaceSelection
     * @synopsis Replaces the current selection with the supplied text.
     * @param {String} aText The text to replace the current selection with.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$getEditorInstance().replaceSelection(aText);

    newVal = this.getSelection();

    this.changed('selection', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('selectFromTo',
function(aStartIndex, anEndIndex) {

    /**
     * @name selectFromTo
     * @synopsis Selects the contents of the receiver from the supplied starting
     *     index to the supplied ending index.
     * @param {Number} aStartIndex The starting index.
     * @param {Number} aEndIndex The ending index.
     * @returns {TP.xctrls.codeeditor} The receiver.
     * @todo
     */

    /* TODO: Needs to be updated to CodeMirror 4.X codebase
    var editor,

        startCoords,
        endCoords;

    editor = this.$getEditorInstance();

    startCoords = editor.coordsFromIndex(aStartIndex);
    endCoords = editor.coordsFromIndex(anEndIndex);

    editor.setSelection(startCoords, endCoords);
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @name setCursorToEnd
     * @synopsis Sets the cursor to the end position of the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor,
        lastLineInfo;

    editor = this.$getEditorInstance();
    if (TP.notValid(lastLineInfo = editor.lineInfo(editor.lastLine()))) {
        return this;
    }

    editor.setCursor({line: editor.lastLine(),
                        ch: lastLineInfo.text.length});

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setCursorToStart',
function() {

    /**
     * @name setCursorToStart
     * @synopsis Sets the cursor to the start position of the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$getEditorInstance().setCursor({line: 0, ch: 0});

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setSelection',
function(aText) {

    /**
     * @name setSelection
     * @synopsis Sets the current selection to the supplied text.
     * @param {String} aText The text to set the selection to.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    //  This method is just an alias for replaceSelection()
    this.replaceSelection(aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setWrap',
function(shouldWrap) {

    /**
     * @name setWrap
     * @synopsis Sets whether the editor should wrap its text or not.
     * @param {String} shouldWrap Whether or not the editor content should wrap.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$getEditorInstance().lineWrapping = shouldWrap;

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('wrapSelection',
function(beforeText, afterText) {

    /**
     * @name wrapSelection
     * @synopsis Wraps the current selection with the beforeText and afterText.
     * @param {String} beforeText The text to insert before the selection.
     * @param {String} afterText The text to insert after the selection.
     * @returns {TP.xctrls.codeeditor} The receiver.
     * @todo
     */

    this.replaceSelection(TP.join(beforeText, this.getSelection(), afterText));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
