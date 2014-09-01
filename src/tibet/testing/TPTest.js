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

/* global Q:true,
          AssertionFailed:true
*/

//  ========================================================================
//  TP.test namespace (and friends...)
//  ------------------------------------------------------------------------

TP.defineNamespace('test', 'TP');

//  Create a custom Error for use in Assert processing.
AssertionFailed = function(message) { this.message = message;};
AssertionFailed.prototype = new Error();
AssertionFailed.prototype.name = 'AssertionFailed';

//  ========================================================================
//  TP.test.Root
//  ------------------------------------------------------------------------

/**
 * Common supertype for other TP.test objects like test.Case and test.Suite.
 */
TP.lang.Object.defineSubtype('test:Root');

//  Add support for job control status tracking and querying.
TP.test.Root.addTraitsFrom(TP.core.JobStatus);

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
TP.test.Root.Inst.defineAttribute('mslimit', 60000);

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
     * @return {Number}
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
     * @return {Number}
     */

    return this.$get('mslimit');
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('getTimeRemaining',
function() {

    /**
     * Returns the number of milliseconds remaining between elapsed time and the
     * receiver's timeout value.
     * @return {Number}
     */

    return Math.max(0, this.getTimeout() - this.getElapsedTime());
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isExclusive',
function() {

    /**
     * Returns true if the receiver is configured to be run exclusively.
     * @return {Boolean} True if the receiver is exclusive.
     */

    return this.$get('exclusive') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isSkipped',
function() {

    /**
     * Returns true if the receiver is configured to be skipped (not run).
     * @return {Boolean} True if the receiver is skipped.
     */

    return this.$get('skipped') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isTodo',
function() {

    /**
     * Returns true if the receiver is configured as a 'todo' test item.
     * @return {Boolean} True if the receiver is marked as a todo item.
     */

    return this.$get('ignored') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('only',
function() {

    /**
     * Marks the receiver as exclusive, meaning it should be the only item
     * run in a list of multiple items. When multiple items are marked as being
     * exclusive only the first of them will be run.
     */

    this.$set('exclusive', true);
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('reset',
function(options) {

    /**
     * Resets the receiver, putting instance variables back to their original
     * values so it can be run again.
     * @param {TP.lang.Hash} options A dictionary of test options.
     */

    this.$set('result', null);
    this.$set('faultCode', null);
    this.$set('faultText', null);
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
     */

    var skip;

    skip = TP.ifInvalid(shouldSkip, true);

    this.$set('skipped', skip);
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('timeout',
function(ms) {

    /**
     * Defines a millisecond limit on how long the receiver can run before being
     * timed out (which cause the Case or Suite to fail).
     * @param {Number} ms The millisecond timeout value.
     */

    this.$set('mslimit', ms);
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('todo',
function() {

    /**
     * Marks the receiver as todo, meaning it will be run but its result will
     * always be considered as a non-failure for overall reporting purposes.
     */

    this.$set('ignored', true);
});


//  ========================================================================
//  TP.test.Suite
//  ------------------------------------------------------------------------

TP.test.Root.defineSubtype('Suite');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

/**
 * The container for all defined test suites, keyed by target ID. Methods which
 * access this property refer to TP.test.Suite since it is not inherited by any
 * subtypes, it's local to the TP.test.Suite type.
 * @type {TP.lang.Hash}
 */
TP.test.Suite.defineAttribute('suites', TP.hc());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.Suite.Type.defineMethod('addSuite',
function(target, suiteName, suiteFunc) {

    /**
     * Adds a new test suite function to the overall dictionary.
     * @param {Object} target The object that owns the test suite.
     * @param {String} suiteName The name of the suite. Should be unique for the
     *     particular target.
     * @param {Function} suiteFunc The function representing the test suite.
     * @return {TP.lang.Hash} The updated collection of test suites.
     */

    var id,
        suites,
        dict,
        suite;

    if (TP.notValid(target)) {
        this.raise('InvalidTarget');
        return;
    }

    id = TP.id(target);
    if (TP.isEmpty(id)) {
        this.raise('InvalidID');
    }

    suites = TP.test.Suite.getTargetSuites();
    dict = suites.at(id);

    if (TP.notValid(dict)) {
        dict = TP.hc();
        suites.atPut(id, dict);
    }

    suite = dict.at(suiteName);
    if (TP.notValid(suite)) {
        suite = TP.test.Suite.construct(this, suiteName, suiteFunc);
        dict.atPut(suiteName, suite);
    } else {
        suite.addSuite(suiteFunc);
    }

    return suite;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Type.defineMethod('getTargetSuites',
function(target, options) {

    /**
     * Returns a dictionary of test suites. If no target is provided the entire
     * collection of tests is returned. If a target is provided then a hash
     * whose top-level has a single key for the target's id is returned. This is
     * effectively a "slice" of the system suite hash.
     * @param {Object} target The object whose test suites should be returned.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {TP.lang.Hash} The target's collection of test suites.
     */

    var suites,
        id;

    suites = TP.test.Suite.$get('suites');

    if (TP.notValid(target)) {
        return suites;
    }

    id = TP.id(target);
    if (TP.isEmpty(id)) {
        this.raise('InvalidID');
    }

    // TODO: if options includes things like inherited etc. we need to collect
    // more suites rather than assuming a single slice.

    //  Return the result as a "slice" of the overall hash for consistency.
    return TP.hc(id, suites.at(id));
});

//  ------------------------------------------------------------------------

TP.test.Suite.Type.defineMethod('runTargetSuites',
function(target, options) {

    /**
     * Runs the test suites for a target, or all targets if no specific target
     * object is provided.
     * @param {Object} target The object whose test suites should be run.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {Promise} A Promise to be used as necessary.
     */

    var suites,
        cases,
        params,
        keys,
        suitelist,
        shouldThrowSetting,
        promise,
        exclusives,
        summarize,
        total;

    //  Note we pass options here to deal with potential for wanting inherited
    //  tests etc.
    suites = this.getTargetSuites(target, options);

    params = TP.hc(options);

    TP.sys.logTest('# TIBET starting test run', TP.TRACE);

    if (TP.notValid(suites)) {
        TP.sys.logTest('0..0');
        TP.sys.logTest('# PASS: 0 pass, 0 fail, 0 skip, 0 todo, 0 error.');
        return;
    }

    keys = suites.getKeys();

    //  Collect all suite instances in an array we can leverage as our top-level
    //  iteration list.
    suitelist = TP.ac();
    keys.perform(
            function(targetID) {
                var targetSuites,
                    targetKeys;

                targetSuites = suites.at(targetID);
                targetKeys = targetSuites.getKeys();

                targetKeys.perform(
                    function(suiteName) {
                        var suite;

                        suite = targetSuites.at(suiteName);
                        if (suite.isExclusive() && !params.at('ignore_only')) {
                            exclusives = true;
                        }
                        suitelist.push(suite);
                    });
            });

    //  Filter for exclusivity. We might get more than one if authoring was off
    //  so check for that as well.
    if (exclusives === true) {
        TP.sys.logTest('# filtering for exclusive suite(s).', TP.TRACE);
        suitelist = suitelist.filter(
                        function(suite) {
                            return suite.isExclusive();
                        });

        if (suitelist.length > 1) {
            TP.sys.logTest('# ' + suitelist.length +
                ' exclusive suite(s) found.', TP.WARN);
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
            prefix;

        passed = 0;
        failed = 0;
        ignored = 0;
        errored = 0;
        skipped = 0;

        suitelist.perform(
                function(suite) {
                    var caselist,
                        stats;

                    caselist = suite.getCaseList();
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
        TP.sys.logTest(prefix +
            total + ' total, ' +
            passed + ' pass, ' +
            failed + ' fail, ' +
            skipped + ' skip, ' +
            ignored + ' todo, ' +
            errored + ' error.');
    };

    TP.sys.logTest('# ' + suitelist.length + ' suite(s) found.', TP.TRACE);

    cases = 0;
    suitelist.perform(
            function(suite) {
                var caselist;

                caselist = suite.getCaseList();
                cases += caselist.getSize();
            });

    TP.sys.logTest((cases > 0 ? '1' : '0') + '..' + cases);

    //  Capture the current setting of 'shouldThrowExceptions' and set it to
    //  true. This is so that any raise()ing of TIBET exceptions in any test
    //  case will cause TIBET to throw an Error and then the test case will be
    //  considered to be in 'error'.

    //  TODO: Should the test harness also observe TP.sig.Exceptions?
    shouldThrowSetting = TP.sys.shouldThrowExceptions();
    TP.sys.shouldThrowExceptions(true);

    //  Use reduce to convert our suite array into a chain of promises. We
    //  prime the list with a resolved promise to ensure 'current' receives all
    //  the suites during iteration while 'chain' is the last promise in the
    //  chain of promises being constructed.
    promise = suitelist.reduce(
            function(chain, current, index, array) {
                return chain.then(
                    function(obj) {
                        return current.run(TP.hc(options));
                    },
                    function(err) {
                        //  Suite.run should trap all errors and resolve() so
                        //  the chain remains unbroken...unless we're doing an
                        //  early exit etc.
                        //  TODO: early exit?
                    });
            }, Q.Promise.resolve());

    return promise.then(function(obj) {
        TP.sys.shouldThrowExceptions(shouldThrowSetting);
        summarize();
    },
    function(err) {
        TP.sys.shouldThrowExceptions(shouldThrowSetting);
        summarize();
    });
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
 * The driver used for things like fetching resources, etc.
 * @type {TP.gui.Driver}
 */
TP.test.Suite.Inst.defineAttribute('driver');

/**
 * The number of milliseconds the object is limited to for run time before
 * timing out. Defaults to 15 seconds for a test suite.
 * @type {Number}
 */
TP.test.Suite.Inst.defineAttribute('mslimit', 15000);

/**
 * The object that holds all of the test methods as a 'refuter'.
 * @type {TP.test.TestMethodCollection}
 */
TP.test.Suite.Inst.defineAttribute('refuter');

/**
 * A dictionary of statistics regarding pass, fail, error, and skip counts.
 * @type {TP.lang.Hash}
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


//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('addSuite',
function(suiteFunc) {

    /**
     * Adds an additional suite function to the current test suite.
     * @param {Function} suiteFunc The test case-generating function.
     * @return {Array.<Function>} The updated list of suite functions.
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
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('executeAfter',
function(result, options) {

    var func;

    this.set('msend', Date.now());

    //  Run any after() which was registered.
    try {
        func = this.get('afterAll');
        if (TP.isCallable(func)) {
            try {
                func(options);
            } catch (e) {
                TP.sys.logTest('# error in after: ' + e.message);
            }
        }
    } finally {
        // Output summary
        this.report(options);
    }
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('executeAfterEach',
function(result, options) {

    var func;

    //  Run any afterEach which was registered.
    func = this.get('afterEvery');
    if (TP.isCallable(func)) {
        try {
            func(options);
        } catch (e) {
            TP.sys.logTest('# error in afterEach: ' + e.message);
        }
    }
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('executeBefore',
function(result, options) {

    var func;

    this.set('msstart', Date.now());

    //  Run any before() which was registered.
    func = this.get('beforeAll');
    if (TP.isCallable(func)) {
        try {
            func(options);
        } catch (e) {
            TP.sys.logTest('# error in before: ' + e.message);
        }
    }
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('executeBeforeEach',
function(result, options) {

    var func;

    //  Run any beforeEach which was registered.
    func = this.get('beforeEvery');
    if (TP.isCallable(func)) {
        try {
            func(options);
        } catch (e) {
            TP.sys.logTest('# error in beforeEach: ' + e.message);
        }
    }
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getCaseList',
function(options) {

    /**
     * Runs the internal suite functions and returns the list of specific test
     * case instances created as a result. The 'suite functions' are the
     * functions passed to describe() which define the suite.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {Array.<TP.test.Case>} The case list.
     */

    var cases,
        suites,
        suite;

    cases = this.$get('caseList');
    if (TP.isValid(cases)) {
        return cases;
    }

    cases = TP.ac();
    this.$set('caseList', cases);

    suite = this;

    //  Execute the suiteList functions to generate the case list.
    suites = this.$get('suiteList');
    suites.perform(
            function(func) {
                //  Running this function ends up invoking 'this.it()' against
                //  the test suite instance. See 'it()' for more information.
                try {
                    func.apply(suite);
                } catch (e) {
                    TP.sys.logTest(
                        '# error in describe(' + suite.getSuiteName() +
                        '): ' + e.message);

                    suite.error(e);
                }
            });

    return cases;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getSuiteList',
function() {

    /**
     * Returns the list of define functions specific to this test suite.
     * @return {Array.<Function>} An array of suite 'describe' functions.
     */

    return this.$get('suiteList');
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getSuiteName',
function() {

    /**
     * Returns the name of the suite as provided to 'describe'.
     * @return {String} The suite name.
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
     * @return {TP.lang.Hash} The new test suite instance.
     */

    this.callNextMethod();

    this.$set('suiteOwner', target);
    this.$set('suiteName', suiteName);

    this.$set('suiteList', TP.ac());
    this.$get('suiteList').push(suiteFunc);

    this.$set('asserter',
        TP.test.TestMethodCollection.construct());
    this.$set('refuter',
        TP.test.TestMethodCollection.construct().set('isRefuter', true));

    this.$set('driver', TP.gui.Driver.construct(TP.sys.getUICanvas()));

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
     * @return {TP.test.Case} The newly created test case.
     */

    var testCase,
        caseList;

    testCase = TP.test.Case.construct(this, caseName, caseFunc);
    if (TP.notValid(testCase)) {
        this.raise('InvalidTestCase', arguments);
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

        caseList = this.getCaseList();
        caseList.perform(
                function(item) {
                    var status = item.getStatusCode();
                    switch(status) {
                        case TP.ERRORED:
                            errored += 1;
                            break;
                        case TP.FAILED:
                            if (item.isTodo()) {
                                ignored += 1;
                            } else {
                                failed += 1;
                            }
                            break;
                        case TP.SUCCEEDED:
                            passed += 1;
                            break;
                        default:
                            skipped += 1;
                            break;
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
        skipped + ' skip, ' +
        ignored + ' todo, ' +
        errored + ' error.', TP.TRACE);
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('reset',
function(options) {

    this.callNextMethod();

    this.$set('caseList', null);

    this.$set('msstart', null);
    this.$set('msend', null);

    if (options && options.at('suite_timeout')) {
        this.$set('mslimit', options.at('suite_timeout'));
    }
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('run',
function(options) {

    /**
     * Runs the test cases for the suite.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {Promise} A Promise to be used as necessary.
     */

    //  Protect against running twice while we already have a pending promise.
    if (this.isActive()) {
        this.error(new Error('InvalidOperation'));
        return Q.Promise.resolve();
    }

    //  Make sure to clear out any previous state.
    this.reset(options);

    return this.runTestCases(options);
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('runTestCases',
function(options) {

    /**
     * Executes the receiver's test cases, providing each with the options
     * object provided to help control execution.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {Promise} A Promise to be used as necessary.
     */

    var caselist,
        result,
        suite,
        params;

    //  Output a small 'suite header'
    TP.sys.logTest('#', TP.TRACE);
    TP.sys.logTest('# describe(' + this.getSuiteName() + ')', TP.TRACE);

    params = TP.hc(options);

    //  Make sure to clear out any previous state.
    this.reset(options);

    caselist = this.getCaseList(options);

    if (this.isSkipped() && !params.at('ignore_skip')) {
        this.get('statistics').atPut('skipped', caselist.getSize());

        TP.sys.logTest('# SKIP - test suite skipped.', TP.TRACE);
        TP.sys.logTest('# pass: 0 pass, 0 fail, ' +
            this.get('statistics').at('skipped') + ' skip, 0 todo, 0 error.');

        return Q.Promise.resolve();
    }

    //  Filter for exclusivity. We might get more than one if authoring was off
    //  so check for that as well.
    if (!params.at('ignore_only')) {
        if (caselist.some(
                function(test) {
                    return test.isExclusive();
                })
                ) {
                    TP.sys.logTest('# filtering for exclusive test cases.',
                                    TP.TRACE);

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

    //  Run any 'before' hook for the suite.
    suite.executeBefore(null, options);

    //  Use reduce to convert our caselist array into a chain of promises. We
    //  prime the list with a resolved promise to ensure 'current' receives all
    //  the cases during iteration while 'chain' is the last promise in the
    //  chain of promises being constructed.
    result = caselist.reduce(
            function(chain, current, index, array) {

                return chain.then(
                    function(obj) {
                        var promise;

                        suite.executeBeforeEach(obj, options);

                        promise = current.run(TP.hc(options));

                        return promise.then(
                            function(obj) {
                                suite.executeAfterEach(obj, options);
                            }, function(err) {
                                suite.executeAfterEach(err, options);
                            });
                    },
                    function(err) {
                        //  TODO: the suite run() operation errored out, now
                        //  what?
                    });
            }, Q.Promise.resolve());

    //  'Finally' action for our caselist promise chain, run the 'after' hook.
    return result.then(
        function(obj) {
            suite.executeAfter(obj, options);
        },
        function(err) {
            suite.executeAfter(err, options);
        });
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
TP.test.Case.Inst.defineAttribute('mslimit', 5000);

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
 * The promise that is kept by the test case for use by test case logic as the
 * test executes. Note that this promise reference can change the test case
 * logic actually adds new Promises. It will be set to the 'last' Promise
 * generated.
 * @type {Promise}
 */
TP.test.Case.Inst.defineAttribute('$internalPromise');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('errorJob',
function(aFaultCode, aFaultString) {

    /**
     * Internal method for handling errors thrown by test functions.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {String} aFaultString A string description of the fault.
     */

    //  NOTE that even though we had an error we still resolve, not reject. This
    //  allows other test cases to continue to be processed.
    this.$resolve();

    this.set('msend', Date.now());

    TP.sys.logTest('not ok - ' + this.getCaseName() + ' error' +
        (aFaultString ? ': ' + aFaultString : '') + '.');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('failJob',
function(aFaultCode, aFaultString) {

    /**
     * Internal method for handling notifications of test failures.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {String} aFaultString A string description of the fault.
     */

    var msg;

    //  NOTE that even though we had a failure we still resolve, not reject.
    //  This allows other test cases to continue to be processed in the same
    //  chain with passing tasks.
    this.$resolve();

    this.set('msend', Date.now());

    msg = 'not ok - ' + this.getCaseName() +
        (aFaultString ? ': ' + aFaultString : '') + '.';

    if (this.isTodo()) {
        msg += ' # TODO ';
    }

    TP.sys.logTest(msg);
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getCaseName',
function() {

    /**
     * Returns the individual case name.
     * @return {String} The case name.
     */

    return this.$get('caseName');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getDriver',
function() {

    /**
     * Returns the test driver associated with this case's overall test suite.
     * @return {TP.gui.Driver} The test driver.
     */

    return this.getSuite().$get('driver');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getStatus',
function() {

    /**
     * Returns the result status for the test case, if it has finished.
     * @return {Number} The status code.
     */

    return this.$get('status');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getSuite',
function() {

    /**
     * Returns the TP.test.Suite that owns this test case.
     * @return {TP.test.Suite}
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
     * @return {TP.test.Case} The newly created test case.
     */

    this.callNextMethod();

    this.$set('suite', suite);

    this.$set('caseName', caseName);
    this.$set('caseFunc', caseFunc);

    return this;
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
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('pass',
function() {

    /**
     * Handles notification that the test case passed (or more accurately that
     * it didn't fail and didn't error out).
     */

    if (this.didComplete()) {
        return;
    }

    this.complete();
    this.$resolve();

    this.set('msend', Date.now());

    TP.sys.logTest('ok - ' + this.getCaseName() + '.');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('$reject',
function() {

    this.$rejector();
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('$resolve',
function() {

    if (!this.$resolver) {
        /* jshint -W087 */
        debugger;
        /* jshint +W087 */
    }

    this.$resolver();
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('reset',
function(options) {

    var asserter,
        refuter;

    this.callNextMethod();

    this.$set('msstart', null);
    this.$set('msend', null);

    asserter = this.getSuite().get('asserter');
    asserter.$set('currentTestCase', this);
    this.$set('assert', asserter);

    refuter = this.getSuite().get('refuter');
    refuter.$set('currentTestCase', this);
    this.$set('refute', refuter);

    if (options && options.at('case_timeout')) {
        this.$set('mslimit', options.at('case_timeout'));
    }

    //  We provide a 'then()' and 'thenPromise()' API to our driver.
    this.getDriver().set('promiseProvider', this);
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('run',
function(options) {

    /**
     * Creates and returns a promise which runs the test case. You can leverage
     * the 'then' method of the Promise API to take action upon success or
     * failure of the test case.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {Promise} A Promise to be used as necessary.
     */

    var params,
        promise,
        testcase,
        timeout;

    params = TP.hc(options);

    //  Protect against running twice while we already have a pending promise.
    if (this.isActive()) {
        this.error(new Error('InvalidOperation'));
        return Q.Promise.resolve();
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

    promise = Q.Promise(function(resolver, rejector) {
        var internalPromise,
            maybe;

        //  Capture references to the resolve/reject operations we can use from
        //  the test case itself. Do this first so any errors below will still
        //  be able to depend on these hooks being in place.
        testcase.$resolver = resolver;
        testcase.$rejector = rejector;

        if (testcase.isSkipped() && !params.at('ignore_skip')) {
            TP.sys.logTest('ok - ' + testcase.getCaseName() + ' # SKIP');
            resolver();
            return;
        }

        //  NOTE: do this after checking for deferred so we don't end up with
        //  timing values for something we never ran.
        testcase.set('msstart', Date.now());

        try {

            //  Note that inside the test method we bind to the Case instance.
            //  Also note that 'maybe' might be a Promise that the test case
            //  author returned to us.
            maybe = testcase.$get('caseFunc').call(testcase, testcase, options);

            //  Now, check to see if there is an internal promise.

            if (TP.notValid(internalPromise =
                                testcase.$get('$internalPromise'))) {

                //  If there is no internal Promise, then just see if 'maybe'
                //  contains a Promise that was returned from the test case.

                //  If 'maybe' contains a Promise, use it.
                if (TP.canInvoke(maybe, 'then')) {

                    //  NB: We use 'done()' here rather than 'then()' as per the
                    //  recommendation of the Q documentation.
                    maybe.done(
                        function(obj) {
                            testcase.pass();
                        },
                        function(err) {
                            //  NOTE that if we fail at this level the try/catch
                            //  isn't involved, so we need to wrap up manually.
                            if (err instanceof AssertionFailed) {
                                testcase.fail(err);
                            } else if (err instanceof Error) {
                                testcase.error(err);
                            } else {
                                testcase.fail(err);
                            }
                        });
                } else {
                    //  Otherwise, just pass the test.
                    testcase.pass();
                }
            } else {
                //  There was an internal Promise.

                //  Now, if the test method itself returned a Promise, then we
                //  should return that in a 'then()' on our internal promise.
                //  Based on the evaluation of that, the testcase will have been
                //  considered to have passed or failed.

                //  NB: Note how we use 'done()' here as the *last* part of the
                //  chain rather than 'then()' as per the recommendation of the
                //  Q documentation.
                if (TP.canInvoke(maybe, 'then')) {
                    internalPromise.then(
                        function(obj) {
                            return maybe;
                        }).done(
                        function(obj) {
                            testcase.pass();
                        },
                        function(err) {
                            //  NOTE that if we fail at this level the try/catch
                            //  isn't involved, so we need to wrap up manually.
                            if (err instanceof AssertionFailed) {
                                testcase.fail(err);
                            } else if (err instanceof Error) {
                                testcase.error(err);
                            } else {
                                testcase.fail(err);
                            }
                        });

                } else {
                    //  The test method didn't return a Promise - just 'then()'
                    //  onto our internal promise to either pass or fail the
                    //  testcase.
                    internalPromise.done(
                        function(obj) {
                            testcase.pass();
                        },
                        function(err) {
                            //  NOTE that if we fail at this level the try/catch
                            //  isn't involved, so we need to wrap up manually.
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

    return promise.then(
        function(obj) {
            //  TODO: break?
        },
        function(err) {
            if (err instanceof AssertionFailed) {
                testcase.fail(err);
            } else if (/Timed out/.test(err)) {
                //  Determine from the message whether it was the case itself or
                //  the overall suite that failed. How will we know? If the
                //  timeout value isn't === the timeout for a test case it had
                //  to be the computed value for time remaining in the test
                //  suite.
                if (timeout !== testcase.getTimeout()) {
                    testcase.fail(TP.TIMED_OUT, 'Test suite timed out.');
                } else {
                    testcase.fail(TP.TIMED_OUT, 'Test case timed out.');
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
     * @return {TP.test.Case} The receiver.
     */

    var startPromise,
        newPromise;

    if (TP.notValid(startPromise = this.$get('$internalPromise'))) {
        startPromise = Q.Promise.resolve();
    }

    newPromise = startPromise.then(onFulfilled, onRejected);
    this.$set('$internalPromise', newPromise);

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
     * @return {TP.test.Case} The receiver.
     */

    var startPromise,
        newPromise,
        chainedPromise;

    if (TP.notValid(startPromise = this.$get('$internalPromise'))) {
        startPromise = Q.Promise.resolve();
    }

    newPromise = Q.Promise(aFunction);

    chainedPromise = startPromise.then(
        function() {
            return newPromise;
        });

    this.$set('$internalPromise', chainedPromise);

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
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {Array.<String>} An array of method names without tests.
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
    suites.getKeys().perform(
            function(key) {
                var suitehash;

                suitehash = suites.at(key);
                suitenames.addAll(suitehash.getKeys());
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
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {Object} A test fixture for the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTestSuites',
function(options) {

    /**
     * Returns the dictionary containing test suites for the receiver.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {TP.lang.Hash} A hash keyed by the receiver's ID.
     */

    return TP.test.Suite.getTargetSuites(this, options);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('runTestSuites',
function(options) {

    /**
     * Runs the test suites associated with the receiver. Options which help
     * configure and control the testing process can be provided.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @return {Promise} A Promise to be used as necessary.
     */

    return TP.test.Suite.runTargetSuites(this, options);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
