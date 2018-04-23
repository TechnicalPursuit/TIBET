//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/* global AssertionFailed:true,
          $STATUS:true
*/

/**
 * @type {TP.test.Case}
 * @summary A subtype of TP.test.Root that manages individual test cases.
 */

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
 * What is the path of the package that loaded this case?
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute(TP.LOAD_PACKAGE);

/**
 * What is the name of the config that loaded this case?
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute(TP.LOAD_CONFIG);

/**
 * What is the stage that loaded this case? Phase one or phase two?
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute(TP.LOAD_STAGE);

/**
 * What is the original source location for this test case?
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute(TP.SOURCE_PATH);

/**
 * What is the path of the original source package that loaded this case?
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute(TP.SOURCE_PACKAGE);

/**
 * What is the name of the original source config that loaded this case?
 * @type {String}
 */
TP.test.Case.Inst.defineAttribute(TP.SOURCE_CONFIG);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('errorJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method errorJob
     * @summary Internal method for handling errors thrown by test functions.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the error.
     * @returns {TP.test.Case} The receiver.
     */

    var msg,

        info;

    this.set('msend', Date.now());

    msg = ('not ok - ' + this.getCaseName() + ' error' +
            (aFaultString ? ': ' + aFaultString : '')).trim();

    if (msg.charAt(msg.getSize() - 1) !== '.') {
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
     * @method expect
     * @summary Creates (or recycles) and returns an expectation object which
     *     gives the test case access to a BDD-style 'expect' assertion
     *     interface for making assertions.
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
     * @method failJob
     * @summary Internal method for handling notifications of test failures.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.test.Case} The receiver.
     */

    var msg,
        info;

    this.set('msend', Date.now());

    msg = 'not ok - ' + this.getCaseName() +
        (aFaultString ? ': ' + aFaultString : '').trim();

    if (msg.charAt(msg.getSize() - 1) !== '.') {
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

TP.test.Case.Inst.defineMethod('failUsingResponse',
function(aResponse) {

    /**
     * @method failUsingResponse
     * @summary Fail the receiver using information from the supplied response.
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
     * @method getCaseName
     * @summary Returns the individual case name.
     * @returns {String} The case name.
     */

    return this.$get('caseName');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getCircularKeys',
function() {

    /**
     * @method getCircularKeys
     * @summary Returns a known list of keys for the receiver that will cause a
     *     circular reference to eventually occur. Used by asString/asSource to
     *     allow certain types to avoid circular reference issues when
     *     producing simple string representations.
     * @returns {Array.<String>} For test cases the 'suite' key can be circular.
     */

    //  The test suite will refer to case lists. The 'assert' and 'refute'
    //  keys reference the test collection which refer to current test case.
    return TP.ac('assert', 'refute', 'suite');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getDriver',
function(aKey) {

    /**
     * @method getDriver
     * @summary Returns the test driver associated with this case's overall
     *     test suite.
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
     * @method getOUT
     * @summary Returns the object under test (i.e. the case's suite owner).
     * @returns {Object} The object under test.
     */

    return this.getSuite().get('suiteOwner');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getStatus',
function() {

    /**
     * @method getStatus
     * @summary Returns the result status for the test case, if it has finished.
     * @returns {Number} The status code.
     */

    return this.$get('statusCode');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getSuite',
function() {

    /**
     * @method getSuite
     * @summary Returns the TP.test.Suite that owns this test case.
     * @returns {TP.test.Suite}
     */

    return this.$get('suite');
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('init',
function(suite, caseName, caseFunc) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Object} suite The suite that owns the test case.
     * @param {String} caseName The name assigned to the case. Should be unique
     *     for the specific test suite.
     * @param {Function} caseFunc The function implementing the test case.
     * @returns {TP.test.Case} The newly created test case.
     */

    var loadPath,
        loadPackage,
        loadConfig,
        loadStage,

        sourcePath,
        sourcePackage,
        sourceConfig,

        thisref;

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

    loadPath = suite[TP.LOAD_PATH];
    loadPackage = suite[TP.LOAD_PACKAGE];
    loadConfig = suite[TP.LOAD_CONFIG];
    loadStage = suite[TP.LOAD_STAGE];

    sourcePath = suite[TP.SOURCE_PATH];
    sourcePackage = suite[TP.SOURCE_PACKAGE];
    sourceConfig = suite[TP.SOURCE_CONFIG];

    //  Track load information to support context/file test filtering. NOTE that
    //  we use the suite path information here because until the suite actually
    //  invokes the suite function the 'it' calls are not run and hence the case
    //  won't reflect where it was truly defined.
    this.$set(TP.LOAD_PATH, loadPath);
    this.$set(TP.LOAD_PACKAGE, loadPackage);
    this.$set(TP.LOAD_CONFIG, loadConfig);
    this.$set(TP.LOAD_STAGE, loadStage);

    this.$set(TP.SOURCE_PATH, sourcePath);
    this.$set(TP.SOURCE_PACKAGE, sourcePackage);
    this.$set(TP.SOURCE_CONFIG, sourceConfig);

    //  Track load information to support context/file test filtering.
    caseFunc[TP.LOAD_PATH] = loadPath;
    caseFunc[TP.LOAD_PACKAGE] = loadPackage;
    caseFunc[TP.LOAD_CONFIG] = loadConfig;
    caseFunc[TP.LOAD_STAGE] = loadStage;

    caseFunc[TP.SOURCE_PATH] = sourcePath;
    caseFunc[TP.SOURCE_PACKAGE] = sourcePackage;
    caseFunc[TP.SOURCE_CONFIG] = sourceConfig;

    //  Capture the case (this) as the TP.OWNER of the case Function. This will
    //  help tie it back to the case if we need to introspect on it.
    thisref = this;

    caseFunc[TP.OWNER] = thisref;

    //  Define a local version of the 'replaceWith' method on the case Function
    //  that will call upon the case object to allow it to be replaced in the
    //  case.
    caseFunc.defineMethod('replaceWith',
                            function(aFunction, copySourceInfo) {
                                return thisref.replaceTestFunctionWith(
                                        this, aFunction, copySourceInfo);
                            });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('getFiredSignalInfos',
function(flags) {

    /**
     * @method getFiredSignalInfos
     * @summary Returns an Array of hashes of information about the argument
     *     sets of the signals fired using the TP.signal spy since it was last
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
     * @method getFiredSignalInfosString
     * @summary Returns a String representation of the Array of hashes of
     *     information about the argument sets of the signals fired using the
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
     * @method getFiredSignals
     * @summary Returns an Array of the set of arguments of the signals fired
     *     using the TP.signal spy since it was last reset.
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
     * @method getFiredSignalInfoAt
     * @summary Returns a hash of information about the argument set of the
     *     signal at signalIndex within the Array of signals fired using the
     *     TP.signal spy since it was last reset.
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

    reportFlags = flags;
    if (TP.notValid(reportFlags)) {
        reportFlags = {};
    }

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
     * @method getFiredSignalNames
     * @summary Returns an Array of the names of the signals fired using the
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
     * @method getFiredSignalStacks
     * @summary Returns an Array of the stack traces of the signals fired using
     *     the TP.signal spy since it was last reset.
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
     * @method only
     * @summary Marks the receiver as exclusive, meaning it should be the only
     *     item run in a list of multiple items. When multiple items are marked
     *     as being exclusive only the first of them will be run.
     * @returns {TP.test.Case} The receiver.
     */

    this.$set('exclusive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('pass',
function() {

    /**
     * @method pass
     * @summary Handles notification that the test case passed (or more
     *     accurately that it didn't fail and didn't error out).
     * @returns {TP.test.Case} The receiver.
     */

    var msg;

    if (this.isCompleting() || this.didComplete()) {
        return;
    }

    this.complete();

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

    /**
     * @method $reject
     * @summary Calls the internal Promise rejector Function.
     * @returns {TP.test.Case} The receiver.
     */

    this.$rejector();

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('replaceTestFunctionWith',
function(oldFunction, newFunction, copySourceInfo) {

    /**
     * @method replaceTestFunctionWith
     * @summary Replaces the supplied old Function with the supplied new
     *     Function which becomes the receiver's case Function..
     * @param {Function} oldFunction The original Function.
     * @param {Function} newFunction The replacement Function.
     * @param {Boolean} copySourceInfo Whether or not to copy 'source'
     *     information such as the load node and source path. The default is
     *     true.
     * @returns {Function} The new method.
     */

    var thisref;

    //  If the caller hasn't supplied false to the copySourceInfo parameter
    //  capture the 'path information' slots about this method. We need to do
    //  this because when we redefine the method below, this information will be
    //  lost.
    if (TP.notFalse(copySourceInfo)) {
        newFunction[TP.LOAD_PATH] = oldFunction[TP.LOAD_PATH];
        newFunction[TP.LOAD_PACKAGE] = oldFunction[TP.LOAD_PACKAGE];
        newFunction[TP.LOAD_CONFIG] = oldFunction[TP.LOAD_CONFIG];
        newFunction[TP.LOAD_STAGE] = oldFunction[TP.LOAD_STAGE];

        newFunction[TP.SOURCE_PATH] = oldFunction[TP.SOURCE_PATH];
        newFunction[TP.SOURCE_PACKAGE] = oldFunction[TP.SOURCE_PACKAGE];
        newFunction[TP.SOURCE_CONFIG] = oldFunction[TP.SOURCE_CONFIG];
    }

    //  Capture the case (this) as the TP.OWNER of the case Function. This will
    //  help tie it back to the case if we need to introspect on it.
    thisref = this;

    //  Make sure that the TP.OWNER of the replacement Function is set to the
    //  receiver.
    newFunction[TP.OWNER] = thisref;

    newFunction.defineMethod('replaceWith',
                                function(aFunction, copySrcInfo) {
                                    return thisref.replaceTestFunctionWith(
                                            this, aFunction, copySrcInfo);
                                });

    this.$set('caseFunc', newFunction);

    return newFunction;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('$resolve',
function() {

    /**
     * @method $resolve
     * @summary Calls the internal Promise resolver Function.
     * @returns {TP.test.Case} The receiver.
     */

    if (!this.$resolver) {
        /* eslint-disable no-debugger */
        debugger;
        /* eslint-enable no-debugger */
    }

    this.$resolver();

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('reset',
function(options) {

    /**
     * @method reset
     * @summary Resets the test case in preparation for another test run.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {TP.test.Case} The receiver.
     */

    this.callNextMethod();

    this.$set('msstart', null);
    this.$set('msend', null);

    this.$set('$resolver', null);
    this.$set('$rejector', null);

    this.$set('assert', null);
    this.$set('refute', null);

    this.$set('$executedAssertion', false);

    if (options && options.at('case_timeout')) {
        this.$set('mslimit', options.at('case_timeout'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('run',
function(options) {

    /**
     * @method run
     * @summary Creates and returns a promise which runs the test case. You can
     *     leverage the 'then' method of the Promise API to take action upon
     *     success or failure of the test case.
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
    /* eslint-disable consistent-this */
    testcase = this;
    /* eslint-enable consistent-this */

   /* eslint-disable new-cap */
    promise = TP.extern.Promise.construct(
            function(resolver, rejector) {
                var asserter,
                    refuter,
                    logAppender,

                    internalPromise,
                    maybe;

                //  If this testcase is skipped and we're not ignoring skips,
                //  then just call the resolver and return.
                if (testcase.isSkipped() && !params.at('ignore_skip')) {
                    TP.sys.logTest(
                            'ok - ' + testcase.getCaseName() + ' # SKIP');
                    resolver();

                    return;
                }

                //  Set up state for the current test case
                testcase.getSuite().set('currentTestCase', testcase);

                asserter = testcase.getSuite().get('asserter');
                asserter.$set('currentTestCase', testcase);
                testcase.$set('assert', asserter);

                refuter = testcase.getSuite().get('refuter');
                refuter.$set('currentTestCase', testcase);
                testcase.$set('refute', refuter);

                logAppender = TP.test.Suite.get('logAppender');
                if (TP.isValid(logAppender)) {
                    logAppender.$set('currentTestCase', testcase);
                }

                //  configure the chain api provider.
                testcase.getSuite().setChainingProvider(testcase);

                //  We set this each time a test case is executed in case a
                //  prior test case set it to something else.
                testcase.getSuite().setGUIDriverWindowContext(
                                                    TP.sys.getUICanvas());

                //  Capture references to the resolve/reject operations we can
                //  use from the test case itself. Do this first so any errors
                //  below will still be able to depend on these hooks being in
                //  place.
                testcase.set('$resolver', resolver);
                testcase.set('$rejector', rejector);

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

                            maybe.then(
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

                                    //  Make sure to resolve() the Promise above
                                    //  here so that the rest of the chain after
                                    //  this test case continues to process.
                                    resolver();
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

                                    //  Make sure to resolve() the Promise above
                                    //  here so that the rest of the chain after
                                    //  this test case continues to process.
                                    resolver();
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

                            //  Make sure to resolve() the Promise above here so
                            //  that the rest of the chain after this test case
                            //  continues to process.
                            resolver();
                        }
                    } else {
                        //  There was an internal Promise.

                        //  Now, if the test method itself returned a Promise,
                        //  then we should return that in a 'then' on our
                        //  internal promise.
                        //  Based on the evaluation of that, the testcase will
                        //  have been considered to have passed or failed.

                        if (TP.isThenable(maybe)) {
                            internalPromise.then(
                                function(obj) {
                                    return maybe;
                                }).then(
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

                                    //  Make sure to resolve() the Promise above
                                    //  here so that the rest of the chain after
                                    //  this test case continues to process.
                                    resolver();
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

                                    //  Make sure to resolve() the Promise above
                                    //  here so that the rest of the chain after
                                    //  this test case continues to process.
                                    resolver();
                                });

                        } else {
                            //  The test method didn't return a Promise - just
                            //  'then' onto our internal promise to either
                            //  pass or fail the testcase.
                            internalPromise.then(
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

                                    //  Make sure to resolve() the Promise above
                                    //  here so that the rest of the chain after
                                    //  this test case continues to process.
                                    resolver();
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

                                    //  Make sure to resolve() the Promise above
                                    //  here so that the rest of the chain after
                                    //  this test case continues to process.
                                    resolver();
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
//  end
//  ========================================================================
