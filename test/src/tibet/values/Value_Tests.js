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
        'NativeFunction',                       /^(\w+)\.Inst\.(\w+)$/,

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

        'TIBETType',                            'TP.dom.Node',
        'TP.lang.Object',                       /^TP\.lang\.Object\$(\w+)$/,
        'TP.core.Hash',                         /^TP\.core\.Hash\$(\w+)$/,
        'TP.sig.Signal',                        /^TP\.sig\.Signal\$(\w+)$/,
        'TP.sig.Exception',                     /^TP\.sig\.Exception\$(\w+)$/,

        'TP.core.Window',                       TP.sys.cfg('tibet.top_win_name'),
        'TP.dom.HTMLDocumentNode',              'document',
        'TP.dom.HTMLElementNode',               'body',

        'TP.dom.XMLDocumentNode',               'document',
        'TP.dom.XMLElementNode',                /foo_(\w+)$/,

        'TP.dom.DocumentFragmentNode',          '#document-fragment',
        'TP.dom.AttributeNode',                 '#xpath1(./@foo)',
        'TP.dom.TextNode',                      '#xpath1(./text()[contains(.,\'foo\')])',
        'TP.dom.CDATASectionNode',              '#xpath1(./text()[contains(.,\'foo\')])',
        'TP.dom.ProcessingInstructionNode',     '#xpath1(./processing-instruction(\'foo\'))',
        'TP.dom.CommentNode',                   '#xpath1(./comment()[1])',

        'TP.path.SimpleTIBETPath',              /^TP\.path\.SimpleTIBETPath\$(\w+)$/,
        'TP.path.ComplexTIBETPath',             /^TP\.path\.ComplexTIBETPath\$(\w+)$/,
        'TP.path.ElementPath',                  /^TP\.path\.ElementPath\$(\w+)$/,
        'TP.path.XTensionPath',                 /^TP\.path\.XTensionPath\$(\w+)$/,
        'TP.path.XPathPath',                    /^TP\.path\.XPathPath\$(\w+)$/,

        'TP.sig.Request',                       /^TP\.sig\.Request\$(\w+)$/,
        'TP.sig.Response',                      /^TP\.sig\.Response\$(\w+)$/,

        'TP.uri.TIBETURN',                     'urn:tibet:foo',
        'TP.uri.HTTPURL',                      'http://www.blah.com',
        'TP.uri.FileURL',                      'file:///goo.txt',
        /* eslint-disable no-script-url */
        'TP.uri.JSURI',                        'javascript:alert("hi")',
        /* eslint-enable no-script-url */
        'TP.uri.WSURL',                        'ws://ws.blah.com',
        'TP.uri.TIBETURL',                     'tibet://top/file:///goo.txt',
        'TP.uri.CookieURL',                    'cookie://blah=foo',

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
        'NativeFunction',                       /^(\w+)\.Inst\.(\w+)$/,

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

        'TIBETType',                            'TP.dom.Node',
        'TP.lang.Object',                       /^TP\.lang\.Object\$(\w+)$/,
        'TP.core.Hash',                         /^TP\.core\.Hash\$(\w+)$/,
        'TP.sig.Signal',                        /^TP\.sig\.Signal\$(\w+)$/,
        'TP.sig.Exception',                     /^TP\.sig\.Exception\$(\w+)$/,

        'TP.core.Window',                       winGID,
        'TP.dom.HTMLDocumentNode',              'tibet://' + winGID + '/' + docLoc + '#document',
        'TP.dom.HTMLElementNode',               'tibet://' + winGID + '/' + docLoc + '#body',

        'TP.dom.XMLDocumentNode',               TP.id(testData.at('XMLDocument')),
        'TP.dom.XMLElementNode',                TP.id(testData.at('XMLElement')),

        'TP.dom.DocumentFragmentNode',          '#document-fragment',
        'TP.dom.AttributeNode',                 '#xpath1(./@foo)',
        'TP.dom.TextNode',                      '#xpath1(./text()[contains(.,\'foo\')])',
        'TP.dom.CDATASectionNode',              '#xpath1(./text()[contains(.,\'foo\')])',
        'TP.dom.ProcessingInstructionNode',     '#xpath1(./processing-instruction(\'foo\'))',
        'TP.dom.CommentNode',                   '#xpath1(./comment()[1])',

        'TP.path.SimpleTIBETPath',              /^TP\.path\.SimpleTIBETPath\$(\w+)$/,
        'TP.path.ComplexTIBETPath',             /^TP\.path\.ComplexTIBETPath\$(\w+)$/,
        'TP.path.ElementPath',                  /^TP\.path\.ElementPath\$(\w+)$/,
        'TP.path.XTensionPath',                 /^TP\.path\.XTensionPath\$(\w+)$/,
        'TP.path.XPathPath',                    /^TP\.path\.XPathPath\$(\w+)$/,

        'TP.sig.Request',                       /^TP\.sig\.Request\$(\w+)$/,
        'TP.sig.Response',                      /^TP\.sig\.Response\$(\w+)$/,

        'TP.uri.TIBETURN',                     'urn:tibet:foo',
        'TP.uri.HTTPURL',                      'http://www.blah.com',
        'TP.uri.FileURL',                      'file:///goo.txt',
        /* eslint-disable no-script-url */
        'TP.uri.JSURI',                        'javascript:alert("hi")',
        /* eslint-enable no-script-url */
        'TP.uri.WSURL',                        'ws://ws.blah.com',
        'TP.uri.TIBETURL',                     'tibet://top/file:///goo.txt',
        'TP.uri.CookieURL',                    'cookie://blah=foo',

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

        if (TP.ac(
            'HTMLDocument', 'HTMLElement',
            'TP.dom.HTMLDocumentNode', 'TP.dom.HTMLElementNode').indexOf(
                testKey) !== -1) {
            continue;
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
        'TP.dom.HTMLDocumentNode',              false,
        'TP.dom.HTMLElementNode',               false,

        'TP.dom.XMLDocumentNode',               false,
        'TP.dom.XMLElementNode',                false,

        'TP.dom.DocumentFragmentNode',          false,
        'TP.dom.AttributeNode',                 false,
        'TP.dom.TextNode',                      false,
        'TP.dom.CDATASectionNode',              false,
        'TP.dom.ProcessingInstructionNode',     false,
        'TP.dom.CommentNode',                   false,

        'TP.path.SimpleTIBETPath',              false,
        'TP.path.ComplexTIBETPath',             false,
        'TP.path.ElementPath',                  false,
        'TP.path.XTensionPath',                 false,
        'TP.path.XPathPath',                    false,

        'TP.sig.Request',                       false,
        'TP.sig.Response',                      false,

        'TP.uri.TIBETURN',                      false,
        'TP.uri.HTTPURL',                       false,
        'TP.uri.FileURL',                       false,
        /* eslint-disable no-script-url */
        'TP.uri.JSURI',                         false,
        /* eslint-enable no-script-url */
        'TP.uri.WSURL',                         false,
        'TP.uri.TIBETURL',                      false,
        'TP.uri.CookieURL',                     false,

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
        'TP.dom.HTMLDocumentNode',              false,
        'TP.dom.HTMLElementNode',               false,

        'TP.dom.XMLDocumentNode',               false,
        'TP.dom.XMLElementNode',                false,

        'TP.dom.DocumentFragmentNode',          false,
        'TP.dom.AttributeNode',                 false,
        'TP.dom.TextNode',                      false,
        'TP.dom.CDATASectionNode',              false,
        'TP.dom.ProcessingInstructionNode',     false,
        'TP.dom.CommentNode',                   false,

        'TP.path.SimpleTIBETPath',              false,
        'TP.path.ComplexTIBETPath',             false,
        'TP.path.ElementPath',                  false,
        'TP.path.XTensionPath',                 false,
        'TP.path.XPathPath',                    false,

        'TP.sig.Request',                       false,
        'TP.sig.Response',                      false,

        'TP.uri.TIBETURN',                      false,
        'TP.uri.HTTPURL',                       false,
        'TP.uri.FileURL',                       false,
        /* eslint-disable no-script-url */
        'TP.uri.JSURI',                         false,
        /* eslint-enable no-script-url */
        'TP.uri.WSURL',                         false,
        'TP.uri.TIBETURL',                      false,
        'TP.uri.CookieURL',                     false,

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
});

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
});

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
});

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
});

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
});

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
});

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

