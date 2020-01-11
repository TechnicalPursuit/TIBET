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
 * Tests for native ECMAScript 6 classes derived from TIBET types.
 */

//  ------------------------------------------------------------------------

//  Create a singleton object we can hang tests off since reflection and
//  inheritance testing ranges across a broad range of objects including
//  namespace objects (TP for example) which don't current inherit/support the
//  testing API. This is an example of "detached test definition".

TP.test.OONativeClassTester = TP.lang.Object.construct();

//  ------------------------------------------------------------------------

/* eslint-disable class-methods-use-this */

TP.test.OONativeClassTester.describe('Inheritance - defineNativeClass',
function() {

    this.it('TP.lang.RootObject defineNativeClass()', function(test, options) {

        TP.lang.Object.defineNativeClass('TP.test.TestNativeClass',
            class {
            });

        test.assert.isType(TP.test.TestNativeClass);

        test.assert.isEqualTo(TP.test.TestNativeClass.getID(),
                                'TP.test.TestNativeClass');
        test.assert.isEqualTo(TP.test.TestNativeClass.getName(),
                                'TP.test.TestNativeClass');
        test.assert.isEqualTo(TP.test.TestNativeClass.getLocalName(),
                                'TestNativeClass');

        test.assert.isIdenticalTo(TP.test.TestNativeClass.getType(),
                                    TP.meta.test.TestNativeClass);
        test.assert.isEqualTo(TP.test.TestNativeClass.getTypeName(),
                                'TP.meta.test.TestNativeClass');

        test.assert.isIdenticalTo(TP.test.TestNativeClass.getNamespaceObject(),
                                    TP.test);
        test.assert.isEqualTo(TP.test.TestNativeClass.getNamespacePrefix(),
                                'test');
        test.assert.isEqualTo(TP.test.TestNativeClass.getNamespaceRoot(),
                                'TP');

        test.assert.isIdenticalTo(TP.test.TestNativeClass.getSupertype(),
                                    TP.lang.Object);
        test.assert.isEqualTo(TP.test.TestNativeClass.getSupertypeName(),
                                'TP.lang.Object');
        test.assert.isEqualTo(TP.test.TestNativeClass.getSupertypeNames(),
                                TP.ac('TP.lang.Object',
                                        'TP.lang.RootObject',
                                        'Object'));
    });
});

//  ------------------------------------------------------------------------

