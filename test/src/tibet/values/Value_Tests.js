//	========================================================================
/*
NAME:	TIBETValueTests.js
AUTH:	William J. Edney (wje)
NOTE:	Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
		Reserved. Patent Pending, Technical Pursuit Inc.

		Unless explicitly acquired and licensed under the Technical
		Pursuit License ("TPL") Version 1.5, the contents of this file
		are subject to the Reciprocal Public License ("RPL") Version 1.5
		and You may not copy or use this file in either source code or
		executable form, except in compliance with the terms and
		conditions of the RPL.

		You may obtain a copy of both the TPL and RPL (the "Licenses")
		from Technical Pursuit Inc. at http://www.technicalpursuit.com.

		All software distributed under the Licenses is provided strictly
		on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
		EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
		ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
		WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
		QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
		language governing rights and limitations under the Licenses.

*/
//	========================================================================

/**
*/

//	------------------------------------------------------------------------

TP.describe('local id - TP.objectLocalID() / TP.lid()',
function() {

    var testData;

    this.before(function() {
        TP.$$setupCommonObjectValues();
        testData = TP.$$commonObjectValues;
    });

    //  ---

    this.it('local id of instance of: undefined', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at(TP.UNDEF)),
                                'undefined');
    });

    //  ---

    this.it('local id of instance of: null', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at(TP.NULL)),
                                'null');
    });

    //  ---

    this.it('local id of instance of: Array', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Array')),
                                /^Array\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: Boolean', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('Boolean')),
                                'true');
    });

    //  ---

    this.it('local id of instance of: Date', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Date')),
                                /^Date\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: Function', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Function')),
                                /^Function\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: InvalidDate', function(test, options) {
        test.assert.matches(TP.lid(testData.at('InvalidDate')),
                                /^Date\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: NaN', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('NaN')),
                                'NaN');
    });

    //  ---

    this.it('local id of instance of: Number', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('Number')),
                                '42');
    });

    //  ---

    this.it('local id of instance of: Object', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Object')),
                                /^Object\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: RegExp', function(test, options) {
        test.assert.matches(TP.lid(testData.at('RegExp')),
                                /^RegExp\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: String', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('String')),
                                'bar');
    });

    //  ---

    this.it('local id of instance of: NativeType', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('NativeType')),
                                'Array');
    });

    //  ---

    this.it('local id of instance of: NativeFunction', function(test, options) {
        test.assert.matches(TP.lid(testData.at('NativeFunction')),
                                /^Function\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: Window', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('Window')),
                                TP.sys.cfg('tibet.uibuffer'));
    });

    //  ---

    this.it('local id of instance of: IFrameWindow', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('IFrameWindow')),
                                'UIROOT');
    });

    //  ---

    this.it('local id of instance of: Node', function(test, options) {
        //test.assert.isEqualTo(TP.lid(testData.at('Node')), 'Node');
        test.pass();
    });

    //  ---

    this.it('local id of instance of: HTMLDocument', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('HTMLDocument')),
                                'document');
    });

    //  ---

    this.it('local id of instance of: HTMLElement', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('HTMLElement')),
                                'body');
    });

    //  ---

    this.it('local id of instance of: XMLDocument', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('XMLDocument')),
                                'document');
    });

    //  ---

    this.it('local id of instance of: XMLElement', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('XMLElement')),
                                'element(/1)');
    });

    //  ---

    this.it('local id of instance of: AttributeNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('AttributeNode')),
                                'xpath1(./@foo)');
    });

    //  ---

    this.it('local id of instance of: CDATASectionNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('CDATASectionNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('local id of instance of: CommentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('CommentNode')),
                                'xpath1(./comment()[1])');
    });

    //  ---

    this.it('local id of instance of: DocumentFragmentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('DocumentFragmentNode')),
                                '#document-fragment');
    });

    //  ---

    this.it('local id of instance of: PINode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('PINode')),
                                'xpath1(./processing-instruction(\'foo\'))');
    });

    //  ---

    this.it('local id of instance of: TextNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TextNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('local id of instance of: NodeList', function(test, options) {
        test.assert.matches(TP.lid(testData.at('NodeList')),
                                /^NodeList\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: NamedNodeMap', function(test, options) {
        test.assert.matches(TP.lid(testData.at('NamedNodeMap')),
                                /^NamedNodeMap\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: CSSStyleSheet', function(test, options) {
        test.assert.matches(TP.lid(testData.at('CSSStyleSheet')),
                                /^CSSStyleSheet\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: CSSStyleRule', function(test, options) {
        test.assert.matches(TP.lid(testData.at('CSSStyleRule')),
                                /^CSSStyleRule\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: CSSStyleDeclaration', function(test, options) {
        test.assert.matches(TP.lid(testData.at('CSSStyleDeclaration')),
                                /^CSSStyleDeclaration\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: Error', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Error')),
                                /^Error\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: Event', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Event')),
                                /^MouseEvent\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: XHR', function(test, options) {
        test.assert.matches(TP.lid(testData.at('XHR')),
                                /^XMLHttpRequest\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TIBETType', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TIBETType')),
                                'TP.core.Node');
    });

    //  ---

    this.it('local id of instance of: TP.lang.Object', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.lang.Object')),
                                /^TP\.lang\.Object\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.lang.Hash', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.lang.Hash')),
                                /^TP\.lang\.Hash\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.sig.Signal', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.sig.Signal')),
                                /^TP\.sig\.Signal\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.sig.Exception', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.sig.Exception')),
                                /^TP\.sig\.Exception\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Window', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.Window')),
                                TP.sys.cfg('tibet.uibuffer'));
    });

    //  ---

    this.it('local id of instance of: TP.core.HTMLDocumentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.HTMLDocumentNode')),
                                'document');
    });

    //  ---

    this.it('local id of instance of: TP.core.HTMLElementNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.HTMLElementNode')),
                                'body');
    });

    //  ---

    this.it('local id of instance of: TP.core.XMLDocumentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.XMLDocumentNode')),
                                'document');
    });

    //  ---

    this.it('local id of instance of: TP.core.XMLElementNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.XMLElementNode')),
                                'element(/1)');
    });

    //  ---

    this.it('local id of instance of: TP.core.DocumentFragmentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.DocumentFragmentNode')),
                                '#document-fragment');
    });

    //  ---

    this.it('local id of instance of: TP.core.AttributeNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.AttributeNode')),
                                'xpath1(./@foo)');
    });

    //  ---

    this.it('local id of instance of: TP.core.TextNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.TextNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('local id of instance of: TP.core.CDATASectionNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.CDATASectionNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('local id of instance of: TP.core.ProcessingInstructionNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.ProcessingInstructionNode')),
                                'xpath1(./processing-instruction(\'foo\'))');
    });

    //  ---

    this.it('local id of instance of: TP.core.CommentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.CommentNode')),
                                'xpath1(./comment()[1])');
    });

    //  ---

    this.it('local id of instance of: TP.core.SimpleTIBETPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.SimpleTIBETPath')),
                                /^TP\.core\.SimpleTIBETPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.ComplexTIBETPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.ComplexTIBETPath')),
                                /^TP\.core\.ComplexTIBETPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.ElementPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.ElementPath')),
                                /^TP\.core\.ElementPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.XTensionPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.XTensionPath')),
                                /^TP\.core\.XTensionPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.XPathPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.XPathPath')),
                                /^TP\.core\.XPathPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.sig.Request', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.sig.Request')),
                                /^TP\.sig\.Request\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.sig.Response', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.sig.Response')),
                                /^TP\.sig\.Response\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.TIBETURN', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.TIBETURN')),
                                'urn:tibet:foo');
    });

    //  ---

    this.it('local id of instance of: TP.core.HTTPURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.HTTPURL')),
                                'http://www.blah.com');
    });

    //  ---

    this.it('local id of instance of: TP.core.FileURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.FileURL')),
                                'file:///goo.txt');
    });

    //  ---

    /* eslint-disable no-script-url */
    this.it('local id of instance of: TP.core.JSURI', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.JSURI')),
                                'javascript:alert("hi")');
    });
    /* eslint-enable no-script-url */

    //  ---

    this.it('local id of instance of: TP.core.WSURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.WSURL')),
                                'ws://ws.blah.com');
    });

    //  ---

    this.it('local id of instance of: TP.core.TIBETURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.TIBETURL')),
                                'tibet://top/file:///goo.txt');
    });

    //  ---

    this.it('local id of instance of: TP.core.CookieURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.CookieURL')),
                                'cookie://blah=foo');
    });

    //  ---

    this.it('local id of instance of: TP.w3.DocType', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.w3.DocType')),
                                /^TP\.w3\.DocType\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Point', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Point')),
                                /^TP\.core\.Point\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Rect', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Rect')),
                                /^TP\.core\.Rect\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Matrix', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Matrix')),
                                /^TP\.core\.Matrix\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Color', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Color')),
                                /^TP\.core\.Color\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.LinearGradient', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.LinearGradient')),
                                /^TP\.core\.LinearGradient\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.RadialGradient', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.RadialGradient')),
                                /^TP\.core\.RadialGradient\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Pattern', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Pattern')),
                                /^TP\.core\.Pattern\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Path', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Path')),
                                /^TP\.core\.SVGPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Job', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Job')),
                                /^TP\.core\.Job\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Browser_TYPE', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.Browser_TYPE')),
                                'TP.core.Browser');
    });

    //  ---

    this.it('local id of instance of: TP.boot.Annotation', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.boot.Annotation')),
                                /^Function\$(\w+)$/);
    });

    //  ---

    this.it('local id of instance of: TP.core.Annotation', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Annotation')),
                                /^TP\.core\.Annotation\$(\w+)$/);
    });
});

