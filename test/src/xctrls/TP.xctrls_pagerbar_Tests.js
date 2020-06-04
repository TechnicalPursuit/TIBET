//  ========================================================================
//  xctrls:pagerbar
//  ========================================================================

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: manipulation',
function() {

    var unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            var loc;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);

            this.chain(
                function() {
                    this.startTrackingSignals();
                }.bind(this));
        });

    //  ---

    this.after(
        function(suite, options) {

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

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

    this.it('Focusing', function(test, options) {

        var pagerbar,
            firstPagerbarItem;

        pagerbar = TP.byId('pagerbar1', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItemContent').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        //  Change the focus via 'direct' method

        test.getDriver().constructSequence().
            sendEvent(TP.hc('type', 'focus'), pagerbar).
            run();

        test.chain(
            function() {

                test.assert.hasAttribute(firstPagerbarItem, 'pclass:focus');

                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIFocus');
                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidFocus');
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var pagerbar,
            firstPagerbarItem;

        //  Change the content via 'user' interaction

        pagerbar = TP.byId('pagerbar1', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItemContent').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        //  Individual mousedown/mouseup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseDown(firstPagerbarItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.hasAttribute(firstPagerbarItem, 'pclass:active');

                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseUp(firstPagerbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstPagerbarItem, 'pclass:active');

                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  click

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(firstPagerbarItem).
                    run();
            });

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var pagerbar,
            firstPagerbarItem;

        //  Change the content via 'user' interaction

        pagerbar = TP.byId('pagerbar1', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItemContent').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        //  Individual keydown/keyup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(firstPagerbarItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.assert.hasAttribute(firstPagerbarItem, 'pclass:active');

                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyUp(firstPagerbarItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstPagerbarItem, 'pclass:active');

                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var pagerbar,
            firstPagerbarItem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        pagerbar = TP.byId('pagerbar1', windowContext);
        pagerbar.setAttrDisabled(true);

        test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItemContent').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        test.assert.isDisabled(TP.unwrap(firstPagerbarItem));

        //  --- Focus

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    sendEvent(TP.hc('type', 'focus'), firstPagerbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstPagerbarItem, 'pclass:focus');

                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIFocus');
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseDown(firstPagerbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstPagerbarItem, 'pclass:active');

                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseUp(firstPagerbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(firstPagerbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(firstPagerbarItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstPagerbarItem, 'pclass:active');

                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyUp(firstPagerbarItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firstPagerbarItem, 'TP.sig.UIDidDeactivate');
            });
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: get/set value',
function() {

    var testData,

        unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            var loc;

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var pagerbar;

            //  Make sure that each test starts with a freshly reset item
            pagerbar = TP.byId('pagerbar4', windowContext);
            pagerbar.deselectAll();
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:pagerbar - setting value to scalar values', function(test, options) {

        var pagerbar,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        pagerbar = TP.byId('pagerbar4', windowContext);

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

        pagerbar = TP.byId('pagerbar4', windowContext);

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

        pagerbar = TP.byId('pagerbar4', windowContext);

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
        function(suite, options) {

            var loc;

            TP.$$setupCommonObjectValues();

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var pagerbar;

            //  Make sure that each test starts with a freshly reset item
            pagerbar = TP.byId('pagerbar4', windowContext);
            pagerbar.deselectAll();
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:pagerbar - addSelection', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar4', windowContext);

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

        pagerbar = TP.byId('pagerbar4', windowContext);

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

        pagerbar = TP.byId('pagerbar4', windowContext);

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

        pagerbar = TP.byId('pagerbar4', windowContext);

        pagerbar.deselectAll();
        pagerbar.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(1));
    });

    //  ---

    this.it('xctrls:pagerbar - deselect', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar4', windowContext);

        pagerbar.addSelection('foo');
        pagerbar.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac(0));
        pagerbar.deselect('foo');
        test.assert.isEqualTo(getSelectedIndices(pagerbar), TP.ac());
    });

    //  ---

    this.it('xctrls:pagerbar - deselect with RegExp', function(test, options) {

        var pagerbar;

        pagerbar = TP.byId('pagerbar4', windowContext);

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

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            var loc;

            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:pagerbar - initial setup', function(test, options) {

        var pagerbar,

            modelObj;

        pagerbar = TP.byId('pagerbar5', windowContext);

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

    this.it('xctrls:pagerbar - change value via user interaction', function(test, options) {

        var pagerbar,

            modelObj,
            firstPagerbarItem;

        pagerbar = TP.byId('pagerbar5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItemContent').first();
                    return firstPagerbarItem;
                },
                TP.gid(pagerbar),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(firstPagerbarItem).
                    run();
            });

        test.chain(
            function() {
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
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: mixed content',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            var loc;

            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:pagerbar - initial setup', function(test, options) {

        var pagerbar,

            modelObj;

        pagerbar = TP.byId('pagerbar6', windowContext);

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

    this.it('xctrls:pagerbar - test for static content', function(test, options) {

        var pagerbar,

            firstPagerbarItem,
            lastPagerbarItem;

        pagerbar = TP.byId('pagerbar6', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firstPagerbarItem = pagerbar.get('allItemContent').first();
                    lastPagerbarItem = pagerbar.get('allItemContent').last();
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

    this.it('xctrls:pagerbar - change value via user interaction', function(test, options) {

        var pagerbar,

            modelObj,

            staticPagerItem,
            dynamicPagerItem;

        pagerbar = TP.byId('pagerbar6', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        staticPagerItem = pagerbar.get('allItemContent').first();

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(staticPagerItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.isEqualTo(
                    pagerbar.get('value'),
                    'before');

                test.assert.isEqualTo(
                    pagerbar.get('pageValue'),
                    1);

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_2')),
                    'before');
            });

        dynamicPagerItem = pagerbar.get('allItemContent').at(2);

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(dynamicPagerItem).
                    run();
            });

        test.chain(
            function() {
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
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Type.describe('TP.xctrls.pagerbar: extra paging buttons',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    driver = this.getDriver();

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            var loc;

            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_pagerbar.xhtml';
            loadURI = TP.uc(loc);
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

    this.it('xctrls:pagerbar - initial setup', function(test, options) {

        var pagerbar,

            modelObj;

        pagerbar = TP.byId('pagerbar7', windowContext);

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

    this.it('xctrls:pagerbar - change value via user interaction', function(test, options) {

        var pagerbar,

            modelObj,

            startPagerItem,
            previousPagerItem,
            numTwoPagerItem,
            nextPagerItem,
            endPagerItem;

        pagerbar = TP.byId('pagerbar7', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        startPagerItem = pagerbar.get('allItemContent').at(0);
        previousPagerItem = pagerbar.get('allItemContent').at(1);
        numTwoPagerItem = pagerbar.get('allItemContent').at(3);
        nextPagerItem = pagerbar.get('allItemContent').at(5);
        endPagerItem = pagerbar.get('allItemContent').at(6);

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(startPagerItem).
                    run();
            });

        test.chain(
            function() {
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

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(numTwoPagerItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.isEqualTo(
                    pagerbar.get('value'),
                    'bar');

                test.assert.isEqualTo(
                    pagerbar.get('pageValue'),
                    2);

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_3')),
                    'bar');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(nextPagerItem).
                    run();
            });

        test.chain(
            function() {
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

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(previousPagerItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.isEqualTo(
                    pagerbar.get('value'),
                    'bar');

                test.assert.isEqualTo(
                    pagerbar.get('pageValue'),
                    2);

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_3')),
                    'bar');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(endPagerItem).
                    run();
            });

        test.chain(
            function() {
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

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(startPagerItem).
                    run();
            });

        test.chain(
            function() {
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
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
