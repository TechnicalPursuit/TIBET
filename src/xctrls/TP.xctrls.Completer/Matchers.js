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
 * @type {TP.core.Matcher}
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Matcher');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.Matcher.Type.defineConstant('MATCH_RESULT_SORT',
function(itemA, itemB) {

    var itemAEntry,
        itemBEntry,

        aLower,
        bLower;

    if (itemA.score === itemB.score) {

        //  Method matcher returns Arrays - pluck out the method
        //  name

        if (TP.isArray(itemAEntry = itemA.original)) {
            itemAEntry = itemAEntry.at(2);
        }

        if (TP.isArray(itemBEntry = itemB.original)) {
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

TP.core.Matcher.Inst.defineAttribute('input');
TP.core.Matcher.Inst.defineAttribute('$matcherName');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Matcher.Inst.defineMethod('init',
function(matcherName, dataSet) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} matcherName
     * @param {Object} dataSet
     * @returns {TP.core.Matcher} The receiver.
     */

    this.callNextMethod();

    this.set('$matcherName', matcherName);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Matcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Matcher.Inst.defineMethod('generateMatchSet',
function(rawData, searchTerm, extract) {

    /**
     * @method generateMatchSet
     */

    var matches,
        options,

        fuse;

    /* eslint-disable no-undef */

    options = {
        caseSensitive: true,
        includeMatches: true,
        includeScore: true,
        threshold: 0.6,
        location: 0,
        distance: 32,
        maxPatternLength: 32,
        minMatchCharLength: 1
    };

    fuse = new TP.extern.Fuse(rawData, options); // "list" is the item array
    matches = fuse.search(searchTerm);

    /* eslint-enable no-undef */

    return matches;
});

//  ------------------------------------------------------------------------

TP.core.Matcher.Inst.defineMethod('prepareForMatch',
function() {

    /**
     * @method prepareForMatch
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Matcher.Inst.defineMethod('prepareForResultProcessing',
function() {

    /**
     * @method prepareForResultProcessing
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Matcher.Inst.defineMethod('postProcessCompletion',
function() {

    /**
     * @method postProcessResult
     */

    return this;
});

//  ========================================================================
//  TP.core.CSSPropertyMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('CSSPropertyMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSPropertyMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     */

    var dataSet,
        matcherName,
        searchTerm,

        matches;

    dataSet = TP.CSS_ALL_PROPERTIES;
    matcherName = this.get('$matcherName');
    searchTerm = TP.ifInvalid(this.get('input'), '');

    matches = this.generateMatchSet(dataSet, searchTerm);
    matches.forEach(
            function(aMatch) {
                aMatch.matcherName = matcherName;
            });

    return matches;
});

//  ========================================================================
//  TP.core.ListMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('ListMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.ListMatcher.Inst.defineAttribute('$dataSet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ListMatcher.Inst.defineMethod('init',
function(matcherName, dataSet) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} matcherName
     * @param {Object} dataSet
     * @returns {TP.core.ListMatcher} The receiver.
     */

    this.callNextMethod();

    this.set('$dataSet', dataSet);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ListMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     */

    var dataSet,
        matcherName,
        searchTerm,

        matches;

    dataSet = this.get('$dataSet');
    matcherName = this.get('$matcherName');
    searchTerm = TP.ifInvalid(this.get('input'), '');

    if (TP.isEmpty(searchTerm)) {
        matches = TP.ac();
        dataSet.forEach(
                function(anItem) {
                    matches.push(
                        {
                            matcherName: matcherName,
                            string: anItem,
                            original: anItem
                        }
                    );
                });
    } else {
        matches = this.generateMatchSet(dataSet, searchTerm);
        matches.forEach(
                function(aMatch) {
                    aMatch.matcherName = matcherName;
                });
    }

    return matches;
});

//  ------------------------------------------------------------------------

TP.core.ListMatcher.Inst.defineMethod('setDataSet',
function(dataSet) {

    this.set('$dataSet', dataSet);

    return this;
});

//  ========================================================================
//  TP.core.CustomTypeMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('CustomTypeMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CustomTypeMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     */

    var dataSet,
        matcherName,
        searchTerm,

        matches;

    dataSet = TP.sys.getMetadata('types').getKeys();
    matcherName = this.get('$matcherName');
    searchTerm = TP.ifInvalid(this.get('input'), '');

    matches = this.generateMatchSet(dataSet, searchTerm);
    matches.forEach(
            function(aMatch) {
                aMatch.matcherName = matcherName;
            });

    return matches;
});

