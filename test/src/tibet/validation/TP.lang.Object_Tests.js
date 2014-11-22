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
            'valid': {
                'dataType': String
            }
        });

TP.test.SimpleJSONType.Inst.defineAttribute(
        'firstName',
        {
            'value': TP.apc('data.firstName'),
            'valid': {
                'dataType': String
            }
        });

TP.test.SimpleJSONType.Inst.defineAttribute(
        'age',
        {
            'value': TP.apc('data.age'),
            'valid': {
                'dataType': Number
            }
        });

TP.test.SimpleJSONType.Inst.defineAttribute(
        'SSN',
        {
            'value': TP.apc('data.SSN'),
            'valid': {
                'dataType': 'TP.test.SSN'
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

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

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

    //  ---

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

    //  ---

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

    //  ---

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
        test.assert.didSignal(testObj, 'SSNValidChange');

        test.assert.isTrue(ranLocalHandler);
    });
});

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.Employee');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.Employee.Inst.defineAttribute(
        'lastname',
        {
            'value': undefined,
            'valid': {
                'dataType': 'tibet:alpha'
            },
            'required': true
        },
        'firstname',
        {
            'value': undefined,
            'valid': {
                'dataType': 'tibet:alpha'
            },
            'required': true
        },
        'age',
        {
            'value': undefined,
            'valid': {
                'dataType': 'xs:decimal'
            },
            'required': true
        },
        'gender',
        {
            'value': 'f',
            'valid': {
                'enumeration': TP.ac('m','f')
            },
            'required': true
        },
        'SSN',
        {
            'value': undefined,
            'valid': {
                'dataType': 'TP.test.SSN'
            },
            'required': true
        });

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.describe('Object-level validation',
function() {

    this.it('using defineBinding() - concrete reference, same simple aspect', function(test, options) {

        var modelObj,
            observerObj;

        modelObj = TP.test.Employee.construct();

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('SSN');
        observerObj.defineAttribute('SSNIsValid');

        observerObj.defineBinding('SSN', modelObj, 'SSN');
        observerObj.defineBinding('SSNIsValid', modelObj, 'SSN', TP.VALID);

        //  Set the value of 'SSN' on the model object. The binding should
        //  cause the value of 'SSN' on the observer to update.
        modelObj.set('SSN', '555-55-5555');
        modelObj.setFacet('SSN', TP.VALID, true);

        this.assert.isEqualTo(
                    modelObj.get('SSN'),
                    observerObj.get('SSN'));

        this.assert.isEqualTo(
                    true,
                    observerObj.get('SSNIsValid'));

        //  Destroy the bindings
        observerObj.destroyBinding('SSN', modelObj, 'SSN');
        observerObj.destroyBinding('SSNIsValid', modelObj, 'SSN', TP.VALID);

        modelObj.set('SSN', '111-11-1111');
        modelObj.setFacet('SSN', TP.VALID, false);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of '555-55-5555' set above.
        this.assert.isEqualTo(
                    '555-55-5555',
                    observerObj.get('SSN'));

        //  And the valid setting should still be true.
        this.assert.isEqualTo(
                    true,
                    observerObj.get('SSNIsValid'));
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
