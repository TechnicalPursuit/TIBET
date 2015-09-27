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

    var unloadURI;

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
        });

    //  ---

    this.it('simple registration', function(test, options) {

        var loadURI,
            driver;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents1.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function() {

                var windowContext;

                windowContext = driver.get('windowContext');

                TP.sys.uiwin(true).focus();

                driver.startSequence().
                        click(TP.byId('fooButton', windowContext, false)).
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'handler_specifies_control');
                    },
                    function(error) {
                        test.fail(error, TP.sc('Event sequence error'));
                    });

                driver.startSequence().
                        click(TP.byId('barButton', windowContext, false)).
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'control_specifies_handler');
                    },
                    function(error) {
                        test.fail(error, TP.sc('Event sequence error'));
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooButton.TP.sig.DOMClick');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#barButton.TP.sig.DOMClick');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooButton.TP.sig.DOMClick');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#barButton.TP.sig.DOMClick');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('document and element loaded', function(test, options) {

        var loadURI,
            driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents2.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.then(
            function() {
                test.assert.hasAttribute(
                    TP.byId('testResults', windowContext, false),
                    'document_contentloaded_fired');
                test.assert.didSignal(TP.sys.uidoc(),
                                        'TP.sig.DOMContentLoaded');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });

        test.then(
            function() {
                TP.sys.uiwin(true).focus();

                //  Note that since this code is being executed immediately, we
                //  have to specify a *path* to our target element.
                driver.startSequence().
                        click(TP.byId('updateElement', windowContext, false)).
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'element_contentloaded_fired');
                        test.assert.didSignal(
                            TP.byId('testDiv', windowContext, false),
                            'TP.sig.DOMContentLoaded');
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOMContentLoaded');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#testDiv.TP.sig.DOMContentLoaded');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOMContentLoaded');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#testDiv.TP.sig.DOMContentLoaded');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('keypresses of various kinds', function(test, options) {

        var loadURI,
            driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents3.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.then(
            function() {
                TP.sys.uiwin(true).focus();

                driver.startSequence().
                        sendKeys('[Shift]A[Shift-Up]').
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'alphakey_fired');
                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_A_Up');
                    });

                driver.startSequence().
                        sendKeys('\u0062').
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'unicodekey_fired');
                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_U0062_Up');
                    });

                driver.startSequence().
                        sendKeys('[F2]').
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'fnkey_fired');
                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_F2_Up');
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_A_Up');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_U0062_Up');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_F2_Up');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_A_Up');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_U0062_Up');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_F2_Up');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('multi origins and multi signals', function(test, options) {

        var loadURI,
            driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents4.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.then(
            function() {
                TP.sys.uiwin(true).focus();

                driver.startSequence().
                        click(TP.byId('fooDiv'), windowContext, false).
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'multisignal_singleorigin');
                        test.assert.didSignal(
                            TP.byId('fooDiv', windowContext, false),
                            'TP.sig.DOMClick');

                        //  Remove the attribute in preparation for the next
                        //  test.
                        TP.elementRemoveAttribute(
                            TP.byId('testResults', windowContext, false),
                            'multisignal_singleorigin',
                            true);
                    });

                driver.startSequence().
                        doubleClick(TP.byId('fooDiv', windowContext, false)).
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'multisignal_singleorigin');
                        test.assert.didSignal(
                            TP.byId('fooDiv', windowContext, false),
                            'TP.sig.DOMDblClick');
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooDiv.TP.sig.DOMClick');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooDiv.TP.sig.DOMDblClick');

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#barDiv.TP.sig.DOMClick');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#bazDiv.TP.sig.DOMClick');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooDiv.TP.sig.DOMClick');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooDiv.TP.sig.DOMDblClick');

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#barDiv.TP.sig.DOMClick');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#bazDiv.TP.sig.DOMClick');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('ANY origins and ANY signals', function(test, options) {

        var loadURI,
            driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents5.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.then(
            function() {
                TP.sys.uiwin(true).focus();

                driver.startSequence().
                        click(TP.byId('fooDiv', windowContext, false)).
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'anysignal_singleorigin');
                        test.assert.didSignal(
                            TP.byId('fooDiv', windowContext, false),
                            'TP.sig.DOMClick');
                    });

                driver.startSequence().
                        doubleClick(TP.byId('bazDiv', windowContext, false)).
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'singlesignal_anyorigin');
                        test.assert.didSignal(
                            TP.byId('bazDiv', windowContext, false),
                            'TP.sig.DOMDblClick');
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooDiv.ANY');
                        test.assert.contains(
                            interestMapKeys,
                            'ANY.TP.sig.DOMClick');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooDiv.ANY');
                        test.refute.contains(
                            interestMapKeys,
                            'ANY.TP.sig.DOMClick');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });

    }).skip();

    //  ---

    this.it('stop default action, stop propagation, capturing', function(test, options) {

        var loadURI,
            driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents6.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.then(
            function() {
                TP.sys.uiwin(true).focus();

                driver.startSequence().
                        sendKeys('ABCDE',
                                    TP.byId('fooField', windowContext, false)).
                        perform();

                test.then(
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

                driver.startSequence().
                        sendKeys('A',
                                    TP.byId('barField', windowContext, false)).
                        perform();

                test.then(
                    function() {
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'barfield_keypress');
                        test.refute.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'barfieldwrapper_keypress');

                        test.assert.didSignal(
                            TP.byId('barField', windowContext, false),
                            'TP.sig.DOMKeyPress');
                    });

                driver.startSequence().
                        sendKeys('A',
                                TP.byId('bazField', windowContext, false)).
                        perform();

                test.then(
                    function() {
                        var firedFirstDateVal,
                            firedSecondDateVal;

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'bazfield_keypress_1st');
                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'bazfield_keypress_2nd');

                        firedFirstDateVal = TP.dc(
                            TP.elementGetAttribute(
                                TP.byId('testResults', windowContext, false),
                                'bazfield_keypress_1st',
                                true));

                        firedSecondDateVal = TP.dc(
                            TP.elementGetAttribute(
                                TP.byId('testResults', windowContext, false),
                                'bazfield_keypress_2nd',
                                true));

                        test.assert.isTrue(
                            firedSecondDateVal.getTime() >=
                            firedFirstDateVal.getTime());

                        test.assert.didSignal(
                                TP.byId('bazField', windowContext, false),
                                'TP.sig.DOMKeyPress');
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooField.TP.sig.DOMKeyPress');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#barField.TP.sig.DOMKeyPress');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#barFieldWrapper.TP.sig.DOMKeyPress');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#bazField.TP.sig.DOMKeyPress');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#fooField.TP.sig.DOMKeyPress');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#barField.TP.sig.DOMKeyPress');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#barFieldWrapper.TP.sig.DOMKeyPress');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#bazField.TP.sig.DOMKeyPress');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('keypresses executing shell scripts', function(test, options) {

        var loadURI,
            driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents7.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.then(
            function() {
                TP.sys.uiwin(true).focus();

                driver.startSequence().
                        sendKeys('[Shift]X[Shift-Up]').
                        perform();

                test.then(
                    function() {

                        var testVal;

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'shiftXkey_fired');
                        testVal =
                            TP.elementGetAttribute(
                                TP.byId('testResults', windowContext, false),
                                'shiftXkey_fired',
                                true);
                        test.assert.isEqualTo(testVal, 'fired_shiftXkey');

                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_X_Up');
                    });

                driver.startSequence().
                        sendKeys('[Shift]Y[Shift-Up]').
                        perform();

                test.then(
                    function() {

                        var testVal;

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'shiftYkey_fired');
                        testVal =
                            TP.elementGetAttribute(
                                TP.byId('testResults', windowContext, false),
                                'shiftYkey_fired',
                                true);
                        test.assert.matches(
                            testVal, /.+"signame":"TP.sig.DOM_Y_Up".+/);

                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_Y_Up');
                    });

                driver.startSequence().
                        sendKeys('[Shift]Z[Shift-Up]').
                        perform();

                test.then(
                    function() {

                        var testVal;

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'shiftZkey_fired');
                        testVal =
                            TP.elementGetAttribute(
                                TP.byId('testResults', windowContext, false),
                                'shiftZkey_fired',
                                true);
                        test.assert.isEqualTo(testVal, '"TP.sig.DOMKeyUp"');

                        test.assert.didSignal(TP.sys.uidoc(),
                                                'TP.sig.DOM_Z_Up');
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_X_Up');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_Y_Up');
                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_Z_Up');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_X_Up');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_Y_Up');
                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOM_Z_Up');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('keypress sequences', function(test, options) {

        var loadURI,
            driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents8.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.then(
            function() {

                //  This sequence of focusing the window and then 'typing' a Tab
                //  key seems to have the best chance of success to then accept
                //  keystrokes meant for the document body.
                TP.sys.uiwin(true).focus();
                driver.startSequence().
                        sendKeys('[Tab]').
                        perform();

                driver.startSequence().
                        sendKeys('[Shift]A[Shift-Up]').
                        sendKeys('[Shift]S[Shift-Up]').
                        perform();

                test.then(
                    function() {

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'alpha_sequence_fired');

                        test.assert.didSignal(
                            TP.sys.uidoc(),
                            'TP.sig.DOM_A_Up__TP.sig.DOM_S_Up');
                    });

                //  This sequence of focusing the window and then 'typing' a Tab
                //  key seems to have the best chance of success to then accept
                //  keystrokes meant for the document body.
                TP.sys.uiwin(true).focus();
                driver.startSequence().
                        sendKeys('[Tab]').
                        perform();

                driver.startSequence().
                        sendKeys('\u0062').
                        sendKeys('[Shift]S[Shift-Up]').
                        perform();

                test.then(
                    function() {

                        test.assert.hasAttribute(
                            TP.byId('testResults', windowContext, false),
                            'unicode_sequence_fired');

                        test.assert.didSignal(
                            TP.sys.uidoc(),
                            'TP.sig.DOM_U0062_Up__TP.sig.DOM_S_Up');
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                            loadURI.getLocation() +
                            '#document.TP.sig.DOM_U0062_Up__TP.sig.DOM_S_Up');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                            loadURI.getLocation() +
                            '#document.TP.sig.DOM_U0062_Up__TP.sig.DOM_S_Up');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Event sequence error'));
            });
    });

    //  ---

    this.it('markup-level change notification', function(test, options) {

        var loadURI,
            driver,

            windowContext;

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents9.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        windowContext = driver.get('windowContext');

        test.then(
            function() {
                TP.sys.uiwin(true).focus();

                driver.startSequence().
                        click(TP.byId('setSalaryButton', windowContext, false)).
                        perform();

                test.then(
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

                driver.startSequence().
                        click(TP.byId('setSSNButton')).
                        perform();

                test.then(
                    function() {

                        var testVal;

                        testVal = TP.uc('urn:tibet:empObject').getResource().
                                    get('result').get(TP.apc('person.SSN'));

                        test.assert.isEqualTo(testVal, '111-22-3333');

                        test.assert.isEqualTo(
                            TP.byId('ssnField', windowContext).get('value'),
                            '111-22-3333');

                        test.assert.didSignal(
                            TP.byId('setSSNButton', windowContext, false),
                           'TP.sig.DOMClick');
                        test.assert.didSignal(
                            TP.byId('msgField', windowContext, false),
                            'TP.sig.DOMContentLoaded');
                        test.assert.didSignal(
                            TP.uc('urn:tibet:empObject#tibet(person.SSN)'),
                            'TP.sig.ValueChange');
                        test.assert.didSignal(
                            TP.uc('urn:tibet:empObject'),
                            'TP.sig.ValueChange');
                    });

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.assert.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOMContentLoaded');
                        test.assert.contains(
                            interestMapKeys,
                            'urn:tibet:empObject.TP.sig.Change');
                        test.assert.contains(
                            interestMapKeys,
                            'urn:tibet:empObject#tibet(person.salary).TP.sig.ValueChange');
                        test.assert.contains(
                            interestMapKeys,
                            'urn:tibet:empObject#tibet(person.SSN).TP.sig.ValueChange');
                    });

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();

                test.then(
                    function() {
                        var interestMapKeys;

                        interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                        test.refute.contains(
                            interestMapKeys,
                            TP.sys.getUICanvasPath() +
                                loadURI.getLocation() +
                                '#document.TP.sig.DOMContentLoaded');
                        test.refute.contains(
                            interestMapKeys,
                            'urn:tibet:empObject.TP.sig.Change');
                        test.refute.contains(
                            interestMapKeys,
                            'urn:tibet:empObject#tibet(person.salary).TP.sig.ValueChange');
                        test.refute.contains(
                            interestMapKeys,
                            'urn:tibet:empObject#tibet(person.SSN).TP.sig.ValueChange');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });

    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.ev.XMLNS.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
