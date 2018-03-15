//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/* JSHint checking */

//  ========================================================================
//  TP.dom.CollectionNode
//  ========================================================================

TP.dom.CollectionNode.Inst.describe('TP.dom.CollectionNode: templating',
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

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('Simple custom markup - automatic tibet:tag stamping', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating1.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var contentElem;

                //  Test for elements from the template
                contentElem = TP.byId(
                    'hello1', test.getDriver().get('windowContext'), false);
                test.assert.isElement(contentElem);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem).trim(),
                    'Hello World 1');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup - automatic tibet:tag stamping', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating2.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                //  Test for elements from the template

                var contentElem;

                contentElem = TP.byId(
                    'hello1', test.getDriver().get('windowContext'), false);
                test.assert.isElement(contentElem);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem).trim(),
                    'Hello World 1');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Simple custom markup - manual tibet:tag stamping', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating3.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var contentElem;

                //  Test for elements from the template
                contentElem = TP.byId(
                    'hello2', driver.get('windowContext'), false);
                test.assert.isElement(contentElem);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem).trim(),
                    'Hello World 2');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup - manual tibet:tag stamping', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating4.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                //  Test for elements from the template

                var contentElem;

                contentElem = TP.byId(
                    'hello2', driver.get('windowContext'), false);
                test.assert.isElement(contentElem);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem).trim(),
                    'Hello World 2');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Custom markup producing further custom markup - automatic tibet:tag stamping', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating5.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,
                    contentElem2,
                    contentElem3;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('hello3', windowContext, false);
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested', windowContext, false);
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1', windowContext, false);
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup producing further custom markup - automatic tibet:tag stamping', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating6.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,
                    contentElem2,
                    contentElem3;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('hello3', windowContext, false);
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested', windowContext, false);
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1', windowContext, false);
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Custom markup producing further custom markup - manual tibet:tag stamping', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating7.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,
                    contentElem2,
                    contentElem3;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('hello4', windowContext, false);
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested', windowContext, false);
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1', windowContext, false);
                test.assert.isElement(contentElem3, windowContext, false);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup producing further custom markup - manual tibet:tag stamping', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating8.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,
                    contentElem2,
                    contentElem3;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('hello4', windowContext, false);
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested', windowContext, false);
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1', windowContext, false);
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------

TP.dom.CollectionNode.Inst.describe('TP.dom.CollectionNode: templating attribute propagation',
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

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('Custom markup producing further custom markup - attribute propagation', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating9.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,
                    contentElem2,
                    contentElem3;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('hello5', windowContext, false);
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested', windowContext, false);
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1', windowContext, false);
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);

                //  Check the attributes
                test.assert.hasAttribute(contentElem, 'noNSAttr');
                test.assert.hasAttribute(contentElem, 'tmp:attr1');
                test.assert.hasAttribute(contentElem, 'html:attr2');

                test.assert.isEmpty(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(contentElem, 'noNSAttr')));
                test.assert.isEqualTo(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(
                            contentElem, 'tmp:attr1')),
                    'urn:tibet:tmp');
                test.assert.isEqualTo(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(contentElem, 'html:attr2')),
                    TP.w3.Xmlns.XHTML);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup producing further custom markup - attribute propagation', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating10.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,
                    contentElem2,
                    contentElem3;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('hello5', windowContext, false);
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested', windowContext, false);
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1', windowContext, false);
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);

                //  Check the attributes
                test.assert.hasAttribute(contentElem, 'noNSAttr');
                test.assert.hasAttribute(contentElem, 'tmp:attr1');
                test.assert.hasAttribute(contentElem, 'html:attr2');

                test.assert.isEmpty(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(contentElem, 'noNSAttr')));
                test.assert.isEqualTo(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(
                            contentElem, 'tmp:attr1')),
                    'urn:tibet:tmp');
                test.assert.isEqualTo(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(contentElem, 'html:attr2')),
                    TP.w3.Xmlns.XHTML);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------