//	------------------------------------------------------------------------

TP.describe('global id - TP.objectGlobalID() / TP.gid()',
function() {

    var testData;

    this.before(function() {
        TP.$$setupCommonObjectValues();
        testData = TP.$$commonObjectValues;
    });

    //  ---

    this.it('global id of instance of: undefined', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at(TP.UNDEF)),
                                'undefined');
    });

    //  ---

    this.it('global id of instance of: null', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at(TP.NULL)),
                                'null');
    });

    //  ---

    this.it('global id of instance of: Array', function(test, options) {
        test.assert.matches(TP.gid(testData.at('Array')),
                                /^Array\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: Boolean', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('Boolean')),
                                'true');
    });

    //  ---

    this.it('global id of instance of: Date', function(test, options) {
        test.assert.matches(TP.gid(testData.at('Date')),
                                /^Date\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: Function', function(test, options) {
        test.assert.matches(TP.gid(testData.at('Function')),
                                /^Function\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: InvalidDate', function(test, options) {
        test.assert.matches(TP.gid(testData.at('InvalidDate')),
                                /^Date\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: NaN', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('NaN')),
                                'NaN');
    });

    //  ---

    this.it('global id of instance of: Number', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('Number')),
                                '42');
    });

    //  ---

    this.it('global id of instance of: Object', function(test, options) {
        test.assert.matches(TP.gid(testData.at('Object')),
                                /^Object\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: RegExp', function(test, options) {
        test.assert.matches(TP.gid(testData.at('RegExp')),
                                /^RegExp\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: String', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('String')),
                                'bar');
    });

    //  ---

    this.it('global id of instance of: NativeType', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('NativeType')),
                                'Array');
    });

    //  ---

    this.it('global id of instance of: NativeFunction', function(test, options) {
        test.assert.matches(TP.gid(testData.at('NativeFunction')),
                                /^Function\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: Window', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('Window')),
                                TP.sys.cfg('tibet.uibuffer'));
    });

    //  ---

    this.it('global id of instance of: IFrameWindow', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('IFrameWindow')),
                                TP.sys.cfg('tibet.uibuffer') + '.' + 'UIROOT');
    });

    //  ---

    this.it('global id of instance of: Node', function(test, options) {
        //test.assert.isEqualTo(TP.gid(testData.at('Node')), 'Node');
        test.pass();
    });

    //  ---

    this.it('global id of instance of: HTMLDocument', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('HTMLDocument')),
                                'tibet://' + TP.sys.cfg('tibet.uibuffer') +
                                '/' +
                                TP.documentGetLocation(
                                    testData.at('HTMLDocument') +
                                '#document'));
    });

    //  ---

    this.it('global id of instance of: HTMLElement', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('HTMLDocument')),
                                'tibet://' + TP.sys.cfg('tibet.uibuffer') +
                                '/' +
                                TP.documentGetLocation(
                                    testData.at('HTMLDocument') +
                                '#body'));
    });

    //  ---

    this.it('global id of instance of: XMLDocument', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('XMLDocument')),
                                'tibet:///#document');
    });

    //  ---

    this.it('global id of instance of: XMLElement', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('XMLElement')),
                                'tibet:///#element(/1)');
    });

    //  ---

    this.it('global id of instance of: AttributeNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('AttributeNode')),
                                'xpath1(./@foo)');
    });

    //  ---

    this.it('global id of instance of: CDATASectionNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('CDATASectionNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('global id of instance of: CommentNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('CommentNode')),
                                'xpath1(./comment()[1])');
    });

    //  ---

    this.it('global id of instance of: DocumentFragmentNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('DocumentFragmentNode')),
                                '#document-fragment');
    });

    //  ---

    this.it('global id of instance of: PINode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('PINode')),
                                'xpath1(./processing-instruction(\'foo\'))');
    });

    //  ---

    this.it('global id of instance of: TextNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TextNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('global id of instance of: NodeList', function(test, options) {
        test.assert.matches(TP.gid(testData.at('NodeList')),
                                /^NodeList\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: NamedNodeMap', function(test, options) {
        test.assert.matches(TP.gid(testData.at('NamedNodeMap')),
                                /^NamedNodeMap\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: CSSStyleSheet', function(test, options) {
        test.assert.matches(TP.gid(testData.at('CSSStyleSheet')),
                                /^CSSStyleSheet\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: CSSStyleRule', function(test, options) {
        test.assert.matches(TP.gid(testData.at('CSSStyleRule')),
                                /^CSSStyleRule\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: CSSStyleDeclaration', function(test, options) {
        test.assert.matches(TP.gid(testData.at('CSSStyleDeclaration')),
                                /^CSSStyleDeclaration\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: Error', function(test, options) {
        test.assert.matches(TP.gid(testData.at('Error')),
                                /^Error\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: Event', function(test, options) {
        test.assert.matches(TP.gid(testData.at('Event')),
                                /^MouseEvent\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: XHR', function(test, options) {
        test.assert.matches(TP.gid(testData.at('XHR')),
                                /^XMLHttpRequest\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TIBETType', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TIBETType')),
                                'TP.core.Node');
    });

    //  ---

    this.it('global id of instance of: TP.lang.Object', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.lang.Object')),
                                /^TP\.lang\.Object\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.lang.Hash', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.lang.Hash')),
                                /^TP\.lang\.Hash\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.sig.Signal', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.sig.Signal')),
                                /^TP\.sig\.Signal\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.sig.Exception', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.sig.Exception')),
                                /^TP\.sig\.Exception\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Window', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.Window')),
                                TP.sys.cfg('tibet.uibuffer'));
    });

    //  ---

    this.it('global id of instance of: TP.core.HTMLDocumentNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.HTMLDocumentNode')),
                                'tibet://' + TP.sys.cfg('tibet.uibuffer') +
                                '/' +
                                TP.documentGetLocation(
                                    testData.at('HTMLDocument') +
                                '#document'));
    });

    //  ---

    this.it('global id of instance of: TP.core.HTMLElementNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.HTMLElementNode')),
                                'tibet://' + TP.sys.cfg('tibet.uibuffer') +
                                '/' +
                                TP.documentGetLocation(
                                    testData.at('HTMLDocument') +
                                '#body'));
    });

    //  ---

    this.it('global id of instance of: TP.core.XMLDocumentNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.XMLDocumentNode')),
                                'tibet:///#document');
    });

    //  ---

    this.it('global id of instance of: TP.core.XMLElementNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.XMLElementNode')),
                                'tibet:///#element(/1)');
    });

    //  ---

    this.it('global id of instance of: TP.core.DocumentFragmentNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.DocumentFragmentNode')),
                                '#document-fragment');
    });

    //  ---

    this.it('global id of instance of: TP.core.AttributeNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.AttributeNode')),
                                'xpath1(./@foo)');
    });

    //  ---

    this.it('global id of instance of: TP.core.TextNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.TextNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('global id of instance of: TP.core.CDATASectionNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.CDATASectionNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('global id of instance of: TP.core.ProcessingInstructionNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.ProcessingInstructionNode')),
                                'xpath1(./processing-instruction(\'foo\'))');
    });

    //  ---

    this.it('global id of instance of: TP.core.CommentNode', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.CommentNode')),
                                'xpath1(./comment()[1])');
    });

    //  ---

    this.it('global id of instance of: TP.core.SimpleTIBETPath', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.SimpleTIBETPath')),
                                /^TP\.core\.SimpleTIBETPath\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.ComplexTIBETPath', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.ComplexTIBETPath')),
                                /^TP\.core\.ComplexTIBETPath\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.ElementPath', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.ElementPath')),
                                /^TP\.core\.ElementPath\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.XTensionPath', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.XTensionPath')),
                                /^TP\.core\.XTensionPath\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.XPathPath', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.XPathPath')),
                                /^TP\.core\.XPathPath\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.sig.Request', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.sig.Request')),
                                /^TP\.sig\.Request\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.sig.Response', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.sig.Response')),
                                /^TP\.sig\.Response\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.TIBETURN', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.TIBETURN')),
                                'urn:tibet:foo');
    });

    //  ---

    this.it('global id of instance of: TP.core.HTTPURL', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.HTTPURL')),
                                'http://www.blah.com');
    });

    //  ---

    this.it('global id of instance of: TP.core.FileURL', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.FileURL')),
                                'file:///goo.txt');
    });

    //  ---

    /* eslint-disable no-script-url */
    this.it('global id of instance of: TP.core.JSURI', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.JSURI')),
                                'javascript:alert("hi")');
    });
    /* eslint-enable no-script-url */

    //  ---

    this.it('global id of instance of: TP.core.WSURL', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.WSURL')),
                                'ws://ws.blah.com');
    });

    //  ---

    this.it('global id of instance of: TP.core.TIBETURL', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.TIBETURL')),
                                'tibet://top/file:///goo.txt');
    });

    //  ---

    this.it('global id of instance of: TP.core.CookieURL', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.CookieURL')),
                                'cookie://blah=foo');
    });

    //  ---

    this.it('global id of instance of: TP.w3.DocType', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.w3.DocType')),
                                /^TP\.w3\.DocType\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Point', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.Point')),
                                /^TP\.core\.Point\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Rect', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.Rect')),
                                /^TP\.core\.Rect\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Matrix', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.Matrix')),
                                /^TP\.core\.Matrix\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Color', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.Color')),
                                /^TP\.core\.Color\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.LinearGradient', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.LinearGradient')),
                                /^TP\.core\.LinearGradient\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.RadialGradient', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.RadialGradient')),
                                /^TP\.core\.RadialGradient\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Pattern', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.Pattern')),
                                /^TP\.core\.Pattern\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Path', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.Path')),
                                /^TP\.core\.SVGPath\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Job', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.Job')),
                                /^TP\.core\.Job\$(\w+)$/);
    });

    //  ---

    this.it('global id of: TP.core.Browser_TYPE', function(test, options) {
        test.assert.isEqualTo(TP.gid(testData.at('TP.core.Browser_TYPE')),
                                'TP.core.Browser');
    });

    //  ---

    this.it('global id of instance of: TP.boot.Annotation', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.boot.Annotation')),
                                /^Function\$(\w+)$/);
    });

    //  ---

    this.it('global id of instance of: TP.core.Annotation', function(test, options) {
        test.assert.matches(TP.gid(testData.at('TP.core.Annotation')),
                                /^TP\.core\.Annotation\$(\w+)$/);
    });
}).skip();

