//  ========================================================================
//  xctrls:checkitem
//  ========================================================================

TP.xctrls.checkitem.Type.describe('TP.xctrls.checkitem: manipulation',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_checkitem.xhtml');
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

        var checkitem;

        checkitem = TP.byId('checkitem1', windowContext);

        //  Change the focus via 'direct' method

        driver.constructSequence().
            sendEvent(TP.hc('type', 'focus'), checkitem).
            run();

        test.chain(
            function() {

                var focusedElem;

                test.assert.hasAttribute(checkitem, 'pclass:focus');

                test.assert.didSignal(checkitem, 'TP.sig.UIFocus');
                test.assert.didSignal(checkitem, 'TP.sig.UIDidFocus');

                focusedElem = driver.getFocusedElement();
                test.assert.isIdenticalTo(focusedElem, checkitem);
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var checkitem;

        //  Change the content via 'user' interaction

        checkitem = TP.byId('checkitem1', windowContext);

        //  Individual mousedown/mouseup

        driver.constructSequence().
            mouseDown(checkitem).
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(checkitem, 'pclass:active');

                test.assert.didSignal(checkitem, 'TP.sig.UIActivate');
                test.assert.didSignal(checkitem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            mouseUp(checkitem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.hasAttribute(checkitem, 'pclass:active');

                test.assert.didSignal(checkitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(checkitem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  click

        driver.constructSequence().
            click(checkitem).
            run();

        test.andWait(500);

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(checkitem, 'TP.sig.UIActivate');
                test.assert.didSignal(checkitem, 'TP.sig.UIDidActivate');

                test.assert.didSignal(checkitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(checkitem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var checkitem;

        //  Change the content via 'user' interaction

        checkitem = TP.byId('checkitem1', windowContext);

        //  Individual keydown/keyup

        driver.constructSequence().
            keyDown(checkitem, 'Enter').
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(checkitem, 'pclass:active');

                test.assert.didSignal(checkitem, 'TP.sig.UIActivate');
                test.assert.didSignal(checkitem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(checkitem, 'Enter').
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.hasAttribute(checkitem, 'pclass:active');

                test.assert.didSignal(checkitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(checkitem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var checkitem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        checkitem = TP.byId('checkitem1', windowContext);
        checkitem.setAttrDisabled(true);

        //  --- Focus

        driver.constructSequence().
            sendEvent(TP.hc('type', 'focus'), checkitem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(checkitem, 'pclass:focus');

                test.refute.didSignal(checkitem, 'TP.sig.UIFocus');
                test.refute.didSignal(checkitem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        driver.constructSequence().
            mouseDown(checkitem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(checkitem, 'pclass:active');

                test.refute.didSignal(checkitem, 'TP.sig.UIActivate');
                test.refute.didSignal(checkitem, 'TP.sig.UIDidActivate');
            });

        driver.constructSequence().
            mouseUp(checkitem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(checkitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(checkitem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        driver.constructSequence().
            click(checkitem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(checkitem, 'TP.sig.UIActivate');
                test.refute.didSignal(checkitem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(checkitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(checkitem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        driver.constructSequence().
            keyDown(checkitem, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(checkitem, 'pclass:active');

                test.refute.didSignal(checkitem, 'TP.sig.UIActivate');
                test.refute.didSignal(checkitem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(checkitem, 'Enter').
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(checkitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(checkitem, 'TP.sig.UIDidDeactivate');
            });
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.checkitem.Type.describe('TP.xctrls.checkitem: get/set value - no multiple',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_checkitem.xhtml');
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

    this.it('xctrls:checkitem - setting value to scalar values', function(test, options) {

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

    this.it('xctrls:checkitem - setting value to complex object values', function(test, options) {

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

    this.it('xctrls:checkitem - setting value to markup', function(test, options) {

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
});

//  ------------------------------------------------------------------------

TP.xctrls.checkitem.Type.describe('TP.xctrls.checkitem: get/set value - multiple',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_checkitem.xhtml');
            driver.setLocation(loadURI);
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

    this.after(
        function() {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:checkitem - setting value to scalar values', function(test, options) {

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

    this.it('xctrls:checkitem - setting value to complex object values', function(test, options) {

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
        tpElem.set('value',
            {
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

    this.it('xctrls:checkitem - setting value to markup', function(test, options) {

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
});

//  ------------------------------------------------------------------------

TP.xctrls.checkitem.Type.describe('TP.xctrls.checkitem: selection management - no multiple',
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

            TP.$$setupCommonObjectValues();

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_checkitem.xhtml');
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

    this.it('xctrls:checkitem - addSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        //  ---

        //  allowsMultiples

        //  radio elements do *not* allow multiples
        test.assert.isFalse(tpElem.allowsMultiples());

        //  ---

        //  (property defaults to 'value')
        tpElem.addSelection('baz');
        test.assert.isFalse(TP.byId('datacheckitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('datacheckitem2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('datacheckitem3', windowContext).isSelected());

        //  'value' property
        tpElem.addSelection('bar', 'value');
        test.assert.isFalse(TP.byId('datacheckitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('datacheckitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('datacheckitem3', windowContext).isSelected());
    });

    //  ---

    this.it('xctrls:datacheckitem - removeSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        tpElem.addSelection('bar');

        //  (property defaults to 'value')
        tpElem.removeSelection('baz');
        test.assert.isFalse(TP.byId('datacheckitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('datacheckitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('datacheckitem3', windowContext).isSelected());

        tpElem.removeSelection('baz');
        test.assert.isFalse(TP.byId('datacheckitem3', windowContext).isSelected());

        //  'value' property
        tpElem.removeSelection('bar', 'value');
        test.assert.isFalse(TP.byId('datacheckitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('datacheckitem2', windowContext).isSelected());

        //  NB: This is different from XHTML in that we can have a checkitem
        //  with 'no selection'
        test.assert.isFalse(TP.byId('datacheckitem3', windowContext).isSelected());

        tpElem.removeSelection('bar', 'value');
        test.assert.isFalse(TP.byId('datacheckitem2', windowContext).isSelected());
    });

    //  ---

    this.it('xctrls:datacheckitem - select', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        //  (property defaults to 'value')
        tpElem.select('bar');
        test.assert.isFalse(TP.byId('datacheckitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('datacheckitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('datacheckitem3', windowContext).isSelected());

        tpElem.select('baz');
        test.assert.isFalse(TP.byId('datacheckitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('datacheckitem2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('datacheckitem3', windowContext).isSelected());
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.checkitem.Type.describe('TP.xctrls.checkitem: selection management - multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        getSelectedIndices;

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function() {

        var groupElem,
            checkboxIndices;

        groupElem = TP.byId('testGroup2', windowContext);

        checkboxIndices = groupElem.get('xctrls|checkitem').collect(
                            function(valueTPElem, anIndex) {

                                if (valueTPElem.hasAttribute(
                                                    'pclass:checked')) {
                                    return anIndex;
                                }
                            });

        //  Removes nulls and undefineds
        return checkboxIndices.compact();
    };

    //  ---

    this.before(
        function() {

            TP.$$setupCommonObjectValues();

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_checkitem.xhtml');
            driver.setLocation(loadURI);
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

    this.after(
        function() {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:checkitem - addSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        //  ---

        //  allowsMultiples

        //  checkbox elements allow multiples
        test.assert.isTrue(tpElem.allowsMultiples());

        //  ---

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        //  'value' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'bar'), 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));
    });

    //  ---

    this.it('xctrls:checkitem - removeSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'bar'));
        tpElem.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        tpElem.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));

        //  'value' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'baz'));
        tpElem.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        tpElem.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(2));
    });

    //  ---

    this.it('xctrls:checkitem - selectAll', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.selectAll();
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1, 2));
    });

    //  ---

    this.it('xctrls:checkitem - select', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.deselectAll();
        tpElem.select('bar');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));
        tpElem.select('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        tpElem.deselectAll();
        tpElem.select(TP.ac('foo', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));
    });

    //  ---

    this.it('xctrls:checkitem - select with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.deselectAll();
        tpElem.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));
    });

    //  ---

    this.it('xctrls:checkitem - deselect', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.selectAll();
        tpElem.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));
        tpElem.deselect('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));

        tpElem.selectAll();
        tpElem.deselect(TP.ac('foo', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));
    });

    //  ---

    this.it('xctrls:checkitem - deselect with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.selectAll();
        tpElem.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.checkitem.Type.describe('TP.xctrls.checkitem: data binding - no multiple',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_checkitem.xhtml');
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

    this.it('xctrls:checkitem - initial setup', function(test, options) {

        var tpElem,

            modelObj;

        tpElem = TP.byId('testGroup3', windowContext);

        modelObj = TP.uc('urn:tibet:test_data').getResource().get('result');

        test.assert.isEqualTo(
            tpElem.get('value'),
            'bar');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'bar');
    });

    //  ---

    this.it('xctrls:checkitem - change value via user interaction', function(test, options) {

        var tpElem,

            modelObj,
            datacheckitem7;

        tpElem = TP.byId('testGroup3', windowContext);

        modelObj = TP.uc('urn:tibet:test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        datacheckitem7 = TP.byId('datacheckitem7', windowContext);

        test.getDriver().constructSequence().
            click(datacheckitem7).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tpElem.get('value'),
                    'foo');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_1')),
                    'foo');
            });
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.checkitem.Type.describe('TP.xctrls.checkitem: data binding - multiple',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_checkitem.xhtml');
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

    this.it('xctrls:checkitem - initial setup', function(test, options) {

        var tpElem,

            modelObj;

        tpElem = TP.byId('testGroup4', windowContext);

        modelObj = TP.uc('urn:tibet:test_data').getResource().get('result');

        test.assert.isEqualTo(
            tpElem.get('value'),
            TP.ac('foo', 'baz'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            TP.ac('foo', 'baz'));
    });

    //  ---

    this.it('xctrls:checkitem - change value via user interaction', function(test, options) {

        var tpElem,

            modelObj,
            datacheckitem11,
            datacheckitem12;

        tpElem = TP.byId('testGroup4', windowContext);

        modelObj = TP.uc('urn:tibet:test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        datacheckitem11 = TP.byId('datacheckitem11', windowContext);

        test.getDriver().constructSequence().
            click(datacheckitem11).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tpElem.get('value'),
                    TP.ac('foo', 'bar', 'baz'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_2')),
                    TP.ac('foo', 'bar', 'baz'));
            });

        datacheckitem12 = TP.byId('datacheckitem12', windowContext);

        test.getDriver().constructSequence().
            click(datacheckitem12).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tpElem.get('value'),
                    TP.ac('foo', 'bar'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_2')),
                    TP.ac('foo', 'bar'));
            });
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
