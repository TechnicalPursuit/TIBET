//  ========================================================================
//  xctrls:dialog
//  ========================================================================

TP.xctrls.dialog.Type.describe('TP.xctrls.dialog: manipulation',
function() {

    var driver,
        windowContext,

        focusStackPreTest,

        unloadURI,
        loadURI;

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            //  We 'snapshot' the current focus stack so that in case we're
            //  running this in the Sherpa, etc., any current items won't be
            //  corrupting our assertions below.
            focusStackPreTest = TP.$focus_stack;
            TP.$focus_stack = TP.ac();

            //  Remove the 'pclass:focus' attribute from any elements that are
            //  on the focus stack before we run our tests. This is so that our
            //  focusing tests won't get confused with other elements that might
            //  be focused before we start testing.
            //  Note how we do this manually since we're trying to avoid
            //  invoking focus stack maintenance machinery.
            focusStackPreTest.forEach(
                function(aTPElem) {
                    TP.elementRemoveAttribute(
                        TP.unwrap(aTPElem),
                        'pclass:focus',
                        true);
                });

            windowContext = driver.get('windowContext');

            //  A document containing several focusable fields
            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_dialog.xhtml');
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

            //  Restore the 'pclass:focus' attribute to any elements that were
            //  on the focus stack before we ran our tests. Note how we do this
            //  manually since we're trying to avoid invoking focus stack
            //  maintenance machinery.
            focusStackPreTest.forEach(
                function(aTPElem) {
                    TP.elementSetAttribute(
                        TP.unwrap(aTPElem),
                        'pclass:focus',
                        'true',
                        true);
                });

            //  Restore the focus stack to what it was.
            TP.$focus_stack = focusStackPreTest;
        });

    //  ---

    this.afterEach(
        function(test, options) {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Focusing', function(test, options) {

        var pageTextField,
            focusedElem;

        pageTextField = TP.byId('pageTextField', windowContext, false);

        test.chain(
            function() {
                //  Initially, the text field in the page should have focus.
                test.assert.hasAttribute(pageTextField, 'pclass:focus');

                test.assert.didSignal(pageTextField, 'TP.sig.UIFocus');
                test.assert.didSignal(pageTextField, 'TP.sig.UIDidFocus');

                focusedElem = driver.getFocusedElement();
                test.assert.isIdenticalTo(focusedElem, pageTextField);

                //  At this point, the focus stack should have one item on it -
                //  the page field element (wrapped).
                test.assert.isSizeOf(
                        TP.$focus_stack,
                        1,
                        'Focus stack size of: ' +
                            TP.$focus_stack.getSize() +
                            ' is not the correct size in Step #1');
                test.assert.isIdenticalTo(
                        TP.$focus_stack.last(),
                        pageTextField,
                        'Stack last element not identical to page text field');
            });

        test.chain(
            function() {

                var templateURI,
                    promise;

                //  Grab the template URI and dialog ID for the 'prompt' panel
                //  (and defaulting if they are not supplied in the separate
                //  hash).
                templateURI = TP.uc('~TP.xctrls.dialog/system_prompt.xhtml');

                //  Call the TP.dialog() method with that data and specifying
                //  that the panelis to be modal and what the message it.
                promise = TP.dialog(
                            TP.hc('templateURI', templateURI,
                                    'dialogID', 'testDialog',
                                    'isModal', true,
                                    'templateData',
                                        TP.hc('message', 'Hi There')));

                return promise;
            });

        test.andAllowGUIRefresh(windowContext);

        test.chain(
            function() {

                var uiRootWin,
                    dialogTPElem,
                    dialogTextField;

                uiRootWin = TP.sys.getUIRoot(true);

                dialogTPElem = TP.byId('testDialog', uiRootWin, true);

                dialogTextField =
                    TP.byCSSPath('#testDialog input[type="text"]',
                                    uiRootWin,
                                    true);

                test.assert.hasAttribute(dialogTextField, 'pclass:focus');

                test.assert.didSignal(dialogTextField, 'TP.sig.UIFocus');
                test.assert.didSignal(dialogTextField, 'TP.sig.UIDidFocus');

                focusedElem = TP.documentGetFocusedElement(uiRootWin.document);
                test.assert.isIdenticalTo(focusedElem,
                                            TP.unwrap(dialogTextField));

                //  At this point, the focus stack should have two items
                //  on it, because we entered a new focusing context -
                //  the previous element (pageTextField) and the currently
                //  focused element (dialogTextField)
                test.assert.isSizeOf(
                    TP.$focus_stack,
                    2,
                    'Focus stack size of: ' +
                        TP.$focus_stack.getSize() +
                        ' is not the correct size in Step #2');
                test.assert.isIdenticalTo(
                    TP.$focus_stack.first(),
                    TP.wrap(pageTextField),
                    'Stack first element not identical to page text field');
                test.assert.isIdenticalTo(
                    TP.$focus_stack.last(),
                    TP.wrap(dialogTextField),
                    'Stack last element not identical to dialog text field');

                //  Hide the dialog - this should cause it's field to blur and
                //  for the focus stack to pop, thereby making the page field
                //  the currently focused field.
                dialogTPElem.setAttribute('hidden', true);
            });

        test.andAllowGUIRefresh(windowContext);

        test.chain(
            function() {

                focusedElem = driver.getFocusedElement();
                test.assert.isIdenticalTo(focusedElem, pageTextField);

                //  At this point, the focus stack should have one item on it -
                //  the page field element (wrapped).
                test.assert.isSizeOf(
                        TP.$focus_stack,
                        1,
                        'Focus stack size of: ' +
                            TP.$focus_stack.getSize() +
                            ' is not the correct size in step #3');
                test.assert.isIdenticalTo(
                        TP.$focus_stack.last(),
                        pageTextField,
                        'Stack last element not identical to page text field');
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'headless' ||
        TP.sys.cfg('project.name') === 'travis');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
