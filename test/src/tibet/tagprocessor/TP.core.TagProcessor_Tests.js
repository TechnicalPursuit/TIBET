//  ========================================================================
/**
 * @file TP.core.TagProcessor_Tests.js
 * @overview
 * @author William J. Edney (wje)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */
//  ------------------------------------------------------------------------

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

    var testDataLoc;

    this.before(function() {

        testDataLoc = '~lib_tst/src/tibet/tagprocessor/testmarkup.xml';
    });

    this.it('\'all nodes\' - no mutation', function(test, options) {

        var uri;

        uri = TP.uc(testDataLoc + '#nochange');

        return this.getDriver().fetchResource(uri, TP.DOM).then(
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

                test.assert.equalTo(beforeStr, afterStr);
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

        return this.getDriver().fetchResource(uri, TP.DOM).then(
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

        return this.getDriver().fetchResource(uri, TP.DOM).then(
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

        return this.getDriver().fetchResource(uri, TP.DOM).then(
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

        return this.getDriver().fetchResource(uri, TP.DOM).then(
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
});

//  ========================================================================
//  XInclude
//  ========================================================================

TP.xi.Element.Type.describe('TP.xi.Element Type processing',
function() {

    this.it('whole file inclusion', function(test, options) {

        var uri;

        uri = TP.uc('~lib_tst/src/tibet/tagprocessor/XInclude1.xml');

        return this.getDriver().fetchResource(uri, TP.DOM).then(
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

        return this.getDriver().fetchResource(uri, TP.DOM).then(
            function(result) {

                var tpDoc;

                tpDoc = TP.sys.getUICanvas().getDocument();

                tpDoc.setContent(result);

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
