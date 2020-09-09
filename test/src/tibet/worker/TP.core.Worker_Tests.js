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
//  TP.core.GenericWorker
//  ========================================================================

TP.core.GenericWorker.Inst.describe('TP.core.GenericWorker',
function() {

    //  ---

    this.it('Eval string and return result', function(test, options) {

        var worker;

        worker = TP.core.GenericWorker.construct();

        test.chainPromise(
            worker.eval('1 + 2').then(
                function(result) {
                    test.assert.isEqualTo(result, 3);
                }));
    });

    //  ---

    this.it('Import script, invoke function and return result', function(test, options) {

        var worker,
            loc;

        worker = TP.core.GenericWorker.construct();

        loc = TP.uc('~lib_test/src/tibet/worker/test_import_script.js').getLocation();

        test.chainPromise(
            worker.import(loc).then(
                function(result) {
                    return worker.eval('testMessage()');
                }).then(
                function(result) {
                    test.assert.isEqualTo(result, 'This is a test message');
                }));
    });

    //  ---

    this.it('define method, invoke it and return result', function(test, options) {

        var worker;

        worker = TP.core.GenericWorker.construct();

        test.chainPromise(
            worker.defineWorkerMethod(
                'testMethod',
                function() {
                    return 'This is a test message from the test method';
                }).then(
                function() {
                    return worker.testMethod();
                }).then(
                function(result) {
                    test.assert.isEqualTo(result, 'This is a test message from the test method');
                }));
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
