//  ========================================================================
/**
 * @file TPTestSamples.js
 * @overview Simple sample tests for the TPTesting.js test harness logic.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */
//  ------------------------------------------------------------------------

/* global Q:true,
          AssertionFailed:true
*/

/**
 * Sample tests built specifically to exercise all the different ways a test
 * could pass, fail, or error out. A rough version of tests for the
 * promise-based test harness logic.
 */

//  ------------------------------------------------------------------------

Array.describe('Array type/local suite',
function() {
    this.it('passes explicitly', function() {
        this.pass();
    });

    this.it('fails explicitly', function() {
        this.fail();
    });

    this.it('errors explicitly', function() {
        this.error();
    });
});

Array.prototype.describe('Array.Inst suite',
function() {
    this.it('passes implicitly', function() {
    });

    this.it('passes implicitly with assert(true)', function() {
        this.assert(true);
    });

    this.it('fails implicitly', function() {
        throw new AssertionFailed('epic');
    });

    this.it('errors implicitly via throw', function() {
        throw new Error('oops');
    });

    this.it('errors implicitly via syntax or other error', function() {
        var thiswontwork;
        var foo;
        foo = thiswontwork;
    });
});

Array.prototype.describe('slice (syntax error in describe())',
function() {
        var thiswontwork;
        var foo;
        foo = thiswontwork;
    this.it('slices and dices', function() {
    });
});

Array.prototype.describe('slice (syntax error in it())',
function() {
    this.it('makes julienne fries (syntax error)', function() {
        var thiswontwork;
        var foo;
        foo = thiswontwork;
    });
});

TP.core.Resource.describe('core.Resource local suite',
function() {
    this.it('passes async via resolver', function() {
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                resolver();
            }, 1000);
        });
    });

    this.it('fails async via rejector', function() {
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                rejector();
            }, 1000);
        });
    });

    this.it('passes async via test.pass', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 1000);
        });
    });

    this.it('fails async via test.fail', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                test.fail();
                rejector();
            }, 1000);
        });
    });

    this.it('fails async via timeout', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                console.log('# say something to keep idle timer happy');
            }, 3000);
            setTimeout(function() {
                test.pass();
                resolver();
            }, 6000);
        });
    });

    this.it('passes sync via resolver', function() {
        return Q.Promise(function(resolver, rejector) {
            // Don't really need a promise, but we can use them anyway :)
            resolver();
        });
    });

    this.it('fails sync via rejector', function() {
        return Q.Promise(function(resolver, rejector) {
            // Don't really need a promise, but we can use them anyway :)
            rejector();
        });
    });
});

// Test for test.Suite only support. We'll see a fail() when running with
// ignore_only set to true.
TP.sig.Signal.Type.describe('fire',
function() {
    this.it('fails at signal type stuff', function() {
        this.fail();
    });
});

TP.sig.Signal.Type.describe('getSignalName',
function() {
    this.it('does signal type stuff only', function() {
        this.pass();
    });
    this.it('does more signal type stuff only', function() {
        this.pass();
    });
}).only();

// Test for test.Case only support. We'll see a fail() when running with
// ignore_only set to true due to the first test case below.
TP.sig.Signal.Inst.describe('sig.Signal Inst suite',
function() {
    this.it('fails at signal inst stuff', function() {
        this.fail();
    });
    this.it('does more signal inst stuff only', function() {
        this.pass();
    }).only();
});

// Test for test.Suite skip support. We'll see a fail() when running with
// ignore_skip set to true.
TP.lang.Object.Type.describe('lang.Object Type suite',
function() {
    this.it('fails at object type stuff', function() {
        this.fail();
    });
    this.it('fails at object type stuff again', function() {
        this.fail();
    });
}).skip();

// Test for test.Suite skip support. We'll see a fail() when running with
// ignore_skip set to true.
TP.lang.Object.Inst.describe('lang.Object Inst suite',
function() {
    this.it('fails at object inst stuff', function() {
        this.fail();
    }).skip();
    this.it('does object inst stuff', function() {
        this.pass();
    });
});

//
TP.lang.Object.describe('lang.Object Local suite',
function() {
    this.it('will eventually do object local stuff', function() {
        this.fail();
    }).todo();
});

String.describe('String type/local suite',
function() {
    this.it('passes simple test 1', function() {
        this.pass();
    });
    this.it('passes simple test 2', function() {
        this.pass();
    });
});


// Test for suite timeout. There are 6 cases here with 2900ms timers which
// should run as each previous case finishes. As a result we should see 5 pass
// and #6 fail because there's not enough time yet with a 15second suite
// timeout value.
TP.core.Resource.Inst.describe('getTriggerSignals',
function() {
    this.it('wastes time', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('wastes more time', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('wastes more and more time', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('wastes some more time', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('wastes yet more time', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                test.pass();
                resolver();
            }, 2900);
        });
    });
    this.it('should trigger suite timeout', function() {
        var test = this;
        return Q.Promise(function(resolver, rejector) {
            setTimeout(function() {
                // Fail since really this shouldn't run.
                test.fail();
                rejector();
            }, 2900);
        });
    });
});


//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

//TP.test.Suite.runTargetSuites(<targetObj>);
/*
TP.test.Suite.runTargetSuites(Array);
TP.test.Suite.runTargetSuites(Array.prototype);
TP.test.Suite.runTargetSuites(TP.core.Resource);
TP.test.Suite.runTargetSuites(TP.core.Resource.Type);
TP.test.Suite.runTargetSuites(TP.core.Resource.Inst);
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
