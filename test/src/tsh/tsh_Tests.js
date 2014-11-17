//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/* global Q:true
*/

/* eslint-disable no-alert */

//	------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell options expansion',
function() {

    var shellDriver;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('data setup', function(test, options) {
        var inputVal;

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('simple expansion', function(test, options) {

        var inputVal,
            correctResults;

        inputVal = ':testCmd -first --second --third=\'foo\'';
        correctResults =
            TP.hc(
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', 'true',
                        'Expanded value tname', 'Boolean',
                        'Expanded value', true,
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'second\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'second\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'second'),
                'tsh:third',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'foo\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'foo\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'foo')
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });
});

//	------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell JavaScript literals',
function() {

    var shellDriver;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('data setup', function(test, options) {
        var inputVal;

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('Shell JavaScript literals standalone', function(test, options) {

        var inputVal,
            correctResult;

        //  ---

        inputVal = 'new Boolean(true)';
        correctResult = 'Boolean';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'true';
        correctResult = 'Boolean';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'new Number(42)';
        correctResult = 'Number';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = '42';
        correctResult = 'Number';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'new String(\'foo\')';
        correctResult = 'String';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = '\'foo\'';
        correctResult = 'String';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'new Date()';
        correctResult = 'Date';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'new Object()';
        correctResult = 'Object';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        //  NB: The parens are required - a limitation of JS 'eval()'
        inputVal = '({})';
        correctResult = 'Object';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'new Array()';
        correctResult = 'Array';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = '[]';
        correctResult = 'Array';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'new RegExp(\'foo(.+)\', \'g\')';
        correctResult = 'RegExp';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = '/foo(.+)/g';
        correctResult = 'RegExp';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'new RegExp(\'foo(.+)\', \'g\')';
        correctResult = 'RegExp';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = '/foo(.+)/g';
        correctResult = 'RegExp';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'new Function(\'window.alert("hi")\')';
        correctResult = 'Function';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  ---

        inputVal = 'function () {window.alert("hi")}';
        correctResult = 'Function';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isKindOf(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript Boolean literals command arguments and options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd "true" foo="true"';
        correctResults =
            TP.hc(
                'foo',
                TP.hc('Original value tname', 'String',
                        'Original value', '"true"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'true',
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"true"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'true',
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true)
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript String literals command arguments and options', function(test, options) {

        var inputVal,
            correctResults;

        inputVal = ':testCmd "\'\'" "\'hi\'" "\'hi {{x}}\'" foo="\'\'" bar="\'hi\'" baz="\'hi {{x}}\'"';
        correctResults =
            TP.hc(
                'foo',
                TP.hc('Original value tname', 'String',
                        'Original value', '"\'\'"',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'\'',
                        'Resolved value tname', 'String',
                        'Resolved value', ''),
                'bar',
                TP.hc('Original value tname', 'String',
                        'Original value', '"\'hi\'"',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'hi\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'hi'),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"\'hi {{x}}\'"',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'hi 2\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'hi 2'),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"\'\'"',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'\'',
                        'Resolved value tname', 'String',
                        'Resolved value', ''),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '"\'hi\'"',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'hi\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'hi'),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '"\'hi {{x}}\'"',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'hi 2\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'hi 2')
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript Number literals command arguments and options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd "2" "2{{x}}" bar="2" baz="2{{x}}"';
        correctResults =
            TP.hc(
                'bar',
                TP.hc('Original value tname', 'String',
                        'Original value', '"2"',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"2{{x}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '22',
                        'Resolved value tname', 'Number',
                        'Resolved value', 22),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"2"',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '"2{{x}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '22',
                        'Resolved value tname', 'Number',
                        'Resolved value', 22)
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript Array literals command arguments and options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd "[]" "[1,2,3]" "[1,2,{{x}}]" foo="[]" bar="[1,2,3]" baz="[1,2,{{x}}]"';
        correctResults =
            TP.hc(
                'foo',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[]',
                        'Resolved value tname', 'Array',
                        'Resolved value', []),
                'bar',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,3]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,3]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, 3]),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,{{x}}]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,2]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, 2]),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[]',
                        'Resolved value tname', 'Array',
                        'Resolved value', []),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,3]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,3]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, 3]),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,{{x}}]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,2]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, 2])
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript Object literals command arguments and options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd "{}" "{foo:\'bar\'}" "{foo:{{x}}}" foo="{}" bar="{foo:\'bar\'}" baz="{foo:{{x}}}"';
        correctResults =
            TP.hc(
                'foo',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {}),
                'bar',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{foo:\'bar\'}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{foo:\'bar\'}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {foo: 'bar'}),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{foo:{{x}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{foo:2}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {foo: 2}),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {}),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{foo:\'bar\'}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{foo:\'bar\'}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {foo: 'bar'}),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{foo:{{x}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{foo:2}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {foo: 2})
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript Function literals command arguments and options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd "function() {}" "function(x) {window.alert(x);}" "function() {window.alert({{x}});}" foo="function() {}" bar="function(x) {window.alert(x);}" baz="function() {window.alert({{x}});}"';
        correctResults =
            TP.hc(
                'foo',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function () {}),
                'bar',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function(x) {window.alert(x);}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function(x) {window.alert(x);}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function(x) {window.alert(x);}),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {window.alert({{x}});}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {window.alert(2);}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {window.alert(2);}),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function () {}),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function(x) {window.alert(x);}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function(x) {window.alert(x);}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function(x) {window.alert(x);}),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {window.alert({{x}});}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {window.alert(2);}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {window.alert(2);})
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript RegExp literals command arguments and options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd "/fuzzy/" "/fuzz{{x}}y/" bar="/fuzzy/" baz="/fuzz{{x}}y/"';
        correctResults =
            TP.hc(
                'bar',
                TP.hc('Original value tname', 'String',
                        'Original value', '"/fuzzy/"',
                        'Expanded value tname', 'String',
                        'Expanded value', '/fuzzy/',
                        'Resolved value tname', 'RegExp',
                        'Resolved value', /fuzzy/),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"/fuzz{{x}}y/"',
                        'Expanded value tname', 'String',
                        'Expanded value', '/fuzz2y/',
                        'Resolved value tname', 'RegExp',
                        'Resolved value', /fuzz2y/),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"/fuzzy/"',
                        'Expanded value tname', 'String',
                        'Expanded value', '/fuzzy/',
                        'Resolved value tname', 'RegExp',
                        'Resolved value', /fuzzy/),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '"/fuzz{{x}}y/"',
                        'Expanded value tname', 'String',
                        'Expanded value', '/fuzz2y/',
                        'Resolved value tname', 'RegExp',
                        'Resolved value', /fuzz2y/)
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript literals command arguments', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd true \'foo\' 42 /foo(.+)/g "{}" "[]" "{\'foo\':\'bar\'}" "[1,2,3]"';
        correctResults =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', 'true',
                        'Expanded value tname', 'Boolean',
                        'Expanded value', true,
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'foo\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'foo\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'foo'),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '42',
                        'Expanded value tname', 'Number',
                        'Expanded value', 42,
                        'Resolved value tname', 'Number',
                        'Resolved value', 42),
                'ARG3',
                TP.hc('Original value tname', 'String',
                        'Original value', '/foo(.+)/g',
                        'Expanded value tname', 'RegExp',
                        'Expanded value', /foo(.+)/g,
                        'Resolved value tname', 'RegExp',
                        'Resolved value', /foo(.+)/g),
                'ARG4',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {}),
                'ARG5',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[]',
                        'Resolved value tname', 'Array',
                        'Resolved value', []),
                'ARG6',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{\'foo\':\'bar\'}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{\'foo\':\'bar\'}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {foo: 'bar'}),
                'ARG7',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,3]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,3]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, 3])
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript literals command options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd first=true second=\'foo\' third=42 fourth=/foo(.+)/g fifth="{}" sixth="[]" seventh="{\'foo\':\'bar\'}" eighth="[1,2,3]"';
        correctResults =
            TP.hc(
                'first',
                TP.hc('Original value tname', 'String',
                        'Original value', 'true',
                        'Expanded value tname', 'Boolean',
                        'Expanded value', true,
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'second',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'foo\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'foo\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'foo'),
                'third',
                TP.hc('Original value tname', 'String',
                        'Original value', '42',
                        'Expanded value tname', 'Number',
                        'Expanded value', 42,
                        'Resolved value tname', 'Number',
                        'Resolved value', 42),
                'fourth',
                TP.hc('Original value tname', 'String',
                        'Original value', '/foo(.+)/g',
                        'Expanded value tname', 'RegExp',
                        'Expanded value', /foo(.+)/g,
                        'Resolved value tname', 'RegExp',
                        'Resolved value', /foo(.+)/g),
                'fifth',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {}),
                'sixth',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[]',
                        'Resolved value tname', 'Array',
                        'Resolved value', []),
                'seventh',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{\'foo\':\'bar\'}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{\'foo\':\'bar\'}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {'foo': 'bar'}),
                'eighth',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,3]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,3]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, 3])
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });
});

