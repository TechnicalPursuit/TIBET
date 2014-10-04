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

    var testDataLoc;

    testDataLoc = '~lib_tst/src/ev/XMLEvents1.xhtml';

    this.it('simple registration', function(test, options) {

        var loadURI,
            unloadURI;

        loadURI = TP.uc(testDataLoc);
        unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

        //  PhantomJS has issues... sigh...
        if (TP.sys.cfg('boot.context') === 'phantomjs') {

            //  250ms is the minimum we've found that makes PhantomJS behave.
            this.thenWait(250);
        }

        this.then(
            function(result) {
                test.assert.hasAttribute(TP.byId('testResults'), 'test1');
                test.assert.hasAttribute(TP.byId('testResults'), 'test2');
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
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.ev.XMLNS.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
