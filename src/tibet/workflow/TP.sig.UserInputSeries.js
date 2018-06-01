//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.sig.UserInputSeries}
 * @summary A request type specifically intended to query the user for a series
 *     of data elements, validating each one before proceeding. This type can
 *     also be used to construct simple query sequences or console 'wizards' to
 *     prompt the user for information in a sequence.
 * @example
 *     uis = TP.sig.UserInputSeries.construct();
 *
 *     uis.addQuery(TP.hc('query', 'Knock Knock Neo...', 'validator',
 *                  function(input) {
 *                      return /who.*s there/i.test(input);
 *                  }));
 *
 *     uis.addQuery(TP.hc('query', 'Hello', 'validator',
 *                  function(input) {
 *                      return /hello who/i.test(input);
 *                  }));
 *
 *     uis.addCancelHook(
 *              function(series) {
 *                  TP.sig.UserOutputRequest.construct(
 *                      TP.hc( 'output','Quitter!', 'messageType','failure')).
 *                                                  fire(series.get('origin'));
 *              });
 *
 *     uis.addFailureHook(
 *              function(series) {
 *                  TP.sig.UserOutputRequest.construct(
 *                      TP.hc( 'output','Oops!', 'messageType','failure' )).
 *                                                  fire(series.get('origin'));
 *              });
 *
 *     uis.addSuccessHook(
 *              function(series) {
 *                  TP.sig.UserOutputRequest.construct(
 *                      TP.hc('output','Hello World!')).
 *                                                  fire(series.get('origin'));
 *              });
 *
 *     Note that we need to associate the request with a shell if we want a
 *     console to respond since consoles only work on behalf of their models:
 *
 *     uis.fire(this);
 */

//  ------------------------------------------------------------------------

TP.sig.UserInputRequest.defineSubtype('UserInputSeries');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  constants defining array indices for query records
TP.sig.UserInputSeries.Type.defineConstant('QUERY_INDEX', 0);
TP.sig.UserInputSeries.Type.defineConstant('DEFAULT_INDEX', 1);
TP.sig.UserInputSeries.Type.defineConstant('PASSWORD_INDEX', 2);
TP.sig.UserInputSeries.Type.defineConstant('RETRY_INDEX', 3);
TP.sig.UserInputSeries.Type.defineConstant('VALIDATOR_INDEX', 4);
TP.sig.UserInputSeries.Type.defineConstant('COUNT_INDEX', 5);

//  common validation functions
TP.sig.UserInputSeries.Type.defineConstant('OPTIONAL',
    function() {

        return true;
    });

TP.sig.UserInputSeries.Type.defineConstant('MANDATORY',
    function(input) {

        return TP.notEmpty(input);
    });

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Type.defineAttribute('responseType', 'TP.sig.UserInput');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the origin we were last initiated with
TP.sig.UserInputSeries.Inst.defineAttribute('origin');

//  holder for an array of query entries
TP.sig.UserInputSeries.Inst.defineAttribute('queries');

//  the current index in the query list
TP.sig.UserInputSeries.Inst.defineAttribute('queryIndex', 0);

//  holder for the user's replies to the queries
TP.sig.UserInputSeries.Inst.defineAttribute('replies');

//  the number of times to retry a query/validation step before quitting
TP.sig.UserInputSeries.Inst.defineAttribute('retries', 0);
TP.sig.UserInputSeries.Inst.defineAttribute('retryMax', 5);

//  holder for a shared TP.sig.UserOutputRequest for error messages etc.
TP.sig.UserInputSeries.Inst.defineAttribute('uor');

