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

    var topLevelWindow,

        undefVal,
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
        nativeFuncVal,

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

        newXMLElement,

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

        objValues;

    if (TP.isValid(TP.$$commonObjectValues)) {
        return;
    }

    topLevelWindow = TP.sys.getLaunchWindow();

    //  undefined
    undefVal = undefined;
    //  null
    nullVal = null;

    //  Instance of Array
    arrayVal = [1, 2, 3];
    //  Instance of Boolean
    booleanVal = true;
    //  Instance of Date
    dateVal = new Date('Aug 23 1995');

    //  NB: Do *not* reformat this in any way. Some of the representation tests
    //  expect to see this in *exactly* this format.
    //  Instance of Function
    /* eslint-disable brace-style,max-statements-per-line */
    functionVal = function() {return 'fluffy'; };
    /* eslint-enable brace-style,max-statements-per-line */

    //  invalid Date
    invalidDateVal = new Date('fluffy');
    //  NaN
    nanVal = NaN;
    //  Instance of Number
    numberVal = 42;
    //  Instance of Object
    objectVal = {
    };
    objectVal.foo = 'bar';
    //  Instance of RegExp
    regexpVal = /foo/g;
    //  Instance of String
    stringVal = 'bar';

    //  Native Type
    nativeTypeVal = Array;
    //  Native Function
    nativeFuncVal = Array.prototype.slice;

    //  Window
    windowVal = topLevelWindow;
    //  iframe Window
    iframeWindowVal = topLevelWindow.UIROOT;

    //  HTML Document / HTML Element
    if (TP.isHTMLDocument(topLevelWindow.document)) {
        htmlDocumentVal = topLevelWindow.document;
        htmlElementVal = htmlDocumentVal.body;
    } else {
        htmlDocumentVal =
            topLevelWindow.document.implementation.createHTMLDocument('');
        htmlElementVal = htmlDocumentVal.createElement('body');
        htmlElementVal.setAttribute('id', 'body');
        htmlElementVal.innerHTML = 'hello world';
    }

    //  XML Document
    xmlDocumentVal = TP.constructDocument();
    xmlDocumentVal.appendChild(TP.elem('<foo bar="baz" tibet:nocompile="true">Hi there</foo>'));
    xmlDocumentVal.documentElement.appendChild(TP.elem('<boo><goo/></boo>'));
    xmlDocumentVal.documentElement.appendChild(TP.elem('<moo/>'));
    //  assign a global ID for use in testing
    TP.id(xmlDocumentVal, true);

    //  XML Element
    xmlElementVal = xmlDocumentVal.createElement('foo');
    TP.elementSetAttribute(xmlElementVal, 'tibet:nocompile', 'true', true);
    xmlElementVal.appendChild(xmlDocumentVal.createTextNode('bar'));
    //  assign a global ID for use in testing
    TP.id(xmlElementVal, true);

    //  XML Attribute
    attrNodeVal = xmlDocumentVal.createAttribute('foo');
    attrNodeVal.nodeValue = 'bar';

    //  XML CDATA Node
    cdataSectionNodeVal = xmlDocumentVal.createCDATASection('foo');

    //  XML Comment Node
    commentNodeVal = xmlDocumentVal.createComment('foo');

    //  XML DocumentFragment Node
    documentFragmentNodeVal = xmlDocumentVal.createDocumentFragment();

    newXMLElement = xmlDocumentVal.createElement('foo');
    TP.elementSetAttribute(newXMLElement, 'tibet:nocompile', 'true', true);
    documentFragmentNodeVal.appendChild(newXMLElement);

    newXMLElement = xmlDocumentVal.createElement('bar');
    TP.elementSetAttribute(newXMLElement, 'tibet:nocompile', 'true', true);
    documentFragmentNodeVal.appendChild(newXMLElement);

    //  XML PI Node
    piNodeVal = xmlDocumentVal.createProcessingInstruction('foo', 'bar');

    //  XML Text Node
    textNodeVal = xmlDocumentVal.createTextNode('foo');

    //  XML NodeList
    nodeListVal = xmlDocumentVal.documentElement.childNodes;

    //  XML NamedNodeMap
    namedNodeMapVal = xmlDocumentVal.documentElement.attributes;

    //  Style sheet
    stylesheetVal = topLevelWindow.document.styleSheets[0];
    //  Style rule
    styleRuleVal = TP.styleSheetGetStyleRules(stylesheetVal, false)[0];
    //  Style declaration
    styleDeclVal = styleRuleVal.style;

    //  Error
    errorVal = new Error('There was an error');

    //  Event
    eventVal = TP.documentConstructEvent(
                    TP.sys.uidoc(true), TP.ac('type', 'mouseover'));

    //  XHR
    xhrVal = new XMLHttpRequest();

    //  TIBET Type
    tibetTypeVal = TP.sys.getTypeByName('TP.dom.Node');

    //  Instance of TP.lang.Object
    tibetObjectVal = TP.lang.Object.construct();
    tibetObjectVal.defineAttribute('foo');
    tibetObjectVal.set('foo', 'bar');

    //  Instance of TP.core.Hash
    tibetHashVal = TP.core.Hash.construct();
    tibetHashVal.atPut('foo', 'bar');

    //  Instance of TP.sig.Signal
    tibetSignalVal = TP.sig.Signal.construct(TP.hc('foo', 'bar'));
    //  Need to do this so that the signal has a real signal name for testing
    //  down below
    tibetSignalVal.getSignalName();

    //  Instance of TP.sig.Exception
    tibetExceptionVal = TP.sig.Exception.construct(
        TP.hc('object', errorVal,
                 'message', 'There really was an Error'));
    //  Need to do this so that the exception has a real signal name for testing
    //  down below
    tibetExceptionVal.getSignalName();

    //  Instance of TP.core.Window
    tibetWindowVal = TP.core.Window.construct(windowVal);
    //  Instance of TP.dom.HTMLDocumentNode
    tibetHTMLDocVal = TP.core.Document.construct(htmlDocumentVal);
    //  Instance of TP.dom.HTMLElementNode
    tibetHTMLElemVal = TP.dom.HTMLElementNode.construct(htmlElementVal);

    //  Instance of TP.dom.XMLDocumentNode
    tibetXMLDocVal = TP.core.Document.construct(xmlDocumentVal);
    //  Instance of TP.dom.XMLElementNode
    tibetXMLElemVal = TP.dom.XMLElementNode.construct(xmlElementVal);

    //  Instance of TP.dom.DocumentFragmentNode
    tibetDocFragNodeVal = TP.dom.DocumentFragmentNode.construct(
        documentFragmentNodeVal);
    //  Instance of TP.dom.AttributeNode
    tibetAttributeNodeVal = TP.dom.AttributeNode.construct(attrNodeVal);
    //  Instance of TP.dom.TextNode
    tibetTextNodeVal = TP.dom.TextNode.construct(textNodeVal);
    //  Instance of TP.dom.CDATASectionNode
    tibetCDATASectionNodeVal = TP.dom.CDATASectionNode.construct(
        cdataSectionNodeVal);
    //  Instance of TP.dom.ProcessingInstructionNode
    tibetPINodeVal = TP.dom.ProcessingInstructionNode.construct(piNodeVal);
    //  Instance of TP.dom.CommentNode
    tibetCommentNodeVal = TP.dom.CommentNode.construct(commentNodeVal);

    //  Instance of TP.path.SimpleTIBETPath
    tibetSimpleTIBETPathVal = TP.path.SimpleTIBETPath.construct('foo');
    //  Instance of TP.path.ComplexTIBETPath
    tibetComplexTIBETPathVal = TP.path.ComplexTIBETPath.construct('foo.bar.baz');
    //  Instance of TP.path.ElementPath
    tibetElementPathVal = TP.path.ElementPath.construct('/1/2');
    //  Instance of TP.path.XTensionPath
    tibetXTensionPathVal = TP.path.XTensionPath.construct('*[foo]');
    //  Instance of TP.path.XPathPath
    tibetXPathVal = TP.path.XPathPath.construct('//*');

    //  Instance of TP.sig.Request
    tibetRequestVal = TP.sig.Request.construct(TP.hc('foo', 'bar'));
    //  Need to do this so that the request has a real signal name for testing
    //  down below
    tibetRequestVal.getSignalName();

    //  Instance of TP.sig.Response
    tibetResponseVal = TP.sig.Response.construct(tibetRequestVal, 'baz');
    //  Need to do this so that the response has a real signal name for testing
    //  down below
    tibetResponseVal.getSignalName();

    //  Instance of TP.uri.TIBETURN
    tibetTIBETURNVal = TP.uc('urn:tibet:foo');
    //  Instance of TP.uri.HTTPURL
    tibetHTTPURLVal = TP.uc('http://www.blah.com');
    //  Instance of TP.uri.FileURL
    tibetFileURLVal = TP.uc('file:///goo.txt');
    /* eslint-disable no-script-url */
    //  Instance of TP.core.JSURL
    tibetJSURIVal = TP.uc('javascript:alert("hi")');
    /* eslint-enable no-script-url */
    //  Instance of TP.uri.WSURL
    tibetWSURLVal = TP.uc('ws://ws.blah.com');
    //  Instance of TP.uri.TIBETURL
    tibetTIBETURLVal = TP.uc('tibet://top/file:///goo.txt');
    //  Instance of TP.uri.CookieURL
    tibetCookieURLVal = TP.uc('cookie://blah=foo');

    //  Instance of TP.w3.DocType
    tibetDocTypeVal = TP.w3.DocType.construct(
        'html',
        '-//W3C//DTD XHTML 1.0 Strict//EN',
        'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd');

    //  Instance of TP.gui.Point
    tibetPointVal = TP.gui.Point.construct(20, 30);
    //  Instance of TP.gui.Rect
    tibetRectVal = TP.gui.Rect.construct(0, 0, 100, 100);
    //  Instance of TP.gui.Matrix
    tibetMatrixVal = TP.gui.Matrix.construct();
    //  Instance of TP.gui.Color
    tibetColorVal = TP.gui.Color.construct(0, 255, 255);

    //  Instance of TP.gui.LinearGradient
    tibetLinearGradientVal = TP.gui.LinearGradient.construct();
    tibetLinearGradientVal.set('angle', 45);
    tibetLinearGradientVal.addColorStop('10%', TP.cc(0, 0, 255, 0.5));
    tibetLinearGradientVal.addColorStop('50%', TP.cc(0, 255, 255, 1.0));

    //  Instance of TP.gui.RadialGradient
    tibetRadialGradientVal = TP.gui.RadialGradient.construct();
    tibetRadialGradientVal.addColorStop('10%', TP.cc(0, 0, 255, 0.5));
    tibetRadialGradientVal.addColorStop('50%', TP.cc(0, 255, 255, 1.0));

    //  Instance of TP.gui.Pattern
    tibetPatternVal = TP.gui.Pattern.construct().
                        set('x', 20).
                        set('y', 20).
                        set('width', 100).
                        set('height', 100);

    //  Instance of TP.gui.SVGPath
    tibetPath = TP.gui.SVGPath.construct();
    tibetPath.addSegment(TP.gui.SVGPath.MOVE_TO_ABS, TP.ac(10, 10));
    tibetPath.addSegment(TP.gui.SVGPath.MOVE_TO_ABS, TP.ac(20, 20));

    //  Instance of TP.core.Job
    tibetJob = TP.core.Job.construct(TP.hc());

    //  TP.core.Browser
    tibetBrowserType = TP.core.Browser;

    //  Instance of TP.boot.Annotation
    tpBootAnnotation = TP.boot.$annotate('A String', 'This is a message');

    //  Instance of TP.core.Annotation
    tpAnnotation = TP.annotate('A String', 'This is a message');

    /* eslint-disable no-multi-spaces */
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
    'NativeFunction',           nativeFuncVal,          //  NativeFunc

    'Window',                   windowVal,              //  Window
    'IFrameWindow',             iframeWindowVal,        //  IFrame Window

    'HTMLDocument',             htmlDocumentVal,        //  HTMLDocument
    'HTMLElement',              htmlElementVal,         //  HTMLElement

    'XMLDocument',              xmlDocumentVal,         //  XMLDocument
    'XMLElement',               xmlElementVal,          //  XMLElement

    'AttributeNode',            attrNodeVal,                //  Attribute Node
    'CDATASectionNode',         cdataSectionNodeVal,        //  Text Node
    'CommentNode',              commentNodeVal,             //  Comment Node
    'DocumentFragmentNode',     documentFragmentNodeVal,    //  Document Fragment Node
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
    'TP.core.Hash',             tibetHashVal,           //  TP.core.Hash
    'TP.sig.Signal',            tibetSignalVal,         //  TP.sig.Signal
    'TP.sig.Exception',         tibetExceptionVal,      //  TP.sig.Exception

    'TP.core.Window',           tibetWindowVal,         //  TP.core.Window
    'TP.dom.HTMLDocumentNode',  tibetHTMLDocVal,        //  TP.dom.HTMLDocumentNode
    'TP.dom.HTMLElementNode',   tibetHTMLElemVal,       //  TP.dom.HTMLElementNode

    'TP.dom.XMLDocumentNode',   tibetXMLDocVal,         //  TP.dom.XMLDocumentNode
    'TP.dom.XMLElementNode',    tibetXMLElemVal,        //  TP.dom.XMLElementNode

    'TP.dom.DocumentFragmentNode', tibetDocFragNodeVal,     //  TP.dom.DocumentFragmentNode
    'TP.dom.AttributeNode',     tibetAttributeNodeVal,      //  TP.dom.AttributeNode
    'TP.dom.TextNode',          tibetTextNodeVal,           //  TP.dom.TextNode
    'TP.dom.CDATASectionNode',  tibetCDATASectionNodeVal,   //  TP.dom.CDATASectionNode
    'TP.dom.ProcessingInstructionNode',    tibetPINodeVal,  //  TP.dom.ProcessingInstructionNode
    'TP.dom.CommentNode',       tibetCommentNodeVal,        //  TP.dom.CommentNode

    'TP.path.SimpleTIBETPath',  tibetSimpleTIBETPathVal,    //  TP.path.SimpleTIBETPath
    'TP.path.ComplexTIBETPath', tibetComplexTIBETPathVal,   //  TP.path.SimpleTIBETPath
    'TP.path.ElementPath',      tibetElementPathVal,        //  TP.path.ElementPath
    'TP.path.XTensionPath',     tibetXTensionPathVal,       //  TP.path.XTensionPath
    'TP.path.XPathPath',        tibetXPathVal,              //  TP.path.XPathPath

    'TP.sig.Request',           tibetRequestVal,        //  TP.sig.Request
    'TP.sig.Response',          tibetResponseVal,       //  TP.sig.Response

    'TP.uri.TIBETURN',          tibetTIBETURNVal,       //  TP.uri.TIBETURN
    'TP.uri.HTTPURL',           tibetHTTPURLVal,        //  TP.uri.HTTPURL
    'TP.uri.FileURL',           tibetFileURLVal,        //  TP.uri.FileURL
    'TP.uri.JSURI',             tibetJSURIVal,          //  TP.uri.JSURI
    'TP.uri.WSURL',             tibetWSURLVal,          //  TP.uri.WSURL
    'TP.uri.TIBETURL',          tibetTIBETURLVal,       //  TP.uri.TIBETURL
    'TP.uri.CookieURL',         tibetCookieURLVal,      //  TP.uri.CookieURL

    'TP.w3.DocType',            tibetDocTypeVal,        //  TP.w3.DocType

    'TP.gui.Point',             tibetPointVal,          //  TP.gui.Point
    'TP.gui.Rect',              tibetRectVal,           //  TP.gui.Rect
    'TP.gui.Matrix',            tibetMatrixVal,         //  TP.gui.Matrix
    'TP.gui.Color',             tibetColorVal,          //  TP.gui.Color

    'TP.gui.LinearGradient',    tibetLinearGradientVal, //  TP.gui.LinearGradient
    'TP.gui.RadialGradient',    tibetRadialGradientVal, //  TP.gui.RadialGradient
    'TP.gui.Pattern',           tibetPatternVal,        //  TP.gui.Pattern
    'TP.gui.Path',              tibetPath,              //  TP.gui.Path

    'TP.core.Job',              tibetJob,               //  TP.core.Job
    'TP.core.Browser_TYPE',     tibetBrowserType,       //  TP.core.Browser type

    'TP.boot.Annotation',       tpBootAnnotation,       //  TP.boot.Annotation
    'TP.core.Annotation',       tpAnnotation            //  TP.core.Annotation
    );
    /* eslint-enable no-multi-spaces */

    //  In order to get an 'undefined' value into our hash, we have to play some
    //  trickery with the underlying hash... TODO: clean this up
    objValues.$get('$$hash')[TP.UNDEF] = undefVal;

    TP.defineAttributeSlot(TP, '$$commonObjectValues', objValues);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupCommonObjectTypes',
