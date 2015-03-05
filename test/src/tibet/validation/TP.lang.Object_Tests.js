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
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.SimpleTestType');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.SimpleTestType.Inst.defineAttribute(
        'lastName',
        {
            valid: {
                dataType: String
            }
        });

TP.test.SimpleTestType.Inst.defineAttribute(
        'firstName',
        {
            valid: {
                dataType: String
            }
        });

TP.test.SimpleTestType.Inst.defineAttribute(
        'age',
        {
            valid: {
                dataType: Number
            }
        });

TP.test.SimpleTestType.Inst.defineAttribute(
        'SSN',
        {
            valid: {
                dataType: 'TP.test.SSN'
            },
            required: true
        });

//  ========================================================================
//  TP.test.ComplexTestType
//  ========================================================================

TP.test.SimpleTestType.defineSubtype('test.ComplexTestType');

//  Redefinition from its supertype
TP.test.ComplexTestType.Inst.defineAttribute(
        'age',
        {
            valid: {
                dataType: Number,
                minValue: 1,
                maxValue: 120,
                minLength: 1,
                maxLength: 3
            }
        });

TP.test.ComplexTestType.Inst.defineAttribute(
        'gender',
        {
            valid: {
                dataType: String,
                enumeration: TP.ac('male', 'female')
            }
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

    var usingDebugger,
        oldLogLevel;

    this.before(
        function() {
            //  For now, we turn off triggering the debugger because we know
            //  that this test case has a XInclude that points to a file
            //  that won't be found - that part of this test is testing
            //  'xi:fallback' element.
            usingDebugger = TP.sys.shouldUseDebugger();
            TP.sys.shouldUseDebugger(false);

            //  Same for log level
            oldLogLevel = TP.getLogLevel();
            TP.setLogLevel(TP.SEVERE);

            //  Suspend raising (since we know - and want - some of these
            //  validations to fail).
            TP.raise.$suspended = true;
        });

    this.after(
        function() {
            //  Put log level back to what it was
            TP.setLogLevel(oldLogLevel);

            //  Put the debugger setting back to what it was
            TP.sys.shouldUseDebugger(usingDebugger);

            //  Unsuspend raising
            TP.raise.$suspended = false;
        });

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

    this.it('object-level direct validation - simple type', function(test, options) {

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

    this.it('object-level direct validation - complex type', function(test, options) {

        var testObj;

        testObj = TP.test.ComplexTestType.construct();
        testObj.set('lastName', 'Edney');
        testObj.set('firstName', 'Bill');
        testObj.set('SSN', '555-55-5555');
        testObj.set('gender', 'male');

        //  No age - no validity checks are possible
        test.assert.isFalse(TP.validate(testObj, TP.test.ComplexTestType));

        //  Set age to -1 - will violate the 'minValue' constraint
        testObj.set('age', -1);
        test.assert.isFalse(TP.validate(testObj, TP.test.ComplexTestType));

        //  Set age to 121 - will violate the 'maxValue' constraint
        testObj.set('age', 121);
        test.assert.isFalse(TP.validate(testObj, TP.test.ComplexTestType));

        //  Set age to 48 - should pass
        testObj.set('age', 48);
        test.assert.isTrue(TP.validate(testObj, TP.test.ComplexTestType));

        //  Set gender to 'unknown' - should fail
        testObj.set('gender', 'unknown');
        test.assert.isFalse(TP.validate(testObj, TP.test.ComplexTestType));

        //  Set gender to 'female' - should pass
        testObj.set('gender', 'female');
        test.assert.isTrue(TP.validate(testObj, TP.test.ComplexTestType));
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
//  JSON Test Suite
//  ========================================================================

//  ========================================================================
//  TP.test.SimpleJSONContentType
//  ========================================================================

/**
 * @type {TP.test.SimpleJSONContentType}
 * @summary A simple type to test JSON content.
 * @summary Note that TP.core.JSONContent automatically checks facets and
 *     sets their value when its set() call is made. Therefore, the 'manual
 *     facet setting' and 'individual aspect facet checking' tests are skipped
 *     here.
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('test.SimpleJSONContentType');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.SimpleJSONContentType.Inst.defineAttribute(
        'lastName',
        {
            value: TP.tpc('lastName'),
            valid: {
                dataType: String
            }
        });

TP.test.SimpleJSONContentType.Inst.defineAttribute(
        'firstName',
        {
            value: TP.tpc('firstName'),
            valid: {
                dataType: String
            }
        });

TP.test.SimpleJSONContentType.Inst.defineAttribute(
        'age',
        {
            value: TP.tpc('age'),
            valid: {
                dataType: Number
            }
        });

TP.test.SimpleJSONContentType.Inst.defineAttribute(
        'SSN',
        {
            value: TP.tpc('SSN'),
            valid: {
                dataType: 'TP.test.SSN'
            },
            required: true
        });

//  ========================================================================
//  JSON Test Suite
//  ========================================================================

TP.lang.Object.Inst.describe('JSON content validation',
function() {

    var usingDebugger,
        oldLogLevel;

    this.before(
        function() {
            //  For now, we turn off triggering the debugger because we know
            //  that this test case has a XInclude that points to a file
            //  that won't be found - that part of this test is testing
            //  'xi:fallback' element.
            usingDebugger = TP.sys.shouldUseDebugger();
            TP.sys.shouldUseDebugger(false);

            //  Same for log level
            oldLogLevel = TP.getLogLevel();
            TP.setLogLevel(TP.SEVERE);

            //  Suspend raising (since we know - and want - some of these
            //  validations to fail).
            TP.raise.$suspended = true;
        });

    this.after(
        function() {
            //  Put log level back to what it was
            TP.setLogLevel(oldLogLevel);

            //  Put the debugger setting back to what it was
            TP.sys.shouldUseDebugger(usingDebugger);

            //  Unsuspend raising
            TP.raise.$suspended = false;
        });

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    this.it('JSON content direct validation', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleJSONContentType.construct(
                    TP.json2js(
                    '{' +
                    '"lastName":"Edney",' +
                    '"firstName":"Bill",' +
                    '"age":48,' +
                    '"SSN":"555-55-5555"' +
                    '}'));

        test.assert.isTrue(TP.validate(testObj, TP.test.SimpleJSONContentType));

        testObj = TP.test.SimpleJSONContentType.construct(
                    TP.json2js(
                    '{' +
                    '"lastName":"Edney",' +
                    '"firstName":"Bill",' +
                    '"age":48,' +
                    '"SSN":"555-55--555"' +
                    '}'));

        test.assert.isFalse(TP.validate(testObj, TP.test.SimpleJSONContentType));
    });

    //  ---

    this.it('JSON content validation using facets - using instance-level setter', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleJSONContentType.construct(
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

        test.assert.didSignal(testObj, 'SSNValidChange');
        test.assert.didSignal(testObj, 'TP.sig.ValidChange');

        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'TP.sig.RequiredChange');
    });

    //  ---

    this.it('JSON content validation using facets - using local-level setter', function(test, options) {

        var testObj,

            ranLocalHandler;

        testObj = TP.test.SimpleJSONContentType.construct(
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

        test.assert.didSignal(testObj, 'SSNValidChange');
        test.assert.didSignal(testObj, 'TP.sig.ValidChange');

        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'TP.sig.RequiredChange');

        test.assert.isTrue(ranLocalHandler);
    });
});

//  ========================================================================
//  XML Test Suite
//  ========================================================================

//  ========================================================================
//  TP.test.SimpleXMLContentType
//  ========================================================================

/**
 * @type {TP.test.SimpleXMLContentType}
 * @summary A simple type to test XML content.
 * @summary Note that TP.core.XMLContent automatically checks facets and
 *     sets their value when its set() call is made. Therefore, the 'manual
 *     facet setting' and 'individual aspect facet checking' tests are skipped
 *     here.
 */

//  ------------------------------------------------------------------------

TP.core.XMLContent.defineSubtype('test.SimpleXMLContentType');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.SimpleXMLContentType.Inst.defineAttribute(
        'lastName',
        {
            value: TP.xpc('/emp/lastName',
                       TP.hc('shouldCollapse', true,
                                'extractWith', 'value')),
            valid: {
                dataType: String
            }
        });

TP.test.SimpleXMLContentType.Inst.defineAttribute(
        'firstName',
        {
            value: TP.xpc('/emp/firstName',
                       TP.hc('shouldCollapse', true,
                                'extractWith', 'value')),
            valid: {
                dataType: String
            }
        });

TP.test.SimpleXMLContentType.Inst.defineAttribute(
        'age',
        {
            value: TP.xpc('/emp/age',
                       TP.hc('shouldCollapse', true,
                                'extractWith', 'value')),
            valid: {
                dataType: Number
            }
        });

TP.test.SimpleXMLContentType.Inst.defineAttribute(
        'SSN',
        {
            value: TP.xpc('/emp/SSN',
                       TP.hc('shouldCollapse', true,
                                'extractWith', 'value',
                                'shouldMakeStructures', true)),
            valid: {
                dataType: 'TP.test.SSN'
            },
            required: true
        });

//  ========================================================================
//  XML Test Suite
//  ========================================================================

TP.lang.Object.Inst.describe('XML content validation',
function() {

    var usingDebugger,
        oldLogLevel;

    this.before(
        function() {
            //  For now, we turn off triggering the debugger because we know
            //  that this test case has a XInclude that points to a file
            //  that won't be found - that part of this test is testing
            //  'xi:fallback' element.
            usingDebugger = TP.sys.shouldUseDebugger();
            TP.sys.shouldUseDebugger(false);

            //  Same for log level
            oldLogLevel = TP.getLogLevel();
            TP.setLogLevel(TP.SEVERE);

            //  Suspend raising (since we know - and want - some of these
            //  validations to fail).
            TP.raise.$suspended = true;
        });

    this.after(
        function() {
            //  Put log level back to what it was
            TP.setLogLevel(oldLogLevel);

            //  Put the debugger setting back to what it was
            TP.sys.shouldUseDebugger(usingDebugger);

            //  Unsuspend raising
            TP.raise.$suspended = false;
        });

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    this.it('XML content direct validation', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleXMLContentType.construct(
            '<emp>' +
                '<lastName>Edney</lastName>' +
                '<firstName>Bill</firstName>' +
                '<age>48</age>' +
                '<SSN>555-55-5555</SSN>' +
            '</emp>');

        test.assert.isTrue(TP.validate(testObj, TP.test.SimpleXMLContentType));

        testObj = TP.test.SimpleXMLContentType.construct(
            '<emp>' +
                '<lastName>Edney</lastName>' +
                '<firstName>Bill</firstName>' +
                '<age>48</age>' +
                '<SSN>555-55--555</SSN>' +
            '</emp>');

        test.assert.isFalse(TP.validate(testObj, TP.test.SimpleXMLContentType));
    });

    //  ---

    this.it('XML content validation using facets - using instance-level setter', function(test, options) {

        var testObj;

        testObj = TP.test.SimpleXMLContentType.construct(
            '<emp>' +
                '<lastName>Edney</lastName>' +
                '<firstName>Bill</firstName>' +
                '<age>48</age>' +
            '</emp>');

        testObj.shouldSignalChange(true);

        //  We don't actually have any markup representing SSN in our model, but
        //  since we configured the 'SSN path' above to 'make' markup as it
        //  goes, this will build an <SSN>555-55-5555</SSN> element.
        testObj.set('SSN', '555-55-5555');

        test.assert.didSignal(testObj, 'SSNChange');
        //  Since we built markup, it's TP.sig.StructureChange, not just
        //  TP.sig.ValueChange
        test.assert.didSignal(testObj, 'TP.sig.StructureChange');

        test.assert.didSignal(testObj, 'SSNValidChange');
        test.assert.didSignal(testObj, 'TP.sig.ValidChange');

        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'TP.sig.RequiredChange');

        testObj.shouldSignalChange(false);
    });

    //  ---

    this.it('XML content validation using facets - using local-level setter', function(test, options) {

        var testObj,

            ranLocalHandler;

        testObj = TP.test.SimpleXMLContentType.construct(
            '<emp>' +
                '<lastName>Edney</lastName>' +
                '<firstName>Bill</firstName>' +
                '<age>48</age>' +
                '<SSN/>' +
            '</emp>');

        testObj.shouldSignalChange(true);

        ranLocalHandler = false;

        testObj.defineMethod('setSSNRequired',
            function(value) {
                ranLocalHandler = true;
                this.$setFacet('SSN', TP.REQUIRED, true);
            });

        //  We actually have markup representing SSN in our model so this will
        //  just set it's content
        testObj.set('SSN', '555-55-5555');

        test.assert.didSignal(testObj, 'SSNChange');
        //  Since we didn't build markup, it's TP.sig.ValueChange, not
        //  TP.sig.StructureChange
        test.assert.didSignal(testObj, 'TP.sig.ValueChange');

        test.assert.didSignal(testObj, 'SSNValidChange');
        test.assert.didSignal(testObj, 'TP.sig.ValidChange');

        test.assert.didSignal(testObj, 'SSNRequiredChange');
        test.assert.didSignal(testObj, 'TP.sig.RequiredChange');

        test.assert.isTrue(ranLocalHandler);

        testObj.shouldSignalChange(false);
    });
});

//  ========================================================================
//  TP.test.Employee
//  ========================================================================

/**
 * @type {TP.test.Employee}
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.Employee');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.Employee.Inst.defineAttribute(
        'lastname',
        {
            valid: {
                dataType: 'TP.tibet.alpha'    //  Defined as XML Schema type
            },
            required: true
        });

TP.test.Employee.Inst.defineAttribute(
        'firstname',
        {
            valid: {
                dataType: 'TP.tibet.alpha'    //  Defined as XML Schema type
            },
            required: true
        });

TP.test.Employee.Inst.defineAttribute(
        'age',
        {
            valid: {
                dataType: 'xs:decimal'
            },
            required: true
        });

TP.test.Employee.Inst.defineAttribute(
        'address',
        {
            valid: {
                dataType: 'TP.tibet.address'  //  Defined as JSON Schema type
            },
            required: true
        });

TP.test.Employee.Inst.defineAttribute(
        'gender',
        {
            valid: {
                dataType: 'TP.tibet.gender'   //  Defined as JSON Schema type
            },
            required: true
        });

TP.test.Employee.Inst.defineAttribute(
        'SSN',
        {
            valid: {
                dataType: 'TP.test.SSN'
            },
            required: true
        });

//  ========================================================================
//  External Schema Test Suite
//  ========================================================================

TP.lang.Object.Inst.describe('External schema validation',
function() {

    var usingDebugger,
        oldLogLevel;

    this.before(
        function() {
            var xmlSchemaTPDoc,
                jsonSchemaContent;

            //  For now, we turn off triggering the debugger because we know
            //  that this test case has a XInclude that points to a file
            //  that won't be found - that part of this test is testing
            //  'xi:fallback' element.
            usingDebugger = TP.sys.shouldUseDebugger();
            TP.sys.shouldUseDebugger(false);

            //  Same for log level
            oldLogLevel = TP.getLogLevel();
            TP.setLogLevel(TP.SEVERE);

            //  Suspend raising (since we know - and want - some of these
            //  validations to fail).
            TP.raise.$suspended = true;

            xmlSchemaTPDoc = TP.uc('~lib_lib/xs/tibet_common_types.xsd').
                                            getResource(TP.hc('async', false));
            xmlSchemaTPDoc.getDocumentElement().defineTypes();

            jsonSchemaContent = TP.uc('~lib_lib/json/tibet_common_types.json').
                                            getResource(TP.hc('async', false));
            jsonSchemaContent.defineTypes();
        });

    this.after(
        function() {
            //  Put log level back to what it was
            TP.setLogLevel(oldLogLevel);

            //  Put the debugger setting back to what it was
            TP.sys.shouldUseDebugger(usingDebugger);

            //  Unsuspend raising
            TP.raise.$suspended = false;
        });

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    this.it('object-level direct validation with external schema', function(test, options) {

        var testObj;

        testObj = TP.test.Employee.construct();
        testObj.set('lastname', 'Edney');
        testObj.set('firstname', 'Bill');

        testObj.set('address',
                    TP.hc('street_address', '111 Main St.',
                            'city', 'Anytown',
                            'state', 'WA'));

        testObj.set('age', 48);
        testObj.set('gender', 'male');
        testObj.set('SSN', '555-55-5555');

        test.assert.isTrue(TP.validate(testObj, TP.test.Employee));

        testObj.set('SSN', '555-55--555');

        test.assert.isFalse(TP.validate(testObj, TP.test.Employee));
    });
});

//  ========================================================================
//  Markup-level Test Suite
//  ========================================================================

//  ========================================================================
//  TP.test.BaseMarkupEmployee
//  ========================================================================

/**
 * @type {TP.test.BaseMarkupEmployee}
 */

//  ------------------------------------------------------------------------

TP.core.XMLContent.defineSubtype('test.BaseMarkupEmployee');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.BaseMarkupEmployee.Inst.defineAttribute(
        'lastname',
        {
            value: TP.xpc('string(./person/lastname/text())'),
            valid: {
                dataType: 'TP.tibet.alpha'    //  Defined as XML Schema type
            },
            required: true
        });

TP.test.BaseMarkupEmployee.Inst.defineAttribute(
        'firstname',
        {
            value: TP.xpc('string(./person/firstname/text())'),
            valid: {
                dataType: 'TP.tibet.alpha'    //  Defined as XML Schema type
            },
            required: true
        });

TP.test.BaseMarkupEmployee.Inst.defineAttribute(
        'age',
        {
            value: TP.xpc('number(./person/age/text())'),
            valid: {
                dataType: 'xs:decimal'
            }
        });

TP.test.BaseMarkupEmployee.Inst.defineAttribute(
        'address',
        {
            value: TP.xpc('./person/address',
                            TP.hc('packageWith', 'object')),
            valid: {
                dataType: 'TP.tibet.address'  //  Defined as JSON Schema type
            },
            required: true
        });

TP.test.BaseMarkupEmployee.Inst.defineAttribute(
        'gender',
        {
            value: TP.xpc('string(./person/gender/text())'),
            valid: {
                dataType: 'TP.tibet.gender'   //  Defined as JSON Schema type
            },
            required: true
        });

TP.test.BaseMarkupEmployee.Inst.defineAttribute(
        'uscitizen',
        {
            value: TP.xpc('boolean(./person/uscitizen/text())'),
            valid: {
                dataType: Boolean
            }
        });

TP.test.BaseMarkupEmployee.Inst.defineAttribute(
        'SSN',
        {
            value: TP.xpc('string(./person/SSN/text())'),
            relevant: TP.xpc('boolean(./person/uscitizen/text())'),
            valid: {
                dataType: 'TP.test.SSN'
            }
        });

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.describe('Markup level validation',
function() {

    var unloadURI,

        usingDebugger,
        oldLogLevel;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

    this.before(
        function() {
            var xmlSchemaTPDoc,
                jsonSchemaContent;

            //  For now, we turn off triggering the debugger because we know
            //  that this test case has a XInclude that points to a file
            //  that won't be found - that part of this test is testing
            //  'xi:fallback' element.
            usingDebugger = TP.sys.shouldUseDebugger();
            TP.sys.shouldUseDebugger(false);

            //  Same for log level
            oldLogLevel = TP.getLogLevel();
            TP.setLogLevel(TP.SEVERE);

            //  Suspend raising (since we know - and want - some of these
            //  validations to fail).
            TP.raise.$suspended = true;

            //  ---

            xmlSchemaTPDoc = TP.uc('~lib_lib/xs/tibet_common_types.xsd').
                                            getResource(TP.hc('async', false));
            xmlSchemaTPDoc.getDocumentElement().defineTypes();

            jsonSchemaContent = TP.uc('~lib_lib/json/tibet_common_types.json').
                                            getResource(TP.hc('async', false));
            jsonSchemaContent.defineTypes();

            //  ---

            this.getDriver().showTestGUI();

            //  ---

            //  NB: We do this here rather than in the 'beforeEach' so that we
            //  can test for signals that get dispatched during the load
            //  process.
            this.startTrackingSignals();
        });

    this.after(
        function() {

            //  Put log level back to what it was
            TP.setLogLevel(oldLogLevel);

            //  Put the debugger setting back to what it was
            TP.sys.shouldUseDebugger(usingDebugger);

            //  Unsuspend raising
            TP.raise.$suspended = false;

            //  ---

            this.getDriver().showTestLog();

            //  ---

            //  Stop tracking here because we started tracking in the before().
            this.stopTrackingSignals();
        });

    this.afterEach(
        function() {
            //  Reset the metrics we're tracking.
            TP.signal.reset();
        });

    //  ---

    this.it('markup-level validation - simple and complex types', function(test, options) {
        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/validation/Validation1.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var srcURI,

                    ageURI,

                    ageField;

                srcURI = TP.uc('urn:tibet:Validation1_person');
                ageURI = TP.uc('urn:tibet:Validation1_person#tibet(age)');

                ageField = TP.byOID('ageField');

                //  Note that these are tested in order of firing, just for
                //  clarity purposes.

                //  ---

                //  'structure' change - age URI
                test.assert.didSignal(ageURI, 'TP.sig.StructureChange');

                //  'valid' change
                test.assert.didSignal(ageURI, 'AgeValidChange');
                test.assert.didSignal(ageField, 'TP.sig.UIValid');
                test.assert.didSignal(ageField, 'InvalidChange');

                test.assert.didSignal(srcURI, 'AgeValidChange');

                //  ---

                //  'value' change - source URI
                test.assert.didSignal(srcURI, 'TP.sig.ValueChange');

                //  ---

                test.then(
                    function() {
                        //  Reset the metrics we're tracking.
                        TP.signal.reset();
                    });

                test.getDriver().startSequence().
                    exec(function() {
                                ageField.clearValue();
                            }).
                    sendKeys('Not A Number', ageField).
                    sendEvent(TP.hc('type', 'change'), ageField).
                    perform();

                //  ---

                test.then(
                    function() {

                        //  'age' change - age URI
                        test.assert.didSignal(ageURI, 'AgeChange');

                        //  'age' change - source URI
                        test.assert.didSignal(srcURI, 'AgeChange');

                        //  'valid' change
                        test.assert.didSignal(ageURI, 'AgeValidChange');
                        test.assert.didSignal(ageField, 'TP.sig.UIInvalid');
                        test.assert.didSignal(ageField, 'InvalidChange');

                        test.assert.didSignal(srcURI, 'AgeValidChange');
                    });

                //  ---

                test.then(
                    function() {
                        //  Reset the metrics we're tracking.
                        TP.signal.reset();
                    });

                test.getDriver().startSequence().
                    exec(function() {
                                ageField.clearValue();
                            }).
                    sendKeys('25', ageField).
                    sendEvent(TP.hc('type', 'change'), ageField).
                    perform();

                //  ---

                test.then(
                    function() {

                        //  'age' change - age URI
                        test.assert.didSignal(ageURI, 'AgeChange');

                        //  'age' change - source URI
                        test.assert.didSignal(srcURI, 'AgeChange');

                        //  'valid' change
                        test.assert.didSignal(ageURI, 'AgeValidChange');
                        test.assert.didSignal(ageField, 'TP.sig.UIValid');
                        test.assert.didSignal(ageField, 'InvalidChange');

                        test.assert.didSignal(srcURI, 'AgeValidChange');
                    });

                //  ---

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('markup-level validation - relevancy check', function(test, options) {
        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/validation/Validation2.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var srcURI,

                    ssnURI,
                    citURI,

                    ssnField,
                    citCheckbox;

                srcURI = TP.uc('urn:tibet:Validation2_person');
                ssnURI = TP.uc('urn:tibet:Validation2_person#tibet(SSN)');
                citURI = TP.uc('urn:tibet:Validation2_person#tibet(uscitizen)');

                ssnField = TP.byOID('SSNField');
                citCheckbox = TP.byOID('uscitizenCheckbox');

                //  Note that these are tested in order of firing, just for
                //  clarity purposes.

                //  ---

                //  'structure' change - citizen URI
                test.assert.didSignal(citURI, 'TP.sig.StructureChange');

                //  'valid' change
                test.assert.didSignal(citURI, 'UscitizenValidChange');
                test.assert.didSignal(citCheckbox, 'TP.sig.UIValid');
                test.assert.didSignal(citCheckbox, 'InvalidChange');

                test.assert.didSignal(srcURI, 'UscitizenValidChange');

                //  ---

                //  'structure' change - SSN URI
                test.assert.didSignal(ssnURI, 'TP.sig.StructureChange');

                //  'relevant' change - SSN
                test.assert.didSignal(ssnURI, 'SSNRelevantChange');
                test.assert.didSignal(ssnField, 'TP.sig.UIDisabled');
                test.assert.didSignal(ssnField, 'DisabledChange');

                test.assert.didSignal(srcURI, 'SSNRelevantChange');

                //  'valid' change - SSN
                test.assert.didSignal(ssnURI, 'SSNValidChange');
                test.assert.didSignal(ssnField, 'TP.sig.UIInvalid');
                test.assert.didSignal(ssnField, 'InvalidChange');

                test.assert.didSignal(srcURI, 'SSNValidChange');

                //  ---

                //  'value' change - source URI
                test.assert.didSignal(srcURI, 'TP.sig.ValueChange');

                //  ---

                //  Reset the metrics we're tracking.
                TP.signal.reset();

                //  ---

                driver.startSequence().
                    click(citCheckbox).
                    perform();

                test.then(
                    function() {

                        //  'relevant' change - SSN
                        test.assert.didSignal(ssnURI, 'SSNRelevantChange');
                        test.assert.didSignal(ssnField, 'TP.sig.UIEnabled');
                        test.assert.didSignal(ssnField, 'DisabledChange');

                        test.assert.didSignal(srcURI, 'SSNRelevantChange');

                        //  'US citizen' change - citizen URI
                        test.assert.didSignal(citURI, 'UscitizenChange');

                        //  'US citizen' change - source URI
                        test.assert.didSignal(srcURI, 'UscitizenChange');
                    });

                //  ---

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.lang.Object.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