//  ------------------------------------------------------------------------

TP.copy.describe('core tests',
function() {

    this.it('shallow/deep - non mutable values - primitives', function(test, options) {

        var val,
            copyVal;

        //  For non-mutable values, shallow copying and deep copying are the
        //  same.

        //  The second parameter to the TP.copy() call forces whether or not
        //  we're making a *shallow* copy or not.

        val = 'hi';
        copyVal = TP.copy(val);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, false);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, true);
        test.assert.isIdenticalTo(val, copyVal);

        val = 42;
        copyVal = TP.copy(val);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, false);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, true);
        test.assert.isIdenticalTo(val, copyVal);

        val = true;
        copyVal = TP.copy(val);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, false);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, true);
        test.assert.isIdenticalTo(val, copyVal);
    });

    this.it('shallow/deep - non mutable values - boxed', function(test, options) {

        var val,
            copyVal;

        //  For non-mutable values, shallow copying and deep copying are the
        //  same.

        //  The second parameter to the TP.copy() call forces whether or not
        //  we're making a *shallow* copy or not.

        val = new String('hi');
        copyVal = TP.copy(val);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, false);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, true);
        test.assert.isIdenticalTo(val, copyVal);

        val = new Number(42);
        copyVal = TP.copy(val);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, false);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, true);
        test.assert.isIdenticalTo(val, copyVal);

        val = new Boolean(true);
        copyVal = TP.copy(val);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, false);
        test.assert.isIdenticalTo(val, copyVal);
        copyVal = TP.copy(val, true);
        test.assert.isIdenticalTo(val, copyVal);
    });

    this.it('shallow - mutable reference values - shorthand', function(test, options) {

        var val,
            copyVal;

        //  For mutable reference values, shallow copying means that the
        //  reference itself will be different, but nested references will be
        //  the same.

        //  First, copy a Function without copying anything other than content.
        /* eslint-disable brace-style, max-statements-per-line */
        val = function() {alert('hi');};
        /* eslint-enable brace-style, max-statements-per-line */
        val.testProp = {};
        copyVal = TP.copy(val);
        test.assert.isFunction(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.refute.hasKey(copyVal, 'testProp');

        //  Then, copy a Function and copy additional properties.
        /* eslint-disable brace-style, max-statements-per-line */
        val = function() {alert('hi');};
        /* eslint-enable brace-style, max-statements-per-line */
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isFunction(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);

        //  First, copy a RegExp without copying anything other than content.
        val = /foo/;
        val.testProp = {};
        copyVal = TP.copy(val);
        test.assert.isRegExp(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.refute.hasKey(copyVal, 'testProp');

        //  Then, copy a RegExp and copy additional properties.
        val = /foo/;
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isRegExp(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);

        //  POJOs will always copy 'additional' properties - since that's all
        //  they have.
        val = {};
        val.testProp = {};
        copyVal = TP.copy(val, false);
        test.assert.isPlainObject(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);

        //  First, copy an Array without copying anything other than content.
        val = [];
        val.testProp = {};
        copyVal = TP.copy(val);
        test.assert.isArray(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.refute.hasKey(copyVal, 'testProp');

        //  Then, copy an Array and copy additional properties.
        val = [];
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isArray(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);
    });

    this.it('shallow - mutable reference values - boxed', function(test, options) {

        var val,
            copyVal;

        //  For mutable reference values, shallow copying means that the
        //  reference itself will be different, but nested references will be
        //  the same.

        val = new Date();
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isDate(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);

        val = new Function('a', 'b', 'return a + b');
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isFunction(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);

        val = new RegExp('\\w+');
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isRegExp(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);

        val = new Object();
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isPlainObject(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);

        val = new Array();
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isArray(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);

        val = TP.lang.Object.construct();
        val.testProp = {};
        copyVal = TP.copy(val, false, null, false);
        test.assert.isKindOf(copyVal, TP.lang.Object);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.isIdenticalTo(val.testProp, copyVal.testProp);
    });

    this.it('deep - mutable reference values - shorthand', function(test, options) {

        var val,
            copyVal;

        //  For mutable reference values, shallow copying means that the
        //  reference itself will be different, but nested references will be
        //  the same.

        //  Copy a Function and copy additional properties deeply.
        /* eslint-disable brace-style, max-statements-per-line */
        val = function() {alert('hi');};
        /* eslint-enable brace-style, max-statements-per-line */
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isFunction(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);

        //  Copy a RegExp and copy additional properties deeply.
        val = /foo/;
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isRegExp(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);

        //  POJOs will always copy 'additional' properties - since that's all
        //  they have.
        val = {};
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isPlainObject(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);

        //  Then, copy an Array and copy additional properties deeply.
        val = [];
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isArray(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);
    });

    this.it('deep - mutable reference values - boxed', function(test, options) {

        var val,
            copyVal;

        //  For mutable reference values, shallow copying means that the
        //  reference itself will be different, but nested references will be
        //  the same.

        val = new Date();
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isDate(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);

        val = new Function('a', 'b', 'return a + b');
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isFunction(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);

        val = new RegExp('\\w+');
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isRegExp(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);

        val = new Object();
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isPlainObject(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);

        val = new Array();
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isArray(copyVal);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);

        val = TP.lang.Object.construct();
        val.testProp = {};
        copyVal = TP.copy(val, true, null, false);
        test.assert.isKindOf(copyVal, TP.lang.Object);
        test.refute.isIdenticalTo(val, copyVal);
        test.assert.hasKey(copyVal, 'testProp');
        test.refute.isIdenticalTo(val.testProp, copyVal.testProp);
    });
});

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

