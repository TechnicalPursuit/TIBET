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
//  html:
//  ========================================================================

TP.html.XMLNS.Type.describe('html: set content of standard elements',
function() {

    var loadURI,
        unloadURI,

        testData,

        windowContext;

    loadURI = TP.uc('~lib_test/src/html/HTMLContent.xhtml');

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            windowContext = this.getDriver().get('windowContext');

            this.getDriver().setLocation(loadURI);
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

    this.it('inline element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('span', windowContext);

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '');

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '');

        //  String
        tpElem.set('content', testData.at('String'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, testData.at('String'));

        tpElem.get('nativeNode').innerHTML = '';

        //  Number
        tpElem.set('content', testData.at('Number'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asNumber(), testData.at('Number'));

        tpElem.get('nativeNode').innerHTML = '';

        //  Boolean
        tpElem.set('content', testData.at('Boolean'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asBoolean(), testData.at('Boolean'));

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('inline element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('span', windowContext);

        //  RegExp
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('RegExp')));

        //  Date
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Date')));

        //  Array
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Array')));

        //  Object
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Object')));

        //  TP.core.Hash
        tpElem.set('content', testData.at('TP.core.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.core.Hash')));
    });

    //  ---

    this.it('inline element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('span', windowContext);

        tpElem.set('content', '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('block element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('div', windowContext);

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '');

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '');

        //  String
        tpElem.set('content', testData.at('String'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, testData.at('String'));

        tpElem.get('nativeNode').innerHTML = '';

        //  Number
        tpElem.set('content', testData.at('Number'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asNumber(), testData.at('Number'));

        tpElem.get('nativeNode').innerHTML = '';

        //  Boolean
        tpElem.set('content', testData.at('Boolean'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asBoolean(), testData.at('Boolean'));

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('block element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('div', windowContext);

        //  RegExp
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('RegExp')));

        //  Date
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Date')));

        //  Array
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Array')));

        //  Object
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Object')));

        //  TP.core.Hash
        tpElem.set('content', testData.at('TP.core.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.core.Hash')));
    });

    //  ---

    this.it('block element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('div', windowContext);

        tpElem.set('content', '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('input type="text" element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_text', windowContext);

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  String (won't alter content)
        tpElem.set('content', testData.at('String'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Number (won't alter content)
        tpElem.set('content', testData.at('Number'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Boolean (won't alter content)
        tpElem.set('content', testData.at('Boolean'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="text" element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_text', windowContext);

        //  RegExp (won't alter content)
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Date (won't alter content)
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Array (won't alter content)
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Object (won't alter content)
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  TP.core.Hash (won't alter content)
        tpElem.set('content', testData.at('TP.core.Hash'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="text" element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_text', windowContext);

        //  Markup String (won't alter content)
        tpElem.set('content', '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('textarea element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('textarea', windowContext);

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '');

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '');

        //  String
        tpElem.set('content', testData.at('String'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, testData.at('String'));

        tpElem.get('nativeNode').innerHTML = '';

        //  Number
        tpElem.set('content', testData.at('Number'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asNumber(), testData.at('Number'));

        tpElem.get('nativeNode').innerHTML = '';

        //  Boolean
        tpElem.set('content', testData.at('Boolean'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asBoolean(), testData.at('Boolean'));

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('textarea element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('textarea', windowContext);

        //  RegExp
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('RegExp')));

        //  Date
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Date')));

        //  Array
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Array')));

        //  Object
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Object')));

        //  TP.core.Hash
        tpElem.set('content', testData.at('TP.core.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.core.Hash')));
    });

    //  ---

    this.it('textarea element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('textarea', windowContext);

        tpElem.set('content', '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('select element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('select_single', windowContext);

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        content = content.trim().strip(TP.regex.XMLNS_STRIP);
        test.assert.isEqualTo(content, '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>');

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        content = content.trim().strip(TP.regex.XMLNS_STRIP);
        test.assert.isEqualTo(content, '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>');

        //  String
        tpElem.set('content', 'Hi');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, 'Hi');
        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';

        //  Number
        tpElem.set('content', 42);
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asNumber(), 42);
        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';

        //  Boolean
        tpElem.set('content', true);
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asBoolean(), true);
        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';
    });

    //  ---

    this.it('select element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('select_single', windowContext);

        //  RegExp
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('RegExp')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';

        //  Date
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Date')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';

        //  Array
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Array')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';

        //  Object
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Object')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';

        //  TP.core.Hash
        tpElem.set('content', testData.at('TP.core.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.core.Hash')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';
    });

    //  ---

    this.it('select element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('select_single', windowContext);

        tpElem.set('content', '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '<option id="select_single_1" value="foo">Dog</option><option id="select_single_2" value="bar">Cat</option><option id="select_single_3" value="baz">Fish</option>';
    });

    //  ---

    this.it('select (multiple) element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('select_multiple', windowContext);

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        content = content.trim().strip(TP.regex.XMLNS_STRIP);
        test.assert.isEqualTo(content, '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>');

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        content = content.trim().strip(TP.regex.XMLNS_STRIP);
        test.assert.isEqualTo(content, '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>');

        //  String
        tpElem.set('content', 'Hi');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, 'Hi');
        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';

        //  Number
        tpElem.set('content', 42);
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asNumber(), 42);
        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';

        //  Boolean
        tpElem.set('content', true);
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asBoolean(), true);
        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';
    });

    //  ---

    this.it('select (multiple) element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('select_multiple', windowContext);

        //  RegExp
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('RegExp')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';

        //  Date
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Date')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';

        //  Array
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Array')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';

        //  Object
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Object')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';

        //  TP.core.Hash
        tpElem.set('content', testData.at('TP.core.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.core.Hash')));
        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';
    });

    //  ---

    this.it('select (multiple) element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('select_multiple', windowContext);

        tpElem.set('content', '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '<option id="select_multiple_1" value="foo">Red</option><option id="select_multiple_2" value="bar">Blue</option><option id="select_multiple_3" value="baz">Yellow</option>';
    });

    //  ---

    this.it('input type="radio" element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_radio_3', windowContext);

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  String (won't alter content)
        tpElem.set('content', testData.at('String'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Number (won't alter content)
        tpElem.set('content', testData.at('Number'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Boolean (won't alter content)
        tpElem.set('content', testData.at('Boolean'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="radio" element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_radio_3', windowContext);

        //  RegExp (won't alter content)
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Date (won't alter content)
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Array (won't alter content)
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Object (won't alter content)
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  TP.core.Hash (won't alter content)
        tpElem.set('content', testData.at('TP.core.Hash'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="radio" element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_radio_3', windowContext);

        //  Markup String (won't alter content)
        tpElem.set('content', '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="checkbox" element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_checkbox_3', windowContext);

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  String (won't alter content)
        tpElem.set('content', testData.at('String'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Number (won't alter content)
        tpElem.set('content', testData.at('Number'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Boolean (won't alter content)
        tpElem.set('content', testData.at('Boolean'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="checkbox" element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_checkbox_3', windowContext);

        //  RegExp (won't alter content)
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Date (won't alter content)
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Array (won't alter content)
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  Object (won't alter content)
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isNull(content);

        //  TP.core.Hash (won't alter content)
        tpElem.set('content', testData.at('TP.core.Hash'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="checkbox" element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byId('input_checkbox_3', windowContext);

        //  Markup String (won't alter content)
        tpElem.set('content', '<h6 xmlns="http://www.w3.org/1999/xhtml">Hi</h6>');
        content = tpElem.get('content');
        test.assert.isNull(content);
    });
});

//  ------------------------------------------------------------------------

TP.html.XMLNS.Type.describe('html: set value of standard elements',
function() {

    var testData,

        windowContext;

    this.before(
        function() {
            var testDataLoc,
                loadURI;

            TP.$$setupCommonObjectValues();
            testData = TP.$$commonObjectValues;

            testDataLoc = '~lib_test/src/html/HTMLContent.xhtml';
            loadURI = TP.uc(testDataLoc);

            windowContext = this.getDriver().get('windowContext');

            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.it('inline element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('span', windowContext);

        //  undefined (won't alter value)
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '');

        //  null (won't alter value)
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '');

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, testData.at('String'));

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value.asNumber(), testData.at('Number'));

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value.asBoolean(), testData.at('Boolean'));
    });

    //  ---

    this.it('inline element - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('span', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('RegExp')));

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Date')));

        //  Array
        tpElem.set('value', testData.at('Array'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Array')));

        //  Object
        tpElem.set('value', testData.at('Object'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Object')));

        //  TP.core.Hash
        tpElem.set('value', testData.at('TP.core.Hash'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('TP.core.Hash')));
    });

    //  ---

    this.it('inline element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('span', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        value = value.
                    strip(/ xml:base=".+?"/g).
                    strip(/ xmlns:xml=".+?"/g).
                    strip(/ xmlns:tibet=".+?"/g).
                    strip(/ tibet:globaldocid=".+?"/g).
                    strip(/ tibet:nocompile="true"/g);

        test.assert.isEqualTo(
            value, '<foo bar="baz">Hi there<boo><goo/></boo><moo/></foo>');

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        value = value.
                    strip(/ xmlns:tibet=".+?"/g).
                    strip(/ tibet:nocompile="true"/g);

        test.assert.matches(value, /<foo id=".+">bar<\/foo>/);

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo="bar"');

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '<![CDATA[foo]]>');

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '<?foo bar?>');

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '<!--foo-->');

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        value = value.
                    strip(/ xmlns:tibet=".+?"/g).
                    strip(/ tibet:nocompile="true"/g);

        test.assert.isEqualTo(value, '<foo/><bar/>');

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'Hi there<boo><goo/></boo><moo/>');

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.matches(value, /bar: baz/);
    });

    //  ---

    this.it('block element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('div', windowContext);

        //  undefined (won't alter value)
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '');

        //  null (won't alter value)
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '');

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, testData.at('String'));

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value.asNumber(), testData.at('Number'));

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value.asBoolean(), testData.at('Boolean'));
    });

    //  ---

    this.it('block element - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('div', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('RegExp')));

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Date')));

        //  Array
        tpElem.set('value', testData.at('Array'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Array')));

        //  Object
        tpElem.set('value', testData.at('Object'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Object')));

        //  TP.core.Hash
        tpElem.set('value', testData.at('TP.core.Hash'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('TP.core.Hash')));
    });

    //  ---

    this.it('block element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('div', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        value = value.
                    strip(/ xml:base=".+?"/g).
                    strip(/ xmlns:xml=".+?"/g).
                    strip(/ xmlns:tibet=".+?"/g).
                    strip(/ tibet:globaldocid=".+?"/g).
                    strip(/ tibet:nocompile="true"/g);

        test.assert.isEqualTo(
            value, '<foo bar="baz">Hi there<boo><goo/></boo><moo/></foo>');

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        value = value.
                    strip(/ xmlns:tibet=".+?"/g).
                    strip(/ tibet:nocompile="true"/g);

        test.assert.matches(value, /<foo id=".+">bar<\/foo>/);

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo="bar"');

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '<![CDATA[foo]]>');

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '<?foo bar?>');

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '<!--foo-->');

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        value = value.
                    strip(/ xmlns:tibet=".+?"/g).
                    strip(/ tibet:nocompile="true"/g);

        test.assert.isEqualTo(value, '<foo/><bar/>');

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'Hi there<boo><goo/></boo><moo/>');

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.matches(value, /bar: baz/);
    });

    //  ---

    this.it('input type="text" element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('input_text', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(''));

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(''));

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Number')));

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Boolean')));
    });

    //  ---

    this.it('input type="text" element - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('input_text', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('RegExp')));

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Date')));

        //  Array
        tpElem.set('value', testData.at('Array'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, '1');

        //  Object
        tpElem.set('value', testData.at('Object'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');

        //  TP.core.Hash
        tpElem.set('value', testData.at('TP.core.Hash'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('input type="text" element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('input_text', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'Hi there<boo><goo/></boo><moo/>');

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        value = value.
                    strip(/ xmlns:tibet=".+?"/g).
                    strip(/ tibet:nocompile="true"/g);
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, '<foo/><bar/>');

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'Hi there');

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'baz');
    });

    //  ---

    this.it('textarea element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('textarea', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(''));

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(''));

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Number')));

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Boolean')));
    });

    //  ---

    this.it('textarea element - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('textarea', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('RegExp')));

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('Date')));

        //  Array
        tpElem.set('value', testData.at('Array'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, '1');

        //  Object
        tpElem.set('value', testData.at('Object'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');

        //  TP.core.Hash
        tpElem.set('value', testData.at('TP.core.Hash'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('textarea element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('textarea', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'Hi there<boo><goo/></boo><moo/>');

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        value = value.
                    strip(/ xmlns:tibet=".+?"/g).
                    strip(/ tibet:nocompile="true"/g);
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, '<foo/><bar/>');

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'Hi there');

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'baz');
    });

    //  ---

    this.it('select element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('select_single', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isNull(value);
    });

    //  ---

    this.it('select element - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('select_single', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Array
        tpElem.set('value', TP.ac('foo', 'bar', 'baz'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  Object
        tpElem.set('value', {foo: 'baz'});
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('select element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('select_single', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'baz');
    });

    //  ---

    this.it('select (multiple) element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('select_multiple', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  String (multiple)
        tpElem.set('value', 'foo;baz');
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo', 'baz'));

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);
    });

    //  ---

    this.it('select (multiple) element - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('select_multiple', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Array
        tpElem.set('value', TP.ac('foo', 'bar', 'baz'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo', 'bar', 'baz'));

        //  Object
        tpElem.set('value', {foo: 'baz'});
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('baz'));

        //  TP.core.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));
    });

    //  ---

    this.it('select (multiple) element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('select_multiple', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('baz'));
    });

    //  ---

    this.it('input type="radio" element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('input_radio_3', windowContext);

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('String')));

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isNull(value);
    });

    //  ---

    this.it('input type="radio" element - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('input_radio_3', windowContext);

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Array
        tpElem.set('value', TP.ac('foo', 'bar', 'baz'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  Object
        tpElem.set('value', {foo: 'baz'});
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.core.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('input type="radio" element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('input_radio_3', windowContext);

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'baz');
    });

    //  ---

    this.it('input type="checkbox" element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('input_checkbox_3', windowContext);
        tpElem.deselectAll();

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  String
        tpElem.set('value', testData.at('String'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  reset
        tpElem.deselectAll();

        //  String (multiple)
        tpElem.set('value', 'foo;baz');
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo', 'baz'));

        //  reset
        tpElem.deselectAll();

        //  Number
        tpElem.set('value', testData.at('Number'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Boolean
        tpElem.set('value', testData.at('Boolean'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);
    });

    //  ---

    this.it('input type="checkbox" element - setting value to complex object values', function(test, options) {

        var tpElem,
            value;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('input_checkbox_3', windowContext);
        tpElem.deselectAll();

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Array
        tpElem.set('value', TP.ac('foo', 'bar', 'baz'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo', 'bar', 'baz'));

        //  reset
        tpElem.deselectAll();

        //  Object
        tpElem.set('value', {foo: 'baz'});
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('baz'));

        //  reset
        tpElem.deselectAll();

        //  TP.core.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));
    });

    //  ---

    this.it('input type="checkbox" element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byId('input_checkbox_3', windowContext);
        tpElem.deselectAll();

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  reset
        tpElem.deselectAll();

        //  AttributeNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('AttributeNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  reset
        tpElem.deselectAll();

        //  TextNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('TextNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  reset
        tpElem.deselectAll();

        //  CDATASectionNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CDATASectionNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  reset
        tpElem.deselectAll();

        //  PINode
        tpElem.set('value', TP.nodeCloneNode(testData.at('PINode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));

        //  reset
        tpElem.deselectAll();

        //  CommentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('CommentNode')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo'));

        //  reset
        tpElem.deselectAll();

        //  DocumentFragmentNode
        tpElem.set('value', TP.nodeCloneNode(testData.at('DocumentFragmentNode')));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  NodeList
        tpElem.set('value', testData.at('NodeList'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  NamedNodeMap
        tpElem.set('value', testData.at('NamedNodeMap'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('baz'));
    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.html.XMLNS.Type.describe('html: selection management of standard elements',
function() {

    var windowContext;

    this.before(function() {
        var testDataLoc,
            loadURI;

        TP.$$setupCommonObjectValues();

        testDataLoc = '~lib_test/src/html/HTMLContent.xhtml';
        loadURI = TP.uc(testDataLoc);

        windowContext = this.getDriver().get('windowContext');

        this.getDriver().setLocation(loadURI);
    });

    //  ---

    this.it('select element - selection management', function(test, options) {

        var tpElem;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('select_single', windowContext);

        //  ---

        //  allowsMultiples

        //  by default, select elements don't allow multiples
        test.assert.isFalse(tpElem.allowsMultiples());

        //  ---

        //  addSelection

        //  (property defaults to 'value')
        tpElem.addSelection('baz');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 2);

        //  'value' property
        tpElem.addSelection('bar', 'value');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 1);

        //  'label' property
        tpElem.addSelection('Dog', 'label');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 0);

        //  'id' property
        tpElem.addSelection('select_single_3', 'id');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 2);

        //  'index' property
        tpElem.addSelection(1, 'index');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 1);

        //  ---

        //  removeSelection

        //  (property defaults to 'value')
        tpElem.getNativeNode().selectedIndex = 1;
        tpElem.removeSelection('baz');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 1);

        tpElem.getNativeNode().selectedIndex = 2;
        tpElem.removeSelection('baz');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, -1);

        //  'value' property
        tpElem.getNativeNode().selectedIndex = 2;
        tpElem.removeSelection('bar', 'value');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 2);

        tpElem.getNativeNode().selectedIndex = 1;
        tpElem.removeSelection('bar', 'value');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, -1);

        //  'label' property
        tpElem.getNativeNode().selectedIndex = 1;
        tpElem.removeSelection('Dog', 'label');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 1);

        tpElem.getNativeNode().selectedIndex = 0;
        tpElem.removeSelection('Dog', 'label');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, -1);

        //  'id' property
        tpElem.getNativeNode().selectedIndex = 1;
        tpElem.removeSelection('select_single_3', 'id');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 1);

        tpElem.getNativeNode().selectedIndex = 2;
        tpElem.removeSelection('select_single_3', 'id');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, -1);

        //  'index' property
        tpElem.getNativeNode().selectedIndex = 2;
        tpElem.removeSelection(1, 'index');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, 2);

        tpElem.getNativeNode().selectedIndex = 1;
        tpElem.removeSelection(1, 'index');
        test.assert.isEqualTo(tpElem.getNativeNode().selectedIndex, -1);
    });

    //  ---

    this.it('select (multiple) element - selection management', function(test, options) {

        var tpElem,
            getSelectedIndices;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('select_multiple', windowContext);

        getSelectedIndices = function(aTPElem) {
            var natElem,

                selectedOptions,
                i,
                indices;

            natElem = TP.unwrap(aTPElem);

            //  Newer browsers have this property, but PhantomJS doesn't...
            if (natElem.selectedOptions) {
                selectedOptions = natElem.selectedOptions;
            } else {
                selectedOptions = aTPElem.getValueElements().collect(
                                        function(valueTPElem) {
                                            var valueElem;

                                            valueElem = TP.unwrap(valueTPElem);
                                            if (valueElem.selected) {
                                                return valueElem;
                                            }
                                        });

                //  Removes nulls and undefineds
                selectedOptions.compact();
            }

            indices = TP.ac();
            for (i = 0; i < selectedOptions.length; i++) {
                indices.push(selectedOptions[i].index);
            }

            return indices;
        };

        //  ---

        //  allowsMultiples

        //  when configured with 'multiple="multiple"', select elements allow
        //  multiples
        test.assert.isTrue(tpElem.allowsMultiples());

        //  ---

        //  addSelection (and deselectAll)

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        //  'value' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'bar'), 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        //  'label' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('Red', 'Yellow'), 'label');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        //  'id' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('select_multiple_1', 'select_multiple_2'), 'id');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        //  'index' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac(1, 2), 'index');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        //  ---

        //  removeSelection (and deselectAll)

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'bar'));
        tpElem.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        tpElem.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));

        //  'value' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'baz'));
        tpElem.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        tpElem.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(2));

        //  'label' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('Red', 'Yellow'), 'label');
        tpElem.removeSelection('Blue', 'label');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('Red', 'Blue'), 'label');
        tpElem.removeSelection('Blue', 'label');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));

        //  'id' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('select_multiple_1', 'select_multiple_2'), 'id');
        tpElem.removeSelection('select_multiple_3', 'id');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('select_multiple_1', 'select_multiple_3'), 'id');
        tpElem.removeSelection('select_multiple_3', 'id');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));

        //  'index' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac(1, 2), 'index');
        tpElem.removeSelection(0, 'index');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac(0, 1), 'index');
        tpElem.removeSelection(0, 'index');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));

        //  ---

        //  selectAll

        tpElem.selectAll();
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1, 2));

        //  ---

        //  select (and deselectAll)

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.select('bar');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));
        tpElem.select('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        tpElem.deselectAll();
        tpElem.select(TP.ac('foo', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        //  ---

        //  select (with RegExp)

        tpElem.deselectAll();
        tpElem.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        //  ---

        //  deselect (and selectAll)

        //  (property defaults to 'value')
        tpElem.selectAll();
        tpElem.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));
        tpElem.deselect('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));

        tpElem.selectAll();
        tpElem.deselect(TP.ac('foo', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));

        //  ---

        //  deselect (with RegExp)

        tpElem.selectAll();
        tpElem.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));
    });

    //  ---

    this.it('input type="radio" element - selection management', function(test, options) {

        var tpElem;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('input_radio_3', windowContext);

        //  ---

        //  allowsMultiples

        //  radio button elements don't allow multiples
        test.assert.isFalse(tpElem.allowsMultiples());

        //  ---

        //  addSelection

        //  (property defaults to 'value')
        tpElem.addSelection('baz');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_3', windowContext).isSelected());

        //  'value' property
        tpElem.addSelection('bar', 'value');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        //  'label' property
        tpElem.addSelection('Dog', 'label');
        test.assert.isTrue(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        //  'id' property
        tpElem.addSelection('input_radio_3', 'id');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_3', windowContext).isSelected());

        //  'index' property
        tpElem.addSelection(1, 'index');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        //  ---

        tpElem.addSelection('bar');

        //  removeSelection

        //  (property defaults to 'value')
        TP.byId('input_radio_2', windowContext, false).checked = true;
        tpElem.removeSelection('baz');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        TP.byId('input_radio_3', windowContext, false).checked = true;
        tpElem.removeSelection('baz');
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        //  'value' property
        TP.byId('input_radio_3', windowContext, false).checked = true;
        tpElem.removeSelection('bar', 'value');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_3', windowContext).isSelected());

        TP.byId('input_radio_2', windowContext, false).checked = true;
        tpElem.removeSelection('bar', 'value');
        test.assert.isFalse(TP.byId('input_radio_2', windowContext).isSelected());

        //  'label' property
        TP.byId('input_radio_2', windowContext, false).checked = true;
        tpElem.removeSelection('Dog', 'label');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        TP.byId('input_radio_1', windowContext, false).checked = true;
        tpElem.removeSelection('Dog', 'label');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());

        //  'id' property
        TP.byId('input_radio_2', windowContext, false).checked = true;
        tpElem.removeSelection('input_radio_3', 'id');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        TP.byId('input_radio_3', windowContext, false).checked = true;
        tpElem.removeSelection('input_radio_3', 'id');
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        //  'index' property
        TP.byId('input_radio_3', windowContext, false).checked = true;
        tpElem.removeSelection(1, 'index');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_3', windowContext).isSelected());

        TP.byId('input_radio_2', windowContext, false).checked = true;
        tpElem.removeSelection(1, 'index');
        test.assert.isFalse(TP.byId('input_radio_2', windowContext).isSelected());

        //  ---

        //  select

        //  (property defaults to 'value')
        tpElem.select('bar');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_3', windowContext).isSelected());

        tpElem.select('baz');
        test.assert.isFalse(TP.byId('input_radio_1', windowContext).isSelected());
        test.assert.isFalse(TP.byId('input_radio_2', windowContext).isSelected());
        test.assert.isTrue(TP.byId('input_radio_3', windowContext).isSelected());
    }).skip(TP.sys.cfg('boot.context') === 'phantomjs');

    //  ---

    this.it('input type="checkbox" element - selection management', function(test, options) {

        var tpElem,
            getSelectedIndices;

        //  Per the markup, valid values for this control are 'foo', 'bar', and
        //  'baz'.

        tpElem = TP.byId('input_checkbox_3', windowContext);

        getSelectedIndices = function(aTPElem) {
            var checkboxIndices;

            checkboxIndices = aTPElem.getValueElements().collect(
                                        function(valueTPElem, anIndex) {
                                            var valueElem;

                                            valueElem = TP.unwrap(valueTPElem);
                                            if (valueElem.checked) {
                                                return anIndex;
                                            }
                                        });

            //  Removes nulls and undefineds
            return checkboxIndices.compact();
        };

        //  ---

        //  allowsMultiples

        //  checkbox elements allow multiples
        test.assert.isTrue(tpElem.allowsMultiples());

        //  ---

        //  addSelection (and deselectAll)

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        //  'value' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'bar'), 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        //  'label' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('Red', 'Yellow'), 'label');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        //  'id' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('input_checkbox_1', 'input_checkbox_2'), 'id');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        //  'index' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac(1, 2), 'index');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        //  ---

        //  removeSelection (and deselectAll)

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'bar'));
        tpElem.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        tpElem.removeSelection('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));

        //  'value' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('foo', 'baz'));
        tpElem.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('bar', 'baz'));
        tpElem.removeSelection('bar', 'value');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(2));

        //  'label' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('Red', 'Yellow'), 'label');
        tpElem.removeSelection('Blue', 'label');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('Red', 'Blue'), 'label');
        tpElem.removeSelection('Blue', 'label');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));

        //  'id' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('input_checkbox_1', 'input_checkbox_2'), 'id');
        tpElem.removeSelection('input_checkbox_3', 'id');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac('input_checkbox_1', 'input_checkbox_3'), 'id');
        tpElem.removeSelection('input_checkbox_3', 'id');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));

        //  'index' property
        tpElem.deselectAll();
        tpElem.addSelection(TP.ac(1, 2), 'index');
        tpElem.removeSelection(0, 'index');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        tpElem.deselectAll();
        tpElem.addSelection(TP.ac(0, 1), 'index');
        tpElem.removeSelection(0, 'index');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));

        //  ---

        //  selectAll

        tpElem.selectAll();
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 1, 2));

        //  ---

        //  select (and deselectAll)

        //  (property defaults to 'value')
        tpElem.deselectAll();
        tpElem.select('bar');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));
        tpElem.select('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        tpElem.deselectAll();
        tpElem.select(TP.ac('foo', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));

        //  ---

        //  select (with RegExp)

        tpElem.deselectAll();
        tpElem.select(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1, 2));

        //  ---

        //  deselect (and selectAll)

        //  (property defaults to 'value')
        tpElem.selectAll();
        tpElem.deselect('bar');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0, 2));
        tpElem.deselect('baz');
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));

        tpElem.selectAll();
        tpElem.deselect(TP.ac('foo', 'baz'));
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(1));

        //  ---

        //  deselect (with RegExp)

        tpElem.selectAll();
        tpElem.deselect(/ba/);
        test.assert.isEqualTo(getSelectedIndices(tpElem), TP.ac(0));
    }).skip(TP.sys.cfg('boot.context') === 'phantomjs');
});

