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

TP.lang.Object.defineSubtype('tag.TagProcessorFixtureBuilder');

//  ------------------------------------------------------------------------
//  Test Tag Types
//  ------------------------------------------------------------------------

TP.tag.TagProcessorFixtureBuilder.Type.defineMethod(
'buildNoChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.nochange'))) {
        tagType = TP.dom.ElementNode.defineSubtype('test.nochange');
        tagType.Type.defineMethod('allNodesTransform',
            function(aRequest) {
                //  This method does nothing on this tag type
            });
    }

    return tagType;
});

//  ------------------------------------------------------------------------

TP.tag.TagProcessorFixtureBuilder.Type.defineMethod(
'buildAttrChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.attrchange'))) {
        tagType = TP.dom.ElementNode.defineSubtype('test.attrchange');
        tagType.Type.defineMethod(
            'allNodesTransform',
            function(aRequest) {
                var node;

                if (TP.isElement(node = aRequest.at('node'))) {
                    TP.elementSetAttribute(node, 'allnodesmark', 'true');
                }
            });
    }

    return tagType;
});

//  ------------------------------------------------------------------------

TP.tag.TagProcessorFixtureBuilder.Type.defineMethod(
'buildMoreAttrChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.moreattrchange'))) {
        tagType = TP.dom.ElementNode.defineSubtype('test.moreattrchange');
        tagType.Type.defineMethod(
            'allNodesTransform',
            function(aRequest) {
                var node;

                if (TP.isElement(node = aRequest.at('node'))) {
                    TP.elementSetAttribute(node, 'allnodesmark', 'true');
                    if (!TP.elementHasAttribute(node, 'no-compile')) {
                        TP.elementSetAttribute(node, 'allnodesmark2', 'true');
                        TP.elementSetAttribute(node, 'no-compile', 'true');
                    }
                }
            });
    }

    return tagType;
});

//  ------------------------------------------------------------------------

