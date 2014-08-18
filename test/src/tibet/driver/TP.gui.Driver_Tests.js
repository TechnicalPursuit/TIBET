//  ========================================================================
/**
 * @file TP.gui.Driver_Tests.js
 * @overview
 * @author William J. Edney (wje)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Driver Fixture
//  ------------------------------------------------------------------------

TP.gui.Driver.Type.defineMethod('getTestFixture',
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

TP.gui.Driver.Inst.describe('TP.gui.Driver Inst suite',
function() {

    this.it('focus and sendKeys sequence', function(test, options) {

        var uri;

        uri = TP.uc('~lib_tst/src/tibet/driver/testmarkup.xml');

        return this.getDriver().fetchResource(uri, TP.DOM).then(
            function(result) {
                var tpDoc,
                    tpBody,
               
                    driver,
               
                    testField;

                tpDoc = TP.sys.getUICanvas().getDocument();
                tpBody = tpDoc.getBody();

                tpBody.setContent(result);

                driver = TP.gui.Driver.getTestFixture(
                                        TP.hc('testCase', test));

                testField = TP.byOID('testField');

                testField.focus();

                driver.startSequence().sendKeys('ABC[Left][Backspace]D[Right]E').perform();
                //driver.startSequence().sendKeys('[Shift]abcd[Shift-up]').perform();
            },
            function(error) {
                TP.sys.logTest('Couldn\'t get resource: ' + uri.getLocation(),
                                TP.ERROR);
                test.fail();
            });
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.gui.Driver.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
