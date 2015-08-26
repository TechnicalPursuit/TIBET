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
        //  Also, note how we pass 'true' as a second parameter - this forces
        //  the call to return the 'fully scoped value'

        //  Fully formed URI, no fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo: urn:tibet:foo"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo');

        //  Fully formed URI, with fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo: urn:tibet:foo#tibet(foo)"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');

        //  Fully formed URI, no fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo: urn:tibet:foo; bar: urn:tibet:bar"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:bar');

        //  Fully formed URI, with fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo: urn:tibet:foo#tibet(foo); bar: urn:tibet:bar#tibet(bar)"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:bar#tibet(bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo: #tibet(foo)"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo: foo"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo: #tibet(foo); bar: #tibet(bar)"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:foo#tibet(bar)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo: foo; bar: bar"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:foo#tibet(bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), single value, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="bar: bar"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:foo#tibet(foo.bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="foo: foo; bar: bar"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo.foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:foo#tibet(foo.bar)');
    });

    this.it('binding attribute parsing tests - namespaced attributes', function(test, options) {
        var testMarkup,
            info;

        //  NB: These tests test only for 'bind:in', not 'bind:out' or
        //  'bind:io', but they're all subject to the same rules.

        //  Fully formed URI, no fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo:moo: urn:tibet:foo"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo');

        //  Fully formed URI, with fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo:moo: urn:tibet:foo#tibet(foo)"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo#tibet(foo)');

        //  Fully formed URI, no fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo:moo: urn:tibet:foo; bar:moo: urn:tibet:bar"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo');
        test.assert.hasKey(info, 'bar:moo');
        test.assert.isEqualTo(info.at('bar:moo'), 'urn:tibet:bar');

        //  Fully formed URI, with fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo:moo: urn:tibet:foo#tibet(foo); bar:moo: urn:tibet:bar#tibet(bar)"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar:moo');
        test.assert.isEqualTo(info.at('bar:moo'), 'urn:tibet:bar#tibet(bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo:moo: #tibet(foo)"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo#tibet(foo)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo:moo: foo"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo#tibet(foo)');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo:moo: #tibet(foo); bar:moo: #tibet(bar)"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar:moo');
        test.assert.isEqualTo(info.at('bar:moo'), 'urn:tibet:foo#tibet(bar)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo:moo: foo; bar:moo: bar"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar:moo');
        test.assert.isEqualTo(info.at('bar:moo'), 'urn:tibet:foo#tibet(bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), single value, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="bar:moo: bar"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'bar:moo');
        test.assert.isEqualTo(info.at('bar:moo'), 'urn:tibet:foo#tibet(foo.bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="foo:moo: foo; bar:moo: bar"/>');
        info = testMarkup.getBindingInfoFrom('in', true);
        test.assert.hasKey(info, 'foo:moo');
        test.assert.isEqualTo(info.at('foo:moo'), 'urn:tibet:foo#tibet(foo.foo)');
        test.assert.hasKey(info, 'bar:moo');
        test.assert.isEqualTo(info.at('bar:moo'), 'urn:tibet:foo#tibet(foo.bar)');
    });
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: simple binds',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

    this.it('simple binding with text fields - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Smith');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

    this.it('simple binding with various XHTML controls - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleXMLAllXHTMLControls.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/color')),
                            'red, blue');
                    });

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

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleXMLNoFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/color')),
                            'red, blue');
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleXMLSingleFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/color')),
                            'red, blue');
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleXMLMultiFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/person/color')),
                            'red, blue');
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('simple binding with text fields - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.person.lastname')),
                    'Smith');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

    this.it('simple binding with various XHTML controls - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSONAllXHTMLControls.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.color')),
                            TP.ac('red', 'blue'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSONNoFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.color')),
                            TP.ac('red', 'blue'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSONSingleFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.color')),
                            TP.ac('red', 'blue'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSONMultiFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.person.lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.person.color')),
                            TP.ac('red', 'blue'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('simple binding with text fields - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,
                    modelObj,
                    lastNameField;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Smith');

                //  Change the content via 'user' interaction

                lastNameField = TP.byId('lastNameField', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

    this.it('simple binding with various XHTML controls - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSObjAllXHTMLControls.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.color')),
                            TP.ac('red', 'blue'));
                    });

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

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSObjNoFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.color')),
                            TP.ac('red', 'blue'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSObjSingleFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.color')),
                            TP.ac('red', 'blue'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindSimpleJSObjMultiFragment.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField.clearValue();
                            }).
                    sendKeys('Jones', lastNameField).
                    sendEvent(TP.hc('type', 'change'), lastNameField).
                    perform();

                test.then(
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

                test.getDriver().startSequence().
                    exec(function() {
                                descriptionField.clearValue();
                            }).
                    sendKeys('She is great!', descriptionField).
                    sendEvent(TP.hc('type', 'change'), descriptionField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            descriptionField.get('value'),
                            'She is great!');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.description')),
                            'She is great!');
                    });

                genderField = TP.byId('genderField', windowContext);
                genderFieldOption1 = genderField.getElementArray().at(0);

                test.getDriver().startSequence().
                    click(genderFieldOption1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            genderField.get('value'),
                            'm');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.gender')),
                            'm');
                    });

                petRadio3 = TP.byId('petRadio3', windowContext);

                test.getDriver().startSequence().
                    click(petRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            petRadio3.get('value'),
                            'fish');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.pet')),
                            'fish');
                    });

                colorCheckbox1 = TP.byId('colorCheckbox1', windowContext);

                test.getDriver().startSequence().
                    click(colorCheckbox1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorCheckbox1.get('value'),
                            TP.ac('red', 'blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('person.color')),
                            TP.ac('red', 'blue'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);
}).timeout(45000).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: numerically indexed binds',
function() {

    var unloadURI;

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
        });

    //  ---

    this.it('simple numeric indexed binds - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindNumericIndexedXML.xhtml');

        this.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person[1]/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person[1]/lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person[2]/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person[2]/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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

    this.it('simple numeric indexed binds with scoping - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindNumericIndexedXMLWithScopes.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person[1]/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person[1]/lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person[2]/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person[2]/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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

    this.it('simple numeric indexed binds - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindNumericIndexedJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people[0].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people[0].lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people[1].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people[1].lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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

    this.it('simple numeric indexed binds with scoping - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindNumericIndexedJSONWithScopes.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people[0].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people[0].lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people[1].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people[1].lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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

    this.it('simple numeric indexed binds - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindNumericIndexedJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people[0].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people[0].lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people[1].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people[1].lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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

    this.it('simple numeric indexed binds with scoping - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindNumericIndexedJSObjWithScopes.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people[0].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people[0].lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people[1].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people[1].lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: bind repeats',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

    this.it('repeat binding with text fields - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

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

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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

    this.it('nested repeat binding with text fields - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatXMLNested.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2,
                    addressStreetField11,
                    addressCityField22;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#xpath1(/people/person)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                //  ---

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField11', windowContext).get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/addresses/address[1]/street')),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField12', windowContext).get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/addresses/address[2]/street')),
                    '222 State St.');

                //  ---

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('addressCityField21', windowContext).get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/addresses/address[1]/city')),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byId('addressCityField22', windowContext).get('value'),
                    'One More Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/addresses/address[2]/city')),
                    'One More Town');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField1', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField2', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/lastname')),
                            'Weber');
                    });

                addressStreetField11 = TP.byId('addressStreetField11', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                addressStreetField11.clearValue();
                            }).
                    sendKeys('555 3rd Av', addressStreetField11).
                    sendEvent(TP.hc('type', 'change'), addressStreetField11).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            addressStreetField11.get('value'),
                            '555 3rd Av');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/addresses/address[1]/street')),
                            '555 3rd Av');
                    });

                addressCityField22 = TP.byId('addressCityField22', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                addressCityField22.clearValue();
                            }).
                    sendKeys('The Main Town', addressCityField22).
                    sendEvent(TP.hc('type', 'change'), addressCityField22).
                    perform();

                test.then(
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

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField0', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField0', windowContext);

                lastNameField1.clearValue();

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField1', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSONNested.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2,
                    addressStreetField00,
                    addressCityField11;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#json($.people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                //  ---

                test.assert.isEqualTo(
                    TP.byId('lastNameField0', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField00', windowContext).get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].addresses[0].street')),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField01', windowContext).get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].addresses[1].street')),
                    '222 State St.');

                //  ---

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].lastname')),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('addressCityField10', windowContext).get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].addresses[0].city')),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byId('addressCityField11', windowContext).get('value'),
                    'One More Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].addresses[1].city')),
                    'One More Town');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField0', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField1', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].lastname')),
                            'Weber');
                    });

                addressStreetField00 = TP.byId('addressStreetField00', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                addressStreetField00.clearValue();
                            }).
                    sendKeys('555 3rd Av', addressStreetField00).
                    sendEvent(TP.hc('type', 'change'), addressStreetField00).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            addressStreetField00.get('value'),
                            '555 3rd Av');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].addresses[0].street')),
                            '555 3rd Av');
                    });

                addressCityField11 = TP.byId('addressCityField11', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                addressCityField11.clearValue();
                            }).
                    sendKeys('The Main Town', addressCityField11).
                    sendEvent(TP.hc('type', 'change'), addressCityField11).
                    perform();

                test.then(
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

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                test.assert.isEqualTo(
                    TP.byId('lastNameField0', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField0', windowContext);

                lastNameField1.clearValue();

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField1', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
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

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSObjNested.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    lastNameField1,
                    lastNameField2,
                    addressStreetField00,
                    addressCityField11;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person#tibet(people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                //  ---

                test.assert.isEqualTo(
                    TP.byId('lastNameField0', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField00', windowContext).get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].addresses[0].street')),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField01', windowContext).get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].addresses[1].street')),
                    '222 State St.');

                //  ---

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('addressCityField10', windowContext).get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].addresses[0].city')),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byId('addressCityField11', windowContext).get('value'),
                    'One More Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].addresses[1].city')),
                    'One More Town');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byId('lastNameField0', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField1.clearValue();
                            }).
                    sendKeys('Lyon', lastNameField1).
                    sendEvent(TP.hc('type', 'change'), lastNameField1).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField1.get('value'),
                            'Lyon');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].lastname')),
                            'Lyon');
                    });

                lastNameField2 = TP.byId('lastNameField1', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                lastNameField2.clearValue();
                            }).
                    sendKeys('Weber', lastNameField2).
                    sendEvent(TP.hc('type', 'change'), lastNameField2).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            lastNameField2.get('value'),
                            'Weber');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].lastname')),
                            'Weber');
                    });

                addressStreetField00 = TP.byId('addressStreetField00', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                addressStreetField00.clearValue();
                            }).
                    sendKeys('555 3rd Av', addressStreetField00).
                    sendEvent(TP.hc('type', 'change'), addressStreetField00).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            addressStreetField00.get('value'),
                            '555 3rd Av');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].addresses[0].street')),
                            '555 3rd Av');
                    });

                addressCityField11 = TP.byId('addressCityField11', windowContext);

                test.getDriver().startSequence().
                    exec(function() {
                                addressCityField11.clearValue();
                            }).
                    sendKeys('The Main Town', addressCityField11).
                    sendEvent(TP.hc('type', 'change'), addressCityField11).
                    perform();

                test.then(
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

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields and paging - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatXMLPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    TP.byId('repeatIndexField', windowContext).get('value'),
                    '1');

                test.assert.isEqualTo(
                    TP.byId('repeatSizeField', windowContext).get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(
                        TP.byId('firstNameField1', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('lastNameField1', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('firstNameField2', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('lastNameField2', windowContext, false));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('firstNameField1', windowContext).get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('firstNameField2', windowContext).get('value'),
                    'John');

                //  Change the content via 'user' interaction

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField3', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField3', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('firstNameField4', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField4', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField3', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField3', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField4', windowContext).get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField4', windowContext).get('value'),
                            'Pamela');
                    });

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('2', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.getDriver().startSequence().
                    exec(function() {
                                repeatIndexField.clearValue();
                            }).
                    sendKeys('2', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '2');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '2');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('firstNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField2', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField1', windowContext).get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField1', windowContext).get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField2', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField2', windowContext).get('value'),
                            'Billy');
                    });

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields and paging - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatXMLNestedPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    TP.byId('repeatIndexField', windowContext).get('value'),
                    '1');

                test.assert.isEqualTo(
                    TP.byId('repeatSizeField', windowContext).get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(
                        TP.byId('firstNameField1', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('lastNameField1', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('firstNameField2', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('lastNameField2', windowContext, false));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('firstNameField1', windowContext).get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField11', windowContext).get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField12', windowContext).get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.byId('lastNameField2', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('firstNameField2', windowContext).get('value'),
                    'John');

                test.assert.isEqualTo(
                    TP.byId('addressCityField21', windowContext).get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byId('addressCityField22', windowContext).get('value'),
                    'One More Town');

                //  Change the content via 'user' interaction

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField3', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField3', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField31', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField32', windowContext, false));

                        test.assert.isDisplayed(
                            TP.byId('firstNameField4', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField4', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressCityField41', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressCityField42', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField3', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField3', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField31', windowContext).get('value'),
                            '#27 Ritz Ave. Apt A.');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField32', windowContext).get('value'),
                            '#4 Country Rd.');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField4', windowContext).get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField4', windowContext).get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField41', windowContext).get('value'),
                            'High Power Place');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField42', windowContext).get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('2', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.getDriver().startSequence().
                    exec(function() {
                                repeatIndexField.clearValue();
                            }).
                    sendKeys('2', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '2');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '2');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField11', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField12', windowContext, false));

                        test.assert.isDisplayed(
                                TP.byId('firstNameField2', windowContext, false));
                        test.assert.isDisplayed(
                                TP.byId('lastNameField2', windowContext, false));
                        test.assert.isDisplayed(
                                TP.byId('addressCityField21', windowContext, false));
                        test.assert.isDisplayed(
                                TP.byId('addressCityField22', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField1', windowContext).get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField1', windowContext).get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField11', windowContext).get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField12', windowContext).get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField2', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField2', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField21', windowContext).get('value'),
                            'In Your Town');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField22', windowContext).get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('repeat binding with text fields and paging - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSONPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    TP.byId('repeatIndexField', windowContext).get('value'),
                    '0');

                test.assert.isEqualTo(
                    TP.byId('repeatSizeField', windowContext).get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(
                    TP.byId('firstNameField0', windowContext, false));
                test.assert.isDisplayed(
                    TP.byId('lastNameField0', windowContext, false));
                test.assert.isDisplayed(
                    TP.byId('firstNameField1', windowContext, false));
                test.assert.isDisplayed(
                    TP.byId('lastNameField1', windowContext, false));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byId('lastNameField0', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('firstNameField0', windowContext).get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('firstNameField1', windowContext).get('value'),
                    'John');

                //  Change the content via 'user' interaction

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('firstNameField3', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField3', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField2', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField2', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField3', windowContext).get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField3', windowContext).get('value'),
                            'Pamela');
                    });

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('2', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.getDriver().startSequence().
                    exec(function() {
                                repeatIndexField.clearValue();
                            }).
                    sendKeys('1', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '2');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '1');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField0', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField0', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('firstNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField1', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField0', windowContext).get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField0', windowContext).get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField1', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField1', windowContext).get('value'),
                            'Billy');
                    });

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields and paging - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSONNestedPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    TP.byId('repeatIndexField', windowContext).get('value'),
                    '0');

                test.assert.isEqualTo(
                    TP.byId('repeatSizeField', windowContext).get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(
                        TP.byId('firstNameField0', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('lastNameField0', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('firstNameField1', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('lastNameField1', windowContext, false));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byId('lastNameField0', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('firstNameField0', windowContext).get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField00', windowContext).get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField01', windowContext).get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('firstNameField1', windowContext).get('value'),
                    'John');

                test.assert.isEqualTo(
                    TP.byId('addressCityField10', windowContext).get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byId('addressCityField11', windowContext).get('value'),
                    'One More Town');

                //  Change the content via 'user' interaction

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField20', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField21', windowContext, false));

                        test.assert.isDisplayed(
                            TP.byId('firstNameField3', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField3', windowContext, false));
                        test.assert.isDisplayed(
                                TP.byId('addressCityField30', windowContext, false));
                        test.assert.isDisplayed(
                                TP.byId('addressCityField31', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField2', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField2', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField20', windowContext).get('value'),
                            '#27 Ritz Ave. Apt A.');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField21', windowContext).get('value'),
                            '#4 Country Rd.');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField3', windowContext).get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField3', windowContext).get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField30', windowContext).get('value'),
                            'High Power Place');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField31', windowContext).get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('2', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.getDriver().startSequence().
                    exec(function() {
                                repeatIndexField.clearValue();
                            }).
                    sendKeys('1', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '2');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '1');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField0', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField0', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField00', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField01', windowContext, false));

                        test.assert.isDisplayed(
                            TP.byId('firstNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressCityField10', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressCityField11', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField0', windowContext).get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField0', windowContext).get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField00', windowContext).get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField01', windowContext).get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField1', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField1', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField10', windowContext).get('value'),
                            'In Your Town');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField11', windowContext).get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(15000);

    //  ---

    this.it('repeat binding with text fields and paging - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSObjPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    TP.byId('repeatIndexField', windowContext).get('value'),
                    '0');

                test.assert.isEqualTo(
                    TP.byId('repeatSizeField', windowContext).get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(
                    TP.byId('firstNameField0', windowContext, false));
                test.assert.isDisplayed(
                    TP.byId('lastNameField0', windowContext, false));
                test.assert.isDisplayed(
                    TP.byId('firstNameField1', windowContext, false));
                test.assert.isDisplayed(
                    TP.byId('lastNameField1', windowContext, false));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byId('lastNameField0', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('firstNameField0', windowContext).get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('firstNameField1', windowContext).get('value'),
                    'John');

                //  Change the content via 'user' interaction

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('firstNameField3', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField3', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField2', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField2', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField3', windowContext).get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField3', windowContext).get('value'),
                            'Pamela');
                    });

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('2', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.getDriver().startSequence().
                    exec(function() {
                                repeatIndexField.clearValue();
                            }).
                    sendKeys('1', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '2');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '1');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField0', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField0', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('firstNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField1', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField0', windowContext).get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField0', windowContext).get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField1', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField1', windowContext).get('value'),
                            'Billy');
                    });

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('nested repeat binding with text fields and paging - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSObjNestedPaging.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    repeatIndexField,
                    repeatSizeField;

                windowContext = test.getDriver().get('windowContext');

                repeatIndexField = TP.byId('repeatIndexField', windowContext);
                repeatSizeField = TP.byId('repeatSizeField', windowContext);

                test.assert.isEqualTo(
                    TP.byId('repeatIndexField', windowContext).get('value'),
                    '0');

                test.assert.isEqualTo(
                    TP.byId('repeatSizeField', windowContext).get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(
                        TP.byId('firstNameField0', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('lastNameField0', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('firstNameField1', windowContext, false));
                test.assert.isDisplayed(
                        TP.byId('lastNameField1', windowContext, false));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byId('lastNameField0', windowContext).get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byId('firstNameField0', windowContext).get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField00', windowContext).get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byId('addressStreetField01', windowContext).get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.byId('lastNameField1', windowContext).get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byId('firstNameField1', windowContext).get('value'),
                    'John');

                test.assert.isEqualTo(
                    TP.byId('addressCityField10', windowContext).get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byId('addressCityField11', windowContext).get('value'),
                    'One More Town');

                //  Change the content via 'user' interaction

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('4', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '4');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField2', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField20', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField21', windowContext, false));

                        test.assert.isDisplayed(
                            TP.byId('firstNameField3', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField3', windowContext, false));
                        test.assert.isDisplayed(
                                TP.byId('addressCityField30', windowContext, false));
                        test.assert.isDisplayed(
                                TP.byId('addressCityField31', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField2', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField2', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField20', windowContext).get('value'),
                            '#27 Ritz Ave. Apt A.');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField21', windowContext).get('value'),
                            '#4 Country Rd.');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField3', windowContext).get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField3', windowContext).get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField30', windowContext).get('value'),
                            'High Power Place');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField31', windowContext).get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().startSequence().
                    exec(function() {
                                repeatSizeField.clearValue();
                            }).
                    sendKeys('2', repeatSizeField).
                    sendEvent(TP.hc('type', 'change'), repeatSizeField).
                    perform();

                test.getDriver().startSequence().
                    exec(function() {
                                repeatIndexField.clearValue();
                            }).
                    sendKeys('1', repeatIndexField).
                    sendEvent(TP.hc('type', 'change'), repeatIndexField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            repeatSizeField.get('value'),
                            '2');

                        test.assert.isEqualTo(
                            repeatIndexField.get('value'),
                            '1');

                        //  Now these fields should be generated and visible

                        test.assert.isDisplayed(
                            TP.byId('firstNameField0', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField0', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField00', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressStreetField01', windowContext, false));

                        test.assert.isDisplayed(
                            TP.byId('firstNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('lastNameField1', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressCityField10', windowContext, false));
                        test.assert.isDisplayed(
                            TP.byId('addressCityField11', windowContext, false));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byId('lastNameField0', windowContext).get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField0', windowContext).get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField00', windowContext).get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            TP.byId('addressStreetField01', windowContext).get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            TP.byId('lastNameField1', windowContext).get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byId('firstNameField1', windowContext).get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField10', windowContext).get('value'),
                            'In Your Town');

                        test.assert.isEqualTo(
                            TP.byId('addressCityField11', windowContext).get('value'),
                            'Middle Of Nowhere');
                    });

                test.getDriver().setLocation(unloadURI);

                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);
}).timeout(60000).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: static tables',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.it('Simple table - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindStaticTableXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindStaticTableJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindStaticTableJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: inline bind expressions',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.it('whole attribute expression - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,
                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/color')),
                    'red');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/color')),
                            'purple');
                    });

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

    this.it('whole attribute expression, no fragment, qualified binding - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeNoFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/color')),
                    'green');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/color')),
                            'yellow');
                    });

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

    this.it('whole attribute expression, single-level fragment, qualified binding - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeSingleFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[3]/color')),
                    'blue');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[3]/color')),
                            'orange');
                    });

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

    this.it('whole attribute expression, multi-level fragment, qualified binding - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeMultiFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[4]/color')),
                    'yellow');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[4]/color')),
                            'blue');
                    });

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

    this.it('partial attribute expression - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('red'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/color')),
                    'red');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('purple'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[1]/color')),
                            'purple');
                    });

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

    this.it('partial attribute expression, no fragment, qualified binding - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeNoFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    //  For some reason, green isn't green...
                    TP.core.Color.fromString('rgb(0, 128, 0)'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/color')),
                    'green');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('yellow'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[2]/color')),
                            'yellow');
                    });

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

    this.it('partial attribute expression, single-level fragment, qualified binding - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeSingleFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[3]/color')),
                    'blue');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('orange'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[3]/color')),
                            'orange');
                    });

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

    this.it('partial attribute expression, multi-level fragment, qualified binding - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeMultiFragmentXML.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('yellow'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[4]/color')),
                    'yellow');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('/people/person[4]/color')),
                            'blue');
                    });

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

    this.it('whole attribute expression - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].color')),
                    'red');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].color')),
                            'purple');
                    });

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

    this.it('whole attribute expression, no fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeNoFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].color')),
                    'green');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].color')),
                            'yellow');
                    });

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

    this.it('whole attribute expression, single-level fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeSingleFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[2].color')),
                    'blue');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[2].color')),
                            'orange');
                    });

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

    this.it('whole attribute expression, multi-level fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeMultiFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[3].color')),
                    'yellow');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[3].color')),
                            'blue');
                    });

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

    this.it('partial attribute expression - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('red'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[0].color')),
                    'red');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('purple'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[0].color')),
                            'purple');
                    });

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

    this.it('partial attribute expression, no fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeNoFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    //  For some reason, green isn't green...
                    TP.core.Color.fromString('rgb(0, 128, 0)'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[1].color')),
                    'green');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('yellow'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[1].color')),
                            'yellow');
                    });

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

    this.it('partial attribute expression, single-level fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeSingleFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[2].color')),
                    'blue');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('orange'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[2].color')),
                            'orange');
                    });

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

    this.it('partial attribute expression, multi-level fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeMultiFragmentJSON.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('yellow'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('$.people[3].color')),
                    'yellow');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('$.people[3].color')),
                            'blue');
                    });

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

    this.it('whole attribute expression - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].color')),
                    'red');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].color')),
                            'purple');
                    });

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

    this.it('whole attribute expression, no fragment, qualified binding - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeNoFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].color')),
                    'green');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].color')),
                            'yellow');
                    });

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

    this.it('whole attribute expression, single-level fragment, qualified binding - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeSingleFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[2].color')),
                    'blue');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[2].color')),
                            'orange');
                    });

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

    this.it('whole attribute expression, multi-level fragment, qualified binding - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindWholeAttributeMultiFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[3].color')),
                    'yellow');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[3].color')),
                            'blue');
                    });

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

    this.it('partial attribute expression - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'red');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('red'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].color')),
                    'red');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('purple', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'purple');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('purple'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[0].color')),
                            'purple');
                    });

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

    this.it('partial attribute expression, no fragment, qualified binding - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeNoFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'green');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    //  For some reason, green isn't green...
                    TP.core.Color.fromString('rgb(0, 128, 0)'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].color')),
                    'green');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('yellow', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'yellow');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('yellow'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[1].color')),
                            'yellow');
                    });

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

    this.it('partial attribute expression, single-level fragment, qualified binding - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeSingleFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'blue');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[2].color')),
                    'blue');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('orange', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'orange');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('orange'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[2].color')),
                            'orange');
                    });

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

    this.it('partial attribute expression, multi-level fragment, qualified binding - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindPartialAttributeMultiFragmentJSObj.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    modelObj,
                    colorField,
                    colorSpan;

                windowContext = test.getDriver().get('windowContext');

                modelObj = TP.uc('urn:tibet:test_person').getResource().get('result');

                colorField = TP.byId('colorField', windowContext);
                colorSpan = TP.byId('colorSpan', windowContext);

                test.assert.isEqualTo(
                    colorField.get('value'),
                    'yellow');

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        colorSpan.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('yellow'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[3].color')),
                    'yellow');

                test.getDriver().startSequence().
                    exec(function() {
                                colorField.clearValue();
                            }).
                    sendKeys('blue', colorField).
                    sendEvent(TP.hc('type', 'change'), colorField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            colorField.get('value'),
                            'blue');

                        test.assert.isEqualTo(
                            TP.core.Color.fromString(
                                colorSpan.getComputedStyleProperty(
                                                        'backgroundColor')),
                            TP.core.Color.fromString('blue'));

                        test.assert.isEqualTo(
                            TP.val(modelObj.get('people[3].color')),
                            'blue');
                    });

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

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: expressions with variables',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.it('bind:io attributes - no literal expression content', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindExprsWithVarsNoLiterals.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

    this.it('bind:io attributes - literal expression content', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindExprsWithVarsWithLiterals.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

    this.it('embedded syntax - no literal expression content', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindExprsWithVarsEmbedded.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

    this.it('embedded syntax - literal expression content', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindExprsWithVarsAndLiteralsEmbedded.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

    this.it('bind:io attributes - no literal expression content - repeating context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindExprsWithVarsIOAttrsRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    xmlField,
                    jsonField;

                windowContext = test.getDriver().get('windowContext');

                xmlField = TP.byId('xmlBindStdinAttr1', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'JOE');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'SMITH');

                xmlField = TP.byId('xmlBindStdinAttr2', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'JOHN');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'JONES');

                xmlField = TP.byId('xmlBindIndexAttr1', windowContext);
                jsonField = TP.byId('jsonBindIndexAttr0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    '1');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    '0');

                xmlField = TP.byId('xmlBindIndexAttr2', windowContext);
                jsonField = TP.byId('jsonBindIndexAttr1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    '2');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    '1');

                xmlField = TP.byId('firstNameField1', windowContext);
                jsonField = TP.byId('lastNameField0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'Joe');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'Smith');

                xmlField = TP.byId('firstNameField2', windowContext);
                jsonField = TP.byId('lastNameField1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'John');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'Jones');

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

    this.it('bind:io attributes - literal expression content - repeating context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindExprsWithVarsAndLiteralsIOAttrsRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    xmlField,
                    jsonField;

                windowContext = test.getDriver().get('windowContext');

                xmlField = TP.byId('xmlBindStdinAttr1', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The first name: JOE');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The last name: SMITH');

                xmlField = TP.byId('xmlBindStdinAttr2', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The first name: JOHN');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The last name: JONES');

                xmlField = TP.byId('xmlBindIndexAttr1', windowContext);
                jsonField = TP.byId('jsonBindIndexAttr0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The index: 1');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The index: 0');

                xmlField = TP.byId('xmlBindIndexAttr2', windowContext);
                jsonField = TP.byId('jsonBindIndexAttr1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The index: 2');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The index: 1');

                xmlField = TP.byId('firstNameField1', windowContext);
                jsonField = TP.byId('lastNameField0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The first name: Joe');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The last name: Smith');

                xmlField = TP.byId('firstNameField2', windowContext);
                jsonField = TP.byId('lastNameField1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The first name: John');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The last name: Jones');

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

    this.it('embedded syntax - no literal expression content - repeating context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindExprsWithVarsEmbeddedRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    xmlField,
                    jsonField;

                windowContext = test.getDriver().get('windowContext');

                xmlField = TP.byId('xmlBindStdinAttr1', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'JOE');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'SMITH');

                xmlField = TP.byId('xmlBindStdinAttr2', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'JOHN');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'JONES');

                xmlField = TP.byId('xmlBindIndexAttr1', windowContext);
                jsonField = TP.byId('jsonBindIndexAttr0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    '1');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    '0');

                xmlField = TP.byId('xmlBindIndexAttr2', windowContext);
                jsonField = TP.byId('jsonBindIndexAttr1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    '2');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    '1');

                xmlField = TP.byId('firstNameField1', windowContext);
                jsonField = TP.byId('lastNameField0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'Joe');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'Smith');

                xmlField = TP.byId('firstNameField2', windowContext);
                jsonField = TP.byId('lastNameField1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'John');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'Jones');

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

    this.it('embedded syntax - literal expression content - repeating context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindExprsWithVarsAndLiteralsEmbeddedRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext,

                    xmlField,
                    jsonField;

                windowContext = test.getDriver().get('windowContext');

                xmlField = TP.byId('xmlBindStdinAttr1', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The first name: JOE');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The last name: SMITH');

                xmlField = TP.byId('xmlBindStdinAttr2', windowContext);
                jsonField = TP.byId('jsonBindStdinAttr1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The first name: JOHN');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The last name: JONES');

                xmlField = TP.byId('xmlBindIndexAttr1', windowContext);
                jsonField = TP.byId('jsonBindIndexAttr0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The index: 1');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The index: 0');

                xmlField = TP.byId('xmlBindIndexAttr2', windowContext);
                jsonField = TP.byId('jsonBindIndexAttr1', windowContext);


                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The index: 2');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The index: 1');

                xmlField = TP.byId('firstNameField1', windowContext);
                jsonField = TP.byId('lastNameField0', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The first name: Joe');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The last name: Smith');

                xmlField = TP.byId('firstNameField2', windowContext);
                jsonField = TP.byId('lastNameField1', windowContext);

                test.assert.isEqualTo(
                    xmlField.getValue(),
                    'The first name: John');
                test.assert.isEqualTo(
                    jsonField.getValue(),
                    'The last name: Jones');

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

    this.it('Table - XML data source - repeating context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindTableXMLRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

    this.it('Table - JSON data source - repeating context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindTableJSONRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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

    this.it('Table - JavaScript Object data source - repeating context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindTableJSObjRepeating.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
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
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: standalone expressions',
function() {

    var unloadURI;

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

    this.it('fully qualified expressions - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindFullExpressionsXML.xhtml');

        this.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var fields;

                fields = TP.byCSSPath('span[bind|in]');

                test.assert.isEqualTo(
                    fields.at(0).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(1).getValue(),
                    'Smith');

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

    this.it('fully qualified expressions - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindFullExpressionsJSON.xhtml');

        this.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var fields;

                fields = TP.byCSSPath('span[bind|in]');

                test.assert.isEqualTo(
                    fields.at(0).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(1).getValue(),
                    'Smith');

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

    this.it('fully qualified expressions - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindFullExpressionsJSObj.xhtml');

        this.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var fields;

                fields = TP.byCSSPath('span[bind|in]');

                test.assert.isEqualTo(
                    fields.at(0).getValue(),
                    'Joe');

                test.assert.isEqualTo(
                    fields.at(1).getValue(),
                    'Smith');

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

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: insert into repeat',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

    this.it('insert into repeat - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatXMLInsert.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,

                    insertBeforeBeginButton,
                    insertAfterBeginButton,
                    insertBeforeEndButton,
                    insertAfterEndButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
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

                test.getDriver().startSequence().
                    click(insertBeforeBeginButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField1', windowContext).get('value'));
                    });

                //  Insert empty row after the first row

                test.getDriver().startSequence().
                    click(insertAfterBeginButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField2', windowContext).get('value'));
                    });

                //  Insert empty row before the last row

                test.getDriver().startSequence().
                    click(insertBeforeEndButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField5', windowContext).get('value'));
                    });

                //  Insert empty row after the last row

                test.getDriver().startSequence().
                    click(insertAfterEndButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField7', windowContext).get('value'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSONInsert.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,

                    insertBeforeBeginButton,
                    insertAfterBeginButton,
                    insertBeforeEndButton,
                    insertAfterEndButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
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

                test.getDriver().startSequence().
                    click(insertBeforeBeginButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField0', windowContext).get('value'));
                    });

                //  Insert empty row after the first row

                test.getDriver().startSequence().
                    click(insertAfterBeginButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField1', windowContext).get('value'));
                    });

                //  Insert empty row before the last row

                test.getDriver().startSequence().
                    click(insertBeforeEndButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField4', windowContext).get('value'));
                    });

                //  Insert empty row after the last row

                test.getDriver().startSequence().
                    click(insertAfterEndButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField6', windowContext).get('value'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);

    //  ---

    this.it('insert into repeat - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSObjInsert.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,

                    insertBeforeBeginButton,
                    insertAfterBeginButton,
                    insertBeforeEndButton,
                    insertAfterEndButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
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

                test.getDriver().startSequence().
                    click(insertBeforeBeginButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField0', windowContext).get('value'));
                    });

                //  Insert empty row after the first row

                test.getDriver().startSequence().
                    click(insertAfterBeginButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField1', windowContext).get('value'));
                    });

                //  Insert empty row before the last row

                test.getDriver().startSequence().
                    click(insertBeforeEndButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField4', windowContext).get('value'));
                    });

                //  Insert empty row after the last row

                test.getDriver().startSequence().
                    click(insertAfterEndButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEmpty(
                        TP.byId('lastNameField6', windowContext).get('value'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(10000);
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: delete from repeat',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    this.beforeEach(
        function() {
            this.getSuite().startTrackingSignals();
        });

    this.afterEach(
        function() {
            this.getSuite().stopTrackingSignals();
        });

    //  ---

    this.it('delete from repeat - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatXMLDelete.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,

                    deleteFirstRowButton,
                    deleteLastRowButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                deleteFirstRowButton =
                    TP.byId('deleteFirstRow', windowContext);

                deleteLastRowButton =
                    TP.byId('deleteLastRow', windowContext);

                //  NB: We start with 3 rows

                //  Delete the first row

                test.getDriver().startSequence().
                    click(deleteFirstRowButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            TP.byId('lastNameField1', windowContext).get('value'),
                            'Jones');
                    });

                //  Delete the last row

                test.getDriver().startSequence().
                    click(deleteLastRowButton).
                    perform();

                test.then(
                    function() {
                        //  There should only be 2 text fields left under the
                        //  repeater.
                        var repeater,
                            fields;

                        repeater = TP.byId('repeater', windowContext);

                        fields = TP.byCSSPath('input', repeater);

                        test.assert.isSizeOf(fields, 2);
                    });

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

    this.it('delete from repeat - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSONDelete.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,

                    deleteFirstRowButton,
                    deleteLastRowButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                deleteFirstRowButton =
                    TP.byId('deleteFirstRow', windowContext);

                deleteLastRowButton =
                    TP.byId('deleteLastRow', windowContext);

                //  NB: We start with 3 rows

                //  Delete the first row

                test.getDriver().startSequence().
                    click(deleteFirstRowButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            TP.byId('lastNameField0', windowContext).get('value'),
                            'Jones');
                    });

                //  Delete the last row

                test.getDriver().startSequence().
                    click(deleteLastRowButton).
                    perform();

                test.then(
                    function() {
                        //  There should only be 2 text fields left under the
                        //  repeater.
                        var repeater,
                            fields;

                        repeater = TP.byId('repeater', windowContext);

                        fields = TP.byCSSPath('input', repeater);

                        test.assert.isSizeOf(fields, 2);
                    });

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

    this.it('delete from repeat - JavaScript Object data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/BindRepeatJSObjDelete.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var windowContext,

                    deleteFirstRowButton,
                    deleteLastRowButton;

                windowContext = test.getDriver().get('windowContext');

                test.assert.didSignal(
                        TP.uc('urn:tibet:test_person'),
                        'TP.sig.ValueChange');

                deleteFirstRowButton =
                    TP.byId('deleteFirstRow', windowContext);

                deleteLastRowButton =
                    TP.byId('deleteLastRow', windowContext);

                //  NB: We start with 3 rows

                //  Delete the first row

                test.getDriver().startSequence().
                    click(deleteFirstRowButton).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            TP.byId('lastNameField0', windowContext).get('value'),
                            'Jones');
                    });

                //  Delete the last row

                test.getDriver().startSequence().
                    click(deleteLastRowButton).
                    perform();

                test.then(
                    function() {
                        //  There should only be 2 text fields left under the
                        //  repeater.
                        var repeater,
                            fields;

                        repeater = TP.byId('repeater', windowContext);

                        fields = TP.byCSSPath('input', repeater);

                        test.assert.isSizeOf(fields, 2);
                    });

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

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.bind.XMLNS.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