//  TP.format()
//  TP.identical()

//  ------------------------------------------------------------------------

TP.isMutable.describe('core tests',
function() {

    this.it('non mutable values - primitives', function(test, options) {

        test.assert.isFalse(TP.isMutable('hi'));
        test.assert.isFalse(TP.isMutable(42));
        test.assert.isFalse(TP.isMutable(true));
    });

    this.it('non mutable values - boxed', function(test, options) {

        test.assert.isFalse(TP.isMutable(new String()));
        test.assert.isFalse(TP.isMutable(new Number()));
        test.assert.isFalse(TP.isMutable(new Boolean()));
    });

    this.it('mutable reference values - shorthand', function(test, options) {

        /* eslint-disable brace-style, max-statements-per-line */
        test.assert.isTrue(TP.isMutable(function() {alert('hi');}));
        /* eslint-enable brace-style, max-statements-per-line */
        test.assert.isTrue(TP.isMutable(/foo/));

        test.assert.isTrue(TP.isMutable({}));
        test.assert.isTrue(TP.isMutable([]));
    });

    this.it('mutable reference values - boxed', function(test, options) {

        test.assert.isTrue(TP.isMutable(new Date()));

        test.assert.isTrue(TP.isMutable(
                                new Function('a', 'b', 'return a + b')));
        test.assert.isTrue(TP.isMutable(new RegExp('\\w+')));

        test.assert.isTrue(TP.isMutable(new Object()));
        test.assert.isTrue(TP.isMutable(new Array()));

        test.assert.isTrue(TP.isMutable(TP.lang.Object.construct()));
    });
});

//  ------------------------------------------------------------------------

