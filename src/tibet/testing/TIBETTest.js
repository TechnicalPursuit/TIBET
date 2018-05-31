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

/* global AssertionFailed:true
*/

//  ========================================================================
//  TP.test namespace (and friends...)
//  ========================================================================

TP.defineNamespace('TP.test');

//  ------------------------------------------------------------------------

//  Create a custom Error for use in Assert processing.
AssertionFailed =
    function(message) {
        this.message = message;
    };
AssertionFailed.prototype = new Error();
AssertionFailed.prototype.name = 'AssertionFailed';

//  ------------------------------------------------------------------------

TP.test.defineMethod('getCases',
function(options) {

    /**
     * @method getCases
     * @summary Returns a list of target-specific test suites. The combination
     *     of target and options settings determines which subsets of test
     *     suites will be returned. Common filters are suite and cases which
     *     filter for either a group of tests or specifically named tests.
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
    cases = suites.collect(
                function(suite) {
                    return suite.getCaseList(options);
                });

    return cases.flatten();
});

//  ------------------------------------------------------------------------

TP.test.defineMethod('getSuites',
function(options) {

    /**
     * @method getSuites
     * @summary Returns a list of target-specific test suites. The combination
     *     of target and options settings determines which subsets of test
     *     suites will be returned. Common filters are suite and cases which
     *     filter for either a group of tests or specifically named tests.
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

        //  Remove key so we don't think we want filtering etc. down below and
        //  can exit with just the suites by ID.
        params.removeKey('target');

        id = TP.id(target);
        if (TP.isEmpty(id)) {
            this.raise('InvalidID');
        }

        targets = TP.ac(id);

        inherit = params.at('inherit');
        if (TP.isTrue(inherit)) {
            obj = TP.bySystemId(target);
            if (TP.canInvoke(obj, 'getSupertypeNames')) {
                targets.concat(obj.getSupertypeNames());
            }
        }

        //  Get the list of suites owned by the targeted object.
        suites = suites.filter(
                        function(item) {
                            return targets.contains(TP.id(item.suiteOwner));
                        });
    }

    //  If params is empty it means it was either empty to begin with or had
    //  only a target (which we remove to support just returning all suites for
    //  the ID of the target).
    if (TP.isEmpty(params)) {
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

    //  Use explicit context, or context of the target(s).
    context = params.at('context');
    if (TP.notValid(context)) {
        if (TP.notEmpty(targets)) {
            targets.forEach(function(t) {
                var c;

                //  Already been through and found at least two variants.
                if (context === 'all') {
                    return;
                }

                c = TP.id(t);
                if (TP.notValid(c)) {
                    return;
                }

                if (c.indexOf('TP.') === 0) {
                    context = context === 'app' ? 'all' : 'lib';
                } else if (c.indexOf('APP.') === 0) {
                    context = context === 'lib' ? 'all' : 'app';
                } else {
                    return;
                }
            });
        } else {
            context = 'app';
        }
    }

    if (context !== 'all') {

        suites = suites.filter(
                    function(suite) {
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
     * @method runSuites
     * @summary Runs the test suites for a target, or all targets if no specific
     *     target object is provided.
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
        request,
        opts,
        params,
        onlysExist,
        logRaise,
        throwExceptions,
        throwHandlers,
        clickDelay,
        shouldLogSetting,
        promise,
        summarize,
        total,
        msg,

        currentSuite,
        handler;

    TP.sys.isTesting(true);

    opts = options;
    if (TP.notValid(opts)) {
        opts = TP.hc();
    }
    request = opts.at('request');
    if (TP.notValid(request)) {
        request = TP.request();
    }

    if (TP.notValid(TP.test.Suite.get('$rootRequest'))) {
        TP.test.Suite.set('$rootRequest', request.getRootRequest());
    }

    TP.sys.logTest('# TIBET starting test run', TP.DEBUG);

    //  Get filtered list of test suites that apply to our test criteria.
    suites = TP.test.getSuites(opts);

    if (TP.isEmpty(suites)) {

        TP.sys.logTest('0..0');
        TP.sys.logTest('# PASS: 0 pass, 0 fail, 0 error, 0 skip, 0 todo.');

        return TP.extern.Promise.resolve();
    }

    //  Run the 'before' *type* method of TP.test.Suite to set up any global
    //  settings, like logging appenders specific to the test harness, etc.
    TP.test.Suite.before();

    //  Prep the inbound options for use by the reporting functions below.
    params = TP.hc(opts);

    target = params.at('target');

    //  Filter for exclusivity. We might get more than one if authoring was off
    //  so check for that as well.
    if (!params.at('ignore_only')) {

        //  Test to see if there are any exclusive suites
        onlysExist = suites.some(
                function(suite) {
                    return suite.isExclusive();
                });

        if (onlysExist) {
            TP.sys.logTest('# filtering for exclusive suite(s).',
                            TP.WARN);

            suites = suites.filter(
                            function(suite) {
                                return suite.isExclusive();
                            });

            if (suites.getSize() > 1) {
                msg = '# ' + suites.getSize() +
                    ' exclusive suite(s) found';
                if (TP.isValid(target)) {
                    ' for ' + TP.name(target) + '.';
                } else {
                    msg += '.';
                }
                TP.sys.logTest(msg, TP.WARN);
            }
        }
    }

    //  Define a common summarize function we can invoke from either side of the
    //  promise callback handlers.
    summarize = function(obj) {
        var passed,
            failed,
            skipped,
            ignored,
            errored,
            exclusives,

            prefix;

        passed = 0;
        failed = 0;
        skipped = 0;
        ignored = 0;
        errored = 0;
        exclusives = 0;

        suites.perform(
                function(suite) {
                    var caselist,
                        stats;

                    caselist = suite.getCaseList(params);
                    stats = suite.get('statistics');

                    if (TP.notValid(stats)) {
                        //  Could be skipped, or there may have been 'only'
                        //  cases which weren't ignored. Either way the caselist
                        //  was skipped.
                        skipped += caselist.getSize();
                    } else {
                        passed += stats.at('passed');
                        failed += stats.at('failed');
                        skipped += stats.at('skipped');
                        errored += stats.at('errored');
                        ignored += stats.at('ignored');
                        exclusives += stats.at('exclusives');
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
            ignored + ' todo, ' +
            exclusives + ' only.');

        setTimeout(
            function() {
                TP.sys.isTesting(false);
            }, TP.sys.cfg('test.reset_flag_timeout', 5000));
    };

    msg = '# ' + suites.getSize() +
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

    //  Also, we capture the value of 'mouse.click_delay' and set the value to
    //  0. This is so that GUI tests will run properly with async behavior.
    //  Otherwise, by delaying the sending of click events, various tests will
    //  timeout and fail. NOTE: This precludes writing tests that generate and
    //  test for dblclick events.

    logRaise = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    throwExceptions = TP.sys.shouldThrowExceptions();
    TP.sys.shouldThrowExceptions(true);

    shouldLogSetting = TP.sys.shouldLogStack();
    TP.sys.shouldLogStack(true);

    throwHandlers = TP.sys.shouldThrowHandlers();
    TP.sys.shouldThrowHandlers(true);

    clickDelay = TP.sys.cfg('mouse.click_delay');
    TP.sys.setcfg('mouse.click_delay', 0);

    /* eslint-disable handle-callback-err */

    //  Use reduce to convert our suite array into a chain of promises. We
    //  prime the list with a resolved promise to ensure 'current' receives all
    //  the suites during iteration while 'chain' is the last promise in the
    //  chain of promises being constructed.
    promise = suites.reduce(
            function(chain, current, index, array) {
                return chain.then(
                    function(obj) {
                        currentSuite = current;
                        return current.run(params);
                    },
                    function(err) {
                        //  The TP.test.Case run() method should've trapped any
                        //  case-level errors and the TP.test.Suite run() method
                        //  should've trapped any suite-level errors outside of
                        //  the machinery of the case and fail()ed or error()ed
                        //  the current test case.

                        //  Additionally, the globally-installed 'unhandled
                        //  rejection' handlers below should catch any unhandled
                        //  rejections for Promise code that is used in other
                        //  parts of TIBET and fail() or error() the current
                        //  test case.

                        //  This is all so that the chain remains unbroken...
                        //  unless we're doing an early exit etc.
                        //  Therefore, this should never be called unless we're
                        //  doing an early exit.
                        void 0;
                    });
            }, TP.extern.Promise.resolve());

    handler = function(reason, unhandledPromise) {
        var test;

        test = currentSuite.get('currentTestCase');

        if (TP.notValid(test)) {
            test = currentSuite;
        }

        if (reason instanceof Error) {
            test.error(reason);
        } else {
            test.fail(reason);
        }
    };

    //  Install the (Bluebird-specific) top-level unhandled rejection handlers
    TP.extern.Promise.onPossiblyUnhandledRejection(handler);
    TP.extern.Promise.onUnhandledRejectionHandled(handler);

    return promise.then(
            function(obj) {

                //  Restore settings of system error condition flags.
                TP.sys.shouldLogRaise(logRaise);
                TP.sys.shouldThrowExceptions(throwExceptions);
                TP.sys.shouldLogStack(shouldLogSetting);
                TP.sys.shouldThrowHandlers(throwHandlers);

                TP.sys.setcfg('mouse.click_delay', clickDelay);

                TP.extern.Promise.onPossiblyUnhandledRejection(null);
                TP.extern.Promise.onUnhandledRejectionHandled(null);

                //  Run the 'after' *type* method of TP.test.Suite to tear down
                //  any global settings, like logging appenders specific to the
                //  test harness, etc.
                TP.test.Suite.after();

                //  Summarize output
                summarize();
            },
            function(err) {

                //  Restore settings of system error condition flags.
                TP.sys.shouldLogRaise(logRaise);
                TP.sys.shouldThrowExceptions(throwExceptions);
                TP.sys.shouldLogStack(shouldLogSetting);
                TP.sys.shouldThrowHandlers(throwHandlers);

                TP.sys.setcfg('mouse.click_delay', clickDelay);

                TP.extern.Promise.onPossiblyUnhandledRejection(null);
                TP.extern.Promise.onUnhandledRejectionHandled(null);

                //  Run the 'after' *type* method of TP.test.Suite to tear down
                //  any global settings, like logging appenders specific to the
                //  test harness, etc.
                TP.test.Suite.after();

                //  Summarize output
                summarize();
            });
    /* eslint-enable handle-callback-err */
}, {
    dependencies: [TP.extern.Promise]
});

//  ========================================================================
//  Test Instrumentation Functions
//  ========================================================================

TP.defineMetaInstMethod('describe',
function(suiteName, suiteFunc) {

    /**
     * @method describe
     * @summary Adds a new test suite definition to an object. When the suite
     *     name matches a method name that suite is automatically associated
     *     with the specific method.
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
     * @method getMissingTestNames
     * @summary Returns an array of strings representing missing tests. The list
     *     is based on comparing the test suite names with the receiver's method
     *     names. Test suite names matching method names serve as tests for that
     *     method.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {String[]} An array of method names without tests.
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
     * @method getTestFixture
     * @summary Creates and returns test fixture data suitable for the receiver.
     *     This method is used to produce "the object under test" for test cases
     *     that target the receiver. The default is the receiver itself.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Object} A test fixture for the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTestSuites',
function(options) {

    /**
     * @method getTestSuites
     * @summary Returns an array containing test suites for the receiver.
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
     * @method runTestSuites
     * @summary Runs the test suites associated with the receiver. Options which
     *     help configure and control the testing process can be provided.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    var params;

    params = TP.hc(options);
    params.atPut('target', this);

    return TP.test.runSuites(params);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
