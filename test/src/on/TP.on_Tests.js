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
//  TP.tibet.testElem
//  ========================================================================

//  Don't redefine this if another test has defined it.
if (!TP.isType(TP.tibet.testElem)) {
    TP.core.UIElementNode.defineSubtype('tibet.testElem');
}

TP.tibet.testElem.Inst.defineHandler('ClickTestSignal',
function(aSignal) {

    //  This currently has an empty body. We only use it to test whether the
    //  signal actually happened.
});

//  ========================================================================
//  on:
//  ========================================================================

TP.on.XMLNS.Type.describe('on: DOM signals',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('DOM on: signaling', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/on/OnTest1.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    elem;

                windowContext = driver.get('windowContext');

                elem = TP.byId('testElem1', windowContext);

                driver.startSequence().
                        click(elem).
                        perform();

                test.then(
                    function() {
                        test.assert.didSignal(elem, 'TP.sig.DOMClick');
                        test.assert.didSignal(elem, 'ClickTestSignal');
                    },
                    function(error) {
                        test.fail(error, TP.sc('Event sequence error'));
                    });

                test.then(
                    function() {

                        //  Reset the spy on TP.signal in preparation for the
                        //  next step in this test.
                        TP.signal.reset();
                    });

                test.then(
                    function() {
                        elem = TP.byId('testElem2', windowContext);

                        driver.startSequence().
                                click(elem).
                                perform();

                        test.then(
                            function() {
                                test.assert.didSignal(elem, 'TP.sig.DOMClick');
                                test.assert.didSignal(elem, 'ClickTestSignal');
                            },
                            function(error) {
                                test.fail(error, TP.sc('Event sequence error'));
                            });
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