//	------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell JavaScript variables',
function() {

    var shellDriver;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('data setup', function(test, options) {
        var inputVal;

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('Shell JavaScript variables: standalone', function(test, options) {
        var inputVal,
            correctResult;

        //  Use the variable in an expression by itself
        inputVal = 'x';
        correctResult = 2;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a formatting expression by itself
        inputVal = '{{x}}';
        correctResult = 2;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript variables: quoted, standalone', function(test, options) {
        var inputVal,
            correctResult;

        //  Use the variable in a single quoted String expression
        inputVal = '\'x\'';
        correctResult = 'x';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a double quoted String expression
        inputVal = '"x"';
        correctResult = 'x';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a backtick quoted String expression
        inputVal = '`x`';
        correctResult = 2;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript variables: quoted, with other content', function(test, options) {

        var inputVal,
            correctResult;

        //  Use the variable with other String content in a single quoted String
        //  expression
        inputVal = '\'This is x\'';
        correctResult = 'This is x';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable with other String content in a double quoted String
        //  expression
        inputVal = '"This is x"';
        correctResult = 'This is x';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable with other String content in a backtick quoted
        //  String expression

        inputVal = '`This is x`';
        correctResult = undefined;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript variables: templated', function(test, options) {

        var inputVal,
            correctResult;

        //  Use the variable in a formatting expression, but since it's not in
        //  double quotes it won't do the interpolation - it will just return the
        //  value without doing the formatting
        inputVal = '{{x %% #{##.00}}}';
        correctResult = 2;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a formatting expression, but since it's in single
        //  quotes, not in double quotes, it won't do the interpolation - it will
        //  just return the literal value of the whole expression
        inputVal = '\'{{x %% #{##.00}}}\'';
        correctResult = '{{x %% #{##.00}}}';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a formatting expression, and since it's in double
        //  quotes it will do the interpolation.
        inputVal = '"{{x %% #{##.00}}}"';
        correctResult = '2.00';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a formatting expression, and since it's in backtick
        //  quotes it will both do the interpolation and eval the result - which
        //  gives it back the number 2.
        inputVal = '`{{x %% #{##.00}}}`';
        correctResult = 2;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript variables: command arguments', function(test, options) {

        var inputVal,
            correctResults;

        inputVal = ':testCmd foo bar baz';
        correctResults =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', 'foo',
                        'Expanded value tname', 'String',
                        'Expanded value', 'foo',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', 'bar',
                        'Expanded value tname', 'String',
                        'Expanded value', 'bar',
                        'Resolved value tname', 'Null',
                        'Resolved value', TP.NULL),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', 'baz',
                        'Expanded value tname', 'String',
                        'Expanded value', 'baz',
                        'Resolved value tname', 'Number',
                        'Resolved value', 42)
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript variables: command options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd first=foo second=bar third=baz';
        correctResults =
            TP.hc(
                'first',
                TP.hc('Original value tname', 'String',
                        'Original value', 'foo',
                        'Expanded value tname', 'String',
                        'Expanded value', 'foo',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF),
                'second',
                TP.hc('Original value tname', 'String',
                        'Original value', 'bar',
                        'Expanded value tname', 'String',
                        'Expanded value', 'bar',
                        'Resolved value tname', 'Null',
                        'Resolved value', TP.NULL),
                'third',
                TP.hc('Original value tname', 'String',
                        'Original value', 'baz',
                        'Expanded value tname', 'String',
                        'Expanded value', 'baz',
                        'Resolved value tname', 'Number',
                        'Resolved value', 42)
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript variables: standalone command arguments', function(test, options) {

        var inputVal;

        inputVal = ':testCmd x';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', 'x',
                        'Expanded value tname', 'String',
                        'Expanded value', 'x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd @x';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '@x',
                        'Expanded value tname', 'String',
                        'Expanded value', '@x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd {{x}}';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{x}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

    });

    this.it('Shell JavaScript variables: quoted, standalone, command arguments', function(test, options) {

        var inputVal;

        inputVal = ':testCmd \'x\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'x\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'x')));

        inputVal = ':testCmd "x"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"x"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd `x`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`x`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        //  ---

        inputVal = ':testCmd \'@x\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'@x\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '@x')));

        inputVal = ':testCmd "@x"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@x"',
                        'Expanded value tname', 'String',
                        'Expanded value', '@x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd `@x`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`@x`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        //  ---

        inputVal = ':testCmd \'{{x}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{x}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{x}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{x}}')));

        inputVal = ':testCmd "{{x}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{x}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd `{{x}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{x}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('Shell JavaScript variables: quoted, with other content, command arguments', function(test, options) {

        var inputVal;

        inputVal = ':testCmd \'This is x\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is x\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is x')));

        inputVal = ':testCmd "This is x"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is x"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        inputVal = ':testCmd `This is x`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is x`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  ---

        inputVal = ':testCmd \'This is @x\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is @x\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is @x')));

        inputVal = ':testCmd "This is @x"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is @x"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        inputVal = ':testCmd `This is @x`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is @x`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  ---

        inputVal = ':testCmd \'This is {{x}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{x}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is {{x}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is {{x}}')));

        inputVal = ':testCmd "This is {{x}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is {{x}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 2',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        inputVal = ':testCmd `This is {{x}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is {{x}}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('Shell JavaScript variables: standalone command options', function(test, options) {

        var inputVal;

        inputVal = ':testCmd stuff=x';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'x',
                        'Expanded value tname', 'String',
                        'Expanded value', 'x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd stuff=@x';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '@x',
                        'Expanded value tname', 'String',
                        'Expanded value', '@x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd stuff={{x}}';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{x}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('Shell JavaScript variables: quoted, standalone, command options', function(test, options) {

        var inputVal;

        inputVal = ':testCmd stuff=\'x\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'x\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'x')));

        inputVal = ':testCmd stuff="x"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"x"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd stuff=`x`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`x`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        //  ---

        inputVal = ':testCmd stuff=\'@x\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'@x\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '@x')));

        inputVal = ':testCmd stuff="@x"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@x"',
                        'Expanded value tname', 'String',
                        'Expanded value', '@x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd stuff=`@x`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`@x`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        //  ---

        inputVal = ':testCmd stuff=\'{{x}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{x}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{x}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{x}}')));

        inputVal = ':testCmd stuff="{{x}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{x}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd stuff=`{{x}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{x}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

    });

    this.it('Shell JavaScript variables: quoted, with other content, command options', function(test, options) {

        var inputVal;

        inputVal = ':testCmd stuff=\'This is x\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is x\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is x')));

        inputVal = ':testCmd stuff="This is x"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is x"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        inputVal = ':testCmd stuff=`This is x`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is x`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  ---

        inputVal = ':testCmd stuff=\'This is @x\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is @x\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is @x')));

        inputVal = ':testCmd stuff="This is @x"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is @x"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        inputVal = ':testCmd stuff=`This is @x`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is @x`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  ---

        inputVal = ':testCmd stuff=\'This is {{x}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{x}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is {{x}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is {{x}}')));

        inputVal = ':testCmd stuff="This is {{x}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is {{x}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 2',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        inputVal = ':testCmd stuff=`This is {{x}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is {{x}}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('Shell JavaScript variables: templated command arguments', function(test, options) {

        var inputVal;

        inputVal = ':testCmd {{x %% #{##.00}}}';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{x %% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '2.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd \'{{x %% #{##.00}}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{x %% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{x %% #{##.00}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{x %% #{##.00}}}')));

        inputVal = ':testCmd "{{x %% #{##.00}}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{x %% #{##.00}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '2.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd `{{x %% #{##.00}}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{x %% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('Shell JavaScript variables: templated command options', function(test, options) {

        var inputVal;

        inputVal = ':testCmd stuff={{x %% #{##.00}}}';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{x %% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '2.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd stuff=\'{{x %% #{##.00}}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{x %% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{x %% #{##.00}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{x %% #{##.00}}}')));

        inputVal = ':testCmd stuff="{{x %% #{##.00}}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{x %% #{##.00}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '2.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

        inputVal = ':testCmd stuff=`{{x %% #{##.00}}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{x %% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });
});

