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

    this.it('Eval string and return result', async function(test, options) {

        var worker,
            result;

        worker = TP.core.GenericWorker.construct();

        result = await worker.eval('1 + 2');
        test.assert.isEqualTo(result, 3);
    });

    //  ---

    this.it('Import script, invoke function and return result', async function(test, options) {

        var worker,
            loc,
            result;

        worker = TP.core.GenericWorker.construct();

        loc = TP.uc('~lib_test/src/tibet/worker/test_import_script.js').getLocation();

        await worker.import(loc);

        result = await worker.eval('testMessage()');
        test.assert.isEqualTo(result, 'This is a test message');
    });

    //  ---

    this.it('define method, invoke it and return result', async function(test, options) {

        var worker,
            result;

        worker = TP.core.GenericWorker.construct();

        await worker.defineWorkerMethod(
                'testMethod',
                function() {
                    return 'This is a test message from the test method';
                });

        result = await worker.testMethod();
        test.assert.isEqualTo(result, 'This is a test message from the test method');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