//  ------------------------------------------------------------------------

TP.html.XMLNS.Type.describe('html: data binding of standard elements',
function() {

    var loadURI,
        unloadURI,

        windowContext;

    loadURI = TP.uc('~lib_test/src/html/HTMLContent.xhtml');

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            windowContext = this.getDriver().get('windowContext');

            this.getDriver().setLocation(loadURI);
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

    this.it('data binding to scalar values', function(test, options) {

        var modelObj,
            tpElem;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('salary');

        tpElem = TP.byId('span', windowContext);

        tpElem.defineBinding('value', modelObj, 'salary');

        //  Set the value of 'salary' on the model object. The binding should
        //  cause the value of 'salary' on the observer to update
        modelObj.set('salary', 42000);

        test.assert.isEqualTo(
                    modelObj.get('salary'),
                    tpElem.get('value').asNumber());

        //  Destroy the binding
        tpElem.destroyBinding('value', modelObj, 'salary');

        modelObj.set('salary', 45000);

        //  Because there is now no binding between these two, tpElem should
        //  still have the value of 42000 set above.
        test.refute.isEqualTo(
                    modelObj.get('salary'),
                    tpElem.get('value').asNumber());
    });

    //  ---

    this.it('data binding to complex object values', function(test, options) {
        //  empty
    }).todo();

    //  ---

    this.it('data binding "value" to path scalar values', function(test, options) {

        var modelObj,

            tpElem,
            path;

        modelObj = TP.json2js('{"record":{"salary":"10"}}');

        tpElem = TP.byId('span', windowContext);
        path = TP.apc('record.salary');

        tpElem.defineBinding('value', modelObj, path);

        modelObj.set(path, 42000);

        tpElem.getValue();

        test.assert.isEqualTo(
                    modelObj.get(path),
                    tpElem.get('value').asNumber());

        //  Destroy the binding
        tpElem.destroyBinding('value', modelObj, path);

        modelObj.set(path, 45000);

        //  Because there is now no binding between these two, tpElem should
        //  still have the value of 42000 set above.
        test.refute.isEqualTo(
                    modelObj.get(path),
                    tpElem.get('value').asNumber());
    });

    //  ---

    this.it('data binding "value" to path complex values', function(test, options) {
        //  empty
    }).todo();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
