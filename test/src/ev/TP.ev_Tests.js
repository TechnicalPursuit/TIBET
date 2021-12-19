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
        loadURI,
        driver,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            this.getDriver().showTestGUI();

            windowContext = this.getDriver().get('windowContext');
        });

    this.after(
        function(suite, options) {
            this.getDriver().showTestLog();
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        async function(test, options) {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the
            //  blank
            await this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('simple registration', async function(test, options) {

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents1.xhtml');

        await driver.setLocation(loadURI);

        TP.sys.uiwin(true).focus();

        await driver.constructSequence().
                click(TP.byId('fooButton', windowContext, false)).
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'handlerspecifiescontrol');

        await driver.constructSequence().
                click(TP.byId('barButton', windowContext, false)).
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'controlspecifieshandler');
    });

    //  ---

    this.it('document and element loaded', async function(test, options) {

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents2.xhtml');

        await driver.setLocation(loadURI);

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'documentcontentloadedfired');

        test.assert.didSignal(TP.sys.uidoc(),
                                'TP.sig.DOMContentLoaded');

        TP.sys.uiwin(true).focus();

        //  Note that since this code is being executed immediately, we
        //  have to specify a *path* to our target element.
        await driver.constructSequence().
                click(TP.byId('updateElement', windowContext, false)).
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'elementcontentloadedfired');
        test.assert.didSignal(
            TP.byId('testDiv', windowContext, false),
            'TP.sig.DOMContentLoaded');
    });

    //  ---

    this.it('keypresses of various kinds', async function(test, options) {

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents3.xhtml');

        await driver.setLocation(loadURI);

        TP.sys.uiwin(true).focus();

        await driver.constructSequence().
                sendKeys('[Shift]A[Shift-Up]').
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'alphakeyfired');
        test.assert.didSignal(TP.sys.uidoc(),
                                'TP.sig.DOM_A_Up');

        await driver.constructSequence().
                sendKeys('\u0062').
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'unicodekeyfired');
        test.assert.didSignal(TP.sys.uidoc(),
                                'TP.sig.DOM_U0062_Up');

        await driver.constructSequence().
                sendKeys('[F2]').
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'fnkeyfired');
        test.assert.didSignal(TP.sys.uidoc(),
                                'TP.sig.DOM_F2_Up');
    });

    //  ---

    this.it('multi origins and multi signals', async function(test, options) {

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents4.xhtml');

        await driver.setLocation(loadURI);

        TP.sys.uiwin(true).focus();

        await driver.constructSequence().
                click(TP.byId('fooDiv'), windowContext, false).
                run();

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

        await driver.constructSequence().
                doubleClick(TP.byId('fooDiv', windowContext, false)).
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'multisignalsingleorigin');
        test.assert.didSignal(
            TP.byId('fooDiv', windowContext, false),
            'TP.sig.DOMDblClick');
    });

    //  ---

    this.it('ANY origins and ANY signals', async function(test, options) {

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents5.xhtml');

        await driver.setLocation(loadURI);

        TP.sys.uiwin(true).focus();

        await driver.constructSequence().
                click(TP.byId('fooDiv', windowContext, false)).
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'anysignalsingleorigin');
        test.assert.didSignal(
            TP.byId('fooDiv', windowContext, false),
            'TP.sig.DOMClick');

        await driver.constructSequence().
                doubleClick(TP.byId('bazDiv', windowContext, false)).
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'singlesignalanyorigin');
        test.assert.didSignal(
            TP.byId('bazDiv', windowContext, false),
            'TP.sig.DOMDblClick');

    }).skip();

    //  ---

    this.it('stop default action, stop propagation, capturing', async function(test, options) {

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents6.xhtml');

        await driver.setLocation(loadURI);

        TP.sys.uiwin(true).focus();

        await driver.constructSequence().
                sendKeys('ABCDE', TP.byId('fooField', windowContext, false)).
                run();

                //  Default was being prevented - the field shouldn't
                //  have any content.
                test.refute.isEqualTo(
                    TP.byId('fooField', windowContext, false).value,
                    'ABCDE');

        await driver.constructSequence().
                sendKeys('A', TP.byId('barField', windowContext, false)).
                run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'barfieldkeypress');
        test.refute.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'barfieldwrapperkeypress');

        test.assert.didSignal(
            TP.byId('barField', windowContext, false),
            'TP.sig.DOMKeyPress');

        await driver.constructSequence().
                sendKeys('A',
                        TP.byId('bazField', windowContext, false)).
                run();
    });

    //  ---

    this.it('keypresses executing shell scripts', async function(test, options) {

        var testVal;

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents7.xhtml');

        await driver.setLocation(loadURI);

        TP.sys.uiwin(true).focus();

        await driver.constructSequence().
                sendKeys('[Shift]X[Shift-Up]').
                run();

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

        await driver.constructSequence().
                sendKeys('[Shift]Y[Shift-Up]').
                run();

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

        await driver.constructSequence().
                sendKeys('[Shift]Z[Shift-Up]').
                run();

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
    }).skip();

    //  ---

    this.it('keypress sequences', async function(test, options) {

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents8.xhtml');

        await driver.setLocation(loadURI);

        //  This sequence of focusing the window and then 'typing' a Tab
        //  key seems to have the best chance of success to then accept
        //  keystrokes meant for the document body.
        TP.sys.uiwin(true).focus();
        await driver.constructSequence().
                        sendKeys('[Tab]').
                        run();

        await driver.constructSequence().
                        sendKeys('[Shift]A[Shift-Up]').
                        sendKeys('[Shift]S[Shift-Up]').
                        run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'alphasequencefired');

        test.assert.didSignal(
            TP.sys.uidoc(),
            'TP.sig.DOM_A_Up__TP.sig.DOM_S_Up');

        //  This sequence of focusing the window and then 'typing' a Tab
        //  key seems to have the best chance of success to then accept
        //  keystrokes meant for the document body.
        TP.sys.uiwin(true).focus();
        await driver.constructSequence().
                        sendKeys('[Tab]').
                        run();

        await driver.constructSequence().
                        sendKeys('\u0062').
                        sendKeys('[Shift]S[Shift-Up]').
                        run();

        test.assert.hasAttribute(
            TP.byId('testResults', windowContext, false),
            'unicodesequencefired');

        test.assert.didSignal(
            TP.sys.uidoc(),
            'TP.sig.DOM_U0062_Up__TP.sig.DOM_S_Up');
    });

    //  ---

    this.it('markup-level change notification', async function(test, options) {

        var testVal;

        driver = test.getDriver();

        loadURI = TP.uc('~lib_test/src/ev/XMLEvents9.xhtml');

        await driver.setLocation(loadURI);

        TP.sys.uiwin(true).focus();

        await driver.constructSequence().
                        click(TP.byId('setSalaryButton', windowContext, false)).
                        run();

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

        await driver.constructSequence().
                        click(TP.byId('setSSNButton')).
                        run();
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
