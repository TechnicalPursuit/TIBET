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

TP.core.ElementNode.Inst.describe('TP.core.ElementNode: formatting values',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

    //  ---

    this.before(
        function() {

            //  ---

            if (!TP.isType(TP.sys.getTypeByName('TP.test.PetConverter'))) {

                TP.lang.Object.defineSubtype('TP.test.PetConverter');
                TP.test.PetConverter.Type.defineMethod(
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

            if (!TP.isType(TP.sys.getTypeByName('TP.test.ColorConverter'))) {

                TP.lang.Object.defineSubtype('TP.test.ColorConverter');
                TP.test.ColorConverter.Type.defineMethod(
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
