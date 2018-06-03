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
 * The root request that started the execution of the test harness.
 * @type {TP.sig.Request}
 */
TP.test.Suite.defineAttribute('$rootRequest');

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

TP.test.Suite.Type.defineAttribute('appAppenders');
TP.test.Suite.Type.defineAttribute('tpAppenders');

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
     * @returns {TP.test.Suite|undefined} The newly created test suite instance.
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
     * @returns {TP.meta.test.Suite} The receiver.
     */

    TP.getDefaultLogger().set('appenders', this.$get('tpAppenders'));
    APP.getDefaultLogger().set('appenders', this.$get('appAppenders'));

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
     * @returns {TP.meta.test.Suite} The receiver.
     */

    var appender,
        logger;

    appender = this.get('logAppender');

    logger = TP.getDefaultLogger();
    this.$set('tpAppenders', logger.getAppenders(true));
    logger.clearAppenders();
    logger.addAppender(appender);

    //  Don't inherit so we skip the ConsoleAppender when in phantom mode.
    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        logger.inheritsAppenders(false);
    }

    logger = APP.getDefaultLogger();
    this.$set('appAppenders', logger.getAppenders(true));
    logger.clearAppenders();
    logger.addAppender(appender);

    //  Don't inherit so we skip the ConsoleAppender when in phantom mode.
    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        logger.inheritsAppenders(false);
    }

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
 * @type {TP.test.Case[]}
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
 * @type {TP.test.GUIDriver}
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
 * @type {Function[]}
 */
TP.test.Suite.Inst.defineAttribute('suiteList');

/**
 * The name of the test suite for reporting/logging and lookup purposes.
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute('suiteName');

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
 * What is the path of the package that loaded this suite?
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute(TP.LOAD_PACKAGE);

/**
 * What is the name of the config that loaded this suite?
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute(TP.LOAD_CONFIG);

/**
 * What is the stage that loaded this suite? Phase one or phase two?
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute(TP.LOAD_STAGE);

/**
 * What is the original source location for this suite?
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute(TP.SOURCE_PATH);

/**
 * What is the path of the original source package that loaded this suite?
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute(TP.SOURCE_PACKAGE);

/**
 * What is the name of the original source config that loaded this suite?
 * @type {String}
 */
