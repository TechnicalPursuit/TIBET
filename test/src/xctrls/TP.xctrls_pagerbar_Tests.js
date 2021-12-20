//  ========================================================================
//  xctrls:pagerbar
//  ========================================================================

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: rendering',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
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

    this.it('xctrls:pagerbar - simple Array', async function(test, options) {

        var pagerbar,
            items;

        pagerbar = TP.byId('pagerbar1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return pagerbar.get('allItems').first();
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            pagerbar.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            pagerbar.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            pagerbar.get('$dataKeys').getSize(),
            10);

        items = pagerbar.get('allItems');

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

    this.it('xctrls:pagerbar - Array of Pairs', async function(test, options) {

        var pagerbar,
            items;

        pagerbar = TP.byId('pagerbar2', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return pagerbar.get('allItems').first();
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            pagerbar.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            pagerbar.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            pagerbar.get('$dataKeys').getSize(),
            10);

        items = pagerbar.get('allItems');

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

    this.it('xctrls:pagerbar - multi-item Array', async function(test, options) {

        var pagerbar,
            items;

        pagerbar = TP.byId('pagerbar3', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return pagerbar.get('allItems').first();
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            pagerbar.get('allItems').getSize(),
            10);
        test.assert.isEqualTo(
            pagerbar.get('data').getSize(),
            10);
        test.assert.isEqualTo(
            pagerbar.get('$dataKeys').getSize(),
            10);

        items = pagerbar.get('allItems');

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

    this.it('xctrls:pagerbar - single-item Array with Hash', async function(test, options) {

        var pagerbar,
            items;

        pagerbar = TP.byId('pagerbar4', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return pagerbar.get('allItems').first();
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            pagerbar.get('allItems').getSize(),
            1);
        test.assert.isEqualTo(
            pagerbar.get('data').getSize(),
            1);
        test.assert.isEqualTo(
            pagerbar.get('$dataKeys').getSize(),
            1);

        items = pagerbar.get('allItems');

        test.assert.isEqualTo(
            items.first().getLabelText(),
            'Smith');
    });

    //  ---

    this.it('xctrls:pagerbar - multi-item Array with Hashes', async function(test, options) {

        var pagerbar,
            items;

        pagerbar = TP.byId('pagerbar5', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    return pagerbar.get('allItems').first();
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            pagerbar.get('allItems').getSize(),
            2);
        test.assert.isEqualTo(
            pagerbar.get('data').getSize(),
            2);
        test.assert.isEqualTo(
            pagerbar.get('$dataKeys').getSize(),
            2);

        items = pagerbar.get('allItems');

        test.assert.isEqualTo(
            items.first().getLabelText(),
            'Smith');
        test.assert.isEqualTo(
            items.last().getLabelText(),
            'Brown');
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: manipulation',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
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

        var pagerbar,
            firstPagerbarItem;

        pagerbar = TP.byId('pagerbar1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        //  Change the focus via 'direct' method

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), pagerbar).
                        run();

        test.assert.hasAttribute(firstPagerbarItem, 'pclass:focus');

        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIFocus');
        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidFocus');
    });

    //  ---

    this.it('Activation - mouse', async function(test, options) {

        var pagerbar,
            firstPagerbarItem;

        //  Change the content via 'user' interaction

        pagerbar = TP.byId('pagerbar1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        //  Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(firstPagerbarItem).
                        run();

        test.assert.hasAttribute(firstPagerbarItem, 'pclass:active');

        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(firstPagerbarItem).
                        run();

        test.refute.hasAttribute(firstPagerbarItem, 'pclass:active');

        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  click

        await driver.constructSequence().
                        click(firstPagerbarItem).
                        run();

        //  Don't test the attribute here - it will already have been
        //  removed.

        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Activation - keyboard', async function(test, options) {

        var pagerbar,
            firstPagerbarItem;

        //  Change the content via 'user' interaction

        pagerbar = TP.byId('pagerbar1', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        //  Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(firstPagerbarItem, 'Enter').
                        run();

        test.assert.hasAttribute(firstPagerbarItem, 'pclass:active');

        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(firstPagerbarItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstPagerbarItem, 'pclass:active');

        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
        test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Disabled behavior', async function(test, options) {

        var pagerbar,
            firstPagerbarItem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        pagerbar = TP.byId('pagerbar1', windowContext);
        pagerbar.setAttrDisabled(true);

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        test.assert.isDisabled(firstPagerbarItem);

        //  --- Focus

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), firstPagerbarItem).
                        run();

        test.refute.hasAttribute(firstPagerbarItem, 'pclass:focus');

        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        //  --- Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(firstPagerbarItem).
                        run();

        test.refute.hasAttribute(firstPagerbarItem, 'pclass:active');

        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

        await driver.constructSequence().
                        mouseUp(firstPagerbarItem).
                        run();

        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- click

        await driver.constructSequence().
                        click(firstPagerbarItem).
                        run();

        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(firstPagerbarItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstPagerbarItem, 'pclass:active');

        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        keyUp(firstPagerbarItem, 'Enter').
                        run();

        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
        test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: get/set value',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var pagerbar;

            //  Make sure that each test starts with a freshly reset item
            pagerbar = TP.byId('pagerbar6', windowContext);
            pagerbar.deselectAll();
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

    this.it('xctrls:pagerbar - setting value to scalar values', function(test, options) {

        var pagerbar,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        pagerbar = TP.byId('pagerbar6', windowContext);

        //  undefined
        pagerbar.set('value', testData.at(TP.UNDEF));
        value = pagerbar.get('value');
        test.assert.isNull(value);

        //  null
        pagerbar.set('value', testData.at(TP.NULL));
        value = pagerbar.get('value');
        test.assert.isNull(value);

        //  String
        pagerbar.set('value', testData.at('String'));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 2);

        //  Number
        pagerbar.set('value', testData.at('Number'));
        value = pagerbar.get('value');
        test.assert.isNull(value);

        //  Boolean
        pagerbar.set('value', testData.at('Boolean'));
        value = pagerbar.get('value');
        test.assert.isNull(value);
    });

    //  ---

    this.it('xctrls:pagerbar - setting value to complex object values', function(test, options) {

        var pagerbar,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        pagerbar = TP.byId('pagerbar6', windowContext);

        //  RegExp
        pagerbar.set('value', testData.at('RegExp'));
        value = pagerbar.get('value');
        test.assert.isNull(value);

        //  Date
        pagerbar.set('value', testData.at('Date'));
        value = pagerbar.get('value');
        test.assert.isNull(value);

        //  Array
        pagerbar.set('value', TP.ac('foo', 'bar', 'baz'));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'foo');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 1);

        //  Object
        pagerbar.set('value',
            {
                foo: 'baz'
            });
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        pagerbar.set('value', TP.hc('foo', 'bar'));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'bar');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 2);
    });

    //  ---

    this.it('xctrls:pagerbar - setting value to markup', function(test, options) {

        var pagerbar,
            value;

        pagerbar = TP.byId('pagerbar6', windowContext);

        //  XMLDocument
        pagerbar.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = pagerbar.get('value');
        test.assert.isNull(value);

        //  XMLElement
        pagerbar.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'bar');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 2);

        //  AttributeNode
        pagerbar.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'bar');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 2);

        //  TextNode
        pagerbar.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'foo');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 1);

        //  CDATASectionNode
        pagerbar.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'foo');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 1);

        //  PINode
        pagerbar.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'bar');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 2);

        //  CommentNode
        pagerbar.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'foo');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 1);

        //  DocumentFragmentNode
        pagerbar.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = pagerbar.get('value');
        test.assert.isNull(value);

        //  NodeList
        pagerbar.set('value', testData.at('NodeList'));
        value = pagerbar.get('value');
        test.assert.isNull(value);

        //  NamedNodeMap
        pagerbar.set('value', testData.at('NamedNodeMap'));
        value = pagerbar.get('value');
        test.assert.isEqualTo(value, 'baz');
        value = pagerbar.get('pageValue');
        test.assert.isEqualTo(value, 3);
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: selection management',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var pagerbar;

            //  Make sure that each test starts with a freshly reset item
            pagerbar = TP.byId('pagerbar6', windowContext);
            pagerbar.deselectAll();
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

    this.it('xctrls:pagerbar - addSelection', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar6', windowContext);

        //  ---

        //  allowsMultiples

        //  pagerbar never allows multiples
        test.assert.isFalse(pagerbar.allowsMultiples());

        //  ---

        //  (property defaults to 'value')
        pagerbar.deselectAll();
        pagerbar.addSelection('bar');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(1));

        //  'value' property
        pagerbar.deselectAll();
        pagerbar.addSelection('foo', 'value');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(0));
    });

    //  ---

    this.it('xctrls:pagerbar - removeSelection', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar6', windowContext);

        //  (property defaults to 'value')
        pagerbar.deselectAll();
        pagerbar.addSelection('foo');
        pagerbar.removeSelection('foo');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac());

        pagerbar.deselectAll();
        pagerbar.addSelection('bar');
        pagerbar.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(1));

        //  'value' property
        pagerbar.deselectAll();
        pagerbar.addSelection('foo');
        pagerbar.removeSelection('foo', 'value');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac());

        pagerbar.deselectAll();
        pagerbar.addSelection('baz');
        pagerbar.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(2));
    });

    //  ---

    this.it('xctrls:pagerbar - select', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar6', windowContext);

        pagerbar.deselectAll();
        pagerbar.select('bar');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(1));
        pagerbar.select('baz');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(2));

        pagerbar.deselectAll();
        pagerbar.select('baz');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(2));
    });

    //  ---

    this.it('xctrls:pagerbar - select with RegExp', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar6', windowContext);

        pagerbar.deselectAll();
        pagerbar.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(1));
    });

    //  ---

    this.it('xctrls:pagerbar - deselect', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar6', windowContext);

        pagerbar.addSelection('foo');
        pagerbar.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(0));
        pagerbar.deselect('foo');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac());
    });

    //  ---

    this.it('xctrls:pagerbar - deselect with RegExp', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar6', windowContext);

        pagerbar.addSelection('foo');
        pagerbar.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(0));
        pagerbar.deselect(/fo/);
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac());
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: data binding',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
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

    this.it('xctrls:pagerbar - initial setup', function(test, options) {

        var pagerbar,

            modelObj;

        pagerbar = TP.byId('pagerbar7', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'bar');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            2);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'bar');
    });

    //  ---

    this.it('xctrls:pagerbar - change value via user interaction (binding)', async function(test, options) {

        var pagerbar,

            modelObj,
            firstPagerbarItem;

        pagerbar = TP.byId('pagerbar7', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(firstPagerbarItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'foo');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            1);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'foo');
    });

    //  ---

    this.it('xctrls:pagerbar - change data and re-render', async function(test, options) {

        var pagerbar,

            modelURI,
            firstPagerbarItem;

        pagerbar = TP.byId('pagerbar7', windowContext);

        modelURI = TP.uc('urn:tibet:selection_test_data');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        modelURI.setResource(
            TP.hc(
                'data',
                TP.ac(
                    TP.ac('fido', 'Fido'),
                    TP.ac('lassie', 'Lassie'))));

        test.assert.isEqualTo(
            pagerbar.get('allItems').getSize(),
            2);
        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            1);
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: static content',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
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

    this.it('xctrls:pagerbar - initial setup', function(test, options) {

        var pagerbar,

            modelObj;

        pagerbar = TP.byId('pagerbar8', windowContext);

        modelObj = TP.uc('urn:tibet:static_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'before');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'before');
    });

    //  ---

    this.it('xctrls:pagerbar - test for static content', async function(test, options) {

        var pagerbar,

            firstpagerbarItem,
            lastpagerbarItem;

        pagerbar = TP.byId('pagerbar8', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstpagerbarItem = pagerbar.get('allItems').first();
                    lastpagerbarItem = pagerbar.get('allItems').last();
                    return firstpagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        //  The 2nd child element will be an 'xctrls:value'

        test.assert.isEqualTo(
            firstpagerbarItem.getChildElements().at(1).getTextContent(),
            'before');

        test.assert.isEqualTo(
            lastpagerbarItem.getChildElements().at(1).getTextContent(),
            'after');
    });

    //  ---

    this.it('xctrls:pagerbar - change value via user interaction (static)', async function(test, options) {

        var pagerbar,

            modelObj,

            staticpagerbarItem,

            localHandlerRan;

        pagerbar = TP.byId('pagerbar8', windowContext);

        modelObj = TP.uc('urn:tibet:static_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        staticpagerbarItem = pagerbar.get('allItems').first();

        await test.andIfNotValidWaitFor(
                function() {
                    staticpagerbarItem = pagerbar.get('allItems').first();
                    staticpagerbarItem.defineHandler(
                        'TestClick',
                        function() {
                            localHandlerRan = true;
                        });
                    return staticpagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(staticpagerbarItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'before');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'before');

        test.assert.isTrue(localHandlerRan);
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: mixed content',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
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

    this.it('xctrls:pagerbar - initial setup', function(test, options) {

        var pagerbar,

            modelObj;

        pagerbar = TP.byId('pagerbar9', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'foo');

        //  This is offset by the first fixed item.
        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            2);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            'foo');
    });

    //  ---

    this.it('xctrls:pagerbar - test for static content', async function(test, options) {

        var pagerbar,

            firstPagerbarItem,
            lastPagerbarItem;

        pagerbar = TP.byId('pagerbar9', windowContext);

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    lastPagerbarItem = pagerbar.get('allItems').last();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        //  The 2nd child element will be an 'xctrls:value'

        test.assert.isEqualTo(
            firstPagerbarItem.getChildElements().at(1).getTextContent(),
            'before');

        test.assert.isEqualTo(
            lastPagerbarItem.getChildElements().at(1).getTextContent(),
            'after');
    });

    //  ---

    this.it('xctrls:pagerbar - change value via user interaction (mixed)', async function(test, options) {

        var pagerbar,

            modelObj,

            staticPagerItem,
            dynamicPagerItem;

        pagerbar = TP.byId('pagerbar9', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        await test.andIfNotValidWaitFor(
                function() {
                    staticPagerItem = pagerbar.get('allItems').first();
                    dynamicPagerItem = pagerbar.get('allItems').at(2);
                    return staticPagerItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(staticPagerItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'before');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            1);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            'before');

        await driver.constructSequence().
                        click(dynamicPagerItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'bar');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            3);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            'bar');
    });

    //  ---

    this.it('xctrls:pagerbar - change data and re-render', async function(test, options) {

        var pagerbar,

            modelURI,
            firstPagerbarItem;

        pagerbar = TP.byId('pagerbar9', windowContext);

        modelURI = TP.uc('urn:tibet:selection_test_data');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        modelURI.setResource(
            TP.hc(
                'data',
                TP.ac(
                    TP.ac('fido', 'Fido'),
                    TP.ac('lassie', 'Lassie'))));

        test.assert.isEqualTo(
            pagerbar.get('allItems').getSize(),
            4);
        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            1);
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: extra paging buttons',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
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

    this.it('xctrls:pagerbar - initial setup', function(test, options) {

        var pagerbar,

            modelObj;

        pagerbar = TP.byId('pagerbar10', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'baz');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            3);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_3')),
            'baz');
    });

    //  ---

    this.it('xctrls:pagerbar - change value via user interaction (extra buttons)', async function(test, options) {

        var pagerbar,

            modelObj,

            startPagerItem,
            previousPagerItem,
            numTwoPagerItem,
            nextPagerItem,
            endPagerItem;

        pagerbar = TP.byId('pagerbar10', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        await test.andIfNotValidWaitFor(
                function() {
                    startPagerItem = pagerbar.get('allItems').at(0);
                    previousPagerItem = pagerbar.get('allItems').at(1);
                    numTwoPagerItem = pagerbar.get('allItems').at(3);
                    nextPagerItem = pagerbar.get('allItems').at(5);
                    endPagerItem = pagerbar.get('allItems').at(6);
                    return startPagerItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(startPagerItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'foo');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            1);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_3')),
            'foo');

        await driver.constructSequence().
                        click(numTwoPagerItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'bar');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            2);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_3')),
            'bar');

        await driver.constructSequence().
                        click(nextPagerItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'baz');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            3);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_3')),
            'baz');

        await driver.constructSequence().
                        click(previousPagerItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'bar');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            2);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_3')),
            'bar');

        await driver.constructSequence().
                        click(endPagerItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'baz');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            3);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_3')),
            'baz');

        await driver.constructSequence().
                        click(startPagerItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'foo');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            1);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_3')),
            'foo');
    });

    //  ---

    this.it('xctrls:pagerbar - disable buttons when appropriate', async function(test, options) {

        var pagerbar,

            startPagerItem,
            previousPagerItem,
            numTwoPagerItem,
            nextPagerItem,
            endPagerItem;

        pagerbar = TP.byId('pagerbar10', windowContext);

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        await test.andIfNotValidWaitFor(
                function() {
                    startPagerItem = pagerbar.get('allItems').at(0);
                    previousPagerItem = pagerbar.get('allItems').at(1);
                    numTwoPagerItem = pagerbar.get('allItems').at(3);
                    nextPagerItem = pagerbar.get('allItems').at(5);
                    endPagerItem = pagerbar.get('allItems').at(6);
                    return startPagerItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(startPagerItem).
                        run();

        test.assert.isDisabled(startPagerItem);
        test.assert.isDisabled(previousPagerItem);
        test.refute.isDisabled(nextPagerItem);
        test.refute.isDisabled(endPagerItem);

        await driver.constructSequence().
                        click(numTwoPagerItem).
                        run();

        test.refute.isDisabled(startPagerItem);
        test.refute.isDisabled(previousPagerItem);
        test.refute.isDisabled(nextPagerItem);
        test.refute.isDisabled(endPagerItem);

        await driver.constructSequence().
                        click(nextPagerItem).
                        run();

        test.refute.isDisabled(startPagerItem);
        test.refute.isDisabled(previousPagerItem);
        test.assert.isDisabled(nextPagerItem);
        test.assert.isDisabled(endPagerItem);

        await driver.constructSequence().
                        click(previousPagerItem).
                        run();

        test.refute.isDisabled(startPagerItem);
        test.refute.isDisabled(previousPagerItem);
        test.refute.isDisabled(nextPagerItem);
        test.refute.isDisabled(endPagerItem);

        await driver.constructSequence().
                        click(endPagerItem).
                        run();

        test.refute.isDisabled(startPagerItem);
        test.refute.isDisabled(previousPagerItem);
        test.assert.isDisabled(nextPagerItem);
        test.assert.isDisabled(endPagerItem);

        await driver.constructSequence().
                        click(startPagerItem).
                        run();

        test.assert.isDisabled(startPagerItem);
        test.assert.isDisabled(previousPagerItem);
        test.refute.isDisabled(nextPagerItem);
        test.refute.isDisabled(endPagerItem);
    });
}).skip();

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: paging',
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

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
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

    this.it('xctrls:pagerbar - initial setup', function(test, options) {

        var pagerbar,

            modelObj;

        pagerbar = TP.byId('pagerbar11', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'Brown');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            2);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_4')),
            'Brown');
    });

    //  ---

    this.it('xctrls:pagerbar - change value via user interaction (paging)', async function(test, options) {

        var pagerbar,

            modelObj,
            firstPagerbarItem;

        pagerbar = TP.byId('pagerbar11', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        await test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItems').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(firstPagerbarItem).
                        run();

        test.assert.isEqualTo(
            pagerbar.get('value'),
            'Smith');

        test.assert.isEqualTo(
            pagerbar.get('pageValue'),
            1);

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_4')),
            'Smith');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
