//  ========================================================================
//  xctrls:toolbar
//  ========================================================================

TP.xctrls.toolbar.Type.describe('TP.xctrls.toolbar: manipulation',
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

            loc = '~lib_test/src/xctrls/xctrls_toolbar.xhtml';
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

        var toolbar,
            firsttoolbarItem;

        toolbar = TP.byId('toolbar1', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firsttoolbarItem = toolbar.get('allItemContent').first();
                    return firsttoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        //  Change the focus via 'direct' method

        test.getDriver().constructSequence().
            sendEvent(TP.hc('type', 'focus'), toolbar).
            run();

        test.chain(
            function() {

                test.assert.hasAttribute(firsttoolbarItem, 'pclass:focus');

                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIFocus');
                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDidFocus');
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var toolbar,
            firsttoolbarItem;

        //  Change the content via 'user' interaction

        toolbar = TP.byId('toolbar1', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firsttoolbarItem = toolbar.get('allItemContent').first();
                    return firsttoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        //  Individual mousedown/mouseup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseDown(firsttoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.hasAttribute(firsttoolbarItem, 'pclass:active');

                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseUp(firsttoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttoolbarItem, 'pclass:active');

                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  click

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(firsttoolbarItem).
                    run();
            });

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDidActivate');

                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var toolbar,
            firsttoolbarItem;

        //  Change the content via 'user' interaction

        toolbar = TP.byId('toolbar1', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firsttoolbarItem = toolbar.get('allItemContent').first();
                    return firsttoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        //  Individual keydown/keyup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(firsttoolbarItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.assert.hasAttribute(firsttoolbarItem, 'pclass:active');

                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyUp(firsttoolbarItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttoolbarItem, 'pclass:active');

                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firsttoolbarItem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var toolbar,
            firsttoolbarItem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        toolbar = TP.byId('toolbar1', windowContext);
        toolbar.setAttrDisabled(true);

        test.andIfNotValidWaitFor(
                function() {
                    firsttoolbarItem = toolbar.get('allItemContent').first();
                    return firsttoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        test.assert.isDisabled(firsttoolbarItem);

        //  --- Focus

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    sendEvent(TP.hc('type', 'focus'), firsttoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttoolbarItem, 'pclass:focus');

                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIFocus');
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseDown(firsttoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttoolbarItem, 'pclass:active');

                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDidActivate');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseUp(firsttoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(firsttoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(firsttoolbarItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttoolbarItem, 'pclass:active');

                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyUp(firsttoolbarItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firsttoolbarItem, 'TP.sig.UIDidDeactivate');
            });
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.toolbar.Type.describe('TP.xctrls.toolbar: get/set value',
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

            loc = '~lib_test/src/xctrls/xctrls_toolbar.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var toolbar;

            //  Make sure that each test starts with a freshly reset item
            toolbar = TP.byId('toolbar4', windowContext);
            toolbar.deselectAll();
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

    this.it('xctrls:toolbar - setting value to scalar values', function(test, options) {

        var toolbar,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        toolbar = TP.byId('toolbar4', windowContext);

        //  undefined
        toolbar.set('value', testData.at(TP.UNDEF));
        value = toolbar.get('value');
        test.assert.isNull(value);

        //  null
        toolbar.set('value', testData.at(TP.NULL));
        value = toolbar.get('value');
        test.assert.isNull(value);

        //  String
        toolbar.set('value', testData.at('String'));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        toolbar.set('value', testData.at('Number'));
        value = toolbar.get('value');
        test.assert.isNull(value);

        //  Boolean
        toolbar.set('value', testData.at('Boolean'));
        value = toolbar.get('value');
        test.assert.isNull(value);
    });

    //  ---

    this.it('xctrls:toolbar - setting value to complex object values', function(test, options) {

        var toolbar,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        toolbar = TP.byId('toolbar4', windowContext);

        //  RegExp
        toolbar.set('value', testData.at('RegExp'));
        value = toolbar.get('value');
        test.assert.isNull(value);

        //  Date
        toolbar.set('value', testData.at('Date'));
        value = toolbar.get('value');
        test.assert.isNull(value);

        //  Array
        toolbar.set('value', TP.ac('foo', 'bar', 'baz'));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  Object
        toolbar.set('value',
            {
                foo: 'baz'
            });
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        toolbar.set('value', TP.hc('foo', 'bar'));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('xctrls:toolbar - setting value to markup', function(test, options) {

        var toolbar,
            value;

        toolbar = TP.byId('toolbar4', windowContext);

        //  XMLDocument
        toolbar.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = toolbar.get('value');
        test.assert.isNull(value);

        //  XMLElement
        toolbar.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        toolbar.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        toolbar.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        toolbar.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        toolbar.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        toolbar.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        toolbar.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = toolbar.get('value');
        test.assert.isNull(value);

        //  NodeList
        toolbar.set('value', testData.at('NodeList'));
        value = toolbar.get('value');
        test.assert.isNull(value);

        //  NamedNodeMap
        toolbar.set('value', testData.at('NamedNodeMap'));
        value = toolbar.get('value');
        test.assert.isEqualTo(value, 'baz');
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.toolbar.Type.describe('TP.xctrls.toolbar: selection management',
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

            loc = '~lib_test/src/xctrls/xctrls_toolbar.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var toolbar;

            //  Make sure that each test starts with a freshly reset item
            toolbar = TP.byId('toolbar4', windowContext);
            toolbar.deselectAll();
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

    this.it('xctrls:toolbar - addSelection', function(test, options) {

        var toolbar;

        toolbar = TP.byId('toolbar4', windowContext);

        //  ---

        //  allowsMultiples

        //  toolbar never allows multiples
        test.assert.isFalse(toolbar.allowsMultiples());

        //  ---

        //  (property defaults to 'value')
        toolbar.deselectAll();
        toolbar.addSelection('bar');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(1));

        //  'value' property
        toolbar.deselectAll();
        toolbar.addSelection('foo', 'value');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(0));
    });

    //  ---

    this.it('xctrls:toolbar - removeSelection', function(test, options) {

        var toolbar;

        toolbar = TP.byId('toolbar4', windowContext);

        //  (property defaults to 'value')
        toolbar.deselectAll();
        toolbar.addSelection('foo');
        toolbar.removeSelection('foo');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac());

        toolbar.deselectAll();
        toolbar.addSelection('bar');
        toolbar.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(1));

        //  'value' property
        toolbar.deselectAll();
        toolbar.addSelection('foo');
        toolbar.removeSelection('foo', 'value');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac());

        toolbar.deselectAll();
        toolbar.addSelection('baz');
        toolbar.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(2));
    });

    //  ---

    this.it('xctrls:toolbar - select', function(test, options) {

        var toolbar;

        toolbar = TP.byId('toolbar4', windowContext);

        toolbar.deselectAll();
        toolbar.select('bar');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(1));
        toolbar.select('baz');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(2));

        toolbar.deselectAll();
        toolbar.select('baz');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(2));
    });

    //  ---

    this.it('xctrls:toolbar - select with RegExp', function(test, options) {

        var toolbar;

        toolbar = TP.byId('toolbar4', windowContext);

        toolbar.deselectAll();
        toolbar.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(1));
    });

    //  ---

    this.it('xctrls:toolbar - deselect', function(test, options) {

        var toolbar;

        toolbar = TP.byId('toolbar4', windowContext);

        toolbar.addSelection('foo');
        toolbar.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(0));
        toolbar.deselect('foo');
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac());
    });

    //  ---

    this.it('xctrls:toolbar - deselect with RegExp', function(test, options) {

        var toolbar;

        toolbar = TP.byId('toolbar4', windowContext);

        toolbar.addSelection('foo');
        toolbar.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac(0));
        toolbar.deselect(/fo/);
        test.assert.isEqualTo(getSelectedIndices(toolbar), TP.ac());
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.toolbar.Type.describe('TP.xctrls.toolbar: data binding',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            var loc;

            driver = this.getDriver();

            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_toolbar.xhtml';
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

    this.it('xctrls:toolbar - initial setup', function(test, options) {

        var toolbar,

            modelObj;

        toolbar = TP.byId('toolbar5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            toolbar.get('value'),
            'bar');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'bar');
    });

    //  ---

    this.it('xctrls:toolbar - change value via user interaction', function(test, options) {

        var toolbar,

            modelObj,
            firsttoolbarItem;

        toolbar = TP.byId('toolbar5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        test.andIfNotValidWaitFor(
                function() {
                    firsttoolbarItem = toolbar.get('allItemContent').first();
                    return firsttoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(firsttoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.isEqualTo(
                    toolbar.get('value'),
                    'foo');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_1')),
                    'foo');
            });
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.toolbar.Type.describe('TP.xctrls.toolbar: static content',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            var loc;

            driver = this.getDriver();

            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_toolbar.xhtml';
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

    this.it('xctrls:toolbar - initial setup', function(test, options) {

        var toolbar,

            modelObj;

        toolbar = TP.byId('toolbar6', windowContext);

        modelObj = TP.uc('urn:tibet:static_selection_test_data').getResource().get('result');

        console.log('toolbar value: ' + toolbar.get('value'));

        test.assert.isEqualTo(
            toolbar.get('value'),
            'before');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'before');
    });

    //  ---

    this.it('xctrls:toolbar - test for static content', function(test, options) {

        var toolbar,

            firsttoolbarItem,
            lasttoolbarItem;

        toolbar = TP.byId('toolbar6', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firsttoolbarItem = toolbar.get('allItemContent').first();
                    lasttoolbarItem = toolbar.get('allItemContent').last();
                    return firsttoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        //  The 2nd child element will be an 'xctrls:value'

        test.assert.isEqualTo(
            firsttoolbarItem.getChildElements().at(1).getTextContent(),
            'before');

        test.assert.isEqualTo(
            lasttoolbarItem.getChildElements().at(1).getTextContent(),
            'after');
    });

    //  ---

    this.it('xctrls:toolbar - change value via user interaction', function(test, options) {

        var toolbar,

            modelObj,

            statictoolbarItem,

            localHandlerRan;

        toolbar = TP.byId('toolbar6', windowContext);

        modelObj = TP.uc('urn:tibet:static_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        statictoolbarItem = toolbar.get('allItemContent').first();

        test.andIfNotValidWaitFor(
                function() {
                    statictoolbarItem = toolbar.get('allItemContent').first();
                    statictoolbarItem.defineHandler(
                        'TestClick',
                        function() {
                            localHandlerRan = true;
                        });
                    return statictoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(statictoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.isEqualTo(
                    toolbar.get('value'),
                    'before');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_1')),
                    'before');

                test.assert.isTrue(localHandlerRan);
            });
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.toolbar.Type.describe('TP.xctrls.toolbar: mixed content',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            var loc;

            driver = this.getDriver();

            windowContext = driver.get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_toolbar.xhtml';
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

    this.it('xctrls:toolbar - initial setup', function(test, options) {

        var toolbar,

            modelObj;

        toolbar = TP.byId('toolbar7', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            toolbar.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            'foo');
    });

    //  ---

    this.it('xctrls:toolbar - test for static content', function(test, options) {

        var toolbar,

            firsttoolbarItem,
            lasttoolbarItem;

        toolbar = TP.byId('toolbar7', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firsttoolbarItem = toolbar.get('allItemContent').first();
                    lasttoolbarItem = toolbar.get('allItemContent').last();
                    return firsttoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        //  The 2nd child element will be an 'xctrls:value'

        test.assert.isEqualTo(
            firsttoolbarItem.getChildElements().at(1).getTextContent(),
            'before');

        test.assert.isEqualTo(
            lasttoolbarItem.getChildElements().at(1).getTextContent(),
            'after');
    });

    //  ---

    this.it('xctrls:toolbar - change value via user interaction', function(test, options) {

        var toolbar,

            modelObj,

            statictoolbarItem,
            dynamictoolbarItem;

        toolbar = TP.byId('toolbar7', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction - first, one of the
        //  'static' items.

        statictoolbarItem = toolbar.get('allItemContent').first();

        test.andIfNotValidWaitFor(
                function() {
                    statictoolbarItem = toolbar.get('allItemContent').first();
                    dynamictoolbarItem = toolbar.get('allItemContent').at(1);

                    return statictoolbarItem;
                },
                TP.gid(toolbar),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(statictoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.isEqualTo(
                    toolbar.get('value'),
                    'before');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_2')),
                    'before');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(dynamictoolbarItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.isEqualTo(
                    toolbar.get('value'),
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
