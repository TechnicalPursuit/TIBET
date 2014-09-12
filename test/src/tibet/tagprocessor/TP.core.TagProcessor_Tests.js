//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  Tag Processor Fixture Builder
//  ========================================================================

TP.lang.Object.defineSubtype('core.TagProcessorFixtureBuilder');

//  ------------------------------------------------------------------------
//  Test Tag Types
//  ------------------------------------------------------------------------

TP.core.TagProcessorFixtureBuilder.Type.defineMethod(
'buildNoChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.nochange'))) {
        tagType = TP.core.ElementNode.defineSubtype('test.nochange');
        tagType.Type.defineMethod(
            'allNodesTransform',
            function(aRequest) {
                //  This method does nothing on this tag type
            });
    }

    return tagType;
});

//  ------------------------------------------------------------------------

TP.core.TagProcessorFixtureBuilder.Type.defineMethod(
'buildAttrChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.attrchange'))) {
        tagType = TP.core.ElementNode.defineSubtype('test.attrchange');
        tagType.Type.defineMethod(
            'allNodesTransform',
            function(aRequest) {
                var node;

                if (TP.isElement(node = aRequest.at('node'))) {
                    TP.elementSetAttribute(node, 'allNodesMark', 'true');
                }
            });
    }

    return tagType;
});

//  ------------------------------------------------------------------------

TP.core.TagProcessorFixtureBuilder.Type.defineMethod(
'buildMoreAttrChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.moreattrchange'))) {
        tagType = TP.core.ElementNode.defineSubtype('test.moreattrchange');
        tagType.Type.defineMethod(
            'allNodesTransform',
            function(aRequest) {
                var node;

                if (TP.isElement(node = aRequest.at('node'))) {
                    TP.elementSetAttribute(node, 'allNodesMark', 'true');
                    if (!TP.elementHasAttribute(node, 'donttransform')) {
                        TP.elementSetAttribute(node, 'allNodesMark2', 'true');
                        TP.elementSetAttribute(node, 'donttransform', 'true');
                    }
                }
            });
    }

    return tagType;
});

//  ------------------------------------------------------------------------

TP.core.TagProcessorFixtureBuilder.Type.defineMethod(
'buildContentChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.contentchange'))) {
        tagType = TP.core.ElementNode.defineSubtype('test.contentchange');
        tagType.Type.defineMethod(
            'allNodesTransform',
            function(aRequest) {
                var node,
                    newElem;

                if (TP.isElement(node = aRequest.at('node'))) {
                    newElem = TP.documentCreateElement(
                                            TP.nodeGetDocument(node),
                                            'div',
                                            TP.w3.Xmlns.XHTML);
                    TP.nodeAppendChild(node, newElem, false);
                }
            });
    }

    return tagType;
});

//  ------------------------------------------------------------------------

TP.core.TagProcessorFixtureBuilder.Type.defineMethod(
'buildMoreContentChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.morecontentchange'))) {
        tagType = TP.core.ElementNode.defineSubtype('test.morecontentchange');
        tagType.Type.defineMethod(
            'allNodesTransform',
            function(aRequest) {
                var node,
                    newElem;

                if (TP.isElement(node = aRequest.at('node'))) {
                    TP.elementSetAttribute(node, 'allNodesMark', 'true');
                    if (!TP.elementHasAttribute(node, 'donttransform')) {
                        newElem = TP.documentCreateElement(
                                                TP.nodeGetDocument(node),
                                                'div',
                                                TP.w3.Xmlns.XHTML);
                        TP.elementSetAttribute(
                                newElem, 'tibet:sourcetag',
                                'test:morecontentchange', 'true');
                        TP.elementSetAttribute(
                                newElem, 'donttransform', 'true');
                        TP.elementSetAttribute(
                                newElem, 'allNodesMark2', 'true');

                        TP.nodeAppendChild(node, newElem, false);

                        return newElem;
                    }
                }
            });
    }

    return tagType;
});

//  ------------------------------------------------------------------------
//  Test Phases
//  ------------------------------------------------------------------------

TP.core.TagProcessorFixtureBuilder.Type.defineMethod(
'buildAllNodesPhase',
function() {

    var phaseType;

    if (!TP.isType(phaseType = TP.sys.getTypeByName('TP.test.AllNodesPhase'))) {
        phaseType = TP.core.TagProcessorPhase.defineSubtype('test.AllNodesPhase');
        phaseType.Inst.defineMethod(
            'getTargetMethod',
            function() {
                return 'allNodesTransform';
            });
    }

    return phaseType;
});

