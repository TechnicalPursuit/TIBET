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

TP.sherpa.TemplatedTag.defineSubtype('searcher');

TP.sherpa.searcher.addTraits(TP.core.SelectingUIElementNode);
TP.sherpa.searcher.addTraits(TP.core.D3VirtualList);

TP.sherpa.searcher.Inst.resolveTrait('select', TP.core.SelectingUIElementNode);

//  Is the command line current in search mode?
TP.sherpa.searcher.Inst.defineAttribute('searchMode');

TP.sherpa.searcher.Inst.defineAttribute('scroller',
    TP.cpc('> .scroller', TP.hc('shouldCollapse', true)));

TP.sherpa.searcher.Inst.defineAttribute('listcontent',
    TP.cpc('> .scroller > .content', TP.hc('shouldCollapse', true)));

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
    tpElem.configure();

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

TP.sherpa.searcher.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns true by default.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('configure',
function() {

    var consoleService,
        consoleGUI,

        currentKeyboard,

        keyboardSM,
        searchResponder,

        searchEngine;

    consoleService = TP.bySystemId('SherpaConsoleService');
    consoleGUI = consoleService.get('$consoleGUI');

    currentKeyboard = TP.core.Keyboard.getCurrentKeyboard();

    keyboardSM = consoleService.get('keyboardStateMachine');

    keyboardSM.defineState(
        'normal',
        'search',
        {
            trigger: TP.ac(currentKeyboard, 'TP.sig.DOM_QuestionMark_Up')
        });

    keyboardSM.defineState(
        'search',
        'normal',
        {
            trigger: TP.ac(TP.ANY, 'TP.sig.EndSearchMode')
        });

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
    searchResponder.set('$consoleService', consoleService);
    searchResponder.set('$consoleGUI', consoleGUI);

    searchResponder.addStateMachine(keyboardSM);
    searchResponder.addInputState('search');

    searchEngine = TP.sherpa.SearchEngine.construct();
    searchEngine.set('searcher', this);
    searchEngine.set('$consoleGUI', consoleGUI);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('getResultIndex',
function(aValue, offsetDirection) {

    var data,

        len,
        i,
        j;

    data = this.get('data').flatten();

    len = data.getSize();
    for (i = 0; i < len; i++) {
        if (data.at(i).className === 'result' &&
                data.at(i).text === aValue) {

            if (offsetDirection === TP.FOLLOWING) {
                for (j = i + 1; j < len; j++) {
                    if (data.at(j).className === 'result') {
                        return j;
                    }
                }

                //  Couldn't return a forward search. Start at the '0th result'
                for (j = 0; j < len; j++) {
                    if (data.at(j).className === 'result') {
                        return j;
                    }
                }
            } else if (offsetDirection === TP.PRECEDING) {
                for (j = i - 1; j >= 0; j--) {
                    if (data.at(j).className === 'result') {
                        return j;
                    }
                }

                //  Couldn't return a backward search. Start at the 'last result'
                for (j = len - 1; j >= 0; j--) {
                    if (data.at(j).className === 'result') {
                        return j;
                    }
                }
            } else {
                return i;
            }
        }
    }

    return -1;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('getSelectedElements',
function() {

    /**
     * @method getSelectedElements
     * @summary Returns an Array TP.core.UIElementNodes that are 'selected'
     *     within the receiver.
     * @returns {TP.core.UIElementNode[]} The Array of selected
     *     TP.core.UIElementNodes.
     */

    //  TODO: This doesn't match reality because of the infinite scrolling and
    //  needs to be fixed.
    return TP.byCSSPath('li[pclass|selected]', this);
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('getValueElements',
function() {

    /**
     * @method getValueElements
     * @summary Returns an Array TP.core.UIElementNodes that share a common
     *     'value object' with the receiver. That is, a change to the 'value' of
     *     the receiver will also change the value of one of these other
     *     TP.core.UIElementNodes. By default, this method will return other
     *     elements that are part of the same 'tibet:group'.
     * @returns {TP.core.UIElementNode[]} The Array of shared value items.
     */

    //  TODO: This doesn't match reality because of the infinite scrolling and
    //  needs to be fixed.
    return this.get('listcontent').getChildElements();
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineHandler('ItemSelected',
function(aSignal) {

    var domTarget,

        elemWithItemText,

        value,

        consoleExecValue,

        win,
        searcherDrawer;

    domTarget = aSignal.getDOMTarget();

    if (TP.isNode(domTarget)) {

        if (TP.isEmpty(value =
                        TP.elementGetAttribute(domTarget, 'itemText', true))) {
            elemWithItemText = TP.nodeGetFirstAncestorByAttribute(
                                    domTarget, 'itemText', null, true);
            if (TP.isElement(elemWithItemText)) {
                value = TP.elementGetAttribute(elemWithItemText, 'itemText', true);
            }
        }

        if (TP.notEmpty(value)) {
            consoleExecValue = ':reflect ' + value;
            TP.bySystemId('SherpaConsoleService').sendConsoleRequest(
                                                            consoleExecValue);
        }
    }

    win = TP.win('UIROOT');

    //  Hide the searcher drawer
    searcherDrawer = TP.byId('northeast', win);
    searcherDrawer.setAttribute('closed', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('selectNextItem',
function() {

    /**
     * @method selectNextItem
     */

    var currentValue,
        itemIndex,

        newValue;

    currentValue = this.get('$currentValue');
    itemIndex = this.getResultIndex(currentValue, TP.FOLLOWING);

    newValue = this.get('data').flatten().at(itemIndex);

    this.select(newValue.text);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('selectPreviousItem',
function() {

    /**
     * @method selectPreviousItem
     */

    var currentValue,
        itemIndex,

        newValue;

    currentValue = this.get('$currentValue');
    itemIndex = this.getResultIndex(currentValue, TP.PRECEDING);

    newValue = this.get('data').flatten().at(itemIndex);

    this.select(newValue.text);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.searcher.Inst.defineMethod('select',
function(aValue, anIndex) {

    /**
     * @method select
     * @summary Selects the element which has the provided value (if found) or
     *     is at the provided index.
     *     Note that this method is roughly identical to setDisplayValue() with
     *     the exception that, if the receiver allows multiple selection, this
     *     method does not clear existing selections when processing the
     *     value(s) provided.
     * @param {Object} [aValue] The value to select. Note that this can be an
     *     Array.
     * @param {Number} [anIndex] The index of the value in the receiver's data
     *     set.
     * @returns {Boolean} Whether or not a selection was selected.
     */

    var selectedElem,

        elem,
        itemIndex,

        rowHeight,
        displayedRows,

        needsRender,

        startIndex,

        scrollAmount;

    elem = this.getNativeNode();

    //  Turn off the current one, if it exists

    selectedElem = TP.byCSSPath('li[pclass|selected]',
                                    elem,
                                    true,
                                    false);

    if (TP.isElement(selectedElem)) {
        this.set('$currentValue', null);
        TP.elementRemoveAttribute(selectedElem, 'pclass:selected', true);
    }

    itemIndex = this.getResultIndex(aValue);

    //  If we found one, then cause things to scroll to it.
    if (itemIndex !== TP.NOT_FOUND) {

        this.set('$currentValue', aValue);

        rowHeight = this.getRowHeight();

        startIndex = (elem.scrollTop / rowHeight).floor();
        displayedRows = (TP.elementGetHeight(elem) / rowHeight).floor();

        needsRender = true;
        if (itemIndex < startIndex) {
            //  It's above the scrollable area - scroll up
            scrollAmount = itemIndex * rowHeight;
        } else if (itemIndex > startIndex + displayedRows - 1) {
            //  It's below the scrollable area - scroll down
            /* eslint-disable no-extra-parens */
            scrollAmount = ((itemIndex - 1) - displayedRows + 1) * rowHeight;
            /* eslint-enable no-extra-parens */
        } else {
            needsRender = false;
        }

        if (needsRender) {
            //  Adjust the scrolling amount and call the receiver's internal
            //  rendering method.
            elem.scrollTop = scrollAmount;
            this.$internalRender();
        }

        selectedElem = TP.byCSSPath('li[itemText="' + aValue + '"]',
                                        elem,
                                        true,
                                        false);

        TP.elementSetAttribute(selectedElem, 'pclass:selected', true, true);

        return true;
    }

    return false;
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
     * @returns {TP.extern.d3.selection} The supplied enter selection or a new
     *     selection containing any new content that was added.
     */

    var attrSelectionInfo,
        newContent,

        currentValue;

    attrSelectionInfo = this.getRowAttrSelectionInfo();
    newContent = enterSelection.append('li').attr(attrSelectionInfo.first(),
                                                    attrSelectionInfo.last());

    currentValue = this.get('$currentValue');

    newContent.html(
                function(d) {

                    if (d.text === currentValue) {
                        TP.elementSetAttribute(
                                this, 'pclass:selected', true, true);
                    }

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

    return newContent;
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
                    0,
                    {
                        displayText: aPair.at(0),
                        className: 'category'
                    });
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
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    updateSelection.html(
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

    return updateSelection;
});

//  ========================================================================
//  TP.sherpa.SearchKeyResponder
//  ========================================================================

TP.sherpa.NormalKeyResponder.defineSubtype('TP.sherpa.SearchKeyResponder');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineHandler('SearchEnter',
function(aSignal) {

    /**
     * @method searchEnter
     */

    var consoleGUI,
        win,

        searcherDrawer;

    //  Clear the console's input
    consoleGUI = this.get('$consoleGUI');
    consoleGUI.clearInput();

    win = consoleGUI.getNativeWindow();

    //  Show the searcher drawer
    searcherDrawer = TP.byId('northeast', win);
    searcherDrawer.setAttribute('closed', false);

    // this.observe(TP.byId('SherpaHUD', win), 'DrawerClosedDidChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineHandler('SearchExit',
function(aSignal) {

    /**
     * @method searchExit
     */

    /*
    var win;

    win = this.get('$consoleGUI').getNativeWindow();

    this.ignore(TP.byId('SherpaHUD', win), 'DrawerClosedDidChange');
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchKeyResponder.Inst.defineHandler('DrawerClosedDidChange',
function(aSignal) {

    /**
     * @method handleDrawerClosedDidChange
     * @returns {TP.sherpa.halo} The receiver.
     */

    var win,
        searcherDrawer,

        isClosed;

    if (aSignal.at('drawerOriginID') === 'northeast') {

        win = this.get('$consoleGUI').getNativeWindow();

        searcherDrawer = TP.byId('northeast', win);
        isClosed = TP.bc(searcherDrawer.getAttribute('closed'));

        if (isClosed) {
            TP.signal(TP.ANY, 'TP.sig.EndSearchMode');
        }
    }

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ========================================================================
//  TP.sherpa.SearchEngine
//  ========================================================================

TP.lang.Object.defineSubtype('TP.sherpa.SearchEngine');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineAttribute('$consoleGUI');
TP.sherpa.SearchEngine.Inst.defineAttribute('searcher');

TP.sherpa.SearchEngine.Inst.defineAttribute('$tshHistoryMatcher');
TP.sherpa.SearchEngine.Inst.defineAttribute('$tshExecutionInstanceMatcher');
TP.sherpa.SearchEngine.Inst.defineAttribute('$tshCommandsMatcher');
TP.sherpa.SearchEngine.Inst.defineAttribute('$keywordsMatcher');
TP.sherpa.SearchEngine.Inst.defineAttribute('$cfgMatcher');
TP.sherpa.SearchEngine.Inst.defineAttribute('$uriMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Constructor for new instances.
     * @returns {TP.sherpa.SearchEngine} A new instance.
     */

    this.callNextMethod();

    // this.observe(TP.byId('SherpaHUD', TP.win('UIROOT')),
     //               'DrawerClosedDidChange');

    this.set('$tshHistoryMatcher',
                TP.shell.TSHHistoryMatcher.construct(
                    'TSH_HISTORY'));

    this.set('$tshExecutionInstanceMatcher',
                TP.core.KeyedSourceMatcher.construct(
                    'TSH_CONTEXT',
                    TP.shell.TSH.getDefaultInstance().
                                        getExecutionInstance()));

    this.set('$tshCommandsMatcher',
                TP.core.ListMatcher.construct(
                    'TSH_COMMANDS',
                    TP.ac(
                        //  Core TP.shell.Shell commands
                        'about',
                        'alias',
                        'clear',
                        'config',
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
                        'processChangedRemotes',
                        'toggleRemoteWatch',
                        'toggleReportChangedRemotes',
                        //  Loaded TSH commands
                        'audit',
                        'history',
                        'test'
                        )));

    this.set('$keywordsMatcher',
                TP.core.ListMatcher.construct(
                    'JS_WORDS',
                    TP.boot.$keywords.concat(TP.boot.$futurereservedwords),
                    'match_keyword'));

    this.set('$cfgMatcher',
                TP.core.ListMatcher.construct(
                    'TIBET_CFG',
                    TP.sys.cfg().getKeys()));

    this.set('$uriMatcher',
                TP.uri.URIMatcher.construct(
                    'TIBET_URIS'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineMethod('activate',
function() {

    var inputFieldTPElem;

    inputFieldTPElem = TP.byId('searchPanelInput', TP.win('UIROOT'));

    this.observe(inputFieldTPElem, 'TP.sig.DOMKeyUp');
    inputFieldTPElem.focus();

    this.observe(TP.core.Keyboard.getCurrentKeyboard(),
                    TP.ac('TP.sig.DOM_Esc_Up',
                            'TP.sig.DOM_Enter_Up',
                            'TP.sig.DOM_Down_Up',
                            'TP.sig.DOM_Up_Up'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineMethod('computeMatches',
function(inputContent) {

    /**
     * @method computeMatches
     */

    var resolveTopLevelObjectReference,

        completions,

        matchers,

        info,
        tokenizedFragment,

        resolvedObj,
        resolutionChunks,

        topLevelObjects,
        i,

        closestMatchIndex,
        closestMatchMatcher,

        matches;

    resolveTopLevelObjectReference = function(startObj, propertyPaths) {

        var pathObj,
            paths,

            path;

        pathObj = startObj;
        paths = propertyPaths.copy();

        while (TP.isValid(pathObj) && TP.notEmpty(paths)) {
            path = paths.shift();
            pathObj = pathObj[path];
        }

        //  If we haven't exhausted the path, then it doesn't matter what we've
        //  currently resolved - we must return null
        if (TP.notEmpty(paths)) {
            return null;
        }

        if (TP.isValid(pathObj)) {
            return pathObj;
        }
    };

    completions = TP.ac();

    closestMatchIndex = TP.NOT_FOUND;

    if (TP.notEmpty(inputContent)) {

        matchers = TP.ac();

        info = TP.sherpa.IDE.tokenizeForMatches(inputContent);
        tokenizedFragment = info.at('fragment');

        switch (info.at('context')) {
            case 'KEYWORD':
            case 'JS':

                topLevelObjects = TP.ac(
                    TP.global,
                    TP.shell.TSH.getDefaultInstance().getExecutionInstance(),
                    TP,
                    APP,
                    CSS
                );

                resolutionChunks = info.at('resolutionChunks');

                for (i = 0; i < topLevelObjects.getSize(); i++) {

                    resolvedObj = resolveTopLevelObjectReference(
                                                topLevelObjects.at(i),
                                                resolutionChunks);
                    if (TP.isValid(resolvedObj)) {
                        break;
                    }
                }

                //  If we couldn't get a resolved object then we just use
                //  keyed source matchers for all of the top level objects.
                if (TP.notValid(resolvedObj)) {

                    for (i = 0; i < topLevelObjects.getSize(); i++) {

                        matchers.push(
                            TP.core.KeyedSourceMatcher.construct(
                                        TP.name(topLevelObjects.at(i)),
                                            topLevelObjects.at(i)).
                                set('input', tokenizedFragment));
                    }

                    matchers.push(this.get('$keywordsMatcher').
                                    set('input', inputContent));
                } else {
                    matchers.push(
                        TP.core.KeyedSourceMatcher.construct(
                                            TP.name(resolvedObj), resolvedObj).
                            set('input', tokenizedFragment));
                }

                /*
                matchers.push(
                    this.get('$keywordsMatcher').set('input', inputContent),
                    this.get('$tshExecutionInstanceMatcher').set(
                                                        'input', inputContent),
                    this.get('$tshHistoryMatcher').set('input', inputContent),
                    this.get('$tshCommandsMatcher').set('input', inputContent),
                    this.get('$cfgMatcher').set('input', inputContent),
                    this.get('$uriMatcher').set('input', inputContent));
                */

                break;

            case 'TSH':

                matchers.push(this.get('$tshCommandsMatcher').
                                set('input', inputContent));

                break;

            case 'CFG':

                matchers.push(this.get('$cfgMatcher').
                                set('input', inputContent));

                break;

            case 'URI':

                matchers.push(this.get('$uriMatcher').
                                set('input', inputContent));

                break;

            default:
                break;
        }

        if (TP.notEmpty(matchers)) {

            matchers.forEach(
                function(matcher) {

                    var matchInput,

                        keySource,
                        keySourceIsNativeType,
                        keySourceProto,
                        keySourceName;

                    matcher.prepareForMatch();

                    matchInput = matcher.get('input');
                    matches = matcher.match();

                    if (TP.notEmpty(matches)) {

                        keySource = matcher.get('keySource');

                        if (TP.isValid(keySource) && TP.isNativeType(keySource)) {
                            keySourceIsNativeType = true;
                            keySourceProto = keySource.prototype;
                        } else {
                            keySourceIsNativeType = false;
                        }

                        if (TP.isValid(keySource) && keySource !== TP.global) {
                            keySourceName =
                                TP.name(matcher.get('keySource')) + '.';
                        } else {
                            keySourceName = '';
                        }

                        matches.forEach(
                            function(anItem, anIndex) {
                                var itemEntry,
                                    text;

                                if (TP.isArray(itemEntry = anItem.original)) {
                                    itemEntry = itemEntry.at(2);
                                }

                                try {
                                    if (keySourceIsNativeType) {
                                        if (TP.isValid(
                                            Object.getOwnPropertyDescriptor(
                                                keySource, anItem.original))) {
                                            text = keySourceName +
                                                    'Type.' +
                                                    itemEntry;
                                        } else if (
                                            TP.isValid(
                                            Object.getOwnPropertyDescriptor(
                                                keySourceProto, anItem.original))) {
                                            text = keySourceName +
                                                    'Inst.' +
                                                    itemEntry;
                                        } else {
                                            text = keySourceName + itemEntry;
                                        }

                                        text = '\'' +
                                                '__NATIVE__' +
                                                text +
                                                '\'';
                                    } else {
                                        text = keySourceName + itemEntry;
                                    }
                                } catch (e) {
                                    text = keySourceName + itemEntry;
                                }

                                completions.push({
                                    matcherName: anItem.matcherName,
                                    input: matchInput,
                                    text: text,
                                    score: anItem.score,
                                    displayText:
                                        keySourceName + anItem.string,
                                    className: 'result',
                                    suffix: anItem.suffix
                                });
                            });
                    }
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
                                    completionA.text.length,
                                    completionB.text.length) ||
                                TP.sort.COMPARE(
                                    completionA.text,
                                    completionB.text);
                    });

                closestMatchIndex = TP.NOT_FOUND;
                closestMatchMatcher = TP.rc(
                                        '^' + TP.regExpEscape(inputContent));

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

TP.sherpa.SearchEngine.Inst.defineMethod('deactivate',
function() {

    var inputFieldTPElem,
        consoleGUI,

        searcher;

    this.ignore(inputFieldTPElem, 'TP.sig.DOMKeyUp');

    this.ignore(TP.core.Keyboard.getCurrentKeyboard(),
                    TP.ac('TP.sig.DOM_Esc_Up',
                            'TP.sig.DOM_Enter_Up',
                            'TP.sig.DOM_Down_Up',
                            'TP.sig.DOM_Up_Up'));

    inputFieldTPElem = TP.byId('searchPanelInput', TP.win('UIROOT'));
    inputFieldTPElem.clearValue();
    inputFieldTPElem.blur();

    //  Clear the console's input
    consoleGUI = this.get('$consoleGUI');

    consoleGUI.focusInput();
    consoleGUI.setInputCursorToEnd();

    //  Set the searcher's value to null, clearing it.
    searcher = this.get('searcher');
    searcher.set('value', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineHandler('DOMKeyUp',
function(aSignal) {

    /**
     * @method handleDOMKeyUp
     */

    var origin,
        sigOriginTPElem,

        val,

        matches,
        groupings,

        searcher;

    //  Moving down or up in the list or cancelling / accepting a match
    //  shouldn't proceed further here.
    if (aSignal.getKeyName() === 'DOM_Down_Up' ||
        aSignal.getKeyName() === 'DOM_Up_Up' ||
        aSignal.getKeyName() === 'DOM_Esc_Up' ||
        aSignal.getKeyName() === 'DOM_Enter_Up') {
        return this;
    }

    origin = aSignal.getOrigin();

    if (TP.isString(origin)) {
        sigOriginTPElem = TP.bySystemId(origin);
    } else {
        sigOriginTPElem = TP.wrap(origin);
    }

    //  NB: val might be empty, but that's ok - if the user has Backspaced all
    //  of the way and wiped out the entries, we need to clear all of the
    //  results.
    val = sigOriginTPElem.getDisplayValue();

    matches = this.computeMatches(val);

    groupings = matches.groupBy(
                    function(anItem) {
                        return anItem.matcherName;
                    });

    //  d3.js likes to see its data as Arrays
    groupings = groupings.asArray();

    //  Set the searcher's value, thereby triggering it's rendering code.
    searcher = this.get('searcher');
    searcher.set('value', groupings);

    if (TP.notEmpty(groupings)) {
        searcher.select(groupings.at(0).at(1).at(0).text);
    }

    return this;
}, {
    origin: 'searchPanelInput'
});

//  ----------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineHandler('DOM_Down_Up',
function(aSignal) {

    this.get('searcher').selectNextItem();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineHandler('DOM_Esc_Up',
function(aSignal) {

    var win,
        searcherDrawer;

    win = TP.win('UIROOT');

    //  Hide the searcher drawer
    searcherDrawer = TP.byId('northeast', win);
    searcherDrawer.setAttribute('closed', true);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineHandler('DOM_Enter_Up',
function(aSignal) {

    var currentValue,

        consoleExecValue,

        win,
        searcherDrawer;

    currentValue = this.get('searcher').get('$currentValue');

    if (TP.notEmpty(currentValue)) {
        if (/__NATIVE__/.test(currentValue)) {
            consoleExecValue = ':reflect --docsonly \'' + currentValue.slice(11);
        } else {
            consoleExecValue = ':reflect ' + currentValue;
        }

        TP.bySystemId('SherpaConsoleService').sendShellRequest(
                                                    consoleExecValue);
    }

    win = TP.win('UIROOT');

    //  Hide the searcher drawer
    searcherDrawer = TP.byId('northeast', win);
    searcherDrawer.setAttribute('closed', true);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineHandler('DOM_Up_Up',
function(aSignal) {

    this.get('searcher').selectPreviousItem();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SearchEngine.Inst.defineHandler('DrawerClosedDidChange',
function(aSignal) {

    /**
     * @method handleDrawerClosedDidChange
     * @returns {TP.sherpa.halo} The receiver.
     */

    var win,
        searcherDrawer,

        isClosed;

    if (aSignal.at('drawerOriginID') === 'northeast') {

        win = TP.win('UIROOT');

        searcherDrawer = TP.byId('northeast', win);
        isClosed = TP.bc(searcherDrawer.getAttribute('closed'));

        if (isClosed) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
