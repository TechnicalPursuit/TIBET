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
//  Document Loaded / Document Unloaded
//  ========================================================================

TP.describe('TP: document lifecycle',
function() {

    var loadURI,
        win;

    loadURI = TP.uc('~lib_tst/src/tibet/lifecycle/Test.xhtml');
    win = TP.win(TP.sys.cfg('tibet.uicanvas'));

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

    this.it('document loaded', function(test, options) {

        var driver;

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function() {

                test.assert.didSignal(TP.gid(win),
                                        'TP.sig.DocumentLoaded');
            });
    });

    this.it('document unloaded', function(test, options) {

        var driver;

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function() {

                test.assert.didSignal(TP.gid(win),
                                        'TP.sig.DocumentUnloaded');
            });
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