//	------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell variables',
function() {

    var shellDriver;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('data setup', function(test, options) {
        var inputVal;

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('Shell shell variables: standalone', function(test, options) {

        var inputVal,
            correctResult;

        //  Use the variable in an expression by itself

        //  Simple form
        inputVal = '$Y';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '${Y}';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a formatting expression by itself

        //  Simple form
        inputVal = '{{$Y}}';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '{{${Y}}}';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

    });

    this.it('Shell shell variables: quoted, standalone', function(test, options) {

        var inputVal,
            correctResult;

        //  Use the variable in a single quoted String expression

        //  Simple form
        inputVal = '\'$Y\'';
        correctResult = '$Y';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '\'${Y}\'';
        correctResult = '${Y}';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });


        //  Use the variable in a double quoted String expression

        //  Simple form
        inputVal = '"$Y"';
        correctResult = '$Y';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '"${Y}"';
        correctResult = '$Y';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a backtick quoted String expression

        //  Simple form
        inputVal = '`$Y`';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '`${Y}`';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

    });

    this.it('Shell shell variables: quoted, with other content', function(test, options) {

        var inputVal,
            correctResult;

        //  Use the variable with other String content in a single quoted String
        //  expression

        //  Simple form
        inputVal = '\'This is $Y\'';
        correctResult = 'This is $Y';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '\'This is ${Y}\'';
        correctResult = 'This is ${Y}';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable with other String content in a double quoted String
        //  expression

        //  Simple form
        inputVal = '"This is $Y"';
        correctResult = 'This is $Y';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '"This is ${Y}"';
        correctResult = 'This is ${Y}';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable with other String content in a backtick quoted
        //  String expression

        //  Simple form

        inputVal = '`This is $Y`';
        correctResult = undefined;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '`This is ${Y}`';
        correctResult = undefined;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell shell variables: templated', function(test, options) {
        var inputVal,
            correctResult;

        //  Use the variable in a formatting expression, but since it's not in
        //  double quotes it won't do the interpolation - it will just return the
        //  value without doing the formatting

        //  Simple form
        inputVal = '{{$Y %% #{##.00}}}';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '{{${Y} %% #{##.00}}}';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a formatting expression, but since it's in single
        //  quotes, not in double quotes, it won't do the interpolation - it will
        //  just return the literal value of the whole expression

        //  Simple form
        inputVal = '\'{{$Y %% #{##.00}}}\'';
        correctResult = '{{$Y %% #{##.00}}}';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '\'{{${Y} %% #{##.00}}}\'';
        correctResult = '{{${Y} %% #{##.00}}}';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a formatting expression, and since it's in double
        //  quotes it will do the interpolation.

        //  Simple form
        inputVal = '"{{$Y %% #{##.00}}}"';
        correctResult = '100.00';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '"{{${Y} %% #{##.00}}}"';
        correctResult = '100.00';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Use the variable in a formatting expression, and since it's in backtick
        //  quotes it will both do the interpolation and eval the result - which
        //  gives it back the number 2.

        //  Simple form
        inputVal = '`{{$Y %% #{##.00}}}`';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  Extended form
        inputVal = '`{{${Y} %% #{##.00}}}`';
        correctResult = 100;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isEqualTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell shell variables: command arguments', function(test, options) {
        var inputVal;

        //  Simple form
        inputVal = ':testCmd $Y';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd ${Y}';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '${Y}',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd @$Y';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '@$Y',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd @${Y}';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '@${Y}',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd {{$Y}}';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{$Y}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd {{${Y}}}';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{${Y}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('Shell shell variables: quoted, standalone, command arguments', function(test, options) {

        var inputVal;

        //  Simple form
        inputVal = ':testCmd \'$Y\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'$Y\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '$Y')));

        //  Extended form
        inputVal = ':testCmd \'${Y}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'${Y}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '${Y}')));

        //  Simple form
        inputVal = ':testCmd "$Y"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd "${Y}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd `$Y`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`$Y`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd `${Y}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`${Y}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  ---

        //  Simple form
        inputVal = ':testCmd \'@$Y\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'@$Y\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '@$Y')));

        //  Extended form
        inputVal = ':testCmd \'@${Y}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'@${Y}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '@${Y}')));

        //  Simple form
        inputVal = ':testCmd "@$Y"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd "@${Y}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd `@$Y`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`@$Y`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd `@${Y}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`@${Y}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  ---

        //  Simple form
        inputVal = ':testCmd \'{{$Y}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{$Y}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{$Y}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{$Y}}')));

        //  Extended form
        inputVal = ':testCmd \'{{${Y}}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{${Y}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{${Y}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{${Y}}}')));

        //  Simple form
        inputVal = ':testCmd "{{$Y}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{$Y}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd "{{${Y}}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{${Y}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd `{{$Y}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{$Y}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd `{{${Y}}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{${Y}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('Shell shell variables: quoted, with other content, command arguments', function(test, options) {

        var inputVal;

        //  Simple form
        inputVal = ':testCmd \'This is $Y\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is $Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is $Y\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is $Y')));

        //  Extended form
        inputVal = ':testCmd \'This is ${Y}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is ${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is ${Y}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is ${Y}')));

        //  Simple form
        inputVal = ':testCmd "This is $Y"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is $Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is $Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd "This is ${Y}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is ${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is $Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Simple form
        inputVal = ':testCmd `This is $Y`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is $Y`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd `This is ${Y}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is ${Y}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  ---

        //  Simple form
        inputVal = ':testCmd \'This is @$Y\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is @$Y\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is @$Y')));

        //  Extended form
        inputVal = ':testCmd \'This is @${Y}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is @${Y}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is @${Y}')));

        //  Simple form
        inputVal = ':testCmd "This is @$Y"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is @$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @$Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd "This is @${Y}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is @${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @$Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Simple form
        inputVal = ':testCmd `This is @$Y`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is @$Y`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd `This is @${Y}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is @${Y}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  ---

        //  Simple form
        inputVal = ':testCmd \'This is {{$Y}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{$Y}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is {{$Y}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is {{$Y}}')));

        //  Extended form
        inputVal = ':testCmd \'This is {{${Y}}}\'';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{${Y}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is {{${Y}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is {{${Y}}}')));

        //  Simple form
        inputVal = ':testCmd "This is {{$Y}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is {{$Y}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd "This is {{${Y}}}"';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is {{${Y}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Simple form
        inputVal = ':testCmd `This is {{$Y}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is {{$Y}}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd `This is {{${Y}}}`';

        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is {{${Y}}}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('Shell shell variables: templated command arguments', function(test, options) {

        var inputVal;

        //  Simple form
        inputVal = ':testCmd {{$Y %% #{##.00}}}';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{$Y %% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd {{${Y} %% #{##.00}}}';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{${Y} %% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd \'{{$Y %% #{##.00}}}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{$Y %% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{$Y %% #{##.00}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{$Y %% #{##.00}}}')));

        //  Extended form
        inputVal = ':testCmd \'{{${Y} %% #{##.00}}}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{${Y} %% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{${Y} %% #{##.00}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{${Y} %% #{##.00}}}')));

        //  Simple form
        inputVal = ':testCmd "{{$Y %% #{##.00}}}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{$Y %% #{##.00}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd "{{${Y} %% #{##.00}}}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{${Y} %% #{##.00}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd `{{$Y %% #{##.00}}}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{$Y %% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd `{{${Y} %% #{##.00}}}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{${Y} %% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('Shell shell variables: command options', function(test, options) {
        var inputVal;

        //  Simple form
        inputVal = ':testCmd stuff=$Y';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff=${Y}';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '${Y}',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd stuff=@$Y';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '@$Y',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff=@${Y}';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '@${Y}',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd stuff={{$Y}}';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{$Y}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff={{${Y}}}';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{${Y}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('Shell shell variables: quoted, standalone, command options', function(test, options) {
        var inputVal;

        //  Simple form
        inputVal = ':testCmd stuff=\'$Y\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'$Y\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '$Y')));

        //  Extended form
        inputVal = ':testCmd stuff=\'${Y}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'${Y}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '${Y}')));

        //  Simple form
        inputVal = ':testCmd stuff="$Y"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff="${Y}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd stuff=`$Y`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`$Y`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff=`${Y}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`${Y}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  ---

        //  Simple form
        inputVal = ':testCmd stuff=\'@$Y\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'@$Y\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '@$Y')));

        //  Extended form
        inputVal = ':testCmd stuff=\'@${Y}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'@${Y}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '@${Y}')));

        //  Simple form
        inputVal = ':testCmd stuff="@$Y"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff="@${Y}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd stuff=`@$Y`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`@$Y`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff=`@${Y}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`@${Y}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  ---

        //  Simple form
        inputVal = ':testCmd stuff=\'{{$Y}}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{$Y}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{$Y}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{$Y}}')));

        //  Extended form
        inputVal = ':testCmd stuff=\'{{${Y}}}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{${Y}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{${Y}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{${Y}}}')));

        //  Simple form
        inputVal = ':testCmd stuff="{{$Y}}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{$Y}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff="{{${Y}}}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{${Y}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Simple form
        inputVal = ':testCmd stuff=`{{$Y}}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{$Y}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        //  Extended form
        inputVal = ':testCmd stuff=`{{${Y}}}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{${Y}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('Shell shell variables: quoted, with other content, command options', function(test, options) {
        var inputVal;

        //  Simple form
        inputVal = ':testCmd stuff=\'This is $Y\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is $Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is $Y\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is $Y')));

        //  Extended form
        inputVal = ':testCmd stuff=\'This is ${Y}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is ${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is ${Y}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is ${Y}')));

        //  Simple form
        inputVal = ':testCmd stuff="This is $Y"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is $Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is $Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd stuff="This is ${Y}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is ${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is $Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Simple form
        inputVal = ':testCmd stuff=`This is $Y`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is $Y`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd stuff=`This is ${Y}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is ${Y}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  ---

        //  Simple form
        inputVal = ':testCmd stuff=\'This is @$Y\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is @$Y\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is @$Y')));

        //  Extended form
        inputVal = ':testCmd stuff=\'This is @${Y}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is @${Y}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is @${Y}')));

        //  Simple form
        inputVal = ':testCmd stuff="This is @$Y"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is @$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @$Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd stuff="This is @${Y}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is @${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @$Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Simple form
        inputVal = ':testCmd stuff=`This is @$Y`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is @$Y`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd stuff=`This is @${Y}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is @${Y}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  ---

        //  Simple form
        inputVal = ':testCmd stuff=\'This is {{$Y}}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{$Y}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is {{$Y}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is {{$Y}}')));

        //  Extended form
        inputVal = ':testCmd stuff=\'This is {{${Y}}}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{${Y}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'This is {{${Y}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'This is {{${Y}}}')));

        //  Simple form
        inputVal = ':testCmd stuff="This is {{$Y}}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is {{$Y}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd stuff="This is {{${Y}}}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is {{${Y}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Simple form
        inputVal = ':testCmd stuff=`This is {{$Y}}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is {{$Y}}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));

        //  Extended form
        inputVal = ':testCmd stuff=`This is {{${Y}}}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`This is {{${Y}}}`',
                        'Expanded value tname', 'Undefined',
                        'Expanded value', TP.UNDEF,
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('Shell shell variables: templated command options', function(test, options) {
        var inputVal;

        inputVal = ':testCmd stuff={{$Y %% #{##.00}}}';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{$Y %% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        inputVal = ':testCmd stuff=\'{{$Y %% #{##.00}}}\'';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{$Y %% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'{{$Y %% #{##.00}}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', '{{$Y %% #{##.00}}}')));

        inputVal = ':testCmd stuff="{{$Y %% #{##.00}}}"';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{$Y %% #{##.00}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));

        inputVal = ':testCmd stuff=`{{$Y %% #{##.00}}}`';

        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{$Y %% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });
});

