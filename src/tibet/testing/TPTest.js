//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 */

/* global AssertionFailed:true,
          $STATUS:true
*/

//  ========================================================================
//  TP.test namespace (and friends...)
//  ------------------------------------------------------------------------

TP.defineNamespace('TP.test');

//  Create a custom Error for use in Assert processing.
AssertionFailed = function(message) { this.message = message; };
AssertionFailed.prototype = new Error();
AssertionFailed.prototype.name = 'AssertionFailed';

//  ------------------------------------------------------------------------

TP.test.defineMethod('getCases',
function(options) {

    /**
     * Returns a list of target-specific test suites. The combination of target
     * and options settings determines which subsets of test suites will be
     * returned. Common filters are suite and cases which filter for either a
     * group of tests or specifically named tests.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @param {Object} [options.target] The test suite owner to filter for.
     * @param {String} [options.suite] If empty all suites are returned.
     * @param {String} [options.cases] If empty all cases are returned.
     * @param {String} [options.inherit=false] Target plus supertypes.
     * @returns {Array} A list of appropriate test cases for the options.
     */

    var suites,
        cases;

    suites = TP.test.getSuites(options);
    cases = suites.collect(function(suite) {
        return suite.getCaseList(options);
    });

    return cases.flatten();
});

//  ------------------------------------------------------------------------

TP.test.defineMethod('getSuites',
function(options) {

    /**
     * Returns a list of target-specific test suites. The combination of target
     * and options settings determines which subsets of test suites will be
     * returned. Common filters are suite and cases which filter for either a
     * group of tests or specifically named tests.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @param {Object} [options.target] The test suite owner to filter for.
     * @param {String} [options.suite] If empty all suites are returned.
     * @param {String} [options.cases] If empty all cases are returned.
     * @param {String} [options.inherit=false] Target plus supertypes.
     * @returns {Array} A list of appropriate test suites for the options.
     */

    var params,
        suites,
        id,
        target,
        targets,
        inherit,
        obj,
        filter,
        context,
        pattern;

    //  Ensure we have a consistent Hash for parameter lookups later on.
    params = TP.hc(options);

    //  Get the array of all suites. We'll be filtering this based on options.
    suites = TP.test.Suite.$get('suites');

    //  ---
    //  target filter
    //  ---

    //  If we have a specific target restrict our hash down to just that
    //  target's suites as a first step.
    target = params.at('target');
    if (TP.isValid(target)) {

        id = TP.id(target);
        if (TP.isEmpty(id)) {
            this.raise('InvalidID');
        }

        targets = [id];

        inherit = params.at('inherit');
        if (TP.isTrue(inherit)) {
            obj = TP.bySystemId(target);
            if (TP.canInvoke(obj, 'getSupertypeNames')) {
                targets.concat(obj.getSupertypeNames());
            }
        }

        //  Get the list of suites owned by the targeted object.
        suites = suites.filter(function(item) {
            return targets.contains(TP.id(item.suiteOwner));
        });
    }

    //  No options, or empty options (after conversion to hash) means full list.
    if (TP.notValid(options) || TP.isEmpty(params)) {
        return suites;
    }

    //  ---
    //  suite filter
    //  ---

    filter = params.at('suite');
    if (TP.notEmpty(filter)) {

        filter = filter.unquoted();
        if (/^\/.+\/([ig]*)$/.test(filter)) {
            pattern = RegExp.construct(filter);
        }

        suites = suites.filter(
                    function(suite) {
                        var name,
                            path;

                        name = suite.getSuiteName();
                        path = TP.objectGetSourcePath(suite) ||
                            TP.objectGetLoadPath(suite);

                        if (pattern) {
                            return pattern.match(name) ||
                                pattern.match(path);
                        } else {
                            return name === filter ||
                                path === filter;
                        }
                    });
    }

    //  ---
    //  context filter
    //  ---

    context = params.at('context') || 'app';
    if (context !== 'all') {

        suites = suites.filter(function(suite) {
            var path;

            path = TP.objectGetSourcePath(suite) ||
                TP.objectGetLoadPath(suite);

            switch (context) {
                case 'lib':
                    return path && path.indexOf('~lib') === 0;
                case 'app':     //  fall through
                default:
                    return path && path.indexOf('~app') === 0;
            }
        });
    }

    return suites;
});

//  ------------------------------------------------------------------------

TP.test.defineMethod('runSuites',
function(options) {

    /**
     * Runs the test suites for a target, or all targets if no specific target
     * object is provided.
     * @param {Object} target The object whose test suites should be run.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @param {String} [options.suite] If empty all suites are returned.
     * @param {String} [options.cases] If empty all cases are returned.
     * @param {Boolean} [options.ignore_only=true]
     * @param {Boolean} [options.ignore_skip=true]
     * @returns {Promise} A Promise to be used as necessary.
     */

    var target,
        suites,
        count,
        params,
        throwExceptions,
        throwHandlers,
        shouldLogSetting,
        promise,
        exclusives,
        summarize,
        total,
        msg;

    TP.sys.logTest('# TIBET starting test run', TP.DEBUG);

    //  Get filtered list of test suites that apply to our test criteria.
    suites = TP.test.getSuites(options);

    if (TP.isEmpty(suites)) {
        TP.sys.logTest('0..0');
        TP.sys.logTest('# PASS: 0 pass, 0 fail, 0 error, 0 skip, 0 todo.');
        return TP.extern.Promise.resolve();
    }

    //  Prep the inbound options for use by the reporting functions below.
    params = TP.hc(options);

    target = params.at('target');

    exclusives = TP.isTrue(params.at('ignore_only'));

    //  Filter for exclusivity. We might get more than one if authoring was off
    //  so check for that as well.
    if (exclusives === true) {
        TP.sys.logTest('# filtering for exclusive suite(s).', TP.WARN);
        suites = suites.filter(
                        function(suite) {
                            return suite.isExclusive();
                        });

        if (suites.length > 1) {
            msg = '# ' + suites.length +
                ' exclusive suite(s) found';
            if (TP.isValid(target)) {
                ' for ' + TP.name(target) + '.';
            } else {
                msg += '.';
            }
            TP.sys.logTest(msg, TP.WARN);
        }
    }

    //  Define a common summarize function we can invoke from either side of the
    //  promise callback handlers.
    summarize = function(obj) {
        var passed,
            failed,
            ignored,
            errored,
            skipped,
            prefix,
            cases;

        passed = 0;
        failed = 0;
        ignored = 0;
        errored = 0;
        skipped = 0;
        cases = 0;

        suites.perform(
                function(suite) {
                    var caselist,
                        stats;

                    caselist = suite.getCaseList(params);
                    stats = suite.get('statistics');

                    cases += caselist.getSize();

                    if (TP.notValid(stats)) {
                        //  Could be skipped, or there may have been 'only'
                        //  cases which weren't ignored. Either way the caselist
                        //  was skipped.
                        skipped += caselist.getSize();
                    } else {
                        passed += stats.at('passed');
                        failed += stats.at('failed');
                        errored += stats.at('errored');
                        ignored += stats.at('ignored');
                        skipped += stats.at('skipped');
                    }
                }, 0);

        if (failed !== 0 || errored !== 0) {
            prefix = '# FAIL: ';
        } else {
            prefix = '# PASS: ';
        }

        total = 0;
        total += passed + failed + errored + ignored + skipped;

        TP.sys.logTest('#');
        TP.sys.logTest(
            prefix +
            total + ' total, ' +
            passed + ' pass, ' +
            failed + ' fail, ' +
            errored + ' error, ' +
            skipped + ' skip, ' +
            ignored + ' todo.');

        TP.sys.setcfg('test.running', false);
    };

    msg = '# ' + suites.length +
        ' suite(s) found';
    if (TP.isValid(target)) {
        ' for ' + TP.name(target) + '.';
    } else {
        msg += '.';
    }
    TP.sys.logTest(msg, TP.DEBUG);

    count = 0;
    suites.perform(
            function(suite) {
                var caselist;

                caselist = suite.getCaseList(params);
                count += caselist.getSize();
            });

    TP.sys.logTest((count > 0 ? '1' : '0') + '..' + count);

    //  Capture the current setting of 'shouldThrowExceptions', 'shouldLogStack'
    //  and 'shouldThrowHandlers' and set them to true. This is so that:

    //      shouldThrowExceptions: any raise()ing of TIBET exceptions in any
    //      test case will cause TIBET to throw an Error and then the test case
    //      will be considered to be in 'error'.

    //      shouldLogStack: when Errors are thrown, should the stack be logged?
    //
    //      shouldThrowHandlers: when event handlers throw an Error, should the
    //      Error be thrown 'up' to callers higher in the stack.

    throwExceptions = TP.sys.shouldThrowExceptions();
    TP.sys.shouldThrowExceptions(true);

    shouldLogSetting = TP.sys.shouldLogStack();
    TP.sys.shouldLogStack(true);

    throwHandlers = TP.sys.shouldThrowHandlers();
    TP.sys.shouldThrowHandlers(true);

    /* eslint-disable handle-callback-err */

    //  Use reduce to convert our suite array into a chain of promises. We
    //  prime the list with a resolved promise to ensure 'current' receives all
    //  the suites during iteration while 'chain' is the last promise in the
    //  chain of promises being constructed.
    promise = suites.reduce(
            function(chain, current, index, array) {
                return chain.then(
                    function(obj) {
                        //return current.run(TP.hc(options));
                        return current.run(params);
                    },
                    function(err) {
                        //  Suite.run should trap all errors and resolve() so
                        //  the chain remains unbroken...unless we're doing an
                        //  early exit etc.
                        //  TODO: early exit?
                        void 0;
                    });
            }, TP.extern.Promise.resolve());

    TP.sys.setcfg('test.running', true);

    return promise.then(
            function(obj) {

                //  Restore settings of system error condition flags.
                TP.sys.shouldThrowExceptions(throwExceptions);
                TP.sys.shouldLogStack(shouldLogSetting);
                TP.sys.shouldThrowHandlers(throwHandlers);

                //  Summarize output
                summarize();
            },
            function(err) {

                //  Restore settings of system error condition flags.
                TP.sys.shouldThrowExceptions(throwExceptions);
                TP.sys.shouldLogStack(shouldLogSetting);
                TP.sys.shouldThrowHandlers(throwHandlers);

                //  Summarize output
                summarize();
            });
    /* eslint-enable handle-callback-err */
});

//  ========================================================================
//  TP.test.Root
//  ------------------------------------------------------------------------

/**
 * Common supertype for other TP.test objects like test.Case and test.Suite.
 */
TP.lang.Object.defineSubtype('test.Root');

//  Add support for job control status tracking and querying.

//  NB: For PhantomJS, we resolve the traits right away, due to a crashing bug.
TP.test.Root.addTraits(TP.core.JobStatus);

TP.test.Root.Inst.resolveTrait('resume', TP.core.JobStatus);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * Whether the test object is marked exclusive. If so it will be run exclusively
 * or a warning will be output if multiple 'exclusives' are found.
 * @type {Boolean}
 */
TP.test.Root.Inst.defineAttribute('exclusive');

/**
 * Whether the test object is marked todo. If so it will be run but any result
 * is effectively ignored.
 * @type {Boolean}
 */
TP.test.Root.Inst.defineAttribute('ignored');

/**
 * The millisecond timestamp at completion of the task.
 * @type {Number}
 */
TP.test.Root.Inst.defineAttribute('msend');

/**
 * The number of milliseconds the object is limited to for run time before
 * timing out. Default here is 60 seconds but this is reset by Suite and Case.
 * @type {Number}
 */
TP.test.Root.Inst.defineAttribute('mslimit',
                                    TP.sys.cfg('test.suite_mslimit'));

/**
 * The millisecond timestamp at start of the task.
 * @type {Number}
 */
TP.test.Root.Inst.defineAttribute('msstart');

/**
 * Whether the test object is marked skipped. If so it will be listed in output
 * but not actually run and it will be counted as skipped.
 * @type {Boolean}
 */
