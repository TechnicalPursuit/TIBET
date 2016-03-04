//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
 * Tests of the TP.$tokenize routine(s).
 */

//  ------------------------------------------------------------------------

TP.describe('$tokenize',
function() {

    this.it('Processes quotes correctly', function(test, options) {
        var str,
            arr;

        str = "Blah \"double quotes\" 'single quotes' `templates` and such";
        arr = TP.$tokenize(str);

        test.assert.isEqualTo(arr.length, 11);
        test.assert.isEqualTo(arr[0].value, 'Blah');
        test.assert.isEqualTo(arr[1].name, 'space');
        test.assert.isEqualTo(arr[2].name, 'string');
        test.assert.isEqualTo(arr[3].name, 'space');
        test.assert.isEqualTo(arr[4].name, 'string');
        test.assert.isEqualTo(arr[5].name, 'space');
        test.assert.isEqualTo(arr[6].name, 'es6template');
        test.assert.isEqualTo(arr[7].name, 'space');
        test.assert.isEqualTo(arr[8].value, 'and');
        test.assert.isEqualTo(arr[9].name, 'space');
        test.assert.isEqualTo(arr[10].value, 'such');

    });
});

//  ------------------------------------------------------------------------

TP.describe('$tokenizedSplit',
function() {

    this.it('Can split/rejoin via tokenizer', function(test, options) {
        var str,
            arr;

        str = "TP.core.Object APP.foo.bar 'A quoted string' 123.45";
        arr = TP.$tokenizedSplit(str);

        test.assert.isEqualTo(arr.length, 4);
        test.assert.isEqualTo(arr[0], 'TP.core.Object');
        test.assert.isEqualTo(arr[1], 'APP.foo.bar');
        test.assert.isEqualTo(arr[2], '\'A quoted string\'');
        test.assert.isEqualTo(arr[3], '123.45');
    });

    this.it('Respects nested handlebars/templating syntax', function(test, options) {
        var str,
            arr;

        str = "hi {{name}}";
        arr = TP.$tokenizedSplit(str);

        test.assert.isEqualTo(arr.length, 2);
        test.assert.isEqualTo(arr[1], '{{name}}');
    });

});

//  ------------------------------------------------------------------------

TP.describe('$tokenizedConstruct',
function(tokens) {

    this.it('Can build up empty arrays', function(test, options) {
        var str, obj;

        str = '[]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj.length, 0);

        str = '[ ]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj.length, 0);
    });

    this.it('Can build up simple arrays', function(test, options) {
        var str, obj;

        str = '[1,2,3]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj.length, 3);
        test.assert.isEqualTo(obj[2], 3);

        str = '[ 1, 2, 3 ]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj.length, 3);
        test.assert.isEqualTo(obj[2], 3);
    });

    this.it('Can build up nested arrays', function(test, options) {
        var str, obj;

        str = '[ 1, ["a", "b"], 3 ]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj.length, 3);
        test.assert.isEqualTo(obj[2], 3);
        test.assert.isArray(obj[1]);
        test.assert.isEqualTo(obj[1].length, 2);
        test.assert.isEqualTo(obj[1][0], 'a');
    });

    this.it('Can build up empty objects', function(test, options) {
        var str, obj;

        str = '{}';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(TP.keys(obj).length, 0);

        str = '{ }';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(TP.keys(obj).length, 0);
    });

    this.it('Can build up simple objects', function(test, options) {
        var str, obj;

        str = '{"a":1,"b":2,"c":3}';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(TP.keys(obj).length, 3);
        test.assert.isEqualTo(obj.a, 1);

        str = '{ "a": 1, "b": 2 , "c": 3 }';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(TP.keys(obj).length, 3);
        test.assert.isEqualTo(obj.a, 1);
    });

    this.it('Can build up nested objects', function(test, options) {
        var str, obj;

        str = '{ "a": 1, "b": { "d": 4, "e": 5 } , "c": 3 }';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(TP.keys(obj).length, 3);
        test.assert.isEqualTo(obj.a, 1);

        test.assert.isPlainObject(obj.b);
        test.assert.isEqualTo(TP.keys(obj.b).length, 2);
        test.assert.isEqualTo(obj.b.d, 4);
    });

    this.it('Can build up mixed arrays', function(test, options) {
        var str, obj;

        str = '[ 1, { "a": 1, "b": 2 } , 3 ]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj[0], 1);
        test.assert.isEqualTo(obj.length, 3);

        test.assert.isPlainObject(obj[1]);
        test.assert.isEqualTo(obj[1].b, 2);
        test.assert.isEqualTo(TP.keys(obj[1]).length, 2);
    });

    this.it('Can build up mixed objects', function(test, options) {
        var str, obj;

        str = '{ "a": 1, "b": [ 1, 2, 3 ], "c": 3 }';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(obj.a, 1);
        test.assert.isEqualTo(TP.keys(obj).length, 3);

        test.assert.isArray(obj.b);
        test.assert.isEqualTo(obj.b[1], 2);
        test.assert.isEqualTo(obj.b.length, 3);
    });

});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.Locale.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