//  ------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell TIBET URN, JS URI, TIBET URL',
function() {

    var shellDriver;

    this.before(function(suite, options) {
        var win,
            doc,

            backgroundElem,
            childElem;

        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        //  ---

        //  Set up a temporary reference to the top-level window name
        TP.$$topWindowName = TP.sys.cfg('tibet.uibuffer');

        win = TP.win(TP.$$topWindowName + '.UIROOT');

        //  Make sure there's a window named 'UIROOT' under a window named by
        //  the name in TP.$$topWindowName
        if (!TP.isWindow(win)) {
            //  Couldn't find the window - fail the request and return
            this.fail(
                TP.sc('Couldn\'t find window named "',
                        TP.$$topWindowName,
                        '.UIROOT"'));

            return;
        }

        //  ---

        doc = win.document;

        backgroundElem = TP.elem('<div id="top_background"></div>');
        backgroundElem = TP.nodeAppendChild(
                            doc.documentElement, backgroundElem, false);

        childElem = TP.elem(
                        '<h1 id="uri_test_child">A test child</h1>');
        TP.nodeAppendChild(backgroundElem, childElem, false);
    });

    this.it('data setup', function(test, options) {
        var inputVal;

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('Shell TIBET URN: Retrieve global object', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'urn:tibet:TP';
        correctResult = TP;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URN embedded in TIBET URL: Retrieve global object', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet:///urn:tibet:TP';
        correctResult = TP;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URN: Retrieve type object', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'urn:tibet:TP.sig.Signal';
        correctResult = TP.sig.Signal;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URN embedded in TIBET URL: Retrieve type object', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet:///urn:tibet:TP.sig.Signal';
        correctResult = TP.sig.Signal;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URN: Retrieve registered object', function(test, options) {

        var foo,

            inputVal,
            correctResult;

        foo = TP.ac(1,2,3);
        TP.sys.registerObject(foo, 'FOO', true);

        inputVal = 'urn:tibet:FOO';
        correctResult = foo;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URN embedded in TIBET URL: Retrieve registered object', function(test, options) {

        var foo,

            inputVal,
            correctResult;

        foo = TP.ac(1,2,3);
        TP.sys.registerObject(foo, 'FOO', true);

        inputVal = 'tibet:///urn:tibet:FOO';
        correctResult = foo;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript URL: Retrieve global object', function(test, options) {

        var inputVal,
            correctResult;

        /* eslint-disable no-script-url */
        inputVal = 'javascript:TP';
        /* eslint-enable no-script-url */
        correctResult = TP;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript URL embedded in TIBET URL: Retrieve global object', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet:///javascript:TP';
        correctResult = TP;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript URL: Retrieve object in nested iframe', function(test, options) {

        var inputVal,
            correctResult;

        /* eslint-disable no-script-url */
        inputVal = 'javascript:top.UIROOT.$$globalID';
        /* eslint-enable no-script-url */
        correctResult = TP.$$topWindowName + '.UIROOT';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript URL embedded in TIBET URL: Retrieve object in nested frame', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet:///javascript:top.UIROOT.$$globalID';
        correctResult = TP.$$topWindowName + '.UIROOT';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell JavaScript URL embedded in TIBET URL: Retrieve object in nested iframe', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://top.UIROOT/javascript:$$globalID';
        correctResult = TP.$$topWindowName + '.UIROOT';

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.Window of the current UI canvas', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://uicanvas/';
        correctResult = TP.sys.getUICanvas();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://uicanvas';
        correctResult = TP.sys.getUICanvas();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.HTMLDocumentNode of the current UI canvas', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://uicanvas/#document';
        correctResult = TP.sys.getUICanvas().getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://uicanvas#document';
        correctResult = TP.sys.getUICanvas().getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The 'tibet://uicanvas' should be optional

        inputVal = '#document';
        correctResult = TP.sys.getUICanvas().getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.Window of named window', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://UIROOT/';
        correctResult = TP.core.Window.construct('UIROOT');

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://UIROOT';
        correctResult = TP.core.Window.construct('UIROOT');

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.HTMLDocumentNode of named window', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://UIROOT/#document';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://UIROOT#document';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.HTMLDocumentNode of named window', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://UIROOT/future_path/';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://UIROOT/future_path';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.HTMLDocumentNode of named window', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://UIROOT/future_path/#document';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://UIROOT/future_path#document';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult,
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.Element using XPointer barename', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://uicanvas/#top_background';
        correctResult = TP.byId('top_background');

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://uicanvas#top_background';
        correctResult = TP.byId('top_background');

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The 'tibet://uicanvas' should be optional

        inputVal = '#top_background';
        correctResult = TP.byId('top_background');

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

    });

    this.it('Shell TIBET URL: Retrieve TP.core.Element using XPointer element() scheme', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://uicanvas/#element(/1/2)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://uicanvas#element(/1/2)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The 'tibet://uicanvas' should be optional

        inputVal = '#element(/1/2)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.Element using XPointer element() scheme with ID', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://uicanvas/#element(top_background/1)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background'), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://uicanvas#element(top_background/1)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background'), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The 'tibet://uicanvas/' should be optional

        inputVal = '#element(top_background/1)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background'), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.Element using XPointer xpath1() scheme', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://uicanvas/#xpath1(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://uicanvas#xpath1(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The 'tibet://uicanvas/' should be optional

        inputVal = '#xpath1(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell IBET URL: Retrieve TP.core.Element using XPointer xpointer() scheme', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://uicanvas/#xpointer(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://uicanvas#xpointer(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The 'tibet://uicanvas/' should be optional

        inputVal = '#xpointer(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    this.it('Shell TIBET URL: Retrieve TP.core.Element using TIBET-extension XPointer css() scheme', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'tibet://uicanvas/#css(#top_background > *:first-child)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background'), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The last slash should be optional

        inputVal = 'tibet://uicanvas#css(#top_background > *:first-child)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background'), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });

        //  The 'tibet://uicanvas/' should be optional

        inputVal = '#css(#top_background > *:first-child)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background'), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function (testResult) {
                    test.assert.isIdenticalTo(
                        testResult.getNativeNode(),
                        correctResult,
                        TP.join('"', inputVal, '"',
                                ' produced: "', testResult, '"',
                                ' should be: "', correctResult, '".'));
            });
    });

    //  ---

    this.after(
        function() {
            var backgroundElem;

            //  Set up a temporary reference to the top-level window name
            delete TP.$$topWindowName;

            backgroundElem = TP.byId('top_background');
            TP.nodeDetach(backgroundElem);
        });
});

