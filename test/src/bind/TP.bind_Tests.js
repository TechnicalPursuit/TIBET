//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ------------------------------------------------------------------------
//  Test Types
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.testtype');

TP.test.testtype.Type.defineAttribute('typeAttr', 'typeAttrVal');
TP.test.testtype.Inst.defineAttribute('instAttr', 'instAttrVal');

//  ------------------------------------------------------------------------

TP.test.testtype.Type.defineMethod(
'getTypeMethodVal',
function() {

    return 'test.testtype.typeMethod val';
});

//  ------------------------------------------------------------------------

TP.test.testtype.Inst.defineMethod(
'getInstMethodVal',
function() {

    return 'test.testtype.instMethod val';
});

//  ------------------------------------------------------------------------
//  Test Tag Types
//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('test:person');
TP.test.person.Type.set('booleanAttrs', TP.ac('ismale'));
TP.test.person.defineAttribute('styleURI', TP.NO_RESULT);
TP.test.person.defineAttribute('themeURI', TP.NO_RESULT);

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
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        async function(test, options) {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('path slicing - XML data source', async function(test, options) {

        var firstNameField1,
            firstNameField2,
            firstNameField3,
            firstNameField4,
            firstNameField5;

        loadURI = TP.uc('~lib_test/src/bind/BindPathSlicingXML.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            firstNameField1.clearValue();
                        }).
                        sendKeys('Johnny', firstNameField1).
                        sendEvent(TP.hc('type', 'change'), firstNameField1).
                        run();

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

        //  Field #2

        await driver.constructSequence().
                        exec(function() {
                            firstNameField2.clearValue();
                        }).
                        sendKeys('Jimmy', firstNameField2).
                        sendEvent(TP.hc('type', 'change'), firstNameField2).
                        run();

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

        //  Field #3

        await driver.constructSequence().
                        exec(function() {
                            firstNameField3.clearValue();
                        }).
                        sendKeys('Jerry', firstNameField3).
                        sendEvent(TP.hc('type', 'change'), firstNameField3).
                        run();

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

        //  Field #4

        await driver.constructSequence().
                        exec(function() {
                            firstNameField4.clearValue();
                        }).
                        sendKeys('Jacob', firstNameField4).
                        sendEvent(TP.hc('type', 'change'), firstNameField4).
                        run();

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

        //  Field #5

        await driver.constructSequence().
                        exec(function() {
                            firstNameField5.clearValue();
                        }).
                        sendKeys('Justin', firstNameField5).
                        sendEvent(TP.hc('type', 'change'), firstNameField5).
                        run();

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

    //  ---

    this.it('path slicing - JSON data source', async function(test, options) {

        var firstNameField1,
            firstNameField2,
            firstNameField3,
            firstNameField4,
            firstNameField5;

        loadURI = TP.uc('~lib_test/src/bind/BindPathSlicingJSON.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            firstNameField1.clearValue();
                        }).
                        sendKeys('Johnny', firstNameField1).
                        sendEvent(TP.hc('type', 'change'), firstNameField1).
                        run();

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

        //  Field #2

        await driver.constructSequence().
                        exec(function() {
                            firstNameField2.clearValue();
                        }).
                        sendKeys('Jimmy', firstNameField2).
                        sendEvent(TP.hc('type', 'change'), firstNameField2).
                        run();

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

        //  Field #3

        await driver.constructSequence().
                        exec(function() {
                            firstNameField3.clearValue();
                        }).
                        sendKeys('Jerry', firstNameField3).
                        sendEvent(TP.hc('type', 'change'), firstNameField3).
                        run();

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

        //  Field #4

        await driver.constructSequence().
                        exec(function() {
                            firstNameField4.clearValue();
                        }).
                        sendKeys('Jacob', firstNameField4).
                        sendEvent(TP.hc('type', 'change'), firstNameField4).
                        run();

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

        //  Field #5

        await driver.constructSequence().
                        exec(function() {
                            firstNameField5.clearValue();
                        }).
                        sendKeys('Justin', firstNameField5).
                        sendEvent(TP.hc('type', 'change'), firstNameField5).
                        run();

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

    //  ---

    this.it('path slicing - JavaScript Object data source', async function(test, options) {

        var firstNameField1,
            firstNameField2,
            firstNameField3,
            firstNameField4,
            firstNameField5;

        loadURI = TP.uc('~lib_test/src/bind/BindPathSlicingJSObj.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            firstNameField1.clearValue();
                        }).
                        sendKeys('Johnny', firstNameField1).
                        sendEvent(TP.hc('type', 'change'), firstNameField1).
                        run();

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

        //  Field #2

        await driver.constructSequence().
                        exec(function() {
                            firstNameField2.clearValue();
                        }).
                        sendKeys('Jimmy', firstNameField2).
                        sendEvent(TP.hc('type', 'change'), firstNameField2).
                        run();

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

        //  Field #3

        await driver.constructSequence().
                        exec(function() {
                            firstNameField3.clearValue();
                        }).
                        sendKeys('Jerry', firstNameField3).
                        sendEvent(TP.hc('type', 'change'), firstNameField3).
                        run();

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

        //  Field #4

        await driver.constructSequence().
                        exec(function() {
                            firstNameField4.clearValue();
                        }).
                        sendKeys('Jacob', firstNameField4).
                        sendEvent(TP.hc('type', 'change'), firstNameField4).
                        run();

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

        //  Field #5

        await driver.constructSequence().
                        exec(function() {
                            firstNameField5.clearValue();
                        }).
                        sendKeys('Justin', firstNameField5).
                        sendEvent(TP.hc('type', 'change'), firstNameField5).
                        run();

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
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: simple binds',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        async function(test, options) {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('simple binding with text fields - XML data source', async function(test, options) {

        var modelObj,
            lastNameField;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXML.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work
    });

    //  ---

    this.it('simple binding with various XHTML controls - XML data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXMLAllXHTMLControls.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/color')),
            'red, blue');
    });

    //  ---

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - XML data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXMLNoFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/color')),
            'red, blue');
    });

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - XML data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXMLSingleFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/color')),
            'red, blue');
    });

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - XML data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleXMLMultiFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('/person/color')),
            'red, blue');
    });

    //  ---

    this.it('simple binding with text fields - JSON data source', async function(test, options) {

        var modelObj,
            lastNameField;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSON.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work
    });

    //  ---

    this.it('simple binding with various XHTML controls - JSON data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSONAllXHTMLControls.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.color')),
            TP.ac('red', 'blue'));
    });

    //  ---

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - JSON data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSONNoFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.color')),
            TP.ac('red', 'blue'));
    });

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - JSON data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSONSingleFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.color')),
            TP.ac('red', 'blue'));
    });

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - JSON data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSONMultiFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.person.color')),
            TP.ac('red', 'blue'));
    });

    //  ---

    this.it('simple binding with text fields - JavaScript Object data source', async function(test, options) {

        var modelObj,
            lastNameField;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObj.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work
    });

    //  ---

    this.it('simple binding with various XHTML controls - JavaScript Object data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObjAllXHTMLControls.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.color')),
            TP.ac('red', 'blue'));
    });

    //  ---

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - JavaScript Object data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObjNoFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.color')),
            TP.ac('red', 'blue'));
    });

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - JavaScript Object data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObjSingleFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.color')),
            TP.ac('red', 'blue'));
    });

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - JavaScript Object data source', async function(test, options) {

        var modelObj,
            lastNameField,
            descriptionField,
            genderField,
            genderFieldOption1,
            petRadio3,
            colorCheckbox1;

        loadURI = TP.uc('~lib_test/src/bind/BindSimpleJSObjMultiFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField.clearValue();
                        }).
                        sendKeys('Jones', lastNameField).
                        sendEvent(TP.hc('type', 'change'), lastNameField).
                        run();

        test.assert.isEqualTo(
            lastNameField.get('value'),
            'Jones');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.lastname')),
            'Jones');

        //  firstNameField is just another text field - same logic
        //  should work

        descriptionField = TP.byId('descriptionField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            descriptionField.clearValue();
                        }).
                        sendKeys('She is great!', descriptionField).
                        sendEvent(TP.hc('type', 'change'), descriptionField).
                        run();

        test.assert.isEqualTo(
            descriptionField.get('value'),
            'She is great!');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.description')),
            'She is great!');

        genderField = TP.byId('genderField', windowContext);
        genderFieldOption1 = genderField.getValueElements().at(0);

        await driver.constructSequence().
                        click(genderFieldOption1).
                        run();

        test.assert.isEqualTo(
            genderField.get('value'),
            'm');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.gender')),
            'm');

        petRadio3 = TP.byId('petRadio3', windowContext);

        await driver.constructSequence().
                        click(petRadio3).
                        run();

        test.assert.isEqualTo(
            petRadio3.get('value'),
            'fish');

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.pet')),
            'fish');

        colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

        await driver.constructSequence().
                        click(colorCheckbox1).
                        run();

        test.assert.isEqualTo(
            colorCheckbox1.get('value'),
            TP.ac('red', 'blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('person.color')),
            TP.ac('red', 'blue'));
    });
}).timeout(45000);

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: numerically indexed binds',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        async function(test, options) {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('simple numeric indexed binds - XML data source', async function(test, options) {

        var modelObj,
            lastNameField1,
            lastNameField2;

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedXML.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/lastname')),
            'Lyon');

        lastNameField2 = TP.byId('lastNameField2', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            lastNameField2.clearValue();
                        }).
                        sendKeys('Weber', lastNameField2).
                        sendEvent(TP.hc('type', 'change'), lastNameField2).
                        run();

        test.assert.isEqualTo(
            lastNameField2.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[2]/lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });

    //  ---

    this.it('simple numeric indexed binds with scoping - XML data source', async function(test, options) {

        var modelObj,
            lastNameField1,
            lastNameField2;

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedXMLWithScopes.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/lastname')),
            'Lyon');

        lastNameField2 = TP.byId('lastNameField2', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            lastNameField2.clearValue();
                        }).
                        sendKeys('Weber', lastNameField2).
                        sendEvent(TP.hc('type', 'change'), lastNameField2).
                        run();

        test.assert.isEqualTo(
            lastNameField2.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[2]/lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });

    //  ---

    this.it('simple numeric indexed binds - JSON data source', async function(test, options) {

        var modelObj,
            lastNameField1,
            lastNameField2;

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedJSON.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].lastname')),
            'Lyon');

        lastNameField2 = TP.byId('lastNameField2', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            lastNameField2.clearValue();
                        }).
                        sendKeys('Weber', lastNameField2).
                        sendEvent(TP.hc('type', 'change'), lastNameField2).
                        run();

        test.assert.isEqualTo(
            lastNameField2.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[1].lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });

    //  ---

    this.it('simple numeric indexed binds with scoping - JSON data source', async function(test, options) {

        var modelObj,
            lastNameField1,
            lastNameField2;

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedJSONWithScopes.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].lastname')),
            'Lyon');

        lastNameField2 = TP.byId('lastNameField2', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            lastNameField2.clearValue();
                        }).
                        sendKeys('Weber', lastNameField2).
                        sendEvent(TP.hc('type', 'change'), lastNameField2).
                        run();

        test.assert.isEqualTo(
            lastNameField2.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[1].lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });

    //  ---

    this.it('simple numeric indexed binds - JavaScript Object data source', async function(test, options) {

        var modelObj,
            lastNameField1,
            lastNameField2;

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedJSObj.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].lastname')),
            'Lyon');

        lastNameField2 = TP.byId('lastNameField2', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            lastNameField2.clearValue();
                        }).
                        sendKeys('Weber', lastNameField2).
                        sendEvent(TP.hc('type', 'change'), lastNameField2).
                        run();

        test.assert.isEqualTo(
            lastNameField2.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[1].lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });

    //  ---

    this.it('simple numeric indexed binds with scoping - JavaScript Object data source', async function(test, options) {

        var modelObj,
            lastNameField1,
            lastNameField2;

        loadURI = TP.uc('~lib_test/src/bind/BindNumericIndexedJSObjWithScopes.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].lastname')),
            'Lyon');

        lastNameField2 = TP.byId('lastNameField2', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            lastNameField2.clearValue();
                        }).
                        sendKeys('Weber', lastNameField2).
                        sendEvent(TP.hc('type', 'change'), lastNameField2).
                        run();

        test.assert.isEqualTo(
            lastNameField2.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[1].lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: bind repeats',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        async function(test, options) {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('repeat binding with text fields - XML data source', async function(test, options) {

        var modelObj,

            inputFields,

            lastNameField1,
            lastNameField2;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXML.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/lastname')),
            'Lyon');

        await driver.constructSequence().
                        exec(function() {
                            lastNameField2.clearValue();
                        }).
                        sendKeys('Weber', lastNameField2).
                        sendEvent(TP.hc('type', 'change'), lastNameField2).
                        run();

        test.assert.isEqualTo(
            lastNameField2.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[2]/lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });

    //  ---

    this.it('nested repeat binding with text fields - XML data source', async function(test, options) {

        var modelObj,

            inputFields,

            lastNameField1,
            lastNameField2,
            addressStreetField11,
            addressStreetField12,
            addressCityField21,
            addressCityField22;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLNested.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/lastname')),
            'Lyon');

        await driver.constructSequence().
                        exec(function() {
                            lastNameField2.clearValue();
                        }).
                        sendKeys('Weber', lastNameField2).
                        sendEvent(TP.hc('type', 'change'), lastNameField2).
                        run();

        test.assert.isEqualTo(
            lastNameField2.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[2]/lastname')),
            'Weber');

        await driver.constructSequence().
                        exec(function() {
                            addressStreetField11.clearValue();
                        }).
                        sendKeys('555 3rd Av', addressStreetField11).
                        sendEvent(TP.hc('type', 'change'), addressStreetField11).
                        run();

        test.assert.isEqualTo(
            addressStreetField11.get('value'),
            '555 3rd Av');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/addresses/address[1]/street')),
            '555 3rd Av');

        await driver.constructSequence().
                        exec(function() {
                            addressCityField22.clearValue();
                        }).
                        sendKeys('The Main Town', addressCityField22).
                        sendEvent(TP.hc('type', 'change'), addressCityField22).
                        run();

        test.assert.isEqualTo(
            addressCityField22.get('value'),
            'The Main Town');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[2]/addresses/address[2]/city')),
            'The Main Town');

        //  All of the others are just other text fields - same logic
        //  should work
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields - JSON data source', async function(test, options) {

        var modelObj,

            inputFields,

            lastNameField0,
            lastNameField1;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSON.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField0.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField0).
                        sendEvent(TP.hc('type', 'change'), lastNameField0).
                        run();

        test.assert.isEqualTo(
            lastNameField0.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].lastname')),
            'Lyon');

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Weber', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[1].lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });

    //  ---

    this.it('nested repeat binding with text fields - JSON data source', async function(test, options) {

        var modelObj,

            inputFields,

            lastNameField0,
            lastNameField1,
            addressStreetField00,
            addressStreetField01,
            addressCityField10,
            addressCityField11;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONNested.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField0.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField0).
                        sendEvent(TP.hc('type', 'change'), lastNameField0).
                        run();

        test.assert.isEqualTo(
            lastNameField0.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].lastname')),
            'Lyon');

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Weber', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[1].lastname')),
            'Weber');

        await driver.constructSequence().
                        exec(function() {
                            addressStreetField00.clearValue();
                        }).
                        sendKeys('555 3rd Av', addressStreetField00).
                        sendEvent(TP.hc('type', 'change'), addressStreetField00).
                        run();

        test.assert.isEqualTo(
            addressStreetField00.get('value'),
            '555 3rd Av');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].addresses[0].street')),
            '555 3rd Av');

        await driver.constructSequence().
                        exec(function() {
                            addressCityField11.clearValue();
                        }).
                        sendKeys('The Main Town', addressCityField11).
                        sendEvent(TP.hc('type', 'change'), addressCityField11).
                        run();

        test.assert.isEqualTo(
            addressCityField11.get('value'),
            'The Main Town');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[1].addresses[1].city')),
            'The Main Town');

        //  All of the others are just other text fields - same logic
        //  should work
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields - JavaScript Object data source', async function(test, options) {

        var modelObj,

            inputFields,

            lastNameField0,
            lastNameField1;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObj.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField0.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField0).
                        sendEvent(TP.hc('type', 'change'), lastNameField0).
                        run();

        test.assert.isEqualTo(
            lastNameField0.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].lastname')),
            'Lyon');

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Weber', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[1].lastname')),
            'Weber');

        //  firstNameField1 and firstNameField2 are just other text
        //  fields - same logic should work
    });

    //  ---

    this.it('nested repeat binding with text fields - JavaScript Object data source', async function(test, options) {

        var modelObj,

            inputFields,

            lastNameField0,
            lastNameField1,
            addressStreetField00,
            addressStreetField01,
            addressCityField10,
            addressCityField11;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjNested.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            lastNameField0.clearValue();
                        }).
                        sendKeys('Lyon', lastNameField0).
                        sendEvent(TP.hc('type', 'change'), lastNameField0).
                        run();

        test.assert.isEqualTo(
            lastNameField0.get('value'),
            'Lyon');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].lastname')),
            'Lyon');

        await driver.constructSequence().
                        exec(function() {
                            lastNameField1.clearValue();
                        }).
                        sendKeys('Weber', lastNameField1).
                        sendEvent(TP.hc('type', 'change'), lastNameField1).
                        run();

        test.assert.isEqualTo(
            lastNameField1.get('value'),
            'Weber');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[1].lastname')),
            'Weber');

        await driver.constructSequence().
                        exec(function() {
                            addressStreetField00.clearValue();
                        }).
                        sendKeys('555 3rd Av', addressStreetField00).
                        sendEvent(TP.hc('type', 'change'), addressStreetField00).
                        run();

        test.assert.isEqualTo(
            addressStreetField00.get('value'),
            '555 3rd Av');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].addresses[0].street')),
            '555 3rd Av');

        await driver.constructSequence().
                        exec(function() {
                            addressCityField11.clearValue();
                        }).
                        sendKeys('The Main Town', addressCityField11).
                        sendEvent(TP.hc('type', 'change'), addressCityField11).
                        run();

        test.assert.isEqualTo(
            addressCityField11.get('value'),
            'The Main Town');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[1].addresses[1].city')),
            'The Main Town');

        //  All of the others are just other text fields - same logic
        //  should work
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields and paging - XML data source', async function(test, options) {

        var inputFields,

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

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLPaging.xhtml');

        await driver.setLocation(loadURI);

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
            '0');

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('4', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('1', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

        await driver.constructSequence().
                        exec(function() {
                            repeatIndexField.clearValue();
                        }).
                        sendKeys('1', repeatIndexField).
                        sendEvent(TP.hc('type', 'change'), repeatIndexField).
                        run();

        test.assert.isEqualTo(
            repeatSizeField.get('value'),
            '1');

        test.assert.isEqualTo(
            repeatIndexField.get('value'),
            '1');

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

    //  ---

    this.it('nested repeat binding with text fields and paging - XML data source', async function(test, options) {

        var inputFields,

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

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLNestedPaging.xhtml');

        await driver.setLocation(loadURI);

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
            '0');

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

        await driver.constructSequence().
            exec(function() {
                repeatSizeField.clearValue();
            }).
            sendKeys('4', repeatSizeField).
            sendEvent(TP.hc('type', 'change'), repeatSizeField).
            run();

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('1', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

        await driver.constructSequence().
                        exec(function() {
                            repeatIndexField.clearValue();
                        }).
                        sendKeys('1', repeatIndexField).
                        sendEvent(TP.hc('type', 'change'), repeatIndexField).
                        run();

        test.assert.isEqualTo(
            repeatSizeField.get('value'),
            '1');

        test.assert.isEqualTo(
            repeatIndexField.get('value'),
            '1');

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

    //  ---

    this.it('repeat binding with text fields and paging - JSON data source', async function(test, options) {

        var inputFields,

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

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONPaging.xhtml');

        await driver.setLocation(loadURI);

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
            '0');

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('4', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('1', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

        await driver.constructSequence().
                        exec(function() {
                            repeatIndexField.clearValue();
                        }).
                        sendKeys('1', repeatIndexField).
                        sendEvent(TP.hc('type', 'change'), repeatIndexField).
                        run();

        test.assert.isEqualTo(
            repeatSizeField.get('value'),
            '1');

        test.assert.isEqualTo(
            repeatIndexField.get('value'),
            '1');

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

    //  ---

    this.it('nested repeat binding with text fields and paging - JSON data source', async function(test, options) {

        var inputFields,

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

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONNestedPaging.xhtml');

        await driver.setLocation(loadURI);

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
            '0');

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('4', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('1', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

        await driver.constructSequence().
                        exec(function() {
                            repeatIndexField.clearValue();
                        }).
                        sendKeys('1', repeatIndexField).
                        sendEvent(TP.hc('type', 'change'), repeatIndexField).
                        run();

        test.assert.isEqualTo(
            repeatSizeField.get('value'),
            '1');

        test.assert.isEqualTo(
            repeatIndexField.get('value'),
            '1');

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

    //  ---

    this.it('repeat binding with text fields and paging - JavaScript Object data source', async function(test, options) {

        var inputFields,

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

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjPaging.xhtml');

        await driver.setLocation(loadURI);

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
            '0');

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('4', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('1', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

        await driver.constructSequence().
                        exec(function() {
                            repeatIndexField.clearValue();
                        }).
                        sendKeys('1', repeatIndexField).
                        sendEvent(TP.hc('type', 'change'), repeatIndexField).
                        run();

        test.assert.isEqualTo(
            repeatSizeField.get('value'),
            '1');

        test.assert.isEqualTo(
            repeatIndexField.get('value'),
            '1');

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

    //  ---

    this.it('nested repeat binding with text fields and paging - JavaScript Object data source', async function(test, options) {

        var inputFields,

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

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjNestedPaging.xhtml');

        await driver.setLocation(loadURI);

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
            '0');

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('4', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

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

        await driver.constructSequence().
                        exec(function() {
                            repeatSizeField.clearValue();
                        }).
                        sendKeys('1', repeatSizeField).
                        sendEvent(TP.hc('type', 'change'), repeatSizeField).
                        run();

        await driver.constructSequence().
                        exec(function() {
                            repeatIndexField.clearValue();
                        }).
                        sendKeys('1', repeatIndexField).
                        sendEvent(TP.hc('type', 'change'), repeatIndexField).
                        run();

        test.assert.isEqualTo(
            repeatSizeField.get('value'),
            '1');

        test.assert.isEqualTo(
            repeatIndexField.get('value'),
            '1');

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
}).timeout(60000);

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: static tables',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.afterEach(
        async function(test, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('Simple table - XML data source', async function(test, options) {

        var dataRows,
            dataCells;

        loadURI = TP.uc('~lib_test/src/bind/BindStaticTableXML.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('Simple table - JSON data source', async function(test, options) {

        var dataRows,
            dataCells;

        loadURI = TP.uc('~lib_test/src/bind/BindStaticTableJSON.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('Simple table - JavaScript Object data source', async function(test, options) {

        var dataRows,
            dataCells;

        loadURI = TP.uc('~lib_test/src/bind/BindStaticTableJSObj.xhtml');

        await driver.setLocation(loadURI);

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
    });
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: inline bind expressions',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.afterEach(
        async function(test, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('whole attribute expression - XML data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeXML.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'red');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/color')),
            'red');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('purple', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'purple');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/color')),
            'purple');
    });

    //  ---

    this.it('whole attribute expression, no fragment, qualified binding - XML data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeNoFragmentXML.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'green');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[2]/color')),
            'green');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('yellow', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'yellow');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[2]/color')),
            'yellow');
    });

    //  ---

    this.it('whole attribute expression, single-level fragment, qualified binding - XML data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeSingleFragmentXML.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[3]/color')),
            'blue');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('orange', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'orange');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[3]/color')),
            'orange');
    });

    //  ---

    this.it('whole attribute expression, multi-level fragment, qualified binding - XML data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeMultiFragmentXML.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'yellow');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[4]/color')),
            'yellow');

        await driver.constructSequence().
                            exec(function() {
                                colorField.clearValue();
                            }).
                            sendKeys('blue', colorField).
                            sendEvent(TP.hc('type', 'change'), colorField).
                            run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[4]/color')),
            'blue');
    });

    //  ---

    this.it('partial attribute expression - XML data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeXML.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('purple', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, no fragment, qualified binding - XML data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeNoFragmentXML.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('yellow', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, single-level fragment, qualified binding - XML data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeSingleFragmentXML.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('orange', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, multi-level fragment, qualified binding - XML data source', async function(test, options) {

        var modelObj,

            colorField1,
            colorSpan1,

            colorField2,
            colorSpan2;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeMultiFragmentXML.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField1 = TP.byId('colorField1', windowContext);
        colorSpan1 = TP.byId('colorSpan1', windowContext);

        test.assert.isEqualTo(
            colorField1.get('value'),
            'yellow');

        //  NB: We convert this into a TP.gui.Color object to compare
        //  - depending on platform, getComputedStyleProperty will
        //  return RGB values, etc.
        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan1.getComputedStyleProperty('backgroundColor')),
            TP.gui.Color.fromString('yellow'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[4]/color')),
            'yellow');

        await driver.constructSequence().
                        exec(function() {
                            colorField1.clearValue();
                        }).
                        sendKeys('blue', colorField1).
                        sendEvent(TP.hc('type', 'change'), colorField1).
                        run();

        test.assert.isEqualTo(
            colorField1.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan1.getComputedStyleProperty(
                                        'backgroundColor')),
            TP.gui.Color.fromString('blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[4]/color')),
            'blue');

        //  ---

        colorField2 = TP.byId('colorField2', windowContext);
        colorSpan2 = TP.byId('colorSpan2', windowContext);

        test.assert.isEqualTo(
            colorField2.get('value'),
            'red');

        //  NB: We convert this into a TP.gui.Color object to compare
        //  - depending on platform, getComputedStyleProperty will
        //  return RGB values, etc.
        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan2.getComputedStyleProperty('backgroundColor')),
            TP.gui.Color.fromString('red'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/color')),
            'red');

        await driver.constructSequence().
                        exec(function() {
                            colorField2.clearValue();
                        }).
                        sendKeys('purple', colorField2).
                        sendEvent(TP.hc('type', 'change'), colorField2).
                        run();

        test.assert.isEqualTo(
            colorField2.get('value'),
            'purple');

        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan2.getComputedStyleProperty(
                                        'backgroundColor')),
            TP.gui.Color.fromString('purple'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/color')),
            'purple');
    });

    //  ---

    this.it('whole attribute expression - JSON data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeJSON.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'red');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].color')),
            'red');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('purple', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'purple');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].color')),
            'purple');
    });

    //  ---

    this.it('whole attribute expression, no fragment, qualified binding - JSON data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeNoFragmentJSON.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'green');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[1].color')),
            'green');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('yellow', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'yellow');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[1].color')),
            'yellow');
    });

    //  ---

    this.it('whole attribute expression, single-level fragment, qualified binding - JSON data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeSingleFragmentJSON.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[2].color')),
            'blue');

        await driver.constructSequence().
            exec(function() {
                colorField.clearValue();
            }).
            sendKeys('orange', colorField).
            sendEvent(TP.hc('type', 'change'), colorField).
            run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'orange');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[2].color')),
            'orange');
    });

    //  ---

    this.it('whole attribute expression, multi-level fragment, qualified binding - JSON data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeMultiFragmentJSON.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'yellow');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[3].color')),
            'yellow');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('blue', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[3].color')),
            'blue');
    });

    //  ---

    this.it('partial attribute expression - JSON data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeJSON.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('purple', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, no fragment, qualified binding - JSON data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeNoFragmentJSON.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('yellow', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, single-level fragment, qualified binding - JSON data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeSingleFragmentJSON.xhtml');

        await driver.setLocation(loadURI);


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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('orange', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, multi-level fragment, qualified binding - JSON data source', async function(test, options) {

        var modelObj,

            colorField1,
            colorSpan1,

            colorField2,
            colorSpan2;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeMultiFragmentJSON.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField1 = TP.byId('colorField1', windowContext);
        colorSpan1 = TP.byId('colorSpan1', windowContext);

        test.assert.isEqualTo(
            colorField1.get('value'),
            'yellow');

        //  NB: We convert this into a TP.gui.Color object to compare
        //  - depending on platform, getComputedStyleProperty will
        //  return RGB values, etc.
        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan1.getComputedStyleProperty('backgroundColor')),
            TP.gui.Color.fromString('yellow'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[3].color')),
            'yellow');

        await driver.constructSequence().
                        exec(function() {
                            colorField1.clearValue();
                        }).
                        sendKeys('blue', colorField1).
                        sendEvent(TP.hc('type', 'change'), colorField1).
                        run();

        test.assert.isEqualTo(
            colorField1.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan1.getComputedStyleProperty(
                                        'backgroundColor')),
            TP.gui.Color.fromString('blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[3].color')),
            'blue');

        //  ---

        colorField2 = TP.byId('colorField2', windowContext);
        colorSpan2 = TP.byId('colorSpan2', windowContext);

        test.assert.isEqualTo(
            colorField2.get('value'),
            'red');

        //  NB: We convert this into a TP.gui.Color object to compare
        //  - depending on platform, getComputedStyleProperty will
        //  return RGB values, etc.
        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan2.getComputedStyleProperty('backgroundColor')),
            TP.gui.Color.fromString('red'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].color')),
            'red');

        await driver.constructSequence().
                        exec(function() {
                            colorField2.clearValue();
                        }).
                        sendKeys('purple', colorField2).
                        sendEvent(TP.hc('type', 'change'), colorField2).
                        run();

        test.assert.isEqualTo(
            colorField2.get('value'),
            'purple');

        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan2.getComputedStyleProperty(
                                        'backgroundColor')),
            TP.gui.Color.fromString('purple'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].color')),
            'purple');
    });

    //  ---

    this.it('whole attribute expression - JavaScript Object data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeJSObj.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'red');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].color')),
            'red');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('purple', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'purple');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].color')),
            'purple');
    });

    //  ---

    this.it('whole attribute expression, no fragment, qualified binding - JavaScript Object data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeNoFragmentJSObj.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'green');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[1].color')),
            'green');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('yellow', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'yellow');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[1].color')),
            'yellow');
    });

    //  ---

    this.it('whole attribute expression, single-level fragment, qualified binding - JavaScript Object data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeSingleFragmentJSObj.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[2].color')),
            'blue');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('orange', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'orange');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[2].color')),
            'orange');
    });

    //  ---

    this.it('whole attribute expression, multi-level fragment, qualified binding - JavaScript Object data source', async function(test, options) {

        var modelObj,
            colorField;

        loadURI = TP.uc('~lib_test/src/bind/BindWholeAttributeMultiFragmentJSObj.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField = TP.byId('colorField', windowContext);

        test.assert.isEqualTo(
            colorField.get('value'),
            'yellow');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[3].color')),
            'yellow');

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('blue', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

        test.assert.isEqualTo(
            colorField.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[3].color')),
            'blue');
    });

    //  ---

    this.it('partial attribute expression - JavaScript Object data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeJSObj.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('purple', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, no fragment, qualified binding - JavaScript Object data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeNoFragmentJSObj.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('yellow', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, single-level fragment, qualified binding - JavaScript Object data source', async function(test, options) {

        var modelObj,
            colorField,
            colorSpan;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeSingleFragmentJSObj.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        exec(function() {
                            colorField.clearValue();
                        }).
                        sendKeys('orange', colorField).
                        sendEvent(TP.hc('type', 'change'), colorField).
                        run();

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

    //  ---

    this.it('partial attribute expression, multi-level fragment, qualified binding - JavaScript Object data source', async function(test, options) {

        var modelObj,

            colorField1,
            colorSpan1,

            colorField2,
            colorSpan2;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeMultiFragmentJSObj.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        colorField1 = TP.byId('colorField1', windowContext);
        colorSpan1 = TP.byId('colorSpan1', windowContext);

        test.assert.isEqualTo(
            colorField1.get('value'),
            'yellow');

        //  NB: We convert this into a TP.gui.Color object to compare
        //  - depending on platform, getComputedStyleProperty will
        //  return RGB values, etc.
        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan1.getComputedStyleProperty('backgroundColor')),
            TP.gui.Color.fromString('yellow'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[3].color')),
            'yellow');

        await driver.constructSequence().
                            exec(function() {
                                colorField1.clearValue();
                            }).
                            sendKeys('blue', colorField1).
                            sendEvent(TP.hc('type', 'change'), colorField1).
                            run();

        test.assert.isEqualTo(
            colorField1.get('value'),
            'blue');

        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan1.getComputedStyleProperty(
                                        'backgroundColor')),
            TP.gui.Color.fromString('blue'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[3].color')),
            'blue');

        //  ---

        colorField2 = TP.byId('colorField2', windowContext);
        colorSpan2 = TP.byId('colorSpan2', windowContext);

        test.assert.isEqualTo(
            colorField2.get('value'),
            'red');

        //  NB: We convert this into a TP.gui.Color object to compare
        //  - depending on platform, getComputedStyleProperty will
        //  return RGB values, etc.
        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan2.getComputedStyleProperty('backgroundColor')),
            TP.gui.Color.fromString('red'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].color')),
            'red');

        await driver.constructSequence().
                            exec(function() {
                                colorField2.clearValue();
                            }).
                            sendKeys('purple', colorField2).
                            sendEvent(TP.hc('type', 'change'), colorField2).
                            run();

        test.assert.isEqualTo(
            colorField2.get('value'),
            'purple');

        test.assert.isEqualTo(
            TP.gui.Color.fromString(
                colorSpan2.getComputedStyleProperty(
                                        'backgroundColor')),
            TP.gui.Color.fromString('purple'));

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].color')),
            'purple');
    });

    //  ---

    this.it('whole and partial attribute expression, multi-level fragment, mixed scoping, all types', async function(test, options) {

        var field1,
            field2,
            field3,
            field4;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsMixedScoping.xhtml');

        await driver.setLocation(loadURI);

        field1 = TP.byId('fieldXML1', windowContext);
        field2 = TP.byId('fieldXML2', windowContext);
        field3 = TP.byId('fieldXML3', windowContext);
        field4 = TP.byId('fieldXML4', windowContext);

        test.assert.isEqualTo(
            field1.get('value'),
            'Smith');

        test.assert.isEqualTo(
            field2.get('value'),
            'Joe');

        test.assert.isEqualTo(
            field3.get('value'),
            'Joe');

        test.assert.isEqualTo(
            field4.get('value'),
            'Joe');

        field1 = TP.byId('fieldJSObj1', windowContext);
        field2 = TP.byId('fieldJSObj2', windowContext);
        field3 = TP.byId('fieldJSObj3', windowContext);
        field4 = TP.byId('fieldJSObj4', windowContext);

        test.assert.isEqualTo(
            field1.get('value'),
            'Smith');

        test.assert.isEqualTo(
            field2.get('value'),
            'Joe');

        test.assert.isEqualTo(
            field3.get('value'),
            'Joe');

        test.assert.isEqualTo(
            field4.get('value'),
            'Joe');

        field1 = TP.byId('fieldJSON1', windowContext);
        field2 = TP.byId('fieldJSON2', windowContext);
        field3 = TP.byId('fieldJSON3', windowContext);
        field4 = TP.byId('fieldJSON4', windowContext);

        test.assert.isEqualTo(
            field1.get('value'),
            'Smith');

        test.assert.isEqualTo(
            field2.get('value'),
            'Joe');

        test.assert.isEqualTo(
            field3.get('value'),
            'Joe');

        test.assert.isEqualTo(
            field4.get('value'),
            'Joe');
    });

}).timeout(45000);

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: inline bind expressions to attributes',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.afterEach(
        async function(test, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });


    this.it('partial attribute expression, multi-level fragment, qualified binding - XML data source', async function(test, options) {

        var modelObj,

            personElem1,
            personElem2;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeToAttributeMultiFragmentXML.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        personElem1 = TP.byId('person1', windowContext);
        personElem2 = TP.byId('person2', windowContext);

        test.assert.isEqualTo(
            personElem1.getAttribute('lastname'),
            'Professional');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[4]/lastname')),
            'Professional');

        test.refute.hasAttribute(
            personElem1,
            'ismale');

        test.assert.isEqualTo(
            personElem2.getAttribute('lastname'),
            'Smith');

        test.assert.isEqualTo(
            TP.val(modelObj.get('/people/person[1]/lastname')),
            'Smith');

        test.assert.hasAttribute(
            personElem2,
            'ismale');
    });

    this.it('partial attribute expression, multi-level fragment, qualified binding - JSON data source', async function(test, options) {

        var modelObj,

            personElem1,
            personElem2;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeToAttributeMultiFragmentJSON.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        personElem1 = TP.byId('person1', windowContext);
        personElem2 = TP.byId('person2', windowContext);

        test.assert.isEqualTo(
            personElem1.getAttribute('lastname'),
            'Professional');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[3].lastname')),
            'Professional');

        test.refute.hasAttribute(
            personElem1,
            'ismale');

        test.assert.isEqualTo(
            personElem2.getAttribute('lastname'),
            'Smith');

        test.assert.isEqualTo(
            TP.val(modelObj.get('$.people[0].lastname')),
            'Smith');

        test.assert.hasAttribute(
            personElem2,
            'ismale');
    });

    this.it('partial attribute expression, multi-level fragment, qualified binding - JavaScript Object data source', async function(test, options) {

        var modelObj,

            personElem1,
            personElem2;

        loadURI = TP.uc('~lib_test/src/bind/BindPartialAttributeToAttributeMultiFragmentJSObj.xhtml');

        await driver.setLocation(loadURI);

        modelObj = TP.uc('urn:tibet:test_people').getResource().get('result');

        personElem1 = TP.byId('person1', windowContext);
        personElem2 = TP.byId('person2', windowContext);

        test.assert.isEqualTo(
            personElem1.getAttribute('lastname'),
            'Professional');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[3].lastname')),
            'Professional');

        test.refute.hasAttribute(
            personElem1,
            'ismale');

        test.assert.isEqualTo(
            personElem2.getAttribute('lastname'),
            'Smith');

        test.assert.isEqualTo(
            TP.val(modelObj.get('people[0].lastname')),
            'Smith');

        test.assert.hasAttribute(
            personElem2,
            'ismale');
    });

});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: expressions with variables',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.afterEach(
        async function(test, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('bind:io attributes - no literal expression content', async function(test, options) {

        var xmlField,
            jsonField,
            jsobjField;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsNoLiterals.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('bind:io attributes - literal expression content', async function(test, options) {

        var xmlField,
            jsonField,
            jsobjField;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsWithLiterals.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('bind:io attributes - literal expression content with scoping', async function(test, options) {

        var xmlField,
            jsonField,
            jsobjField;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsWithLiteralsWithScopes.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('embedded syntax - no literal expression content', async function(test, options) {

        var xmlField,
            jsonField,
            jsobjField;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsEmbedded.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('embedded syntax - literal expression content', async function(test, options) {

        var xmlField,
            jsonField,
            jsobjField;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsAndLiteralsEmbedded.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('bind:io attributes - no literal expression content - repeating context', async function(test, options) {

        var xmlFields,
            jsonFields,
            jsobjFields;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsIOAttrsRepeating.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('bind:io attributes - literal expression content - repeating context', async function(test, options) {

        var xmlFields,
            jsonFields,
            jsobjFields;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsAndLiteralsIOAttrsRepeating.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('embedded syntax - no literal expression content - repeating context', async function(test, options) {

        var xmlFields,
            jsonFields,
            jsobjFields;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsEmbeddedRepeating.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('embedded syntax - literal expression content - repeating context', async function(test, options) {

        var xmlFields,
            jsonFields,
            jsobjFields;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithVarsAndLiteralsEmbeddedRepeating.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('Table - XML data source - repeating context', async function(test, options) {

        var dataRows,
            dataCells;

        loadURI = TP.uc('~lib_test/src/bind/BindTableXMLRepeating.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('Table - JSON data source - repeating context', async function(test, options) {

        var dataRows,
            dataCells;

        loadURI = TP.uc('~lib_test/src/bind/BindTableJSONRepeating.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('Table - JavaScript Object data source - repeating context', async function(test, options) {

        var dataRows,
            dataCells;

        loadURI = TP.uc('~lib_test/src/bind/BindTableJSObjRepeating.xhtml');

        await driver.setLocation(loadURI);

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
    });

    //  ---

    this.it('bind attributes - all variables', async function(test, options) {

        var xmlField,
            jsonField,
            jsobjField,

            items;

        loadURI = TP.uc('~lib_test/src/bind/BindExprsWithAllVars.xhtml');

        await driver.setLocation(loadURI);

        xmlField = TP.byId('xmlBindTagAttr', windowContext);
        jsonField = TP.byId('jsonBindTagAttr', windowContext);
        jsobjField = TP.byId('jsobjBindTagAttr', windowContext);

        test.assert.isEqualTo(
            xmlField.getAttribute('foo'),
            'The canonical name lowercased (XML): html:input');
        test.assert.isEqualTo(
            xmlField.getValue(),
            'The canonical name uppercased (XML): HTML:INPUT');
        test.assert.isEqualTo(
            jsonField.getAttribute('foo'),
            'The canonical name lowercased (JSON): html:input');
        test.assert.isEqualTo(
            jsonField.getValue(),
            'The canonical name uppercased (JSON): HTML:INPUT');
        test.assert.isEqualTo(
            jsobjField.getAttribute('foo'),
            'The canonical name lowercased (JSObj): html:input');
        test.assert.isEqualTo(
            jsobjField.getValue(),
            'The canonical name uppercased (JSObj): HTML:INPUT');

        //  ---

        xmlField = TP.byId('xmlBindStdinAttr', windowContext);
        jsonField = TP.byId('jsonBindStdinAttr', windowContext);
        jsobjField = TP.byId('jsobjBindStdinAttr', windowContext);

        test.assert.isEqualTo(
            xmlField.getAttribute('foo'),
            'The data source\'s last name field value lowercased (XML): smith');
        test.assert.isEqualTo(
            xmlField.getValue(),
            'The data source\'s last name field value uppercased (XML): SMITH');
        test.assert.isEqualTo(
            jsonField.getAttribute('foo'),
            'The data source\'s last name field value lowercased (JSON): smith');
        test.assert.isEqualTo(
            jsonField.getValue(),
            'The data source\'s last name field value uppercased (JSON): SMITH');
        test.assert.isEqualTo(
            jsobjField.getAttribute('foo'),
            'The data source\'s last name field value lowercased (JSObj): smith');
        test.assert.isEqualTo(
            jsobjField.getValue(),
            'The data source\'s last name field value uppercased (JSObj): SMITH');

        //  ---

        xmlField = TP.byId('xmlBindStandaloneExpression', windowContext);
        jsonField = TP.byId('jsonBindStandaloneExpression', windowContext);
        jsobjField = TP.byId('jsobjBindStandaloneExpression', windowContext);
        test.assert.isEqualTo(
            TP.trim(xmlField.getTextContent()),
            'Binding XML data with $_ variable reference: SMITH');
        test.assert.isEqualTo(
            TP.trim(jsonField.getTextContent()),
            'Binding JSON data with $_ variable reference: SMITH');
        test.assert.isEqualTo(
            TP.trim(jsobjField.getTextContent()),
            'Binding JavaScript Object data with $_ variable reference: SMITH');

        //  ---

        xmlField = TP.byId('xmlBindStandaloneScopedExpression', windowContext);
        jsonField = TP.byId('jsonBindStandaloneScopedExpression', windowContext);
        jsobjField = TP.byId('jsobjBindStandaloneScopedExpression', windowContext);
        test.assert.isEqualTo(
            TP.trim(xmlField.getTextContent()),
            'Binding XML data with $_ variable reference: smith');
        test.assert.isEqualTo(
            TP.trim(jsonField.getTextContent()),
            'Binding JSON data with $_ variable reference: smith');
        test.assert.isEqualTo(
            TP.trim(jsobjField.getTextContent()),
            'Binding JavaScript Object data with $_ variable reference: smith');

        //  ---

        xmlField = TP.byId('xmlPackNoScope', windowContext);
        items = xmlField.getAllItems();

        test.assert.isEqualTo(
            items.at(0).get('labelText'),
            'SMITH');

        test.assert.isEqualTo(
            items.at(1).get('labelText'),
            'JONES');

        test.assert.isEqualTo(
            items.at(2).get('labelText'),
            'HOMEMAKER');

        test.assert.isEqualTo(
            items.at(3).get('labelText'),
            'PROFESSIONAL');

        //  ---

        xmlField = TP.byId('xmlPackEmbeddedScope', windowContext);
        items = xmlField.getAllItems();

        //  These will all have the same value because of the absolute
        //  binding expression that's injected.

        test.assert.isEqualTo(
            items.at(0).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(1).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(2).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(3).get('labelText'),
            'smith');
        //  ---

        jsonField = TP.byId('jsonPackNoScope', windowContext);
        items = jsonField.getAllItems();

        test.assert.isEqualTo(
            items.at(0).get('labelText'),
            'SMITH');

        test.assert.isEqualTo(
            items.at(1).get('labelText'),
            'JONES');

        test.assert.isEqualTo(
            items.at(2).get('labelText'),
            'HOMEMAKER');

        test.assert.isEqualTo(
            items.at(3).get('labelText'),
            'PROFESSIONAL');

        //  ---

        jsonField = TP.byId('jsonPackEmbeddedScope', windowContext);
        items = jsonField.getAllItems();

        //  These will all have the same value because of the absolute
        //  binding expression that's injected.

        test.assert.isEqualTo(
            items.at(0).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(1).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(2).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(3).get('labelText'),
            'smith');

        //  ---

        jsobjField = TP.byId('jsObjPackNoScope', windowContext);
        items = jsobjField.getAllItems();

        test.assert.isEqualTo(
            items.at(0).get('labelText'),
            'SMITH');

        test.assert.isEqualTo(
            items.at(1).get('labelText'),
            'JONES');

        test.assert.isEqualTo(
            items.at(2).get('labelText'),
            'HOMEMAKER');

        test.assert.isEqualTo(
            items.at(3).get('labelText'),
            'PROFESSIONAL');

        //  ---

        jsobjField = TP.byId('jsObjPackEmbeddedScope', windowContext);
        items = jsobjField.getAllItems();

        //  These will all have the same value because of the absolute
        //  binding expression that's injected.

        test.assert.isEqualTo(
            items.at(0).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(1).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(2).get('labelText'),
            'smith');

        test.assert.isEqualTo(
            items.at(3).get('labelText'),
            'smith');

        //  ---

        xmlField = TP.byId('xmlRepeater', windowContext);

        items = xmlField.get('.item[bind|scope="[1]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '1');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Joe');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Smith');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'true');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'false');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'false');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'true');

        //  Number 9 is this record's structure

        items = xmlField.get('.item[bind|scope="[2]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '2');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'John');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Jones');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'true');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'true');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'false');

        //  Number 9 is this record's structure

        items = xmlField.get('.item[bind|scope="[3]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '3');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Billy');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Homemaker');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'true');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'false');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'true');

        //  Number 9 is this record's structure

        items = xmlField.get('.item[bind|scope="[4]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '4');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Pamela');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Professional');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'false');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'true');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'true');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'false');

        //  Number 9 is this record's structure

        //  ---

        jsonField = TP.byId('jsonRepeater', windowContext);

        items = jsonField.get('.item[bind|scope="[0]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '0');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Joe');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Smith');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'true');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'false');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'true');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'false');

        //  Number 9 is this record's structure

        items = jsonField.get('.item[bind|scope="[1]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '1');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'John');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Jones');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'true');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'false');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'true');

        //  Number 9 is this record's structure

        items = jsonField.get('.item[bind|scope="[2]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '2');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Billy');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Homemaker');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'true');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'true');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'false');

        //  Number 9 is this record's structure

        items = jsonField.get('.item[bind|scope="[3]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '3');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Pamela');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Professional');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'false');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'true');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'false');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'true');

        //  Number 9 is this record's structure

        //  ---

        jsobjField = TP.byId('jsobjRepeater', windowContext);

        items = jsobjField.get('.item[bind|scope="[0]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '0');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Joe');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Smith');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'true');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'false');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'true');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'false');

        //  Number 9 is this record's structure

        items = jsobjField.get('.item[bind|scope="[1]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '1');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'John');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Jones');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'true');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'false');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'true');

        //  Number 9 is this record's structure

        items = jsobjField.get('.item[bind|scope="[2]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '2');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Billy');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Homemaker');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'true');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'false');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'true');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'false');

        //  Number 9 is this record's structure

        items = jsobjField.get('.item[bind|scope="[3]"] tibet|acp');

        //  $INDEX
        test.assert.isEqualTo(
            items.at(0).getTextContent(),
            '3');
        //  First name
        test.assert.isEqualTo(
            items.at(1).getTextContent(),
            'Pamela');
        //  Last name
        test.assert.isEqualTo(
            items.at(2).getTextContent(),
            'Professional');

        //  Number 3 is this record's structure

        //  $FIRST
        test.assert.isEqualTo(
            items.at(4).getTextContent(),
            'false');
        //  $MIDDLE
        test.assert.isEqualTo(
            items.at(5).getTextContent(),
            'false');
        //  $LAST
        test.assert.isEqualTo(
            items.at(6).getTextContent(),
            'true');
        //  $EVEN
        test.assert.isEqualTo(
            items.at(7).getTextContent(),
            'false');
        //  $ODD
        test.assert.isEqualTo(
            items.at(8).getTextContent(),
            'true');

        //  Number 9 is this record's structure
    });

});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: standalone expressions',
function() {

    var unloadURI,
        loadURI,

        driver;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.afterEach(
        async function(test, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('standalone expressions - XML data source', async function(test, options) {

        var fields;

        loadURI = TP.uc('~lib_test/src/bind/BindStandaloneExpressionsXML.xhtml');

        await driver.setLocation(loadURI);

        fields = TP.byCSSPath('tibet|acp[bind|in]');

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
    });

    //  ---

    this.it('standalone expressions - JSON data source', async function(test, options) {

        var fields;

        loadURI = TP.uc('~lib_test/src/bind/BindStandaloneExpressionsJSON.xhtml');

        await driver.setLocation(loadURI);

        fields = TP.byCSSPath('tibet|acp[bind|in]');

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
    });

    //  ---

    this.it('standalone expressions - JavaScript Object data source', async function(test, options) {

        var fields;

        loadURI = TP.uc('~lib_test/src/bind/BindStandaloneExpressionsJSObj.xhtml');

        await driver.setLocation(loadURI);

        fields = TP.byCSSPath('tibet|acp[bind|in]');

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
    });

});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: insert into repeat',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        async function(test, options) {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
        });

    //  ---

    this.it('insert into repeat - XML data source', async function(test, options) {

        var insertBeforeBeginButton,
            insertAfterBeginButton,
            insertBeforeEndButton,
            insertAfterEndButton,

            fields;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLInsert.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        click(insertBeforeBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the first row
        test.assert.isEmpty(fields.at(0).get('value'));
        test.assert.isEmpty(fields.at(1).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(2).get('value'));
        test.refute.isEmpty(fields.at(3).get('value'));

        //  Insert empty row after the first row

        await driver.constructSequence().
                        click(insertAfterBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the second row
        test.assert.isEmpty(fields.at(2).get('value'));
        test.assert.isEmpty(fields.at(3).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(4).get('value'));
        test.refute.isEmpty(fields.at(5).get('value'));

        //  Insert empty row before the last row

        await driver.constructSequence().
                        click(insertBeforeEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the next to last row
        test.assert.isEmpty(fields.at(8).get('value'));
        test.assert.isEmpty(fields.at(9).get('value'));

        //  The lastname and firstname of the last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));

        //  Insert empty row after the last row

        await driver.constructSequence().
                        click(insertAfterEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the last row
        test.assert.isEmpty(fields.at(12).get('value'));
        test.assert.isEmpty(fields.at(13).get('value'));

        //  The lastname and firstname of the next to last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - XML data source - multi-fragment', async function(test, options) {

        var insertBeforeBeginButton,
            insertAfterBeginButton,
            insertBeforeEndButton,
            insertAfterEndButton,

            fields;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLInsertMultiFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        click(insertBeforeBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the first row
        test.assert.isEmpty(fields.at(0).get('value'));
        test.assert.isEmpty(fields.at(1).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(2).get('value'));
        test.refute.isEmpty(fields.at(3).get('value'));

        //  Insert empty row after the first row

        await driver.constructSequence().
                        click(insertAfterBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the second row
        test.assert.isEmpty(fields.at(2).get('value'));
        test.assert.isEmpty(fields.at(3).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(4).get('value'));
        test.refute.isEmpty(fields.at(5).get('value'));

        //  Insert empty row before the last row

        await driver.constructSequence().
                        click(insertBeforeEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the next to last row
        test.assert.isEmpty(fields.at(8).get('value'));
        test.assert.isEmpty(fields.at(9).get('value'));

        //  The lastname and firstname of the last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));

        //  Insert empty row after the last row

        await driver.constructSequence().
                        click(insertAfterEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the last row
        test.assert.isEmpty(fields.at(12).get('value'));
        test.assert.isEmpty(fields.at(13).get('value'));

        //  The lastname and firstname of the next to last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - JSON data source', async function(test, options) {

        var insertBeforeBeginButton,
            insertAfterBeginButton,
            insertBeforeEndButton,
            insertAfterEndButton,

            fields;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONInsert.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        click(insertBeforeBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the first row
        test.assert.isEmpty(fields.at(0).get('value'));
        test.assert.isEmpty(fields.at(1).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(2).get('value'));
        test.refute.isEmpty(fields.at(3).get('value'));

        //  Insert empty row after the first row

        await driver.constructSequence().
                        click(insertAfterBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the second row
        test.assert.isEmpty(fields.at(2).get('value'));
        test.assert.isEmpty(fields.at(3).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(4).get('value'));
        test.refute.isEmpty(fields.at(5).get('value'));

        //  Insert empty row before the last row

        await driver.constructSequence().
                        click(insertBeforeEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the next to last row
        test.assert.isEmpty(fields.at(8).get('value'));
        test.assert.isEmpty(fields.at(9).get('value'));

        //  The lastname and firstname of the last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));

        //  Insert empty row after the last row

        await driver.constructSequence().
                        click(insertAfterEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the last row
        test.assert.isEmpty(fields.at(12).get('value'));
        test.assert.isEmpty(fields.at(13).get('value'));

        //  The lastname and firstname of the next to last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - JSON data source - multi-fragment', async function(test, options) {

        var insertBeforeBeginButton,
            insertAfterBeginButton,
            insertBeforeEndButton,
            insertAfterEndButton,

            fields;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONInsertMultiFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        click(insertBeforeBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the first row
        test.assert.isEmpty(fields.at(0).get('value'));
        test.assert.isEmpty(fields.at(1).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(2).get('value'));
        test.refute.isEmpty(fields.at(3).get('value'));

        //  Insert empty row after the first row

        await driver.constructSequence().
                        click(insertAfterBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the second row
        test.assert.isEmpty(fields.at(2).get('value'));
        test.assert.isEmpty(fields.at(3).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(4).get('value'));
        test.refute.isEmpty(fields.at(5).get('value'));

        //  Insert empty row before the last row

        await driver.constructSequence().
                        click(insertBeforeEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the next to last row
        test.assert.isEmpty(fields.at(8).get('value'));
        test.assert.isEmpty(fields.at(9).get('value'));

        //  The lastname and firstname of the last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));

        //  Insert empty row after the last row

        await driver.constructSequence().
                        click(insertAfterEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the last row
        test.assert.isEmpty(fields.at(12).get('value'));
        test.assert.isEmpty(fields.at(13).get('value'));

        //  The lastname and firstname of the next to last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - JavaScript Object data source', async function(test, options) {

        var insertBeforeBeginButton,
            insertAfterBeginButton,
            insertBeforeEndButton,
            insertAfterEndButton,

            fields;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjInsert.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
            click(insertBeforeBeginButton).
            run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the first row
        test.assert.isEmpty(fields.at(0).get('value'));
        test.assert.isEmpty(fields.at(1).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(2).get('value'));
        test.refute.isEmpty(fields.at(3).get('value'));

        //  Insert empty row after the first row

        await driver.constructSequence().
                        click(insertAfterBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the second row
        test.assert.isEmpty(fields.at(2).get('value'));
        test.assert.isEmpty(fields.at(3).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(4).get('value'));
        test.refute.isEmpty(fields.at(5).get('value'));

        //  Insert empty row before the last row

        await driver.constructSequence().
                        click(insertBeforeEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the next to last row
        test.assert.isEmpty(fields.at(8).get('value'));
        test.assert.isEmpty(fields.at(9).get('value'));

        //  The lastname and firstname of the last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));

        //  Insert empty row after the last row

        await driver.constructSequence().
                        click(insertAfterEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the last row
        test.assert.isEmpty(fields.at(12).get('value'));
        test.assert.isEmpty(fields.at(13).get('value'));

        //  The lastname and firstname of the next to last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - JavaScript Object data source - multi-fragment', async function(test, options) {

        var insertBeforeBeginButton,
            insertAfterBeginButton,
            insertBeforeEndButton,
            insertAfterEndButton,

            fields;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjInsertMultiFragment.xhtml');

        await driver.setLocation(loadURI);

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

        await driver.constructSequence().
                        click(insertBeforeBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the first row
        test.assert.isEmpty(fields.at(0).get('value'));
        test.assert.isEmpty(fields.at(1).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(2).get('value'));
        test.refute.isEmpty(fields.at(3).get('value'));

        //  Insert empty row after the first row

        await driver.constructSequence().
                        click(insertAfterBeginButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the second row
        test.assert.isEmpty(fields.at(2).get('value'));
        test.assert.isEmpty(fields.at(3).get('value'));

        //  The lastname and firstname of the next row
        test.refute.isEmpty(fields.at(4).get('value'));
        test.refute.isEmpty(fields.at(5).get('value'));

        //  Insert empty row before the last row

        await driver.constructSequence().
                        click(insertBeforeEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the next to last row
        test.assert.isEmpty(fields.at(8).get('value'));
        test.assert.isEmpty(fields.at(9).get('value'));

        //  The lastname and firstname of the last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));

        //  Insert empty row after the last row

        await driver.constructSequence().
                        click(insertAfterEndButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname and firstname of the last row
        test.assert.isEmpty(fields.at(12).get('value'));
        test.assert.isEmpty(fields.at(13).get('value'));

        //  The lastname and firstname of the next to last row
        test.refute.isEmpty(fields.at(10).get('value'));
        test.refute.isEmpty(fields.at(11).get('value'));
    }).timeout(10000);
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: delete from repeat',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            this.getSuite().startTrackingSignals();
        });

    //  ---

    this.afterEach(
        async function(test, options) {
            this.getSuite().stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
        });

    //  ---

    this.it('delete from repeat - XML data source', async function(test, options) {

        var deleteFirstRowButton,
            deleteLastRowButton,

            fields,
            repeater;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatXMLDelete.xhtml');

        await driver.setLocation(loadURI);

        test.assert.didSignal(
                TP.uc('urn:tibet:test_people'),
                'TP.sig.ValueChange');

        deleteFirstRowButton =
            TP.byId('deleteFirstRow', windowContext);

        deleteLastRowButton =
            TP.byId('deleteLastRow', windowContext);

        //  NB: We start with 3 rows

        //  Delete the first row

        await driver.constructSequence().
                        click(deleteFirstRowButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname of the first row
        test.assert.isEqualTo(
            fields.at(1).get('value'),
            'Jones');

        //  Delete the last row

        await driver.constructSequence().
                        click(deleteLastRowButton).
                        run();

        //  There should only be 2 text fields left under the
        //  repeater.

        repeater = TP.byId('repeater', windowContext);

        fields = TP.byCSSPath('input', repeater);

        test.assert.isSizeOf(fields, 2);
    });

    //  ---

    this.it('delete from repeat - JSON data source', async function(test, options) {

        var deleteFirstRowButton,
            deleteLastRowButton,

            fields,
            repeater;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSONDelete.xhtml');

        await driver.setLocation(loadURI);

        test.assert.didSignal(
                TP.uc('urn:tibet:test_people'),
                'TP.sig.ValueChange');

        deleteFirstRowButton =
            TP.byId('deleteFirstRow', windowContext);

        deleteLastRowButton =
            TP.byId('deleteLastRow', windowContext);

        //  NB: We start with 3 rows

        //  Delete the first row

        await driver.constructSequence().
                        click(deleteFirstRowButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname of the first row
        test.assert.isEqualTo(
            fields.at(1).get('value'),
            'Jones');

        //  Delete the last row

        await driver.constructSequence().
                        click(deleteLastRowButton).
                        run();

        //  There should only be 2 text fields left under the
        //  repeater.

        repeater = TP.byId('repeater', windowContext);

        fields = TP.byCSSPath('input', repeater);

        test.assert.isSizeOf(fields, 2);
    });

    //  ---

    this.it('delete from repeat - JavaScript Object data source', async function(test, options) {

        var deleteFirstRowButton,
            deleteLastRowButton,

            fields,
            repeater;

        loadURI = TP.uc('~lib_test/src/bind/BindRepeatJSObjDelete.xhtml');

        await driver.setLocation(loadURI);

        test.assert.didSignal(
                TP.uc('urn:tibet:test_people'),
                'TP.sig.ValueChange');

        deleteFirstRowButton =
            TP.byId('deleteFirstRow', windowContext);

        deleteLastRowButton =
            TP.byId('deleteLastRow', windowContext);

        //  NB: We start with 3 rows

        //  Delete the first row

        await driver.constructSequence().
                        click(deleteFirstRowButton).
                        run();

        fields = TP.byCSSPath('#repeater input[type="text"]',
                                windowContext);

        //  The lastname of the first row
        test.assert.isEqualTo(
            fields.at(1).get('value'),
            'Jones');

        //  Delete the last row

        await driver.constructSequence().
                        click(deleteLastRowButton).
                        run();

        repeater = TP.byId('repeater', windowContext);

        fields = TP.byCSSPath('input', repeater);

        test.assert.isSizeOf(fields, 2);
    });

});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: direct to UI expressions',
function() {

    var unloadURI,
        loadURI,

        driver,
        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            driver.showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            driver.showTestLog();
        });

    //  ---

    this.afterEach(
        async function(test, options) {

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('direct to UI expressions - UI control values, with scheme', async function(test, options) {

        var sourceField,
            destinationWholeField,
            destinationPartialField;

        loadURI = TP.uc('~lib_test/src/bind/BindDirectUIValuesWithScheme.xhtml');

        await driver.setLocation(loadURI);

        sourceField = TP.byId('sourceField', windowContext);
        destinationWholeField = TP.byId('destinationWholeField', windowContext);
        destinationPartialField = TP.byId('destinationPartialField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            sourceField.clearValue();
                        }).
                        sendKeys('Joe Smith', sourceField).
                        sendEvent(TP.hc('type', 'change'), sourceField).
                        run();

        test.assert.isEqualTo(
            destinationWholeField.get('value'),
            'Joe Smith');

        test.assert.isEqualTo(
            destinationPartialField.get('value'),
            'The name is: Joe Smith');
    });

    //  ---

    this.it('direct to UI expressions - UI control attributes, with scheme', async function(test, options) {

        var sourceField,
            destinationWholeField,
            destinationPartialField;

        loadURI = TP.uc('~lib_test/src/bind/BindDirectUIAttributesWithScheme.xhtml');

        await driver.setLocation(loadURI);

        sourceField = TP.byId('sourceField', windowContext);
        destinationWholeField = TP.byId('destinationWholeField', windowContext);
        destinationPartialField = TP.byId('destinationPartialField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            sourceField.clearValue();
                        }).
                        sendKeys('Mike Jones', sourceField).
                        sendEvent(TP.hc('type', 'change'), sourceField).
                        run();

        test.assert.isEqualTo(
            destinationWholeField.get('value'),
            'Mike Jones');

        test.assert.isEqualTo(
            destinationPartialField.get('value'),
            'The name is: Mike Jones');
    });

    //  ---

    this.it('direct to UI expressions - UI control values, no scheme', async function(test, options) {

        var sourceField,
            destinationWholeField,
            destinationPartialField;

        loadURI = TP.uc('~lib_test/src/bind/BindDirectUIValuesNoScheme.xhtml');

        await driver.setLocation(loadURI);

        sourceField = TP.byId('sourceField', windowContext);
        destinationWholeField = TP.byId('destinationWholeField', windowContext);
        destinationPartialField = TP.byId('destinationPartialField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            sourceField.clearValue();
                        }).
                        sendKeys('Joe Smith', sourceField).
                        sendEvent(TP.hc('type', 'change'), sourceField).
                        run();

        test.assert.isEqualTo(
            destinationWholeField.get('value'),
            'Joe Smith');

        test.assert.isEqualTo(
            destinationPartialField.get('value'),
            'The name is: Joe Smith');
    });

    //  ---

    this.it('direct to UI expressions - UI control attributes, no scheme', async function(test, options) {

        var sourceField,
            destinationWholeField,
            destinationPartialField;

        loadURI = TP.uc('~lib_test/src/bind/BindDirectUIAttributesNoScheme.xhtml');

        await driver.setLocation(loadURI);

        sourceField = TP.byId('sourceField', windowContext);
        destinationWholeField = TP.byId('destinationWholeField', windowContext);
        destinationPartialField = TP.byId('destinationPartialField', windowContext);

        await driver.constructSequence().
                        exec(function() {
                            sourceField.clearValue();
                        }).
                        sendKeys('Mike Jones', sourceField).
                        sendEvent(TP.hc('type', 'change'), sourceField).
                        run();

        test.assert.isEqualTo(
            destinationWholeField.get('value'),
            'Mike Jones');

        test.assert.isEqualTo(
            destinationPartialField.get('value'),
            'The name is: Mike Jones');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
