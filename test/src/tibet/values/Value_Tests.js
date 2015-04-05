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

/* global Window: true,
          HTMLDocument: true,
          XMLDocument: true,
          Attr: true,
          Text: true,
          CDATASection: true,
          ProcessingInstruction: true,
          Comment: true,
          DocumentFragment: true,
          NodeList: true,
          NamedNodeMap: true,
          CSSStyleSheet: true,
          CSSStyleRule: true,
          CSSStyleDeclaration: true
*/

//  ------------------------------------------------------------------------

TP.describe('local id - TP.objectLocalID() / TP.lid()',
function() {

    var thisArg,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    thisArg = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,                               'undefined',
        TP.NULL,                                'null',
        'Boolean',                              'true',
        'String',                               'bar',
        'Number',                               '42',
        'RegExp',                               /^RegExp\$(\w+)$/,
        'Date',                                 /^Date\$(\w+)$/,
        'InvalidDate',                          /^Date\$(\w+)$/,
        'Array',                                /^Array\$(\w+)$/,
        'Object',                               /^Object\$(\w+)$/,
        'Function',                             /^Function\$(\w+)$/,
        'NaN',                                  'NaN',
        'NativeType',                           'Array',
        'NativeFunction',                       /^Function\$(\w+)$/,

        'Window',                               TP.sys.cfg('tibet.uibuffer'),
        'IFrameWindow',                         'UIROOT',

        //'Node',                                 'Node',
        'HTMLDocument',                         'document',
        'HTMLElement',                          'body',

        'XMLDocument',                          'document',
        'XMLElement',                           'element(/1)',

        'AttributeNode',                        'xpath1(./@foo)',
        'TextNode',                             'xpath1(./text()[contains(.,\'foo\')])',
        'CDATASectionNode',                     'xpath1(./text()[contains(.,\'foo\')])',
        'PINode',                               'xpath1(./processing-instruction(\'foo\'))',
        'CommentNode',                          'xpath1(./comment()[1])',
        'DocumentFragmentNode',                 '#document-fragment',

        'NodeList',                             /^NodeList\$(\w+)$/,
        'NamedNodeMap',                         /^NamedNodeMap\$(\w+)$/,

        'CSSStyleSheet',                        /^CSSStyleSheet\$(\w+)$/,
        'CSSStyleRule',                         /^CSSStyleRule\$(\w+)$/,
        'CSSStyleDeclaration',                  /^CSSStyleDeclaration\$(\w+)$/,

        'Error',                                /^Error\$(\w+)$/,
        'Event',                                /^MouseEvent\$(\w+)$/,
        'XHR',                                  /^XMLHttpRequest\$(\w+)$/,

        'TIBETType',                            'TP.core.Node',
        'TP.lang.Object',                       /^TP\.lang\.Object\$(\w+)$/,
        'TP.lang.Hash',                         /^TP\.lang\.Hash\$(\w+)$/,
        'TP.sig.Signal',                        /^TP\.sig\.Signal\$(\w+)$/,
        'TP.sig.Exception',                     /^TP\.sig\.Exception\$(\w+)$/,

        'TP.core.Window',                       TP.sys.cfg('tibet.uibuffer'),
        'TP.core.HTMLDocumentNode',             'document',
        'TP.core.HTMLElementNode',              'body',

        'TP.core.XMLDocumentNode',              'document',
        'TP.core.XMLElementNode',               'element(/1)',

        'TP.core.DocumentFragmentNode',         '#document-fragment',
        'TP.core.AttributeNode',                'xpath1(./@foo)',
        'TP.core.TextNode',                     'xpath1(./text()[contains(.,\'foo\')])',
        'TP.core.CDATASectionNode',             'xpath1(./text()[contains(.,\'foo\')])',
        'TP.core.ProcessingInstructionNode',    'xpath1(./processing-instruction(\'foo\'))',
        'TP.core.CommentNode',                  'xpath1(./comment()[1])',

        'TP.core.SimpleTIBETPath',              /^TP\.core\.SimpleTIBETPath\$(\w+)$/,
        'TP.core.ComplexTIBETPath',             /^TP\.core\.ComplexTIBETPath\$(\w+)$/,
        'TP.core.ElementPath',                  /^TP\.core\.ElementPath\$(\w+)$/,
        'TP.core.XTensionPath',                 /^TP\.core\.XTensionPath\$(\w+)$/,
        'TP.core.XPathPath',                    /^TP\.core\.XPathPath\$(\w+)$/,

        'TP.sig.Request',                       /^TP\.sig\.Request\$(\w+)$/,
        'TP.sig.Response',                      /^TP\.sig\.Response\$(\w+)$/,

        'TP.core.TIBETURN',                     'urn:tibet:foo',
        'TP.core.HTTPURL',                      'http://www.blah.com',
        'TP.core.FileURL',                      'file:///goo.txt',
        /* eslint-disable no-script-url */
        'TP.core.JSURI',                        'javascript:alert("hi")',
        /* eslint-enable no-script-url */
        'TP.core.WSURL',                        'ws://ws.blah.com',
        'TP.core.TIBETURL',                     'tibet://top/file:///goo.txt',
        'TP.core.CookieURL',                    'cookie://blah=foo',

        'TP.w3.DocType',                        /^TP\.w3\.DocType\$(\w+)$/,

        'TP.core.Point',                        /^TP\.core\.Point\$(\w+)$/,
        'TP.core.Rect',                         /^TP\.core\.Rect\$(\w+)$/,
        'TP.core.Matrix',                       /^TP\.core\.Matrix\$(\w+)$/,
        'TP.core.Color',                        /^TP\.core\.Color\$(\w+)$/,

        'TP.core.LinearGradient',               /^TP\.core\.LinearGradient\$(\w+)$/,
        'TP.core.RadialGradient',               /^TP\.core\.RadialGradient\$(\w+)$/,

        'TP.core.Pattern',                      /^TP\.core\.Pattern\$(\w+)$/,
        'TP.core.Path',                         /^TP\.core\.SVGPath\$(\w+)$/,

        'TP.core.Job',                          /^TP\.core\.Job\$(\w+)$/,
        'TP.core.Browser_TYPE',                 'TP.core.Browser',

        'TP.boot.Annotation',                   /^Function\$(\w+)$/,
        'TP.core.Annotation',                   /^TP\.core\.Annotation\$(\w+)$/
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.lid(): ' +
                testKeys.difference(
                            correctValues.getKeys()).asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {

        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        //  ---

        /* eslint-disable no-loop-func */
        (function() {

            var testFunc;

            if (TP.isString(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.isEqualTo(
                            TP.lid(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.lid(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisArg.it('local id of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.describe('global id - TP.objectGlobalID() / TP.gid()',
function() {

    var thisArg,

        testData,
        testKeys,

        winGID,
        docLoc,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    thisArg = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    winGID = TP.gid(testData.at('Window'));
    docLoc = TP.documentGetLocation(testData.at('HTMLDocument'));

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,                               'undefined',
        TP.NULL,                                'null',
        'Boolean',                              'true',
        'String',                               'bar',
        'Number',                               '42',
        'RegExp',                               /^RegExp\$(\w+)$/,
        'Date',                                 /^Date\$(\w+)$/,
        'InvalidDate',                          /^Date\$(\w+)$/,
        'Array',                                /^Array\$(\w+)$/,
        'Object',                               /^Object\$(\w+)$/,
        'Function',                             /^Function\$(\w+)$/,
        'NaN',                                  'NaN',
        'NativeType',                           'Array',
        'NativeFunction',                       /^Function\$(\w+)$/,

        'Window',                               winGID,
        'IFrameWindow',                         winGID + '.UIROOT',

        //'Node',                                 'Node',
        'HTMLDocument',                         'tibet://' + winGID + '/' + docLoc,
        'HTMLElement',                          'tibet://' + winGID + '/' + docLoc.slice(0, docLoc.indexOf('#?')) + '#body',

        'XMLDocument',                          TP.id(testData.at('XMLDocument')),
        'XMLElement',                           TP.id(testData.at('XMLElement')),

        'AttributeNode',                        '#xpath1(./@foo)',
        'TextNode',                             '#xpath1(./text()[contains(.,\'foo\')])',
        'CDATASectionNode',                     '#xpath1(./text()[contains(.,\'foo\')])',
        'PINode',                               '#xpath1(./processing-instruction(\'foo\'))',
        'CommentNode',                          '#xpath1(./comment()[1])',
        'DocumentFragmentNode',                 '#document-fragment',

        'NodeList',                             /^NodeList\$(\w+)$/,
        'NamedNodeMap',                         /^NamedNodeMap\$(\w+)$/,

        'CSSStyleSheet',                        /^CSSStyleSheet\$(\w+)$/,
        'CSSStyleRule',                         /^CSSStyleRule\$(\w+)$/,
        'CSSStyleDeclaration',                  /^CSSStyleDeclaration\$(\w+)$/,

        'Error',                                /^Error\$(\w+)$/,
        'Event',                                /^MouseEvent\$(\w+)$/,
        'XHR',                                  /^XMLHttpRequest\$(\w+)$/,

        'TIBETType',                            'TP.core.Node',
        'TP.lang.Object',                       /^TP\.lang\.Object\$(\w+)$/,
        'TP.lang.Hash',                         /^TP\.lang\.Hash\$(\w+)$/,
        'TP.sig.Signal',                        /^TP\.sig\.Signal\$(\w+)$/,
        'TP.sig.Exception',                     /^TP\.sig\.Exception\$(\w+)$/,

        'TP.core.Window',                       TP.sys.cfg('tibet.uibuffer'),
        'TP.core.HTMLDocumentNode',             'tibet://' + winGID + '/' + docLoc,
        'TP.core.HTMLElementNode',              'tibet://' + winGID + '/' + docLoc.slice(0, docLoc.indexOf('#?')) + '#body',

        'TP.core.XMLDocumentNode',              TP.id(testData.at('XMLDocument')),
        'TP.core.XMLElementNode',               TP.id(testData.at('XMLElement')),

        'TP.core.DocumentFragmentNode',         '#document-fragment',
        'TP.core.AttributeNode',                '#xpath1(./@foo)',
        'TP.core.TextNode',                     '#xpath1(./text()[contains(.,\'foo\')])',
        'TP.core.CDATASectionNode',             '#xpath1(./text()[contains(.,\'foo\')])',
        'TP.core.ProcessingInstructionNode',    '#xpath1(./processing-instruction(\'foo\'))',
        'TP.core.CommentNode',                  '#xpath1(./comment()[1])',

        'TP.core.SimpleTIBETPath',              /^TP\.core\.SimpleTIBETPath\$(\w+)$/,
        'TP.core.ComplexTIBETPath',             /^TP\.core\.ComplexTIBETPath\$(\w+)$/,
        'TP.core.ElementPath',                  /^TP\.core\.ElementPath\$(\w+)$/,
        'TP.core.XTensionPath',                 /^TP\.core\.XTensionPath\$(\w+)$/,
        'TP.core.XPathPath',                    /^TP\.core\.XPathPath\$(\w+)$/,

        'TP.sig.Request',                       /^TP\.sig\.Request\$(\w+)$/,
        'TP.sig.Response',                      /^TP\.sig\.Response\$(\w+)$/,

        'TP.core.TIBETURN',                     'urn:tibet:foo',
        'TP.core.HTTPURL',                      'http://www.blah.com',
        'TP.core.FileURL',                      'file:///goo.txt',
        /* eslint-disable no-script-url */
        'TP.core.JSURI',                        'javascript:alert("hi")',
        /* eslint-enable no-script-url */
        'TP.core.WSURL',                        'ws://ws.blah.com',
        'TP.core.TIBETURL',                     'tibet://top/file:///goo.txt',
        'TP.core.CookieURL',                    'cookie://blah=foo',

        'TP.w3.DocType',                        /^TP\.w3\.DocType\$(\w+)$/,

        'TP.core.Point',                        /^TP\.core\.Point\$(\w+)$/,
        'TP.core.Rect',                         /^TP\.core\.Rect\$(\w+)$/,
        'TP.core.Matrix',                       /^TP\.core\.Matrix\$(\w+)$/,
        'TP.core.Color',                        /^TP\.core\.Color\$(\w+)$/,

        'TP.core.LinearGradient',               /^TP\.core\.LinearGradient\$(\w+)$/,
        'TP.core.RadialGradient',               /^TP\.core\.RadialGradient\$(\w+)$/,

        'TP.core.Pattern',                      /^TP\.core\.Pattern\$(\w+)$/,
        'TP.core.Path',                         /^TP\.core\.SVGPath\$(\w+)$/,

        'TP.core.Job',                          /^TP\.core\.Job\$(\w+)$/,
        'TP.core.Browser_TYPE',                 'TP.core.Browser',

        'TP.boot.Annotation',                   /^Function\$(\w+)$/,
        'TP.core.Annotation',                   /^TP\.core\.Annotation\$(\w+)$/
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.gid(): ' +
                testKeys.difference(
                            correctValues.getKeys()).asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {

        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        //  ---

        /* eslint-disable no-loop-func */
        (function() {

            var testFunc;

            if (TP.isString(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.isEqualTo(
                            TP.gid(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.gid(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisArg.it('global id of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.describe('TP.isType()',
function() {

    var thisArg,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    thisArg = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,                               false,
        TP.NULL,                                false,
        'Boolean',                              false,
        'String',                               false,
        'Number',                               false,
        'RegExp',                               false,
        'Date',                                 false,
        'InvalidDate',                          false,
        'Array',                                false,
        'Object',                               false,
        'Function',                             false,
        'NaN',                                  false,
        'NativeType',                           true,
        'NativeFunction',                       false,

        'Window',                               false,
        'IFrameWindow',                         false,

        //'Node',                                 false,
        'HTMLDocument',                         false,
        'HTMLElement',                          false,

        'XMLDocument',                          false,
        'XMLElement',                           false,

        'AttributeNode',                        false,
        'TextNode',                             false,
        'CDATASectionNode',                     false,
        'PINode',                               false,
        'CommentNode',                          false,
        'DocumentFragmentNode',                 false,

        'NodeList',                             false,
        'NamedNodeMap',                         false,

        'CSSStyleSheet',                        false,
        'CSSStyleRule',                         false,
        'CSSStyleDeclaration',                  false,

        'Error',                                false,
        'Event',                                false,
        'XHR',                                  false,

        'TIBETType',                            true,
        'TP.lang.Object',                       false,
        'TP.lang.Hash',                         false,
        'TP.sig.Signal',                        false,
        'TP.sig.Exception',                     false,

        'TP.core.Window',                       false,
        'TP.core.HTMLDocumentNode',             false,
        'TP.core.HTMLElementNode',              false,

        'TP.core.XMLDocumentNode',              false,
        'TP.core.XMLElementNode',               false,

        'TP.core.DocumentFragmentNode',         false,
        'TP.core.AttributeNode',                false,
        'TP.core.TextNode',                     false,
        'TP.core.CDATASectionNode',             false,
        'TP.core.ProcessingInstructionNode',    false,
        'TP.core.CommentNode',                  false,

        'TP.core.SimpleTIBETPath',              false,
        'TP.core.ComplexTIBETPath',             false,
        'TP.core.ElementPath',                  false,
        'TP.core.XTensionPath',                 false,
        'TP.core.XPathPath',                    false,

        'TP.sig.Request',                       false,
        'TP.sig.Response',                      false,

        'TP.core.TIBETURN',                     false,
        'TP.core.HTTPURL',                      false,
        'TP.core.FileURL',                      false,
        /* eslint-disable no-script-url */
        'TP.core.JSURI',                        false,
        /* eslint-enable no-script-url */
        'TP.core.WSURL',                        false,
        'TP.core.TIBETURL',                     false,
        'TP.core.CookieURL',                    false,

        'TP.w3.DocType',                        false,

        'TP.core.Point',                        false,
        'TP.core.Rect',                         false,
        'TP.core.Matrix',                       false,
        'TP.core.Color',                        false,

        'TP.core.LinearGradient',               false,
        'TP.core.RadialGradient',               false,

        'TP.core.Pattern',                      false,
        'TP.core.Path',                         false,

        'TP.core.Job',                          false,
        'TP.core.Browser_TYPE',                 true,

        'TP.boot.Annotation',                   false,
        'TP.core.Annotation',                   false
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.isType(): ' +
                testKeys.difference(
                            correctValues.getKeys()).asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {

        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        //  ---

        /* eslint-disable no-loop-func */
        (function() {

            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isEqualTo(
                        TP.isType(testFunc.val), testFunc.correctVal);
                };
            testFunc.val = val;
            testFunc.correctVal = correctVal;

            thisArg.it('is type: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.describe('TP.isNativeType()',
function() {

    var thisArg,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    thisArg = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,                               false,
        TP.NULL,                                false,
        'Boolean',                              false,
        'String',                               false,
        'Number',                               false,
        'RegExp',                               false,
        'Date',                                 false,
        'InvalidDate',                          false,
        'Array',                                false,
        'Object',                               false,
        'Function',                             false,
        'NaN',                                  false,
        'NativeType',                           true,
        'NativeFunction',                       false,

        'Window',                               false,
        'IFrameWindow',                         false,

        //'Node',                                 false,
        'HTMLDocument',                         false,
        'HTMLElement',                          false,

        'XMLDocument',                          false,
        'XMLElement',                           false,

        'AttributeNode',                        false,
        'TextNode',                             false,
        'CDATASectionNode',                     false,
        'PINode',                               false,
        'CommentNode',                          false,
        'DocumentFragmentNode',                 false,

        'NodeList',                             false,
        'NamedNodeMap',                         false,

        'CSSStyleSheet',                        false,
        'CSSStyleRule',                         false,
        'CSSStyleDeclaration',                  false,

        'Error',                                false,
        'Event',                                false,
        'XHR',                                  false,

        'TIBETType',                            false,
        'TP.lang.Object',                       false,
        'TP.lang.Hash',                         false,
        'TP.sig.Signal',                        false,
        'TP.sig.Exception',                     false,

        'TP.core.Window',                       false,
        'TP.core.HTMLDocumentNode',             false,
        'TP.core.HTMLElementNode',              false,

        'TP.core.XMLDocumentNode',              false,
        'TP.core.XMLElementNode',               false,

        'TP.core.DocumentFragmentNode',         false,
        'TP.core.AttributeNode',                false,
        'TP.core.TextNode',                     false,
        'TP.core.CDATASectionNode',             false,
        'TP.core.ProcessingInstructionNode',    false,
        'TP.core.CommentNode',                  false,

        'TP.core.SimpleTIBETPath',              false,
        'TP.core.ComplexTIBETPath',             false,
        'TP.core.ElementPath',                  false,
        'TP.core.XTensionPath',                 false,
        'TP.core.XPathPath',                    false,

        'TP.sig.Request',                       false,
        'TP.sig.Response',                      false,

        'TP.core.TIBETURN',                     false,
        'TP.core.HTTPURL',                      false,
        'TP.core.FileURL',                      false,
        /* eslint-disable no-script-url */
        'TP.core.JSURI',                        false,
        /* eslint-enable no-script-url */
        'TP.core.WSURL',                        false,
        'TP.core.TIBETURL',                     false,
        'TP.core.CookieURL',                    false,

        'TP.w3.DocType',                        false,

        'TP.core.Point',                        false,
        'TP.core.Rect',                         false,
        'TP.core.Matrix',                       false,
        'TP.core.Color',                        false,

        'TP.core.LinearGradient',               false,
        'TP.core.RadialGradient',               false,

        'TP.core.Pattern',                      false,
        'TP.core.Path',                         false,

        'TP.core.Job',                          false,
        'TP.core.Browser_TYPE',                 false,

        'TP.boot.Annotation',                   false,
        'TP.core.Annotation',                   false
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.isNativeType(): ' +
                testKeys.difference(
                            correctValues.getKeys()).asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {

        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        //  ---

        /* eslint-disable no-loop-func */
        (function() {

            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isEqualTo(
                        TP.isNativeType(testFunc.val), testFunc.correctVal);
                };
            testFunc.val = val;
            testFunc.correctVal = correctVal;

            thisArg.it('is native type: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.describe('TP.isMemberOf()',
function() {

    var thisArg,

        testData,
        testKeys,
        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    thisArg = this;

    /* eslint-disable no-loop-func */

    //  isMemberOf() tests 'direct' type relationship - an instance of an exact
    //  type.

    //  Native JavaScript types (big 8)
    testData = TP.ac(Array, Boolean, Date, Function,
                        Number, Object, RegExp, String);

    for (i = 0; i < testData.getSize(); i++) {

        val = testData.at(i);

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(TP.isMemberOf(testFunc.val, Object));
                };
            testFunc.val = val;

            thisArg.it(TP.name(val) + ' (constructor) is not a member of: Object',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isMemberOf(testFunc.val, TP.ObjectProto));
                };
            testFunc.val = val;

            thisArg.it(TP.name(val) +
                        ' (constructor) is not a member of: TP.ObjectProto',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isTrue(TP.isMemberOf(testFunc.val, Function));
                };
            testFunc.val = val;

            thisArg.it(TP.name(val) + ' (constructor) is a member of: Function',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isMemberOf(testFunc.val, TP.FunctionProto));
                };
            testFunc.val = val;

            thisArg.it(TP.name(val) +
                        ' (constructor) is not a member of: TP.FunctionProto',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(TP.isMemberOf(testFunc.val, 'Object'));
                };
            testFunc.val = val;

            thisArg.it(TP.name(val) + ' (constructor) is not a member of: "Object"',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(TP.isMemberOf(testFunc.val, 'Object'));
                };
            testFunc.val = val;

            thisArg.it(TP.name(val) + ' (constructor) is not a member of: "Object"',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isTrue(TP.isMemberOf(testFunc.val, 'Function'));
                };
            testFunc.val = val;

            thisArg.it(TP.name(val) + ' (constructor) is a member of: "Function"',
                    testFunc);
        }());
    }

    //  Host types

    TP.$$setupHostTypesValues();

    testData = TP.$$hostTypesTestValues;
    testKeys = TP.keys(TP.$$hostTypesTestValues);

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {

        testKey = testKeys.at(i);
        val = testData.at(testKey);

        //  ---

        (function() {
            var testFunc;

            if (TP.isNonFunctionConstructor(val)) {
                testFunc =
                    function(test, options) {
                        test.assert.isTrue(TP.isMemberOf(testFunc.val, Object));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' (constructor) is a member of: Object',
                            testFunc);
            } else {
                testFunc =
                    function(test, options) {
                        test.assert.isFalse(TP.isMemberOf(testFunc.val, Object));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' (constructor) is not a member of: Object',
                            testFunc);
            }
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isMemberOf(testFunc.val, TP.ObjectProto));
                };
            testFunc.val = val;

            thisArg.it(testKey +
                        ' (constructor) is not a member of: TP.ObjectProto',
                        testFunc);
        }());

        //  ---

        (function() {

            var testFunc;

            if (TP.isNonFunctionConstructor(val)) {
                testFunc =
                    function(test, options) {
                        test.assert.isFalse(TP.isMemberOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' (constructor) is not a member of: Function',
                            testFunc);
            } else {
                testFunc =
                    function(test, options) {
                        test.assert.isTrue(TP.isMemberOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' (constructor) is a member of: Function',
                            testFunc);
            }
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isMemberOf(testFunc.val, TP.FunctionProto));
                };
            testFunc.val = val;

            thisArg.it(testKey +
                        ' (constructor) is not a member of: TP.FunctionProto',
                        testFunc);
        }());
    }

    //  Instances of native and TIBET types

    TP.$$setupCommonObjectValues();

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.NULL,                                null,
        'Boolean',                              Boolean,
        'String',                               String,
        'Number',                               Number,
        'RegExp',                               RegExp,
        'Date',                                 Date,
        'InvalidDate',                          Date,
        'Array',                                Array,
        'Object',                               Object,
        'Function',                             Function,
        'NaN',                                  Number,
        'NativeType',                           Function,
        'NativeFunction',                       Function,

        'Window',                               Window,
        'IFrameWindow',                         testData.at('IFrameWindow').Window,

        //'Node',                                 'Node',
        'HTMLDocument',                         HTMLDocument,
        'HTMLElement',                          HTMLBodyElement,

        'XMLDocument',                          XMLDocument,
        'XMLElement',                           Element,

        'AttributeNode',                        Attr,
        'TextNode',                             Text,
        'CDATASectionNode',                     CDATASection,
        'PINode',                               ProcessingInstruction,
        'CommentNode',                          Comment,
        'DocumentFragmentNode',                 DocumentFragment,

        'NodeList',                             NodeList,
        'NamedNodeMap',                         NamedNodeMap,

        'CSSStyleSheet',                        CSSStyleSheet,
        'CSSStyleRule',                         CSSStyleRule,
        'CSSStyleDeclaration',                  CSSStyleDeclaration,

        'Error',                                Error,
        'Event',                                MouseEvent,
        'XHR',                                  XMLHttpRequest,

        'TIBETType',                            TP.meta.core.Node,
        'TP.lang.Object',                       TP.lang.Object,
        'TP.lang.Hash',                         TP.lang.Hash,
        'TP.sig.Signal',                        TP.sig.Signal,
        'TP.sig.Exception',                     TP.sig.Exception,

        'TP.core.Window',                       TP.core.Window,
        'TP.core.HTMLDocumentNode',             TP.core.HTMLDocumentNode,
        'TP.core.HTMLElementNode',              TP.html.body,

        'TP.core.XMLDocumentNode',              TP.core.XMLDocumentNode,
        'TP.core.XMLElementNode',               TP.core.XMLElementNode,

        'TP.core.DocumentFragmentNode',         TP.core.DocumentFragmentNode,
        'TP.core.AttributeNode',                TP.core.AttributeNode,
        'TP.core.TextNode',                     TP.core.TextNode,
        'TP.core.CDATASectionNode',             TP.core.CDATASectionNode,
        'TP.core.ProcessingInstructionNode',    TP.core.XMLProcessingInstruction,
        'TP.core.CommentNode',                  TP.core.CommentNode,

        'TP.core.SimpleTIBETPath',              TP.core.SimpleTIBETPath,
        'TP.core.ComplexTIBETPath',             TP.core.ComplexTIBETPath,
        'TP.core.ElementPath',                  TP.core.ElementPath,
        'TP.core.XTensionPath',                 TP.core.XTensionPath,
        'TP.core.XPathPath',                    TP.core.XPathPath,

        'TP.sig.Request',                       TP.sig.Request,
        'TP.sig.Response',                      TP.sig.Response,

        'TP.core.TIBETURN',                     TP.core.TIBETURN,
        'TP.core.HTTPURL',                      TP.core.HTTPURL,
        'TP.core.FileURL',                      TP.core.FileURL,
        'TP.core.JSURI',                        TP.core.JSURI,
        'TP.core.WSURL',                        TP.core.WSURL,
        'TP.core.TIBETURL',                     TP.core.TIBETURL,
        'TP.core.CookieURL',                    TP.core.CookieURL,

        'TP.w3.DocType',                        TP.w3.DocType,

        'TP.core.Point',                        TP.core.Point,
        'TP.core.Rect',                         TP.core.Rect,
        'TP.core.Matrix',                       TP.core.Matrix,
        'TP.core.Color',                        TP.core.Color,

        'TP.core.LinearGradient',               TP.core.LinearGradient,
        'TP.core.RadialGradient',               TP.core.RadialGradient,

        'TP.core.Pattern',                      TP.core.Pattern,
        'TP.core.Path',                         TP.core.SVGPath,

        'TP.core.Job',                          TP.core.Job,
        'TP.core.Browser_TYPE',                 TP.meta.core.Browser,

        'TP.boot.Annotation',                   TP.boot.Annotation,
        'TP.core.Annotation',                   TP.core.Annotation
    );
    /* eslint-enable no-multi-spaces */

    correctValues.$get('$$hash')[TP.UNDEF] = undefined;

    //  ---

    this.it('Correct values for each test', function(test, options) {
        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.isMemberOf(): ' +
                testKeys.difference(
                            correctValues.getKeys()).asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {
        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    //  'null' and 'undefined' should always return false
                    if (TP.notValid(testFunc.val)) {
                        test.assert.isFalse(
                            TP.isMemberOf(
                                testFunc.val,
                                testFunc.correctVal));
                    } else {
                        test.assert.isTrue(
                            TP.isMemberOf(
                                testFunc.val,
                                testFunc.correctVal));
                    }
                };
            testFunc.val = val;
            testFunc.correctVal = correctVal;

            thisArg.it(testKey +
                    ' is a member of: ' +
                    TP.name(correctVal),
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    //  'null' and 'undefined' should always return false
                    if (TP.notValid(testFunc.val)) {
                        test.assert.isFalse(
                            TP.isMemberOf(
                                testFunc.val,
                                TP.name(testFunc.correctVal)));
                    } else {
                        test.assert.isTrue(
                            TP.isMemberOf(
                                testFunc.val,
                                TP.name(testFunc.correctVal)));
                    }
                };
            testFunc.val = val;
            testFunc.correctVal = correctVal;

            thisArg.it(testKey +
                    ' is a member of: ' +
                    '"' + TP.name(correctVal) + '"',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isMemberOf(
                            testFunc.val,
                            TP.stype(testFunc.correctVal)));
                };
            testFunc.val = val;
            testFunc.correctVal = correctVal;

            thisArg.it(testKey +
                    ' is not a member of: ' +
                    TP.name(TP.stype(correctVal)),
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isMemberOf(
                            testFunc.val,
                            TP.name(TP.stype(testFunc.correctVal))));
                };
            testFunc.val = val;
            testFunc.correctVal = correctVal;

            thisArg.it(testKey +
                    ' is not a member of: ' +
                    '"' + TP.name(TP.stype(correctVal)) + '"',
                testFunc);
        }());

        if (testKey === 'Object') {
            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        test.assert.isTrue(
                            TP.isMemberOf(testFunc.val, Object));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' is a member of: ' + TP.name(Object),
                            testFunc);
            }());
        } else {
            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        test.assert.isFalse(
                            TP.isMemberOf(testFunc.val, Object));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' is not a member of: ' + TP.name(Object),
                            testFunc);
            }());
        }

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isMemberOf(testFunc.val, TP.ObjectProto));
                };
            testFunc.val = val;

            thisArg.it(testKey + ' is not a member of: ' + TP.name(TP.ObjectProto),
                        testFunc);
        }());

        if (testKey === 'TP.lang.Object') {
            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        test.assert.isTrue(
                            TP.isMemberOf(testFunc.val, TP.lang.Object));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' is a member of: ' + TP.name(TP.lang.Object),
                            testFunc);
            }());
        } else {
            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        test.assert.isFalse(
                            TP.isMemberOf(testFunc.val, TP.lang.Object));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' is not a member of: ' +
                                TP.name(TP.lang.Object),
                            testFunc);
            }());
        }

        if (testKey === 'Function' ||
            testKey === 'NativeType' ||
            testKey === 'NativeFunction') {
            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        test.assert.isTrue(
                            TP.isMemberOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' is a member of: ' +
                                TP.name(Function),
                            testFunc);
            }());
        } else {
            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        test.assert.isFalse(
                            TP.isMemberOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisArg.it(testKey + ' is not a member of: ' +
                                TP.name(Function),
                            testFunc);
            }());
        }

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isMemberOf(testFunc.val, TP.FunctionProto));
                };
            testFunc.val = val;

            thisArg.it(testKey + ' is not a member of: ' +
                                TP.name(TP.FunctionProto),
                        testFunc);
        }());
    }

    /* eslint-enable no-loop-func */
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
