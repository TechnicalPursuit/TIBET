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

TP.on.XMLNS.Type.describe('on: DOM signals - no payload',
function() {

    var unloadURI,
        loadURI,
        driver;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));
    loadURI = TP.uc('~lib_test/src/on/OnTest1.xhtml');

    //  ---

    this.before(
        function() {

            this.getDriver().showTestGUI();

            driver = this.getDriver();
            driver.setLocation(loadURI);

            this.then(
                function() {
                    this.startTrackingSignals();
                }.bind(this),
                function(error) {
                    this.fail(error, TP.sc('Couldn\'t get resource: ',
                                                loadURI.getLocation()));
                });
        });

    this.after(
        function() {
            this.stopTrackingSignals();
            this.getDriver().showTestLog();

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function() {

            //  Reset the spy on TP.signal in preparation for the
            //  next step in this test.
            TP.signal.reset();
        });

    //  ---

    this.it('DOM on: signaling - DOM standard name', function(test, options) {

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
    });

    //  ---

    this.it('DOM on: signaling - TIBET full name', function(test, options) {

        var windowContext,
            elem;

        windowContext = driver.get('windowContext');

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

    //  ---

    this.it('DOM on: signaling - TIBET short name', function(test, options) {

        var windowContext,
            elem;

        windowContext = driver.get('windowContext');

        elem = TP.byId('testElem3', windowContext);

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

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.describe('on: DOM signals - with payload',
function() {

    var unloadURI,
        loadURI,
        driver;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));
    loadURI = TP.uc('~lib_test/src/on/OnTest2.xhtml');

    //  ---

    this.before(
        function() {

            this.getDriver().showTestGUI();

            driver = this.getDriver();
            driver.setLocation(loadURI);

            this.then(
                function() {
                    this.startTrackingSignals();
                }.bind(this),
                function(error) {
                    this.fail(error, TP.sc('Couldn\'t get resource: ',
                                                loadURI.getLocation()));
                });
        });

    this.after(
        function() {
            this.stopTrackingSignals();
            this.getDriver().showTestLog();

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function() {

            //  Reset the spy on TP.signal in preparation for the
            //  next step in this test.
            TP.signal.reset();
        });

    //  ---

    this.it('DOM on: signaling - DOM standard name', function(test, options) {

        var windowContext,
            triggerElem,
            elem;

        windowContext = driver.get('windowContext');

        triggerElem = TP.byId('triggerElem1', windowContext);
        elem = TP.byId('testElem1', windowContext);

        driver.startSequence().
                click(triggerElem).
                perform();

        test.then(
            function() {
                var sigPayload;

                test.assert.didSignal(triggerElem, 'TP.sig.DOMClick');
                test.assert.didSignal(elem, 'ClickTestSignal');

                sigPayload = TP.signal.args.last().at(2);
                test.assert.hasKey(sigPayload, 'foo');
                test.assert.hasKey(sigPayload, 'baz');
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('DOM on: signaling - TIBET full name', function(test, options) {

        var windowContext,
            triggerElem,
            elem;

        windowContext = driver.get('windowContext');

        triggerElem = TP.byId('triggerElem2', windowContext);
        elem = TP.byId('testElem1', windowContext);

        driver.startSequence().
                click(triggerElem).
                perform();

        test.then(
            function() {
                var sigPayload;

                test.assert.didSignal(triggerElem, 'TP.sig.DOMClick');
                test.assert.didSignal(elem, 'ClickTestSignal');

                sigPayload = TP.signal.args.last().at(2);
                test.assert.hasKey(sigPayload, 'foo');
                test.assert.hasKey(sigPayload, 'baz');
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('DOM on: signaling - TIBET short name', function(test, options) {

        var windowContext,
            triggerElem,
            elem;

        windowContext = driver.get('windowContext');

        triggerElem = TP.byId('triggerElem3', windowContext);
        elem = TP.byId('testElem1', windowContext);

        driver.startSequence().
                click(triggerElem).
                perform();

        test.then(
            function() {
                var sigPayload;

                test.assert.didSignal(triggerElem, 'TP.sig.DOMClick');
                test.assert.didSignal(elem, 'ClickTestSignal');

                sigPayload = TP.signal.args.last().at(2);
                test.assert.hasKey(sigPayload, 'foo');
                test.assert.hasKey(sigPayload, 'baz');
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.describe('on: non-DOM signals - no payload',
function() {

    var unloadURI,
        loadURI,
        driver;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));
    loadURI = TP.uc('~lib_test/src/on/OnTest3.xhtml');

    //  ---

    this.before(
        function() {

            this.getDriver().showTestGUI();

            driver = this.getDriver();
            driver.setLocation(loadURI);

            this.then(
                function() {
                    this.startTrackingSignals();
                }.bind(this),
                function(error) {
                    this.fail(error, TP.sc('Couldn\'t get resource: ',
                                                loadURI.getLocation()));
                });
        });

    this.after(
        function() {
            this.stopTrackingSignals();
            this.getDriver().showTestLog();

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function() {

            //  Reset the spy on TP.signal in preparation for the
            //  next step in this test.
            TP.signal.reset();
        });

    //  ---

    this.it('non-DOM on: signaling - TIBET full name', function(test, options) {

        var windowContext,
            elem;

        windowContext = driver.get('windowContext');

        elem = TP.byId('testElem1', windowContext);

        TP.wrap(elem).dispatch('TP.sig.FooSignal');

        test.then(
            function() {
                test.assert.didSignal(elem, 'TP.sig.FooSignal');
                test.assert.didSignal(elem, 'TP.sig.BarSignal');
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('non-DOM on: signaling - TIBET short name', function(test, options) {

        var windowContext,
            elem;

        windowContext = driver.get('windowContext');

        elem = TP.byId('testElem2', windowContext);

        TP.wrap(elem).dispatch('FooSignal');

        test.then(
            function() {
                test.assert.didSignal(elem, 'FooSignal');
                test.assert.didSignal(elem, 'TP.sig.BarSignal');
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.describe('on: non-DOM signals - with payload',
function() {

    var unloadURI,
        loadURI,
        driver;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));
    loadURI = TP.uc('~lib_test/src/on/OnTest4.xhtml');

    //  ---

    this.before(
        function() {

            this.getDriver().showTestGUI();

            driver = this.getDriver();
            driver.setLocation(loadURI);

            this.then(
                function() {
                    this.startTrackingSignals();
                }.bind(this),
                function(error) {
                    this.fail(error, TP.sc('Couldn\'t get resource: ',
                                                loadURI.getLocation()));
                });
        });

    this.after(
        function() {
            this.stopTrackingSignals();
            this.getDriver().showTestLog();

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function() {

            //  Reset the spy on TP.signal in preparation for the
            //  next step in this test.
            TP.signal.reset();
        });

    //  ---

    this.it('non-DOM on: signaling - TIBET full name', function(test, options) {

        var windowContext,
            triggerElem,
            elem;

        windowContext = driver.get('windowContext');

        triggerElem = TP.byId('triggerElem1', windowContext);
        elem = TP.byId('testElem1', windowContext);

        TP.wrap(triggerElem).dispatch('TP.sig.FooSignal');

        test.then(
            function() {
                var sigPayload;

                test.assert.didSignal(triggerElem, 'TP.sig.FooSignal');
                test.assert.didSignal(elem, 'TP.sig.BarSignal');

                sigPayload = TP.signal.args.last().at(2);
                test.assert.hasKey(sigPayload, 'foo');
                test.assert.hasKey(sigPayload, 'baz');
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('non-DOM on: signaling - TIBET short name', function(test, options) {

        var windowContext,
            triggerElem,
            elem;

        windowContext = driver.get('windowContext');

        triggerElem = TP.byId('triggerElem2', windowContext);
        elem = TP.byId('testElem1', windowContext);

        TP.wrap(triggerElem).dispatch('FooSignal');

        test.then(
            function() {
                var sigPayload;

                test.assert.didSignal(triggerElem, 'FooSignal');
                test.assert.didSignal(elem, 'TP.sig.BarSignal');

                sigPayload = TP.signal.args.last().at(2);
                test.assert.hasKey(sigPayload, 'foo');
                test.assert.hasKey(sigPayload, 'baz');
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
