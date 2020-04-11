//  ========================================================================
//  xctrls:tabbar
//  ========================================================================

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: manipulation',
function() {

    var unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            var loc,
                tabbarID;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);

            tabbarID = TP.computeOriginID(windowContext, loc, 'tabbar1');
            this.andWaitFor(tabbarID, 'TP.sig.DidRenderData');

            this.chain(
                function() {
                    this.startTrackingSignals();
                }.bind(this));
        });

    //  ---

    this.after(
        function() {

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.beforeEach(
        function() {
            var bodyElem;

            bodyElem = TP.documentGetBody(TP.sys.uidoc(true));
            TP.wrap(bodyElem).focus();

            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Focusing', function(test, options) {

        var tabbar,
            firstTabbarItem;

        tabbar = TP.byId('tabbar1', windowContext);

        firstTabbarItem = tabbar.get('allItemContent').first();

        //  Change the focus via 'direct' method

        test.getDriver().constructSequence().
            sendEvent(TP.hc('type', 'focus'), tabbar).
            run();

        test.chain(
            function() {

                test.assert.hasAttribute(firstTabbarItem, 'pclass:focus');

                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIFocus');
                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidFocus');
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var tabbar,
            firstTabbarItem;

        //  Change the content via 'user' interaction

        tabbar = TP.byId('tabbar1', windowContext);

        firstTabbarItem = tabbar.get('allItemContent').first();

        //  Individual mousedown/mouseup

        test.getDriver().constructSequence().
            mouseDown(firstTabbarItem).
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(firstTabbarItem, 'pclass:active');

                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.getDriver().constructSequence().
            mouseUp(firstTabbarItem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.hasAttribute(firstTabbarItem, 'pclass:active');

                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  click

        test.getDriver().constructSequence().
            click(firstTabbarItem).
            run();

        test.andWait(500);

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var tabbar,
            firstTabbarItem;

        //  Change the content via 'user' interaction

        tabbar = TP.byId('tabbar1', windowContext);

        firstTabbarItem = tabbar.get('allItemContent').first();

        //  Individual keydown/keyup

        test.getDriver().constructSequence().
            keyDown(firstTabbarItem, 'Enter').
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(firstTabbarItem, 'pclass:active');

                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.getDriver().constructSequence().
            keyUp(firstTabbarItem, 'Enter').
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.hasAttribute(firstTabbarItem, 'pclass:active');

                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var tabbar,
            firstTabbarItem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        tabbar = TP.byId('tabbar1', windowContext);
        tabbar.setAttrDisabled(true);

        firstTabbarItem = tabbar.get('allItemContent').first();

        test.assert.isDisabled(TP.unwrap(firstTabbarItem));

        //  --- Focus

        test.getDriver().constructSequence().
            sendEvent(TP.hc('type', 'focus'), firstTabbarItem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(firstTabbarItem, 'pclass:focus');

                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIFocus');
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        test.getDriver().constructSequence().
            mouseDown(firstTabbarItem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(firstTabbarItem, 'pclass:active');

                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');
            });

        test.getDriver().constructSequence().
            mouseUp(firstTabbarItem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        test.getDriver().constructSequence().
            click(firstTabbarItem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        test.getDriver().constructSequence().
            keyDown(firstTabbarItem, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(firstTabbarItem, 'pclass:active');

                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.getDriver().constructSequence().
            keyUp(firstTabbarItem, 'Enter').
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');
            });
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: get/set value',
function() {

    var testData,

        unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            var loc;

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function() {

            var tabbar;

            //  Make sure that each test starts with a freshly reset item
            tabbar = TP.byId('tabbar4', windowContext);
            tabbar.deselectAll();
        });

    //  ---

    this.after(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:tabbar - setting value to scalar values', function(test, options) {

        var tabbar,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tabbar = TP.byId('tabbar4', windowContext);

        //  undefined
        tabbar.set('value', testData.at(TP.UNDEF));
        value = tabbar.get('value');
        test.assert.isNull(value);

        //  null
        tabbar.set('value', testData.at(TP.NULL));
        value = tabbar.get('value');
        test.assert.isNull(value);

        //  String
        tabbar.set('value', testData.at('String'));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        tabbar.set('value', testData.at('Number'));
        value = tabbar.get('value');
        test.assert.isNull(value);

        //  Boolean
        tabbar.set('value', testData.at('Boolean'));
        value = tabbar.get('value');
        test.assert.isNull(value);
    });

    //  ---

    this.it('xctrls:tabbar - setting value to complex object values', function(test, options) {

        var tabbar,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tabbar = TP.byId('tabbar4', windowContext);

        //  RegExp
        tabbar.set('value', testData.at('RegExp'));
        value = tabbar.get('value');
        test.assert.isNull(value);

        //  Date
        tabbar.set('value', testData.at('Date'));
        value = tabbar.get('value');
        test.assert.isNull(value);

        //  Array
        tabbar.set('value', TP.ac('foo', 'bar', 'baz'));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  Object
        tabbar.set('value',
            {
                foo: 'baz'
            });
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        tabbar.set('value', TP.hc('foo', 'bar'));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('xctrls:tabbar - setting value to markup', function(test, options) {

        var tabbar,
            value;

        tabbar = TP.byId('tabbar4', windowContext);

        //  XMLDocument
        tabbar.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tabbar.get('value');
        test.assert.isNull(value);

        //  XMLElement
        tabbar.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        tabbar.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        tabbar.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        tabbar.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        tabbar.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        tabbar.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        tabbar.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tabbar.get('value');
        test.assert.isNull(value);

        //  NodeList
        tabbar.set('value', testData.at('NodeList'));
        value = tabbar.get('value');
        test.assert.isNull(value);

        //  NamedNodeMap
        tabbar.set('value', testData.at('NamedNodeMap'));
        value = tabbar.get('value');
        test.assert.isEqualTo(value, 'baz');
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: selection management',
function() {

    var getSelectedIndices,

        unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function(aTPElem) {

        var itemIndices;

        itemIndices = aTPElem.get('allItemContent').collect(
                            function(valueTPElem, anIndex) {

                                if (valueTPElem.hasAttribute(
                                                    'pclass:selected')) {
                                    return anIndex;
                                }
                            });

        //  Removes nulls and undefineds
        return itemIndices.compact();
    };

    //  ---

    this.before(
        function() {

            var loc;

            TP.$$setupCommonObjectValues();

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function() {

            var tabbar;

            //  Make sure that each test starts with a freshly reset item
            tabbar = TP.byId('tabbar4', windowContext);
            tabbar.deselectAll();
        });

    //  ---

    this.after(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:tabbar - addSelection', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar4', windowContext);

        //  ---

        //  allowsMultiples

        //  tabbar never allows multiples
        test.assert.isFalse(tabbar.allowsMultiples());

        //  ---

        //  (property defaults to 'value')
        tabbar.deselectAll();
        tabbar.addSelection('bar');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(1));

        //  'value' property
        tabbar.deselectAll();
        tabbar.addSelection('foo', 'value');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(0));
    });

    //  ---

    this.it('xctrls:tabbar - removeSelection', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar4', windowContext);

        //  (property defaults to 'value')
        tabbar.deselectAll();
        tabbar.addSelection('foo');
        tabbar.removeSelection('foo');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac());

        tabbar.deselectAll();
        tabbar.addSelection('bar');
        tabbar.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(1));

        //  'value' property
        tabbar.deselectAll();
        tabbar.addSelection('foo');
        tabbar.removeSelection('foo', 'value');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac());

        tabbar.deselectAll();
        tabbar.addSelection('baz');
        tabbar.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(2));
    });

    //  ---

    this.it('xctrls:tabbar - select', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar4', windowContext);

        tabbar.deselectAll();
        tabbar.select('bar');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(1));
        tabbar.select('baz');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(2));

        tabbar.deselectAll();
        tabbar.select('baz');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(2));
    });

    //  ---

    this.it('xctrls:tabbar - select with RegExp', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar4', windowContext);

        tabbar.deselectAll();
        tabbar.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(1));
    });

    //  ---

    this.it('xctrls:tabbar - deselect', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar4', windowContext);

        tabbar.addSelection('foo');
        tabbar.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(0));
        tabbar.deselect('foo');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac());
    });

    //  ---

    this.it('xctrls:tabbar - deselect with RegExp', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar4', windowContext);

        tabbar.addSelection('foo');
        tabbar.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(0));
        tabbar.deselect(/fo/);
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac());
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: data binding',
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

            var loc;

            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:tabbar - initial setup', function(test, options) {

        var tabbar,

            modelObj;

        tabbar = TP.byId('tabbar5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tabbar.get('value'),
            'bar');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'bar');
    });

    //  ---

    this.it('xctrls:tabbar - change value via user interaction', function(test, options) {

        var tabbar,

            modelObj,
            firstTabbarItem;

        tabbar = TP.byId('tabbar5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        firstTabbarItem = tabbar.get('allItemContent').first();

        test.getDriver().constructSequence().
            click(firstTabbarItem).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tabbar.get('value'),
                    'foo');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_1')),
                    'foo');
            });
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: mixed content',
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

            var loc;

            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:tabbar - initial setup', function(test, options) {

        var tabbar,

            modelObj;

        tabbar = TP.byId('tabbar6', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tabbar.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            'foo');
    });

    //  ---

    this.it('xctrls:tabbar - test for static content', function(test, options) {

        var tabbar,

            firstTabbarItem,
            lastTabbarItem;

        tabbar = TP.byId('tabbar6', windowContext);

        firstTabbarItem = tabbar.get('allItemContent').first();
        lastTabbarItem = tabbar.get('allItemContent').last();

        //  The 2nd child element will be an 'xctrls:value'

        test.assert.isEqualTo(
            firstTabbarItem.getChildElements().at(1).getTextContent(),
            'before');

        test.assert.isEqualTo(
            lastTabbarItem.getChildElements().at(1).getTextContent(),
            'after');
    });

    //  ---

    this.it('xctrls:tabbar - change value via user interaction', function(test, options) {

        var tabbar,

            modelObj,

            staticTabbarItem,
            dynamicTabbarItem;

        tabbar = TP.byId('tabbar6', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        staticTabbarItem = tabbar.get('allItemContent').first();

        test.getDriver().constructSequence().
            click(staticTabbarItem).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tabbar.get('value'),
                    'before');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_2')),
                    'before');
            });

        dynamicTabbarItem = tabbar.get('allItemContent').at(1);

        test.getDriver().constructSequence().
            click(dynamicTabbarItem).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tabbar.get('value'),
                    'foo');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_2')),
                    'foo');
            });
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
