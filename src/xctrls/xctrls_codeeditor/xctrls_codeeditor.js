//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.codeeditor}
 * @summary A subtype of TP.xctrls.FramedElement that wraps the CodeMirror code
 *     editor.
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('codeeditor');

//  Events:
//      xctrls-codeeditor-selected

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Type.defineConstant('XML_MODE', 'xml');
TP.xctrls.codeeditor.Type.defineConstant('CSS_MODE', 'css');
TP.xctrls.codeeditor.Type.defineConstant('JS_MODE', 'javascript');

TP.xctrls.codeeditor.addTraits(TP.html.textUtilities);

TP.xctrls.codeeditor.Type.resolveTrait('booleanAttrs', TP.html.textUtilities);

TP.xctrls.codeeditor.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue'),
        TP.xctrls.codeeditor);
TP.xctrls.codeeditor.Inst.resolveTraits(
        TP.ac('getValue', 'setValue'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj,
        output;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail('No command instance.');
    }

    if (TP.notValid(output = obj.getValue())) {
        return aRequest.fail('No content.');
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
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        content;

    if (TP.isEmpty(input = aRequest.stdin())) {
        return aRequest.fail('No content.');
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail('No command instance.');
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

TP.xctrls.codeeditor.Inst.defineAttribute('$editorObj');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.core.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.xctrls.FramedElement} A new instance.
     */

    var editorObj;

    this.callNextMethod();

    /* eslint-disable new-cap */
    editorObj = TP.extern.CodeMirror(this.getNativeNode());
    /* eslint-enable new-cap */

    this.$set('$editorObj', editorObj);

    //  Make sure and flag the native node to not track mutations. This is a
    //  huge performance win when dealing with CodeMirror.
    TP.elementSetAttribute(
        this.getNativeNode(), 'tibet:nomutationtracking', true, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('appendToLine',
function(aText, line) {

    /**
     * @method appendToLine
     * @param {String} aText The text to insert.
     * @param {String} line The line number to insert the text at the end of.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor,
        theLine,
        lineInfo;

    editor = this.$get('$editorObj');

    if (line === TP.LAST) {
        theLine = editor.lastLine();
    } else {
        theLine = line;
    }

    lineInfo = editor.lineInfo(theLine);
    editor.replaceRange(
        aText,
        this.createPos(theLine, lineInfo.text.length));

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, '', TP.NEWVAL, aText));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('createPos',
function(line, ch) {

    /**
     * @method createPos
     * @param
     * @param
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    /* eslint-disable new-cap */
    return TP.extern.CodeMirror.Pos(line, ch);
    /* eslint-enable new-cap */
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('executeMode',
function(aText, aMode, tokenizeCallback) {

    /**
     * @method executeMode
     * @summary Executes a CodeMirror 'mode' 'outside' of the editor. This
     *     method is useful for tokenizing a particular string.
     * @param {String} aText The string to execute the mode on.
     * @param {String} aMode The name of the CodeMirror 'mode' to execute on the
     *     supplied String.
     * @param {Function} tokenizeCallback The function to execute each time a
     *     token is encountered. This function accepts two parameters, the token
     *     value and the token 'type' (which is a name that CodeMirror uses to
     *     style it - e.g. 'number').
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    TP.extern.CodeMirror.runMode(aText, aMode, tokenizeCallback);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @param {Constant} moveAction The type of 'move' that the user requested.
     *     This can be one of the following:
     *          TP.FIRST
     *          TP.LAST
     *          TP.NEXT
     *          TP.PREVIOUS
     *          TP.FIRST_IN_GROUP
     *          TP.LAST_IN_GROUP
     *          TP.FIRST_IN_NEXT_GROUP
     *          TP.FIRST_IN_PREVIOUS_GROUP
     *          TP.FOLLOWING
     *          TP.PRECEDING.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').focus();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getCursor',
function(start) {

    /**
     * @method getCursor
     * @param
     * @returns
     */

    return this.$get('$editorObj').getCursor(start);
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.$get('$editorObj').getValue();
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getEditorHeight',
function() {

    /**
     * @method getEditorHeight
     * @summary Returns the overall height of the editor in pixels.
     * @returns {Number} The height of the editor in pixels.
     */

    return TP.elementGetHeight(this.$get('$editorObj').display.sizer);
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('insertAtCursor',
function(aText) {

    /**
     * @method insertAtCursor
     * @summary Inserts the supplied text at the cursor position. Note that
     *     this method alters the current selection.
     * @param {String} aText The text to insert.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor;

    editor = this.$get('$editorObj');

    editor.setSelection(editor.getCursor(), editor.getCursor());
    editor.replaceSelection(aText);

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, '', TP.NEWVAL, aText));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('refreshEditor',
function() {

    /**
     * @method refreshEditor
     * @summary Redraws the editor, flushing any DOM changes.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').refresh();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('select',
function() {

    /**
     * @method select
     * @summary Selects the receiver for keyboard input (this also focuses the
     *     receiver).
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor,
        lastLineInfo;

    editor = this.$get('$editorObj');
    if (TP.notValid(lastLineInfo = editor.lineInfo(editor.lastLine()))) {
        return this;
    }

    editor.setSelection({line: 0, ch: 0},
                        {line: lastLineInfo.line,
                            ch: lastLineInfo.text.length});

    this.focus();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editorObj;

    //  TODO: Detect CSS and set the proper parser

    if (TP.regex.CONTAINS_ELEM_MARKUP.test(aValue)) {
        this.setEditorMode(this.getType().XML_MODE);
    } else {
        this.setEditorMode(this.getType().JS_MODE);
    }

    editorObj = this.$get('$editorObj');
    editorObj.setValue(aValue);

    /* eslint-disable no-extra-parens */
    (function() {
        editorObj.refresh();
    }).afterUnwind();
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setEditorEventHandler',
function(eventName, aHandlerFunc) {

    /**
     * @method setEditorEventHandler
     * @summary Registers the supplied handler Function as the event handler
     *     for the named event.
     * @param {String} eventName The CodeMirror event name.
     * @param {Function} aHandlerFunc The function to supply to CodeMirror as
     *     the event handler function. This Function takes different parameters
     *     depending on the event, but there is always 1: the editor instance
     *     itself.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').on(eventName, aHandlerFunc);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setEditorMode',
function(modeConst) {

    /**
     * @method setEditorMode
     * @summary Sets the editor 'mode' (i.e. the CodeMirror mode that is used
     *     for tokenization).
     * @param {String} modeConst The CodeMirror mode name.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').setOption('mode', modeConst);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setEditorTheme',
function(themeName) {

    /**
     * @method setEditorTheme
     * @summary Sets the editor 'theme' (i.e. the CodeMirror theme currently in
     *     force.
     * @param {String} themeName The CodeMirror theme name.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').setOption('theme', themeName);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setKeyHandler',
function(aHandlerFunc) {

    /**
     * @method setKeyHandler
     * @summary Sets the CodeMirror key handling function to the supplied
     *     function.
     * @param {Function} aHandlerFunc The function to supply to CodeMirror as
     *     the key handling function. This Function takes 2 parameters: The
     *     editor instance and the raw key event. It should return false if it
     *     does *not* want CodeMirror to handle the event.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var cmHandlerFunc,
        editor;

    cmHandlerFunc =
        function(cmObj, evt) {
            aHandlerFunc(evt);
        };

    editor = this.$get('$editorObj');
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
     * @method setShowLineNumbers
     * @summary Sets whether or not the editor will show line numbers.
     * @param {Boolean} shouldShow Whether or not to show line numbers.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').setOption('lineNumbers', shouldShow);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setWrap',
function(shouldWrap) {

    /**
     * @method setWrap
     * @summary Sets whether the editor should wrap its text or not.
     * @param {Boolean} shouldWrap Whether or not the editor content should wrap.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').lineWrapping = shouldWrap;

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('unsetCurrentKeyHandler',
function() {

    /**
     * @method unsetCurrentKeyHandler
     * @summary Removes the currently set CodeMirror key handling function.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var cmHandlerFunc,
        editor;

    if (!TP.isCallable(cmHandlerFunc = this.get('$currentKeyHandler'))) {
        return this;
    }

    editor = this.$get('$editorObj');
    editor.off('keydown', cmHandlerFunc);
    editor.off('keyup', cmHandlerFunc);
    editor.off('keypress', cmHandlerFunc);

    this.set('$currentKeyHandler', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('unsetEditorEventHandler',
function(eventName, aHandlerFunc) {

    /**
     * @method unsetEditorEventHandler
     * @summary Unregisters the supplied handler Function as the event handler
     *     for the named event.
     * @param {String} eventName The CodeMirror event name.
     * @param {Function} aHandlerFunc The function to supply to CodeMirror as
     *     the event handler function. This Function takes different parameters
     *     depending on the event, but there is always 1: the editor instance
     *     itself.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').off(eventName, aHandlerFunc);

    return this;
});

//  ------------------------------------------------------------------------
//  textUtilities methods
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('clearValue',
function() {

    /**
     * @method clearValue
     * @summary Clears the entire value of the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal;

    oldVal = this.$get('$editorObj').getValue();

    this.$get('$editorObj').setValue('');

    this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('clearSelection',
function() {

    /**
     * @method clearSelection
     * @summary Clears the currently selected text.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal;

    oldVal = this.getSelection();

    this.$get('$editorObj').replaceSelection('');

    this.changed('selection', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('collapseSelection',
function(toStart) {

    /**
     * @method collapseSelection
     * @summary Collapse the current selection to one end or the other.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor,

        selections,
        selection,

        first,
        last;

    editor = this.$get('$editorObj');

    //  We collapse only the first selection
    selections = editor.listSelections();
    if (TP.isEmpty(selections) || TP.notValid(selection = selections.first())) {
        return this;
    }

    //  If selection is already collapsed, just exit here.
    if (selection.anchor.line === selection.head.line &&
        selection.anchor.ch === selection.head.ch) {
        return this;
    }

    if (selection.anchor.line < selection.head.line) {
        first = selection.anchor;
        last = selection.head;
    } else if (selection.anchor.line === selection.head.line) {
        if (selection.anchor.ch < selection.head.ch) {
            first = selection.anchor;
            last = selection.head;
        } else {
            first = selection.head;
            last = selection.anchor;
        }
    } else if (selection.anchor.line > selection.head.line) {
        first = selection.head;
        last = selection.anchor;
    }

    if (toStart) {
        editor.setSelection(first, last);
    } else {
        editor.setSelection(last, first);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getSelection',
function() {

    /**
     * @method getSelection
     * @summary Returns the currently selected text. Note that if there are
     *      multiple selections present, they are returned with a value of
     *      TP.JOIN between them.
     * @returns {String} The currently selected text.
     */

    return this.$get('$editorObj').getSelection(TP.JOIN);
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getSelectionEnd',
function() {

    /**
     * @method getSelectionEnd
     * @summary Returns the ending index of the currently selected text.
     * @returns {Number} The ending index of the current selection.
     */

    return this.$get('$editorObj').getCursor('to').ch;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getSelectionStart',
function() {

    /**
     * @method getSelectionStart
     * @summary Returns the starting index of the currently selected text.
     * @returns {Number} The starting index of the current selection.
     */

    return this.$get('$editorObj').getCursor('from').ch;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('insertAfterSelection',
function(aText) {

    /**
     * @method insertAfterSelection
     * @summary Inserts the supplied text after the current selection.
     * @param {String} aText The text to insert.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$get('$editorObj').replaceSelection(TP.join(oldVal, aText));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('insertBeforeSelection',
function(aText) {

    /**
     * @method insertBeforeSelection
     * @summary Inserts the supplied text before the current selection.
     * @param {String} aText The text to insert before the current selection.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$get('$editorObj').replaceSelection(TP.join(aText, oldVal));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('replaceSelection',
function(aText) {

    /**
     * @method replaceSelection
     * @summary Replaces the current selection with the supplied text.
     * @param {String} aText The text to replace the current selection with.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$get('$editorObj').replaceSelection(aText);

    newVal = this.getSelection();

    this.changed('selection', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('selectFromTo',
function(aStartIndex, anEndIndex) {

    /**
     * @method selectFromTo
     * @summary Selects the contents of the receiver from the supplied starting
     *     index to the supplied ending index.
     * @param {Number} aStartIndex The starting index.
     * @param {Number} aEndIndex The ending index.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor,

        startCoords,
        endCoords;

    editor = this.$get('$editorObj');

    startCoords = editor.posFromIndex(aStartIndex);
    endCoords = editor.posFromIndex(anEndIndex);

    editor.setSelection(startCoords, endCoords);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setCursorPosition',
function(aPosition) {

    /**
     * @method setCursorPosition
     * @summary Sets the cursor to the supplied position.
     * @param {Number} aPosition The desired cursor position.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor,
        coords;

    editor = this.$get('$editorObj');

    coords = editor.posFromIndex(aPosition);

    editor.setCursor(coords);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @method setCursorToEnd
     * @summary Sets the cursor to the end position of the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor,
        lastLineInfo;

    editor = this.$get('$editorObj');
    if (TP.notValid(lastLineInfo = editor.lineInfo(editor.lastLine()))) {
        return this;
    }

    editor.setCursor({line: lastLineInfo.line,
                        ch: lastLineInfo.text.length});

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setCursorToStart',
function() {

    /**
     * @method setCursorToStart
     * @summary Sets the cursor to the start position of the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').setCursor({line: 0, ch: 0});

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setSelection',
function(aText) {

    /**
     * @method setSelection
     * @summary Sets the current selection to the supplied text.
     * @param {String} aText The text to set the selection to.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    //  This method is just an alias for replaceSelection()
    this.replaceSelection(aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('wrapSelection',
function(beforeText, afterText) {

    /**
     * @method wrapSelection
     * @summary Wraps the current selection with the beforeText and afterText.
     * @param {String} beforeText The text to insert before the selection.
     * @param {String} afterText The text to insert after the selection.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.replaceSelection(TP.join(beforeText, this.getSelection(), afterText));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
