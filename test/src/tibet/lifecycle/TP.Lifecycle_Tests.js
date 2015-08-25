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
        winContext;

    loadURI = TP.uc('~lib_tst/src/tibet/lifecycle/LoadUnload_Test.xhtml');

    //  ---

    this.before(
        function() {
            winContext = this.getDriver().get('windowContext');
        });

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

    this.it('window - DocumentLoaded', function(test, options) {

        var driver;

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function() {

                //  Window throws DocumentLoaded when document loads
                test.assert.didSignal(TP.gid(winContext),
                                        'TP.sig.DocumentLoaded');
            });
    });

    this.it('window - DocumentUnloaded', function(test, options) {

        var driver;

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function() {

                //  Window throws DocumentLoaded when document unloads
                test.assert.didSignal(TP.gid(winContext),
                                        'TP.sig.DocumentUnloaded');
            });
    });

    //  ---

    this.it('document - DOMContentLoaded', function(test, options) {

        var driver;

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function() {

                //  Document throws DOMContentLoaded when document loads
                test.assert.didSignal(
                        TP.gid(winContext.getNativeDocument()),
                        'TP.sig.DOMContentLoaded');
            });
    });

    //  ---

    this.it('element - DOMContentLoaded / AttachComplete', function(test, options) {

        var driver;

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function() {
                TP.elementSetContent(
                    TP.byId('testSpan', winContext, false),
                    '<span>This is inner content</span>');
            });

        test.then(
            function() {

                //  Element throws DOMContentLoaded when its content is added
                //  to, inserted or set.
                test.assert.didSignal(
                    TP.gid(TP.byId('testSpan', winContext, false)),
                    'TP.sig.DOMContentLoaded');

                //  Element throws AttachComplete when its content is done
                //  attaching.
                test.assert.didSignal(
                    TP.gid(TP.byId('testSpan', winContext, false)),
                    'TP.sig.AttachComplete');
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
