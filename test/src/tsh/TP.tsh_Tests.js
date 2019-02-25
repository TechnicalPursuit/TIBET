//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/* eslint no-alert:0,
          no-empty-function:0,
          brace-style:0,
          object-curly-newline: 0
*/

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Expansion Core',
function() {

    var inputVal,
        correctResult,
        shellDriver;

    this.before(function(suite, options) {
        inputVal = null;
        correctResult = null;

        shellDriver = TP.test.TSHDriver.construct();

        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('Can set initial shell variables', function(test, options) {
        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        //  Quiet the test harness. It needs at least one assert.
        test.assert.isTrue(true);

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('Expands unquoted argv and param values to resolved values',
    function(test, options) {
        inputVal = 'test:TSHTestCmd $Y -first=$Y --second=$Y';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands double-quoted argv and param values to resolved strings',
    function(test, options) {
        inputVal = 'test:TSHTestCmd "$Y" -first="$Y" --second="$Y"';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '"$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '"$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands single-quoted argv and param values to literal strings',
    function(test, options) {
        inputVal = 'test:TSHTestCmd \'$Y\' -first=\'$Y\' --second=\'$Y\'';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'String',
                        'Resolved value', '$Y'),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'String',
                        'Resolved value', '$Y'),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'String',
                        'Resolved value', '$Y')
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands unquoted argv values to proper input objects',
    function(test, options) {
        inputVal = 'test:TSHTestCmd [] [1, 2, 3] {} {a: 1, b: 2, c: 3} true false 12 12.34 /foo/g TP';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '[]',
                        'Expanded value tname', 'Array',
                        'Expanded value', [],
                        'Resolved value tname', 'Array',
                        'Resolved value', []),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '[1,2,3]',
                        'Expanded value tname', 'Array',
                        'Expanded value', [1, 2, 3],
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, 3]),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '{}',
                        'Expanded value tname', 'Object',
                        'Expanded value', {},
                        'Resolved value tname', 'Object',
                        'Resolved value', {}),
                'ARG3',
                TP.hc('Original value tname', 'String',
                        'Original value', '{a:1,b:2,c:3}',
                        'Expanded value tname', 'Object',
                        'Expanded value', {a: 1, b: 2, c: 3},
                        'Resolved value tname', 'Object',
                        'Resolved value', {a: 1, b: 2, c: 3}),
                'ARG4',
                TP.hc('Original value tname', 'String',
                        'Original value', 'true',
                        'Expanded value tname', 'Boolean',
                        'Expanded value', true,
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'ARG5',
                TP.hc('Original value tname', 'String',
                        'Original value', 'false',
                        'Expanded value tname', 'Boolean',
                        'Expanded value', false,
                        'Resolved value tname', 'Boolean',
                        'Resolved value', false),
                'ARG6',
                TP.hc('Original value tname', 'String',
                        'Original value', '12',
                        'Expanded value tname', 'Number',
                        'Expanded value', 12,
                        'Resolved value tname', 'Number',
                        'Resolved value', 12),
                'ARG7',
                TP.hc('Original value tname', 'String',
                        'Original value', '12.34',
                        'Expanded value tname', 'Number',
                        'Expanded value', 12.34,
                        'Resolved value tname', 'Number',
                        'Resolved value', 12.34),
                'ARG8',
                TP.hc('Original value tname', 'String',
                        'Original value', '/foo/g',
                        'Expanded value tname', 'RegExp',
                        'Expanded value', /foo/g,
                        'Resolved value tname', 'RegExp',
                        'Resolved value', /foo/g),
                'ARG9',
                TP.hc('Original value tname', 'String',
                        'Original value', 'TP',
                        'Expanded value tname', 'TP.lang.Namespace',
                        'Expanded value', TP,
                        'Resolved value tname', 'TP.lang.Namespace',
                        'Resolved value', TP)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands unquoted argv values with nested objects',
    function(test, options) {
        inputVal = 'test:TSHTestCmd [1, 2, {a: 1, b:2}] {a: 1, b: 2, c: [1,2,3]}';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '[1,2,{a:1,b:2}]',
                        'Expanded value tname', 'Array',
                        'Expanded value', [1, 2, {a: 1, b: 2}],
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, {a: 1, b: 2}]),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '{a:1,b:2,c:[1,2,3]}',
                        'Expanded value tname', 'Object',
                        'Expanded value', {a: 1, b: 2, c: [1, 2, 3]},
                        'Resolved value tname', 'Object',
                        'Resolved value', {a: 1, b: 2, c: [1, 2, 3]})
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands unquoted argv and param backticks to resolved values',
    function(test, options) {
        inputVal = 'test:TSHTestCmd `$Y` -first=`$Y` --second=`$Y`';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`$Y`',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '`$Y`',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '`$Y`',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands double-quoted argv and param backticks to resolved strings',
    function(test, options) {
        inputVal = 'test:TSHTestCmd "`$Y`" -first="`$Y`" --second="`$Y`"';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"`$Y`"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '"`$Y`"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '"`$Y`"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands single-quoted argv and param backticks to literal strings',
    function(test, options) {
        inputVal = 'test:TSHTestCmd \'`$Y`\' -first=\'`$Y`\' --second=\'`$Y`\'';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'`$Y`\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '`$Y`',
                        'Resolved value tname', 'String',
                        'Resolved value', '`$Y`'),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'`$Y`\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '`$Y`',
                        'Resolved value tname', 'String',
                        'Resolved value', '`$Y`'),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'`$Y`\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '`$Y`',
                        'Resolved value tname', 'String',
                        'Resolved value', '`$Y`')
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands unquoted @ references to resolved values',
    function(test, options) {
        inputVal = 'test:TSHTestCmd @Y -first=@Y --second=@Y';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '@Y',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '@Y',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '@Y',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands double-quoted @ references to resolved value strings',
    function(test, options) {
        inputVal = 'test:TSHTestCmd "@Y" -first="@Y" --second="@Y"';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '"@Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('Expands single-quoted @ references to literal values',
    function(test, options) {
        inputVal = 'test:TSHTestCmd \'@Y\' -first=\'@Y\' --second=\'@Y\'';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@Y',
                        'Resolved value tname', 'String',
                        'Resolved value', '@Y'),
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@Y',
                        'Resolved value tname', 'String',
                        'Resolved value', '@Y'),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@Y',
                        'Resolved value tname', 'String',
                        'Resolved value', '@Y')
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.after(
        function() {
            //  Remove any globals that the shell put there.
            delete window.x;
            delete window.y;
            delete window.foo;
            delete window.bar;
            delete window.baz;
        });
});

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell command options expansion',
function() {

    var inputVal,
        correctResult,
        shellDriver;

    this.before(function(suite, options) {
        inputVal = null;
        correctResult = null;

        shellDriver = TP.test.TSHDriver.construct();

        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('data setup', function(test, options) {

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        //  Merely here to shut up the test harness.
        test.assert.isTrue(true);

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('simple expansion', function(test, options) {

        inputVal = 'test:TSHTestCmd -first --second --third=\'foo\' -fourth="bar" --fifth=$Y --sixth="$Y" --seventh=\'$Y\'';
        correctResult =
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
                        'Original value', 'true',
                        'Expanded value tname', 'Boolean',
                        'Expanded value', true,
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'tsh:third',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'foo\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'foo',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF),
                'tsh:fourth',
                TP.hc('Original value tname', 'String',
                        'Original value', '"bar"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'bar',
                        'Resolved value tname', 'Null',
                        'Resolved value', TP.NULL),
                'tsh:fifth',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:sixth',
                TP.hc('Original value tname', 'String',
                        'Original value', '"$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100),
                'tsh:seventh',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.after(
        function() {
            //  Remove any globals that the shell put there.
            delete window.x;
            delete window.y;
            delete window.foo;
            delete window.bar;
            delete window.baz;
        });
}).skip();

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell JavaScript literals',
function() {

    var inputVal,
        correctResult,
        shellDriver;

    this.before(function(suite, options) {
        inputVal = null;
        correctResult = null;

        shellDriver = TP.test.TSHDriver.construct();

        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('data setup', function(test, options) {

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        //  Merely here to shut up the test harness.
        test.assert.isTrue(true);

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('new Boolean(true)', function(test, options) {

        inputVal = 'new Boolean(true)';
        correctResult = 'Boolean';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('true', function(test, options) {

        inputVal = 'true';
        correctResult = 'Boolean';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('new Number(42)', function(test, options) {

        inputVal = 'new Number(42)';
        correctResult = 'Number';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('42', function(test, options) {

        inputVal = '42';
        correctResult = 'Number';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('new String(\'foo\')', function(test, options) {

        inputVal = 'new String(\'foo\')';
        correctResult = 'String';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('\'foo\'', function(test, options) {

        inputVal = '\'foo\'';
        correctResult = 'String';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('new Date()', function(test, options) {

        inputVal = 'new Date()';
        correctResult = 'Date';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('new Object()', function(test, options) {

        inputVal = 'new Object()';
        correctResult = 'Object';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('({})', function(test, options) {

        //  NB: The parens are required - a limitation of JS 'eval'
        inputVal = '({})';
        correctResult = 'Object';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('new Array()', function(test, options) {

        inputVal = 'new Array()';
        correctResult = 'Array';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('[]', function(test, options) {

        inputVal = '[]';
        correctResult = 'Array';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('new RegExp(\'foo(.+)\', \'g\')', function(test, options) {

        inputVal = 'new RegExp(\'foo(.+)\', \'g\')';
        correctResult = 'RegExp';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('/foo(.+)/g', function(test, options) {

        inputVal = '/foo(.+)/g';
        correctResult = 'RegExp';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('new Function(\'window.alert("hi")\')', function(test, options) {

        inputVal = 'new Function(\'window.alert("hi")\')';
        correctResult = 'Function';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('function() {window.alert("hi")}', function(test, options) {

        inputVal = 'function() {window.alert("hi")}';
        correctResult = 'Function';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isKindOf(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('test:TSHTestCmd "true" foo="true"', function(test, options) {

        inputVal = 'test:TSHTestCmd "true" foo="true"';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"true"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'true',
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'foo',
                TP.hc('Original value tname', 'String',
                        'Original value', '"true"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'true',
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd "\'\'" "\'hi\'" "\'hi {{x}}\'" "hi {{x}}" foo="\'\'" bar="\'hi\'" baz="hi {{x}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "\'\'" "\'hi\'" "\'hi {{x}}\'" "hi {{x}}" foo="\'\'" bar="\'hi\'" baz="hi {{x}}"';
        correctResult =
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
                        'Original value', '"hi {{x}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'hi 2',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF),
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
                        'Expanded value', '\'hi {{x}}\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'hi {{x}}'),
                'ARG3',
                TP.hc('Original value tname', 'String',
                        'Original value', '"hi {{x}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'hi 2',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd "2" "2{{x}}" bar="2" baz="2{{x}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "2" "2{{x}}" bar="2" baz="2{{x}}"';
        correctResult =
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

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd "[]" "[1,2,3]" "[1,2,{{x}}]" foo="[]" bar="[1,2,3]" baz="[1,2,{{x}}]"', function(test, options) {

        inputVal = 'test:TSHTestCmd "[]" "[1,2,3]" "[1,2,{{x}}]" foo="[]" bar="[1,2,3]" baz="[1,2,{{x}}]"';
        correctResult =
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

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd "{}" "{foo:\'bar\'}" "{foo:{{x}}}" foo="{}" bar="{foo:\'bar\'}" baz="{foo:{{x}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "{}" "{foo:\'bar\'}" "{foo:{{x}}}" foo="{}" bar="{foo:\'bar\'}" baz="{foo:{{x}}}"';
        correctResult =
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

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd "function() {}" "function(x) {window.alert(x); }" "function() {window.alert({{x}}); }" foo="function() {}" bar="function(x) {window.alert(x); }" baz="function() {window.alert({{x}}); }"', function(test, options) {

        inputVal = 'test:TSHTestCmd "function() {}" "function(x) {window.alert(x); }" "function() {window.alert({{x}}); }" foo="function() {}" bar="function(x) {window.alert(x); }" baz="function() {window.alert({{x}}); }"';
        correctResult =
            TP.hc(
                'foo',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {}),
                'bar',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function(x) {window.alert(x); }"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function(x) {window.alert(x); }',
                        'Resolved value tname', 'Function',
                        'Resolved value', function(x) {window.alert(x); }),
                'baz',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {window.alert({{x}}); }"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {window.alert(2); }',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {window.alert(2); }),
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {}',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {}),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function(x) {window.alert(x); }"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function(x) {window.alert(x); }',
                        'Resolved value tname', 'Function',
                        'Resolved value', function(x) {window.alert(x); }),
                'ARG2',
                TP.hc('Original value tname', 'String',
                        'Original value', '"function() {window.alert({{x}}); }"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'function() {window.alert(2); }',
                        'Resolved value tname', 'Function',
                        'Resolved value', function() {window.alert(2); })
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd "/fuzzy/" "/fuzz{{x}}y/" bar="/fuzzy/" baz="/fuzz{{x}}y/"', function(test, options) {

        inputVal = 'test:TSHTestCmd "/fuzzy/" "/fuzz{{x}}y/" bar="/fuzzy/" baz="/fuzz{{x}}y/"';
        correctResult =
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

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd true \'foo\' 42 /foo(.+)/g "{}" "[]" "{\'foo\':\'bar\'}" "[1,2,3]"', function(test, options) {

        inputVal = 'test:TSHTestCmd true \'foo\' 42 /foo(.+)/g "{}" "[]" "{\'foo\':\'bar\'}" "[1,2,3]"';
        correctResult =
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'Boolean',
                        'Original value', true,
                        'Expanded value tname', 'Boolean',
                        'Expanded value', true,
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'ARG1',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'foo\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'foo',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF),
                'ARG2',
                TP.hc('Original value tname', 'Number',
                        'Original value', 42,
                        'Expanded value tname', 'Number',
                        'Expanded value', 42,
                        'Resolved value tname', 'Number',
                        'Resolved value', 42),
                'ARG3',
                TP.hc('Original value tname', 'RegExp',
                        'Original value', /foo(.+)/g,
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

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd first=true second=\'foo\' third=42 fourth=/foo(.+)/g fifth="{}" sixth="[]" seventh="{\'foo\':\'bar\'}" eighth="[1,2,3]"', function(test, options) {

        inputVal = 'test:TSHTestCmd first=true second=\'foo\' third=42 fourth=/foo(.+)/g fifth="{}" sixth="[]" seventh="{\'foo\':\'bar\'}" eighth="[1,2,3]"';
        correctResult =
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
                        'Expanded value', 'foo',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF),
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
                        'Original value', '{}',
                        'Expanded value tname', 'String',
                        'Expanded value', '{}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {}),
                'sixth',
                TP.hc('Original value tname', 'String',
                        'Original value', '[]',
                        'Expanded value tname', 'String',
                        'Expanded value', '[]',
                        'Resolved value tname', 'Array',
                        'Resolved value', []),
                'seventh',
                TP.hc('Original value tname', 'String',
                        'Original value', '{\'foo\':\'bar\'}',
                        'Expanded value tname', 'String',
                        'Expanded value', '{\'foo\':\'bar\'}',
                        'Resolved value tname', 'Object',
                        'Resolved value', {foo: 'bar'}),
                'eighth',
                TP.hc('Original value tname', 'String',
                        'Original value', '[1,2,3]',
                        'Expanded value tname', 'String',
                        'Expanded value', '[1,2,3]',
                        'Resolved value tname', 'Array',
                        'Resolved value', [1, 2, 3])
            );

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.after(
        function() {
            //  Remove any globals that the shell put there.
            delete window.x;
            delete window.y;
            delete window.foo;
            delete window.bar;
            delete window.baz;
        });
}).skip();

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell JavaScript variables',
function() {

    var inputVal,
        correctResult,
        shellDriver;

    this.before(function(suite, options) {
        inputVal = null;
        correctResult = null;

        shellDriver = TP.test.TSHDriver.construct();

        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('data setup', function(test, options) {

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        //  Merely here to shut up the test harness.
        test.assert.isTrue(true);

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('x', function(test, options) {

        //  Use the variable in an expression by itself
        inputVal = 'x';
        correctResult = 2;

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

    this.it('{{x}}', function(test, options) {

        //  Use the variable in a formatting expression by itself
        inputVal = '{{x}}';
        correctResult = 2;

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

    this.it('\'x\'', function(test, options) {

        //  Use the variable in a single-quoted String expression
        inputVal = '\'x\'';
        correctResult = 'x';

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

    this.it('"x"', function(test, options) {

        //  Use the variable in a double quoted String expression
        inputVal = '"x"';
        correctResult = 'x';

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

    this.it('`x`', function(test, options) {

        //  Use the variable in a backtick quoted String expression
        inputVal = '`x`';
        correctResult = 2;

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

    this.it('\'This is x\'', function(test, options) {

        //  Use the variable with other String content in a single-quoted String
        //  expression
        inputVal = '\'This is x\'';
        correctResult = 'This is x';

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

    this.it('"This is x"', function(test, options) {

        //  Use the variable with other String content in a double quoted String
        //  expression
        inputVal = '"This is x"';
        correctResult = 'This is x';

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

    this.it('`This is x`', function(test, options) {

        //  Use the variable with other String content in a backtick quoted
        //  String expression

        inputVal = '`This is x`';
        correctResult = undefined;

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

    this.it('{{x .% #{##.00}}}', function(test, options) {

        //  Use the variable in a formatting expression, but since it's not in
        //  double quotes it won't do the interpolation - it will just return the
        //  value without doing the formatting
        inputVal = '{{x .% #{##.00}}}';
        correctResult = 2;

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

    this.it('\'{{x .% #{##.00}}}\'', function(test, options) {

        //  Use the variable in a formatting expression, but since it's in single
        //  quotes, not in double quotes, it won't do the interpolation - it will
        //  just return the literal value of the whole expression
        inputVal = '\'{{x .% #{##.00}}}\'';
        correctResult = '{{x .% #{##.00}}}';

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

    this.it('"{{x .% #{##.00}}}"', function(test, options) {

        //  Use the variable in a formatting expression, and since it's in double
        //  quotes it will do the interpolation.
        inputVal = '"{{x .% #{##.00}}}"';
        correctResult = '2.00';

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

    this.it('`{{x .% #{##.00}}}`', function(test, options) {

        //  Use the variable in a formatting expression, and since it's in backtick
        //  quotes it will both do the interpolation and eval the result - which
        //  gives it back the number 2.
        inputVal = '`{{x .% #{##.00}}}`';
        correctResult = 2;

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

    this.it('test:TSHTestCmd foo bar baz', function(test, options) {

        inputVal = 'test:TSHTestCmd foo bar baz';
        correctResult =
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

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd first=foo second=bar third=baz', function(test, options) {

        inputVal = 'test:TSHTestCmd first=foo second=bar third=baz';
        correctResult =
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

        shellDriver.execOutputTest(test, inputVal, correctResult);
    });

    this.it('test:TSHTestCmd x', function(test, options) {

        inputVal = 'test:TSHTestCmd x';
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
    });

    this.it('test:TSHTestCmd @x', function(test, options) {

        inputVal = 'test:TSHTestCmd @x';
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
    });

    this.it('test:TSHTestCmd {{x}}', function(test, options) {

        inputVal = 'test:TSHTestCmd {{x}}';
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

    this.it('test:TSHTestCmd \'x\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'x\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('test:TSHTestCmd "x"', function(test, options) {

        inputVal = 'test:TSHTestCmd "x"';
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
    });

    this.it('test:TSHTestCmd `x`', function(test, options) {

        inputVal = 'test:TSHTestCmd `x`';
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
    });

    this.it('test:TSHTestCmd \'@x\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'@x\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('test:TSHTestCmd "@x"', function(test, options) {

        inputVal = 'test:TSHTestCmd "@x"';
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
    });

    this.it('test:TSHTestCmd `@x`', function(test, options) {

        inputVal = 'test:TSHTestCmd `@x`';
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
    });

    this.it('test:TSHTestCmd \'{{x}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'{{x}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{x}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{x}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "{{x}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "{{x}}"';
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
    });

    this.it('test:TSHTestCmd `{{x}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `{{x}}`';
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

    this.it('test:TSHTestCmd \'This is x\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is x\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "This is x"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is x"';
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
    });

    this.it('test:TSHTestCmd `This is x`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is x`';
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
    });

    this.it('test:TSHTestCmd \'This is @x\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is @x\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "This is @x"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is @x"';
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
    });

    this.it('test:TSHTestCmd `This is @x`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is @x`';
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
    });

    this.it('test:TSHTestCmd \'This is {{x}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is {{x}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{x}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is {{x}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "This is {{x}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is {{x}}"';
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
    });

    this.it('test:TSHTestCmd `This is {{x}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is {{x}}`';
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

    this.it('test:TSHTestCmd stuff=x', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=x';
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
    });

    this.it('test:TSHTestCmd stuff=@x', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=@x';
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
    });

    this.it('test:TSHTestCmd stuff={{x}}', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff={{x}}';
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

    this.it('test:TSHTestCmd stuff=\'x\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'x\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('test:TSHTestCmd stuff="x"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="x"';
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
    });

    this.it('test:TSHTestCmd stuff=`x`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`x`';
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
    });

    this.it('test:TSHTestCmd stuff=\'@x\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'@x\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@x',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('test:TSHTestCmd stuff="@x"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="@x"';
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
    });

    this.it('test:TSHTestCmd stuff=`@x`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`@x`';
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
    });

    this.it('test:TSHTestCmd stuff=\'{{x}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'{{x}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{x}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{x}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="{{x}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="{{x}}"';
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

    this.it('test:TSHTestCmd stuff=`{{x}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`{{x}}`';
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

    this.it('test:TSHTestCmd stuff=\'This is x\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is x\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is x"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is x"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is x',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=`This is x`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is x`';
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
    });

    this.it('test:TSHTestCmd stuff=\'This is @x\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is @x\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @x\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is @x"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is @x"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is @x',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @x',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=`This is @x`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is @x`';

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
    });

    this.it('test:TSHTestCmd stuff=\'This is {{x}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is {{x}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{x}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is {{x}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is {{x}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is {{x}}"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is {{x}}',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 2',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=`This is {{x}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is {{x}}`';
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

    this.it('test:TSHTestCmd {{x .% #{##.00}}}', function(test, options) {

        inputVal = 'test:TSHTestCmd {{x .% #{##.00}}}';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{x .% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '2.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('test:TSHTestCmd \'{{x .% #{##.00}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'{{x .% #{##.00}}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{x .% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{x .% #{##.00}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "{{x .% #{##.00}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "{{x .% #{##.00}}}"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{x .% #{##.00}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '2.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('test:TSHTestCmd `{{x .% #{##.00}}}`', function(test, options) {
        inputVal = 'test:TSHTestCmd `{{x .% #{##.00}}}`';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{x .% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('test:TSHTestCmd stuff={{x .% #{##.00}}}', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff={{x .% #{##.00}}}';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{x .% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '2.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.it('test:TSHTestCmd stuff=\'{{x .% #{##.00}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'{{x .% #{##.00}}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{x .% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{x .% #{##.00}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="{{x .% #{##.00}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="{{x .% #{##.00}}}"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{x .% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '2.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));

    });

    this.it('test:TSHTestCmd stuff=`{{x .% #{##.00}}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`{{x .% #{##.00}}}`';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{x .% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '2',
                        'Resolved value tname', 'Number',
                        'Resolved value', 2)));
    });

    this.after(
        function() {
            //  Remove any globals that the shell put there.
            delete window.x;
            delete window.y;
            delete window.foo;
            delete window.bar;
            delete window.baz;
        });
}).skip();

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell variables',
function() {

    var inputVal,
        correctResult,
        shellDriver;

    this.before(function(suite, options) {
        inputVal = null;
        correctResult = null;

        shellDriver = TP.test.TSHDriver.construct();

        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('data setup', function(test, options) {

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        //  Merely here to shut up the test harness.
        test.assert.isTrue(true);

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('$Y', function(test, options) {

        //  Use the variable in an expression by itself

        //  Simple form
        inputVal = '$Y';
        correctResult = 100;

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

    this.it('${Y}', function(test, options) {

        //  Extended form
        inputVal = '${Y}';
        correctResult = 100;

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

    this.it('{{$Y}}', function(test, options) {

        //  Use the variable in a formatting expression by itself

        //  Simple form
        inputVal = '{{$Y}}';
        correctResult = 100;

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

    this.it('{{${Y}}}', function(test, options) {

        //  Extended form
        inputVal = '{{${Y}}}';
        correctResult = 100;

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

    this.it('\'$Y\'', function(test, options) {

        //  Use the variable in a single-quoted String expression

        //  Simple form
        inputVal = '\'$Y\'';
        correctResult = '$Y';

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

    this.it('\'${Y}\'', function(test, options) {

        //  Extended form
        inputVal = '\'${Y}\'';
        correctResult = '${Y}';

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

    this.it('"$Y"', function(test, options) {

        //  Use the variable in a double quoted String expression

        //  Simple form
        inputVal = '"$Y"';
        correctResult = '100';

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

    this.it('"${Y}"', function(test, options) {

        //  Extended form
        inputVal = '"${Y}"';
        correctResult = '100';

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

    this.it('`$Y`', function(test, options) {

        //  Use the variable in a backtick quoted String expression

        //  Simple form
        inputVal = '`$Y`';
        correctResult = 100;

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

    this.it('`${Y}`', function(test, options) {

        //  Extended form
        inputVal = '`${Y}`';
        correctResult = 100;

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

    this.it('\'This is $Y\'', function(test, options) {

        //  Use the variable with other String content in a single-quoted String
        //  expression

        //  Simple form
        inputVal = '\'This is $Y\'';
        correctResult = 'This is $Y';

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

    this.it('\'This is ${Y}\'', function(test, options) {

        //  Extended form
        inputVal = '\'This is ${Y}\'';
        correctResult = 'This is ${Y}';

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

    this.it('"This is $Y"', function(test, options) {

        //  Use the variable with other String content in a double quoted String
        //  expression

        inputVal = '"This is $Y"';
        correctResult = 'This is 100';

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

    this.it('"This is ${Y}"', function(test, options) {

        inputVal = '"This is ${Y}"';
        correctResult = 'This is 100';

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

    this.it('`This is $Y`', function(test, options) {

        //  Use the variable with other String content in a backtick quoted
        //  String expression

        inputVal = '`This is $Y`';
        correctResult = undefined;

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

    this.it('`This is ${Y}`', function(test, options) {

        inputVal = '`This is ${Y}`';
        correctResult = undefined;

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

    this.it('{{$Y .% #{##.00}}}', function(test, options) {

        //  Use the variable in a formatting expression, but since it's not in
        //  double quotes it won't do the interpolation - it will just return the
        //  value without doing the formatting

        inputVal = '{{$Y .% #{##.00}}}';
        correctResult = 100;

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

    this.it('{{${Y} .% #{##.00}}}', function(test, options) {

        inputVal = '{{${Y} .% #{##.00}}}';
        correctResult = 100;

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

    this.it('\'{{$Y .% #{##.00}}}\'', function(test, options) {

        //  Use the variable in a formatting expression, but since it's in single
        //  quotes, not in double quotes, it won't do the interpolation - it will
        //  just return the literal value of the whole expression

        inputVal = '\'{{$Y .% #{##.00}}}\'';
        correctResult = '{{$Y .% #{##.00}}}';

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

    this.it('\'{{${Y} .% #{##.00}}}\'', function(test, options) {

        inputVal = '\'{{${Y} .% #{##.00}}}\'';
        correctResult = '{{${Y} .% #{##.00}}}';

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

    this.it('"{{$Y .% #{##.00}}}"', function(test, options) {

        //  Use the variable in a formatting expression, and since it's in
        //  double quotes it will do the interpolation.

        inputVal = '"{{$Y .% #{##.00}}}"';
        correctResult = '100.00';

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

    this.it('"{{${Y} .% #{##.00}}}"', function(test, options) {

        inputVal = '"{{${Y} .% #{##.00}}}"';
        correctResult = '100.00';

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

    this.it('`{{$Y .% #{##.00}}}`', function(test, options) {

        //  Use the variable in a formatting expression, and since it's in backtick
        //  quotes it will both do the interpolation and eval the result - which
        //  gives it back the number 2.

        inputVal = '`{{$Y .% #{##.00}}}`';
        correctResult = 100;

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

    this.it('`{{${Y} .% #{##.00}}}`', function(test, options) {

        inputVal = '`{{${Y} .% #{##.00}}}`';
        correctResult = 100;

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

    this.it('test:TSHTestCmd $Y', function(test, options) {

        inputVal = 'test:TSHTestCmd $Y';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd ${Y}', function(test, options) {

        inputVal = 'test:TSHTestCmd ${Y}';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '${Y}',
                        'Expanded value tname', 'Number',
                        'Expanded value', 100,
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd @$Y', function(test, options) {

        inputVal = 'test:TSHTestCmd @$Y';
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
    });

    this.it('test:TSHTestCmd @${Y}', function(test, options) {

        inputVal = 'test:TSHTestCmd @${Y}';
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
    });

    this.it('test:TSHTestCmd {{$Y}}', function(test, options) {

        inputVal = 'test:TSHTestCmd {{$Y}}';
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
    });

    this.it('test:TSHTestCmd {{${Y}}}', function(test, options) {

        inputVal = 'test:TSHTestCmd {{${Y}}}';
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

    this.it('test:TSHTestCmd \'$Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'$Y\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd \'${Y}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'${Y}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '${Y}',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd "$Y"', function(test, options) {

        inputVal = 'test:TSHTestCmd "$Y"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"$Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd "${Y}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "${Y}"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd `$Y`', function(test, options) {

        inputVal = 'test:TSHTestCmd `$Y`';
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
    });

    this.it('test:TSHTestCmd `${Y}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `${Y}`';
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
    });

    this.it('test:TSHTestCmd \'@$Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'@$Y\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd \'@${Y}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'@${Y}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@${Y}',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd "@$Y"', function(test, options) {

        inputVal = 'test:TSHTestCmd "@$Y"';
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
    });

    this.it('test:TSHTestCmd "@${Y}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "@${Y}"';
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
    });

    this.it('test:TSHTestCmd `@$Y`', function(test, options) {

        inputVal = 'test:TSHTestCmd `@$Y`';
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
    });

    this.it('test:TSHTestCmd `@${Y}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `@${Y}`';
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
    });

    this.it('test:TSHTestCmd \'{{$Y}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'{{$Y}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{$Y}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{$Y}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd \'{{${Y}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'{{${Y}}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{${Y}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{${Y}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "{{$Y}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "{{$Y}}"';
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
    });

    this.it('test:TSHTestCmd "{{${Y}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "{{${Y}}}"';
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
    });

    this.it('test:TSHTestCmd `{{$Y}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `{{$Y}}`';
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
    });

    this.it('test:TSHTestCmd `{{${Y}}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `{{${Y}}}`';
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

    this.it('test:TSHTestCmd \'This is $Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is $Y\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is $Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is $Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd \'This is ${Y}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is ${Y}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is ${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is ${Y}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "This is $Y"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is $Y"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is $Y"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "This is ${Y}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is ${Y}"';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"This is ${Y}"',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd `This is $Y`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is $Y`';
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
    });

    this.it('test:TSHTestCmd `This is ${Y}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is ${Y}`';
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
    });

    this.it('test:TSHTestCmd \'This is @$Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is @$Y\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @$Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd \'This is @$Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is @${Y}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @${Y}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "This is @$Y"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is @$Y"';
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
    });

    this.it('test:TSHTestCmd "This is @${Y}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is @${Y}"';
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
    });

    this.it('test:TSHTestCmd `This is @$Y`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is @$Y`';
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
    });

    this.it('test:TSHTestCmd `This is @${Y}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is @${Y}`';
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
    });

    this.it('test:TSHTestCmd \'This is {{$Y}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is {{$Y}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{$Y}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is {{$Y}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd \'This is {{${Y}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'This is {{${Y}}}\'';
        shellDriver.execOutputTest(
            test,
            inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{${Y}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is {{${Y}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "This is {{$Y}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is {{$Y}}"';
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
    });

    this.it('test:TSHTestCmd "This is {{${Y}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "This is {{${Y}}}"';
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
    });

    this.it('test:TSHTestCmd `This is {{$Y}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is {{$Y}}`';
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
    });

    this.it('test:TSHTestCmd `This is {{${Y}}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `This is {{${Y}}}`';
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

    this.it('test:TSHTestCmd {{$Y .% #{##.00}}}', function(test, options) {

        inputVal = 'test:TSHTestCmd {{$Y .% #{##.00}}}';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{$Y .% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd {{${Y} .% #{##.00}}}', function(test, options) {

        inputVal = 'test:TSHTestCmd {{${Y} .% #{##.00}}}';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{${Y} .% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd \'{{$Y .% #{##.00}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'{{$Y .% #{##.00}}}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{$Y .% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{$Y .% #{##.00}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd \'{{${Y} .% #{##.00}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd \'{{${Y} .% #{##.00}}}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{${Y} .% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{${Y} .% #{##.00}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd "{{$Y .% #{##.00}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "{{$Y .% #{##.00}}}"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{$Y .% #{##.00}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd "{{${Y} .% #{##.00}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd "{{${Y} .% #{##.00}}}"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '"{{${Y} .% #{##.00}}}"',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd `{{$Y .% #{##.00}}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `{{$Y .% #{##.00}}}`';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{$Y .% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd `{{${Y} .% #{##.00}}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd `{{${Y} .% #{##.00}}}`';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'ARG0',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{${Y} .% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff=$Y', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=$Y';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff=${Y}', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=${Y}';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '${Y}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff=@$Y', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=@$Y';
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
    });

    this.it('test:TSHTestCmd stuff=@${Y}', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=@${Y}';
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
    });

    this.it('test:TSHTestCmd stuff={{$Y}}', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff={{$Y}}';
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
    });

    this.it('test:TSHTestCmd stuff={{${Y}}}', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff={{${Y}}}';
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

    this.it('test:TSHTestCmd stuff=\'$Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'$Y\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff=\'${Y}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'${Y}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '${Y}',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff="$Y"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="$Y"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '$Y',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff="${Y}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="${Y}"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '${Y}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff=`$Y`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`$Y`';
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
    });

    this.it('test:TSHTestCmd stuff=`${Y}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`${Y}`';
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
    });

    this.it('test:TSHTestCmd stuff=\'@$Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'@$Y\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@$Y',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff=\'@${Y}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'@${Y}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'@${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '@${Y}',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff="@$Y"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="@$Y"';
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
    });

    this.it('test:TSHTestCmd stuff="@${Y}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="@${Y}"';
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
    });

    this.it('test:TSHTestCmd stuff=`@$Y`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`@$Y`';
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
    });

    this.it('test:TSHTestCmd stuff=`@${Y}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`@${Y}`';
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
    });

    this.it('test:TSHTestCmd stuff=\'{{$Y}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'{{$Y}}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{$Y}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{$Y}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=\'{{${Y}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'{{${Y}}}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{${Y}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{${Y}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="{{$Y}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="{{$Y}}"';
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
    });

    this.it('test:TSHTestCmd stuff="{{${Y}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="{{${Y}}}"';
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

    this.it('test:TSHTestCmd stuff=`{{$Y}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`{{$Y}}`';
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
    });

    this.it('test:TSHTestCmd stuff=`{{${Y}}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`{{${Y}}}`';
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

    this.it('test:TSHTestCmd stuff=\'This is $Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is $Y\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is $Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is $Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=\'This is ${Y}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is ${Y}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is ${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is ${Y}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is $Y"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is $Y"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is $Y',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is ${Y}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is ${Y}"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is ${Y}',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=`This is $Y`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is $Y`';
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
    });

    this.it('test:TSHTestCmd stuff=`This is ${Y}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is ${Y}`';
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
    });

    this.it('test:TSHTestCmd stuff=\'This is @$Y\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is @$Y\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @$Y\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @$Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=\'This is @${Y}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is @${Y}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is @${Y}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @${Y}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is @$Y"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is @$Y"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is @$Y',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @$Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is @${Y}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is @${Y}"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is @${Y}',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is @$Y',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=`This is @$Y`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is @$Y`';
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
    });

    this.it('test:TSHTestCmd stuff=`This is @${Y}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is @${Y}`';
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
    });

    this.it('test:TSHTestCmd stuff=\'This is {{$Y}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is {{$Y}}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{$Y}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is {{$Y}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=\'This is {{${Y}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'This is {{${Y}}}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'This is {{${Y}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is {{${Y}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is {{$Y}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is {{$Y}}"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is {{$Y}}',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="This is {{${Y}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="This is {{${Y}}}"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', 'This is {{${Y}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', 'This is 100',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff=`This is {{$Y}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is {{$Y}}`';
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
    });

    this.it('test:TSHTestCmd stuff=`This is {{${Y}}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`This is {{${Y}}}`';
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

    this.it('test:TSHTestCmd stuff={{$Y .% #{##.00}}}', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff={{$Y .% #{##.00}}}';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{$Y .% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff=\'{{$Y .% #{##.00}}}\'', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=\'{{$Y .% #{##.00}}}\'';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'{{$Y .% #{##.00}}}\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '{{$Y .% #{##.00}}}',
                        'Resolved value tname', 'Undefined',
                        'Resolved value', TP.UNDEF)));
    });

    this.it('test:TSHTestCmd stuff="{{$Y .% #{##.00}}}"', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff="{{$Y .% #{##.00}}}"';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '{{$Y .% #{##.00}}}',
                        'Expanded value tname', 'String',
                        'Expanded value', '100.00',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.it('test:TSHTestCmd stuff=`{{$Y .% #{##.00}}}`', function(test, options) {

        inputVal = 'test:TSHTestCmd stuff=`{{$Y .% #{##.00}}}`';
        shellDriver.execOutputTest(
            test, inputVal,
            TP.hc(
                'stuff',
                TP.hc('Original value tname', 'String',
                        'Original value', '`{{$Y .% #{##.00}}}`',
                        'Expanded value tname', 'String',
                        'Expanded value', '100',
                        'Resolved value tname', 'Number',
                        'Resolved value', 100)));
    });

    this.after(
        function() {
            //  Remove any globals that the shell put there.
            delete window.x;
            delete window.y;
            delete window.foo;
            delete window.bar;
            delete window.baz;
        });
}).skip();

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell TIBET URN, JS URI, TIBET URL',
function() {

    var inputVal,
        correctResult,
        shellDriver;

    this.before(function(suite, options) {
        var win,
            doc,

            backgroundElem,
            childElem;

        shellDriver = TP.test.TSHDriver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        //  ---

        //  Set up a temporary reference to the top-level window path
        TP.$$topWindowPath = TP.sys.cfg('tibet.top_win_path');

        //  Draw some test content into the current UI canvas.
        TP.$$uiCanvasName = TP.sys.cfg('tibet.uicanvas');
        win = TP.win(TP.$$uiCanvasName);
        if (!TP.isWindow(win)) {
            //  Couldn't find the window - fail the request and return
            this.fail(
                TP.sc('Couldn\'t find window named "', TP.$$uiCanvasName));

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

        inputVal =
            'x = 2 .; :set y 100 .; foo = undefined .; bar = null .; baz = 42';

        //  Merely here to shut up the test harness.
        test.assert.isTrue(true);

        shellDriver.execShellTest(test, inputVal);
    });

    this.it('urn:tibet:TP', function(test, options) {

        inputVal = 'urn:tibet:TP';
        correctResult = TP;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet:///urn:tibet:TP', function(test, options) {

        inputVal = 'tibet:///urn:tibet:TP';
        correctResult = TP;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('urn:tibet:TP.sig.Signal', function(test, options) {

        inputVal = 'urn:tibet:TP.sig.Signal';
        correctResult = TP.sig.Signal;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet:///urn:tibet:TP.sig.Signal', function(test, options) {

        inputVal = 'tibet:///urn:tibet:TP.sig.Signal';
        correctResult = TP.sig.Signal;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('urn:tibet:FOO', function(test, options) {

        var foo;

        foo = TP.ac(1, 2, 3);
        TP.sys.registerObject(foo, 'FOO', true);

        inputVal = 'urn:tibet:FOO';
        correctResult = foo;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet:///urn:tibet:FOO', function(test, options) {

        var foo;

        foo = TP.ac(1, 2, 3);
        TP.sys.registerObject(foo, 'FOO', true);

        inputVal = 'tibet:///urn:tibet:FOO';
        correctResult = foo;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas/', function(test, options) {

        inputVal = 'tibet://uicanvas/';
        correctResult = TP.sys.getUICanvas();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://uicanvas';
        correctResult = TP.sys.getUICanvas();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas/#document', function(test, options) {

        inputVal = 'tibet://uicanvas/#document';
        correctResult = TP.sys.getUICanvas().getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas#document', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://uicanvas#document';
        correctResult = TP.sys.getUICanvas().getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('#document', function(test, options) {

        //  The 'tibet://uicanvas' should be optional
        inputVal = '#document';
        correctResult = TP.sys.getUICanvas().getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://UIROOT/', function(test, options) {

        inputVal = 'tibet://UIROOT/';
        correctResult = TP.core.Window.construct('UIROOT');

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://UIROOT', function(test, options) {

        //  The last slash should be optional

        inputVal = 'tibet://UIROOT';
        correctResult = TP.core.Window.construct('UIROOT');

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://UIROOT/#document', function(test, options) {

        inputVal = 'tibet://UIROOT/#document';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://UIROOT#document', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://UIROOT#document';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://UIROOT/future_path/', function(test, options) {

        inputVal = 'tibet://UIROOT/future_path/';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://UIROOT/future_path', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://UIROOT/future_path';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://UIROOT/future_path/#document', function(test, options) {

        inputVal = 'tibet://UIROOT/future_path/#document';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://UIROOT/future_path#document', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://UIROOT/future_path#document';
        correctResult = TP.core.Window.construct('UIROOT').getDocument();

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult,
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas/#top_background', function(test, options) {

        inputVal = 'tibet://uicanvas/#top_background';
        correctResult = TP.byId('top_background', test.getDriver().get('windowContext'), false);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas#top_background', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://uicanvas#top_background';
        correctResult = TP.byId('top_background', test.getDriver().get('windowContext'), false);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('#top_background', function(test, options) {

        //  The 'tibet://uicanvas' should be optional
        inputVal = '#top_background';
        correctResult = TP.byId('top_background', test.getDriver().get('windowContext'), false);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas/#element(/1/2)', function(test, options) {

        inputVal = 'tibet://uicanvas/#element(/1/2)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas#element(/1/2)', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://uicanvas#element(/1/2)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('#element(/1/2)', function(test, options) {

        //  The 'tibet://uicanvas' should be optional
        inputVal = '#element(/1/2)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas/#element(top_background/1)', function(test, options) {

        inputVal = 'tibet://uicanvas/#element(top_background/1)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background', test.getDriver().get('windowContext'), false), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas#element(top_background/1)', function(test, options) {

        inputVal = 'tibet://uicanvas#element(top_background/1)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background', test.getDriver().get('windowContext'), false), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('#element(top_background/1)', function(test, options) {

        //  The 'tibet://uicanvas/' should be optional
        inputVal = '#element(top_background/1)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background', test.getDriver().get('windowContext'), false), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas/#xpath1(/$def:html/$def:body)', function(test, options) {

        inputVal = 'tibet://uicanvas/#xpath1(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas#xpath1(/$def:html/$def:body)', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://uicanvas#xpath1(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('#xpath1(/$def:html/$def:body)', function(test, options) {

        //  The 'tibet://uicanvas/' should be optional
        inputVal = '#xpath1(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas/#xpointer(/$def:html/$def:body)', function(test, options) {

        inputVal = 'tibet://uicanvas/#xpointer(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas#xpointer(/$def:html/$def:body)', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://uicanvas#xpointer(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('#xpointer(/$def:html/$def:body)', function(test, options) {

        //  The 'tibet://uicanvas/' should be optional
        inputVal = '#xpointer(/$def:html/$def:body)';
        correctResult = TP.sys.getUICanvas().getNativeDocument().body;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas/#css(#top_background > *:first-child)', function(test, options) {

        inputVal = 'tibet://uicanvas/#css(#top_background > *:first-child)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background', test.getDriver().get('windowContext'), false), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('tibet://uicanvas#css(#top_background > *:first-child)', function(test, options) {

        //  The last slash should be optional
        inputVal = 'tibet://uicanvas#css(#top_background > *:first-child)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background', test.getDriver().get('windowContext'), false), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.it('#css(#top_background > *:first-child)', function(test, options) {

        //  The 'tibet://uicanvas/' should be optional
        inputVal = '#css(#top_background > *:first-child)';
        correctResult = TP.nodeGetChildElementAt(TP.byId('top_background', test.getDriver().get('windowContext'), false), 0);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isIdenticalTo(
                    testResult.getNativeNode(),
                    correctResult,
                    TP.join('"', inputVal, '"',
                            ' produced: "', testResult, '"',
                            ' should be: "', correctResult, '".'));
            });
    });

    this.after(
        function() {
            var backgroundElem;

            //  Set up a temporary reference to the top-level window name
            delete TP.$$topWindowPath;
            delete TP.$$uiCanvasName;

            backgroundElem = TP.byId('top_background', this.getDriver().get('windowContext'), false);
            TP.nodeDetach(backgroundElem);

            //  Remove any globals that the shell put there.
            delete window.x;
            delete window.y;
            delete window.foo;
            delete window.bar;
            delete window.baz;
        });
});

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell HTTP URL',
function() {

    var shellDriver,

        oldNeedsPrivileges,
        server;

    this.before(function(suite, options) {
        shellDriver = TP.test.TSHDriver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        //  NB: We have to redefine TP.uriNeedsPrivileges() here to just return
        //  false or otherwise TIBET itself will reject the following requests
        //  as being 'cross-domain'. We'll put it back in the 'after()' handler.
        oldNeedsPrivileges = TP.uriNeedsPrivileges;
        TP.uriNeedsPrivileges =
            function() {
                return false;
            };

        server = TP.test.fakeServer.create();
    });

    //  NOTE: These tests are coded so that a) the scheme (required by TSH to
    //  discern that it is a URI and not a RegExp) is hardcoded to be 'http://'
    //  (because that's what we're testing) and b) it has a nonsense domain that
    //  Sinon will *not* try to relativize against the domain we loaded from.

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
                        testResult.get('html|body'),
                        resultElem.get('html|body'));

                TP.uc(locStr).unregister();
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
        //  method here and don't allow TIBET to choose the method based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --method="put"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

                TP.uc(locStr).unregister();
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
        //  method here and don't allow TIBET to choose the method based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --method="post"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

                TP.uc(locStr).unregister();
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
        //  method here and don't allow TIBET to choose the method based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.asSource() + ' .>! ' + locStr +
                    ' --method="post"' +
                    ' --mimetype="application/x-www-form-urlencoded"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

                TP.uc(locStr).unregister();
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
        //  method here and don't allow TIBET to choose the method based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.asSource() + ' .>! ' + locStr +
                    ' --method="post"' +
                    ' --mimetype="multipart/form-data"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

                TP.uc(locStr).unregister();
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
        //  method here and don't allow TIBET to choose the method based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.asXMLString().quoted() + ' .>! ' + locStr +
                    ' --method="post"' +
                    ' --mimetype="multipart/form-data"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

                TP.uc(locStr).unregister();
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
        //  method here and don't allow TIBET to choose the method based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.asSource() + ' .>! ' + locStr +
                    ' --method="post"' +
                    ' --mimetype="multipart/related"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.it('Shell HTTP URL: Delete resource using DELETE', function(test, options) {

        var locStr,
            testBody,

            testResponse,

            inputVal;

        locStr = 'http://www.foo.com/TIBET_endpoints/HTTP_DELETE_TEST';
        testBody = 'DELETE test content';
        testResponse = 'OK from DELETE';

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
                    testResponse);
            });

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  method here and don't allow TIBET to choose the method based on its
        //  criteria, because we want to force the test above.
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --method="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                test.assert.isEqualTo(TP.str(testResult), testResponse);

                //  TODO: Fix when we fix tsh:uri subrequests

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.after(function(suite, options) {

        server.restore();
        TP.uriNeedsPrivileges = oldNeedsPrivileges;
    });
}).skip(!TP.sys.isHTTPBased());

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell JSONP URL',
function() {

    var shellDriver,
        stub;

    this.before(function(suite, options) {

        shellDriver = TP.test.TSHDriver.construct();
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

        //  Merely here to shut up the test harness.
        test.assert.isTrue(true);

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                //  TODO: Fix when we fix tsh:uri subrequests

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.after(function(suite, options) {

        stub.restore();
    });
});

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell LOCALDB URL',
function() {

    var shellDriver,
        storage;

    //  Make sure there's an entry for 'localdb://' URL testing
    storage = TP.core.LocalStorage.construct();

    this.before(function(suite, options) {
        var storageStr;

        shellDriver = TP.test.TSHDriver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        storageStr = TP.js2json(
            {
                local_test: {
                    author_info: {
                        _id: 'author_info',
                        _date_created: TP.dc(),
                        _date_modified: TP.dc(),
                        _body: {
                            firstName: 'Bill',
                            lastName: 'Edney'
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

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.it('Shell LOCALDB URL: Retrieve resource info', function(test, options) {

        var locStr,

            inputVal;

        locStr = 'localdb://local_test/author_info';

        inputVal = locStr + ' -refresh --method="head"';

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

                TP.uc(locStr).unregister();
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

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.it('Shell LOCALDB URL: Set resource using PUT (supplied id means UPDATE if found)', function(test, options) {

        var locStr,
            testBody,

            inputVal;

        //  A PUT request here using the ID causes an UPDATE
        locStr = 'localdb://local_test/author_info';

        testBody = TP.hc('firstName', 'November', 'lastName', 'Jones');

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  method here since the default for localdb: URLs is POST.
        inputVal = testBody.asSource() + ' .>! ' + locStr + ' --method="put"';

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
                        'November',
                        TP.sc('Expected: ', '"November"',
                                ' and got instead: ', obj.at('firstName'), '.'));

                test.assert.isTrue(
                    obj.hasKey('lastName'),
                    TP.sc('Expected that result would have a key of \'lastName\' and',
                            ' it doesn\'t'));

                test.assert.isEqualTo(
                        obj.at('lastName'),
                        'Jones',
                        TP.sc('Expected: ', '"Jones"',
                                ' and got instead: ', obj.at('lastName'), '.'));

                TP.uc(locStr).unregister();
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

        testBody = TP.hc('firstName', 'John', 'lastName', 'Smith');

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

        test.chain(
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
                                'John',
                                TP.sc('Expected: ', '"John"',
                                        ' and got instead: ', obj.at('firstName'), '.'));

                        test.assert.isTrue(
                            obj.hasKey('lastName'),
                            TP.sc('Expected that result would have a key of \'lastName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                                obj.at('lastName'),
                                'Smith',
                                TP.sc('Expected: ', '"Smith"',
                                        ' and got instead: ', obj.at('lastName'), '.'));

                        TP.uc(locStr).unregister();
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
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --method="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isValid(
                    testResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));

                TP.uc(locStr).unregister();
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
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --method="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                test.assert.isValid(
                    testResult.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.after(function(suite, options) {

        storage.removeKey(TP.LOCALSTORAGE_DB_NAME);
    });
});

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell POUCHDB URL',
function() {

    var shellDriver,
        testDb;

    this.before(function(suite, options) {

        shellDriver = TP.test.TSHDriver.construct();
        this.get('drivers').atPut('shell', shellDriver);

        //  'this' refers to the suite here.
        suite.chain(
            function() {
                var now,

                    pouchPromise,
                    promise;

                now = Date.now();

                testDb = new TP.extern.PouchDB('pouch_test');

                pouchPromise = testDb.put(
                    {
                        _id: 'author_info',
                        date_created: now,
                        date_modified: now,
                        body: {
                            firstName: 'Bill',
                            lastName: 'Edney'
                        }
                    });

                promise = TP.extern.Promise.resolve(pouchPromise);

                return promise;
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

                //  The test result is a TP.core.JSONContent object
                obj = TP.hc(testResult.get('data')).at('body');

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

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.it('Shell POUCHDB URL: Retrieve resource info', function(test, options) {

        var locStr,

            inputVal;

        locStr = 'pouchdb://pouch_test/author_info';

        inputVal = locStr + ' -refresh --method="head"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {

                var obj;

                //  The test result is a TP.core.JSONContent object
                obj = TP.hc(testResult.get('data'));

                test.assert.isTrue(
                    obj.hasKey('date_created'),
                    TP.sc('Expected that result would have a key of',
                            ' \'date_created\' and it doesn\'t'));

                test.assert.isTrue(
                    obj.hasKey('date_modified'),
                    TP.sc('Expected that result would have a key of',
                            ' \'date_modified\' and it doesn\'t'));

                TP.uc(locStr).unregister();
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

                var obj;

                //  The test result is a TP.core.JSONContent object
                obj = TP.hc(testResult.get('data'));

                test.assert.isTrue(
                    obj.hasKey('total_rows'),
                    TP.sc('Expected that result would have a key of \'total_rows\' and',
                            ' it doesn\'t'));

                test.assert.isEqualTo(
                    obj.at('total_rows'),
                    1,
                    TP.sc('Expected: ', '1',
                            ' and got instead: ', testResult.at('total_rows'), '.'));

                test.assert.isTrue(
                    obj.hasKey('rows'),
                    TP.sc('Expected that result would have a key of \'rows\' and',
                            ' it doesn\'t'));

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.it('Shell POUCHDB URL: Set resource using PUT (supplied id means UPDATE if found)', function(test, options) {

        var locStr,

            testBody,
            inputVal;

        locStr = 'pouchdb://pouch_test/author_info';

        testBody = TP.hc('firstName', 'November', 'lastName', 'Jones');

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'. Also, we specify the
        //  method here since the default for pouchdb: URLs is POST.
        inputVal = testBody.asSource() + ' .>! ' + locStr + ' --method="put"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                var obj;

                //  The test result is a TP.core.JSONContent object
                obj = TP.hc(testResult.get('data'));

                test.assert.isValid(
                    obj.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));
            });

        test.chain(
            function() {
                shellDriver.execShellTest(
                    test,
                    'pouchdb://pouch_test/author_info' + ' -refresh',
                    function(testResult) {
                        var obj;

                        //  The test result is a TP.core.JSONContent object
                        obj = TP.hc(testResult.get('data'));

                        test.assert.isTrue(
                            obj.hasKey('firstName'),
                            TP.sc('Expected that result would have a key of \'firstName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                            obj.at('firstName'),
                            'November',
                            TP.sc('Expected: ', '"November"',
                                    ' and got instead: ', testResult.at('firstName'), '.'));

                        test.assert.isTrue(
                            obj.hasKey('lastName'),
                            TP.sc('Expected that result would have a key of \'lastName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                            obj.at('lastName'),
                            'Jones',
                            TP.sc('Expected: ', '"Jones"',
                                    ' and got instead: ', testResult.at('lastName'), '.'));

                        TP.uc(locStr).unregister();
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

        testBody = TP.hc('firstName', 'John', 'lastName', 'Smith');

        //  Note here how we use '!' on the end of the redirect to make sure
        //  that TIBET flushes changes to the 'server'.
        inputVal = testBody.asSource() + ' .>! ' + locStr;

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                var obj;

                //  The test result is a TP.core.JSONContent object
                obj = TP.hc(testResult.get('data'));

                test.assert.isValid(
                    obj.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));

                saveID = obj.at('id');
            });

        test.chain(
            function() {
                shellDriver.execShellTest(
                    test,
                    'pouchdb://pouch_test/' + saveID + ' -refresh',
                    function(testResult) {
                        var obj;

                        //  The test result is a TP.core.JSONContent object
                        obj = TP.hc(testResult.get('data'));

                        test.assert.isTrue(
                            obj.hasKey('firstName'),
                            TP.sc('Expected that result would have a key of \'firstName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                            obj.at('firstName'),
                            'John',
                            TP.sc('Expected: ', '"John"',
                                    ' and got instead: ', testResult.at('firstName'), '.'));

                        test.assert.isTrue(
                            obj.hasKey('lastName'),
                            TP.sc('Expected that result would have a key of \'lastName\' and',
                                    ' it doesn\'t'));

                        test.assert.isEqualTo(
                            obj.at('lastName'),
                            'Smith',
                            TP.sc('Expected: ', '"Smith"',
                                    ' and got instead: ', testResult.at('lastName'), '.'));

                        TP.uc(locStr).unregister();
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
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --method="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                var obj;

                //  The test result is a TP.core.JSONContent object
                obj = TP.hc(testResult.get('data'));

                test.assert.isValid(
                    obj.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));

                TP.uc(locStr).unregister();
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
        inputVal = testBody.quoted() + ' .>! ' + locStr + ' --method="delete"';

        shellDriver.execShellTest(
            test,
            inputVal,
            function(testResult) {
                var obj;

                //  The test result is a TP.core.JSONContent object
                obj = TP.hc(testResult.get('data'));

                test.assert.isValid(
                    obj.at('ok'),
                    TP.sc('Expected a result with an \'ok\' property'));

                TP.uc(locStr).unregister();
            });
    });

    //  ---

    this.after(function(suite, options) {

        //  'this' refers to the suite here.
        suite.chain(
            function() {
                var pouchPromise,
                    promise;

                pouchPromise = testDb.destroy();

                promise = TP.extern.Promise.resolve(pouchPromise);

                return promise;
            });
    });
});

//  ------------------------------------------------------------------------

TP.shell.TSH.Type.describe('Shell Piping',
function() {

    var inputVal,
        correctResult,
        shellDriver;

    this.before(function(suite, options) {
        inputVal = null;
        correctResult = null;
        shellDriver = TP.test.TSHDriver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    //  ---

    this.it('Shell Piping: number to simple format', function(test, options) {

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

        inputVal = 'z = 1; z .| \'The number is: {{value .% #{##.00}}}\'';
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

    this.after(
        function() {
            //  Remove any globals that the shell put there.
            delete window.z;
        });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
