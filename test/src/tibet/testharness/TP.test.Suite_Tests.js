//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/* global Q:true
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
                        TP.DEBUG);
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 2 or 5: ' + (++count),
                        TP.DEBUG);
    });

    this.it('ordering check 1', function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.DEBUG);
    });

    this.it('ordering check 2', function(test, options) {
        TP.sys.logTest('This should have an index of 6: ' + (++count),
                        TP.DEBUG);
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 4 or 7: ' + (++count),
                        TP.DEBUG);
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 8: ' + (++count),
                        TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering with "it" Promises check 1',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.DEBUG);
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 2 or 7: ' + (++count),
                        TP.DEBUG);
    });

    this.it('ordering check 1', function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 5: ' + (++count),
                            TP.DEBUG);
        });
        TP.sys.logTest('This should have an index of 4: ' + (++count),
                        TP.DEBUG);
    });

    this.it('ordering check 2', function(test, options) {
        TP.sys.logTest('This should have an index of 8: ' + (++count),
                        TP.DEBUG);
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 6 or 9: ' + (++count),
                        TP.DEBUG);
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 10: ' + (++count),
                        TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering with "it" Promises check 2',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.DEBUG);
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 2 or 7: ' + (++count),
                        TP.DEBUG);
    });

    this.it('ordering check 1', function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 5: ' + (++count),
                            TP.DEBUG);
        });
        TP.sys.logTest('This should have an index of 4: ' + (++count),
                        TP.DEBUG);
    });

    this.it('ordering check 2', function(test, options) {
        TP.sys.logTest('This should have an index of 8: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 10: ' + (++count),
                            TP.DEBUG);
        });
        TP.sys.logTest('This should have an index of 9: ' + (++count),
                        TP.DEBUG);
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 6 or 11: ' + (++count),
                        TP.DEBUG);
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 12: ' + (++count),
                        TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering with "it" Promises check 3',
