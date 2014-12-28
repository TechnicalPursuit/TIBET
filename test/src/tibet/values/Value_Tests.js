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

    this.it('local id of: undefined', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at(TP.UNDEF)), 'undefined');
    });

    //  ---

    this.it('local id of: null', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at(TP.NULL)), 'null');
    });

    //  ---

    this.it('local id of: Array', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Array')), /^Array\$(\w+)$/);
    });

    //  ---

    this.it('local id of: Boolean', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('Boolean')), 'true');
    });

    //  ---

    this.it('local id of: Date', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Date')), /^Date\$(\w+)$/);
    });

    //  ---

    this.it('local id of: Function', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Function')),
                            /^Function\$(\w+)$/);
    });

    //  ---

    this.it('local id of: InvalidDate', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Date')), /^Date\$(\w+)$/);
    });

    //  ---

    this.it('local id of: NaN', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('NaN')), 'NaN');
    });

    //  ---

    this.it('local id of: Number', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('Number')), '42');
    });

    //  ---

    this.it('local id of: Object', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Object')), /^Object\$(\w+)$/);
    });

    //  ---

    this.it('local id of: RegExp', function(test, options) {
        test.assert.matches(TP.lid(testData.at('RegExp')), /^RegExp\$(\w+)$/);
    });

    //  ---

    this.it('local id of: String', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('String')), 'bar');
    });

    //  ---

    this.it('local id of: NativeType', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('NativeType')), 'Array');
    });

    //  ---

    this.it('local id of: Window', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('Window')),
                                TP.sys.cfg('tibet.uibuffer'));
    });

    //  ---

    this.it('local id of: IFrameWindow', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('IFrameWindow')), 'UIROOT');
    });

    //  ---

    this.it('local id of: Node', function(test, options) {
        //test.assert.isEqualTo(TP.lid(testData.at('Node')), 'Node');
        test.pass();
    });

    //  ---

    this.it('local id of: HTMLDocument', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('HTMLDocument')), 'document');
    });

    //  ---

    this.it('local id of: HTMLElement', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('HTMLElement')), 'body');
    });

    //  ---

    this.it('local id of: XMLDocument', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('XMLDocument')), 'document');
    });

    //  ---

    this.it('local id of: XMLElement', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('XMLElement')), 'element(/1)');
    });

    //  ---

    this.it('local id of: AttributeNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('AttributeNode')),
                                'xpath1(./@foo)');
    });

    //  ---

    this.it('local id of: CDATASectionNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('CDATASectionNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('local id of: CommentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('CommentNode')),
                                'xpath1(./comment()[1])');
    });

    //  ---

    this.it('local id of: DocumentFragmentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('DocumentFragmentNode')),
                                '#document-fragment');
    });

    //  ---

    this.it('local id of: PINode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('PINode')),
                                'xpath1(./processing-instruction(\'foo\'))');
    });

    //  ---

    this.it('local id of: TextNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TextNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('local id of: NodeList', function(test, options) {
        test.assert.matches(TP.lid(testData.at('NodeList')),
                            /^NodeList\$(\w+)$/);
    });

    //  ---

    this.it('local id of: NamedNodeMap', function(test, options) {
        test.assert.matches(TP.lid(testData.at('NamedNodeMap')),
                            /^NamedNodeMap\$(\w+)$/);
    });

    //  ---

    this.it('local id of: CSSStyleSheet', function(test, options) {
        test.assert.matches(TP.lid(testData.at('CSSStyleSheet')),
                            /^CSSStyleSheet\$(\w+)$/);
    });

    //  ---

    this.it('local id of: CSSStyleRule', function(test, options) {
        test.assert.matches(TP.lid(testData.at('CSSStyleRule')),
                            /^CSSStyleRule\$(\w+)$/);
    });

    //  ---

    this.it('local id of: CSSStyleDeclaration', function(test, options) {
        test.assert.matches(TP.lid(testData.at('CSSStyleDeclaration')),
                            /^CSSStyleDeclaration\$(\w+)$/);
    });

    //  ---

    this.it('local id of: Error', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Error')),
                            /^Error\$(\w+)$/);
    });

    //  ---

    this.it('local id of: Event', function(test, options) {
        test.assert.matches(TP.lid(testData.at('Event')),
                            /^MouseEvent\$(\w+)$/);
    });

    //  ---

    this.it('local id of: XHR', function(test, options) {
        test.assert.matches(TP.lid(testData.at('XHR')),
                            /^XMLHttpRequest\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TIBETType', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TIBETType')),
                                'TP.core.Node');
    });

    //  ---

    this.it('local id of: TP.lang.Object', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.lang.Object')),
                            /^TP\.lang\.Object\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.lang.Hash', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.lang.Hash')),
                            /^TP\.lang\.Hash\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.sig.Signal', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.sig.Signal')),
                            /^TP\.sig\.Signal\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.sig.Exception', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.sig.Exception')),
                            /^TP\.sig\.Exception\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Window', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.Window')),
                                TP.sys.cfg('tibet.uibuffer'));
    });

    //  ---

    this.it('local id of: TP.core.HTMLDocumentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.HTMLDocumentNode')),
                                'document');
    });

    //  ---

    this.it('local id of: TP.core.HTMLElementNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.HTMLElementNode')),
                                'body');
    });

    //  ---

    this.it('local id of: TP.core.XMLDocumentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.XMLDocumentNode')),
                                'document');
    });

    //  ---

    this.it('local id of: TP.core.XMLElementNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.XMLElementNode')),
                                'element(/1)');
    });

    //  ---

    this.it('local id of: TP.core.DocumentFragmentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.DocumentFragmentNode')),
                                '#document-fragment');
    });

    //  ---

    this.it('local id of: TP.core.AttributeNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.AttributeNode')),
                                'xpath1(./@foo)');
    });

    //  ---

    this.it('local id of: TP.core.TextNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.TextNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('local id of: TP.core.CDATASectionNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.CDATASectionNode')),
                                'xpath1(./text()[contains(.,\'foo\')])');
    });

    //  ---

    this.it('local id of: TP.core.ProcessingInstructionNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.ProcessingInstructionNode')),
                                'xpath1(./processing-instruction(\'foo\'))');
    });

    //  ---

    this.it('local id of: TP.core.CommentNode', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.CommentNode')),
                                'xpath1(./comment()[1])');
    });

    //  ---

    this.it('local id of: TP.core.SimpleTIBETPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.SimpleTIBETPath')),
                            /^TP\.core\.SimpleTIBETPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.ComplexTIBETPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.ComplexTIBETPath')),
                            /^TP\.core\.ComplexTIBETPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.ElementPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.ElementPath')),
                            /^TP\.core\.ElementPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.XTensionPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.XTensionPath')),
                            /^TP\.core\.XTensionPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.XPathPath', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.XPathPath')),
                            /^TP\.core\.XPathPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.sig.Request', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.sig.Request')),
                            /^TP\.sig\.Request\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.sig.Response', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.sig.Response')),
                            /^TP\.sig\.Response\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.TIBETURN', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.TIBETURN')),
                                'urn:tibet:foo');
    });

    //  ---

    this.it('local id of: TP.core.HTTPURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.HTTPURL')),
                                'http://www.blah.com');
    });

    //  ---

    this.it('local id of: TP.core.FileURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.FileURL')),
                                'file:///goo.txt');
    });

    //  ---

    this.it('local id of: TP.core.JSURI', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.JSURI')),
                                'javascript:alert("hi")');
    });

    //  ---

    this.it('local id of: TP.core.WSURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.WSURL')),
                                'ws://ws.blah.com');
    });

    //  ---

    this.it('local id of: TP.core.TIBETURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.TIBETURL')),
                                'tibet://top/file:///goo.txt');
    });

    //  ---

    this.it('local id of: TP.core.CookieURL', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.CookieURL')),
                                'cookie://blah=foo');
    });

    //  ---

    this.it('local id of: TP.w3.DocType', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.w3.DocType')),
                            /^TP\.w3\.DocType\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Point', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Point')),
                            /^TP\.core\.Point\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Rect', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Rect')),
                            /^TP\.core\.Rect\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Matrix', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Matrix')),
                            /^TP\.core\.Matrix\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Color', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Color')),
                            /^TP\.core\.Color\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.LinearGradient', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.LinearGradient')),
                            /^TP\.core\.LinearGradient\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.RadialGradient', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.RadialGradient')),
                            /^TP\.core\.RadialGradient\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Pattern', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Pattern')),
                            /^TP\.core\.Pattern\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Path', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Path')),
                            /^TP\.core\.SVGPath\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Job', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Job')),
                            /^TP\.core\.Job\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Browser_TYPE', function(test, options) {
        test.assert.isEqualTo(TP.lid(testData.at('TP.core.Browser_TYPE')),
                                'TP.core.Browser');
    });

    //  ---

    this.it('local id of: TP.boot.Annotation', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.boot.Annotation')),
                            /^Function\$(\w+)$/);
    });

    //  ---

    this.it('local id of: TP.core.Annotation', function(test, options) {
        test.assert.matches(TP.lid(testData.at('TP.core.Annotation')),
                            /^TP\.core\.Annotation\$(\w+)$/);
    });
});

//	------------------------------------------------------------------------
//	end
//	========================================================================