function(aRequest) {
    var topLevelWindow,

        undefVal,
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
        nativeFuncVal,

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

        objTypeHierarchies,

        objLeafTypes,

        i,
        keys,

        objRootTypes;

    if (TP.isValid(TP.$$commonObjectTypeHierarchies)) {
        return;
    }

    topLevelWindow = TP.sys.getLaunchWindow();

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
    nativeFuncVal = TP.ac(Function, Object);

    windowVal = TP.ac(Window, Object);
    iframeWindowVal = TP.ac(topLevelWindow.UIROOT.Window, topLevelWindow.UIROOT.Object);

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

    tibetTypeVal = TP.ac(TP.meta.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetObjectVal = TP.ac(TP.lang.Object, TP.lang.RootObject, Object);

    tibetHashVal = TP.ac(TP.core.Hash, TP.lang.Object, TP.lang.RootObject, Object);

    tibetSignalVal = TP.ac(TP.sig.Signal, TP.lang.Object, TP.lang.RootObject, Object);

    tibetExceptionVal = TP.ac(TP.sig.Exception, TP.sig.Signal, TP.lang.Object, TP.lang.RootObject, Object);

    tibetWindowVal = TP.ac(TP.core.Window, TP.lang.Object, TP.lang.RootObject, Object);
    tibetHTMLDocVal = TP.ac(TP.dom.HTMLDocumentNode, TP.dom.DocumentNode, TP.dom.CollectionNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetHTMLElemVal = TP.ac(TP.html.body, TP.html.Attrs, TP.dom.UIElementNode, TP.dom.ElementNode, TP.dom.CollectionNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetXMLDocVal = TP.ac(TP.dom.XMLDocumentNode, TP.dom.DocumentNode, TP.dom.CollectionNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetXMLElemVal = TP.ac(TP.dom.XMLElementNode, TP.dom.ElementNode, TP.dom.CollectionNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetDocFragNodeVal = TP.ac(TP.dom.DocumentFragmentNode, TP.dom.CollectionNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetAttributeNodeVal = TP.ac(TP.dom.AttributeNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetTextNodeVal = TP.ac(TP.dom.TextNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetCDATASectionNodeVal = TP.ac(TP.dom.CDATASectionNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetPINodeVal = TP.ac(TP.dom.XMLProcessingInstructionNode, TP.dom.ProcessingInstructionNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);
    tibetCommentNodeVal = TP.ac(TP.dom.CommentNode, TP.dom.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetSimpleTIBETPathVal = TP.ac(TP.path.SimpleTIBETPath, TP.path.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);
    tibetComplexTIBETPathVal = TP.ac(TP.path.ComplexTIBETPath, TP.path.SimpleTIBETPath, TP.path.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);
    tibetElementPathVal = TP.ac(TP.path.ElementPath, TP.path.XMLPath, TP.path.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);
    tibetXTensionPathVal = TP.ac(TP.path.XTensionPath, TP.path.XMLPath, TP.path.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);
    tibetXPathVal = TP.ac(TP.path.XPathPath, TP.path.XMLPath, TP.path.AccessPath, TP.lang.Object, TP.lang.RootObject, Object);

    tibetRequestVal = TP.ac(TP.sig.Request, TP.sig.WorkflowSignal, TP.sig.Signal, TP.lang.Object, TP.lang.RootObject, Object);

    tibetResponseVal = TP.ac(TP.sig.Response, TP.sig.WorkflowSignal, TP.sig.Signal, TP.lang.Object, TP.lang.RootObject, Object);

    tibetTIBETURNVal = TP.ac(TP.uri.TIBETURN, TP.uri.URN, TP.uri.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetHTTPURLVal = TP.ac(TP.uri.HTTPURL, TP.uri.URL, TP.uri.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetFileURLVal = TP.ac(TP.uri.FileURL, TP.uri.URL, TP.uri.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetJSURIVal = TP.ac(TP.uri.JSURI, TP.uri.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetWSURLVal = TP.ac(TP.uri.WSURL, TP.uri.URL, TP.uri.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetTIBETURLVal = TP.ac(TP.uri.TIBETURL, TP.uri.URL, TP.uri.URI, TP.lang.Object, TP.lang.RootObject, Object);
    tibetCookieURLVal = TP.ac(TP.uri.CookieURL, TP.uri.URL, TP.uri.URI, TP.lang.Object, TP.lang.RootObject, Object);

    tibetDocTypeVal = TP.ac(TP.w3.DocType, TP.lang.Object, TP.lang.RootObject, Object);

    tibetPointVal = TP.ac(TP.gui.Point, TP.lang.Object, TP.lang.RootObject, Object);
    tibetRectVal = TP.ac(TP.gui.Rect, TP.lang.Object, TP.lang.RootObject, Object);
    tibetMatrixVal = TP.ac(TP.gui.Matrix, TP.lang.Object, TP.lang.RootObject, Object);
    tibetColorVal = TP.ac(TP.gui.Color, TP.lang.Object, TP.lang.RootObject, Object);

    tibetLinearGradientVal = TP.ac(TP.gui.LinearGradient, TP.gui.Gradient, TP.lang.Object, TP.lang.RootObject, Object);

    tibetRadialGradientVal = TP.ac(TP.gui.RadialGradient, TP.gui.Gradient, TP.lang.Object, TP.lang.RootObject, Object);

    tibetPatternVal = TP.ac(TP.gui.Pattern, TP.lang.Object, TP.lang.RootObject, Object);

    tibetPath = TP.ac(TP.gui.SVGPath, TP.gui.Path, TP.lang.Object, TP.lang.RootObject, Object);

    tibetJob = TP.ac(TP.core.Job, TP.lang.Object, TP.lang.RootObject, Object);

    tibetBrowserType = TP.ac(TP.meta.core.Browser, TP.lang.Object, TP.lang.RootObject, Object);

    tpBootAnnotation = TP.ac(TP.boot.Annotation, Object);
    tpAnnotation = TP.ac(TP.core.Annotation, TP.lang.Object, TP.lang.RootObject, Object);

    /* eslint-disable no-multi-spaces */
    objTypeHierarchies = TP.hc(
    TP.NULL,                    nullVal,                //  null
    'Array',                    arrayVal,               //  Array
    'Boolean',                  booleanVal,             //  Boolean
    'Date',                     dateVal,                //  Date
    'Function',                 functionVal,            //  Function
    'InvalidDate',              invalidDateVal,         //  not a Date
    'NaN',                      nanVal,                 //  NaN
    'Number',                   numberVal,              //  Number
    'Object',                   objectVal,              //  Object
    'RegExp',                   regexpVal,              //  RegExp
    'String',                   stringVal,              //  String

    'NativeType',               nativeTypeVal,          //  NativeType
    'NativeFunction',           nativeFuncVal,          //  NativeFunc

    'Window',                   windowVal,              //  Window
    'IFrameWindow',             iframeWindowVal,        //  IFrame Window

    'HTMLDocument',             htmlDocumentVal,        //  HTMLDocument
    'HTMLElement',              htmlElementVal,         //  HTMLElement

    'XMLDocument',              xmlDocumentVal,         //  XMLDocument
    'XMLElement',               xmlElementVal,          //  XMLElement

    'AttributeNode',            attrNodeVal,                //  Attribute Node
    'CDATASectionNode',         cdataSectionNodeVal,        //  Text Node
    'CommentNode',              commentNodeVal,             //  Comment Node
    'DocumentFragmentNode',     documentFragmentNodeVal,    //  Document Fragment Node
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
    'TP.core.Hash',             tibetHashVal,           //  TP.core.Hash
    'TP.sig.Signal',            tibetSignalVal,         //  TP.sig.Signal
    'TP.sig.Exception',         tibetExceptionVal,      //  TP.sig.Exception

    'TP.core.Window',           tibetWindowVal,         //  TP.core.Window
    'TP.dom.HTMLDocumentNode',  tibetHTMLDocVal,        //  TP.dom.HTMLDocumentNode
    'TP.dom.HTMLElementNode',   tibetHTMLElemVal,       //  TP.dom.HTMLElementNode

    'TP.dom.XMLDocumentNode',   tibetXMLDocVal,         //  TP.dom.XMLDocumentNode
    'TP.dom.XMLElementNode',    tibetXMLElemVal,        //  TP.dom.XMLElementNode

    'TP.dom.DocumentFragmentNode', tibetDocFragNodeVal,     //  TP.dom.DocumentFragmentNode
    'TP.dom.AttributeNode',     tibetAttributeNodeVal,      //  TP.dom.AttributeNode
    'TP.dom.TextNode',          tibetTextNodeVal,           //  TP.dom.TextNode
    'TP.dom.CDATASectionNode',  tibetCDATASectionNodeVal,   //  TP.dom.CDATASectionNode
    'TP.dom.ProcessingInstructionNode',    tibetPINodeVal,  //  TP.dom.ProcessingInstructionNode
    'TP.dom.CommentNode',       tibetCommentNodeVal,        //  TP.dom.CommentNode

    'TP.path.SimpleTIBETPath',  tibetSimpleTIBETPathVal,    //  TP.path.SimpleTIBETPath
    'TP.path.ComplexTIBETPath', tibetComplexTIBETPathVal,   //  TP.path.SimpleTIBETPath
    'TP.path.ElementPath',      tibetElementPathVal,        //  TP.path.ElementPath
    'TP.path.XTensionPath',     tibetXTensionPathVal,       //  TP.path.XTensionPath
    'TP.path.XPathPath',        tibetXPathVal,              //  TP.path.XPathPath

    'TP.sig.Request',           tibetRequestVal,        //  TP.sig.Request
    'TP.sig.Response',          tibetResponseVal,       //  TP.sig.Response

    'TP.uri.TIBETURN',          tibetTIBETURNVal,       //  TP.uri.TIBETURN
    'TP.uri.HTTPURL',           tibetHTTPURLVal,        //  TP.uri.HTTPURL
    'TP.uri.FileURL',           tibetFileURLVal,        //  TP.uri.FileURL
    'TP.uri.JSURI',             tibetJSURIVal,          //  TP.uri.JSURI
    'TP.uri.WSURL',             tibetWSURLVal,          //  TP.uri.WSURL
    'TP.uri.TIBETURL',          tibetTIBETURLVal,       //  TP.uri.TIBETURL
    'TP.uri.CookieURL',         tibetCookieURLVal,      //  TP.uri.CookieURL

    'TP.w3.DocType',            tibetDocTypeVal,        //  TP.w3.DocType

    'TP.gui.Point',             tibetPointVal,          //  TP.gui.Point
    'TP.gui.Rect',              tibetRectVal,           //  TP.gui.Rect
    'TP.gui.Matrix',            tibetMatrixVal,         //  TP.gui.Matrix
    'TP.gui.Color',             tibetColorVal,          //  TP.gui.Color

    'TP.gui.LinearGradient',    tibetLinearGradientVal, //  TP.gui.LinearGradient
    'TP.gui.RadialGradient',    tibetRadialGradientVal, //  TP.gui.RadialGradient
    'TP.gui.Pattern',           tibetPatternVal,        //  TP.gui.Pattern
    'TP.gui.Path',              tibetPath,              //  TP.gui.Path

    'TP.core.Job',              tibetJob,               //  TP.core.Job
    'TP.core.Browser_TYPE',     tibetBrowserType,       //  TP.core.Browser type

    'TP.boot.Annotation',       tpBootAnnotation,       //  TP.boot.Annotation
    'TP.core.Annotation',       tpAnnotation            //  TP.core.Annotation
    );
    /* eslint-enable no-multi-spaces */

    //  In order to get an 'undefined' value into our hash, we have to play some
    //  trickery with the underlying hash... TODO: clean this up
    objTypeHierarchies.$get('$$hash')[TP.UNDEF] = undefVal;

    TP.defineAttributeSlot(
            TP, '$$commonObjectTypeHierarchies', objTypeHierarchies);

    //  ---

    //  To make the most specific type values, we go to each entry for the type
    //  hierarchy and grab the first value.

    objLeafTypes = TP.hc();

    keys = objTypeHierarchies.getKeys();
    for (i = 0; i < keys.getSize(); i++) {
        objLeafTypes.atPut(
                keys.at(i),
                objTypeHierarchies.at(keys.at(i)).first());
    }

    //  These values are different for the standalone type values vs. the type
    //  hierarchy values
    objLeafTypes.$get('$$hash')[TP.UNDEF] = undefined;
    objLeafTypes.$get('$$hash')[TP.NULL] = undefined;

    TP.defineAttributeSlot(
            TP, '$$commonObjectLeafTypes', objLeafTypes);

    //  ---

    //  To make the least specific type values, we go to each entry for the type
    //  hierarchy and grab the last value.

    objRootTypes = TP.hc();

    keys = objTypeHierarchies.getKeys();
    for (i = 0; i < keys.getSize(); i++) {
        objRootTypes.atPut(
                keys.at(i),
                objTypeHierarchies.at(keys.at(i)).last());
    }

    //  These values are different for the standalone type values vs. the type
    //  hierarchy values
    objRootTypes.$get('$$hash')[TP.UNDEF] = undefined;
    objRootTypes.$get('$$hash')[TP.NULL] = undefined;

    TP.defineAttributeSlot(
            TP, '$$commonObjectRootTypes', objRootTypes);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupHostTypesValues',
function(aRequest) {

    var typesTestValues;

    if (TP.isValid(TP.$$hostTypesTestValues)) {
        return;
    }

    typesTestValues = TP.hc();

    TP.sys.$nativeglobals.getKeys().forEach(
        function(aProp) {
            var obj;

            //  If the property name matches what we think should be a
            //  'native type name', then test it for being a
            //  non-Function constructor.
            if (TP.regex.NATIVE_TYPENAME.test(aProp)) {
                obj = TP.global[aProp];

                //  Filter out keys that cause problems on various platforms
                if (aProp === 'Infinity' ||
                    aProp === 'NaN' ||
                    aProp === 'PERSISTENT' ||
                    aProp === 'TEMPORARY') {
                    return;
                }

                typesTestValues.atPut(aProp, obj);
            }
        });

    TP.defineAttributeSlot(
            TP, '$$hostTypesTestValues', typesTestValues);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupCommonWrappedObjectValues',
function(aRequest) {

    var wrappedObjectValues;

    if (TP.isValid(TP.$$commonWrappedObjectValues)) {
        return;
    }

    /* eslint-disable no-multi-spaces */
    wrappedObjectValues = TP.hc(
        TP.UNDEF,                               TP.IDENTITY,
        TP.NULL,                                TP.IDENTITY,
        'Array',                                'Array',    //  contents wrapped
        'Boolean',                              TP.IDENTITY,
        'Date',                                 TP.IDENTITY,
        'Function',                             TP.IDENTITY,
        'InvalidDate',                          TP.IDENTITY,
        'NaN',                                  TP.IDENTITY,
        'Number',                               TP.IDENTITY,
        'Object',                               TP.IDENTITY,
        'RegExp',                               TP.IDENTITY,
        'String',                               TP.IDENTITY,

        'NativeType',                           TP.IDENTITY,
        'NativeFunction',                       TP.IDENTITY,

        'Window',                               'TP.core.Window',
        'IFrameWindow',                         'TP.core.Window',

        // 'Node',                                 'Node',
        'HTMLDocument',                         'TP.dom.HTMLDocumentNode',
        'HTMLElement',                          'TP.html.body',

        'XMLDocument',                          'TP.dom.XMLDocumentNode',
        'XMLElement',                           'TP.dom.XMLElementNode',

        'AttributeNode',                        'TP.dom.AttributeNode',
        'TextNode',                             'TP.dom.TextNode',
        'CDATASectionNode',                     'TP.dom.CDATASectionNode',
        'PINode',                               'TP.dom.ProcessingInstructionNode',
        'CommentNode',                          'TP.dom.CommentNode',
        'DocumentFragmentNode',                 'TP.dom.DocumentFragmentNode',

        'NodeList',                             'Array',        //  contents wrapped
        'NamedNodeMap',                         'TP.core.Hash', //  contents wrapped

        'CSSStyleSheet',                        TP.IDENTITY,
        'CSSStyleRule',                         TP.IDENTITY,
        'CSSStyleDeclaration',                  TP.IDENTITY,

        'Error',                                TP.IDENTITY,
        'Event',                                'TP.sig.DOMMouseOver',
        'XHR',                                  TP.IDENTITY,

        'TIBETType',                            TP.IDENTITY,
        'TP.lang.Object',                       TP.IDENTITY,
        'TP.core.Hash',                         'TP.core.Hash', //  contents wrapped
        'TP.sig.Signal',                        TP.IDENTITY,
        'TP.sig.Exception',                     TP.IDENTITY,

        'TP.core.Window',                       TP.IDENTITY,
        'TP.dom.HTMLDocumentNode',              TP.IDENTITY,
        'TP.dom.HTMLElementNode',               TP.IDENTITY,

        'TP.dom.XMLDocumentNode',               TP.IDENTITY,
        'TP.dom.XMLElementNode',                TP.IDENTITY,

        'TP.dom.DocumentFragmentNode',          TP.IDENTITY,
        'TP.dom.AttributeNode',                 TP.IDENTITY,
        'TP.dom.TextNode',                      TP.IDENTITY,
        'TP.dom.CDATASectionNode',              TP.IDENTITY,
        'TP.dom.ProcessingInstructionNode',     TP.IDENTITY,
        'TP.dom.CommentNode',                   TP.IDENTITY,

        'TP.path.SimpleTIBETPath',              TP.IDENTITY,
        'TP.path.ComplexTIBETPath',             TP.IDENTITY,
        'TP.path.ElementPath',                  TP.IDENTITY,
        'TP.path.XTensionPath',                 TP.IDENTITY,
        'TP.path.XPathPath',                    TP.IDENTITY,

        'TP.sig.Request',                       TP.IDENTITY,
        'TP.sig.Response',                      TP.IDENTITY,

        'TP.uri.TIBETURN',                      TP.IDENTITY,
        'TP.uri.HTTPURL',                       TP.IDENTITY,
        'TP.uri.FileURL',                       TP.IDENTITY,
        'TP.uri.JSURI',                         TP.IDENTITY,
        'TP.uri.WSURL',                         TP.IDENTITY,
        'TP.uri.TIBETURL',                      TP.IDENTITY,
        'TP.uri.CookieURL',                     TP.IDENTITY,

        'TP.w3.DocType',                        TP.IDENTITY,

        'TP.gui.Point',                         TP.IDENTITY,
        'TP.gui.Rect',                          TP.IDENTITY,
        'TP.gui.Matrix',                        TP.IDENTITY,
        'TP.gui.Color',                         TP.IDENTITY,

        'TP.gui.LinearGradient',                TP.IDENTITY,
        'TP.gui.RadialGradient',                TP.IDENTITY,

        'TP.gui.Pattern',                       TP.IDENTITY,
        'TP.gui.Path',                          TP.IDENTITY,

        'TP.core.Job',                          TP.IDENTITY,
        'TP.core.Browser_TYPE',                 TP.IDENTITY,

        'TP.boot.Annotation',                   TP.IDENTITY,
        'TP.core.Annotation',                   TP.IDENTITY
        );
    /* eslint-enable no-multi-spaces */

    TP.defineAttributeSlot(
            TP, '$$commonWrappedObjectValues', wrappedObjectValues);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupCommonUnwrappedObjectValues',
function(aRequest) {

    var unwrappedObjectValues;

    if (TP.isValid(TP.$$commonUnwrappedObjectValues)) {
        return;
    }

    /* eslint-disable no-multi-spaces */
    unwrappedObjectValues = TP.hc(
        TP.UNDEF,                               TP.IDENTITY,
        TP.NULL,                                TP.IDENTITY,
        'Array',                                'Array',    //  contents wrapped
        'Boolean',                              TP.IDENTITY,
        'Date',                                 TP.IDENTITY,
        'Function',                             TP.IDENTITY,
        'InvalidDate',                          TP.IDENTITY,
        'NaN',                                  TP.IDENTITY,
        'Number',                               TP.IDENTITY,
        'Object',                               TP.IDENTITY,
        'RegExp',                               TP.IDENTITY,
        'String',                               TP.IDENTITY,

        'NativeType',                           TP.IDENTITY,
        'NativeFunction',                       TP.IDENTITY,

        'Window',                               TP.IDENTITY,
        'IFrameWindow',                         TP.IDENTITY,

        // 'Node',                                 'Node',
        'HTMLDocument',                         TP.IDENTITY,
        'HTMLElement',                          TP.IDENTITY,

        'XMLDocument',                          TP.IDENTITY,
        'XMLElement',                           TP.IDENTITY,

        'AttributeNode',                        TP.IDENTITY,
        'TextNode',                             TP.IDENTITY,
        'CDATASectionNode',                     TP.IDENTITY,
        'PINode',                               TP.IDENTITY,
        'CommentNode',                          TP.IDENTITY,
        'DocumentFragmentNode',                 TP.IDENTITY,

        'NodeList',                             TP.IDENTITY,
        'NamedNodeMap',                         TP.IDENTITY,

        'CSSStyleSheet',                        TP.IDENTITY,
        'CSSStyleRule',                         TP.IDENTITY,
        'CSSStyleDeclaration',                  TP.IDENTITY,

        'Error',                                TP.IDENTITY,
        'Event',                                TP.IDENTITY,
        'XHR',                                  TP.IDENTITY,

        'TIBETType',                            TP.IDENTITY,
        'TP.lang.Object',                       TP.IDENTITY,
        'TP.core.Hash',                         'TP.core.Hash', //  contents wrapped
        'TP.sig.Signal',                        TP.IDENTITY,
        'TP.sig.Exception',                     TP.IDENTITY,

        'TP.core.Window',                       'DOMWindow',
        'TP.dom.HTMLDocumentNode',              'HTMLDocument',
        'TP.dom.HTMLElementNode',               'HTMLBodyElement',

        'TP.dom.XMLDocumentNode',               'XMLDocument',
        'TP.dom.XMLElementNode',                'Element',

        'TP.dom.DocumentFragmentNode',          'DocumentFragment',
        'TP.dom.AttributeNode',                 'Attr',
        'TP.dom.TextNode',                      'Text',
        'TP.dom.CDATASectionNode',              'CDATASection',
        'TP.dom.ProcessingInstructionNode',     'ProcessingInstruction',
        'TP.dom.CommentNode',                   'Comment',

        'TP.path.SimpleTIBETPath',              TP.IDENTITY,
        'TP.path.ComplexTIBETPath',             TP.IDENTITY,
        'TP.path.ElementPath',                  TP.IDENTITY,
        'TP.path.XTensionPath',                 TP.IDENTITY,
        'TP.path.XPathPath',                    TP.IDENTITY,

        'TP.sig.Request',                       TP.IDENTITY,
        'TP.sig.Response',                      TP.IDENTITY,

        'TP.uri.TIBETURN',                      'String',
        'TP.uri.HTTPURL',                       'String',
        'TP.uri.FileURL',                       'String',
        'TP.uri.JSURI',                         'String',
        'TP.uri.WSURL',                         'String',
        'TP.uri.TIBETURL',                      'String',
        'TP.uri.CookieURL',                     'String',

        'TP.w3.DocType',                        TP.IDENTITY,

        'TP.gui.Point',                         TP.IDENTITY,
        'TP.gui.Rect',                          TP.IDENTITY,
        'TP.gui.Matrix',                        TP.IDENTITY,
        'TP.gui.Color',                         TP.IDENTITY,

        'TP.gui.LinearGradient',                TP.IDENTITY,
        'TP.gui.RadialGradient',                TP.IDENTITY,

        'TP.gui.Pattern',                       TP.IDENTITY,
        'TP.gui.Path',                          TP.IDENTITY,

        'TP.core.Job',                          TP.IDENTITY,
        'TP.core.Browser_TYPE',                 TP.IDENTITY,

        'TP.boot.Annotation',                   TP.IDENTITY,
        'TP.core.Annotation',                   TP.IDENTITY
        );
    /* eslint-enable no-multi-spaces */

    TP.defineAttributeSlot(
            TP, '$$commonUnwrappedObjectValues', unwrappedObjectValues);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupCommonPrimitiveObjectValues',
function(aRequest) {

    var primitiveObjectValues;

    if (TP.isValid(TP.$$commonPrimitiveObjectValues)) {
        return;
    }

    /* eslint-disable no-multi-spaces */
    primitiveObjectValues = TP.hc(
        TP.UNDEF,                               TP.IDENTITY,
        TP.NULL,                                TP.IDENTITY,
        'Array',                                TP.IDENTITY,
        'Boolean',                              TP.IDENTITY,
        'Date',                                 TP.IDENTITY,
        'Function',                             'fluffy',   //  Return value of function
        'InvalidDate',                          TP.IDENTITY,
        'NaN',                                  TP.IDENTITY,
        'Number',                               TP.IDENTITY,
        'Object',                               TP.IDENTITY,
        'RegExp',                               TP.IDENTITY,
        'String',                               TP.IDENTITY,

        'NativeType',                           TP.IDENTITY,
        'NativeFunction',                       TP.IDENTITY,

        'Window',                               TP.IDENTITY,
        'IFrameWindow',                         TP.IDENTITY,

        // 'Node',                                 'Node',
        'HTMLDocument',                         /([\s\S]+)/,
        'HTMLElement',                          /([\s\S]+)/,

        'XMLDocument',                          'Hi there<boo><goo/></boo><moo/>',
        'XMLElement',                           'bar',

        'AttributeNode',                        'bar',
        'TextNode',                             'foo',
        'CDATASectionNode',                     'foo',
        'PINode',                               'bar',
        'CommentNode',                          'foo',
        'DocumentFragmentNode',                 /<foo([\s\S]*)\/><bar([\s\S]*)\/>/,

        'NodeList',                             TP.IDENTITY,
        'NamedNodeMap',                         TP.IDENTITY,

        'CSSStyleSheet',                        TP.IDENTITY,
        'CSSStyleRule',                         TP.IDENTITY,
        'CSSStyleDeclaration',                  TP.IDENTITY,

        'Error',                                TP.IDENTITY,
        'Event',                                TP.IDENTITY,
        'XHR',                                  TP.IDENTITY,

        'TIBETType',                            TP.IDENTITY,
        'TP.lang.Object',                       TP.IDENTITY,
        'TP.core.Hash',                         TP.IDENTITY,
        'TP.sig.Signal',                        TP.IDENTITY,
        'TP.sig.Exception',                     TP.IDENTITY,

        'TP.core.Window',                       TP.IDENTITY,
        'TP.dom.HTMLDocumentNode',              /([\s\S]+)/,
        'TP.dom.HTMLElementNode',               /([\s\S]+)/,

        'TP.dom.XMLDocumentNode',               'Hi there<boo><goo/></boo><moo/>',
        'TP.dom.XMLElementNode',                'bar',

        'TP.dom.DocumentFragmentNode',          /<foo([\s\S]*)\/><bar([\s\S]*)\/>/,
        'TP.dom.AttributeNode',                 'bar',
        'TP.dom.TextNode',                      'foo',
        'TP.dom.CDATASectionNode',              'foo',
        'TP.dom.ProcessingInstructionNode',     'bar',
        'TP.dom.CommentNode',                   'foo',

        'TP.path.SimpleTIBETPath',              TP.IDENTITY,
        'TP.path.ComplexTIBETPath',             TP.IDENTITY,
        'TP.path.ElementPath',                  TP.IDENTITY,
        'TP.path.XTensionPath',                 TP.IDENTITY,
        'TP.path.XPathPath',                    TP.IDENTITY,

        'TP.sig.Request',                       TP.IDENTITY,
        'TP.sig.Response',                      'baz',

        'TP.uri.TIBETURN',                      TP.IDENTITY,
        'TP.uri.HTTPURL',                       TP.IDENTITY,
        'TP.uri.FileURL',                       TP.IDENTITY,
        'TP.uri.JSURI',                         TP.IDENTITY,
        'TP.uri.WSURL',                         TP.IDENTITY,
        'TP.uri.TIBETURL',                      TP.IDENTITY,
        'TP.uri.CookieURL',                     TP.IDENTITY,

        'TP.w3.DocType',                        TP.IDENTITY,

        'TP.gui.Point',                         TP.IDENTITY,
        'TP.gui.Rect',                          TP.IDENTITY,
        'TP.gui.Matrix',                        TP.IDENTITY,
        'TP.gui.Color',                         TP.IDENTITY,

        'TP.gui.LinearGradient',                TP.IDENTITY,
        'TP.gui.RadialGradient',                TP.IDENTITY,

        'TP.gui.Pattern',                       TP.IDENTITY,
        'TP.gui.Path',                          TP.IDENTITY,

        'TP.core.Job',                          TP.IDENTITY,
        'TP.core.Browser_TYPE',                 TP.IDENTITY,

        'TP.boot.Annotation',                   TP.IDENTITY,
        'TP.core.Annotation',                   TP.IDENTITY
        );
    /* eslint-enable no-multi-spaces */

    TP.defineAttributeSlot(
            TP, '$$commonPrimitiveObjectValues', primitiveObjectValues);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
