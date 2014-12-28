//  ========================================================================
/*
NAME:   TIBETObjectValues.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
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
//  ========================================================================

/* JSHint checking */

/* global Document: true,
          HTMLDocument: true,
          XMLDocument: true,
          Attr: true,
          CharacterData: true,
          Text: true,
          CDATASection: true,
          ProcessingInstruction: true,
          Comment: true,
          DocumentFragment: true,
          NodeList: true,
          NamedNodeMap: true,
          CSSStyleSheet: true,
          CSSStyleRule: true,
          CSSStyleDeclaration: true,
          UIEvent: true,
          MouseEvent: true
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupCommonObjectValues',
function(aRequest) {
    var undefVal,
        nullVal,

        stringVal,
        numberVal,
        booleanVal,

        regexpVal,
        dateVal,
        arrayVal,
        objectVal,
        functionVal,

        nanVal,
        invalidDateVal,

        nativeTypeVal,

        windowVal,
        iframeWindowVal,

        htmlDocumentVal,
        htmlElementVal,

        xmlDocumentVal,
        xmlElementVal,

        attrNodeVal,
        textNodeVal,
        cdataSectionNodeVal,
        piNodeVal,
        commentNodeVal,
        documentFragmentNodeVal,

        nodeListVal,
        namedNodeMapVal,

        stylesheetVal,
        styleRuleVal,
        styleDeclVal,

        errorVal,
        eventVal,
        xhrVal,

        tibetTypeVal,
        tibetObjectVal,
        tibetHashVal,
        tibetSignalVal,
        tibetExceptionVal,

        tibetWindowVal,
        tibetHTMLDocVal,
        tibetHTMLElemVal,

        tibetXMLDocVal,
        tibetXMLElemVal,

        tibetDocFragNodeVal,
        tibetAttributeNodeVal,
        tibetTextNodeVal,
        tibetCDATASectionNodeVal,
        tibetPINodeVal,
        tibetCommentNodeVal,

        tibetSimpleTIBETPathVal,
        tibetComplexTIBETPathVal,
        tibetElementPathVal,
        tibetXTensionPathVal,
        tibetXPathVal,

        tibetRequestVal,
        tibetResponseVal,

        tibetTIBETURNVal,

        tibetHTTPURLVal,
        tibetFileURLVal,
        tibetJSURIVal,
        tibetWSURLVal,
        tibetTIBETURLVal,
        tibetCookieURLVal,

        tibetDocTypeVal,

        tibetPointVal,
        tibetRectVal,
        tibetMatrixVal,
        tibetColorVal,

        tibetLinearGradientVal,
        tibetRadialGradientVal,
        tibetPatternVal,
        tibetPath,

        tibetJob,
        tibetBrowserType,

        tpBootAnnotation,
        tpAnnotation,
        tpBootLog,

        objValues;

    if (TP.isValid(TP.$$commonObjectValues)) {
        return;
    }

    undefVal = undefined;
    nullVal = null;

    booleanVal = true;
    stringVal = 'bar';
    numberVal = 42;

    regexpVal = /foo/g;
    dateVal = new Date('Aug 23 1995');
    arrayVal = [1, 2, 3];

    objectVal = {};
    objectVal.foo = 'bar';

    functionVal = function () {return 'fluffy';};

    nanVal = NaN;
    invalidDateVal = new Date('fluffy');

    nativeTypeVal = Array;

    windowVal = top;
    iframeWindowVal = top.UIROOT;

    htmlDocumentVal = top.document;
    htmlElementVal = top.document.body;

    xmlDocumentVal = TP.createDocument();
    xmlDocumentVal.appendChild(TP.elem('<foo bar="baz">Hi there<\/foo>'));
    xmlDocumentVal.documentElement.appendChild(TP.elem('<boo><goo/><\/boo>'));
    xmlDocumentVal.documentElement.appendChild(TP.elem('<moo\/>'));

    xmlElementVal = xmlDocumentVal.createElement('foo');
    xmlElementVal.appendChild(xmlDocumentVal.createTextNode('bar'));

    attrNodeVal = xmlDocumentVal.createAttribute('foo');
    attrNodeVal.nodeValue = 'bar';

    textNodeVal = xmlDocumentVal.createTextNode('foo');
    cdataSectionNodeVal = xmlDocumentVal.createCDATASection('foo');
    piNodeVal = xmlDocumentVal.createProcessingInstruction('foo', 'bar');
    commentNodeVal = xmlDocumentVal.createComment('foo');

    documentFragmentNodeVal = xmlDocumentVal.createDocumentFragment();
    documentFragmentNodeVal.appendChild(xmlDocumentVal.createElement('foo'));
    documentFragmentNodeVal.appendChild(xmlDocumentVal.createElement('bar'));

    nodeListVal = xmlDocumentVal.documentElement.childNodes;
    namedNodeMapVal = xmlDocumentVal.documentElement.attributes;

    stylesheetVal = top.document.styleSheets[0];
    styleRuleVal = TP.styleSheetGetStyleRules(stylesheetVal, false)[1];
    styleDeclVal = styleRuleVal.style;

    errorVal = new Error('There was an error');
    eventVal = TP.documentCreateEvent(
                    TP.sys.uidoc(true), TP.ac('type','mouseover'));

    xhrVal = new XMLHttpRequest();

    tibetTypeVal = TP.sys.require('TP.core.Node');

    tibetObjectVal = TP.lang.Object.construct();
    tibetObjectVal.defineAttribute('foo');
    tibetObjectVal.set('foo', 'bar');

    tibetHashVal = TP.lang.Hash.construct();
    tibetHashVal.atPut('foo', 'bar');

    tibetSignalVal = TP.sig.Signal.construct(TP.hc('foo', 'bar'));
    //  Need to do this so that the signal has a real signal name for testing
    //  down below
    tibetSignalVal.getSignalName();

    tibetExceptionVal = TP.sig.Exception.construct(
        TP.hc('object', errorVal,
                 'message', 'There really was an Error'));
    //  Need to do this so that the exception has a real signal name for testing
    //  down below
    tibetExceptionVal.getSignalName();

    tibetWindowVal = TP.core.Window.construct(windowVal);
    tibetHTMLDocVal = TP.core.Document.construct(htmlDocumentVal);
    tibetHTMLElemVal = TP.core.HTMLElementNode.construct(htmlElementVal);

    tibetXMLDocVal = TP.core.Document.construct(xmlDocumentVal);
    tibetXMLElemVal = TP.core.XMLElementNode.construct(xmlElementVal);

    tibetDocFragNodeVal = TP.core.DocumentFragmentNode.construct(
        documentFragmentNodeVal);
    tibetAttributeNodeVal = TP.core.AttributeNode.construct(attrNodeVal);
    tibetTextNodeVal = TP.core.TextNode.construct(textNodeVal);
    tibetCDATASectionNodeVal = TP.core.CDATASectionNode.construct(
        cdataSectionNodeVal);
    tibetPINodeVal = TP.core.ProcessingInstructionNode.construct(piNodeVal);
    tibetCommentNodeVal = TP.core.CommentNode.construct(commentNodeVal);

    tibetSimpleTIBETPathVal = TP.core.SimpleTIBETPath.construct('foo');
    tibetComplexTIBETPathVal = TP.core.ComplexTIBETPath.construct('foo.bar.baz');
    tibetElementPathVal = TP.core.ElementPath.construct('/1/2');
    tibetXTensionPathVal = TP.core.XTensionPath.construct('*[foo]');
    tibetXPathVal = TP.core.XPathPath.construct('//*');

    tibetRequestVal = TP.sig.Request.construct(TP.hc('foo', 'bar'));
    //  Need to do this so that the request has a real signal name for testing
    //  down below
    tibetRequestVal.getSignalName();

    tibetResponseVal = TP.sig.Response.construct(tibetRequestVal, 'baz');
    //  Need to do this so that the response has a real signal name for testing
    //  down below
    tibetResponseVal.getSignalName();

    tibetTIBETURNVal = TP.uc('urn:tibet:foo');
    tibetHTTPURLVal = TP.uc('http://www.blah.com');
    tibetFileURLVal = TP.uc('file:///goo.txt');
    /* eslint-disable no-script-url */
    tibetJSURIVal = TP.uc('javascript:alert("hi")');
    /* eslint-enable no-script-url */
    tibetWSURLVal = TP.uc('ws://ws.blah.com');
    tibetTIBETURLVal = TP.uc('tibet://top/file:///goo.txt');
    tibetCookieURLVal = TP.uc('cookie://blah=foo');

    tibetDocTypeVal = TP.w3.DocType.construct(
        'html',
        '-//W3C//DTD XHTML 1.0 Strict//EN',
        'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd');

    tibetPointVal = TP.core.Point.construct(20, 30);
    tibetRectVal = TP.core.Rect.construct(0, 0, 100, 100);
    tibetMatrixVal = TP.core.Matrix.construct();
    tibetColorVal = TP.core.Color.construct(0, 255, 255);

    tibetLinearGradientVal = TP.core.LinearGradient.construct();
    tibetLinearGradientVal.set('angle', 45);
    tibetLinearGradientVal.addColorStop('10%', TP.cc(0, 0, 255, 0.5));
    tibetLinearGradientVal.addColorStop('50%', TP.cc(0, 255, 255, 1.0));

    tibetRadialGradientVal = TP.core.RadialGradient.construct();
    tibetRadialGradientVal.addColorStop('10%', TP.cc(0, 0, 255, 0.5));
    tibetRadialGradientVal.addColorStop('50%', TP.cc(0, 255, 255, 1.0));

    tibetPatternVal = TP.core.Pattern.construct().
                        set('x', 20).
                        set('y', 20).
                        set('width', 100).
                        set('height', 100);

    tibetPath = TP.core.SVGPath.construct();
    tibetPath.addSegment(TP.core.SVGPath.MOVE_TO_ABS, TP.ac(10, 10));
    tibetPath.addSegment(TP.core.SVGPath.MOVE_TO_ABS, TP.ac(20, 20));

    tibetJob = TP.core.Job.construct(TP.hc());

    tibetBrowserType = TP.core.Browser;

    tpBootAnnotation = TP.boot.$annotate('A String', 'This is a message');
    tpAnnotation = TP.annotate('A String', 'This is a message');
    tpBootLog = TP.sys.get('$bootlog');

    objValues = TP.hc(
    TP.NULL,                    nullVal,                //  null
    'Array',                    arrayVal,               //  Array
    'Boolean',                  booleanVal,             //  Boolean
    'Date',                     dateVal,                //  Date
    'Function',                 functionVal,            //  Function
    'InvalidDate',              invalidDateVal,         //  not a Date
    'NaN',                      nanVal,                 //  NaN
    'Number',                   numberVal,              //  Number
    'RegExp',                   regexpVal,              //  RegExp
    'Object',                   objectVal,              //  Object
    'String',                   stringVal,              //  String

    'NativeType',               nativeTypeVal,          //  NativeType

    'Window',                   windowVal,              //  Window
    'IFrameWindow',             iframeWindowVal,        //  IFrame Window

    'HTMLDocument',             htmlDocumentVal,        //  HTMLDocument
    'HTMLElement',              htmlElementVal,         //  HTMLElement

    'XMLDocument',              xmlDocumentVal,         //  XMLDocument
    'XMLElement',               xmlElementVal,          //  XMLElement

    'AttributeNode',            attrNodeVal,            //  Attribute Node
    'CDATASectionNode',         cdataSectionNodeVal,    //  Text Node
    'CommentNode',              commentNodeVal,         //  Comment Node
    'DocumentFragmentNode',     documentFragmentNodeVal,//  Document Fragment Node
    'PINode',                   piNodeVal,              //  PI Node
    'TextNode',                 textNodeVal,            //  Text Node

    'NodeList',                 nodeListVal,            //  NodeList
    'NamedNodeMap',             namedNodeMapVal,        //  NamedNodeMap

    'CSSStyleSheet',            stylesheetVal,          //  Stylesheet
    'CSSStyleRule',             styleRuleVal,           //  Style Rule
    'CSSStyleDeclaration',      styleDeclVal,           //  Style Declaration

    'Error',                    errorVal,               //  Error
    'Event',                    eventVal,               //  Event
    'XHR',                      xhrVal,                 //  XHR

    'TIBETType',                tibetTypeVal,           //  TIBET type

    'TP.lang.Object',           tibetObjectVal,         //  TP.lang.Object
    'TP.lang.Hash',             tibetHashVal,           //  TP.lang.Hash
    'TP.sig.Signal',            tibetSignalVal,         //  TP.sig.Signal
    'TP.sig.Exception',         tibetExceptionVal,      //  TP.sig.Exception

    'TP.core.Window',           tibetWindowVal,         //  TP.core.Window
    'TP.core.HTMLDocumentNode', tibetHTMLDocVal,        //  TP.core.HTMLDocumentNode
    'TP.core.HTMLElementNode',  tibetHTMLElemVal,       //  TP.core.HTMLElementNode

    'TP.core.XMLDocumentNode',  tibetXMLDocVal,         //  TP.core.XMLDocumentNode
    'TP.core.XMLElementNode',   tibetXMLElemVal,        //  TP.core.XMLElementNode

    'TP.core.DocumentFragmentNode', tibetDocFragNodeVal,    //  TP.core.DocumentFragmentNode
    'TP.core.AttributeNode',    tibetAttributeNodeVal,      //  TP.core.AttributeNode
    'TP.core.TextNode',         tibetTextNodeVal,           //  TP.core.TextNode
    'TP.core.CDATASectionNode', tibetCDATASectionNodeVal,   //  TP.core.CDATASectionNode
    'TP.core.ProcessingInstructionNode',    tibetPINodeVal, //  TP.core.ProcessingInstructionNode
    'TP.core.CommentNode',      tibetCommentNodeVal,        //  TP.core.CommentNode

    'TP.core.SimpleTIBETPath',  tibetSimpleTIBETPathVal,    //  TP.core.SimpleTIBETPath
    'TP.core.ComplexTIBETPath', tibetComplexTIBETPathVal,   //  TP.core.SimpleTIBETPath
    'TP.core.ElementPath',      tibetElementPathVal,        //  TP.core.ElementPath
    'TP.core.XTensionPath',     tibetXTensionPathVal,       //  TP.core.XTensionPath
    'TP.core.XPathPath',        tibetXPathVal,              //  TP.core.XPathPath

    'TP.sig.Request',           tibetRequestVal,        //  TP.sig.Request
    'TP.sig.Response',          tibetResponseVal,       //  TP.sig.Response

    'TP.core.TIBETURN',         tibetTIBETURNVal,       //  TP.core.TIBETURN
    'TP.core.HTTPURL',          tibetHTTPURLVal,        //  TP.core.HTTPURL
    'TP.core.FileURL',          tibetFileURLVal,        //  TP.core.FileURL
    'TP.core.JSURI',            tibetJSURIVal,          //  TP.core.JSURI
    'TP.core.WSURL',            tibetWSURLVal,          //  TP.core.WSURL
    'TP.core.TIBETURL',         tibetTIBETURLVal,       //  TP.core.TIBETURL
    'TP.core.CookieURL',        tibetCookieURLVal,      //  TP.core.CookieURL

    'TP.w3.DocType',            tibetDocTypeVal,        //  TP.w3.DocType

    'TP.core.Point',            tibetPointVal,          //  TP.core.Point
    'TP.core.Rect',             tibetRectVal,           //  TP.core.Rect
    'TP.core.Matrix',           tibetMatrixVal,         //  TP.core.Matrix
    'TP.core.Color',            tibetColorVal,          //  TP.core.Color

    'TP.core.LinearGradient',   tibetLinearGradientVal, //  TP.core.LinearGradient
    'TP.core.RadialGradient',   tibetRadialGradientVal, //  TP.core.RadialGradient
    'TP.core.Pattern',          tibetPatternVal,        //  TP.core.Pattern
    'TP.core.Path',             tibetPath,              //  TP.core.Path

    'TP.core.Job',              tibetJob,               //  TP.core.Job
    'TP.core.Browser_TYPE',     tibetBrowserType,       //  TP.core.Browser type

    'TP.boot.Annotation',       tpBootAnnotation,       //  TP.boot.Annotation
    'TP.core.Annotation',       tpAnnotation            //  TP.core.Annotation
    );

    //  In order to get an 'undefined' value into our hash, we have to play some
    //  trickery with the underlying hash... TODO: clean this up
    objValues.$get('$$hash')[TP.UNDEF] = undefined;

    TP.defineAttributeSlot(TP, '$$commonObjectValues', objValues);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupCommonObjectTypes',