TP.tag.TagProcessorFixtureBuilder.Type.defineMethod(
'buildContentChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.contentchange'))) {
        tagType = TP.dom.ElementNode.defineSubtype('test.contentchange');
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

TP.tag.TagProcessorFixtureBuilder.Type.defineMethod(
'buildMoreContentChangeTagType',
function() {

    var tagType;

    if (!TP.isType(tagType = TP.sys.getTypeByName('TP.test.morecontentchange'))) {
        tagType = TP.dom.ElementNode.defineSubtype('test.morecontentchange');
        tagType.Type.defineMethod(
            'allNodesTransform',
            function(aRequest) {
                var node,
                    newElem;

                if (TP.isElement(node = aRequest.at('node'))) {
                    TP.elementSetAttribute(node, 'allnodesmark', 'true');
                    if (!TP.elementHasAttribute(node, 'no-compile')) {
                        newElem = TP.documentConstructElement(
                                                TP.nodeGetDocument(node),
                                                'div',
                                                TP.w3.Xmlns.XHTML);
                        TP.elementSetAttribute(
                                newElem, 'tibet:tag',
                                'test:morecontentchange',
                                'true');
                        TP.elementSetAttribute(
                                newElem, 'no-compile',
                                'true');
                        TP.elementSetAttribute(
                                newElem, 'allnodesmark2',
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

TP.tag.TagProcessorFixtureBuilder.Type.defineMethod(
'buildAllNodesPhase',
function() {

    var phaseType;

    if (!TP.isType(phaseType = TP.sys.getTypeByName('TP.test.AllNodesPhase'))) {
        phaseType = TP.tag.TagProcessorPhase.defineSubtype('test.AllNodesPhase');
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

TP.tag.TagProcessorFixtureBuilder.Type.defineMethod(
'buildAllNodesProcessor',
function() {
    var processor;

    this.buildNoChangeTagType();
    this.buildAttrChangeTagType();
    this.buildMoreAttrChangeTagType();
    this.buildContentChangeTagType();
    this.buildMoreContentChangeTagType();

    this.buildAllNodesPhase();

    processor = TP.tag.TagProcessor.construct();

    processor.set('phases', TP.ac(TP.test.AllNodesPhase.construct()));

    return processor;
});

//  ------------------------------------------------------------------------

TP.tag.TagProcessorFixtureBuilder.Type.defineMethod(
'buildACPProcessor',
function() {
    var processor;

    processor = TP.tag.TagProcessor.constructWithPhaseTypes(
                                        TP.ac('TP.tag.PrecompilePhase'));

    return processor;
});

//  ------------------------------------------------------------------------
//  TagProcessor Fixture
//  ------------------------------------------------------------------------

TP.tag.TagProcessor.Type.defineMethod('getTestFixture',
function(options) {

    switch (options) {
        case 'allNodes':
            return TP.tag.TagProcessorFixtureBuilder.buildAllNodesProcessor();
        case 'acpNodes':
            return TP.tag.TagProcessorFixtureBuilder.buildACPProcessor();
        default:
            return null;
    }
});

//  ========================================================================
//  Test Suite
//  ========================================================================

TP.tag.TagProcessor.Inst.describe('TP.tag.TagProcessor Inst all nodes',
function() {

    var testDataLoc;

    testDataLoc = '~lib_test/src/tibet/tagprocessor/testmarkup.xml';

    //  ---

    this.after(
        function(suite, options) {

            //  Unregister the URI to avoid a memory leak (this will also
            //  unregister the 'sub URIs' that we create here).
            TP.uc(testDataLoc).unregister();
        });

    //  ---

    this.it('\'all nodes\' - no mutation', function(test, options) {

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#nochange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));

        promise.chain(function(result) {
                var processor,

                    beforeStr,
                    afterStr;

                processor = TP.tag.TagProcessor.getTestFixture('allNodes');

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

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#attrchange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));

        promise.chain(function(result) {
                var processor;

                processor = TP.tag.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.hasAttribute(result, 'allnodesmark');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - more attribute mutation', function(test, options) {

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#moreattrchange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));

        promise.chain(function(result) {
                var processor;

                processor = TP.tag.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                test.assert.hasAttribute(result, 'allnodesmark');
                test.assert.hasAttribute(result, 'allnodesmark2');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - content mutation', function(test, options) {

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#contentchange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));

        promise.chain(function(result) {
                var processor,
                    testElem;

                processor = TP.tag.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                testElem = result.firstElementChild;

                test.assert.isXMLNode(testElem);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - more content mutation', function(test, options) {

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#morecontentchange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));
        promise.chain(function(result) {
                var processor,
                    testElem;

                processor = TP.tag.TagProcessor.getTestFixture('allNodes');

                processor.processTree(result);

                testElem = result.firstElementChild;

                test.assert.hasAttribute(result, 'allnodesmark');

                test.assert.isXMLNode(testElem);
                test.assert.hasAttribute(testElem, 'allnodesmark2');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - ACP substitution', function(test, options) {

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#acpcontentchange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));

        promise.chain(function(result) {
                var processor,
                    req,
                    testElem;

                processor = TP.tag.TagProcessor.getTestFixture('acpNodes');

                req = TP.request(
                        'sources',
                            TP.ac(TP.tpelem('<wrapper>' +
                                            '<foo xmlns="" bar="baz"/>' +
                                            '</wrapper>', ''))
                        );

                processor.processTree(result, req);

                testElem = result.firstElementChild;

                test.assert.isXMLNode(testElem);
                test.assert.isNull(testElem.namespaceURI);
                test.assert.hasAttribute(testElem, 'bar');

                test.assert.isEqualTo(testElem.localName, 'foo');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - ACP select substitution', function(test, options) {

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#selectacpcontentchange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));

        promise.chain(function(result) {
                var processor,
                    req,
                    testElem;

                processor = TP.tag.TagProcessor.getTestFixture('acpNodes');

                req = TP.request(
                        'sources',
                            TP.ac(TP.tpelem('<wrapper>' +
                                            '<foo xmlns="" bar="baz"/>' +
                                            '<moo xmlns="" bar="baz"/>' +
                                            '</wrapper>', ''))
                        );

                processor.processTree(result, req);

                test.assert.isEqualTo(result.children.length, 1);

                testElem = result.firstElementChild;

                test.assert.isXMLNode(testElem);
                test.assert.isNull(testElem.namespaceURI);
                test.assert.hasAttribute(testElem, 'bar');

                test.assert.isEqualTo(testElem.localName, 'foo');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - ACP attribute substitution', function(test, options) {

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#attracpcontentchange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));

        promise.chain(function(result) {
                var processor,
                    req,
                    testElem;

                processor = TP.tag.TagProcessor.getTestFixture('acpNodes');

                req = TP.request(
                        'sources',
                            TP.ac(TP.tpelem('<foo xmlns="" bar="baz"/>', ''))
                        );

                processor.processTree(result, req);

                testElem = result.firstElementChild;

                test.assert.hasAttribute(testElem, 'foo');
                test.assert.isEqualTo(testElem.getAttribute('foo'), 'baz');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('\'all nodes\' - ACP no-exist attribute substitution', function(test, options) {

        var loadURI,
            promise;

        loadURI = TP.uc(testDataLoc + '#attrnoexistacpcontentchange');

        promise = test.getDriver().fetchResource(
                                    loadURI, TP.hc('resultType', TP.DOM));

        promise.chain(function(result) {
                var processor,
                    req,
                    testElem;

                processor = TP.tag.TagProcessor.getTestFixture('acpNodes');

                req = TP.request(
                        'sources',
                            TP.ac(TP.tpelem('<foo xmlns="" bar="baz"/>', ''))
                        );

                processor.processTree(result, req);

                testElem = result.firstElementChild;

                test.assert.hasAttribute(testElem, 'foo');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

});

//  ------------------------------------------------------------------------

TP.tag.TagProcessor.Inst.describe('TP.tag.TagProcessor Inst core functionality',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            this.getDriver().showTestGUI();
        });

    //  ---

    this.after(
        function(suite, options) {
            this.getDriver().showTestLog();
        });

    //  ---

    this.afterEach(
        function(test, options) {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('XML Base processing', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/XMLBaseTest1.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
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

        test.chain(
            function() {

                var elem,
                    tpElem;

                elem = TP.byId('colorizedSpan',
                                test.getDriver().get('windowContext'),
                                false);
                test.assert.isElement(elem);

                tpElem = TP.wrap(elem);

                //  NB: We convert this into a TP.gui.Color object to compare
                //  - depending on platform, getComputedStyleProperty will
                //  return RGB values, etc.
                test.assert.isEqualTo(
                    TP.gui.Color.fromString(
                        tpElem.getComputedStyleProperty('backgroundColor')),
                    TP.gui.Color.fromString('blue'));
            });
    });
});

//  ========================================================================
//  XInclude
//  ========================================================================

TP.xi.Element.Type.describe('TP.xi.Element Type processing',
function() {

    var unloadURI,

        usingDebugger,
        oldLogLevel,

        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            //  For now, we turn off triggering the debugger because we know
            //  that this test case has a XInclude that points to a file
            //  that won't be found - that part of this test is testing
            //  'xi:fallback' element.
            usingDebugger = TP.sys.shouldUseDebugger();
            TP.sys.shouldUseDebugger(false);

            //  Same for log level
            oldLogLevel = TP.getLogLevel();
            TP.setLogLevel(TP.FATAL);

            //  Suspend raising (since we know - and want - some of these
            //  validations to fail).
            TP.raise.$suspended = true;
        });

    //  ---

    this.after(
        function(suite, options) {
            //  Put log level back to what it was
            TP.setLogLevel(oldLogLevel);

            //  Put the debugger setting back to what it was
            TP.sys.shouldUseDebugger(usingDebugger);

            //  Unsuspend raising
            TP.raise.$suspended = false;
        });

    //  ---

    this.afterEach(
        function(test, options) {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('whole file inclusion', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/XInclude1.xml');

        test.getDriver().fetchResource(loadURI, TP.hc('resultType', TP.DOM)
            ).chain(function(result) {

                var tpDoc,

                    server,
                    loc;

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
                        {
                        },
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

                tpDoc.setContent(result);

                test.chain(
                    function() {

                        var windowContext;

                        windowContext = test.getDriver().get('windowContext');

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
    });

    this.it('partial file inclusion', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/XInclude2.xml');

        test.getDriver().setLocation(loadURI);

        test.chain(
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
//  Action Tags
//  ========================================================================

TP.sig.Signal.defineSubtype('DispatchTestSignal1');
TP.sig.Signal.defineSubtype('DispatchTestSignal2');

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tmp.simpleactiontest');

//  ------------------------------------------------------------------------

TP.tmp.simpleactiontest.Type.defineMethod('tshExecute',
function(aRequest) {

    var elem,
        id,
        val;

    elem = aRequest.at('cmdNode');

    id = TP.elementGetAttribute(elem, 'id', true);

    val = TP.elementGetAttribute(elem, 'simpleactionexecid', true);

    if (TP.notEmpty(val)) {
        val += ' ' + id;
    } else {
        val = id;
    }

    TP.elementSetAttribute(elem,
                            'simpleactionexecid',
                            val,
                            true);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.describe('TP.tag.ActionTag simple tag execution',
function() {

    var loadURI,
        windowContext;

    //  ---

    this.before(
        function(suite, options) {

            windowContext = this.getDriver().get('windowContext');

            loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/ActionTag1.xhtml');

            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.after(
        function(test, options) {

            var unloadURI;

            unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('direct execution', function(test, options) {

        var actionTPElem;

        actionTPElem = TP.byId('simpleAction1', windowContext);

        test.assert.isElement(actionTPElem);

        actionTPElem.act();

        test.assert.isAttributeEqualTo(
                        actionTPElem,
                        'simpleactionexecid',
                        'simpleAction1');

        actionTPElem.removeAttribute('simpleactionexecid');
    });

    //  ---

    this.it('signal-based execution', function(test, options) {

        var actionTPElem,
            sendActivateButton;

        actionTPElem = TP.byId('simpleAction1', windowContext);

        test.assert.isElement(actionTPElem);

        sendActivateButton = TP.byId('sendActivate',
                                        windowContext,
                                        false);

        this.getSuite().getDriver().constructSequence().click(sendActivateButton).run();

        test.andWaitFor(actionTPElem, 'TP.sig.DidRun');

        test.chain(
            function() {
                test.assert.isAttributeEqualTo(
                                actionTPElem,
                                'simpleactionexecid',
                                'simpleAction1');

                actionTPElem.removeAttribute('simpleactionexecid');
            });
    });

});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.describe('TP.tag.ActionTag complex tag execution',
function() {

    var loadURI,
        windowContext;

    //  ---

    this.before(
        function(suite, options) {

            windowContext = this.getDriver().get('windowContext');

            loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/ActionTag2.xhtml');

            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.after(
        function(test, options) {

            var unloadURI;

            unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('direct execution', function(test, options) {

        var actionTPElem;

        actionTPElem = TP.byId('scriptGroup', windowContext);

        test.assert.isElement(actionTPElem);

        actionTPElem.act();

        test.assert.isAttributeEqualTo(
                        actionTPElem.getChildElements().at(0),
                        'simpleactionexecid',
                        'simpleAction1');
        test.assert.isAttributeEqualTo(
                        actionTPElem.getChildElements().at(1),
                        'simpleactionexecid',
                        'simpleAction2');

        actionTPElem.getChildElements().at(0).removeAttribute('simpleactionexecid');
        actionTPElem.getChildElements().at(1).removeAttribute('simpleactionexecid');
    });

    //  ---

    this.it('signal-based execution', function(test, options) {

        var actionTPElem,
            sendActivateButton;

        actionTPElem = TP.byId('scriptGroup', windowContext);

        test.assert.isElement(actionTPElem);

        sendActivateButton = TP.byId('sendActivate',
                                        windowContext,
                                        false);

        this.getSuite().getDriver().constructSequence().click(sendActivateButton).run();

        test.andWaitFor(actionTPElem, 'TP.sig.DidRun');

        test.chain(
            function() {
                test.assert.isAttributeEqualTo(
                                actionTPElem.getChildElements().at(0),
                                'simpleactionexecid',
                                'simpleAction1');
                test.assert.isAttributeEqualTo(
                                actionTPElem.getChildElements().at(1),
                                'simpleactionexecid',
                                'simpleAction2');
            });
    });

});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.describe('TP.tag.ActionTag simple signal dispatch',
function() {

    var loadURI,
        windowContext;

    //  ---

    this.before(
        function(suite, options) {

            windowContext = this.getDriver().get('windowContext');

            loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/ActionTag3.xhtml');

            this.getDriver().setLocation(loadURI);

            this.chain(
                function() {
                    this.startTrackingSignals();
                }.bind(this),
                function(error) {
                    this.fail(error, TP.sc('Couldn\'t get resource: ',
                                                loadURI.getLocation()));
                });
        });

    //  ---

    this.after(
        function(test, options) {

            var unloadURI;

            unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('direct execution', function(test, options) {

        var actionTPElem;

        actionTPElem = TP.byId('dispatcher1', windowContext);

        test.assert.isElement(actionTPElem);

        actionTPElem.act();

        test.assert.didSignal(actionTPElem, 'DispatchTestSignal1');
    });

    //  ---

    this.it('signal-based execution', function(test, options) {

        var actionTPElem,
            sendActivateButton;

        actionTPElem = TP.byId('dispatcher1', windowContext);

        test.assert.isElement(actionTPElem);

        sendActivateButton = TP.byId('sendActivate',
                                        windowContext,
                                        false);

        this.getSuite().getDriver().constructSequence().click(sendActivateButton).run();

        test.andWaitFor(actionTPElem, 'TP.sig.DidRun');

        test.chain(
            function() {
                test.assert.didSignal(actionTPElem, 'DispatchTestSignal1');
            });
    });

});

//  ------------------------------------------------------------------------

TP.tag.ActionTag.Type.describe('TP.tag.ActionTag complex signal dispatch',
function() {

    var loadURI,
        windowContext;

    //  ---

    this.before(
        function(suite, options) {

            windowContext = this.getDriver().get('windowContext');

            loadURI = TP.uc('~lib_test/src/tibet/tagprocessor/ActionTag4.xhtml');

            this.getDriver().setLocation(loadURI);

            this.chain(
                function() {
                    this.startTrackingSignals();
                }.bind(this),
                function(error) {
                    this.fail(error, TP.sc('Couldn\'t get resource: ',
                                                loadURI.getLocation()));
                });
        });

    //  ---

    this.after(
        function(test, options) {

            var unloadURI;

            unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('direct execution', function(test, options) {

        var actionTPElem;

        actionTPElem = TP.byId('dispatcherGroup', windowContext);

        test.assert.isElement(actionTPElem);

        actionTPElem.act();

        test.assert.didSignal(actionTPElem, 'DispatchTestSignal1');
        test.assert.didSignal(actionTPElem, 'DispatchTestSignal2');
    });

    //  ---

    this.it('signal-based execution', function(test, options) {

        var actionTPElem,
            sendActivateButton;

        actionTPElem = TP.byId('dispatcherGroup', windowContext);

        test.assert.isElement(actionTPElem);

        sendActivateButton = TP.byId('sendActivate',
                                        windowContext,
                                        false);

        this.getSuite().getDriver().constructSequence().click(sendActivateButton).run();

        test.andWaitFor(actionTPElem, 'TP.sig.DidRun');

        test.chain(
            function() {
                test.assert.didSignal(actionTPElem, 'DispatchTestSignal1');
                test.assert.didSignal(actionTPElem, 'DispatchTestSignal2');
            });
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
