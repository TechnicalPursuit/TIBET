//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
 * Tests for inheritance and reflection methods.
 */

//  ------------------------------------------------------------------------

// Create a singleton object we can hang tests off since reflection and
// inheritance testing ranges across a broad range of objects including
// namespace objects (TP for example) which don't current inherit/support
// the testing API. This is an example of "detached test definition".

TP.OOTests = TP.lang.Object.construct();

//  Local attributes used for traits testing
TP.OOTests.defineAttribute('circleEqualsCount');
TP.OOTests.defineAttribute('colorEqualsCount');
TP.OOTests.defineAttribute('colorGetRGBCount');
TP.OOTests.defineAttribute('dimensionEqualsCount');
TP.OOTests.defineAttribute('differsCount');
TP.OOTests.defineAttribute('greaterCount');
TP.OOTests.defineAttribute('smallerCount');
TP.OOTests.defineAttribute('betweenCount');

TP.OOTests.defineAttribute('passedAddTraitsFrom1');
TP.OOTests.defineAttribute('passedAddTraitsFrom2');
TP.OOTests.defineAttribute('passedAddTraitsFrom3');
TP.OOTests.defineAttribute('passedAddTraitsFrom4');
TP.OOTests.defineAttribute('passedAddTraitsFrom5');
TP.OOTests.defineAttribute('passedAddTraitsFrom6');
TP.OOTests.defineAttribute('passedAddTraitsFrom7');

//  ------------------------------------------------------------------------

TP.OOTests.defineMethod('commonBefore',
function() {

    var animalType,

        domesticatedType,

        dogType;

    //  Define the types

    //  --- Animal object (abstract)

    animalType = TP.lang.Object.defineSubtype('test.Animal');
    animalType.isAbstract(true);

    //  Introduce type attribute
    animalType.Type.defineAttribute('extinctionCategory');

    //  Introduce type attribute
    animalType.Type.defineAttribute('speciesName');

    //  Introduce type method
    animalType.Type.defineMethod('breathes',
                                    function() {return true; });
    //  Introduce type method
    animalType.Type.defineMethod('makesNoise',
                                    function() {return false; });

    //  Introduce instance attribute
    animalType.Inst.defineAttribute('lifeTicks');

    //  Introduce instance method
    animalType.Inst.defineMethod('live', function() {
        this.set('lifeTicks', this.get('lifeTicks') - 1);
    });

    //  Introduce instance method
    animalType.Inst.defineMethod('generateNoise', function() {return ''; });
    //  Introduce instance method
    animalType.Inst.defineMethod('die', function() {return '10 years'; });


    //  --- Domesticated object (abstract)

    domesticatedType = TP.test.Animal.defineSubtype('test.Domesticated');
    domesticatedType.isAbstract(true);

    //  Introduce type method
    domesticatedType.Type.defineMethod('needsLeash',
                                        function() {return false; });

    //  Overrides type method
    domesticatedType.Type.defineMethod('makesNoise',
                                        function() {return true; });

    //  Introduce instance attribute
    domesticatedType.Inst.defineAttribute('petName');
    //  Introduce instance attribute
    domesticatedType.Inst.defineAttribute('vetVisits');

    //  Introduce instance method
    domesticatedType.Inst.defineMethod('visitVet',
                                function() {var happy; return happy; });

    //  Override instance method
    domesticatedType.Inst.defineMethod('live', function() {
        this.set('lifeTicks', this.get('lifeTicks') + 1000);
    });


    //  --- Dog object

    dogType = TP.test.Domesticated.defineSubtype('test.Dog');

    //  Set value of type attribute (locally)
    dogType.set('speciesName', 'canine');

    //  Introduce type attribute
    dogType.Type.defineAttribute('tailWagFactor');

    //  Introduce instance attribute
    dogType.Inst.defineAttribute('fleaCount');

    //  Introduce type method
    dogType.Type.defineMethod('catChaseProbability',
                                function() {return 'high'; });
    //  Override type method
    dogType.Type.defineMethod('needsLeash',
                                function() {return true; });

    //  Override instance method
    dogType.Inst.defineMethod('generateNoise',
                                function() {return this.bark(); });

    //  Introduce instance method
    dogType.Inst.defineMethod('bark', function() {return 'ruff ruff'; });

    //  ---

    //  Traits multiple inheritance

    TP.lang.Object.defineSubtype('test.Equality');

    TP.test.Equality.Inst.defineAttribute('doesDiffer');

    //  Methods inside of TP.test.Equality 'require' that a type that it
    //  is mixed into supply an implementation of that method
    TP.test.Equality.Inst.defineMethod('equals', TP.REQUIRED);
    TP.test.Equality.Inst.defineMethod('differs', function() {
        this.set('doesDiffer', true);
        TP.OOTests.set(
            'differsCount',
            TP.OOTests.get('differsCount') + 1);
        this.equals();
    });

    //  ---

    //  Define TP.test.Magnitude and add traits from TP.test.Equality
    //  into it. We don't need to supply the required 'equals' property
    //  unless we make an instance of this type (which we won't).
    TP.lang.Object.defineSubtype('test.Magnitude');
    TP.test.Magnitude.addTraits(TP.test.Equality);

    TP.test.Magnitude.Inst.defineMethod('smaller', TP.REQUIRED);
    TP.test.Magnitude.Inst.defineMethod('greater', function() {
        TP.OOTests.set(
            'greaterCount',
            TP.OOTests.get('greaterCount') + 1);
    });
    TP.test.Magnitude.Inst.defineMethod('between', function() {
        TP.OOTests.set(
            'betweenCount',
            TP.OOTests.get('betweenCount') + 1);
        this.smaller();
    });

    //  ---

    //  Circle Definition #1
    TP.lang.Object.defineSubtype('test.Circle');

    //  We pick up 'differs' from TP.test.Equality and 'greater' &
    //  'between' from TP.test.Magnitude
    TP.test.Circle.addTraits(TP.test.Magnitude);

    //  Note we could've done this in any order:
    //TP.test.Circle.addTraits(TP.test.Equality, TP.test.Magnitude);

    TP.test.Circle.Inst.defineMethod('area',
            function() {return Math.PI * this.radius * this.radius; });

    //  Satisfies 'equals' from TP.test.Equality
    TP.test.Circle.Inst.defineMethod('equals', function() {
        TP.OOTests.set(
            'circleEqualsCount',
                TP.OOTests.get('circleEqualsCount') + 1);
    });

    //  Satisfies 'smaller' from TP.test.Magnitude
    TP.test.Circle.Inst.defineMethod('smaller', function() {
        TP.OOTests.set(
            'smallerCount',
                TP.OOTests.get('smallerCount') + 1);
        this.greater();
    });

    //  ---

    //  Now define an additional trait for Colors
    TP.lang.Object.defineSubtype('test.Color');
    TP.test.Color.Inst.defineMethod('getRgb', function() {
        TP.OOTests.set(
            'colorGetRGBCount',
                TP.OOTests.get('colorGetRGBCount') + 1);
    });
    TP.test.Color.Inst.defineMethod('equals', function() {
        TP.OOTests.set(
            'colorEqualsCount',
                TP.OOTests.get('colorEqualsCount') + 1);
    });

    //  ---

    //  Now define an additional trait for RGBData
    TP.lang.Object.defineSubtype('test.RGBData');
    TP.test.RGBData.Inst.defineMethod('getRgb', function() {});
});

//  ------------------------------------------------------------------------

