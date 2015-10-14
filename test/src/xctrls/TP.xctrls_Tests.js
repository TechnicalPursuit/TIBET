//  ========================================================================
//  xctrls:button
//  ========================================================================

TP.xctrls.button.Type.describe('TP.xctrls.button: manipulation',
function() {

    var unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            windowContext = this.getDriver().get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_button.xhtml');
            this.getDriver().setLocation(loadURI);

            this.startTrackingSignals();
        });

    //  ---

    this.after(
        function() {

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            //this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            //loadURI.unregister();
        });

    //  ---

    this.afterEach(
        function() {

            TP.signal.reset();

        });

    //  ---

    this.it('Focusing', function(test, options) {

        var button;

        button = TP.byId('button1', windowContext);

        //  Change the focus via 'direct' method

        test.getDriver().startSequence().
            sendEvent(TP.hc('type', 'focus'), button).
            perform();

        test.then(
            function() {
                test.assert.hasAttribute(button, 'pclass:focus');

                test.assert.didSignal(button, 'TP.sig.UIFocus');
                test.assert.didSignal(button, 'TP.sig.UIDidFocus');
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var button;

        //  Change the content via 'user' interaction

        button = TP.byId('button1', windowContext);

        //  Individual mousedown/mouseup

        test.getDriver().startSequence().
            mouseDown(button).
            perform();

        test.then(
            function() {
                test.assert.hasAttribute(button, 'pclass:active');

                test.assert.didSignal(button, 'TP.sig.UIActivate');
                test.assert.didSignal(button, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        test.getDriver().startSequence().
            mouseUp(button).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(button, 'pclass:active');

                test.assert.didSignal(button, 'TP.sig.UIDeactivate');
                test.assert.didSignal(button, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  click

        test.getDriver().startSequence().
            click(button).
            perform();

        test.then(
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

        test.getDriver().startSequence().
            keyDown(button, 'Enter').
            perform();

        test.then(
            function() {
                test.assert.hasAttribute(button, 'pclass:active');

                test.assert.didSignal(button, 'TP.sig.UIActivate');
                test.assert.didSignal(button, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        test.getDriver().startSequence().
            keyUp(button, 'Enter').
            perform();

        test.then(
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

        test.getDriver().startSequence().
            sendEvent(TP.hc('type', 'focus'), button).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(button, 'pclass:focus');

                test.refute.didSignal(button, 'TP.sig.UIFocus');
                test.refute.didSignal(button, 'TP.sig.UIDidFocus');

                TP.signal.reset();
            });

        //  --- Individual mousedown/mouseup

        test.getDriver().startSequence().
            mouseDown(button).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(button, 'pclass:active');

                test.refute.didSignal(button, 'TP.sig.UIActivate');
                test.refute.didSignal(button, 'TP.sig.UIDidActivate');
            });

        test.getDriver().startSequence().
            mouseUp(button).
            perform();

        test.then(
            function() {
                test.refute.didSignal(button, 'TP.sig.UIDeactivate');
                test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  --- click

        test.getDriver().startSequence().
            click(button).
            perform();

        test.then(
            function() {
                test.refute.didSignal(button, 'TP.sig.UIActivate');
                test.refute.didSignal(button, 'TP.sig.UIDidActivate');

                test.refute.didSignal(button, 'TP.sig.UIDeactivate');
                test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  --- Individual keydown/keyup

        test.getDriver().startSequence().
            keyDown(button, 'Enter').
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(button, 'pclass:active');

                test.refute.didSignal(button, 'TP.sig.UIActivate');
                test.refute.didSignal(button, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        test.getDriver().startSequence().
            keyUp(button, 'Enter').
            perform();

        test.then(
            function() {
                test.refute.didSignal(button, 'TP.sig.UIDeactivate');
                test.refute.didSignal(button, 'TP.sig.UIDidDeactivate');
            });
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.xctrls.button.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