function(aRequest) {
    var undefVal,
        nullVal,

        stringVal,
        numberVal,
        booleanVal,

        regexpVal,
        dateVal,
        arrayVal,
        objectVal,
        functionVal,

        nanVal,
        invalidDateVal,

        nativeTypeVal,

        windowVal,
        iframeWindowVal,

        htmlDocumentVal,
        htmlElementVal,

        xmlDocumentVal,
        xmlElementVal,

        attrNodeVal,
        textNodeVal,
        cdataSectionNodeVal,
        piNodeVal,
        commentNodeVal,
        documentFragmentNodeVal,

        nodeListVal,
        namedNodeMapVal,

        stylesheetVal,
        styleRuleVal,
        styleDeclVal,

        errorVal,
        eventVal,
        xhrVal,

        tibetTypeVal,
        tibetObjectVal,
        tibetHashVal,
        tibetSignalVal,
        tibetExceptionVal,

        tibetWindowVal,
        tibetHTMLDocVal,
        tibetHTMLElemVal,

        tibetXMLDocVal,
        tibetXMLElemVal,

        tibetDocFragNodeVal,
        tibetAttributeNodeVal,
        tibetTextNodeVal,
        tibetCDATASectionNodeVal,
        tibetPINodeVal,
        tibetCommentNodeVal,

        tibetSimpleTIBETPathVal,
        tibetComplexTIBETPathVal,
        tibetElementPathVal,
        tibetXTensionPathVal,
        tibetXPathVal,

        tibetRequestVal,
        tibetResponseVal,

        tibetTIBETURNVal,

        tibetHTTPURLVal,
        tibetFileURLVal,
        tibetJSURIVal,
        tibetWSURLVal,
        tibetTIBETURLVal,
        tibetCookieURLVal,

        tibetDocTypeVal,

        tibetPointVal,
        tibetRectVal,
        tibetMatrixVal,
        tibetColorVal,

        tibetLinearGradientVal,
        tibetRadialGradientVal,
        tibetPatternVal,
        tibetPath,

        tibetJob,
        tibetBrowserType,

        tpBootAnnotation,
        tpAnnotation,

        objTypes;

    if (TP.isValid(TP.$$commonObjectTypes)) {
        return;
    }

    undefVal = TP.ac();
    nullVal = TP.ac();

    booleanVal = TP.ac(Boolean, Object);
    stringVal = TP.ac(String, Object);
    numberVal = TP.ac(Number, Object);

    regexpVal = TP.ac(RegExp, Object);
    dateVal = TP.ac(Date, Object);
    arrayVal = TP.ac(Array, Object);

    objectVal = TP.ac(Object);

    functionVal = TP.ac(Function, Object);

    nanVal = TP.ac(Number, Object);
    invalidDateVal = TP.ac(Date, Object);

    nativeTypeVal = TP.ac(Function, Object);

    windowVal = TP.ac(Window, Object);
    iframeWindowVal = TP.ac(top.UIROOT.Window, top.UIROOT.Object);

    htmlDocumentVal = TP.ac(HTMLDocument, Document, Node, Object);
    htmlElementVal = TP.ac(HTMLBodyElement, HTMLElement, Element, Node, Object);

    xmlDocumentVal = TP.ac(XMLDocument, Document, Node, Object);
    xmlElementVal = TP.ac(Element, Node, Object);

    attrNodeVal = TP.ac(Attr, Node, Object);
    textNodeVal = TP.ac(Text, CharacterData, Node, Object);
    cdataSectionNodeVal = TP.ac(CDATASection, Text, CharacterData, Node, Object);
    piNodeVal = TP.ac(ProcessingInstruction, CharacterData, Node, Object);
    commentNodeVal = TP.ac(Comment, CharacterData, Node, Object);
    documentFragmentNodeVal = TP.ac(DocumentFragment, Node, Object);

    nodeListVal = TP.ac(NodeList, Object);
    namedNodeMapVal = TP.ac(NamedNodeMap, Object);

    stylesheetVal = TP.ac(CSSStyleSheet, Object);
    styleRuleVal = TP.ac(CSSStyleRule, Object);
    styleDeclVal = TP.ac(CSSStyleDeclaration, Object);

    errorVal = TP.ac(Error, Object);
    eventVal = TP.ac(MouseEvent, UIEvent, Object);
    xhrVal = TP.ac(XMLHttpRequest, Object);

    tibetTypeVal = TP.ac(TP.meta.core.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetObjectVal = TP.ac(TP.lang.Object, TP.lang.RootObject, Object);

    tibetHashVal = TP.ac(TP.lang.Hash, TP.lang.Object, TP.lang.RootObject, Object);

    tibetSignalVal = TP.ac(TP.sig.Signal, TP.lang.Object, TP.lang.RootObject, Object);

    tibetExceptionVal = TP.ac(TP.sig.Exception, TP.sig.Signal, TP.lang.Object, TP.lang.RootObject, Object);

    tibetWindowVal = TP.ac(TP.core.Window, TP.lang.Object, TP.lang.RootObject, Object);
    tibetHTMLDocVal = TP.ac(TP.core.HTMLDocumentNode, TP.core.DocumentNode, TP.core.CollectionNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetHTMLElemVal = TP.ac(TP.html.body, TP.html.Attrs, TP.core.UIElementNode, TP.core.ElementNode, TP.core.CollectionNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetXMLDocVal = TP.ac(TP.core.XMLDocumentNode, TP.core.DocumentNode, TP.core.CollectionNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetXMLElemVal = TP.ac(TP.core.XMLElementNode, TP.core.ElementNode, TP.core.CollectionNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetDocFragNodeVal = TP.ac(TP.core.DocumentFragmentNode, TP.core.CollectionNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetAttributeNodeVal = TP.ac(TP.core.AttributeNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetTextNodeVal = TP.ac(TP.core.TextNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetCDATASectionNodeVal = TP.ac(TP.core.CDATASectionNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetPINodeVal = TP.ac(TP.core.XMLProcessingInstruction, TP.core.ProcessingInstructionNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetCommentNodeVal = TP.ac(TP.core.CommentNode, TP.core.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetSimpleTIBETPathVal = TP.ac(TP.core.SimpleTIBETPath, TP.core.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);
    tibetComplexTIBETPathVal = TP.ac(TP.core.ComplexTIBETPath, TP.core.SimpleTIBETPath, TP.core.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);
    tibetElementPathVal = TP.ac(TP.core.ElementPath, TP.core.XMLPath, TP.core.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);
    tibetXTensionPathVal = TP.ac(TP.core.XTensionPath, TP.core.XMLPath, TP.core.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);
    tibetXPathVal = TP.ac(TP.core.XPathPath, TP.core.XMLPath, TP.core.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);

    tibetRequestVal = TP.ac(TP.sig.Request, TP.sig.WorkflowSignal, TP.sig.Signal, TP.lang.Object, TP.lang.RootObject, Object);

    tibetResponseVal = TP.ac(TP.sig.Response, TP.sig.WorkflowSignal, TP.sig.Signal, TP.lang.Object, TP.lang.RootObject, Object);

    tibetTIBETURNVal = TP.ac(TP.core.TIBETURN, TP.core.URN, TP.core.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetHTTPURLVal = TP.ac(TP.core.HTTPURL, TP.core.URL, TP.core.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetFileURLVal = TP.ac(TP.core.FileURL, TP.core.URL, TP.core.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetJSURIVal = TP.ac(TP.core.JSURI, TP.core.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetWSURLVal = TP.ac(TP.core.WSURL, TP.core.URL, TP.core.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetTIBETURLVal = TP.ac(TP.core.TIBETURL, TP.core.URL, TP.core.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetCookieURLVal = TP.ac(TP.core.CookieURL, TP.core.URL, TP.core.URI, TP.lang.Object, TP.lang.RootObject, Object);

    tibetDocTypeVal = TP.ac(TP.w3.DocType, TP.lang.Object, TP.lang.RootObject, Object);

    tibetPointVal = TP.ac(TP.core.Point, TP.lang.Object, TP.lang.RootObject, Object);
    tibetRectVal = TP.ac(TP.core.Rect, TP.lang.Object, TP.lang.RootObject, Object);
    tibetMatrixVal = TP.ac(TP.core.Matrix, TP.lang.Object, TP.lang.RootObject, Object);
    tibetColorVal = TP.ac(TP.core.Color, TP.lang.Object, TP.lang.RootObject, Object);

    tibetLinearGradientVal = TP.ac(TP.core.LinearGradient, TP.core.Gradient, TP.lang.Object, TP.lang.RootObject, Object);

    tibetRadialGradientVal = TP.ac(TP.core.RadialGradient, TP.core.Gradient, TP.lang.Object, TP.lang.RootObject, Object);

    tibetPatternVal = TP.ac(TP.core.Pattern, TP.lang.Object, TP.lang.RootObject, Object);

    tibetPath = TP.ac(TP.core.SVGPath, TP.core.Path, TP.lang.Object, TP.lang.RootObject, Object);

    tibetJob = TP.ac(TP.core.Job, TP.lang.Object, TP.lang.RootObject, Object);

    tibetBrowserType = TP.ac(TP.meta.core.Browser, TP.lang.Object, TP.lang.RootObject, Object);

    tpBootAnnotation = TP.ac(TP.boot.Annotation, Object);
    tpAnnotation = TP.ac(TP.core.Annotation, TP.lang.Object, TP.lang.RootObject, Object);

    objTypes = TP.hc(
    TP.NULL,                    nullVal,                //  null
    'Array',                    arrayVal,               //  Array
    'Boolean',                  booleanVal,             //  Boolean
    'Date',                     dateVal,                //  Date
    'Function',                 functionVal,            //  Function
    'InvalidDate',              invalidDateVal,         //  not a Date
    'NaN',                      nanVal,                 //  NaN
    'Number',                   numberVal,              //  Number
    'RegExp',                   regexpVal,              //  RegExp
    'Object',                   objectVal,              //  Object
    'String',                   stringVal,              //  String

    'NativeType',               nativeTypeVal,            //  NativeType

    'Window',                   windowVal,              //  Window
    'IFrameWindow',             iframeWindowVal,        //  IFrame Window

    'HTMLDocument',             htmlDocumentVal,        //  HTMLDocument
    'HTMLElement',              htmlElementVal,         //  HTMLElement

    'XMLDocument',              xmlDocumentVal,         //  XMLDocument
    'XMLElement',               xmlElementVal,          //  XMLElement

    'AttributeNode',            attrNodeVal,            //  Attribute Node
    'CDATASectionNode',         cdataSectionNodeVal,    //  Text Node
    'CommentNode',              commentNodeVal,         //  Comment Node
    'DocumentFragmentNode',     documentFragmentNodeVal,//  Document Fragment Node
    'PINode',                   piNodeVal,              //  PI Node
    'TextNode',                 textNodeVal,            //  Text Node

    'NodeList',                 nodeListVal,            //  NodeList
    'NamedNodeMap',             namedNodeMapVal,        //  NamedNodeMap

    'CSSStyleSheet',            stylesheetVal,          //  Stylesheet
    'CSSStyleRule',             styleRuleVal,           //  Style Rule
    'CSSStyleDeclaration',      styleDeclVal,           //  Style Declaration

    'Error',                    errorVal,               //  Error
    'Event',                    eventVal,               //  Event
    'XHR',                      xhrVal,                 //  XHR

    'TIBETType',                tibetTypeVal,           //  TIBET type

    'TP.lang.Object',           tibetObjectVal,         //  TP.lang.Object
    'TP.lang.Hash',             tibetHashVal,           //  TP.lang.Hash
    'TP.sig.Signal',            tibetSignalVal,         //  TP.sig.Signal
    'TP.sig.Exception',         tibetExceptionVal,      //  TP.sig.Exception

    'TP.core.Window',           tibetWindowVal,         //  TP.core.Window
    'TP.core.HTMLDocumentNode', tibetHTMLDocVal,        //  TP.core.HTMLDocumentNode
    'TP.core.HTMLElementNode',  tibetHTMLElemVal,       //  TP.core.HTMLElementNode

    'TP.core.XMLDocumentNode',  tibetXMLDocVal,         //  TP.core.XMLDocumentNode
    'TP.core.XMLElementNode',   tibetXMLElemVal,        //  TP.core.XMLElementNode

    'TP.core.DocumentFragmentNode', tibetDocFragNodeVal,    //  TP.core.DocumentFragmentNode
    'TP.core.AttributeNode',    tibetAttributeNodeVal,      //  TP.core.AttributeNode
    'TP.core.TextNode',         tibetTextNodeVal,           //  TP.core.TextNode
    'TP.core.CDATASectionNode', tibetCDATASectionNodeVal,   //  TP.core.CDATASectionNode
    'TP.core.ProcessingInstructionNode',    tibetPINodeVal, //  TP.core.ProcessingInstructionNode
    'TP.core.CommentNode',      tibetCommentNodeVal,        //  TP.core.CommentNode

    'TP.core.SimpleTIBETPath',  tibetSimpleTIBETPathVal,    //  TP.core.SimpleTIBETPath
    'TP.core.ComplexTIBETPath', tibetComplexTIBETPathVal,   //  TP.core.SimpleTIBETPath
    'TP.core.ElementPath',      tibetElementPathVal,        //  TP.core.ElementPath
    'TP.core.XTensionPath',     tibetXTensionPathVal,       //  TP.core.XTensionPath
    'TP.core.XPathPath',        tibetXPathVal,              //  TP.core.XPathPath

    'TP.sig.Request',           tibetRequestVal,        //  TP.sig.Request
    'TP.sig.Response',          tibetResponseVal,       //  TP.sig.Response

    'TP.core.TIBETURN',         tibetTIBETURNVal,       //  TP.core.TIBETURN
    'TP.core.HTTPURL',          tibetHTTPURLVal,        //  TP.core.HTTPURL
    'TP.core.FileURL',          tibetFileURLVal,        //  TP.core.FileURL
    'TP.core.JSURI',            tibetJSURIVal,          //  TP.core.JSURI
    'TP.core.WSURL',            tibetWSURLVal,          //  TP.core.WSURL
    'TP.core.TIBETURL',         tibetTIBETURLVal,       //  TP.core.TIBETURL
    'TP.core.CookieURL',        tibetCookieURLVal,      //  TP.core.CookieURL

    'TP.w3.DocType',            tibetDocTypeVal,        //  TP.w3.DocType

    'TP.core.Point',            tibetPointVal,          //  TP.core.Point
    'TP.core.Rect',             tibetRectVal,           //  TP.core.Rect
    'TP.core.Matrix',           tibetMatrixVal,         //  TP.core.Matrix
    'TP.core.Color',            tibetColorVal,          //  TP.core.Color

    'TP.core.LinearGradient',   tibetLinearGradientVal, //  TP.core.LinearGradient
    'TP.core.RadialGradient',   tibetRadialGradientVal, //  TP.core.RadialGradient
    'TP.core.Pattern',          tibetPatternVal,        //  TP.core.Pattern
    'TP.core.Path',             tibetPath,              //  TP.core.Path

    'TP.core.Job',              tibetJob,               //  TP.core.Job
    'TP.core.Browser_TYPE',     tibetBrowserType,       //  TP.core.Browser type

    'TP.boot.Annotation',       tpBootAnnotation,       //  TP.boot.Annotation
    'TP.core.Annotation',       tpAnnotation            //  TP.core.Annotation
    );

    //  In order to get an 'undefined' value into our hash, we have to play some
    //  trickery with the underlying hash... TODO: clean this up
    objTypes.$get('$$hash')[TP.UNDEF] = TP.ac();

    TP.defineAttributeSlot(TP, '$$commonObjectTypes', objTypes);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupHostTypesValues',
function(aRequest) {
    if (TP.sys.getBrowser() === 'firefox') {

        //  Slots on Firefox 28

        TP.$$hostTypesTestValues = TP.hc(
        'AnalyserNode', self.AnalyserNode,
        'AnimationEvent', self.AnimationEvent,
        'App', self.App,
        'Apps', self.Apps,
        'Attr', self.Attr,
        'AudioBuffer', self.AudioBuffer,
        'AudioBufferSourceNode', self.AudioBufferSourceNode,
        'AudioContext', self.AudioContext,
        'AudioDestinationNode', self.AudioDestinationNode,
        'AudioListener', self.AudioListener,
        'AudioNode', self.AudioNode,
        'AudioParam', self.AudioParam,
        'AudioProcessingEvent', self.AudioProcessingEvent,
        'BatteryManager', self.BatteryManager,
        'BiquadFilterNode', self.BiquadFilterNode,
        'Blob', self.Blob,
        'BlobBuilder', self.BlobBuilder,
        'BlobEvent', self.BlobEvent,
        'CallEvent', self.CallEvent,
        'CameraCapabilities', self.CameraCapabilities,
        'CameraControl', self.CameraControl,
        'CameraManager', self.CameraManager,
        'CanvasGradient', self.CanvasGradient,
        'CanvasPattern', self.CanvasPattern,
        'CanvasPixelArray', self.CanvasPixelArray,
        'CanvasRenderingContext2D', self.CanvasRenderingContext2D,
        'CaretPosition', self.CaretPosition,
        'CDATASection', self.CDATASection,
        'ChannelMergerNode', self.ChannelMergerNode,
        'ChannelSplitterNode', self.ChannelSplitterNode,
        'CharacterData', self.CharacterData,
        'ChildNode', self.ChildNode,
        'ChromeWorker', self.ChromeWorker,
        'CloseEvent', self.CloseEvent,
        'Comment', self.Comment,
        'CompositionEvent', self.CompositionEvent,
        'Connection', self.Connection,
        'Console', self.Console,
        'ContactManager', self.ContactManager,
        'ConvolverNode', self.ConvolverNode,
        'Coordinates', self.Coordinates,
        'CSS', self.CSS,
        'CSSConditionRule', self.CSSConditionRule,
        'CSSGroupingRule', self.CSSGroupingRule,
        'CSSKeyframeRule', self.CSSKeyframeRule,
        'CSSKeyframesRule', self.CSSKeyframesRule,
        'CSSMediaRule', self.CSSMediaRule,
        'CSSNamespaceRule', self.CSSNamespaceRule,
        'CSSPageRule', self.CSSPageRule,
        'CSSRule', self.CSSRule,
        'CSSRuleList', self.CSSRuleList,
        'CSSStyleDeclaration', self.CSSStyleDeclaration,
        'CSSStyleRule', self.CSSStyleRule,
        'CSSStyleSheet', self.CSSStyleSheet,
        'CSSSupportsRule', self.CSSSupportsRule,
        'CustomEvent', self.CustomEvent,
        'DataTransfer', self.DataTransfer,
        'DedicatedWorkerGlobalScope', self.DedicatedWorkerGlobalScope,
        'DelayNode', self.DelayNode,
        'DeviceAcceleration', self.DeviceAcceleration,
        'DeviceLightEvent', self.DeviceLightEvent,
        'DeviceMotionEvent', self.DeviceMotionEvent,
        'DeviceOrientationEvent', self.DeviceOrientationEvent,
        'DeviceProximityEvent', self.DeviceProximityEvent,
        'DeviceRotationRate', self.DeviceRotationRate,
        'DeviceStorage', self.DeviceStorage,
        'DeviceStorageChangeEvent', self.DeviceStorageChangeEvent,
        'DirectoryEntry', self.DirectoryEntry,
        'DirectoryEntrySync', self.DirectoryEntrySync,
        'DirectoryReader', self.DirectoryReader,
        'DirectoryReaderSync', self.DirectoryReaderSync,
        //'Document', self.Document,
        'DocumentFragment', self.DocumentFragment,
        'DocumentTouch', self.DocumentTouch,
        'DocumentType', self.DocumentType,
        'DOMConfiguration', self.DOMConfiguration,
        'DOMCursor', self.DOMCursor,
        'DOMError', self.DOMError,
        'DOMErrorHandler', self.DOMErrorHandler,
        'DOMException', self.DOMException,
        'DOMHighResTimeStamp', self.DOMHighResTimeStamp,
        'DOMImplementation', self.DOMImplementation,
        'DOMImplementationList', self.DOMImplementationList,
        'DOMImplementationSource', self.DOMImplementationSource,
        'DOMLocator', self.DOMLocator,
        'DOMObject', self.DOMObject,
        'DOMParser', self.DOMParser,
        'DOMRequest', self.DOMRequest,
        'DOMString', self.DOMString,
        'DOMStringList', self.DOMStringList,
        'DOMStringMap', self.DOMStringMap,
        'DOMTimeStamp', self.DOMTimeStamp,
        'DOMTokenList', self.DOMTokenList,
        'DOMUserData', self.DOMUserData,
        'DynamicsCompressorNode', self.DynamicsCompressorNode,
        'Element', self.Element,
        'ElementTraversal', self.ElementTraversal,
        'Entity', self.Entity,
        'EntityReference', self.EntityReference,
        'Entry', self.Entry,
        'EntrySync', self.EntrySync,
        'Event', self.Event,
        'EventListener', self.EventListener,
        'EventSource', self.EventSource,
        'EventTarget', self.EventTarget,
        'Extensions', self.Extensions,
        'File', self.File,
        'FileEntry', self.FileEntry,
        'FileEntrySync', self.FileEntrySync,
        'FileError', self.FileError,
        'FileException', self.FileException,
        'FileList', self.FileList,
        'FileReader', self.FileReader,
        'FileSystem', self.FileSystem,
        'FileSystemSync', self.FileSystemSync,
        'FMRadio', self.FMRadio,
        'FocusEvent', self.FocusEvent,
        'FormData', self.FormData,
        'GainNode', self.GainNode,
        'Geolocation', self.Geolocation,
        'HTMLAnchorElement', self.HTMLAnchorElement,
        'HTMLAreaElement', self.HTMLAreaElement,
        'HTMLAudioElement', self.HTMLAudioElement,
        'HTMLBaseElement', self.HTMLBaseElement,
        'HTMLBaseFontElement', self.HTMLBaseFontElement,
        'HTMLBodyElement', self.HTMLBodyElement,
        'HTMLBRElement', self.HTMLBRElement,
        'HTMLButtonElement', self.HTMLButtonElement,
        'HTMLCanvasElement', self.HTMLCanvasElement,
        'HTMLCollection', self.HTMLCollection,
        'HTMLDataElement', self.HTMLDataElement,
        'HTMLDataListElement', self.HTMLDataListElement,
        'HTMLDivElement', self.HTMLDivElement,
        'HTMLDListElement', self.HTMLDListElement,
        'HTMLDocument', self.HTMLDocument,
        'HTMLElement', self.HTMLElement,
        'HTMLEmbedElement', self.HTMLEmbedElement,
        'HTMLFieldSetElement', self.HTMLFieldSetElement,
        'HTMLFormControlsCollection', self.HTMLFormControlsCollection,
        'HTMLFormElement', self.HTMLFormElement,
        'HTMLHeadElement', self.HTMLHeadElement,
        'HTMLHeadingElement', self.HTMLHeadingElement,
        'HTMLHRElement', self.HTMLHRElement,
        'HTMLHtmlElement', self.HTMLHtmlElement,
        'HTMLIFrameElement', self.HTMLIFrameElement,
        'HTMLImageElement', self.HTMLImageElement,
        'HTMLInputElement', self.HTMLInputElement,
        'HTMLIsIndexElement', self.HTMLIsIndexElement,
        'HTMLKeygenElement', self.HTMLKeygenElement,
        'HTMLLabelElement', self.HTMLLabelElement,
        'HTMLLegendElement', self.HTMLLegendElement,
        'HTMLLIElement', self.HTMLLIElement,
        'HTMLLinkElement', self.HTMLLinkElement,
        'HTMLMapElement', self.HTMLMapElement,
        'HTMLMediaElement', self.HTMLMediaElement,
        'HTMLMetaElement', self.HTMLMetaElement,
        'HTMLMeterElement', self.HTMLMeterElement,
        'HTMLModElement', self.HTMLModElement,
        'HTMLObjectElement', self.HTMLObjectElement,
        'HTMLOListElement', self.HTMLOListElement,
        'HTMLOptGroupElement', self.HTMLOptGroupElement,
        'HTMLOptionElement', self.HTMLOptionElement,
        'HTMLOptionsCollection', self.HTMLOptionsCollection,
        'HTMLOutputElement', self.HTMLOutputElement,
        'HTMLParagraphElement', self.HTMLParagraphElement,
        'HTMLParamElement', self.HTMLParamElement,
        'HTMLPreElement', self.HTMLPreElement,
        'HTMLProgressElement', self.HTMLProgressElement,
        'HTMLQuoteElement', self.HTMLQuoteElement,
        'HTMLScriptElement', self.HTMLScriptElement,
        'HTMLSelectElement', self.HTMLSelectElement,
        'HTMLSourceElement', self.HTMLSourceElement,
        'HTMLSpanElement', self.HTMLSpanElement,
        'HTMLStyleElement', self.HTMLStyleElement,
        'HTMLTableCaptionElement', self.HTMLTableCaptionElement,
        'HTMLTableCellElement', self.HTMLTableCellElement,
        'HTMLTableColElement', self.HTMLTableColElement,
        'HTMLTableElement', self.HTMLTableElement,
        'HTMLTableRowElement', self.HTMLTableRowElement,
        'HTMLTableSectionElement', self.HTMLTableSectionElement,
        'HTMLTextAreaElement', self.HTMLTextAreaElement,
        'HTMLTimeElement', self.HTMLTimeElement,
        'HTMLTitleElement', self.HTMLTitleElement,
        'HTMLTrackElement', self.HTMLTrackElement,
        'HTMLUListElement', self.HTMLUListElement,
        'HTMLUnknownElement', self.HTMLUnknownElement,
        'HTMLVideoElement', self.HTMLVideoElement,
        'IDBCursor', self.IDBCursor,
        'IDBCursorWithValue', self.IDBCursorWithValue,
        'IDBDatabase', self.IDBDatabase,
        'IDBDatabaseException', self.IDBDatabaseException,
        'IDBEnvironment', self.IDBEnvironment,
        'IDBFactory', self.IDBFactory,
        'IDBIndex', self.IDBIndex,
        'IDBKeyRange', self.IDBKeyRange,
        'IDBObjectStore', self.IDBObjectStore,
        'IDBOpenDBRequest', self.IDBOpenDBRequest,
        'IDBRequest', self.IDBRequest,
        'IDBTransaction', self.IDBTransaction,
        'IDBVersionChangeEvent', self.IDBVersionChangeEvent,
        'ImageData', self.ImageData,
        'KeyboardEvent', self.KeyboardEvent,
        'LinkStyle', self.LinkStyle,
        'LocalFileSystem', self.LocalFileSystem,
        'LocalFileSystemSync', self.LocalFileSystemSync,
        'Location', self.Location,
        'MediaQueryList', self.MediaQueryList,
        'MediaQueryListListener', self.MediaQueryListListener,
        'MediaSource', self.MediaSource,
        'MediaStream', self.MediaStream,
        'MediaStreamTrack', self.MediaStreamTrack,
        'MessageEvent', self.MessageEvent,
        'MouseEvent', self.MouseEvent,
        'MouseScrollEvent', self.MouseScrollEvent,
        'MouseWheelEvent', self.MouseWheelEvent,
        'MozActivity', self.MozActivity,
        'MozActivityOptions', self.MozActivityOptions,
        'MozActivityRequestHandler', self.MozActivityRequestHandler,
        'MozAlarmsManager', self.MozAlarmsManager,
        'MozContact', self.MozContact,
        'MozContactChangeEvent', self.MozContactChangeEvent,
        'MozIccManager', self.MozIccManager,
        'MozMmsEvent', self.MozMmsEvent,
        'MozMmsMessage', self.MozMmsMessage,
        'MozMobileCellInfo', self.MozMobileCellInfo,
        'MozMobileCFInfo', self.MozMobileCFInfo,
        'MozMobileConnection', self.MozMobileConnection,
        'MozMobileConnectionInfo', self.MozMobileConnectionInfo,
        'MozMobileICCInfo', self.MozMobileICCInfo,
        'MozMobileMessageManager', self.MozMobileMessageManager,
        'MozMobileMessageThread', self.MozMobileMessageThread,
        'MozMobileNetworkInfo', self.MozMobileNetworkInfo,
        'MozNetworkStats', self.MozNetworkStats,
        'MozNetworkStatsData', self.MozNetworkStatsData,
        'MozNetworkStatsManager', self.MozNetworkStatsManager,
        'MozSettingsEvent', self.MozSettingsEvent,
        'MozSmsEvent', self.MozSmsEvent,
        'MozSmsFilter', self.MozSmsFilter,
        'MozSmsManager', self.MozSmsManager,
        'MozSmsMessage', self.MozSmsMessage,
        'MozSmsSegmentInfo', self.MozSmsSegmentInfo,
        'MozTimeManager', self.MozTimeManager,
        'MutationObserver', self.MutationObserver,
        'NamedNodeMap', self.NamedNodeMap,
        'NameList', self.NameList,
        'Navigator', self.Navigator,
        'NavigatorGeolocation', self.NavigatorGeolocation,
        'NavigatorID', self.NavigatorID,
        'NavigatorLanguage', self.NavigatorLanguage,
        'NavigatorOnLine', self.NavigatorOnLine,
        'NavigatorPlugins', self.NavigatorPlugins,
        'NetworkInformation', self.NetworkInformation,
        'Node', self.Node,
        'NodeFilter', self.NodeFilter,
        'NodeIterator', self.NodeIterator,
        'NodeList', self.NodeList,
        'Notation', self.Notation,
        'Notification', self.Notification,
        'NotifyAudioAvailableEvent', self.NotifyAudioAvailableEvent,
        'OfflineAudioCompletionEvent', self.OfflineAudioCompletionEvent,
        'OfflineAudioContext', self.OfflineAudioContext,
        'PannerNode', self.PannerNode,
        'ParentNode', self.ParentNode,
        'Performance', self.Performance,
        'PerformanceTiming', self.PerformanceTiming,
        'Plugin', self.Plugin,
        'PluginArray', self.PluginArray,
        'Position', self.Position,
        'PositionError', self.PositionError,
        'PositionOptions', self.PositionOptions,
        'PowerManager', self.PowerManager,
        'ProcessingInstruction', self.ProcessingInstruction,
        'ProgressEvent', self.ProgressEvent,
        'Promise', self.Promise,
        'PromiseResolver', self.PromiseResolver,
        'PushManager', self.PushManager,
        'Range', self.Range,
        'ScriptProcessorNode', self.ScriptProcessorNode,
        'Selection', self.Selection,
        'SettingsLock', self.SettingsLock,
        'SettingsManager', self.SettingsManager,
        'SharedWorker', self.SharedWorker,
        'StyleSheet', self.StyleSheet,
        'StyleSheetList', self.StyleSheetList,
        'SVGAElement', self.SVGAElement,
        'SVGAngle', self.SVGAngle,
        'SVGAnimateColorElement', self.SVGAnimateColorElement,
        'SVGAnimatedAngle', self.SVGAnimatedAngle,
        'SVGAnimatedBoolean', self.SVGAnimatedBoolean,
        'SVGAnimatedEnumeration', self.SVGAnimatedEnumeration,
        'SVGAnimatedInteger', self.SVGAnimatedInteger,
        'SVGAnimatedLengthList', self.SVGAnimatedLengthList,
        'SVGAnimatedNumber', self.SVGAnimatedNumber,
        'SVGAnimatedNumberList', self.SVGAnimatedNumberList,
        'SVGAnimatedPoints', self.SVGAnimatedPoints,
        'SVGAnimatedPreserveAspectRatio', self.SVGAnimatedPreserveAspectRatio,
        'SVGAnimatedRect', self.SVGAnimatedRect,
        'SVGAnimatedString', self.SVGAnimatedString,
        'SVGAnimatedTransformList', self.SVGAnimatedTransformList,
        'SVGAnimateElement', self.SVGAnimateElement,
        'SVGAnimateMotionElement', self.SVGAnimateMotionElement,
        'SVGAnimateTransformElement', self.SVGAnimateTransformElement,
        'SVGAnimationElement', self.SVGAnimationElement,
        'SVGCircleElement', self.SVGCircleElement,
        'SVGClipPathElement', self.SVGClipPathElement,
        'SVGCursorElement', self.SVGCursorElement,
        'SVGDefsElement', self.SVGDefsElement,
        'SVGDescElement', self.SVGDescElement,
        'SVGElement', self.SVGElement,
        'SVGEllipseElement', self.SVGEllipseElement,
        'SVGFilterElement', self.SVGFilterElement,
        'SVGFontElement', self.SVGFontElement,
        'SVGFontFaceElement', self.SVGFontFaceElement,
        'SVGFontFaceFormatElement', self.SVGFontFaceFormatElement,
        'SVGFontFaceNameElement', self.SVGFontFaceNameElement,
        'SVGFontFaceSrcElement', self.SVGFontFaceSrcElement,
        'SVGFontFaceUriElement', self.SVGFontFaceUriElement,
        'SVGForeignObjectElement', self.SVGForeignObjectElement,
        'SVGGElement', self.SVGGElement,
        'SVGGlyphElement', self.SVGGlyphElement,
        'SVGGradientElement', self.SVGGradientElement,
        'SVGHKernElement', self.SVGHKernElement,
        'SVGImageElement', self.SVGImageElement,
        'SVGLength', self.SVGLength,
        'SVGLengthList', self.SVGLengthList,
        'VGLinearGradientElement', self.VGLinearGradientElement,
        'SVGLineElement', self.SVGLineElement,
        'SVGMaskElement', self.SVGMaskElement,
        'SVGMatrix', self.SVGMatrix,
        'SVGMissingGlyphElement', self.SVGMissingGlyphElement,
        'SVGMPathElement', self.SVGMPathElement,
        'SVGNumber', self.SVGNumber,
        'SVGNumberList', self.SVGNumberList,
        'SVGPathElement', self.SVGPathElement,
        'SVGPatternElement', self.SVGPatternElement,
        'SVGPolygonElement', self.SVGPolygonElement,
        'SVGPolylineElement', self.SVGPolylineElement,
        'SVGPreserveAspectRatio', self.SVGPreserveAspectRatio,
        'SVGRadialGradientElement', self.SVGRadialGradientElement,
        'SVGRect', self.SVGRect,
        'SVGRectElement', self.SVGRectElement,
        'SVGScriptElement', self.SVGScriptElement,
        'SVGSetElement', self.SVGSetElement,
        'SVGStopElement', self.SVGStopElement,
        'SVGStringList', self.SVGStringList,
        'SVGStylable', self.SVGStylable,
        'SVGStyleElement', self.SVGStyleElement,
        'SVGSVGElement', self.SVGSVGElement,
        'SVGSwitchElement', self.SVGSwitchElement,
        'SVGSymbolElement', self.SVGSymbolElement,
        'SVGTests', self.SVGTests,
        'SVGTextElement', self.SVGTextElement,
        'SVGTextPositioningElement', self.SVGTextPositioningElement,
        'SVGTitleElement', self.SVGTitleElement,
        'SVGTransform', self.SVGTransform,
        'SVGTransformable', self.SVGTransformable,
        'SVGTransformList', self.SVGTransformList,
        'SVGTRefElement', self.SVGTRefElement,
        'SVGTSpanElement', self.SVGTSpanElement,
        'SVGUseElement', self.SVGUseElement,
        'SVGViewElement', self.SVGViewElement,
        'SVGVKernElement', self.SVGVKernElement,
        'TCPSocket', self.TCPSocket,
        'Telephony', self.Telephony,
        'TelephonyCall', self.TelephonyCall,
        'Text', self.Text,
        'TextDecoder', self.TextDecoder,
        'TextEncoder', self.TextEncoder,
        'TextMetrics', self.TextMetrics,
        'TimeRanges', self.TimeRanges,
        'Touch', self.Touch,
        'TouchEvent', self.TouchEvent,
        'TouchList', self.TouchList,
        'TransitionEvent', self.TransitionEvent,
        'TreeWalker', self.TreeWalker,
        'TypeInfo', self.TypeInfo,
        'UIEvent', self.UIEvent,
        'URL', self.URL,
        'URLUtils', self.URLUtils,
        'URLUtilsReadOnly', self.URLUtilsReadOnly,
        'UserDataHandler', self.UserDataHandler,
        'UserProximityEvent', self.UserProximityEvent,
        'ValidityState', self.ValidityState,
        'VideoPlaybackQuality', self.VideoPlaybackQuality,
        'WaveShaperNode', self.WaveShaperNode,
        'WebGLRenderingContext', self.WebGLRenderingContext,
        'WebSocket', self.WebSocket,
        'WheelEvent', self.WheelEvent,
        'WifiManager', self.WifiManager,
        'DOMWindow', self.Window,
        'Worker', self.Worker,
        'WorkerLocation', self.WorkerLocation,
        'XMLDocument', self.XMLDocument,
        'XMLHttpRequest', self.XMLHttpRequest,
        'XMLHttpRequestEventTarget', self.XMLHttpRequestEventTarget
        );
    } else if (TP.sys.getBrowser() === 'chrome') {

        //  Slots on Chrome 33

        TP.$$hostTypesTestValues = TP.hc(
        'AnalyserNode', self.AnalyserNode,
        'ApplicationCache', self.ApplicationCache,
        'Array', self.Array,
        'ArrayBuffer', self.ArrayBuffer,
        'Attr', self.Attr,
        //'Audio', self.Audio, mirror by HTMLAudioElement
        'AudioBuffer', self.AudioBuffer,
        'AudioBufferSourceNode', self.AudioBufferSourceNode,
        'AudioDestinationNode', self.AudioDestinationNode,
        'AudioListener', self.AudioListener,
        'AudioNode', self.AudioNode,
        'AudioParam', self.AudioParam,
        'AudioProcessingEvent', self.AudioProcessingEvent,
        'AutocompleteErrorEvent', self.AutocompleteErrorEvent,
        'BarProp', self.BarProp,
        'BeforeLoadEvent', self.BeforeLoadEvent,
        'BeforeUnloadEvent', self.BeforeUnloadEvent,
        'BiquadFilterNode', self.BiquadFilterNode,
        'Blob', self.Blob,
        'Boolean', self.Boolean,
        'CDATASection', self.CDATASection,
        'CSS', self.CSS,
        'CSSCharsetRule', self.CSSCharsetRule,
        'CSSFontFaceRule', self.CSSFontFaceRule,
        'CSSImportRule', self.CSSImportRule,
        'CSSKeyframeRule', self.CSSKeyframeRule,
        'CSSKeyframesRule', self.CSSKeyframesRule,
        'CSSMediaRule', self.CSSMediaRule,
        'CSSPageRule', self.CSSPageRule,
        'CSSPrimitiveValue', self.CSSPrimitiveValue,
        'CSSRule', self.CSSRule,
        'CSSRuleList', self.CSSRuleList,
        'CSSStyleDeclaration', self.CSSStyleDeclaration,
        'CSSStyleRule', self.CSSStyleRule,
        'CSSStyleSheet', self.CSSStyleSheet,
        'CSSValue', self.CSSValue,
        'CSSValueList', self.CSSValueList,
        'CSSVariablesMap', self.CSSVariablesMap,
        'CSSViewportRule', self.CSSViewportRule,
        'CanvasGradient', self.CanvasGradient,
        'CanvasPattern', self.CanvasPattern,
        'CanvasRenderingContext2D', self.CanvasRenderingContext2D,
        'ChannelMergerNode', self.ChannelMergerNode,
        'ChannelSplitterNode', self.ChannelSplitterNode,
        'CharacterData', self.CharacterData,
        'ClientRect', self.ClientRect,
        'ClientRectList', self.ClientRectList,
        'Clipboard', self.Clipboard,
        'CloseEvent', self.CloseEvent,
        'Comment', self.Comment,
        'CompositionEvent', self.CompositionEvent,
        'ConvolverNode', self.ConvolverNode,
        'Counter', self.Counter,
        'CustomEvent', self.CustomEvent,
        'DOMException', self.DOMException,
        'DOMImplementation', self.DOMImplementation,
        'DOMParser', self.DOMParser,
        'DOMSettableTokenList', self.DOMSettableTokenList,
        'DOMStringList', self.DOMStringList,
        'DOMStringMap', self.DOMStringMap,
        'DOMTokenList', self.DOMTokenList,
        'DataTransferItemList', self.DataTransferItemList,
        'DataView', self.DataView,
        'Date', self.Date,
        'DelayNode', self.DelayNode,
        'DeviceMotionEvent', self.DeviceMotionEvent,
        'DeviceOrientationEvent', self.DeviceOrientationEvent,
        //'Document', self.Document,
        'DocumentFragment', self.DocumentFragment,
        'DocumentType', self.DocumentType,
        'DynamicsCompressorNode', self.DynamicsCompressorNode,
        'Element', self.Element,
        'Entity', self.Entity,
        'Error', self.Error,
        'ErrorEvent', self.ErrorEvent,
        'EvalError', self.EvalError,
        'Event', self.Event,
        'EventSource', self.EventSource,
        'EventTarget', self.EventTarget,
        'File', self.File,
        'FileError', self.FileError,
        'FileList', self.FileList,
        'FileReader', self.FileReader,
        'Float32Array', self.Float32Array,
        'Float64Array', self.Float64Array,
        'FocusEvent', self.FocusEvent,
        'FormData', self.FormData,
        'Function', self.Function,
        'GainNode', self.GainNode,
        'HTMLAllCollection', self.HTMLAllCollection,
        'HTMLAnchorElement', self.HTMLAnchorElement,
        'HTMLAppletElement', self.HTMLAppletElement,
        'HTMLAreaElement', self.HTMLAreaElement,
        'HTMLAudioElement', self.HTMLAudioElement,
        'HTMLBRElement', self.HTMLBRElement,
        'HTMLBaseElement', self.HTMLBaseElement,
        'HTMLBodyElement', self.HTMLBodyElement,
        'HTMLButtonElement', self.HTMLButtonElement,
        'HTMLCanvasElement', self.HTMLCanvasElement,
        'HTMLCollection', self.HTMLCollection,
        'HTMLContentElement', self.HTMLContentElement,
        'HTMLDListElement', self.HTMLDListElement,
        'HTMLDataListElement', self.HTMLDataListElement,
        'HTMLDirectoryElement', self.HTMLDirectoryElement,
        'HTMLDivElement', self.HTMLDivElement,
        'HTMLDocument', self.HTMLDocument,
        'HTMLElement', self.HTMLElement,
        'HTMLEmbedElement', self.HTMLEmbedElement,
        'HTMLFieldSetElement', self.HTMLFieldSetElement,
        'HTMLFontElement', self.HTMLFontElement,
        'HTMLFormControlsCollection', self.HTMLFormControlsCollection,
        'HTMLFormElement', self.HTMLFormElement,
        'HTMLFrameElement', self.HTMLFrameElement,
        'HTMLFrameSetElement', self.HTMLFrameSetElement,
        'HTMLHRElement', self.HTMLHRElement,
        'HTMLHeadElement', self.HTMLHeadElement,
        'HTMLHeadingElement', self.HTMLHeadingElement,
        'HTMLHtmlElement', self.HTMLHtmlElement,
        'HTMLIFrameElement', self.HTMLIFrameElement,
        'HTMLImageElement', self.HTMLImageElement,
        'HTMLInputElement', self.HTMLInputElement,
        'HTMLKeygenElement', self.HTMLKeygenElement,
        'HTMLLIElement', self.HTMLLIElement,
        'HTMLLabelElement', self.HTMLLabelElement,
        'HTMLLegendElement', self.HTMLLegendElement,
        'HTMLLinkElement', self.HTMLLinkElement,
        'HTMLMapElement', self.HTMLMapElement,
        'HTMLMarqueeElement', self.HTMLMarqueeElement,
        'HTMLMediaElement', self.HTMLMediaElement,
        'HTMLMenuElement', self.HTMLMenuElement,
        'HTMLMetaElement', self.HTMLMetaElement,
        'HTMLMeterElement', self.HTMLMeterElement,
        'HTMLModElement', self.HTMLModElement,
        'HTMLOListElement', self.HTMLOListElement,
        'HTMLObjectElement', self.HTMLObjectElement,
        'HTMLOptGroupElement', self.HTMLOptGroupElement,
        'HTMLOptionElement', self.HTMLOptionElement,
        'HTMLOptionsCollection', self.HTMLOptionsCollection,
        'HTMLOutputElement', self.HTMLOutputElement,
        'HTMLParagraphElement', self.HTMLParagraphElement,
        'HTMLParamElement', self.HTMLParamElement,
        'HTMLPreElement', self.HTMLPreElement,
        'HTMLProgressElement', self.HTMLProgressElement,
        'HTMLQuoteElement', self.HTMLQuoteElement,
        'HTMLScriptElement', self.HTMLScriptElement,
        'HTMLSelectElement', self.HTMLSelectElement,
        'HTMLShadowElement', self.HTMLShadowElement,
        'HTMLSourceElement', self.HTMLSourceElement,
        'HTMLSpanElement', self.HTMLSpanElement,
        'HTMLStyleElement', self.HTMLStyleElement,
        'HTMLTableCaptionElement', self.HTMLTableCaptionElement,
        'HTMLTableCellElement', self.HTMLTableCellElement,
        'HTMLTableColElement', self.HTMLTableColElement,
        'HTMLTableElement', self.HTMLTableElement,
        'HTMLTableRowElement', self.HTMLTableRowElement,
        'HTMLTableSectionElement', self.HTMLTableSectionElement,
        'HTMLTemplateElement', self.HTMLTemplateElement,
        'HTMLTextAreaElement', self.HTMLTextAreaElement,
        'HTMLTitleElement', self.HTMLTitleElement,
        'HTMLTrackElement', self.HTMLTrackElement,
        'HTMLUListElement', self.HTMLUListElement,
        'HTMLUnknownElement', self.HTMLUnknownElement,
        'HTMLVideoElement', self.HTMLVideoElement,
        'HashChangeEvent', self.HashChangeEvent,
        'History', self.History,
        'IDBCursor', self.IDBCursor,
        'IDBCursorWithValue', self.IDBCursorWithValue,
        'IDBDatabase', self.IDBDatabase,
        'IDBFactory', self.IDBFactory,
        'IDBIndex', self.IDBIndex,
        'IDBKeyRange', self.IDBKeyRange,
        'IDBObjectStore', self.IDBObjectStore,
        'IDBOpenDBRequest', self.IDBOpenDBRequest,
        'IDBRequest', self.IDBRequest,
        'IDBTransaction', self.IDBTransaction,
        'IDBVersionChangeEvent', self.IDBVersionChangeEvent,
        'Iframe', self.Iframe,
        'IframeBase', self.IframeBase,
        'IframeProxy', self.IframeProxy,
        'IframeWindow', self.IframeWindow,
        //'Image', self.Image, mirrored by HTMLImageElement
        'ImageBitmap', self.ImageBitmap,
        'ImageData', self.ImageData,
        'InputMethodContext', self.InputMethodContext,
        'Int8Array', self.Int8Array,
        'Int16Array', self.Int16Array,
        'Int32Array', self.Int32Array,
        'Intl', self.Intl,
        'JSON', self.JSON,
        'KeyboardEvent', self.KeyboardEvent,
        'Location', self.Location,
        'Math', self.Math,
        'MediaController', self.MediaController,
        'MediaElementAudioSourceNode', self.MediaElementAudioSourceNode,
        'MediaError', self.MediaError,
        'MediaKeyError', self.MediaKeyError,
        'MediaKeyEvent', self.MediaKeyEvent,
        'MediaList', self.MediaList,
        'MediaSource', self.MediaSource,
        'MediaStreamAudioDestinationNode', self.MediaStreamAudioDestinationNode,
        'MediaStreamAudioSourceNode', self.MediaStreamAudioSourceNode,
        'MediaStreamEvent', self.MediaStreamEvent,
        'MediaStreamTrack', self.MediaStreamTrack,
        'MessageChannel', self.MessageChannel,
        'MessageEvent', self.MessageEvent,
        'MessagePort', self.MessagePort,
        'MimeType', self.MimeType,
        'MimeTypeArray', self.MimeTypeArray,
        'MouseEvent', self.MouseEvent,
        'MutationEvent', self.MutationEvent,
        'MutationObserver', self.MutationObserver,
        'MutationRecord', self.MutationRecord,
        'NamedNodeMap', self.NamedNodeMap,
        'Navigator', self.Navigator,
        'Node', self.Node,
        'NodeFilter', self.NodeFilter,
        'NodeIterator', self.NodeIterator,
        'NodeList', self.NodeList,
        'Notation', self.Notation,
        'Notification', self.Notification,
        'Number', self.Number,
        'Object', self.Object,
        'OfflineAudioCompletionEvent', self.OfflineAudioCompletionEvent,
        //'Option', self.Option, mirrored by HTMLOptionElement
        'OscillatorNode', self.OscillatorNode,
        'OverflowEvent', self.OverflowEvent,
        'PageTransitionEvent', self.PageTransitionEvent,
        'Performance', self.Performance,
        'PerformanceEntry', self.PerformanceEntry,
        'PerformanceMark', self.PerformanceMark,
        'PerformanceMeasure', self.PerformanceMeasure,
        'PerformanceNavigation', self.PerformanceNavigation,
        'PerformanceResourceTiming', self.PerformanceResourceTiming,
        'PerformanceTiming', self.PerformanceTiming,
        'PeriodicWave', self.PeriodicWave,
        'Plugin', self.Plugin,
        'PluginArray', self.PluginArray,
        'PopStateEvent', self.PopStateEvent,
        'ProcessingInstruction', self.ProcessingInstruction,
        'ProgressEvent', self.ProgressEvent,
        'Promise', self.Promise,
        'RGBColor', self.RGBColor,
        'RTCIceCandidate', self.RTCIceCandidate,
        'RTCSessionDescription', self.RTCSessionDescription,
        'Range', self.Range,
        'RangeError', self.RangeError,
        'Rect', self.Rect,
        'ReferenceError', self.ReferenceError,
        'RegExp', self.RegExp,
        'ShadowRoot', self.WebKitShadowRoot, // for now, Webkit-specific
        'SVGAElement', self.SVGAElement,
        'SVGAltGlyphDefElement', self.SVGAltGlyphDefElement,
        'SVGAltGlyphElement', self.SVGAltGlyphElement,
        'SVGAltGlyphItemElement', self.SVGAltGlyphItemElement,
        'SVGAngle', self.SVGAngle,
        'SVGAnimateColorElement', self.SVGAnimateColorElement,
        'SVGAnimateElement', self.SVGAnimateElement,
        'SVGAnimateMotionElement', self.SVGAnimateMotionElement,
        'SVGAnimateTransformElement', self.SVGAnimateTransformElement,
        'SVGAnimatedAngle', self.SVGAnimatedAngle,
        'SVGAnimatedBoolean', self.SVGAnimatedBoolean,
        'SVGAnimatedEnumeration', self.SVGAnimatedEnumeration,
        'SVGAnimatedInteger', self.SVGAnimatedInteger,
        'SVGAnimatedLength', self.SVGAnimatedLength,
        'SVGAnimatedLengthList', self.SVGAnimatedLengthList,
        'SVGAnimatedNumber', self.SVGAnimatedNumber,
        'SVGAnimatedNumberList', self.SVGAnimatedNumberList,
        'SVGAnimatedPreserveAspectRatio', self.SVGAnimatedPreserveAspectRatio,
        'SVGAnimatedRect', self.SVGAnimatedRect,
        'SVGAnimatedString', self.SVGAnimatedString,
        'SVGAnimatedTransformList', self.SVGAnimatedTransformList,
        'SVGAnimationElement', self.SVGAnimationElement,
        'SVGCircleElement', self.SVGCircleElement,
        'SVGClipPathElement', self.SVGClipPathElement,
        'SVGColor', self.SVGColor,
        'SVGComponentTransferFunctionElement', self.SVGComponentTransferFunctionElement,
        'SVGCursorElement', self.SVGCursorElement,
        'SVGDefsElement', self.SVGDefsElement,
        'SVGDescElement', self.SVGDescElement,
        'SVGDocument', self.SVGDocument,
        'SVGElement', self.SVGElement,
        'SVGElementInstance', self.SVGElementInstance,
        'SVGElementInstanceList', self.SVGElementInstanceList,
        'SVGEllipseElement', self.SVGEllipseElement,
        'SVGFEBlendElement', self.SVGFEBlendElement,
        'SVGFEColorMatrixElement', self.SVGFEColorMatrixElement,
        'SVGFEComponentTransferElement', self.SVGFEComponentTransferElement,
        'SVGFECompositeElement', self.SVGFECompositeElement,
        'SVGFEConvolveMatrixElement', self.SVGFEConvolveMatrixElement,
        'SVGFEDiffuseLightingElement', self.SVGFEDiffuseLightingElement,
        'SVGFEDisplacementMapElement', self.SVGFEDisplacementMapElement,
        'SVGFEDistantLightElement', self.SVGFEDistantLightElement,
        'SVGFEDropShadowElement', self.SVGFEDropShadowElement,
        'SVGFEFloodElement', self.SVGFEFloodElement,
        'SVGFEFuncAElement', self.SVGFEFuncAElement,
        'SVGFEFuncBElement', self.SVGFEFuncBElement,
        'SVGFEFuncGElement', self.SVGFEFuncGElement,
        'SVGFEFuncRElement', self.SVGFEFuncRElement,
        'SVGFEGaussianBlurElement', self.SVGFEGaussianBlurElement,
        'SVGFEImageElement', self.SVGFEImageElement,
        'SVGFEMergeElement', self.SVGFEMergeElement,
        'SVGFEMergeNodeElement', self.SVGFEMergeNodeElement,
        'SVGFEMorphologyElement', self.SVGFEMorphologyElement,
        'SVGFEOffsetElement', self.SVGFEOffsetElement,
        'SVGFEPointLightElement', self.SVGFEPointLightElement,
        'SVGFESpecularLightingElement', self.SVGFESpecularLightingElement,
        'SVGFESpotLightElement', self.SVGFESpotLightElement,
        'SVGFETileElement', self.SVGFETileElement,
        'SVGFETurbulenceElement', self.SVGFETurbulenceElement,
        'SVGFilterElement', self.SVGFilterElement,
        'SVGFontElement', self.SVGFontElement,
        'SVGFontFaceElement', self.SVGFontFaceElement,
        'SVGFontFaceFormatElement', self.SVGFontFaceFormatElement,
        'SVGFontFaceNameElement', self.SVGFontFaceNameElement,
        'SVGFontFaceSrcElement', self.SVGFontFaceSrcElement,
        'SVGFontFaceUriElement', self.SVGFontFaceUriElement,
        'SVGForeignObjectElement', self.SVGForeignObjectElement,
        'SVGGElement', self.SVGGElement,
        'SVGGeometryElement', self.SVGGeometryElement,
        'SVGGlyphElement', self.SVGGlyphElement,
        'SVGGlyphRefElement', self.SVGGlyphRefElement,
        'SVGGradientElement', self.SVGGradientElement,
        'SVGGraphicsElement', self.SVGGraphicsElement,
        'SVGHKernElement', self.SVGHKernElement,
        'SVGImageElement', self.SVGImageElement,
        'SVGLength', self.SVGLength,
        'SVGLengthList', self.SVGLengthList,
        'SVGLineElement', self.SVGLineElement,
        'SVGLinearGradientElement', self.SVGLinearGradientElement,
        'SVGMPathElement', self.SVGMPathElement,
        'SVGMarkerElement', self.SVGMarkerElement,
        'SVGMaskElement', self.SVGMaskElement,
        'SVGMatrix', self.SVGMatrix,
        'SVGMetadataElement', self.SVGMetadataElement,
        'SVGMissingGlyphElement', self.SVGMissingGlyphElement,
        'SVGNumber', self.SVGNumber,
        'SVGNumberList', self.SVGNumberList,
        'SVGPaint', self.SVGPaint,
        'SVGPathElement', self.SVGPathElement,
        'SVGPathSeg', self.SVGPathSeg,
        'SVGPathSegArcAbs', self.SVGPathSegArcAbs,
        'SVGPathSegArcRel', self.SVGPathSegArcRel,
        'SVGPathSegClosePath', self.SVGPathSegClosePath,
        'SVGPathSegCurvetoCubicAbs', self.SVGPathSegCurvetoCubicAbs,
        'SVGPathSegCurvetoCubicRel', self.SVGPathSegCurvetoCubicRel,
        'SVGPathSegCurvetoCubicSmoothAbs', self.SVGPathSegCurvetoCubicSmoothAbs,
        'SVGPathSegCurvetoCubicSmoothRel', self.SVGPathSegCurvetoCubicSmoothRel,
        'SVGPathSegCurvetoQuadraticAbs', self.SVGPathSegCurvetoQuadraticAbs,
        'SVGPathSegCurvetoQuadraticRel', self.SVGPathSegCurvetoQuadraticRel,
        'SVGPathSegCurvetoQuadraticSmoothAbs', self.SVGPathSegCurvetoQuadraticSmoothAbs,
        'SVGPathSegCurvetoQuadraticSmoothRel', self.SVGPathSegCurvetoQuadraticSmoothRel,
        'SVGPathSegLinetoAbs', self.SVGPathSegLinetoAbs,
        'SVGPathSegLinetoHorizontalAbs', self.SVGPathSegLinetoHorizontalAbs,
        'SVGPathSegLinetoHorizontalRel', self.SVGPathSegLinetoHorizontalRel,
        'SVGPathSegLinetoRel', self.SVGPathSegLinetoRel,
        'SVGPathSegLinetoVerticalAbs', self.SVGPathSegLinetoVerticalAbs,
        'SVGPathSegLinetoVerticalRel', self.SVGPathSegLinetoVerticalRel,
        'SVGPathSegList', self.SVGPathSegList,
        'SVGPathSegMovetoAbs', self.SVGPathSegMovetoAbs,
        'SVGPathSegMovetoRel', self.SVGPathSegMovetoRel,
        'SVGPatternElement', self.SVGPatternElement,
        'SVGPoint', self.SVGPoint,
        'SVGPointList', self.SVGPointList,
        'SVGPolygonElement', self.SVGPolygonElement,
        'SVGPolylineElement', self.SVGPolylineElement,
        'SVGPreserveAspectRatio', self.SVGPreserveAspectRatio,
        'SVGRadialGradientElement', self.SVGRadialGradientElement,
        'SVGRect', self.SVGRect,
        'SVGRectElement', self.SVGRectElement,
        'SVGRenderingIntent', self.SVGRenderingIntent,
        'SVGSVGElement', self.SVGSVGElement,
        'SVGScriptElement', self.SVGScriptElement,
        'SVGSetElement', self.SVGSetElement,
        'SVGStopElement', self.SVGStopElement,
        'SVGStringList', self.SVGStringList,
        'SVGStyleElement', self.SVGStyleElement,
        'SVGSwitchElement', self.SVGSwitchElement,
        'SVGSymbolElement', self.SVGSymbolElement,
        'SVGTSpanElement', self.SVGTSpanElement,
        'SVGTextContentElement', self.SVGTextContentElement,
        'SVGTextElement', self.SVGTextElement,
        'SVGTextPathElement', self.SVGTextPathElement,
        'SVGTextPositioningElement', self.SVGTextPositioningElement,
        'SVGTitleElement', self.SVGTitleElement,
        'SVGTransform', self.SVGTransform,
        'SVGTransformList', self.SVGTransformList,
        'SVGUnitTypes', self.SVGUnitTypes,
        'SVGUseElement', self.SVGUseElement,
        'SVGVKernElement', self.SVGVKernElement,
        'SVGViewElement', self.SVGViewElement,
        'SVGViewSpec', self.SVGViewSpec,
        'SVGZoomEvent', self.SVGZoomEvent,
        'Screen', self.Screen,
        'ScriptProcessorNode', self.ScriptProcessorNode,
        'SecurityPolicy', self.SecurityPolicy,
        'Selection', self.Selection,
        'SharedWorker', self.SharedWorker,
        'SpeechInputEvent', self.SpeechInputEvent,
        'SpeechSynthesisEvent', self.SpeechSynthesisEvent,
        'SpeechSynthesisUtterance', self.SpeechSynthesisUtterance,
        'Storage', self.Storage,
        'StorageEvent', self.StorageEvent,
        'String', self.String,
        'StyleSheet', self.StyleSheet,
        'StyleSheetList', self.StyleSheetList,
        'SyntaxError', self.SyntaxError,
        'Text', self.Text,
        'TextEvent', self.TextEvent,
        'TextMetrics', self.TextMetrics,
        'TextTrack', self.TextTrack,
        'TextTrackCue', self.TextTrackCue,
        'TextTrackCueList', self.TextTrackCueList,
        'TextTrackList', self.TextTrackList,
        'TimeRanges', self.TimeRanges,
        'ToolbarApi', self.ToolbarApi,
        'Touch', self.Touch,
        'TouchEvent', self.TouchEvent,
        'TouchList', self.TouchList,
        'TrackEvent', self.TrackEvent,
        'TransitionEvent', self.TransitionEvent,
        'TreeWalker', self.TreeWalker,
        'TypeError', self.TypeError,
        'UIEvent', self.UIEvent,
        'URIError', self.URIError,
        'URL', self.URL,
        'Uint8Array', self.Uint8Array,
        'Uint8ClampedArray', self.Uint8ClampedArray,
        'Uint16Array', self.Uint16Array,
        'Uint32Array', self.Uint32Array,
        'VTTCue', self.VTTCue,
        'ValidityState', self.ValidityState,
        'WaveShaperNode', self.WaveShaperNode,
        'WebGLActiveInfo', self.WebGLActiveInfo,
        'WebGLBuffer', self.WebGLBuffer,
        'WebGLContextEvent', self.WebGLContextEvent,
        'WebGLFramebuffer', self.WebGLFramebuffer,
        'WebGLProgram', self.WebGLProgram,
        'WebGLRenderbuffer', self.WebGLRenderbuffer,
        'WebGLRenderingContext', self.WebGLRenderingContext,
        'WebGLShader', self.WebGLShader,
        'WebGLShaderPrecisionFormat', self.WebGLShaderPrecisionFormat,
        'WebGLTexture', self.WebGLTexture,
        'WebGLUniformLocation', self.WebGLUniformLocation,
        'WebKitAnimationEvent', self.WebKitAnimationEvent,
        'WebKitCSSFilterRule', self.WebKitCSSFilterRule,
        'WebKitCSSFilterValue', self.WebKitCSSFilterValue,
        'WebKitCSSMatrix', self.WebKitCSSMatrix,
        'WebKitCSSMixFunctionValue', self.WebKitCSSMixFunctionValue,
        'WebKitCSSTransformValue', self.WebKitCSSTransformValue,
        'WebKitMediaSource', self.WebKitMediaSource,
        //'WebKitMutationObserver', self.WebKitMutationObserver, mirrored by
        //'MutationObserver' above
        'WebKitPoint', self.WebKitPoint,
        //'WebKitShadowRoot', self.WebKitShadowRoot, mirrored by 'ShadowRoot'
        //above
        'WebKitSourceBuffer', self.WebKitSourceBuffer,
        'WebKitSourceBufferList', self.WebKitSourceBufferList,
        //'WebKitTransitionEvent', self.WebKitTransitionEvent, mirrored by
        //'TransitionEvent' above
        'WebSocket', self.WebSocket,
        'WheelEvent', self.WheelEvent,
        'DOMWindow', self.Window,
        'Worker', self.Worker,
        'XMLDocument', self.XMLDocument,
        'XMLHttpRequest', self.XMLHttpRequest,
        'XMLHttpRequestProgressEvent', self.XMLHttpRequestProgressEvent,
        'XMLHttpRequestUpload', self.XMLHttpRequestUpload,
        'XMLSerializer', self.XMLSerializer,
        'XPathEvaluator', self.XPathEvaluator,
        'XPathExpression', self.XPathExpression,
        'XPathResult', self.XPathResult,
        'XSLTProcessor', self.XSLTProcessor
        );
    } else if (TP.sys.getBrowser() === 'safari') {

        //  Slots on Safari 7.0.1

        TP.$$hostTypesTestValues = TP.hc(
        'Infinity', self.Infinity,
        'AnalyserNode', self.AnalyserNode,
        'Array', self.Array,
        'ArrayBuffer', self.ArrayBuffer,
        'ArrayBufferView', self.ArrayBufferView,
        'Attr', self.Attr,
        'Audio', self.Audio,
        'AudioBuffer', self.AudioBuffer,
        'AudioBufferSourceNode', self.AudioBufferSourceNode,
        'AudioDestinationNode', self.AudioDestinationNode,
        'AudioListener', self.AudioListener,
        'AudioNode', self.AudioNode,
        'AudioParam', self.AudioParam,
        'AudioProcessingEvent', self.AudioProcessingEvent,
        'BarProp', self.BarProp,
        'BeforeLoadEvent', self.BeforeLoadEvent,
        'BiquadFilterNode', self.BiquadFilterNode,
        'Blob', self.Blob,
        'Boolean', self.Boolean,
        'CDATASection', self.CDATASection,
        'CSSCharsetRule', self.CSSCharsetRule,
        'CSSFontFaceRule', self.CSSFontFaceRule,
        'CSSImportRule', self.CSSImportRule,
        'CSSMediaRule', self.CSSMediaRule,
        'CSSPageRule', self.CSSPageRule,
        'CSSPrimitiveValue', self.CSSPrimitiveValue,
        'CSSRule', self.CSSRule,
        'CSSRuleList', self.CSSRuleList,
        'CSSStyleDeclaration', self.CSSStyleDeclaration,
        'CSSStyleRule', self.CSSStyleRule,
        'CSSStyleSheet', self.CSSStyleSheet,
        'CSSValue', self.CSSValue,
        'CSSValueList', self.CSSValueList,
        'CanvasGradient', self.CanvasGradient,
        'CanvasPattern', self.CanvasPattern,
        'CanvasRenderingContext2D', self.CanvasRenderingContext2D,
        'ChannelMergerNode', self.ChannelMergerNode,
        'ChannelSplitterNode', self.ChannelSplitterNode,
        'CharacterData', self.CharacterData,
        'ClientRect', self.ClientRect,
        'ClientRectList', self.ClientRectList,
        'Clipboard', self.Clipboard,
        'CloseEvent', self.CloseEvent,
        'Comment', self.Comment,
        'CompositionEvent', self.CompositionEvent,
        'ConvolverNode', self.ConvolverNode,
        'Counter', self.Counter,
        'CustomEvent', self.CustomEvent,
        'DOMException', self.DOMException,
        'DOMImplementation', self.DOMImplementation,
        'DOMParser', self.DOMParser,
        'DOMSettableTokenList', self.DOMSettableTokenList,
        'DOMStringList', self.DOMStringList,
        'DOMStringMap', self.DOMStringMap,
        'DOMTokenList', self.DOMTokenList,
        'DataView', self.DataView,
        'Date', self.Date,
        'DelayNode', self.DelayNode,
        //'Document', self.Document,
        'DocumentFragment', self.DocumentFragment,
        'DocumentType', self.DocumentType,
        'DynamicsCompressorNode', self.DynamicsCompressorNode,
        'Element', self.Element,
        'Entity', self.Entity,
        'EntityReference', self.EntityReference,
        'Error', self.Error,
        'ErrorEvent', self.ErrorEvent,
        'EvalError', self.EvalError,
        'Event', self.Event,
        'EventException', self.EventException,
        'EventSource', self.EventSource,
        'File', self.File,
        'FileError', self.FileError,
        'FileList', self.FileList,
        'FileReader', self.FileReader,
        'Float32Array', self.Float32Array,
        'Float64Array', self.Float64Array,
        'FocusEvent', self.FocusEvent,
        'FormData', self.FormData,
        'Function', self.Function,
        'GainNode', self.GainNode,
        'HTMLAllCollection', self.HTMLAllCollection,
        'HTMLAnchorElement', self.HTMLAnchorElement,
        'HTMLAppletElement', self.HTMLAppletElement,
        'HTMLAreaElement', self.HTMLAreaElement,
        'HTMLAudioElement', self.HTMLAudioElement,
        'HTMLBRElement', self.HTMLBRElement,
        'HTMLBaseElement', self.HTMLBaseElement,
        'HTMLBaseFontElement', self.HTMLBaseFontElement,
        'HTMLBodyElement', self.HTMLBodyElement,
        'HTMLButtonElement', self.HTMLButtonElement,
        'HTMLCanvasElement', self.HTMLCanvasElement,
        'HTMLCollection', self.HTMLCollection,
        'HTMLDListElement', self.HTMLDListElement,
        'HTMLDirectoryElement', self.HTMLDirectoryElement,
        'HTMLDivElement', self.HTMLDivElement,
        'HTMLDocument', self.HTMLDocument,
        'HTMLElement', self.HTMLElement,
        'HTMLEmbedElement', self.HTMLEmbedElement,
        'HTMLFieldSetElement', self.HTMLFieldSetElement,
        'HTMLFontElement', self.HTMLFontElement,
        'HTMLFormControlsCollection', self.HTMLFormControlsCollection,
        'HTMLFormElement', self.HTMLFormElement,
        'HTMLFrameElement', self.HTMLFrameElement,
        'HTMLFrameSetElement', self.HTMLFrameSetElement,
        'HTMLHRElement', self.HTMLHRElement,
        'HTMLHeadElement', self.HTMLHeadElement,
        'HTMLHeadingElement', self.HTMLHeadingElement,
        'HTMLHtmlElement', self.HTMLHtmlElement,
        'HTMLIFrameElement', self.HTMLIFrameElement,
        'HTMLImageElement', self.HTMLImageElement,
        'HTMLInputElement', self.HTMLInputElement,
        'HTMLKeygenElement', self.HTMLKeygenElement,
        'HTMLLIElement', self.HTMLLIElement,
        'HTMLLabelElement', self.HTMLLabelElement,
        'HTMLLegendElement', self.HTMLLegendElement,
        'HTMLLinkElement', self.HTMLLinkElement,
        'HTMLMapElement', self.HTMLMapElement,
        'HTMLMarqueeElement', self.HTMLMarqueeElement,
        'HTMLMediaElement', self.HTMLMediaElement,
        'HTMLMenuElement', self.HTMLMenuElement,
        'HTMLMetaElement', self.HTMLMetaElement,
        'HTMLMeterElement', self.HTMLMeterElement,
        'HTMLModElement', self.HTMLModElement,
        'HTMLOListElement', self.HTMLOListElement,
        'HTMLObjectElement', self.HTMLObjectElement,
        'HTMLOptGroupElement', self.HTMLOptGroupElement,
        'HTMLOptionElement', self.HTMLOptionElement,
        'HTMLOptionsCollection', self.HTMLOptionsCollection,
        'HTMLOutputElement', self.HTMLOutputElement,
        'HTMLParagraphElement', self.HTMLParagraphElement,
        'HTMLParamElement', self.HTMLParamElement,
        'HTMLPreElement', self.HTMLPreElement,
        'HTMLProgressElement', self.HTMLProgressElement,
        'HTMLQuoteElement', self.HTMLQuoteElement,
        'HTMLScriptElement', self.HTMLScriptElement,
        'HTMLSelectElement', self.HTMLSelectElement,
        'HTMLSourceElement', self.HTMLSourceElement,
        'HTMLSpanElement', self.HTMLSpanElement,
        'HTMLStyleElement', self.HTMLStyleElement,
        'HTMLTableCaptionElement', self.HTMLTableCaptionElement,
        'HTMLTableCellElement', self.HTMLTableCellElement,
        'HTMLTableColElement', self.HTMLTableColElement,
        'HTMLTableElement', self.HTMLTableElement,
        'HTMLTableRowElement', self.HTMLTableRowElement,
        'HTMLTableSectionElement', self.HTMLTableSectionElement,
        'HTMLTextAreaElement', self.HTMLTextAreaElement,
        'HTMLTitleElement', self.HTMLTitleElement,
        'HTMLTrackElement', self.HTMLTrackElement,
        'HTMLUListElement', self.HTMLUListElement,
        'HTMLUnknownElement', self.HTMLUnknownElement,
        'HTMLVideoElement', self.HTMLVideoElement,
        'HashChangeEvent', self.HashChangeEvent,
        'History', self.History,
        'Image', self.Image,
        'ImageData', self.ImageData,
        'Int8Array', self.Int8Array,
        'Int16Array', self.Int16Array,
        'Int32Array', self.Int32Array,
        'JSON', self.JSON,
        'KeyboardEvent', self.KeyboardEvent,
        'Location', self.Location,
        'Math', self.Math,
        'MediaController', self.MediaController,
        'MediaElementAudioSourceNode', self.MediaElementAudioSourceNode,
        'MediaError', self.MediaError,
        'MediaKeyEvent', self.MediaKeyEvent,
        'MediaKeyNeededEvent', self.MediaKeyNeededEvent,
        'MediaList', self.MediaList,
        'MessageChannel', self.MessageChannel,
        'MessageEvent', self.MessageEvent,
        'MessagePort', self.MessagePort,
        'MimeType', self.MimeType,
        'MimeTypeArray', self.MimeTypeArray,
        'MouseEvent', self.MouseEvent,
        'MutationEvent', self.MutationEvent,
        'MutationObserver', self.MutationObserver,
        'MutationRecord', self.MutationRecord,
        'NamedNodeMap', self.NamedNodeMap,
        'Navigator', self.Navigator,
        'Node', self.Node,
        'NodeFilter', self.NodeFilter,
        'NodeIterator', self.NodeIterator,
        'NodeList', self.NodeList,
        'Notation', self.Notation,
        'Notification', self.Notification,
        'Number', self.Number,
        'Object', self.Object,
        'OfflineAudioCompletionEvent', self.OfflineAudioCompletionEvent,
        'Option', self.Option,
        'OscillatorNode', self.OscillatorNode,
        'OverflowEvent', self.OverflowEvent,
        'PageTransitionEvent', self.PageTransitionEvent,
        'Path', self.Path,
        'Plugin', self.Plugin,
        'PluginArray', self.PluginArray,
        'PopStateEvent', self.PopStateEvent,
        'ProcessingInstruction', self.ProcessingInstruction,
        'ProgressEvent', self.ProgressEvent,
        'RGBColor', self.RGBColor,
        'Range', self.Range,
        'RangeError', self.RangeError,
        'RangeException', self.RangeException,
        'Rect', self.Rect,
        'ReferenceError', self.ReferenceError,
        'RegExp', self.RegExp,
        'SQLException', self.SQLException,
        'SVGAElement', self.SVGAElement,
        'SVGAltGlyphDefElement', self.SVGAltGlyphDefElement,
        'SVGAltGlyphElement', self.SVGAltGlyphElement,
        'SVGAltGlyphItemElement', self.SVGAltGlyphItemElement,
        'SVGAngle', self.SVGAngle,
        'SVGAnimateColorElement', self.SVGAnimateColorElement,
        'SVGAnimateElement', self.SVGAnimateElement,
        'SVGAnimateMotionElement', self.SVGAnimateMotionElement,
        'SVGAnimateTransformElement', self.SVGAnimateTransformElement,
        'SVGAnimatedAngle', self.SVGAnimatedAngle,
        'SVGAnimatedBoolean', self.SVGAnimatedBoolean,
        'SVGAnimatedEnumeration', self.SVGAnimatedEnumeration,
        'SVGAnimatedInteger', self.SVGAnimatedInteger,
        'SVGAnimatedLength', self.SVGAnimatedLength,
        'SVGAnimatedLengthList', self.SVGAnimatedLengthList,
        'SVGAnimatedNumber', self.SVGAnimatedNumber,
        'SVGAnimatedNumberList', self.SVGAnimatedNumberList,
        'SVGAnimatedPreserveAspectRatio', self.SVGAnimatedPreserveAspectRatio,
        'SVGAnimatedRect', self.SVGAnimatedRect,
        'SVGAnimatedString', self.SVGAnimatedString,
        'SVGAnimatedTransformList', self.SVGAnimatedTransformList,
        'SVGCircleElement', self.SVGCircleElement,
        'SVGClipPathElement', self.SVGClipPathElement,
        'SVGColor', self.SVGColor,
        'SVGComponentTransferFunctionElement', self.SVGComponentTransferFunctionElement,
        'SVGCursorElement', self.SVGCursorElement,
        'SVGDefsElement', self.SVGDefsElement,
        'SVGDescElement', self.SVGDescElement,
        'SVGDocument', self.SVGDocument,
        'SVGElement', self.SVGElement,
        'SVGElementInstance', self.SVGElementInstance,
        'SVGElementInstanceList', self.SVGElementInstanceList,
        'SVGEllipseElement', self.SVGEllipseElement,
        'SVGException', self.SVGException,
        'SVGFEBlendElement', self.SVGFEBlendElement,
        'SVGFEColorMatrixElement', self.SVGFEColorMatrixElement,
        'SVGFEComponentTransferElement', self.SVGFEComponentTransferElement,
        'SVGFECompositeElement', self.SVGFECompositeElement,
        'SVGFEConvolveMatrixElement', self.SVGFEConvolveMatrixElement,
        'SVGFEDiffuseLightingElement', self.SVGFEDiffuseLightingElement,
        'SVGFEDisplacementMapElement', self.SVGFEDisplacementMapElement,
        'SVGFEDistantLightElement', self.SVGFEDistantLightElement,
        'SVGFEDropShadowElement', self.SVGFEDropShadowElement,
        'SVGFEFloodElement', self.SVGFEFloodElement,
        'SVGFEFuncAElement', self.SVGFEFuncAElement,
        'SVGFEFuncBElement', self.SVGFEFuncBElement,
        'SVGFEFuncGElement', self.SVGFEFuncGElement,
        'SVGFEFuncRElement', self.SVGFEFuncRElement,
        'SVGFEGaussianBlurElement', self.SVGFEGaussianBlurElement,
        'SVGFEImageElement', self.SVGFEImageElement,
        'SVGFEMergeElement', self.SVGFEMergeElement,
        'SVGFEMergeNodeElement', self.SVGFEMergeNodeElement,
        'SVGFEMorphologyElement', self.SVGFEMorphologyElement,
        'SVGFEOffsetElement', self.SVGFEOffsetElement,
        'SVGFEPointLightElement', self.SVGFEPointLightElement,
        'SVGFESpecularLightingElement', self.SVGFESpecularLightingElement,
        'SVGFESpotLightElement', self.SVGFESpotLightElement,
        'SVGFETileElement', self.SVGFETileElement,
        'SVGFETurbulenceElement', self.SVGFETurbulenceElement,
        'SVGFilterElement', self.SVGFilterElement,
        'SVGFontElement', self.SVGFontElement,
        'SVGFontFaceElement', self.SVGFontFaceElement,
        'SVGFontFaceFormatElement', self.SVGFontFaceFormatElement,
        'SVGFontFaceNameElement', self.SVGFontFaceNameElement,
        'SVGFontFaceSrcElement', self.SVGFontFaceSrcElement,
        'SVGFontFaceUriElement', self.SVGFontFaceUriElement,
        'SVGForeignObjectElement', self.SVGForeignObjectElement,
        'SVGGElement', self.SVGGElement,
        'SVGGlyphElement', self.SVGGlyphElement,
        'SVGGlyphRefElement', self.SVGGlyphRefElement,
        'SVGGradientElement', self.SVGGradientElement,
        'SVGHKernElement', self.SVGHKernElement,
        'SVGImageElement', self.SVGImageElement,
        'SVGLength', self.SVGLength,
        'SVGLengthList', self.SVGLengthList,
        'SVGLineElement', self.SVGLineElement,
        'SVGLinearGradientElement', self.SVGLinearGradientElement,
        'SVGMPathElement', self.SVGMPathElement,
        'SVGMarkerElement', self.SVGMarkerElement,
        'SVGMaskElement', self.SVGMaskElement,
        'SVGMatrix', self.SVGMatrix,
        'SVGMetadataElement', self.SVGMetadataElement,
        'SVGMissingGlyphElement', self.SVGMissingGlyphElement,
        'SVGNumber', self.SVGNumber,
        'SVGNumberList', self.SVGNumberList,
        'SVGPaint', self.SVGPaint,
        'SVGPathElement', self.SVGPathElement,
        'SVGPathSeg', self.SVGPathSeg,
        'SVGPathSegArcAbs', self.SVGPathSegArcAbs,
        'SVGPathSegArcRel', self.SVGPathSegArcRel,
        'SVGPathSegClosePath', self.SVGPathSegClosePath,
        'SVGPathSegCurvetoCubicAbs', self.SVGPathSegCurvetoCubicAbs,
        'SVGPathSegCurvetoCubicRel', self.SVGPathSegCurvetoCubicRel,
        'SVGPathSegCurvetoCubicSmoothAbs', self.SVGPathSegCurvetoCubicSmoothAbs,
        'SVGPathSegCurvetoCubicSmoothRel', self.SVGPathSegCurvetoCubicSmoothRel,
        'SVGPathSegCurvetoQuadraticAbs', self.SVGPathSegCurvetoQuadraticAbs,
        'SVGPathSegCurvetoQuadraticRel', self.SVGPathSegCurvetoQuadraticRel,
        'SVGPathSegCurvetoQuadraticSmoothAbs', self.SVGPathSegCurvetoQuadraticSmoothAbs,
        'SVGPathSegCurvetoQuadraticSmoothRel', self.SVGPathSegCurvetoQuadraticSmoothRel,
        'SVGPathSegLinetoAbs', self.SVGPathSegLinetoAbs,
        'SVGPathSegLinetoHorizontalAbs', self.SVGPathSegLinetoHorizontalAbs,
        'SVGPathSegLinetoHorizontalRel', self.SVGPathSegLinetoHorizontalRel,
        'SVGPathSegLinetoRel', self.SVGPathSegLinetoRel,
        'SVGPathSegLinetoVerticalAbs', self.SVGPathSegLinetoVerticalAbs,
        'SVGPathSegLinetoVerticalRel', self.SVGPathSegLinetoVerticalRel,
        'SVGPathSegList', self.SVGPathSegList,
        'SVGPathSegMovetoAbs', self.SVGPathSegMovetoAbs,
        'SVGPathSegMovetoRel', self.SVGPathSegMovetoRel,
        'SVGPatternElement', self.SVGPatternElement,
        'SVGPoint', self.SVGPoint,
        'SVGPointList', self.SVGPointList,
        'SVGPolygonElement', self.SVGPolygonElement,
        'SVGPolylineElement', self.SVGPolylineElement,
        'SVGPreserveAspectRatio', self.SVGPreserveAspectRatio,
        'SVGRadialGradientElement', self.SVGRadialGradientElement,
        'SVGRect', self.SVGRect,
        'SVGRectElement', self.SVGRectElement,
        'SVGRenderingIntent', self.SVGRenderingIntent,
        'SVGSVGElement', self.SVGSVGElement,
        'SVGScriptElement', self.SVGScriptElement,
        'SVGSetElement', self.SVGSetElement,
        'SVGStopElement', self.SVGStopElement,
        'SVGStringList', self.SVGStringList,
        'SVGStyleElement', self.SVGStyleElement,
        'SVGSwitchElement', self.SVGSwitchElement,
        'SVGSymbolElement', self.SVGSymbolElement,
        'SVGTRefElement', self.SVGTRefElement,
        'SVGTSpanElement', self.SVGTSpanElement,
        'SVGTextContentElement', self.SVGTextContentElement,
        'SVGTextElement', self.SVGTextElement,
        'SVGTextPathElement', self.SVGTextPathElement,
        'SVGTextPositioningElement', self.SVGTextPositioningElement,
        'SVGTitleElement', self.SVGTitleElement,
        'SVGTransform', self.SVGTransform,
        'SVGTransformList', self.SVGTransformList,
        'SVGUnitTypes', self.SVGUnitTypes,
        'SVGUseElement', self.SVGUseElement,
        'SVGVKernElement', self.SVGVKernElement,
        'SVGViewElement', self.SVGViewElement,
        'SVGViewSpec', self.SVGViewSpec,
        'SVGZoomAndPan', self.SVGZoomAndPan,
        'SVGZoomEvent', self.SVGZoomEvent,
        'Screen', self.Screen,
        'ScriptProcessorNode', self.ScriptProcessorNode,
        'Selection', self.Selection,
        'SpeechSynthesisEvent', self.SpeechSynthesisEvent,
        'SpeechSynthesisUtterance', self.SpeechSynthesisUtterance,
        'Storage', self.Storage,
        'StorageEvent', self.StorageEvent,
        'String', self.String,
        'StyleSheet', self.StyleSheet,
        'StyleSheetList', self.StyleSheetList,
        'SyntaxError', self.SyntaxError,
        'Text', self.Text,
        'TextEvent', self.TextEvent,
        'TextMetrics', self.TextMetrics,
        'TextTrack', self.TextTrack,
        'TextTrackCue', self.TextTrackCue,
        'TextTrackCueList', self.TextTrackCueList,
        'TextTrackList', self.TextTrackList,
        'TimeRanges', self.TimeRanges,
        'TrackEvent', self.TrackEvent,
        'TransitionEvent', self.TransitionEvent,
        'TreeWalker', self.TreeWalker,
        'TypeError', self.TypeError,
        'UIEvent', self.UIEvent,
        'URIError', self.URIError,
        'URL', self.URL,
        'Uint8Array', self.Uint8Array,
        'Uint8ClampedArray', self.Uint8ClampedArray,
        'Uint16Array', self.Uint16Array,
        'Uint32Array', self.Uint32Array,
        'WaveShaperNode', self.WaveShaperNode,
        'WaveTable', self.WaveTable,
        'WebGLActiveInfo', self.WebGLActiveInfo,
        'WebGLBuffer', self.WebGLBuffer,
        'WebGLContextEvent', self.WebGLContextEvent,
        'WebGLFramebuffer', self.WebGLFramebuffer,
        'WebGLProgram', self.WebGLProgram,
        'WebGLRenderbuffer', self.WebGLRenderbuffer,
        'WebGLRenderingContext', self.WebGLRenderingContext,
        'WebGLShader', self.WebGLShader,
        'WebGLShaderPrecisionFormat', self.WebGLShaderPrecisionFormat,
        'WebGLTexture', self.WebGLTexture,
        'WebGLUniformLocation', self.WebGLUniformLocation,
        'WebKitAnimationEvent', self.WebKitAnimationEvent,
        'WebKitCSSFilterValue', self.WebKitCSSFilterValue,
        'WebKitCSSKeyframeRule', self.WebKitCSSKeyframeRule,
        'WebKitCSSKeyframesRule', self.WebKitCSSKeyframesRule,
        'WebKitCSSMatrix', self.WebKitCSSMatrix,
        'WebKitCSSRegionRule', self.WebKitCSSRegionRule,
        'WebKitCSSTransformValue', self.WebKitCSSTransformValue,
        'WebKitMediaKeyError', self.WebKitMediaKeyError,
        'WebKitMediaKeyMessageEvent', self.WebKitMediaKeyMessageEvent,
        'WebKitMediaKeySession', self.WebKitMediaKeySession,
        'WebKitMediaKeys', self.WebKitMediaKeys,
        'WebKitMutationObserver', self.WebKitMutationObserver,
        'WebKitPoint', self.WebKitPoint,
        'WebKitTransitionEvent', self.WebKitTransitionEvent,
        'WebSocket', self.WebSocket,
        'WheelEvent', self.WheelEvent,
        'DOMWindow', self.Window,
        'Worker', self.Worker,
        'XMLDocument', self.XMLDocument,
        'XMLHttpRequest', self.XMLHttpRequest,
        'XMLHttpRequestException', self.XMLHttpRequestException,
        'XMLHttpRequestProgressEvent', self.XMLHttpRequestProgressEvent,
        'XMLHttpRequestUpload', self.XMLHttpRequestUpload,
        'XMLSerializer', self.XMLSerializer,
        'XPathEvaluator', self.XPathEvaluator,
        'XPathException', self.XPathException,
        'XPathExpression', self.XPathExpression,
        'XPathResult', self.XPathResult,
        'XSLTProcessor', self.XSLTProcessor
        );
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