TP.test.OONativeClassTester.describe('NativeClass - simple inheritance',
function() {

    //  ---

    this.it('Subclassing TP.lang.RootObject', function(test, options) {

        var executedConstructor,

            executedClassMethod,
            executedInstanceMethod,
            executedInstanceInitMethod,

            newE6Inst;

        executedConstructor = false;
        executedClassMethod = false;
        executedInstanceMethod = false;
        executedInstanceInitMethod = false;

        TP.lang.Object.defineNativeClass(
            'TP.test.NativeE6Class',
            class extends Object {
                constructor() {
                    super();

                    executedConstructor = true;
                }

                static testClassMethod() {
                    executedClassMethod = true;
                }

                init() {
                    executedInstanceInitMethod = true;
                }

                testInstanceMethod() {
                    executedInstanceMethod = true;
                }
            }
        );

        //  ---

        test.assert.isFalse(executedClassMethod);

        TP.test.NativeE6Class.testClassMethod();

        test.assert.isTrue(executedClassMethod);

        //  ---

        test.assert.isFalse(executedConstructor);
        test.assert.isFalse(executedInstanceInitMethod);

        newE6Inst = new TP.test.NativeE6Class();

        test.assert.isTrue(executedConstructor);
        test.assert.isTrue(executedInstanceInitMethod);

        //  ---

        test.assert.isFalse(executedInstanceMethod);

        newE6Inst.testInstanceMethod();

        test.assert.isTrue(executedInstanceMethod);
    });

    //  ---

    this.it('Subclassing TP.gui.Point', function(test, options) {

        var executedConstructor,

            executedClassMethod,
            executedInstanceMethod,
            executedInstanceInitMethod,

            newE6Point,
            newE6PolarPoint;

        executedConstructor = false;
        executedClassMethod = false;
        executedInstanceMethod = false;
        executedInstanceInitMethod = false;

        TP.gui.Point.defineNativeClass(
            'TP.test.NativeE6PointClass',
            class extends Object {
                constructor(x, y) {
                    super(x, y);

                    executedConstructor = true;
                }

                static testClassMethod() {
                    executedClassMethod = true;
                }

                static constructFromPolar(radius, angle) {
                    return super.constructFromPolar(radius, angle);
                }

                init(x, y) {
                    super.init(x, y);
                    executedInstanceInitMethod = true;
                }

                testInstanceMethod() {
                    executedInstanceMethod = true;
                }

                add(aPoint) {
                    super.add(aPoint.addToX(10));
                }
            }
        );

        //  ---

        test.assert.isFalse(executedClassMethod);

        TP.test.NativeE6PointClass.testClassMethod();

        test.assert.isTrue(executedClassMethod);

        //  ---

        test.assert.isFalse(executedConstructor);
        test.assert.isFalse(executedInstanceInitMethod);

        newE6Point = new TP.test.NativeE6PointClass(42, 42);
        test.assert.isValid(newE6Point);

        test.assert.isTrue(executedConstructor);
        test.assert.isTrue(executedInstanceInitMethod);

        //  ---

        test.assert.isFalse(executedInstanceMethod);

        newE6Point.testInstanceMethod();

        test.assert.isTrue(executedInstanceMethod);

        //  ---

        test.assert.isEqualTo(newE6Point.getX(), 42);
        test.assert.isEqualTo(newE6Point.getY(), 42);

        //  ---

        newE6PolarPoint = TP.test.NativeE6PointClass.constructFromPolar(5, 5);
        test.assert.isValid(newE6PolarPoint);

        //  ---

        test.assert.isEqualTo(newE6PolarPoint.getX().round(2), 4.98);
        test.assert.isEqualTo(newE6PolarPoint.getY().round(2), 0.44);

        //  ---

        newE6Point = new TP.test.NativeE6PointClass(42, 42);

        newE6Point.add(TP.pc(5, 5));

        test.assert.isEqualTo(newE6Point.getX(), 57);
        test.assert.isEqualTo(newE6Point.getY(), 47);
    });
});

//  ------------------------------------------------------------------------

