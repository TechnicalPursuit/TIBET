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
 * @type {TP.xctrls.Matcher}
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xctrls.Matcher');

TP.xctrls.Matcher.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Type.defineConstant('MATCH_RESULT_SORT',
function(itemA, itemB) {

    var itemAEntry,
        itemBEntry,

        aLower,
        bLower;

    if (itemA.score === itemB.score) {

        //  Method matcher returns Arrays - pluck out the method
        //  name

        if (TP.isArray(itemAEntry = itemA.string)) {
            itemAEntry = itemAEntry.at(2);
        }

        if (TP.isArray(itemBEntry = itemB.string)) {
            itemBEntry = itemBEntry.at(2);
        }

        aLower = itemAEntry.toLowerCase();
        bLower = itemBEntry.toLowerCase();

        if (aLower < bLower) {
            return -1;
        } else if (aLower > bLower) {
            return 1;
        }

        return 0;
    }

    return itemB.score - itemA.score;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Inst.defineAttribute('input');
TP.xctrls.Matcher.Inst.defineAttribute('$matcherName');

TP.xctrls.Matcher.Inst.defineAttribute('caseSensitive');
TP.xctrls.Matcher.Inst.defineAttribute('threshold');
TP.xctrls.Matcher.Inst.defineAttribute('location');
TP.xctrls.Matcher.Inst.defineAttribute('distance');
TP.xctrls.Matcher.Inst.defineAttribute('maxPatternLength');

TP.xctrls.Matcher.Inst.defineAttribute('useSearchTermLengthForMatches');
TP.xctrls.Matcher.Inst.defineAttribute('minMatchCharLength');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.Fuse');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Inst.defineMethod('init',
function(matcherName) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} matcherName The name of this matcher that will be
     *     associated with the search results produced by it
     * @returns {TP.xctrls.Matcher} The receiver.
     */

    this.callNextMethod();

    this.set('$matcherName', matcherName);

    this.set('caseSensitive', false);
    this.set('threshold', 0.1);
    this.set('location', 0);
    this.set('distance', 1000);
    this.set('maxPatternLength', 32);

    //  If this is true, then the search term length will be used for match
    //  length, not the 'minMatchCharLength' attribute.
    this.set('useSearchTermLengthForMatches', true);
    this.set('minMatchCharLength', 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Inst.defineMethod('getDataSet',
function() {

    /**
     * @method getDataSet
     * @summary Returns the data set that this matcher is operating on.
     * @returns {Object} The data set.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     * @summary Performs the match against the data set using the receiver's
     *     input against its data set.
     * @returns {Object[]} An Array of match result POJOS.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Inst.defineMethod('generateMatchSet',
function(rawData, searchTerm, keys) {

    /**
     * @method generateMatchSet
     * @summary Generates a match set against the raw data using the supplied
     *     search term.
     * @param {Object[]} rawData The raw data to use to generate the match set.
     *     This should be an Array of text-searchable objects, such as a String
     *     or a JavaScript structure where the optional 3rd parameter is a list
     *     of keys of that structure to be searched.
     * @param {String} searchTerm The search term to be used to search the raw
     *     data.
     * @param {String[]} [keys] If the rawData is not an Array of Strings, but
     *     an Array of JavaScript structures, these keys will be used to extract
     *     the data from that structure to search.
     * @returns {Object[]} An Array of match result POJOS.
     */

    var matches,
        options,

        fuse;

    /* eslint-disable no-undef */

    options = {
        caseSensitive: this.get('caseSensitive'),
        includeMatches: true,   //  hardcoded to true - we use this data
        includeScore: true,     //  hardcoded to true - we use this data
        threshold: this.get('threshold'),
        location: this.get('location'),
        distance: this.get('distance'),
        maxPatternLength: this.get('maxPatternLength'),
        minMatchCharLength: this.get('useSearchTermLengthForMatches') ?
                            searchTerm.getSize() :
                            this.get('minMatchCharLength'),
        keys: keys
    };

    fuse = new TP.extern.Fuse(rawData, options);
    matches = fuse.search(searchTerm);

    /* eslint-enable no-undef */

    return matches;
});

//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Inst.defineMethod('prepareForMatching',
function() {

    /**
     * @method prepareForMatching
     * @summary Prepares the receiver to begin the matching process.
     * @returns {TP.xctrls.Matcher} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Inst.defineMethod('prepareForResultProcessing',
function(matchResults) {

    /**
     * @method prepareForResultProcessing
     * @summary Prepares the receiver to begin processing results.
     * @param {Object[]} matchResults The results of performing the match.
     * @returns {TP.xctrls.Matcher} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Matcher.Inst.defineMethod('postProcessResult',
function() {

    /**
     * @method postProcessResult
     * @summary Post process an individual result.
     * @param {Object} matchResult An individual result of performing the match.
     */

    return this;
});

//  ========================================================================
//  TP.xctrls.ListMatcher
//  ========================================================================

TP.xctrls.Matcher.defineSubtype('ListMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.ListMatcher.Inst.defineAttribute('$dataSet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.ListMatcher.Inst.defineMethod('init',
function(matcherName, dataSet) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} matcherName The name of this matcher that will be
     *     associated with the search results produced by it
     * @param {Object} dataSet The data set for this matcher to operate on.
     * @returns {TP.xctrls.ListMatcher} The receiver.
     */

    this.callNextMethod();

    this.set('dataSet', dataSet);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.ListMatcher.Inst.defineMethod('getDataSet',
function() {

    /**
     * @method getDataSet
     * @summary Returns the data set that this matcher is operating on.
     * @returns {Object} The data set.
     */

    return this.get('$dataSet');
});

//  ------------------------------------------------------------------------

TP.xctrls.ListMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     * @summary Performs the match against the data set using the receiver's
     *     input against its data set.
     * @returns {Object[]} An Array of match result POJOS. For this type, these
     *     result records have the following fields:
     *          input       {String}    The input string that was used to
     *                                  search.
     *          matcherName {String}    The name of the matcher that produced
     *                                  this result.
     *          string      {String}    The value of the original datum or the
     *                                  result datum.
     */

    var dataSet,
        matcherName,
        searchTerm,

        matches;

    dataSet = this.get('dataSet');
    matcherName = this.get('$matcherName');
    searchTerm = TP.ifInvalid(this.get('input'), '');

    if (TP.isEmpty(searchTerm)) {
        matches = TP.ac();
        dataSet.forEach(
                function(anItem) {
                    matches.push(
                        {
                            input: searchTerm,
                            matcherName: matcherName,
                            string: anItem
                        }
                    );
                });
    } else {
        matches = this.generateMatchSet(dataSet, searchTerm);

        //  Due to a bug in Fuse.js, we will get results with no 'matches'
        //  Arrays. Filter them out here.
        matches = matches.select(
                    function(aMatch) {
                        return aMatch.matches.length > 0;
                    });

        matches.forEach(
                function(aMatch) {
                    aMatch.input = searchTerm;
                    aMatch.matcherName = matcherName;
                    aMatch.string = aMatch.matches[0].value;
                });
    }

    return matches;
});

