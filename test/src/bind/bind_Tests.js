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

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

                descriptionField.clearValue();

                test.getDriver().startSequence().
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

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

                descriptionField.clearValue();

                test.getDriver().startSequence().
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

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

                descriptionField.clearValue();

                test.getDriver().startSequence().
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
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(5000);

    //  ---

    this.it('bind:scope, multi-level fragment, qualified binding with various XHTML controls - XML data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind5.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

                descriptionField.clearValue();

                test.getDriver().startSequence().
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
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).timeout(5000);

    //  ---

    this.it('simple binding with text fields - JSON data source', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/bind/Bind6.xhtml');

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

                descriptionField.clearValue();

                test.getDriver().startSequence().
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

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

                descriptionField.clearValue();

                test.getDriver().startSequence().
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

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

                descriptionField.clearValue();

                test.getDriver().startSequence().
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

        this.getDriver().setLocation(loadURI);

        this.then(
            function() {
                var modelObj,
                    lastNameField,
                    descriptionField,
                    genderField,
                    genderFieldOption1,
                    petRadio3,
                    colorCheckbox1;

                test.assert.didSignal(TP.sys.uidoc(), 'TP.sig.DOMContentLoaded');

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

                lastNameField.clearValue();

                test.getDriver().startSequence().
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

                descriptionField.clearValue();

                test.getDriver().startSequence().
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
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });

    });

}).skip(TP.sys.cfg('boot.context') === 'phantomjs').timeout(30000);


//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.bind.XMLNS.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
