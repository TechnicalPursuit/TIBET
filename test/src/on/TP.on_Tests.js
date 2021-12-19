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
//  TP.tmp.testElem
//  ========================================================================

//  Don't redefine this if another test has defined it.
if (!TP.isType(TP.tmp.testElem)) {
    TP.dom.UIElementNode.defineSubtype('tmp.testElem');
}

TP.tmp.testElem.Inst.defineHandler('ClickTestSignal',
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

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));
    loadURI = TP.uc('~lib_test/src/on/OnTest1.xhtml');

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            //  ---

            driver.showTestGUI();

            //  ---

            await driver.setLocation(loadURI);

            this.startTrackingSignals();
        });

    this.after(
        async function(suite, options) {
            this.stopTrackingSignals();

            driver.showTestLog();

            //  Unload the current page by setting it to the
            //  blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            //  Reset the spy on signaling in preparation for the
            //  next step in this test.
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('DOM on: signaling - DOM standard name', async function(test, options) {

        var elem;

        elem = TP.byId('testElem1', windowContext);

        await driver.constructSequence().
                        click(elem).
                        run();

        test.assert.didSignal(elem, 'TP.sig.DOMClick');
        test.assert.didSignal(elem, 'ClickTestSignal');
    });

    //  ---

    this.it('DOM on: signaling - TIBET full name', async function(test, options) {

        var elem;

        elem = TP.byId('testElem2', windowContext);

        await driver.constructSequence().
                        click(elem).
                        run();

        test.assert.didSignal(elem, 'TP.sig.DOMClick');
        test.assert.didSignal(elem, 'ClickTestSignal');
    });

    //  ---

    this.it('DOM on: signaling - TIBET short name', async function(test, options) {

        var elem;

        elem = TP.byId('testElem3', windowContext);

        await driver.constructSequence().
                        click(elem).
                        run();

        test.assert.didSignal(elem, 'TP.sig.DOMClick');
        test.assert.didSignal(elem, 'ClickTestSignal');
    });

});

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.describe('on: DOM signals - with payload',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));
    loadURI = TP.uc('~lib_test/src/on/OnTest2.xhtml');

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();

            await driver.setLocation(loadURI);

            this.startTrackingSignals();
        });

    this.after(
        async function(suite, options) {
            this.stopTrackingSignals();

            driver.showTestLog();

            //  Unload the current page by setting it to the
            //  blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            //  Reset the spy on signaling in preparation for the
            //  next step in this test.
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('DOM on: signaling - DOM standard name', async function(test, options) {

        var triggerElem,
            elem,

            args,
            len,
            i,

            sigPayload;

        triggerElem = TP.byId('triggerElem1', windowContext);
        elem = TP.byId('testElem1', windowContext);

        await driver.constructSequence().
                        click(triggerElem).
                        run();

        test.assert.didSignal(triggerElem, 'TP.sig.DOMClick');
        test.assert.didSignal(elem, 'ClickTestSignal');

        //  Search through all of the signal invocations, looking for
        //  'ClickTestSignal'
        args = test.getSuite().getSignalingArgs();

        len = args.getSize();
        for (i = len - 1; i >= 0; i--) {
            if (args.at(i).at(1) === 'ClickTestSignal') {
                sigPayload = args.at(i).at(2);
                break;
            }
        }

        test.assert.hasKey(sigPayload, 'foo');
        test.assert.hasKey(sigPayload, 'baz');
    });

    //  ---

    this.it('DOM on: signaling - TIBET full name', async function(test, options) {

        var triggerElem,
            elem,

            args,
            len,
            i,

            sigPayload;

        triggerElem = TP.byId('triggerElem2', windowContext);
        elem = TP.byId('testElem1', windowContext);

        await driver.constructSequence().
                        click(triggerElem).
                        run();

        test.assert.didSignal(triggerElem, 'TP.sig.DOMClick');
        test.assert.didSignal(elem, 'ClickTestSignal');

        //  Search through all of the signal invocations, looking for
        //  'ClickTestSignal'
        args = test.getSuite().getSignalingArgs();

        len = args.getSize();
        for (i = len - 1; i >= 0; i--) {
            if (args.at(i).at(1) === 'ClickTestSignal') {
                sigPayload = args.at(i).at(2);
                break;
            }
        }

        test.assert.hasKey(sigPayload, 'foo');
        test.assert.hasKey(sigPayload, 'baz');
    });

    //  ---

    this.it('DOM on: signaling - TIBET short name', async function(test, options) {

        var triggerElem,
            elem,

            args,
            len,
            i,

            sigPayload;

        triggerElem = TP.byId('triggerElem3', windowContext);
        elem = TP.byId('testElem1', windowContext);

        await driver.constructSequence().
                        click(triggerElem).
                        run();

        test.assert.didSignal(triggerElem, 'TP.sig.DOMClick');
        test.assert.didSignal(elem, 'ClickTestSignal');

        //  Search through all of the signal invocations, looking for
        //  'ClickTestSignal'
        args = test.getSuite().getSignalingArgs();

        len = args.getSize();
        for (i = len - 1; i >= 0; i--) {
            if (args.at(i).at(1) === 'ClickTestSignal') {
                sigPayload = args.at(i).at(2);
                break;
            }
        }

        test.assert.hasKey(sigPayload, 'foo');
        test.assert.hasKey(sigPayload, 'baz');
    });

});

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.describe('on: non-DOM signals - no payload',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));
    loadURI = TP.uc('~lib_test/src/on/OnTest3.xhtml');

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();

            await driver.setLocation(loadURI);

            this.startTrackingSignals();
        });

    this.after(
        async function(suite, options) {

            this.stopTrackingSignals();
            driver.showTestLog();

            //  Unload the current page by setting it to the
            //  blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            //  Reset the spy on signaling in preparation for the
            //  next step in this test.
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('non-DOM on: signaling - TIBET full name', function(test, options) {

        var elem;

        elem = TP.byId('testElem1', windowContext);

        TP.wrap(elem).dispatch('TP.sig.FooSignal');

        test.assert.didSignal(elem, 'TP.sig.FooSignal');
        test.assert.didSignal(elem, 'TP.sig.BarSignal');
    });

    //  ---

    this.it('non-DOM on: signaling - TIBET short name', function(test, options) {

        var elem;

        elem = TP.byId('testElem2', windowContext);

        TP.wrap(elem).dispatch('FooSignal');

        test.assert.didSignal(elem, 'FooSignal');
        test.assert.didSignal(elem, 'TP.sig.BarSignal');
    });

});

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.describe('on: non-DOM signals - with payload',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));
    loadURI = TP.uc('~lib_test/src/on/OnTest4.xhtml');

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();

            await driver.setLocation(loadURI);

            this.startTrackingSignals();
        });

    this.after(
        async function(suite, options) {

            this.stopTrackingSignals();

            driver.showTestLog();

            //  Unload the current page by setting it to the
            //  blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            //  Reset the spy on signaling in preparation for the
            //  next step in this test.
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('non-DOM on: signaling - TIBET full name', function(test, options) {

        var triggerElem,
            elem,

            args,
            len,
            i,

            sigPayload;

        triggerElem = TP.byId('triggerElem1', windowContext);
        elem = TP.byId('testElem1', windowContext);

        TP.wrap(triggerElem).dispatch('TP.sig.FooSignal');

        test.assert.didSignal(triggerElem, 'TP.sig.FooSignal');
        test.assert.didSignal(elem, 'TP.sig.BarSignal');

        //  Search through all of the signal invocations, looking for
        //  'TP.sig.BarSignal'
        args = test.getSuite().getSignalingArgs();

        len = args.getSize();
        for (i = len - 1; i >= 0; i--) {
            if (args.at(i).at(1) === 'TP.sig.BarSignal') {
                sigPayload = args.at(i).at(2);
                break;
            }
        }

        test.assert.hasKey(sigPayload, 'foo');
        test.assert.hasKey(sigPayload, 'baz');
    });

    //  ---

    this.it('non-DOM on: signaling - TIBET short name', function(test, options) {

        var triggerElem,
            elem,

            args,
            len,
            i,

            sigPayload;

        triggerElem = TP.byId('triggerElem2', windowContext);
        elem = TP.byId('testElem1', windowContext);

        TP.wrap(triggerElem).dispatch('FooSignal');

        test.assert.didSignal(triggerElem, 'FooSignal');
        test.assert.didSignal(elem, 'TP.sig.BarSignal');

        //  Search through all of the signal invocations, looking for
        //  'TP.sig.BarSignal'
        args = test.getSuite().getSignalingArgs();

        len = args.getSize();
        for (i = len - 1; i >= 0; i--) {
            if (args.at(i).at(1) === 'TP.sig.BarSignal') {
                sigPayload = args.at(i).at(2);
                break;
            }
        }

        test.assert.hasKey(sigPayload, 'foo');
        test.assert.hasKey(sigPayload, 'baz');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
