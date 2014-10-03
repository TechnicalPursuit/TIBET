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

    var testData;

    this.before(function() {
        var testDataLoc,
            loadURI;

        TP.$$setupCommonObjectValues();
        testData = TP.$$commonObjectValues;

        testDataLoc = '~lib_tst/src/html/HTMLContent.xhtml';
        loadURI = TP.uc(testDataLoc);

        this.getDriver().setLocation(loadURI);
    });

    //  ---

    this.it('inline element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('span');

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

        tpElem = TP.byOID('span');

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

        //  TP.lang.Hash
        tpElem.set('content', testData.at('TP.lang.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.lang.Hash')));
    });

    //  ---

    this.it('inline element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('span');

        tpElem.set('content', '<h6>Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6>Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('block element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('div');

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

        tpElem = TP.byOID('div');

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

        //  TP.lang.Hash
        tpElem.set('content', testData.at('TP.lang.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.lang.Hash')));
    });

    //  ---

    this.it('block element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('div');

        tpElem.set('content', '<h6>Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6>Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('input type="text" element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('input_text');

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

        tpElem = TP.byOID('input_text');

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

        //  TP.lang.Hash (won't alter content)
        tpElem.set('content', testData.at('TP.lang.Hash'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="text" element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('input_text');

        //  Markup String (won't alter content)
        tpElem.set('content', '<h6>Hi</h6>');
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('textarea element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('textarea');

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

        tpElem = TP.byOID('textarea');

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

        //  TP.lang.Hash
        tpElem.set('content', testData.at('TP.lang.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.lang.Hash')));
    });

    //  ---

    this.it('textarea element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('textarea');

        tpElem.set('content', '<h6>Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6>Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '';
    });

    //  ---

    this.it('select element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('select_single');

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        content = content.trim().strip(TP.regex.XMLNS_STRIP);
        test.assert.isEqualTo(content, '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>');

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        content = content.trim().strip(TP.regex.XMLNS_STRIP);
        test.assert.isEqualTo(content, '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>');

        //  String
        tpElem.set('content', 'Hi');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, 'Hi');
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';

        //  Number
        tpElem.set('content', 42);
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asNumber(), 42);
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';

        //  Boolean
        tpElem.set('content', true);
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asBoolean(), true);
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';
    });

    //  ---

    this.it('select element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('select_single');

        //  RegExp
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('RegExp')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';

        //  Date
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Date')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';

        //  Array
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Array')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';

        //  Object
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Object')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';

        //  TP.lang.Hash
        tpElem.set('content', testData.at('TP.lang.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.lang.Hash')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';
    });

    //  ---

    this.it('select element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('select_single');

        tpElem.set('content', '<h6>Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6>Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '<option value="foo">Dog</option><option value="bar">Cat</option><option value="baz">Fish</option>';
    });

    //  ---

    this.it('select (multiple) element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('select_multiple');

        //  undefined (won't alter content)
        tpElem.set('content', testData.at(TP.UNDEF));
        content = tpElem.get('content');
        content = content.trim().strip(TP.regex.XMLNS_STRIP);
        test.assert.isEqualTo(content, '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>');

        //  null (won't alter content)
        tpElem.set('content', testData.at(TP.NULL));
        content = tpElem.get('content');
        content = content.trim().strip(TP.regex.XMLNS_STRIP);
        test.assert.isEqualTo(content, '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>');

        //  String
        tpElem.set('content', 'Hi');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, 'Hi');
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';

        //  Number
        tpElem.set('content', 42);
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asNumber(), 42);
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';

        //  Boolean
        tpElem.set('content', true);
        content = tpElem.get('content');
        test.assert.isEqualTo(content.asBoolean(), true);
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';
    });

    //  ---

    this.it('select (multiple) element - setting content to complex object values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('select_multiple');

        //  RegExp
        tpElem.set('content', testData.at('RegExp'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('RegExp')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';

        //  Date
        tpElem.set('content', testData.at('Date'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Date')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';

        //  Array
        tpElem.set('content', testData.at('Array'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Array')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';

        //  Object
        tpElem.set('content', testData.at('Object'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('Object')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';

        //  TP.lang.Hash
        tpElem.set('content', testData.at('TP.lang.Hash'));
        content = tpElem.get('content');
        test.assert.isEqualTo(content, TP.str(testData.at('TP.lang.Hash')));
        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';
    });

    //  ---

    this.it('select (multiple) element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('select_multiple');

        tpElem.set('content', '<h6>Hi</h6>');
        content = tpElem.get('content');
        test.assert.isEqualTo(content, '<h6>Hi</h6>');

        tpElem.get('nativeNode').innerHTML = '<option value="foo">Red</option><option value="bar">Blue</option><option value="baz">Yellow</option>';
    });

    //  ---

    this.it('input type="radio" element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('input_radio_3');

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

        tpElem = TP.byOID('input_radio_3');

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

        //  TP.lang.Hash (won't alter content)
        tpElem.set('content', testData.at('TP.lang.Hash'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="radio" element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('input_radio_3');

        //  Markup String (won't alter content)
        tpElem.set('content', '<h6>Hi</h6>');
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="checkbox" element - setting content to scalar values', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('input_checkbox_3');

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

        tpElem = TP.byOID('input_checkbox_3');

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

        //  TP.lang.Hash (won't alter content)
        tpElem.set('content', testData.at('TP.lang.Hash'));
        content = tpElem.get('content');
        test.assert.isNull(content);
    });

    //  ---

    this.it('input type="checkbox" element - setting content to markup String', function(test, options) {

        var tpElem,
            content;

        tpElem = TP.byOID('input_checkbox_3');

        //  Markup String (won't alter content)
        tpElem.set('content', '<h6>Hi</h6>');
        content = tpElem.get('content');
        test.assert.isNull(content);
    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.html.XMLNS.Type.describe('html: set value of standard elements',
function() {

    var testData;

    this.before(function() {
        //var testDataLoc,
        //    loadURI;

        TP.$$setupCommonObjectValues();
        testData = TP.$$commonObjectValues;

        //testDataLoc = '~lib_tst/src/html/HTMLContent.xhtml';
        //loadURI = TP.uc(testDataLoc);

        //this.getDriver().setLocation(loadURI);
    });

    //  ---

    this.it('inline element - setting value to scalar values', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byOID('span');

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

        tpElem = TP.byOID('span');

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

        //  TP.lang.Hash
        tpElem.set('value', testData.at('TP.lang.Hash'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('TP.lang.Hash')));
    });

    //  ---

    this.it('inline element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byOID('span');

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isEqualTo(
            value.strip(/ xml:base=".+"/),
            '<foo bar="baz">Hi there<boo><goo/></boo><moo/></foo>');

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '<foo>bar</foo>');

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

        tpElem = TP.byOID('div');

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

        tpElem = TP.byOID('div');

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

        //  TP.lang.Hash
        tpElem.set('value', testData.at('TP.lang.Hash'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at('TP.lang.Hash')));
    });

    //  ---

    this.it('block element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byOID('div');

        //  XMLDocument
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLDocument')));
        value = tpElem.get('value');
        test.assert.isEqualTo(
            value.strip(/ xml:base=".+"/),
            '<foo bar="baz">Hi there<boo><goo/></boo><moo/></foo>');

        //  XMLElement
        tpElem.set('value', TP.nodeCloneNode(testData.at('XMLElement')));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, '<foo>bar</foo>');

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

        tpElem = TP.byOID('input_text');

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at(TP.UNDEF)));

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at(TP.NULL)));

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

        tpElem = TP.byOID('input_text');

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

        //  TP.lang.Hash
        tpElem.set('value', testData.at('TP.lang.Hash'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('input type="text" element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byOID('input_text');

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

        tpElem = TP.byOID('textarea');

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at(TP.UNDEF)));

        //  null
        tpElem.set('value', testData.at(TP.NULL));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.str(testData.at(TP.NULL)));

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

        tpElem = TP.byOID('textarea');

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

        //  TP.lang.Hash
        tpElem.set('value', testData.at('TP.lang.Hash'));
        value = tpElem.get('value');
        //  <input type="text"/> is both single-valued and scalar-valued
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('textarea element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byOID('textarea');

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

        tpElem = TP.byOID('select_single');

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

        tpElem = TP.byOID('select_single');

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isNull(value);

        //  Array
        tpElem.set('value', TP.ac('foo','bar','baz'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'foo');

        //  Object
        tpElem.set('value', {'foo':'baz'});
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'baz');

        //  TP.lang.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, 'bar');
    });

    //  ---

    this.it('select element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byOID('select_single');

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

        tpElem = TP.byOID('select_multiple');

        //  undefined
        tpElem.set('value', testData.at(TP.UNDEF));
        value = tpElem.get('value');
        console.log(tpElem.get('nativeNode').selectedIndex);
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
        tpElem.set('value', 'foo baz');
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

        tpElem = TP.byOID('select_multiple');

        //  RegExp
        tpElem.set('value', testData.at('RegExp'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Date
        tpElem.set('value', testData.at('Date'));
        value = tpElem.get('value');
        test.assert.isEmpty(value);

        //  Array
        tpElem.set('value', TP.ac('foo','bar','baz'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('foo', 'bar', 'baz'));

        //  Object
        tpElem.set('value', {'foo':'baz'});
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('baz'));

        //  TP.lang.Hash
        tpElem.set('value', TP.hc('foo', 'bar'));
        value = tpElem.get('value');
        test.assert.isEqualTo(value, TP.ac('bar'));
    });

    //  ---

    this.it('select (multiple) element - setting value to markup', function(test, options) {

        var tpElem,
            value;

        tpElem = TP.byOID('select_multiple');

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

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.html.XMLNS.Type.describe('html: data binding of standard elements',
function() {

    this.it('data binding to scalar values', function(test, options) {

        var modelObj,
            tpElem;

        modelObj = TP.lang.Object.construct();
        modelObj.defineAttribute('salary');

        tpElem = TP.byOID('span');

        tpElem.defineBinding('value', modelObj, 'salary');

        //  Set the value of 'salary' on the model object. The binding should
        //  cause the value of 'salary' on the observer to update
        modelObj.set('salary', 42000);

        this.assert.isEqualTo(
                    modelObj.get('salary'),
                    tpElem.get('value').asNumber());

        //  Destroy the binding
        tpElem.destroyBinding('value', modelObj, 'salary');

        modelObj.set('salary', 45000);

        //  Because there is now no binding between these two, tpElem should
        //  still have the value of 42000 set above.
        this.refute.isEqualTo(
                    modelObj.get('salary'),
                    tpElem.get('value').asNumber());
    });

    //  ---

    this.it('data binding to complex object values', function(test, options) {

    });

    //  ---

    this.it('data binding "value" to path scalar values', function(test, options) {

        var modelObj,

            tpElem,
            path;

        modelObj = TP.json2js('{"record":{"salary":"10"}}');

        tpElem = TP.byOID('span');
        path = TP.apc('record.salary');

        tpElem.defineBinding('value', modelObj, path);

        modelObj.set(path, 42000);

        tpElem.getValue();

        this.assert.isEqualTo(
                    modelObj.get(path),
                    tpElem.get('value').asNumber());

        //  Destroy the binding
        tpElem.destroyBinding('value', modelObj, path);

        modelObj.set(path, 45000);

        //  Because there is now no binding between these two, tpElem should
        //  still have the value of 42000 set above.
        this.refute.isEqualTo(
                    modelObj.get(path),
                    tpElem.get('value').asNumber());
    });

    //  ---

    this.it('data binding "value" to path complex values', function(test, options) {

    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.html.XMLNS.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
