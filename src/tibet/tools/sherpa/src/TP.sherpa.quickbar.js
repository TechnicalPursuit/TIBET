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
 * @type {TP.sherpa.quickbar}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:quickbar');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('node'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  should IO be concealed? this is used to simulate "password" mode
TP.sherpa.quickbar.Inst.defineAttribute('conceal', false);

//  Is the command line currently concealed from view?
TP.sherpa.quickbar.Inst.defineAttribute('concealedInput');

//  Is the command line current in search mode?
TP.sherpa.quickbar.Inst.defineAttribute('searchMode');

//  An Array of searchers
TP.sherpa.quickbar.Inst.defineAttribute('searchers');

TP.sherpa.quickbar.Inst.defineAttribute(
        'textInput',
        {'value': TP.cpc('xctrls|codeeditor', true)});

TP.sherpa.quickbar.Inst.defineAttribute(
        'resultsList',
        {'value': TP.cpc('.results_list', true)});

TP.sherpa.quickbar.Inst.defineAttribute(
        'resultDetail',
        {'value': TP.cpc('.result_detail', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    var textInput,
        textInputStartupComplete;

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
        this.set('searchMode', false);
    }.bind(this);

    textInputStartupComplete.observe(textInput, 'TP.sig.DOMReady');

    this.observe(this.get('resultsList'), 'TP.sig.DOMClick');

    /* eslint-disable no-wrap-func */
    (function () {

        this.set('searchMode', false);
        this.toggle('hidden');

    }).bind(this).observe(TP.core.Keyboard,
        'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up');

    (function () {

        var inSearchMode,
            isHidden;

        inSearchMode = this.get('searchMode');
        isHidden = TP.bc(this.getAttribute('hidden'));

        //  Not hiding & but not in search mode
        if (!isHidden && !inSearchMode) {
            this.set('searchMode', true);
            return this;
        }

        //  Not hiding & already in search mode
        if (!isHidden && inSearchMode) {
            this.set('searchMode', false);
            return this;
        }

        this.set('searchMode', true);
        this.toggle('hidden');

    }).bind(this).observe(TP.core.Keyboard,
        'TP.sig.DOM_QuestionMark_Up__TP.sig.DOM_QuestionMark_Up');

    /* eslint-enable no-wrap-func */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('handleTP_sig_DOMClick',
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

TP.sherpa.quickbar.Inst.defineMethod('drawSearchResults',
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

                searchResults = aSearcher.search(inputText);

                result += '<section>';
                result += '<h1>' + aSearcher.getTitle() + '</h1>';

                result += '</section>';

                searchResults = searchResults.slice(0, 15);

                if (TP.isEmpty(searchResults)) {
                    return;
                }

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
                            null);

    this.updateResultDetail();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setSearchMode',
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

        this.get('resultDetail').empty();
    }

    this.clearInput();

    this.$set('searchMode', aMode);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('selectSearchResult',
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

TP.sherpa.quickbar.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @name setAttrHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var textInput;

    if (TP.bc(this.getAttribute('hidden')) === beHidden) {
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
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('toggleSearchMode',
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

TP.sherpa.quickbar.Inst.defineMethod('updateResultDetail',
function() {

    /**
     * @name updateResultDetail
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var detailTile;

    if (TP.notValid(detailTile = TP.byOID('detailTile'))) {
        detailTile = TP.byOID('Sherpa').makeTile('detailTile');
    }

    if (this.hasAttribute('showresults')) {
        detailTile.setAttribute('hidden', false);

        detailTile.setPagePositionAndSize(
                        this.get('resultDetail').getPageRect());

        detailTile.setProcessedContent('<h2>Hi there</h2>');

    } else {
        detailTile.setAttribute('hidden', true);
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

TP.sherpa.quickbar.Inst.defineMethod('activateInputEditor',
function() {

    /**
     * @name activateInputEditor
     * @returns {TP.sherpa.quickbar} The receiver.
     * @abstract
     * @todo
     */

    var textInput;

    textInput = this.get('textInput');

    textInput.setKeyHandler(TP.core.Keyboard.$$handleKeyEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('deactivateInputEditor',
function() {

    /**
     * @name deactivateInputEditor
     * @returns {TP.sherpa.quickbar} The receiver.
     * @abstract
     * @todo
     */

    var textInput;

    textInput = this.get('textInput');

    textInput.unsetCurrentKeyHandler();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('installHandlers',
function() {

    /**
     * @name installHandlers
     * @synopsis
     * @returns {TP.sherpa.quickbar} The receiver.
     */

    //  set up root keyboard observations

    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyDown');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyPress');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    this.observe(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('removeHandlers',
function() {

    /**
     * @name removeHandlers
     * @synopsis
     * @returns {TP.sherpa.quickbar} The receiver.
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

TP.sherpa.quickbar.Inst.defineMethod('handleDOMKeyDown',
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

    if (this.isSpecialKeyEvent(evt)) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('handleDOMKeyPress',
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

    if (this.isSpecialKeyEvent(evt)) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('handleDOMKeyUp',
function(aSignal) {

    /**
     * @name handleDOMKeyUp
     * @synopsis Handles notifications of keyup events. If the key is one we
     *     care about then we forward the event to the shell for processing.
     * @param {DOMKeyUp} aSignal The TIBET signal which triggered this handler.
     * @returns {null.}
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

    if (this.isSpecialKeyEvent(evt)) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);

        this.handleSpecialKeyEvent(evt);
    } else if (TP.isTrue(this.get('searchMode'))) {
        this.drawSearchResults(editor.getValue());
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('isSpecialKeyEvent',
function(anEvent) {

    /**
     * @name isSpecialKeyEvent
     * @synopsis Returns true if the event represents a key binding used to
     *     trigger command processing of some kind for the console.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname;

    keyname = TP.domkeysigname(anEvent);

    switch (keyname) {
        case 'DOM_Shift_Down_Up':
        case 'DOM_Shift_Up_Up':
        case 'DOM_Shift_Right_Up':
        case 'DOM_Shift_Left_Up':

        case 'DOM_Shift_Backspace_Down':
        case 'DOM_Shift_Backspace_Up':

        case 'DOM_Esc_Up':

            return true;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('handleSpecialKeyEvent',
function(anEvent) {

    /**
     * @name handleSpecialKeyEvent
     * @synopsis Processes incoming events from the view.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname;

    keyname = TP.domkeysigname(anEvent);

    switch (keyname) {
        case 'DOM_Shift_Down_Up':
            this.handleHistoryNext(anEvent);
            break;

        case 'DOM_Shift_Up_Up':
            this.handleHistoryPrev(anEvent);
            break;

        case 'DOM_Shift_Backspace_Up':
            this.clearInput(anEvent);
            break;

        case 'DOM_Esc_Up':
            this.setAttribute('hidden', true);
            break;

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------
//  Input Cell Methods
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('clearInput',
function() {

    /**
     * @name clearInput
     * @synopsis Clears the input cell.
     * @returns {TP.sherpa.quickbar} The receiver.
     */

    this.get('textInput').clearValue();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('focusInputCell',
function(select) {

    /**
     * @name focusInputCell
     * @synopsis Focuses the input cell so the cursor is visible/blinking.
     * @param {Boolean} select True to select in addition.
     * @returns {TP.sherpa.quickbar} The receiver.
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

TP.sherpa.quickbar.Inst.defineMethod('getInputValue',
function() {

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

TP.sherpa.quickbar.Inst.defineMethod('insertInputContent',
function(anObject) {

    /**
     * @name insertInputContent
     * @synopsis Inserts to the value of the input cell.
     * @param {Object} anObject The object defining the additional input.
     * @returns {TP.sherpa.quickbar} The receiver.
     */

    var str;

    str = TP.str(anObject);
    this.get('textInput').insertAfterSelection(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @name setCursorToEnd
     * @synopsis Moves the cursor to the end of the current input data.
     * @returns {TP.sherpa.quickbar} The receiver.
     */

    this.get('textInput').setCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('setInputContent',
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
     * @returns {TP.sherpa.quickbar} The receiver.
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

    (function() {
        this.focusInputCell();
        this.setCursorToEnd();
    }.bind(this)).afterUnwind();

    return this;
});

//  ------------------------------------------------------------------------
//  String I/O Formatting
//  ------------------------------------------------------------------------

TP.sherpa.quickbar.Inst.defineMethod('formatInput',
function(plainText) {

    /**
     * @name formatInput
     * @synopsis Converts text intended for the input cell so it's properly
     *     displayed.
     * @param {String} plainText The string to convert.
     * @returns {String}
     */

    //  For now, we just return the plain text that was handed to us.
    return plainText;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
