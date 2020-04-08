//  ========================================================================
//  xctrls:table
//  ========================================================================

TP.xctrls.table.Type.describe('TP.xctrls.table: manipulation',
function() {

    var unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            var loc,
                tableID;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);

            tableID = TP.computeOriginID(windowContext, loc, 'table5');
            this.andWaitFor(tableID, 'TP.sig.DidRender');

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

        var table,
            firsttableItem;

        table = TP.byId('table1', windowContext);

        firsttableItem = table.get('rowitems').first();

        //  Change the focus via 'direct' method

        test.getDriver().constructSequence().
            sendEvent(TP.hc('type', 'focus'), table).
            run();

        test.chain(
            function() {

                test.assert.hasAttribute(firsttableItem, 'pclass:focus');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIFocus');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidFocus');
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var table,
            firsttableItem;

        //  Change the content via 'user' interaction

        table = TP.byId('table1', windowContext);

        firsttableItem = table.get('rowitems').first();

        //  Individual mousedown/mouseup

        test.getDriver().constructSequence().
            mouseDown(firsttableItem).
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(firsttableItem, 'pclass:active');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.getDriver().constructSequence().
            mouseUp(firsttableItem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:active');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  click

        test.getDriver().constructSequence().
            click(firsttableItem).
            run();

        test.andWait(500);

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var table,
            firsttableItem;

        //  Change the content via 'user' interaction

        table = TP.byId('table1', windowContext);

        firsttableItem = table.get('rowitems').first();

        //  Individual keydown/keyup

        test.getDriver().constructSequence().
            keyDown(firsttableItem, 'Enter').
            run();

        test.chain(
            function() {
                test.assert.hasAttribute(firsttableItem, 'pclass:active');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.getDriver().constructSequence().
            keyUp(firsttableItem, 'Enter').
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:active');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var table,
            firsttableItem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        table = TP.byId('table1', windowContext);
        table.setAttrDisabled(true);

        table.render();

        firsttableItem = table.get('rowitems').first();

        test.assert.isDisabled(TP.unwrap(firsttableItem));

        //  --- Focus

        test.getDriver().constructSequence().
            sendEvent(TP.hc('type', 'focus'), firsttableItem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:focus');

                test.refute.didSignal(firsttableItem, 'TP.sig.UIFocus');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        test.getDriver().constructSequence().
            mouseDown(firsttableItem).
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:active');

                test.refute.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidActivate');
            });

        test.getDriver().constructSequence().
            mouseUp(firsttableItem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        test.getDriver().constructSequence().
            click(firsttableItem).
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        test.getDriver().constructSequence().
            keyDown(firsttableItem, 'Enter').
            run();

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:active');

                test.refute.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.getDriver().constructSequence().
            keyUp(firsttableItem, 'Enter').
            run();

        test.andWait(500);

        test.chain(
            function() {
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');
            });
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Type.describe('TP.xctrls.table: get/set value',
function() {

    var testData,

        unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            var loc,
                tableID;

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);

            tableID = TP.computeOriginID(windowContext, loc, 'table5');
            this.andWaitFor(tableID, 'TP.sig.DidRender');
        });

    //  ---

    this.beforeEach(
        function() {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('table4', windowContext);
            tpElem.deselectAll();

            tpElem = TP.byId('table5', windowContext);
            tpElem.deselectAll();
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

    this.it('xctrls:table - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('table4', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  String (multiple)
        tpElem.set('value', 'Smith;Joe;42');
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.refute.isEmpty(value);

        //  reset
        tpElem.deselectAll();

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);
    });

    //  ---

    this.it('xctrls:table - setting value to complex object values', function(test, options) {

        var tableWithHashes,
            tableWithArrays,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tableWithHashes = TP.byId('table4', windowContext);
        tableWithArrays = TP.byId('table5', windowContext);

        //  RegExp
        tableWithHashes.set('value', testData.at('RegExp'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('RegExp'));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Date
        tableWithHashes.set('value', testData.at('Date'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('Date'));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Array
        tableWithHashes.set('value', TP.ac('Smith', 'Joe', 42));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        //  tableWithHashes is single selection.
        test.assert.isEqualTo(value, TP.ac('Smith', 'Joe', 42));

        //  reset
        tableWithHashes.deselectAll();

        tableWithArrays.set('value', TP.ac('Smith', 'Joe', 42));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        //  tableWithArrays is multiple selection.
        test.assert.isEqualTo(value, TP.ac(TP.ac('Smith', 'Joe', 42)));

        //  reset
        tableWithArrays.deselectAll();

        //  Object
        tableWithHashes.set('value',
            {
                foo: 'baz'
            });
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  TP.core.Hash
        tableWithHashes.set('value',
            TP.hc('last_name', 'Jones', 'first_name', 'Jeff', 'age', 41));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        //  tableWithHashes is single selection.
        test.assert.isEqualTo(
            value, TP.ac('Jones', 'Jeff', 41));

        tableWithArrays.set('value',
            TP.hc('last_name', 'Jones', 'first_name', 'Jeff', 'age', 41));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        //  tableWithArrays is multiple selection.
        test.assert.isEqualTo(
            value,
            TP.ac(TP.ac('Jones', 'Jeff', 41)));
    });

    //  ---

    this.it('xctrls:table - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('table4', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Nodetable
        tpElem.set('value', testData.at('Nodetable'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);
    });

    //  ---

    this.it('xctrls:table (multiple) - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('table5', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);
    });

    //  ---

    this.it('xctrls:table (multiple) - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('table5', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Array
        tpElem.set('value', TP.ac(TP.ac('Smith', 'Joe', 42),
                                    TP.ac('Jones', 'Jeff', 41)));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac(TP.ac('Smith', 'Joe', 42),
                                        TP.ac('Jones', 'Jeff', 41)));

        //  reset
        tpElem.deselectAll();

        //  Object
        tpElem.set('value',
            {
                foo: 'baz'
            });
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  TP.core.Hash
        tpElem.set('value', TP.ac(
                                TP.ac('Smith', 'Joe', 42),
                                TP.ac('Jones', 'Jeff', 41)));

        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac(TP.ac('Smith', 'Joe', 42),
                                        TP.ac('Jones', 'Jeff', 41)));
    });

    //  ---

    this.it('xctrls:table (multiple) - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('table5', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Nodetable
        tpElem.set('value', testData.at('Nodetable'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Type.describe('TP.xctrls.table: selection management',
function() {

    var getSelectedIndices,

        unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function(aTPElem) {

        var itemIndices;

        itemIndices = aTPElem.get('rowitems').collect(
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

            var loc,
                tableID;

            TP.$$setupCommonObjectValues();

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);

            tableID = TP.computeOriginID(windowContext, loc, 'table5');
            this.andWaitFor(tableID, 'TP.sig.DidRender');
        });

    //  ---

    this.beforeEach(
        function() {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('table5', windowContext);
            tpElem.deselectAll();
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

    this.it('xctrls:table - addSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table5', windowContext);

        //  ---

        //  allowsMultiples

        //  table5 is configured to allow multiples
        test.assert.isTrue(tpElem.allowsMultiples());

        //  ---

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.addSelection(
                TP.ac(TP.ac('Johnson', 'Sam', 23),
                        TP.ac('Williams', 'Monica', 51)));

        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        //  'value' property
        tpElem.deselectAll();
        tpElem.addSelection(
                TP.ac(TP.ac('Smith', 'Joe', 42),
                        TP.ac('Johnson', 'Sam', 23)),
                'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));
    });

    //  ---

    this.it('xctrls:table - removeSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table5', windowContext);

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.addSelection(
                TP.ac(TP.ac('Smith', 'Joe', 42),
                        TP.ac('Johnson', 'Sam', 23)));
        tpElem.removeSelection(TP.ac('Taylor', 'Frank', 71));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        tpElem.deselectAll();
        tpElem.addSelection(
                TP.ac(TP.ac('Smith', 'Joe', 42),
                        TP.ac('Johnson', 'Sam', 23)));
        tpElem.removeSelection(TP.ac(TP.ac('Smith', 'Joe', 42)));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));

        //  'value' property
        tpElem.deselectAll();
        tpElem.addSelection(
                TP.ac(TP.ac('Smith', 'Joe', 42),
                        TP.ac('Williams', 'Monica', 51)));
        tpElem.removeSelection(TP.ac(TP.ac('Johnson', 'Sam', 23)), 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        tpElem.deselectAll();
        tpElem.addSelection(
                TP.ac(TP.ac('Johnson', 'Sam', 23),
                        TP.ac('Williams', 'Monica', 51)));
        tpElem.removeSelection(TP.ac(TP.ac('Johnson', 'Sam', 23)), 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(2));
    });

    //  ---

    this.it('xctrls:table - selectAll', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table5', windowContext);

        tpElem.selectAll();
        test.assert.isEqualTo(
            getSelectedIndices(tpElem),
            TP.ac(0, 1, 2, 3, 4, 5, 6, 7, 8, 9));
    });

    //  ---

    this.it('xctrls:table - select', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table5', windowContext);

        tpElem.deselectAll();
        tpElem.select(TP.ac('Johnson', 'Sam', 23));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));
        tpElem.select(TP.ac('Williams', 'Monica', 51));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        tpElem.deselectAll();
        tpElem.select(
                TP.ac(TP.ac('Smith', 'Joe', 42),
                        TP.ac('Williams', 'Monica', 51)));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));
    });

    //  ---

    this.it('xctrls:table - select with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table5', windowContext);

        tpElem.deselectAll();
        tpElem.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));
    }).skip();

    //  ---

    this.it('xctrls:table - deselect', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table5', windowContext);

        tpElem.selectAll();
        tpElem.deselect(TP.ac('Johnson', 'Sam', 23));
        test.assert.isEqualTo(
            getSelectedIndices(tpElem),
            TP.ac(0, 2, 3, 4, 5, 6, 7, 8, 9));
        tpElem.deselect(TP.ac('Williams', 'Monica', 51));
        test.assert.isEqualTo(
            getSelectedIndices(tpElem),
            TP.ac(0, 3, 4, 5, 6, 7, 8, 9));

        tpElem.selectAll();
        tpElem.deselect(
                TP.ac(
                    TP.ac('Smith', 'Joe', 42),
                    TP.ac('Williams', 'Monica', 51)));
        test.assert.isEqualTo(
            getSelectedIndices(tpElem),
            TP.ac(1, 3, 4, 5, 6, 7, 8, 9));
    });

    //  ---

    this.it('xctrls:table - deselect with RegExp', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table5', windowContext);

        tpElem.selectAll();
        tpElem.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));
    }).skip();

});

