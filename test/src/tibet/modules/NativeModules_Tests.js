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

    this.it('Load native class', function(test, options) {

        return TP.sys.importModule(
                TP.uc('~lib_test/src/tibet/modules/ECMAModuleNoImport.js')).then(
                    function(module) {
                        const {MyObject} = module;

                        console.log('GOT HERE: ', MyObject);

                        test.assert.isValid(MyObject);
                    });
    });
}).skip(!TP.sys.isHTTPBased()); //  ECMA modules don't work with file:// URLs

/* eslint-enable class-methods-use-this */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
