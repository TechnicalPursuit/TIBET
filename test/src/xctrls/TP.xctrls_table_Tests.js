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
        function(suite, options) {

            var loc;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
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

        var table,
            firsttableItem;

        table = TP.byId('table1', windowContext);

        test.andIfNotValidWaitFor(
                function() {
                    firsttableItem = table.get('rows').first();
                    return firsttableItem;
                },
                TP.gid(table),
                'TP.sig.DidRenderData');

        //  Change the focus via 'direct' method

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    sendEvent(TP.hc('type', 'focus'), table).
                    run();
            });

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

        test.andIfNotValidWaitFor(
                function() {
                    firsttableItem = table.get('rows').first();
                    return firsttableItem;
                },
                TP.gid(table),
                'TP.sig.DidRenderData');

        //  Individual mousedown/mouseup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseDown(firsttableItem).
                    run();
            });

        test.chain(
            function() {
                test.assert.hasAttribute(firsttableItem, 'pclass:active');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseUp(firsttableItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:active');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  click

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(firsttableItem).
                    run();
            });

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

        test.andIfNotValidWaitFor(
                function() {
                    firsttableItem = table.get('rows').first();
                    return firsttableItem;
                },
                TP.gid(table),
                'TP.sig.DidRenderData');

        //  Individual keydown/keyup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(firsttableItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.assert.hasAttribute(firsttableItem, 'pclass:active');

                test.assert.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.assert.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyUp(firsttableItem, 'Enter').
                    run();
            });

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

        test.andIfNotValidWaitFor(
                function() {
                    firsttableItem = table.get('rows').first();
                    return firsttableItem;
                },
                TP.gid(table),
                'TP.sig.DidRenderData');

        test.assert.isDisabled(firsttableItem);

        //  --- Focus

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    sendEvent(TP.hc('type', 'focus'), firsttableItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:focus');

                test.refute.didSignal(firsttableItem, 'TP.sig.UIFocus');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseDown(firsttableItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:active');

                test.refute.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidActivate');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseUp(firsttableItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(firsttableItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.refute.didSignal(firsttableItem, 'TP.sig.UIDeactivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(firsttableItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firsttableItem, 'pclass:active');

                test.refute.didSignal(firsttableItem, 'TP.sig.UIActivate');
                test.refute.didSignal(firsttableItem, 'TP.sig.UIDidActivate');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyUp(firsttableItem, 'Enter').
                    run();
            });

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
        function(suite, options) {

            var loc;

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('table4', windowContext);
            tpElem.deselectAll();

            tpElem = TP.byId('table5', windowContext);
            tpElem.deselectAll();

            tpElem = TP.byId('table6', windowContext);
            tpElem.deselectAll();

            tpElem = TP.byId('table7', windowContext);
            tpElem.deselectAll();
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

    this.it('xctrls:table - setting value to scalar values', function(test, options) {

        var tableWithHashes,
            tableWithArrays,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tableWithHashes = TP.byId('table4', windowContext);
        tableWithArrays = TP.byId('table5', windowContext);

        //  undefined
        tableWithHashes.set('value', testData.at(TP.UNDEF));
        value = tableWithHashes.get('value');
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at(TP.UNDEF));
        value = tableWithArrays.get('value');
        test.assert.isEmpty(value);

        //  null
        tableWithHashes.set('value', testData.at(TP.NULL));
        value = tableWithHashes.get('value');
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at(TP.NULL));
        value = tableWithArrays.get('value');
        test.assert.isEmpty(value);

        //  String
        tableWithHashes.set('value', testData.at('String'));
        value = tableWithHashes.get('value');
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('String'));
        value = tableWithArrays.get('value');
        test.assert.isEmpty(value);

        //  String (multiple)
        tableWithHashes.set('value', 'Smith;Joe;42;male');
        value = tableWithHashes.get('value');
        test.refute.isEmpty(value);

        tableWithArrays.set('value', 'Smith;Joe;42');
        value = tableWithArrays.get('value');
        test.refute.isEmpty(value);

        //  reset
        tableWithHashes.deselectAll();
        tableWithArrays.deselectAll();

        //  Number
        tableWithHashes.set('value', testData.at('Number'));
        value = tableWithHashes.get('value');
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('Number'));
        value = tableWithArrays.get('value');
        test.assert.isEmpty(value);

        //  Boolean
        tableWithHashes.set('value', testData.at('Boolean'));
        value = tableWithHashes.get('value');
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('Boolean'));
        value = tableWithArrays.get('value');
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
        tableWithHashes.set('value', TP.ac('Smith', 'Joe', 42, 'male'));
        value = tableWithHashes.get('value');
        test.assert.isEqualTo(value,
            TP.hc('last_name', 'Smith', 'first_name', 'Joe',
                    'age', 42, 'gender', 'male'));

        //  reset
        tableWithHashes.deselectAll();

        tableWithArrays.set('value', TP.ac('Smith', 'Joe', 42));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEqualTo(value, TP.ac('Smith', 'Joe', 42));

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

        tableWithArrays.set('value',
            {
                foo: 'baz'
            });
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  TP.core.Hash
        tableWithHashes.set('value',
            TP.hc('last_name', 'Jones', 'first_name', 'Jeff', 'age', 41, 'gender', 'male'));
        value = tableWithHashes.get('value');
        test.assert.isEqualTo(value,
            TP.hc('last_name', 'Jones', 'first_name', 'Jeff',
                    'age', 41, 'gender', 'male'));

        tableWithArrays.set('value',
            TP.hc('last_name', 'Jones', 'first_name', 'Jeff', 'age', 41));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEqualTo(
            value,
            TP.ac('Jones', 'Jeff', 41));
    });

    //  ---

    this.it('xctrls:table - setting value to markup', function(test, options) {

        var tableWithHashes,
            tableWithArrays,
            value;

        tableWithHashes = TP.byId('table4', windowContext);
        tableWithArrays = TP.byId('table5', windowContext);

        //  XMLDocument
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  XMLElement
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  AttributeNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  TextNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  CDATASectionNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  PINode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  CommentNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  DocumentFragmentNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Nodetable
        tableWithHashes.set('value', testData.at('Nodetable'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('Nodetable'));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  NamedNodeMap
        tableWithHashes.set('value', testData.at('NamedNodeMap'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('NamedNodeMap'));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);
    });

    //  ---

    this.it('xctrls:table (multiple) - setting value to scalar values', function(test, options) {

        var tableWithHashes,
            tableWithArrays,
            value;

        tableWithHashes = TP.byId('table6', windowContext);
        tableWithArrays = TP.byId('table7', windowContext);

        //  undefined
        tableWithHashes.set('value', testData.at(TP.UNDEF));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at(TP.UNDEF));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  null
        tableWithHashes.set('value', testData.at(TP.NULL));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at(TP.NULL));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  String
        tableWithHashes.set('value', testData.at('String'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('String'));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Number
        tableWithHashes.set('value', testData.at('Number'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('Number'));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Boolean
        tableWithHashes.set('value', testData.at('Boolean'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('Boolean'));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);
    });

    //  ---

    this.it('xctrls:table (multiple) - setting value to complex object values', function(test, options) {

        var tableWithHashes,
            tableWithArrays,
            value;

        tableWithHashes = TP.byId('table6', windowContext);
        tableWithArrays = TP.byId('table7', windowContext);

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
        tableWithHashes.set('value',
            TP.ac(
                TP.ac('Smith', 'Joe', 42, 'male'),
                TP.ac('Jones', 'Jeff', 41, 'male')));
        value = tableWithHashes.get('value');
        test.assert.isEqualTo(value,
            TP.ac(
                TP.hc('last_name', 'Smith', 'first_name', 'Joe',
                        'age', 42, 'gender', 'male'),
                TP.hc('last_name', 'Jones', 'first_name', 'Jeff',
                        'age', 41, 'gender', 'male')));

        tableWithArrays.set('value',
            TP.ac(
                TP.ac('Smith', 'Joe', 42),
                TP.ac('Jones', 'Jeff', 41)));
        value = tableWithArrays.get('value');
        test.assert.isEqualTo(value,
            TP.ac(
                TP.ac('Smith', 'Joe', 42),
                TP.ac('Jones', 'Jeff', 41)));

        //  reset
        tableWithHashes.deselectAll();
        tableWithArrays.deselectAll();

        //  Object
        tableWithHashes.set('value',
            {
                foo: 'baz'
            });
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value',
            {
                foo: 'baz'
            });
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  TP.core.Hash
        tableWithHashes.set('value',
            TP.ac(
                TP.hc('last_name', 'Smith', 'first_name', 'Joe', 'age', 42, 'gender', 'male'),
                TP.hc('last_name', 'Jones', 'first_name', 'Jeff', 'age', 41, 'gender', 'male')));

        value = tableWithHashes.get('value');
        test.assert.isEqualTo(value,
            TP.ac(
                TP.hc('last_name', 'Smith', 'first_name', 'Joe',
                        'age', 42, 'gender', 'male'),
                TP.hc('last_name', 'Jones', 'first_name', 'Jeff',
                        'age', 41, 'gender', 'male')));

        tableWithArrays.set('value',
            TP.ac(
                TP.hc('last_name', 'Smith', 'first_name', 'Joe', 'age', 42),
                TP.hc('last_name', 'Jones', 'first_name', 'Jeff', 'age', 41)));
        value = tableWithArrays.get('value');
        test.assert.isEqualTo(value,
            TP.ac(
                TP.ac('Smith', 'Joe', 42),
                TP.ac('Jones', 'Jeff', 41)));
    });

    //  ---

    this.it('xctrls:table (multiple) - setting value to markup', function(test, options) {

        var tableWithHashes,
            tableWithArrays,
            value;

        tableWithHashes = TP.byId('table6', windowContext);
        tableWithArrays = TP.byId('table7', windowContext);

        //  XMLDocument
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  XMLElement
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  AttributeNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  TextNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  CDATASectionNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  PINode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  CommentNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  DocumentFragmentNode
        tableWithHashes.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  Nodetable
        tableWithHashes.set('value', testData.at('Nodetable'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('Nodetable'));
        value = tableWithArrays.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        //  NamedNodeMap
        tableWithHashes.set('value', testData.at('NamedNodeMap'));
        value = tableWithHashes.get('value');
        test.assert.isArray(value);
        test.assert.isEmpty(value);

        tableWithArrays.set('value', testData.at('NamedNodeMap'));
        value = tableWithArrays.get('value');
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

        itemIndices = aTPElem.get('rows').collect(
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

            var loc,
                tableID;

            TP.$$setupCommonObjectValues();

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);

            tableID = TP.computeOriginID(windowContext, loc, 'table7');
            this.andWaitFor(tableID, 'TP.sig.DidRender');
        });

    //  ---

    this.beforeEach(
        function(test, options) {

            var tpElem;

            //  Make sure that each test starts with a freshly reset item
            tpElem = TP.byId('table7', windowContext);
            tpElem.deselectAll();
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

    this.it('xctrls:table - addSelection', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table7', windowContext);

        //  ---

        //  allowsMultiples

        //  table7 is configured to allow multiples
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

        tpElem = TP.byId('table7', windowContext);

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

        tpElem = TP.byId('table7', windowContext);

        tpElem.selectAll();
        test.assert.isEqualTo(
            getSelectedIndices(tpElem),
            TP.ac(0, 1, 2, 3, 4, 5, 6, 7, 8, 9));
    });

    //  ---

    this.it('xctrls:table - select', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table7', windowContext);

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

        tpElem = TP.byId('table7', windowContext);

        tpElem.deselectAll();
        tpElem.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));
    }).skip();

    //  ---

    this.it('xctrls:table - deselect', function(test, options) {

        var tpElem;

        tpElem = TP.byId('table7', windowContext);

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

        tpElem = TP.byId('table7', windowContext);

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
        function(suite, options) {

            var loc;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
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

    this.it('xctrls:table - initial setup', function(test, options) {

        var tpElem,

            modelObj;

        tpElem = TP.byId('table10', windowContext);

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

        tpElem = TP.byId('table10', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        test.andIfNotValidWaitFor(
                function() {
                    tableItem = tpElem.get('rows').first();
                    return tableItem;
                },
                TP.gid(tpElem),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(tableItem).
                    run();
            });

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

    this.it('xctrls:table - change data and re-render', function(test, options) {

        var tpElem,

            modelURI,
            tableItem;

        tpElem = TP.byId('table9', windowContext);

        modelURI = TP.uc('urn:tibet:selection_test_data');

        //  Change the content via 'user' interaction

        test.andIfNotValidWaitFor(
                function() {
                    tableItem = tpElem.get('allItems').first();
                    return tableItem;
                },
                TP.gid(tpElem),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                var rows,
                    items;

                modelURI.setResource(
                    TP.hc(
                        'data',
                        TP.ac(
                            TP.ac('Fluffy', 'Fido', 'Foofy'),
                            TP.ac('Goofy', 'Sneezy', 'Schlumpy'))));

                rows = tpElem.get('rows');

                test.assert.isEqualTo(
                    rows.getSize(),
                    3);

                items = tpElem.get('allItems');

                test.assert.isEqualTo(
                    items.at(0).getLabelText(),
                    'Fluffy');
                test.assert.isEqualTo(
                    items.at(1).getLabelText(),
                    'Fido');
                test.assert.isEqualTo(
                    items.at(2).getLabelText(),
                    'Foofy');
                test.assert.isEqualTo(
                    items.at(3).getLabelText(),
                    'Goofy');
                test.assert.isEqualTo(
                    items.at(4).getLabelText(),
                    'Sneezy');
                test.assert.isEqualTo(
                    items.at(5).getLabelText(),
                    'Schlumpy');
            });

        test.chain(
            function() {
                var modelObj,

                    rows,
                    items;

                modelObj = modelURI.getContent();

                modelObj.at('data').unshift(TP.ac('Fluffy', 'Fido', 'Foofy'));
                modelObj.at('data').push(TP.ac('Goofy', 'Sneezy', 'Schlumpy'));

                modelURI.$changed();

                rows = tpElem.get('rows');

                //  Even though the data set has 4 items, we're only displaying
                //  3 (virtual table).
                test.assert.isEqualTo(
                    rows.getSize(),
                    3);

                items = tpElem.get('allItems');

                test.assert.isEqualTo(
                    items.at(0).getLabelText(),
                    'Fluffy');
                test.assert.isEqualTo(
                    items.at(1).getLabelText(),
                    'Fido');
                test.assert.isEqualTo(
                    items.at(2).getLabelText(),
                    'Foofy');
                test.assert.isEqualTo(
                    items.at(-3).getLabelText(),
                    'Goofy');
                test.assert.isEqualTo(
                    items.at(-2).getLabelText(),
                    'Sneezy');
                test.assert.isEqualTo(
                    items.at(-1).getLabelText(),
                    'Schlumpy');
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
        function(suite, options) {

            var loc;

            windowContext = this.getDriver().get('windowContext');

            loc = '~lib_test/src/xctrls/xctrls_table.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
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

    this.it('xctrls:table - initial setup', function(test, options) {

        var tpElem,

            modelObj;

        tpElem = TP.byId('table12', windowContext);

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

        tpElem = TP.byId('table12', windowContext);

        modelObj = TP.uc('urn:tibet:bound_selection_test_data').getResource().get('result');

        //  Change the content via 'user' interaction

        test.andIfNotValidWaitFor(
                function() {
                    secondtableItem = tpElem.get('rows').at(1);
                    return secondtableItem;
                },
                TP.gid(tpElem),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(secondtableItem).
                    run();
            });

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

        test.andIfNotValidWaitFor(
                function() {
                    thirdtableItem = tpElem.get('rows').at(2);
                    return thirdtableItem;
                },
                TP.gid(tpElem),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(thirdtableItem).
                    run();
            });

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

    this.it('xctrls:table - change data and re-render', function(test, options) {

        var tpElem,

            modelURI,
            tableItem;

        tpElem = TP.byId('table11', windowContext);

        modelURI = TP.uc('urn:tibet:selection_test_data');

        //  Change the content via 'user' interaction

        test.andIfNotValidWaitFor(
                function() {
                    tableItem = tpElem.get('allItems').first();
                    return tableItem;
                },
                TP.gid(tpElem),
                'TP.sig.DidRenderData');

        test.chain(
            function() {
                var rows,
                    items;

                modelURI.setResource(
                    TP.hc(
                        'data',
                        TP.ac(
                            TP.ac('Fluffy', 'Fido', 'Foofy'),
                            TP.ac('Goofy', 'Sneezy', 'Schlumpy'))));

                rows = tpElem.get('rows');

                test.assert.isEqualTo(
                    rows.getSize(),
                    3);

                items = tpElem.get('allItems');

                test.assert.isEqualTo(
                    items.at(0).getLabelText(),
                    'Fluffy');
                test.assert.isEqualTo(
                    items.at(1).getLabelText(),
                    'Fido');
                test.assert.isEqualTo(
                    items.at(2).getLabelText(),
                    'Foofy');
                test.assert.isEqualTo(
                    items.at(3).getLabelText(),
                    'Goofy');
                test.assert.isEqualTo(
                    items.at(4).getLabelText(),
                    'Sneezy');
                test.assert.isEqualTo(
                    items.at(5).getLabelText(),
                    'Schlumpy');
            });

        test.chain(
            function() {
                var modelObj,

                    rows,
                    items;

                modelObj = modelURI.getContent();

                modelObj.at('data').unshift(TP.ac('Fluffy', 'Fido', 'Foofy'));
                modelObj.at('data').push(TP.ac('Goofy', 'Sneezy', 'Schlumpy'));

                modelURI.$changed();

                rows = tpElem.get('rows');

                //  Even though the data set has 4 items, we're only displaying
                //  3 (virtual table).
                test.assert.isEqualTo(
                    rows.getSize(),
                    3);

                items = tpElem.get('allItems');

                test.assert.isEqualTo(
                    items.at(0).getLabelText(),
                    'Fluffy');
                test.assert.isEqualTo(
                    items.at(1).getLabelText(),
                    'Fido');
                test.assert.isEqualTo(
                    items.at(2).getLabelText(),
                    'Foofy');
                test.assert.isEqualTo(
                    items.at(-3).getLabelText(),
                    'Goofy');
                test.assert.isEqualTo(
                    items.at(-2).getLabelText(),
                    'Sneezy');
                test.assert.isEqualTo(
                    items.at(-1).getLabelText(),
                    'Schlumpy');
            });
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