//  ------------------------------------------------------------------------

TP.xctrls.table.Type.describe('TP.xctrls.table: data binding - no multiple',
function() {

    var windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            var loc,
                tableID;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);

            tableID = TP.computeOriginID(windowContext, loc, 'table8');
            this.andWaitFor(tableID, 'TP.sig.DidRender');
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

    this.it('xctrls:table - initial setup', function(test, options) {

        var tpElem,

            modelObj;

        tpElem = TP.byId('table8', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tpElem.get('value'),
            TP.ac('bar', 'bar', 2));

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_1')),
            TP.ac('bar', 'bar', 2));
    });

    //  ---

    this.it('xctrls:table - change value via user interaction', function(test, options) {

        var tpElem,

            modelObj,
            tableItem;

        tpElem = TP.byId('table8', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        tableItem = tpElem.get('rowitems').at(0);

        test.getDriver().constructSequence().
            click(tableItem).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tpElem.get('value'),
                    TP.ac('foo', 'foo', 1));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_1')),
                    TP.ac('foo', 'foo', 1));
            });
    });

});

//  ------------------------------------------------------------------------

TP.xctrls.table.Type.describe('TP.xctrls.table: data binding - multiple',
function() {

    var windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            var loc,
                tableID;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);

            tableID = TP.computeOriginID(windowContext, loc, 'table9');
            this.andWaitFor(tableID, 'TP.sig.DidRender');
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

    this.it('xctrls:table - initial setup', function(test, options) {

        var tpElem,

            modelObj;

        tpElem = TP.byId('table9', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        test.assert.isEqualTo(
            tpElem.get('value'),
            TP.ac(
                TP.ac('foo', 'foo', 1),
                TP.ac('baz', 'baz', 3)));

        test.assert.isEqualTo(
            TP.val(modelObj.get('selection_set_2')),
            TP.ac(
                TP.ac('foo', 'foo', 1),
                TP.ac('baz', 'baz', 3)));
    });

    //  ---

    this.it('xctrls:table - change value via user interaction', function(test, options) {

        var tpElem,

            modelObj,
            secondtableItem,
            thirdtableItem;

        tpElem = TP.byId('table9', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        secondtableItem = tpElem.get('rowitems').at(1);

        test.getDriver().constructSequence().
            click(secondtableItem).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tpElem.get('value'),
                    TP.ac(
                        TP.ac('foo', 'foo', 1),
                        TP.ac('baz', 'baz', 3),
                        TP.ac('bar', 'bar', 2)));


                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_2')),
                    TP.ac(
                        TP.ac('foo', 'foo', 1),
                        TP.ac('baz', 'baz', 3),
                        TP.ac('bar', 'bar', 2)));
            });

        thirdtableItem = tpElem.get('rowitems').at(2);

        test.getDriver().constructSequence().
            click(thirdtableItem).
            run();

        test.chain(
            function() {
                test.assert.isEqualTo(
                    tpElem.get('value'),
                    TP.ac(
                        TP.ac('foo', 'foo', 1),
                        TP.ac('bar', 'bar', 2)));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('selection_set_2')),
                    TP.ac(
                        TP.ac('foo', 'foo', 1),
                        TP.ac('bar', 'bar', 2)));
            });
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
