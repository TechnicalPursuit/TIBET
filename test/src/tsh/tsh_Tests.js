//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
*/

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

        inputVal = 'new Function(\'alert("hi")\')';
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

        inputVal = 'function () {alert("hi")}';
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
                        'Resolved value', [1,2,3]),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,{{x}}]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,2]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1,2,2]),
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
                        'Resolved value', [1,2,3]),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,{{x}}]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,2]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1,2,2])
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
                        'Resolved value', {foo:'bar'}),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{foo:{{x}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{foo:2}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {foo:2}),
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
                        'Resolved value', {foo:'bar'}),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{foo:{{x}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '{foo:2}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {foo:2})
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

    this.it('Shell JavaScript Function literals command arguments and options', function(test, options) {
        var inputVal,
            correctResults;

        inputVal = ':testCmd "function() {}" "function() {alert(x)}" "function() {alert({{x}})}" foo="function() {}" bar="function() {alert(x)}" baz="function() {alert({{x}})}"';
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
                        'Original value', '"function() {alert(x)}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {alert(x)}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {alert(x)}),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {alert({{x}})}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {alert(2)}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {alert(2)}),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function () {}),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {alert(x)}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {alert(x)}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {alert(x)}),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {alert({{x}})}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {alert(2)}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {alert(2)})
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
                        'Resolved value', {foo:'bar'}),
                'ARG7',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,3]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,3]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1,2,3])
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
                        'Resolved value', {'foo':'bar'}),
                'eighth',
                TP.hc('Original value tname', 'String',
                        'Original value', '"[1,2,3]"',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,3]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1,2,3])
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

        inputVal = 'javascript:TP';
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

        inputVal = 'javascript:top.UIROOT.$$globalID';
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

    var shellDriver;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('Shell exec', function(test, options) {

        //shellDriver.execShellTest(inputVal, correctResults);
    });

    this.it('Shell output', function(test, options) {

        //shellDriver.execOutputTest(test, inputVal, correctResults);
    });

});

//  ------------------------------------------------------------------------

TP.core.TSH.Type.describe('Shell LOCALDB URL',
function() {

    var shellDriver;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('Shell exec', function(test, options) {

        //shellDriver.execShellTest(inputVal, correctResults);
    });

    this.it('Shell output', function(test, options) {

        //shellDriver.execOutputTest(test, inputVal, correctResults);
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
