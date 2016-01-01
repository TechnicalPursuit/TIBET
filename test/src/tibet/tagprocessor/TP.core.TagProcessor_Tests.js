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
        tagType.Type.defineMethod('allNodesTransform', function(aRequest) {
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
                    newElem = TP.documentConstructElement(
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
                        newElem = TP.documentConstructElement(
                                                TP.nodeGetDocument(node),
                                                'div',
                                                TP.w3.Xmlns.XHTML);
                        TP.elementSetAttribute(
                                newElem, 'tibet:tag',
                                'test:morecontentchange',
                                'true');
                        TP.elementSetAttribute(
                                newElem, 'donttransform',
                                'true');
                        TP.elementSetAttribute(
                                newElem, 'allNodesMark2',
                                'true');

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

    switch (options) {
        case 'allNodes':
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

    var testDataLoc;

    testDataLoc = '~lib_test/src/tibet/tagprocessor/testmarkup.xml';

    //  ---

    this.after(
        function() {

            //  Unregister the URI to avoid a memory leak (this will also
            //  unregister the 'sub URIs' that we create here).
            TP.uc(testDataLoc).unregister();
        });

    //  ---

    this.it('\'all nodes\' - no mutation', function(test, options) {

        var loadURI;

        loadURI = TP.uc(testDataLoc + '#nochange');

        test.getDriver().fetchResource(loadURI, TP.DOM).then(
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
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - attribute mutation', function(test, options) {

        var loadURI;

        loadURI = TP.uc(testDataLoc + '#attrchange');

        test.getDriver().fetchResource(loadURI, TP.DOM).then(
            function(result) {
                var processor;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.hasAttribute(result, 'allNodesMark');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - more attribute mutation', function(test, options) {

        var loadURI;

        loadURI = TP.uc(testDataLoc + '#moreattrchange');

        test.getDriver().fetchResource(loadURI, TP.DOM).then(
            function(result) {
                var processor;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.hasAttribute(result, 'allNodesMark');
                test.assert.hasAttribute(result, 'allNodesMark2');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - content mutation', function(test, options) {

        var loadURI;

        loadURI = TP.uc(testDataLoc + '#contentchange');

        test.getDriver().fetchResource(loadURI, TP.DOM).then(
            function(result) {
                var processor;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.isXMLNode(result.firstElementChild);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - more content mutation', function(test, options) {

        var loadURI;

        loadURI = TP.uc(testDataLoc + '#morecontentchange');

        test.getDriver().fetchResource(loadURI, TP.DOM).then(
            function(result) {
                var processor;

                processor = TP.core.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.hasAttribute(result, 'allNodesMark');

                test.assert.isXMLNode(result.firstElementChild);
                test.assert.hasAttribute(result.firstElementChild, 'allNodesMark2');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------

TP.core.TagProcessor.Inst.describe('TP.core.TagProcessor Inst core functionality suite',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function() {
            this.getDriver().showTestLog();
        });

    //  ---

    this.afterEach(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('XML Base processing', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/XMLBaseTest1.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext;

                windowContext = test.getDriver().get('windowContext');

                //  Note that these paths on these elements aren't real - we're
                //  not really interested in that. What we're interested in is
                //  whether the path got computed properly. Note that the reason
                //  we actually set the 'src' attribute on an '<img>' tag is
                //  that we still need it to be an attribute that TIBET thinks
                //  needs to be processed (see the 'TP.html.img' tag type and it
                //  'uriAttrs' attribute).

                test.assert.isElement(TP.byId('area1', windowContext, false));
                test.assert.isAttributeEqualTo(
                    TP.byId('area1', windowContext, false),
                    'href',
                    'file:///usr/local/src/TIBET/base/lib/tibet/img/area1.gif');

                test.assert.isAttributeEqualTo(
                    TP.byId('area2', windowContext, false),
                    'href',
                    TP.uc('~tibet/base/lib/tibet/img/area2.gif').getLocation());

                test.assert.isAttributeEqualTo(
                    TP.byId('area3', windowContext, false),
                    'href',
                    TP.uc('~tibet/base/lib/tibet/img/../area3.gif').getLocation());

                test.assert.isAttributeEqualTo(
                    TP.byId('area4', windowContext, false),
                    'href',
                    TP.uc('~tibet/base/lib/tibet/img/area4.gif').getLocation());
            });
    });

    this.it('TIBET stylesheet PI processing - single level', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/EmbedXSL1.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var elem,
                    tpElem;

                elem = TP.byId('colorizedSpan',
                                test.getDriver().get('windowContext'),
                                false);
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
});

//  ========================================================================
//  XInclude
//  ========================================================================

TP.xi.Element.Type.describe('TP.xi.Element Type processing',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.afterEach(
        function() {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('whole file inclusion', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/XInclude1.xml');

        test.getDriver().fetchResource(loadURI, TP.DOM).then(
            function(result) {

                var usingDebugger,
                    oldLogLevel,

                    tpDoc,

                    server,
                    loc;

                //  For now, we turn off triggering the debugger because we know
                //  that this test case has a XInclude that points to a file
                //  that won't be found - that part of this test is testing
                //  'xi:fallback' element.
                usingDebugger = TP.sys.shouldUseDebugger();
                TP.sys.shouldUseDebugger(false);

                //  Same for log level
                oldLogLevel = TP.getLogLevel();
                TP.setLogLevel(TP.SEVERE);

                tpDoc = TP.sys.getUICanvas().getDocument();

                //  NB: These calls use a synchronous XHR, so we don't need a
                //  'server.respond()' call below.

                server = TP.test.fakeServer.create();

                loc = TP.uc('~lib_test/src/tibet/tagprocessor/XIncludePart10.xml').getConcreteURI().get('path');
                if (loc.charAt(0) !== '/') {
                    loc = '/' + loc;
                }

                server.respondWith(
                    TP.HTTP_GET,
                    loc,
                    [
                        404,
                        {},
                        ''
                    ]);

                server.xhr.filters = [];
                server.xhr.useFilters = true;
                server.xhr.addFilter(
                        function(method, url) {
                            var testMatcher;

                            testMatcher = new RegExp(TP.regExpEscape(loc));

                            return !testMatcher.test(url);
                        });

                test.thenPromise(
                        function(resolver, rejector) {

                            var request;

                            request = TP.request();
                            request.atPut(TP.ONLOAD, resolver);
                            request.atPut(TP.ONFAIL, rejector);

                            tpDoc.setContent(result, request);
                        });

                test.then(
                    function() {

                        var windowContext;

                        windowContext = test.getDriver().get('windowContext');

                        //  Put log level back to what it was
                        TP.setLogLevel(oldLogLevel);

                        //  Put the debugger setting back to what it was
                        TP.sys.shouldUseDebugger(usingDebugger);

                        test.assert.isElement(
                            TP.byId('part1Success', windowContext, false));

                        test.assert.isElement(
                            TP.byId('part10Fallback', windowContext, false));

                        server.restore();
                        server.xhr.filters = [];
                        server.xhr.useFilters = false;
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    }).skip(TP.sys.cfg('boot.context') === 'phantomjs');//  Crashes on PhantomJS

    this.it('partial file inclusion', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/XInclude2.xml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function() {

                var windowContext;

                windowContext = test.getDriver().get('windowContext');

                //  This comes from the first XInclude with a simple XPointer
                //  expression
                test.assert.isElement(
                    TP.byId('partialDiv', windowContext, false));

                //  This comes from the second XInclude with a more complex
                //  XPointer expression.
                test.assert.isElement(
                    TP.byId('partialParagraph', windowContext, false));
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
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
