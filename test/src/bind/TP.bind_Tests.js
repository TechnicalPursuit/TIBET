//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  bind:
//  ========================================================================

TP.bind.XMLNS.Type.describe('bind: parsing binds',
function() {

    this.it('binding attribute parsing tests - non namespaced attributes', function(test, options) {
        var testMarkup,
            info;

        //  NB: These tests test only for 'bind:in', not 'bind:out' or
        //  'bind:io', but they're all subject to the same rules.
        //  Also, note how, for some of these tests, we pass 'true' as a second
        //  parameter - this forces the call to return the 'fully scoped value'

        //  Fully formed URI, no fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo: urn:tibet:foo}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'urn:tibet:foo');

        //  Fully formed URI, with fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo: urn:tibet:foo#tibet(foo)}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'urn:tibet:foo#tibet(foo)');

        //  Fully formed URI, no fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo: urn:tibet:foo, bar: urn:tibet:bar}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'urn:tibet:foo');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar').at('dataExprs').first(), 'urn:tibet:bar');

        //  Fully formed URI, with fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo: urn:tibet:foo#tibet(foo), bar: urn:tibet:bar#tibet(bar)}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar').at('dataExprs').first(), 'urn:tibet:bar#tibet(bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="{foo: #tibet(foo)}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), '#tibet(foo)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="{foo: foo}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'foo');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="{foo: #tibet(foo), bar: #tibet(bar)}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), '#tibet(foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar').at('dataExprs').first(), '#tibet(bar)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="{foo: foo, bar: bar}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'foo');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar').at('dataExprs').first(), 'bar');

        //  Partially formed URI, with fragment (specified pointer scheme), single value, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="{bar: bar}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar').at('dataExprs').first(), 'bar');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="{foo: foo, bar: bar}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'foo');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar').at('dataExprs').first(), 'bar');
    });

    this.it('binding attribute parsing tests - namespaced attributes', function(test, options) {
        var testMarkup,
            info;

        //  NB: These tests test only for 'bind:in', not 'bind:out' or
        //  'bind:io', but they're all subject to the same rules.

        //  Fully formed URI, no fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo|moo: urn:tibet:foo}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), 'urn:tibet:foo');

        //  Fully formed URI, with fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo|moo: urn:tibet:foo#tibet(foo)}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), 'urn:tibet:foo#tibet(foo)');

        //  Fully formed URI, no fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo|moo: urn:tibet:foo, bar|moo: urn:tibet:bar}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), 'urn:tibet:foo');
        test.assert.hasKey(info, 'bar|moo');
        test.assert.isEqualTo(info.at('bar|moo').at('dataExprs').first(), 'urn:tibet:bar');

        //  Fully formed URI, with fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo|moo: urn:tibet:foo#tibet(foo), bar|moo: urn:tibet:bar#tibet(bar)}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar|moo');
        test.assert.isEqualTo(info.at('bar|moo').at('dataExprs').first(), 'urn:tibet:bar#tibet(bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="{foo|moo: #tibet(foo)}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), '#tibet(foo)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="{foo|moo: foo}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), 'foo');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="{foo|moo: #tibet(foo), bar|moo: #tibet(bar)}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), '#tibet(foo)');
        test.assert.hasKey(info, 'bar|moo');
        test.assert.isEqualTo(info.at('bar|moo').at('dataExprs').first(), '#tibet(bar)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="{foo|moo: foo, bar|moo: bar}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), 'foo');
        test.assert.hasKey(info, 'bar|moo');
        test.assert.isEqualTo(info.at('bar|moo').at('dataExprs').first(), 'bar');

        //  Partially formed URI, with fragment (specified pointer scheme), single value, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="{bar|moo: bar}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'bar|moo');
        test.assert.isEqualTo(info.at('bar|moo').at('dataExprs').first(), 'bar');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="{foo|moo: foo, bar|moo: bar}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo|moo');
        test.assert.isEqualTo(info.at('foo|moo').at('dataExprs').first(), 'foo');
        test.assert.hasKey(info, 'bar|moo');
        test.assert.isEqualTo(info.at('bar|moo').at('dataExprs').first(), 'bar');
    });

    this.it('binding attribute parsing tests - literal content', function(test, options) {
        var testMarkup,
            info;

        //  Literal content
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo: \'The canonical name: [[urn:tibet:test_person_xml#tibet(canonicalName)]]\'}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'urn:tibet:test_person_xml#tibet(canonicalName)');

        //  Literal with vars content
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo: \'The canonical name: [[urn:tibet:test_person_xml#tibet($TAG.canonicalName)]]\'}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'urn:tibet:test_person_xml#tibet(.)');

        //  Literal with escaped quotes content
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo: \'The data source\\\'s last name field value uppercased: [[urn:tibet:test_person_xml#tibet(value) .% upperCase]]\'}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'urn:tibet:test_person_xml#tibet(value)');

        //  Literal with vars and escaped quotes content
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="{foo: \'The data source\\\'s last name field value uppercased: [[urn:tibet:test_person_xml#tibet($TAG.(.//lastname).value) .% upperCase]]\'}"/>');
        info = testMarkup.getBindingInfoFrom(
                            'bind:in', testMarkup.getAttribute('bind:in'));
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo').at('dataExprs').first(), 'urn:tibet:test_person_xml#tibet(.)');
    });
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: bind path slicing',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('path slicing - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPathSlicingXML.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    firstNameField1,
                    firstNameField2,
                    firstNameField3,
                    firstNameField4,
                    firstNameField5;

                windowContext = test.getDriver().get('windowContext');

                firstNameField1 = TP.byId('firstNameField1', windowContext);
                firstNameField2 = TP.byId('firstNameField2', windowContext);
                firstNameField3 = TP.byId('firstNameField3', windowContext);
                firstNameField4 = TP.byId('firstNameField4', windowContext);
                firstNameField5 = TP.byId('firstNameField5', windowContext);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.isEqualTo(firstNameField1.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField2.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField3.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField4.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField5.get('value'), 'Joe');

                //  Change the content via 'user' interaction

                //  Field #1

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField1.clearValue();
                    }).
                    sendKeys('Johnny', firstNameField1).
                    sendEvent(TP.hc('type', 'change'), firstNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Johnny');
                    });

                //  Field #2

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField2.clearValue();
                    }).
                    sendKeys('Jimmy', firstNameField2).
                    sendEvent(TP.hc('type', 'change'), firstNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jimmy');
                    });

                //  Field #3

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField3.clearValue();
                    }).
                    sendKeys('Jerry', firstNameField3).
                    sendEvent(TP.hc('type', 'change'), firstNameField3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jerry');
                    });

                //  Field #4

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField4.clearValue();
                    }).
                    sendKeys('Jacob', firstNameField4).
                    sendEvent(TP.hc('type', 'change'), firstNameField4).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jacob');
                    });

                //  Field #5

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField5.clearValue();
                    }).
                    sendKeys('Justin', firstNameField5).
                    sendEvent(TP.hc('type', 'change'), firstNameField5).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Justin');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('path slicing - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPathSlicingJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    firstNameField1,
                    firstNameField2,
                    firstNameField3,
                    firstNameField4,
                    firstNameField5;

                windowContext = test.getDriver().get('windowContext');

                firstNameField1 = TP.byId('firstNameField1', windowContext);
                firstNameField2 = TP.byId('firstNameField2', windowContext);
                firstNameField3 = TP.byId('firstNameField3', windowContext);
                firstNameField4 = TP.byId('firstNameField4', windowContext);
                firstNameField5 = TP.byId('firstNameField5', windowContext);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.isEqualTo(firstNameField1.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField2.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField3.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField4.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField5.get('value'), 'Joe');

                //  Change the content via 'user' interaction

                //  Field #1

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField1.clearValue();
                    }).
                    sendKeys('Johnny', firstNameField1).
                    sendEvent(TP.hc('type', 'change'), firstNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Johnny');
                    });

                //  Field #2

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField2.clearValue();
                    }).
                    sendKeys('Jimmy', firstNameField2).
                    sendEvent(TP.hc('type', 'change'), firstNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jimmy');
                    });

                //  Field #3

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField3.clearValue();
                    }).
                    sendKeys('Jerry', firstNameField3).
                    sendEvent(TP.hc('type', 'change'), firstNameField3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jerry');
                    });

                //  Field #4

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField4.clearValue();
                    }).
                    sendKeys('Jacob', firstNameField4).
                    sendEvent(TP.hc('type', 'change'), firstNameField4).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jacob');
                    });

                //  Field #5

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField5.clearValue();
                    }).
                    sendKeys('Justin', firstNameField5).
                    sendEvent(TP.hc('type', 'change'), firstNameField5).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Justin');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('path slicing - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPathSlicingJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    firstNameField1,
                    firstNameField2,
                    firstNameField3,
                    firstNameField4,
                    firstNameField5;

                windowContext = test.getDriver().get('windowContext');

                firstNameField1 = TP.byId('firstNameField1', windowContext);
                firstNameField2 = TP.byId('firstNameField2', windowContext);
                firstNameField3 = TP.byId('firstNameField3', windowContext);
                firstNameField4 = TP.byId('firstNameField4', windowContext);
                firstNameField5 = TP.byId('firstNameField5', windowContext);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.isEqualTo(firstNameField1.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField2.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField3.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField4.get('value'), 'Joe');
                test.assert.isEqualTo(firstNameField5.get('value'), 'Joe');

                //  Change the content via 'user' interaction

                //  Field #1

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField1.clearValue();
                    }).
                    sendKeys('Johnny', firstNameField1).
                    sendEvent(TP.hc('type', 'change'), firstNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Johnny');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Johnny');
                    });

                //  Field #2

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField2.clearValue();
                    }).
                    sendKeys('Jimmy', firstNameField2).
                    sendEvent(TP.hc('type', 'change'), firstNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Jimmy');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jimmy');
                    });

                //  Field #3

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField3.clearValue();
                    }).
                    sendKeys('Jerry', firstNameField3).
                    sendEvent(TP.hc('type', 'change'), firstNameField3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Jerry');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jerry');
                    });

                //  Field #4

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField4.clearValue();
                    }).
                    sendKeys('Jacob', firstNameField4).
                    sendEvent(TP.hc('type', 'change'), firstNameField4).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Jacob');

                        test.assert.isEqualTo(
                            firstNameField5.get('value'),
                            'Jacob');
                    });

                //  Field #5

                test.getDriver().constructSequence().
                    exec(function() {
                        firstNameField5.clearValue();
                    }).
                    sendKeys('Justin', firstNameField5).
                    sendEvent(TP.hc('type', 'change'), firstNameField5).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Justin');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Justin');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
}).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: simple binds',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('simple binding with text fields - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Smith');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple binding with various XHTML controls - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXMLAllXHTMLControls.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/color')),
                            'red, blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXMLNoFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/color')),
                            'red, blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXMLSingleFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/color')),
                            'red, blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXMLMultiFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/color')),
                            'red, blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple binding with text fields - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.lastname')),
                    'Smith');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple binding with various XHTML controls - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSONAllXHTMLControls.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.color')),
                            TP.ac('red', 'blue'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSONNoFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.color')),
                            TP.ac('red', 'blue'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSONSingleFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.color')),
                            TP.ac('red', 'blue'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSONMultiFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.color')),
                            TP.ac('red', 'blue'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple binding with text fields - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Smith');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple binding with various XHTML controls - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObjAllXHTMLControls.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.color')),
                            TP.ac('red', 'blue'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObjNoFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.color')),
                            TP.ac('red', 'blue'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObjSingleFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.color')),
                            TP.ac('red', 'blue'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObjMultiFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byId('descriptionField', windowContext).get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byId('genderField', windowContext).get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byId('petRadio1', windowContext).get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byId('colorCheckbox1', windowContext).get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField.clearValue();
                    }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.lastname')),
                            'Jones');
                    });

                //  firstNameField is just another text field - same logic
                //  should work

                descriptionField = TP.byId('descriptionField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        descriptionField.clearValue();
                    }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getValueElements().at(0);

                test.getDriver().constructSequence().
                    click(genderFieldOption1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().constructSequence().
                    click(petRadio3).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().constructSequence().
                    click(colorCheckbox1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.color')),
                            TP.ac('red', 'blue'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
}).timeout(45000).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: numerically indexed binds',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('simple numeric indexed binds - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedXML.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField1', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField2.clearValue();
                    }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple numeric indexed binds with scoping - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedXMLWithScopes.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField1', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField2.clearValue();
                    }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple numeric indexed binds - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField1', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField2.clearValue();
                    }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple numeric indexed binds with scoping - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedJSONWithScopes.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField1', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField2.clearValue();
                    }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple numeric indexed binds - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField1', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField2.clearValue();
                    }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('simple numeric indexed binds with scoping - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedJSObjWithScopes.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField1', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField2.clearValue();
                    }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
}).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: bind repeats',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('repeat binding with text fields - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,

                    inputFields,

                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                lastNameField1 = inputFields.at(1);
                lastNameField2 = inputFields.at(3);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people#xpath1(/people/person)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    lastNameField2.get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/lastname')),
                            'Lyon');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField2.clearValue();
                    }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLNested.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,

                    inputFields,

                    lastNameField1,
                    lastNameField2,
                    addressStreetField11,
                    addressStreetField12,
                    addressCityField21,
                    addressCityField22;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                lastNameField1 = inputFields.at(1);
                addressStreetField11 = inputFields.at(2);
                addressStreetField12 = inputFields.at(4);

                lastNameField2 = inputFields.at(7);
                addressCityField21 = inputFields.at(9);
                addressCityField22 = inputFields.at(11);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people#xpath1(/people/person)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                //  ---

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    addressStreetField11.get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/addresses/address[1]/street')),
                    '111 Main St.');

                test.assert.isEqualTo(
                    addressStreetField12.get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/addresses/address[2]/street')),
                    '222 State St.');

                //  ---

                test.assert.isEqualTo(
                    lastNameField2.get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                test.assert.isEqualTo(
                    addressCityField21.get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/addresses/address[1]/city')),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    addressCityField22.get('value'),
                    'One More Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/addresses/address[2]/city')),
                    'One More Town');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/lastname')),
                            'Lyon');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField2.clearValue();
                    }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/lastname')),
                            'Weber');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        addressStreetField11.clearValue();
                    }).
                    sendKeys('555 3rd Av', addressStreetField11).
                    sendEvent(TP.hc('type', 'change'), addressStreetField11).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            addressStreetField11.get('value'),
                            '555 3rd Av');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/addresses/address[1]/street')),
                            '555 3rd Av');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        addressCityField22.clearValue();
                    }).
                    sendKeys('The Main Town', addressCityField22).
                    sendEvent(TP.hc('type', 'change'), addressCityField22).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            addressCityField22.get('value'),
                            'The Main Town');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/addresses/address[2]/city')),
                            'The Main Town');
                    });

                //  All of the others are just other text fields - same logic
                //  should work

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,

                    inputFields,

                    lastNameField0,
                    lastNameField1;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                lastNameField0 = inputFields.at(1);
                lastNameField1 = inputFields.at(3);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people#jpath($.people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    lastNameField0.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField0.clearValue();

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField0.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField0).
                    sendEvent(TP.hc('type', 'change'), lastNameField0).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField0.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].lastname')),
                            'Lyon');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Weber', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONNested.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,

                    inputFields,

                    lastNameField0,
                    lastNameField1,
                    addressStreetField00,
                    addressStreetField01,
                    addressCityField10,
                    addressCityField11;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                lastNameField0 = inputFields.at(1);
                addressStreetField00 = inputFields.at(2);
                addressStreetField01 = inputFields.at(4);

                lastNameField1 = inputFields.at(7);
                addressCityField10 = inputFields.at(9);
                addressCityField11 = inputFields.at(11);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people#jpath($.people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                //  ---

                test.assert.isEqualTo(
                    lastNameField0.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    addressStreetField00.get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].addresses[0].street')),
                    '111 Main St.');

                test.assert.isEqualTo(
                    addressStreetField01.get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].addresses[1].street')),
                    '222 State St.');

                //  ---

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].lastname')),
                    'Jones');

                test.assert.isEqualTo(
                    addressCityField10.get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].addresses[0].city')),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    addressCityField11.get('value'),
                    'One More Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].addresses[1].city')),
                    'One More Town');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField0.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField0).
                    sendEvent(TP.hc('type', 'change'), lastNameField0).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField0.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].lastname')),
                            'Lyon');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Weber', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].lastname')),
                            'Weber');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        addressStreetField00.clearValue();
                    }).
                    sendKeys('555 3rd Av', addressStreetField00).
                    sendEvent(TP.hc('type', 'change'), addressStreetField00).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            addressStreetField00.get('value'),
                            '555 3rd Av');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].addresses[0].street')),
                            '555 3rd Av');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        addressCityField11.clearValue();
                    }).
                    sendKeys('The Main Town', addressCityField11).
                    sendEvent(TP.hc('type', 'change'), addressCityField11).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            addressCityField11.get('value'),
                            'The Main Town');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].addresses[1].city')),
                            'The Main Town');
                    });

                //  All of the others are just other text fields - same logic
                //  should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,

                    inputFields,

                    lastNameField0,
                    lastNameField1;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                lastNameField0 = inputFields.at(1);
                lastNameField1 = inputFields.at(3);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people#tibet(people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                test.assert.isEqualTo(
                    lastNameField0.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField0.clearValue();

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField0.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField0).
                    sendEvent(TP.hc('type', 'change'), lastNameField0).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField0.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].lastname')),
                            'Lyon');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Weber', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].lastname')),
                            'Weber');
                    });

                //  firstNameField1 and firstNameField2 are just other text
                //  fields - same logic should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjNested.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,

                    inputFields,

                    lastNameField0,
                    lastNameField1,
                    addressStreetField00,
                    addressStreetField01,
                    addressCityField10,
                    addressCityField11;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                lastNameField0 = inputFields.at(1);
                addressStreetField00 = inputFields.at(2);
                addressStreetField01 = inputFields.at(4);

                lastNameField1 = inputFields.at(7);
                addressCityField10 = inputFields.at(9);
                addressCityField11 = inputFields.at(11);

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people#tibet(people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                //  ---

                test.assert.isEqualTo(
                    lastNameField0.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    addressStreetField00.get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].addresses[0].street')),
                    '111 Main St.');

                test.assert.isEqualTo(
                    addressStreetField01.get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].addresses[1].street')),
                    '222 State St.');

                //  ---

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                test.assert.isEqualTo(
                    addressCityField10.get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].addresses[0].city')),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    addressCityField11.get('value'),
                    'One More Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].addresses[1].city')),
                    'One More Town');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField0.clearValue();
                    }).
                    sendKeys('Lyon', lastNameField0).
                    sendEvent(TP.hc('type', 'change'), lastNameField0).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField0.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].lastname')),
                            'Lyon');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        lastNameField1.clearValue();
                    }).
                    sendKeys('Weber', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].lastname')),
                            'Weber');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        addressStreetField00.clearValue();
                    }).
                    sendKeys('555 3rd Av', addressStreetField00).
                    sendEvent(TP.hc('type', 'change'), addressStreetField00).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            addressStreetField00.get('value'),
                            '555 3rd Av');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].addresses[0].street')),
                            '555 3rd Av');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        addressCityField11.clearValue();
                    }).
                    sendKeys('The Main Town', addressCityField11).
                    sendEvent(TP.hc('type', 'change'), addressCityField11).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            addressCityField11.get('value'),
                            'The Main Town');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].addresses[1].city')),
                            'The Main Town');
                    });

                //  All of the others are just other text fields - same logic
                //  should work
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields and paging - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    inputFields,

                    lastNameField1,
                    firstNameField1,
                    lastNameField2,
                    firstNameField2,
                    lastNameField3,
                    firstNameField3,
                    lastNameField4,
                    firstNameField4,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                test.assert.isEqualTo(
                    inputFields.getSize(),
                    4);

                firstNameField1 = inputFields.at(0);
                lastNameField1 = inputFields.at(1);
                firstNameField2 = inputFields.at(2);
                lastNameField2 = inputFields.at(3);

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    repeatIndexField.get('value'),
                    '1');

                test.assert.isEqualTo(
                    repeatSizeField.get('value'),
                    '2');

                test.assert.isEqualTo(
                    firstNameField1.get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    firstNameField2.get('value'),
                    'John');

                test.assert.isEqualTo(
                    lastNameField2.get('value'),
                    'Jones');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            8);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);
                        firstNameField2 = inputFields.at(2);
                        lastNameField2 = inputFields.at(3);
                        firstNameField3 = inputFields.at(4);
                        lastNameField3 = inputFields.at(5);
                        firstNameField4 = inputFields.at(6);
                        lastNameField4 = inputFields.at(7);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Joe');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Smith');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            lastNameField3.get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            lastNameField4.get('value'),
                            'Professional');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('1', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatIndexField.clearValue();
                    }).
                    sendKeys('2', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '1');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '2');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            2);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Jones');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields and paging - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLNestedPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    inputFields,

                    lastNameField1,
                    firstNameField1,
                    addressStreetField11,
                    addressCityField11,
                    addressStreetField12,
                    addressCityField12,

                    lastNameField2,
                    firstNameField2,
                    addressStreetField21,
                    addressCityField21,
                    addressStreetField22,
                    addressCityField22,

                    lastNameField3,
                    firstNameField3,
                    addressStreetField31,
                    addressCityField31,
                    addressStreetField32,
                    addressCityField32,

                    lastNameField4,
                    firstNameField4,
                    addressStreetField41,
                    addressCityField41,
                    addressStreetField42,
                    addressCityField42,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                test.assert.isEqualTo(
                    inputFields.getSize(),
                    12);

                firstNameField1 = inputFields.at(0);
                lastNameField1 = inputFields.at(1);
                addressStreetField11 = inputFields.at(2);
                addressCityField11 = inputFields.at(3);
                addressStreetField12 = inputFields.at(4);
                addressCityField12 = inputFields.at(5);

                firstNameField2 = inputFields.at(6);
                lastNameField2 = inputFields.at(7);
                addressStreetField21 = inputFields.at(8);
                addressCityField21 = inputFields.at(9);
                addressStreetField22 = inputFields.at(10);
                addressCityField22 = inputFields.at(11);

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    repeatIndexField.get('value'),
                    '1');

                test.assert.isEqualTo(
                    repeatSizeField.get('value'),
                    '2');

                test.assert.isEqualTo(
                    firstNameField1.get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    addressStreetField11.get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    addressCityField11.get('value'),
                    'Anytown');

                test.assert.isEqualTo(
                    addressStreetField12.get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    addressCityField12.get('value'),
                    'Another Town');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            24);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);
                        addressStreetField11 = inputFields.at(2);
                        addressCityField11 = inputFields.at(3);
                        addressStreetField12 = inputFields.at(4);
                        addressCityField12 = inputFields.at(5);

                        firstNameField2 = inputFields.at(6);
                        lastNameField2 = inputFields.at(7);
                        addressStreetField21 = inputFields.at(8);
                        addressCityField21 = inputFields.at(9);
                        addressStreetField22 = inputFields.at(10);
                        addressCityField22 = inputFields.at(11);

                        firstNameField3 = inputFields.at(12);
                        lastNameField3 = inputFields.at(13);
                        addressStreetField31 = inputFields.at(14);
                        addressCityField31 = inputFields.at(15);
                        addressStreetField32 = inputFields.at(16);
                        addressCityField32 = inputFields.at(17);

                        firstNameField4 = inputFields.at(18);
                        lastNameField4 = inputFields.at(19);
                        addressStreetField41 = inputFields.at(20);
                        addressCityField41 = inputFields.at(21);
                        addressStreetField42 = inputFields.at(22);
                        addressCityField42 = inputFields.at(23);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Joe');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Smith');

                        test.assert.isEqualTo(
                            addressStreetField11.get('value'),
                            '111 Main St.');

                        test.assert.isEqualTo(
                            addressCityField11.get('value'),
                            'Anytown');

                        test.assert.isEqualTo(
                            addressStreetField12.get('value'),
                            '222 State St.');

                        test.assert.isEqualTo(
                            addressCityField12.get('value'),
                            'Another Town');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            addressStreetField21.get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            addressCityField21.get('value'),
                            'Yet Another Town');

                        test.assert.isEqualTo(
                            addressStreetField22.get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            addressCityField22.get('value'),
                            'One More Town');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            lastNameField3.get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            addressStreetField31.get('value'),
                            '#27 Ritz Ave. Apt A.');

                        test.assert.isEqualTo(
                            addressCityField31.get('value'),
                            'In Your Town');

                        test.assert.isEqualTo(
                            addressStreetField32.get('value'),
                            '#4 Country Rd.');

                        test.assert.isEqualTo(
                            addressCityField32.get('value'),
                            'Middle Of Nowhere');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            lastNameField4.get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            addressStreetField41.get('value'),
                            '2700 Main St.');

                        test.assert.isEqualTo(
                            addressCityField41.get('value'),
                            'High Power Place');

                        test.assert.isEqualTo(
                            addressStreetField42.get('value'),
                            '#4 Hidden Court');

                        test.assert.isEqualTo(
                            addressCityField42.get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('1', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatIndexField.clearValue();
                    }).
                    sendKeys('2', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '1');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '2');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            6);

                        firstNameField2 = inputFields.at(0);
                        lastNameField2 = inputFields.at(1);
                        addressStreetField21 = inputFields.at(2);
                        addressCityField21 = inputFields.at(3);
                        addressStreetField22 = inputFields.at(4);
                        addressCityField22 = inputFields.at(5);

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            addressStreetField21.get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            addressCityField21.get('value'),
                            'Yet Another Town');

                        test.assert.isEqualTo(
                            addressStreetField22.get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            addressCityField22.get('value'),
                            'One More Town');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('repeat binding with text fields and paging - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    inputFields,

                    lastNameField1,
                    firstNameField1,
                    lastNameField2,
                    firstNameField2,
                    lastNameField3,
                    firstNameField3,
                    lastNameField4,
                    firstNameField4,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                test.assert.isEqualTo(
                    inputFields.getSize(),
                    4);

                firstNameField1 = inputFields.at(0);
                lastNameField1 = inputFields.at(1);
                firstNameField2 = inputFields.at(2);
                lastNameField2 = inputFields.at(3);

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    repeatIndexField.get('value'),
                    '1');

                test.assert.isEqualTo(
                    repeatSizeField.get('value'),
                    '2');

                test.assert.isEqualTo(
                    firstNameField1.get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    firstNameField2.get('value'),
                    'John');

                test.assert.isEqualTo(
                    lastNameField2.get('value'),
                    'Jones');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            8);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);
                        firstNameField2 = inputFields.at(2);
                        lastNameField2 = inputFields.at(3);
                        firstNameField3 = inputFields.at(4);
                        lastNameField3 = inputFields.at(5);
                        firstNameField4 = inputFields.at(6);
                        lastNameField4 = inputFields.at(7);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Joe');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Smith');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            lastNameField3.get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            lastNameField4.get('value'),
                            'Professional');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('1', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatIndexField.clearValue();
                    }).
                    sendKeys('2', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '1');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '2');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            2);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Jones');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields and paging - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONNestedPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    inputFields,

                    lastNameField1,
                    firstNameField1,
                    addressStreetField11,
                    addressCityField11,
                    addressStreetField12,
                    addressCityField12,

                    lastNameField2,
                    firstNameField2,
                    addressStreetField21,
                    addressCityField21,
                    addressStreetField22,
                    addressCityField22,

                    lastNameField3,
                    firstNameField3,
                    addressStreetField31,
                    addressCityField31,
                    addressStreetField32,
                    addressCityField32,

                    lastNameField4,
                    firstNameField4,
                    addressStreetField41,
                    addressCityField41,
                    addressStreetField42,
                    addressCityField42,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                firstNameField1 = inputFields.at(0);
                lastNameField1 = inputFields.at(1);
                addressStreetField11 = inputFields.at(2);
                addressCityField11 = inputFields.at(3);
                addressStreetField12 = inputFields.at(4);
                addressCityField12 = inputFields.at(5);

                firstNameField2 = inputFields.at(6);
                lastNameField2 = inputFields.at(7);
                addressStreetField21 = inputFields.at(8);
                addressCityField21 = inputFields.at(9);
                addressStreetField22 = inputFields.at(10);
                addressCityField22 = inputFields.at(11);

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    repeatIndexField.get('value'),
                    '1');

                test.assert.isEqualTo(
                    repeatSizeField.get('value'),
                    '2');

                test.assert.isEqualTo(
                    repeatIndexField.get('value'),
                    '1');

                test.assert.isEqualTo(
                    repeatSizeField.get('value'),
                    '2');

                test.assert.isEqualTo(
                    firstNameField1.get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    addressStreetField11.get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    addressCityField11.get('value'),
                    'Anytown');

                test.assert.isEqualTo(
                    addressStreetField12.get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    addressCityField12.get('value'),
                    'Another Town');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            24);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);
                        addressStreetField11 = inputFields.at(2);
                        addressCityField11 = inputFields.at(3);
                        addressStreetField12 = inputFields.at(4);
                        addressCityField12 = inputFields.at(5);

                        firstNameField2 = inputFields.at(6);
                        lastNameField2 = inputFields.at(7);
                        addressStreetField21 = inputFields.at(8);
                        addressCityField21 = inputFields.at(9);
                        addressStreetField22 = inputFields.at(10);
                        addressCityField22 = inputFields.at(11);

                        firstNameField3 = inputFields.at(12);
                        lastNameField3 = inputFields.at(13);
                        addressStreetField31 = inputFields.at(14);
                        addressCityField31 = inputFields.at(15);
                        addressStreetField32 = inputFields.at(16);
                        addressCityField32 = inputFields.at(17);

                        firstNameField4 = inputFields.at(18);
                        lastNameField4 = inputFields.at(19);
                        addressStreetField41 = inputFields.at(20);
                        addressCityField41 = inputFields.at(21);
                        addressStreetField42 = inputFields.at(22);
                        addressCityField42 = inputFields.at(23);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Joe');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Smith');

                        test.assert.isEqualTo(
                            addressStreetField11.get('value'),
                            '111 Main St.');

                        test.assert.isEqualTo(
                            addressCityField11.get('value'),
                            'Anytown');

                        test.assert.isEqualTo(
                            addressStreetField12.get('value'),
                            '222 State St.');

                        test.assert.isEqualTo(
                            addressCityField12.get('value'),
                            'Another Town');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            addressStreetField21.get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            addressCityField21.get('value'),
                            'Yet Another Town');

                        test.assert.isEqualTo(
                            addressStreetField22.get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            addressCityField22.get('value'),
                            'One More Town');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            lastNameField3.get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            addressStreetField31.get('value'),
                            '#27 Ritz Ave. Apt A.');

                        test.assert.isEqualTo(
                            addressCityField31.get('value'),
                            'In Your Town');

                        test.assert.isEqualTo(
                            addressStreetField32.get('value'),
                            '#4 Country Rd.');

                        test.assert.isEqualTo(
                            addressCityField32.get('value'),
                            'Middle Of Nowhere');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            lastNameField4.get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            addressStreetField41.get('value'),
                            '2700 Main St.');

                        test.assert.isEqualTo(
                            addressCityField41.get('value'),
                            'High Power Place');

                        test.assert.isEqualTo(
                            addressStreetField42.get('value'),
                            '#4 Hidden Court');

                        test.assert.isEqualTo(
                            addressCityField42.get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('1', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatIndexField.clearValue();
                    }).
                    sendKeys('2', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '1');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '2');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            6);

                        firstNameField2 = inputFields.at(0);
                        lastNameField2 = inputFields.at(1);
                        addressStreetField21 = inputFields.at(2);
                        addressCityField21 = inputFields.at(3);
                        addressStreetField22 = inputFields.at(4);
                        addressCityField22 = inputFields.at(5);

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            addressStreetField21.get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            addressCityField21.get('value'),
                            'Yet Another Town');

                        test.assert.isEqualTo(
                            addressStreetField22.get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            addressCityField22.get('value'),
                            'One More Town');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('repeat binding with text fields and paging - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    inputFields,

                    lastNameField1,
                    firstNameField1,
                    lastNameField2,
                    firstNameField2,
                    lastNameField3,
                    firstNameField3,
                    lastNameField4,
                    firstNameField4,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                test.assert.isEqualTo(
                    inputFields.getSize(),
                    4);

                firstNameField1 = inputFields.at(0);
                lastNameField1 = inputFields.at(1);
                firstNameField2 = inputFields.at(2);
                lastNameField2 = inputFields.at(3);

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    repeatIndexField.get('value'),
                    '1');

                test.assert.isEqualTo(
                    repeatSizeField.get('value'),
                    '2');

                test.assert.isEqualTo(
                    repeatIndexField.get('value'),
                    '1');

                test.assert.isEqualTo(
                    repeatSizeField.get('value'),
                    '2');

                test.assert.isEqualTo(
                    firstNameField1.get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    firstNameField2.get('value'),
                    'John');

                test.assert.isEqualTo(
                    lastNameField2.get('value'),
                    'Jones');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            8);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);
                        firstNameField2 = inputFields.at(2);
                        lastNameField2 = inputFields.at(3);
                        firstNameField3 = inputFields.at(4);
                        lastNameField3 = inputFields.at(5);
                        firstNameField4 = inputFields.at(6);
                        lastNameField4 = inputFields.at(7);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Joe');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Smith');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            lastNameField3.get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            lastNameField4.get('value'),
                            'Professional');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('1', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatIndexField.clearValue();
                    }).
                    sendKeys('2', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '1');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '2');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            2);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Jones');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields and paging - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjNestedPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    inputFields,

                    lastNameField1,
                    firstNameField1,
                    addressStreetField11,
                    addressCityField11,
                    addressStreetField12,
                    addressCityField12,

                    lastNameField2,
                    firstNameField2,
                    addressStreetField21,
                    addressCityField21,
                    addressStreetField22,
                    addressCityField22,

                    lastNameField3,
                    firstNameField3,
                    addressStreetField31,
                    addressCityField31,
                    addressStreetField32,
                    addressCityField32,

                    lastNameField4,
                    firstNameField4,
                    addressStreetField41,
                    addressCityField41,
                    addressStreetField42,
                    addressCityField42,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                inputFields = TP.byCSSPath('#repeater input[type="text"]',
                                            windowContext);
                test.assert.isEqualTo(
                    inputFields.getSize(),
                    12);

                firstNameField1 = inputFields.at(0);
                lastNameField1 = inputFields.at(1);
                addressStreetField11 = inputFields.at(2);
                addressCityField11 = inputFields.at(3);
                addressStreetField12 = inputFields.at(4);
                addressCityField12 = inputFields.at(5);

                firstNameField2 = inputFields.at(6);
                lastNameField2 = inputFields.at(7);
                addressStreetField21 = inputFields.at(8);
                addressCityField21 = inputFields.at(9);
                addressStreetField22 = inputFields.at(10);
                addressCityField22 = inputFields.at(11);

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    repeatIndexField.get('value'),
                    '1');

                test.assert.isEqualTo(
                    repeatSizeField.get('value'),
                    '2');

                test.assert.isEqualTo(
                    firstNameField1.get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    lastNameField1.get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    addressStreetField11.get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    addressCityField11.get('value'),
                    'Anytown');

                test.assert.isEqualTo(
                    addressStreetField12.get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    addressCityField12.get('value'),
                    'Another Town');

                //  Change the content via 'user' interaction

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            24);

                        firstNameField1 = inputFields.at(0);
                        lastNameField1 = inputFields.at(1);
                        addressStreetField11 = inputFields.at(2);
                        addressCityField11 = inputFields.at(3);
                        addressStreetField12 = inputFields.at(4);
                        addressCityField12 = inputFields.at(5);

                        firstNameField2 = inputFields.at(6);
                        lastNameField2 = inputFields.at(7);
                        addressStreetField21 = inputFields.at(8);
                        addressCityField21 = inputFields.at(9);
                        addressStreetField22 = inputFields.at(10);
                        addressCityField22 = inputFields.at(11);

                        firstNameField3 = inputFields.at(12);
                        lastNameField3 = inputFields.at(13);
                        addressStreetField31 = inputFields.at(14);
                        addressCityField31 = inputFields.at(15);
                        addressStreetField32 = inputFields.at(16);
                        addressCityField32 = inputFields.at(17);

                        firstNameField4 = inputFields.at(18);
                        lastNameField4 = inputFields.at(19);
                        addressStreetField41 = inputFields.at(20);
                        addressCityField41 = inputFields.at(21);
                        addressStreetField42 = inputFields.at(22);
                        addressCityField42 = inputFields.at(23);

                        test.assert.isEqualTo(
                            firstNameField1.get('value'),
                            'Joe');

                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Smith');

                        test.assert.isEqualTo(
                            addressStreetField11.get('value'),
                            '111 Main St.');

                        test.assert.isEqualTo(
                            addressCityField11.get('value'),
                            'Anytown');

                        test.assert.isEqualTo(
                            addressStreetField12.get('value'),
                            '222 State St.');

                        test.assert.isEqualTo(
                            addressCityField12.get('value'),
                            'Another Town');

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            addressStreetField21.get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            addressCityField21.get('value'),
                            'Yet Another Town');

                        test.assert.isEqualTo(
                            addressStreetField22.get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            addressCityField22.get('value'),
                            'One More Town');

                        test.assert.isEqualTo(
                            firstNameField3.get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            lastNameField3.get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            addressStreetField31.get('value'),
                            '#27 Ritz Ave. Apt A.');

                        test.assert.isEqualTo(
                            addressCityField31.get('value'),
                            'In Your Town');

                        test.assert.isEqualTo(
                            addressStreetField32.get('value'),
                            '#4 Country Rd.');

                        test.assert.isEqualTo(
                            addressCityField32.get('value'),
                            'Middle Of Nowhere');

                        test.assert.isEqualTo(
                            firstNameField4.get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            lastNameField4.get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            addressStreetField41.get('value'),
                            '2700 Main St.');

                        test.assert.isEqualTo(
                            addressCityField41.get('value'),
                            'High Power Place');

                        test.assert.isEqualTo(
                            addressStreetField42.get('value'),
                            '#4 Hidden Court');

                        test.assert.isEqualTo(
                            addressCityField42.get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatSizeField.clearValue();
                    }).
                    sendKeys('1', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    run();

                test.getDriver().constructSequence().
                    exec(function() {
                        repeatIndexField.clearValue();
                    }).
                    sendKeys('2', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '1');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '2');

                        inputFields = TP.byCSSPath(
                                            '#repeater input[type="text"]',
                                            windowContext);
                        test.assert.isEqualTo(
                            inputFields.getSize(),
                            6);

                        firstNameField2 = inputFields.at(0);
                        lastNameField2 = inputFields.at(1);
                        addressStreetField21 = inputFields.at(2);
                        addressCityField21 = inputFields.at(3);
                        addressStreetField22 = inputFields.at(4);
                        addressCityField22 = inputFields.at(5);

                        test.assert.isEqualTo(
                            firstNameField2.get('value'),
                            'John');

                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            addressStreetField21.get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            addressCityField21.get('value'),
                            'Yet Another Town');

                        test.assert.isEqualTo(
                            addressStreetField22.get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            addressCityField22.get('value'),
                            'One More Town');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
}).timeout(60000).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: static tables',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.afterEach(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('Simple table - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindStaticTableXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    dataRows,
                    dataCells;

                windowContext = test.getDriver().get('windowContext');

                dataRows = TP.byCSSPath(
                    'tr', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataRows.getSize(), 4);

                dataCells = TP.byCSSPath(
                    'td', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataCells.getSize(), 8);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(0)),
                    'Joe');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(1)),
                    'Smith');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(2)),
                    'John');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(3)),
                    'Jones');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(4)),
                    'Billy');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(5)),
                    'Homemaker');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(6)),
                    'Pamela');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(7)),
                    'Professional');

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Simple table - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindStaticTableJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    dataRows,
                    dataCells;

                windowContext = test.getDriver().get('windowContext');

                dataRows = TP.byCSSPath(
                    'tr', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataRows.getSize(), 4);

                dataCells = TP.byCSSPath(
                    'td', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataCells.getSize(), 8);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(0)),
                    'Joe');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(1)),
                    'Smith');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(2)),
                    'John');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(3)),
                    'Jones');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(4)),
                    'Billy');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(5)),
                    'Homemaker');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(6)),
                    'Pamela');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(7)),
                    'Professional');

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Simple table - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindStaticTableJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    dataRows,
                    dataCells;

                windowContext = test.getDriver().get('windowContext');

                dataRows = TP.byCSSPath(
                    'tr', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataRows.getSize(), 4);

                dataCells = TP.byCSSPath(
                    'td', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataCells.getSize(), 8);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(0)),
                    'Joe');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(1)),
                    'Smith');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(2)),
                    'John');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(3)),
                    'Jones');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(4)),
                    'Billy');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(5)),
                    'Homemaker');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(6)),
                    'Pamela');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(7)),
                    'Professional');

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
}).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: inline bind expressions',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.afterEach(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('whole attribute expression - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,
                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/color')),
                    'red');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/color')),
                            'purple');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, no fragment, qualified binding - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeNoFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/color')),
                    'green');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/color')),
                            'yellow');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, single-level fragment, qualified binding - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeSingleFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[3]/color')),
                    'blue');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[3]/color')),
                            'orange');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, multi-level fragment, qualified binding - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeMultiFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[4]/color')),
                    'yellow');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[4]/color')),
                            'blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('red'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/color')),
                    'red');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('purple'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/color')),
                            'purple');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, no fragment, qualified binding - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeNoFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    //  For some reason, green isn't green...
                    TP.gui.Color.fromString('rgb(0, 128, 0)'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/color')),
                    'green');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('yellow'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/color')),
                            'yellow');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, single-level fragment, qualified binding - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeSingleFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[3]/color')),
                    'blue');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('orange'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[3]/color')),
                            'orange');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, multi-level fragment, qualified binding - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeMultiFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('yellow'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[4]/color')),
                    'yellow');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[4]/color')),
                            'blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].color')),
                    'red');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].color')),
                            'purple');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, no fragment, qualified binding - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeNoFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].color')),
                    'green');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].color')),
                            'yellow');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, single-level fragment, qualified binding - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeSingleFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[2].color')),
                    'blue');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[2].color')),
                            'orange');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, multi-level fragment, qualified binding - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeMultiFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[3].color')),
                    'yellow');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[3].color')),
                            'blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('red'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].color')),
                    'red');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('purple'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].color')),
                            'purple');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, no fragment, qualified binding - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeNoFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    //  For some reason, green isn't green...
                    TP.gui.Color.fromString('rgb(0, 128, 0)'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].color')),
                    'green');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('yellow'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].color')),
                            'yellow');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, single-level fragment, qualified binding - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeSingleFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[2].color')),
                    'blue');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('orange'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[2].color')),
                            'orange');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, multi-level fragment, qualified binding - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeMultiFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('yellow'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[3].color')),
                    'yellow');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[3].color')),
                            'blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].color')),
                    'red');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].color')),
                            'purple');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, no fragment, qualified binding - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeNoFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].color')),
                    'green');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].color')),
                            'yellow');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, single-level fragment, qualified binding - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeSingleFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[2].color')),
                    'blue');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[2].color')),
                            'orange');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('whole attribute expression, multi-level fragment, qualified binding - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeMultiFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[3].color')),
                    'yellow');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[3].color')),
                            'blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('red'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].color')),
                    'red');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('purple'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].color')),
                            'purple');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, no fragment, qualified binding - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeNoFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    //  For some reason, green isn't green...
                    TP.gui.Color.fromString('rgb(0, 128, 0)'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].color')),
                    'green');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('yellow'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].color')),
                            'yellow');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, single-level fragment, qualified binding - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeSingleFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[2].color')),
                    'blue');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('orange'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[2].color')),
                            'orange');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('partial attribute expression, multi-level fragment, qualified binding - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeMultiFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('yellow'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[3].color')),
                    'yellow');

                test.getDriver().constructSequence().
                    exec(function() {
                        colorField.clearValue();
                    }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.gui.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.gui.Color.fromString('blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[3].color')),
                            'blue');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

}).timeout(45000).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: expressions with variables',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.afterEach(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('bind:io attributes - no literal expression content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsNoLiterals.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    xmlField,
                    jsonField,
                    jsobjField;

                windowContext = test.getDriver().get('windowContext');

                xmlField = TP.byId('xmlBindCNAttr', windowContext);
                jsonField = TP.byId('jsonBindCNAttr', windowContext);
                jsobjField = TP.byId('jsobjBindCNAttr', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'html:input');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'html:input');
                test.assert.isEqualTo(
                    jsobjField.getValue(),
                    'html:input');

                xmlField = TP.byId('xmlBindStdinAttr', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr', windowContext);
                jsobjField = TP.byId('jsobjBindStdinAttr', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'SMITH');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'SMITH');
                test.assert.isEqualTo(
                    jsobjField.getValue(),
                    'SMITH');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:io attributes - literal expression content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsWithLiterals.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    xmlField,
                    jsonField,
                    jsobjField;

                windowContext = test.getDriver().get('windowContext');

                xmlField = TP.byId('xmlBindAttr', windowContext);
                jsonField = TP.byId('jsonBindAttr', windowContext);
                jsobjField = TP.byId('jsobjBindAttr', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The canonical name: html:input');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The canonical name: html:input');
                test.assert.isEqualTo(
                    jsobjField.getValue(),
                    'The canonical name: html:input');

                xmlField = TP.byId('xmlBindStdinAttr', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr', windowContext);
                jsobjField = TP.byId('jsobjBindStdinAttr', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The data source\'s last name field value uppercased: SMITH');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The data source\'s last name field value uppercased: SMITH');
                test.assert.isEqualTo(
                    jsobjField.getValue(),
                    'The data source\'s last name field value uppercased: SMITH');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('embedded syntax - no literal expression content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsEmbedded.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    xmlField,
                    jsonField,
                    jsobjField;

                windowContext = test.getDriver().get('windowContext');

                xmlField = TP.byId('xmlBindAttr', windowContext);
                jsonField = TP.byId('jsonBindAttr', windowContext);
                jsobjField = TP.byId('jsobjBindAttr', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'html:input');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'html:input');
                test.assert.isEqualTo(
                    jsobjField.getValue(),
                    'html:input');

                xmlField = TP.byId('xmlBindStdinAttr', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr', windowContext);
                jsobjField = TP.byId('jsobjBindStdinAttr', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'SMITH');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'SMITH');
                test.assert.isEqualTo(
                    jsobjField.getValue(),
                    'SMITH');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('embedded syntax - literal expression content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsAndLiteralsEmbedded.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    xmlField,
                    jsonField,
                    jsobjField;

                windowContext = test.getDriver().get('windowContext');

                xmlField = TP.byId('xmlBindAttr', windowContext);
                jsonField = TP.byId('jsonBindAttr', windowContext);
                jsobjField = TP.byId('jsobjBindAttr', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The canonical name: html:input');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The canonical name: html:input');
                test.assert.isEqualTo(
                    jsobjField.getValue(),
                    'The canonical name: html:input');

                xmlField = TP.byId('xmlBindStdinAttr', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr', windowContext);
                jsobjField = TP.byId('jsobjBindStdinAttr', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The data source\'s last name field value uppercased: SMITH');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The data source\'s last name field value uppercased: SMITH');
                test.assert.isEqualTo(
                    jsobjField.getValue(),
                    'The data source\'s last name field value uppercased: SMITH');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:io attributes - no literal expression content - repeating context', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsIOAttrsRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    xmlFields,
                    jsonFields,
                    jsobjFields;

                windowContext = test.getDriver().get('windowContext');

                xmlFields = TP.byCSSPath('#xmlrepeater input[type="text"]',
                                        windowContext);

                jsonFields = TP.byCSSPath('#jsonrepeater input[type="text"]',
                                        windowContext);

                jsobjFields = TP.byCSSPath('#jsobjrepeater input[type="text"]',
                                        windowContext);

                test.assert.isEqualTo(
                    xmlFields.at(0).getValue(),
                    'JOE');
                test.assert.isEqualTo(
                    jsonFields.at(0).getValue(),
                    'BOB');
                test.assert.isEqualTo(
                    jsobjFields.at(0).getValue(),
                    'SMITH');

                test.assert.isEqualTo(
                    xmlFields.at(1).getValue(),
                    '1');
                test.assert.isEqualTo(
                    jsonFields.at(1).getValue(),
                    '0');
                test.assert.isEqualTo(
                    jsobjFields.at(1).getValue(),
                    '0');

                test.assert.isEqualTo(
                    xmlFields.at(2).getValue(),
                    'Joe');
                test.assert.isEqualTo(
                    jsonFields.at(2).getValue(),
                    'Bob');
                test.assert.isEqualTo(
                    jsobjFields.at(2).getValue(),
                    'Smith');

                test.assert.isEqualTo(
                    xmlFields.at(3).getValue(),
                    'JOHN');
                test.assert.isEqualTo(
                    jsonFields.at(3).getValue(),
                    'JAY');
                test.assert.isEqualTo(
                    jsobjFields.at(3).getValue(),
                    'JONES');

                test.assert.isEqualTo(
                    xmlFields.at(4).getValue(),
                    '2');
                test.assert.isEqualTo(
                    jsonFields.at(4).getValue(),
                    '1');
                test.assert.isEqualTo(
                    jsobjFields.at(4).getValue(),
                    '1');

                test.assert.isEqualTo(
                    xmlFields.at(5).getValue(),
                    'John');
                test.assert.isEqualTo(
                    jsonFields.at(5).getValue(),
                    'Jay');
                test.assert.isEqualTo(
                    jsobjFields.at(5).getValue(),
                    'Jones');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('bind:io attributes - literal expression content - repeating context', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsAndLiteralsIOAttrsRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    xmlFields,
                    jsonFields,
                    jsobjFields;

                windowContext = test.getDriver().get('windowContext');

                xmlFields = TP.byCSSPath('#xmlrepeater input[type="text"]',
                                        windowContext);

                jsonFields = TP.byCSSPath('#jsonrepeater input[type="text"]',
                                        windowContext);

                jsobjFields = TP.byCSSPath('#jsobjrepeater input[type="text"]',
                                        windowContext);

                test.assert.isEqualTo(
                    xmlFields.at(0).getValue(),
                    'The first name: JOE');
                test.assert.isEqualTo(
                    jsonFields.at(0).getValue(),
                    'The middle name: BOB');
                test.assert.isEqualTo(
                    jsobjFields.at(0).getValue(),
                    'The last name: SMITH');

                test.assert.isEqualTo(
                    xmlFields.at(1).getValue(),
                    'The index: 1');
                test.assert.isEqualTo(
                    jsonFields.at(1).getValue(),
                    'The index: 0');
                test.assert.isEqualTo(
                    jsobjFields.at(1).getValue(),
                    'The index: 0');

                test.assert.isEqualTo(
                    xmlFields.at(2).getValue(),
                    'The first name: Joe');
                test.assert.isEqualTo(
                    jsonFields.at(2).getValue(),
                    'The middle name: Bob');
                test.assert.isEqualTo(
                    jsobjFields.at(2).getValue(),
                    'The last name: Smith');

                test.assert.isEqualTo(
                    xmlFields.at(3).getValue(),
                    'The first name: JOHN');
                test.assert.isEqualTo(
                    jsonFields.at(3).getValue(),
                    'The middle name: JAY');
                test.assert.isEqualTo(
                    jsobjFields.at(3).getValue(),
                    'The last name: JONES');

                test.assert.isEqualTo(
                    xmlFields.at(4).getValue(),
                    'The index: 2');
                test.assert.isEqualTo(
                    jsonFields.at(4).getValue(),
                    'The index: 1');
                test.assert.isEqualTo(
                    jsobjFields.at(4).getValue(),
                    'The index: 1');

                test.assert.isEqualTo(
                    xmlFields.at(5).getValue(),
                    'The first name: John');
                test.assert.isEqualTo(
                    jsonFields.at(5).getValue(),
                    'The middle name: Jay');
                test.assert.isEqualTo(
                    jsobjFields.at(5).getValue(),
                    'The last name: Jones');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('embedded syntax - no literal expression content - repeating context', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsEmbeddedRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    xmlFields,
                    jsonFields,
                    jsobjFields;

                windowContext = test.getDriver().get('windowContext');

                xmlFields = TP.byCSSPath('#xmlrepeater input[type="text"]',
                                        windowContext);

                jsonFields = TP.byCSSPath('#jsonrepeater input[type="text"]',
                                        windowContext);

                jsobjFields = TP.byCSSPath('#jsobjrepeater input[type="text"]',
                                        windowContext);

                test.assert.isEqualTo(
                    xmlFields.at(0).getValue(),
                    'JOE');
                test.assert.isEqualTo(
                    jsonFields.at(0).getValue(),
                    'BOB');
                test.assert.isEqualTo(
                    jsobjFields.at(0).getValue(),
                    'SMITH');

                test.assert.isEqualTo(
                    xmlFields.at(1).getValue(),
                    '1');
                test.assert.isEqualTo(
                    jsonFields.at(1).getValue(),
                    '0');
                test.assert.isEqualTo(
                    jsobjFields.at(1).getValue(),
                    '0');

                test.assert.isEqualTo(
                    xmlFields.at(2).getValue(),
                    'Joe');
                test.assert.isEqualTo(
                    jsonFields.at(2).getValue(),
                    'Bob');
                test.assert.isEqualTo(
                    jsobjFields.at(2).getValue(),
                    'Smith');

                test.assert.isEqualTo(
                    xmlFields.at(3).getValue(),
                    'JOHN');
                test.assert.isEqualTo(
                    jsonFields.at(3).getValue(),
                    'JAY');
                test.assert.isEqualTo(
                    jsobjFields.at(3).getValue(),
                    'JONES');

                test.assert.isEqualTo(
                    xmlFields.at(4).getValue(),
                    '2');
                test.assert.isEqualTo(
                    jsonFields.at(4).getValue(),
                    '1');
                test.assert.isEqualTo(
                    jsobjFields.at(4).getValue(),
                    '1');

                test.assert.isEqualTo(
                    xmlFields.at(5).getValue(),
                    'John');
                test.assert.isEqualTo(
                    jsonFields.at(5).getValue(),
                    'Jay');
                test.assert.isEqualTo(
                    jsobjFields.at(5).getValue(),
                    'Jones');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('embedded syntax - literal expression content - repeating context', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsAndLiteralsEmbeddedRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    xmlFields,
                    jsonFields,
                    jsobjFields;

                windowContext = test.getDriver().get('windowContext');

                xmlFields = TP.byCSSPath('#xmlrepeater input[type="text"]',
                                        windowContext);

                jsonFields = TP.byCSSPath('#jsonrepeater input[type="text"]',
                                        windowContext);

                jsobjFields = TP.byCSSPath('#jsobjrepeater input[type="text"]',
                                        windowContext);

                test.assert.isEqualTo(
                    xmlFields.at(0).getValue(),
                    'The first name: JOE');
                test.assert.isEqualTo(
                    jsonFields.at(0).getValue(),
                    'The middle name: BOB');
                test.assert.isEqualTo(
                    jsobjFields.at(0).getValue(),
                    'The last name: SMITH');

                test.assert.isEqualTo(
                    xmlFields.at(1).getValue(),
                    'The index: 1');
                test.assert.isEqualTo(
                    jsonFields.at(1).getValue(),
                    'The index: 0');
                test.assert.isEqualTo(
                    jsobjFields.at(1).getValue(),
                    'The index: 0');

                test.assert.isEqualTo(
                    xmlFields.at(2).getValue(),
                    'The first name: Joe');
                test.assert.isEqualTo(
                    jsonFields.at(2).getValue(),
                    'The middle name: Bob');
                test.assert.isEqualTo(
                    jsobjFields.at(2).getValue(),
                    'The last name: Smith');

                test.assert.isEqualTo(
                    xmlFields.at(3).getValue(),
                    'The first name: JOHN');
                test.assert.isEqualTo(
                    jsonFields.at(3).getValue(),
                    'The middle name: JAY');
                test.assert.isEqualTo(
                    jsobjFields.at(3).getValue(),
                    'The last name: JONES');

                test.assert.isEqualTo(
                    xmlFields.at(4).getValue(),
                    'The index: 2');
                test.assert.isEqualTo(
                    jsonFields.at(4).getValue(),
                    'The index: 1');
                test.assert.isEqualTo(
                    jsobjFields.at(4).getValue(),
                    'The index: 1');

                test.assert.isEqualTo(
                    xmlFields.at(5).getValue(),
                    'The first name: John');
                test.assert.isEqualTo(
                    jsonFields.at(5).getValue(),
                    'The middle name: Jay');
                test.assert.isEqualTo(
                    jsobjFields.at(5).getValue(),
                    'The last name: Jones');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Table - XML data source - repeating context', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindTableXMLRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    dataRows,
                    dataCells;

                windowContext = test.getDriver().get('windowContext');

                dataRows = TP.byCSSPath(
                    'tr', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataRows.getSize(), 4);

                dataCells = TP.byCSSPath(
                    'td', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataCells.getSize(), 12);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(0)),
                    '1');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(1)),
                    'Joe');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(2)),
                    'Smith');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(3)),
                    '2');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(4)),
                    'John');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(5)),
                    'Jones');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(6)),
                    '3');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(7)),
                    'Billy');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(8)),
                    'Homemaker');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(9)),
                    '4');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(10)),
                    'Pamela');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(11)),
                    'Professional');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Table - JSON data source - repeating context', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindTableJSONRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    dataRows,
                    dataCells;

                windowContext = test.getDriver().get('windowContext');

                dataRows = TP.byCSSPath(
                    'tr', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataRows.getSize(), 4);

                dataCells = TP.byCSSPath(
                    'td', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataCells.getSize(), 12);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(0)),
                    '0');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(1)),
                    'Joe');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(2)),
                    'Smith');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(3)),
                    '1');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(4)),
                    'John');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(5)),
                    'Jones');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(6)),
                    '2');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(7)),
                    'Billy');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(8)),
                    'Homemaker');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(9)),
                    '3');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(10)),
                    'Pamela');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(11)),
                    'Professional');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Table - JavaScript Object data source - repeating context', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindTableJSObjRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    dataRows,
                    dataCells;

                windowContext = test.getDriver().get('windowContext');

                dataRows = TP.byCSSPath(
                    'tr', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataRows.getSize(), 4);

                dataCells = TP.byCSSPath(
                    'td', TP.byId('people', windowContext, false), false, false);
                test.assert.isEqualTo(dataCells.getSize(), 12);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(0)),
                    '0');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(1)),
                    'Joe');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(2)),
                    'Smith');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(3)),
                    '1');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(4)),
                    'John');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(5)),
                    'Jones');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(6)),
                    '2');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(7)),
                    'Billy');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(8)),
                    'Homemaker');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(9)),
                    '3');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(10)),
                    'Pamela');
                test.assert.isEqualTo(
                    TP.nodeGetTextContent(dataCells.at(11)),
                    'Professional');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
}).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: standalone expressions',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.afterEach(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('standalone expressions - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindStandaloneExpressionsXML.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var fields;

                fields = TP.byCSSPath('span[bind|in]');

                test.assert.isEqualTo(
                    fields.at(0).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(1).getValue(),
                    'Smith');

                test.assert.isEqualTo(
                    fields.at(2).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(3).getValue(),
                    'Smith');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('standalone expressions - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindStandaloneExpressionsJSON.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var fields;

                fields = TP.byCSSPath('span[bind|in]');

                test.assert.isEqualTo(
                    fields.at(0).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(1).getValue(),
                    'Smith');

                test.assert.isEqualTo(
                    fields.at(2).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(3).getValue(),
                    'Smith');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('standalone expressions - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindStandaloneExpressionsJSObj.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var fields;

                fields = TP.byCSSPath('span[bind|in]');

                test.assert.isEqualTo(
                    fields.at(0).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(1).getValue(),
                    'Smith');

                test.assert.isEqualTo(
                    fields.at(2).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(3).getValue(),
                    'Smith');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: insert into repeat',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
        });

    //  ---

    this.it('insert into repeat - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLInsert.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    insertBeforeBeginButton,
                    insertAfterBeginButton,
                    insertBeforeEndButton,
                    insertAfterEndButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                insertBeforeBeginButton =
                    TP.byId('insertBeforeBegin', windowContext);

                insertAfterBeginButton =
                    TP.byId('insertAfterBegin', windowContext);

                insertBeforeEndButton =
                    TP.byId('insertBeforeEnd', windowContext);

                insertAfterEndButton =
                    TP.byId('insertAfterEnd', windowContext);

                //  NB: We start with 3 rows

                //  Insert empty row before the first row

                test.getDriver().constructSequence().
                    click(insertBeforeBeginButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(0).get('value'));
                        test.assert.isEmpty(fields.at(1).get('value'));
                    });

                //  Insert empty row after the first row

                test.getDriver().constructSequence().
                    click(insertAfterBeginButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the second row
                        test.assert.isEmpty(fields.at(2).get('value'));
                        test.assert.isEmpty(fields.at(3).get('value'));
                    });

                //  Insert empty row before the last row

                test.getDriver().constructSequence().
                    click(insertBeforeEndButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the fifth row
                        test.assert.isEmpty(fields.at(8).get('value'));
                        test.assert.isEmpty(fields.at(9).get('value'));
                    });

                //  Insert empty row after the last row

                test.getDriver().constructSequence().
                    click(insertAfterEndButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the seventh row
                        test.assert.isEmpty(fields.at(12).get('value'));
                        test.assert.isEmpty(fields.at(13).get('value'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONInsert.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    insertBeforeBeginButton,
                    insertAfterBeginButton,
                    insertBeforeEndButton,
                    insertAfterEndButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                insertBeforeBeginButton =
                    TP.byId('insertBeforeBegin', windowContext);

                insertAfterBeginButton =
                    TP.byId('insertAfterBegin', windowContext);

                insertBeforeEndButton =
                    TP.byId('insertBeforeEnd', windowContext);

                insertAfterEndButton =
                    TP.byId('insertAfterEnd', windowContext);

                //  NB: We start with 3 rows

                //  Insert empty row before the first row

                test.getDriver().constructSequence().
                    click(insertBeforeBeginButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(0).get('value'));
                        test.assert.isEmpty(fields.at(1).get('value'));
                    });

                //  Insert empty row after the first row

                test.getDriver().constructSequence().
                    click(insertAfterBeginButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(2).get('value'));
                        test.assert.isEmpty(fields.at(3).get('value'));
                    });

                //  Insert empty row before the last row

                test.getDriver().constructSequence().
                    click(insertBeforeEndButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(8).get('value'));
                        test.assert.isEmpty(fields.at(9).get('value'));
                    });

                //  Insert empty row after the last row

                test.getDriver().constructSequence().
                    click(insertAfterEndButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(12).get('value'));
                        test.assert.isEmpty(fields.at(13).get('value'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjInsert.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    insertBeforeBeginButton,
                    insertAfterBeginButton,
                    insertBeforeEndButton,
                    insertAfterEndButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                insertBeforeBeginButton =
                    TP.byId('insertBeforeBegin', windowContext);

                insertAfterBeginButton =
                    TP.byId('insertAfterBegin', windowContext);

                insertBeforeEndButton =
                    TP.byId('insertBeforeEnd', windowContext);

                insertAfterEndButton =
                    TP.byId('insertAfterEnd', windowContext);

                //  NB: We start with 3 rows

                //  Insert empty row before the first row

                test.getDriver().constructSequence().
                    click(insertBeforeBeginButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(0).get('value'));
                        test.assert.isEmpty(fields.at(1).get('value'));
                    });

                //  Insert empty row after the first row

                test.getDriver().constructSequence().
                    click(insertAfterBeginButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(2).get('value'));
                        test.assert.isEmpty(fields.at(3).get('value'));
                    });

                //  Insert empty row before the last row

                test.getDriver().constructSequence().
                    click(insertBeforeEndButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(8).get('value'));
                        test.assert.isEmpty(fields.at(9).get('value'));
                    });

                //  Insert empty row after the last row

                test.getDriver().constructSequence().
                    click(insertAfterEndButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname and firstname of the first row
                        test.assert.isEmpty(fields.at(12).get('value'));
                        test.assert.isEmpty(fields.at(13).get('value'));
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);
}).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: delete from repeat',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
        });

    //  ---

    this.it('delete from repeat - XML data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLDelete.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    deleteFirstRowButton,
                    deleteLastRowButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                deleteFirstRowButton =
                    TP.byId('deleteFirstRow', windowContext);

                deleteLastRowButton =
                    TP.byId('deleteLastRow', windowContext);

                //  NB: We start with 3 rows

                //  Delete the first row

                test.getDriver().constructSequence().
                    click(deleteFirstRowButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname of the first row
                        test.assert.isEqualTo(
                            fields.at(1).get('value'),
                            'Jones');
                    });

                //  Delete the last row

                test.getDriver().constructSequence().
                    click(deleteLastRowButton).
                    run();

                test.chain(
                    function() {
                        //  There should only be 2 text fields left under the
                        //  repeater.
                        var repeater,
                            fields;

                        repeater = TP.byId('repeater', windowContext);

                        fields = TP.byCSSPath('input', repeater);

                        test.assert.isSizeOf(fields, 2);
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('delete from repeat - JSON data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONDelete.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    deleteFirstRowButton,
                    deleteLastRowButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                deleteFirstRowButton =
                    TP.byId('deleteFirstRow', windowContext);

                deleteLastRowButton =
                    TP.byId('deleteLastRow', windowContext);

                //  NB: We start with 3 rows

                //  Delete the first row

                test.getDriver().constructSequence().
                    click(deleteFirstRowButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname of the first row
                        test.assert.isEqualTo(
                            fields.at(1).get('value'),
                            'Jones');
                    });

                //  Delete the last row

                test.getDriver().constructSequence().
                    click(deleteLastRowButton).
                    run();

                test.chain(
                    function() {
                        //  There should only be 2 text fields left under the
                        //  repeater.
                        var repeater,
                            fields;

                        repeater = TP.byId('repeater', windowContext);

                        fields = TP.byCSSPath('input', repeater);

                        test.assert.isSizeOf(fields, 2);
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('delete from repeat - JavaScript Object data source', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjDelete.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function() {
                var windowContext,

                    deleteFirstRowButton,
                    deleteLastRowButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_people'),
                        'TP.sig.ValueChange');

                deleteFirstRowButton =
                    TP.byId('deleteFirstRow', windowContext);

                deleteLastRowButton =
                    TP.byId('deleteLastRow', windowContext);

                //  NB: We start with 3 rows

                //  Delete the first row

                test.getDriver().constructSequence().
                    click(deleteFirstRowButton).
                    run();

                test.chain(
                    function() {
                        var fields;

                        fields = TP.byCSSPath('#repeater input[type="text"]',
                                                windowContext);

                        //  The lastname of the first row
                        test.assert.isEqualTo(
                            fields.at(1).get('value'),
                            'Jones');
                    });

                //  Delete the last row

                test.getDriver().constructSequence().
                    click(deleteLastRowButton).
                    run();

                test.chain(
                    function() {
                        //  There should only be 2 text fields left under the
                        //  repeater.
                        var repeater,
                            fields;

                        repeater = TP.byId('repeater', windowContext);

                        fields = TP.byCSSPath('input', repeater);

                        test.assert.isSizeOf(fields, 2);
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: direct to UI expressions',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.afterEach(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('direct to UI expressions - UI control values, with scheme', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindDirectUIValuesWithScheme.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    sourceField,
                    destinationWholeField,
                    destinationPartialField;

                windowContext = test.getDriver().get('windowContext');

                sourceField = TP.byId('sourceField', windowContext);
                destinationWholeField = TP.byId('destinationWholeField', windowContext);
                destinationPartialField = TP.byId('destinationPartialField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        sourceField.clearValue();
                    }).
                    sendKeys('Joe Smith', sourceField).
                    sendEvent(TP.hc('type', 'change'), sourceField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            destinationWholeField.get('value'),
                            'Joe Smith');

                        test.assert.isEqualTo(
                            destinationPartialField.get('value'),
                            'The name is: Joe Smith');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('direct to UI expressions - UI control attributes, with scheme', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindDirectUIAttributesWithScheme.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    sourceField,
                    destinationWholeField,
                    destinationPartialField;

                windowContext = test.getDriver().get('windowContext');

                sourceField = TP.byId('sourceField', windowContext);
                destinationWholeField = TP.byId('destinationWholeField', windowContext);
                destinationPartialField = TP.byId('destinationPartialField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        sourceField.clearValue();
                    }).
                    sendKeys('Mike Jones', sourceField).
                    sendEvent(TP.hc('type', 'change'), sourceField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            destinationWholeField.get('value'),
                            'Mike Jones');

                        test.assert.isEqualTo(
                            destinationPartialField.get('value'),
                            'The name is: Mike Jones');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('direct to UI expressions - UI control values, no scheme', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindDirectUIValuesNoScheme.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    sourceField,
                    destinationWholeField,
                    destinationPartialField;

                windowContext = test.getDriver().get('windowContext');

                sourceField = TP.byId('sourceField', windowContext);
                destinationWholeField = TP.byId('destinationWholeField', windowContext);
                destinationPartialField = TP.byId('destinationPartialField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        sourceField.clearValue();
                    }).
                    sendKeys('Joe Smith', sourceField).
                    sendEvent(TP.hc('type', 'change'), sourceField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            destinationWholeField.get('value'),
                            'Joe Smith');

                        test.assert.isEqualTo(
                            destinationPartialField.get('value'),
                            'The name is: Joe Smith');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('direct to UI expressions - UI control attributes, no scheme', function(test, options) {

        loadURI = TP.uc('~lib_test/src/bind/BindDirectUIAttributesNoScheme.xhtml');

        this.getDriver().setLocation(loadURI);

        test.chain(
            function() {

                var windowContext,

                    sourceField,
                    destinationWholeField,
                    destinationPartialField;

                windowContext = test.getDriver().get('windowContext');

                sourceField = TP.byId('sourceField', windowContext);
                destinationWholeField = TP.byId('destinationWholeField', windowContext);
                destinationPartialField = TP.byId('destinationPartialField', windowContext);

                test.getDriver().constructSequence().
                    exec(function() {
                        sourceField.clearValue();
                    }).
                    sendKeys('Mike Jones', sourceField).
                    sendEvent(TP.hc('type', 'change'), sourceField).
                    run();

                test.chain(
                    function() {
                        test.assert.isEqualTo(
                            destinationWholeField.get('value'),
                            'Mike Jones');

                        test.assert.isEqualTo(
                            destinationPartialField.get('value'),
                            'The name is: Mike Jones');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'headless');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