//  ------------------------------------------------------------------------
//  Test Processors
//  ------------------------------------------------------------------------

TP.core.TagProcessorFixtureBuilder.Type.defineMethod(
'buildAllNodesProcessor',
function() {
    var processor;

    this.buildNoChangeTagType();
    this.buildAttrChangeTagType();
    this.buildMoreAttrChangeTagType();
    this.buildContentChangeTagType();
    this.buildMoreContentChangeTagType();

    this.buildAllNodesPhase();

    processor = TP.core.TagProcessor.construct();

    processor.set('phases', TP.ac(TP.test.AllNodesPhase.construct()));

    return processor;
});

//  ------------------------------------------------------------------------
//  TagProcessor Fixture
//  ------------------------------------------------------------------------

TP.core.TagProcessor.Type.defineMethod('getTestFixture',
function(options) {

    switch(options) {
        case    'allNodes':
            return TP.core.TagProcessorFixtureBuilder.buildAllNodesProcessor();
        default:
            return null;
    }
});

//  ========================================================================
//  Test Suite
//  ========================================================================

TP.core.TagProcessor.Inst.describe('TP.core.TagProcessor Inst all nodes suite',
function() {

    var testDataLoc,
        server;

    testDataLoc = '~lib_tst/src/tibet/tagprocessor/testmarkup.xml';

    this.before(
        function() {
            var locStr1,
                result1;

            server = TP.test.fakeServer.create();

            locStr1 = 'tagprocessor/testmarkup.xml';

            result1 = '<div xmlns="http://www.w3.org/1999/xhtml" xmlns:tibet="http://www.technicalpursuit.com/1999/tibet" xmlns:xctrls="http://www.technicalpursuit.com/2005/xcontrols" xmlns:pclass="urn:tibet:pseudoclass"><div id="nochange" tibet:sourcetag="test:nochange">An unchanging tag</div><div id="attrchange" tibet:sourcetag="test:attrchange">A tag that gets a new attribute</div><div id="moreattrchange" tibet:sourcetag="test:moreattrchange">A tag that gets a new attribute (that needs further transformation)</div><div id="contentchange" tibet:sourcetag="test:contentchange">A tag that gets new child content (that doesn\'t need further transformation)</div><div id="morecontentchange" tibet:sourcetag="test:morecontentchange">A tag that gets new child content (that needs further transformation)</div></div>';

            server.respondWith(
                TP.HTTP_GET,
                locStr1,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result1,
                ]);
        });

    this.it('\'all nodes\' - no mutation', function(test, options) {

        var uri;

        uri = TP.uc(testDataLoc + '#nochange');

        this.getDriver().fetchResource(uri, TP.DOM);
        server.respond();

        this.then(
            function(result) {
                var processor,

                    beforeStr,
                    afterStr;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                //  Capture the String representation before we process it
                beforeStr = TP.str(result);

                processor.processTree(result);

                //  Capture the String representation after we process it
                afterStr = TP.str(result);

                test.assert.isEqualTo(beforeStr, afterStr);
                test.pass();
            },
            function(error) {
                TP.sys.logTest('Couldn\'t get resource: ' + testDataLoc,
                                TP.ERROR);
                test.fail();
            });
    });

    this.it('\'all nodes\' - attribute mutation', function(test, options) {

        var uri;

        uri = TP.uc(testDataLoc + '#attrchange');

        this.getDriver().fetchResource(uri, TP.DOM);
        server.respond();

        this.then(
            function(result) {
                var processor;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.hasAttribute(result, 'allNodesMark');
                test.pass();
            },
            function(error) {
                console.log('couldnt get data');
                test.fail();
            });
    });

    this.it('\'all nodes\' - more attribute mutation', function(test, options) {

        var uri;

        uri = TP.uc(testDataLoc + '#moreattrchange');

        this.getDriver().fetchResource(uri, TP.DOM);
        server.respond();

        this.then(
            function(result) {
                var processor;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.hasAttribute(result, 'allNodesMark');
                test.assert.hasAttribute(result, 'allNodesMark2');

                test.pass();
            },
            function(error) {
                console.log('couldnt get data');
                test.fail();
            });
    });

    this.it('\'all nodes\' - content mutation', function(test, options) {

        var uri;

        uri = TP.uc(testDataLoc + '#contentchange');

        this.getDriver().fetchResource(uri, TP.DOM);
        server.respond();

        this.then(
            function(result) {
                var processor;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.isXMLNode(result.firstElementChild);

                test.pass();
            },
            function(error) {
                console.log('couldnt get data');
                test.fail();
            });
    });

    this.it('\'all nodes\' - more content mutation', function(test, options) {

        var uri;

        uri = TP.uc(testDataLoc + '#morecontentchange');

        this.getDriver().fetchResource(uri, TP.DOM);
        server.respond();

        this.then(
            function(result) {
                var processor;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.hasAttribute(result, 'allNodesMark');

                test.assert.isXMLNode(result.firstElementChild);
                test.assert.hasAttribute(result.firstElementChild, 'allNodesMark2');

                test.pass();
            },
            function(error) {
                console.log('couldnt get data');
                test.fail();
            });
    });

    //  ---

    this.after(
        function() {
            server.restore();
        });
});

