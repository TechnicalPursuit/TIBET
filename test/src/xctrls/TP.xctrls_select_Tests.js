//  ========================================================================
//  xctrls:select
//  ========================================================================

TP.xctrls.select.Type.describe('TP.xctrls.select: manipulation',
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

            loc = '~lib_test/src/xctrls/xctrls_select.xhtml';
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
            var popup;

            this.getSuite().resetSignalTracking();

            popup = TP.xctrls.popup.getOverlayWithID(
                        windowContext.getDocument(), 'XCtrlsPickerPopup');

            popup.setAttribute('closed', true);
            popup.setAttribute('hidden', true);
        });

    //  ---

    this.it('Focusing', async function(test, options) {

        var select;

        select = TP.byId('select1', windowContext);

        //  Change the focus via 'direct' method

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), select).
                        run();

        test.assert.hasAttribute(select, 'pclass:focus');

        test.assert.didSignal(select, 'TP.sig.UIFocus');
        test.assert.didSignal(select, 'TP.sig.UIDidFocus');
    });

    //  ---

    this.it('Activation - mouse', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        //  Change the content via 'user' interaction

        select = TP.byId('select1', windowContext);

        //  Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(select).
                        run();

        test.assert.hasAttribute(select, 'pclass:active');

        test.assert.didSignal(select, 'TP.sig.UIActivate');
        test.assert.didSignal(select, 'TP.sig.UIDidActivate');

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        await test.andWaitFor(firstSelectItem, 'TP.sig.UIFocus');

        test.assert.hasAttribute(firstSelectItem, 'pclass:focus');

        test.assert.didSignal(firstSelectItem, 'TP.sig.UIFocus');
        test.assert.didSignal(firstSelectItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(select).
                        run();

        test.refute.hasAttribute(select, 'pclass:active');

        test.assert.didSignal(select, 'TP.sig.UIDeactivate');
        test.assert.didSignal(select, 'TP.sig.UIDidDeactivate');

        test.refute.hasAttribute(firstSelectItem, 'pclass:focus');

        test.assert.didSignal(firstSelectItem, 'TP.sig.UIBlur');
        test.assert.didSignal(firstSelectItem, 'TP.sig.UIDidBlur');

        test.getSuite().resetSignalTracking();

        //  click

        await driver.constructSequence().
                        click(select).
                        run();

        //  Don't test the attribute here - it will already have been
        //  removed.

        test.assert.didSignal(select, 'TP.sig.UIActivate');
        test.assert.didSignal(select, 'TP.sig.UIDidActivate');

        test.assert.didSignal(select, 'TP.sig.UIDeactivate');
        test.assert.didSignal(select, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Activation - keyboard', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        //  Change the content via 'user' interaction

        select = TP.byId('select1', windowContext);
        select.focus();

        //  Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(select, 'Enter').
                        run();

        test.assert.hasAttribute(select, 'pclass:active');

        test.assert.didSignal(select, 'TP.sig.UIActivate');
        test.assert.didSignal(select, 'TP.sig.UIDidActivate');

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        keyUp(select, 'Enter').
                        run();

        //  popups focus as part of the key *up*

        test.assert.hasAttribute(firstSelectItem, 'pclass:focus');

        test.assert.didSignal(firstSelectItem, 'TP.sig.UIFocus');
        test.assert.didSignal(firstSelectItem, 'TP.sig.UIDidFocus');

        test.refute.hasAttribute(select, 'pclass:active');

        test.assert.didSignal(select, 'TP.sig.UIDeactivate');
        test.assert.didSignal(select, 'TP.sig.UIDidDeactivate');

        //  The picker is still up and the first item is focused -
        //  that's how it works. It's sticky.
        test.assert.hasAttribute(firstSelectItem, 'pclass:focus');

        await driver.constructSequence().
                        keyDown(firstSelectItem, 'Enter').
                        run();

        await driver.constructSequence().
                        keyUp(firstSelectItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstSelectItem, 'pclass:focus');

        test.assert.didSignal(firstSelectItem, 'TP.sig.UIBlur');
        test.assert.didSignal(firstSelectItem, 'TP.sig.UIDidBlur');
    });

    //  ---

    this.it('Disabled behavior', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        select = TP.byId('select1', windowContext);
        select.setAttrDisabled(true);

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        test.assert.isDisabled(firstSelectItem);

        //  --- Focus

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), firstSelectItem).
                        run();

        test.refute.hasAttribute(firstSelectItem, 'pclass:focus');

        test.refute.didSignal(firstSelectItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstSelectItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        //  --- Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(select).
                        run();

        test.refute.hasAttribute(select, 'pclass:active');

        test.refute.didSignal(select, 'TP.sig.UIActivate');
        test.refute.didSignal(select, 'TP.sig.UIDidActivate');

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        test.refute.hasAttribute(firstSelectItem, 'pclass:focus');

        test.refute.didSignal(firstSelectItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstSelectItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(select).
                        run();

        test.refute.didSignal(select, 'TP.sig.UIDeactivate');
        test.refute.didSignal(select, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- click

        await driver.constructSequence().
                        click(select).
                        run();

        test.refute.didSignal(select, 'TP.sig.UIActivate');
        test.refute.didSignal(select, 'TP.sig.UIDidActivate');

        test.refute.didSignal(select, 'TP.sig.UIDeactivate');
        test.refute.didSignal(select, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(select, 'Enter').
                        run();

        test.refute.hasAttribute(select, 'pclass:active');

        test.refute.didSignal(select, 'TP.sig.UIActivate');
        test.refute.didSignal(select, 'TP.sig.UIDidActivate');

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                            keyUp(select, 'Enter').
                            run();

        //  popups focus as part of the key *up*

        test.refute.hasAttribute(firstSelectItem, 'pclass:focus');

        test.refute.didSignal(firstSelectItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstSelectItem, 'TP.sig.UIDidFocus');

        test.refute.didSignal(select, 'TP.sig.UIDeactivate');
        test.refute.didSignal(select, 'TP.sig.UIDidDeactivate');

        //  The picker is still up and the first item is focused -
        //  that's how it works. It's sticky.
        test.refute.hasAttribute(firstSelectItem, 'pclass:focus');

        await driver.constructSequence().
                        keyDown(firstSelectItem, 'Enter').
                        run();

        await driver.constructSequence().
                        keyUp(firstSelectItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstSelectItem, 'pclass:focus');

        test.refute.didSignal(firstSelectItem, 'TP.sig.UIBlur');
        test.refute.didSignal(firstSelectItem, 'TP.sig.UIDidBlur');
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.select.Type.describe('TP.xctrls.select: get/set value',
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

            loc = '~lib_test/src/xctrls/xctrls_select.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, suite) {

            var select;

            //  Make sure that each test starts with a freshly reset item
            select = TP.byId('select4', windowContext);
            select.deselectAll();

            select = TP.byId('select5', windowContext);
            select.deselectAll();
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

    this.it('xctrls:select - setting value to scalar values', async function(test, options) {

        var select,
            firstSelectItem,
            value,
            selectList;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        select = TP.byId('select4', windowContext);

        //  ---

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        //  undefined
        select.set('value', testData.at(TP.UNDEF));
        value = select.get('value');
        test.assert.isNull(value);

        //  null
        select.set('value', testData.at(TP.NULL));
        value = select.get('value');
        test.assert.isNull(value);

        //  String
        select.set('value', testData.at('String'));
        value = select.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        select.set('value', testData.at('Number'));
        value = select.get('value');
        test.assert.isNull(value);

        //  Boolean
        select.set('value', testData.at('Boolean'));
        value = select.get('value');
        test.assert.isNull(value);
    });

    //  ---

    this.it('xctrls:select - setting value to complex object values', async function(test, options) {

        var select,
            firstSelectItem,
            value,
            selectList;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        select = TP.byId('select4', windowContext);

        //  ---

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        //  RegExp
        select.set('value', testData.at('RegExp'));
        value = select.get('value');
        test.assert.isNull(value);

        //  Date
        select.set('value', testData.at('Date'));
        value = select.get('value');
        test.assert.isNull(value);

        //  Array
        select.set('value', TP.ac('foo', 'bar', 'baz'));
        value = select.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  Object
        select.set('value',
            {
                foo: 'baz'
            });
        value = select.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        select.set('value', TP.hc('foo', 'bar'));
        value = select.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('xctrls:select - setting value to markup', async function(test, options) {

        var select,
            firstSelectItem,
            value,
            selectList;

        select = TP.byId('select4', windowContext);

        //  ---

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        //  XMLDocument
        select.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = select.get('value');
        test.assert.isNull(value);

        //  XMLElement
        select.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = select.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        select.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = select.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        select.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = select.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        select.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = select.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        select.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = select.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        select.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = select.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        select.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = select.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  NodeList
        select.set('value', testData.at('NodeList'));
        value = select.get('value');
        test.assert.isNull(value);

        //  NamedNodeMap
        select.set('value', testData.at('NamedNodeMap'));
        value = select.get('value');
        test.assert.isEqualTo(value, 'baz');
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.select.Type.describe('TP.xctrls.select: selection management',
function() {

    var getSelectedIndices,

        unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function(aTPElem) {

        var selectList,
            itemIndices;

        selectList = aTPElem.get('popupContentFirstElement');

        itemIndices = selectList.get('allItems').collect(
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

            loc = '~lib_test/src/xctrls/xctrls_select.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, suite) {

            var select;

            //  Make sure that each test starts with a freshly reset item
            select = TP.byId('select5', windowContext);
            select.deselectAll();
        });

    //  ---

    this.afterEach(
        async function(test, suite) {
            //  'Click away' from the currently selected popup to get it
            //  to close.
            await driver.constructSequence().
                            click(windowContext.getDocument().getBody()).
                            run();
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

    this.it('xctrls:select - addSelection', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        select = TP.byId('select5', windowContext);

        //  ---

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        //  (property defaults to 'value')
        select.deselectAll();
        select.addSelection('bar');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(1));

        //  'value' property
        select.deselectAll();
        select.addSelection('foo', 'value');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(0));
    });

    //  ---

    this.it('xctrls:select - removeSelection', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        select = TP.byId('select5', windowContext);

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        //  (property defaults to 'value')
        select.deselectAll();
        select.addSelection('foo');
        select.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(0));

        select.deselectAll();
        select.addSelection('bar');
        select.removeSelection('bar');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac());

        //  'value' property
        select.deselectAll();
        select.addSelection('foo');
        select.removeSelection('baz', 'value');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(0));

        select.deselectAll();
        select.addSelection('bar');
        select.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac());
    });

    //  ---

    this.it('xctrls:select - select', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        select = TP.byId('select5', windowContext);

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        select.deselectAll();
        select.select('bar');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(1));
        select.select('baz');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(2));

        select.deselectAll();
        select.select(TP.ac('foo'));
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(0));
    });

    //  ---

    this.it('xctrls:select - select with RegExp', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        select = TP.byId('select5', windowContext);

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        select.deselectAll();
        select.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(1));
    });

    //  ---

    this.it('xctrls:select - deselect', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        select = TP.byId('select5', windowContext);

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        select.select('bar');
        select.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac());
        select.select('bar');
        select.deselect('baz');
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(1));
    });

    //  ---

    this.it('xctrls:select - deselect with RegExp', async function(test, options) {

        var select,
            firstSelectItem,
            selectList;

        select = TP.byId('select5', windowContext);

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        select.select('bar');
        select.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac());
        select.select('bar');
        select.deselect(/fo/);
        test.assert.isEqualTo(getSelectedIndices(select), TP.ac(1));
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.select.Type.describe('TP.xctrls.select: data binding',
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

            loc = '~lib_test/src/xctrls/xctrls_select.xhtml';
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

    this.it('xctrls:select - initial setup', async function(test, options) {

        var select,

            modelObj,
            firstSelectItem,

            selectList;

        select = TP.byId('select5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  ---

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            select.get('value'),
            'bar');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'bar');
    });

    //  ---

    this.it('xctrls:select - change value via user interaction', async function(test, options) {

        var select,

            modelObj,
            firstSelectItem,
            selectList;

        select = TP.byId('select5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        await driver.constructSequence().
                        click(select).
                        run();

        selectList = select.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstSelectItem = selectList.get('allItems').first();
                    return firstSelectItem;
                },
                TP.gid(selectList),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(firstSelectItem).
                        run();

        test.assert.isEqualTo(
            select.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'foo');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
