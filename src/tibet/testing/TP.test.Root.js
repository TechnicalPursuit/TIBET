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

//  Add support for job control status tracking and querying.

TP.test.Root.addTraits(TP.core.JobStatus);

TP.test.Root.Inst.resolveTrait('resume', TP.core.JobStatus);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.Root.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.Promise');

    return;
});

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

/**
 * A promise reference that points to the 'last promise' that was
 * allocated/initialized. Therefore, this promise reference can change as the
 * test case logic adds new Promises.
 * @type {Promise}
 */
TP.test.Root.Inst.defineAttribute('$internalPromise');

/**
 * A promise reference that is kept by the test case for use by test case
 * logic as the case works its way through any 'stacking' logic whereby
 * fulfillment or rejection handlers have 'chain' statements within
 * the handler itself. See the 'chain' method for more information.
 * @type {Promise}
 */
TP.test.Root.Inst.defineAttribute('$currentPromise');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('andAllowGUIRefresh',
function() {

    /**
     * @method andAllowGUIRefresh
     * @summary A convenience mechanism to give the GUI a chance to refresh.
     * @returns {TP.test.Root} The receiver.
     */

    this.chainPromise(TP.extern.Promise.delay(
        TP.sys.cfg('test.anti_starve_timeout')));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('andWait',
function(timeoutMS) {

    /**
     * @method andWait
     * @summary A convenience mechanism to wait a certain number of milliseconds
     *     using the receiver's Promise machinery.
     * @param {Number} timeoutMS The number of milliseconds to wait.
     * @returns {TP.test.Root} The receiver.
     */

    this.chainPromise(TP.extern.Promise.delay(timeoutMS));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('andWaitFor',
function(anOrigin, aSignal) {

    /**
     * @method andWaitFor
     * @summary A convenience mechanism to wait until an origin has fired a
     *     certain signal using the receiver's Promise machinery.
     * @param {Object} anOrigin The signal origin to observe.
     * @param {TP.sig.Signal|String} aSignal The signal type or name to observe.
     * @returns {TP.test.Root} The receiver.
     */

    this.chainPromise(TP.extern.Promise.construct(
        function(resolver, rejector) {
            var handlerFunc;

            handlerFunc = function(firedSignal) {
                handlerFunc.ignore(anOrigin, aSignal);
                resolver(firedSignal);
            };

            handlerFunc.observe(anOrigin, aSignal);
        }));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('chain',
function(onFulfilled, onRejected) {

    /**
     * @method chain
     * @summary Queues a new promise with the receiver to be run after any other
     *     previously installed/queued promises complete. NOTE that this method
     *     is similar to 'then' but is intended for use in test suites and test
     *     cases to avoid issues with certain promise nesting scenarios.
     * @param {Function} onFulfilled The Function to run to if the Promise has
     *     been fulfilled.
     * @param {Function} onRejected The Function to run to if the Promise has
     *     been rejected.
     * @returns {TP.test.Root} The receiver.
     */

    var internalPromise,
        lastPromise,

        thisref,

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

    thisref = this;

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
            //  for any nested 'chain' statements *inside* of the fulfillment
            //  handler.
            subPromise = TP.extern.Promise.resolve();
            thisref.$set('$currentPromise', subPromise);

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
            subReturnPromise = thisref.$get('$currentPromise');
            thisref.$set('$currentPromise', null);

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
            thisref.$set('$currentPromise', subPromise);

            //  Protect the errback in a try...catch to make sure that any
            //  errors that could happen as part of the errback itself result in
            //  the promise being rejected.
            try {
                maybe = _errback(reason);
            } catch (e) {
                maybe = TP.extern.Promise.reject(e);
            }

            subReturnPromise = thisref.$get('$currentPromise');
            thisref.$set('$currentPromise', null);

            if (TP.isThenable(maybe)) {
                subReturnPromise = subReturnPromise.then(
                                        function() {
                                            return maybe;
                                        });
            }

            return subReturnPromise;
        });

    //  Set both our 'internal promise' (used to track the last promise
    //  allocated) and the 'current promise' to the new promise we just
    //  obtained (which will either by the internal promise as obtained when we
    //  entered this method or the current promise set by our parent stack frame
    //  'earlier' in our computation).
    this.$set('$currentPromise', newPromise);
    this.$set('$internalPromise', newPromise);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('chainCatch',
function(aFunction) {

    /**
     * @method chainCatch
     * @summary A convenience mechanism to handling errors in test suite and
     *     test case promise chains.
     * @param {Function} aFunction The Function to run when an Error occurs.
     * @returns {TP.test.Root} The receiver.
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
    //  by 'then'ing onto the 'last promise' (which will either by the
    //  internal promise as obtained when we entered this method or the current
    //  promise set by our parent stack frame 'earlier' in our computation.
    this.$set('$currentPromise', newPromise);
    this.$set('$internalPromise', newPromise);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Root.Inst.defineMethod('chainPromise',
function(aPromise) {

    /**
     * @method chainPromise
     * @summary Creates a Promise with the supplied Function and 'appends it'
     *     (if you will) onto the current internally-held Promise. Note that
     *     this operation will also reset the internally-held Promise to be the
     *     new Promise that it creates.
     * @param {TP.extern.Promise} aPromise The promise instance to chain.
     * @returns {TP.test.Root} The receiver.
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

    //  'then' onto our last promise, chaining on the promise we just
    //  allocated.
    newPromise = lastPromise.then(
        function() {
            return aPromise;
        });

    //  Set both our 'internal promise' (used to track the last promise
    //  allocated) and the 'current promise' to the new promise we just obtained
    //  by 'then'ing onto the 'last promise' (which will either by the
    //  internal promise as obtained when we entered this method or the current
    //  promise set by our parent stack frame 'earlier' in our computation.
    this.$set('$currentPromise', newPromise);
    this.$set('$internalPromise', newPromise);

    return this;
});

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

    this.$set('result', null);

    this.$set('faultCode', null);
    this.$set('faultText', null);
    this.$set('faultInfo', null);

    this.$set('statusCode', null);
    this.$set('statusText', null);

    this.$set('$internalPromise', null);
    this.$set('$currentPromise', null);

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