TP.test.Suite.Inst.defineAttribute(TP.SOURCE_CONFIG);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('addSuite',
function(suiteFunc) {

    /**
     * @method addSuite
     * @summary Adds an additional suite function to the current test suite.
     * @param {Function} suiteFunc The test case-generating function.
     * @returns {Function[]} The updated list of suite functions.
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

TP.test.Suite.Inst.defineMethod('errorJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method errorJob
     * @summary Internal method for handling errors thrown by test functions.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the error.
     * @returns {TP.test.Suite} The receiver.
     */

    var msg,

        info;

    this.set('msend', Date.now());

    msg = ('not ok - SUITE ' + this.getSuiteName() + ' error' +
            (aFaultString ? ': ' + aFaultString : '')).trim();

    if (msg.charAt(msg.getSize() - 1) !== '.') {
        msg += '.';
    }

    TP.sys.logTest(msg);

    info = TP.hc(aFaultInfo);

    if (TP.isError(info.at('error'))) {
        TP.sys.logTest(info.at('error'));
    }

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

    //  We need to reset this after executing all of the test cases, since they
    //  set this to themselves while they're running.
    this.setChainingProvider(this);

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

                        //  If raise is called exception happened. That's an
                        //  error() rather than a fail().
                        currentcase.error();
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

                            //  If raise is called exception happened. That's an
                            //  error() rather than a fail().
                            currentcase.error();
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

    this.setChainingProvider(this);

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

TP.test.Suite.Inst.defineMethod('failJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method failJob
     * @summary Internal method for handling notifications of test failures.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.test.Suite} The receiver.
     */

    var msg,
        info;

    this.set('msend', Date.now());

    msg = 'not ok - SUITE ' + this.getSuiteName() +
        (aFaultString ? ': ' + aFaultString : '').trim();

    if (msg.charAt(msg.getSize() - 1) !== '.') {
        msg += '.';
    }

    TP.sys.logTest(msg);

    info = TP.hc(aFaultInfo);

    if (TP.isError(info.at('error'))) {
        TP.sys.logTest(info.at('error'));
    }

    return this;
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
     * @returns {TP.test.Case[]} The case list.
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

        /* eslint-disable consistent-this */
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
        /* eslint-enable consistent-this */
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

TP.test.Suite.Inst.defineMethod('getSignalingArgs',
function() {

    /**
     * @method getSignalingArgs
     * @summary Returns any signal tracking arguments.
     * @returns {TP.test.Suite} The receiver.
     */

    return TP.signal.args;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('getSuiteList',
function() {

    /**
     * @method getSuiteList
     * @summary Returns the list of define functions specific to this test
     *     suite.
     * @returns {Function[]} An array of suite 'describe' functions.
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
     * @returns {TP.core.Hash|undefined} The new test suite instance.
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
    if (TP.sys.getTypeByName('TP.test.GUIDriver')) {
        this.$get('drivers').atPut('gui', TP.test.GUIDriver.construct());
    }

    //  Track load information to support context/file test filtering.
    this.$set(TP.LOAD_PATH, TP.boot[TP.LOAD_PATH]);
    this.$set(TP.LOAD_PACKAGE, TP.boot[TP.LOAD_PACKAGE]);
    this.$set(TP.LOAD_CONFIG, TP.boot[TP.LOAD_CONFIG]);
    this.$set(TP.LOAD_STAGE, TP.boot[TP.LOAD_STAGE]);

    this.$set(TP.SOURCE_PATH, TP.boot[TP.SOURCE_PATH]);
    this.$set(TP.SOURCE_PACKAGE, TP.boot[TP.SOURCE_PACKAGE]);
    this.$set(TP.SOURCE_CONFIG, TP.boot[TP.SOURCE_CONFIG]);

    suiteFunc[TP.LOAD_PATH] = TP.boot[TP.LOAD_PATH];
    suiteFunc[TP.LOAD_PACKAGE] = TP.boot[TP.LOAD_PACKAGE];
    suiteFunc[TP.LOAD_CONFIG] = TP.boot[TP.LOAD_CONFIG];
    suiteFunc[TP.LOAD_STAGE] = TP.boot[TP.LOAD_STAGE];

    suiteFunc[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];
    suiteFunc[TP.SOURCE_PACKAGE] = TP.boot[TP.SOURCE_PACKAGE];
    suiteFunc[TP.SOURCE_CONFIG] = TP.boot[TP.SOURCE_CONFIG];

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
     * @returns {TP.test.Case|undefined} The newly created test case.
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
                                //  If no viable status code the job never ran,
                                //  hence we'll consider it skipped.
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

    //  NB: Unless Karma is running, we do *not* reset the 'caseList' here. If
    //  it already been obtained (or even modified, say by the Sherpa IDE), we
    //  don't want to lose those changes.
    if (TP.sys.hasFeature('karma')) {
        this.$set('caseList', null);
    }

    this.$set('msstart', null);
    this.$set('msend', null);

    if (options && options.at('suite_timeout')) {
        this.$set('mslimit', options.at('suite_timeout'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('resetSignalTracking',
function() {

    /**
     * @method resetSignalTracking
     * @summary Resets any signal tracking and statistics.
     * @returns {TP.test.Suite} The receiver.
     */

    TP.signal.reset();

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

    if (/Proto$/.test(id) && TP.isPrototype(suiteOwner)) {
        id = id.replace(/Proto$/, '');
    }

    isAppTarget = /^APP/.test(id);

    TP.sys.logTest('#', TP.DEBUG);

    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        TP.sys.logTest('# ' + 'tibet test ' +
                        id +
                        (isAppTarget ? ' ' : ' --context=\'all\' ') +
                        '--suite=\'' + this.getSuiteName() + '\'',
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

    /* eslint-disable consistent-this */

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
                /* eslint-disable no-unsafe-finally */
                //  Output summary

                //  The 'after' method scheduled a Promise. Put a 'then' on it
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
                /* eslint-enable no-unsafe-finally */
            }
        };

    /* eslint-enable consistent-this */

    //  'Finally' action for our caselist promise chain, run the 'after' hook.
    return result.then(finalAfterHandler, finalAfterHandler);
});

//  ------------------------------------------------------------------------

TP.test.Suite.Inst.defineMethod('setChainingProvider',
function(provider) {

    /**
     * @method setChainingProvider
     * @summary Sets the 'promise provider' for the drivers that have been set
     *     up for this suite, such as GUI or TSH drivers.
     * @param {Object} provider The object that will provide Promise objects for
     *     this suite's drivers.
     * @returns {TP.test.Suite} The receiver.
     */

    var drivers;

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

                return func.apply(TP.sig.SignalMap, arguments);
            });
    } else {
        //  Otherwise, just install a simple spy.
        TP.signal = TP.signal.asSpy();
    }

    this.set('$capturingSignals', true);

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
//  end
//  ========================================================================