TP.OOTests.defineMethod('commonAfter',
function() {

    var metadata;

    //  Custom types
    delete TP.test.Animal;
    delete TP.test.Domesticated;
    delete TP.test.Dog;

    //  Custom traits types
    delete TP.test.Equality;
    delete TP.test.Magnitude;
    delete TP.test.Circle;
    delete TP.test.Color;
    delete TP.test.RGBData;

    //  Manually remove the metadata for the above
    metadata = TP.sys.getMetadata('types');

    metadata.removeKey('TP.test.Animal');
    metadata.removeKey('TP.test.Domesticated');
    metadata.removeKey('TP.test.Dog');

    metadata.removeKey('TP.test.Equality');
    metadata.removeKey('TP.test.Magnitude');
    metadata.removeKey('TP.test.Circle');
    metadata.removeKey('TP.test.Color');
    metadata.removeKey('TP.test.RGBData');

    //  Additions to built-ins.
    delete Array.test7TypeMethod;
    delete Array.test7TypeMethod2;
    delete Array.test7TypeLocal;

    delete Object.fluffy;
    delete Array.fluffy;

    delete TP.ObjectProto.fluffy;
    delete TP.ArrayProto.fluffy;

    delete TP.FunctionProto.test15TypeAttribute;
    delete Object.test15TypeAttribute;
    delete Array.test15TypeAttribute;
    delete Object.test15TypeAttribute2;
    delete Array.test15TypeAttribute2;
    delete Object.test15LocalAttribute;
    delete Array.test15LocalAttribute;

    delete TP.core.Node.Type.testTypeAttribute1;
    delete Array.testTypeAttribute1;
    delete TP.core.Node.testTypeLocalAttribute1;
    delete Array.testTypeLocalAttribute1;

    delete TP.core.Point.Inst.testSharedInstAttribute1;
    delete Array.getInstPrototype().testSharedInstAttribute1;
    delete TP.core.Point.Inst.testInstAttribute1;
    delete Array.getInstPrototype().testInstAttribute1;
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Reflection - getTypeName',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---
    //  TYPES
    //  ---

    this.it('TP.lang.RootObject type getTypeName()', function(test, options) {

        var typeName;

        typeName = TP.lang.RootObject.getTypeName();

        //  For TIBET *Type objects*, their type name is their name
        //  ('TP.core.Node') with the word 'meta' inserted as a special
        //  namespace (so, 'TP.meta.core.Node')
        test.assert.isEqualTo(
            typeName,
            'TP.meta.lang.RootObject',
            TP.sc('Typename value: should be "TP.meta.lang.RootObject"',
                    ' not: ', typeName, '.'));
    });

    //  ---

    this.it('TP.lang.Object type getTypeName()', function(test, options) {

        var typeName;

        typeName = TP.lang.Object.getTypeName();

        //  For TIBET *Type objects*, their type name is their name
        //  ('TP.core.Node') with the word 'meta' inserted as a special
        //  namespace (so, 'TP.meta.core.Node')
        test.assert.isEqualTo(
            typeName,
            'TP.meta.lang.Object',
            TP.sc('Typename value: should be "TP.meta.lang.Object"',
                    ' not: ', typeName, '.'));
    });

    //  ---

    this.it('TP.lang.XMLElementNode type getTypeName()', function(test, options) {

        var typeName;

        typeName = TP.core.XMLElementNode.getTypeName();

        //  For TIBET *Type objects*, their type name is their name
        //  ('TP.core.Node') with the word 'meta' inserted as a special
        //  namespace (so, 'TP.meta.core.Node')
        test.assert.isEqualTo(
            typeName,
            'TP.meta.core.XMLElementNode',
            TP.sc('Typename value: should be "TP.meta.core.XMLElementNode"',
                    ' not: ', typeName, '.'));
    });

    //  ---
    //  INSTANCES
    //  ---

    this.it('Function instance getTypeName()', function(test, options) {

        var typeName;

        typeName = function() {return; }.getTypeName();

        test.assert.isEqualTo(
            typeName,
            'Function',
            TP.sc('Typename value: should be "Function"',
                    ' not: ', typeName, '.'));
    });

    //  ---

    this.it('Array instance getTypeName()', function(test, options) {

        var typeName;

        typeName = [].getTypeName();

        test.assert.isEqualTo(
            typeName,
            'Array',
            TP.sc('Typename value: should be "Array"',
                    ' not: ', typeName, '.'));
    });

    //  ---

    this.it('TP.lang.Object instance getTypeName()', function(test, options) {

        var typeName;

        typeName = TP.lang.Object.construct().getTypeName();

        test.assert.isEqualTo(
            typeName,
            'TP.lang.Object',
            TP.sc('Typename value: should be "TP.lang.Object"',
                    ' not: ', typeName, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Reflection - getSupertype',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type getSupertype()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Domesticated;
        correctVal = TP.test.Animal;

        test.assert.isIdenticalTo(
            val = obj.getSupertype(),
            correctVal,
            TP.sc('Supertype for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog;
        correctVal = TP.test.Domesticated;

        test.assert.isIdenticalTo(
            val = obj.getSupertype(),
            correctVal,
            TP.sc('Supertype for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance getSupertype()', function(test, options) {

        var obj,
            correctVal,

            val;

            //  ---

        obj = TP.test.Dog.construct();
        correctVal = TP.test.Domesticated;

        test.assert.isIdenticalTo(
            val = obj.getSupertype(),
            correctVal,
            TP.sc('Supertype for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type getSupertype()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = Object;
        correctVal = undefined;

        test.assert.isIdenticalTo(
            val = obj.getSupertype(),
            correctVal,
            TP.sc('Supertype for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Function;
        correctVal = Object;

        test.assert.isIdenticalTo(
            val = obj.getSupertype(),
            correctVal,
            TP.sc('Supertype for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Array;
        correctVal = Object;

        test.assert.isIdenticalTo(
            val = obj.getSupertype(),
            correctVal,
            TP.sc('Supertype for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance getSupertype()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = function() {return true; };
        correctVal = Object;

        test.assert.isIdenticalTo(
            val = obj.getSupertype(),
            correctVal,
            TP.sc('Supertype for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = [];
        correctVal = Object;

        test.assert.isIdenticalTo(
            val = obj.getSupertype(),
            correctVal,
            TP.sc('Supertype for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Reflection - getSupertypeName',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type getSupertypeName()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Domesticated;
        correctVal = 'TP.test.Animal';

        test.assert.isEqualTo(
            val = obj.getSupertypeName(),
            correctVal,
            TP.sc('Supertype name for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog;
        correctVal = 'TP.test.Domesticated';

        test.assert.isEqualTo(
            val = obj.getSupertypeName(),
            correctVal,
            TP.sc('Supertype name for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance getSupertypeName()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Dog.construct();
        correctVal = 'TP.test.Domesticated';

        test.assert.isEqualTo(
            val = obj.getSupertypeName(),
            correctVal,
            TP.sc('Supertype name for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type getSupertypeName()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = Object;
        correctVal = undefined;

        test.assert.isEqualTo(
            val = obj.getSupertypeName(),
            correctVal,
            TP.sc('Supertype name for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Function;
        correctVal = 'Object';

        test.assert.isEqualTo(
            val = obj.getSupertypeName(),
            correctVal,
            TP.sc('Supertype name for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Array;
        correctVal = 'Object';

        test.assert.isEqualTo(
            val = obj.getSupertypeName(),
            correctVal,
            TP.sc('Supertype name for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance getSupertypeName()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = function() {return true; };
        correctVal = 'Object';

        test.assert.isEqualTo(
            val = obj.getSupertypeName(),
            correctVal,
            TP.sc('Supertype name for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = [];
        correctVal = 'Object';

        test.assert.isEqualTo(
            val = obj.getSupertypeName(),
            correctVal,
            TP.sc('Supertype name for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Reflection - getSupertypes',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type getSupertypes()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Dog.construct();
        correctVal = TP.ac(TP.test.Domesticated, TP.test.Animal, TP.lang.Object,
                            TP.lang.RootObject, Object);

        test.assert.isEqualTo(
            val = obj.getSupertypes(),
            correctVal,
            TP.sc('Supertypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance getSupertypes()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Dog.construct();
        correctVal = TP.ac(TP.test.Domesticated, TP.test.Animal, TP.lang.Object,
                            TP.lang.RootObject, Object);

        test.assert.isEqualTo(
            val = obj.getSupertypes(),
            correctVal,
            TP.sc('Supertypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type getSupertypes()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = Object;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSupertypes(),
            correctVal,
            TP.sc('Supertypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Function;
        correctVal = TP.ac(Object);

        test.assert.isEqualTo(
            val = obj.getSupertypes(),
            correctVal,
            TP.sc('Supertypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Array;
        correctVal = TP.ac(Object);

        test.assert.isEqualTo(
            val = obj.getSupertypes(),
            correctVal,
            TP.sc('Supertypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance getSupertypes()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = function() {return true; };
        correctVal = TP.ac(Object);

        test.assert.isEqualTo(
            val = obj.getSupertypes(),
            correctVal,
            TP.sc('Supertypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = [];
        correctVal = TP.ac(Object);

        test.assert.isEqualTo(
            val = obj.getSupertypes(),
            correctVal,
            TP.sc('Supertypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Reflection - getSupertypeNames',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type getSupertypeNames()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Domesticated;
        correctVal = TP.ac('TP.test.Animal', 'TP.lang.Object',
                            'TP.lang.RootObject', 'Object');

        test.assert.isEqualTo(
            val = obj.getSupertypeNames(),
            correctVal,
            TP.sc('Supertype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog;
        correctVal = TP.ac('TP.test.Domesticated', 'TP.test.Animal',
                            'TP.lang.Object', 'TP.lang.RootObject', 'Object');

        test.assert.isEqualTo(
            val = obj.getSupertypeNames(),
            correctVal,
            TP.sc('Supertype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance getSupertypeNames()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Dog.construct();
        correctVal = TP.ac('TP.test.Domesticated', 'TP.test.Animal',
                            'TP.lang.Object', 'TP.lang.RootObject', 'Object');

        test.assert.isEqualTo(
            val = obj.getSupertypeNames(),
            correctVal,
            TP.sc('Supertype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type getSupertypeNames()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = Object;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSupertypeNames(),
            correctVal,
            TP.sc('Supertype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Function;
        correctVal = TP.ac('Object');

        test.assert.isEqualTo(
            val = obj.getSupertypeNames(),
            correctVal,
            TP.sc('Supertype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Array;
        correctVal = TP.ac('Object');

        test.assert.isEqualTo(
            val = obj.getSupertypeNames(),
            correctVal,
            TP.sc('Supertype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance getSupertypeNames()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = function() {return true; };
        correctVal = TP.ac('Object');

        test.assert.isEqualTo(
            val = obj.getSupertypeNames(),
            correctVal,
            TP.sc('Supertype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = [];
        correctVal = TP.ac('Object');

        test.assert.isEqualTo(
            val = obj.getSupertypeNames(),
            correctVal,
            TP.sc('Supertype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Reflection - getSubtypes',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type getSubtypes()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Animal;
        correctVal = TP.ac(TP.test.Domesticated);

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Animal;
        correctVal = TP.ac(TP.test.Domesticated, TP.test.Dog);

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Domesticated;
        correctVal = TP.ac(TP.test.Dog);

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Domesticated;
        correctVal = TP.ac(TP.test.Dog);

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

    });

    //  ---

    this.it('TIBET instance getSubtypes()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        //  TP.test.Animal is an abstract type - can't create instances of it.
        //  TP.test.Domesticated is an abstract type - can't create instances
        //  of it.

        //  ---

        obj = TP.test.Dog.construct();
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog.construct();
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type getSubtypes()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = Object;
        correctVal = TP.ac(Array, Boolean, Date, Function,
                            Number, RegExp, String);

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Object;
        correctVal = TP.ac(Array, Boolean, Date, Function,
                            Number, RegExp, String);

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Function;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Function;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Array;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Array;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance getSubtypes()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = function() {return true; };
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = function() {return true; };
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = [];
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = [];
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypes(true),
            correctVal,
            TP.sc('Subtypes for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Reflection - getSubtypeNames',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type getSubtypeNames()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = TP.test.Animal;
        correctVal = TP.ac('TP.test.Domesticated');

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Animal;
        correctVal = TP.ac('TP.test.Domesticated', 'TP.test.Dog');

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Domesticated;
        correctVal = TP.ac('TP.test.Dog');

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Domesticated;
        correctVal = TP.ac('TP.test.Dog');

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance getSubtypeNames()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        //  TP.test.Animal is an abstract type - can't create instances of it.
        //  TP.test.Domesticated is an abstract type - can't create instances
        //  of it.

        //  ---

        obj = TP.test.Dog.construct();
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = TP.test.Dog.construct();
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type getSubtypeNames()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = Object;
        correctVal = TP.ac('Array', 'Boolean', 'Date', 'Function', 'Number',
                            'RegExp', 'String');

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Object;
        correctVal = TP.ac('Array', 'Boolean', 'Date', 'Function', 'Number',
                            'RegExp', 'String');

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Function;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Function;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Array;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = Array;
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

    });

    //  ---

    this.it('native instance getSubtypeNames()', function(test, options) {

        var obj,
            correctVal,

            val;

        //  ---

        obj = function() {return true; };
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = function() {return true; };
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = [];
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));

        //  ---

        obj = [];
        correctVal = TP.ac();

        test.assert.isEqualTo(
            val = obj.getSubtypeNames(true),
            correctVal,
            TP.sc('Subtype names for: ', TP.name(obj),
                    ' should be: ', TP.str(correctVal),
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Reflection - getPropertyScope',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type method property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Type side method - inherited from super-type
        obj = TP.test.Domesticated;
        propName = 'breathes';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - overridden
        obj = TP.test.Domesticated;
        propName = 'makesNoise';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - introduced
        obj = TP.test.Domesticated;
        propName = 'needsLeash';
        correctVal = TP.INTRODUCED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - inherited from super-super-type
        obj = TP.test.Dog;
        propName = 'breathes';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - inherited from super-type
        obj = TP.test.Dog;
        propName = 'makesNoise';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - introduced
        obj = TP.test.Dog;
        propName = 'catChaseProbability';
        correctVal = TP.INTRODUCED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - overridden
        obj = TP.test.Dog;
        propName = 'needsLeash';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

    });

    //  ---

    this.it('TIBET instance method property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Instance side method - inherited from super-type

        //  TP.test.Domesticated is an abstract type - can't create instances of
        //  it.
        obj = TP.test.Domesticated.getInstPrototype();
        propName = 'generateNoise';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - overridden

        //  TP.test.Domesticated is an abstract type - can't create instances of
        //  it.
        obj = TP.test.Domesticated.getInstPrototype();
        propName = 'live';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - introduced

        //  TP.test.Domesticated is an abstract type - can't create instances of
        //  it.
        obj = TP.test.Domesticated.getInstPrototype();
        propName = 'visitVet';
        correctVal = TP.INTRODUCED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - inherited from super-super-type

        obj = TP.test.Dog.construct();
        propName = 'die';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - inherited from super-type

        obj = TP.test.Dog.construct();
        propName = 'visitVet';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - introduced

        obj = TP.test.Dog.construct();
        propName = 'bark';
        correctVal = TP.INTRODUCED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - overridden

        obj = TP.test.Dog.construct();
        propName = 'generateNoise';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET type object local method property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Type side method - inherited from super-super-type and locally
        //  overridden
        obj = TP.test.Dog;
        obj.defineMethod('breathes', function() {return 'always'; });

        propName = 'breathes';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - inherited from super-type and locally overridden
        obj = TP.test.Dog;
        obj.defineMethod('needsLeash', function() {return true; });

        propName = 'needsLeash';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - introduced on type and locally overridden
        obj = TP.test.Dog;
        obj.defineMethod('chaseCatProbability',
                function() {return this.ifInterested(); });

        propName = 'chaseCatProbability';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local method - introduced on just this object
        obj = TP.test.Dog;
        obj.defineMethod('dance', function() {return 'Dogtrot'; });

        propName = 'dance';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance object local method property scop', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Instance side method - inherited from super-super-type and locally
        //  overridden
        obj = TP.test.Dog.construct();
        obj.defineMethod('die', function() {return 'never'; });

        propName = 'die';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - inherited from super-type and locally
        //  overridden
        obj = TP.test.Dog.construct();
        obj.defineMethod('visitVet',
                            function() {var veryHappy; return veryHappy; });

        propName = 'visitVet';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - introduced on type and locally overridden
        obj = TP.test.Dog.construct();
        obj.defineMethod('bark', function() {return 'rooo rooo'; });

        propName = 'bark';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local method - introduced on just this object
        obj = TP.test.Dog.construct();
        obj.defineMethod('dance', function() {return 'Foxtrot'; });

        propName = 'dance';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type method property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Type side method - inherited from super-type
        //  Yes, asking an Object for the '.call' slot is weird, but it does
        //  'inherit' this from Function.prototype;
        obj = Object;
        propName = 'call';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - local
        obj = Object;
        propName = 'construct';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - local (native JS types never report 'introduced'
        //  on the type side)
        obj = Object;
        propName = 'create';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - inherited from super-type
        //  Yes, asking an Array for the '.call' slot is weird, but it does
        //  'inherit' this from Function.prototype;
        obj = Array;
        propName = 'call';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - local
        obj = Array;
        propName = 'fromString';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - local (native JS types never report 'introduced'
        //  on the type side)
        obj = Array;
        propName = 'isArray';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

    });

    //  ---

    this.it('native instance method property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Instance side method - inherited from super-type

        obj = [];
        propName = 'hasOwnProperty';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - overridden

        obj = [];
        propName = 'toString';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side method - introduced

        obj = [];
        propName = 'push';
        correctVal = TP.INTRODUCED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type object local method property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  Make sure and stub out some test methods to avoid changing real
        //  methods on built-in objects while we're running tests.
        TP.FunctionProto.defineMethod('test7TypeMethod',
                                        function() {return true; });

        //  ---

        //  Type side method - inherited from super-type and locally overridden
        obj = Object;
        obj.defineMethod('test7TypeMethod', function() {return false; });

        propName = 'test7TypeMethod';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  Type side method - inherited from super-type and locally overridden
        obj = Array;
        obj.defineMethod('test7TypeMethod', function() {return false; });

        propName = 'test7TypeMethod';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  NOTE: For these tests, since we're going against a native JS type
        //  object, 'type methods' and 'local methods' are the same thing -
        //  therefore, these will always report back TP.LOCAL

        //  Make sure and stub out some test methods to avoid changing real
        //  methods on built-in objects while we're running tests.
        Object.Type.defineMethod('test7TypeMethod2',
                                    function() {return true; });

        //  Type side method - introduced on type and locally overridden
        obj = Object;
        obj.defineMethod('test7TypeMethod2',
                function() {return this.ifInterested(); });

        propName = 'test7TypeMethod2';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Make sure and stub out some test methods to avoid changing real
        //  methods on built-in objects while we're running tests.
        Array.Type.defineMethod('test7TypeMethod2', function() {return true; });

        //  Type side method - introduced on type and locally overridden
        obj = Array;
        obj.defineMethod('test7TypeMethod2',
                function() {return this.ifInterested(); });

        propName = 'test7TypeMethod2';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local method - introduced on just this object
        obj = Object;
        obj.defineMethod('test7LocalMethod', function() {return true; });

        propName = 'test7LocalMethod';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local method - introduced on just this object
        obj = Array;
        obj.defineMethod('test7LocalMethod', function() {return true; });

        propName = 'test7LocalMethod';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance object local method property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Instance side method - introduced on type and locally overridden
        obj = [];
        obj.defineMethod('unshift', function() {return 'unshiften'; });

        propName = 'unshift';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local method - introduced on just this object
        obj = [];
        obj.defineMethod('doThis', function() {return 'doneIt'; });

        propName = 'doThis';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET type attribute property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Type side attribute - inherited from super-type
        obj = TP.test.Domesticated;
        propName = 'speciesName';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side attribute - introduced
        obj = TP.test.Dog;
        propName = 'tailWagFactor';
        correctVal = TP.INTRODUCED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side attribute - inherited from super-super-type
        obj = TP.test.Dog;
        propName = 'extinctionCategory';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance attribute property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Instance side attribute - inherited from super-type

        //  TP.test.Domesticated is an abstract type - can't create instances of
        //  it.
        obj = TP.test.Domesticated.getInstPrototype();
        propName = 'lifeTicks';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side attribute - introduced

        //  TP.test.Domesticated is an abstract type - can't create instances of
        //  it.
        obj = TP.test.Domesticated.getInstPrototype();
        propName = 'petName';
        correctVal = TP.INTRODUCED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side attribute - inherited from super-super-type

        obj = TP.test.Dog.construct();
        propName = 'lifeTicks';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side attribute - inherited from super-type

        obj = TP.test.Dog.construct();
        propName = 'vetVisits';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side attribute - introduced

        obj = TP.test.Dog.construct();
        propName = 'fleaCount';
        correctVal = TP.INTRODUCED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET type object local attribute property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Type side attribute - inherited from super-super-type and locally
        //  overridden
        obj = TP.test.Dog;
        obj.set('speciesName', 'husky');

        propName = 'speciesName';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side attribute - introduced on type and locally overridden
        obj = TP.test.Dog;
        obj.set('tailWagFactor', 1000);

        propName = 'tailWagFactor';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local attribute - introduced on just this object
        obj = TP.test.Dog;
        obj.defineAttribute('chaseCat');
        obj.set('chaseCat', true);

        propName = 'chaseCat';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance object local attribute property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Instance side attribute - inherited from super-super-type and
        //  locally overridden
        obj = TP.test.Dog.construct();
        obj.set('lifeTicks', 100000);

        propName = 'lifeTicks';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side attribute - inherited from super-type and locally
        //  overridden
        obj = TP.test.Dog.construct();
        obj.set('petName', 'Fido');

        propName = 'petName';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side attribute - introduced on type and locally overridden
        obj = TP.test.Dog.construct();
        obj.set('fleaCount', 10);

        propName = 'fleaCount';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local attribute - introduced on just this object
        obj = TP.test.Dog.construct();
        obj.defineAttribute('barkCount');
        obj.set('barkCount', 500000);

        propName = 'barkCount';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type attribute property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Type side attribute - inherited from super-type
        //  Yes, asking an Object for the '.constructor' slot is weird, but it
        //  does 'inherit' this from Function.prototype;
        obj = Object;
        propName = 'constructor';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - local (native JS types never report 'introduced'
        //  on the type side)
        obj = Object;
        obj.Type.defineAttribute('fluffy');
        propName = 'fluffy';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side attribute - inherited from super-type
        //  Yes, asking an Array for the '.constructor' slot is weird, but it
        //  does 'inherit' this from Function.prototype;
        obj = Array;
        propName = 'constructor';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Type side method - local (native JS types never report 'introduced'
        //  on the type side)
        obj = Array;
        obj.Type.defineAttribute('fluffy');
        propName = 'fluffy';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance attribute property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        Object.prototype.fluffy = 'fluffy';

        //  ---

        //  Instance side attribute - inherited from super-type

        obj = [];
        propName = 'fluffy';
        correctVal = TP.INHERITED;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        Array.prototype.fluffy = 'foofy';

        //  ---

        //  Instance side attribute - overridden

        obj = [];
        propName = 'fluffy';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance side attribute - introduced

        obj = [];
        obj.defineAttribute('goofy');
        obj.set('goofy', null);
        propName = 'goofy';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type object local attribute property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        TP.FunctionProto.defineAttribute('test15TypeAttribute');

        //  ---

        //  Type side attribute - inherited from super-type and locally
        //  overridden
        obj = Object;
        obj.set('test15TypeAttribute', 'A test');

        propName = 'test15TypeAttribute';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  Type side attribute - inherited from super-type and locally
        //  overridden
        obj = Array;
        obj.set('test15TypeAttribute', 'A test');

        propName = 'test15TypeAttribute';
        correctVal = TP.OVERRIDDEN;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  NOTE: For these tests, since we're going against a native JS type
        //  object, 'type methods' and 'local methods' are the same thing -
        //  therefore, these will always report back TP.LOCAL

        Object.Type.defineAttribute('test15TypeAttribute2');

        //  Type side attribute - introduced on type and locally overridden
        obj = Object;

        //  For a native JS type, adding a local attribute is the same as
        //  adding a type attribute
        //obj.defineAttribute('test15TypeAttribute2');

        obj.set('test15TypeAttribute2', 'A test');

        propName = 'test15TypeAttribute2';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        Array.Type.defineAttribute('test15TypeAttribute2');

        //  Type side method - introduced on type and locally overridden
        obj = Array;

        //  For a native JS type, adding a local attribute is the same as adding
        //  a type attribute
        //obj.defineAttribute('test15TypeAttribute2');

        obj.set('test15TypeAttribute2', 'A test');

        propName = 'test15TypeAttribute2';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local method - introduced on just this object
        obj = Object;
        obj.defineAttribute('test15LocalAttribute');
        obj.set('test15LocalAttribute', 'A test');

        propName = 'test15LocalAttribute';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local method - introduced on just this object
        obj = Array;
        obj.defineAttribute('test15LocalAttribute');
        obj.set('test15LocalAttribute', 'A test');

        propName = 'test15LocalAttribute';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance object local attribute property scope', function(test, options) {

        var obj,
            propName,
            correctVal,

            val;

        //  ---

        //  Instance side attribute - introduced on type and locally overridden
        obj = [];
        obj.set('unshift', null);

        propName = 'unshift';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local attribute - introduced on just this object
        obj = [];
        obj.defineAttribute('doThis');
        obj.set('doThis', null);

        propName = 'doThis';
        correctVal = TP.LOCAL;

        test.assert.isEqualTo(
            val = obj.getPropertyScope(propName),
            correctVal,
            TP.sc('Scope for: ', propName, ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

//  scope: [TP.ALL|TP.LOCAL|TP.INTRODUCED|TP.INHERITED|TP.OVERRIDDEN]
//  attributes: [true|false]
//  methods: [true|false]
//  hidden: [true|false]
//  public: [true|false] (Have to use if 'hidden' is true and you want both)

//  defaults: attributes: true, methods: false, hidden: false, scope: unique

TP.OOTests.describe('Reflection - getInterface',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type object known property scope', function(test, options) {

        var obj,
            tpNodeProto,
            tpObjProto,

            nodeProtoProperties,
            tpObjProtoProperties,
            rootObjProtoProperties,
            objProtoProperties,

            protoProperties,
            selfProperties,
            nonLocalProperties,

            testInheritedProperties,
            testIntroducedProperties,
            testOverriddenProperties,
            testLocalProperties,

            filter,

            keys,

            val;

        //  Derive the key set in a method & manner independent of
        //  'getInterface' to provide a proper 'control'.

        obj = TP.core.Node;
        tpNodeProto = obj.getPrototype();
        tpObjProto = TP.lang.Object.getPrototype();

        //  ---
        //  Set up test data
        //  ---

        nodeProtoProperties = Object.keys(tpNodeProto);
        tpObjProtoProperties = Object.keys(tpObjProto);
        rootObjProtoProperties = Object.keys(TP.lang.RootObject.getPrototype());
        objProtoProperties = Object.keys(TP.ObjectProto);

        protoProperties = nodeProtoProperties.concat(
                                            tpObjProtoProperties).concat(
                                            rootObjProtoProperties).concat(
                                            objProtoProperties);

        //  Now we need to unique() the list of prototype properties, since we
        //  don't really care about where the property came from, only that it's
        //  somewhere on the prototype chain
        protoProperties.unique();

        //  Filter out any 'internal' slots - our 'getInterface()' call does
        //  (note that these are different than 'private' slots).
        protoProperties = protoProperties.reject(
                            function(aKey) {
                                return TP.regex.INTERNAL_SLOT.test(aKey);
                            });

        selfProperties = nodeProtoProperties.concat(Object.keys(obj));
        selfProperties.unique();
        selfProperties = selfProperties.reject(
                    function(aKey) {
                        return TP.regex.INTERNAL_SLOT.test(aKey);
                    });

        nonLocalProperties = protoProperties.difference(selfProperties);

        //  ---

        testInheritedProperties = nonLocalProperties;

        testIntroducedProperties = TP.ac();
        testOverriddenProperties = TP.ac();

        selfProperties.perform(
            function(aKey) {
                if (tpNodeProto.hasOwnProperty(aKey) &&
                        !TP.isDefined(tpObjProto[aKey])) {
                    testIntroducedProperties.push(aKey);
                } else if (tpNodeProto[aKey] !== tpObjProto[aKey]) {
                    testOverriddenProperties.push(aKey);
                }
            });

        testLocalProperties = Object.keys(obj);
        testLocalProperties = testLocalProperties.reject(
                            function(aKey) {
                                return TP.regex.INTERNAL_SLOT.test(aKey);
                            });

        //  ---
        //  Run tests
        //  ---

        //  scope: ALL,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known';

        keys = obj.getInterface(filter);

        val = nonLocalProperties.concat(selfProperties);

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: LOCAL,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_local';

        keys = obj.getInterface(filter);
        val = testLocalProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: INTRODUCED,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_introduced';

        keys = obj.getInterface(filter);
        val = testIntroducedProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: INHERITED,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_inherited';

        keys = obj.getInterface(filter);
        val = testInheritedProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: OVERRIDDEN,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_overridden';

        keys = obj.getInterface(filter);
        val = testOverriddenProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));
    });

    //  ---

    this.it('TIBET type object known property scope', function(test, options) {

        var obj,

            pointInstProto,
            tpObjInstProto,

            pointInstProtoProperties,
            tpObjInstProtoProperties,
            rootObjInstProtoProperties,
            objProtoProperties,

            protoProperties,
            selfProperties,
            nonLocalProperties,

            testInheritedProperties,
            testIntroducedProperties,
            testOverriddenProperties,
            testLocalProperties,

            filter,

            keys,

            val;

        //  Derive the key set in a method & manner independent of
        //  'getInterface' to provide a proper 'control'.

        obj = TP.core.Point.construct(20, 40);
        pointInstProto = obj.getInstPrototype();
        tpObjInstProto = TP.lang.Object.getInstPrototype();

        //  ---
        //  Set up test data
        //  ---

        pointInstProtoProperties = Object.keys(pointInstProto);
        tpObjInstProtoProperties = Object.keys(tpObjInstProto);
        rootObjInstProtoProperties = Object.keys(
                                        TP.lang.RootObject.getInstPrototype());
        objProtoProperties = Object.keys(TP.ObjectProto);

        protoProperties = pointInstProtoProperties.concat(
                                            tpObjInstProtoProperties).concat(
                                            rootObjInstProtoProperties).concat(
                                            objProtoProperties);

        //  Now we need to unique() the list of prototype properties, since we
        //  don't really care about where the property came from, only that it's
        //  somewhere on the prototype chain
        protoProperties.unique();

        //  Filter out any 'internal' slots - our 'getInterface()' call does
        //  (note that these are different than 'private' slots).
        protoProperties = protoProperties.reject(
                            function(aKey) {
                                return TP.regex.INTERNAL_SLOT.test(aKey);
                            });

        selfProperties = pointInstProtoProperties.concat(Object.keys(obj));
        selfProperties.unique();
        selfProperties = selfProperties.reject(
                            function(aKey) {
                                return TP.regex.INTERNAL_SLOT.test(aKey);
                            });

        nonLocalProperties = protoProperties.difference(selfProperties);

        //  ---

        testInheritedProperties = nonLocalProperties;

        testIntroducedProperties = TP.ac();
        testOverriddenProperties = TP.ac();

        selfProperties.perform(
            function(aKey) {
                if (pointInstProto.hasOwnProperty(aKey) &&
                        !TP.isDefined(tpObjInstProto[aKey])) {
                    testIntroducedProperties.push(aKey);
                } else if (pointInstProto[aKey] !== tpObjInstProto[aKey]) {
                    testOverriddenProperties.push(aKey);
                }
            });

        testLocalProperties = Object.keys(obj);
        testLocalProperties = testLocalProperties.reject(
                            function(aKey) {
                                return TP.regex.INTERNAL_SLOT.test(aKey);
                            });

        //  'known' doesn't include keys from Object.prototype... is this right?

        //  ---
        //  Run tests
        //  ---

        //  scope: ALL,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known';

        keys = obj.getInterface(filter);

        val = nonLocalProperties.concat(selfProperties);

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: LOCAL,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_local';

        keys = obj.getInterface(filter);
        val = testLocalProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: INTRODUCED,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_introduced';

        keys = obj.getInterface(filter);
        val = testIntroducedProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: INHERITED,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_inherited';

        keys = obj.getInterface(filter);
        val = testInheritedProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: OVERRIDDEN,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_overridden';

        keys = obj.getInterface(filter);
        val = testOverriddenProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));
    });

    //  ---

    this.it('native type object known property scope', function(test, options) {

        var obj,

            objProtoProperties,
            funcProtoProperties,

            protoProperties,
            selfProperties,

            testInheritedProperties,
            testOverriddenProperties,
            testLocalProperties,

            filter,

            keys,

            val;

        //  Derive the key set in a method & manner independent of
        //  'getInterface' to provide a proper 'control'.

        obj = Array;

        //  ---
        //  Set up test data
        //  ---

        //  For a native JavaScript type object (i.e. one of the "Big 7" -
        //  "Big 8" minus Object constructors), they can inherit their
        //  properties from a number of places:
        //      TP.ObjectProto
        //      TP.FunctionProto
        //      Meta methods
        //      Common methods
        //      Type or instance methods on function(i.e. added via
        //      'Type.defineMethod') where TP.OWNER is Function

        objProtoProperties = Object.keys(TP.ObjectProto);
        funcProtoProperties = Object.keys(TP.FunctionProto);
        protoProperties = objProtoProperties.concat(funcProtoProperties);

        //  Now we need to unique() the list of prototype properties, since we
        //  don't really care about where the property came from, only that it's
        //  somewhere on the prototype chain
        protoProperties.unique();

        //  Filter out any 'internal' slots - our 'getInterface()' call does
        //  (note that these are different than 'private' slots).
        protoProperties = protoProperties.reject(
                            function(aKey) {
                                return TP.regex.INTERNAL_SLOT.test(aKey);
                            });

        selfProperties = Object.keys(obj);
        selfProperties.unique();
        selfProperties = selfProperties.reject(
                    function(aKey) {
                        return TP.regex.INTERNAL_SLOT.test(aKey);
                    });

        //  Some properties are added to objects and are enumerable, but are not
        //  reported via the 'Object.keys()' mechanism.
        //  NB: Make sure to test to see if this has an owner to distinguish
        //  from the forthcoming ECMA 'Object.observe'.
        if (TP.isValid(Object.observe) &&
            TP.notValid(Object.observe[TP.OWNER])) {
            selfProperties.push('observe');
        }

        //  ---

        testInheritedProperties = protoProperties.difference(selfProperties);

        testOverriddenProperties = TP.ac();
        testLocalProperties = TP.ac();
        selfProperties.perform(
            function(aKey) {
                if (obj.hasOwnProperty(aKey) &&
                        !TP.FunctionProto.hasOwnProperty(aKey)) {
                    testLocalProperties.push(aKey);
                } else if (obj[aKey] !== TP.FunctionProto[aKey]) {
                    testOverriddenProperties.push(aKey);
                }
            });

        //  ---
        //  Run tests
        //  ---

        //  scope: ALL,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known';

        keys = obj.getInterface(filter);
        val = testInheritedProperties.concat(
                testOverriddenProperties).concat(
                testLocalProperties);

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: LOCAL,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_local';

        keys = obj.getInterface(filter);
        val = testLocalProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: INHERITED,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_inherited';

        keys = obj.getInterface(filter);
        val = testInheritedProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: OVERRIDDEN,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_overridden';

        keys = obj.getInterface(filter);
        val = testOverriddenProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

    });

    //  ---

    this.it('native instance object known property scope', function(test, options) {

        var obj,

            objProtoProperties,
            arrProtoProperties,

            protoProperties,
            selfProperties,
            nonLocalProperties,

            testInheritedProperties,
            testOverriddenProperties,
            testLocalProperties,

            filter,

            keys,

            val;

        //  Derive the key set in a method & manner independent of
        //  'getInterface' to provide a proper 'control'.

        obj = ['fluffy'];

        //  ---
        //  Set up test data
        //  ---

        //  For a native JavaScript instance object, they can inherit their
        //  properties from a number of places:
        //      TP.ObjectProto
        //      Common methods
        //      Instance methods from their type (i.e. added via
        //      'Inst.defineMethod') where TP.OWNER is their type

        objProtoProperties = Object.keys(TP.ObjectProto);
        arrProtoProperties = Object.keys(TP.ArrayProto);
        protoProperties = objProtoProperties.concat(arrProtoProperties);

        //  Now we need to unique() the list of prototype properties, since we
        //  don't really care about where the property came from, only that it's
        //  somewhere on the prototype chain
        protoProperties.unique();

        //  Filter out any 'internal' slots - our 'getInterface()' call does
        //  (note that these are different than 'private' slots).
        protoProperties = protoProperties.reject(
                            function(aKey) {
                                return TP.regex.INTERNAL_SLOT.test(aKey);
                            });

        selfProperties = Object.keys(obj);
        selfProperties.unique();
        selfProperties = selfProperties.reject(
                    function(aKey) {
                        return TP.regex.INTERNAL_SLOT.test(aKey);
                    });

        nonLocalProperties = protoProperties.difference(selfProperties);

        //  ---

        testInheritedProperties = objProtoProperties.difference(
                                                        arrProtoProperties);

        testOverriddenProperties = TP.ac();
        objProtoProperties.perform(
            function(aKey) {
                if (TP.ArrayProto[aKey] !== TP.ObjectProto[aKey]) {
                    testOverriddenProperties.push(aKey);
                }
            });

        testLocalProperties = selfProperties;

        //  ---
        //  Run tests
        //  ---

        //  scope: ALL,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known';

        keys = obj.getInterface(filter);
        val = nonLocalProperties.concat(testLocalProperties);

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: LOCAL,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_local';

        keys = obj.getInterface(filter);
        val = testLocalProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: INHERITED,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_inherited';

        keys = obj.getInterface(filter);
        val = testInheritedProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));

        //  ---

        //  scope: OVERRIDDEN,
        //  attributes: true, methods: true, hidden: true, public: true
        filter = 'known_overridden';

        keys = obj.getInterface(filter);
        val = testOverriddenProperties;

        val = keys.difference(val);

        test.assert.isEmpty(
            val,
            TP.sc('There were remaining properties when querying for: "',
                    filter,
                    '" these are: [', val.join(','), '].'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Inheritance - defineAttribute',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type defineAttribute', function(test, options) {

        var val,
            correctVal;

        //  ---

        //  Type-level attribute - should be inherited by subtypes

        TP.core.Node.Type.defineAttribute('testTypeAttribute1');
        TP.core.Node.Type.set('testTypeAttribute1', 'testTypeAttVal1');

        val = TP.core.Node.get('testTypeAttribute1');
        correctVal = 'testTypeAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testTypeAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Testing inherited value - TP.core.ElementNode inherits from
        //  TP.core.Node

        val = TP.core.ElementNode.Type.get('testTypeAttribute1');
        correctVal = 'testTypeAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testTypeAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local attribute - should *not* be inherited by subtypes

        TP.core.Node.defineAttribute('testTypeLocalAttribute1');
        TP.core.Node.set('testTypeLocalAttribute1', 'testTypeLocalAttVal1');

        val = TP.core.Node.get('testTypeLocalAttribute1');
        correctVal = 'testTypeLocalAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testTypeLocalAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Testing non-inherited value - TP.core.ElementNode inherits from
        //  TP.core.Node, but shouldn't have inherited this value.

        val = TP.core.ElementNode.Type.get('testLocalAttribute1');

        this.refute.isDefined(
            val,
            TP.sc('value for: ', 'testTypeLocalAttribute1',
                    ' should be: ', 'undefined',
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance defineAttribute', function(test, options) {

        var obj,
            obj2,

            val,
            correctVal;

        //  ---

        //  Instance-level shared attribute

        TP.core.Point.Inst.defineAttribute('testSharedInstAttribute1');
        TP.core.Point.Inst.set('testSharedInstAttribute1',
                                'testSharedInstAttVal1');

        obj = TP.core.Point.construct(20, 30);

        val = obj.get('testSharedInstAttribute1');
        correctVal = 'testSharedInstAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testSharedInstAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        obj2 = TP.core.Point.construct(20, 30);

        val = obj2.get('testSharedInstAttribute1');
        correctVal = 'testSharedInstAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testSharedInstAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance-level attribute

        TP.core.Point.Inst.defineAttribute('testInstAttribute1');
        obj = TP.core.Point.construct(20, 30);

        obj.set('testInstAttribute1', 'testInstAttVal1');

        val = obj.get('testInstAttribute1');
        correctVal = 'testInstAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testInstAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local attribute

        obj.defineAttribute('testLocalAttribute1');
        obj.set('testLocalAttribute1', 'testLocalAttVal1');

        val = obj.get('testLocalAttribute1');
        correctVal = 'testLocalAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testLocalAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type defineAttribute', function(test, options) {

        var val,
            correctVal;

        //  NB: There is no concept of inheritance for standard JavaScript
        //  *type* objects, so 'type' and 'local' are basically the same thing
        //  here (Function.prototype notwithstanding)

        //  ---

        //  Type-level attribute

        Array.Type.defineAttribute('testTypeAttribute1');
        Array.Type.set('testTypeAttribute1', 'testTypeAttVal1');

        val = Array.get('testTypeAttribute1');
        correctVal = 'testTypeAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testTypeAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local attribute

        Array.defineAttribute('testTypeLocalAttribute1');
        Array.set('testTypeLocalAttribute1', 'testTypeLocalAttVal1');

        val = Array.get('testTypeLocalAttribute1');
        correctVal = 'testTypeLocalAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testTypeLocalAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance defineAttribute', function(test, options) {

        var obj,
            obj2,

            val,
            correctVal;

        //  ---

        //  Instance-level shared attribute

        Array.Inst.defineAttribute('testSharedInstAttribute1');
        Array.Inst.set('testSharedInstAttribute1', 'testSharedInstAttVal1');

        obj = TP.ac();

        val = obj.get('testSharedInstAttribute1');
        correctVal = 'testSharedInstAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testSharedInstAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        obj2 = TP.ac();

        val = obj2.get('testSharedInstAttribute1');
        correctVal = 'testSharedInstAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testSharedInstAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Instance-level attribute

        Array.Inst.defineAttribute('testInstAttribute1');
        obj = TP.ac();

        obj.set('testInstAttribute1', 'testInstAttVal1');

        val = obj.get('testInstAttribute1');
        correctVal = 'testInstAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testInstAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Local attribute - should *not* be seen by any other instances

        obj.defineAttribute('testLocalAttribute1');
        obj.set('testLocalAttribute1', 'testLocalAttVal1');

        val = obj.get('testLocalAttribute1');
        correctVal = 'testLocalAttVal1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('value for: ', 'testLocalAttribute1',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Inheritance - defineMethod',
function() {

    this.before(
        function() {
            TP.OOTests.commonBefore();
        });

    //  ---

    this.it('TIBET type defineMethod', function(test, options) {

        var obj,

            val,
            correctVal;

        //  ---

        TP.core.Node.Type.defineMethod('testTypeMethod1',
                                        function() {return true; });
        obj = TP.core.Node.testTypeMethod1;

        val = obj[TP.OWNER];
        correctVal = TP.core.Node;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.TYPE_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = 'TP.core.Node.Type.testTypeMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        TP.core.Node.defineMethod('testTypeLocalMethod1',
                                        function() {return true; });
        obj = TP.core.Node.testTypeLocalMethod1;

        val = obj[TP.OWNER];
        correctVal = TP.core.Node;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.TYPE_LOCAL_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = 'TP.core.Node.testTypeLocalMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance defineMethod', function(test, options) {

        var inst,

            obj,

            val,
            correctVal;

        //  ---

        TP.core.Point.Inst.defineMethod('testInstMethod1',
                                        function() {return true; });
        obj = TP.core.Point.getInstPrototype().testInstMethod1;

        val = obj[TP.OWNER];
        correctVal = TP.core.Point;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.INST_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = 'TP.core.Point.Inst.testInstMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        inst = TP.core.Point.construct(20, 30);

        inst.defineMethod('testLocalMethod1',
                                        function() {return true; });
        obj = inst.testLocalMethod1;

        val = obj[TP.OWNER];
        correctVal = inst;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.LOCAL_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = TP.id(inst) + '.testLocalMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native type defineMethod', function(test, options) {

        var inst,

            obj,

            val,
            correctVal;

        //  ---

        Array.Type.defineMethod('testTypeMethod1',
                                        function() {return true; });
        obj = Array.testTypeMethod1;

        val = obj[TP.OWNER];
        correctVal = Array;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.TYPE_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = 'Array.Type.testTypeMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        Array.defineMethod('testTypeLocalMethod1',
                                        function() {return true; });
        obj = Array.testTypeLocalMethod1;

        val = obj[TP.OWNER];
        correctVal = Array;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.TYPE_LOCAL_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = 'Array.testTypeLocalMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  When we want a method to show up on all *instances* of Functions, we
        //  message TP.FunctionProto directly.

        TP.FunctionProto.defineMethod('testInstMethod1',
                                        function() {return true; });
        obj = TP.FunctionProto.testInstMethod1;

        val = obj[TP.OWNER];
        correctVal = Function;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.INST_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = 'Function.Inst.testInstMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  When we want a method to show up on a *particular* instance of a
        //  Function, we message it directly.

        inst = function() {return false; };

        inst.defineMethod('testLocalMethod1',
                                function() {return true; });
        obj = inst.testLocalMethod1;

        val = obj[TP.OWNER];
        correctVal = inst;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.LOCAL_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = TP.id(inst) + '.testLocalMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('native instance defineMethod', function(test, options) {

        var inst,

            obj,

            val,
            correctVal;

        //  ---

        Array.Inst.defineMethod('testInstMethod1',
                                        function() {return true; });
        obj = Array.getInstPrototype().testInstMethod1;

        val = obj[TP.OWNER];
        correctVal = Array;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.INST_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = 'Array.Inst.testInstMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        inst = TP.ac('hi', 'there');

        inst.defineMethod('testInstLocalMethod1',
                                        function() {return true; });
        obj = inst.testInstLocalMethod1;

        val = obj[TP.OWNER];
        correctVal = inst;

        test.assert.isIdenticalTo(
            val,
            correctVal,
            TP.sc('TP.OWNER for: ', TP.name(obj),
                    ' should be: ', TP.name(correctVal),
                    ' not: ', TP.name(val), '.'));

        val = obj[TP.TRACK];
        correctVal = TP.LOCAL_TRACK;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.TRACK for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        val = obj[TP.DISPLAY];
        correctVal = TP.id(inst) + '.testInstLocalMethod1';

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('TP.DISPLAY for: ', TP.name(obj),
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Inheritance - C3 linearization',
function() {

    this.before(
        function() {
            //  From the canonical description of C3 linearization
            //  http://en.wikipedia.org/wiki/C3_linearization

            TP.lang.Object.defineSubtype('test.O');

            TP.test.O.defineSubtype('test.A');
            TP.test.O.defineSubtype('test.B');
            TP.test.O.defineSubtype('test.C');
            TP.test.O.defineSubtype('test.D');
            TP.test.O.defineSubtype('test.E');

            TP.test.A.defineSubtype('test.K1');
            TP.test.K1.addTraits(TP.test.B);
            TP.test.K1.addTraits(TP.test.C);

            TP.test.D.defineSubtype('test.K2');
            TP.test.K2.addTraits(TP.test.B);
            TP.test.K2.addTraits(TP.test.E);

            TP.test.D.defineSubtype('test.K3');
            TP.test.K3.addTraits(TP.test.A);

            TP.test.K1.defineSubtype('test.Z');
            TP.test.Z.addTraits(TP.test.K2);
            TP.test.Z.addTraits(TP.test.K3);
        });

    //  ---

    this.it('Inheritance - C3 linearization', function(test, options) {
        var val;

        val = TP.test.Z.computeC3Linearization();

        test.assert.isEqualTo(
            val,
            TP.ac('TP.test.Z',
                    'TP.test.K1',
                    'TP.test.K2',
                    'TP.test.K3',
                    'TP.test.D',
                    'TP.test.A',
                    'TP.test.B',
                    'TP.test.C',
                    'TP.test.E',
                    'TP.test.O',
                    'TP.lang.Object',
                    'TP.lang.RootObject',
                    'Object'));
    });

});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Inheritance - addTraits',
function() {

    var shouldThrowSetting,
        autoResolveSetting,
        func;

    this.before(
        function() {
            TP.OOTests.commonBefore();

            //  Reset our counters
            TP.OOTests.set('circleEqualsCount', 0);
            TP.OOTests.set('greaterCount', 0);
            TP.OOTests.set('smallerCount', 0);
            TP.OOTests.set('differsCount', 0);
            TP.OOTests.set('betweenCount', 0);

            shouldThrowSetting = TP.sys.shouldThrowExceptions();
            TP.sys.shouldThrowExceptions(false);

            autoResolveSetting = TP.sys.cfg('oo.$$traits_resolve');
            TP.sys.setcfg('oo.$$traits_resolve', false);
        });

    //  ---

    this.it('TIBET instance addTraits - required method trait', function(test, options) {

        var obj,
            oldLogLevel;

        //  Turn off logging of ERROR and below for now - otherwise, the fact
        //  that we haven't resolved traits properly (which is what we're
        //  testing here) will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.SEVERE);

        //  Define a type
        TP.lang.Object.defineSubtype('test.Triangle');

        //  Add the TP.test.Equality trait
        TP.test.Triangle.addTraits(TP.test.Equality);

        //  Construct an instance. Because we didn't supply an implementation of
        //  'equals' (a requirement of the TP.test.Equality trait), this should
        //  return undefined.
        obj = TP.test.Triangle.construct();

        this.refute.isDefined(
            obj,
            TP.sc('This instance of "TP.test.Triangle" should be undefined'));

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  ---

        //  Now we add an implementation of 'equals' to TP.test.Triangle
        TP.test.Triangle.Inst.defineMethod('equals', function() {return true; });

        //  Try to construct an instance again. Because we now supply an
        //  implementation of 'equals' this should return a defined object.
        obj = TP.test.Triangle.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Triangle" should be valid'));
    });

    //  ---

    this.it('TIBET instance addTraits - no-conflict traits', function(test, options) {

        var obj,
            val,
            correctVal;

        //  ---

        obj = TP.test.Circle.construct();

        //  Invoke a instance method. This should kick the 'circleEqualsCount'
        //  once.
        obj.equals();

        val = TP.OOTests.get('circleEqualsCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "circleEqualsCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Invoke a method 'traited in' from another type
        obj.greater();

        val = TP.OOTests.get('greaterCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "greaterCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Invoke a regular method that invokes a 'traited in' method
        obj.smaller();

        val = TP.OOTests.get('smallerCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "smallerCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Invoke a 'traited in' method that invokes a regular method
        obj.differs();

        val = TP.OOTests.get('differsCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "differsCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  'differs' also called the 'equals' regular method - it's count
        //  should now be 2.
        val = TP.OOTests.get('circleEqualsCount');
        correctVal = 2;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "circleEqualsCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance addTraits - conflicted traits - simple resolution', function(test, options) {

        var obj,

            val,
            correctVal,

            oldLogLevel,

            inlineCount;

        //  Turn off logging of ERROR and below for now - otherwise, the fact
        //  that we haven't resolved traits properly (which is what we're
        //  testing here) will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.SEVERE);

        //  Square Definition
        TP.lang.Object.defineSubtype('test.Square');

        //  We pick up 'equals' (TP.REQUIRED) & 'differs' from Equality by way
        //  of Magnitude and 'smaller' (TP.REQUIRED), 'greater' & 'between' from
        //  Magnitude directly. We also picked up a real implementation of
        //  'equals' from TP.test.Color.
        //  But now we have a conflict over 'getRgb' between TP.test.Color and
        //  TP.test.RGBData
        TP.test.Square.addTraits(
            TP.test.Magnitude, TP.test.Color, TP.test.RGBData);

        //  Satisfies 'smaller' from TP.test.Magnitude
        TP.test.Square.Inst.defineMethod('smaller', function() {});

        //  If an instance is made at this point, it will raise an exception
        //  that 'getRgb' is conflicted between 'TP.test.RGBData' and
        //  'TP.test.Color':
        obj = TP.test.Square.construct();

        this.refute.isDefined(
            obj,
            TP.sc('This instance of "TP.test.Square" should be undefined'));

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  ---

        //  Resolve the conflict in favor of TP.test.Color
        TP.test.Square.Inst.resolveTrait('getRgb', TP.test.Color);

        //  Try to construct an instance again. Because we now resolved the
        //  implementation of 'getRgb' this should return a defined object.
        obj = TP.test.Square.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Square" should be valid'));

        //  ---

        //  Set the test count and invoke the 'resolved' method
        TP.OOTests.set('colorGetRGBCount', 0);

        obj.getRgb();

        val = TP.OOTests.get('colorGetRGBCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "colorGetRGBCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Turn off logging of ERROR and below for now - otherwise, the fact
        //  that we haven't resolved traits properly (which is what we're
        //  testing here) will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.SEVERE);

        //  Rectangle Definition
        TP.lang.Object.defineSubtype('test.Rectangle');

        //  We pick up 'equals' (TP.REQUIRED) & 'differs' from Equality by way
        //  of Magnitude and 'smaller' (TP.REQUIRED), 'greater' & 'between' from
        //  Magnitude directly. We also picked up a real implementation of
        //  'equals' from TP.test.Color.
        //  But now we have a conflict over 'getRgb' between TP.test.Color and
        //  TP.test.RGBData
        TP.test.Rectangle.addTraits(
            TP.test.Magnitude, TP.test.Color, TP.test.RGBData);

        //  Satisfies 'smaller' from TP.test.Magnitude
        TP.test.Rectangle.Inst.defineMethod('smaller', function() {});

        //  If an instance is made at this point, it will raise an exception
        //  that 'getRgb' is conflicted between 'TP.test.RGBData' and
        //  'TP.test.Color':
        obj = TP.test.Rectangle.construct();

        this.refute.isDefined(
            obj,
            TP.sc('This instance of "TP.test.Rectangle" should be undefined'));

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  ---

        //  Resolve the conflict using an inline Function
        TP.test.Rectangle.Inst.resolveTrait('getRgb', function() {
                inlineCount = 1;
            });

        //  Try to construct an instance again. Because we now resolved the
        //  implementation of 'getRgb' this should return a defined object.
        obj = TP.test.Rectangle.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Rectangle" should be valid'));

        //  ---

        //  Set the test count and invoke the 'resolved' method
        TP.OOTests.set('colorGetRGBCount', 0);

        obj.getRgb();

        //  We should *not* have invoked the 'getRgb' method on TP.test.Color
        val = TP.OOTests.get('colorGetRGBCount');
        correctVal = 0;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "colorGetRGBCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  We *should* have invoked the inline Function as the 'getRgb' method.
        val = inlineCount;
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for the inline count',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance addTraits - conflicted traits - complex resolution', function(test, options) {

        var obj,

            val,
            correctVal,

            inlineCount,
            oldLogLevel;

        //  Turn off logging of ERROR and below for now - otherwise, the fact
        //  that we haven't resolved traits properly (which is what we're
        //  testing here) will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.SEVERE);

        //  Octogon Definition
        TP.lang.Object.defineSubtype('test.Octogon');

        //  We pick up 'equals' (TP.REQUIRED) & 'differs' from Equality by way
        //  of Magnitude and 'smaller' (TP.REQUIRED), 'greater' & 'between' from
        //  Magnitude directly. We also picked up a real implementation of
        //  'equals' from TP.test.Color.
        //  But now we have a conflict over 'getRgb' between TP.test.Color and
        //  TP.test.RGBData
        TP.test.Octogon.addTraits(
            TP.test.Magnitude, TP.test.Color, TP.test.RGBData);

        //  Satisfies 'smaller' from TP.test.Magnitude
        TP.test.Octogon.Inst.defineMethod('smaller', function() {});

        //  If an instance is made at this point, it will raise an exception
        //  that 'getRgb' is conflicted between 'TP.test.RGBData' and
        //  'TP.test.Color':
        obj = TP.test.Octogon.construct();

        this.refute.isDefined(
            obj,
            TP.sc('This instance of "TP.test.Octogon" should be undefined'));

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  ---

        //  Resolve the conflict in favor of TP.test.Color, but renaming it
        //  'getRgbData'.
        TP.test.Octogon.Inst.resolveTrait('getRgb', TP.test.Color,
                                            'getRgbData');

        //  Try to construct an instance again. Because we now resolved the
        //  implementation of 'getRgb' this should return a defined object.
        obj = TP.test.Octogon.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Octogon" should be valid'));

        //  ---

        //  Set the test count and invoke the 'resolved' method
        TP.OOTests.set('colorGetRGBCount', 0);

        //  Call it using the new name we gave it above.
        obj.getRgbData();

        //  We should have invoked the 'getRgb' method on TP.test.Color, even
        //  though we called it 'getRgbData'.
        val = TP.OOTests.get('colorGetRGBCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "colorGetRGBCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Hexagon Definition
        TP.lang.Object.defineSubtype('test.Hexagon');

        //  We pick up 'equals' (TP.REQUIRED) & 'differs' from Equality by way
        //  of Magnitude and 'smaller' (TP.REQUIRED), 'greater' & 'between' from
        //  Magnitude directly. We also picked up a real implementation of
        //  'equals' from TP.test.Color.
        //  But now we have a conflict over 'getRgb' between TP.test.Color and
        //  TP.test.RGBData
        TP.test.Hexagon.addTraits(
            TP.test.Magnitude, TP.test.Color, TP.test.RGBData);

        //  Satisfies 'smaller' from TP.test.Magnitude
        TP.test.Hexagon.Inst.defineMethod('smaller', function() {});

        //  This is TP.test.Hexagon's own implementation of 'getRgb'
        TP.test.Hexagon.Inst.defineMethod('getRgb', function() {
                inlineCount = 1;
            });

        //  Resolve the conflict in favor of TP.test.Color, but executing the
        //  one on TP.test.Hexagon first.
        TP.test.Hexagon.Inst.resolveTrait('getRgb', TP.test.Color, TP.BEFORE);

        //  Try to construct an instance again. Because we now resolved the
        //  implementation of 'getRgb' this should return a defined object.
        obj = TP.test.Hexagon.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Hexagon" should be valid'));

        //  ---

        //  Set the test count and invoke the 'resolved' method
        TP.OOTests.set('colorGetRGBCount', 0);

        obj.getRgb();

        //  We should have invoked the 'getRgb' method on TP.test.Color
        val = TP.OOTests.get('colorGetRGBCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "colorGetRGBCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  We *should* have invoked the main type's instance method as well.
        val = inlineCount;
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for the inline count',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  Pentagon Definition
        TP.lang.Object.defineSubtype('test.Pentagon');

        //  We pick up 'equals' (TP.REQUIRED) & 'differs' from Equality by way
        //  of Magnitude and 'smaller' (TP.REQUIRED), 'greater' & 'between' from
        //  Magnitude directly. We also picked up a real implementation of
        //  'equals' from TP.test.Color.
        //  But now we have a conflict over 'getRgb' between TP.test.Color and
        //  TP.test.RGBData
        TP.test.Pentagon.addTraits(
            TP.test.Magnitude, TP.test.Color, TP.test.RGBData);

        //  Satisfies 'smaller' from TP.test.Magnitude
        TP.test.Pentagon.Inst.defineMethod('smaller', function() {});

        //  This is TP.test.Pentagon's own implementation of 'getRgb'
        TP.test.Pentagon.Inst.defineMethod('getRgb', function() {
                inlineCount = 1;
            });

        //  Resolve the conflict in favor of TP.test.Color, but executing the
        //  one on TP.test.Pentagon first.
        TP.test.Pentagon.Inst.resolveTrait('getRgb', TP.test.Color, TP.AFTER);

        //  Try to construct an instance again. Because we now resolved the
        //  implementation of 'getRgb' this should return a defined object.
        obj = TP.test.Pentagon.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Pentagon" should be valid'));

        //  ---

        //  Set the test count and invoke the 'resolved' method
        TP.OOTests.set('colorGetRGBCount', 0);

        obj.getRgb();

        //  We should have invoked the 'getRgb' method on TP.test.Color
        val = TP.OOTests.get('colorGetRGBCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "colorGetRGBCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  ---

        //  We *should* have invoked the main type's instance method as well.
        val = inlineCount;
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for the inline count',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.it('TIBET instance addTraits - conflicted traits - automatic resolution', function(test, options) {

        var obj,

            val,
            correctVal;

        //  For this particular test, we undo the behavior we have in the
        //  before() / after() and turn trait autoresolution on

        TP.sys.setcfg('oo.$$traits_resolve', true);

        //  ---

        //  Diamond Definition
        TP.lang.Object.defineSubtype('test.Diamond');

        //  We pick up 'equals' (TP.REQUIRED) & 'differs' from Equality by way
        //  of Magnitude and 'smaller' (TP.REQUIRED), 'greater' & 'between' from
        //  Magnitude directly. We also picked up a real implementation of
        //  'equals' from TP.test.Color.
        //  But now we have a conflict over 'getRgb' between TP.test.Color and
        //  TP.test.RGBData
        TP.test.Diamond.addTraits(
            TP.test.Magnitude, TP.test.Color, TP.test.RGBData);

        //  Satisfies 'smaller' from TP.test.Magnitude
        TP.test.Diamond.Inst.defineMethod('smaller', function() {});

        //  Since auto resolution is turned on, if an instance is made at this
        //  point, it will automatically resolve any conflicts and the instance
        //  will be real. This should've resolved the conflict in favor of the
        //  'TP.test.Color' type.
        obj = TP.test.Diamond.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Diamond" should be valid'));

        //  ---

        //  Set the test count and invoke the 'resolved' method
        TP.OOTests.set('colorGetRGBCount', 0);

        obj.getRgb();

        val = TP.OOTests.get('colorGetRGBCount');
        correctVal = 1;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "colorGetRGBCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));

        //  Turn auto resolution back off
        TP.sys.setcfg('oo.$$traits_resolve', false);
    });

    //  ---

    func = function(aRequest) {

        var obj,

            val,
            correctVal;

        //  First, make trait type and extend it.
        TP.lang.Object.defineSubtype('test.Dimension');

        //  Define an 'equals' method on it
        TP.test.Dimension.Inst.defineMethod('equals', function() {
            TP.OOTests.set(
                'dimensionEqualsCount',
                    TP.OOTests.get('dimensionEqualsCount') + 1);
        });

        //  Make a subtype of that
        TP.test.Dimension.defineSubtype('test.AnotherDimension');

        //  Define an 'equals' method on it - calling 'up' to its supertype
        TP.test.AnotherDimension.Inst.defineMethod('equals', function() {
            this.callNextMethod();
        });

        //  DimensionedThing Definition
        TP.lang.Object.defineSubtype('test.DimensionedThing');

        //  We pick up 'equals' (TP.REQUIRED) & 'differs' from Equality by way
        //  of Magnitude and 'smaller' (TP.REQUIRED), 'greater' & 'between' from
        //  Magnitude directly. We also picked up a real implementation of
        //  'equals' from TP.test.AnotherDimension.
        TP.test.DimensionedThing.addTraits(
                TP.test.Magnitude, TP.test.AnotherDimension);

        //  Satisfies 'smaller' from TP.test.Magnitude
        TP.test.DimensionedThing.Inst.defineMethod('smaller', function() {
        });

        obj = TP.test.DimensionedThing.construct();

        //  Set the test count and invoke the 'resolved' method
        TP.OOTests.set('dimensionEqualsCount', 0);

        obj.equals();

        val = TP.OOTests.get('dimensionEqualsCount');
        correctVal = 1;

        this.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "dimensionEqualsCount"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    };
    func.noCalleePatch = true;

    this.it('TIBET instance addTraits - conflicted traits - callNextMethod()',
            func);

    //  ---

    this.it('TIBET instance addTraits - required attribute trait', function(test, options) {

        var obj;

        //  Define a type
        TP.lang.Object.defineSubtype('test.Quadrangle');

        //  Add the TP.test.Equality trait
        TP.test.Quadrangle.addTraits(TP.test.Equality);

        //  Now we add an implementation of 'equals' to TP.test.Quadrangle
        TP.test.Quadrangle.Inst.defineMethod('equals',
                                                function() {return true; });

        //  Try to construct an instance again. Because we now supply an
        //  implementation of 'equals' this should return a defined object.
        obj = TP.test.Quadrangle.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Quadrangle" should be valid'));
    });

    //  ---

    this.it('TIBET instance addTraits - required attribute trait', function(test, options) {

        var obj,

            val,
            correctVal,

            oldLogLevel;

        //  Turn off logging of ERROR and below for now - otherwise, the fact
        //  that we haven't resolved traits properly (which is what we're
        //  testing here) will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.SEVERE);

        //  Define a type
        TP.lang.Object.defineSubtype('test.Ellipsis');

        //  Add the TP.test.Equality trait
        TP.test.Ellipsis.addTraits(TP.test.Equality);

        //  Now we add a value for 'doesDiffer' to TP.test.Ellipsis that will be
        //  different than the one on TP.test.Equality.
        TP.test.Ellipsis.Inst.defineAttribute('doesDiffer', false);

        //  Now we add an implementation of 'equals' to TP.test.Ellipsis
        TP.test.Ellipsis.Inst.defineMethod('equals', function() {return true; });

        //  Construct an instance. Because we didn't supply a resolution of
        //  'doesDiffer' this should return undefined.
        obj = TP.test.Ellipsis.construct();

        this.refute.isDefined(
            obj,
            TP.sc('This instance of "TP.test.Ellipsis" should be undefined'));

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  Resolve the conflict in favor of TP.test.Color
        TP.test.Ellipsis.Inst.resolveTrait('doesDiffer',
                                            TP.test.Equality,
                                            function(ellipsisVal, equalityVal) {
                                                return ellipsisVal;
                                            });

        //  Try to construct an instance again. Because we now supply a
        //  resolution for 'doesDiffer' this should return a defined object.
        obj = TP.test.Ellipsis.construct();

        test.assert.isValid(
            obj,
            TP.sc('This instance of "TP.test.Ellipsis" should be valid'));

        //  When we 'get' doesDiffer, it should be the value 'false', since we
        //  resolved it using TP.test.Ellipsis's value.
        val = obj.get('doesDiffer');
        correctVal = false;

        test.assert.isEqualTo(
            val,
            correctVal,
            TP.sc('The count for "doesDiffer"',
                    ' should be: ', correctVal,
                    ' not: ', val, '.'));
    });

    //  ---

    this.after(
        function() {
            TP.OOTests.commonAfter();

            TP.sys.shouldThrowExceptions(shouldThrowSetting);

            TP.sys.setcfg('oo.$$traits_resolve', autoResolveSetting);
        });
});

//  ------------------------------------------------------------------------

TP.OOTests.describe('Inheritance - callNextMethod',
function() {

    this.before(
        function() {

            TP.OOTests.commonBefore();

            //  ---

            TP.lang.Object.defineSubtype('test.FooType');

            TP.test.FooType.Type.defineAttribute('species');
            TP.test.FooType.Inst.defineAttribute('theName');

            TP.test.FooType.Type.defineMethod('giveSpecies',
            function(aSpecies) {
                this.set('species', aSpecies);
            });

            TP.test.FooType.Inst.defineMethod('giveName',
            function(aName) {
                this.set('theName', aName);
            });

            //  ---

            TP.test.FooType.defineSubtype('test.BarType');

            TP.test.BarType.Type.defineMethod('giveSpecies',
            function(aSpecies) {
                this.callNextMethod();
            });

            TP.test.BarType.Inst.defineMethod('giveName',
            function(aName) {
                this.callNextMethod();
            });

            //  ---

            TP.test.BarType.defineSubtype('test.BazType');

            TP.test.BazType.Type.defineMethod('giveSpecies',
            function(aSpecies) {
                //  BazType will always have its species set to 'feline',
                //  no matter what the caller wanted.
                this.callNextMethod('feline');
            });

            TP.test.BazType.Inst.defineMethod('giveName',
            function(aName) {
                //  Instances of BazType will always have their name set to
                //  'fluffy', no matter what the caller wanted.
                this.callNextMethod('fluffy');
            });
        });

    //  ---

    this.it('TP.lang.RootObject callNextMethod()', function(test, options) {

        var newBar,
            nameVal,

            newBaz,

            speciesVal;

        //  ---
        //  Type-level callNextMethod
        //  ---

        TP.test.BarType.giveSpecies('human');

        speciesVal = TP.test.BarType.get('species');

        test.assert.isEqualTo(
            speciesVal,
            'human',
            TP.sc('\'species\' should be "human"', ' not: ', speciesVal, '.'));

        //  ---

        TP.test.BazType.giveSpecies('human');

        speciesVal = TP.test.BazType.get('species');

        //  BazType will always have its species set to 'feline', no matter
        //  what we supplied.
        test.assert.isEqualTo(
            speciesVal,
            'feline',
            TP.sc('\'species\' should be "feline"', ' not: ',
                    speciesVal, '.'));

        //  ---
        //  Instance-level callNextMethod
        //  ---

        newBar = TP.test.BarType.construct();
        newBar.giveName('Fred');

        nameVal = newBar.get('theName');

        test.assert.isEqualTo(
            nameVal,
            'Fred',
            TP.sc('\'name\' should be "Fred"', ' not: ', nameVal, '.'));

        newBaz = TP.test.BazType.construct();
        newBaz.giveName('Frank');

        nameVal = newBaz.get('theName');

        //  Instances of BazType will always have their name set to 'fluffy',
        //  no matter what we supplied.
        test.assert.isEqualTo(
            nameVal,
            'fluffy',
            TP.sc('\'name\' should be "fluffy"', ' not: ', nameVal, '.'));
    });

    //  ---

    this.after(
        function() {

            var metadata;

            TP.OOTests.commonAfter();

            //  Custom types
            delete TP.test.FooType;
            delete TP.test.BarType;
            delete TP.test.BazType;

            //  Manually remove the metadata for the above
            metadata = TP.sys.getMetadata('types');

            metadata.removeKey('TP.test.FooType');
            metadata.removeKey('TP.test.BarType');
            metadata.removeKey('TP.test.BazType');
        });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