TP.dom.CollectionNode.Inst.describe('TP.dom.CollectionNode: templating with substitutions',
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

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('Substitutions having variables within standard markup', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating11.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,

                    correctVal,
                    testVal;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('textResults', windowContext, false);
                test.assert.isElement(contentElem);

                //  The content of the element should be outer content of the
                //  element itself
                correctVal = '<div xmlns="http://www.w3.org/1999/xhtml" id="textResults">{{$TAG.outerContent}}</div>';
                testVal = TP.nodeGetTextContent(contentElem);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);

                contentElem = TP.byId('attrResults', windowContext, false);
                test.assert.isElement(contentElem);

                correctVal = 'html:div';
                testVal = TP.elementGetAttribute(contentElem, 'canonicalname', true);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Substitutions having variables within custom markup having substitutions', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating12.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,

                    correctVal,
                    testVal;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('textResults', windowContext, false);
                test.assert.isElement(contentElem);

                //  The content of the element should be outer content of the
                //  element itself, but uppercased after it ran through the
                //  custom element template.
                correctVal = /<TMP:HELLO6_TEMPLATETEST.*XMLNS:TMP="URN:TIBET:TMP".*ID="TEXTRESULTS">\{\{\$TAG.OUTERCONTENT\}\}<\/TMP:HELLO6_TEMPLATETEST>/;
                testVal = TP.nodeGetTextContent(contentElem).trim();

                test.assert.matches(
                    testVal,
                    correctVal);

                contentElem = TP.nodeGetFirstChildElement(TP.byId('attrResults', windowContext, false));
                test.assert.isElement(contentElem);

                correctVal = 'TMP:HELLO6_TEMPLATETEST';
                testVal = TP.elementGetAttribute(contentElem, 'templateattr', true);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Substitutions having variables within pre-transformed custom markup having substitutions', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating13.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,

                    correctVal,
                    testVal;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('textResults', windowContext, false);
                test.assert.isElement(contentElem);

                //  The content of the element should be outer content of the
                //  element itself, but uppercased after it ran through the
                //  custom element template.
                testVal = TP.nodeGetTextContent(contentElem).trim();

                //  NOTE: We have to test these pieces individually, since
                //  different engines will have different serialization
                //  mechanisms.

                correctVal = /<DIV.*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*XMLNS="HTTP:\/\/WWW.W3.ORG\/1999\/XHTML".*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*XMLNS:TIBET="HTTP:\/\/WWW.TECHNICALPURSUIT.COM\/1999\/TIBET".*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*TIBET:TAG="TMP:HELLO6_TEMPLATETEST".*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*ID="TEXTRESULTS".*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*\{\{\$TAG.OUTERCONTENT\}\}.*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*<\/DIV>/;

                test.assert.matches(
                    testVal,
                    correctVal);

                //  Test the attribute substitutions

                contentElem = TP.nodeGetFirstChildElement(TP.byId('attrResults', windowContext, false));
                test.assert.isElement(contentElem);

                correctVal = 'TMP:HELLO6_TEMPLATETEST';
                testVal = TP.elementGetAttribute(contentElem, 'templateattr', true);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Substitutions having variables within custom markup producing further custom markup having substitutions', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating14.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,

                    correctVal,
                    testVal;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('textResults', windowContext, false);
                test.assert.isElement(contentElem);

                //  The content of the element should be outer content of the
                //  element itself, but uppercased after it ran through the
                //  custom element template.
                correctVal = /<TMP:HELLO7_TEMPLATETEST.*XMLNS:TMP="URN:TIBET:TMP".*ID="TEXTRESULTS">\{\{\$TAG.OUTERCONTENT\}\}<\/TMP:HELLO7_TEMPLATETEST>/;
                testVal = TP.nodeGetTextContent(contentElem).trim();

                test.assert.matches(
                    testVal,
                    correctVal);

                contentElem = TP.byCSSPath(
                        '*[nestedtemplateattr]',
                        TP.byId('attrResults', windowContext, false), true, false);
                test.assert.isElement(contentElem);

                correctVal = 'tmp:hello7_templatetest';
                testVal = TP.elementGetAttribute(contentElem, 'nestedtemplateattr', true);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Substitutions having variables within pre-transformed custom markup producing further custom markup having substitutions', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating15.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,

                    correctVal,
                    testVal;

                windowContext = driver.get('windowContext');

                //  Test for elements from the templates

                contentElem = TP.byId('textResults', windowContext, false);
                test.assert.isElement(contentElem);

                //  The content of the element should be outer content of the
                //  element itself, but uppercased after it ran through the
                //  custom element template.
                testVal = TP.nodeGetTextContent(contentElem).trim();

                //  NOTE: We have to test these pieces individually, since
                //  different engines will have different serialization
                //  mechanisms.

                correctVal = /<DIV.*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*XMLNS="HTTP:\/\/WWW.W3.ORG\/1999\/XHTML".*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*XMLNS:TIBET="HTTP:\/\/WWW.TECHNICALPURSUIT.COM\/1999\/TIBET".*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*TIBET:TAG="TMP:HELLO7_TEMPLATETEST".*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*ID="TEXTRESULTS".*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*\{\{\$TAG.OUTERCONTENT\}\}.*/;

                test.assert.matches(
                    testVal,
                    correctVal);

                correctVal = /.*<\/DIV>/;

                test.assert.matches(
                    testVal,
                    correctVal);

                //  Test the attribute substitutions

                contentElem = TP.byCSSPath(
                        '*[nestedtemplateattr]',
                        TP.byId('attrResults', windowContext, false), true, false);
                test.assert.isElement(contentElem);

                correctVal = 'tmp:hello7_templatetest';
                testVal = TP.elementGetAttribute(contentElem, 'nestedtemplateattr', true);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------

TP.dom.CollectionNode.Inst.describe('TP.dom.CollectionNode: templating various system variable output',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function() {

            //  We use this in the tests below.
            TP.i18n.Locale.registerStrings(
                {
                    HELLO: 'Hello World!'
                });

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

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('Substitutions having system variables within standard markup', function(test, options) {

        var driver;

        loadURI = TP.uc('~lib_test/src/tibet/templating/Templating16.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.chain(
            function(result) {

                var windowContext,

                    contentElem,

                    correctVal,
                    testVal;

                windowContext = driver.get('windowContext');

                //  ---

                //  Test for elements from the templates

                correctVal = 'lang';

                contentElem = TP.byId('textResults_1', windowContext, false);
                test.assert.isElement(contentElem);

                testVal = TP.nodeGetTextContent(contentElem);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);

                contentElem = TP.byId('attrResults_1', windowContext, false);
                test.assert.isElement(contentElem);

                testVal = TP.elementGetAttribute(contentElem, 'value', true);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);

                //  ---

                correctVal = 'APP';

                contentElem = TP.byId('textResults_2', windowContext, false);
                test.assert.isElement(contentElem);

                testVal = TP.nodeGetTextContent(contentElem);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);

                contentElem = TP.byId('attrResults_2', windowContext, false);
                test.assert.isElement(contentElem);

                testVal = TP.elementGetAttribute(contentElem, 'value', true);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);

                //  ---

                correctVal = 'Hello World!';

                contentElem = TP.byId('textResults_3', windowContext, false);
                test.assert.isElement(contentElem);

                testVal = TP.nodeGetTextContent(contentElem);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);

                contentElem = TP.byId('attrResults_3', windowContext, false);
                test.assert.isElement(contentElem);

                testVal = TP.elementGetAttribute(contentElem, 'value', true);

                test.assert.isEqualTo(
                    testVal,
                    correctVal);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

});

