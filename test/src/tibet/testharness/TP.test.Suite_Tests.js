//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================


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

TP.test.Suite.Inst.describe('TP.test.Suite ordering check',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.TRACE);
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 2 or 5: ' + (++count),
                        TP.TRACE);
    });

    this.it('ordering check 1', function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.TRACE);
    });

    this.it('ordering check 2', function(test, options) {
        TP.sys.logTest('This should have an index of 6: ' + (++count),
                        TP.TRACE);
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 4 or 7: ' + (++count),
                        TP.TRACE);
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 8: ' + (++count),
                        TP.TRACE);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering with "it" Promises check 1',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.TRACE);
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 2 or 7: ' + (++count),
                        TP.TRACE);
    });

    this.it('ordering check 1', function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 5: ' + (++count),
                            TP.TRACE);
        });
        TP.sys.logTest('This should have an index of 4: ' + (++count),
                        TP.TRACE);
    });

    this.it('ordering check 2', function(test, options) {
        TP.sys.logTest('This should have an index of 8: ' + (++count),
                        TP.TRACE);
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 6 or 9: ' + (++count),
                        TP.TRACE);
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 10: ' + (++count),
                        TP.TRACE);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering with "it" Promises check 2',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.TRACE);
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 2 or 7: ' + (++count),
                        TP.TRACE);
    });

    this.it('ordering check 1', function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 5: ' + (++count),
                            TP.TRACE);
        });
        TP.sys.logTest('This should have an index of 4: ' + (++count),
                        TP.TRACE);
    });

    this.it('ordering check 2', function(test, options) {
        TP.sys.logTest('This should have an index of 8: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 10: ' + (++count),
                            TP.TRACE);
        });
        TP.sys.logTest('This should have an index of 9: ' + (++count),
                        TP.TRACE);
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 6 or 11: ' + (++count),
                        TP.TRACE);
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 12: ' + (++count),
                        TP.TRACE);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering with "it" Promises check 3',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 2: ' + (++count),
                            TP.TRACE);
        });
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 4: ' + (++count),
                            TP.TRACE);
        });
    });

    this.it('ordering check', function(test, options) {
        TP.sys.logTest('This should have an index of 5: ' + (++count),
                        TP.TRACE);
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 6: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 7: ' + (++count),
                            TP.TRACE);
        });
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 8: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 9: ' + (++count),
                            TP.TRACE);
        });
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering with "it" Promises check 4',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 2: ' + (++count),
                            TP.TRACE);
        });
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 4: ' + (++count),
                            TP.TRACE);
        });
    });

    this.it('ordering check', function(test, options) {
        TP.sys.logTest('This should have an index of 5: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 6: ' + (++count),
                            TP.TRACE);
        });
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 7: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 8: ' + (++count),
                            TP.TRACE);
        });
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 9: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 10: ' + (++count),
                            TP.TRACE);
        });
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering with "it" Promises check 5',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 2: ' + (++count),
                            TP.TRACE);
        });
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 3 or 9: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 5 or 11: ' + (++count),
                            TP.TRACE);
        });
    });

    this.it('ordering check', function(test, options) {
        TP.sys.logTest('This should have an index of 4: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 6: ' + (++count),
                            TP.TRACE);
        });
    });

    this.it('ordering check 2', function(test, options) {
        TP.sys.logTest('This should have an index of 10: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 12: ' + (++count),
                            TP.TRACE);
        });
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 7 or 13: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 8 or 14: ' + (++count),
                            TP.TRACE);
        });
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 15: ' + (++count),
                        TP.TRACE);
        this.then(function() {
            TP.sys.logTest('This should have an index of 16: ' + (++count),
                            TP.TRACE);
        });
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite case skip check',
function() {

    this.it('case skip check 1', function(test, options) {
        TP.sys.logTest('You should see this - check 1', TP.TRACE);
    });

    this.it('case skip check 2', function(test, options) {
        TP.sys.logTest('You should not see this - check 2', TP.TRACE);
    }).skip();

    this.it('case skip check 3', function(test, options) {
        TP.sys.logTest('You should see this - check 3', TP.TRACE);
    });

    this.it('case skip check 4', function(test, options) {
        TP.sys.logTest('You should see this - check 4', TP.TRACE);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #1',
function() {

    this.it('suite skip check 1', function(test, options) {
        TP.sys.logTest('You should see this - check 1', TP.TRACE);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #2',
function() {

    this.it('suite skip check 2', function(test, options) {
        TP.sys.logTest('You should not see this - check 2', TP.TRACE);
    });
}).skip();

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #3',
function() {

    this.it('suite skip check 3', function(test, options) {
        TP.sys.logTest('You should see this - check 3', TP.TRACE);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #4',
function() {

    this.it('suite skip check 4', function(test, options) {
        TP.sys.logTest('You should see this - check 4', TP.TRACE);
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.test.Suite.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
