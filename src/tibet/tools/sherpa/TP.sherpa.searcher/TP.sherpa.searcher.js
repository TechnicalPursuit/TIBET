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

TP.sherpa.Element.defineSubtype('searcher');

TP.sherpa.searcher.addTraits(TP.core.D3ScrollingList);

//  Is the command line current in search mode?
TP.sherpa.searcher.Inst.defineAttribute('searchMode');

TP.sherpa.searcher.Inst.defineAttribute(
    'scroller',
    {value: TP.cpc('> .scroller', TP.hc('shouldCollapse', true))});

TP.sherpa.searcher.Inst.defineAttribute(
    'listcontent',
    {value: TP.cpc('> .scroller > .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.searcher.Type.defineMethod('tagAttachDOM',
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

TP.sherpa.searcher.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('setup',
function() {

    var consoleService,
        consoleGUI,

        currentKeyboard,

        keyboardSM,
        searchResponder;

    consoleService = TP.bySystemId('SherpaConsoleService');
    consoleGUI = consoleService.get('$consoleGUI');

    currentKeyboard = TP.core.Keyboard.getCurrentKeyboard();

    keyboardSM = consoleService.get('keyboardStateMachine');

    keyboardSM.addTrigger(TP.ANY, 'TP.sig.EndSearchMode');

    keyboardSM.defineState(
            'normal',
            'search',
            {trigger: TP.ac(currentKeyboard, 'TP.sig.DOM_QuestionMark_Up')});

    keyboardSM.defineState(
            'search',
            'normal',
            {trigger: TP.ac(TP.ANY, 'TP.sig.EndSearchMode')});

    keyboardSM.defineMethod('acceptSearch', function(aSignal) {

        var keyName,
            currentInputContent;

        keyName = aSignal.getKeyName();

        if (keyName === 'DOM_QuestionMark_Up') {
            currentInputContent = consoleGUI.getInputContent();
            if (TP.isEmpty(currentInputContent)) {
                return true;
            }
        }

        return false;
    });

    searchResponder = TP.sherpa.SearchKeyResponder.construct();
    searchResponder.set('$consoleService', this);
    searchResponder.set('$consoleGUI', consoleGUI);

    searchResponder.addStateMachine(keyboardSM);
    searchResponder.addInputState('search');

    searchResponder.set('searcher', this);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineHandler('ItemSelected',
function(aSignal) {

    var domTarget,
        wrappedDOMTarget,

        value;

    domTarget = aSignal.getDOMTarget();
    wrappedDOMTarget = TP.wrap(domTarget);

    if (wrappedDOMTarget.hasAttribute('itemText')) {
        value = wrappedDOMTarget.getAttribute('itemText');
    } else {
        return this;
    }

    this.signal('TP.sig.EndSearchMode');

    value = ':reflect ' + value;
    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(value);

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var attrSelectionInfo,
        newContent;

    attrSelectionInfo = this.getRowAttrSelectionInfo();
    newContent = enterSelection.append('li').attr(attrSelectionInfo.first(),
                                                    attrSelectionInfo.last());

    newContent.html(
                function(d) {
                    return d.displayText;
                }).
                attr(
                'class',
                function(d) {
                    return d.className + ' row';
                }).
                attr(
                'itemText',
                function(d) {
                    return d.text;
                });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var theData;

    //  The data will be an Array of Arrays, with the category name String as
    //  the first item and an Array of result objects as the second item.

    //  Copy the data, iterate over it and turn the first item of each Array
    //  into a data structure that matches the results.
    theData = this.get('data').copy();

    theData.forEach(
            function(aPair) {
                aPair.atPut(
                        0, {displayText: aPair.at(0), className: 'category'});
            });

    return theData.flatten();

    //  The default version of this just returns the data-binding bound data.
    // return this.get('data').flatten();
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('getKeyFunction',
function() {

    /**
     * @method getKeyFunction
     * @summary Returns the Function that should be used to generate keys into
     *     the receiver's data set.
     * @description This Function should take a single argument, an individual
     *     item from the receiver's data set, and return a value that will act
     *     as that item's key in the overall data set. The default version
     *     returns the item itself.
     * @returns {Function} A Function that provides a key for the supplied data
     *     item.
     */

    var keyFunc;

    keyFunc = function(d, i) {
        if (d.displayText) {
            return d.displayText + i;
        }

        return d + i;
    };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('getRootUpdateSelection',
function(rootSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @returns {d3.Selection} The receiver.
     */

    return rootSelection.selectAll('li');
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('getRowHeight',
function() {

    /**
     * @method getRowHeight
     * @summary Returns the height of each element of the row. This should
     *     correspond to the 'offsetHeight' of each row when the list is
     *     rendered.
     * @returns {Number} The height of a row when rendered.
     */

    return 20;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('listcontent'));
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('getScrollingContainer',
function() {

    /**
     * @method getScrollingContainer
     * @summary Returns the Element that will be used as the 'scrolling
     *     container'. This is the element that will be the container of the
     *     list of items and will be translated to perform scrolling
     * @returns {Element} The element to use as the scrolling container.
     */

    return TP.unwrap(this.get('scroller'));
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var newContent;

    newContent = updateSelection.select('li');

    newContent.html(
                function(d) {
                    return d.displayText;
                }).
                attr(
                'class',
                function(d) {
                    return d.className + ' row';
                }).
                attr(
                'itemText',
                function(d) {
                    return d.text;
                });

    return this;
});

//  ========================================================================
//  TP.sherpa.SearchKeyResponder
//  ========================================================================

TP.sherpa.NormalKeyResponder.defineSubtype('TP.sherpa.SearchKeyResponder');

TP.sherpa.SearchKeyResponder.Inst.defineAttribute('$isActive');

TP.sherpa.SearchKeyResponder.Inst.defineAttribute('$consoleService');
TP.sherpa.SearchKeyResponder.Inst.defineAttribute('searcher');

//  An Array of matchers
TP.sherpa.SearchKeyResponder.Inst.defineAttribute('matchers');


TP.sherpa.SearchKeyResponder.Inst.defineAttribute('$tshHistoryMatcher');
TP.sherpa.SearchKeyResponder.Inst.defineAttribute(
                                                '$tshExecutionInstanceMatcher');
TP.sherpa.SearchKeyResponder.Inst.defineAttribute(
                                                '$tshCommandsMatcher');
TP.sherpa.SearchKeyResponder.Inst.defineAttribute('$keywordsMatcher');
TP.sherpa.SearchKeyResponder.Inst.defineAttribute('$cfgMatcher');
TP.sherpa.SearchKeyResponder.Inst.defineAttribute('$uriMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Constructor for new instances.
     * @returns {TP.sherpa.SearchKeyResponder} A new instance.
     */

    this.callNextMethod();

    this.set('$tshHistoryMatcher',
                TP.core.TSHHistoryMatcher.construct(
                    'TSH_HISTORY'));

    this.set('$tshExecutionInstanceMatcher',
                TP.core.KeyedSourceMatcher.construct(
                    'TSH_CONTEXT',
                    TP.core.TSH.getDefaultInstance().
                                        getExecutionInstance()));

    this.set('$tshCommandsMatcher',
                TP.core.ListMatcher.construct(
                    'TSH_COMMANDS',
                    TP.ac(
                        //  Core TP.core.Shell commands
                        'about',
                        'alias',
                        'clear',
                        'flag',
                        'save',
                        'set',
                        //  Built-in TSH commands
                        'echo',
                        'login',
                        'logout',
                        'as',
                        'doclint',
                        'dump',
                        'edit',
                        'entity',
                        'inspect',
                        'reflect',
                        'resources',
                        'screen',
                        'export',
                        'import',
                        'apropos',
                        'globals',
                        'help',
                        'types',
                        'sleep',
                        'cli',
                        'listChangedRemotes',
                        'forceRemoteRefresh',
                        'toggleRemoteWatch',
                        'toggleReportChangedRemotes',
                        //  Loaded TSH commands
                        'audit',
                        'history',
                        'test'
                        )));

    this.set('$keywordsMatcher',
                TP.core.ListMatcher.construct(
                    'JS_COMMANDS',
                    TP.boot.$keywords.concat(TP.boot.$futurereservedwords),
                    'match_keyword'));

    this.set('$cfgMatcher',
                TP.core.ListMatcher.construct(
                    'TIBET_CFG',
                    TP.sys.cfg().getKeys()));

    this.set('$uriMatcher',
                TP.core.URIMatcher.construct(
                    'TIBET_URIS'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineHandler('DOMKeyUp',
function(aSignal) {

    /**
     * @method handleDOMKeyUp
     */

    var consoleGUI,
        val,

        matches,
        groupings,

        searcher;

    consoleGUI = this.get('$consoleGUI');

    //  NB: val might be empty, but that's ok - if the user has Backspaced all
    //  of the way and wiped out the entries, we need to clear all of the
    //  results.
    val = consoleGUI.get('consoleInput').getDisplayValue();

    matches = this.computeMatches(val);

    searcher = this.get('searcher');

    groupings = matches.groupBy(
                    function(anItem) {
                        return anItem.matcherName;
                    });

    //  d3.js likes to see its data as Arrays
    groupings = groupings.asArray();

    //  Set the searcher's value, thereby triggering it's rendering code.
    searcher.set('value', groupings);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineHandler('DOM_Esc_Up',
function(aSignal) {
    TP.signal(TP.ANY, 'TP.sig.EndSearchMode');
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineHandler('SearchEnter',
function(aSignal) {

    /**
     * @method searchEnter
     */

    var searcher,
        consoleGUI,
        searcherTile;

    //  Clear the searcher's content
    searcher = this.get('searcher');
    searcher.set('value', null);

    //  Clear the console's input
    consoleGUI = this.get('$consoleGUI');
    consoleGUI.clearInput();

    //  Show the searcher tile
    searcherTile = TP.byId('searcher_tile', consoleGUI);
    searcherTile.toggle('hidden');

    this.observe(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    this.set('$isActive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineHandler('SearchExit',
function(aSignal) {

    /**
     * @method searchExit
     */

    var consoleGUI,

        searcherTile;

    this.set('$isActive', false);

    //  Clear the console's input
    consoleGUI = this.get('$consoleGUI');
    consoleGUI.clearInput();

    //  Show the searcher tile
    searcherTile = TP.byId('searcher_tile', consoleGUI);
    searcherTile.toggle('hidden');

    this.ignore(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineMethod('computeMatches',
function(inputContent) {

    /**
     * @method supplyCompletions
     */

    var completions,

        matchers,

        info,
        tokenizedFragment,

        resolvedObj,
        resolutionChunks,
        chunk,

        closestMatchIndex,
        closestMatchMatcher,

        matches;

    completions = TP.ac();

    closestMatchIndex = TP.NOT_FOUND;

    if (TP.notEmpty(inputContent)) {

        matchers = TP.ac();

        info = TP.core.Sherpa.tokenizeForMatches(inputContent);
        tokenizedFragment = info.at('fragment');

        switch (info.at('context')) {
            case 'KEYWORD':
            case 'JS':

                resolvedObj = TP.global;
                resolutionChunks = info.at('resolutionChunks');

                if (TP.notEmpty(resolutionChunks)) {

                    resolutionChunks = resolutionChunks.copy();

                    while (TP.isValid(resolvedObj) &&
                            TP.notEmpty(resolutionChunks)) {
                        chunk = resolutionChunks.shift();
                        resolvedObj = resolvedObj[chunk];
                    }

                    if (TP.notValid(resolvedObj) ||
                        TP.notEmpty(resolutionChunks)) {
                        //  TODO: Log a warning
                        break;
                    }

                    matchers.push(
                        TP.core.KeyedSourceMatcher.construct(
                                            'JS_CONTEXT', resolvedObj).
                        set('input', tokenizedFragment));
                }

                break;

            default:
                break;
        }

        matchers.push(
            this.get('$keywordsMatcher').set('input', inputContent),
            this.get('$tshExecutionInstanceMatcher').set('input', inputContent),
            this.get('$tshHistoryMatcher').set('input', inputContent),
            this.get('$tshCommandsMatcher').set('input', inputContent),
            this.get('$cfgMatcher').set('input', inputContent),
            this.get('$uriMatcher').set('input', inputContent));

        if (TP.notEmpty(matchers)) {

            matchers.forEach(
                function(matcher) {

                    var matchInput;

                    matcher.prepareForMatch();

                    matchInput = matcher.get('input');
                    matches = matcher.match();

                    matches.forEach(
                        function(anItem, anIndex) {
                            var itemEntry;

                            if (TP.isArray(itemEntry = anItem.original)) {
                                itemEntry = itemEntry.at(2);
                            }

                            completions.push({
                                matcherName: anItem.matcherName,
                                input: matchInput,
                                text: itemEntry,
                                score: anItem.score,
                                displayText: anItem.string,
                                className: 'result',
                                suffix: anItem.suffix
                            });
                        });
                });

            if (TP.notEmpty(completions)) {

                //  Sort all of the completions together using a custom sorting
                //  function to go after parts of the completion itself.
                completions.sort(
                    function(completionA, completionB) {

                        //  Sort by matcher name, score and then text, in that
                        //  order.
                        return TP.sort.COMPARE(
                                    completionB.matcherName,
                                    completionA.matcherName) ||
                                TP.sort.COMPARE(
                                    completionB.score,
                                    completionA.score) ||
                                TP.sort.COMPARE(
                                    completionB.text,
                                    completionA.text);
                    });

                closestMatchIndex = TP.NOT_FOUND;
                closestMatchMatcher = TP.rc('^' + inputContent);

                //  Try to determine if we have a 'best match' here and set the
                //  'exact match' index to it.
                completions.forEach(
                        function(aCompletion, anIndex) {

                            //  Test each completion to see if it starts with
                            //  text matching inputContent. Note here that we
                            //  stop at the first one.
                            if (closestMatchMatcher.test(aCompletion.text) &&
                                closestMatchIndex === TP.NOT_FOUND) {
                                closestMatchIndex = anIndex;
                            }
                        });
            }
        }
    }

    return completions;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