function() {

    var count;

    count = 0;

    this.before(function(suite, options) {
        TP.sys.logTest('This should have an index of 1: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 2: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 4: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.it('ordering check', function(test, options) {
        TP.sys.logTest('This should have an index of 5: ' + (++count),
                        TP.DEBUG);
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 6: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 7: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 8: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 9: ' + (++count),
                            TP.DEBUG);
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
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 2: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 3: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 4: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.it('ordering check', function(test, options) {
        TP.sys.logTest('This should have an index of 5: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 6: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 7: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 8: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 9: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 10: ' + (++count),
                            TP.DEBUG);
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
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 2: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.beforeEach(function(test, options) {
        TP.sys.logTest('This should have an index of 3 or 9: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 5 or 11: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.it('ordering check', function(test, options) {
        TP.sys.logTest('This should have an index of 4: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 6: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.it('ordering check 2', function(test, options) {
        TP.sys.logTest('This should have an index of 10: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 12: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.afterEach(function(test, options) {
        TP.sys.logTest('This should have an index of 7 or 13: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 8 or 14: ' + (++count),
                            TP.DEBUG);
        });
    });

    this.after(function(suite, options) {
        TP.sys.logTest('This should have an index of 15: ' + (++count),
                        TP.DEBUG);
        this.then(function() {
            TP.sys.logTest('This should have an index of 16: ' + (++count),
                            TP.DEBUG);
        });
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite ordering general test',
function() {

    //  NOTE: In this test, execution order is as follows:
    //
    //  Returned promises
    //  Promises created by 'thenPromise()'
    //  Promises created by 'then()'

    this.before(
        function() {
            var suite,
                newPromise;

            suite = this;

            TP.sys.logTest('This should have an index of 1');

            suite.then(
                function() {
                    TP.sys.logTest('This should have an index of 3');
                });

            suite.then(
                function() {
                    TP.sys.logTest('This should have an index of 4');

                    suite.then(
                        function() {
                            TP.sys.logTest('This should have an index of 5');
                        });

                    suite.then(
                        function() {
                            TP.sys.logTest('This should have an index of 6');
                        });
                });

            newPromise = Q.promise(
                    function(resolver, rejector) {
                        TP.sys.logTest('This should have an index of 2');
                        resolver();
                    });

            return newPromise;
        });

    this.beforeEach(
        function() {
            var theCase,
                newPromise;

            theCase = this;

            TP.sys.logTest('This should have an index of 7');

            theCase.then(
                function() {
                    TP.sys.logTest('This should have an index of 9');
                });

            theCase.then(
                function() {
                    TP.sys.logTest('This should have an index of 10');

                    theCase.then(
                        function() {
                            TP.sys.logTest('This should have an index of 11');
                        });

                    theCase.then(
                        function() {
                            TP.sys.logTest('This should have an index of 12');
                        });
                });

            newPromise = Q.promise(
                    function(resolver, rejector) {
                        TP.sys.logTest('This should have an index of 8');
                        resolver();
                    });

            return newPromise;
        });

    this.it('ordering general case', function(test, options) {

        var newPromise;

        TP.sys.logTest('This should have an index of 13');

        this.then(
            function() {
                TP.sys.logTest('This should have an index of 15');
            });

        this.then(
            function() {
                TP.sys.logTest('This should have an index of 16');

                test.then(
                    function() {
                        TP.sys.logTest('This should have an index of 18');
                    });

                test.then(
                    function() {
                        TP.sys.logTest('This should have an index of 19');

                        test.then(
                            function() {
                                TP.sys.logTest('This should have an index of 20');
                            });

                        test.then(
                            function() {
                                TP.sys.logTest('This should have an index of 21');
                            });
                    });

                test.then(
                    function() {
                        TP.sys.logTest('This should have an index of 22');
                    });

                test.thenPromise(
                    function(resolver, rejector) {
                        TP.sys.logTest('This should have an index of 17');
                        resolver();
                    });

                test.then(
                    function() {
                        TP.sys.logTest('This should have an index of 23');
                    });
            });

        this.then(
            function() {

                var newPromise;

                TP.sys.logTest('This should have an index of 24');

                newPromise = Q.promise(
                        function(resolver, rejector) {
                            TP.sys.logTest('This should have an index of 25');
                            resolver();
                        });

                return newPromise;
            });

        newPromise = Q.promise(
                function(resolver, rejector) {
                    TP.sys.logTest('This should have an index of 14');
                    resolver();
                });

        return newPromise;
    });

    this.afterEach(
        function() {
            var theCase,
                newPromise;

            theCase = this;

            TP.sys.logTest('This should have an index of 26');

            theCase.then(
                function() {
                    TP.sys.logTest('This should have an index of 28');
                });

            theCase.then(
                function() {
                    TP.sys.logTest('This should have an index of 29');

                    theCase.then(
                        function() {
                            TP.sys.logTest('This should have an index of 30');
                        });

                    theCase.then(
                        function() {
                            TP.sys.logTest('This should have an index of 31');
                        });
                });

            newPromise = Q.promise(
                    function(resolver, rejector) {
                        TP.sys.logTest('This should have an index of 27');
                        resolver();
                    });

            return newPromise;
        });

    this.after(
        function() {
            var suite,
                newPromise;

            suite = this;

            TP.sys.logTest('This should have an index of 32');

            suite.then(
                function() {
                    TP.sys.logTest('This should have an index of 34');
                });

            suite.then(
                function() {
                    TP.sys.logTest('This should have an index of 35');

                    suite.then(
                        function() {
                            TP.sys.logTest('This should have an index of 36');
                        });

                    suite.then(
                        function() {
                            TP.sys.logTest('This should have an index of 37');
                        });
                });

            newPromise = Q.promise(
                    function(resolver, rejector) {
                        TP.sys.logTest('This should have an index of 33');
                        resolver();
                    });

            return newPromise;
        });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite case skip check',
function() {

    this.it('case skip check 1', function(test, options) {
        TP.sys.logTest('You should see this - check 1', TP.DEBUG);
    });

    this.it('case skip check 2', function(test, options) {
        TP.sys.logTest('You should not see this - check 2', TP.DEBUG);
    }).skip();

    this.it('case skip check 3', function(test, options) {
        TP.sys.logTest('You should see this - check 3', TP.DEBUG);
    });

    this.it('case skip check 4', function(test, options) {
        TP.sys.logTest('You should see this - check 4', TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #1',
function() {

    this.it('suite skip check 1', function(test, options) {
        TP.sys.logTest('You should see this - check 1', TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #2',
function() {

    this.it('suite skip check 2', function(test, options) {
        TP.sys.logTest('You should not see this - check 2', TP.DEBUG);
    });
}).skip();

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #3',
function() {

    this.it('suite skip check 3', function(test, options) {
        TP.sys.logTest('You should see this - check 3', TP.DEBUG);
    });
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.describe('TP.test.Suite suite skip check - #4',
function() {

    this.it('suite skip check 4', function(test, options) {
        TP.sys.logTest('You should see this - check 4', TP.DEBUG);
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
