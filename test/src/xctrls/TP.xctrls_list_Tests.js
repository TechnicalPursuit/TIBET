//  ========================================================================
//  xctrls:list
//  ========================================================================

TP.xctrls.list.Type.describe('TP.xctrls.list: rendering',
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

            loc = '~lib_test/src/xctrls/xctrls_list.xhtml';
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

    this.it('xctrls:list - simple Array', async function(test, options) {

        var list,
            items;

        list = TP.byId('list1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return list.get('allItems').first();
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            list.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            list.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            list.get('$dataKeys').getSize(),
            10);

        items = list.get('allItems');

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

    this.it('xctrls:list - Array of Pairs', async function(test, options) {

        var list,
            items;

        list = TP.byId('list2', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return list.get('allItems').first();
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            list.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            list.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            list.get('$dataKeys').getSize(),
            10);

        items = list.get('allItems');

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

    this.it('xctrls:list - multi-item Array', async function(test, options) {

        var list,
            items;

        list = TP.byId('list3', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return list.get('allItems').first();
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            list.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            list.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            list.get('$dataKeys').getSize(),
            10);

        items = list.get('allItems');

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

    this.it('xctrls:list - single-item Array with Hash', async function(test, options) {

        var list,
            items;

        list = TP.byId('list4', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return list.get('allItems').first();
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            list.get('allItems').getSize(),
            3);
        test.assert.isEqualTo(
            list.get('data').getSize(),
            3);
        test.assert.isEqualTo(
            list.get('$dataKeys').getSize(),
            3);

        items = list.get('allItems');

        test.assert.isEqualTo(
            items.first().getLabelText(),
            'Smith');
    });

    //  ---

    this.it('xctrls:list - multi-item Array with Hashes', async function(test, options) {

        var list,
            items;

        list = TP.byId('list5', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return list.get('allItems').first();
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            list.get('allItems').getSize(),
            3);
        test.assert.isEqualTo(
            list.get('data').getSize(),
            3);
        test.assert.isEqualTo(
            list.get('$dataKeys').getSize(),
            3);

        items = list.get('allItems');

        test.assert.isEqualTo(
            items.at(0).getLabelText(),
            'Smith');
        test.assert.isEqualTo(
            items.at(1).getLabelText(),
            'Brown');
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.list.Type.describe('TP.xctrls.list: manipulation',
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

            loc = '~lib_test/src/xctrls/xctrls_list.xhtml';
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
        function(test, suite) {
            var bodyElem;

            bodyElem = TP.documentGetBody(TP.sys.uidoc(true));
            TP.wrap(bodyElem).focus();

            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.afterEach(
        function(test, suite) {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Focusing', async function(test, options) {

        var list,
            firstListItem;

        list = TP.byId('list1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstListItem = list.get('allItems').first();
                    return firstListItem;
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        //  Change the focus via 'direct' method

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), list).
                        run();

        test.assert.hasAttribute(firstListItem, 'pclass:focus');

        test.assert.didSignal(firstListItem, 'TP.sig.UIFocus');
        test.assert.didSignal(firstListItem, 'TP.sig.UIDidFocus');
    });

    //  ---

    this.it('Activation - mouse', async function(test, options) {

        var list,
            firstListItem;

        //  Change the content via 'user' interaction

        list = TP.byId('list1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstListItem = list.get('allItems').first();
                    return firstListItem;
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        //  Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(firstListItem).
                        run();

        test.assert.hasAttribute(firstListItem, 'pclass:active');

        test.assert.didSignal(firstListItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstListItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(firstListItem).
                        run();

        test.refute.hasAttribute(firstListItem, 'pclass:active');

        test.assert.didSignal(firstListItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstListItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  click

        await driver.constructSequence().
                        click(firstListItem).
                        run();

        //  Don't test the attribute here - it will already have been
        //  removed.

        test.assert.didSignal(firstListItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstListItem, 'TP.sig.UIDidActivate');

        test.assert.didSignal(firstListItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstListItem, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Activation - keyboard', async function(test, options) {

        var list,
            firstListItem;

        //  Change the content via 'user' interaction

        list = TP.byId('list1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstListItem = list.get('allItems').first();
                    return firstListItem;
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        //  Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(firstListItem, 'Enter').
                        run();

        test.assert.hasAttribute(firstListItem, 'pclass:active');

        test.assert.didSignal(firstListItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstListItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                    keyUp(firstListItem, 'Enter').
                    run();

        test.refute.hasAttribute(firstListItem, 'pclass:active');

        test.assert.didSignal(firstListItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstListItem, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Disabled behavior', async function(test, options) {

        var list,
            firstListItem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        list = TP.byId('list1', windowContext);
        list.setAttrDisabled(true);

        await test.andIfNotValidWaitFor(
                function() {
                    firstListItem = list.get('allItems').first();
                    return firstListItem;
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        test.assert.isDisabled(firstListItem);

        //  --- Focus

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), firstListItem).
                        run();

        test.refute.hasAttribute(firstListItem, 'pclass:focus');

        test.refute.didSignal(firstListItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstListItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        //  --- Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(firstListItem).
                        run();

        test.refute.hasAttribute(firstListItem, 'pclass:active');

        test.refute.didSignal(firstListItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstListItem, 'TP.sig.UIDidActivate');

        await driver.constructSequence().
                        mouseUp(firstListItem).
                        run();

        test.refute.didSignal(firstListItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstListItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- click

        await driver.constructSequence().
                        click(firstListItem).
                        run();

        test.refute.didSignal(firstListItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstListItem, 'TP.sig.UIDidActivate');

        test.refute.didSignal(firstListItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstListItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(firstListItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstListItem, 'pclass:active');

        test.refute.didSignal(firstListItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstListItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(firstListItem, 'Enter').
                        run();

        test.refute.didSignal(firstListItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstListItem, 'TP.sig.UIDidDeactivate');
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Type.describe('TP.xctrls.list: get/set value',
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

            loc = '~lib_test/src/xctrls/xctrls_list.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, suite) {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('list6', windowContext);
            tpElem.deselectAll();

            tpElem = TP.byId('list7', windowContext);
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

    this.it('xctrls:list - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('list6', windowContext);

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

    this.it('xctrls:list - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('list6', windowContext);

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

    this.it('xctrls:list - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('list6', windowContext);

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

    //  ---

    this.it('xctrls:list (multiple) - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('list7', windowContext);

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

    this.it('xctrls:list (multiple) - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('list7', windowContext);

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

    this.it('xctrls:list (multiple) - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('list7', windowContext);

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

TP.xctrls.list.Type.describe('TP.xctrls.list: selection management',
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

            var loc,
                listID;

            TP.$$setupCommonObjectValues();

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_list.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);

            listID = TP.computeOriginID(windowContext, loc, 'list7');
            this.andWaitFor(listID, 'TP.sig.DidRender');
        });

    //  ---

    this.beforeEach(
        function(test, suite) {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('list7', windowContext);
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

    this.it('xctrls:list - addSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('list7', windowContext);

        //  ---

        //  allowsMultiples

        //  list7 is configured to allow multiples
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

    this.it('xctrls:list - removeSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('list7', windowContext);

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

    this.it('xctrls:list - selectAll', function(test, options) {

        var tpElem;

        tpElem = TP.byId('list7', windowContext);

        tpElem.selectAll();
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1, 2));
    });

    //  ---

    this.it('xctrls:list - select', function(test, options) {

        var tpElem;

        tpElem = TP.byId('list7', windowContext);

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

    this.it('xctrls:list - select with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('list7', windowContext);

        tpElem.deselectAll();
        tpElem.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));
    });

    //  ---

    this.it('xctrls:list - deselect', function(test, options) {

        var tpElem;

        tpElem = TP.byId('list7', windowContext);

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

    this.it('xctrls:list - deselect with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('list7', windowContext);

        tpElem.selectAll();
        tpElem.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));

    });

});

//  ------------------------------------------------------------------------

TP.xctrls.list.Type.describe('TP.xctrls.list: data binding - no multiple',
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

            loc = '~lib_test/src/xctrls/xctrls_list.xhtml';
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

    this.it('xctrls:list - initial setup', function(test, options) {

        var tpElem,

            modelObj;

        tpElem = TP.byId('list9', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tpElem.get('value'),
            'bar');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'bar');
    });

    //  ---

    this.it('xctrls:list - change value via user interaction', async function(test, options) {

        var tpElem,

            modelObj,
            firstListItem;

        tpElem = TP.byId('list9', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firstListItem = tpElem.get('allItems').first();
                    return firstListItem;
                },
                TP.gid(tpElem),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(firstListItem).
                        run();

        test.assert.isEqualTo(
            tpElem.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'foo');
    });

    this.it('xctrls:list - change data and re-render', async function(test, options) {

        var list,

            modelURI,
            firstListItem,

            modelObj,
            items;

        list = TP.byId('list9', windowContext);

        modelURI = TP.uc('urn:tibet:selection_test_data');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firstListItem = list.get('allItems').first();
                    return firstListItem;
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        modelURI.setResource(
            TP.hc(
                'data',
                TP.ac(
                    TP.ac('fido', 'Fido'),
                    TP.ac('lassie', 'Lassie'))));

        items = list.get('allItems');

        test.assert.isEqualTo(
            items.getSize(),
            3);

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

        items = list.get('allItems');

        //  Even though the data set has 4 items, we're only displaying
        //  3 (virtual list).
        test.assert.isEqualTo(
            items.getSize(),
            3);

        test.assert.isEqualTo(
            items.at(0).getLabelText(),
            'Fluffy');
        test.assert.isEqualTo(
            items.at(1).getLabelText(),
            'Fido');
        test.assert.isEqualTo(
            items.at(2).getLabelText(),
            'Lassie');
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.list.Type.describe('TP.xctrls.list: data binding - multiple',
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

            loc = '~lib_test/src/xctrls/xctrls_list.xhtml';
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

    this.it('xctrls:list - initial setup', function(test, options) {

        var tpElem,

            modelObj;

        tpElem = TP.byId('list10', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tpElem.get('value'),
            TP.ac('foo', 'baz'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            TP.ac('foo', 'baz'));
    });

    //  ---

    this.it('xctrls:list - change value via user interaction', async function(test, options) {

        var tpElem,

            modelObj,
            secondListItem,
            thirdListItem;

        tpElem = TP.byId('list10', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    secondListItem = tpElem.get('allItems').at(1);
                    return secondListItem;
                },
                TP.gid(tpElem),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(secondListItem).
                        run();

        test.assert.isEqualTo(
            tpElem.get('value'),
            TP.ac('foo', 'baz', 'bar'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            TP.ac('foo', 'baz', 'bar'));

        await test.andIfNotValidWaitFor(
                function() {
                    thirdListItem = tpElem.get('allItems').at(2);
                    return thirdListItem;
                },
                TP.gid(tpElem),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(thirdListItem).
                        run();

        test.assert.isEqualTo(
            tpElem.get('value'),
            TP.ac('foo', 'bar'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            TP.ac('foo', 'bar'));
    });

    this.it('xctrls:list - change data and re-render', async function(test, options) {

        var list,

            modelURI,
            firstListItem,

            modelObj,
            items;

        list = TP.byId('list10', windowContext);

        modelURI = TP.uc('urn:tibet:selection_test_data');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firstListItem = list.get('allItems').first();
                    return firstListItem;
                },
                TP.gid(list),
                'TP.sig.DidRenderData');

        modelURI.setResource(
            TP.hc(
                'data',
                TP.ac(
                    TP.ac('fido', 'Fido'),
                    TP.ac('lassie', 'Lassie'))));

        items = list.get('allItems');

        test.assert.isEqualTo(
            items.getSize(),
            3);

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

        items = list.get('allItems');

        //  Even though the data set has 4 items, we're only displaying
        //  3 (virtual list).
        test.assert.isEqualTo(
            items.getSize(),
            3);

        test.assert.isEqualTo(
            items.at(0).getLabelText(),
            'Fluffy');
        test.assert.isEqualTo(
            items.at(1).getLabelText(),
            'Fido');
        test.assert.isEqualTo(
            items.at(2).getLabelText(),
            'Lassie');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
