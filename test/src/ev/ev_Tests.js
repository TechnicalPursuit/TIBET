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

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    this.it('simple registration', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents1.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.click(TP.byId('fooButton'));
                seq.click(TP.byId('barButton'));
                seq.perform();
            },
            function(error) {
                TP.sys.logTest('Couldn\'t get resource: ' + loadURI.getLocation(),
                                TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'handler_specifies_control');
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'control_specifies_handler');
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooButton.TP.sig.DOMClick');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#barButton.TP.sig.DOMClick');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooButton.TP.sig.DOMClick');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#barButton.TP.sig.DOMClick');
            });
    });

    //  ---

    this.it('document and element loaded', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents2.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'document_contentloaded_fired');
                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');
            },
            function(error) {
                TP.sys.logTest('Couldn\'t get resource: ' + loadURI.getLocation(),
                                TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.click(TP.byId('updateElement'));
                seq.perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'element_contentloaded_fired');
                test.assert.didSignal(TP.byId('testDiv'), 'TP.sig.DOMContentLoaded');
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOMContentLoaded');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#testDiv.TP.sig.DOMContentLoaded');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOMContentLoaded');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#testDiv.TP.sig.DOMContentLoaded');
            });
    });

    //  ---

    this.it('keypresses of various kinds', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents3.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                test.getDriver().startSequence().
                        sendKeys('[Shift]A[Shift-Up]').
                        perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'alphakey_fired');
                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOM_A_Up');
            });

        this.then(
            function(result) {

                test.getDriver().startSequence().
                        sendKeys('\u0062').
                        perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'unicodekey_fired');
                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOM_U0062_Up');
            });

        this.then(
            function(result) {

                test.getDriver().startSequence().
                        sendKeys('[F2]').
                        perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'fnkey_fired');
                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOM_F2_Up');
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_A_Up');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_U0062_Up');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_F2_Up');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_A_Up');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_U0062_Up');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_F2_Up');
            });
    });

    //  ---

    this.it('multi origins and multi signals', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents4.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.click(TP.byId('fooDiv'));
                seq.perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'multisignal_singleorigin');
                test.assert.didSignal(TP.byId('fooDiv'), 'TP.sig.DOMClick');

                //  Remove the attribute in preparation for the next test.
                TP.elementRemoveAttribute(TP.byId('testResults'),
                                            'multisignal_singleorigin',
                                            true);
            });

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.doubleClick(TP.byId('fooDiv'));
                seq.perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'multisignal_singleorigin');
                test.assert.didSignal(TP.byId('fooDiv'), 'TP.sig.DOMDblClick');
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooDiv.TP.sig.DOMClick');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooDiv.TP.sig.DOMDblClick');


                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#barDiv.TP.sig.DOMClick');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#bazDiv.TP.sig.DOMClick');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooDiv.TP.sig.DOMClick');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooDiv.TP.sig.DOMDblClick');


                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#barDiv.TP.sig.DOMClick');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#bazDiv.TP.sig.DOMClick');
            });
    });

    //  ---

    this.it('ANY origins and ANY signals', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents5.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.click(TP.byId('fooDiv'));
                seq.perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'anysignal_singleorigin');
                test.assert.didSignal(TP.byId('fooDiv'), 'TP.sig.DOMClick');
            });

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.doubleClick(TP.byId('bazDiv'));
                seq.perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'singlesignal_anyorigin');
                test.assert.didSignal(TP.byId('bazDiv'), 'TP.sig.DOMDblClick');
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooDiv.ANY');
                test.assert.contains(
                    interestMapKeys,
                    'ANY.TP.sig.DOMClick');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooDiv.ANY');
                test.refute.contains(
                    interestMapKeys,
                    'ANY.TP.sig.DOMClick');
            });
    }).skip();

    //  ---

    this.it('stop default action, stop propagation, capturing', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents6.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();

                seq.click(TP.byId('fooField'));
                seq.sendKeys('ABCDE');
                seq.perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                //  Default was being prevented - the field shouldn't have any
                //  content.
                test.refute.isEqualTo(TP.byId('fooField').value, 'ABCDE');
                test.assert.didSignal(TP.byId('fooDiv'), 'TP.sig.DOMKeyPress');
            });

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();

                seq.click(TP.byId('barField'));
                seq.sendKeys('A');
                seq.perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'barfield_keypress');
                test.refute.hasAttribute(TP.byId('testResults'),
                                            'barfieldwrapper_keypress');

                test.assert.didSignal(TP.byId('barField'), 'TP.sig.DOMKeyPress');
            });

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();

                seq.click(TP.byId('bazField'));
                seq.sendKeys('A');
                seq.perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {
                var firedFirstDateVal,
                    firedSecondDateVal;

                test.assert.hasAttribute(TP.byId('testResults'),
                                            'bazfield_keypress_1st');
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'bazfield_keypress_2nd');

                firedFirstDateVal = TP.dc(
                            TP.elementGetAttribute(
                                TP.byId('testResults'),
                                'bazfield_keypress_1st',
                                true));

                firedSecondDateVal = TP.dc(
                            TP.elementGetAttribute(
                                TP.byId('testResults'),
                                'bazfield_keypress_2nd',
                                true));

                test.assert.isTrue(
                    firedSecondDateVal.getTime() >= firedFirstDateVal.getTime());

                test.assert.didSignal(TP.byId('bazField'), 'TP.sig.DOMKeyPress');
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooField.TP.sig.DOMKeyPress');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#barField.TP.sig.DOMKeyPress');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#barFieldWrapper.TP.sig.DOMKeyPress');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#bazField.TP.sig.DOMKeyPress');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooField.TP.sig.DOMKeyPress');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#barField.TP.sig.DOMKeyPress');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#barFieldWrapper.TP.sig.DOMKeyPress');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#bazField.TP.sig.DOMKeyPress');
            });
    });

    //  ---

    this.it('keypresses executing shell scripts', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents7.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                test.getDriver().startSequence().
                        sendKeys('[Shift]X[Shift-Up]').
                        perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {

                var testVal;

                test.assert.hasAttribute(TP.byId('testResults'),
                                            'shiftXkey_fired');
                testVal = TP.elementGetAttribute(
                                TP.byId('testResults'),
                                'shiftXkey_fired',
                                true);
                test.assert.isEqualTo(testVal, 'fired_shiftXkey');

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOM_X_Up');
            });

        this.then(
            function(result) {

                test.getDriver().startSequence().
                        sendKeys('[Shift]Y[Shift-Up]').
                        perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {

                var testVal;

                test.assert.hasAttribute(TP.byId('testResults'),
                                            'shiftYkey_fired');
                testVal = TP.elementGetAttribute(
                                TP.byId('testResults'),
                                'shiftYkey_fired',
                                true);
                test.assert.matches(testVal, /.+"signame":"TP.sig.DOM_Y_Up".+/);

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOM_Y_Up');
            });

        this.then(
            function(result) {

                test.getDriver().startSequence().
                        sendKeys('[Shift]Z[Shift-Up]').
                        perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {

                var testVal;

                test.assert.hasAttribute(TP.byId('testResults'),
                                            'shiftZkey_fired');
                testVal = TP.elementGetAttribute(
                                TP.byId('testResults'),
                                'shiftZkey_fired',
                                true);
                test.assert.isEqualTo(testVal, '"TP.sig.DOMKeyUp"');

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOM_Z_Up');
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_X_Up');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_Y_Up');
                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_Z_Up');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_X_Up');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_Y_Up');
                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_Z_Up');
            });
    });

    //  ---

    this.it('keypress sequences', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents8.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                test.getDriver().startSequence().
                        sendKeys('[Shift]A[Shift-Up]').
                        sendKeys('[Shift]S[Shift-Up]').
                        perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {

                test.assert.hasAttribute(TP.byId('testResults'),
                                            'alpha_sequence_fired');

                test.assert.didSignal(TP.sys.uidoc(),
                                        'TP.sig.DOM_A_Up__TP.sig.DOM_S_Up');
            });

        this.then(
            function(result) {

                test.getDriver().startSequence().
                        sendKeys('\u0062').
                        sendKeys('[Shift]S[Shift-Up]').
                        perform();
            },
            function(error) {
                TP.sys.logTest(
                    'Event sequence error: ' + TP.str(error), TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {

                test.assert.hasAttribute(TP.byId('testResults'),
                                            'unicode_sequence_fired');

                test.assert.didSignal(TP.sys.uidoc(),
                                        'TP.sig.DOM_U0062_Up__TP.sig.DOM_S_Up');
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_U0062_Up__TP.sig.DOM_S_Up');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOM_U0062_Up__TP.sig.DOM_S_Up');
            });
    });

    //  ---

    this.it('markup-level change notification', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/ev/XMLEvents9.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.click(TP.byId('setSalaryButton'));
                seq.perform();
            },
            function(error) {
                TP.sys.logTest('Couldn\'t get resource: ' + loadURI.getLocation(),
                                TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {

                var testVal;

                testVal = TP.uc('urn:tibet:empObject').getResource().get(
                                                    TP.apc('person.salary'));

                test.assert.isEqualTo(testVal, 42);

                test.assert.isEqualTo(
                    TP.byOID('salaryField').get('value').asNumber(),
                    42);

                test.assert.didSignal(TP.byId('setSalaryButton'),
                                        'TP.sig.DOMClick');
                test.assert.didSignal(TP.byId('msgField'),
                                        'TP.sig.DOMContentLoaded');
                test.assert.didSignal(
                        TP.uc('urn:tibet:empObject#tibet(person.salary)'),
                        'TP.sig.ValueChange');
                test.assert.didSignal(
                        TP.uc('urn:tibet:empObject'),
                        'TP.sig.ValueChange');
            });

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.click(TP.byId('setSSNButton'));
                seq.perform();
            },
            function(error) {
                TP.sys.logTest('Couldn\'t get resource: ' + loadURI.getLocation(),
                                TP.ERROR);
                test.fail();
            });

        this.then(
            function(result) {

                var testVal;

                testVal = TP.uc('urn:tibet:empObject').getResource().get(
                                                    TP.apc('person.SSN'));

                test.assert.isEqualTo(testVal, '111-22-3333');

                test.assert.isEqualTo(
                    TP.byOID('ssnField').get('value'),
                    '111-22-3333');

                test.assert.didSignal(TP.byId('setSSNButton'),
                                        'TP.sig.DOMClick');
                test.assert.didSignal(TP.byId('msgField'),
                                        'TP.sig.DOMContentLoaded');
                test.assert.didSignal(
                        TP.uc('urn:tibet:empObject#tibet(person.SSN)'),
                        'TP.sig.ValueChange');
                test.assert.didSignal(
                        TP.uc('urn:tibet:empObject'),
                        'TP.sig.ValueChange');
            });

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.assert.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOMContentLoaded');
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

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#document.TP.sig.DOMContentLoaded');
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
