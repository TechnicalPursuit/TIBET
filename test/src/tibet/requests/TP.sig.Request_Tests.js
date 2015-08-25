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
 * Tests for request methods.
 */

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.describe('TP.sig.Request - chaining then() on response',
function() {

    this.it('Function request - synchronous success', function(test, options) {

        var testFunction,

            testRequest,
            testResponse,

            testPromise,

            testResult;

        testResult = '';

        testFunction = function() {
                            return 'Hi there!';
                        };

        testRequest = testFunction.asFunctionRequest();
        testResponse = testRequest.fire();

        //  Note here how we capture the Promise returned by 'then()'ing the
        //  response and return it below from this test method. This is so that
        //  it will get hooked up in the internal Promise chain for the test
        //  harness and the code in 'test.then(...)' below will be executed
        //  *after* the Promise.
        testPromise = testResponse.then(
                function(aResult) {
                    testResult = 'The message is: ' + aResult;
                });

        test.then(
                function(result) {
                    test.assert.isEqualTo(
                            testResult,
                            'The message is: Hi there!');
                });

        return testPromise;
    });

});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.sig.Request.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
