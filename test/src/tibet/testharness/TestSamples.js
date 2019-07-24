//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/* global AssertionFailed:true
*/

/**
 * Sample tests built specifically to exercise all the different ways a test
 * could pass, fail, or error out. A rough version of tests for the
 * promise-based test harness logic.
 *
 * NB: All of these tests contain an assertion that is true. This is done so
 * that, even if the test case is meant to fail, that it doesn't do so because
 * the test harness reports that it has no assertions (which it *will* do), but
 * because some intentional failure mode was triggered.
 */

//  ------------------------------------------------------------------------

Array.describe('Array local',
function() {
    this.it('passes explicitly', function(test, options) {
        test.assert.isTrue(true);

        this.pass();
    });

    this.it('fails explicitly', function(test, options) {
        test.assert.isTrue(true);

        this.fail();
    });

    this.it('errors explicitly', function(test, options) {
        test.assert.isTrue(true);

        this.error();
    });
});

Array.Inst.describe('Array.Inst',
function() {
    this.it('passes implicitly', function(test, options) {
        test.assert.isTrue(true);
    });

    this.it('passes implicitly with assert(true)', function(test, options) {
        test.assert.assert(true);
    });

    this.it('fails implicitly', function(test, options) {
        test.assert.isTrue(true);
        throw new AssertionFailed('epic');
    });

    this.it('errors implicitly via throw', function(test, options) {
        test.assert.isTrue(true);
        throw new Error('oops');
    });

    this.it('errors implicitly via syntax or other error', function(test, options) {
        test.assert.isTrue(true);

        /* eslint-disable no-undef */
        foo = thiswontwork;
        /* eslint-enable */
    });
});

Array.Inst.describe('slice (syntax error in describe())',
function() {
    /* eslint-disable no-undef */
    foo = thiswontwork;
    /* eslint-enable */
    this.it('slices and dices', function(test, options) {
        test.assert.isTrue(true);
    });
});

Array.Inst.describe('slice (syntax error in it())',
function() {
    this.it('makes julienne fries (syntax error)', function(test, options) {
        test.assert.isTrue(true);

        /* eslint-disable no-undef */
        foo = thiswontwork;
        /* eslint-enable */
    });
});

TP.core.Resource.describe('core.Resource local',
function() {
    this.it('passes async via resolver', function(test, options) {
        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                resolver();
            }, 1000);
        });
    });

    this.it('fails async via rejector', function(test, options) {
        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                rejector();
            }, 1000);
        });
    });

    this.it('passes async via test.pass', function(test, options) {
        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 1000);
        });
    });

    this.it('fails async via test.fail', function(test, options) {
        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                test.fail();
                rejector();
            }, 1000);
        });
    });

    this.it('fails async via timeout', function(test, options) {
        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                /* eslint-disable no-console */
                console.log('# say something to keep idle timer happy');
                /* eslint-enable no-console */
            }, 3000);
            setTimeout(function() {
                test.pass();
                resolver();
            }, 6000);
        });
    });

    this.it('passes sync via resolver', function(test, options) {
        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            //  Don't really need a promise, but we can use them anyway :)
            resolver();
        });
    });

    this.it('fails sync via rejector', function(test, options) {
        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            //  Don't really need a promise, but we can use them anyway :)
            rejector();
        });
    });
});

//  Test for test.Suite only support. We'll see a fail() when running with
//  ignore_only set to true.
TP.sig.Signal.Type.describe('fire',
function() {
    this.it('fails at signal type stuff', function(test, options) {
        test.assert.isTrue(true);

        this.fail();
    });
});

TP.sig.Signal.Type.describe('getSignalName',
function() {
    this.it('does signal type stuff only', function(test, options) {
        test.assert.isTrue(true);

        this.pass();
    });
    this.it('does more signal type stuff only', function(test, options) {
        test.assert.isTrue(true);

        this.pass();
    });
// }).only();    //  Only comment this out if you want these 2 tests to run ;-)
});

//  Test for test.Case only support. We'll see a fail() when running with
//  ignore_only set to true due to the first test case below.
TP.sig.Signal.Inst.describe('sig.Signal Inst',
function() {
    this.it('fails at signal inst stuff', function(test, options) {
        test.assert.isTrue(true);

        this.fail();
    });
    this.it('does more signal inst stuff only', function(test, options) {
        test.assert.isTrue(true);

        this.pass();
    }).only();
});

TP.sig.Signal.Inst.describe('sig.Signal Inst - #2',
function() {
    this.it('fails at signal inst stuff', function(test, options) {
        test.assert.isTrue(true);

        this.fail();
    });
    this.it('does more signal inst stuff only', function(test, options) {
        test.assert.isTrue(true);

        this.pass();
    }).only();
});

//  Test for test.Suite skip support. We'll see a fail() when running with
//  ignore_skip set to true.
TP.lang.Object.Type.describe('lang.Object Type',
function() {
    this.it('fails at object type stuff', function(test, options) {
        test.assert.isTrue(true);

        this.fail();
    });
    this.it('fails at object type stuff again', function(test, options) {
        test.assert.isTrue(true);

        this.fail();
    });
}).skip();

//  Test for test.Suite skip support. We'll see a fail() when running with
//  ignore_skip set to true.
TP.lang.Object.Inst.describe('lang.Object Inst',
function() {
    this.it('fails at object inst stuff', function(test, options) {
        test.assert.isTrue(true);

        this.fail();
    }).skip();
    this.it('does object inst stuff', function(test, options) {
        test.assert.isTrue(true);

        this.pass();
    });
});

TP.lang.Object.describe('lang.Object Local',
function() {
    this.it('will eventually do object local stuff', function(test, options) {
        test.assert.isTrue(true);

        this.fail();
    }).todo();
});

String.describe('String local',
function() {
    this.it('passes simple test 1', function(test, options) {
        test.assert.isTrue(true);

        this.pass();
    });
    this.it('passes simple test 2', function(test, options) {
        test.assert.isTrue(true);

        this.pass();
    });
});

/* eslint-disable consistent-this */

//  Test for suite timeout. There are 6 cases here with 2900ms timers which
//  should run as each previous case finishes. As a result we should see 5 pass
//  and #6 fail because there's not enough time yet with a 15second suite
//  timeout value.
TP.core.Resource.Inst.describe('getTriggerSignals',
function() {
    this.it('wastes time', function() {
        var test;

        test = this;

        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('wastes more time', function() {
        var test;

        test = this;

        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('wastes more and more time', function() {
        var test;

        test = this;

        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('wastes some more time', function() {
        var test;

        test = this;

        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('wastes yet more time', function() {
        var test;

        test = this;

        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('should trigger suite timeout', function() {
        var test;

        test = this;

        test.assert.isTrue(true);

        return TP.extern.Promise.construct(function(resolver, rejector) {
            setTimeout(function() {
                // Fail since really this shouldn't run.
                test.fail();
                rejector();
            }, 2900);
        });
    });
});

/* eslint-enable consistent-this */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
