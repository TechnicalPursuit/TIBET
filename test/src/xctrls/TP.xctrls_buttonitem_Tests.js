//  ========================================================================
//  xctrls:buttonitem
//  ========================================================================

TP.xctrls.buttonitem.Type.describe('TP.xctrls.buttonitem: manipulation',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_buttonitem.xhtml');
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

        var buttonitem,
            focusedElem;

        buttonitem = TP.byId('buttonitem1', windowContext);

        //  Change the focus via 'direct' method

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), buttonitem).
                        run();

        test.assert.hasAttribute(buttonitem, 'pclass:focus');

        test.assert.didSignal(buttonitem, 'TP.sig.UIFocus');
        test.assert.didSignal(buttonitem, 'TP.sig.UIDidFocus');

        focusedElem = driver.getFocusedElement();
        test.assert.isIdenticalTo(focusedElem, buttonitem);
    });

    //  ---

    this.it('Activation - mouse', async function(test, options) {

        var buttonitem;

        //  Change the content via 'user' interaction

        buttonitem = TP.byId('buttonitem1', windowContext);

        //  Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(buttonitem).
                        run();

        test.assert.hasAttribute(buttonitem, 'pclass:active');

        test.assert.didSignal(buttonitem, 'TP.sig.UIActivate');
        test.assert.didSignal(buttonitem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(buttonitem).
                        run();

        test.refute.hasAttribute(buttonitem, 'pclass:active');

        test.assert.didSignal(buttonitem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(buttonitem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  click

        await driver.constructSequence().
                        click(buttonitem).
                        run();

        //  Don't test the attribute here - it will already have been
        //  removed.

        test.assert.didSignal(buttonitem, 'TP.sig.UIActivate');
        test.assert.didSignal(buttonitem, 'TP.sig.UIDidActivate');

        test.assert.didSignal(buttonitem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(buttonitem, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Activation - keyboard', async function(test, options) {

        var buttonitem;

        //  Change the content via 'user' interaction

        buttonitem = TP.byId('buttonitem1', windowContext);

        //  Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(buttonitem, 'Enter').
                        run();

        test.assert.hasAttribute(buttonitem, 'pclass:active');

        test.assert.didSignal(buttonitem, 'TP.sig.UIActivate');
        test.assert.didSignal(buttonitem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(buttonitem, 'Enter').
                        run();

        test.refute.hasAttribute(buttonitem, 'pclass:active');

        test.assert.didSignal(buttonitem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(buttonitem, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Disabled behavior', async function(test, options) {

        var buttonitem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        buttonitem = TP.byId('buttonitem1', windowContext);
        buttonitem.setAttrDisabled(true);

        //  --- Focus

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), buttonitem).
                        run();

        test.refute.hasAttribute(buttonitem, 'pclass:focus');

        test.refute.didSignal(buttonitem, 'TP.sig.UIFocus');
        test.refute.didSignal(buttonitem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        //  --- Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(buttonitem).
                        run();

        test.refute.hasAttribute(buttonitem, 'pclass:active');

        test.refute.didSignal(buttonitem, 'TP.sig.UIActivate');
        test.refute.didSignal(buttonitem, 'TP.sig.UIDidActivate');

        await driver.constructSequence().
                        mouseUp(buttonitem).
                        run();

        test.refute.didSignal(buttonitem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(buttonitem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- click

        await driver.constructSequence().
                        click(buttonitem).
                        run();

        test.refute.didSignal(buttonitem, 'TP.sig.UIActivate');
        test.refute.didSignal(buttonitem, 'TP.sig.UIDidActivate');

        test.refute.didSignal(buttonitem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(buttonitem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(buttonitem, 'Enter').
                        run();

        test.refute.hasAttribute(buttonitem, 'pclass:active');

        test.refute.didSignal(buttonitem, 'TP.sig.UIActivate');
        test.refute.didSignal(buttonitem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(buttonitem, 'Enter').
                        run();

        test.refute.didSignal(buttonitem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(buttonitem, 'TP.sig.UIDidDeactivate');
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.buttonitem.Type.describe('TP.xctrls.buttonitem: get/set value - no multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        testData;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_buttonitem.xhtml');
            await driver.setLocation(loadURI);
        });

    //  ---

    this.after(
        async function(suite, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:buttonitem - setting value to scalar values', function(test, options) {

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

    this.it('xctrls:buttonitem - setting value to complex object values', function(test, options) {

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

    this.it('xctrls:buttonitem - setting value to markup', function(test, options) {

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

TP.xctrls.buttonitem.Type.describe('TP.xctrls.buttonitem: get/set value - multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        testData;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_buttonitem.xhtml');
            await driver.setLocation(loadURI);
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
        async function(suite, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:buttonitem - setting value to scalar values', function(test, options) {

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

    this.it('xctrls:buttonitem - setting value to complex object values', function(test, options) {

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

    this.it('xctrls:buttonitem - setting value to markup', function(test, options) {

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

TP.xctrls.buttonitem.Type.describe('TP.xctrls.buttonitem: selection management - no multiple',
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

            TP.$$setupCommonObjectValues();

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_buttonitem.xhtml');
            await driver.setLocation(loadURI);
        });

    //  ---

    this.after(
        async function(suite, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:buttonitem - addSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        //  ---

        //  allowsMultiples

        //  radio elements do *not* allow multiples
        test.assert.isFalse(tpElem.allowsMultiples());

        //  ---

        //  (property defaults to 'value')
        tpElem.addSelection('baz');
        test.assert.isFalse(TP.byId('databuttonitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('databuttonitem2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('databuttonitem3', windowContext).isSelected());

        //  'value' property
        tpElem.addSelection('bar', 'value');
        test.assert.isFalse(TP.byId('databuttonitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('databuttonitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('databuttonitem3', windowContext).isSelected());
    });

    //  ---

    this.it('xctrls:databuttonitem - removeSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        tpElem.addSelection('bar');

        //  (property defaults to 'value')
        tpElem.removeSelection('baz');
        test.assert.isFalse(TP.byId('databuttonitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('databuttonitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('databuttonitem3', windowContext).isSelected());

        tpElem.removeSelection('baz');
        test.assert.isFalse(TP.byId('databuttonitem3', windowContext).isSelected());

        //  'value' property
        tpElem.removeSelection('bar', 'value');
        test.assert.isFalse(TP.byId('databuttonitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('databuttonitem2', windowContext).isSelected());

        //  NB: This is different from XHTML in that we can have a buttonitem
        //  with 'no selection'
        test.assert.isFalse(TP.byId('databuttonitem3', windowContext).isSelected());

        tpElem.removeSelection('bar', 'value');
        test.assert.isFalse(TP.byId('databuttonitem2', windowContext).isSelected());
    });

    //  ---

    this.it('xctrls:databuttonitem - select', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup1', windowContext);

        //  (property defaults to 'value')
        tpElem.select('bar');
        test.assert.isFalse(TP.byId('databuttonitem1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('databuttonitem2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('databuttonitem3', windowContext).isSelected());

        tpElem.select('baz');
        test.assert.isFalse(TP.byId('databuttonitem1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('databuttonitem2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('databuttonitem3', windowContext).isSelected());
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.buttonitem.Type.describe('TP.xctrls.buttonitem: selection management - multiple',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI,

        getSelectedIndices;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function() {

        var groupElem,
            buttonitemIndices;

        groupElem = TP.byId('testGroup2', windowContext);

        buttonitemIndices = groupElem.get('xctrls|buttonitem').collect(
                            function(valueTPElem, anIndex) {

                                if (valueTPElem.hasAttribute(
                                                    'pclass:selected')) {
                                    return anIndex;
                                }
                            });

        //  Removes nulls and undefineds
        return buttonitemIndices.compact();
    };

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            TP.$$setupCommonObjectValues();

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_buttonitem.xhtml');
            await driver.setLocation(loadURI);
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
        async function(suite, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:buttonitem - addSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        //  ---

        //  allowsMultiples

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

    this.it('xctrls:buttonitem - removeSelection', function(test, options) {

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

    this.it('xctrls:buttonitem - selectAll', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.selectAll();
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1, 2));
    });

    //  ---

    this.it('xctrls:buttonitem - select', function(test, options) {

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

    this.it('xctrls:buttonitem - select with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.deselectAll();
        tpElem.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));
    });

    //  ---

    this.it('xctrls:buttonitem - deselect', function(test, options) {

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

    this.it('xctrls:buttonitem - deselect with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('testGroup2', windowContext);

        tpElem.selectAll();
        tpElem.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.buttonitem.Type.describe('TP.xctrls.buttonitem: data binding - no multiple',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_buttonitem.xhtml');
            await driver.setLocation(loadURI);
        });

    //  ---

    this.after(
        async function(suite, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:buttonitem - initial setup', function(test, options) {

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

    this.it('xctrls:buttonitem - change value via user interaction', async function(test, options) {

        var tpElem,

            modelObj,
            databuttonitem7;

        tpElem = TP.byId('testGroup3', windowContext);

        modelObj = TP.uc('urn:tibet:test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        databuttonitem7 = TP.byId('databuttonitem7', windowContext);

        await driver.constructSequence().
                        click(databuttonitem7).
                        run();

        test.assert.isEqualTo(
            tpElem.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'foo');
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.buttonitem.Type.describe('TP.xctrls.buttonitem: data binding - multiple',
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

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_buttonitem.xhtml');
            await driver.setLocation(loadURI);
        });

    //  ---

    this.after(
        async function(suite, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:buttonitem - initial setup', function(test, options) {

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

    this.it('xctrls:buttonitem - change value via user interaction', async function(test, options) {

        var tpElem,

            modelObj,
            databuttonitem11,
            databuttonitem12;

        tpElem = TP.byId('testGroup4', windowContext);

        modelObj = TP.uc('urn:tibet:test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        databuttonitem11 = TP.byId('databuttonitem11', windowContext);

        await driver.constructSequence().
                        click(databuttonitem11).
                        run();

        test.assert.isEqualTo(
            tpElem.get('value'),
            TP.ac('foo', 'bar', 'baz'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            TP.ac('foo', 'bar', 'baz'));

        databuttonitem12 = TP.byId('databuttonitem12', windowContext);

        await driver.constructSequence().
                        click(databuttonitem12).
                        run();

        test.assert.isEqualTo(
            tpElem.get('value'),
            TP.ac('foo', 'bar'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            TP.ac('foo', 'bar'));
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
