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
        objValueObsFunction,
        objStructureObsFunction,

        valuePathResults,
        structurePathResults,

        objPath1,
        objPath2,
        objPath3,
        objPath4,
        objPath5,
        objPath6,
        objPath7;

    //  ---

    this.before(function() {
        modelObj = TP.json2js('{"foo":["1st","2nd",{"hi":"there"}]}');

        valuePathResults = TP.ac();
        structurePathResults = TP.ac();

        objValueObsFunction =
                function(aSignal) {
                    valuePathResults.push(aSignal.at('aspect'));
                };

        objValueObsFunction.observe(modelObj, 'ValueChange');

        objStructureObsFunction =
                function(aSignal) {
                    structurePathResults.push(aSignal.at('aspect'));
                };

        objStructureObsFunction.observe(modelObj, 'StructureChange');

        //  Set up this path just to observe
        objPath1 = TP.apc('foo');
        objPath1.executeGet(modelObj);
    });

    //  ---

    this.afterEach(function() {
        valuePathResults.empty();
        structurePathResults.empty();
    });

    //  ---

    this.after(function() {
        objValueObsFunction.ignore(modelObj, 'ValueChange');
        objStructureObsFunction.ignore(modelObj, 'StructureChange');
    });

    //  ---

    this.it('change along a single path', function(test, options) {

        objPath2 = TP.apc('foo.3.bar');
        objPath2.set('shouldMakeStructures', true);

        objPath2.executeSet(modelObj, 'goo', true);

        //  The value path results should have the path for objPath2
        test.assert.contains(valuePathResults, objPath2.get('srcPath'));

        //  The structure path results should have the path for objPath2
        test.assert.contains(structurePathResults, objPath2.get('srcPath'));

        //  But *not* for objPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, objPath1.get('srcPath'));
        this.refute.contains(structurePathResults, objPath1.get('srcPath'));
    });

    this.it('change along a branching path', function(test, options) {

        objPath3 = TP.apc('foo.3[bar,moo,too].roo');
        objPath3.set('shouldMakeStructures', true);

        objPath3.executeSet(modelObj, TP.ac(), true);

        //  The value path results should have the path for objPath3
        test.assert.contains(valuePathResults, objPath3.get('srcPath'));

        //  The structure path results should have the path for objPath3
        test.assert.contains(structurePathResults, objPath3.get('srcPath'));

        //  And the value path results for objPath2 (because we replaced the
        //  value at 'foo.3.bar' with an Object to hold the 'roo' value)
        test.assert.contains(valuePathResults, objPath2.get('srcPath'));

        //  But not the structure path results for objPath2 (we created no new
        //  structure there).
        this.refute.contains(structurePathResults, objPath2.get('srcPath'));

        //  And *not* for objPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, objPath1.get('srcPath'));
        this.refute.contains(structurePathResults, objPath1.get('srcPath'));
    });

    this.it('change of an end aspect of a branching path', function(test, options) {

        objPath4 = TP.apc('foo.3.bar.roo');
        objPath4.executeGet(modelObj);

        objPath5 = TP.apc('foo.3.moo.roo');

        objPath5.executeSet(modelObj, 42, true);

        //  The value path results should have the path for objPath5
        test.assert.contains(valuePathResults, objPath5.get('srcPath'));

        //  And the structure path results should have the path for objPath5
        test.assert.contains(structurePathResults, objPath5.get('srcPath'));

        //  And *not* for objPath4 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, objPath4.get('srcPath'));
        this.refute.contains(structurePathResults, objPath4.get('srcPath'));

        //  The value path results should have the path for objPath3
        test.assert.contains(valuePathResults, objPath3.get('srcPath'));

        //  And the structure path results should have the path for objPath3
        test.assert.contains(structurePathResults, objPath3.get('srcPath'));

        //  And *not* for objPath2 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, objPath2.get('srcPath'));
        this.refute.contains(structurePathResults, objPath2.get('srcPath'));

        //  And *not* for objPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, objPath1.get('srcPath'));
        this.refute.contains(structurePathResults, objPath1.get('srcPath'));
    });

    this.it('change of a parent aspect of a branching path', function(test, options) {

        objPath6 = TP.apc('foo.3');

        objPath6.executeSet(modelObj, 'fluffy', true);

        //  The value path results should have the path for objPath6
        test.assert.contains(valuePathResults, objPath6.get('srcPath'));

        //  And the structure path results should have the path for objPath6 as
        //  well (structure was changed).
        test.assert.contains(structurePathResults, objPath6.get('srcPath'));

        //  And for objPath5 (because it's ancestor's structure changed)
        test.assert.contains(valuePathResults, objPath5.get('srcPath'));

        //  And the structure path results should have the path for objPath5 as
        //  well (structure was changed).
        test.assert.contains(structurePathResults, objPath5.get('srcPath'));

        //  And for objPath4 (because it's ancestor's structure changed)
        test.assert.contains(valuePathResults, objPath4.get('srcPath'));

        //  And the structure path results should have the path for objPath4 as
        //  well (structure was changed).
        test.assert.contains(structurePathResults, objPath4.get('srcPath'));

        //  And for objPath3 (because it's ancestor's structure changed)
        test.assert.contains(valuePathResults, objPath3.get('srcPath'));

        //  And the structure path results should have the path for objPath3 as
        //  well (structure was changed).
        test.assert.contains(structurePathResults, objPath3.get('srcPath'));

        //  And for objPath2 (because it's ancestor's structure changed)
        test.assert.contains(valuePathResults, objPath2.get('srcPath'));

        //  And the structure path results should have the path for objPath2 as
        //  well (structure was changed).
        test.assert.contains(structurePathResults, objPath2.get('srcPath'));

        //  And *not* for objPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, objPath1.get('srcPath'));
        this.refute.contains(structurePathResults, objPath1.get('srcPath'));
    });

    this.it('change of another parent aspect of a branching path', function(test, options) {

        objPath7 = TP.apc('foo.2');
        objPath7.set('shouldMakeStructures', true);

        objPath7.executeSet(modelObj, TP.ac(), true);

        //  The value path results should have the path for objPath7
        test.assert.contains(valuePathResults, objPath7.get('srcPath'));

        //  And the structure path results should have the path for objPath7
        test.assert.contains(structurePathResults, objPath7.get('srcPath'));

        //  But *not* for objPath6 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, objPath6.get('srcPath'));
        this.refute.contains(structurePathResults, objPath6.get('srcPath'));

        //  And *not* for objPath5 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, objPath5.get('srcPath'));
        this.refute.contains(structurePathResults, objPath5.get('srcPath'));

        //  And *not* for objPath4 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, objPath4.get('srcPath'));
        this.refute.contains(structurePathResults, objPath4.get('srcPath'));

        //  And *not* for objPath3 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, objPath3.get('srcPath'));
        this.refute.contains(structurePathResults, objPath3.get('srcPath'));

        //  And *not* for objPath2 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, objPath2.get('srcPath'));
        this.refute.contains(structurePathResults, objPath2.get('srcPath'));

        //  And *not* for objPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, objPath1.get('srcPath'));
        this.refute.contains(structurePathResults, objPath1.get('srcPath'));
    });

    this.it('change model to a whole new object', function(test, options) {
        objPath1.set('shouldMakeStructures', true);

        //  Set everything under 'foo' to a new data structure
        objPath1.executeSet(modelObj, TP.json2js('["A","B","C","D"]'), true);

        //  All paths will have changed

        //  Both results should have the path for objPath7
        test.assert.contains(valuePathResults, objPath7.get('srcPath'));
        test.assert.contains(structurePathResults, objPath7.get('srcPath'));

        //  And for objPath6
        test.assert.contains(valuePathResults, objPath6.get('srcPath'));
        test.assert.contains(structurePathResults, objPath6.get('srcPath'));

        //  And for objPath5
        test.assert.contains(valuePathResults, objPath5.get('srcPath'));
        test.assert.contains(structurePathResults, objPath5.get('srcPath'));

        //  And for objPath4
        test.assert.contains(valuePathResults, objPath4.get('srcPath'));
        test.assert.contains(structurePathResults, objPath4.get('srcPath'));

        //  And for objPath3
        test.assert.contains(valuePathResults, objPath3.get('srcPath'));
        test.assert.contains(structurePathResults, objPath3.get('srcPath'));

        //  And for objPath2
        test.assert.contains(valuePathResults, objPath2.get('srcPath'));
        test.assert.contains(structurePathResults, objPath2.get('srcPath'));

        //  And for objPath1
        test.assert.contains(valuePathResults, objPath1.get('srcPath'));
        test.assert.contains(structurePathResults, objPath1.get('srcPath'));
    });

    this.it('change along a single path for the new object', function(test, options) {
        objPath6.executeSet(modelObj, 'fluffy', true);

        //  The path has should *not* have the path for objPath7 (it's at a
        //  similar level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, objPath7.get('srcPath'));

        //  The value path results should have the path for objPath6
        test.assert.contains(valuePathResults, objPath6.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, objPath6.get('srcPath'));

        //  And for objPath5
        test.assert.contains(valuePathResults, objPath5.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, objPath5.get('srcPath'));

        //  And for objPath4
        test.assert.contains(valuePathResults, objPath4.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, objPath4.get('srcPath'));

        //  And for objPath3
        test.assert.contains(valuePathResults, objPath3.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, objPath3.get('srcPath'));

        //  And for objPath2
        test.assert.contains(valuePathResults, objPath2.get('srcPath'));

        //  But not for the structural path result
        this.refute.contains(structurePathResults, objPath2.get('srcPath'));

        //  And *not* for objPath1 (it's too high up in the chain)
        this.refute.contains(valuePathResults, objPath1.get('srcPath'));

        //  And not for the structural path result
        this.refute.contains(structurePathResults, objPath1.get('srcPath'));
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
        xmlPath7,
        xmlPath8;

    //  ---

    this.before(function() {
        modelObj = TP.tpdoc('<emp><lname valid="true">Edney</lname><age>47</age></emp>');

        valuePathResults = TP.ac();
        structurePathResults = TP.ac();

        xmlValueObsFunction =
                function(aSignal) {
                    valuePathResults.push(aSignal.at('aspect'));
                };

        xmlValueObsFunction.observe(modelObj, 'ValueChange');

        xmlStructureObsFunction =
                function(aSignal) {
                    structurePathResults.push(aSignal.at('aspect'));
                };

        xmlStructureObsFunction.observe(modelObj, 'StructureChange');

        //  Set up this path just to observe
        xmlPath1 = TP.apc('/emp');
        xmlPath1.executeGet(modelObj);
    });

    //  ---

    this.afterEach(function() {
        valuePathResults.empty();
        structurePathResults.empty();
    });

    //  ---

    this.after(function() {
        xmlValueObsFunction.ignore(modelObj, 'ValueChange');
        xmlStructureObsFunction.ignore(modelObj, 'StructureChange');
    });

    //  ---

    this.it('change along a single path', function(test, options) {

        xmlPath2 = TP.apc('/emp/lname');
        xmlPath2.set('shouldMakeStructures', true);

        xmlPath2.executeSet(modelObj, 'Shattuck', true);

        //  The value path should have the path for xmlPath2
        test.assert.contains(valuePathResults, xmlPath2.get('srcPath'));

        //  But not the structure path results for xmlPath2 (we created no new
        //  structure there).
        this.refute.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));
    });

    this.it('change along a single attribute path', function(test, options) {

        xmlPath3 = TP.apc('/emp/lname/@valid');
        xmlPath3.set('shouldMakeStructures', true);

        xmlPath3.executeSet(modelObj, false, true);

        //  The value path should have the path for xmlPath3
        test.assert.contains(valuePathResults, xmlPath3.get('srcPath'));

        //  But not the structure path results for xmlPath3 (we created no
        //  new structure there).
        this.refute.contains(structurePathResults, xmlPath3.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));
    });

    this.it('change along a single attribute path with creation', function(test, options) {

        xmlPath4 = TP.apc('/emp/age/@valid');
        xmlPath4.set('shouldMakeStructures', true);

        xmlPath4.executeSet(modelObj, false, true);

        //  The value path should have the path for xmlPath4
        test.assert.contains(valuePathResults, xmlPath4.get('srcPath'));

        //  And the structure path results for xmlPath4 (we created new
        //  structure there).
        test.assert.contains(structurePathResults, xmlPath4.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));
    });

    this.it('change along a branching path', function(test, options) {

        xmlPath5 = TP.apc('/emp/fname');
        xmlPath5.set('shouldMakeStructures', true);

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

        //  But *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));
    });

    this.it('change (structural) along a branching path', function(test, options) {

        xmlPath6 = TP.apc('/emp/lname/alias');
        xmlPath6.set('shouldMakeStructures', true);

        xmlPath6.executeSet(modelObj, 'Smith', true);

        //  The value path should have the path for xmlPath6
        test.assert.contains(valuePathResults, xmlPath6.get('srcPath'));

        //  And the structure path results for xmlPath6 (we created new
        //  structure there).
        test.assert.contains(structurePathResults, xmlPath6.get('srcPath'));

        //  But *not* for xmlPath5 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, xmlPath5.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath5.get('srcPath'));

        //  Both results should have the path for xmlPath2 (because we replaced
        //  the value at '/emp/lname' with an Element to hold the 'alias' value)
        this.assert.contains(valuePathResults, xmlPath2.get('srcPath'));
        this.assert.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  But *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));
    });

    this.it('change along another branching path', function(test, options) {

        xmlPath7 = TP.apc('/emp/ssn');
        xmlPath7.set('shouldMakeStructures', true);

        xmlPath7.executeSet(modelObj, '555-55-5555', true);

        //  The value path should have the path for xmlPath7
        test.assert.contains(valuePathResults, xmlPath7.get('srcPath'));

        //  And the structure path results for xmlPath7 (we created new
        //  structure there).
        test.assert.contains(structurePathResults, xmlPath7.get('srcPath'));

        //  But *not* for xmlPath6 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, xmlPath6.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath6.get('srcPath'));

        //  And *not* for xmlPath5 for either set of results (it's at a similar
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
    });

    this.it('change at the top level', function(test, options) {

        xmlPath1.set('shouldMakeStructures', true);

        //  Set everything under '/emp' to a new data structure
        xmlPath1.executeSet(modelObj, TP.elem('<lname>Edney</lname>'), true);

        //  All paths will have changed

        //  Both results should have the path for xmlPath7
        test.assert.contains(valuePathResults, xmlPath7.get('srcPath'));
        test.assert.contains(structurePathResults, xmlPath7.get('srcPath'));

        //  And for xmlPath6 (because it's ancestor's structure changed)
        test.assert.contains(valuePathResults, xmlPath6.get('srcPath'));
        test.assert.contains(structurePathResults, xmlPath6.get('srcPath'));

        //  And for xmlPath5 (because it's ancestor's structure changed)
        test.assert.contains(valuePathResults, xmlPath5.get('srcPath'));
        test.assert.contains(structurePathResults, xmlPath5.get('srcPath'));

        //  And for xmlPath2 (because it's ancestor's structure changed)
        test.assert.contains(valuePathResults, xmlPath2.get('srcPath'));
        test.assert.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  And for xmlPath1 (because it's the same path as xmlPath1)
        test.assert.contains(valuePathResults, xmlPath1.get('srcPath'));
        test.assert.contains(structurePathResults, xmlPath1.get('srcPath'));
    });

    this.it('change all of the elements individually', function(test, options) {

        //  Set up this path just to observe
        xmlPath8 = TP.apc('//*');
        xmlPath8.executeGet(modelObj);

        //  But set using xmlPath5
        xmlPath5.executeSet(modelObj, 'Spike', true);

        //  Both results should have the path for xmlPath8 (it's for all
        //  elements)
        test.assert.contains(valuePathResults, xmlPath8.get('srcPath'));
        test.assert.contains(structurePathResults, xmlPath8.get('srcPath'));

        //  But *not* for xmlPath7 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, xmlPath7.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath7.get('srcPath'));

        //  And *not* for xmlPath6 for either set of results (it's on a
        //  different branch)
        this.refute.contains(valuePathResults, xmlPath6.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath6.get('srcPath'));

        //  Both results should have the path for xmlPath5 (we created new
        //  structure there).
        test.assert.contains(valuePathResults, xmlPath5.get('srcPath'));
        test.assert.contains(structurePathResults, xmlPath5.get('srcPath'));

        //  But *not* for xmlPath2 for either set of results (it's at a similar
        //  level in the chain, but on a different branch)
        this.refute.contains(valuePathResults, xmlPath2.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath2.get('srcPath'));

        //  And *not* for xmlPath1 for either set of results (it's too high up
        //  in the chain)
        this.refute.contains(valuePathResults, xmlPath1.get('srcPath'));
        this.refute.contains(structurePathResults, xmlPath1.get('srcPath'));
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

        TP.test.ComplexPathEmployee.Inst.defineAttribute('privateData');

        //  These paths assume a root instance property of 'data'
        TP.test.ComplexPathEmployee.Inst.defineAttribute(
                'lastName',
                {value: TP.apc('privateData.public_info.lastName')});
        TP.test.ComplexPathEmployee.Inst.defineAttribute(
                'firstName',
                {value: TP.apc('privateData.public_info.firstName')});

        //  ---

        TP.core.XMLDocumentNode.defineSubtype('test.XPathPathEmployee');

        //  These paths assume a chunk of XML has been set on the native node.
        TP.test.XPathPathEmployee.Inst.defineAttribute(
                'lastName', {value: TP.apc('//emp/lname')});
        TP.test.XPathPathEmployee.Inst.defineAttribute(
                'firstName', {value: TP.apc('//emp/fname')});
    });

    this.it('Type defined aspect change notification', function(test, options) {

        var aspectChangedResults,
            valueChangedResults,
            aspectObsFunction,

            newEmployee;

        aspectChangedResults = TP.ac();
        valueChangedResults = TP.ac();

        aspectObsFunction =
                function(aSignal) {
                    aspectChangedResults.push(aSignal.at('aspect'));
                    valueChangedResults.push(aSignal.getValue());
                };

        newEmployee = TP.test.SimpleEmployee.construct();
        aspectObsFunction.observe(newEmployee, 'FirstNameChange');
        aspectObsFunction.observe(newEmployee, 'LastNameChange');

        newEmployee.set('firstName', 'Bill');

        //  This should contain firstName, because we just changed it.
        test.assert.contains(aspectChangedResults, 'firstName');

        //  And the value should be 'Bill'
        test.assert.contains(valueChangedResults, 'Bill');

        //  But not lastName, because we didn't change it.
        this.refute.contains(aspectChangedResults, 'lastName');

        newEmployee.set('lastName', 'Edney');

        //  And now it should contain lastName, because we just changed it.
        test.assert.contains(aspectChangedResults, 'lastName');

        //  And the value should be 'Edney'
        test.assert.contains(valueChangedResults, 'Edney');

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
                function(aSignal) {
                    aspectChangedResults.push(aSignal.at('aspect'));
                    valueChangedResults.push(aSignal.getValue());
                };

        newEmployee = TP.test.ComplexPathEmployee.construct();
        newEmployee.set('privateData',
                TP.json2js('{"public_info":{"lastName":"", "firstName":""}}'));

        aspectObsFunction.observe(newEmployee, 'FirstNameChange');
        aspectObsFunction.observe(newEmployee, 'LastNameChange');

        newEmployee.set('firstName', 'Bill');

        //  This should contain firstName, because we just changed it.
        test.assert.contains(aspectChangedResults, 'firstName');

        //  And the value should be 'Bill'
        test.assert.contains(valueChangedResults, 'Bill');

        //  But not lastName, because we didn't change it.
        this.refute.contains(aspectChangedResults, 'lastName');

        newEmployee.set('lastName', 'Edney');

        //  And now it should contain lastName, because we just changed it.
        test.assert.contains(aspectChangedResults, 'lastName');

        //  And the value should be 'Edney'
        test.assert.contains(valueChangedResults, 'Edney');

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
                function(aSignal) {
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
        test.assert.contains(aspectChangedResults, 'firstName');

        //  And the value should be 'Bill'
        test.assert.contains(valueChangedResults, 'Bill');

        //  But not lastName, because we didn't change it.
        this.refute.contains(aspectChangedResults, 'lastName');

        newEmployee.set('lastName', 'Edney');

        //  And now it should contain lastName, because we just changed it.
        test.assert.contains(aspectChangedResults, 'lastName');

        //  And the value should be 'Edney'
        test.assert.contains(valueChangedResults, 'Edney');

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
            handlerFunc = function(aSignal) {

                var newValue;

                test.assert.isIdenticalTo(aSignal.getTarget(), modelObj);
                test.assert.isEqualTo(aSignal.getAspect(), 'salary');
                test.assert.isEqualTo(aSignal.getAction(), TP.UPDATE);

                newValue = aSignal.getValue();
                test.assert.isEqualTo(newValue, 42);

                observerObj.set('salary', newValue);
            });

        modelObj.set('salary', 42);

        test.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        TP.ignore(modelObj, 'SalaryChange', handlerFunc);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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
            handlerFunc = function(aSignal) {

                var newValue;

                test.assert.isIdenticalTo(aSignal.getTarget(), modelObj);
                test.assert.isEqualTo(aSignal.getAspect(), 'salary');
                test.assert.isEqualTo(aSignal.getAction(), TP.UPDATE);

                newValue = aSignal.getValue();
                test.assert.isEqualTo(newValue, 42);

                observerObj.set('salary', newValue);
            });

        modelObj.set('salary', 42);

        test.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        TP.ignore('CurrentEmployee', 'SalaryChange', handlerFunc);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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
            handlerFunc = function(aSignal) {

                var newValue;

                test.assert.isIdenticalTo(aSignal.getTarget(), modelObj);
                test.assert.isEqualTo(aSignal.getAspect(), 'salary');
                test.assert.isEqualTo(aSignal.getAction(), TP.UPDATE);

                newValue = aSignal.getValue();
                test.assert.isEqualTo(newValue, 42);

                observerObj.set('salary', newValue);
            });

        modelObj.set('salary', 42);

        test.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        TP.ignore(modelURI, 'SalaryChange', handlerFunc);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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

        test.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', modelObj);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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

        test.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', 'CurrentEmployee');

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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

        test.assert.isEqualTo(
                    modelObj.get('salary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', modelURI);

        modelObj.set('salary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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

        test.assert.isEqualTo(
                    modelObj.get('averageSalary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', modelObj, 'averageSalary');

        modelObj.set('averageSalary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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

        test.assert.isEqualTo(
                    modelObj.get('averageSalary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', 'CurrentEmployee', 'averageSalary');

        modelObj.set('averageSalary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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

        test.assert.isEqualTo(
                    modelObj.get('averageSalary'),
                    observerObj.get('salary'));

        //  Destroy the binding
        observerObj.destroyBinding('salary', modelURI, 'averageSalary');

        modelObj.set('averageSalary', 45);

        //  Because there is now no binding between these two, observerObj
        //  should still have the value of 42 set above.
        test.assert.isEqualTo(
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


    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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
                modelObj.defineAttribute('salaryInRange');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', modelObj, 'salary');
                salaryField.defineBinding('@inrange', modelObj, 'salaryInRange');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('salaryInRange', true);

                test.assert.isEqualTo(
                            modelObj.get('salaryInRange'),
                            salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value', modelObj, 'salary');
                salaryField.destroyBinding('@inrange', modelObj, 'salaryInRange');

                modelObj.set('salary', 45);
                modelObj.set('salaryInRange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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
                modelObj.defineAttribute('salaryInRange');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');
                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', 'CurrentEmployee', 'salary');
                salaryField.defineBinding('@inrange', 'CurrentEmployee', 'salaryInRange');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('salaryInRange', true);

                test.assert.isEqualTo(
                            modelObj.get('salaryInRange'),
                            salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value', 'CurrentEmployee', 'salary');
                salaryField.destroyBinding('@inrange', 'CurrentEmployee', 'salaryInRange');

                modelObj.set('salary', 45);
                modelObj.set('salaryInRange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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
                modelObj.defineAttribute('salaryInRange');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value', modelURI, 'salary');
                salaryField.defineBinding('@inrange', modelURI, 'salaryInRange');

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('salaryInRange', true);

                test.assert.isEqualTo(
                            modelObj.get('salaryInRange'),
                            salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value', modelURI, 'salary');
                salaryField.destroyBinding('@inrange', modelURI, 'salaryInRange');

                modelObj.set('salary', 45);
                modelObj.set('salaryInRange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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
                                '{"emp":{"salary":50000,"salaryInRange":false}}');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelObj,
                                            TP.apc('emp.salary'));

                salaryField.defineBinding('@inrange',
                                            modelObj,
                                            TP.apc('emp.salaryInRange'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of '@inrange' on the field to
                //  update.
                modelObj.set('emp.salaryInRange', true);

                test.assert.isEqualTo(
                            modelObj.get('emp.salaryInRange'),
                            salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelObj,
                                            TP.apc('emp.salary'));
                salaryField.destroyBinding('@inrange',
                                            modelObj,
                                            TP.apc('emp.salaryInRange'));

                modelObj.set('emp.salary', 45);
                modelObj.set('emp.salaryInRange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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
                                '{"emp":{"salary":50000,"salaryInRange":null}}');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');
                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('emp.salary'));

                salaryField.defineBinding('@inrange',
                                            'CurrentEmployee',
                                            TP.apc('emp.salaryInRange'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of '@inrange' on the field to
                //  update.
                modelObj.set('emp.salaryInRange', true);

                test.assert.isEqualTo(
                            modelObj.get('emp.salaryInRange'),
                            salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('emp.salary'));
                salaryField.destroyBinding('@inrange',
                                            'CurrentEmployee',
                                            TP.apc('emp.salaryInRange'));

                modelObj.set('emp.salary', 45);
                modelObj.set('emp.salaryInRange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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
                                '{"emp":{"salary":50000,"salaryInRange":null}}');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelURI,
                                            TP.apc('emp.salary'));

                salaryField.defineBinding('@inrange',
                                            modelURI,
                                            TP.apc('emp.salaryInRange'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('emp.salary', 42);

                test.assert.isEqualTo(
                            modelObj.get('emp.salary'),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('emp.salaryInRange', true);

                test.assert.isEqualTo(
                            modelObj.get('emp.salaryInRange'),
                            salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelURI,
                                            TP.apc('emp.salary'));
                salaryField.destroyBinding('@inrange',
                                            modelURI,
                                            TP.apc('emp.salaryInRange'));

                modelObj.set('emp.salary', 45);
                modelObj.set('emp.salaryInRange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

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

                modelObj = TP.tpdoc(
                            '<emp><salary inrange="false">50000</salary></emp>');

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelObj,
                                            TP.apc('/emp/salary'));

                salaryField.defineBinding('@inrange',
                                            modelObj,
                                            TP.apc('/emp/salary/@inrange'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('/emp/salary/@inrange', true);

                test.assert.isEqualTo(
                        TP.val(modelObj.get('/emp/salary/@inrange')).asBoolean(),
                        salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelObj,
                                            TP.apc('/emp/salary'));
                salaryField.destroyBinding('@inrange',
                                            modelObj,
                                            TP.apc('/emp/salary/@inrange'));

                modelObj.set('/emp/salary', 45);
                modelObj.set('/emp/salary/@inrange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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

                modelObj = TP.tpdoc(
                            '<emp><salary inrange="false">50000</salary></emp>');

                //  This sets the ID of the object and registers it with an
                //  accompanying 'urn:tibet' URN (which will allow the
                //  'defineBinding()' call to turn change handling on for it).
                modelObj.setID('CurrentEmployee');
                TP.sys.registerObject(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary'));

                salaryField.defineBinding('@inrange',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary/@inrange'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('/emp/salary/@inrange', true);

                test.assert.isEqualTo(
                        TP.val(modelObj.get('/emp/salary/@inrange')).asBoolean(),
                        salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary'));
                salaryField.destroyBinding('@inrange',
                                            'CurrentEmployee',
                                            TP.apc('/emp/salary/@inrange'));

                modelObj.set('/emp/salary', 45);
                modelObj.set('/emp/salary/@inrange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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

                modelObj = TP.tpdoc(
                            '<emp><salary inrange="false">50000</salary></emp>');

                modelURI = TP.uc('urn:tibet:testdata');
                //  This automatically sets the ID of modelObj to
                //  'urn:tibet:testdata' because it didn't have an existing ID
                //  and was assigned as the resource to the URI defined above.
                modelURI.setResource(modelObj);

                salaryField = TP.byOID('salaryField');

                salaryField.defineBinding('value',
                                            modelURI,
                                            TP.apc('/emp/salary'));

                salaryField.defineBinding('@inrange',
                                            modelURI,
                                            TP.apc('/emp/salary/@inrange'));

                //  Set the value of 'salary' on the model object. The binding
                //  should cause the value of 'salary' on the field to update.
                modelObj.set('/emp/salary', 42);

                test.assert.isEqualTo(
                            TP.val(modelObj.get('/emp/salary')).asNumber(),
                            salaryField.get('value').asNumber());

                //  Set the value of 'salaryInRange' on the model object. The
                //  binding should cause the value of 'salary' on the field to
                //  update.
                modelObj.set('/emp/salary/@inrange', true);

                test.assert.isEqualTo(
                        TP.val(modelObj.get('/emp/salary/@inrange')).asBoolean(),
                        salaryField.get('@inrange').asBoolean());

                test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

                //  Destroy the binding
                salaryField.destroyBinding('value',
                                            modelURI,
                                            TP.apc('/emp/salary'));
                salaryField.destroyBinding('@inrange',
                                            modelURI,
                                            TP.apc('/emp/salary/@inrange'));

                modelObj.set('/emp/salary', 45);
                modelObj.set('/emp/salary/@inrange', false);

                //  Because there is now no binding between these two, the field
                //  should still have the value of 42 set above.
                test.assert.isEqualTo(
                            42,
                            salaryField.get('value').asNumber());

                test.assert.isEqualTo(
                            true,
                            salaryField.get('@inrange').asBoolean());

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
