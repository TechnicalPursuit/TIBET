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

/* global $focus_stack:true
*/

//  ========================================================================
//  TP.core.CollectionNode
//  ========================================================================

TP.core.CollectionNode.Inst.describe('TP.core.CollectionNode: templating',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

    this.it('Simple custom markup - automatic tibet:tag stamping', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating1.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var contentElem;

                //  Test for elements from the template
                contentElem = TP.byId('hello1');
                test.assert.isElement(contentElem);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem).trim(),
                    'Hello World 1');

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup - automatic tibet:tag stamping', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating2.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                //  Test for elements from the template

                var contentElem;

                contentElem = TP.byId('hello1');
                test.assert.isElement(contentElem);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem).trim(),
                    'Hello World 1');

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Simple custom markup - manual tibet:tag stamping', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating3.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var contentElem;

                //  Test for elements from the template
                contentElem = TP.byId('hello2');
                test.assert.isElement(contentElem);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem).trim(),
                    'Hello World 2');

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup - manual tibet:tag stamping', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating4.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                //  Test for elements from the template

                var contentElem;

                contentElem = TP.byId('hello2');
                test.assert.isElement(contentElem);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem).trim(),
                    'Hello World 2');

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Custom markup producing further custom markup - automatic tibet:tag stamping', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating5.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var contentElem,
                    contentElem2,
                    contentElem3;

                //  Test for elements from the templates

                contentElem = TP.byId('hello3');
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested');
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1');
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup producing further custom markup - automatic tibet:tag stamping', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating6.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var contentElem,
                    contentElem2,
                    contentElem3;

                //  Test for elements from the templates

                contentElem = TP.byId('hello3');
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested');
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1');
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Custom markup producing further custom markup - manual tibet:tag stamping', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating7.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var contentElem,
                    contentElem2,
                    contentElem3;

                //  Test for elements from the templates

                contentElem = TP.byId('hello4');
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested');
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1');
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup producing further custom markup - manual tibet:tag stamping', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating8.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var contentElem,
                    contentElem2,
                    contentElem3;

                //  Test for elements from the templates

                contentElem = TP.byId('hello4');
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested');
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1');
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.describe('TP.core.CollectionNode: templating attribute propagation',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

    this.it('Custom markup producing further custom markup - attribute propagation', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating9.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var contentElem,
                    contentElem2,
                    contentElem3;

                //  Test for elements from the templates

                contentElem = TP.byId('hello5');
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested');
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1');
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);

                //  Check the attributes
                test.assert.hasAttribute(contentElem, 'noNSAttr');
                test.assert.hasAttribute(contentElem, 'templatetest:attr1');
                test.assert.hasAttribute(contentElem, 'html:attr2');

                test.assert.isEmpty(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(contentElem, 'noNSAttr')));
                test.assert.isEqualTo(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(
                            contentElem, 'templatetest:attr1')),
                    'urn:test:templatetest');
                test.assert.isEqualTo(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(contentElem, 'html:attr2')),
                    TP.w3.Xmlns.XHTML);

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Pre-transformed custom markup producing further custom markup - attribute propagation', function(test, options) {

        var loadURI,

            driver;

        loadURI = TP.uc('~lib_tst/src/tibet/templating/Templating10.xhtml');

        driver = test.getDriver();
        driver.setLocation(loadURI);

        test.then(
            function(result) {

                var contentElem,
                    contentElem2,
                    contentElem3;

                //  Test for elements from the templates

                contentElem = TP.byId('hello5');
                test.assert.isElement(contentElem);

                contentElem2 = TP.byId('helloNested');
                test.assert.isElement(contentElem2);

                test.assert.isChildNodeOf(
                    contentElem,
                    contentElem2);

                contentElem3 = TP.byId('hello1');
                test.assert.isElement(contentElem3);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(contentElem3).trim(),
                    'Hello World 1');

                test.assert.isChildNodeOf(
                    contentElem2,
                    contentElem3);

                //  Check the attributes
                test.assert.hasAttribute(contentElem, 'noNSAttr');
                test.assert.hasAttribute(contentElem, 'templatetest:attr1');
                test.assert.hasAttribute(contentElem, 'html:attr2');

                test.assert.isEmpty(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(contentElem, 'noNSAttr')));
                test.assert.isEqualTo(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(
                            contentElem, 'templatetest:attr1')),
                    'urn:test:templatetest');
                test.assert.isEqualTo(
                    TP.nodeGetNSURI(
                        TP.elementGetAttributeNode(contentElem, 'html:attr2')),
                    TP.w3.Xmlns.XHTML);

                //  Unload the current page by setting it to the blank
                driver.setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.describe('TP.core.CollectionNode: templating with substitutions',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

    this.it('Substitutions within standard markup', function(test, options) {

    });

    //  ---

    this.it('Substitutions within custom markup', function(test, options) {

    });

    //  ---

    this.it('Substitutions within custom markup producing further custom markup having substitutions', function(test, options) {

    });

    //  ---

    this.it('Substitutions within custom markup having variables', function(test, options) {

    });

    //  ---

    this.it('Substitutions within custom markup having variables producing further custom markup having substitutions', function(test, options) {

    });

}).skip();

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.describe('TP.core.CollectionNode: tibet:template inline element - JS template',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

    this.it('tibet:template producing standard markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing pre-transformed custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing custom markup producing further custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within standard markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup producing further custom markup having substitutions', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables producing further custom markup having substitutions', function(test, options) {

    });

});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.describe('TP.core.CollectionNode: tibet:template inline element - XML template',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

    this.it('tibet:template producing standard markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing pre-transformed custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing custom markup producing further custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within standard markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup producing further custom markup having substitutions', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables producing further custom markup having substitutions', function(test, options) {

    });

});

//  ------------------------------------------------------------------------

TP.core.CollectionNode.Inst.describe('TP.core.CollectionNode: tibet:template inline element - XSLT template',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

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

    this.it('tibet:template producing standard markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing pre-transformed custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing custom markup producing further custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within standard markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup producing further custom markup having substitutions', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables', function(test, options) {

    });

    //  ---

    this.it('tibet:template producing substitutions within custom markup having variables producing further custom markup having substitutions', function(test, options) {

    });

});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.CollectionNode.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
