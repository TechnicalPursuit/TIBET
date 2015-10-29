//  ========================================================================
//  xctrls:radioitem
//  ========================================================================

TP.xctrls.radioitem.Type.describe('TP.xctrls.radioitem: manipulation',
function() {

    var unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            windowContext = this.getDriver().get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_radioitem.xhtml');
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

        var radioitem;

        radioitem = TP.byId('radioitem1', windowContext);

        //  Change the focus via 'direct' method

        test.getDriver().startSequence().
            sendEvent(TP.hc('type', 'focus'), radioitem).
            perform();

        test.then(
            function() {
                test.assert.hasAttribute(radioitem, 'pclass:focus');

                test.assert.didSignal(radioitem, 'TP.sig.UIFocus');
                test.assert.didSignal(radioitem, 'TP.sig.UIDidFocus');
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var radioitem;

        //  Change the content via 'user' interaction

        radioitem = TP.byId('radioitem1', windowContext);

        //  Individual mousedown/mouseup

        test.getDriver().startSequence().
            mouseDown(radioitem).
            perform();

        test.then(
            function() {
                test.assert.hasAttribute(radioitem, 'pclass:active');

                test.assert.didSignal(radioitem, 'TP.sig.UIActivate');
                test.assert.didSignal(radioitem, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        test.getDriver().startSequence().
            mouseUp(radioitem).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(radioitem, 'pclass:active');

                test.assert.didSignal(radioitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(radioitem, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  click

        test.getDriver().startSequence().
            click(radioitem).
            perform();

        test.then(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(radioitem, 'TP.sig.UIActivate');
                test.assert.didSignal(radioitem, 'TP.sig.UIDidActivate');

                test.assert.didSignal(radioitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(radioitem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var radioitem;

        //  Change the content via 'user' interaction

        radioitem = TP.byId('radioitem1', windowContext);

        //  Individual keydown/keyup

        test.getDriver().startSequence().
            keyDown(radioitem, 'Enter').
            perform();

        test.then(
            function() {
                test.assert.hasAttribute(radioitem, 'pclass:active');

                test.assert.didSignal(radioitem, 'TP.sig.UIActivate');
                test.assert.didSignal(radioitem, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        test.getDriver().startSequence().
            keyUp(radioitem, 'Enter').
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(radioitem, 'pclass:active');

                test.assert.didSignal(radioitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(radioitem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var radioitem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        radioitem = TP.byId('radioitem1', windowContext);
        radioitem.setAttrDisabled(true);

        //  --- Focus

        test.getDriver().startSequence().
            sendEvent(TP.hc('type', 'focus'), radioitem).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(radioitem, 'pclass:focus');

                test.refute.didSignal(radioitem, 'TP.sig.UIFocus');
                test.refute.didSignal(radioitem, 'TP.sig.UIDidFocus');

                TP.signal.reset();
            });

        //  --- Individual mousedown/mouseup

        test.getDriver().startSequence().
            mouseDown(radioitem).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(radioitem, 'pclass:active');

                test.refute.didSignal(radioitem, 'TP.sig.UIActivate');
                test.refute.didSignal(radioitem, 'TP.sig.UIDidActivate');
            });

        test.getDriver().startSequence().
            mouseUp(radioitem).
            perform();

        test.then(
            function() {
                test.refute.didSignal(radioitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(radioitem, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  --- click

        test.getDriver().startSequence().
            click(radioitem).
            perform();

        test.then(
            function() {
                test.refute.didSignal(radioitem, 'TP.sig.UIActivate');
                test.refute.didSignal(radioitem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(radioitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(radioitem, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  --- Individual keydown/keyup

        test.getDriver().startSequence().
            keyDown(radioitem, 'Enter').
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(radioitem, 'pclass:active');

                test.refute.didSignal(radioitem, 'TP.sig.UIActivate');
                test.refute.didSignal(radioitem, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        test.getDriver().startSequence().
            keyUp(radioitem, 'Enter').
            perform();

        test.then(
            function() {
                test.refute.didSignal(radioitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(radioitem, 'TP.sig.UIDidDeactivate');
            });
    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Type.describe('TP.xctrls.radioitem: set value',
function() {

    var testData,

        unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_radioitem.xhtml');
            this.getDriver().setLocation(loadURI);

            windowContext = this.getDriver().get('windowContext');
        });

    //  ---

    this.after(
        function() {

            //  Unload the current page by setting it to the blank
            //this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            //loadURI.unregister();
        });

    //  ---

    this.it('setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('dataradioitem1', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isNull(value);
    });

    //  ---

    this.it('setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('dataradioitem1', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Array
        tpElem.set('value', TP.ac('foo', 'bar', 'baz'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  Object
        tpElem.set('value', {foo: 'baz'});
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('dataradioitem1', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'baz');
    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.xctrls.radioitem.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
