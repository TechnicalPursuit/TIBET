//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.$templateParser.parse.describe('parse',
function() {

    this.it('TP.$templateParser \'parse simple\' test', function(test, options) {

        var templateStr,

            testRep,
            correctRep;

        //  ---

        templateStr = 'Hi there {{firstName}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'Hi there '
               ],
               [
                  'value',
                  'firstName'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'Hi there {{data.firstName}} {{data.lastName}}. You are {{data.age}} years old';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'Hi there '
               ],
               [
                  'value',
                  'data.firstName'
               ],
               [
                  'text',
                  ' '
               ],
               [
                  'value',
                  'data.lastName'
               ],
               [
                  'text',
                  '. You are '
               ],
               [
                  'value',
                  'data.age'
               ],
               [
                  'text',
                  ' years old'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The element with a bar attribute is: {{./*[@bar]}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'The element with a bar attribute is: '
               ],
               [
                  'value',
                  './*[@bar]'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'hi: {{foo %% escapedHTML}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'hi: '
               ],
               [
                  'value',
                  'foo %% escapedHTML'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The second item is: {{data.1}} and the other two are: {{data[0,2]}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'The second item is: '
               ],
               [
                  'value',
                  'data.1'
               ],
               [
                  'text',
                  ' and the other two are: '
               ],
               [
                  'value',
                  'data[0,2]'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'Hi there {{data.firstName}} {{data.lastName}}. Your phone number is {{data.phone %% @{@@@-@@@@}}}.';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'Hi there '
               ],
               [
                  'value',
                  'data.firstName'
               ],
               [
                  'text',
                  ' '
               ],
               [
                  'value',
                  'data.lastName'
               ],
               [
                  'text',
                  '. Your phone number is '
               ],
               [
                  'value',
                  'data.phone %% @{@@@-@@@@}'
               ],
               [
                  'text',
                  '.'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'Hi there {{data.firstName}} {{data.lastName}}. Your salary is {{data.salary %% $#{#,###.00}}}.';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'Hi there '
               ],
               [
                  'value',
                  'data.firstName'
               ],
               [
                  'text',
                  ' '
               ],
               [
                  'value',
                  'data.lastName'
               ],
               [
                  'text',
                  '. Your salary is '
               ],
               [
                  'value',
                  'data.salary %% $#{#,###.00}'
               ],
               [
                  'text',
                  '.'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The content as XML-RPC is: {{value %% TP.core.XMLRPCNode}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'The content as XML-RPC is: '
               ],
               [
                  'value',
                  'value %% TP.core.XMLRPCNode'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The element with a bar attribute is: {{./*[@bar]%%String}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'The element with a bar attribute is: '
               ],
               [
                  'value',
                  './*[@bar]%%String'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The list is {{value %%* html:ul}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'The list is '
               ],
               [
                  'value',
                  'value %%* html:ul'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  JS Object literal
        templateStr = '{foo:{{x}}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  '{foo:'
               ],
               [
                  'value',
                  'x'
               ],
               [
                  'text',
                  '}'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    this.it('TP.$templateParser \'parse complex\' test', function(test, options) {

        var templateStr,

            testRep,
            correctRep;

        //  ---

        //  Inlined template
        templateStr = 'The name of the element with a bar attribute is: {{./*[@bar] %% It really is: {{localName %% {{fetchit %% formatit}}}}}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'The name of the element with a bar attribute is: '
               ],
               [
                  'value',
                  './*[@bar] %% It really is: {{localName %% {{fetchit %% formatit}}}}'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  'with' statement - JSON path
        templateStr = 'Hi there {{:with data}} {{firstName}} {{lastName}} {{/:with}}. You are {{data.age}} years old';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'Hi there '
               ],
               [
                  'with',
                  'data',
                  [
                     [
                        'text',
                        ' '
                     ],
                     [
                        'value',
                        'firstName'
                     ],
                     [
                        'text',
                        ' '
                     ],
                     [
                        'value',
                        'lastName'
                     ],
                     [
                        'text',
                        ' '
                     ]
                  ]
               ],
               [
                  'text',
                  '. You are '
               ],
               [
                  'value',
                  'data.age'
               ],
               [
                  'text',
                  ' years old'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  'with' statement - XPath
        templateStr = 'Hello {{world}}. {{:with ./*[@bar]}}First name is: {{firstName}} and last name is: {{lastName}}{{/:with}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'Hello '
               ],
               [
                  'value',
                  'world'
               ],
               [
                  'text',
                  '. '
               ],
               [
                  'with',
                  './*[@bar]',
                  [
                     [
                        'text',
                        'First name is: '
                     ],
                     [
                        'value',
                        'firstName'
                     ],
                     [
                        'text',
                        ' and last name is: '
                     ],
                     [
                        'value',
                        'lastName'
                     ]
                  ]
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  'if' statement - JSON path
        templateStr = '{{:if foo}}<li>{{goo}}</li><li>{{moo}}</li>{{/:if}}</ul> and then there\'s: {{foo.bar.moo}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'if',
                  'foo',
                  [
                     [
                        'text',
                        '<li>'
                     ],
                     [
                        'value',
                        'goo'
                     ],
                     [
                        'text',
                        '</li><li>'
                     ],
                     [
                        'value',
                        'moo'
                     ],
                     [
                        'text',
                        '</li>'
                     ]
                  ],
                  null
               ],
               [
                  'text',
                  '</ul> and then there\'s: '
               ],
               [
                  'value',
                  'foo.bar.moo'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  'for' statement - using no params
        templateStr = '{{:for foo}}<li>{{goo}}</li><li>{{moo}}</li>{{/:for}}</ul> and then there\'s: {{foo.bar.moo}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'for',
                  'foo',
                  [
                     [
                        'text',
                        '<li>'
                     ],
                     [
                        'value',
                        'goo'
                     ],
                     [
                        'text',
                        '</li><li>'
                     ],
                     [
                        'value',
                        'moo'
                     ],
                     [
                        'text',
                        '</li>'
                     ]
                  ]
               ],
               [
                  'text',
                  '</ul> and then there\'s: '
               ],
               [
                  'value',
                  'foo.bar.moo'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  'for' statement - using supplied params
        templateStr = 'Hello {{world}}. {{:for (a,b) words}}{{a}} is at: {{b}} {{/:for}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'Hello '
               ],
               [
                  'value',
                  'world'
               ],
               [
                  'text',
                  '. '
               ],
               [
                  'for',
                  {
                     'args': 'a,b',
                     'data': 'words'
                  },
                  [
                     [
                        'value',
                        'a'
                     ],
                     [
                        'text',
                        ' is at: '
                     ],
                     [
                        'value',
                        'b'
                     ],
                     [
                        'text',
                        ' '
                     ]
                  ]
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  Escaped template
        templateStr = 'The year is: \\{{value %% YYYY\\}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'The year is: \\{{value %% YYYY\\}}'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  Escaped template with embedded value containing escaped inline template
        templateStr = 'The year is: \\{{value %% {{\\{{some\\}}}}\\}}';

        testRep = TP.$templateParser.parse(templateStr);

        correctRep =
            [
               [
                  'text',
                  'The year is: \\{{value %% '
               ],
               [
                  'value',
                  '\\{{some\\}}'
               ],
               [
                  'text',
                  '\\}}'
               ]
            ];

        this.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.$templateParser.parse.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