//  ------------------------------------------------------------------------

TP.xctrls.ListMatcher.Inst.defineMethod('setDataSet',
function(dataSet) {

    /**
     * @method setDataSet
     * @summary Set the data set that this matcher is operating on to the
     *     supplied parameter.
     * @param {Object} dataSet The data set for this matcher to operate on.
     * @returns {TP.xctrls.ListMatcher} The receiver.
     */

    this.set('$dataSet', dataSet);

    return this;
});

//  ========================================================================
//  TP.xctrls.KeyedSourceMatcher
//  ========================================================================

TP.xctrls.Matcher.defineSubtype('KeyedSourceMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.KeyedSourceMatcher.Inst.defineAttribute('$dataSet');

TP.xctrls.KeyedSourceMatcher.Inst.defineAttribute('keySource');
TP.xctrls.KeyedSourceMatcher.Inst.defineAttribute('keySourceName');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.KeyedSourceMatcher.Inst.defineMethod('init',
function(matcherName, keySource) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} matcherName The name of this matcher that will be
     *     associated with the search results produced by it
     * @param {Object} keySource The source to derive keys from.
     * @returns {TP.xctrls.KeyedSourceMatcher} The receiver.
     */

    this.callNextMethod();

    this.set('keySource', keySource);
    this.set('keySourceName', TP.name(keySource));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.KeyedSourceMatcher.Inst.defineMethod('getDataSet',
function() {

    /**
     * @method getDataSet
     * @summary Returns the data set that this matcher is operating on.
     * @returns {Object} The data set.
     */

    return this.get('$dataSet');
});

//  ------------------------------------------------------------------------

TP.xctrls.KeyedSourceMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     * @summary Performs the match against the data set using the receiver's
     *     input against its data set.
     * @returns {Object[]} An Array of match result POJOS. For this type, these
     *     result records have the following fields:
     *          input       {String}    The input string that was used to
     *                                  search.
     *          matcherName {String}    The name of the matcher that produced
     *                                  this result.
     *          string      {String}    The value of the original datum or the
     *                                  result datum.
     */

    var dataSet,
        matcherName,
        searchTerm,

        matches,

        keySourceName;

    dataSet = this.get('$dataSet');
    matcherName = this.get('$matcherName');
    searchTerm = TP.ifInvalid(this.get('input'), '');

    keySourceName = this.get('keySourceName');

    if (TP.isEmpty(searchTerm)) {
        matches = TP.ac();
        dataSet.forEach(
                function(aKey) {
                    matches.push(
                        {
                            input: searchTerm,
                            matcherName: matcherName,
                            prefix: keySourceName + '.',
                            string: aKey
                        }
                    );
                });
    } else {
        matches = this.generateMatchSet(dataSet, searchTerm);

        //  Due to a bug in Fuse.js, we will get results with no 'matches'
        //  Arrays. Filter them out here.
        matches = matches.select(
                    function(aMatch) {
                        return aMatch.matches.length > 0;
                    });

        matches.forEach(
                function(aMatch) {
                    aMatch.input = searchTerm;
                    aMatch.matcherName = matcherName;
                    aMatch.prefix = keySourceName + '.';
                    aMatch.string = aMatch.matches[0].value;
                });
    }

    return matches;
});

