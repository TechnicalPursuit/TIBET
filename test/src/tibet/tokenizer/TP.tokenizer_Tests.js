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

    this.it('Processes typical objects correctly', function(test, options) {
        var str,
            arr;

        str = 'test:TSHTestCmd [] [1, 2, 3] {} {a: 1, b: 2, c: 3} true false 12 12.34 /foo/g TP';
        arr = TP.$tokenize(str, TP.tsh.script.$tshAndJSOperators, true, false, false, true);

        test.assert.isEqualTo(arr.length, 50);
        test.assert.isEqualTo(arr[0].name, 'identifier');
        test.assert.isEqualTo(arr[0].value, 'test');
        test.assert.isEqualTo(arr[1].name, 'operator');
        test.assert.isEqualTo(arr[1].value, ':');
        test.assert.isEqualTo(arr[2].name, 'identifier');
        test.assert.isEqualTo(arr[2].value, 'TSHTestCmd');
        test.assert.isEqualTo(arr[3].name, 'space');
        test.assert.isEqualTo(arr[3].value, ' ');
        test.assert.isEqualTo(arr[4].name, 'operator');
        test.assert.isEqualTo(arr[4].value, '[');
        test.assert.isEqualTo(arr[5].name, 'operator');
        test.assert.isEqualTo(arr[5].value, ']');
        test.assert.isEqualTo(arr[6].name, 'space');
        test.assert.isEqualTo(arr[6].value, ' ');
        test.assert.isEqualTo(arr[7].name, 'operator');
        test.assert.isEqualTo(arr[7].value, '[');
        test.assert.isEqualTo(arr[8].name, 'number');
        test.assert.isEqualTo(arr[8].value, '1');
        test.assert.isEqualTo(arr[9].name, 'operator');
        test.assert.isEqualTo(arr[9].value, ',');
        test.assert.isEqualTo(arr[10].name, 'space');
        test.assert.isEqualTo(arr[10].value, ' ');

        test.assert.isEqualTo(arr[11].name, 'number');
        test.assert.isEqualTo(arr[11].value, '2');
        test.assert.isEqualTo(arr[12].name, 'operator');
        test.assert.isEqualTo(arr[12].value, ',');
        test.assert.isEqualTo(arr[13].name, 'space');
        test.assert.isEqualTo(arr[13].value, ' ');
        test.assert.isEqualTo(arr[14].name, 'number');
        test.assert.isEqualTo(arr[14].value, '3');
        test.assert.isEqualTo(arr[15].name, 'operator');
        test.assert.isEqualTo(arr[15].value, ']');
        test.assert.isEqualTo(arr[16].name, 'space');
        test.assert.isEqualTo(arr[16].value, ' ');
        test.assert.isEqualTo(arr[17].name, 'operator');
        test.assert.isEqualTo(arr[17].value, '{');
        test.assert.isEqualTo(arr[18].name, 'operator');
        test.assert.isEqualTo(arr[18].value, '}');
        test.assert.isEqualTo(arr[19].name, 'space');
        test.assert.isEqualTo(arr[19].value, ' ');
        test.assert.isEqualTo(arr[20].name, 'operator');
        test.assert.isEqualTo(arr[20].value, '{');

        test.assert.isEqualTo(arr[21].name, 'identifier');
        test.assert.isEqualTo(arr[21].value, 'a');
        test.assert.isEqualTo(arr[22].name, 'operator');
        test.assert.isEqualTo(arr[22].value, ':');
        test.assert.isEqualTo(arr[23].name, 'space');
        test.assert.isEqualTo(arr[23].value, ' ');
        test.assert.isEqualTo(arr[24].name, 'number');
        test.assert.isEqualTo(arr[24].value, '1');
        test.assert.isEqualTo(arr[25].name, 'operator');
        test.assert.isEqualTo(arr[25].value, ',');
        test.assert.isEqualTo(arr[26].name, 'space');
        test.assert.isEqualTo(arr[26].value, ' ');
        test.assert.isEqualTo(arr[27].name, 'identifier');
        test.assert.isEqualTo(arr[27].value, 'b');
        test.assert.isEqualTo(arr[28].name, 'operator');
        test.assert.isEqualTo(arr[28].value, ':');
        test.assert.isEqualTo(arr[29].name, 'space');
        test.assert.isEqualTo(arr[29].value, ' ');
        test.assert.isEqualTo(arr[30].name, 'number');
        test.assert.isEqualTo(arr[30].value, '2');

        test.assert.isEqualTo(arr[31].name, 'operator');
        test.assert.isEqualTo(arr[31].value, ',');
        test.assert.isEqualTo(arr[32].name, 'space');
        test.assert.isEqualTo(arr[32].value, ' ');
        test.assert.isEqualTo(arr[33].name, 'identifier');
        test.assert.isEqualTo(arr[33].value, 'c');
        test.assert.isEqualTo(arr[34].name, 'operator');
        test.assert.isEqualTo(arr[34].value, ':');
        test.assert.isEqualTo(arr[35].name, 'space');
        test.assert.isEqualTo(arr[35].value, ' ');
        test.assert.isEqualTo(arr[36].name, 'number');
        test.assert.isEqualTo(arr[36].value, '3');
        test.assert.isEqualTo(arr[37].name, 'operator');
        test.assert.isEqualTo(arr[37].value, '}');
        test.assert.isEqualTo(arr[38].name, 'space');
        test.assert.isEqualTo(arr[38].value, ' ');
        test.assert.isEqualTo(arr[39].name, 'keyword');
        test.assert.isEqualTo(arr[39].value, 'true');
        test.assert.isEqualTo(arr[40].name, 'space');
        test.assert.isEqualTo(arr[40].value, ' ');

        test.assert.isEqualTo(arr[41].name, 'keyword');
        test.assert.isEqualTo(arr[41].value, 'false');
        test.assert.isEqualTo(arr[42].name, 'space');
        test.assert.isEqualTo(arr[42].value, ' ');
        test.assert.isEqualTo(arr[43].name, 'number');
        test.assert.isEqualTo(arr[43].value, '12');
        test.assert.isEqualTo(arr[44].name, 'space');
        test.assert.isEqualTo(arr[44].value, ' ');
        test.assert.isEqualTo(arr[45].name, 'number');
        test.assert.isEqualTo(arr[45].value, '12.34');
        test.assert.isEqualTo(arr[46].name, 'space');
        test.assert.isEqualTo(arr[46].value, ' ');
        test.assert.isEqualTo(arr[47].name, 'regexp');
        test.assert.isEqualTo(arr[47].value, '/foo/g');
        test.assert.isEqualTo(arr[48].name, 'space');
        test.assert.isEqualTo(arr[48].value, ' ');
        test.assert.isEqualTo(arr[49].name, 'identifier');
        test.assert.isEqualTo(arr[49].value, 'TP');

    });

    this.it('Processes quotes correctly', function(test, options) {
        var str,
            arr;

        str = 'Blah "double quotes" \'single quotes\' `templates` and such';
        arr = TP.$tokenize(str, TP.tsh.script.$tshAndJSOperators, true, false, false, true);

        test.assert.isEqualTo(arr.length, 11);
        test.assert.isEqualTo(arr[0].value, 'Blah');
        test.assert.isEqualTo(arr[1].name, 'space');
        test.assert.isEqualTo(arr[2].name, 'string');
        test.assert.isEqualTo(arr[3].name, 'space');
        test.assert.isEqualTo(arr[4].name, 'string');
        test.assert.isEqualTo(arr[5].name, 'space');
        test.assert.isEqualTo(arr[6].name, 'substitution');
        test.assert.isEqualTo(arr[7].name, 'space');
        test.assert.isEqualTo(arr[8].value, 'and');
        test.assert.isEqualTo(arr[9].name, 'space');
        test.assert.isEqualTo(arr[10].value, 'such');

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

    this.it('Processes from/to values correctly', function(test, options) {
        var str,
            arr,
            prev,
            i,
            len,
            token;

        str = 'a {curly: 1} [1, [2, 3]]';
        arr = TP.$tokenize(str, TP.tsh.script.$tshAndJSOperators, true, false, false, true);

        len = arr.length;
        for (i = 0; i < len; i++) {
            token = arr[i];
            prev = arr[i - 1];
            if (prev) {
                test.assert.isEqualTo(token.from, prev.to);
            } else {
                test.assert.isEqualTo(token.from, 0);
            }
            test.assert.isEqualTo(token.to - token.from, token.value.length);
        }
    });

    this.it('Processes IIFE', function(test, options) {
        var str,
            arr;

        str = '(function foo(\n) { return; }());';
        arr = TP.$tokenize(str, TP.tsh.script.$tshAndJSOperators, true, false, false, true);

        test.assert.isEqualTo(arr[0].name, 'operator');
        test.assert.isEqualTo(arr[0].value, '(');
        test.assert.isEqualTo(arr[0].from, 0);
        test.assert.isEqualTo(arr[0].to, 1);
        test.assert.isEqualTo(arr[1].name, 'keyword');
        test.assert.isEqualTo(arr[1].value, 'function');
        test.assert.isEqualTo(arr[1].from, 1);
        test.assert.isEqualTo(arr[1].to, 9);
        test.assert.isEqualTo(arr[2].name, 'space');
        test.assert.isEqualTo(arr[2].value, ' ');
        test.assert.isEqualTo(arr[2].from, 9);
        test.assert.isEqualTo(arr[2].to, 10);
        test.assert.isEqualTo(arr[3].name, 'identifier');
        test.assert.isEqualTo(arr[3].value, 'foo');
        test.assert.isEqualTo(arr[3].from, 10);
        test.assert.isEqualTo(arr[3].to, 13);
        test.assert.isEqualTo(arr[4].name, 'operator');
        test.assert.isEqualTo(arr[4].value, '(');
        test.assert.isEqualTo(arr[4].from, 13);
        test.assert.isEqualTo(arr[4].to, 14);
        test.assert.isEqualTo(arr[5].name, 'newline');
        test.assert.isEqualTo(arr[5].value, '\n');
        test.assert.isEqualTo(arr[5].from, 14);
        test.assert.isEqualTo(arr[5].to, 15);
        test.assert.isEqualTo(arr[6].name, 'operator');
        test.assert.isEqualTo(arr[6].value, ')');
        test.assert.isEqualTo(arr[6].from, 15);
        test.assert.isEqualTo(arr[6].to, 16);
    });

    this.it('Processes raw JS', function(test, options) {
        var str,
            arr;

        str = 'TP.httpGet(TP.uriExpandPath(\'~app_cfg/tibet.xml\')).then(\n' +
            'function(result)\n' +
            '{\n' +
            '\tconsole.log(TP.str(result));\n' +
            '});';

        arr = TP.$tokenize(str, TP.tsh.script.$tshAndJSOperators, true, false, false, true);

        test.assert.isEqualTo(arr[11].name, 'operator');
        test.assert.isEqualTo(arr[11].value, '.');
        test.assert.isEqualTo(arr[12].name, 'identifier');
        test.assert.isEqualTo(arr[12].value, 'then');
        test.assert.isEqualTo(arr[13].name, 'operator');
        test.assert.isEqualTo(arr[13].value, '(');
        test.assert.isEqualTo(arr[14].name, 'newline');
        test.assert.isEqualTo(arr[14].value, '\n');
        test.assert.isEqualTo(arr[14].from, 56);
        test.assert.isEqualTo(arr[14].to, 57);
        test.assert.isEqualTo(arr[15].name, 'keyword');
        test.assert.isEqualTo(arr[15].value, 'function');
        test.assert.isEqualTo(arr[15].from, 57);
        test.assert.isEqualTo(arr[15].to, 65);
    });

    this.it('Processes nasty path expressions', function(test, options) {
        var str,
            arr;

        str = '$_.($.person.lastname).value  .%  upperCase';

        arr = TP.$tokenize(str, TP.tsh.script.$tshAndJSOperators, true, false, false, true);

        test.assert.isEqualTo(arr[0].name, 'identifier');
        test.assert.isEqualTo(arr[0].value, '$_');
        test.assert.isEqualTo(arr[0].from, 0);
        test.assert.isEqualTo(arr[0].to, 2);

        test.assert.isEqualTo(arr[1].name, 'operator');
        test.assert.isEqualTo(arr[1].value, '.');
        test.assert.isEqualTo(arr[1].from, 2);
        test.assert.isEqualTo(arr[1].to, 3);

        test.assert.isEqualTo(arr[2].name, 'operator');
        test.assert.isEqualTo(arr[2].value, '(');
        test.assert.isEqualTo(arr[2].from, 3);
        test.assert.isEqualTo(arr[2].to, 4);

        test.assert.isEqualTo(arr[3].name, 'identifier');
        test.assert.isEqualTo(arr[3].value, '$');
        test.assert.isEqualTo(arr[3].from, 4);
        test.assert.isEqualTo(arr[3].to, 5);

        test.assert.isEqualTo(arr[4].name, 'operator');
        test.assert.isEqualTo(arr[4].value, '.');
        test.assert.isEqualTo(arr[4].from, 5);
        test.assert.isEqualTo(arr[4].to, 6);

        str = '$_.(.//lastname).value  .%  upperCase';
        arr = TP.$tokenize(str, TP.tsh.script.$tshAndJSOperators, true, false, false, true);

        test.assert.isEqualTo(arr[0].name, 'identifier');
        test.assert.isEqualTo(arr[0].value, '$_');
        test.assert.isEqualTo(arr[0].from, 0);
        test.assert.isEqualTo(arr[0].to, 2);

        test.assert.isEqualTo(arr[1].name, 'operator');
        test.assert.isEqualTo(arr[1].value, '.');
        test.assert.isEqualTo(arr[1].from, 2);
        test.assert.isEqualTo(arr[1].to, 3);

        test.assert.isEqualTo(arr[2].name, 'uri');
        test.assert.isEqualTo(arr[2].value, '(.//lastname).value');
        test.assert.isEqualTo(arr[2].from, 3);
        test.assert.isEqualTo(arr[2].to, 21);
    });


});

