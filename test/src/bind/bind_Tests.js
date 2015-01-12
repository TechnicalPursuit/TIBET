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

    this.it('binding attribute parsing tests', function(test, options) {
        var testMarkup,
            info;

        //  NB: These tests test only for 'bind:in', not 'bind:out' or
        //  'bind:io', but they're all subject to the same rules.

        //  Fully formed URI, no fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo: urn:tibet:foo"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo');

        //  Fully formed URI, with fragment, single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo: urn:tibet:foo#tibet(foo)"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');

        //  Fully formed URI, no fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo: urn:tibet:foo; bar: urn:tibet:bar"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:bar');

        //  Fully formed URI, with fragment, multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:in="foo: urn:tibet:foo#tibet(foo); bar: urn:tibet:bar#tibet(bar)"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:bar#tibet(bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo: #tibet(foo)"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), single value
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo: foo"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo: #tibet(foo); bar: #tibet(bar)"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:foo#tibet(bar)');

        //  Partially formed URI, with fragment (unspecified pointer scheme), multiple values
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo" bind:in="foo: foo; bar: bar"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:foo#tibet(bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), single value, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="bar: bar"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:foo#tibet(foo.bar)');

        //  Partially formed URI, with fragment (specified pointer scheme), multiple values, split path
        testMarkup = TP.tpelem('<test xmlns:bind="http://www.technicalpursuit.com/2005/binding" bind:scope="urn:tibet:foo#tibet(foo)" bind:in="foo: foo; bar: bar"/>');
        info = testMarkup.getBindingInfoFrom('in');
        test.assert.hasKey(info, 'foo');
        test.assert.isEqualTo(info.at('foo'), 'urn:tibet:foo#tibet(foo.foo)');
        test.assert.hasKey(info, 'bar');
        test.assert.isEqualTo(info.at('bar'), 'urn:tibet:foo#tibet(foo.bar)');
    });
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: simple binds',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind1.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind1_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind1_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind1_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind1_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Smith');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind2.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind2_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind2_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind2_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind2_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byOID('descriptionField').get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byOID('genderField').get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byOID('petRadio1').get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byOID('colorCheckbox1').get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

                descriptionField = TP.byOID('descriptionField');

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

                genderField = TP.byOID('genderField');
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

                petRadio3 = TP.byOID('petRadio3');

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

                colorCheckbox1 = TP.byOID('colorCheckbox1');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind3.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind3_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind3_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind3_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind3_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byOID('descriptionField').get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byOID('genderField').get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byOID('petRadio1').get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byOID('colorCheckbox1').get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

                descriptionField = TP.byOID('descriptionField');

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

                genderField = TP.byOID('genderField');
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

                petRadio3 = TP.byOID('petRadio3');

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

                colorCheckbox1 = TP.byOID('colorCheckbox1');

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

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind4.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind4_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind4_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind4_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind4_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byOID('descriptionField').get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byOID('genderField').get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byOID('petRadio1').get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byOID('colorCheckbox1').get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

                descriptionField = TP.byOID('descriptionField');

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

                genderField = TP.byOID('genderField');
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

                petRadio3 = TP.byOID('petRadio3');

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

                colorCheckbox1 = TP.byOID('colorCheckbox1');

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

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind5.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind5_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind5_person#xpath1(/person/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind5_person#xpath1(/person/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind5_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byOID('descriptionField').get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byOID('genderField').get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byOID('petRadio1').get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byOID('colorCheckbox1').get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/person/color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

                descriptionField = TP.byOID('descriptionField');

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

                genderField = TP.byOID('genderField');
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

                petRadio3 = TP.byOID('petRadio3');

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

                colorCheckbox1 = TP.byOID('colorCheckbox1');

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

    this.it('simple binding with text fields - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind6.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind6_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind6_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind6_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind6_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Smith');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

    this.it('simple binding with various XHTML controls - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind7.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind7_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind7_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind7_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind7_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byOID('descriptionField').get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byOID('genderField').get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byOID('petRadio1').get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byOID('colorCheckbox1').get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

                descriptionField = TP.byOID('descriptionField');

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

                genderField = TP.byOID('genderField');
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

                petRadio3 = TP.byOID('petRadio3');

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

                colorCheckbox1 = TP.byOID('colorCheckbox1');

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

    this.it('bind:scope, no fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind8.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind8_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind8_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind8_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind8_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byOID('descriptionField').get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byOID('genderField').get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byOID('petRadio1').get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byOID('colorCheckbox1').get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

                descriptionField = TP.byOID('descriptionField');

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

                genderField = TP.byOID('genderField');
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

                petRadio3 = TP.byOID('petRadio3');

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

                colorCheckbox1 = TP.byOID('colorCheckbox1');

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

    this.it('bind:scope, single-level fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind9.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind9_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind9_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind9_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind9_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byOID('descriptionField').get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byOID('genderField').get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byOID('petRadio1').get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byOID('colorCheckbox1').get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

                descriptionField = TP.byOID('descriptionField');

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

                genderField = TP.byOID('genderField');
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

                petRadio3 = TP.byOID('petRadio3');

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

                colorCheckbox1 = TP.byOID('colorCheckbox1');

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

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind10.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind10_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind10_person#tibet(person.firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind10_person#tibet(person.lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind10_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.lastname')),
                    'Jones');

                //  firstNameField is just another text field - no reason to
                //  test it too

                test.assert.isEqualTo(
                    TP.byOID('descriptionField').get('value'),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.description')),
                    'Ms. Jones is a great lady');

                test.assert.isEqualTo(
                    TP.byOID('genderField').get('value'),
                    'f');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.gender')),
                    'f');

                test.assert.isEqualTo(
                    TP.byOID('petRadio1').get('value'),
                    'cat');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.pet')),
                    'cat');

                test.assert.isEqualTo(
                    TP.byOID('colorCheckbox1').get('value'),
                    TP.ac('blue'));

                test.assert.isEqualTo(
                    TP.val(modelObj.get('person.color')),
                    'blue');

                //  Change the content via 'user' interaction

                lastNameField = TP.byOID('lastNameField');

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

                descriptionField = TP.byOID('descriptionField');

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

                genderField = TP.byOID('genderField');
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

                petRadio3 = TP.byOID('petRadio3');

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

                colorCheckbox1 = TP.byOID('colorCheckbox1');

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
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: numerically indexed binds',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind11.xhtml');

        this.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    lastNameField1,
                    lastNameField2;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind11_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind11_person#xpath1(/people/person[1]/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind11_person#xpath1(/people/person[1]/lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind11_person#xpath1(/people/person[2]/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind11_person#xpath1(/people/person[2]/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind11_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField2').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byOID('lastNameField1');

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

                lastNameField2 = TP.byOID('lastNameField2');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind12.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    lastNameField1,
                    lastNameField2;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind12_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind12_person#xpath1(/people/person[1]/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind12_person#xpath1(/people/person[1]/lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind12_person#xpath1(/people/person[2]/firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind12_person#xpath1(/people/person[2]/lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind12_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField2').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byOID('lastNameField1');

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

                lastNameField2 = TP.byOID('lastNameField2');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind13.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    lastNameField1,
                    lastNameField2;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind13_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind13_person#tibet(people[0].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind13_person#tibet(people[0].lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind13_person#tibet(people[1].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind13_person#tibet(people[1].lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind13_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField2').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byOID('lastNameField1');

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

                lastNameField2 = TP.byOID('lastNameField2');

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

    this.it('simple numeric indexed binds with scoping - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind14.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    lastNameField1,
                    lastNameField2;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind14_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind14_person#tibet(people[0].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind14_person#tibet(people[0].lastname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind14_person#tibet(people[1].firstname)'),
                        'TP.sig.StructureChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind14_person#tibet(people[1].lastname)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind14_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField2').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byOID('lastNameField1');

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

                lastNameField2 = TP.byOID('lastNameField2');

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

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind15.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    lastNameField1,
                    lastNameField2;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind15_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind15_person#xpath1(/people/person)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind15_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField2').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byOID('lastNameField1');

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

                lastNameField2 = TP.byOID('lastNameField2');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind16.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    lastNameField1,
                    lastNameField2,
                    addressStreetField11,
                    addressCityField22;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind16_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind16_person#xpath1(/people/person)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind16_person').getResource();

                //  ---

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('addressStreetField11').get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/addresses/address[1]/street')),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byOID('addressStreetField12').get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[1]/addresses/address[2]/street')),
                    '222 State St.');

                //  ---

                test.assert.isEqualTo(
                    TP.byOID('lastNameField2').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/lastname')),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byOID('addressCityField21').get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/addresses/address[1]/city')),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byOID('addressCityField22').get('value'),
                    'One More Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('/people/person[2]/addresses/address[2]/city')),
                    'One More Town');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byOID('lastNameField1');

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

                lastNameField2 = TP.byOID('lastNameField2');

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

                addressStreetField11 = TP.byOID('addressStreetField11');

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

                addressCityField22 = TP.byOID('addressCityField22');

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
    });

    //  ---

    this.it('repeat binding with text fields - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind17.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    lastNameField1,
                    lastNameField2;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind17_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind17_person#tibet(people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind17_person').getResource();

                test.assert.isEqualTo(
                    TP.byOID('lastNameField0').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byOID('lastNameField0');

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

                lastNameField2 = TP.byOID('lastNameField1');

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

    this.it('nested repeat binding with text fields - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind18.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    lastNameField1,
                    lastNameField2,
                    addressStreetField00,
                    addressCityField11;

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind18_person'),
                        'TP.sig.ValueChange');

                test.assert.didSignal(
                        TP.uc('urn:tibet:Bind18_person#tibet(people)'),
                        'TP.sig.StructureChange');

                modelObj = TP.uc('urn:tibet:Bind18_person').getResource();

                //  ---

                test.assert.isEqualTo(
                    TP.byOID('lastNameField0').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].lastname')),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('addressStreetField00').get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].addresses[0].street')),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byOID('addressStreetField01').get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[0].addresses[1].street')),
                    '222 State St.');

                //  ---

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].lastname')),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byOID('addressCityField10').get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].addresses[0].city')),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byOID('addressCityField11').get('value'),
                    'One More Town');

                test.assert.isEqualTo(
                    TP.val(modelObj.get('people[1].addresses[1].city')),
                    'One More Town');

                //  Change the content via 'user' interaction

                lastNameField1 = TP.byOID('lastNameField0');

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

                lastNameField2 = TP.byOID('lastNameField1');

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

                addressStreetField00 = TP.byOID('addressStreetField00');

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

                addressCityField11 = TP.byOID('addressCityField11');

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
    });

    //  ---

    this.it('repeat binding with text fields and paging - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind19.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var repeatIndexField,
                    repeatSizeField;

                repeatIndexField = TP.byOID('repeatIndexField');
                repeatSizeField = TP.byOID('repeatSizeField');

                test.assert.isEqualTo(
                    TP.byOID('repeatIndexField').get('value'),
                    '1');

                test.assert.isEqualTo(
                    TP.byOID('repeatSizeField').get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(TP.byId('firstNameField1'));
                test.assert.isDisplayed(TP.byId('lastNameField1'));
                test.assert.isDisplayed(TP.byId('firstNameField2'));
                test.assert.isDisplayed(TP.byId('lastNameField2'));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('firstNameField1').get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField2').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byOID('firstNameField2').get('value'),
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

                        test.assert.isDisplayed(TP.byId('firstNameField3'));
                        test.assert.isDisplayed(TP.byId('lastNameField3'));
                        test.assert.isDisplayed(TP.byId('firstNameField4'));
                        test.assert.isDisplayed(TP.byId('lastNameField4'));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byOID('lastNameField3').get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField3').get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byOID('lastNameField4').get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField4').get('value'),
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

                        test.assert.isDisplayed(TP.byId('firstNameField1'));
                        test.assert.isDisplayed(TP.byId('lastNameField1'));
                        test.assert.isDisplayed(TP.byId('firstNameField2'));
                        test.assert.isDisplayed(TP.byId('lastNameField2'));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byOID('lastNameField1').get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField1').get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byOID('lastNameField2').get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField2').get('value'),
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

        loadURI = TP.uc('~lib_tst/src/bind/Bind20.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var repeatIndexField,
                    repeatSizeField;

                repeatIndexField = TP.byOID('repeatIndexField');
                repeatSizeField = TP.byOID('repeatSizeField');

                test.assert.isEqualTo(
                    TP.byOID('repeatIndexField').get('value'),
                    '1');

                test.assert.isEqualTo(
                    TP.byOID('repeatSizeField').get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(TP.byId('firstNameField1'));
                test.assert.isDisplayed(TP.byId('lastNameField1'));
                test.assert.isDisplayed(TP.byId('firstNameField2'));
                test.assert.isDisplayed(TP.byId('lastNameField2'));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('firstNameField1').get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byOID('addressStreetField11').get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byOID('addressStreetField12').get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField2').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byOID('firstNameField2').get('value'),
                    'John');

                test.assert.isEqualTo(
                    TP.byOID('addressCityField21').get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byOID('addressCityField22').get('value'),
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

                        test.assert.isDisplayed(TP.byId('firstNameField3'));
                        test.assert.isDisplayed(TP.byId('lastNameField3'));
                        test.assert.isDisplayed(TP.byId('addressStreetField31'));
                        test.assert.isDisplayed(TP.byId('addressStreetField32'));

                        test.assert.isDisplayed(TP.byId('firstNameField4'));
                        test.assert.isDisplayed(TP.byId('lastNameField4'));
                        test.assert.isDisplayed(TP.byId('addressCityField41'));
                        test.assert.isDisplayed(TP.byId('addressCityField42'));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byOID('lastNameField3').get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField3').get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byOID('addressStreetField31').get('value'),
                            '#27 Ritz Ave. Apt A.');

                        test.assert.isEqualTo(
                            TP.byOID('addressStreetField32').get('value'),
                            '#4 Country Rd.');

                        test.assert.isEqualTo(
                            TP.byOID('lastNameField4').get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField4').get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            TP.byOID('addressCityField41').get('value'),
                            'High Power Place');

                        test.assert.isEqualTo(
                            TP.byOID('addressCityField42').get('value'),
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

                        test.assert.isDisplayed(TP.byId('firstNameField1'));
                        test.assert.isDisplayed(TP.byId('lastNameField1'));
                        test.assert.isDisplayed(TP.byId('addressStreetField11'));
                        test.assert.isDisplayed(TP.byId('addressStreetField12'));

                        test.assert.isDisplayed(TP.byId('firstNameField2'));
                        test.assert.isDisplayed(TP.byId('lastNameField2'));
                        test.assert.isDisplayed(TP.byId('addressCityField21'));
                        test.assert.isDisplayed(TP.byId('addressCityField22'));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byOID('lastNameField1').get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField1').get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byOID('addressStreetField11').get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            TP.byOID('addressStreetField12').get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            TP.byOID('lastNameField2').get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField2').get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byOID('addressCityField21').get('value'),
                            'In Your Town');

                        test.assert.isEqualTo(
                            TP.byOID('addressCityField22').get('value'),
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

        loadURI = TP.uc('~lib_tst/src/bind/Bind21.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var repeatIndexField,
                    repeatSizeField;

                repeatIndexField = TP.byOID('repeatIndexField');
                repeatSizeField = TP.byOID('repeatSizeField');

                test.assert.isEqualTo(
                    TP.byOID('repeatIndexField').get('value'),
                    '0');

                test.assert.isEqualTo(
                    TP.byOID('repeatSizeField').get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(TP.byId('firstNameField0'));
                test.assert.isDisplayed(TP.byId('lastNameField0'));
                test.assert.isDisplayed(TP.byId('firstNameField1'));
                test.assert.isDisplayed(TP.byId('lastNameField1'));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byOID('lastNameField0').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('firstNameField0').get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byOID('firstNameField1').get('value'),
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

                        test.assert.isDisplayed(TP.byId('firstNameField2'));
                        test.assert.isDisplayed(TP.byId('lastNameField2'));
                        test.assert.isDisplayed(TP.byId('firstNameField3'));
                        test.assert.isDisplayed(TP.byId('lastNameField3'));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byOID('lastNameField2').get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField2').get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byOID('lastNameField3').get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField3').get('value'),
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

                        test.assert.isDisplayed(TP.byId('firstNameField0'));
                        test.assert.isDisplayed(TP.byId('lastNameField0'));
                        test.assert.isDisplayed(TP.byId('firstNameField1'));
                        test.assert.isDisplayed(TP.byId('lastNameField1'));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byOID('lastNameField0').get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField0').get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byOID('lastNameField1').get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField1').get('value'),
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

        loadURI = TP.uc('~lib_tst/src/bind/Bind22.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var repeatIndexField,
                    repeatSizeField;

                repeatIndexField = TP.byOID('repeatIndexField');
                repeatSizeField = TP.byOID('repeatSizeField');

                test.assert.isEqualTo(
                    TP.byOID('repeatIndexField').get('value'),
                    '0');

                test.assert.isEqualTo(
                    TP.byOID('repeatSizeField').get('value'),
                    '2');

                //  These 4 fields should be generated and visible
                test.assert.isDisplayed(TP.byId('firstNameField0'));
                test.assert.isDisplayed(TP.byId('lastNameField0'));
                test.assert.isDisplayed(TP.byId('firstNameField1'));
                test.assert.isDisplayed(TP.byId('lastNameField1'));

                //  And have the following values
                test.assert.isEqualTo(
                    TP.byOID('lastNameField0').get('value'),
                    'Smith');

                test.assert.isEqualTo(
                    TP.byOID('firstNameField0').get('value'),
                    'Joe');

                test.assert.isEqualTo(
                    TP.byOID('addressStreetField00').get('value'),
                    '111 Main St.');

                test.assert.isEqualTo(
                    TP.byOID('addressStreetField01').get('value'),
                    '222 State St.');

                test.assert.isEqualTo(
                    TP.byOID('lastNameField1').get('value'),
                    'Jones');

                test.assert.isEqualTo(
                    TP.byOID('firstNameField1').get('value'),
                    'John');

                test.assert.isEqualTo(
                    TP.byOID('addressCityField10').get('value'),
                    'Yet Another Town');

                test.assert.isEqualTo(
                    TP.byOID('addressCityField11').get('value'),
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

                        test.assert.isDisplayed(TP.byId('firstNameField2'));
                        test.assert.isDisplayed(TP.byId('lastNameField2'));
                        test.assert.isDisplayed(TP.byId('addressStreetField20'));
                        test.assert.isDisplayed(TP.byId('addressStreetField21'));

                        test.assert.isDisplayed(TP.byId('firstNameField3'));
                        test.assert.isDisplayed(TP.byId('lastNameField3'));
                        test.assert.isDisplayed(TP.byId('addressCityField30'));
                        test.assert.isDisplayed(TP.byId('addressCityField31'));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byOID('lastNameField2').get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField2').get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byOID('addressStreetField20').get('value'),
                            '#27 Ritz Ave. Apt A.');

                        test.assert.isEqualTo(
                            TP.byOID('addressStreetField21').get('value'),
                            '#4 Country Rd.');

                        test.assert.isEqualTo(
                            TP.byOID('lastNameField3').get('value'),
                            'Professional');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField3').get('value'),
                            'Pamela');

                        test.assert.isEqualTo(
                            TP.byOID('addressCityField30').get('value'),
                            'High Power Place');

                        test.assert.isEqualTo(
                            TP.byOID('addressCityField31').get('value'),
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

                        test.assert.isDisplayed(TP.byId('firstNameField0'));
                        test.assert.isDisplayed(TP.byId('lastNameField0'));
                        test.assert.isDisplayed(TP.byId('addressStreetField00'));
                        test.assert.isDisplayed(TP.byId('addressStreetField01'));

                        test.assert.isDisplayed(TP.byId('firstNameField1'));
                        test.assert.isDisplayed(TP.byId('lastNameField1'));
                        test.assert.isDisplayed(TP.byId('addressCityField10'));
                        test.assert.isDisplayed(TP.byId('addressCityField11'));

                        //  And have the following values
                        test.assert.isEqualTo(
                            TP.byOID('lastNameField0').get('value'),
                            'Jones');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField0').get('value'),
                            'John');

                        test.assert.isEqualTo(
                            TP.byOID('addressStreetField00').get('value'),
                            '333 1st Av.');

                        test.assert.isEqualTo(
                            TP.byOID('addressStreetField01').get('value'),
                            '444 2nd Av.');

                        test.assert.isEqualTo(
                            TP.byOID('lastNameField1').get('value'),
                            'Homemaker');

                        test.assert.isEqualTo(
                            TP.byOID('firstNameField1').get('value'),
                            'Billy');

                        test.assert.isEqualTo(
                            TP.byOID('addressCityField10').get('value'),
                            'In Your Town');

                        test.assert.isEqualTo(
                            TP.byOID('addressCityField11').get('value'),
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
}).timeout(45000).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('bind: static tables',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind23.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var dataRows,
                    dataCells;

                dataRows = TP.byCSS('tr', TP.byId('people'));
                test.assert.isEqualTo(dataRows.getSize(), 4);

                dataCells = TP.byCSS('td', TP.byId('people'));
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

        loadURI = TP.uc('~lib_tst/src/bind/Bind24.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var dataRows,
                    dataCells;

                dataRows = TP.byCSS('tr', TP.byId('people'));
                test.assert.isEqualTo(dataRows.getSize(), 4);

                dataCells = TP.byCSS('td', TP.byId('people'));
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

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind25.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField;

                modelObj = TP.uc('urn:tibet:Bind25_person').getResource();

                colorField = TP.byOID('colorField');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind26.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField;

                modelObj = TP.uc('urn:tibet:Bind26_person').getResource();

                colorField = TP.byOID('colorField');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind27.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField;

                modelObj = TP.uc('urn:tibet:Bind27_person').getResource();

                colorField = TP.byOID('colorField');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind28.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField;

                modelObj = TP.uc('urn:tibet:Bind28_person').getResource();

                colorField = TP.byOID('colorField');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind29.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField,
                    colorSpan;

                modelObj = TP.uc('urn:tibet:Bind29_person').getResource();

                colorField = TP.byOID('colorField');
                colorSpan = TP.byOID('colorSpan');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind30.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField,
                    colorSpan;

                modelObj = TP.uc('urn:tibet:Bind30_person').getResource();

                colorField = TP.byOID('colorField');
                colorSpan = TP.byOID('colorSpan');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind31.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField,
                    colorSpan;

                modelObj = TP.uc('urn:tibet:Bind31_person').getResource();

                colorField = TP.byOID('colorField');
                colorSpan = TP.byOID('colorSpan');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind32.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField,
                    colorSpan;

                modelObj = TP.uc('urn:tibet:Bind32_person').getResource();

                colorField = TP.byOID('colorField');
                colorSpan = TP.byOID('colorSpan');

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

        loadURI = TP.uc('~lib_tst/src/bind/Bind33.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField;

                modelObj = TP.uc('urn:tibet:Bind33_person').getResource();

                colorField = TP.byOID('colorField');

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

    this.it('whole attribute expression, no fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind34.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField;

                modelObj = TP.uc('urn:tibet:Bind34_person').getResource();

                colorField = TP.byOID('colorField');

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

    this.it('whole attribute expression, single-level fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind35.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField;

                modelObj = TP.uc('urn:tibet:Bind35_person').getResource();

                colorField = TP.byOID('colorField');

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

    this.it('whole attribute expression, multi-level fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind36.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField;

                modelObj = TP.uc('urn:tibet:Bind36_person').getResource();

                colorField = TP.byOID('colorField');

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

    this.it('partial attribute expression - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind37.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField,
                    colorSpan;

                modelObj = TP.uc('urn:tibet:Bind37_person').getResource();

                colorField = TP.byOID('colorField');
                colorSpan = TP.byOID('colorSpan');

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

    this.it('partial attribute expression, no fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind38.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField,
                    colorSpan;

                modelObj = TP.uc('urn:tibet:Bind38_person').getResource();

                colorField = TP.byOID('colorField');
                colorSpan = TP.byOID('colorSpan');

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

    this.it('partial attribute expression, single-level fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind39.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField,
                    colorSpan;

                modelObj = TP.uc('urn:tibet:Bind39_person').getResource();

                colorField = TP.byOID('colorField');
                colorSpan = TP.byOID('colorSpan');

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

    this.it('partial attribute expression, multi-level fragment, qualified binding - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind40.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var modelObj,
                    colorField,
                    colorSpan;

                modelObj = TP.uc('urn:tibet:Bind40_person').getResource();

                colorField = TP.byOID('colorField');
                colorSpan = TP.byOID('colorSpan');

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

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.bind.XMLNS.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
