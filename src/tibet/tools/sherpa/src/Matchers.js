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

                var aLower,
                    bLower;

                if (itemA.score === itemB.score) {

                    aLower = itemA.original.toLowerCase();
                    bLower = itemB.original.toLowerCase();

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
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Matcher.Inst.defineMethod('match',
function(searchTerm) {

    /**
     * @method match
     */

    return TP.override();
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

TP.core.Matcher.Inst.defineMethod('generateMatchSet',
function(rawData, searchTerm, extract) {

    /**
     * @method generateMatchSet
     */

    var matches,
        options;

    /* eslint-disable no-undef */

    options = {pre : '<span class="match_result">',
                post : '</span>',
                caseSensitive : true,
                extract: extract};

    matches = TP.extern.fuzzyLib.filter(searchTerm, rawData, options);

    /* eslint-enable no-undef */

    return matches;
});

//  ========================================================================
//  TP.core.CSSPropertyMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('core.CSSPropertyMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSPropertyMatcher.Inst.defineMethod('match',
function(searchTerm) {

    /**
     * @method match
     */

    var dataSet,
        matches;

    dataSet = TP.CSS_ALL_PROPERTIES;

    matches = this.generateMatchSet(dataSet, searchTerm);
    matches.forEach(
            function(aMatch) {
                aMatch.cssClass = 'match_css_prop';
            });

    return matches;
});

//  ========================================================================
//  TP.core.ListMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('core.ListMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.ListMatcher.Inst.defineAttribute('$dataSet');
TP.core.ListMatcher.Inst.defineAttribute('$cssClass');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ListMatcher.Inst.defineMethod('init',
function(dataSet, cssClass) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Object} dataSet
     * @param {String} cssClass
     * @returns {TP.core.KeyedSourceMatcher} The receiver.
     */

    this.callNextMethod();

    this.set('$dataSet', dataSet);
    this.set('$cssClass', cssClass);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ListMatcher.Inst.defineMethod('match',
function(searchTerm) {

    /**
     * @method match
     */

    var dataSet,
        cssClass,

        matches;

    dataSet = this.get('$dataSet');

    cssClass = TP.ifInvalid(this.get('$cssClass'), 'match_key_source');

    if (TP.isEmpty(searchTerm)) {
        matches = [];
        dataSet.forEach(
                function(anItem) {
                    matches.push(
                        {
                            cssClass: cssClass,
                            string: anItem,
                            original: anItem
                        }
                    );
                });
    } else {
        matches = this.generateMatchSet(dataSet, searchTerm);
        matches.forEach(
                function(aMatch) {
                    aMatch.cssClass = cssClass;
                });
    }

    return matches;
});

//  ========================================================================
//  TP.core.CustomTypeMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('core.CustomTypeMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CustomTypeMatcher.Inst.defineMethod('match',
function(searchTerm) {

    /**
     * @method match
     */

    var dataSet,
        matches;

    dataSet = TP.sys.getMetadata('types').getKeys();

    matches = this.generateMatchSet(dataSet, searchTerm);
    matches.forEach(
            function(aMatch) {
                aMatch.cssClass = 'match_custom_type';
            });

    return matches;
});

//  ========================================================================
//  TP.core.KeyedSourceMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('core.KeyedSourceMatcher');

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
function(keySource) {

    /**
     * @method init
     * @summary Initialize the instance.
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
function(searchTerm) {

    /**
     * @method match
     */

    var dataSet,
        matches,

        keySourceName;

    dataSet = this.get('$dataSet');

    keySourceName = this.get('keySourceName');

    if (TP.isEmpty(searchTerm)) {
        matches = [];
        dataSet.forEach(
                function(aKey) {
                    matches.push(
                        {
                            cssClass: 'match_key_source ' + keySourceName,
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
                    aMatch.cssClass = 'match_key_source ' + keySourceName;
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
    if (TP.canInvoke(keySource, 'getType')) {
        if (TP.isNativeType(keySource.getType())) {
            wantsProtoChain = true;
        } else {
            wantsProtoChain = false;
        }
    } else {
        //  All TIBET objects respond to 'getType', so if it can't, it's a
        //  native object that we definitely want all prototype properties of.
        wantsProtoChain = true;
    }

    dataSet = TP.keys(this.get('keySource'), true, wantsProtoChain);

    dataSet.sort();

    this.set('$dataSet', dataSet);

    return this;
});

//  ========================================================================
//  TP.core.URIMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('core.URIMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.URIMatcher.Inst.defineAttribute('keySource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.URIMatcher.Inst.defineMethod('match',
function(searchTerm) {

    /**
     * @method match
     */

    var dataSet,
        matches;

    dataSet = TP.core.URI.Type.get('instances').getKeys();

    matches = this.generateMatchSet(dataSet, searchTerm);
    matches.forEach(
            function(aMatch) {
                aMatch.cssClass = 'match_uri';
            });

    return matches;
});

//  ========================================================================
//  TP.core.MethodMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('core.MethodMatcher');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.MethodMatcher.Inst.defineAttribute('$dataSet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.MethodMatcher.Inst.defineMethod('match',
function(searchTerm) {

    /**
     * @method match
     */

    var dataSet,
        matches;

    dataSet = this.get('$dataSet');

    matches = this.generateMatchSet(dataSet, searchTerm);
    matches.forEach(
            function(aMatch) {
                var originalData,
                    ownerName;

                originalData = aMatch.original;
                ownerName = originalData.at(1).slice(
                                0, originalData.at(1).indexOf('_'));

                aMatch.cssClass = 'match_method_name';
                aMatch.suffix = ' (' + ownerName + ')';
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
                var methodName;

                methodName = aKey.slice(aKey.lastIndexOf('_') + 1);
                dataSet.push(TP.ac(methodName, aKey));
            });

    this.set('$dataSet', dataSet);

    return this;
});

//  ========================================================================
//  TP.core.NamespaceMatcher
//  ========================================================================

TP.core.Matcher.defineSubtype('core.NamespaceMatcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.NamespaceMatcher.Inst.defineMethod('match',
function(searchTerm) {

    /**
     * @method match
     */

    return TP.ac();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