//  ------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell HTTP URL',
function() {

    var shellDriver,

        oldNeedsPrivileges,
        server;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        //  NB: We have to redefine TP.uriNeedsPrivileges() here to just return
        //  false or otherwise TIBET itself will reject the following requests
        //  as being 'cross-domain'. We'll put it back in the 'after()' handler.
        oldNeedsPrivileges = TP.uriNeedsPrivileges;
        TP.uriNeedsPrivileges = function() {return false;};

        server = TP.test.fakeServer.create();
    });

    //  ---

    this.it('Shell HTTP URL: Retrieve asynchronously', function(test, options) {

        var locStr,
            resultElem,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_GET_TEST';
        resultElem = TP.wrap(
                        TP.xhtmlnode('<html><body>Hi there</body></html>'));

        server.respondWith(
            TP.HTTP_GET,
            locStr,
            [
                200,
                {
                    'Content-Type': TP.XML_ENCODED
                },
                resultElem.asString()
            ]);

        //  Note here how we use '-refresh' at the end of the URL to make sure
        //  that TIBET gets data from the 'server' each time.
        inputVal = locStr + ' -refresh';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isEqualTo(
                        testResult.get('html|body').at(0),
                        resultElem.get('html|body').at(0));
            });

        server.respond();
    });

    //  ---

    this.it('Shell HTTP URL: Set resource using PUT', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_PUT_TEST';
        testBody = 'PUT test content';

        server.respondWith(
            TP.HTTP_PUT,
            locStr,
            function(req) {

                test.assert.isEqualTo(req.requestBody, testBody);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED
                    },
                    'OK from PUT');
            });

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  verb here and don't allow TIBET to choose the verb based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --verb="put"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

            });
    });

    //  ---

    this.it('Shell HTTP URL: Set resource using POST', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_POST_TEST';
        testBody = 'POST test content';

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.isEqualTo(req.requestBody, testBody);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED
                    },
                    'OK from POST');
            });

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  verb here and don't allow TIBET to choose the verb based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --verb="post"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

            });
    });

    //  ---

    this.it('Shell HTTP URL: Set resource using FORM POST', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_POST_FORM_TEST';
        testBody = TP.hc('foo', 'bar', 'baz', 'goo');

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.isEqualTo(req.requestBody, 'foo=bar&baz=goo');

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED
                    },
                    'OK from POST');
            });

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  verb here and don't allow TIBET to choose the verb based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.asSource() + ' .>! ' + locStr +
                    ' --verb="post"' +
                    ' --mimetype="application/x-www-form-urlencoded"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

            });
    });

    //  ---

    this.it('Shell HTTP URL: Set resource using MULTIPART FORM POST - TEXT', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_MULTIPART_POST_FORM_TEXT_TEST';
        testBody = TP.hc('foo', 'bar', 'baz', 'goo');

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.matches(req.requestBody, /Content-disposition: form-data; name="foo"/);
                test.assert.matches(req.requestBody, /Content-disposition: form-data; name="baz"/);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED
                    },
                    'OK from FORM POST');
            });

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  verb here and don't allow TIBET to choose the verb based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.asSource() + ' .>! ' + locStr +
                    ' --verb="post"' +
                    ' --mimetype="multipart/form-data"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

            });
    });

    //  ---

    this.it('Shell HTTP URL: Set resource using MULTIPART FORM POST - XML', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_MULTIPART_FORM_POST_XML_TEST';
        testBody = TP.hc('foo', 'bar', 'baz', 'goo');

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.matches(req.requestBody, /Content-disposition: form-data; name="foo"/);
                test.assert.matches(req.requestBody, /Content-disposition: form-data; name="baz"/);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED
                    },
                    'OK from MULTIPART FORM XML POST');
            });

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  verb here and don't allow TIBET to choose the verb based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.asXMLString().quoted() + ' .>! ' + locStr +
                    ' --verb="post"' +
                    ' --mimetype="multipart/form-data"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

            });
    });

    //  ---

    this.it('Shell HTTP URL: Set resource using MULTIPART RELATED POST - MIXED', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_MULTIPART_RELATED_POST_MIXED_TEST';
        testBody = TP.ac(
                        TP.hc('body', 'Content chunk 1'),
                        TP.hc('body', 'Content chunk 2'),
                        TP.hc('body', TP.elem('<content>Content chunk 3</content>')));

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.matches(req.requestBody, /Content-ID: 0\s+Content chunk 1/);
                test.assert.matches(req.requestBody, /Content-ID: 1\s+Content chunk 2/);
                test.assert.matches(req.requestBody, /Content-ID: 2\s+<content>Content chunk 3<\/content>/);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED
                    },
                    'OK from MULTIPART RELATED MIXED POST');
            });

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  verb here and don't allow TIBET to choose the verb based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.asSource() + ' .>! ' + locStr +
                    ' --verb="post"' +
                    ' --mimetype="multipart/related"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

            });
    });

    //  ---

    this.it('Shell HTTP URL: Delete resource using DELETE', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_DELETE_TEST';
        testBody = 'DELETE test content';

        server.respondWith(
            TP.HTTP_DELETE,
            locStr,
            function(req) {

                test.assert.isEqualTo(req.requestBody, testBody);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED
                    },
                    'OK from DELETE');
            });

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  verb here and don't allow TIBET to choose the verb based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --verb="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

            });
    });

    //  ---

    this.after(function(suite, options) {

        server.restore();
        TP.uriNeedsPrivileges = oldNeedsPrivileges;
    });
});

