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
//  TP.test.SimpleJSONType
//  ========================================================================

/**
 * @type {TP.test.SimpleJSONType}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('test.SimpleJSONType');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.SimpleJSONType.Inst.defineAttribute(
        'lastName',
        {
            'value': TP.apc('data.lastName'),
            'valid':
            {
                'dataType': String,
            }
        });

TP.test.SimpleJSONType.Inst.defineAttribute(
        'firstName',
        {
            'value': TP.apc('data.firstName'),
            'valid':
            {
                'dataType': String,
            }
        });

TP.test.SimpleJSONType.Inst.defineAttribute(
        'age',
        {
            'value': TP.apc('data.age'),
            'valid':
            {
                'dataType': Number,
            }
        });

TP.test.SimpleJSONType.Inst.defineAttribute(
        'SSN',
        {
            'value': TP.apc('data.SSN'),
            'valid':
            {
                'dataType': 'TP.test.SSN',
            },
            'required': true
        });


//  ------------------------------------------------------------------------

TP.test.SimpleJSONType.defineSubtype('test.SimpleJSONTypeWithSetter');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.SimpleJSONTypeWithSetter.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    var retVal;

    retVal = this.callNextMethod();

    this.checkFacets(attributeName);

    return retVal;
});

//  ========================================================================
//  Test Suite
//  ========================================================================

TP.lang.Object.Inst.describe('Simple JSON content validation',
function() {

    this.it('object-level direct validation', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleJSONType.construct(
                    TP.json2js(
                    '{' +
                    '"lastName":"Edney",' +
                    '"firstName":"Bill",' +
                    '"age":48,' +
                    '"SSN":"555-55-5555"' +
                    '}'));

        test.assert.isTrue(TP.validate(testObj, TP.test.SimpleJSONType));

        testObj = TP.test.SimpleJSONType.construct(
                    TP.json2js(
                    '{' +
                    '"lastName":"Edney",' +
                    '"firstName":"Bill",' +
                    '"age":48,' +
                    '"SSN":"555-55--555"' +
                    '}'));

        test.assert.isFalse(TP.validate(testObj, TP.test.SimpleJSONType));
    });
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.describe('Simple JSON content validation',
function() {

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    this.it('object-level individual aspect facet checking', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleJSONType.construct(
                    TP.json2js(
                    '{' +
                    '"lastName":"Edney",' +
                    '"firstName":"Bill",' +
                    '"age":48,' +
                    '"SSN":"555-55-5555"' +
                    '}'));

        testObj.checkFacets('SSN');
    });

    this.it('object-level setting with manual setter', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleJSONType.construct(
                    TP.json2js(
                    '{' +
                    '"lastName":"Edney",' +
                    '"firstName":"Bill",' +
                    '"age":48' +
                    '}'));

        testObj.shouldSignalChange(true);

        testObj.set('SSN', '555-55-5555');

        test.assert.didSignal(testObj, 'SSNChange');
        test.assert.didSignal(testObj, 'TP.sig.StructureChange');

        testObj.setFacet('SSN', TP.REQUIRED, true);

        test.assert.didSignal(testObj, 'SSNRequiredChange');
    });

    this.it('object-level setting with instance-level setter', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleJSONTypeWithSetter.construct(
                    TP.json2js(
                    '{' +
                    '"lastName":"Edney",' +
                    '"firstName":"Bill",' +
                    '"age":48' +
                    '}'));

        testObj.shouldSignalChange(true);

        testObj.set('SSN', '555-55-5555');

        test.assert.didSignal(testObj, 'SSNChange');
        test.assert.didSignal(testObj, 'TP.sig.StructureChange');
        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'SSNValidChange');
    });

    this.it('object-level setting with local-level setter', function(test, options) {

        var testObj,

            ranLocalHandler;

        testObj = TP.test.SimpleJSONTypeWithSetter.construct(
                    TP.json2js(
                    '{' +
                    '"lastName":"Edney",' +
                    '"firstName":"Bill",' +
                    '"age":48' +
                    '}'));

        testObj.shouldSignalChange(true);

        ranLocalHandler = false;

        testObj.defineMethod('setSSNRequired',
            function(value) {
                ranLocalHandler = true;
                this.$setFacet('SSN', TP.REQUIRED, true);
            });

        testObj.set('SSN', '555-55-5555');

        test.assert.didSignal(testObj, 'SSNChange');
        test.assert.didSignal(testObj, 'TP.sig.StructureChange');
        test.assert.didSignal(testObj, 'SSNRequiredChange');

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
