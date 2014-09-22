//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
*/

//	------------------------------------------------------------------------

TP.lang.Object.defineSubtype('tsh.Driver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * An object that will provide an API to manage Promises for this driver. When
 * executing in the test harness, this will typically be the currently executing
 * test case.
 * @type {Object}
 */
TP.tsh.Driver.Inst.defineAttribute('promiseProvider');

//	------------------------------------------------------------------------
//	Instance Methods
//	------------------------------------------------------------------------

TP.tsh.Driver.Inst.defineMethod('execShellTest',
function(test, shellInput, valueTestFunction)
{
	/**
	*/

    this.get('promiseProvider').thenPromise(
        function(resolver, rejector) {
            var threwMsg;

            threwMsg = '';

            //  Flip the flag on to ignore eval() errors in the TSH. We'll test
            //  for undefined values here.
            TP.sys.setcfg('tsh.ignore_eval_errors', true);

            TP.shell(
                shellInput,
                false, false, true, null,
                function (aSignal, stdioResults) {
                    var testResult;

                    //  The shell request itself succeeded. See if it returned
                    //  the correct value.

                    try {

                        //  The correct value should be in the stdout that is
                        //  made available to this method.
                        testResult = stdioResults.at('stdout').first();

                        //  Execute the supplied value test function.
                        if (TP.isCallable(valueTestFunction)) {
                            valueTestFunction(testResult);
                        }

                        //  The value test function succeeded.
                        resolver(testResult);

                    } catch (e) {

                        //  There was an Error somewhere - call the rejector
                        //  with the Error object.
                        rejector(e);
                    }

                    //  Make sure to put the flag back that caused the TSH to
                    //  ignore eval() errors.
                    TP.sys.setcfg('tsh.ignore_eval_errors', false);
                },
                function (aSignal, stdioResults) {
                    var errMsg;

                    //  Make sure to put the flag back that caused the TSH to
                    //  ignore eval() errors.
                    TP.sys.setcfg('tsh.ignore_eval_errors', false);

                    //  The shell couldn't complete the request - call the
                    //  rejector with the content of whatever was placed into
                    //  stderr.

                    errMsg = stdioResults.at('stderr').join('\n');

                    rejector(errMsg);

                    //  Make sure to fail the test.
                    test.set('faultText', (errMsg || ''));
                });
        });

	return;
});

//	------------------------------------------------------------------------

TP.tsh.Driver.Inst.defineMethod('execOutputTest',
function(test, inputVal, correctResults)
{
	/**
	*/

    this.execShellTest(
        test,
        inputVal,
        function (testResult) {

            correctResults.perform(
                function (kvPair) {
                    var correctResultKey,
                        correctResultValue,

                        testResultValue;

                    correctResultKey = kvPair.first();
                    correctResultValue = kvPair.last();

                    //  Check to make sure the test produced a result at the
                    //  particular key
                    test.assert.isValid(
                        testResultValue = testResult.at(correctResultKey),
                        TP.join('Expected result at: "',
                                    correctResultKey,
                                    '"'));

                    test.assert.isEqualTo(
                        testResultValue.at('Original value tname'),
                        correctResultValue.at('Original value tname'),
                        TP.join(
                            '"', inputVal, '"',
                            ' produced original result for key: "',
                                correctResultKey,
                                '" of type: "',
                            testResultValue.at('Original value tname'),
                            '" should be: "',
                            correctResultValue.at('Original value tname'),
                            '".'));

                    test.assert.isEqualTo(
                        testResultValue.at('Original value'),
                        correctResultValue.at('Original value'),
                        TP.join(
                            '"', inputVal, '"',
                            ' produced original result for key: "',
                                correctResultKey,
                                '" of: "',
                            testResultValue.at('Original value'),
                            '" should be: "',
                            correctResultValue.at('Original value'),
                            '".'));

                    test.assert.isEqualTo(
                        testResultValue.at('Expanded value tname'),
                        correctResultValue.at('Expanded value tname'),
                        TP.join(
                            '"', inputVal, '"',
                            ' produced expanded result for key: "',
                                correctResultKey,
                                '" of type: "',
                            testResultValue.at('Expanded value tname'),
                            '" should be: "',
                            correctResultValue.at('Expanded value tname'),
                            '".'));

                    test.assert.isEqualTo(
                        testResultValue.at('Expanded value'),
                        correctResultValue.at('Expanded value'),
                        TP.join(
                            '"', inputVal, '"',
                            ' produced expanded result for key: "',
                                correctResultKey,
                                '" of: "',
                            testResultValue.at('Expanded value'),
                            '" should be: "',
                            correctResultValue.at('Expanded value'),
                            '".'));

                    test.assert.isEqualTo(
                        testResultValue.at('Resolved value tname'),
                        correctResultValue.at('Resolved value tname'),
                        TP.join(
                            '"', inputVal, '"',
                            ' produced resolved result for key: "',
                                correctResultKey,
                                '" of type: "',
                            testResultValue.at('Resolved value tname'),
                            '" should be: "',
                            correctResultValue.at('Resolved value tname'),
                            '".'));

                    test.assert.isEqualTo(
                        testResultValue.at('Resolved value'),
                        correctResultValue.at('Resolved value'),
                        TP.join(
                            '"', inputVal, '"',
                            ' produced resolved result for key: "',
                                correctResultKey,
                                '" of: "',
                            testResultValue.at('Resolved value'),
                            '" should be: "',
                            correctResultValue.at('Resolved value'),
                            '".'));
                });
        });

    this.get('promiseProvider').then(
        null,
        function(reason) {
            test.fail(TP.FAILED, reason);
        });

	return;
});

//	------------------------------------------------------------------------
//	end
//	========================================================================
