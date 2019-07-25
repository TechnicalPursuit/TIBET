//  ========================================================================
//  xctrls:button
//  ========================================================================

TP.xctrls.button.Type.describe('TP.xctrls.button: manipulation',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_button.xhtml');
            driver.setLocation(loadURI);

            this.startTrackingSignals();
        });

    //  ---

    this.after(
        function() {

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Focusing', function(test, options) {

        var button;

        button = TP.byId('button1', windowContext);

        //  Change the focus via 'direct' method

        driver.constructSequence().
            sendEvent(TP.hc('type', 'focus'), button).
            run();

        test.chain(
            function() {

                var focusedElem;

                test.assert.hasAttribute(button, 'pclass:focus');

                test.assert.didSignal(button, 'TP.sig.UIFocus');
                test.assert.didSignal(button, 'TP.sig.UIDidFocus');

                focusedElem = driver.getFocusedElement();
                test.assert.isIdenticalTo(focusedElem, button);
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var button;

        //  Change the content via 'user' interaction

        button = TP.byId('button1', windowContext);

        //  Individual mousedown/mouseup

        driver.constructSequence().
            mouseDown(button).
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(button, 'pclass:active');

                test.assert.didSignal(button, 'TP.sig.UIActivate');
                test.assert.didSignal(button, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            mouseUp(button).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.hasAttribute(button, 'pclass:active');

                test.assert.didSignal(button, 'TP.sig.UIDeactivate');
                test.assert.didSignal(button, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  click

        driver.constructSequence().
            click(button).
            run();

        test.andWait(500);

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(button, 'TP.sig.UIActivate');
                test.assert.didSignal(button, 'TP.sig.UIDidActivate');

                test.assert.didSignal(button, 'TP.sig.UIDeactivate');
                test.assert.didSignal(button, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var button;

        //  Change the content via 'user' interaction

        button = TP.byId('button1', windowContext);

        //  Individual keydown/keyup

        driver.constructSequence().
            keyDown(button, 'Enter').
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(button, 'pclass:active');

                test.assert.didSignal(button, 'TP.sig.UIActivate');
                test.assert.didSignal(button, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(button, 'Enter').
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.hasAttribute(button, 'pclass:active');

                test.assert.didSignal(button, 'TP.sig.UIDeactivate');
                test.assert.didSignal(button, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var button;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        button = TP.byId('button1', windowContext);
        button.setAttrDisabled(true);

        //  --- Focus

        driver.constructSequence().
            sendEvent(TP.hc('type', 'focus'), button).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(button, 'pclass:focus');

                test.refute.didSignal(button, 'TP.sig.UIFocus');
                test.refute.didSignal(button, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        driver.constructSequence().
            mouseDown(button).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(button, 'pclass:active');

                test.refute.didSignal(button, 'TP.sig.UIActivate');
                test.refute.didSignal(button, 'TP.sig.UIDidActivate');
            });

        driver.constructSequence().
            mouseUp(button).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(button, 'TP.sig.UIDeactivate');
                test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        driver.constructSequence().
            click(button).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(button, 'TP.sig.UIActivate');
                test.refute.didSignal(button, 'TP.sig.UIDidActivate');

                test.refute.didSignal(button, 'TP.sig.UIDeactivate');
                test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        driver.constructSequence().
            keyDown(button, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(button, 'pclass:active');

                test.refute.didSignal(button, 'TP.sig.UIActivate');
                test.refute.didSignal(button, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(button, 'Enter').
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(button, 'TP.sig.UIDeactivate');
                test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');
            });
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
