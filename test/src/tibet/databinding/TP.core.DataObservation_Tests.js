//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst path change signaling',
function() {

    var modelObj,
        jsonValueObsFunction,
        jsonStructureObsFunction,

        valuePathResults,
        structurePathResults,

        jsonPath1,
        jsonPath2,
        jsonPath3,
        jsonPath4,
        jsonPath5,
        jsonPath6,
        jsonPath7;

    this.before(function() {
        modelObj = TP.json2js('{"foo":["1st","2nd",{"hi":"there"}]}');

        valuePathResults = TP.ac();
        structurePathResults = TP.ac();

        jsonValueObsFunction =
                function (aSignal) {
                    valuePathResults.push(aSignal.at('aspect'));
            };

        jsonValueObsFunction.observe(modelObj, 'ValueChange');

        jsonStructureObsFunction =
                function (aSignal) {
                    structurePathResults.push(aSignal.at('aspect'));
            };

        jsonStructureObsFunction.observe(modelObj, 'StructureChange');

        //  Set up this path just to observe
        jsonPath1 = TP.apc('foo');
        jsonPath1.executeGet(modelObj);
    });

    this.it('change along a single path', function(test, options) {

        jsonPath2 = TP.apc('foo.3.bar');
        jsonPath2.set('shouldMake', true);

        jsonPath2.executeSet(modelObj, 'goo', true);

        //  The value path results should have the path for jsonPath2
        this.assert.contains(valuePathResults, jsonPath2.get('srcPath'));

        //  The structure path results should have the path for jsonPath2
        this.assert.contains(structurePathResults, jsonPath2.get('srcPath'));

        //  But *not* for jsonPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, jsonPath1.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change along a branching path', function(test, options) {

        jsonPath3 = TP.apc('foo.3[bar,moo,too].roo');
        jsonPath3.set('shouldMake', true);

        jsonPath3.executeSet(modelObj, TP.ac(), true);

        //  The value path results should have the path for jsonPath3
        this.assert.contains(valuePathResults, jsonPath3.get('srcPath'));

        //  The structure path results should have the path for jsonPath3
        this.assert.contains(structurePathResults, jsonPath3.get('srcPath'));

        //  And the value path results for jsonPath2 (because and we replaced the
        //  value at 'foo.3.bar' with an Object to hold the 'roo' value)
        this.assert.contains(valuePathResults, jsonPath2.get('srcPath'));

        //  But not the structure path results for jsonPath2 (we created no new
        //  structure there).
        this.refute.contains(structurePathResults, jsonPath2.get('srcPath'));

        //  And *not* for jsonPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, jsonPath1.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change of an end aspect of a branching path', function(test, options) {

        jsonPath4 = TP.apc('foo.3.bar.roo');
        jsonPath4.executeGet(modelObj);

        jsonPath5 = TP.apc('foo.3.moo.roo');

        jsonPath5.executeSet(modelObj, 42, true);

        //  The value path results should have the path for jsonPath5
        this.assert.contains(valuePathResults, jsonPath5.get('srcPath'));

        //  And the structure path results should have the path for jsonPath5
        this.assert.contains(structurePathResults, jsonPath5.get('srcPath'));

        //  And *not* for jsonPath4 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, jsonPath4.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath4.get('srcPath'));

        //  The value path results should have the path for jsonPath3
        this.assert.contains(valuePathResults, jsonPath3.get('srcPath'));

        //  And the structure path results should have the path for jsonPath3
        this.assert.contains(structurePathResults, jsonPath3.get('srcPath'));

        //  And *not* for jsonPath2 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, jsonPath2.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath2.get('srcPath'));

        //  And *not* for jsonPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, jsonPath1.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change of a parent aspect of a branching path', function(test, options) {

        jsonPath6 = TP.apc('foo.3');

        jsonPath6.executeSet(modelObj, 'fluffy', true);

        //  The value path results should have the path for jsonPath6
        this.assert.contains(valuePathResults, jsonPath6.get('srcPath'));

        //  And the structure path results should have the path for jsonPath6 as
        //  well (structure was changed).
        this.assert.contains(structurePathResults, jsonPath6.get('srcPath'));

        //  And for jsonPath5 (because it's ancestor's structure changed)
        this.assert.contains(valuePathResults, jsonPath5.get('srcPath'));

        //  And the structure path results should have the path for jsonPath5 as
        //  well (structure was changed).
        this.assert.contains(structurePathResults, jsonPath5.get('srcPath'));

        //  And for jsonPath4 (because it's ancestor's structure changed)
        this.assert.contains(valuePathResults, jsonPath4.get('srcPath'));

        //  And the structure path results should have the path for jsonPath4 as
        //  well (structure was changed).
        this.assert.contains(structurePathResults, jsonPath4.get('srcPath'));

        //  And for jsonPath3 (because it's ancestor's structure changed)
        this.assert.contains(valuePathResults, jsonPath3.get('srcPath'));

        //  And the structure path results should have the path for jsonPath3 as
        //  well (structure was changed).
        this.assert.contains(structurePathResults, jsonPath3.get('srcPath'));

        //  And for jsonPath2 (because it's ancestor's structure changed)
        this.assert.contains(valuePathResults, jsonPath2.get('srcPath'));

        //  And the structure path results should have the path for jsonPath2 as
        //  well (structure was changed).
        this.assert.contains(structurePathResults, jsonPath2.get('srcPath'));

        //  And *not* for jsonPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, jsonPath1.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change of another parent aspect of a branching path', function(test, options) {

        jsonPath7 = TP.apc('foo.2');
        jsonPath7.set('shouldMake', true);

        jsonPath7.executeSet(modelObj, TP.ac(), true);

        //  The value path results should have the path for jsonPath7
        this.assert.contains(valuePathResults, jsonPath7.get('srcPath'));

        //  And the structure path results should have the path for jsonPath7
        this.assert.contains(structurePathResults, jsonPath7.get('srcPath'));

        //  But *not* for jsonPath6 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, jsonPath6.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath6.get('srcPath'));

        //  And *not* for jsonPath5 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, jsonPath5.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath5.get('srcPath'));

        //  And *not* for jsonPath4 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, jsonPath4.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath4.get('srcPath'));

        //  And *not* for jsonPath3 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, jsonPath3.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath3.get('srcPath'));

        //  And *not* for jsonPath2 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, jsonPath2.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath2.get('srcPath'));

        //  And *not* for jsonPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, jsonPath1.get('srcPath'));
        this.refute.contains(structurePathResults, jsonPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change model to a whole new object', function(test, options) {
        jsonPath1.set('shouldMake', true);

        //  Set everything under 'foo' to a new data structure
        jsonPath1.executeSet(modelObj, TP.json2js('["A","B","C","D"]'), true);

        //  All paths will have changed

        //  Both results should have the path for jsonPath7
        this.assert.contains(valuePathResults, jsonPath7.get('srcPath'));
        this.assert.contains(structurePathResults, jsonPath7.get('srcPath'));

        //  And for jsonPath6
        this.assert.contains(valuePathResults, jsonPath6.get('srcPath'));
        this.assert.contains(structurePathResults, jsonPath6.get('srcPath'));

        //  And for jsonPath5
        this.assert.contains(valuePathResults, jsonPath5.get('srcPath'));
        this.assert.contains(structurePathResults, jsonPath5.get('srcPath'));

        //  And for jsonPath4
        this.assert.contains(valuePathResults, jsonPath4.get('srcPath'));
        this.assert.contains(structurePathResults, jsonPath4.get('srcPath'));

        //  And for jsonPath3
        this.assert.contains(valuePathResults, jsonPath3.get('srcPath'));
        this.assert.contains(structurePathResults, jsonPath3.get('srcPath'));

        //  And for jsonPath2
        this.assert.contains(valuePathResults, jsonPath2.get('srcPath'));
        this.assert.contains(structurePathResults, jsonPath2.get('srcPath'));

        //  And for jsonPath1
        this.assert.contains(valuePathResults, jsonPath1.get('srcPath'));
        this.assert.contains(structurePathResults, jsonPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change along a single path for the new object', function(test, options) {
        jsonPath6.executeSet(modelObj, 'fluffy', true);

        //  The path has should *not* have the path for jsonPath7 (it's at a
        //  similar level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, jsonPath7.get('srcPath'));

        //  The value path results should have the path for jsonPath6
        this.assert.contains(valuePathResults, jsonPath6.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, jsonPath6.get('srcPath'));

        //  And for jsonPath5
        this.assert.contains(valuePathResults, jsonPath5.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, jsonPath5.get('srcPath'));

        //  And for jsonPath4
        this.assert.contains(valuePathResults, jsonPath4.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, jsonPath4.get('srcPath'));

        //  And for jsonPath3
        this.assert.contains(valuePathResults, jsonPath3.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, jsonPath3.get('srcPath'));

        //  And for jsonPath2
        this.assert.contains(valuePathResults, jsonPath2.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, jsonPath2.get('srcPath'));

        //  And *not* for jsonPath1 (it's too high up in the chain)
        this.refute.contains(valuePathResults, jsonPath1.get('srcPath'));

        //  And not for the structural path result
        this.refute.contains(structurePathResults, jsonPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.after(function() {
        jsonValueObsFunction.ignore(modelObj, 'ValueChange');
        jsonStructureObsFunction.ignore(modelObj, 'StructureChange');
    });
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.describe('TP.core.XPathPath Inst path change signaling',
function() {

    var modelObj,
        xmlValueObsFunction,
        xmlStructureObsFunction,

        valuePathResults,
        structurePathResults,

        xmlPath1,
        xmlPath2,
        xmlPath3,
        xmlPath4,
        xmlPath5,
        xmlPath6,
        xmlPath7;

    this.before(function() {
        modelObj = TP.tpdoc('<emp><lname valid="true">Edney</lname><age>47</age></emp>');

        valuePathResults = TP.ac();
        structurePathResults = TP.ac();

        xmlValueObsFunction =
                function (aSignal) {
                    valuePathResults.push(aSignal.at('aspect'));
            };

        xmlValueObsFunction.observe(modelObj, 'ValueChange');

        xmlStructureObsFunction =
                function (aSignal) {
                    structurePathResults.push(aSignal.at('aspect'));
            };

        xmlStructureObsFunction.observe(modelObj, 'StructureChange');

        //  Set up this path just to observe
        xmlPath1 = TP.apc('/emp');
        xmlPath1.executeGet(modelObj);
    });

    this.it('change along a single path', function(test, options) {

        xmlPath2 = TP.apc('/emp/lname');
        xmlPath2.set('shouldMake', true);

        xmlPath2.executeSet(modelObj, 'Shattuck', true);

        //  The value path should have the path for xmlPath2
        this.assert.contains(valuePathResults, xmlPath2.get('srcPath'));

        //  But not the structure path results for xmlPath2 (we created no new
        //  structure there).
        this.refute.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change along a single attribute path', function(test, options) {

        xmlPath3 = TP.apc('/emp/lname/@valid');
        xmlPath3.set('shouldMake', true);

        xmlPath3.executeSet(modelObj, false, true);

        //  The value path should have the path for xmlPath3
        this.assert.contains(valuePathResults, xmlPath3.get('srcPath'));

        //  But not the structure path results for xmlPath3 (we created no
        //  new structure there).
        this.refute.contains(structurePathResults, xmlPath3.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change along a single attribute path with creation', function(test, options) {

        xmlPath4 = TP.apc('/emp/age/@valid');
        xmlPath4.set('shouldMake', true);

        xmlPath4.executeSet(modelObj, false, true);

        //  The value path should have the path for xmlPath4
        this.assert.contains(valuePathResults, xmlPath4.get('srcPath'));

        //  And the structure path results for xmlPath4 (we created new
        //  structure there).
        this.assert.contains(structurePathResults, xmlPath4.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change along a branching path', function(test, options) {

        xmlPath5 = TP.apc('/emp/fname');
        xmlPath5.set('shouldMake', true);

        xmlPath5.executeSet(modelObj, 'Scott', true);

        //  The value path should have the path for xmlPath5
        this.assert.contains(valuePathResults, xmlPath5.get('srcPath'));

        //  And the structure path results for xmlPath5 (we created new
        //  structure there).
        this.assert.contains(structurePathResults, xmlPath5.get('srcPath'));

        //  But *not* for xmlPath2 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, xmlPath2.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change along another branching path', function(test, options) {

        xmlPath6 = TP.apc('/emp/ssn');
        xmlPath6.set('shouldMake', true);

        xmlPath6.executeSet(modelObj, '555-55-5555', true);

        //  The value path should have the path for xmlPath6
        this.assert.contains(valuePathResults, xmlPath6.get('srcPath'));

        //  And the structure path results for xmlPath6 (we created new
        //  structure there).
        this.assert.contains(structurePathResults, xmlPath6.get('srcPath'));

        //  But *not* for xmlPath5 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, xmlPath5.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath5.get('srcPath'));

        //  And *not* for xmlPath2 (it's at a similar level in the chain, but on
        //  a different branch)
        this.refute.contains(valuePathResults, xmlPath2.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  And *not* for xmlPath1 (it's too high up in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change at the top level', function(test, options) {

        xmlPath1.set('shouldMake', true);

        //  Set everything under '/emp' to a new data structure
        xmlPath1.executeSet(modelObj, TP.elem('<lname>Edney</lname>'), true);

        //  All paths will have changed

        //  Both results should have the path for xmlPath6
        this.assert.contains(valuePathResults, xmlPath6.get('srcPath'));
        this.assert.contains(structurePathResults, xmlPath6.get('srcPath'));

        //  And for xmlPath5 (because it's ancestor's structure changed)
        this.assert.contains(valuePathResults, xmlPath5.get('srcPath'));
        this.assert.contains(structurePathResults, xmlPath5.get('srcPath'));

        //  And for xmlPath2 (because it's ancestor's structure changed)
        this.assert.contains(valuePathResults, xmlPath2.get('srcPath'));
        this.assert.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  And for xmlPath1 (because it's the same path as xmlPath1)
        this.assert.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.assert.contains(structurePathResults, xmlPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.it('change all of the elements individually', function(test, options) {

        //  Set up this path just to observe
        xmlPath7 = TP.apc('//*');
        xmlPath7.executeGet(modelObj);

        //  But set using xmlPath5
        xmlPath5.executeSet(modelObj, 'Scott', true);

        //  Both results should have the path for xmlPath7 (it's for all
        //  elements)
        this.assert.contains(valuePathResults, xmlPath7.get('srcPath'));
        this.assert.contains(structurePathResults, xmlPath7.get('srcPath'));

        //  But *not* for xmlPath6 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, xmlPath6.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath6.get('srcPath'));

        //  Both results should have the path for xmlPath5 (we created new
        //  structure there).
        this.assert.contains(valuePathResults, xmlPath5.get('srcPath'));
        this.assert.contains(structurePathResults, xmlPath5.get('srcPath'));

        //  But *not* for xmlPath2 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, xmlPath2.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));

        valuePathResults.empty();
        structurePathResults.empty();
    });

    this.after(function() {
        xmlValueObsFunction.ignore(modelObj, 'ValueChange');
        xmlStructureObsFunction.ignore(modelObj, 'StructureChange');
    });
});

//  ------------------------------------------------------------------------

TP.lang.Object.Type.describe('Type level aspect change notification',
function() {

    this.before(function() {

        TP.lang.Object.defineSubtype('test.SimpleEmployee');

        TP.test.SimpleEmployee.Inst.defineAttribute('firstName');
        TP.test.SimpleEmployee.Inst.defineAttribute('lastName');

        //  ---

        TP.lang.Object.defineSubtype('test.ComplexPathEmployee');

        TP.test.ComplexPathEmployee.Inst.defineAttribute('data');

        //  These paths assume a root instance property of 'data'
        TP.test.ComplexPathEmployee.Inst.defineAttribute(
                'lastName', {'value': TP.apc('data.public_info.lastName')});
        TP.test.ComplexPathEmployee.Inst.defineAttribute(
                'firstName', {'value': TP.apc('data.public_info.firstName')});

        //  ---

        TP.core.XMLDocumentNode.defineSubtype('test.XPathPathEmployee');

        //  These paths assume a chunk of XML has been set on the native node.
        TP.test.XPathPathEmployee.Inst.defineAttribute(
                'lastName', {'value': TP.apc('//emp/lname')});
        TP.test.XPathPathEmployee.Inst.defineAttribute(
                'firstName', {'value': TP.apc('//emp/fname')});
    });

    this.it('Type defined aspect change notification', function(test, options) {

        var aspectChangedResults,
            valueChangedResults,
            aspectObsFunction,

            newEmployee;

        aspectChangedResults = TP.ac();
        valueChangedResults = TP.ac();

        aspectObsFunction =
                function (aSignal) {
                    aspectChangedResults.push(aSignal.at('aspect'));
                    valueChangedResults.push(aSignal.getValue());
            };

        newEmployee = TP.test.SimpleEmployee.construct();
        aspectObsFunction.observe(newEmployee, 'FirstNameChange');
        aspectObsFunction.observe(newEmployee, 'LastNameChange');

        newEmployee.set('firstName', 'Bill');

        //  This should contain firstName, because we just changed it.
        this.assert.contains(aspectChangedResults, 'firstName');

        //  And the value should be 'Bill'
        this.assert.contains(valueChangedResults, 'Bill');

        //  But not lastName, because we didn't change it.
        this.refute.contains(aspectChangedResults, 'lastName');

        newEmployee.set('lastName', 'Edney');

        //  And now it should contain lastName, because we just changed it.
        this.assert.contains(aspectChangedResults, 'lastName');

        //  And the value should be 'Edney'
        this.assert.contains(valueChangedResults, 'Edney');

        aspectObsFunction.ignore(newEmployee, 'FirstNameChange');
        aspectObsFunction.ignore(newEmployee, 'LastNameChange');
    });

    this.it('TP.core.ComplexPath path-enhanced aspect change notification', function(test, options) {

        var aspectChangedResults,
            valueChangedResults,
            aspectObsFunction,

            newEmployee;

        aspectChangedResults = TP.ac();
        valueChangedResults = TP.ac();

        aspectObsFunction =
                function (aSignal) {
                    aspectChangedResults.push(aSignal.at('aspect'));
                    valueChangedResults.push(aSignal.getValue());
            };

        newEmployee = TP.test.ComplexPathEmployee.construct();
        newEmployee.set('data',
                TP.json2js('{"public_info":{"lastName":"", "firstName":""}}'));

        aspectObsFunction.observe(newEmployee, 'FirstNameChange');
        aspectObsFunction.observe(newEmployee, 'LastNameChange');

        newEmployee.set('firstName', 'Bill');

        //  This should contain firstName, because we just changed it.
        this.assert.contains(aspectChangedResults, 'firstName');

        //  And the value should be 'Bill'
        this.assert.contains(valueChangedResults, 'Bill');

        //  But not lastName, because we didn't change it.
        this.refute.contains(aspectChangedResults, 'lastName');

        newEmployee.set('lastName', 'Edney');

        //  And now it should contain lastName, because we just changed it.
        this.assert.contains(aspectChangedResults, 'lastName');

        //  And the value should be 'Edney'
        this.assert.contains(valueChangedResults, 'Edney');

        aspectObsFunction.ignore(newEmployee, 'FirstNameChange');
        aspectObsFunction.ignore(newEmployee, 'LastNameChange');
    });

    this.it('TP.core.XPathPath path-enhanced aspect change notification', function(test, options) {

        var aspectChangedResults,
            valueChangedResults,
            aspectObsFunction,

            newEmployee;

        aspectChangedResults = TP.ac();
        valueChangedResults = TP.ac();

        aspectObsFunction =
                function (aSignal) {
                    aspectChangedResults.push(aSignal.at('aspect'));
                    valueChangedResults.push(
                        aSignal.getValue().first().getTextContent());
            };

        newEmployee = TP.test.XPathPathEmployee.construct(
                        TP.doc('<emp><lname></lname><fname></fname></emp>'));

        aspectObsFunction.observe(newEmployee, 'FirstNameChange');
        aspectObsFunction.observe(newEmployee, 'LastNameChange');

        newEmployee.set('firstName', 'Bill');

        //  This should contain firstName, because we just changed it.
        this.assert.contains(aspectChangedResults, 'firstName');

        //  And the value should be 'Bill'
        this.assert.contains(valueChangedResults, 'Bill');

        //  But not lastName, because we didn't change it.
        this.refute.contains(aspectChangedResults, 'lastName');

        newEmployee.set('lastName', 'Edney');

        //  And now it should contain lastName, because we just changed it.
        this.assert.contains(aspectChangedResults, 'lastName');

        //  And the value should be 'Edney'
        this.assert.contains(valueChangedResults, 'Edney');

        aspectObsFunction.ignore(newEmployee, 'FirstNameChange');
        aspectObsFunction.ignore(newEmployee, 'LastNameChange');
    });
});

//  ------------------------------------------------------------------------

TP.lang.Object.Type.describe('Object level binding',
function() {

    this.it('change notification - concrete reference, simple aspect', function(test, options) {

        var modelObj,
            observerObj,

            handlerFunc;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('salary');

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        TP.observe(
            modelObj,
            'SalaryChange',
            handlerFunc = function (aSignal) {

                var newValue;

                test.assert.isIdenticalTo(aSignal.getTarget(), modelObj);
                test.assert.isEqualTo(aSignal.getAspect(), 'salary');
                test.assert.isEqualTo(aSignal.getAction(), TP.UPDATE);

                newValue = aSignal.getValue();
                test.assert.isEqualTo(newValue, 42);

                observerObj.set('salary', newValue);
            });

        modelObj.set('salary', 42);

        this.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        TP.ignore(modelObj, 'SalaryChange', handlerFunc);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });

    this.it('change notification - virtual reference, simple aspect', function(test, options) {

        var modelObj,
            observerObj,

            handlerFunc;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('salary');

        //  This sets the ID of the object and registers it with an accompanying
        //  'urn:tibet' URN (which will allow the 'observe()' call to turn change
        //  handling on for it).
        modelObj.setID('CurrentEmployee');
        TP.sys.registerObject(modelObj);

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        TP.observe(
            'CurrentEmployee',
            'SalaryChange',
            handlerFunc = function (aSignal) {

                var newValue;

                test.assert.isIdenticalTo(aSignal.getTarget(), modelObj);
                test.assert.isEqualTo(aSignal.getAspect(), 'salary');
                test.assert.isEqualTo(aSignal.getAction(), TP.UPDATE);

                newValue = aSignal.getValue();
                test.assert.isEqualTo(newValue, 42);

                observerObj.set('salary', newValue);
            });

        modelObj.set('salary', 42);

        this.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        TP.ignore('CurrentEmployee', 'SalaryChange', handlerFunc);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });

    this.it('change notification - URI reference, simple aspect', function(test, options) {

        var modelObj,
            modelURI,
            observerObj,

            handlerFunc;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('salary');

        modelURI = TP.uc('urn:tibet:testdata');
        //  This automatically sets the ID of modelObj to 'urn:tibet:testdata'
        //  because it didn't have an existing ID and was assigned as the
        //  resource to the URI defined above.
        modelURI.setResource(modelObj);

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        TP.observe(
            modelURI,
            'SalaryChange',
            handlerFunc = function (aSignal) {

                var newValue;

                test.assert.isIdenticalTo(aSignal.getTarget(), modelObj);
                test.assert.isEqualTo(aSignal.getAspect(), 'salary');
                test.assert.isEqualTo(aSignal.getAction(), TP.UPDATE);

                newValue = aSignal.getValue();
                test.assert.isEqualTo(newValue, 42);

                observerObj.set('salary', newValue);
            });

        modelObj.set('salary', 42);

        this.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        TP.ignore(modelURI, 'SalaryChange', handlerFunc);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });

    this.it('using defineBinding() - concrete reference, same simple aspect', function(test, options) {

        var modelObj,
            observerObj;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('salary');

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        observerObj.defineBinding('salary', modelObj);

        //  Set the value of 'salary' on the model object. The binding should
        //  cause the value of 'salary' on the observer to update
        modelObj.set('salary', 42);

        this.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', modelObj);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });

    this.it('using defineBinding() - virtual reference, same simple aspect', function(test, options) {

        var modelObj,
            observerObj;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('salary');

        //  This sets the ID of the object and registers it with an accompanying
        //  'urn:tibet' URN (which will allow the 'defineBinding()' call to turn
        //  change handling on for it).
        modelObj.setID('CurrentEmployee');
        TP.sys.registerObject(modelObj);

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        observerObj.defineBinding('salary', 'CurrentEmployee');

        //  Set the value of 'salary' on the model object. The binding should
        //  cause the value of 'salary' on the observer to update
        modelObj.set('salary', 42);

        this.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', 'CurrentEmployee');

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });

    this.it('using defineBinding() - URI reference, same simple aspect', function(test, options) {

        var modelObj,
            modelURI,
            observerObj;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('salary');

        modelURI = TP.uc('urn:tibet:testdata');
        //  This automatically sets the ID of modelObj to 'urn:tibet:testdata'
        //  because it didn't have an existing ID and was assigned as the
        //  resource to the URI defined above.
        modelURI.setResource(modelObj);

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        observerObj.defineBinding('salary', modelURI);

        //  Set the value of 'salary' on the model object. The binding should
        //  cause the value of 'salary' on the observer to update
        modelObj.set('salary', 42);

        this.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', modelURI);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });

    this.it('using defineBinding() - concrete reference, different simple aspect', function(test, options) {

        var modelObj,
            observerObj;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('averageSalary');

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        observerObj.defineBinding('salary', modelObj, 'averageSalary');

        //  Set the value of 'salary' on the model object. The binding should
        //  cause the value of 'salary' on the observer to update
        modelObj.set('averageSalary', 42);

        this.assert.isEqualTo(
                    modelObj.get('averageSalary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', modelObj, 'averageSalary');

        modelObj.set('averageSalary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });

    this.it('using defineBinding() - virtual reference, different simple aspect', function(test, options) {

        var modelObj,
            observerObj;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('averageSalary');

        //  This sets the ID of the object and registers it with an accompanying
        //  'urn:tibet' URN (which will allow the 'defineBinding()' call to turn
        //  change handling on for it).
        modelObj.setID('CurrentEmployee');
        TP.sys.registerObject(modelObj);

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        observerObj.defineBinding('salary', 'CurrentEmployee', 'averageSalary');

        //  Set the value of 'salary' on the model object. The binding should
        //  cause the value of 'salary' on the observer to update
        modelObj.set('averageSalary', 42);

        this.assert.isEqualTo(
                    modelObj.get('averageSalary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', 'CurrentEmployee', 'averageSalary');

        modelObj.set('averageSalary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });

    this.it('using defineBinding() - URI reference, different simple aspect', function(test, options) {

        var modelObj,
            modelURI,
            observerObj;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('averageSalary');

        modelURI = TP.uc('urn:tibet:testdata');
        //  This automatically sets the ID of modelObj to 'urn:tibet:testdata'
        //  because it didn't have an existing ID and was assigned as the
        //  resource to the URI defined above.
        modelURI.setResource(modelObj);

        observerObj = TP.lang.Object.construct();
        observerObj.defineAttribute('salary');

        observerObj.defineBinding('salary', modelURI, 'averageSalary');

        //  Set the value of 'salary' on the model object. The binding should
        //  cause the value of 'salary' on the observer to update
        modelObj.set('averageSalary', 42);

        this.assert.isEqualTo(
                    modelObj.get('averageSalary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', modelURI, 'averageSalary');

        modelObj.set('averageSalary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        this.assert.isEqualTo(
                    42,
                    observerObj.get('salary'));
    });
});

//  ------------------------------------------------------------------------

TP.lang.Object.Type.describe('Markup level binding',
function() {

    var loadURI,
        unloadURI;

    loadURI = TP.uc('~lib_tst/src/tibet/databinding/Observation1.xhtml');
    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

    this.it('change notification - concrete reference, simple aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.lang.Object.construct();
                modelObj.defineAttribute('salary');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', modelObj, 'salary');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'value' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding('value', modelObj, 'salary');

                modelObj.set('salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - virtual reference, simple aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.lang.Object.construct();
                modelObj.defineAttribute('salary');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');
                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', 'CurrentEmployee', 'salary');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'value' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding(
                                'value', 'CurrentEmployee', 'salary');

                modelObj.set('salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - URI reference, simple aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    modelURI,
                    salaryField;

                modelObj = TP.lang.Object.construct();
                modelObj.defineAttribute('salary');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', modelURI, 'salary');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'value' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding('value', modelURI, 'salary');

                modelObj.set('salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - concrete reference, simple aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.lang.Object.construct();
                modelObj.defineAttribute('salary');
                modelObj.defineAttribute('salaryValid');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', modelObj, 'salary');
                salaryField.defineBinding('@valid', modelObj, 'salaryValid');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('salaryValid', true);

                test.assert.isEqualTo(
                            modelObj.get('salaryValid'),
                            salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value', modelObj, 'salary');
                salaryField.destroyBinding('@valid', modelObj, 'salaryValid');

                modelObj.set('salary', 45);
                modelObj.set('salaryValid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - virtual reference, simple aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.lang.Object.construct();
                modelObj.defineAttribute('salary');
                modelObj.defineAttribute('salaryValid');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');
                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', 'CurrentEmployee', 'salary');
                salaryField.defineBinding('@valid', 'CurrentEmployee', 'salaryValid');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('salaryValid', true);

                test.assert.isEqualTo(
                            modelObj.get('salaryValid'),
                            salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value', 'CurrentEmployee', 'salary');
                salaryField.destroyBinding('@valid', 'CurrentEmployee', 'salaryValid');

                modelObj.set('salary', 45);
                modelObj.set('salaryValid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - URI reference, simple aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    modelURI,
                    salaryField;

                modelObj = TP.lang.Object.construct();
                modelObj.defineAttribute('salary');
                modelObj.defineAttribute('salaryValid');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', modelURI, 'salary');
                salaryField.defineBinding('@valid', modelURI, 'salaryValid');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('salaryValid', true);

                test.assert.isEqualTo(
                            modelObj.get('salaryValid'),
                            salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value', modelURI, 'salary');
                salaryField.destroyBinding('@valid', modelURI, 'salaryValid');

                modelObj.set('salary', 45);
                modelObj.set('salaryValid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - concrete reference, TIBET path aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,

                    salaryField;

                modelObj = TP.json2js('{"emp":{"salary":50000}}');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelObj,
                                            TP.apc('emp.salary'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelObj,
                                            TP.apc('emp.salary'));

                modelObj.set('emp.salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - virtual reference, TIBET path aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.json2js('{"emp":{"salary":50000}}');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');
                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('emp.salary'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'value' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('emp.salary'));

                modelObj.set('emp.salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - URI reference, TIBET path aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    modelURI,
                    salaryField;

                modelObj = TP.json2js('{"emp":{"salary":50000}}');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelURI,
                                            TP.apc('emp.salary'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'value' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelURI,
                                            TP.apc('emp.salary'));

                modelObj.set('emp.salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - concrete reference, TIBET path aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.json2js(
                                '{"emp":{"salary":50000,"salaryValid":null}}');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelObj,
                                            TP.apc('emp.salary'));

                salaryField.defineBinding('@valid',
                                            modelObj,
                                            TP.apc('emp.salaryValid'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('emp.salaryValid', true);

                test.assert.isEqualTo(
                            modelObj.get('emp.salaryValid'),
                            salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelObj,
                                            TP.apc('emp.salary'));
                salaryField.destroyBinding('@valid',
                                            modelObj,
                                            TP.apc('emp.salaryValid'));

                modelObj.set('emp.salary', 45);
                modelObj.set('emp.salaryValid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - virtual reference, TIBET path aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.json2js(
                                '{"emp":{"salary":50000,"salaryValid":null}}');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');
                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('emp.salary'));

                salaryField.defineBinding('@valid',
                                            'CurrentEmployee',
                                            TP.apc('emp.salaryValid'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('emp.salaryValid', true);

                test.assert.isEqualTo(
                            modelObj.get('emp.salaryValid'),
                            salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('emp.salary'));
                salaryField.destroyBinding('@valid',
                                            'CurrentEmployee',
                                            TP.apc('emp.salaryValid'));

                modelObj.set('emp.salary', 45);
                modelObj.set('emp.salaryValid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - URI reference, TIBET path aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    modelURI,
                    salaryField;

                modelObj = TP.json2js(
                                '{"emp":{"salary":50000,"salaryValid":null}}');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelURI,
                                            TP.apc('emp.salary'));

                salaryField.defineBinding('@valid',
                                            modelURI,
                                            TP.apc('emp.salaryValid'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('emp.salaryValid', true);

                test.assert.isEqualTo(
                            modelObj.get('emp.salaryValid'),
                            salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelURI,
                                            TP.apc('emp.salary'));
                salaryField.destroyBinding('@valid',
                                            modelURI,
                                            TP.apc('emp.salaryValid'));

                modelObj.set('emp.salary', 45);
                modelObj.set('emp.salaryValid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - concrete reference, XML path aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,

                    salaryField;

                modelObj = TP.tpdoc('<emp><salary>50000</salary></emp>');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelObj,
                                            TP.apc('/emp/salary'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelObj,
                                            TP.apc('/emp/salary'));

                modelObj.set('/emp/salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - virtual reference, XML path aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.tpdoc('<emp><salary>50000</salary></emp>');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');

                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'value' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary'));

                modelObj.set('/emp/salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - URI reference, XML path aspect', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    modelURI,
                    salaryField;

                modelObj = TP.tpdoc('<emp><salary>50000</salary></emp>');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelURI,
                                            TP.apc('/emp/salary'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'value' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelURI,
                                            TP.apc('/emp/salary'));

                modelObj.set('/emp/salary', 45);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - concrete reference, XML path aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.tpdoc('<emp><salary valid="">50000</salary></emp>');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelObj,
                                            TP.apc('/emp/salary'));

                salaryField.defineBinding('@valid',
                                            modelObj,
                                            TP.apc('/emp/salary/@valid'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('/emp/salary/@valid', true);

                test.assert.isEqualTo(
                        TP.val(modelObj.get('/emp/salary/@valid')).asBoolean(),
                        salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelObj,
                                            TP.apc('/emp/salary'));
                salaryField.destroyBinding('@valid',
                                            modelObj,
                                            TP.apc('/emp/salary/@valid'));

                modelObj.set('/emp/salary', 45);
                modelObj.set('/emp/salary/@valid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - virtual reference, XML path aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    salaryField;

                modelObj = TP.tpdoc('<emp><salary valid="">50000</salary></emp>');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');
                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary'));

                salaryField.defineBinding('@valid',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary/@valid'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('/emp/salary/@valid', true);

                test.assert.isEqualTo(
                        TP.val(modelObj.get('/emp/salary/@valid')).asBoolean(),
                        salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary'));
                salaryField.destroyBinding('@valid',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary/@valid'));

                modelObj.set('/emp/salary', 45);
                modelObj.set('/emp/salary/@valid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });

    this.it('change notification - URI reference, XML path aspect with attributes', function(test, options) {

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    modelURI,
                    salaryField;

                modelObj = TP.tpdoc('<emp><salary valid="">50000</salary></emp>');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelURI,
                                            TP.apc('/emp/salary'));

                salaryField.defineBinding('@valid',
                                            modelURI,
                                            TP.apc('/emp/salary/@valid'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryValid' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('/emp/salary/@valid', true);

                test.assert.isEqualTo(
                        TP.val(modelObj.get('/emp/salary/@valid')).asBoolean(),
                        salaryField.get('@valid').asBoolean());

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelURI,
                                            TP.apc('/emp/salary'));
                salaryField.destroyBinding('@valid',
                                            modelURI,
                                            TP.apc('/emp/salary/@valid'));

                modelObj.set('/emp/salary', 45);
                modelObj.set('/emp/salary/@valid', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@valid').asBoolean());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            });
    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.ComplexTIBETPath.Inst.runTestSuites();
TP.core.XPathPath.Inst.runTestSuites();
TP.lang.Object.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