//  ------------------------------------------------------------------------

TP.core.TagProcessor.Inst.describe('TP.core.TagProcessor Inst core functionality suite',
function() {

    var testDataLoc,
        server;

    testDataLoc = '~lib_tst/src/tibet/tagprocessor/XMLBaseTest1.xml';

    this.before(
        function() {
            var locStr1,
                result1,

                locStr2,
                result2,

                locStr3,
                result3,

                locStr4,
                result4,

                locStr5,
                result5;

            server = TP.test.fakeServer.create();

            locStr1 = 'tagprocessor/XMLBaseTest1.xml';

            result1 ='<?xml version="1.0"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:base="~tibet"><head><title></title><script type="text/javascript" src="~lib_lib/src/tibet_hook.min.js"></script><link type="text/css" rel="stylesheet" href="~lib_lib/css/tibet.css"/></head><body xml:base="base/lib/tibet/img/">We\'re testing XML Base here.<br/><br/>NOTE: These paths don\'t resolve to anything real. Don\'t expect this document to render with real content.<br/><br/>Testing full absolute path:<br/><br/><img id="image1" src="file:///usr/local/src/TIBET/base/lib/tibet/img/tibet_logo_369.gif"/><br/><br/>Testing relative path derived from nested values on both &lt;body&gt; and &lt;html&gt; elements (note that the &lt;html&gt; element uses a virtual URI):<br/>A path with a local reference (won\'t show anything)<img id="image2" src="tibet_logo_369.gif"/><br/><br/>A path with reference "up" the tree (won\'t show anything)<img id="image3" src="../tibet_logo_369.gif"/><br/><br/>Testing relative path derived from parent element which redefines absolute base (and does that by using a virtual URI).<span xml:base="~tibet/base/lib/tibet/img/"><img id="image4" src="./tibet_logo_369.gif"/></span></body></html>';

           server.respondWith(
                TP.HTTP_GET,
                locStr1,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result1,
                ]);

            locStr2 = 'tagprocessor/EmbedXSL1.xml';
            result2 = '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><?tibet-stylesheet type="text/xsl" href="EmbedXSLStylesheet1.xsl"?><head><title></title><script type="text/javascript" src="~lib_lib/src/tibet_hook.min.js"></script><link type="text/css" rel="stylesheet" href="~lib_lib/css/tibet.css"/><style type="text/css"><![CDATA[ body { background-color: #FFFFFF; } table { width: 100%; height: 75%; border: none; } table td { padding: 0px; } ]]></style></head><body><h2>Embedded XSLT Test #1</h2><br/><br/><br/>This test ensures that any XSLT stylesheets that are part of this document and are used to \'locally\' transform this document into another are operating properly.<br/>This document imports an XSLT stylesheet that makes the \'h3\' element below into a \'span\' with a blue background that wraps the descendant content of the \'h3\'.<br/>See the \'EmbedXSLStylesheet1.xsl\' file to see the transformation<br/><table cellspacing="0"><tr><td align="center"><h3>This is inside a table cell</h3></td></tr></table></body></html>';

           server.respondWith(
                TP.HTTP_GET,
                locStr2,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result2,
                ]);

            locStr3 = 'tagprocessor/EmbedXSLStylesheet1.xsl';
            result3 = '<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"><xsl:output method="xml" indent="yes" /><!-- The \'identity transformation\', which copies all nodes and attributes to the output --><xsl:template match="@*|node()"><xsl:copy><xsl:apply-templates select="@*|node()"/></xsl:copy></xsl:template><!-- Look for elements named \'h3\' and replace them with a \'span\' that has a blue background wrapping the descendants contents of the \'h3\' --><xsl:template match="//*[name(.) = \'h3\']"><span xmlns="http://www.w3.org/1999/xhtml" id="colorizedSpan" style="background-color: blue">This content is from the span and everything should have a background of blue.<xsl:apply-templates select="@*|node()"/></span></xsl:template></xsl:stylesheet>';

           server.respondWith(
                TP.HTTP_GET,
                locStr3,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result3,
                ]);

            locStr4 = 'tagprocessor/EmbedXSL2.xml';
            result4 = '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><?tibet-stylesheet type="text/xsl" href="EmbedXSLStylesheet1.xsl"?><?tibet-stylesheet type="text/xsl" href="EmbedXSLStylesheet2.xsl"?><head><title></title><script type="text/javascript" src="~lib_lib/src/tibet_hook.min.js"></script><link type="text/css" rel="stylesheet" href="~lib_lib/css/tibet.css"/><style type="text/css"><![CDATA[ body { background-color: #FFFFFF; } table { width: 100%; height: 75%; border: none; } table td { padding: 0px; } ]]></style></head><body><h2>Embedded XSLT Test #2</h2><br/><br/><br/>This test ensures that any XSLT stylesheets that are part of this document and are used to \'locally\' transform this document into another are operating properly.<br/>This document imports an XSLT stylesheet that makes the \'h3\' element below into a \'span\' with a blue background that wraps the descendant content of the \'h3\'.<br/>It then imports an XSLT stylesheet that makes wraps any found \'spans\' with another span that makes the text color red.<br/>See the \'EmbedXSLStylesheet1.xsl\' and \'EmbedXSLStylesheet2.xsl\' files to see the transformation<br/><table cellspacing="0"><tr><td align="center"><h3>This is inside a table cell</h3></td></tr></table></body></html>';

           server.respondWith(
                TP.HTTP_GET,
                locStr4,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result4,
                ]);

            locStr5 = 'tagprocessor/EmbedXSLStylesheet2.xsl';
            result5 = '<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"><xsl:output method="xml" indent="yes" /><!-- The \'identity transformation\', which copies all nodes and attributes to the output --><xsl:template match="@*|node()"><xsl:copy><xsl:apply-templates select="@*|node()"/></xsl:copy></xsl:template><!-- Look for elements named \'span\' and wrap them with a \'span\' that has a red text color and whatever other attributes the \'span\' had. --><xsl:template match="//*[name(.) = \'span\']"><span xmlns="http://www.w3.org/1999/xhtml" style="color: red"><xsl:copy><xsl:copy-of select="@*"/><xsl:apply-templates select="@*|node()"/></xsl:copy></span></xsl:template></xsl:stylesheet>';

           server.respondWith(
                TP.HTTP_GET,
                locStr5,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result5,
                ]);
        });

    this.it('XML Base processing', function(test, options) {

        var uri;

        uri = TP.uc('~lib_tst/src/tibet/tagprocessor/XMLBaseTest1.xml');

        this.getDriver().setLocation(uri);

        server.respond();

        this.then(
            function(result) {

                //  Note that these paths on these elements aren't real - we're
                //  not really interested in that. What we're interested in is
                //  whether the path got computed properly. Note that the reason
                //  we actually set the 'src' attribute on an '<img>' tag is
                //  that we still need it to be an attribute that TIBET thinks
                //  needs to be processed (see the 'TP.html.img' tag type and it
                //  'uriAttrs' attribute).

                test.assert.isElement(TP.byId('image1'));
                test.assert.isAttributeEqualTo(
                    TP.byId('image1'),
                    'src',
                    'file:///usr/local/src/TIBET/base/lib/tibet/img/tibet_logo_369.gif');

                test.assert.isAttributeEqualTo(
                    TP.byId('image2'),
                    'src',
                    TP.uc('~tibet/base/lib/tibet/img/tibet_logo_369.gif').getLocation());

                test.assert.isAttributeEqualTo(
                    TP.byId('image3'),
                    'src',
                    TP.uc('~tibet/base/lib/tibet/img/../tibet_logo_369.gif').getLocation());

                test.assert.isAttributeEqualTo(
                    TP.byId('image4'),
                    'src',
                    TP.uc('~tibet/base/lib/tibet/img/tibet_logo_369.gif').getLocation());
            });
    });

    this.it('TIBET stylesheet PI processing - single level', function(test, options) {

        var uri;

        uri = TP.uc('~lib_tst/src/tibet/tagprocessor/EmbedXSL1.xml');

        this.getDriver().setLocation(uri);

        this.then(
            function(result) {

                var elem,
                    tpElem;

                elem = TP.byId('colorizedSpan');
                test.assert.isElement(elem);

                tpElem = TP.wrap(elem);

                //  NB: We convert this into a TP.core.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        tpElem.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('blue'));
            });
    }).skip(TP.sys.cfg('boot.context') === 'phantomjs');

    this.it('TIBET stylesheet PI processing - multi level', function(test, options) {

        var uri;

        uri = TP.uc('~lib_tst/src/tibet/tagprocessor/EmbedXSL2.xml');

        this.getDriver().setLocation(uri);

        this.then(
            function(result) {

                var elem,
                    tpElem;

                elem = TP.byId('colorizedSpan');
                test.assert.isElement(elem);

                tpElem = TP.wrap(elem);

                //  NB: We convert these into TP.core.Color objects to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        tpElem.getComputedStyleProperty('backgroundColor')),
                    TP.core.Color.fromString('blue'));

                test.assert.isEqualTo(
                    TP.core.Color.fromString(
                        tpElem.getComputedStyleProperty('color')),
                    TP.core.Color.fromString('red'));
            });
    }).skip(TP.sys.cfg('boot.context') === 'phantomjs');

    //  ---

    this.after(
        function() {
            server.restore();
        });
});