//  ------------------------------------------------------------------------

TP.xctrls.KeyedSourceMatcher.Inst.defineMethod('prepareForMatching',
function() {

    /**
     * @method prepareForMatching
     * @summary Prepares the receiver to begin the matching process.
     * @returns {TP.xctrls.KeyedSourceMatcher} The receiver.
     */

    var keySource,
        dataSet,

        wantsProtoChain;

    keySource = this.get('keySource');

    if (TP.isNativeType(keySource)) {
        dataSet = TP.interface(keySource.prototype, TP.SLOT_FILTERS.attributes);
    } else {
        if (TP.canInvoke(keySource, 'getType')) {
            wantsProtoChain = TP.isNativeType(keySource.getType()) ||
                                keySource === TP ||
                                keySource === TP.sys ||
                                keySource === TP.boot ||
                                keySource === TP.global;
        } else {
            //  All TIBET objects respond to 'getType', so if it can't, it's a
            //  native object that we definitely want all prototype properties
            //  of.
            wantsProtoChain = true;
        }

        dataSet = TP.keys(this.get('keySource'), true, wantsProtoChain);
    }

    dataSet.sort();

    this.set('$dataSet', dataSet);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.KeyedSourceMatcher.Inst.defineMethod('setDataSet',
function(dataSet) {

    /**
     * @method setDataSet
     * @summary Set the data set that this matcher is operating on to the
     *     supplied parameter.
     * @param {Object} dataSet The data set for this matcher to operate on.
     * @returns {TP.xctrls.KeyedSourceMatcher} The receiver.
     */

    this.set('$dataSet', dataSet);

    return this;
});

//  ========================================================================
//  TP.xctrls.CSSPropertyMatcher
//  ========================================================================

TP.xctrls.ListMatcher.defineSubtype('CSSPropertyMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.CSSPropertyMatcher.Inst.defineMethod('getDataSet',
function() {

    /**
     * @method getDataSet
     * @summary Returns the data set that this matcher is operating on.
     * @returns {Object} The data set.
     */

    return TP.CSS_ALL_PROPERTIES;
});

//  ========================================================================
//  TP.xctrls.CustomTypeMatcher
//  ========================================================================

TP.xctrls.ListMatcher.defineSubtype('CustomTypeMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.CustomTypeMatcher.Inst.defineMethod('getDataSet',
function() {

    /**
     * @method getDataSet
     * @summary Returns the data set that this matcher is operating on.
     * @returns {Object} The data set.
     */

    return TP.sys.getMetadata('types').getKeys();
});

//  ========================================================================
//  TP.xctrls.URIMatcher
//  ========================================================================

TP.xctrls.ListMatcher.defineSubtype('URIMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.URIMatcher.Inst.defineAttribute('keySource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.URIMatcher.Inst.defineMethod('getDataSet',
function() {

    /**
     * @method getDataSet
     * @summary Returns the data set that this matcher is operating on.
     * @returns {Object} The data set.
     */

    return TP.xctrls.URI.Type.get('instances').getKeys();
});

//  ========================================================================
//  TP.xctrls.MethodMatcher
//  ========================================================================

TP.xctrls.ListMatcher.defineSubtype('MethodMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.MethodMatcher.Inst.defineAttribute('$dataSet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.MethodMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     * @summary Performs the match against the data set using the receiver's
     *     input against its data set.
     * @returns {Object[]} An Array of match result POJOS. For this type, these
     *     result records have the following fields:
     *          input       {String}    The input string that was used to
     *                                  search.
     *          matcherName {String}    The name of the matcher that produced
     *                                  this result.
     *          suffix      {String}
     */

    var matches;

    matches = this.callNextMethod();

    matches.forEach(
            function(aMatch) {
                aMatch.suffix = ' (' + aMatch.string.at(0) + ')';
            });

    return matches;
});

//  ------------------------------------------------------------------------

TP.xctrls.MethodMatcher.Inst.defineMethod('prepareForMatching',
function() {

    /**
     * @method prepareForMatching
     * @summary Prepares the receiver to begin the matching process.
     * @returns {TP.xctrls.MethodMatcher} The receiver.
     */

    var keys,
        dataSet;

    keys = TP.sys.getMetadata('methods').getKeys();

    dataSet = TP.ac();

    keys.forEach(
            function(aKey) {
                //  This pushes method data in as: [owner, track, name]
                dataSet.push(aKey.split('_'));
            });

    this.set('$dataSet', dataSet);

    return this;
});

//  ========================================================================
//  TP.xctrls.NamespaceMatcher
//  ========================================================================

TP.xctrls.ListMatcher.defineSubtype('NamespaceMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.NamespaceMatcher.Inst.defineMethod('getDataSet',
function() {

    /**
     * @method getDataSet
     * @summary Returns the data set that this matcher is operating on.
     * @returns {Object} The data set.
     */

    return TP.sys.getNamespaceNames();
});

//  ========================================================================
//  TP.xctrls.TSHHistoryMatcher
//  ========================================================================

TP.xctrls.ListMatcher.defineSubtype('TSHHistoryMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.TSHHistoryMatcher.Inst.defineAttribute('$dataSet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.TSHHistoryMatcher.Inst.defineMethod('prepareForMatching',
function() {

    /**
     * @method prepareForMatching
     * @summary Prepares the receiver to begin the matching process.
     * @returns {TP.xctrls.TSHHistoryMatcher} The receiver.
     */

    var dataSet;

    dataSet = TP.bySystemId('TSH').getHistory().collect(
                function(item) {
                    return item.at('cmd');
                });

    this.set('$dataSet', dataSet);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
