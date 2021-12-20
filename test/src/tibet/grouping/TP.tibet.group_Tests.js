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

    var unloadURI,
        loadURI,

        windowContext;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {

            windowContext = this.getDriver().get('windowContext');
        });

    //  ---

    this.afterEach(
        async function(test, options) {

            //  Unload the current page by setting it to the
            //  blank
            await this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('Explicit simple query with body context', async function(test, options) {
        var tpElem,
            groupMembers;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping1.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('noGroupItem', windowContext);
        test.assert.isBlank(tpElem.getGroupName());

        tpElem = TP.byId('foo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        tpElem = TP.byId('bar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

        groupMembers =
            TP.byId('fooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('foo'));

        groupMembers =
            TP.byId('gooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('bar'));
    });

    //  ---

    this.it('Explicit complex query with body context', async function(test, options) {
        var tpElem,
            groupMembers;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping2.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('foo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        tpElem = TP.byId('bar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        tpElem = TP.byId('goo', windowContext);
        test.assert.isBlank(tpElem.getGroupName());

        tpElem = TP.byId('baz', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        groupMembers =
            TP.byId('fooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('foo', 'bar', 'baz'));
    });

    //  ---

    this.it('Explicit complex query with body context and implicit query with element context', async function(test, options) {

        var tpElem,
            groupMembers;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping3.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('foo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        tpElem = TP.byId('bar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        tpElem = TP.byId('gar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

        tpElem = TP.byId('gaz', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

        tpElem = TP.byId('goo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'nestedGooGroup');

        groupMembers =
            TP.byId('fooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('foo', 'bar'));

        groupMembers =
            TP.byId('gooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('gar', 'gaz', 'nestedGooStuff'));

        groupMembers =
            TP.byId('nestedGooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('goo'));
    });

    //  ---

    this.it('Implicit query with element context and explicit simple queries with element context', async function(test, options) {

        var tpElem,
            groupMembers;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping4.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('foo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        tpElem = TP.byId('bar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        tpElem = TP.byId('gar', windowContext);
        test.assert.isBlank(tpElem.getGroupName());

        tpElem = TP.byId('gaz', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

        tpElem = TP.byId('mar', windowContext);
        test.assert.isBlank(tpElem.getGroupName());

        tpElem = TP.byId('maz', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');

        tpElem = TP.byId('moofy', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');

        tpElem = TP.byId('moogy', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');

        groupMembers =
            TP.byId('fooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('foo', 'bar'));

        groupMembers =
            TP.byId('gooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('gaz'));

        groupMembers =
            TP.byId('mooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('maz', 'moofy', 'moogy'));
    });

    //  ---

    this.it('Explicit complex queries with element context', async function(test, options) {

        var tpElem,
            groupMembers;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping5.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('foo', windowContext);
        test.assert.isBlank(tpElem.getGroupName());

        tpElem = TP.byId('bar', windowContext);
        test.assert.isBlank(tpElem.getGroupName());

        tpElem = TP.byId('onlyThing', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');

        tpElem = TP.byId('gar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

        tpElem = TP.byId('gaz', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');

        tpElem = TP.byId('baz', windowContext);
        test.assert.isBlank(tpElem.getGroupName());

        groupMembers =
            TP.byId('fooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('onlyThing'));

        groupMembers =
            TP.byId('gooGroup', windowContext).getMemberElements().collect(
                        function(elem) {
                            return TP.lid(elem);
                        });
        test.assert.isEqualTo(
                groupMembers,
                TP.ac('gar', 'gaz'));
    });

    //  ---

    this.it('Reporting chain with implicit query with nested element context', async function(test, options) {

        var tpElem;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping6.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('foo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('gooGroup', 'fooGroup'));

        tpElem = TP.byId('bar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('gooGroup', 'fooGroup'));
    });

    //  ---

    this.it('Reporting chain with implicit query with nested element context and explicit simple query with body context', async function(test, options) {

        var tpElem;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping7.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('foo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('fooGroup'));

        tpElem = TP.byId('bar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('gooGroup', 'fooGroup'));

        tpElem = TP.byId('baz', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('mooGroup'));
    });

    //  ---

    this.it('Reporting chain with implicit query with nested element context and explicit simple query with body context nested in element context', async function(test, options) {

        var tpElem;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping8.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('foo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('fooGroup'));

        tpElem = TP.byId('bar', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('gooGroup', 'fooGroup'));

        tpElem = TP.byId('baz', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('mooGroup', 'nooGroup'));
    });

    //  ---

    this.it('Reporting chain with implicit query with multiple nested element contexts computing next and previous groups', async function(test, options) {

        var tpElem;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping9.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('div1', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('gooGroup', 'fooGroup'));
        test.assert.isNull(tpElem.getPreviousGroupName());
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'mooGroup');

        tpElem = TP.byId('div2', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('gooGroup', 'fooGroup'));
        test.assert.isNull(tpElem.getPreviousGroupName());
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'mooGroup');

        tpElem = TP.byId('div3', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('mooGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'gooGroup');
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'booGroup');

        tpElem = TP.byId('div4', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('mooGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'gooGroup');
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'booGroup');

        tpElem = TP.byId('div5', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'booGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('booGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'mooGroup');
        test.assert.isNull(tpElem.getNextGroupName());

        tpElem = TP.byId('div6', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'booGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('booGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'mooGroup');
        test.assert.isNull(tpElem.getNextGroupName());
    });
    //  ---

    this.it('Reporting chain with implicit query with multiple nested element contexts computing next and previous groups with wrapping', async function(test, options) {
        var tpElem;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping10.xhtml');

        await test.getDriver().setLocation(loadURI);

        tpElem = TP.byId('div1', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('gooGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'booGroup');
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'mooGroup');

        tpElem = TP.byId('div2', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'gooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('gooGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'booGroup');
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'mooGroup');

        tpElem = TP.byId('div3', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('mooGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'gooGroup');
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'booGroup');

        tpElem = TP.byId('div4', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'mooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('mooGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'gooGroup');
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'booGroup');

        tpElem = TP.byId('div5', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'booGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('booGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'mooGroup');
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'gooGroup');

        tpElem = TP.byId('div6', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'booGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('booGroup', 'fooGroup'));
        test.assert.isEqualTo(tpElem.getPreviousGroupName(), 'mooGroup');
        test.assert.isEqualTo(tpElem.getNextGroupName(), 'gooGroup');
    });

    //  ---

    this.it('Explicit complex query with body context - dynamically modified', async function(test, options) {

        var driver,

            parentTPElem,
            tpElem;

        loadURI = TP.uc('~lib_test/src/tibet/grouping/Grouping11.xhtml');

        driver = test.getDriver();

        await driver.setLocation(loadURI);

        parentTPElem = TP.byId('fooStuff', windowContext);

        parentTPElem.addRawContent('<div xmlns="' + TP.w3.Xmlns.XHTML + '" id="moo">This is the moo div. It is in the \'fooGroup\' group.</div>');

        //  Wait for the next GUI refresh - otherwise, Promises starve
        //  the event loop and the MO machinery will never be triggered.
        await test.andAllowGUIRefresh(driver.get('windowContext'));

        tpElem = TP.byId('moo', windowContext);
        test.assert.isEqualTo(tpElem.getGroupName(), 'fooGroup');
        test.assert.isEqualTo(
                tpElem.getGroupChainNames(),
                TP.ac('fooGroup'));
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