//  ------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell JSONP URL',
function() {

    var shellDriver,
        stub;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        stub = TP.jsonpCall.asStub();
    });

    //  ---

    this.it('Shell JSONP URL: Retrieve resource asynchronously', function(test, options) {

        var locStr,

            inputVal;

        stub.callsArgWith(1, '{"foo":"bar"}');

        locStr = 'jsonp://ajax.googleapis.com/ajax/services/search/web?' +
                        'v=1.0&q=football&start=10';

        inputVal = locStr;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

            });
    });

    //  ---

    this.after(function(suite, options) {

        stub.restore();
    });
});

//  ------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell LOCALDB URL',
function() {

    var shellDriver,
        storage;

    //  Make sure there's an entry for 'localdb://' URL testing
    storage = TP.core.LocalStorage.construct();

    this.before(function(suite, options) {
        var storageStr;

        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        storageStr = TP.js2json(
                {
                    'local_test':
                        {
                            'author_info':
                                {
                                    '_id': 'author_info',
                                    '_date_created': TP.dc(),
                                    '_date_modified': TP.dc(),
                                    '_body':
                                        {
                                            'firstName': 'Bill',
                                            'lastName': 'Edney'
                                        }
                                }
                        }
                });

        storage.atPut(TP.LOCALSTORAGE_DB_NAME, storageStr);
    });

    //  ---

    this.it('Shell LOCALDB URL: Retrieve resource', function(test, options) {

        var locStr,

            inputVal;

        locStr = 'localdb://local_test/author_info';

        inputVal = locStr + ' -refresh';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                var obj;

                obj = testResult.at('_body');

                test.assert.isTrue(
                    obj.hasKey('firstName'),
                    TP.sc('Expected that result would have a key of \'firstName\' and',
                            ' it doesn\'t'));

                test.assert.isEqualTo(
                        obj.at('firstName'),
                        'Bill',
                        TP.sc('Expected: ', '"Bill"',
                                ' and got instead: ', obj.at('firstName'), '.'));

                test.assert.isTrue(
                    obj.hasKey('lastName'),
                    TP.sc('Expected that result would have a key of \'lastName\' and',
                            ' it doesn\'t'));

                test.assert.isEqualTo(
                        obj.at('lastName'),
                        'Edney',
                        TP.sc('Expected: ', '"Edney"',
                                ' and got instead: ', obj.at('lastName'), '.'));
            });
    });

    //  ---

    this.it('Shell LOCALDB URL: Retrieve resource info', function(test, options) {

        var locStr,

            inputVal;

        locStr = 'localdb://local_test/author_info';

        inputVal = locStr + ' -refresh --verb="head"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

            test.assert.isTrue(
                testResult.hasKey('_date_created'),
                TP.sc('Expected that result would have a key of \'_date_created\'',
                        ' and it doesn\'t'));

            test.assert.isTrue(
                testResult.hasKey('_date_modified'),
                TP.sc('Expected that result would have a key of \'_date_modified\'',
                        ' and it doesn\'t'));
            });
    });

    //  ---

    this.it('Shell LOCALDB URL: Retrieve listing of all documents in db', function(test, options) {

        var locStr,

            inputVal;

        locStr = 'localdb://local_test/_all_docs';

        inputVal = locStr + ' -refresh';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                test.assert.isTrue(
                    testResult.hasKey('total_rows'),
                    TP.sc('Expected that result would have a key of \'total_rows\' and',
                            ' it doesn\'t'));

                test.assert.isEqualTo(
                    testResult.at('total_rows'),
                    1,
                    TP.sc('Expected: ', '1',
                            ' and got instead: ', testResult.at('total_rows'), '.'));

                test.assert.isTrue(
                    testResult.hasKey('rows'),
                    TP.sc('Expected that result would have a key of \'rows\' and',
                            ' it doesn\'t'));
            });
    });

    //  ---

    this.it('Shell LOCALDB URL: Set resource using PUT (supplied id means UPDATE if found)', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        //  A PUT request here using the ID causes an UPDATE
        locStr = 'localdb://local_test/author_info';

        testBody = TP.hc('firstName', 'Scott', 'lastName', 'Shattuck');

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the verb
        //  here since the default for localdb: URLs is POST.
        inputVal = testBody.asSource() + ' .>! ' + locStr + ' --verb="put"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isValid(
                    testResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));
            });

        shellDriver.execShellTest(
            test,
            'localdb://local_test/author_info' + ' -refresh',
            function(testResult) {

                var obj;

                obj = testResult.at('_body');

                test.assert.isTrue(
                    obj.hasKey('firstName'),
                    TP.sc('Expected that result would have a key of \'firstName\' and',
                            ' it doesn\'t'));

                test.assert.isEqualTo(
                        obj.at('firstName'),
                        'Scott',
                        TP.sc('Expected: ', '"Scott"',
                                ' and got instead: ', obj.at('firstName'), '.'));

                test.assert.isTrue(
                    obj.hasKey('lastName'),
                    TP.sc('Expected that result would have a key of \'lastName\' and',
                            ' it doesn\'t'));

                test.assert.isEqualTo(
                        obj.at('lastName'),
                        'Shattuck',
                        TP.sc('Expected: ', '"Shattuck"',
                                ' and got instead: ', obj.at('lastName'), '.'));
            });
    });

    //  ---

    this.it('Shell LOCALDB URL: Set resource using POST (computed id means CREATE)', function(test, options) {

        var locStr,
            testBody,

            inputVal,

            saveID;

        //  A POST request here without the ID causes a CREATE and an
        //  auto-generated ID
        locStr = 'localdb://local_test/';

        testBody = TP.hc('firstName', 'Another', 'lastName', 'Hacker');

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'.
        inputVal = testBody.asSource() + ' .>! ' + locStr;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(saveResult) {
                test.assert.isValid(
                    saveResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));

                saveID = saveResult.at('_id');
            });

        this.then(
            function() {
                shellDriver.execShellTest(
                    test,
                    'localdb://local_test/' + saveID + ' -refresh',
                    function(testResult) {

                        var obj;

                        obj = testResult.at('_body');

                        test.assert.isTrue(
                            obj.hasKey('firstName'),
                            TP.sc('Expected that result would have a key of \'firstName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                                obj.at('firstName'),
                                'Another',
                                TP.sc('Expected: ', '"Another"',
                                        ' and got instead: ', obj.at('firstName'), '.'));

                        test.assert.isTrue(
                            obj.hasKey('lastName'),
                            TP.sc('Expected that result would have a key of \'lastName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                                obj.at('lastName'),
                                'Hacker',
                                TP.sc('Expected: ', '"Hacker"',
                                        ' and got instead: ', obj.at('lastName'), '.'));
                    });
            });
        });

    //  ---

    this.it('Shell LOCALDB URL: Delete resource using DELETE (supplied id means DELETE if found)', function(test, options) {

        var locStr,

            testBody,

            inputVal;

        //  A DELETE request here using the ID causes a DELETE
        locStr = 'localdb://local_test/author_info';

        testBody = 'DELETE test content';
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --verb="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isValid(
                    testResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));
            });
    });

    //  ---

    this.it('Shell LOCALDB URL: Delete all documents in db using DELETE (no supplied id means DELETE entire db)', function(test, options) {

        var locStr,
            testBody,
            inputVal;

        //  A DELETE request here without the ID causes a DELETE (of the whole
        //  DB)
        locStr = 'localdb://local_test';

        testBody = 'DELETE test content';
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --verb="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isValid(
                    testResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));
            });
    });

    //  ---

    this.after(function(suite, options) {

        storage.removeKey(TP.LOCALSTORAGE_DB_NAME);
    });
});

