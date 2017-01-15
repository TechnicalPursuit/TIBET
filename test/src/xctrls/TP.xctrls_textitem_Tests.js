//  ========================================================================
//  xctrls:textitem
//  ========================================================================

TP.xctrls.textitem.Type.describe('TP.xctrls.textitem: manipulation',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_textitem.xhtml');
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
            TP.signal.reset();
        });

    //  ---

    this.it('Focusing', function(test, options) {

        var textitem;

        textitem = TP.byId('textitem1', windowContext);

        //  Change the focus via 'direct' method

        driver.startSequence().
            sendEvent(TP.hc('type', 'focus'), textitem).
            perform();

        test.then(
            function() {

                var focusedElem;

                test.assert.hasAttribute(textitem, 'pclass:focus');

                test.assert.didSignal(textitem, 'TP.sig.UIFocus');
                test.assert.didSignal(textitem, 'TP.sig.UIDidFocus');

                focusedElem = driver.getFocusedElement();
                test.assert.isIdenticalTo(focusedElem, textitem);
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var textitem;

        //  Change the content via 'user' interaction

        textitem = TP.byId('textitem1', windowContext);

        //  Individual mousedown/mouseup

        driver.startSequence().
            mouseDown(textitem).
            perform();

        test.then(
            function() {
                test.assert.hasAttribute(textitem, 'pclass:active');

                test.assert.didSignal(textitem, 'TP.sig.UIActivate');
                test.assert.didSignal(textitem, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        driver.startSequence().
            mouseUp(textitem).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(textitem, 'pclass:active');

                test.assert.didSignal(textitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(textitem, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  click

        driver.startSequence().
            click(textitem).
            perform();

        test.then(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(textitem, 'TP.sig.UIActivate');
                test.assert.didSignal(textitem, 'TP.sig.UIDidActivate');

                test.assert.didSignal(textitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(textitem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var textitem;

        //  Change the content via 'user' interaction

        textitem = TP.byId('textitem1', windowContext);

        //  Individual keydown/keyup

        driver.startSequence().
            keyDown(textitem, 'Enter').
            perform();

        test.then(
            function() {
                test.assert.hasAttribute(textitem, 'pclass:active');

                test.assert.didSignal(textitem, 'TP.sig.UIActivate');
                test.assert.didSignal(textitem, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        driver.startSequence().
            keyUp(textitem, 'Enter').
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(textitem, 'pclass:active');

                test.assert.didSignal(textitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(textitem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var textitem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        textitem = TP.byId('textitem1', windowContext);
        textitem.setAttrDisabled(true);

        //  --- Focus

        driver.startSequence().
            sendEvent(TP.hc('type', 'focus'), textitem).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(textitem, 'pclass:focus');

                test.refute.didSignal(textitem, 'TP.sig.UIFocus');
                test.refute.didSignal(textitem, 'TP.sig.UIDidFocus');

                TP.signal.reset();
            });

        //  --- Individual mousedown/mouseup

        driver.startSequence().
            mouseDown(textitem).
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(textitem, 'pclass:active');

                test.refute.didSignal(textitem, 'TP.sig.UIActivate');
                test.refute.didSignal(textitem, 'TP.sig.UIDidActivate');
            });

        driver.startSequence().
            mouseUp(textitem).
            perform();

        test.then(
            function() {
                test.refute.didSignal(textitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(textitem, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  --- click

        driver.startSequence().
            click(textitem).
            perform();

        test.then(
            function() {
                test.refute.didSignal(textitem, 'TP.sig.UIActivate');
                test.refute.didSignal(textitem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(textitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(textitem, 'TP.sig.UIDidDeactivate');

                TP.signal.reset();
            });

        //  --- Individual keydown/keyup

        driver.startSequence().
            keyDown(textitem, 'Enter').
            perform();

        test.then(
            function() {
                test.refute.hasAttribute(textitem, 'pclass:active');

                test.refute.didSignal(textitem, 'TP.sig.UIActivate');
                test.refute.didSignal(textitem, 'TP.sig.UIDidActivate');

                TP.signal.reset();
            });

        driver.startSequence().
            keyUp(textitem, 'Enter').
            perform();

        test.then(
            function() {
                test.refute.didSignal(textitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(textitem, 'TP.sig.UIDidDeactivate');
            });
    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.xctrls.textitem.Type.describe('TP.xctrls.textitem: get/set value - no multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        testData;

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_textitem.xhtml');
            driver.setLocation(loadURI);
        });

    //  ---

    this.after(
        function() {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:textitem - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('testGroup1', windowContext);

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

    this.it('xctrls:textitem - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('testGroup1', windowContext);

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
        tpElem.set('value',
            {
                foo: 'baz'
            });
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('xctrls:textitem - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('testGroup1', windowContext);

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

//  ------------------------------------------------------------------------

TP.xctrls.textitem.Type.describe('TP.xctrls.textitem: get/set value - multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        testData;

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_textitem.xhtml');
            driver.setLocation(loadURI);

            windowContext = driver.get('windowContext');
        });

    //  ---

    this.after(
        function() {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function() {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('testGroup2', windowContext);
            tpElem.deselectAll();
        });

    //  ---

    this.it('xctrls:textitem - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('testGroup2', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  reset
        tpElem.deselectAll();

        //  String (multiple)
        tpElem.set('value', 'foo;baz');
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo', 'baz'));

        //  reset
        tpElem.deselectAll();

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);
    });

    //  ---

    this.it('xctrls:textitem - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('testGroup2', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Array
        tpElem.set('value', TP.ac('foo', 'bar', 'baz'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo', 'bar', 'baz'));

        //  reset
        tpElem.deselectAll();

        //  Object
        tpElem.set('value', {
            foo: 'baz'
        });
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('baz'));

        //  reset
        tpElem.deselectAll();

        //  TP.core.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));
    });

    //  ---

    this.it('xctrls:textitem - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('testGroup2', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  reset
        tpElem.deselectAll();

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  reset
        tpElem.deselectAll();

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  reset
        tpElem.deselectAll();

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  reset
        tpElem.deselectAll();

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  reset
        tpElem.deselectAll();

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  reset
        tpElem.deselectAll();

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('baz'));
    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