TP.isReferenceType.describe('core reference type tests',
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

    this.it('non mutable values - primitives', function(test, options) {

        test.assert.isFalse(TP.isReferenceType(42));
        test.assert.isFalse(TP.isReferenceType(true));
        test.assert.isFalse(TP.isReferenceType('hi'));
    });

    this.it('non mutable values - boxed', function(test, options) {

        test.assert.isFalse(TP.isReferenceType(new String()));
        test.assert.isFalse(TP.isReferenceType(new Number()));
        test.assert.isFalse(TP.isReferenceType(new Boolean()));
    });

    this.it('mutable reference values - shorthand', function(test, options) {

        /* eslint-disable brace-style, max-statements-per-line */
        test.assert.isFalse(TP.isReferenceType(function() {alert('hi');}));
        /* eslint-enable brace-style, max-statements-per-line */
        test.assert.isFalse(TP.isReferenceType(/foo/));

        test.assert.isTrue(TP.isReferenceType({}));
        test.assert.isTrue(TP.isReferenceType([]));
    });

    this.it('mutable reference values - boxed', function(test, options) {

        test.assert.isFalse(TP.isReferenceType(new Date()));

        test.assert.isFalse(TP.isReferenceType(
                                new Function('a', 'b', 'return a + b')));
        test.assert.isFalse(TP.isReferenceType(new RegExp('\\w+')));

        test.assert.isTrue(TP.isReferenceType(new Object()));
        test.assert.isTrue(TP.isReferenceType(new Array()));

        test.assert.isTrue(TP.isReferenceType(TP.lang.Object.construct()));
    });

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
        'Array',                                true,
        'Object',                               true,
        'Function',                             false,
        'NaN',                                  false,
        'NativeType',                           true,
        'NativeFunction',                       false,

        'Window',                               true,
        'IFrameWindow',                         true,

        // 'Node',                                 'Node',
        'HTMLDocument',                         true,
        'HTMLElement',                          true,

        'XMLDocument',                          true,
        'XMLElement',                           true,

        'AttributeNode',                        true,
        'TextNode',                             true,
        'CDATASectionNode',                     true,
        'PINode',                               true,
        'CommentNode',                          true,
        'DocumentFragmentNode',                 true,

        'NodeList',                             true,
        'NamedNodeMap',                         true,

        'CSSStyleSheet',                        true,
        'CSSStyleRule',                         true,
        'CSSStyleDeclaration',                  true,

        'Error',                                true,
        'Event',                                true,
        'XHR',                                  true,

        'TIBETType',                            true,
        'TP.lang.Object',                       true,
        'TP.core.Hash',                         true,
        'TP.sig.Signal',                        true,
        'TP.sig.Exception',                     true,

        'TP.core.Window',                       true,
        'TP.dom.HTMLDocumentNode',              true,
        'TP.dom.HTMLElementNode',               true,

        'TP.dom.XMLDocumentNode',               true,
        'TP.dom.XMLElementNode',                true,

        'TP.dom.DocumentFragmentNode',          true,
        'TP.dom.AttributeNode',                 true,
        'TP.dom.TextNode',                      true,
        'TP.dom.CDATASectionNode',              true,
        'TP.dom.ProcessingInstructionNode',     true,
        'TP.dom.CommentNode',                   true,

        'TP.path.SimpleTIBETPath',              true,
        'TP.path.ComplexTIBETPath',             true,
        'TP.path.ElementPath',                  true,
        'TP.path.XTensionPath',                 true,
        'TP.path.XPathPath',                    true,

        'TP.sig.Request',                       true,
        'TP.sig.Response',                      true,

        'TP.uri.TIBETURN',                      true,
        'TP.uri.HTTPURL',                       true,
        'TP.uri.FileURL',                       true,
        /* eslint-disable no-script-url */
        'TP.uri.JSURI',                         true,
        /* eslint-enable no-script-url */
        'TP.uri.WSURL',                         true,
        'TP.uri.TIBETURL',                      true,
        'TP.uri.CookieURL',                     true,

        'TP.w3.DocType',                        true,

        'TP.gui.Point',                         true,
        'TP.gui.Rect',                          true,
        'TP.gui.Matrix',                        true,
        'TP.gui.Color',                         true,

        'TP.gui.LinearGradient',                true,
        'TP.gui.RadialGradient',                true,

        'TP.gui.Pattern',                       true,
        'TP.gui.Path',                          true,

        'TP.core.Job',                          true,
        'TP.core.Browser_TYPE',                 true,

        'TP.boot.Annotation',                   true,
        'TP.core.Annotation',                   true
        );
    /* eslint-enable no-multi-spaces */

    //  ---

    this.it('Correct values for each test', function(test, options) {

        var diffKeys;

        diffKeys = testKeys.difference(correctValues.getKeys());

        test.assert.isEmpty(
            diffKeys,
            'There are missing test values for TP.isReferenceType(): ' +
                                        diffKeys.asString(', '));

        test.assert.isEqualTo(
            testKeys.getSize(),
            correctValues.getKeys().getSize(),
            'There are missing test values for TP.isReferenceType(): ' +
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

            if (TP.isBoolean(correctVal)) {
                testFunc =
                    function(test, options) {
                        test.assert.isEqualTo(
                            TP.isReferenceType(testFunc.val),
                            testFunc.correctVal);
                    };
                testFunc.val = val;
                testFunc.correctVal = correctVal;
            }

            thisref.it('isReferenceType of: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

TP.sys.registerObject.describe('core object registration tests',
function() {

    var thisref,

        testData,
        testKeys,
        len,
        i,

        testKey,

        correctVal;

    TP.$$setupCommonObjectValues();

    thisref = this;

    testData = TP.$$commonObjectValues;
    testKeys = testData.getKeys();

    //  ---

    this.it('Correct values for each test', function(test, options) {

        test.assert.isTrue(true);
    });

    len = testKeys.getSize();
    for (i = 0; i < len; i++) {

        testKey = testKeys.at(i);

        correctVal = testData.at(testKey);

        //  ---

        /* eslint-disable no-loop-func */
        (function() {

            var testFunc;

            testFunc =
                function(test, options) {
                    test.assert.isIdenticalTo(
                        TP.bySystemId(testFunc.valID),
                        testFunc.correctVal);
                };
            testFunc.valID = testKey + '__TEST__';
            testFunc.correctVal = correctVal;
            TP.sys.registerObject(correctVal, testFunc.valID, true);

            thisref.it('registerObject: ' + testKey, testFunc);
        }());
        /* eslint-disable no-loop-func */
    }
});

//  ------------------------------------------------------------------------

//  TP.isSubtypeOf()
//  TP.keys()
//  TP.loc()
//  TP.parse()
//  TP.size()

//  TP.validate()

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

        val = TP.reformatJSToJSON('{foo:[bar,moo],baz:goo}');
        correctVal = TP.json({foo: ['bar', 'moo'], baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : bar , baz : goo }');
        correctVal = TP.json({foo: 'bar', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ bar , moo ] , baz : goo}');
        correctVal = TP.json({foo: ['bar', 'moo'], baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:bar,baz:{goo:moo}}');
        correctVal = TP.json({foo: 'bar', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[bar,moo],baz:{goo:[moo,bar]}}');
        correctVal = TP.json({foo: ['bar', 'moo'], baz: {goo: ['moo', 'bar']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : bar , baz : { goo : moo } }');
        correctVal = TP.json({foo: 'bar', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo : [ bar , moo ] , baz : { goo : [ moo , bar ] } }');
        correctVal = TP.json({foo: ['bar', 'moo'], baz: {goo: ['moo', 'bar']}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('quoted values', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'bar\',baz:\'goo\'}');
        correctVal = TP.json({foo: '\'bar\'', baz: '\'goo\''});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[\'bar\',\'moo\'],baz:\'goo\'}');
        correctVal = TP.json({foo: ['\'bar\'', '\'moo\''], baz: '\'goo\''});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'bar\' , baz : \'goo\' }');
        correctVal = TP.json({foo: '\'bar\'', baz: '\'goo\''});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ \'bar\' , \'moo\' ] , baz : \'goo\' }');
        correctVal = TP.json({foo: ['\'bar\'', '\'moo\''], baz: '\'goo\''});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'bar\',baz:{goo:\'moo\'}}');
        correctVal = TP.json({foo: '\'bar\'', baz: {goo: '\'moo\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[\'bar\',\'moo\'],baz:{goo:[\'moo\',\'bar\']}}');
        correctVal = TP.json({foo: ['\'bar\'', '\'moo\''], baz: {goo: ['\'moo\'', '\'bar\'']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'bar\', baz : { goo : \'moo\' } }');
        correctVal = TP.json({foo: '\'bar\'', baz: {goo: '\'moo\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo : [ \'bar\' , \'moo\' ], baz : { goo : [ \'moo\' , \'bar\' ] } }');
        correctVal = TP.json({foo: ['\'bar\'', '\'moo\''], baz: {goo: ['\'moo\'', '\'bar\'']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{foo:\'bar and baz\',baz:{goo:\'moo and too\'}}');
        correctVal = TP.json(
                {foo: '\'bar and baz\'', baz: {goo: '\'moo and too\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON(
                '{foo:[\'bar and baz\',\'moo and foo\'],baz:{goo:[\'moo and too\',\'goo and foo\']}}');
        correctVal = TP.json(
                {foo: ['\'bar and baz\'', '\'moo and foo\''], baz: {goo: ['\'moo and too\'', '\'goo and foo\'']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{ foo : \'bar and baz\' , baz : { goo : \'moo and too\' } }');
        correctVal = TP.json(
                {foo: '\'bar and baz\'', baz: {goo: '\'moo and too\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON(
                '{ foo : [ \'bar and baz\' , \'moo and foo\' ] , baz : { goo : [ \'moo and too\',\'goo and foo\' ] } }');
        correctVal = TP.json(
                {foo: ['\'bar and baz\'', '\'moo and foo\''], baz: {goo: ['\'moo and too\'', '\'goo and foo\'']}});

        test.assert.isEqualTo(val, correctVal);

    });

    this.it('nested single quoted values', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'b\\\'ar\',baz:\'go\\\'o\'}');
        correctVal = TP.json({foo: '\'b\'ar\'', baz: '\'go\'o\''});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[\'b\\\'ar\',\'m\\\'oo\'],baz:\'go\\\'o\'}');
        correctVal = TP.json({foo: ['\'b\'ar\'', '\'m\'oo\''], baz: '\'go\'o\''});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'b\\\'ar\', baz : \'go\\\'o\' }');
        correctVal = TP.json({foo: '\'b\'ar\'', baz: '\'go\'o\''});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ \'b\\\'ar\' , \'m\\\'oo\' ] , baz : \'go\\\'o\' }');
        correctVal = TP.json({foo: ['\'b\'ar\'', '\'m\'oo\''], baz: '\'go\'o\''});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'b\\\'ar\',baz:{goo:\'mo\\\'o\'}}');
        correctVal = TP.json({foo: '\'b\'ar\'', baz: {goo: '\'mo\'o\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[\'b\\\'ar\',\'m\\\'oo\'],baz:{goo:[\'mo\\\'o\',\'to\\\'o\']}}');
        correctVal = TP.json({foo: ['\'b\'ar\'', '\'m\'oo\''], baz: {goo: ['\'mo\'o\'', '\'to\'o\'']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'b\\\'ar\' , baz : { goo : \'mo\\\'o\' } }');
        correctVal = TP.json({foo: '\'b\'ar\'', baz: {goo: '\'mo\'o\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ \'b\\\'ar\' , \'m\\\'oo\' ], baz : { goo : [ \'mo\\\'o\' , \'to\\\'o\' ] } }');
        correctVal = TP.json({foo: ['\'b\'ar\'', '\'m\'oo\''], baz: {goo: ['\'mo\'o\'', '\'to\'o\'']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{foo:\'b\\\'ar and b\\\'az\',baz:{goo:\'moo\\\' and to\\\'o\'}}');
        correctVal = TP.json(
                {foo: '\'b\'ar and b\'az\'', baz: {goo: '\'moo\' and to\'o\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON(
                '{foo:[\'b\\\'ar and b\\\'az\',\'m\\\'oo and f\\\'oo\'],baz:{goo:[\'moo\\\' and to\\\'o\',\'g\\\'oo and t\\\'oo\']}}');
        correctVal = TP.json(
                {foo: ['\'b\'ar and b\'az\'', '\'m\'oo and f\'oo\''], baz: {goo: ['\'moo\' and to\'o\'', '\'g\'oo and t\'oo\'']}});

        test.assert.isEqualTo(val, correctVal);
        //  nested value - separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{ foo : \'b\\\'ar and b\\\'az\' , baz : { goo : \'moo\\\' and to\\\'o\' } }');
        correctVal = TP.json(
                {foo: '\'b\'ar and b\'az\'', baz: {goo: '\'moo\' and to\'o\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON(
                '{ foo : [ \'b\\\'ar and b\\\'az\' , \'m\\\'oo and f\\\'oo\'] , baz : { goo : [ \'moo\\\' and to\\\'o\' , \'g\\\'oo and t\\\'oo\' ] } }');
        correctVal = TP.json(
                {foo: ['\'b\'ar and b\'az\'', '\'m\'oo and f\'oo\''], baz: {goo: ['\'moo\' and to\'o\'', '\'g\'oo and t\'oo\'']}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('nested double quoted values', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'b\\"ar\',baz:\'go\\"o\'}');
        correctVal = TP.json({foo: '\'b"ar\'', baz: '\'go"o\''});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[\'b\\"ar\',\'m\\"oo\'],baz:\'go\\"o\'}');
        correctVal = TP.json({foo: ['\'b"ar\'', '\'m"oo\''], baz: '\'go"o\''});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'b\\"ar\', baz : \'go\\"o\' }');
        correctVal = TP.json({foo: '\'b"ar\'', baz: '\'go"o\''});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ \'b\\"ar\' , \'m\\"oo\' ] , baz : \'go\\"o\' }');
        correctVal = TP.json({foo: ['\'b"ar\'', '\'m"oo\''], baz: '\'go"o\''});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'b\\"ar\',baz:{goo:\'mo\\"o\'}}');
        correctVal = TP.json({foo: '\'b"ar\'', baz: {goo: '\'mo"o\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[\'b\\"ar\',\'m\\"oo\'],baz:{goo:[\'mo\\"o\',\'to\\"o\']}}');
        correctVal = TP.json({foo: ['\'b"ar\'', '\'m"oo\''], baz: {goo: ['\'mo"o\'', '\'to"o\'']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : \'b\\"ar\', baz : { goo : \'mo\\"o\' } }');
        correctVal = TP.json({foo: '\'b"ar\'', baz: {goo: '\'mo"o\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ \'b\\"ar\' , \'m\\"oo\' ], baz : { goo : [ \'mo\\"o\' , \'to\\"o\' ] } }');
        correctVal = TP.json({foo: ['\'b"ar\'', '\'m"oo\''], baz: {goo: ['\'mo"o\'', '\'to"o\'']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{foo:\'b\\"ar and b\\"az\',baz:{goo:\'moo\\" and to\\"o\'}}');
        correctVal = TP.json(
                {foo: '\'b"ar and b"az\'', baz: {goo: '\'moo" and to"o\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON(
                '{foo:[\'b\\"ar and b\\"az\',\'m\\"oo and f\\"oo\'],baz:{goo:[\'moo\\" and to\\"o\',\'g\\"oo and t\\"oo\']}}');
        correctVal = TP.json(
                {foo: ['\'b"ar and b"az\'', '\'m"oo and f"oo\''], baz: {goo: ['\'moo" and to"o\'', '\'g"oo and t"oo\'']}});

        //  nested value - separating whitespace - value whitespace
        val = TP.reformatJSToJSON(
                '{ foo : \'b\\"ar and b\\"az\' , baz : { goo : \'moo\\" and to\\"o\' } }');
        correctVal = TP.json(
                {foo: '\'b"ar and b"az\'', baz: {goo: '\'moo" and to"o\''}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON(
                '{ foo : [ \'b\\"ar and b\\"az\' , \'m\\"oo and f\\"oo\'] , baz : { goo : [ \'moo\\" and to\\"o\' , \'g\\"oo and t\\"oo\' ] } }');
        correctVal = TP.json(
                {foo: ['\'b"ar and b"az\'', '\'m"oo and f"oo\''], baz: {goo: ['\'moo" and to"o\'', '\'g"oo and t"oo\'']}});

    });

    this.it('embedded \'.\' resolving to real references', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:TP.BEFORE,baz:goo}');
        correctVal = TP.json({foo: 'before', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[TP.BEFORE, TP.AFTER],baz:goo}');
        correctVal = TP.json({foo: ['before', 'after'], baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : TP.BEFORE, baz : goo }');
        correctVal = TP.json({foo: 'before', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ TP.BEFORE , TP.AFTER ] , baz : goo }');
        correctVal = TP.json({foo: ['before', 'after'], baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:TP.BEFORE,baz:{goo:moo}}');
        correctVal = TP.json({foo: 'before', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[TP.BEFORE, TP.AFTER],baz:{goo:[moo, TP.BEFORE]}}');
        correctVal = TP.json({foo: ['before', 'after'], baz: {goo: ['moo', 'before']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : TP.BEFORE, baz : { goo : moo } }');
        correctVal = TP.json({foo: 'before', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ TP.BEFORE , TP.AFTER ] , baz : { goo : [ moo , TP.BEFORE ] } }');
        correctVal = TP.json({foo: ['before', 'after'], baz: {goo: ['moo', 'before']}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('embedded \'.\' resolving to no reference', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:bar.moo,baz:goo}');
        correctVal = TP.json({foo: 'bar.moo', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[bar.moo,goo.boo],baz:goo}');
        correctVal = TP.json({foo: ['bar.moo', 'goo.boo'], baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  separating whitespace
        val = TP.reformatJSToJSON('{ foo : bar.moo, baz : goo }');
        correctVal = TP.json({foo: 'bar.moo', baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ bar.moo , goo.boo ] , baz : goo}');
        correctVal = TP.json({foo: ['bar.moo', 'goo.boo'], baz: 'goo'});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - no separating whitespace
        val = TP.reformatJSToJSON('{foo:bar.moo,baz:{goo:moo}}');
        correctVal = TP.json({foo: 'bar.moo', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{foo:[bar.moo,goo.boo],baz:{goo:[moo,TP.BEFORE]}}');
        correctVal = TP.json({foo: ['bar.moo', 'goo.boo'], baz: {goo: ['moo', 'before']}});

        test.assert.isEqualTo(val, correctVal);

        //  nested value - separating whitespace
        val = TP.reformatJSToJSON('{ foo : bar.moo, baz : { goo : moo } }');
        correctVal = TP.json({foo: 'bar.moo', baz: {goo: 'moo'}});

        test.assert.isEqualTo(val, correctVal);

        val = TP.reformatJSToJSON('{ foo : [ bar.moo , goo.boo ] , baz : { goo : [ moo , TP.BEFORE ] } }');
        correctVal = TP.json({foo: ['bar.moo', 'goo.boo'], baz: {goo: ['moo', 'before']}});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('embedded \'[\' and \']\' characters', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'[[bar]]\'}');
        correctVal = TP.json({foo: '\'[[bar]]\''});

        test.assert.isEqualTo(val, correctVal);
    });

    this.it('embedded \'{\' and \'}\' characters', function(test, options) {

        var val,
            correctVal;

        //  no separating whitespace
        val = TP.reformatJSToJSON('{foo:\'{{bar}}\'}');
        correctVal = TP.json({foo: '\'{{bar}}\''});

        test.assert.isEqualTo(val, correctVal);
    });

});

//  ------------------------------------------------------------------------

//  TP.nodeEvaluatePath

TP.nodeEvaluatePath.describe('Fetch results for TP.XPATH_PATH_TYPE',
function() {

    var data;

    this.before(function(suite, options) {
        data = TP.doc(
            '<foo><bar></bar><baz></baz><baz></baz></foo>');
    });

    this.it('autocollapse defaulted - found item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  no defined autoCollapse (defaults to false).
        results = TP.nodeEvaluatePath(data, '//bar', TP.XPATH_PATH_TYPE);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 1);
        test.assert.isElement(results.at(0));
    });

    this.it('autocollapse false - found item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, '//bar', TP.XPATH_PATH_TYPE, false);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 1);
        test.assert.isElement(results.at(0));
    });

    this.it('autocollapse true - found item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, '//bar', TP.XPATH_PATH_TYPE, true);

        test.assert.isElement(results);
    });

    this.it('autocollapse defaulted - found multiple items', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  no defined autoCollapse (defaults to false).
        results = TP.nodeEvaluatePath(data, '//baz', TP.XPATH_PATH_TYPE);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 2);
        test.assert.isElement(results.at(0));
        test.assert.isElement(results.at(1));
    });

    this.it('autocollapse false - found multiple items', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, '//baz', TP.XPATH_PATH_TYPE, false);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 2);
        test.assert.isElement(results.at(0));
        test.assert.isElement(results.at(1));
    });

    this.it('autocollapse true - found multiple items', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, '//baz', TP.XPATH_PATH_TYPE, true);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 2);
        test.assert.isElement(results.at(0));
        test.assert.isElement(results.at(1));
    });

    this.it('autocollapse defaulted - didn\'t find item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  no defined autoCollapse (defaults to false).
        results = TP.nodeEvaluatePath(data, '//fluffy', TP.XPATH_PATH_TYPE);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 0);
    });

    this.it('autocollapse false - didn\'t find item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, '//fluffy', TP.XPATH_PATH_TYPE, false);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 0);
    });

    this.it('autocollapse true - didn\'t find item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, '//fluffy', TP.XPATH_PATH_TYPE, true);

        test.assert.isNull(results);
    });

});

//  ------------------------------------------------------------------------

TP.nodeEvaluatePath.describe('Fetch results for TP.CSS_PATH_TYPE',
function() {

    var data;

    this.before(function(suite, options) {
        data = TP.doc(
            '<foo><bar></bar><baz></baz><baz></baz></foo>');
    });

    this.it('autocollapse defaulted - found item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  no defined autoCollapse (defaults to false).
        results = TP.nodeEvaluatePath(data, 'bar', TP.CSS_PATH_TYPE);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 1);
        test.assert.isElement(results.at(0));
    });

    this.it('autocollapse false - found item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, 'bar', TP.CSS_PATH_TYPE, false);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 1);
        test.assert.isElement(results.at(0));
    });

    this.it('autocollapse true - found item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, 'bar', TP.CSS_PATH_TYPE, true);

        test.assert.isElement(results);
    });

    this.it('autocollapse defaulted - found multiple items', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  no defined autoCollapse (defaults to false).
        results = TP.nodeEvaluatePath(data, 'baz', TP.CSS_PATH_TYPE);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 2);
        test.assert.isElement(results.at(0));
        test.assert.isElement(results.at(1));
    });

    this.it('autocollapse false - found multiple items', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, 'baz', TP.CSS_PATH_TYPE, false);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 2);
        test.assert.isElement(results.at(0));
        test.assert.isElement(results.at(1));
    });

    this.it('autocollapse true - found multiple items', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, 'baz', TP.CSS_PATH_TYPE, true);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 2);
        test.assert.isElement(results.at(0));
        test.assert.isElement(results.at(1));
    });

    this.it('autocollapse defaulted - didn\'t find item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  no defined autoCollapse (defaults to false).
        results = TP.nodeEvaluatePath(data, 'fluffy', TP.CSS_PATH_TYPE);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 0);
    });

    this.it('autocollapse false - didn\'t find item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, 'fluffy', TP.CSS_PATH_TYPE, false);

        test.assert.isArray(results);
        test.assert.isSizeOf(results, 0);
    });

    this.it('autocollapse true - didn\'t find item', function(test, options) {

        var results;

        //  context
        //  path expr
        //  path type
        //  autoCollapse false
        results = TP.nodeEvaluatePath(data, 'fluffy', TP.CSS_PATH_TYPE, true);

        test.assert.isNull(results);
    });

});

//  ------------------------------------------------------------------------

//  TP.nodeEvaluateXPath()
//  TP.nodeEvaluateXPointer()
//  TP.nodeEvaluateXTension()
//  TP.nodeEvaluateCSS()
//  TP.nodeEvaluateBarename()

//  ------------------------------------------------------------------------

TP.entries.describe('core tests',
function() {

    this.it('empty values', function(test, options) {

        var val,
            entriesVal;

        //  NB: There are assertions for other kinds of objects that end up
        //  empty embedded in other tests below.

        val = '';
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, []);

        val = new String('');
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, []);

        val = {};
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, []);

        val = [];
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, []);

        val = new Object();
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, []);

        val = new Array();
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, []);

        val = TP.core.Hash.construct();
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, []);
    });

    this.it('non mutable values - primitives', function(test, options) {

        var val,
            entriesVal;

        val = 'hi';
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, [['0', 'h'], ['1', 'i']]);

        val = 42;
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);

        val = true;
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);
    });

    this.it('non mutable values - boxed', function(test, options) {

        var val,
            entriesVal;

        val = new String('hi');
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, [['0', 'h'], ['1', 'i']]);

        val = new Number(42);
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);

        val = new Boolean(true);
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);
    });

    this.it('mutable reference values - shorthand', function(test, options) {

        var val,
            entriesVal;

        /* eslint-disable brace-style, max-statements-per-line */
        val = function() {alert('hi');};
        /* eslint-enable brace-style, max-statements-per-line */
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);

        val = /foo/;
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);

        val = {foo: 'bar', baz: 'goo'};
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, [['foo', 'bar'], ['baz', 'goo']], 'object');

        val = [1, 2, 3];
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, [['0', 1], ['1', 2], ['2', 3]], 'array');
    });

    this.it('mutable reference values - boxed', function(test, options) {

        var val,
            entriesVal;

        val = new Date();
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);

        val = new Function('a', 'b', 'return a + b');
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);

        val = new RegExp('\\w+');
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);

        val = new Object();
        val.foo = 'bar';
        val.baz = 'goo';
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, [['foo', 'bar'], ['baz', 'goo']], 'object');

        val = new Array(1, 2, 3);
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, [['0', 1], ['1', 2], ['2', 3]], 'array');

        val = TP.lang.Object.construct();
        entriesVal = TP.entries(val);
        test.assert.isEmpty(entriesVal);

        val = TP.core.Hash.construct('foo', 'bar', 'baz', 'goo');
        entriesVal = TP.entries(val);
        test.assert.isEqualTo(entriesVal, [['foo', 'bar'], ['baz', 'goo']], 'tp.object');
    });

});

