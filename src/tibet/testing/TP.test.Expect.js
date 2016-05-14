//  ========================================================================
//  TP.test.Expect
//  ========================================================================

/**
 * @type {TP.test.Expect}
 * @summary A type that can a 'chain' of test expectation methods.
 * @summary This type works by operating a 'method chain'. Each member of
 *     the chain is responsible for executing a piece of logic and then setting
 *     the result of the chain. This result is a Boolean. If any one of the
 *     members of a chain sets the result to false, that result 'sticks' no
 *     matter what further members of the chain set it to. When the chain
 *     finishes executing, this value is check and, if it is false, the entire
 *     chain will have been considered to have failed and the test case itself
 *     will be 'fail()'ed.
 *     Therefore, there are no individual assertions in any of these methods.
 *     They are to simply set the result of the chain to true or false.
 */

TP.lang.Object.defineSubtype('test.Expect');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.Expect.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var chainMethodNames,
        chainDict;

    chainMethodNames = TP.ac(
                        'a',            //  real implementation
                        'above',        //  real implementation
                        'an',           //  real implementation
                        'args',         //  real implementation
                        'at',           //  chain-only
                        'be',           //  chain-only
                        'been',         //  chain-only
                        'below',        //  real implementation
                        'closeTo',      //  real implementation
                        'contain',      //  real implementation
                        'deep',         //  real implementation
                        'empty',        //  real implementation
                        'equal',        //  real implementation
                        'equals',       //  real implementation
                        'eq',           //  real implementation
                        'exist',        //  real implementation
                        'false',        //  real implementation
                        'greaterThan',  //  real implementation
                        'gt',           //  real implementation
                        'identical',    //  real implementation
                        'include',      //  real implementation
                        'itself',       //  real implementation
                        'is',           //  chain-only
                        'has',          //  chain-only
                        'have',         //  chain-only
                        'key',          //  real implementation
                        'keys',         //  real implementation
                        'least',        //  real implementation
                        'lengthOf',     //  real implementation
                        'lessThan',     //  real implementation
                        'lt',           //  real implementation
                        'match',        //  real implementation
                        'members',      //  real implementation
                        'most',         //  real implementation
                        'not',          //  real implementation
                        'null',         //  real implementation
                        'ok',           //  real implementation
                        'of',           //  chain-only
                        'ownProperty',  //  real implementation
                        'property',     //  real implementation
                        'respondTo',    //  real implementation
                        'same',         //  chain-only
                        'satisfy',      //  real implementation
                        'size',         //  real implementation
                        'string',       //  real implementation
                        'that',         //  chain-only
                        'throw',        //  real implementation
                        'throws',       //  real implementation
                        'to',           //  chain-only
                        'true',         //  real implementation
                        'undefined',    //  real implementation
                        'valid',        //  real implementation
                        'with',         //  chain-only
                        'within'        //  real implementation
                        );

    //  Initialize a TP.core.Hash that will use the defined Array as all of its
    //  keys and put the Array at each one of those places in the Hash. This has
    //  the effect, when used below, of creating stub chains from each name
    //  listed to every other name.
    chainDict = TP.hc();
    chainDict.atAllPut(chainMethodNames, chainMethodNames);

    //  Set up the method chains.
    TP.test.Expect.setupMethodChains(chainDict);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The object under test
TP.test.Expect.Inst.defineAttribute('testObj');

//  The test case that the expecter is associated with.
TP.test.Expect.Inst.defineAttribute('testCase');

//  The failure String
TP.test.Expect.Inst.defineAttribute('faultStr');

//  The current result
TP.test.Expect.Inst.defineAttribute('result');

TP.test.Expect.Inst.defineAttribute('$chainDone');

//  Boolean flags
TP.test.Expect.Inst.defineAttribute('$negate');
TP.test.Expect.Inst.defineAttribute('$deep');
TP.test.Expect.Inst.defineAttribute('$contain');
TP.test.Expect.Inst.defineAttribute('$itself');

