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
//  TP.tibet.group
//  ========================================================================

TP.tibet.group.Inst.describe('TP.tibet.group: registration',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

    //  ---

    this.it('Explicit simple query with body context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping1.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem,
                    groupMembers;

                tpElem = TP.byOID('noGroupItem');
                test.assert.isBlank(tpElem.getGroupName());

                tpElem = TP.byOID('foo');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                tpElem = TP.byOID('bar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

                groupMembers = TP.byOID('fooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('foo'));

                groupMembers = TP.byOID('gooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('bar'));

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Explicit complex query with body context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping2.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem,
                    groupMembers;

                tpElem = TP.byOID('foo');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                tpElem = TP.byOID('bar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                tpElem = TP.byOID('goo');
                test.assert.isBlank(tpElem.getGroupName());

                tpElem = TP.byOID('baz');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                groupMembers = TP.byOID('fooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('foo', 'bar', 'baz'));

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Explicit complex query with body context and implicit query with element context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping3.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem,
                    groupMembers;

                tpElem = TP.byOID('foo');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                tpElem = TP.byOID('bar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                tpElem = TP.byOID('gar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

                tpElem = TP.byOID('gaz');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

                tpElem = TP.byOID('goo');
                test.assert.isEqualTo(tpElem.getGroupName(), 'nestedGooGroup');

                groupMembers = TP.byOID('fooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('foo', 'bar'));

                groupMembers = TP.byOID('gooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('gar', 'gaz', 'element(gooStuff/3)'));

                groupMembers = TP.byOID('nestedGooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('goo'));

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Implicit query with element context and explicit simple queries with element context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping4.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem,
                    groupMembers;

                tpElem = TP.byOID('foo');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                tpElem = TP.byOID('bar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                tpElem = TP.byOID('gar');
                test.assert.isBlank(tpElem.getGroupName());

                tpElem = TP.byOID('gaz');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

                tpElem = TP.byOID('mar');
                test.assert.isBlank(tpElem.getGroupName());

                tpElem = TP.byOID('maz');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');

                tpElem = TP.byOID('moofy');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');

                tpElem = TP.byOID('moogy');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');

                groupMembers = TP.byOID('fooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('foo', 'bar'));

                groupMembers = TP.byOID('gooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('gaz'));

                groupMembers = TP.byOID('mooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('maz', 'moofy', 'moogy'));

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Explicit complex queries with element context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping5.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem,
                    groupMembers;

                tpElem = TP.byOID('foo');
                test.assert.isBlank(tpElem.getGroupName());

                tpElem = TP.byOID('bar');
                test.assert.isBlank(tpElem.getGroupName());

                tpElem = TP.byOID('onlyThing');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

                tpElem = TP.byOID('gar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

                tpElem = TP.byOID('gaz');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

                tpElem = TP.byOID('baz');
                test.assert.isBlank(tpElem.getGroupName());

                groupMembers = TP.byOID('fooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('onlyThing'));

                groupMembers = TP.byOID('gooGroup').getMembers().collect(
                                    function(elem) {
                                        return TP.lid(elem);
                                    });
                test.assert.isEqualTo(
                        groupMembers,
                        TP.ac('gar', 'gaz'));

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Reporting chain with implicit query with nested element context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping6.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem;

                tpElem = TP.byOID('foo');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('gooGroup', 'fooGroup'));

                tpElem = TP.byOID('bar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('gooGroup', 'fooGroup'));

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Reporting chain with implicit query with nested element context and explicit simple query with body context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping7.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem;

                tpElem = TP.byOID('foo');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('fooGroup'));

                tpElem = TP.byOID('bar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('gooGroup', 'fooGroup'));

                tpElem = TP.byOID('baz');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('mooGroup'));

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Reporting chain with implicit query with nested element context and explicit simple query with body context nested in element context', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping8.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem;

                tpElem = TP.byOID('foo');
                test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('fooGroup'));

                tpElem = TP.byOID('bar');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('gooGroup', 'fooGroup'));

                tpElem = TP.byOID('baz');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('mooGroup', 'nooGroup'));

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Reporting chain with implicit query with multiple nested element contexts computing next and previous groups', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping9.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem;

                tpElem = TP.byOID('div1');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('gooGroup', 'fooGroup'));
                test.assert.isNull(tpElem.getPreviousGroupName());
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'mooGroup');

                tpElem = TP.byOID('div2');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('gooGroup', 'fooGroup'));
                test.assert.isNull(tpElem.getPreviousGroupName());
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'mooGroup');

                tpElem = TP.byOID('div3');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('mooGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'gooGroup');
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'booGroup');

                tpElem = TP.byOID('div4');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('mooGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'gooGroup');
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'booGroup');

                tpElem = TP.byOID('div5');
                test.assert.isEqualTo(tpElem.getGroupName(), 'booGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('booGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'mooGroup');
                test.assert.isNull(tpElem.getNextGroupName());

                tpElem = TP.byOID('div6');
                test.assert.isEqualTo(tpElem.getGroupName(), 'booGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('booGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'mooGroup');
                test.assert.isNull(tpElem.getNextGroupName());

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
    //  ---

    this.it('Reporting chain with implicit query with multiple nested element contexts computing next and previous groups with wrapping', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping10.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var tpElem;

                tpElem = TP.byOID('div1');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('gooGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'booGroup');
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'mooGroup');

                tpElem = TP.byOID('div2');
                test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('gooGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'booGroup');
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'mooGroup');

                tpElem = TP.byOID('div3');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('mooGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'gooGroup');
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'booGroup');

                tpElem = TP.byOID('div4');
                test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('mooGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'gooGroup');
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'booGroup');

                tpElem = TP.byOID('div5');
                test.assert.isEqualTo(tpElem.getGroupName(), 'booGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('booGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'mooGroup');
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'gooGroup');

                tpElem = TP.byOID('div6');
                test.assert.isEqualTo(tpElem.getGroupName(), 'booGroup');
                test.assert.isEqualTo(
                        tpElem.getGroupChainNames(),
                        TP.ac('booGroup', 'fooGroup'));
                test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'mooGroup');
                test.assert.isEqualTo(tpElem.getNextGroupName(), 'gooGroup');

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Explicit complex query with body context - dynamically modified', function(test, options) {

        var loadURI;

        TP.isFluffy = true;

        loadURI = TP.uc('~lib_tst/src/tibet/grouping/Grouping11.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var parentTPElem,
                    tpElem;

                parentTPElem = TP.byOID('fooStuff');

                parentTPElem.addProcessedContent('<div id="moo">This is the moo div. It is in the \'fooGroup\' group.</div>');

                //  Give it a 50ms wait - otherwise, Promises starve the event
                //  loop and the MO machinery will never be triggered.
                test.thenWait(50);

                test.then(
                    function() {
                        tpElem = TP.byOID('moo');
                        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');
                        test.assert.isEqualTo(
                                tpElem.getGroupChainNames(),
                                TP.ac('fooGroup'));
                    });

                //  Unload the current page by setting it to the blank
                test.getDriver().setLocation(unloadURI);

                //  Unregister the URI to avoid a memory leak
                loadURI.unregister();
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.tibet.group.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
