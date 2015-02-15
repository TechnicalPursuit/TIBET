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
//  TP.core.ElementNode
//  ========================================================================

TP.core.ElementNode.Inst.describe('TP.core.ElementNode: ui:display attribute',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

    //  ---

    this.before(
        function() {

            //  ---

            if (!TP.isType(TP.sys.getTypeByName('TP.test.PetDisplayConverter'))) {

                TP.lang.Object.defineSubtype('TP.test.PetDisplayConverter');
                TP.test.PetDisplayConverter.Type.defineMethod(
                                        'fromString',
                                        function(aValue, params) {
                                            switch (aValue) {
                                                case 'woof':
                                                    return 'foo';
                                                case 'meow':
                                                    return 'bar';
                                                case 'gurgle':
                                                    return 'baz';
                                                default:
                                                    break;
                                            }
                                        });
            }

            //  ---

            if (!TP.isType(TP.sys.getTypeByName('TP.test.ColorDisplayConverter'))) {

                TP.lang.Object.defineSubtype('TP.test.ColorDisplayConverter');
                TP.test.ColorDisplayConverter.Type.defineMethod(
                                        'fromTP_core_Color',
                                        function(aValue, params) {
                                            switch (TP.str(aValue)) {
                                                case TP.str(TP.cc('red')):
                                                    return 'foo';
                                                case TP.str(TP.cc('blue')):
                                                    return 'bar';
                                                case TP.str(TP.cc('yellow')):
                                                    return 'baz';
                                                default:
                                                    break;
                                            }
                                        });
            }

            //  ---

            if (!TP.isType(TP.sys.getTypeByName('TP.test.Localizer'))) {

                TP.lang.Object.defineSubtype('TP.test.Localizer');
                TP.test.Localizer.Type.defineMethod(
                    'fromString',
                    function(aValue, params) {
                        var tpTargetElem,
                            contentLang;

                        if (TP.notValid(tpTargetElem = params.at('target'))) {
                            return aValue;
                        }

                        contentLang = tpTargetElem.getContentLanguage();

                        return aValue.localize(contentLang);
                    });
                TP.test.Localizer.Type.defineMethod(
                    'fromObject',
                    function(aValue, params) {
                        var tpTargetElem,
                            contentLang;

                        if (TP.notValid(tpTargetElem = params.at('target'))) {
                            return aValue;
                        }

                        contentLang = tpTargetElem.getContentLanguage();

                        return aValue.localize(contentLang);
                    });
            }

            //  ---

            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.it('set content - single format - simple substitutions', function(test, options) {

        var loadURI,

            driver,

            dataObj;

        loadURI = TP.uc('~lib_tst/src/tibet/formatting/Formatting1.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var elem;

                //  ---

                elem = TP.byOID('span');
                test.assert.isElement(elem);

                elem.set('value', '5555555');

                test.assert.isEqualTo(
                    elem.getValue(),
                    '555-5555');

                //  ---

                elem = TP.byOID('div');
                test.assert.isElement(elem);

                elem.set('value', '100');

                test.assert.isEqualTo(
                    elem.getValue(),
                    '100.00');

                //  ---

                elem = TP.byOID('input_text');
                test.assert.isElement(elem);

                elem.set('value', 'bill');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'Bill');

                //  ---

                elem = TP.byOID('textarea');
                test.assert.isElement(elem);

                elem.set('value', TP.dc());

                test.assert.isEqualTo(
                    elem.getValue(),
                    TP.str(TP.dc().getFullYear()));

                //  ---

                elem = TP.byOID('select_single');
                test.assert.isElement(elem);

                elem.set('value', 'woof');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'foo');

                //  ---

                elem = TP.byOID('select_single');
                test.assert.isElement(elem);

                elem.set('value', 'gurgle');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'baz');

                //  ---

                elem = TP.byOID('select_multiple');
                test.assert.isElement(elem);

                elem.set('value', TP.cc('red'));

                test.assert.contains(
                    elem.getValue(),
                    'foo');

                //  ---

                elem = TP.byOID('select_multiple');
                test.assert.isElement(elem);

                elem.set('value', TP.cc('yellow'));

                test.assert.contains(
                    elem.getValue(),
                    'baz');

                //  ---

                //  NB: We go after elements that do *not* have the 'ui:display'
                //  attribute, but because they're in a group with an element
                //  that does, the value should still be formatted.
                elem = TP.byOID('input_radio_2');
                test.assert.isElement(elem);

                elem.set('value', 'woof');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'foo');

                //  ---

                elem = TP.byOID('input_radio_3');
                test.assert.isElement(elem);

                elem.set('value', 'gurgle');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'baz');

                //  ---

                //  NB: We go after elements that do *not* have the 'ui:display'
                //  attribute, but because they're in a group with an element
                //  that does, the value should still be formatted.

                elem = TP.byOID('input_checkbox_2');
                test.assert.isElement(elem);

                elem.set('value', TP.cc('red'));

                test.assert.contains(
                    elem.getValue(),
                    'foo');

                //  ---

                elem = TP.byOID('input_checkbox_3');
                test.assert.isElement(elem);

                elem.set('value', TP.cc('yellow'));

                test.assert.contains(
                    elem.getValue(),
                    'baz');

                //  ---

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('set content - single format - templating', function(test, options) {

        var loadURI,

            driver,

            dataObj;

        loadURI = TP.uc('~lib_tst/src/tibet/formatting/Formatting2.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var elem;

                //  ---

                elem = TP.byOID('span');
                test.assert.isElement(elem);

                elem.set('value', TP.hc('foo', 'bar'));

                test.assert.isEqualTo(
                    elem.getValue(),
                    'bar');

                //  ---

                elem = TP.byOID('div');
                test.assert.isElement(elem);

                elem.set('value', TP.hc('foo', 'bar'));

                test.assert.isEqualTo(
                    elem.getValue(),
                    'It is: bar');

                //  ---

                elem = TP.byOID('input_text');
                test.assert.isElement(elem);

                elem.set('value', TP.hc('foo', TP.hc('bar', 'baz')));

                test.assert.isEqualTo(
                    elem.getValue(),
                    'baz');

                //  ---

                elem = TP.byOID('textarea');
                test.assert.isElement(elem);

                elem.set('value', TP.ac(1, 2, 3));

                test.assert.isEqualTo(
                    elem.getValue(),
                    '3');

                //  ---

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('set content - multiple formats - simple substitutions', function(test, options) {

        var loadURI,

            driver,

            dataObj;

        loadURI = TP.uc('~lib_tst/src/tibet/formatting/Formatting3.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var elem;

                //  ---

                elem = TP.byOID('span');
                test.assert.isElement(elem);

                elem.set('value', 'Bill');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'bill');

                //  ---

                elem = TP.byOID('div');
                test.assert.isElement(elem);

                elem.set('value', TP.ac(1, 2, 3));

                test.assert.isEqualTo(
                    elem.getValue(),
                    '&lt;html:li&gt;1&lt;/html:li&gt;&lt;html:li&gt;2&lt;/html:li&gt;&lt;html:li&gt;3&lt;/html:li&gt;');

                //  ---

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('set content - using type for localization', function(test, options) {

        var loadURI,

            driver,

            dataObj;

        loadURI = TP.uc('~lib_tst/src/tibet/formatting/Formatting4.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var elem;

                //  Note that the strings here are localized against the
                //  'strings.xml' file in either the app (if available) or the
                //  lib.

                //  ---

                elem = TP.byOID('span');
                test.assert.isElement(elem);

                elem.set('value', 'false');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'falsch');

                //  ---

                elem = TP.byOID('div');
                test.assert.isElement(elem);

                elem.set('value', 'Hello');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'Hallo');

                //  ---

                elem = TP.byOID('input_text');
                test.assert.isElement(elem);

                elem.set('value', 1000000.42);

                test.assert.isEqualTo(
                    elem.getValue(),
                    '1.000.000,42');

                //  ---

                elem = TP.byOID('textarea');
                test.assert.isElement(elem);

                elem.set('value', Date.constructDayOne(1900));

                test.assert.isEqualTo(
                    elem.getValue(),
                    '1900-01-01T06:00:00');

                //  ---

                elem = TP.byOID('select_single');
                test.assert.isElement(elem);

                elem.set('value', 'yes');

                test.assert.isEqualTo(
                    elem.getValue(),
                    'ja');

                //  ---

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.describe('TP.core.ElementNode: ui:storage attribute',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

    //  ---

    this.before(
        function() {

            //  ---

            if (!TP.isType(TP.sys.getTypeByName('TP.test.PetStorageConverter'))) {

                TP.lang.Object.defineSubtype('TP.test.PetStorageConverter');
                TP.test.PetStorageConverter.Type.defineMethod(
                                        'fromString',
                                        function(aValue, params) {
                                            switch (aValue) {
                                                case 'foo':
                                                    return 'woof';
                                                case 'bar':
                                                    return 'meow';
                                                case 'baz':
                                                    return 'gurgle';
                                                default:
                                                    break;
                                            }
                                        });
            }

            //  ---

            if (!TP.isType(TP.sys.getTypeByName('TP.test.ColorStorageConverter'))) {

                TP.lang.Object.defineSubtype('TP.test.ColorStorageConverter');
                TP.test.ColorStorageConverter.Type.defineMethod(
                                        'fromArray',
                                        function(aValue, params) {
                                            return aValue.collect(
                                                function(val) {
                                                    return this.fromString(val);
                                                }.bind(this));
                                        });
                TP.test.ColorStorageConverter.Type.defineMethod(
                                        'fromString',
                                        function(aValue, params) {
                                            switch (aValue) {
                                                case 'foo':
                                                    return TP.cc('red');
                                                case 'bar':
                                                    return TP.cc('blue');
                                                case 'baz':
                                                    return TP.cc('yellow');
                                                default:
                                                    break;
                                            }
                                        });
            }

            //  ---

            if (!TP.isType(TP.sys.getTypeByName('TP.test.Splitter'))) {

                TP.lang.Object.defineSubtype('TP.test.Splitter');
                TP.test.Splitter.Type.defineMethod(
                                        'fromString',
                                        function(aValue, params) {
                                            return aValue.split(',');
                                        });
            }

            //  ---

            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.it('get content - single format - simple substitutions', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/formatting/Formatting5.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var textField,
                    textArea,

                    selectSingle,
                    optionToSelect,

                    selectMultiple,

                    inputRadio2,
                    inputRadio3,

                    inputCheckbox2,
                    inputCheckbox3;

                //  Change the content via 'user' interaction

                textField = TP.byOID('input_text');

                test.getDriver().startSequence().
                    exec(function() {
                                textField.clearValue();
                            }).
                    sendKeys('jones', textField).
                    sendEvent(TP.hc('type', 'change'), textField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            textField.get('value'),
                            'Jones');
                    });

                //  ---

                textArea = TP.byOID('textarea');

                test.getDriver().startSequence().
                    exec(function() {
                                textArea.clearValue();
                            }).
                    sendKeys(TP.str(TP.dc()), textArea).
                    sendEvent(TP.hc('type', 'change'), textArea).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            textArea.get('value'),
                            TP.str(TP.dc().getFullYear()));
                    });

                //  ---

                selectSingle = TP.byOID('select_single');
                optionToSelect = selectSingle.getElementArray().at(1);

                test.getDriver().startSequence().
                    click(optionToSelect).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            selectSingle.get('value'),
                            'meow');
                    });

                //  ---

                selectMultiple = TP.byOID('select_multiple');
                optionToSelect = selectMultiple.getElementArray().at(1);

                test.getDriver().startSequence().
                    click(optionToSelect).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            selectMultiple.get('value'),
                            TP.ac(TP.cc('blue')));
                    });

                //  ---

                //  NB: We go after elements that do *not* have the 'ui:storage'
                //  attribute, but because they're in a group with an element
                //  that does, the value should still be formatted.
                inputRadio2 = TP.byOID('input_radio_2');
                test.assert.isElement(inputRadio2);

                test.getDriver().startSequence().
                    click(inputRadio2).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            inputRadio2.getValue(),
                            'meow');
                    });

                //  ---

                inputRadio3 = TP.byOID('input_radio_3');
                test.assert.isElement(inputRadio3);

                test.getDriver().startSequence().
                    click(inputRadio3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            inputRadio3.getValue(),
                            'gurgle');
                    });

                //  ---

                //  NB: We go after elements that do *not* have the 'ui:storage'
                //  attribute, but because they're in a group with an element
                //  that does, the value should still be formatted.

                inputCheckbox2 = TP.byOID('input_checkbox_2');
                test.assert.isElement(inputCheckbox2);

                test.getDriver().startSequence().
                    click(inputCheckbox2).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            inputCheckbox2.getValue(),
                            TP.ac(TP.cc('blue')));
                    });

                //  ---

                inputCheckbox3 = TP.byOID('input_checkbox_3');
                test.assert.isElement(inputCheckbox3);

                test.getDriver().startSequence().
                    click(inputCheckbox3).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            inputCheckbox3.getValue(),
                            //  both checkbox2 and checkbox3 are on at this
                            //  point
                            TP.ac(TP.cc('blue'), TP.cc('yellow')));
                    });

                //  ---

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

    this.it('get content - single format - templating', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/formatting/Formatting6.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var textField,
                    textArea;

                //  Change the content via 'user' interaction

                textField = TP.byOID('input_text');

                test.getDriver().startSequence().
                    exec(function() {
                                textField.clearValue();
                            }).
                    sendKeys('foo', textField).
                    sendEvent(TP.hc('type', 'change'), textField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            textField.get('value'),
                            'It is: foo');
                    });

                //  ---

                textArea = TP.byOID('textarea');

                test.getDriver().startSequence().
                    exec(function() {
                                textArea.clearValue();
                            }).
                    sendKeys('bill', textArea).
                    sendEvent(TP.hc('type', 'change'), textArea).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            textArea.get('value'),
                            'Uppercased: BILL');
                    });

                //  ---

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

    this.it('get content - multiple formats - simple substitutions', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/formatting/Formatting7.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {
                var textField,
                    textArea;

                //  Change the content via 'user' interaction

                textField = TP.byOID('input_text');

                test.getDriver().startSequence().
                    exec(function() {
                                textField.clearValue();
                            }).
                    sendKeys('Bill', textField).
                    sendEvent(TP.hc('type', 'change'), textField).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            textField.get('value'),
                            'bill');
                    });

                //  ---

                textArea = TP.byOID('textarea');

                test.getDriver().startSequence().
                    exec(function() {
                                textArea.clearValue();
                            }).
                    sendKeys('foo,bar,baz', textArea).
                    sendEvent(TP.hc('type', 'change'), textArea).
                    perform();

                test.then(
                    function() {
                        test.assert.isEqualTo(
                            textArea.get('value'),
                            '&lt;html:li&gt;foo&lt;/html:li&gt;&lt;html:li&gt;bar&lt;/html:li&gt;&lt;html:li&gt;baz&lt;/html:li&gt;');
                    });

                //  ---

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
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.ElementNode.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
