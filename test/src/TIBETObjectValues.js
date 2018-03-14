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
    tibetTypeVal = TP.sys.getTypeByName('TP.core.Node');

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
    //  Instance of TP.core.HTMLDocumentNode
    tibetHTMLDocVal = TP.core.Document.construct(htmlDocumentVal);
    //  Instance of TP.core.HTMLElementNode
    tibetHTMLElemVal = TP.core.HTMLElementNode.construct(htmlElementVal);

    //  Instance of TP.core.XMLDocumentNode
    tibetXMLDocVal = TP.core.Document.construct(xmlDocumentVal);
    //  Instance of TP.core.XMLElementNode
    tibetXMLElemVal = TP.core.XMLElementNode.construct(xmlElementVal);

    //  Instance of TP.core.DocumentFragmentNode
    tibetDocFragNodeVal = TP.core.DocumentFragmentNode.construct(
        documentFragmentNodeVal);
    //  Instance of TP.core.AttributeNode
    tibetAttributeNodeVal = TP.core.AttributeNode.construct(attrNodeVal);
    //  Instance of TP.core.TextNode
    tibetTextNodeVal = TP.core.TextNode.construct(textNodeVal);
    //  Instance of TP.core.CDATASectionNode
    tibetCDATASectionNodeVal = TP.core.CDATASectionNode.construct(
        cdataSectionNodeVal);
    //  Instance of TP.core.ProcessingInstructionNode
    tibetPINodeVal = TP.core.ProcessingInstructionNode.construct(piNodeVal);
    //  Instance of TP.core.CommentNode
    tibetCommentNodeVal = TP.core.CommentNode.construct(commentNodeVal);

    //  Instance of TP.core.SimpleTIBETPath
    tibetSimpleTIBETPathVal = TP.core.SimpleTIBETPath.construct('foo');
    //  Instance of TP.core.ComplexTIBETPath
    tibetComplexTIBETPathVal = TP.core.ComplexTIBETPath.construct('foo.bar.baz');
    //  Instance of TP.core.ElementPath
    tibetElementPathVal = TP.core.ElementPath.construct('/1/2');
    //  Instance of TP.core.XTensionPath
    tibetXTensionPathVal = TP.core.XTensionPath.construct('*[foo]');
    //  Instance of TP.core.XPathPath
    tibetXPathVal = TP.core.XPathPath.construct('//*');

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

    //  Instance of TP.core.TIBETURN
    tibetTIBETURNVal = TP.uc('urn:tibet:foo');
    //  Instance of TP.core.HTTPURL
    tibetHTTPURLVal = TP.uc('http://www.blah.com');
    //  Instance of TP.core.FileURL
    tibetFileURLVal = TP.uc('file:///goo.txt');
    /* eslint-disable no-script-url */
    //  Instance of TP.core.JSURL
    tibetJSURIVal = TP.uc('javascript:alert("hi")');
    /* eslint-enable no-script-url */
    //  Instance of TP.core.WSURL
    tibetWSURLVal = TP.uc('ws://ws.blah.com');
    //  Instance of TP.core.TIBETURL
    tibetTIBETURLVal = TP.uc('tibet://top/file:///goo.txt');
    //  Instance of TP.core.CookieURL
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

    tibetTypeVal = TP.ac(TP.meta.core.Node, TP.lang.Object, TP.lang.RootObject, Object);

    tibetObjectVal = TP.ac(TP.lang.Object, TP.lang.RootObject, Object);

    tibetHashVal = TP.ac(TP.core.Hash, TP.lang.Object, TP.lang.RootObject, Object);

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
        'HTMLDocument',                         'TP.core.HTMLDocumentNode',
        'HTMLElement',                          'TP.html.body',

        'XMLDocument',                          'TP.core.XMLDocumentNode',
        'XMLElement',                           'TP.core.XMLElementNode',

        'AttributeNode',                        'TP.core.AttributeNode',
        'TextNode',                             'TP.core.TextNode',
        'CDATASectionNode',                     'TP.core.CDATASectionNode',
        'PINode',                               'TP.core.ProcessingInstructionNode',
        'CommentNode',                          'TP.core.CommentNode',
        'DocumentFragmentNode',                 'TP.core.DocumentFragmentNode',

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
        'TP.core.HTMLDocumentNode',             TP.IDENTITY,
        'TP.core.HTMLElementNode',              TP.IDENTITY,

        'TP.core.XMLDocumentNode',              TP.IDENTITY,
        'TP.core.XMLElementNode',               TP.IDENTITY,

        'TP.core.DocumentFragmentNode',         TP.IDENTITY,
        'TP.core.AttributeNode',                TP.IDENTITY,
        'TP.core.TextNode',                     TP.IDENTITY,
        'TP.core.CDATASectionNode',             TP.IDENTITY,
        'TP.core.ProcessingInstructionNode',    TP.IDENTITY,
        'TP.core.CommentNode',                  TP.IDENTITY,

        'TP.core.SimpleTIBETPath',              TP.IDENTITY,
        'TP.core.ComplexTIBETPath',             TP.IDENTITY,
        'TP.core.ElementPath',                  TP.IDENTITY,
        'TP.core.XTensionPath',                 TP.IDENTITY,
        'TP.core.XPathPath',                    TP.IDENTITY,

        'TP.sig.Request',                       TP.IDENTITY,
        'TP.sig.Response',                      TP.IDENTITY,

        'TP.core.TIBETURN',                     TP.IDENTITY,
        'TP.core.HTTPURL',                      TP.IDENTITY,
        'TP.core.FileURL',                      TP.IDENTITY,
        'TP.core.JSURI',                        TP.IDENTITY,
        'TP.core.WSURL',                        TP.IDENTITY,
        'TP.core.TIBETURL',                     TP.IDENTITY,
        'TP.core.CookieURL',                    TP.IDENTITY,

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
        'TP.core.HTMLDocumentNode',             'HTMLDocument',
        'TP.core.HTMLElementNode',              'HTMLBodyElement',

        'TP.core.XMLDocumentNode',              'XMLDocument',
        'TP.core.XMLElementNode',               'Element',

        'TP.core.DocumentFragmentNode',         'DocumentFragment',
        'TP.core.AttributeNode',                'Attr',
        'TP.core.TextNode',                     'Text',
        'TP.core.CDATASectionNode',             'CDATASection',
        'TP.core.ProcessingInstructionNode',    'ProcessingInstruction',
        'TP.core.CommentNode',                  'Comment',

        'TP.core.SimpleTIBETPath',              TP.IDENTITY,
        'TP.core.ComplexTIBETPath',             TP.IDENTITY,
        'TP.core.ElementPath',                  TP.IDENTITY,
        'TP.core.XTensionPath',                 TP.IDENTITY,
        'TP.core.XPathPath',                    TP.IDENTITY,

        'TP.sig.Request',                       TP.IDENTITY,
        'TP.sig.Response',                      TP.IDENTITY,

        'TP.core.TIBETURN',                     'String',
        'TP.core.HTTPURL',                      'String',
        'TP.core.FileURL',                      'String',
        'TP.core.JSURI',                        'String',
        'TP.core.WSURL',                        'String',
        'TP.core.TIBETURL',                     'String',
        'TP.core.CookieURL',                    'String',

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
        'TP.core.HTMLDocumentNode',             /([\s\S]+)/,
        'TP.core.HTMLElementNode',              /([\s\S]+)/,

        'TP.core.XMLDocumentNode',              'Hi there<boo><goo/></boo><moo/>',
        'TP.core.XMLElementNode',               'bar',

        'TP.core.DocumentFragmentNode',         /<foo([\s\S]*)\/><bar([\s\S]*)\/>/,
        'TP.core.AttributeNode',                'bar',
        'TP.core.TextNode',                     'foo',
        'TP.core.CDATASectionNode',             'foo',
        'TP.core.ProcessingInstructionNode',    'bar',
        'TP.core.CommentNode',                  'foo',

        'TP.core.SimpleTIBETPath',              TP.IDENTITY,
        'TP.core.ComplexTIBETPath',             TP.IDENTITY,
        'TP.core.ElementPath',                  TP.IDENTITY,
        'TP.core.XTensionPath',                 TP.IDENTITY,
        'TP.core.XPathPath',                    TP.IDENTITY,

        'TP.sig.Request',                       TP.IDENTITY,
        'TP.sig.Response',                      'baz',

        'TP.core.TIBETURN',                     TP.IDENTITY,
        'TP.core.HTTPURL',                      TP.IDENTITY,
        'TP.core.FileURL',                      TP.IDENTITY,
        'TP.core.JSURI',                        TP.IDENTITY,
        'TP.core.WSURL',                        TP.IDENTITY,
        'TP.core.TIBETURL',                     TP.IDENTITY,
        'TP.core.CookieURL',                    TP.IDENTITY,

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
