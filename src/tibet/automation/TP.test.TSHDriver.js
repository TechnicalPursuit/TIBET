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

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.TSHDriver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * An object that will provide an API to manage Promises for this driver. When
 * executing in the test harness, this will typically be the currently executing
 * test case.
 * @type {Object}
 */
TP.test.TSHDriver.Inst.defineAttribute('promiseProvider');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.TSHDriver.Inst.defineMethod('execShellTest',
function(test, shellInput, valueTestFunction) {

    /**
     * @method execShellTest
     * @summary Executes the supplied shell input and determines the
     *     success/failure of the supplied test case.
     * @param {TP.test.Case} test The test case to determine the success/failure
     *     of.
     * @param {String} shellInput The shell input to execute.
     * @param {Function} [valueTestFunction] An optional Function to execute on
     *     the result of running the shell input before supplying it as the
     *     result value of the returned Promise.
     * @exception TP.sig.InvalidURI
     * @returns {Promise} A Promise which completes when the shell processing is
     *     complete.
    */

    return Promise.construct(
        function(resolver, rejector) {

            //  Flip the flag on to ignore eval errors in the TSH. We'll test
            //  for undefined values here.
            TP.sys.setcfg('tsh.ignore_eval_errors', true);

            TP.shellExec(TP.hc(
                'cmdSrc', shellInput,
                'cmdEcho', false,
                'cmdHistory', false,
                'cmdSilent', false,
                TP.ONSUCCESS,
                    function(aSignal, stdioResults) {
                        var testResult;

                        //  The shell request itself succeeded. See if it
                        //  returned the correct value.

                        try {
                            //  The correct value should be in the stdout that
                            //  is made available to this method. Note how we
                            //  skip any stdout values that are
                            //  TP.TSH_NO_VALUEs.
                            testResult = stdioResults.detect(
                                        function(item) {
                                            return TP.isValid(item) &&
                                                item.data !== TP.TSH_NO_VALUE &&
                                                item.meta === 'stdout';
                                        });
                            if (TP.isValid(testResult)) {
                                testResult = testResult.data;
                            }

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

                        //  Make sure to put the flag back that caused the TSH
                        //  to ignore eval errors.
                        TP.sys.setcfg('tsh.ignore_eval_errors', false);
                    },
                TP.ONFAIL,
                    function(aSignal, stdioResults) {
                        var errMsg;

                        //  Make sure to put the flag back that caused the TSH
                        //  to ignore eval errors.
                        TP.sys.setcfg('tsh.ignore_eval_errors', false);

                        //  The shell couldn't complete the request - call the
                        //  rejector with the content of whatever was placed
                        //  into stderr.

                        errMsg = stdioResults.select(function(item) {
                            return TP.isValid(item) &&
                                item.meta === 'stderr';
                        });
                        errMsg = errMsg.collect(function(item) {
                            return item.data;
                        }).join('\n');

                        rejector(errMsg);

                        //  Set the faultText to that content as well.
                        test.set('faultText', errMsg || '');
                    }));
        });
});

//  ------------------------------------------------------------------------

TP.test.TSHDriver.Inst.defineMethod('execOutputTest',
function(test, shellInput, correctResults) {

    /**
     * @method execOutputTest
     * @summary Executes the supplied shell input and tests the results against
     *     the supplied correct results.
     * @param {TP.test.Case} test The test case to determine the success/failure
     *     of.
     * @param {String} shellInput The shell input to execute.
     * @param {TP.core.Hash} correctResults A hash containing the correct
     *     results keyed by shell argument name or position (i.e. 'ARG0'
     *     representing the first argument or 'tsh:foo' representing the value
     *     of the '--foo' flag.
     * @exception TP.sig.InvalidURI
     * @returns {Promise} A Promise which completes when the shell processing is
     *     complete.
    */

    var promise;

    promise = this.execShellTest(
        test,
        shellInput,
        function(testResult) {

            correctResults.perform(
                function(kvPair) {
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
                            '"', shellInput, '"',
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
                            '"', shellInput, '"',
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
                            '"', shellInput, '"',
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
                            '"', shellInput, '"',
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
                            '"', shellInput, '"',
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
                            '"', shellInput, '"',
                            ' produced resolved result for key: "',
                                correctResultKey,
                                '" of: "',
                            testResultValue.at('Resolved value'),
                            '" should be: "',
                            correctResultValue.at('Resolved value'),
                            '".'));
                });
        });

    promise = promise.then(
        null,
        function(reason) {
            test.fail(reason);
        });

    return promise;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
