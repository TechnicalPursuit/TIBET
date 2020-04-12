//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * NB: All of these tests contain an assertion that is true. This is done so
 * that, even if the test case is meant to fail, that it doesn't do so because
 * the test harness reports that it has no assertions (which it *will* do), but
 * because some intentional failure mode was triggered.
 */

TP.test.Suite.Inst.describe('TP.test.Suite parameter check',
function() {

    this.before(function(suite, options) {

        if (!TP.isKindOf(this, TP.test.Suite)) {
            TP.sys.logTest('"before" this is of wrong type', TP.ERROR);
        }

        if (!TP.isKindOf(suite, TP.test.Suite)) {
            TP.sys.logTest('"before" param1 is of wrong type', TP.ERROR);
        }

        if (!TP.identical(this, suite)) {
            TP.sys.logTest('"before" param1 and "before" this should be the same object', TP.ERROR);
        }
    });

    this.beforeEach(function(test, options) {

        if (!TP.isKindOf(this, TP.test.Case)) {
            TP.sys.logTest('"beforeEach" this is of wrong type', TP.ERROR);
        }

        if (!TP.isKindOf(test, TP.test.Case)) {
            TP.sys.logTest('"beforeEach" param1 is of wrong type', TP.ERROR);
        }

        if (!TP.identical(this, test)) {
            TP.sys.logTest('"beforeEach" param1 and "beforeEach" this should be the same object', TP.ERROR);
        }
    });

    this.it('parameter check', function(test, options) {

        test.assert.isTrue(true);

        if (!TP.isKindOf(this, TP.test.Case)) {
            TP.sys.logTest('"it" this is of wrong type', TP.ERROR);
        }

        if (!TP.isKindOf(test, TP.test.Case)) {
            TP.sys.logTest('"it" param1 is of wrong type', TP.ERROR);
        }

        if (!TP.identical(this, test)) {
            TP.sys.logTest('"it" param1 and "it" this should be the same object', TP.ERROR);
        }
    });

    this.afterEach(function(test, options) {

        if (!TP.isKindOf(this, TP.test.Case)) {
            TP.sys.logTest('"afterEach" this is of wrong type', TP.ERROR);
        }

        if (!TP.isKindOf(test, TP.test.Case)) {
            TP.sys.logTest('"afterEach" param1 is of wrong type', TP.ERROR);
        }

        if (!TP.identical(this, test)) {
            TP.sys.logTest('"afterEach" param1 and "afterEach" this should be the same object', TP.ERROR);
        }
    });

    this.after(function(suite, options) {

        if (!TP.isKindOf(this, TP.test.Suite)) {
            TP.sys.logTest('"after" this is of wrong type', TP.ERROR);
        }

        if (!TP.isKindOf(suite, TP.test.Suite)) {
            TP.sys.logTest('"after" param1 is of wrong type', TP.ERROR);
        }

        if (!TP.identical(this, suite)) {
            TP.sys.logTest('"after" param1 and "after" this should be the same object', TP.ERROR);
        }
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite case skip check',
function() {

    this.it('case skip check 1', function(test, options) {
        test.assert.isTrue(true);

        TP.sys.logTest('You should see this - check 1', TP.DEBUG);
    });

    this.it('case skip check 2', function(test, options) {
        test.assert.isTrue(true);

        TP.sys.logTest('You should not see this - check 2', TP.DEBUG);
    }).skip();

    this.it('case skip check 3', function(test, options) {
        test.assert.isTrue(true);

        TP.sys.logTest('You should see this - check 3', TP.DEBUG);
    });

    this.it('case skip check 4', function(test, options) {
        test.assert.isTrue(true);

        TP.sys.logTest('You should see this - check 4', TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #1',
function() {

    this.it('suite skip check 1', function(test, options) {
        test.assert.isTrue(true);

        TP.sys.logTest('You should see this - check 1', TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #2',
function() {

    this.it('suite skip check 2', function(test, options) {
        test.assert.isTrue(true);

        TP.sys.logTest('You should not see this - check 2', TP.DEBUG);
    });
}).skip();

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #3',
function() {

    this.it('suite skip check 3', function(test, options) {
        test.assert.isTrue(true);

        TP.sys.logTest('You should see this - check 3', TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #4',
function() {

    this.it('suite skip check 4', function(test, options) {
        test.assert.isTrue(true);

        TP.sys.logTest('You should see this - check 4', TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite - promise chaining',
function() {

    this.before(
        function(suite, options) {
            //  A statement in the code body should be seen first
            TP.sys.logTest('You should see this - #1', TP.DEBUG);

            //  Then anything added to the internal promise
            this.chain(
                function() {
                    TP.sys.logTest('You should see this - #2', TP.DEBUG);
                });

            //  Then anything you do in a Promise that you hand back
            return TP.extern.Promise.resolve().then(
                    function() {
                        TP.sys.logTest('You should see this - #3', TP.DEBUG);
                    });
        });

    this.beforeEach(
        function(test, options) {
            //  A statement in the code body should be seen first
            TP.sys.logTest('You should see this - #4', TP.DEBUG);

            //  Then anything added to the internal promise
            this.chain(
                function() {
                    TP.sys.logTest('You should see this - #5', TP.DEBUG);
                });

            //  Then anything you do in a Promise that you hand back
            return TP.extern.Promise.resolve().then(
                    function() {
                        TP.sys.logTest('You should see this - #6', TP.DEBUG);
                    });
        });

    this.it('promise chain test', function(test, options) {

        test.assert.isTrue(true);

        //  A statement in the code body should be seen first
        TP.sys.logTest('You should see this - #7', TP.DEBUG);

        //  Then anything added to the internal promise
        this.chain(
            function() {
                TP.sys.logTest('You should see this - #8', TP.DEBUG);
            });

        //  Then anything you do in a Promise that you hand back
        return TP.extern.Promise.resolve().then(
                function(resolver, rejector) {
                    TP.sys.logTest('You should see this - #9', TP.DEBUG);
                });
    });

    this.afterEach(
        function(test, options) {
            //  A statement in the code body should be seen first
            TP.sys.logTest('You should see this - #10', TP.DEBUG);

            //  Then anything added to the internal promise
            this.chain(
                function() {
                    TP.sys.logTest('You should see this - #11', TP.DEBUG);
                });

            //  Then anything you do in a Promise that you hand back
            return TP.extern.Promise.resolve().then(
                    function() {
                        TP.sys.logTest('You should see this - #12', TP.DEBUG);
                    });
        });

    this.after(
        function(suite, options) {
            //  A statement in the code body should be seen first
            TP.sys.logTest('You should see this - #13', TP.DEBUG);

            //  Then anything added to the internal promise
            this.chain(
                function() {
                    TP.sys.logTest('You should see this - #14', TP.DEBUG);
                });

            //  Then anything you do in a Promise that you hand back
            return TP.extern.Promise.resolve().then(
                    function() {
                        TP.sys.logTest('You should see this - #15', TP.DEBUG);
                    });
        });
});

//  ------------------------------------------------------------------------
//  Described Suite tests
//  ------------------------------------------------------------------------

TP.test.DescribedSuite.loadFrom(
            TP.uc('~lib_test/src/tibet/testharness/' +
                    'described_suite_test_description.json'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