//	------------------------------------------------------------------------

TP.describe('TP.isType()',
function() {

    var testData;

    this.before(function() {
        TP.$$setupCommonObjectValues();
        testData = TP.$$commonObjectValues;
    });

    //  ---

    this.it('is type: undefined', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at(TP.UNDEF)));
    });

    //  ---

    this.it('is type: null', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at(TP.NULL)));
    });

    //  ---

    this.it('is type: instance of Array', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Array')));
    });

    //  ---

    this.it('is type: instance of Boolean', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Boolean')));
    });

    //  ---

    this.it('is type: instance of Date', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Date')));
    });

    //  ---

    this.it('is type: instance of Function', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Function')));
    });

    //  ---

    this.it('is type: instance of InvalidDate', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('InvalidDate')));
    });

    //  ---

    this.it('is type: NaN', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('NaN')));
    });

    //  ---

    this.it('is type: instance of Number', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Number')));
    });

    //  ---

    this.it('is type: instance of Object', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Object')));
    });

    //  ---

    this.it('is type: instance of RegExp', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('RegExp')));
    });

    //  ---

    this.it('is type: instance of String', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('String')));
    });

    //  ---

    this.it('is type: NativeType', function(test, options) {
        test.assert.isTrue(TP.isType(testData.at('NativeType')));
    });

    //  ---

    this.it('is type: instance of NativeFunction', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('NativeFunction')));
    });

    //  ---

    this.it('is type: instance of Window', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Window')));
    });

    //  ---

    this.it('is type: instance of IFrameWindow', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('IFrameWindow')));
    });

    //  ---

    this.it('is type: instance of Node', function(test, options) {
        //test.assert.isFalse(TP.isType(testData.at('Node')));
        test.pass();
    });

    //  ---

    this.it('is type: instance of HTMLDocument', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('HTMLDocument')));
    });

    //  ---

    this.it('is type: instance of HTMLElement', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('HTMLElement')));
    });

    //  ---

    this.it('is type: instance of XMLDocument', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('XMLDocument')));
    });

    //  ---

    this.it('is type: instance of XMLElement', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('XMLElement')));
    });

    //  ---

    this.it('is type: instance of AttributeNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('AttributeNode')));
    });

    //  ---

    this.it('is type: instance of CDATASectionNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('CDATASectionNode')));
    });

    //  ---

    this.it('is type: instance of CommentNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('CommentNode')));
    });

    //  ---

    this.it('is type: instance of DocumentFragmentNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('DocumentFragmentNode')));
    });

    //  ---

    this.it('is type: instance of PINode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('PINode')));
    });

    //  ---

    this.it('is type: instance of TextNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TextNode')));
    });

    //  ---

    this.it('is type: instance of NodeList', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('NodeList')));
    });

    //  ---

    this.it('is type: instance of NamedNodeMap', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('NamedNodeMap')));
    });

    //  ---

    this.it('is type: instance of CSSStyleSheet', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('CSSStyleSheet')));
    });

    //  ---

    this.it('is type: instance of CSSStyleRule', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('CSSStyleRule')));
    });

    //  ---

    this.it('is type: instance of CSSStyleDeclaration', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('CSSStyleDeclaration')));
    });

    //  ---

    this.it('is type: instance of Error', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Error')));
    });

    //  ---

    this.it('is type: instance of Event', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('Event')));
    });

    //  ---

    this.it('is type: instance of XHR', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('XHR')));
    });

    //  ---

    this.it('is type: TIBET Type', function(test, options) {
        test.assert.isTrue(TP.isType(testData.at('TIBETType')));
    });

    //  ---

    this.it('is type: instance of TP.lang.Object', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.lang.Object')));
    });

    //  ---

    this.it('is type: instance of TP.lang.Hash', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.lang.Hash')));
    });

    //  ---

    this.it('is type: TP.sig.Signal', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.sig.Signal')));
    });

    //  ---

    this.it('is type: instance of TP.sig.Exception', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.sig.Exception')));
    });

    //  ---

    this.it('is type: instance of TP.core.Window', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Window')));
    });

    //  ---

    this.it('is type: instance of TP.core.HTMLDocumentNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.HTMLDocumentNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.HTMLElementNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.HTMLElementNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.XMLDocumentNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.XMLDocumentNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.XMLElementNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.XMLElementNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.DocumentFragmentNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.DocumentFragmentNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.AttributeNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.AttributeNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.TextNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.TextNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.CDATASectionNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.CDATASectionNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.ProcessingInstructionNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.ProcessingInstructionNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.CommentNode', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.CommentNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.SimpleTIBETPath', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.SimpleTIBETPath')));
    });

    //  ---

    this.it('is type: instance of TP.core.ComplexTIBETPath', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.ComplexTIBETPath')));
    });

    //  ---

    this.it('is type: instance of TP.core.ElementPath', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.ElementPath')));
    });

    //  ---

    this.it('is type: instance of TP.core.XTensionPath', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.XTensionPath')));
    });

    //  ---

    this.it('is type: instance of TP.core.XPathPath', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.XPathPath')));
    });

    //  ---

    this.it('is type: instance of TP.sig.Request', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.sig.Request')));
    });

    //  ---

    this.it('is type: instance of TP.sig.Response', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.sig.Response')));
    });

    //  ---

    this.it('is type: instance of TP.core.TIBETURN', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.TIBETURN')));
    });

    //  ---

    this.it('is type: instance of TP.core.HTTPURL', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.HTTPURL')));
    });

    //  ---

    this.it('is type: instance of TP.core.FileURL', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.FileURL')));
    });

    //  ---

    /* eslint-disable no-script-url */
    this.it('is type: instance of TP.core.JSURI', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.JSURI')));
    });
    /* eslint-enable no-script-url */

    //  ---

    this.it('is type: instance of TP.core.WSURL', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.WSURL')));
    });

    //  ---

    this.it('is type: instance of TP.core.TIBETURL', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.TIBETURL')));
    });

    //  ---

    this.it('is type: instance of TP.core.CookieURL', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.CookieURL')));
    });

    //  ---

    this.it('is type: instance of TP.w3.DocType', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.w3.DocType')));
    });

    //  ---

    this.it('is type: instance of TP.core.Point', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Point')));
    });

    //  ---

    this.it('is type: instance of TP.core.Rect', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Rect')));
    });

    //  ---

    this.it('is type: instance of TP.core.Matrix', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Matrix')));
    });

    //  ---

    this.it('is type: instance of TP.core.Color', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Color')));
    });

    //  ---

    this.it('is type: instance of TP.core.LinearGradient', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.LinearGradient')));
    });

    //  ---

    this.it('is type: instance of TP.core.RadialGradient', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.RadialGradient')));
    });

    //  ---

    this.it('is type: instance of TP.core.Pattern', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Pattern')));
    });

    //  ---

    this.it('is type: instance of TP.core.Path', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Path')));
    });

    //  ---

    this.it('is type: instance of TP.core.Job', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Job')));
    });

    //  ---

    this.it('is type: TP.core.Browser_TYPE', function(test, options) {
        test.assert.isTrue(TP.isType(testData.at('TP.core.Browser_TYPE')));
    });

    //  ---

    this.it('is type: instance of TP.boot.Annotation', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.boot.Annotation')));
    });

    //  ---

    this.it('is type: instance of TP.core.Annotation', function(test, options) {
        test.assert.isFalse(TP.isType(testData.at('TP.core.Annotation')));
    });
});

