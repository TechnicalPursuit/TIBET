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
 * @type {TP.sherpa.searcher}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:searcher');

TP.sherpa.searcher.Inst.defineAttribute('didSetup');
TP.sherpa.searcher.Inst.defineAttribute('sourceObject');

TP.sherpa.searcher.Inst.defineAttribute(
        'head',
        {value: TP.cpc('> .head', TP.hc('shouldCollapse', true))});

TP.sherpa.searcher.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

TP.sherpa.searcher.Inst.defineAttribute(
        'foot',
        {value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))});

//  Is the command line current in search mode?
TP.sherpa.searcher.Inst.defineAttribute('searchMode');

TP.sherpa.searcher.Inst.defineAttribute(
        'textInput',
        {value: TP.cpc('xctrls|codeeditor', TP.hc('shouldCollapse', true))});

TP.sherpa.searcher.Inst.defineAttribute(
        'resultsList',
        {value: TP.cpc('.results_list', TP.hc('shouldCollapse', true))});

//TP.sherpa.searcher.Inst.defineAttribute(
//        'resultDetail',
//        {value: TP.cpc('.result_detail', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var newResponder,
        consoleService;

    this.updateSearchResults();

    consoleService = TP.bySystemId('SherpaConsoleService');

    newResponder = TP.sherpa.SearchKeyResponder.construct(
                                consoleService.get('keyboardStateMachine'));
    newResponder.set('$consoleService', consoleService);
    newResponder.set('searcher', this);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('updateSearchResults',
function(results) {

    /**
     * @method updateSearchResults
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var resultsList,
        result;

    resultsList = this.get('resultsList');

    if (TP.isEmpty(results)) {
        TP.nodeEmptyContent(resultsList.getNativeNode());
    } else {
        result = '';

        result += '<ul>';

        results.forEach(
                function(item) {
                    result += '<li>' + item + '</li>';
                });

        result += '</ul>';

        TP.xmlElementSetContent(resultsList.getNativeNode(),
                                TP.xhtmlnode(result),
                                null,
                                false);
    }

    return this;
});

//  ========================================================================
//  TP.sherpa.SearchKeyResponder
//  ========================================================================

TP.sherpa.NormalKeyResponder.defineSubtype('TP.sherpa.SearchKeyResponder');

TP.sherpa.SearchKeyResponder.Inst.defineAttribute('searcher');

//  An Array of matchers
TP.sherpa.SearchKeyResponder.Inst.defineAttribute('matchers');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineMethod('setup',
function() {

    var stateMachine;

    this.set('mainState', 'search');

    stateMachine = this.get('stateMachine');

    stateMachine.defineState('normal',
                                'search',
                                {trigger: 'TP.sig.DOM_QuestionMark_Up'});

    stateMachine.defineState('search',
                                'normal',
                                {trigger: 'TP.sig.DOM_Esc_Up'});


    stateMachine.defineMethod('acceptSearch', function(aSignal) {

        var keyName,
            consoleGUI,
            currentInputContent;

        keyName = aSignal.getKeyName();

        if (keyName === 'DOM_QuestionMark_Up') {
            consoleGUI = this.get('$consoleService').get('$consoleGUI');
            currentInputContent = consoleGUI.getInputContent();
            if (TP.isEmpty(currentInputContent)) {
                return true;
            }
        }

        return false;
    }.bind(this));

    //  Create a set of matchers
    this.set('matchers',
                TP.ac(
                    TP.core.KeyedSourceMatcher.construct(TP),
                    TP.core.CustomTypeMatcher.construct(),
                    TP.core.MethodMatcher.construct(),
                    TP.core.CSSPropertyMatcher.construct(),
                    TP.core.URIMatcher.construct()
                    ));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineMethod('didEnter',
function(aSignal) {

    /**
     * @method didEnter
     */

    var consoleGUI,

        searcherTile,
        searcherContent;

    consoleGUI = this.get('$consoleService').get('$consoleGUI');

    searcherTile = TP.byId('searcher_tile', consoleGUI);

    searcherContent = TP.byCSSPath('sherpa|searcher', searcherTile, true);

    searcherTile.toggle('hidden');
    searcherContent.toggle('hidden');

    consoleGUI.clearInput();

    (function() {
        this.prepareMatchers();

    }).bind(this).afterUnwind();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineMethod('didExit',
function(aSignal) {

    /**
     * @method didExit
     */

    var consoleGUI,

        searcherTile,
        searcherContent;

    consoleGUI = this.get('$consoleService').get('$consoleGUI');

    searcherTile = TP.byId('searcher_tile', consoleGUI);

    searcherContent = TP.byCSSPath('sherpa|searcher', searcherTile, true);

    searcherTile.toggle('hidden');
    searcherContent.toggle('hidden');

    this.get('$consoleService').clearConsole(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineMethod('executeTriggerSignalHandler',
function(aSignal) {

    /**
     * @method executeTriggerSignalHandler
     */

    var consoleGUI,
        val,

        matches;

    if (TP.isKindOf(aSignal, TP.sig.DOMKeyUp)) {

        consoleGUI = this.get('$consoleService').get('$consoleGUI');

        val = consoleGUI.get('consoleInput').getDisplayValue();

        matches = this.findMatches(val);

        matches.sort(TP.core.Matcher.MATCH_RESULT_SORT);

        matches = matches.collect(
                    function(item) {
                        return '<span class="' + item.cssClass + '">' +
                                (TP.notEmpty(item.prefix) ? item.prefix : '') +
                                item.string +
                                (TP.notEmpty(item.suffix) ? item.suffix : '') +
                                '</span>';
                    });

        this.get('searcher').updateSearchResults(matches);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineMethod('findMatches',
function(aText) {

    var matches;

    matches = TP.ac();
    this.get('matchers').forEach(
                function(aMatcher) {
                    matches = matches.concat(aMatcher.match(aText));
                });

    return matches;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineMethod('prepareMatchers',
function() {

    this.get('matchers').forEach(
            function(aMatcher) {
                aMatcher.prepareForMatch();
            });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
