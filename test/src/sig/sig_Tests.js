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
//  sig:
//  ========================================================================

TP.sig.XMLNS.Type.describe('sig: action elements',
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

    this.it('multiple ev: handlers under a single sig:action', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/sig/Sig1.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.click(TP.byId('fooButton'));
                seq.perform();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });

        this.then(
            function(result) {
                var firedFirstDateVal,
                    firedSecondDateVal;

                test.assert.hasAttribute(TP.byId('testResults'),
                                            'foobutton_click_1st');
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'foobutton_click_2nd');

                firedFirstDateVal = TP.dc(
                            TP.elementGetAttribute(
                                TP.byId('testResults'),
                                'foobutton_click_1st',
                                true));

                firedSecondDateVal = TP.dc(
                            TP.elementGetAttribute(
                                TP.byId('testResults'),
                                'foobutton_click_2nd',
                                true));

                test.assert.isTrue(
                    firedSecondDateVal.getTime() >= firedFirstDateVal.getTime());

                test.assert.didSignal(TP.byId('fooButton'), 'TP.sig.DOMClick');
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
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#fooButton.TP.sig.DOMClick');
            });
    });

    //  ---

    this.it('JS based handlers using sig:dispatch', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/sig/Sig2.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function(result) {

                var seq;

                seq = test.getDriver().startSequence();
                seq.click(TP.byId('dispatchButton'));
                seq.perform();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'goofy_typemethod');
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'goofy_instmethod');
                test.assert.hasAttribute(TP.byId('testResults'),
                                            'goofy_localmethod');

                test.assert.didSignal(TP.byId('dispatchButton'), 'TP.sig.DOMClick');
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
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#dispatchButton.TP.sig.DOMClick');
            });

        this.getDriver().setLocation(unloadURI);

        this.then(
            function() {
                var interestMapKeys;

                interestMapKeys = TP.keys(TP.sig.SignalMap.INTERESTS);

                test.refute.contains(
                    interestMapKeys,
                    TP.sys.getUICanvasPath() + loadURI.getLocation() + '#dispatchButton.TP.sig.DOMClick');
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.sig.XMLNS.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