TP.test.OONativeClassTester.describe('NativeClass - complex inheritance',
function() {

    //  ---

    this.it('Subclassing a subclass of TP.gui.Point', function(test, options) {

        var executedL1Constructor,

            executedL1ClassMethod,
            executedL1InstanceMethod,
            executedL1InstanceInitMethod,

            newL1Point,
            newL1PolarPoint,

            executedL2Constructor,

            executedL2ClassMethod,
            executedL2InstanceMethod,

            newL2Point,
            newL2PolarPoint;

        executedL1Constructor = false;
        executedL1ClassMethod = false;
        executedL1InstanceMethod = false;
        executedL1InstanceInitMethod = false;

        TP.gui.Point.defineNativeClass(
            'TP.test.LevelOnePoint',
            class extends Object {
                constructor(x, y) {
                    super(x, y);

                    executedL1Constructor = true;
                }

                static testClassMethod() {
                    executedL1ClassMethod = true;
                }

                static constructFromPolar(radius, angle) {
                    return super.constructFromPolar(radius, angle);
                }

                init(x, y) {
                    super.init(x, y);
                    executedL1InstanceInitMethod = true;
                }

                testInstanceMethod() {
                    executedL1InstanceMethod = true;
                }

                add(aPoint) {
                    super.add(aPoint.addToX(10));
                }
            }
        );

        //  ---

        test.assert.isFalse(executedL1ClassMethod);

        TP.test.LevelOnePoint.testClassMethod();

        test.assert.isTrue(executedL1ClassMethod);

        //  ---

        test.assert.isFalse(executedL1Constructor);
        test.assert.isFalse(executedL1InstanceInitMethod);

        newL1Point = new TP.test.LevelOnePoint(42, 42);
        test.assert.isValid(newL1Point);

        test.assert.isTrue(executedL1Constructor);
        test.assert.isTrue(executedL1InstanceInitMethod);

        //  ---

        test.assert.isFalse(executedL1InstanceMethod);

        newL1Point.testInstanceMethod();

        test.assert.isTrue(executedL1InstanceMethod);

        //  ---

        test.assert.isEqualTo(newL1Point.getX(), 42);
        test.assert.isEqualTo(newL1Point.getY(), 42);

        //  ---

        newL1PolarPoint = TP.test.LevelOnePoint.constructFromPolar(5, 5);
        test.assert.isValid(newL1PolarPoint);

        //  ---

        test.assert.isEqualTo(newL1PolarPoint.getX().round(2), 4.98);
        test.assert.isEqualTo(newL1PolarPoint.getY().round(2), 0.44);

        //  ---

        newL1Point = new TP.test.LevelOnePoint(42, 42);

        newL1Point.add(TP.pc(5, 5));

        test.assert.isEqualTo(newL1Point.getX(), 57);
        test.assert.isEqualTo(newL1Point.getY(), 47);

        //  --------------------------------------------------------------------

        executedL1Constructor = false;
        executedL1ClassMethod = false;
        executedL1InstanceMethod = false;
        executedL1InstanceInitMethod = false;

        executedL2Constructor = false;
        executedL2ClassMethod = false;
        executedL2InstanceMethod = false;

        class LevelTwoPoint extends TP.test.LevelOnePoint {

            constructor(x, y) {
                super(x + 10, y + 10);
                executedL2Constructor = true;
            }

            static testClassMethod() {
                super.testClassMethod();
                executedL2ClassMethod = true;
            }

            static constructFromPolar(radius, angle) {
                return super.constructFromPolar(radius, angle);
            }

            testInstanceMethod() {
                super.testInstanceMethod();
                executedL2InstanceMethod = true;
            }
        }

        //  ---

        test.assert.isFalse(executedL1ClassMethod);
        test.assert.isFalse(executedL2ClassMethod);

        LevelTwoPoint.testClassMethod();

        test.assert.isTrue(executedL1ClassMethod);
        test.assert.isTrue(executedL2ClassMethod);

        //  ---

        test.assert.isFalse(executedL1Constructor);
        test.assert.isFalse(executedL1InstanceInitMethod);
        test.assert.isFalse(executedL2Constructor);

        newL2Point = new LevelTwoPoint(42, 42);
        test.assert.isValid(newL2Point);

        test.assert.isTrue(executedL1Constructor);
        test.assert.isTrue(executedL1InstanceInitMethod);
        test.assert.isTrue(executedL2Constructor);

        //  ---

        test.assert.isFalse(executedL1InstanceMethod);
        test.assert.isFalse(executedL2InstanceMethod);

        newL2Point.testInstanceMethod();

        test.assert.isTrue(executedL1InstanceMethod);
        test.assert.isTrue(executedL2InstanceMethod);

        //  ---

        //  Level 2 points add 10 to the initial values given to them.

        test.assert.isEqualTo(newL2Point.getX(), 52);
        test.assert.isEqualTo(newL2Point.getY(), 52);

        //  ---

        newL2PolarPoint = LevelTwoPoint.constructFromPolar(5, 5);
        test.assert.isValid(newL2PolarPoint);

        //  ---

        test.assert.isEqualTo(newL2PolarPoint.getX().round(2), 14.98);
        test.assert.isEqualTo(newL2PolarPoint.getY().round(2), 10.44);

        //  ---

        newL2Point = new LevelTwoPoint(42, 42);

        newL2Point.add(TP.pc(5, 5));

        test.assert.isEqualTo(newL2Point.getX(), 67);
        test.assert.isEqualTo(newL2Point.getY(), 57);

    });
});

/* eslint-enable class-methods-use-this */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