TP.test.Root.Inst.defineAttribute('skipped');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('getElapsedTime',
function() {

    /**
     * Returns the number of milliseconds of elapsed time for the operation.
     * @returns {Number}
     */

    var end,
        start;

    //  If we haven't started elapsed time is 0.
    start = this.get('msstart');
    if (TP.notValid(start)) {
        return 0;
    }

    //  If we've finished report based on that time, but otherwise assume we're
    //  asking for a value 'to this point in time' and use 'now' instead of end.
    end = this.get('msend');
    if (TP.notValid(end)) {
        end = Date.now();
    }

    return end - start;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('getTimeout',
function() {

    /**
     * Returns the millisecond timeout value for the test case.
     * @returns {Number}
     */

    return this.$get('mslimit');
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('getTimeRemaining',
function() {

    /**
     * Returns the number of milliseconds remaining between elapsed time and the
     * receiver's timeout value.
     * @returns {Number}
     */

    return Math.max(0, this.getTimeout() - this.getElapsedTime());
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isExclusive',
function() {

    /**
     * Returns true if the receiver is configured to be run exclusively.
     * @returns {Boolean} True if the receiver is exclusive.
     */

    return this.$get('exclusive') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isSkipped',
function() {

    /**
     * Returns true if the receiver is configured to be skipped (not run).
     * @returns {Boolean} True if the receiver is skipped.
     */

    return this.$get('skipped') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isTodo',
function() {

    /**
     * Returns true if the receiver is configured as a 'todo' test.
     * @returns {Boolean} True if the receiver is marked as a todo item.
     */

    return this.$get('ignored') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('only',
function() {

    /**
     * Marks the receiver as exclusive, meaning it should be the only item run
     * in a list of multiple items. When multiple items are marked as being
     * exclusive only the first of them will be run.
     * @returns {TP.test.Root} The receiver.
     */

    this.$set('exclusive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('reset',
function(options) {

    /**
     * Resets the receiver, putting instance variables back to their original
     * values so it can be run again.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {TP.test.Root} The receiver.
     */

    this.$set('result', null);

    this.$set('faultCode', null);
    this.$set('faultText', null);
    this.$set('faultInfo', null);

    this.$set('statusCode', null);
    this.$set('statusText', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('skip',
function(shouldSkip) {

    /**
     * Marks the receiver as skipped, meaning it will be listed but not run.
     * @param {Boolean} shouldSkip Whether or not to skip this test or suite.
     *     Defaults to true.
     * @returns {TP.test.Root} The receiver.
     */

    var skip;

    skip = TP.ifInvalid(shouldSkip, true);

    this.$set('skipped', skip);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('timeout',
function(ms) {

    /**
     * Defines a millisecond limit on how long the receiver can run before being
     * timed out (which cause the Case or Suite to fail).
     * @param {Number} ms The millisecond timeout value.
     * @returns {TP.test.Root} The receiver.
     */

    this.$set('mslimit', ms);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('todo',
function() {

    /**
     * Marks the receiver as todo, meaning it will be run but its result will
     * always be considered as a non-failure for overall reporting purposes.
     * @returns {TP.test.Root} The receiver.
     */

    this.$set('ignored', true);

    return this;
});


//  ========================================================================
//  TP.test.Suite
//  ------------------------------------------------------------------------

TP.test.Root.defineSubtype('Suite');

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

/**
 * The container for all defined test suites, keyed by target ID. Methods which
 * access this property refer to TP.test.Suite since it is not inherited by any
 * subtypes, it's local to the TP.test.Suite type.
 * @type {TP.core.Hash}
 */
TP.test.Suite.defineAttribute('suites', TP.ac());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.Suite.Type.defineMethod('addSuite',
function(target, suiteName, suiteFunc) {

    /**
     * Adds a new test suite to the list of known test suites.
     * @param {Object} target The object that owns the test suite.
     * @param {String} suiteName The name of the suite. Should be unique for the
     *     particular target.
     * @param {Function} suiteFunc The function representing the test suite.
     * @returns {TP.test.Suite} The newly created test suite instance.
     */

    var id,
        suites,
        suite;

    if (TP.notValid(target)) {
        this.raise('InvalidTarget');
        return;
    }

    id = TP.id(target);
    if (TP.isEmpty(id)) {
        this.raise('InvalidID');
    }

    suite = TP.test.Suite.construct(target, suiteName, suiteFunc);

    suites = TP.test.Suite.$get('suites');
    suites.push(suite);

    return suite;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * An optional teardown function to run after all test cases have been run.
 * @type {Function}
 */
TP.test.Suite.Inst.defineAttribute('afterAll');

/**
 * An optional teardown function to run after each test case is run.
 * @type {Function}
 */
TP.test.Suite.Inst.defineAttribute('afterEvery');

/**
 * The object that holds all of the test methods as an 'asserter'.
 * @type {TP.test.TestMethodCollection}
 */
TP.test.Suite.Inst.defineAttribute('asserter');

/**
 * An optional setup function to run before any test cases have been run.
 * @type {Function}
 */
TP.test.Suite.Inst.defineAttribute('beforeAll');

/**
 * An optional setup function to run before each test case is run.
 * @type {Function}
 */
TP.test.Suite.Inst.defineAttribute('beforeEvery');

/**
 * The list of test cases embodied by the suite functions.
 * @type {Array.<TP.test.Case>}
 */
TP.test.Suite.Inst.defineAttribute('caseList');

/**
 * A hash of 1..n 'drivers' used for things like fetching resources,
 * manipulating the GUI and running shell commands.
 * @type {TP.gui.Driver}
 */
TP.test.Suite.Inst.defineAttribute('drivers');

/**
 * A log appender that gets installed when the test harness is running to catch
 * errors and fail the current executing test case.
 * @type {TP.log.TestAppender}
 */
TP.test.Suite.Inst.defineAttribute('logAppender');

/**
 * The number of milliseconds the object is limited to for run time before
 * timing out. Defaults to 15 seconds for a test suite.
 * @type {Number}
 */
TP.test.Suite.Inst.defineAttribute('mslimit', 30000);

/**
 * The object that holds all of the test methods as a 'refuter'.
 * @type {TP.test.TestMethodCollection}
 */
TP.test.Suite.Inst.defineAttribute('refuter');

/**
 * A dictionary of statistics regarding pass, fail, error, and skip counts.
 * @type {TP.core.Hash}
 */
TP.test.Suite.Inst.defineAttribute('statistics');

/**
 * The object that owns the suite, the original object messaged via describe.
 * @type {Object}
 */
TP.test.Suite.Inst.defineAttribute('suiteOwner');

/**
 * List of individual suite functions registered under this suite name.
 * @type {Array.<Function>}
 */
TP.test.Suite.Inst.defineAttribute('suiteList');

/**
 * The name of the test suite for reporting/logging and lookup purposes.
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute('suiteName');

/**
 * A promise reference that points to the 'last promise' that was
 * allocated/initialized. Therefore, this promise reference can change as the
 * suite logic adds new Promises.
 * @type {Promise}
 */
TP.test.Suite.Inst.defineAttribute('$internalPromise');

/**
 * A promise reference that is kept by the test suite for use by test suite
 * logic as the suite works it's way through any 'stacking' logic whereby
 * fulfillment or rejection 'then()' handlers have 'then()' statements within
 * themselves. See the 'then()' method for more information.
 * @type {Promise}
 */
TP.test.Suite.Inst.defineAttribute('$currentPromise');

/**
 * Whether or not we're capturing signals.
 * @type {Boolean}
 */
TP.test.Suite.Inst.defineAttribute('$capturingSignals');

/**
 * What actual file location did this suite get loaded from?
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute(TP.LOAD_PATH);

/**
 * What is the original source location for this suite?
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute(TP.SOURCE_PATH);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('addSuite',
function(suiteFunc) {

    /**
     * Adds an additional suite function to the current test suite.
     * @param {Function} suiteFunc The test case-generating function.
     * @returns {Array.<Function>} The updated list of suite functions.
     */

    var suites;

    //  Clear any cached list of cases, the new function changes our result.
    this.$set('caseList', null);

    suites = this.$get('suiteList');
    suites.push(suiteFunc);

    return suites;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('after',
function(teardown) {

    /**
     * Defines an optional function to run after all test cases have
     * been executed.
     * @param {Function} teardown The 'after all' function to save.
     */

    this.set('afterAll', teardown);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('afterEach',
function(teardown) {

    /**
     * Defines an optional function to run after each test case has
     * been executed.
     * @param {Function} teardown The 'after each' function to save.
     */

    this.set('afterEvery', teardown);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('before',
function(setup) {

    /**
     * Defines an optional function to run before all test cases have
     * been executed.
     * @param {Function} setup The 'after all' function to save.
     */

    this.set('beforeAll', setup);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('beforeEach',
function(setup) {

    /**
     * Defines an optional function to run before all test cases have
     * been executed.
     * @param {Function} setup The 'after all' function to save.
     */

    this.set('beforeEvery', setup);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('executeAfter',
function(result, options) {

    var spy,

        func,

        drivers,
        thisArg,

        retVal;

    this.set('msend', Date.now());

    //  Run any after() which was registered.
    func = this.get('afterAll');
    if (TP.isCallable(func)) {

        //  We provide a 'then()', 'thenAllowGUIRefresh()', 'thenPromise()' and
        //  'thenWait()' API to our drivers.
        thisArg = this;

        drivers = this.$get('drivers');
        drivers.getKeys().perform(
                function(driverKey) {
                    drivers.at(driverKey).set('promiseProvider', thisArg);
                    if (driverKey === 'gui') {
                        drivers.at(driverKey).set('windowContext',
                                                    TP.sys.getUICanvas());
                    }
                });

        try {
            //  Call the Function with ourself as 'this' and then ourself again
            //  as the first parameter and the options as the second parameter
            retVal = func.call(this, this, options);
        } catch (e) {
            TP.sys.logTest('# error in after: ' + e.message);
        }

    }

    //  Set up a Promise to restore 'raise' from a spy and either chain it onto
    //  any Promise returned by the 'after()' method, or just make a new one.
    if (TP.isThenable(retVal)) {
        retVal.then(
                function() {
                    //  Restore the original TP.raise() call, uninstalling its
                    //  spy. See the 'executeBefore' method as to why we install
                    //  a spy on TP.raise().
                    spy = TP.raise;
                    TP.raise.restore();

                    //  Need to make sure that if the 'after()' method
                    //  'unsuspended' the TP.raise() call that we copy the value
                    //  from our spy over to the real spied function
                    TP.raise.$suspended = spy.$suspended;
                });
    } else {
        retVal = TP.extern.Promise.resolve().then(
                    function() {
                        //  Restore the original TP.raise() call, uninstalling
                        //  its spy. See the 'executeBefore' method as to why we
                        //  install a spy on TP.raise().
                        spy = TP.raise;
                        TP.raise.restore();

                        //  Need to make sure that if the 'after()' method
                        //  'unsuspended' the TP.raise() call that we copy the
                        //  value from our spy over to the real spied function
                        TP.raise.$suspended = spy.$suspended;
                    });
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('executeAfterEach',
function(currentcase, result, options) {

    var func,

        retVal;

    //  Run any afterEach which was registered.
    func = this.get('afterEvery');
    if (TP.isCallable(func)) {
        try {
            //  Call the Function with the current test case as 'this' and then
            //  it again as the first parameter and the options as the second
            //  parameter
            retVal = func.call(currentcase, currentcase, options);
        } catch (e) {
            TP.sys.logTest('# error in afterEach: ' + e.message);
        }
    }

    //  Set up a Promise to check on 'raise' from out spy and either chain it
    //  onto any Promise returned by the 'afterEach()' method, or just make a
    //  new one.
    if (TP.isThenable(retVal)) {
        retVal.then(
                function() {
                    //  Check to see if raise has been invoked. See the
                    //  'executeBefore' method as to why we install a spy on
                    //  TP.raise(). Note here how we check to make sure that
                    //  TP.raise() has the special 'shouldFailTest' property.
                    //  This is so that we can discern it from any other
                    //  stubs/spies that are installed by 'raises' or 'signals'
                    //  assertions.
                    if (TP.raise.called &&
                        TP.raise.shouldFailTest &&
                        !TP.raise.$suspended) {

                        currentcase.set('statusCode', TP.ACTIVE);
                        currentcase.fail();
                    }
                });
    } else {
        retVal = TP.extern.Promise.resolve().then(
                    //  Check to see if raise has been invoked. See the
                    //  'executeBefore' method as to why we install a spy on
                    //  TP.raise(). Note here how we check to make sure that
                    //  TP.raise() has the special 'shouldFailTest' property.
                    //  This is so that we can discern it from any other
                    //  stubs/spies that are installed by 'raises' or 'signals'
                    //  assertions.
                    function() {
                        if (TP.raise.called &&
                            TP.raise.shouldFailTest &&
                            !TP.raise.$suspended) {

                            currentcase.set('statusCode', TP.ACTIVE);
                            currentcase.fail();
                        }
                    });
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('executeBefore',
function(result, options) {

    var func,

        drivers,
        thisArg,

        retVal;

    //  Install a spy on TP.raise() so that any calls to it get tracked during
    //  testing. This is so that if any raise calls occur during the execution
    //  of a test, the test will fail. Many times, the try...catch machinery of
    //  TIBET will not propagate the error all of the way to the top, nor should
    //  they. Note that we also tag this call with a special 'shouldFailTest'
    //  property so that we can discern it from any other stubs/spies that are
    //  installed by 'raises' or 'signals' assertions.
    TP.raise = TP.raise.asSpy();
    TP.raise.shouldFailTest = true;

    this.set('msstart', Date.now());

    //  Run any before() which was registered.
    func = this.get('beforeAll');
    if (TP.isCallable(func)) {

        //  We provide a 'then()', 'thenAllowGUIRefresh()', 'thenPromise()' and
        //  'thenWait()' API to our drivers.
        thisArg = this;

        drivers = this.$get('drivers');
        drivers.getKeys().perform(
                function(driverKey) {
                    drivers.at(driverKey).set('promiseProvider', thisArg);
                    if (driverKey === 'gui') {
                        drivers.at(driverKey).set('windowContext',
                                                    TP.sys.getUICanvas());
                    }
                });

        try {
            //  Call the Function with ourself as 'this' and then ourself again
            //  as the first parameter and the options as the second parameter
            retVal = func.call(this, this, options);
        } catch (e) {
            TP.sys.logTest('# error in before: ' + e.message);
        }

        //  Need to make sure that if the 'before()' method 'suspended' the
        //  TP.raise() call that we copy the value from our spy over to the real
        //  spied function
        TP.raise.$spiedFunc.$suspended = TP.raise.$suspended;

        return retVal;
    }
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('executeBeforeEach',
function(currentcase, result, options) {

    var func,
        beforeEachRetVal,
        retVal;

    //  Run any beforeEach which was registered.
    func = this.get('beforeEvery');
    if (TP.isCallable(func)) {
        try {
            //  Call the Function with the current test case as 'this' and then
            //  it again as the first parameter and the options as the second
            //  parameter
            beforeEachRetVal = func.call(currentcase, currentcase, options);
        } catch (e) {
            TP.sys.logTest('# error in beforeEach: ' + e.message);
        }
    }

    retVal = TP.extern.Promise.resolve().then(
                function() {
                    //  Reset the raise invocation counter. See the
                    //  'executeBefore' method as to why we install a spy on
                    //  TP.raise().
                    TP.raise.reset();

                    if (TP.isThenable(beforeEachRetVal)) {
                        return beforeEachRetVal;
                    }
                });

    return retVal;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getDriver',
function(aKey) {

    /**
     * Returns the test driver associated with this case's overall test suite.
     * @param {String} aKey The key that the driver is registered under with the
     *     suite. If this isn't supplied, the default key 'gui' is used, which
     *     means this method will return the GUI driver.
     * @returns {Object} The test driver registered under aKey.
     */

    var driverKey;

    driverKey = TP.ifInvalid(aKey, 'gui');

    return this.$get('drivers').at(driverKey);
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getCaseList',
function(options) {

    /**
     * Runs the internal suite functions and returns the list of specific test
     * case instances created as a result. The 'suite functions' are the
     * functions passed to describe() which define the suite.
     * @param {TP.core.Hash} options A dictionary of test options. For this
     *     method the relevant key is 'cases' which provides a string to match
     *     against case names as a simple filter.
     * @returns {Array.<TP.test.Case>} The case list.
     */

    var cases,
        params,
        suites,
        filter,
        pattern,
        suite;

    params = TP.hc(options);
    cases = this.$get('caseList');

    if (TP.notValid(cases)) {
        cases = TP.ac();
        this.$set('caseList', cases);

        suite = this;

        //  Execute the suiteList functions to generate the case list.
        suites = this.$get('suiteList');
        suites.perform(
            function(func) {
                //  Running this function ends up invoking 'this.it()'
                //  against the test suite instance. See 'it()' for more
                //  information.
                try {
                    func.call(suite, suite.get('suiteOwner'), options);
                } catch (e) {
                    TP.sys.logTest(
                        '# error in describe(' + suite.getSuiteName() +
                        '): ' + e.message);

                    suite.error(e);
                }
            });
    }

    if (TP.notValid(options) || TP.isEmpty(params.at('cases'))) {
        return cases;
    }

    filter = params.at('cases');
    if (TP.notEmpty(filter)) {

        filter = filter.unquoted();
        if (/^\/.+\/([ig]*)$/.test(filter)) {
            pattern = RegExp.construct(filter);
        }

        cases = cases.filter(
                    function(casey) {
                        var name,
                            path;

                        name = casey.getCaseName();
                        path = TP.objectGetSourcePath(casey) ||
                            TP.objectGetLoadPath(casey);

                        if (pattern) {
                            return pattern.match(name) ||
                                pattern.match(path);
                        } else {
                            return name === filter ||
                                path === filter;
                        }
                    });
    }

    return cases;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getOUT',
function() {

    /**
     * Returns the object under test (i.e. the suite owner).
     * @returns {Object} The object under test.
     */

    return this.get('suiteOwner');
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getSuiteList',
function() {

    /**
     * Returns the list of define functions specific to this test suite.
     * @returns {Array.<Function>} An array of suite 'describe' functions.
     */

    return this.$get('suiteList');
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getSuiteName',
function() {

    /**
     * Returns the name of the suite as provided to 'describe'.
     * @returns {String} The suite name.
     */

    return this.$get('suiteName');
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('init',
function(target, suiteName, suiteFunc) {

    /**
     * Creates a new test suite instance.
     * @param {Object} target The object that owns the test suite.
     * @param {String} suiteName The name of the suite. Should be unique for the
     *     particular target.
     * @param {Function} suiteFunc The function representing the test suite.
     * @returns {TP.core.Hash} The new test suite instance.
     */

    if (TP.notValid(target) ||
            TP.notValid(suiteName) ||
            TP.notValid(suiteFunc)) {
        this.raise('InvalidArgument');
        return;
    }

    this.callNextMethod();

    this.$set('suiteOwner', target);
    this.$set('suiteName', suiteName);

    this.$set('suiteList', TP.ac());
    this.$get('suiteList').push(suiteFunc);

    this.$set('asserter',
        TP.test.TestMethodCollection.construct());
    this.$set('refuter',
        TP.test.TestMethodCollection.construct().set('isRefuter', true));
    this.$set('logAppender',
        TP.log.TestAppender.construct());

    this.$set('drivers', TP.hc());

    if (TP.sys.getTypeByName('TP.gui.Driver')) {
        this.$get('drivers').atPut('gui', TP.gui.Driver.construct());
    }

    //  Track load information to support context/file test filtering.
    this.$set(TP.LOAD_PATH, TP.boot[TP.LOAD_PATH]);
    this.$set(TP.SOURCE_PATH, TP.boot[TP.SOURCE_PATH]);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('it',
function(caseName, caseFunc) {

    /**
     * Defines a new TP.test.Case instance for the receiving test suite. This
     * function is typically invoked from within a 'describe' function. The
     * describe function itself is run during getCaseList processing to produce
     * the list of test cases.
     * @param {String} caseName The name assigned to the case. Should be unique
     *     for the specific test suite.
     * @param {Function} caseFunc The function implementing the test case.
     * @returns {TP.test.Case} The newly created test case.
     */

    var testCase,
        caseList;

    testCase = TP.test.Case.construct(this, caseName, caseFunc);
    if (TP.notValid(testCase)) {
        this.raise('InvalidTestCase');
        return;
    }

    caseList = this.$get('caseList');
    if (TP.notValid(caseList)) {
        caseList = TP.ac();
        this.$set('caseList', caseList, false);
    }
    caseList.push(testCase);

    return testCase;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('report',
function(options) {

    var statistics,

        caseList,
        passed,
        failed,
        errored,
        ignored,
        skipped,
        prefix,
        total;

    statistics = this.get('statistics');

    if (TP.notValid(statistics)) {
        passed = 0;
        failed = 0;
        errored = 0;
        skipped = 0;
        ignored = 0;

        caseList = this.getCaseList(options);
        caseList.perform(
                function(item) {
                    var status;

                    if (item.didSucceed()) {
                        if (item.isTodo()) {
                            ignored += 1;
                        } else {
                            passed += 1;
                        }
                    } else {
                        status = item.getStatusCode();

                        switch (status) {
                            case TP.CANCELLED:
                                errored += 1;
                                break;
                            case TP.ERRORED:
                                errored += 1;
                                break;
                            case TP.TIMED_OUT:
                                errored += 1;
                                break;
                            case TP.FAILED:
                                if (item.isTodo()) {
                                    ignored += 1;
                                } else {
                                    failed += 1;
                                }
                                break;
                            default:
                                // If no viable status code the job never ran,
                                // hence we'll consider it skipped.
                                skipped += 1;
                                break;
                        }
                    }
                });

        statistics = TP.hc('passed', passed,
                            'failed', failed,
                            'ignored', ignored,
                            'errored', errored,
                            'skipped', skipped);
        this.set('statistics', statistics);
    } else {
        passed = statistics.at('passed');
        failed = statistics.at('failed');
        skipped = statistics.at('skipped');
        ignored = statistics.at('ignored');
        errored = statistics.at('errored');
    }

    //  NOTE the didError check here is for 'describe' errors.
    if (this.didError() || failed !== 0 || errored !== 0) {
        prefix = '# fail: ';
    } else {
        prefix = '# pass: ';
    }

    total = 0;
    total += passed + failed + errored + ignored + skipped;

    TP.sys.logTest(
        prefix +
        total + ' total, ' +
        passed + ' pass, ' +
        failed + ' fail, ' +
        errored + ' error, ' +
        skipped + ' skip, ' +
        ignored + ' todo.',
        TP.DEBUG);

    //  Make sure uninstall the test appender from our default 'TP' and 'APP'
    //  logs as our last thing to do.
    TP.getDefaultLogger().removeAppender(this.get('logAppender'));
    APP.getDefaultLogger().removeAppender(this.get('logAppender'));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('reset',
function(options) {

    this.callNextMethod();

    this.$set('statistics', null);

    this.$set('caseList', null);

    this.$set('msstart', null);
    this.$set('msend', null);

    if (options && options.at('suite_timeout')) {
        this.$set('mslimit', options.at('suite_timeout'));
    }

    this.$set('$internalPromise', null);
    this.$set('$currentPromise', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('run',
function(options) {

    /**
     * Runs the test cases for the suite.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    //  Protect against running twice while we already have a pending promise.
    if (this.isActive()) {
        this.error(new Error('InvalidOperation'));
        return TP.extern.Promise.resolve();
    }

    return this.runTestCases(options);
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('runTestCases',
function(options) {

    /**
     * Executes the receiver's test cases, providing each with the options
     * object provided to help control execution.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    var caselist,
        statistics,
        result,
        suite,

        params,
        wantsOnly,

        firstPromise,

        finalAfterHandler;

    //  Make sure to clear out any previous state.
    this.reset(options);

    //  Output a small 'suite header'
    TP.sys.logTest('#', TP.DEBUG);
    TP.sys.logTest('# ' + this.get('suiteOwner').getID() +
                            '.describe(' + this.getSuiteName() +
                            ')',
                    TP.DEBUG);

    params = TP.hc(options);

    caselist = this.getCaseList(options);

    if (this.isSkipped() && !params.at('ignore_skip')) {
        statistics = TP.hc('passed', 0,
                            'failed', 0,
                            'ignored', 0,
                            'errored', 0,
                            'skipped', caselist.getSize());
        this.set('statistics', statistics);

        TP.sys.logTest('# SKIP - test suite skipped.', TP.DEBUG);
        TP.sys.logTest('# pass: 0 pass, 0 fail, 0 error, ' +
            this.get('statistics').at('skipped') + ' skip, 0 todo.');

        return TP.extern.Promise.resolve();
    }

    //  Filter for exclusivity. We might get more than one if authoring was off
    //  so check for that as well.
    if (!params.at('ignore_only')) {
        wantsOnly = caselist.some(
                function(test) {
                    return test.isExclusive();
                });

        if (wantsOnly) {
            TP.sys.logTest('# filtering for exclusive test cases.',
                            TP.WARN);

            caselist = caselist.filter(
                        function(test) {
                            return test.isExclusive();
                        });

            if (caselist.length > 1) {
                TP.sys.logTest('# ' + caselist.length +
                    ' exclusive test cases found.', TP.WARN);
            }
        }
    }

    //  Binding attribute for our promise closures below.
    suite = this;

    //  Generate the starter promise here.
    firstPromise = TP.extern.Promise.resolve();

    //  Run any 'before' hook for the suite *and reassign 'firstPromise' to
    //  it*. This will be the Promise that 'starts things off' below.
    firstPromise = firstPromise.then(
        function() {
            var beforeMaybe,
                generatedPromise;

            //  Make sure to install the test appender for our default 'TP' and
            //  'APP' logs as our first thing to do.
            TP.getDefaultLogger().addAppender(suite.get('logAppender'));
            APP.getDefaultLogger().addAppender(suite.get('logAppender'));

            //  Run any 'before' hook for the suite. Note that this may
            //  generate a Promise that will now be in '$internalPromise'.
            beforeMaybe = suite.executeBefore(null, options);

            //  Grab any internal promise that might have been created by
            //  running the 'before' hook. This might or might not exist.
            generatedPromise = suite.$get('$internalPromise');

            //  If the before method returned a Promise, hook it up into the
            //  chain.
            if (TP.isThenable(beforeMaybe)) {

                //  If there was also a valid internal Promise, chain it on.
                //  Otherwise, just return the Promise that was returned by the
                //  'before' hook.

                if (TP.isThenable(generatedPromise)) {
                    generatedPromise.then(
                        function() {
                            return beforeMaybe;
                        });
                } else {
                    return beforeMaybe;
                }
            }

            //  The 'before' hook did not return a Promise, but if it created an
            //  internal one, make sure to return that to keep things hooked up
            //  properly.
            if (TP.isThenable(generatedPromise)) {
                return generatedPromise;
            }
        });

    //  Use reduce to convert our caselist array into a chain of promises. We
    //  prime the list with a resolved promise to ensure 'current' receives all
    //  the cases during iteration while 'chain' is the last promise in the
    //  chain of promises being constructed.
    result = caselist.reduce(
            function(chain, current, index, array) {

                return chain.then(
                    function(obj) {
                        var beforeEachMaybe,
                            generatedPromise,
                            promise,

                            finalAfterEachHandler;

                        //  This may add to the '$internalPromise'
                        beforeEachMaybe = suite.executeBeforeEach(
                                                    current, obj, options);

                        //  A last promise can be obtained which means that
                        //  'beforeEach' must've generated one.
                        if (TP.isValid(generatedPromise = current.$get(
                                                '$internalPromise'))) {

                            //  If a Promise was also *returned* from executing
                            //  'beforeEach', then chain it onto the last
                            //  promise.
                            if (TP.isThenable(beforeEachMaybe)) {
                                promise = generatedPromise.then(
                                        function() {
                                            return beforeEachMaybe;
                                        }).then(
                                        function() {
                                            return current.run(TP.hc(options));
                                        });
                            } else {
                                //  No returned Promise, just a last promise.
                                promise = generatedPromise.then(
                                        function() {
                                            return current.run(TP.hc(options));
                                        });
                            }
                        } else {
                            //  Returned Promise, no last promise
                            if (TP.isThenable(beforeEachMaybe)) {
                                promise = beforeEachMaybe.then(
                                        function() {
                                            return current.run(TP.hc(options));
                                        });
                            } else {
                                //  Neither
                                promise = current.run(TP.hc(options));
                            }
                        }

                        finalAfterEachHandler =
                            function(resultObj) {
                                var afterEachMaybe,
                                    finalPromise;

                                //  Clear out *the currently executing Case's*
                                //  built-in Promise. Then, if the 'after each'
                                //  method schedules one, we'll check for it and
                                //  return it.
                                current.$set('$internalPromise', null);

                                afterEachMaybe = suite.executeAfterEach(
                                            current, resultObj, options);

                                //  A last promise can be obtained which means
                                //  that 'afterEach' must've generated one.
                                if (TP.isValid(finalPromise = current.$get(
                                                        '$internalPromise'))) {

                                    //  If a Promise was also *returned* from
                                    //  executing 'afterEach', then chain it
                                    //  onto the last promise.
                                    if (TP.isThenable(afterEachMaybe)) {
                                        return finalPromise.then(
                                                function() {
                                                    return afterEachMaybe;
                                                });
                                    } else {
                                        //  No returned Promise, just a last
                                        //  promise.
                                        return finalPromise;
                                    }
                                } else if (TP.isThenable(afterEachMaybe)) {
                                    //  Returned Promise, no last promise
                                    return afterEachMaybe;
                                }
                            };

                        //  Return the main test case Promise - all else follows
                        //  from that.
                        return promise.then(
                                        finalAfterEachHandler,
                                        finalAfterEachHandler);
                    },
                    function(err) {
                        //  TODO: the suite run() operation errored out, now
                        //  what?
                        //  At a minimum, error out the currently executing test
                        //  case with the error object
                        current.error(err);
                    });
            }, firstPromise);

    //  If all of the Promises for the Suite succeeded, or if one of them
    //  failed, we'll end in this handler. We define it separately so that we
    //  can use both for the success and failure handler.

    finalAfterHandler =
        function(resultObj) {
            var afterMaybe,
                finalPromise;

            //  Clear out our built-in Promise. Then, if the 'after' method
            //  schedules one, we'll check for it and return it.
            suite.$set('$internalPromise', null);

            try {
                //  Run any 'after' hook for the suite. Note that this may
                //  generate a Promise that will be in '$internalPromise'.
                afterMaybe = suite.executeAfter(resultObj, options);
            } finally {
                //  Output summary

                //  The 'after' method scheduled a Promise. Put a 'then()' on it
                //  that will generate the report *after* it runs and return
                //  that.
                if (TP.isValid(finalPromise = suite.$get('$internalPromise'))) {

                    //  If a Promise was also *returned* from executing 'after',
                    //  then chain it on the last Promise.
                    if (TP.isThenable(afterMaybe)) {
                        return finalPromise.then(
                                        function() {
                                            return afterMaybe;
                                        }).then(
                                        function() {
                                            suite.report(options);
                                        });
                    } else {
                        //  No returned Promise, just a last promise.
                        return finalPromise.then(
                                        function() {
                                            suite.report(options);
                                        });
                    }
                } else if (TP.isThenable(afterMaybe)) {
                    //  Returned Promise, no last promise
                    return afterMaybe.then(
                                    function() {
                                        suite.report(options);
                                    });
                } else {
                    //  Otherwise, just report.
                    suite.report(options);
                }
            }
        };

    //  'Finally' action for our caselist promise chain, run the 'after' hook.
    return result.then(finalAfterHandler, finalAfterHandler);
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('startTrackingSignals',
function(captureStackTraces) {

    /**
     * Starts tracking signals for usage by assertion methods.
     * @param {Boolean} captureStackTraces Whether or not to capture stack
     *     traces. This can impact test performance. The default is false.
     * @returns {TP.test.Suite} The receiver.
     */

    var func;

    this.set('$capturingSignals', true);

    //  If we're capturing stack traces, then we actually install a stub to do
    //  so.
    if (captureStackTraces) {
        func = TP.signal;

        TP.signal = TP.signal.asStub(
            function() {

                var stack;

                try {
                    throw new Error('Stack Trace');
                } catch (e) {
                    stack = TP.getStackInfo(e);
                }

                //  Note how we slice the first 3 off of the stack, since
                //  those are stacks inside of SinonJS that we're not
                //  interested in and this is important so that these stacks
                //  are synchronized with the call data accessible from
                //  Sinon.
                TP.signal.args.last().stack = stack.slice(3);

                return func.apply(TP, arguments);
            });
    } else {
        //  Otherwise, just install a simple spy.
        TP.signal = TP.signal.asSpy();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('stopTrackingSignals',
function() {

    /**
     * Stops tracking signals for usage by assertion methods.
     * @returns {TP.test.Suite} The receiver.
     */

    TP.signal.restore();

    this.set('$capturingSignals', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('then',
function(onFulfilled, onRejected) {

    /**
     * 'Then's onto our internally-held promise thereby, effectively queuing the
     * operation.
     * @param {Function} onFulfilled The Function to run to if the Promise has
     *     been fulfilled.
     * @param {Function} onRejected The Function to run to if the Promise has
     *     been rejected.
     * @returns {TP.test.Suite} The receiver.
     */

    var internalPromise,
        lastPromise,

        thisArg,

        _callback,
        _errback,

        newPromise;

    //  First, see if there's an existing internal promise. If not, create one
    //  and set the internal promise to be that.
    if (TP.notValid(internalPromise = this.$get('$internalPromise'))) {
        internalPromise = TP.extern.Promise.resolve();
        this.$set('$internalPromise', internalPromise);
    }

    //  Next, see if there's a 'current promise'. This is a Promise reference
    //  that would've been set 'higher up' (i.e. one frame back in a nested set
    //  of promises). If so, use that as the 'last promise' that we're going to
    //  append to. If not, use our internal promise.
    if (TP.notValid(lastPromise = this.$get('$currentPromise'))) {
        lastPromise = internalPromise;
    }

    thisArg = this;

    //  Make sure that a callback function is defined. Either the supplied one
    //  or a simple one that returns the value.
    if (!TP.isCallable(_callback = onFulfilled)) {
        _callback = function(value) {
            return value;
        };
    }

    //  Make sure that an errback function is defined. Either the supplied one
    //  or a simple one that rejects with the reason
    if (!TP.isCallable(_errback = onRejected)) {
        _errback = function(reason) {
            return TP.extern.Promise.reject(reason);
        };
    }

    //  'then' onto our last promise with fulfillment/rejection handlers that
    //  manage a 'stacking' of nested Promises.
    newPromise = lastPromise.then(
        function(result) {

            var subPromise,
                maybe,
                subReturnPromise;

            //  First, allocated a 'sub promise' and set it as the 'current
            //  promise'. This will be used as the 'last promise' (see above)
            //  for any nested 'then()' statements *inside* of the fulfillment
            //  handler.
            subPromise = TP.extern.Promise.resolve();
            thisArg.$set('$currentPromise', subPromise);

            //  Protect the callback in a try...catch to make sure that any
            //  errors result in the promise being rejected.
            try {
                maybe = _callback(result);
            } catch (e) {
                maybe = TP.extern.Promise.reject(e);
            }

            //  The fulfillment handler will have set the 'new promise' that it
            //  created as the 'current promise' (see below). We need that here.
            //  Note how we then null out the current promise - this is
            //  important to keep things straight.
            subReturnPromise = thisArg.$get('$currentPromise');
            thisArg.$set('$currentPromise', null);

            //  If we got a Promise back from the fulfillment handler, chain it
            //  on to the 'sub return promise' here.
            if (TP.isThenable(maybe)) {
                subReturnPromise = subReturnPromise.then(
                                        function() {
                                            return maybe;
                                        });
            }

            return subReturnPromise;
        },
        function(reason) {

            var subPromise,
                maybe,
                subReturnPromise;

            //  All of the same stuff above, except we're dealing with the
            //  rejection handler.

            subPromise = TP.extern.Promise.resolve();
            thisArg.$set('$currentPromise', subPromise);

            //  Protect the errback in a try...catch to make sure that any
            //  errors that could happen as part of the errback itself result in
            //  the promise being rejected.
            try {
                maybe = _errback(reason);
            } catch (e) {
                maybe = TP.extern.Promise.reject(e);
            }

            subReturnPromise = thisArg.$get('$currentPromise');
            thisArg.$set('$currentPromise', null);

            if (TP.isThenable(maybe)) {
                subReturnPromise = subReturnPromise.then(
                                        function() {
                                            return maybe;
                                        });
            }

            return subReturnPromise;
        });

    //  Set both our 'internal promise' (used to track the last promise
    //  allocated) and the 'current promise' to the new promise we just obtained
    //  by 'then()'ing onto the 'last promise' (which will either by the
    //  internal promise as obtained when we entered this method or the current
    //  promise set by our parent stack frame 'earlier' in our computation.
    this.$set('$currentPromise', newPromise);
    this.$set('$internalPromise', newPromise);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('thenAllowGUIRefresh',
function() {

    /**
     * A convenience mechanism to give the GUI a chance to refresh.
     * @returns {TP.test.Suite} The receiver.
     */

    this.thenPromise(
        function(resolver, rejector) {
            return TP.extern.Promise.delay(
                        TP.sys.cfg('test.anti_starve_timeout')).then(
                                                        resolver, rejector);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('thenPromise',
function(aFunction) {

    /**
     * A convenience mechanism to create a Promise with the supplied Function
     * and 'append it' (if you will) onto the current internally-held Promise.
     * Note that this operation will also reset the internally-held Promise to
     * be the new Promise that it creates.
     * @param {Function} aFunction The Function to run to fulfill the Promise.
     * @returns {TP.test.Suite} The receiver.
     */

    var internalPromise,
        subPromise,

        lastPromise,
        newPromise;

    //  First, see if there's an existing internal promise. If not, create one
    //  and set the internal promise to be that.
    if (TP.notValid(internalPromise = this.$get('$internalPromise'))) {
        internalPromise = TP.extern.Promise.resolve();
        this.$set('$internalPromise', internalPromise);
    }

    //  Next, see if there's a 'current promise'. This is a Promise reference
    //  that would've been set 'higher up' (i.e. one frame back in a nested set
    //  of promises). If so, use that as the 'last promise' that we're going to
    //  append to. If not, use our internal promise.
    if (TP.notValid(lastPromise = this.$get('$currentPromise'))) {
        lastPromise = internalPromise;
    }

    /* eslint-disable new-cap */
    //  Execute the supplied Function and wrap a Promise around the result.
    subPromise = TP.extern.Promise.construct(aFunction);
    /* eslint-enable new-cap */

    //  'then' onto our last promise, chaining on the promise we just
    //  allocated.
    newPromise = lastPromise.then(
        function() {
            return subPromise;
        });

    //  Set both our 'internal promise' (used to track the last promise
    //  allocated) and the 'current promise' to the new promise we just obtained
    //  by 'then()'ing onto the 'last promise' (which will either by the
    //  internal promise as obtained when we entered this method or the current
    //  promise set by our parent stack frame 'earlier' in our computation.
    this.$set('$currentPromise', newPromise);
    this.$set('$internalPromise', newPromise);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('thenWait',
function(timeoutMS) {

    /**
     * A convenience mechanism to wait a certain number of milliseconds using
     * the receiver's Promise machinery.
     * @param {Number} timeoutMS The number of milliseconds to wait.
     * @returns {TP.test.Suite} The receiver.
     */

    this.thenPromise(
        function(resolver, rejector) {
            return TP.extern.Promise.delay(timeoutMS).then(resolver, rejector);
        });

    return this;
});

//  ========================================================================
//  TP.test.Case
//  ------------------------------------------------------------------------

TP.test.Root.defineSubtype('Case');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * The object that holds all of the test methods as an 'asserter'.
 * @type {TP.test.TestMethodCollection}
 */
TP.test.Case.Inst.defineAttribute('assert');

/**
 * The specific test function containing assertions/expectations.
 * @type {Function}
 */
TP.test.Case.Inst.defineAttribute('caseFunc');

/**
 * The case name, used primarily for reporting when there's a failure.
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute('caseName');

/**
 * The number of milliseconds the object is limited to for run time before
 * timing out. Default is 3 seconds for a test case.
 * @type {Number}
 */
TP.test.Case.Inst.defineAttribute('mslimit',
                                    TP.sys.cfg('test.case_mslimit'));

/**
 * The object that holds all of the test methods as a 'refuter'.
 * @type {TP.test.TestMethodCollection}
 */
TP.test.Case.Inst.defineAttribute('refute');

/**
 * The test suite which owns this particular test case.
 * @type {TP.test.Suite}
 */
TP.test.Case.Inst.defineAttribute('suite');

/**
 * A promise reference that points to the 'last promise' that was
 * allocated/initialized. Therefore, this promise reference can change as the
 * test case logic adds new Promises.
 * @type {Promise}
 */
TP.test.Case.Inst.defineAttribute('$internalPromise');

/**
 * A promise reference that is kept by the test case for use by test case
 * logic as the case works it's way through any 'stacking' logic whereby
 * fulfillment or rejection 'then()' handlers have 'then()' statements within
 * themselves. See the 'then()' method for more information.
 * @type {Promise}
 */
TP.test.Case.Inst.defineAttribute('$currentPromise');

/**
 * The expectation that is kept by the test case for use by test case logic as
 * the test executes. Note that this expectation reference is recycled as the
 * test case executes, using the 'reset()' method on this object.
 * @type {TP.test.Expect}
 */
TP.test.Case.Inst.defineAttribute('$internalExpect');

TP.test.Case.Inst.defineAttribute('$resolver');
TP.test.Case.Inst.defineAttribute('$rejector');

/**
 * Whether or not we've executed at least one assertion.
 * @type {Boolean}
 */
TP.test.Case.Inst.defineAttribute('$executedAssertion');

/**
 * What actual file location did this test case get loaded from?
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute(TP.LOAD_PATH);

/**
 * What is the original source location for this test case?
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute(TP.SOURCE_PATH);


//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('errorJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * Internal method for handling errors thrown by test functions.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the error.
     */

    var msg,

        info;

    //  NOTE that even though we had an error we still resolve, not reject. This
    //  allows other test cases to continue to be processed.
    this.$resolve();

    this.set('msend', Date.now());

    msg = ('not ok - ' + this.getCaseName() + ' error' +
            (aFaultString ? ': ' + aFaultString : '')).trim();

    if (msg.charAt(msg.length - 1) !== '.') {
        msg += '.';
    }

    if (this.isTodo()) {
        msg += ' # TODO';
    }

    TP.sys.logTest(msg);

    info = TP.hc(aFaultInfo);

    if (TP.isError(info.at('error'))) {
        TP.sys.logTest(info.at('error'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('expect',
function(anObj) {

    /**
     * Creates (or recycles) and returns an expectation object which gives the
     *     test case access to a BDD-style 'expect' assertion interface for
     *     making assertions.
     * @param {Object} anObj The object to make assertions against.
     * @returns {TP.test.Expect} The expectation to use to make assertions.
     */

    var currentExpect;

    if (TP.notValid(currentExpect = this.get('$internalExpect'))) {
        currentExpect = TP.test.Expect.construct(anObj, this);
        this.set('$internalExpect', currentExpect);
    } else {
        currentExpect.reset(anObj);
    }

    return currentExpect;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('failJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * Internal method for handling notifications of test failures.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     */

    var msg,
        info;

    //  NOTE that even though we had a failure we still resolve, not reject.
    //  This allows other test cases to continue to be processed in the same
    //  chain with passing tasks.
    this.$resolve();

    this.set('msend', Date.now());

    msg = 'not ok - ' + this.getCaseName() +
        (aFaultString ? ': ' + aFaultString : '') + '.';

    if (this.isTodo()) {
        msg += ' # TODO';
    }

    TP.sys.logTest(msg);

    info = TP.hc(aFaultInfo);

    if (TP.isError(info.at('error'))) {
        TP.sys.logTest(info.at('error'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('failUsingResponse',
function(aResponse) {

    /**
     * Fail the receiver using information from the supplied response.
     * @param {TP.sig.Response} aResponse The response to pull the fault text,
     *     fault code and fault stack from.
     */

    var req;

    req = aResponse.getRequest();

    //  We need to set the status code back to TP.ACTIVE here - the test thinks
    //  it has completed, but since this is being called from an asynchronous
    //  callback and it failed, then need to 'reactivate' the test and fail it.
    this.set('statusCode', TP.ACTIVE);

    return this.fail(req.getFaultText(),
                        req.getFaultCode(),
                        req.getFaultInfo());
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getCaseName',
function() {

    /**
     * Returns the individual case name.
     * @returns {String} The case name.
     */

    return this.$get('caseName');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getCircularKeys', function() {

    /**
     * Returns a known list of keys for the receiver that will cause a circular
     * reference to eventually occur. Used by asString/asSource to allow certain
     * types to avoid circular reference issues when producing simple string
     * representations.
     * @return {Array} For test cases the 'suite' key can be circular.
     */

    //  The test suite will refer to case lists. The 'assert' and 'refute'
    //  keys reference the test collection which refer to current test case.
    return ['assert', 'refute', 'suite'];
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getDriver',
function(aKey) {

    /**
     * Returns the test driver associated with this case's overall test suite.
     * @param {String} aKey The key that the driver is registered under with the
     *     suite. If this isn't supplied, the default key 'gui' is used, which
     *     means this method will return the GUI driver.
     * @returns {Object} The test driver registered under aKey.
     */

    var driverKey;

    driverKey = TP.ifInvalid(aKey, 'gui');

    return this.getSuite().$get('drivers').at(driverKey);
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getOUT',
function() {

    /**
     * Returns the object under test (i.e. the case's suite owner).
     * @returns {Object} The object under test.
     */

    return this.getSuite().get('suiteOwner');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getStatus',
function() {

    /**
     * Returns the result status for the test case, if it has finished.
     * @returns {Number} The status code.
     */

    return this.$get('statusCode');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getSuite',
function() {

    /**
     * Returns the TP.test.Suite that owns this test case.
     * @returns {TP.test.Suite}
     */

    return this.$get('suite');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('init',
function(suite, caseName, caseFunc) {

    /**
     * Defines a new TP.test.Case instance for the receiving test suite.
     * @param {Object} suite The suite that owns the test case.
     * @param {String} caseName The name assigned to the case. Should be unique
     *     for the specific test suite.
     * @param {Function} caseFunc The function implementing the test case.
     * @returns {TP.test.Case} The newly created test case.
     */

    if (TP.notValid(suite) ||
            TP.notValid(caseName) ||
            TP.notValid(caseFunc)) {
        this.raise('InvalidArgument');
        return;
    }

    this.callNextMethod();

    this.$set('suite', suite);

    this.$set('caseName', caseName);
    this.$set('caseFunc', caseFunc);

    //  Track load information to support context/file test filtering. NOTE that
    //  we use the suite path information here because until the suite actually
    //  invokes the suite function the 'it' calls are not run and hence the case
    //  won't reflect where it was truly defined.
    this.$set(TP.LOAD_PATH, suite[TP.LOAD_PATH]);
    this.$set(TP.SOURCE_PATH, suite[TP.SOURCE_PATH]);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getFiredSignalInfos',
function(flags) {

    /**
     * Returns an Array of hashes of information about the argument sets of the
     *     signals fired using the TP.signal spy since it was last reset.
     * @param {Object} [flags] The 'flags' parameter is a method parameter set.
     *     Properties can be any combination of the following:
     *          {Boolean} [verbose=false] Whether or not to include extra signal
     *                  information, such as signal payload, policy and type.
     *                  The default is false, which means that only the signal
     *                  origin and signal name are included.
     *          {Boolean} [wantsRequests=false] Whether or not to include all of
     *                  the sets of signal arguments, including TP.sig.Requests,
     *                  fired since the spy was last reset when retrieving the
     *                  information. The default is false.
     *          {Boolean} [localID=false] Whether or not to use the local ID
     *                  rather than the global ID for the signal origin. The
     *                  default is false (use the global ID).
     * @returns {Array} A list of hashes of information about the argument sets
     *     of the signals fired using the TP.signal spy.
     */

    var info;

    info = TP.ac();

    this.getFiredSignals(flags).perform(
            function(entry, index) {
                info.push(this.getFiredSignalInfoAt(index, flags));
            }.bind(this));

    return info;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getFiredSignalInfosString',
function(flags) {

    /**
     * Returns a String representation of the Array of hashes of information
     *     about the argument sets of the signals fired using the TP.signal spy
     *     since it was last reset.
     * @param {Object} [flags] The 'flags' parameter is a method parameter set.
     *     Properties can be any combination of the following:
     *          {Boolean} [verbose=false] Whether or not to include extra signal
     *                  information, such as signal payload, policy and type.
     *                  The default is false, which means that only the signal
     *                  origin and signal name are included.
     *          {Boolean} [wantsRequests=false] Whether or not to include all of
     *                  the sets of signal arguments, including TP.sig.Requests,
     *                  fired since the spy was last reset when retrieving the
     *                  information. The default is false.
     *          {Boolean} [localID=false] Whether or not to use the local ID
     *                  rather than the global ID for the signal origin. The
     *                  default is false (use the global ID).
     * @returns {String} A String representation of the list of hashes of
     *     information about the argument sets of the signals fired using the
     *     TP.signal spy.
     */

    var str;

    str = this.getFiredSignalInfos(flags).asDisplayString(
                TP.hc('itemSeparator', '\n',
                        'kvSeparator', '  :  ',
                        'valueTransform',
                                function(it) {
                                    if (TP.isArray(it)) {
                                        return it.join(', ');
                                    }

                                    return TP.str(it);
                                }));

    return str;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getFiredSignals',
function(flags) {

    /**
     * Returns an Array of the set of arguments of the signals fired using the
     *     TP.signal spy since it was last reset.
     * @param {Object} [flags] The 'flags' parameter is a method parameter set.
     *     Properties can be any combination of the following:
     *          {Boolean} [verbose=false] Whether or not to include extra signal
     *                  information, such as signal payload, policy and type.
     *                  The default is false, which means that only the signal
     *                  origin and signal name are included.
     *          {Boolean} [wantsRequests=false] Whether or not to include all of
     *                  the sets of signal arguments, including TP.sig.Requests,
     *                  fired since the spy was last reset when retrieving the
     *                  information. The default is false.
     *          {Boolean} [localID=false] Whether or not to use the local ID
     *                  rather than the global ID for the signal origin. The
     *                  default is false (use the global ID).
     * @returns {Array} A list of sets of signal arguments fired using the
     *     TP.signal spy.
     */

    //  If the caller wants TP.sig.Requests as well (false by default), then we
    //  hand back all of the invocations of 'TP.signal'.
    if (TP.isValid(flags) && flags.wantsRequests) {
        return TP.signal.args;
    }

    //  Normally, though, they're interested in just non-TP.sig.Request signals
    return TP.signal.args.reject(
                function(entry) {
                    return /TP\.sig\.(\w*)Request/.test(entry.first());
                });
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getFiredSignalInfoAt',
function(signalIndex, flags) {

    /**
     * Returns a hash of information about the argument set of the signal at
     *     signalIndex within the Array of signals fired using the TP.signal spy
     *     since it was last reset.
     * @param {Number} signalIndex The index of the desired signal info in the
     *     list of all of the signals that have been gathered since the last
     *     reset.
     * @param {Object} [flags] The 'flags' parameter is a method parameter set.
     *     Properties can be any combination of the following:
     *          {Boolean} [verbose=false] Whether or not to include extra signal
     *                  information, such as signal payload, policy and type.
     *                  The default is false, which means that only the signal
     *                  origin and signal name are included.
     *          {Boolean} [wantsRequests=false] Whether or not to include all of
     *                  the sets of signal arguments, including TP.sig.Requests,
     *                  fired since the spy was last reset when retrieving the
     *                  information. The default is false.
     *          {Boolean} [localID=false] Whether or not to use the local ID
     *                  rather than the global ID for the signal origin. The
     *                  default is false (use the global ID).
     * @returns {TP.core.Hash} A hash of information about the argument set of
     *     the signal at the given index.
     */

    var reportFlags,

        signalArgs,
        info,

        sigOrigin,
        sigType,

        typeName;

    reportFlags = TP.ifInvalid(flags, {});

    signalArgs = this.getFiredSignals(reportFlags).at(signalIndex);
    if (!TP.isArray(signalArgs)) {
        return null;
    }

    info = TP.hc();

    if (TP.isArray(sigOrigin = signalArgs.at(0))) {
        sigOrigin = sigOrigin.collect(
                        function(item) {
                            if (TP.isString(item)) {
                                if (reportFlags.localID) {
                                    return item.slice(item.indexOf('#') + 1);
                                } else {
                                    return item;
                                }
                            } else {
                                if (reportFlags.localID) {
                                    return TP.lid(item);
                                } else {
                                    return TP.id(item);
                                }
                            }
                        });
    } else {
        if (TP.isString(sigOrigin)) {
            if (reportFlags.localID) {
                sigOrigin = sigOrigin.slice(sigOrigin.indexOf('#') + 1);
            }
        } else {
            if (reportFlags.localID) {
                sigOrigin = TP.lid(sigOrigin);
            } else {
                sigOrigin = TP.id(sigOrigin);
            }
        }
    }

    info.atPut('origin', sigOrigin);
    info.atPut('signame', TP.str(signalArgs.at(1)));

    if (TP.isTrue(reportFlags.verbose)) {
        info.atPut('payload', signalArgs.at(2));
        info.atPut('policy', TP.str(signalArgs.at(3)));

        if (!TP.isType(sigType = TP.sys.getTypeByName(info.at('signame')))) {
            if (TP.notEmpty(typeName = TP.str(signalArgs.at(4)))) {
                sigType = TP.sys.getTypeByName(typeName);
            }
        }

        if (TP.isType(sigType)) {
            info.atPut('sigtype', TP.name(sigType));
        }
    }

    return info;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getFiredSignalNames',
function(flags) {

    /**
     * Returns an Array of the names of the signals fired using the TP.signal
     *     spy since it was last reset.
     * @param {Object} [flags] The 'flags' parameter is a method parameter set.
     *     Properties can be any combination of the following:
     *          {Boolean} [verbose=false] Whether or not to include extra signal
     *                  information, such as signal payload, policy and type.
     *                  The default is false, which means that only the signal
     *                  origin and signal name are included.
     *          {Boolean} [wantsRequests=false] Whether or not to include all of
     *                  the sets of signal arguments, including TP.sig.Requests,
     *                  fired since the spy was last reset when retrieving the
     *                  information. The default is false.
     *          {Boolean} [localID=false] Whether or not to use the local ID
     *                  rather than the global ID for the signal origin. The
     *                  default is false (use the global ID).
     * @returns {Array} A list of the signal names fired using the TP.signal spy.
     */

    return this.getFiredSignals(flags).collect(
                function(entry) {
                    return entry.at(1);
                });
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getFiredSignalStacks',
function(flags) {

    /**
     * Returns an Array of the stack traces of the signals fired using the
     *     TP.signal spy since it was last reset.
     * @param {Object} [flags] The 'flags' parameter is a method parameter set.
     *     Properties can be any combination of the following:
     *          {Boolean} [verbose=false] Whether or not to include extra signal
     *                  information, such as signal payload, policy and type.
     *                  The default is false, which means that only the signal
     *                  origin and signal name are included.
     *          {Boolean} [wantsRequests=false] Whether or not to include all of
     *                  the sets of signal arguments, including TP.sig.Requests,
     *                  fired since the spy was last reset when retrieving the
     *                  information. The default is false.
     *          {Boolean} [localID=false] Whether or not to use the local ID
     *                  rather than the global ID for the signal origin. The
     *                  default is false (use the global ID).
     * @returns {Array} A list of the signal stack traces fired using the
     *     TP.signal spy.
     */

    return this.getFiredSignals(flags).collect(
                function(entry) {
                    return entry.stack;
                });
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('only',
function() {

    /**
     * Marks the receiver as exclusive, meaning it should be the only item
     * run in a list of multiple items. When multiple items are marked as being
     * exclusive only the first of them will be run.
     */

    this.$set('exclusive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('pass',
function() {

    /**
     * Handles notification that the test case passed (or more accurately that
     * it didn't fail and didn't error out).
     */

    var msg;

    if (this.isCompleting() || this.didComplete()) {
        return;
    }

    this.complete();
    this.$resolve();

    this.set('msend', Date.now());

    msg = 'ok - ' + this.getCaseName() + '.';

    if (this.isTodo()) {
        msg += ' # TODO';
    }

    TP.sys.logTest(msg);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('$reject',
function() {

    this.$rejector();

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('$resolve',
function() {

    if (!this.$resolver) {
        /* jshint -W087 */
        /* eslint-disable no-debugger */
        debugger;
        /* eslint-enable no-debugger */
        /* jshint +W087 */
    }

    this.$resolver();

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('reset',
function(options) {

    var drivers;

    this.callNextMethod();

    this.$set('msstart', null);
    this.$set('msend', null);

    this.$set('$internalPromise', null);
    this.$set('$currentPromise', null);

    this.$set('$resolver', null);
    this.$set('$rejector', null);

    this.$set('assert', null);
    this.$set('refute', null);

    this.$set('$executedAssertion', false);

    if (options && options.at('case_timeout')) {
        this.$set('mslimit', options.at('case_timeout'));
    }

    //  We provide a 'then()', 'thenAllowGUIRefresh()', 'thenPromise()' and
    //  'thenWait()' API to our drivers, but we need to reset the reference here
    //  to avoid leaks.
    drivers = this.getSuite().$get('drivers');
    drivers.getKeys().perform(
            function(driverKey) {
                drivers.at(driverKey).set('promiseProvider', null);
                if (driverKey === 'gui') {
                    drivers.at(driverKey).set('windowContext', null);
                }
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('run',
function(options) {

    /**
     * Creates and returns a promise which runs the test case. You can leverage
     * the 'then' method of the Promise API to take action upon success or
     * failure of the test case.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    var params,
        promise,
        testcase,
        timeout;

    params = TP.hc(options);

    //  Protect against running twice while we already have a pending promise.
    if (this.isActive()) {
        this.error(new Error('InvalidOperation'));
        return TP.extern.Promise.resolve();
    }

    //  Make sure to clear out any previous state and update from our options
    //  data (if any).
    this.reset(options);

    //  Compute a timeout value. Normally we'd go with timeout values directly
    //  from the test case, but to time out the test suite we need to compute
    //  the time remaining for the suite and use the smaller of the two values.
    timeout = Math.min(this.getTimeout(), this.getSuite().getTimeRemaining());

    //  Binding variable for closures below.
    testcase = this;

   /* eslint-disable new-cap */
    promise = TP.extern.Promise.construct(
            function(resolver, rejector) {
                var asserter,
                    refuter,
                    logAppender,

                    drivers,

                    internalPromise,
                    maybe;

                //  Set up state for the testcase case
                asserter = testcase.getSuite().get('asserter');
                asserter.$set('currentTestCase', testcase);
                testcase.$set('assert', asserter);

                refuter = testcase.getSuite().get('refuter');
                refuter.$set('currentTestCase', testcase);
                testcase.$set('refute', refuter);

                logAppender = testcase.getSuite().get('logAppender');
                logAppender.$set('currentTestCase', testcase);

                //  The testcase provides a 'then()', 'thenAllowGUIRefresh()',
                //  'thenPromise()' and 'thenWait()' API to our drivers, so we
                //  need to reset the reference here to it each time.
                drivers = testcase.getSuite().$get('drivers');
                drivers.getKeys().perform(
                    function(driverKey) {
                        drivers.at(driverKey).set('promiseProvider', testcase);
                        if (driverKey === 'gui') {
                            drivers.at(driverKey).set('windowContext',
                                                        TP.sys.getUICanvas());
                        }
                    });

                //  Capture references to the resolve/reject operations we can
                //  use from the test case itself. Do this first so any errors
                //  below will still be able to depend on these hooks being in
                //  place.
                testcase.set('$resolver', resolver);
                testcase.set('$rejector', rejector);

                if (testcase.isSkipped() && !params.at('ignore_skip')) {
                    TP.sys.logTest(
                            'ok - ' + testcase.getCaseName() + ' # SKIP');
                    resolver();

                    return;
                }

                //  NOTE: do this after checking for deferred so we don't end up
                //  with timing values for something we never ran.
                testcase.set('msstart', Date.now());

                try {

                    //  Note that inside the test method we bind to the Case
                    //  instance. Also note that 'maybe' might be a Promise that
                    //  the test case author returned to us. Also also note that
                    //  we check $STATUS here in case we hit bottom or had a
                    //  stack overflow, or for any other reason didn't get an
                    //  Error but failed for some reason.
                    $STATUS = TP.SUCCESS;

                    maybe = testcase.$get('caseFunc').call(
                                            testcase, testcase, options);

                    //  Now, check to see if there is an internal promise.

                    if (TP.notValid(internalPromise =
                                        testcase.$get('$internalPromise'))) {

                        //  If there is no internal Promise, then just see if
                        //  'maybe' contains a Promise that was returned from
                        //  the test case.
                        //  If 'maybe' contains a Promise (or at least a
                        //  'thenable'), use it.
                        if (TP.isThenable(maybe)) {

                            //  NB: We use 'done()' here rather than 'then()'
                            //  as per the recommendation of the Q
                            //  documentation.
                            maybe.done(
                                function(obj) {

                                    //  Make sure to set the testcase to be
                                    //  ignored if the entire test suite is
                                    //  being ignored (to get proper count data
                                    //  and assertion execution checking).
                                    if (testcase.getSuite().get('ignored')) {
                                        testcase.set('ignored', true);
                                    }

                                    //  As a final check, we make sure that the
                                    //  test case executed at least one
                                    //  assertion (if it isn't being ignored).
                                    if (!testcase.get('$executedAssertion') &&
                                        !testcase.get('ignored')) {
                                        testcase.fail('No assertions found');
                                    } else {
                                        testcase.pass();
                                    }
                                },
                                function(err) {
                                    //  NOTE that if we fail at this level the
                                    //  try/catch isn't involved, so we need to
                                    //  wrap up manually.
                                    if (err instanceof AssertionFailed) {
                                        testcase.fail(err);
                                    } else if (err instanceof Error) {
                                        testcase.error(err);
                                    } else {
                                        testcase.fail(err);
                                    }
                                });
                        } else {

                            if ($STATUS === TP.FAILED) {
                                $STATUS = TP.SUCCESS;
                                throw new Error();
                            }

                            //  Make sure to set the testcase to be ignored if
                            //  the entire test suite is being ignored (to get
                            //  proper count data and assertion execution
                            //  checking).
                            if (testcase.getSuite().get('ignored')) {
                                testcase.set('ignored', true);
                            }

                            //  As a final check, we make sure that the test
                            //  case executed at least one assertion (if it
                            //  isn't being ignored).
                            if (!testcase.get('$executedAssertion') &&
                                !testcase.get('ignored')) {
                                testcase.fail('No assertions found');
                            } else {
                                testcase.pass();
                            }
                        }
                    } else {
                        //  There was an internal Promise.

                        //  Now, if the test method itself returned a Promise,
                        //  then we should return that in a 'then()' on our
                        //  internal promise.
                        //  Based on the evaluation of that, the testcase will
                        //  have been considered to have passed or failed.

                        //  NB: Note how we use 'done()' here as the *last* part
                        //  of the chain rather than 'then()' as per the
                        //  recommendation of the Q documentation.
                        if (TP.isThenable(maybe)) {
                            internalPromise.then(
                                function(obj) {
                                    return maybe;
                                }).done(
                                function(obj) {

                                    //  Make sure to set the testcase to be
                                    //  ignored if the entire test suite is
                                    //  being ignored (to get proper count data
                                    //  and assertion execution checking).
                                    if (testcase.getSuite().get('ignored')) {
                                        testcase.set('ignored', true);
                                    }

                                    //  As a final check, we make sure that the
                                    //  test case executed at least one
                                    //  assertion (if it isn't being ignored).
                                    if (!testcase.get('$executedAssertion') &&
                                        !testcase.get('ignored')) {
                                        testcase.fail('No assertions found');
                                    } else {
                                        testcase.pass();
                                    }
                                },
                                function(err) {
                                    //  NOTE that if we fail at this level the
                                    //  try/catch isn't involved, so we need to
                                    //  wrap up manually.
                                    if (err instanceof AssertionFailed) {
                                        testcase.fail(err);
                                    } else if (err instanceof Error) {
                                        testcase.error(err);
                                    } else {
                                        testcase.fail(err);
                                    }
                                });

                        } else {
                            //  The test method didn't return a Promise - just
                            //  'then()' onto our internal promise to either
                            //  pass or fail the testcase.
                            internalPromise.done(
                                function(obj) {

                                    //  Make sure to set the testcase to be
                                    //  ignored if the entire test suite is
                                    //  being ignored (to get proper count data
                                    //  and assertion execution checking).
                                    if (testcase.getSuite().get('ignored')) {
                                        testcase.set('ignored', true);
                                    }

                                    //  As a final check, we make sure that the
                                    //  test case executed at least one
                                    //  assertion. If it didn't, we mark it as
                                    //  'todo' and fail it.
                                    if (!testcase.get('$executedAssertion') &&
                                        !testcase.get('ignored')) {
                                        testcase.fail('No assertions found');
                                    } else {
                                        testcase.pass();
                                    }
                                },
                                function(err) {
                                    //  NOTE that if we fail at this level the
                                    //  try/catch isn't involved, so we need to
                                    //  wrap up manually.
                                    if (err instanceof AssertionFailed) {
                                        testcase.fail(err);
                                    } else if (err instanceof Error) {
                                        testcase.error(err);
                                    } else {
                                        testcase.fail(err);
                                    }
                                });
                        }
                    }
                } catch (e) {
                    if (e instanceof AssertionFailed) {
                        testcase.fail(e);
                    } else {
                        testcase.error(e);
                    }
                }
            }).timeout(timeout);
           /* eslint-enable new-cap */

    return promise.then(
        function(obj) {
            //  TODO: break?
            return;
        },
        function(err) {
            if (err instanceof AssertionFailed) {
                testcase.fail(err);
            } else if (err instanceof TP.extern.Promise.TimeoutError) {
                //  Determine from the message whether it was the case itself or
                //  the overall suite that failed. How will we know? If the
                //  timeout value isn't === the timeout for a test case it had
                //  to be the computed value for time remaining in the test
                //  suite.
                if (timeout !== testcase.getTimeout()) {
                    testcase.fail('Test suite timed out', TP.TIMED_OUT);
                } else {
                    testcase.fail('Test case timed out', TP.TIMED_OUT);
                }
            } else {
                testcase.error(err);
            }
        });
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('then',
function(onFulfilled, onRejected) {

    /**
     * 'Then's onto our internally-held promise thereby, effectively queuing the
     * operation.
     * @param {Function} onFulfilled The Function to run to if the Promise has
     *     been fulfilled.
     * @param {Function} onRejected The Function to run to if the Promise has
     *     been rejected.
     * @returns {TP.test.Case} The receiver.
     */

    var internalPromise,
        lastPromise,

        thisArg,

        _callback,
        _errback,

        newPromise;

    //  First, see if there's an existing internal promise. If not, create one
    //  and set the internal promise to be that.
    if (TP.notValid(internalPromise = this.$get('$internalPromise'))) {
        internalPromise = TP.extern.Promise.resolve();
        this.$set('$internalPromise', internalPromise);
    }

    //  Next, see if there's a 'current promise'. This is a Promise reference
    //  that would've been set 'higher up' (i.e. one frame back in a nested set
    //  of promises). If so, use that as the 'last promise' that we're going to
    //  append to. If not, use our internal promise.
    if (TP.notValid(lastPromise = this.$get('$currentPromise'))) {
        lastPromise = internalPromise;
    }

    thisArg = this;

    //  Make sure that a callback function is defined. Either the supplied one
    //  or a simple one that returns the value.
    if (!TP.isCallable(_callback = onFulfilled)) {
        _callback = function(value) {
            return value;
        };
    }

    //  Make sure that an errback function is defined. Either the supplied one
    //  or a simple one that rejects with the reason
    if (!TP.isCallable(_errback = onRejected)) {
        _errback = function(reason) {
            return TP.extern.Promise.reject(reason);
        };
    }

    //  'then' onto our last promise with fulfillment/rejection handlers that
    //  manage a 'stacking' of nested Promises.
    newPromise = lastPromise.then(
        function(result) {

            var subPromise,
                maybe,
                subReturnPromise;

            //  First, allocated a 'sub promise' and set it as the 'current
            //  promise'. This will be used as the 'last promise' (see above)
            //  for any nested 'then()' statements *inside* of the fulfillment
            //  handler.
            subPromise = TP.extern.Promise.resolve();
            thisArg.$set('$currentPromise', subPromise);

            //  Protect the callback in a try...catch to make sure that any
            //  errors result in the promise being rejected.
            try {
                maybe = _callback(result);
            } catch (e) {
                maybe = TP.extern.Promise.reject(e);
            }

            //  The fulfillment handler will have set the 'new promise' that it
            //  created as the 'current promise' (see below). We need that here.
            //  Note how we then null out the current promise - this is
            //  important to keep things straight.
            subReturnPromise = thisArg.$get('$currentPromise');
            thisArg.$set('$currentPromise', null);

            //  If we got a Promise back from the fulfillment handler, chain it
            //  on to the 'sub return promise' here.
            if (TP.isThenable(maybe)) {
                subReturnPromise = subReturnPromise.then(
                                        function() {
                                            return maybe;
                                        });
            }

            return subReturnPromise;
        },
        function(reason) {

            var subPromise,
                maybe,
                subReturnPromise;

            //  All of the same stuff above, except we're dealing with the
            //  rejection handler.

            subPromise = TP.extern.Promise.resolve();
            thisArg.$set('$currentPromise', subPromise);

            //  Protect the errback in a try...catch to make sure that any
            //  errors that could happen as part of the errback itself result in
            //  the promise being rejected.
            try {
                maybe = _errback(reason);
            } catch (e) {
                maybe = TP.extern.Promise.reject(e);
            }

            subReturnPromise = thisArg.$get('$currentPromise');
            thisArg.$set('$currentPromise', null);

            if (TP.isThenable(maybe)) {
                subReturnPromise = subReturnPromise.then(
                                        function() {
                                            return maybe;
                                        });
            }

            return subReturnPromise;
        });

    //  Set both our 'internal promise' (used to track the last promise
    //  allocated) and the 'current promise' to the new promise we just obtained
    //  by 'then()'ing onto the 'last promise' (which will either by the
    //  internal promise as obtained when we entered this method or the current
    //  promise set by our parent stack frame 'earlier' in our computation.
    this.$set('$currentPromise', newPromise);
    this.$set('$internalPromise', newPromise);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('thenAllowGUIRefresh',
function() {

    /**
     * A convenience mechanism to give the GUI a chance to refresh.
     * @returns {TP.test.Case} The receiver.
     */

    this.thenPromise(
        function(resolver, rejector) {
            return TP.extern.Promise.delay(
                        TP.sys.cfg('test.anti_starve_timeout')).then(
                                                        resolver, rejector);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('thenPromise',
function(aFunction) {

    /**
     * A convenience mechanism to create a Promise with the supplied Function
     * and 'append it' (if you will) onto the current internally-held Promise.
     * Note that this operation will also reset the internally-held Promise to
     * be the new Promise that it creates.
     * @param {Function} aFunction The Function to run to fulfill the Promise.
     * @returns {TP.test.Case} The receiver.
     */

    var internalPromise,
        subPromise,

        lastPromise,
        newPromise;

    //  First, see if there's an existing internal promise. If not, create one
    //  and set the internal promise to be that.
    if (TP.notValid(internalPromise = this.$get('$internalPromise'))) {
        internalPromise = TP.extern.Promise.resolve();
        this.$set('$internalPromise', internalPromise);
    }

    //  Next, see if there's a 'current promise'. This is a Promise reference
    //  that would've been set 'higher up' (i.e. one frame back in a nested set
    //  of promises). If so, use that as the 'last promise' that we're going to
    //  append to. If not, use our internal promise.
    if (TP.notValid(lastPromise = this.$get('$currentPromise'))) {
        lastPromise = internalPromise;
    }

    //  Execute the supplied Function and wrap a Promise around the result.
    /* eslint-disable new-cap */
    subPromise = TP.extern.Promise.construct(aFunction);
    /* eslint-enable new-cap */

    //  'then' onto our last promise, chaining on the promise we just
    //  allocated.
    newPromise = lastPromise.then(
        function() {
            return subPromise;
        });

    //  Set both our 'internal promise' (used to track the last promise
    //  allocated) and the 'current promise' to the new promise we just obtained
    //  by 'then()'ing onto the 'last promise' (which will either by the
    //  internal promise as obtained when we entered this method or the current
    //  promise set by our parent stack frame 'earlier' in our computation.
    this.$set('$currentPromise', newPromise);
    this.$set('$internalPromise', newPromise);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('thenWait',
function(timeoutMS) {

    /**
     * A convenience mechanism to wait a certain number of milliseconds using
     * the receiver's Promise machinery.
     * @param {Number} timeoutMS The number of milliseconds to wait.
     * @returns {TP.test.Case} The receiver.
     */

    this.thenPromise(
        function(resolver, rejector) {
            return TP.extern.Promise.delay(timeoutMS).then(resolver, rejector);
        });

    return this;
});

//  ========================================================================
//  Test Instrumentation Functions
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('describe',
function(suiteName, suiteFunc) {

    /**
     * Adds a new test suite definition to an object. When the suite name
     * matches a method name that suite is automatically associated with the
     * specific method.
     * @param {String} suiteName The name of the new test suite. Should be
     *     unique to the particular receiver. If this matches a method name the
     *     suite is associated with that method.
     * @param {Function} suiteFunc The function representing the test suite.
     *     Should contain at least one call to 'this.it', the test case
     *     definition method on TP.test.Suite.
     */

    return TP.test.Suite.addSuite(this, suiteName, suiteFunc);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getMissingTestNames',
function(options) {

    /**
     * Returns an array of strings representing missing tests. The list is based
     * on comparing the test suite names with the receiver's method names. Test
     * suite names matching method names serve as tests for that method.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Array.<String>} An array of method names without tests.
     */

    var methods,
        names,
        suites,
        suitenames;

    methods = this.getMethods();
    names = methods.map(
                function(method) {
                    return TP.name(method);
                });

    suitenames = TP.ac();

    suites = this.getTestSuites(options);
    suitenames = suites.map(
                    function(suite) {
                        return suite.getSuiteName();
                    });

    return names.difference(suitenames);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTestFixture',
function(options) {

    /**
     * Creates and returns test fixture data suitable for the receiver. This
     * method is used to produce "the object under test" for test cases that
     * target the receiver. The default is the receiver itself.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Object} A test fixture for the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTestSuites',
function(options) {

    /**
     * Returns an array containing test suites for the receiver.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Array} An array of all suites matching the filter criteria.
     */

    var params;

    params = TP.hc(options);
    params.atPut('target', this);

    return TP.test.getSuites(params);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('runTestSuites',
function(options) {

    /**
     * Runs the test suites associated with the receiver. Options which help
     * configure and control the testing process can be provided.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    var params;

    params = TP.hc(options);
    params.atPut('target', this);

    return TP.test.runSuites(params);
});

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - METHOD CHAINS
//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineAttribute('$$methodChainNames');

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('$installMethodChain',
function(stepNames, endName) {

    /**
     * Sets up a 'traversal chain', such that an instance of the receiver will
     * respond to '.foo.bar()' as if '.bar()' was invoked. The 'chain' of names
     * used to invoke '.bar()' will be available under the private
     * '$$methodChainNames' instance attribute.
     * @param {Array} stepNames The names of the individual 'steps' that can be
     *     used in a traversal chain to get to the method named by 'endName'.
     * @param {String} endName The name of the method that will invoked at the
     *     'end' of the chain.
     * @returns {Object} The receiver.
     */

    var proto,
        endMethod,

        i,
        chainMethod;

    proto = this[TP.INSTC].prototype;

    //  The 'endMethod' is the one that will be called at the 'end' of our
    //  traversal chain.
    endMethod = proto[endName];

    /* eslint-disable no-loop-func */
    for (i = 0; i < stepNames.getSize(); i++) {

        //  The first step is to install a getter on the instance prototype that
        //  we captured above for each step name provided. This allows the chain
        //  to start from the receiving object with any of the step names
        //  provided.

        //  First, capture the method - make sure it's a callable property.
        if (!TP.isCallable(chainMethod = proto[stepNames.at(i)])) {
            continue;
        }

        //  We wrap this entire chunk that installs an ECMAE5 getter on the
        //  prototype in an anonymous function to leverage closure behavior
        //  around the 'startGetter'.
        (function() {
            var startGetter;

            //  Write a getter that resets the $$methodChainNames array, sets
            //  the '$realThis' property to be used 'down the chain' and returns
            //  the existing method.
            startGetter =
                function() {

                    this.set('$$methodChainNames', TP.ac(startGetter.theName));
                    startGetter.realMethod.$realThis = this;

                    return startGetter.realMethod;
                };

            startGetter.theName = stepNames.at(i);
            startGetter.realMethod = chainMethod;

            Object.defineProperty(
                proto,
                stepNames.at(i),
                {
                    get: startGetter
                });
        }());

        //  The second step is to install a getter on the Function object itself
        //  (and which is the method on the initial receiving object) which will
        //  return the receiving object's Function object corresponding to the
        //  named method.
        //      E.g. Assume, that 'myObj' comes with a 'bar' method and a step
        //      name is 'foo' - this getter will instrument the *Function*
        //      object which is myObj's 'foo' method with a getter under the
        //      name 'bar', such that accessing: myObj.foo.bar will be the same
        //      as accessing myObj.bar.

        //  We wrap this entire chunk that installs an ECMAE5 getter on the
        //  prototype in an anonymous function to leverage closure behavior
        //  around the 'stepGetter'.
        (function() {
            var stepGetter;

            //  Build a getter that will instrument the proper properties on the
            //  'real method' that it's standing in for (i.e. the 'this'
            //  property and it's name) and a bit of code to maintain the 'chain
            //  names' on the 'real receiving object' as we traverse so that the
            //  'end method' can access that upon invocation to see 'how it got
            //  here' (i.e. the names used in the traversal chain).
            stepGetter =
                function() {
                    var ourMethod,
                        chainNames;

                    ourMethod = stepGetter.realMethod;
                    ourMethod.theName = stepGetter.theName;
                    ourMethod.$realThis = this.$realThis;

                    if (TP.isArray(chainNames =
                            this.$realThis.get('$$methodChainNames'))) {
                        chainNames.push(stepGetter.theName);
                    }

                    return ourMethod;
                };

            stepGetter.theName = endName;
            stepGetter.realMethod = endMethod;

            Object.defineProperty(
                chainMethod,
                endName,
                {
                    get: stepGetter
                });
        }());
    }
    /* eslint-enable no-loop-func */

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('setupMethodChains',
function(methodInfoDict) {

    /**
     * Sets up method chains per the supplied dictionary.
     * @description The supplied dictionary should supply the 'end name' as a
     *     key with an Array of the 'valid steps' that can be taken to get to
     *     that 'end'.
     *     E.g. An info dict of:
     *         TP.hc('baz', TP.ac('foo','bar'), 'foo', TP.ac('not'))
     *     installs a method chain of 'foo.baz' and 'bar.baz'. Note that
     *     'multiple paths' to a end can be constructed. The info dict above
     *     allows for both 'foo.baz' and 'not.foo.baz'.
     * @param {TP.core.Hash} methodInfoDict A dictionary of method information
     *     used by this method to construct 'method chains'.
     * @returns {Object} The receiver.
     */

    var proto,
        thisArg,

        endNames,
        endName,

        i;

    proto = this[TP.INSTC].prototype;

    thisArg = this;

    endNames = methodInfoDict.getKeys();

    /* eslint-disable no-loop-func */

    //  Loop over the end names and install a getter method 'around' the method
    //  that will clear the '$realThis' slot from the method Function object (to
    //  avoid endless recursions) and invoke the 'original method' using the
    //  '$realThis' that was passed down the chain.
    for (i = 0; i < endNames.getSize(); i++) {

        endName = endNames.at(i);

        //  We wrap this entire chunk that installs an ECMAE5 getter on the
        //  prototype in an anonymous function to leverage closure behavior
        //  around 'originalEndMethod' and 'endMethod'.
        (function() {
            var originalEndMethod,
                endMethod;

            //  There very well may not be an 'original method' on the object,
            //  since many times chains are made up of 'filler' property names
            //  (i.e. in a test framework - this.expect(2).to.be.a(Number) -
            //  'to' and 'be' are just property 'fillers' to make it 'read
            //  easier'). If there is no real method, then just use
            //  TP.RETURN_THIS.
            if (!TP.isCallable(originalEndMethod = proto[endName])) {
                originalEndMethod = TP.RETURN_THIS;
            }

            endMethod = function() {
                var theThis;

                if (TP.isValid(theThis = endMethod.$realThis)) {
                    endMethod.$realThis = null;
                    return originalEndMethod.apply(theThis, arguments);
                }
            };

            //  Add the new, wrapper, end method.
            thisArg.Inst.defineMethod(endName, endMethod);
        }());
    }
    /* eslint-enable no-loop-func */

    //  Now that the wrapper methods have been installed, go ahead and set up
    //  the method chain for each end name. **NOTE** We *have* to do this in a
    //  separate loop to avoid problems with chain getters getting installed on
    //  the *original* end methods above and not the *wrapper* end methods that
    //  we install. So *THESE TWO LOOPS CANNOT BE COMBINED*.
    for (i = 0; i < endNames.getSize(); i++) {
        endName = endNames.at(i);
        this.$installMethodChain(methodInfoDict.at(endName), endName);
    }

    return this;
});

//  ========================================================================
//  TP.log.TestAppender
//  ------------------------------------------------------------------------

/**
 * @type {TP.log.TestAppender}
 */

//  ----------------------------------------------------------------------------

TP.log.Appender.defineSubtype('TestAppender');

//  ----------------------------------------------------------------------------
//  Type Attributes
//  ----------------------------------------------------------------------------

/**
 * The default layout type for this appender. Note that we use the console
 * layout for this type since we want the plain text.
 * @type {TP.log.Layout}
 */
TP.log.TestAppender.Type.$set('defaultLayoutType', 'TP.log.ConsoleLayout');

//  ----------------------------------------------------------------------------
//  Instance Attribute
//  ----------------------------------------------------------------------------

TP.log.TestAppender.Inst.defineAttribute('currentTestCase');

//  ----------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.log.TestAppender.Inst.defineMethod('append',
function(anEntry) {

    /**
     * @method append
     * @summary Formats the entry data using the receiver's layout and writes
     *     it to the console using the best console API method possible.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @returns {TP.log.Appender} The receiver.
     */

    var layout,
        content,

        currentCase;

    //  If this flag is not true, then just bail out here.
    if (!TP.sys.cfg('test.fail_on_error_log')) {
        return this;
    }

    //  If the entry is an Error or more severe, then we want to fail the test
    //  case.
    if (anEntry.isError()) {

        layout = this.getLayout();
        content = layout.layout(anEntry).at('content');
        currentCase = this.get('currentTestCase');

        //  We need to set the status code back to TP.ACTIVE here - the test
        //  thinks it has completed, but since this could be being called
        //  from an asynchronous callback and it failed, then need to
        //  'reactivate' the test and fail it.
        currentCase.set('statusCode', TP.ACTIVE);
        currentCase.fail(content);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
