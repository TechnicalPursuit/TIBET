//  ========================================================================
//  xctrls:combo
//  ========================================================================

TP.xctrls.combo.Type.describe('TP.xctrls.combo: manipulation',
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
            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_combo.xhtml';
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

        var combo,
            comboInput;

        combo = TP.byId('combo1', windowContext);

        //  Change the focus via 'direct' method

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), combo).
                        run();

        comboInput = combo.get('comboInput');

        test.assert.hasAttribute(comboInput, 'pclass:focus');

        test.assert.didSignal(comboInput, 'TP.sig.UIFocus');
        test.assert.didSignal(comboInput, 'TP.sig.UIDidFocus');
    });

    //  ---

    this.it('Activation - mouse', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        //  Change the content via 'user' interaction

        combo = TP.byId('combo1', windowContext);

        //  Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(combo).
                        run();

        test.assert.hasAttribute(combo, 'pclass:active');

        test.assert.didSignal(combo, 'TP.sig.UIActivate');
        test.assert.didSignal(combo, 'TP.sig.UIDidActivate');

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        await test.andWaitFor(firstComboItem, 'TP.sig.UIFocus');

        test.assert.hasAttribute(firstComboItem, 'pclass:focus');

        test.assert.didSignal(firstComboItem, 'TP.sig.UIFocus');
        test.assert.didSignal(firstComboItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(combo).
                        run();

        test.refute.hasAttribute(combo, 'pclass:active');

        test.assert.didSignal(combo, 'TP.sig.UIDeactivate');
        test.assert.didSignal(combo, 'TP.sig.UIDidDeactivate');

        test.refute.hasAttribute(firstComboItem, 'pclass:focus');

        test.assert.didSignal(firstComboItem, 'TP.sig.UIBlur');
        test.assert.didSignal(firstComboItem, 'TP.sig.UIDidBlur');

        test.getSuite().resetSignalTracking();

        //  click

        await driver.constructSequence().
                        click(combo).
                        run();

        //  Don't test the attribute here - it will already have been
        //  removed.

        test.assert.didSignal(combo, 'TP.sig.UIActivate');
        test.assert.didSignal(combo, 'TP.sig.UIDidActivate');

        test.assert.didSignal(combo, 'TP.sig.UIDeactivate');
        test.assert.didSignal(combo, 'TP.sig.UIDidDeactivate');
    });

    //  ---

    this.it('Activation - keyboard', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        //  Change the content via 'user' interaction

        combo = TP.byId('combo1', windowContext);
        combo.focus();

        //  Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(combo, 'Enter').
                        run();

        test.assert.hasAttribute(combo, 'pclass:active');

        test.assert.didSignal(combo, 'TP.sig.UIActivate');
        test.assert.didSignal(combo, 'TP.sig.UIDidActivate');

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        keyUp(combo, 'Enter').
                        run();

        //  popups focus as part of the key *up*

        test.assert.hasAttribute(firstComboItem, 'pclass:focus');

        test.assert.didSignal(firstComboItem, 'TP.sig.UIFocus');
        test.assert.didSignal(firstComboItem, 'TP.sig.UIDidFocus');

        test.refute.hasAttribute(combo, 'pclass:active');

        test.assert.didSignal(combo, 'TP.sig.UIDeactivate');
        test.assert.didSignal(combo, 'TP.sig.UIDidDeactivate');

        //  The picker is still up and the first item is focused -
        //  that's how it works. It's sticky.
        test.assert.hasAttribute(firstComboItem, 'pclass:focus');

        await driver.constructSequence().
                        keyDown(firstComboItem, 'Enter').
                        run();

        await driver.constructSequence().
                        keyUp(firstComboItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstComboItem, 'pclass:focus');

        test.assert.didSignal(firstComboItem, 'TP.sig.UIBlur');
        test.assert.didSignal(firstComboItem, 'TP.sig.UIDidBlur');
    });

    //  ---

    this.it('Disabled behavior', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        combo = TP.byId('combo1', windowContext);
        combo.setAttrDisabled(true);

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        test.assert.isDisabled(firstComboItem);

        //  --- Focus

        await driver.constructSequence().
                        sendEvent(TP.hc('type', 'focus'), firstComboItem).
                        run();

        test.refute.hasAttribute(firstComboItem, 'pclass:focus');

        test.refute.didSignal(firstComboItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstComboItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        //  --- Individual mousedown/mouseup

        await driver.constructSequence().
                        mouseDown(combo).
                        run();

        test.refute.hasAttribute(combo, 'pclass:active');

        test.refute.didSignal(combo, 'TP.sig.UIActivate');
        test.refute.didSignal(combo, 'TP.sig.UIDidActivate');

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        test.refute.hasAttribute(firstComboItem, 'pclass:focus');

        test.refute.didSignal(firstComboItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstComboItem, 'TP.sig.UIDidFocus');

        test.getSuite().resetSignalTracking();

        await driver.constructSequence().
                        mouseUp(combo).
                        run();

        test.refute.didSignal(combo, 'TP.sig.UIDeactivate');
        test.refute.didSignal(combo, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- click

        await driver.constructSequence().
                        click(combo).
                        run();

        test.refute.didSignal(combo, 'TP.sig.UIActivate');
        test.refute.didSignal(combo, 'TP.sig.UIDidActivate');

        test.refute.didSignal(combo, 'TP.sig.UIDeactivate');
        test.refute.didSignal(combo, 'TP.sig.UIDidDeactivate');

        test.getSuite().resetSignalTracking();

        //  --- Individual keydown/keyup

        await driver.constructSequence().
                        keyDown(combo, 'Enter').
                        run();

        test.refute.hasAttribute(combo, 'pclass:active');

        test.refute.didSignal(combo, 'TP.sig.UIActivate');
        test.refute.didSignal(combo, 'TP.sig.UIDidActivate');

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        keyUp(combo, 'Enter').
                        run();

        //  popups focus as part of the key *up*

        test.refute.hasAttribute(firstComboItem, 'pclass:focus');

        test.refute.didSignal(firstComboItem, 'TP.sig.UIFocus');
        test.refute.didSignal(firstComboItem, 'TP.sig.UIDidFocus');

        test.refute.didSignal(combo, 'TP.sig.UIDeactivate');
        test.refute.didSignal(combo, 'TP.sig.UIDidDeactivate');

        //  The picker is still up and the first item is focused -
        //  that's how it works. It's sticky.
        test.refute.hasAttribute(firstComboItem, 'pclass:focus');

        await driver.constructSequence().
                        keyDown(firstComboItem, 'Enter').
                        run();

        await driver.constructSequence().
                        keyUp(firstComboItem, 'Enter').
                        run();

        test.refute.hasAttribute(firstComboItem, 'pclass:focus');

        test.refute.didSignal(firstComboItem, 'TP.sig.UIBlur');
        test.refute.didSignal(firstComboItem, 'TP.sig.UIDidBlur');
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.combo.Type.describe('TP.xctrls.combo: get/set value',
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

            loc = '~lib_test/src/xctrls/xctrls_combo.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, suite) {

            var combo;

            //  Make sure that each test starts with a freshly reset item
            combo = TP.byId('combo4', windowContext);
            combo.deselectAll();

            combo = TP.byId('combo5', windowContext);
            combo.deselectAll();
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

    this.it('xctrls:combo - setting value to scalar values', async function(test, options) {

        var combo,
            firstComboItem,
            value,
            comboList;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        combo = TP.byId('combo4', windowContext);

        //  ---

        await driver.constructSequence().
                        click(combo).
                        run();


        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        //  undefined
        combo.set('value', testData.at(TP.UNDEF));
        value = combo.get('value');
        test.assert.isNull(value);

        //  null
        combo.set('value', testData.at(TP.NULL));
        value = combo.get('value');
        test.assert.isNull(value);

        //  String
        combo.set('value', testData.at('String'));
        value = combo.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        combo.set('value', testData.at('Number'));
        value = combo.get('value');
        test.assert.isNull(value);

        //  Boolean
        combo.set('value', testData.at('Boolean'));
        value = combo.get('value');
        test.assert.isNull(value);
    });

    //  ---

    this.it('xctrls:combo - setting value to complex object values', async function(test, options) {

        var combo,
            firstComboItem,
            value,
            comboList;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        combo = TP.byId('combo4', windowContext);

        //  ---

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        //  RegExp
        combo.set('value', testData.at('RegExp'));
        value = combo.get('value');
        test.assert.isNull(value);

        //  Date
        combo.set('value', testData.at('Date'));
        value = combo.get('value');
        test.assert.isNull(value);

        //  Array
        combo.set('value', TP.ac('foo', 'bar', 'baz'));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  Object
        combo.set('value',
            {
                foo: 'baz'
            });
        value = combo.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        combo.set('value', TP.hc('foo', 'bar'));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('xctrls:combo - setting value to markup', async function(test, options) {

        var combo,
            firstComboItem,
            value,
            comboList;

        combo = TP.byId('combo4', windowContext);

        //  ---

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        //  XMLDocument
        combo.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = combo.get('value');
        test.assert.isNull(value);

        //  XMLElement
        combo.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        combo.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        combo.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        combo.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        combo.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        combo.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        combo.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  NodeList
        combo.set('value', testData.at('NodeList'));
        value = combo.get('value');
        test.assert.isNull(value);

        //  NamedNodeMap
        combo.set('value', testData.at('NamedNodeMap'));
        value = combo.get('value');
        test.assert.isEqualTo(value, 'baz');
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.combo.Type.describe('TP.xctrls.combo: selection management',
function() {

    var getSelectedIndices,

        unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function(aTPElem) {

        var comboList,
            itemIndices;

        comboList = aTPElem.get('popupContentFirstElement');

        itemIndices = comboList.get('allItems').collect(
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

            loc = '~lib_test/src/xctrls/xctrls_combo.xhtml';
            loadURI = TP.uc(loc);
            await driver.setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, suite) {

            var combo;

            //  Make sure that each test starts with a freshly reset item
            combo = TP.byId('combo5', windowContext);
            combo.deselectAll();
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

    this.it('xctrls:combo - addSelection', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        combo = TP.byId('combo5', windowContext);

        //  ---

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        //  (property defaults to 'value')
        combo.deselectAll();
        combo.addSelection('bar');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));

        //  'value' property
        combo.deselectAll();
        combo.addSelection('foo', 'value');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(0));
    });

    //  ---

    this.it('xctrls:combo - removeSelection', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        combo = TP.byId('combo5', windowContext);

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        //  (property defaults to 'value')
        combo.deselectAll();
        combo.addSelection('foo');
        combo.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(0));

        combo.deselectAll();
        combo.addSelection('bar');
        combo.removeSelection('bar');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac());

        //  'value' property
        combo.deselectAll();
        combo.addSelection('foo');
        combo.removeSelection('baz', 'value');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(0));

        combo.deselectAll();
        combo.addSelection('bar');
        combo.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac());
    });

    //  ---

    this.it('xctrls:combo - combo', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        combo = TP.byId('combo5', windowContext);

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        combo.deselectAll();
        combo.select('bar');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));
        combo.select('baz');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(2));

        combo.deselectAll();
        combo.select(TP.ac('foo'));
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(0));
    });

    //  ---

    this.it('xctrls:combo - combo with RegExp', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        combo = TP.byId('combo5', windowContext);

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        combo.deselectAll();
        combo.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));
    });

    //  ---

    this.it('xctrls:combo - deselect', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        combo = TP.byId('combo5', windowContext);

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        combo.select('bar');
        combo.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac());
        combo.select('bar');
        combo.deselect('baz');
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));
    });

    //  ---

    this.it('xctrls:combo - deselect with RegExp', async function(test, options) {

        var combo,
            firstComboItem,
            comboList;

        combo = TP.byId('combo5', windowContext);

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        combo.select('bar');
        combo.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac());
        combo.select('bar');
        combo.deselect(/fo/);
        test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.combo.Type.describe('TP.xctrls.combo: data binding',
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

            loc = '~lib_test/src/xctrls/xctrls_combo.xhtml';
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

    this.it('xctrls:combo - initial setup', async function(test, options) {

        var combo,

            modelObj,
            firstComboItem,
            comboList;

        combo = TP.byId('combo5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  ---

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        test.assert.isEqualTo(
            combo.get('value'),
            'bar');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'bar');
    });

    //  ---

    this.it('xctrls:combo - change value via user interaction', async function(test, options) {

        var combo,

            modelObj,
            firstComboItem,
            comboList;

        combo = TP.byId('combo5', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        await driver.constructSequence().
                        click(combo).
                        run();

        comboList = combo.get('popupContentFirstElement');

        await test.andIfNotValidWaitFor(
                function() {
                    firstComboItem = comboList.get('allItems').first();
                    return firstComboItem;
                },
                TP.gid(comboList),
                'TP.sig.DidRenderData');

        await driver.constructSequence().
                        click(firstComboItem).
                        run();

        test.assert.isEqualTo(
            combo.get('value'),
            'foo');

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            'foo');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