//  ------------------------------------------------------------------------

TP.bySystemId.describe('core tests',
function() {

    this.it('Retrieve global objects', function(test, options) {

        test.assert.isIdenticalTo(
            TP.bySystemId('TP'),
            TP,
            TP.sc('TP.bySystemId(\'TP\') named instance "TP".'));
    });

    //  ---

    this.it('Retrieve namespace object', function(test, options) {

        test.assert.isIdenticalTo(
            TP.bySystemId('TP.sig'),
            TP.sig,
            TP.sc('TP.bySystemId(\'TP.sig\') should find the namespace TP.sig.'));
    });

    //  ---

    this.it('Retrieve type object', function(test, options) {

        test.assert.isIdenticalTo(
            TP.bySystemId('TP.sig.Signal'),
            TP.sig.Signal,
            TP.sc('TP.bySystemId(\'TP.sig.Signal\') should find the named type TP.sig.Signal'));
    });

    //  ---

    this.it('Retrieve registered object', function(test, options) {

        var foo;

        foo = TP.ac(1, 2, 3);
        TP.sys.registerObject(foo, 'FOO', true);

        test.assert.isIdenticalTo(
            TP.bySystemId('FOO'),
            foo,
            TP.sc('TP.bySystemId(\'FOO\') should refer to the FOO object in the code frame.'));
    });

    //  ---

    this.it('Retrieve top-level window', function(test, options) {

        test.assert.isIdenticalTo(
            TP.unwrap(TP.bySystemId('top')),
            top,
            TP.sc('TP.bySystemId(\'top\') should find the top-level Window.'));
    });

});