//	------------------------------------------------------------------------

TP.describe('TP.isNativeType()',
function() {

    var testData;

    this.before(function() {
        TP.$$setupCommonObjectValues();
        testData = TP.$$commonObjectValues;
    });

    //  ---

    this.it('is type: undefined', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at(TP.UNDEF)));
    });

    //  ---

    this.it('is type: null', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at(TP.NULL)));
    });

    //  ---

    this.it('is type: instance of Array', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Array')));
    });

    //  ---

    this.it('is type: instance of Boolean', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Boolean')));
    });

    //  ---

    this.it('is type: instance of Date', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Date')));
    });

    //  ---

    this.it('is type: instance of Function', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Function')));
    });

    //  ---

    this.it('is type: instance of InvalidDate', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('InvalidDate')));
    });

    //  ---

    this.it('is type: NaN', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('NaN')));
    });

    //  ---

    this.it('is type: instance of Number', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Number')));
    });

    //  ---

    this.it('is type: instance of Object', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Object')));
    });

    //  ---

    this.it('is type: instance of RegExp', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('RegExp')));
    });

    //  ---

    this.it('is type: instance of String', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('String')));
    });

    //  ---

    this.it('is type: NativeType', function(test, options) {
        test.assert.isTrue(TP.isNativeType(testData.at('NativeType')));
    });

    //  ---

    this.it('is type: instance of NativeFunction', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('NativeFunction')));
    });

    //  ---

    this.it('is type: instance of Window', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Window')));
    });

    //  ---

    this.it('is type: instance of IFrameWindow', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('IFrameWindow')));
    });

    //  ---

    this.it('is type: instance of Node', function(test, options) {
        //test.assert.isFalse(TP.isNativeType(testData.at('Node')));
        test.pass();
    });

    //  ---

    this.it('is type: instance of HTMLDocument', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('HTMLDocument')));
    });

    //  ---

    this.it('is type: instance of HTMLElement', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('HTMLElement')));
    });

    //  ---

    this.it('is type: instance of XMLDocument', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('XMLDocument')));
    });

    //  ---

    this.it('is type: instance of XMLElement', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('XMLElement')));
    });

    //  ---

    this.it('is type: instance of AttributeNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('AttributeNode')));
    });

    //  ---

    this.it('is type: instance of CDATASectionNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('CDATASectionNode')));
    });

    //  ---

    this.it('is type: instance of CommentNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('CommentNode')));
    });

    //  ---

    this.it('is type: instance of DocumentFragmentNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('DocumentFragmentNode')));
    });

    //  ---

    this.it('is type: instance of PINode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('PINode')));
    });

    //  ---

    this.it('is type: instance of TextNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TextNode')));
    });

    //  ---

    this.it('is type: instance of NodeList', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('NodeList')));
    });

    //  ---

    this.it('is type: instance of NamedNodeMap', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('NamedNodeMap')));
    });

    //  ---

    this.it('is type: instance of CSSStyleSheet', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('CSSStyleSheet')));
    });

    //  ---

    this.it('is type: instance of CSSStyleRule', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('CSSStyleRule')));
    });

    //  ---

    this.it('is type: instance of CSSStyleDeclaration', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('CSSStyleDeclaration')));
    });

    //  ---

    this.it('is type: instance of Error', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Error')));
    });

    //  ---

    this.it('is type: instance of Event', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('Event')));
    });

    //  ---

    this.it('is type: instance of XHR', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('XHR')));
    });

    //  ---

    this.it('is type: TIBET Type', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TIBETType')));
    });

    //  ---

    this.it('is type: instance of TP.lang.Object', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.lang.Object')));
    });

    //  ---

    this.it('is type: instance of TP.lang.Hash', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.lang.Hash')));
    });

    //  ---

    this.it('is type: TP.sig.Signal', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.sig.Signal')));
    });

    //  ---

    this.it('is type: instance of TP.sig.Exception', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.sig.Exception')));
    });

    //  ---

    this.it('is type: instance of TP.core.Window', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Window')));
    });

    //  ---

    this.it('is type: instance of TP.core.HTMLDocumentNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.HTMLDocumentNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.HTMLElementNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.HTMLElementNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.XMLDocumentNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.XMLDocumentNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.XMLElementNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.XMLElementNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.DocumentFragmentNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.DocumentFragmentNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.AttributeNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.AttributeNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.TextNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.TextNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.CDATASectionNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.CDATASectionNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.ProcessingInstructionNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.ProcessingInstructionNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.CommentNode', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.CommentNode')));
    });

    //  ---

    this.it('is type: instance of TP.core.SimpleTIBETPath', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.SimpleTIBETPath')));
    });

    //  ---

    this.it('is type: instance of TP.core.ComplexTIBETPath', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.ComplexTIBETPath')));
    });

    //  ---

    this.it('is type: instance of TP.core.ElementPath', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.ElementPath')));
    });

    //  ---

    this.it('is type: instance of TP.core.XTensionPath', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.XTensionPath')));
    });

    //  ---

    this.it('is type: instance of TP.core.XPathPath', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.XPathPath')));
    });

    //  ---

    this.it('is type: instance of TP.sig.Request', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.sig.Request')));
    });

    //  ---

    this.it('is type: instance of TP.sig.Response', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.sig.Response')));
    });

    //  ---

    this.it('is type: instance of TP.core.TIBETURN', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.TIBETURN')));
    });

    //  ---

    this.it('is type: instance of TP.core.HTTPURL', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.HTTPURL')));
    });

    //  ---

    this.it('is type: instance of TP.core.FileURL', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.FileURL')));
    });

    //  ---

    /* eslint-disable no-script-url */
    this.it('is type: instance of TP.core.JSURI', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.JSURI')));
    });
    /* eslint-enable no-script-url */

    //  ---

    this.it('is type: instance of TP.core.WSURL', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.WSURL')));
    });

    //  ---

    this.it('is type: instance of TP.core.TIBETURL', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.TIBETURL')));
    });

    //  ---

    this.it('is type: instance of TP.core.CookieURL', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.CookieURL')));
    });

    //  ---

    this.it('is type: instance of TP.w3.DocType', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.w3.DocType')));
    });

    //  ---

    this.it('is type: instance of TP.core.Point', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Point')));
    });

    //  ---

    this.it('is type: instance of TP.core.Rect', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Rect')));
    });

    //  ---

    this.it('is type: instance of TP.core.Matrix', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Matrix')));
    });

    //  ---

    this.it('is type: instance of TP.core.Color', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Color')));
    });

    //  ---

    this.it('is type: instance of TP.core.LinearGradient', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.LinearGradient')));
    });

    //  ---

    this.it('is type: instance of TP.core.RadialGradient', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.RadialGradient')));
    });

    //  ---

    this.it('is type: instance of TP.core.Pattern', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Pattern')));
    });

    //  ---

    this.it('is type: instance of TP.core.Path', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Path')));
    });

    //  ---

    this.it('is type: instance of TP.core.Job', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Job')));
    });

    //  ---

    this.it('is type: TP.core.Browser_TYPE', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Browser_TYPE')));
    });

    //  ---

    this.it('is type: instance of TP.boot.Annotation', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.boot.Annotation')));
    });

    //  ---

    this.it('is type: instance of TP.core.Annotation', function(test, options) {
        test.assert.isFalse(TP.isNativeType(testData.at('TP.core.Annotation')));
    });
});

//	------------------------------------------------------------------------
//	end
//	========================================================================
