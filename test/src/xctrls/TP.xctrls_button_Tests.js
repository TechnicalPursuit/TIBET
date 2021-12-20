//  ========================================================================
//  xctrls:button
//  ========================================================================

TP.xctrls.button.Type.describe('TP.xctrls.button: manipulation',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_button.xhtml');
            await driver.setLocation(loadURI);

            this.startTrackingSignals();
        });

    //  ---

    this.after(
        async function(suite, options) {

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.afterEach(
        function(test, options) {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Focusing', async function(test, options) {

        var button,
            focusedElem;

        button = TP.byId('button1', windowContext);

        //  Change the focus via 'direct' method

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), button).
                        run();

        test.assert.hasAttribute(button, 'pclass:focus');

        test.assert.didSignal(button, 'TP.sig.UIFocus');
        test.assert.didSignal(button, 'TP.sig.UIDidFocus');

        focusedElem = driver.getFocusedElement();
        test.assert.isIdenticalTo(focusedElem, button);
    });

    //  ---

    this.it('Activation - mouse', async function(test, options) {

        var button;

        //  Change the content via 'user' interaction

        button = TP.byId('button1', windowContext);

        //  Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(button).
                        run();

        test.assert.hasAttribute(button, 'pclass:active');

        test.assert.didSignal(button, 'TP.sig.UIActivate');
        test.assert.didSignal(button, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(button).
                        run();

        test.refute.hasAttribute(button, 'pclass:active');

        test.assert.didSignal(button, 'TP.sig.UIDeactivate');
        test.assert.didSignal(button, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  click

        await driver.constructSequence().
                        click(button).
                        run();

        //  Don't test the attribute here - it will already have been
        //  removed.

        test.assert.didSignal(button, 'TP.sig.UIActivate');
        test.assert.didSignal(button, 'TP.sig.UIDidActivate');

        test.assert.didSignal(button, 'TP.sig.UIDeactivate');
        test.assert.didSignal(button, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Activation - keyboard', async function(test, options) {

        var button;

        //  Change the content via 'user' interaction

        button = TP.byId('button1', windowContext);

        //  Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(button, 'Enter').
                        run();

        test.assert.hasAttribute(button, 'pclass:active');

        test.assert.didSignal(button, 'TP.sig.UIActivate');
        test.assert.didSignal(button, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(button, 'Enter').
                        run();

        test.refute.hasAttribute(button, 'pclass:active');

        test.assert.didSignal(button, 'TP.sig.UIDeactivate');
        test.assert.didSignal(button, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Disabled behavior', async function(test, options) {

        var button;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        button = TP.byId('button1', windowContext);
        button.setAttrDisabled(true);

        //  --- Focus

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), button).
                        run();

        test.refute.hasAttribute(button, 'pclass:focus');

        test.refute.didSignal(button, 'TP.sig.UIFocus');
        test.refute.didSignal(button, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        //  --- Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(button).
                        run();

        test.refute.hasAttribute(button, 'pclass:active');

        test.refute.didSignal(button, 'TP.sig.UIActivate');
        test.refute.didSignal(button, 'TP.sig.UIDidActivate');

        await driver.constructSequence().
                        mouseUp(button).
                        run();

        test.refute.didSignal(button, 'TP.sig.UIDeactivate');
        test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- click

        await driver.constructSequence().
                        click(button).
                        run();

        test.refute.didSignal(button, 'TP.sig.UIActivate');
        test.refute.didSignal(button, 'TP.sig.UIDidActivate');

        test.refute.didSignal(button, 'TP.sig.UIDeactivate');
        test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(button, 'Enter').
                        run();

        test.refute.hasAttribute(button, 'pclass:active');

        test.refute.didSignal(button, 'TP.sig.UIActivate');
        test.refute.didSignal(button, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(button, 'Enter').
                        run();

        test.refute.didSignal(button, 'TP.sig.UIDeactivate');
        test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
