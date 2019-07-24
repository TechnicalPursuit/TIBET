//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ------------------------------------------------------------------------
//  Driver Fixture
//  ------------------------------------------------------------------------

TP.test.GUIDriver.Type.defineMethod('getTestFixture',
function(options) {

    var testCase;

    if (TP.isValid(testCase = options.at('testCase'))) {
        return testCase.getDriver();
    }

    return testCase;
});

//  ========================================================================
//  Test Suite
//  ========================================================================

TP.test.GUIDriver.Inst.describe('Syn test',
function() {

    this.it('focus and sendKeys sequence', function(test, options) {

        var uri,
            driver,
            seq;

        uri = TP.uc('~lib_test/src/tibet/driver/testmarkup.xml');
        test.getDriver().setBodyContent(uri);

        test.chain(
            function() {
                driver = TP.test.GUIDriver.getTestFixture(
                                        TP.hc('testCase', test));

                seq = driver.constructSequence();
                seq.sendKeys('ABC[Left][Backspace]D[Right]E',
                                        TP.cpc('#testField'));
                seq.run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            TP.byId('testField',
                                    driver.get('windowContext'),
                                    false).value,
                            'ADCE');
                    });
            });

        /*
        testField = TP.byId('testField',
                              test.getDriver().get('windowContext'));

        testField.focus();
        driver.constructSequence().click(TP.cpc('#testField')).run();

        driver.constructSequence().sendKeys('[Shift]abcd[Shift-up]').run();
        */
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
