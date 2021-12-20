//  ========================================================================
//  xctrls:tabbar
//  ========================================================================

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: rendering',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            var loc;

            TP.$$setupCommonObjectValues();

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:tabbar - simple Array', async function(test, options) {

        var tabbar,
            items;

        tabbar = TP.byId('tabbar1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return tabbar.get('allItems').first();
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            tabbar.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            tabbar.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            tabbar.get('$dataKeys').getSize(),
            10);

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.first().getLabelText(),
            'Smith');
        test.assert.isEqualTo(
            items.at(4).getLabelText(),
            'Brown');
        test.assert.isEqualTo(
            items.last().getLabelText(),
            'Taylor');
    });

    //  ---

    this.it('xctrls:tabbar - Array of Pairs', async function(test, options) {

        var tabbar,
            items;

        tabbar = TP.byId('tabbar2', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return tabbar.get('allItems').first();
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            tabbar.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            tabbar.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            tabbar.get('$dataKeys').getSize(),
            10);

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.first().getLabelText(),
            'Smith');
        test.assert.isEqualTo(
            items.at(4).getLabelText(),
            'Brown');
        test.assert.isEqualTo(
            items.last().getLabelText(),
            'Taylor');
    });

    //  ---

    this.it('xctrls:tabbar - multi-item Array', async function(test, options) {

        var tabbar,
            items;

        tabbar = TP.byId('tabbar3', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return tabbar.get('allItems').first();
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            tabbar.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            tabbar.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            tabbar.get('$dataKeys').getSize(),
            10);

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.first().getLabelText(),
            'Smith');
        test.assert.isEqualTo(
            items.at(4).getLabelText(),
            'Brown');
        test.assert.isEqualTo(
            items.last().getLabelText(),
            'Taylor');
    });

    //  ---

    this.it('xctrls:tabbar - single-item Array with Hash', async function(test, options) {

        var tabbar,
            items;

        tabbar = TP.byId('tabbar4', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return tabbar.get('allItems').first();
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            tabbar.get('allItems').getSize(),
            1);
        test.assert.isEqualTo(
            tabbar.get('data').getSize(),
            1);
        test.assert.isEqualTo(
            tabbar.get('$dataKeys').getSize(),
            1);

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.first().getLabelText(),
            'Smith');
    });

    //  ---

    this.it('xctrls:tabbar - multi-item Array with Hashes', async function(test, options) {

        var tabbar,
            items;

        tabbar = TP.byId('tabbar5', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return tabbar.get('allItems').first();
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            tabbar.get('allItems').getSize(),
            2);
        test.assert.isEqualTo(
            tabbar.get('data').getSize(),
            2);
        test.assert.isEqualTo(
            tabbar.get('$dataKeys').getSize(),
            2);

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.first().getLabelText(),
            'Smith');
        test.assert.isEqualTo(
            items.last().getLabelText(),
            'Brown');
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: manipulation',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            var loc;

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.beforeEach(
        function(test, options) {
            var bodyElem;

            bodyElem = TP.documentGetBody(TP.sys.uidoc(true));
            TP.wrap(bodyElem).focus();

            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.afterEach(
        function(test, options) {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Focusing', async function(test, options) {

        var tabbar,
            firstTabbarItem;

        tabbar = TP.byId('tabbar1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstTabbarItem = tabbar.get('allItems').first();
                    return firstTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        //  Change the focus via 'direct' method

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), tabbar).
                        run();

        test.assert.hasAttribute(firstTabbarItem, 'pclass:focus');

        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIFocus');
        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidFocus');
    });

    //  ---

    this.it('Activation - mouse', async function(test, options) {

        var tabbar,
            firstTabbarItem;

        //  Change the content via 'user' interaction

        tabbar = TP.byId('tabbar1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstTabbarItem = tabbar.get('allItems').first();
                    return firstTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        //  Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(firstTabbarItem).
                        run();

        test.assert.hasAttribute(firstTabbarItem, 'pclass:active');

        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(firstTabbarItem).
                        run();

        test.refute.hasAttribute(firstTabbarItem, 'pclass:active');

        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  click

        await driver.constructSequence().
                        click(firstTabbarItem).
                        run();

        //  Don't test the attribute here - it will already have been
        //  removed.

        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Activation - keyboard', async function(test, options) {

        var tabbar,
            firstTabbarItem;

        //  Change the content via 'user' interaction

        tabbar = TP.byId('tabbar1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstTabbarItem = tabbar.get('allItems').first();
                    return firstTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        //  Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(firstTabbarItem, 'Enter').
                        run();

        test.assert.hasAttribute(firstTabbarItem, 'pclass:active');

        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(firstTabbarItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstTabbarItem, 'pclass:active');

        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Disabled behavior', async function(test, options) {

        var tabbar,
            firstTabbarItem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        tabbar = TP.byId('tabbar1', windowContext);
        tabbar.setAttrDisabled(true);

        await test.andIfNotValidWaitFor(
                function() {
                    firstTabbarItem = tabbar.get('allItems').first();
                    return firstTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        test.assert.isDisabled(firstTabbarItem);

        //  --- Focus

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), firstTabbarItem).
                        run();

        test.refute.hasAttribute(firstTabbarItem, 'pclass:focus');

        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        //  --- Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(firstTabbarItem).
                        run();

        test.refute.hasAttribute(firstTabbarItem, 'pclass:active');

        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

        await driver.constructSequence().
                        mouseUp(firstTabbarItem).
                        run();

        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- click

        await driver.constructSequence().
                        click(firstTabbarItem).
                        run();

        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(firstTabbarItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstTabbarItem, 'pclass:active');

        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(firstTabbarItem, 'Enter').
                        run();

        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstTabbarItem, 'TP.sig.UIDidDeactivate');
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: get/set value',
function() {

    var testData,

        unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            var loc;

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var tabbar;

            //  Make sure that each test starts with a freshly reset item
            tabbar = TP.byId('tabbar6', windowContext);
            tabbar.deselectAll();
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

    this.it('xctrls:tabbar - setting value to scalar values', function(test, options) {

        var tabbar,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tabbar = TP.byId('tabbar6', windowContext);

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

        tabbar = TP.byId('tabbar6', windowContext);

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

        tabbar = TP.byId('tabbar6', windowContext);

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

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function(aTPElem) {

        var itemIndices;

        itemIndices = aTPElem.get('allItems').collect(
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
        async function(suite, options) {

            var loc;

            TP.$$setupCommonObjectValues();

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var tabbar;

            //  Make sure that each test starts with a freshly reset item
            tabbar = TP.byId('tabbar6', windowContext);
            tabbar.deselectAll();
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

    this.it('xctrls:tabbar - addSelection', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar6', windowContext);

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

        tabbar = TP.byId('tabbar6', windowContext);

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

        tabbar = TP.byId('tabbar6', windowContext);

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

        tabbar = TP.byId('tabbar6', windowContext);

        tabbar.deselectAll();
        tabbar.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(1));
    });

    //  ---

    this.it('xctrls:tabbar - deselect', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar6', windowContext);

        tabbar.addSelection('foo');
        tabbar.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac(0));
        tabbar.deselect('foo');
        test.assert.isEqualTo(getSelectedIndices(tabbar), TP.ac());
    });

    //  ---

    this.it('xctrls:tabbar - deselect with RegExp', function(test, options) {

        var tabbar;

        tabbar = TP.byId('tabbar6', windowContext);

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

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            var loc;

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:tabbar - initial setup', function(test, options) {

        var tabbar,

            modelObj;

        tabbar = TP.byId('tabbar7', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tabbar.get('value'),
            'bar');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'bar');
    });

    //  ---

    this.it('xctrls:tabbar - change value via user interaction', async function(test, options) {

        var tabbar,

            modelObj,
            firstTabbarItem;

        tabbar = TP.byId('tabbar7', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firstTabbarItem = tabbar.get('allItems').first();
                    return firstTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(firstTabbarItem).
                        run();

        test.assert.isEqualTo(
            tabbar.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'foo');
    });

    this.it('xctrls:tabbar - change data and re-render', async function(test, options) {

        var tabbar,

            modelURI,
            firsttabbarItem,

            modelObj,

            items;

        tabbar = TP.byId('tabbar7', windowContext);

        modelURI = TP.uc('urn:tibet:selection_test_data');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firsttabbarItem = tabbar.get('allItems').first();
                    return firsttabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        modelURI.setResource(
            TP.hc(
                'data',
                TP.ac(
                    TP.ac('fido', 'Fido'),
                    TP.ac('lassie', 'Lassie'))));

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.getSize(),
            2);

        test.assert.isEqualTo(
            items.at(0).getLabelText(),
            'Fido');
        test.assert.isEqualTo(
            items.at(1).getLabelText(),
            'Lassie');

        modelObj = modelURI.getContent();

        modelObj.at('data').unshift(TP.ac('fluffy', 'Fluffy'));
        modelObj.at('data').push(TP.ac('tigger', 'Tigger'));

        modelURI.$changed();

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.getSize(),
            4);

        test.assert.isEqualTo(
            items.at(0).getLabelText(),
            'Fluffy');
        test.assert.isEqualTo(
            items.at(3).getLabelText(),
            'Tigger');
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: static content',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            var loc;

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:tabbar - initial setup', function(test, options) {

        var tabbar,

            modelObj;

        tabbar = TP.byId('tabbar8', windowContext);

        modelObj = TP.uc('urn:tibet:static_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tabbar.get('value'),
            'before');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'before');
    });

    //  ---

    this.it('xctrls:tabbar - test for static content', async function(test, options) {

        var tabbar,

            firstTabbarItem,
            lastTabbarItem;

        tabbar = TP.byId('tabbar8', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstTabbarItem = tabbar.get('allItems').first();
                    lastTabbarItem = tabbar.get('allItems').last();
                    return firstTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        //  The 2nd child element will be an 'xctrls:value'

        test.assert.isEqualTo(
            firstTabbarItem.getChildElements().at(1).getTextContent(),
            'before');

        test.assert.isEqualTo(
            lastTabbarItem.getChildElements().at(1).getTextContent(),
            'after');
    });

    //  ---

    this.it('xctrls:tabbar - change value via user interaction', async function(test, options) {

        var tabbar,

            modelObj,

            staticTabbarItem,

            localHandlerRan;

        tabbar = TP.byId('tabbar8', windowContext);

        modelObj = TP.uc('urn:tibet:static_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        staticTabbarItem = tabbar.get('allItems').last();

        await test.andIfNotValidWaitFor(
                function() {
                    staticTabbarItem = tabbar.get('allItems').last();
                    staticTabbarItem.defineHandler(
                        'TestClick',
                        function() {
                            localHandlerRan = true;
                        });
                    return staticTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(staticTabbarItem).
                        run();

        test.assert.isEqualTo(
            tabbar.get('value'),
            'after');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'after');

        test.assert.isTrue(localHandlerRan);
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Type.describe('TP.xctrls.tabbar: mixed content',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            var loc;

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_tabbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:tabbar - initial setup', function(test, options) {

        var tabbar,

            modelObj,

            items;

        tabbar = TP.byId('tabbar9', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tabbar.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            'foo');

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.getSize(),
            5);

        test.assert.isEqualTo(
            items.at(1).getLabelText(),
            'FOO');
        test.assert.isEqualTo(
            items.at(1).getAttribute('foo'),
            'Value was: FOO');
    });

    //  ---

    this.it('xctrls:tabbar - test for static content', async function(test, options) {

        var tabbar,

            firstTabbarItem,
            lastTabbarItem;

        tabbar = TP.byId('tabbar9', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstTabbarItem = tabbar.get('allItems').first();
                    lastTabbarItem = tabbar.get('allItems').last();
                    return firstTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        //  The 2nd child element will be an 'xctrls:value'

        test.assert.isEqualTo(
            firstTabbarItem.getChildElements().at(1).getTextContent(),
            'before');

        test.assert.isEqualTo(
            lastTabbarItem.getChildElements().at(1).getTextContent(),
            'after');
    });

    //  ---

    this.it('xctrls:tabbar - change value via user interaction', async function(test, options) {

        var tabbar,

            modelObj,

            staticTabbarItem,
            dynamicTabbarItem;

        tabbar = TP.byId('tabbar9', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        staticTabbarItem = tabbar.get('allItems').first();

        await test.andIfNotValidWaitFor(
                function() {
                    staticTabbarItem = tabbar.get('allItems').first();
                    dynamicTabbarItem = tabbar.get('allItems').at(1);

                    return staticTabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(staticTabbarItem).
                        run();

        test.assert.isEqualTo(
            tabbar.get('value'),
            'before');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            'before');

        await driver.constructSequence().
                        click(dynamicTabbarItem).
                        run();

        test.assert.isEqualTo(
            tabbar.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            'foo');
    });

    //  ---

    this.it('xctrls:tabbar - change data and re-render', async function(test, options) {

        var tabbar,

            modelURI,
            firsttabbarItem,

            modelObj,
            items;

        tabbar = TP.byId('tabbar9', windowContext);

        modelURI = TP.uc('urn:tibet:selection_test_data');

        await test.andIfNotValidWaitFor(
                function() {
                    firsttabbarItem = tabbar.get('allItems').first();
                    return firsttabbarItem;
                },
                TP.gid(tabbar),
                'TP.sig.DidRenderData');

        modelURI.setResource(
            TP.hc(
                'data',
                TP.ac(
                    TP.ac('fido', 'Fido'),
                    TP.ac('lassie', 'Lassie'))));

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.getSize(),
            4);

        test.assert.isEqualTo(
            items.at(1).getLabelText(),
            'FIDO');
        test.assert.isEqualTo(
            items.at(2).getLabelText(),
            'LASSIE');

        modelObj = modelURI.getContent();

        modelObj.at('data').unshift(TP.ac('fluffy', 'Fluffy'));
        modelObj.at('data').push(TP.ac('tigger', 'Tigger'));

        modelURI.$changed();

        items = tabbar.get('allItems');

        test.assert.isEqualTo(
            items.getSize(),
            6);

        test.assert.isEqualTo(
            items.at(1).getLabelText(),
            'FLUFFY');
        test.assert.isEqualTo(
            items.at(4).getLabelText(),
            'TIGGER');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
