//  ========================================================================
//  TP.tmp.PopupTestContent
//  ========================================================================

/**
 * @type {TP.tmp.PopupTestContent}
 * @summary TP.tmp.PopupTestContent
 */

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.defineSubtype('tmp.PopupTestContent');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.tmp.PopupTestContent.defineAttribute('styleURI', TP.NO_RESULT);
TP.tmp.PopupTestContent.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tmp.PopupTestContent.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Element} The new element.
     */

    var elem,
        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    newElem = TP.xhtmlnode(
    '<div tibet:tag="tmp:PopupTestContent"' +
            ' class="type_test_content">' +
        '<ul>' +
            '<li>' + 'Item #1' + '</li>' +
            '<li>' + 'Item #2' + '</li>' +
            '<li>' + 'Item #3' + '</li>' +
            '<li>' + 'Item #4' + '</li>' +
            '<li>' + 'Item #5' + '</li>' +
        '</ul>' +
    '</div>');

    //  Note here how we return the *result* of this method due to node
    //  importing, etc.
    return TP.elementReplaceWith(elem, newElem);
});

//  ========================================================================
//  xctrls:popup
//  ========================================================================

TP.xctrls.popup.Type.describe('TP.xctrls.popup: manipulation',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_popup.xhtml');
            driver.setLocation(loadURI);

            this.startTrackingSignals();
        });

    //  ---

    this.after(
        function(suite, options) {

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.afterEach(
        function(test, options) {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Focusing', function(test, options) {

        var trigger;

        trigger = TP.byId('trigger3', windowContext);

        //  Change the focus via 'direct' method

        driver.constructSequence().
            sendEvent(TP.hc('type', 'focus'), trigger).
            run();

        test.chain(
            function() {

                var focusedElem;

                test.assert.hasAttribute(trigger, 'pclass:focus');

                test.assert.didSignal(trigger, 'TP.sig.UIFocus');
                test.assert.didSignal(trigger, 'TP.sig.UIDidFocus');

                focusedElem = driver.getFocusedElement();
                test.assert.isIdenticalTo(focusedElem, trigger);
            });
    });

    //  ---

    this.it('Activation - mouse - non-sticky', function(test, options) {

        var trigger,
            systemPopup;

        //  Change the content via 'user' interaction

        trigger = TP.byId('trigger3', windowContext);

        //  TP.xctrls.popup doesn't respond to individual mousedown/mouseup. It
        //  is triggered by another control wanting to show/hide the popup.

        //  It will, however, respond to click to show/hide and will hide
        //  immediately because it's not sticky - trigger3 is not sticky.

        driver.constructSequence().
            click(trigger).
            run();

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(trigger, 'TP.sig.UIActivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidActivate');

                test.assert.didSignal(trigger, 'TP.sig.UIDeactivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidDeactivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.refute.isVisible(systemPopup);
            });
    });

    //  ---

    this.it('Activation - keyboard - non-sticky', function(test, options) {

        var trigger,
            systemPopup;

        //  Change the content via 'user' interaction

        trigger = TP.byId('trigger3', windowContext);

        //  Individual keydown/keyup

        //  TP.xctrls.popup will respond to keydown/keyup to show/hide, and will
        //  hide immediately because it's not sticky - trigger3 is not sticky.

        driver.constructSequence().
            keyDown(trigger, 'Enter').
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(trigger, 'pclass:active');

                test.assert.didSignal(trigger, 'TP.sig.UIActivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidActivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.assert.isVisible(systemPopup);

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(trigger, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(trigger, 'pclass:active');

                test.assert.didSignal(trigger, 'TP.sig.UIDeactivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidDeactivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.refute.isVisible(systemPopup);
            });
    });

    //  ---

    this.it('Activation - mouse - sticky', function(test, options) {

        var trigger,
            systemPopup;

        //  Change the content via 'user' interaction

        trigger = TP.byId('trigger1', windowContext);

        //  TP.xctrls.popup doesn't respond to individual mousedown/mouseup. It
        //  is triggered by another control wanting to show/hide the popup.

        //  It will, however, respond to click to show/hide and will not hide if
        //  it's 'sticky' - trigger1 is sticky.

        driver.constructSequence().
            click(trigger).
            run();

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(trigger, 'TP.sig.UIActivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidActivate');

                test.assert.didSignal(trigger, 'TP.sig.UIDeactivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidDeactivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.assert.isVisible(systemPopup);

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            click(trigger).
            run();

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(trigger, 'TP.sig.UIActivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidActivate');

                test.assert.didSignal(trigger, 'TP.sig.UIDeactivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidDeactivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.refute.isVisible(systemPopup);
            });
    });

    //  ---

    this.it('Activation - keyboard - sticky', function(test, options) {

        var trigger,
            systemPopup;

        //  Change the content via 'user' interaction

        trigger = TP.byId('trigger1', windowContext);

        //  Individual keydown/keyup

        //  TP.xctrls.popup will respond to keydown/keyup to show/hide, and will
        //  not hide if it's not sticky - trigger1 is sticky.

        driver.constructSequence().
            keyDown(trigger, 'Enter').
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(trigger, 'pclass:active');

                test.assert.didSignal(trigger, 'TP.sig.UIActivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidActivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.assert.isVisible(systemPopup);

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(trigger, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(trigger, 'pclass:active');

                test.assert.didSignal(trigger, 'TP.sig.UIDeactivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidDeactivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.assert.isVisible(systemPopup);

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyDown(trigger, 'Enter').
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(trigger, 'pclass:active');

                test.assert.didSignal(trigger, 'TP.sig.UIActivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidActivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.assert.isVisible(systemPopup);

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(trigger, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(trigger, 'pclass:active');

                test.assert.didSignal(trigger, 'TP.sig.UIDeactivate');
                test.assert.didSignal(trigger, 'TP.sig.UIDidDeactivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.refute.isVisible(systemPopup);
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var trigger,
            systemPopup;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        trigger = TP.byId('trigger4', windowContext);
        trigger.setAttrDisabled(true);

        //  --- Focus

        driver.constructSequence().
            sendEvent(TP.hc('type', 'focus'), trigger).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(trigger, 'pclass:focus');

                test.refute.didSignal(trigger, 'TP.sig.UIFocus');
                test.refute.didSignal(trigger, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup don't affect popups

        //  --- click

        driver.constructSequence().
            click(trigger).
            run();

        test.chain(
            function() {
                test.refute.didSignal(trigger, 'TP.sig.UIActivate');
                test.refute.didSignal(trigger, 'TP.sig.UIDidActivate');

                test.refute.didSignal(trigger, 'TP.sig.UIDeactivate');
                test.refute.didSignal(trigger, 'TP.sig.UIDidDeactivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.refute.isVisible(systemPopup);

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        driver.constructSequence().
            keyDown(trigger, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(trigger, 'pclass:active');

                test.refute.didSignal(trigger, 'TP.sig.UIActivate');
                test.refute.didSignal(trigger, 'TP.sig.UIDidActivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.refute.isVisible(systemPopup);

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(trigger, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.didSignal(trigger, 'TP.sig.UIDeactivate');
                test.refute.didSignal(trigger, 'TP.sig.UIDidDeactivate');

                systemPopup = TP.byId('systemPopup', windowContext);
                test.refute.isVisible(systemPopup);
            });
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
