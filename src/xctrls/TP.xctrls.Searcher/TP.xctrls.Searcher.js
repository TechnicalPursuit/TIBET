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
 * @type {TP.xctrls.Searcher}
 * @summary
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xctrls.Searcher');

//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Type.defineMethod('constructMatcherForGlobalJSContexts',
function() {

    /**
     * @method constructMatcherForGlobalJSContexts
     * @summary Returns a special, locally-programmed,
     *     TP.xctrls.KeyedSourceMatcher, that can handle the JavaScript global
     *     object better than a generic keyed source matcher.
     * @returns {TP.xctrls.KeyedSourceMatcher} A new matcher specially configured
     *     to handle global JS contexts, including native JS constructors.
     */

    var matcher,

        keySource,
        keySourceIsNativeType,
        keySourceProto,
        keySourceName;

    //  Construct a keyed source matcher with TP.global as the source.
    matcher = TP.xctrls.KeyedSourceMatcher.construct('JS_CONTEXT', TP.global);

    //  Locally program 2 methods onto that instance that will manage native
    //  objects better than a regular keyed source matcher will. Note the use of
    //  closured variables - this is ok, since only one of these special
    //  matchers will be in use at a particular time.

    matcher.defineMethod(
        'prepareForResultProcessing',
        function(matchResults) {

            keySource = this.get('keySource');

            if (TP.isValid(keySource) && TP.isNativeType(keySource)) {
                keySourceIsNativeType = true;
                keySourceProto = keySource.prototype;
            } else {
                keySourceIsNativeType = false;
            }

            if (TP.isValid(keySource) && keySource !== TP.global) {
                keySourceName = TP.name(this.get('keySource')) + '.';
            } else {
                keySourceName = '';
            }
        });

    matcher.defineMethod(
        'postProcessResult',
        function(aCompletionEntry) {

            var itemText,
                text;

            itemText = aCompletionEntry.text;

            try {
                if (keySourceIsNativeType) {
                    if (TP.isValid(Object.getOwnPropertyDescriptor(
                                    keySource, aCompletionEntry.string))) {
                        text = keySourceName + 'Type.' + itemText;
                    } else if (
                        TP.isValid(Object.getOwnPropertyDescriptor(
                                    keySourceProto, aCompletionEntry.string))) {
                        text = keySourceName + 'Inst.' + itemText;
                    } else {
                        text = keySourceName + itemText;
                    }

                    aCompletionEntry.needsPrefix = false;
                    aCompletionEntry.nativeObject = true;
                } else if (TP.isWindow(keySource)) {
                    text = itemText;
                    aCompletionEntry.needsPrefix = false;
                    aCompletionEntry.nativeObject = true;
                } else {
                    text = keySourceName + itemText;
                }
            } catch (e) {
                text = keySourceName + itemText;
            }

            aCompletionEntry.text = text;

            return;
        });

    return matcher;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Inst.defineAttribute('$cssMatcher');
TP.xctrls.Searcher.Inst.defineAttribute('$cfgMatcher');
TP.xctrls.Searcher.Inst.defineAttribute('$keywordsMatcher');
TP.xctrls.Searcher.Inst.defineAttribute('$tshHistoryMatcher');
TP.xctrls.Searcher.Inst.defineAttribute('$tshExecutionInstanceMatcher');
TP.xctrls.Searcher.Inst.defineAttribute('$tshCommandsMatcher');
TP.xctrls.Searcher.Inst.defineAttribute('$uriMatcher');

TP.xctrls.Searcher.Inst.defineAttribute('dynamicMatchers');
TP.xctrls.Searcher.Inst.defineAttribute('matchers');
TP.xctrls.Searcher.Inst.defineAttribute('defaultMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.xctrls.Searcher} The receiver.
     */

    var tshCommands;

    this.callNextMethod();

    this.set('$cssMatcher',
                TP.xctrls.CSSPropertyMatcher.construct(
                    'CSS_PROPS'));

    this.set('$cfgMatcher',
                TP.xctrls.ListMatcher.construct(
                    'TIBET_CFG',
                    TP.sys.cfg().getKeys()));

    this.set('$keywordsMatcher',
                TP.xctrls.ListMatcher.construct(
                    'JS_COMMANDS',
                    TP.boot.$keywords.concat(TP.boot.$futurereservedwords),
                    'match_keyword'));

    this.set('$tshHistoryMatcher',
                TP.xctrls.TSHHistoryMatcher.construct(
                    'TSH_HISTORY'));

    this.set('$tshExecutionInstanceMatcher',
                TP.xctrls.KeyedSourceMatcher.construct(
                    'TSH_CONTEXT',
                    TP.shell.TSH.getDefaultInstance().
                                        getExecutionInstance()));

    tshCommands = TP.ac();
    TP.shell.Shell.get('helpTopics').perform(
        function(kvPair) {
            tshCommands.push(kvPair.first());
        });
    this.set('$tshCommandsMatcher',
                TP.xctrls.ListMatcher.construct(
                    'TSH_COMMANDS',
                    tshCommands));

    this.set('$uriMatcher',
                TP.xctrls.URIMatcher.construct(
                    'TIBET_URIS'));

    this.set('matchers', TP.ac());
    this.set('dynamicMatchers', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Inst.defineMethod('addMatcher',
function(aMatcher) {

    /**
     * @method addMatcher
     * @summary Adds the supplied matcher to the receiver's matcher list.
     * @param {TP.xctrls.Matcher} aMatcher The matcher to add to the receiver's
     *     matcher list.
     * @returns {TP.xctrls.Searcher} The receiver.
     */

    this.get('matchers').push(aMatcher);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Inst.defineMethod('computeResultsFrom',
function(aValue, matchers) {

    /**
     * @method computeResultsFrom
     * @summary Computes and massages the search results using the supplied
     *     search term value and set of search matchers.
     * @param {String} aValue The search term value to search for.
     * @param {TP.xctrls.Matcher[]} matchers The list of matchers to use to
     *     compute the result set from.
     * @returns {Object[]} An Array of search result POJOs that contain one or
     *     more of the following slots:
     *          matcherName {String}    The name of the matcher that produced
     *                                  this match result.
     *          input       {String}    The input that the matcher used to
     *                                  produce the match result.
     *          text        {String}    The raw text of the match result.
     *          score       {Number}    The score, between 0 and 1.0, that was
     *                                  assigned to the match result. Lower
     *                                  scores indicate 'better' matches (i.e.
     *                                  more exact to the search term).
     *          displayText {String}    A 'marked up' version of the match
     *                                  result, using XHTML markup
     *                                  '<span class="match_result">' to
     *                                  indicate the portions of match result
     *                                  that matched portions of the search
     *                                  term.
     */

    var results;

    results = TP.ac();

    matchers.forEach(
        function(matcher) {

            var matches;

            matcher.prepareForMatching();

            matches = matcher.match();

            if (TP.notEmpty(matches)) {

                matcher.prepareForResultProcessing(matches);

                matches.forEach(
                    function(anItem, anIndex) {
                        var itemEntry,

                            len,
                            i,
                            indexEntry,

                            val,

                            displayText,
                            highlightText,

                            resultEntry;

                        //  NB: 'anItem.string' is either the original datum
                        //  value if there were no matches or the result datum
                        //  value if there were.

                        if (TP.notValid(anItem.matches)) {

                            resultEntry = {
                                matcherName: anItem.matcherName,
                                input: anItem.input,
                                text: anItem.string,
                                score: 1,
                                displayText: anItem.string
                            };
                        } else {
                            itemEntry = anItem.matches[0];

                            displayText = '';
                            len = itemEntry.indices.getSize();
                            for (i = 0; i < len; i++) {
                                indexEntry = itemEntry.indices[i];
                                val = itemEntry.value;

                                if (i === 0) {
                                    displayText += val.slice(0, indexEntry[0]);
                                } else {
                                    displayText +=
                                        val.slice(
                                            itemEntry.indices[i - 1][1] + 1,
                                            indexEntry[0]);
                                }

                                highlightText = itemEntry.value.slice(
                                                    indexEntry[0],
                                                    indexEntry[1] + 1);

                                displayText +=
                                    '<span xmlns="' +
                                        TP.w3.Xmlns.XHTML +
                                        '" class="match_result">' +
                                        TP.xmlLiteralsToEntities(highlightText) +
                                    '</span>';

                                if (i === len - 1) {
                                    displayText +=
                                        val.slice(indexEntry[1] + 1);
                                }
                            }

                            resultEntry = {
                                matcherName: anItem.matcherName,
                                input: anItem.input,
                                text: anItem.string,
                                score: anItem.score,
                                displayText: displayText,
                                prefix: anItem.prefix
                            };
                        }

                        matcher.postProcessResult(resultEntry);

                        results.push(resultEntry);
                    });
            }
        });

    if (TP.notEmpty(results)) {

        //  Sort all of the results together using a custom sorting function to
        //  go after parts of the completion itself.
        results.sort(
            function(resultA, resultB) {

                //  Sort by matcher name, score, and then text, in that order.
                return TP.sort.COMPARE(
                            resultB.matcherName,
                            resultA.matcherName) ||
                        TP.sort.COMPARE(
                            resultA.score,
                            resultB.score) ||
                        TP.sort.COMPARE(
                            resultA.text,
                            resultB.text);
            });
    }

    return results;
});

//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Inst.defineMethod('computeMatchersFrom',
function(aValue, topLevelObjects) {

    /**
     * @method computeMatchersFrom
     * @summary Computes the list of matchers that will be used, based on the
     *     supplied search term value and set of top level object. This is
     *     applicable when the receiver is configured to use a 'dynamic matcher
     *     set'.
     * @param {String} aValue The search term value to use to compute the list
     *     of matchers.
     * @param {Object[]} topLevelObjects The list of top level objects that will
     *     be used to compute matchers from. This is defaulted to TP.global.
     * @returns {TP.xctrls.Matcher[]} The list of matchers to use to search
     *     various search spaces for the specified search term.
     */

    var resolveTopLevelObjectReference,

        matchers,

        info,
        tokenizedFragment,

        newMatcher,

        topLevelContexts,

        resolutionChunks,
        i,
        resolvedObj;

    if (TP.isEmpty(aValue)) {
        return TP.ac();
    }

    //  A Function that, starting at a particular object, will traverse the
    //  supplied paths until it has exhausted them. If it doesn't exhaust the
    //  entire set of paths, but cannot continue because of a non-valid value,
    //  it will return null.
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
        //  currently resolved - we must return null.
        if (TP.notEmpty(paths)) {
            return null;
        }

        return pathObj;
    };

    matchers = TP.ac();

    //  Tokenize the value that we're using to try to get the best matcher to
    //  use for this particular search.
    info = this.tokenizeForMatcherComputation(aValue);
    tokenizedFragment = info.at('fragment');

    topLevelContexts = TP.ifInvalid(topLevelObjects, TP.ac(TP.global));

    //  Switch based on the context that was computed in the tokenization
    //  method.
    switch (info.at('context')) {
        case 'KEYWORD':
        case 'JS':
            resolutionChunks = info.at('resolutionChunks');

            //  Iterate over each top level context that was supplied (defaulted
            //  to a single object - TP.global - if none were supplied) and try
            //  to resolve to an object based on the resolution chunks that were
            //  computed. Stop at the first object that can be resolved
            //  properly.
            for (i = 0; i < topLevelContexts.getSize(); i++) {

                resolvedObj = resolveTopLevelObjectReference(
                                            topLevelContexts.at(i),
                                            resolutionChunks);
                if (TP.isValid(resolvedObj)) {
                    break;
                }
            }

            tokenizedFragment = TP.ifInvalid(tokenizedFragment, '');

            //  If we couldn't get a resolved object and there were no
            //  further resolution chunks found after the original tokenized
            //  fragment, then we just use a matcher that uses TP.global as the
            //  resolved object and a special keyed source matcher built to
            //  resolve objects at the JS global scope. Additionally, since
            //  we're at the global context, we also add the shared JavaScript
            //  keywords matcher if there's only one tokenized fragment.
            if (TP.notValid(resolvedObj)) {
                newMatcher =
                    TP.xctrls.Searcher.constructMatcherForGlobalJSContexts();
                newMatcher.set('input', tokenizedFragment);
                matchers.push(newMatcher);

                if (resolutionChunks.getSize() === 1) {
                    matchers.push(this.get('$keywordsMatcher').
                                    set('input', aValue));
                }
            } else {

                //  Otherwise, just use a regular keyed source matcher against
                //  the resolved object.
                matchers.push(
                    TP.xctrls.KeyedSourceMatcher.construct(
                                        'JS_CONTEXT', resolvedObj).
                        set('input', tokenizedFragment));
            }

            break;

        case 'TSH':

            matchers.push(this.get('$tshCommandsMatcher').set('input', aValue));
            break;

        case 'CFG':

            matchers.push(this.get('$cfgMatcher').set('input', aValue));
            break;

        case 'URI':

            matchers.push(this.get('$uriMatcher').set('input', aValue));
            break;

        default:
            break;
    }

    return matchers;
});

//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Inst.defineMethod('searchUsing',
function(aValue) {

    /**
     * @method searchUsing
     * @summary Searches the various search spaces of the receiver's configured
     *     matchers for the supplied search term.
     * @param {String} aValue The search term value to search for.
     * @returns {Object[]} An Array of search result POJOs that contain one or
     *     more of the following slots:
     *          matcherName {String}    The name of the matcher that produced
     *                                  this match result.
     *          input       {String}    The input that the matcher used to
     *                                  produce the match result.
     *          text        {String}    The raw text of the match result.
     *          score       {Number}    The score, between 0 and 1.0, that was
     *                                  assigned to the match result. Lower
     *                                  scores indicate 'better' matches (i.e.
     *                                  more exact to the search term).
     *          displayText {String}    A 'marked up' version of the match
     *                                  result, using XHTML markup
     *                                  '<span class="match_result">' to
     *                                  indicate the portions of match result
     *                                  that matched portions of the search
     *                                  term.
     */

    var matchers,
        defaultMatcher,

        results;

    //  If we're using a dynamically computed matcher set, then we update that
    //  every time we want to perform a search.
    if (this.get('dynamicMatchers')) {
        this.updateMatcherListUsing(aValue);
    } else {
        //  Iterate over the matcher list and set their value.
        this.get('matchers').forEach(
            function(aMatcher) {
                aMatcher.set('input', aValue);
            });
    }

    //  NB: We do this here because the updateMatcherListUsing call probably
    //  changed this list.
    matchers = this.get('matchers');

    //  If there are no matchers, either computed dynamically because we're
    //  using a dynamically computed matcher set or because the user didn't
    //  configure a static matcher, then see if we have a default matcher
    //  configured. If so, use it.
    if (TP.isEmpty(matchers)) {
        defaultMatcher = this.get('defaultMatcher');
        if (TP.isValid(defaultMatcher)) {
            defaultMatcher.set('input', aValue);
            matchers = TP.ac(defaultMatcher);
        }
    }

    //  If, after all of that, we've got matchers then use them.
    if (TP.notEmpty(matchers)) {
        results = this.computeResultsFrom(aValue, matchers);
    }

    return results;
});

//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Inst.defineMethod('tokenizeForMatcherComputation',
function(aValue) {

    /**
     * @method tokenizeForMatcherComputation
     * @summary Tokenizes the supplied value and returns a hash containing
     *     information that can be used to compute the set of matchers
     *     appropriate for searching objects that use that notation to be
     *     accessed.
     * @param {String} aValue The search term value to tokenize for use in
     *     determining the appropriate set of matchers.
     * @returns {TP.core.Hash} The hash of information about the supplied search
     *     term after it has been tokenized and analyzed.
     */

    var tokens,

        context,
        fragment,
        resolutionChunks,
        index,

        captureFragment,

        len,
        i,

        token,
        shouldExit,
        noMatches,

        isWhitespace;

    //  Invoke the tokenizer to parse JS and TSH tokens (TSH ones mostly to get
    //  the URI parsing).
    tokens = TP.$condenseJS(
                    aValue, false, false,
                    //  All of the JS operators *and* the TSH operators
                    TP.tsh.script.$tshAndJSOperators,
                    true, true, true);

    //  Reverse the tokens to start from the back
    tokens.reverse();

    context = 'JS';
    fragment = null;
    resolutionChunks = TP.ac();
    index = TP.NOT_FOUND;

    captureFragment = true;
    shouldExit = false;
    noMatches = false;

    isWhitespace = function(aToken) {
        var tokenName;

        tokenName = aToken.name;

        /* eslint-disable no-extra-parens */
        return (tokenName === 'space' ||
                tokenName === 'tab' ||
                tokenName === 'newline');
        /* eslint-enable no-extra-parens */
    };

    //  Iterate over all of the tokens, many of them JavaScript constructs, but
    //  others that are TSH ones, like URIs.
    len = tokens.getSize();
    for (i = 0; i < len; i++) {
        token = tokens.at(i);

        switch (token.name) {

            case 'comment':

                noMatches = true;
                shouldExit = true;

                break;

            case 'uri':

                context = 'URI';

                resolutionChunks = null;
                fragment = token.value;
                index = token.from;

                shouldExit = true;

                break;

            case 'space':
            case 'tab':
            case 'newline':

                if (i === 0) {
                    noMatches = true;
                }

                shouldExit = true;

                break;

            case 'keyword':

                context = 'KEYWORD';

                if (tokens.at(i + 1) &&
                    isWhitespace(tokens.at(i + 1))) {
                    resolutionChunks = null;
                    fragment = token.value;
                    index = token.from;

                    shouldExit = true;
                } else {
                    fragment = token.value;
                    index = token.from;
                }

                break;

            case 'operator':

                switch (token.value) {

                    case '[':

                        if (tokens.at(i - 1).value === '\'') {
                            if (captureFragment === true) {
                                index = token.from + 2;
                            }

                            fragment = '';
                            captureFragment = false;
                        } else {
                            noMatches = true;
                            shouldExit = true;
                        }

                        break;

                    case '.':
                        if (captureFragment === true) {
                            index = token.from + 1;
                        }

                        captureFragment = false;

                        break;

                    case ':':

                        if (i === len - 1) {
                            context = 'TSH';

                            resolutionChunks = null;

                            index = 1;
                            shouldExit = true;
                        }

                        break;

                    case '/':

                        if (i === len - 1) {
                            context = 'CFG';

                            resolutionChunks = null;

                            index = 1;
                            shouldExit = true;
                        }

                        break;

                    default:

                        noMatches = true;
                        shouldExit = true;

                        break;
                }

                break;

            default:
                //  'substitution'
                //  'reserved'
                //  'identifier'
                //  'number'
                //  'string'
                //  'regexp'
                if (captureFragment) {
                    fragment = token.value;
                    index = token.from;
                } else {
                    resolutionChunks.unshift(token.value);
                }
                break;
        }

        //  If there are no matches, then set all of these to null, loop and try
        //  again.
        if (noMatches) {
            context = null;

            resolutionChunks = null;
            fragment = null;
            index = TP.NOT_FOUND;
        }

        if (shouldExit) {
            break;
        }
    }

    //  If we weren't able to compute any real resolution chunks, then just set
    //  the sole one to the fragment itself and use that.
    if (TP.isEmpty(resolutionChunks) && TP.notEmpty(fragment)) {
        resolutionChunks = TP.ac(fragment);
    }

    return TP.hc(
            'context', context,
            'fragment', fragment,
            'resolutionChunks', resolutionChunks,
            'index', index);
});

//  ------------------------------------------------------------------------

TP.xctrls.Searcher.Inst.defineMethod('updateMatcherListUsing',
function(aValue) {

    /**
     * @method updateMatcherListUsing
     * @summary Updates the current matcher list using the supplied search term.
     *     This is applicable when the receiver is configured to use a 'dynamic
     *     matcher set'.
     * @param {String} aValue The search term value to use to update the current
     *     matcher list.
     * @returns {TP.xctrls.Searcher} The receiver.
     */

    var topLevelObjects,
        matchers;

    //  The current set of global source objects that we'll use to update the
    //  set of matchers that we're using to search.

    //  TODO: We're currently skipping these objects... why?
    //  TIBET_CFG
    //  JS_COMMANDS
    //  TSH_HISTORY
    //  TSH_COMMANDS
    //  TIBET_URIS

    topLevelObjects = TP.ac(
                        TP.global,
                        TP,
                        APP,
                        CSS,
                        TP.shell.TSH.getDefaultInstance().getExecutionInstance()
                    );

    //  Compute the matchers to use using a variety of techniques, including
    //  parsing the supplied value.
    matchers = this.computeMatchersFrom(aValue, topLevelObjects);

    this.set('matchers', matchers);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
