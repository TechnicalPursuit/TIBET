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
 * Tests for native ECMAScript modules.
 */

//  ------------------------------------------------------------------------

//  Create a singleton object we can hang tests off since reflection and
//  inheritance testing ranges across a broad range of objects including
//  namespace objects (TP for example) which don't current inherit/support the
//  testing API. This is an example of "detached test definition".

TP.test.NativeModuleTester = TP.lang.Object.construct();

//  ------------------------------------------------------------------------

/* eslint-disable class-methods-use-this */

TP.test.NativeModuleTester.describe('Use Native Class from Module',
function() {

    this.it('Load native class with no dependencies', function(test, options) {

        return TP.sys.importModule(
                TP.uc('~lib_test/src/tibet/modules/ECMAModuleNoImport.js')).then(
                    function(module) {
                        const {MyObject} = module;

                        test.assert.isNativeType(MyObject);
                    });
    });

    //  ---

    this.it('Load native class with single URL dependency', function(test, options) {

        return TP.sys.importModule(
                TP.uc('~lib_test/src/tibet/modules/ECMAModuleStandardImport.js')).then(
                    function(module) {
                        const {AnotherObject} = module;

                        test.assert.isNativeType(AnotherObject);
                    });
    });

    //  ---

    this.it('Load native class with single bare specifier dependency', function(test, options) {

        return TP.sys.importModule(
                TP.uc('~lib_test/src/tibet/modules/ECMAModuleBareSpecifierImport.js')).then(
                    function(module) {
                        const {AnotherBareSpecifierObject} = module;

                        test.assert.isNativeType(AnotherBareSpecifierObject);
                    });
    });
});

//  ------------------------------------------------------------------------

TP.test.NativeModuleTester.describe('Use TIBET-derived Class from Module',
function() {

    this.it('Load TIBET-derived class from a whole namespace import', function(test, options) {

        return TP.sys.importModule(
                TP.uc('~lib_test/src/tibet/modules/ECMAModuleWholeTIBETNSImport.js')).then(
                    function(module) {
                        const {AnotherPoint, YetAnotherPoint} = module;

                        test.assert.isNativeType(AnotherPoint);
                        test.assert.isNativeType(YetAnotherPoint);
                    });
    });

    //  ---

    this.it('Load TIBET-derived class from a whole namespace and individual type import', function(test, options) {

        return TP.sys.importModule(
                TP.uc('~lib_test/src/tibet/modules/ECMAModuleMixedTIBETNSAndTypeImport.js')).then(
                    function(module) {
                        const {Rect, AnotherRect, YetAnotherRect, AThirdRect} = module;

                        test.assert.isNativeType(Rect);
                        test.assert.isNativeType(AnotherRect);
                        test.assert.isNativeType(YetAnotherRect);
                        test.assert.isNativeType(AThirdRect);
                    });
    });

    //  ---

    this.it('Load TIBET-derived class from a whole namespace and individual type import', function(test, options) {

        return TP.sys.importModule(
                TP.uc('~lib_test/src/tibet/modules/ECMAModuleMixedTIBETNSAndTypeImport.js')).then(
                    function(module) {
                        const {Rect, AnotherRect, YetAnotherRect, AThirdRect} = module;

                        test.assert.isNativeType(Rect);
                        test.assert.isNativeType(AnotherRect);
                        test.assert.isNativeType(YetAnotherRect);
                        test.assert.isNativeType(AThirdRect);
                    });
    });

    //  ---

    this.it('Load TIBET-derived class from a whole namespace and individual type import with an alias', function(test, options) {

        return TP.sys.importModule(
                TP.uc('~lib_test/src/tibet/modules/ECMAModuleMixedTIBETNSAndTypeImportWithAlias.js')).then(
                    function(module) {
                        const {FooFoo, AnotherMatrix, YetAnotherMatrix, AThirdMatrix} = module;

                        test.assert.isNativeType(FooFoo);
                        test.assert.isNativeType(AnotherMatrix);
                        test.assert.isNativeType(YetAnotherMatrix);
                        test.assert.isNativeType(AThirdMatrix);
                    });
    });

});

/* eslint-enable class-methods-use-this */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