//  ------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell POUCHDB URL',
function() {

    var shellDriver,
        testDb;

    this.before(function(suite, options) {

        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        this.then(
            function() {
                var now,

                    pouchPromise,
                    qPromise;

                now = Date.now();

                testDb = new TP.extern.PouchDB('pouch_test');

                pouchPromise = testDb.put(
                    {
                        '_id': 'author_info',
                        'date_created': now,
                        'date_modified': now,
                        'body':
                            {
                                'firstName': 'Bill',
                                'lastName': 'Edney'
                            }
                    });

                qPromise = new Q(pouchPromise);

                return qPromise;
            });
    });

    //  ---

    this.it('Shell POUCHDB URL: Retrieve resource', function(test, options) {

        var locStr,

            inputVal;

        locStr = 'pouchdb://pouch_test/author_info';

        inputVal = locStr + ' -refresh';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                var obj;

                obj = testResult.at('body');

                test.assert.isTrue(
                    obj.hasKey('firstName'),
                    TP.sc('Expected that result would have a key of',
                            ' \'firstName\' and it doesn\'t'));

                test.assert.isEqualTo(
                        obj.at('firstName'),
                        'Bill',
                        TP.sc('Expected: ', '"Bill"',
                                ' and got instead: ',
                                obj.at('firstName'), '.'));

                test.assert.isTrue(
                    obj.hasKey('lastName'),
                    TP.sc('Expected that result would have a key of',
                            ' \'lastName\' and it doesn\'t'));

                test.assert.isEqualTo(
                        obj.at('lastName'),
                        'Edney',
                        TP.sc('Expected: ', '"Edney"',
                                ' and got instead: ',
                                obj.at('lastName'), '.'));
            });
    });

    //  ---

    this.it('Shell POUCHDB URL: Retrieve resource info', function(test, options) {

        var locStr,

            inputVal;

        locStr = 'pouchdb://pouch_test/author_info';

        inputVal = locStr + ' -refresh --verb="head"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                test.assert.isTrue(
                    testResult.hasKey('date_created'),
                    TP.sc('Expected that result would have a key of',
                            ' \'date_created\' and it doesn\'t'));

                test.assert.isTrue(
                    testResult.hasKey('date_modified'),
                    TP.sc('Expected that result would have a key of',
                            ' \'date_modified\' and it doesn\'t'));
            });
    });

    //  ---

    this.it('Shell POUCHDB URL: Retrieve listing of all documents in db', function(test, options) {

        var locStr,

            inputVal;

        locStr = 'pouchdb://pouch_test/_all_docs';

        inputVal = locStr + ' -refresh';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                test.assert.isTrue(
                    testResult.hasKey('total_rows'),
                    TP.sc('Expected that result would have a key of \'total_rows\' and',
                            ' it doesn\'t'));

                test.assert.isEqualTo(
                        testResult.at('total_rows'),
                        1,
                        TP.sc('Expected: ', '1',
                                ' and got instead: ', testResult.at('total_rows'), '.'));

                test.assert.isTrue(
                    testResult.hasKey('rows'),
                    TP.sc('Expected that result would have a key of \'rows\' and',
                            ' it doesn\'t'));
            });
    });

    //  ---

    this.it('Shell POUCHDB URL: Set resource using PUT (supplied id means UPDATE if found)', function(test, options) {

        var locStr,

            testBody,
            inputVal;

        locStr = 'pouchdb://pouch_test/author_info';

        testBody = TP.hc('firstName', 'Scott', 'lastName', 'Shattuck');

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the verb
        //  here since the default for pouchdb: URLs is POST.
        inputVal = testBody.asSource() + ' .>! ' + locStr + ' --verb="put"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isValid(
                    testResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));
            });

        this.then(
            function() {
                shellDriver.execShellTest(
                    test,
                    'pouchdb://pouch_test/author_info' + ' -refresh',
                    function(testResult) {

                        test.assert.isTrue(
                            testResult.hasKey('firstName'),
                            TP.sc('Expected that result would have a key of \'firstName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                            testResult.at('firstName'),
                            'Scott',
                            TP.sc('Expected: ', '"Scott"',
                                    ' and got instead: ', testResult.at('firstName'), '.'));

                        test.assert.isTrue(
                            testResult.hasKey('lastName'),
                            TP.sc('Expected that result would have a key of \'lastName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                                testResult.at('lastName'),
                                'Shattuck',
                                TP.sc('Expected: ', '"Shattuck"',
                                        ' and got instead: ', testResult.at('lastName'), '.'));
                    });
            });
    });

    //  ---

    this.it('Shell POUCHDB URL: Set resource using POST (computed id means CREATE)', function(test, options) {

        var locStr,
            testBody,

            inputVal,

            saveID;

        //  A POST request here without the ID causes a CREATE and an
        //  auto-generated ID
        locStr = 'pouchdb://pouch_test/';

        testBody = TP.hc('firstName', 'Another', 'lastName', 'Hacker');

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'.
        inputVal = testBody.asSource() + ' .>! ' + locStr;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(saveResult) {
                test.assert.isValid(
                    saveResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));

                saveID = saveResult.at('id');
            });

        this.then(
            function() {
                shellDriver.execShellTest(
                    test,
                    'pouchdb://pouch_test/' + saveID + ' -refresh',
                    function(testResult) {

                        test.assert.isTrue(
                            testResult.hasKey('firstName'),
                            TP.sc('Expected that result would have a key of \'firstName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                                testResult.at('firstName'),
                                'Another',
                                TP.sc('Expected: ', '"Another"',
                                        ' and got instead: ', testResult.at('firstName'), '.'));

                        test.assert.isTrue(
                            testResult.hasKey('lastName'),
                            TP.sc('Expected that result would have a key of \'lastName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                                testResult.at('lastName'),
                                'Hacker',
                                TP.sc('Expected: ', '"Hacker"',
                                        ' and got instead: ', testResult.at('lastName'), '.'));
                    });
            });
        });

    //  ---

    this.it('Shell POUCHDB URL: Delete resource using DELETE (supplied id means DELETE if found)', function(test, options) {

        var locStr,

            testBody,

            inputVal;

        //  A DELETE request here using the ID causes a DELETE
        locStr = 'pouchdb://pouch_test/author_info';

        testBody = 'DELETE test content';
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --verb="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isValid(
                    testResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));
            });
    });

    //  ---

    this.it('Shell POUCHDB URL: Delete all documents in db using DELETE (no supplied id means DELETE entire db)', function(test, options) {

        var locStr,
            testBody,
            inputVal;

        //  A DELETE request here without the ID causes a DELETE (of the whole
        //  DB)
        locStr = 'pouchdb://pouch_test';

        testBody = 'DELETE test content';
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --verb="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isValid(
                    testResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));
            });
    });

    //  ---

    this.after(function(suite, options) {

        this.then(
            function() {
                var pouchPromise,
                    qPromise;

                pouchPromise = TP.extern.PouchDB.destroy('pouch_test');

                qPromise = new Q(pouchPromise);

                return qPromise;
            });
    });
});

//  ------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell Piping',
function() {

    var shellDriver;

    this.before(function(suite, options) {

        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    //  ---

    this.it('Shell Piping: number to simple format', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'z = 1; z .| \'The number is: {{value}}\'';
        correctResult = 'The number is: 1';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                test.assert.isEqualTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    //  ---

    this.it('Shell Piping: number to templated format', function(test, options) {

        var inputVal,
            correctResult;

        inputVal = 'z = 1; z .| \'The number is: {{value %% #{##.00}}}\'';
        correctResult = 'The number is: 1.00';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                test.assert.isEqualTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.TSH.Type.runTestSuites();
*/

//	------------------------------------------------------------------------
//	end
//	========================================================================
