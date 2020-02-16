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
 * @type {TP.test.Root}
 * @summary Common supertype for other TP.test objects like TP.test.Case and
 *     TP.test.Suite.
 */

TP.lang.Object.defineSubtype('test.Root');

//  can't construct concrete instances of this
TP.test.Root.isAbstract(true);

//  Add support for providing Promises.
TP.test.Root.addTraits(TP.core.PromiseProvider);

//  Add support for job control status tracking and querying.
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
     * @method getElapsedTime
     * @summary Returns the number of milliseconds of elapsed time for the
     *     operation.
     * @returns {Number} The elapsed time in milliseconds.
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
     * @method getTimeout
     * @summary Returns the millisecond timeout value for the test case.
     * @returns {Number} The timeout value in milliseconds.
     */

    return this.$get('mslimit');
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('getTimeRemaining',
function() {

    /**
     * @method getTimeRemaining
     * @summary Returns the number of milliseconds remaining between elapsed
     *     time and the receiver's timeout value.
     * @returns {Number} The time remaining in milliseconds.
     */

    return Math.max(0, this.getTimeout() - this.getElapsedTime());
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isExclusive',
function() {

    /**
     * @method isExclusive
     * @summary Returns true if the receiver is configured to be run exclusively.
     * @returns {Boolean} True if the receiver is exclusive.
     */

    return this.$get('exclusive') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isSkipped',
function() {

    /**
     * @method isSkipped
     * @summary Returns true if the receiver is configured to be skipped (not
     *     run).
     * @returns {Boolean} True if the receiver is skipped.
     */

    return this.$get('skipped') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('isTodo',
function() {

    /**
     * @method isTodo
     * @summary Returns true if the receiver is configured as a 'todo' test.
     * @returns {Boolean} True if the receiver is marked as a todo item.
     */

    return this.$get('ignored') === true;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('only',
function() {

    /**
     * @method only
     * @summary Marks the receiver as exclusive, meaning it should be the only
     *     item run in a list of multiple items. When multiple items are marked
     *     as being exclusive only the first of them will be run.
     * @returns {TP.test.Root} The receiver.
     */

    this.$set('exclusive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('reset',
function(options) {

    /**
     * @method reset
     * @summary Resets the receiver, putting instance variables back to their
     *     original values so it can be run again.
     * @param {TP.core.Hash} options A dictionary of test options.
     * @returns {TP.test.Root} The receiver.
     */

    //  Call 'upward' to the PromiseProvider's reset method
    this.callNextMethod();

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
     * @method skip
     * @summary Marks the receiver as skipped, meaning it will be listed but not
     *     run.
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
     * @method timeout
     * @summary Defines a millisecond limit on how long the receiver can run
     *     before being timed out (which cause the Case or Suite to fail).
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
     * @method todo
     * @summary Marks the receiver as todo, meaning it will be run but its
     *     result will always be considered as a non-failure for overall
     *     reporting purposes.
     * @returns {TP.test.Root} The receiver.
     */

    this.$set('ignored', true);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
