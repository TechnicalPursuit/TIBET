//  ========================================================================
//  xctrls:imageitem
//  ========================================================================

TP.xctrls.imageitem.Type.describe('TP.xctrls.imageitem: manipulation',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            driver = this.getDriver();

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_imageitem.xhtml');
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

        var imageitem;

        imageitem = TP.byId('imageitem1', windowContext);

        //  Change the focus via 'direct' method

        driver.constructSequence().
            sendEvent(TP.hc('type', 'focus'), imageitem).
            run();

        test.chain(
            function() {

                var focusedElem;

                test.assert.hasAttribute(imageitem, 'pclass:focus');

                test.assert.didSignal(imageitem, 'TP.sig.UIFocus');
                test.assert.didSignal(imageitem, 'TP.sig.UIDidFocus');

                focusedElem = driver.getFocusedElement();
                test.assert.isIdenticalTo(focusedElem, imageitem);
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var imageitem;

        //  Change the content via 'user' interaction

        imageitem = TP.byId('imageitem1', windowContext);

        //  Individual mousedown/mouseup

        driver.constructSequence().
            mouseDown(imageitem).
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(imageitem, 'pclass:active');

                test.assert.didSignal(imageitem, 'TP.sig.UIActivate');
                test.assert.didSignal(imageitem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            mouseUp(imageitem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(imageitem, 'pclass:active');

                test.assert.didSignal(imageitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(imageitem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  click

        driver.constructSequence().
            click(imageitem).
            run();

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(imageitem, 'TP.sig.UIActivate');
                test.assert.didSignal(imageitem, 'TP.sig.UIDidActivate');

                test.assert.didSignal(imageitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(imageitem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var imageitem;

        //  Change the content via 'user' interaction

        imageitem = TP.byId('imageitem1', windowContext);

        //  Individual keydown/keyup

        driver.constructSequence().
            keyDown(imageitem, 'Enter').
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(imageitem, 'pclass:active');

                test.assert.didSignal(imageitem, 'TP.sig.UIActivate');
                test.assert.didSignal(imageitem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(imageitem, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(imageitem, 'pclass:active');

                test.assert.didSignal(imageitem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(imageitem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var imageitem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        imageitem = TP.byId('imageitem1', windowContext);
        imageitem.setAttrDisabled(true);

        //  --- Focus

        driver.constructSequence().
            sendEvent(TP.hc('type', 'focus'), imageitem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(imageitem, 'pclass:focus');

                test.refute.didSignal(imageitem, 'TP.sig.UIFocus');
                test.refute.didSignal(imageitem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        driver.constructSequence().
            mouseDown(imageitem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(imageitem, 'pclass:active');

                test.refute.didSignal(imageitem, 'TP.sig.UIActivate');
                test.refute.didSignal(imageitem, 'TP.sig.UIDidActivate');
            });

        driver.constructSequence().
            mouseUp(imageitem).
            run();

        test.chain(
            function() {
                test.refute.didSignal(imageitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(imageitem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        driver.constructSequence().
            click(imageitem).
            run();

        test.chain(
            function() {
                test.refute.didSignal(imageitem, 'TP.sig.UIActivate');
                test.refute.didSignal(imageitem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(imageitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(imageitem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        driver.constructSequence().
            keyDown(imageitem, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(imageitem, 'pclass:active');

                test.refute.didSignal(imageitem, 'TP.sig.UIActivate');
                test.refute.didSignal(imageitem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        driver.constructSequence().
            keyUp(imageitem, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.didSignal(imageitem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(imageitem, 'TP.sig.UIDidDeactivate');
            });
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.imageitem.Type.describe('TP.xctrls.imageitem: get/set value - no multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        testData;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            driver = this.getDriver();

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_imageitem.xhtml');
            driver.setLocation(loadURI);
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:imageitem - setting value to scalar values', function(test, options) {

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

    this.it('xctrls:imageitem - setting value to complex object values', function(test, options) {

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

    this.it('xctrls:imageitem - setting value to markup', function(test, options) {

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
        test.assert.isEqualTo(value, 'foo');

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

TP.xctrls.imageitem.Type.describe('TP.xctrls.imageitem: get/set value - multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        testData;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            driver = this.getDriver();

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_imageitem.xhtml');
            driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('testGroup2', windowContext);
            tpElem.deselectAll();
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:imageitem - setting value to scalar values', function(test, options) {

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

    this.it('xctrls:imageitem - setting value to complex object values', function(test, options) {

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

    this.it('xctrls:imageitem - setting value to markup', function(test, options) {

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
        test.assert.isEqualTo(value, TP.ac('foo', 'bar'));

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

TP.xctrls.imageitem.Type.describe('TP.xctrls.imageitem: selection management - no multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            driver = this.getDriver();

            TP.$$setupCommonObjectValues();

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_imageitem.xhtml');
            driver.setLocation(loadURI);

            windowContext = driver.get('windowContext');
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:imageitem - addSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        //  ---

        //  allowsMultiples

        //  radio elements do *not* allow multiples
        test.assert.isFalse(tpElem.allowsMultiples());

        //  ---

        //  (property defaults to 'value')
        tpElem.addSelection('baz');
        test.assert.isFalse(TP.byId('dataimageitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('dataimageitem2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('dataimageitem3', windowContext).isSelected());

        //  'value' property
        tpElem.addSelection('bar', 'value');
        test.assert.isFalse(TP.byId('dataimageitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('dataimageitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('dataimageitem3', windowContext).isSelected());
    });

    //  ---

    this.it('xctrls:dataimageitem - removeSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        tpElem.addSelection('bar');

        //  (property defaults to 'value')
        tpElem.removeSelection('baz');
        test.assert.isFalse(TP.byId('dataimageitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('dataimageitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('dataimageitem3', windowContext).isSelected());

        tpElem.removeSelection('baz');
        test.assert.isFalse(TP.byId('dataimageitem3', windowContext).isSelected());

        //  'value' property
        tpElem.removeSelection('bar', 'value');
        test.assert.isFalse(TP.byId('dataimageitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('dataimageitem2', windowContext).isSelected());

        //  NB: This is different from XHTML in that we can have a imageitem
        //  with 'no selection'
        test.assert.isFalse(TP.byId('dataimageitem3', windowContext).isSelected());

        tpElem.removeSelection('bar', 'value');
        test.assert.isFalse(TP.byId('dataimageitem2', windowContext).isSelected());
    });

    //  ---

    this.it('xctrls:dataimageitem - select', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        //  (property defaults to 'value')
        tpElem.select('bar');
        test.assert.isFalse(TP.byId('dataimageitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('dataimageitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('dataimageitem3', windowContext).isSelected());

        tpElem.select('baz');
        test.assert.isFalse(TP.byId('dataimageitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('dataimageitem2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('dataimageitem3', windowContext).isSelected());
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.imageitem.Type.describe('TP.xctrls.imageitem: selection management - multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        getSelectedIndices;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function() {

        var groupElem,
            checkboxIndices;

        groupElem = TP.byId('testGroup2', windowContext);

        checkboxIndices = groupElem.get('xctrls|imageitem').collect(
                            function(valueTPElem, anIndex) {

                                if (valueTPElem.hasAttribute(
                                                    'pclass:selected')) {
                                    return anIndex;
                                }
                            });

        //  Removes nulls and undefineds
        return checkboxIndices.compact();
    };

    //  ---

    this.before(
        function(suite, options) {

            driver = this.getDriver();

            TP.$$setupCommonObjectValues();

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_imageitem.xhtml');
            driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('testGroup2', windowContext);
            tpElem.deselectAll();
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:imageitem - addSelection', function(test, options) {

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

    this.it('xctrls:imageitem - removeSelection', function(test, options) {

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

    this.it('xctrls:imageitem - selectAll', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.selectAll();
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1, 2));
    });

    //  ---

    this.it('xctrls:imageitem - select', function(test, options) {

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

    this.it('xctrls:imageitem - select with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.deselectAll();
        tpElem.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));
    });

    //  ---

    this.it('xctrls:imageitem - deselect', function(test, options) {

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

    this.it('xctrls:imageitem - deselect with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.selectAll();
        tpElem.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.imageitem.Type.describe('TP.xctrls.imageitem: data binding - no multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            driver = this.getDriver();

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_imageitem.xhtml');
            driver.setLocation(loadURI);
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:imageitem - initial setup', function(test, options) {

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

    this.it('xctrls:imageitem - change value via user interaction', function(test, options) {

        var tpElem,

            modelObj,
            dataimageitem7;

        tpElem = TP.byId('testGroup3', windowContext);

        modelObj = TP.uc('urn:tibet:test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        dataimageitem7 = TP.byId('dataimageitem7', windowContext);

        test.getDriver().constructSequence().
            click(dataimageitem7).
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

TP.xctrls.imageitem.Type.describe('TP.xctrls.imageitem: data binding - multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            driver = this.getDriver();

            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_imageitem.xhtml');
            driver.setLocation(loadURI);
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:imageitem - initial setup', function(test, options) {

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

    this.it('xctrls:imageitem - change value via user interaction', function(test, options) {

        var tpElem,

            modelObj,
            dataimageitem11,
            dataimageitem12;

        tpElem = TP.byId('testGroup4', windowContext);

        modelObj = TP.uc('urn:tibet:test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        dataimageitem11 = TP.byId('dataimageitem11', windowContext);

        test.getDriver().constructSequence().
            click(dataimageitem11).
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

        dataimageitem12 = TP.byId('dataimageitem12', windowContext);

        test.getDriver().constructSequence().
            click(dataimageitem12).
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
