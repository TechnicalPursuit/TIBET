//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.test.SSN
//  ========================================================================

/**
 * @type {TP.test.SSN}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.SSN');

//  ------------------------------------------------------------------------

TP.test.SSN.Type.defineMethod('validate',
function(anObject) {

    var testRegExp,
        str;

    testRegExp = /^\d{3}[- ]?\d{2}[- ]?\d{4}$/;

    str = TP.str(anObject);

    return testRegExp.test(str);
});

//  ========================================================================
//  TP.test.SimpleTestType
//  ========================================================================

/**
 * @type {TP.test.SimpleTestType}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.SimpleTestType');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.SimpleTestType.Inst.defineAttribute(
        'lastName',
        {
            'valid': {
                'dataType': String
            }
        });

TP.test.SimpleTestType.Inst.defineAttribute(
        'firstName',
        {
            'valid': {
                'dataType': String
            }
        });

TP.test.SimpleTestType.Inst.defineAttribute(
        'age',
        {
            'valid': {
                'dataType': Number
            }
        });

TP.test.SimpleTestType.Inst.defineAttribute(
        'SSN',
        {
            'valid': {
                'dataType': 'TP.test.SSN'
            },
            'required': true
        });

//  ========================================================================
//  TP.test.SimpleTestTypeWithSetter
//  ========================================================================

TP.test.SimpleTestType.defineSubtype('test.SimpleTestTypeWithSetter');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.SimpleTestTypeWithSetter.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    var retVal;

    retVal = this.callNextMethod();

    this.checkFacets(attributeName);

    return retVal;
});

//  ========================================================================
//  Object-level Test Suite
//  ========================================================================

TP.lang.Object.Inst.describe('Object level validation',
function() {

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

    this.it('object-level direct validation', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleTestType.construct();
        testObj.set('lastName', 'Edney');
        testObj.set('firstName', 'Bill');
        testObj.set('age', 48);
        testObj.set('SSN', '555-55-5555');

        test.assert.isTrue(TP.validate(testObj, TP.test.SimpleTestType));

        testObj = TP.test.SimpleTestType.construct();
        testObj.set('lastName', 'Edney');
        testObj.set('firstName', 'Bill');
        testObj.set('age', 48);
        testObj.set('SSN', '555-55--555');

        test.assert.isFalse(TP.validate(testObj, TP.test.SimpleTestType));
    });

    //  ---

    this.it('object-level validation using facets - using manual facet setting', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleTestType.construct();
        testObj.set('lastName', 'Edney');
        testObj.set('firstName', 'Bill');
        testObj.set('age', 48);

        testObj.shouldSignalChange(true);

        testObj.set('SSN', '555-55-5555');

        test.assert.didSignal(testObj, 'SSNChange');
        test.assert.didSignal(testObj, 'TP.sig.ValueChange');

        testObj.setFacet('SSN', TP.REQUIRED, true);

        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'TP.sig.RequiredChange');
    });

    //  ---

    this.it('object-level validation using facets - individual aspect facet checking', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleTestType.construct();
        testObj.set('lastName', 'Edney');
        testObj.set('firstName', 'Bill');
        testObj.set('age', 48);
        testObj.set('SSN', '555-55--555');

        testObj.shouldSignalChange(true);

        testObj.checkFacets('SSN');

        test.assert.didSignal(testObj, 'SSNValidChange');
        test.assert.didSignal(testObj, 'TP.sig.ValidChange');

        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'TP.sig.RequiredChange');
    });

    //  ---

    this.it('object-level validation using facets - using instance-level setter', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleTestTypeWithSetter.construct();
        testObj.set('lastName', 'Edney');
        testObj.set('firstName', 'Bill');
        testObj.set('age', 48);

        testObj.shouldSignalChange(true);

        testObj.set('SSN', '555-55-5555');

        test.assert.didSignal(testObj, 'SSNChange');
        test.assert.didSignal(testObj, 'TP.sig.ValueChange');

        test.assert.didSignal(testObj, 'SSNValidChange');
        test.assert.didSignal(testObj, 'TP.sig.ValidChange');

        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'TP.sig.RequiredChange');
    });

    //  ---

    this.it('object-level validation using facets - using local-level setter', function(test, options) {

        var testObj,

            ranLocalHandler;

        testObj = TP.test.SimpleTestTypeWithSetter.construct();
        testObj.set('lastName', 'Edney');
        testObj.set('firstName', 'Bill');
        testObj.set('age', 48);

        testObj.shouldSignalChange(true);

        ranLocalHandler = false;

        testObj.defineMethod('setSSNRequired',
            function(value) {
                ranLocalHandler = true;
                this.$setFacet('SSN', TP.REQUIRED, true);
            });

        testObj.set('SSN', '555-55-5555');

        test.assert.didSignal(testObj, 'SSNChange');
        test.assert.didSignal(testObj, 'TP.sig.ValueChange');

        test.assert.didSignal(testObj, 'SSNValidChange');
        test.assert.didSignal(testObj, 'TP.sig.ValidChange');

        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'TP.sig.RequiredChange');

        test.assert.isTrue(ranLocalHandler);
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.lang.Object.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