TP.test.Expect.Inst.defineAttribute('$lengthVal');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('init',
function(anObject, testCase) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Object} anObject The object to put under test.
     * @param {TP.test.Case} testCase The test case associated with this
     *     expectation. If the expectation fails, this is the test case that
     *     will fail.
     * @returns {TP.test.Expect} The new instance.
     */

    this.callNextMethod();

    this.reset(anObject);

    this.$set('testCase', testCase, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('reset',
function(obj) {

    /**
     * @method reset
     * @summary Reset the instance and use the supplied object as the new
     *     object under test.
     * @param {Object} anObject The object to put under test.
     * @returns {TP.test.Expect} The receiver.
     */

    this.$set('$chainDone', false, false);

    //  Boolean flags
    this.$set('$negate', false, false);
    this.$set('$deep', false, false);
    this.$set('$contain', false, false);
    this.$set('$itself', false, false);

    //  Other values used by assertions
    this.$set('$lengthVal', TP.NO_SIZE, false);

    //  Public objects
    this.$set('testObj', obj, false);
    this.$set('result', false, false);
    this.$set('faultStr', null, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('executeChain',
function() {

    /**
     * @method executeChain
     * @summary Executes the 'chain' of statements constituting the
     *     expectation. Some of these will be real instance methods on this
     *     object and some of them are just part of the 'chain' to make the
     *     expectation easier to read.
     * @returns {TP.test.Expect} The receiver.
     */

    var chain,
        len,
        i,

        chainName,
        testCase;

    chain = this.get('$$methodChainNames');

    //  NB: We go to length - 1 here, since we don't want to execute the last
    //  item in the chain (which should be the method that invoked us - we don't
    //  want to endlessly recurse).
    len = chain.getSize();
    for (i = 0; i < len - 1; i++) {

        chainName = chain.at(i);

        if (TP.canInvoke(this, chainName)) {
            try {
                this[chainName]();
            } catch (e) {
                if (TP.isValid(testCase = this.get('testCase'))) {
                    testCase.error(e);
                }

                //  Make sure to rethrow the Error so that handlers 'higher up'
                //  will also catch it.
                throw e;
            }
        }
    }

    this.set('$chainDone', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('isProcessingChain',
function() {

    /**
     * @method isProcessingChain
     * @summary Whether or not we're in the middle of processing the chain.
     * @returns {Boolean} Whether or not we're processing the chain.
     */

    return !this.get('$chainDone');
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('setResult',
function(aValue) {

    /**
     * @method setResult
     * @summary Sets the result of the expection to the supplied value. Note
     *     that if the expectation has been negated somewhere in its chain, this
     *     method is where the value inversion is performed.
     * @param {Boolean} aValue The Boolean result value.
     * @returns {TP.test.Expect} The receiver.
     */

    var testCase,

        faultStr;

    //  If the expectation has been negated somewhere along the way, invert the
    //  Boolean result.
    this.$set('result', TP.isTrue(this.get('$negate')) ? !aValue : aValue);

    //  If we're *not* processing the chain, it must mean we're done. If we have
    //  a valid test case and the value is false, then fail the test case.
    if (!this.isProcessingChain() &&
        TP.isValid(testCase = this.get('testCase'))) {

        //  Note here how we make sure to fetch the result since it might have
        //  been 'flipped' above.
        if (!this.get('result')) {

            faultStr = this.get('faultStr');
            testCase.fail(faultStr || '');
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS
//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('a',
function(aType) {

    var testVal,
        retVal;

    if (!TP.isType(aType) && !TP.isString(aType)) {
        return this.raise('TP.sig.InvalidType');
    }

    this.executeChain();

    testVal = this.get('testObj');
    retVal = TP.isKindOf(testVal, aType);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be a kind of ', TP.name(aType), '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be a kind of ', TP.name(aType), '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'a' is 'an' - note that this resets the TP.NAME and TP.DISPLAY
//  of the method
TP.test.Expect.Inst.defineMethod('an', TP.test.Expect.Inst.a);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('above',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isNumber(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = testVal > aValue;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length above ' :
                            ' to be above ',
                        aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length at most ' :
                            ' to be at most ',
                        aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'above' is 'gt' - note that this resets the TP.NAME and TP.DISPLAY
//  of the method
TP.test.Expect.Inst.defineMethod('gt', TP.test.Expect.Inst.above);

//  Alias for 'above' is 'greaterThan' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('greaterThan', TP.test.Expect.Inst.above);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('args',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isArgArray(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be an Arguments object.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be an Arguments object'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('below',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isNumber(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = testVal < aValue;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length below ' :
                            ' to be below ',
                        aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length at least ' :
                            ' to be at least ',
                        aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'below' is 'lt' - note that this resets the TP.NAME and TP.DISPLAY
//  of the method
TP.test.Expect.Inst.defineMethod('lt', TP.test.Expect.Inst.below);

//  Alias for 'below' is 'lessThan' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('lessThan', TP.test.Expect.Inst.below);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('closeTo',
function(expectedVal, delta) {

    var testVal,

        retVal;

    if (!TP.isNumber(expectedVal) || !TP.isNumber(delta)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = (testVal - expectedVal).abs() <= delta;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        ' to not be close to ', expectedVal,
                        ' +/- ', delta, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        ' to be close to ', expectedVal,
                        ' +/- ', delta, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('contain',
function(aValue) {

    var testVal,
        retVal;

    if (this.isProcessingChain()) {
        //  This flag is later used by the 'keys' assertions
        this.set('$contain', true);
    } else {

        if (TP.notValid(aValue)) {
            return this.raise('TP.sig.InvalidParameter');
        }

        this.executeChain();

        if (!TP.isCollection(testVal = this.get('testObj'))) {
            return this.raise('TP.sig.InvalidCollection');
        }

        retVal = TP.contains(this.get('testObj'), aValue);

        if (!retVal) {
            if (TP.isTrue(this.get('$negate'))) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not include ', aValue, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have include ', aValue, '.'));
            }
        }

        this.set('result', retVal);
    }

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'contain' is 'include' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('include', TP.test.Expect.Inst.contain);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('deep',
function() {

    //  This flag is later used by the 'equal', 'property' and 'members'
    //  assertions
    this.set('$deep', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('empty',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isEmpty(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be empty.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be empty.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('equal',
function(anObject) {

    var testVal,
        retVal;

    if (TP.notValid(anObject)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.executeChain();

    testVal = this.get('testObj');

    if (this.get('$deep')) {
        retVal = TP.equal(testVal, anObject);
    } else {
        retVal = TP.identical(testVal, anObject);
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not equal ', anObject, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to equal ', anObject, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'equal' is 'equals' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('equals', TP.test.Expect.Inst.equal);

//  Alias for 'equal' is 'eq' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('eq', TP.test.Expect.Inst.equal);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('exist',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isValid(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not exist.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to exist.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'exist' is 'valid' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('valid', TP.test.Expect.Inst.exist);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('false',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isFalse(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be true.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be false.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('identical',
function(anObject) {

    var testVal,
        retVal;

    if (TP.notValid(anObject)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.identical(testVal, anObject);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be identical to ', anObject, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be identical to ', anObject, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('itself',
function(aValue) {

    //  This flag is later used by the 'respondTo' assertion
    this.set('$itself', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('key',
function(aKey) {

    var testVal,
        testKeys,
        retVal;

    if (!TP.isString(aKey)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid String supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');

    testKeys = TP.keys(testVal);

    if (this.get('$contain')) {
        retVal = testKeys.contains(aKey);
    } else {
        //  There has to be an exact match here.
        retVal = testKeys.getSize() === 1 && testKeys.first() === aKey;
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not contain ', aKey, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to contain ', aKey, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('keys',
function(aKeyArray) {

    var testKeys,
        testVal,
        retVal;

    if (!TP.isArray(aKeyArray)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Array supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');

    testKeys = TP.keys(testVal);

    if (this.get('$contain')) {
        retVal = testKeys.containsAll(aKeyArray);
    } else {
        //  There has to be an exact match here.
        retVal = testKeys.getSize() === aKeyArray.getSize() &&
                    testKeys.containsAll(aKeyArray);
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not contain ', aKeyArray, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to contain ', aKeyArray, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('least',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isNumber(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = testVal >= aValue;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length below ' :
                            ' to be below ',
                        aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length at least ' :
                            ' to be at least ',
                        aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('lengthOf',
function(aValue) {

    var testVal,
        retVal;

    if (this.isProcessingChain()) {
        //  This value can be used later by 'above', 'least', 'below', 'most'
        //  and 'within'
        this.set('$lengthVal', TP.size(this.get('testObj')));
    } else {

        if (!TP.isNumber(aValue)) {
            return this.raise('TP.sig.InvalidParameter',
                                'Invalid Number supplied.');
        }

        this.executeChain();

        testVal = this.get('testObj');

        retVal = TP.size(testVal) === aValue;

        if (!retVal) {
            if (TP.isTrue(this.get('$negate'))) {
                this.set('faultStr',
                    TP.sc('Expected ', testVal,
                            ' to not have a length of ', aValue, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', testVal,
                            ' to have a length of ', aValue, '.'));
            }
        }

        this.set('result', retVal);
    }

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'lengthOf' is 'size' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('size', TP.test.Expect.Inst.lengthOf);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('match',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isRegExp(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid RegExp supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');
    retVal = aValue.test(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        ' to not match ', aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        ' to match ', aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('members',
function(setArray) {

    var testVal,
        comparisonTest,
        retVal;

    if (!TP.isArray(setArray)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Array supplied.');
    }

    this.executeChain();

    if (!TP.isArray(testVal = this.get('testObj'))) {
        return this.raise('TP.sig.InvalidArray');
    }

    if (this.get('$deep')) {
        comparisonTest = TP.EQUALITY;
    } else {
        comparisonTest = TP.IDENTITY;
    }

    if (this.get('$contain')) {
        retVal = TP.isEmpty(setArray.difference(testVal, comparisonTest));
    } else {
        retVal = testVal.containsAll(setArray);
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isTrue(this.get('$contain')) ?
                            ' to not be a superset of ' :
                            ' to not have the same members as ',
                        setArray, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isTrue(this.get('$contain')) ?
                            ' to be a superset of ' :
                            ' to have the same members as ',
                        setArray, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('most',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isNumber(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = testVal <= aValue;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length above ' :
                            ' to be above ',
                        aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length at most ' :
                            ' to be at most ',
                        aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('not',
function() {

    this.set('$negate', !this.get('$negate'));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('null',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isNull(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be null.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be null.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('ok',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isTruthy(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be truthy.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be truthy.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('ownProperty',
function(aName, aValue) {

    var testVal,
        retVal;

    //  aValue isn't required, but aName is

    if (!TP.isString(aName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isOwnProperty(testVal, aName);

    if (TP.isTrue(retVal) && TP.notEmpty(aValue)) {
        retVal = TP.val(testVal, aName) === aValue;
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            if (TP.isEmpty(aValue)) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not have an "own" property of ', aName, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not have an "own" property of ', aName,
                            ' with value ', aValue, '.'));
            }
        } else {
            if (TP.isEmpty(aValue)) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have an "own" property of ', aName, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have an "own" property of ', aName,
                            ' with value ', aValue, '.'));
            }
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('property',
function(aName, aValue) {

    var testVal,
        retVal;

    //  aValue isn't required, but aName is

    if (!TP.isString(aName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isProperty(testVal, aName);

    if (TP.isTrue(retVal) && TP.notEmpty(aValue)) {
        retVal = TP.val(testVal, aName) === aValue;
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            if (TP.isEmpty(aValue)) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not have a property of ', aName, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not have a property of ', aName,
                            ' with value ', aValue, '.'));
            }
        } else {
            if (TP.isEmpty(aValue)) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have a property of ', aName, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have a property of ', aName,
                            ' with value ', aValue, '.'));
            }
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('respondTo',
function(methodName) {

    var testVal,
        track,
        retVal;

    if (!TP.isString(methodName)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid method name supplied.');
    }

    this.executeChain();

    if (TP.notValid(testVal = this.get('testObj'))) {
        return this.raise('TP.sig.InvalidObject');
    }

    if (TP.isType(testVal)) {
        if (this.get('$itself')) {
            track = TP.TYPE_LOCAL_TRACK;
        } else {
            track = TP.TYPE_TRACK;
        }
    } else {
        if (this.get('$itself')) {
            track = TP.LOCAL_TRACK;
        } else {
            track = TP.INST_TRACK;
        }
    }

    retVal = TP.isMethod(testVal.getMethod(methodName, track));

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not respond to ', methodName, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to respond to ', methodName, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('satisfy',
function(aFunction) {

    var testVal,
        retVal;

    if (!TP.isFunction(aFunction)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Function supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isTrue(aFunction(testVal));

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not satisfy ', TP.dump(aFunction), '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to satisfy ', TP.dump(aFunction), '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('string',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isString(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid String supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.str(this.get('testObj')).contains(aValue);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not contain ', aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to contain ', aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('throw',
function(errorConstructor, errMsg, comment) {

    var expectedErrMsg,
        TheConstructor,

        testObj,

        desiredError,
        name,
        thrownError,

        retVal,

        faultStr;

    expectedErrMsg = errMsg;
    TheConstructor = errorConstructor;

    desiredError = null;
    name = null;
    thrownError = null;

    if (arguments.length === 0) {
        expectedErrMsg = null;
        TheConstructor = null;
    } else if (TP.isRegExp(TheConstructor) || TP.isString(TheConstructor)) {
        expectedErrMsg = TheConstructor;
        TheConstructor = null;
    } else if (TP.isError(TheConstructor)) {
        desiredError = TheConstructor;
        expectedErrMsg = null;
        TheConstructor = null;
    } else if (TP.isNativeType(TheConstructor)) {
        name = TP.name(TheConstructor.prototype) || TP.name(TheConstructor);
        if (name === 'Error' && TheConstructor !== Error) {
            name = TP.name(new TheConstructor());
        }
    } else {
        TheConstructor = null;
    }

    this.executeChain();

    testObj = this.get('testObj');

    retVal = false;

    try {
        testObj();
    } catch (err) {
        if (TP.isValid(desiredError)) {
            retVal = err === desiredError;
            if (!retVal) {
                faultStr = TP.sc('Expected ', TP.id(testObj),
                                    ' to throw ',
                                    TP.dump(desiredError),
                                    ' instead of ',
                                    TP.dump(err));
            }
        } else if (TP.isValid(TheConstructor)) {
            retVal = err instanceof TheConstructor;
            if (!retVal) {
                faultStr = TP.sc('Expected ', TP.id(testObj),
                                    ' to throw ',
                                    name,
                                    ' instead of ',
                                    TP.dump(err));
            }
        } else if (!TP.isEmpty(err.message)) {
            if (TP.isRegExp(expectedErrMsg)) {
                retVal = expectedErrMsg.test(err.message);
            } else if (TP.isString(expectedErrMsg)) {
                retVal = err.message.contains(expectedErrMsg);
            }

            if (!retVal) {
                faultStr = TP.sc('Expected ', TP.id(testObj),
                                    ' to throw error matching ',
                                    TP.dump(expectedErrMsg),
                                    ' but got ',
                                    err.message);
            }
        }

        thrownError = err;
    }

    if (!retVal && TP.isEmpty(faultStr)) {
        /* eslint-disable no-nested-ternary */
        faultStr = TP.sc(
                    'Expected ', TP.id(testObj),
                    ' to throw ',
                    TP.notEmpty(name) ? name :
                        TP.isValid(desiredError) ? TP.dump(desiredError) :
                        'an error',
                    ' instead of ',
                    TP.dump(thrownError));
        /* eslint-enable no-nested-ternary */
    }

    this.set('result', retVal);
    this.set('faultStr', faultStr);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'throw' is 'throws' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('throws', TP.test.Expect.Inst.throw);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('true',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isTrue(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be false.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be true.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('undefined',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = !TP.isDefined(this.get('testObj'));

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be undefined.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be undefined.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('within',
function(start, finish) {

    var testVal,
        retVal;

    if (!TP.isNumber(start) || !TP.isNumber(finish)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    /* eslint-disable no-extra-parens */
    retVal = (testVal >= start && testVal <= finish);
    /* eslint-enable no-extra-parens */

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to not have a length within ' :
                            ' to not be within ',
                        start, '..', finish, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length within ' :
                            ' to be within ',
                        start, '..', finish, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
