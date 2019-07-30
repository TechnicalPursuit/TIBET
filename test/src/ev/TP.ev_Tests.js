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
//  ev:
//  ========================================================================

TP.ev.XMLNS.Type.describe('ev: attributes registration',
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

    this.it('simple registration', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents1.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function() {

                var windowContext;

                windowContext = driver.get('windowContext');

                TP.sys.uiwin(true).focus();

                driver.constructSequence().
                        click(TP.byId('fooButton', windowContext, false)).
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'handlerspecifiescontrol');
                    },
                    function(error) {
                        test.fail(error, TP.sc('Event sequence error'));
                    });

                driver.constructSequence().
                        click(TP.byId('barButton', windowContext, false)).
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'controlspecifieshandler');
                    },
                    function(error) {
                        test.fail(error, TP.sc('Event sequence error'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('document and element loaded', function(test, options) {

        var driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents2.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.chain(
            function() {
                test.assert.hasAttribute(
                    TP.byId('testResults', windowContext, false),
                    'documentcontentloadedfired');
                test.assert.didSignal(TP.sys.uidoc(),
                                        'TP.sig.DOMContentLoaded');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });

        test.chain(
            function() {
                TP.sys.uiwin(true).focus();

                //  Note that since this code is being executed immediately, we
                //  have to specify a *path* to our target element.
                driver.constructSequence().
                        click(TP.byId('updateElement', windowContext, false)).
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'elementcontentloadedfired');
                        test.assert.didSignal(
                            TP.byId('testDiv', windowContext, false),
                            'TP.sig.DOMContentLoaded');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('keypresses of various kinds', function(test, options) {

        var driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents3.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.chain(
            function() {
                TP.sys.uiwin(true).focus();

                driver.constructSequence().
                        sendKeys('[Shift]A[Shift-Up]').
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'alphakeyfired');
                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_A_Up');
                    });

                driver.constructSequence().
                        sendKeys('\u0062').
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'unicodekeyfired');
                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_U0062_Up');
                    });

                driver.constructSequence().
                        sendKeys('[F2]').
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'fnkeyfired');
                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_F2_Up');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('multi origins and multi signals', function(test, options) {

        var driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents4.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.chain(
            function() {
                TP.sys.uiwin(true).focus();

                driver.constructSequence().
                        click(TP.byId('fooDiv'), windowContext, false).
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'multisignalsingleorigin');
                        test.assert.didSignal(
                            TP.byId('fooDiv', windowContext, false),
                            'TP.sig.DOMClick');

                        //  Remove the attribute in preparation for the next
                        //  test.
                        TP.elementRemoveAttribute(
                            TP.byId('testResults', windowContext, false),
                            'multisignalsingleorigin',
                            true);
                    });

                driver.constructSequence().
                        doubleClick(TP.byId('fooDiv', windowContext, false)).
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'multisignalsingleorigin');
                        test.assert.didSignal(
                            TP.byId('fooDiv', windowContext, false),
                            'TP.sig.DOMDblClick');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('ANY origins and ANY signals', function(test, options) {

        var driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents5.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.chain(
            function() {
                TP.sys.uiwin(true).focus();

                driver.constructSequence().
                        click(TP.byId('fooDiv', windowContext, false)).
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'anysignalsingleorigin');
                        test.assert.didSignal(
                            TP.byId('fooDiv', windowContext, false),
                            'TP.sig.DOMClick');
                    });

                driver.constructSequence().
                        doubleClick(TP.byId('bazDiv', windowContext, false)).
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'singlesignalanyorigin');
                        test.assert.didSignal(
                            TP.byId('bazDiv', windowContext, false),
                            'TP.sig.DOMDblClick');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });

    }).skip();

    //  ---

    this.it('stop default action, stop propagation, capturing', function(test, options) {

        var driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents6.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.chain(
            function() {
                TP.sys.uiwin(true).focus();

                driver.constructSequence().
                        sendKeys('ABCDE',
                                    TP.byId('fooField', windowContext, false)).
                        run();

                test.chain(
                    function() {
                        //  Default was being prevented - the field shouldn't
                        //  have any content.
                        test.refute.isEqualTo(
                            TP.byId('fooField', windowContext, false).value,
                            'ABCDE');
                        test.assert.didSignal(
                            TP.byId('fooDiv', windowContext, false),
                            'TP.sig.DOMKeyPress');
                    });

                driver.constructSequence().
                        sendKeys('A',
                                    TP.byId('barField', windowContext, false)).
                        run();

                test.chain(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'barfieldkeypress');
                        test.refute.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'barfieldwrapperkeypress');

                        test.assert.didSignal(
                            TP.byId('barField', windowContext, false),
                            'TP.sig.DOMKeyPress');
                    });

                driver.constructSequence().
                        sendKeys('A',
                                TP.byId('bazField', windowContext, false)).
                        run();
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('keypresses executing shell scripts', function(test, options) {

        var driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents7.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.chain(
            function() {
                TP.sys.uiwin(true).focus();

                driver.constructSequence().
                        sendKeys('[Shift]X[Shift-Up]').
                        run();

                test.chain(
                    function() {

                        var testVal;

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'shiftXkeyfired');
                        testVal =
                            TP.elementGetAttribute(
                                TP.byId('testResults', windowContext, false),
                                'shiftXkeyfired',
                                true);
                        test.assert.isEqualTo(testVal, 'fired_shiftXkey');

                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_X_Up');
                    });

                driver.constructSequence().
                        sendKeys('[Shift]Y[Shift-Up]').
                        run();

                test.chain(
                    function() {

                        var testVal;

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'shiftYkeyfired');
                        testVal =
                            TP.elementGetAttribute(
                                TP.byId('testResults', windowContext, false),
                                'shiftYkeyfired',
                                true);
                        test.assert.matches(
                            testVal, /.+"signame":"TP.sig.DOM_Y_Up".+/);

                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_Y_Up');
                    });

                driver.constructSequence().
                        sendKeys('[Shift]Z[Shift-Up]').
                        run();

                test.chain(
                    function() {

                        var testVal;

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'shiftZkeyfired');
                        testVal =
                            TP.elementGetAttribute(
                                TP.byId('testResults', windowContext, false),
                                'shiftZkeyfired',
                                true);
                        test.assert.isEqualTo(testVal, '"TP.sig.DOMKeyUp"');

                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_Z_Up');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    }).skip();

    //  ---

    this.it('keypress sequences', function(test, options) {

        var driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents8.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.chain(
            function() {

                //  This sequence of focusing the window and then 'typing' a Tab
                //  key seems to have the best chance of success to then accept
                //  keystrokes meant for the document body.
                TP.sys.uiwin(true).focus();
                driver.constructSequence().
                        sendKeys('[Tab]').
                        run();

                driver.constructSequence().
                        sendKeys('[Shift]A[Shift-Up]').
                        sendKeys('[Shift]S[Shift-Up]').
                        run();

                test.chain(
                    function() {

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'alphasequencefired');

                        test.assert.didSignal(
                            TP.sys.uidoc(),
                            'TP.sig.DOM_A_Up__TP.sig.DOM_S_Up');
                    });

                //  This sequence of focusing the window and then 'typing' a Tab
                //  key seems to have the best chance of success to then accept
                //  keystrokes meant for the document body.
                TP.sys.uiwin(true).focus();
                driver.constructSequence().
                        sendKeys('[Tab]').
                        run();

                driver.constructSequence().
                        sendKeys('\u0062').
                        sendKeys('[Shift]S[Shift-Up]').
                        run();

                test.chain(
                    function() {

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'unicodesequencefired');

                        test.assert.didSignal(
                            TP.sys.uidoc(),
                            'TP.sig.DOM_U0062_Up__TP.sig.DOM_S_Up');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('markup-level change notification', function(test, options) {

        var driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents9.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.chain(
            function() {
                TP.sys.uiwin(true).focus();

                driver.constructSequence().
                        click(TP.byId('setSalaryButton', windowContext, false)).
                        run();

                test.chain(
                    function() {

                        var testVal;

                        testVal =
                            TP.uc('urn:tibet:empObject').getResource().
                                    get('result').get(TP.apc('person.salary'));

                        test.assert.isEqualTo(testVal, 42);

                        test.assert.isEqualTo(
                            TP.byId('salaryField', windowContext).
                                                    get('value').asNumber(),
                            42);

                        test.assert.didSignal(
                            TP.byId('setSalaryButton', windowContext, false),
                            'TP.sig.DOMClick');
                        test.assert.didSignal(
                            TP.byId('msgField', windowContext, false),
                            'TP.sig.DOMContentLoaded');
                        test.assert.didSignal(
                            TP.uc('urn:tibet:empObject#tibet(person.salary)'),
                            'TP.sig.ValueChange');
                        test.assert.didSignal(
                            TP.uc('urn:tibet:empObject'),
                            'TP.sig.ValueChange');
                    });

                driver.constructSequence().
                        click(TP.byId('setSSNButton')).
                        run();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
