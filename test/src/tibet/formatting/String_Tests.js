//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

String.Inst.describe('format',
function() {

    this.it('String \'format\' method using character substitution', function(test, options) {

        var testRep,
            correctRep;

        testRep = '4582022'.format('@{@@@-@@@@}');
        correctRep = '458-2022';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    this.it('String \'format\' method using numeric substitution', function(test, options) {

        var testRep,
            correctRep;

        //  ---

        testRep = '123.45'.format('#{###.##}');
        correctRep = '123.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123.456'.format('#{###.##}');
        correctRep = '123.46';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '9123.45'.format('#{###.##}');
        correctRep = '9123.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123'.format('#{###.##}');
        correctRep = '123.';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123.'.format('#{###.##}');
        correctRep = '123.';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        /* eslint-disable no-extra-parens */
        testRep = (123.0).format('#{###.##}');
        /* eslint-enable no-extra-parens */
        correctRep = '123.';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '.45'.format('#{###.##}');
        correctRep = '.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '0.45'.format('#{###.##}');
        correctRep = '.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123.55'.format('#{###}');
        correctRep = '124';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123.45'.format('#{000.00}');
        correctRep = '123.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123.456'.format('#{000.00}');
        correctRep = '123.46';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '9123.456'.format('#{000.00}');
        correctRep = '9123.46';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123'.format('#{000.00}');
        correctRep = '123.00';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123.4'.format('#{000.00}');
        correctRep = '123.40';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '.45'.format('#{000.00}');
        correctRep = '000.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '0.45'.format('#{000.00}');
        correctRep = '000.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '12.34'.format('#{000.00}');
        correctRep = '012.34';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123'.format('#{???.??}');
        correctRep = '123.  ';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '123.4'.format('#{???.??}');
        correctRep = '123.4 ';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '.45'.format('#{???.??}');
        correctRep = '   .45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '0.45'.format('#{???.??}');
        correctRep = '   .45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '12.34'.format('#{???.??}');
        correctRep = ' 12.34';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  The format doesn't really matter for thousands grouping - the comma
        //  (',') turns it on and the Number/locale types handle it from there

        testRep = '9123.45'.format('#{#,###.##}');
        correctRep = '9,123.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '9123.45'.format('#{###,#.##}');
        correctRep = '9,123.45';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    this.it('String \'format\' method using keyed substitution', function(test, options) {

        var testRep,
            correctRep;

        //  ---

        //  Using a local hash - key has String value
        testRep = ''.format('%{aKey}', TP.hc('aKey', 32));
        correctRep = '32';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  Using a local hash - key has Function value
        testRep = ''.format('Bill says: %{aKey}',
                            TP.hc('aKey',
                                    function() {
                                        return 'hi there';
                                    }));
        correctRep = 'Bill says: hi there';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  Using a local hash - key has Function value that takes a param - the
        //  value being formatted
        testRep = 'Bill'.format('What\'s your name? %{aKey}',
                TP.hc('aKey',
                        function(item) {
                            return 'My name is: ' + item;
                        }));

        correctRep = 'What\'s your name? My name is: Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });
});

//  ------------------------------------------------------------------------

String.Inst.describe('transform',
function() {

    this.it('String \'transform\' method using Strings', function(test, options) {

        var testRep,
            correctRep;

        //  ---

        testRep = '@{@@@-@@@@}'.transform('4582022');
        correctRep = '458-2022';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '#{##.00}'.transform('27');
        correctRep = '27.00';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'Hi there {{firstName}}'.transform(
                                            TP.hc('firstName', 'Bill'));
        correctRep = 'Hi there Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = '%{d}'.transform(TP.dc(), Date.LOCALTIME_TOKENS);
        correctRep = TP.dc().getDayOfMonth().toString();

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'My age is: %{aKey}'.transform(null, TP.hc('aKey', 32));
        correctRep = 'My age is: 32';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    this.it('String \'transform\' method using Functions', function(test, options) {

        var testRep,
            correctRep;

        //  ---

        /* eslint-disable no-extra-parens */
        testRep = (function(object, formatParams) {
            return 'Your name is: ' + object.at('firstName');
        }).transform(TP.hc('firstName', 'Bill'));
        /* eslint-enable no-extra-parens */

        correctRep = 'Your name is: Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'Bill says: %{aKey}'.transform(
                        null,
                        TP.hc('aKey',
                                function() {
                                    return 'hi there';
                                }));

        correctRep = 'Bill says: hi there';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'What\'s your name? %{aKey}'.transform(
                    'Bill', TP.hc('aKey',
                                    function(item) {
                                        return 'My name is: ' + item;
                                    }));
        correctRep = 'What\'s your name? My name is: Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    this.it('String \'transform\' method using Objects', function(test, options) {

        var testRep,
            correctRep,

            dayOnlyDateFormatter,

            newObj;

        //  ---

        dayOnlyDateFormatter = TP.lang.Object.construct();
        dayOnlyDateFormatter.defineMethod(
                'transformDate',
                function(aDate, formatParams) {
                    return aDate.getDate();
                });

        testRep = dayOnlyDateFormatter.transform(TP.dc());
        correctRep = TP.dc().getDayOfMonth();

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        newObj = TP.lang.Object.construct();
        newObj.defineAttribute('firstName');

        newObj.set('firstName', 'Scott');

        testRep = 'Hi there {{firstName}}'.transform(newObj);
        correctRep = 'Hi there Scott';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        newObj = TP.lang.Object.construct();
        newObj.defineAttribute('firstName');

        newObj.set('firstName', 'Scott');

        newObj.defineMethod('getFirstName',
                                function() {
                                    return 'Rob';
                                });

        testRep = 'Hi there {{firstName}}'.transform(newObj);
        correctRep = 'Hi there Rob';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    this.it('String \'transform\' method using nested substitutions', function(test, options) {

        var testRep,
            correctRep,

            myElem;

        //  ---

        testRep = 'Your name title cased is: {{value.%startUpper}}'.transform('bill');

        correctRep = 'Your name title cased is: Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'Your name title cased is: {{.%startUpper}}'.transform('bill');

        correctRep = 'Your name title cased is: Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  Spaces on either side of the formatting separator
        testRep = 'Your name title cased is: {{value .% startUpper}}'.transform('bill');

        correctRep = 'Your name title cased is: Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  Spaces on the back side of the formatting separator
        testRep = 'Your name title cased is: {{.% startUpper}}'.transform('bill');

        correctRep = 'Your name title cased is: Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'Hi there {{firstName}}. Your number is: {{phone.%@{@@@-@@@@}}}'.transform(TP.hc('firstName', 'Bill', 'phone', '4582022'));

        correctRep = 'Hi there Bill. Your number is: 458-2022';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        myElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        //  ---

        'The element with a bar attribute is: {{./*[@bar].%String}}'.compile('xmlTemplate', true);

        testRep = myElem.as('xmlTemplate');

        correctRep = 'The element with a bar attribute is: <baz bar="moo"/>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  The 'true' flag here flushes the template cache and forces redefinition
        'The name of the element with a bar attribute is: {{./*[@bar].%{{localName}}}}'.compile('xmlTemplate', true);

        testRep = myElem.as('xmlTemplate');

        correctRep = 'The name of the element with a bar attribute is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'hi: {{foo.%escapedHTML}}'.transform(TP.hc('foo', '<bar/>'));

        correctRep = 'hi: &lt;bar/&gt;';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'hi: {{foo.%escapedXML}}'.transform(TP.hc('foo', '<bar/>'));

        correctRep = 'hi: &lt;bar/&gt;';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = TP.ac(1, 2, 'that\'s cool').format('The list is {{value.%*html:ul}}');
        correctRep = 'The list is <html:ul><html:li>1</html:li><html:li>2</html:li><html:li>that\'s cool</html:li></html:ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  Spaces on either side of the formatting separator
        testRep = TP.ac(1, 2, 'that\'s cool').format('The list is {{value .%* html:ul}}');
        correctRep = 'The list is <html:ul><html:li>1</html:li><html:li>2</html:li><html:li>that\'s cool</html:li></html:ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    this.it('String \'transform\' method with escaped expressions', function(test, options) {

        var testRep,
            correctRep,

            myElem,

            templateStr;

        //  ---

        //  Escaped expressions

        testRep = 'Hi there \\{{firstName\\}}'.transform(TP.hc('firstName', 'Bill'));
        correctRep = 'Hi there {{firstName}}';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'Hi there {{firstName}}. Your number is: \\{{phone.%@{@@@-@@@@}\\}}'.transform(TP.hc('firstName', 'Bill', 'phone', '4582022'));

        correctRep = 'Hi there Bill. Your number is: {{phone.%@{@@@-@@@@}}}';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        myElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        //  ---

        //  The 'true' flag here flushes the template cache and forces redefinition
        'The name of the element with a bar attribute is: {{./*[@bar].%\\{{localName\\}}}}'.compile('xmlTemplate', true);

        testRep = myElem.as('xmlTemplate');

        correctRep = 'The name of the element with a bar attribute is: {{localName}}';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = 'hi: \\{{foo.%escapedHTML\\}}'.transform(TP.hc('foo', '<bar/>'));

        correctRep = 'hi: {{foo.%escapedHTML}}';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  The 'true' flag here flushes the template cache and forces redefinition
        'This is a row value: \\{{value\\}}\n'.compile('rowTemp', true);
        'Here is some row data {{.%rowTemp}}\n'.compile('tableTemp', true);

        testRep = TP.ac(1, 2, 3).as('tableTemp', TP.hc('repeat', true));

        correctRep = 'Here is some row data This is a row value: {{value}}\n\nHere is some row data This is a row value: {{value}}\n\nHere is some row data This is a row value: {{value}}\n\n';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = '<ul>{{:with foo.bar}}<li>\\{{goo\\}}</li><li>{{moo}}</li>{{/:with}}</ul>';

        testRep = templateStr.transform(TP.hc('foo', TP.hc('bar', TP.hc('goo', 'googoo', 'moo', 'moomoo'))));

        correctRep = '<ul><span tibet:templateexpr="foo.bar"><li>{{goo}}</li><li>moomoo</li></span></ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