//  ------------------------------------------------------------------------

TP.describe('$tokenizedSplit',
function() {

    this.it('Can split/rejoin via tokenizer', function(test, options) {
        var str,
            arr;

        str = 'TP.core.Object APP.foo.bar \'A quoted string\' 123.45';
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

        str = 'hi {{name}}';
        arr = TP.$tokenizedSplit(str);

        test.assert.isEqualTo(arr.length, 2);
        test.assert.isEqualTo(arr[1], '{{name}}');
    });

});

//  ------------------------------------------------------------------------

TP.describe('$tokenizedConstruct',
function() {

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

        str = '[[1]]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj.length, 1);
        test.assert.isArray(obj[0]);
        test.assert.isEqualTo(obj[0].length, 1);
        test.assert.isEqualTo(obj[0][0], 1);

        str = '[1,["a","b"],3]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj.length, 3);
        test.assert.isEqualTo(obj[2], 3);
        test.assert.isArray(obj[1]);
        test.assert.isEqualTo(obj[1].length, 2);
        test.assert.isEqualTo(obj[1][0], 'a');

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

        str = '{"a":{"b":{}}}';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(TP.keys(obj).length, 1);
        test.assert.isPlainObject(obj.a);
        test.assert.isPlainObject(obj.a.b);

        str = '{"a":1,"b":{"d":4,"e":5},"c":3}';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(TP.keys(obj).length, 3);
        test.assert.isEqualTo(obj.a, 1);

        test.assert.isPlainObject(obj.b);
        test.assert.isEqualTo(TP.keys(obj.b).length, 2);
        test.assert.isEqualTo(obj.b.d, 4);

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

        str = '[1,{"a":1,"b":2},3]';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isArray(obj);
        test.assert.isEqualTo(obj[0], 1);
        test.assert.isEqualTo(obj.length, 3);

        test.assert.isPlainObject(obj[1]);
        test.assert.isEqualTo(obj[1].b, 2);
        test.assert.isEqualTo(TP.keys(obj[1]).length, 2);

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

        str = '{"a":1,"b":[1,2,3],"c":3}';
        obj = TP.$tokenizedConstruct(str);

        test.assert.isPlainObject(obj);
        test.assert.isEqualTo(obj.a, 1);
        test.assert.isEqualTo(TP.keys(obj).length, 3);

        test.assert.isArray(obj.b);
        test.assert.isEqualTo(obj.b[1], 2);
        test.assert.isEqualTo(obj.b.length, 3);

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

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