//  ------------------------------------------------------------------------

TP.dom.CollectionNode.Inst.describe('TP.dom.CollectionNode: tibet:template inline element - JS template',
function() {

    var unloadURI;

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

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            // loadURI.unregister();
        });

    //  ---

    this.it('tibet:template producing standard markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing pre-transformed custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing custom markup producing further custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within standard markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup producing further custom markup having substitutions', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables producing further custom markup having substitutions', function(test, options) {
        //  empty
    });

}).todo();

//  ------------------------------------------------------------------------

TP.dom.CollectionNode.Inst.describe('TP.dom.CollectionNode: tibet:template inline element - XML template',
function() {

    var unloadURI;

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

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            // loadURI.unregister();
        });

    //  ---

    this.it('tibet:template producing standard markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing pre-transformed custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing custom markup producing further custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within standard markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup producing further custom markup having substitutions', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables producing further custom markup having substitutions', function(test, options) {
        //  empty
    });

}).todo();

//  ------------------------------------------------------------------------

TP.dom.CollectionNode.Inst.describe('TP.dom.CollectionNode: tibet:template inline element - XSLT template',
function() {

    var unloadURI;

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

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            // loadURI.unregister();
        });

    //  ---

    this.it('tibet:template producing standard markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing pre-transformed custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing custom markup producing further custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within standard markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup producing further custom markup having substitutions', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables', function(test, options) {
        //  empty
    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables producing further custom markup having substitutions', function(test, options) {
        //  empty
    });

}).todo();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
