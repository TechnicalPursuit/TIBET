//  ========================================================================
//  xctrls:combo
//  ========================================================================

TP.xctrls.combo.Type.describe('TP.xctrls.combo: manipulation',
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

            loc = '~lib_test/src/xctrls/xctrls_combo.xhtml';
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

    this.it('Focusing', function(test, options) {

        var combo;

        combo = TP.byId('combo1', windowContext);

        //  Change the focus via 'direct' method

        test.getDriver().constructSequence().
            sendEvent(TP.hc('type', 'focus'), combo).
            run();

        test.chain(
            function() {

                test.assert.hasAttribute(combo, 'pclass:focus');

                test.assert.didSignal(combo, 'TP.sig.UIFocus');
                test.assert.didSignal(combo, 'TP.sig.UIDidFocus');
            });
    });

    //  ---

    this.it('Activation - mouse', function(test, options) {

        var combo,
            firstComboItem;

        //  Change the content via 'user' interaction

        combo = TP.byId('combo1', windowContext);

        //  Individual mousedown/mouseup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseDown(combo).
                    run();
            });

        test.chain(
            function() {
                test.assert.hasAttribute(combo, 'pclass:active');

                test.assert.didSignal(combo, 'TP.sig.UIActivate');
                test.assert.didSignal(combo, 'TP.sig.UIDidActivate');
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');

                test.andWaitFor(firstComboItem, 'TP.sig.UIFocus');
            });

        test.chain(
            function() {
                test.assert.hasAttribute(firstComboItem, 'pclass:focus');

                test.assert.didSignal(firstComboItem, 'TP.sig.UIFocus');
                test.assert.didSignal(firstComboItem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseUp(combo).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(combo, 'pclass:active');

                test.assert.didSignal(combo, 'TP.sig.UIDeactivate');
                test.assert.didSignal(combo, 'TP.sig.UIDidDeactivate');

                test.refute.hasAttribute(firstComboItem, 'pclass:focus');

                test.assert.didSignal(firstComboItem, 'TP.sig.UIBlur');
                test.assert.didSignal(firstComboItem, 'TP.sig.UIDidBlur');

                test.getSuite().resetSignalTracking();
            });

        //  click

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {

                //  Don't test the attribute here - it will already have been
                //  removed.

                test.assert.didSignal(combo, 'TP.sig.UIActivate');
                test.assert.didSignal(combo, 'TP.sig.UIDidActivate');

                test.assert.didSignal(combo, 'TP.sig.UIDeactivate');
                test.assert.didSignal(combo, 'TP.sig.UIDidDeactivate');
            });
    });

    //  ---

    this.it('Activation - keyboard', function(test, options) {

        var combo,
            firstComboItem;

        //  Change the content via 'user' interaction

        combo = TP.byId('combo1', windowContext);
        combo.focus();

        //  Individual keydown/keyup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(combo, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.assert.hasAttribute(combo, 'pclass:active');

                test.assert.didSignal(combo, 'TP.sig.UIActivate');
                test.assert.didSignal(combo, 'TP.sig.UIDidActivate');
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                keyUp(combo, 'Enter').
                run();
            });

        //  popups focus as part of the key *up*

        test.chain(
            function() {
                test.assert.hasAttribute(firstComboItem, 'pclass:focus');

                test.assert.didSignal(firstComboItem, 'TP.sig.UIFocus');
                test.assert.didSignal(firstComboItem, 'TP.sig.UIDidFocus');
            });

        test.chain(
            function() {
                test.refute.hasAttribute(combo, 'pclass:active');

                test.assert.didSignal(combo, 'TP.sig.UIDeactivate');
                test.assert.didSignal(combo, 'TP.sig.UIDidDeactivate');

                //  The picker is still up and the first item is focused -
                //  that's how it works. It's sticky.
                test.assert.hasAttribute(firstComboItem, 'pclass:focus');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(firstComboItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyUp(firstComboItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstComboItem, 'pclass:focus');

                test.assert.didSignal(firstComboItem, 'TP.sig.UIBlur');
                test.assert.didSignal(firstComboItem, 'TP.sig.UIDidBlur');
            });
    });

    //  ---

    this.it('Disabled behavior', function(test, options) {

        var combo,
            firstComboItem;

        //  All of these mechanisms to 'activate' the control should fail - it's
        //  disabled.

        //  Disable it
        combo = TP.byId('combo1', windowContext);
        combo.setAttrDisabled(true);

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                test.assert.isDisabled(firstComboItem);
            });

        //  --- Focus

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    sendEvent(TP.hc('type', 'focus'), firstComboItem).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstComboItem, 'pclass:focus');

                test.refute.didSignal(firstComboItem, 'TP.sig.UIFocus');
                test.refute.didSignal(firstComboItem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual mousedown/mouseup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseDown(combo).
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(combo, 'pclass:active');

                test.refute.didSignal(combo, 'TP.sig.UIActivate');
                test.refute.didSignal(combo, 'TP.sig.UIDidActivate');
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstComboItem, 'pclass:focus');

                test.refute.didSignal(firstComboItem, 'TP.sig.UIFocus');
                test.refute.didSignal(firstComboItem, 'TP.sig.UIDidFocus');

                test.getSuite().resetSignalTracking();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    mouseUp(combo).
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(combo, 'TP.sig.UIDeactivate');
                test.refute.didSignal(combo, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- click

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                test.refute.didSignal(combo, 'TP.sig.UIActivate');
                test.refute.didSignal(combo, 'TP.sig.UIDidActivate');

                test.refute.didSignal(combo, 'TP.sig.UIDeactivate');
                test.refute.didSignal(combo, 'TP.sig.UIDidDeactivate');

                test.getSuite().resetSignalTracking();
            });

        //  --- Individual keydown/keyup

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(combo, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(combo, 'pclass:active');

                test.refute.didSignal(combo, 'TP.sig.UIActivate');
                test.refute.didSignal(combo, 'TP.sig.UIDidActivate');
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                keyUp(combo, 'Enter').
                run();
            });

        //  popups focus as part of the key *up*

        test.chain(
            function() {
                test.refute.hasAttribute(firstComboItem, 'pclass:focus');

                test.refute.didSignal(firstComboItem, 'TP.sig.UIFocus');
                test.refute.didSignal(firstComboItem, 'TP.sig.UIDidFocus');
            });

        test.chain(
            function() {
                test.refute.didSignal(combo, 'TP.sig.UIDeactivate');
                test.refute.didSignal(combo, 'TP.sig.UIDidDeactivate');

                //  The picker is still up and the first item is focused -
                //  that's how it works. It's sticky.
                test.refute.hasAttribute(firstComboItem, 'pclass:focus');
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyDown(firstComboItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    keyUp(firstComboItem, 'Enter').
                    run();
            });

        test.chain(
            function() {
                test.refute.hasAttribute(firstComboItem, 'pclass:focus');

                test.refute.didSignal(firstComboItem, 'TP.sig.UIBlur');
                test.refute.didSignal(firstComboItem, 'TP.sig.UIDidBlur');
            });
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.combo.Type.describe('TP.xctrls.combo: get/set value',
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

            loc = '~lib_test/src/xctrls/xctrls_combo.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
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
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('xctrls:combo - setting value to scalar values', function(test, options) {

        var combo,
            firstComboItem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        combo = TP.byId('combo4', windowContext);

        //  ---

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
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
    });

    //  ---

    this.it('xctrls:combo - setting value to complex object values', function(test, options) {

        var combo,
            firstComboItem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        combo = TP.byId('combo4', windowContext);

        //  ---

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
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
    });

    //  ---

    this.it('xctrls:combo - setting value to markup', function(test, options) {

        var combo,
            firstComboItem,
            value;

        combo = TP.byId('combo4', windowContext);

        //  ---

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
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
                test.assert.isNull(value);

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
});

//  ------------------------------------------------------------------------

TP.xctrls.combo.Type.describe('TP.xctrls.combo: selection management',
function() {

    var getSelectedIndices,

        unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    getSelectedIndices = function(aTPElem) {

        var comboList,
            itemIndices;

        comboList = aTPElem.get('popupContentFirstElement');

        itemIndices = comboList.get('listitems').collect(
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

            loc = '~lib_test/src/xctrls/xctrls_combo.xhtml';
            loadURI = TP.uc(loc);
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, suite) {

            var combo;

            //  Make sure that each test starts with a freshly reset item
            combo = TP.byId('combo4', windowContext);
            combo.deselectAll();
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

    this.it('xctrls:combo - addSelection', function(test, options) {

        var combo,
            firstComboItem;

        combo = TP.byId('combo4', windowContext);

        //  ---

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                //  (property defaults to 'value')
                combo.deselectAll();
                combo.addSelection('bar');
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));

                //  'value' property
                combo.deselectAll();
                combo.addSelection('foo', 'value');
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(0));
            });
    });

    //  ---

    this.it('xctrls:combo - removeSelection', function(test, options) {

        var combo,
            firstComboItem;

        combo = TP.byId('combo5', windowContext);

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
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
    });

    //  ---

    this.it('xctrls:combo - combo', function(test, options) {

        var combo,
            firstComboItem;

        combo = TP.byId('combo5', windowContext);

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                combo.deselectAll();
                combo.select('bar');
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));
                combo.select('baz');
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(2));

                combo.deselectAll();
                combo.select(TP.ac('foo'));
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(0));
            });
    });

    //  ---

    this.it('xctrls:combo - combo with RegExp', function(test, options) {

        var combo,
            firstComboItem;

        combo = TP.byId('combo5', windowContext);

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                combo.deselectAll();
                combo.select(/ba/);
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));
            });
    });

    //  ---

    this.it('xctrls:combo - deselect', function(test, options) {

        var combo,
            firstComboItem;

        combo = TP.byId('combo5', windowContext);

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                combo.select('bar');
                combo.deselect('bar');
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac());
                combo.select('bar');
                combo.deselect('baz');
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));
            });
    });

    //  ---

    this.it('xctrls:combo - deselect with RegExp', function(test, options) {

        var combo,
            firstComboItem;

        combo = TP.byId('combo5', windowContext);

        test.chain(
            function() {
                test.getDriver().constructSequence().
                    click(combo).
                    run();
            });

        test.chain(
            function() {
                var comboList;

                comboList = combo.get('popupContentFirstElement');

                test.andIfNotValidWaitFor(
                        function() {
                            firstComboItem = comboList.get('listitems').first();
                            return firstComboItem;
                        },
                        TP.gid(comboList),
                        'TP.sig.DidRenderData');
            });

        test.chain(
            function() {
                combo.select('bar');
                combo.deselect(/ba/);
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac());
                combo.select('bar');
                combo.deselect(/fo/);
                test.assert.isEqualTo(getSelectedIndices(combo), TP.ac(1));
            });
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
