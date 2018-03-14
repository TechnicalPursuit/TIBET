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

//  ------------------------------------------------------------------------

TP.name.describe('object name',
function() {

    var topLevelNativeWinName,
        topLevelWrappedWinName,

        thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    if (TP.sys.hasFeature('karma')) {
        topLevelNativeWinName = TP.sys.cfg('tibet.top_win_name');
        topLevelWrappedWinName =
                    top.name + '.' + TP.sys.cfg('tibet.top_win_name');
    } else {
        topLevelNativeWinName = TP.sys.cfg('tibet.top_win_name');
        topLevelWrappedWinName = topLevelNativeWinName;
    }

    thisref = this;

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
        'NativeFunction',                       'slice',

        'Window',                               topLevelNativeWinName,
        'IFrameWindow',                         'UIROOT',

        // 'Node',                                 'Node',
        'HTMLDocument',                         '#document',
        'HTMLElement',                          'html:body',

        'XMLDocument',                          '#document',
        'XMLElement',                           'foo',

        'AttributeNode',                        'foo',
        'TextNode',                             '#text',
        'CDATASectionNode',                     '#cdata-section',
        'PINode',                               'foo',
        'CommentNode',                          '#comment',
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
        'TP.core.Hash',                         /^TP\.core\.Hash\$(\w+)$/,
        'TP.sig.Signal',                        /^TP\.sig\.Signal\$(\w+)$/,
        'TP.sig.Exception',                     /^TP\.sig\.Exception\$(\w+)$/,

        'TP.core.Window',                       topLevelWrappedWinName,
        'TP.core.HTMLDocumentNode',             '#document',
        'TP.core.HTMLElementNode',              'html:body',

        'TP.core.XMLDocumentNode',              '#document',
        'TP.core.XMLElementNode',               'foo',

        'TP.core.DocumentFragmentNode',         '#document-fragment',
        'TP.core.AttributeNode',                'foo',
        'TP.core.TextNode',                     '#text',
        'TP.core.CDATASectionNode',             '#cdata-section',
        'TP.core.ProcessingInstructionNode',    'foo',
        'TP.core.CommentNode',                  '#comment',

        'TP.path.SimpleTIBETPath',              /^TP\.path\.SimpleTIBETPath\$(\w+)$/,
        'TP.path.ComplexTIBETPath',             /^TP\.path\.ComplexTIBETPath\$(\w+)$/,
        'TP.path.ElementPath',                  /^TP\.path\.ElementPath\$(\w+)$/,
        'TP.path.XTensionPath',                 /^TP\.path\.XTensionPath\$(\w+)$/,
        'TP.path.XPathPath',                    /^TP\.path\.XPathPath\$(\w+)$/,

        'TP.sig.Request',                       /^TP\.sig\.Request\$(\w+)$/,
        'TP.sig.Response',                      /^TP\.sig\.Response\$(\w+)$/,

        'TP.core.TIBETURN',                     'foo',
        'TP.core.HTTPURL',                      /^TP\.core\.HTTPURL\$(\w+)$/,
        'TP.core.FileURL',                      /^TP\.core\.FileURL\$(\w+)$/,
        /* eslint-disable no-script-url */
        'TP.core.JSURI',                        /^TP\.core\.JSURI\$(\w+)$/,
        /* eslint-enable no-script-url */
        'TP.core.WSURL',                        /^TP\.core\.WSURL\$(\w+)$/,
        'TP.core.TIBETURL',                     /^TP\.core\.TIBETURL\$(\w+)$/,
        'TP.core.CookieURL',                    /^TP\.core\.CookieURL\$(\w+)$/,

        'TP.w3.DocType',                        /^TP\.w3\.DocType\$(\w+)$/,

        'TP.gui.Point',                         /^TP\.gui\.Point\$(\w+)$/,
        'TP.gui.Rect',                          /^TP\.gui\.Rect\$(\w+)$/,
        'TP.gui.Matrix',                        /^TP\.gui\.Matrix\$(\w+)$/,
        'TP.gui.Color',                         /^TP\.gui\.Color\$(\w+)$/,

        'TP.gui.LinearGradient',                /^TP\.gui\.LinearGradient\$(\w+)$/,
        'TP.gui.RadialGradient',                /^TP\.gui\.RadialGradient\$(\w+)$/,

        'TP.gui.Pattern',                       /^TP\.gui\.Pattern\$(\w+)$/,
        'TP.gui.Path',                          /^TP\.gui\.SVGPath\$(\w+)$/,

        'TP.core.Job',                          /^TP\.core\.Job\$(\w+)$/,
        'TP.core.Browser_TYPE',                 'TP.core.Browser',

        'TP.boot.Annotation',                   /^Function\$(\w+)$/,
        'TP.core.Annotation',                   /^TP\.core\.Annotation\$(\w+)$/
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.name(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.name(): ' +
                                        diffKeys.asString(', '));
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
                            TP.name(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.name(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('name of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.tname.describe('type name',
function() {

    var thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,                               'Undefined',
        TP.NULL,                                'Null',
        'Boolean',                              'Boolean',
        'String',                               'String',
        'Number',                               'Number',
        'RegExp',                               'RegExp',
        'Date',                                 'Date',
        'InvalidDate',                          'Date',
        'Array',                                'Array',
        'Object',                               'Object',
        'Function',                             'Function',
        'NaN',                                  'Number',
        'NativeType',                           'Function',
        'NativeFunction',                       'Function',

        'Window',                               'DOMWindow',
        'IFrameWindow',                         'DOMWindow',

        // 'Node',                                 'Node',
        //  NB: The system uses visible documents, which for TIBET are XHTML
        'HTMLDocument',                         'HTMLDocument',
        'HTMLElement',                          'HTMLBodyElement',

        'XMLDocument',                          'XMLDocument',
        'XMLElement',                           'Element',

        'AttributeNode',                        'Attr',
        'TextNode',                             'Text',
        'CDATASectionNode',                     'CDATASection',
        'PINode',                               'ProcessingInstruction',
        'CommentNode',                          'Comment',
        'DocumentFragmentNode',                 'DocumentFragment',

        'NodeList',                             'NodeList',
        'NamedNodeMap',                         'NamedNodeMap',

        'CSSStyleSheet',                        'CSSStyleSheet',
        'CSSStyleRule',                         'CSSStyleRule',
        'CSSStyleDeclaration',                  'CSSStyleDeclaration',

        'Error',                                'Error',
        'Event',                                'MouseEvent',
        'XHR',                                  'XMLHttpRequest',

        'TIBETType',                            'TP.meta.core.Node',
        'TP.lang.Object',                       'TP.lang.Object',
        'TP.core.Hash',                         'TP.core.Hash',
        'TP.sig.Signal',                        'TP.sig.Signal',
        'TP.sig.Exception',                     'TP.sig.Exception',

        'TP.core.Window',                       'TP.core.Window',
        //  NB: The system uses visible documents, which for TIBET are XHTML
        'TP.core.HTMLDocumentNode',             'TP.core.HTMLDocumentNode',
        'TP.core.HTMLElementNode',              'TP.html.body',

        'TP.core.XMLDocumentNode',              'TP.core.XMLDocumentNode',
        'TP.core.XMLElementNode',               'TP.core.XMLElementNode',

        'TP.core.DocumentFragmentNode',         'TP.core.DocumentFragmentNode',
        'TP.core.AttributeNode',                'TP.core.AttributeNode',
        'TP.core.TextNode',                     'TP.core.TextNode',
        'TP.core.CDATASectionNode',             'TP.core.CDATASectionNode',
        'TP.core.ProcessingInstructionNode',    'TP.core.XMLProcessingInstruction',
        'TP.core.CommentNode',                  'TP.core.CommentNode',

        'TP.path.SimpleTIBETPath',              'TP.path.SimpleTIBETPath',
        'TP.path.ComplexTIBETPath',             'TP.path.ComplexTIBETPath',
        'TP.path.ElementPath',                  'TP.path.ElementPath',
        'TP.path.XTensionPath',                 'TP.path.XTensionPath',
        'TP.path.XPathPath',                    'TP.path.XPathPath',

        'TP.sig.Request',                       'TP.sig.Request',
        'TP.sig.Response',                      'TP.sig.Response',

        'TP.core.TIBETURN',                     'TP.core.TIBETURN',
        'TP.core.HTTPURL',                      'TP.core.HTTPURL',
        'TP.core.FileURL',                      'TP.core.FileURL',
        'TP.core.JSURI',                        'TP.core.JSURI',
        'TP.core.WSURL',                        'TP.core.WSURL',
        'TP.core.TIBETURL',                     'TP.core.TIBETURL',
        'TP.core.CookieURL',                    'TP.core.CookieURL',

        'TP.w3.DocType',                        'TP.w3.DocType',

        'TP.gui.Point',                         'TP.gui.Point',
        'TP.gui.Rect',                          'TP.gui.Rect',
        'TP.gui.Matrix',                        'TP.gui.Matrix',
        'TP.gui.Color',                         'TP.gui.Color',

        'TP.gui.LinearGradient',                'TP.gui.LinearGradient',
        'TP.gui.RadialGradient',                'TP.gui.RadialGradient',

        'TP.gui.Pattern',                       'TP.gui.Pattern',
        'TP.gui.Path',                          'TP.gui.SVGPath',

        'TP.core.Job',                          'TP.core.Job',
        'TP.core.Browser_TYPE',                 'TP.meta.core.Browser',

        'TP.boot.Annotation',                   'TP.boot.Annotation',
        'TP.core.Annotation',                   'TP.core.Annotation'
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.tname(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.tname(): ' +
                                        diffKeys.asString(', '));
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
                            TP.tname(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.tname(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('type name of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.tostr.describe('object toString()',
function() {

    var thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,               '[object Undefined]',
        TP.NULL,                '[object Null]',
        'Boolean',              'true',
        'String',               'bar',
        'Number',               '42',
        'RegExp',               '/foo/g',
        'Date',                 /^Wed Aug 23 1995 \d{2}:\d{2}:\d{2} GMT[-+]\d{4} \(\w{3}\)$/,
        'InvalidDate',          'Invalid Date',
        'Array',                '1,2,3',
        'Object',               '[object Object]',
        'Function',             /function\s*\(\s*\)\s*{return\s*'fluffy'\s*;\s*}/,
        'NaN',                  'NaN',
        'NativeType',           'Array',
        'NativeFunction',       /function\s*slice\s*\(\s*\)\s*{\s*\[native code\]\s*}/,

        'Window',               '[object DOMWindow]',
        'IFrameWindow',         '[object DOMWindow]',

        // 'Node',                 '[object Node]',
        //  NB: The system uses visible documents, which for TIBET are X(HT)ML
        'HTMLDocument',         '[object HTMLDocument]',
        'HTMLElement',          '[object HTMLBodyElement]',

        'XMLDocument',          '[object XMLDocument]',
        'XMLElement',           '[object Element]',

        'AttributeNode',        '[object Attr]',
        'TextNode',             '[object Text]',
        'CDATASectionNode',     '[object CDATASection]',
        'PINode',               '[object ProcessingInstruction]',
        'CommentNode',          '[object Comment]',
        'DocumentFragmentNode', '[object DocumentFragment]',

        'NodeList',             '[object NodeList]',
        'NamedNodeMap',         '[object NamedNodeMap]',

        'CSSStyleSheet',        '[object CSSStyleSheet]',
        'CSSStyleRule',         '[object CSSStyleRule]',
        'CSSStyleDeclaration',  '[object CSSStyleDeclaration]',

        'Error',                '[object Error]',
        'Event',                '[object MouseEvent]',
        'XHR',                  '[object XMLHttpRequest]',

        'TIBETType',                            '[object Object]',
        'TP.lang.Object',                       '[object Object]',
        'TP.core.Hash',                         '[object Object]',
        'TP.sig.Signal',                        '[object Object]',
        'TP.sig.Exception',                     '[object Object]',

        'TP.core.Window',                       '[object Object]',
        'TP.core.HTMLDocumentNode',             '[object Object]',
        'TP.core.HTMLElementNode',              '[object Object]',

        'TP.core.XMLDocumentNode',              '[object Object]',
        'TP.core.XMLElementNode',               '[object Object]',

        'TP.core.DocumentFragmentNode',         '[object Object]',
        'TP.core.AttributeNode',                '[object Object]',
        'TP.core.TextNode',                     '[object Object]',
        'TP.core.CDATASectionNode',             '[object Object]',
        'TP.core.ProcessingInstructionNode',    '[object Object]',
        'TP.core.CommentNode',                  '[object Object]',

        'TP.path.SimpleTIBETPath',              '[object Object]',
        'TP.path.ComplexTIBETPath',             '[object Object]',
        'TP.path.ElementPath',                  '[object Object]',
        'TP.path.XTensionPath',                 '[object Object]',
        'TP.path.XPathPath',                    '[object Object]',

        'TP.sig.Request',                       '[object Object]',
        'TP.sig.Response',                      '[object Object]',

        'TP.core.TIBETURN',                     '[object Object]',
        'TP.core.HTTPURL',                      '[object Object]',
        'TP.core.FileURL',                      '[object Object]',
        'TP.core.JSURI',                        '[object Object]',
        'TP.core.WSURL',                        '[object Object]',
        'TP.core.TIBETURL',                     '[object Object]',
        'TP.core.CookieURL',                    '[object Object]',

        'TP.w3.DocType',                        '[object Object]',

        'TP.gui.Point',                         '[object Object]',
        'TP.gui.Rect',                          '[object Object]',
        'TP.gui.Matrix',                        '[object Object]',
        'TP.gui.Color',                         '[object Object]',

        'TP.gui.LinearGradient',                '[object Object]',
        'TP.gui.RadialGradient',                '[object Object]',

        'TP.gui.Pattern',                       '[object Object]',
        'TP.gui.Path',                          '[object Object]',

        'TP.core.Job',                          '[object Object]',
        'TP.core.Browser_TYPE',                 '[object Object]',

        'TP.boot.Annotation',                   'This is a message [A String]',
        'TP.core.Annotation',                   'This is a message [A String]'
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.tostr(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.tostr(): ' +
                                        diffKeys.asString(', '));
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
                            TP.tostr(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.tostr(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('toString() of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.str.describe('object asString()',
function() {

    var topLevelWinName,

        thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    if (TP.sys.hasFeature('karma')) {
        topLevelWinName = top.name + '.' + TP.sys.cfg('tibet.top_win_name');
    } else {
        topLevelWinName = TP.sys.cfg('tibet.top_win_name');
    }

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,               'undefined',
        TP.NULL,                'null',
        'Boolean',              'true',
        'String',               'bar',
        'Number',               '42',
        'RegExp',               '/foo/g',
        'Date',                 /^1995-08-23T/,
        'InvalidDate',          'NaN-NaN-NaNTNaN:NaN:NaN',
        'Array',                '1, 2, 3',
        'Object',               'foo: bar',
        'Function',             /function\s*\(\s*\)\s*{return\s*'fluffy'\s*;\s*}/,
        'NaN',                  'NaN',
        'NativeType',           'Array',
        'NativeFunction',       /function\s*slice\(\)\s*{\s*\[native code\]\s*}/,

        'Window',               TP.rc('^' + topLevelWinName + ', ([\\s\\S]+)'),
        'IFrameWindow',         TP.rc('^' + topLevelWinName + '.UIROOT, ([\\s\\S]+)'),

        // 'Node',                 '[object Node]',
        'HTMLDocument',         /([\s\S]+)/,
        'HTMLElement',          /([\s\S]+)/,

        'XMLDocument',          /<foo ([\s\S]*)bar="baz"([\s\S]*)>Hi there<boo><goo\/><\/boo><moo\/><\/foo>/,
        'XMLElement',           /<foo([\s\S]*)>bar<\/foo>/,

        'AttributeNode',        'foo="bar"',
        'TextNode',             'foo',
        'CDATASectionNode',     '<![CDATA[foo]]>',
        'PINode',               '<?foo bar?>',
        'CommentNode',          '<!--foo-->',
        'DocumentFragmentNode', /<foo([\s\S]*)\/><bar([\s\S]*)\/>/,

        'NodeList',             /^NodeList :: \[([\s\S]+)\]$/,
        'NamedNodeMap',         /^NamedNodeMap :: \{([\s\S]+)\}$/,

        'CSSStyleSheet',        /^CSSStyleSheet :: ([\s\S]+)/,
        'CSSStyleRule',         /^CSSStyleRule :: ([\s\S]+)/,
        'CSSStyleDeclaration',  /^CSSStyleDeclaration :: ([\s\S]+)/,

        'Error',                /^Error :: There was an error([\s\S]*)/,
        'Event',                /^MouseEvent :: mouseover : \([\s\S]+\)$/,
        'XHR',                  /^XMLHttpRequest :: (\d+) : ([\s\S]*)/,

        'TIBETType',                    'TP.core.Node',
        'TP.lang.Object',               'foo: bar',
        'TP.core.Hash',                 'foo => bar',
        'TP.sig.Signal',                'TP.sig.Signal :: (foo => bar)',
        'TP.sig.Exception',             /^TP.sig.Exception :: \(There really was an Error([\s\S]*)\)$/,

        'TP.core.Window',               /^TP.core.Window :: \(([\s\S]+)\)$/,
        'TP.core.HTMLDocumentNode',     /([\s\S]+)/,
        'TP.core.HTMLElementNode',      /([\s\S]+)/,

        'TP.core.XMLDocumentNode',      /<\?xml version="1.0"\?>\s*<foo([\s\S]*)bar="baz"([\s\S]*)>Hi there<boo><goo\/><\/boo><moo\/><\/foo>/,
        'TP.core.XMLElementNode',       /<foo([\s\S]*)>bar<\/foo>/,

        'TP.core.DocumentFragmentNode',         /<foo([\s\S]*)\/><bar([\s\S]*)\/>/,
        'TP.core.AttributeNode',                'foo="bar"',
        'TP.core.TextNode',                     'foo',
        'TP.core.CDATASectionNode',             '<![CDATA[foo]]>',
        'TP.core.ProcessingInstructionNode',    '<?foo bar?>',
        'TP.core.CommentNode',                  '<!--foo-->',

        'TP.path.SimpleTIBETPath',  'foo',
        'TP.path.ComplexTIBETPath', 'foo.bar.baz',
        'TP.path.ElementPath',      '/1/2',
        'TP.path.XTensionPath',     '*[foo]',
        'TP.path.XPathPath',        '//*',

        'TP.sig.Request',           'TP.sig.Request :: (foo => bar)',
        'TP.sig.Response',          'TP.sig.Response :: (foo => bar)',

        'TP.core.TIBETURN',         'urn:tibet:foo',
        'TP.core.HTTPURL',          'http://www.blah.com',
        'TP.core.FileURL',          'file:///goo.txt',
        /* eslint-disable no-script-url */
        'TP.core.JSURI',            'javascript:alert("hi")',
        /* eslint-enable no-script-url */
        'TP.core.WSURL',            'ws://ws.blah.com',
        'TP.core.TIBETURL',         'tibet://top/file:///goo.txt',
        'TP.core.CookieURL',        'cookie://blah=foo',

        'TP.w3.DocType',            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',

        'TP.gui.Point',             '(20, 30)',
        'TP.gui.Rect',              '(0, 0, 100, 100)',
        'TP.gui.Matrix',            '{xx: 1, xy: 0, yx: 0, yy: 1, dx: 0, dy: 0}',
        'TP.gui.Color',             'rgba(0, 255, 255, 1)',

        'TP.gui.LinearGradient',    'gradient-linear(45, 10% rgba(0, 0, 255, 0.5) 50% rgba(0, 255, 255, 1))',
        'TP.gui.RadialGradient',    'gradient-radial(50% 50%, 10% rgba(0, 0, 255, 0.5) 50% rgba(0, 255, 255, 1))',
        'TP.gui.Pattern',           'pattern(url(), 20, 20, 100, 100)',
        'TP.gui.Path',              'M 10,10 M 20,20',

        'TP.core.Job',              /PID([\s\S]+)/,
        'TP.core.Browser_TYPE',     'browser',

        'TP.boot.Annotation',       'This is a message',
        'TP.core.Annotation',       'This is a message'
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.str(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.str(): ' +
                                        diffKeys.asString(', '));
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
                            TP.str(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.str(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('asString() of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.dump.describe('object dump',
function() {

    var topLevelWinName,

        thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    if (TP.sys.hasFeature('karma')) {
        topLevelWinName = top.name + '.' + TP.sys.cfg('tibet.top_win_name');
    } else {
        topLevelWinName = TP.sys.cfg('tibet.top_win_name');
    }

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,               '[Undefined :: undefined]',
        TP.NULL,                '[Null :: null]',
        'Boolean',              '[Boolean :: true]',
        'String',               '[String :: bar]',
        'Number',               '[Number :: 42]',
        'RegExp',               '[RegExp :: /foo/g]',
        'Date',                 /^\[Date :: 1995-08-23T/,
        'InvalidDate',          '[Date :: NaN-NaN-NaNTNaN:NaN:NaN]',
        'Array',                '[Array :: [[Number :: 1], [Number :: 2], [Number :: 3]]]',
        'Object',               '[Object :: foo => bar]',
        'Function',             /\[Function :: function ([\s\S]+)\]/,
        'NaN',                  '[Number :: NaN]',
        'NativeType',           '[Function :: Array]',
        'NativeFunction',       /\[Function :: function\s*slice\(\)\]/,

        'Window',               TP.rc('^\\[DOMWindow :: ' + topLevelWinName + ', ([\\s\\S]+)\\]'),
        'IFrameWindow',         TP.rc('^\\[DOMWindow :: ' + topLevelWinName + '.UIROOT, ([\\s\\S]+)\\]'),

        // 'Node',                 '[object Node]',
        //  NB: The system uses visible documents, which for TIBET are X(HT)ML
        'HTMLDocument',         /^\[HTMLDocument :: ([\s\S]+)\]/,
        'HTMLElement',          /^\[HTMLBodyElement :: ([\s\S]+)\]/,

        'XMLDocument',          /\[XMLDocument :: <foo ([\s\S]*)bar="baz"([\s\S]*)>Hi there<boo><goo\/><\/boo><moo\/><\/foo>\]/,
        'XMLElement',           /\[Element :: <foo([\s\S]*)>bar<\/foo>\]/,

        'AttributeNode',        '[Attr :: foo="bar"]',
        'TextNode',             '[Text :: foo]',
        'CDATASectionNode',     '[CDATASection :: <![CDATA[foo]]>]',
        'PINode',               '[ProcessingInstruction :: <?foo bar?>]',
        'CommentNode',          '[Comment :: <!--foo-->]',
        'DocumentFragmentNode', /\[DocumentFragment :: <foo([\s\S]*)\/><bar([\s\S]*)\/>\]/,

        'NodeList',             /^\[NodeList :: ([\s\S]+)\]$/,
        'NamedNodeMap',         /^\[NamedNodeMap :: \(([\s\S]+)\)\]$/,

        'CSSStyleSheet',        /^\[CSSStyleSheet :: ([\s\S]+)\]/,
        'CSSStyleRule',         /^\[CSSStyleRule :: ([\s\S]+)\]/,
        'CSSStyleDeclaration',  /^\[CSSStyleDeclaration :: ([\s\S]+)\]/,

        'Error',                /^\[Error :: There was an error([\s\S]*)\]/,
        'Event',                /^\[MouseEvent :: mouseover : \([\s\S]+\)\]$/,
        'XHR',                  /^\[XMLHttpRequest :: \((\d+) : ([\s\S]*)\)\]/,

        'TIBETType',                    '[TP.meta.core.Node :: TP.core.Node]',
        'TP.lang.Object',               '[TP.lang.Object :: (foo => [String :: bar])]',
        'TP.core.Hash',                 '[TP.core.Hash :: foo => [String :: bar]]',
        'TP.sig.Signal',                '[TP.sig.Signal :: ([TP.core.Hash :: foo => [String :: bar]])]',
        'TP.sig.Exception',             /^\[TP.sig.Exception :: \(There really was an Error([\s\S]*)\)\]$/,

        'TP.core.Window',               /^\[TP.core.Window :: \(\[DOMWindow :: ([\s\S]+)\]\)\]$/,
        //  NB: The system uses visible documents, which for TIBET are X(HT)ML
        'TP.core.HTMLDocumentNode',     /^\[TP.core.HTMLDocumentNode \(HTMLDocument\) :: ([\s\S]+)\]$/,
        'TP.core.HTMLElementNode',      /^\[TP.html.body \(HTMLBodyElement\) :: ([\s\S]+)\]$/,

        'TP.core.XMLDocumentNode',      /\[TP.core.XMLDocumentNode \(XMLDocument\) :: <\?xml version="1.0"\?>\s*<foo([\s\S]*)bar="baz"([\s\S]*)>Hi there<boo><goo\/><\/boo><moo\/><\/foo>\]/,

        'TP.core.XMLElementNode',       /\[TP.core.XMLElementNode \(Element\) :: <foo([\s\S]*)>bar<\/foo>\]/,

        'TP.core.DocumentFragmentNode', /\[TP.core.DocumentFragmentNode \(DocumentFragment\) :: <foo([\s\S]*)\/><bar([\s\S]*)\/>\]/,
        'TP.core.AttributeNode',        '[TP.core.AttributeNode (Attr) :: foo="bar"]',
        'TP.core.TextNode',             '[TP.core.TextNode (Text) :: foo]',
        'TP.core.CDATASectionNode',     '[TP.core.CDATASectionNode (CDATASection) :: <![CDATA[foo]]>]',
        'TP.core.ProcessingInstructionNode',    '[TP.core.XMLProcessingInstruction (ProcessingInstruction) :: <?foo bar?>]',
        'TP.core.CommentNode',                  '[TP.core.CommentNode (Comment) :: <!--foo-->]',

        'TP.path.SimpleTIBETPath',  '[TP.path.SimpleTIBETPath :: (foo)]',
        'TP.path.ComplexTIBETPath', '[TP.path.ComplexTIBETPath :: (foo.bar.baz)]',
        'TP.path.ElementPath',      '[TP.path.ElementPath :: (/1/2)]',
        'TP.path.XTensionPath',     '[TP.path.XTensionPath :: (*[foo])]',
        'TP.path.XPathPath',        '[TP.path.XPathPath :: (//*)]',

        'TP.sig.Request',           '[TP.sig.Request :: ([TP.core.Hash :: foo => [String :: bar]])]',
        'TP.sig.Response',          '[TP.sig.Response :: ([TP.core.Hash :: foo => [String :: bar]])]',

        'TP.core.TIBETURN',         '[TP.core.TIBETURN :: (urn:tibet:foo)]',
        'TP.core.HTTPURL',          '[TP.core.HTTPURL :: (http://www.blah.com)]',
        'TP.core.FileURL',          '[TP.core.FileURL :: (file:///goo.txt)]',
        'TP.core.JSURI',            '[TP.core.JSURI :: (javascript:alert("hi"))]',
        'TP.core.WSURL',            '[TP.core.WSURL :: (ws://ws.blah.com)]',
        'TP.core.TIBETURL',         '[TP.core.TIBETURL :: (tibet://top/file:///goo.txt)]',
        'TP.core.CookieURL',        '[TP.core.CookieURL :: (cookie://blah=foo)]',

        'TP.w3.DocType',            '[TP.w3.DocType :: (<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">)]',

        'TP.gui.Point',             '[TP.gui.Point :: (20, 30)]',
        'TP.gui.Rect',              '[TP.gui.Rect :: (0, 0, 100, 100)]',
        'TP.gui.Matrix',            '[TP.gui.Matrix :: {xx: 1, xy: 0, yx: 0, yy: 1, dx: 0, dy: 0}]',
        'TP.gui.Color',             '[TP.gui.Color :: rgba(0, 255, 255, 1)]',

        'TP.gui.LinearGradient',    '[TP.gui.LinearGradient :: gradient-linear(45, 10% rgba(0, 0, 255, 0.5) 50% rgba(0, 255, 255, 1))]',
        'TP.gui.RadialGradient',    '[TP.gui.RadialGradient :: gradient-radial(50% 50%, 10% rgba(0, 0, 255, 0.5) 50% rgba(0, 255, 255, 1))]',
        'TP.gui.Pattern',           '[TP.gui.Pattern :: pattern(url(), 20, 20, 100, 100)]',
        'TP.gui.Path',              '[TP.gui.SVGPath :: M 10,10 M 20,20]',

        'TP.core.Job',              /^\[TP.core.Job :: \(([\s\S]*)PID([\s\S]+)\)\]$/,
        'TP.core.Browser_TYPE',     '[TP.meta.core.Browser :: browser]',
        'TP.boot.Annotation',       '[TP.boot.Annotation :: A String,This is a message]',
        'TP.core.Annotation',       '[TP.core.Annotation :: (object => [String :: A String], message => [String :: This is a message])]'
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.dump(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.dump(): ' +
                                        diffKeys.asString(', '));
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
                            TP.dump(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.dump(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('dump of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.htmlstr.describe('object HTMLString',
function() {

    var topLevelWinName,

        thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    if (TP.sys.hasFeature('karma')) {
        topLevelWinName = top.name + '.' + TP.sys.cfg('tibet.top_win_name');
    } else {
        topLevelWinName = TP.sys.cfg('tibet.top_win_name');
    }

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,               'undefined',
        TP.NULL,                'null',
        'Boolean',              'true',
        'String',               'bar',
        'Number',               '42',
        'RegExp',               '/foo/g',
        'Date',                 /^1995-08-23T/,
        'InvalidDate',          'NaN-NaN-NaNTNaN:NaN:NaN',
        'Array',                '<span class="Array"><span data-name="0">1</span><span data-name="1">2</span><span data-name="2">3</span></span>',
        'Object',               'foo: bar',
        'Function',             /function\s*\(\s*\)\s*{return\s*'fluffy'\s*;\s*}/,
        'NaN',                  'NaN',
        'NativeType',           '<span class="NativeType">Array</span>',
        'NativeFunction',       /function\s*slice\(\)\s*{\s*\[native code\]\s*}/,

        'Window',               TP.rc('^<span class="DOMWindow" gid="' + topLevelWinName + '"><span([\\s\\S]*)<\\/span>$'),
        'IFrameWindow',         TP.rc('^<span class="DOMWindow" gid="' + topLevelWinName + '.UIROOT"><span([\\s\\S]*)<\\/span>$'),

        // 'Node',                 '[object Node]',

        'HTMLDocument',         /([\s\S]+)/,
        'HTMLElement',          /([\s\S]+)/,

        'XMLDocument',          /<foo ([\s\S]*)bar="baz"([\s\S]*)>Hi there<boo><goo><\/goo><\/boo><moo><\/moo><\/foo>/,
        'XMLElement',           /<foo([\s\S]*)>bar<\/foo>/,

        'AttributeNode',        'foo="bar"',
        'TextNode',             'foo',
        'CDATASectionNode',     'foo',
        'PINode',               '<?foo bar?>',
        'CommentNode',          '<!--foo-->',
        'DocumentFragmentNode', /<foo([\s\S]*)><\/foo><bar([\s\S]*)><\/bar>/,

        'NodeList',             /<span class="NodeList">([\s\S]*)<span data-name="0">Hi there<\/span><span data-name="1"><boo><goo><\/goo><\/boo><\/span><span data-name="2"><moo><\/moo><\/span><\/span>/,
        'NamedNodeMap',         /<span class="NamedNodeMap">([\s\S]*)<span data-name="key">bar<\/span><span data-name="value">baz<\/span>([\s\S]*)<\/span>/,

        'CSSStyleSheet',        /^<span class="CSSStyleSheet">([\s\S]+)<\/span>$/,
        'CSSStyleRule',         /^<span class="CSSStyleRule">([\s\S]+)<\/span>$/,
        'CSSStyleDeclaration',  /^<span class="CSSStyleDeclaration">([\s\S]+)<\/span>$/,

        'Error',                '<span class="Error" data-name="message">There was an error</span>',
        'Event',                /<span class="Event MouseEvent"><span([\s\S]+)<\/span><\/span>$/,
        'XHR',                  '<span class="XHR"><span data-name="status">0</span><span data-name="responseText"></span></span>',

        'TIBETType',                    '<span class="TP.lang.RootObject">TP.core.Node</span>',
        'TP.lang.Object',               '<span class="TP_lang_Object TP_lang_Object"><span data-name="foo">bar</span></span>',
        'TP.core.Hash',                 '<span class="TP_core_Hash"><span data-name="foo">bar</span></span>',
        'TP.sig.Signal',                '<span class="TP_sig_Signal TP_sig_Signal"><span data-name="payload"><span class="TP_core_Hash"><span data-name="foo">bar</span></span></span></span>',
        'TP.sig.Exception',             '<span class="TP_sig_Exception TP_sig_Exception"><span data-name="payload"><span data-name="message">There really was an Error</span></span></span>',

        'TP.core.Window',               TP.rc('^<span class="TP_core_Window TP_core_Window"><span class="DOMWindow" gid="' + topLevelWinName + '">([\\s\\S]*)<\\/span><\\/span>$'),
        'TP.core.HTMLDocumentNode',     /([\s\S]+)/,
        'TP.core.HTMLElementNode',      /([\s\S]+)/,

        'TP.core.XMLDocumentNode',      /<foo([\s\S]*)bar="baz"([\s\S]*)>Hi there<boo><goo><\/goo><\/boo><moo><\/moo><\/foo>/,
        'TP.core.XMLElementNode',       /<foo([\s\S]*)>bar<\/foo>/,

        'TP.core.DocumentFragmentNode',         /<foo([\s\S]*)><\/foo><bar([\s\S]*)><\/bar>/,
        'TP.core.AttributeNode',                'foo="bar"',
        'TP.core.TextNode',                     'foo',
        'TP.core.CDATASectionNode',             'foo',
        'TP.core.ProcessingInstructionNode',    '<?foo bar?>',
        'TP.core.CommentNode',                  '<!--foo-->',

        'TP.path.SimpleTIBETPath',  '<span class="TP_path_AccessPath TP_path_SimpleTIBETPath">foo</span>',
        'TP.path.ComplexTIBETPath', '<span class="TP_path_AccessPath TP_path_ComplexTIBETPath">foo.bar.baz</span>',
        'TP.path.ElementPath',      '<span class="TP_path_AccessPath TP_path_ElementPath">/1/2</span>',
        'TP.path.XTensionPath',     '<span class="TP_path_AccessPath TP_path_XTensionPath">*[foo]</span>',
        'TP.path.XPathPath',        '<span class="TP_path_AccessPath TP_path_XPathPath">//*</span>',

        'TP.sig.Request',           '<span class="TP_sig_Signal TP_sig_Request"><span data-name="payload"><span class="TP_core_Hash"><span data-name="foo">bar</span></span></span></span>',
        'TP.sig.Response',          '<span class="TP_sig_Signal TP_sig_Response"><span data-name="payload"><span class="TP_core_Hash"><span data-name="foo">bar</span></span></span></span>',

        'TP.core.TIBETURN',         '<span class="TP_core_URI TP_core_TIBETURN">urn:tibet:foo</span>',
        'TP.core.HTTPURL',          '<span class="TP_core_URI TP_core_HTTPURL">http://www.blah.com</span>',
        'TP.core.FileURL',          '<span class="TP_core_URI TP_core_FileURL">file:///goo.txt</span>',
        'TP.core.JSURI',            '<span class="TP_core_URI TP_core_JSURI">javascript:alert(&quot;hi&quot;)</span>',
        'TP.core.WSURL',            '<span class="TP_core_URI TP_core_WSURL">ws://ws.blah.com</span>',
        'TP.core.TIBETURL',         '<span class="TP_core_URI TP_core_TIBETURL">tibet://top/file:///goo.txt</span>',
        'TP.core.CookieURL',        '<span class="TP_core_URI TP_core_CookieURL">cookie://blah=foo</span>',

        'TP.w3.DocType',            '<span class="TP_w3_DocType TP_w3_DocType"><span data-name="doctypename">html</span><span data-name="publicID">-//W3C//DTD XHTML 1.0 Strict//EN</span><span data-name="systemID">http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd</span></span>',

        'TP.gui.Point',             '<span class="TP_gui_Point"><span data-name="x">20</span><span data-name="y">30</span></span>',
        'TP.gui.Rect',              '<span class="TP_gui_Rect"><span data-name="x">0</span><span data-name="y">0</span><span data-name="width">100</span><span data-name="height">100</span></span>',
        'TP.gui.Matrix',            '<span class="TP_gui_Matrix"><span data-name="xx">1</span><span data-name="xy">0</span><span data-name="yx">0</span><span data-name="yy">1</span><span data-name="dx">0</span><span data-name="dy">0</span></span>',
        'TP.gui.Color',             '<span class="TP_gui_Color"><span data-name="r">0</span><span data-name="g">255</span><span data-name="b">255</span><span data-name="a">1</span></span>',

        'TP.gui.LinearGradient',    '<span class="TP_gui_LinearGradient"><span data-name="angle">45</span><span data-name="stop"><span data-name="value">10%</span><span data-name="color"><span class="TP_gui_Color"><span data-name="r">0</span><span data-name="g">0</span><span data-name="b">255</span><span data-name="a">0.5</span></span></span></span><span data-name="stop"><span data-name="value">50%</span><span data-name="color"><span class="TP_gui_Color"><span data-name="r">0</span><span data-name="g">255</span><span data-name="b">255</span><span data-name="a">1</span></span></span></span></span>',
        'TP.gui.RadialGradient',    '<span class="TP_gui_RadialGradient"><span data-name="cx">50%</span><span data-name="cy">50%</span><span data-name="stop"><span data-name="value">10%</span><span data-name="color"><span class="TP_gui_Color"><span data-name="r">0</span><span data-name="g">0</span><span data-name="b">255</span><span data-name="a">0.5</span></span></span></span><span data-name="stop"><span data-name="value">50%</span><span data-name="color"><span class="TP_gui_Color"><span data-name="r">0</span><span data-name="g">255</span><span data-name="b">255</span><span data-name="a">1</span></span></span></span></span>',
        'TP.gui.Pattern',           '<span class="TP_gui_Pattern"><span data-name="x">20</span><span data-name="y">20</span><span data-name="width">100</span><span data-name="height">100</span><span data-name="url">undefined</span></span>',
        'TP.gui.Path',              '<span class="TP_gui_Pattern"><span class="Array"><span data-name="0">M</span><span data-name="1"><span class="Array"><span data-name="0">10</span><span data-name="1">10</span></span></span><span data-name="2">M</span><span data-name="3"><span class="Array"><span data-name="0">20</span><span data-name="1">20</span></span></span></span></span>',

        'TP.core.Job',              /<span class="TP_lang_Object TP_core_Job"><span([\s\S]+)<\/span><\/span>$/,
        'TP.core.Browser_TYPE',     'browser',
        'TP.boot.Annotation',       '<span class="TP_boot_Annotation"><span data-name="object">A String</span><span data-name="message">This is a message</span></span>',
        'TP.core.Annotation',       '<span class="TP_core_Annotation"><span data-name="object">A String</span><span data-name="message">This is a message</span></span>'
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.htmlstr(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.htmlstr(): ' +
                                        diffKeys.asString(', '));
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
                            TP.htmlstr(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.htmlstr(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('HTML String of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.xmlstr.describe('object XMLString',
function() {

    var topLevelWinName,

        thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    if (TP.sys.hasFeature('karma')) {
        topLevelWinName = top.name + '.' + TP.sys.cfg('tibet.top_win_name');
    } else {
        topLevelWinName = TP.sys.cfg('tibet.top_win_name');
    }

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,               'undefined',
        TP.NULL,                'null',
        'Boolean',              'true',
        'String',               'bar',
        'Number',               '42',
        'RegExp',               '/foo/g',
        'Date',                 /^1995-08-23T/,
        'InvalidDate',          'NaN-NaN-NaNTNaN:NaN:NaN',
        'Array',                '<item index="0">1</item><item index="1">2</item><item index="2">3</item>',
        'Object',               'foo: bar',
        'Function',             /function\s*\(\s*\)\s*{return\s*'fluffy'\s*;\s*}/,
        'NaN',                  'NaN',
        'NativeType',           '<type>Array</type>',
        'NativeFunction',       /function\s*slice\(\)\s*{\s*\[native code\]\s*}/,

        'Window',               TP.rc('^<window gid="' + topLevelWinName + '"([\\s\\S]*)\\/>$'),
        'IFrameWindow',         TP.rc('^<window gid="' + topLevelWinName + '.UIROOT"([\\s\\S]*)\\/>$'),

        // 'Node',                 '[object Node]',
        'HTMLDocument',         /([\s\S]+)/,
        'HTMLElement',          /([\s\S]+)/,

        'XMLDocument',          /<foo ([\s\S]*)bar="baz"([\s\S]*)>Hi there<boo><goo\/><\/boo><moo\/><\/foo>/,
        'XMLElement',           /<foo([\s\S]*)>bar<\/foo>/,

        'AttributeNode',        'foo="bar"',
        'TextNode',             'foo',
        'CDATASectionNode',     '<![CDATA[foo]]>',
        'PINode',               '<?foo bar?>',
        'CommentNode',          '<!--foo-->',
        'DocumentFragmentNode', /<foo([\s\S]*)\/><bar([\s\S]*)\/>/,

        'NodeList',             '<node index="0">Hi there</node><node index="1"><boo><goo/></boo></node><node index="2"><moo/></node>',
        'NamedNodeMap',         /([\s\S]*)<bar>baz<\/bar>([\s\S]*)/,

        'CSSStyleSheet',        /^<sheet>([\s\S]+)<\/sheet>$/,
        'CSSStyleRule',         /^<rule>([\s\S]+)<\/rule>$/,
        'CSSStyleDeclaration',  /^<declaration>([\s\S]+)<\/declaration>$/,

        'Error',                /^<error><type>Error<\/type><message>([\s\S]+)<\/message><\/error>$/,
        'Event',                /^<event typename="MouseEvent"([\s\S]*)\/>$/,
        'XHR',                  /^<xhr><status>(\d+)<\/status><content>([\s\S]*)<\/content><\/xhr>$/,

        'TIBETType',                    '<type>TP.core.Node</type>',
        'TP.lang.Object',               '<instance type="TP.lang.Object"><foo>bar</foo></instance>',
        'TP.core.Hash',                 '<instance type="TP.core.Hash"><foo>bar</foo></instance>',
        'TP.sig.Signal',                '<instance type="TP.sig.Signal"><payload><instance type="TP.core.Hash"><foo>bar</foo></instance></payload></instance>',
        'TP.sig.Exception',             /^<instance type="TP.sig.Exception"><payload><message>([\s\S]+)<\/message><\/payload><\/instance>$/,

        'TP.core.Window',               TP.rc('^<instance type="TP.core.Window"><window gid="' + topLevelWinName + '"([\\s\\S]*)\\/><\\/instance>$'),
        //  NB: The system uses visible documents, which for TIBET are X(HT)ML
        'TP.core.HTMLDocumentNode',     /^<instance type="TP.core.HTMLDocumentNode">([\s\S]+)<\/instance>$/,
        'TP.core.HTMLElementNode',      /^<instance type="TP.html.body">([\s\S]+)<\/instance>$/,

        'TP.core.XMLDocumentNode',      /<instance type="TP.core.XMLDocumentNode"><foo bar="baz"([\s\S]*)>Hi there<boo><goo\/><\/boo><moo\/><\/foo><\/instance>/,

        'TP.core.XMLElementNode',       /<instance type="TP.core.XMLElementNode"><foo([\s\S]*)>bar<\/foo><\/instance>/,

        'TP.core.DocumentFragmentNode', /<instance type="TP.core.DocumentFragmentNode"><foo([\s\S]*)\/><bar([\s\S]*)\/><\/instance>/,
        'TP.core.AttributeNode',        '<instance type="TP.core.AttributeNode">foo="bar"</instance>',
        'TP.core.TextNode',             '<instance type="TP.core.TextNode">foo</instance>',
        'TP.core.CDATASectionNode',     '<instance type="TP.core.CDATASectionNode"><![CDATA[foo]]></instance>',
        'TP.core.ProcessingInstructionNode',    '<instance type="TP.core.XMLProcessingInstruction"><?foo bar?></instance>',
        'TP.core.CommentNode',                  '<instance type="TP.core.CommentNode"><!--foo--></instance>',

        'TP.path.SimpleTIBETPath',  '<instance type="TP.path.SimpleTIBETPath" path="foo"/>',
        'TP.path.ComplexTIBETPath', '<instance type="TP.path.ComplexTIBETPath" path="foo.bar.baz"/>',
        'TP.path.ElementPath',      '<instance type="TP.path.ElementPath" path="/1/2"/>',
        'TP.path.XTensionPath',     '<instance type="TP.path.XTensionPath" path="*[foo]"/>',
        'TP.path.XPathPath',        '<instance type="TP.path.XPathPath" path="//*"/>',

        'TP.sig.Request',           '<instance type="TP.sig.Request"><payload><instance type="TP.core.Hash"><foo>bar</foo></instance></payload></instance>',
        'TP.sig.Response',           '<instance type="TP.sig.Response"><payload><instance type="TP.core.Hash"><foo>bar</foo></instance></payload></instance>',

        'TP.core.TIBETURN',         '<instance type="TP.core.TIBETURN">urn:tibet:foo</instance>',
        'TP.core.HTTPURL',          '<instance type="TP.core.HTTPURL">http://www.blah.com</instance>',
        'TP.core.FileURL',          '<instance type="TP.core.FileURL">file:///goo.txt</instance>',
        'TP.core.JSURI',            '<instance type="TP.core.JSURI">javascript:alert("hi")</instance>',
        'TP.core.WSURL',            '<instance type="TP.core.WSURL">ws://ws.blah.com</instance>',
        'TP.core.TIBETURL',         '<instance type="TP.core.TIBETURL">tibet://top/file:///goo.txt</instance>',
        'TP.core.CookieURL',        '<instance type="TP.core.CookieURL">cookie://blah=foo</instance>',

        'TP.w3.DocType',            '<instance type="TP.w3.DocType"><doctypename>html</doctypename><publicID>-//W3C//DTD XHTML 1.0 Strict//EN</publicID><systemID>http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd</systemID></instance>',

        'TP.gui.Point',             '<instance type="TP.gui.Point" x="20" y="30"/>',
        'TP.gui.Rect',              '<instance type="TP.gui.Rect" x="0" y="0" width="100" height="100"/>',
        'TP.gui.Matrix',            '<instance type="TP.gui.Matrix" xx="1" xy="0" yx="0" yy="1" dx="0" dy="0"/>',
        'TP.gui.Color',             '<instance type="TP.gui.Color" r="0" g="255" b="255" a="1"/>',

        'TP.gui.LinearGradient',    '<instance type="TP.gui.LinearGradient" angle="45"><stop><value>10%</value><color><instance type="TP.gui.Color" r="0" g="0" b="255" a="0.5"/></color></stop><stop><value>50%</value><color><instance type="TP.gui.Color" r="0" g="255" b="255" a="1"/></color></stop></instance>',
        'TP.gui.RadialGradient',    '<instance type="TP.gui.RadialGradient" cx="50%" cy="50%"><stop><value>10%</value><color><instance type="TP.gui.Color" r="0" g="0" b="255" a="0.5"/></color></stop><stop><value>50%</value><color><instance type="TP.gui.Color" r="0" g="255" b="255" a="1"/></color></stop></instance>',
        'TP.gui.Pattern',           '<instance type="TP.gui.Pattern" x="20" y="20" width="100" height="100"><url>null</url></instance>',
        'TP.gui.Path',              '<instance type="TP.gui.SVGPath">M 10,10 M 20,20</instance>',

        'TP.core.Job',              /^([\s\S]*)<PID>(\d+)<\/PID>([\s\S]+)$/,
        'TP.core.Browser_TYPE',     'browser',
        'TP.boot.Annotation',       '<instance type="TP.boot.Annotation" object="A String" message="This is a message"/>',
        'TP.core.Annotation',       '<instance type="TP.core.Annotation" object="A String" message="This is a message"/>'
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.xmlstr(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.xmlstr(): ' +
                                        diffKeys.asString(', '));
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
                            TP.xmlstr(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.xmlstr(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('XML String of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.pretty.describe('object pretty',
function() {

    var topLevelWinName,

        thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    if (TP.sys.hasFeature('karma')) {
        topLevelWinName = top.name + '.' + TP.sys.cfg('tibet.top_win_name');
    } else {
        topLevelWinName = TP.sys.cfg('tibet.top_win_name');
    }

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,               '<dl class="pretty Undefined"><dt/><dd>undefined</dd></dl>',
        TP.NULL,                '<dl class="pretty Null"><dt/><dd>null</dd></dl>',
        'Boolean',              '<dl class="pretty Boolean"><dt/><dd>true</dd></dl>',
        'String',               '<dl class="pretty String"><dt/><dd>bar</dd></dl>',
        'Number',               '<dl class="pretty Number"><dt/><dd>42</dd></dl>',
        'RegExp',               '<dl class="pretty RegExp"><dt/><dd>/foo/g</dd></dl>',
        'Date',                 /<dl class="pretty Date"><dt\/><dd>1995-08-23T\d{2}:\d{2}:\d{2}<\/dd><\/dl>/,
        'InvalidDate',          '<dl class="pretty Date"><dt/><dd>NaN-NaN-NaNTNaN:NaN:NaN</dd></dl>',
        'Array',                '<dl class="pretty Array"><dt>Type name</dt><dd class="pretty typename">Array</dd><dt class="pretty key">0</dt><dd class="pretty value"><dl class="pretty Number"><dt/><dd>1</dd></dl></dd><dt class="pretty key">1</dt><dd class="pretty value"><dl class="pretty Number"><dt/><dd>2</dd></dl></dd><dt class="pretty key">2</dt><dd class="pretty value"><dl class="pretty Number"><dt/><dd>3</dd></dl></dd></dl>',
        'Object',               'foo: bar',
        'Function',             /<dl class="pretty Function"><dt\/><dd>function\s*\(\s*\)\s*{return\s*'fluffy'\s*;\s*}<\/dd><\/dl>/,
        'NaN',                  'NaN',
        'NativeType',           '<dl class="pretty NativeType"><dt>Type name</dt><dd class="pretty typename">NativeType.&lt;Array&gt;</dd><dt/><dd class="pretty value">Array</dd></dl>',
        'NativeFunction',       /<dl class="pretty Function"><dt\/><dd>function\s*slice\(\)\s*{\s*\[native code\]\s*}<\/dd><\/dl>/,

        'Window',               TP.rc('^<dl class="pretty DOMWindow"><dt>Type name<\\/dt><dd class="pretty typename">DOMWindow<\\/dd><dt class="pretty key">Global ID<\\/dt><dd>' + topLevelWinName + '<\\/dd>([\\s\\S]*)<\\/dl>$'),
        'IFrameWindow',         TP.rc('^<dl class="pretty DOMWindow"><dt>Type name<\\/dt><dd class="pretty typename">DOMWindow<\\/dd><dt class="pretty key">Global ID<\\/dt><dd>' + topLevelWinName + '.UIROOT<\\/dd>([\\s\\S]*)<\\/dl>$'),

        // 'Node',                 '[object Node]',
        //  NB: The system uses visible documents, which for TIBET are X(HT)ML
        'HTMLDocument',         /^<dl class="pretty HTMLDocument"><dt>Type name<\/dt><dd class="pretty typename">HTMLDocument<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">([\s\S]*)<\/dd><\/dl>$/,
        'HTMLElement',         /^<dl class="pretty HTMLBodyElement"><dt>Type name<\/dt><dd class="pretty typename">HTMLBodyElement<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">([\s\S]*)<\/dd><\/dl>$/,

        'XMLDocument',          /<dl class="pretty XMLDocument"><dt>Type name<\/dt><dd class="pretty typename">XMLDocument<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">&lt;foo ([\s\S]*)bar=&quot;baz&quot;([\s\S]*)&gt;Hi there&lt;boo&gt;&lt;goo\/&gt;&lt;\/boo&gt;&lt;moo\/&gt;&lt;\/foo&gt;<\/dd><\/dl>/,
        'XMLElement',           /<dl class="pretty Element"><dt>Type name<\/dt><dd class="pretty typename">Element<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">&lt;foo([\s\S]*)&gt;bar&lt;\/foo&gt;<\/dd><\/dl>/,

        'AttributeNode',        '<dl class="pretty Attr"><dt>Type name</dt><dd class="pretty typename">Attr</dd><dt class="pretty key">Content</dt><dd class="pretty value">foo=&quot;bar&quot;</dd></dl>',
        'TextNode',             '<dl class="pretty Text"><dt>Type name</dt><dd class="pretty typename">Text</dd><dt class="pretty key">Content</dt><dd class="pretty value">foo</dd></dl>',
        'CDATASectionNode',     '<dl class="pretty CDATASection"><dt>Type name</dt><dd class="pretty typename">CDATASection</dd><dt class="pretty key">Content</dt><dd class="pretty value">&lt;![CDATA[foo]]&gt;</dd></dl>',
        'PINode',               '<dl class="pretty ProcessingInstruction"><dt>Type name</dt><dd class="pretty typename">ProcessingInstruction</dd><dt class="pretty key">Content</dt><dd class="pretty value">&lt;?foo bar?&gt;</dd></dl>',
        'CommentNode',          '<dl class="pretty Comment"><dt>Type name</dt><dd class="pretty typename">Comment</dd><dt class="pretty key">Content</dt><dd class="pretty value">&lt;!--foo--&gt;</dd></dl>',
        'DocumentFragmentNode', /<dl class="pretty DocumentFragment"><dt>Type name<\/dt><dd class="pretty typename">DocumentFragment<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">&lt;foo([\s\S]*)\/&gt;&lt;bar([\s\S]*)\/&gt;<\/dd><\/dl>/,

        'NodeList',             '<dl class="pretty NodeList"><dt>Type name</dt><dd class="pretty typename">NodeList</dd><dt class="pretty key">0</dt><dd class="pretty value">Hi there</dd><dt class="pretty key">1</dt><dd class="pretty value">&lt;boo&gt;&lt;goo/&gt;&lt;/boo&gt;</dd><dt class="pretty key">2</dt><dd class="pretty value">&lt;moo/&gt;</dd></dl>',
        'NamedNodeMap',         /<dl class="pretty NamedNodeMap"><dt>Type name<\/dt><dd class="pretty typename">NamedNodeMap<\/dd><dt class="pretty key">bar<\/dt><dd class="pretty value">baz<\/dd>([\s\S]*)<\/dl>/,

        'CSSStyleSheet',        /^<dl class="pretty CSSStyleSheet"><dt>Type name<\/dt><dd class="pretty typename">CSSStyleSheet<\/dd>([\s\S]+)<\/dd><\/dl>$/,
        'CSSStyleRule',         /^<dl class="pretty CSSStyleRule"><dt>Type name<\/dt><dd class="pretty typename">CSSStyleRule<\/dd>([\s\S]+)<\/dd><\/dl>$/,
        'CSSStyleDeclaration',  /^<dl class="pretty CSSStyleDeclaration"><dt>Type name<\/dt><dd class="pretty typename">CSSStyleDeclaration<\/dd>([\s\S]+)<\/dd><\/dl>$/,

        'Error',                '<dl class="pretty Error"><dt>Type name</dt><dd class="pretty typename">Error</dd><dt class="pretty key">Message</dt><dd class="pretty value">There was an error</dd></dl>',

        'Event',                /^<dl class="pretty MouseEvent"><dt>Type name<\/dt><dd class="pretty typename">MouseEvent<\/dd>([\s\S]+)<\/dd><\/dl>$/,
        'XHR',                  /^<dl class="pretty XMLHttpRequest"><dt>Type name<\/dt><dd class="pretty typename">XMLHttpRequest<\/dd><dt class="pretty key">Status<\/dt><dd class="pretty value">0<\/dd><dt class="pretty key">Response text<\/dt><dd class="pretty value">([\s\S]*)<\/dd><\/dl>$/,

        'TIBETType',                    '<dl class="pretty TP.lang.RootObject"><dt>Type name</dt><dd class="pretty typename">TP.lang.RootObject.&lt;TP.core.Node&gt;</dd><dt/><dd class="pretty value">TP.core.Node</dd></dl>',
        'TP.lang.Object',               '<dl class="pretty TP_lang_Object"><dt>Type name</dt><dd class="pretty typename">TP.lang.Object</dd><dt class="pretty key">foo</dt><dd class="pretty value"><dl class="pretty String"><dt/><dd>bar</dd></dl></dd></dl>',
        'TP.core.Hash',                 '<dl class="pretty TP_core_Hash"><dt>Type name</dt><dd class="pretty typename">TP.core.Hash</dd><dt class="pretty key">foo</dt><dd class="pretty value"><dl class="pretty String"><dt/><dd>bar</dd></dl></dd></dl>',
        'TP.sig.Signal',                '<dl class="pretty TP_sig_Signal"><dt>Type name</dt><dd class="pretty typename">TP.sig.Signal</dd><dl class="pretty TP_core_Hash"><dt>Type name</dt><dd class="pretty typename">TP.core.Hash</dd><dt class="pretty key">foo</dt><dd class="pretty value"><dl class="pretty String"><dt/><dd>bar</dd></dl></dd></dl></dl>',
        'TP.sig.Exception',             '<dl class="pretty TP_sig_Exception"><dt>Type name</dt><dd class="pretty typename">TP.sig.Exception</dd><dl class="pretty String"><dt/><dd>There really was an Error</dd></dl></dl>',

        'TP.core.Window',               TP.rc('<dl class="pretty TP_core_Window"><dt>Type name<\\/dt><dd class="pretty typename">TP.core.Window<\\/dd><dl class="pretty DOMWindow"><dt>Type name<\\/dt><dd class="pretty typename">DOMWindow<\\/dd><dt class="pretty key">Global ID<\\/dt><dd>' + topLevelWinName + '<\\/dd>([\\s\\S]*)<\\/dl>$'),
        //  NB: The system uses visible documents, which for TIBET are X(HT)ML
        'TP.core.HTMLDocumentNode',     /^<dl class="pretty TP_core_HTMLDocumentNode"><dt>Type name<\/dt><dd class="pretty typename">HTMLDocument<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">([\s\S]*)<\/dd><\/dl>$/,
        'TP.core.HTMLElementNode',      /^<dl class="pretty TP_html_body"><dt>Type name<\/dt><dd class="pretty typename">HTMLBodyElement<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">([\s\S]*)<\/dd><\/dl>$/,

        'TP.core.XMLDocumentNode',      /<dl class="pretty TP_core_XMLDocumentNode"><dt>Type name<\/dt><dd class="pretty typename">XMLDocument<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value"><dl class="pretty XMLDocument"><dt>Type name<\/dt><dd class="pretty typename">XMLDocument<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">&lt;foo bar=&quot;baz&quot;([\s\S]*);&gt;Hi there&lt;boo&gt;&lt;goo\/&gt;&lt;\/boo&gt;&lt;moo\/&gt;&lt;\/foo&gt;<\/dd><\/dl><\/dd><\/dl>/,
        'TP.core.XMLElementNode',       /<dl class="pretty TP_core_XMLElementNode"><dt>Type name<\/dt><dd class="pretty typename">Element<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value"><dl class="pretty Element"><dt>Type name<\/dt><dd class="pretty typename">Element<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">&lt;foo([\s\S]*)&gt;bar&lt;\/foo&gt;<\/dd><\/dl><\/dd><\/dl>/,

        'TP.core.DocumentFragmentNode', /<dl class="pretty TP_core_DocumentFragmentNode"><dt>Type name<\/dt><dd class="pretty typename">DocumentFragment<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value"><dl class="pretty DocumentFragment"><dt>Type name<\/dt><dd class="pretty typename">DocumentFragment<\/dd><dt class="pretty key">Content<\/dt><dd class="pretty value">&lt;foo([\s\S]*)\/&gt;&lt;bar([\s\S]*)\/&gt;<\/dd><\/dl><\/dd><\/dl>/,
        'TP.core.AttributeNode',        '<dl class="pretty TP_core_AttributeNode"><dt>Type name</dt><dd class="pretty typename">Attr</dd><dt class="pretty key">Content</dt><dd class="pretty value"><dl class="pretty Attr"><dt>Type name</dt><dd class="pretty typename">Attr</dd><dt class="pretty key">Content</dt><dd class="pretty value">foo=&quot;bar&quot;</dd></dl></dd></dl>',
        'TP.core.TextNode',             '<dl class="pretty TP_core_TextNode"><dt>Type name</dt><dd class="pretty typename">Text</dd><dt class="pretty key">Content</dt><dd class="pretty value"><dl class="pretty Text"><dt>Type name</dt><dd class="pretty typename">Text</dd><dt class="pretty key">Content</dt><dd class="pretty value">foo</dd></dl></dd></dl>',
        'TP.core.CDATASectionNode',     '<dl class="pretty TP_core_CDATASectionNode"><dt>Type name</dt><dd class="pretty typename">CDATASection</dd><dt class="pretty key">Content</dt><dd class="pretty value"><dl class="pretty CDATASection"><dt>Type name</dt><dd class="pretty typename">CDATASection</dd><dt class="pretty key">Content</dt><dd class="pretty value">&lt;![CDATA[foo]]&gt;</dd></dl></dd></dl>',
        'TP.core.ProcessingInstructionNode',    '<dl class="pretty TP_core_XMLProcessingInstruction"><dt>Type name</dt><dd class="pretty typename">ProcessingInstruction</dd><dt class="pretty key">Content</dt><dd class="pretty value"><dl class="pretty ProcessingInstruction"><dt>Type name</dt><dd class="pretty typename">ProcessingInstruction</dd><dt class="pretty key">Content</dt><dd class="pretty value">&lt;?foo bar?&gt;</dd></dl></dd></dl>',
        'TP.core.CommentNode',                  '<dl class="pretty TP_core_CommentNode"><dt>Type name</dt><dd class="pretty typename">Comment</dd><dt class="pretty key">Content</dt><dd class="pretty value"><dl class="pretty Comment"><dt>Type name</dt><dd class="pretty typename">Comment</dd><dt class="pretty key">Content</dt><dd class="pretty value">&lt;!--foo--&gt;</dd></dl></dd></dl>',

        'TP.path.SimpleTIBETPath',  '<dl class="pretty TP_path_SimpleTIBETPath"><dt>Type name</dt><dd class="pretty typename">TP.path.SimpleTIBETPath</dd><dt class="pretty key">Path:</dt><dd class="pretty value">foo</dd></dl>',
        'TP.path.ComplexTIBETPath', '<dl class="pretty TP_path_ComplexTIBETPath"><dt>Type name</dt><dd class="pretty typename">TP.path.ComplexTIBETPath</dd><dt class="pretty key">Path:</dt><dd class="pretty value">foo.bar.baz</dd></dl>',
        'TP.path.ElementPath',      '<dl class="pretty TP_path_ElementPath"><dt>Type name</dt><dd class="pretty typename">TP.path.ElementPath</dd><dt class="pretty key">Path:</dt><dd class="pretty value">/1/2</dd></dl>',
        'TP.path.XTensionPath',     '<dl class="pretty TP_path_XTensionPath"><dt>Type name</dt><dd class="pretty typename">TP.path.XTensionPath</dd><dt class="pretty key">Path:</dt><dd class="pretty value">*[foo]</dd></dl>',
        'TP.path.XPathPath',        '<dl class="pretty TP_path_XPathPath"><dt>Type name</dt><dd class="pretty typename">TP.path.XPathPath</dd><dt class="pretty key">Path:</dt><dd class="pretty value">//*</dd></dl>',

        'TP.sig.Request',           '<dl class="pretty TP_sig_Request"><dt>Type name</dt><dd class="pretty typename">TP.sig.Request</dd><dl class="pretty TP_core_Hash"><dt>Type name</dt><dd class="pretty typename">TP.core.Hash</dd><dt class="pretty key">foo</dt><dd class="pretty value"><dl class="pretty String"><dt/><dd>bar</dd></dl></dd></dl></dl>',
        'TP.sig.Response',          '<dl class="pretty TP_sig_Response"><dt>Type name</dt><dd class="pretty typename">TP.sig.Response</dd><dl class="pretty TP_core_Hash"><dt>Type name</dt><dd class="pretty typename">TP.core.Hash</dd><dt class="pretty key">foo</dt><dd class="pretty value"><dl class="pretty String"><dt/><dd>bar</dd></dl></dd></dl></dl>',

        'TP.core.TIBETURN',         '<dl class="pretty TP_core_TIBETURN"><dt/><dd><dl class="pretty String"><dt/><dd>urn:tibet:foo</dd></dl></dd></dl>',
        'TP.core.HTTPURL',          '<dl class="pretty TP_core_HTTPURL"><dt/><dd><dl class="pretty String"><dt/><dd>http://www.blah.com</dd></dl></dd></dl>',
        'TP.core.FileURL',          '<dl class="pretty TP_core_FileURL"><dt/><dd><dl class="pretty String"><dt/><dd>file:///goo.txt</dd></dl></dd></dl>',
        'TP.core.JSURI',            '<dl class="pretty TP_core_JSURI"><dt/><dd><dl class="pretty String"><dt/><dd>javascript:alert("hi")</dd></dl></dd></dl>',
        'TP.core.WSURL',            '<dl class="pretty TP_core_WSURL"><dt/><dd><dl class="pretty String"><dt/><dd>ws://ws.blah.com</dd></dl></dd></dl>',
        'TP.core.TIBETURL',         '<dl class="pretty TP_core_TIBETURL"><dt/><dd><dl class="pretty String"><dt/><dd>tibet://top/file:///goo.txt</dd></dl></dd></dl>',
        'TP.core.CookieURL',        '<dl class="pretty TP_core_CookieURL"><dt/><dd><dl class="pretty String"><dt/><dd>cookie://blah=foo</dd></dl></dd></dl>',

        'TP.w3.DocType',            '<dl class="pretty TP_w3_DocType"><dt>Type name</dt><dd class="pretty typename">TP.w3.DocType</dd><dt class="pretty key">DOCTYPE:</dt><dd class="pretty value">html</dd><dt class="pretty key">PUBLIC:</dt><dd class="pretty value">-//W3C//DTD XHTML 1.0 Strict//EN</dd><dt class="pretty key">SYSTEM:</dt><dd class="pretty value">http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd</dd></dl>',

        'TP.gui.Point',             '<dl class="pretty TP_gui_Point"><dt>Type name</dt><dd class="pretty typename">TP.gui.Point</dd><dt class="pretty key">x</dt><dd class="pretty value">20</dd><dt class="pretty key">y</dt><dd class="pretty value">30</dd></dl>',
        'TP.gui.Rect',              '<dl class="pretty TP_gui_Rect"><dt>Type name</dt><dd class="pretty typename">TP.gui.Rect</dd><dt class="pretty key">x</dt><dd class="pretty value">0</dd><dt class="pretty key">y</dt><dd class="pretty value">0</dd><dt class="pretty key">width</dt><dd class="pretty value">100</dd><dt class="pretty key">height</dt><dd class="pretty value">100</dd></dl>',
        'TP.gui.Matrix',            '<dl class="pretty TP_gui_Matrix"><dt>Type name</dt><dd class="pretty typename">TP.gui.Matrix</dd><dt class="pretty key">xx</dt><dd class="pretty value">1</dd><dt class="pretty key">xy</dt><dd class="pretty value">0</dd><dt class="pretty key">yx</dt><dd class="pretty value">0</dd><dt class="pretty key">yy</dt><dd class="pretty value">1</dd><dt class="pretty key">dx</dt><dd class="pretty value">0</dd><dt class="pretty key">dy</dt><dd class="pretty value">0</dd></dl>',
        'TP.gui.Color',             '<dl class="pretty TP_gui_Color"><dt>Type name</dt><dd class="pretty typename">TP.gui.Color</dd><dt class="pretty key">R</dt><dd class="pretty value">0</dd><dt class="pretty key">G</dt><dd class="pretty value">255</dd><dt class="pretty key">B</dt><dd class="pretty value">255</dd><dt class="pretty key">A</dt><dd class="pretty value">1</dd></dl>',

        'TP.gui.LinearGradient',    '<dl class="pretty TP_gui_LinearGradient"><dt>Type name</dt><dd class="pretty typename">TP.gui.LinearGradient</dd><dt class="pretty key">angle</dt><dd class="pretty value">45</dd><dt class="pretty key">stop</dt><dd class="pretty value"><dl><dt class="pretty key">value</dt><dd class="pretty value">10%</dd><dt class="pretty key">color</dt><dd class="pretty value"><dl class="pretty TP_gui_Color"><dt>Type name</dt><dd class="pretty typename">TP.gui.Color</dd><dt class="pretty key">R</dt><dd class="pretty value">0</dd><dt class="pretty key">G</dt><dd class="pretty value">0</dd><dt class="pretty key">B</dt><dd class="pretty value">255</dd><dt class="pretty key">A</dt><dd class="pretty value">0.5</dd></dl></dd></dl></dd><dt class="pretty key">stop</dt><dd class="pretty value"><dl><dt class="pretty key">value</dt><dd class="pretty value">50%</dd><dt class="pretty key">color</dt><dd class="pretty value"><dl class="pretty TP_gui_Color"><dt>Type name</dt><dd class="pretty typename">TP.gui.Color</dd><dt class="pretty key">R</dt><dd class="pretty value">0</dd><dt class="pretty key">G</dt><dd class="pretty value">255</dd><dt class="pretty key">B</dt><dd class="pretty value">255</dd><dt class="pretty key">A</dt><dd class="pretty value">1</dd></dl></dd></dl></dd></dl>',
        'TP.gui.RadialGradient',    '<dl class="pretty TP_gui_RadialGradient"><dt>Type name</dt><dd class="pretty typename">TP.gui.RadialGradient</dd><dt class="pretty key">cx</dt><dd class="pretty value">50%</dd><dt class="pretty key">cy</dt><dd class="pretty value">50%</dd><dt class="pretty key">stop</dt><dd class="pretty value"><dl><dt class="pretty key">value</dt><dd class="pretty value">10%</dd><dt class="pretty key">color</dt><dd class="pretty value"><dl class="pretty TP_gui_Color"><dt>Type name</dt><dd class="pretty typename">TP.gui.Color</dd><dt class="pretty key">R</dt><dd class="pretty value">0</dd><dt class="pretty key">G</dt><dd class="pretty value">0</dd><dt class="pretty key">B</dt><dd class="pretty value">255</dd><dt class="pretty key">A</dt><dd class="pretty value">0.5</dd></dl></dd></dl></dd><dt class="pretty key">stop</dt><dd class="pretty value"><dl><dt class="pretty key">value</dt><dd class="pretty value">50%</dd><dt class="pretty key">color</dt><dd class="pretty value"><dl class="pretty TP_gui_Color"><dt>Type name</dt><dd class="pretty typename">TP.gui.Color</dd><dt class="pretty key">R</dt><dd class="pretty value">0</dd><dt class="pretty key">G</dt><dd class="pretty value">255</dd><dt class="pretty key">B</dt><dd class="pretty value">255</dd><dt class="pretty key">A</dt><dd class="pretty value">1</dd></dl></dd></dl></dd></dl>',
        'TP.gui.Pattern',           '<dl class="pretty TP_gui_Pattern"><dt>Type name</dt><dd class="pretty typename">TP.gui.Pattern</dd><dt class="pretty key">x</dt><dd class="pretty value">20</dd><dt class="pretty key">y</dt><dd class="pretty value">20</dd><dt class="pretty key">width</dt><dd class="pretty value">100</dd><dt class="pretty key">height</dt><dd class="pretty value">100</dd><dt class="pretty key">url</dt><dd class="pretty value">null</dd></dl>',
        'TP.gui.Path',              '<dl class="pretty TP_gui_SVGPath"><dt>Type name</dt><dd class="pretty typename">TP.gui.SVGPath</dd><dt class="pretty key">Segments</dt><dd class="pretty value"><dl class="pretty String"><dt/><dd>M 10,10 M 20,20</dd></dl></dd></dl>',

        'TP.core.Job',              /^<dl class="pretty TP_core_Job"><dt>Type name<\/dt><dd class="pretty typename">TP.core.Job<\/dd>([\s\S]+)<dt class="pretty key">PID<\/dt>([\s\S]+)<\/dl>$/,
        'TP.core.Browser_TYPE',     'browser',
        'TP.boot.Annotation',       '<dl class="pretty TP_boot_Annotation"><dt>Type name</dt><dd class="pretty typename">TP.boot.Annotation</dd><dt class="pretty key">object</dt><dd class="pretty value">A String</dd><dt class="pretty key">message</dt><dd class="pretty value">This is a message</dd></dl>',
        'TP.core.Annotation',       '<dl class="pretty TP_core_Annotation"><dt>Type name</dt><dd class="pretty typename">TP.core.Annotation</dd><dt class="pretty key">object</dt><dd class="pretty value"><dl class="pretty String"><dt/><dd>A String</dd></dl></dd><dt class="pretty key">message</dt><dd class="pretty value"><dl class="pretty String"><dt/><dd>This is a message</dd></dl></dd></dl>'
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.pretty(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.pretty(): ' +
                                        diffKeys.asString(', '));
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
                            TP.pretty(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.pretty(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('pretty of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.jsonsrc.describe('object JSON source',
function() {

    var topLevelWinName,

        thisref,

        testData,
        testKeys,

        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal;

    TP.$$setupCommonObjectValues();

    if (TP.sys.hasFeature('karma')) {
        topLevelWinName = top.name + '.' + TP.sys.cfg('tibet.top_win_name');
    } else {
        topLevelWinName = TP.sys.cfg('tibet.top_win_name');
    }

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    /* eslint-disable no-multi-spaces */
    correctValues = TP.hc(
        TP.UNDEF,               'undefined',
        TP.NULL,                'null',
        'Boolean',              'true',
        'String',               '"bar"',
        'Number',               '42',
        'RegExp',               '"/foo/g"',
        'Date',                 /"1995-08-23T\d{2}:\d{2}:\d{2}.\d{3}Z"/,
        'InvalidDate',          '"NaN-NaN-NaNTNaN:NaN:NaN"',
        'Array',                '[1,2,3]',
        'Object',               '{"foo":"bar"}',
        'Function',             /function\s*\(\s*\)\s*{return\s*'fluffy'\s*;\s*}/,
        'NaN',                  '"NaN"',
        'NativeType',           '{"type":"NativeType","data":{"name":"Array","supertypes":["Object"]}}',
        'NativeFunction',       /function\s*slice\(\)\s*{\s*\[native code\]\s*}/,

        'Window',               TP.rc('^{"type":"DOMWindow","data":{"gid":"' + topLevelWinName + '"([\\s\\S]*)}}$'),
        'IFrameWindow',         TP.rc('^{"type":"DOMWindow","data":{"gid":"' + topLevelWinName + '.UIROOT"([\\s\\S]*)}}$'),

        // 'Node',                 '[object Node]',
        //  NB: The system uses visible documents, which for TIBET are X(HT)ML
        'HTMLDocument',         /^{"type":"HTMLDocument","data":([\s\S]*)}$/,
        'HTMLElement',          /^{"type":"HTMLBodyElement","data":([\s\S]*)}$/,

        'XMLDocument',          /\{"type":"XMLDocument","data":\{"foo":\{"@bar":/,
        'XMLElement',           /\{"type":"Element","data":\{"foo"/,

        'AttributeNode',        '{"type":"Attr","data":{"foo":"bar"}}',
        'TextNode',             '{"type":"Text","data":"foo"}',
        'CDATASectionNode',     '{"type":"CDATASection","data":"foo"}',
        'PINode',               '{"type":"ProcessingInstruction","data":{"target":"foo","data":"bar"}}',
        'CommentNode',          '{"type":"Comment","data":"foo"}',
        'DocumentFragmentNode', /\{"type":"DocumentFragment","data":\[\{"type":"Element","data":/,

        'NodeList',             /\{"type":"NodeList","data":\[\{"type":"Text","data":"Hi there"\},\{"type":"Element",/,
        'NamedNodeMap',         /\{"type":"NamedNodeMap","data":\{"bar":"baz"([\s\S]*)\}\}/,

        'CSSStyleSheet',        /^{"type":"Stylesheet","data":\[([\s\S]+)\]}$/,
        'CSSStyleRule',         /^{"type":"Rule","data":"([\s\S]+)"}$/,
        'CSSStyleDeclaration',  /^{"type":"Declaration","data":"([\s\S]+)"}$/,

        'Error',                /^{"type":"Error","data":"([\s\S]+)"}$/,
        'Event',                /^{"type":"MouseEvent","data":{([\s\S]+)}}$/,
        'XHR',                  /^{"type":"XHR","data":{"status":"([\s\S]+)","content":"([\s\S]*)"}}$/,

        'TIBETType',                    '{"type":"TP.lang.RootObject","data":{"name":"TP.core.Node","supertypes":["TP.lang.Object","TP.lang.RootObject","Object"]}}',
        'TP.lang.Object',               '{"type":"TP.lang.Object","data":{"foo":"bar"}}',
        //  Note that TP.core.Hash is different - since it's what's created by
        //  the special function to the JSON.parse() call in TIBET, we create a
        //  regular JSON object from it:
        'TP.core.Hash',                 '{"foo":"bar"}',
        'TP.sig.Signal',                '{"type":"TP.sig.Signal","data":{"signame":"TP.sig.Signal","payload":{"foo":"bar"}}}',
        'TP.sig.Exception',             '{"type":"TP.sig.Exception","data":{"signame":"TP.sig.Exception","payload":{"message":"There really was an Error"}}}',

        'TP.core.Window',               /^{"type":"TP.core.Window","data":{[\s\S]+}}$/,
        //  NB: The system uses visible documents, which for TIBET are X(HT)ML
        'TP.core.HTMLDocumentNode',     /^{"type":"TP.core.HTMLDocumentNode","data":[\s\S]+}$/,
        'TP.core.HTMLElementNode',      /^{"type":"TP.html.body","data":[\s\S]+}$/,

        'TP.core.XMLDocumentNode',      /\{"type":"TP.core.XMLDocumentNode","data":\{"type":"XMLDocument","data":\{"foo":\{"@bar":/,

        'TP.core.XMLElementNode',       /\{"type":"TP.core.XMLElementNode","data":{"type":"Element","data":\{"foo"/,

        'TP.core.DocumentFragmentNode', /\{"type":"TP.core.DocumentFragmentNode","data":\{"type":"DocumentFragment","data":\[\{"type":"Element","data":/,
        'TP.core.AttributeNode',        '{"type":"TP.core.AttributeNode","data":{"type":"Attr","data":{"foo":"bar"}}}',
        'TP.core.TextNode',             '{"type":"TP.core.TextNode","data":{"type":"Text","data":"foo"}}',
        'TP.core.CDATASectionNode',     '{"type":"TP.core.CDATASectionNode","data":{"type":"CDATASection","data":"foo"}}',
        'TP.core.ProcessingInstructionNode',    '{"type":"TP.core.XMLProcessingInstruction","data":{"type":"ProcessingInstruction","data":{"target":"foo","data":"bar"}}}',
        'TP.core.CommentNode',                  '{"type":"TP.core.CommentNode","data":{"type":"Comment","data":"foo"}}',

        'TP.path.SimpleTIBETPath',  '{"type":"TP.path.SimpleTIBETPath","data":"foo"}',
        'TP.path.ComplexTIBETPath', '{"type":"TP.path.ComplexTIBETPath","data":"foo.bar.baz"}',
        'TP.path.ElementPath',      '{"type":"TP.path.ElementPath","data":"/1/2"}',
        'TP.path.XTensionPath',     '{"type":"TP.path.XTensionPath","data":"*[foo]"}',
        'TP.path.XPathPath',        '{"type":"TP.path.XPathPath","data":"//*"}',

        'TP.sig.Request',           '{"type":"TP.sig.Request","data":{"signame":"TP.sig.Request","payload":{"foo":"bar"}}}',
        'TP.sig.Response',          '{"type":"TP.sig.Response","data":{"signame":"TP.sig.Response","payload":{"foo":"bar"}}}',

        'TP.core.TIBETURN',         '{"type":"TP.core.TIBETURN","data":"urn:tibet:foo"}',
        'TP.core.HTTPURL',          '{"type":"TP.core.HTTPURL","data":"http://www.blah.com"}',
        'TP.core.FileURL',          '{"type":"TP.core.FileURL","data":"file:///goo.txt"}',
        'TP.core.JSURI',            '{"type":"TP.core.JSURI","data":"javascript:alert(\\"hi\\")"}',
        'TP.core.WSURL',            '{"type":"TP.core.WSURL","data":"ws://ws.blah.com"}',
        'TP.core.TIBETURL',         '{"type":"TP.core.TIBETURL","data":"tibet://top/file:///goo.txt"}',
        'TP.core.CookieURL',        '{"type":"TP.core.CookieURL","data":"cookie://blah=foo"}',

        'TP.w3.DocType',            '{"type":"TP.w3.DocType","data":{"DOCTYPE":"html","PUBLIC":"-//W3C//DTD XHTML 1.0 Strict//EN","SYSTEM":"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"}}',

        'TP.gui.Point',             '{"type":"TP.gui.Point","data":{"x":"20","y":"30"}}',
        'TP.gui.Rect',              '{"type":"TP.gui.Rect","data":{"x":"0","y":"0","width":"100","height":"100"}}',
        'TP.gui.Matrix',            '{"type":"TP.gui.Matrix","data":{"xx":"1","xy":"0","yx":"0","yy":"1","dx":"0","dy":"0"}}',
        'TP.gui.Color',             '{"type":"TP.gui.Color","data":{"r":"0","g":"255","b":"255","a":"1"}}',

        'TP.gui.LinearGradient',    '{"type":"TP.gui.LinearGradient","data":{"angle":"45","stops":[{"value":"10%","color":{"type":"TP.gui.Color","data":{"r":"0","g":"0","b":"255","a":"0.5"}}},{"value":"50%","color":{"type":"TP.gui.Color","data":{"r":"0","g":"255","b":"255","a":"1"}}}]}}',
        'TP.gui.RadialGradient',    '{"type":"TP.gui.RadialGradient","data":{"cx":"50%","cy":"50%","stops":[{"value":"10%","color":{"type":"TP.gui.Color","data":{"r":"0","g":"0","b":"255","a":"0.5"}}},{"value":"50%","color":{"type":"TP.gui.Color","data":{"r":"0","g":"255","b":"255","a":"1"}}}]}}',
        'TP.gui.Pattern',           '{"type":"TP.gui.Pattern","data":{"x":"20","y":"20","width":"100","height":"100","url":"null"}}',
        'TP.gui.Path',              '{"type":"TP.gui.SVGPath","data":{"segments":["M",[10,10],"M",[20,20]]}}',

        'TP.core.Job',              /^{"type":"TP.core.Job","data":([\s\S]+)"PID":(\d+)([\s\S]+)}$/,
        'TP.core.Browser_TYPE',     '{"type":"TP.lang.RootObject","data":{"name":"TP.core.Browser","supertypes":["TP.lang.Object","TP.lang.RootObject","Object"]}}',
        'TP.boot.Annotation',       '{"type":"TP.boot.Annotation","data":{"object":"A String","message":"This is a message"}}',
        'TP.core.Annotation',       '{"type": "TP.core.Annotation","data": {"object": "A String","message": "This is a message"}}'
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {
        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.jsonsrc(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.jsonsrc(): ' +
                                        diffKeys.asString(', '));
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
                            TP.jsonsrc(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            TP.jsonsrc(testFunc.val), testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('jsonsrc of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
