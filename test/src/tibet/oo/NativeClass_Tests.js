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

/* eslint-enable class-methods-use-this */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