//  ========================================================================
//  TP.core.KeyedSourceMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('KeyedSourceMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.KeyedSourceMatcher.Inst.defineAttribute('$dataSet');

TP.core.KeyedSourceMatcher.Inst.defineAttribute('keySource');
TP.core.KeyedSourceMatcher.Inst.defineAttribute('keySourceName');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.KeyedSourceMatcher.Inst.defineMethod('init',
function(matcherName, keySource) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} matcherName
     * @param {Object} keySource
     * @returns {TP.core.KeyedSourceMatcher} The receiver.
     */

    this.callNextMethod();

    this.set('keySource', keySource);
    this.set('keySourceName', TP.name(keySource));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.KeyedSourceMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
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
                            matcherName: matcherName,
                            string: aKey,
                            prefix: keySourceName + '.',
                            original: aKey
                        }
                    );
                });
    } else {
        matches = this.generateMatchSet(dataSet, searchTerm);
        matches.forEach(
                function(aMatch) {
                    aMatch.matcherName = matcherName;
                    aMatch.prefix = keySourceName + '.';
                });
    }

    return matches;
});

//  ------------------------------------------------------------------------

TP.core.KeyedSourceMatcher.Inst.defineMethod('prepareForMatch',
function() {

    /**
     * @method prepareForMatch
     */

    var keySource,
        dataSet,

        wantsProtoChain;

    keySource = this.get('keySource');

    if (TP.isNativeType(keySource)) {
        dataSet = TP.interface(keySource.prototype, TP.SLOT_FILTERS.attributes);
    } else {
        if (TP.canInvoke(keySource, 'getType')) {
            if (TP.isNativeType(keySource.getType())) {
                wantsProtoChain = true;
            } else {
                wantsProtoChain = false;
            }
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

TP.core.KeyedSourceMatcher.Inst.defineMethod('setDataSet',
function(dataSet) {

    this.set('$dataSet', dataSet);

    return this;
});

//  ========================================================================
//  TP.core.URIMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('URIMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.URIMatcher.Inst.defineAttribute('keySource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.URIMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     */

    var dataSet,
        matcherName,
        searchTerm,

        matches;

    dataSet = TP.core.URI.Type.get('instances').getKeys();
    matcherName = this.get('$matcherName');
    searchTerm = TP.ifInvalid(this.get('input'), '');

    matches = this.generateMatchSet(dataSet, searchTerm);
    matches.forEach(
            function(aMatch) {
                aMatch.matcherName = matcherName;
            });

    return matches;
});

//  ========================================================================
//  TP.core.MethodMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('MethodMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.MethodMatcher.Inst.defineAttribute('$dataSet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.MethodMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     */

    var dataSet,
        matcherName,
        searchTerm,

        matches;

    dataSet = this.get('$dataSet');
    matcherName = this.get('$matcherName');
    searchTerm = TP.ifInvalid(this.get('input'), '');

    matches = this.generateMatchSet(
                        dataSet,
                        searchTerm,
                        function(original) {
                            return original.at(2);
                        });

    matches.forEach(
            function(aMatch) {
                aMatch.matcherName = matcherName;
                aMatch.suffix = ' (' + aMatch.original.at(0) + ')';
            });

    return matches;
});

//  ------------------------------------------------------------------------

TP.core.MethodMatcher.Inst.defineMethod('prepareForMatch',
function() {

    /**
     * @method prepareForMatch
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
//  TP.core.NamespaceMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('NamespaceMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.NamespaceMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     */

    return TP.ac();
});

//  ========================================================================
//  TP.core.TSHHistoryMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('TSHHistoryMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.TSHHistoryMatcher.Inst.defineAttribute('$dataSet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TSHHistoryMatcher.Inst.defineMethod('match',
function() {

    /**
     * @method match
     */

    var dataSet,
        matcherName,
        searchTerm,

        matches;

    dataSet = this.get('$dataSet');
    matcherName = this.get('$matcherName');
    searchTerm = TP.ifInvalid(this.get('input'), '');

    matches = this.generateMatchSet(
                        dataSet,
                        searchTerm);

    matches.forEach(
            function(aMatch) {
                aMatch.matcherName = matcherName;
            });

    return matches;
});

//  ------------------------------------------------------------------------

TP.core.TSHHistoryMatcher.Inst.defineMethod('prepareForMatch',
function() {

    /**
     * @method prepareForMatch
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