TP.sig.UserInputSeries.Inst.defineAttribute('cancelHooks');
TP.sig.UserInputSeries.Inst.defineAttribute('failureHooks');
TP.sig.UserInputSeries.Inst.defineAttribute('successHooks');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initializes a new request object and returns it.
     * @returns {TP.sig.UserInputSeries} A new instance.
     */

    this.callNextMethod();

    //  initialize our query array
    this.$set('queries', TP.ac());

    //  initialize the response array
    this.$set('replies', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('failJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method failJob
     * @summary Tells the request/response to fail, meaning the receiver should
     *     do whatever finalization is necessary to reach the TP.FAILED state.
     *     If the receiver has specific behavior to implement it can be added
     *     via addFailureHook() calls. Note that the status is TP.FAILING during
     *     any processing and TP.FAILED after processing is done.
     * @param {String} aFaultString Description of the error.
     * @param {Object} aFaultCode A code providing additional information on
     *     what went wrong.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.sig.UserInputSeries} The receiver.
     */

    var arr,
        i,
        len;

    //  Call the supertype method to make sure to get the proper signals
    //  sent.
    //  NOTE: This may have other implications around signaling things like
    //  'TP.sig.RequestFailed' / 'TP.sig.RequestSucceeded' before we run the
    //  hooks.

    this.callNextMethod();

    this.setSignalName(this.getTypeName());

    //  run failure hooks, if any...
    if (TP.isArray(arr = this.get('failureHooks'))) {
        len = arr.getSize();
        for (i = 0; i < len; i++) {
            try {
                arr.at(i)(this, aFaultString, aFaultCode, aFaultInfo);
            } catch (e) {
                TP.ifError() ?
                    TP.error(TP.ec(e, 'Error running failure hook.')) : 0;
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('addCancelHook',
function(aFunction) {

    /**
     * @method addCancelHook
     * @summary Adds a function to run at cancellation. There can be multiple
     *     functions added via this method, and they will be executed in the
     *     order they were added.
     * @param {Function} aFunction A function to run if the request is
     *     cancelled.
     * @returns {TP.sig.UserInputSeries}
     */

    var arr;

    if (!TP.isCallable(aFunction)) {
        return this.raise('TP.sig.InvalidFunction');
    }

    if (TP.notValid(arr = this.get('cancelHooks'))) {
        arr = TP.ac();
        this.$set('cancelHooks', arr);
    }

    arr.add(aFunction);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('addFailureHook',
function(aFunction) {

    /**
     * @method addFailureHook
     * @summary Adds a function to run on failure. There can be multiple
     *     functions added via this method, and they will be executed in the
     *     order they were added.
     * @param {Function} aFunction A function to run if the request ends in
     *     failure.
     * @returns {TP.sig.UserInputSeries}
     */

    var arr;

    if (!TP.isCallable(aFunction)) {
        return this.raise('TP.sig.InvalidFunction');
    }

    if (TP.notValid(arr = this.get('failureHooks'))) {
        arr = TP.ac();
        this.$set('failureHooks', arr);
    }

    arr.add(aFunction);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('addQuery',
function(aParamHash) {

    /**
     * @method addQuery
     * @summary Adds a query, optional default value, and optional validator to
     *     the list of queries this request should manage.
     * @param {TP.core.Hash} aParamHash A hash containing optional parameter
     *     keys including: 'query': A string or function which can generate a
     *     string used as the query string. 'count': The number of times this
     *     validator should be attempted before failing. Default is 3.
     *     'default': The default value for the query, or a function which can
     *     generate it at runtime. 'hideInput': Should input be hidden, i.e. is
     *     this a password field etc? Defaults to false. 'retryPrompt': A string
     *     to show when the input isn't valid. Default is 'Retry?' 'validator':
     *     A function which should return true if the user's response is valid.
     * @returns {TP.sig.UserInputSeries}
     */

    var arr,
        params;

    params = aParamHash || TP.hc();

    //  note we put the entries into an array inside the list so we
    //  can access them later via index constants
    arr = TP.ac();
    arr.atPut(this.getType().get('QUERY_INDEX'), params.at('query'));
    arr.atPut(this.getType().get('DEFAULT_INDEX'),
                    params.at('default'));
    arr.atPut(this.getType().get('PASSWORD_INDEX'),
                    params.atIfInvalid('hideInput', false));
    arr.atPut(this.getType().get('RETRY_INDEX'),
                    params.atIfInvalid('retryPrompt', 'Retry?'));
    arr.atPut(this.getType().get('VALIDATOR_INDEX'),
                    params.atIfInvalid('validator', TP.isValid));
    arr.atPut(this.getType().get('COUNT_INDEX'),
                    params.atIfInvalid('count', 3));

    this.get('queries').add(arr);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('addSuccessHook',
function(aFunction) {

    /**
     * @method addSuccessHook
     * @summary Adds a function to run on success. There can be multiple
     *     functions added via this method, and they will be executed in the
     *     order they were added.
     * @param {Function} aFunction A function to run if the request completes
     *     successfully.
     * @returns {TP.sig.UserInputSeries}
     */

    var arr;

    if (!TP.isCallable(aFunction)) {
        return this.raise('TP.sig.InvalidFunction');
    }

    if (TP.notValid(arr = this.get('successHooks'))) {
        arr = TP.ac();
        this.$set('successHooks', arr);
    }

    arr.add(aFunction);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('cancelJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancelJob
     * @summary Tells the request/response to cancel, meaning the request is
     *     being rescinded by the user or calling process. If the receiver has
     *     specific behavior to implement it can be added via addCancelHook()
     *     calls. Note that the status is TP.CANCELLING during any processing
     *     and TP.CANCELLED after.
     * @param {String} aFaultString Description of the error.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the cancellation.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.sig.UserInputSeries} The receiver.
     */

    var arr,
        i,
        len;

    //  Call the supertype method to make sure to get the proper signals
    //  sent.
    //  NOTE: This may have other implications around signaling things like
    //  'TP.sig.RequestCancelled' / 'TP.sig.RequestSucceeded' before we run
    //  the hooks.

    this.callNextMethod();

    this.setSignalName(this.getTypeName());

    //  run any cancellation hooks...
    if (TP.isArray(arr = this.get('cancelHooks'))) {
        len = arr.getSize();
        for (i = 0; i < len; i++) {
            try {
                arr.at(i)(this, aFaultString, aFaultCode, aFaultInfo);
            } catch (e) {
                TP.ifError() ?
                    TP.error(TP.ec(e, 'Error running cancellation hook.')) : 0;
            }
        }
    }

    //  now that hooks have run, reset any parameters they might have wanted
    //  to their 'cancelled' states
    this.$set('queryIndex', Number.POSITIVE_INFINITY);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @method completeJob
     * @summary Tells the request/response to complete, meaning the receiver
     *     should do whatever finalization is necessary to reach the
     *     TP.SUCCEEDED state. If the receiver has specific behavior to
     *     implement it can be added via addSuccessHook() calls. Note that the
     *     status is TP.COMPLETING during any processing and TP.SUCCEEDED after
     *     processing is done.
     * @returns {TP.sig.UserInputSeries} The receiver.
     */

    var arr,
        i,
        len;

    //  Call the supertype method to make sure to get the proper signals
    //  sent.
    //  NOTE: This may have other implications around signaling things like
    //  'TP.sig.RequestCompleted' / 'TP.sig.RequestSucceeded' before we run
    //  the hooks.

    this.callNextMethod();

    this.setSignalName(this.getTypeName());

    //  run completion hooks, if any...
    if (TP.isArray(arr = this.get('successHooks'))) {
        len = arr.getSize();
        for (i = 0; i < len; i++) {
            try {
                arr.at(i)(this);
            } catch (e) {
                TP.ifError() ?
                    TP.error(TP.ec(e, 'Error running success hook.')) : 0;
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @method fire
     * @summary Starts the request processing sequence, resetting the query
     *     index of the receiver to the beginning of the series.
     * @param {Object} anOrigin An optional firing origin for this activation.
     * @param {Object} aPayload Optional signal arguments.
     * @param {Function} aPolicy A firing policy function.
     * @returns {TP.sig.UserInputSeries} The receiver.
     */

    var arr,
        qry,
        def,
        pass;

    //  reset to default state, TP.READY, with attributes/parameters cleared
    this.reset();

    //  track the origin so we can pass it to the various hook functions
    this.set('origin', TP.ifInvalid(this.getRequestID(), anOrigin));

    //  reset our query index to the starting point
    this.$set('queryIndex', 0);

    //  clear our retry count so we run the proper number of times
    this.$set('retries', 0);

    //  clear the response list so we capture the new data cleanly
    this.get('replies').empty();

    //  get the first query configuration
    arr = this.get('queries').at(0);
    if (TP.notValid(arr)) {
        TP.ifWarn() ?
            TP.warn('No queries for TP.sig.UserInputSeries.') : 0;

        return;
    }

    //  set up our state for the request
    qry = arr.at(this.getType().get('QUERY_INDEX'));
    def = arr.at(this.getType().get('DEFAULT_INDEX'));

    //  cover whether this query's response should be hidden
    if (TP.isTrue(pass = arr.at(this.getType().get('PASSWORD_INDEX')))) {
        this.atPut('password', true);
    } else {
        this.atPut('password', false);
    }

    //  note we can generate the prompt and default using runtime data :)
    try {
        this.atPut('query', TP.isCallable(qry) ?
                    qry(this.getLastReply(), this).asString() : qry);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error executing query generator.')) : 0;

        this.atPut('query', qry);
    }

    if (TP.isFalse(pass)) {
        try {
            this.atPut('default', TP.isCallable(def) ?
                    def(this.getLastReply(), this).asString() : def);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Error executing default generator.')) : 0;

            this.atPut('default', def);
        }
    }

    //  let the standard processing handle the rest
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('getLastReply',
function() {

    /**
     * @method getLastReply
     * @summary Returns the last response string acquired by the receiver.
     * @returns {String} The last user response.
     */

    return this.get('replies').last();
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('getReplies',
function() {

    /**
     * @method getReplies
     * @summary Returns the array of current replies to the receiver's queries.
     * @returns {String[]} The list of response strings acquired so far.
     */

    return this.$get('replies');
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('getUor',
function() {

    /**
     * @method getUor
     * @summary Returns a shared TP.sig.UserOutputRequest instance which can be
     *     used to provide output such as error messages during user input
     *     processing of the series.
     * @returns {TP.sig.UserOutputRequest} An instance of an output request.
     */

    var uor;

    uor = this.$get('uor');
    if (TP.notValid(uor)) {
        uor = TP.sig.UserOutputRequest.construct();
        this.$set('uor', uor);
    }

    return uor;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineHandler('UserInput',
function(aSignal) {

    /**
     * @method handleUserInput
     * @summary Responds to TP.sig.UserInput signals, which are sent in
     *     response to the receiver (a TP.sig.UserInputRequest). By managing
     *     completion status here the request can continue to remain active, or
     *     it can complete.
     * @param {TP.sig.UserInput} aSignal The signal instance that triggered this
     *     handler.
     * @returns {TP.sig.UserInputSeries} The receiver.
     */

    var pass,
        qry,
        def,
        arr,
        ndx,
        uor,
        func,
        valid,
        res,
        err,
        count,
        responder;

    if (aSignal.get('statusCode') === TP.CANCELLED) {
        this.cancel();
        return this;
    }

    //  capture the user's input for validation purposes
    res = aSignal.getResult();

    responder = this.get('responder');

    //  track input from all requests
    this.get('replies').atPut(this.get('queryIndex'), res);

    //  if there's no query at the current index it's because we're done...
    arr = this.get('queries').at(this.get('queryIndex'));
    if (TP.isEmpty(arr)) {
        this.complete();
        return this;
    }

    //  set up to have our retry count limited as defined
    count = TP.ifInvalid(arr.at(this.getType().get('COUNT_INDEX')),
                                this.get('retryMax'));
    count = count.min(this.get('retryMax'));

    //  if there's a validator run it and deal with any errors by
    //  resetting the receiver and keeping it ACTIVE
    func = arr.at(this.getType().get('VALIDATOR_INDEX'));
    if (TP.isCallable(func)) {
        try {
            valid = func(res, this);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Error executing validator.')) : 0;

            valid = false;
        }

        if (!valid) {
            this.set('retries', this.get('retries') + 1);

            uor = this.get('uor');

            //  deal with retry count updates
            if (this.get('retries') > count) {
                uor.atPut('output',
                                'Aborting.... Retry limit reached.');
                uor.atPut('messageType', 'failure');

                uor.fire(this.get('origin'));

                this.fail();

                return this;
            }

            err = arr.at(this.getType().get('RETRY_INDEX'));
            if (TP.notValid(err)) {
                err = 'Invalid input. Please retry.';
            }

            uor.atPut('output',
                    TP.$DEBUG && TP.$VERBOSE ?
                        'Invalid input. Validator is: ' + func :
                        err);

            uor.atPut('messageType', 'failure');

            uor.fire(this.get('origin'));

            //  make their initial nput the default value and retry
            this.reset();
            this.isActive(true);
            this.atPut('default', res);

            this.setSignalName('TP.sig.RequestModified');
            TP.handle(responder, this);

            return this;
        }
    }

    //  update our query index to show we've completed the current query
    ndx = this.get('queryIndex') + 1;
    this.$set('queryIndex', ndx);

    //  having handled this query are we done now?
    if (TP.notValid(arr = this.get('queries').at(ndx))) {
        this.complete();
        return this;
    }

    //  clear existing data in the signal regarding request/response info
    this.reset();
    this.isActive(true);

    //  cover whether this query's response should be hidden
    if (TP.isTrue(pass = arr.at(this.getType().get('PASSWORD_INDEX')))) {
        this.atPut('password', true);
    } else {
        this.atPut('password', false);
    }

    //  set up for the new query
    //  note we can generate the prompt and default using runtime data :)
    qry = arr.at(this.getType().get('QUERY_INDEX'));
    def = arr.at(this.getType().get('DEFAULT_INDEX'));

    try {
        this.atPut('query', TP.isCallable(qry) ?
                    qry(this.getLastReply(), this).asString() : qry);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error executing query generator.')) : 0;

        this.atPut('query', qry);
    }

    if (TP.isFalse(pass)) {
        try {
            this.atPut('default', TP.isCallable(def) ?
                    def(this.getLastReply(), this).asString() : def);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Error executing default generator.')) : 0;

            this.atPut('default', def);
        }
    }

    this.setSignalName('TP.sig.RequestModified');
    TP.handle(responder, this);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.UserInputSeries.Inst.defineMethod('reset',
function() {

    /**
     * @method reset
     * @summary Prepares the receiver to be re-fired, leaving certain values in
     *     place to retain continuity.
     */

    //  NOTE:   we don't clear origin in particular so that any hook
    //          functions we invoke can continue to access it for proper
    //          output targeting

    this.setSignalName(this.getTypeName());

    this.$set('response', null, false);
    this.$set('statusCode', TP.READY, false);

    this.atPut('messageType', 'prompt', false);

    this.atPut('query', null, false);
    this.atPut('default', null, false);
    this.atPut('password', null, false);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