//  ------------------------------------------------------------------------

TP.sys.getWindowById.describe('core tests',
function() {

    this.before(
        function(suite, options) {

            //  Set up a temporary reference to the top-level window path
            TP.$$topWindowPath = TP.sys.cfg('tibet.top_win_path');
        });

    //  ---

    this.it('Retrieve top-level window using \'top\'', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById('top'),
            top,
            TP.sc('TP.sys.getWindowById(\'top\') should find the top-level Window.'));
    });

    //  ---

    this.it('Retrieve top-level window using name', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById(top.name),
            top,
            TP.sc('TP.sys.getWindowById(\'' + top.name + '\') should find the top-level Window.'));
    });

    //  ---

    this.it('Retrieve top-level window using path', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById(TP.$$topWindowPath),
            top,
            TP.sc('TP.sys.getWindowById(...top window path...) should find the top-level Window.'));
    });

    //  ---

    this.it('Retrieve UIROOT window using \'UIROOT\'', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById('UIROOT'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'UIROOT\') should find the UIROOT Window.'));
    });

    //  ---

    this.it('Retrieve UIROOT window using path starting with \'top\'', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById('top.UIROOT'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'top.UIROOT\') should find the UIROOT Window.'));
    });

    //  ---

    this.it('Retrieve UIROOT window using path starting with top-level window\'s name', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById(top.name + '.UIROOT'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'' + top.name + '.UIROOT\') should find the UIROOT Window.'));
    });

    //  ---

    this.it('Retrieve UICANVAS window using \'tibet://\'', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById('tibet://'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'tibet://\') should find the UICANVAS Window.'));
    });

    //  ---

    this.it('Retrieve UICANVAS window using \'tibet://uicanvas\'', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById('tibet://uicanvas'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'tibet://uicanvas\') should find the UICANVAS Window.'));
    });

    //  ---

    this.it('Retrieve UICANVAS window using \'UICANVAS\'', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById('UICANVAS'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'UICANVAS\') should find the UICANVAS Window.'));
    });

    //  ---

    this.it('Retrieve UICANVAS window using \'UIROOT.UICANVAS\'', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById('UIROOT.UICANVAS'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'UIROOT.UICANVAS\') should find the UICANVAS Window.'));
    });

    //  ---

    this.it('Retrieve UICANVAS window using path starting with \'top\'', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById('top.UIROOT.UICANVAS'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'top.UIROOT.UICANVAS\') should find the UICANVAS Window.'));
    });

    //  ---

    this.it('Retrieve UICANVAS window using path starting with top-level window\'s name', function(test, options) {

        test.assert.isIdenticalTo(
            TP.sys.getWindowById(top.name + '.UIROOT.UICANVAS'),
            top.frames[0],
            TP.sc('TP.sys.getWindowById(\'' + top.name + '.UIROOT.UICANVAS\') should find the UICANVAS Window.'));
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
