//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.definePrimitive('$$generateComparatorCases',
function(suite, comparator, testVal, resultData, testData) {

    /**
     * @method generateComparatorCases
     * @summary Generates test cases for a set of test data and result data.
     *     See the tests for TP.equal for sample usage.
     * @param {TP.test.Suite} suite The test suite to generate the cases for.
     * @param {Function} comparator A comparison function such as TP.equal. Bind
     *     this as needed to ensure proper operation.
     * @param {*} testVal Any JavaScript value from null to undefined to....
     * @param {TP.core.Hash} resultData A set of proper result values. Each
     *     comparison will be done using testVal against a value in testData and
     *     the result will be compared to the value for the same key in
     *     resultData.
     * @param {TP.core.Hash} [testData=TP.$$commonObjectValues] The hash
     *     containing the keys to iterate across (which should match keys in the
     *     resultData and the values to be compared for each key with the
     *     testVal.
    */

    var testKeys,
        data;

    if (TP.notValid(testData)) {
        TP.$$setupCommonObjectValues();
        data = TP.$$commonObjectValues;
    } else {
        data = testData;
    }

    testKeys = TP.keys(data);
    testKeys.forEach(
            function(key) {
                var testFunc,
                    compareVal,
                    correctVal;

                compareVal = data.at(key);
                correctVal = resultData.at(key);

                testFunc = function(test, options) {
                    var result;

                    result = comparator(testFunc.testVal, testFunc.compareVal);
                    test.assert.isEqualTo(result, testFunc.correctVal);
                };

                testFunc.testVal = testVal;
                testFunc.compareVal = compareVal;
                testFunc.correctVal = correctVal;

                suite.it(TP.name(comparator) + ' compares ' +
                    testVal + ' with ' + key + ' properly', testFunc);
            });
});

//  ------------------------------------------------------------------------

