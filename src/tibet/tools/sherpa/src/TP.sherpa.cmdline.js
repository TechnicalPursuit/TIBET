//  ========================================================================
/*
NAME:   TP.sherpa.cmdline.js
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
 * @type {TP.sherpa.cmdline}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:cmdline');

TP.sherpa.cmdline.shouldRegisterInstances(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Type.defineMethod('tshAwakenDOM',
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
TP.sherpa.cmdline.Inst.defineAttribute('conceal', false);

//  Is the command line currently concealed from view?
TP.sherpa.cmdline.Inst.defineAttribute('concealedInput');

//  Is the command line current in search mode?
TP.sherpa.cmdline.Inst.defineAttribute('searchMode');

//  An Array of searchers
TP.sherpa.cmdline.Inst.defineAttribute('searchers');

TP.sherpa.cmdline.Inst.defineAttribute(
        'textInput',
        {'value': TP.cpc('xctrls|codeeditor', true)});

TP.sherpa.cmdline.Inst.defineAttribute(
        'resultsList',
        {'value': TP.cpc('.results_list', true)});

TP.sherpa.cmdline.Inst.defineAttribute(
        'resultDetail',
        {'value': TP.cpc('.result_detail', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    var textInput,
        textInputStartupComplete;

    (function () {

        this.toggle('hidden');

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up');

    (function () {

        this.set('hidden', true);

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.DOM_Esc_Up');

    //  Create a set of searchers
    this.set('searchers',
                TP.ac(
                    TP.core.CustomTypeSearcher.construct(),
                    TP.core.MethodSearcher.construct(),
                    TP.core.CSSPropertySearcher.construct()
                    ));

    textInput = this.get('textInput');

    //  Make sure to observe a setup on the text input here, because it won't be
    //  fully formed when this line is executed.
    textInputStartupComplete = function(aSignal) {
        textInputStartupComplete.ignore(
                aSignal.getOrigin(), aSignal.getSignalName());
        this.set('searchMode', true);
    }.bind(this);

    textInputStartupComplete.observe(textInput, 'TP.sig.DOMReady');

    this.observe(this.get('resultsList'), 'TP.sig.DOMClick');

    /*
    (function () {

        var testTile = TP.byOID('Sherpa').makeTile('detailTile');
        testTile.toggle('hidden');

        }).bind(this).observe(
            TP.core.Keyboard, 'TP.sig.DOM_T_Up__TP.sig.DOM_T_Up');
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('handleTP_sig_DOMClick',
function(aSignal) {

    var currentResultItem;

    if (TP.isValid(currentResultItem = this.get('currentResultItem'))) {
        currentResultItem.toggle('selected');
    }

    currentResultItem = TP.wrap(aSignal.getTarget());

    if (currentResultItem.getLocalName().toLowerCase() === 'li') {
        this.set('currentResultItem', currentResultItem);
    }
    
    this.updateResultDetail();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('drawSearchResults',
function(inputText) {

    /**
     * @name drawSearchResults
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var resultsList,
        result;

    this.set('currentResultItem', null);

    if (TP.isEmpty(inputText)) {
        this.removeAttribute('showresults');
        this.updateResultDetail();

        return this;
    }

    resultsList = this.get('resultsList');

    result = '';

    this.get('searchers').perform(
            function(aSearcher) {
                var searchResults;

                if (TP.isEmpty(searchResults = aSearcher.search(inputText))) {
                    return;
                }

                result += '<section>';
                result += '<h1>' + aSearcher.getTitle() + '</h1>';

                result += '</section>';

                searchResults = searchResults.slice(0, 15);

                result += '<ul>' +
                            searchResults.as('html:li', TP.hc('repeat', true)) +
                            '</ul>';
            });

    if (TP.isEmpty(result)) {
        this.removeAttribute('showresults');
        return this;
    } else {
        this.setAttribute('showresults', true);
    }

    TP.xmlElementSetContent(resultsList.getNativeNode(),
                            TP.frag(result),
                            null,
                            true);

    this.updateResultDetail();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('setSearchMode',
function(aMode) {

    /**
     * @name setSearchMode
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    if (TP.isTrue(aMode)) {
        //  Turn off line numbers
        this.get('textInput').setShowLineNumbers(false);
        //  Set theme to search theme
        this.get('textInput').setEditorTheme('tibet_search');
    } else {
        //  Set theme to code theme
        this.get('textInput').setEditorTheme('tibet_code');
        //  Turn on line numbers
        this.get('textInput').setShowLineNumbers(true);

        //  Hide the search results panel
        this.removeAttribute('showresults');

        this.get('result_detail').empty();
    }

    this.$set('searchMode', aMode);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('selectSearchResult',
function(aCell) {

    /**
     * @name selectSearchResult
     * @abstract
     * @param
     * @returns {TP.sherpa.hud} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('setHidden',
function(beHidden) {

    /**
     * @name setHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var textInput;

    if (this.get('hidden') === beHidden) {
        return this;
    }

    if (TP.isTrue(beHidden)) {
        //  Clear the value
        this.clearInput();

        //  remove the event handlers
        this.removeHandlers();
    } else {
        textInput = this.get('textInput');
        textInput.focus();

        //  activate the input cell
        this.activateInputEditor();

        //  install the event handlers
        this.installHandlers();

        /*
        //  this will default to either the model's prompt or our default
        this.setPrompt();
        */
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('toggleSearchMode',
function() {

    /**
     * @name toggleSearchMode
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    if (TP.isTrue(this.get('searchMode'))) {
        this.set('searchMode', false);
    } else {
        this.set('searchMode', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('updateResultDetail',
function() {

    /**
     * @name updateResultDetail
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var detailTile,
        currentResultItem;

    if (TP.notValid(detailTile = TP.byOID('detailTile'))) {
        detailTile = TP.byOID('Sherpa').makeTile('detailTile');
        detailTile.toggle('hidden');
        detailTile.setPagePositionAndSize(
                        this.get('resultDetail').getPageRect());

        detailTile.setProcessedContent('<h2>Hi there</h2>');
    }

    /*
    if (TP.isValid(currentResultItem = this.get('currentResultItem'))) {
        detailTile.setProcessedContent('<h2>Stuff</h2>');
    } else {
        detailTile.empty();
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('activateInputEditor',
function() {

    /**
     * @name activateInputEditor
     * @returns {TP.sherpa.cmdline} The receiver.
     * @abstract
     * @todo
     */

    var textInput;

    textInput = this.get('textInput');

    textInput.setKeyHandler(TP.core.Keyboard.$$handleKeyEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('deactivateInputEditor',
function() {

    /**
     * @name deactivateInputEditor
     * @returns {TP.sherpa.cmdline} The receiver.
     * @abstract
     * @todo
     */

    var textInput;

    textInput = this.get('textInput');

    textInput.unsetCurrentKeyHandler();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('installHandlers',
function() {

    /**
     * @name installHandlers
     * @synopsis
     * @returns {TP.sherpa.cmdline} The receiver.
     */

    //  set up root keyboard observations

    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyDown');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyPress');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    this.observe(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('removeHandlers',
function() {

    /**
     * @name removeHandlers
     * @synopsis
     * @returns {TP.sherpa.cmdline} The receiver.
     */

    //  remove root keyboard observations

    this.ignore(TP.core.Keyboard, 'TP.sig.DOMKeyDown');
    this.ignore(TP.core.Keyboard, 'TP.sig.DOMKeyPress');
    this.ignore(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    this.ignore(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    return this;
});

//  ------------------------------------------------------------------------
//  Key Handling
//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('handleDOMKeyDown',
function(aSignal) {

    /**
     * @name handleDOMKeyDown
     * @synopsis Handles notifications of keydown events. If the key is one the
     *     console maps then the default action is overidden.
     * @param {DOMKeyDown} aSignal The TIBET signal which triggered this method.
     * @todo
     */

    var evt,
        editor;

    evt = aSignal.getEvent();
    editor = this.get('textInput');

    //  Make sure that the key event happened in our editor's document,
    //  otherwise we're not interested.
    if (TP.eventGetWindow(evt).document !==
                                editor.getNativeContentDocument()) {
        return;
    }

    if (this.isCommandEvent(evt) || this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('handleDOMKeyPress',
function(aSignal) {

    /**
     * @name handleTP_sig_DOMKeyPress
     * @synopsis Handles notifications of keypress events. If the key is one the
     *     console maps then the default action is overidden.
     * @param {DOMKeyPress} aSignal The TIBET signal which triggered this
     *     method.
     * @todo
     */

    var evt,
        editor;

    evt = aSignal.getEvent();
    editor = this.get('textInput');

    //  Make sure that the key event happened in our editor's document,
    //  otherwise we're not interested.
    if (TP.eventGetWindow(evt).document !==
                                editor.getNativeContentDocument()) {
        return;
    }

    if (this.isCommandEvent(evt) || this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('handleDOMKeyUp',
function(aSignal) {

    /**
     * @name handleDOMKeyUp
     * @synopsis Handles notifications of keyup events. If the key is one we
     *     care about then we forward the event to the shell for processing.
     * @param {DOMKeyUp} aSignal The TIBET signal which triggered this handler.
     * @returns {null.}
     */

    var evt,
        editor,

        input,
        keyname,
        code;

    evt = aSignal.getEvent();
    editor = this.get('textInput');

    //  Make sure that the key event happened in our editor's document,
    //  otherwise we're not interested.
    if (TP.eventGetWindow(evt).document !==
                                editor.getNativeContentDocument()) {
        return;
    }

    if (this.isCommandEvent(evt)) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);

        this.handleCommandEvent(evt);
    } else if (this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);

        input = TP.ifInvalid(this.$get('concealedInput'), '');
        keyname = TP.domkeysigname(evt);

        if (keyname === 'DOM_Backspace_Up') {
            if (input.getSize() > 0) {
                this.$set('concealedInput', input.slice(0, -1));
            }
        } else if (TP.core.Keyboard.isPrintable(evt)) {
            code = TP.eventGetKeyCode(evt);
            this.$set('concealedInput', input + String.fromCharCode(code));
        }

        this.setInputContent('*'.times(
                this.$get('concealedInput').getSize()));
    } else if (TP.isTrue(this.get('searchMode'))) {
        this.drawSearchResults(editor.getValue());
    }

    //  if we're here then we want to adjust the height, but not focus or
    //  otherwise alter where the cursor might be
    this.adjustInputCellSize();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('isCommandEvent', function(anEvent) {

    /**
     * @name isCommandEvent
     * @synopsis Returns true if the event represents a key binding used to
     *     trigger command processing of some kind for the console.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname;

    keyname = TP.domkeysigname(anEvent);

    switch (keyname) {
        case 'DOM_Tab_Down':
        case 'DOM_Tab_Up':

        case 'DOM_Shift_Enter_Down':
        case 'DOM_Shift_Enter_Up':

        case 'DOM_Shift_Down_Up':
        case 'DOM_Shift_Up_Up':
        case 'DOM_Shift_Right_Up':
        case 'DOM_Shift_Left_Up':

        case 'DOM_Shift_Del_Down':
        case 'DOM_Shift_Del_Up':

        case 'DOM_Esc_Up':

        case 'DOM_QuestionMark_Down':
        case 'DOM_QuestionMark_Press':
        case 'DOM_QuestionMark_Up':

            return true;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('handleCommandEvent', function(anEvent) {

    /**
     * @name handleCommandEvent
     * @synopsis Processes incoming events from the view.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname;

    keyname = TP.domkeysigname(anEvent);

    switch (keyname) {
        case 'DOM_Tab_Up':
            this.handleTab(anEvent);
            break;

        case 'DOM_Shift_Enter_Up':
            this.handleRawInput(anEvent);
            break;

        case 'DOM_Shift_Down_Up':
            this.handleHistoryNext(anEvent);
            break;

        case 'DOM_Shift_Up_Up':
            this.handleHistoryPrev(anEvent);
            break;

        case 'DOM_Shift_Del_Up':
            this.handleClearInput(anEvent);
            break;

        case 'DOM_Esc_Up':
            this.handleCancel(anEvent);
            break;

        case 'DOM_QuestionMark_Up':
            this.toggleSearchMode();
            break;

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('getPrompt',
function() {

    /**
     * @name getPrompt
     * @synopsis Returns the prompt content of the current input element.
     * @returns {String} The prompt string to display.
     */

    var elem;

    if (TP.isElement(elem = TP.byId('tdc_cmdline_prompt', this.get('vWin')))) {
        return elem.innerHTML;
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('setPrompt',
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
        model,
        promptStr,
        elem;

    cssClass = TP.ifInvalid(aCSSClass, 'cmdline_prompt');

    //  prompt can get thrown off sometimes, so we attempt to keep it
    //  consistent with the model here unless otherwise specified
    if (TP.isValid(model = this.getModel())) {
        promptStr = TP.ifInvalid(aPrompt,
            TP.ifInvalid(model.getPrompt(),
                this.getType().DEFAULT_PROMPT));
    } else {
        promptStr = TP.ifInvalid(promptStr, this.getType().DEFAULT_PROMPT);
    }


    if (TP.isElement(elem = TP.byId('tdc_cmdline_prompt', this.get('vWin')))) {
        TP.elementSetClass(elem, cssClass);

        promptStr = TP.xmlEntitiesToLiterals(promptStr);
        TP.elementSetContent(elem, promptStr, null, false);

    } else {
        //  TODO:   what do we want to do here?
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Input Cell Methods
//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('adjustInputCellSize', function() {

    /**
     * @name adjustInputCellSize
     * @synopsis Adjust the height of the input cell based on its contents.
     */

    var outerWrapper,
        cell,
        rows,
        scrollHeight,
        height;

// TODO
return;

    //  We adjust our outerWrapper, since our inner wrapper will auto-grow
    outerWrapper = this.get('outerWrapper');

    cell = this.get('textInput');

    //  First we set the cell's height to 0. This will cause 'scrollHeight'
    //  to get its proper value.
    cell.style.height = '0px';

    //  Grab the cell's scrollHeight
    scrollHeight = cell.scrollHeight;

    //  The number of rows is the scrollHeight divided by the number of
    //  pixels for the lineHeight, rounded down.
    rows = (scrollHeight / cell.$linepx).floor();

    //  Make sure that we have at least one row.
    rows = rows.max(1);

    //  Set the cell's number of rows and put its height back to 'auto' so
    //  that it will draw properly.
    cell.rows = rows;
    cell.style.height = '';

    //  Now, resize the content surrounding the cell

    //  Grab the current height of the cell.
    height = TP.elementGetHeight(cell);

    //  Add the surrounding 'chrome' height.
    height = height + cell.$chrome;

    //  don't set outerWrapper height smaller than its initial height
    if (height > outerWrapper.$minHeight) {
        TP.elementSetHeight(outerWrapper, height);
    } else {
        TP.elementSetHeight(outerWrapper, outerWrapper.$minHeight);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('clearInput', function() {

    /**
     * @name clearInput
     * @synopsis Clears the input cell.
     * @returns {TP.sherpa.cmdline} The receiver.
     */

    this.get('textInput').clearValue();

    this.adjustInputCellSize();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('focusInputCell', function(select) {

    /**
     * @name focusInputCell
     * @synopsis Focuses the input cell so the cursor is visible/blinking.
     * @param {Boolean} select True to select in addition.
     * @returns {TP.sherpa.cmdline} The receiver.
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

TP.sherpa.cmdline.Inst.defineMethod('getInputValue', function() {

    /**
     * @name getInputValue
     * @synopsis Returns the value of the current input cell.
     * @returns {String} The user's input.
     */

    var tpElem;

    tpElem = this.get('textInput');
    if (TP.isValid(tpElem)) {
        return tpElem.get('value');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('insertInputContent', function(anObject) {

    /**
     * @name insertInputContent
     * @synopsis Inserts to the value of the input cell.
     * @param {Object} anObject The object defining the additional input.
     * @returns {TP.sherpa.cmdline} The receiver.
     */

    var str;

    str = TP.str(anObject);
    this.get('textInput').insertAfterSelection(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('setCursorToEnd', function() {

    /**
     * @name setCursorToEnd
     * @synopsis Moves the cursor to the end of the current input data.
     * @returns {TP.sherpa.cmdline} The receiver.
     */

    this.get('textInput').setCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('setInputContent',
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
     * @returns {TP.sherpa.cmdline} The receiver.
     * @todo
     */

    var textInput,
        val;

    if (TP.isEmpty(anObject)) {
        this.clearInput();
        return this;
    }

    textInput = this.get('textInput');
    if (TP.isTrue(shouldAppend)) {
        if (TP.notEmpty(val = textInput.get('value'))) {
            val += '.;\n';
        }

        textInput.set('value', val + this.formatInput(anObject));
    } else {
        textInput.set('value', this.formatInput(anObject));
    }

    this.adjustInputCellSize();

    (function() {
        this.focusInputCell();
        this.setCursorToEnd();
    }.bind(this)).afterUnwind();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.cmdline.Inst.defineMethod('shouldConcealInput', function(aFlag) {

    /**
     * @name shouldConcealInput
     * @synopsis Returns false for now.
     * @param {Boolean} aFlag The new value to set.
     * @returns {Boolean} 
     */

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