//  ========================================================================
//  XInclude
//  ========================================================================

TP.xi.Element.Type.describe('TP.xi.Element Type processing',
function() {

    var server;

    this.before(
        function() {
            var locStr1,
                result1,

                locStr2,
                result2,

                locStr3,
                result3,

                locStr4,
                result4,

                locStr5,
                result5;

            server = TP.test.fakeServer.create();

            locStr1 = 'tagprocessor/XInclude1.xml';

            result1 = '<?xml version="1.0"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title></title><script type="text/javascript" src="~lib_lib/src/tibet_hook.min.js"></script><link type="text/css" rel="stylesheet" href="~lib_lib/css/tibet.css"/></head><body xmlns:xi="http://www.w3.org/2001/XInclude"><h2>XInclude Test #1</h2><br/><br/><br/>This test ensures that the XInclude processing is working properly.<br/>It tests \'simple\' XInclude tags, that is XIncludes that will include the entire content of their href URI when encountered:<br/><br/><br/>&lt;xi:include href="XIncludePart1.xml"&lt;/xi:include&gt;<br/><br/><br/>This is an inclusion of the \'Part 1\' file:<br/><br/><xi:include href="XIncludePart1.xml"><xi:fallback>Couldn\'t get Part #1. Shouldn\'t get here.</xi:fallback></xi:include><br/><br/>This is an inclusion of the \'Part 10\' file (which won\'t exist so we\'ll get fallback behavior):<br/><br/><xi:include href="XIncludePart10.xml"><xi:fallback><span id="part10Fallback">Couldn\'t get Part #1. Shouldn\'t get here.</span></xi:fallback></xi:include></body></html>';

            server.respondWith(
                TP.HTTP_GET,
                locStr1,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result1,
                ]);

            locStr2 = 'tagprocessor/XIncludePart1.xml';

            result2 = '<?xml version="1.0"?><span xmlns="http://www.w3.org/1999/xhtml" id="part1Success">This is content in an included file.<br/></span>';

            server.respondWith(
                TP.HTTP_GET,
                locStr2,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result2,
                ]);

            locStr3 = 'tagprocessor/XIncludePart10.xml';

            result3 = '';

            server.respondWith(
                TP.HTTP_GET,
                locStr3,
                [
                    404,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result2,
                ]);

            locStr4 = 'tagprocessor/XInclude2.xml';

            result4 = '<?xml version="1.0"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title></title><script type="text/javascript" src="~lib_lib/src/tibet_hook.js"></script><link type="text/css" rel="stylesheet" href="~lib_lib/css/tibet.css"/></head><body xmlns:xi="http://www.w3.org/2001/XInclude"><h2>XInclude Test #2</h2><br/><br/><br/>This test ensures that the XInclude processing is working properly.<br/>It tests \'partial\' XInclude tags, that is XIncludes that will include only a portion of the content of their href URI when encountered. XPointer syntax is used to extract a portion of the content:<br/><br/><br/>Here is an example of using \'id\'s (i.e. XPointer \'bare name\' syntax):<br/>&lt;xi:include href="XIncludePart2.xml" xpointer="partialDiv"&gt;&lt;/xi:include&gt;<br/><br/><xi:include href="XIncludePart2.xml" xpointer="partialDiv"><xi:fallback>Couldn\'t get Part #2. Shouldn\'t get here.</xi:fallback></xi:include><br/><br/>Here is an example of using XPath syntax (i.e. utilizing the xpointer() function):<br/>&lt;xi:include href="XIncludePart2.xml" xpointer="xpointer(//*[name() = \'p\'])"&gt;&lt;/xi:include&gt;<br/><br/><xi:include href="XIncludePart2.xml" xpointer="xpointer(//*[name() = \'p\'])"><xi:fallback>Couldn\'t get Part #2. Shouldn\'t get here.</xi:fallback></xi:include></body></html>';

            server.respondWith(
                TP.HTTP_GET,
                locStr4,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result4,
                ]);

            locStr5 = 'tagprocessor/XIncludePart2.xml';

            result5 = '<?xml version="1.0"?><span xmlns="http://www.w3.org/1999/xhtml">This is content coming from an included file.<br/><div id="partialDiv">This is the content that will be included in the first include. It should be a \'div\'.</div><div><p id="partialParagraph">This is the content that will be include in the second include. It should be a \'p\'.</p></div></span>';

            server.respondWith(
                TP.HTTP_GET,
                locStr5,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    result5,
                ]);
        });

    this.it('whole file inclusion', function(test, options) {

        var uri;

        uri = TP.uc('~lib_tst/src/tibet/tagprocessor/XInclude1.xml');

        this.getDriver().fetchResource(uri, TP.DOM);

        server.respond();

        this.then(
            function(result) {

                var usingDebugger,
                    oldLogLevel,

                    tpDoc;

                //  For now, we turn off triggering the debugger because we know
                //  that this test case has a XInclude that points to a file
                //  that won't be found - that part of this test is testing
                //  'xi:fallback' element.
                usingDebugger = TP.sys.shouldUseDebugger();
                TP.sys.shouldUseDebugger(false);

                //  Same for log level
                oldLogLevel = TP.sys.getLogLevel();
                TP.sys.setLogLevel(TP.SEVERE, true);

                tpDoc = TP.sys.getUICanvas().getDocument();

                tpDoc.setContent(result);

                //  Put log level back to what it was
                TP.sys.setLogLevel(oldLogLevel, true);

                //  Put the debugger setting back to what it was
                TP.sys.shouldUseDebugger(usingDebugger);

                test.assert.isElement(TP.byId('part1Success'));

                test.assert.isElement(TP.byId('part10Fallback'));
            },
            function(error) {
                TP.sys.logTest('Couldn\'t get resource: ' + uri.getLocation(),
                                TP.ERROR);
                test.fail();
            });
    });

    this.it('partial file inclusion', function(test, options) {

        var uri;

        uri = TP.uc('~lib_tst/src/tibet/tagprocessor/XInclude2.xml');

        this.getDriver().setLocation(uri);

        server.respond();

        this.then(
            function(result) {

                //  This comes from the first XInclude with a simple XPointer
                //  expression
                test.assert.isElement(TP.byId('partialDiv'));

                //  This comes from the second XInclude with a more complex
                //  XPointer expression.
                test.assert.isElement(TP.byId('partialParagraph'));
            },
            function(error) {
                TP.sys.logTest('Couldn\'t get resource: ' + uri.getLocation(),
                                TP.ERROR);
                test.fail();
            });
    });

    //  ---

    this.after(
        function() {
            server.restore();
        });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.TagProcessor.Inst.runTestSuites();
TP.xi.Element.Type.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
