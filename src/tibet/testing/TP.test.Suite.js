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
 * @type {TP.test.Suite}
 * @summary A subtype of TP.test.Root that manages suites of test cases.
 */

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

/**
 * A log appender that gets installed when the test harness is running to catch
 * errors and fail the current executing test case.
 * @type {TP.log.TestAppender}
 */
TP.test.Suite.Type.defineAttribute('logAppender');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.Suite.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var appender;

    //  Initialize a log appender for our default 'TP' and 'APP' logs. This
    //  makes sure that logging of a particular log level or higher while the
    //  test cases are being run will fail the test case.
    appender = TP.log.TestAppender.construct();
    this.$set('logAppender', appender);

    return;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Type.defineMethod('addSuite',
function(target, suiteName, suiteFunc) {

    /**
     * @method addSuite
     * @summary Adds a new test suite to the list of known test suites.
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

TP.test.Suite.Type.defineMethod('after',
function() {

    /**
     * @method after
     * @summary This method will be executed after all test cases of all test
     *     suites in the current run have been executed. It performs any tear
     *     down of 'global' TIBET functionality that the test harness might have
     *     needed during its test run.
     * @returns {TP.test.Suite} The receiver.
     */

    var appender;

    appender = this.get('logAppender');

    //  Make sure uninstall the test appender from our default 'TP' and 'APP'
    //  logs as our last thing to do.
    TP.getDefaultLogger().removeAppender(appender);
    APP.getDefaultLogger().removeAppender(appender);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Type.defineMethod('before',
function() {

    /**
     * @method before
     * @summary This method will be executed before all test cases of all test
     *     suites in the current run have been executed. It performs any set up
     *     of 'global' TIBET functionality that the test harness might need
     *     during its test run.
     * @returns {TP.test.Suite} The receiver.
     */

    var appender;

    appender = this.get('logAppender');

    //  Install it for both 'TP' and 'APP' logs
    TP.getDefaultLogger().addAppender(appender);
    APP.getDefaultLogger().addAppender(appender);

    return this;
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
 * The currently executing test case.
 * @type {TP.test.Case}
 */
TP.test.Suite.Inst.defineAttribute('currentTestCase');

/**
 * A hash of 1..n 'drivers' used for things like fetching resources,
 * manipulating the GUI and running shell commands.
 * @type {TP.gui.Driver}
 */
TP.test.Suite.Inst.defineAttribute('drivers');

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
 * The count of 'exclusive' test cases (i.e. those with '.only()') in this
 * suite.
 * @type {Number}
 */
TP.test.Suite.Inst.defineAttribute('$exclusiveCount');

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
     * @method addSuite
     * @summary Adds an additional suite function to the current test suite.
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
     * @method after
     * @summary Defines an optional function to run after all test cases have
     *     been executed.
     * @param {Function} teardown The 'after all' function to save.
     * @returns {TP.test.Suite} The receiver.
     */

    this.set('afterAll', teardown);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('afterEach',
function(teardown) {

    /**
     * @method afterEach
     * @summary Defines an optional function to run after each test case has
     *     been executed.
     * @param {Function} teardown The 'after each' function to save.
     * @returns {TP.test.Suite} The receiver.
     */

    this.set('afterEvery', teardown);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('before',
function(setup) {

    /**
     * @method before
     * @summary Defines an optional function to run before all test cases have
     *     been executed.
     * @param {Function} setup The 'after all' function to save.
     * @returns {TP.test.Suite} The receiver.
     */

    this.set('beforeAll', setup);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('beforeEach',
function(setup) {

    /**
     * @method before
     * @summary Defines an optional function to run before all test cases have
     *     been executed.
     * @param {Function} setup The 'after all' function to save.
     * @returns {TP.test.Suite} The receiver.
     */

    this.set('beforeEvery', setup);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('catch',
function(aFunction) {

    /**
     * @method catch
     * @summary A convenience mechanism to handling errors in Promise chains.
     * @param {Function} aFunction The Function to run when an Error occurs.
     * @returns {TP.test.Suite} The receiver.
     */

    var internalPromise,

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

    //  'catch' onto our last promise, chaining on the promise we just
    //  allocated.
    newPromise = lastPromise.catch(aFunction);

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

TP.test.Suite.Inst.defineMethod('executeAfter',
function(result, options) {

    /**
     * @method executeAfter
     * @summary Executes any optional function that has been defined to run
     *     after all test cases have been executed.
     * @param {Object} result The object returned from the prior step in the
     *     test harness processing (which will be any result of the last it()
     *     statement or the last afterEach() statement, if one is defined).
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    var spy,

        func,

        retVal;

    this.set('msend', Date.now());

    //  We provide a 'then()', 'thenAllowGUIRefresh()', 'thenPromise()' and
    //  'thenWait()' API to our drivers.
    //  We need to reset this after executing all of the test cases, since they
    //  set this to themselves while they're running.
    this.setPromiseAPIProvider(this);

    //  And the current UI canvas is the GUI driver's window context. Again, we
    //  reset this in case one of test cases set it to something else.
    this.setGUIDriverWindowContext(TP.sys.getUICanvas());

    //  Run any after() which was registered.
    func = this.get('afterAll');
    if (TP.isCallable(func)) {
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

    /**
     * @method executeAfterEach
     * @summary Executes any optional function that has been defined to run
     *     after each test case has been executed.
     * @param {Object} result The object returned from the prior step in the
     *     test harness processing (which will be any result of the last it()
     *     statement).
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

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

    /**
     * @method executeBefore
     * @summary Executes any optional function that has been defined to run
     *     before all test cases have been executed.
     * @param {Object} result This object will always be null, given that this
     *     is the first step in overall test harness processing.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    var func,

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

    //  We provide a 'then()', 'thenAllowGUIRefresh()', 'thenPromise()' and
    //  'thenWait()' API to our drivers.
    this.setPromiseAPIProvider(this);

    //  And the current UI canvas is the GUI driver's window context.
    this.setGUIDriverWindowContext(TP.sys.getUICanvas());

    //  Run any before() which was registered.
    func = this.get('beforeAll');
    if (TP.isCallable(func)) {

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

    /**
     * @method executeBeforeEach
     * @summary Executes any optional function that has been defined to run
     *     before each test case has been executed.
     * @param {Object} result The object returned from the prior step in the
     *     test harness processing (which will be any result of any before()
     *     statement, if one is defined).
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

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
     * @method getDriver
     * @summary Returns the test driver associated with this case's overall test
     *     suite.
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
     * @method getCaseList
     * @summary Runs the internal suite functions and returns the list of
     *     specific test case instances created as a result. The 'suite
     *     functions' are the functions passed to describe() which define the
     *     suite.
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
     * @method getOUT
     * @summary Returns the object under test (i.e. the suite owner).
     * @returns {Object} The object under test.
     */

    return this.get('suiteOwner');
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getSuiteList',
function() {

    /**
     * @method getSuiteList
     * @summary Returns the list of define functions specific to this test
     *     suite.
     * @returns {Array.<Function>} An array of suite 'describe' functions.
     */

    return this.$get('suiteList');
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getSuiteName',
function() {

    /**
     * @method getSuiteName
     * @summary Returns the name of the suite as provided to 'describe'.
     * @returns {String} The suite name.
     */

    return this.$get('suiteName');
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('init',
function(target, suiteName, suiteFunc) {

    /**
     * @method init
     * @summary Initialize the instance.
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

    //  Install any GUI drivers we might need.
    this.$set('drivers', TP.hc());
    if (TP.sys.getTypeByName('TP.gui.Driver')) {
        this.$get('drivers').atPut('gui', TP.gui.Driver.construct());
    }

    //  Track load information to support context/file test filtering.
    this.$set(TP.LOAD_PATH, TP.boot[TP.LOAD_PATH]);
    this.$set(TP.SOURCE_PATH, TP.boot[TP.SOURCE_PATH]);

    suiteFunc[TP.LOAD_PATH] = TP.boot[TP.LOAD_PATH];
    suiteFunc[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

    //  Set up a handler for unhandled rejections. We need this because if we
    //  have code outside of the test harness that is using Promises, we need to
    //  make sure that if they haven't handled the rejection, that we can fail
    //  the test case here.

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('it',
function(caseName, caseFunc) {

    /**
     * @method it
     * @summary Defines a new TP.test.Case instance for the receiving test
     *     suite. This function is typically invoked from within a 'describe'
     *     function. The describe function itself is run during getCaseList()
     *     processing to produce the list of test cases.
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

    //  Track load information to support context/file test filtering.
    caseFunc[TP.LOAD_PATH] = this.$get(TP.LOAD_PATH);
    caseFunc[TP.SOURCE_PATH] = this.$get(TP.SOURCE_PATH);

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

    /**
     * @method report
     * @summary Reports the execution of the test Cases of a single Suite.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {TP.test.Suite} The receiver.
     */

    var statistics,

        caseList,
        passed,
        failed,
        errored,
        ignored,
        skipped,
        prefix,
        total,

        exclusives;

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

        if (!TP.isNumber(exclusives = this.get('$exclusiveCount'))) {
            exclusives = 0;
        }

        statistics = TP.hc('passed', passed,
                            'failed', failed,
                            'skipped', skipped,
                            'ignored', ignored,
                            'errored', errored,
                            'exclusives', exclusives);

        this.set('statistics', statistics);
    } else {
        passed = statistics.at('passed');
        failed = statistics.at('failed');
        skipped = statistics.at('skipped');
        ignored = statistics.at('ignored');
        errored = statistics.at('errored');
        exclusives = statistics.at('exclusives');
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
        ignored + ' todo, ' +
        exclusives + ' only.',
        TP.DEBUG);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('reset',
function(options) {

    /**
     * @method reset
     * @summary Resets the test suite in preparation for another test run.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {TP.test.Suite} The receiver.
     */

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
     * @method run
     * @summary Runs the test cases for the suite.
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
     * @method runTestCases
     * @summary Executes the receiver's test cases, providing each with the
     *     options object provided to help control execution.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    var suiteOwner,
        id,

        isAppTarget,

        caselist,
        statistics,
        result,
        suite,

        skippedCount,

        params,
        onlysExist,

        firstPromise,

        finalAfterHandler;

    //  Make sure to clear out any previous state.
    this.reset(options);

    //  Output a small 'suite header'

    //  Grab the suite owner.
    suiteOwner = this.get('suiteOwner');

    //  If it's a Function, then we output different identifying information
    //  depending on whether it has a TP.OWNER or not (i.e. is a method or just
    //  a Function).
    if (TP.isCallable(suiteOwner)) {
        id = '';
        if (TP.isValid(suiteOwner[TP.OWNER])) {
            id += TP.name(suiteOwner[TP.OWNER]) + '.';
        }
        id += TP.name(suiteOwner);
    } else {
        id = suiteOwner.getID();
    }

    isAppTarget = /^APP/.test(id);

    TP.sys.logTest('#', TP.DEBUG);

    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        TP.sys.logTest('# ' + 'tibet test ' +
                        id +
                        (isAppTarget ? ' ' : ' --context all ') +
                        '--suite \'' + this.getSuiteName() + '\'',
                        TP.DEBUG);
    } else {
        TP.sys.logTest('# ' + ':test ' +
                        id +
                        (isAppTarget ? ' ' : ' --context=\'all\' ') +
                        '--suite=\'' + this.getSuiteName() + '\'',
                        TP.DEBUG);
    }

    params = TP.hc(options);

    caselist = this.getCaseList(options);

    if (this.isSkipped() && !params.at('ignore_skip')) {

        skippedCount = caselist.getSize();

        statistics = TP.hc('passed', 0,
                            'failed', 0,
                            'skipped', skippedCount,
                            'ignored', 0,
                            'errored', 0,
                            'exclusives', 0);
        this.set('statistics', statistics);

        TP.sys.logTest('# SKIP - test suite skipped.', TP.DEBUG);
        TP.sys.logTest('# pass: 0 pass, 0 fail, 0 error, ' +
                        skippedCount + ' skip, 0 todo.');

        return TP.extern.Promise.resolve();
    }

    //  Zero-out the count of 'exclusive' test cases (i.e. those with '.only()')
    //  in this suite.
    this.set('$exclusiveCount', 0);

    //  Filter for exclusivity. We might get more than one if authoring was off
    //  so check for that as well.
    if (!params.at('ignore_only')) {

        //  Test to see if there are any exclusive test cases
        onlysExist = caselist.some(
                function(test) {
                    return test.isExclusive();
                });

        if (onlysExist) {
            TP.sys.logTest('# filtering for exclusive test cases.',
                            TP.WARN);

            caselist = caselist.filter(
                        function(test) {
                            return test.isExclusive();
                        });

            if (caselist.getSize() > 1) {
                TP.sys.logTest('# ' + caselist.getSize() +
                    ' exclusive test cases found.', TP.WARN);
            }

            this.set('$exclusiveCount', caselist.getSize());
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
                        //  The suite run() operation errored out. If a test
                        //  case failed, it will have already been fail()ed or
                        //  error()ed.

                        //  But, in case the error occurred in a piece of code
                        //  that is in a Promise that is *outside* of a
                        //  particular test case, but in the process of running
                        //  a test case, error out the currently executing test
                        //  case with the error object.
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
                    //  Otherwise, just report and cleanup.
                    suite.report(options);
                }
            }
        };

    //  'Finally' action for our caselist promise chain, run the 'after' hook.
    return result.then(finalAfterHandler, finalAfterHandler);
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('setPromiseAPIProvider',
function(provider) {

    /**
     * @method setPromiseAPIProvider
     * @summary Sets the 'promise provider' for the drivers that have been set
     *     up for this suite, such as GUI or TSH drivers.
     * @param {Object} provider The object that will provide Promise objects for
     *     this suite's drivers.
     * @returns {TP.test.Suite} The receiver.
     */

    var drivers;

    //  The provider object provides a 'then()', 'thenAllowGUIRefresh()',
    //  'thenPromise()' and 'thenWait()' API to our drivers.

    drivers = this.$get('drivers');
    drivers.getKeys().perform(
        function(driverKey) {
            drivers.at(driverKey).set('promiseProvider', provider);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('setGUIDriverWindowContext',
function(windowContext) {

    /**
     * @method setGUIDriverWindowContext
     * @summary Sets the window context for the GUI driver that has been set up
     *     for this suite.
     * @param {TP.core.Window} windowContext The Window that will provide a GUI
     *     context to execute any GUI tests in.
     * @returns {TP.test.Suite} The receiver.
     */

    var drivers;

    drivers = this.$get('drivers');

    drivers.getKeys().perform(
        function(driverKey) {
            if (driverKey === 'gui') {
                drivers.at(driverKey).set('windowContext', windowContext);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('startTrackingSignals',
function(captureStackTraces) {

    /**
     * @method startTrackingSignals
     * @summary Starts tracking signals for usage by assertion methods.
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
     * @method stopTrackingSignals
     * @summary Stops tracking signals for usage by assertion methods.
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
     * @method then
     * @summary 'Then's onto our internally-held promise thereby, effectively
     *     queuing the operation.
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
     * @method thenAllowGUIRefresh
     * @summary A convenience mechanism to give the GUI a chance to refresh.
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
     * @method thenPromise
     * @summary A convenience mechanism to create a Promise with the supplied
     *     Function and 'append it' (if you will) onto the current
     *     internally-held Promise. Note that this operation will also reset the
     *     internally-held Promise to be the new Promise that it creates.
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
     * @method thenWait
     * @summary A convenience mechanism to wait a certain number of milliseconds
     *     using the receiver's Promise machinery.
     * @param {Number} timeoutMS The number of milliseconds to wait.
     * @returns {TP.test.Suite} The receiver.
     */

    this.thenPromise(
        function(resolver, rejector) {
            return TP.extern.Promise.delay(timeoutMS).then(resolver, rejector);
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