TP.objectLocalID.describe('local id',
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

        'Window',                               TP.sys.cfg('tibet.top_win_name'),
        'IFrameWindow',                         'UIROOT',

        // 'Node',                                 'Node',
        'HTMLDocument',                         'document',
        'HTMLElement',                          'body',

        'XMLDocument',                          'document',
        'XMLElement',                           /foo_(\w+)$/,

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
        'TP.core.Hash',                         /^TP\.core\.Hash\$(\w+)$/,
        'TP.sig.Signal',                        /^TP\.sig\.Signal\$(\w+)$/,
        'TP.sig.Exception',                     /^TP\.sig\.Exception\$(\w+)$/,

        'TP.core.Window',                       TP.sys.cfg('tibet.top_win_name'),
        'TP.core.HTMLDocumentNode',             'document',
        'TP.core.HTMLElementNode',              'body',

        'TP.core.XMLDocumentNode',              'document',
        'TP.core.XMLElementNode',               /foo_(\w+)$/,

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
            'There are missing test values for TP.lid(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.lid(): ' +
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

            thisref.it('local id of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.objectGlobalID.describe('global id',
function() {

    var thisref,

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

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    winGID = TP.sys.cfg('tibet.top_win_path');

    docLoc = encodeURI(TP.documentGetLocation(
                            testData.at('HTMLDocument'), false, true));
    docLoc = TP.uriInTIBETFormat(docLoc);

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

        // 'Node',                                 'Node',
        'HTMLDocument',                         'tibet://' + winGID + '/' + docLoc + '#document',
        'HTMLElement',                          'tibet://' + winGID + '/' + docLoc + '#body',

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
        'TP.core.Hash',                         /^TP\.core\.Hash\$(\w+)$/,
        'TP.sig.Signal',                        /^TP\.sig\.Signal\$(\w+)$/,
        'TP.sig.Exception',                     /^TP\.sig\.Exception\$(\w+)$/,

        'TP.core.Window',                       winGID,
        'TP.core.HTMLDocumentNode',             'tibet://' + winGID + '/' + docLoc + '#document',
        'TP.core.HTMLElementNode',              'tibet://' + winGID + '/' + docLoc + '#body',

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
            'There are missing test values for TP.gid(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.gid(): ' +
                                        diffKeys.asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {

        testKey = testKeys.at(i);

        //  PhantomJS doesn't report HTML document from top level. We have to
        //  manufacture one and it has no window as a result...
        if (TP.sys.cfg('boot.context') === 'phantomjs') {
            if (TP.ac(
                'HTMLDocument', 'HTMLElement',
                'TP.core.HTMLDocumentNode', 'TP.core.HTMLElementNode').indexOf(
                    testKey) !== -1) {
                continue;
            }
        }

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

            thisref.it('global id of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.isType.describe('type testing',
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

        // 'Node',                                 false,
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
        'TP.core.Hash',                         false,
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

        'TP.gui.Point',                         false,
        'TP.gui.Rect',                          false,
        'TP.gui.Matrix',                        false,
        'TP.gui.Color',                         false,

        'TP.gui.LinearGradient',                false,
        'TP.gui.RadialGradient',                false,

        'TP.gui.Pattern',                       false,
        'TP.gui.Path',                          false,

        'TP.core.Job',                          false,
        'TP.core.Browser_TYPE',                 true,

        'TP.boot.Annotation',                   false,
        'TP.core.Annotation',                   false
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.isType(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.isType(): ' +
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

            testFunc =
                function(test, options) {
                    test.assert.isEqualTo(
                        TP.isType(testFunc.val), testFunc.correctVal);
                };
            testFunc.val = val;
            testFunc.correctVal = correctVal;

            thisref.it('is type: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.isNativeType.describe('native type testing',
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

        // 'Node',                                 false,
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
        'TP.core.Hash',                         false,
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

        'TP.gui.Point',                         false,
        'TP.gui.Rect',                          false,
        'TP.gui.Matrix',                        false,
        'TP.gui.Color',                         false,

        'TP.gui.LinearGradient',                false,
        'TP.gui.RadialGradient',                false,

        'TP.gui.Pattern',                       false,
        'TP.gui.Path',                          false,

        'TP.core.Job',                          false,
        'TP.core.Browser_TYPE',                 false,

        'TP.boot.Annotation',                   false,
        'TP.core.Annotation',                   false
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.isNativeType(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.isNativeType(): ' +
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

            testFunc =
                function(test, options) {
                    test.assert.isEqualTo(
                        TP.isNativeType(testFunc.val), testFunc.correctVal);
                };
            testFunc.val = val;
            testFunc.correctVal = correctVal;

            thisref.it('is native type: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.isMemberOf.describe('membership testing',
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

    thisref = this;

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

            thisref.it(TP.name(val) + ' (constructor) is not a member of: Object',
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

            thisref.it(TP.name(val) +
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

            thisref.it(TP.name(val) + ' (constructor) is a member of: Function',
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

            thisref.it(TP.name(val) +
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

            thisref.it(TP.name(val) + ' (constructor) is not a member of: "Object"',
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

            thisref.it(TP.name(val) + ' (constructor) is not a member of: "Object"',
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

            thisref.it(TP.name(val) + ' (constructor) is a member of: "Function"',
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

                thisref.it(testKey + ' (constructor) is a member of: Object',
                            testFunc);
            } else {
                testFunc =
                    function(test, options) {
                        test.assert.isFalse(TP.isMemberOf(testFunc.val, Object));
                    };
                testFunc.val = val;

                thisref.it(testKey + ' (constructor) is not a member of: Object',
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

            thisref.it(testKey +
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

                thisref.it(testKey + ' (constructor) is not a member of: Function',
                            testFunc);
            } else {
                testFunc =
                    function(test, options) {
                        test.assert.isTrue(TP.isMemberOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisref.it(testKey + ' (constructor) is a member of: Function',
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

            thisref.it(testKey +
                        ' (constructor) is not a member of: TP.FunctionProto',
                        testFunc);
        }());
    }

    //  Instances of native and TIBET types

    TP.$$setupCommonObjectValues();
    TP.$$setupCommonObjectTypes();

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    correctValues = TP.$$commonObjectLeafTypes;

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.isMemberOf(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.isMemberOf(): ' +
                                        diffKeys.asString(', '));
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

            thisref.it(testKey +
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

            thisref.it(testKey +
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

            thisref.it(testKey +
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

            thisref.it(testKey +
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

                thisref.it(testKey + ' is a member of: ' + TP.name(Object),
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

                thisref.it(testKey + ' is not a member of: ' + TP.name(Object),
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

            thisref.it(testKey + ' is not a member of: ' + TP.name(TP.ObjectProto),
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

                thisref.it(testKey + ' is a member of: ' + TP.name(TP.lang.Object),
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

                thisref.it(testKey + ' is not a member of: ' +
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

                thisref.it(testKey + ' is a member of: ' +
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

                thisref.it(testKey + ' is not a member of: ' +
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

            thisref.it(testKey + ' is not a member of: ' +
                                TP.name(TP.FunctionProto),
                        testFunc);
        }());
    }

    /* eslint-enable no-loop-func */
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.isKindOf.describe('kind of testing',
function() {

    var thisref,

        testData,
        testKeys,
        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal,

        len2,
        j,
        correctType;

    thisref = this;

    /* eslint-disable no-loop-func */

    //  isKindOf() tests 'indirect' type relationship - an instance of a type or
    //  one of it's subtypes.

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
                    test.assert.isTrue(TP.isKindOf(testFunc.val, Object));
                };
            testFunc.val = val;

            thisref.it(TP.name(val) + ' (constructor) is a kind of: Object',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isKindOf(testFunc.val, TP.ObjectProto));
                };
            testFunc.val = val;

            thisref.it(TP.name(val) +
                        ' (constructor) is not a kind of: TP.ObjectProto',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isTrue(TP.isKindOf(testFunc.val, Function));
                };
            testFunc.val = val;

            thisref.it(TP.name(val) + ' (constructor) is a kind of: Function',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isKindOf(testFunc.val, TP.FunctionProto));
                };
            testFunc.val = val;

            thisref.it(TP.name(val) +
                        ' (constructor) is not a kind of: TP.FunctionProto',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isTrue(TP.isKindOf(testFunc.val, 'Object'));
                };
            testFunc.val = val;

            thisref.it(TP.name(val) + ' (constructor) is a kind of: "Object"',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isTrue(TP.isKindOf(testFunc.val, 'Object'));
                };
            testFunc.val = val;

            thisref.it(TP.name(val) + ' (constructor) is a kind of: "Object"',
                    testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isTrue(TP.isKindOf(testFunc.val, 'Function'));
                };
            testFunc.val = val;

            thisref.it(TP.name(val) + ' (constructor) is a kind of: "Function"',
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

            testFunc =
                function(test, options) {
                    test.assert.isTrue(TP.isKindOf(testFunc.val, Object));
                };
            testFunc.val = val;

            thisref.it(testKey + ' (constructor) is a kind of: Object',
                        testFunc);
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isKindOf(testFunc.val, TP.ObjectProto));
                };
            testFunc.val = val;

            thisref.it(testKey +
                        ' (constructor) is not a kind of: TP.ObjectProto',
                        testFunc);
        }());

        //  ---

        (function() {

            var testFunc;

            if (TP.isNonFunctionConstructor(val)) {
                testFunc =
                    function(test, options) {
                        test.assert.isFalse(TP.isKindOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisref.it(testKey + ' (constructor) is not a kind of: Function',
                            testFunc);
            } else {
                testFunc =
                    function(test, options) {
                        test.assert.isTrue(TP.isKindOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisref.it(testKey + ' (constructor) is a kind of: Function',
                            testFunc);
            }
        }());

        //  ---

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isKindOf(testFunc.val, TP.FunctionProto));
                };
            testFunc.val = val;

            thisref.it(testKey +
                        ' (constructor) is not a kind of: TP.FunctionProto',
                        testFunc);
        }());
    }

    //  Instances of native and TIBET types

    TP.$$setupCommonObjectValues();
    TP.$$setupCommonObjectTypes();

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    correctValues = TP.$$commonObjectTypeHierarchies;

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.isKindOf(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.isKindOf(): ' +
                                        diffKeys.asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {
        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        //  ---

        len2 = correctVal.getSize();
        for (j = 0; j < len2; j++) {

            correctType = correctVal.at(j);

            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        //  'null' and 'undefined' should always return false
                        if (TP.notValid(testFunc.val)) {
                            test.assert.isFalse(
                                TP.isKindOf(
                                    testFunc.val,
                                    testFunc.correctVal));
                        } else {
                            test.assert.isTrue(
                                TP.isKindOf(
                                    testFunc.val,
                                    testFunc.correctVal));
                        }
                    };
                testFunc.val = val;
                testFunc.correctVal = correctType;

                thisref.it(testKey +
                        ' is a kind of: ' +
                        TP.name(correctType),
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
                                TP.isKindOf(
                                    testFunc.val,
                                    TP.name(testFunc.correctVal)));
                        } else {
                            test.assert.isTrue(
                                TP.isKindOf(
                                    testFunc.val,
                                    TP.name(testFunc.correctVal)));
                        }
                    };
                testFunc.val = val;
                testFunc.correctVal = correctType;

                thisref.it(testKey +
                        ' is a kind of: ' +
                        '"' + TP.name(correctType) + '"',
                        testFunc);
            }());
        }

        //  ---

        //  Root object tests

        if (testKey === TP.NULL || testKey === TP.UNDEF) {
            continue;
        }

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isTrue(
                        TP.isKindOf(testFunc.val, Object));
                };
            testFunc.val = val;
            testFunc.correctVal = TP.$$commonObjectRootTypes.at(testKey);

            thisref.it(testKey + ' is a kind of: ' + TP.name(Object),
                        testFunc);
        }());

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isKindOf(testFunc.val, TP.ObjectProto));
                };
            testFunc.val = val;

            thisref.it(testKey + ' is not a kind of: ' + TP.name(TP.ObjectProto),
                        testFunc);
        }());

        if (testKey === 'Function' ||
            testKey === 'NativeType' ||
            testKey === 'NativeFunction') {
            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        test.assert.isTrue(
                            TP.isKindOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisref.it(testKey + ' is a kind of: ' +
                                TP.name(Function),
                            testFunc);
            }());
        } else {
            (function() {
                var testFunc;

                testFunc =
                    function(test, options) {
                        test.assert.isFalse(
                            TP.isKindOf(testFunc.val, Function));
                    };
                testFunc.val = val;

                thisref.it(testKey + ' is not a kind of: ' +
                                TP.name(Function),
                            testFunc);
            }());
        }

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isFalse(
                        TP.isKindOf(testFunc.val, TP.FunctionProto));
                };
            testFunc.val = val;

            thisref.it(testKey + ' is not a kind of: ' +
                                TP.name(TP.FunctionProto),
                        testFunc);
        }());
    }

    /* eslint-enable no-loop-func */
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.objectSupertypes.describe('supertype objects',
function() {

    var thisref,

        testData,
        testKeys,
        len,
        i,

        testKey,
        val,

        correctValues,
        correctVal,

        stypesVal;

    thisref = this;

    /* eslint-disable no-loop-func */

    //  stypes() returns all of an object's supertypes.

    //  Instances of native and TIBET types

    TP.$$setupCommonObjectValues();
    TP.$$setupCommonObjectTypes();

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    correctValues = TP.$$commonObjectTypeHierarchies;

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.stypes(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.stypes(): ' +
                                        diffKeys.asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {
        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        //  ---

        stypesVal = TP.stypes(val).copy();
        if (testKey !== TP.UNDEF && testKey !== TP.NULL) {
            stypesVal.unshift(TP.type(val));
        }

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isEqualTo(
                        testFunc.val, testFunc.correctVal);
                };
            testFunc.val = stypesVal;
            testFunc.correctVal = correctVal;

            thisref.it(testKey + ': TP.stypes() reports all proper supertypes',
                        testFunc);
        }());
    }

    /* eslint-enable no-loop-func */
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.objectType.describe('type objects',
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

    thisref = this;

    /* eslint-disable no-loop-func */

    //  type() returns an object's type.

    //  Instances of native and TIBET types

    TP.$$setupCommonObjectValues();
    TP.$$setupCommonObjectTypes();

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    correctValues = TP.$$commonObjectLeafTypes;

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.type(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.type(): ' +
                                        diffKeys.asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {
        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        (function() {
            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isEqualTo(
                        testFunc.val, testFunc.correctVal);
                };
            testFunc.val = TP.type(val);
            testFunc.correctVal = correctVal;

            thisref.it(testKey + ': TP.type() reports proper type',
                        testFunc);
        }());
    }

    /* eslint-enable no-loop-func */
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.objectWrap.describe('wrapping',
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

    thisref = this;

    /* eslint-disable no-loop-func */

    //  wrap() returns an object wrapped in a richer TIBET type

    //  Instances of native and TIBET types

    TP.$$setupCommonObjectValues();
    TP.$$setupCommonWrappedObjectValues();

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    correctValues = TP.$$commonWrappedObjectValues;

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.wrap(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.wrap(): ' +
                                        diffKeys.asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {
        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        (function() {
            var testFunc;

            if (correctVal === TP.IDENTITY) {
                testFunc =
                    function(test, options) {
                        test.assert.isIdenticalTo(
                            testFunc.val, testFunc.correctVal);
                    };

                testFunc.val = TP.wrap(val);
                testFunc.correctVal = val;
            } else {
                testFunc =
                    function(test, options) {
                        test.assert.isKindOf(
                            testFunc.val, testFunc.correctVal);
                    };

                testFunc.val = TP.wrap(val);
                testFunc.correctVal = correctVal;
            }

            thisref.it(testKey + ': TP.wrap() wraps in proper type',
                        testFunc);
        }());
    }

    /* eslint-enable no-loop-func */
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.objectUnwrap.describe('unwrapping',
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

    thisref = this;

    /* eslint-disable no-loop-func */

    //  unwrap() returns an object unwrapped from a richer TIBET type

    //  Instances of native and TIBET types

    TP.$$setupCommonObjectValues();
    TP.$$setupCommonUnwrappedObjectValues();

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    correctValues = TP.$$commonUnwrappedObjectValues;

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.unwrap(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.unwrap(): ' +
                                        diffKeys.asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {
        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        (function() {
            var testFunc;

            if (correctVal === TP.IDENTITY) {
                testFunc =
                    function(test, options) {
                        test.assert.isIdenticalTo(
                            testFunc.val, testFunc.correctVal);
                    };

                testFunc.val = TP.unwrap(val);
                testFunc.correctVal = val;
            } else {
                testFunc =
                    function(test, options) {
                        test.assert.isKindOf(
                            testFunc.val, testFunc.correctVal);
                    };

                testFunc.val = TP.unwrap(val);
                testFunc.correctVal = correctVal;
            }

            thisref.it(testKey + ': TP.unwrap() unwraps in proper type',
                        testFunc);
        }());
    }

    /* eslint-enable no-loop-func */
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.objectValue.describe('object value',
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

    thisref = this;

    /* eslint-disable no-loop-func */

    //  val() returns a 'more primitive' value

    //  Instances of native and TIBET types

    TP.$$setupCommonObjectValues();
    TP.$$setupCommonPrimitiveObjectValues();

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    correctValues = TP.$$commonPrimitiveObjectValues;

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.val(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.val(): ' +
                                        diffKeys.asString(', '));
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {
        testKey = testKeys.at(i);

        val = testData.at(testKey);
        correctVal = correctValues.at(testKey);

        (function() {
            var testFunc;

            if (correctVal === TP.IDENTITY) {
                testFunc =
                    function(test, options) {
                        test.assert.isIdenticalTo(
                            testFunc.val, testFunc.correctVal);
                    };

                testFunc.val = TP.val(val);
                testFunc.correctVal = val;
            } else if (TP.isString(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.isEqualTo(
                            testFunc.val, testFunc.correctVal);
                    };

                testFunc.val = TP.val(val);
                testFunc.correctVal = correctVal;
            } else if (TP.isRegExp(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.matches(
                            testFunc.val, testFunc.correctVal);
                    };

                testFunc.val = TP.val(val);
                testFunc.correctVal = correctVal;
            }

            thisref.it(testKey + ': TP.val() produces primitive value',
                        testFunc);
        }());
    }

    /* eslint-enable no-loop-func */
});

//  TP.copy()
//  TP.keys()
//  TP.loc()
//  TP.parse()
//  TP.size()

//  ------------------------------------------------------------------------

TP.equal.describe('core equality tests',
function() {

    var correctValues,
        comparator;

    TP.$$setupCommonObjectValues();

    correctValues = TP.hc();
    TP.$$commonObjectValues.perform(function(item) {
        correctValues.atPut(item.first(), false);
    });

    comparator = TP.equal.bind(TP);

    //  TP.equal(null, *)
    correctValues.atPut(TP.UNDEF, false);
    correctValues.atPut(TP.NULL, true);
    TP.$$generateComparatorCases(this, comparator, null, correctValues);

    //  TP.equal(undefined, *)
    correctValues.atPut(TP.UNDEF, true);
    correctValues.atPut(TP.NULL, false);
    TP.$$generateComparatorCases(this, comparator, undefined, correctValues);

    //  TP.equal(null, *)
    correctValues.atPut(TP.UNDEF, false);
    correctValues.atPut(TP.NULL, false);
    correctValues.atPut('NaN', true);
    TP.$$generateComparatorCases(this, comparator, NaN, correctValues);
});

//  ------------------------------------------------------------------------

//  TP.identical()

//  TP.format()
//  TP.validate()

//  TP.isSubtypeOf()

//  ------------------------------------------------------------------------

TP.reformatJSToJSON.describe('conversions',
function() {

    this.it('common values', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:bar,baz:goo}');
        correctVal = TP.json({foo: 'bar', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : bar, baz : goo }');
        correctVal = TP.json({foo: 'bar', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:bar,baz:{goo:moo}}');
        correctVal = TP.json({foo: 'bar', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : bar, baz : { goo : moo } }');
        correctVal = TP.json({foo: 'bar', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('quoted values', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'bar\',baz:\'goo\'}');
        correctVal = TP.json({foo: '\'bar\'', baz: '\'goo\''});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'bar\', baz : \'goo\' }');
        correctVal = TP.json({foo: '\'bar\'', baz: '\'goo\''});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'bar\',baz:{goo:\'moo\'}}');
        correctVal = TP.json({foo: '\'bar\'', baz: {goo: '\'moo\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'bar\', baz : { goo : \'moo\' } }');
        correctVal = TP.json({foo: '\'bar\'', baz: {goo: '\'moo\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{foo:\'bar and baz\',baz:{goo:\'moo and too\'}}');
        correctVal = TP.json(
                {foo: '\'bar and baz\'', baz: {goo: '\'moo and too\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{ foo : \'bar and baz\' , baz : { goo : \'moo and too\' } }');
        correctVal = TP.json(
                {foo: '\'bar and baz\'', baz: {goo: '\'moo and too\''}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('nested single quoted values', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'b\\\'ar\',baz:\'go\\\'o\'}');
        correctVal = TP.json({foo: '\'b\'ar\'', baz: '\'go\'o\''});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'b\\\'ar\', baz : \'go\\\'o\' }');
        correctVal = TP.json({foo: '\'b\'ar\'', baz: '\'go\'o\''});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'b\\\'ar\',baz:{goo:\'mo\\\'o\'}}');
        correctVal = TP.json({foo: '\'b\'ar\'', baz: {goo: '\'mo\'o\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'b\\\'ar\', baz : { goo : \'mo\\\'o\' } }');
        correctVal = TP.json({foo: '\'b\'ar\'', baz: {goo: '\'mo\'o\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{foo:\'b\\\'ar and b\\\'az\',baz:{goo:\'moo\\\' and to\\\'o\'}}');
        correctVal = TP.json(
                {foo: '\'b\'ar and b\'az\'', baz: {goo: '\'moo\' and to\'o\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{ foo : \'b\\\'ar and b\\\'az\' , baz : { goo : \'moo\\\' and to\\\'o\' } }');
        correctVal = TP.json(
                {foo: '\'b\'ar and b\'az\'', baz: {goo: '\'moo\' and to\'o\''}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('nested double quoted values', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'b\\"ar\',baz:\'go\\"o\'}');
        correctVal = TP.json({foo: '\'b"ar\'', baz: '\'go"o\''});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'b\\"ar\', baz : \'go\\"o\' }');
        correctVal = TP.json({foo: '\'b"ar\'', baz: '\'go"o\''});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'b\\"ar\',baz:{goo:\'mo\\"o\'}}');
        correctVal = TP.json({foo: '\'b"ar\'', baz: {goo: '\'mo"o\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'b\\"ar\', baz : { goo : \'mo\\"o\' } }');
        correctVal = TP.json({foo: '\'b"ar\'', baz: {goo: '\'mo"o\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{foo:\'b\\"ar and b\\"az\',baz:{goo:\'moo\\" and to\\"o\'}}');
        correctVal = TP.json(
                {foo: '\'b"ar and b"az\'', baz: {goo: '\'moo" and to"o\''}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{ foo : \'b\\"ar and b\\"az\' , baz : { goo : \'moo\\" and to\\"o\' } }');
        correctVal = TP.json(
                {foo: '\'b"ar and b"az\'', baz: {goo: '\'moo" and to"o\''}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('embedded \'.\' resolving to real references', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:TP.BEFORE,baz:goo}');
        correctVal = TP.json({foo: 'before', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : TP.BEFORE, baz : goo }');
        correctVal = TP.json({foo: 'before', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:TP.BEFORE,baz:{goo:moo}}');
        correctVal = TP.json({foo: 'before', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : TP.BEFORE, baz : { goo : moo } }');
        correctVal = TP.json({foo: 'before', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('embedded \'.\' resolving to no reference', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:bar.moo,baz:goo}');
        correctVal = TP.json({foo: 'bar.moo', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : bar.moo, baz : goo }');
        correctVal = TP.json({foo: 'bar.moo', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:bar.moo,baz:{goo:moo}}');
        correctVal = TP.json({foo: 'bar.moo', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : bar.moo, baz : { goo : moo } }');
        correctVal = TP.json({foo: 'bar.moo', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
