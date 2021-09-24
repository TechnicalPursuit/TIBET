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
 * @type {TP.xctrls.editor}
 * @summary A subtype of TP.xctrls.FramedElement that wraps the CodeMirror code
 *     editor.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:editor');

//  Events:
//      xctrls-editor-selected

TP.xctrls.editor.addTraits(TP.html.textUtilities);

TP.xctrls.editor.Type.resolveTrait('booleanAttrs', TP.html.textUtilities);
TP.xctrls.editor.Type.resolveTrait('getResourceURI', TP.xctrls.editor);

TP.xctrls.editor.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue'),
        TP.xctrls.editor);
TP.xctrls.editor.Inst.resolveTraits(
        TP.ac('getValue', 'setValue'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  The maximum number of lines to use when autosizing to content. If this value
//  is over 1000, performance of the ACE editor can suffer.
TP.xctrls.editor.defineAttribute('MAX_LINES', 1000);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The set of CodeMirror modules that will be loaded to support our operation.
TP.xctrls.editor.Type.defineAttribute('$cmModules');

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.editor.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    TP.sys.importModules(
        TP.ac(
            '@codemirror/basic-setup',
            '@codemirror/lang-javascript',
            '@codemirror/highlight',
            '@codemirror/commands',
            '@codemirror/state',
            '@codemirror/view'
        )).then(
        function(modules) {
            this.set('$cmModules', modules);
        }.bind(this));

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Type.defineMethod('cmdGetContent',
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

TP.xctrls.editor.Type.defineMethod('cmdSetContent',
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

TP.xctrls.editor.Type.defineMethod('runMode',
function(textContent, language, callback) {

    /**
     * @method runMode
     * @summary Invokes the CodeMirror language highlighting machinery outside
     *     of an instance of an editor to highlight the supplied String.
     * @param {String} textContent The content to 'mark up' with CodeMirror
     *     highlighting.
     * @param {Language} language A CodeMirror language object. This will
     *     default to JavaScript if one is not supplied.
     * @param {Function} callback The callback function that will be invoked for
     *     each token.
     */

    var modules,
        lang,
        pos,
        tree;

    //  Bring in the CodeMirror modules and grab the slots that matter to us.
    modules = this.get('$cmModules');

    const {highlightTree, defaultHighlightStyle} =
                modules.at('@codemirror/highlight');

    if (TP.notValid(language)) {
        ({javascriptLanguage: lang} = modules.at('@codemirror/lang-javascript'));
    } else {
        lang = language;
    }

    tree = lang.parser.parse(textContent);

    pos = 0;
    highlightTree(
        tree,
        defaultHighlightStyle.match,
        function(from, to, classes) {
            if (from > pos) {
                callback(textContent.slice(pos, from), '', pos, from);
            }
            callback(textContent.slice(from, to), classes, from, to);
            pos = to;
        });

    if (pos !== tree.length) {
        callback(textContent.slice(pos, tree.length), '', pos, tree.length);
    }
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineAttribute('$editorObj');
TP.xctrls.editor.Inst.defineAttribute('$keymapCompartment');
TP.xctrls.editor.Inst.defineAttribute('$tabKeyMap');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.editor.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.setup();

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.wrap(elem).teardown();

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Type.defineMethod('tagResolve',
function(aRequest) {

    /**
     * @method tagResolve
     * @summary Resolves the receiver's content. This includes resolving XML
     *     Base URIs and virtual URIs that may occur on the receiver's
     *     attributes.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  Set the attribute to not trap dragging in the TIBET D&D system, but
    //  allow targets of this type to do their natural drag operation (which, in
    //  this case, is selecting text).
    TP.elementSetAttribute(elem, 'tibet:no-dragtrap', 'true', true);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('appendToLine',
function(aText, line) {

    /**
     * @method appendToLine
     * @param {String} aText The text to insert.
     * @param {String} line The line number to insert the text at the end of.
     * @returns {TP.xctrls.editor} The receiver.
     */

    return TP.todo('appendToLine');
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('findAndScrollTo',
function(aStringOrRegExp) {

    /**
     * @method findAndScrollTo
     * @summary Finds the text using the supplied String or RegExp in the
     *     receiver, scrolls to it and centers its scroll in the receiver's
     *     visible area.
     * @param {String|RegExp} aStringOrRegExp The String or RegExp to use to
     *     find the text to scroll to.
     * @returns {TP.xctrls.editor} The receiver.
     */

    return TP.todo('findAndScrollTo');
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @param {String} moveAction The type of 'move' that the user requested.
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
     *          TP.PRECEDING
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        editorObj.focus();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('getCursor',
function(start) {

    /**
     * @method getCursor
     * @summary Returns the current position of the cursor.
     * @param {String} [start=anchor] A value indicating where to measure the
     *     cursor at. This should be one of the following values: 'from', 'to',
     *     'head', 'anchor'. See the CodeMirror manual for more details.
     * @returns {Number} The position of the cursor based.
     */

    var editorObj,
        prop;

    prop = TP.ifInvalid(start, 'anchor');

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        return editorObj.state.selection.main[prop];
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var editorObj;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        return editorObj.state.doc.toString();
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('hasFocus',
function(includeDescendants) {

    /**
     * @method hasFocus
     * @summary Returns whether or not the receiver (or any of its descendants,
     *     by default), are currently the focused element.
     * @param {Boolean} [includeDescendants=true] Should descendant elements be
     *     considered when trying to determine whether the receiver has focus.
     * @returns {Boolean} Whether or not the receiver has focus.
     */

    var editorObj;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        return editorObj.hasFocus;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('insertAtCursor',
function(aText) {

    /**
     * @method insertAtCursor
     * @summary Inserts the supplied text at the cursor position. Note that
     *     this method alters the current selection.
     * @param {String} aText The text to insert.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        editorObj.setSelection(editorObj.getCursor(), editorObj.getCursor());
        editorObj.replaceSelection(aText);

        this.changed('selection', TP.INSERT,
                            TP.hc(TP.OLDVAL, '', TP.NEWVAL, aText));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('select',
function() {

    /**
     * @method select
     * @summary Selects the receiver for keyboard input (this also focuses the
     *     receiver).
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj,
        endPosition;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        endPosition = editorObj.state.doc.toString().length;
        editorObj.dispatch({
            selection: {
                anchor: 0,
                head: endPosition
            }
        });
    }

    this.focus();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj,
        endPosition;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        endPosition = editorObj.state.doc.toString().length;
        editorObj.dispatch({
            changes: {
                from: 0,
                to: endPosition,
                insert: aValue
            },
            selection: {
                anchor: 0
            }
        });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setShowLineNumbers',
function(shouldShow) {

    /**
     * @method setShowLineNumbers
     * @summary Sets whether or not the editor will show line numbers.
     * @param {Boolean} shouldShow Whether or not to show line numbers.
     * @returns {TP.xctrls.editor} The receiver.
     */

    return TP.todo('setShowLineNumbers');
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setWrap',
function(shouldWrap) {

    /**
     * @method setWrap
     * @summary Sets whether the editor should wrap its text or not.
     * @param {Boolean} shouldWrap Whether or not the editor content should wrap.
     * @returns {TP.xctrls.editor} The receiver.
     */


    var editorObj;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        editorObj.lineWrapping = shouldWrap;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var modules,
        tabKeyMap,
        keymapCompartment,
        theme,
        editorObj;

    //  Bring in the CodeMirror modules and grab the slots that matter to us.
    modules = this.getType().get('$cmModules');

    const {EditorState, EditorView, basicSetup} =
                                    modules.at('@codemirror/basic-setup'),
            {javascript} = modules.at('@codemirror/lang-javascript'),
            {insertTab} = modules.at('@codemirror/commands'),
            {Compartment} = modules.at('@codemirror/state'),
            {keymap} = modules.at('@codemirror/view');

    //  Define a custom key map that inserts tabs when the Tab key is pressed.
    tabKeyMap = [
        {
            key: 'Tab',
            run: insertTab
        }
    ];
    this.$set('$tabKeyMap', tabKeyMap);

    //  Set up a new CodeMirror 'compartment' to hold the keymap configuration.
    //  This allows us to dynamically update it when we want to.
    keymapCompartment = new Compartment();
    this.$set('$keymapCompartment', keymapCompartment);

    theme = this.setupTheme();

    //  Set up CodeMirror editor view and state.
    editorObj = new EditorView({
        state: EditorState.create({
            extensions: [
                basicSetup,
                keymapCompartment.of(keymap.of(tabKeyMap)),
                javascript(),
                theme
            ]
        }),
        root: this.getNativeDocument(),
        parent: this.getNativeNode()
    });

    this.$set('$editorObj', editorObj);

    //  Make sure and flag the native node to not track mutations. This is a
    //  huge performance win when dealing with CodeMirror.
    TP.elementSetAttribute(
        this.getNativeNode(), 'tibet:no-mutations', true, true);

    //  We're all set up and ready - signal that.
    this.dispatch('TP.sig.DOMReady');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setupTheme',
function() {

    /**
     * @method setupTheme
     * @summary Sets up an inline theme for use with CodeMirror.
     * @returns {Object[]} An Array of POJOs in the format that CodeMirror likes
     *     them that describe the style/theme.
     */

    var modules,

        theme,
        highlightStyle,

        wholeTheme;

    //  Bring in the CodeMirror modules and grab the slots that matter to us.
    modules = this.getType().get('$cmModules');

    const {EditorView} = modules.at('@codemirror/basic-setup'),
            {HighlightStyle, tags} = modules.at('@codemirror/highlight');

    theme = EditorView.theme({
        '&': {
            color: '#abb2bf',
            backgroundColor: '#282c34'
        },
        '.cm-content': {
            caretColor: '#528bff'
        },
        '&.cm-focused .cm-cursor': {
            borderLeftColor: '#528bff'
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
            backgroundColor: '#3E4451'
        },
        '.cm-panels': {
            backgroundColor: '#21252b', color: '#abb2bf'
        },
        '.cm-panels.cm-panels-top': {
            borderBottom: '2px solid black'
        },
        '.cm-panels.cm-panels-bottom': {
            borderTop: '2px solid black'
        },
        '.cm-searchMatch': {
            backgroundColor: '#72a1ff59',
            outline: '1px solid #457dff'
        },
        '.cm-searchMatch.cm-searchMatch-selected': {
            backgroundColor: '#6199ff2f'
        },
        '.cm-activeLine': {
            backgroundColor: '#2c313a'
        },
        '.cm-selectionMatch': {
            backgroundColor: '#aafe661a'
        },
        '.cm-matchingBracket, .cm-nonmatchingBracket': {
            backgroundColor: '#bad0f847',
            outline: '1px solid #515a6b'
        },
        '.cm-gutters': {
            backgroundColor: '#282c34',
            color: '#7d8799',
            border: 'none'
        },
        '.cm-activeLineGutter': {
            backgroundColor: '#2c313a'
        },
        '.cm-foldPlaceholder': {
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ddd'
        },
        '.cm-tooltip': {
            border: '1px solid #181a1f',
            backgroundColor: '#21252b'
        },
        '.cm-tooltip-autocomplete': {
            '& > ul > li[aria-selected]': {
                backgroundColor: '#2c313a',
                color: '#abb2bf'
            }
        }
    }, {
        dark: true
    });

    highlightStyle = HighlightStyle.define([
        {
            tag: tags.keyword,
            color: '#c678dd'
        },
        {
            tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName],
            color: '#e06c75'
        },
        {
            tag: [tags.function(tags.variableName), tags.labelName],
            color: '#61afef'
        },
        {
            tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
            color: '#d19a66'
        },
        {
            tag: [tags.definition(tags.name), tags.separator],
            color: '#abb2bf'
        },
        {
            tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace],
            color: '#e5c07b'
        },
        {
            tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)],
            color: '#56b6c2'
        },
        {
            tag: [tags.meta, tags.comment],
            color: '#7d8799'
        },
        {
            tag: tags.strong,
            fontWeight: 'bold'
        },
        {
            tag: tags.emphasis,
            fontStyle: 'italic'
        },
        {
            tag: tags.strikethrough,
            textDecoration: 'line-through'
        },
        {
            tag: tags.link,
            color: '#7d8799',
            textDecoration: 'underline'
        },
        {
            tag: tags.heading,
            fontWeight: 'bold',
            color: '#e06c75'
        },
        {
            tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
            color: '#d19a66'
        },
        {
            tag: [tags.processingInstruction, tags.string, tags.inserted],
            color: '#98c379'
        },
        {
            tag: tags.invalid,
            color: '#ffffff'
        }
    ]);

    wholeTheme = TP.ac(theme, highlightStyle);

    return wholeTheme;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setExtendedKeyMap',
function(aKeyboardMap) {

    /**
     * @method setExtendedKeyMap
     * @summary Sets the supplied keyboard map as the 'extended map' on the
     *     editor.
     * @param {Object[]} aKeyboardMap An Array of POJOs that describe the keys.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var modules,

        tabKeyMap,

        editorObj,
        keymapCompartment;

    //  Bring in the CodeMirror modules and grab the slots that matter to us.
    modules = this.getType().get('$cmModules');

    const {keymap} = modules.at('@codemirror/view');

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {

        //  Make sure that we have a valid keymap dynamic configuration
        //  'compartment'.
        keymapCompartment = this.$get('$keymapCompartment');
        if (TP.isValid(keymapCompartment)) {

            //  Grab our keymap that we set up to map the Tab key to insert
            //  tabs. We consider this to be 'built-in' behavior.
            tabKeyMap = this.$get('$tabKeyMap');

            editorObj.dispatch({
                effects: keymapCompartment.reconfigure(
                                keymap.of([...aKeyboardMap, ...tabKeyMap]))
            });
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @description Typically, the supplied stylesheet Element is the one that
     *     the receiver is waiting for so that it can finalized style
     *     computations. This could be either the receiver's 'core' stylesheet
     *     or it's current 'theme' stylesheet, if the receiver is executing in a
     *     themed environment.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.xctrls.editor} The receiver.
     */

    //  NB: We override this to do nothing because the version that we inherit
    //  sends the TP.sig.DOMReady signal when the stylesheet loads and we want
    //  to wait until the ACE editor has loaded and is ready. See the setup()
    //  method.

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver.
     * @returns {TP.xctrls.editor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  textUtilities methods
//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('clearValue',
function() {

    /**
     * @method clearValue
     * @summary Clears the entire value of the receiver.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var oldVal;

    oldVal = this.getDisplayValue();

    this.setDisplayValue('');

    this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('clearSelection',
function() {

    /**
     * @method clearSelection
     * @summary Clears the currently selected text.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var oldVal,

        editorObj,

        state,

        selection,

        mainRange;

    oldVal = this.getSelection();

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        state = editorObj.state;
        selection = state.selection;

        mainRange = selection.main;

        editorObj.dispatch({
            changes: {
                from: mainRange.from,
                to: mainRange.to,
                insert: ''
            }
        });

        this.changed('selection', TP.DELETE,
                            TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('collapseSelection',
function(toStart) {

    /**
     * @method collapseSelection
     * @summary Collapse the current selection to one end or the other.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @returns {TP.xctrls.editor} The receiver.
     */

    if (toStart) {
        this.setCursorToStart();
    } else {
        this.setCursorToEnd();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('getSelection',
function() {

    /**
     * @method getSelection
     * @summary Returns the currently selected text. Note that if there are
     *      multiple selections present, only the 'main' selection will be
     *      returned. To access all selections, see the getSelections method.
     * @returns {String} The currently selected text.
     */

    var editorObj,
        state,
        selection,
        mainRange;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        state = editorObj.state;
        selection = state.selection;

        mainRange = selection.main;

        if (mainRange.empty) {
            return '';
        } else {
            return state.sliceDoc(mainRange.from, mainRange.to);
        }
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('getSelections',
function() {

    /**
     * @method getSelection
     * @summary Returns the currently selected pieces of text.
     * @returns {String[]} The currently selected texts.
     */

    var editorObj,

        state,
        selection,

        ranges,

        i,

        result;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        state = editorObj.state;
        selection = state.selection;

        ranges = selection.ranges;
        switch (ranges.length) {
            case 0:
                return '';
            case 1:
                if (ranges[0].empty) {
                    return '';
                }
                return TP.ac(state.sliceDoc(ranges[0].from, ranges[0].to));
            default:
                result = TP.ac();
                for (i = 0; i < ranges.length; i++) {
                    result.push(state.sliceDoc(ranges[i].from, ranges[i].to));
                }
                return result;
        }
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('getSelectionEnd',
function() {

    /**
     * @method getSelectionEnd
     * @summary Returns the ending index of the currently selected text.
     * @returns {Number} The ending index of the current selection.
     */

    var editorObj,

        state,
        selection,
        mainRange;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        state = editorObj.state;
        selection = state.selection;

        mainRange = selection.main;

        if (mainRange.empty) {
            return TP.NOT_FOUND;
        } else {
            return mainRange.to;
        }
    }

    return TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('getSelectionStart',
function() {

    /**
     * @method getSelectionStart
     * @summary Returns the starting index of the currently selected text.
     * @returns {Number} The starting index of the current selection.
     */

    var editorObj,

        state,
        selection,
        mainRange;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        state = editorObj.state;
        selection = state.selection;

        mainRange = selection.main;

        if (mainRange.empty) {
            return TP.NOT_FOUND;
        } else {
            return mainRange.from;
        }
    }

    return TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('insertAfterSelection',
function(aText) {

    /**
     * @method insertAfterSelection
     * @summary Inserts the supplied text after the current selection.
     * @param {String} aText The text to insert.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj,

        state,
        selection,
        mainRange;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        state = editorObj.state;
        selection = state.selection;

        mainRange = selection.main;

        editorObj.dispatch({
            changes: {
                from: mainRange.to,
                to: mainRange.to,
                insert: aText
            }
        });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('insertBeforeSelection',
function(aText) {

    /**
     * @method insertBeforeSelection
     * @summary Inserts the supplied text before the current selection.
     * @param {String} aText The text to insert before the current selection.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj,

        state,
        selection,
        mainRange;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        state = editorObj.state;
        selection = state.selection;

        mainRange = selection.main;

        //  Note here that we have to shift the selection when inserting before
        //  the selection, since the anchor won't move.

        editorObj.dispatch({
            changes: {
                from: mainRange.from,
                to: mainRange.from,
                insert: aText
            },
            selection: {
                anchor: mainRange.from + aText.length,
                head: mainRange.to + aText.length
            }
        });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('replaceSelection',
function(aText) {

    /**
     * @method replaceSelection
     * @summary Replaces the current selection with the supplied text.
     * @param {String} aText The text to replace the current selection with.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var oldVal,

        editorObj,

        newVal;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        oldVal = this.getSelection();

        editorObj.dispatch(editorObj.state.replaceSelection(aText));

        newVal = this.getSelection();

        this.changed('selection', TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('selectFromTo',
function(aStartIndex, anEndIndex) {

    /**
     * @method selectFromTo
     * @summary Selects the contents of the receiver from the supplied starting
     *     index to the supplied ending index.
     * @param {Number} aStartIndex The starting index.
     * @param {Number} aEndIndex The ending index.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj,

        oldVal,
        newVal;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        oldVal = this.getSelection();

        editorObj.dispatch({
            selection: {
                anchor: aStartIndex,
                head: anEndIndex
            }
        });

        newVal = this.getSelection();

        this.changed('selection', TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setCursorPosition',
function(aPosition) {

    /**
     * @method setCursorPosition
     * @summary Sets the cursor to the supplied position.
     * @param {Number} aPosition The desired cursor position.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        editorObj.dispatch({
            selection: {
                anchor: aPosition
            }
        });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @method setCursorToEnd
     * @summary Sets the cursor to the end position of the receiver.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj,
        endPosition;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        endPosition = editorObj.state.doc.toString().length;
        editorObj.dispatch({
            selection: {
                anchor: endPosition
            }
        });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setCursorToStart',
function() {

    /**
     * @method setCursorToStart
     * @summary Sets the cursor to the start position of the receiver.
     * @returns {TP.xctrls.editor} The receiver.
     */

    var editorObj;

    editorObj = this.$get('$editorObj');
    if (TP.isValid(editorObj)) {
        editorObj.dispatch({
            selection: {
                anchor: 0
            }
        });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('setSelection',
function(aText) {

    /**
     * @method setSelection
     * @summary Sets the current selection to the supplied text.
     * @param {String} aText The text to set the selection to.
     * @returns {TP.xctrls.editor} The receiver.
     */

    //  This method is just an alias for replaceSelection()
    this.replaceSelection(aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.editor.Inst.defineMethod('wrapSelection',
function(beforeText, afterText) {

    /**
     * @method wrapSelection
     * @summary Wraps the current selection with the beforeText and afterText.
     * @param {String} beforeText The text to insert before the selection.
     * @param {String} afterText The text to insert after the selection.
     * @returns {TP.xctrls.editor} The receiver.
     */

    this.replaceSelection(TP.join(beforeText, this.getSelection(), afterText));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
