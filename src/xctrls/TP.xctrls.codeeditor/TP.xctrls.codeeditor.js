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

TP.xctrls.TemplatedTag.defineSubtype('xctrls:codeeditor');

//  Events:
//      xctrls-codeeditor-selected

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.addTraits(TP.html.textUtilities);

TP.xctrls.codeeditor.Type.resolveTrait('booleanAttrs', TP.html.textUtilities);
TP.xctrls.codeeditor.Type.resolveTrait('getResourceURI', TP.xctrls.codeeditor);

TP.xctrls.codeeditor.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue'),
        TP.xctrls.codeeditor);
TP.xctrls.codeeditor.Inst.resolveTraits(
        TP.ac('getValue', 'setValue'),
        TP.html.textUtilities);

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.codeeditor.defineAttribute('themeURI', TP.NO_RESULT);

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

TP.xctrls.codeeditor.Inst.defineAttribute('$editorHeightDiff');

TP.xctrls.codeeditor.Inst.defineAttribute('$oldSelectionLength');
TP.xctrls.codeeditor.Inst.defineAttribute('$currentKeyHandler');

TP.xctrls.codeeditor.Inst.defineAttribute('$currentScrollInfo');

TP.xctrls.codeeditor.Inst.defineAttribute('$editorObj');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        thisref;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    thisref = this;

    //  If the ACE editor isn't loaded, then we must load it *into the target
    //  document of the element that we're processing*.
    if (TP.notValid(TP.extern.ace)) {

        TP.sys.fetchScriptInto(
            TP.uc('~lib_deps/ace/ace-tpi.js'),
            TP.doc(elem)
        ).then(function() {
                var aceObj;

                aceObj = TP.nodeGetWindow(elem).ace;

                TP.registerExternalObject('ace', aceObj);

                //  NB: Wire these in *after* the registerExternalObject method
                //  is executed because it will try to devine these settings
                //  from the loader, which is no longer involved - the app is
                //  running.
                aceObj[TP.LOAD_PATH] = 'inline';
                aceObj[TP.LOAD_CONFIG] = 'base';
                aceObj[TP.LOAD_PACKAGE] = thisref[TP.LOAD_PACKAGE];
                aceObj[TP.LOAD_STAGE] = TP.PHASE_TWO;

                aceObj[TP.SOURCE_PATH] = 'inline';
                aceObj[TP.SOURCE_CONFIG] = 'base';
                aceObj[TP.SOURCE_PACKAGE] = thisref[TP.SOURCE_PACKAGE];

                thisref.defineDependencies('TP.extern.ace');

                tpElem.setup();
            });
    } else {
        tpElem.setup();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Type.defineMethod('tagDetachDOM',
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

TP.xctrls.codeeditor.Type.defineMethod('tagResolve',
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

TP.xctrls.codeeditor.Inst.defineMethod('appendToLine',
function(aText, line) {

    /**
     * @method appendToLine
     * @param {String} aText The text to insert.
     * @param {String} line The line number to insert the text at the end of.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    /*
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
    */

    return TP.todo('appendToLine');
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('blur',
function() {

    /**
     * @method blur
     * @summary Blurs the receiver for keyboard input.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var nativeTATPElem;

    //  Go ahead and 'blur' the editor.
    this.$get('$editorObj').blur();

    //  Make sure to do a separate 'blur' on the textarea that the ACE editor
    //  uses. This keeps everything in sync for TIBET's focusing machinery.
    nativeTATPElem = TP.byCSSPath(
                        ' textarea.ace_text-input',
                        this.getNativeNode(),
                        true);

    nativeTATPElem.blur();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('captureCurrentScrollInfo',
function() {

    /**
     * @method captureCurrentScrollInfo
     * @summary Captures the current scroll position for use later by the
     *     scrollUsingLastScrollInfo method.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    /*
    var editor,
        currentScrollInfo;

    editor = this.$get('$editorObj');

    currentScrollInfo = editor.getScrollInfo();
    this.set('$currentScrollInfo', currentScrollInfo);
    */

    return TP.todo('captureCurrentScrollInfo');
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('findAndScrollTo',
function(aStringOrRegExp) {

    /**
     * @method findAndScrollTo
     * @summary Finds the text using the supplied String or RegExp in the
     *     receiver, scrolls to it and centers its scroll in the receiver's
     *     visible area.
     * @param {String|RegExp} aStringOrRegExp The String or RegExp to use to
     *     find the text to scroll to.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editor;

    editor = this.$get('$editorObj');

    (function() {
        editor.find(
            aStringOrRegExp,
            {
                backwards: false,
                wrap: false,
                caseSensitive: true,
                wholeWord: false,
                regExp: TP.isRegExp(aStringOrRegExp)
            });
    }).queueAfterNextRepaint(this.getNativeWindow());

    editor.findNext();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('focus',
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
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var nativeTATPElem;

    //  Go ahead and 'focus' the editor.
    this.$get('$editorObj').focus();

    //  Make sure to do a separate 'focus' on the textarea that the ACE editor
    //  uses. This keeps everything in sync for TIBET's focusing machinery.
    nativeTATPElem = TP.byCSSPath(
                        ' textarea.ace_text-input',
                        this.getNativeNode(),
                        true);

    nativeTATPElem.focus();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getCursor',
function(start) {

    /**
     * @method getCursor
     * @summary Returns the current position of the cursor.
     * @param {String} start A value indicating where to measure the cursor at.
     *     This should be one of the following values: 'from', 'to', 'head',
     *     'anchor'. See the CodeMirror manual for more details.
     * @returns {TP.extern.CodeMirror.Pos} A CodeMirror 'position' object.
     */

    /*
    return this.$get('$editorObj').getCursor(start);
    */

    return TP.todo('getCursor');
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

    var editor;

    editor = this.$get('$editorObj');
    if (TP.isValid(editor)) {
        return editor.getValue();
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getEditorHeight',
function() {

    /**
     * @method getEditorHeight
     * @summary Returns the overall height of the editor in pixels.
     * @returns {Number} The height of the editor in pixels.
     */

    var vertScrollerInner,
        diff;

    //  Dig around in the internals of ACE to find the element that resizes as
    //  the content grows or shrinks vertically - ugh. This is the 'inner part'
    //  of the vertical scrollbar.
    vertScrollerInner = TP.byCSSPath(' .ace_scrollbar-v > .ace_scrollbar-inner',
                                        this.getNativeNode(),
                                        true,
                                        false);

    //  If the element isn't valid, then ACE probably hasn't loaded yet - just
    //  return our height.
    if (!TP.isElement(vertScrollerInner)) {
        return this.getHeight();
    } else {

        //  If we didn't already cache the difference between the inner part and
        //  its parent (the overall scrollbar itself), then compute and cache
        //  it.
        diff = this.$get('$editorHeightDiff');
        if (TP.notValid(diff)) {
            diff = TP.elementGetHeight(vertScrollerInner.parentNode) -
                    TP.elementGetHeight(vertScrollerInner);
            this.$set('$editorHeightDiff', diff);
        }

        //  Return the height of the inner part of the scrollbar plus the height
        //  difference.
        return TP.elementGetHeight(vertScrollerInner) + diff;
    }
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @summary Handles when the user has clicked the 'detach' arrow button to
     *     detach ourself into a Sherpa console tab.
     * @param {TP.sig.ResourceApply} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').resize();

    return this;
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

    /*
    var editor;

    editor = this.$get('$editorObj');

    editor.setSelection(editor.getCursor(), editor.getCursor());
    editor.replaceSelection(aText);

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, '', TP.NEWVAL, aText));
    */

    return TP.todo('insertAtCursor');
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('isReadyToRender',
function() {

    /**
     * @method isReadyToRender
     * @summary Whether or not the receiver is 'ready to render'. Normally, this
     *     means that all of the resources that the receiver relies on to render
     *     have been loaded.
     * @returns {Boolean} Whether or not the receiver is ready to render.
     */

    //  If we have a valid ACE instance, then we're ready to go.
    return TP.isValid(this.$get('$editorObj'));
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

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

    /*
    var editor,
        lastLineInfo;

    editor = this.$get('$editorObj');
    if (TP.notValid(lastLineInfo = editor.lineInfo(editor.lastLine()))) {
        return this;
    }

    editor.setSelection(
        {
            line: 0, ch: 0
        },
        {
            line: lastLineInfo.line,
            ch: lastLineInfo.text.length
        });

    this.focus();
    */

    return TP.todo('select');
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('scrollUsingLastScrollInfo',
function() {

    /**
     * @method scrollUsingLastScrollInfo
     * @summary Scrolls the editor left and top based on scroll position that
     *     was captured by the captureCurrentScrollInfo method.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    /*
    var editor,
        currentScrollInfo;

    editor = this.$get('$editorObj');

    currentScrollInfo = this.get('$currentScrollInfo');
    if (TP.notValid(currentScrollInfo)) {
        return this;
    }

    editor.scrollTo(currentScrollInfo.left, currentScrollInfo.top);
    */

    return TP.todo('scrollUsingLastScrollInfo');
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

    editorObj = this.$get('$editorObj');
    editorObj.setValue(aValue);

    editorObj.gotoLine(0, 0, false);

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
function(modeName) {

    /**
     * @method setEditorMode
     * @summary Sets the editor 'mode' (i.e. the ACE mode that is used for
     *     tokenization).
     * @param {String} modeName The ACE mode name.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').getSession().setMode(modeName);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setEditorModeFromMIMEType',
function(mimeType) {

    /**
     * @method setEditorModeFromMIMEType
     * @summary Sets the editor 'mode' (i.e. the ACE mode that is used for
     *     tokenization) by using the supplied MIME type and matching that to an
     *     ACE mode..
     * @param {String} mimeType The MIME type to match to an ACE mode.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    switch (mimeType) {
        case TP.XML_ENCODED:
        case TP.XHTML_ENCODED:
            this.setEditorMode('ace/mode/xml');
            break;
        case TP.JS_TEXT_ENCODED:
            this.setEditorMode('ace/mode/javascript');
            break;
        case TP.JSX_TEXT_ENCODED:
            this.setEditorMode('ace/mode/jsx');
            break;
        case TP.JSON_ENCODED:
            this.setEditorMode('ace/mode/json');
            break;
        case TP.CSS_TEXT_ENCODED:
            this.setEditorMode('ace/mode/css');
            break;
        case TP.PLAIN_TEXT_ENCODED:
        default:
            this.setEditorMode('ace/mode/text');
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setEditorTheme',
function(themeName) {

    /**
     * @method setEditorTheme
     * @summary Sets the editor 'theme' (i.e. the ACE theme currently in force).
     * @param {String} themeName The ACE theme name.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').setTheme(themeName);

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

    this.$get('$editorObj').renderer.setShowGutter(shouldShow);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editorObj,

        textareaTPElem,

        vertScrollerInner;

    /* eslint-disable new-cap */
    editorObj = TP.extern.ace.edit(this.getNativeNode().firstElementChild);
    editorObj.$blockScrolling = Infinity;
    /* eslint-enable new-cap */

    this.$set('$editorObj', editorObj);

    //  Make sure and flag the native node to not track mutations. This is a
    //  huge performance win when dealing with CodeMirror.
    TP.elementSetAttribute(
        this.getNativeNode(), 'tibet:no-mutations', true, true);

    //  Observe ourself for when we change size - so that we can call 'resize()'
    //  on the underlying ACE editor.
    this.observe(this, 'TP.sig.DOMResize');

    //  Dig around in the internals of ACE to find the element that acts as the
    //  textarea - ugh.
    textareaTPElem = TP.byCSSPath(
                    ' textarea.ace_text-input',
                    this.getNativeNode(),
                    true);
    textareaTPElem.defineHandler('UIFocusNext',
        function(aSignal) {
            aSignal.stopPropagation();
        });

    //  Set the editor to use soft tabs and to navigate within them (i.e. allow
    //  backspace and arrowing over the spaces that got inserted with a soft
    //  tab).
    editorObj.getSession().setUseSoftTabs(true);
    editorObj.getSession().setNavigateWithinSoftTabs(true);

    //  Grab the 'inner part' of the vertical scrollbar. This is the element
    //  that we'll monitor.
    vertScrollerInner = TP.byCSSPath(' .ace_scrollbar-v > .ace_scrollbar-inner',
                                        this.getNativeNode(),
                                        true,
                                        false);

    //  Add a resize listener to the inner part of the vertical scrollbar. The
    //  attached function will signal an 'EditorResize'.

    //  Note how we set this up 250ms after the editor has been attached to the
    //  DOM. This avoids issues around querying and processing by the XPath part
    //  of the tag processor.
    setTimeout(
        function() {
            TP.elementAddResizeListener(
                vertScrollerInner,
                function() {
                    this.dispatch('TP.sig.EditorResize');
                }.bind(this),
                false);
        }.bind(this), 250);

    //  If an attribute was defined that tells us what type of content we're
    //  going to have, use it.
    if (this.hasAttribute('childtype')) {
        this.setEditorModeFromMIMEType(this.getAttribute('childtype'));
    }

    //  We're all set up and ready - signal that.
    this.dispatch('TP.sig.DOMReady');

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

    this.$get('$editorObj').getSession().setUseWrapMode(shouldWrap);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('stylesheetReady',
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
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    //  NB: We override this to do nothing because the version that we inherit
    //  sends the TP.sig.DOMReady signal when the stylesheet loads and we want
    //  to wait until the ACE editor has loaded and is ready. See the setup()
    //  method.

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    var editorObj;

    this.ignore(this, 'TP.sig.DOMResize');

    editorObj = this.$get('$editorObj');

    editorObj.destroy();
    editorObj.container.remove();

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

    /*
    var oldVal;

    oldVal = this.getSelection();

    this.$get('$editorObj').replaceSelection('');

    this.changed('selection', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));
    */

    return TP.todo('clearSelection');
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

    /*
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
    */

    return TP.todo('collapseSelection');
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

    /*
    return this.$get('$editorObj').getSelection(TP.JOIN);
    */

    return TP.todo('getSelection');
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getSelectionEnd',
function() {

    /**
     * @method getSelectionEnd
     * @summary Returns the ending index of the currently selected text.
     * @returns {Number} The ending index of the current selection.
     */

    /*
    return this.$get('$editorObj').getCursor('to').ch;
    */

    return TP.todo('getSelectionEnd');
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('getSelectionStart',
function() {

    /**
     * @method getSelectionStart
     * @summary Returns the starting index of the currently selected text.
     * @returns {Number} The starting index of the current selection.
     */

    /*
    return this.$get('$editorObj').getCursor('from').ch;
    */

    return TP.todo('getSelectionStart');
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

    /*
    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$get('$editorObj').replaceSelection(TP.join(oldVal, aText));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));
    */

    return TP.todo('insertAfterSelection');
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

    /*
    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$get('$editorObj').replaceSelection(TP.join(aText, oldVal));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));
    */

    return TP.todo('insertBeforeSelection');
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

    /*
    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$get('$editorObj').replaceSelection(aText);

    newVal = this.getSelection();

    this.changed('selection', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));
    */

    return TP.todo('replaceSelection');
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

    /*
    var editor,

        startCoords,
        endCoords;

    editor = this.$get('$editorObj');

    startCoords = editor.posFromIndex(aStartIndex);
    endCoords = editor.posFromIndex(anEndIndex);

    editor.setSelection(startCoords, endCoords);
    */

    return TP.todo('selectFromTo');
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

    /*
    var editor,
        coords;

    editor = this.$get('$editorObj');

    coords = editor.posFromIndex(aPosition);

    editor.setCursor(coords);
    */

    return TP.todo('setCursorPosition');
});

//  ------------------------------------------------------------------------

TP.xctrls.codeeditor.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @method setCursorToEnd
     * @summary Sets the cursor to the end position of the receiver.
     * @returns {TP.xctrls.codeeditor} The receiver.
     */

    this.$get('$editorObj').getSelection().moveCursorFileEnd();

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

    this.$get('$editorObj').getSelection().moveCursorFileStart();

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
