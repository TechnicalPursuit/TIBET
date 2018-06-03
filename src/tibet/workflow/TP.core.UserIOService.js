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
 * @type {TP.core.UserIOService}
 * @summary A TP.core.Service specific to handling TP.sig.UserIORequests. The
 *     best example is the TIBET console which provides a way for the system to
 *     interact with the User.
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('UserIOService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  what signals will trigger this resource/service?
TP.core.UserIOService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.UserIORequest')));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the list of currently queued requests. when IO requests come in they may
//  be queued if the service is currently handing a blocking request.
TP.core.UserIOService.Inst.defineAttribute('requestQueue');

TP.core.UserIOService.Inst.defineAttribute('lastInputRequest');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @method init
     * @summary Initializes a new instance.
     * @param {String} aResourceID The unique identifier for this service.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing a service URI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.UserIOService} A new instance.
     */

    this.callNextMethod();

    this.$set('requestQueue', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('getRequestQueue',
function() {

    /**
     * @method getRequestQueue
     * @summary Returns the receiver's request queue, the list of requests
     *     which are currently awaiting processing.
     * @returns {TP.sig.Request[]}
     */

    return this.$get('requestQueue');
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('getNextRequest',
function(aRequest) {

    /**
     * @method getNextRequest
     * @summary Removes a request from the queue and returns it for processing.
     * @param {TP.sig.Request} aRequest The last request, which sometimes will
     *     need to provide information to this process.
     * @returns {TP.sig.UserIORequest} The IO request to process.
     */

    return this.get('requestQueue').shift();
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('getRequestById',
function(aRequestID) {

    /**
     * @method getRequestById
     * @summary Retrieves a request from the queue and returns it for
     *     processing. This is typically used to retrieve queued requests as
     *     part of RequestCompleted processing since those signals originate
     *     from the ID of the request that is complete.
     * @param {String} aRequestID The unique request ID for the request.
     * @returns {TP.sig.UserIORequest} The IO request found.
     */

    var req,
        queue;

    //  first check the last input request since that's the common case
    if (TP.isValid(req = this.get('lastInputRequest'))) {
        if (req.getRequestID() === aRequestID) {
            return req;
        }
    }

    //  didn't find it? check the request queue for it then...
    queue = this.get('requestQueue');
    req = queue.detect(
                function(item) {
                    return item.getRequestID() === aRequestID;
                });

    return req;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineHandler('NextRequest',
function(aRequest) {

    /**
     * @method handleNextRequest
     * @summary Processes the next request in the receiver's request queue.
     *     This method is automatically invoked at the end of each request cycle
     *     so any pending requests are handled in FIFO order.
     * @param {TP.sig.Request} aRequest The last request, which sometimes will
     *     need to provide information to this process.
     * @returns {TP.core.UserIOService} The receiver.
     */

    var req,
        handler;

    //  when input causes a new input request to be queued the
    //  'lastInputRequest' might not have been handled yet, so we have to
    //  check that first before we decide to clear it...
    if (TP.isValid(req = this.get('lastInputRequest'))) {
        if (req.isActive()) {
            //  update in case the signal has altered on the fly (by
            //  updating prompt or default value for example)
            this.refreshFromRequest(req);

            return this;
        }
    }

    //  always clear the last request to force the new request to be set and
    //  make sure we think we're available for use
    this.set('lastInputRequest', null);
    this.isAwaitingInput(false);
    this.shouldConcealInput(false);

    //  deal with running out of requests to process
    if (TP.notValid(req = this.getNextRequest(aRequest))) {
        return this[TP.composeHandlerName('NoMoreRequests')](aRequest);
    }

    handler = this.getBestHandler(req);
    if (TP.isFunction(handler)) {
        handler.call(this);
    }

    this.raise('TP.sig.UnhandledInputRequest', req);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineHandler('NoMoreRequests',
function(aRequest) {

    /**
     * @method handleNoMoreRequests
     * @summary Performs any processing required when all queued requests have
     *     been processed. The default is simply to return.
     * @param {TP.sig.Request} aRequest The last request, which sometimes will
     *     need to provide information to this process.
     * @returns {TP.core.UserIOService} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineHandler('UserInputRequest',
function(aSignal) {

    /**
     * @method handleUserInputRequest
     * @summary Responds to input requests, either handling them directly or
     *     queuing them for later processing.
     * @param {TP.sig.UserInputRequest} aSignal
     * @returns {TP.core.UserIOService} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineHandler('UserInputSeries',
function(aSignal) {

    /**
     * @method handleUserInpuSeries
     * @summary Responds to input series, either handling them directly or
     *     queuing them for later processing.
     * @param {TP.sig.UserInputSeries} aSignal
     * @returns {TP.core.UserIOService} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineHandler('UserOutputRequest',
function(aSignal) {

    /**
     * @method handleUserOutputRequest
     * @summary Responds to output requests, either handling them directly or
     *     queuing them for later processing.
     * @param {TP.sig.UserOutputRequest} aSignal
     * @returns {TP.core.UserIOService} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('isAwaitingInput',
function(aFlag) {

    /**
     * @method isAwaitingInput
     * @summary Combined setter/getter for whether the receiver is waiting for
     *     input. This method will interrogate the input cell as part of the
     *     process.
     * @param {Boolean} aFlag An optional new setting.
     * @returns {Boolean} The current input state.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('queueIORequest',
function(aSignal) {

    /**
     * @method queueIORequest
     * @summary Queues the incoming signal for later processing. This method is
     *     typically invoked automatically by services that are currently
     *     blocked servicing a prior request.
     * @param {TP.sig.UserIORequest} aSignal
     * @returns {TP.core.UserIOService} The receiver.
     */

    this.get('requestQueue').add(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('refreshFromRequest',
function(aRequest) {

    /**
     * @method refreshFromRequest
     * @summary Performs any updates necessary to ensure that the display is
     *     current with the current state of the request. The default
     *     implementation does nothing.
     * @param {TP.sig.UserIORequest} aRequest
     * @returns {TP.core.UserIOService} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
