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

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.Locale.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
